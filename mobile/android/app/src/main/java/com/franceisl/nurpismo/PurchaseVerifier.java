package com.franceisl.glowletternext;

import android.os.Handler;
import android.os.Looper;
import android.util.Base64;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.Purchase;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.net.ssl.HttpsURLConnection;

/**
 * Production verification hook. The app never embeds Play Console credentials.
 * A trusted backend must validate the purchase token with Google Play and
 * acknowledge the expected product before returning an entitlement.
 */
final class PurchaseVerifier {
    interface Callback {
        void onResult(Result result);
    }

    static final class Result {
        final boolean verified;
        final boolean acknowledged;
        final boolean integrityVerified;
        final boolean authoritativeRejection;
        final long expiryTimeMillis;
        final long serverTimeMillis;
        final String reason;

        Result(
                boolean verified,
                boolean acknowledged,
                boolean integrityVerified,
                boolean authoritativeRejection,
                long expiryTimeMillis,
                long serverTimeMillis,
                String reason
        ) {
            this.verified = verified;
            this.acknowledged = acknowledged;
            this.integrityVerified = integrityVerified;
            this.authoritativeRejection = authoritativeRejection;
            this.expiryTimeMillis = expiryTimeMillis;
            this.serverTimeMillis = serverTimeMillis;
            this.reason = reason;
        }

        static Result failure(String reason) {
            return new Result(false, false, false, false, 0L, 0L, reason);
        }

        static Result rejection(String reason) {
            return new Result(false, false, false, true, 0L, 0L, reason);
        }
    }

    static final class AuthUpdate {
        final boolean authenticated;
        final boolean identityChanged;
        final boolean tokenChanged;

        AuthUpdate(boolean authenticated, boolean identityChanged, boolean tokenChanged) {
            this.authenticated = authenticated;
            this.identityChanged = identityChanged;
            this.tokenChanged = tokenChanged;
        }
    }

    private final String endpoint;
    private final PlayIntegrityProvider integrityProvider;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final AtomicBoolean closed = new AtomicBoolean(false);
    private volatile SupabaseSessionBinding.Session authSession;

    PurchaseVerifier(String endpoint, PlayIntegrityProvider integrityProvider) {
        this.endpoint = endpoint == null ? "" : endpoint.trim();
        this.integrityProvider = integrityProvider;
    }

    boolean isConfigured() {
        try {
            URL url = new URL(endpoint);
            return "https".equalsIgnoreCase(url.getProtocol())
                    && url.getHost() != null
                    && !url.getHost().trim().isEmpty();
        } catch (Exception ignored) {
            return false;
        }
    }

    synchronized AuthUpdate updateAccessToken(String accessToken) {
        SupabaseSessionBinding.Session previous = authSession;
        SupabaseSessionBinding.Session next = SupabaseSessionBinding.fromAccessToken(accessToken);
        String previousBinding = previous == null ? "" : previous.obfuscatedAccountId;
        String nextBinding = next == null ? "" : next.obfuscatedAccountId;
        String previousToken = previous == null ? "" : previous.accessToken;
        String nextToken = next == null ? "" : next.accessToken;
        boolean tokenChanged = !previousToken.equals(nextToken);
        // Keep the same object identity for duplicate session notifications so
        // an in-flight verification is not discarded without a replacement.
        authSession = tokenChanged ? next : previous;
        return new AuthUpdate(
                next != null,
                !previousBinding.equals(nextBinding),
                tokenChanged
        );
    }

    boolean hasAuthSession() {
        return authSession != null;
    }

    String obfuscatedAccountId() {
        SupabaseSessionBinding.Session session = authSession;
        return session == null ? "" : session.obfuscatedAccountId;
    }

    void verify(
            Purchase purchase,
            String expectedProductId,
            String expectedProductType,
            Callback callback
    ) {
        if (closed.get()) {
            return;
        }
        if (!isExpectedProduct(expectedProductId, expectedProductType)
                || purchase == null
                || !purchase.getProducts().contains(expectedProductId)) {
            callback.onResult(Result.rejection("verification_product_not_expected"));
            return;
        }
        if (!isConfigured()) {
            callback.onResult(Result.failure("verification_backend_not_configured"));
            return;
        }
        final SupabaseSessionBinding.Session session = authSession;
        if (session == null) {
            callback.onResult(Result.failure("authentication_required"));
            return;
        }

        final String requestHash;
        try {
            requestHash = requestHashFor(
                    expectedProductId,
                    expectedProductType,
                    purchase.getPurchaseToken()
            );
        } catch (Exception ignored) {
            callback.onResult(Result.failure("request_hash_failed"));
            return;
        }

        integrityProvider.requestToken(requestHash, (integrityToken, integrityError) -> {
            if (closed.get() || authSession != session) {
                return;
            }
            if (integrityToken == null || integrityToken.trim().isEmpty()) {
                callback.onResult(Result.failure(
                        integrityError == null ? "play_integrity_token_missing" : integrityError
                ));
                return;
            }
            try {
                executor.execute(() -> {
                    if (closed.get()) {
                        return;
                    }
                    Result result;
                    try {
                        result = verifyBlocking(
                                purchase,
                                expectedProductId,
                                expectedProductType,
                                requestHash,
                                integrityToken,
                                session
                        );
                    } catch (Exception ignored) {
                        // Never log or expose purchaseToken or Integrity token in an exception.
                        result = Result.failure("verification_network_error");
                    }
                    Result finalResult = result;
                    if (!closed.get() && authSession == session) {
                        mainHandler.post(() -> {
                            if (!closed.get() && authSession == session) {
                                callback.onResult(finalResult);
                            }
                        });
                    }
                });
            } catch (RejectedExecutionException ignored) {
                // Activity teardown won the race; no UI callback is valid now.
            }
        });
    }

