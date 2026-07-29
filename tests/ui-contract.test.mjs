import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const app = read("app.js");
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
assert.match(app, /#qrOpenButton[^\n]*addEventListener\(["']click["'],\s*openQrBuilder\)/);
assert.match(app, /#qrForm[^\n]*addEventListener\(["']submit["']/);
assert.match(app, /#qrDownloadButton[^\n]*addEventListener\(["']click["'],\s*downloadQrCard\)/);
assert.match(app, /#qrCopyLinkButton[^\n]*addEventListener\(["']click["'],\s*copyQrLink\)/);
assert.match(app, /#qrCopyImageButton[^\n]*addEventListener\(["']click["'],\s*copyQrImage\)/);
assert.match(app, /#qrPrintButton[^\n]*addEventListener\(["']click["']/);
assert.match(app, /link\.download\s*=\s*`GlowLetter-QR/);
assert.match(app, /navigator\.clipboard\?\.write/);
assert.match(styles, /@media\s+print[\s\S]*#qrLayer/);

// Settings offer four restrained palettes, persist the choice, and restyle panels via variables.
assert.match(index, /<body[^>]*data-ui-theme=["']moon["']/);
for (const theme of ["moon", "rose", "forest", "sand"]) {
  assert.match(index, new RegExp(`data-ui-theme=["']${theme}["']`), `${theme} theme control is required`);
}
for (const theme of ["rose", "forest", "sand"]) {
  assert.match(styles, new RegExp(`body\\[data-ui-theme=["']${theme}["']\\]`), `${theme} theme variables are required`);
}
assert.match(styles, /\.side-panel[^\n]*var\(--ui-panel\)[^\n]*var\(--ui-panel-alt\)/);
assert.match(app, /const UI_THEMES\s*=\s*new Set\(\["moon",\s*"rose",\s*"forest",\s*"sand"\]\)/);
assert.match(app, /document\.body\.dataset\.uiTheme\s*=\s*uiTheme/);
assert.match(app, /localStorage\.setItem\(["']nurUiTheme["'],\s*uiTheme\)/);
assert.match(app, /\$\$\(["']\.theme-choice-grid \[data-ui-theme\]["']\)[^\n]*addEventListener\(["']click["']/);
assert.doesNotMatch(styles, /\.settings-panel\s*>\s*\.panel-header[^\{]*\{[^\}]*position\s*:\s*sticky/i, "settings title must scroll away with its content");
assert.match(index, /id="appleSignInArtwork"[^>]*assets\/auth\/apple-continue-ru\.png/);
assert.match(styles, /\.oauth-button\.apple\s*\{[^}]*aspect-ratio\s*:\s*375\/44/i);

// The weather chip must render live conditions and temperature, not only a static sun or moon.
for (const id of ["weatherButton", "weatherIcon", "weatherText", "weatherToggle", "weatherState"]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} is required for live weather`);
}
assert.match(app, /api\.open-meteo\.com\/v1\/forecast/);
assert.match(app, /current=temperature_2m,weather_code,is_day/);
assert.match(app, /const temperature\s*=\s*`\$\{Math\.round\(Number\(weatherSnapshot\.temperature\)\)\}°`/);
assert.match(app, /text\.textContent\s*=\s*temperature/);
assert.match(app, /state\.textContent\s*=\s*temperature/);
assert.match(app, /button\?\.classList\.add\(["']has-weather["']\)/);
assert.match(styles, /\.weather-chip\.has-weather/);
assert.match(app, /#weatherButton[^\n]*addEventListener\(["']click["'],\s*\(\)\s*=>\s*refreshWeather\(\)\)/);

// Every top-level icon/action has a real event handler.
for (const [id, action] of [
  ["homeButton", "goHome"],
  ["natureButton", "toggleNature"],
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
assert.match(app, /#aiOpenTop[^\n]*addEventListener\(["']click["'][^\n]*requestPremiumFeature/);
assert.doesNotMatch(styles, /\.ai-panel\s*>\s*\.panel-header[^\{]*\{[^\}]*position\s*:\s*sticky/i, "smart editor title must scroll away with its content");

// Smart reply has one source-message box. A new message invalidates every old draft/request.
assert.match(index, /id=["']replyIncoming["']/);
assert.doesNotMatch(index, /id=["']replyGoal["']/);
assert.doesNotMatch(app, /\$\(["']#replyGoal["']\)/);
assert.match(app, /const goal\s*=\s*""/);
assert.match(app, /function invalidateReplyDraft\(\)\s*\{[\s\S]*?replyRequestVersion\s*\+=\s*1/);
assert.match(app, /#replyIncoming[^\n]*addEventListener\(["']input["'],\s*\(\)\s*=>\s*\{\s*invalidateReplyDraft\(\)/);
assert.match(app, /const requestVersion\s*=\s*\+\+replyRequestVersion/);
assert.match(app, /requestVersion\s*!==\s*replyRequestVersion\s*\|\|\s*incoming\s*!==\s*String\(\$\(["']#replyIncoming["']\)\.value/);
assert.match(app, /function invalidateReplyDraft\(\)[\s\S]*?clearTimeout\(replyRevealTimer\)/);
assert.match(app, /replyRevealTimer\s*=\s*setTimeout\(\(\)\s*=>\s*\{[\s\S]*?requestVersion\s*!==\s*replyRequestVersion/);
assert.match(app, /function replyFitsSelectedLength\(/);
assert.match(app, /function resolveReplyLength\(/);
assert.match(app, /minWords:\s*4[^\n]*maxWords:\s*22[^\n]*maxCharacters:\s*190[^\n]*maxSentences:\s*3/);
assert.match(app, /!replyFitsSelectedLength\(text,\s*incoming,\s*resolvedLength\)/);
assert.match(app, /length:\s*resolvedLength/);

// Personal letters use the current idea and selected length, and stale drafts are invalidated.
for (const id of ["aiIdea", "aiLength", "focusReadingButton"]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist`);
}
assert.match(app, /function cleanLetterIdea\(/);
assert.match(app, /function fitLetterLength\(/);
assert.match(app, /JSON\.stringify\(\{ mode: "letter"[\s\S]{0,220}idea, length: resolvedLength/);
assert.match(app, /#aiIdea[^\n]*addEventListener\(["']input["'],\s*invalidateLetterDraft\)/);
assert.match(app, /#aiLength[^\n]*addEventListener\(["']change["'],\s*invalidateLetterDraft\)/);
assert.match(app, /function setReadingFocus\(/);
assert.match(styles, /body\.reading-focus[\s\S]{0,500}#focusReadingButton/);

// Letters that used to start with a fixed recipient now start directly with their message.
const letterContext = { window: {} };
vm.runInNewContext(lettersSource, letterContext, { filename: "letters.js" });
for (const id of [5, 12]) {
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
assert.match(index, /class="vip-badge">VIP</);
assert.match(styles, /\.vip-badge[^\{]*\{[^\}]*linear-gradient\([^\}]*#fff3b5[^\}]*#dca93a/i);

// All four VIP frame choices visibly select with a checkmark and decorate AI results too.
assert.match(experience, /const FRAMES\s*=\s*\["none",\s*"hearts",\s*"moon",\s*"forest",\s*"pearl"\]/);
for (const frame of ["hearts", "moon", "forest", "pearl"]) {
  assert.match(experienceStyles, new RegExp(`body\\.gl-premium-active\\[data-gl-frame=["']${frame}["']\\]`), `${frame} must define VIP frame tokens`);
  assert.match(experienceStyles, new RegExp(`body\\[data-gl-frame=["']${frame}["']\\] \\.gl-frame-layer`), `${frame} must decorate the opened letter`);
}
for (const id of ["generatedCard", "replyGeneratedCard"]) {
  assert.match(index, new RegExp(`class=["']generated-card["'][^>]*id=["']${id}["']`), `${id} must receive the shared VIP result-card frame`);
}
assert.match(experienceStyles, /body\.gl-premium-active:not\(\[data-gl-frame="none"\]\) \.ai-panel/);
assert.match(experienceStyles, /body\.gl-premium-active:not\(\[data-gl-frame="none"\]\) \.generated-card/);
assert.match(experienceStyles, /\.generated-card::before[^\{]*\{[^\}]*border:\s*1px solid var\(--gl-vip-stroke\)/);
assert.match(experienceStyles, /\.generated-card::after[^\{]*\{[^\}]*content:\s*var\(--gl-vip-mark\)/);
assert.match(experience, /mark\.textContent\s*=\s*active\s*\?\s*["']✓["']/u);
assert.match(experienceStyles, /\.gl-frame-grid button\.is-active>b[^\{]*\{[^\}]*color:\s*#fff[^\}]*background:\s*#a75c79[^\}]*opacity:\s*1/);
assert.match(experience, /glowletter-access-change/);
assert.match(app, /document\.body\.dataset\.access\s*=\s*isPremium\s*\?\s*["']vip["']\s*:\s*["']free["']/);
assert.match(app, /\$\(["']\.free-note["']\)\.hidden\s*=\s*isPremium/);
assert.match(app, /data\.glPerf|dataset\.glPerf/);

console.log(JSON.stringify({
  ok: true,
  qrControls: true,
  themes: 4,
  liveWeather: true,
  currentMessageReply: true,
  neutralLetters: [5, 12],
  brand: "GlowLetter"
}));
