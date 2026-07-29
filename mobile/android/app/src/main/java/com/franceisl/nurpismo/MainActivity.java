package com.franceisl.glowletternext;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
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

public final class MainActivity extends ComponentActivity {
    private static final String APP_ORIGIN_HOST = "appassets.androidplatform.net";
    private static final String APP_URL = "https://" + APP_ORIGIN_HOST + "/assets/web/index.html"
            + (BuildConfig.OWNER_BETA_CAPABILITY.trim().isEmpty()
            ? ""
            : "#access=" + Uri.encode(BuildConfig.OWNER_BETA_CAPABILITY));
    private static final int FILE_CHOOSER_REQUEST = 4101;
    private static final int LOCATION_PERMISSION_REQUEST = 4102;

    private WebView webView;
    private ValueCallback<Uri[]> fileChooserCallback;
    private GeolocationPermissions.Callback geolocationCallback;
    private String geolocationOrigin;
    private BillingManager billingManager;
    private boolean trustedMainDocumentReady;
    private String pendingAuthCallbackUrl;

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

        billingManager = new BillingManager(this, this::dispatchEntitlementToWeb);
        configureWebView();
        billingManager.start();
        captureAuthCallback(getIntent());
        webView.loadUrl(APP_URL);
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    private void configureWebView() {
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        webView.setBackgroundColor(Color.TRANSPARENT);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(false);
        // The system audio picker returns a one-time content:// URI. Keep file://
        // access disabled, but permit WebView to consume the URI explicitly
        // selected by the user.
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = assetLoader.shouldInterceptRequest(request.getUrl());
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
                        || "mailto".equalsIgnoreCase(scheme)) {
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
                trustedMainDocumentReady = false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (isTrustedAppDocumentUrl(url)) {
                    billingManager.notifyWebState();
                }
                trustedMainDocumentReady = isTrustedAppMainDocumentUrl(url);
                dispatchPendingAuthCallback();
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
                if (!isTrustedAppUri(Uri.parse(origin))) {
                    callback.invoke(origin, false, false);
                    return;
                }
                if (hasLocationPermission()) {
                    callback.invoke(origin, true, false);
                    return;
                }
                geolocationOrigin = origin;
                geolocationCallback = callback;
                requestPermissions(
                        new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION},
                        LOCATION_PERMISSION_REQUEST
                );
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
                || "/assets/web/privacy.html".equals(path);
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
                || rawUrl.length() > 2048
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

    private boolean hasLocationPermission() {
        return checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
                || checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != LOCATION_PERMISSION_REQUEST || geolocationCallback == null) {
            return;
        }
        boolean granted = hasLocationPermission();
        geolocationCallback.invoke(geolocationOrigin, granted, false);
        geolocationCallback = null;
        geolocationOrigin = null;
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
        String price = JSONObject.quote(state.priceLabel);
        String reason = JSONObject.quote(state.reason);
        boolean purchaseConfigured = billingManager != null
                && billingManager.isPurchaseSecurityConfigured();
        String script = "(function(){"
                + "var d={entitled:" + state.entitled
                + ",priceLabel:" + price
                + ",reason:" + reason
                + ",purchaseConfigured:" + purchaseConfigured
                + ",productId:" + JSONObject.quote(BuildConfig.SUBSCRIPTION_PRODUCT_ID)
                + ",productType:'subs'"
                + ",basePlanId:" + JSONObject.quote(BuildConfig.SUBSCRIPTION_BASE_PLAN_ID)
                + ",legacyProductId:" + JSONObject.quote(BuildConfig.LEGACY_FULL_ACCESS_PRODUCT_ID)
                + ",legacyProductType:'inapp'};"
                + "if(typeof window.onNativeEntitlement==='function'){"
                + "window.onNativeEntitlement(d.entitled,d.priceLabel,d.reason);"
                + "}"
                + "window.dispatchEvent(new CustomEvent('nur-entitlement',{detail:d}));"
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
        if (fileChooserCallback != null) {
            fileChooserCallback.onReceiveValue(null);
            fileChooserCallback = null;
        }
        if (geolocationCallback != null) {
            geolocationCallback.invoke(geolocationOrigin, false, false);
            geolocationCallback = null;
        }
        if (billingManager != null) {
            billingManager.close();
        }
        if (webView != null) {
            webView.removeJavascriptInterface("NurBilling");
            webView.removeJavascriptInterface("NurAuth");
            webView.removeJavascriptInterface("NurShare");
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
