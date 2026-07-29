import { createClient } from "npm:@supabase/supabase-js@2.110.9";

const ALLOWED_ORIGINS = new Set([
  "https://france-isl.github.io",
  "https://appassets.androidplatform.net",
  "null"
]);
const SUPPORT_CATEGORIES = new Set([
  "technical",
  "account",
  "subscription",
  "content",
  "feedback",
  "other"
]);
const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical problem",
  account: "Account and sign-in",
  subscription: "Subscription",
  content: "Letters and content",
  feedback: "Idea or feedback",
  other: "Other"
};
const SUPPORT_LANGUAGES = new Set(["ru", "en", "fr"]);
const SUPPORT_PLATFORMS = new Set(["web", "android", "ios"]);
const MAX_REQUEST_BYTES = 12 * 1024;
const DEFAULT_SUPPORT_TO_EMAIL = "ggooglov9@gmail.com";

type TicketRow = {
  ticket_id?: unknown;
  support_id?: unknown;
  created_at?: unknown;
};

function isAllowedOrigin(origin: string): boolean {
  if (!origin || ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const value = new URL(origin);
    return value.protocol === "http:"
      && (value.hostname === "localhost" || value.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

function responseHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin"
  };
  if (origin && isAllowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(request: Request, body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(request) });
}

async function settle<T>(operation: PromiseLike<T>): Promise<T | null> {
  try {
    return await operation;
  } catch {
    return null;
  }
}

async function readLimitedJson(request: Request): Promise<Record<string, unknown> | null> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) return null;
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      received += value.byteLength;
      if (received > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return null;
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
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function normalizedEmail(value: unknown): string {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (email.length < 3 || email.length > 254) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) ? email : "";
}

