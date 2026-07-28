import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import worker from "../src/index.js";

const PACKAGE_NAME = "com.franceisl.glowletternext";
const LEGACY_PRODUCT_ID = "full_access";
const SUBSCRIPTION_PRODUCT_ID = "glowletter_premium_monthly";
const SUBSCRIPTION_BASE_PLAN_ID = "monthly";
const ACKNOWLEDGED = "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";
const ACKNOWLEDGEMENT_PENDING = "ACKNOWLEDGEMENT_STATE_PENDING";
let requestSequence = 0;

class FakeD1 {
  constructor(schemaVersion = 2) {
    this.schemaVersion = schemaVersion;
    this.writes = [];
  }

  prepare(sql) {
    if (sql.includes("SELECT schema_version")) {
      return { first: async () => ({ schema_version: this.schemaVersion }) };
    }
    return {
      bind: (...values) => ({
        run: async () => {
          this.writes.push(values);
          return { success: true, meta: { changes: 1 } };
        }
      })
    };
  }
}

const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" }
});

const baseEnv = {
  NURPISMO_PACKAGE_NAME: PACKAGE_NAME,
  NURPISMO_PRODUCT_ID: LEGACY_PRODUCT_ID,
  NURPISMO_SUBSCRIPTION_PRODUCT_ID: SUBSCRIPTION_PRODUCT_ID,
  NURPISMO_SUBSCRIPTION_BASE_PLAN_ID: SUBSCRIPTION_BASE_PLAN_ID,
  REQUIRE_PLAY_INTEGRITY: "true",
  ENTITLEMENT_HASH_KEY_ID: "v1",
  ENTITLEMENT_HASH_SECRET: "test-only-secret-with-more-than-32-bytes",
  GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify({
    type: "service_account",
    client_email: "nurpismo-test@example.iam.gserviceaccount.com",
    private_key: privateKey
  })
};

function calculateRequestHash(productId, token, {
  productType = productId === SUBSCRIPTION_PRODUCT_ID ? "subs" : "inapp",
  requestHashVersion = "v2"
} = {}) {
  const canonical = requestHashVersion === "v1"
    ? `${PACKAGE_NAME}\n${productId}\n${token}`
    : `${PACKAGE_NAME}\n${productId}\n${productType}\n${token}`;
  return createHash("sha256")
    .update(canonical)
    .digest("base64url");
}

function makeRequest({
  token,
  productId = LEGACY_PRODUCT_ID,
  productType = "inapp",
  includeProductType = true,
  requestHashVersion = "v2",
  packageName = PACKAGE_NAME
}) {
  const requestHash = calculateRequestHash(productId, token, { productType, requestHashVersion });
  requestSequence += 1;
  const body = {
    packageName,
    productId,
    purchaseToken: token,
    requestHashVersion,
    requestHash,
    integrityToken: "integrity-test-token"
  };
  if (includeProductType) body.productType = productType;
  return new Request("https://api.example/v1/google-play/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-NurPismo-Client": "android",
      "CF-Connecting-IP": `203.0.113.${requestSequence}`
    },
    body: JSON.stringify(body)
  });
}

function integrityVerdict(requestHash) {
  return Response.json({
    tokenPayloadExternal: {
      requestDetails: {
        requestPackageName: PACKAGE_NAME,
        requestHash,
        timestampMillis: String(Date.now())
      },
      appIntegrity: { appRecognitionVerdict: "PLAY_RECOGNIZED", packageName: PACKAGE_NAME },
      accountDetails: { appLicensingVerdict: "LICENSED" },
      deviceIntegrity: { deviceRecognitionVerdict: ["MEETS_DEVICE_INTEGRITY"] }
    }
  });
}

function commonGoogleResponse(url, requestHash) {
  const href = String(url);
  if (href === "https://oauth2.googleapis.com/token") {
    return Response.json({ access_token: "test-access-token", expires_in: 3600 });
  }
  if (href.includes("playintegrity.googleapis.com")) return integrityVerdict(requestHash);
  return null;
}

