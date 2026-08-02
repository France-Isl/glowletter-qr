import { createClient } from "npm:@supabase/supabase-js@2.110.9";

const BUCKET = "glowletter-shared-audio";
const MAX_AUDIO_BYTES = 12 * 1024 * 1024;
const MAX_REQUEST_BYTES = 8 * 1024;
const MAX_PLAYBACK_SECONDS = 5 * 60;

const ALLOWED_ORIGINS = new Set([
  "https://france-isl.github.io",
  "https://bezam.org",
  "https://www.bezam.org",
  "https://appassets.androidplatform.net",
  "capacitor://localhost",
  // The current iOS WKWebView loads bundled files and therefore sends a null
  // origin. Authentication or the opaque share token remains mandatory.
  "null",
]);

const MIME_ALIASES = new Map<string, string>([
  ["audio/mpeg", "audio/mpeg"],
  ["audio/mp3", "audio/mpeg"],
  ["audio/x-mp3", "audio/mpeg"],
  ["audio/mp4", "audio/mp4"],
  ["audio/m4a", "audio/mp4"],
  ["audio/x-m4a", "audio/x-m4a"],
  ["audio/aac", "audio/aac"],
  ["audio/x-aac", "audio/aac"],
  ["audio/ogg", "audio/ogg"],
  ["audio/wav", "audio/wav"],
  ["audio/x-wav", "audio/x-wav"],
  ["audio/vnd.wave", "audio/wav"],
]);

const MIME_EXTENSIONS = new Map<string, string>([
  ["audio/mpeg", "mp3"],
  ["audio/mp4", "m4a"],
  ["audio/x-m4a", "m4a"],
  ["audio/aac", "aac"],
  ["audio/ogg", "ogg"],
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
]);

type JsonObject = Record<string, unknown>;
type ReserveRow = {
  share_id?: unknown;
  upload_deadline?: unknown;
  expires_at?: unknown;
};
type FinalizeRow = {
  share_id?: unknown;
  object_path?: unknown;
  mime_type?: unknown;
  size_bytes?: unknown;
  upload_deadline?: unknown;
  expires_at?: unknown;
};
type ResolveRow = {
  object_path?: unknown;
  mime_type?: unknown;
  expires_at?: unknown;
};

function isAllowedOrigin(origin: string): boolean {
  if (!origin || ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const value = new URL(origin);
    return (value.protocol === "http:" || value.protocol === "https:") &&
      ["localhost", "127.0.0.1", "[::1]"].includes(value.hostname);
  } catch {
    return false;
  }
}

function responseHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin",
  };
  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function json(request: Request, body: JsonObject, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(request),
  });
}

async function readLimitedJson(request: Request): Promise<JsonObject | null> {
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
      ? parsed as JsonObject
      : null;
  } catch {
    return null;
  }
}

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

function adminClient() {
  const url = (Deno.env.get("SUPABASE_URL") || "").trim();
  const secret = secretKeyFromEnvironment();
  if (!url || !secret) return null;
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function bearerToken(request: Request): string {
  const authorization = request.headers.get("authorization") || "";
  return authorization.match(/^Bearer\s+([^\s]+)$/iu)?.[1] || "";
}

async function authenticatedUser(
  request: Request,
  admin: NonNullable<ReturnType<typeof adminClient>>,
) {
  const token = bearerToken(request);
  if (!token) return null;
  try {
    const { data, error } = await admin.auth.getUser(token);
    const user = data.user;
    if (error || !user || user.is_anonymous === true) return null;
    return user;
  } catch {
    return null;
  }
}

function normalizeMime(value: unknown): string {
  const mime = typeof value === "string"
    ? value.split(";", 1)[0].trim().toLowerCase()
    : "";
  return MIME_ALIASES.get(mime) || "";
}

function audioSize(value: unknown): number {
  const size = Number(value);
  return Number.isSafeInteger(size) && size >= 1 && size <= MAX_AUDIO_BYTES
    ? size
    : 0;
}

function firstRow<T>(value: unknown): T | null {
  const row = Array.isArray(value) ? value[0] : value;
  return row && typeof row === "object" ? row as T : null;
}

function randomShareToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(
    /=+$/u,
    "",
  );
}

function validShareToken(value: unknown): string {
  const token = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9_-]{43}$/u.test(token) ? token : "";
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function validUuid(value: unknown): string {
  const id = typeof value === "string" ? value : "";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
      .test(id)
    ? id.toLowerCase()
    : "";
}

function validObjectPath(value: unknown): string {
  const path = typeof value === "string" ? value : "";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp3|m4a|aac|ogg|wav)$/iu
      .test(path)
    ? path.toLowerCase()
    : "";
}

function validTimestamp(value: unknown): string {
  const text = typeof value === "string" ? value : "";
  return text && Number.isFinite(Date.parse(text)) ? text : "";
}

