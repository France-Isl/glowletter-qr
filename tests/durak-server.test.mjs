import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handle, payouts, GameError } from "../supabase/functions/durak/durak_server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Серверная копия правил совпадает с файлом приложения.
assert.equal(fs.readFileSync(path.join(root, "supabase/functions/durak/engine.js"), "utf8"), fs.readFileSync(path.join(root, "durak-engine.js"), "utf8"));

const D = globalThis.GlowDurak;
function fakeDb() {
  const games = new Map();
  const dollars = { a: 5000, b: 5000, c: 50 };
  const settled = [];
  return {
    games, dollars, settled, broadcasts: 0,
    async identity(user) { return { name: user.toUpperCase(), banned: false, dollars: dollars[user] ?? 0, back: "back_classic" }; },
    async load(id) { const g = games.get(id); return g ? structuredClone(g) : null; },
    async insert(game) { games.set(game.id, structuredClone(game)); },
    async save(game) { const cur = games.get(game.id); if (!cur || cur.version !== game.version) return false; games.set(game.id, { ...structuredClone(game), version: game.version + 1 }); return true; },
    async mine() { return [...games.values()]; },
    async stake(id, round, users, stake) { const poor = users.filter(u => (dollars[u] ?? 0) < stake); if (poor.length) return { ok: false, poor }; users.forEach(u => { dollars[u] -= stake; }); return { ok: true }; },
    async settle(id, round, user, result, stake, payout, withBots) { dollars[user] += payout; settled.push({ user, result, stake, payout, withBots }); return { net: payout - stake }; },
    async textOk(text) { return !/http/u.test(text); },
    async useHint() { return true; },
    async broadcast() { this.broadcasts += 1; }
  };
}

// Выплаты: дурак теряет взнос, его делят вышедшие.
const over = { players: [{}, {}, {}], durak: 2, order: [1, 0] };
assert.deepEqual(payouts(over, 1000).map(p => p.payout), [1400, 1600, 0]);
assert.deepEqual(payouts({ players: [{}, {}], durak: -1, order: [0, 1] }, 500).map(p => p.payout), [500, 500]);

// Соло с ботами: партия доигрывается ходами человека.
let db = fakeDb();
let view = await handle(db, "a", { action: "create", solo: true, settings: { mode: "transfer", deck: 36, seats: 3, stake: 1000 } });
assert.equal(view.status, "playing");
assert.equal(db.dollars.a, 4000);
assert.equal(view.seats.length, 3);
assert.equal(view.game.hand.length > 0, true);
let guard = 0;
let fake = Date.now();
while (view.status === "playing" && guard++ < 3000) {
  const g = view.game;
  if (!g.must.includes(g.me)) { fake += 31000; view = await handle(db, "a", { action: "tick", game: view.id }, fake); continue; }
  const raw = structuredClone([...db.games.values()][0].state);
  const move = D.botAction(raw, g.me);
  view = await handle(db, "a", { action: "act", game: view.id, move, seq: g.seq });
}
assert.equal(view.status, "finished");
assert.equal(db.settled.length, 1);
assert.ok(db.settled[0].withBots);
assert.ok(view.rewards.a);

// Лобби на двоих со ставкой: бедный не сядет, второй садится, хозяин начинает.
db = fakeDb();
view = await handle(db, "a", { action: "create", settings: { mode: "classic", deck: 24, seats: 2, stake: 2000, bots: false } });
const id = view.id;
await assert.rejects(() => handle(db, "c", { action: "join", game: id }), error => error instanceof GameError && error.code === "not_enough_dollars");
await assert.rejects(() => handle(db, "b", { action: "start", game: id }), error => error.code === "not_member");
view = await handle(db, "b", { action: "join", game: id });
assert.equal(view.seats.length, 2);
await assert.rejects(() => handle(db, "b", { action: "start", game: id }), error => error.code === "host_only");
view = await handle(db, "a", { action: "start", game: id });
assert.equal(view.status, "playing");
assert.equal(db.dollars.a, 3000);
assert.equal(db.dollars.b, 3000);
// Чужие карты не видны
const bview = await handle(db, "b", { action: "view", game: id });
const aHand = view.game.hand;
assert.ok(aHand.every(card => !bview.game.hand.includes(card)));
assert.equal(JSON.stringify(bview).includes(`"hand":${JSON.stringify(aHand)}`), false);
// Чат: ссылка запрещена, обычный текст проходит
await assert.rejects(() => handle(db, "a", { action: "say", game: id, text: "http://x" }), error => error.code === "forbidden");
view = await handle(db, "a", { action: "say", game: id, emote: "hi" });
assert.equal(view.chat.length, 1);
// Доиграть вдвоём
guard = 0;
while (view.status === "playing" && guard++ < 800) {
  const raw = [...db.games.values()][0].state;
  const must = D.mustAct(raw);
  const who = must[0];
  const user = ["a", "b"][who];
  view = await handle(db, user, { action: "act", game: id, move: D.botAction(raw, who) });
}
assert.equal(view.status, "finished");
assert.equal(db.dollars.a + db.dollars.b, 10000, "dollars are conserved between people");
// Реванш
view = await handle(db, "b", { action: "rematch", game: id });
assert.equal(view.status, "playing");
assert.equal(view.round, 2);
console.log("durak server ok");
