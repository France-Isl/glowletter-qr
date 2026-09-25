import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const javaDir = "mobile/android/app/src/main/java/com/franceisl/nurpismo";
const gradle = read("mobile/android/app/build.gradle");
const proguard = read("mobile/android/app/proguard-rules.pro");
const controller = read(`${javaDir}/GoogleSignInController.java`);
const bridge = read(`${javaDir}/AuthBridge.java`);
const main = read(`${javaDir}/MainActivity.java`);
const html = read("index.html");
const app = read("app.js");
const emailAuth = read("email-auth.js");
const css = read("styles.css");

// Вход аккаунтом Google телефона: Credential Manager, аудитория — Web-клиент GlowLetter.
assert.match(gradle, /implementation\s+"androidx\.credentials:credentials:1\.6\.0"/);
assert.match(gradle, /implementation\s+"androidx\.credentials:credentials-play-services-auth:1\.6\.0"/);
assert.match(gradle, /implementation\s+"com\.google\.android\.libraries\.identity\.googleid:googleid:1\.2\.1"/);
assert.match(gradle, /GOOGLE_WEB_CLIENT_ID", quoteBuildConfig\("96836561934-[a-z0-9]+\.apps\.googleusercontent\.com"\)/);
assert.match(proguard, /-if class androidx\.credentials\.CredentialManager\s+-keep class androidx\.credentials\.playservices\.\*\* \{ \*; \}/);

// После переустановки знакомый аккаунт входит сам; иначе — все аккаунты телефона.
assert.match(controller, /setFilterByAuthorizedAccounts\(returningAccountsOnly\)/);
assert.match(controller, /setAutoSelectEnabled\(returningAccountsOnly\)/);
assert.match(controller, /returningAccountsOnly && error instanceof NoCredentialException[\s\S]{0,200}googleIdOption\(hashedNonce, false\)/);
assert.match(controller, /new GetSignInWithGoogleOption\.Builder\(BuildConfig\.GOOGLE_WEB_CLIENT_ID\)[\s\S]{0,60}\.setNonce\(hashedNonce\)/);
assert.match(controller, /HASHED_NONCE = Pattern\.compile\("\[0-9a-f\]\{64\}"\)/);
assert.match(bridge, /@JavascriptInterface[\s\S]{0,40}public void signInWithGoogle\(String hashedNonce, boolean automatic\)/);
assert.match(main, /void startGoogleSignInFromWeb\([\s\S]{0,120}isTrustedMainDocumentActive\(\)/);
// ID-токен уходит только в доверенную страницу и никогда — в общие события.
const dispatch = main.match(/private void dispatchGoogleCredentialToWeb[\s\S]*?\r?\n    }\r?\n/)?.[0] || "";
assert.match(dispatch, /isTrustedMainDocumentActive\(\)/);
assert.doesNotMatch(dispatch, /CustomEvent/);
assert.match(main, /googleSignIn\.close\(\)/);

// Веб-слой: nonce хешируется, Supabase проверяет исходный.
assert.match(app, /window\.NurAuth\.signInWithGoogle\(await sha256Hex\(googleNonce\), automatic\)/);
assert.match(app, /signInWithIdToken\(\{ provider: "google", token: detail\.idToken, nonce \}\)/);
// Браузерный вход всегда показывает выбор аккаунта Google и называет вошедший адрес:
// иначе браузер телефона молча входил владельцем, и любой аккаунт «получал» админку.
assert.match(app, /provider === "google" \? \{ prompt: "select_account" \} : undefined/);
assert.match(app, /options: \{ redirectTo: cloudRedirectUrl\(\), skipBrowserRedirect: true, queryParams \}/);
assert.match(app, /await handleCloudSession\(data\?\.session \|\| null\);\s*announceSignedInAccount\(\);/);
assert.match(app, /t\("signedInAs"\)\.replace\("\{email\}", \(\) => email\)/);
assert.match(app, /await handleCloudSession\(data\?\.session \|\| null\);\s*scheduleGoogleSignInPrompt\(\);/);
assert.match(app, /GOOGLE_PROMPT_INTERVAL = 3 \* 24 \* 60 \* 60 \* 1000/);
assert.match(app, /\$\("#googleSignIn"\)\.addEventListener\("click",\(\)=>signInWithGoogle\(\)\)/);
// Покупка без входа сразу предлагает войти и затем продолжает сама.
assert.equal(app.match(/requestSignInForPurchase\("(?:monthly|yearly)"\)/g)?.length, 2);
assert.match(app, /if \(cloudUser\?\.id\) resumePurchaseAfterSignIn\(\);/);

// Вход на виду: кнопка на главном экране, пока человек не вошёл.
assert.match(html, /<button class="smart-link home-signin-link" id="homeSignIn" type="button" hidden>/);
assert.match(app, /homeSignIn\.hidden = Boolean\(cloudUser\?\.id\) \|\| !cloudClient/);
assert.match(css, /\.home-smart-actions \.home-signin-link \{/);

// Пароль: повтор, честные ответы сервера и кнопка-глаз.
assert.match(html, /id="accountPasswordConfirm" type="password" autocomplete="new-password"/);
assert.match(app, /code === "same_password"\) done\("accountPasswordSame"\)/);
assert.match(app, /code === "weak_password"\) fail\("accountPasswordWeak", field\)/);
assert.match(app, /function installPasswordToggles\(\)/);
assert.match(app, /installPasswordToggles\(\);bindEvents\(\);/);
assert.match(html, /<symbol id="ic-eye" viewBox="0 0 24 24">/);
assert.match(html, /<symbol id="ic-eye-off" viewBox="0 0 24 24">/);
assert.doesNotMatch(html, /🔑/u, "icons come from the sprite, not emoji");
assert.equal(emailAuth.match(/invalidCredentials: "/g)?.length, 3);
assert.match(emailAuth, /=== "invalid_credentials"\) localizedStatus\("invalidCredentials", "error"\)/);
for (const key of ["homeSignIn", "googleSignedIn", "signedInAs", "signInToBuy", "accountPasswordConfirmLabel", "accountPasswordMismatch", "accountPasswordSame", "accountPasswordWeak", "passwordShow", "passwordHide"]) {
  assert.equal(app.match(new RegExp(`${key}:"`, "g"))?.length, 3, `${key} must exist in ru, en and fr`);
}

console.log(JSON.stringify({ ok: true, googleOneTap: "credential-manager", passwordToggles: true, homeSignIn: true }));
