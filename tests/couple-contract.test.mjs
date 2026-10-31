import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// «Мы вдвоём» (2.4.24): вопрос дня, мишка Тёпа («Мишка как ты»), «Наша история»,
// книга ответов (PDF), «Тёпа читает письмо» и «Капсула времени».
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const worker = read("sw.js");
const app = read("app.js");
const couple = read("couple.js").replaceAll("\r\n", "\n");
const reader = read("bear-reader.js");
const daily = read("supabase/migrations/20261030090000_couple_daily_question.sql");
const bears = read("supabase/migrations/20261030120000_couple_bears_story.sql");
const capsule = read("supabase/migrations/20261030140000_time_capsule.sql");

const LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const packs = vm.runInNewContext(`${read("couple-i18n.js")}; window.GLOWLETTER_COUPLE_I18N`, { window: {} });
assert.deepEqual(Object.keys(packs), LANGUAGES);
const from = couple.indexOf("const TEXT = {");
const TEXT = vm.runInNewContext(`(${couple.slice(from + 13, couple.indexOf("\n  const PACKS")).trim().replace(/;$/u, "")})`);
const keys = Object.keys(TEXT.en);
const placeholders = value => (String(value).match(/\{\w+\}/gu) || []).sort().join();
const WORSHIP_WORDS = /[Оо]божа|[Оо]божн|[Бб]оготвор|[Aa]dor(?:e|es|o|a|as|ar|er)|’adore/u;
for (const code of LANGUAGES) {
  // 120 вопросов дня на каждом языке.
  const questions = packs[code].questions;
  assert.equal(Object.keys(questions).length, 120, `${code} questions`);
  for (let number = 1; number <= 120; number += 1) assert.ok(String(questions[`dq${String(number).padStart(3, "0")}`] || "").trim(), `${code} dq${number}`);
  const text = TEXT[code] || packs[code].text;
  assert.deepEqual(Object.keys(text).sort(), [...keys].sort(), `${code} couple texts`);
  for (const key of keys) {
    assert.ok(String(text[key]).trim(), `${code}.${key} empty`);
    assert.equal(placeholders(text[key]), placeholders(TEXT.en[key]), `${code}.${key} placeholders`);
  }
  for (const file of ["bookFile", "readerVideoFile"]) assert.match(text[file], /^glowletter-[a-z0-9-]+$/u, `${code}.${file}`);
  const all = JSON.stringify({ questions, text });
  assert.doesNotMatch(all, /18\s*\+|мелоди|песн|музык|\bmusic|\bsong|\bkiss|\bhug/iu, `${code} wording`);
  assert.doesNotMatch(all, WORSHIP_WORDS, `${code} worship word`);
}

