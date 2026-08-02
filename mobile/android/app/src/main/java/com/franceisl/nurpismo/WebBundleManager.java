package com.franceisl.glowletternext;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.AlgorithmParameters;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.Signature;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECFieldFp;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Downloads complete, signed web releases into application-private storage.
 *
 * <p>The manager never serves network content directly to the WebView. A release becomes a
 * cold-start candidate only after its detached ECDSA signature, archive digest and every
 * extracted file have been verified. The APK-bundled web application remains the ultimate
 * fallback and is never modified.</p>
 */
final class WebBundleManager implements Closeable {
    private static final String TAG = "GlowLetterWebBundle";
    private static final String PREFERENCES = "glowletter_web_bundle_state_v1";
    private static final String KEY_PENDING_VERSION = "pending_version";
    private static final String KEY_LAST_GOOD_VERSION = "last_good_version";
    private static final String KEY_HIGHEST_ACCEPTED_VERSION = "highest_accepted_version";
    private static final String KEY_QUARANTINED_VERSIONS = "quarantined_versions";

    private static final String RELEASES_DIRECTORY = "releases";
    private static final String STAGING_DIRECTORY = "staging";
    private static final String WEB_DIRECTORY = "web";
    private static final String METADATA_DIRECTORY = "metadata";
    private static final String LOCAL_MANIFEST_FILE = "manifest.json";
    private static final String LOCAL_SIGNATURE_FILE = "manifest.sig";

    static final int MANIFEST_SCHEMA = 1;
    static final long MAX_MANIFEST_BYTES = 256L * 1024L;
    static final long MAX_SIGNATURE_BYTES = 1024L;
    static final long MAX_ARCHIVE_BYTES = 40L * 1024L * 1024L;
    static final long MAX_UNCOMPRESSED_BYTES = 64L * 1024L * 1024L;
    static final long MAX_SINGLE_FILE_BYTES = 32L * 1024L * 1024L;
    static final int MAX_FILE_COUNT = 256;
    static final int MAX_ARCHIVE_ENTRY_COUNT = 512;
    static final int MAX_PATH_LENGTH = 240;

    private static final int CONNECT_TIMEOUT_MILLIS = 12_000;
    private static final int READ_TIMEOUT_MILLIS = 30_000;
    private static final int BUFFER_SIZE = 32 * 1024;
    private static final int NO_VERSION = -1;

    private static final Set<String> TOP_LEVEL_KEYS = immutableSet(
            "schema",
            "channel",
            "applicationId",
            "bundleVersion",
            "releaseId",
            "appVersion",
            "minNativeVersionCode",
            "requiredBridgeApi",
            "entrypoint",
            "archive",
            "files"
    );
    private static final Set<String> ARCHIVE_KEYS = immutableSet("url", "size", "sha256");
    private static final Set<String> FILE_KEYS = immutableSet("path", "size", "sha256");

    enum Source {
        BUNDLED,
        CANDIDATE,
        LAST_GOOD
    }

    static final class Selection {
        final Source source;
        final Manifest manifest;
        final File webDirectory;

        private Selection(Source source, Manifest manifest, File webDirectory) {
            this.source = source;
            this.manifest = manifest;
            this.webDirectory = webDirectory;
        }

        static Selection bundled() {
            return new Selection(Source.BUNDLED, null, null);
        }

        boolean isDownloaded() {
            return source != Source.BUNDLED && manifest != null && webDirectory != null;
        }

        boolean isCandidate() {
            return source == Source.CANDIDATE;
        }

        int bundleVersion() {
            return manifest == null ? NO_VERSION : manifest.bundleVersion;
        }

        String expectedAppVersion() {
            return manifest == null ? "" : manifest.appVersion;
        }
    }

    static final class Compatibility {
        final String applicationId;
        final String channel;
        final int nativeVersionCode;
        final int nativeBridgeApi;
        final int bundledBundleVersion;
        final String updateHost;

        Compatibility(
                String applicationId,
                String channel,
                int nativeVersionCode,
                int nativeBridgeApi,
                int bundledBundleVersion,
                String updateHost
        ) {
            this.applicationId = applicationId;
            this.channel = channel;
            this.nativeVersionCode = nativeVersionCode;
            this.nativeBridgeApi = nativeBridgeApi;
            this.bundledBundleVersion = bundledBundleVersion;
            this.updateHost = updateHost;
        }
    }

    static final class FileSpec {
        final String path;
        final long size;
        final String sha256;

        FileSpec(String path, long size, String sha256) {
            this.path = path;
            this.size = size;
            this.sha256 = sha256;
        }
    }

    static final class Manifest {
        final String channel;
        final String applicationId;
        final int bundleVersion;
        final String releaseId;
        final String appVersion;
        final int minNativeVersionCode;
        final int requiredBridgeApi;
        final String entrypoint;
        final URI archiveUri;
        final long archiveSize;
        final String archiveSha256;
        final List<FileSpec> files;
        final Map<String, FileSpec> filesByPath;

