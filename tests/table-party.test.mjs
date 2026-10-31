import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// «Игровой стол» (2.4.26): «Тёпа заблудился», «Объясни слово», «Угадай рисунок», «О чём поговорить».
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const LANGS = ["ru", "en", "fr"];
const BANNED = /мелоди|песн|музык|обож|поцел|обним|свидан|скучаю|kiss|hug|date night|adore|sexy|beer|wine|vodka|church|god\b|allah/iu;
// Сверх общего списка: ничего романтического, про танцы, алкоголь, религию и оружие — ни на одном языке.
const ALSO_BANNED = /\bmusic|\bsong|melod|chanson|musique|mélodie|danc|danse|танц|любов|in love|\blover|amour|bisou|câlin|embrass|wedding|свадьб|mariage|\bbed\b|кроват|\bpray|молит|prière|alcohol|алкогол|\bwar\b|войн|guerre|\bgun\b|пистолет|fusil|свин|cochon|\bporc\b|\bpork|\bbacon|ангел|angel|\bange\b|ведьм|witch|sorcière|призрак|ghost|fantôme/iu;

// Содержимое: формы, количества, без повторов в языке.
const window = {};
vm.runInNewContext(read("table-content.js"), { window });
const content = window.GLOWLETTER_TABLE_CONTENT;
assert.deepEqual(Object.keys(content).sort(), ["explain", "sketch", "talk"]);
const norm = value => String(value).toLowerCase().normalize("NFD").replace(/\p{M}+/gu, "").replace(/[’']/gu, " ").trim();
const MIN = { explain: 300, sketch: 200, talk: 150 };
for (const kind of Object.keys(MIN)) {
  for (const lang of LANGS) {
    const list = content[kind][lang];
    assert.ok(Array.isArray(list) && list.length >= MIN[kind], `${kind}.${lang}: ${list?.length}`);
    const texts = list.map(item => (kind === "talk" ? item.t : item));
    texts.forEach((value, index) => assert.ok(typeof value === "string" && value.trim() && value.length <= 140, `${kind}.${lang}[${index}]`));
    const seen = new Set();
    for (const value of texts) {
      assert.ok(!seen.has(norm(value)), `${kind}.${lang} duplicate: ${value}`);
      seen.add(norm(value));
    }
    const all = texts.join("\n");
    assert.doesNotMatch(all, BANNED, `${kind}.${lang} banned word`);
    assert.doesNotMatch(all, ALSO_BANNED, `${kind}.${lang} banned word (extra)`);
  }
}
// Слова для угадывания — без служебных символов, чтобы автопроверка их не ломала.
for (const kind of ["explain", "sketch"]) for (const lang of LANGS) for (const word of content[kind][lang]) assert.doesNotMatch(word, /[|{}<>]/u, word);
// Карточки разговора идут параллельно на всех языках: тот же номер — та же категория.
const CATEGORIES = ["childhood", "travel", "food", "dreams", "whatif", "funny"];
assert.equal(content.talk.ru.length, content.talk.en.length);
assert.equal(content.talk.fr.length, content.talk.en.length);
content.talk.en.forEach((card, index) => {
  assert.ok(CATEGORIES.includes(card.c), `talk category ${card.c}`);
  assert.equal(content.talk.ru[index].c, card.c, `talk.ru[${index}]`);
  assert.equal(content.talk.fr[index].c, card.c, `talk.fr[${index}]`);
});
for (const category of CATEGORIES) assert.ok(content.talk.en.filter(card => card.c === category).length >= 20, category);
// По-русски к игрокам — на «вы»: прошедшее время не выдаёт пол.
assert.doesNotMatch(content.talk.ru.map(card => card.t).join("\n"), /\bты\b|\bтебя\b|\bтебе\b|\bтвой\b|\bтвоя\b|\bтвоё\b/iu);

// Игры: регистрируются четыре, тексты на ru/en/fr без запретных слов, «short» не длиннее 40 знаков.
const games = [];
const sandbox = {
  window: { __GLOWLETTER_TEST__: true, GLOWLETTER_TABLE_CONTENT: content, GlowLetterTable: { register: game => games.push(game) } },
  matchMedia: () => ({ matches: false }),
  navigator: {}
};
const party = read("table-party.js");
vm.runInNewContext(party, sandbox);
const helpers = sandbox.window.GlowLetterTablePartyTest;
assert.ok(helpers, "test helpers exposed");
assert.deepEqual(games.map(game => game.id), ["lost", "explain", "sketch", "talk"]);
const sql = read("supabase/migrations/20261031100000_play_together.sql");
for (const game of games) {
  assert.match(sql, new RegExp(`'${game.id}'`, "u"), `${game.id} allowed by glowletter_play_results`);
  assert.equal(typeof game.mount, "function");
  assert.ok(game.icon && Number.isFinite(game.order));
  const keys = Object.keys(game.text.ru).sort();
  for (const lang of LANGS) {
    const text = game.text[lang];
    assert.deepEqual(Object.keys(text).sort(), keys, `${game.id}.${lang} keys`);
    assert.ok(text.title && text.short && text.short.length <= 40, `${game.id}.${lang}.short`);
    for (const key of keys) {
      assert.ok(String(text[key]).trim(), `${game.id}.${lang}.${key}`);
      const holes = value => (String(value).match(/\{\w+\}/gu) || []).sort().join();
      assert.equal(holes(text[key]), holes(game.text.ru[key]), `${game.id}.${lang}.${key} placeholders`);
    }
    const all = JSON.stringify(text);
    assert.doesNotMatch(all, BANNED, `${game.id}.${lang} banned word`);
    assert.doesNotMatch(all, ALSO_BANNED, `${game.id}.${lang} banned word (extra)`);
  }
  // Русские тексты без «ты сделал/сделала»: обращаемся на «вы».
  assert.doesNotMatch(JSON.stringify(game.text.ru), /\bты\b|\bтвой\b|\bтвоя\b/iu, `${game.id}.ru`);
}

// Лабиринт: одинаковый при одном зерне, всегда есть путь до домика, домик не на старте.
const { seeded, makeMaze, canMove, solve, LEVELS, DIRS, isGuess, normalize, shuffled, contentFor, clock } = helpers;
assert.deepEqual([...LEVELS], [7, 9, 11]);
for (const seed of [1, 2, 3, 42, 777, 2026, 123456789, 4294967295, 0xdeadbeef, 31102026]) {
  const rand = seeded(seed);
  const again = seeded(seed);
  for (const size of LEVELS) {
    const maze = makeMaze(size, rand);
    assert.deepEqual(JSON.parse(JSON.stringify(makeMaze(size, again))), JSON.parse(JSON.stringify(maze)), `maze ${seed}/${size} is the same on both phones`);
    assert.equal(maze.open.length, size * size);
    const length = solve(maze);
    assert.ok(length >= size - 1, `maze ${seed}/${size} solvable (${length})`);
    assert.ok(maze.start.x !== maze.home.x || maze.start.y !== maze.home.y);
    // Проходы симметричны, наружу выйти нельзя, все клетки достижимы.
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        DIRS.forEach((dir, index) => {
          const nx = x + dir.dx;
          const ny = y + dir.dy;
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) { assert.equal(canMove(maze, x, y, index), false); return; }
          assert.equal(canMove(maze, x, y, index), canMove(maze, nx, ny, (index + 2) % 4), `symmetric ${x},${y} ${dir.name}`);
        });
        assert.ok(solve({ ...maze, home: { x, y } }) >= 0, `cell ${x},${y} reachable`);
      }
    }
  }
}

