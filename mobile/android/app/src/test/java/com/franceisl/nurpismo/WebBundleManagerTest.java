package com.franceisl.glowletternext;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThrows;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.Signature;
import java.security.spec.ECGenParameterSpec;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public final class WebBundleManagerTest {
    private static final String APPLICATION_ID = "com.franceisl.glowletternext";
    private static final String UPDATE_HOST = "bezam.org";

    @Rule
    public final TemporaryFolder temporaryFolder = new TemporaryFolder();

    @Test
    public void acceptsExactP256SignedManifest() throws Exception {
        KeyPair keyPair = p256KeyPair();
        byte[] archive = new byte[]{1, 2, 3, 4};
        byte[] manifest = manifestBytes(archive, 29, 15, 1, UPDATE_HOST, validWebFiles());
        byte[] signature = sign(manifest, keyPair);

        WebBundleManager.Manifest parsed = WebBundleManager.verifyAndParseManifest(
                manifest,
                signature,
                WebBundleManager.decodeP256PublicKey(keyPair.getPublic().getEncoded()),
                compatibility()
        );

        assertEquals(29, parsed.bundleVersion);
        assertEquals("2.4.0", parsed.appVersion);
        assertEquals(3, parsed.files.size());
        assertEquals("index.html", parsed.entrypoint);
    }

    @Test
    public void rejectsAnyManifestMutationAfterSigning() throws Exception {
        KeyPair keyPair = p256KeyPair();
        byte[] archive = new byte[]{1, 2, 3, 4};
        byte[] manifest = manifestBytes(archive, 29, 15, 1, UPDATE_HOST, validWebFiles());
        byte[] signature = sign(manifest, keyPair);
        byte[] changed = manifest.clone();
        changed[changed.length - 1] ^= 1;

        assertThrows(GeneralSecurityException.class, () ->
                WebBundleManager.verifyAndParseManifest(
                        changed,
                        signature,
                        keyPair.getPublic(),
                        compatibility()
                )
        );
    }

    @Test
    public void rejectsManifestForNewerBridgeOrDifferentHost() throws Exception {
        KeyPair keyPair = p256KeyPair();
        byte[] archive = new byte[]{1, 2, 3, 4};
        byte[] newerBridge = manifestBytes(
                archive,
                29,
                15,
                2,
                UPDATE_HOST,
                validWebFiles()
        );
        assertThrows(GeneralSecurityException.class, () ->
                WebBundleManager.verifyAndParseManifest(
                        newerBridge,
                        sign(newerBridge, keyPair),
                        keyPair.getPublic(),
                        compatibility()
                )
        );

        byte[] wrongHost = manifestBytes(
                archive,
                29,
                15,
                1,
                "example.com",
                validWebFiles()
        );
        assertThrows(GeneralSecurityException.class, () ->
                WebBundleManager.verifyAndParseManifest(
                        wrongHost,
                        sign(wrongHost, keyPair),
                        keyPair.getPublic(),
                        compatibility()
                )
        );
    }

    @Test
    public void rejectsNonP256UpdateKey() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(new ECGenParameterSpec("secp384r1"));
        KeyPair keyPair = generator.generateKeyPair();

        assertThrows(GeneralSecurityException.class, () ->
                WebBundleManager.decodeP256PublicKey(keyPair.getPublic().getEncoded())
        );
    }

    @Test
    public void extractsOnlyCompleteHashVerifiedArchive() throws Exception {
        Map<String, byte[]> files = validWebFiles();
        byte[] archive = zip(files);
        File archiveFile = temporaryFolder.newFile("bundle.zip");
        write(archiveFile, archive);
        File webDirectory = temporaryFolder.newFolder("verified-web");

        WebBundleManager.Manifest manifest = directManifest(archive, files);
        WebBundleManager.extractVerifiedArchive(archiveFile, webDirectory, manifest);

        for (Map.Entry<String, byte[]> entry : files.entrySet()) {
            assertArrayEquals(
                    entry.getValue(),
                    java.nio.file.Files.readAllBytes(new File(webDirectory, entry.getKey()).toPath())
            );
        }
    }

    @Test
    public void rejectsZipSlipAndNeverWritesOutsideStaging() throws Exception {
        Map<String, byte[]> files = validWebFiles();
        Map<String, byte[]> malicious = new LinkedHashMap<>(files);
        malicious.put("../escape.txt", "owned".getBytes(StandardCharsets.UTF_8));
        byte[] archive = zip(malicious);
        File archiveFile = temporaryFolder.newFile("malicious.zip");
        write(archiveFile, archive);
        File webDirectory = temporaryFolder.newFolder("staging-web");
        WebBundleManager.Manifest manifest = directManifest(archive, files);

        assertThrows(IOException.class, () ->
                WebBundleManager.extractVerifiedArchive(archiveFile, webDirectory, manifest)
        );
        assertFalse(new File(webDirectory.getParentFile(), "escape.txt").exists());
    }

    @Test
    public void rejectsCorruptFileEvenWhenZipContainerHashIsExpected() throws Exception {
        Map<String, byte[]> files = validWebFiles();
        Map<String, byte[]> changedFiles = new LinkedHashMap<>(files);
        changedFiles.put("app.js", "window.changed=true;".getBytes(StandardCharsets.UTF_8));
        byte[] changedArchive = zip(changedFiles);
        File archiveFile = temporaryFolder.newFile("changed.zip");
        write(archiveFile, changedArchive);
        File webDirectory = temporaryFolder.newFolder("changed-web");

        WebBundleManager.Manifest containerValidButFilesWrong = directManifest(
                changedArchive,
                files
        );
        assertThrows(GeneralSecurityException.class, () ->
                WebBundleManager.extractVerifiedArchive(
                        archiveFile,
                        webDirectory,
                        containerValidButFilesWrong
                )
        );
    }

    @Test
    public void rejectsUnsafeDeclaredPathBeforeDownload() throws Exception {
        KeyPair keyPair = p256KeyPair();
        byte[] archive = new byte[]{1, 2, 3};
        Map<String, byte[]> unsafeFiles = validWebFiles();
        unsafeFiles.remove("index.html");
        unsafeFiles.put("../index.html", new byte[0]);
        byte[] manifest = manifestBytes(archive, 29, 15, 1, UPDATE_HOST, unsafeFiles);

        assertThrows(Exception.class, () ->
                WebBundleManager.verifyAndParseManifest(
                        manifest,
                        sign(manifest, keyPair),
                        keyPair.getPublic(),
                        compatibility()
                )
        );
    }

    @Test
    public void rejectsOversizedDeclaredFileBeforeDownload() throws Exception {
        KeyPair keyPair = p256KeyPair();
        byte[] archive = new byte[]{1, 2, 3};
        JSONObject root = new JSONObject(new String(
                manifestBytes(archive, 29, 15, 1, UPDATE_HOST, validWebFiles()),
                StandardCharsets.UTF_8
        ));
        root.getJSONArray("files")
                .getJSONObject(0)
                .put("size", WebBundleManager.MAX_SINGLE_FILE_BYTES + 1L);
        byte[] manifest = root.toString().getBytes(StandardCharsets.UTF_8);

        assertThrows(org.json.JSONException.class, () ->
                WebBundleManager.verifyAndParseManifest(
                        manifest,
                        sign(manifest, keyPair),
                        keyPair.getPublic(),
                        compatibility()
                )
        );
    }

    private static WebBundleManager.Compatibility compatibility() {
        return new WebBundleManager.Compatibility(
                APPLICATION_ID,
                "stable",
                15,
                1,
                28,
                UPDATE_HOST
        );
    }

    private static KeyPair p256KeyPair() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(new ECGenParameterSpec("secp256r1"));
        return generator.generateKeyPair();
    }

    private static byte[] sign(byte[] content, KeyPair keyPair) throws Exception {
        Signature signature = Signature.getInstance("SHA256withECDSA");
        signature.initSign(keyPair.getPrivate());
        signature.update(content);
        return signature.sign();
    }

    private static byte[] manifestBytes(
            byte[] archive,
            int bundleVersion,
            int minNativeVersion,
            int bridgeApi,
            String archiveHost,
            Map<String, byte[]> files
    ) throws Exception {
        JSONObject root = new JSONObject();
        root.put("schema", 1);
        root.put("channel", "stable");
        root.put("applicationId", APPLICATION_ID);
        root.put("bundleVersion", bundleVersion);
        root.put("releaseId", "web-test-" + bundleVersion);
        root.put("appVersion", "2.4.0");
        root.put("minNativeVersionCode", minNativeVersion);
        root.put("requiredBridgeApi", bridgeApi);
        root.put("entrypoint", "index.html");
        root.put("archive", new JSONObject()
                .put("url", "https://" + archiveHost + "/glowletter/mobile-web/29/bundle.zip")
                .put("size", archive.length)
                .put("sha256", hex(sha256(archive))));
        JSONArray fileArray = new JSONArray();
        for (Map.Entry<String, byte[]> entry : files.entrySet()) {
            fileArray.put(new JSONObject()
                    .put("path", entry.getKey())
                    .put("size", entry.getValue().length)
                    .put("sha256", hex(sha256(entry.getValue()))));
        }
        root.put("files", fileArray);
        return root.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static WebBundleManager.Manifest directManifest(
            byte[] archive,
            Map<String, byte[]> declaredFiles
    ) throws Exception {
        List<WebBundleManager.FileSpec> files = new ArrayList<>();
        for (Map.Entry<String, byte[]> entry : declaredFiles.entrySet()) {
            files.add(new WebBundleManager.FileSpec(
                    entry.getKey(),
                    entry.getValue().length,
                    hex(sha256(entry.getValue()))
            ));
        }
        return new WebBundleManager.Manifest(
                "stable",
                APPLICATION_ID,
                29,
                "web-test-29",
                "2.4.0",
                15,
                1,
                "index.html",
                new URI("https://" + UPDATE_HOST + "/glowletter/mobile-web/29/bundle.zip"),
                archive.length,
                hex(sha256(archive)),
                files
        );
    }

    private static Map<String, byte[]> validWebFiles() {
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("index.html", "<!doctype html><div id=app></div>".getBytes(StandardCharsets.UTF_8));
        files.put("config.js", "window.NUR_APP_CONFIG={appVersion:'2.4.0'};".getBytes(StandardCharsets.UTF_8));
        files.put("app.js", "window.onNativeEntitlement=function(){};".getBytes(StandardCharsets.UTF_8));
        return files;
    }

    private static byte[] zip(Map<String, byte[]> files) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(output)) {
            for (Map.Entry<String, byte[]> file : files.entrySet()) {
                zip.putNextEntry(new ZipEntry(file.getKey()));
                zip.write(file.getValue());
                zip.closeEntry();
            }
        }
        return output.toByteArray();
    }

    private static void write(File file, byte[] content) throws IOException {
        try (FileOutputStream output = new FileOutputStream(file)) {
            output.write(content);
        }
    }

    private static byte[] sha256(byte[] content) throws Exception {
        return MessageDigest.getInstance("SHA-256").digest(content);
    }

    private static String hex(byte[] content) {
        StringBuilder result = new StringBuilder(content.length * 2);
        for (byte value : content) {
            result.append(String.format("%02x", value & 0xff));
        }
        return result.toString();
    }
}
