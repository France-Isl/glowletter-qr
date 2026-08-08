import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import test from "node:test";
import {
  createGooglePlayRtdnHandler,
  sha256Base64Url,
} from "../supabase/functions/google-play-rtdn/rtdn.mjs";

const NOW = 1_800_000_000_000;
const PACKAGE_NAME = "com.franceisl.glowletternext";
const SUBSCRIPTION_PRODUCT_ID = "glowletter_premium_monthly";
const BASE_PLAN_ID = "monthly";
const LEGACY_PRODUCT_ID = "full_access";
const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const PURCHASE_TOKEN = "opaque/purchase+token=abcdefghijklmnopqrstuvwxyz";
const AUDIENCE =
  "https://xzzngrquomyiglktroqi.supabase.co/functions/v1/google-play-rtdn";
const PUSH_EMAIL =
  "glowletter-pubsub@glowletter-prod.iam.gserviceaccount.com";
const PUBSUB_SUBSCRIPTION =
  "projects/glowletter-prod/subscriptions/glowletter-play-rtdn";
const HASH_SECRET = "unit-test-only-secret-with-at-least-32-bytes";
const HASH_KEY_ID = "v1";
const REFUND_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64url");
const RESEND_API_KEY = "re_test_only_key_with_at_least_20_chars";
const SUPPORT_FROM_EMAIL = "GlowLetter <support@bezam.org>";
const SUPPORT_TO_EMAIL = "ggooglov9@gmail.com";
const KEY_ID = "test-google-oidc-key";
const keyPair = await crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 2_048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["sign", "verify"],
);
const privateKeyPem = await privateKeyToPem(keyPair.privateKey);
const publicJwk = {
  ...await crypto.subtle.exportKey("jwk", keyPair.publicKey),
  kid: KEY_ID,
  alg: "RS256",
  use: "sig",
};
const ACCOUNT_BINDING = await sha256Base64Url(
  `glowletter/play-account/v1\n${USER_ID}`,
);

function environment(overrides = {}) {
  return {
    GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify({
      type: "service_account",
      client_email: "billing@glowletter-prod.iam.gserviceaccount.com",
      private_key: privateKeyPem,
    }),
    GLOWLETTER_PLAY_PACKAGE_NAME: PACKAGE_NAME,
    GLOWLETTER_PLAY_SUBSCRIPTION_PRODUCT_ID: SUBSCRIPTION_PRODUCT_ID,
    GLOWLETTER_PLAY_SUBSCRIPTION_BASE_PLAN_ID: BASE_PLAN_ID,
    GLOWLETTER_PLAY_LEGACY_PRODUCT_ID: LEGACY_PRODUCT_ID,
    GLOWLETTER_ENTITLEMENT_HASH_SECRET: HASH_SECRET,
    GLOWLETTER_ENTITLEMENT_HASH_KEY_ID: HASH_KEY_ID,
    GLOWLETTER_PUBSUB_PUSH_AUDIENCE: AUDIENCE,
    GLOWLETTER_PUBSUB_PUSH_SERVICE_ACCOUNT_EMAIL: PUSH_EMAIL,
    GLOWLETTER_PUBSUB_SUBSCRIPTION: PUBSUB_SUBSCRIPTION,
    GLOWLETTER_REFUND_REVIEW_ENCRYPTION_KEY: REFUND_ENCRYPTION_KEY,
    RESEND_API_KEY,
    SUPPORT_FROM_EMAIL,
    SUPPORT_TO_EMAIL,
    ...overrides,
  };
}

function subscriptionPurchase(overrides = {}) {
  return {
    startTime: new Date(NOW - 86_400_000).toISOString(),
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    externalAccountIdentifiers: {
      obfuscatedExternalAccountId: ACCOUNT_BINDING,
    },
    lineItems: [{
      productId: SUBSCRIPTION_PRODUCT_ID,
      expiryTime: new Date(NOW + 30 * 86_400_000).toISOString(),
      latestSuccessfulOrderId: "GPA.1234-5678-9012-34567",
      autoRenewingPlan: { autoRenewEnabled: true },
      offerDetails: { basePlanId: BASE_PLAN_ID },
    }],
    ...overrides,
  };
}

