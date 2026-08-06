import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalRequest,
  createGooglePlayVerificationHandler,
  sha256Base64Url,
} from "../supabase/functions/google-play-verify/google_play.mjs";

const NOW = 1_800_000_000_000;
const PACKAGE_NAME = "com.franceisl.glowletternext";
const SUBSCRIPTION_PRODUCT_ID = "glowletter_premium_monthly";
const LEGACY_PRODUCT_ID = "full_access";
const BASE_PLAN_ID = "monthly";
const CERTIFICATE_DIGEST = "A".repeat(43);
const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const ACCOUNT_BINDING = await sha256Base64Url(
  `glowletter/play-account/v1\n${USER_ID}`,
);
const PURCHASE_TOKEN = "purchase.token.abcdefghijklmnopqrstuvwxyz012345";
const INTEGRITY_TOKEN = "integrity.token.abcdefghijklmnopqrstuvwxyz012345";
const privateKey = await testPrivateKeyPem();
const SUBSCRIPTION_REQUEST_HASH = await sha256Base64Url(canonicalRequest(
  PACKAGE_NAME,
  SUBSCRIPTION_PRODUCT_ID,
  "subs",
  PURCHASE_TOKEN,
));

function environment(overrides = {}) {
  return {
    GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify({
      type: "service_account",
      client_email: "glowletter-test@example.iam.gserviceaccount.com",
      private_key: privateKey,
    }),
    GLOWLETTER_PLAY_PACKAGE_NAME: PACKAGE_NAME,
    GLOWLETTER_PLAY_SUBSCRIPTION_PRODUCT_ID: SUBSCRIPTION_PRODUCT_ID,
    GLOWLETTER_PLAY_SUBSCRIPTION_BASE_PLAN_ID: BASE_PLAN_ID,
    GLOWLETTER_PLAY_LEGACY_PRODUCT_ID: LEGACY_PRODUCT_ID,
    GLOWLETTER_PLAY_CERTIFICATE_SHA256_DIGESTS: CERTIFICATE_DIGEST,
    GLOWLETTER_PLAY_MIN_VERSION_CODE: "15",
    GLOWLETTER_ENTITLEMENT_HASH_SECRET:
      "unit-test-only-secret-with-at-least-32-bytes",
    GLOWLETTER_ENTITLEMENT_HASH_KEY_ID: "v1",
    ...overrides,
  };
}

function integrityPayload(requestHash, overrides = {}) {
  return {
    tokenPayloadExternal: {
      requestDetails: {
        requestPackageName: PACKAGE_NAME,
        requestHash,
        timestampMillis: String(NOW - 2_000),
      },
      appIntegrity: {
        appRecognitionVerdict: "PLAY_RECOGNIZED",
        packageName: PACKAGE_NAME,
        certificateSha256Digest: [CERTIFICATE_DIGEST],
        versionCode: "15",
      },
      accountDetails: { appLicensingVerdict: "LICENSED" },
      deviceIntegrity: {
        deviceRecognitionVerdict: ["MEETS_DEVICE_INTEGRITY"],
      },
      ...overrides,
    },
  };
}

function subscriptionPurchase(overrides = {}) {
  return {
    startTime: new Date(NOW - 86_400_000).toISOString(),
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
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

async function subscriptionRequest(overrides = {}) {
  return new Request(
    "https://project.supabase.co/functions/v1/google-play-verify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NurPismo-Client": "android",
        Authorization: `Bearer ${"a".repeat(64)}`,
      },
      body: JSON.stringify({
        packageName: PACKAGE_NAME,
        productId: SUBSCRIPTION_PRODUCT_ID,
        productType: "subs",
        purchaseToken: PURCHASE_TOKEN,
        requestHashVersion: "v2",
        requestHash: SUBSCRIPTION_REQUEST_HASH,
        integrityToken: INTEGRITY_TOKEN,
        ...overrides,
      }),
    },
  );
}

