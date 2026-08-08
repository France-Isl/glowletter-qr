import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("supabase/functions/google-play-verify/index.ts");
const verifier = read(
  "supabase/functions/google-play-verify/google_play.mjs",
);
const denoConfig = read("supabase/functions/google-play-verify/deno.json");
const denoLock = read("supabase/functions/google-play-verify/deno.lock");
const migration = read(
  "supabase/migrations/20260806101633_google_play_entitlements.sql",
);
const config = read("supabase/config.toml");
const android = read(
  "mobile/android/app/src/main/java/com/franceisl/nurpismo/PurchaseVerifier.java",
);
const billing = read(
  "mobile/android/app/src/main/java/com/franceisl/nurpismo/BillingManager.java",
);
const billingBridge = read(
  "mobile/android/app/src/main/java/com/franceisl/nurpismo/BillingBridge.java",
);
const sessionBinding = read(
  "mobile/android/app/src/main/java/com/franceisl/nurpismo/SupabaseSessionBinding.java",
);
const webApp = read("app.js");
const androidBuild = read("mobile/android/app/build.gradle");

assert.match(
  config,
  /\[functions\.google-play-verify\][\s\S]{0,120}verify_jwt\s*=\s*false/iu,
);
assert.match(index, /npm:@supabase\/supabase-js@2\.110\.9/u);
assert.match(denoConfig, /"lock"\s*:\s*"\.\/deno\.lock"/u);
assert.match(
  denoLock,
  /"npm:@supabase\/supabase-js@2\.110\.9"\s*:\s*"2\.110\.9"/u,
);
assert.match(index, /glowletter_record_play_entitlement/u);
assert.match(index, /glowletter_consume_play_verification_quota/u);
assert.match(index, /admin\.auth\.getUser/u);
assert.match(index, /authorization/u);
assert.match(index, /SUPABASE_SECRET_KEYS/u);
assert.match(index, /SUPABASE_SERVICE_ROLE_KEY/u);
assert.doesNotMatch(index, /console\.(?:log|info|warn|error|debug)\s*\(/iu);
assert.doesNotMatch(verifier, /console\.(?:log|info|warn|error|debug)\s*\(/iu);

for (
  const secret of [
    "GOOGLE_SERVICE_ACCOUNT_JSON",
    "GLOWLETTER_ENTITLEMENT_HASH_SECRET",
    "GLOWLETTER_ENTITLEMENT_HASH_KEY_ID",
    "GLOWLETTER_PLAY_CERTIFICATE_SHA256_DIGESTS",
  ]
) {
  assert.match(verifier, new RegExp(`env\\(["']${secret}["']\\)`, "u"));
}
assert.match(verifier, /requestHashVersion\s*!==\s*["']v2["']/u);
assert.match(
  verifier,
  /\$\{packageName\}\\n\$\{productId\}\\n\$\{productType\}\\n\$\{purchaseToken\}/u,
);
assert.match(verifier, /:decodeIntegrityToken/u);
assert.match(verifier, /PLAY_RECOGNIZED/u);
assert.match(verifier, /LICENSED/u);
assert.match(verifier, /MEETS_DEVICE_INTEGRITY/u);
assert.match(verifier, /certificateSha256Digest/u);
assert.match(verifier, /versionCode\s*>=\s*config\.minVersionCode/u);
assert.match(verifier, /purchases\/subscriptionsv2\/tokens/u);
assert.match(verifier, /purchases\/subscriptions\//u);
assert.match(verifier, /:acknowledge/u);
assert.match(verifier, /subscription_base_plan_mismatch/u);
assert.match(verifier, /SUBSCRIPTION_STATE_IN_GRACE_PERIOD/u);
assert.match(verifier, /SUBSCRIPTION_STATE_ON_HOLD/u);
assert.match(verifier, /externalAccountIdentifiers/u);
assert.match(verifier, /obfuscatedExternalAccountId/u);
assert.match(verifier, /ACCOUNT_BINDING_DOMAIN/u);
assert.match(verifier, /serverTimeMillis/u);
assert.match(verifier, /RATE_LIMIT_HASH_DOMAIN/u);
assert.match(verifier, /journal\.consumeRateLimit/u);
assert.match(verifier, /validOpaqueToken/u);

for (
  const key of [
    "valid",
    "acknowledged",
    "integrityVerified",
    "productId",
    "productType",
    "requestHash",
    "reason",
  ]
) {
  assert.match(verifier, new RegExp(`\\b${key}\\s*:`, "u"));
  assert.match(
    android,
    new RegExp(`opt(?:Boolean|String)\\(["']${key}["']`, "u"),
  );
}
assert.match(android, /requestHashVersion["'],\s*["']v2["']/u);
assert.match(android, /setRequestProperty\(["']Authorization["'],\s*["']Bearer /u);
assert.doesNotMatch(android, /\.put\(["'](?:userId|accountBinding)["']/u);
assert.match(billingBridge, /void setAuthSession\(String accessToken\)/u);
assert.match(billing, /setObfuscatedAccountId\(obfuscatedAccountId\)/u);
assert.match(billing, /EntitlementExpiryPolicy\.subscriptionDeadline/u);
assert.match(billing, /["']subscription_expired["']/u);
assert.match(sessionBinding, /glowletter\/play-account\/v1\\n/u);
assert.match(webApp, /syncNativeBillingAuth\(cloudSession\)/u);
assert.match(
  androidBuild,
  /productionVerificationUrl\s*=\s*["']https:\/\/xzzngrquomyiglktroqi\.supabase\.co\/functions\/v1\/google-play-verify["']/u,
);
assert.match(androidBuild, /productionCloudProjectNumber\s*=\s*96836561934L/u);
assert.match(
  androidBuild,
  /verificationUrl\.toString\(\)\s*==\s*productionVerificationUrl[\s\S]{0,100}cloudProjectNumber\s*==\s*productionCloudProjectNumber/u,
);
assert.match(billing, /LEGACY_FULL_ACCESS_PRODUCT_ID/u);
assert.match(billing, /BillingClient\.ProductType\.INAPP/u);
assert.match(verifier, /verifyLegacyOneTimeProduct/u);

assert.match(migration, /create table private\.glowletter_play_entitlements/iu);
assert.match(
  migration,
  /\buser_id uuid not null references auth\.users\(id\)/iu,
);
assert.match(
  migration,
  /create table private\.glowletter_play_verification_limits/iu,
);
assert.match(migration, /glowletter_consume_play_verification_quota/iu);
assert.match(migration, /token_hash text primary key/iu);
assert.match(
  migration,
  /alter table private\.glowletter_play_entitlements enable row level security/iu,
);
assert.match(
  migration,
  /revoke all on table private\.glowletter_play_entitlements[\s\S]{0,120}from public, anon, authenticated/iu,
);
assert.match(
  migration,
  /grant select, insert, update on table private\.glowletter_play_entitlements[\s\S]{0,80}to service_role/iu,
);
assert.match(
  migration,
  /function public\.glowletter_record_play_entitlement[\s\S]{0,900}security invoker/iu,
);
assert.match(
  migration,
  /revoke all on function public\.glowletter_record_play_entitlement[\s\S]{0,700}from public, anon, authenticated/iu,
);
assert.match(
  migration,
  /grant execute on function public\.glowletter_record_play_entitlement[\s\S]{0,700}to service_role/iu,
);
assert.match(
  migration,
  /p_state = 'active'[\s\S]{0,180}p_acknowledgement_state_code = 1/iu,
);
assert.match(migration, /set state = 'replaced'/iu);
assert.doesNotMatch(
  migration,
  /\b(?:purchase_token|integrity_token)\b(?!_hash)/iu,
  "raw Google tokens must not be represented as database columns",
);
assert.doesNotMatch(
  `${index}\n${verifier}`,
  /-----BEGIN PRIVATE KEY-----\s+[A-Za-z0-9+/]{80,}|AIza[0-9A-Za-z_-]{20,}/u,
  "credentials must never be committed",
);

console.log(JSON.stringify({
  ok: true,
  endpoint: "google-play-verify",
  integrity: "strict",
  tokenStorage: "hmac-only",
  legacyRestore: true,
}));
