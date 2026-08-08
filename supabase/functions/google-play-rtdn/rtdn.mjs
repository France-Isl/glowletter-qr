const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_PROVIDER_RESPONSE_BYTES = 128 * 1024;
const OIDC_CLOCK_SKEW_SECONDS = 60;
const OIDC_MAX_LIFETIME_SECONDS = 3_700;
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_PUBLISHER_SCOPE =
  "https://www.googleapis.com/auth/androidpublisher";
const PURCHASE_TOKEN_HASH_DOMAIN = "glowletter/google-play/purchase-token/v1";
const ORDER_ID_HASH_DOMAIN = "glowletter/google-play/order-id/v1";
const ACCOUNT_BINDING_DOMAIN = "glowletter/play-account/v1";
const PENDING_REFUND_TOKEN_HASH_DOMAIN =
  "glowletter/google-play/pending-refund-token/v1";
const REFUND_ACCOUNT_HASH_DOMAIN = "glowletter/google-play/refund-account/v1";
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
const SUBSCRIPTION_NOTIFICATION_TYPES = new Set([
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  17,
  18,
  19,
  20,
  22,
]);

class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function createGooglePlayRtdnHandler({
  environment,
  fetchImpl = fetch,
  now = () => Date.now(),
  store,
}) {
  const env = typeof environment === "function"
    ? environment
    : (name) => environment?.[name];
  let googleTokenCache = null;
  let jwksCache = null;

  return async function handleGooglePlayRtdn(request) {
    let claimedEvent = null;
    try {
      if (request.headers.get("origin")) {
        throw new ApiError("browser_origin_not_allowed", 403);
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

      const config = requireConfiguration(env, store);
      await verifyPubSubOidc({
        request,
        config,
        fetchImpl,
        now,
        getCache: () => jwksCache,
        setCache: (value) => {
          jwksCache = value;
        },
      });

      const envelope = await readLimitedJson(request);
      const decoded = decodePubSubEnvelope(envelope, config);
      const payloadHash = await sha256Base64Url(decoded.bytes);
      const notification = parseDeveloperNotification(
        decoded.notification,
        config,
        now(),
      );
      const tokenHash = notification.purchaseToken
        ? await keyedHash(
          config,
          PURCHASE_TOKEN_HASH_DOMAIN,
          `${config.packageName}\n${notification.productId}\n${notification.purchaseToken}`,
        )
        : null;
      const event = {
        messageId: decoded.messageId,
        payloadHash,
        packageName: config.packageName,
        eventTime: notification.eventTime,
        notificationKind: notification.kind,
        notificationType: notification.notificationType,
        tokenHash,
      };

      const claim = await store.begin(event);
      if (claim === "duplicate") return emptyResponse();
      if (claim === "busy") throw new ApiError("event_in_progress", 503);
      if (claim === "payload_mismatch") {
        throw new ApiError("message_id_payload_mismatch", 400);
      }
      if (claim !== "acquired") {
        throw new ApiError("event_store_unavailable", 503);
      }
      claimedEvent = event;

      if (notification.kind === "test") {
        await finishEvent(store, event, "ignored", null);
        return emptyResponse();
      }

      if (notification.kind === "pending_refund_review") {
        const review = await prepareRefundReview({
          notification,
          event,
          config,
        });
        const queued = await store.queueRefundReview(review);
        if (!["queued", "already_queued"].includes(queued)) {
          throw new ApiError("refund_review_queue_unavailable", 503);
        }
        await sendRefundReviewAlert({ config, event, review, fetchImpl });
        const completed = await store.completeRefundReviewAlert({
          messageId: event.messageId,
          payloadHash: event.payloadHash,
        });
        if (completed !== true) {
          throw new ApiError("refund_review_queue_unavailable", 503);
        }
        return emptyResponse();
      }

      const entitlement = normalizeEntitlement(
        await store.find(tokenHash),
        notification,
        config,
      );
      if (!entitlement) {
        await finishEvent(store, event, "unmatched", null);
        return emptyResponse();
      }

      const accessToken = await googleAccessToken({
        config,
        fetchImpl,
        now,
        getCache: () => googleTokenCache,
        setCache: (value) => {
          googleTokenCache = value;
        },
      });
      let evidence = notification.productType === "subs"
        ? await fetchSubscriptionEvidence({
          config,
          notification,
          entitlement,
          accessToken,
          fetchImpl,
          now,
        })
        : await fetchProductEvidence({
          config,
          notification,
          entitlement,
          accessToken,
          fetchImpl,
          now,
        });

      if (
        evidence.state === "verified_pending_ack" &&
        !notification.forceRevoke
      ) {
        evidence = await acknowledgeAndRefresh({
          config,
          notification,
          entitlement,
          evidence,
          accessToken,
          fetchImpl,
          now,
        });
      }

      if (notification.forceRevoke) {
        evidence = {
          ...evidence,
          state: "revoked",
          purchaseStateCode: 1,
        };
      }

      const result = await store.apply({
        ...event,
        productId: notification.productId,
        productType: notification.productType,
        ...evidence,
      });
      if (!["applied", "stale", "unmatched", "duplicate"].includes(result)) {
        throw new ApiError("event_store_unavailable", 503);
      }
      return emptyResponse();
    } catch (error) {
      const apiError = error instanceof ApiError
        ? error
        : new ApiError("internal_error", 500);
      if (claimedEvent) {
        try {
          if (apiError.status >= 500) {
            await finishEvent(
              store,
              claimedEvent,
              "retryable",
              apiError.code,
            );
          } else {
            await finishEvent(store, claimedEvent, "rejected", apiError.code);
            return emptyResponse();
          }
        } catch {
          return json({ error: "event_store_unavailable" }, 503);
        }
      }
      return json({ error: apiError.code }, apiError.status);
    }
  };
}

function requireConfiguration(env, store) {
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
  const pushAudience = String(
    env("GLOWLETTER_PUBSUB_PUSH_AUDIENCE") || "",
  ).trim();
  const pushServiceAccountEmail = String(
    env("GLOWLETTER_PUBSUB_PUSH_SERVICE_ACCOUNT_EMAIL") || "",
  ).trim().toLowerCase();
  const pubSubSubscription = String(
    env("GLOWLETTER_PUBSUB_SUBSCRIPTION") || "",
  ).trim();
  const refundEncryptionKey = String(
    env("GLOWLETTER_REFUND_REVIEW_ENCRYPTION_KEY") || "",
  ).trim();
  const resendApiKey = String(env("RESEND_API_KEY") || "").trim();
  const supportFromEmail = String(env("SUPPORT_FROM_EMAIL") || "").trim();
  const supportToEmail = String(env("SUPPORT_TO_EMAIL") || "").trim();

  let serviceAccount = null;
  try {
    serviceAccount = JSON.parse(
      String(env("GOOGLE_SERVICE_ACCOUNT_JSON") || ""),
    );
  } catch {
    serviceAccount = null;
  }

  let audienceUrl = null;
  try {
    audienceUrl = new URL(pushAudience);
  } catch {
    audienceUrl = null;
  }
  const validProduct = (value) => /^[A-Za-z0-9._-]{1,128}$/u.test(value);
  const valid = /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/u
    .test(packageName) &&
    validProduct(subscriptionProductId) &&
    validProduct(subscriptionBasePlanId) &&
    validProduct(legacyProductId) &&
    subscriptionProductId !== legacyProductId &&
    new TextEncoder().encode(hashSecret).byteLength >= 32 &&
    /^[a-z0-9_-]{1,16}$/u.test(hashKeyId) &&
    audienceUrl?.protocol === "https:" &&
    !audienceUrl.username &&
    !audienceUrl.password &&
    !audienceUrl.search &&
    !audienceUrl.hash &&
    pushAudience.length <= 2_048 &&
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.gserviceaccount\.com$/u.test(
      pushServiceAccountEmail,
    ) &&
    /^projects\/(?:[a-z][a-z0-9-]{4,61}[a-z0-9]|[0-9]{6,32})\/subscriptions\/[A-Za-z][A-Za-z0-9._~+%-]{2,254}$/u
      .test(pubSubSubscription) &&
    /^[A-Za-z0-9_-]{43}$/u.test(refundEncryptionKey) &&
    base64UrlToBytes(refundEncryptionKey).byteLength === 32 &&
    resendApiKey.length >= 20 &&
    resendApiKey.length <= 512 &&
    validEmailHeader(supportFromEmail) &&
    validEmailHeader(supportToEmail) &&
    serviceAccount?.type === "service_account" &&
    typeof serviceAccount.client_email === "string" &&
    serviceAccount.client_email.endsWith(".gserviceaccount.com") &&
    typeof serviceAccount.private_key === "string" &&
    serviceAccount.private_key.includes("BEGIN PRIVATE KEY") &&
    store?.isConfigured?.() === true &&
    [
      "begin",
      "find",
      "finish",
      "apply",
      "queueRefundReview",
      "completeRefundReviewAlert",
    ].every((name) => typeof store[name] === "function");
  if (!valid) throw new ApiError("rtdn_backend_not_configured", 503);
  return {
    packageName,
    subscriptionProductId,
    subscriptionBasePlanId,
    legacyProductId,
    hashSecret,
    hashKeyId,
    pushAudience,
    pushServiceAccountEmail,
    pubSubSubscription,
    refundEncryptionKey,
    resendApiKey,
    supportFromEmail,
    supportToEmail,
    serviceAccount,
  };
}

async function verifyPubSubOidc({
  request,
  config,
  fetchImpl,
  now,
  getCache,
  setCache,
}) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(
    /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/u,
  );
  if (!match || match[1].length > 8_192) {
    throw new ApiError("pubsub_authentication_required", 401);
  }
  const compact = match[1];
  const parts = compact.split(".");
  let header;
  let claims;
  let signature;
  try {
    header = parseJwtPart(parts[0]);
    claims = parseJwtPart(parts[1]);
    signature = base64UrlToBytes(parts[2]);
  } catch {
    throw new ApiError("pubsub_token_invalid", 401);
  }
  if (
    header.alg !== "RS256" ||
    typeof header.kid !== "string" ||
    !/^[A-Za-z0-9_-]{1,256}$/u.test(header.kid) ||
    (header.typ !== undefined && header.typ !== "JWT")
  ) {
    throw new ApiError("pubsub_token_invalid", 401);
  }

  const key = await googleSigningKey({
    kid: header.kid,
    fetchImpl,
    now,
    getCache,
    setCache,
  });
  let verified = false;
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      key,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    verified = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signature,
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
  } catch {
    verified = false;
  }
  if (!verified) throw new ApiError("pubsub_token_invalid", 401);

  const nowSeconds = Math.floor(now() / 1_000);
  const issuedAt = jsonInteger(claims.iat);
  const expiresAt = jsonInteger(claims.exp);
  const notBefore = claims.nbf === undefined ? null : jsonInteger(claims.nbf);
  const issuerValid = claims.iss === "https://accounts.google.com" ||
    claims.iss === "accounts.google.com";
  const claimsValid = issuerValid &&
    claims.aud === config.pushAudience &&
    claims.email === config.pushServiceAccountEmail &&
    claims.email_verified === true &&
    typeof claims.sub === "string" &&
    /^[0-9]{1,32}$/u.test(claims.sub) &&
    issuedAt !== null &&
    expiresAt !== null &&
    expiresAt > nowSeconds - OIDC_CLOCK_SKEW_SECONDS &&
    issuedAt <= nowSeconds + OIDC_CLOCK_SKEW_SECONDS &&
    expiresAt > issuedAt &&
    expiresAt - issuedAt <= OIDC_MAX_LIFETIME_SECONDS &&
    (notBefore === null || notBefore <= nowSeconds + OIDC_CLOCK_SKEW_SECONDS);
  if (!claimsValid) throw new ApiError("pubsub_token_invalid", 401);
}

