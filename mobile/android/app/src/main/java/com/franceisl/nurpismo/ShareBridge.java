package com.franceisl.glowletternext;

import android.webkit.JavascriptInterface;

/** Opens the Android system share sheet from the bundled trusted page. */
public final class ShareBridge {
    private final MainActivity activity;

    ShareBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public void share(String title, String text, String url) {
        activity.runOnUiThread(() -> activity.openShareSheetFromWeb(title, text, url));
    }
}
