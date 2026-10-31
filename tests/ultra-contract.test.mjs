import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// Ультра-обновление (2.4.26): звонок, «Игровой стол», «Наш мир», рейтинг, фото на экран друга.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const worker = read("sw.js");
const call = read("call.js");
const table = read("table.js");
const world = read("together.js");
const friends = read("friends.js").replaceAll("\r\n", "\n");
const sql = read("supabase/migrations/20261031100000_play_together.sql") + read("supabase/migrations/20261031100500_play_together_fix.sql");
const photos6h = read("supabase/migrations/20261031120000_photos_6_hours.sql");

// Подключение: все новые файлы есть на странице и в кеше приложения.
const FILES = ["ultra.css", "table-board.css", "table-party.css", "word.css", "ultra-i18n.js", "call.js", "table-i18n.js", "table.js",
  "table-content.js", "table-content-i18n.js", "table-board.js", "table-party.js", "table-group.css", "table-group-content.js", "table-group-content-i18n.js", "table-group.js", "word-lists.js", "word-i18n.js", "word.js", "together.js"];
const version = /friends\.js\?v=(\d+)/u.exec(index)[1];
for (const file of FILES) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} exists`);
  assert.ok(index.includes(`${file}?v=${version}`), `${file} in index.html`);
  assert.ok(worker.includes(`"${file}?v=${version}"`), `${file} in sw.js CORE`);
}
assert.ok(index.indexOf("table.js?v=") < index.indexOf("table-board.js?v=") && index.indexOf("table.js?v=") < index.indexOf("table-party.js?v="));
assert.ok(index.indexOf("word.js?v=") < index.indexOf("together.js?v="));
assert.match(index, /id="worldOpenHome"[\s\S]*?id="worldBadge" hidden/u);

// Звонок: только служебные сигналы через Realtime, звук — WebRTC напрямую; начать — с полным доступом.
assert.match(call, /openRoom\(`glowletter-call:\$\{room\}`, room, "call"/u);
assert.match(call, /new RTCPeerConnection\(\{ iceServers: iceServers\(\) \}\)/u);
assert.match(call, /if \(!premium\(\)\) \{ app\(\)\?\.openPaywall\?\.\(\); return false; \}/u);
assert.match(call, /echoCancellation: true/u);
assert.match(call, /const INVITE_FRESH_MS = 50000;/u);
assert.doesNotMatch(call, /\.from\("/u);
assert.match(friends, /const CALL_PATTERN = /u);
assert.match(friends, /window\.GlowLetterCall\?\.incoming\?\./u);
assert.match(friends, /sendCallInvite: \(friendId, room\) => sendSpecial\(friendId, `\[\[call:\$\{room\}\]\]`\)/u);

// «Игровой стол»: общий канал, итог партии — один раз через glowletter_play_record.
assert.match(table, /openRoom\(`glowletter-table:\$\{room\}`, room, "play"/u);

// Комнаты проверяет сервер: начать — только с полным доступом, войти — только приглашённым.
const appSource = read("app.js");
const rooms = read("supabase/migrations/20261031230000_rooms_private.sql");
assert.match(appSource, /rpc\("glowletter_room_open", \{ p_room: room, p_kind: kind \}\)/u);
assert.match(appSource, /private: closed/u);
assert.match(rooms, /p_kind <> 'draw' and not private\.glowletter_has_paid_access\(p_me\)/u);
assert.match(rooms, /message = 'not_member'/u);
assert.match(rooms, /on realtime\.messages for select to authenticated/u);
assert.match(rooms, /perform private\.glowletter_room_admit\(me, invite\[2\]::uuid, invite\[1\], p_to\)/u);
assert.match(table, /"glowletter_play_record"/u);
assert.match(table, /state\.recorded = true;/u);
assert.match(friends, /const PLAY_PATTERN = /u);

// «Наш мир» и фото.
for (const rpc of ["glowletter_pair_summary", "glowletter_pet_care", "glowletter_chest_open", "glowletter_chest_state", "glowletter_ranking", "glowletter_ranking_visibility", "glowletter_pair_checkin"]) {
  assert.match(world, new RegExp(`"${rpc}"`, "u"), rpc);
}
assert.match(friends, /"glowletter_photo_send"/u);
assert.match(friends, /"glowletter_photo_get"/u);
assert.match(friends, /window\.NurWidget\?\.installed\?\.\(\)/u);
assert.doesNotMatch(world + call + table, /мелоди|песн|музык|обожа|\bmusic\b|\bsong\b|adore/iu);

// Сервер: очки с дневными потолками, имена в общем рейтинге — только с согласия обоих, фото — не больше 6 часов.
assert.match(sql, /when 'game' then 120 when 'streak' then 10 when 'pet' then 30 when 'word' then 12/u);
assert.match(sql, /pa\.ranking_public and pb\.ranking_public/u);
assert.match(photos6h, /cron\.schedule\(\s*'glowletter-purge-photos'/u);
assert.equal((photos6h.match(/interval '6 hours'/gu) || []).length, 5);
assert.doesNotMatch(photos6h, /30 days/u);
assert.match(read("privacy.html"), /не больше 6 часов/u);
assert.match(sql, /interval '3 hours'/u);
assert.match(sql, /private\.glowletter_pair_paid\(me, p_friend\)/u);
for (const tableName of ["glowletter_points", "glowletter_play_results", "glowletter_pair_days", "glowletter_pets", "glowletter_pet_care", "glowletter_word_results", "glowletter_chests", "glowletter_photos"]) {
  assert.match(sql, new RegExp(`'${tableName}'`, "u"), `${tableName} locked down`);
}
assert.match(sql, /grant execute on function public\.glowletter_widget_photo\(text, uuid\) to anon, authenticated;/u);

// Android: звонок держит экран и WebView, режим разговора; виджет с фото.
const activity = read("mobile/android/app/src/main/java/com/franceisl/nurpismo/MainActivity.java");
assert.match(activity, /new CallBridge\(this\), "NurCall"/u);
assert.match(activity, /if \(webView != null && !callActive\)/u);
assert.match(read("mobile/android/app/src/main/java/com/franceisl/nurpismo/CallBridge.java"), /MODE_IN_COMMUNICATION/u);
assert.match(read("mobile/android/app/src/main/AndroidManifest.xml"), /android\.permission\.MODIFY_AUDIO_SETTINGS/u);

// Слова и карточки «Игрового стола» — на всех 25 языках, карточки в одном порядке.
{
  const sandbox = { window: {} };
  vm.runInNewContext(read("table-content.js") + read("table-content-i18n.js"), sandbox);
  const content = sandbox.window.GLOWLETTER_TABLE_CONTENT;
  const LANGS = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
  for (const lang of LANGS) {
    assert.ok(content.explain[lang]?.length > 500, `explain.${lang}`);
    assert.ok(content.sketch[lang]?.length > 230, `sketch.${lang}`);
    assert.deepEqual(content.talk[lang].map(card => card.c), content.talk.en.map(card => card.c), `talk.${lang} order`);
  }
}

console.log(JSON.stringify({ ok: true, files: FILES.length }));
