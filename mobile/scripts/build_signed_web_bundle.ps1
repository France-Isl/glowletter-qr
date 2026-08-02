[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateRange(1, 2147483647)]
    [int]$BundleVersion,

    [Parameter(Mandatory = $true)]
    [ValidateSet("stable", "preview")]
    [string]$Channel,

    [string]$SourceRoot = (Join-Path $PSScriptRoot "..\.."),
    [string]$OutputRoot = (Join-Path $PSScriptRoot "..\..\mobile-web"),
    [string]$PrivateKeyPath = "C:\Users\Wolf\GlowLetter-keys\web-bundle-private.pem",
    [string]$PublicKeyPath = (Join-Path $PSScriptRoot "..\android\app\src\main\res\raw\glowletter_web_bundle_public_key.der"),
    [string]$BaseUrl = "https://bezam.org/mobile-web",
    [string]$ApplicationId = "",
    [string]$AppVersion = "",
    [ValidateRange(1, 2147483647)]
    [int]$MinNativeVersionCode = 15,
    [ValidateRange(1, 2147483647)]
    [int]$RequiredBridgeApi = 1,
    [string]$ReleaseId = "",
    [switch]$ValidateOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ManifestSchema = 1
$MaximumArchiveBytes = 40MB
$MaximumUncompressedBytes = 64MB
$MaximumSingleFileBytes = 32MB
$MaximumFileCount = 256
$MaximumPathLength = 240
$ExcludedRootNames = @("mobile", "mobile-web", "backend", "supabase", "tests", ".git", ".github")
$ExcludedRootSuffixes = @(".md", ".py")
$RequiredWebFiles = @("index.html", "config.js", "app.js")
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$FixedZipTimestamp = [DateTimeOffset]::new(1980, 1, 1, 0, 0, 0, [TimeSpan]::Zero)

function Get-CanonicalExistingPath {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Label
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "$Label was not found: $Path"
    }
    return (Resolve-Path -LiteralPath $Path).Path
}

function Get-RelativeWebPath {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path
    )

    return [IO.Path]::GetRelativePath($Root, $Path).Replace("\", "/")
}

function Assert-ValidWebPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    if ($Path.Length -eq 0 -or $Path.Length -gt $MaximumPathLength -or $Path.Contains("\")) {
        throw "Invalid web bundle path: $Path"
    }
    $segments = $Path.Split("/")
    foreach ($segment in $segments) {
        if (
            $segment.Length -eq 0 -or
            $segment -eq "." -or
            $segment -eq ".." -or
            $segment -notmatch "^[A-Za-z0-9._~-]+$"
        ) {
            throw "Invalid web bundle path segment in: $Path"
        }
    }
}

function Test-IncludedSourceFile {
    param([Parameter(Mandatory = $true)][string]$RelativePath)

    $segments = $RelativePath.Split("/")
    if ($segments.Count -eq 0 -or $ExcludedRootNames -contains $segments[0]) {
        return $false
    }
    if ($segments | Where-Object { $_.StartsWith(".", [StringComparison]::Ordinal) }) {
        return $false
    }
    if ($segments.Count -eq 1) {
        $extension = [IO.Path]::GetExtension($RelativePath).ToLowerInvariant()
        if ($ExcludedRootSuffixes -contains $extension) {
            return $false
        }
    }
    return $true
}

function Get-DecodedFallbackPath {
    param([Parameter(Mandatory = $true)][string]$RelativePath)

    if (-not $RelativePath.EndsWith(".b64", [StringComparison]::OrdinalIgnoreCase)) {
        return $RelativePath
    }
    $decoded = $RelativePath.Substring(0, $RelativePath.Length - 4)
    if ($decoded.StartsWith("audio/", [StringComparison]::Ordinal) -and
        -not $decoded.EndsWith(".mp3", [StringComparison]::OrdinalIgnoreCase)) {
        $decoded += ".mp3"
    }
    return $decoded
}

function Get-Sha256Hex {
    param([Parameter(Mandatory = $true)][string]$Path)
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-StreamSha256Hex {
    param([Parameter(Mandatory = $true)][IO.Stream]$Stream)

    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        return [Convert]::ToHexString($sha.ComputeHash($Stream)).ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }
}

