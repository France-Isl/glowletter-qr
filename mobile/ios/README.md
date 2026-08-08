# GlowLetter iOS

The iOS wrapper uses StoreKit 2 and keeps the existing JavaScript bridge contract.
Its native fullscreen bridge connects the existing web fullscreen control to an
immersive iPhone/iPad view-controller fallback, including status-bar and Home
Indicator auto-hiding. iPadOS may still show system window controls when the
user deliberately runs the app in Stage Manager; apps cannot suppress those
system-managed controls. The wrapper intentionally does not use Apple's
deprecated `UIRequiresFullScreen` compatibility key, so it remains resizable in
Split View, Stage Manager, and the iPadOS windowed-apps environment.

## Generate and test the project

Requirements on macOS: Xcode 15.3 or newer and XcodeGen 2.45.4 or newer.

```sh
cd mobile/ios
xcodegen generate
xcodebuild \
  -project NurPismo.xcodeproj \
  -scheme NurPismo \
  -destination 'generic/platform=iOS Simulator' \
  build
xcodebuild \
  -project NurPismo.xcodeproj \
  -scheme NurPismo \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  test
```

No development team is hard-coded. Simulator builds therefore work without an
Apple Developer team. For a physical device or App Store archive, select your
team in Xcode; signing remains automatic.

`StoreKit/GlowLetter.storekit` contains a local monthly subscription and the
legacy lifetime product. The unit-test target loads this file directly with
`SKTestSession`, and the generated `NurPismo` run scheme selects it for
interactive purchase testing.

## App Store Connect products

Create these exact product identifiers in App Store Connect:

- `glowletter_premium_monthly`: auto-renewable subscription, one month.
- `full_access`: the existing non-consumable product, retained so previous
  buyers continue to receive premium access.

The interface displays StoreKit's localized `displayPrice`. `€21.99/month` is
only the offline fallback; App Store Connect remains the source of truth for
the charged price and localization. The local StoreKit file does not create or
upload App Store Connect products.

The purchase button starts the monthly subscription. Entitlement checks accept
verified, non-revoked, non-expired transactions for either product. Restore
Purchases calls `AppStore.sync()` only after the user explicitly requests it.
The Manage Subscription action opens Apple's subscription-management page.

## Supabase OAuth

The current App Store build exposes only verified e-mail/password authentication.
Its immutable `NurPlatform` marker identifies the trusted native iOS shell and
marks social authentication unavailable. The wrapper hides Google, Facebook,
and Apple buttons and also rejects native social-auth bridge requests. This
keeps the live build consistent with the currently enabled providers and avoids
offering a third-party login without a working Sign in with Apple equivalent.

The dormant native OAuth URL policy remains strict so social login can be
restored later without weakening URL validation. Re-enable it only after Sign
in with Apple is configured and tested end to end on a physical device and in
the App Store environment; then expose every approved provider consistently.
Every future request must still use the exact Supabase `/auth/v1/authorize`
endpoint, the exact callback `com.franceisl.glowletternext://auth/callback`, and
a 43–128 character PKCE challenge using `S256`.

Versioning is currently `2.4.1` (`CURRENT_PROJECT_VERSION` 16).

`PrivacyInfo.xcprivacy` is bundled as an application resource. It declares no
tracking and lists the first-party data used for app functionality: e-mail,
optional profile name, user ID, purchase history, customer-support content,
product interaction used for synced progress and preferences, other user
content, audio supplied for a temporary shared letter, and precise location
used on demand for weather. Location is not linked to the account; every other
declared category is account-linked.
