package com.franceisl.glowletternext;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryProductDetailsResult;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

final class BillingManager implements PurchasesUpdatedListener {
    interface Listener {
        void onEntitlementChanged(EntitlementState state);
    }

    static final class EntitlementState {
        final boolean entitled;
        final String priceLabel;
        final String reason;
        final boolean mock;
        final long expiryTimeMillis;
        final long monotonicDeadlineMillis;

        EntitlementState(
                boolean entitled,
                String priceLabel,
                String reason,
                boolean mock,
                long expiryTimeMillis,
                long monotonicDeadlineMillis
        ) {
            this.entitled = entitled;
            this.priceLabel = priceLabel;
            this.reason = reason;
            this.mock = mock;
            this.expiryTimeMillis = expiryTimeMillis;
            this.monotonicDeadlineMillis = monotonicDeadlineMillis;
        }
    }

    private interface ProductCallback {
        void onResult(
                ProductDetails details,
                ProductDetails.SubscriptionOfferDetails offer,
                String priceLabel,
                String error
        );
    }

    private interface PurchasesCallback {
        void onResult(BillingResult result, List<Purchase> purchases);
    }

    private static final class PurchaseCandidate {
        final Purchase purchase;
        final String productId;
        final String productType;

        PurchaseCandidate(Purchase purchase, String productId, String productType) {
            this.purchase = purchase;
            this.productId = productId;
            this.productType = productType;
        }
    }

    private static final class CandidateCollection {
        final List<PurchaseCandidate> candidates = new ArrayList<>();
        boolean pending;
        boolean incomplete;
    }

    private static final String DEFAULT_PRICE = "€21.99/month";
    private static final String DEBUG_PREFS = "nur_billing_debug_only";
    private static final String DEBUG_MOCK_KEY = "mock_full_access";

    private final Activity activity;
    private final Listener listener;
    private final BillingClient billingClient;
    private final PurchaseVerifier verifier;
    private final PlayIntegrityProvider integrityProvider;
    private final SharedPreferences debugPreferences;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final EntitlementCoordinator entitlementCoordinator = new EntitlementCoordinator();
    private final List<Runnable> readyActions = new ArrayList<>();
    private final Runnable entitlementExpiryAction = this::handleEntitlementExpiry;

    private volatile EntitlementState state = new EntitlementState(
            false,
            DEFAULT_PRICE,
            "initializing",
            false,
            0L,
            0L
    );
    private boolean connecting;
    private boolean firstResume = true;
    private boolean purchaseFlowInProgress;
    private boolean closed;

    BillingManager(Activity activity, Listener listener) {
        this.activity = activity;
        this.listener = listener;
        this.debugPreferences = activity.getSharedPreferences(DEBUG_PREFS, Context.MODE_PRIVATE);
        this.integrityProvider = new PlayIntegrityProvider(
                activity,
                BuildConfig.PLAY_INTEGRITY_CLOUD_PROJECT_NUMBER
        );
        this.verifier = new PurchaseVerifier(BuildConfig.PURCHASE_VERIFICATION_URL, integrityProvider);
        this.billingClient = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases(
                        PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
                )
                .enableAutoServiceReconnection()
                .build();
    }

    void start() {
        if (BuildConfig.DEBUG && BuildConfig.ALLOW_DEBUG_MOCK_ENTITLEMENT) {
            boolean mockOwned = debugPreferences.getBoolean(DEBUG_MOCK_KEY, false);
            emit(mockOwned, DEFAULT_PRICE,
                    mockOwned ? "debug_mock_restored_no_payment" : "debug_mock_available_no_payment",
                    mockOwned);
            return;
        }
        if (!isBillingBackendConfigured()) {
            emit(false, DEFAULT_PRICE, "billing_security_not_configured", false);
            return;
        }
        if (!verifier.hasAuthSession()) {
            emit(false, DEFAULT_PRICE, "authentication_required", false);
            return;
        }
        integrityProvider.warmUp();
        ensureReady(() -> {
            querySubscriptionProduct((details, offer, priceLabel, error) -> {
                if (details != null && offer != null) {
                    emitTransient(priceLabel, state.reason);
                }
            });
            queryOwnedPurchases("startup_restore");
        });
    }

