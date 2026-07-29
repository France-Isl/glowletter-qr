import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const app = read("app.js");
const androidMain = read("mobile/android/app/src/main/java/com/franceisl/nurpismo/MainActivity.java");
const androidBridge = read("mobile/android/app/src/main/java/com/franceisl/nurpismo/SpeechBridge.java");
const androidManifest = read("mobile/android/app/src/main/AndroidManifest.xml");
const ios = read("mobile/ios/NurPismo/WebViewContainer.swift");

assert.match(index, /id=["']speakButton["'][^>]*aria-pressed=["']false["']/u);

// Installed apps prefer their system speech engine; regular browsers retain
// a guarded Web Speech fallback and never depend on an undeclared global.
assert.match(app, /function nativeSpeechBridge\(\)[\s\S]*?window\.NurSpeech[\s\S]*?typeof bridge\.speak === ["']function["']/u);
assert.match(app, /function speakLetter\(\)[\s\S]*?nativeSpeechBridge\(\)[\s\S]*?bridge\.speak\(text, speechLocale\(\)\)[\s\S]*?startBrowserSpeech\(text\)/u);
assert.match(app, /const synthesis = window\.speechSynthesis/u);
assert.match(app, /const Utterance = window\.SpeechSynthesisUtterance/u);
assert.match(app, /letterSpeechUtterance\s*=\s*utterance/u);
assert.doesNotMatch(app, /new SpeechSynthesisUtterance\(/u);
assert.match(app, /addEventListener\(["']nur-speech-state["'],handleNativeSpeechState\)/u);
assert.match(app, /button\.setAttribute\(["']aria-pressed["'], String\(letterSpeechActive\)\)/u);
assert.match(app, /function moveLetter\([\s\S]*?canAccess\([\s\S]*?stopLetterSpeech\(\)/u);
assert.match(app, /visibilitychange[\s\S]*?document\.hidden\)\{stopLetterSpeech\(\)/u);

// Android exposes TextToSpeech only to the trusted bundled main document.
assert.match(androidBridge, /@JavascriptInterface[\s\S]*?void speak\(String text, String language\)/u);
assert.match(androidBridge, /@JavascriptInterface[\s\S]*?void stop\(\)/u);
assert.match(androidMain, /addJavascriptInterface\(new SpeechBridge\(this\),\s*["']NurSpeech["']\)/u);
assert.match(androidMain, /new TextToSpeech\(/u);
assert.match(androidManifest, /android\.intent\.action\.TTS_SERVICE/u);
assert.match(androidMain, /isTrustedSpeechRequest\(\)[\s\S]*?trustedMainDocumentReady[\s\S]*?isTrustedAppMainDocumentUrl/u);
assert.match(androidMain, /MAX_SPEECH_TEXT_LENGTH\s*=\s*Math\.min\(6000, TextToSpeech\.getMaxSpeechInputLength\(\)\)/u);
assert.match(androidMain, /UtteranceProgressListener/u);
assert.match(androidMain, /onStop\(String utteranceId, boolean interrupted\)/u);
assert.match(androidMain, /activeSpeechUtteranceId/u);
assert.match(androidMain, /dispatchSpeechState\(["']stopped["']\)[\s\S]*?webView\.onPause\(\)/u);
assert.match(androidMain, /removeJavascriptInterface\(["']NurSpeech["']\)/u);

// iOS mirrors the same trusted bridge through AVFoundation.
assert.match(ios, /import AVFoundation/u);
assert.match(ios, /name:\s*["']nurSpeech["']/u);
assert.match(ios, /static let speechBootstrap/u);
assert.match(ios, /AVSpeechSynthesizerDelegate/u);
assert.match(ios, /message\.frameInfo\.isMainFrame[\s\S]*?isTrustedMainDocumentURL/u);
assert.match(ios, /case ["']nurSpeech["'][\s\S]*?limit:\s*6_000/u);
assert.match(ios, /AVSpeechUtterance\(string: text\)/u);
assert.match(ios, /activeSpeechUtterance/u);
assert.match(ios, /removeScriptMessageHandler\(forName:\s*["']nurSpeech["']\)/u);

console.log(JSON.stringify({ ok: true, browserFallback: true, androidSystemVoice: true, iosSystemVoice: true }));
