import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const android = read("mobile/android/app/build.gradle");
const ios = read("mobile/ios/project.yml");
const workflow = read(".github/workflows/mobile-build.yml");
const iosWorkflow = read(".github/workflows/ios-tests.yml");
const iosOAuthTests = read("mobile/ios/NurPismoTests/OAuthURLPolicyTests.swift");
const iosSubscriptionTests = read("mobile/ios/NurPismoTests/SubscriptionStoreContractTests.swift");
const iosSync = read("mobile/scripts/sync_web_assets.py");
const androidMain = read("mobile/android/app/src/main/java/com/franceisl/nurpismo/MainActivity.java");
const androidShare = read("mobile/android/app/src/main/java/com/franceisl/nurpismo/ShareBridge.java");
const iosWebView = read("mobile/ios/NurPismo/WebViewContainer.swift");
const iosContent = read("mobile/ios/NurPismo/ContentView.swift");

assert.ok(fs.existsSync(path.join(root, "mobile/ios/NurPismo/WebResources/.gitkeep")));

assert.match(android, /versionCode\s*=\s*12\b/);
assert.match(android, /versionName\s*=\s*["']2\.2\.6["']/);
assert.match(android, /exclude\s+["']mobile\/\*\*["'][\s\S]{0,180}["']supabase\/\*\*["'][\s\S]{0,180}["']tests\/\*\*["']/);
assert.match(android, /exclude\s+["']\*\.md["'][\s\S]{0,100}["']\*\.py["']/);
assert.match(ios, /MARKETING_VERSION:\s*2\.2\.6\b/);
assert.match(ios, /CURRENT_PROJECT_VERSION:\s*12\b/);
assert.match(ios, /PRODUCT_MODULE_NAME:\s*NurPismo\b/);
assert.match(ios, /TEST_HOST:\s*["']\$\(BUILT_PRODUCTS_DIR\)\/GlowLetter\.app\/GlowLetter["']/);
assert.match(ios, /BUNDLE_LOADER:\s*["']\$\(TEST_HOST\)["']/);
assert.match(ios, /- path: NurPismo\/Assets\.xcassets\s+buildPhase: resources/);
assert.match(ios, /- path: NurPismo\/WebResources\s+type: folder\s+buildPhase: resources/);
assert.match(ios, /- path: StoreKit\/GlowLetter\.storekit\s+buildPhase: resources/);
assert.match(workflow, /GlowLetter-2\.2\.6-debug\.apk/);
assert.match(workflow, /GlowLetter-2\.2\.6-preview-debug\.apk/);
assert.match(workflow, /TAG:\s*v2\.2\.6-preview/);
assert.doesNotMatch(workflow, /GlowLetter Next|GlowLetter-Next|app-debug\.apk|v2\.0\.0-next/);
assert.match(iosWorkflow, /runs-on:\s*macos-latest/);
assert.match(iosWorkflow, /xcodebuild[\s\S]*-scheme NurPismo[\s\S]*test/);
assert.match(iosOAuthTests, /\["google", "facebook", "apple"\]/);
assert.match(iosSubscriptionTests, /Bundle\.main\.url\([\s\S]*GlowLetter[\s\S]*storekit/);
assert.match(iosSubscriptionTests, /SKTestSession\(contentsOf:\s*configurationURL\)/);
for (const excluded of ["supabase", "tests", ".md", ".py"]) assert.match(iosSync, new RegExp(excluded.replace(".", "\\.")));

// Native wrappers expose the real system share sheet only to the trusted bundled page.
assert.match(androidShare, /@JavascriptInterface[\s\S]{0,120}void share\(/);
assert.match(androidMain, /addJavascriptInterface\(new ShareBridge\(this\),\s*"NurShare"\)/);
assert.match(androidMain, /void openShareSheetFromWeb\([\s\S]{0,2200}trustedMainDocumentReady[\s\S]{0,2200}Intent\.ACTION_SEND[\s\S]{0,700}Intent\.createChooser/);
assert.match(androidMain, /rawUrl\.length\(\)\s*>\s*8192/);
assert.match(androidMain, /Character::isISOControl/);
assert.match(androidMain, /shareUri\.getPort\(\)\s*!=\s*-1/);
assert.match(androidMain, /Intent\.createChooser\([\s\S]{0,180}catch \(RuntimeException/);
assert.match(androidMain, /onPause\(\)[\s\S]{0,520}webView\.onPause\(\)[\s\S]{0,700}webView\.pauseTimers\(\)[\s\S]{0,200}super\.onPause\(\)/);
assert.match(androidMain, /onResume\(\)[\s\S]{0,260}webView\.onResume\(\)[\s\S]{0,160}webView\.resumeTimers\(\)[\s\S]{0,260}post\(this::enterImmersiveMode\)/);
assert.match(iosWebView, /name:\s*"nurShare"/);
assert.match(iosWebView, /rawValue\.count\s*<=\s*8_192/);
assert.match(iosWebView, /UIActivityViewController\(/);
assert.match(iosWebView, /popoverPresentationController/);
assert.match(iosContent, /\.persistentSystemOverlays\(\.hidden\)/);
assert.match(iosContent, /\.statusBarHidden\(true\)/);

console.log(JSON.stringify({ ok: true, android: "2.2.6 (12)", ios: "2.2.6 (12)", previewTag: "v2.2.6-preview", nativeShare: true, autoFullscreen: true }));
