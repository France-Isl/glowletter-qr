import { createClient } from "npm:@supabase/supabase-js@2.110.9";

const ALLOWED_ORIGINS = new Set([
  "https://france-isl.github.io",
  "https://bezam.org",
  "https://www.bezam.org",
  "https://appassets.androidplatform.net",
  "capacitor://localhost",
]);
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function originAllowed(origin: string): boolean {
  if (!origin || ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const parsed = new URL(origin);
    return (
      parsed.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function headers(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const result: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    Vary: "Origin",
  };
  if (origin && originAllowed(origin))
    result["Access-Control-Allow-Origin"] = origin;
  return result;
}

function json(
  request: Request,
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: headers(request),
  });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (!originAllowed(origin)) return json(request, { state: "forbidden" }, 403);
  if (request.method === "OPTIONS") {
    const cors = new Headers(headers(request));
    cors.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    cors.set("Access-Control-Allow-Headers", "content-type");
    cors.set("Access-Control-Max-Age", "600");
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== "GET")
    return json(request, { state: "method_not_allowed" }, 405);

  const publicId =
    new URL(request.url).searchParams.get("public_id")?.trim() || "";
  if (!UUID.test(publicId)) return json(request, { state: "invalid" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !serviceKey)
    return json(request, { state: "unavailable" }, 503);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "glowletter-resolve-letter/1" } },
  });
  const { data, error } = await admin.rpc("glowletter_resolve_qr_link", {
    p_public_id: publicId,
  });
  if (error) {
    console.error("resolve-letter failed", { code: error.code });
    return json(request, { state: "unavailable" }, 503);
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return json(request, { state: "not_found" }, 404);

  const state = String(row.state || "not_found");
  if (state !== "ready") {
    return json(request, {
      state,
      unlockAt: state === "locked" ? row.unlock_at || null : null,
      expiresAt: row.expires_at || null,
    });
  }
  return json(request, {
    state: "ready",
    senderName: String(row.sender_name || "").slice(0, 36),
    recipientName: String(row.recipient_name || "").slice(0, 36),
    language: ["ru", "en", "fr"].includes(String(row.language))
      ? row.language
      : "ru",
    title: String(row.title || "").slice(0, 80),
    text: String(row.letter_text || "").slice(0, 4000),
    expiresAt: row.expires_at || null,
  });
});