async function googleSigningKey({
  kid,
  fetchImpl,
  now,
  getCache,
  setCache,
}) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let cache = getCache();
    const forceRefresh = attempt === 1;
    if (!cache || cache.expiresAt <= now() || forceRefresh) {
      const response = await fetchImpl(GOOGLE_JWKS_URL, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new ApiError("google_jwks_unavailable", 503);
      const data = await providerJson(response);
      const keys = Array.isArray(data.keys)
        ? data.keys.filter((key) => (
          key &&
          key.kty === "RSA" &&
          (key.alg === undefined || key.alg === "RS256") &&
          (key.use === undefined || key.use === "sig") &&
          typeof key.kid === "string"
        ))
        : [];
      if (!keys.length) throw new ApiError("google_jwks_invalid", 503);
      const maxAge = cacheMaxAgeSeconds(response.headers.get("cache-control"));
      cache = {
        keys,
        expiresAt: now() + Math.min(Math.max(maxAge, 60), 21_600) * 1_000,
      };
      setCache(cache);
    }
    const found = cache.keys.find((key) => key.kid === kid);
    if (found) return found;
  }
  throw new ApiError("pubsub_token_invalid", 401);
}

function decodePubSubEnvelope(envelope, config) {
  if (envelope.subscription !== config.pubSubSubscription) {
    throw new ApiError("pubsub_subscription_mismatch", 403);
  }
  const message = objectValue(envelope.message);
  const messageId = exactString(message.messageId, 256);
  const data = exactString(message.data, 48 * 1024);
  if (!messageId || /[\u0000-\u001f\u007f]/u.test(messageId) || !data) {
    throw new ApiError("pubsub_envelope_invalid", 400);
  }
  let bytes;
  let notification;
  try {
    bytes = standardBase64ToBytes(data);
    if (!bytes.length || bytes.byteLength > MAX_REQUEST_BYTES) {
      throw new Error("invalid_size");
    }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    notification = JSON.parse(text);
    if (
      !notification || typeof notification !== "object" ||
      Array.isArray(notification)
    ) {
      throw new Error("invalid_notification");
    }
  } catch {
    throw new ApiError("developer_notification_invalid", 400);
  }
  return { messageId, bytes, notification };
}

