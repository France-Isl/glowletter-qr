import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = relative => path.join(root, relative);
const readRequired = relative => {
  assert.ok(fs.existsSync(file(relative)), `${relative} is required by the email auth contract`);
  return fs.readFileSync(file(relative), "utf8");
};

const index = readRequired("index.html");
const app = readRequired("app.js");
const emailAuth = readRequired("email-auth.js");
const emailStyles = readRequired("email-auth.css");
const config = readRequired("supabase/config.toml");
const privacy = readRequired("privacy.html");
const terms = readRequired("terms.html");
const deletion = readRequired("delete-account.html");

// Login, registration, verification, resend, and status are accessible without
// replacing the existing social-auth account card.
for (const id of [
  "emailAuth",
  "emailLoginTab",
  "emailRegisterTab",
  "emailLoginPane",
  "emailLoginEmail",
  "emailLoginPassword",
  "emailLoginSubmit",
  "emailRegisterPane",
  "emailRegisterName",
  "emailRegisterEmail",
  "emailRegisterPassword",
  "emailRegisterSubmit",
  "emailVerifyPane",
  "emailCodeSentTo",
  "emailCode",
  "emailVerifySubmit",
  "emailResendCode",
  "emailChangeAddress",
  "emailAuthStatus"
]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist`);
}
assert.match(index, /id="emailLoginEmail"[^>]+type="email"[^>]+autocomplete="email"[^>]+maxlength="254"[^>]+required/);
assert.match(index, /id="emailLoginPassword"[^>]+type="password"[^>]+autocomplete="current-password"[^>]+minlength="8"[^>]+maxlength="128"[^>]+required/);
assert.match(index, /id="emailRegisterEmail"[^>]+type="email"[^>]+autocomplete="email"[^>]+maxlength="254"[^>]+required/);
assert.match(index, /id="emailRegisterPassword"[^>]+type="password"[^>]+autocomplete="new-password"[^>]+minlength="8"[^>]+maxlength="128"[^>]+required/);
assert.match(index, /id="emailCode"[^>]+inputmode="numeric"[^>]+autocomplete="one-time-code"[^>]+pattern="\[0-9\]\{6\}"[^>]+maxlength="6"[^>]+required/);
assert.match(index, /id="emailAuthStatus"[^>]+role="status"[^>]+aria-live="polite"/);

const loginPane = index.match(/<form[^>]+id="emailLoginPane"[\s\S]*?<\/form>/)?.[0] || "";
const registerPane = index.match(/<form[^>]+id="emailRegisterPane"[\s\S]*?<\/form>/)?.[0] || "";
const verifyPane = index.match(/<form[^>]+id="emailVerifyPane"[\s\S]*?<\/form>/)?.[0] || "";
assert.ok(loginPane && registerPane && verifyPane, "all email auth forms must be present");
assert.match(registerPane.match(/^<form[^>]+>/)?.[0] || "", /\bhidden\b/);
assert.match(verifyPane.match(/^<form[^>]+>/)?.[0] || "", /\bhidden\b/);

assert.match(index, /<link[^>]+href="email-auth\.css\?v=\d+"/);
assert.match(index, /<script[^>]+src="email-auth\.js\?v=\d+"/);
assert.ok(
  index.search(/app\.js\?v=\d+/) < index.search(/email-auth\.js\?v=\d+/),
  "GlowLetterCloud must be defined before email-auth.js runs"
);
assert.match(emailStyles, /\.email-auth-form\[hidden\]\s*\{[^}]*display\s*:\s*none/i);
assert.match(emailStyles, /#emailCode\s*\{[^}]*text-align\s*:\s*center/i);
assert.match(emailStyles, /email-auth-status\[data-state="error"\]/i);
assert.match(emailStyles, /:focus-visible/);
assert.match(emailStyles, /@media\(forced-colors:active\)/i);

// Copy and form behaviour support the same three languages as the app.
for (const language of ["ru", "en", "fr"]) {
  assert.match(emailAuth, new RegExp(`\\b${language}:\\s*\\{`), `email auth needs ${language} copy`);
}
assert.match(emailAuth, /glowletter-language-changed/);
assert.match(emailAuth, /document\.documentElement\.lang/);
assert.match(emailAuth, /emailAuthTitle:\s*"title"/, "the accessible section title must be translated");
assert.match(emailAuth, /\.split\("-"\)\[0\]/, "regional language tags must fall back to the supported base language");
assert.match(emailAuth, /role",\s*"tabpanel"/);
assert.match(emailAuth, /aria-describedby/);
assert.match(emailAuth, /ArrowLeft[\s\S]{0,160}ArrowRight[\s\S]{0,160}Home[\s\S]{0,160}End/);

// A pending address may survive a same-tab reload, but password and OTP must
// never be persisted. The OTP is normalised to exactly six digits.
assert.match(emailAuth, /const\s+PENDING_KEY\s*=\s*"glowletter-pending-email"/);
assert.match(emailAuth, /sessionStorage\.getItem\(PENDING_KEY\)/);
assert.match(emailAuth, /sessionStorage\.setItem\(PENDING_KEY,\s*pendingEmailMemory\)/);
assert.match(emailAuth, /try\s*\{\s*return\s+normalizeEmail\(sessionStorage\.getItem\(PENDING_KEY\)/);
assert.match(emailAuth, /catch\s*\{\s*return\s+pendingEmailMemory/);
assert.doesNotMatch(emailAuth, /localStorage[\s\S]{0,80}PENDING_KEY|PENDING_KEY[\s\S]{0,80}localStorage/);
assert.doesNotMatch(emailAuth, /(?:localStorage|sessionStorage)\.setItem\([^\n]*(?:password|token|code)/i);
assert.match(emailAuth, /replace\(\/\\D\/g,\s*""\)\.slice\(0,\s*6\)/);
assert.match(emailAuth, /token\.length\s*!==\s*6/);
assert.match(emailAuth, /const\s+RESEND_DELAY_MS\s*=\s*60000/);
assert.match(emailAuth, /setResendUntil\(Date\.now\(\)\s*\+\s*RESEND_DELAY_MS\)/);
assert.match(emailAuth, /button\.disabled\s*=\s*busy\s*\|\|\s*seconds\s*>\s*0/);

// Client-side password rules mirror the UI and avoid accepting a weak value
// before a request is made.
assert.match(emailAuth, /value\.length\s*>=\s*8/);
assert.match(emailAuth, /value\.length\s*<=\s*128/);
assert.match(emailAuth, /\/\[\\p\{L\}\]\/u\.test\(value\)/);
assert.match(emailAuth, /\/\\d\/u\.test\(value\)/);
assert.match(emailAuth, /normalize\("NFKC"\)\.trim\(\)\.toLowerCase\(\)\.slice\(0,\s*254\)/);

// The presentation layer talks only to the frozen public facade. Supabase calls
// remain centralised in app.js and use the intended signup-verification APIs.
for (const method of ["signInWithPassword", "registerEmail", "verifyEmailCode", "resendEmailCode"]) {
  assert.match(emailAuth, new RegExp(`api(?:\\?\\.)?\\.${method}|api\\?\\.${method}|api\\.${method}`), `email-auth.js must call ${method}`);
  assert.match(app, new RegExp(`\\b${method}:`), `GlowLetterCloud must expose ${method}`);
}
assert.match(app, /cloudClient\.auth\.signInWithPassword\(\{\s*email:\s*normalizedEmail,\s*password\s*\}\)/);
assert.match(app, /cloudClient\.auth\.signUp\(\{[\s\S]{0,450}email:\s*normalizedEmail,[\s\S]{0,100}password,[\s\S]{0,240}emailRedirectTo:/);
assert.match(app, /cloudClient\.auth\.verifyOtp\(\{\s*email:\s*normalizedEmail,\s*token:\s*normalizedToken,\s*type:\s*"email"\s*\}\)/);
assert.match(app, /cloudClient\.auth\.resend\(\{\s*type:\s*"signup",\s*email:\s*normalizedEmail,/);
assert.match(app, /if\s*\(normalizedToken\.length\s*!==\s*6\)\s*throw\s+new\s+Error\("invalid_code"\)/);
assert.match(app, /password\.length\s*<\s*8\s*\|\|\s*password\.length\s*>\s*128/);

const authFacade = app.match(/window\.GlowLetterCloud\s*=\s*Object\.freeze\(\{([\s\S]*?)\n\s*\}\);/)?.[1] || "";
assert.ok(authFacade, "window.GlowLetterCloud must be a frozen facade");
assert.doesNotMatch(`${emailAuth}\n${authFacade}`, /SUPABASE_SERVICE_ROLE_KEY|sb_secret_|service_role/i);
assert.doesNotMatch(emailAuth, /console\.(?:log|info|warn|error)/i);
assert.doesNotMatch(emailAuth, /(?:textContent|innerHTML)\s*=\s*(?:error|error\.(?:message|code))/i, "raw auth errors must never be rendered");
assert.match(emailAuth, /isRateLimitError/);
assert.match(emailAuth, /isUnavailableError/);

// Local configuration specifies six-digit, time-limited email OTPs. Production
// confirmation is an explicit release requirement documented for the operator.
const emailConfig = config.match(/\[auth\.email\]([\s\S]*?)(?=\n\[[^\]]+\]|$)/)?.[1] || "";
assert.ok(emailConfig, "[auth.email] must be configured");
assert.match(emailConfig, /enable_signup\s*=\s*true/);
assert.match(emailConfig, /enable_confirmations\s*=\s*true/, "local/staging signup must require the same confirmation as production");
assert.match(emailConfig, /otp_length\s*=\s*6/);
const otpExpiry = Number(emailConfig.match(/otp_expiry\s*=\s*(\d+)/)?.[1] || 0);
assert.ok(otpExpiry > 0 && otpExpiry <= 3600, "email OTP must expire within one hour");
assert.match(readRequired("ADMIN-GUIDE.md"), /Confirm email[\s\S]{0,100}(?:включён|enabled)[\s\S]{0,100}autoconfirm[^\n]*(?:выключен|disabled)/iu);

// Registration and verification are disclosed in every legal language, and a
// deletion request must never ask the user to send a password or code.
for (const [name, page] of [["privacy", privacy], ["terms", terms], ["deletion", deletion]]) {
  for (const language of ["ru", "en", "fr"]) {
    assert.match(page, new RegExp(`<section[^>]+id=["']${language}["'][^>]+lang=["']${language}["']`, "i"), `${name} needs ${language}`);
  }
}
assert.match(privacy, /шестизначный код подтверждения/u);
assert.match(privacy, /six-digit verification code/i);
assert.match(privacy, /code de vérification à six chiffres/i);
assert.match(deletion, /не отправляйте пароль или код подтверждения/u);
assert.match(deletion, /Never send your password or verification code/i);
assert.match(deletion, /N’envoyez jamais votre mot de passe ou code de vérification/i);

console.log(JSON.stringify({
  ok: true,
  modes: ["password-login", "email-signup", "six-digit-verification", "resend"],
  pendingStorage: "sessionStorage",
  languages: ["ru", "en", "fr"]
}));
