package com.franceisl.glowletternext;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.android.billingclient.api.BillingClient;

import org.junit.Test;

public final class PurchaseVerifierPolicyTest {
    @Test
    public void productionCatalogIdentifiersRemainExact() {
        assertEquals("glowletter_premium_monthly", BuildConfig.SUBSCRIPTION_PRODUCT_ID);
        assertEquals("monthly", BuildConfig.SUBSCRIPTION_BASE_PLAN_ID);
        assertEquals("full_access", BuildConfig.LEGACY_FULL_ACCESS_PRODUCT_ID);
    }

    @Test
    public void rejectedPurchaseAndIntegrityResponsesAreAuthoritative() {
        assertTrue(PurchaseVerifier.isAuthoritativeRejectionStatus(400));
        assertTrue(PurchaseVerifier.isAuthoritativeRejectionStatus(403));
        assertTrue(PurchaseVerifier.isAuthoritativeRejectionStatus(404));
        assertTrue(PurchaseVerifier.isAuthoritativeRejectionStatus(410));
        assertTrue(PurchaseVerifier.isAuthoritativeRejectionStatus(422));
    }

    @Test
    public void throttlingAndServerFailuresRemainTransient() {
        assertFalse(PurchaseVerifier.isAuthoritativeRejectionStatus(401));
        assertFalse(PurchaseVerifier.isAuthoritativeRejectionStatus(429));
        assertFalse(PurchaseVerifier.isAuthoritativeRejectionStatus(500));
        assertFalse(PurchaseVerifier.isAuthoritativeRejectionStatus(503));
    }

    @Test
    public void onlySubscriptionAndLegacyProductTypePairsAreAccepted() {
        assertTrue(PurchaseVerifier.isExpectedProduct(
                BuildConfig.SUBSCRIPTION_PRODUCT_ID,
                BillingClient.ProductType.SUBS
        ));
        assertTrue(PurchaseVerifier.isExpectedProduct(
                BuildConfig.LEGACY_FULL_ACCESS_PRODUCT_ID,
                BillingClient.ProductType.INAPP
        ));
        assertFalse(PurchaseVerifier.isExpectedProduct(
                BuildConfig.SUBSCRIPTION_PRODUCT_ID,
                BillingClient.ProductType.INAPP
        ));
        assertFalse(PurchaseVerifier.isExpectedProduct(
                BuildConfig.LEGACY_FULL_ACCESS_PRODUCT_ID,
                BillingClient.ProductType.SUBS
        ));
        assertFalse(PurchaseVerifier.isExpectedProduct("unknown", BillingClient.ProductType.SUBS));
    }

    @Test
    public void versionTwoCanonicalRequestBindsProductType() {
        assertEquals(
                "com.franceisl.glowletternext\n"
                        + "glowletter_premium_monthly\n"
                        + "subs\n"
                        + "purchase-token",
                PurchaseVerifier.canonicalRequest(
                        "com.franceisl.glowletternext",
                        "glowletter_premium_monthly",
                        "subs",
                        "purchase-token"
                )
        );
    }
}