function parseDeveloperNotification(notification, config, currentTime) {
  if (
    notification.version !== "1.0" ||
    notification.packageName !== config.packageName
  ) {
    throw new ApiError("developer_notification_mismatch", 403);
  }
  const eventTime = millisOrNull(notification.eventTimeMillis);
  if (eventTime === null || eventTime > currentTime + 5 * 60_000) {
    throw new ApiError("developer_notification_time_invalid", 400);
  }
  const kinds = [
    "subscriptionNotification",
    "oneTimeProductNotification",
    "voidedPurchaseNotification",
    "pendingRefundReviewNotification",
    "testNotification",
  ].filter((name) => notification[name] !== undefined);
  if (kinds.length !== 1) {
    throw new ApiError("developer_notification_invalid", 400);
  }

  if (kinds[0] === "subscriptionNotification") {
    const value = objectValue(notification.subscriptionNotification);
    const notificationType = jsonInteger(value.notificationType);
    if (
      value.version !== "1.0" ||
      !SUBSCRIPTION_NOTIFICATION_TYPES.has(notificationType)
    ) {
      throw new ApiError("subscription_notification_invalid", 400);
    }
    if (
      value.subscriptionId !== undefined &&
      value.subscriptionId !== config.subscriptionProductId
    ) {
      throw new ApiError("notification_product_mismatch", 403);
    }
    const purchaseToken = opaqueToken(value.purchaseToken);
    if (!purchaseToken) throw new ApiError("purchase_token_invalid", 400);
    return {
      kind: "subscription",
      eventTime,
      notificationType,
      productType: "subs",
      productId: config.subscriptionProductId,
      purchaseToken,
      forceRevoke: notificationType === 12,
    };
  }

  if (kinds[0] === "oneTimeProductNotification") {
    const value = objectValue(notification.oneTimeProductNotification);
    const notificationType = jsonInteger(value.notificationType);
    if (
      value.version !== "1.0" ||
      ![1, 2].includes(notificationType) ||
      value.sku !== config.legacyProductId
    ) {
      throw new ApiError("product_notification_invalid", 400);
    }
    const purchaseToken = opaqueToken(value.purchaseToken);
    if (!purchaseToken) throw new ApiError("purchase_token_invalid", 400);
    return {
      kind: "one_time_product",
      eventTime,
      notificationType,
      productType: "inapp",
      productId: config.legacyProductId,
      purchaseToken,
      forceRevoke: false,
    };
  }

  if (kinds[0] === "voidedPurchaseNotification") {
    const value = objectValue(notification.voidedPurchaseNotification);
    const productTypeCode = jsonInteger(value.productType);
    const refundType = jsonInteger(value.refundType);
    const purchaseToken = opaqueToken(value.purchaseToken);
    if (
      !purchaseToken || ![1, 2].includes(productTypeCode) ||
      ![1, 2].includes(refundType)
    ) {
      throw new ApiError("voided_notification_invalid", 400);
    }
    const subscription = productTypeCode === 1;
    return {
      kind: "voided_purchase",
      eventTime,
      notificationType: refundType,
      productType: subscription ? "subs" : "inapp",
      productId: subscription
        ? config.subscriptionProductId
        : config.legacyProductId,
      purchaseToken,
      forceRevoke: true,
    };
  }

  if (kinds[0] === "pendingRefundReviewNotification") {
    const value = objectValue(notification.pendingRefundReviewNotification);
    const pendingRefundToken = sensitiveOpaque(value.pendingRefundToken, 4_096);
    const orderId = sensitiveOpaque(value.orderId, 256);
    const refundReason = jsonInteger(value.refundReason);
    const obfuscatedAccountId = value.obfuscatedAccountId === undefined
      ? ""
      : sensitiveOpaque(value.obfuscatedAccountId, 256);
    if (
      value.version !== "1.0" ||
      !pendingRefundToken ||
      !orderId ||
      (value.obfuscatedAccountId !== undefined && !obfuscatedAccountId) ||
      refundReason === null ||
      refundReason <= 0 ||
      refundReason > 32_767
    ) {
      throw new ApiError("pending_refund_notification_invalid", 400);
    }
    return {
      kind: "pending_refund_review",
      eventTime,
      notificationType: refundReason,
      productType: null,
      productId: null,
      purchaseToken: null,
      forceRevoke: false,
      pendingRefundToken,
      orderId,
      obfuscatedAccountId,
      refundReason,
    };
  }

  const value = objectValue(notification.testNotification);
  if (value.version !== "1.0") {
    throw new ApiError("test_notification_invalid", 400);
  }
  return {
    kind: "test",
    eventTime,
    notificationType: null,
    productType: null,
    productId: null,
    purchaseToken: null,
    forceRevoke: false,
  };
}

