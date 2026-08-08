const MAX_REQUEST_BYTES = 32 * 1024;
const MAX_PROVIDER_RESPONSE_BYTES = 128 * 1024;
const INTEGRITY_WINDOW_MS = 5 * 60_000;
const INTEGRITY_FUTURE_SKEW_MS = 30_000;
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/androidpublisher",
  "https://www.googleapis.com/auth/playintegrity",
].join(" ");
const PRODUCT_TYPE_SUBSCRIPTION = "subs";
const PRODUCT_TYPE_INAPP = "inapp";
const PURCHASE_TOKEN_HASH_DOMAIN = "glowletter/google-play/purchase-token/v1";
const ORDER_ID_HASH_DOMAIN = "glowletter/google-play/order-id/v1";
const RATE_LIMIT_HASH_DOMAIN = "glowletter/google-play/rate-limit/v1";
const ACCOUNT_BINDING_DOMAIN = "glowletter/play-account/v1";
const SUBSCRIPTION_STATES = new Set([
  "SUBSCRIPTION_STATE_PENDING",
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_PAUSED",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
  "SUBSCRIPTION_STATE_ON_HOLD",
  "SUBSCRIPTION_STATE_CANCELED",
  "SUBSCRIPTION_STATE_EXPIRED",
  "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED",
]);

class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function canonicalRequest(
  packageName,
  productId,
  productType,
  purchaseToken,
) {
  return `${packageName}\n${productId}\n${productType}\n${purchaseToken}`;
}

export async function sha256Base64Url(value) {
  return base64Url(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  );
}

export function createGooglePlayVerificationHandler({
  environment,
  fetchImpl = fetch,
  now = () => Date.now(),
  journal,
  identity,
}) {
  const env = typeof environment === "function"
    ? environment
    : (name) => environment?.[name];
  let googleTokenCache = null;

  return async function handleGooglePlayVerification(request) {
    try {
      if (request.headers.get("origin")) {
        throw new ApiError("browser_origin_not_allowed", 403);
      }
      if (request.headers.get("X-NurPismo-Client") !== "android") {
        throw new ApiError("invalid_client", 403);
      }
      if (request.method !== "POST") {
        throw new ApiError("method_not_allowed", 405);
      }
      if (
        !/^application\/json(?:\s*;|$)/iu.test(
          request.headers.get("content-type") || "",
        )
      ) {
        throw new ApiError("content_type_required", 415);
      }

      const config = requireConfiguration(env, journal, identity);
      const body = await readLimitedJson(request);
      const purchase = validatePurchaseRequest(body, config);
      const expectedRequestHash = await sha256Base64Url(canonicalRequest(
        config.packageName,
        purchase.productId,
        purchase.productType,
        purchase.purchaseToken,
      ));
      if (!constantTimeEqual(expectedRequestHash, purchase.requestHash)) {
        throw new ApiError("request_hash_mismatch", 403);
      }

      const authenticated = await authenticateRequest(request, identity);
      await enforceRateLimit({ request, config, journal });

      const accessToken = await googleAccessToken({
        config,
        fetchImpl,
        now,
        cache: () => googleTokenCache,
        updateCache: (value) => {
          googleTokenCache = value;
        },
      });
      const integrity = await verifyIntegrity({
        integrityToken: purchase.integrityToken,
        requestHash: expectedRequestHash,
        config,
        accessToken,
        fetchImpl,
        now,
      });
      const tokenHash = await keyedHash(
        config,
        PURCHASE_TOKEN_HASH_DOMAIN,
        `${config.packageName}\n${purchase.productId}\n${purchase.purchaseToken}`,
      );
      const context = {
        config,
        fetchImpl,
        now,
        journal,
        accessToken,
        requestHash: expectedRequestHash,
        tokenHash,
        integrity,
        userId: authenticated.userId,
        accountBinding: await sha256Base64Url(
          `${ACCOUNT_BINDING_DOMAIN}\n${authenticated.userId}`,
        ),
        ...purchase,
      };

      return purchase.productType === PRODUCT_TYPE_SUBSCRIPTION
        ? await verifySubscription(context)
        : await verifyLegacyOneTimeProduct(context);
    } catch (error) {
      if (error instanceof ApiError) {
        return json({ error: error.code }, error.status);
      }
      return json({ error: "internal_error" }, 500);
    }
  };
}

