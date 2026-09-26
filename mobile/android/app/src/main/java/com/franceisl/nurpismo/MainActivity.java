package com.franceisl.glowletternext;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Locale;
import androidx.core.content.FileProvider;

public final class MainActivity extends ComponentActivity {
    private static final String TAG = "GlowLetterMain";
    private static final String APP_ORIGIN_HOST = "appassets.androidplatform.net";
    private static final String APP_URL = "https://" + APP_ORIGIN_HOST + "/assets/web/index.html";
    private static final int FILE_CHOOSER_REQUEST = 4101;
    private static final int MAX_SPEECH_TEXT_LENGTH = Math.min(6000, TextToSpeech.getMaxSpeechInputLength());
    private static final String SPEECH_UTTERANCE_PREFIX = "glowletter-letter-";
    private static final String NATIVE_WEB_LOAD_QUERY = "_glowletter_native_load";
    private static final long WEB_BUNDLE_HEALTH_TIMEOUT_MILLIS = 15_000L;

    private WebView webView;
    private volatile WebViewAssetLoader webAssetLoader;
    private ValueCallback<Uri[]> fileChooserCallback;
    private BillingManager billingManager;
    private AppUpdateController appUpdateController;
    private GoogleSignInController googleSignIn;
    private TextToSpeech textToSpeech;
    private boolean speechInitializationComplete;
    private boolean speechReady;
    private String pendingSpeechText;
    private String pendingSpeechLanguage;
    private long speechUtteranceSequence;
    private volatile String activeSpeechUtteranceId;
    private volatile boolean trustedMainDocumentReady;
    /** The main frame is loading the bundled app (set before its scripts run). */
    private volatile boolean trustedMainDocumentStarted;
    private String pendingAuthCallbackUrl;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private WebBundleManager webBundleManager;
    private WebBundleManager.Selection webBundleSelection = WebBundleManager.Selection.bundled();
    private Runnable webBundleHealthTimeout;
    private long mainDocumentLoadSequence;
    private long nativeWebLoadSequence;
    private String currentNativeWebLoadToken = "";
    private WebBundleManager.Selection currentNativeWebLoadSelection = WebBundleManager.Selection.bundled();
    private boolean webBundleRecoveryInProgress;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(23, 23, 34));
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        setContentView(root);
        configureBackNavigation();
        // Android 15/16 may not expose an InsetsController until the decor view
        // is attached. Enter immersive mode on the next UI turn to avoid a
        // startup crash on modern devices.
        root.post(this::enterImmersiveMode);

        initializeWebBundleManager();
        billingManager = new BillingManager(this, this::dispatchEntitlementToWeb);
        appUpdateController = new AppUpdateController(this, this::dispatchAppUpdateToWeb);
        googleSignIn = new GoogleSignInController(this, this::dispatchGoogleCredentialToWeb);
        configureWebView();
        initializeSpeechEngine();
        billingManager.start();
        captureAuthCallback(getIntent());
        loadSelectedWebBundle();
    }

    private void initializeWebBundleManager() {
        try {
            webBundleManager = new WebBundleManager(this);
            webBundleSelection = webBundleManager.selectForColdStart();
        } catch (Exception exception) {
            webBundleManager = null;
            webBundleSelection = WebBundleManager.Selection.bundled();
            Log.i(TAG, "Signed web bundle support is unavailable; using APK assets");
        }
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    private void configureWebView() {
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        webView.setBackgroundColor(Color.TRANSPARENT);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        // The Google Play build deliberately has no weather/location feature.
        // Keep WebView geolocation disabled even if a future web bundle calls it.
        settings.setGeolocationEnabled(false);
        settings.setAllowFileAccess(false);
        // The system audio picker returns a one-time content:// URI. Keep file://
        // access disabled, but permit WebView to consume the URI explicitly
        // selected by the user.
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        // Every verified release intentionally reuses the same appassets origin and paths.
        // Bypass WebView's HTTP cache so a newly selected or fallback release is always read
        // from its currently mounted private directory.
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        webAssetLoader = createWebAssetLoader(webBundleSelection);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebViewAssetLoader loader = webAssetLoader;
                WebResourceResponse response = loader == null
                        ? null
                        : loader.shouldInterceptRequest(request.getUrl());
                return response != null ? response : super.shouldInterceptRequest(view, request);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                // The JavaScript bridge is injected into every frame by the WebView
                // API. The bundled app has no iframe use-case, so fail closed for
                // every subframe navigation even if the page CSP is ever weakened.
                if (!request.isForMainFrame()) {
                    return true;
                }
                if (isTrustedAppDocumentUri(uri)) {
                    return false;
                }
                String scheme = uri != null ? uri.getScheme() : null;
                if ("https".equalsIgnoreCase(scheme)
                        || "http".equalsIgnoreCase(scheme)
                        || "mailto".equalsIgnoreCase(scheme)
                        || "sms".equalsIgnoreCase(scheme)
                        || "smsto".equalsIgnoreCase(scheme)
                        || "tel".equalsIgnoreCase(scheme)) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (ActivityNotFoundException ignored) {
                        // Leave the page in place if the device has no browser.
                    }
                }
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                if (isStaleNativeWebLoadUrl(url)) {
                    return;
                }
                trustedMainDocumentReady = false;
                trustedMainDocumentStarted = isTrustedAppMainDocumentUrl(url);
                webBundleRecoveryInProgress = false;
                mainDocumentLoadSequence++;
                armWebBundleHealthTimeout(
                        url,
                        mainDocumentLoadSequence,
                        currentNativeWebLoadSelection
                );
            }

            @Override
            public void onReceivedError(
                    WebView view,
                    WebResourceRequest request,
                    WebResourceError error
            ) {
                super.onReceivedError(view, request, error);
                String failedUrl = request.getUrl().toString();
                if (request.isForMainFrame() && isCurrentNativeWebLoadUrl(failedUrl)) {
                    recoverFromWebBundleFailure(currentNativeWebLoadSelection);
                }
            }

            @Override
            public void onReceivedHttpError(
                    WebView view,
                    WebResourceRequest request,
                    WebResourceResponse errorResponse
            ) {
                super.onReceivedHttpError(view, request, errorResponse);
                String failedUrl = request.getUrl().toString();
                if (request.isForMainFrame() && isCurrentNativeWebLoadUrl(failedUrl)) {
                    recoverFromWebBundleFailure(currentNativeWebLoadSelection);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (isStaleNativeWebLoadUrl(url)) {
                    return;
                }
                boolean currentNativeMainDocument = isCurrentNativeWebLoadUrl(url);
                boolean needsDownloadedBundleHealthCheck = currentNativeMainDocument
                        && currentNativeWebLoadSelection != null
                        && currentNativeWebLoadSelection.isDownloaded();
                if (isTrustedAppDocumentUrl(url)) {
                    trustedMainDocumentReady = isTrustedAppMainDocumentUrl(url)
                            && !needsDownloadedBundleHealthCheck;
                    if (trustedMainDocumentReady) {
                        billingManager.notifyWebState();
                        dispatchAppUpdateToWeb(appUpdateController.state());
                    }
                } else {
                    trustedMainDocumentReady = false;
                }
                dispatchPendingAuthCallback();
                if (currentNativeMainDocument) {
                    verifyWebBundleHealth(
                            view,
                            mainDocumentLoadSequence,
                            currentNativeWebLoadSelection
                    );
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                    WebView view,
                    ValueCallback<Uri[]> callback,
                    FileChooserParams fileChooserParams
            ) {
                if (!isTrustedAppDocumentUrl(view.getUrl())) {
                    callback.onReceiveValue(null);
                    return false;
                }
                if (fileChooserCallback != null) {
                    fileChooserCallback.onReceiveValue(null);
                }
                fileChooserCallback = callback;
                try {
                    Intent intent = fileChooserParams.createIntent();
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException exception) {
                    fileChooserCallback = null;
                    callback.onReceiveValue(null);
                    return false;
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(
                    String origin,
                    GeolocationPermissions.Callback callback
            ) {
                callback.invoke(origin, false, false);
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // Camera and microphone are intentionally outside this app's scope.
                request.deny();
            }
        });

        webView.addJavascriptInterface(new BillingBridge(this, billingManager), "NurBilling");
        webView.addJavascriptInterface(new AuthBridge(this), "NurAuth");
        webView.addJavascriptInterface(new ShareBridge(this), "NurShare");
        webView.addJavascriptInterface(new SpeechBridge(this), "NurSpeech");
        webView.addJavascriptInterface(new AppUpdateBridge(this), "NurAppUpdate");
    }

    private WebViewAssetLoader createWebAssetLoader(WebBundleManager.Selection selection) {
        WebViewAssetLoader.Builder builder = new WebViewAssetLoader.Builder();
        if (selection != null && selection.isDownloaded()) {
            // The complete verified release owns /assets/web/. A missing file must
            // remain a 404 rather than being mixed with a different APK release.
            builder.addPathHandler(
                    "/assets/web/",
                    new WebViewAssetLoader.InternalStoragePathHandler(this, selection.webDirectory)
            );
        }
        builder.addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this));
        return builder.build();
    }

    private void loadSelectedWebBundle() {
        if (webView == null) {
            return;
        }
        nativeWebLoadSequence++;
        String selectedVersion = webBundleSelection == null || !webBundleSelection.isDownloaded()
                ? "apk-" + BuildConfig.BUNDLED_WEB_BUNDLE_VERSION
                : "web-" + webBundleSelection.bundleVersion();
        currentNativeWebLoadToken = selectedVersion + "-" + nativeWebLoadSequence;
        currentNativeWebLoadSelection = webBundleSelection;
        String selectedUrl = Uri.parse(APP_URL)
                .buildUpon()
                .appendQueryParameter(NATIVE_WEB_LOAD_QUERY, currentNativeWebLoadToken)
                .build()
                .toString();
        webView.loadUrl(selectedUrl);
    }

    private boolean isCurrentNativeWebLoadUrl(String url) {
        if (!isTrustedAppMainDocumentUrl(url)) {
            return false;
        }
        return currentNativeWebLoadToken.equals(
                Uri.parse(url).getQueryParameter(NATIVE_WEB_LOAD_QUERY)
        );
    }

    private boolean isStaleNativeWebLoadUrl(String url) {
        if (!isTrustedAppMainDocumentUrl(url)) {
            return false;
        }
        String token = Uri.parse(url).getQueryParameter(NATIVE_WEB_LOAD_QUERY);
        return token != null && !currentNativeWebLoadToken.equals(token);
    }

    private void armWebBundleHealthTimeout(
            String url,
            long sequence,
            WebBundleManager.Selection selection
    ) {
        cancelWebBundleHealthTimeout();
        if (!isCurrentNativeWebLoadUrl(url)
                || selection == null
                || !selection.isDownloaded()) {
            return;
        }
        webBundleHealthTimeout = () -> {
            if (sequence == mainDocumentLoadSequence && selection == webBundleSelection) {
                recoverFromWebBundleFailure(selection);
            }
        };
        mainHandler.postDelayed(webBundleHealthTimeout, WEB_BUNDLE_HEALTH_TIMEOUT_MILLIS);
    }

    private void cancelWebBundleHealthTimeout() {
        if (webBundleHealthTimeout != null) {
            mainHandler.removeCallbacks(webBundleHealthTimeout);
            webBundleHealthTimeout = null;
        }
    }

    private void verifyWebBundleHealth(
            WebView target,
            long sequence,
            WebBundleManager.Selection selection
    ) {
        if (selection == null || !selection.isDownloaded()) {
            cancelWebBundleHealthTimeout();
            checkForWebBundleUpdate();
            return;
        }
        String expectedAppVersion = JSONObject.quote(selection.expectedAppVersion());
        String script = "(function(){try{return Boolean("
                + "document.readyState==='complete'"
                + "&&document.getElementById('app')"
                + "&&window.NUR_APP_CONFIG"
                + "&&String(window.NUR_APP_CONFIG.appVersion||'')===" + expectedAppVersion
                + "&&typeof window.onNativeEntitlement==='function'"
                + ");}catch(_){return false;}})();";
        target.evaluateJavascript(script, result -> {
            if (target != webView
                    || sequence != mainDocumentLoadSequence
                    || selection != webBundleSelection) {
                return;
            }
            cancelWebBundleHealthTimeout();
            if ("true".equals(result)) {
                if (webBundleManager != null) {
                    webBundleManager.markHealthy(selection);
                }
                trustedMainDocumentReady = target == webView
                        && isTrustedAppMainDocumentUrl(target.getUrl());
                if (trustedMainDocumentReady && billingManager != null) {
                    billingManager.notifyWebState();
                    dispatchPendingAuthCallback();
                }
                checkForWebBundleUpdate();
            } else {
                recoverFromWebBundleFailure(selection);
            }
        });
    }

    private void recoverFromWebBundleFailure(WebBundleManager.Selection failedSelection) {
        if (webBundleRecoveryInProgress
                || failedSelection == null
                || !failedSelection.isDownloaded()
                || failedSelection != webBundleSelection) {
            return;
        }
        webBundleRecoveryInProgress = true;
        cancelWebBundleHealthTimeout();
        WebBundleManager.Selection fallback = webBundleManager == null
                ? WebBundleManager.Selection.bundled()
                : webBundleManager.fallbackAfterFailure(failedSelection);
        webBundleSelection = fallback;
        webAssetLoader = createWebAssetLoader(fallback);
        trustedMainDocumentReady = false;
        trustedMainDocumentStarted = false;
        if (webView != null) {
            webView.stopLoading();
            loadSelectedWebBundle();
        }
    }

    private void checkForWebBundleUpdate() {
        if (webBundleManager != null) {
            webBundleManager.checkForUpdateAsync();
        }
    }

    private void initializeSpeechEngine() {
        textToSpeech = new TextToSpeech(this, status -> {
            speechInitializationComplete = true;
            speechReady = status == TextToSpeech.SUCCESS && textToSpeech != null;
            if (!speechReady) {
                pendingSpeechText = null;
                pendingSpeechLanguage = null;
                dispatchSpeechState("error");
                return;
            }
            textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {
                    dispatchCurrentSpeechState(utteranceId, "started", false);
                }

                @Override
                public void onDone(String utteranceId) {
                    dispatchCurrentSpeechState(utteranceId, "done", true);
                }

                @Override
                public void onError(String utteranceId) {
                    dispatchCurrentSpeechState(utteranceId, "error", true);
                }

                @Override
                public void onStop(String utteranceId, boolean interrupted) {
                    dispatchCurrentSpeechState(utteranceId, "stopped", true);
                }
            });
            if (pendingSpeechText != null) {
                String text = pendingSpeechText;
                String language = pendingSpeechLanguage;
                pendingSpeechText = null;
                pendingSpeechLanguage = null;
                speakWithSystemVoice(text, language);
            }
        });
    }

    void speakTextFromWeb(String rawText, String rawLanguage) {
        if (!isTrustedSpeechRequest()) {
            return;
        }
        String text = boundedSpeechText(rawText);
        if (text.isEmpty()) {
            dispatchSpeechState("error");
            return;
        }
        String language = normalizedSpeechLanguage(rawLanguage);
        if (!speechInitializationComplete) {
            pendingSpeechText = text;
            pendingSpeechLanguage = language;
            dispatchSpeechState("loading");
            return;
        }
        if (!speechReady || textToSpeech == null) {
            dispatchSpeechState("error");
            return;
        }
        speakWithSystemVoice(text, language);
    }

    void stopSpeechFromWeb() {
        if (!isTrustedSpeechRequest()) {
            return;
        }
        pendingSpeechText = null;
        pendingSpeechLanguage = null;
        activeSpeechUtteranceId = null;
        if (textToSpeech != null) {
            textToSpeech.stop();
        }
        dispatchSpeechState("stopped");
    }

    private boolean isTrustedSpeechRequest() {
        return webView != null
                && trustedMainDocumentReady
                && isTrustedAppMainDocumentUrl(webView.getUrl());
    }

    private void speakWithSystemVoice(String text, String language) {
        if (textToSpeech == null) {
            dispatchSpeechState("error");
            return;
        }
        Locale preferred = Locale.forLanguageTag(language);
        int languageResult = textToSpeech.setLanguage(preferred);
        if (languageResult == TextToSpeech.LANG_MISSING_DATA
                || languageResult == TextToSpeech.LANG_NOT_SUPPORTED) {
            languageResult = textToSpeech.setLanguage(Locale.getDefault());
        }
        if (languageResult == TextToSpeech.LANG_MISSING_DATA
                || languageResult == TextToSpeech.LANG_NOT_SUPPORTED) {
            dispatchSpeechState("error");
            return;
        }
        textToSpeech.setSpeechRate(0.9f);
        String utteranceId = SPEECH_UTTERANCE_PREFIX + (++speechUtteranceSequence);
        activeSpeechUtteranceId = utteranceId;
        int result = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId);
        if (result == TextToSpeech.ERROR) {
            activeSpeechUtteranceId = null;
            dispatchSpeechState("error");
        }
    }

    private void dispatchCurrentSpeechState(String utteranceId, String state, boolean terminal) {
        runOnUiThread(() -> {
            if (utteranceId == null || !utteranceId.equals(activeSpeechUtteranceId)) {
                return;
            }
            if (terminal) {
                activeSpeechUtteranceId = null;
            }
            dispatchSpeechState(state);
        });
    }

    private String boundedSpeechText(String value) {
        if (value == null) {
            return "";
        }
        StringBuilder clean = new StringBuilder(Math.min(value.length(), MAX_SPEECH_TEXT_LENGTH));
        for (int offset = 0; offset < value.length() && clean.length() < MAX_SPEECH_TEXT_LENGTH; ) {
            int codePoint = value.codePointAt(offset);
            offset += Character.charCount(codePoint);
            if (!Character.isISOControl(codePoint) || codePoint == '\n' || codePoint == '\t') {
                clean.appendCodePoint(codePoint);
            }
        }
        return clean.toString().trim();
    }

    private String normalizedSpeechLanguage(String value) {
        String language = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if (language.startsWith("fr")) {
            return "fr-FR";
        }
        if (language.startsWith("en")) {
            return "en-US";
        }
        if (language.startsWith("de")) {
            return "de-DE";
        }
        if (language.startsWith("es")) {
            return "es-ES";
        }
        if (language.startsWith("it")) {
            return "it-IT";
        }
        if (language.startsWith("pl")) {
            return "pl-PL";
        }
        if (language.startsWith("uk")) {
            return "uk-UA";
        }
        if (language.startsWith("pt")) {
            return "pt-PT";
        }
        if (language.startsWith("nl")) {
            return "nl-NL";
        }
        if (language.startsWith("tr")) {
            return "tr-TR";
        }
        if (language.startsWith("ro")) {
            return "ro-RO";
        }
        if (language.startsWith("cs")) {
            return "cs-CZ";
        }
        if (language.startsWith("sv")) {
            return "sv-SE";
        }
        if (language.startsWith("el")) {
            return "el-GR";
        }
        if (language.startsWith("da")) {
            return "da-DK";
        }
        if (language.startsWith("no") || language.startsWith("nb") || language.startsWith("nn")) {
            return "nb-NO";
        }
        if (language.startsWith("fi")) {
            return "fi-FI";
        }
        if (language.startsWith("ja")) {
            return "ja-JP";
        }
        if (language.startsWith("ko")) {
            return "ko-KR";
        }
        if (language.startsWith("zh")) {
            return "zh-TW";
        }
        if (language.startsWith("th")) {
            return "th-TH";
        }
        if (language.startsWith("ar")) {
            return "ar-SA";
        }
        if (language.startsWith("id") || language.startsWith("in")) {
            return "id-ID";
        }
        if (language.startsWith("vi")) {
            return "vi-VN";
        }
        return "ru-RU";
    }

    private void dispatchSpeechState(String state) {
        if (!isTrustedSpeechRequest()) {
            return;
        }
        webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('nur-speech-state',{detail:{state:'"
                        + state
                        + "'}}));",
                null
        );
    }

    private boolean isTrustedAppUri(Uri uri) {
        return uri != null
                && "https".equalsIgnoreCase(uri.getScheme())
                && APP_ORIGIN_HOST.equalsIgnoreCase(uri.getHost())
                && uri.getUserInfo() == null
                && uri.getPort() == -1;
    }

    private boolean isTrustedAppDocumentUri(Uri uri) {
        if (!isTrustedAppUri(uri)) {
            return false;
        }
        String path = uri.getPath();
        return "/assets/web/index.html".equals(path)
                || "/assets/web/privacy.html".equals(path)
                || "/assets/web/terms.html".equals(path)
                || "/assets/web/delete-account.html".equals(path);
    }

    private boolean isTrustedAppDocumentUrl(String url) {
        return url != null && isTrustedAppDocumentUri(Uri.parse(url));
    }

    private boolean isTrustedAppMainDocumentUrl(String url) {
        if (url == null) {
            return false;
        }
        Uri uri = Uri.parse(url);
        return isTrustedAppUri(uri) && "/assets/web/index.html".equals(uri.getPath());
    }

    void openAuthorizeUrlFromWeb(String url) {
        if (!trustedMainDocumentReady
                || webView == null
                || !isTrustedAppMainDocumentUrl(webView.getUrl())
                || !AuthUrlPolicy.isAllowedAuthorizeUrl(url)) {
            return;
        }
        try {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            browserIntent.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(browserIntent);
        } catch (ActivityNotFoundException ignored) {
            // Keep the trusted local page in place if no browser can handle HTTPS.
        }
    }

    void startGoogleSignInFromWeb(String hashedNonce, boolean automatic) {
        if (isTrustedMainDocumentActive() && googleSignIn != null) {
            googleSignIn.signIn(hashedNonce, automatic);
        }
    }

    /** The ID token goes only to the trusted main document, never to events. */
    private void dispatchGoogleCredentialToWeb(String status, String idToken) {
        WebView target = webView;
        if (target == null) {
            return;
        }
        String script = "(function(){"
                + "var d={status:" + JSONObject.quote(status)
                + ",idToken:" + JSONObject.quote(idToken == null ? "" : idToken) + "};"
                + "if(typeof window.onNativeGoogleCredential==='function'){window.onNativeGoogleCredential(d);}"
                + "})();";
        target.post(() -> {
            if (webView == target && isTrustedMainDocumentActive()) {
                target.evaluateJavascript(script, null);
            }
        });
    }

    void startAppUpdateFromWeb() {
        if (isTrustedMainDocumentActive() && appUpdateController != null) {
            appUpdateController.startUpdate();
        }
    }

    void completeAppUpdateFromWeb() {
        if (isTrustedMainDocumentActive() && appUpdateController != null) {
            appUpdateController.completeUpdate();
        }
    }

    /** Entitlement snapshot for the bundled app only; called on the WebView JS thread. */
    String billingEntitlementForWeb() {
        if (!trustedMainDocumentStarted || billingManager == null) {
            return "{\"entitled\":false,\"reason\":\"untrusted_document\"}";
        }
        return billingManager.getEntitlementJson();
    }

    void updateBillingAuthSessionFromWeb(String accessToken) {
        if (isTrustedMainDocumentLoaded() && billingManager != null) {
            billingManager.updateAuthSession(accessToken);
        }
    }

    void purchaseSubscriptionFromWeb() {
        if (isTrustedMainDocumentActive() && billingManager != null) {
            billingManager.purchaseSubscription();
        }
    }

    void purchaseYearlySubscriptionFromWeb() {
        if (isTrustedMainDocumentActive() && billingManager != null) {
            billingManager.purchaseYearlySubscription();
        }
    }

    void restorePurchasesFromWeb() {
        if (isTrustedMainDocumentActive() && billingManager != null) {
            billingManager.restorePurchases();
        }
    }

    /** The bundled app is the current main document, even while it is still loading. */
    private boolean isTrustedMainDocumentLoaded() {
        return trustedMainDocumentStarted
                && webView != null
                && isTrustedAppMainDocumentUrl(webView.getUrl());
    }

    private boolean isTrustedMainDocumentActive() {
        return trustedMainDocumentReady
                && webView != null
                && isTrustedAppMainDocumentUrl(webView.getUrl());
    }

    void openManageSubscriptionFromWeb() {
        if (!trustedMainDocumentReady
                || webView == null
                || !isTrustedAppMainDocumentUrl(webView.getUrl())) {
            return;
        }

        Uri managementUri = Uri.parse(PlaySubscriptionLinks.manageSubscriptionUrl(
                BuildConfig.SUBSCRIPTION_PRODUCT_ID,
                BuildConfig.APPLICATION_ID.replaceFirst("\\.debug$", "")
        ));
        Intent playStoreIntent = new Intent(Intent.ACTION_VIEW, managementUri)
                .addCategory(Intent.CATEGORY_BROWSABLE)
                .setPackage("com.android.vending");
        try {
            startActivity(playStoreIntent);
            return;
        } catch (ActivityNotFoundException ignored) {
            // Devices without Play Store can use the same HTTPS management page.
        }
        try {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, managementUri)
                    .addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(browserIntent);
        } catch (ActivityNotFoundException ignored) {
            // Keep the trusted page open when no handler is installed.
        }
    }

    void openShareSheetFromWeb(String title, String text, String url) {
        if (!trustedMainDocumentReady
                || webView == null
                || !isTrustedAppMainDocumentUrl(webView.getUrl())) {
            return;
        }
        String rawUrl = url == null ? "" : url.trim();
        if (rawUrl.isEmpty()
                || rawUrl.length() > 8192
                || rawUrl.chars().anyMatch(Character::isISOControl)) {
            return;
        }
        Uri shareUri;
        try {
            shareUri = Uri.parse(rawUrl);
        } catch (RuntimeException ignored) {
            return;
        }
        if (!"https".equalsIgnoreCase(shareUri.getScheme())
                || shareUri.getHost() == null
                || shareUri.getUserInfo() != null
                || shareUri.getPort() != -1) {
            return;
        }

        String safeTitle = boundedShareText(title, 160, "GlowLetter");
        String safeText = boundedShareText(text, 1200, "GlowLetter");
        String payload = safeText + "\n" + shareUri;
        Intent sendIntent = new Intent(Intent.ACTION_SEND)
                .setType("text/plain")
                .putExtra(Intent.EXTRA_SUBJECT, safeTitle)
                .putExtra(Intent.EXTRA_TEXT, payload);
        try {
            startActivity(Intent.createChooser(sendIntent, safeTitle));
        } catch (RuntimeException ignored) {
            // Keep the trusted app open when no share target is installed.
        }
    }

    /**
     * Shares a card rendered by the page (PNG or PDF) through the system share
     * sheet. The bytes land in the private cache and are exposed only through
     * the FileProvider grant attached to this one intent.
     */
    void openFileShareSheetFromWeb(String base64, String mimeType, String fileName) {
        if (base64 == null || base64.isEmpty() || base64.length() > 24_000_000) {
            return;
        }
        String safeMime;
        String extension;
        if ("application/pdf".equals(mimeType)) {
            safeMime = "application/pdf";
            extension = ".pdf";
        } else if ("image/png".equals(mimeType)) {
            safeMime = "image/png";
            extension = ".png";
        } else if ("image/jpeg".equals(mimeType)) {
            safeMime = "image/jpeg";
            extension = ".jpg";
        } else {
            return;
        }
        String safeName = fileName == null ? "" : fileName.replaceAll("[^\\p{L}\\p{N}._-]", "-");
        if (safeName.isEmpty() || safeName.length() > 80 || !safeName.endsWith(extension)) {
            safeName = "GlowLetter-QR" + extension;
        }
        byte[] bytes;
        try {
            bytes = android.util.Base64.decode(base64, android.util.Base64.DEFAULT);
        } catch (IllegalArgumentException ignored) {
            return;
        }
        File directory = new File(getCacheDir(), "share");
        if (!directory.isDirectory() && !directory.mkdirs()) {
            return;
        }
        File target = new File(directory, safeName);
        try (FileOutputStream output = new FileOutputStream(target)) {
            output.write(bytes);
        } catch (IOException ignored) {
            return;
        }
        Uri uri;
        try {
            uri = FileProvider.getUriForFile(this, getPackageName() + ".files", target);
        } catch (IllegalArgumentException ignored) {
            return;
        }
        Intent sendIntent = new Intent(Intent.ACTION_SEND)
                .setType(safeMime)
                .putExtra(Intent.EXTRA_STREAM, uri)
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        try {
            startActivity(Intent.createChooser(sendIntent, "GlowLetter"));
        } catch (RuntimeException ignored) {
            // Keep the trusted app open when no share target is installed.
        }
    }

    private static String boundedShareText(String value, int maxLength, String fallback) {
        String clean = value == null ? "" : value.replaceAll("[\\p{Cntrl}&&[^\\r\\n\\t]]", "").trim();
        if (clean.isEmpty()) {
            return fallback;
        }
        return clean.length() <= maxLength ? clean : clean.substring(0, maxLength);
    }

    private void captureAuthCallback(Intent intent) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction())) {
            return;
        }
        String callbackUrl = intent.getDataString();
        if (!AuthUrlPolicy.isAllowedCallbackUrl(callbackUrl)) {
            return;
        }
        pendingAuthCallbackUrl = callbackUrl;
        // The authorization code is single-use. Do not leave it attached to the
        // Activity's long-lived Intent after copying it into the in-memory handoff.
        intent.setData(null);
        dispatchPendingAuthCallback();
    }

    private void dispatchPendingAuthCallback() {
        WebView target = webView;
        String callbackUrl = pendingAuthCallbackUrl;
        if (target == null
                || callbackUrl == null
                || !AuthUrlPolicy.isAllowedCallbackUrl(callbackUrl)
                || !trustedMainDocumentReady
                || !isTrustedAppMainDocumentUrl(target.getUrl())) {
            return;
        }

        String callbackJson = JSONObject.quote(callbackUrl);
        String script = "(function(){"
                + "var u=" + callbackJson + ";"
                + "if(typeof window.onNativeAuthCallback==='function'){window.onNativeAuthCallback(u);}"
                + "else{window.__nurPendingAuthCallback=u;}"
                + "window.dispatchEvent(new CustomEvent('nur-auth-callback',{detail:{url:u}}));"
                + "})();";
        pendingAuthCallbackUrl = null;
        target.evaluateJavascript(script, null);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        captureAuthCallback(intent);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && fileChooserCallback != null) {
            Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            fileChooserCallback.onReceiveValue(result);
            fileChooserCallback = null;
        }
    }

    private void dispatchEntitlementToWeb(BillingManager.EntitlementState state) {
        WebView target = webView;
        if (target == null) {
            return;
        }
        String price = JSONObject.quote(
                billingManager == null ? "" : billingManager.webPriceLabel(state));
        String yearlyPrice = JSONObject.quote(
                billingManager == null ? "" : billingManager.getYearlyPriceLabel());
        String reason = JSONObject.quote(state.reason);
        boolean purchaseConfigured = billingManager != null
                && billingManager.isPurchaseSecurityConfigured();
        String script = "(function(){"
                + "var d={entitled:" + state.entitled
                + ",priceLabel:" + price
                + ",yearlyPriceLabel:" + yearlyPrice
                + ",reason:" + reason
                + ",expiryTimeMillis:" + state.expiryTimeMillis
                + ",purchaseConfigured:" + purchaseConfigured
                + ",productId:" + JSONObject.quote(BuildConfig.SUBSCRIPTION_PRODUCT_ID)
                + ",productType:'subs'"
                + ",basePlanId:" + JSONObject.quote(BuildConfig.SUBSCRIPTION_BASE_PLAN_ID)
                + ",yearlyBasePlanId:" + JSONObject.quote(BuildConfig.SUBSCRIPTION_YEARLY_BASE_PLAN_ID)
                + ",legacyProductId:" + JSONObject.quote(BuildConfig.LEGACY_FULL_ACCESS_PRODUCT_ID)
                + ",legacyProductType:'inapp'};"
                + "if(typeof window.onNativeEntitlement==='function'){"
                + "window.onNativeEntitlement(d.entitled,d.priceLabel,d.reason,d.yearlyPriceLabel);"
                + "}"
                + "window.dispatchEvent(new CustomEvent('nur-entitlement',{detail:d}));"
                + "})();";
        target.post(() -> {
            if (webView == target && isTrustedAppDocumentUrl(target.getUrl())) {
                target.evaluateJavascript(script, null);
            }
        });
    }

    private void dispatchAppUpdateToWeb(AppUpdateController.State state) {
        WebView target = webView;
        if (target == null || state == null) {
            return;
        }
        String script = "(function(){"
                + "var d={status:" + JSONObject.quote(state.status)
                + ",availableVersionCode:" + state.availableVersionCode
                + ",progress:" + state.progressPercent + "};"
                + "if(typeof window.onNativeAppUpdate==='function'){window.onNativeAppUpdate(d);}"
                + "window.dispatchEvent(new CustomEvent('nur-app-update',{detail:d}));"
                + "})();";
        target.post(() -> {
            if (webView == target && isTrustedAppDocumentUrl(target.getUrl())) {
                target.evaluateJavascript(script, null);
            }
        });
    }

    private void enterImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            View decorView = getWindow().getDecorView();
            if (!decorView.isAttachedToWindow()) {
                decorView.post(this::enterImmersiveMode);
                return;
            }
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController controller = decorView.getWindowInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            enterImmersiveMode();
        }
    }

    @Override
    protected void onPause() {
        activeSpeechUtteranceId = null;
        if (textToSpeech != null) {
            textToSpeech.stop();
        }
        pendingSpeechText = null;
        pendingSpeechLanguage = null;
        dispatchSpeechState("stopped");
        if (webView != null) {
            webView.onPause();
            // GlowLetter owns a single WebView in this process, so suspending the
            // shared WebView timer clock safely stops rain and decorative motion
            // while a picker, browser or another app is in front.
            webView.pauseTimers();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
        getWindow().getDecorView().post(this::enterImmersiveMode);
        if (billingManager != null) {
            billingManager.onResume();
        }
        if (appUpdateController != null) {
            // Каждый возврат в приложение: и новая версия, и уже скачанное
            // обновление, которое ждёт перезапуска.
            appUpdateController.check();
        }
        if (trustedMainDocumentReady) {
            checkForWebBundleUpdate();
        }
    }

    private void configureBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView target = webView;
                if (target != null && target.canGoBack()) {
                    target.goBack();
                    return;
                }
                // Disable this callback before delegating so the dispatcher can
                // finish the Activity without recursively invoking us.
                setEnabled(false);
                getOnBackPressedDispatcher().onBackPressed();
            }
        });
    }

    @Override
    protected void onDestroy() {
        cancelWebBundleHealthTimeout();
        if (fileChooserCallback != null) {
            fileChooserCallback.onReceiveValue(null);
            fileChooserCallback = null;
        }
        if (billingManager != null) {
            billingManager.close();
        }
        if (appUpdateController != null) {
            appUpdateController.close();
        }
        if (googleSignIn != null) {
            googleSignIn.close();
        }
        if (webBundleManager != null) {
            webBundleManager.close();
            webBundleManager = null;
        }
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        if (webView != null) {
            webView.removeJavascriptInterface("NurBilling");
            webView.removeJavascriptInterface("NurAuth");
            webView.removeJavascriptInterface("NurShare");
            webView.removeJavascriptInterface("NurSpeech");
            webView.removeJavascriptInterface("NurAppUpdate");
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
