# Google Play real-time developer notifications

`google-play-rtdn` is the server-only lifecycle worker for GlowLetter billing.
Google Pub/Sub pushes signed DeveloperNotifications to the Edge Function. The
function verifies Google's OIDC token, requires the exact audience, push
service-account email and subscription resource, deduplicates the Pub/Sub
message, reads the purchase again from the authoritative Google Play Developer
API, and applies only a monotonic entitlement update.

It handles subscription renewals, cancellation, pause, grace period, account
hold, expiry and revocation, plus legacy one-time-product voids. A `404` or
`410` from the authoritative purchase API revokes access. No browser request is
accepted and no raw purchase token or Pub/Sub payload is written to logs or the
database.

## Production Google Cloud resources

These resources have already been created and their IAM bindings verified:

- topic: `projects/bezam-502320/topics/glowletter-play-rtdn`;
- push subscription:
  `projects/bezam-502320/subscriptions/glowletter-play-rtdn-push`;
- endpoint and exact OIDC audience:
  `https://xzzngrquomyiglktroqi.supabase.co/functions/v1/google-play-rtdn`;
- push identity:
  `glowletter-rtdn-push@bezam-502320.iam.gserviceaccount.com`.

The topic grants publisher access to Google's Play notification service
identity. The Pub/Sub service agent has Service Account Token Creator on the
dedicated push identity. Do not add a trailing slash or query string to the
configured audience.

In Play Console, the app's real-time developer notifications setting must use
the topic above. After the backend is deployed, use **Send test notification**
there and confirm an `ignored` test row in the private event journal.

## Required Supabase secrets

The function reuses these secrets from `google-play-verify`:

```dotenv
GOOGLE_SERVICE_ACCOUNT_JSON={...dedicated Android Publisher service account...}
GLOWLETTER_PLAY_PACKAGE_NAME=com.franceisl.glowletternext
GLOWLETTER_PLAY_SUBSCRIPTION_PRODUCT_ID=glowletter_premium_monthly
GLOWLETTER_PLAY_SUBSCRIPTION_BASE_PLAN_ID=monthly
GLOWLETTER_PLAY_LEGACY_PRODUCT_ID=full_access
GLOWLETTER_ENTITLEMENT_HASH_SECRET=at-least-32-random-bytes
GLOWLETTER_ENTITLEMENT_HASH_KEY_ID=v1
```

It additionally requires:

```dotenv
GLOWLETTER_PUBSUB_PUSH_AUDIENCE=https://xzzngrquomyiglktroqi.supabase.co/functions/v1/google-play-rtdn
GLOWLETTER_PUBSUB_PUSH_SERVICE_ACCOUNT_EMAIL=glowletter-rtdn-push@bezam-502320.iam.gserviceaccount.com
GLOWLETTER_PUBSUB_SUBSCRIPTION=projects/bezam-502320/subscriptions/glowletter-play-rtdn-push
GLOWLETTER_REFUND_REVIEW_ENCRYPTION_KEY=32-byte-unpadded-base64url-key
RESEND_API_KEY=re_...
SUPPORT_FROM_EMAIL=GlowLetter <support@verified-sending-domain.example>
SUPPORT_TO_EMAIL=private-operator-inbox@example.com
```

`SUPABASE_URL` and the Supabase secret/service-role key are supplied to the
deployed Edge Function by Supabase. `SUPPORT_FROM_EMAIL` must be a Resend-
verified sender. Test the alert path end to end before production launch.

The purchase-token HMAC secret and key id are a permanent keyspace. **Never
rotate either value as a normal secret rotation.** A new key would make an old
raw token produce a different HMAC and could bypass the durable ownership
tombstone. Rotation requires a dual-key design and an atomic migration while
the old key is still available. Because raw purchase tokens are deliberately
not retained, a simple post-hoc rehash is impossible.

The refund encryption key must also remain available until all open encrypted
refund-review rows have been resolved or expired. The current rows do not carry
an encryption key id: before replacing the key, drain the queue, or first ship
a versioned-key/old-key fallback migration. Keep a securely controlled backup
and a tested restore procedure. Generate the key with a secure 32-byte
generator and encode it as unpadded Base64URL; never commit it.

## Deploy order

Run from the repository root. The database migration must finish before the
function starts receiving pushes.

```powershell
npx --yes supabase@2.111.0 link --project-ref xzzngrquomyiglktroqi
npx --yes supabase@2.111.0 db push --linked
npx --yes supabase@2.111.0 functions deploy google-play-rtdn --project-ref xzzngrquomyiglktroqi
```

If any secret is not already present, put it in a git-ignored local env file
and run:

```powershell
npx --yes supabase@2.111.0 secrets set --env-file .env.play.local --project-ref xzzngrquomyiglktroqi
```

Do not pass secret values directly on a recorded command line. The gateway is
intentionally configured with `verify_jwt=false`: its bearer token is a Google-
signed Pub/Sub OIDC token, which the function verifies itself before decoding
the body.

## Refund-review runbook

