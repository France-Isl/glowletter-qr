import { createClient } from "npm:@supabase/supabase-js@2.110.9";

// Игра «Насколько хорошо ты меня знаешь?». Игрок открывает ссылку без входа:
// GET отдаёт имена и номера вопросов (без ответов), POST принимает ответы,
// а база считает совпадения и возвращает верные варианты. Источник, как в
// reply-letter, — хеш адреса и браузера за день; лимиты живут в
// glowletter_submit_quiz.
const MAX_REQUEST_BYTES = 4 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const ORIGINS = new Set(["https://france-isl.github.io", "https://bezam.org", "https://www.bezam.org", "https://appassets.androidplatform.net", "capacitor://localhost", "null"]);
const LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];

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
  return String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, max);
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
  const forwardedChain = (request.headers.get("x-forwarded-for") || "").split(",").map((part) => part.trim()).filter(Boolean);
  const forwarded = clean(request.headers.get("cf-connecting-ip") || forwardedChain[forwardedChain.length - 1], 80);
  const agent = clean(request.headers.get("user-agent"), 300);
  const day = new Date().toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${salt}|quiz|${day}|${forwarded}|${agent}`);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((value) => value.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (!allowedOrigin(origin)) return json(request, { state: "forbidden" }, 403);
  if (request.method === "OPTIONS") {
    const headers = new Headers(responseHeaders(request));
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type");
    headers.set("Access-Control-Max-Age", "600");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "GET" && request.method !== "POST") return json(request, { state: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const salt = Deno.env.get("REPORT_RATE_LIMIT_SALT") || "";
  if (!supabaseUrl || !serviceKey || salt.length < 32) return json(request, { state: "unavailable" }, 503);
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { "X-Client-Info": "glowletter-couple-quiz/1" } } });

  if (request.method === "GET") {
    const publicId = clean(new URL(request.url).searchParams.get("id"), 36).toLowerCase();
    if (!UUID.test(publicId)) return json(request, { state: "invalid" }, 400);
    const result = await admin.rpc("glowletter_get_quiz", { p_public_id: publicId });
    if (result.error) return json(request, { state: "unavailable" }, 503);
    const row = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!row) return json(request, { state: "not_found" }, 404);
    return json(request, { state: "ready", senderName: row.sender_name, recipientName: row.recipient_name || "", language: row.language || "", questions: row.question_ids || [] });
  }

  const body = await readJson(request);
  if (!body) return json(request, { state: "invalid" }, 400);
  const publicId = clean(body.publicId, 36).toLowerCase();
  const name = clean(body.name, 36);
  const language = clean(body.language, 3).toLowerCase();
  const answers = Array.isArray(body.answers) ? body.answers : null;
  if (!UUID.test(publicId) || !answers || answers.length < 5 || answers.length > 20 || !answers.every((value) => Number.isInteger(value) && value >= 0 && value <= 3)) {
    return json(request, { state: "invalid" }, 400);
  }
  const result = await admin.rpc("glowletter_submit_quiz", {
    p_public_id: publicId,
    p_player_name: name || null,
    p_answers: answers,
    p_language: LANGUAGES.includes(language) ? language : null,
    p_source_hash: await sourceHash(request, salt),
  });
  if (result.error) {
    const reason = String(result.error.message || "");
    if (reason === "rate_limited") return json(request, { state: "rate_limited" }, 429);
    if (reason === "not_found") return json(request, { state: "not_found" }, 404);
    if (reason === "forbidden") return json(request, { state: "forbidden_text" }, 400);
    if (reason === "invalid") return json(request, { state: "invalid" }, 400);
    return json(request, { state: "unavailable" }, 503);
  }
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  return json(request, { state: "accepted", score: row?.score ?? 0, total: row?.total ?? answers.length, correct: row?.correct ?? [] });
});
