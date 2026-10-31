// Стол «Дурака» и шашек на сервере: лобби, ходы, боты, таймер, ставки в долларах.
// Хранилище подаётся снаружи (db), поэтому этот файл проверяется тестами без базы.
import "./engine.js";
import "./checkers.js";

const D = globalThis.GlowDurak;
const C = globalThis.GlowCheckers;
// У обеих игр один интерфейс движка; какая идёт за столом — в settings.kind.
const engineOf = game => (game.settings?.kind === "checkers" ? C : D);
export const TURN_MS = 30000;
// Боты ходят по одному с паузой, чтобы за столом было видно каждый их ход.
export const BOT_MS = 900;
const LOBBY_TTL_MS = 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const BOT_KEYS = ["b1", "b2", "b3"];
// Ставка: каждый вносит одинаково, дурак теряет взнос, его взнос делят вышедшие по местам.
export const MIN_STAKE = 100;
export const MAX_STAKE = 1000000;
const SHARES = { 2: [1], 3: [0.6, 0.4], 4: [0.5, 0.3, 0.2] };
const TEXT_MAX = 120;
const EMOTES = ["hi", "gg", "wow", "think", "lucky", "oops", "laugh", "clap"];

export class GameError extends Error {
  constructor(code, status = 400, who = null) { super(code); this.code = code; this.status = status; this.who = who; }
}

function secureRandom() {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 4294967296;
}

const seatOf = (game, userId) => game.seats.findIndex(seat => !seat.bot && seat.id === userId);
const controlledByBot = (game, i) => Boolean(game.seats[i]?.bot || game.seats[i]?.auto);

function lobbyView(game, userId) {
  return {
    id: game.id, status: game.status, round: game.round, version: game.version,
    host: game.host === userId, settings: game.settings,
    seats: game.seats.map(seat => ({ id: seat.bot ? null : seat.id, name: seat.name, bot: Boolean(seat.bot), botKey: seat.botKey || null, auto: Boolean(seat.auto), back: seat.back || "back_classic", me: !seat.bot && seat.id === userId })),
    me: seatOf(game, userId)
  };
}

export function viewFor(game, userId, extra = {}) {
  const base = lobbyView(game, userId);
  if (!game.state) return { ...base, game: null, chat: game.chat || [], ...extra };
  const seat = seatOf(game, userId);
  const view = engineOf(game).viewFor(game.state, seat >= 0 ? seat : -1);
  if (seat < 0) { view.hand = []; view.legal = []; }
  const botIn = game.botAt ? Math.max(0, game.botAt - Date.now()) : null;
  return { ...base, game: view, deadline: game.deadline || null, botIn, rewards: game.rewards || null, chat: game.chat || [], ...extra };
}

function cleanSettings(input = {}) {
  const kind = input.kind === "checkers" ? "checkers" : "durak";
  const mode = input.mode === "transfer" ? "transfer" : "classic";
  const deck = Number(input.deck) === 24 ? 24 : 36;
  const seats = kind === "checkers" ? 2 : Math.min(4, Math.max(2, Math.round(Number(input.seats) || 2)));
  const bots = input.bots !== false;
  const rawStake = Math.round(Number(input.stake) || 0);
  const stake = rawStake <= 0 ? 0 : Math.min(MAX_STAKE, Math.max(MIN_STAKE, rawStake));
  return { kind, mode, deck, seats, bots, stake };
}

function setDeadline(game, now) {
  const must = game.state && game.state.phase === "play" ? engineOf(game).mustAct(game.state) : [];
  const humanTurn = must.some(i => !controlledByBot(game, i));
  game.deadline = humanTurn ? now + TURN_MS : null;
  game.botAt = must.some(i => controlledByBot(game, i)) ? now + BOT_MS : null;
}

function runBots(game, limit = 400) {
  const E = engineOf(game);
  for (let step = 0; step < limit && game.state.phase === "play"; step += 1) {
    const must = E.mustAct(game.state).filter(i => controlledByBot(game, i));
    if (!must.length) return;
    const who = must[0];
    const action = E.botAction(game.state, who);
    if (!action) return;
    game.state = E.apply(game.state, who, action);
  }
}

export function payouts(state, stake) {
  const n = state.players.length;
  const result = state.players.map(() => ({ result: "draw", payout: stake }));
  if (state.durak < 0) return result;
  const shares = SHARES[n] || [];
  state.players.forEach((_, i) => {
    if (i === state.durak) { result[i] = { result: state.kind === "checkers" ? "loss" : "fool", payout: 0 }; return; }
    const place = state.order.indexOf(i);
    const share = shares[place] ?? 0;
    result[i] = { result: place === 0 ? "win" : "escape", payout: stake + Math.floor(stake * share) };
  });
  return result;
}

