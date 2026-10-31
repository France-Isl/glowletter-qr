import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// «Игровой стол»: правила «Морского боя», «Четырёх в ряд» и русских шашек
// (table-board.js) — чистые функции через тестовый крючок.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "table-board.js"), "utf8");

// Массивы из vm — из другого «мира», сравниваем через JSON.
const eq = (actual, expected, message) => assert.deepEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(expected)), message);

const testWindow = { __GLOWLETTER_TEST__: true };
vm.runInNewContext(source, { window: testWindow, Math, JSON });
const T = testWindow.GlowLetterTableBoardTest;
assert.ok(T, "test hook must be exported when __GLOWLETTER_TEST__ is set");

// Без флага крючка нет, а без стола файл тихо выходит.
const plainWindow = {};
vm.runInNewContext(source, { window: plainWindow });
assert.equal(plainWindow.GlowLetterTableBoardTest, undefined);

// ——— Морской бой ———

let seed = 12345;
const random = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
for (let round = 0; round < 400; round += 1) {
  const boats = T.seaPlace(round % 2 ? random : Math.random);
  assert.ok(boats, "placement must always succeed");
  assert.ok(T.seaValid(boats), `placement ${round} must be valid: ${JSON.stringify(boats)}`);
  const cells = boats.flat();
  assert.equal(cells.length, 20);
  // Ни одна клетка чужой лодки не соседствует (даже углом) с другой лодкой.
  boats.forEach((boat, index) => {
    const zone = new Set(boat.flatMap(T.seaNeighbors));
    boats.forEach((other, otherIndex) => {
      if (otherIndex !== index) assert.ok(other.every(cell => !zone.has(cell)), "boats must not touch");
    });
  });
}

const fleet = [[0, 1, 2, 3], [5, 6, 7], [16, 24, 32], [18, 19], [21, 22], [48, 56], [34], [37], [52], [63]];
assert.ok(T.seaValid(fleet), "hand-made fleet is valid");
assert.equal(T.seaValid([...fleet.slice(0, 9), [45]]), false, "45 touches 37 diagonally? (36/37/38 row 4) → touching");
assert.equal(T.seaValid([...fleet.slice(0, 6), [26], [37], [52], [63]]), false, "26 touches 18/19 diagonally");
assert.equal(T.seaValid(fleet.slice(1)), false, "fleet needs ten boats");
assert.equal(T.seaValid([[0, 1, 2, 3], [5, 6, 7], [16, 24, 32], [18, 19], [21, 22], [48, 56], [34, 35], [37], [52], [63]]), false, "wrong sizes");
assert.equal(T.seaLine([7, 8]), false, "a boat cannot wrap across rows");
assert.equal(T.seaLine([0, 9]), false, "a boat cannot be diagonal");
assert.equal(T.seaLine([16, 24, 32]), true);
assert.equal(T.seaLine([3, 1, 2]), true, "order does not matter");

const received = new Set();
let shot = T.seaShoot(fleet, received, 4);
eq([shot.hit, shot.sunk], [false, false], "miss");
shot = T.seaShoot(fleet, received, 1);
eq([shot.hit, shot.sunk], [true, false], "hit, not sunk");
received.add(1); received.add(0); received.add(2);
shot = T.seaShoot(fleet, received, 3);
eq([shot.hit, shot.sunk, shot.all], [true, true, false], "last cell sinks the four");
eq(shot.cells, [0, 1, 2, 3]);
shot = T.seaShoot(fleet, new Set(), 34);
eq([shot.hit, shot.sunk, shot.cells], [true, true, [34]], "single boat sinks at once");
const allButOne = new Set(fleet.flat().filter(cell => cell !== 63));
assert.equal(T.seaShoot(fleet, allButOne, 63).all, true, "the last boat ends the game");
eq(T.seaAround([34]).sort((a, b) => a - b), [25, 26, 27, 33, 35, 41, 42, 43]);
assert.equal(T.seaName(0), "A1");
assert.equal(T.seaName(12), "E2");

// ——— Четыре в ряд ———

let four = T.fourPlay([0, 0, 1, 1, 2, 2, 3]);
assert.equal(four.winner, 0, "horizontal win");
eq(four.line.map(([c, r]) => `${c}${r}`).sort(), ["00", "10", "20", "30"]);
four = T.fourPlay([0, 1, 0, 1, 0, 1, 0]);
assert.equal(four.winner, 0, "vertical win");
four = T.fourPlay([0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3]);
assert.equal(four.winner, 0, "diagonal / win");
eq(four.line.map(([c, r]) => `${c}${r}`).sort(), ["00", "11", "22", "33"]);
four = T.fourPlay([6, 5, 5, 4, 4, 3, 4, 3, 3, 0, 3]);
assert.equal(four.winner, 0, "diagonal \\ win");
eq(four.line.map(([c, r]) => `${c}${r}`).sort(), ["33", "42", "51", "60"]);
four = T.fourPlay([6, 0, 0, 1, 1, 2, 2, 3]);
assert.equal(four.winner, 1, "second player can win too");
assert.equal(T.fourPlay([0, 0, 1, 1, 2, 2, 3, 4]).valid, false, "no moves after a win");
assert.equal(T.fourPlay([0, 0, 0, 0, 0, 0, 0]).valid, false, "column holds six");
assert.equal(T.fourPlay([7]).valid, false, "column out of range");
four = T.fourPlay([3, 3]);
eq([four.winner, four.over, four.next], [-1, false, 0]);