function startsWith(bytes: Uint8Array, text: string, offset = 0): boolean {
  if (bytes.length < offset + text.length) return false;
  for (let index = 0; index < text.length; index += 1) {
    if (bytes[offset + index] !== text.charCodeAt(index)) return false;
  }
  return true;
}

async function hasExpectedAudioSignature(
  blob: Blob,
  mime: string,
): Promise<boolean> {
  const bytes = new Uint8Array(await blob.slice(0, 64).arrayBuffer());
  if (mime === "audio/mpeg") {
    return startsWith(bytes, "ID3") ||
      (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  }
  if (mime === "audio/mp4" || mime === "audio/x-m4a") {
    return startsWith(bytes, "ftyp", 4);
  }
  if (mime === "audio/aac") {
    return bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xf6) === 0xf0;
  }
  if (mime === "audio/ogg") return startsWith(bytes, "OggS");
  if (mime === "audio/wav" || mime === "audio/x-wav") {
    return startsWith(bytes, "RIFF") && startsWith(bytes, "WAVE", 8);
  }
  return false;
}

async function abortAndRemove(
  admin: NonNullable<ReturnType<typeof adminClient>>,
  userId: string,
  shareId: string,
  objectPath: string,
): Promise<void> {
  await admin.rpc("glowletter_abort_audio_share", {
    p_user_id: userId,
    p_share_id: shareId,
  });
  const { error } = await admin.storage.from(BUCKET).remove([objectPath]);
  if (!error) {
    await admin.rpc("glowletter_finish_audio_cleanup", {
      p_share_id: shareId,
      p_deleted: true,
    });
  }
}

async function reserve(
  request: Request,
  body: JsonObject,
  admin: NonNullable<ReturnType<typeof adminClient>>,
): Promise<Response> {
  const user = await authenticatedUser(request, admin);
  if (!user) return json(request, { error: "authentication_required" }, 401);

  const mime = normalizeMime(body.mime_type ?? body.mimeType);
  const size = audioSize(body.size_bytes ?? body.sizeBytes);
  const extension = MIME_EXTENSIONS.get(mime) || "";
  if (!mime || !size || !extension) {
    return json(request, { error: "invalid_audio_metadata" }, 400);
  }

  const shareToken = randomShareToken();
  const tokenHash = await sha256Hex(shareToken);
  const objectPath = `${crypto.randomUUID()}.${extension}`;
  const { data: reservedData, error: reserveError } = await admin.rpc(
    "glowletter_reserve_audio_share",
    {
      p_user_id: user.id,
      p_token_hash: tokenHash,
      p_object_path: objectPath,
      p_mime_type: mime,
      p_size_bytes: size,
    },
  );

  if (reserveError) {
    if (reserveError.code === "P0001") {
      return json(request, { error: "rate_limited" }, 429);
    }
    if (reserveError.code === "22023") {
      return json(request, { error: "invalid_audio_metadata" }, 400);
    }
    return json(request, { error: "audio_service_unavailable" }, 503);
  }

  const reserved = firstRow<ReserveRow>(reservedData);
  const shareId = validUuid(reserved?.share_id);
  const uploadDeadline = validTimestamp(reserved?.upload_deadline);
  const expiresAt = validTimestamp(reserved?.expires_at);
  if (!shareId || !uploadDeadline || !expiresAt) {
    return json(request, { error: "audio_service_unavailable" }, 503);
  }

  const { data: uploadData, error: uploadError } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(objectPath, { upsert: false });

  if (uploadError || !uploadData?.signedUrl || !uploadData?.token) {
    await abortAndRemove(admin, user.id, shareId, objectPath);
    return json(request, { error: "audio_upload_unavailable" }, 503);
  }

  return json(request, {
    action: "reserve",
    shareToken,
    objectPath,
    uploadToken: uploadData.token,
    signedUploadUrl: uploadData.signedUrl,
    contentType: mime,
    sizeBytes: size,
    uploadDeadline,
    expiresAt,
  }, 201);
}

