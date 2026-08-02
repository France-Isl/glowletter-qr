import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = relative => path.join(root, relative);
const readRequired = relative => {
  assert.ok(fs.existsSync(file(relative)), `${relative} is required by the Moments contract`);
  return fs.readFileSync(file(relative), "utf8");
};

const migration = readRequired("supabase/migrations/20260802141349_glowletter_moments.sql");
const indexes = readRequired("supabase/migrations/20260802142505_glowletter_moments_indexes.sql");
const resolver = readRequired("supabase/functions/resolve-letter/index.ts");
const config = readRequired("supabase/config.toml");
const index = readRequired("index.html");
const app = readRequired("app.js");
const privacy = readRequired("privacy.html");
const terms = readRequired("terms.html");
const deletion = readRequired("delete-account.html");

function tableBody(name) {
  return migration.match(new RegExp(`create\\s+table\\s+public\\.${name}\\s*\\(([\\s\\S]*?)\\n\\);`, "i"))?.[1] || "";
}

const tables = [
  "glowletter_people",
  "glowletter_moments",
  "glowletter_letters",
  "glowletter_qr_links"
];

// Cloud history is opt-in at the product level and every persisted row is owned
// by one authenticated account. Removing auth.users must cascade through it.
for (const table of tables) {
  const body = tableBody(table);
  assert.ok(body, `public.${table} must be created`);
  assert.match(
    body,
    /\buser_id\s+uuid\b[\s\S]{0,160}\breferences\s+auth\.users\s*\(\s*id\s*\)\s+on\s+delete\s+cascade/i,
    `${table} must be owned by auth.users with ON DELETE CASCADE`
  );
  assert.match(body, /\brevision\s+bigint\b[\s\S]{0,80}\bdefault\s+0\b/i);
  assert.match(body, /\bcreated_at\s+timestamptz\b[\s\S]{0,80}\bdefault\s+now\(\)/i);
  assert.match(body, /\bupdated_at\s+timestamptz\b[\s\S]{0,80}\bdefault\s+now\(\)/i);
}

const people = tableBody("glowletter_people");
for (const field of ["display_name", "relationship", "language", "tone", "default_length"]) {
  assert.match(people, new RegExp(`\\b${field}\\b`, "i"), `people must include ${field}`);
}

const moments = tableBody("glowletter_moments");
for (const field of ["person_id", "title", "kind", "event_date", "recurrence", "time_zone", "remind_7d", "remind_3d", "remind_1d"]) {
  assert.match(moments, new RegExp(`\\b${field}\\b`, "i"), `moments must include ${field}`);
}
assert.match(moments, /foreign\s+key\s*\(\s*person_id\s*,\s*user_id\s*\)[\s\S]{0,180}\bon\s+delete\s+cascade/i);

const letters = tableBody("glowletter_letters");
for (const field of ["person_id", "moment_id", "text", "language", "tone", "sender_name_snapshot", "recipient_name_snapshot", "occasion_snapshot"]) {
  assert.match(letters, new RegExp(`\\b${field}\\b`, "i"), `letters must include ${field}`);
}
assert.match(letters, /char_length\s*\(\s*btrim\s*\(\s*text\s*\)\s*\)\s+between\s+1\s+and\s+4000/i);
assert.doesNotMatch(letters, /\b(?:raw_)?prompt\b|\bidea\b|\binstruction(?:s)?\b/i, "raw generation input must never be a letter column");

const qrLinks = tableBody("glowletter_qr_links");
for (const field of ["public_id", "kind", "letter_id", "person_id", "status", "unlock_at", "expires_at", "revoked_at"]) {
  assert.match(qrLinks, new RegExp(`\\b${field}\\b`, "i"), `QR metadata must include ${field}`);
}
assert.match(qrLinks, /\bpublic_id\s+uuid\b[\s\S]{0,100}\bunique\b/i);
assert.doesNotMatch(qrLinks, /\bletter_text\b|\bpublic_url\b|\bemail\b/i, "QR rows must contain metadata, not duplicated public content");

// The feature deliberately excludes florist branding, Instagram, and order history.
for (const source of [people, moments, letters, qrLinks, index, app]) {
  assert.doesNotMatch(source, /florist[_-]?logo|shop[_-]?logo|instagram[_-]?(?:handle|profile|account)|order[_-]?history/i);
}

// Same-owner foreign keys used for cascades and history joins have supporting indexes.
for (const indexed of [
  "glowletter_moments (person_id, user_id)",
  "glowletter_letters (person_id, user_id)",
  "glowletter_letters (moment_id, user_id)",
  "glowletter_qr_links (letter_id, user_id)",
  "glowletter_qr_links (person_id, user_id)"
]) {
  const expression = indexed.replace(/[()]/g, "\\$&").replaceAll(" ", "\\s*");
  assert.match(indexes, new RegExp(expression, "i"), `${indexed} needs a covering index`);
}

