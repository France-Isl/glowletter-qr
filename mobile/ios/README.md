# GlowLetter iOS

The iOS wrapper uses StoreKit 2 and keeps the existing JavaScript bridge contract.

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

The native shell accepts Google, Facebook, and Apple only at the exact Supabase
`/auth/v1/authorize` endpoint. Every request must contain the exact app callback
`com.franceisl.glowletternext://auth/callback` and a 43–128 character PKCE
challenge using `S256`; the callback policy remains exact and rejects duplicate
security-sensitive parameters.

Apple OAuth uses a Services ID configured in Supabase. Register
`https://xzzngrquomyiglktroqi.supabase.co/auth/v1/callback` for that Services ID
in Apple Developer, and place the Services ID first in Supabase's Client IDs
when a native App ID is also configured. Rotate the Apple OAuth client secret at
least every six months and keep the `.p8` key and generated secret outside the
app, source control, and build logs.

## Private owner build

The public configuration leaves `GLOWLETTER_OWNER_CAPABILITY` empty, so it opens
the bundled app normally. A private owner build can inject the existing beta
capability at build time:

```sh
xcodebuild \
  -project NurPismo.xcodeproj \
  -scheme NurPismo \
  -destination 'generic/platform=iOS' \
  -archivePath "$PWD/build/GlowLetter.xcarchive" \
  GLOWLETTER_OWNER_CAPABILITY='YOUR_40_TO_128_CHARACTER_BASE64URL_TOKEN' \
  archive
```

The token must contain only `A-Z`, `a-z`, `0-9`, `_`, or `-`, and its SHA-256
must match the web app's configured capability hash. Keep it in a private
`.xcconfig` file or CI secret, and never commit or distribute it in a public
build. The app passes it to the bundled page as `#access=...`; the page validates
the hash and removes the fragment from browser history.

Versioning is currently `2.3.0` (`CURRENT_PROJECT_VERSION` 13).
