import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// Своё аудио при отправке (2.4.17): строка «Добавить своё аудио» в окне перед
// отправкой, аудио едет с QR-письмом до 30 дней, слов «мелодия/песня/музыка»
// в интерфейсе нет ни на одном языке.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const app = read("app.js");
const moments = read("moments.js");
const experience = read("experience.js");
const styles = read("styles.css");
const privacy = read("privacy.html");
const migration = read("supabase/migrations/20261004130000_qr_letter_audio.sql");
const sharedFunction = read("supabase/functions/shared-audio/index.ts");
const resolver = read("supabase/functions/resolve-letter/index.ts");

const run = source => {
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context;
};
const extra = run(read("i18n-extra.js")).window.NUR_I18N_EXTRA;
const NEW_LANGUAGES = ["de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];

// База: привязка живёт в private, клиент её не меняет, срок до 30 дней.
assert.match(migration, /add constraint glowletter_audio_shares_expiry_ceiling\s+check \(expires_at <= created_at \+ interval '31 days'\)/);
assert.match(migration, /add column audio_share_id uuid\s+references private\.glowletter_audio_shares\(id\) on delete set null/);
assert.match(migration, /if current_user in \('anon', 'authenticated'\) and \(/);
assert.match(migration, /raise exception 'audio_share_readonly' using errcode = '42501'/);
assert.match(migration, /create trigger glowletter_qr_links_audio_guard\s+before insert or update on public\.glowletter_qr_links/);
assert.match(migration, /pending_uploads >= 3 or ready_shares >= 30/);
assert.match(migration, /now\(\) \+ interval '11 hours 50 minutes'/);
assert.match(migration, /create or replace function public\.glowletter_attach_qr_audio\(/);
assert.match(migration, /now\(\) \+ interval '30 days',\s+coalesce\(link_row\.expires_at, now\(\) \+ interval '30 days'\)/);
assert.match(migration, /create or replace function public\.glowletter_detach_qr_audio\(/);
assert.match(migration, /create or replace function public\.glowletter_qr_link_audio\(p_public_id uuid\)/);
assert.match(migration, /and audio_share\.status = 'ready'\s+and audio_share\.expires_at > now\(\)\s+limit 1;/);
for (const fn of ["glowletter_release_qr_audio_share(uuid, uuid)", "glowletter_attach_qr_audio(uuid, uuid, text)", "glowletter_detach_qr_audio(uuid, uuid)", "glowletter_qr_link_audio(uuid)"]) {
  const escaped = fn.replace(/[()]/g, "\\$&");
  assert.match(migration, new RegExp(`revoke all on function public\\.${escaped}\\s+from public, anon, authenticated;`));
  assert.match(migration, new RegExp(`grant execute on function public\\.${escaped}\\s+to service_role;`));
}
assert.doesNotMatch(migration, /grant execute on function public\.glowletter_(?:attach|detach)_qr_audio[^\n]*to (?:anon|authenticated)/);

// Сервер: привязка только с аккаунтом и хешем токена; письмо отдаёт подписанную ссылку.
assert.match(sharedFunction, /if \(action === "attach"\) return await attach\(request, body, admin\);/);
assert.match(sharedFunction, /if \(action === "detach"\) return await detach\(request, body, admin\);/);
assert.match(sharedFunction, /async function attach\([\s\S]{0,400}authenticatedUser\(request, admin\)[\s\S]{0,900}admin\.rpc\("glowletter_attach_qr_audio", \{\s+p_user_id: user\.id,\s+p_public_id: publicId,\s+p_token_hash: tokenHash,/);
assert.match(sharedFunction, /async function detach\([\s\S]{0,400}authenticatedUser\(request, admin\)[\s\S]{0,500}admin\.rpc\("glowletter_detach_qr_audio"/);
assert.match(sharedFunction, /if \(error\.code === "P0002"\) return json\(request, \{ error: "not_found" \}, 404\);/);
assert.match(resolver, /const QR_AUDIO_PLAYBACK_SECONDS = 20 \* 60;/);
assert.match(resolver, /admin\.rpc\("glowletter_qr_link_audio", \{\s+p_public_id: publicId,\s+\}\)/);
assert.match(resolver, /createSignedUrl\(objectPath, seconds\)/);
assert.match(resolver, /searchParams\.get\("audio"\) === "refresh"/);
assert.match(resolver, /if \(!audioRefresh\) \{\s+try \{\s+await admin\.rpc\("glowletter_record_qr_open"/);
assert.match(resolver, /state: "ready",\s+audio,/);
for (const source of [sharedFunction, resolver]) assert.doesNotMatch(source, /sb_secret_|service_role_key\s*[:=]\s*["'][^"']+/i);

// Окно перед отправкой: строка аудио, «убрать», «войти».
for (const id of ["publicationAudio", "publicationAudioButton", "publicationAudioIcon", "publicationAudioTitle", "publicationAudioNote", "publicationAudioRemove", "publicationAudioSignIn"]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist`);
}
assert.match(index, /id="publicationAudioTitle">Добавить своё аудио</);
assert.match(index, /aria-label="Атмосфера и звук"/);
assert.match(styles, /\.publication-audio \{/);
assert.match(app, /function requestPublishConsent\(options=\{\}\)\{[\s\S]{0,200}publicationContext=\{kind:options\.kind==="qr"\?"qr":"direct",audio:options\.audio===true\};renderPublicationAudio\(\);/);
assert.match(app, /function renderPublicationAudio\(\) \{[\s\S]{0,1200}t\(publicationContext\.kind === "qr" \? "publishAudioQr" : "publishAudioLink"\)/);
assert.match(app, /async function syncQrAudio\(\) \{[\s\S]{0,900}sharedAudioRequest\("attach", \{ shareToken: token, publicId \}, true\)/);
assert.match(app, /async function detachCurrentQrAudio\(\) \{[\s\S]{0,400}sharedAudioRequest\("detach", \{ publicId \}, true\)/);
assert.match(app, /async function qrConsent\(\)\{[\s\S]{0,120}await syncQrAudio\(\);return true;\}/);
assert.match(app, /requestPublishConsent\(\{kind:personal\?"qr":"direct",audio:personal\}\)/);
assert.match(app, /await requestPublishConsent\(\{kind:"direct",audio:true\}\)/);
assert.match(app, /requestPublishConsent: \(\) => requestPublishConsent\(\{ kind: "qr", audio: true \}\)/);
assert.match(app, /if\(payload\.consented===true\)qrConsentKey=qrConsentSignature\(\);/);
assert.match(app, /\$\("#publicationAudioButton"\)\.addEventListener\("click",\(\)=>\{audioPickFromPublication=true;\$\("#customTrackInput"\)\.click\(\);\}\)/);
assert.match(app, /\$\("#publicationAudioSignIn"\)\.addEventListener\("click",\(\)=>\{finishPublishConsent\(false\);requestSignIn\("publication"\);\}\)/);
assert.match(app, /async function selectCustomAudio\(file, \{ play = true \} = \{\}\)/);

// Получатель QR-письма: подписанная ссылка только с домена проекта, обновление без счёта открытий.
assert.match(app, /function normalizeQrAudio\(value\) \{[\s\S]{0,500}parsed\.origin !== new URL\(SUPABASE_URL\)\.origin\) return null;/);
assert.match(app, /resolve-letter\?public_id=\$\{encodeURIComponent\(incomingQrAudio\.publicId\)\}&audio=refresh/);
assert.match(app, /\} else if \(incomingQrAudio\?\.publicId\) \{\s+currentAudioUrl = await resolveIncomingQrAudio\(refreshRemote\);/);
assert.match(app, /const silent = quiet && !incomingSharedAudioToken && !incomingQrAudio;/);
assert.match(app, /const qrAudio=normalizeQrAudio\(payload\.audio\);[\s\S]{0,400}audioAttached:Boolean\(qrAudio\)/);
assert.match(app, /publicId: detail\.publicId,\s+audio: letter\.audio/);
assert.match(moments, /audio_share_id: validUuid\(row\.audio_share_id\), has_audio: Boolean\(validUuid\(row\.audio_share_id\) \|\| row\.has_audio === true\)/);
assert.match(moments, /const audioText = link\?\.has_audio && active \? tr\("letterWithAudio"\) : "";/);
assert.match(moments, /function setLinkAudio\(publicId, attached\)/);
assert.match(moments, /unlockAt: link\.unlock_at, consented: true, hasAudio: false/);
assert.match(moments, /audio: raw\.audio && typeof raw\.audio === "object" && typeof raw\.audio\.url === "string"/);
assert.match(privacy, /не дольше 30 дней/);
assert.match(privacy, /no more than 30 days/);
assert.match(privacy, /maximum de 30 jours/);

// Переводы: новые строки на 25 языках, названия треков больше не нужны.
for (const key of ["publishAudioNote", "publishAudioQr", "publishAudioLink", "publishAudioSignIn", "publishAudioSignInButton", "publishAudioAttached"]) {
  assert.equal((app.match(new RegExp(`,${key}:"`, "g")) || []).length, 3, `${key} must exist in ru/en/fr`);
  for (const code of NEW_LANGUAGES) assert.ok(extra[code].app[key]?.trim(), `${code}.${key} is missing`);
}
for (const code of NEW_LANGUAGES) assert.ok(extra[code].moments.letterWithAudio?.trim(), `${code}.letterWithAudio is missing`);
assert.doesNotMatch(app, /trackPrimary|trackLight|trackWarm/);
for (const code of NEW_LANGUAGES) assert.equal(extra[code].app.trackPrimary, undefined, `${code} still has trackPrimary`);

// Владелец: слов «мелодия», «песня», «музыка» в интерфейсе нет ни на одном языке.
const musicWords = /мелод|песн|музык|музи|melod|músic|musik|musiq|muzyk|muzik|μουσικ|μελωδ|音楽|音乐|音樂|旋律|メロディ|멜로디|음악|ดนตรี|ทำนอง|موسيق|لحن|âm nhạc|giai điệu/iu;
const valuesOf = object => Object.values(object || {}).flatMap(value => (value && typeof value === "object" ? valuesOf(value) : [String(value)]));
for (const code of NEW_LANGUAGES) {
  for (const value of valuesOf(extra[code])) assert.doesNotMatch(value, musicWords, `${code}: ${value}`);
}
const stripKeys = source => source.replace(/[A-Za-z0-9_]+\s*:\s*"/g, '"').replace(/"[A-Za-z0-9_]+"\s*:/g, "");
assert.doesNotMatch(stripKeys(index), musicWords);
assert.doesNotMatch(stripKeys(app), musicWords);
assert.doesNotMatch(stripKeys(moments), musicWords);
assert.doesNotMatch(stripKeys(experience), musicWords);

console.log(JSON.stringify({ ok: true, qrAudioDays: 30, linkAudioHours: 12, languages: NEW_LANGUAGES.length + 3 }));
