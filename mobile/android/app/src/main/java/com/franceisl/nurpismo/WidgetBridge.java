package com.franceisl.glowletternext;

import android.webkit.JavascriptInterface;

/** «Фото на экран друга»: страница ставит виджет на экран и сразу показывает в нём новое фото. */
public final class WidgetBridge {
    private final MainActivity activity;

    WidgetBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public boolean available() {
        return true;
    }

    @JavascriptInterface
    public boolean installed() {
        return PhotoWidget.installed(activity);
    }

    /** true, если лаунчер показал окно «Добавить виджет» (Android 8+). */
    @JavascriptInterface
    public boolean pin() {
        return PhotoWidget.requestPin(activity);
    }

    /** Ключ устройства для опроса без уведомлений; уже включённые уведомления не меняются. */
    @JavascriptInterface
    public void enable(String token) {
        PushPoller.enableForWidget(activity, token);
        PhotoWidget.refreshSoon(activity);
    }

    /** Фото пришло, пока приложение открыто: показываем его в виджете сразу. */
    @JavascriptInterface
    public void show(String id, String name, String base64) {
        if (PhotoWidget.installed(activity)) PhotoWidget.save(activity, id, name, base64);
    }
}
