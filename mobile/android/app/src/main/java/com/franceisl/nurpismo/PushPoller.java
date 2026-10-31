package com.franceisl.glowletternext;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

/**
 * «Уведомления на телефон» без Firebase: примерно раз в 15 минут спрашиваем у
 * Supabase (glowletter_push_poll) сводку нового — сообщения друзей, открытые
 * письма, ответы на письма — и показываем обычные уведомления. Ключ устройства
 * выдаёт сервер, на сервере хранится только его хэш. Тексты уведомлений приходят
 * со страницы на языке приложения. Тот же опрос обновляет виджет «Фото на экран
 * друга» (PhotoWidget); если ключ выдан только для виджета (widgetOnly),
 * уведомления не показываем.
 */
public final class PushPoller extends Worker {
    private static final String PREFS = "glowletter_push";
    private static final String WORK = "glowletter-push-poll";
    private static final String CHANNEL = "friends_letters";
    private static final int ID_MESSAGES = 7101;
    private static final int ID_OPENED = 7102;
    private static final int ID_REPLIES = 7103;
    private static final int TIMEOUT_MS = 15000;

    static volatile boolean appInFront = false;

    public PushPoller(@NonNull Context context, @NonNull WorkerParameters parameters) {
        super(context, parameters);
    }

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static boolean isEnabled(Context context) {
        return token(context).length() == 64 && !prefs(context).getBoolean("widgetOnly", false);
    }

    static String token(Context context) {
        return prefs(context).getString("token", "");
    }

    static void enable(Context context, String token, String texts) {
        if (token == null || !token.matches("[0-9a-f]{64}")) return;
        prefs(context).edit().putString("token", token).putString("texts", texts == null ? "{}" : texts)
                .putBoolean("widgetOnly", false).apply();
        schedule(context);
    }

    /**
     * Виджет «Фото на экран друга» без уведомлений: ключ нужен только для опроса,
     * разрешение на уведомления не спрашиваем. Уже включённые уведомления не трогаем.
     */
    static void enableForWidget(Context context, String token) {
        if (token == null || !token.matches("[0-9a-f]{64}") || token(context).length() == 64) return;
        prefs(context).edit().putString("token", token).putString("texts", "{}").putBoolean("widgetOnly", true).apply();
        schedule(context);
    }

    static void setTexts(Context context, String texts) {
        if (texts == null || !isEnabled(context)) return;
        prefs(context).edit().putString("texts", texts).apply();
    }

    static String disable(Context context) {
        String token = prefs(context).getString("token", "");
        prefs(context).edit().clear().apply();
        WorkManager.getInstance(context.getApplicationContext()).cancelUniqueWork(WORK);
        return token;
    }

    static void schedule(Context context) {
        Constraints constraints = new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(PushPoller.class, 15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .setInitialDelay(5, TimeUnit.MINUTES)
                .build();
        WorkManager.getInstance(context.getApplicationContext())
                .enqueueUniquePeriodicWork(WORK, ExistingPeriodicWorkPolicy.KEEP, request);
    }

    static boolean canNotify(Context context) {
        if (Build.VERSION.SDK_INT >= 33
                && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return false;
        }
        return NotificationManagerCompat.from(context).areNotificationsEnabled();
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        String token = prefs(context).getString("token", "");
        if (token.length() != 64) return Result.success();
        try {
            HttpURLConnection connection = post(BuildConfig.PUSH_POLL_URL, new JSONObject().put("p_token", token));
            int code = connection.getResponseCode();
            String text = read(code >= 400 ? connection.getErrorStream() : connection.getInputStream(), 256 * 1024);
            connection.disconnect();
            if (code >= 400) {
                // Ключ больше не действует (аккаунт удалён или уведомления выключены на другом устройстве).
                if (text.contains("not_found")) disable(context);
                return code >= 500 ? Result.retry() : Result.success();
            }
            JSONObject summary = new JSONObject(text.isEmpty() ? "{}" : text);
            // Фото на экран друга: новое фото пришло или виджет ещё пустой. Ошибка виджета
            // не должна мешать уведомлениям.
            try {
                boolean newPhoto = summary.has("photo") && !summary.isNull("photo");
                if (PhotoWidget.installed(context) && (newPhoto || !PhotoWidget.hasPhoto(context))) {
                    PhotoWidget.fetch(context, token);
                }
            } catch (Exception | OutOfMemoryError ignored) {
                // Фото подтянется при следующем опросе.
            }
            if (!appInFront && canNotify(context) && !prefs(context).getBoolean("widgetOnly", false)) show(context, summary);
            return Result.success();
        } catch (Exception error) {
            return Result.retry();
        }
    }

    /** POST в Supabase RPC с публичным ключом. */
    static HttpURLConnection post(String url, JSONObject body) throws java.io.IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("apikey", BuildConfig.SUPABASE_PUBLISHABLE_KEY);
        connection.setRequestProperty("Authorization", "Bearer " + BuildConfig.SUPABASE_PUBLISHABLE_KEY);
        try (OutputStream output = connection.getOutputStream()) {
            output.write(body.toString().getBytes(StandardCharsets.UTF_8));
        }
        return connection;
    }

