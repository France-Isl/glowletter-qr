import { createClient } from "npm:@supabase/supabase-js@2.110.9";

// Звонок, когда приложение закрыто (владелец 01.11: «как в WhatsApp»). После приглашения
// [[call:комната]] звонящий просит эту функцию разбудить телефоны друга через Firebase Cloud
// Messaging; Android 2.4.29+ показывает входящий звонок с «Ответить» и «Отклонить».
// end: true — звонящий передумал, телефон друга перестаёт звонить.
// Будим только по настоящему приглашению: сообщение от звонящего этому другу с той же комнатой,
// не старше минуты (отмена — пяти минут). Ключ Google — тот же служебный аккаунт, что проверяет
// покупки (GOOGLE_SERVICE_ACCOUNT_JSON, роль Firebase Cloud Messaging API Admin).
const FIREBASE_PROJECT = "bezam-502320";
const ROOM = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const ORIGINS = new Set(["https://france-isl.github.io", "https://bezam.org", "https://www.bezam.org", "https://appassets.androidplatform.net", "capacitor://localhost", "null"]);

function secretKeyFromEnvironment(): string {
  const legacy = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();
  if (legacy) return legacy;
  try {
    const parsed = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}") as Record<string, unknown>;
    const preferred = typeof parsed.default === "string" ? parsed.default.trim() : "";
    if (preferred) return preferred;
    return (Object.values(parsed).find((value) => typeof value === "string" && value.trim()) as string | undefined)?.trim() || "";
  } catch {
    return "";
  }
}

const supabaseUrl = (Deno.env.get("SUPABASE_URL") || "").trim();
const secretKey = secretKeyFromEnvironment();
const admin = supabaseUrl && secretKey ? createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

function allowedOrigin(origin: string): boolean {
  if (!origin || ORIGINS.has(origin)) return true;
  try { const url = new URL(origin); return url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname); }
  catch { return false; }
}

function headers(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const value: Record<string, string> = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff", Vary: "Origin" };
  if (origin && allowedOrigin(origin)) value["Access-Control-Allow-Origin"] = origin;
  return value;
}

const json = (request: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: headers(request) });

const base64Url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");

function pemToBytes(pem: string): Uint8Array {
  const body = pem.replace(/-----[^-]+-----/gu, "").replace(/\s+/gu, "");
  return Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
}

let cachedToken: { token: string; expiresAt: number } | null = null;

// OAuth-токен Google для FCM из служебного аккаунта (JWT RS256), живёт около часа.
async function googleToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  const account = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON") || "{}") as { client_email?: string; private_key?: string };
  if (!account.client_email || !account.private_key) throw new Error("service account missing");
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => base64Url(new TextEncoder().encode(JSON.stringify(value)));
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: account.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3500 })}`;
  const key = await crypto.subtle.importKey("pkcs8", pemToBytes(account.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned)));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${base64Url(signature)}` })
  });
  if (!response.ok) throw new Error(`google auth ${response.status}`);
  const data = await response.json() as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("google auth empty");
  cachedToken = { token: data.access_token, expiresAt: Date.now() + Math.min(Number(data.expires_in) || 3000, 3600) * 1000 };
  return cachedToken.token;
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (!allowedOrigin(origin)) return json(request, { error: "origin" }, 403);
  if (request.method === "OPTIONS") {
    const value = new Headers(headers(request));
    value.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    value.set("Access-Control-Allow-Headers", "authorization, apikey, content-type, x-client-info");
    value.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers: value });
  }
  if (request.method !== "POST") return json(request, { error: "method" }, 405);
  if (!admin) return json(request, { error: "server" }, 500);
  const match = (request.headers.get("authorization") || "").match(/^Bearer ([A-Za-z0-9._~-]{40,8192})$/u);
  if (!match) return json(request, { error: "authentication_required" }, 401);
  const { data: auth, error: authError } = await admin.auth.getUser(match[1]);
  const me = auth?.user?.id;
  if (authError || !me) return json(request, { error: "authentication_required" }, 401);

  let input: { room?: unknown; to?: unknown; end?: unknown };
  try { input = await request.json(); } catch { return json(request, { error: "invalid" }, 400); }
  const room = String(input.room || "");
  const to = String(input.to || "");
  const end = input.end === true;
  if (!ROOM.test(room) || !ROOM.test(to) || to === me) return json(request, { error: "invalid" }, 400);

  // Будим только по настоящему приглашению.
  const since = new Date(Date.now() - (end ? 5 * 60_000 : 60_000)).toISOString();
  const { data: invite } = await admin.from("glowletter_messages").select("created_at")
    .eq("sender", me).eq("recipient", to).eq("body", `[[call:${room}]]`).gte("created_at", since)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!invite) return json(request, { error: "no_invite" }, 404);

  const { data: devices } = await admin.from("glowletter_call_devices").select("token").eq("user_id", to).order("updated_at", { ascending: false }).limit(5);
  if (!devices?.length) return json(request, { sent: 0 });
  const { data: profile } = await admin.from("glowletter_profiles").select("display_name").eq("user_id", me).maybeSingle();
  const name = String(profile?.display_name || "").slice(0, 36);

  let token: string;
  try { token = await googleToken(); } catch (error) {
    console.error("call-push", error instanceof Error ? error.message : "auth");
    return json(request, { error: "push_unavailable" }, 503);
  }
  const data = end
    ? { type: "call_end", room }
    : { type: "call", room, from: me, name, at: String(new Date(invite.created_at).getTime()) };
  let sent = 0;
  await Promise.all(devices.map(async ({ token: address }) => {
    try {
      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT}/messages:send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: { token: address, data, android: { priority: "HIGH", ttl: end ? "300s" : "45s" } } })
      });
      if (response.ok) { sent += 1; return; }
      const text = await response.text();
      // Приложение удалили или адрес устарел — больше не будим.
      if (response.status === 404 || /UNREGISTERED|INVALID_ARGUMENT/u.test(text)) {
        await admin.from("glowletter_call_devices").delete().eq("token", address);
      } else {
        console.error("call-push fcm", response.status, text.slice(0, 200));
      }
    } catch (error) {
      console.error("call-push fcm", error instanceof Error ? error.message : "error");
    }
  }));
  return json(request, { sent });
});
