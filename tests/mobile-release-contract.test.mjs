import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const android = read("mobile/android/app/build.gradle");
const ios = read("mobile/ios/project.yml");
const workflow = read(".github/workflows/mobile-build.yml");
const iosSync = read("mobile/scripts/sync_web_assets.py");

assert.match(android, /versionCode\s*=\s*6\b/);
assert.match(android, /versionName\s*=\s*["']2\.2\.0["']/);
assert.match(android, /exclude\s+["']mobile\/\*\*["'][\s\S]{0,180}["']supabase\/\*\*["'][\s\S]{0,180}["']tests\/\*\*["']/);
assert.match(android, /exclude\s+["']\*\.md["'][\s\S]{0,100}["']\*\.py["']/);
assert.match(ios, /MARKETING_VERSION:\s*2\.2\.0\b/);
assert.match(ios, /CURRENT_PROJECT_VERSION:\s*6\b/);
assert.match(workflow, /GlowLetter-2\.2\.0-debug\.apk/);
assert.match(workflow, /GlowLetter-2\.2\.0-preview-debug\.apk/);
assert.match(workflow, /TAG:\s*v2\.2\.0-preview/);
assert.doesNotMatch(workflow, /GlowLetter Next|GlowLetter-Next|app-debug\.apk|v2\.0\.0-next/);
for (const excluded of ["supabase", "tests", ".md", ".py"]) assert.match(iosSync, new RegExp(excluded.replace(".", "\\.")));

console.log(JSON.stringify({ ok: true, android: "2.2.0 (6)", ios: "2.2.0 (6)", previewTag: "v2.2.0-preview" }));