function normalizeEntitlement(row, notification, config) {
  if (row === null || row === undefined) return null;
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new ApiError("entitlement_store_invalid", 503);
  }
  const userId = String(row.user_id || "").trim().toLowerCase();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u
      .test(userId) ||
    row.package_name !== config.packageName ||
    row.product_id !== notification.productId ||
    row.product_type !== notification.productType
  ) {
    throw new ApiError("entitlement_product_mismatch", 403);
  }
  return { ...row, userId };
}

async function fetchSubscriptionEvidence(context) {
  const url = subscriptionUrl(
    context.config,
    context.notification.purchaseToken,
  );
  const response = await context.fetchImpl(url, {
    headers: { Authorization: `Bearer ${context.accessToken}` },
  });
  if (response.status === 404 || response.status === 410) {
    return missingPurchaseEvidence(context.entitlement, "revoked");
  }
  if (!response.ok) throwGoogleApiError(response.status);
  const purchase = await providerJson(response);
  return await subscriptionEvidence(purchase, context);
}

async function subscriptionEvidence(purchase, context) {
  const state = String(purchase.subscriptionState || "");
  const acknowledgement = String(purchase.acknowledgementState || "");
  if (
    !SUBSCRIPTION_STATES.has(state) ||
    ![
      "ACKNOWLEDGEMENT_STATE_PENDING",
      "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    ].includes(acknowledgement)
  ) {
    throw new ApiError("google_subscription_invalid", 502);
  }
  const expectedBinding = await sha256Base64Url(
    `${ACCOUNT_BINDING_DOMAIN}\n${context.entitlement.userId}`,
  );
  const external = objectValue(purchase.externalAccountIdentifiers);
  if (
    !constantTimeEqual(
      String(external.obfuscatedExternalAccountId || ""),
      expectedBinding,
    )
  ) {
    throw new ApiError("purchase_account_mismatch", 403);
  }

  const lineItems = Array.isArray(purchase.lineItems) ? purchase.lineItems : [];
  const matching = lineItems.filter((item) => (
    item?.productId === context.config.subscriptionProductId &&
    item.offerDetails?.basePlanId === context.config.subscriptionBasePlanId
  )).map((item) => ({
    item,
    expiryTime: googleTimestampOrNull(item.expiryTime),
  })).sort((left, right) => (
    (right.expiryTime ?? -1) - (left.expiryTime ?? -1)
  ));
  const selected = matching[0];
  const mayOmitExpiry = [
    "SUBSCRIPTION_STATE_PENDING",
    "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED",
  ].includes(state);
  if (!selected || (!mayOmitExpiry && selected.expiryTime === null)) {
    throw new ApiError("subscription_product_or_plan_mismatch", 403);
  }
  const autoRenewingPlan = objectValue(selected.item.autoRenewingPlan);
  let autoRenewEnabled = null;
  if (Object.keys(autoRenewingPlan).length) {
    if (typeof autoRenewingPlan.autoRenewEnabled !== "boolean") {
      throw new ApiError("google_subscription_invalid", 502);
    }
    autoRenewEnabled = autoRenewingPlan.autoRenewEnabled;
  } else if (!mayOmitExpiry) {
    throw new ApiError("google_subscription_invalid", 502);
  }

  const acknowledged = acknowledgement ===
    "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";
  const mappedState = mapSubscriptionState(
    state,
    selected.expiryTime,
    context.now(),
    acknowledged,
  );
  const linkedToken = purchase.linkedPurchaseToken;
  let linkedPurchaseTokenHash = null;
  if (linkedToken !== undefined) {
    const validLinked = opaqueToken(linkedToken);
    if (!validLinked) throw new ApiError("google_subscription_invalid", 502);
    linkedPurchaseTokenHash = await keyedHash(
      context.config,
      PURCHASE_TOKEN_HASH_DOMAIN,
      `${context.config.packageName}\n${context.config.subscriptionProductId}\n${validLinked}`,
    );
  }
  const orderId = selected.item.latestSuccessfulOrderId;
  const orderIdHash = typeof orderId === "string" && orderId
    ? await keyedHash(context.config, ORDER_ID_HASH_DOMAIN, orderId)
    : null;
  return {
    state: mappedState,
    subscriptionState: state,
    expiryTime: selected.expiryTime,
    basePlanId: context.config.subscriptionBasePlanId,
    offerId: typeof selected.item.offerDetails?.offerId === "string"
      ? selected.item.offerDetails.offerId
      : null,
    autoRenewEnabled,
    linkedPurchaseTokenHash,
    purchaseTime: googleTimestampOrNull(purchase.startTime),
    orderIdHash,
    purchaseStateCode: ["active", "verified_pending_ack"].includes(mappedState)
      ? 0
      : state === "SUBSCRIPTION_STATE_PENDING"
      ? 2
      : 1,
    consumptionStateCode: 0,
    acknowledgementStateCode: acknowledged ? 1 : 0,
    isTestPurchase: purchase.testPurchase !== undefined,
  };
}

function mapSubscriptionState(state, expiryTime, currentTime, acknowledged) {
  if (
    [
      "SUBSCRIPTION_STATE_ACTIVE",
      "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
      "SUBSCRIPTION_STATE_CANCELED",
    ].includes(state) &&
    Number.isSafeInteger(expiryTime) &&
    expiryTime > currentTime
  ) {
    return acknowledged ? "active" : "verified_pending_ack";
  }
  if (state === "SUBSCRIPTION_STATE_PENDING") return "pending";
  if (state === "SUBSCRIPTION_STATE_PAUSED") return "paused";
  if (state === "SUBSCRIPTION_STATE_ON_HOLD") return "on_hold";
  if (state === "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED") {
    return "cancelled";
  }
  return "expired";
}

async function fetchProductEvidence(context) {
  const url = productV2Url(context.config, context.notification.purchaseToken);
  const response = await context.fetchImpl(url, {
    headers: { Authorization: `Bearer ${context.accessToken}` },
  });
  if (response.status === 404 || response.status === 410) {
    return missingPurchaseEvidence(context.entitlement, "revoked");
  }
  if (!response.ok) throwGoogleApiError(response.status);
  const purchase = await providerJson(response);
  return await productEvidence(purchase, context);
}

async function productEvidence(purchase, context) {
  const purchaseState = String(
    objectValue(purchase.purchaseStateContext).purchaseState || "",
  );
  const acknowledgement = String(purchase.acknowledgementState || "");
  if (
    !["PURCHASED", "CANCELLED", "PENDING"].includes(purchaseState) ||
    ![
      "ACKNOWLEDGEMENT_STATE_PENDING",
      "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    ].includes(acknowledgement)
  ) {
    throw new ApiError("google_product_invalid", 502);
  }
  const items = Array.isArray(purchase.productLineItem)
    ? purchase.productLineItem.filter((item) => (
      item?.productId === context.config.legacyProductId
    ))
    : [];
  if (items.length !== 1) {
    throw new ApiError("product_mismatch", 403);
  }
  const offer = objectValue(items[0].productOfferDetails);
  const consumption = String(offer.consumptionState || "");
  if (
    ![
      "CONSUMPTION_STATE_YET_TO_BE_CONSUMED",
      "CONSUMPTION_STATE_CONSUMED",
    ].includes(consumption)
  ) {
    throw new ApiError("google_product_invalid", 502);
  }
  const expectedBinding = await sha256Base64Url(
    `${ACCOUNT_BINDING_DOMAIN}\n${context.entitlement.userId}`,
  );
  if (
    purchase.obfuscatedExternalAccountId !== undefined &&
    !constantTimeEqual(
      String(purchase.obfuscatedExternalAccountId || ""),
      expectedBinding,
    )
  ) {
    throw new ApiError("purchase_account_mismatch", 403);
  }
  const acknowledged = acknowledgement ===
    "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";
  let state = "cancelled";
  if (purchaseState === "PENDING") state = "pending";
  if (consumption === "CONSUMPTION_STATE_CONSUMED") state = "consumed";
  if (
    purchaseState === "PURCHASED" &&
    consumption === "CONSUMPTION_STATE_YET_TO_BE_CONSUMED"
  ) {
    state = acknowledged ? "active" : "verified_pending_ack";
  }
  if (jsonInteger(offer.refundableQuantity) === 0) state = "revoked";
  const orderIdHash = typeof purchase.orderId === "string" && purchase.orderId
    ? await keyedHash(context.config, ORDER_ID_HASH_DOMAIN, purchase.orderId)
    : null;
  return {
    state,
    subscriptionState: null,
    expiryTime: null,
    basePlanId: null,
    offerId: typeof offer.offerId === "string" ? offer.offerId : null,
    autoRenewEnabled: null,
    linkedPurchaseTokenHash: null,
    purchaseTime: googleTimestampOrNull(purchase.purchaseCompletionTime),
    orderIdHash,
    purchaseStateCode: purchaseState === "PURCHASED"
      ? 0
      : purchaseState === "PENDING"
      ? 2
      : 1,
    consumptionStateCode: consumption === "CONSUMPTION_STATE_CONSUMED" ? 1 : 0,
    acknowledgementStateCode: acknowledged ? 1 : 0,
    isTestPurchase: purchase.testPurchaseContext !== undefined,
  };
}

async function acknowledgeAndRefresh(context) {
  const token = context.notification.purchaseToken;
  const url = context.notification.productType === "subs"
    ? `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${
      encodeURIComponent(context.config.packageName)
    }/purchases/subscriptions/${
      encodeURIComponent(context.config.subscriptionProductId)
    }/tokens/${encodeURIComponent(token)}:acknowledge`
    : `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${
      encodeURIComponent(context.config.packageName)
    }/purchases/products/${
      encodeURIComponent(context.config.legacyProductId)
    }/tokens/${encodeURIComponent(token)}:acknowledge`;
  const response = await context.fetchImpl(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ developerPayload: "glowletter-rtdn-v1" }),
  });
  if (!response.ok && ![400, 409].includes(response.status)) {
    throwGoogleApiError(response.status);
  }
  const refreshed = context.notification.productType === "subs"
    ? await fetchSubscriptionEvidence(context)
    : await fetchProductEvidence(context);
  if (refreshed.acknowledgementStateCode !== 1) {
    throw new ApiError("acknowledgement_failed", 503);
  }
  return refreshed;
}

