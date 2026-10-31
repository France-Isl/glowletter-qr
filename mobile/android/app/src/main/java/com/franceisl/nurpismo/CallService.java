package com.franceisl.glowletternext;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import java.lang.ref.WeakReference;

/**
 * Разговор продолжается, когда приложение свёрнуто (владелец 31.10: «как в WhatsApp»).
 * Пока идёт звонок, Android держит приложение и микрофон живыми через службу переднего плана
 * (тип «микрофон») с уведомлением «Звонок с …»: нажал — вернулся в разговор, «Завершить» — повесил трубку.
 * Без такой службы Android глушит микрофон свёрнутого приложения через несколько секунд.
 */
public final class CallService extends Service {
    static final String ACTION_HANGUP = "com.franceisl.glowletternext.CALL_HANGUP";
    private static final String CHANNEL = "glowletter_call_ongoing_v1";
    private static final int NOTIFICATION_ID = 7202;
    private static WeakReference<MainActivity> owner = new WeakReference<>(null);
    private static long startedAt = 0;

    /** Показать или обновить уведомление разговора. Тексты — на языке приложения. */
    static void start(MainActivity activity, String title, String text, String hangup, String channel) {
        owner = new WeakReference<>(activity);
        if (startedAt == 0) startedAt = System.currentTimeMillis();
        Intent intent = new Intent(activity, CallService.class)
                .putExtra("title", title).putExtra("text", text).putExtra("hangup", hangup).putExtra("channel", channel);
        try {
            ContextCompat.startForegroundService(activity, intent);
        } catch (RuntimeException ignored) {
            // Android не разрешил службу (например, приложение уже в фоне) — звонок идёт, пока открыто приложение.
        }
    }

    static void stop(Context context) {
        startedAt = 0;
        context.stopService(new Intent(context, CallService.class));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String title = intent != null ? intent.getStringExtra("title") : null;
        String text = intent != null ? intent.getStringExtra("text") : null;
        String hangup = intent != null ? intent.getStringExtra("hangup") : null;
        ensureChannel(intent != null ? intent.getStringExtra("channel") : null);

        Intent back = new Intent(this, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        PendingIntent open = PendingIntent.getActivity(this, 11, back, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent end = PendingIntent.getBroadcast(this, 12, new Intent(this, Hangup.class).setAction(ACTION_HANGUP),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL)
                .setSmallIcon(R.drawable.ic_notify)
                .setColor(0xFF8E2C2F)
                .setContentTitle(title == null || title.isEmpty() ? "GlowLetter" : title)
                .setContentText(text == null ? "" : text)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setWhen(startedAt == 0 ? System.currentTimeMillis() : startedAt)
                .setUsesChronometer(true)
                .setShowWhen(true)
                .setContentIntent(open)
                .addAction(0, hangup == null || hangup.isEmpty() ? "Завершить" : hangup, end)
                .build();
        try {
            if (Build.VERSION.SDK_INT >= 29) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (RuntimeException error) {
            // Нет разрешения на микрофон или Android запретил запуск из фона — служба не нужна.
            stopSelf();
        }
        return START_NOT_STICKY;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // Приложение смахнули из списка — разговор заканчивается вместе с ним.
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void ensureChannel(String name) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(CHANNEL) != null) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL, name == null || name.isEmpty() ? "GlowLetter" : name, NotificationManager.IMPORTANCE_LOW);
        channel.setSound(null, null);
        channel.enableVibration(false);
        channel.setShowBadge(false);
        manager.createNotificationChannel(channel);
    }

    /** «Завершить» в уведомлении: страница вешает трубку, приложение не открывается. */
    public static final class Hangup extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            MainActivity activity = owner.get();
            if (activity != null) activity.runOnUiThread(activity::callHangup);
            stop(context);
        }
    }
}
