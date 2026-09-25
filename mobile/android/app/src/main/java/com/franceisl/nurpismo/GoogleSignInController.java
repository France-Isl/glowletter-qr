package com.franceisl.glowletternext;

import android.app.Activity;
import android.os.CancellationSignal;
import android.util.Log;

import androidx.core.content.ContextCompat;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CredentialOption;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.NoCredentialException;

import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * «Продолжить как …@gmail.com»: вход аккаунтом Google, который уже есть на
 * телефоне, — обычно тем же, с которого скачано приложение. Google выдаёт
 * ID-токен, веб-слой обменивает его в Supabase на сессию, и покупки с
 * прогрессом возвращаются сами, в том числе после переустановки.
 */
final class GoogleSignInController {
    interface Listener {
        void onGoogleCredential(String status, String idToken);
    }

    private static final String TAG = "GlowLetterGoogle";
    private static final Pattern HASHED_NONCE = Pattern.compile("[0-9a-f]{64}");

    private final Activity activity;
    private final CredentialManager credentialManager;
    private final Listener listener;
    private CancellationSignal inFlight;
    private boolean closed;

    GoogleSignInController(Activity activity, Listener listener) {
        this.activity = activity;
        this.listener = listener;
        this.credentialManager = CredentialManager.create(activity);
    }

    /**
     * @param hashedNonce SHA-256 (hex) of the raw nonce the web layer keeps;
     *                    Supabase later checks the raw value against the token.
     * @param automatic   first-launch prompt: an account that already used
     *                    GlowLetter signs in without a tap, otherwise Google
     *                    offers every account on the device.
     */
    void signIn(String hashedNonce, boolean automatic) {
        if (closed || inFlight != null) {
            return;
        }
        if (hashedNonce == null || !HASHED_NONCE.matcher(hashedNonce).matches()) {
            listener.onGoogleCredential("failed", "");
            return;
        }
        if (automatic) {
            request(googleIdOption(hashedNonce, true), hashedNonce, true);
        } else {
            request(signInWithGoogleOption(hashedNonce), hashedNonce, false);
        }
    }

    void close() {
        closed = true;
        CancellationSignal signal = inFlight;
        inFlight = null;
        if (signal != null) {
            signal.cancel();
        }
    }

    private void request(CredentialOption option, String hashedNonce, boolean returningAccountsOnly) {
        GetCredentialRequest request = new GetCredentialRequest.Builder()
                .addCredentialOption(option)
                .build();
        CancellationSignal signal = new CancellationSignal();
        inFlight = signal;
        credentialManager.getCredentialAsync(
                activity,
                request,
                signal,
                ContextCompat.getMainExecutor(activity),
                new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    @Override
                    public void onResult(GetCredentialResponse response) {
                        if (inFlight != signal || closed) {
                            return;
                        }
                        inFlight = null;
                        deliver(response.getCredential());
                    }

                    @Override
                    public void onError(GetCredentialException error) {
                        if (inFlight != signal || closed) {
                            return;
                        }
                        inFlight = null;
                        if (returningAccountsOnly && error instanceof NoCredentialException) {
                            // Никто на этом телефоне ещё не входил в GlowLetter:
                            // предлагаем все аккаунты Google устройства.
                            request(googleIdOption(hashedNonce, false), hashedNonce, false);
                        } else if (error instanceof GetCredentialCancellationException
                                && !isGoogleRejection(error)) {
                            listener.onGoogleCredential("canceled", "");
                        } else if (error instanceof NoCredentialException) {
                            listener.onGoogleCredential("no_accounts", "");
                        } else {
                            Log.i(TAG, "Google sign-in unavailable: " + error.getType());
                            listener.onGoogleCredential("failed", "");
                        }
                    }
                }
        );
    }

    /**
     * Google отвечает «отменой» и тогда, когда сам отказал уже после выбора
     * аккаунта: «[16] Account reauth failed» — чаще всего ключ подписи
     * приложения не записан в Google Cloud. Это не отказ человека, поэтому
     * веб-слой откроет обычный вход через страницу Google.
     */
    private static boolean isGoogleRejection(GetCredentialException error) {
        CharSequence message = error.getErrorMessage();
        String text = message == null ? "" : message.toString().toLowerCase(Locale.ROOT);
        boolean rejected = text.contains("fail") || text.contains("reauth");
        if (rejected) {
            Log.i(TAG, "Google rejected the sign-in after account choice: " + text);
        }
        return rejected;
    }

    private void deliver(Credential credential) {
        if (credential instanceof CustomCredential
                && GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
            try {
                String idToken = GoogleIdTokenCredential.createFrom(credential.getData()).getIdToken();
                if (idToken != null && !idToken.isEmpty()) {
                    listener.onGoogleCredential("success", idToken);
                    return;
                }
            } catch (RuntimeException exception) {
                Log.w(TAG, "Google ID token could not be parsed", exception);
            }
        }
        listener.onGoogleCredential("failed", "");
    }

    private static CredentialOption googleIdOption(String hashedNonce, boolean returningAccountsOnly) {
        return new GetGoogleIdOption.Builder()
                .setServerClientId(BuildConfig.GOOGLE_WEB_CLIENT_ID)
                .setFilterByAuthorizedAccounts(returningAccountsOnly)
                .setAutoSelectEnabled(returningAccountsOnly)
                .setNonce(hashedNonce)
                .build();
    }

    private static CredentialOption signInWithGoogleOption(String hashedNonce) {
        return new GetSignInWithGoogleOption.Builder(BuildConfig.GOOGLE_WEB_CLIENT_ID)
                .setNonce(hashedNonce)
                .build();
    }
}