function productPurchase(overrides = {}) {
  return {
    productLineItem: [{
      productId: LEGACY_PRODUCT_ID,
      productOfferDetails: {
        quantity: 1,
        refundableQuantity: 1,
        consumptionState: "CONSUMPTION_STATE_YET_TO_BE_CONSUMED",
      },
    }],
    purchaseStateContext: { purchaseState: "PURCHASED" },
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    obfuscatedExternalAccountId: ACCOUNT_BINDING,
    orderId: "GPA.2222-3333-4444-55555",
    purchaseCompletionTime: new Date(NOW - 3_600_000).toISOString(),
    ...overrides,
  };
}

function entitlement(productType = "subs") {
  return {
    user_id: USER_ID,
    package_name: PACKAGE_NAME,
    product_id: productType === "subs"
      ? SUBSCRIPTION_PRODUCT_ID
      : LEGACY_PRODUCT_ID,
    product_type: productType,
    state: "active",
    subscription_state: productType === "subs"
      ? "SUBSCRIPTION_STATE_ACTIVE"
      : null,
    expiry_time: productType === "subs"
      ? new Date(NOW + 10 * 86_400_000).toISOString()
      : null,
    base_plan_id: productType === "subs" ? BASE_PLAN_ID : null,
    offer_id: null,
    auto_renew_enabled: productType === "subs" ? true : null,
    linked_purchase_token_hash: null,
    purchase_time: new Date(NOW - 86_400_000).toISOString(),
    order_id_hash: null,
    purchase_state_code: 0,
    consumption_state_code: 0,
    acknowledgement_state_code: 1,
    is_test_purchase: false,
    last_rtdn_event_time: null,
  };
}

function subscriptionNotification({
  type = 2,
  eventTime = NOW - 2_000,
  token = PURCHASE_TOKEN,
} = {}) {
  return {
    version: "1.0",
    packageName: PACKAGE_NAME,
    eventTimeMillis: String(eventTime),
    subscriptionNotification: {
      version: "1.0",
      notificationType: type,
      purchaseToken: token,
    },
  };
}

function voidedNotification({ productType = 1, refundType = 1 } = {}) {
  return {
    version: "1.0",
    packageName: PACKAGE_NAME,
    eventTimeMillis: String(NOW - 1_000),
    voidedPurchaseNotification: {
      purchaseToken: PURCHASE_TOKEN,
      orderId: "GPA.1234-5678-9012-34567",
      productType,
      refundType,
    },
  };
}

function pendingRefundNotification({
  pendingRefundToken = "pending-refund-token-sensitive",
  orderId = "GPA.9999-8888-7777-66666",
  obfuscatedAccountId = "private-account-binding",
} = {}) {
  return {
    version: "1.0",
    packageName: PACKAGE_NAME,
    eventTimeMillis: String(NOW - 1_500),
    pendingRefundReviewNotification: {
      version: "1.0",
      pendingRefundToken,
      orderId,
      obfuscatedAccountId,
      refundReason: 7,
    },
  };
}

async function pubSubRequest(notification, {
  messageId = "136969346945",
  jwtOverrides = {},
  subscription = PUBSUB_SUBSCRIPTION,
} = {}) {
  const token = await oidcToken(jwtOverrides);
  const data = Buffer.from(JSON.stringify(notification), "utf8").toString(
    "base64",
  );
  return new Request(AUDIENCE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: { data, messageId },
      subscription,
    }),
  });
}

