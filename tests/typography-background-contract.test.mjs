import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const index = read("index.html");
const app = read("app.js");
const experience = read("experience.js");
const styles = read("experience.css");
const localFonts = read("fonts/local-fonts.css");

assert.match(index, /fonts\/local-fonts\.css\?v=31/u);
for (const family of ["Cormorant Garamond", "Literata", "Manrope"]) {
  assert.match(localFonts, new RegExp(`font-family: "${family}"`, "u"));
}
assert.doesNotMatch(index, /fonts\.googleapis\.com|fonts\.gstatic\.com/u);
assert.match(experience, /const TYPES = \["classic", "elegant", "clear", "poetic", "literary"\]/u);
for (const label of ["Поэтичный", "Литературный", "Poetic", "Literary", "Poétique", "Littéraire"]) {
  assert.match(experience, new RegExp(label, "u"));
}
for (const selector of ["#letterTitle", ".letter-text", ".letter-meta", ".signature", ".generated-card textarea"]) {
  assert.ok(styles.includes(selector), `${selector} must inherit the selected letter typography`);
}
assert.match(styles, /body\[data-gl-type="literary"\][^{]*\{[^}]*"Literata"/u);
assert.match(styles, /body\[data-gl-type="poetic"\]/u);
assert.match(app, /function canvasLetterTypography\(/u);
assert.match(app, /--gl-letter-font/u);
assert.match(app, /document\.fonts\.load\(canvasLetterFont\(typography,55\),bodyText\)/u);
assert.match(app, /document\.fonts\.load\(canvasLetterFont\(typography,49,\{signature:true,heading:true\}\),signatureText\)/u);
assert.match(app, /function fitCanvasParagraph\(/u);
assert.match(app, /fittedBody\.lines\.forEach/u);
assert.doesNotMatch(app, /currentY>1570/u);
assert.match(app, /Math\.floor\(maxHeight \/ Math\.max\(1, lines\.length\)\)/u);
assert.match(app, /function fitCanvasSingleLine\(/u);
assert.match(read("styles.css"), /\.letter #letterTitle\s*\{/u);

assert.doesNotMatch(experience, /\{ id: "kot",/u);
assert.match(experience, /requestedScene === "kot" \? "kotyta"/u);
assert.equal(fs.existsSync(path.join(root, "assets/video/kot.mp4")), false);
assert.equal(fs.existsSync(path.join(root, "assets/video/kot.jpg")), false);
assert.match(experience, /dataset\.sceneLabelKey/u);
assert.match(experience, /setAttribute\("aria-label", label\)/u);
assert.match(styles, /\.gl-scene-grid\s*\{[^}]*grid-template-columns:repeat\(2/u);
assert.match(experience, /\["glFrame", "glInk", "glType"\]\.some/u);

console.log(JSON.stringify({ ok: true, textStyles: 5, newStyles: ["poetic", "literary"], liveScenes: 3 }));
