package com.franceisl.glowletternext;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.UUID;

/**
 * Derives the Play Billing account binding from the subject in a Supabase access token.
 *
 * <p>The client-side JWT payload is not an authorization decision. The verification backend
 * must validate the token with Supabase Auth, derive auth.uid() independently, and compare the
 * expected binding with Google Play's externalAccountIdentifiers value.</p>
 */
final class SupabaseSessionBinding {
    static final String ACCOUNT_BINDING_DOMAIN = "glowletter/play-account/v1\n";
    private static final int MAX_ACCESS_TOKEN_CHARS = 16 * 1024;
    private static final char[] BASE64_URL_ALPHABET =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".toCharArray();

    static final class Session {
        final String accessToken;
        final String obfuscatedAccountId;

        Session(String accessToken, String obfuscatedAccountId) {
            this.accessToken = accessToken;
            this.obfuscatedAccountId = obfuscatedAccountId;
        }
    }

    private SupabaseSessionBinding() {
    }

    static Session fromAccessToken(String rawToken) {
        String token = rawToken == null ? "" : rawToken.trim();
        if (token.isEmpty() || token.length() > MAX_ACCESS_TOKEN_CHARS) {
            return null;
        }
        int firstDot = token.indexOf('.');
        int secondDot = firstDot < 0 ? -1 : token.indexOf('.', firstDot + 1);
        if (firstDot <= 0
                || secondDot <= firstDot + 1
                || secondDot >= token.length() - 1
                || token.indexOf('.', secondDot + 1) >= 0) {
            return null;
        }

        try {
            String payloadSegment = token.substring(firstDot + 1, secondDot);
            String payloadText = new String(
                    decodeBase64Url(payloadSegment),
                    StandardCharsets.UTF_8
            );
            String subject = new JSONObject(payloadText).optString("sub", "").trim();
            String canonicalUserId = canonicalUuid(subject);
            if (canonicalUserId == null) {
                return null;
            }
            return new Session(token, accountBindingForUserId(canonicalUserId));
        } catch (Exception ignored) {
            // Never log a bearer token or its payload.
            return null;
        }
    }

    static String accountBindingForUserId(String userId) throws Exception {
        String canonicalUserId = canonicalUuid(userId);
        if (canonicalUserId == null) {
            throw new IllegalArgumentException("user_id_must_be_canonical_uuid");
        }
        byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest((ACCOUNT_BINDING_DOMAIN + canonicalUserId)
                        .getBytes(StandardCharsets.UTF_8));
        return encodeBase64UrlNoPadding(digest);
    }

    private static String canonicalUuid(String value) {
        if (value == null) {
            return null;
        }
        String candidate = value.trim().toLowerCase(Locale.ROOT);
        if (candidate.length() != 36) {
            return null;
        }
        try {
            String canonical = UUID.fromString(candidate).toString();
            return canonical.equals(candidate) ? canonical : null;
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private static byte[] decodeBase64Url(String value) {
        if (value == null || value.isEmpty() || value.length() % 4 == 1) {
            throw new IllegalArgumentException("invalid_base64url");
        }
        ByteArrayOutputStream output = new ByteArrayOutputStream((value.length() * 3) / 4);
        int accumulator = 0;
        int bits = 0;
        for (int index = 0; index < value.length(); index += 1) {
            int decoded = decodeBase64UrlCharacter(value.charAt(index));
            if (decoded < 0) {
                throw new IllegalArgumentException("invalid_base64url");
            }
            accumulator = (accumulator << 6) | decoded;
            bits += 6;
            if (bits >= 8) {
                bits -= 8;
                output.write((accumulator >> bits) & 0xff);
                accumulator &= bits == 0 ? 0 : (1 << bits) - 1;
            }
        }
        if (bits > 0 && accumulator != 0) {
            throw new IllegalArgumentException("non_canonical_base64url");
        }
        return output.toByteArray();
    }

    private static int decodeBase64UrlCharacter(char value) {
        if (value >= 'A' && value <= 'Z') return value - 'A';
        if (value >= 'a' && value <= 'z') return value - 'a' + 26;
        if (value >= '0' && value <= '9') return value - '0' + 52;
        if (value == '-') return 62;
        if (value == '_') return 63;
        return -1;
    }

    private static String encodeBase64UrlNoPadding(byte[] input) {
        StringBuilder encoded = new StringBuilder((input.length * 4 + 2) / 3);
        int accumulator = 0;
        int bits = 0;
        for (byte item : input) {
            accumulator = (accumulator << 8) | (item & 0xff);
            bits += 8;
            while (bits >= 6) {
                bits -= 6;
                encoded.append(BASE64_URL_ALPHABET[(accumulator >> bits) & 0x3f]);
                accumulator &= bits == 0 ? 0 : (1 << bits) - 1;
            }
        }
        if (bits > 0) {
            encoded.append(BASE64_URL_ALPHABET[(accumulator << (6 - bits)) & 0x3f]);
        }
        return encoded.toString();
    }
}
