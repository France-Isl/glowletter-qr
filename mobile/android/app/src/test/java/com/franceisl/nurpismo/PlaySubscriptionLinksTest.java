package com.franceisl.glowletternext;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.Test;

public final class PlaySubscriptionLinksTest {
    @Test
    public void buildsManagementUrlForExactProductionSubscription() {
        assertEquals(
                "https://play.google.com/store/account/subscriptions"
                        + "?sku=glowletter_premium_monthly"
                        + "&package=com.franceisl.glowletternext",
                PlaySubscriptionLinks.manageSubscriptionUrl(
                        BuildConfig.SUBSCRIPTION_PRODUCT_ID,
                        "com.franceisl.glowletternext"
                )
        );
    }

    @Test
    public void rejectsIdentifiersThatCouldAlterTheDestination() {
        assertRejected("glowletter_premium_monthly&package=attacker", "com.franceisl.glowletternext");
        assertRejected("glowletter_premium_monthly", "com.franceisl.glowletternext/path");
    }

    private static void assertRejected(String productId, String packageName) {
        try {
            PlaySubscriptionLinks.manageSubscriptionUrl(productId, packageName);
            fail("Expected unsafe identifier to be rejected");
        } catch (IllegalArgumentException expected) {
            // Expected.
        }
    }
}
