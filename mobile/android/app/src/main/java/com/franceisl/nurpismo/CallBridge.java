package com.franceisl.glowletternext;

import android.content.Context;
import android.media.AudioManager;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;

/**
 * «Звонок в приложении» (call.js): пока идёт разговор, экран не гаснет,
 * звук идёт в режиме разговора (эхоподавление телефона) через громкую связь —
 * так удобнее одновременно играть, — а WebView не засыпает в onPause.
 */
public final class CallBridge {
    private final MainActivity activity;

    CallBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public boolean available() {
        return true;
    }

    @JavascriptInterface
    public void prepare() {
        // Разрешение на микрофон спрашивает сама страница через getUserMedia.
    }

    @JavascriptInterface
    public void setActive(boolean active) {
        activity.runOnUiThread(() -> apply(active));
    }

    @SuppressWarnings("deprecation")
    private void apply(boolean active) {
        activity.callActive = active;
        if (active) activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        else activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        AudioManager audio = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
        if (audio == null) return;
        try {
            audio.setMode(active ? AudioManager.MODE_IN_COMMUNICATION : AudioManager.MODE_NORMAL);
            audio.setSpeakerphoneOn(active);
        } catch (RuntimeException ignored) {
            // Некоторые прошивки не дают менять режим звука — разговор всё равно идёт.
        }
    }
}
