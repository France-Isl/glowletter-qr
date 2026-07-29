import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const app = read("app.js");
const styles = read("styles.css");

const shareButton = index.match(/<button\b(?=[^>]*\bid=["']shareButton["'])[^>]*>[\s\S]*?<\/button>/u)?.[0] || "";

// Sharing is a named action, not an unexplained arrow. The icon remains decorative
// so assistive technology announces the localized button name only once.
assert.match(shareButton, /\btype=["']button["']/u);
assert.match(shareButton, /\baria-label=["']Поделиться письмом["']/u);
assert.match(shareButton, /\bclass=["'][^"']*\bshare-letter-action\b/u);
assert.match(shareButton, /class=["'][^"']*\bshare-letter-icon\b[^"']*["'][^>]*aria-hidden=["']true["']/u);
assert.match(shareButton, /id=["']shareButtonLabel["'][^>]*>\s*Поделиться\s*</u);
assert.doesNotMatch(shareButton, />\s*↗\s*</u);

for (const label of ["Поделиться письмом", "Share letter", "Partager la lettre"]) {
  assert.match(app, new RegExp(label), `missing localized share label: ${label}`);
}
assert.match(app, /setText\(["']#shareButtonLabel["'],\s*t\(["']shareAria["']\)\)/u);
assert.match(app, /#shareButton[\s\S]{0,180}setAttribute\(["']aria-label["'],\s*t\(["']shareAria["']\)\)/u);

// The label stays visible on narrow phones: the control becomes a full-width
// second row instead of collapsing back to an icon-only circle.
assert.match(styles, /\.share-letter-action\s*\{[^}]*display\s*:\s*inline-flex[^}]*min-height\s*:\s*48px[^}]*white-space\s*:\s*nowrap/iu);
assert.match(styles, /\.share-letter-icon\s*\{[^}]*position\s*:\s*relative[^}]*width\s*:\s*18px[^}]*height\s*:\s*18px/iu);
for (const className of ["share-node-start", "share-node-top", "share-node-bottom", "share-line-top", "share-line-bottom"]) {
  assert.match(shareButton, new RegExp(`class=["'][^"']*\\b${className}\\b`, "u"), `${className} must build the CSS share icon`);
}
assert.match(styles, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.letter-actions\s*\{[^}]*grid-template-columns\s*:\s*48px\s+minmax\(0,1fr\)[^}]*\}[\s\S]*?\.letter-actions\s+\.share-letter-action\s*\{[^}]*grid-column\s*:\s*1\s*\/\s*-1[^}]*width\s*:\s*100%/iu);
