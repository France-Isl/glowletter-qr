import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const ranking = read("ranking.js");
const sql = read("supabase/migrations/20261031170000_seasons_medals_admin.sql");
const index = read("index.html");
const worker = read("sw.js");

// Тексты: ru/en/fr в ranking.js, остальные 22 языка — в ranking-i18n.js с тем же набором ключей.
const LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const box = { window: {} };
vm.runInNewContext(read("ranking-i18n.js"), box);
const extra = box.window.GLOWLETTER_RANKING_I18N;
assert.deepEqual(Object.keys(extra).sort(), LANGUAGES.slice(3).sort());
const enBlock = ranking.slice(ranking.indexOf("    en: {"), ranking.indexOf("    fr: {"));
const keys = [...enBlock.matchAll(/(\w+): "/gu)].map(match => match[1]);
assert.ok(keys.length > 60);
const placeholders = text => [...String(text).matchAll(/\{(\w+)\}/gu)].map(match => match[1]).sort().join(",");
const enText = Object.fromEntries([...enBlock.matchAll(/(\w+): "([^"]*)"/gu)].map(match => [match[1], match[2]]));
for (const [code, text] of Object.entries(extra)) {
  assert.deepEqual(Object.keys(text).sort(), [...keys].sort(), `${code} ranking texts`);
  for (const key of keys) assert.equal(placeholders(text[key]), placeholders(enText[key]), `${code}.${key} placeholders`);
  assert.doesNotMatch(JSON.stringify(text), /мелоди|песн|музык|обожа/iu, `${code} wording`);
}

// Сервер: сезоны по 15 дней, медали навсегда, админ-функции под проверкой админа.
for (const name of ["glowletter_season_ranking", "glowletter_medal_wall", "glowletter_medals_unseen", "glowletter_medals_seen", "glowletter_is_admin_user", "glowletter_admin_player", "glowletter_admin_reset_season", "glowletter_admin_unlock_all"]) {
  assert.match(ranking, new RegExp(`"${name}"`, "u"), `${name} used`);
  assert.ok(sql.includes(`function public.${name}(`), `${name} exists`);
}
assert.match(sql, /interval '15 days'|\* 15/u);
assert.match(sql, /glowletter-close-seasons/u);
for (const name of ["glowletter_admin_player", "glowletter_admin_reset_season", "glowletter_admin_unlock_all"]) {
  const body = sql.slice(sql.indexOf(`function public.${name}(`)).split("$$;")[0];
  assert.ok(body.includes("glowletter_require_admin()"), `${name} admin only`);
}
assert.doesNotMatch(sql, /delete from public\.glowletter_medals/u, "medals are never deleted");

// Подключение: файлы в странице и в офлайн-кеше, вкладка «Игры» в админке.
for (const file of ["ranking.css", "ranking-i18n.js", "ranking.js"]) {
  assert.ok(index.includes(`${file}?v=`), `${file} in page`);
  assert.ok(worker.includes(`"${file}?v=`), `${file} cached`);
}
assert.ok(read("friends.css").includes("assets/scenes/chat-campfire.webp"), "chat photo background");
assert.match(index, /data-admin-tab="games"/u);
assert.match(index, /id="adminGames" data-admin-pane="games"/u);
assert.ok(index.indexOf("ranking-i18n.js") < index.indexOf("ranking.js?"));
console.log(JSON.stringify({ ok: true, keys: keys.length }));
