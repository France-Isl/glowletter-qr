# Backend GlowLetter

Cloudflare Worker выполняет две независимые задачи:

- `POST /api/generate` — семейно-безопасная генерация письма (`mode: "letter"`) или ответа (`mode: "reply"`) через Workers AI;
- `POST /v1/google-play/verify` — серверная проверка Google Play Billing и Play Integrity для ежемесячной подписки `glowletter_premium_monthly` (base plan `monthly`) и прежней нерасходуемой покупки `full_access`.

Платёжный endpoint работает **fail-closed**: при отсутствии D1, актуальной миграции, Play Integrity, service account, секрета HMAC или достоверного ответа Google полный доступ не выдаётся. Запись D1 служит журналом, но никогда не заменяет свежую проверку Google Play.

## Контракт проверки покупки

Текущий Android-клиент отправляет `requestHashVersion: "v2"`; `productType` должен быть строго `subs` или `inapp`:

```json
{
  "packageName": "com.franceisl.glowletternext",
  "productId": "glowletter_premium_monthly",
  "productType": "subs",
  "purchaseToken": "TOKEN_FROM_PLAY_BILLING",
  "requestHashVersion": "v2",
  "requestHash": "BASE64URL_SHA256",
  "integrityToken": "PLAY_INTEGRITY_TOKEN"
}
```

Каноническая строка v2, от которой Android и Worker считают SHA-256:

```text
packageName\nproductId\nproductType\npurchaseToken
```

Успешный ответ возвращает `valid`, `acknowledged`, `integrityVerified`, а также точные `productId`, `productType` и `requestHash`. Узкая совместимость с ранее выпущенным клиентом сохранена только для `full_access`: запрос `v1` без `productType` проверяется по прежней строке `packageName\nproductId\npurchaseToken`. Подписки через v1 не принимаются.

## Как проверяется entitlement

Для `productType: "subs"` Worker вызывает:

```text
GET /androidpublisher/v3/applications/{packageName}/purchases/subscriptionsv2/tokens/{purchaseToken}
```

Он проверяет SKU, base plan, состояние подписки, срок действия, acknowledgement и Play Integrity. Первая подтверждённая покупка при необходимости подтверждается через:

```text
POST /androidpublisher/v3/applications/{packageName}/purchases/subscriptions/{subscriptionId}/tokens/{purchaseToken}:acknowledge
```

Если acknowledgement столкнулся с конкурентным запросом, Worker повторно читает `subscriptionsv2.get` и открывает доступ только после авторитетного ответа `ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED`.

Для прежнего `productType: "inapp"` / `full_access` сохраняются `purchases.products.get` и `purchases.products.acknowledge`.

| Состояние подписки Google | Доступ |
| --- | --- |
| `SUBSCRIPTION_STATE_ACTIVE` | Да, только до `expiryTime` |
| `SUBSCRIPTION_STATE_IN_GRACE_PERIOD` | Да, только до `expiryTime` |
| `SUBSCRIPTION_STATE_CANCELED` | Да до `expiryTime`, затем нет |
| `SUBSCRIPTION_STATE_PENDING` | Нет |
| `SUBSCRIPTION_STATE_PAUSED` | Нет |
| `SUBSCRIPTION_STATE_ON_HOLD` | Нет |
| `SUBSCRIPTION_STATE_EXPIRED` | Нет |
| `SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED` | Нет |
| revoked/неизвестное состояние | Нет, fail-closed |

В D1 не записываются raw purchase token, linked purchase token, Integrity token, service-account key и полный order ID. Purchase token и linked token сохраняются только как версионированные, разделённые по доменам HMAC-SHA-256; order ID — только как HMAC.

## 1. Создание D1 и миграции

```powershell
cd backend/cloudflare
npm install
npx wrangler login
npm run db:create
```

Wrangler напечатает `database_id`. В `wrangler.toml` раскомментируйте `[[d1_databases]]`, замените `REPLACE_WITH_D1_DATABASE_ID` на UUID и примените обе миграции:

```powershell
npm run db:migrate:local
npm run db:migrate:remote
```

