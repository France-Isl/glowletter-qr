import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// «Слово дня на двоих» (word.js): списки слов, алфавиты, слово дня, цвета букв, тексты на 25 языках.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const LIST_LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ar", "ind"];
const ENGLISH_FALLBACK = ["ja", "ko", "zh", "th", "vi"];

const word = read("word.js").replaceAll("\r\n", "\n");
const lists = vm.runInNewContext(`${read("word-lists.js")}; ({ words: window.GLOWLETTER_WORDS, rules: window.GLOWLETTER_WORD_RULES })`, { window: {} });

// Чистые функции word.js выполняются отдельно от DOM.
const pureFrom = word.indexOf("// <pure>");
const pureTo = word.indexOf("// </pure>");
assert.ok(pureFrom > 0 && pureTo > pureFrom, "pure block markers");
const pure = vm.runInNewContext(`${word.slice(pureFrom, pureTo)}; ({ dayKey, dayNumber, wordIndex, foldWord, evaluate })`, {});

// Списки: все алфавитные языки, ≥ 250 слов, ровно 5 букв, только буквы алфавита, без повторов (с учётом É→E и т. п.).
assert.deepEqual(Object.keys(lists.words).sort(), [...LIST_LANGUAGES].sort());
assert.deepEqual(Object.keys(lists.rules).sort(), [...LIST_LANGUAGES].sort());
for (const lang of ENGLISH_FALLBACK) assert.equal(lists.words[lang], undefined, `${lang} plays the English list`);
const counts = {};
for (const lang of LIST_LANGUAGES) {
  const rule = lists.rules[lang];
  const alphabet = Array.from(rule.alphabet);
  assert.equal(new Set(alphabet).size, alphabet.length, `${lang} alphabet has no repeats`);
  assert.ok(alphabet.length >= 24 && alphabet.length <= 42, `${lang} alphabet size ${alphabet.length}`);
  const words = lists.words[lang];
  assert.ok(Array.isArray(words) && words.length >= 250, `${lang}: ${words.length} words`);
  const seen = new Set();
  for (const item of words) {
    assert.equal(item, item.normalize("NFC"), `${lang} NFC: ${item}`);
    assert.equal(Array.from(item).length, 5, `${lang} length: ${item}`);
    assert.equal(item, item.toLocaleUpperCase(rule.locale || "en"), `${lang} uppercase: ${item}`);
    const folded = pure.foldWord(item, rule);
    assert.ok(folded && Array.from(folded).length === 5, `${lang} letters: ${item}`);
    assert.ok(Array.from(folded).every(letter => alphabet.includes(letter)), `${lang} alphabet: ${item}`);
    assert.ok(!seen.has(folded), `${lang} duplicate: ${item}`);
    seen.add(folded);
  }
  counts[lang] = words.length;
}
assert.equal(lists.rules.ar.rtl, true);
assert.equal(pure.foldWord("ёлка", lists.rules.ru), "ЕЛКА");
assert.equal(pure.foldWord("école", lists.rules.fr), "ECOLE");
assert.equal(pure.foldWord("niño", lists.rules.es), "NIÑO");
assert.equal(pure.foldWord("kapı", lists.rules.tr), "KAPI");
assert.equal(pure.foldWord("kitap", lists.rules.tr), "KİTAP");
assert.equal(pure.foldWord("σπίτι", lists.rules.el), "ΣΠΙΤΙ");
assert.equal(pure.foldWord("أَرْنَب", lists.rules.ar), "ارنب");
assert.equal(pure.foldWord("ţară", lists.rules.ro), "ȚARĂ");
assert.equal(pure.foldWord("quest", lists.rules.pl), null, "Polish has no Q");

// Запретные слова: ни в списках, ни в текстах (правила владельца), и нигде нет чужой торговой марки.
const BANNED_WORDS = /^(ПЕСНЯ|ПІСНЯ|CHANT|CANTO|PIEŚŃ|PÍSEŇ|ŞARKI|LAULU|MUSIK|أغنية|SERCE|SRDCE|INIMĂ|SYDÄN|HEART)$/u;
for (const lang of LIST_LANGUAGES) for (const item of lists.words[lang]) assert.doesNotMatch(item, BANNED_WORDS, `${lang} banned: ${item}`);
for (const file of ["word.js", "word-i18n.js", "word-lists.js", "word.css"]) assert.doesNotMatch(read(file), /wordle/iu, `${file} trademark`);

