import { createClient } from "npm:@supabase/supabase-js@2.110.9";

const BUCKET = "glowletter-shared-audio";
const CLAIM_LIMIT = 40;
const MAX_CLEANUP_SECRET_LENGTH = 256;

const ALLOWED_ORIGINS = new Set([
  "https://france-isl.github.io",
  "https://bezam.org",
  "https://www.bezam.org",
  "https://appassets.androidplatform.net",
  "capacitor://localhost",
  "null",
]);

type JsonObject = Record<string, unknown>;
type CleanupRow = { share_id?: unknown; object_path?: unknown };

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

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function validationPassed(data: unknown): boolean {
  if (data === true) return true;
  if (Array.isArray(data) && data.length === 1) {
    return validationPassed(data[0]);
  }
  if (data && typeof data === "object") {
    const values = Object.values(data as Record<string, unknown>);
    return values.length === 1 && values[0] === true;
  }
  return false;
}

async function finishCleanup(
  admin: NonNullable<ReturnType<typeof adminClient>>,
  shareId: string,
  deleted: boolean,
): Promise<boolean> {
  try {
    const { error } = await admin.rpc("glowletter_finish_audio_cleanup", {
      p_share_id: shareId,
      p_deleted: deleted,
    });
    return !error;
  } catch {
    return false;
  }
}

async function finishInBatches(
  admin: NonNullable<ReturnType<typeof adminClient>>,
  rows: Array<{ shareId: string; deleted: boolean }>,
): Promise<number> {
  let completed = 0;
  for (let index = 0; index < rows.length; index += 8) {
    const batch = rows.slice(index, index + 8);
    const results = await Promise.all(
      batch.map((row) => finishCleanup(admin, row.shareId, row.deleted)),
    );
    completed += results.filter(Boolean).length;
  }
  return completed;
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
      "content-type, x-glowletter-cleanup",
    );
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "POST") {
    return json(request, { error: "method_not_allowed" }, 405);
  }

  const cleanupSecret = (request.headers.get("x-glowletter-cleanup") || "")
    .trim();
  if (
    cleanupSecret.length < 32 ||
    cleanupSecret.length > MAX_CLEANUP_SECRET_LENGTH
  ) {
    return json(request, { error: "authentication_required" }, 401);
  }

  const admin = adminClient();
  if (!admin) return json(request, { error: "cleanup_unavailable" }, 503);
  try {
    const cleanupHash = await sha256Hex(cleanupSecret);
    const { data: validData, error: validError } = await admin.rpc(
      "glowletter_validate_cleanup_secret",
      { p_secret_hash: cleanupHash },
    );
    if (validError) {
      return json(request, { error: "cleanup_unavailable" }, 503);
    }
    if (!validationPassed(validData)) {
      return json(request, { error: "authentication_required" }, 401);
    }

    const { data: claimedData, error: claimError } = await admin.rpc(
      "glowletter_claim_audio_cleanup",
      { p_limit: CLAIM_LIMIT },
    );
    if (claimError) {
      return json(request, { error: "cleanup_unavailable" }, 503);
    }

    const claimedRows = Array.isArray(claimedData) ? claimedData : [];
    const rows = claimedRows.map(
      (value): { shareId: string; objectPath: string } | null => {
        if (!value || typeof value !== "object") return null;
        const row = value as CleanupRow;
        const shareId = validUuid(row.share_id);
        const objectPath = validObjectPath(row.object_path);
        return shareId && objectPath ? { shareId, objectPath } : null;
      },
    ).filter((value): value is { shareId: string; objectPath: string } =>
      value !== null
    );

    if (rows.length === 0) {
      return json(request, { ok: true, claimed: 0, deleted: 0, retry: 0 });
    }

    let outcomes: Array<{ shareId: string; deleted: boolean }>;
    const paths = rows.map((row) => row.objectPath);
    const { error: batchDeleteError } = await admin.storage.from(BUCKET).remove(
      paths,
    );
    if (!batchDeleteError) {
      outcomes = rows.map((row) => ({ shareId: row.shareId, deleted: true }));
    } else {
      outcomes = [];
      for (const row of rows) {
        const { error } = await admin.storage.from(BUCKET).remove([
          row.objectPath,
        ]);
        outcomes.push({ shareId: row.shareId, deleted: !error });
      }
    }

    const finishCount = await finishInBatches(admin, outcomes);
    const deleted = outcomes.filter((row) => row.deleted).length;
    return json(request, {
      ok: finishCount === outcomes.length,
      claimed: rows.length,
      deleted,
      retry: rows.length - deleted,
    }, finishCount === outcomes.length ? 200 : 503);
  } catch {
    // Do not expose or log cleanup credentials, bucket paths, or provider
    // errors. A claimed row becomes eligible for retry through the database.
    return json(request, { error: "cleanup_unavailable" }, 503);
  }
});