function requireConfiguration(env, journal, identity) {
  const packageName = String(env("GLOWLETTER_PLAY_PACKAGE_NAME") || "").trim();
  const subscriptionProductId = String(
    env("GLOWLETTER_PLAY_SUBSCRIPTION_PRODUCT_ID") || "",
  ).trim();
  const subscriptionBasePlanId = String(
    env("GLOWLETTER_PLAY_SUBSCRIPTION_BASE_PLAN_ID") || "",
  ).trim();
  const legacyProductId = String(
    env("GLOWLETTER_PLAY_LEGACY_PRODUCT_ID") || "",
  ).trim();
  const hashSecret = String(
    env("GLOWLETTER_ENTITLEMENT_HASH_SECRET") || "",
  );
  const hashKeyId = String(
    env("GLOWLETTER_ENTITLEMENT_HASH_KEY_ID") || "",
  ).trim();
  const minVersionText = String(
    env("GLOWLETTER_PLAY_MIN_VERSION_CODE") || "",
  ).trim();
  const minVersionCode = Number(minVersionText);
  const certificateDigests = new Set(
    String(env("GLOWLETTER_PLAY_CERTIFICATE_SHA256_DIGESTS") || "")
      .split(",")
      .map(normalizeCertificateDigest)
      .filter(Boolean),
  );

  let serviceAccount = null;
  try {
    serviceAccount = JSON.parse(
      String(env("GOOGLE_SERVICE_ACCOUNT_JSON") || ""),
    );
  } catch {
    serviceAccount = null;
  }

  const validProduct = (value) => /^[A-Za-z0-9._-]{1,128}$/u.test(value);
  const valid = /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/u
    .test(packageName) &&
    validProduct(subscriptionProductId) &&
    validProduct(subscriptionBasePlanId) &&
    validProduct(legacyProductId) &&
    subscriptionProductId !== legacyProductId &&
    Number.isSafeInteger(minVersionCode) &&
    minVersionCode > 0 &&
    certificateDigests.size > 0 &&
    [...certificateDigests].every((value) =>
      /^[A-Za-z0-9_-]{43}$/u.test(value)
    ) &&
    new TextEncoder().encode(hashSecret).byteLength >= 32 &&
    /^[a-z0-9_-]{1,16}$/u.test(hashKeyId) &&
    serviceAccount?.type === "service_account" &&
    typeof serviceAccount.client_email === "string" &&
    serviceAccount.client_email.endsWith(".gserviceaccount.com") &&
    typeof serviceAccount.private_key === "string" &&
    serviceAccount.private_key.includes("BEGIN PRIVATE KEY") &&
    journal?.isConfigured?.() === true &&
    typeof journal.record === "function" &&
    typeof journal.consumeRateLimit === "function" &&
    identity?.isConfigured?.() === true &&
    typeof identity.authenticate === "function";

  if (!valid) throw new ApiError("billing_backend_not_configured", 503);
  return {
    packageName,
    subscriptionProductId,
    subscriptionBasePlanId,
    legacyProductId,
    hashSecret,
    hashKeyId,
    minVersionCode,
    certificateDigests,
    serviceAccount,
  };
}