        Manifest(
                String channel,
                String applicationId,
                int bundleVersion,
                String releaseId,
                String appVersion,
                int minNativeVersionCode,
                int requiredBridgeApi,
                String entrypoint,
                URI archiveUri,
                long archiveSize,
                String archiveSha256,
                List<FileSpec> files
        ) {
            this.channel = channel;
            this.applicationId = applicationId;
            this.bundleVersion = bundleVersion;
            this.releaseId = releaseId;
            this.appVersion = appVersion;
            this.minNativeVersionCode = minNativeVersionCode;
            this.requiredBridgeApi = requiredBridgeApi;
            this.entrypoint = entrypoint;
            this.archiveUri = archiveUri;
            this.archiveSize = archiveSize;
            this.archiveSha256 = archiveSha256;
            this.files = Collections.unmodifiableList(new ArrayList<>(files));
            Map<String, FileSpec> index = new HashMap<>();
            for (FileSpec file : files) {
                index.put(file.path, file);
            }
            this.filesByPath = Collections.unmodifiableMap(index);
        }
    }

    private final Context context;
    private final SharedPreferences preferences;
    private final File managerRoot;
    private final File releasesRoot;
    private final File stagingRoot;
    private final URI manifestUri;
    private final URI signatureUri;
    private final PublicKey publicKey;
    private final Compatibility compatibility;
    private final ExecutorService executor;
    private final AtomicBoolean updateCheckRunning = new AtomicBoolean(false);
    private volatile boolean closed;

    WebBundleManager(Context context) throws GeneralSecurityException, IOException {
        this.context = context.getApplicationContext();
        this.preferences = this.context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
        this.managerRoot = new File(this.context.getFilesDir(), "glowletter-web-bundles");
        this.releasesRoot = new File(managerRoot, RELEASES_DIRECTORY);
        this.stagingRoot = new File(managerRoot, STAGING_DIRECTORY);

        this.manifestUri = parseConfiguredManifestUri(BuildConfig.WEB_BUNDLE_MANIFEST_URL);
        this.signatureUri = manifestUri == null ? null : manifestUri.resolve("manifest.sig");
        this.publicKey = decodeP256PublicKey(readBounded(
                this.context.getResources().openRawResource(R.raw.glowletter_web_bundle_public_key),
                MAX_SIGNATURE_BYTES
        ));
        this.compatibility = new Compatibility(
                BuildConfig.APPLICATION_ID,
                BuildConfig.WEB_BUNDLE_CHANNEL,
                BuildConfig.VERSION_CODE,
                BuildConfig.NATIVE_BRIDGE_API,
                BuildConfig.BUNDLED_WEB_BUNDLE_VERSION,
                manifestUri == null ? "" : normalizedHost(manifestUri)
        );
        this.executor = Executors.newSingleThreadExecutor(new ThreadFactory() {
            @Override
            public Thread newThread(Runnable runnable) {
                Thread thread = new Thread(runnable, "glowletter-web-bundle-updater");
                thread.setDaemon(true);
                return thread;
            }
        });
    }

    synchronized Selection selectForColdStart() {
        int pendingVersion = preferences.getInt(KEY_PENDING_VERSION, NO_VERSION);
        if (pendingVersion > compatibility.bundledBundleVersion) {
            if (!isQuarantined(pendingVersion)) {
                Selection candidate = loadInstalledSelection(pendingVersion, Source.CANDIDATE);
                if (candidate != null) {
                    return candidate;
                }
                quarantineVersion(pendingVersion);
            }
            preferences.edit().remove(KEY_PENDING_VERSION).commit();
        }

        Selection fallback = selectLastGoodOrBundled(NO_VERSION);
        removeSupersededRelease(
                pendingVersion,
                fallback.bundleVersion(),
                preferences.getInt(KEY_LAST_GOOD_VERSION, NO_VERSION)
        );
        return fallback;
    }

    synchronized void markHealthy(Selection selection) {
        if (selection == null || !selection.isCandidate()) {
            return;
        }
        int pendingVersion = preferences.getInt(KEY_PENDING_VERSION, NO_VERSION);
        if (pendingVersion != selection.bundleVersion()) {
            return;
        }
        int previousLastGood = preferences.getInt(KEY_LAST_GOOD_VERSION, NO_VERSION);
        boolean committed = preferences.edit()
                .putInt(KEY_LAST_GOOD_VERSION, selection.bundleVersion())
                .remove(KEY_PENDING_VERSION)
                .commit();
        if (committed) {
            removeSupersededRelease(
                    previousLastGood,
                    selection.bundleVersion(),
                    NO_VERSION
            );
        }
    }

    synchronized Selection fallbackAfterFailure(Selection failedSelection) {
        if (failedSelection == null || !failedSelection.isDownloaded()) {
            return Selection.bundled();
        }

        int failedVersion = failedSelection.bundleVersion();
        SharedPreferences.Editor editor = preferences.edit();
        if (failedSelection.isCandidate()) {
            quarantineVersion(failedVersion);
            if (preferences.getInt(KEY_PENDING_VERSION, NO_VERSION) == failedVersion) {
                editor.remove(KEY_PENDING_VERSION);
            }
            // The in-memory Selection keeps its CANDIDATE source after promotion. If it fails
            // later in the same process, clear the promoted last-good pointer as well.
            if (preferences.getInt(KEY_LAST_GOOD_VERSION, NO_VERSION) == failedVersion) {
                editor.remove(KEY_LAST_GOOD_VERSION);
            }
        } else if (preferences.getInt(KEY_LAST_GOOD_VERSION, NO_VERSION) == failedVersion) {
            editor.remove(KEY_LAST_GOOD_VERSION);
        }
        editor.commit();
        Selection fallback = selectLastGoodOrBundled(failedVersion);
        removeSupersededRelease(
                failedVersion,
                fallback.bundleVersion(),
                preferences.getInt(KEY_LAST_GOOD_VERSION, NO_VERSION)
        );
        return fallback;
    }

