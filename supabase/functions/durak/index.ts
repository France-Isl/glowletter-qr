import { createClient } from "npm:@supabase/supabase-js@2.110.9";
import { GameError, handle } from "./durak_server.mjs";

// «Дурак» (01.11): партия живёт здесь, на сервере. Клиент шлёт ход — сервер проверяет его по
// правилам (engine.js — копия durak-engine.js из корня), отвечает видом стола для этого игрока
// и шлёт в канал glowletter-durak:<стол> только номер версии; руки других игроков не уходят никому.
const MAX_REQUEST_BYTES = 4 * 1024;
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

function headers(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const value: Record<string, string> = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff", Vary: "Origin" };
  if (origin && allowedOrigin(origin)) value["Access-Control-Allow-Origin"] = origin;
  return value;
}

const json = (request: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: headers(request) });

type Row = { id: string; host: string; settings: unknown; seats: unknown; state: unknown; status: string; round: number; version: number; deadline: string | null };

function fromRow(row: Row) {
  const extra = (row.state && typeof row.state === "object" ? row.state : {}) as Record<string, unknown>;
  return {
    id: row.id, host: row.host, settings: row.settings, seats: row.seats, status: row.status, round: row.round, version: row.version,
    state: extra.engine || null, rewards: extra.rewards || null, chat: extra.chat || [], botAt: typeof extra.botAt === "number" ? extra.botAt : null,
    deadline: row.deadline ? Date.parse(row.deadline) : null
  };
}

const db = {
  async identity(userId: string) {
    const { data, error } = await admin!.rpc("glowletter_durak_identity", { p_user: userId });
    if (error) throw new Error("identity");
    return data || {};
  },
  async load(id: string) {
    const { data, error } = await admin!.from("glowletter_durak_games").select("id,host,settings,seats,state,status,round,version,deadline").eq("id", id).maybeSingle();
    if (error) throw new Error("load");
    return data ? fromRow(data as Row) : null;
  },
  async insert(game: Record<string, unknown>, staleBefore: number) {
    await admin!.from("glowletter_durak_games").delete().lt("updated_at", new Date(staleBefore).toISOString());
    const { error } = await admin!.from("glowletter_durak_games").insert({
      id: game.id, host: game.host, settings: game.settings, seats: game.seats, status: game.status, round: game.round,
      state: { engine: game.state, rewards: game.rewards, chat: [], botAt: game.botAt || null }, version: 0, deadline: game.deadline ? new Date(game.deadline as number).toISOString() : null
    });
    if (error) throw new Error("insert");
  },
  async save(game: Record<string, unknown>) {
    const { data, error } = await admin!.from("glowletter_durak_games").update({
      seats: game.seats, status: game.status, round: game.round, state: { engine: game.state, rewards: game.rewards, chat: game.chat || [], botAt: game.botAt || null },
      version: (game.version as number) + 1, deadline: game.deadline ? new Date(game.deadline as number).toISOString() : null,
      updated_at: new Date().toISOString()
    }).eq("id", game.id).eq("version", game.version).select("id");
    if (error) throw new Error("save");
    return Array.isArray(data) && data.length === 1;
  },
  async mine(userId: string, staleBefore: number) {
    const { data } = await admin!.from("glowletter_durak_games").select("id,host,settings,seats,state,status,round,version,deadline")
      .in("status", ["lobby", "playing", "finished"]).gt("updated_at", new Date(staleBefore).toISOString())
      .contains("seats", [{ id: userId }]).order("updated_at", { ascending: false }).limit(10);
    return (data || []).map((row) => fromRow(row as Row));
  },
  async stake(game: string, round: number, users: string[], stake: number) {
    const { data, error } = await admin!.rpc("glowletter_durak_stake", { p_game: game, p_round: round, p_users: users, p_stake: stake });
    if (error) throw new Error("stake");
    return data;
  },
  async settle(game: string, round: number, user: string, result: string, stake: number, payout: number, withBots: boolean) {
    const { data, error } = await admin!.rpc("glowletter_durak_settle", { p_game: game, p_round: round, p_user: user, p_result: result, p_stake: stake, p_payout: payout, p_with_bots: withBots });
    if (error) throw new Error("settle");
    return data;
  },
  async textOk(text: string) {
    const { data, error } = await admin!.rpc("glowletter_durak_text_ok", { p_text: text });
    return !error && data === true;
  },
  async useHint(user: string) {
    const { data, error } = await admin!.rpc("glowletter_durak_use_hint", { p_user: user });
    if (error) return false;
    return data === true;
  },
  async broadcast(id: string, version: number) {
    await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: secretKey, Authorization: `Bearer ${secretKey}` },
      body: JSON.stringify({ messages: [{ topic: `glowletter-durak:${id}`, event: "v", payload: { v: version }, private: false }] })
    });
  }
};

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (!allowedOrigin(origin)) return json(request, { error: "forbidden" }, 403);
  if (request.method === "OPTIONS") {
    const value = new Headers(headers(request));
    value.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    value.set("Access-Control-Allow-Headers", "authorization, apikey, content-type, x-client-info");
    value.set("Access-Control-Max-Age", "600");
    return new Response(null, { status: 204, headers: value });
  }
  if (request.method !== "POST") return json(request, { error: "method" }, 405);
  if (!admin) return json(request, { error: "not_configured" }, 503);
  const match = (request.headers.get("authorization") || "").match(/^Bearer ([A-Za-z0-9._~-]{40,8192})$/u);
  if (!match) return json(request, { error: "authentication_required" }, 401);
  const { data: auth, error: authError } = await admin.auth.getUser(match[1]);
  if (authError || !auth.user?.id) return json(request, { error: "authentication_required" }, 401);
  const text = await request.text();
  if (!text || new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) return json(request, { error: "invalid" }, 400);
  let body: Record<string, unknown>;
  try { body = JSON.parse(text); } catch { return json(request, { error: "invalid" }, 400); }
  try {
    return json(request, await handle(db, auth.user.id, body));
  } catch (error) {
    if (error instanceof GameError) return json(request, { error: error.code, who: error.who || undefined }, error.status);
    console.error("durak", error);
    return json(request, { error: "server" }, 500);
  }
});
