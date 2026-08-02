import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationPath = path.join(
  root,
  "supabase",
  "migrations",
  "20260802174724_vip_notifications.sql"
);
const migration = fs.readFileSync(migrationPath, "utf8");
const hardening = fs.readFileSync(path.join(
  root,
  "supabase",
  "migrations",
  "20260802175951_harden_vip_notification_messages.sql"
), "utf8");
const inputGuard = fs.readFileSync(path.join(
  root,
  "supabase",
  "migrations",
  "20260802180735_guard_vip_notice_input.sql"
), "utf8");

const tableBody = migration.match(
  /create\s+table\s+public\.glowletter_notifications\s*\(([\s\S]*?)\n\);/i
)?.[1] || "";
assert.ok(tableBody, "the migration must create public.glowletter_notifications");

// Notifications keep language-independent grant details for client-side RU/EN/FR localization.
for (const field of [
  "id",
  "user_id",
  "kind",
  "reason",
  "message",
  "granted_days",
  "vip_until",
  "created_at",
  "read_at"
]) {
  assert.match(tableBody, new RegExp(`\\b${field}\\b`, "i"), `${field} must be stored`);
}
assert.match(tableBody, /user_id\s+uuid\s+not\s+null\s+references\s+auth\.users\s*\(\s*id\s*\)\s+on\s+delete\s+cascade/i);
assert.match(tableBody, /reason[\s\S]{0,180}gift[\s\S]{0,80}compensation[\s\S]{0,80}promotion[\s\S]{0,80}other/i);
assert.match(tableBody, /message[\s\S]{0,180}char_length\s*\(\s*message\s*\)\s+between\s+1\s+and\s+240/i);
assert.match(tableBody, /granted_days[\s\S]{0,160}between\s+1\s+and\s+365/i);

// Browser clients can select only their own rows and update only read_at.
assert.match(migration, /alter\s+table\s+public\.glowletter_notifications\s+enable\s+row\s+level\s+security/i);
assert.match(migration, /revoke\s+all\s+on\s+table\s+public\.glowletter_notifications\s+from\s+public\s*,\s*anon\s*,\s*authenticated/i);
assert.match(migration, /grant\s+select\s+on\s+table\s+public\.glowletter_notifications\s+to\s+authenticated/i);
assert.match(migration, /grant\s+update\s*\(\s*read_at\s*\)\s+on\s+table\s+public\.glowletter_notifications\s+to\s+authenticated/i);
assert.doesNotMatch(migration, /grant\s+(?:insert|delete|update\s+on)\s+table\s+public\.glowletter_notifications\s+to\s+authenticated/i);
assert.match(migration, /create\s+policy[\s\S]{0,180}on\s+public\.glowletter_notifications[\s\S]{0,100}for\s+select[\s\S]{0,260}auth\.uid\s*\(\s*\)[\s\S]{0,80}=\s*user_id/i);
assert.match(migration, /create\s+policy[\s\S]{0,180}on\s+public\.glowletter_notifications[\s\S]{0,100}for\s+update[\s\S]{0,260}auth\.uid\s*\(\s*\)[\s\S]{0,80}=\s*user_id[\s\S]{0,160}with\s+check/i);
assert.doesNotMatch(migration, /create\s+policy[\s\S]{0,180}on\s+public\.glowletter_notifications[\s\S]{0,100}for\s+(?:insert|delete)/i);

// Postgres Changes delivers newly granted VIP notifications without opening cross-user access.
assert.match(migration, /pg_publication_tables[\s\S]{0,240}supabase_realtime[\s\S]{0,180}glowletter_notifications/i);
assert.match(migration, /alter\s+publication\s+supabase_realtime\s+add\s+table\s+public\.glowletter_notifications/i);

