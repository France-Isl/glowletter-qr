# GlowLetter: мобильные приложения

Каталог содержит Android WebView-приложение и iOS SwiftUI/WKWebView-приложение. Android application ID и iOS bundle ID: `com.franceisl.glowletternext`. Актуальные веб-файлы автоматически копируются из корня проекта при сборке.

## Что реализовано

- полноэкранный Android WebView на локальном HTTPS-origin `appassets.androidplatform.net`;
- SwiftUI/WKWebView-оболочка для iPhone и iPad;
- локальные HTML/CSS/JS, изображения, видео и аудио внутри приложения;
- системный выбор пользовательского аудио и фона;
- геолокация только по запросу пользователя для погоды;
- Google Play Billing Library `9.1.0` и подписка `glowletter_premium_monthly`;
- StoreKit 2 с проверенными транзакциями, восстановлением и наблюдением за обновлениями;
- совместимость с прежним нерасходуемым товаром `full_access`;
- fail-closed release: локальная запись не считается подтверждением оплаты;
- Play Integrity, R8/minify и серверная проверка Android-покупки;
- приватная owner-сборка с отдельной capability, не попадающей в публичные артефакты.

## JavaScript-мост оплаты

На доверенной локальной странице Android и iOS предоставляют один контракт:

```js
const state = JSON.parse(window.NurBilling.getEntitlement());
// { entitled, owned, premium, priceLabel, reason, productId,
//   legacyProductId, freeLetterLimit, purchaseConfigured, mock }

window.NurBilling.purchaseFullAccess(); // запускает ежемесячную подписку
window.NurBilling.restorePurchases();
window.NurBilling.manageSubscription();

window.onNativeEntitlement = (entitled, priceLabel, reason) => {
  // Обновить paywall и доступ.
};
```

Приложение также отправляет событие `nur-entitlement`. Purchase token и секреты никогда не передаются JavaScript-слою.

OAuth использует Supabase PKCE и callback `com.franceisl.glowletternext://auth/callback`. Android и iOS принимают только точный Supabase authorize URL, провайдер Google/Facebook, S256 challenge и точный callback. Для production предпочтительны verified App Link и Universal Link.

## Сборка Android

Требуются JDK 17, Android SDK Platform 36.1, Build Tools 36.1.0 и Gradle 9.4.1.

```powershell
cd mobile/android
python ..\scripts\generate_store_assets.py
.\gradlew.bat :app:testDebugUnitTest :app:lintDebug :app:assembleDebug
```

APK появится в `app/build/outputs/apk/debug/GlowLetter-2.2.2-debug.apk`.

Для закрытой owner-сборки capability передаётся только параметром Gradle или переменной окружения:

```powershell
.\gradlew.bat :app:assembleDebug -PownerBetaCapability=YOUR_PRIVATE_CAPABILITY
```

Не записывайте значение в `gradle.properties`, исходники, публичный workflow или release notes. Owner APK внедряет доступ при каждом запуске и остаётся полным после перезапуска и обновления поверх предыдущей сборки с тем же application ID.

Отдельный debug mock допускается только для интерфейсных тестов оплаты:

```powershell
.\gradlew.bat :app:assembleDebug -PenableBillingMock=true
```

Он возвращает `debug_mock_only_no_payment`, не списывает деньги и не предназначен для публикации или теста настоящего Billing.

## Google Play: подписка €21.99 в месяц

1. Создайте приложение `com.franceisl.glowletternext`.
2. Создайте subscription product `glowletter_premium_monthly`.
3. Добавьте и активируйте auto-renewing base plan `monthly` с периодом один месяц.
4. Установите базовую цену €21.99 и проверьте локальные цены.
5. Оставьте `full_access` доступным для восстановления старых покупок, если он ранее продавался.
6. Загрузите подписанный AAB во внутренний тест и добавьте license testers.
7. Проверьте purchase, pending, отмену, grace period, account hold, возврат, восстановление и смену устройства.

`€21.99/month` в коде — только offline fallback. В рабочем магазине интерфейс обязан показывать локализованную цену и billing period из `ProductDetails`/StoreKit.

## Серверная проверка Android

Подписанный release не собирается без HTTPS verification URL и положительного Play Integrity Cloud project number:

```powershell
$env:NURPISMO_VERIFICATION_URL = "https://api.example.com/v1/google-play/verify"
$env:NURPISMO_CLOUD_PROJECT_NUMBER = "123456789012"
.\gradlew.bat :app:bundleRelease
```

Клиент отправляет `productType: "subs"` для подписки или `"inapp"` для legacy, `requestHashVersion: "v2"` и Base64URL SHA-256 от строки:

```text
com.franceisl.glowletternext\nPRODUCT_ID\nPRODUCT_TYPE\nPURCHASE_TOKEN
```

Backend должен независимо пересчитать hash, проверить Standard Play Integrity token, запросить авторитетное состояние у Google Play Developer API, проверить SKU/base plan/срок/состояние, выполнить acknowledgement и вернуть совпадающие `productId`, `productType` и `requestHash`. RTDN через Pub/Sub обязателен для своевременной обработки продлений, отмен, hold и возвратов. Подробности находятся в [`backend/cloudflare/README.md`](../backend/cloudflare/README.md).

Play Integrity и R8 повышают стоимость атаки, но не делают APK невзламываемым. Ценный premium-контент лучше выдавать сервером только после короткоживущего проверенного entitlement.

## Подпись Android

Секреты upload key передаются только вне Git:

```properties
NURPISMO_KEYSTORE_PATH=/absolute/path/to/upload-key.jks
NURPISMO_KEYSTORE_PASSWORD=change-me
NURPISMO_KEY_ALIAS=upload
NURPISMO_KEY_PASSWORD=change-me
```

Для магазина включите Play App Signing. Debug key нельзя использовать для production. Без полного набора параметров сборка остаётся unsigned.

## iOS / App Store

На macOS:

```bash
cd mobile/ios
python3 ../scripts/generate_store_assets.py
python3 ../scripts/sync_web_assets.py
xcodegen generate
open NurPismo.xcodeproj
```

StoreKit 2 уже реализован. В App Store Connect создайте auto-renewable subscription `glowletter_premium_monthly` с периодом один месяц и, при необходимости миграции, legacy non-consumable `full_access`. Для устройства/App Store выберите свою Team, настройте signing, Bundle ID, subscription group, локализации, App Store Server Notifications и sandbox testers. Полная инструкция находится в [`ios/README.md`](ios/README.md).

## Перед продажей

- настройте payment profile только в Google Play Console/App Store Connect; банковские данные не встраиваются в приложение;
- разверните verification backend, D1 migration и RTDN/App Store Server Notifications;
- заполните Data Safety/App Privacy и дайте пользователю удаление аккаунта;
- подтвердите коммерческие права на изображения, видео, нашиды, шрифты и тексты;
- проверьте маленький экран, планшет, поворот, слабое устройство, offline и нехватку памяти;
- подготовьте store listing, rating, декларации AI и пройдите review.

Новый Android-релиз публикуется как подписанный AAB, а iOS — как подписанный archive через App Store Connect. Debug APK нужен только для закрытого тестирования.
