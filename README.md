# GlowLetter

Отдельная версия атмосферного приложения персональных писем. Исходный сайт `pismo-dlya-aishi` не изменяется.

- Сайт: <https://france-isl.github.io/glowletter-qr/>
- Поддержка: <ggooglov9@gmail.com>
- Политика конфиденциальности: <https://france-isl.github.io/glowletter-qr/privacy.html>
- Удаление аккаунта: <https://france-isl.github.io/glowletter-qr/delete-account.html>

## Возможности

- 50 оригинальных писем на русском, английском и французском;
- персональные имена, собственные тексты, фоны, зацикленные видео и аудио;
- прозрачные открытки, премиум-рамки, палитры и умное оформление;
- погода, дождь, природные звуки, PWA-установка и Android/iOS-оболочки;
- персональный QR-код для цветов и подарков: получатель открывает публичные первые 10 писем;
- Supabase Auth, уникальный ID поддержки, синхронизация прогресса и временный VIP на 1–365 дней;
- встроенная форма обратной связи: email и ID прикладываются сервером, обращения защищены RLS и ограничены от спама;
- закрытая админ-панель владельца с точным остатком VIP и защищённым журналом действий.

## Доступ и подписка

Первые 10 писем открыты бесплатно. Остальные 40 писем и персональный генератор входят в ежемесячную подписку `glowletter_premium_monthly` с base plan `monthly`. `€21.99/month` — только запасная подпись: реальную локализованную цену и период всегда задают Google Play Console и App Store Connect. Прежний нерасходуемый товар `full_access` поддерживается только для восстановления старых покупок.

Приватная owner-сборка использует отдельную capability, внедряемую только во время закрытой сборки. Она предназначена для владельца и выбранных тестировщиков, не зависит от магазина и не должна попадать в публичный APK/AAB, App Store-сборку или репозиторий.

Android release работает fail-closed: подписка открывает доступ только после ответа Google Play Billing, серверной проверки покупки, Play Integrity и acknowledgement. iOS использует StoreKit 2, проверенные транзакции, `Transaction.currentEntitlements`, обновления транзакций и явное восстановление через `AppStore.sync()`.

## Умные тексты

## Структура

- `index.html`, `styles.css`, `app.js`, `letters.js` — PWA;
- `mobile/android` — Android WebView, Play Billing и Play Integrity;
- `mobile/ios` — SwiftUI/WKWebView и StoreKit 2;
- `backend/cloudflare` — Workers AI и серверная проверка Google Play;
- `supabase` — схема прогресса, аккаунтов, RLS, VIP, поддержки и удаление аккаунта;
- `.github/workflows/mobile-build.yml` — preview-сборка APK и unsigned AAB.

Подробные инструкции: [`ADMIN-GUIDE.md`](ADMIN-GUIDE.md), [`mobile/README.md`](mobile/README.md), [`mobile/ios/README.md`](mobile/ios/README.md) и [`backend/cloudflare/README.md`](backend/cloudflare/README.md).

## Перед продажей

Debug APK предназначен только для тестирования. Для публикации нужны developer accounts, подписанный AAB/IPA, настроенные товары и выплаты в консолях магазинов, production backend, RTDN/App Store Server Notifications, privacy/data declarations, права на медиа, тестирование и review. Банковские реквизиты и секреты не встраиваются в приложение: выплаты настраиваются в платёжном профиле магазина.
