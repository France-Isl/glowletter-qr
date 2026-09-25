import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const app = read("app.js");
const worker = read("sw.js");
const emailAuth = read("email-auth.js");
const moments = read("moments.js");
const experience = read("experience.js");
const androidMain = read("mobile/android/app/src/main/java/com/franceisl/nurpismo/MainActivity.java");
const ios = read("mobile/ios/NurPismo/WebViewContainer.swift");
const migration = read("supabase/migrations/20260925190000_twenty_five_languages.sql");

const LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const NEW_LANGUAGES = ["de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];

const run = (source, sandbox = {}) => {
  const context = { window: {}, ...sandbox };
  vm.runInNewContext(source, context);
  return context;
};
const extra = run(read("i18n-extra.js")).window;
const letters = run(read("letters.js")).window.NUR_LETTERS;

// Двадцать пять языков объявлены одним списком, у каждого есть самоназвание.
assert.deepEqual([...extra.NUR_LANGUAGES], LANGUAGES);
assert.deepEqual(Object.keys(extra.NUR_LANGUAGE_NAMES), LANGUAGES);
assert.deepEqual(Object.keys(extra.NUR_I18N_EXTRA), NEW_LANGUAGES);

// Все 50 писем написаны на всех двадцати пяти языках.
assert.equal(letters.length, 50);
for (const letter of letters) {
  for (const code of LANGUAGES) {
    assert.equal(typeof letter[code], "string", `letter ${letter.id} has no ${code}`);
    assert.ok(letter[code].length > 40, `letter ${letter.id} ${code} is too short`);
    assert.equal(letter[code].includes("{to}"), letter.en.includes("{to}"), `letter ${letter.id} ${code} recipient placeholder`);
  }
}

// Словари берутся из исходных английских: ни одна фраза не пропала, а подстановки
// {name}, {to} и HTML-разметка заголовков остались на месте.
const grabObject = (source, startPattern) => {
  const start = source.search(startPattern);
  assert.ok(start >= 0, `missing ${startPattern}`);
  const open = source.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let position = open; position < source.length; position += 1) {
    const character = source[position];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") { quote = character; continue; }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return run(`this.value = ${source.slice(open, position + 1)};`).value;
    }
  }
  throw new Error(`unterminated ${startPattern}`);
};
const dictionaryStart = app.indexOf("  const UI = {");
const dictionaryEnd = app.indexOf("  const PICKER_TEXT = {");
const pickerEnd = app.indexOf("  // German, Spanish, Italian and Polish come from i18n-extra.js.");
assert.ok(dictionaryStart > 0 && dictionaryEnd > dictionaryStart && pickerEnd > dictionaryEnd);
const appDictionaries = run(`${app.slice(dictionaryStart, pickerEnd)}\nthis.UI = UI; this.PICKER_TEXT = PICKER_TEXT;`);
const onlyStrings = object => Object.fromEntries(Object.entries(object).filter(([, value]) => typeof value === "string"));
const sources = {
  app: onlyStrings(appDictionaries.UI.en),
  picker: appDictionaries.PICKER_TEXT.en,
  email: grabObject(emailAuth, /const COPY = \{/u).en,
  moments: grabObject(moments, /const TEXT = \{/u).en,
  experience: grabObject(experience, /const TEXT = \{/u).en
};
const placeholders = value => [...String(value).matchAll(/\{[a-zA-Z0-9_]+\}/gu)].map(match => match[0]).sort();
const markup = value => [...String(value).matchAll(/<\/?[a-z]+[^>]*>/gu)].map(match => match[0]).sort();
const selfNamedLanguageKeys = new Set(["languageRu", "languageEn", "languageFr"]);
for (const code of NEW_LANGUAGES) {
  for (const [section, english] of Object.entries(sources)) {
    const translated = extra.NUR_I18N_EXTRA[code][section];
    assert.ok(translated, `${code} has no ${section}`);
    for (const [key, value] of Object.entries(english)) {
      if (section === "moments" && selfNamedLanguageKeys.has(key)) continue;
      assert.equal(typeof translated[key], "string", `${code}.${section}.${key} is missing`);
      assert.ok(translated[key].trim(), `${code}.${section}.${key} is empty`);
      assert.deepEqual(placeholders(translated[key]), placeholders(value), `${code}.${section}.${key} placeholders`);
      assert.deepEqual(markup(translated[key]), markup(value), `${code}.${section}.${key} markup`);
    }
  }
}

// Доступ «навсегда» больше не продаётся и не обещается ни на одном языке:
// сервис живёт, пока работает, а слово «навсегда» звучало бы как обман.
const foreverWords = /навсегда|forever|lifetime|à vie|für immer|para siempre|per sempre|na zawsze|назавжди|para sempre|voor altijd|levenslang|sonsuza|pentru totdeauna|navždy|för alltid|για πάντα|for altid|for evigt|for alltid|for evig|ikuisesti|elinikäi|永遠|永久|一生|영원히|평생|영구|終身|ตลอดไป|ตลอดกาล|ตลอดชีวิต|ชั่วชีวิต|للأبد|إلى الأبد|مدى الحياة|selamanya|seumur hidup|mãi mãi|vĩnh viễn|trọn đời|suốt đời/iu;
const accessKeys = ["full", "onePurchase", "paywallBody", "payButton", "payYearlyButton", "yearlyBadge", "storeNote", "buy", "unlock", "allLetters", "premiumOn", "subscriptionNoteStore", "subscriptionNotePermanent", "accountPlanPermanent", "vipNoticeTitleForever", "vipNoticeBodyForever", "adminGrantForever", "adminGrantForeverDone"];
for (const code of LANGUAGES) {
  const dictionary = NEW_LANGUAGES.includes(code) ? extra.NUR_I18N_EXTRA[code].app : onlyStrings(appDictionaries.UI[code]);
  for (const key of accessKeys) {
    assert.equal(typeof dictionary[key], "string", `${code}.${key} is missing`);
    assert.doesNotMatch(dictionary[key], foreverWords, `${code}.${key} promises access forever`);
  }
}
assert.doesNotMatch(index, /навсегда/u);

// Файл переводов грузится после писем и до приложения, а офлайн-кэш его хранит.
const scriptOrder = ["letters.js", "i18n-extra.js", "app.js", "email-auth.js", "moments.js", "experience.js"]
  .map(file => index.indexOf(`<script src="${file}?v=`));
assert.ok(scriptOrder.every(position => position > 0), "a script tag is missing");
assert.deepEqual([...scriptOrder].sort((a, b) => a - b), scriptOrder);
assert.match(worker, /"i18n-extra\.js\?v=\d+"/u);
assert.match(worker, /CORE_FILES = new Set\(\[[^\]]*"i18n-extra\.js"/u);

// В настройках по кнопке на язык, каждая подписана на своём языке. Китайский
// помечен традиционным письмом, индонезийский внутри приложения зовётся ind.
const HTML_LANG = { zh: "zh-Hant", ind: "id" };
for (const code of LANGUAGES) {
  assert.match(index, new RegExp(`data-lang="${code}" lang="${HTML_LANG[code] || code}">${code.toUpperCase()} <span>${extra.NUR_LANGUAGE_NAMES[code]}</span>`, "u"));
}
assert.match(read("styles.css"), /\.language-picker \{ display: grid; grid-template-columns: repeat\(4,minmax\(0,1fr\)\);/u);

// Приложение не держит свой короткий список языков, первый запуск говорит на языке
// телефона, а ссылки на письма всегда называют язык отправителя.
assert.doesNotMatch(app.slice(pickerEnd), /\[\s*"ru"\s*,\s*"en"\s*,\s*"fr"\s*\]\.includes/u);
assert.match(app, /const SUPPORTED_LANGUAGES = Object\.freeze\(Array\.isArray\(window\.NUR_LANGUAGES\)/u);
// Язык телефона — пока человек сам не выбрал язык; до 2.4.7 русский
// сохранялся всем по умолчанию, поэтому сохранённый «ru» выбором не считается.
assert.match(app, /\(chosenLanguage\(\) \|\| deviceLanguage\(\)\)/u);
assert.match(app, /const LANGUAGE_ALIASES = Object\.freeze\(\{ nb: "no", nn: "no", id: "ind", in: "ind" \}\);/u);
assert.match(app, /const HTML_LANGS = Object\.freeze\(\{ zh: "zh-Hant", ind: "id" \}\);/u);
assert.match(app, /const RTL_LANGUAGES = new Set\(\["ar"\]\);/u);
assert.match(app, /document\.documentElement\.lang = HTML_LANGS\[lang\] \|\| lang;\s*document\.documentElement\.dir = isRtl\(\) \? "rtl" : "ltr";/u);
assert.match(app, /const code = LANGUAGE_ALIASES\[raw\] \|\| raw;/u);
assert.match(app, /choice === "chosen" \|\| \(!choice && stored !== "ru"\)/u);
assert.match(app, /localStorage\.setItem\(LANGUAGE_CHOICE_KEY, picked \? "chosen" : "auto"\)/u);
// Кнопка языка открывает список всех семи языков, выбор запоминается.
assert.match(app, /\$\("#languageButton"\)\.addEventListener\("click",\(\)=>openPanel\(layers\.language\)\)/u);
assert.match(app, /lang=button\.dataset\.lang;rememberLanguageChoice\(\);applyLanguage\(\);/u);
assert.match(app, /language: \$\("#languageLayer"\)/u);
for (const code of LANGUAGES) {
  assert.match(index, new RegExp(`<div class="language-list">[\\s\\S]*data-lang="${code}" lang="${HTML_LANG[code] || code}" aria-pressed="false"><b>${code.toUpperCase()}</b><span>${extra.NUR_LANGUAGE_NAMES[code]}</span>`, "u"));
}
assert.match(read("styles.css"), /\.language-list button\.is-active \{ border-color:var\(--ui-accent\);background:var\(--ui-soft\); \}/u);
assert.match(app, /function t\(key\) \{ return UI\[lang\]\?\.\[key\] \|\| UI\.en\[key\] \|\| UI\.ru\[key\] \|\| key; \}/u);
assert.match(app, /url\.searchParams\.set\("lang", lang\);/u);
assert.doesNotMatch(app, /if \(lang === "ru"\) url\.searchParams\.delete\("lang"\)/u);
for (const [code, locale] of Object.entries({ de: "de-DE", es: "es-ES", it: "it-IT", pl: "pl-PL" })) {
  assert.match(app, new RegExp(`${code}: "${locale}"`, "u"));
  assert.match(androidMain, new RegExp(`startsWith\\("${code}"\\)\\) \\{\\s+return "${locale}";`, "u"));
  assert.match(ios, new RegExp(`"${code}": "${locale}"`, "u"));
}

// Цены по умолчанию «в месяц» и «в год» есть на каждом языке.
for (const [code, words] of Object.entries({ de: ["5,99 €/Monat", "24,99 €/Jahr"], es: ["5,99 €/mes", "24,99 €/año"], it: ["5,99 €/mese", "24,99 €/anno"], pl: ["5,99 €/mies.", "24,99 €/rok"] })) {
  for (const word of words) assert.ok(app.includes(`"${word}"`), `${code} price word ${word}`);
}

// Остальные модули берут новые языки из того же файла, запасной язык — английский.
assert.match(emailAuth, /COPY\[code\] = \{ \.\.\.COPY\.en, \.\.\.extra\.email \}/u);
assert.match(moments, /TEXT\[code\] = \{ \.\.\.TEXT\.en, \.\.\.extra\.moments \}/u);
assert.match(moments, /const LANGUAGES = Object\.freeze\(Array\.isArray\(window\.NUR_LANGUAGES\)/u);
assert.match(experience, /TEXT\[code\] = \{ \.\.\.TEXT\.en, \.\.\.extra\.experience \}/u);

// База и серверные функции принимают все двадцать пять языков.
for (const table of ["glowletter_progress", "glowletter_people", "glowletter_letters", "glowletter_support_tickets", "glowletter_content_reports"]) {
  assert.match(migration, new RegExp(`${table}_language_check\\s+check \\(language in \\('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi'\\)\\)`, "u"));
}
for (const fn of ["submit-support", "submit-content-report", "resolve-letter"]) {
  const source = read(`supabase/functions/${fn}/index.ts`);
  assert.match(source, /"ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"/u, `${fn} languages`);
}

// Фильтр запрещённых слов понимает новые языки и не трогает обычные письма и фразы.
const grabSource = (startPattern, endPattern) => {
  const start = app.search(startPattern);
  const rest = app.slice(start);
  return rest.slice(0, rest.search(endPattern));
};
const filter = run([
  grabSource(/const forbiddenStems = \[/u, /\n\s*const relationshipWords/u),
  grabSource(/function normalize\(value\)/u, /\n\s*function containsForbidden/u),
  grabSource(/function containsForbidden\(value\)/u, /\n\s*function containsReligiousAuthorityClaim/u),
  "this.containsForbidden = containsForbidden;"
].join("\n")).containsForbidden;
for (const letter of letters) {
  for (const code of LANGUAGES) assert.equal(filter(letter[code].replaceAll("{to}", "Anna")), false, `letter ${letter.id} ${code} is blocked`);
}
for (const phrase of ["Droga Mamo", "po drugiej stronie", "por nosotros", "por no decir nada", "до сих пор не могу забыть", "un nudo en la garganta", "mi amigo íntimo", "Matteo", "Małgorzata", "Jürgen", "Дорога мамо", "Querida mãe", "Lieve mama", "obrigado pelo apoio", "dank je voor je steun", "Sevgili annem", "Dragă mamă", "Milá maminko", "Kära mamma", "Αγαπημένη μου μαμά", "Kære mor", "Kjære mamma", "Rakas äiti", "お母さんへ", "사랑하는 엄마에게", "親愛的媽媽", "แม่ที่รัก", "أمي الحبيبة", "Ibu tersayang", "Mẹ yêu quý"]) {
  assert.equal(filter(phrase), false, `${phrase} should be allowed`);
}
for (const phrase of ["Scheiße", "kurwa", "vaffanculo", "gilipollas", "Glücksspiel", "szantaż", "s e x", "p o r n o", "drugs"]) {
  assert.equal(filter(phrase), true, `${phrase} should be blocked`);
}

console.log(JSON.stringify({ ok: true, languages: LANGUAGES, letters: letters.length }));
