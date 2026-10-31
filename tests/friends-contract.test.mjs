import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// Друзья и личные сообщения (2.4.22): код дружбы, «в сети», переписка только с друзьями.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const worker = read("sw.js");
const friends = read("friends.js").replaceAll("\r\n", "\n");
const migration = read("supabase/migrations/20261028140000_friends_messages.sql");

const LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const extra = vm.runInNewContext(`${read("friends-i18n.js")}; window.GLOWLETTER_FRIENDS_I18N`, { window: {} });
assert.deepEqual(Object.keys(extra), LANGUAGES.slice(3));
const from = friends.indexOf("const TEXT = {");
const TEXT = vm.runInNewContext(`(${friends.slice(from + 13, friends.indexOf("\n  Object.entries(window.GLOWLETTER_FRIENDS_I18N")).trim().replace(/;$/u, "")})`);
const keys = Object.keys(TEXT.en);
const placeholders = value => (String(value).match(/\{\w+\}/gu) || []).sort().join();
const WORSHIP_WORDS = /[Оо]божа|[Оо]божн|[Бб]оготвор|[Aa]dor(?:e|es|o|a|as|ar|er)|’adore/u;
for (const code of LANGUAGES) {
  const text = TEXT[code] || extra[code];
  assert.deepEqual(Object.keys(text).sort(), [...keys].sort(), `${code} friends texts`);
  for (const key of keys) {
    assert.ok(String(text[key]).trim(), `${code}.${key} empty`);
    assert.equal(placeholders(text[key]), placeholders(TEXT.en[key]), `${code}.${key} placeholders`);
  }
  assert.doesNotMatch(JSON.stringify(text), /18\s*\+|мелоди|песн|музык/iu, `${code} wording`);
  assert.doesNotMatch(JSON.stringify(text), WORSHIP_WORDS, `${code} worship word`);
}

// Сервер: писать можно только друзьям, ссылки и плохие слова не проходят, есть лимиты,
// блокировка и жалобы; читать переписку могут только её участники.
assert.match(migration, /function public\.glowletter_messages_send\(p_to uuid, p_body text\)[\s\S]*?glowletter_are_friends[\s\S]*?not_friends/u);
assert.match(migration, /glowletter_notice_message_is_forbidden/u);
assert.match(migration, /rate_limited/u);
assert.match(migration, /create table public\.glowletter_blocks/u);
assert.match(migration, /create table public\.glowletter_message_reports/u);
assert.match(migration, /alter table public\.glowletter_messages enable row level security/u);
assert.match(migration, /alter publication supabase_realtime add table public\.glowletter_messages/u);

// Клиент: только эти RPC, Realtime на свои сообщения и «в сети» по отметке раз в минуту.
for (const name of ["glowletter_friends_me", "glowletter_friends_set_name", "glowletter_friends_touch", "glowletter_friends_request", "glowletter_friends_respond", "glowletter_friends_remove", "glowletter_friends_block", "glowletter_friends_list", "glowletter_messages_send", "glowletter_messages_mark_read", "glowletter_messages_report"]) {
  assert.match(friends, new RegExp(`"${name}"`, "u"), `${name} used`);
  assert.match(migration, new RegExp(`function public\\.${name}\\(`, "u"), `${name} exists`);
}
assert.match(friends, /filter: `recipient=eq\.\$\{me\}`/u);
assert.match(friends, /const HEARTBEAT_MS = 60000;/u);
assert.doesNotMatch(friends, /innerHTML\s*=\s*[^;]*message\.body(?!\))/u);
assert.match(friends, /escapeHtml\(message\.body\)/u);

// Главная, подключение и кеш.
assert.match(index, /id="friendsOpenHome"[\s\S]*?id="friendsOpenHomeLabel"[\s\S]*?id="friendsBadge"/u);
assert.match(index, /<symbol id="ic-friends"/u);
assert.ok(index.indexOf("games.js?v=94") < index.indexOf("friends-i18n.js?v=94"));
assert.ok(index.indexOf("friends-i18n.js?v=94") < index.indexOf("friends.js?v=94"));
assert.match(index, /friends\.css\?v=94/u);
for (const file of ["friends.css", "friends-i18n.js", "friends.js"]) assert.match(worker, new RegExp(`"${file.replaceAll(".", "\\.")}\\?v=94"`, "u"));
assert.match(read("privacy.html"), /glowletter_messages|личные сообщения|private messages/iu);

console.log(JSON.stringify({ ok: true, languages: LANGUAGES.length, texts: keys.length }));