function validatePurchaseRequest(body, config) {
  const packageName = exactString(body.packageName, 256);
  const productId = exactString(body.productId, 128);
  const productType = exactString(body.productType, 16);
  const purchaseToken = exactString(body.purchaseToken, 4096);
  const requestHashVersion = exactString(body.requestHashVersion, 16);
  const requestHash = exactString(body.requestHash, 128);
  const integrityToken = exactString(body.integrityToken, 24 * 1024);

  if (packageName !== config.packageName) {
    throw new ApiError("product_mismatch", 403);
  }
  if (requestHashVersion !== "v2") {
    throw new ApiError("request_hash_version_unsupported", 422);
  }
  if (![PRODUCT_TYPE_SUBSCRIPTION, PRODUCT_TYPE_INAPP].includes(productType)) {
    throw new ApiError("invalid_product_type", 422);
  }
  const expectedProduct = productType === PRODUCT_TYPE_SUBSCRIPTION
    ? config.subscriptionProductId
    : config.legacyProductId;
  if (productId !== expectedProduct) {
    throw new ApiError("product_mismatch", 403);
  }
  if (!validOpaqueToken(purchaseToken)) {
    throw new ApiError("invalid_purchase_token", 422);
  }
  if (!/^[A-Za-z0-9_-]{43}$/u.test(requestHash)) {
    throw new ApiError("invalid_request_hash", 422);
  }
  if (integrityToken.length < 20) {
    throw new ApiError("play_integrity_token_missing", 422);
  }
  return { productId, productType, purchaseToken, requestHash, integrityToken };
}

