import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const require = createRequire(import.meta.url);
const app = read("app.js");
const styles = `${read("styles.css")}\n${read("experience.css")}`;
const qr = require(path.join(root, "qr-code.js"));

// A recipient link owns the complete name pair or neither value. A partial URL
// must never combine one printed name with a stale local/cloud name.
const launchNames = app.match(/const storedNamesAtLaunch\s*=\s*\{[\s\S]+?const initialNamesReady\s*=/)?.[0] || "";
assert.match(launchNames, /const urlNamesAtLaunch\s*=\s*\{[\s\S]*sender:\s*cleanName\(params\.get\(["']from["']\)\)[\s\S]*recipient:\s*cleanName\(params\.get\(["']to["']\)\)/);
assert.match(launchNames, /const namesCameFromUrl\s*=\s*params\.has\(["']from["']\)\s*&&\s*params\.has\(["']to["']\)/);
assert.match(launchNames, /Boolean\(urlNamesAtLaunch\.sender\s*&&\s*urlNamesAtLaunch\.recipient\)/);
assert.match(launchNames, /let fromName\s*=\s*namesCameFromUrl\s*\?\s*urlNamesAtLaunch\.sender\s*:\s*storedNamesAtLaunch\.sender/);
assert.match(launchNames, /let toName\s*=\s*namesCameFromUrl\s*\?\s*urlNamesAtLaunch\.recipient\s*:\s*storedNamesAtLaunch\.recipient/);
assert.match(app, /const initialLinkNames\s*=\s*namesCameFromUrl\s*\?\s*\{\s*\.\.\.urlNamesAtLaunch\s*\}\s*:\s*null/);

const selectPair = ({ from, to }, stored) => from && to ? { sender: from, recipient: to } : stored;
assert.deepEqual(
  selectPair({ from: "Магазин", to: "" }, { sender: "Сохранённый", recipient: "Получатель" }),
  { sender: "Сохранённый", recipient: "Получатель" },
  "a partial URL pair falls back atomically"
);
assert.deepEqual(
  selectPair({ from: "Maison Rose", to: "Élodie" }, { sender: "Old", recipient: "Names" }),
  { sender: "Maison Rose", recipient: "Élodie" },
  "a complete URL pair wins atomically"
);

// Settings save the current pair before opening the personalized QR builder.
const saveSettings = app.match(/function saveSettings\(\{\s*openQr\s*=\s*false\s*\}\s*=\s*\{\}\)\s*\{([\s\S]+?)\r?\n\s*\}\r?\n\r?\n\s*function bindEvents/)?.[1] || "";
assert.match(saveSettings, /openQr\s*\?\s*\(\s*!sender\s*\|\|\s*!recipient/);
assert.match(saveSettings, /setNames\(sender,\s*recipient,\s*\{\s*explicit:\s*true\s*\}\)/);
assert.match(saveSettings, /scheduleCloudSync\(\{\s*includeNames:\s*true,\s*immediate:\s*true\s*\}\)/);
assert.match(saveSettings, /if\s*\(openQr\)\s*requestAnimationFrame\(openQrBuilder\)/);
assert.ok(saveSettings.indexOf("setNames(sender, recipient") < saveSettings.indexOf("requestAnimationFrame(openQrBuilder)"));
assert.match(app, /#qrOpenButton[^\n]*addEventListener\(["']click["'],\s*\(\)\s*=>\s*saveSettings\(\{\s*openQr:\s*true\s*\}\)\)/);

const openQrBuilder = app.match(/function openQrBuilder\(\)\s*\{([\s\S]+?)\r?\n\s*\}\r?\n\r?\n\s*function createQrCardBlob/)?.[1] || "";
assert.match(openQrBuilder, /qrSenderName["']\)\.value\s*=\s*fromName/);
assert.match(openQrBuilder, /qrRecipientName["']\)\.value\s*=\s*toName/);

const renderQrCode = app.match(/function renderQrCode\([^)]*\)\s*\{([\s\S]+?)\r?\n\s*\}\r?\n\r?\n\s*function openQrBuilder/)?.[1] || "";
assert.match(renderQrCode, /const invalid\s*=\s*!sender\s*\|\|\s*!recipient/);
assert.match(renderQrCode, /currentQrUrl\s*=\s*buildPublicQrUrl\(sender,\s*recipient\)/);

const printedUrl = qr.buildUrl("https://france-isl.github.io/glowletter-qr/", {
  from: "Maison Rose",
  to: "Élodie",
  lang: "fr",
  quote: 1
});
const parsed = new URL(printedUrl);
assert.equal(parsed.searchParams.get("from"), "Maison Rose");
assert.equal(parsed.searchParams.get("to"), "Élodie");
assert.equal(parsed.searchParams.get("quote"), "1");

// Phones have their own tier instead of receiving the full desktop workload.
assert.match(app, /const MOBILE_DEVICE\s*=\s*Boolean\(navigator\.userAgentData\?\.mobile\)/);
assert.match(app, /Android\|iPhone\|iPad\|iPod/);
assert.match(app, /matchMedia\(["']\(pointer:\s*coarse\)["']\)\.matches/);
assert.match(app, /matchMedia\(["']\(max-width:\s*900px\)["']\)\.matches/);
assert.match(app, /const PERFORMANCE_MODE\s*=\s*LITE_DEVICE\s*\?\s*["']lite["']\s*:\s*\(MOBILE_DEVICE\s*\?\s*["']mobile["']\s*:\s*["']full["']\)/);
assert.match(app, /document\.documentElement\.dataset\.glPerf\s*=\s*PERFORMANCE_MODE/);
assert.match(styles, /html\[data-gl-perf=["']mobile["']\]/, "the mobile tier must have dedicated rendering rules");

console.log("Personal QR and mobile performance contracts passed.");