    void checkForUpdateAsync() {
        if (closed || manifestUri == null || signatureUri == null) {
            return;
        }
        if (!updateCheckRunning.compareAndSet(false, true)) {
            return;
        }
        try {
            executor.execute(() -> {
                try {
                    checkForUpdate();
                } catch (Exception exception) {
                    Log.i(TAG, "Signed web bundle update was not installed: " + safeReason(exception));
                } finally {
                    updateCheckRunning.set(false);
                }
            });
        } catch (RejectedExecutionException ignored) {
            updateCheckRunning.set(false);
        }
    }

    private void checkForUpdate() throws Exception {
        if (closed) {
            return;
        }
        byte[] manifestBytes = fetchBytes(manifestUri, MAX_MANIFEST_BYTES);
        byte[] signatureBytes = fetchBytes(signatureUri, MAX_SIGNATURE_BYTES);
        Manifest manifest = verifyAndParseManifest(
                manifestBytes,
                signatureBytes,
                publicKey,
                compatibility
        );

        int highestAccepted = Math.max(
                compatibility.bundledBundleVersion,
                preferences.getInt(KEY_HIGHEST_ACCEPTED_VERSION, compatibility.bundledBundleVersion)
        );
        if (manifest.bundleVersion <= highestAccepted || isQuarantined(manifest.bundleVersion)) {
            return;
        }

        ensurePrivateDirectory(managerRoot);
        ensurePrivateDirectory(releasesRoot);
        ensurePrivateDirectory(stagingRoot);
        removeAbandonedStagingEntries();
        if (adoptAlreadyPublishedRelease(manifest, manifestBytes)) {
            return;
        }
        File archiveFile = new File(stagingRoot, "download-" + UUID.randomUUID() + ".zip");
        File releaseStaging = new File(stagingRoot, "release-" + UUID.randomUUID());
        int supersededPending = preferences.getInt(KEY_PENDING_VERSION, NO_VERSION);
        try {
            downloadAndVerifyArchive(manifest.archiveUri, archiveFile, manifest);
            installIntoStaging(archiveFile, releaseStaging, manifest, manifestBytes, signatureBytes);
            publishStagedRelease(releaseStaging, manifest.bundleVersion);
            if (!preferences.edit()
                    .putInt(KEY_PENDING_VERSION, manifest.bundleVersion)
                    .putInt(KEY_HIGHEST_ACCEPTED_VERSION, manifest.bundleVersion)
                    .commit()) {
                throw new IOException("release_state_commit_failed");
            }
            removeSupersededRelease(
                    supersededPending,
                    manifest.bundleVersion,
                    preferences.getInt(KEY_LAST_GOOD_VERSION, NO_VERSION)
            );
        } finally {
            deletePrivateTree(archiveFile);
            deletePrivateTree(releaseStaging);
        }
    }

    private synchronized Selection selectLastGoodOrBundled(int excludedVersion) {
        int lastGoodVersion = preferences.getInt(KEY_LAST_GOOD_VERSION, NO_VERSION);
        if (lastGoodVersion > compatibility.bundledBundleVersion) {
            if (lastGoodVersion != excludedVersion && !isQuarantined(lastGoodVersion)) {
                Selection lastGood = loadInstalledSelection(lastGoodVersion, Source.LAST_GOOD);
                if (lastGood != null) {
                    return lastGood;
                }
            }
            preferences.edit().remove(KEY_LAST_GOOD_VERSION).commit();
        }
        return Selection.bundled();
    }

    private Selection loadInstalledSelection(int bundleVersion, Source source) {
        try {
            File releaseDirectory = releaseDirectory(bundleVersion);
            File metadataDirectory = new File(releaseDirectory, METADATA_DIRECTORY);
            File webDirectory = new File(releaseDirectory, WEB_DIRECTORY);
            byte[] manifestBytes = readFileBounded(
                    new File(metadataDirectory, LOCAL_MANIFEST_FILE),
                    MAX_MANIFEST_BYTES
            );
            byte[] signatureBytes = readFileBounded(
                    new File(metadataDirectory, LOCAL_SIGNATURE_FILE),
                    MAX_SIGNATURE_BYTES
            );
            Manifest manifest = verifyAndParseManifest(
                    manifestBytes,
                    signatureBytes,
                    publicKey,
                    compatibility
            );
            if (manifest.bundleVersion != bundleVersion
                    || !isCompleteInstalledWebDirectory(webDirectory, manifest)) {
                return null;
            }
            return new Selection(source, manifest, webDirectory);
        } catch (Exception exception) {
            Log.i(TAG, "Stored web bundle was rejected: " + safeReason(exception));
            return null;
        }
    }

