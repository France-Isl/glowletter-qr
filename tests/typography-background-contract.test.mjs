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

assert.match(index, /family=Literata:ital,wght@0,500;0,600;1,600/u);
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
assert.match(app, /canvasLetterFont\(typography,55\)/u);
assert.match(app, /canvasLetterFont\(typography,49,\{signature:true,heading:true\}\)/u);

assert.doesNotMatch(experience, /\{ id: "kot",/u);
assert.match(experience, /requestedScene === "kot" \? "kotyta"/u);
assert.equal(fs.existsSync(path.join(root, "assets/video/kot.mp4")), false);
assert.equal(fs.existsSync(path.join(root, "assets/video/kot.jpg")), false);
assert.match(experience, /dataset\.sceneLabelKey/u);
assert.match(experience, /setAttribute\("aria-label", label\)/u);
assert.match(styles, /\.gl-scene-grid\s*\{[^}]*grid-template-columns:repeat\(2/u);
assert.match(experience, /\["glFrame", "glInk", "glType"\]\.some/u);

console.log(JSON.stringify({ ok: true, textStyles: 5, newStyles: ["poetic", "literary"], liveScenes: 3 }));
