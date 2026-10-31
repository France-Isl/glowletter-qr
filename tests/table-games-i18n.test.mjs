import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// 2.4.26: тексты семи игр «Игрового стола» на 22 языках (ru, en, fr — в самих играх, остальные — table-i18n.js).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8").replaceAll("\r\n", "\n");

const LANGUAGES = ["de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
// who, pics, guess — игры на компанию до четырёх человек (table-group.js).
const GAMES = ["sea", "four", "checkers", "lost", "explain", "sketch", "talk", "who", "pics", "guess"];
const BANNED = /мелоди|песн|музык|обожа|обожню|adore|adoro|\bmusic|\bsong|melod/iu;

// Игры регистрируются через GlowLetterTable.register — забираем их тексты.
const registered = {};
const gameWindow = {
  __GLOWLETTER_TEST__: true,
  GlowLetterTable: { register(game) { registered[game.id] = game.text; } }
};
const gameContext = vm.createContext({ window: gameWindow, matchMedia: () => ({ matches: false }) });
vm.runInContext(read("table-board.js"), gameContext);
vm.runInContext(read("table-party.js"), gameContext);
vm.runInContext(read("table-group.js"), gameContext);
assert.deepEqual(Object.keys(registered).sort(), [...GAMES].sort(), "all ten games registered");

const window = {};
const context = vm.createContext({ window });
vm.runInContext(read("table-i18n.js"), context);
// Повторная загрузка ничего не ломает, а тексты стола (.table) не затираются.
vm.runInContext(read("table-i18n.js"), context);
const dictionary = window.GLOWLETTER_TABLE_I18N;

const placeholders = value => [...String(value).matchAll(/\{(\w+)\}/gu)].map(match => match[1]).sort().join(",");

// Медвежонок зовётся так же, как в «Мы вдвоём» (couple-i18n.js).
const BEAR = { de: "Teddy", es: "Osito", it: "Orsetto", pl: "Miś", uk: "Ведмедик", pt: "Ursinho", nl: "Beertje", tr: "Ayıcık", ro: "Ursuleț", cs: "Méďa", sv: "Nalle", el: "Αρκουδάκι", da: "Bamse", no: "Bamse", fi: "Nalle", ja: "くまちゃん", ko: "곰돌이", zh: "小熊", th: "หมีน้อย", ar: "الدبدوب", ind: "Beruang Kecil", vi: "Gấu Bông" };

const counts = {};
for (const game of GAMES) {
  const en = registered[game].en;
  const keys = Object.keys(en);
  counts[game] = keys.length;
  for (const code of ["ru", "fr"]) assert.deepEqual(Object.keys(registered[game][code]).sort(), [...keys].sort(), `${game}: ${code} has the same keys as en`);
  for (const code of LANGUAGES) {
    assert.ok(dictionary?.[code]?.table && typeof dictionary[code].table === "object", `${code}.table kept`);
    const text = dictionary[code][game];
    assert.ok(text && typeof text === "object", `${code}.${game}`);
    for (const key of keys) {
      const value = text[key];
      assert.equal(typeof value, "string", `${code}.${game}.${key}`);
      assert.ok(value.trim(), `${code}.${game}.${key} is empty`);
      assert.equal(placeholders(value), placeholders(en[key]), `${code}.${game}.${key} placeholders`);
      assert.doesNotMatch(value, BANNED, `${code}.${game}.${key} wording`);
    }
    assert.deepEqual(Object.keys(text).filter(key => !(key in en)), [], `${code}.${game}: no unknown keys`);
    assert.ok(text.short.length <= 40, `${code}.${game}.short is ${text.short.length} characters`);
  }
}

for (const code of LANGUAGES) {
  // Названия цветов делятся по запятой — их ровно восемь, как и цветов кисти.
  assert.equal(dictionary[code].sketch.colorNames.split(",").filter(item => item.trim()).length, 8, `${code}.sketch.colorNames`);
  assert.ok(dictionary[code].lost.title.includes(BEAR[code]), `${code}: bear name in lost.title`);
  assert.ok(dictionary[code].lost.home.includes(BEAR[code]), `${code}: bear name in lost.home`);
}

console.log(JSON.stringify({ ok: true, languages: LANGUAGES.length, games: GAMES.length, keys: counts, total: Object.values(counts).reduce((a, b) => a + b, 0) * LANGUAGES.length }));
