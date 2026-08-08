package com.franceisl.glowletternext;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.junit.Test;

public final class SupabaseSessionBindingTest {
    private static final String HEADER = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0";
    private static final String USER_PAYLOAD =
            "eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJyb2xlIjoiYXV0aGVudGljYXRlZCJ9";

    @Test
    public void derivesStablePlayBindingFromSupabaseSubject() throws Exception {
        String token = HEADER + "." + USER_PAYLOAD + ".signature";
        SupabaseSessionBinding.Session session = SupabaseSessionBinding.fromAccessToken(token);

        assertNotNull(session);
        assertEquals(token, session.accessToken);
        assertEquals(
                "oI1OKZSkvSuaOTtG6chGR1uDwKtsaYGfperbh4v8Drw",
                session.obfuscatedAccountId
        );
        assertEquals(43, session.obfuscatedAccountId.length());
        assertEquals(
                session.obfuscatedAccountId,
                SupabaseSessionBinding.accountBindingForUserId(
                        "123e4567-e89b-12d3-a456-426614174000"
                )
        );
    }

    @Test
    public void tokenRefreshForSameUserKeepsSameBinding() {
        SupabaseSessionBinding.Session first = SupabaseSessionBinding.fromAccessToken(
                HEADER + "." + USER_PAYLOAD + ".first"
        );
        SupabaseSessionBinding.Session refreshed = SupabaseSessionBinding.fromAccessToken(
                HEADER + "." + USER_PAYLOAD + ".second"
        );

        assertNotNull(first);
        assertNotNull(refreshed);
        assertEquals(first.obfuscatedAccountId, refreshed.obfuscatedAccountId);
    }

    @Test
    public void rejectsMissingOrInvalidUserSubject() {
        assertNull(SupabaseSessionBinding.fromAccessToken(null));
        assertNull(SupabaseSessionBinding.fromAccessToken("not-a-jwt"));
        assertNull(SupabaseSessionBinding.fromAccessToken(
                HEADER + ".eyJyb2xlIjoiYXV0aGVudGljYXRlZCJ9.signature"
        ));
        assertNull(SupabaseSessionBinding.fromAccessToken(
                HEADER + ".eyJzdWIiOiJub3QtYS11dWlkIn0.signature"
        ));
    }
}