function missingPurchaseEvidence(entitlement, state) {
  return {
    state,
    subscriptionState: entitlement.product_type === "subs"
      ? entitlement.subscription_state
      : null,
    expiryTime: timestampToMillis(entitlement.expiry_time),
    basePlanId: entitlement.product_type === "subs"
      ? entitlement.base_plan_id
      : null,
    offerId: entitlement.offer_id || null,
    autoRenewEnabled: entitlement.auto_renew_enabled ?? null,
    linkedPurchaseTokenHash: entitlement.linked_purchase_token_hash || null,
    purchaseTime: timestampToMillis(entitlement.purchase_time),
    orderIdHash: entitlement.order_id_hash || null,
    purchaseStateCode: 1,
    consumptionStateCode: jsonInteger(entitlement.consumption_state_code) ?? 0,
    acknowledgementStateCode:
      jsonInteger(entitlement.acknowledgement_state_code) ?? 0,
    isTestPurchase: entitlement.is_test_purchase === true,
  };
}

async function prepareRefundReview({ notification, event, config }) {
  const pendingRefundTokenHash = await keyedHash(
    config,
    PENDING_REFUND_TOKEN_HASH_DOMAIN,
    notification.pendingRefundToken,
  );
  const orderIdHash = await keyedHash(
    config,
    ORDER_ID_HASH_DOMAIN,
    notification.orderId,
  );
  const accountBindingHash = notification.obfuscatedAccountId
    ? await keyedHash(
      config,
      REFUND_ACCOUNT_HASH_DOMAIN,
      notification.obfuscatedAccountId,
    )
    : null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    "raw",
    base64UrlToBytes(config.refundEncryptionKey),
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const additionalData = new TextEncoder().encode(
    `${event.messageId}\n${event.payloadHash}`,
  );
  const plaintext = new TextEncoder().encode(JSON.stringify({
    pendingRefundToken: notification.pendingRefundToken,
    orderId: notification.orderId,
  }));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData, tagLength: 128 },
    key,
    plaintext,
  );
  return {
    messageId: event.messageId,
    payloadHash: event.payloadHash,
    pendingRefundTokenHash,
    orderIdHash,
    accountBindingHash,
    refundReason: notification.refundReason,
    encryptedDetails: base64Url(new Uint8Array(ciphertext)),
    encryptionIv: base64Url(iv),
    eventTime: notification.eventTime,
    reviewDueAt: notification.eventTime + 24 * 60 * 60_000,
  };
}

