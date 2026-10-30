package com.franceisl.glowletternext;

import android.webkit.JavascriptInterface;

/** «Уведомления на телефон»: страница включает и выключает опрос PushPoller. */
public final class NotifyBridge {
    private final MainActivity activity;

    NotifyBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public boolean available() {
        return true;
    }

    @JavascriptInterface
    public boolean enabled() {
        return PushPoller.isEnabled(activity);
    }

    @JavascriptInterface
    public boolean permitted() {
        return PushPoller.canNotify(activity);
    }

    @JavascriptInterface
    public void enable(String token, String texts) {
        PushPoller.enable(activity, token, texts);
        activity.runOnUiThread(activity::requestNotificationPermission);
    }

    @JavascriptInterface
    public void setTexts(String texts) {
        PushPoller.setTexts(activity, texts);
    }

    /** Возвращает старый ключ, чтобы страница удалила его и на сервере. */
    @JavascriptInterface
    public String disable() {
        return PushPoller.disable(activity);
    }
}