function subscriptionPurchase({
  state = "SUBSCRIPTION_STATE_ACTIVE",
  expiryTimeMillis = Date.now() + 3_600_000,
  acknowledgementState = ACKNOWLEDGED,
  productId = SUBSCRIPTION_PRODUCT_ID,
  basePlanId = SUBSCRIPTION_BASE_PLAN_ID,
  offerId = "welcome-offer",
  autoRenewEnabled = true,
  linkedPurchaseToken = "linked.purchase.token.123456789012345",
  orderId = "GPA.5555-6666-7777-88888"
} = {}) {
  const lineItem = {
    productId,
    latestSuccessfulOrderId: orderId,
    autoRenewingPlan: { autoRenewEnabled },
    offerDetails: { basePlanId, offerId }
  };
  if (expiryTimeMillis !== null) lineItem.expiryTime = new Date(expiryTimeMillis).toISOString();
  return {
    kind: "androidpublisher#subscriptionPurchaseV2",
    startTime: new Date(Date.now() - 86_400_000).toISOString(),
    subscriptionState: state,
    acknowledgementState,
    linkedPurchaseToken,
    lineItems: [lineItem]
  };
}

async function verifySubscription({ purchase, token, db = new FakeD1(), ackResponse } = {}) {
  const requestHash = calculateRequestHash(SUBSCRIPTION_PRODUCT_ID, token);
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    calls.push({ href, method: String(init.method || "GET"), body: init.body });
    const common = commonGoogleResponse(href, requestHash);
    if (common) return common;
    if (href.includes("/purchases/subscriptionsv2/tokens/")) return Response.json(purchase);
    if (href.includes("/purchases/subscriptions/") && href.endsWith(":acknowledge")) {
      return ackResponse || new Response(null, { status: 200 });
    }
    throw new Error(`Unexpected fetch: ${href}`);
  };
  try {
    const response = await worker.fetch(makeRequest({
      token,
      productId: SUBSCRIPTION_PRODUCT_ID,
      productType: "subs"
    }), { ...baseEnv, ENTITLEMENTS_DB: db });
    return { response, body: await response.json(), db, calls };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("legacy full_access remains server-verified and backwards compatible without productType", async () => {
  let acknowledged = false;
  let acknowledgeCalls = 0;
  const token = "token.for.valid.legacy.purchase.1234567890";
  let activeRequestHash = calculateRequestHash(LEGACY_PRODUCT_ID, token, { requestHashVersion: "v1" });
  const db = new FakeD1();
  const calls = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    calls.push({ href, method: String(init.method || "GET"), body: init.body });
    const common = commonGoogleResponse(href, activeRequestHash);
    if (common) return common;
    if (href.includes("/purchases/products/") && String(init.method || "GET") === "POST") {
      acknowledgeCalls += 1;
      acknowledged = true;
      return new Response(null, { status: 200 });
    }
    if (href.includes("/purchases/products/")) {
      return Response.json({
        productId: LEGACY_PRODUCT_ID,
        orderId: "GPA.0000-1111-2222-33333",
        purchaseTimeMillis: "1720000000000",
        purchaseState: 0,
        consumptionState: 0,
        acknowledgementState: acknowledged ? 1 : 0
      });
    }
    throw new Error(`Unexpected fetch: ${href}`);
  };

  try {
    let response = await worker.fetch(makeRequest({ token, includeProductType: false, requestHashVersion: "v1" }), { ...baseEnv, ENTITLEMENTS_DB: db });
    let body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.valid, true);
    assert.equal(body.productType, "inapp");
    assert.equal(body.requestHash, activeRequestHash);
    assert.equal(body.reason, "server_verified_play_purchase");
    assert.equal(acknowledgeCalls, 1);
    assert.equal(db.writes.length, 2);
    assert.equal(db.writes[0][0], db.writes[1][0]);
    assert.match(db.writes[0][0], /^v1\.[A-Za-z0-9_-]{43}$/);
    assert.deepEqual(db.writes[0].slice(12, 18), [null, null, null, null, null, null]);
    assert.ok(!JSON.stringify(db.writes).includes(token));
    assert.ok(!JSON.stringify(db.writes).includes("GPA.0000-1111-2222-33333"));

    response = await worker.fetch(makeRequest({ token, includeProductType: false, requestHashVersion: "v1" }), { ...baseEnv, ENTITLEMENTS_DB: db });
    body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.valid, true);
    assert.equal(acknowledgeCalls, 1, "restoring an acknowledged legacy purchase must not acknowledge twice");
    assert.ok(calls.some(call => call.href.includes(`/purchases/products/${LEGACY_PRODUCT_ID}/tokens/`)));
    assert.ok(!calls.some(call => call.href.includes("subscriptionsv2")));

    activeRequestHash = calculateRequestHash(LEGACY_PRODUCT_ID, token);
    response = await worker.fetch(makeRequest({ token }), { ...baseEnv, ENTITLEMENTS_DB: db });
    body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.productId, LEGACY_PRODUCT_ID);
    assert.equal(body.productType, "inapp");
    assert.equal(body.requestHash, activeRequestHash, "the response must echo the verified v2 request hash");
    assert.equal(acknowledgeCalls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("legacy purchase lifecycle and validation remain fail-closed", async t => {
  const cases = [
    { name: "pending", purchase: { purchaseState: 2, consumptionState: 0, acknowledgementState: 0 }, status: 403, error: "purchase_pending", journal: "pending" },
    { name: "cancelled", purchase: { purchaseState: 1, consumptionState: 0, acknowledgementState: 1 }, status: 403, error: "purchase_not_active", journal: "cancelled" },
    { name: "consumed", purchase: { purchaseState: 0, consumptionState: 1, acknowledgementState: 1 }, status: 403, error: "purchase_consumed", journal: "consumed" },
    { name: "invalid verdict", purchase: { purchaseState: 7, consumptionState: 0, acknowledgementState: 1 }, status: 502, error: "google_play_response_invalid", journal: null }
  ];

  for (const [index, scenario] of cases.entries()) {
    await t.test(scenario.name, async () => {
      const token = `legacy.lifecycle.token.${index}.123456789012345`;
      const requestHash = calculateRequestHash(LEGACY_PRODUCT_ID, token);
      const db = new FakeD1();
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async url => {
        const href = String(url);
        const common = commonGoogleResponse(href, requestHash);
        if (common) return common;
        if (href.includes("/purchases/products/")) {
          return Response.json({ productId: LEGACY_PRODUCT_ID, ...scenario.purchase });
        }
        throw new Error(`Unexpected fetch: ${href}`);
      };
      try {
        const response = await worker.fetch(makeRequest({ token }), { ...baseEnv, ENTITLEMENTS_DB: db });
        assert.equal(response.status, scenario.status);
        assert.equal((await response.json()).error, scenario.error);
        assert.equal(db.writes[0]?.[3] || null, scenario.journal);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  }

  await t.test("Google product mismatch", async () => {
    const token = "legacy.wrong.google.product.123456789012345";
    const requestHash = calculateRequestHash(LEGACY_PRODUCT_ID, token);
    const db = new FakeD1();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async url => {
      const href = String(url);
      const common = commonGoogleResponse(href, requestHash);
      if (common) return common;
      return Response.json({ productId: "another_product", purchaseState: 0, consumptionState: 0, acknowledgementState: 1 });
    };
    try {
      const response = await worker.fetch(makeRequest({ token }), { ...baseEnv, ENTITLEMENTS_DB: db });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error, "purchase_product_mismatch");
      assert.equal(db.writes.length, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test("subscription lifecycle grants only active, grace, and unexpired cancelled states", async t => {
  const now = Date.now();
  const cases = [
    { state: "SUBSCRIPTION_STATE_ACTIVE", expiry: now + 3_600_000, status: 200, error: null, journal: "active" },
    { state: "SUBSCRIPTION_STATE_IN_GRACE_PERIOD", expiry: now + 3_600_000, status: 200, error: null, journal: "active" },
    { state: "SUBSCRIPTION_STATE_CANCELED", expiry: now + 3_600_000, status: 200, error: null, journal: "active" },
    { state: "SUBSCRIPTION_STATE_ACTIVE", expiry: now - 3_600_000, status: 403, error: "subscription_expired", journal: "cancelled" },
    { state: "SUBSCRIPTION_STATE_CANCELED", expiry: now - 3_600_000, status: 403, error: "subscription_expired", journal: "cancelled" },
    { state: "SUBSCRIPTION_STATE_PENDING", expiry: null, status: 403, error: "subscription_pending", journal: "pending" },
    { state: "SUBSCRIPTION_STATE_PAUSED", expiry: now + 3_600_000, status: 403, error: "subscription_paused", journal: "cancelled" },
    { state: "SUBSCRIPTION_STATE_ON_HOLD", expiry: now + 3_600_000, status: 403, error: "subscription_on_hold", journal: "cancelled" },
    { state: "SUBSCRIPTION_STATE_EXPIRED", expiry: now - 3_600_000, status: 403, error: "subscription_expired", journal: "cancelled" },
    { state: "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED", expiry: null, status: 403, error: "subscription_not_active", journal: "cancelled" },
    { state: "SUBSCRIPTION_STATE_REVOKED", expiry: now + 3_600_000, status: 403, error: "subscription_revoked", journal: "cancelled" },
    { state: "SUBSCRIPTION_STATE_UNSPECIFIED", expiry: now + 3_600_000, status: 403, error: "subscription_not_active", journal: "cancelled" }
  ];

  for (const [index, scenario] of cases.entries()) {
    await t.test(`${scenario.state} (${scenario.expiry === null ? "no expiry" : scenario.expiry > now ? "future" : "past"})`, async () => {
      const token = `subscription.lifecycle.${index}.token.123456789`;
      const purchase = subscriptionPurchase({ state: scenario.state, expiryTimeMillis: scenario.expiry });
      const result = await verifySubscription({ purchase, token });
      assert.equal(result.response.status, scenario.status);
      if (scenario.error) assert.equal(result.body.error, scenario.error);
      else {
        assert.equal(result.body.valid, true);
        assert.equal(result.body.productType, "subs");
        assert.equal(result.body.productId, SUBSCRIPTION_PRODUCT_ID);
        assert.equal(result.body.requestHash, calculateRequestHash(SUBSCRIPTION_PRODUCT_ID, token));
        assert.equal(result.body.subscriptionState, scenario.state);
        assert.equal(result.body.reason, "server_verified_play_subscription");
      }
      assert.equal(result.db.writes[0][3], scenario.journal);
      assert.equal(result.db.writes[0][12], scenario.state);
      assert.equal(result.db.writes[0][13], scenario.expiry);
      assert.equal(result.db.writes[0][14], SUBSCRIPTION_BASE_PLAN_ID);
      assert.equal(result.db.writes[0][15], "welcome-offer");
      assert.equal(result.db.writes[0][16], 1);
      assert.match(result.db.writes[0][17], /^v1\.[A-Za-z0-9_-]{43}$/);
      assert.ok(result.calls.some(call => call.href.includes("/purchases/subscriptionsv2/tokens/")));
      assert.ok(!result.calls.some(call => call.href.includes("/purchases/products/")));
    });
  }
});

test("subscription initial purchase is acknowledged once and sensitive identifiers are hashed", async () => {
  const token = "new.subscription.purchase.token.123456789012345";
  const linkedToken = "linked.subscription.purchase.token.9876543210";
  const orderId = "GPA.9999-8888-7777-66666";
  const requestHash = calculateRequestHash(SUBSCRIPTION_PRODUCT_ID, token);
  const db = new FakeD1();
  let acknowledgementState = ACKNOWLEDGEMENT_PENDING;
  let acknowledgeCalls = 0;
  const calls = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    calls.push({ href, method: String(init.method || "GET"), body: init.body });
    const common = commonGoogleResponse(href, requestHash);
    if (common) return common;
    if (href.includes("/purchases/subscriptionsv2/tokens/")) {
      return Response.json(subscriptionPurchase({ acknowledgementState, linkedPurchaseToken: linkedToken, orderId }));
    }
    if (href.includes("/purchases/subscriptions/") && href.endsWith(":acknowledge")) {
      acknowledgeCalls += 1;
      acknowledgementState = ACKNOWLEDGED;
      return new Response(null, { status: 200 });
    }
    throw new Error(`Unexpected fetch: ${href}`);
  };

  try {
    let response = await worker.fetch(makeRequest({ token, productId: SUBSCRIPTION_PRODUCT_ID, productType: "subs" }), { ...baseEnv, ENTITLEMENTS_DB: db });
    let body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.acknowledged, true);
    assert.equal(acknowledgeCalls, 1);
    const acknowledgeCall = calls.find(call => call.method === "POST" && call.href.endsWith(":acknowledge"));
    assert.equal(
      acknowledgeCall.href,
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptions/${SUBSCRIPTION_PRODUCT_ID}/tokens/${token}:acknowledge`
    );
    assert.deepEqual(JSON.parse(acknowledgeCall.body), { developerPayload: "glowletter-server-verified-subscription-v1" });
    assert.equal(db.writes[0][3], "verified_pending_ack");
    assert.equal(db.writes.at(-1)[3], "active");
    assert.ok(!JSON.stringify(db.writes).includes(token));
    assert.ok(!JSON.stringify(db.writes).includes(linkedToken));
    assert.ok(!JSON.stringify(db.writes).includes(orderId));

    response = await worker.fetch(makeRequest({ token, productId: SUBSCRIPTION_PRODUCT_ID, productType: "subs" }), { ...baseEnv, ENTITLEMENTS_DB: db });
    body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.valid, true);
    assert.equal(acknowledgeCalls, 1, "restoring an acknowledged subscription must not acknowledge twice");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("subscription acknowledgement race succeeds only after an authoritative refresh", async t => {
  await t.test("another verifier already acknowledged", async () => {
    const token = "subscription.ack.race.success.token.123456789";
    const requestHash = calculateRequestHash(SUBSCRIPTION_PRODUCT_ID, token);
    const db = new FakeD1();
    let getCalls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init = {}) => {
      const href = String(url);
      const common = commonGoogleResponse(href, requestHash);
      if (common) return common;
      if (href.includes("/purchases/subscriptionsv2/tokens/")) {
        getCalls += 1;
        return Response.json(subscriptionPurchase({ acknowledgementState: getCalls === 1 ? ACKNOWLEDGEMENT_PENDING : ACKNOWLEDGED }));
      }
      if (String(init.method || "GET") === "POST" && href.endsWith(":acknowledge")) return new Response(null, { status: 409 });
      throw new Error(`Unexpected fetch: ${href}`);
    };
    try {
      const response = await worker.fetch(makeRequest({ token, productId: SUBSCRIPTION_PRODUCT_ID, productType: "subs" }), { ...baseEnv, ENTITLEMENTS_DB: db });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).valid, true);
      assert.equal(getCalls, 2);
      assert.equal(db.writes.at(-1)[3], "active");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await t.test("failed acknowledgement remains fail-closed", async () => {
    const token = "subscription.ack.race.failure.token.123456789";
    const requestHash = calculateRequestHash(SUBSCRIPTION_PRODUCT_ID, token);
    const db = new FakeD1();
    let getCalls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init = {}) => {
      const href = String(url);
      const common = commonGoogleResponse(href, requestHash);
      if (common) return common;
      if (href.includes("/purchases/subscriptionsv2/tokens/")) {
        getCalls += 1;
        return Response.json(subscriptionPurchase({ acknowledgementState: ACKNOWLEDGEMENT_PENDING }));
      }
      if (String(init.method || "GET") === "POST" && href.endsWith(":acknowledge")) return new Response(null, { status: 500 });
      throw new Error(`Unexpected fetch: ${href}`);
    };
    try {
      const response = await worker.fetch(makeRequest({ token, productId: SUBSCRIPTION_PRODUCT_ID, productType: "subs" }), { ...baseEnv, ENTITLEMENTS_DB: db });
      assert.equal(response.status, 502);
      assert.equal((await response.json()).error, "acknowledgement_failed");
      assert.equal(getCalls, 2);
      assert.equal(db.writes.at(-1)[3], "ack_failed");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test("subscription product metadata and Google verdicts are validated fail-closed", async t => {
  const invalidCases = [
    { name: "wrong line item product", purchase: subscriptionPurchase({ productId: "wrong_subscription" }), status: 403, error: "purchase_product_mismatch" },
    { name: "wrong base plan", purchase: subscriptionPurchase({ basePlanId: "annual" }), status: 403, error: "subscription_base_plan_mismatch" },
    { name: "missing active expiry", purchase: subscriptionPurchase({ expiryTimeMillis: null }), status: 502, error: "google_play_response_invalid" },
    { name: "unknown lifecycle state", purchase: subscriptionPurchase({ state: "SUBSCRIPTION_STATE_UNKNOWN_FUTURE_VALUE" }), status: 502, error: "google_play_response_invalid" },
    { name: "invalid acknowledgement state", purchase: subscriptionPurchase({ acknowledgementState: "ACKNOWLEDGEMENT_STATE_UNSPECIFIED" }), status: 502, error: "google_play_response_invalid" }
  ];
  for (const [index, scenario] of invalidCases.entries()) {
    await t.test(scenario.name, async () => {
      const result = await verifySubscription({
        purchase: scenario.purchase,
        token: `subscription.invalid.${index}.token.1234567890123`
      });
      assert.equal(result.response.status, scenario.status);
      assert.equal(result.body.error, scenario.error);
      assert.equal(result.db.writes.length, 0);
    });
  }

  await t.test("subscription SKU cannot masquerade as an in-app product", async () => {
    const token = "subscription.wrong.type.token.123456789012345";
    const db = new FakeD1();
    const response = await worker.fetch(makeRequest({ token, productId: SUBSCRIPTION_PRODUCT_ID, productType: "inapp" }), { ...baseEnv, ENTITLEMENTS_DB: db });
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error, "product_mismatch");
    assert.equal(db.writes.length, 0);
  });

  await t.test("subscription requests must declare productType", async () => {
    const token = "subscription.missing.type.token.1234567890123";
    const db = new FakeD1();
    const response = await worker.fetch(makeRequest({ token, productId: SUBSCRIPTION_PRODUCT_ID, includeProductType: false }), { ...baseEnv, ENTITLEMENTS_DB: db });
    assert.equal(response.status, 422);
    assert.equal((await response.json()).error, "invalid_product_type");
    assert.equal(db.writes.length, 0);
  });

  await t.test("v1 is restricted to the old full_access client without productType", async () => {
    const token = "legacy.explicit.v1.type.token.123456789012345";
    const db = new FakeD1();
    const response = await worker.fetch(makeRequest({
      token,
      productId: LEGACY_PRODUCT_ID,
      productType: "inapp",
      requestHashVersion: "v1"
    }), { ...baseEnv, ENTITLEMENTS_DB: db });
    assert.equal(response.status, 422);
    assert.equal((await response.json()).error, "request_hash_version_unsupported");
    assert.equal(db.writes.length, 0);
  });
});

test("entitlement storage configuration and schema version are mandatory", async () => {
  const token = "configuration.validation.token.123456789012345";
  let response = await worker.fetch(makeRequest({ token }), baseEnv);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "billing_backend_not_configured");

  for (const version of [1, 99]) {
    response = await worker.fetch(makeRequest({ token }), { ...baseEnv, ENTITLEMENTS_DB: new FakeD1(version) });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, "entitlement_store_not_ready");
  }
});

test("subscription migration is additive and preserves legacy rows", async () => {
  const migrationUrl = new URL("../migrations/0002_subscription_entitlements.sql", import.meta.url);
  const originalMigrationUrl = new URL("../migrations/0001_entitlements.sql", import.meta.url);
  const [migration, originalMigration] = await Promise.all([
    readFile(migrationUrl, "utf8"),
    readFile(originalMigrationUrl, "utf8")
  ]);
  for (const column of [
    "subscription_state",
    "expiry_time_ms",
    "base_plan_id",
    "offer_id",
    "auto_renew_enabled",
    "linked_purchase_token_hash"
  ]) {
    const statement = migration.split(";").find(part => part.includes(`ADD COLUMN ${column}`));
    assert.ok(statement, `${column} must be added by migration 0002`);
    assert.doesNotMatch(statement, /\bNOT\s+NULL\b/i, `${column} must stay nullable for legacy rows`);
  }
  assert.match(migration, /SET\s+schema_version\s*=\s*2/i);
  assert.doesNotMatch(migration, /\b(?:DROP|DELETE|TRUNCATE)\b/i);
  assert.match(originalMigration, /VALUES\s*\(1,\s*1,/i, "the historical v1 migration must remain unchanged");
});
