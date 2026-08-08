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
        return billingManager.getEntitlementJson();
    }

    /** Keeps the short-lived Supabase bearer token in native memory only. */
    @JavascriptInterface
    public void setAuthSession(String accessToken) {
        activity.runOnUiThread(() -> billingManager.updateAuthSession(accessToken));
    }

    @JavascriptInterface
    public void purchaseFullAccess() {
        // Keep the existing JavaScript API name so bundled web versions remain
        // compatible; the only newly launched Play flow is the subscription.
        activity.runOnUiThread(billingManager::purchaseSubscription);
    }

    @JavascriptInterface
    public void restorePurchases() {
        activity.runOnUiThread(billingManager::restorePurchases);
    }

    @JavascriptInterface
    public void manageSubscription() {
        activity.runOnUiThread(activity::openManageSubscriptionFromWeb);
    }
}
