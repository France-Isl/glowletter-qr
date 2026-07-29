import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const styles = read("styles.css");

// The two smart entry points remain separate, keyboard-operable buttons.
for (const id of ["aiOpenHome", "replyOpenHome"]) {
  assert.match(index, new RegExp(`<button\\b(?=[^>]*\\bid=["']${id}["'])[^>]*\\btype=["']button["'][^>]*>`, "u"));
}
assert.match(styles, /\.home-smart-actions\s*\{[^}]*display\s*:\s*grid[^}]*grid-template-columns\s*:\s*repeat\(2,minmax\(0,1fr\)\)[^}]*width\s*:\s*100%/iu);
assert.match(styles, /\.home-smart-actions\s+\.smart-link\s*\{[^}]*width\s*:\s*100%[^}]*min-width\s*:\s*0[^}]*text-align\s*:\s*center/iu);
assert.match(styles, /@media\s*\(max-width:\s*330px\)[\s\S]*?\.home-smart-actions\s*\{[^}]*grid-template-columns\s*:\s*1fr/iu);

// The opening action has a decorative multi-layer heart while its visible text
// remains the accessible button name.
const openButton = index.match(/<button\b(?=[^>]*\bid=["']openStoryButton["'])[^>]*>[\s\S]*?<\/button>/u)?.[0] || "";
assert.match(openButton, /\btype=["']button["']/u);
assert.match(openButton, /class=["']seal-mark["'][^>]*aria-hidden=["']true["']/u);
for (const className of ["seal-heart", "seal-heart-core", "seal-heart-shine", "seal-heart-spark-one", "seal-heart-spark-two"]) {
  assert.match(openButton, new RegExp(`\\b${className}\\b`, "u"));
}
assert.match(openButton, /<span>Открыть письмо<\/span>/u);
assert.doesNotMatch(openButton, /class=["']seal-mark["'][^>]*>\s*♡\s*</u);

for (const animation of ["seal-heart-beat", "seal-heart-shine", "seal-heart-spark"]) {
  assert.match(styles, new RegExp(`@keyframes\\s+${animation}\\b`, "u"));
}
assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.seal-heart-core[^}]*animation\s*:\s*none\s*!important/iu);
assert.match(styles, /html\[data-gl-perf=["']lite["']\]\s+\.seal-heart-core[^}]*animation\s*:\s*none\s*!important/iu);
