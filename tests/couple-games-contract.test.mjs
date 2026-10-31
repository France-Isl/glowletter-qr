import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// Игры для двоих (2.4.22): «Насколько хорошо ты меня знаешь?» и окно покупки
// «игры · развлечения · письма».
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const app = read("app.js");
const games = read("games.js").replaceAll("\r\n", "\n");
const gamesCss = read("games.css");
const worker = read("sw.js");
const migration = read("supabase/migrations/20261028090000_couple_quiz.sql");
const edge = read("supabase/functions/couple-quiz/index.ts");
const config = read("supabase/config.toml");

const LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const QUESTION_IDS = Array.from({ length: 60 }, (_, index) => `q${String(index + 1).padStart(2, "0")}`);
const ALL_QUESTION_IDS = Array.from({ length: 99 }, (_, index) => `q${String(index + 1).padStart(2, "0")}`);

// Словари: ru/en/fr в games.js, остальные двадцать два — в games-i18n.js.
const extra = vm.runInNewContext(`${read("games-i18n.js")}; window.GLOWLETTER_GAMES_I18N`, { window: {} });
assert.deepEqual(Object.keys(extra), LANGUAGES.slice(3));
const grab = (source, start, end) => {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `missing ${start}`);
  return vm.runInNewContext(`(${source.slice(from + start.length - 1, to).trim().replace(/;$/u, "")})`);
};
const TEXT = grab(games, "const TEXT = {", "\n  // Вопросы:");
const QUESTIONS = grab(games, "const QUESTIONS = {", "\n\n  // «Да или нет»");
const keys = Object.keys(TEXT.en);
const placeholders = value => (String(value).match(/\{\w+\}/gu) || []).sort().join();
for (const code of LANGUAGES) {
  const text = TEXT[code] || extra[code]?.text;
  const questions = QUESTIONS[code] || extra[code]?.questions;
  assert.ok(text && questions, `${code} games pack`);
  assert.deepEqual(Object.keys(text).sort(), [...keys].sort(), `${code} game texts`);
  for (const key of keys) assert.equal(placeholders(text[key]), placeholders(TEXT.en[key]), `${code}.${key} placeholders`);
  // ru/en/fr: q01–q60 в литерале, q61–q99 добавляются ниже в games.js; остальные языки — все 99 в паке.
  const expectedIds = QUESTIONS[code] ? QUESTION_IDS : ALL_QUESTION_IDS;
  assert.deepEqual(Object.keys(questions), expectedIds, `${code} questions`);
  for (const id of expectedIds) {
    assert.equal(questions[id].length, 5, `${code}.${id}`);
    assert.ok(questions[id].every(value => typeof value === "string" && value.trim()), `${code}.${id} empty`);
  }
  // Только добрые вопросы: ничего «18+», и слово «аудио» вместо «музыки».
  const all = JSON.stringify([text, questions]);
  assert.doesNotMatch(all, /18\s*\+|мелоди|песн|музык/iu, `${code} wording`);
}