async function legacyRequest() {
  const requestHash = await sha256Base64Url(canonicalRequest(
    PACKAGE_NAME,
    LEGACY_PRODUCT_ID,
    "inapp",
    PURCHASE_TOKEN,
  ));
  return new Request(
    "https://project.supabase.co/functions/v1/google-play-verify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NurPismo-Client": "android",
        Authorization: `Bearer ${"a".repeat(64)}`,
      },
      body: JSON.stringify({
        packageName: PACKAGE_NAME,
        productId: LEGACY_PRODUCT_ID,
        productType: "inapp",
        purchaseToken: PURCHASE_TOKEN,
        requestHashVersion: "v2",
        requestHash,
        integrityToken: INTEGRITY_TOKEN,
      }),
    },
  );
}

function fixture({
  purchase = subscriptionPurchase(),
  integrity,
  acknowledgeStatus = 204,
  refreshedPurchase,
  journalFailure = false,
  rateLimited = false,
  rateLimitFailure = false,
  authenticationFailure = false,
  env = environment(),
} = {}) {
  const calls = [];
  const records = [];
  const quotaCalls = [];
  const fetchImpl = async (input, init = {}) => {
    const url = String(input);
    calls.push({ url, method: init.method || "GET", body: init.body || "" });
    if (url === "https://oauth2.googleapis.com/token") {
      return jsonResponse({
        access_token: "google-access-token",
        expires_in: 3600,
      });
    }
    if (url.includes(":decodeIntegrityToken")) {
      const body = JSON.parse(init.body);
      assert.equal(body.integrity_token, INTEGRITY_TOKEN);
      return jsonResponse(
        integrity || integrityPayload(SUBSCRIPTION_REQUEST_HASH),
      );
    }
    if (url.includes("/purchases/subscriptionsv2/tokens/")) {
      const value = refreshedPurchase && calls.filter((call) => (
            call.url.includes("/purchases/subscriptionsv2/tokens/")
          )
          ).length > 1
        ? refreshedPurchase
        : purchase;
      return jsonResponse(value);
    }
    if (
      url.includes("/purchases/subscriptions/") && url.endsWith(":acknowledge")
    ) {
      return emptyResponse(acknowledgeStatus);
    }
    if (url.includes("/purchases/products/") && url.endsWith(":acknowledge")) {
      return emptyResponse(acknowledgeStatus);
    }
    if (url.includes("/purchases/products/")) {
      return jsonResponse(purchase);
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  const journal = {
    isConfigured: () => true,
    async consumeRateLimit(value) {
      if (rateLimitFailure) throw new Error("database unavailable");
      quotaCalls.push(structuredClone(value));
      return !rateLimited;
    },
    async record(record) {
      if (journalFailure) throw new Error("database unavailable");
      records.push(structuredClone(record));
    },
  };
  const identity = {
    isConfigured: () => true,
    async authenticate(request) {
      assert.match(request.headers.get("authorization") || "", /^Bearer /u);
      if (authenticationFailure) throw new Error("invalid token");
      return { userId: USER_ID };
    },
  };
  return {
    calls,
    records,
    quotaCalls,
    handler: createGooglePlayVerificationHandler({
      environment: env,
      fetchImpl,
      now: () => NOW,
      journal,
      identity,
    }),
  };
}

test("an active subscription is verified, journaled and acknowledged", async () => {
  const setup = fixture();
  const response = await setup.handler(await subscriptionRequest());
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(
    {
      valid: body.valid,
      acknowledged: body.acknowledged,
      integrityVerified: body.integrityVerified,
      productId: body.productId,
      productType: body.productType,
    },
    {
      valid: true,
      acknowledged: true,
      integrityVerified: true,
      productId: SUBSCRIPTION_PRODUCT_ID,
      productType: "subs",
    },
  );
  assert.deepEqual(setup.records.map((record) => record.state), [
    "verified_pending_ack",
    "active",
  ]);
  assert.equal(setup.records.at(-1).acknowledgementStateCode, 1);
  assert.equal(setup.records.at(-1).appVersionCode, 15);
  assert.equal(
    setup.calls.filter((call) => call.url.endsWith(":acknowledge")).length,
    1,
  );
  assert.doesNotMatch(
    JSON.stringify(setup.records),
    new RegExp(PURCHASE_TOKEN),
  );
  assert.doesNotMatch(
    JSON.stringify(setup.records),
    new RegExp(INTEGRITY_TOKEN),
  );
  assert.doesNotMatch(JSON.stringify(body), new RegExp(PURCHASE_TOKEN));
});

test("a request-hash mismatch is rejected before any Google call", async () => {
  const setup = fixture();
  const response = await setup.handler(
    await subscriptionRequest({
      requestHash: "B".repeat(43),
    }),
  );
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "request_hash_mismatch" });
  assert.equal(setup.calls.length, 0);
  assert.equal(setup.records.length, 0);
});

