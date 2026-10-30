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

    /** Tells the page that this build can share the bear-reader video (2.4.24). */
    @JavascriptInterface
    public boolean supportsVideo() {
        return true;
    }

    /** Shares a PNG, PDF or MP4/WebM file rendered by the page (base64 bytes). */
    @JavascriptInterface
    public void shareFile(String base64, String mimeType, String fileName) {
        activity.runOnUiThread(() -> activity.openFileShareSheetFromWeb(base64, mimeType, fileName));
    }
}