    private static boolean isCompleteInstalledWebDirectory(File webDirectory, Manifest manifest)
            throws IOException, GeneralSecurityException {
        if (!webDirectory.isDirectory()) {
            return false;
        }
        String rootPath = webDirectory.getCanonicalPath();
        String rootPrefix = rootPath + File.separator;
        for (FileSpec spec : manifest.files) {
            File file = new File(webDirectory, spec.path);
            String canonical = file.getCanonicalPath();
            if (!canonical.startsWith(rootPrefix)
                    || !file.isFile()
                    || file.length() != spec.size
                    || !constantTimeHexEquals(spec.sha256, sha256File(file))) {
                return false;
            }
        }
        return new File(webDirectory, manifest.entrypoint).isFile();
    }

    private void installIntoStaging(
            File archiveFile,
            File releaseStaging,
            Manifest manifest,
            byte[] manifestBytes,
            byte[] signatureBytes
    ) throws IOException, GeneralSecurityException {
        ensurePrivateDirectory(releaseStaging);
        File webDirectory = new File(releaseStaging, WEB_DIRECTORY);
        File metadataDirectory = new File(releaseStaging, METADATA_DIRECTORY);
        ensurePrivateDirectory(webDirectory);
        ensurePrivateDirectory(metadataDirectory);
        extractVerifiedArchive(archiveFile, webDirectory, manifest);
        writeSynced(new File(metadataDirectory, LOCAL_MANIFEST_FILE), manifestBytes);
        writeSynced(new File(metadataDirectory, LOCAL_SIGNATURE_FILE), signatureBytes);
    }

    private void publishStagedRelease(File releaseStaging, int bundleVersion) throws IOException {
        File destination = releaseDirectory(bundleVersion);
        if (destination.exists()) {
            throw new IOException("release_version_already_exists");
        }
        if (!releaseStaging.renameTo(destination)) {
            throw new IOException("release_atomic_rename_failed");
        }
    }

    /**
     * Recovers the narrow crash window after an atomic directory rename but before the
     * SharedPreferences pointer is committed. Only an exact byte-for-byte copy of the currently
     * signed channel manifest can be adopted, so reusing a bundle version with different content
     * remains a hard failure. A valid re-signing of identical bytes is harmless and is allowed.
     */
    private boolean adoptAlreadyPublishedRelease(
            Manifest manifest,
            byte[] manifestBytes
    ) throws IOException {
        File destination = releaseDirectory(manifest.bundleVersion);
        if (!destination.exists()) {
            return false;
        }
        File metadataDirectory = new File(destination, METADATA_DIRECTORY);
        byte[] storedManifest = readFileBounded(
                new File(metadataDirectory, LOCAL_MANIFEST_FILE),
                MAX_MANIFEST_BYTES
        );
        if (!MessageDigest.isEqual(storedManifest, manifestBytes)
                || loadInstalledSelection(manifest.bundleVersion, Source.CANDIDATE) == null) {
            throw new IOException("existing_release_does_not_match_manifest");
        }
        int supersededPending = preferences.getInt(KEY_PENDING_VERSION, NO_VERSION);
        if (!preferences.edit()
                .putInt(KEY_PENDING_VERSION, manifest.bundleVersion)
                .putInt(KEY_HIGHEST_ACCEPTED_VERSION, manifest.bundleVersion)
                .commit()) {
            throw new IOException("release_state_commit_failed");
        }
        removeSupersededRelease(
                supersededPending,
                manifest.bundleVersion,
                preferences.getInt(KEY_LAST_GOOD_VERSION, NO_VERSION)
        );
        return true;
    }

    private void removeAbandonedStagingEntries() {
        File[] entries = stagingRoot.listFiles();
        if (entries == null) {
            return;
        }
        for (File entry : entries) {
            deletePrivateTree(entry);
        }
    }

    private File releaseDirectory(int bundleVersion) {
        return new File(releasesRoot, "v" + bundleVersion);
    }

    private void removeSupersededRelease(int bundleVersion, int keptVersionA, int keptVersionB) {
        if (bundleVersion <= compatibility.bundledBundleVersion
                || bundleVersion == keptVersionA
                || bundleVersion == keptVersionB) {
            return;
        }
        deletePrivateTree(releaseDirectory(bundleVersion));
    }