async function verifyIntegrity({
  integrityToken,
  requestHash,
  config,
  accessToken,
  fetchImpl,
  now,
}) {
  const response = await fetchImpl(
    `https://playintegrity.googleapis.com/v1/${
      encodeURIComponent(config.packageName)
    }:decodeIntegrityToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ integrity_token: integrityToken }),
    },
  );
  if (!response.ok) {
    if (response.status === 429 || response.status >= 500) {
      throw new ApiError("play_integrity_unavailable", 503);
    }
    if (response.status === 401 || response.status === 403) {
      throw new ApiError("play_integrity_configuration_error", 502);
    }
    throw new ApiError("integrity_rejected", 403);
  }

  const decoded = await providerJson(response);
  const payload = objectValue(decoded.tokenPayloadExternal);
  const details = objectValue(payload.requestDetails);
  const app = objectValue(payload.appIntegrity);
  const account = objectValue(payload.accountDetails);
  const device = objectValue(payload.deviceIntegrity);
  const timestamp = Number(details.timestampMillis);
  const age = now() - timestamp;
  const versionCode = Number(app.versionCode);
  const returnedDigests = Array.isArray(app.certificateSha256Digest)
    ? app.certificateSha256Digest.map(normalizeCertificateDigest).filter(
      Boolean,
    )
    : [];
  const certificateDigest = returnedDigests.find((value) => (
    config.certificateDigests.has(value)
  ));
  const deviceVerdicts = Array.isArray(device.deviceRecognitionVerdict)
    ? device.deviceRecognitionVerdict
    : [];

  const verified = Number.isFinite(timestamp) &&
    age >= -INTEGRITY_FUTURE_SKEW_MS &&
    age <= INTEGRITY_WINDOW_MS &&
    details.requestPackageName === config.packageName &&
    constantTimeEqual(String(details.requestHash || ""), requestHash) &&
    app.appRecognitionVerdict === "PLAY_RECOGNIZED" &&
    app.packageName === config.packageName &&
    Boolean(certificateDigest) &&
    Number.isSafeInteger(versionCode) &&
    versionCode >= config.minVersionCode &&
    account.appLicensingVerdict === "LICENSED" &&
    deviceVerdicts.includes("MEETS_DEVICE_INTEGRITY");
  if (!verified) throw new ApiError("integrity_rejected", 403);
  return { certificateDigest, versionCode };
}

async function verifySubscription(context) {
  const purchaseUrl =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${
      encodeURIComponent(context.config.packageName)
    }/purchases/subscriptionsv2/tokens/${
      encodeURIComponent(context.purchaseToken)
    }`;
  const response = await context.fetchImpl(purchaseUrl, {
    headers: { Authorization: `Bearer ${context.accessToken}` },
  });
  if (!response.ok) throwGooglePurchaseError(response.status);
  let purchase = await providerJson(response);
  let evidence = await subscriptionEvidence(purchase, context);

  if (!subscriptionEntitled(evidence, context.now())) {
    await persist(context, {
      ...evidence,
      state: subscriptionJournalState(evidence.subscriptionState, false),
    });
    throw subscriptionStateError(
      evidence.subscriptionState,
      evidence.expiryTime,
      context.now(),
    );
  }

  await persist(context, {
    ...evidence,
    state: evidence.acknowledged ? "active" : "verified_pending_ack",
  });
  let acknowledged = evidence.acknowledged;
  if (!acknowledged) {
    const acknowledgeUrl =
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${
        encodeURIComponent(context.config.packageName)
      }/purchases/subscriptions/${
        encodeURIComponent(context.productId)
      }/tokens/${encodeURIComponent(context.purchaseToken)}:acknowledge`;
    const acknowledgeResponse = await context.fetchImpl(acknowledgeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        developerPayload: "glowletter-server-verified-subscription-v1",
      }),
    });
    if (acknowledgeResponse.ok) {
      acknowledged = true;
    } else {
      const refreshedResponse = await context.fetchImpl(purchaseUrl, {
        headers: { Authorization: `Bearer ${context.accessToken}` },
      });
      if (refreshedResponse.ok) {
        purchase = await providerJson(refreshedResponse);
        evidence = await subscriptionEvidence(purchase, context);
        if (!subscriptionEntitled(evidence, context.now())) {
          await persist(context, {
            ...evidence,
            state: subscriptionJournalState(
              evidence.subscriptionState,
              false,
            ),
          });
          throw subscriptionStateError(
            evidence.subscriptionState,
            evidence.expiryTime,
            context.now(),
          );
        }
        acknowledged = evidence.acknowledged;
      } else {
        await persist(context, { ...evidence, state: "ack_failed" });
        throwGooglePurchaseError(refreshedResponse.status);
      }
      if (!acknowledged) {
        await persist(context, { ...evidence, state: "ack_failed" });
        throw new ApiError("acknowledgement_failed", 502);
      }
    }
  }

  await persist(context, {
    ...evidence,
    acknowledged: true,
    acknowledgementStateCode: 1,
    state: "active",
  });
  return json({
    valid: true,
    acknowledged: true,
    integrityVerified: true,
    productId: context.productId,
    productType: context.productType,
    requestHash: context.requestHash,
    subscriptionState: evidence.subscriptionState,
    expiryTimeMillis: evidence.expiryTime,
    serverTimeMillis: context.now(),
    reason: "server_verified_play_subscription",
  });
}

async function subscriptionEvidence(purchase, context) {
  if (!purchase || typeof purchase !== "object" || Array.isArray(purchase)) {
    throw new ApiError("google_play_response_invalid", 502);
  }
  const subscriptionState = String(purchase.subscriptionState || "");
  const acknowledgement = String(purchase.acknowledgementState || "");
  if (
    !SUBSCRIPTION_STATES.has(subscriptionState) ||
    ![
      "ACKNOWLEDGEMENT_STATE_PENDING",
      "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    ].includes(acknowledgement)
  ) {
    throw new ApiError("google_play_response_invalid", 502);
  }

  const externalAccountIdentifiers = objectValue(
    purchase.externalAccountIdentifiers,
  );
  if (
    !constantTimeEqual(
      String(externalAccountIdentifiers.obfuscatedExternalAccountId || ""),
      context.accountBinding,
    )
  ) {
    throw new ApiError("purchase_account_mismatch", 403);
  }

  const lineItems = Array.isArray(purchase.lineItems) ? purchase.lineItems : [];
  const productItems = lineItems.filter((item) => (
    item && item.productId === context.productId
  ));
  if (!productItems.length) {
    throw new ApiError("purchase_product_mismatch", 403);
  }
  const matchingItems = productItems.filter((item) => (
    item.offerDetails?.basePlanId === context.config.subscriptionBasePlanId
  ));
  if (!matchingItems.length) {
    throw new ApiError("subscription_base_plan_mismatch", 403);
  }

  const parsedItems = matchingItems.map((item) => ({
    item,
    expiryTime: googleTimestampOrNull(item.expiryTime),
  }));
  parsedItems.sort((left, right) => (
    (right.expiryTime ?? -1) - (left.expiryTime ?? -1)
  ));
  const selected = parsedItems[0];
  const stateMayOmitExpiry = [
    "SUBSCRIPTION_STATE_PENDING",
    "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED",
  ].includes(subscriptionState);
  if (!selected || (!stateMayOmitExpiry && selected.expiryTime === null)) {
    throw new ApiError("google_play_response_invalid", 502);
  }

  const autoRenewingPlan = objectValue(selected.item.autoRenewingPlan);
  let autoRenewEnabled = null;
  if (Object.keys(autoRenewingPlan).length) {
    if (typeof autoRenewingPlan.autoRenewEnabled !== "boolean") {
      throw new ApiError("google_play_response_invalid", 502);
    }
    autoRenewEnabled = autoRenewingPlan.autoRenewEnabled;
  } else if (!stateMayOmitExpiry) {
    // GlowLetter's monthly base plan is auto-renewing, not prepaid.
    throw new ApiError("google_play_response_invalid", 502);
  }

  const offerId = selected.item.offerDetails?.offerId;
  if (
    offerId !== undefined &&
    (typeof offerId !== "string" || !offerId || offerId.length > 128)
  ) {
    throw new ApiError("google_play_response_invalid", 502);
  }
  const linkedToken = purchase.linkedPurchaseToken;
  let linkedPurchaseTokenHash = null;
  if (linkedToken !== undefined) {
    if (
      typeof linkedToken !== "string" ||
      !validOpaqueToken(linkedToken)
    ) {
      throw new ApiError("google_play_response_invalid", 502);
    }
    linkedPurchaseTokenHash = await keyedHash(
      context.config,
      PURCHASE_TOKEN_HASH_DOMAIN,
      `${context.config.packageName}\n${context.productId}\n${linkedToken}`,
    );
  }
  const orderId = selected.item.latestSuccessfulOrderId;
  const orderIdHash = typeof orderId === "string" && orderId
    ? await keyedHash(context.config, ORDER_ID_HASH_DOMAIN, orderId)
    : null;
  const acknowledged = acknowledgement ===
    "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";
  const provisionallyActive = [
    "SUBSCRIPTION_STATE_ACTIVE",
    "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
    "SUBSCRIPTION_STATE_CANCELED",
  ].includes(subscriptionState);

  return {
    tokenHash: context.tokenHash,
    packageName: context.config.packageName,
    productId: context.productId,
    productType: context.productType,
    subscriptionState,
    expiryTime: selected.expiryTime,
    basePlanId: context.config.subscriptionBasePlanId,
    offerId: offerId || null,
    autoRenewEnabled,
    linkedPurchaseTokenHash,
    purchaseTime: googleTimestampOrNull(purchase.startTime),
    orderIdHash,
    purchaseStateCode: provisionallyActive
      ? 0
      : subscriptionState === "SUBSCRIPTION_STATE_PENDING"
      ? 2
      : 1,
    consumptionStateCode: 0,
    acknowledgementStateCode: acknowledged ? 1 : 0,
    acknowledged,
    isTestPurchase: purchase.testPurchase !== undefined,
  };
}

async function verifyLegacyOneTimeProduct(context) {
  const purchaseUrl =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${
      encodeURIComponent(context.config.packageName)
    }/purchases/products/${encodeURIComponent(context.productId)}/tokens/${
      encodeURIComponent(context.purchaseToken)
    }`;
  const response = await context.fetchImpl(purchaseUrl, {
    headers: { Authorization: `Bearer ${context.accessToken}` },
  });
  if (!response.ok) throwGooglePurchaseError(response.status);
  let purchase = await providerJson(response);
  let evidence = await oneTimeEvidence(purchase, context);

  if (evidence.purchaseStateCode !== 0) {
    await persist(context, {
      ...evidence,
      state: evidence.purchaseStateCode === 2 ? "pending" : "cancelled",
    });
    throw new ApiError(
      evidence.purchaseStateCode === 2
        ? "purchase_pending"
        : "purchase_not_active",
      403,
    );
  }
  if (evidence.consumptionStateCode !== 0) {
    await persist(context, { ...evidence, state: "consumed" });
    throw new ApiError("purchase_consumed", 403);
  }

  await persist(context, {
    ...evidence,
    state: evidence.acknowledged ? "active" : "verified_pending_ack",
  });
  let acknowledged = evidence.acknowledged;
  if (!acknowledged) {
    const acknowledgeResponse = await context.fetchImpl(
      `${purchaseUrl}:acknowledge`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          developerPayload: "glowletter-server-verified-legacy-v1",
        }),
      },
    );
    if (acknowledgeResponse.ok) {
      acknowledged = true;
    } else {
      const refreshedResponse = await context.fetchImpl(purchaseUrl, {
        headers: { Authorization: `Bearer ${context.accessToken}` },
      });
      if (refreshedResponse.ok) {
        purchase = await providerJson(refreshedResponse);
        evidence = await oneTimeEvidence(purchase, context);
        if (evidence.purchaseStateCode !== 0) {
          await persist(context, {
            ...evidence,
            state: evidence.purchaseStateCode === 2 ? "pending" : "cancelled",
          });
          throw new ApiError(
            evidence.purchaseStateCode === 2
              ? "purchase_pending"
              : "purchase_not_active",
            403,
          );
        }
        if (evidence.consumptionStateCode !== 0) {
          await persist(context, { ...evidence, state: "consumed" });
          throw new ApiError("purchase_consumed", 403);
        }
        acknowledged = evidence.acknowledged;
      } else {
        await persist(context, { ...evidence, state: "ack_failed" });
        throwGooglePurchaseError(refreshedResponse.status);
      }
      if (!acknowledged) {
        await persist(context, { ...evidence, state: "ack_failed" });
        throw new ApiError("acknowledgement_failed", 502);
      }
    }
  }

  await persist(context, {
    ...evidence,
    acknowledged: true,
    acknowledgementStateCode: 1,
    state: "active",
  });
  return json({
    valid: true,
    acknowledged: true,
    integrityVerified: true,
    productId: context.productId,
    productType: context.productType,
    requestHash: context.requestHash,
    serverTimeMillis: context.now(),
    reason: "server_verified_play_purchase",
  });
}