async function sendRefundReviewAlert({ config, event, review, fetchImpl }) {
  const idempotencyHash = await sha256Base64Url(
    new TextEncoder().encode(`${event.messageId}\n${event.payloadHash}`),
  );
  const text = [
    "URGENT: Google Play pending refund review",
    "",
    `Pub/Sub message: ${event.messageId}`,
    `Received event time: ${new Date(review.eventTime).toISOString()}`,
    `Google review deadline: ${new Date(review.reviewDueAt).toISOString()}`,
    `Refund reason code: ${review.refundReason}`,
    "",
    "Open the private GlowLetter Play refund-review queue and Google Play Console.",
    "Evaluate the chargeback and submit ReviewRefund within 24 hours.",
    "No purchase token, pending-refund token, order id, or account id is included in this email.",
  ].join("\n");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `glowletter-refund-${idempotencyHash}`,
      },
      body: JSON.stringify({
        from: config.supportFromEmail,
        to: [config.supportToEmail],
        subject: `URGENT · Google Play refund review · ${event.messageId}`,
        text,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new ApiError("refund_review_alert_failed", 503);
    }
    await response.body?.cancel();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("refund_review_alert_failed", 503);
  } finally {
    clearTimeout(timeout);
  }
}

async function finishEvent(store, event, status, errorCode) {
  const result = await store.finish({
    messageId: event.messageId,
    payloadHash: event.payloadHash,
    status,
    errorCode,
  });
  if (result !== true) throw new ApiError("event_store_unavailable", 503);
}

