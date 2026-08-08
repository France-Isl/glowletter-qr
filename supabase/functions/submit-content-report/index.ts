import { createClient } from "npm:@supabase/supabase-js@2.110.9";

const MAX_REQUEST_BYTES = 12 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const REFERENCE = /^[A-Za-z0-9_-]{16,80}$/u;
const ORIGINS = new Set(["https://france-isl.github.io", "https://bezam.org", "https://www.bezam.org", "https://appassets.androidplatform.net", "capacitor://localhost", "null"]);
const KINDS = new Set(["direct_letter", "moment_letter", "shared_audio"]);
const CATEGORIES = new Set(["adult", "harassment", "hate", "threat", "fraud", "privacy", "spam", "other"]);

function allowedOrigin(origin: string): boolean {
  if (!origin || ORIGINS.has(origin)) return true;
  try { const url = new URL(origin); return url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname); }
  catch { return false; }
}

function responseHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const value: Record<string, string> = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", Vary: "Origin" };
  if (origin && allowedOrigin(origin)) value["Access-Control-Allow-Origin"] = origin;
  return value;
}

function json(request: Request, body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(request) });
}

function clean(value: unknown, max: number): string {
  return String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/gu, " ").trim().slice(0, max);
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) return null;
  const text = await request.text();
  if (!text || new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) return null;
  try { const value = JSON.parse(text); return value && typeof value === "object" && !Array.isArray(value) ? value : null; }
  catch { return null; }
}

async function sourceHash(request: Request, salt: string): Promise<string> {
  const forwarded = clean(request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0], 80);
  const agent = clean(request.headers.get("user-agent"), 300);
  const day = new Date().toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${salt}|${day}|${forwarded}|${agent}`);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((value) => value.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (!allowedOrigin(origin)) return json(request, { state: "forbidden" }, 403);
  if (request.method === "OPTIONS") {
    const headers = new Headers(responseHeaders(request));
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type");
    headers.set("Access-Control-Max-Age", "600");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "POST") return json(request, { state: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const salt = Deno.env.get("REPORT_RATE_LIMIT_SALT") || "";
  if (!supabaseUrl || !serviceKey || salt.length < 32) return json(request, { state: "unavailable" }, 503);
  const body = await readJson(request);
  if (!body) return json(request, { state: "invalid" }, 400);

  const kind = clean(body.contentKind, 32);
  const category = clean(body.category, 24);
  const language = clean(body.language, 2);
  const platform = clean(body.platform, 16);
  const appVersion = clean(body.appVersion, 32) || "unknown";
  const contentRef = clean(body.contentRef, 80);
  const momentPublicId = clean(body.momentPublicId, 36);
  if (!KINDS.has(kind) || !CATEGORIES.has(category) || !["ru", "en", "fr"].includes(language) || !["web", "android_play", "ios"].includes(platform) || !REFERENCE.test(contentRef) || (momentPublicId && !UUID.test(momentPublicId))) return json(request, { state: "invalid" }, 400);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { "X-Client-Info": "glowletter-content-report/1" } } });
  let reporterUserId: string | null = null;
  const authorization = request.headers.get("authorization") || "";
  if (authorization) {
    const token = authorization.match(/^Bearer\s+(.+)$/iu)?.[1] || "";
    if (!token) return json(request, { state: "unauthorized" }, 401);
    const user = await admin.auth.getUser(token);
    if (user.error || !UUID.test(user.data.user?.id || "")) return json(request, { state: "unauthorized" }, 401);
    reporterUserId = user.data.user!.id;
  }

  const hash = await sourceHash(request, salt);
  const result = await admin.rpc("glowletter_create_content_report", {
    p_reporter_user_id: reporterUserId, p_content_kind: kind, p_category: category,
    p_language: language, p_platform: platform, p_app_version: appVersion,
    p_content_ref: contentRef, p_moment_public_id: momentPublicId || null,
    p_audio_attached: body.audioAttached === true, p_sender_snapshot: clean(body.sender, 36),
    p_recipient_snapshot: clean(body.recipient, 36), p_text_snapshot: clean(body.text, 1800),
    p_details: clean(body.details, 500), p_source_hash: hash,
  });
  if (result.error) {
    if (result.error.message === "rate_limited") return json(request, { state: "rate_limited" }, 429);
    return json(request, { state: "unavailable" }, 503);
  }
  return json(request, { state: "accepted" }, 202);
});
