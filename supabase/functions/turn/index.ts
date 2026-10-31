import { createClient } from "npm:@supabase/supabase-js@2.110.9";

// Ретранслятор для звонков (01.11): когда прямое соединение не получается (мобильный интернет,
// строгий NAT, ограничения у оператора), звук идёт через TURN. Сервер выдаёт вошедшему
// пользователю временные логин и пароль — постоянные ключи живут только в секретах Supabase.
// Без секретов функция отвечает пустым списком, и звонок работает, как раньше, напрямую.
//   Cloudflare (1000 ГБ в месяц бесплатно): CLOUDFLARE_TURN_KEY_ID + CLOUDFLARE_TURN_API_TOKEN.
//   Свой coturn (use-auth-secret): TURN_SHARED_SECRET + TURN_URLS (через запятую).
const TTL_SECONDS = 12 * 60 * 60;
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

type IceServer = { urls: string[]; username?: string; credential?: string };

// Только адреса stun:/turn:/turns: — что бы ни ответил поставщик.
function clean(list: unknown): IceServer[] {
  const rows = Array.isArray(list) ? list : list ? [list] : [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    const urls = (Array.isArray(item.urls) ? item.urls : [item.urls]).filter((url): url is string => typeof url === "string" && /^(stun|turns?):[^\s]{3,200}$/u.test(url));
    if (!urls.length) return [];
    const server: IceServer = { urls };
    if (typeof item.username === "string") server.username = item.username;
    if (typeof item.credential === "string") server.credential = item.credential;
    return [server];
  });
}

async function cloudflare(): Promise<IceServer[]> {
  const keyId = (Deno.env.get("CLOUDFLARE_TURN_KEY_ID") || "").trim();
  const token = (Deno.env.get("CLOUDFLARE_TURN_API_TOKEN") || "").trim();
  if (!keyId || !token) return [];
  const response = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(keyId)}/credentials/generate-ice-servers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ttl: TTL_SECONDS })
  });
  if (!response.ok) throw new Error(`cloudflare ${response.status}`);
  const data = await response.json() as { iceServers?: unknown };
  return clean(data.iceServers);
}

// Свой coturn: логин «срок:пользователь», пароль — HMAC-SHA1 от логина общим секретом (TURN REST API).
async function coturn(userId: string): Promise<IceServer[]> {
  const secret = (Deno.env.get("TURN_SHARED_SECRET") || "").trim();
  const urls = (Deno.env.get("TURN_URLS") || "").split(",").map((url) => url.trim()).filter(Boolean);
  if (!secret || !urls.length) return [];
  const username = `${Math.floor(Date.now() / 1000) + TTL_SECONDS}:${userId}`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(username)));
  return clean({ urls, username, credential: btoa(String.fromCharCode(...signature)) });
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
  if (authError || !auth.user?.id) return json(request, { error: "authentication_required" }, 401);
  const iceServers: IceServer[] = [];
  for (const source of [() => cloudflare(), () => coturn(auth.user.id)]) {
    try { iceServers.push(...await source()); } catch (error) { console.error("turn", error instanceof Error ? error.message : "error"); }
  }
  return json(request, { iceServers, ttl: TTL_SECONDS });
});
