import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// «Игровой стол» на четверых: до 4 игроков за столом, три игры на компанию, вопросы и тексты на 25 языках.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8").replaceAll("\r\n", "\n");

const LANGS = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const EXTRA = LANGS.slice(3);
const GROUP = ["who", "pics", "guess"];
const BANNED = /мелоди|песн|музык|обож|поцел|обним|свидан|скучаю|танц|кроват|\bkiss|\bhug\b|\bhugs\b|adore|adoro|\bmusic|\bsong|melod|musique|chanson|danc|danse|\bbed\b|sexy|\bwine\b|vodka|\bbeer\b|alcohol|алкогол/iu;

// ——— table.js: не больше четырёх за столом, пятый видит «Стол заполнен» ———
const table = read("table.js");
assert.match(table, /const MAX_PLAYERS = 4;/u);
assert.match(table, /state\.seated = list\.slice\(0, MAX_PLAYERS\)/u);
assert.match(table, /state\.full = Boolean\(me\) && list\.some\(item => item\.id === me\) && !state\.seated\.includes\(me\);/u);
assert.match(table, /function open\(\{ room, friend, players \} = \{\}\)/u, "open() accepts players besides friend");
assert.match(table, /onPlayers\?\.\(presentOf\(/u, "game instances get onPlayers");
assert.match(table, /onPartner\?\.\(state\.partner\)/u, "onPartner still works");
assert.match(table, /game\?\.record === false/u, "group games skip glowletter_play_record");
const NEW_TABLE_KEYS = ["full", "fullNote", "hereMany", "inviteMore", "inviteTitle", "inviteNone", "watching", "watchNote", "twoOnly", "players", "you"];
for (const lang of ["ru", "en", "fr"]) {
  const start = table.indexOf(`    ${lang}: {`);
  const block = table.slice(start, table.indexOf("\n    }", start));
  for (const key of NEW_TABLE_KEYS) assert.match(block, new RegExp(`\\b${key}: "[^"]+"`, "u"), `table.${lang}.${key}`);
}
assert.match(table, /full: "Стол заполнен"/u);

// ——— Регистрация игр ———
const registered = {};
const sandbox = {
  window: { __GLOWLETTER_TEST__: true, GlowLetterTable: { register(game) { registered[game.id] = game; } } },
  matchMedia: () => ({ matches: false }),
  navigator: {}
};
vm.createContext(sandbox);
vm.runInContext(read("table-board.js"), sandbox);
vm.runInContext(read("table-party.js"), sandbox);
vm.runInContext(read("table-group.js"), sandbox);
for (const id of GROUP) {
  const game = registered[id];
  assert.ok(game, `${id} registered`);
  assert.equal(game.players, 4, `${id}: up to four players`);
  assert.equal(game.record, false, `${id}: no server record`);
  assert.equal(typeof game.mount, "function");
}
for (const id of ["explain", "sketch", "talk"]) assert.equal(registered[id].players, 4, `${id} accepts four players`);
assert.equal(registered.lost.players, 3, "lost: one walker per level");
for (const id of ["sea", "four", "checkers"]) assert.equal(registered[id].players, 2, `${id} stays for two`);
assert.equal(registered.sea.watch, false, "sea: nothing to watch");

// ——— Подсчёт очков ———
const helper = sandbox.window.GlowLetterTableGroupTest;
assert.ok(helper, "group helpers exposed");
assert.equal(helper.ROUNDS, 8);
assert.equal(helper.ANSWER_MS, 20000);
// «Кто из нас»: голоса — очки того, кого выбрали; больше всех — в top.
assert.deepEqual(JSON.parse(JSON.stringify(helper.scoreRound("who", [1, 1, 0, 1], 4, 0))), { gain: [1, 3, 0, 0], top: [1] });
assert.deepEqual(JSON.parse(JSON.stringify(helper.scoreRound("who", [1, 0, null], 3, 0))), { gain: [1, 1, 0], top: [0, 1] });
// «Выбери картинку»: очко тем, кто совпал с большинством; если все разные — никому.
assert.deepEqual(JSON.parse(JSON.stringify(helper.scoreRound("pics", [2, 2, 0, 3], 4, 0))), { gain: [1, 1, 0, 0], top: [2] });
assert.deepEqual(JSON.parse(JSON.stringify(helper.scoreRound("pics", [0, 1, 2, 3], 4, 0))), { gain: [0, 0, 0, 0], top: [] });
assert.deepEqual(JSON.parse(JSON.stringify(helper.scoreRound("pics", [0, 0, 1, 1], 4, 0))), { gain: [1, 1, 1, 1], top: [0, 1] });
// «Угадай ответ»: последний аргумент — кто ведёт раунд; угадавшим по очку, ведущему — если угадал хоть кто-то.
assert.deepEqual(JSON.parse(JSON.stringify(helper.scoreRound("guess", [3, 3, 3, 0], 4, 1))), { gain: [1, 1, 1, 0], top: [3] });
assert.deepEqual(JSON.parse(JSON.stringify(helper.scoreRound("guess", [1, 2, 3, 0], 4, 0))), { gain: [0, 0, 0, 0], top: [1] });
assert.deepEqual(JSON.parse(JSON.stringify(helper.scoreRound("guess", [null, 2, 2], 3, 0))), { gain: [0, 0, 0], top: [] });
// Места: при равенстве — общее место, медали 🥇🥇🥉.
assert.deepEqual(helper.ranking([5, 7, 5, 1]).map(item => [item.index, item.place]), [[1, 1], [0, 2], [2, 2], [3, 4]]);
assert.deepEqual(helper.ranking([3, 3, 1]).map(item => item.place), [1, 1, 3]);

// ——— Вопросы на 25 языках: не меньше 40, в одном порядке, без запретных слов ———
const contentBox = { window: {} };
vm.runInNewContext(read("table-group-content.js") + read("table-group-content-i18n.js"), contentBox);
const content = contentBox.window.GLOWLETTER_TABLE_GROUP;
assert.deepEqual(Object.keys(content).sort(), [...GROUP].sort());
const counts = {};
for (const kind of GROUP) {
  const base = content[kind].en;
  assert.ok(base.length >= 40, `${kind}.en has ${base.length}`);
  counts[kind] = base.length;
  if (kind !== "who") {
    assert.equal(content[kind].emoji.length, base.length, `${kind}.emoji`);
    assert.ok(content[kind].emoji.every(row => Array.isArray(row) && row.length === 4 && row.every(item => typeof item === "string" && item)), `${kind}.emoji rows`);
  }
  for (const lang of LANGS) {
    const list = content[kind][lang];
    assert.ok(Array.isArray(list) && list.length >= 40, `${kind}.${lang}: ${list?.length}`);
    assert.equal(list.length, base.length, `${kind}.${lang} parallel to en`);
    const texts = kind === "guess" ? list.flat() : list;
    if (kind === "guess") assert.ok(list.every(item => Array.isArray(item) && item.length === 5), `${kind}.${lang} items have question + 4 options`);
    texts.forEach((value, index) => assert.ok(typeof value === "string" && value.trim() && value.length <= 140, `${kind}.${lang}[${index}]`));
    const questions = kind === "guess" ? list.map(item => item[0]) : list;
    assert.equal(new Set(questions).size, questions.length, `${kind}.${lang}: no duplicate questions`);
    assert.doesNotMatch(texts.join("\n"), BANNED, `${kind}.${lang} wording`);
  }
}
// По-русски — без «ты» и без прошедшего времени про игроков.
assert.doesNotMatch(content.who.ru.join("\n"), /\bты\b|\bтебя\b|\bтвой\b/iu);

// ——— Тексты игр и стола на 25 языках ———
const i18nBox = { window: {} };
vm.runInNewContext(read("table-i18n.js"), i18nBox);
const dictionary = i18nBox.window.GLOWLETTER_TABLE_I18N;
const placeholders = value => [...String(value).matchAll(/\{(\w+)\}/gu)].map(match => match[1]).sort().join(",");
for (const lang of EXTRA) {
  for (const key of NEW_TABLE_KEYS) assert.ok(String(dictionary[lang]?.table?.[key] || "").trim(), `${lang}.table.${key}`);
  assert.ok(dictionary[lang].table.title, `${lang}.table keeps older texts`);
}
for (const id of GROUP) {
  const en = registered[id].text.en;
  for (const lang of LANGS) {
    const text = ["ru", "en", "fr"].includes(lang) ? registered[id].text[lang] : dictionary[lang]?.[id];
    assert.ok(text, `${lang}.${id}`);
    assert.deepEqual(Object.keys(text).sort(), Object.keys(en).sort(), `${lang}.${id} keys`);
    for (const key of Object.keys(en)) {
      assert.ok(String(text[key]).trim(), `${lang}.${id}.${key}`);
      assert.equal(placeholders(text[key]), placeholders(en[key]), `${lang}.${id}.${key} placeholders`);
      assert.doesNotMatch(String(text[key]), BANNED, `${lang}.${id}.${key} wording`);
    }
    assert.ok(text.short.length <= 40, `${lang}.${id}.short`);
  }
}

// ——— Подключение: файлы на странице и в кеше приложения ———
const index = read("index.html");
const worker = read("sw.js");
const version = /table\.js\?v=(\d+)/u.exec(index)[1];
for (const file of ["table-group.css", "table-group-content.js", "table-group-content-i18n.js", "table-group.js"]) {
  assert.ok(index.includes(`${file}?v=${version}`), `${file} in index.html`);
  assert.ok(worker.includes(`"${file}?v=${version}"`), `${file} in sw.js`);
  assert.ok(worker.includes(`"${file}"`), `${file} in CORE_FILES`);
}
assert.ok(index.indexOf("table.js?v=") < index.indexOf("table-group.js?v="));
assert.ok(index.indexOf("table-group-content.js?v=") < index.indexOf("table-group-content-i18n.js?v="));

console.log(JSON.stringify({ ok: true, maxPlayers: 4, games: GROUP, languages: LANGS.length, items: counts }));