async function finishRound(game, db) {
  if (game.state.phase !== "over" || game.rewards) return;
  game.status = "finished";
  const stake = game.settings.stake || 0;
  const withBots = game.seats.some(seat => seat.bot);
  const table = payouts(game.state, stake);
  const rewards = {};
  for (let i = 0; i < game.seats.length; i += 1) {
    const seat = game.seats[i];
    if (seat.bot) continue;
    const { result, payout } = table[i];
    let settled = null;
    try { settled = await db.settle(game.id, game.round, seat.id, result, stake, payout, withBots); } catch { settled = null; }
    rewards[seat.id] = { result, stake, net: settled?.net ?? payout - stake, insured: Boolean(settled?.insured), boosted: Boolean(settled?.boosted) };
  }
  game.rewards = rewards;
}

async function startRound(game, db, now, firstAttacker = null) {
  const stake = game.settings.stake || 0;
  if (stake > 0) {
    const humans = game.seats.filter(seat => !seat.bot).map(seat => seat.id);
    const paid = await db.stake(game.id, game.round + 1, humans, stake);
    if (!paid?.ok) {
      const poor = new Set(paid?.poor || []);
      throw new GameError("not_enough_dollars", 409, game.seats.filter(seat => poor.has(seat.id)).map(seat => seat.name));
    }
  }
  game.round += 1;
  game.rewards = null;
  game.status = "playing";
  game.seats.forEach(seat => { seat.afk = 0; seat.auto = false; });
  game.state = engineOf(game).newGame({
    players: game.seats.map(seat => ({ id: seat.bot ? `bot:${seat.botKey}` : seat.id, name: seat.name, bot: Boolean(seat.bot) })),
    mode: game.settings.mode, deckSize: game.settings.deck, rng: secureRandom, firstAttacker
  });
  setDeadline(game, now);
}

async function commit(db, game, now) {
  game.updated_at = now;
  const ok = await db.save(game);
  if (!ok) throw new GameError("conflict", 409);
  game.version += 1;
  try { await db.broadcast(game.id, game.version); } catch { /* стол обновится при следующем запросе */ }
}

async function loadGame(db, id) {
  if (!UUID.test(String(id || ""))) throw new GameError("not_found", 404);
  const game = await db.load(id);
  if (!game) throw new GameError("not_found", 404);
  return game;
}

export async function handle(db, userId, body, now = Date.now()) {
  const action = String(body?.action || "");
  const who = await db.identity(userId);
  if (who.banned) throw new GameError("account_blocked", 403);
  const name = String(who.name || "").slice(0, 36);

  if (action === "create") {
    const settings = cleanSettings(body.settings);
    if (settings.stake > Number(who.dollars || 0)) throw new GameError("not_enough_dollars", 409);
    const game = { id: crypto.randomUUID(), host: userId, settings, seats: [{ id: userId, name, back: who.back }], state: null, status: "lobby", round: 0, version: 0, deadline: null, rewards: null, chat: [] };
    if (body.solo) {
      while (game.seats.length < settings.seats) game.seats.push({ bot: true, botKey: BOT_KEYS[game.seats.length - 1], name: "" });
      await startRound(game, db, now);
    }
    await db.insert(game, now - LOBBY_TTL_MS);
    return viewFor(game, userId);
  }

  if (action === "mine") {
    const games = await db.mine(userId, now - LOBBY_TTL_MS);
    return { games: games.map(game => ({ id: game.id, status: game.status, settings: game.settings, players: game.seats.length, host: game.host === userId })) };
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const game = await loadGame(db, body.game);
    try {
      const result = await step(db, game, userId, name, who, action, body, now);
      return result;
    } catch (error) {
      if (error instanceof GameError && error.code === "conflict" && attempt < 3) continue;
      throw error;
    }
  }
  throw new GameError("conflict", 409);
}

