import { createClient } from "npm:@supabase/supabase-js@2.110.9";
import { createGooglePlayVerificationHandler } from "./google_play.mjs";

function secretKeyFromEnvironment(): string {
  const legacy = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();
  if (legacy) return legacy;

  try {
    const parsed: unknown = JSON.parse(
      Deno.env.get("SUPABASE_SECRET_KEYS") || "{}",
    );
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return "";
    }
    const values = parsed as Record<string, unknown>;
    const preferred = typeof values.default === "string"
      ? values.default.trim()
      : "";
    if (preferred) return preferred;
    return Object.values(values).find((value): value is string => (
      typeof value === "string" && value.trim().length > 0
    ))?.trim() || "";
  } catch {
    return "";
  }
}

const supabaseUrl = (Deno.env.get("SUPABASE_URL") || "").trim();
const secretKey = secretKeyFromEnvironment();
const admin = supabaseUrl && secretKey
  ? createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  : null;

const identity = {
  isConfigured: () => Boolean(admin),
  async authenticate(request: Request) {
    if (!admin) throw new Error("auth_not_configured");
    const authorization = request.headers.get("authorization") || "";
    const match = authorization.match(/^Bearer ([A-Za-z0-9._~-]{40,8192})$/u);
    if (!match) throw new Error("auth_token_missing");
    const { data, error } = await admin.auth.getUser(match[1]);
    if (error || !data.user?.id) throw new Error("auth_token_invalid");
    return { userId: data.user.id };
  },
};

const journal = {
  isConfigured: () => Boolean(admin),
  async consumeRateLimit({ networkHash }: { networkHash: string }) {
    if (!admin) throw new Error("entitlement_store_not_configured");
    const { data, error } = await admin.rpc(
      "glowletter_consume_play_verification_quota",
      { p_network_hash: networkHash },
    );
    if (error || typeof data !== "boolean") {
      throw new Error("rate_limit_store_failed");
    }
    return data;
  },
  async record(record: Record<string, unknown>) {
    if (!admin) throw new Error("entitlement_store_not_configured");
    const { data, error } = await admin.rpc(
      "glowletter_record_play_entitlement",
      {
        p_token_hash: record.tokenHash,
        p_user_id: record.userId,
        p_package_name: record.packageName,
        p_product_id: record.productId,
        p_product_type: record.productType,
        p_state: record.state,
        p_subscription_state: record.subscriptionState,
        p_expiry_time: millisecondsToIso(record.expiryTime),
        p_base_plan_id: record.basePlanId,
        p_offer_id: record.offerId,
        p_auto_renew_enabled: record.autoRenewEnabled,
        p_linked_purchase_token_hash: record.linkedPurchaseTokenHash,
        p_purchase_time: millisecondsToIso(record.purchaseTime),
        p_order_id_hash: record.orderIdHash,
        p_purchase_state_code: record.purchaseStateCode,
        p_consumption_state_code: record.consumptionStateCode,
        p_acknowledgement_state_code: record.acknowledgementStateCode,
        p_integrity_verified: record.integrityVerified,
        p_app_version_code: record.appVersionCode,
        p_certificate_sha256_digest: record.certificateSha256Digest,
        p_is_test_purchase: record.isTestPurchase,
      },
    );
    if (error || data !== true) {
      throw new Error("entitlement_store_write_failed");
    }
  },
};

function millisecondsToIso(value: unknown): string | null {
  const milliseconds = Number(value);
  return Number.isSafeInteger(milliseconds) && milliseconds >= 0
    ? new Date(milliseconds).toISOString()
    : null;
}

const handler = createGooglePlayVerificationHandler({
  environment: (name: string) => Deno.env.get(name),
  fetchImpl: fetch,
  now: () => Date.now(),
  journal,
  identity,
});

Deno.serve(handler);
