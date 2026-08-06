# GlowLetter signed mobile web bundles

Android never loads this hosting origin in its WebView. It downloads a complete release,
verifies it, stores it in application-private storage, and then serves it at the existing
`https://appassets.androidplatform.net/assets/web/` origin on the next cold start.

## Published layout

Publish immutable archives and two small channel pointers:

```text
mobile-web/
  stable/
    manifest.json
    manifest.sig
  preview/
    manifest.json
    manifest.sig
  releases/
    30/
      bundle.zip
```

`manifest.sig` is a binary DER ECDSA P-256/SHA-256 signature over the exact UTF-8 bytes of
`manifest.json`. Do not Base64-decode or reformat the manifest after it has been signed.
Never overwrite an existing `releases/<bundleVersion>/bundle.zip`; publish a higher integer
version instead. Android 2.4.0 now bundles web version 30, so its next over-the-air web release
must be version 31 or higher.

## Manifest schema 1

```json
{
  "schema": 1,
  "channel": "stable",
  "applicationId": "com.franceisl.glowletternext",
  "bundleVersion": 30,
  "releaseId": "web-2026-08-02-30",
  "appVersion": "2.4.0",
  "minNativeVersionCode": 15,
  "requiredBridgeApi": 1,
  "entrypoint": "index.html",
  "archive": {
    "url": "https://bezam.org/mobile-web/releases/30/bundle.zip",
    "size": 123456,
    "sha256": "64-lowercase-hex-characters"
  },
  "files": [
    {
      "path": "index.html",
      "size": 1234,
      "sha256": "64-lowercase-hex-characters"
    }
  ]
}
```

The manifest must list every regular ZIP entry, including at least `index.html`, `config.js`
and `app.js`. File and directory segments use only ASCII letters, digits, `.`, `_`, `~` and `-`;
absolute paths, backslashes, empty segments and `..` are rejected. Preview manifests use channel `preview` and application ID
`com.franceisl.glowletternext.debug`.

## Signing

The private update key belongs outside the repository under
`C:\Users\Wolf\GlowLetter-keys`. The APK contains only the X.509 DER public key.

Use the checked-in builder from the repository root. It applies the same web-asset exclusions
as the native wrappers, decodes any `.b64` media fallback, writes ZIP entries in sorted order
with a fixed timestamp, hashes the archive and every extracted file, signs the exact manifest
bytes, and verifies the result with the public key pinned in the APK:

```powershell
# Safe dry run: packages, hashes, signs and verifies without changing mobile-web/.
& .\mobile\scripts\build_signed_web_bundle.ps1 `
  -BundleVersion 30 `
  -Channel stable `
  -ValidateOnly

# Production channel consumed by release builds.
& .\mobile\scripts\build_signed_web_bundle.ps1 `
  -BundleVersion 30 `
  -Channel stable

# Preview channel consumed by debug builds. It reuses the identical immutable archive.
& .\mobile\scripts\build_signed_web_bundle.ps1 `
  -BundleVersion 30 `
  -Channel preview
```

The default key path is
`C:\Users\Wolf\GlowLetter-keys\web-bundle-private.pem`; override it with
`-PrivateKeyPath` on a secured build machine. The script never prints private-key material.
It refuses to replace `releases/<bundleVersion>/bundle.zip` when the existing bytes differ,
so changed web content always requires a higher integer bundle version. Channel manifests are
written atomically after all archive, per-file and detached-signature checks pass.

Example signing operation in PowerShell (it writes the required RFC 3279 DER signature and
does not print the private key):

```powershell
$key = [System.Security.Cryptography.ECDsa]::Create()
try {
  $key.ImportFromPem([System.IO.File]::ReadAllText('C:\Users\Wolf\GlowLetter-keys\web-bundle-private.pem'))
  $manifestPath = (Resolve-Path -LiteralPath '.\manifest.json').Path
  $manifest = [System.IO.File]::ReadAllBytes($manifestPath)
  $signature = $key.SignData(
    $manifest,
    [System.Security.Cryptography.HashAlgorithmName]::SHA256,
    [System.Security.Cryptography.DSASignatureFormat]::Rfc3279DerSequence
  )
  [System.IO.File]::WriteAllBytes((Join-Path (Get-Location) 'manifest.sig'), $signature)
} finally {
  $key.Dispose()
}
```

Protect the private key independently from the Android APK keystore. A compromised web-bundle
key can authorize JavaScript that has access to the app's native bridges. Rotate it only through
a newly signed APK containing a new pinned public key.

## Activation behavior

- A downloaded release is marked pending and is never injected into the current session.
- The next cold start tries the pending release.
- A native health probe checks the expected web app version and billing callback.
- Success promotes it to last-good; failure quarantines it and reloads last-good or APK assets.
- A network response is never trusted merely because it came from GitHub Pages or HTTPS.
