import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = relative => path.join(root, relative);
const readRequired = relative => {
  assert.ok(fs.existsSync(file(relative)), `${relative} is required by the Moments UI contract`);
  return fs.readFileSync(file(relative), "utf8");
};

const index = readRequired("index.html");
const app = readRequired("app.js");
const scriptReference = index.match(/<script[^>]+src=["']([^"']*moments[^"']*\.js(?:\?[^"']*)?)["']/i)?.[1] || "";
const styleReference = index.match(/<link[^>]+href=["']([^"']*moments[^"']*\.css(?:\?[^"']*)?)["']/i)?.[1] || "";
assert.ok(scriptReference, "index.html must load the Moments module");
assert.ok(styleReference, "index.html must load the Moments styles");
const source = readRequired(scriptReference.split("?")[0]);
const styles = readRequired(styleReference.split("?")[0]);
const renderedMarkup = `${index}\n${source}`;

// One overlay contains the people, dates, history, florist workflow, and public
// shared-letter view. Branding/social/order fields are deliberately absent.
for (const id of [
  "momentsLayer",
  "momentsBackdrop",
  "momentsClose",
  "momentsTabs",
  "momentsPeoplePane",
  "momentsDatesPane",
  "momentsHistoryPane",
  "momentsFloristPane",
  "momentsPersonForm",
  "momentsPeopleList",
  "momentsDateForm",
  "momentsDatesList",
  "momentsHistoryList",
  "momentsFloristForm",
  "momentsSharedView",
  "momentsSharedStatus",
  "momentsPersonId",
  "momentsPersonDisplayName",
  "momentsPersonRelationship",
  "momentsPersonLanguage",
  "momentsPersonTone",
  "momentsPersonLength",
  "momentsDateId",
  "momentsDatePerson",
  "momentsDateTitle",
  "momentsDateKind",
  "momentsEventDate",
  "momentsRecurrence",
  "momentsTimeZone",
  "momentsRemind7d",
  "momentsRemind3d",
  "momentsRemind1d",
  "momentsReminderOptIn",
  "momentsExportAllIcs",
  "momentsFloristSender",
  "momentsFloristRecipient",
  "momentsFloristLanguage",
  "momentsFloristUnlockAt",
  "momentsFloristEventDate",
  "momentsFloristNote"
]) {
  assert.match(renderedMarkup, new RegExp(`(?:id=["']${id}["']|\\.id\\s*=\\s*["']${id}["'])`), `${id} must exist`);
}
const layerTag = renderedMarkup.match(/<[^>]+id=["']momentsLayer["'][^>]*>/i)?.[0] || "";
if (layerTag) {
  assert.match(layerTag, /aria-hidden=["']true["']/i, "Moments must initially be closed");
} else {
  assert.match(source, /root\.id\s*=\s*["']momentsLayer["']/i);
  assert.match(source, /root\.hidden\s*=\s*true/i);
  assert.match(source, /root\.setAttribute\(\s*["']aria-hidden["']\s*,\s*["']true["']\s*\)/i);
}
assert.match(renderedMarkup, /id=["']momentsSharedStatus["'][^>]+role=["']status["'][^>]+aria-live=["']polite["']/i);
assert.match(renderedMarkup, /id=["']momentsEventDate["'][^>]+type=["']date["']/i);
assert.match(renderedMarkup, /id=["']momentsFloristUnlockAt["'][^>]+type=["']datetime-local["']/i);
for (const checkbox of ["momentsRemind7d", "momentsRemind3d", "momentsRemind1d", "momentsReminderOptIn"]) {
  assert.match(renderedMarkup, new RegExp(`id=["']${checkbox}["'][^>]+type=["']checkbox["']`, "i"));
}
assert.match(renderedMarkup, /<(?:button|a)[^>]+id=["']momentsExportAllIcs["']/i);
assert.match(styles, /#?momentsLayer|\.moments-layer/i);
assert.match(styles, /\[hidden\]\s*\{[^}]*display\s*:\s*none/i);

for (const forbidden of [
  /florist[_-]?logo/i,
  /shop[_-]?logo/i,
  /instagram[_-]?(?:handle|profile|account|url)/i,
  /order[_-]?history/i,
  /momentsInstagram/i,
  /momentsOrders/i
]) {
  assert.doesNotMatch(`${index}\n${source}`, forbidden);
}

// The module exposes a stable integration facade rather than leaking mutable
// internal state into app.js.
assert.match(source, /window\.GlowLetterMoments\s*=\s*Object\.freeze\s*\(/);
for (const method of [
  "init",
  "setSession",
  "setLanguage",
  "open",
  "close",
  "handleSharedToken",
  "recordLetter",
  "createQrForLetter",
  "revokeQrLink",
  "nextOccurrence",
  "getDueReminders",
  "createIcs"
]) {
  assert.match(source, new RegExp(`\\b${method}\\b`), `GlowLetterMoments must expose ${method}`);
}
assert.match(source, /\bhelpers\s*(?::|,)/);

// Signed-in CRUD targets only the four RLS-protected Moments tables.
for (const table of ["glowletter_people", "glowletter_moments", "glowletter_letters", "glowletter_qr_links"]) {
  assert.match(source, new RegExp(`\\b${table}\\b`, "i"), `${table} must be used by the UI API`);
}
assert.match(source, /getUser\s*\(|session\?\.user|session\.user/, "cloud writes must require an authenticated session");

// QR creation and revocation go through owner-scoped RPCs with the complete,
// reviewed argument contract. Public resolution accepts only the opaque UUID.
assert.match(
  source,
  /\.rpc\(\s*["']glowletter_create_qr_link["']\s*,\s*\{[\s\S]{0,500}\bp_kind\b[\s\S]{0,120}\bp_letter_id\b[\s\S]{0,120}\bp_person_id\b[\s\S]{0,120}\bp_unlock_at\b[\s\S]{0,120}\bp_expires_at\b/i
);
assert.match(source, /\.rpc\(\s*["']glowletter_revoke_qr_link["']\s*,\s*\{\s*p_id\s*:/i);
assert.match(source, /\/functions\/v1\/resolve-letter\?public_id=/);
assert.match(source, /encodeURIComponent\s*\(/, "public_id must be URL encoded");
assert.doesNotMatch(source, /resolve-letter\?[^\n"'`]*(?:text|sender|recipient|email)=/i);

// Deep links carry only the opaque capability in the `moment` query parameter.
assert.match(source, /searchParams\.get\(\s*["']moment["']\s*\)/);
assert.match(source, /searchParams\.set\(\s*["']moment["']\s*,/);
assert.doesNotMatch(source, /searchParams\.set\(\s*["'](?:letterText|prompt|idea|email)["']/i);

// History saves a final letter, never the raw generation prompt or idea.
const recordLetterBody = source.match(/(?:async\s+)?function\s+recordLetter\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";
assert.ok(recordLetterBody, "recordLetter must be a named, reviewable function");
assert.match(recordLetterBody, /glowletter_letters/);
assert.match(recordLetterBody, /\btext\b/);
assert.doesNotMatch(recordLetterBody, /\b(?:raw_)?prompt\b|\bidea\b|\binstruction(?:s)?\b/i);

// Reminder computation and calendar export are local helpers. The ICS output
// has a real VEVENT and is not uploaded to a third-party API.
assert.match(source, /function\s+nextOccurrence\s*\(/);
assert.match(source, /function\s+getDueReminders\s*\(/);
assert.match(source, /function\s+createIcs\s*\(/);
for (const marker of ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", "DTSTART", "SUMMARY", "END:VEVENT", "END:VCALENDAR"]) {
  assert.match(source, new RegExp(marker.replace(":", "\\:")), `ICS output needs ${marker}`);
}
assert.doesNotMatch(source, /googleapis\.com\/calendar|graph\.microsoft\.com|calendar\.apple\.com/i);

// The app and module exchange session/language/final-letter context explicitly.
assert.match(`${app}\n${source}`, /GlowLetterMoments/);
assert.match(`${app}\n${source}`, /setSession\s*\(/);
assert.match(`${app}\n${source}`, /setLanguage\s*\(/);
assert.match(`${app}\n${source}`, /recordLetter\s*\(/);

console.log(JSON.stringify({
  ok: true,
  script: scriptReference,
  panes: ["people", "dates", "history", "florist", "shared"],
  reminderModes: ["in-app", "ics"],
  excluded: ["florist-logo", "instagram", "order-history"]
}));