// Browser clients have CRUD only through owner-scoped RLS. Anon has no table
// grant, and cannot execute the resolver RPC directly.
assert.match(migration, /foreach\s+table_name\s+in\s+array\s+array\['glowletter_people','glowletter_moments','glowletter_letters','glowletter_qr_links'\]/i);
assert.match(migration, /alter\s+table\s+public\.%I\s+enable\s+row\s+level\s+security/i);
assert.match(migration, /revoke\s+all\s+on\s+table\s+public\.%I\s+from\s+public,\s*anon,\s*authenticated/i);
assert.match(migration, /grant\s+select,\s*insert,\s*update,\s*delete\s+on\s+table\s+public\.%I\s+to\s+authenticated/i);
for (const operation of ["select", "insert", "update", "delete"]) {
  assert.match(
    migration,
    new RegExp(`create policy %I on public\\.%I for ${operation} to authenticated[\\s\\S]{0,220}auth\\.uid\\(\\)[\\s\\S]{0,100}user_id`, "i"),
    `${operation} policy must compare auth.uid() with user_id`
  );
}
assert.match(migration, /revoke\s+all\s+on\s+function\s+public\.glowletter_resolve_qr_link\(uuid\)\s+from\s+public,\s*anon,\s*authenticated,\s*service_role/i);
assert.match(migration, /grant\s+execute\s+on\s+function\s+public\.glowletter_resolve_qr_link\(uuid\)\s+to\s+service_role/i);
assert.doesNotMatch(migration, /grant\s+execute\s+on\s+function\s+public\.glowletter_resolve_qr_link\(uuid\)\s+to[^;]*\banon\b/i);

// Owner mutations derive ownership from auth.uid(), validate related records,
// and do not accept a caller-provided user id.
assert.match(migration, /function\s+public\.glowletter_create_qr_link\s*\([\s\S]{0,600}\bowner_id\s+uuid\s*:=\s*auth\.uid\(\)/i);
assert.match(migration, /glowletter_create_qr_link[\s\S]{0,2600}\buser_id\s*=\s*owner_id/i);
assert.match(migration, /function\s+public\.glowletter_revoke_qr_link\s*\([\s\S]{0,700}\buser_id\s*=\s*auth\.uid\(\)/i);
assert.doesNotMatch(migration.match(/function\s+public\.glowletter_create_qr_link[\s\S]*?\n\$\$;/i)?.[0] || "", /p_user_id/i);

// Server time controls lock, expiry, and revocation. The SQL RPC emits no
// letter content unless every gate is satisfied.
assert.match(migration, /when\s+link\.status\s*<>\s*'active'\s+then\s+'revoked'/i);
assert.match(migration, /when\s+link\.expires_at\s+is\s+not\s+null\s+and\s+link\.expires_at\s*<=\s*now\(\)\s+then\s+'expired'/i);
assert.match(migration, /when\s+link\.unlock_at\s+is\s+not\s+null\s+and\s+link\.unlock_at\s*>\s*now\(\)\s+then\s+'locked'/i);
assert.match(
  migration,
  /case\s+when\s+link\.status\s*=\s*'active'[\s\S]{0,320}link\.expires_at\s*>\s*now\(\)[\s\S]{0,320}link\.unlock_at\s*<=\s*now\(\)[\s\S]{0,80}then\s+letter\.text\s+else\s+null\s+end/i
);

// The public Edge Function accepts only a UUID capability, resolves it with a
// server-only key, and returns text only for the ready state.
assert.match(resolver, /request\.method\s*!==\s*"GET"/);
assert.match(resolver, /searchParams\.get\("public_id"\)/);
assert.match(resolver, /const\s+UUID\s*=/);
assert.match(resolver, /Deno\.env\.get\("SUPABASE_SERVICE_ROLE_KEY"\)/);
assert.match(resolver, /admin\.rpc\("glowletter_resolve_qr_link",\s*\{[\s\S]{0,100}p_public_id:\s*publicId/i);
assert.doesNotMatch(resolver, /\.from\(\s*["']glowletter_/i, "the public resolver must not query owner tables directly");
assert.match(resolver, /"Cache-Control":\s*"no-store, max-age=0"/);
assert.match(resolver, /"Referrer-Policy":\s*"no-referrer"/);
assert.match(resolver, /ALLOWED_ORIGINS/);
const nonReadyResponse = resolver.match(/if\s*\(state\s*!==\s*"ready"\)\s*\{([\s\S]*?)\n\s*\}\n\s*return\s+json\(request,\s*\{\s*\n\s*state:\s*"ready"/)?.[1] || "";
assert.ok(nonReadyResponse, "resolve-letter must have an explicit non-ready response");
assert.match(nonReadyResponse, /unlockAt:\s*state\s*===\s*"locked"/);
assert.doesNotMatch(nonReadyResponse, /\b(?:text|senderName|recipientName)\s*:/, "locked, expired, and revoked responses must omit content");
assert.match(resolver, /state:\s*"ready"[\s\S]{0,500}\btext:\s*String\(row\.letter_text/);
assert.match(config, /\[functions\.resolve-letter\][\s\S]{0,80}verify_jwt\s*=\s*false/);

// Legal disclosure is complete in all three supported languages.
for (const [name, page] of [["privacy", privacy], ["terms", terms], ["deletion", deletion]]) {
  for (const language of ["ru", "en", "fr"]) {
    assert.match(page, new RegExp(`<section[^>]+id=["']${language}["'][^>]+lang=["']${language}["']`, "i"), `${name} needs ${language}`);
  }
}
assert.match(privacy, /Черновые запросы[\s\S]{0,180}не сохраняются/u);
assert.match(privacy, /Raw prompts[\s\S]{0,180}not stored/i);
assert.match(privacy, /prompts bruts[\s\S]{0,180}ne sont pas conservés/i);
for (const page of [privacy, terms, deletion]) {
  assert.match(page, /Instagram/i);
  assert.match(page, /(?:истори[яи] заказов|order history|historique des commandes)/iu);
  assert.match(page, /(?:каскад|cascad|cascade)/iu);
}

console.log(JSON.stringify({
  ok: true,
  tables,
  ownerOnly: true,
  rawPromptsStored: false,
  publicResolver: "opaque-unlock-gated",
  legalLanguages: ["ru", "en", "fr"]
}));