    private Result verifyBlocking(
            Purchase purchase,
            String expectedProductId,
            String expectedProductType,
            String requestHash,
            String integrityToken,
            SupabaseSessionBinding.Session session
    ) throws Exception {
        JSONObject request = new JSONObject()
                .put("packageName", releasePackageName())
                .put("productId", expectedProductId)
                .put("productType", expectedProductType)
                .put("purchaseToken", purchase.getPurchaseToken())
                .put("purchaseState", purchase.getPurchaseState())
                .put("acknowledgedOnDevice", purchase.isAcknowledged())
                .put("appVersion", BuildConfig.VERSION_NAME)
                .put("requestHashVersion", "v2")
                .put("requestHash", requestHash)
                .put("integrityToken", integrityToken);

        HttpsURLConnection connection = (HttpsURLConnection) new URL(endpoint).openConnection();
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(10_000);
        connection.setReadTimeout(15_000);
        connection.setDoOutput(true);
        connection.setInstanceFollowRedirects(false);
        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("X-NurPismo-Client", "android");
        connection.setRequestProperty("Authorization", "Bearer " + session.accessToken);

        byte[] body = request.toString().getBytes(StandardCharsets.UTF_8);
        connection.setFixedLengthStreamingMode(body.length);
        try (OutputStream output = connection.getOutputStream()) {
            output.write(body);
        }

        int status = connection.getResponseCode();
        if (status < 200 || status >= 300) {
            connection.disconnect();
            String reason = "verification_rejected_" + status;
            return isAuthoritativeRejectionStatus(status)
                    ? Result.rejection(reason)
                    : Result.failure(reason);
        }

        String responseText;
        try (InputStream input = connection.getInputStream()) {
            responseText = readLimited(input, 64 * 1024);
        } finally {
            connection.disconnect();
        }

        JSONObject response = new JSONObject(responseText);
        boolean valid = response.optBoolean("valid", false);
        boolean acknowledged = response.optBoolean("acknowledged", false);
        boolean integrityVerified = response.optBoolean("integrityVerified", false);
        String responseProduct = response.optString("productId", "");
        String responseProductType = response.optString("productType", "");
        String responseRequestHash = response.optString("requestHash", "");
        String reason = response.optString("reason", valid ? "server_verified" : "server_rejected");

        if (!expectedProductId.equals(responseProduct)) {
            return Result.rejection("verification_product_mismatch");
        }
        if (!expectedProductType.equals(responseProductType)) {
            return Result.rejection("verification_product_type_mismatch");
        }
        if (!requestHash.equals(responseRequestHash)) {
            return Result.rejection("verification_request_hash_mismatch");
        }
        long expiryTimeMillis = 0L;
        long serverTimeMillis = 0L;
        if (valid && BillingClient.ProductType.SUBS.equals(expectedProductType)) {
            expiryTimeMillis = positiveLong(response, "expiryTimeMillis");
            serverTimeMillis = positiveLong(response, "serverTimeMillis");
            if (expiryTimeMillis <= serverTimeMillis || serverTimeMillis <= 0L) {
                return Result.rejection("verification_subscription_expired_or_missing_time");
            }
        }
        return new Result(
                valid,
                acknowledged,
                integrityVerified,
                !valid,
                expiryTimeMillis,
                serverTimeMillis,
                reason
        );
    }

    private static long positiveLong(JSONObject object, String key) {
        Object value = object.opt(key);
        if (value instanceof Number) {
            long parsed = ((Number) value).longValue();
            return parsed > 0L ? parsed : 0L;
        }
        if (value instanceof String) {
            try {
                long parsed = Long.parseLong(((String) value).trim());
                return parsed > 0L ? parsed : 0L;
            } catch (NumberFormatException ignored) {
                return 0L;
            }
        }
        return 0L;
    }

    static boolean isAuthoritativeRejectionStatus(int status) {
        return status == 400
                || status == 401
                || status == 403
                || status == 404
                || status == 410
                || status == 422;
    }

    static boolean isExpectedProduct(String productId, String productType) {
        return (BuildConfig.SUBSCRIPTION_PRODUCT_ID.equals(productId)
                && BillingClient.ProductType.SUBS.equals(productType))
                || (BuildConfig.LEGACY_FULL_ACCESS_PRODUCT_ID.equals(productId)
                && BillingClient.ProductType.INAPP.equals(productType));
    }

    /** Version v2 binds the Integrity request to the exact product and product type. */
    private static String requestHashFor(
            String productId,
            String productType,
            String purchaseToken
    ) throws Exception {
        String canonical = canonicalRequest(
                releasePackageName(),
                productId,
                productType,
                purchaseToken
        );
        byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(canonical.getBytes(StandardCharsets.UTF_8));
        return Base64.encodeToString(digest, Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
    }

    static String canonicalRequest(
            String packageName,
            String productId,
            String productType,
            String purchaseToken
    ) {
        return packageName
                + "\n" + productId
                + "\n" + productType
                + "\n" + purchaseToken;
    }

    private static String releasePackageName() {
        return BuildConfig.APPLICATION_ID.replaceFirst("\\.debug$", "");
    }

    private static String readLimited(InputStream input, int maxChars) throws Exception {
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            char[] buffer = new char[2048];
            int read;
            while ((read = reader.read(buffer)) != -1) {
                if (builder.length() + read > maxChars) {
                    throw new IllegalStateException("verification_response_too_large");
                }
                builder.append(buffer, 0, read);
            }
        }
        return builder.toString();
    }

    void close() {
        if (closed.compareAndSet(false, true)) {
            authSession = null;
            integrityProvider.close();
            mainHandler.removeCallbacksAndMessages(null);
            executor.shutdownNow();
        }
    }
}
