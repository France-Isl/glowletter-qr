import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const app = read("app.js");
const index = read("index.html");
const styles = read("styles.css");

// Signed-in users get an accessible notification entry point, unread badge,
// one-time VIP detail card, and a durable history view.
for (const id of [
  "notificationBell",
  "notificationUnreadBadge",
  "notificationLayer",
  "vipNoticeHero",
  "notificationAcknowledge",
  "notificationHistoryList",
  "notificationStatus"
]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist`);
}
assert.match(index, /id="notificationLayer"[^>]+aria-hidden="true"/i);
assert.match(index, /class="vip-notification-card"[^>]+role="dialog"[^>]+aria-modal="true"/i);
assert.match(index, /connect-src[^";]*wss:\/\/xzzngrquomyiglktroqi\.supabase\.co/i, "Realtime needs the exact WSS CSP origin");

// The live table stores grant metadata in direct columns. A payload column does
// not exist and must never be requested by the browser.
const notificationQuery = app.match(
  /\.from\(VIP_NOTIFICATION_TABLE\)[\s\S]{0,300}?\.select\("([^"]+)"\)/
)?.[1] || "";
assert.ok(notificationQuery, "the notification history query must exist");
for (const field of ["id", "user_id", "kind", "reason", "message", "granted_days", "vip_until", "created_at", "read_at"]) {
  assert.match(notificationQuery, new RegExp(`(?:^|,)${field}(?:,|$)`), `${field} must be selected`);
}
assert.doesNotMatch(notificationQuery, /payload/i, "the nonexistent payload column must not be selected");
const notificationNormalizer = app.match(/function normalizeVipNotification\([\s\S]*?\n  \}/)?.[0] || "";
assert.match(notificationNormalizer, /value\.granted_days/);
assert.match(notificationNormalizer, /value\.vip_until/);
assert.doesNotMatch(notificationNormalizer, /value\.payload/);

// INSERT presents the new grant and refreshes access immediately. UPDATE only
// merges read_at state so another device does not show the notice again.
const subscription = app.match(/function startVipNotificationSubscription\([\s\S]*?\n  \}/)?.[0] || "";
assert.match(subscription, /event:\s*"INSERT"/);
assert.match(subscription, /event:\s*"UPDATE"/);
assert.match(subscription, /filter:\s*`user_id=eq\.\$\{userId\}`/);
assert.match(subscription, /loadCloudAccount\(cloudUser\)/, "a new VIP grant must refresh account access");
const updateHandler = subscription.match(/event:\s*"UPDATE"[\s\S]*?\.subscribe/)?.[0] || "";
assert.match(updateHandler, /renderVipNotifications\(\)/);
assert.doesNotMatch(updateHandler, /presentNextUnreadVipNotification\(\)/, "read sync must not reopen the modal");
assert.match(app, /vipNotificationLoadGeneration/);
assert.match(app, /vipNotificationRevision/);
assert.match(app, /function mergeVipNotificationSnapshots\(/, "stale SELECT snapshots must merge with newer Realtime state");
assert.match(app, /requestGeneration\s*!==\s*vipNotificationLoadGeneration/);

// Acknowledgement persists only read_at through the user's RLS-protected row.
const markRead = app.match(/async function markActiveVipNotificationRead\([\s\S]*?\n  \}/)?.[0] || "";
assert.match(markRead, /\.update\(\{\s*read_at:\s*readAt\s*\}\)/);
assert.match(markRead, /const userId = cloudUser\.id/);
assert.match(markRead, /\.eq\("user_id",\s*userId\)/);
assert.match(markRead, /\.is\("read_at",\s*null\)/);
assert.match(markRead, /trustedCloudNow\(\)/, "read_at must not trust an incorrect device clock");
assert.match(markRead, /createdAt\s*\+\s*1/, "read_at must satisfy the server created_at constraint");
assert.match(markRead, /\.select\("id,read_at"\)/, "a cross-device read race must be verified idempotently");
assert.match(markRead, /persistedReadAt/, "a row already read elsewhere must count as success");

// Closing a notification restores only layers it made inert, preserving nested
// settings/support modal context that existed beforehand.
assert.match(app, /const notificationInertedLayers = new Set\(\)/);
const releaseContext = app.match(/function releaseNotificationLayerContext\([\s\S]*?\n  \}/)?.[0] || "";
assert.match(releaseContext, /notificationInertedLayers\.forEach/);
assert.doesNotMatch(releaseContext, /Object\.values\(layers\)/);

// Old history entries use past-tense text and expose the selected row to
// assistive technology.
assert.match(app, /function notificationVipExpired\(/);
for (const key of ["vipNoticeTitleExpired", "vipNoticeBodyExpired"]) {
  assert.match(app, new RegExp(`${key}:`));
}
assert.match(app, /setAttribute\("aria-current",\s*"true"\)/);

// Admin grants carry a language-independent reason and an optional, normalized,
// modest message. Invalid wording is stopped before the RPC call.
const grant = app.match(/async function grantAdminVip\([\s\S]*?\n  \}/)?.[0] || "";
assert.match(grant, /glowletter_admin_grant_vip_with_notice/);
for (const parameter of ["p_support_id", "p_days", "p_reason", "p_message"]) assert.match(grant, new RegExp(`\\b${parameter}\\b`));
assert.match(grant, /normalizeAdminVipMessage\(rawMessage\)/);
assert.match(grant, /containsForbidden\(message\)/);
assert.match(grant, /message\.length\s*>\s*VIP_NOTICE_MESSAGE_MAX/);
const messageNormalizer = app.match(/function normalizeAdminVipMessage\([\s\S]*?\n  \}/)?.[0] || "";
assert.match(messageNormalizer, /normalize\("NFKC"\)/);
assert.match(messageNormalizer, /u0000/);

for (const language of ["ru", "en", "fr"]) {
  assert.match(app, new RegExp(`Object\\.assign\\(UI\\.${language},[\\s\\S]{0,5000}notificationReasonGift`), `${language} notification strings must exist`);
}

// The presentation remains clear on phones, respects notches, and avoids
// unnecessary animation for reduced-motion and low-power users.
assert.match(styles, /\.vip-notification-card[^{]*\{[^}]*env\(safe-area-inset-bottom\)/i);
assert.match(styles, /@media\s*\(max-width:\s*360px\)[\s\S]*?\.vip-notification-card/i);
assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/i);
assert.match(styles, /html\[data-gl-perf="lite"\][^{]*\.vip-notice-sparkles/i);
assert.match(styles, /linear-gradient\([^)]*#fff8d8[^)]*#f0d58a/i, "the unread VIP card must use the gold treatment");
assert.match(styles, /\.account-user-actions \.account-notification-button\s*\{[^}]*min-height:\s*44px/i);

console.log(JSON.stringify({
  ok: true,
  languages: ["ru", "en", "fr"],
  realtimeEvents: ["INSERT", "UPDATE"],
  notificationColumns: notificationQuery.split(","),
  responsive: true
}));
