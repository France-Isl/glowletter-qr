package com.franceisl.glowletternext;

import android.app.Activity;
import android.util.Log;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;

import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.InstallState;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;

/**
 * «Вышла новая версия» внутри приложения. Google Play сообщает о более свежей
 * сборке, веб-слой показывает плашку, загрузка идёт в фоне, пока человек пишет
 * письмо, а затем приложение перезапускается уже обновлённым.
 *
 * Работает только для установок из Google Play, включая тестовые треки;
 * для остальных проверка тихо возвращает «обновлений нет».
 */
final class AppUpdateController {
    interface Listener {
        void onAppUpdateState(State state);
    }

    static final class State {
        static final State NONE = new State("none", 0, 0);

        final String status;
        final int availableVersionCode;
        final int progressPercent;

        State(String status, int availableVersionCode, int progressPercent) {
            this.status = status;
            this.availableVersionCode = availableVersionCode;
            this.progressPercent = progressPercent;
        }
    }

    private static final String TAG = "GlowLetterUpdate";

    private final AppUpdateManager manager;
    private final Listener listener;
    private final ActivityResultLauncher<IntentSenderRequest> updateLauncher;
    private final InstallStateUpdatedListener installListener = this::onInstallState;
    private AppUpdateInfo startableInfo;
    private State state = State.NONE;
    private boolean checking;
    private boolean closed;

    /** Must be created in onCreate: the result launcher registers before onStart. */
    AppUpdateController(ComponentActivity activity, Listener listener) {
        this.listener = listener;
        this.manager = AppUpdateManagerFactory.create(activity);
        this.updateLauncher = activity.registerForActivityResult(
                new ActivityResultContracts.StartIntentSenderForResult(),
                result -> {
                    if (result.getResultCode() != Activity.RESULT_OK) {
                        // Человек отказался или Play не начал загрузку:
                        // свежая проверка вернёт плашку «Обновить».
                        check();
                    }
                });
        manager.registerListener(installListener);
    }

    State state() {
        return state;
    }

    void check() {
        if (closed || checking) {
            return;
        }
        checking = true;
        manager.getAppUpdateInfo()
                .addOnSuccessListener(info -> {
                    checking = false;
                    if (!closed) {
                        onUpdateInfo(info);
                    }
                })
                .addOnFailureListener(error -> {
                    checking = false;
                    if (closed) {
                        return;
                    }
                    Log.i(TAG, "In-app update check is unavailable for this install");
                    startableInfo = null;
                    publish(State.NONE);
                });
    }

    /** Opens Google Play's own confirmation; the download then runs in the background. */
    void startUpdate() {
        if (closed) {
            return;
        }
        AppUpdateInfo info = startableInfo;
        if (info == null) {
            check();
            return;
        }
        // Один AppUpdateInfo запускает обновление только однажды.
        startableInfo = null;
        try {
            boolean started = manager.startUpdateFlowForResult(
                    info,
                    updateLauncher,
                    AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build()
            );
            if (!started) {
                check();
            }
        } catch (RuntimeException exception) {
            Log.w(TAG, "In-app update flow could not start", exception);
            check();
        }
    }

    /** Installs the downloaded update; Google Play restarts the app. */
    void completeUpdate() {
        if (!closed && "downloaded".equals(state.status)) {
            manager.completeUpdate();
        }
    }

    void close() {
        if (closed) {
            return;
        }
        closed = true;
        manager.unregisterListener(installListener);
    }

    private void onUpdateInfo(AppUpdateInfo info) {
        int status = info.installStatus();
        if (status == InstallStatus.DOWNLOADED) {
            startableInfo = null;
            publish(new State("downloaded", info.availableVersionCode(), 100));
            return;
        }
        if (status == InstallStatus.PENDING || status == InstallStatus.DOWNLOADING) {
            startableInfo = null;
            publish(new State(
                    "downloading",
                    info.availableVersionCode(),
                    percent(info.bytesDownloaded(), info.totalBytesToDownload())
            ));
            return;
        }
        if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                && info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
            startableInfo = info;
            publish(new State("available", info.availableVersionCode(), 0));
            return;
        }
        startableInfo = null;
        publish(State.NONE);
    }

    private void onInstallState(InstallState installState) {
        if (closed) {
            return;
        }
        int status = installState.installStatus();
        if (status == InstallStatus.PENDING || status == InstallStatus.DOWNLOADING) {
            publish(new State(
                    "downloading",
                    state.availableVersionCode,
                    percent(installState.bytesDownloaded(), installState.totalBytesToDownload())
            ));
        } else if (status == InstallStatus.DOWNLOADED) {
            publish(new State("downloaded", state.availableVersionCode, 100));
        } else if (status == InstallStatus.FAILED || status == InstallStatus.CANCELED) {
            check();
        }
    }

    private void publish(State next) {
        state = next;
        listener.onAppUpdateState(next);
    }

    static int percent(long done, long total) {
        if (total <= 0L) {
            return 0;
        }
        return (int) Math.max(0L, Math.min(100L, done * 100L / total));
    }
}
