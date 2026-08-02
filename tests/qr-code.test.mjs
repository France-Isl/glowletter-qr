import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const qr = require(path.join(root, "qr-code.js"));
const publicUrl = qr.buildUrl("https://bezam.org/", {
  to: "Айша",
  quote: 1,
  lang: "ru",
  from: "Ислам"
});

assert.equal(qr.encoderVersion, "qrcode-generator@1.4.4");
for (const method of [
  "buildUrl",
  "createMatrix",
  "createSvg",
  "createSvgDataUrl",
  "encodeUtf8",
  "renderToCanvas",
  "toDataURL"
]) {
  assert.equal(typeof qr[method], "function", `GlowLetterQR must expose ${method}()`);
}

assert.equal(
  publicUrl,
  "https://bezam.org/?from=%D0%98%D1%81%D0%BB%D0%B0%D0%BC&lang=ru&quote=1&to=%D0%90%D0%B9%D1%88%D0%B0"
);
const parsedUrl = new URL(publicUrl);
assert.equal(parsedUrl.searchParams.get("from"), "Ислам");
assert.equal(parsedUrl.searchParams.get("to"), "Айша");
assert.equal(parsedUrl.searchParams.get("lang"), "ru");
assert.equal(parsedUrl.searchParams.get("quote"), "1");

const utf8Sample = "Айша 🌙";
assert.deepEqual(qr.encodeUtf8(utf8Sample), [...Buffer.from(utf8Sample, "utf8")]);
assert.deepEqual(qr.encodeUtf8("\ud800"), [0xef, 0xbf, 0xbd], "lone surrogates use UTF-8 replacement bytes");

const matrix = qr.createMatrix(publicUrl, { level: "M" });
const secondMatrix = qr.createMatrix(publicUrl, { level: "M" });
assert.equal(matrix.size, 41);
assert.deepEqual(matrix, secondMatrix, "the same personalized URL must always produce the same matrix");
assert.ok(matrix.modules.every(row => row.length === matrix.size));
assert.ok(matrix.modules.flat().every(module => typeof module === "boolean"));

const matrixBits = matrix.modules.map(row => row.map(module => module ? "1" : "0").join("")).join("");
assert.equal(
  crypto.createHash("sha256").update(matrixBits).digest("hex"),
  "b3f225b8dd1fe603cea0754e10ea5de798181b6a0ab3588922ea7a6726ae14a0",
  "the UTF-8 QR matrix is a stable release contract"
);
assert.equal([...matrixBits].filter(bit => bit === "1").length, 849);

const svg = qr.createSvg(publicUrl, {
  size: 640,
  margin: 4,
  foreground: "#211a2f",
  background: "#fffafc",
  ariaLabel: "Письмо для Айши & семьи"
});
assert.match(svg, /^<svg /);
assert.match(svg, /width="640" height="640"/);
assert.match(svg, /viewBox="0 0 49 49"/);
assert.match(svg, /aria-label="Письмо для Айши &amp; семьи"/);
assert.match(svg, /shape-rendering="crispEdges"/);
assert.match(svg, /<path fill="#211a2f" d="M/);
assert.ok(qr.createSvgDataUrl(publicUrl).startsWith("data:image/svg+xml;charset=utf-8,%3Csvg"));
assert.throws(() => qr.createSvg(publicUrl, { foreground: "url(javascript:alert(1))" }), /hexadecimal CSS color/);

const fillCalls = [];
const transformCalls = [];
const context2d = {
  fillStyle: "",
  imageSmoothingEnabled: true,
  setTransform(...args) {
    transformCalls.push(args);
  },
  fillRect(...args) {
    fillCalls.push({ color: this.fillStyle, args });
  }
};
const canvas = {
  width: 0,
  height: 0,
  style: {},
  getContext(kind) {
    assert.equal(kind, "2d");
    return context2d;
  },
  toDataURL(kind) {
    assert.equal(kind, "image/png");
    return "data:image/png;base64,TEST";
  }
};
const rendered = qr.renderToCanvas(canvas, publicUrl, {
  size: 570,
  pixelRatio: 2,
  foreground: "#211a2f",
  background: "#fffafc"
});
assert.equal(canvas.width, 1140);
assert.equal(canvas.height, 1140);
assert.equal(canvas.style.width, "570px");
assert.equal(canvas.style.height, "570px");
assert.deepEqual(transformCalls, [[2, 0, 0, 2, 0, 0]]);
assert.equal(context2d.imageSmoothingEnabled, false);
assert.deepEqual(fillCalls[0], { color: "#fffafc", args: [0, 0, 570, 570] });
assert.equal(fillCalls.length, 850, "canvas paints one background plus every dark module");
assert.equal(rendered.matrix.text, publicUrl);
assert.equal(qr.toDataURL(publicUrl, { canvas, size: 570, pixelRatio: 1 }), "data:image/png;base64,TEST");

const browserContext = {};
browserContext.self = browserContext;
vm.createContext(browserContext);
vm.runInContext(fs.readFileSync(path.join(root, "vendor", "qrcode-generator-1.4.4.min.js"), "utf8"), browserContext);
vm.runInContext(fs.readFileSync(path.join(root, "qr-code.js"), "utf8"), browserContext);
assert.equal(typeof browserContext.GlowLetterQR, "object", "static script loading must expose window.GlowLetterQR");
assert.equal(browserContext.GlowLetterQR.createMatrix(publicUrl).size, matrix.size);
assert.deepEqual(
  Array.from(browserContext.GlowLetterQR.encodeUtf8("Айша")),
  [...Buffer.from("Айша", "utf8")]
);

const license = fs.readFileSync(path.join(root, "vendor", "qrcode-generator.LICENSE"), "utf8");
const notice = fs.readFileSync(path.join(root, "vendor", "qrcode-generator.NOTICE.md"), "utf8");
assert.match(license, /MIT License/);
assert.match(license, /Kazuhiko Arase/);
assert.match(notice, /qrcode-generator.*1\.4\.4/s);

console.log("GlowLetterQR tests passed: deterministic UTF-8 matrix, SVG, canvas, and static browser API.");