// Ответы: регистр, ё=е, артикли, короткая фраза с ответом, небольшая опечатка.
assert.equal(normalize("  Ёжик!  "), "ежик");
assert.ok(isGuess("ЕЖ", "ёж"));
assert.ok(isGuess("Это мёд", "мёд"));
assert.ok(isGuess("le chat", "chat"));
assert.ok(isGuess("the teddy bear", "teddy bear"));
assert.ok(isGuess("sneeze", "to sneeze"));
assert.ok(isGuess("pasteque", "pastèque"));
assert.ok(isGuess("holodilnik", "holodilnik"));
assert.ok(isGuess("бутерброт", "бутерброд"));
assert.ok(isGuess("ice-cream", "ice cream"));
assert.ok(!isGuess("кот", "кит"));
assert.ok(!isGuess("", "кит"));
assert.ok(!isGuess("собака кошка лошадь корова овца", "овца"));
// Перестановка колоды — честная и повторяемая.
const deck = shuffled(50, seeded(9));
assert.deepEqual([...deck].sort((a, b) => a - b), Array.from({ length: 50 }, (_, index) => index));
assert.deepEqual(shuffled(50, seeded(9)), deck);
// Нет языка — английский.
assert.equal(contentFor("explain", "de"), content.explain.en);
assert.equal(contentFor("talk", "fr"), content.talk.fr);
assert.equal(clock(61000), "1:01");

// Правила синхронизации, которые легко сломать.
assert.match(party, /if \(!window\.GlowLetterTable\) return;/u);
assert.match(party, /left: timer\.left\(\)/u, "the round time goes as remaining ms");
assert.doesNotMatch(party, /Date\.now\(\) \+ data\./u);
assert.match(party, /api\.send\("need"/u, "a returning friend asks for the strokes");
assert.match(read("table-party.css"), /\.gltp-board[\s\S]*\.gltp-paper[\s\S]*\.gltp-talk-card/u);
assert.match(read("table-party.css"), /prefers-reduced-motion/u);

console.log("table-party: ok");
