import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handle, payouts, GameError } from "../supabase/functions/durak/durak_server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Серверная копия правил шашек совпадает с файлом приложения.
assert.equal(fs.readFileSync(path.join(root, "supabase/functions/durak/checkers.js"), "utf8"), fs.readFileSync(path.join(root, "checkers-engine.js"), "utf8"));

const C = globalThis.GlowCheckers;

// Правила: 12 на 12, белые первыми, бить обязательно.
let s = C.newGame({ players: [{ id: "a" }, { id: "b" }], firstAttacker: 0 });
assert.equal(s.board.filter(v => v === 1).length, 12);
assert.equal(s.board.filter(v => v === -1).length, 12);
assert.deepEqual(C.mustAct(s), [0]);
assert.equal(C.moves(s.board, 1).length, 7);
assert.throws(() => C.apply(s, 1, { type: "move", path: [21, 28] }), /turn/);
assert.throws(() => C.apply(s, 0, { type: "move", path: [40, 24] }), /illegal/);
const board = new Array(64).fill(0);
board[45] = 1; board[36] = -1; board[63] = -1;
const forced = C.moves(board, 1);
assert.equal(forced.length, 1);
assert.deepEqual(forced[0].path, [45, 27]);
assert.deepEqual(forced[0].captured, [36]);
// Сдача — поражение того, кто сдался, в любой момент.
const resigned = C.apply(s, 1, { type: "resign" });
assert.equal(resigned.phase, "over");
assert.equal(resigned.durak, 1);
assert.deepEqual(resigned.order, [0]);
// Вид: соперник видит доску, но свои ходы — только когда его очередь.
assert.equal(C.viewFor(s, 0).legal.length, 7);
assert.equal(C.viewFor(s, 1).legal.length, 0);
assert.equal(C.viewFor(s, 1).side, -1);
// Выплата: победитель забирает обе ставки, проигравший — «loss», не «дурак».
assert.deepEqual(payouts({ kind: "checkers", players: [{}, {}], durak: 1, order: [0] }, 1000), [{ result: "win", payout: 2000 }, { result: "loss", payout: 0 }]);
assert.deepEqual(payouts({ kind: "checkers", players: [{}, {}], durak: -1, order: [] }, 1000).map(p => p.payout), [1000, 1000]);

function fakeDb() {
  const games = new Map();
  const dollars = { a: 5000, b: 5000, c: 50 };
  const settled = [];
  return {
    games, dollars, settled,
    async identity(user) { return { name: user.toUpperCase(), banned: false, dollars: dollars[user] ?? 0, back: "back_classic" }; },
    async load(id) { const g = games.get(id); return g ? structuredClone(g) : null; },
    async insert(game) { games.set(game.id, structuredClone(game)); },
    async save(game) { const cur = games.get(game.id); if (!cur || cur.version !== game.version) return false; games.set(game.id, { ...structuredClone(game), version: game.version + 1 }); return true; },
    async mine() { return [...games.values()]; },
    async stake(id, round, users, stake) { const poor = users.filter(u => (dollars[u] ?? 0) < stake); if (poor.length) return { ok: false, poor }; users.forEach(u => { dollars[u] -= stake; }); return { ok: true }; },
    async settle(id, round, user, result, stake, payout, withBots) { dollars[user] += payout; settled.push({ user, result, stake, payout, withBots }); return { net: payout - stake }; },
    async textOk() { return true; },
    async useHint() { return true; },
    async broadcast() {}
  };
}

// Игр с ботами нет (владелец 31.10).
let db = fakeDb();
await assert.rejects(() => handle(db, "a", { action: "create", solo: true, settings: { kind: "checkers" } }), error => error instanceof GameError && error.code === "no_bots");
let view;

// Вдвоём со ставкой: чужой ход и чужой номер отклоняются, сдача платит сопернику.
db = fakeDb();
view = await handle(db, "a", { action: "create", settings: { kind: "checkers", stake: 2000, bots: false } });
const id = view.id;
await assert.rejects(() => handle(db, "c", { action: "join", game: id }), error => error instanceof GameError && error.code === "not_enough_dollars");
await handle(db, "b", { action: "join", game: id });
view = await handle(db, "a", { action: "start", game: id });
assert.equal(db.dollars.a, 3000);
assert.equal(db.dollars.b, 3000);
const mover = view.game.turn === view.game.me ? "a" : "b";
const waiter = mover === "a" ? "b" : "a";
const legal = (await handle(db, mover, { action: "view", game: id })).game.legal;
await assert.rejects(() => handle(db, waiter, { action: "act", game: id, move: { type: "move", path: legal[0] } }), error => error.code === "illegal");
await assert.rejects(() => handle(db, mover, { action: "act", game: id, move: { type: "move", path: [0, 9] } }), error => error.code === "illegal");
view = await handle(db, mover, { action: "act", game: id, move: { type: "move", path: legal[0] } });
assert.equal(view.game.turn === view.game.me, false);
view = await handle(db, waiter, { action: "act", game: id, move: { type: "resign" } });
assert.equal(view.status, "finished");
assert.equal(db.dollars[mover], 7000);
assert.equal(db.dollars[waiter], 3000);
assert.equal(db.settled.find(x => x.user === waiter).result, "loss");
assert.equal(db.settled.find(x => x.user === mover).withBots, false);
// Реванш: цвета меняются.
const whiteBefore = [...db.games.values()][0].state.white;
view = await handle(db, "a", { action: "rematch", game: id });
assert.equal([...db.games.values()][0].state.white, 1 - whiteBefore);
console.log("checkers server ok");
