# Google Play purchase verification on Supabase

`google-play-verify` is the server-authoritative endpoint used by the native
Android `PurchaseVerifier`. It never trusts the purchase state reported by the
APK. For every request it:

1. recomputes the Android v2 request hash;
2. asks Google to decode the request-bound Standard Play Integrity token;
3. requires a fresh token, the exact package, an allowed Play signing
   certificate, a supported version code, `PLAY_RECOGNIZED`, `LICENSED` and
   `MEETS_DEVICE_INTEGRITY`;
4. reads the purchase from the Google Play Developer API;
5. checks the exact subscription product and base plan, lifecycle state and
   expiry;
6. validates the Supabase bearer token, derives the account server-side and
   requires Google's `obfuscatedExternalAccountId` to match it;
7. consumes database-backed global and pseudonymous-network rate limits before
   any Google API call;
8. writes an HMAC-pseudonymised journal entry before granting access;
9. acknowledges the purchase on the server and records the final state.

The current Android app also restores the historical non-consumable
`full_access`, so the endpoint retains that narrow `productType=inapp` path.
No other catalog identifiers are accepted.

## Values required from Google

Do not deploy until all of these exist:

- Play package: `com.franceisl.glowletternext`;
- subscription product: `glowletter_premium_monthly`;
- auto-renewing base plan: `monthly`;
- legacy in-app product: `full_access` (needed only for existing buyers);
- a Google Cloud project with **Google Play Android Developer API** and
  **Play Integrity API** enabled;
- that Cloud project selected in the app's Play Integrity settings;
- the numeric Google Cloud project number;
- a dedicated service account invited in Play Console with access to this app
  and the permissions **View financial data, orders, and cancellation survey
  responses** and **Manage orders and subscriptions**;
- the SHA-256 certificate digest from Play Console → Setup → App integrity →
  App signing key certificate.

Google returns certificate digests as unpadded Base64URL, not colon-separated
hex. Convert the Play Console value with:

```bash
python -c "import base64; h='PASTE_HEX_WITHOUT_COLONS'; print(base64.urlsafe_b64encode(bytes.fromhex(h)).decode().rstrip('='))"
```

Use the **Play app signing** certificate, not the local upload certificate.
During a signing-key rotation, provide both accepted digests separated by a
comma.

## Supabase secrets

Create a local file such as `.env.play.local` (the repository ignores
`.env.*`). Never commit it:

```dotenv
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"}
GLOWLETTER_PLAY_PACKAGE_NAME=com.franceisl.glowletternext
GLOWLETTER_PLAY_SUBSCRIPTION_PRODUCT_ID=glowletter_premium_monthly
GLOWLETTER_PLAY_SUBSCRIPTION_BASE_PLAN_ID=monthly
GLOWLETTER_PLAY_LEGACY_PRODUCT_ID=full_access
GLOWLETTER_PLAY_CERTIFICATE_SHA256_DIGESTS=BASE64URL_PLAY_SIGNING_SHA256
GLOWLETTER_PLAY_MIN_VERSION_CODE=15
GLOWLETTER_ENTITLEMENT_HASH_SECRET=GENERATE_A_RANDOM_SECRET_OF_AT_LEAST_32_BYTES
GLOWLETTER_ENTITLEMENT_HASH_KEY_ID=v1
```

Generate the HMAC secret with a cryptographically secure generator, for
example `openssl rand -base64 48`. The key id is stored beside each digest so a
future rotation can be introduced deliberately. Rotating the HMAC secret
without a migration breaks linked-token matching; do not replace it casually.

The service-account JSON is a Supabase secret. It must never appear in Gradle,
the APK, GitHub Actions logs, application logs or client-side JavaScript.

## Deploy (only after Google setup is complete)

The repository currently targets Supabase CLI `2.111.0` for these commands.
Discover flags with `--help` if a newer CLI is used.

```bash
npx --yes supabase@2.111.0 login
npx --yes supabase@2.111.0 link --project-ref YOUR_PROJECT_REF
npx --yes supabase@2.111.0 db push --linked
npx --yes supabase@2.111.0 secrets set --env-file .env.play.local --project-ref YOUR_PROJECT_REF
npx --yes supabase@2.111.0 functions deploy google-play-verify --project-ref YOUR_PROJECT_REF
```

`supabase/config.toml` intentionally leaves gateway `verify_jwt=false` for this
function, but the function itself still requires `Authorization: Bearer
<Supabase access token>` and validates it with Supabase Auth before any Google
call. No caller-provided user id is accepted. The native client must set
`obfuscatedAccountId` in BillingFlow to unpadded Base64URL SHA-256 of
`glowletter/play-account/v1\n` plus the canonical lowercase Supabase user UUID.
The backend derives the same value from the validated JWT and requires an exact
match in `subscriptionsv2.externalAccountIdentifiers`. Browser-origin requests
are rejected.

The header is only a routing signal and is not an authentication secret. The
database RPC therefore enforces 120 requests per minute globally and 20 per
five minutes for an HMAC-pseudonymised network identity. If the rate-limit
store is unavailable, verification fails closed before calling Google. Configure
Supabase and Google API quota alerts as an additional operational safeguard.

The Android release build must receive:

```powershell
$env:NURPISMO_VERIFICATION_URL = "https://YOUR_PROJECT_REF.supabase.co/functions/v1/google-play-verify"
$env:NURPISMO_CLOUD_PROJECT_NUMBER = "YOUR_NUMERIC_GOOGLE_CLOUD_PROJECT_NUMBER"
```

These are public configuration values. The service-account key and HMAC secret
remain only in Supabase.

Successful subscription responses include both Google `expiryTimeMillis` and
`serverTimeMillis`. The Android client must stop access at the verified expiry;
a transient network failure must never extend a cached entitlement past it.
The historical `full_access` product has no Google external-account field, so
its purchase token is permanently bound to the first authenticated account
that successfully verifies it.

## Verification and release test

Run before deployment:

```bash
node --test tests/google-play-verification.test.mjs tests/google-play-verification-contract.test.mjs
```

After deployment, publish a signed AAB to an **Internal testing** track, add a
licence tester, install from the Play Store test link, buy the test
subscription and test purchase, restore, cancellation and expiry. A sideloaded
or debug APK is expected to fail because it cannot produce both
`PLAY_RECOGNIZED` and `LICENSED` for the production package.

The migration stores only key-id-prefixed HMACs and normalized verdict fields.
It never stores the raw purchase token, Integrity token, Google service-account
key, Google response body or buyer email.

## Remaining production lifecycle work

This endpoint securely handles purchase, restore and acknowledgement requests.
Before a public production rollout, also configure Google Play Real-time
developer notifications (RTDN) through Pub/Sub and a server reconciliation
worker. RTDN is required to process renewals, grace period, account hold,
cancellation, revocation and refunds promptly when the app is not open. Until
that exists, keep the app in an internal or closed test track.

Official references:

- <https://developer.android.com/google/play/billing/security>
- <https://developer.android.com/google/play/billing/backend>
- <https://developer.android.com/google/play/integrity/standard>
- <https://developer.android.com/google/play/integrity/verdicts>
- <https://developers.google.com/android-publisher/getting_started>
- <https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2>
- <https://supabase.com/docs/guides/functions/secrets>
- <https://supabase.com/docs/guides/functions/auth>