async function oneTimeEvidence(purchase, context) {
  if (!purchase || typeof purchase !== "object" || Array.isArray(purchase)) {
    throw new ApiError("google_play_response_invalid", 502);
  }
  if (
    purchase.productId !== undefined && purchase.productId !== context.productId
  ) {
    throw new ApiError("purchase_product_mismatch", 403);
  }
  const purchaseStateCode = jsonInteger(purchase.purchaseState);
  const consumptionStateCode = jsonInteger(purchase.consumptionState);
  const acknowledgementStateCode = jsonInteger(purchase.acknowledgementState);
  if (
    ![0, 1, 2].includes(purchaseStateCode) ||
    ![0, 1].includes(consumptionStateCode) ||
    ![0, 1].includes(acknowledgementStateCode)
  ) {
    throw new ApiError("google_play_response_invalid", 502);
  }
  const orderIdHash = typeof purchase.orderId === "string" && purchase.orderId
    ? await keyedHash(context.config, ORDER_ID_HASH_DOMAIN, purchase.orderId)
    : null;
  return {
    tokenHash: context.tokenHash,
    packageName: context.config.packageName,
    productId: context.productId,
    productType: context.productType,
    subscriptionState: null,
    expiryTime: null,
    basePlanId: null,
    offerId: null,
    autoRenewEnabled: null,
    linkedPurchaseTokenHash: null,
    purchaseTime: millisOrNull(purchase.purchaseTimeMillis),
    orderIdHash,
    purchaseStateCode,
    consumptionStateCode,
    acknowledgementStateCode,
    acknowledged: acknowledgementStateCode === 1,
    isTestPurchase: purchase.purchaseType === 0,
  };
}

