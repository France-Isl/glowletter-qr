/*
  Русские шашки на доллары (01.11): партия живёт на сервере (supabase/functions/durak/checkers.js —
  точная копия этого файла), клиент только показывает доску и подсвечивает разрешённые ходы.
  Интерфейс тот же, что у GlowDurak (newGame, apply, mustAct, botAction, viewFor), поэтому стол,
  таймер хода, ставки и боты на сервере общие.

  Доска — 64 клетки, 0 пусто, 1 белая, 2 белая дамка, -1 чёрная, -2 чёрная дамка. Белые снизу
  (ряды 5–7) и ходят первыми. Правила как в «Игровом столе»: бить обязательно, назад бьют и
  простые шашки, дамка ходит и бьёт на любое расстояние, побитые снимаются после хода (турецкий
  удар запрещён), шашка, дошедшая до края во время боя, бьёт дальше уже дамкой.

  Конец партии: нет ходов — поражение; сдача; ничья, если 30 ходов подряд (по 15 у каждого)
  ходили только дамки без взятий, или партия дошла до 300 ходов.
*/
(function (root) {
  "use strict";

  const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const QUIET_DRAW = 30;
  const MAX_PLIES = 300;
  const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const isInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const clone = value => JSON.parse(JSON.stringify(value));

  function initial() {
    const board = new Array(64).fill(0);
    for (let square = 0; square < 64; square += 1) {
      const r = Math.floor(square / 8);
      if ((r + (square % 8)) % 2 !== 1) continue;
      if (r <= 2) board[square] = -1;
      else if (r >= 5) board[square] = 1;
    }
    return board;
  }

  // Все цепочки взятия для шашки на from.
  function captures(board, from) {
    const piece = board[from];
    const color = Math.sign(piece);
    const promoteRow = color > 0 ? 0 : 7;
    const work = board.slice();
    work[from] = 0;
    const out = [];
    const steps = (pos, king, taken) => {
      const list = [];
      for (const [dr, dc] of DIRS) {
        let r = Math.floor(pos / 8) + dr;
        let c = (pos % 8) + dc;
        if (king) while (inside(r, c) && work[r * 8 + c] === 0) { r += dr; c += dc; }
        if (!inside(r, c)) continue;
        const victim = r * 8 + c;
        if (Math.sign(work[victim]) !== -color || taken.includes(victim)) continue;
        const lands = [];
        let lr = r + dr;
        let lc = c + dc;
        while (inside(lr, lc) && work[lr * 8 + lc] === 0) {
          lands.push(lr * 8 + lc);
          if (!king) break;
          lr += dr;
          lc += dc;
        }
        if (lands.length) list.push({ victim, lands });
      }
      return list;
    };
    const walk = (pos, king, taken, path) => {
      const list = steps(pos, king, taken);
      if (!list.length) {
        if (taken.length) out.push({ path, captured: taken, king });
        return;
      }
      for (const { victim, lands } of list) {
        const nextTaken = [...taken, victim];
        let options = lands.map(land => ({ land, king: king || Math.floor(land / 8) === promoteRow }));
        // Дамка обязана встать туда, откуда бой продолжается, если такое поле есть.
        if (options.length > 1) {
          const going = options.filter(option => steps(option.land, option.king, nextTaken).length > 0);
          if (going.length) options = going;
        }
        for (const option of options) walk(option.land, option.king, nextTaken, [...path, option.land]);
      }
    };
    walk(from, Math.abs(piece) === 2, [], [from]);
    return out;
  }

  // Все разрешённые ходы цвета: если можно бить — только взятия.
  function moves(board, color) {
    const taking = [];
    const quiet = [];
    for (let from = 0; from < 64; from += 1) {
      if (Math.sign(board[from]) !== color) continue;
      taking.push(...captures(board, from));
      if (taking.length) continue;
      const king = Math.abs(board[from]) === 2;
      for (const [dr, dc] of DIRS) {
        if (!king && dr !== -color) continue;
        let r = Math.floor(from / 8) + dr;
        let c = (from % 8) + dc;
        while (inside(r, c) && board[r * 8 + c] === 0) {
          quiet.push({ path: [from, r * 8 + c], captured: [], king: king || r === (color > 0 ? 0 : 7) });
          if (!king) break;
          r += dr;
          c += dc;
        }
      }
    }
    return taking.length ? taking : quiet;
  }

  function play(board, move) {
    const next = board.slice();
    const color = Math.sign(board[move.path[0]]);
    next[move.path[0]] = 0;
    move.captured.forEach(square => { next[square] = 0; });
    next[move.path[move.path.length - 1]] = color * (move.king ? 2 : 1);
    return next;
  }

  const pathOk = path => Array.isArray(path) && path.length >= 2 && path.length <= 14 && path.every(square => isInt(square, 0, 63));

  function find(board, color, path) {
    if (!pathOk(path)) return null;
    return moves(board, color).find(move => move.path.length === path.length && move.path.every((square, index) => square === path[index])) || null;
  }

  const colorOf = (state, i) => (i === state.white ? 1 : -1);
  const seatOf = (state, color) => (color === 1 ? state.white : 1 - state.white);

  function newGame({ players, rng = Math.random, firstAttacker = null }) {
    if (!Array.isArray(players) || players.length !== 2) throw new Error("players");
    const white = isInt(firstAttacker, 0, 1) ? firstAttacker : (rng() < 0.5 ? 0 : 1);
    return {
      kind: "checkers",
      players: players.map(player => ({ id: player.id, name: player.name || "", bot: Boolean(player.bot) })),
      white, board: initial(), color: 1, seq: 0, plies: 0, quiet: 0,
      phase: "play", durak: -1, order: [], reason: "", last: null
    };
  }

  function mustAct(state) {
    return state.phase === "play" ? [seatOf(state, state.color)] : [];
  }

  function finish(state, loser, reason) {
    state.phase = "over";
    state.reason = reason;
    state.durak = loser;
    state.order = loser >= 0 ? [1 - loser] : [];
  }

  function apply(input, who, action) {
    if (input.phase !== "play") throw new Error("over");
    if (!isInt(who, 0, 1)) throw new Error("seat");
    const state = clone(input);
    if (action?.type === "resign") {
      state.seq += 1;
      finish(state, who, "resign");
      return state;
    }
    if (action?.type !== "move" || seatOf(state, state.color) !== who) throw new Error("turn");
    const move = find(state.board, state.color, action.path);
    if (!move) throw new Error("illegal");
    const piece = Math.abs(state.board[move.path[0]]);
    state.board = play(state.board, move);
    state.last = { path: move.path.slice(), captured: move.captured.slice(), color: state.color };
    state.color = -state.color;
    state.seq += 1;
    state.plies += 1;
    state.quiet = move.captured.length || piece === 1 ? 0 : state.quiet + 1;
    if (!moves(state.board, state.color).length) finish(state, seatOf(state, state.color), "blocked");
    else if (state.quiet >= QUIET_DRAW || state.plies >= MAX_PLIES) finish(state, -1, "draw");
    return state;
  }

  // Бот: берёт как можно больше, не подставляется под взятие и рад выйти в дамки.
  function botAction(state, who) {
    if (state.phase !== "play" || seatOf(state, state.color) !== who) return null;
    const color = state.color;
    const list = moves(state.board, color);
    if (!list.length) return null;
    let best = null;
    let bestScore = -Infinity;
    for (const move of list) {
      const after = play(state.board, move);
      const replies = moves(after, -color);
      const danger = replies.reduce((most, reply) => Math.max(most, reply.captured.length), 0);
      const promoted = move.king && Math.abs(state.board[move.path[0]]) === 1;
      const end = move.path[move.path.length - 1];
      const edge = end % 8 === 0 || end % 8 === 7 ? 0.4 : 0;
      const score = move.captured.length * 10 + (promoted ? 6 : 0) - danger * 9 + edge + Math.random() * 0.8;
      if (score > bestScore) { bestScore = score; best = move; }
    }
    return { type: "move", path: best.path.slice() };
  }

  // Следующая партия: цвета меняются.
  function nextFirst(state) {
    return 1 - state.white;
  }

  function viewFor(state, i) {
    const mine = isInt(i, 0, 1);
    const turn = state.phase === "play" ? seatOf(state, state.color) : -1;
    return {
      kind: "checkers", me: mine ? i : -1, side: mine ? colorOf(state, i) : 0, white: state.white,
      board: state.board.slice(), color: state.color, turn,
      legal: mine && turn === i ? moves(state.board, state.color).map(move => move.path) : [],
      capture: state.phase === "play" && moves(state.board, state.color).some(move => move.captured.length > 0),
      players: state.players.map((player, k) => ({
        id: player.id, name: player.name, bot: player.bot, side: colorOf(state, k),
        pieces: state.board.filter(value => Math.sign(value) === colorOf(state, k)).length
      })),
      must: mustAct(state), phase: state.phase, durak: state.durak, order: state.order.slice(),
      reason: state.reason, seq: state.seq, quiet: state.quiet, last: state.last ? clone(state.last) : null
    };
  }

  const api = { initial, captures, moves, play, find, newGame, apply, mustAct, botAction, nextFirst, viewFor };
  root.GlowCheckers = Object.freeze(api);
})(typeof globalThis !== "undefined" ? globalThis : this);