    static String read(InputStream stream, int limit) throws java.io.IOException {
        if (stream == null) return "";
        try (InputStream input = stream; ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int length;
            int total = 0;
            while ((length = input.read(buffer)) != -1 && total < limit) {
                output.write(buffer, 0, length);
                total += length;
            }
            return output.toString("UTF-8");
        }
    }

    private static String fill(String template, String name, String value, String n) {
        return template.replace("{name}", name).replace("{text}", value).replace("{n}", n);
    }

    @SuppressLint("MissingPermission")
    private static void show(Context context, JSONObject summary) throws Exception {
        JSONObject texts = new JSONObject(prefs(context).getString("texts", "{}"));
        ensureChannel(context, texts.optString("channel", "GlowLetter"));
        NotificationManagerCompat manager = NotificationManagerCompat.from(context);

        JSONArray messages = summary.optJSONArray("messages");
        if (messages != null && messages.length() > 0) {
            NotificationCompat.InboxStyle inbox = new NotificationCompat.InboxStyle();
            String first = "";
            for (int index = 0; index < messages.length(); index++) {
                JSONObject message = messages.getJSONObject(index);
                String name = message.optString("name", "").trim();
                if (name.isEmpty()) name = texts.optString("noName", "GlowLetter");
                String kind = message.optString("kind", "text");
                String template = texts.optString(kind, texts.optString("text", "{name}: {text}"));
                String line = fill(template, name, message.optString("text", ""), "");
                if (index == 0) first = line;
                inbox.addLine(line);
            }
            String title = messages.length() == 1 ? "GlowLetter" : fill(texts.optString("many", "GlowLetter · {n}"), "", "", String.valueOf(messages.length()));
            manager.notify(ID_MESSAGES, builder(context, title, messages.length() == 1 ? first : first + " …").setStyle(inbox).build());
        }

        int opened = summary.optInt("opened", 0);
        if (opened > 0) {
            String text = opened == 1 ? texts.optString("opened", "") : fill(texts.optString("openedMany", ""), "", "", String.valueOf(opened));
            if (!text.isEmpty()) manager.notify(ID_OPENED, builder(context, "GlowLetter", text).build());
        }

        JSONArray replies = summary.optJSONArray("replies");
        if (replies != null && replies.length() > 0) {
            JSONObject reply = replies.getJSONObject(replies.length() - 1);
            String emoji;
            switch (reply.optString("reaction", "heart")) {
                case "thanks": emoji = "🙏"; break;
                case "smile": emoji = "😊"; break;
                case "tears": emoji = "🥹"; break;
                default: emoji = "❤️";
            }
            String message = reply.optString("message", "").trim();
            String text = message.isEmpty() ? emoji : emoji + " «" + message + "»";
            manager.notify(ID_REPLIES, builder(context, texts.optString("reply", "GlowLetter"), text).build());
        }
    }

    private static NotificationCompat.Builder builder(Context context, String title, String text) {
        Intent intent = new Intent(context, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent open = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        return new NotificationCompat.Builder(context, CHANNEL)
                .setSmallIcon(R.drawable.ic_notify)
                .setColor(0xFF8E2C2F)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                .setContentIntent(open)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);
    }

    private static void ensureChannel(Context context, String name) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL, name, NotificationManager.IMPORTANCE_DEFAULT);
        manager.createNotificationChannel(channel);
    }
}