    private void downloadAndVerifyArchive(URI archiveUri, File destination, Manifest manifest)
            throws IOException, GeneralSecurityException {
        HttpURLConnection connection = openHttpsConnection(archiveUri);
        try {
            int status = connection.getResponseCode();
            if (status != HttpURLConnection.HTTP_OK) {
                throw new IOException("archive_http_" + status);
            }
            long contentLength = connection.getContentLengthLong();
            if (contentLength > MAX_ARCHIVE_BYTES
                    || (contentLength >= 0L && contentLength != manifest.archiveSize)) {
                throw new IOException("archive_content_length_mismatch");
            }

            MessageDigest digest = sha256Digest();
            long total = 0L;
            try (InputStream input = connection.getInputStream();
                 FileOutputStream output = new FileOutputStream(destination)) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int count;
                while ((count = input.read(buffer)) != -1) {
                    total += count;
                    if (total > MAX_ARCHIVE_BYTES || total > manifest.archiveSize) {
                        throw new IOException("archive_too_large");
                    }
                    digest.update(buffer, 0, count);
                    output.write(buffer, 0, count);
                }
                output.getFD().sync();
            }
            if (total != manifest.archiveSize
                    || !constantTimeHexEquals(manifest.archiveSha256, digest.digest())) {
                throw new GeneralSecurityException("archive_digest_mismatch");
            }
        } finally {
            connection.disconnect();
        }
    }

    static void extractVerifiedArchive(File archiveFile, File webDirectory, Manifest manifest)
            throws IOException, GeneralSecurityException {
        if (!archiveFile.isFile()
                || archiveFile.length() != manifest.archiveSize
                || archiveFile.length() > MAX_ARCHIVE_BYTES) {
            throw new IOException("archive_size_mismatch");
        }
        if (!constantTimeHexEquals(manifest.archiveSha256, sha256File(archiveFile))) {
            throw new GeneralSecurityException("archive_digest_mismatch");
        }

        String rootPath = webDirectory.getCanonicalPath();
        String rootPrefix = rootPath + File.separator;
        Set<String> seen = new HashSet<>();
        long uncompressedTotal = 0L;
        int fileCount = 0;
        int entryCount = 0;

        try (ZipInputStream zip = new ZipInputStream(new FileInputStream(archiveFile))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                entryCount++;
                if (entryCount > MAX_ARCHIVE_ENTRY_COUNT) {
                    throw new IOException("archive_too_many_entries");
                }
                String name = entry.getName();
                validateArchiveEntryName(name, entry.isDirectory());
                if (!seen.add(name)) {
                    throw new IOException("archive_duplicate_entry");
                }
                if (entry.isDirectory()) {
                    zip.closeEntry();
                    continue;
                }

                FileSpec spec = manifest.filesByPath.get(name);
                if (spec == null) {
                    throw new IOException("archive_undeclared_file");
                }
                fileCount++;
                if (fileCount > MAX_FILE_COUNT) {
                    throw new IOException("archive_too_many_files");
                }

                File outputFile = new File(webDirectory, name);
                String outputPath = outputFile.getCanonicalPath();
                if (!outputPath.startsWith(rootPrefix)) {
                    throw new IOException("archive_path_escape");
                }
                File parent = outputFile.getParentFile();
                if (parent == null) {
                    throw new IOException("archive_missing_parent");
                }
                ensureDirectory(parent);

                MessageDigest digest = sha256Digest();
                long fileTotal = 0L;
                try (FileOutputStream output = new FileOutputStream(outputFile)) {
                    byte[] buffer = new byte[BUFFER_SIZE];
                    int count;
                    while ((count = zip.read(buffer)) != -1) {
                        fileTotal += count;
                        uncompressedTotal += count;
                        if (fileTotal > spec.size
                                || fileTotal > MAX_SINGLE_FILE_BYTES
                                || uncompressedTotal > MAX_UNCOMPRESSED_BYTES) {
                            throw new IOException("archive_uncompressed_limit_exceeded");
                        }
                        digest.update(buffer, 0, count);
                        output.write(buffer, 0, count);
                    }
                    output.getFD().sync();
                }
                if (fileTotal != spec.size
                        || !constantTimeHexEquals(spec.sha256, digest.digest())) {
                    throw new GeneralSecurityException("file_digest_mismatch");
                }
                zip.closeEntry();
            }
        }

        if (fileCount != manifest.files.size()) {
            throw new IOException("archive_missing_declared_file");
        }
        for (FileSpec spec : manifest.files) {
            if (!seen.contains(spec.path)) {
                throw new IOException("archive_missing_declared_file");
            }
        }
    }

    static Manifest verifyAndParseManifest(
            byte[] manifestBytes,
            byte[] signatureBytes,
            PublicKey publicKey,
            Compatibility compatibility
    ) throws GeneralSecurityException, JSONException, URISyntaxException {
        if (manifestBytes == null
                || manifestBytes.length == 0
                || manifestBytes.length > MAX_MANIFEST_BYTES) {
            throw new GeneralSecurityException("manifest_size_invalid");
        }
        if (signatureBytes == null
                || signatureBytes.length == 0
                || signatureBytes.length > MAX_SIGNATURE_BYTES) {
            throw new GeneralSecurityException("signature_size_invalid");
        }
        verifyP256Signature(manifestBytes, signatureBytes, publicKey);

        JSONObject root = new JSONObject(new String(manifestBytes, StandardCharsets.UTF_8));
        requireExactKeys(root, TOP_LEVEL_KEYS);
        if (root.getInt("schema") != MANIFEST_SCHEMA) {
            throw new JSONException("unsupported_manifest_schema");
        }

        String channel = boundedToken(root.getString("channel"), 32, "channel");
        String applicationId = boundedToken(root.getString("applicationId"), 160, "applicationId");
        int bundleVersion = positiveInt(root, "bundleVersion");
        String releaseId = boundedToken(root.getString("releaseId"), 96, "releaseId");
        String appVersion = boundedToken(root.getString("appVersion"), 48, "appVersion");
        int minNativeVersionCode = positiveInt(root, "minNativeVersionCode");
        int requiredBridgeApi = positiveInt(root, "requiredBridgeApi");
        String entrypoint = validateFilePath(root.getString("entrypoint"));

        if (!compatibility.applicationId.equals(applicationId)) {
            throw new GeneralSecurityException("application_id_mismatch");
        }
        if (!compatibility.channel.equals(channel)) {
            throw new GeneralSecurityException("channel_mismatch");
        }
        if (bundleVersion <= compatibility.bundledBundleVersion) {
            throw new GeneralSecurityException("bundle_version_not_newer_than_apk");
        }
        if (minNativeVersionCode > compatibility.nativeVersionCode) {
            throw new GeneralSecurityException("native_version_too_old");
        }
        if (requiredBridgeApi > compatibility.nativeBridgeApi) {
            throw new GeneralSecurityException("bridge_api_too_old");
        }

        JSONObject archive = root.getJSONObject("archive");
        requireExactKeys(archive, ARCHIVE_KEYS);
        URI archiveUri = new URI(archive.getString("url"));
        validatePinnedHttpsUri(archiveUri, compatibility.updateHost);
        long archiveSize = boundedPositiveLong(
                archive.getLong("size"),
                MAX_ARCHIVE_BYTES,
                "archive_size"
        );
        String archiveSha256 = normalizedSha256(archive.getString("sha256"));

        JSONArray fileArray = root.getJSONArray("files");
        if (fileArray.length() == 0 || fileArray.length() > MAX_FILE_COUNT) {
            throw new JSONException("file_count_invalid");
        }
        List<FileSpec> files = new ArrayList<>();
        Set<String> paths = new HashSet<>();
        long declaredTotal = 0L;
        for (int index = 0; index < fileArray.length(); index++) {
            JSONObject file = fileArray.getJSONObject(index);
            requireExactKeys(file, FILE_KEYS);
            String path = validateFilePath(file.getString("path"));
            if (!paths.add(path)) {
                throw new JSONException("duplicate_file_path");
            }
            long size = boundedNonNegativeLong(
                    file.getLong("size"),
                    MAX_SINGLE_FILE_BYTES,
                    "file_size"
            );
            declaredTotal += size;
            if (declaredTotal > MAX_UNCOMPRESSED_BYTES) {
                throw new JSONException("declared_uncompressed_size_too_large");
            }
            files.add(new FileSpec(path, size, normalizedSha256(file.getString("sha256"))));
        }
        if (!paths.contains(entrypoint)
                || !paths.contains("config.js")
                || !paths.contains("app.js")) {
            throw new JSONException("required_web_file_missing");
        }

        return new Manifest(
                channel,
                applicationId,
                bundleVersion,
                releaseId,
                appVersion,
                minNativeVersionCode,
                requiredBridgeApi,
                entrypoint,
                archiveUri,
                archiveSize,
                archiveSha256,
                files
        );
    }

    static PublicKey decodeP256PublicKey(byte[] encoded) throws GeneralSecurityException {
        PublicKey key = KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(encoded));
        if (!(key instanceof ECPublicKey)) {
            throw new GeneralSecurityException("update_key_is_not_ec");
        }
        ECParameterSpec actual = ((ECPublicKey) key).getParams();
        AlgorithmParameters algorithmParameters = AlgorithmParameters.getInstance("EC");
        algorithmParameters.init(new ECGenParameterSpec("secp256r1"));
        ECParameterSpec expected = algorithmParameters.getParameterSpec(ECParameterSpec.class);
        if (!sameCurve(actual, expected)) {
            throw new GeneralSecurityException("update_key_is_not_p256");
        }
        return key;
    }

    private static void verifyP256Signature(byte[] content, byte[] detachedSignature, PublicKey key)
            throws GeneralSecurityException {
        if (!(key instanceof ECPublicKey)) {
            throw new GeneralSecurityException("update_key_is_not_ec");
        }
        Signature verifier = Signature.getInstance("SHA256withECDSA");
        verifier.initVerify(key);
        verifier.update(content);
        if (!verifier.verify(detachedSignature)) {
            throw new GeneralSecurityException("manifest_signature_invalid");
        }
    }

    private static boolean sameCurve(ECParameterSpec left, ECParameterSpec right) {
        if (left == null || right == null
                || !(left.getCurve().getField() instanceof ECFieldFp)
                || !(right.getCurve().getField() instanceof ECFieldFp)) {
            return false;
        }
        ECFieldFp leftField = (ECFieldFp) left.getCurve().getField();
        ECFieldFp rightField = (ECFieldFp) right.getCurve().getField();
        return leftField.getP().equals(rightField.getP())
                && left.getCurve().getA().equals(right.getCurve().getA())
                && left.getCurve().getB().equals(right.getCurve().getB())
                && left.getGenerator().equals(right.getGenerator())
                && left.getOrder().equals(right.getOrder())
                && left.getCofactor() == right.getCofactor();
    }

    private static HttpURLConnection openHttpsConnection(URI uri) throws IOException {
        URL url = uri.toURL();
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setInstanceFollowRedirects(false);
        connection.setConnectTimeout(CONNECT_TIMEOUT_MILLIS);
        connection.setReadTimeout(READ_TIMEOUT_MILLIS);
        connection.setUseCaches(false);
        connection.setRequestProperty("Accept-Encoding", "identity");
        connection.setRequestProperty("Cache-Control", "no-cache");
        connection.setRequestProperty("Pragma", "no-cache");
        return connection;
    }

    private static byte[] fetchBytes(URI uri, long maximum) throws IOException {
        HttpURLConnection connection = openHttpsConnection(uri);
        try {
            int status = connection.getResponseCode();
            if (status != HttpURLConnection.HTTP_OK) {
                throw new IOException("metadata_http_" + status);
            }
            long contentLength = connection.getContentLengthLong();
            if (contentLength > maximum) {
                throw new IOException("metadata_too_large");
            }
            return readBounded(connection.getInputStream(), maximum);
        } finally {
            connection.disconnect();
        }
    }

    private static URI parseConfiguredManifestUri(String value) {
        String candidate = value == null ? "" : value.trim();
        if (candidate.isEmpty()) {
            return null;
        }
        try {
            URI uri = new URI(candidate);
            validatePinnedHttpsUri(uri, normalizedHost(uri));
            if (!uri.getPath().endsWith("/manifest.json")) {
                throw new IllegalArgumentException("manifest_path_invalid");
            }
            return uri;
        } catch (URISyntaxException | GeneralSecurityException exception) {
            throw new IllegalArgumentException("WEB_BUNDLE_MANIFEST_URL is invalid", exception);
        }
    }

    private static void validatePinnedHttpsUri(URI uri, String expectedHost)
            throws GeneralSecurityException {
        if (uri == null
                || !uri.isAbsolute()
                || !"https".equalsIgnoreCase(uri.getScheme())
                || uri.getHost() == null
                || uri.getUserInfo() != null
                || uri.getPort() != -1
                || uri.getFragment() != null
                || uri.getRawPath() == null
                || uri.getRawPath().isEmpty()
                || !normalizedHost(uri).equals(expectedHost)) {
            throw new GeneralSecurityException("update_url_not_allowed");
        }
    }

    private static String normalizedHost(URI uri) {
        String host = uri == null ? null : uri.getHost();
        return host == null ? "" : host.toLowerCase(Locale.ROOT);
    }

    private static void validateArchiveEntryName(String name, boolean directory) throws IOException {
        if (name == null || name.isEmpty() || name.length() > MAX_PATH_LENGTH) {
            throw new IOException("archive_path_invalid");
        }
        String candidate = directory && name.endsWith("/")
                ? name.substring(0, name.length() - 1)
                : name;
        if (candidate.isEmpty()
                || candidate.startsWith("/")
                || candidate.startsWith("\\")
                || candidate.contains("\\")
                || candidate.contains("//")
                || candidate.matches("^[A-Za-z]:.*")) {
            throw new IOException("archive_path_invalid");
        }
        for (String segment : candidate.split("/", -1)) {
            if (segment.isEmpty() || ".".equals(segment) || "..".equals(segment)) {
                throw new IOException("archive_path_invalid");
            }
        }
        try {
            validateFilePath(candidate);
        } catch (JSONException exception) {
            throw new IOException("archive_path_invalid", exception);
        }
    }

    private static String validateFilePath(String value) throws JSONException {
        String path = value == null ? "" : value;
        if (path.isEmpty()
                || path.length() > MAX_PATH_LENGTH
                || path.startsWith("/")
                || path.startsWith("\\")
                || path.endsWith("/")
                || path.contains("\\")
                || path.contains("//")
                || path.matches("^[A-Za-z]:.*")) {
            throw new JSONException("file_path_invalid");
        }
        for (String segment : path.split("/", -1)) {
            if (segment.isEmpty()
                    || ".".equals(segment)
                    || "..".equals(segment)
                    || segment.length() > 128
                    || !segment.matches("^[A-Za-z0-9._~-]+$")) {
                throw new JSONException("file_path_invalid");
            }
            for (int index = 0; index < segment.length(); index++) {
                char character = segment.charAt(index);
                if (Character.isISOControl(character) || character == ':') {
                    throw new JSONException("file_path_invalid");
                }
            }
        }
        return path;
    }

    private static int positiveInt(JSONObject object, String key) throws JSONException {
        long value = object.getLong(key);
        if (value <= 0L || value > Integer.MAX_VALUE) {
            throw new JSONException(key + "_invalid");
        }
        return (int) value;
    }

    private static long boundedPositiveLong(long value, long maximum, String label)
            throws JSONException {
        if (value <= 0L || value > maximum) {
            throw new JSONException(label + "_invalid");
        }
        return value;
    }

    private static long boundedNonNegativeLong(long value, long maximum, String label)
            throws JSONException {
        if (value < 0L || value > maximum) {
            throw new JSONException(label + "_invalid");
        }
        return value;
    }

    private static String boundedToken(String value, int maximum, String label)
            throws JSONException {
        String token = value == null ? "" : value.trim();
        if (token.isEmpty() || token.length() > maximum) {
            throw new JSONException(label + "_invalid");
        }
        for (int index = 0; index < token.length(); index++) {
            if (Character.isISOControl(token.charAt(index))) {
                throw new JSONException(label + "_invalid");
            }
        }
        return token;
    }

    private static String normalizedSha256(String value) throws JSONException {
        String digest = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if (!digest.matches("^[0-9a-f]{64}$")) {
            throw new JSONException("sha256_invalid");
        }
        return digest;
    }

    private static void requireExactKeys(JSONObject object, Set<String> expected)
            throws JSONException {
        Set<String> actual = new HashSet<>();
        for (java.util.Iterator<String> keys = object.keys(); keys.hasNext(); ) {
            actual.add(keys.next());
        }
        if (!actual.equals(expected)) {
            throw new JSONException("manifest_keys_invalid");
        }
    }

    private static Set<String> immutableSet(String... values) {
        return Collections.unmodifiableSet(new HashSet<>(Arrays.asList(values)));
    }

    private static MessageDigest sha256Digest() throws GeneralSecurityException {
        return MessageDigest.getInstance("SHA-256");
    }

    private static byte[] sha256File(File file) throws IOException, GeneralSecurityException {
        MessageDigest digest = sha256Digest();
        try (InputStream input = new FileInputStream(file)) {
            byte[] buffer = new byte[BUFFER_SIZE];
            int count;
            while ((count = input.read(buffer)) != -1) {
                digest.update(buffer, 0, count);
            }
        }
        return digest.digest();
    }

    private static boolean constantTimeHexEquals(String expectedHex, byte[] actualBytes) {
        byte[] expectedBytes = decodeHex(expectedHex);
        return expectedBytes != null && MessageDigest.isEqual(expectedBytes, actualBytes);
    }

    private static byte[] decodeHex(String value) {
        if (value == null || value.length() != 64) {
            return null;
        }
        byte[] decoded = new byte[value.length() / 2];
        for (int index = 0; index < value.length(); index += 2) {
            int high = Character.digit(value.charAt(index), 16);
            int low = Character.digit(value.charAt(index + 1), 16);
            if (high < 0 || low < 0) {
                return null;
            }
            decoded[index / 2] = (byte) ((high << 4) | low);
        }
        return decoded;
    }

    private static byte[] readFileBounded(File file, long maximum) throws IOException {
        if (!file.isFile() || file.length() <= 0L || file.length() > maximum) {
            throw new IOException("stored_metadata_invalid");
        }
        try (InputStream input = new FileInputStream(file)) {
            return readBounded(input, maximum);
        }
    }

    private static byte[] readBounded(InputStream input, long maximum) throws IOException {
        try (InputStream source = input;
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            long total = 0L;
            int count;
            while ((count = source.read(buffer)) != -1) {
                total += count;
                if (total > maximum) {
                    throw new IOException("input_too_large");
                }
                output.write(buffer, 0, count);
            }
            return output.toByteArray();
        }
    }

    private static void writeSynced(File file, byte[] content) throws IOException {
        try (FileOutputStream output = new FileOutputStream(file)) {
            output.write(content);
            output.getFD().sync();
        }
    }

    private static void ensureDirectory(File directory) throws IOException {
        if (!directory.isDirectory() && !directory.mkdirs() && !directory.isDirectory()) {
            throw new IOException("directory_create_failed");
        }
    }

    private void ensurePrivateDirectory(File directory) throws IOException {
        String managerPath = managerRoot.getCanonicalPath();
        String directoryPath = directory.getCanonicalPath();
        if (!directoryPath.equals(managerPath)
                && !directoryPath.startsWith(managerPath + File.separator)) {
            throw new IOException("private_directory_escape");
        }
        ensureDirectory(directory);
    }

    private void deletePrivateTree(File target) {
        if (target == null || !target.exists()) {
            return;
        }
        try {
            String managerPath = managerRoot.getCanonicalPath();
            String targetPath = target.getCanonicalPath();
            if (targetPath.equals(managerPath)
                    || !targetPath.startsWith(managerPath + File.separator)) {
                return;
            }
            if (target.isDirectory()) {
                File[] children = target.listFiles();
                if (children != null) {
                    for (File child : children) {
                        deletePrivateTree(child);
                    }
                }
            }
            if (!target.delete() && target.exists()) {
                Log.i(TAG, "Could not remove temporary web bundle path");
            }
        } catch (IOException ignored) {
            // A failed cleanup is harmless: staging paths are never mounted in the WebView.
        }
    }

    private boolean isQuarantined(int bundleVersion) {
        return preferences.getStringSet(KEY_QUARANTINED_VERSIONS, Collections.emptySet())
                .contains(String.valueOf(bundleVersion));
    }

    private void quarantineVersion(int bundleVersion) {
        Set<String> quarantined = new HashSet<>(preferences.getStringSet(
                KEY_QUARANTINED_VERSIONS,
                Collections.emptySet()
        ));
        quarantined.add(String.valueOf(bundleVersion));
        preferences.edit().putStringSet(KEY_QUARANTINED_VERSIONS, quarantined).commit();
    }

    private static String safeReason(Exception exception) {
        String message = exception.getMessage();
        if (message == null || message.trim().isEmpty()) {
            return exception.getClass().getSimpleName();
        }
        String clean = message.replaceAll("[\\p{Cntrl}]", "");
        return clean.substring(0, Math.min(clean.length(), 160));
    }

    @Override
    public void close() {
        closed = true;
        executor.shutdownNow();
    }
}