async function persist(context, record) {
  try {
    await context.journal.record({
      ...record,
      userId: context.userId,
      integrityVerified: true,
      appVersionCode: context.integrity.versionCode,
      certificateSha256Digest: context.integrity.certificateDigest,
    });
  } catch {
    throw new ApiError("entitlement_store_unavailable", 503);
  }
}

async function authenticateRequest(request, identity) {
  try {
    const authenticated = await identity.authenticate(request);
    const userId = typeof authenticated?.userId === "string"
      ? authenticated.userId.trim().toLowerCase()
      : "";
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u
        .test(userId)
    ) {
      throw new Error("invalid_user_id");
    }
    return { userId };
  } catch {
    throw new ApiError("authentication_required", 401);
  }
}

async function enforceRateLimit({ request, config, journal }) {
  const networkIdentity = clientNetworkIdentity(request.headers);
  const networkHash = await keyedHash(
    config,
    RATE_LIMIT_HASH_DOMAIN,
    networkIdentity,
  );
  try {
    const allowed = await journal.consumeRateLimit({ networkHash });
    if (allowed !== true) throw new ApiError("rate_limited", 429);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("entitlement_store_unavailable", 503);
  }
}

function subscriptionEntitled(evidence, currentTime) {
  if (
    !Number.isSafeInteger(evidence.expiryTime) ||
    evidence.expiryTime <= currentTime
  ) {
    return false;
  }
  return [
    "SUBSCRIPTION_STATE_ACTIVE",
    "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
    "SUBSCRIPTION_STATE_CANCELED",
  ].includes(evidence.subscriptionState);
}

