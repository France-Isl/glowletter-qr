import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// Общий звонок (до четырёх человек) и видеозвонок: сетка WebRTC, сигналы с from/to, присутствие, тексты на 25 языках.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8").replaceAll("\r\n", "\n");
const call = read("call.js");
const css = read("ultra.css");

// Не больше четырёх; пятый видит «Звонок заполнен».
assert.match(call, /const MAX_PEOPLE = 4;/u);
assert.match(call, /count\(\) >= MAX_PEOPLE\) \{ toast\(tr\("full"\)\)/u);
assert.match(call, /call\.members\.size >= MAX_PEOPLE\) \{ end\(tr\("full"\)\)/u);
assert.match(call, /overCapacity\(\)\) \{ hangup\(tr\("full"\)\)/u);

// Сигналы несут from и to, чужие пропускаются; предложение делает меньший id.
assert.match(call, /payload: \{ \.\.\.payload, from: userId\(\), to \}/u);
assert.match(call, /payload\.to === userId\(\) \|\| payload\.to === "\*"/u);
assert.match(call, /if \(call\.channel !== channel \|\| !forMe\(payload\)\) return;/u);
assert.match(call, /const offersTo = id => userId\(\) < id;/u);
for (const event of ["offer", "answer", "ice"]) assert.match(call, new RegExp(`signal\\("${event}", \\{[^}]*\\}, (id|from)\\)`, "u"), `${event} goes to one person`);
// Кто в звонке — по присутствию в канале; соединение на каждого.
assert.match(call, /presence: \{ key: userId\(\) \}/u);
assert.match(call, /channel\.on\("presence", \{ event: "sync" \}/u);
assert.match(call, /call\.channel\.track\?\.\(\{ user_id: userId\(\), name: myName\(\), muted: call\.muted, at: call\.joinedAt, video: call\.video, camera: call\.camera \}\)/u);
assert.match(call, /peers: new Map\(\)/u);
// Ушёл один — остальные продолжают; один остался — звонок завершён.
assert.match(call, /if \(!othersIds\(\)\.length\) \{ end\(tr\("ended"\)\); return true; \}/u);
// Только STUN: платных ретрансляторов нет.
assert.doesNotMatch(call, /turn:/u);
// Кольцо «говорит»: AnalyserNode на каждого, через requestAnimationFrame, останавливается в конце звонка.
assert.match(call, /createAnalyser\(\)/u);
assert.match(call, /requestAnimationFrame\(meterTick\)/u);
assert.match(call, /cancelAnimationFrame\(meter\.raf\)/u);
// «Играть» открывает общий стол для всех: та же комната и список игроков.
assert.match(call, /window\.GlowLetterTable\?\.open\?\.\(\{ room: call\.room, friend: \{ user_id: friend\.user_id, name: friend\.name \}, players: participants\(\) \}\)/u);
// «Добавить» зовёт тем же сообщением [[call:комната]].
assert.match(call, /sendCallInvite\?\.\(id, call\.room\)/u);

// Видеозвонок: start(friend, { video: true }), камера по тем же соединениям, без камеры — звук и короткая заметка.
assert.match(call, /start: \(friend, options\) => start\(friend, options\)/u);
assert.match(call, /video: options\?\.video === true/u);
assert.match(call, /facingMode: facing, width: \{ ideal: 640 \}, height: \{ ideal: 480 \}/u);
assert.match(call, /if \(wantVideo && !call\.camera\) toast\(tr\("cameraFailed"\)\);/u);
assert.match(call, /addTransceiver\(call\.cameraTrack \|\| "video"/u);
assert.match(call, /sender\?\.replaceTrack\(track\)/u);
assert.match(call, /data-call="accept-audio"/u);
assert.match(call, /data-call="camera"/u);
assert.match(call, /data-call="flip"/u);
for (const icon of ["camera", "cameraOff", "flip"]) assert.match(call, new RegExp(`\n    ${icon}: '<svg class="glk-ic"`, "u"), `${icon} is a drawn icon`);
assert.match(css, /\.glk-self\.is-mirror video \{ transform: scaleX\(-1\); \}/u);
assert.match(css, /\.glk-stage\[data-count="3"\] \.glk-tiles \{ grid-template: 1fr 1fr \/ 1fr 1fr; \}/u);
for (const selector of [".glk-add", ".glk-people", ".glk-person.is-speaking", ".glk-badge", ".glk-sheet", ".glk-pick"]) assert.ok(css.includes(selector), selector);

// Тексты: каждый ключ звонка — на всех 25 языках, без запрещённых слов.
function moduleText(source) {
  const from = source.indexOf("const TEXT = {");
  const to = source.indexOf("\n  };", from);
  return vm.runInNewContext(`(${source.slice(from + "const TEXT = ".length, to + 4)})`);
}
const TEXT = moduleText(call);
const NEW_KEYS = ["add", "addTitle", "addNone", "inviteSent", "invited", "full", "joined", "left", "groupCall", "groupTitle", "groupRinging", "you", "close",
  "videoCall", "incomingVideo", "acceptVideo", "acceptAudio", "cameraOn", "cameraOff", "flip", "cameraFailed", "flipFailed"];
const window = {};
vm.runInNewContext(read("ultra-i18n.js"), { window });
const LANGUAGES = ["ru", "en", "fr", "de", "es", "it", "pl", "uk", "pt", "nl", "tr", "ro", "cs", "sv", "el", "da", "no", "fi", "ja", "ko", "zh", "th", "ar", "ind", "vi"];
const BANNED = /мелоди|песн|музык|обож|\bmusic|\bsong|adore|adoro|обожн|поцел|обним|\bkiss|\bhug/iu;
const placeholders = value => [...String(value).matchAll(/\{(\w+)\}/gu)].map(match => match[1]).sort().join(",");
for (const code of LANGUAGES) {
  const text = TEXT[code] || window.GLOWLETTER_ULTRA_I18N[code]?.call;
  assert.ok(text, `${code}.call`);
  for (const key of [...Object.keys(TEXT.en), ...NEW_KEYS]) {
    assert.equal(typeof text[key], "string", `${code}.call.${key}`);
    assert.ok(text[key].trim(), `${code}.call.${key} is empty`);
    assert.equal(placeholders(text[key]), placeholders(TEXT.en[key]), `${code}.call.${key} placeholders`);
    assert.doesNotMatch(text[key], BANNED, `${code}.call.${key} wording`);
  }
}
for (const key of NEW_KEYS) assert.ok(new RegExp(`tr\\("${key}"`, "u").test(call), `${key} is used`);
// «{name} в звонке» — без рода.
assert.equal(TEXT.ru.joined, "{name} в звонке");
assert.equal(TEXT.ru.left, "{name} уже не в звонке");

console.log(JSON.stringify({ ok: true, maxPeople: 4, languages: LANGUAGES.length, newKeys: NEW_KEYS.length }));