function subscriptionUrl(config, token) {
  return `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${
    encodeURIComponent(config.packageName)
  }/purchases/subscriptionsv2/tokens/${encodeURIComponent(token)}`;
}

function productV2Url(config, token) {
  return `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${
    encodeURIComponent(config.packageName)
  }/purchases/productsv2/tokens/${encodeURIComponent(token)}`;
}

function throwGoogleApiError(status) {
  if (status === 429 || status >= 500) {
    throw new ApiError("google_play_unavailable", 503);
  }
  if (status === 401 || status === 403) {
    throw new ApiError("google_play_configuration_error", 503);
  }
  throw new ApiError("google_play_response_invalid", 502);
}

async function googleAccessToken({
  config,
  fetchImpl,
  now,
  getCache,
  setCache,
}) {
  const cached = getCache();
  if (
    cached?.clientEmail === config.serviceAccount.client_email &&
    cached.expiresAt > now() + 60_000
  ) {
    return cached.token;
  }
  const issuedAt = Math.floor(now() / 1_000);
  const header = base64Url(new TextEncoder().encode(JSON.stringify({
    alg: "RS256",
    typ: "JWT",
  })));
  const claims = base64Url(new TextEncoder().encode(JSON.stringify({
    iss: config.serviceAccount.client_email,
    scope: GOOGLE_PUBLISHER_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: issuedAt,
    exp: issuedAt + 3_500,
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
  const response = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${base64Url(new Uint8Array(signature))}`,
    }),
  });
  if (!response.ok) throw new ApiError("google_auth_failed", 503);
  const data = await providerJson(response);
  if (typeof data.access_token !== "string" || !data.access_token) {
    throw new ApiError("google_auth_failed", 503);
  }
  const expiresIn = Number(data.expires_in);
  const lifetime = Number.isFinite(expiresIn) && expiresIn > 0
    ? Math.min(expiresIn, 3_600)
    : 3_000;
  setCache({
    token: data.access_token,
    clientEmail: config.serviceAccount.client_email,
    expiresAt: now() + lifetime * 1_000,
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

export async function sha256Base64Url(value) {
  const bytes = typeof value === "string"
    ? new TextEncoder().encode(value)
    : value;
  return base64Url(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
  );
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
    throw new ApiError("google_response_invalid", 502);
  }
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > MAX_PROVIDER_RESPONSE_BYTES) {
    throw new ApiError("google_response_invalid", 502);
  }
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not_an_object");
    }
    return parsed;
  } catch {
    throw new ApiError("google_response_invalid", 502);
  }
}

function parseJwtPart(value) {
  const parsed = JSON.parse(
    new TextDecoder("utf-8", { fatal: true }).decode(base64UrlToBytes(value)),
  );
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("invalid_jwt_part");
  }
  return parsed;
}

function standardBase64ToBytes(value) {
  if (!/^[A-Za-z0-9+/]*={0,2}$/u.test(value) || value.length % 4 === 1) {
    throw new Error("invalid_base64");
  }
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function base64UrlToBytes(value) {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) throw new Error("invalid_base64url");
  const standard = value.replaceAll("-", "+").replaceAll("_", "/");
  return standardBase64ToBytes(
    standard.padEnd(Math.ceil(standard.length / 4) * 4, "="),
  );
}

function base64Url(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 8_192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8_192));
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

function objectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function exactString(value, maxLength) {
  return typeof value === "string" && value && value.length <= maxLength
    ? value
    : "";
}

function opaqueToken(value) {
  return typeof value === "string" &&
      value.length >= 20 &&
      value.length <= 4_096 &&
      !/[\u0000-\u001f\u007f]/u.test(value)
    ? value
    : "";
}

function sensitiveOpaque(value, maxLength) {
  return typeof value === "string" &&
      value.length >= 1 &&
      value.length <= maxLength &&
      !/[\u0000-\u001f\u007f]/u.test(value)
    ? value
    : "";
}

function validEmailHeader(value) {
  if (
    typeof value !== "string" ||
    !value ||
    value.length > 320 ||
    /[\r\n]/u.test(value)
  ) {
    return false;
  }
  return /^(?:[^<>]{1,80}\s<)?[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}>?$/u
    .test(value);
}

function jsonInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value)
    ? value
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

function googleTimestampOrNull(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const milliseconds = Date.parse(value);
  return Number.isSafeInteger(milliseconds) && milliseconds >= 0
    ? milliseconds
    : null;
}

function timestampToMillis(value) {
  if (typeof value !== "string" || !value) return null;
  const milliseconds = Date.parse(value);
  return Number.isSafeInteger(milliseconds) && milliseconds >= 0
    ? milliseconds
    : null;
}

function cacheMaxAgeSeconds(value) {
  const match = String(value || "").match(/(?:^|,)\s*max-age=(\d+)/iu);
  const seconds = match ? Number(match[1]) : 300;
  return Number.isSafeInteger(seconds) && seconds >= 0 ? seconds : 300;
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

function emptyResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
