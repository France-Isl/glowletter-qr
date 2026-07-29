import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = relative => path.join(root, relative);
const readRequired = relative => {
  const absolute = filePath(relative);
  assert.ok(fs.existsSync(absolute), `${relative} is required by the support contract`);
  return fs.readFileSync(absolute, "utf8");
};
const extractFunction = (source, start, end) => {
  const match = source.match(new RegExp(`${start}([\\s\\S]+?)${end}`));
  assert.ok(match, `could not extract ${start}`);
  return match[1];
};
const sorted = values => [...values].sort();

const index = readRequired("index.html");
const app = readRequired("app.js");
const edge = readRequired("supabase/functions/submit-support/index.ts");
const migration = readRequired("supabase/migrations/20260729112353_support_tickets.sql");
const configPath = filePath("supabase/config.toml");
const supabaseConfig = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf8") : "";

const expectedCategories = ["technical", "account", "subscription", "content", "feedback", "other"];

// Support opens an in-app form. It is not a mailto link that exposes account details.
const supportControl = index.match(/<[^>]+id=["']supportOpenButton["'][^>]*>/i)?.[0] || "";
assert.ok(supportControl, "the settings screen must expose supportOpenButton");
assert.match(supportControl, /^<button\b/i, "support must be an in-app button");
assert.doesNotMatch(supportControl, /\bhref\s*=|mailto:/i);
for (const id of [
  "supportLayer",
  "supportForm",
  "supportEmailValue",
  "supportIdValue",
  "supportCategory",
  "supportMessage",
  "supportSubmit"
]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist in the support flow`);
}
assert.match(app, /#supportOpenButton[^\n]*addEventListener\(["']click["'],\s*openSupportForm\)/);

const supportFormHtml = index.match(/<form\s+id=["']supportForm["'][^>]*>([\s\S]*?)<\/form>/i)?.[1] || "";
assert.ok(supportFormHtml, "the in-app support form is required");

// Identity is read-only and comes from the signed-in Supabase user/account state.
assert.match(index, /<strong\s+id=["']supportEmailValue["'][^>]*>/i);
assert.match(index, /<code\s+id=["']supportIdValue["'][^>]*>/i);
assert.doesNotMatch(index, /<(?:input|textarea|select)[^>]+id=["']support(?:Email|Id)(?:Value)?["']/i);
const renderSupportState = extractFunction(
  app,
  "function renderSupportFormState\\(\\)\\s*\\{",
  "\\n\\s*function openSupportForm\\("
);
assert.match(renderSupportState, /const signedIn\s*=\s*Boolean\(cloudUser\?\.id\)/);
assert.match(renderSupportState, /form\.hidden\s*=\s*!signedIn/);
assert.match(renderSupportState, /#supportEmailValue[\s\S]{0,160}cloudUser\.email/);
assert.match(renderSupportState, /#supportIdValue[\s\S]{0,180}cloudAccount\.support_id/);
assert.match(app, /\.rpc\(\s*["']glowletter_my_access["']\s*\)/, "account support data must come from the server RPC");

// The category vocabulary and message limits are identical at every layer.
const categorySelect = index.match(/<select\s+id=["']supportCategory["'][^>]*>([\s\S]*?)<\/select>/i)?.[1] || "";
assert.ok(categorySelect, "supportCategory options are required");
const htmlCategories = [...categorySelect.matchAll(/<option\s+value=["']([^"']+)["']/gi)].map(match => match[1]);
assert.deepEqual(htmlCategories, expectedCategories, "the support form categories changed unexpectedly");

const appCategories = app.match(/const SUPPORT_CATEGORIES\s*=\s*new Set\(\[([^\]]+)\]\)/)?.[1]
  ?.match(/["']([^"']+)["']/g)
  ?.map(value => value.slice(1, -1)) || [];
const edgeCategories = edge.match(/const SUPPORT_CATEGORIES\s*=\s*new Set\(\[([\s\S]*?)\]\)/)?.[1]
  ?.match(/["']([^"']+)["']/g)
  ?.map(value => value.slice(1, -1)) || [];
const sqlCategoryCheck = migration.match(/check\s*\(\s*category\s+in\s*\(([^)]+)\)\s*\)/i)?.[1]
  ?.match(/'([^']+)'/g)
  ?.map(value => value.slice(1, -1)) || [];
assert.deepEqual(sorted(appCategories), sorted(expectedCategories), "frontend category validation must match the form");
assert.deepEqual(sorted(edgeCategories), sorted(expectedCategories), "Edge Function categories must match the form");
assert.deepEqual(sorted(sqlCategoryCheck), sorted(expectedCategories), "database categories must match the form");

const supportMessageTag = index.match(/<textarea[^>]+id=["']supportMessage["'][^>]*>/i)?.[0] || "";
assert.match(supportMessageTag, /\bminlength=["']20["']/i);
assert.match(supportMessageTag, /\bmaxlength=["']2000["']/i);
assert.match(app, /const SUPPORT_MESSAGE_MIN\s*=\s*20\s*;/);
assert.match(app, /const SUPPORT_MESSAGE_MAX\s*=\s*2000\s*;/);
assert.match(edge, /message\.length\s*<\s*20\s*\|\|\s*message\.length\s*>\s*2000/);
assert.match(migration, /char_length\(message\)\s+between\s+20\s+and\s+2000/i);

// The browser submits content metadata only; email, user ID and Support ID are never editable payload fields.
const submitSupport = extractFunction(
  app,
  "async function submitSupportRequest\\(event\\)\\s*\\{",
  "\\n\\s*async function detectCloudProviders\\("
);
assert.match(submitSupport, /cloudClient\.functions\.invoke\(\s*["']submit-support["']/);
const invokeBody = submitSupport.match(/body\s*:\s*\{([\s\S]*?)\}\s*\n?\s*\}/)?.[1] || "";
assert.ok(invokeBody, "submit-support must receive a structured body");
for (const key of ["category", "message", "language", "app_version", "platform"]) {
  assert.match(invokeBody, new RegExp(`\\b${key}\\b`), `${key} must be included in the support request`);
}
assert.doesNotMatch(invokeBody, /\b(?:email|user_?id|support_?id|account_?id)\b/i);
assert.doesNotMatch(supportFormHtml, /<(?:input|textarea|select)[^>]+(?:name|id)=["'][^"']*(?:email|support.?id|account.?id)[^"']*["']/i);

// The Edge Function independently verifies the Bearer JWT and derives identity from Auth.
assert.match(edge, /request\.headers\.get\(["']authorization["']\)/i);
assert.match(edge, /authorization\.match\(\/\^Bearer\\s\+\(\[\^\\s\]\+\)\$\/iu\)/);
assert.match(edge, /authClient\.auth\.getUser\(match\[1\]\)/);
assert.match(edge, /userError\s*\|\|\s*!user\s*\|\|\s*user\.is_anonymous\s*===\s*true/);
assert.doesNotMatch(supabaseConfig, /\[functions\.submit-support\][\s\S]*?verify_jwt\s*=\s*false/i);

// Auth email and Support ID are looked up server-side, then written through service-role-only RPCs.
assert.match(edge, /const accountEmail\s*=\s*normalizedEmail\(user\?\.email\)/);
assert.match(edge, /p_user_id:\s*user\.id/);
assert.match(edge, /p_contact_email:\s*accountEmail/);
assert.doesNotMatch(edge, /body\.(?:email|user_?id|support_?id|account_?id)/i);
assert.match(migration, /select\s+account\.support_id[\s\S]{0,180}from\s+public\.glowletter_accounts\s+as\s+account[\s\S]{0,120}account\.user_id\s*=\s*p_user_id/i);
assert.doesNotMatch(migration, /glowletter_create_support_ticket\s*\([\s\S]{0,180}\bp_support_id\b/i);

// Per-account rolling limits are serialized and enforced at 3/hour and 10/day.
assert.match(migration, /pg_advisory_xact_lock/i);
assert.match(migration, /created_at\s*>\s*now\(\)\s*-\s*interval\s*'1 hour'/i);
assert.match(migration, /created_at\s*>\s*now\(\)\s*-\s*interval\s*'1 day'/i);
assert.match(migration, /tickets_last_hour\s*>=\s*3\s+or\s+tickets_last_day\s*>=\s*10/i);
assert.match(edge, /rateLimited[\s\S]{0,240}return json\(request,\s*\{\s*error:\s*["']rate_limited["']\s*\},\s*429\)/);

// Tickets are private with RLS defense in depth and no browser-role table privileges.
assert.match(migration, /create\s+table\s+private\.glowletter_support_tickets/i);
assert.match(migration, /alter\s+table\s+private\.glowletter_support_tickets\s+enable\s+row\s+level\s+security/i);
assert.match(migration, /revoke\s+all\s+on\s+table\s+private\.glowletter_support_tickets\s+from\s+public,\s*anon,\s*authenticated/i);
assert.match(migration, /to\s+authenticated\s+using\s*\(false\)\s+with\s+check\s*\(false\)/i);
assert.doesNotMatch(migration, /grant\s+(?![^;]*\bservice_role\b)[^;]+on\s+table\s+private\.glowletter_support_tickets\s+to\s+(?:public|anon|authenticated)/i);
assert.match(migration, /grant\s+select,\s*insert,\s*update,\s*delete\s+on\s+table\s+private\.glowletter_support_tickets\s+to\s+service_role/i);

// Email delivery is optional: missing Resend settings keep the accepted ticket in the database.
for (const secret of ["RESEND_API_KEY", "SUPPORT_FROM_EMAIL", "SUPPORT_TO_EMAIL"]) {
  assert.match(edge, new RegExp(`Deno\\.env\\.get\\(["']${secret}["']\\)`), `${secret} must be read server-side`);
}
assert.match(edge, /if\s*\(!apiKey\s*\|\|\s*!validMailHeader\(from\)\s*\|\|\s*!to\)\s*\{\s*return\s*\{\s*attempted:\s*false,\s*sent:\s*false/i);
assert.match(edge, /return json\(request,\s*\{\s*accepted:\s*true,\s*emailSent:\s*delivery\.sent\s*\},\s*202\)/);
assert.match(edge, /https:\/\/api\.resend\.com\/emails/);

// Tokens, request bodies and account identity must never be written to function logs or responses.
assert.doesNotMatch(edge, /console\.(?:log|info|warn|error|debug)\s*\(/i);
assert.doesNotMatch(edge, /json\(request,\s*\{[^}]*\b(?:email|supportId|support_id|userId|user_id|message|token)\s*:/i);

console.log(JSON.stringify({
  ok: true,
  categories: expectedCategories,
  messageLength: "20-2000",
  rateLimits: { hour: 3, day: 10 },
  jwtVerified: true,
  privateTickets: true,
  optionalResend: true
}));
