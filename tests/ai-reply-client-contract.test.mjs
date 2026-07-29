import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const extractFunction = (source, start, end) => {
  const match = source.match(new RegExp(`${start}([\\s\\S]+?)${end}`));
  assert.ok(match, `could not extract ${start}`);
  return match[1];
};

const app = read("app.js");
const config = read("config.js");

assert.match(config, /aiReplyFunction:\s*["']generate-reply["']/);
assert.doesNotMatch(config, /GEMINI_API_KEY|OPENAI_API_KEY|service_role|sb_secret_/i);

const remoteComposeReply = extractFunction(
  app,
  "async function remoteComposeReply\\([^)]*\\)\\s*\\{",
  "\\n\\s*function replyAiFailure\\("
);
assert.match(remoteComposeReply, /CONFIG\.aiReplyFunction/);
assert.match(remoteComposeReply, /!cloudSession\?\.access_token\s*\|\|\s*!cloudUser\?\.id/);
assert.match(remoteComposeReply, /cloudClient\.functions\.invoke\(functionName/);
assert.match(remoteComposeReply, /body:\s*\{\s*incoming,\s*language:\s*lang,\s*relationship,\s*tone,\s*length:\s*resolvedLength,\s*variant\s*\}/);
assert.doesNotMatch(remoteComposeReply, /CONFIG\.aiEndpoint|fetch\(|localComposeReply|replyAnalysis\(|isAligned\(|\bintent\s*[,}:]/);
assert.match(remoteComposeReply, /status\s*===\s*401\s*\?\s*["']sign_in_required["']/);

const generateReply = extractFunction(
  app,
  "async function generateReply\\(\\)\\s*\\{",
  "\\n\\s*function usePersonalText\\("
);
assert.match(generateReply, /generatedReply\s*=\s*await remoteComposeReply\(/);
assert.doesNotMatch(generateReply, /localComposeReply\(|CONFIG\.aiEndpoint|replyAnalysis\(|isAligned\(|contextAligned|composeFail/);
assert.match(generateReply, /showReplyError\(t\(["']replySignInRequired["']\)\)/);
assert.match(generateReply, /showReplyError\(t\(["']replyAiUnavailable["']\)\)/);
assert.match(generateReply, /enforceIntent:\s*false/);
assert.match(generateReply, /enforceSemantics:\s*false/);

const updateReplyInsight = extractFunction(
  app,
  "function updateReplyInsight\\(\\)\\s*\\{",
  "\\n\\s*function replyAuditResult\\("
);
assert.match(updateReplyInsight, /insight\.hidden\s*=\s*true/);
assert.doesNotMatch(updateReplyInsight, /replyAnalysis|REPLY_INTENT_LABELS|recommendedTone|recommendedLength/);

const resolveReplyLength = extractFunction(
  app,
  "function resolveReplyLength\\([^)]*\\)\\s*\\{",
  "\\n\\s*function replyFitsSelectedLength\\("
);
assert.doesNotMatch(resolveReplyLength, /REPLY_ENGINE|replyAnalysis|infer/);

const replyFitsSelectedLength = extractFunction(
  app,
  "function replyFitsSelectedLength\\([^)]*\\)\\s*\\{",
  "\\n\\s*function replyOptionLabel\\("
);
assert.doesNotMatch(replyFitsSelectedLength, /words\s*>=|minWords/);

const replyAuditResult = extractFunction(
  app,
  "function replyAuditResult\\([^)]*\\)\\s*\\{",
  "\\n\\s*function renderReplyAudit\\("
);
assert.match(replyAuditResult, /context\.enforceSemantics\s*!==\s*false/);
assert.match(replyAuditResult, /context\.enforceIntent\s*===\s*false/);

for (const key of ["replySafetyTitle", "replyErrorTitle", "replySignInRequired", "replyAiUnavailable", "replyAiRejected"]) {
  const occurrences = app.match(new RegExp(`${key}:`, "g")) || [];
  assert.equal(occurrences.length, 3, `${key} must be localized in ru, en, and fr`);
}

console.log(JSON.stringify({
  ok: true,
  function: "generate-reply",
  sessionRequired: true,
  cannedFallback: false,
  heuristicInsight: false,
  semanticClientGate: false
}));