test("the Play signing certificate and licence verdict are fail-closed", async () => {
  const request = await subscriptionRequest();
  const requestHash = JSON.parse(await request.clone().text()).requestHash;
  const setup = fixture({
    integrity: integrityPayload(requestHash, {
      appIntegrity: {
        appRecognitionVerdict: "PLAY_RECOGNIZED",
        packageName: PACKAGE_NAME,
        certificateSha256Digest: ["Z".repeat(43)],
        versionCode: "15",
      },
      accountDetails: { appLicensingVerdict: "UNLICENSED" },
    }),
  });
  const response = await setup.handler(request);
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "integrity_rejected" });
  assert.equal(
    setup.calls.some((call) =>
      call.url.includes("androidpublisher.googleapis.com")
    ),
    false,
  );
  assert.equal(setup.records.length, 0);
});

test("an expired subscription is journaled but never granted", async () => {
  const setup = fixture({
    purchase: subscriptionPurchase({
      subscriptionState: "SUBSCRIPTION_STATE_CANCELED",
      acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
      lineItems: [{
        productId: SUBSCRIPTION_PRODUCT_ID,
        expiryTime: new Date(NOW - 1_000).toISOString(),
        autoRenewingPlan: { autoRenewEnabled: false },
        offerDetails: { basePlanId: BASE_PLAN_ID },
      }],
    }),
  });
  const response = await setup.handler(await subscriptionRequest());
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "subscription_expired" });
  assert.deepEqual(setup.records.map((record) => record.state), ["cancelled"]);
  assert.equal(
    setup.calls.some((call) => call.url.endsWith(":acknowledge")),
    false,
  );
});

test("a different base plan cannot unlock GlowLetter", async () => {
  const setup = fixture({
    purchase: subscriptionPurchase({
      lineItems: [{
        productId: SUBSCRIPTION_PRODUCT_ID,
        expiryTime: new Date(NOW + 30 * 86_400_000).toISOString(),
        autoRenewingPlan: { autoRenewEnabled: true },
        offerDetails: { basePlanId: "annual" },
      }],
    }),
  });
  const response = await setup.handler(await subscriptionRequest());
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    error: "subscription_base_plan_mismatch",
  });
  assert.equal(setup.records.length, 0);
});

test("a journal outage prevents acknowledgement and entitlement", async () => {
  const setup = fixture({ journalFailure: true });
  const response = await setup.handler(await subscriptionRequest());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "entitlement_store_unavailable",
  });
  assert.equal(
    setup.calls.some((call) => call.url.endsWith(":acknowledge")),
    false,
  );
});

test("an acknowledgement race is resolved from a fresh Google verdict", async () => {
  const setup = fixture({
    acknowledgeStatus: 409,
    refreshedPurchase: subscriptionPurchase({
      acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    }),
  });
  const response = await setup.handler(await subscriptionRequest());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).valid, true);
  assert.deepEqual(setup.records.map((record) => record.state), [
    "verified_pending_ack",
    "active",
  ]);
  assert.equal(
    setup.calls.filter((call) => (
      call.url.includes("/purchases/subscriptionsv2/tokens/")
    )).length,
    2,
  );
});