// Custom text is normalized and rejected server-side before any write.
const normalizer = hardening.match(
  /function\s+private\.glowletter_normalize_notice_message\s*\([\s\S]*?\n\$\$;/i
)?.[0] || "";
assert.match(normalizer, /nullif/i);
assert.match(normalizer, /\[\[:cntrl:\]\]\+/i);
assert.match(normalizer, /\[\[:space:\]\]\+/i);
const forbiddenFilter = hardening.match(
  /function\s+private\.glowletter_notice_message_is_forbidden\s*\([\s\S]*?\n\$\$;/i
)?.[0] || "";
assert.match(forbiddenFilter, /18\[\[:space:\]\]\*\\\+/i);
for (const stem of ["секс", "эрот", "порн", "поцелу", "sex", "erotic", "porn", "kiss", "eroti", "bais", "embrass"]) {
  assert.match(forbiddenFilter, new RegExp(stem, "i"), `server filter must reject ${stem}`);
}
assert.match(normalizer, /chr\(8203\)/i, "zero-width spaces must be removed");
assert.match(normalizer, /chr\(65279\)/i, "byte-order marks must be removed");
assert.match(normalizer, /translate[\s\S]{0,300}０１２３４５６７８９/i, "full-width text must be folded");
assert.ok(forbiddenFilter.includes("sex[[:alnum:]_]*"), "all sexual/sexualité/sexualization suffixes must be rejected");
assert.match(migration, /normalized_message[\s\S]{0,1200}char_length\s*\(\s*normalized_message\s*\)\s*>\s*240/i);
assert.match(migration, /glowletter_notice_message_is_forbidden\s*\(\s*normalized_message\s*\)[\s\S]{0,180}prohibited content/i);
assert.doesNotMatch(migration, /raise\s+exception[^;]*(?:p_message|normalized_message)/i, "rejected text must not be copied into errors or logs");

// The guarded private function owns the atomic account + audit + notification mutation.
const privateCustom = inputGuard.match(
  /create\s+or\s+replace\s+function\s+private\.glowletter_admin_grant_vip_with_notice\s*\([\s\S]*?\n\$\$;/i
)?.[0] || "";
assert.ok(privateCustom, "custom VIP grant function must exist");
assert.match(privateCustom, /security\s+definer/i);
assert.match(privateCustom, /set\s+search_path\s*=\s*''/i);
assert.match(privateCustom, /auth\.uid\s*\(\s*\)/i);
assert.match(privateCustom, /glowletter_is_admin\s*\(\s*\)/i);
assert.match(privateCustom, /update\s+public\.glowletter_accounts/i);
assert.match(privateCustom, /insert\s+into\s+private\.glowletter_vip_audit/i);
assert.match(privateCustom, /insert\s+into\s+public\.glowletter_notifications\s*\([\s\S]{0,300}granted_days[\s\S]{0,120}vip_until/i);
const adminCheckAt = privateCustom.indexOf("glowletter_is_admin");
const rawLimitAt = privateCustom.indexOf("octet_length");
const normalizeAt = privateCustom.indexOf("normalized_message :=");
assert.ok(adminCheckAt >= 0 && adminCheckAt < rawLimitAt && rawLimitAt < normalizeAt, "admin and raw-size checks must precede Unicode normalization");
assert.match(privateCustom, /octet_length[\s\S]{0,100}>\s*2048/i);

// The original two-argument API remains callable and always delegates to the notifying path.
const privateDefault = migration.match(
  /create\s+or\s+replace\s+function\s+private\.glowletter_admin_grant_vip\s*\(\s*p_support_id\s+text\s*,\s*p_days\s+integer\s*\)[\s\S]*?\n\$\$;/i
)?.[0] || "";
assert.ok(privateDefault, "the original two-argument VIP grant function must be replaced compatibly");
assert.match(privateDefault, /security\s+definer/i);
assert.match(privateDefault, /private\.glowletter_admin_grant_vip_with_notice\s*\([\s\S]{0,180}'gift'\s*,\s*null/i);

// PostgREST exposes only a SECURITY INVOKER wrapper; the guarded implementation stays private.
assert.match(migration, /function\s+public\.glowletter_admin_grant_vip_with_notice\s*\([\s\S]{0,1000}security\s+invoker/i);
assert.match(migration, /function\s+public\.glowletter_admin_grant_vip_with_notice[\s\S]{0,1600}private\.glowletter_admin_grant_vip_with_notice/i);
assert.match(migration, /revoke\s+all\s+on\s+function\s+public\.glowletter_admin_grant_vip_with_notice[\s\S]{0,180}from\s+public\s*,\s*anon/i);
assert.match(migration, /grant\s+execute\s+on\s+function\s+public\.glowletter_admin_grant_vip_with_notice[\s\S]{0,180}to\s+authenticated/i);

// A daily pg_cron job keeps only 180 days of notification history.
assert.doesNotMatch(migration, /create\s+extension[\s\S]{0,80}pg_cron/i, "later migrations must not repeat pg_cron bootstrap");
assert.doesNotMatch(migration, /grant[\s\S]{0,80}(?:schema|tables?)[\s\S]{0,80}cron/i, "Supabase-managed cron grants must not be replaced");
assert.match(migration, /select\s+jobid\s+from\s+cron\.job\s+where\s+jobname\s*=\s*'glowletter-purge-notifications'[\s\S]{0,180}cron\.unschedule/i);
assert.match(migration, /cron\.schedule\s*\([\s\S]{0,240}glowletter-purge-notifications[\s\S]{0,400}delete\s+from\s+public\.glowletter_notifications[\s\S]{0,120}created_at\s*<\s*now\s*\(\s*\)\s*-\s*interval\s*'180 days'/i);

console.log(JSON.stringify({
  ok: true,
  table: "public.glowletter_notifications",
  realtime: true,
  retentionDays: 180,
  userWrites: ["read_at"],
  grantReasons: ["gift", "compensation", "promotion", "other"],
  customMessageMax: 240
}));
