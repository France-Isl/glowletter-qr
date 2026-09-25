import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const javaDir = "mobile/android/app/src/main/java/com/franceisl/nurpismo";
const gradle = read("mobile/android/app/build.gradle");
const proguard = read("mobile/android/app/proguard-rules.pro");
const controller = read(`${javaDir}/AppUpdateController.java`);
const bridge = read(`${javaDir}/AppUpdateBridge.java`);
const main = read(`${javaDir}/MainActivity.java`);
const html = read("index.html");
const app = read("app.js");
const css = read("styles.css");

// «Вышла новая версия» идёт через официальный In-App Updates API Google Play.
assert.match(gradle, /implementation\s+"com\.google\.android\.play:app-update:2\.1\.0"/);
assert.match(controller, /AppUpdateManagerFactory\.create\(activity\)/);
assert.match(controller, /registerForActivityResult\(\s*new ActivityResultContracts\.StartIntentSenderForResult\(\)/);
assert.match(controller, /AppUpdateOptions\.newBuilder\(AppUpdateType\.FLEXIBLE\)/);
assert.match(controller, /isUpdateTypeAllowed\(AppUpdateType\.FLEXIBLE\)/);
assert.match(controller, /InstallStatus\.DOWNLOADED[\s\S]{0,200}"downloaded"/);
assert.match(controller, /void completeUpdate\(\)[\s\S]{0,160}"downloaded"\.equals\(state\.status\)[\s\S]{0,80}manager\.completeUpdate\(\)/);
assert.match(controller, /void close\(\)[\s\S]{0,160}unregisterListener\(installListener\)/);
// Один AppUpdateInfo запускает обновление только однажды.
assert.match(controller, /startableInfo = null;[\s\S]{0,120}startUpdateFlowForResult/);

// Мост открыт только доверенной встроенной странице.
assert.match(bridge, /@JavascriptInterface[\s\S]{0,120}void startUpdate\(\)/);
assert.match(bridge, /@JavascriptInterface[\s\S]{0,120}void completeUpdate\(\)/);
assert.match(main, /appUpdateController = new AppUpdateController\(this, this::dispatchAppUpdateToWeb\)/);
assert.match(main, /addJavascriptInterface\(new AppUpdateBridge\(this\),\s*"NurAppUpdate"\)/);
assert.match(main, /removeJavascriptInterface\("NurAppUpdate"\)/);
assert.match(main, /void startAppUpdateFromWeb\(\)[\s\S]{0,120}isTrustedMainDocumentActive\(\)/);
assert.match(main, /onResume\(\)[\s\S]{0,700}appUpdateController\.check\(\)/);
assert.match(main, /billingManager\.notifyWebState\(\);\s*dispatchAppUpdateToWeb\(appUpdateController\.state\(\)\)/);
assert.match(main, /onDestroy\(\)[\s\S]{0,500}appUpdateController\.close\(\)/);
assert.match(proguard, /-keep class com\.franceisl\.glowletternext\.AppUpdateBridge \{ \*; \}/);

// Плашка: скрыта по умолчанию, иконки из спрайта, тексты на трёх языках.
assert.match(html, /<div class="app-update" id="appUpdateBanner" role="status" aria-live="polite" hidden>/);
assert.match(html, /id="appUpdateClose"[^>]*><svg class="ic"[^>]*><use href="#ic-close"\/><\/svg><\/button>/);
assert.match(app, /window\.onNativeAppUpdate = detail => \{\s*if \(!trustedEntitlementSource \|\| !detail\) return;/);
assert.match(app, /window\.NurAppUpdate\?\.completeUpdate\?\.\(\)/);
assert.match(app, /window\.NurAppUpdate\?\.startUpdate\?\.\(\)/);
for (const key of ["appUpdateAvailable", "appUpdateButton", "appUpdateDownloading", "appUpdateReady", "appUpdateRestart", "appUpdateHide"]) {
  assert.equal(app.match(new RegExp(`${key}:"`, "g"))?.length, 3, `${key} must exist in ru, en and fr`);
}
assert.match(css, /\.app-update \{ position: fixed; z-index: 31;/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.app-update \{ animation: none; \} \}/);

console.log(JSON.stringify({ ok: true, api: "play-app-update-2.1.0", flow: "flexible", languages: ["ru", "en", "fr"] }));