function subscriptionJournalState(subscriptionState, entitled) {
  if (entitled) return "active";
  return subscriptionState === "SUBSCRIPTION_STATE_PENDING"
    ? "pending"
    : "cancelled";
}

function subscriptionStateError(subscriptionState, expiryTime, currentTime) {
  if (subscriptionState === "SUBSCRIPTION_STATE_PENDING") {
    return new ApiError("subscription_pending", 403);
  }
  if (subscriptionState === "SUBSCRIPTION_STATE_PAUSED") {
    return new ApiError("subscription_paused", 403);
  }
  if (subscriptionState === "SUBSCRIPTION_STATE_ON_HOLD") {
    return new ApiError("subscription_on_hold", 403);
  }
  if (
    [
      "SUBSCRIPTION_STATE_CANCELED",
      "SUBSCRIPTION_STATE_EXPIRED",
    ].includes(subscriptionState) ||
    (Number.isSafeInteger(expiryTime) && expiryTime <= currentTime)
  ) {
    return new ApiError("subscription_expired", 403);
  }
  return new ApiError("subscription_not_active", 403);
}

function throwGooglePurchaseError(status) {
  if (status === 404 || status === 410) {
    throw new ApiError("purchase_not_found", 404);
  }
  if (status === 400) {
    throw new ApiError("purchase_invalid", 422);
  }
  if (status === 409 || status === 429 || status >= 500) {
    throw new ApiError("google_play_unavailable", 503);
  }
  // 401/403 normally indicate backend permissions, not proof that the buyer's
  // purchase is invalid. Keep those failures transient on the Android client.
  throw new ApiError("google_play_verification_failed", 502);
}

async function googleAccessToken({
  config,
  fetchImpl,
  now,
  cache,
  updateCache,
}) {
  const cached = cache();
  if (
    cached?.clientEmail === config.serviceAccount.client_email &&
    cached.expiresAt > now() + 60_000
  ) {
    return cached.token;
  }

  const issuedAt = Math.floor(now() / 1000);
  const header = base64Url(new TextEncoder().encode(JSON.stringify({
    alg: "RS256",
    typ: "JWT",
  })));
  const claims = base64Url(new TextEncoder().encode(JSON.stringify({
    iss: config.serviceAccount.client_email,
    scope: GOOGLE_SCOPES,
    aud: "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3500,
  })));
  const unsigned = `${header}.${claims}`;
  let signature;
  try {
    const key = await crypto.subtle.importKey(
      "pkcs8",
      pemToBytes(config.serviceAccount.private_key),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );
    signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(unsigned),
    );
  } catch {
    throw new ApiError("google_credentials_invalid", 503);
  }

  const assertion = `${unsigned}.${base64Url(new Uint8Array(signature))}`;
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new ApiError("google_auth_failed", 502);
  const data = await providerJson(response);
  if (typeof data.access_token !== "string" || !data.access_token) {
    throw new ApiError("google_auth_failed", 502);
  }
  const expiresIn = Number(data.expires_in);
  const lifetime = Number.isFinite(expiresIn) && expiresIn > 0
    ? Math.min(expiresIn, 3600)
    : 3000;
  updateCache({
    token: data.access_token,
    clientEmail: config.serviceAccount.client_email,
    expiresAt: now() + lifetime * 1000,
  });
  return data.access_token;
}

