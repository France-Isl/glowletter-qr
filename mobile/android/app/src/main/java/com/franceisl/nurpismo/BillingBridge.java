package com.franceisl.glowletternext;

import android.webkit.JavascriptInterface;

/** Minimal, token-free surface exposed only to the bundled trusted web app. */
public final class BillingBridge {
    private final MainActivity activity;
    private final BillingManager billingManager;

    BillingBridge(MainActivity activity, BillingManager billingManager) {
        this.activity = activity;
        this.billingManager = billingManager;
    }

    @JavascriptInterface
    public String getEntitlement() {
        return activity.billingEntitlementForWeb();
    }

    /** Keeps the short-lived Supabase bearer token in native memory only. */
    @JavascriptInterface
    public void setAuthSession(String accessToken) {
        activity.runOnUiThread(() -> activity.updateBillingAuthSessionFromWeb(accessToken));
    }

    @JavascriptInterface
    public void purchaseFullAccess() {
        // Keep the existing JavaScript API name so bundled web versions remain
        // compatible. It buys the monthly plan; the yearly one has its own method.
        activity.runOnUiThread(activity::purchaseSubscriptionFromWeb);
    }

    /** Подписка на год: тот же товар, основной план yearly. */
    @JavascriptInterface
    public void purchaseYearly() {
        activity.runOnUiThread(activity::purchaseYearlySubscriptionFromWeb);
    }

    @JavascriptInterface
    public void restorePurchases() {
        activity.runOnUiThread(activity::restorePurchasesFromWeb);
    }

    @JavascriptInterface
    public void manageSubscription() {
        activity.runOnUiThread(activity::openManageSubscriptionFromWeb);
    }
}
