import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Стихи в коллекции (2.4.16): тексты из базы встают к 50 письмам, админ-панель
// их добавляет, строфы и автор доходят до читалки, счётчики не врут про «50».
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const app = read("app.js");
const styles = read("styles.css");
const extra = read("i18n-extra.js");
const moments = read("moments.js");
const migration = read("supabase/migrations/20260926230000_catalog_letters.sql");

// Коллекция: встроенные письма остаются неизменяемыми, база дописывается на месте.
assert.match(app, /const BASE_LETTERS = Array\.isArray\(window\.NUR_LETTERS\) \? window\.NUR_LETTERS : \[\];/);
assert.match(app, /const LETTERS = \[\.\.\.BASE_LETTERS\];/);
assert.match(app, /if\(BASE_LETTERS\.length!==50\)/);
assert.match(app, /function rebuildCatalog\(\)\s*\{[\s\S]{0,200}LETTERS\.splice\(BASE_LETTERS\.length/);
assert.match(app, /rpc\("glowletter_catalog_letters"\)/);
assert.match(app, /localStorage\.setItem\(CATALOG_CACHE_KEY/);
assert.match(app, /function applyLanguage\(render = true\) \{\s*rebuildCatalog\(\);/);

// Стих виден только на своём языке и закрыт подпиской, если не отмечен бесплатным.
assert.match(app, /entry\?\.catalog \? entry\[lang\] \|\| "" :/);
assert.match(app, /entry\?\.free === true \|\| \(basePosition\(entry\) > 0/);
assert.match(app, /function entryLetterText\(entry\)/);
assert.match(app, /copyText\(entryLetterText\(entry\)\)/);
assert.match(app, /displayPersonalLetter\(entryLetterText\(entry\), context/);

// Счётчики подставляют живое число, а не «50».
assert.match(app, /value\.replace\("\{total\}", String\(LETTERS\.length\)\)\.replace\("\{open\}", String\(accessibleCount\(\)\)\)/);
for (const key of ["openCount", "allCount", "benefit1"]) {
  assert.doesNotMatch(app, new RegExp(`${key}:\\s*"[^"]*\\b50\\b`), `${key} must not hard-code 50`);
  assert.doesNotMatch(extra, new RegExp(`"${key}":\\s*"[^"]*\\b50\\b`), `${key} must not hard-code 50 in i18n-extra`);
}
assert.doesNotMatch(moments, /floristCatalogHint:\s*"[^"]*\b50\b/);
assert.doesNotMatch(extra, /"floristCatalogHint":\s*"[^"]*\b50\b/);

// Строфы, автор, ярлык «Новое», вкладка «Стихи», кнопка на главной.
assert.match(styles, /\.letter-text, \.quote-body p \{ white-space: pre-line; \}/);
assert.match(index, /<small class="letter-author" id="letterAuthor" hidden><\/small>/);
assert.match(index, /<button data-category="poem" type="button" hidden>/);
assert.match(index, /id="homeNewPoem"[^>]*hidden/);
assert.match(app, /poem: t\("poem"\)/);
assert.match(app, /class="quote-new"/);
assert.match(app, /#homeNewPoem[^\n]*addEventListener\("click",openCatalogNews\)/);

// Админ-панель: форма и список, каждое действие идёт через RPC с проверкой админа.
for (const id of ["adminCatalog", "adminCatalogForm", "adminCatalogText", "adminCatalogLanguage", "adminCatalogCategory", "adminCatalogAuthor", "adminCatalogFree", "adminCatalogPublish", "adminCatalogDraft", "adminCatalogPreview", "adminCatalogCancel", "adminCatalogList", "adminCatalogEmpty"]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist in the admin catalog section`);
}
assert.match(index, /id="adminCatalogText"[^>]*maxlength="1500"/);
assert.match(app, /#adminCatalogForm[^\n]*addEventListener\("submit"/);
for (const fn of ["glowletter_admin_catalog_list", "glowletter_admin_catalog_save", "glowletter_admin_catalog_set_status", "glowletter_admin_catalog_delete"]) {
  assert.match(app, new RegExp(`rpc\\("${fn}"`), `${fn} must be called from the admin panel`);
  assert.match(migration, new RegExp(`create or replace function public\\.${fn}\\(`), `${fn} must exist in the migration`);
}
assert.match(app, /async function submitAdminCatalog\(status\)[\s\S]{0,600}texts\.every\(validCatalogText\)/);
assert.match(app, /function validCatalogText\(text\)[\s\S]{0,120}containsForbidden\(text\)/);

// База: таблица закрыта RLS, публичное чтение только опубликованных строк,
// запись только администратором с фильтром запрещённых слов.
assert.match(migration, /create table public\.glowletter_catalog_letters \(/);
assert.match(migration, /generated always as identity \(start with 51\)/);
assert.match(migration, /alter table public\.glowletter_catalog_letters enable row level security;/);
assert.match(migration, /revoke all on table public\.glowletter_catalog_letters from public, anon, authenticated;/);
assert.match(migration, /where l\.status = 'published'/);
assert.match(migration, /grant execute on function public\.glowletter_catalog_letters\(\) to anon, authenticated, service_role;/);
assert.equal((migration.match(/not private\.glowletter_is_admin\(\)/g) || []).length, 4);
assert.match(migration, /private\.glowletter_notice_message_is_forbidden\(clean_text\)/);
assert.match(migration, /char_length\(clean_text\) < 10 or pg_catalog\.char_length\(clean_text\) > 1500/);
assert.doesNotMatch(migration, /навсегда/u);

// Ключи на 25 языках: i18n-contract сверяет остальные 22 с английским словарём.
for (const key of ["poem", "catalogNew", "homeNewPoem", "adminCatalogTitle", "adminCatalogNote", "adminCatalogDeleteConfirm"]) {
  assert.match(app, new RegExp(`,${key}:"`), `${key} must exist in the ru/en/fr dictionaries`);
  assert.equal((extra.match(new RegExp(`"${key}": "`, "g")) || []).length, 22, `${key} must exist in the 22 extra languages`);
}
