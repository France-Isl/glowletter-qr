import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = relative => path.join(root, relative);
const read = relative => fs.readFileSync(filePath(relative), "utf8");
const readRequired = relative => {
  assert.ok(fs.existsSync(filePath(relative)), `${relative} is required by the final release contract`);
  return read(relative);
};

const index = read("index.html");
const app = read("app.js");
const config = read("config.js");
const lettersSource = read("letters.js");
const replyEngine = read("reply-engine.js");
const worker = read("sw.js");
const privacy = read("privacy.html");
const terms = readRequired("terms.html");
const deletionPage = readRequired("delete-account.html");
const deleteAccountFunction = readRequired("supabase/functions/delete-account/index.ts");
const migration = read("supabase/migrations/20260727180056_glowletter_baseline.sql");
const vendorMetadata = JSON.parse(read("vendor/supabase-js.version.json"));
const vendorBuffer = fs.readFileSync(path.join(root, "vendor", vendorMetadata.vendoredFile));

// Production configuration must contain only public browser values.
assert.match(config, /supabaseUrl:\s*"https:\/\/xzzngrquomyiglktroqi\.supabase\.co"/);
assert.match(config, /supabasePublishableKey:\s*"sb_publishable_/);
assert.match(config, /publicShareUrl:\s*"https:\/\/france-isl\.github\.io\/glowletter-next\/"/);
assert.doesNotMatch(config, /service_role|sb_secret_/i);

// Final commercial plan: one monthly subscription and a separately restorable legacy purchase.
assert.match(config, /productId:\s*"glowletter_premium_monthly"/);
assert.match(config, /subscriptionProductId:\s*"glowletter_premium_monthly"/);
assert.match(config, /subscriptionBasePlanId:\s*"monthly"/);
assert.match(config, /legacyProductId:\s*"full_access"/);
assert.match(config, /defaultPrice:\s*"21,99\s*€\/месяц"/u);
assert.match(index, /21,99\s*€\/месяц/u);
assert.match(app, /€21\.99\/month/);
assert.match(app, /21,99\s*€\/mois/u);
assert.match(app, /автоматически продлевается каждый месяц/u);
assert.match(app, /renews automatically every month/i);
assert.match(app, /se renouvelle automatiquement chaque mois/i);
assert.doesNotMatch(index, /(?:4[,.]99|7[,.]99)\s*€/u);

const csp = index.match(/Content-Security-Policy" content="([^"]+)"/)?.[1] || "";
assert.match(csp, /connect-src[^;]*https:\/\/xzzngrquomyiglktroqi\.supabase\.co/);
assert.doesNotMatch(csp, /https:\/\/\*\.supabase\.co/);
assert.ok(index.indexOf("vendor/supabase-2.110.9.js?v=13") < index.indexOf("reply-engine.js?v=13"));
assert.ok(index.indexOf("reply-engine.js?v=13") < index.indexOf("app.js?v=13"));
assert.match(index, /id="facebookSignIn"[^>]*hidden[^>]*disabled/);
assert.match(index, /id="shareAppButton"/);

// Names are dynamic throughout the built-in collection. A sender's custom text must not be rewritten.
const letterContext = { window: {} };
vm.runInNewContext(lettersSource, letterContext, { filename: "letters.js" });
const letters = letterContext.window.NUR_LETTERS;
assert.ok(Array.isArray(letters), "letters.js must expose window.NUR_LETTERS");
assert.equal(letters.length, 50, "the reviewed built-in collection must contain 50 letters");
const hardCodedRecipient = /Айша|Аиша|Aisha|Aïcha|Aicha/iu;
for (const letter of letters) {
  for (const language of ["ru", "en", "fr"]) {
    assert.equal(typeof letter[language], "string", `letter ${letter.id} must have ${language} text`);
    assert.doesNotMatch(letter[language], hardCodedRecipient, `letter ${letter.id}/${language} must not contain a fixed recipient`);
  }
}
assert.doesNotMatch(lettersSource, hardCodedRecipient);
assert.doesNotMatch(app, /\.replaceAll\(\s*["'](?:Айша|Аиша|Aisha|Aïcha|Aicha)["']/iu);
assert.match(lettersSource, /\{to\}/);

// The small "for" label on the letter is localized together with the selected language.
assert.match(index, /id="letterForLabel"/);
assert.match(app, /setText\(\s*["']#letterForLabel["']\s*,\s*t\(["']for["']\)\s*\)/);
for (const localized of [/for:\s*"для"/u, /for:\s*"for"/, /for:\s*"pour"/]) assert.match(app, localized);

// Smart replies expose semantic analysis, length control, and a final editable-text audit.
for (const method of ["analyze", "resolveLength", "audit"]) {
  assert.match(replyEngine, new RegExp(`function ${method}\\(`));
}
assert.match(index, /id="replyLength"/);
assert.match(index, /id="replyInsight"/);
assert.match(index, /id="replyAudit"/);
assert.match(app, /REPLY_ENGINE\.analyze\(/);
assert.match(app, /REPLY_ENGINE\.audit\(/);
assert.match(app, /#replyLength/);
assert.match(app, /function updateReplyInsight\(/);
assert.match(app, /function renderReplyAudit\(/);
assert.match(app, /#replyGeneratedText[^\n]*addEventListener\(\s*["']input["']/);
assert.match(app, /#copyReply[^\n]*renderReplyAudit\(/);
assert.match(app, /window\.NUR_REPLY_ENGINE/);

// Supabase OAuth, row-level progress sync, and in-app deletion contracts.
assert.match(app, /flowType:\s*"pkce"/);
assert.match(app, /detectSessionInUrl:\s*false/);
assert.match(app, /skipBrowserRedirect:\s*true/);
assert.match(app, /if \(!url \|\| url\.hash\) return false/);
assert.match(app, /settings\?\.external\?\.facebook === true/);
assert.match(app, /AUTH_CALLBACK_PARAMETERS\.forEach\(key => url\.searchParams\.delete\(key\)\)/);
assert.match(app, /let linkNamesActive = namesCameFromUrl/);
assert.match(app, /linkNamesActive \? \{ sender: "", recipient: "" \}/);
assert.match(app, /if \(persist && explicit\) linkNamesActive = false/);
assert.match(app, /scheduleCloudSync\(\{includeNames:true,immediate:true\}\)/);
assert.match(app, /CLOUD_USER_ENVELOPE_PREFIX/);
assert.match(app, /\.update\(payload\)[\s\S]*\.eq\("revision", envelope\.baseRevision\)/);
assert.match(app, /\.insert\(payload\)/);
assert.match(app, /CLOUD_MAX_WRITE_ATTEMPTS/);
assert.doesNotMatch(app, /\.upsert\(/);
assert.match(index, /id="accountDelete"/);
assert.match(app, /functions\.invoke\(\s*["']delete-account["']/);
assert.match(app, /#accountDelete[^\n]*addEventListener\(\s*["']click["']\s*,\s*deleteCloudAccount\s*\)/);
assert.match(deleteAccountFunction, /authorization|bearer/i);
assert.match(deleteAccountFunction, /auth\.getUser\(/);
assert.match(deleteAccountFunction, /SUPABASE_SERVICE_ROLE_KEY/);
assert.match(deleteAccountFunction, /auth\.admin\.deleteUser\(/);
assert.doesNotMatch(deleteAccountFunction, /console\.(?:log|info|error)\([^\n]*serviceRoleKey/i);
assert.doesNotMatch(deleteAccountFunction, /(?:body|error|deleted)\s*:\s*serviceRoleKey/i);

// Owner capability remains device-local and is carried only by the explicitly shared owner link.
assert.match(app, /let acceptedBetaCapability\s*=\s*""/);
assert.match(app, /acceptedBetaCapability\s*=\s*acceptedToken/);
assert.match(app, /localStorage\.setItem\(BETA_STORAGE_KEY/);
assert.match(app, /async function handleCapabilityNavigation\(/);
assert.match(app, /addEventListener\("hashchange",\s*handleCapabilityNavigation\)/);
assert.match(app, /function buildAppShareUrl\(/);
assert.match(app, /async function shareApplication\(/);
const shareUrlBody = app.match(/function buildAppShareUrl\([^)]*\)\s*\{([\s\S]+?)\r?\n\s*\}\r?\n\s*\r?\n\s*async function shareApplication\(/)?.[1] || "";
assert.match(shareUrlBody, /CONFIG\.publicShareUrl/);
assert.match(shareUrlBody, /acceptedBetaCapability/);
assert.match(shareUrlBody, /\w+\.search\s*=\s*""/);
assert.match(shareUrlBody, /\w+\.hash\s*=\s*""/);
assert.match(shareUrlBody, /\w+\.hash\s*=\s*new URLSearchParams\(\{\s*access:\s*acceptedBetaCapability\s*\}\)\.toString\(\)/);
assert.doesNotMatch(shareUrlBody, /\b(?:fromName|toName|sharedMessage|isPremium|entitlementState)\b|localStorage|gl(?:Scene|Frame|Ink|Type)/);
assert.doesNotMatch(shareUrlBody, /searchParams\.set\(\s*["'](?:access|beta)["']/);
const shareApplicationBody = app.match(/async function shareApplication\([^)]*\)\s*\{([\s\S]+?)\r?\n\s*\}\r?\n\s*\r?\n\s*function updateFullscreenControl/)?.[1] || "";
assert.match(shareApplicationBody, /navigator\.share\(\{\s*title:\s*t\("title"\),\s*text:\s*t\("shareAppText"\),\s*url\s*\}\)/);
assert.match(shareApplicationBody, /error\?\.name\s*===\s*"AbortError"/);
assert.match(shareApplicationBody, /writeClipboard\(url\)/);
assert.match(shareApplicationBody, /showToast\(t\("shareAppCopied"\)\)/);
assert.match(app, /#shareAppButton[^\n]*addEventListener\("click",\s*shareApplication\)/);

const stateBody = app.match(/function cloudProgressState\(\) \{([\s\S]+?)\r?\n  \}\r?\n\r?\n  function cloudProgressSignature/)?.[1] || "";
for (const allowed of ["sender_name", "recipient_name", "language", "current_letter_id", "favorite_ids", "rain_enabled", "weather_enabled", "built_in_track", "nature_enabled", "fullscreen_enabled", "volume"]) {
  assert.match(stateBody, new RegExp(`\\b${allowed}\\b`));
}
for (const forbidden of ["betaAccess", "backgroundUrl", "customAudioBlob", "generatedMessage", "generatedReply", "latitude", "longitude", "replyIncoming"]) {
  assert.doesNotMatch(stateBody, new RegExp(`\\b${forbidden}\\b`));
}

// Service-worker v13 must update its own cache only and never cache personalized links.
assert.match(worker, /const CACHE_PREFIX = "glow-letter-next-"/);
assert.match(worker, /const CACHE = `\$\{CACHE_PREFIX\}v13`/);
for (const resource of ["styles.css", "experience.css", "config.js", "supabase-2.110.9.js", "letters.js", "reply-engine.js", "app.js", "experience.js", "manifest.webmanifest"]) {
  assert.match(worker, new RegExp(`${resource.replaceAll(".", "\\.")}\\?v=13`));
}
for (const resource of ["styles.css", "experience.css", "config.js", "supabase-2.110.9.js", "letters.js", "reply-engine.js", "app.js", "experience.js", "manifest.webmanifest"]) {
  assert.match(index, new RegExp(`${resource.replaceAll(".", "\\.")}\\?v=13`));
}
assert.match(app, /serviceWorker\.register\("sw\.js\?v=13"/);
assert.match(app, /\.update\(\)/, "an installed app must actively check for a new service worker");
assert.match(app, /serviceWorker\.addEventListener\(\s*["']controllerchange["']/, "the installed app must adopt an activated update");
assert.match(worker, /key\.startsWith\(CACHE_PREFIX\) && key !== CACHE/);
assert.doesNotMatch(worker, /keys\.map\(key => caches\.delete\(key\)\)/);
for (const sensitive of ["beta", "access", "from", "to", "msg", "code", "state", "error_description", "refresh_token", "provider_token"]) {
  assert.match(worker, new RegExp(`"${sensitive}"`));
}

// Public policy pages must describe the actual subscription and deletion mechanisms.
assert.match(index, /href="terms\.html"/);
assert.match(index, /href="delete-account\.html"/);
assert.match(privacy, /Supabase Auth/);
assert.match(privacy, /Ключ закрытого тестового доступа передаётся только сервису генерации/);
assert.doesNotMatch(privacy, /ключ закрытого тестового доступа в облако не отправляются/);
assert.match(privacy, /(?:ежемесячн|monthly|mensuel)/iu);
assert.match(privacy, /(?:удалить аккаунт|удаление аккаунта)/iu);
assert.match(terms, /(?:21[,.]99|цена[^<]*(?:магазин|store))/iu);
assert.match(terms, /(?:ежемесячн|monthly|mensuel)/iu);
assert.match(terms, /(?:автопродлен|auto-renew|renouvellement)/iu);
assert.match(terms, /(?:отмен|cancel|annul)/iu);
assert.match(deletionPage, /ggooglov9@gmail\.com/i);
assert.match(deletionPage, /(?:удал|delete|supprim)/iu);
assert.match(deletionPage, /(?:аккаунт|account|compte)/iu);

assert.match(migration, /enable row level security/i);
assert.match(migration, /to authenticated[\s\S]*auth\.uid\(\)[\s\S]*user_id/i);
assert.match(migration, /with check \(\(select auth\.uid\(\)\) = user_id\)/i);

assert.equal(vendorMetadata.version, "2.110.9");
assert.equal(crypto.createHash("sha256").update(vendorBuffer).digest("hex"), vendorMetadata.vendoredSha256);

console.log(JSON.stringify({
  ok: true,
  sdk: vendorMetadata.version,
  cache: "v13",
  subscription: "glowletter_premium_monthly/monthly",
  price: "EUR 21.99 monthly",
  letters: letters.length,
  dynamicRecipient: true,
  localizedLetterFor: true,
  smartReplyAudit: true,
  accountDeletion: true,
  safeAppShare: true,
  rls: true
}));
