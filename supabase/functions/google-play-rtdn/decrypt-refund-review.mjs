// Incident-response tool. It intentionally reads encrypted row data from stdin
// so ciphertext and identifiers do not have to appear in shell history.
const keyText = String(
  process.env.GLOWLETTER_REFUND_REVIEW_ENCRYPTION_KEY || "",
).trim();
if (!/^[A-Za-z0-9_-]{43}$/u.test(keyText)) {
  fail("missing or invalid GLOWLETTER_REFUND_REVIEW_ENCRYPTION_KEY");
}

const chunks = [];
let totalBytes = 0;
for await (const chunk of process.stdin) {
  totalBytes += chunk.length;
  if (totalBytes > 64 * 1024) fail("input exceeds 64 KiB");
  chunks.push(chunk);
}

let input;
try {
  input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
} catch {
  fail("stdin must contain one JSON object");
}

const messageId = exactString(input.messageId, 256);
const payloadHash = base64UrlString(input.payloadHash, 43, 43);
const encryptedDetails = base64UrlString(input.encryptedDetails, 32, 16_384);
const encryptionIv = base64UrlString(input.encryptionIv, 16, 16);
if (!messageId || /[\u0000-\u001f\u007f]/u.test(messageId)) {
  fail("invalid messageId");
}

let plaintext;
try {
  const key = await crypto.subtle.importKey(
    "raw",
    Buffer.from(keyText, "base64url"),
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Buffer.from(encryptionIv, "base64url"),
      additionalData: new TextEncoder().encode(`${messageId}\n${payloadHash}`),
      tagLength: 128,
    },
    key,
    Buffer.from(encryptedDetails, "base64url"),
  );
} catch {
  fail("decryption failed; verify the row, AAD fields, and encryption key");
}

let details;
try {
  details = JSON.parse(
    new TextDecoder("utf-8", { fatal: true }).decode(plaintext),
  );
} catch {
  fail("decrypted data is not valid UTF-8 JSON");
}
if (
  !details ||
  typeof details !== "object" ||
  Array.isArray(details) ||
  !exactString(details.pendingRefundToken, 4_096) ||
  !exactString(details.orderId, 256)
) {
  fail("decrypted refund details are malformed");
}

process.stdout.write(`${
  JSON.stringify(
    {
      pendingRefundToken: details.pendingRefundToken,
      orderId: details.orderId,
    },
    null,
    2,
  )
}\n`);

function exactString(value, maximum) {
  return typeof value === "string" &&
      value.length > 0 &&
      value.length <= maximum
    ? value
    : "";
}

function base64UrlString(value, minimum, maximum) {
  return typeof value === "string" &&
      value.length >= minimum &&
      value.length <= maximum &&
      /^[A-Za-z0-9_-]+$/u.test(value)
    ? value
    : fail("invalid Base64URL field");
}

function fail(message) {
  process.stderr.write(`refund-review decrypt: ${message}\n`);
  process.exit(1);
}
