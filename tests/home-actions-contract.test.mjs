import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const styles = read("styles.css");

// The home screen keeps only the personal-letter entry point.
assert.match(index, /<button\b(?=[^>]*\bid=["']aiOpenHome["'])[^>]*\btype=["']button["'][^>]*>/u);
assert.doesNotMatch(index, /id=["']replyOpenHome["']/u);
assert.match(styles, /\.home-smart-actions\s*\{[^}]*display\s*:\s*grid[^}]*grid-template-columns\s*:\s*1fr[^}]*width\s*:\s*100%/iu);
assert.doesNotMatch(styles, /\.home-smart-actions\s*\{[^}]*grid-template-columns\s*:\s*repeat\(2/iu);
assert.match(styles, /\.home-smart-actions\s+\.smart-link\s*\{[^}]*width\s*:\s*100%[^}]*min-width\s*:\s*0[^}]*text-align\s*:\s*center/iu);

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
