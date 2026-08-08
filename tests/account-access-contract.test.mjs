import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const migrationsDirectory = path.join(root, "supabase", "migrations");
const migrationFiles = fs.readdirSync(migrationsDirectory)
  .filter(name => name.endsWith(".sql"))
  .sort();
const sql = migrationFiles
  .map(name => fs.readFileSync(path.join(migrationsDirectory, name), "utf8"))
  .join("\n\n");
const app = read("app.js");
const index = read("index.html");
const styles = read("styles.css");

const tableBody = sql.match(/create\s+table(?:\s+if\s+not\s+exists)?\s+public\.glowletter_accounts\s*\(([\s\S]*?)\)\s*;/i)?.[1] || "";
assert.ok(tableBody, "a migration must create public.glowletter_accounts");

// Every authenticated person receives one durable account record and a shareable support identifier.
assert.match(tableBody, /\buser_id\s+uuid\b/i);
assert.match(sql, /\buser_id\b[\s\S]{0,180}\breferences\s+auth\.users\s*\(\s*id\s*\)[\s\S]{0,100}\bon\s+delete\s+cascade/i);
assert.match(tableBody, /\bsupport_id\s+text\b[\s\S]{0,100}\bnot\s+null\b/i);
assert.ok(
  /\bsupport_id\b[\s\S]{0,100}\bunique\b/i.test(tableBody)
    || /create\s+unique\s+index[\s\S]{0,180}\bon\s+public\.glowletter_accounts\s*\(\s*support_id\s*\)/i.test(sql),
  "support_id must be protected by a unique constraint or index"
);
assert.match(tableBody, /\bis_admin\s+boolean\b[\s\S]{0,80}\bnot\s+null\b[\s\S]{0,80}\bdefault\s+false\b/i);
assert.match(tableBody, /\bpremium_forever\s+boolean\b[\s\S]{0,80}\bnot\s+null\b[\s\S]{0,80}\bdefault\s+false\b/i);
assert.match(tableBody, /\bvip_until\s+(?:timestamp\s+with\s+time\s+zone|timestamptz)\b/i);

