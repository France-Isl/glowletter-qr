/*
 * GlowLetterQR
 * Small browser-facing wrapper around qrcode-generator 1.4.4.
 * The encoder is vendored under the MIT license in vendor/.
 */
(function (root, factory) {
  "use strict";

  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./vendor/qrcode-generator-1.4.4.min.js"));
  } else {
    root.GlowLetterQR = factory(root.qrcode);
  }
}(typeof self !== "undefined" ? self : this, function (qrcodeFactory) {
  "use strict";

  var DEFAULT_LEVEL = "M";
  var DEFAULT_MARGIN = 4;
  var DEFAULT_SCALE = 8;
  var DEFAULT_SIZE = 512;
  var DEFAULT_FOREGROUND = "#211a2f";
  var DEFAULT_BACKGROUND = "#fffafc";
  var VALID_LEVELS = { L: true, M: true, Q: true, H: true };

  function assertEncoder() {
    if (typeof qrcodeFactory !== "function") {
      throw new Error("GlowLetterQR requires vendor/qrcode-generator-1.4.4.min.js to be loaded first.");
    }
  }

  function appendCodePoint(bytes, codePoint) {
    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >>> 6));
      bytes.push(0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      bytes.push(0xe0 | (codePoint >>> 12));
      bytes.push(0x80 | ((codePoint >>> 6) & 0x3f));
      bytes.push(0x80 | (codePoint & 0x3f));
    } else {
      bytes.push(0xf0 | (codePoint >>> 18));
      bytes.push(0x80 | ((codePoint >>> 12) & 0x3f));
      bytes.push(0x80 | ((codePoint >>> 6) & 0x3f));
      bytes.push(0x80 | (codePoint & 0x3f));
    }
  }

  function encodeUtf8(value) {
    var text = String(value);
    var bytes = [];
    var index;

    for (index = 0; index < text.length; index += 1) {
      var first = text.charCodeAt(index);
      var codePoint = first;

      if (first >= 0xd800 && first <= 0xdbff) {
        if (index + 1 < text.length) {
          var second = text.charCodeAt(index + 1);
          if (second >= 0xdc00 && second <= 0xdfff) {
            codePoint = 0x10000 + ((first - 0xd800) << 10) + (second - 0xdc00);
            index += 1;
          } else {
            codePoint = 0xfffd;
          }
        } else {
          codePoint = 0xfffd;
        }
      } else if (first >= 0xdc00 && first <= 0xdfff) {
        codePoint = 0xfffd;
      }

      appendCodePoint(bytes, codePoint);
    }

    return bytes;
  }

  function normalizeText(value) {
    if (value === null || typeof value === "undefined") {
      throw new TypeError("QR content is required.");
    }

    var text = String(value);
    if (!text.length) {
      throw new TypeError("QR content cannot be empty.");
    }
    return text;
  }

  function normalizeInteger(value, fallback, minimum, maximum, label) {
    if (value === null || typeof value === "undefined" || value === "") {
      return fallback;
    }

    var number = Number(value);
    if (!isFinite(number) || Math.floor(number) !== number || number < minimum || number > maximum) {
      throw new RangeError(label + " must be an integer from " + minimum + " to " + maximum + ".");
    }
    return number;
  }

  function normalizeLevel(value) {
    var level = String(value || DEFAULT_LEVEL).toUpperCase();
    if (!VALID_LEVELS[level]) {
      throw new RangeError("QR error-correction level must be L, M, Q, or H.");
    }
    return level;
  }

  function normalizeColor(value, fallback, label) {
    if (value === null || typeof value === "undefined" || value === "") {
      return fallback;
    }

    var color = String(value).trim();
    if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
      throw new TypeError(label + " must be a hexadecimal CSS color.");
    }
    return color;
  }

  function normalizeOptions(options) {
    options = options || {};
    return {
      level: normalizeLevel(options.level),
      margin: normalizeInteger(options.margin, DEFAULT_MARGIN, 0, 32, "QR margin"),
      scale: normalizeInteger(options.scale, DEFAULT_SCALE, 1, 64, "QR scale"),
      size: normalizeInteger(options.size, DEFAULT_SIZE, 96, 4096, "QR size"),
      foreground: normalizeColor(options.foreground, DEFAULT_FOREGROUND, "QR foreground"),
      background: normalizeColor(options.background, DEFAULT_BACKGROUND, "QR background"),
      ariaLabel: String(options.ariaLabel || "QR code")
    };
  }

  function makeQr(text, level) {
    assertEncoder();
    qrcodeFactory.stringToBytes = encodeUtf8;
    var qr = qrcodeFactory(0, level);
    qr.addData(text, "Byte");
    qr.make();
    return qr;
  }

  function createMatrix(content, options) {
    var text = normalizeText(content);
    var normalized = normalizeOptions(options);
    var qr = makeQr(text, normalized.level);
    var size = qr.getModuleCount();
    var modules = new Array(size);
    var row;
    var column;

    for (row = 0; row < size; row += 1) {
      modules[row] = new Array(size);
      for (column = 0; column < size; column += 1) {
        modules[row][column] = qr.isDark(row, column);
      }
    }

    return {
      text: text,
      size: size,
      level: normalized.level,
      modules: modules
    };
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createSvg(content, options) {
    var normalized = normalizeOptions(options);
    var matrix = createMatrix(content, normalized);
    var extent = matrix.size + normalized.margin * 2;
    var path = [];
    var row;
    var column;

    for (row = 0; row < matrix.size; row += 1) {
      for (column = 0; column < matrix.size; column += 1) {
        if (matrix.modules[row][column]) {
          path.push("M" + (column + normalized.margin) + " " + (row + normalized.margin) + "h1v1h-1z");
        }
      }
    }

    return "<svg xmlns=\"http://www.w3.org/2000/svg\"" +
      " width=\"" + normalized.size + "\" height=\"" + normalized.size + "\"" +
      " viewBox=\"0 0 " + extent + " " + extent + "\"" +
      " role=\"img\" aria-label=\"" + escapeXml(normalized.ariaLabel) + "\"" +
      " shape-rendering=\"crispEdges\">" +
      "<rect width=\"100%\" height=\"100%\" fill=\"" + normalized.background + "\"/>" +
      "<path fill=\"" + normalized.foreground + "\" d=\"" + path.join("") + "\"/>" +
      "</svg>";
  }

  function createSvgDataUrl(content, options) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(createSvg(content, options));
  }

  function renderToCanvas(canvas, content, options) {
    if (!canvas || typeof canvas.getContext !== "function") {
      throw new TypeError("A canvas element is required.");
    }

    var normalized = normalizeOptions(options);
    var matrix = createMatrix(content, normalized);
    var extent = matrix.size + normalized.margin * 2;
    var cssSize = options && options.size
      ? normalized.size
      : extent * normalized.scale;
    var requestedRatio = options && options.pixelRatio;
    var defaultRatio = typeof window !== "undefined" && window.devicePixelRatio
      ? window.devicePixelRatio
      : 1;
    var pixelRatio = Number(requestedRatio || defaultRatio);
    if (!isFinite(pixelRatio) || pixelRatio <= 0 || pixelRatio > 8) {
      throw new RangeError("Canvas pixelRatio must be greater than 0 and no more than 8.");
    }

    var backingSize = Math.max(1, Math.round(cssSize * pixelRatio));
    var actualRatio = backingSize / cssSize;
    canvas.width = backingSize;
    canvas.height = backingSize;
    if (canvas.style) {
      canvas.style.width = cssSize + "px";
      canvas.style.height = cssSize + "px";
    }

    var context = canvas.getContext("2d");
    if (!context) {
      throw new Error("The canvas 2D context is unavailable.");
    }
    if (typeof context.setTransform === "function") {
      context.setTransform(actualRatio, 0, 0, actualRatio, 0, 0);
    } else if (typeof context.scale === "function") {
      context.scale(actualRatio, actualRatio);
    }
    context.imageSmoothingEnabled = false;
    context.fillStyle = normalized.background;
    context.fillRect(0, 0, cssSize, cssSize);

    var cellSize = cssSize / extent;
    context.fillStyle = normalized.foreground;
    var row;
    var column;
    for (row = 0; row < matrix.size; row += 1) {
      for (column = 0; column < matrix.size; column += 1) {
        if (matrix.modules[row][column]) {
          context.fillRect(
            (column + normalized.margin) * cellSize,
            (row + normalized.margin) * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    return {
      canvas: canvas,
      matrix: matrix,
      size: cssSize,
      pixelRatio: actualRatio
    };
  }

  function toDataUrl(content, options) {
    options = options || {};
    var canvas = options.canvas;
    if (!canvas) {
      if (typeof document === "undefined" || !document.createElement) {
        throw new Error("PNG data URLs require a browser canvas. Use createSvgDataUrl() outside a browser.");
      }
      canvas = document.createElement("canvas");
    }
    renderToCanvas(canvas, content, options);
    if (typeof canvas.toDataURL !== "function") {
      throw new Error("This canvas cannot create a data URL.");
    }
    return canvas.toDataURL("image/png");
  }

  function encodeQueryComponent(value) {
    return encodeURIComponent(String(value)).replace(/[!'()*]/g, function (character) {
      return "%" + character.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  function buildUrl(baseUrl, parameters) {
    var base = normalizeText(baseUrl);
    var params = parameters || {};
    var keys = Object.keys(params).sort();
    var URLConstructor = typeof URL !== "undefined" ? URL : null;

    if (URLConstructor) {
      var fallbackBase = typeof location !== "undefined" ? location.href : undefined;
      var url = fallbackBase ? new URLConstructor(base, fallbackBase) : new URLConstructor(base);
      keys.forEach(function (key) {
        var value = params[key];
        if (value === null || typeof value === "undefined") {
          return;
        }
        url.searchParams.set(key, String(value));
      });
      return url.toString();
    }

    var hashIndex = base.indexOf("#");
    var hash = hashIndex >= 0 ? base.slice(hashIndex) : "";
    var withoutHash = hashIndex >= 0 ? base.slice(0, hashIndex) : base;
    var additions = [];
    keys.forEach(function (key) {
      var value = params[key];
      if (value !== null && typeof value !== "undefined") {
        additions.push(encodeQueryComponent(key) + "=" + encodeQueryComponent(value));
      }
    });
    if (!additions.length) {
      return base;
    }
    return withoutHash + (withoutHash.indexOf("?") >= 0 ? "&" : "?") + additions.join("&") + hash;
  }

  assertEncoder();
  qrcodeFactory.stringToBytes = encodeUtf8;

  return {
    version: "1.0.0",
    encoderVersion: "qrcode-generator@1.4.4",
    buildUrl: buildUrl,
    createMatrix: createMatrix,
    createSvg: createSvg,
    createSvgDataUrl: createSvgDataUrl,
    encodeUtf8: encodeUtf8,
    renderToCanvas: renderToCanvas,
    toDataURL: toDataUrl
  };
}));