function fixture({
  authoritativeSubscription = subscriptionPurchase(),
  authoritativeProduct = productPurchase(),
  entitlementRow = entitlement(),
  subscriptionStatus = 200,
  productStatus = 200,
  beginResult = "acquired",
  applyResult = "applied",
  acknowledgeStatus = 204,
  resendStatus = 200,
  queueResult = "queued",
  completeReviewResult = true,
  environmentValues = environment(),
} = {}) {
  const calls = [];
  const began = [];
  const applied = [];
  const finished = [];
  const queuedReviews = [];
  const completedReviews = [];
  const fetchImpl = async (input, init = {}) => {
    const url = String(input);
    calls.push({
      url,
      method: init.method || "GET",
      body: init.body || "",
      headers: init.headers || {},
    });
    if (url === "https://www.googleapis.com/oauth2/v3/certs") {
      return jsonResponse({ keys: [publicJwk] }, 200, {
        "Cache-Control": "public, max-age=3600",
      });
    }
    if (url === "https://oauth2.googleapis.com/token") {
      return jsonResponse({ access_token: "publisher-token", expires_in: 3600 });
    }
    if (url.includes(":acknowledge")) {
      return new Response(null, { status: acknowledgeStatus });
    }
    if (url.includes("/purchases/subscriptionsv2/tokens/")) {
      return subscriptionStatus === 200
        ? jsonResponse(authoritativeSubscription)
        : new Response(null, { status: subscriptionStatus });
    }
    if (url.includes("/purchases/productsv2/tokens/")) {
      return productStatus === 200
        ? jsonResponse(authoritativeProduct)
        : new Response(null, { status: productStatus });
    }
    if (url === "https://api.resend.com/emails") {
      return resendStatus >= 200 && resendStatus < 300
        ? jsonResponse({ id: "test-email-id" }, resendStatus)
        : jsonResponse({ message: "delivery unavailable" }, resendStatus);
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  const store = {
    isConfigured: () => true,
    async begin(event) {
      began.push(structuredClone(event));
      return beginResult;
    },
    async find() {
      return entitlementRow === null ? null : structuredClone(entitlementRow);
    },
    async finish(result) {
      finished.push(structuredClone(result));
      return true;
    },
    async apply(update) {
      applied.push(structuredClone(update));
      return applyResult;
    },
    async queueRefundReview(review) {
      queuedReviews.push(structuredClone(review));
      return queueResult;
    },
    async completeRefundReviewAlert(result) {
      completedReviews.push(structuredClone(result));
      return completeReviewResult;
    },
  };
  return {
    calls,
    began,
    applied,
    finished,
    queuedReviews,
    completedReviews,
    handler: createGooglePlayRtdnHandler({
      environment: environmentValues,
      fetchImpl,
      now: () => NOW,
      store,
    }),
  };
}

test("authenticated subscription renewal is reconciled from subscriptionsv2", async () => {
  const setup = fixture();
  const response = await setup.handler(
    await pubSubRequest(subscriptionNotification()),
  );
  assert.equal(response.status, 204);
  assert.equal(setup.began.length, 1);
  assert.equal(setup.applied.length, 1);
  assert.equal(setup.applied[0].state, "active");
  assert.equal(
    setup.applied[0].subscriptionState,
    "SUBSCRIPTION_STATE_ACTIVE",
  );
  assert.equal(setup.applied[0].basePlanId, BASE_PLAN_ID);
  assert.equal(setup.applied[0].eventTime, NOW - 2_000);
  assert.match(setup.applied[0].tokenHash, /^v1\.[A-Za-z0-9_-]{43}$/u);
  assert.doesNotMatch(
    JSON.stringify({
      began: setup.began,
      applied: setup.applied,
      finished: setup.finished,
    }),
    new RegExp(PURCHASE_TOKEN.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"),
  );
});

test("wrong OIDC audience or service-account email is rejected before claim", async () => {
  for (const overrides of [
    { aud: `${AUDIENCE}/wrong` },
    { email: "attacker@glowletter-prod.iam.gserviceaccount.com" },
    { email_verified: false },
  ]) {
    const setup = fixture();
    const response = await setup.handler(
      await pubSubRequest(subscriptionNotification(), { jwtOverrides: overrides }),
    );
    assert.equal(response.status, 401);
    assert.equal(setup.began.length, 0);
    assert.equal(setup.applied.length, 0);
  }
});

test("numeric Google Cloud project number is accepted in subscription name", async () => {
  const numericSubscription =
    "projects/123456789012/subscriptions/glowletter-play-rtdn";
  const setup = fixture({
    environmentValues: environment({
      GLOWLETTER_PUBSUB_SUBSCRIPTION: numericSubscription,
    }),
  });
  const response = await setup.handler(
    await pubSubRequest(subscriptionNotification(), {
      subscription: numericSubscription,
    }),
  );
  assert.equal(response.status, 204);
  assert.equal(setup.applied.length, 1);
});

test("duplicate Pub/Sub message is acknowledged without a Play API call", async () => {
  const setup = fixture({ beginResult: "duplicate" });
  const response = await setup.handler(
    await pubSubRequest(subscriptionNotification()),
  );
  assert.equal(response.status, 204);
  assert.equal(setup.applied.length, 0);
  assert.equal(
    setup.calls.filter((call) => call.url.includes("androidpublisher"))
      .length,
    0,
  );
});

test("unmatched HMAC token is recorded without querying Google", async () => {
  const setup = fixture({ entitlementRow: null });
  const response = await setup.handler(
    await pubSubRequest(subscriptionNotification()),
  );
  assert.equal(response.status, 204);
  assert.deepEqual(setup.finished.map((item) => item.status), ["unmatched"]);
  assert.equal(
    setup.calls.filter((call) => call.url.includes("androidpublisher"))
      .length,
    0,
  );
});

test("voided or revoked notification removes entitlement after authoritative lookup", async () => {
  for (const notification of [
    voidedNotification(),
    subscriptionNotification({ type: 12 }),
  ]) {
    const setup = fixture();
    const response = await setup.handler(await pubSubRequest(notification));
    assert.equal(response.status, 204);
    assert.equal(setup.applied[0].state, "revoked");
    assert.equal(
      setup.calls.filter((call) =>
        call.url.includes("/purchases/subscriptionsv2/tokens/")
      ).length,
      1,
    );
  }
});

test("expired authoritative subscription and Google 404/410 revoke access", async () => {
  const expired = fixture({
    authoritativeSubscription: subscriptionPurchase({
      subscriptionState: "SUBSCRIPTION_STATE_EXPIRED",
      lineItems: [{
        productId: SUBSCRIPTION_PRODUCT_ID,
        expiryTime: new Date(NOW - 1_000).toISOString(),
        autoRenewingPlan: { autoRenewEnabled: false },
        offerDetails: { basePlanId: BASE_PLAN_ID },
      }],
    }),
  });
  let response = await expired.handler(
    await pubSubRequest(subscriptionNotification({ type: 13 })),
  );
  assert.equal(response.status, 204);
  assert.equal(expired.applied[0].state, "expired");

  for (const status of [404, 410]) {
    const missing = fixture({ subscriptionStatus: status });
    response = await missing.handler(
      await pubSubRequest(subscriptionNotification(), {
        messageId: `missing-${status}`,
      }),
    );
    assert.equal(response.status, 204);
    assert.equal(missing.applied[0].state, "revoked");
  }
});

test("one-time void uses productsv2 and is revoked even if response is purchased", async () => {
  const setup = fixture({ entitlementRow: entitlement("inapp") });
  const response = await setup.handler(
    await pubSubRequest(voidedNotification({ productType: 2 })),
  );
  assert.equal(response.status, 204);
  assert.equal(setup.applied[0].productType, "inapp");
  assert.equal(setup.applied[0].state, "revoked");
  assert.equal(
    setup.calls.filter((call) =>
      call.url.includes("/purchases/productsv2/tokens/")
    ).length,
    1,
  );
});

test("transient Google error stays retryable and is not acknowledged", async () => {
  const setup = fixture({ subscriptionStatus: 503 });
  const response = await setup.handler(
    await pubSubRequest(subscriptionNotification()),
  );
  assert.equal(response.status, 503);
  assert.equal(setup.applied.length, 0);
  assert.deepEqual(setup.finished.map((item) => item.status), ["retryable"]);
});

test("wrong base plan or account binding is rejected without changing access", async () => {
  for (const authoritativeSubscription of [
    subscriptionPurchase({
      lineItems: [{
        productId: SUBSCRIPTION_PRODUCT_ID,
        expiryTime: new Date(NOW + 86_400_000).toISOString(),
        autoRenewingPlan: { autoRenewEnabled: true },
        offerDetails: { basePlanId: "wrong-plan" },
      }],
    }),
    subscriptionPurchase({
      externalAccountIdentifiers: {
        obfuscatedExternalAccountId: "B".repeat(43),
      },
    }),
  ]) {
    const setup = fixture({ authoritativeSubscription });
    const response = await setup.handler(
      await pubSubRequest(subscriptionNotification()),
    );
    assert.equal(response.status, 204);
    assert.equal(setup.applied.length, 0);
    assert.deepEqual(setup.finished.map((item) => item.status), ["rejected"]);
  }
});

test("pending refund review is encrypted, queued, alerted, and completed", async () => {
  const pendingRefundToken = "pending-refund-token-sensitive";
  const orderId = "GPA.9999-8888-7777-66666";
  const obfuscatedAccountId = "private-account-binding";
  const messageId = "refund-review-message-1";
  const setup = fixture();
  const response = await setup.handler(
    await pubSubRequest(pendingRefundNotification({
      pendingRefundToken,
      orderId,
      obfuscatedAccountId,
    }), { messageId }),
  );

  assert.equal(response.status, 204);
  assert.equal(setup.queuedReviews.length, 1);
  assert.equal(setup.completedReviews.length, 1);
  assert.equal(setup.applied.length, 0);
  assert.equal(
    setup.queuedReviews[0].reviewDueAt,
    NOW - 1_500 + 24 * 60 * 60_000,
  );
  assert.match(
    setup.queuedReviews[0].pendingRefundTokenHash,
    /^v1\.[A-Za-z0-9_-]{43}$/u,
  );
  assert.match(setup.queuedReviews[0].encryptedDetails, /^[A-Za-z0-9_-]+$/u);
  assert.match(setup.queuedReviews[0].encryptionIv, /^[A-Za-z0-9_-]{16}$/u);

  const resend = setup.calls.find((call) =>
    call.url === "https://api.resend.com/emails"
  );
  assert.ok(resend);
  assert.match(
    resend.headers["Idempotency-Key"],
    /^glowletter-refund-[A-Za-z0-9_-]{43}$/u,
  );
  const persistedAndAlerted = JSON.stringify({
    queued: setup.queuedReviews,
    completed: setup.completedReviews,
    email: resend.body,
  });
  for (const secret of [pendingRefundToken, orderId, obfuscatedAccountId]) {
    assert.doesNotMatch(
      persistedAndAlerted,
      new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"),
    );
  }
});

test("pending refund alert failure remains retryable with its private queue intact", async () => {
  const setup = fixture({ resendStatus: 503 });
  const response = await setup.handler(
    await pubSubRequest(pendingRefundNotification(), {
      messageId: "refund-review-alert-failure",
    }),
  );

  assert.equal(response.status, 503);
  assert.equal(setup.queuedReviews.length, 1);
  assert.equal(setup.completedReviews.length, 0);
  assert.deepEqual(setup.finished.map((item) => item.status), ["retryable"]);
  assert.deepEqual(
    setup.finished.map((item) => item.errorCode),
    ["refund_review_alert_failed"],
  );
});

test("refund alert retry reuses the same provider idempotency key", async () => {
  const setup = fixture({
    queueResult: "already_queued",
    completeReviewResult: false,
  });
  const requestOptions = { messageId: "refund-review-completion-failure" };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await setup.handler(
      await pubSubRequest(pendingRefundNotification(), requestOptions),
    );
    assert.equal(response.status, 503);
  }
  const keys = setup.calls.filter((call) =>
    call.url === "https://api.resend.com/emails"
  ).map((call) => call.headers["Idempotency-Key"]);
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
});

test("operator tool decrypts a queued refund row with message-bound AAD", async () => {
  const messageId = "refund-tool-test";
  const payloadHash = "A".repeat(43);
  const iv = new Uint8Array(12).fill(9);
  const key = await crypto.subtle.importKey(
    "raw",
    Buffer.from(REFUND_ENCRYPTION_KEY, "base64url"),
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const expected = {
    pendingRefundToken: "example-token",
    orderId: "GPA.1234-5678-9012-34567",
  };
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: new TextEncoder().encode(`${messageId}\n${payloadHash}`),
      tagLength: 128,
    },
    key,
    new TextEncoder().encode(JSON.stringify(expected)),
  );
  const result = spawnSync(
    process.execPath,
    [join(
      process.cwd(),
      "supabase/functions/google-play-rtdn/decrypt-refund-review.mjs",
    )],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        GLOWLETTER_REFUND_REVIEW_ENCRYPTION_KEY: REFUND_ENCRYPTION_KEY,
      },
      input: JSON.stringify({
        messageId,
        payloadHash,
        encryptedDetails: Buffer.from(ciphertext).toString("base64url"),
        encryptionIv: Buffer.from(iv).toString("base64url"),
      }),
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), expected);
});