    void onResume() {
        // onCreate/start is immediately followed by the Activity's first
        // onResume. Avoid issuing the same catalog/purchase verification twice.
        if (firstResume) {
            firstResume = false;
            return;
        }
        if (!(BuildConfig.DEBUG && BuildConfig.ALLOW_DEBUG_MOCK_ENTITLEMENT)
                && isPurchaseSecurityConfigured()
                && !purchaseFlowInProgress
                && !entitlementCoordinator.hasVerificationInFlight()) {
            ensureReady(() -> queryOwnedPurchases("resume_restore"));
        }
    }

    void purchaseSubscription() {
        if (BuildConfig.DEBUG && BuildConfig.ALLOW_DEBUG_MOCK_ENTITLEMENT) {
            debugPreferences.edit().putBoolean(DEBUG_MOCK_KEY, true).apply();
            emit(true, DEFAULT_PRICE, "debug_mock_only_no_payment", true);
            return;
        }
        if (!isPurchaseSecurityConfigured()) {
            emitTransient(isBillingBackendConfigured()
                    ? "authentication_required"
                    : "billing_security_not_configured");
            return;
        }

        String obfuscatedAccountId = verifier.obfuscatedAccountId();
        if (obfuscatedAccountId.isEmpty()) {
            emitTransient("authentication_required");
            return;
        }

        emitTransient("opening_google_play");
        ensureReady(() -> querySubscriptionProduct((details, offer, priceLabel, error) -> {
            if (!obfuscatedAccountId.equals(verifier.obfuscatedAccountId())) {
                emitTransient("account_session_changed");
                return;
            }
            if (details == null || offer == null) {
                emitTransient(error == null ? "product_unavailable" : error);
                return;
            }

            BillingFlowParams.ProductDetailsParams.Builder productParams =
                    BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(details);
            String offerToken = offer.getOfferToken();
            if (offerToken == null || offerToken.trim().isEmpty()) {
                emitTransient("subscription_offer_token_missing");
                return;
            }
            productParams.setOfferToken(offerToken);

            BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Collections.singletonList(productParams.build()))
                    .setObfuscatedAccountId(obfuscatedAccountId)
                    .build();
            purchaseFlowInProgress = true;
            BillingResult result = billingClient.launchBillingFlow(activity, flowParams);
            int responseCode = result.getResponseCode();
            if (responseCode == BillingClient.BillingResponseCode.OK) {
                return;
            }
            purchaseFlowInProgress = false;
            if (responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
                queryOwnedPurchases("launch_already_owned_restore");
            } else {
                emitTransient(priceLabel, "billing_launch_" + responseCode);
            }
        }));
    }

    void restorePurchases() {
        if (BuildConfig.DEBUG && BuildConfig.ALLOW_DEBUG_MOCK_ENTITLEMENT) {
            boolean mockOwned = debugPreferences.getBoolean(DEBUG_MOCK_KEY, false);
            emit(mockOwned, DEFAULT_PRICE,
                    mockOwned ? "debug_mock_restored_no_payment" : "debug_mock_not_owned",
                    mockOwned);
            return;
        }
        if (!isPurchaseSecurityConfigured()) {
            emitTransient(isBillingBackendConfigured()
                    ? "authentication_required"
                    : "billing_security_not_configured");
            return;
        }
        purchaseFlowInProgress = false;
        emitTransient("restoring_purchases");
        ensureReady(() -> queryOwnedPurchases("manual_restore"));
    }

    void updateAuthSession(String accessToken) {
        if (closed) {
            return;
        }
        PurchaseVerifier.AuthUpdate update = verifier.updateAccessToken(accessToken);
        if (BuildConfig.DEBUG && BuildConfig.ALLOW_DEBUG_MOCK_ENTITLEMENT) {
            return;
        }
        if (!update.tokenChanged) {
            return;
        }

        // A result authenticated with the previous bearer token must not be
        // allowed to complete a newer account's reconciliation.
        entitlementCoordinator.beginOperation();
        entitlementCoordinator.invalidateVerification();
        purchaseFlowInProgress = false;

        if (update.identityChanged) {
            emit(false, state.priceLabel,
                    update.authenticated ? "account_session_changed" : "authentication_required",
                    false);
        }
        if (!update.authenticated) {
            if (!update.identityChanged) {
                emit(false, state.priceLabel, "authentication_required", false);
            }
            return;
        }
        if (!isBillingBackendConfigured()) {
            emit(false, state.priceLabel, "billing_security_not_configured", false);
            return;
        }

        integrityProvider.warmUp();
        ensureReady(() -> queryOwnedPurchases(
                update.identityChanged ? "account_restore" : "session_refresh_restore"
        ));
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        if (closed) {
            return;
        }
        purchaseFlowInProgress = false;
        int code = billingResult.getResponseCode();
        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            long generation = entitlementCoordinator.beginOperation();
            reconcilePurchases(
                    purchases,
                    "purchase_update",
                    generation,
                    false,
                    "purchase_update_product_mismatch"
            );
        } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            queryOwnedPurchases("callback_already_owned_restore");
        } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            emitTransient("purchase_canceled");
        } else {
            emitTransient("purchase_update_" + code);
        }
    }

    private void ensureReady(Runnable action) {
        if (closed) {
            return;
        }
        if (billingClient.isReady()) {
            action.run();
            return;
        }
        readyActions.add(action);
        if (connecting) {
            return;
        }
        connecting = true;
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (closed) {
                    return;
                }
                connecting = false;
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    readyActions.clear();
                    emitTransient("billing_unavailable_" + billingResult.getResponseCode());
                    return;
                }
                List<Runnable> pending = new ArrayList<>(readyActions);
                readyActions.clear();
                for (Runnable runnable : pending) {
                    runnable.run();
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                if (closed) {
                    return;
                }
                connecting = false;
                emitTransient("billing_disconnected");
            }
        });
    }

    private void querySubscriptionProduct(ProductCallback callback) {
        QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(BuildConfig.SUBSCRIPTION_PRODUCT_ID)
                .setProductType(BillingClient.ProductType.SUBS)
                .build();
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(product))
                .build();

        billingClient.queryProductDetailsAsync(params,
                (BillingResult billingResult, QueryProductDetailsResult result) -> {
                    if (closed) {
                        return;
                    }
                    if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        callback.onResult(null, null, DEFAULT_PRICE,
                                "product_query_" + billingResult.getResponseCode());
                        return;
                    }
                    ProductDetails details = null;
                    for (ProductDetails candidate : result.getProductDetailsList()) {
                        if (BuildConfig.SUBSCRIPTION_PRODUCT_ID.equals(candidate.getProductId())
                                && BillingClient.ProductType.SUBS.equals(candidate.getProductType())) {
                            details = candidate;
                            break;
                        }
                    }
                    if (details == null) {
                        callback.onResult(
                                null,
                                null,
                                DEFAULT_PRICE,
                                "subscription_not_configured_in_play_console"
                        );
                        return;
                    }

                    List<ProductDetails.SubscriptionOfferDetails> offers =
                            details.getSubscriptionOfferDetails();
                    List<SubscriptionOfferPolicy.Candidate> policyCandidates = new ArrayList<>();
                    if (offers != null) {
                        for (int index = 0; index < offers.size(); index += 1) {
                            ProductDetails.SubscriptionOfferDetails offer = offers.get(index);
                            ProductDetails.PricingPhase recurringPhase = null;
                            if (offer.getPricingPhases() != null
                                    && offer.getPricingPhases().getPricingPhaseList() != null) {
                                for (ProductDetails.PricingPhase phase
                                        : offer.getPricingPhases().getPricingPhaseList()) {
                                    if (phase.getRecurrenceMode()
                                            == ProductDetails.RecurrenceMode.INFINITE_RECURRING
                                            && SubscriptionOfferPolicy.MONTHLY_BILLING_PERIOD.equals(
                                            phase.getBillingPeriod())) {
                                        recurringPhase = phase;
                                        break;
                                    }
                                }
                            }
                            policyCandidates.add(new SubscriptionOfferPolicy.Candidate(
                                    index,
                                    offer.getBasePlanId(),
                                    offer.getOfferId(),
                                    offer.getOfferToken(),
                                    recurringPhase == null ? null : recurringPhase.getFormattedPrice(),
                                    recurringPhase == null ? null : recurringPhase.getBillingPeriod(),
                                    recurringPhase != null
                            ));
                        }
                    }

                    SubscriptionOfferPolicy.Selection selection =
                            SubscriptionOfferPolicy.selectBasePlan(
                                    policyCandidates,
                                    BuildConfig.SUBSCRIPTION_BASE_PLAN_ID
                            );
                    if (selection.candidate == null || offers == null) {
                        callback.onResult(null, null, DEFAULT_PRICE, selection.error);
                        return;
                    }
                    ProductDetails.SubscriptionOfferDetails selectedOffer =
                            offers.get(selection.candidate.sourceIndex);
                    callback.onResult(
                            details,
                            selectedOffer,
                            SubscriptionOfferPolicy.priceLabel(selection.candidate, DEFAULT_PRICE),
                            null
                    );
                });
    }

    private void queryOwnedPurchases(String source) {
        if (closed) {
            return;
        }
        if (!isPurchaseSecurityConfigured()) {
            emitTransient(isBillingBackendConfigured()
                    ? "authentication_required"
                    : "billing_security_not_configured");
            return;
        }
        if (purchaseFlowInProgress || entitlementCoordinator.hasVerificationInFlight()) {
            return;
        }
        long generation = entitlementCoordinator.beginOperation();
        if (generation < 0L) {
            return;
        }
        queryOwnedProductType(BillingClient.ProductType.SUBS, (subscriptionResult, subscriptions) -> {
            if (closed || !entitlementCoordinator.isCurrent(generation)) {
                return;
            }
            queryOwnedProductType(BillingClient.ProductType.INAPP, (legacyResult, legacyPurchases) -> {
                if (closed || !entitlementCoordinator.isCurrent(generation)) {
                    return;
                }
                boolean subscriptionQuerySucceeded = subscriptionResult.getResponseCode()
                        == BillingClient.BillingResponseCode.OK;
                boolean legacyQuerySucceeded = legacyResult.getResponseCode()
                        == BillingClient.BillingResponseCode.OK;
                List<Purchase> combined = new ArrayList<>();
                if (subscriptionQuerySucceeded && subscriptions != null) {
                    combined.addAll(subscriptions);
                }
                if (legacyQuerySucceeded && legacyPurchases != null) {
                    combined.addAll(legacyPurchases);
                }
                String queryFailureReason = null;
                if (!subscriptionQuerySucceeded) {
                    queryFailureReason = "subscription_restore_failed_"
                            + subscriptionResult.getResponseCode();
                } else if (!legacyQuerySucceeded) {
                    queryFailureReason = "legacy_restore_failed_"
                            + legacyResult.getResponseCode();
                }
                reconcilePurchases(
                        combined,
                        source,
                        generation,
                        subscriptionQuerySucceeded && legacyQuerySucceeded,
                        queryFailureReason
                );
            });
        });
    }

    private void queryOwnedProductType(String productType, PurchasesCallback callback) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(productType)
                .build();
        billingClient.queryPurchasesAsync(params, callback::onResult);
    }

    private void reconcilePurchases(
            List<Purchase> purchases,
            String source,
            long generation,
            boolean absenceIsAuthoritative,
            String incompleteQueryReason
    ) {
        if (closed || !entitlementCoordinator.isCurrent(generation)) {
            return;
        }
        CandidateCollection collection = collectCandidates(purchases);
        if (collection.candidates.isEmpty()) {
            entitlementCoordinator.invalidateVerification();
            if (!absenceIsAuthoritative) {
                emitTransient(incompleteQueryReason == null
                        ? source + "_incomplete_restore"
                        : incompleteQueryReason);
            } else if (collection.pending) {
                emit(false, state.priceLabel, "purchase_pending", false);
            } else if (collection.incomplete) {
                emit(false, state.priceLabel, "purchase_not_completed", false);
            } else {
                emit(false, state.priceLabel, source + "_not_owned", false);
            }
            return;
        }
        // A direct purchase callback or a partial two-type restore cannot prove
        // that the other entitlement type is absent. Only a complete SUBS +
        // INAPP reconciliation may authoritatively revoke the current grant.
        verifyCandidates(
                collection.candidates,
                0,
                generation,
                !absenceIsAuthoritative,
                incompleteQueryReason
        );
    }

    private CandidateCollection collectCandidates(List<Purchase> purchases) {
        CandidateCollection collection = new CandidateCollection();
        addCandidatesForProduct(
                purchases,
                BuildConfig.SUBSCRIPTION_PRODUCT_ID,
                BillingClient.ProductType.SUBS,
                collection
        );
        addCandidatesForProduct(
                purchases,
                BuildConfig.LEGACY_FULL_ACCESS_PRODUCT_ID,
                BillingClient.ProductType.INAPP,
                collection
        );
        return collection;
    }

    private void addCandidatesForProduct(
            List<Purchase> purchases,
            String productId,
            String productType,
            CandidateCollection collection
    ) {
        if (purchases == null) {
            return;
        }
        for (Purchase purchase : purchases) {
            if (purchase == null || !purchase.getProducts().contains(productId)) {
                continue;
            }
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                collection.candidates.add(new PurchaseCandidate(purchase, productId, productType));
            } else if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                collection.pending = true;
            } else {
                collection.incomplete = true;
            }
        }
    }

    private void verifyCandidates(
            List<PurchaseCandidate> candidates,
            int index,
            long generation,
            boolean encounteredTransientFailure,
            String lastReason
    ) {
        if (closed || !entitlementCoordinator.isCurrent(generation)) {
            return;
        }
        if (index >= candidates.size()) {
            if (encounteredTransientFailure) {
                emitTransient(lastReason == null ? "verification_failed" : lastReason);
            } else {
                emit(false, state.priceLabel,
                        lastReason == null ? "verification_rejected" : lastReason,
                        false);
            }
            return;
        }

        PurchaseCandidate candidate = candidates.get(index);
        String purchaseToken = candidate.purchase.getPurchaseToken();

        EntitlementCoordinator.VerificationAction verificationAction =
                entitlementCoordinator.beginVerification(purchaseToken, generation);
        if (verificationAction == EntitlementCoordinator.VerificationAction.STALE) {
            return;
        }
        emitTransient("verifying_purchase");
        if (verificationAction == EntitlementCoordinator.VerificationAction.COALESCED) {
            return;
        }
        verifier.verify(
                candidate.purchase,
                candidate.productId,
                candidate.productType,
                result -> {
            if (closed || !entitlementCoordinator.completeVerification(purchaseToken)) {
                return;
            }
            // Fail closed: both server verification and acknowledgement are required.
            if (result.verified && result.acknowledged && result.integrityVerified) {
                if (BillingClient.ProductType.SUBS.equals(candidate.productType)) {
                    long deadline = EntitlementExpiryPolicy.subscriptionDeadline(
                            result.serverTimeMillis,
                            result.expiryTimeMillis,
                            SystemClock.elapsedRealtime()
                    );
                    if (deadline == EntitlementExpiryPolicy.INVALID_DEADLINE) {
                        emit(false, state.priceLabel,
                                "verification_subscription_expired_or_missing_time",
                                false);
                    } else {
                        emitState(
                                true,
                                state.priceLabel,
                                result.reason,
                                false,
                                result.expiryTimeMillis,
                                deadline
                        );
                    }
                } else {
                    // The historical one-time full_access product never expires,
                    // but its purchase token is still bound server-side to one user.
                    emitState(
                            true,
                            state.priceLabel,
                            result.reason,
                            false,
                            0L,
                            EntitlementExpiryPolicy.NO_DEADLINE
                    );
                }
            } else {
                String failureReason;
                if (result.verified && result.acknowledged) {
                    failureReason = "server_did_not_verify_integrity";
                } else if (result.verified) {
                    failureReason = "server_did_not_acknowledge";
                } else {
                    failureReason = result.reason;
                }
                verifyCandidates(
                        candidates,
                        index + 1,
                        generation,
                        encounteredTransientFailure || !result.authoritativeRejection,
                        failureReason
                );
            }
        });
    }

    private void emitTransient(String reason) {
        emitTransient(state.priceLabel, reason);
    }

    private void emitTransient(String priceLabel, String reason) {
        EntitlementState current = activeState();
        if (!current.entitled) {
            emit(false, priceLabel, reason, false);
            return;
        }
        emitState(
                true,
                priceLabel,
                reason,
                current.mock,
                current.expiryTimeMillis,
                current.monotonicDeadlineMillis
        );
    }

    private void emit(boolean entitled, String priceLabel, String reason, boolean mock) {
        emitState(
                entitled,
                priceLabel,
                reason,
                mock,
                0L,
                entitled ? EntitlementExpiryPolicy.NO_DEADLINE : 0L
        );
    }

    private void emitState(
            boolean entitled,
            String priceLabel,
            String reason,
            boolean mock,
            long expiryTimeMillis,
            long monotonicDeadlineMillis
    ) {
        if (closed) {
            return;
        }
        EntitlementState next = new EntitlementState(
                entitled,
                priceLabel == null || priceLabel.trim().isEmpty() ? DEFAULT_PRICE : priceLabel,
                reason == null ? "unknown" : reason,
                mock,
                entitled ? Math.max(0L, expiryTimeMillis) : 0L,
                entitled ? monotonicDeadlineMillis : 0L
        );
        state = next;
        scheduleEntitlementExpiry(next);
        activity.runOnUiThread(() -> {
            if (!closed && state == next) {
                listener.onEntitlementChanged(next);
            }
        });
    }

    private EntitlementState activeState() {
        EntitlementState current = state;
        if (current.entitled && !EntitlementExpiryPolicy.isActive(
                true,
                current.monotonicDeadlineMillis,
                SystemClock.elapsedRealtime()
        )) {
            emit(false, current.priceLabel, "subscription_expired", false);
            return state;
        }
        return current;
    }

    private void scheduleEntitlementExpiry(EntitlementState next) {
        mainHandler.removeCallbacks(entitlementExpiryAction);
        if (!next.entitled
                || next.monotonicDeadlineMillis == EntitlementExpiryPolicy.NO_DEADLINE) {
            return;
        }
        long delay = EntitlementExpiryPolicy.remainingDelay(
                next.monotonicDeadlineMillis,
                SystemClock.elapsedRealtime()
        );
        mainHandler.postDelayed(entitlementExpiryAction, delay);
    }

    private void handleEntitlementExpiry() {
        if (closed) {
            return;
        }
        EntitlementState current = state;
        if (!current.entitled
                || current.monotonicDeadlineMillis == EntitlementExpiryPolicy.NO_DEADLINE) {
            return;
        }
        long delay = EntitlementExpiryPolicy.remainingDelay(
                current.monotonicDeadlineMillis,
                SystemClock.elapsedRealtime()
        );
        if (delay > 0L) {
            mainHandler.postDelayed(entitlementExpiryAction, delay);
            return;
        }
        emit(false, current.priceLabel, "subscription_expired", false);
    }

    String getEntitlementJson() {
        EntitlementState current = activeState();
        try {
            return new JSONObject()
                    .put("entitled", current.entitled)
                    .put("priceLabel", current.priceLabel)
                    .put("reason", current.reason)
                    .put("expiryTimeMillis", current.expiryTimeMillis)
                    .put("productId", BuildConfig.SUBSCRIPTION_PRODUCT_ID)
                    .put("productType", BillingClient.ProductType.SUBS)
                    .put("basePlanId", BuildConfig.SUBSCRIPTION_BASE_PLAN_ID)
                    .put("legacyProductId", BuildConfig.LEGACY_FULL_ACCESS_PRODUCT_ID)
                    .put("legacyProductType", BillingClient.ProductType.INAPP)
                    .put("freeLetterLimit", BuildConfig.FREE_LETTER_LIMIT)
                    .put("purchaseConfigured", isPurchaseSecurityConfigured())
                    .put("mock", current.mock)
                    .toString();
        } catch (Exception ignored) {
            return "{\"entitled\":false,\"priceLabel\":\"€21.99/month\","
                    + "\"reason\":\"serialization_error\","
                    + "\"productId\":\"glowletter_premium_monthly\","
                    + "\"legacyProductId\":\"full_access\"}";
        }
    }

    EntitlementState getState() {
        return activeState();
    }

    void notifyWebState() {
        if (!closed) {
            listener.onEntitlementChanged(activeState());
        }
    }

    void close() {
        if (closed) {
            return;
        }
        closed = true;
        purchaseFlowInProgress = false;
        entitlementCoordinator.close();
        readyActions.clear();
        mainHandler.removeCallbacksAndMessages(null);
        verifier.close();
        if (billingClient.isReady()) {
            billingClient.endConnection();
        }
    }

    boolean isPurchaseSecurityConfigured() {
        if (BuildConfig.DEBUG && BuildConfig.ALLOW_DEBUG_MOCK_ENTITLEMENT) {
            return true;
        }
        return isBillingBackendConfigured() && verifier.hasAuthSession();
    }

    private boolean isBillingBackendConfigured() {
        return verifier.isConfigured() && integrityProvider.isConfigured();
    }
}
