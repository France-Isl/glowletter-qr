import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 2.4.20: аудио в окне с именами, ссылка с первого письма, админка на отдельном
// экране с карточкой аккаунта, золотая кайма не перечёркивает заголовки.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const index = read("index.html");
const app = read("app.js");
const styles = read("styles.css");
const migration = read("supabase/migrations/20261027120000_admin_account_details.sql");

for (const id of ["setupAudio", "setupAudioButton", "setupAudioTitle", "setupAudioRemove"]) assert.match(index, new RegExp(`id="${id}"`));
assert.match(app, /function renderSetupAudio\(\)/);
assert.match(app, /if\(entry\?\.shared\)url\.searchParams\.set\("msg",encodeSharedMessage\(entryText\(entry\)\)\);else url\.searchParams\.set\("quote","1"\);/);

assert.match(index, /<div class="panel-layer" id="adminLayer"/);
assert.match(index, /id="adminOpenButton"[^>]*hidden/);
for (const tab of ["accounts", "catalog", "bulk"]) assert.match(index, new RegExp(`data-admin-tab="${tab}"`));
assert.match(index, /id="adminAccountCard" data-admin-pane="accounts" hidden/);
assert.match(app, /admin: \$\("#adminLayer"\)/);
assert.match(app, /cloudClient\.rpc\("glowletter_admin_account_details", \{ p_support_id: supportId \}\)/);
assert.match(app, /loadAdminAccountDetails\(adminAccountResult\.support_id, \{ reveal: true \}\)/);
assert.match(migration, /if \(select auth\.uid\(\)\) is null or not private\.glowletter_is_admin\(\) then/);
assert.match(migration, /revoke all on function public\.glowletter_admin_account_details\(text\) from public, anon;/);
assert.doesNotMatch(migration, /token_hash|order_id_hash|linked_purchase_token_hash/, "purchase tokens never leave the database");
assert.match(styles, /\.side-panel::before \{ position: relative; \}/);
console.log(JSON.stringify({ ok: true }));
