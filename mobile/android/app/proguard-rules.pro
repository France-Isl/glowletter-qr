-keepattributes *Annotation*

# JavaScript can call only these explicitly annotated members. Keep their names.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.franceisl.glowletternext.BillingBridge { *; }
-keep class com.franceisl.glowletternext.AuthBridge { *; }
-keep class com.franceisl.glowletternext.AppUpdateBridge { *; }

# Credential Manager finds its Play services provider reflectively.
-if class androidx.credentials.CredentialManager
-keep class androidx.credentials.playservices.** { *; }

# BillingClient ships consumer rules; this explicit rule protects callback models
# from over-aggressive future R8 changes in this small wrapper application.
-keep class com.android.billingclient.api.** { *; }
-dontwarn org.conscrypt.**