async function step(db, game, userId, name, who, action, body, now) {
  const seat = seatOf(game, userId);

  if (action === "view") {
    if (seat < 0 && game.status !== "lobby") throw new GameError("not_member", 403);
    return viewFor(game, userId);
  }

  if (action === "join") {
    if (seat >= 0) return viewFor(game, userId);
    if (game.status !== "lobby") throw new GameError("started", 409);
    if (game.seats.length >= game.settings.seats) throw new GameError("full", 409);
    if ((game.settings.stake || 0) > Number(who.dollars || 0)) throw new GameError("not_enough_dollars", 409);
    game.seats.push({ id: userId, name, back: who.back });
    await commit(db, game, now);
    return viewFor(game, userId);
  }

  if (seat < 0) throw new GameError("not_member", 403);

  if (action === "leave") {
    if (game.status === "lobby") {
      if (game.host === userId) game.status = "closed";
      else game.seats.splice(seat, 1);
    } else if (game.status === "playing") {
      game.seats[seat].auto = true;
      game.seats[seat].left = true;
      runBots(game);
      if (game.state.phase === "over") await finishRound(game, db);
      setDeadline(game, now);
    }
    await commit(db, game, now);
    return { left: true };
  }

  if (action === "start") {
    if (game.status !== "lobby") throw new GameError("started", 409);
    if (game.host !== userId) throw new GameError("host_only", 403);
    if (game.settings.bots) {
      let k = 0;
      while (game.seats.length < game.settings.seats) game.seats.push({ bot: true, botKey: BOT_KEYS[k++], name: "" });
    }
    if (game.seats.length < 2) throw new GameError("need_players", 409);
    await startRound(game, db, now);
    if (game.state.phase === "over") await finishRound(game, db);
    await commit(db, game, now);
    return viewFor(game, userId);
  }

  if (action === "rematch") {
    if (game.status !== "finished") throw new GameError("not_finished", 409);
    const fool = game.state?.durak;
    const E = engineOf(game);
    const first = E.nextFirst && game.state ? E.nextFirst(game.state) : Number.isInteger(fool) && fool >= 0 ? (fool + 1) % game.seats.length : null;
    game.seats.forEach(s => { if (s.left) { s.bot = true; s.botKey = s.botKey || BOT_KEYS[0]; } });
    await startRound(game, db, now, first);
    if (game.state.phase === "over") await finishRound(game, db);
    await commit(db, game, now);
    return viewFor(game, userId);
  }

  if (game.status !== "playing" || !game.state) throw new GameError("not_playing", 409);
  const E = engineOf(game);

  if (action === "act") {
    const move = body.move || {};
    if (Number.isInteger(body.seq) && body.seq !== game.state.seq) throw new GameError("stale", 409);
    const parsed = E === C
      ? { type: move.type === "resign" ? "resign" : "move", path: Array.isArray(move.path) ? move.path.slice(0, 14).map(Number) : [] }
      : { type: String(move.type || ""), card: String(move.card || ""), slot: Number(move.slot) };
    try { game.state = E.apply(game.state, seat, parsed); }
    catch { throw new GameError("illegal", 409); }
    game.seats[seat].afk = 0;
    game.seats[seat].auto = false;
    if (game.state.phase === "over") await finishRound(game, db);
    setDeadline(game, now);
    await commit(db, game, now);
    return viewFor(game, userId);
  }

  if (action === "tick") {
    const botDue = Boolean(game.botAt) && now >= game.botAt - 150;
    const humanDue = Boolean(game.deadline) && now >= game.deadline;
    if (!botDue && !humanDue) return viewFor(game, userId);
    const late = humanDue ? E.mustAct(game.state).filter(i => !controlledByBot(game, i)) : [];
    for (const i of late) {
      if (game.state.phase !== "play") break;
      if (!E.mustAct(game.state).includes(i)) continue;
      const auto = E.botAction(game.state, i);
      if (!auto) continue;
      game.state = E.apply(game.state, i, auto);
      game.seats[i].afk = (game.seats[i].afk || 0) + 1;
      if (game.seats[i].afk >= 3) game.seats[i].auto = true;
    }
    if (botDue) runBots(game, 1);
    if (game.state.phase === "over") await finishRound(game, db);
    setDeadline(game, now);
    await commit(db, game, now);
    return viewFor(game, userId);
  }

  if (action === "say") {
    const emote = EMOTES.includes(body.emote) ? body.emote : "";
    const text = emote ? "" : String(body.text || "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, TEXT_MAX);
    if (!emote && !text) throw new GameError("invalid", 400);
    if (text && !(await db.textOk(text))) throw new GameError("forbidden", 422);
    game.chat = (game.chat || []).concat({ seat, emote, text, at: now }).slice(-30);
    await commit(db, game, now);
    return viewFor(game, userId);
  }

  if (action === "hint") {
    if (!game.seats.some(s => s.bot)) throw new GameError("bots_only", 409);
    const suggestion = E.botAction(game.state, seat);
    if (!suggestion) return viewFor(game, userId, { hint: null });
    const paid = await db.useHint(userId);
    if (!paid) throw new GameError("no_hints", 402);
    return viewFor(game, userId, { hint: suggestion });
  }

  throw new GameError("unknown_action", 400);
}