// Existing users are backfilled and future auth.users inserts are handled automatically.
assert.match(sql, /insert\s+into\s+public\.glowletter_accounts\s*\([\s\S]{0,180}\buser_id\b[\s\S]{0,240}\bselect\b[\s\S]{0,180}\bfrom\s+auth\.users\b/i);
assert.match(sql, /create(?:\s+or\s+replace)?\s+function\s+private\.glowletter_create_account\s*\([\s\S]{0,1800}\binsert\s+into\s+public\.glowletter_accounts\b/i);
assert.match(sql, /create\s+trigger[\s\S]{0,240}\bafter\s+insert\b[\s\S]{0,180}\bon\s+auth\.users\b[\s\S]{0,180}\bexecute\s+function\b/i);

// Accounts are readable by their owner but cannot be inserted, changed, or deleted by browser clients.
assert.match(sql, /alter\s+table\s+public\.glowletter_accounts\s+enable\s+row\s+level\s+security/i);
assert.match(sql, /create\s+policy[\s\S]{0,240}\bon\s+public\.glowletter_accounts[\s\S]{0,160}\bfor\s+select\b[\s\S]{0,240}(?:\(\s*select\s+)?auth\.uid\s*\(\s*\)\s*\)?\s*=\s*user_id\b/i);
assert.doesNotMatch(sql, /create\s+policy[\s\S]{0,220}\bon\s+public\.glowletter_accounts[\s\S]{0,120}\bfor\s+(?:insert|update|delete)\b/i);
assert.ok(
  /revoke\s+all\s+on\s+(?:table\s+)?public\.glowletter_accounts\s+from[\s\S]{0,100}\bauthenticated\b/i.test(sql)
    || /revoke\s+[\s\S]{0,100}\binsert\b[\s\S]{0,100}\bupdate\b[\s\S]{0,100}\bdelete\b[\s\S]{0,140}\bon\s+(?:table\s+)?public\.glowletter_accounts\s+from[\s\S]{0,100}\bauthenticated\b/i.test(sql),
  "authenticated clients must have INSERT, UPDATE, and DELETE revoked"
);
assert.match(sql, /grant\s+select\s+on\s+(?:table\s+)?public\.glowletter_accounts\s+to\s+authenticated/i);

// Mutations live behind private SECURITY DEFINER functions that derive the administrator from auth.uid().
for (const action of ["grant_vip", "revoke_vip"]) {
  assert.match(
    sql,
    new RegExp(`create(?:\\s+or\\s+replace)?\\s+function\\s+private\\.glowletter_admin_${action}\\s*\\([\\s\\S]{0,1500}?security\\s+definer`, "i"),
    `private.glowletter_admin_${action} must be SECURITY DEFINER`
  );
}
assert.match(sql, /private\.glowletter_admin_(?:grant|revoke)_vip[\s\S]{0,2200}\bauth\.uid\s*\(\s*\)/i);
assert.match(sql, /private\.glowletter_admin_(?:grant|revoke)_vip[\s\S]{0,2200}\bis_admin\b/i);
assert.match(sql, /security\s+definer[\s\S]{0,300}\bset\s+search_path\s*=/i);
assert.match(sql, /p_days\s+(?:smallint|integer|int)[\s\S]{0,1800}\bp_days\s*<\s*1[\s\S]{0,140}\bp_days\s*>\s*365/i);

// PostgREST calls public SECURITY INVOKER wrappers; the wrappers delegate to the guarded private functions.
for (const action of ["grant_vip", "revoke_vip"]) {
  const publicName = `glowletter_admin_${action}`;
  assert.match(
    sql,
    new RegExp(`create(?:\\s+or\\s+replace)?\\s+function\\s+public\\.${publicName}\\s*\\([\\s\\S]{0,1000}?security\\s+invoker`, "i"),
    `public.${publicName} must be SECURITY INVOKER`
  );
  assert.match(
    sql,
    new RegExp(`public\\.${publicName}[\\s\\S]{0,1400}?private\\.${publicName}`, "i"),
    `public.${publicName} must delegate to its private guarded function`
  );
  assert.match(
    sql,
    new RegExp(`grant\\s+execute\\s+on\\s+function\\s+public\\.${publicName}`, "i"),
    `authenticated clients need EXECUTE on public.${publicName}`
  );
}
assert.match(sql, /revoke\s+all\s+on\s+function\s+private\.glowletter_admin_(?:grant|revoke)_vip/i);

// The public SECURITY INVOKER wrappers must be able to traverse the private
// schema. Keep table access revoked; only the explicitly granted functions are
// reachable, and each of those verifies auth.uid() is an administrator.
const privateSchemaPrivilegeChanges = [...sql.matchAll(
  /(?:grant\s+usage|revoke\s+all)\s+on\s+schema\s+private\s+(?:to|from)\s+[^;]+;/giu
)].map(match => match[0]).filter(statement => /\bauthenticated\b/iu.test(statement));
assert.match(privateSchemaPrivilegeChanges.at(-1) || "", /^grant\s+usage\s+on\s+schema\s+private\s+to\s+authenticated\s*;/iu);
const adminSchemaRepair = read("supabase/migrations/20260802173011_restore_admin_private_schema_access.sql");
assert.doesNotMatch(adminSchemaRepair, /grant\s+(?:all|select|insert|update|delete)\s+on\s+(?:all\s+)?tables?/iu);

// The product owner starts as an administrator with permanent cloud premium.
const ownerSeed = sql.match(/update\s+public\.glowletter_accounts[\s\S]{0,1400}?ggooglov9@gmail\.com[\s\S]{0,160}?;/i)?.[0] || "";
assert.ok(ownerSeed, "the owner email must be seeded in glowletter_accounts");
assert.match(ownerSeed, /\bis_admin\s*=\s*true\b/i);
assert.match(ownerSeed, /\bpremium_forever\s*=\s*true\b/i);

// Ordinary signed-in users can copy their support ID; admins get a compact gold role badge instead.
for (const id of ["accountSupportId", "copyAccountId", "accountPlanBadge", "accountAdminBadge", "accountPlanStatus", "accountAvatarButton", "accountAvatarInput"]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist in the account card`);
}
const adminPanelTag = index.match(/<[^>]+id=["']adminPanel["'][^>]*>/i)?.[0] || "";
assert.ok(adminPanelTag, "the admin access panel must exist");
assert.match(adminPanelTag, /\bhidden\b/i, "the admin access panel must be hidden in the initial HTML");
for (const id of ["adminSupportId", "adminLookupButton", "adminVipDays", "adminGrantVip", "adminRevokeVip"]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist in the hidden admin panel`);
}
assert.match(styles, /#?adminPanel|\.admin-panel/);

assert.match(app, /\.rpc\(\s*["']glowletter_my_access["']\s*\)/);
assert.match(sql, /function\s+public\.glowletter_my_access\s*\([\s\S]{0,1000}\bserver_now\b[\s\S]{0,600}\bsecurity\s+invoker\b/i);
for (const field of ["support_id", "is_admin", "premium_forever", "vip_until"]) assert.match(app, new RegExp(`\\b${field}\\b`));
assert.match(app, /#accountSupportId/);
assert.match(app, /const supportVisible\s*=\s*signedIn\s*&&\s*Boolean\(cloudAccount\?\.support_id\)\s*&&\s*!isAdmin/);
assert.match(app, /support\.hidden\s*=\s*!supportVisible/);
assert.match(app, /#copyAccountId[\s\S]{0,80}disabled\s*=\s*!supportVisible/);
assert.match(app, /supportVisible\s*\?\s*cloudAccount\.support_id\s*:\s*["']—["']/);
assert.match(app, /#copyAccountId[^\n]*addEventListener\(["']click["']/);
assert.match(app, /writeClipboard\([\s\S]{0,180}(?:support_id|accountSupportId)/);
assert.match(app, /premium_forever[\s\S]{0,500}vip_until/);
assert.match(app, /isPremium\s*=\s*Boolean\(nativePremium\s*\|\|\s*cloudPremium\)/);
assert.doesNotMatch(app, /betaAccess|beta_capability|acceptedBetaCapability/);
assert.match(app, /performance\.now\(\)[\s\S]{0,500}server_now|server_now[\s\S]{0,500}performance\.now\(\)/);
assert.match(app, /const isAdmin\s*=\s*signedIn\s*&&\s*cloudAccount\?\.is_admin\s*===\s*true/);
assert.match(app, /const adminPanel\s*=\s*\$\(["']#adminPanel["']\)[\s\S]{0,100}adminPanel\.hidden\s*=\s*!isAdmin/);
assert.match(app, /function accountPlanState\(/);
assert.match(app, /planBadge\.dataset\.plan\s*=\s*planState/);
assert.match(app, /accountPlanVip:[^\n]*\{remaining\}[^\n]*\{date\}/);
assert.match(app, /formatVipRemaining\(expiry\s*-\s*trustedCloudNow\(\)\)/);
assert.match(app, /#settingsButton[^\n]*loadCloudAccount\(cloudUser\)/, "opening settings must refresh a newly granted VIP immediately");
assert.match(app, /quietSyncedState[\s\S]{0,180}accountStatus\.hidden\s*=\s*quietSyncedState/, "settled cloud sync must not leave a permanent success label");
assert.match(app, /accountHeading\.hidden\s*=\s*quietSyncedState/, "the large sync heading must disappear after a settled sign-in");
assert.match(app, /card\.dataset\.signedIn\s*=\s*String\(signedIn\)/);
assert.match(styles, /account-card\[data-signed-in="true"\][^\{]*\.account-user\s*\{[^\}]*margin-top\s*:\s*0/i);
assert.match(app, /\$\(["']\.free-note["']\)\.hidden\s*=\s*isPremium/, "active VIP must not see the free-plan sales line");
assert.match(styles, /account-plan-badge\[data-plan="vip"\][^\{]*\{[^\}]*#d7aa3e[^\}]*linear-gradient/i);
assert.match(app, /adminBadge\.hidden\s*=\s*!isAdmin/);
assert.match(app, /adminBadge\.textContent\s*=\s*t\(["']accountBadgeAdmin["']\)/);
assert.match(styles, /\.account-admin-badge[^\{]*\{[^\}]*#d7aa3e[^\}]*linear-gradient/i);
assert.match(app, /accountAvatarStorageKey\(userId\)[\s\S]{0,120}profile-avatar:/);
assert.match(app, /saveMedia\(accountAvatarStorageKey\(userId\),\{blob\}\)/);
assert.doesNotMatch(app.match(/function cloudProgressState\(\)[\s\S]*?\n  \}/)?.[0] || "", /avatar/i);

// Search and all VIP mutations must go through guarded public RPCs.
for (const rpc of ["glowletter_admin_lookup", "glowletter_admin_grant_vip_with_notice", "glowletter_admin_revoke_vip"]) {
  assert.match(app, new RegExp(`\\.rpc\\(\\s*["']${rpc}["']`), `${rpc} must be called through Supabase RPC`);
}
assert.match(app, /#adminLookupForm[^\n]*addEventListener\(["']submit["']/);
assert.match(app, /#adminGrantVip[^\n]*addEventListener\(["']click["']/);
assert.match(app, /#adminRevokeVip[^\n]*addEventListener\(["']click["']/);
assert.match(app, /Number\.isInteger\(days\)[\s\S]{0,140}days\s*<\s*1[\s\S]{0,80}days\s*>\s*365/);

// Owner access remains bound to the confirmed email, and the protected audit trail has finite retention.
assert.match(sql, /owner_account\s+boolean[\s\S]{0,260}ggooglov9@gmail\.com[\s\S]{0,180}email_confirmed_at\s+is\s+not\s+null/i);
assert.match(sql, /create\s+extension\s+if\s+not\s+exists\s+pg_cron/i);
assert.match(sql, /cron\.schedule\([\s\S]{0,500}glowletter-purge-vip-audit[\s\S]{0,500}created_at\s*<\s*now\(\)\s*-\s*interval\s*'6 months'/i);
assert.match(index, /id=["']accountSupportNote["']/);
assert.match(app, /adminGrantDone[\s\S]{0,180}\{date\}/);

console.log(JSON.stringify({
  ok: true,
  migrations: migrationFiles,
  accountTable: "public.glowletter_accounts",
  supportId: true,
  cloudPremium: true,
  adminVipDays: "1-365",
  clientWritesBlocked: true
}));
