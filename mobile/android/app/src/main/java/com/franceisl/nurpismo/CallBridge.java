package com.franceisl.glowletternext;

import android.content.Context;
import android.media.AudioDeviceCallback;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;

import java.util.List;

/**
 * «Звонок в приложении» (call.js): пока идёт разговор, экран не гаснет,
 * звук идёт в режиме разговора (эхоподавление телефона), а WebView не засыпает в onPause.
 *
 * Куда идёт звук (01.11, владелец: «не хватает динамика»): кнопка «Динамик» в звонке
 * переключает громкую связь и разговорный динамик у уха. Подключили наушники или
 * Bluetooth-гарнитуру — звук сразу уходит в них; отключили — возвращается туда, где был.
 * У уха датчик приближения гасит экран, чтобы щека ничего не нажала.
 * Страница узнаёт, где сейчас звук, через window.GlowLetterCall.onAudioRoute(route):
 * speaker, earpiece, headset или bluetooth.
 */
public final class CallBridge {
    private final MainActivity activity;
    private final Handler main = new Handler(Looper.getMainLooper());
    private boolean active = false;
    private boolean wantSpeaker = true;
    private boolean chosenSpeaker = true;
    private boolean hadHeadset = false;
    private volatile String route = "speaker";
    private AudioDeviceCallback devices;
    private PowerManager.WakeLock proximity;
    private PowerManager.WakeLock cpu;

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

    /**
     * Разговор не обрывается, когда приложение свёрнуто: уведомление «Звонок с …» и служба
     * с микрофоном (CallService). Тексты — {title, text, hangup, channel} на языке приложения.
     */
    @JavascriptInterface
    public void ongoing(String json) {
        String title = "", text = "", hangup = "", channel = "";
        try {
            org.json.JSONObject data = new org.json.JSONObject(json == null ? "{}" : json);
            title = clip(data.optString("title"), 80);
            text = clip(data.optString("text"), 120);
            hangup = clip(data.optString("hangup"), 40);
            channel = clip(data.optString("channel"), 40);
        } catch (Exception ignored) {
            // Без текстов покажем название приложения.
        }
        final String t = title, x = text, h = hangup, c = channel;
        activity.runOnUiThread(() -> CallService.start(activity, t, x, h, c));
    }

    private static String clip(String value, int max) {
        String text = value == null ? "" : value.replaceAll("\\p{Cntrl}", "").trim();
        return text.length() <= max ? text : text.substring(0, max);
    }

    /** Громкая связь (true) или динамик у уха / наушники (false). */
    @JavascriptInterface
    public void setSpeaker(boolean on) {
        activity.runOnUiThread(() -> {
            wantSpeaker = on;
            if (!hasHeadset(audio())) chosenSpeaker = on;
            route();
        });
    }

    /** Что человек выбрал в прошлый раз; наушники, если подключены, всё равно важнее. */
    @JavascriptInterface
    public void preferSpeaker(boolean on) {
        activity.runOnUiThread(() -> {
            chosenSpeaker = on;
            if (!hasHeadset(audio())) wantSpeaker = on;
            route();
        });
    }

    @JavascriptInterface
    public String audioRoute() {
        return route;
    }

    /** Адрес Firebase для звонков при закрытом приложении ("" — Firebase в этой сборке нет). */
    @JavascriptInterface
    public String pushToken() {
        return CallPush.token(activity.getApplicationContext(),
                token -> activity.runOnUiThread(() -> activity.callPushToken(token)));
    }

    /** Тексты входящего звонка на языке приложения: incoming, answer, decline, channel. */
    @JavascriptInterface
    public void pushTexts(String texts) {
        CallPush.saveTexts(activity.getApplicationContext(), texts);
    }

    /** Без разрешения на уведомления (Android 13+) телефон не зазвонит, когда приложение закрыто. */
    @JavascriptInterface
    public void askNotify() {
        activity.runOnUiThread(activity::requestNotificationPermission);
    }

