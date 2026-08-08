import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const functionSource = read("supabase/functions/google-play-rtdn/rtdn.mjs");
const adapterSource = read("supabase/functions/google-play-rtdn/index.ts");
const decryptTool = read(
  "supabase/functions/google-play-rtdn/decrypt-refund-review.mjs",
);
const migration = read(
  "supabase/migrations/20260806111431_google_play_rtdn.sql",
);
const config = read("supabase/config.toml");
const lock = read("supabase/functions/google-play-rtdn/deno.lock");

assert.match(
  config,
  /\[functions\.google-play-rtdn\]\s*\r?\nverify_jwt\s*=\s*false/u,
  "Pub/Sub OIDC is verified inside the RTDN function, not as a Supabase JWT",
);

for (const contract of [
  /header\.alg\s*!==\s*"RS256"/u,
  /GOOGLE_JWKS_URL\s*=\s*"https:\/\/www\.googleapis\.com\/oauth2\/v3\/certs"/u,
  /claims\.aud\s*===\s*config\.pushAudience/u,
  /claims\.email\s*===\s*config\.pushServiceAccountEmail/u,
  /claims\.email_verified\s*===\s*true/u,
  /envelope\.subscription\s*!==\s*config\.pubSubSubscription/u,
]) {
  assert.match(functionSource, contract, "authenticated Pub/Sub push contract");
}

assert.match(
  functionSource,
  /projects\\\/\(\?:\[a-z\][\s\S]*?\|\[0-9\]\{6,32\}\)\\\/subscriptions/u,
  "subscription resource accepts a Google Cloud project id or project number",
);
assert.match(
  functionSource,
  /PURCHASE_TOKEN_HASH_DOMAIN[\s\S]*?`\$\{config\.packageName\}\\n\$\{notification\.productId\}\\n\$\{notification\.purchaseToken\}`/u,
  "RTDN token lookup must use the verifier's exact HMAC canonical form",
);
assert.match(functionSource, /purchases\/subscriptionsv2\/tokens/u);
assert.match(functionSource, /purchases\/productsv2\/tokens/u);
assert.match(
  functionSource,
  /response\.status === 404 \|\| response\.status === 410/u,
);
assert.match(functionSource, /forceRevoke/u);
assert.doesNotMatch(
  functionSource,
  /console\.(?:log|info|warn|error|debug)/u,
  "raw provider payloads and tokens must never reach console logs",
);

assert.match(migration, /create table private\.glowletter_play_rtdn_events/u);
assert.match(migration, /message_id text primary key/u);
assert.match(migration, /payload_hash text not null/u);
assert.match(migration, /for update;/u);
assert.match(migration, /recorded\.status = 'processing'[\s\S]*?interval '5 minutes'/u);
assert.match(
  migration,
  /update_event_time < entitlement\.last_rtdn_event_time/u,
  "older RTDN events cannot overwrite newer entitlement evidence",
);

assert.match(
  migration,
  /create table private\.glowletter_play_purchase_token_claims/u,
  "durable purchase-token ownership tombstone exists",
);
assert.match(migration, /create trigger glowletter_guard_play_token_claim/u);
assert.match(
  migration,
  /insert into private\.glowletter_play_purchase_token_claims[\s\S]*?from private\.glowletter_play_entitlements/u,
  "existing token owners are backfilled before the guard is enabled",
);
const claimsTable = tableDefinition(
  migration,
  "private.glowletter_play_purchase_token_claims",
);
assert.doesNotMatch(claimsTable, /\buser_id\b/u);
assert.doesNotMatch(claimsTable, /references auth\.users/u);

const eventTable = tableDefinition(
  migration,
  "private.glowletter_play_rtdn_events",
);
assert.doesNotMatch(eventTable, /\bpurchase_token\b/u);
assert.doesNotMatch(eventTable, /\bpayload\s+(?:text|json|jsonb|bytea)\b/u);

const refundTable = tableDefinition(
  migration,
  "private.glowletter_play_refund_reviews",
);
assert.match(refundTable, /pending_refund_token_hash text/u);
assert.match(refundTable, /encrypted_details text/u);
assert.match(refundTable, /encryption_iv text/u);
assert.doesNotMatch(refundTable, /\bpending_refund_token\s+(?:text|json|jsonb|bytea)\b/u);
assert.doesNotMatch(refundTable, /\border_id\s+(?:text|json|jsonb|bytea)\b/u);
assert.match(migration, /glowletter_resolve_play_refund_review/u);
assert.match(migration, /encrypted_details = null[\s\S]*?encryption_iv = null/u);
assert.match(migration, /interval '180 days'/u);
assert.match(migration, /cron\.schedule\([\s\S]*?'glowletter-cleanup-play-rtdn'/u);
assert.match(migration, /event_status is distinct from 'processing'/u);

for (const table of [
  "glowletter_play_purchase_token_claims",
  "glowletter_play_rtdn_events",
  "glowletter_play_refund_reviews",
]) {
  assert.match(migration, new RegExp(`alter table private\\.${table} enable row level security`, "u"));
  assert.match(migration, new RegExp(`revoke all on table private\\.${table}`, "u"));
}
for (const rpc of [
  "glowletter_begin_play_rtdn_event",
  "glowletter_get_play_entitlement_for_rtdn",
  "glowletter_finish_play_rtdn_event",
  "glowletter_queue_play_refund_review",
  "glowletter_complete_play_refund_review_alert",
  "glowletter_resolve_play_refund_review",
  "glowletter_cleanup_play_rtdn",
  "glowletter_apply_play_rtdn_event",
]) {
  assert.match(migration, new RegExp(`revoke all on function public\\.${rpc}`, "u"));
  assert.match(migration, new RegExp(`grant execute on function public\\.${rpc}`, "u"));
}

assert.match(functionSource, /AES-GCM/u);
assert.match(functionSource, /Idempotency-Key/u);
assert.match(functionSource, /refund_review_alert_failed/u);
assert.match(functionSource, /reviewDueAt: notification\.eventTime \+ 24 \* 60 \* 60_000/u);
assert.match(adapterSource, /glowletter_queue_play_refund_review/u);
assert.match(adapterSource, /glowletter_complete_play_refund_review_alert/u);
assert.match(decryptTool, /name: "AES-GCM"/u);
assert.match(
  decryptTool,
  /additionalData: new TextEncoder\(\)\.encode\(`\$\{messageId\}\\n\$\{payloadHash\}`\)/u,
);
assert.match(adapterSource, /npm:@supabase\/supabase-js@2\.110\.9/u);
assert.match(lock, /"npm:@supabase\/supabase-js@2\.110\.9": "2\.110\.9"/u);

console.log(JSON.stringify({
  contract: "google-play-rtdn",
  checks: [
    "authenticated-pubsub-oidc",
    "authoritative-play-lookups",
    "deduplicated-monotonic-updates",
    "durable-token-ownership",
    "encrypted-refund-review-workflow",
    "private-rls-and-service-role-rpcs",
    "bounded-retention",
    "pinned-runtime-dependencies",
  ],
}));

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function tableDefinition(sql, qualifiedName) {
  const start = sql.indexOf(`create table ${qualifiedName} (`);
  assert.notEqual(start, -1, `missing ${qualifiedName}`);
  const end = sql.indexOf("\n);", start);
  assert.notEqual(end, -1, `unterminated ${qualifiedName}`);
  return sql.slice(start, end + 3);
}
