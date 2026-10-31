/*
  Правила «Дурака» (01.11): подкидной и переводной, колода 24 или 36 карт, 2–4 игрока.
  Один файл работает и в приложении (подсветка ходов), и на сервере (supabase/functions/durak),
  где партия и живёт: раздачу, руки и ходы видит только сервер, каждому игроку он отдаёт
  его собственный вид стола (viewFor).

  Карта — строка «ранг + масть»: "6s", "10h", "14d" (11 валет, 12 дама, 13 король, 14 туз;
  s пики, c трефы, d бубны, h червы). Колода — массив, сверху берут с конца, deck[0] — козырь
  под колодой (виден всем).

  Раздача честная: перемешивание по Фишеру — Йейтсу случайными числами сервера (crypto),
  а если кому-то пришло 5 и больше карт одной масти — пересдача, как в классических правилах.
  Боты видят только то же, что и человек на их месте: свою руку, стол и вышедшие карты.
*/
(function (root) {
  "use strict";

  const SUITS = ["s", "c", "d", "h"];
  const HAND = 6;
  const MAX_LOG = 40;

  const rankOf = card => parseInt(card, 10);
  const suitOf = card => card.slice(-1);
  const clone = value => JSON.parse(JSON.stringify(value));

  function makeDeck(size) {
    const low = size === 24 ? 9 : 6;
    const deck = [];
    for (const suit of SUITS) for (let rank = low; rank <= 14; rank += 1) deck.push(`${rank}${suit}`);
    return deck;
  }

  function shuffle(deck, rng) {
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function beats(defense, attack, trump) {
    if (suitOf(defense) === suitOf(attack)) return rankOf(defense) > rankOf(attack);
    return suitOf(defense) === trump && suitOf(attack) !== trump;
  }

  function sortHand(hand, trump) {
    const order = { s: 0, c: 1, d: 2, h: 3 };
    return hand.slice().sort((a, b) => {
      const ta = suitOf(a) === trump ? 1 : 0, tb = suitOf(b) === trump ? 1 : 0;
      if (ta !== tb) return ta - tb;
      if (rankOf(a) !== rankOf(b)) return rankOf(a) - rankOf(b);
      return order[suitOf(a)] - order[suitOf(b)];
    });
  }

  const inGame = (state, i) => !state.players[i].out;
  function nextInGame(state, from) {
    const n = state.players.length;
    for (let step = 1; step <= n; step += 1) {
      const i = (from + step) % n;
      if (inGame(state, i)) return i;
    }
    return from;
  }
  const activeCount = state => state.players.filter(player => !player.out).length;
  const unbeaten = state => state.table.filter(pair => !pair.d).length;
  const allBeaten = state => state.table.length > 0 && state.table.every(pair => pair.d);
  const tableRanks = state => new Set(state.table.flatMap(pair => pair.d ? [rankOf(pair.a), rankOf(pair.d)] : [rankOf(pair.a)]));
  const capFor = state => state.firstBout ? 5 : HAND;

  function log(state, entry) {
    state.seq += 1;
    state.log.push({ n: state.seq, ...entry });
    if (state.log.length > MAX_LOG) state.log.splice(0, state.log.length - MAX_LOG);
  }

  function deal(players, size, rng) {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const deck = shuffle(makeDeck(size), rng);
      const hands = players.map(() => []);
      for (let round = 0; round < HAND; round += 1) for (const hand of hands) if (deck.length) hand.push(deck.pop());
      const fair = hands.every(hand => SUITS.every(suit => hand.filter(card => suitOf(card) === suit).length < 5));
      if (fair || attempt === 49) {
        // Козырь — карта под колодой; если колода роздана целиком (24 карты на четверых), — последняя розданная.
        const lastHand = hands[hands.length - 1];
        const trumpCard = deck.length ? deck[0] : lastHand[lastHand.length - 1];
        return { deck, hands, trumpCard };
      }
    }
    throw new Error("deal_failed");
  }

  function newGame({ players, mode = "classic", deckSize = 36, rng = Math.random, firstAttacker = null }) {
    if (!Array.isArray(players) || players.length < 2 || players.length > 4) throw new Error("players");
    if (![24, 36].includes(deckSize)) throw new Error("deck");
    if (!["classic", "transfer"].includes(mode)) throw new Error("mode");
    const dealt = deal(players, deckSize, rng);
    const trump = suitOf(dealt.trumpCard);
    const state = {
      mode, deckSize, trump, trumpCard: dealt.trumpCard,
      deck: dealt.deck,
      players: players.map((player, i) => ({ id: String(player.id), name: String(player.name || ""), bot: Boolean(player.bot), hand: dealt.hands[i], out: false, place: 0 })),
      discard: [], table: [], taking: false, passed: [],
      attacker: 0, defender: 1, limit: 5, firstBout: true,
      phase: "play", order: [], durak: -1, seq: 0, log: []
    };
    let attacker = Number.isInteger(firstAttacker) && firstAttacker >= 0 && firstAttacker < players.length ? firstAttacker : -1;
    if (attacker < 0) {
      let best = 99;
      state.players.forEach((player, i) => player.hand.forEach(card => {
        if (suitOf(card) === trump && rankOf(card) < best) { best = rankOf(card); attacker = i; }
      }));
    }
    if (attacker < 0) attacker = Math.floor(rng() * players.length);
    state.attacker = attacker;
    state.defender = nextInGame(state, attacker);
    state.limit = Math.min(capFor(state), state.players[state.defender].hand.length);
    log(state, { t: "deal", by: attacker });
    return state;
  }

  // Может ли игрок подкинуть эту карту прямо сейчас.
  function canThrow(state, i, card) {
    if (state.phase !== "play" || i === state.defender || !inGame(state, i)) return false;
    if (!state.players[i].hand.includes(card)) return false;
    if (state.table.length >= state.limit) return false;
    const defenderHand = state.players[state.defender].hand.length;
    if (!state.taking && unbeaten(state) >= defenderHand) return false;
    if (state.table.length === 0) return i === state.attacker;
    return tableRanks(state).has(rankOf(card));
  }

  function transferTarget(state) {
    const target = nextInGame(state, state.defender);
    return target === state.defender ? -1 : target;
  }

  function canTransfer(state, i, card) {
    if (state.mode !== "transfer" || state.phase !== "play" || i !== state.defender || state.taking) return false;
    if (!state.table.length || state.table.some(pair => pair.d)) return false;
    if (!state.players[i].hand.includes(card) || rankOf(card) !== rankOf(state.table[0].a)) return false;
    const target = transferTarget(state);
    if (target < 0) return false;
    const count = state.table.length + 1;
    return count <= capFor(state) && state.players[target].hand.length >= count;
  }

  function legalActions(state, i) {
    const actions = [];
    if (state.phase !== "play" || !state.players[i] || !inGame(state, i)) return actions;
    const hand = state.players[i].hand;
    if (i === state.defender) {
      if (!state.taking) {
        state.table.forEach((pair, slot) => {
          if (pair.d) return;
          for (const card of hand) if (beats(card, pair.a, state.trump)) actions.push({ type: "defend", card, slot });
        });
        for (const card of hand) if (canTransfer(state, i, card)) actions.push({ type: "transfer", card });
        if (state.table.length) actions.push({ type: "take" });
      }
      return actions;
    }
    for (const card of hand) if (canThrow(state, i, card)) actions.push({ type: "attack", card });
    if (state.table.length && (state.taking || allBeaten(state)) && !state.passed.includes(i)) actions.push({ type: "pass" });
    return actions;
  }

  function markOut(state) {
    if (state.deck.length) return;
    state.players.forEach((player, i) => {
      if (!player.out && player.hand.length === 0) {
        player.out = true;
        state.order.push(i);
        player.place = state.order.length;
        log(state, { t: "out", by: i });
      }
    });
  }

  function finishIfOver(state) {
    const active = activeCount(state);
    if (active > 1) return false;
    // Последний заход ещё можно отбить последними картами — тогда ничья.
    const defender = state.players[state.defender];
    if (active === 1 && !defender.out && !state.taking && unbeaten(state) > 0 && defender.hand.length <= unbeaten(state)) return false;
    state.phase = "over";
    const left = state.players.findIndex(player => !player.out);
    state.durak = left;
    state.discard.push(...state.table.flatMap(pair => pair.d ? [pair.a, pair.d] : [pair.a]));
    state.table = [];
    log(state, { t: "over", by: left });
    return true;
  }

  function endBout(state, took) {
    const cards = state.table.flatMap(pair => pair.d ? [pair.a, pair.d] : [pair.a]);
    const defender = state.defender;
    if (took) state.players[defender].hand.push(...cards);
    else state.discard.push(...cards);
    log(state, { t: took ? "take" : "beat", by: defender, cards });
    state.table = [];
    state.taking = false;
    state.passed = [];
    state.firstBout = false;
    // Добор: сначала тот, кто заходил, потом остальные по кругу, отбивавшийся — последним.
    const order = [];
    const n = state.players.length;
    for (let step = 0; step < n; step += 1) {
      const i = (state.attacker + step) % n;
      if (i !== defender && inGame(state, i)) order.push(i);
    }
    if (inGame(state, defender)) order.push(defender);
    const drawn = [];
    for (const i of order) {
      const hand = state.players[i].hand;
      let got = 0;
      while (hand.length < HAND && state.deck.length) { hand.push(state.deck.pop()); got += 1; }
      if (got) drawn.push([i, got]);
    }
    if (drawn.length) log(state, { t: "draw", drawn });
    markOut(state);
    if (finishIfOver(state)) return;
    let attacker;
    if (took) attacker = nextInGame(state, defender);
    else attacker = inGame(state, defender) ? defender : nextInGame(state, defender);
    state.attacker = attacker;
    state.defender = nextInGame(state, attacker);
    state.limit = Math.min(capFor(state), state.players[state.defender].hand.length);
  }

  // Кто ещё может подкинуть; кто не может — считается спасовавшим.
  function settle(state) {
    if (state.phase !== "play" || !state.table.length) return;
    const waiting = [];
    state.players.forEach((player, i) => {
      if (i === state.defender || !inGame(state, i) || state.passed.includes(i)) return;
      const can = player.hand.some(card => canThrow(state, i, card));
      if (!can) state.passed.push(i);
      else waiting.push(i);
    });
    if (waiting.length) return;
    if (state.taking) endBout(state, true);
    else if (allBeaten(state)) endBout(state, false);
  }

  function apply(input, i, action) {
    const state = clone(input);
    if (state.phase !== "play") throw new Error("over");
    const player = state.players[i];
    if (!player || player.out) throw new Error("not_playing");
    const type = action && action.type;
    const card = action && String(action.card || "");
    if (type === "attack") {
      if (!canThrow(state, i, card)) throw new Error("illegal");
      player.hand.splice(player.hand.indexOf(card), 1);
      state.table.push({ a: card, d: null });
      state.passed = [];
      log(state, { t: "attack", by: i, card });
    } else if (type === "defend") {
      const slot = Number(action.slot);
      const pair = state.table[slot];
      if (i !== state.defender || state.taking || !pair || pair.d || !player.hand.includes(card) || !beats(card, pair.a, state.trump)) throw new Error("illegal");
      player.hand.splice(player.hand.indexOf(card), 1);
      pair.d = card;
      state.passed = [];
      log(state, { t: "defend", by: i, card, slot });
    } else if (type === "transfer") {
      if (!canTransfer(state, i, card)) throw new Error("illegal");
      const target = transferTarget(state);
      player.hand.splice(player.hand.indexOf(card), 1);
      state.table.push({ a: card, d: null });
      state.attacker = i;
      state.defender = target;
      state.limit = Math.min(capFor(state), state.players[target].hand.length);
      state.passed = [];
      log(state, { t: "transfer", by: i, card, to: target });
    } else if (type === "take") {
      if (i !== state.defender || state.taking || !state.table.length) throw new Error("illegal");
      state.taking = true;
      state.passed = [];
      log(state, { t: "taking", by: i });
    } else if (type === "pass") {
      if (i === state.defender || !state.table.length || state.passed.includes(i) || !(state.taking || allBeaten(state))) throw new Error("illegal");
      state.passed.push(i);
      log(state, { t: "pass", by: i });
    } else {
      throw new Error("illegal");
    }
    markOut(state);
    if (finishIfOver(state)) return state;
    settle(state);
    return state;
  }

  // Чей ход сейчас обязателен (для таймера и ботов).
  function mustAct(state) {
    if (state.phase !== "play") return [];
    if (!state.table.length) return [state.attacker];
    if (!state.taking && unbeaten(state) > 0) return [state.defender];
    return state.players.map((_, i) => i).filter(i => i !== state.defender && inGame(state, i) && !state.passed.includes(i) && legalActions(state, i).some(action => action.type === "attack"));
  }

  // ——— Бот: решает только по своей руке, столу и вышедшим картам ———
  function value(card, trump) { return rankOf(card) + (suitOf(card) === trump ? 20 : 0); }

  function botAction(state, i) {
    const actions = legalActions(state, i);
    if (!actions.length) return null;
    const trump = state.trump;
    const deckLeft = state.deck.length;
    const hand = state.players[i].hand;
    if (i === state.defender) {
      const transfers = actions.filter(action => action.type === "transfer" && suitOf(action.card) !== trump);
      if (transfers.length) return transfers[0];
      const open = state.table.map((pair, slot) => ({ pair, slot })).filter(entry => !entry.pair.d);
      const used = new Set();
      let cost = 0, trumps = 0, plan = [];
      for (const { pair, slot } of open) {
        const options = hand.filter(card => !used.has(card) && beats(card, pair.a, trump)).sort((a, b) => value(a, trump) - value(b, trump));
        if (!options.length) return { type: "take" };
        const pick = options[0];
        used.add(pick);
        cost += value(pick, trump);
        if (suitOf(pick) === trump) { trumps += 1; if (rankOf(pick) >= 12 && deckLeft > 6) cost += 30; }
        plan.push({ type: "defend", card: pick, slot });
      }
      const stingy = deckLeft > 8 && (trumps > 1 || cost > 60) && state.table.length < 3;
      if (stingy) return { type: "take" };
      return plan[0];
    }
    const attacks = actions.filter(action => action.type === "attack").sort((a, b) => value(a.card, trump) - value(b.card, trump));
    if (!state.table.length) {
      // Заход: самая младшая некозырная, лучше та, у которой есть пара.
      const counts = {};
      hand.forEach(card => { counts[rankOf(card)] = (counts[rankOf(card)] || 0) + 1; });
      const plain = attacks.filter(action => suitOf(action.card) !== trump);
      const pool = plain.length ? plain : attacks;
      const paired = pool.filter(action => counts[rankOf(action.card)] > 1 && rankOf(action.card) <= 10);
      return (paired[0] || pool[0]);
    }
    const good = attacks.filter(action => suitOf(action.card) !== trump && (deckLeft === 0 || rankOf(action.card) <= 11));
    const late = deckLeft === 0 ? attacks : [];
    const pick = good[0] || (late.length && hand.length <= 3 ? late[0] : null);
    if (pick) return pick;
    return actions.find(action => action.type === "pass") || null;
  }

  function viewFor(state, i) {
    const me = state.players[i];
    return {
      me: i,
      mode: state.mode, deckSize: state.deckSize, trump: state.trump, trumpCard: state.trumpCard,
      deck: state.deck.length, discard: state.discard.length,
      attacker: state.attacker, defender: state.defender, limit: state.limit,
      table: state.table.map(pair => ({ a: pair.a, d: pair.d })),
      taking: state.taking, passed: state.passed.slice(),
      players: state.players.map(player => ({ id: player.id, name: player.name, bot: player.bot, count: player.hand.length, out: player.out, place: player.place })),
      hand: me ? sortHand(me.hand, state.trump) : [],
      legal: me ? legalActions(state, i) : [],
      must: mustAct(state),
      phase: state.phase, order: state.order.slice(), durak: state.durak, seq: state.seq,
      log: state.log.map(entry => entry.t === "take" || entry.t === "beat" ? { ...entry, cards: entry.cards.length } : entry)
    };
  }

  const api = { SUITS, makeDeck, shuffle, beats, sortHand, newGame, apply, legalActions, mustAct, botAction, viewFor, rankOf, suitOf };
  root.GlowDurak = Object.freeze(api);
})(typeof globalThis !== "undefined" ? globalThis : this);
