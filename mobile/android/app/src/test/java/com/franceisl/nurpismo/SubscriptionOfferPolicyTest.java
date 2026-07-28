package com.franceisl.glowletternext;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;

public final class SubscriptionOfferPolicyTest {
    @Test
    public void selectsOnlyExactMonthlyBasePlanAndNotPromotionalOffer() {
        SubscriptionOfferPolicy.Selection selection = SubscriptionOfferPolicy.selectBasePlan(
                Arrays.asList(
                        candidate(0, "annual", null, "annual-token", "€99.99", "P1Y", true),
                        candidate(1, "monthly", "intro", "intro-token", "€10.99", "P1M", true),
                        candidate(2, "monthly", null, "base-token", "€21.99", "P1M", true)
                ),
                "monthly"
        );

        assertNotNull(selection.candidate);
        assertEquals(2, selection.candidate.sourceIndex);
        assertEquals("base-token", selection.candidate.offerToken);
        assertEquals("€21.99/month", SubscriptionOfferPolicy.priceLabel(
                selection.candidate,
                "fallback"
        ));
    }

    @Test
    public void rejectsMissingTokenWrongPeriodAndFinitePlan() {
        SubscriptionOfferPolicy.Selection selection = SubscriptionOfferPolicy.selectBasePlan(
                Arrays.asList(
                        candidate(0, "monthly", null, "", "€21.99", "P1M", true),
                        candidate(1, "monthly", null, "year-token", "€21.99", "P1Y", true),
                        candidate(2, "monthly", null, "finite-token", "€21.99", "P1M", false)
                ),
                "monthly"
        );

        assertNull(selection.candidate);
        assertEquals("subscription_base_plan_not_available", selection.error);
    }

    @Test
    public void rejectsAmbiguousBasePlanInsteadOfChoosingArbitrarily() {
        SubscriptionOfferPolicy.Selection selection = SubscriptionOfferPolicy.selectBasePlan(
                Arrays.asList(
                        candidate(0, "monthly", null, "first", "€21.99", "P1M", true),
                        candidate(1, "monthly", null, "second", "€21.99", "P1M", true)
                ),
                "monthly"
        );

        assertNull(selection.candidate);
        assertEquals("ambiguous_subscription_base_plan", selection.error);
    }

    @Test
    public void usesFallbackWhenStorePriceIsMissing() {
        SubscriptionOfferPolicy.Candidate candidate = candidate(
                0,
                "monthly",
                null,
                "token",
                null,
                "P1M",
                true
        );
        assertEquals("€21.99/month", SubscriptionOfferPolicy.priceLabel(
                candidate,
                "€21.99/month"
        ));
        assertNull(SubscriptionOfferPolicy.selectBasePlan(
                Collections.emptyList(),
                "monthly"
        ).candidate);
    }

    private static SubscriptionOfferPolicy.Candidate candidate(
            int index,
            String basePlanId,
            String offerId,
            String offerToken,
            String price,
            String billingPeriod,
            boolean infiniteRecurring
    ) {
        return new SubscriptionOfferPolicy.Candidate(
                index,
                basePlanId,
                offerId,
                offerToken,
                price,
                billingPeriod,
                infiniteRecurring
        );
    }
}