// Ничья: ищем полное поле без четвёрок перебором с возвратом.
function findDraw(moves = []) {
  if (moves.length === 42) return moves;
  for (let step = 0; step < 7; step += 1) {
    const column = (moves.length * 3 + step) % 7;
    const next = T.fourPlay([...moves, column]);
    if (!next.valid || next.winner >= 0) continue;
    const found = findDraw([...moves, column]);
    if (found) return found;
  }
  return null;
}
const drawMoves = findDraw();
assert.ok(drawMoves, "a drawn game exists");
four = T.fourPlay(drawMoves);
eq([four.valid, four.draw, four.over, four.winner], [true, true, true, -1], "full board without four is a draw");

// ——— Шашки (русские правила) ———

const sq = (name) => ("abcdefgh".indexOf(name[0])) + (8 - Number(name[1])) * 8;
const empty = () => new Array(64).fill(0);
const paths = moves => moves.map(move => move.path.map(T.ckName).join("-")).sort();

assert.equal(T.ckName(sq("c3")), "c3");
const start = T.ckInitial();
assert.equal(start.filter(v => v === 1).length, 12);
assert.equal(start.filter(v => v === -1).length, 12);
assert.equal(start[sq("a1")], 1, "a1 is a dark square with a white piece");
assert.equal(T.ckMoves(start, 1).length, 7, "seven opening moves for white");
eq(paths(T.ckMoves(start, 1)), ["a3-b4", "c3-b4", "c3-d4", "e3-d4", "e3-f4", "g3-f4", "g3-h4"]);
assert.equal(T.ckMoves(start, -1).length, 7, "seven opening moves for black");

// Бить обязательно: есть взятие — тихие ходы запрещены.
let board = empty();
board[sq("c3")] = 1; board[sq("d4")] = -1; board[sq("g1")] = 1; board[sq("h8")] = -1;
eq(paths(T.ckMoves(board, 1)), ["c3-e5"], "capture is mandatory");

// Простая шашка бьёт назад, но ходит только вперёд.
board = empty();
board[sq("d4")] = 1; board[sq("c3")] = -1; board[sq("a7")] = -1;
eq(paths(T.ckMoves(board, 1)), ["d4-b2"], "a man captures backwards");
board = empty();
board[sq("d4")] = 1;
eq(paths(T.ckMoves(board, 1)), ["d4-c5", "d4-e5"], "a man moves forward only");
board = empty();
board[sq("d5")] = -1;
eq(paths(T.ckMoves(board, -1)), ["d5-c4", "d5-e4"], "black moves down");

// Цепочка: остановиться посреди нельзя.
board = empty();
board[sq("b2")] = 1; board[sq("c3")] = -1; board[sq("e5")] = -1; board[sq("h8")] = -1;
let moves = T.ckMoves(board, 1);
eq(paths(moves), ["b2-d4-f6"], "multi-jump must be completed");
eq(moves[0].captured.map(T.ckName).sort(), ["c3", "e5"]);
assert.equal(moves[0].king, false);

// Развилка в цепочке — оба пути разрешены (русские правила не требуют максимума).
board = empty();
board[sq("c1")] = 1; board[sq("d2")] = -1; board[sq("f4")] = -1; board[sq("d4")] = -1; board[sq("f6")] = -1;
eq(paths(T.ckMoves(board, 1)), ["c1-e3-c5", "c1-e3-g5-e7"], "any capture chain may be chosen, both completed");

// Превращение посреди взятия: дальше бьёт как дамка в том же ходу.
board = empty();
board[sq("b6")] = 1; board[sq("c7")] = -1; board[sq("f6")] = -1; board[sq("a1")] = -1;
moves = T.ckMoves(board, 1);
eq(paths(moves), ["b6-d8-g5", "b6-d8-h4"], "promoted man keeps capturing as a flying king");
assert.ok(moves.every(move => move.king), "the move ends as a king");
let after = T.ckApply(board, moves[0]);
assert.equal(after[sq("g5")], 2);
assert.equal(after[sq("c7")], 0);
assert.equal(after[sq("f6")], 0);
assert.equal(after[sq("b6")], 0);

