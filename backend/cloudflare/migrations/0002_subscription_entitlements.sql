PRAGMA foreign_keys = ON;

-- Subscription metadata is nullable so every row created by the original
-- one-time full_access verifier remains valid and can continue to be updated.
ALTER TABLE play_entitlements ADD COLUMN subscription_state TEXT
  CHECK (subscription_state IS NULL OR length(subscription_state) BETWEEN 1 AND 64);

ALTER TABLE play_entitlements ADD COLUMN expiry_time_ms INTEGER
  CHECK (expiry_time_ms IS NULL OR expiry_time_ms >= 0);

ALTER TABLE play_entitlements ADD COLUMN base_plan_id TEXT
  CHECK (base_plan_id IS NULL OR length(base_plan_id) BETWEEN 1 AND 128);

ALTER TABLE play_entitlements ADD COLUMN offer_id TEXT
  CHECK (offer_id IS NULL OR length(offer_id) BETWEEN 1 AND 128);

ALTER TABLE play_entitlements ADD COLUMN auto_renew_enabled INTEGER
  CHECK (auto_renew_enabled IS NULL OR auto_renew_enabled IN (0, 1));

-- This stores the same versioned, keyed HMAC form used by token_hash, never
-- the linked raw Play purchase token returned by subscriptionsv2.get.
ALTER TABLE play_entitlements ADD COLUMN linked_purchase_token_hash TEXT
  CHECK (linked_purchase_token_hash IS NULL OR length(linked_purchase_token_hash) BETWEEN 45 AND 64);

CREATE INDEX play_entitlements_subscription_expiry_idx
  ON play_entitlements (subscription_state, expiry_time_ms);

UPDATE entitlement_meta
SET schema_version = 2,
    migrated_at = unixepoch() * 1000
WHERE singleton = 1;
