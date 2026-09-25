package com.franceisl.glowletternext;

import android.webkit.JavascriptInterface;

/**
 * Token-free OAuth surface. URL validation and trusted-main-document checks stay in the Activity.
 */
public final class AuthBridge {
    private final MainActivity activity;

    AuthBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public String getRedirectUrl() {
        return AuthUrlPolicy.CALLBACK_URL;
    }

    @JavascriptInterface
    public void openAuthorizeUrl(String url) {
        activity.runOnUiThread(() -> activity.openAuthorizeUrlFromWeb(url));
    }

    /**
     * «Продолжить с Google» аккаунтом телефона. The page passes only the SHA-256
     * of its nonce; the ID token comes back solely to the trusted main document.
     */
    @JavascriptInterface
    public void signInWithGoogle(String hashedNonce, boolean automatic) {
        activity.runOnUiThread(() -> activity.startGoogleSignInFromWeb(hashedNonce, automatic));
    }
}
