# qrcode-generator

GlowLetter vendors the browser build of `qrcode-generator` version 1.4.4.

- Author: Kazuhiko Arase
- Source: https://github.com/kazuhikoarase/qrcode-generator
- npm package: https://www.npmjs.com/package/qrcode-generator/v/1.4.4
- License: MIT; see `qrcode-generator.LICENSE`

The vendored file is minified from the package's `qrcode.js` browser/CommonJS
distribution. GlowLetter enables its included UTF-8 byte encoder through the
wrapper in `../qr-code.js` so names and URLs containing Cyrillic text are
encoded correctly without a network service.
