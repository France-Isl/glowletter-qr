package com.franceisl.glowletternext;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;

/**
 * «Фото на экран друга»: виджет на главном экране с последним фото, которое
 * прислал друг. Фото лежит одним файлом в getFilesDir(), id и имя друга — в
 * SharedPreferences. Новое фото приходит из PushPoller (раз в 15 минут) или
 * сразу со страницы через WidgetBridge, пока приложение открыто.
 */
public final class PhotoWidget extends AppWidgetProvider {
    private static final String PREFS = "glowletter_widget";
    private static final String FILE = "widget_photo.img";
    private static final String WORK = "glowletter-widget-photo";
    private static final String UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
    private static final int MAX_BASE64 = 650000;
    private static final int MAX_RESPONSE = 900 * 1024;
    // RemoteViews передаёт картинку через Binder: держим её меньше ~1,5 МБ.
    private static final long MAX_BITMAP_BYTES = 1536L * 1024;
    private static final int CORNER_DP = 20;
    private static final int MAX_NAME = 60;

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static File photoFile(Context context) {
        return new File(context.getApplicationContext().getFilesDir(), FILE);
    }

    private static ComponentName component(Context context) {
        return new ComponentName(context.getApplicationContext(), PhotoWidget.class);
    }

    static boolean installed(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context.getApplicationContext());
        return manager != null && manager.getAppWidgetIds(component(context)).length > 0;
    }

    static boolean hasPhoto(Context context) {
        return !prefs(context).getString("id", "").isEmpty() && photoFile(context).isFile();
    }

    /** Android 8+: лаунчер сам предлагает поставить виджет на экран. */
    static boolean requestPin(Context context) {
        if (Build.VERSION.SDK_INT < 26) return false;
        AppWidgetManager manager = AppWidgetManager.getInstance(context.getApplicationContext());
        if (manager == null || !manager.isRequestPinAppWidgetSupported()) return false;
        return manager.requestPinAppWidget(component(context), null, null);
    }

    /** Сохраняет новое фото и сразу перерисовывает все виджеты. */
    static synchronized boolean save(Context context, String id, String name, String base64) {
        if (id == null || !id.matches(UUID) || base64 == null) return false;
        int comma = base64.indexOf("base64,");
        if (comma >= 0) base64 = base64.substring(comma + 7);
        if (base64.isEmpty() || base64.length() > MAX_BASE64) return false;
        byte[] bytes;
        try {
            bytes = Base64.decode(base64, Base64.DEFAULT);
        } catch (IllegalArgumentException error) {
            return false;
        }
        BitmapFactory.Options bounds = new BitmapFactory.Options();
        bounds.inJustDecodeBounds = true;
        BitmapFactory.decodeByteArray(bytes, 0, bytes.length, bounds);
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return false;

        File file = photoFile(context);
        File temp = new File(file.getPath() + ".tmp");
        try (FileOutputStream output = new FileOutputStream(temp)) {
            output.write(bytes);
        } catch (IOException error) {
            temp.delete();
            return false;
        }
        if (!temp.renameTo(file)) {
            temp.delete();
            return false;
        }
        String clean = name == null ? "" : name.trim();
        if (clean.length() > MAX_NAME) clean = clean.substring(0, MAX_NAME);
        prefs(context).edit().putString("id", id).putString("name", clean).apply();
        updateAll(context);
        return true;
    }

    /** Фото больше нет (прошло 30 дней, друг удалён или заблокирован) — снова заглушка. */
    static synchronized void clear(Context context) {
        photoFile(context).delete();
        prefs(context).edit().clear().apply();
        updateAll(context);
    }

    /** Спрашивает у Supabase последнее фото; p_since — уже показанное, чтобы не качать его снова. */
    static void fetch(Context context, String token) throws Exception {
        String since = hasPhoto(context) ? prefs(context).getString("id", "") : "";
        JSONObject body = new JSONObject().put("p_token", token).put("p_since", since.isEmpty() ? JSONObject.NULL : since);
        HttpURLConnection connection = PushPoller.post(BuildConfig.WIDGET_PHOTO_URL, body);
        try {
            if (connection.getResponseCode() >= 400) return;
            String text = PushPoller.read(connection.getInputStream(), MAX_RESPONSE);
            JSONObject photo = new JSONObject(text.isEmpty() ? "{}" : text);
            String id = photo.optString("id", "");
            if (id.isEmpty()) {
                if (hasPhoto(context)) clear(context);
                return;
            }
            if (photo.optBoolean("same", false)) return;
            save(context, id, photo.optString("name", ""), photo.optString("image", ""));
        } finally {
            connection.disconnect();
        }
    }

    /** Виджет только что поставили, а фото ещё нет: подтягиваем его, не дожидаясь опроса. */
    static void refreshSoon(Context context) {
        if (PushPoller.token(context).length() != 64 || !installed(context) || hasPhoto(context)) return;
        Constraints constraints = new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
        OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(Fetch.class).setConstraints(constraints).build();
        WorkManager.getInstance(context.getApplicationContext()).enqueueUniqueWork(WORK, ExistingWorkPolicy.KEEP, request);
    }

    public static final class Fetch extends Worker {
        public Fetch(@NonNull Context context, @NonNull WorkerParameters parameters) {
            super(context, parameters);
        }

        @NonNull
        @Override
        public Result doWork() {
            String token = PushPoller.token(getApplicationContext());
            if (token.length() != 64) return Result.success();
            try {
                fetch(getApplicationContext(), token);
            } catch (Exception | OutOfMemoryError ignored) {
                // Следующий опрос PushPoller попробует снова.
            }
            return Result.success();
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        render(context, manager, ids);
        refreshSoon(context);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int id, Bundle options) {
        render(context, manager, new int[] { id });
    }

    /** Последний виджет убрали с экрана — фото на телефоне больше не храним. */
    @Override
    public void onDisabled(Context context) {
        photoFile(context).delete();
        prefs(context).edit().clear().apply();
    }

    static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context.getApplicationContext());
        if (manager == null) return;
        render(context, manager, manager.getAppWidgetIds(component(context)));
    }

    private static void render(Context context, AppWidgetManager manager, int[] ids) {
        if (ids == null || ids.length == 0) return;
        Bitmap source = hasPhoto(context) ? decode(photoFile(context)) : null;
        String name = prefs(context).getString("name", "");
        for (int id : ids) {
            Bundle options = manager.getAppWidgetOptions(id);
            // Портретный размер: ширина — минимальная, высота — максимальная.
            int widthDp = options == null ? 0 : options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
            int heightDp = options == null ? 0 : options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT);
            if (widthDp <= 0) widthDp = 110;
            if (heightDp <= 0) heightDp = 110;
            Bitmap photo = source == null ? null : shape(source, widthDp, heightDp, context.getResources().getDisplayMetrics().density);
            manager.updateAppWidget(id, views(context, photo, name));
        }
        if (source != null) source.recycle();
    }

    private static RemoteViews views(Context context, Bitmap photo, String name) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_photo);
        Intent intent = new Intent(context, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent open = PendingIntent.getActivity(context, 7201, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        views.setOnClickPendingIntent(R.id.widget_photo_root, open);
        if (photo == null) {
            views.setViewVisibility(R.id.widget_photo_image, View.GONE);
            views.setViewVisibility(R.id.widget_photo_caption, View.GONE);
            views.setViewVisibility(R.id.widget_photo_empty, View.VISIBLE);
            return views;
        }
        views.setImageViewBitmap(R.id.widget_photo_image, photo);
        views.setTextViewText(R.id.widget_photo_caption, name.isEmpty() ? context.getString(R.string.widget_photo_from) : name);
        views.setViewVisibility(R.id.widget_photo_image, View.VISIBLE);
        views.setViewVisibility(R.id.widget_photo_caption, View.VISIBLE);
        views.setViewVisibility(R.id.widget_photo_empty, View.GONE);
        return views;
    }

    /** Уменьшаем при чтении (inSampleSize), чтобы картинка не превышала MAX_BITMAP_BYTES. */
    private static Bitmap decode(File file) {
        BitmapFactory.Options bounds = new BitmapFactory.Options();
        bounds.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(file.getPath(), bounds);
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return null;
        int sample = 1;
        while ((long) (bounds.outWidth / sample) * (bounds.outHeight / sample) * 4 > MAX_BITMAP_BYTES) sample *= 2;
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inSampleSize = sample;
        try {
            return BitmapFactory.decodeFile(file.getPath(), options);
        } catch (OutOfMemoryError error) {
            return null;
        }
    }

    /**
     * Обрезаем фото по центру под пропорции виджета, уменьшаем до его размера на
     * экране и скругляем углы сами: так углы круглые на любом Android и лаунчере.
     */
    private static Bitmap shape(Bitmap source, int widthDp, int heightDp, float density) {
        float aspect = widthDp / (float) heightDp;
        int width = source.getWidth();
        int height = source.getHeight();
        int cropWidth = width;
        int cropHeight = height;
        if (width / (float) height > aspect) {
            cropWidth = Math.max(1, Math.round(height * aspect));
        } else {
            cropHeight = Math.max(1, Math.round(width / aspect));
        }
        float scale = Math.min(1f, widthDp * density / cropWidth);
        int outWidth = Math.max(1, Math.round(cropWidth * scale));
        int outHeight = Math.max(1, Math.round(cropHeight * scale));

        Matrix matrix = new Matrix();
        matrix.setTranslate(-(width - cropWidth) / 2f, -(height - cropHeight) / 2f);
        matrix.postScale(scale, scale);
        BitmapShader shader = new BitmapShader(source, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP);
        shader.setLocalMatrix(matrix);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
        paint.setShader(shader);

        Bitmap result = Bitmap.createBitmap(outWidth, outHeight, Bitmap.Config.ARGB_8888);
        float radius = CORNER_DP * outWidth / (float) widthDp;
        new Canvas(result).drawRoundRect(new RectF(0, 0, outWidth, outHeight), radius, radius, paint);
        return result;
    }
}
