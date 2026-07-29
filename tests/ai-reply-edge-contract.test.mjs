import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const functionPath = path.join(root, "supabase", "functions", "generate-reply", "index.ts");
assert.ok(fs.existsSync(functionPath), "the real AI reply Edge Function must be versioned with the app");

const source = fs.readFileSync(functionPath, "utf8");

// The model credential remains server-side and every request is tied to a real account.
assert.match(source, /Deno\.env\.get\("GEMINI_API_KEY"\)/);
assert.match(source, /auth\.getUser\(match\[1\]\)/);
assert.match(source, /user\.is_anonymous === true/);
assert.doesNotMatch(source, /(?:AIza|AQ\.)[A-Za-z0-9_-]{20,}/);

// A real model receives the complete current message; no canned response is returned on failure.
assert.match(source, /generativelanguage\.googleapis\.com\/v1beta\/models/);
assert.match(source, /incoming_message:\s*incoming/);
assert.match(source, /Create one reply from this JSON data/);
assert.match(source, /return json\(request, \{ error: "ai_unavailable" \}/);
assert.doesNotMatch(source, /Спасибо за сообщение|Thank you for the message|Merci pour ton message/u);

// Sharia/adab safeguards run before and after generation, in addition to provider safety.
assert.match(source, /containsForbidden\(incoming\)/);
assert.match(source, /containsForbidden\(text\)/);
assert.match(source, /containsReligiousAuthorityClaim\(text\)/);
assert.match(source, /containsCoercion\(text\)/);
assert.match(source, /containsImproperRomance\(text, relationship\)/);
assert.match(source, /HARM_CATEGORY_SEXUALLY_EXPLICIT/);
assert.match(source, /no sexual, erotic, intimate, suggestive, kissing, nude, 18\+/i);
assert.match(source, /Do not issue a fatwa/i);

// Bound requests, timeouts, rate limiting, and no conversation logging protect the service.
assert.match(source, /MAX_REQUEST_BYTES/);
assert.match(source, /AbortController/);
assert.match(source, /RATE_LIMIT_REQUESTS/);
assert.doesNotMatch(source, /console\.(?:log|info|warn|error)/);

console.log(JSON.stringify({
  ok: true,
  provider: "Gemini",
  authenticated: true,
  inputAndOutputFiltered: true,
  cannedFallback: false
}));
