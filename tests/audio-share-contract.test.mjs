import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = relative => path.join(root, relative);
const read = relative => fs.readFileSync(file(relative), "utf8");

const index = read("index.html");
const app = read("app.js");
const worker = read("sw.js");
const config = read("supabase/config.toml");
const migration = read("supabase/migrations/20260802103909_temporary_shared_audio.sql");
const sharedFunction = read("supabase/functions/shared-audio/index.ts");
const cleanupFunction = read("supabase/functions/cleanup-shared-audio/index.ts");

for (const bundled of ["audio/track-1.mp3", "audio/track-2.mp3", "audio/track-3.mp3"]) {
  assert.equal(fs.existsSync(file(bundled)), false, `${bundled} must not ship`);
}
assert.doesNotMatch(index, /Мураджан|Азан|Лучшие нашиды/u);
assert.doesNotMatch(app, /audio\/track-[123]\.mp3|getBuiltinBlob|const tracks\s*=/u);
assert.match(index, /id="customTrackButton"[\s\S]{0,180}Добавить своё аудио/u);
assert.match(index, /id="removeAudioButton"/u);
assert.match(index, /до 12 МБ/u);
assert.match(index, /media-src[^;]*https:\/\/xzzngrquomyiglktroqi\.supabase\.co/u);

assert.match(app, /const SHARED_AUDIO_MAX_BYTES\s*=\s*12 \* 1024 \* 1024/u);
assert.match(app, /SHARED_AUDIO_TOKEN_PATTERN\s*=\s*\/\^\[A-Za-z0-9_-\]\{43\}\$/u);
assert.match(app, /new URLSearchParams\(url\.hash\.replace\(\/\^#\//u);
assert.match(app, /\.uploadToSignedUrl\(reservation\.objectPath, reservation\.uploadToken/u);
assert.match(app, /sharedAudioRequest\("finalize", \{ shareToken: reservation\.shareToken \}, true\)/u);
assert.match(app, /sharedAudioRequest\("resolve", \{ shareToken: incomingSharedAudioToken \}\)/u);
assert.match(app, /if\(SHARED_AUDIO_TOKEN_PATTERN\.test\(audioToken\|\|""\)\)url\.hash=/u);
assert.match(app, /if \(requireUser && \(!cloudUser\?\.id \|\| !cloudSession\?\.access_token\)\)/u);
assert.match(app, /function buildAppShareUrl\([\s\S]{0,260}\.hash\s*=\s*""/u);
assert.match(worker, /"audio"/u);

assert.match(migration, /create table private\.glowletter_audio_shares/iu);
assert.match(migration, /token_hash text not null unique/iu);
assert.match(migration, /expires_at <= created_at \+ interval '12 hours'/iu);
assert.match(migration, /now\(\) \+ interval '11 hours 50 minutes'/iu);
assert.match(migration, /now\(\) \+ interval '2 hours 5 minutes'/iu);
assert.match(migration, /'glowletter-shared-audio'[\s\S]{0,220}false[\s\S]{0,220}12582912/iu);
assert.match(migration, /glowletter_validate_cleanup_secret/iu);
assert.match(migration, /X-GlowLetter-Cleanup/iu);
assert.match(migration, /'\*\/5 \* \* \* \*'/u);
assert.doesNotMatch(migration, /sb_secret_|service_role_key/iu);

for (const name of ["shared-audio", "cleanup-shared-audio"]) {
  assert.match(config, new RegExp(`\\[functions\\.${name}\\][\\s\\S]{0,80}verify_jwt = false`, "u"));
}
assert.match(sharedFunction, /admin\.auth\.getUser\(token\)/u);
assert.match(sharedFunction, /user\.is_anonymous === true/u);
assert.match(sharedFunction, /hasExpectedAudioSignature/u);
assert.match(sharedFunction, /createSignedUploadUrl\(objectPath, \{ upsert: false \}\)/u);
assert.match(sharedFunction, /Math\.min\(MAX_PLAYBACK_SECONDS, remainingSeconds\)/u);
assert.match(cleanupFunction, /x-glowletter-cleanup/u);
assert.match(cleanupFunction, /glowletter_validate_cleanup_secret/u);
assert.match(cleanupFunction, /storage\.from\(BUCKET\)\.remove/u);
for (const source of [sharedFunction, cleanupFunction]) {
  assert.doesNotMatch(source, /console\.(?:log|info|warn|error)/u);
}

for (const page of ["privacy.html", "terms.html", "delete-account.html"]) {
  assert.match(read(page), /12[^\p{L}\p{N}]{0,3}(?:час|hour|heure)/iu, `${page} must disclose the 12-hour limit`);
}

console.log(JSON.stringify({ ok: true, bundledAudio: 0, maxMiB: 12, maxHours: 12, privateBucket: true }));
