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
  assert.deepEqual(Object.keys(questions), QUESTION_IDS, `${code} questions`);
  for (const id of QUESTION_IDS) {
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
  assert.deepEqual(Object.keys(cards), CARD_IDS, `${code} cards`);
  for (const id of CARD_IDS) assert.ok(cards[id].length === 3 && cards[id].every(value => typeof value === "string" && value.trim()), `${code}.${id}`);
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
  assert.deepEqual(Object.keys(sets), SET_IDS, `${code} loves sets`);
  for (const id of SET_IDS) assert.ok(sets[id].length === 5 && sets[id].every(value => typeof value === "string" && value.trim()), `${code}.${id}`);
  assert.doesNotMatch(JSON.stringify(sets), /18\s*\+|мелоди|песн|музык/iu, `${code} loves wording`);
}
for (const id of SET_IDS) for (const choice of "abcd") assert.ok(fs.existsSync(path.join(root, `assets/loves/${id}${choice}.webp`)), `${id}${choice} picture`);
assert.match(read("supabase/migrations/20261028120000_loves_rooms.sql"), /kind in \('yesno', 'loves'\)/u);

// Вход на главной, подключение и кеш.
assert.match(index, /id="gamesOpenHome"[\s\S]*?id="gamesOpenHomeLabel"[\s\S]*?id="gamesResultsBadge"/u);
assert.match(index, /<symbol id="ic-dice"/u);
assert.ok(index.indexOf("experience.js?v=64") < index.indexOf("games-i18n.js?v=64"));
assert.ok(index.indexOf("games-i18n.js?v=64") < index.indexOf("games.js?v=64"));
assert.match(index, /games\.css\?v=64/u);
for (const file of ["games.css", "games-i18n.js", "games.js"]) assert.match(worker, new RegExp(`"${file.replaceAll(".", "\\.")}\\?v=64"`, "u"));
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
assert.doesNotMatch(games, /<textarea/u);

console.log(JSON.stringify({ ok: true, languages: LANGUAGES.length, questions: QUESTION_IDS.length, texts: keys.length }));
