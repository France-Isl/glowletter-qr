package com.franceisl.glowletternext;

import java.util.regex.Pattern;

/** Builds the fixed Google Play subscription-management URL without accepting web input. */
final class PlaySubscriptionLinks {
    private static final Pattern SAFE_IDENTIFIER = Pattern.compile("[A-Za-z0-9._]+$");

    private PlaySubscriptionLinks() {
    }

    static String manageSubscriptionUrl(String productId, String packageName) {
        if (!isSafeIdentifier(productId) || !isSafeIdentifier(packageName)) {
            throw new IllegalArgumentException("Unsafe Play subscription identifier");
        }
        return "https://play.google.com/store/account/subscriptions"
                + "?sku=" + productId
                + "&package=" + packageName;
    }

    private static boolean isSafeIdentifier(String value) {
        return value != null && SAFE_IDENTIFIER.matcher(value).matches();
    }
}