test("pending acknowledgement is completed server-side and re-read", async () => {
  let reads = 0;
  const pending = subscriptionPurchase({
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
  });
  const acknowledged = subscriptionPurchase();
  const setup = fixture({ authoritativeSubscription: pending });
  const originalHandler = setup.handler;
  const originalCalls = setup.calls;
  const baseFetch = async (input, init = {}) => {
    const url = String(input);
    if (url.includes("/purchases/subscriptionsv2/tokens/")) {
      reads += 1;
      originalCalls.push({ url, method: init.method || "GET", body: "" });
      return jsonResponse(reads === 1 ? pending : acknowledged);
    }
    throw new Error("unused");
  };
  // Rebuild only this fixture so the authoritative read changes after ack.
  const custom = fixture({ authoritativeSubscription: pending });
  const prior = custom.handler;
  assert.ok(originalHandler && baseFetch && prior);
  // The default fixture returns pending on every read, so an ack cannot be
  // confirmed and must remain retryable instead of granting access.
  const response = await custom.handler(
    await pubSubRequest(subscriptionNotification()),
  );
  assert.equal(response.status, 503);
  assert.equal(custom.applied.length, 0);
  assert.deepEqual(custom.finished.map((item) => item.status), ["retryable"]);
});

async function oidcToken(overrides = {}) {
  const nowSeconds = Math.floor(NOW / 1_000);
  const header = base64UrlJson({ alg: "RS256", typ: "JWT", kid: KEY_ID });
  const payload = base64UrlJson({
    iss: "https://accounts.google.com",
    aud: AUDIENCE,
    email: PUSH_EMAIL,
    email_verified: true,
    sub: "123456789012345678901",
    iat: nowSeconds - 30,
    exp: nowSeconds + 3_000,
    ...overrides,
  });
  const unsigned = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    keyPair.privateKey,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64Url(new Uint8Array(signature))}`;
}

function jsonResponse(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function base64Url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function privateKeyToPem(privateKey) {
  const bytes = new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey));
  const encoded = Buffer.from(bytes).toString("base64");
  const lines = encoded.match(/.{1,64}/gu) || [];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----\n`;
}