function Get-OrdinalSortedStrings {
    param([Parameter(Mandatory = $true)][object[]]$Values)

    [string[]]$sorted = @($Values | ForEach-Object { [string]$_ })
    [Array]::Sort($sorted, [StringComparer]::Ordinal)
    return $sorted
}

function New-StagedWebTree {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    [IO.Directory]::CreateDirectory($Destination) | Out-Null
    $sourceFiles = @(Get-ChildItem -LiteralPath $Source -File -Recurse -Force)
    $selected = [ordered]@{}

    # Real files always take precedence over source-control Base64 fallbacks.
    foreach ($file in $sourceFiles) {
        if (($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Symbolic links and reparse points are not allowed: $($file.FullName)"
        }
        $relative = Get-RelativeWebPath -Root $Source -Path $file.FullName
        if (-not (Test-IncludedSourceFile -RelativePath $relative) -or
            $relative.EndsWith(".b64", [StringComparison]::OrdinalIgnoreCase)) {
            continue
        }
        Assert-ValidWebPath -Path $relative
        if ($selected.Contains($relative)) {
            throw "Duplicate web bundle path: $relative"
        }
        $selected[$relative] = [pscustomobject]@{ Source = $file.FullName; IsBase64 = $false }
    }

    foreach ($file in $sourceFiles) {
        $relative = Get-RelativeWebPath -Root $Source -Path $file.FullName
        if (-not (Test-IncludedSourceFile -RelativePath $relative) -or
            -not $relative.EndsWith(".b64", [StringComparison]::OrdinalIgnoreCase)) {
            continue
        }
        $decodedRelative = Get-DecodedFallbackPath -RelativePath $relative
        Assert-ValidWebPath -Path $decodedRelative
        if (-not $selected.Contains($decodedRelative)) {
            $selected[$decodedRelative] = [pscustomobject]@{ Source = $file.FullName; IsBase64 = $true }
        }
    }

    foreach ($required in $RequiredWebFiles) {
        if (-not $selected.Contains($required)) {
            throw "Required web file is missing: $required"
        }
    }
    if ($selected.Count -eq 0 -or $selected.Count -gt $MaximumFileCount) {
        throw "Web bundle file count is outside the Android updater limits: $($selected.Count)"
    }

    $selectedPaths = @(Get-OrdinalSortedStrings -Values @($selected.Keys))
    foreach ($relative in $selectedPaths) {
        $item = $selected[$relative]
        $destinationPath = Join-Path $Destination $relative.Replace("/", [IO.Path]::DirectorySeparatorChar)
        [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destinationPath)) | Out-Null
        if ($item.IsBase64) {
            $encoded = [IO.File]::ReadAllText($item.Source, [Text.Encoding]::ASCII)
            $compact = [Text.RegularExpressions.Regex]::Replace($encoded, "\s", "")
            [IO.File]::WriteAllBytes($destinationPath, [Convert]::FromBase64String($compact))
        }
        else {
            [IO.File]::Copy($item.Source, $destinationPath, $false)
        }
    }
}

function Get-FileSpecifications {
    param([Parameter(Mandatory = $true)][string]$StagingRoot)

    $filesByPath = @{}
    foreach ($file in @(Get-ChildItem -LiteralPath $StagingRoot -File -Recurse)) {
        $relative = Get-RelativeWebPath -Root $StagingRoot -Path $file.FullName
        if ($filesByPath.ContainsKey($relative)) {
            throw "Duplicate staged web path: $relative"
        }
        $filesByPath[$relative] = $file
    }
    $relativePaths = @(Get-OrdinalSortedStrings -Values @($filesByPath.Keys))
    if ($relativePaths.Count -eq 0 -or $relativePaths.Count -gt $MaximumFileCount) {
        throw "Staged file count is outside the Android updater limits: $($relativePaths.Count)"
    }

    [long]$totalSize = 0
    $specifications = @()
    foreach ($relative in $relativePaths) {
        $file = $filesByPath[$relative]
        Assert-ValidWebPath -Path $relative
        if ($file.Length -gt $MaximumSingleFileBytes) {
            throw "Web file exceeds Android's per-file limit: $relative"
        }
        $totalSize += $file.Length
        if ($totalSize -gt $MaximumUncompressedBytes) {
            throw "Web bundle exceeds Android's uncompressed-size limit"
        }
        $specifications += [pscustomobject][ordered]@{
            path = $relative
            size = [long]$file.Length
            sha256 = Get-Sha256Hex -Path $file.FullName
        }
    }
    return $specifications
}

