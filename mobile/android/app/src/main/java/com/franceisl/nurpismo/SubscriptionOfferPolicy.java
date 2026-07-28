package com.franceisl.glowletternext;

import java.util.List;

/** Pure selection policy for the single subscription base plan sold by the app. */
final class SubscriptionOfferPolicy {
    static final String MONTHLY_BILLING_PERIOD = "P1M";

    static final class Candidate {
        final int sourceIndex;
        final String basePlanId;
        final String offerId;
        final String offerToken;
        final String formattedPrice;
        final String billingPeriod;
        final boolean infiniteRecurring;

        Candidate(
                int sourceIndex,
                String basePlanId,
                String offerId,
                String offerToken,
                String formattedPrice,
                String billingPeriod,
                boolean infiniteRecurring
        ) {
            this.sourceIndex = sourceIndex;
            this.basePlanId = basePlanId;
            this.offerId = offerId;
            this.offerToken = offerToken;
            this.formattedPrice = formattedPrice;
            this.billingPeriod = billingPeriod;
            this.infiniteRecurring = infiniteRecurring;
        }
    }

    static final class Selection {
        final Candidate candidate;
        final String error;

        private Selection(Candidate candidate, String error) {
            this.candidate = candidate;
            this.error = error;
        }

        static Selection success(Candidate candidate) {
            return new Selection(candidate, null);
        }

        static Selection failure(String error) {
            return new Selection(null, error);
        }
    }

    private SubscriptionOfferPolicy() {
    }

    static Selection selectBasePlan(List<Candidate> candidates, String expectedBasePlanId) {
        Candidate selected = null;
        if (candidates != null) {
            for (Candidate candidate : candidates) {
                if (candidate == null
                        || !expectedBasePlanId.equals(candidate.basePlanId)
                        || !isBlank(candidate.offerId)
                        || isBlank(candidate.offerToken)
                        || !MONTHLY_BILLING_PERIOD.equals(candidate.billingPeriod)
                        || !candidate.infiniteRecurring) {
                    continue;
                }
                if (selected != null) {
                    return Selection.failure("ambiguous_subscription_base_plan");
                }
                selected = candidate;
            }
        }
        return selected == null
                ? Selection.failure("subscription_base_plan_not_available")
                : Selection.success(selected);
    }

    static String priceLabel(Candidate candidate, String fallback) {
        if (candidate == null || isBlank(candidate.formattedPrice)) {
            return fallback;
        }
        return candidate.formattedPrice.trim() + "/month";
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