    private AudioManager audio() {
        return (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
    }

    @SuppressWarnings("deprecation")
    private void apply(boolean on) {
        active = on;
        activity.callActive = on;
        if (on) activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        else activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        activity.callKeepRenderer(on);
        holdCpu(on);
        AudioManager audio = audio();
        if (audio == null) return;
        try {
            audio.setMode(on ? AudioManager.MODE_IN_COMMUNICATION : AudioManager.MODE_NORMAL);
            if (on) {
                hadHeadset = hasHeadset(audio);
                wantSpeaker = !hadHeadset && chosenSpeaker;
                listen(audio, true);
                route();
            } else {
                listen(audio, false);
                CallService.stop(activity);
                activity.callShowWhenLocked(false);
                if (Build.VERSION.SDK_INT >= 31) audio.clearCommunicationDevice();
                audio.stopBluetoothSco();
                audio.setBluetoothScoOn(false);
                audio.setSpeakerphoneOn(false);
                holdProximity(false);
            }
        } catch (RuntimeException ignored) {
            // Некоторые прошивки не дают менять режим звука — разговор всё равно идёт.
        }
    }

    private void listen(AudioManager audio, boolean on) {
        if (on && devices == null) {
            devices = new AudioDeviceCallback() {
                @Override
                public void onAudioDevicesAdded(AudioDeviceInfo[] added) {
                    changed();
                }

                @Override
                public void onAudioDevicesRemoved(AudioDeviceInfo[] removed) {
                    changed();
                }
            };
            audio.registerAudioDeviceCallback(devices, main);
        } else if (!on && devices != null) {
            audio.unregisterAudioDeviceCallback(devices);
            devices = null;
        }
    }

    // Наушники подключили — звук в них; отключили — туда, где был до них.
    private void changed() {
        if (!active) return;
        boolean headset = hasHeadset(audio());
        if (headset && !hadHeadset) wantSpeaker = false;
        else if (!headset && hadHeadset) wantSpeaker = chosenSpeaker;
        hadHeadset = headset;
        route();
    }

    private static boolean isHeadset(int type) {
        return type == AudioDeviceInfo.TYPE_WIRED_HEADSET || type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES
                || type == AudioDeviceInfo.TYPE_USB_HEADSET || type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
                || (Build.VERSION.SDK_INT >= 31 && type == AudioDeviceInfo.TYPE_BLE_HEADSET);
    }

    private static boolean hasHeadset(AudioManager audio) {
        if (audio == null) return false;
        for (AudioDeviceInfo device : audio.getDevices(AudioManager.GET_DEVICES_OUTPUTS)) {
            if (isHeadset(device.getType())) return true;
        }
        return false;
    }

    private static String nameOf(int type) {
        if (type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER) return "speaker";
        if (type == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE) return "earpiece";
        if (type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO || (Build.VERSION.SDK_INT >= 31 && type == AudioDeviceInfo.TYPE_BLE_HEADSET)) return "bluetooth";
        return "headset";
    }

    @SuppressWarnings("deprecation")
    private void route() {
        if (!active) return;
        AudioManager audio = audio();
        if (audio == null) return;
        String now;
        try {
            if (Build.VERSION.SDK_INT >= 31) {
                List<AudioDeviceInfo> list = audio.getAvailableCommunicationDevices();
                AudioDeviceInfo speaker = null, earpiece = null, headset = null;
                for (AudioDeviceInfo device : list) {
                    int type = device.getType();
                    if (type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER) speaker = device;
                    else if (type == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE) earpiece = device;
                    else if (isHeadset(type) && headset == null) headset = device;
                }
                AudioDeviceInfo target = wantSpeaker ? speaker : headset != null ? headset : earpiece;
                if (target == null) target = speaker != null ? speaker : earpiece;
                if (target != null) audio.setCommunicationDevice(target);
                AudioDeviceInfo current = audio.getCommunicationDevice();
                now = current != null ? nameOf(current.getType()) : wantSpeaker ? "speaker" : "earpiece";
            } else {
                boolean bluetooth = false, wired = false;
                for (AudioDeviceInfo device : audio.getDevices(AudioManager.GET_DEVICES_OUTPUTS)) {
                    if (device.getType() == AudioDeviceInfo.TYPE_BLUETOOTH_SCO) bluetooth = true;
                    else if (isHeadset(device.getType())) wired = true;
                }
                if (wantSpeaker) {
                    audio.stopBluetoothSco();
                    audio.setBluetoothScoOn(false);
                    audio.setSpeakerphoneOn(true);
                    now = "speaker";
                } else if (bluetooth) {
                    audio.setSpeakerphoneOn(false);
                    audio.startBluetoothSco();
                    audio.setBluetoothScoOn(true);
                    now = "bluetooth";
                } else {
                    audio.stopBluetoothSco();
                    audio.setBluetoothScoOn(false);
                    audio.setSpeakerphoneOn(false);
                    now = wired ? "headset" : "earpiece";
                }
            }
        } catch (RuntimeException error) {
            now = wantSpeaker ? "speaker" : "earpiece";
        }
        route = now;
        holdProximity("earpiece".equals(now));
        activity.callAudioRoute(now);
    }

    // Свёрнутое приложение с погасшим экраном: процессор не засыпает, пока идёт разговор.
    private void holdCpu(boolean on) {
        try {
            if (on) {
                if (cpu == null) {
                    PowerManager power = (PowerManager) activity.getSystemService(Context.POWER_SERVICE);
                    if (power == null) return;
                    cpu = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "GlowLetter:call-cpu");
                    cpu.setReferenceCounted(false);
                }
                if (!cpu.isHeld()) cpu.acquire(4 * 60 * 60 * 1000L);
            } else if (cpu != null && cpu.isHeld()) {
                cpu.release();
            }
        } catch (RuntimeException ignored) {
            // Без блокировки разговор идёт, пока экран включён.
        }
    }

    // У уха экран гаснет по датчику приближения.
    private void holdProximity(boolean on) {
        try {
            if (on) {
                if (proximity == null) {
                    PowerManager power = (PowerManager) activity.getSystemService(Context.POWER_SERVICE);
                    if (power == null || !power.isWakeLockLevelSupported(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK)) return;
                    proximity = power.newWakeLock(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK, "GlowLetter:call");
                    proximity.setReferenceCounted(false);
                }
                if (!proximity.isHeld()) proximity.acquire(4 * 60 * 60 * 1000L);
            } else if (proximity != null && proximity.isHeld()) {
                proximity.release();
            }
        } catch (RuntimeException ignored) {
            // Нет датчика или прошивка не даёт — экран просто остаётся включённым.
        }
    }
}
