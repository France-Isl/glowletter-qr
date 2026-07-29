package com.franceisl.glowletternext;

import android.webkit.JavascriptInterface;

/** Uses Android's system text-to-speech engine for the bundled trusted page. */
public final class SpeechBridge {
    private final MainActivity activity;

    SpeechBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public void speak(String text, String language) {
        activity.runOnUiThread(() -> activity.speakTextFromWeb(text, language));
    }

    @JavascriptInterface
    public void stop() {
        activity.runOnUiThread(activity::stopSpeechFromWeb);
    }
}
