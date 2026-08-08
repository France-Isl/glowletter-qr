import { createClient } from "npm:@supabase/supabase-js@2.110.9";
import { createGooglePlayRtdnHandler } from "./rtdn.mjs";

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

const store = {
  isConfigured: () => Boolean(admin),
  async begin(event: Record<string, unknown>) {
    if (!admin) throw new Error("rtdn_store_not_configured");
    const { data, error } = await admin.rpc(
      "glowletter_begin_play_rtdn_event",
      {
        p_event: {
          message_id: event.messageId,
          payload_hash: event.payloadHash,
          package_name: event.packageName,
          event_time: millisecondsToIso(event.eventTime),
          notification_kind: event.notificationKind,
          notification_type: event.notificationType,
          token_hash: event.tokenHash,
        },
      },
    );
    if (error || typeof data !== "string") {
      throw new Error("rtdn_begin_failed");
    }
    return data;
  },
  async find(tokenHash: string) {
    if (!admin) throw new Error("rtdn_store_not_configured");
    const { data, error } = await admin.rpc(
      "glowletter_get_play_entitlement_for_rtdn",
      { p_token_hash: tokenHash },
    );
    if (error || !Array.isArray(data)) {
      throw new Error("rtdn_lookup_failed");
    }
    if (data.length > 1) throw new Error("rtdn_lookup_ambiguous");
    return data[0] || null;
  },
  async finish(result: Record<string, unknown>) {
    if (!admin) throw new Error("rtdn_store_not_configured");
    const { data, error } = await admin.rpc(
      "glowletter_finish_play_rtdn_event",
      {
        p_result: {
          message_id: result.messageId,
          payload_hash: result.payloadHash,
          status: result.status,
          error_code: result.errorCode,
        },
      },
    );
    if (error || typeof data !== "boolean") {
      throw new Error("rtdn_finish_failed");
    }
    return data;
  },
  async queueRefundReview(review: Record<string, unknown>) {
    if (!admin) throw new Error("rtdn_store_not_configured");
    const { data, error } = await admin.rpc(
      "glowletter_queue_play_refund_review",
      {
        p_review: {
          message_id: review.messageId,
          payload_hash: review.payloadHash,
          pending_refund_token_hash: review.pendingRefundTokenHash,
          order_id_hash: review.orderIdHash,
          account_binding_hash: review.accountBindingHash,
          refund_reason: review.refundReason,
          encrypted_details: review.encryptedDetails,
          encryption_iv: review.encryptionIv,
          event_time: millisecondsToIso(review.eventTime),
          review_due_at: millisecondsToIso(review.reviewDueAt),
        },
      },
    );
    if (error || typeof data !== "string") {
      throw new Error("refund_review_queue_failed");
    }
    return data;
  },
  async completeRefundReviewAlert(result: Record<string, unknown>) {
    if (!admin) throw new Error("rtdn_store_not_configured");
    const { data, error } = await admin.rpc(
      "glowletter_complete_play_refund_review_alert",
      {
        p_result: {
          message_id: result.messageId,
          payload_hash: result.payloadHash,
        },
      },
    );
    if (error || typeof data !== "boolean") {
      throw new Error("refund_review_alert_complete_failed");
    }
    return data;
  },
  async apply(update: Record<string, unknown>) {
    if (!admin) throw new Error("rtdn_store_not_configured");
    const { data, error } = await admin.rpc(
      "glowletter_apply_play_rtdn_event",
      {
        p_update: {
          message_id: update.messageId,
          payload_hash: update.payloadHash,
          token_hash: update.tokenHash,
          event_time: millisecondsToIso(update.eventTime),
          notification_type: update.notificationType,
          package_name: update.packageName,
          product_id: update.productId,
          product_type: update.productType,
          state: update.state,
          subscription_state: update.subscriptionState,
          expiry_time: millisecondsToIso(update.expiryTime),
          base_plan_id: update.basePlanId,
          offer_id: update.offerId,
          auto_renew_enabled: update.autoRenewEnabled,
          linked_purchase_token_hash: update.linkedPurchaseTokenHash,
          purchase_time: millisecondsToIso(update.purchaseTime),
          order_id_hash: update.orderIdHash,
          purchase_state_code: update.purchaseStateCode,
          consumption_state_code: update.consumptionStateCode,
          acknowledgement_state_code: update.acknowledgementStateCode,
          is_test_purchase: update.isTestPurchase,
        },
      },
    );
    if (error || typeof data !== "string") {
      throw new Error("rtdn_apply_failed");
    }
    return data;
  },
};

function millisecondsToIso(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const milliseconds = Number(value);
  return Number.isSafeInteger(milliseconds) && milliseconds >= 0
    ? new Date(milliseconds).toISOString()
    : null;
}

const handler = createGooglePlayRtdnHandler({
  environment: (name: string) => Deno.env.get(name),
  fetchImpl: fetch,
  now: () => Date.now(),
  store,
});

Deno.serve(handler);
