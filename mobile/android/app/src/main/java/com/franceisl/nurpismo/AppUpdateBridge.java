package com.franceisl.glowletternext;

import android.webkit.JavascriptInterface;

/** Lets the bundled trusted page start the Google Play update it was told about. */
public final class AppUpdateBridge {
    private final MainActivity activity;

    AppUpdateBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public void startUpdate() {
        activity.runOnUiThread(activity::startAppUpdateFromWeb);
    }

    @JavascriptInterface
    public void completeUpdate() {
        activity.runOnUiThread(activity::completeAppUpdateFromWeb);
    }
}