async function finalize(
  request: Request,
  body: JsonObject,
  admin: NonNullable<ReturnType<typeof adminClient>>,
): Promise<Response> {
  const user = await authenticatedUser(request, admin);
  if (!user) return json(request, { error: "authentication_required" }, 401);

  const shareToken = validShareToken(body.share_token ?? body.shareToken);
  if (!shareToken) return json(request, { error: "invalid_share_token" }, 400);
  const tokenHash = await sha256Hex(shareToken);
  const { data: pendingData, error: pendingError } = await admin.rpc(
    "glowletter_audio_share_for_finalize",
    { p_user_id: user.id, p_token_hash: tokenHash },
  );
  if (pendingError) {
    return json(request, { error: "audio_service_unavailable" }, 503);
  }

  const pending = firstRow<FinalizeRow>(pendingData);
  const shareId = validUuid(pending?.share_id);
  const objectPath = validObjectPath(pending?.object_path);
  const expectedMime = normalizeMime(pending?.mime_type);
  const expectedSize = audioSize(pending?.size_bytes);
  const expiresAt = validTimestamp(pending?.expires_at);
  const uploadDeadline = validTimestamp(pending?.upload_deadline);
  if (
    !shareId || !objectPath || !expectedMime || !expectedSize || !expiresAt ||
    !uploadDeadline
  ) {
    return json(request, { error: "audio_unavailable" }, 404);
  }

  const { data: object, error: downloadError } = await admin.storage
    .from(BUCKET)
    .download(objectPath);
  const actualMime = normalizeMime(object?.type);
  const objectIsValid = !downloadError &&
    object instanceof Blob &&
    object.size === expectedSize &&
    actualMime === expectedMime &&
    await hasExpectedAudioSignature(object, expectedMime);

  if (!objectIsValid) {
    await abortAndRemove(admin, user.id, shareId, objectPath);
    return json(request, { error: "uploaded_audio_mismatch" }, 422);
  }

  const { data: readyData, error: readyError } = await admin.rpc(
    "glowletter_mark_audio_share_ready",
    { p_user_id: user.id, p_share_id: shareId },
  );
  const ready = firstRow<{ expires_at?: unknown }>(readyData);
  const readyExpiry = validTimestamp(ready?.expires_at);
  if (readyError || !readyExpiry) {
    await abortAndRemove(admin, user.id, shareId, objectPath);
    return json(request, { error: "audio_service_unavailable" }, 503);
  }

  return json(request, {
    action: "finalize",
    ready: true,
    shareToken,
    expiresAt: readyExpiry,
  });
}

async function resolve(
  request: Request,
  body: JsonObject,
  admin: NonNullable<ReturnType<typeof adminClient>>,
): Promise<Response> {
  const shareToken = validShareToken(
    body.share_token ?? body.shareToken ?? body.token,
  );
  if (!shareToken) return json(request, { error: "audio_unavailable" }, 404);
  const tokenHash = await sha256Hex(shareToken);
  const { data: resolvedData, error: resolveError } = await admin.rpc(
    "glowletter_resolve_audio_share",
    { p_token_hash: tokenHash },
  );
  if (resolveError) {
    return json(request, { error: "audio_service_unavailable" }, 503);
  }

  const resolved = firstRow<ResolveRow>(resolvedData);
  const objectPath = validObjectPath(resolved?.object_path);
  const mime = normalizeMime(resolved?.mime_type);
  const expiresAt = validTimestamp(resolved?.expires_at);
  if (!objectPath || !mime || !expiresAt) {
    return json(request, { error: "audio_unavailable" }, 404);
  }

  // Keep a one-second safety margin so rounding can never create a signed URL
  // whose validity extends beyond the database expiry.
  const remainingSeconds = Math.floor(
    (Date.parse(expiresAt) - Date.now()) / 1000,
  ) - 1;
  if (remainingSeconds < 1) {
    return json(request, { error: "audio_unavailable" }, 404);
  }
  const playbackSeconds = Math.min(MAX_PLAYBACK_SECONDS, remainingSeconds);
  const { data: signedData, error: signedError } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(objectPath, playbackSeconds);
  if (signedError || !signedData?.signedUrl) {
    return json(request, { error: "audio_service_unavailable" }, 503);
  }

  return json(request, {
    action: "resolve",
    signedPlaybackUrl: signedData.signedUrl,
    contentType: mime,
    expiresAt,
    playbackExpiresIn: playbackSeconds,
  });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (!isAllowedOrigin(origin)) {
    return json(request, { error: "origin_not_allowed" }, 403);
  }

  if (request.method === "OPTIONS") {
    const headers = new Headers(responseHeaders(request));
    headers.set(
      "Access-Control-Allow-Headers",
      "authorization, apikey, content-type, x-client-info",
    );
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "POST") {
    return json(request, { error: "method_not_allowed" }, 405);
  }
  if (
    !/^application\/json(?:\s*;|$)/iu.test(
      request.headers.get("content-type") || "",
    )
  ) {
    return json(request, { error: "content_type_required" }, 415);
  }

  const body = await readLimitedJson(request);
  if (!body) return json(request, { error: "invalid_request" }, 400);
  const action = typeof body.action === "string"
    ? body.action.trim().toLowerCase()
    : "";
  const admin = adminClient();
  if (!admin) return json(request, { error: "audio_service_unavailable" }, 503);

  try {
    if (action === "reserve") return await reserve(request, body, admin);
    if (action === "finalize") return await finalize(request, body, admin);
    if (action === "resolve") return await resolve(request, body, admin);
    return json(request, { error: "invalid_action" }, 400);
  } catch {
    // Never reflect provider errors because they may contain internal bucket or
    // object details. The raw share token is deliberately never logged.
    return json(request, { error: "audio_service_unavailable" }, 503);
  }
});
