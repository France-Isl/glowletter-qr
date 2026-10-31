import assert from "node:assert/strict";
import "../durak-engine.js";

const D = globalThis.GlowDurak;
let seed = 1;
const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

// Масти и ранги, бой карт
assert.equal(D.makeDeck(36).length, 36);
assert.equal(D.makeDeck(24).length, 24);
assert.ok(D.beats("7h", "6h", "s"));
assert.ok(!D.beats("6h", "7h", "s"));
assert.ok(D.beats("6s", "14h", "s"));
assert.ok(!D.beats("14h", "6s", "s"));
assert.ok(!D.beats("14d", "6h", "s"));

function total(state) {
  return state.deck.length + state.discard.length + state.table.reduce((n, pair) => n + (pair.d ? 2 : 1), 0) + state.players.reduce((n, p) => n + p.hand.length, 0);
}

let games = 0, draws = 0, transfers = 0, takes = 0;
for (const players of [2, 3, 4]) for (const deckSize of [24, 36]) for (const mode of ["classic", "transfer"]) for (let g = 0; g < 120; g += 1) {
  seed = players * 100000 + deckSize * 1000 + g * 7 + (mode === "transfer" ? 1 : 0);
  let state = D.newGame({ players: Array.from({ length: players }, (_, i) => ({ id: `p${i}`, name: `P${i}`, bot: true })), mode, deckSize, rng });
  // честная раздача: ни у кого нет 5+ карт одной масти
  for (const p of state.players) for (const suit of D.SUITS) assert.ok(p.hand.filter(c => c.endsWith(suit)).length < 5);
  const unique = new Set([...state.deck, ...state.players.flatMap(p => p.hand)]);
  assert.equal(unique.size, deckSize);
  let steps = 0;
  while (state.phase === "play") {
    steps += 1;
    assert.ok(steps < 3000, "game must end");
    const must = D.mustAct(state);
    assert.ok(must.length, "someone must act");
    const who = must[Math.floor(rng() * must.length)];
    const random = g % 3 === 0;
    const legal = D.legalActions(state, who);
    assert.ok(legal.length, "who must act has a move");
    const action = random ? legal[Math.floor(rng() * legal.length)] : D.botAction(state, who);
    assert.ok(action, "bot always decides");
    if (action.type === "transfer") transfers += 1;
    if (action.type === "take") takes += 1;
    state = D.apply(state, who, action);
    assert.equal(total(state), deckSize, "cards are conserved");
    assert.ok(state.table.length <= 6);
    for (const p of state.players) if (!p.out && state.deck.length) assert.ok(p.hand.length >= 0);
  }
  games += 1;
  if (state.durak < 0) draws += 1;
  const v = D.viewFor(state, 0);
  assert.equal(v.phase, "over");
  assert.equal(v.hand.length, state.players[0].hand.length);
}
assert.ok(transfers > 0 && takes > 0);

// Незаконные ходы отклоняются
seed = 42;
const s0 = D.newGame({ players: [{ id: "a" }, { id: "b" }], deckSize: 36, rng });
const notMine = s0.players[s0.defender].hand[0];
assert.throws(() => D.apply(s0, s0.attacker, { type: "attack", card: notMine }));
assert.throws(() => D.apply(s0, s0.defender, { type: "attack", card: notMine }));
assert.throws(() => D.apply(s0, s0.attacker, { type: "pass" }));
// Чужие карты в виде не видны
const view = D.viewFor(s0, 0);
assert.equal(JSON.stringify(view).includes(s0.players[1].hand[0]) && !s0.players[0].hand.includes(s0.players[1].hand[0]) && s0.trumpCard !== s0.players[1].hand[0] ? "leak" : "ok", "ok");
console.log(`durak engine ok: ${games} games, ${draws} draws, ${transfers} transfers, ${takes} takes`);
