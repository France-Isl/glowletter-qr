import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// 2.4.26: звонок, «Наш мир» и «Игровой стол» — тексты на 22 языках (ru, en, fr — в самих модулях).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8").replaceAll("\r\n", "\n");

const LANGUAGES = ["de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const BANNED = /мелоди|песн|музык|обож|\bmusic|\bsong|adore|adoro|обожн/iu;

function moduleText(file) {
  const source = read(file);
  const from = source.indexOf("const TEXT = {");
  assert.ok(from >= 0, `${file}: const TEXT`);
  const to = source.indexOf("\n  };", from);
  assert.ok(to > from, `${file}: end of TEXT`);
  return vm.runInNewContext(`(${source.slice(from + "const TEXT = ".length, to + 4)})`);
}

const window = {};
const context = vm.createContext({ window });
vm.runInContext(read("ultra-i18n.js"), context);
vm.runInContext(read("table-i18n.js"), context);
// Повторная загрузка ничего не ломает: языки дополняются, а не затираются.
vm.runInContext(read("table-i18n.js"), context);

const placeholders = value => [...String(value).matchAll(/\{(\w+)\}/gu)].map(match => match[1]).sort().join(",");

const modules = [
  ["call.js", window.GLOWLETTER_ULTRA_I18N, "call"],
  ["together.js", window.GLOWLETTER_ULTRA_I18N, "world"],
  ["table.js", window.GLOWLETTER_TABLE_I18N, "table"]
];

const counts = {};
for (const [file, dictionary, group] of modules) {
  const TEXT = moduleText(file);
  const keys = Object.keys(TEXT.en);
  assert.ok(keys.length > 10, `${file}: keys`);
  for (const code of ["ru", "fr"]) assert.deepEqual(Object.keys(TEXT[code]).sort(), [...keys].sort(), `${file}: ${code} has the same keys as en`);
  for (const code of LANGUAGES) {
    const text = dictionary?.[code]?.[group];
    assert.ok(text && typeof text === "object", `${code}.${group}`);
    for (const key of keys) {
      const value = text[key];
      assert.equal(typeof value, "string", `${code}.${group}.${key}`);
      assert.ok(value.trim(), `${code}.${group}.${key} is empty`);
      assert.equal(placeholders(value), placeholders(TEXT.en[key]), `${code}.${group}.${key} placeholders`);
      assert.doesNotMatch(value, BANNED, `${code}.${group}.${key} wording`);
    }
    assert.deepEqual(Object.keys(text).filter(key => !(key in TEXT.en)), [], `${code}.${group}: no unknown keys`);
    counts[group] = keys.length;
  }
}

// Медвежонок везде зовётся так же, как в «Мы вдвоём» (couple-i18n.js).
const couple = vm.runInNewContext(`${read("couple-i18n.js")}; window.GLOWLETTER_COUPLE_I18N`, { window: {} });
const BEAR = { de: "Teddy", es: "Osito", it: "Orsetto", pl: "Miś", uk: "Ведмедик", pt: "Ursinho", nl: "Beertje", tr: "Ayıcık", ro: "Ursuleț", cs: "Méďa", sv: "Nalle", el: "Αρκουδάκι", da: "Bamse", no: "Bamse", fi: "Nalle", ja: "くまちゃん", ko: "곰돌이", zh: "小熊", th: "หมีน้อย", ar: "الدبدوب", ind: "Beruang Kecil", vi: "Gấu Bông" };
for (const code of LANGUAGES) {
  assert.ok(couple[code].text.petTitle.includes(BEAR[code]), `${code}: bear name matches couple-i18n`);
  assert.ok(window.GLOWLETTER_ULTRA_I18N[code].call.bear.includes(BEAR[code]), `${code}: call.bear`);
  assert.ok(window.GLOWLETTER_ULTRA_I18N[code].world.pet.includes(BEAR[code]), `${code}: world.pet`);
}

console.log(JSON.stringify({ ok: true, languages: LANGUAGES.length, keys: counts }));