async function keyedHash(config, domain, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.hashSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${domain}\n${value}`),
  );
  return `${config.hashKeyId}.${base64Url(new Uint8Array(signature))}`;
}

async function readLimitedJson(request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) {
    throw new ApiError("body_too_large", 413);
  }
  if (!request.body) throw new ApiError("invalid_json", 400);

  const reader = request.body.getReader();
  const chunks = [];
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      received += value.byteLength;
      if (received > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new ApiError("body_too_large", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not_an_object");
    }
    return parsed;
  } catch {
    throw new ApiError("invalid_json", 400);
  }
}

async function providerJson(response) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > MAX_PROVIDER_RESPONSE_BYTES) {
    throw new ApiError("google_play_response_invalid", 502);
  }
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > MAX_PROVIDER_RESPONSE_BYTES) {
    throw new ApiError("google_play_response_invalid", 502);
  }
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not_an_object");
    }
    return parsed;
  } catch {
    throw new ApiError("google_play_response_invalid", 502);
  }
}

function normalizeCertificateDigest(value) {
  const digest = typeof value === "string"
    ? value.trim().replace(/=+$/u, "")
    : "";
  return /^[A-Za-z0-9_-]{43}$/u.test(digest) ? digest : "";
}

function exactString(value, maxLength) {
  if (typeof value !== "string" || !value || value.length > maxLength) {
    return "";
  }
  return value;
}

function validOpaqueToken(value) {
  return typeof value === "string" &&
    value.length >= 20 &&
    value.length <= 4096 &&
    !/[\u0000-\u001f\u007f]/u.test(value);
}

function clientNetworkIdentity(headers) {
  for (
    const name of [
      "cf-connecting-ip",
      "fly-client-ip",
      "x-real-ip",
      "x-forwarded-for",
    ]
  ) {
    const raw = headers.get(name);
    if (!raw) continue;
    const candidate = raw.split(",")[0].trim().toLowerCase();
    if (candidate && candidate.length <= 128 && !/\s/u.test(candidate)) {
      return `${name}:${candidate}`;
    }
  }
  return "network:unknown";
}

function objectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function googleTimestampOrNull(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const milliseconds = Date.parse(value);
  return Number.isSafeInteger(milliseconds) && milliseconds >= 0
    ? milliseconds
    : null;
}

function millisOrNull(value) {
  if (
    typeof value !== "number" &&
    !(typeof value === "string" && /^\d+$/u.test(value))
  ) {
    return null;
  }
  const milliseconds = Number(value);
  return Number.isSafeInteger(milliseconds) && milliseconds >= 0
    ? milliseconds
    : null;
}

function jsonInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value)
    ? value
    : null;
}

function base64Url(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(
    /=+$/u,
    "",
  );
}

function pemToBytes(pem) {
  const encoded = String(pem).replace(
    /-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/gu,
    "",
  );
  const binary = atob(encoded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function constantTimeEqual(left, right) {
  const first = String(left);
  const second = String(right);
  let mismatch = first.length ^ second.length;
  const length = Math.max(first.length, second.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (first.charCodeAt(index % Math.max(1, first.length)) || 0) ^
      (second.charCodeAt(index % Math.max(1, second.length)) || 0);
  }
  return mismatch === 0;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
