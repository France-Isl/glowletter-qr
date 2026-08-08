package com.franceisl.glowletternext;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public final class EntitlementExpiryPolicyTest {
    @Test
    public void serverTimesBecomeMonotonicLocalDeadline() {
        long deadline = EntitlementExpiryPolicy.subscriptionDeadline(
                1_700_000_000_000L,
                1_700_003_600_000L,
                25_000L
        );

        assertEquals(3_625_000L, deadline);
        assertTrue(EntitlementExpiryPolicy.isActive(true, deadline, 3_624_999L));
        assertFalse(EntitlementExpiryPolicy.isActive(true, deadline, deadline));
        assertEquals(1L, EntitlementExpiryPolicy.remainingDelay(deadline, deadline - 1L));
        assertEquals(0L, EntitlementExpiryPolicy.remainingDelay(deadline, deadline));
    }

    @Test
    public void missingOrAlreadyExpiredServerGrantIsRejected() {
        assertEquals(
                EntitlementExpiryPolicy.INVALID_DEADLINE,
                EntitlementExpiryPolicy.subscriptionDeadline(0L, 10L, 5L)
        );
        assertEquals(
                EntitlementExpiryPolicy.INVALID_DEADLINE,
                EntitlementExpiryPolicy.subscriptionDeadline(10L, 10L, 5L)
        );
        assertEquals(
                EntitlementExpiryPolicy.INVALID_DEADLINE,
                EntitlementExpiryPolicy.subscriptionDeadline(11L, 10L, 5L)
        );
    }

    @Test
    public void transientFailureCannotRetainExpiredGrant() {
        long deadline = 50_000L;
        assertTrue(EntitlementExpiryPolicy.isActive(true, deadline, 49_999L));
        assertFalse(EntitlementExpiryPolicy.isActive(true, deadline, 50_000L));
        assertFalse(EntitlementExpiryPolicy.isActive(false, deadline, 49_999L));
    }

    @Test
    public void legacyPermanentGrantHasNoFiniteDeadline() {
        assertTrue(EntitlementExpiryPolicy.isActive(
                true,
                EntitlementExpiryPolicy.NO_DEADLINE,
                Long.MAX_VALUE - 1L
        ));
        assertEquals(
                EntitlementExpiryPolicy.NO_DEADLINE,
                EntitlementExpiryPolicy.remainingDelay(
                        EntitlementExpiryPolicy.NO_DEADLINE,
                        Long.MAX_VALUE - 1L
                )
        );
    }
}
