import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// Онлайн с друзьями (2.4.25): «Сейчас в сети», сердечки, Тёпа в гостях, «Рисуем вместе», голосовые.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const worker = read("sw.js");
const friends = read("friends.js").replaceAll("\r\n", "\n");
const online = read("online.js");
const sql = read("supabase/migrations/20261030160000_friends_online.sql");

// Тексты: новые ключи есть на всех 25 языках, без запретных слов и обязательно с тем же набором {…}.
const LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const extra = vm.runInNewContext(`${read("friends-i18n.js")}; window.GLOWLETTER_FRIENDS_I18N`, { window: {} });
const from = friends.indexOf("const TEXT = {");
const TEXT = vm.runInNewContext(`(${friends.slice(from + 13, friends.indexOf("\n  Object.entries(window.GLOWLETTER_FRIENDS_I18N")).trim().replace(/;$/u, "")})`);
const ONLINE_KEYS = Object.keys(TEXT.en).slice(Object.keys(TEXT.en).indexOf("inviteHeading") + 1);
assert.ok(ONLINE_KEYS.length >= 50);
for (const code of LANGUAGES) {
  const text = TEXT[code] || extra[code];
  for (const key of ONLINE_KEYS) assert.ok(String(text[key] || "").trim(), `${code}.${key}`);
  assert.match(text.drawFile, /^glowletter-[a-z0-9-]+$/u, `${code}.drawFile`);
  const all = JSON.stringify(ONLINE_KEYS.map(key => text[key]));
  assert.doesNotMatch(all, /мелоди|песн|музык|\bmusic|\bsong|\bkiss|\bhug|обож|\badore/iu, `${code} wording`);
}

// Сообщения особого вида узнаются строго по шаблону, текст в переписке всегда экранируется.
for (const pattern of ["REACT_PATTERN", "BEAR_PATTERN", "DRAW_PATTERN", "VOICE_PATTERN"]) assert.match(friends, new RegExp(`const ${pattern} = `, "u"));
assert.match(friends, /\[\[react:\$\{kind\}\]\]/u);
assert.match(friends, /\[\[bear:\$\{outfit\}:\$\{gift\}\]\]/u);
assert.match(friends, /\[\[draw:\$\{room\}\]\]/u);
assert.match(friends, /"glowletter_voice_send"/u);
assert.match(friends, /"glowletter_voice_get"/u);
assert.match(friends, /const VOICE_MAX_SECONDS = 60;/u);
assert.match(friends, /Date\.now\(\) - state\.lastReaction < 1000/u);
assert.match(friends, /function renderStrip\(\)[\s\S]*?isOnline\(row\)/u);
assert.match(index, /id="onlineStrip" hidden/u);

// Сервер: голос только друзьям, не больше 60 секунд и 600 КБ, 30 дней, читают только двое; сердечки не непрочитанные.
assert.match(sql, /function public\.glowletter_voice_send[\s\S]*?glowletter_are_friends[\s\S]*?glowletter_is_blocked[\s\S]*?rate_limited/u);
assert.match(sql, /seconds between 1 and 60/u);
assert.match(sql, /octet_length\(audio\) between 200 and 600000/u);
assert.match(sql, /interval '30 days'/u);
assert.match(sql, /me in \(v\.sender, v\.recipient\)/u);
assert.match(sql, /m\.body not like '\[\[react:%'/u);
assert.match(sql, /alter table public\.glowletter_voice_notes enable row level security/u);
assert.match(sql, /revoke all on table public\.glowletter_voice_notes from public, anon, authenticated/u);

// Рисунок: только broadcast, чужие штрихи проверяются, на сервере ничего не хранится.
assert.match(online, /glowletter-draw:\$\{board\.room\}/u);
assert.match(online, /const validStroke = /u);
assert.match(online, /MAX_STROKES = 1500/u);
assert.doesNotMatch(online, /\.from\(|\.rpc\(/u);
assert.match(read("privacy.html"), /30 дней[\s\S]*30 days/u);

// Уведомления на телефон: ключ устройства хранится только хэшем, опрос — не чаще раза в 3 минуты,
// сердечки не уведомляют; Android опрашивает через WorkManager и просит разрешение только по кнопке.
const push = read("supabase/migrations/20261030180000_push_devices.sql");
assert.match(push, /token_hash text primary key check \(token_hash ~ '\^\[0-9a-f\]\{64\}\$'\)/u);
assert.match(push, /extensions\.digest\(token, 'sha256'\)/u);
assert.match(push, /interval '3 minutes'/u);
assert.match(push, /m\.body not like '\[\[react:%'/u);
assert.match(push, /revoke all on function public\.glowletter_push_register\(\) from public, anon;/u);
const poller = read("mobile/android/app/src/main/java/com/franceisl/nurpismo/PushPoller.java");
assert.match(poller, /PeriodicWorkRequest\.Builder\(PushPoller\.class, 15, TimeUnit\.MINUTES\)/u);
assert.match(poller, /BuildConfig\.PUSH_POLL_URL/u);
assert.match(read("mobile/android/app/build.gradle"), /androidx\.work:work-runtime/u);
assert.match(read("mobile/android/app/src/main/java/com/franceisl/nurpismo/MainActivity.java"), /new NotifyBridge\(this\), "NurNotify"/u);
assert.match(friends, /"glowletter_push_register"/u);
assert.match(friends, /"glowletter_push_unregister"/u);
assert.match(friends, /if \(state\.channelUser && pushOn\(\)\) disablePush\(\);/u);
assert.match(read("privacy.html"), /Уведомления на телефон[\s\S]*Phone notifications/u);

// Подключение и кеш.
assert.ok(index.indexOf("friends.js?v=85") < index.indexOf("online.js?v=85"));
assert.match(worker, /"online\.js\?v=85"/u);
assert.match(worker, /"online\.js", "voice\.js"/u);

console.log(JSON.stringify({ ok: true, languages: LANGUAGES.length, keys: ONLINE_KEYS.length }));