function normalizedMessage(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function normalizedAppVersion(value: unknown): string {
  if (typeof value !== "string") return "";
  const version = value.normalize("NFKC").trim();
  return /^[A-Za-z0-9][A-Za-z0-9._+ -]{0,31}$/u.test(version) ? version : "";
}

function validMailHeader(value: string): boolean {
  return value.length > 0
    && value.length <= 320
    && !/[\r\n]/u.test(value)
    && /@/u.test(value);
}

function ticketRow(data: unknown): TicketRow | null {
  const value = Array.isArray(data) ? data[0] : data;
  return value && typeof value === "object" ? value as TicketRow : null;
}

async function sendSupportEmail(details: {
  ticketId: string;
  supportId: string;
  createdAt: string;
  accountEmail: string;
  category: string;
  message: string;
  language: string;
  platform: string;
  appVersion: string;
}): Promise<{ attempted: boolean; sent: boolean; providerId: string }> {
  const apiKey = (Deno.env.get("RESEND_API_KEY") || "").trim();
  const from = (Deno.env.get("SUPPORT_FROM_EMAIL") || "").trim();
  const to = normalizedEmail(Deno.env.get("SUPPORT_TO_EMAIL") || DEFAULT_SUPPORT_TO_EMAIL);
  if (!apiKey || !validMailHeader(from) || !to) {
    return { attempted: false, sent: false, providerId: "" };
  }

  const categoryLabel = CATEGORY_LABELS[details.category] || CATEGORY_LABELS.other;
  const text = [
    "New GlowLetter support request",
    "",
    `Ticket: ${details.ticketId}`,
    `Created: ${details.createdAt}`,
    `Category: ${categoryLabel}`,
    `Language: ${details.language}`,
    `Platform: ${details.platform}`,
    `App version: ${details.appVersion}`,
    `Support ID: ${details.supportId}`,
    `Account email: ${details.accountEmail}`,
    "",
    "Message:",
    details.message
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: details.accountEmail,
        subject: `GlowLetter support · ${categoryLabel} · ${details.supportId}`,
        text
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      await response.body?.cancel();
      return { attempted: true, sent: false, providerId: "" };
    }

    let providerId = "";
    try {
      const payload: unknown = await response.json();
      if (payload && typeof payload === "object" && "id" in payload) {
        const value = String((payload as { id?: unknown }).id || "").trim();
        if (value.length <= 200 && !/[\r\n]/u.test(value)) providerId = value;
      }
    } catch {
      // A successful provider response without JSON still means the email was accepted.
    }
    return { attempted: true, sent: true, providerId };
  } catch {
    return { attempted: true, sent: false, providerId: "" };
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async request => {
  const origin = request.headers.get("origin") || "";
  if (!isAllowedOrigin(origin)) return json(request, { error: "origin_not_allowed" }, 403);

  if (request.method === "OPTIONS") {
    const headers = new Headers(responseHeaders(request));
    headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type, x-client-info");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "POST") return json(request, { error: "method_not_allowed" }, 405);
  if (!/^application\/json(?:\s*;|$)/iu.test(request.headers.get("content-type") || "")) {
    return json(request, { error: "content_type_required" }, 415);
  }

  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/iu);
  if (!match) return json(request, { error: "authentication_required" }, 401);

  const body = await readLimitedJson(request);
  if (!body) return json(request, { error: "invalid_request" }, 400);

  const category = typeof body.category === "string" ? body.category.trim().toLowerCase() : "";
  const message = normalizedMessage(body.message);
  const language = typeof body.language === "string" ? body.language.trim().toLowerCase() : "";
  const platform = typeof body.platform === "string" ? body.platform.trim().toLowerCase() : "";
  const appVersion = normalizedAppVersion(body.app_version);
  if (!SUPPORT_CATEGORIES.has(category)) return json(request, { error: "invalid_category" }, 400);
  if (message.length < 20 || message.length > 2000) {
    return json(request, { error: "invalid_message" }, 400);
  }
  if (!SUPPORT_LANGUAGES.has(language)) return json(request, { error: "invalid_language" }, 400);
  if (!SUPPORT_PLATFORMS.has(platform)) return json(request, { error: "invalid_platform" }, 400);
  if (!appVersion) return json(request, { error: "invalid_app_version" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(request, { error: "support_unavailable" }, 503);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const userResult = await settle(authClient.auth.getUser(match[1]));
  if (!userResult) return json(request, { error: "support_unavailable" }, 503);
  const { data: userData, error: userError } = userResult;
  const user = userData.user;
  const accountEmail = normalizedEmail(user?.email);
  if (userError || !user || user.is_anonymous === true || !accountEmail) {
    return json(request, { error: "invalid_session" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const createResult = await settle(adminClient.rpc(
    "glowletter_create_support_ticket",
    {
      p_user_id: user.id,
      p_contact_email: accountEmail,
      p_category: category,
      p_message: message,
      p_language: language,
      p_platform: platform,
      p_app_version: appVersion
    }
  ));

  if (!createResult) return json(request, { error: "support_unavailable" }, 503);
  const { data: createdData, error: createError } = createResult;

  if (createError) {
    const rateLimited = createError.code === "P0001"
      && String(createError.message || "").includes("support_rate_limited");
    if (rateLimited) return json(request, { error: "rate_limited" }, 429);
    return json(request, { error: "support_unavailable" }, 503);
  }

  const created = ticketRow(createdData);
  const ticketId = typeof created?.ticket_id === "string" ? created.ticket_id : "";
  const supportId = typeof created?.support_id === "string" ? created.support_id : "";
  const createdAt = typeof created?.created_at === "string" ? created.created_at : "";
  if (!ticketId || !supportId || !createdAt) {
    return json(request, { accepted: true, emailSent: false }, 202);
  }

  const delivery = await sendSupportEmail({
    ticketId,
    supportId,
    createdAt,
    accountEmail,
    category,
    message,
    language,
    platform,
    appVersion
  });

  if (delivery.attempted) {
    try {
      await adminClient.rpc("glowletter_record_support_email_result", {
        p_ticket_id: ticketId,
        p_email_sent: delivery.sent,
        p_provider_id: delivery.providerId || null
      });
    } catch {
      // The request itself remains safely stored even if delivery metadata
      // cannot be updated during a transient database outage.
    }
  }

  return json(request, { accepted: true, emailSent: delivery.sent }, 202);
});
