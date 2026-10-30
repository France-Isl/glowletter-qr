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

# «Уведомления на телефон» (2.4.25): WorkManager находит свою базу Room и наш
# PushPoller по имени класса. Без этих правил R8 вырезал WorkDatabase_Impl, и
# приложение падало на запуске (InitializationProvider → WorkDatabase).
-keep class * extends androidx.room.RoomDatabase { <init>(); }
-keep class androidx.work.impl.WorkDatabase_Impl { *; }
-keep class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}