Google's `pendingRefundReviewNotification` requires an operator decision within
24 hours. It is never silently ignored:

1. The worker stores HMAC search keys and AES-256-GCM ciphertext in
   `private.glowletter_play_refund_reviews`, with a deadline exactly 24 hours
   after Google's event time.
2. It sends an urgent Resend alert. The email contains the Pub/Sub message id,
   reason code and deadline, but no purchase token, pending-refund token, order
   id or account id. A stable Resend `Idempotency-Key` prevents duplicate email
   delivery when Pub/Sub retries.
3. Open Google Play Console's pending refund reviews, investigate the order and
   submit the ReviewRefund decision before the displayed deadline.
4. In the private Supabase SQL editor, mark the queue entry complete:

   ```sql
   select public.glowletter_resolve_play_refund_review(
     'PUBSUB_MESSAGE_ID_FROM_THE_ALERT',
     'reviewed'
   );
   ```

   Use `dismissed` only when the notification was investigated and no Google
   action is applicable. The function is executable only by `service_role`.
   Resolution immediately nulls the AES-GCM ciphertext and IV.

The authoritative Play Console queue is the preferred place to identify and
act on an order. If incident response requires decrypting a database row, do it
only on a trusted administrator device: AES-256-GCM uses the configured key, a
12-byte Base64URL IV, and UTF-8 additional authenticated data
`message_id + "\n" + payload_hash`. The plaintext JSON contains only
`pendingRefundToken` and `orderId`. Never paste it into tickets, email, logs or
chat; erase the local output immediately after the Play API action.

Export only the encrypted input from the private SQL editor:

```sql
select pg_catalog.jsonb_build_object(
  'messageId', review.message_id,
  'payloadHash', event.payload_hash,
  'encryptedDetails', review.encrypted_details,
  'encryptionIv', review.encryption_iv
)
from private.glowletter_play_refund_reviews as review
join private.glowletter_play_rtdn_events as event
  on event.message_id = review.message_id
where review.message_id = 'PUBSUB_MESSAGE_ID_FROM_THE_ALERT'
  and review.status = 'needs_review';
```

Save that single JSON object as `refund-review-row.json`. In an administrator
shell where the encryption key was loaded from the secret manager (not typed
into command history), run:

```powershell
Get-Content -Raw refund-review-row.json |
  node supabase/functions/google-play-rtdn/decrypt-refund-review.mjs
```

The tool writes the sensitive plaintext only to the local terminal. Close or
clear it after completing the Google Play action, then run the resolution RPC.

The migration schedules `glowletter-cleanup-play-rtdn` daily at 04:17 UTC.
Overdue `needs_review` entries remain visible for seven days after the 24-hour
deadline, then become `expired` and their ciphertext/IV are shredded. All
refund-review metadata is deleted 180 days after creation. Completed RTDN
journal rows are deleted after 90 days once no refund-review row references
them. The cleanup can also be run manually:

```sql
select public.glowletter_cleanup_play_rtdn();
```

## Verification

Before deploy:

```powershell
node --test tests/google-play-rtdn.test.mjs tests/google-play-rtdn-contract.test.mjs
npx --yes deno@2.5.6 fmt --check supabase/functions/google-play-rtdn/index.ts supabase/functions/google-play-rtdn/rtdn.mjs
npx --yes deno@2.5.6 check --lock=supabase/functions/google-play-rtdn/deno.lock --frozen supabase/functions/google-play-rtdn/index.ts
```

After deploy:

1. send the Play Console test notification;
2. confirm a private event row with `notification_kind = 'test'` and
   `status = 'ignored'`;
3. verify a real licence-test subscription renewal/expiry updates the matching
   entitlement and that an older event cannot overwrite it;
4. exercise the alert delivery in a non-production test and resolve its queue
   row; do not launch publicly until this alert reaches the monitored inbox.

## Data and privacy disclosure

The privacy notice must disclose Google Play billing processing and the use of
Google Play, Google Cloud Pub/Sub, Supabase and Resend. The exact retention is:

- the account-owned entitlement is removed when the Supabase account is
  deleted;
- RTDN message metadata and SHA-256/HMAC pseudonyms are kept for 90 days after
  completion, unless a refund review still references the event;
- pending-refund token and order id exist only as AES-GCM ciphertext, are
  shredded immediately on resolution (or seven days after a missed deadline),
  and all refund-review metadata is deleted after 180 days;
- the HMAC purchase-token ownership tombstone and one-way SHA-256 account
  binding deliberately survive account deletion and are retained for the
  product's anti-fraud lifetime, so an already-used purchase cannot be rebound
  to another account;
- Resend alerts contain no purchase token, pending-refund token, order id or
  account id.

Official references:

- <https://developer.android.com/google/play/billing/rtdn-reference>
- <https://developer.android.com/google/play/billing/backend>
- <https://cloud.google.com/pubsub/docs/authenticate-push-subscriptions>
- <https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2>
- <https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.productsv2>
- <https://supabase.com/docs/guides/functions/secrets>
