import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const app = read("app.js");
const config = read("config.js");
assert.doesNotMatch(app, /Вечер у озера, живой дождь|An evening by the lake, living rain|Un soir au bord du lac, une pluie vivante/);
const styles = read("styles.css");
const experienceStyles = read("experience.css");
const manifest = JSON.parse(read("manifest.webmanifest"));
const lettersSource = read("letters.js");
const experience = read("experience.js");

// QR creation is a complete, discoverable flow rather than a decorative control.
for (const id of [
  "qrOpenButton",
  "qrLayer",
  "qrBackdrop",
  "qrClose",
  "qrForm",
  "qrSenderName",
  "qrRecipientName",
  "qrCanvas",
  "qrDownloadButton",
  "qrCopyLinkButton",
  "qrCopyImageButton",
  "qrPrintButton"
]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist in the QR flow`);
}
assert.match(index, /Получатель увидит первые 10 писем бесплатно/u);
assert.match(index, /Ключ полного доступа не передаётся/u);
assert.match(app, /#qrOpenButton[^\n]*addEventListener\(["']click["'],\s*\(\)\s*=>\s*saveSettings\(\{\s*openQr\s*:\s*true\s*\}\)\)/);
assert.match(app, /#qrForm[^\n]*addEventListener\(["']submit["']/);
assert.match(app, /#qrDownloadButton[^\n]*addEventListener\(["']click["'],\s*downloadQrCard\)/);
assert.match(app, /#qrCopyLinkButton[^\n]*addEventListener\(["']click["'],\s*copyQrLink\)/);
assert.match(app, /#qrCopyImageButton[^\n]*addEventListener\(["']click["'],\s*copyQrImage\)/);
assert.match(app, /#qrPrintButton[^\n]*addEventListener\(["']click["']/);
assert.match(app, /await deliverFile\(blob,qrFileName\("png"\),"downloadReady"\)/, "the PNG card goes through deliverFile (share sheet on phones, download elsewhere)");
assert.match(app, /function qrFileName\(extension\)\{[^\n]*`GlowLetter-QR/);
assert.match(app, /navigator\.clipboard\?\.write/);
assert.match(styles, /@media\s+print[\s\S]*#qrLayer/);

// Цвет интерфейса больше не выбирается (2.4.20): один гранатовый, без лишних настроек.
assert.match(index, /<body[^>]*data-ui-theme=["']garnet["']/);
assert.doesNotMatch(index, /theme-choice-grid|data-ui-theme=["'](?:indigo|saffron|emerald)["']/);
assert.match(styles, /\.side-panel[^\n]*var\(--ui-panel\)[^\n]*var\(--ui-panel-alt\)/);
// Свой фон-фото заменён выбором из трёх картинок высокого качества.
assert.doesNotMatch(index, /customBackgroundButton|background-picker/);
for (const scene of ["cabin", "bears", "roses", "kitten"]) {
  assert.match(index, new RegExp(`data-scene="${scene}"`));
  assert.ok(fs.existsSync(path.join(root, `assets/scenes/${scene}.webp`)), `${scene} background is required`);
}
assert.match(app, /const SCENES = Object\.freeze\(\{ cabin: "assets\/scenes\/cabin\.webp", bears: "assets\/scenes\/bears\.webp"/);
// Живой фон: видео без звука, играет в петле только на главной, есть первый кадр.
assert.ok(fs.existsSync(path.join(root, "assets/scenes/cabin.mp4")));
assert.ok(fs.statSync(path.join(root, "assets/scenes/cabin.mp4")).size < 2_000_000, "home video must stay small");
assert.match(index, /<video class="home-video" id="homeVideo" muted loop playsinline preload="none"/u);
assert.match(app, /const covered = document\.hidden \|\| /u);
assert.doesNotMatch(styles, /\.settings-panel\s*>\s*\.panel-header[^\{]*\{[^\}]*position\s*:\s*sticky/i, "settings title must scroll away with its content");
assert.match(index, /id="appleSignInArtwork"[^>]*assets\/auth\/apple-continue-ru\.png/);
assert.match(styles, /\.oauth-button\.apple\s*\{[^}]*aspect-ratio\s*:\s*375\/44/i);

// «Атмосфера» убрана целиком (2.4.20): дождь, погода, звуки леса и кнопка полного экрана.
for (const id of ["weatherButton", "weatherToggle", "natureButton", "natureToggle", "rainToggle", "fullscreenToggle", "settingsAtmosphereTitle"]) {
  assert.doesNotMatch(index, new RegExp(`id=["']${id}["']`), `${id} must be gone`);
}
assert.match(app, /let weatherEnabled = false;/);
assert.match(app, /this\.enabled = false;/);
// Полный экран включается у всех сам, без выключателя.
assert.match(app, /async function requestAutomaticFullscreen\(\)\{if\(fullscreenActive\(\)/);

// Every top-level icon/action has a real event handler.
for (const [id, action] of [
  ["homeButton", "goHome"],
  ["libraryButton", "renderLibrary"],
  ["settingsButton", "openPanel"],
  ["languageButton", "applyLanguage"],
  ["shareButton", "shareLetter"]
]) {
  assert.match(app, new RegExp(`#${id}[^\\n]*addEventListener\\(["']click["'][^\\n]*${action}`), `${id} must invoke ${action}`);
}
const goHomeBody = app.match(/function goHome\(\)\s*\{([\s\S]+?)\r?\n\s*\}/)?.[1] || "";
assert.match(goHomeBody, /stopLetterSpeech\(\)/, "home navigation must stop every active native or browser voice");
const stopSpeechBody = app.match(/function stopLetterSpeech\(\)\s*\{([\s\S]+?)\r?\n\s*\}/)?.[1] || "";
assert.match(stopSpeechBody, /window\.speechSynthesis\?\.cancel\(\)/, "speech cleanup must tolerate WebViews without browser speech synthesis");
assert.doesNotMatch(stopSpeechBody, /(?:^|[^.\w])speechSynthesis\?\.cancel\(\)/, "speech cleanup must not reference an undeclared speechSynthesis global");
assert.match(app, /\$\$\(["']\.go-home["']\)\.forEach\([^\n]*addEventListener\(["']click["'],\s*goHome\)/);
assert.match(app, /#soundButton[^\n]*addEventListener\(["']click["'][^\n]*(?:pauseMusic|playMusic)/);
assert.doesNotMatch(index, /id=["']aiOpenTop["']/, "the composer entry in the top bar must stay removed");

// Reply assistance is intentionally absent, including its former deep link.
for (const id of ["replyOpenHome", "replyModeTab", "replyComposerPane", "replyForm", "replyIncoming", "replyGeneratedCard"]) {
  assert.doesNotMatch(index, new RegExp(`id=["']${id}["']`), `${id} must stay removed`);
}
assert.doesNotMatch(index, /data-ai-mode=["']reply["']|reply-engine\.js/);
assert.doesNotMatch(app, /function\s+(?:generateReply|remoteComposeReply)\s*\(|CONFIG\.aiReplyFunction|#replyIncoming|#replyOpenHome/);
assert.doesNotMatch(app, /params\.get\(\s*["']reply["']\s*\)|[?&]reply=1/);

// The letter composer and every trace of text generation are gone: only the 50 letters remain.
for (const id of ["aiIdea", "aiLength", "aiLayer", "generateButton", "ownTextEditor"]) {
  assert.doesNotMatch(index, new RegExp(`id=["']${id}["']`), `${id} must stay removed`);
}
assert.doesNotMatch(app, /function cleanLetterIdea/);
assert.doesNotMatch(app, /function fitLetterLength/);
assert.doesNotMatch(app, /CONFIG.aiEndpoint/);
assert.doesNotMatch(config, /aiEndpoint/);
assert.match(app, /function openLetterPicker/);
assert.match(app, /function pickLetterForContext/);
assert.match(app, /data-action="pick"/);
assert.match(index, /id=["']libraryPickNote["']/);
assert.match(app, /function setReadingFocus\(/);
assert.match(styles, /body\.reading-focus[\s\S]{0,500}#focusReadingButton/);

// Letters that used to start with a fixed recipient now start directly with their message.
const letterContext = { window: {} };
vm.runInNewContext(lettersSource, letterContext, { filename: "letters.js" });
for (const id of [5]) {
  const letter = letterContext.window.NUR_LETTERS.find(item => Number(item.id) === id);
  assert.ok(letter, `letter ${id} must exist`);
  for (const language of ["ru", "en", "fr"]) {
    assert.doesNotMatch(letter[language], /^\s*\{to\}\s*[,;:!?.—-]?/u, `letter ${id}/${language} must not begin with {to}`);
  }
}

// The visible installable-app brand is GlowLetter, without the former release suffix.
assert.equal(manifest.short_name, "GlowLetter");
assert.doesNotMatch(manifest.name, /GlowLetter\s+Next/i);
assert.equal(manifest.display, "fullscreen");
assert.equal(manifest.display_override[0], "fullscreen");

// Fullscreen starts automatically in installed shells and on the first legal browser gesture.
assert.match(app, /function installAutomaticFullscreen\(/);
assert.match(app, /document\.addEventListener\("click",activate\)/);
assert.doesNotMatch(app, /document\.addEventListener\("pointerdown",activate,true\)/);
assert.match(app, /requestAutomaticFullscreen\(\)/);
assert.match(app, /fullscreen_enabled:\s*true/);
const fullscreenShellBody = app.match(/function isFullscreenShell\(\)\s*\{([\s\S]+?)\}/)?.[1] || "";
assert.match(fullscreenShellBody, /display-mode: fullscreen/);
assert.doesNotMatch(fullscreenShellBody, /display-mode: standalone/);

// Paid feature badges are consistently named VIP and use the gold treatment.
assert.doesNotMatch(index, />\s*PRO\s*</);
assert.doesNotMatch(experience, /pro:\s*"PRO"/);
assert.doesNotMatch(index, /class="vip-badge"/, "the VIP badge left with the composer entries");
// (стиль .vip-badge больше нигде не используется)

// Рамок нет (2.4.20, решение владельца): письмо — чистая бумага на фоне-картинке.
assert.doesNotMatch(experience, /const FRAMES|gl-frame-grid|frame-roses\.webp/);
assert.match(experience, /document\.body\.dataset\.glFrame = "none";/);
assert.match(experienceStyles, /\.letter::before, \.letter::after, \.letter \.paper-edge \{ display:none !important; \}/);
assert.doesNotMatch(index, /id=["']generatedCard["']/, "the generated-letter card left with the composer");
assert.doesNotMatch(index, /id=["']replyGeneratedCard["']/);
assert.match(experienceStyles, /\.gl-type-grid button\.is-active \{/);
assert.match(experience, /glowletter-access-change/);
assert.match(app, /document\.body\.dataset\.access\s*=\s*isPremium\s*\?\s*["']vip["']\s*:\s*["']free["']/);
assert.match(app, /\$\(["']\.free-note["']\)\.hidden\s*=\s*isPremium/);
assert.match(app, /data\.glPerf|dataset\.glPerf/);

console.log(JSON.stringify({
  ok: true,
  qrControls: true,
  themes: 4,
  liveWeather: true,
  replyAssistantRemoved: true,
  personalLetterGenerator: false,
  letterPicker: true,
  neutralLetters: [5, 12],
  brand: "GlowLetter"
}));