function New-DeterministicZip {
    param(
        [Parameter(Mandatory = $true)][string]$StagingRoot,
        [Parameter(Mandatory = $true)][string]$ArchivePath,
        [Parameter(Mandatory = $true)][array]$FileSpecifications
    )

    Add-Type -AssemblyName System.IO.Compression
    $fileStream = [IO.File]::Open($ArchivePath, [IO.FileMode]::CreateNew, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    try {
        $archive = [IO.Compression.ZipArchive]::new(
            $fileStream,
            [IO.Compression.ZipArchiveMode]::Create,
            $true,
            [Text.Encoding]::UTF8
        )
        try {
            foreach ($specification in $FileSpecifications) {
                $entry = $archive.CreateEntry($specification.path, [IO.Compression.CompressionLevel]::Optimal)
                $entry.LastWriteTime = $FixedZipTimestamp
                $entry.ExternalAttributes = 0
                $entryStream = $entry.Open()
                try {
                    $sourcePath = Join-Path $StagingRoot $specification.path.Replace("/", [IO.Path]::DirectorySeparatorChar)
                    $sourceStream = [IO.File]::OpenRead($sourcePath)
                    try {
                        $sourceStream.CopyTo($entryStream)
                    }
                    finally {
                        $sourceStream.Dispose()
                    }
                }
                finally {
                    $entryStream.Dispose()
                }
            }
        }
        finally {
            $archive.Dispose()
        }
    }
    finally {
        $fileStream.Dispose()
    }
}

function New-ManifestBytes {
    param(
        [Parameter(Mandatory = $true)][array]$FileSpecifications,
        [Parameter(Mandatory = $true)][string]$ArchivePath,
        [Parameter(Mandatory = $true)][string]$ArchiveUrl
    )

    $manifest = [ordered]@{
        schema = $ManifestSchema
        channel = $Channel
        applicationId = $ApplicationId
        bundleVersion = $BundleVersion
        releaseId = $ReleaseId
        appVersion = $AppVersion
        minNativeVersionCode = $MinNativeVersionCode
        requiredBridgeApi = $RequiredBridgeApi
        entrypoint = "index.html"
        archive = [ordered]@{
            url = $ArchiveUrl
            size = [long](Get-Item -LiteralPath $ArchivePath).Length
            sha256 = Get-Sha256Hex -Path $ArchivePath
        }
        files = @($FileSpecifications)
    }
    $json = $manifest | ConvertTo-Json -Depth 8
    return $Utf8NoBom.GetBytes($json + "`n")
}

function New-ManifestSignature {
    param([Parameter(Mandatory = $true)][byte[]]$ManifestBytes)

    $signer = [Security.Cryptography.ECDsa]::Create()
    try {
        $signer.ImportFromPem([IO.File]::ReadAllText($PrivateKeyPath))
        return $signer.SignData(
            $ManifestBytes,
            [Security.Cryptography.HashAlgorithmName]::SHA256,
            [Security.Cryptography.DSASignatureFormat]::Rfc3279DerSequence
        )
    }
    finally {
        $signer.Dispose()
    }
}

function Assert-ManifestSignature {
    param(
        [Parameter(Mandatory = $true)][byte[]]$ManifestBytes,
        [Parameter(Mandatory = $true)][byte[]]$SignatureBytes
    )

    $verifier = [Security.Cryptography.ECDsa]::Create()
    try {
        [int]$bytesRead = 0
        $verifier.ImportSubjectPublicKeyInfo([IO.File]::ReadAllBytes($PublicKeyPath), [ref]$bytesRead)
        if (-not $verifier.VerifyData(
            $ManifestBytes,
            $SignatureBytes,
            [Security.Cryptography.HashAlgorithmName]::SHA256,
            [Security.Cryptography.DSASignatureFormat]::Rfc3279DerSequence
        )) {
            throw "Generated manifest signature does not match the public key pinned in the APK"
        }
    }
    finally {
        $verifier.Dispose()
    }
}

function Assert-ArchiveContents {
    param(
        [Parameter(Mandatory = $true)][string]$ArchivePath,
        [Parameter(Mandatory = $true)][array]$FileSpecifications
    )

    $expected = @{}
    foreach ($specification in $FileSpecifications) {
        $expected[$specification.path] = $specification
    }

    $archive = [IO.Compression.ZipFile]::OpenRead($ArchivePath)
    try {
        if ($archive.Entries.Count -ne $expected.Count) {
            throw "ZIP entry count does not match the signed manifest"
        }
        foreach ($entry in $archive.Entries) {
            if (-not $expected.ContainsKey($entry.FullName)) {
                throw "Unexpected ZIP entry: $($entry.FullName)"
            }
            $specification = $expected[$entry.FullName]
            if ($entry.Length -ne $specification.size) {
                throw "ZIP entry size mismatch: $($entry.FullName)"
            }
            $stream = $entry.Open()
            try {
                $actualSha256 = Get-StreamSha256Hex -Stream $stream
            }
            finally {
                $stream.Dispose()
            }
            if ($actualSha256 -cne $specification.sha256) {
                throw "ZIP entry digest mismatch: $($entry.FullName)"
            }
        }
    }
    finally {
        $archive.Dispose()
    }
}

function Write-AtomicBytes {
    param(
        [Parameter(Mandatory = $true)][string]$TargetPath,
        [Parameter(Mandatory = $true)][byte[]]$Bytes
    )

    $parent = [IO.Path]::GetDirectoryName($TargetPath)
    [IO.Directory]::CreateDirectory($parent) | Out-Null
    $temporary = Join-Path $parent ("." + [IO.Path]::GetFileName($TargetPath) + "." + [Guid]::NewGuid().ToString("N") + ".tmp")
    try {
        [IO.File]::WriteAllBytes($temporary, $Bytes)
        [IO.File]::Move($temporary, $TargetPath, $true)
    }
    finally {
        if (Test-Path -LiteralPath $temporary) {
            Remove-Item -LiteralPath $temporary -Force
        }
    }
}

$SourceRoot = Get-CanonicalExistingPath -Path $SourceRoot -Label "Source root"
$PrivateKeyPath = Get-CanonicalExistingPath -Path $PrivateKeyPath -Label "Private signing key"
$PublicKeyPath = Get-CanonicalExistingPath -Path $PublicKeyPath -Label "Pinned public key"
$OutputRoot = [IO.Path]::GetFullPath($OutputRoot)

if (-not (Test-Path -LiteralPath (Join-Path $SourceRoot "index.html") -PathType Leaf)) {
    throw "Source root does not contain index.html"
}
if ($BaseUrl -notmatch "^https://[A-Za-z0-9.-]+(?:/[A-Za-z0-9._~/-]*)?$") {
    throw "BaseUrl must be an HTTPS URL without query or fragment"
}
$BaseUrl = $BaseUrl.TrimEnd("/")

if ([string]::IsNullOrWhiteSpace($ApplicationId)) {
    $ApplicationId = if ($Channel -eq "stable") {
        "com.franceisl.glowletternext"
    }
    else {
        "com.franceisl.glowletternext.debug"
    }
}
if ([string]::IsNullOrWhiteSpace($AppVersion)) {
    $configText = [IO.File]::ReadAllText((Join-Path $SourceRoot "config.js"))
    $versionMatch = [regex]::Match($configText, 'appVersion\s*:\s*["''](?<version>[^"'']+)["'']')
    if (-not $versionMatch.Success) {
        throw "Could not read appVersion from config.js; pass -AppVersion explicitly"
    }
    $AppVersion = $versionMatch.Groups["version"].Value.Trim()
}
if ([string]::IsNullOrWhiteSpace($ReleaseId)) {
    $ReleaseId = "web-$Channel-$BundleVersion"
}
foreach ($token in @(
    @{ Name = "ApplicationId"; Value = $ApplicationId; Maximum = 160 },
    @{ Name = "AppVersion"; Value = $AppVersion; Maximum = 48 },
    @{ Name = "ReleaseId"; Value = $ReleaseId; Maximum = 96 }
)) {
    if ([string]::IsNullOrWhiteSpace($token.Value) -or $token.Value.Length -gt $token.Maximum -or $token.Value -match "[\x00-\x1F\x7F]") {
        throw "$($token.Name) is not a valid manifest token"
    }
}

$temporaryBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$temporaryRoot = Join-Path $temporaryBase ("glowletter-web-bundle-" + [Guid]::NewGuid().ToString("N"))
$stagingRoot = Join-Path $temporaryRoot "web"
$temporaryArchive = Join-Path $temporaryRoot "bundle.zip"

try {
    [IO.Directory]::CreateDirectory($temporaryRoot) | Out-Null
    New-StagedWebTree -Source $SourceRoot -Destination $stagingRoot
    $fileSpecifications = @(Get-FileSpecifications -StagingRoot $stagingRoot)
    New-DeterministicZip -StagingRoot $stagingRoot -ArchivePath $temporaryArchive -FileSpecifications $fileSpecifications

    $archiveLength = (Get-Item -LiteralPath $temporaryArchive).Length
    if ($archiveLength -le 0 -or $archiveLength -gt $MaximumArchiveBytes) {
        throw "Compressed archive size is outside the Android updater limits: $archiveLength"
    }
    Assert-ArchiveContents -ArchivePath $temporaryArchive -FileSpecifications $fileSpecifications

    $archiveUrl = "$BaseUrl/releases/$BundleVersion/bundle.zip"
    $manifestBytes = New-ManifestBytes -FileSpecifications $fileSpecifications -ArchivePath $temporaryArchive -ArchiveUrl $archiveUrl
    if ($manifestBytes.Length -gt 256KB) {
        throw "Manifest exceeds the Android updater limit"
    }
    [byte[]]$signatureBytes = @(New-ManifestSignature -ManifestBytes $manifestBytes)
    if ($signatureBytes.Length -le 0 -or $signatureBytes.Length -gt 1KB) {
        throw "Signature size is outside the Android updater limits"
    }
    Assert-ManifestSignature -ManifestBytes $manifestBytes -SignatureBytes $signatureBytes

    $archiveSha256 = Get-Sha256Hex -Path $temporaryArchive
    $releaseArchivePath = Join-Path $OutputRoot "releases\$BundleVersion\bundle.zip"
    $channelDirectory = Join-Path $OutputRoot $Channel
    $manifestPath = Join-Path $channelDirectory "manifest.json"
    $signaturePath = Join-Path $channelDirectory "manifest.sig"

    if (-not $ValidateOnly) {
        [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($releaseArchivePath)) | Out-Null
        if (Test-Path -LiteralPath $releaseArchivePath -PathType Leaf) {
            $existingLength = (Get-Item -LiteralPath $releaseArchivePath).Length
            $existingSha256 = Get-Sha256Hex -Path $releaseArchivePath
            if ($existingLength -ne $archiveLength -or $existingSha256 -cne $archiveSha256) {
                throw "Immutable release $BundleVersion already exists with different content; choose a higher bundle version"
            }
        }
        else {
            [IO.File]::Move($temporaryArchive, $releaseArchivePath)
        }
        Write-AtomicBytes -TargetPath $manifestPath -Bytes $manifestBytes
        Write-AtomicBytes -TargetPath $signaturePath -Bytes $signatureBytes
    }

    [pscustomobject][ordered]@{
        ok = $true
        validateOnly = [bool]$ValidateOnly
        channel = $Channel
        applicationId = $ApplicationId
        appVersion = $AppVersion
        bundleVersion = $BundleVersion
        fileCount = $fileSpecifications.Count
        archiveBytes = [long]$archiveLength
        archiveSha256 = $archiveSha256
        archivePath = if ($ValidateOnly) { $null } else { $releaseArchivePath }
        manifestPath = if ($ValidateOnly) { $null } else { $manifestPath }
        signaturePath = if ($ValidateOnly) { $null } else { $signaturePath }
        signatureVerifiedWithPinnedKey = $true
    } | ConvertTo-Json -Compress
}
finally {
    if (Test-Path -LiteralPath $temporaryRoot) {
        $resolvedTemporaryRoot = [IO.Path]::GetFullPath($temporaryRoot)
        if (-not $resolvedTemporaryRoot.StartsWith($temporaryBase, [StringComparison]::OrdinalIgnoreCase) -or
            [IO.Path]::GetFileName($resolvedTemporaryRoot) -notmatch "^glowletter-web-bundle-[0-9a-f]{32}$") {
            throw "Refusing to clean an unexpected temporary path"
        }
        Remove-Item -LiteralPath $resolvedTemporaryRoot -Recurse -Force
    }
}