// Сервер: один вопрос для всех, ответ друга — только после своего, всё — только между друзьями.
assert.match(daily, /'dq' \|\| pg_catalog\.lpad\(\(\(\(p_day - date '2026-01-01'\) % 120 \+ 120\) % 120 \+ 1\)::text, 3, '0'\)/u);
assert.match(daily, /'theirs', case when mine is not null then theirs end/u);
assert.match(daily, /glowletter_couple_history[\s\S]*?premium_required/u);
assert.match(bears, /function public\.glowletter_couple_wear[\s\S]*?'locked'[\s\S]*?premium_required/u);
assert.match(bears, /array\[0, 1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 100\]/u);
assert.match(bears, /function public\.glowletter_couple_story[\s\S]*?best_streak/u);
for (const sql of [daily, bears]) {
  assert.match(sql, /enable row level security/u);
  assert.match(sql, /revoke all on table public\.glowletter_couple_\w+ from public, anon, authenticated/u);
  for (const match of sql.matchAll(/create or replace function public\.(\w+)\(/gu)) {
    const body = sql.slice(match.index, sql.indexOf("$$;", match.index));
    assert.match(body, /security definer/u, `${match[1]} definer`);
    assert.match(body, /glowletter_are_friends|glowletter_couple_day/u, `${match[1]} guarded`);
  }
}
// Наряды на сервере совпадают с OUTFITS в couple.js.
const days = [...couple.matchAll(/\{ id: "o\d\d", picture: "s\d\d[a-d]", days: (\d+) \}/gu)].map(match => Number(match[1]));
assert.deepEqual(days, [0, 1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 100]);
for (const name of ["glowletter_friends_list", "glowletter_couple_today", "glowletter_couple_answer", "glowletter_couple_history", "glowletter_couple_waiting", "glowletter_couple_wear", "glowletter_couple_story"]) {
  assert.match(couple, new RegExp(`"${name}"`, "u"), `${name} used`);
}
assert.match(couple, /escapeHtml\(day\.theirs\)/u);
assert.match(couple, /escapeHtml\(row\.mine\)/u);

// Капсула времени: до 25 лет, дольше года — только с полным доступом (и на сервере, и в окне).
assert.match(capsule, /interval '25 years'/u);
assert.match(capsule, /glowletter_qr_capsule_guard[\s\S]*?interval '366 days'[\s\S]*?glowletter_has_paid_access[\s\S]*?premium_required/u);
assert.match(index, /id="publicationCapsule"[\s\S]*?data-capsule="1m"[\s\S]*?data-capsule="18y"/u);
assert.match(app, /function pickCapsule\(button\)[\s\S]*?!isPremium[\s\S]*?capsuleLong/u);
for (const code of ["ru", "en", "fr"]) assert.match(app, new RegExp(`Object\\.assign\\(UI\\.${code}, \\{"capsuleMonth"`, "u"));
const extra = vm.runInNewContext(`${read("i18n-extra.js")}; window.NUR_I18N_EXTRA`, { window: {} });
for (const code of LANGUAGES.slice(3)) {
  for (const key of ["capsuleMonth", "capsuleHalf", "capsuleYear", "capsuleYears", "capsuleHint", "capsuleLong", "schedulePast"]) {
    assert.ok(String(extra[code].app[key] || "").trim(), `${code}.${key}`);
  }
  assert.match(extra[code].app.capsuleYears, /\{n\}/u, `${code}.capsuleYears`);
}

// «Тёпа читает письмо»: голос — из кнопки «Читать», видео — с полным доступом, Android делится MP4/WebM.
assert.match(app, /dispatchEvent\(new CustomEvent\("glowletter-letter-speech"/u);
assert.match(app, /canShareVideo:\(\)=>/u);
assert.match(reader, /addEventListener\("glowletter-letter-speech", onSpeech\)/u);
assert.match(reader, /if \(!premium\(\)\) \{ app\(\)\?\.stopReading\?\.\(\); app\(\)\?\.openPaywall\?\.\(\); return; \}/u);
assert.match(read("mobile/android/app/src/main/java/com/franceisl/nurpismo/MainActivity.java"), /"video\/mp4"[\s\S]{0,120}"\.mp4"/u);
assert.match(read("mobile/android/app/src/main/java/com/franceisl/nurpismo/ShareBridge.java"), /public boolean supportsVideo\(\)/u);

// Книга ответов: многостраничный PDF из app.js.
assert.match(app, /function jpegPagesToPdf\(pages,\s*pageWidth,\s*pageHeight\)/u);
assert.match(app, /makePdf:\(pages,pageWidth,pageHeight\)=>jpegPagesToPdf/u);

// Главная, подключение и кеш.
assert.match(index, /id="coupleOpenHome"[\s\S]*?id="coupleOpenHomeLabel"[\s\S]*?id="coupleBadge"/u);
assert.ok(index.indexOf("friends.js?v=88") < index.indexOf("couple-i18n.js?v=88"));
assert.ok(index.indexOf("couple-i18n.js?v=88") < index.indexOf("couple.js?v=88"));
assert.ok(index.indexOf("couple.js?v=88") < index.indexOf("bear-reader.js?v=88"));
assert.match(index, /couple\.css\?v=88/u);
for (const file of ["couple.css", "couple-i18n.js", "couple.js", "bear-reader.js"]) assert.match(worker, new RegExp(`"${file.replaceAll(".", "\\.")}\\?v=88"`, "u"));

console.log(JSON.stringify({ ok: true, languages: LANGUAGES.length, questions: 120, texts: keys.length }));
