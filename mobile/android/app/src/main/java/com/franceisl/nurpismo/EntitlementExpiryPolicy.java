package com.franceisl.glowletternext;

/** Pure time policy for server-verified subscription grants. */
final class EntitlementExpiryPolicy {
    static final long NO_DEADLINE = Long.MAX_VALUE;
    static final long INVALID_DEADLINE = -1L;

    private EntitlementExpiryPolicy() {
    }

    static long subscriptionDeadline(
            long serverTimeMillis,
            long expiryTimeMillis,
            long elapsedRealtimeMillis
    ) {
        if (serverTimeMillis <= 0L
                || expiryTimeMillis <= serverTimeMillis
                || elapsedRealtimeMillis < 0L) {
            return INVALID_DEADLINE;
        }
        long remaining = expiryTimeMillis - serverTimeMillis;
        if (Long.MAX_VALUE - elapsedRealtimeMillis < remaining) {
            return NO_DEADLINE;
        }
        return elapsedRealtimeMillis + remaining;
    }

    static boolean isActive(boolean entitled, long deadlineMillis, long elapsedRealtimeMillis) {
        return entitled
                && deadlineMillis > 0L
                && (deadlineMillis == NO_DEADLINE || elapsedRealtimeMillis < deadlineMillis);
    }

    static long remainingDelay(long deadlineMillis, long elapsedRealtimeMillis) {
        if (deadlineMillis == NO_DEADLINE) {
            return NO_DEADLINE;
        }
        if (deadlineMillis <= 0L || elapsedRealtimeMillis >= deadlineMillis) {
            return 0L;
        }
        return deadlineMillis - elapsedRealtimeMillis;
    }
}