// «Да или нет»: 40 карточек на всех языках, у каждой вопрос и две подписи.
const YES_NO = grab(games, "const YES_NO = {", "\n\n  // «Что мы любим»");
const CARD_IDS = Array.from({ length: 40 }, (_, index) => `c${String(index + 1).padStart(2, "0")}`);
for (const code of LANGUAGES) {
  const cards = YES_NO[code] || extra[code]?.yesNo;
  assert.ok(cards, `${code} yes/no cards`);
  // ru/en/fr: c01–c40 в литерале (c41–c90 добавляются ниже), остальные языки — все 90 в паке.
  const cardIds = YES_NO[code] ? CARD_IDS : Array.from({ length: 90 }, (_, index) => `c${String(index + 1).padStart(2, "0")}`);
  assert.deepEqual(Object.keys(cards), cardIds, `${code} cards`);
  for (const id of cardIds) assert.ok(cards[id].length === 3 && cards[id].every(value => typeof value === "string" && value.trim()), `${code}.${id}`);
  assert.doesNotMatch(JSON.stringify(cards), /18\s*\+|мелоди|песн|музык/iu, `${code} yes/no wording`);
}
assert.match(games, /channel\(`glowletter-yesno:\$\{yn\.roomId\}`/u);
assert.match(games, /const YES_NO_SECONDS = 5;/u);
const rooms = read("supabase/migrations/20261028110000_yes_no_rooms.sql");
assert.match(rooms, /private\.glowletter_has_paid_access\(owner_id\)[\s\S]*premium_required/u);
assert.match(rooms, /grant execute on function public\.glowletter_get_game_room\(uuid\) to service_role/u);
assert.match(edge, /glowletter_get_game_room/u);

// «Что мы любим»: 16 тем по 4 картинки на всех языках, и у каждой картинки есть файл.
const LOVES = grab(games, "const LOVES = {", "\n  Object.entries(window.GLOWLETTER_GAMES_I18N");
const SET_IDS = Array.from({ length: 16 }, (_, index) => `s${String(index + 1).padStart(2, "0")}`);
for (const code of LANGUAGES) {
  const sets = LOVES[code] || extra[code]?.loves;
  assert.ok(sets, `${code} loves`);
  // В паках уже лежат темы s17–s44 (картинки для них в работе).
  const setIds = LOVES[code] ? SET_IDS : Array.from({ length: 44 }, (_, index) => `s${String(index + 1).padStart(2, "0")}`);
  assert.deepEqual(Object.keys(sets), setIds, `${code} loves sets`);
  for (const id of setIds) assert.ok(sets[id].length === 5 && sets[id].every(value => typeof value === "string" && value.trim()), `${code}.${id}`);
  assert.doesNotMatch(JSON.stringify(sets), /18\s*\+|мелоди|песн|музык/iu, `${code} loves wording`);
}
for (const id of Array.from({ length: 44 }, (_, index) => `s${String(index + 1).padStart(2, "0")}`)) for (const choice of "abcd") assert.ok(fs.existsSync(path.join(root, `assets/loves/${id}${choice}.webp`)), `${id}${choice} picture`);
assert.match(read("supabase/migrations/20261028120000_loves_rooms.sql"), /kind in \('yesno', 'loves'\)/u);
// «Карточки с мишками»: та же комната, ведущий хранит поле, партнёр только просит открыть карточку.
assert.match(read("supabase/migrations/20261028130000_cards_rooms.sql"), /kind in \('yesno', 'loves', 'cards'\)/u);
assert.match(games, /const CARD_LEVELS = Object\.freeze\(\[\{ cards: 8,.*\{ cards: 12,.*\{ cards: 16,/u);
assert.match(games, /type: "mflip", index/u);
assert.match(games, /\["featCards"\], \["featDuel"\]\]\) \+ group\("groupFun", \[\["featCountries"\], \["featTruth"\], \["featHints"\], \["featDreams"\], \["featWho"\], \["featPhrase"\]\]\)/u);

// «Кто быстрее», «Кто из нас?», «Закончи фразу» (2.4.22): 40 вопросов и 30 фраз на всех языках.
const WHO = grab(games, "const WHO = {", "\n  const PHRASES = {");
const PHRASES = grab(games, "const PHRASES = {", "\n  Object.entries(window.GLOWLETTER_GAMES_I18N || {}).forEach(([code, pack]) => {\n    if (!WHO[code]");
for (const code of LANGUAGES) {
  const who = WHO[code] || extra[code]?.who;
  const phrases = PHRASES[code] || extra[code]?.phrases;
  assert.ok(Array.isArray(who) && who.length === (WHO[code] ? 40 : 85) && who.every(value => typeof value === "string" && value.trim()), `${code} who`);
  assert.ok(Array.isArray(phrases) && phrases.length === (PHRASES[code] ? 30 : 70) && phrases.every(value => typeof value === "string" && /…$/u.test(value.trim())), `${code} phrases`);
  assert.doesNotMatch(JSON.stringify([who, phrases]), /18\s*\+|мелоди|песн|музык|поцел|kiss/iu, `${code} who/phrases wording`);
}
const moreGames = read("supabase/migrations/20261028150000_more_games_book_settings.sql");
assert.match(moreGames, /kind in \('yesno', 'loves', 'cards', 'duel', 'who', 'phrase'\)/u);
assert.match(moreGames, /function public\.glowletter_check_phrase\(p_text text\)[\s\S]*?glowletter_phrase_is_forbidden/u);
assert.match(moreGames, /function public\.glowletter_book_add[\s\S]*?glowletter_phrase_is_forbidden\(clean_mine\)/u);
assert.match(moreGames, /alter table public\.glowletter_couple_book enable row level security/u);
assert.match(moreGames, /alter table public\.glowletter_user_settings enable row level security/u);
assert.match(games, /const ROOM_TITLES = Object\.freeze\(\{ yesno: "ynTitle", loves: "lvTitle", cards: "mcTitle", duel: "duTitle", who: "whoTitle", phrase: "phTitle", truth: "tfTitle", countries: "coTitle", hints: "hiTitle", dreams: "drTitle" \}\)/u);
// Текст партнёра в «Закончи фразу» проверяется на сервере до показа и выводится только через escapeHtml.
assert.match(games, /if \(yn\.kind === "phrase" && guest && !\(await phraseAllowed\(guest\)\)\) guest = null;/u);
assert.match(games, /escapeHtml\(theirs \|\| tr\("phSkipped"\)\)/u);

// Владелец: слов поклонения («обожаю», adore, adoro, обожнюю…) в приложении быть не должно.
const WORSHIP_WORDS = /[Оо]божа|[Оо]божн|[Бб]оготвор|[Aa]dor(?:e|es|o|a|as|ar|er)|’adore/u;
for (const file of ["games.js", "games-i18n.js", "letters.js", "index.html", "moments.js", "experience.js", "i18n-extra.js", "friends.js", "friends-i18n.js", "voice.js"]) {
  assert.doesNotMatch(read(file), WORSHIP_WORDS, `${file} has a worship word`);
}

// Вход на главной, подключение и кеш.
assert.match(index, /id="gamesOpenHome"[\s\S]*?id="gamesOpenHomeLabel"[\s\S]*?id="gamesResultsBadge"/u);
assert.match(index, /<symbol id="ic-dice"/u);
assert.ok(index.indexOf("experience.js?v=88") < index.indexOf("games-i18n.js?v=88"));
assert.ok(index.indexOf("games-i18n.js?v=88") < index.indexOf("games.js?v=88"));
assert.match(index, /games\.css\?v=88/u);
for (const file of ["games.css", "games-i18n.js", "games.js"]) assert.match(worker, new RegExp(`"${file.replaceAll(".", "\\.")}\\?v=88"`, "u"));
assert.match(worker, /SENSITIVE_NAVIGATION_PARAMS = \[[^\]]*"quiz"/u);

// Окно покупки: «игры · развлечения · письма»; заголовок и список рисует games.js,
// а app.js по-прежнему пишет условия подписки.
assert.match(index, /<div class="paywall-features"><\/div>/u);
assert.doesNotMatch(index, /<ul><li>вся коллекция писем/u);
assert.match(app, /setText\("#paywallLead", t\("paywallBody"\)\)/u);
assert.doesNotMatch(app, /benefits\[0\]\.textContent=t\("benefit1"\)/u);
assert.match(app, /openPaywall:\(\)=>openPaywall\(\)/u);
assert.match(app, /requestSignIn:origin=>requestSignIn\(/u);
assert.match(games, /group\("groupGames"[\s\S]*group\("groupFun"[\s\S]*group\("groupLetters"/u);
assert.match(gamesCss, /\.paywall-features/u);

// Игрок не видит ответов до конца игры; создание теста — только с полным доступом.
assert.match(migration, /private\.glowletter_has_paid_access\(owner_id\)[\s\S]*premium_required/u);
assert.match(migration, /function public\.glowletter_get_quiz[\s\S]*?question_ids text\[\]/u);
assert.doesNotMatch(migration.slice(migration.indexOf("function public.glowletter_get_quiz"), migration.indexOf("function public.glowletter_submit_quiz")), /'answer'/u);
assert.match(migration, /grant execute on function public\.glowletter_get_quiz\(uuid\) to service_role/u);
assert.match(migration, /grant execute on function public\.glowletter_submit_quiz\(uuid, text, jsonb, text, text\) to service_role/u);
assert.match(migration, />= 12[\s\S]*>= 40[\s\S]*>= 30/u);
assert.match(migration, /alter publication supabase_realtime add table public\.glowletter_quiz_results/u);
assert.match(migration, /glowletter_notice_message_is_forbidden/u);
assert.match(config, /\[functions\.couple-quiz\]\s*verify_jwt = false/u);
assert.match(edge, /glowletter_get_quiz[\s\S]*glowletter_submit_quiz/u);
assert.doesNotMatch(edge, /answer["']?\s*:\s*row/u);

// Своих вопросов нет: игрок и автор работают только с проверенным списком.
assert.match(games, /QUESTION_IDS\.includes\(id\)/u);
// Единственное поле для своего текста — ответ в «Закончи фразу», он проходит фильтр слов.
assert.equal((games.match(/<textarea/gu) || []).length, 1);
assert.match(games, /<form class="glg-form glg-ph-form" data-submit="ph-submit" novalidate>\s*<textarea name="answer"/u);

// «Правда или ложь»: 60 фактов на каждом языке-паке, у каждого [утверждение, true/false, факт].
for (const code of LANGUAGES.filter(code => extra[code])) {
  const truth = extra[code].truth;
  assert.equal(Object.keys(truth || {}).length, 60, `${code} truth`);
  for (const [id, item] of Object.entries(truth)) assert.ok(item.length === 3 && typeof item[1] === "boolean" && item[0].trim() && item[2].trim(), `${code}.${id}`);
}
assert.match(games, /Object\.assign\(TRUTH\.ru, \{"t01"/u);

// «Угадай по подсказкам» (60) и «Мечты и планы» (50) на всех языках-паках; «Угадай страну» — 40 картинок.
for (const code of LANGUAGES.filter(code => extra[code])) {
  const { hints, dreams } = extra[code];
  assert.equal(Object.keys(hints || {}).length, 60, `${code} hints`);
  for (const [id, item] of Object.entries(hints)) assert.ok(item.length === 7 && item.every(value => typeof value === "string" && value.trim()) && !item.slice(4).includes(item[0]), `${code}.${id}`);
  assert.equal(Object.keys(dreams || {}).length, 50, `${code} dreams`);
  for (const [id, item] of Object.entries(dreams)) assert.ok(item.length === 5 && item.every(value => typeof value === "string" && value.trim()), `${code}.${id}`);
}
const COUNTRIES = games.match(/const COUNTRY_CODES = Object\.freeze\(\[([^\]]+)\]\)/u)[1].match(/[A-Z]{2}/gu);
assert.equal(COUNTRIES.length, 40);
for (const code of COUNTRIES) assert.ok(fs.existsSync(path.join(root, `assets/countries/${code.toLowerCase()}.webp`)), `${code} picture`);
assert.match(read("supabase/migrations/20261029090000_more_room_kinds.sql"), /'truth', 'countries', 'hints', 'dreams'/u);

console.log(JSON.stringify({ ok: true, languages: LANGUAGES.length, questions: QUESTION_IDS.length, texts: keys.length }));