test("the current Android legacy full_access restore path remains supported", async () => {
  const legacyPurchase = {
    productId: LEGACY_PRODUCT_ID,
    purchaseState: 0,
    consumptionState: 0,
    acknowledgementState: 1,
    purchaseTimeMillis: String(NOW - 10_000),
    orderId: "GPA.9876-5432-1098-76543",
  };
  const request = await legacyRequest();
  const requestHash = JSON.parse(await request.clone().text()).requestHash;
  const setup = fixture({
    purchase: legacyPurchase,
    integrity: integrityPayload(requestHash),
  });
  const response = await setup.handler(request);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.valid, true);
  assert.equal(body.productId, LEGACY_PRODUCT_ID);
  assert.equal(body.productType, "inapp");
  assert.deepEqual(setup.records.map((record) => record.state), [
    "active",
    "active",
  ]);
});

test("null Google product state fields cannot be coerced into a purchase", async () => {
  const request = await legacyRequest();
  const requestHash = JSON.parse(await request.clone().text()).requestHash;
  const setup = fixture({
    purchase: {
      productId: LEGACY_PRODUCT_ID,
      purchaseState: null,
      consumptionState: null,
      acknowledgementState: null,
    },
    integrity: integrityPayload(requestHash),
  });
  const response = await setup.handler(request);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    error: "google_play_response_invalid",
  });
  assert.equal(setup.records.length, 0);
});

test("missing certificate configuration fails before external calls", async () => {
  const setup = fixture({
    env: environment({ GLOWLETTER_PLAY_CERTIFICATE_SHA256_DIGESTS: "" }),
  });
  const response = await setup.handler(await subscriptionRequest());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "billing_backend_not_configured",
  });
  assert.equal(setup.calls.length, 0);
});

test("rate limiting fails closed before any Google call", async () => {
  const setup = fixture({ rateLimited: true });
  const response = await setup.handler(await subscriptionRequest());
  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), { error: "rate_limited" });
  assert.equal(setup.quotaCalls.length, 1);
  assert.equal(setup.calls.length, 0);
});

test("a valid Supabase identity and matching Play account binding are required", async () => {
  const unauthenticated = fixture({ authenticationFailure: true });
  const unauthorizedResponse = await unauthenticated.handler(
    await subscriptionRequest(),
  );
  assert.equal(unauthorizedResponse.status, 401);
  assert.equal(unauthenticated.calls.length, 0);

  const mismatched = fixture({
    purchase: subscriptionPurchase({
      externalAccountIdentifiers: {
        obfuscatedExternalAccountId: "B".repeat(43),
      },
    }),
  });
  const mismatchResponse = await mismatched.handler(
    await subscriptionRequest(),
  );
  assert.equal(mismatchResponse.status, 403);
  assert.deepEqual(await mismatchResponse.json(), {
    error: "purchase_account_mismatch",
  });
  assert.equal(mismatched.records.length, 0);
});

test("opaque Google purchase tokens are accepted without a guessed charset", async () => {
  const purchaseToken = "opaque/token+with=characters?and%future";
  const requestHash = await sha256Base64Url(canonicalRequest(
    PACKAGE_NAME,
    SUBSCRIPTION_PRODUCT_ID,
    "subs",
    purchaseToken,
  ));
  const setup = fixture({ integrity: integrityPayload(requestHash) });
  const response = await setup.handler(
    await subscriptionRequest({
      purchaseToken,
      requestHash,
    }),
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).valid, true);
});

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function emptyResponse(status) {
  return new Response(null, { status });
}

async function testPrivateKeyPem() {
  const pair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const bytes = new Uint8Array(
    await crypto.subtle.exportKey(
      "pkcs8",
      pair.privateKey,
    ),
  );
  const encoded = Buffer.from(bytes).toString("base64").match(/.{1,64}/gu)
    .join("\n");
  return `-----BEGIN PRIVATE KEY-----\n${encoded}\n-----END PRIVATE KEY-----\n`;
}
