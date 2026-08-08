import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readText = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

const builder = readText("mobile/scripts/build_signed_web_bundle.ps1");
const readme = readText("mobile-web/README.md");
const manager = readText("mobile/android/app/src/main/java/com/franceisl/nurpismo/WebBundleManager.java");
const gradle = readText("mobile/android/app/build.gradle");

assert.match(builder, /\[ValidateSet\("stable",\s*"preview"\)\]/);
assert.match(builder, /\[int\]\$BundleVersion/);
assert.match(builder, /\[switch\]\$ValidateOnly/);
assert.match(builder, /web-bundle-private\.pem/);
assert.match(builder, /glowletter_web_bundle_public_key\.der/);
assert.match(builder, /DSASignatureFormat\]::Rfc3279DerSequence/);
assert.match(builder, /ImportSubjectPublicKeyInfo/);
assert.match(builder, /signatureVerifiedWithPinnedKey\s*=\s*\$true/);
assert.doesNotMatch(builder, /-----BEGIN (?:EC )?PRIVATE KEY-----/);

for (const excluded of ["mobile", "mobile-web", "backend", "supabase", "tests", ".git", ".github"]) {
  assert.match(builder, new RegExp(`\\"${excluded.replace(".", "\\.")}\\"`));
}
for (const required of ["index.html", "config.js", "app.js"]) {
  assert.match(builder, new RegExp(`\\"${required.replace(".", "\\.")}\\"`));
}
assert.match(builder, /DateTimeOffset\]::new\(1980,\s*1,\s*1/);
assert.match(builder, /Array\]::Sort\(\$sorted,\s*\[StringComparer\]::Ordinal\)/);
assert.match(builder, /Immutable release[\s\S]*different content[\s\S]*higher bundle version/);
assert.match(builder, /Write-AtomicBytes -TargetPath \$manifestPath/);
assert.match(builder, /ConvertTo-Json[\s\S]*-replace \"`r`n\?\", \"`n\"/);
assert.match(builder, /Assert-ArchiveContents/);
assert.match(builder, /Get-StreamSha256Hex/);

for (const updaterLimit of [
  "MAX_ARCHIVE_BYTES = 40L * 1024L * 1024L",
  "MAX_UNCOMPRESSED_BYTES = 64L * 1024L * 1024L",
  "MAX_SINGLE_FILE_BYTES = 32L * 1024L * 1024L",
  "MAX_FILE_COUNT = 256",
  "MAX_PATH_LENGTH = 240",
]) {
  assert.ok(manager.includes(updaterLimit), `Android updater limit changed: ${updaterLimit}`);
}
assert.match(builder, /\$MaximumArchiveBytes\s*=\s*40MB/);
assert.match(builder, /\$MaximumUncompressedBytes\s*=\s*64MB/);
assert.match(builder, /\$MaximumSingleFileBytes\s*=\s*32MB/);
assert.match(builder, /\$MaximumFileCount\s*=\s*256/);
assert.match(builder, /\$MaximumPathLength\s*=\s*240/);

assert.match(gradle, /BUNDLED_WEB_BUNDLE_VERSION",\s*"31"/);
assert.match(readme, /next over-the-air web release[\s\S]*version 32 or higher/i);
assert.match(readme, /build_signed_web_bundle\.ps1[\s\S]*-ValidateOnly/);
assert.match(readme, /-Channel stable/);
assert.match(readme, /-Channel preview/);

const webRoot = path.join(root, "mobile-web");
const archivePath = path.join(webRoot, "releases", "31", "bundle.zip");
const stableManifestPath = path.join(webRoot, "stable", "manifest.json");
const stableSignaturePath = path.join(webRoot, "stable", "manifest.sig");
const previewManifestPath = path.join(webRoot, "preview", "manifest.json");
const previewSignaturePath = path.join(webRoot, "preview", "manifest.sig");
const artifactPaths = [
  archivePath,
  stableManifestPath,
  stableSignaturePath,
  previewManifestPath,
  previewSignaturePath,
];
const artifactPresence = artifactPaths.map((artifact) => fs.existsSync(artifact));
assert.ok(
  artifactPresence.every(Boolean) || artifactPresence.every((present) => !present),
  "Signed web artifacts must be generated as one complete set",
);

if (artifactPresence.every(Boolean)) {
  const archiveBytes = fs.readFileSync(archivePath);
  const publicKey = crypto.createPublicKey({
    key: fs.readFileSync(
      path.join(root, "mobile/android/app/src/main/res/raw/glowletter_web_bundle_public_key.der"),
    ),
    format: "der",
    type: "spki",
  });

  const manifests = [];
  for (const [channel, manifestPath, signaturePath, applicationId] of [
    ["stable", stableManifestPath, stableSignaturePath, "com.franceisl.glowletternext"],
    ["preview", previewManifestPath, previewSignaturePath, "com.franceisl.glowletternext.debug"],
  ]) {
    const manifestBytes = fs.readFileSync(manifestPath);
    const signatureBytes = fs.readFileSync(signaturePath);
    assert.equal(manifestBytes.includes(13), false, `${channel} manifest must use canonical LF bytes`);
    const manifest = JSON.parse(manifestBytes.toString("utf8"));
    assert.equal(manifest.schema, 1);
    assert.equal(manifest.channel, channel);
    assert.equal(manifest.applicationId, applicationId);
    assert.equal(manifest.bundleVersion, 31);
    assert.equal(manifest.appVersion, "2.4.1");
    assert.equal(manifest.minNativeVersionCode, 15);
    assert.equal(manifest.requiredBridgeApi, 1);
    assert.equal(manifest.entrypoint, "index.html");
    assert.equal(manifest.archive.size, archiveBytes.length);
    assert.equal(manifest.archive.sha256, sha256(archiveBytes));
    assert.equal(
      manifest.archive.url,
      "https://bezam.org/mobile-web/releases/31/bundle.zip",
    );
    assert.ok(crypto.verify("sha256", manifestBytes, publicKey, signatureBytes));
    assert.ok(signatureBytes.length > 0 && signatureBytes.length <= 1024);
    assert.ok(Array.isArray(manifest.files) && manifest.files.length > 0 && manifest.files.length <= 256);
    assert.deepEqual(
      manifest.files.map((file) => file.path),
      [...manifest.files.map((file) => file.path)].sort(),
      "Signed file list must remain deterministic",
    );
    for (const required of ["index.html", "config.js", "app.js"]) {
      assert.ok(manifest.files.some((file) => file.path === required));
    }
    manifests.push(manifest);
  }
  assert.deepEqual(manifests[0].archive, manifests[1].archive);
  assert.deepEqual(manifests[0].files, manifests[1].files);
}

console.log(JSON.stringify({
  ok: true,
  deterministicBuilder: true,
  signedArtifacts: artifactPresence.every(Boolean),
  bundleVersion: 31,
}));
