import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Обновление внутри приложения (2.4.19): кроме встроенного механизма Google Play
// приложение сверяет свою версию с последней выпущенной из базы и ведёт в Play.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const app = read("app.js");
const migration = read("supabase/migrations/20261027090000_app_release.sql");

assert.match(migration, /create table public\.glowletter_app_release \(/);
assert.match(migration, /grant select on table public\.glowletter_app_release to anon, authenticated;/);
assert.doesNotMatch(migration, /grant (?:insert|update|delete)[^\n]*glowletter_app_release[^\n]*(?:anon|authenticated)/);
assert.match(app, /const APP_UPDATE_VISIBLE = \["available", "downloading", "downloaded", "store"\];/);
assert.match(app, /const PLAY_STORE_URL = "https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.franceisl\.glowletternext";/);
assert.match(app, /async function checkStoreRelease\(\) \{\s+if \(!IS_ANDROID_PLAY_APP/);
assert.match(app, /rest\/v1\/glowletter_app_release\?select=version_name,version_code&platform=eq\.android/);
assert.match(app, /compareAppVersions\(row\.version_name, CONFIG\.appVersion\) > 0/);
assert.match(app, /else if \(appUpdate\.status === "store"\) location\.assign\(PLAY_STORE_URL\);/);
assert.match(app, /status: nativeStatus === "none" && storeRelease \? "store" : nativeStatus/);
assert.match(app, /checkStoreRelease\(\);document\.addEventListener\("visibilitychange",\(\)=>\{if\(!document\.hidden\)checkStoreRelease\(\);\}\);/);
console.log(JSON.stringify({ ok: true, fallback: "store" }));
