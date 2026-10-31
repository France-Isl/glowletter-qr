package com.franceisl.glowletternext;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONObject;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * Звонок, когда приложение закрыто (владелец 01.11: «как в WhatsApp»).
 * Сервер (функция call-push) будит телефон через Firebase Cloud Messaging, а здесь
 * показывается входящий звонок: имя друга, звук звонка по кругу, «Ответить» и «Отклонить».
 * «Ответить» открывает приложение, и страница сама принимает звонок (MainActivity → call.js).
 * Если приложение открыто, ничего не показываем: звонок уже звенит на странице.
 * Тексты кнопок приходят со страницы на языке приложения (NurCall.pushTexts).
 */
public final class CallPush extends FirebaseMessagingService {
    static final String ACTION_ANSWER = "com.franceisl.glowletternext.CALL_ANSWER";
    static final String ACTION_OPEN = "com.franceisl.glowletternext.CALL_OPEN";
    static final String ACTION_DECLINE = "com.franceisl.glowletternext.CALL_DECLINE";
    private static final String PREFS = "glowletter_call_push";
    private static final String CHANNEL = "glowletter_calls_v1";
    private static final int NOTIFICATION_ID = 7201;
    private static final long RING_MS = 45000;
    private static final Pattern ID = Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$");

    @Override
    public void onNewToken(@NonNull String token) {
        prefs(this).edit().putString("token", token).apply();
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage message) {
        Map<String, String> data = message.getData();
        String type = data.get("type");
        if ("call".equals(type)) ring(this, data);
        else if ("call_end".equals(type)) stop(this, data.get("room"));
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static boolean available(Context context) {
        return !FirebaseApp.getApps(context).isEmpty();
    }

    /** Адрес Firebase этого телефона; если его ещё нет — просим, ответ придёт в done. */
    static String token(Context context, TokenListener done) {
        String saved = prefs(context).getString("token", "");
        if (!available(context)) return saved;
        try {
            FirebaseMessaging.getInstance().getToken().addOnSuccessListener(token -> {
                if (token == null || token.isEmpty()) return;
                boolean changed = !token.equals(prefs(context).getString("token", ""));
                prefs(context).edit().putString("token", token).apply();
                if (changed && done != null) done.onToken(token);
            });
        } catch (RuntimeException ignored) {
            // Firebase не настроен в этой сборке — звонок при закрытом приложении просто не работает.
        }
        return saved;
    }

    interface TokenListener {
        void onToken(String token);
    }

    static void saveTexts(Context context, String texts) {
        if (texts != null && texts.length() <= 2000) prefs(context).edit().putString("texts", texts).apply();
    }

    private static String clean(String value, int max) {
        String text = value == null ? "" : value.replaceAll("\\p{Cntrl}", "").trim();
        return text.length() <= max ? text : text.substring(0, max);
    }

    static void ring(Context context, Map<String, String> data) {
        String room = data.get("room");
        String from = data.get("from");
        if (room == null || from == null || !ID.matcher(room).matches() || !ID.matcher(from).matches()) return;
        if (PushPoller.appInFront) return;
        long at;
        try { at = Long.parseLong(data.get("at")); } catch (RuntimeException error) { at = System.currentTimeMillis(); }
        long left = RING_MS - Math.max(0, System.currentTimeMillis() - at);
        if (left < 5000) return;
        if (Build.VERSION.SDK_INT >= 33
                && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        String name = clean(data.get("name"), 36);
        JSONObject texts;
        try { texts = new JSONObject(prefs(context).getString("texts", "{}")); } catch (Exception error) { texts = new JSONObject(); }
        String title = name.isEmpty() ? "GlowLetter" : name;
        String incoming = texts.optString("incoming", "Входящий звонок");
        ensureChannel(context, texts.optString("channel", incoming));

        PendingIntent answer = PendingIntent.getActivity(context, 1, callIntent(context, ACTION_ANSWER, room, from, name, at),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent open = PendingIntent.getActivity(context, 2, callIntent(context, ACTION_OPEN, room, from, name, at),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent decline = PendingIntent.getBroadcast(context, 3,
                new Intent(context, Decline.class).setAction(ACTION_DECLINE).putExtra("room", room),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL)
                .setSmallIcon(R.drawable.ic_notify)
                .setColor(0xFF8E2C2F)
                .setContentTitle(title)
                .setContentText(incoming)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setAutoCancel(true)
                .setTimeoutAfter(left)
                .setContentIntent(open)
                .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE))
                .setVibrate(new long[] { 0, 900, 700, 900, 700 })
                .addAction(0, texts.optString("decline", "Отклонить"), decline)
                .addAction(0, texts.optString("answer", "Ответить"), answer);
        Notification notification = builder.build();
        // Звук звонка повторяется, пока не ответят, не отклонят или не истечёт время.
        notification.flags |= Notification.FLAG_INSISTENT;
        prefs(context).edit().putString("ringing", room).apply();
        try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification);
        } catch (SecurityException ignored) {
            // Уведомления запрещены — звонок увидят, когда откроют приложение.
        }
    }

    private static Intent callIntent(Context context, String action, String room, String from, String name, long at) {
        return new Intent(context, MainActivity.class)
                .setAction(action)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP)
                .putExtra("room", room)
                .putExtra("from", from)
                .putExtra("name", name)
                .putExtra("at", at);
    }

    /** Звонящий передумал или звонок приняли — больше не звеним. */
    static void stop(Context context, String room) {
        String ringing = prefs(context).getString("ringing", "");
        if (room != null && !room.isEmpty() && !room.equals(ringing)) return;
        prefs(context).edit().remove("ringing").apply();
        NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID);
    }

    private static void ensureChannel(Context context, String name) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL, name, NotificationManager.IMPORTANCE_HIGH);
        Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        channel.setSound(sound, new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build());
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[] { 0, 900, 700, 900, 700 });
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        manager.createNotificationChannel(channel);
    }

    /** «Отклонить» в уведомлении: замолкаем; у звонящего звонок закончится сам. */
    public static final class Decline extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            stop(context, intent.getStringExtra("room"));
        }
    }
}