// Слово дня: дата UTC, одинаковое для всех; внутри круга из N дней слова не повторяются и не идут подряд.
assert.equal(pure.dayKey(Date.UTC(2026, 9, 31, 23, 59, 59)), "2026-10-31");
assert.equal(pure.dayNumber("1970-01-01"), 0);
assert.equal(pure.dayNumber("2026-10-31"), 20757);
for (const size of [250, 281, 305, 337, 512, 513]) {
  for (const cycle of [0, 83, 84]) {
    const seen = new Set();
    let inOrder = 0;
    let previous = -1;
    for (let day = cycle * size; day < (cycle + 1) * size; day += 1) {
      const index = pure.wordIndex(day, size);
      assert.ok(Number.isInteger(index) && index >= 0 && index < size);
      seen.add(index);
      if (index === previous + 1) inOrder += 1;
      previous = index;
    }
    assert.equal(seen.size, size, `permutation for size ${size}, cycle ${cycle}`);
    assert.ok(inOrder < size * 0.05, `not walking in order (${inOrder}/${size})`);
  }
  assert.equal(pure.wordIndex(20757, size), pure.wordIndex(20757, size), "deterministic");
}

// Цвета: повторы букв считаются честно.
const evaluate = (guess, answer) => [...pure.evaluate(guess, answer)];
assert.deepEqual(evaluate("APPLE", "APPLE"), ["right", "right", "right", "right", "right"]);
assert.deepEqual(evaluate("LEVEL", "HELLO"), ["present", "right", "absent", "absent", "present"]);
assert.deepEqual(evaluate("EERIE", "THEME"), ["present", "absent", "absent", "absent", "right"]);
assert.deepEqual(evaluate("ALLOY", "LLAMA"), ["present", "right", "present", "absent", "absent"]);

// Тексты: все ключи на всех 25 языках, с теми же плейсхолдерами; без запретных слов.
const extra = vm.runInNewContext(`${read("word-i18n.js")}; window.GLOWLETTER_WORD_I18N`, { window: {} });
const textFrom = word.indexOf("const TEXT = {");
const textTo = word.indexOf("\n  Object.entries(window.GLOWLETTER_WORD_I18N");
const TEXT = vm.runInNewContext(`(${word.slice(textFrom + 13, textTo).trim().replace(/;$/u, "")})`);
assert.deepEqual(Object.keys(TEXT), ["ru", "en", "fr"]);
assert.deepEqual(Object.keys(extra).sort(), LANGUAGES.filter(code => !TEXT[code]).sort());
const KEYS = Object.keys(TEXT.en);
assert.ok(KEYS.length >= 40);
const placeholders = value => (String(value).match(/\{\w+\}/gu) || []).sort().join(",");
for (const code of LANGUAGES) {
  const text = TEXT[code] || extra[code];
  assert.deepEqual(Object.keys(text).sort(), [...KEYS].sort(), `${code} keys`);
  for (const key of KEYS) {
    assert.ok(String(text[key] || "").trim(), `${code}.${key}`);
    assert.equal(placeholders(text[key]), placeholders(TEXT.en[key]), `${code}.${key} placeholders`);
  }
  assert.doesNotMatch(JSON.stringify(text), /мелоди|песн|пісн|музык|музик|\bmusic|\bsong|\bkiss|\bhug|обож|\badore|adoro|wordle/iu, `${code} wording`);
}

// Модуль: только render; RPC с нужными именами и аргументами; ошибки already_played / premium_required разобраны;
// в строке «Поделиться» нет самого слова; хранилище всегда в try/catch; экранирование.
assert.match(word, /window\.GlowLetterWord = Object\.freeze\(\{ render \}\);/u);
assert.match(word, /ctx\.rpc\("glowletter_word_submit", \{ p_day: day, p_lang: lang, p_solved: solved\(\), p_attempts: state\.guesses\.length, p_seconds: seconds\(\) \}\)/u);
assert.match(word, /ctx\.rpc\("glowletter_word_friends", \{ p_day: day \}\)/u);
assert.match(word, /already_played/u);
assert.match(word, /premium_required[\s\S]{0,80}openPaywall/u);
const shareLine = word.slice(word.indexOf("function squaresText"), word.indexOf("async function share"));
assert.match(shareLine, /evaluate\(guess, answer\)\.map\(mark => SQUARES\[mark\]\)/u);
assert.match(shareLine, /return `\$\{tr\("title"\)\} · \$\{solved\(\) \? state\.guesses\.length : "X"\}\/\$\{MAX_TRIES\}\\n\$\{lines\.join\("\\n"\)\}`;/u, "share line hides the word");
assert.doesNotMatch(shareLine, /answerRaw|state\.current|\$\{guess/u);
for (const match of word.matchAll(/localStorage\.\w+\(/gu)) {
  const before = word.slice(Math.max(0, match.index - 40), match.index);
  assert.match(before, /try \{/u, "storage access inside try");
}
assert.match(word, /const escapeHtml = /u);
assert.match(word, /prefers-reduced-motion/u);
const css = read("word.css");
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/u);
assert.match(css, /\.glw-tile\.is-right::after/u);
assert.match(css, /min-height: 48px/u);
assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/iu, "colours come from tokens");

console.log(JSON.stringify({ ok: true, languages: LANGUAGES.length, keys: KEYS.length, counts }));