- `0001_entitlements.sql` создаёт исходный журнал одноразовых покупок;
- `0002_subscription_entitlements.sql` без удаления старых строк добавляет nullable-поля `subscription_state`, `expiry_time_ms`, `base_plan_id`, `offer_id`, `auto_renew_enabled`, `linked_purchase_token_hash` и повышает версию схемы до `2`.

Worker требует schema version `2`. Если применена только первая миграция, endpoint намеренно вернёт `entitlement_store_not_ready`.

## 2. Переменные и секреты Worker

В `wrangler.toml` должны оставаться:

```toml
NURPISMO_PACKAGE_NAME = "com.franceisl.glowletternext"
NURPISMO_PRODUCT_ID = "full_access"
NURPISMO_SUBSCRIPTION_PRODUCT_ID = "glowletter_premium_monthly"
NURPISMO_SUBSCRIPTION_BASE_PLAN_ID = "monthly"
REQUIRE_PLAY_INTEGRITY = "true"
ENTITLEMENT_HASH_KEY_ID = "v1"
```

Секреты задаются только через закрытый prompt Wrangler:

```powershell
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON
npx wrangler secret put ENTITLEMENT_HASH_SECRET
```

- `GOOGLE_SERVICE_ACCOUNT_JSON` — полный JSON service account;
- `ENTITLEMENT_HASH_SECRET` — случайный секрет не короче 32 байт;
- при сознательной ротации HMAC-секрета поменяйте `ENTITLEMENT_HASH_KEY_ID`, например на `v2`.

Не добавляйте секреты, private key, IBAN/BIC, пароли или raw Play tokens в GitHub, APK, клиентский JavaScript либо логи.

## 3. Google Play Console и Google Cloud

1. Включите **Google Play Android Developer API** и **Play Integrity API**, свяжите Cloud project с Play Console.
2. Выдайте service account только необходимые права чтения покупок и acknowledgement.
3. Создайте подписку с точным Product ID `glowletter_premium_monthly` и активный auto-renewing base plan с точным ID `monthly`.
4. Не удаляйте прежний нерасходуемый Product ID `full_access`: он нужен для восстановления доступа старым владельцам.
5. Настройте цену и банковский профиль только в закрытой Google Play Console. Они не должны находиться в Worker или репозитории.
6. Включите Play App Signing, Automatic Protection и Play Integrity.

## 4. Локальная проверка

```powershell
npm run check
npm test
```

После отдельного, осознанного deploy можно проверить `/health`; `billingConfigured: true` означает только наличие обязательных vars/bindings/secrets. Реальный платёж обязательно проверяется production AAB из внутреннего тестового трека Google Play, а не sideload/debug APK.

Минимальная матрица ручной проверки:

- первая покупка подписки и однократный acknowledgement;
- повторный запуск, восстановление и переустановка с тем же Google-аккаунтом;
- active, grace period и canceled до/после `expiryTime`;
- pending, paused, on hold, expired и revoke/refund;
- старая покупка `full_access`;
- параллельные запросы одного токена;
- недоступность D1, Play Integrity или Google API — доступ остаётся закрытым.

## 5. Production blocker: RTDN

**Real-time Developer Notifications пока не реализованы. Это явный blocker перед коммерческим production-запуском, если требуется немедленная синхронизация отмен, hold, pause, expiry и revoke/refund.** Сейчас состояние обновляется только при следующем запросе клиента, когда Worker заново вызывает Google Play Developer API.

Production-реализация RTDN требует Google Cloud Pub/Sub, проверки OIDC/JWT для push-запросов, дедупликации `messageId` и повторной авторитетной проверки покупки у Google. Нельзя принимать неподписанный Pub/Sub push или доверять данным уведомления без повторного запроса Google.

Дополнительные ограничения:

- Worker не хранит raw token, поэтому не может сам опрашивать старые покупки без нового запроса приложения;
- без собственного аккаунта приложения восстановление связано с Google Play-аккаунтом;
- абсолютную невзламываемость APK гарантировать нельзя: защита строится на Play Billing, server-side verification, Play Integrity и Play App Signing;
- перед коммерческим включением Workers AI endpoint должен быть связан с короткоживущим подписанным entitlement-grant; один `Origin` не доказывает оплату.

Публичный адрес поддержки: `ggooglov9@gmail.com`.
