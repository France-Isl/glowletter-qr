import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const index = read("index.html");
const app = read("app.js");
const styles = read("styles.css");
const moments = read("moments.js");
const manifest = read("mobile/android/app/src/main/AndroidManifest.xml");
const android = read("mobile/android/app/src/main/java/com/franceisl/nurpismo/MainActivity.java");
const privacy = read("privacy.html");
const terms = read("terms.html");
const config = read("config.js");
const edge = read("supabase/functions/submit-content-report/index.ts");
const migration = read("supabase/migrations/20260806103014_content_reports.sql");
const supabaseConfig = read("supabase/config.toml");

// The Play binary cannot request or transmit location and does not expose a broken weather control.
assert.doesNotMatch(manifest, /ACCESS_(?:COARSE|FINE|BACKGROUND)_LOCATION|hardware\.location/i);
assert.match(android, /setGeolocationEnabled\(false\)/);
assert.match(android, /onGeolocationPermissionsShowPrompt[\s\S]{0,300}callback\.invoke\(origin, false, false\)/);
assert.doesNotMatch(android, /requestPermissions\s*\(|Manifest\.permission\.(?:ACCESS_COARSE_LOCATION|ACCESS_FINE_LOCATION)/);
assert.match(app, /IS_ANDROID_PLAY_APP\s*=\s*location\.hostname\s*===\s*["']appassets\.androidplatform\.net["']/);
const refresh = app.match(/async function refreshWeather\([^)]*\)\{([\s\S]*?)\n\s*\}/)?.[1] || "";
assert.ok(refresh.indexOf("if(IS_ANDROID_PLAY_APP)") >= 0);
assert.ok(refresh.indexOf("if(IS_ANDROID_PLAY_APP)") < refresh.indexOf("requestWeatherPosition()"));
assert.match(app, /weather_enabled:\s*Boolean\(weatherEnabled\s*&&\s*!IS_ANDROID_PLAY_APP\)/);
assert.match(styles, /data-gl-platform=["']android-play["'][\s\S]{0,140}#weatherButton[\s\S]{0,140}#weatherToggle[\s\S]{0,80}display:none!important/);

// Publishing personal content always requires an unchecked, explicit acceptance first.
for (const id of ["publicationLayer", "publicationConsent", "publicationConfirm", "publicationTerms", "publicationPrivacy"]) assert.match(index, new RegExp(`id=["']${id}["']`));
assert.match(index, /id=["']publicationConfirm["'][^>]*disabled/);
const shareLetter = app.match(/async function shareLetter\(\)\{([\s\S]*?)\n\s*\}/)?.[1] || "";
assert.ok(shareLetter.indexOf("await requestPublishConsent()") >= 0);
assert.ok(shareLetter.indexOf("await requestPublishConsent()") < shareLetter.indexOf("ensureTemporarySharedAudio()"));
const momentQrStart = moments.indexOf("async function createQrForLetter");
const momentConsent = moments.indexOf("requestPublishConsent", momentQrStart);
const momentRpc = moments.indexOf("glowletter_create_qr_link", momentQrStart);
assert.ok(momentQrStart >= 0 && momentConsent > momentQrStart && momentRpc > momentConsent);
for (const fn of ["downloadQrCard", "copyQrImage", "copyQrLink", "printQrCard"]) assert.match(app, new RegExp(`(?:async )?function ${fn}\\([^)]*\\)\\{[\\s\\S]{0,500}requestPublishConsent`));

// Recipients get a visible report route backed by a private, rate-limited review queue.
for (const id of ["reportLetterButton", "reportLayer", "reportForm", "reportCategory", "reportDetails", "reportSubmit"]) assert.match(index, new RegExp(`id=["']${id}["']`));
assert.match(moments, /data-action=["']shared-report["']/);
const expectedCategories = ["adult", "harassment", "hate", "threat", "fraud", "privacy", "spam", "other"];
const reportHtml = index.match(/<select\s+id=["']reportCategory["'][^>]*>([\s\S]*?)<\/select>/i)?.[1] || "";
assert.deepEqual([...reportHtml.matchAll(/<option\s+value=["']([^"']+)/gi)].map(value => value[1]), expectedCategories);
assert.doesNotMatch(reportHtml, /\bai\b|artificial intelligence|искусственн/i);
assert.match(app, /functions\/v1\/submit-content-report/);
assert.match(supabaseConfig, /\[functions\.submit-content-report\][\s\S]{0,80}verify_jwt\s*=\s*false/);
assert.match(edge, /REPORT_RATE_LIMIT_SALT/);
assert.match(edge, /crypto\.subtle\.digest\(["']SHA-256["']/);
assert.match(edge, /admin\.auth\.getUser\(token\)/);
assert.doesNotMatch(edge, /console\.(?:log|info|warn|error|debug)\s*\(/);
assert.doesNotMatch(edge, /sb_secret_|service_role_key\s*[:=]\s*["'][^"']+/i);
assert.match(migration, /create table if not exists private\.glowletter_content_reports/i);
assert.match(migration, /enable row level security/i);
assert.match(migration, /for all to anon, authenticated[\s\S]{0,80}using \(false\)[\s\S]{0,80}with check \(false\)/i);
assert.match(migration, /grant execute[\s\S]*to service_role/i);
assert.doesNotMatch(migration, /grant execute[\s\S]*to (?:anon|authenticated)/i);
assert.match(migration, /pg_advisory_xact_lock/i);
assert.match(migration, />= 5[\s\S]{0,180}>= 20/i);
assert.match(migration, /interval '6 months'/i);

// Public disclosures are trilingual and match the actual local-editor configuration.
assert.match(config, /aiEndpoint:\s*["']["']/);
for (const marker of ["id=\"ru\"", "id=\"en\"", "id=\"fr\""]) {
  assert.match(privacy, new RegExp(marker));
  assert.match(terms, new RegExp(marker));
}
for (const source of [privacy, terms]) {
  assert.match(source, /6 (?:августа|August|août) 2026/i);
  assert.match(source, /Supabase/i);
  assert.match(source, /12 (?:час|hour|heure)/i);
  assert.match(source, /Google Play/i);
  assert.match(source, /Play Integrity/i);
}
assert.match(privacy, /Google Fonts/i);
assert.match(privacy, /Open-Meteo/i);
assert.match(privacy, /raw IP address is not retained/i);
assert.match(terms, /Publishing consent and reports/i);

console.log(JSON.stringify({ ok: true, androidLocation: false, androidWeather: false, explicitPublishingConsent: true, recipientReports: true, remoteAiConfigured: false }));