// Дошла до края без продолжения — дамка, ход окончен.
board = empty();
board[sq("c7")] = 1;
moves = T.ckMoves(board, 1);
assert.ok(moves.every(move => move.king), "reaching the last row promotes");
assert.equal(T.ckApply(board, moves[0])[moves[0].path[1]], 2);

// Дамка летает: тихие ходы на любую дальность.
board = empty();
board[sq("a1")] = 2;
assert.equal(T.ckMoves(board, 1).length, 7, "a flying king slides the whole diagonal");

// Дамка бьёт издалека и встаёт на любое свободное поле за шашкой…
board = empty();
board[sq("a1")] = 2; board[sq("d4")] = -1;
eq(paths(T.ckMoves(board, 1)), ["a1-e5", "a1-f6", "a1-g7", "a1-h8"], "flying king capture with free landing");
// …но если с одного из полей бой продолжается, она обязана встать туда.
board[sq("e7")] = -1;
moves = T.ckMoves(board, 1);
eq(paths(moves), ["a1-f6-d8"], "the king must land where the capture continues");
eq(moves[0].captured.map(T.ckName).sort(), ["d4", "e7"]);

// Побитую шашку нельзя перепрыгнуть второй раз, и она мешает до конца хода.
board = empty();
board[sq("c1")] = 2; board[sq("d2")] = -1; board[sq("f4")] = -1; board[sq("f6")] = -1; board[sq("d6")] = -1;
moves = T.ckMoves(board, 1);
for (const move of moves) {
  assert.equal(new Set(move.captured).size, move.captured.length, "no piece is captured twice");
}
assert.ok(moves.some(move => move.captured.length === 4), "the king can go round the square");

// Свои шашки и две подряд чужие закрывают удар.
board = empty();
board[sq("a1")] = 2; board[sq("c3")] = -1; board[sq("d4")] = -1;
assert.equal(T.ckMoves(board, 1).some(move => move.captured.length), false, "two pieces in a row cannot be jumped");
board = empty();
board[sq("a1")] = 2; board[sq("b2")] = 1; board[sq("d4")] = -1;
assert.equal(T.ckMoves(board, 1).some(move => move.captured.length), false, "own piece blocks the king");

// Проверка пришедшего хода и партия по списку.
assert.ok(T.ckFind(start, 1, [sq("c3"), sq("d4")]));
assert.equal(T.ckFind(start, 1, [sq("c3"), sq("c4")]), null, "illegal destination");
assert.equal(T.ckFind(start, -1, [sq("c3"), sq("d4")]), null, "wrong colour");
assert.equal(T.ckFind(start, 1, "c3-d4"), null, "bad shape");
let game = T.ckReplay([[sq("c3"), sq("d4")], [sq("f6"), sq("e5")]]);
assert.equal(game.valid, true);
assert.equal(game.color, 1);
eq(paths(game.moves), ["d4-f6"], "white must capture after c3-d4 f6-e5");
assert.equal(T.ckReplay([[sq("c3"), sq("d4")], [sq("f6"), sq("e5")], [sq("g3"), sq("h4")]]).valid, false, "skipping a capture is rejected");

// Победа: у соперника нет шашек или нет ходов.
board = empty();
board[sq("a1")] = 1; board[sq("b2")] = -1; board[sq("c3")] = -1;
assert.equal(T.ckMoves(board, 1).length, 0, "blocked side has no moves");
board = empty();
board[sq("b2")] = 1;
assert.equal(T.ckMoves(board, -1).length, 0, "no pieces — no moves");

// ——— Тексты и регистрация ———

const defs = [];
vm.runInNewContext(source, { window: { GlowLetterTable: { register: def => defs.push(def) } } });
eq(defs.map(def => def.id), ["sea", "four", "checkers"]);
const forbidden = /обожа|adore|adoro|обожн|мелоди|песн|музык|melod|song|music|chanson|musique/iu;
for (const def of defs) {
  assert.equal(typeof def.mount, "function");
  eq(Object.keys(def.text), ["ru", "en", "fr"]);
  const keys = Object.keys(def.text.ru).sort();
  for (const lang of ["en", "fr"]) eq(Object.keys(def.text[lang]).sort(), keys, `${def.id}.${lang} keys`);
  for (const [lang, text] of Object.entries(def.text)) {
    assert.ok(text.title && text.short, `${def.id}.${lang} title/short`);
    assert.ok(text.short.length <= 40, `${def.id}.${lang}.short ≤ 40: ${text.short}`);
    for (const [key, value] of Object.entries(text)) {
      assert.doesNotMatch(value, forbidden, `${def.id}.${lang}.${key}`);
      const placeholders = value => (String(value).match(/\{\w+\}/gu) || []).sort().join();
      assert.equal(placeholders(value), placeholders(def.text.ru[key]), `${def.id}.${lang}.${key} placeholders`);
    }
  }
}

console.log("table-board tests passed");
