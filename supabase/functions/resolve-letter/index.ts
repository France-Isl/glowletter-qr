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
const AUDIO_BUCKET = "glowletter-shared-audio";
// Подписанная ссылка на аудио живёт 20 минут; приложение обновляет её через
// `?audio=refresh`, который не считается новым открытием письма.
const QR_AUDIO_PLAYBACK_SECONDS = 20 * 60;
const AUDIO_OBJECT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp3|m4a|aac|ogg|wav)$/iu;

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

type QrAudio = { url: string; contentType: string; expiresIn: number };

// Своё аудио QR-письма: отдаётся только у живой открытой ссылки, иначе null —
// письмо открывается и без него.
async function qrAudio(
  admin: ReturnType<typeof createClient>,
  publicId: string,
): Promise<QrAudio | null> {
  try {
    const { data, error } = await admin.rpc("glowletter_qr_link_audio", {
      p_public_id: publicId,
    });
    if (error) return null;
    const row = Array.isArray(data) ? data[0] : data;
    const objectPath = typeof row?.object_path === "string" &&
        AUDIO_OBJECT.test(row.object_path)
      ? row.object_path.toLowerCase()
      : "";
    const expiresAt = Date.parse(String(row?.expires_at || ""));
    if (!objectPath || !Number.isFinite(expiresAt)) return null;
    const remaining = Math.floor((expiresAt - Date.now()) / 1000) - 1;
    if (remaining < 1) return null;
    const seconds = Math.min(QR_AUDIO_PLAYBACK_SECONDS, remaining);
    const { data: signed, error: signError } = await admin.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(objectPath, seconds);
    if (signError || !signed?.signedUrl) return null;
    const mime = typeof row?.mime_type === "string" ? row.mime_type : "";
    return {
      url: signed.signedUrl,
      contentType: /^audio\/[a-z0-9.+-]+$/iu.test(mime) ? mime : "audio/mpeg",
      expiresIn: seconds,
    };
  } catch {
    return null;
  }
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (!originAllowed(origin)) return json(request, { state: "forbidden" }, 403);
  if (request.method === "OPTIONS") {
    const cors = new Headers(headers(request));
    cors.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    // The web client sends the publishable key and, when signed in, a bearer
    // token; a preflight that allows only content-type made every QR letter
    // fail in browsers.
    cors.set("Access-Control-Allow-Headers", "authorization, apikey, content-type");
    cors.set("Access-Control-Max-Age", "600");
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== "GET")
    return json(request, { state: "method_not_allowed" }, 405);

  const publicId =
    new URL(request.url).searchParams.get("public_id")?.trim() || "";
  if (!UUID.test(publicId)) return json(request, { state: "invalid" }, 400);
  const audioRefresh =
    new URL(request.url).searchParams.get("audio") === "refresh";

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
  // «Письмо прочитано»: первое открытие ссылки отмечается у отправителя.
  // Письмо открывается и тогда, когда счётчик обновить не удалось.
  const audio = await qrAudio(admin, publicId);
  if (!audioRefresh) {
    try {
      await admin.rpc("glowletter_record_qr_open", { p_public_id: publicId });
    } catch {
      // ignored on purpose
    }
  }
  return json(request, {
    state: "ready",
    audio,
    senderName: String(row.sender_name || "").slice(0, 36),
    recipientName: String(row.recipient_name || "").slice(0, 36),
    language: ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"].includes(String(row.language))
      ? row.language
      : "ru",
    title: String(row.title || "").slice(0, 80),
    text: String(row.letter_text || "").slice(0, 4000),
    expiresAt: row.expires_at || null,
  });
});
