(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const CONFIG = window.NUR_APP_CONFIG || {};
  const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)");
  const SAVE_DATA = Boolean(navigator.connection?.saveData);
  const LOW_MEMORY = Number(navigator.deviceMemory || 8) <= 4;
  const LOW_CPU = Number(navigator.hardwareConcurrency || 8) <= 4;
  const LITE_DEVICE = REDUCED_MOTION.matches || SAVE_DATA || LOW_MEMORY || LOW_CPU;
  const MOBILE_DEVICE = Boolean(navigator.userAgentData?.mobile)
    || /Android|iPhone|iPad|iPod/iu.test(navigator.userAgent || "")
    || matchMedia("(pointer: coarse)").matches
    || matchMedia("(max-width: 900px)").matches;
  const PERFORMANCE_MODE = LITE_DEVICE ? "lite" : (MOBILE_DEVICE ? "mobile" : "full");
  document.documentElement.dataset.glPerf = PERFORMANCE_MODE;
  const IS_ANDROID_PLAY_APP = location.hostname === "appassets.androidplatform.net";
  if (IS_ANDROID_PLAY_APP) document.documentElement.dataset.glPlatform = "android-play";
  const hasIosBillingBridge = location.protocol === "file:"
    && typeof window.webkit?.messageHandlers?.nurBilling?.postMessage === "function"
    && typeof window.NurBilling?.getEntitlement === "function";
  const trustedEntitlementSource = location.hostname === "appassets.androidplatform.net"
    || ["capacitor:", "ionic:"].includes(location.protocol)
    || hasIosBillingBridge
    || (CONFIG.testNativeBilling === true && ["127.0.0.1", "localhost"].includes(location.hostname));
  const LETTERS = Array.isArray(window.NUR_LETTERS) ? window.NUR_LETTERS : [];
  const FREE_COUNT = Number(CONFIG.freeLetterCount) || 10;
  const params = new URLSearchParams(location.search);
  const BETA_PARAMETER = "beta";
  const SUPABASE_URL = String(CONFIG.supabaseUrl || "").replace(/\/+$/, "");
  const SUPABASE_PUBLISHABLE_KEY = String(CONFIG.supabasePublishableKey || "").trim();
  const CLOUD_TABLE = "glowletter_progress";
  const CLOUD_SCHEMA_VERSION = 1;
  const CLOUD_SYNC_DELAY = 900;
  const CLOUD_MAX_WRITE_ATTEMPTS = 3;
  const CLOUD_SELECT_COLUMNS = "schema_version,sender_name,recipient_name,language,current_letter_id,favorite_ids,rain_enabled,weather_enabled,built_in_track,nature_enabled,fullscreen_enabled,volume,revision,updated_at";
  const AUTH_CALLBACK_PARAMETERS = ["code", "state", "error", "error_code", "error_description", "error_reason", "error_uri", "access_token", "refresh_token", "expires_in", "token_type", "provider_token", "provider_refresh_token"];
  const UI_THEMES = new Set(["garnet", "indigo", "saffron", "emerald"]);
  const WEATHER_STORAGE_KEY = "nurWeatherSnapshotV1";
  const SUPPORT_EMAIL = "ggooglov9@gmail.com";
  const SUPPORT_CATEGORIES = new Set(["technical", "account", "subscription", "content", "feedback", "other"]);
  const CONTENT_REPORT_CATEGORIES = new Set(["adult", "harassment", "hate", "threat", "fraud", "privacy", "spam", "other"]);
  const CONTENT_REPORT_KINDS = new Set(["direct_letter", "moment_letter", "shared_audio"]);
  const SUPPORT_MESSAGE_MIN = 20;
  const SUPPORT_MESSAGE_MAX = 2000;
  const VIP_NOTIFICATION_TABLE = "glowletter_notifications";
  const VIP_NOTIFICATION_KINDS = new Set(["vip_granted", "vip_grant", "vip", "vip_forever"]);
  const VIP_NOTICE_REASONS = new Set(["gift", "compensation", "promotion", "other"]);
  const VIP_NOTICE_MESSAGE_MAX = 240;
  const SHARED_AUDIO_FUNCTION = "shared-audio";
  const SHARED_AUDIO_BUCKET = "glowletter-shared-audio";
  const SHARED_AUDIO_MAX_BYTES = 12 * 1024 * 1024;
  const SHARED_AUDIO_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/u;
  const SHARED_AUDIO_TYPES = Object.freeze({
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    ogg: "audio/ogg",
    wav: "audio/wav"
  });
  const AUTH_PROVIDER_PRIORITY = Object.freeze(["google", "apple", "facebook"]);
  const AUTH_PROVIDER_LABEL_KEYS = Object.freeze({
    google: "continueGoogle",
    apple: "continueApple",
    facebook: "continueFacebook"
  });
  const APPLE_BUTTON_ARTWORK = Object.freeze({
    ru: "assets/auth/apple-continue-ru.png",
    en: "assets/auth/apple-continue-en.png",
    fr: "assets/auth/apple-continue-fr.png"
  });

  const UI = {
    ru: {
      title: "GlowLetter · Тёплые слова", brand: "Тёплые слова<br><em>находят путь</em>", brandCopy: "Тёплые слова для тех, кто по-настоящему важен.", from: "от", open: "Открыть письмо", momentsHome: "Мои моменты", free: "10 писем бесплатно", full: "полный доступ —", weather: "Погода", next: "Следующее письмо", copy: "Копировать текст", copied: "Текст скопирован", read: "Прочитать", stop: "Остановить", postcard: "Открытка", saved: "Сохранить", favorite: "Сохранено", home: "На главную", stage: "Вечер сохранил эти слова для тебя", letterTitle: "Несколько слов для тебя", for: "для", warmSign: "С теплом,", fromWho: "От кого", forWho: "Для кого", library: "Коллекция", openCount: "10 писем открыто", allCount: "Все 50 писем открыты", all: "Все", warm: "Тепло", gratitude: "Спасибо", support: "Поддержка", family: "Семья", openQuote: "Открыть", unlock: "Открыть полный доступ", locked: "Доступно в полной версии", settings: "Настроение", langLabel: "Язык приложения и писем", choosePhoto: "Выбрать фото", resetPhoto: "Вернуть озеро", buy: "Открыть полный доступ ·", restore: "Восстановить подписку", purchaseUnavailable: "Подписка станет доступна в приложении из Google Play или App Store", restored: "Подписка проверена", premiumOn: "Полный доступ активен", safety: "Текст содержит запрещённую или двусмысленную формулировку. Измените его.", namesSafety: "Введите обычные имена или семейные роли.", customAdded: "Ваше письмо готово и сохранено в ссылке", rainOn: "Дождь включён", rainOff: "Дождь выключен", natureOn: "Ночной лес зазвучал", natureOff: "Звуки природы выключены", photoReady: "Личный фон сохранён на этом устройстве", photoReset: "Возвращён фон у озера", locationDenied: "Без разрешения местная погода недоступна", weatherFail: "Не удалось получить погоду", install: "Установить GlowLetter", shareText: "Это письмо для тебя", downloadReady: "Открытка готова", close: "Закрыть"
    },
    en: {
      title: "GlowLetter · Warm Words", brand: "Warm words<br><em>find their way</em>", brandCopy: "Warm words for the people who truly matter.", from: "from", open: "Open the letter", momentsHome: "My moments", free: "10 letters free", full: "full access —", weather: "Weather", next: "Next letter", copy: "Copy text", copied: "Text copied", read: "Read aloud", stop: "Stop", postcard: "Postcard", saved: "Save", favorite: "Saved", home: "Home", stage: "The evening kept these words for you", letterTitle: "A few words for you", for: "for", warmSign: "With warmth,", fromWho: "From", forWho: "To", library: "Collection", openCount: "10 letters unlocked", allCount: "All 50 letters unlocked", all: "All", warm: "Warmth", gratitude: "Gratitude", support: "Support", family: "Family", openQuote: "Open", unlock: "Unlock full access", locked: "Available in the full version", settings: "Atmosphere", langLabel: "App and letter language", choosePhoto: "Choose a photo", resetPhoto: "Restore the lake", buy: "Unlock full access ·", restore: "Restore subscription", purchaseUnavailable: "Subscriptions are available in the Google Play or App Store app", restored: "Subscription checked", premiumOn: "Full access is active", safety: "This text contains a prohibited or ambiguous phrase. Please change it.", namesSafety: "Enter ordinary names or family roles.", customAdded: "Your letter is ready and saved in the link", rainOn: "Rain is on", rainOff: "Rain is off", natureOn: "The night forest is alive", natureOff: "Nature sounds are off", photoReady: "Your background is saved on this device", photoReset: "The lake background is back", locationDenied: "Local weather needs location permission", weatherFail: "Weather is unavailable", install: "Install GlowLetter", shareText: "This letter is for you", downloadReady: "Your postcard is ready", close: "Close"
    },
    fr: {
      title: "GlowLetter · Mots chaleureux", brand: "Les mots sincères<br><em>trouvent leur chemin</em>", brandCopy: "Des mots chaleureux pour les personnes qui comptent vraiment.", from: "de", open: "Ouvrir la lettre", momentsHome: "Mes moments", free: "10 lettres gratuites", full: "accès complet —", weather: "Météo", next: "Lettre suivante", copy: "Copier le texte", copied: "Texte copié", read: "Lire à voix haute", stop: "Arrêter", postcard: "Carte", saved: "Enregistrer", favorite: "Enregistré", home: "Accueil", stage: "Le soir a gardé ces mots pour toi", letterTitle: "Quelques mots pour toi", for: "pour", warmSign: "Avec chaleur,", fromWho: "De la part de", forWho: "Pour", library: "Collection", openCount: "10 lettres accessibles", allCount: "Les 50 lettres sont accessibles", all: "Toutes", warm: "Chaleur", gratitude: "Merci", support: "Soutien", family: "Famille", openQuote: "Ouvrir", unlock: "Débloquer l’accès complet", locked: "Disponible dans la version complète", settings: "Atmosphère", langLabel: "Langue de l’application et des lettres", choosePhoto: "Choisir une photo", resetPhoto: "Remettre le lac", buy: "Débloquer l’accès complet ·", restore: "Restaurer l’abonnement", purchaseUnavailable: "L’abonnement est disponible dans l’application Google Play ou App Store", restored: "Abonnement vérifié", premiumOn: "L’accès complet est actif", safety: "Ce texte contient une formulation interdite ou ambiguë. Modifiez-le.", namesSafety: "Saisissez des prénoms ordinaires ou des rôles familiaux.", customAdded: "Votre lettre est prête et enregistrée dans le lien", rainOn: "La pluie est activée", rainOff: "La pluie est désactivée", natureOn: "La forêt nocturne s’éveille", natureOff: "Les sons de la nature sont désactivés", photoReady: "Votre fond est enregistré sur cet appareil", photoReset: "Le lac est de retour", locationDenied: "La météo locale nécessite votre autorisation", weatherFail: "La météo est indisponible", install: "Installer GlowLetter", shareText: "Cette lettre est pour toi", downloadReady: "Votre carte est prête", close: "Fermer"
    }
  };

  const EXTRA_UI = {
    ru: { collectionEyebrow:"50 ПРОВЕРЕННЫХ ТЕКСТОВ",collectionNote:"Каждый текст автоматически обращается к выбранному человеку.",settingsEyebrow:"ВАША АТМОСФЕРА",rainTitle:"Живой дождь",rainNote:"крупные капли и брызги",natureTitle:"Ночной лес",natureNote:"сверчки, ветер и лягушки",weatherTitle:"Моя погода",weatherNote:"атмосфера по месту",fullscreenTitle:"Полный экран",fullscreenNote:"без лишних элементов",personalBg:"Личный фон",ownPhoto:"Своя фотография",localOnly:"Останется только на этом устройстве",music:"Аудио письма",fullVersion:"ПРЕМИУМ",allLetters:"Откройте все функции GlowLetter",onePurchase:"Подписка на месяц или на год: все письма, моменты и новые функции.",paywallEyebrow:"GLOWLETTER · ПРЕМИУМ",paywallTitle:"Ещё 40 писем<br><em>для важных людей</em>",paywallBody:"Первые 10 писем остаются бесплатными. Остальные 40 открывает подписка на месяц или на год. Она продлевается автоматически, пока вы не отмените её в аккаунте магазина.",benefit1:"все 50 писем на двадцати пяти языках",benefit2:"моменты, напоминания и QR-ссылки",benefit3:"новые тексты и функции",payButton:"Подписка на месяц",payYearlyButton:"Подписка на год",yearlyBadge:"Выгоднее всего",storeNote:"Подписку можно отменить в аккаунте магазина в любой момент. Цена отображается в местной валюте.",privacy:"Конфиденциальность",supportLink:"Поддержка",customMusic:"Добавить своё аудио",customMusicNote:"MP3, M4A, AAC, OGG или WAV · до 12 МБ" },
    en: { collectionEyebrow:"50 REVIEWED TEXTS",collectionNote:"Every text automatically addresses the person you selected.",settingsEyebrow:"YOUR ATMOSPHERE",rainTitle:"Living rain",rainNote:"large drops and gentle splashes",natureTitle:"Night forest",natureNote:"crickets, wind, and frogs",weatherTitle:"My weather",weatherNote:"atmosphere for your location",fullscreenTitle:"Full screen",fullscreenNote:"a clear, immersive view",personalBg:"Personal background",ownPhoto:"Your own photo",localOnly:"Stays only on this device",music:"Letter audio",fullVersion:"PREMIUM",allLetters:"Unlock every GlowLetter feature",onePurchase:"A monthly or yearly subscription: every letter, moments, and new features.",paywallEyebrow:"GLOWLETTER · PREMIUM",paywallTitle:"40 more letters<br><em>for important people</em>",paywallBody:"The first 10 letters stay free. The other 40 open with a monthly or yearly subscription. It renews automatically until you cancel it in your store account.",benefit1:"all 50 letters in twenty-five languages",benefit2:"moments, reminders, and QR links",benefit3:"new texts and features",payButton:"Monthly subscription",payYearlyButton:"Yearly subscription",yearlyBadge:"Best value",storeNote:"You can cancel the subscription in your store account at any time. The local store price is shown.",privacy:"Privacy",supportLink:"Support",customMusic:"Add your own audio",customMusicNote:"MP3, M4A, AAC, OGG, or WAV · up to 12 MB" },
    fr: { collectionEyebrow:"50 TEXTES VÉRIFIÉS",collectionNote:"Chaque texte s’adresse automatiquement à la personne choisie.",settingsEyebrow:"VOTRE ATMOSPHÈRE",rainTitle:"Pluie vivante",rainNote:"grosses gouttes et éclaboussures douces",natureTitle:"Forêt nocturne",natureNote:"grillons, vent et grenouilles",weatherTitle:"Ma météo",weatherNote:"une ambiance adaptée au lieu",fullscreenTitle:"Plein écran",fullscreenNote:"une vue claire et immersive",personalBg:"Fond personnel",ownPhoto:"Votre photo",localOnly:"Reste uniquement sur cet appareil",music:"Audio de la lettre",fullVersion:"PREMIUM",allLetters:"Débloquez toutes les fonctions",onePurchase:"Un abonnement mensuel ou annuel : toutes les lettres, les moments et les nouveautés.",paywallEyebrow:"GLOWLETTER · PREMIUM",paywallTitle:"40 lettres de plus<br><em>pour les personnes importantes</em>",paywallBody:"Les 10 premières lettres restent gratuites. Les 40 autres s’ouvrent avec un abonnement mensuel ou annuel. Il se renouvelle automatiquement jusqu’à son annulation dans votre compte du magasin.",benefit1:"les 50 lettres en vingt-cinq langues",benefit2:"moments, rappels et liens QR",benefit3:"nouveaux textes et fonctions",payButton:"Abonnement mensuel",payYearlyButton:"Abonnement annuel",yearlyBadge:"Le plus avantageux",storeNote:"Vous pouvez annuler l’abonnement à tout moment dans votre compte du magasin. Le prix local s’affiche.",privacy:"Confidentialité",supportLink:"Assistance",customMusic:"Ajouter votre propre audio",customMusicNote:"MP3, M4A, AAC, OGG ou WAV · 12 Mo maximum" }
  };
  Object.keys(UI).forEach(code => Object.assign(UI[code], EXTRA_UI[code]));
  UI.ru.brandCopyPersonal = "Тёплые слова, выбранные с заботой специально для {to}.";
  UI.en.brandCopyPersonal = "Warm words chosen with care especially for {to}.";
  UI.fr.brandCopyPersonal = "Des mots chaleureux choisis avec soin spécialement pour {to}.";
  Object.assign(UI.ru, {
    setupEyebrow:"ПЕРЕД ОТКРЫТИЕМ ПИСЬМА",setupTitle:"Для кого это письмо?",setupNote:"Имена нужны только для личного обращения и подписи.",setupSubmit:"Открыть письмо",
    setupSenderPlaceholder:"Ваше имя",setupRecipientPlaceholder:"Имя получателя",stateOn:"ВКЛ",stateOff:"ВЫКЛ",stateOpen:"ОТКРЫТЬ",trackPrimary:"основная мелодия",trackLight:"светлая версия",trackWarm:"тёплая версия",
    homeAria:"На главный экран",soundOnAria:"Включить нашид",soundOffAria:"Выключить нашид",natureOnAria:"Включить звуки природы",natureOffAria:"Выключить звуки природы",weatherAria:"Показать погоду",languageAria:"Изменить язык",libraryAria:"Коллекция писем",settingsAria:"Атмосфера и музыка",previousAria:"Предыдущее письмо",shareAria:"Поделиться письмом",closeAria:"Закрыть",closeLibraryAria:"Закрыть коллекцию",closeSettingsAria:"Закрыть настройки",homeScreenAria:"Главный экран",letterNavAria:"Переключение писем",checkingPurchase:"Проверяю подписку…",allLetters:"Откройте премиум GlowLetter",onePurchase:"Подписка на месяц или на год: все письма, моменты и новые функции.",paywallBody:"Первые 10 писем остаются бесплатными. Остальные 40 открывает подписка на месяц или на год. Она продлевается автоматически, пока вы не отмените её в аккаунте магазина.",benefit1:"все 50 писем на двадцати пяти языках",benefit2:"моменты, напоминания и QR-ссылки",benefit3:"новые тексты и функции",benefit4:"поддержка автора проекта",saveSettings:"Сохранить настройки",settingsSaved:"Настройки сохранены",manageSubscription:"Управление подпиской",subscriptionTitle:"Ваш доступ",subscriptionRestore:"Восстановить подписку",subscriptionNoteFree:"Открыты первые 10 писем. Полный доступ добавляет остальные 40, моменты, напоминания и оформление письма.",subscriptionNoteStore:"Подписка продлевается автоматически. Отменить или сменить план можно в аккаунте магазина.",subscriptionNoteVip:"Доступ выдан вручную. Когда срок закончится, приложение вернётся к бесплатному режиму.",subscriptionNotePermanent:"Полный доступ открыт. Продлевать и платить ничего не нужно.",subscriptionNoteChecking:"Проверяю доступ в магазине и в облаке…",accountPasswordToggle:"Задать пароль для входа",accountPasswordLabel:"Новый пароль",accountPasswordNote:"Минимум 8 символов. После сохранения можно входить по адресу и паролю, а не только по коду.",accountPasswordSubmit:"Сохранить пароль",accountPasswordSaved:"Пароль сохранён. Теперь можно входить по адресу и паролю.",accountPasswordShort:"Пароль должен быть не короче 8 символов.",accountPasswordFailed:"Не удалось сохранить пароль. Попробуйте ещё раз.",purchaseNotConfigured:"Подписка ещё не заведена в Google Play. Оплата заработает, когда товар появится в магазине.",purchaseStoreSilent:"Google Play не ответил. Проверьте интернет и попробуйте ещё раз.",purchaseLaunchFailed:"Google Play не смог открыть оплату. Попробуйте ещё раз через минуту.",purchaseStoreUnavailable:"Google Play сейчас недоступен. Проверьте, что в Play Маркете выполнен вход в аккаунт Google, и попробуйте ещё раз.",purchasePending:"Платёж ещё обрабатывается. Доступ откроется сам, как только Google Play его подтвердит.",purchaseVerifyPending:"Оплата прошла, но проверка ещё не завершилась. Через минуту нажмите «Восстановить подписку» в настройках.",appUpdateAvailable:"Вышла новая версия GlowLetter",appUpdateButton:"Обновить",appUpdateDownloading:"Загружаю обновление…",appUpdateReady:"Обновление готово",appUpdateRestart:"Перезапустить",appUpdateHide:"Скрыть",homeSignIn:"Войти — покупки и прогресс сохранятся",googleSignedIn:"Вы вошли через Google",signedInAs:"Вы вошли как {email}",signInToBuy:"Сначала войдите — так покупка останется за вами и после переустановки.",accountPasswordConfirmLabel:"Повторите пароль",accountPasswordMismatch:"Пароли не совпадают.",accountPasswordSame:"Этот пароль уже установлен — входите с ним.",accountPasswordWeak:"Пароль слишком простой: добавьте буквы и цифры.",passwordShow:"Показать пароль",passwordHide:"Скрыть пароль",terms:"Условия",deletePage:"Удаление аккаунта",installIosHint:"На iPhone: «Поделиться» → «На экран Домой».",
    accountTitle:"Аккаунт и синхронизация",accountGuestNote:"Войдите, чтобы сохранять письма и настройки на ваших устройствах.",accountPrivacy:"Фото, своя музыка и черновики остаются только на этом устройстве, пока вы сами не опубликуете письмо.",continueGoogle:"Продолжить с Google",continueApple:"Продолжить с Apple",continueFacebook:"Продолжить с Facebook",signOut:"Выйти",deleteAccount:"Удалить аккаунт",deleteAccountConfirm:"Удалить аккаунт GlowLetter и весь облачный прогресс без возможности восстановления? Сначала отмените активную подписку в Google Play: после удаления её нельзя будет привязать к новому аккаунту GlowLetter.",deleteAccountDeleting:"Удаляю аккаунт…",deleteAccountDone:"Аккаунт и облачный прогресс удалены",deleteAccountFail:"Не удалось удалить аккаунт. Проверьте интернет или напишите в поддержку.",cloudChecking:"Проверяю вход…",cloudProvidersChecking:"Проверяю способы входа…",cloudSignInPrompt:"Войдите, чтобы включить облачное сохранение",cloudSyncing:"Сохраняю прогресс…",cloudSynced:"Прогресс сохранён в облаке",cloudOffline:"Нет связи — изменения остаются на устройстве",cloudError:"Не удалось синхронизировать. Попробую снова при подключении.",cloudUnavailable:"Облачный вход сейчас недоступен",cloudSignInError:"Не удалось войти. Попробуйте ещё раз.",cloudSigningIn:"Открываю безопасный вход…",cloudSignedOut:"Вы вышли из аккаунта"
  });
  Object.assign(UI.en, {
    setupEyebrow:"BEFORE OPENING THE LETTER",setupTitle:"Who is this letter for?",setupNote:"Names are used only for the personal greeting and signature.",setupSubmit:"Open the letter",
    setupSenderPlaceholder:"Your name",setupRecipientPlaceholder:"Recipient's name",stateOn:"ON",stateOff:"OFF",stateOpen:"OPEN",trackPrimary:"main melody",trackLight:"light version",trackWarm:"warm version",
    homeAria:"Go to the home screen",soundOnAria:"Play nasheed",soundOffAria:"Pause nasheed",natureOnAria:"Turn on nature sounds",natureOffAria:"Turn off nature sounds",weatherAria:"Show weather",languageAria:"Change language",libraryAria:"Letter collection",settingsAria:"Atmosphere and music",previousAria:"Previous letter",shareAria:"Share letter",closeAria:"Close",closeLibraryAria:"Close collection",closeSettingsAria:"Close settings",homeScreenAria:"Home screen",letterNavAria:"Browse letters",checkingPurchase:"Checking subscription…",allLetters:"Unlock GlowLetter Premium",onePurchase:"A monthly or yearly subscription: every letter, moments, and new features.",paywallBody:"The first 10 letters stay free. The other 40 open with a monthly or yearly subscription. It renews automatically until you cancel it in your store account.",benefit1:"all 50 letters in twenty-five languages",benefit2:"moments, reminders, and QR links",benefit3:"new texts and features",benefit4:"support for the author",saveSettings:"Save settings",settingsSaved:"Settings saved",manageSubscription:"Manage subscription",subscriptionTitle:"Your access",subscriptionRestore:"Restore subscription",subscriptionNoteFree:"The first 10 letters are open. Full access adds the other 40, moments, reminders and letter styling.",subscriptionNoteStore:"The subscription renews automatically. Cancel or change the plan in your store account.",subscriptionNoteVip:"Access was granted manually. When it expires the app returns to the free mode.",subscriptionNotePermanent:"Full access is open. There is nothing to renew or pay.",subscriptionNoteChecking:"Checking access in the store and in the cloud…",accountPasswordToggle:"Set a sign-in password",accountPasswordLabel:"New password",accountPasswordNote:"At least 8 characters. Once saved you can sign in with your address and password, not only with a code.",accountPasswordSubmit:"Save password",accountPasswordSaved:"Password saved. You can now sign in with your address and password.",accountPasswordShort:"The password must be at least 8 characters.",accountPasswordFailed:"The password could not be saved. Please try again.",purchaseNotConfigured:"The subscription is not set up in Google Play yet. Payment will work once the product is live in the store.",purchaseStoreSilent:"Google Play did not respond. Check your connection and try again.",purchaseLaunchFailed:"Google Play could not open the payment sheet. Please try again in a minute.",purchaseStoreUnavailable:"Google Play is unavailable right now. Make sure you are signed in to your Google account in the Play Store and try again.",purchasePending:"The payment is still processing. Access opens by itself once Google Play confirms it.",purchaseVerifyPending:"The payment went through, but the check has not finished yet. In a minute, tap “Restore subscription” in settings.",appUpdateAvailable:"A new version of GlowLetter is out",appUpdateButton:"Update",appUpdateDownloading:"Downloading the update…",appUpdateReady:"The update is ready",appUpdateRestart:"Restart",appUpdateHide:"Hide",homeSignIn:"Sign in to keep purchases and progress",googleSignedIn:"Signed in with Google",signedInAs:"Signed in as {email}",signInToBuy:"Sign in first so the purchase stays yours, even after reinstalling.",accountPasswordConfirmLabel:"Repeat the password",accountPasswordMismatch:"The passwords do not match.",accountPasswordSame:"This password is already set — sign in with it.",accountPasswordWeak:"The password is too weak: use letters and numbers.",passwordShow:"Show password",passwordHide:"Hide password",terms:"Terms",deletePage:"Delete account",installIosHint:"On iPhone: Share → Add to Home Screen.",
    accountTitle:"Account and sync",accountGuestNote:"Sign in to keep your letters and settings across your devices.",accountPrivacy:"Photos, custom audio, and drafts stay on this device until you choose to publish a letter.",continueGoogle:"Continue with Google",continueApple:"Continue with Apple",continueFacebook:"Continue with Facebook",signOut:"Sign out",deleteAccount:"Delete account",deleteAccountConfirm:"Permanently delete your GlowLetter account and cloud progress? Cancel any active Google Play subscription first: after deletion it cannot be attached to a new GlowLetter account.",deleteAccountDeleting:"Deleting account…",deleteAccountDone:"Account and cloud progress deleted",deleteAccountFail:"Could not delete the account. Check your connection or contact support.",cloudChecking:"Checking your account…",cloudProvidersChecking:"Checking sign-in methods…",cloudSignInPrompt:"Sign in to enable cloud saving",cloudSyncing:"Saving your progress…",cloudSynced:"Progress saved to the cloud",cloudOffline:"Offline — changes remain on this device",cloudError:"Could not sync. I will retry when you are online.",cloudUnavailable:"Cloud sign-in is currently unavailable",cloudSignInError:"Could not sign in. Please try again.",cloudSigningIn:"Opening secure sign-in…",cloudSignedOut:"You are signed out"
  });
  Object.assign(UI.fr, {
    setupEyebrow:"AVANT D’OUVRIR LA LETTRE",setupTitle:"À qui s’adresse cette lettre ?",setupNote:"Les prénoms servent uniquement à personnaliser l’adresse et la signature.",setupSubmit:"Ouvrir la lettre",
    setupSenderPlaceholder:"Votre prénom",setupRecipientPlaceholder:"Prénom du destinataire",stateOn:"ACTIF",stateOff:"INACTIF",stateOpen:"OUVRIR",trackPrimary:"mélodie principale",trackLight:"version lumineuse",trackWarm:"version chaleureuse",
    homeAria:"Aller à l’accueil",soundOnAria:"Lire le nasheed",soundOffAria:"Mettre le nasheed en pause",natureOnAria:"Activer les sons de la nature",natureOffAria:"Désactiver les sons de la nature",weatherAria:"Afficher la météo",languageAria:"Changer de langue",libraryAria:"Collection de lettres",settingsAria:"Ambiance et musique",previousAria:"Lettre précédente",shareAria:"Partager la lettre",closeAria:"Fermer",closeLibraryAria:"Fermer la collection",closeSettingsAria:"Fermer les réglages",homeScreenAria:"Écran d’accueil",letterNavAria:"Parcourir les lettres",checkingPurchase:"Vérification de l’abonnement…",allLetters:"Débloquez GlowLetter Premium",onePurchase:"Un abonnement mensuel ou annuel : toutes les lettres, les moments et les nouveautés.",paywallBody:"Les 10 premières lettres restent gratuites. Les 40 autres s’ouvrent avec un abonnement mensuel ou annuel. Il se renouvelle automatiquement jusqu’à son annulation dans votre compte du magasin.",benefit1:"les 50 lettres en vingt-cinq langues",benefit2:"moments, rappels et liens QR",benefit3:"nouveaux textes et fonctions",benefit4:"soutien à l’auteur",saveSettings:"Enregistrer les réglages",settingsSaved:"Réglages enregistrés",manageSubscription:"Gérer l’abonnement",subscriptionTitle:"Votre accès",subscriptionRestore:"Restaurer l’abonnement",subscriptionNoteFree:"Les 10 premières lettres sont ouvertes. L’accès complet ajoute les 40 autres, les moments, les rappels et le style de la lettre.",subscriptionNoteStore:"L’abonnement se renouvelle automatiquement. Annulez ou changez de formule dans votre compte du magasin.",subscriptionNoteVip:"L’accès a été accordé manuellement. À l’expiration, l’application revient au mode gratuit.",subscriptionNotePermanent:"L’accès complet est ouvert. Rien à renouveler, rien à payer.",subscriptionNoteChecking:"Vérification de l’accès dans le magasin et dans le cloud…",accountPasswordToggle:"Définir un mot de passe",accountPasswordLabel:"Nouveau mot de passe",accountPasswordNote:"8 caractères minimum. Une fois enregistré, vous pourrez vous connecter avec votre adresse et ce mot de passe, et plus seulement par code.",accountPasswordSubmit:"Enregistrer le mot de passe",accountPasswordSaved:"Mot de passe enregistré. Vous pouvez désormais vous connecter avec votre adresse et ce mot de passe.",accountPasswordShort:"Le mot de passe doit contenir au moins 8 caractères.",accountPasswordFailed:"Impossible d’enregistrer le mot de passe. Réessayez.",purchaseNotConfigured:"L’abonnement n’est pas encore créé dans Google Play. Le paiement fonctionnera dès que le produit sera en ligne.",purchaseStoreSilent:"Google Play n’a pas répondu. Vérifiez la connexion et réessayez.",purchaseLaunchFailed:"Google Play n’a pas pu ouvrir le paiement. Réessayez dans une minute.",purchaseStoreUnavailable:"Google Play est indisponible pour le moment. Vérifiez que vous êtes connecté à votre compte Google dans le Play Store, puis réessayez.",purchasePending:"Le paiement est en cours de traitement. L’accès s’ouvrira tout seul dès que Google Play l’aura confirmé.",purchaseVerifyPending:"Le paiement est passé, mais la vérification n’est pas terminée. Dans une minute, touchez « Restaurer l’abonnement » dans les réglages.",appUpdateAvailable:"Une nouvelle version de GlowLetter est sortie",appUpdateButton:"Mettre à jour",appUpdateDownloading:"Téléchargement de la mise à jour…",appUpdateReady:"La mise à jour est prête",appUpdateRestart:"Redémarrer",appUpdateHide:"Masquer",homeSignIn:"Se connecter pour garder achats et progrès",googleSignedIn:"Connecté avec Google",signedInAs:"Connecté en tant que {email}",signInToBuy:"Connectez-vous d’abord : l’achat vous suivra même après une réinstallation.",accountPasswordConfirmLabel:"Répétez le mot de passe",accountPasswordMismatch:"Les mots de passe ne correspondent pas.",accountPasswordSame:"Ce mot de passe est déjà défini — connectez-vous avec.",accountPasswordWeak:"Mot de passe trop simple : ajoutez des lettres et des chiffres.",passwordShow:"Afficher le mot de passe",passwordHide:"Masquer le mot de passe",terms:"Conditions",deletePage:"Supprimer le compte",installIosHint:"Sur iPhone : Partager → Sur l’écran d’accueil.",
    accountTitle:"Compte et synchronisation",accountGuestNote:"Connectez-vous pour retrouver vos lettres et réglages sur vos appareils.",accountPrivacy:"Les photos, les fichiers audio personnels et les brouillons restent sur cet appareil jusqu’à ce que vous choisissiez de publier une lettre.",continueGoogle:"Continuer avec Google",continueApple:"Continuer avec Apple",continueFacebook:"Continuer avec Facebook",signOut:"Se déconnecter",deleteAccount:"Supprimer le compte",deleteAccountConfirm:"Supprimer définitivement votre compte GlowLetter et votre progression en ligne ? Annulez d’abord tout abonnement Google Play actif : après la suppression, il ne pourra pas être rattaché à un nouveau compte GlowLetter.",deleteAccountDeleting:"Suppression du compte…",deleteAccountDone:"Compte et progression en ligne supprimés",deleteAccountFail:"Impossible de supprimer le compte. Vérifiez la connexion ou contactez l’assistance.",cloudChecking:"Vérification du compte…",cloudProvidersChecking:"Vérification des modes de connexion…",cloudSignInPrompt:"Connectez-vous pour activer la sauvegarde en ligne",cloudSyncing:"Enregistrement de votre progression…",cloudSynced:"Progression enregistrée en ligne",cloudOffline:"Hors connexion — les changements restent sur cet appareil",cloudError:"Synchronisation impossible. Nouvel essai dès le retour du réseau.",cloudUnavailable:"La connexion en ligne est indisponible",cloudSignInError:"Connexion impossible. Réessayez.",cloudSigningIn:"Ouverture de la connexion sécurisée…",cloudSignedOut:"Vous êtes déconnecté"
  });
  Object.assign(UI.ru, {
    publishEyebrow:"ПЕРЕД ПУБЛИКАЦИЕЙ",publishTitle:"Проверьте письмо",publishLead:"Ссылку или QR-код смогут открыть все, кому их передадут.",publishConsent:"Я имею право делиться именами, текстом и аудио; содержание законно, уважительно и опубликовано с согласия. Получатель сможет пожаловаться.",publishAgreement:"Продолжая, вы принимаете",publishTerms:"Условия",publishAnd:"и",publishPrivacy:"Политику конфиденциальности",publishRequired:"Подтвердите согласие перед публикацией.",publishCancel:"Отмена",publishConfirm:"Продолжить",
    reportLink:"Пожаловаться на письмо",reportEyebrow:"БЕЗОПАСНОСТЬ",reportTitle:"Пожаловаться",reportLead:"Сообщение проверит администратор. Не добавляйте пароли, банковские данные или коды.",reportCategory:"Причина",reportDetails:"Комментарий · необязательно",reportPlaceholder:"Кратко объясните проблему",reportSubmit:"Отправить жалобу",reportSending:"Отправляю…",reportSent:"Спасибо. Жалоба передана на проверку.",reportFailed:"Не удалось отправить жалобу. Проверьте интернет и повторите.",reportRate:"Слишком много жалоб. Попробуйте позже."
  });
  Object.assign(UI.en, {
    publishEyebrow:"BEFORE PUBLISHING",publishTitle:"Check your letter",publishLead:"Anyone who receives the link or QR code may open it.",publishConsent:"I have the right and consent to share these names, text, and audio. The content is lawful and respectful. The recipient can report it.",publishAgreement:"By continuing, you accept the",publishTerms:"Terms",publishAnd:"and",publishPrivacy:"Privacy Policy",publishRequired:"Confirm your agreement before publishing.",publishCancel:"Cancel",publishConfirm:"Continue",
    reportLink:"Report this letter",reportEyebrow:"SAFETY",reportTitle:"Report content",reportLead:"An administrator will review the report. Do not include passwords, bank details, or verification codes.",reportCategory:"Reason",reportDetails:"Comment · optional",reportPlaceholder:"Briefly explain the problem",reportSubmit:"Send report",reportSending:"Sending…",reportSent:"Thank you. Your report was sent for review.",reportFailed:"The report could not be sent. Check your connection and try again.",reportRate:"Too many reports. Please try again later."
  });
  Object.assign(UI.fr, {
    publishEyebrow:"AVANT PUBLICATION",publishTitle:"Vérifiez votre lettre",publishLead:"Toute personne recevant le lien ou le QR code pourra l’ouvrir.",publishConsent:"J’ai le droit et le consentement nécessaires pour partager ces prénoms, ce texte et cet audio. Le contenu est légal et respectueux. Le destinataire pourra le signaler.",publishAgreement:"En continuant, vous acceptez les",publishTerms:"Conditions",publishAnd:"et la",publishPrivacy:"Politique de confidentialité",publishRequired:"Confirmez votre accord avant la publication.",publishCancel:"Annuler",publishConfirm:"Continuer",
    reportLink:"Signaler cette lettre",reportEyebrow:"SÉCURITÉ",reportTitle:"Signaler un contenu",reportLead:"Un administrateur examinera le signalement. N’ajoutez jamais de mot de passe, coordonnées bancaires ou code.",reportCategory:"Motif",reportDetails:"Commentaire · facultatif",reportPlaceholder:"Expliquez brièvement le problème",reportSubmit:"Envoyer le signalement",reportSending:"Envoi…",reportSent:"Merci. Votre signalement a été transmis pour examen.",reportFailed:"Impossible d’envoyer le signalement. Vérifiez la connexion et réessayez.",reportRate:"Trop de signalements. Réessayez plus tard."
  });
  UI.ru.namesSettings = "Личное обращение";
  UI.en.namesSettings = "Personal names";
  UI.fr.namesSettings = "Personnalisation";
  Object.assign(UI.ru, {
    shareApp: "Поделиться приложением",
    shareAppText: "GlowLetter — тёплые письма для важных людей.",
    shareAppCopied: "Ссылка на приложение скопирована",
    shareChooserEyebrow: "GLOWLETTER · ПОДЕЛИТЬСЯ", shareChooserTitle: "Поделиться приложением", shareChooserLead: "Выберите удобный способ отправки.", shareTelegram: "Telegram", shareWhatsapp: "WhatsApp", shareEmail: "Почта", shareCopy: "Скопировать ссылку"
  });
  Object.assign(UI.en, {
    shareApp: "Share the app",
    shareAppText: "GlowLetter — warm letters for the people who matter.",
    shareAppCopied: "App link copied",
    shareChooserEyebrow: "GLOWLETTER · SHARE", shareChooserTitle: "Share the app", shareChooserLead: "Choose how you would like to send it.", shareTelegram: "Telegram", shareWhatsapp: "WhatsApp", shareEmail: "Email", shareCopy: "Copy link"
  });
  Object.assign(UI.fr, {
    shareApp: "Partager l’application",
    shareAppText: "GlowLetter — des lettres chaleureuses pour les personnes qui comptent.",
    shareAppCopied: "Lien de l’application copié",
    shareChooserEyebrow: "GLOWLETTER · PARTAGER", shareChooserTitle: "Partager l’application", shareChooserLead: "Choisissez votre mode d’envoi.", shareTelegram: "Telegram", shareWhatsapp: "WhatsApp", shareEmail: "E-mail", shareCopy: "Copier le lien"
  });
  Object.assign(UI.ru, {
    brandCopy:"Тёплые слова для тех, кто действительно важен.",stage:"Эти слова нашли путь к тебе",locationDenied:"Геолокация недоступна — показываю погоду ближайшего города",
    themeTitle:"Цвет интерфейса",themeAria:"Цвет интерфейса",themeMoon:"Гранат",themeRose:"Индиго",themeForest:"Шафран",themeSand:"Изумруд",
    qrOpen:"Создать QR-код",composerEyebrow:"GLOWLETTER · СВОИМИ СЛОВАМИ",composerTitle:"Письмо своими словами",composerLead:"Напишите то, что важно сказать. Текст сохранится в истории и попадёт в QR-карточку.",composerPlaceholder:"Дорогая мама, сегодня я хочу сказать тебе…",composerCounter:"{count} / {max}",composerDone:"Готово",composerCollection:"Выбрать из коллекции",composerEmpty:"Напишите хотя бы несколько слов.",composerForbidden:"В тексте есть слова, которые GlowLetter не пропускает.",qrPdf:"PDF для печати",qrPdfReady:"PDF готов",qrSend:"Отправить",qrSendTitle:"Отправить письмо",qrSendLead:"Ссылка откроет письмо на любом телефоне. Выберите, куда её отправить.",qrSendMessage:"{to}, для вас письмо от {from}",qrSendSms:"SMS",qrSendOther:"Другое приложение",qrSendFile:"Отправить карточку картинкой",settingsAtmosphere:"Атмосфера",settingsLook:"Оформление",settingsLetter:"Письмо",settingsSound:"Звук",settingsAccountSection:"Аккаунт",settingsApp:"Приложение",qrCloseAria:"Закрыть QR-код",qrTitle:"Письмо, которое<br><em>откроется по камере</em>",qrLead:"Проверьте имена и скачайте QR-код для цветов или подарка. Получатель увидит именно эту пару имён и первые 10 писем бесплатно.",qrGenerate:"Обновить QR-код",qrCaption:"10 писем в подарок",qrPrivacy:"Оба имени записываются прямо внутрь QR-кода и не изменятся после печати, даже если позже поменять настройки. Ключ VIP не передаётся.",qrDownload:"Скачать PNG",qrCopyLink:"Скопировать ссылку",qrCopyImage:"Скопировать QR",qrPrint:"⌁ Распечатать",qrRoute:"Письмо от {from} для {to}",qrGenericRoute:"Тёплое письмо для вас",qrReady:"Персональный QR-код готов",qrNamesSaved:"Имена сохранены в персональном QR",qrLinkCopied:"Ссылка QR-кода скопирована",qrImageCopied:"QR-код скопирован",qrImageCopyFail:"На этом устройстве можно скачать QR-код как PNG",qrUnavailable:"QR-код временно недоступен",backgroundFail:"Не удалось обработать этот фон",backgroundTooLarge:"Выберите файл размером до 18 МБ",fullscreenUnavailable:"Полноэкранный режим недоступен на этом устройстве",speechUnavailable:"Озвучивание недоступно на этом устройстве"
  });
  Object.assign(UI.en, {
    brandCopy:"Warm words for the people who truly matter.",stage:"These words found their way to you",locationDenied:"Location is unavailable — showing weather for the nearest fallback city",
    themeTitle:"Interface color",themeAria:"Interface color",themeMoon:"Garnet",themeRose:"Indigo",themeForest:"Saffron",themeSand:"Emerald",
    qrOpen:"Create a QR code",composerEyebrow:"GLOWLETTER · IN YOUR OWN WORDS",composerTitle:"A letter in your own words",composerLead:"Write what matters most. The text is kept in your history and goes onto the QR card.",composerPlaceholder:"Dear Mum, today I want to tell you…",composerCounter:"{count} / {max}",composerDone:"Done",composerCollection:"Choose from the collection",composerEmpty:"Write at least a few words.",composerForbidden:"The text contains words GlowLetter does not allow.",qrPdf:"Print-ready PDF",qrPdfReady:"The PDF is ready",qrSend:"Send",qrSendTitle:"Send the letter",qrSendLead:"The link opens the letter on any phone. Choose where to send it.",qrSendMessage:"{to}, there is a letter for you from {from}",qrSendSms:"SMS",qrSendOther:"Another app",qrSendFile:"Send the card as an image",settingsAtmosphere:"Atmosphere",settingsLook:"Appearance",settingsLetter:"Letter",settingsSound:"Sound",settingsAccountSection:"Account",settingsApp:"App",qrCloseAria:"Close QR code",qrTitle:"A letter that<br><em>opens with the camera</em>",qrLead:"Check both names and download the QR code for flowers or a gift. The recipient will see this exact pair and the first 10 letters for free.",qrGenerate:"Update QR code",qrCaption:"10 letters as a gift",qrPrivacy:"Both names are written directly into the QR code and will not change after printing, even if the app settings change later. VIP access is never shared.",qrDownload:"Download PNG",qrCopyLink:"Copy link",qrCopyImage:"Copy QR",qrPrint:"⌁ Print",qrRoute:"A letter from {from} to {to}",qrGenericRoute:"A warm letter for you",qrReady:"Personal QR code is ready",qrNamesSaved:"Names saved in the personal QR",qrLinkCopied:"QR link copied",qrImageCopied:"QR code copied",qrImageCopyFail:"Download the QR code as PNG on this device",qrUnavailable:"QR code is temporarily unavailable",backgroundFail:"This background could not be processed",backgroundTooLarge:"Choose a file up to 18 MB",fullscreenUnavailable:"Full screen is unavailable on this device",speechUnavailable:"Read aloud is unavailable on this device"
  });
  Object.assign(UI.fr, {
    brandCopy:"Des mots chaleureux pour les personnes qui comptent vraiment.",stage:"Ces mots ont trouvé leur chemin jusqu’à toi",locationDenied:"La position est indisponible — météo de la ville de secours affichée",
    themeTitle:"Couleur de l’interface",themeAria:"Couleur de l’interface",themeMoon:"Grenat",themeRose:"Indigo",themeForest:"Safran",themeSand:"Émeraude",
    qrOpen:"Créer un QR code",composerEyebrow:"GLOWLETTER · AVEC VOS MOTS",composerTitle:"Une lettre avec vos mots",composerLead:"Écrivez ce qui compte vraiment. Le texte reste dans votre historique et figure sur la carte QR.",composerPlaceholder:"Chère maman, aujourd’hui je veux te dire…",composerCounter:"{count} / {max}",composerDone:"Terminé",composerCollection:"Choisir dans la collection",composerEmpty:"Écrivez au moins quelques mots.",composerForbidden:"Le texte contient des mots que GlowLetter n’accepte pas.",qrPdf:"PDF à imprimer",qrPdfReady:"Le PDF est prêt",qrSend:"Envoyer",qrSendTitle:"Envoyer la lettre",qrSendLead:"Le lien ouvre la lettre sur n’importe quel téléphone. Choisissez où l’envoyer.",qrSendMessage:"{to}, une lettre de {from} vous attend",qrSendSms:"SMS",qrSendOther:"Une autre application",qrSendFile:"Envoyer la carte en image",settingsAtmosphere:"Ambiance",settingsLook:"Apparence",settingsLetter:"Lettre",settingsSound:"Son",settingsAccountSection:"Compte",settingsApp:"Application",qrCloseAria:"Fermer le QR code",qrTitle:"Une lettre qui<br><em>s’ouvre avec l’appareil photo</em>",qrLead:"Vérifiez les deux prénoms et téléchargez le QR code pour des fleurs ou un cadeau. Le destinataire verra exactement cette paire et les 10 premières lettres gratuitement.",qrGenerate:"Actualiser le QR code",qrCaption:"10 lettres en cadeau",qrPrivacy:"Les deux prénoms sont inscrits directement dans le QR code et ne changeront pas après impression, même si les réglages sont modifiés. L’accès VIP n’est jamais transmis.",qrDownload:"Télécharger le PNG",qrCopyLink:"Copier le lien",qrCopyImage:"Copier le QR",qrPrint:"⌁ Imprimer",qrRoute:"Une lettre de {from} pour {to}",qrGenericRoute:"Une lettre chaleureuse pour vous",qrReady:"Le QR code personnel est prêt",qrNamesSaved:"Prénoms enregistrés dans le QR personnel",qrLinkCopied:"Lien du QR code copié",qrImageCopied:"QR code copié",qrImageCopyFail:"Téléchargez le QR code en PNG sur cet appareil",qrUnavailable:"Le QR code est momentanément indisponible",backgroundFail:"Ce fond n’a pas pu être traité",backgroundTooLarge:"Choisissez un fichier de 18 Mo maximum",fullscreenUnavailable:"Le plein écran est indisponible sur cet appareil",speechUnavailable:"La lecture à voix haute est indisponible sur cet appareil"
  });
  Object.assign(UI.ru, {
    accountSupportLabel:"ID для поддержки",accountSupportNote:"Это не пароль. Передавайте ID только официальной поддержке GlowLetter.",accountIdCopy:"Скопировать",accountIdCopied:"ID аккаунта скопирован",accountPlanChecking:"Проверяю доступ…",accountPlanFree:"Бесплатный доступ · 10 писем",accountPlanPermanent:"VIP · полный доступ без ограничений",accountPlanStore:"VIP · подписка активна",accountPlanVip:"Осталось {remaining} · до {date}",accountBadgeChecking:"…",accountBadgeFree:"FREE",accountBadgeVip:"VIP",accountBadgeAdmin:"АДМИНИСТРАТОР",profilePhotoAria:"Изменить фото профиля",profilePhotoReady:"Фото профиля сохранено на этом устройстве",profilePhotoFail:"Не удалось обработать фото",profilePhotoTooLarge:"Выберите фото размером до 8 МБ",
    adminEyebrow:"УПРАВЛЕНИЕ ДОСТУПОМ",adminTitle:"Админ-панель",adminDescription:"По ID видны только срок и статус доступа. Выдача и отзыв VIP записываются в защищённый журнал.",adminIdLabel:"ID аккаунта",adminIdPlaceholder:"Вставьте полный ID GL-…",adminFind:"Найти",adminSearching:"Ищу аккаунт…",adminNotFound:"Аккаунт с таким ID не найден",adminCurrentPlan:"Текущий план",adminDaysLabel:"Срок VIP",adminDaysUnit:"дней",adminGrantForever:"Выдать без срока",adminGrantForeverDone:"Полный доступ выдан без срока",adminGrantVip:"Выдать VIP",adminRevoke:"Отозвать VIP",adminGrantDone:"VIP-доступ выдан до {date}",adminRevokeDone:"VIP-доступ отозван",adminError:"Не удалось выполнить действие. Проверьте ID и подключение.",adminNoticeReasonLabel:"Причина уведомления",adminNoticeMessageLabel:"Личное сообщение · необязательно",adminNoticeMessagePlaceholder:"Например: спасибо, что помогли нам улучшить GlowLetter",adminNoticeHint:"Получатель увидит это сообщение внутри приложения.",adminNoticeInvalid:"Сообщение содержит запрещённую формулировку или длиннее 240 символов.",adminLookupHint:"ID аккаунта (GL-…) или e-mail",adminLookupInvalid:"Введите полный ID или e-mail",adminBulkTitle:"Всем пользователям",adminBulkNote:"VIP получат все, кроме админов и тех, у кого доступ без срока. Дни добавляются к оставшемуся сроку.",adminGrantAll:"Выдать VIP всем",adminRevokeAll:"Отозвать VIP у всех",adminGrantAllConfirm:"Выдать VIP на {days} дн. всем пользователям?",adminGrantAllDone:"VIP выдан. Аккаунтов: {count}",adminRevokeAllConfirm:"Отозвать VIP у всех пользователей? Доступ без срока и админы не затрагиваются.",adminRevokeAllDone:"VIP отозван. Аккаунтов: {count}",adminRecentTitle:"Последние аккаунты",adminRefresh:"Обновить",adminRecentEmpty:"Аккаунтов пока нет",adminStatTotal:"Аккаунтов",adminStatVip:"VIP сейчас",adminStatForever:"Без срока",adminStatNew:"Новых за 7 дней",adminRowCreated:"создан",adminRowSignIn:"вход",adminRowNever:"не входил",
    notificationBell:"Уведомления",notificationBellAria:"Уведомления: {count} новых",notificationsEyebrow:"GLOWLETTER · VIP",notificationsTitle:"Ваши уведомления",notificationsLead:"Здесь сохраняются подарки и изменения VIP-доступа.",vipNoticeBodyForever:"Вам открыт полный доступ. Продлевать и платить ничего не нужно.",vipNoticeTitleForever:"Полный доступ открыт",vipNoticeTitle:"VIP уже активен",vipNoticeTitleExpired:"VIP-период завершён",vipNoticeBodyDays:"Вам открыт VIP на {duration}. Полный доступ активен до {date}.",vipNoticeBodyUntil:"Полный VIP-доступ активен до {date}.",vipNoticeBodyActive:"Полный VIP-доступ активирован.",vipNoticeBodyExpired:"VIP-доступ действовал до {date}. Уведомление сохранено в истории.",notificationMessageLabel:"Сообщение",notificationAcknowledge:"Отлично",notificationHistoryTitle:"История",notificationsUnread:"Новых: {count}",notificationsAllRead:"Всё прочитано",notificationsEmpty:"Здесь появятся сообщения о VIP-доступе.",notificationNew:"НОВОЕ",notificationRead:"ПРОЧИТАНО",notificationLoading:"Загружаю уведомления…",notificationLoadFailed:"Не удалось загрузить уведомления. Проверьте интернет.",notificationReadFailed:"Не удалось сохранить прочтение. Попробуйте ещё раз.",notificationReasonGift:"Подарок",notificationReasonCompensation:"Компенсация",notificationReasonPromotion:"Акция",notificationReasonOther:"Другое"
  });
  Object.assign(UI.en, {
    accountSupportLabel:"Support ID",accountSupportNote:"This is not a password. Share it only with official GlowLetter support.",accountIdCopy:"Copy",accountIdCopied:"Account ID copied",accountPlanChecking:"Checking access…",accountPlanFree:"Free access · 10 letters",accountPlanPermanent:"VIP · unlimited full access",accountPlanStore:"VIP · subscription active",accountPlanVip:"{remaining} left · until {date}",accountBadgeChecking:"…",accountBadgeFree:"FREE",accountBadgeVip:"VIP",accountBadgeAdmin:"ADMINISTRATOR",profilePhotoAria:"Change profile photo",profilePhotoReady:"Profile photo saved on this device",profilePhotoFail:"This photo could not be processed",profilePhotoTooLarge:"Choose a photo up to 8 MB",
    adminEyebrow:"ACCESS MANAGEMENT",adminTitle:"Admin panel",adminDescription:"Only access status and expiry are shown. VIP grants and revocations are written to a protected audit log.",adminIdLabel:"Account ID",adminIdPlaceholder:"Paste the full GL-… ID",adminFind:"Find",adminSearching:"Finding account…",adminNotFound:"No account was found with this ID",adminCurrentPlan:"Current plan",adminDaysLabel:"VIP duration",adminDaysUnit:"days",adminGrantForever:"Grant with no end date",adminGrantForeverDone:"Full access granted with no end date",adminGrantVip:"Grant VIP",adminRevoke:"Revoke VIP",adminGrantDone:"VIP access granted until {date}",adminRevokeDone:"VIP access revoked",adminError:"The action could not be completed. Check the ID and connection.",adminNoticeReasonLabel:"Notification reason",adminNoticeMessageLabel:"Personal message · optional",adminNoticeMessagePlaceholder:"For example: thank you for helping us improve GlowLetter",adminNoticeHint:"The recipient will see this message inside the app.",adminNoticeInvalid:"The message contains prohibited wording or is longer than 240 characters.",adminLookupHint:"Account ID (GL-…) or e-mail",adminLookupInvalid:"Enter a full ID or an e-mail",adminBulkTitle:"Everyone",adminBulkNote:"Every account gets VIP except admins and access with no end date. Days are added to the time left.",adminGrantAll:"Grant VIP to everyone",adminRevokeAll:"Revoke VIP from everyone",adminGrantAllConfirm:"Grant {days} days of VIP to every user?",adminGrantAllDone:"VIP granted. Accounts: {count}",adminRevokeAllConfirm:"Revoke VIP from every user? Access with no end date and admins are not affected.",adminRevokeAllDone:"VIP revoked. Accounts: {count}",adminRecentTitle:"Latest accounts",adminRefresh:"Refresh",adminRecentEmpty:"No accounts yet",adminStatTotal:"Accounts",adminStatVip:"VIP now",adminStatForever:"No end date",adminStatNew:"New in 7 days",adminRowCreated:"created",adminRowSignIn:"signed in",adminRowNever:"never signed in",
    notificationBell:"Notifications",notificationBellAria:"Notifications: {count} new",notificationsEyebrow:"GLOWLETTER · VIP",notificationsTitle:"Your notifications",notificationsLead:"VIP gifts and access changes are kept here.",vipNoticeBodyForever:"You have full access. There is nothing to renew or pay.",vipNoticeTitleForever:"Full access is open",vipNoticeTitle:"Your VIP is active",vipNoticeTitleExpired:"VIP period ended",vipNoticeBodyDays:"You received VIP for {duration}. Full access is active until {date}.",vipNoticeBodyUntil:"Full VIP access is active until {date}.",vipNoticeBodyActive:"Full VIP access is now active.",vipNoticeBodyExpired:"VIP access was active until {date}. This notice remains in your history.",notificationMessageLabel:"Message",notificationAcknowledge:"Wonderful",notificationHistoryTitle:"History",notificationsUnread:"{count} new",notificationsAllRead:"All read",notificationsEmpty:"VIP access messages will appear here.",notificationNew:"NEW",notificationRead:"READ",notificationLoading:"Loading notifications…",notificationLoadFailed:"Notifications could not be loaded. Check your connection.",notificationReadFailed:"Could not save as read. Please try again.",notificationReasonGift:"Gift",notificationReasonCompensation:"Compensation",notificationReasonPromotion:"Promotion",notificationReasonOther:"Other"
  });
  Object.assign(UI.fr, {
    accountSupportLabel:"ID d’assistance",accountSupportNote:"Ce n’est pas un mot de passe. Partagez-le uniquement avec l’assistance officielle GlowLetter.",accountIdCopy:"Copier",accountIdCopied:"ID du compte copié",accountPlanChecking:"Vérification de l’accès…",accountPlanFree:"Accès gratuit · 10 lettres",accountPlanPermanent:"VIP · accès complet illimité",accountPlanStore:"VIP · abonnement actif",accountPlanVip:"Encore {remaining} · jusqu’au {date}",accountBadgeChecking:"…",accountBadgeFree:"FREE",accountBadgeVip:"VIP",accountBadgeAdmin:"ADMINISTRATEUR",profilePhotoAria:"Modifier la photo de profil",profilePhotoReady:"Photo de profil enregistrée sur cet appareil",profilePhotoFail:"Cette photo n’a pas pu être traitée",profilePhotoTooLarge:"Choisissez une photo de 8 Mo maximum",
    adminEyebrow:"GESTION DES ACCÈS",adminTitle:"Espace administrateur",adminDescription:"Seuls le statut et l’échéance sont visibles. Les attributions et retraits de VIP sont consignés dans un journal protégé.",adminIdLabel:"ID du compte",adminIdPlaceholder:"Collez l’ID GL-… complet",adminFind:"Rechercher",adminSearching:"Recherche du compte…",adminNotFound:"Aucun compte ne correspond à cet ID",adminCurrentPlan:"Offre actuelle",adminDaysLabel:"Durée VIP",adminDaysUnit:"jours",adminGrantForever:"Accorder sans date de fin",adminGrantForeverDone:"Accès complet accordé sans date de fin",adminGrantVip:"Accorder le VIP",adminRevoke:"Retirer le VIP",adminGrantDone:"Accès VIP accordé jusqu’au {date}",adminRevokeDone:"Accès VIP retiré",adminError:"Action impossible. Vérifiez l’ID et la connexion.",adminNoticeReasonLabel:"Motif de la notification",adminNoticeMessageLabel:"Message personnel · facultatif",adminNoticeMessagePlaceholder:"Par exemple : merci de nous aider à améliorer GlowLetter",adminNoticeHint:"Le destinataire verra ce message dans l’application.",adminNoticeInvalid:"Le message contient une formulation interdite ou dépasse 240 caractères.",adminLookupHint:"ID du compte (GL-…) ou e-mail",adminLookupInvalid:"Saisissez un ID complet ou un e-mail",adminBulkTitle:"Tout le monde",adminBulkNote:"Tous les comptes reçoivent le VIP, sauf les administrateurs et les accès sans date de fin. Les jours s’ajoutent au temps restant.",adminGrantAll:"Accorder le VIP à tous",adminRevokeAll:"Retirer le VIP à tous",adminGrantAllConfirm:"Accorder {days} jours de VIP à tous les utilisateurs ?",adminGrantAllDone:"VIP accordé. Comptes : {count}",adminRevokeAllConfirm:"Retirer le VIP à tous les utilisateurs ? Les accès sans date de fin et les administrateurs ne sont pas concernés.",adminRevokeAllDone:"VIP retiré. Comptes : {count}",adminRecentTitle:"Derniers comptes",adminRefresh:"Actualiser",adminRecentEmpty:"Aucun compte pour l’instant",adminStatTotal:"Comptes",adminStatVip:"VIP actifs",adminStatForever:"Sans date de fin",adminStatNew:"Nouveaux en 7 jours",adminRowCreated:"créé",adminRowSignIn:"connexion",adminRowNever:"jamais connecté",
    notificationBell:"Notifications",notificationBellAria:"Notifications : {count} nouvelles",notificationsEyebrow:"GLOWLETTER · VIP",notificationsTitle:"Vos notifications",notificationsLead:"Les cadeaux et changements d’accès VIP sont conservés ici.",vipNoticeBodyForever:"Vous avez l’accès complet. Rien à renouveler, rien à payer.",vipNoticeTitleForever:"Accès complet ouvert",vipNoticeTitle:"Votre VIP est actif",vipNoticeTitleExpired:"La période VIP est terminée",vipNoticeBodyDays:"Vous avez reçu le VIP pour {duration}. L’accès complet est actif jusqu’au {date}.",vipNoticeBodyUntil:"L’accès VIP complet est actif jusqu’au {date}.",vipNoticeBodyActive:"L’accès VIP complet est maintenant actif.",vipNoticeBodyExpired:"L’accès VIP était actif jusqu’au {date}. Cette notification reste dans votre historique.",notificationMessageLabel:"Message",notificationAcknowledge:"Parfait",notificationHistoryTitle:"Historique",notificationsUnread:"{count} nouvelles",notificationsAllRead:"Tout est lu",notificationsEmpty:"Les messages concernant l’accès VIP apparaîtront ici.",notificationNew:"NOUVEAU",notificationRead:"LU",notificationLoading:"Chargement des notifications…",notificationLoadFailed:"Impossible de charger les notifications. Vérifiez la connexion.",notificationReadFailed:"Impossible d’enregistrer la lecture. Réessayez.",notificationReasonGift:"Cadeau",notificationReasonCompensation:"Compensation",notificationReasonPromotion:"Promotion",notificationReasonOther:"Autre"
  });
  Object.assign(UI.ru, {
    supportFormEyebrow:"GLOWLETTER · ПОДДЕРЖКА",supportFormTitle:"Расскажите,<br><em>что случилось</em>",supportFormLead:"Опишите проблему прямо здесь. Email и ID аккаунта будут приложены автоматически.",supportGuestTitle:"Сначала войдите в аккаунт",supportGuestNote:"Так мы безопасно приложим ваш email и ID и сможем найти аккаунт.",supportCopyContact:"Скопировать email поддержки",supportContactCopied:"Email поддержки скопирован",supportEmailLabel:"EMAIL ДЛЯ ОТВЕТА",supportIdLabel:"ID АККАУНТА",supportCategoryLabel:"Тема обращения",supportMessageLabel:"Что произошло?",supportMessagePlaceholder:"Опишите проблему, что вы нажали и что увидели…",supportPrivacyNote:"Не указывайте пароль, банковские данные и коды подтверждения.",supportSubmit:"Отправить в поддержку",supportSending:"Отправляю обращение…",supportSent:"Обращение отправлено. Поддержка получила уведомление и ответит на email аккаунта.",supportSaved:"Обращение безопасно сохранено. Доставка уведомления на email пока настраивается.",supportSignInRequired:"Войдите в аккаунт, чтобы отправить обращение.",supportInvalid:"Опишите проблему подробнее — от 20 до 2000 символов.",supportRateLimited:"Слишком много обращений. Попробуйте немного позже.",supportFailed:"Не удалось отправить обращение. Проверьте интернет и повторите.",supportCategoryTechnical:"Техническая проблема",supportCategoryAccount:"Аккаунт и вход",supportCategorySubscription:"VIP и подписка",supportCategoryContent:"Письма и тексты",supportCategoryFeedback:"Идея или отзыв",supportCategoryOther:"Другое"
  });
  Object.assign(UI.en, {
    supportFormEyebrow:"GLOWLETTER · SUPPORT",supportFormTitle:"Tell us<br><em>what happened</em>",supportFormLead:"Describe the problem here. Your account email and Support ID are attached automatically.",supportGuestTitle:"Sign in first",supportGuestNote:"This lets us securely attach your email and Support ID and find your account.",supportCopyContact:"Copy support email",supportContactCopied:"Support email copied",supportEmailLabel:"REPLY EMAIL",supportIdLabel:"ACCOUNT ID",supportCategoryLabel:"Topic",supportMessageLabel:"What happened?",supportMessagePlaceholder:"Describe what you tapped and what you saw…",supportPrivacyNote:"Do not include passwords, bank details, or verification codes.",supportSubmit:"Send to support",supportSending:"Sending your request…",supportSent:"Your request was sent. Support was notified and will reply to your account email.",supportSaved:"Your request was securely saved. Email notification delivery is still being configured.",supportSignInRequired:"Sign in to send a support request.",supportInvalid:"Please add more detail — between 20 and 2,000 characters.",supportRateLimited:"Too many requests. Please try again later.",supportFailed:"The request could not be sent. Check your connection and try again.",supportCategoryTechnical:"Technical problem",supportCategoryAccount:"Account and sign-in",supportCategorySubscription:"VIP and subscription",supportCategoryContent:"Letters and text",supportCategoryFeedback:"Idea or feedback",supportCategoryOther:"Other"
  });
  Object.assign(UI.fr, {
    supportFormEyebrow:"GLOWLETTER · ASSISTANCE",supportFormTitle:"Expliquez-nous<br><em>ce qui s’est passé</em>",supportFormLead:"Décrivez le problème ici. L’email et l’ID d’assistance du compte sont joints automatiquement.",supportGuestTitle:"Connectez-vous d’abord",supportGuestNote:"Nous pourrons ainsi joindre votre email et votre ID en toute sécurité et retrouver votre compte.",supportCopyContact:"Copier l’email d’assistance",supportContactCopied:"Email d’assistance copié",supportEmailLabel:"EMAIL DE RÉPONSE",supportIdLabel:"ID DU COMPTE",supportCategoryLabel:"Sujet",supportMessageLabel:"Que s’est-il passé ?",supportMessagePlaceholder:"Décrivez ce que vous avez touché et ce qui s’est affiché…",supportPrivacyNote:"N’indiquez jamais de mot de passe, coordonnées bancaires ou code de vérification.",supportSubmit:"Envoyer à l’assistance",supportSending:"Envoi de votre demande…",supportSent:"Votre demande est envoyée. L’assistance a été avertie et répondra à l’email du compte.",supportSaved:"Votre demande est enregistrée en sécurité. L’envoi de la notification par email est encore en cours de configuration.",supportSignInRequired:"Connectez-vous pour envoyer une demande d’assistance.",supportInvalid:"Ajoutez quelques détails — entre 20 et 2 000 caractères.",supportRateLimited:"Trop de demandes. Réessayez un peu plus tard.",supportFailed:"Impossible d’envoyer la demande. Vérifiez votre connexion et réessayez.",supportCategoryTechnical:"Problème technique",supportCategoryAccount:"Compte et connexion",supportCategorySubscription:"VIP et abonnement",supportCategoryContent:"Lettres et textes",supportCategoryFeedback:"Idée ou avis",supportCategoryOther:"Autre"
  });
  Object.assign(UI.ru, {
    accountTitle:"Сохранение",accountGuestNote:"Сохраните письма и настройки на всех своих устройствах.",accountPrivacy:"Личные фото и музыка остаются только на этом устройстве.",
    focusRead:"Режим чтения",focusExit:"Вернуться",focusHint:"← Свайп или стрелки →"
  });
  Object.assign(UI.en, {
    accountTitle:"Save your progress",accountGuestNote:"Keep your letters and settings on all your devices.",accountPrivacy:"Personal photos and audio stay only on this device.",
    focusRead:"Reading mode",focusExit:"Return",focusHint:"← Swipe or arrow keys →"
  });
  Object.assign(UI.fr, {
    accountTitle:"Sauvegarde",accountGuestNote:"Retrouvez vos lettres et réglages sur tous vos appareils.",accountPrivacy:"Les photos et fichiers audio personnels restent sur cet appareil.",
    focusRead:"Mode lecture",focusExit:"Retour",focusHint:"← Balayage ou flèches →"
  });
  Object.assign(UI.ru, {
    music:"Аудио письма",customMusic:"Добавить своё аудио",customMusicNote:"MP3, M4A, AAC, OGG или WAV · до 12 МБ",audioShareNote:"В персональной ссылке аудио доступно получателю до 12 часов.",removeAudio:"× Убрать аудио",soundOnAria:"Включить аудио",soundOffAria:"Выключить аудио",audioTooLarge:"Выберите аудио размером до 12 МБ",audioUnsupported:"Поддерживаются MP3, M4A, AAC, OGG и WAV",audioSignIn:"Чтобы безопасно добавить аудио в ссылку, войдите в аккаунт или уберите аудио",audioPreparing:"Готовлю временное аудио для получателя…",audioSkippedSignIn:"Письмо отправлено без мелодии: чтобы вложить своё аудио, войдите в аккаунт.",audioSkippedFailed:"Письмо отправлено без мелодии: не удалось её загрузить.",audioShareFailed:"Не удалось безопасно добавить аудио. Проверьте интернет и повторите.",audioExpired:"Срок доступа к аудио закончился",audioPlayFail:"Нажмите ещё раз, чтобы включить аудио",audioRemoved:"Аудио убрано",accountPrivacy:"Личное аудио хранится на устройстве; при отправке персональной ссылки временная копия доступна до 12 часов."
  });
  Object.assign(UI.en, {
    music:"Letter audio",customMusic:"Add your own audio",customMusicNote:"MP3, M4A, AAC, OGG, or WAV · up to 12 MB",audioShareNote:"In a personal link, recipients can play the audio for up to 12 hours.",removeAudio:"× Remove audio",soundOnAria:"Play audio",soundOffAria:"Pause audio",audioTooLarge:"Choose an audio file up to 12 MB",audioUnsupported:"MP3, M4A, AAC, OGG, and WAV are supported",audioSignIn:"Sign in to attach audio securely, or remove the audio before sharing",audioPreparing:"Preparing temporary audio for the recipient…",audioSkippedSignIn:"The letter was shared without the melody: sign in to attach your own audio.",audioSkippedFailed:"The letter was shared without the melody: it could not be uploaded.",audioShareFailed:"Audio could not be attached securely. Check your connection and try again.",audioExpired:"This audio link has expired",audioPlayFail:"Tap again to play audio",audioRemoved:"Audio removed",accountPrivacy:"Personal audio stays on this device; a temporary copy is available for up to 12 hours only when you share a personal link."
  });
  Object.assign(UI.fr, {
    music:"Audio de la lettre",customMusic:"Ajouter votre propre audio",customMusicNote:"MP3, M4A, AAC, OGG ou WAV · 12 Mo maximum",audioShareNote:"Dans un lien personnel, le destinataire peut écouter l’audio pendant 12 heures maximum.",removeAudio:"× Retirer l’audio",soundOnAria:"Lire l’audio",soundOffAria:"Mettre l’audio en pause",audioTooLarge:"Choisissez un fichier audio de 12 Mo maximum",audioUnsupported:"Formats acceptés : MP3, M4A, AAC, OGG et WAV",audioSignIn:"Connectez-vous pour joindre l’audio en sécurité, ou retirez-le avant le partage",audioPreparing:"Préparation de l’audio temporaire pour le destinataire…",audioSkippedSignIn:"La lettre a été partagée sans la mélodie : connectez-vous pour joindre votre audio.",audioSkippedFailed:"La lettre a été partagée sans la mélodie : le téléversement a échoué.",audioShareFailed:"Impossible de joindre l’audio en sécurité. Vérifiez la connexion et réessayez.",audioExpired:"Le lien audio a expiré",audioPlayFail:"Touchez à nouveau pour lire l’audio",audioRemoved:"Audio retiré",accountPrivacy:"L’audio personnel reste sur cet appareil ; une copie temporaire est disponible jusqu’à 12 heures uniquement lors du partage d’un lien personnel."
  });

  const PICKER_TEXT = {
    ru: { note: "Выберите письмо · получатель: {name}", noteGeneric: "Выберите письмо из коллекции", pick: "Выбрать", own: "Своими словами", ownNote: "Напишите свой текст вместо готового письма" },
    en: { note: "Choose a letter · for {name}", noteGeneric: "Choose a letter from the collection", pick: "Choose", own: "In your own words", ownNote: "Write your own text instead of a ready letter" },
    fr: { note: "Choisissez une lettre · pour {name}", noteGeneric: "Choisissez une lettre de la collection", pick: "Choisir", own: "Avec vos mots", ownNote: "Écrivez votre propre texte au lieu d’une lettre prête" }
  };

  // German, Spanish, Italian and Polish come from i18n-extra.js. A phrase that
  // is missing there shows in English rather than in Russian.
  const SUPPORTED_LANGUAGES = Object.freeze(Array.isArray(window.NUR_LANGUAGES) ? window.NUR_LANGUAGES.slice() : ["ru", "en", "fr"]);
  SUPPORTED_LANGUAGES.forEach(code => {
    const extra = window.NUR_I18N_EXTRA?.[code];
    if (!extra || UI[code]) return;
    UI[code] = { ...UI.en, ...extra.app };
    PICKER_TEXT[code] = { ...PICKER_TEXT.en, ...extra.picker };
  });

  // First launch speaks the phone's language when GlowLetter knows it.
  // Norwegian phones report Bokmål or Nynorsk (the app calls both "no"), and
  // Indonesian is "ind" inside the app because the letters already use the key
  // "id" for their numbers; phones say "id" or, on old Android, "in".
  const LANGUAGE_ALIASES = Object.freeze({ nb: "no", nn: "no", id: "ind", in: "ind" });
  function deviceLanguage() {
    const preferred = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages : [navigator.language];
    for (const tag of preferred) {
      const raw = String(tag || "").toLowerCase().split(/[-_]/)[0];
      const code = LANGUAGE_ALIASES[raw] || raw;
      if (SUPPORTED_LANGUAGES.includes(code) && UI[code]) return code;
    }
    return "en";
  }
  // The app follows the phone's language until the person picks one. Before
  // 2.4.7 every install stored Russian by default, so only another stored
  // language counts as a real choice.
  const LANGUAGE_CHOICE_KEY = "nurLanguageChoice";
  function chosenLanguage() {
    let stored = "";
    let choice = "";
    try {
      stored = localStorage.getItem("nurLanguage") || "";
      choice = localStorage.getItem(LANGUAGE_CHOICE_KEY) || "";
    } catch { return ""; }
    const picked = SUPPORTED_LANGUAGES.includes(stored) && Boolean(UI[stored])
      && (choice === "chosen" || (!choice && stored !== "ru"));
    try { localStorage.setItem(LANGUAGE_CHOICE_KEY, picked ? "chosen" : "auto"); } catch { /* storage can be unavailable */ }
    return picked ? stored : "";
  }
  function rememberLanguageChoice() {
    try { localStorage.setItem(LANGUAGE_CHOICE_KEY, "chosen"); } catch { /* storage can be unavailable */ }
  }
  const DATE_LOCALES = Object.freeze({ ru: "ru-RU", en: "en-GB", fr: "fr-FR", de: "de-DE", es: "es-ES", it: "it-IT", pl: "pl-PL", uk: "uk-UA", pt: "pt-PT", nl: "nl-NL", tr: "tr-TR", ro: "ro-RO", cs: "cs-CZ", sv: "sv-SE", el: "el-GR", da: "da-DK", no: "nb-NO", fi: "fi-FI", ja: "ja-JP", ko: "ko-KR", zh: "zh-TW", th: "th-TH", ar: "ar-u-nu-latn", ind: "id-ID", vi: "vi-VN" });
  // Arabic dates keep the Western digits the rest of the app shows; the voice is Saudi Arabic.
  const SPEECH_LOCALES = Object.freeze({ ...DATE_LOCALES, en: "en-US", ar: "ar-SA" });
  // Chinese is Traditional (Taiwan, Hong Kong) and Arabic reads right to left.
  const HTML_LANGS = Object.freeze({ zh: "zh-Hant", ind: "id" });
  const RTL_LANGUAGES = new Set(["ar"]);
  const isRtl = () => RTL_LANGUAGES.has(lang);

  const SELECT_OPTIONS = {
    supportCategory: {
      ru:[["technical",UI.ru.supportCategoryTechnical],["account",UI.ru.supportCategoryAccount],["subscription",UI.ru.supportCategorySubscription],["content",UI.ru.supportCategoryContent],["feedback",UI.ru.supportCategoryFeedback],["other",UI.ru.supportCategoryOther]],
      en:[["technical",UI.en.supportCategoryTechnical],["account",UI.en.supportCategoryAccount],["subscription",UI.en.supportCategorySubscription],["content",UI.en.supportCategoryContent],["feedback",UI.en.supportCategoryFeedback],["other",UI.en.supportCategoryOther]],
      fr:[["technical",UI.fr.supportCategoryTechnical],["account",UI.fr.supportCategoryAccount],["subscription",UI.fr.supportCategorySubscription],["content",UI.fr.supportCategoryContent],["feedback",UI.fr.supportCategoryFeedback],["other",UI.fr.supportCategoryOther]]
    },
    vipNoticeReason: {
      ru:[["gift",UI.ru.notificationReasonGift],["compensation",UI.ru.notificationReasonCompensation],["promotion",UI.ru.notificationReasonPromotion],["other",UI.ru.notificationReasonOther]],
      en:[["gift",UI.en.notificationReasonGift],["compensation",UI.en.notificationReasonCompensation],["promotion",UI.en.notificationReasonPromotion],["other",UI.en.notificationReasonOther]],
      fr:[["gift",UI.fr.notificationReasonGift],["compensation",UI.fr.notificationReasonCompensation],["promotion",UI.fr.notificationReasonPromotion],["other",UI.fr.notificationReasonOther]]
    }
  };
  const capitalized = value => value[0].toUpperCase() + value.slice(1);
  SUPPORTED_LANGUAGES.filter(code => UI[code]).forEach(code => {
    SELECT_OPTIONS.supportCategory[code] ||= SELECT_OPTIONS.supportCategory.en.map(([value]) => [value, UI[code][`supportCategory${capitalized(value)}`]]);
    SELECT_OPTIONS.vipNoticeReason[code] ||= SELECT_OPTIONS.vipNoticeReason.en.map(([value]) => [value, UI[code][`notificationReason${capitalized(value)}`]]);
  });
  const CONTENT_REPORT_OPTIONS = Object.freeze({
    ru:[["adult","Содержание 18+"],["harassment","Оскорбление или давление"],["hate","Ненависть"],["threat","Угроза"],["fraud","Обман"],["privacy","Личные данные"],["spam","Спам"],["other","Другое"]],
    en:[["adult","Adult content"],["harassment","Harassment or pressure"],["hate","Hate"],["threat","Threat"],["fraud","Fraud"],["privacy","Personal information"],["spam","Spam"],["other","Other"]],
    fr:[["adult","Contenu pour adultes"],["harassment","Harcèlement ou pression"],["hate","Haine"],["threat","Menace"],["fraud","Fraude"],["privacy","Données personnelles"],["spam","Spam"],["other","Autre"]],
    de:[["adult","Inhalte für Erwachsene"],["harassment","Belästigung oder Druck"],["hate","Hass"],["threat","Drohung"],["fraud","Betrug"],["privacy","Persönliche Daten"],["spam","Spam"],["other","Sonstiges"]],
    es:[["adult","Contenido para adultos"],["harassment","Acoso o presión"],["hate","Odio"],["threat","Amenaza"],["fraud","Fraude"],["privacy","Datos personales"],["spam","Spam"],["other","Otro"]],
    it:[["adult","Contenuti per adulti"],["harassment","Molestie o pressioni"],["hate","Odio"],["threat","Minaccia"],["fraud","Frode"],["privacy","Dati personali"],["spam","Spam"],["other","Altro"]],
    pl:[["adult","Treści dla dorosłych"],["harassment","Nękanie lub presja"],["hate","Nienawiść"],["threat","Groźba"],["fraud","Oszustwo"],["privacy","Dane osobowe"],["spam","Spam"],["other","Inne"]],
    uk:[["adult","Вміст 18+"],["harassment","Образа або тиск"],["hate","Ненависть"],["threat","Погроза"],["fraud","Шахрайство"],["privacy","Особисті дані"],["spam","Спам"],["other","Інше"]],
    pt:[["adult","Conteúdo para adultos"],["harassment","Assédio ou pressão"],["hate","Ódio"],["threat","Ameaça"],["fraud","Fraude"],["privacy","Dados pessoais"],["spam","Spam"],["other","Outro"]],
    nl:[["adult","Inhoud voor volwassenen"],["harassment","Intimidatie of druk"],["hate","Haat"],["threat","Bedreiging"],["fraud","Fraude"],["privacy","Persoonsgegevens"],["spam","Spam"],["other","Anders"]],
    tr:[["adult","Yetişkin içeriği"],["harassment","Taciz veya baskı"],["hate","Nefret"],["threat","Tehdit"],["fraud","Dolandırıcılık"],["privacy","Kişisel bilgiler"],["spam","Spam"],["other","Diğer"]],
    ro:[["adult","Conținut pentru adulți"],["harassment","Hărțuire sau presiune"],["hate","Ură"],["threat","Amenințare"],["fraud","Fraudă"],["privacy","Date personale"],["spam","Spam"],["other","Altele"]],
    cs:[["adult","Obsah pro dospělé"],["harassment","Obtěžování nebo nátlak"],["hate","Nenávist"],["threat","Výhrůžka"],["fraud","Podvod"],["privacy","Osobní údaje"],["spam","Spam"],["other","Jiné"]],
    sv:[["adult","Vuxeninnehåll"],["harassment","Trakasserier eller press"],["hate","Hat"],["threat","Hot"],["fraud","Bedrägeri"],["privacy","Personuppgifter"],["spam","Spam"],["other","Annat"]],
    el:[["adult","Περιεχόμενο για ενήλικες"],["harassment","Παρενόχληση ή πίεση"],["hate","Μίσος"],["threat","Απειλή"],["fraud","Απάτη"],["privacy","Προσωπικά δεδομένα"],["spam","Spam"],["other","Άλλο"]],
    da:[["adult","Voksenindhold"],["harassment","Chikane eller pres"],["hate","Had"],["threat","Trussel"],["fraud","Svindel"],["privacy","Personoplysninger"],["spam","Spam"],["other","Andet"]],
    no:[["adult","Innhold for voksne"],["harassment","Trakassering eller press"],["hate","Hat"],["threat","Trussel"],["fraud","Svindel"],["privacy","Personopplysninger"],["spam","Spam"],["other","Annet"]],
    fi:[["adult","Aikuissisältö"],["harassment","Häirintä tai painostus"],["hate","Viha"],["threat","Uhkaus"],["fraud","Huijaus"],["privacy","Henkilötiedot"],["spam","Roskaposti"],["other","Muu"]],
    ja:[["adult","成人向けの内容"],["harassment","嫌がらせや圧力"],["hate","憎悪"],["threat","脅迫"],["fraud","詐欺"],["privacy","個人情報"],["spam","スパム"],["other","その他"]],
    ko:[["adult","성인용 콘텐츠"],["harassment","괴롭힘 또는 압박"],["hate","혐오"],["threat","협박"],["fraud","사기"],["privacy","개인정보"],["spam","스팸"],["other","기타"]],
    zh:[["adult","成人內容"],["harassment","騷擾或施壓"],["hate","仇恨"],["threat","威脅"],["fraud","詐騙"],["privacy","個人資料"],["spam","垃圾訊息"],["other","其他"]],
    th:[["adult","เนื้อหาสำหรับผู้ใหญ่"],["harassment","การคุกคามหรือกดดัน"],["hate","ความเกลียดชัง"],["threat","การข่มขู่"],["fraud","การหลอกลวง"],["privacy","ข้อมูลส่วนตัว"],["spam","สแปม"],["other","อื่น ๆ"]],
    ar:[["adult","محتوى للبالغين"],["harassment","تحرش أو ضغط"],["hate","كراهية"],["threat","تهديد"],["fraud","احتيال"],["privacy","بيانات شخصية"],["spam","رسائل مزعجة"],["other","أخرى"]],
    ind:[["adult","Konten dewasa"],["harassment","Pelecehan atau tekanan"],["hate","Kebencian"],["threat","Ancaman"],["fraud","Penipuan"],["privacy","Data pribadi"],["spam","Spam"],["other","Lainnya"]],
    vi:[["adult","Nội dung người lớn"],["harassment","Quấy rối hoặc gây áp lực"],["hate","Thù ghét"],["threat","Đe dọa"],["fraud","Lừa đảo"],["privacy","Dữ liệu cá nhân"],["spam","Spam"],["other","Khác"]]
  });

  const forbiddenStems = [
    "секс", "эрот", "порн", "поцелу", "интим", "обнаж", "генитал", "оргазм", "возбужд", "мастурб", "проститу",
    "sex", "erotic", "porn", "kiss", "intimacy", "nude", "naked", "genital", "orgasm", "arous", "masturb", "prostitut",
    "sexe", "eroti", "porn", "baiser", "embrasser", "intimite", "nudite", "genital", "orgasme", "excite", "masturb", "prostitu",
    "алкогол", "водк", "коньяк", "наркот", "кокаин", "героин", "казино", "букмек", "шантаж", "угрож", "убить", "избить",
    "alcohol", "vodka", "drug", "cocaine", "heroin", "casino", "gambling", "blackmail", "threat", "kill",
    "alcool", "vodka", "drogue", "cocaine", "heroine", "casino", "parier", "chantage", "menace", "tuer",
    "бляд", "блят", "хуй", "хуе", "хуя", "хуи", "пизд", "ебан", "fuck", "shit", "bitch", "cunt", "putain", "merde", "connard", "salope",
    // German, Spanish, Italian and Polish. Words that are harmless in another
    // supported language stay out: Polish "droga" means "dear", Spanish "nudo" is a knot.
    "sexuell", "sexo", "sesso", "sessual", "seks", "eroty", "nackt", "desnud", "orgazm", "prostytut", "hure", "nutte",
    "alkohol", "alcol", "wodka", "rauschgift", "narkot", "kokain", "cocain", "kasino", "kasyno", "glucksspiel", "azzard",
    "erpress", "chantaj", "ricatt", "szantaz", "drohung", "drohen", "droht", "amenaz", "minacc", "grozb", "umbring", "ermord", "matar", "uccid", "zabij", "zabic",
    "fick", "scheiß", "scheiss", "arschloch", "wichs", "schlampe", "puta", "mierda", "cabron", "gilipoll", "joder",
    "cazzo", "stronz", "vaffancul", "coglion", "kurw", "skurw", "chuj", "pierdol", "jeba", "pizd",
    // Украинский, португальский, нидерландский, турецкий, румынский, чешский,
    // шведский, датский, норвежский, финский, индонезийский, греческий, арабский.
    // Основы совпадают с безобидными словами других языков — не берутся
    // (румынское «fut» начинает «futur», датское «nøgen» → «nogen» = «кто-то»).
    "ерот", "поцілун", "інтим", "оголен", "геніталь", "збудж", "горілк", "погроз", "вбити", "вбий", "їба",
    "beij", "foda", "caralho", "porra",
    "erotis", "naakt", "zoen", "intiem", "opgewond", "neuk", "klootzak", "godverd",
    "erotik", "cinsel", "ciplak", "mahrem", "tahrik", "fahise", "fuhus", "alkol", "votka", "uyusturucu", "eroin", "santaj", "tehdit", "oldur", "orospu", "amk", "yarrak", "sikey", "sikt",
    "sarut", "vodca", "cazino", "amenint", "omor", "ucide", "muie", "curv",
    "polib", "nahot", "vzrus", "vydir", "vyhroz", "zabit", "hovno", "mrdat", "zmrd",
    "porr", "kyss", "naken", "upphets", "onan", "utpress", "knull", "fitta", "javla",
    "kysse", "ophids", "opphiss", "afpres", "trussel", "trusl", "kneppe", "fisse", "fitte", "luder", "faen", "drep", "narko",
    "seksi", "eroott", "suudel", "intiim", "alast", "sukupuoliel", "kiihott", "huume", "kokaii", "heroii", "kiristy", "uhkail", "tappa", "vittu", "perkele", "saatana", "huora", "paska",
    "cium", "telanjang", "bugil", "kelamin", "birahi", "pelacur", "narkoba", "judi", "pemeras", "ancam", "bunuh", "kontol", "memek", "ngentot", "bangsat", "jancuk", "perkosa",
    "σεξ", "ερωτικ", "πορν", "οργασμ", "γεννητικ", "αυναν", "αλκοολ", "βοτκα", "ναρκωτ", "κοκαιν", "ηρωιν", "καζινο", "εκβιασ", "απειλ", "σκοτωσ", "πουτ", "μουνι", "καυλ",
    "سكس", "اباح", "إباح", "الاباح", "بورن", "تناسل", "نشوة", "استمن", "عاهر", "دعار", "كحول", "الكحول", "خمر", "فودكا", "مخدر", "المخدر", "كوكايين", "هيروين", "كازينو", "قمار", "ابتز", "تهديد", "هدد", "اقتل", "قتل", "شرموط", "عرص", "نيك", "اغتصاب"
  ];
  // Японский, китайский и тайский пишутся без пробелов, поэтому проверяются
  // как подстроки; вьетнамские слова состоят из слогов и проверяются как
  // последовательности токенов (диакритика уже снята).
  const forbiddenPhrases = [
    "セックス", "エロ", "ポルノ", "キス", "性的", "性交", "性器", "オーガズム", "自慰", "売春", "風俗", "アルコール", "麻薬", "コカイン", "ヘロイン", "カジノ", "賭博", "脅迫", "殺す", "殺し", "死ね", "レイプ", "セフレ",
    "性愛", "性爱", "做愛", "做爱", "色情", "情色", "接吻", "親吻", "亲吻", "裸體", "裸体", "生殖器", "高潮", "自慰", "手淫", "賣淫", "卖淫", "妓女", "酒精", "毒品", "可卡因", "古柯鹼", "海洛因", "賭場", "赌场", "賭博", "赌博", "勒索", "威脅", "威胁", "殺死", "杀死", "殺了", "杀了", "他媽", "他妈", "操你", "幹你", "干你", "傻逼", "強姦", "强奸",
    "เซ็กส์", "อีโรติก", "โป๊", "จูบ", "เปลือย", "อวัยวะเพศ", "จุดสุดยอด", "สำเร็จความใคร่", "ช่วยตัวเอง", "โสเภณี", "ขายตัว", "แอลกอฮอล์", "เหล้า", "ยาเสพติด", "โคเคน", "เฮโรอีน", "คาสิโน", "การพนัน", "แบล็กเมล", "ฆ่า", "เย็ด", "ควย", "สัส", "เหี้ย", "ข่มขืน"
  ];
  const forbiddenTokenPhrases = [
    "tinh duc", "khieu dam", "khoa than", "bo phan sinh duc", "cuc khoai", "thu dam", "mai dam", "gai điem", "ma tuy", "cocain", "song bac", "co bac", "tong tien", "đe doa", "giet", "đit me", "đu ma", "cai lon", "con cac", "hiep dam", "ruou"
  ];

  const relationshipWords = {
    mother: ["мама", "маме", "маму", "мамой", "мать", "матери", "mother", "mum", "mom", "maman", "mere"],
    father: ["папа", "папе", "папу", "папой", "отец", "отцу", "father", "dad", "papa", "pere"],
    spouse: ["жена", "жене", "жену", "супруга", "супруге", "супругу", "муж", "мужу", "супруг", "wife", "husband", "spouse", "epouse", "epoux", "mari", "femme"],
    child: ["дочь", "дочери", "дочке", "дочка", "сын", "сыну", "ребенок", "ребенку", "daughter", "son", "child", "fille", "fils", "enfant"],
    sibling: ["сестра", "сестре", "брат", "брату", "sister", "brother", "soeur", "frere"],
    grandparent: ["бабушка", "бабушке", "дедушка", "дедушке", "grandmother", "grandfather", "grandma", "grandpa", "grand-mere", "grand-pere", "mamie", "papi"],
    teacher: ["учитель", "учителю", "учителем", "учительница", "учительнице", "наставник", "наставнику", "teacher", "mentor", "professeur"],
    friend: ["друг", "другу", "подруга", "подруге", "friend", "ami", "amie"]
  };

  const composer = {
    ru: {
      universal: [
        "{to}, мне хотелось сказать тебе несколько простых и искренних слов. Я ценю твоё доброе сердце, спокойствие и то тепло, которое ты приносишь в обычные дни. Не всё важное получается произнести вовремя, поэтому пусть это письмо напомнит: ты по-настоящему важный для меня человек. Желаю тебе лёгкости в мыслях, уверенности в решениях и людей рядом, с которыми можно оставаться собой. Пусть впереди будет больше тихих радостей и поводов улыбаться. Спасибо, что ты есть в моей жизни.",
        "{to}, среди повседневных дел легко забыть сказать о главном. Мне важно напомнить: я замечаю твою доброту, уважаю твой характер и ценю каждую спокойную минуту нашего общения. Пусть даже в сложные дни у тебя остаётся внутренний свет и уверенность, что рядом есть человек, которому небезразлично твоё состояние. Береги силы, не требуй от себя невозможного и чаще находи время для отдыха. Я от всего сердца желаю тебе мира, здоровья и добрых новостей.",
        "{to}, это письмо пришло без особого повода — просто некоторые слова не стоит откладывать. Твоё присутствие делает многие моменты теплее, а искренний разговор с тобой надолго оставляет спокойствие. Спасибо за внимание, терпение и добрые поступки, которые могут казаться маленькими, но имеют большую ценность. Пусть твои планы складываются благополучно, дом остаётся уютным, а сердце не устаёт надеяться на хорошее. Ты важный человек, и мне хотелось напомнить тебе об этом сегодня."
      ],
      mother: [
        "{to}, хочу от всего сердца поблагодарить тебя за заботу, глубину которой не всегда удавалось понять сразу. В твоих словах всегда было много терпения, а в поступках — тихая любовь, не требующая благодарности. Пусть теперь у тебя будет больше времени для отдыха, спокойных мыслей и людей, которые будут беречь тебя так же внимательно. Я помню твоё добро и хочу чаще отвечать на него не только словами, но и поступками. Ты очень дорога мне.",
        "{to}, сколько бы дорог ни появилось в жизни, твой голос остаётся напоминанием о доме и спокойствии. Спасибо за терпение, советы и ежедневные мелочи, за которыми всегда стояла большая забота. Мне хочется, чтобы ты реже тревожилась и чаще чувствовала, как сильно тебя ценят. Пусть твои дни будут светлыми, здоровье — крепким, а рядом всегда будут близкие люди. Я дорожу тобой и от всего сердца ценю всё, чему ты меня научила."
      ],
      father: [
        "{to}, с возрастом я всё яснее понимаю ценность твоих советов и спокойной надёжности. Ты показывал пример не громкими словами, а ответственностью, терпением и поступками. Спасибо за опору, которую я чувствую даже на расстоянии. Пусть у тебя будет крепкое здоровье, больше отдыха и уверенность, что твои старания замечены и глубоко ценятся. Я хочу чаще говорить тебе об этом и подтверждать благодарность делами. Ты очень дорог мне.",
        "{to}, не все важные чувства легко произнести вслух, но я хочу сказать главное: я ценю твою силу, честность и заботу о семье. Многие вещи, которым ты меня научил, помогают мне принимать решения и не сдаваться перед трудностями. Пусть впереди у тебя будет больше спокойных дней, добрых встреч и поводов гордиться тем, что ты создал. Спасибо, что рядом с тобой слово «надёжность» всегда имело настоящий смысл."
      ],
      spouse: [
        "{to}, мне особенно дороги не только важные события, но и наши самые обычные дни. В них есть разговоры, взаимная забота и спокойное чувство, что мы идём по жизни вместе. Я ценю твой характер, терпение и добро в мелочах. Мне хочется беречь уважение между нами, чаще слышать тебя и строить дом, в котором сердцу спокойно. Пусть впереди будет много совместных планов, ясных решений и моментов, за которые мы сможем благодарить друг друга.",
        "{to}, это письмо без особого повода — просто напоминание, что ты важная часть моей жизни. Спасибо, что умеешь выслушать, поддержать и сделать обычный вечер уютнее. Даже когда мы смотрим на вещи по-разному, ты остаёшься важнее любого спора. Я хочу беречь то хорошее, что есть между нами, проявлять больше терпения и подтверждать свои слова заботливыми поступками. Пусть рядом друг с другом нам всегда будет спокойно и надёжно."
      ],
      child: [
        "{to}, я горжусь тобой не за безупречность и не только за победы. Для меня важнее твоя честность, доброе сердце и то, как ты учишься после ошибок. Помни: со сложным вопросом можно прийти ко мне, и мы вместе постараемся найти решение. Не бойся расти маленькими шагами, спрашивать и пробовать снова. Моя поддержка не зависит от оценок или достижений. Желаю тебе сохранить любопытство, смелость быть собой и уважение к другим людям.",
        "{to}, в тебе есть свой свет, талант и особенный взгляд на мир. Мне хочется, чтобы у тебя была уверенность в своих силах и возможность спокойно просить о помощи, когда она нужна. Ошибки не делают тебя хуже — они помогают учиться и становиться мудрее. Твои успехи всегда радуют меня, но ещё сильнее я ценю твою доброту и честность. Пусть рядом встречаются люди, которые уважают тебя, а каждый новый день даёт повод узнать что-то хорошее."
      ],
      sibling: [
        "{to}, у нас столько общих историй, что из них могла бы получиться целая книга. Но её главная мысль проста: очень ценно иметь родного человека, которому не нужно долго объяснять себя. Спасибо за честные слова, поддержку и смех, который делал обычные дни легче. Мы можем быть разными и иногда спорить, но для меня наша связь важнее случайных обид. Я хочу беречь её и всегда оставаться человеком, к которому ты можешь обратиться.",
        "{to}, наши воспоминания до сих пор согревают меня, потому что рядом в них всегда есть человек, который помнит всё вместе со мной. Спасибо за моменты, когда можно было быть собой без лишних объяснений. Если тебе станет трудно, не думай, что нужно справляться в одиночку: я всегда найду время, чтобы выслушать и поддержать. Пусть жизнь ведёт тебя к добрым людям, честным решениям и спокойствию, а наша связь остаётся тёплой независимо от расстояния."
      ],
      grandparent: [
        "{to}, в твоей заботе всегда было особенное тепло, которое я узнаю среди множества воспоминаний. Спасибо за терпение, мудрые истории и уют, который появлялся рядом с тобой. Твои слова научили меня замечать главное и относиться к людям добрее. Пусть твои дни будут неспешными, светлыми и наполненными вниманием близких. Пусть будет больше времени для отдыха и ощущения, что тебя по-настоящему ценят. Я бережно храню всё добро, которым ты делился со мной.",
        "{to}, расстояние не уменьшает ценность человека, чьи советы сопровождают нас долгие годы. Я часто вспоминаю простые минуты рядом, семейные истории и то спокойствие, которое всегда исходило от тебя. Спасибо за корни, память и чувство дома. Желаю тебе здоровья, лёгких мыслей и заботливых людей рядом. Пусть каждый день приносит хотя бы одну добрую новость, а моё письмо напомнит, как много ты значишь для меня."
      ],
      teacher: ["{to}, спасибо за знания, терпение и умение поддержать тогда, когда что-то не получалось сразу. Настоящий наставник даёт не только ответы, но и уверенность искать их самостоятельно. Я ценю уважение, с которым ты относишься к людям, и уроки, которые остаются полезными далеко за пределами учебных занятий. Пусть твой труд приносит радость, ученики отвечают благодарностью, а каждый новый день подтверждает, что вложенные усилия имеют смысл."],
      friend: ["{to}, спасибо за дружбу, в которой можно быть собой, говорить честно и не бояться непонимания. Я ценю наши разговоры, поддержку и простые моменты, после которых становится легче. Пусть в твоей жизни будет больше спокойных дней, верных людей и дел, приносящих пользу и радость. Если однажды станет трудно, помни: рядом есть человек, готовый выслушать без лишних оценок. Береги себя и не забывай, насколько ценно твоё доброе сердце."]
    },
    en: {
      universal: [
        "{to}, I wanted to share a few simple and sincere words with you. I value your kind heart, your calmness, and the warmth you bring to ordinary days. Important things are not always said at the right moment, so let this letter remind you that you truly matter to me. I wish you clarity in your thoughts, confidence in your decisions, and people around you with whom you can be yourself. May there be more quiet joys and reasons to smile ahead. Thank you for being part of my life.",
        "{to}, everyday life can make us forget to say what matters most. I want you to know that I notice your kindness, respect your character, and treasure every calm moment we share. Even on difficult days, may you keep your inner light and remember that someone genuinely cares about how you feel. Protect your strength, do not demand the impossible from yourself, and make room for rest. I sincerely wish you peace, good health, and kind news.",
        "{to}, this letter comes without a special occasion, because some words should not be postponed. Your presence makes many moments warmer, and an honest conversation with you leaves a lasting sense of calm. I am grateful for your attention, patience, and quiet acts of kindness. May your plans unfold well, your home remain peaceful, and your heart keep hoping for good things. You are important, and I wanted to remind you of that today."
      ],
      mother: ["{to}, I want to thank you from my heart for the care that followed me even when I did not know how to notice it. Your words held more patience than I understood, and your actions carried a quiet love that never asked for recognition. May you now have more time to rest, calmer thoughts, and people who care for you as attentively as you have cared for others. I remember your goodness and want to answer it not only with words, but with thoughtful actions. You mean so much to me."],
      father: ["{to}, as I grow, I understand the value of your advice and steady reliability more clearly. You taught by responsibility, patience, and action rather than loud words. Thank you for the support I can feel even from far away. May you have strong health, more time to rest, and the certainty that your efforts are seen and deeply appreciated. I want to say this more often and show my gratitude through what I do. You mean so much to me."],
      spouse: ["{to}, I treasure not only the important milestones but also our most ordinary days. They hold our conversations, mutual care, and the calm sense that we are walking through life together. I value your character, patience, and kindness in small things. I want to protect the respect between us, listen more closely, and build a home where the heart feels safe. May we have many shared plans, clear decisions, and moments that make us grateful for one another."],
      child: ["{to}, I am proud of you not for being perfect and not only for your victories. Your honesty, kind heart, and willingness to learn from mistakes matter even more to me. You can bring any difficult question to me, and we will look for an answer together. Do not be afraid to grow in small steps, ask questions, and try again. My support does not depend on grades or achievements. May you keep your curiosity, the courage to be yourself, and respect for others."],
      sibling: ["{to}, we share enough stories to fill a whole book, but its most important message is simple: having a family member who understands without long explanations is a gift. Thank you for honest words, support, and laughter that made ordinary days lighter. We may be different and sometimes disagree, but our bond matters more to me than passing frustrations. I want to protect it and remain someone you can always turn to."],
      grandparent: ["{to}, your care has always carried a special warmth that I recognise among countless memories. Thank you for your patience, wise stories, and the sense of home that appeared around you. Your words taught me to notice what matters and to treat people with greater kindness. May your days be gentle, bright, and filled with attention from those close to you. I hope you rest more and feel how deeply you are appreciated. I carefully keep all the goodness you shared with me."],
      teacher: ["{to}, thank you for your knowledge, patience, and ability to encourage people when something does not work at once. A true mentor gives more than answers; they give confidence to keep searching. I value the respect you show to others and the lessons that remain useful far beyond the classroom. May your work bring joy, your students answer with gratitude, and each new day confirm that your efforts truly matter."],
      friend: ["{to}, thank you for a friendship in which I can be myself, speak honestly, and not fear being misunderstood. I value our conversations, your support, and the simple moments that leave life feeling lighter. May your days hold more peace, trustworthy people, and meaningful work that brings joy. If life becomes difficult, remember that someone is ready to listen without judgement. Take care of yourself and never forget the value of your kind heart."]
    },
    fr: {
      universal: [
        "{to}, je voulais partager avec toi quelques mots simples et sincères. J’apprécie ton cœur généreux, ton calme et la chaleur que tu apportes aux jours ordinaires. On ne dit pas toujours l’essentiel au bon moment ; que cette lettre te rappelle donc que tu comptes vraiment pour moi. Je te souhaite des pensées légères, de la confiance dans tes décisions et des personnes auprès desquelles tu peux rester toi-même. Que les jours à venir t’offrent des joies paisibles et de nombreuses raisons de sourire. Merci d’être dans ma vie.",
        "{to}, le quotidien nous fait parfois oublier de dire l’essentiel. Je veux que tu saches que je remarque ta bonté, que je respecte ton caractère et que je chéris chaque moment calme partagé avec toi. Même pendant les jours difficiles, garde ta lumière intérieure et souviens-toi qu’une personne se soucie sincèrement de ton bien-être. Préserve tes forces, n’exige pas l’impossible de toi-même et accorde-toi du repos. Je te souhaite de tout cœur la paix, la santé et de bonnes nouvelles.",
        "{to}, cette lettre arrive sans occasion particulière, car certains mots ne devraient pas attendre. Ta présence rend de nombreux instants plus chaleureux, et une conversation sincère avec toi laisse un calme durable. Merci pour ton attention, ta patience et tes gestes de bonté discrets. Que tes projets se réalisent au mieux, que ton foyer reste paisible et que ton cœur continue d’espérer de belles choses. Tu comptes beaucoup, et je voulais te le rappeler aujourd’hui."
      ],
      mother: ["{to}, je veux te remercier de tout cœur pour tous les soins reçus, même lorsque je ne savais pas encore les remarquer. Tes paroles contenaient plus de patience que je ne le comprenais et tes gestes portaient une affection discrète qui ne demandait rien en retour. Puisses-tu maintenant avoir davantage de temps pour te reposer, des pensées plus légères et des proches qui prennent soin de toi avec la même attention. Je n’oublie pas ta bonté et je veux y répondre par des actes autant que par des mots. Tu comptes énormément pour moi."],
      father: ["{to}, avec le temps, je comprends de mieux en mieux la valeur de tes conseils et de ta présence fiable. Tu m’as montré l’exemple par la responsabilité, la patience et les actes plutôt que par de grands discours. Merci pour ce soutien que je ressens même à distance. Je te souhaite une bonne santé, davantage de repos et la certitude que tous tes efforts sont vus et profondément appréciés. Je veux te le dire plus souvent et montrer ma gratitude dans mes actions. Tu comptes énormément pour moi."],
      spouse: ["{to}, je chéris autant les grands moments que nos journées les plus ordinaires. Elles contiennent nos conversations, notre attention mutuelle et le sentiment paisible d’avancer ensemble dans la vie. J’apprécie ton caractère, ta patience et ta bonté dans les petites choses. Je veux préserver le respect entre nous, mieux t’écouter et construire un foyer où le cœur se sent en sécurité. Que l’avenir nous offre de nombreux projets communs, des décisions sereines et des moments de gratitude partagée."],
      child: ["{to}, tes réussites me réjouissent, mais ton honnêteté, ton bon cœur et ta capacité à apprendre de tes erreurs comptent encore davantage. Tu peux venir me voir avec n’importe quelle question difficile, et nous chercherons une solution ensemble. N’aie pas peur d’avancer par petits pas, de poser des questions et de recommencer. Mon soutien ne dépend ni des notes ni des victoires. Garde ta curiosité, le courage d’être toi-même et le respect des autres."],
      sibling: ["{to}, nous partageons assez d’histoires pour remplir un livre entier, mais son message principal est simple : avoir un proche qui nous comprend sans longues explications est précieux. Merci pour tes paroles honnêtes, ton soutien et les rires qui ont rendu les jours ordinaires plus légers. Nous pouvons être différents et parfois en désaccord, mais notre lien compte davantage que les contrariétés passagères. Je veux le préserver et rester une personne vers qui tu peux toujours te tourner."],
      grandparent: ["{to}, ton attention a toujours eu une chaleur particulière que je reconnais parmi mille souvenirs. Merci pour ta patience, tes histoires pleines de sagesse et ce sentiment de foyer qui naissait autour de toi. Tes paroles m’ont appris à voir l’essentiel et à traiter les autres avec plus de bonté. Que tes journées soient douces, lumineuses et entourées de l’attention de tes proches. J’aimerais que tu te reposes davantage et que tu ressentes toute l’estime de ta famille. Je garde précieusement tout le bien que tu m’as transmis."],
      teacher: ["{to}, merci pour tes connaissances, ta patience et ta façon d’encourager lorsque tout ne réussit pas immédiatement. Un véritable guide ne donne pas seulement des réponses : il donne la confiance nécessaire pour continuer à chercher. J’apprécie le respect que tu témoignes aux autres et les leçons qui restent utiles bien au-delà des cours. Que ton travail t’apporte de la joie, que tes élèves répondent avec gratitude et que chaque journée confirme la valeur de tes efforts."],
      friend: ["{to}, merci pour cette amitié qui permet de rester soi-même, de parler avec sincérité et de trouver de la compréhension. J’apprécie nos conversations, ton soutien et ces moments simples après lesquels la vie paraît plus légère. Je te souhaite des journées paisibles, des personnes loyales et des activités utiles qui apportent de la joie. Si la vie devient difficile, souviens-toi que quelqu’un peut t’écouter sans jugement. Prends soin de toi et n’oublie jamais la valeur de ton bon cœur."]
    }
  };

  const styledComposer = {
    ru: {
      loving:[
        "{to}, мне хочется сказать о твоей ценности спокойно и искренне. Твоя доброта, внимание и умение поддержать делают обычные дни светлее. Я дорожу нашим общением и тем доверием, которое рождается из уважения и честности. Пусть у тебя будет больше душевного покоя, добрых новостей и людей, рядом с которыми не нужно притворяться. Береги себя и помни: твоё присутствие имеет для меня большое значение, а всё хорошее, что ты делаешь, не остаётся незамеченным.",
        "{to}, некоторые люди становятся особенно дорогими благодаря не громким словам, а спокойной заботе и доброму характеру. Именно это я ценю в тебе. Мне важно, чтобы рядом с тобой была поддержка, оставалось время для отдыха и не возникало сомнений в собственной значимости. Пусть впереди будет больше ясных дней, полезных дел и тёплых разговоров. Я ценю твоё место в моей жизни и хочу беречь наше общение вниманием, терпением и честными поступками."
      ],
      romantic:[
        "{to}, мне дороги наши обычные дни, потому что именно в них живут взаимное уважение, забота и чувство общего дома. Я ценю твоё терпение, характер и спокойствие, которое появляется рядом с тобой. Мне хочется лучше слышать тебя, беречь доверие между нами и подтверждать добрые слова поступками. Пусть наш союз становится крепче благодаря честным разговорам, благодарности и умению поддерживать друг друга. Ты мой близкий человек, с которым мне хочется идти по жизни достойно и бережно.",
        "{to}, счастье для меня часто скрывается в простых вещах: в спокойном разговоре, совместных планах и уверенности, что мы стараемся беречь друг друга. Я ценю твою заботу и тепло нашего дома. Даже когда мнения различаются, мне важно выбирать уважение, терпение и добрый путь к согласию. Пусть между нами остаются доверие, ясность и желание становиться лучше друг для друга. Я ценю наш союз и всё хорошее, что мы строим вместе."
      ],
      support:[
        "{to}, если сейчас непросто, пожалуйста, не требуй от себя мгновенных решений и безупречной силы. Иногда самый разумный шаг — остановиться, спокойно подумать и позволить себе принять помощь. Твоя ценность не зависит от одного трудного дня или ошибки. Я могу выслушать без лишних оценок и быть рядом настолько, насколько тебе это будет удобно. Пусть постепенно появятся ясность, силы и уверенность, что сложный период обязательно можно пройти небольшими, но верными шагами.",
        "{to}, мне важно напомнить: тебе не обязательно справляться со всем в одиночку. Можно устать, взять паузу и попросить поддержки — это не делает человека слабее. Я верю в твою способность принимать спокойные решения и двигаться вперёд без спешки. Если захочешь поговорить, я постараюсь услышать тебя внимательно. Пусть рядом окажутся надёжные люди, а каждый следующий день приносит немного больше облегчения, порядка в мыслях и надежды."
      ],
      gratitude:[
        "{to}, спасибо за добро, которое ты проявляешь в словах, поступках и самых обычных мелочах. Возможно, не всё удавалось заметить или сказать вовремя, но твоё внимание действительно имеет для меня большое значение. Я ценю твоё терпение, честность и готовность поддержать без лишнего шума. Пусть благодарность возвращается к тебе заботой близких, спокойными днями и уважением окружающих. Мне хочется не только говорить спасибо, но и отвечать добрыми и достойными поступками.",
        "{to}, сегодня мне особенно хочется поблагодарить тебя. За время, которое ты находишь, за добрые советы и за спокойствие, которое остаётся после наших разговоров. Такие вещи могут казаться небольшими, но именно они делают отношения по-настоящему ценными. Я помню твою заботу и отношусь к ней с большим уважением. Желаю тебе здоровья, лёгкости в делах и людей рядом, которые будут так же внимательно замечать всё хорошее, что есть в тебе."
      ]
    },
    en: {
      loving:[
        "{to}, I want to tell you how much your quiet kindness and thoughtful attention mean to me. You bring warmth to ordinary days without needing grand words. I value the trust between us, our honest conversations, and the respect that makes every connection stronger. May you have more peaceful thoughts, good news, and people around you who appreciate your true character. Please take care of yourself and remember that your presence matters deeply to me. The good you bring into the lives of others never goes unnoticed.",
        "{to}, some people become especially dear through steady care, a generous heart, and the way they treat others with respect. Those are the qualities I value in you. I hope you feel supported, find enough time to rest, and never doubt your importance. May the days ahead bring useful work, calm conversations, and sincere people. I am grateful for your place in my life and want to protect our connection through patience, attention, and honest actions."
      ],
      romantic:[
        "{to}, I treasure our ordinary days because they hold mutual respect, care, and the peaceful feeling of building a home together. I value your patience, your character, and the calm that grows when we truly listen to one another. I want to protect the trust between us and let thoughtful actions support every kind word. May our marriage grow stronger through honest conversations, gratitude, and steady companionship. You are the person with whom I want to walk through life with dignity, patience, and care.",
        "{to}, happiness often lives in simple things: a calm conversation, shared plans, and the certainty that we are trying to care for one another. I am grateful for your attention and for the warmth of our home. Even when we see things differently, I want to choose respect, patience, and a gentle path back to understanding. May trust and clarity remain between us, along with the wish to become better for each other. I deeply value our marriage and everything good we are building together."
      ],
      support:[
        "{to}, if life feels difficult right now, please do not demand an immediate answer or endless strength from yourself. Sometimes the wisest step is to pause, think calmly, and allow trusted people to help. Your worth is not measured by one hard day or one mistake. I am ready to listen without rushing to judge and to support you in a way that feels comfortable. May clarity and strength return little by little, and may each small step remind you that difficult seasons can be crossed.",
        "{to}, you do not have to carry everything alone. It is all right to feel tired, take a pause, and ask for support. I trust your ability to make thoughtful decisions without rushing yourself. If you want to talk, I will try to listen with patience and care. May reliable people stay near you, and may each new day bring a little more relief, order to your thoughts, and confidence in the path ahead."
      ],
      gratitude:[
        "{to}, thank you for the goodness you show through words, actions, and small everyday gestures. I may not always notice everything or say it at the right moment, but your care truly matters to me. I value your patience, honesty, and quiet willingness to help. May gratitude return to you through the care of those close to you, peaceful days, and genuine respect. I want not only to say thank you, but also to answer your kindness with thoughtful and worthy actions of my own.",
        "{to}, today I especially want to thank you for the time you make, the thoughtful advice you offer, and the calm that remains after our conversations. These things may look small, yet they are what make a relationship meaningful. I remember your care and hold it with real respect. I wish you good health, ease in your work, and people who notice and appreciate the many good qualities you bring into their lives."
      ]
    },
    fr: {
      loving:[
        "{to}, je veux te dire combien ta bonté discrète et ton attention comptent pour moi. Tu apportes de la chaleur aux jours ordinaires sans avoir besoin de grands discours. J’apprécie la confiance entre nous, nos échanges sincères et le respect qui rend chaque lien plus solide. Je te souhaite des pensées paisibles, de bonnes nouvelles et des personnes qui reconnaissent ton vrai caractère. Prends soin de toi et n’oublie pas que ta présence a une grande valeur pour moi. Le bien que tu offres aux autres ne passe jamais inaperçu.",
        "{to}, certaines personnes deviennent particulièrement chères par leur attention constante, leur cœur généreux et leur respect des autres. C’est ce que j’apprécie en toi. J’espère que tu trouveras le soutien nécessaire, du temps pour te reposer et la certitude de ton importance. Que les jours à venir t’apportent des activités utiles, des conversations sereines et des personnes sincères. J’apprécie sincèrement ta présence dans ma vie et je veux préserver notre lien avec patience, attention et honnêteté."
      ],
      romantic:[
        "{to}, je chéris nos journées ordinaires, car elles contiennent le respect mutuel, l’attention et la paix d’un foyer construit ensemble. J’apprécie ta patience, ton caractère et le calme qui naît lorsque nous nous écoutons vraiment. Je veux préserver la confiance entre nous et accompagner chaque parole bienveillante par des actes. Que notre mariage se fortifie grâce aux conversations sincères, à la gratitude et à une présence fidèle. Tu es la personne avec qui je veux avancer dans la vie avec dignité, patience et douceur.",
        "{to}, le bonheur se cache souvent dans des choses simples : une conversation sereine, des projets communs et la certitude que nous prenons soin l’un de l’autre. J’apprécie ton attention et la chaleur de notre foyer. Même lorsque nos avis diffèrent, je veux choisir le respect, la patience et un chemin paisible vers l’entente. Que la confiance et la clarté demeurent entre nous, avec le désir de progresser ensemble. J’apprécie profondément notre mariage et tout le bien que nous construisons ensemble."
      ],
      support:[
        "{to}, si la période est difficile, ne t’impose pas de trouver immédiatement toutes les réponses ni de faire preuve de force en permanence. Parfois, la décision la plus sage consiste à faire une pause, réfléchir calmement et accepter l’aide de personnes fiables. Ta valeur ne dépend ni d’une journée compliquée ni d’une erreur. Je peux t’écouter sans jugement précipité et apporter une aide adaptée à tes besoins. Que la clarté et les forces reviennent peu à peu, un petit pas après l’autre.",
        "{to}, il n’est pas nécessaire de tout porter sans aide. La fatigue, une pause ou une demande de soutien ne diminuent en rien ta valeur. J’ai confiance en ta capacité à prendre des décisions réfléchies sans précipitation. Si tu souhaites parler, je ferai de mon mieux pour écouter avec patience. Que des personnes fiables restent près de toi et que chaque nouveau jour apporte un peu plus de soulagement, d’ordre dans tes pensées et de confiance pour avancer."
      ],
      gratitude:[
        "{to}, merci pour le bien que tu manifestes dans tes paroles, tes actes et les petits gestes du quotidien. Je ne remarque peut-être pas toujours tout au bon moment, mais ton attention a une véritable importance pour moi. J’apprécie ta patience, ton honnêteté et ta disponibilité discrète. Que cette gratitude te revienne par l’attention de tes proches, des journées paisibles et un respect sincère. Je veux non seulement te remercier, mais aussi répondre à ta bonté par des actions réfléchies et dignes.",
        "{to}, aujourd’hui, je tiens particulièrement à te remercier pour le temps que tu offres, tes conseils attentifs et le calme qui demeure après nos conversations. Ces choses peuvent sembler modestes, mais elles donnent toute sa valeur à une relation. Je garde ton attention avec beaucoup de respect. Je te souhaite une bonne santé, de la facilité dans tes activités et des personnes capables de voir et d’apprécier toutes les belles qualités que tu apportes autour de toi."
      ]
    }
  };

  const LETTER_LENGTH_LIMITS = Object.freeze({
    short: Object.freeze({ maxWords: 58, maxCharacters: 430, maxSentences: 5 }),
    standard: Object.freeze({ maxWords: 105, maxCharacters: 760, maxSentences: 7 }),
    detailed: Object.freeze({ maxWords: 150, maxCharacters: 1080, maxSentences: 9 })
  });
  const READING_SWIPE = Object.freeze({
    minDistance: 56,
    maxDistance: 96,
    viewportRatio: 0.14,
    maxDuration: 1200,
    axisRatio: 1.35,
    intentDistance: 14
  });

  let lang = SUPPORTED_LANGUAGES.includes(params.get("lang")) ? params.get("lang") : (chosenLanguage() || deviceLanguage());
  if (!UI[lang]) lang = deviceLanguage();
  let letterPickerContext = null;
  let momentsIntegrationPromise = null;
  let momentsListenersBound = false;
  const storedNamesAtLaunch = {
    sender: cleanName(localStorage.getItem("nurFrom")),
    recipient: cleanName(localStorage.getItem("nurTo"))
  };
  const urlNamesAtLaunch = {
    sender: cleanName(params.get("from")),
    recipient: cleanName(params.get("to"))
  };
  const namesCameFromUrl = params.has("from")
    && params.has("to")
    && Boolean(urlNamesAtLaunch.sender && urlNamesAtLaunch.recipient)
    && !containsForbidden(urlNamesAtLaunch.sender)
    && !containsForbidden(urlNamesAtLaunch.recipient);
  let fromName = namesCameFromUrl ? urlNamesAtLaunch.sender : storedNamesAtLaunch.sender;
  let toName = namesCameFromUrl ? urlNamesAtLaunch.recipient : storedNamesAtLaunch.recipient;
  const initialNamesReady = Boolean(fromName && toName);
  let sharedMessage = initialNamesReady ? decodeSharedMessage(params.get("msg")) : "";
  let letterDeck = sharedMessage ? [{ id: "shared", category: "warm", shared: true, ru: sharedMessage, en: sharedMessage, fr: sharedMessage }, ...LETTERS] : [...LETTERS];
  const requestedQuote = Number.parseInt(params.get("quote") || "", 10);
  const startLetter = Number.isInteger(requestedQuote) && requestedQuote > 0
    ? requestedQuote
    : (Number.parseInt((initialNamesReady && localStorage.getItem("nurLetterIndex")) || "", 10) || 1);
  let currentIndex = sharedMessage ? 0 : Math.max(0, Math.min(startLetter - 1, Math.max(0, letterDeck.length - 1)));
  let storyOpened = false;
  let selectedCategory = "all";
  let selectedTrack = localStorage.getItem("nurTrack") === "3" ? 3 : -1;
  let currentAudioUrl = "";
  let customAudioBlob = null;
  let customAudioName = "";
  let customAudioFingerprint = "";
  let outgoingAudioShare = null;
  let incomingSharedAudioToken = readSharedAudioToken(location.href);
  let resolvedSharedAudio = null;
  let audioRecoveryAttempted = false;
  let backgroundUrl = "";
  let mobileBackgroundUrl = "";
  let customBackgroundBlob = null;
  let isMusicPlaying = false;
  let isNaturePlaying = false;
  let isPremium = false;
  let nativePremium = false;
  let purchaseAttemptPending = false;
  let cloudPremium = false;
  let entitlementState = window.NurBilling?.getEntitlement ? "checking" : "free";
  let purchaseConfigured = null;
  let premiumPrice = CONFIG.defaultPrice || "5,99 €/месяц";
  let yearlyPrice = CONFIG.defaultYearlyPrice || "24,99 €/год";
  let premiumPriceFromStore = false;
  let yearlyPriceFromStore = false;
  let readingFocus = false;
  let letterAnimationFrame = 0;
  let readingPointer = null;
  let letterSpeechActive = false;
  let letterSpeechSource = "";
  let letterSpeechText = "";
  let letterSpeechUtterance = null;
  let letterSpeechStartTimer = 0;
  let letterSpeechRequest = 0;
  let pendingPremiumFeature = "";
  let toastTimer = 0;
  let deferredInstallPrompt = null;
  let publicationResolver = null;
  let activeReportContext = null;
  let reportSubmitting = false;
  let weatherEnabled = !IS_ANDROID_PLAY_APP && localStorage.getItem("nurWeather") === "on";
  let weatherSnapshot = null;
  try {
    const storedWeather = JSON.parse(localStorage.getItem(WEATHER_STORAGE_KEY) || "null");
    if (storedWeather && Number.isFinite(Number(storedWeather.temperature)) && Number.isFinite(Number(storedWeather.code))) weatherSnapshot = storedWeather;
  } catch { localStorage.removeItem(WEATHER_STORAGE_KEY); }
  let uiTheme = UI_THEMES.has(localStorage.getItem("nurUiTheme")) ? localStorage.getItem("nurUiTheme") : "garnet";
  let currentQrUrl = "";
  let currentQrMode = "catalog";
  let currentQrCaption = "";
  let currentQrSource = "";
  let qrConsentKey = "";
  let composerContext = null;
  let gesturePreferencesRestored = false;
  let favorites;
  try { favorites = new Set(JSON.parse(localStorage.getItem("nurFavorites") || "[]")); }
  catch { favorites = new Set(); localStorage.removeItem("nurFavorites"); }
  const initialLinkNames = namesCameFromUrl
    ? { ...urlNamesAtLaunch }
    : null;
  let linkNamesActive = namesCameFromUrl;
  const CLOUD_EVER_AUTHENTICATED_KEY = "nurCloudEverAuthenticatedV1";
  const CLOUD_GUEST_SNAPSHOT_KEY = "nurCloudGuestSnapshotV1";
  const CLOUD_GUEST_OWNER_KEY = "nurCloudGuestBootstrapOwnerV1";
  const CLOUD_USER_SNAPSHOT_PREFIX = "nurCloudUserSnapshotV1:";
  const CLOUD_USER_ENVELOPE_PREFIX = "nurCloudEnvelopeV1:";
  let cloudClient = null;
  let cloudSession = null;
  let cloudUser = null;
  let cloudProvidersKnown = false;
  let cloudProviderLookupComplete = false;
  let cloudProviders = { google: false, apple: false, facebook: false };
  let cloudAuthBusy = false;
  let cloudStatusKey = "cloudChecking";
  let cloudReady = false;
  let cloudHydrating = false;
  let cloudLoadingUserId = "";
  let cloudLoadedUserId = "";
  let cloudLoadGeneration = 0;
  let cloudRevision = 0;
  let cloudRowExists = false;
  let cloudSyncTimer = 0;
  let cloudSyncing = false;
  let cloudSyncQueued = false;
  let cloudLastSignature = "";
  let cloudBootstrapState = null;
  let cloudBootstrapUserId = "";
  let cloudNamesExplicitlySaved = false;
  let cloudAccount = null;
  let cloudAccountTimer = 0;
  let cloudAccountRefreshTimer = 0;
  let cloudServerNow = 0;
  let cloudServerPerformance = 0;
  let adminAccountResult = null;
  let vipNotifications = [];
  let vipNotificationsLoadedUserId = "";
  let vipNotificationChannel = null;
  let vipNotificationChannelUserId = "";
  let vipNotificationLoadGeneration = 0;
  let vipNotificationRevision = 0;
  let activeVipNotificationId = "";
  let notificationLoading = false;
  const presentedVipNotificationIds = new Set();
  let accountAvatarUrl = "";
  let accountAvatarUserId = "";
  let fallbackShareUrl = "";
  let supportSubmitting = false;
  const AUTO_FULLSCREEN_KEY = "nurAutoFullscreenV17";
  let cloudNames = linkNamesActive ? { sender: "", recipient: "" } : { sender: fromName, recipient: toName };
  let cloudBuiltInTrack = 0;
  const handledAuthCodes = new Set();

  const audio = $("#nasheed");
  const homeScreen = $("#homeScreen");
  const letterStage = $("#letterStage");
  const layers = {
    setup: $("#setupLayer"), library: $("#libraryLayer"), settings: $("#settingsLayer"), qr: $("#qrLayer"), share: $("#shareAppLayer"), publication: $("#publicationLayer"), report: $("#reportLayer"), support: $("#supportLayer"), notifications: $("#notificationLayer"), paywall: $("#paywallLayer"), language: $("#languageLayer"), composer: $("#composerLayer"), qrSend: $("#qrSendLayer")
  };
  const panelTriggers = new WeakMap();
  const notificationInertedLayers = new Set();

  function t(key) { return UI[lang]?.[key] || UI.en[key] || UI.ru[key] || key; }

  // Euro prices the buyer pays with tax included; Google Play replaces them
  // with the local store price as soon as the catalog answers.
  const PRICE_WORDS = Object.freeze({
    ru: { monthly: "5,99 €/месяц", yearly: "24,99 €/год", month: "/месяц", year: "/год" },
    en: { monthly: "€5.99/month", yearly: "€24.99/year", month: "/month", year: "/year" },
    fr: { monthly: "5,99 €/mois", yearly: "24,99 €/an", month: "/mois", year: "/an" },
    de: { monthly: "5,99 €/Monat", yearly: "24,99 €/Jahr", month: "/Monat", year: "/Jahr" },
    es: { monthly: "5,99 €/mes", yearly: "24,99 €/año", month: "/mes", year: "/año" },
    it: { monthly: "5,99 €/mese", yearly: "24,99 €/anno", month: "/mese", year: "/anno" },
    pl: { monthly: "5,99 €/mies.", yearly: "24,99 €/rok", month: "/mies.", year: "/rok" },
    uk: { monthly: "5,99 €/місяць", yearly: "24,99 €/рік", month: "/місяць", year: "/рік" },
    pt: { monthly: "5,99 €/mês", yearly: "24,99 €/ano", month: "/mês", year: "/ano" },
    nl: { monthly: "€ 5,99/maand", yearly: "€ 24,99/jaar", month: "/maand", year: "/jaar" },
    tr: { monthly: "5,99 €/ay", yearly: "24,99 €/yıl", month: "/ay", year: "/yıl" },
    ro: { monthly: "5,99 €/lună", yearly: "24,99 €/an", month: "/lună", year: "/an" },
    cs: { monthly: "5,99 €/měsíc", yearly: "24,99 €/rok", month: "/měsíc", year: "/rok" },
    sv: { monthly: "5,99 €/månad", yearly: "24,99 €/år", month: "/månad", year: "/år" },
    el: { monthly: "5,99 €/μήνα", yearly: "24,99 €/έτος", month: "/μήνα", year: "/έτος" },
    da: { monthly: "5,99 €/md.", yearly: "24,99 €/år", month: "/md.", year: "/år" },
    no: { monthly: "5,99 €/mnd", yearly: "24,99 €/år", month: "/mnd", year: "/år" },
    fi: { monthly: "5,99 €/kk", yearly: "24,99 €/vuosi", month: "/kk", year: "/vuosi" },
    ja: { monthly: "5,99 €/月", yearly: "24,99 €/年", month: "/月", year: "/年" },
    ko: { monthly: "5,99 €/월", yearly: "24,99 €/년", month: "/월", year: "/년" },
    zh: { monthly: "5,99 €/月", yearly: "24,99 €/年", month: "/月", year: "/年" },
    th: { monthly: "5,99 €/เดือน", yearly: "24,99 €/ปี", month: "/เดือน", year: "/ปี" },
    ar: { monthly: "5,99 €/شهر", yearly: "24,99 €/سنة", month: "/شهر", year: "/سنة" },
    ind: { monthly: "5,99 €/bulan", yearly: "24,99 €/tahun", month: "/bulan", year: "/tahun" },
    vi: { monthly: "5,99 €/tháng", yearly: "24,99 €/năm", month: "/tháng", year: "/năm" }
  });
  const priceWords = () => PRICE_WORDS[lang] || PRICE_WORDS.en;
  const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Google Play price strings arrive with whichever suffix the previous language added.
  const periodSuffix = key => new RegExp(`\\s*\\/\\s*(?:${[...new Set(Object.values(PRICE_WORDS).map(words => words[key].slice(1)))].map(escapeRegExp).join("|")})\\s*$`, "iu");
  const MONTH_SUFFIX = periodSuffix("month");
  const YEAR_SUFFIX = periodSuffix("year");

  function localizedYearlyFallbackPrice() {
    return priceWords().yearly;
  }

  // Google Play отдаёт цену за год уже в местной валюте и с налогом;
  // приложение лишь пишет «/год» на языке интерфейса.
  function localizedYearlyPrice(value) {
    const raw = String(value || "").trim();
    if (!raw) return localizedYearlyFallbackPrice();
    const amount = raw.replace(YEAR_SUFFIX, "").trim();
    return `${amount}${priceWords().year}`;
  }

  function localizedFallbackPrice() {
    return priceWords().monthly;
  }

  function localizedMonthlyPrice(value) {
    const raw = String(value || "").trim();
    if (!raw) return localizedFallbackPrice();
    const amount = raw.replace(MONTH_SUFFIX, "").trim();
    return `${amount}${priceWords().month}`;
  }

  function normalize(value) {
    return String(value || "").normalize("NFKC").toLowerCase().replaceAll("ё", "е").replaceAll("œ", "oe").normalize("NFD").replace(/[\u0300-\u0305\u0307-\u036f]/g, "").normalize("NFC");
  }

  function containsForbidden(value) {
    const normalizedValue = normalize(value);
    if (/(?:^|[^\d])18\s*\+(?:$|[^\d])/u.test(normalizedValue)) return true;
    const tokens = normalizedValue.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const latinSkeleton = token => token
      .replace(/[аеорсухкмтвніѕ]/g, character => ({а:"a",е:"e",о:"o",р:"p",с:"c",у:"y",х:"x",к:"k",м:"m",т:"t",в:"b",н:"h",і:"i",ѕ:"s"})[character])
      .replace(/[0134578]/g, character => ({0:"o",1:"i",3:"e",4:"a",5:"s",7:"t",8:"b"})[character]);
    const cyrillicSkeleton = token => token
      .replace(/[aeopcyxkmtbhi]/g, character => ({a:"а",e:"е",o:"о",p:"р",c:"с",y:"у",x:"х",k:"к",m:"м",t:"т",b:"в",h:"н",i:"і"})[character])
      .replace(/[0134578]/g, character => ({0:"о",1:"і",3:"е",4:"а",5:"ѕ",7:"т",8:"в"})[character]);
    const tokenForms = token => [token, latinSkeleton(token), cyrillicSkeleton(token)];
    const matches = (token, rawStem) => {
      const stem = normalize(rawStem).replace(/[^\p{L}\p{N}]/gu, "");
      if (stem === "sex" || stem === "sexe") return /^(sex|sexe|sexes|sexuel|sexuelle|sexuels|sexuelles|sexual|sexually|sexuality|sexualized|sexting)$/u.test(token);
      if (stem === "kiss") return /^(kiss|kisses|kissed|kissing)$/u.test(token);
      if (stem === "baiser") return /^bais(?:er|e|es|ons|ez|ent|ait|aient)$/u.test(token);
      if (stem === "embrasser") return /^embrass(?:er|e|es|ons|ez|ent|ait|aient|ee|ees)$/u.test(token);
      if (stem === "matar") return /^matar(?:te|lo|la|los|las|le|les|e|as|a|an)?$/u.test(token);
      // Polish "drugi" means "second", so only the English word itself counts.
      if (stem === "drug") return /^drug(?:s|gy|ged|ging)?$/u.test(token);
      return token.startsWith(stem);
    };
    if (tokens.some(token => tokenForms(token).some(form => forbiddenStems.some(stem => matches(form, stem)) || /^(sex|sexe|sexual|sexting|porn|porno|erotic|kiss|kisses|kissed|kissing)$/u.test(form)))) return true;
    if (forbiddenPhrases.some(phrase => normalizedValue.includes(phrase))) return true;
    const joinedTokens = ` ${tokens.join(" ")} `;
    if (forbiddenTokenPhrases.some(phrase => joinedTokens.includes(` ${phrase} `))) return true;
    const separatedRoots = ["sex", "sexe", "секс", "porn", "porno", "порн", "erotic", "эрот", "kiss", "поцелу", "intim", "интим"];
    const rootForms = [...new Set(separatedRoots.flatMap(tokenForms))];
    for (let start = 0; start < tokens.length; start += 1) {
      const joined = ["", "", ""];
      for (let end = start; end < Math.min(tokens.length, start + 5); end += 1) {
        const forms = tokenForms(tokens[end]);
        joined.forEach((_, index) => { joined[index] += forms[index]; });
        if (end > start && joined.some(candidate => rootForms.some(root => candidate.startsWith(root)))) return true;
        if (joined.some(candidate => candidate.length > 32)) break;
        // A spelled-out word is split into one- or two-letter pieces. A real
        // word ends the run, so "до сих пор не…" and "por nosotros" stay allowed.
        if (tokens[end].length > 2) break;
      }
    }
    return false;
  }

  function containsReligiousAuthorityClaim(value) {
    const text = normalize(value).replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
    const claims = [
      "коран говорит", "сказано в коране", "в коране сказано", "хадис говорит", "в хадисе сказано", "пророк сказал", "посланник сказал", "аллах говорит", "аллах обещает", "это халяль", "это харам", "является халяль", "является харам", "по шариату",
      "quran says", "the quran says", "hadith says", "the hadith says", "prophet said", "the prophet said", "allah says", "allah promises", "this is halal", "this is haram", "it is halal", "it is haram", "according to sharia",
      "le coran dit", "selon le coran", "le hadith dit", "selon le hadith", "le prophete a dit", "allah dit", "allah promet", "c est halal", "c est haram", "cela est halal", "cela est haram", "selon la charia"
    ];
    return claims.some(claim => text.includes(normalize(claim)));
  }

  function containsImproperRomance(value, relationship = "auto") {
    const text = normalize(value).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const strong = ["влюблен в тебя", "влюблена в тебя", "любовь моей жизни", "ты моя любимая", "ты мой любимый", "ты моя единственная", "ты мой единственный", "ты моя судьба", "in love with you", "deeply in love", "love of my life", "my beloved", "my darling", "darling", "soulmate", "my heart belongs to you", "my one and only", "amour de ma vie", "amoureux de toi", "amoureuse de toi", "mon amour", "ma cherie", "mon cheri", "ame soeur", "mon ame soeur", "mon coeur t appartient"];
    if (strong.some(phrase => text.includes(phrase))) return relationship !== "spouse";
    const familial = ["spouse", "family", "mother", "father", "child", "sibling", "grandparent"].includes(relationship);
    return !familial && ["я люблю тебя", "обожаю тебя", "i love you", "je t aime"].some(phrase => text.includes(phrase));
  }

  function cleanName(value) {
    return String(value || "").normalize("NFKC").replace(/[<>\n\r{}\[\]]/g, "").replace(/\s+/g, " ").trim().slice(0, 36);
  }

  function cloudConfigurationReady() {
    try {
      return new URL(SUPABASE_URL).protocol === "https:"
        && SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_")
        && typeof window.supabase?.createClient === "function";
    } catch {
      return false;
    }
  }

  function authCallbackDetails(rawUrl) {
    try {
      const url = new URL(String(rawUrl || location.href), location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const value = key => url.searchParams.get(key) || hash.get(key) || "";
      const code = value("code");
      const error = value("error") || value("error_code");
      const hasSensitiveData = AUTH_CALLBACK_PARAMETERS.some(key => url.searchParams.has(key) || hash.has(key));
      return { url, code, error, errorDescription: value("error_description"), hasSensitiveData };
    } catch {
      return { url: null, code: "", error: "", errorDescription: "", hasSensitiveData: false };
    }
  }

  function stripAuthDataFromCurrentUrl() {
    const url = new URL(location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    let changed = false;
    AUTH_CALLBACK_PARAMETERS.forEach(key => {
      if (url.searchParams.has(key)) { url.searchParams.delete(key); changed = true; }
      if (hash.has(key)) { hash.delete(key); changed = true; }
    });
    if (!changed) return;
    const nextHash = hash.toString();
    url.hash = nextHash ? `#${nextHash}` : "";
    history.replaceState(history.state || {}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function isAcceptedAuthCallback(url) {
    if (!url || url.hash) return false;
    const noAuthorityExtras = !url.username && !url.password && !url.port;
    if (url.origin === location.origin && url.pathname === location.pathname && !url.username && !url.password) return true;
    return noAuthorityExtras && ["com.franceisl.glowletternext:", "com.franceisl.glowletternext.debug:"].includes(url.protocol) && url.hostname === "auth" && url.pathname === "/callback";
  }

  function nativeAuthBridge() {
    const bridge = window.NurAuth;
    return bridge && typeof bridge.getRedirectUrl === "function" && typeof bridge.openAuthorizeUrl === "function" ? bridge : null;
  }

  function cloudRedirectUrl() {
    const bridge = nativeAuthBridge();
    if (bridge) {
      try {
        const nativeUrl = new URL(String(bridge.getRedirectUrl() || ""));
        if (isAcceptedAuthCallback(nativeUrl)) return nativeUrl.toString();
      } catch {}
    }
    return `${location.origin}${location.pathname}`;
  }

  function setCloudStatus(key) {
    cloudStatusKey = UI[lang]?.[key] ? key : "cloudError";
    renderCloudAccount();
  }

  function normalizeCloudAccount(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const supportId = String(value.support_id || "").trim().toUpperCase();
    if (!/^GL-(?:[0-9A-F]{4}-){7}[0-9A-F]{4}$/.test(supportId)) return null;
    const vipUntil = value.vip_until && Number.isFinite(Date.parse(value.vip_until)) ? new Date(value.vip_until).toISOString() : null;
    return {
      support_id: supportId,
      is_admin: value.is_admin === true,
      premium_forever: value.premium_forever === true,
      vip_until: vipUntil,
      premium_active: value.premium_active === true,
      created_at: value.created_at || null,
      updated_at: value.updated_at || null,
      server_now: value.server_now && Number.isFinite(Date.parse(value.server_now)) ? new Date(value.server_now).toISOString() : null
    };
  }

  function trustedCloudNow() {
    if (cloudServerNow > 0 && cloudServerPerformance > 0 && globalThis.performance?.now) {
      return cloudServerNow + Math.max(0, performance.now() - cloudServerPerformance);
    }
    return Date.now();
  }

  function cloudAccountPremiumActive(account = cloudAccount) {
    return Boolean(account?.premium_forever || (account?.premium_active === true && account?.vip_until && Date.parse(account.vip_until) > trustedCloudNow()));
  }

  const VIP_TIME_UNITS = Object.freeze({
    ru: { d: "дн.", h: "ч.", m: "мин." }, en: { d: "d", h: "h", m: "min" }, fr: { d: "j", h: "h", m: "min" },
    de: { d: "T.", h: "Std.", m: "Min." }, es: { d: "d", h: "h", m: "min" }, it: { d: "g", h: "h", m: "min" }, pl: { d: "dn.", h: "godz.", m: "min" },
    uk: { d: "дн.", h: "год.", m: "хв." }, pt: { d: "d", h: "h", m: "min" }, nl: { d: "d", h: "u", m: "min" },
    tr: { d: "g", h: "sa", m: "dk" }, ro: { d: "z", h: "h", m: "min" }, cs: { d: "d", h: "h", m: "min" }, sv: { d: "d", h: "h", m: "min" }, el: { d: "ημ.", h: "ώ.", m: "λ." },
    da: { d: "d", h: "t", m: "min" }, no: { d: "d", h: "t", m: "min" }, fi: { d: "pv", h: "t", m: "min" }, ja: { d: "日", h: "時間", m: "分" }, ko: { d: "일", h: "시간", m: "분" },
    zh: { d: "天", h: "小時", m: "分鐘" }, th: { d: "วัน", h: "ชม.", m: "นาที" }, ar: { d: "ي", h: "س", m: "د" }, ind: { d: "hr", h: "j", m: "mnt" }, vi: { d: "ngày", h: "giờ", m: "phút" }
  });
  // Japanese, Korean and Chinese write the unit right after the number: 3日 4時間.
  const COMPACT_UNIT_LANGUAGES = new Set(["ja", "ko", "zh"]);
  const DAY_WORDS = Object.freeze({ en: ["day", "days"], fr: ["jour", "jours"], de: ["Tag", "Tage"], es: ["día", "días"], it: ["giorno", "giorni"], pl: ["dzień", "dni"], pt: ["dia", "dias"], nl: ["dag", "dagen"], tr: ["gün", "gün"], sv: ["dag", "dagar"], el: ["μέρα", "μέρες"], da: ["dag", "dage"], no: ["dag", "dager"], fi: ["päivä", "päivää"], th: ["วัน", "วัน"], ind: ["hari", "hari"], vi: ["ngày", "ngày"] });
  // Czech and Romanian count days by their own rules (2–4 "dny", 20+ "de zile");
  // Japanese, Korean and Chinese attach the counter to the number without a
  // space; Arabic has a dual and changes the noun after ten.
  const SPECIAL_DAY_WORDS = Object.freeze({
    cs: amount => `${amount} ${amount === 1 ? "den" : amount >= 2 && amount <= 4 ? "dny" : "dní"}`,
    ro: amount => `${amount} ${amount === 1 ? "zi" : amount < 20 ? "zile" : "de zile"}`,
    ja: amount => `${amount}日`,
    ko: amount => `${amount}일`,
    zh: amount => `${amount}天`,
    ar: amount => (amount === 1 ? "يوم واحد" : amount === 2 ? "يومان" : amount <= 10 ? `${amount} أيام` : `${amount} يومًا`)
  });
  const SLAVIC_DAY_WORDS = Object.freeze({ ru: ["день", "дня", "дней"], uk: ["день", "дні", "днів"] });
  function formatVipRemaining(milliseconds) {
    const totalMinutes = Math.max(0, Math.ceil(Number(milliseconds || 0) / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const units = VIP_TIME_UNITS[lang] || VIP_TIME_UNITS.en;
    const glue = COMPACT_UNIT_LANGUAGES.has(lang) ? "" : " ";
    return [days ? `${days}${glue}${units.d}` : "", hours ? `${hours}${glue}${units.h}` : "", `${minutes}${glue}${units.m}`].filter(Boolean).join(" ");
  }

  function formatVipDate(value) {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) return "—";
    try {
      return new Intl.DateTimeFormat(DATE_LOCALES[lang] || "en-GB", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(timestamp));
    } catch { return new Date(timestamp).toLocaleString(); }
  }

  function accountPlanText(account, { includeNative = false } = {}) {
    if (!account) return t("accountPlanChecking");
    if (account.premium_forever) return t("accountPlanPermanent");
    const expiry = Date.parse(account.vip_until || "");
    if (Number.isFinite(expiry) && expiry > trustedCloudNow()) {
      return t("accountPlanVip")
        .replace("{remaining}", formatVipRemaining(expiry - trustedCloudNow()))
        .replace("{date}", formatVipDate(account.vip_until));
    }
    if (includeNative && nativePremium) return t("accountPlanStore");
    return t("accountPlanFree");
  }

  function accountPlanState(account, { includeNative = false } = {}) {
    if (!account) return "checking";
    if (account.premium_forever) return "permanent";
    const expiry = Date.parse(account.vip_until || "");
    if (Number.isFinite(expiry) && expiry > trustedCloudNow()) return "vip";
    if (includeNative && nativePremium) return "store";
    return "free";
  }

  function accountPlanBadgeText(state) {
    if (["vip", "permanent", "store"].includes(state)) return t("accountBadgeVip");
    if (state === "free") return t("accountBadgeFree");
    return t("accountBadgeChecking");
  }

  // Состояние доступа показывается всегда: и когда его нет, и когда он уже оплачен.
  // Раньше карточка только продавала и пряталась после покупки — человек оставался
  // без единого ответа на вопрос «что у меня сейчас и до какого числа».
  async function saveAccountPassword(event) {
    event.preventDefault();
    const field = $("#accountPasswordInput");
    const confirmField = $("#accountPasswordConfirm");
    const status = $("#accountPasswordStatus");
    const password = String(field?.value || "");
    const fail = (key, focus) => { setText("#accountPasswordStatus", t(key)); status.dataset.state = "error"; focus?.focus(); };
    if (password.length < 8 || password.length > 128) return fail("accountPasswordShort", field);
    // Второе поле ловит опечатку до того, как пароль уйдёт на сервер.
    if (confirmField && String(confirmField.value || "") !== password) return fail("accountPasswordMismatch", confirmField);
    const done = key => {
      field.value = "";
      if (confirmField) confirmField.value = "";
      hidePasswords($("#accountPasswordForm"));
      $("#accountPasswordForm").hidden = true;
      setText("#accountPasswordStatus", t(key));
      status.dataset.state = "success";
      showToast(t(key), 4200);
    };
    try {
      await updateAccountPassword(password);
      done("accountPasswordSaved");
    } catch (error) {
      console.info("Password update failed", error);
      const code = String(error?.code || "").toLowerCase();
      // Раньше совпадение со старым паролем выглядело как сбой, и человек
      // придумывал новый пароль, а входить пытался старым.
      if (code === "same_password") done("accountPasswordSame");
      else if (code === "weak_password") fail("accountPasswordWeak", field);
      else fail("accountPasswordFailed", field);
    }
  }

  // Кнопка-глаз у каждого поля пароля: на телефоне раскладку, заглавную букву
  // или автозамену иначе не увидеть. Кнопка стоит рядом с label, не внутри него.
  function installPasswordToggles() {
    document.querySelectorAll('input[type="password"]').forEach(input => {
      const label = input.closest("label");
      if (!label || label.parentElement?.classList.contains("password-wrap")) return;
      const wrap = document.createElement("div");
      wrap.className = "password-wrap";
      label.replaceWith(wrap);
      wrap.append(label);
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "password-toggle";
      toggle.setAttribute("aria-controls", input.id);
      toggle.addEventListener("click", () => {
        input.type = input.type === "password" ? "text" : "password";
        renderPasswordToggle(toggle, input);
      });
      wrap.append(toggle);
      renderPasswordToggle(toggle, input);
    });
  }

  function hidePasswords(scope) {
    scope?.querySelectorAll(".password-toggle").forEach(toggle => {
      const input = document.getElementById(toggle.getAttribute("aria-controls") || "");
      if (!input) return;
      input.type = "password";
      renderPasswordToggle(toggle, input);
    });
  }

  function renderPasswordToggle(toggle, input) {
    const visible = input.type === "text";
    toggle.setAttribute("aria-pressed", String(visible));
    toggle.setAttribute("aria-label", t(visible ? "passwordHide" : "passwordShow"));
    toggle.innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#${visible ? "ic-eye-off" : "ic-eye"}"/></svg>`;
  }

  function renderSubscriptionCard() {
    const card = $("#subscriptionCard");
    if (!card) return;
    const account = cloudAccount || { premium_forever: false, vip_until: null, premium_active: false };
    const waiting = Boolean(cloudUser?.id) && cloudAccount === null && !nativePremium;
    const state = waiting ? "checking" : accountPlanState(account, { includeNative: true });
    const noteKey = {
      checking: "subscriptionNoteChecking",
      free: "subscriptionNoteFree",
      store: "subscriptionNoteStore",
      vip: "subscriptionNoteVip",
      permanent: "subscriptionNotePermanent"
    }[state] || "subscriptionNoteFree";
    card.dataset.plan = state;
    setText("#subscriptionTitle", t("subscriptionTitle"));
    setText("#subscriptionStatus", waiting ? t("accountPlanChecking") : accountPlanText(account, { includeNative: true }));
    const badge = $("#subscriptionBadge");
    if (badge) { badge.dataset.plan = state; badge.textContent = accountPlanBadgeText(state); }
    setText("#subscriptionNote", t(noteKey));
  }

  function normalizeVipNotification(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const id = String(value.id || "").trim();
    const userId = String(value.user_id || "").trim();
    const kind = String(value.kind || "").trim().toLowerCase();
    if (!id || id.length > 128 || !userId || userId !== cloudUser?.id || !VIP_NOTIFICATION_KINDS.has(kind)) return null;
    const createdTimestamp = Date.parse(value.created_at || "");
    if (!Number.isFinite(createdTimestamp)) return null;
    const readTimestamp = value.read_at ? Date.parse(value.read_at) : NaN;
    const reason = VIP_NOTICE_REASONS.has(value.reason) ? value.reason : "other";
    const grantedDays = Number(value.granted_days);
    const vipUntilTimestamp = Date.parse(value.vip_until || "");
    const normalizedMessage = String(value.message || "")
      .normalize("NFKC")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu, "")
      .replace(/\r\n?/gu, "\n")
      .trim()
      .slice(0, VIP_NOTICE_MESSAGE_MAX);
    return {
      id,
      user_id: userId,
      kind,
      reason,
      message: normalizedMessage && !containsForbidden(normalizedMessage) ? normalizedMessage : "",
      granted_days: Number.isInteger(grantedDays) && grantedDays > 0 && grantedDays <= 365 ? grantedDays : null,
      vip_until: Number.isFinite(vipUntilTimestamp) ? new Date(vipUntilTimestamp).toISOString() : null,
      created_at: new Date(createdTimestamp).toISOString(),
      read_at: Number.isFinite(readTimestamp) ? new Date(readTimestamp).toISOString() : null
    };
  }

  function notificationReasonText(reason) {
    const key = {
      gift: "notificationReasonGift",
      compensation: "notificationReasonCompensation",
      promotion: "notificationReasonPromotion",
      other: "notificationReasonOther"
    }[reason] || "notificationReasonOther";
    return t(key);
  }

  function formatVipGrantDuration(days) {
    const amount = Math.max(1, Math.round(Number(days) || 1));
    const slavic = SLAVIC_DAY_WORDS[lang];
    if (!slavic) {
      const special = SPECIAL_DAY_WORDS[lang];
      if (special) return special(amount);
      const pair = DAY_WORDS[lang] || DAY_WORDS.en;
      return `${amount} ${amount === 1 ? pair[0] : pair[1]}`;
    }
    const mod10 = amount % 10;
    const mod100 = amount % 100;
    const word = mod10 === 1 && mod100 !== 11 ? slavic[0] : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? slavic[1] : slavic[2];
    return `${amount} ${word}`;
  }

  function notificationVipExpiry(notification) {
    if (String(notification?.kind || "") === "vip_forever") return null;
    const notificationTimestamp = Date.parse(notification?.vip_until || "");
    if (Number.isFinite(notificationTimestamp)) return new Date(notificationTimestamp).toISOString();
    if (!notification?.read_at && cloudAccount?.vip_until && Number.isFinite(Date.parse(cloudAccount.vip_until))) return cloudAccount.vip_until;
    return null;
  }

  function notificationVipDays(notification) {
    const explicit = Number(notification?.granted_days);
    if (Number.isInteger(explicit) && explicit > 0 && explicit <= 365) return explicit;
    const expiry = Date.parse(notificationVipExpiry(notification) || "");
    const created = Date.parse(notification?.created_at || "");
    return Number.isFinite(expiry) && Number.isFinite(created) && expiry > created ? Math.max(1, Math.ceil((expiry - created) / 86400000)) : 0;
  }

  function notificationIsForever(notification) {
    return String(notification?.kind || "") === "vip_forever";
  }

  function notificationVipExpired(notification) {
    if (notificationIsForever(notification)) return false;
    const expiry = Date.parse(notificationVipExpiry(notification) || "");
    return Number.isFinite(expiry) && expiry <= trustedCloudNow();
  }

  function formatNotificationDate(value) {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) return "";
    try {
      return new Intl.DateTimeFormat(DATE_LOCALES[lang] || "en-GB", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(timestamp));
    } catch { return new Date(timestamp).toLocaleString(); }
  }

  function notificationBodyText(notification) {
    if (notificationIsForever(notification)) return t("vipNoticeBodyForever");
    const expiry = notificationVipExpiry(notification);
    if (expiry && notificationVipExpired(notification)) return t("vipNoticeBodyExpired").replace("{date}", formatVipDate(expiry));
    const days = notificationVipDays(notification);
    if (expiry && days) return t("vipNoticeBodyDays").replace("{duration}", formatVipGrantDuration(days)).replace("{date}", formatVipDate(expiry));
    if (expiry) return t("vipNoticeBodyUntil").replace("{date}", formatVipDate(expiry));
    return t("vipNoticeBodyActive");
  }

  function unreadVipNotifications() {
    return vipNotifications.filter(notification => !notification.read_at);
  }

  function mergeVipNotificationSnapshots(snapshot, current = vipNotifications) {
    const merged = new Map(snapshot.map(notification => [notification.id, notification]));
    current.forEach(notification => {
      const olderSnapshot = merged.get(notification.id);
      merged.set(notification.id, olderSnapshot ? {
        ...olderSnapshot,
        ...notification,
        read_at: notification.read_at || olderSnapshot.read_at || null
      } : notification);
    });
    return [...merged.values()]
      .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at))
      .slice(0, 40);
  }

  function setNotificationStatus(key = "", state = "") {
    const status = $("#notificationStatus");
    if (!status) return;
    status.textContent = key ? t(key) : "";
    if (state) status.dataset.state = state; else delete status.dataset.state;
  }

  function buildNotificationHistoryItem(notification) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.notificationId = notification.id;
    button.className = `vip-notification-history-item${notification.read_at ? "" : " is-unread"}${notification.id === activeVipNotificationId ? " is-active" : ""}`;
    if (notification.id === activeVipNotificationId) button.setAttribute("aria-current", "true");

    const top = document.createElement("span");
    const reason = document.createElement("strong");
    reason.textContent = notificationReasonText(notification.reason);
    const date = document.createElement("time");
    date.dateTime = notification.created_at;
    date.textContent = formatNotificationDate(notification.created_at);
    top.append(reason, date);

    const body = document.createElement("span");
    body.textContent = notificationBodyText(notification);
    const state = document.createElement("b");
    state.textContent = t(notification.read_at ? "notificationRead" : "notificationNew");
    button.append(top, body, state);
    item.append(button);
    return item;
  }

  function renderVipNotifications() {
    const signedIn = Boolean(cloudUser?.id);
    const unread = unreadVipNotifications();
    const bell = $("#notificationBell");
    const badge = $("#notificationUnreadBadge");
    if (bell) {
      bell.hidden = !signedIn;
      bell.classList.toggle("has-unread", unread.length > 0);
      bell.setAttribute("aria-label", t("notificationBellAria").replace("{count}", String(unread.length)));
      setText("#notificationBellLabel", t("notificationBell"));
    }
    if (badge) {
      badge.hidden = unread.length === 0;
      badge.textContent = unread.length > 99 ? "99+" : String(unread.length);
    }

    setText("#notificationTitle", t("notificationsTitle"));
    setText("#notificationLead", t("notificationsLead"));
    setText("#notificationHistoryTitle", t("notificationHistoryTitle"));
    setText("#notificationHistoryState", unread.length ? t("notificationsUnread").replace("{count}", String(unread.length)) : t("notificationsAllRead"));
    setText("#notificationEmpty", t("notificationsEmpty"));
    setText("#notificationAcknowledge", t("notificationAcknowledge"));

    const list = $("#notificationHistoryList");
    if (list) {
      list.replaceChildren(...vipNotifications.map(buildNotificationHistoryItem));
      list.hidden = vipNotifications.length === 0;
    }
    const empty = $("#notificationEmpty");
    if (empty) empty.hidden = vipNotifications.length > 0 || notificationLoading;

    let active = vipNotifications.find(notification => notification.id === activeVipNotificationId) || unread[0] || vipNotifications[0] || null;
    if (active && activeVipNotificationId !== active.id) activeVipNotificationId = active.id;
    const hero = $("#vipNoticeHero");
    if (!hero) return;
    hero.hidden = !active;
    if (!active) return;
    hero.classList.toggle("is-unread", !active.read_at);
    setText("#vipNoticeReason", notificationReasonText(active.reason));
    const date = $("#vipNoticeDate");
    date.dateTime = active.created_at;
    date.textContent = formatNotificationDate(active.created_at);
    setText("#vipNoticeTitle", t(notificationIsForever(active) ? "vipNoticeTitleForever" : notificationVipExpired(active) ? "vipNoticeTitleExpired" : "vipNoticeTitle"));
    setText("#vipNoticeBody", notificationBodyText(active));
    const message = $("#vipNoticeMessage");
    message.hidden = !active.message;
    message.textContent = active.message;
    const acknowledge = $("#notificationAcknowledge");
    acknowledge.hidden = Boolean(active.read_at);
    acknowledge.disabled = false;
  }

  function releaseNotificationLayerContext() {
    notificationInertedLayers.forEach(layer => layer.removeAttribute("inert"));
    notificationInertedLayers.clear();
  }

  function openVipNotifications({ notificationId = "", automatic = false } = {}) {
    if (!cloudUser?.id || !layers.notifications) return;
    if (notificationId && vipNotifications.some(notification => notification.id === notificationId)) activeVipNotificationId = notificationId;
    if (automatic && activeVipNotificationId) presentedVipNotificationIds.add(activeVipNotificationId);
    if (!layers.notifications.classList.contains("is-open")) {
      notificationInertedLayers.clear();
      Object.values(layers).forEach(layer => {
        if (layer && layer !== layers.notifications && layer.classList.contains("is-open") && !layer.hasAttribute("inert")) {
          layer.setAttribute("inert", "");
          notificationInertedLayers.add(layer);
        }
      });
    }
    renderVipNotifications();
    openPanel(layers.notifications);
  }

  function closeVipNotifications() {
    closePanel(layers.notifications);
  }

  function presentNextUnreadVipNotification() {
    const next = unreadVipNotifications().find(notification => !presentedVipNotificationIds.has(notification.id));
    if (!next) return;
    activeVipNotificationId = next.id;
    openVipNotifications({ notificationId: next.id, automatic: true });
  }

  function stopVipNotificationSubscription() {
    const channel = vipNotificationChannel;
    vipNotificationChannel = null;
    vipNotificationChannelUserId = "";
    if (channel && cloudClient?.removeChannel) cloudClient.removeChannel(channel).catch(() => {});
  }

  function resetVipNotifications() {
    stopVipNotificationSubscription();
    vipNotificationLoadGeneration += 1;
    vipNotificationRevision += 1;
    vipNotifications = [];
    vipNotificationsLoadedUserId = "";
    activeVipNotificationId = "";
    notificationLoading = false;
    presentedVipNotificationIds.clear();
    if (layers.notifications?.classList.contains("is-open")) closeVipNotifications();
    renderVipNotifications();
  }

  async function loadVipNotifications({ presentUnread = true } = {}) {
    const userId = cloudUser?.id || "";
    if (!cloudClient || !userId) return [];
    const requestGeneration = ++vipNotificationLoadGeneration;
    const revisionAtStart = vipNotificationRevision;
    notificationLoading = true;
    setNotificationStatus("notificationLoading");
    renderVipNotifications();
    try {
      const { data, error } = await cloudClient
        .from(VIP_NOTIFICATION_TABLE)
        .select("id,user_id,kind,reason,message,granted_days,vip_until,created_at,read_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(40);
      if (error) throw error;
      if (cloudUser?.id !== userId || requestGeneration !== vipNotificationLoadGeneration) return vipNotifications;
      const snapshot = (Array.isArray(data) ? data : []).map(normalizeVipNotification).filter(Boolean);
      vipNotifications = vipNotificationRevision === revisionAtStart ? snapshot : mergeVipNotificationSnapshots(snapshot);
      vipNotificationsLoadedUserId = userId;
      if (activeVipNotificationId && !vipNotifications.some(notification => notification.id === activeVipNotificationId)) activeVipNotificationId = "";
      setNotificationStatus();
      renderVipNotifications();
      if (presentUnread) presentNextUnreadVipNotification();
      return vipNotifications;
    } catch (error) {
      console.info("VIP notification load failed", error);
      if (cloudUser?.id === userId && requestGeneration === vipNotificationLoadGeneration) setNotificationStatus("notificationLoadFailed", "error");
      return vipNotifications;
    } finally {
      if (cloudUser?.id === userId && requestGeneration === vipNotificationLoadGeneration) {
        notificationLoading = false;
        renderVipNotifications();
      }
    }
  }

  function startVipNotificationSubscription(userId) {
    if (!cloudClient || !userId || vipNotificationChannelUserId === userId) return;
    stopVipNotificationSubscription();
    vipNotificationChannelUserId = userId;
    vipNotificationChannel = cloudClient
      .channel(`glowletter-vip-notifications:${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: VIP_NOTIFICATION_TABLE,
        filter: `user_id=eq.${userId}`
      }, payload => {
        if (cloudUser?.id !== userId) return;
        const notification = normalizeVipNotification(payload?.new);
        if (!notification) return;
        vipNotificationRevision += 1;
        vipNotifications = [notification, ...vipNotifications.filter(item => item.id !== notification.id)].slice(0, 40);
        activeVipNotificationId = notification.id;
        renderVipNotifications();
        loadCloudAccount(cloudUser).catch(error => console.info("Cloud account refresh after VIP notice failed", error));
        presentNextUnreadVipNotification();
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: VIP_NOTIFICATION_TABLE,
        filter: `user_id=eq.${userId}`
      }, payload => {
        if (cloudUser?.id !== userId) return;
        const notification = normalizeVipNotification(payload?.new);
        if (!notification) return;
        vipNotificationRevision += 1;
        const existingIndex = vipNotifications.findIndex(item => item.id === notification.id);
        if (existingIndex < 0) vipNotifications = [notification, ...vipNotifications].slice(0, 40);
        else vipNotifications = vipNotifications.map(item => item.id === notification.id ? notification : item);
        renderVipNotifications();
      })
      .subscribe((status, error) => {
        if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT") && error) console.info("VIP notification channel failed", status, error);
      });
  }

  async function ensureVipNotifications(user = cloudUser, { reload = false, presentUnread = true } = {}) {
    const userId = user?.id || "";
    if (!cloudClient || !userId || cloudUser?.id !== userId) return;
    startVipNotificationSubscription(userId);
    if (reload || vipNotificationsLoadedUserId !== userId) await loadVipNotifications({ presentUnread });
  }

  async function markActiveVipNotificationRead() {
    const active = vipNotifications.find(notification => notification.id === activeVipNotificationId);
    if (!cloudClient || !cloudUser?.id || !active || active.read_at) return;
    const userId = cloudUser.id;
    const button = $("#notificationAcknowledge");
    button.disabled = true;
    setNotificationStatus();
    const createdAt = Date.parse(active.created_at || "");
    const readAt = new Date(Math.max(trustedCloudNow(), Number.isFinite(createdAt) ? createdAt + 1 : 0)).toISOString();
    try {
      const { data, error } = await cloudClient
        .from(VIP_NOTIFICATION_TABLE)
        .update({ read_at: readAt })
        .eq("id", active.id)
        .eq("user_id", userId)
        .is("read_at", null)
        .select("id,read_at")
        .maybeSingle();
      if (error) throw error;
      let persistedReadAt = data?.read_at || "";
      if (!data?.id) {
        const { data: current, error: currentError } = await cloudClient
          .from(VIP_NOTIFICATION_TABLE)
          .select("id,read_at")
          .eq("id", active.id)
          .eq("user_id", userId)
          .maybeSingle();
        if (currentError) throw currentError;
        persistedReadAt = current?.read_at || "";
      }
      if (!persistedReadAt) throw new Error("VIP notification was not marked as read");
      if (cloudUser?.id !== userId) return;
      vipNotificationRevision += 1;
      vipNotifications = vipNotifications.map(notification => notification.id === active.id ? { ...notification, read_at: persistedReadAt } : notification);
      const next = unreadVipNotifications()[0];
      activeVipNotificationId = next?.id || active.id;
      renderVipNotifications();
      haptic(12);
      if (!next) closeVipNotifications();
    } catch (error) {
      console.info("VIP notification read failed", error);
      setNotificationStatus("notificationReadFailed", "error");
      button.disabled = false;
    }
  }

  function selectVipNotificationFromHistory(event) {
    const button = event.target.closest("[data-notification-id]");
    if (!button || !vipNotifications.some(notification => notification.id === button.dataset.notificationId)) return;
    activeVipNotificationId = button.dataset.notificationId;
    renderVipNotifications();
    $("#vipNoticeHero")?.scrollIntoView({ behavior: REDUCED_MOTION.matches ? "auto" : "smooth", block: "nearest" });
  }

  function normalizeAdminVipMessage(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu, "")
      .replace(/\r\n?/gu, "\n")
      .replace(/[ \t]+/gu, " ")
      .replace(/\n{3,}/gu, "\n\n")
      .trim();
  }

  function updateAdminVipMessageCount() {
    const field = $("#adminVipMessage");
    if (!field) return;
    setText("#adminVipMessageCount", `${field.value.length} / ${VIP_NOTICE_MESSAGE_MAX}`);
  }

  function setAdminStatus(message = "", state = "") {
    const status = $("#adminStatus");
    if (!status) return;
    status.textContent = message;
    if (state) status.dataset.state = state; else delete status.dataset.state;
  }

  function renderAdminResult() {
    const result = $("#adminResult");
    if (!result) return;
    result.hidden = !adminAccountResult;
    if (!adminAccountResult) return;
    setText("#adminResultId", adminAccountResult.support_id);
    setText("#adminResultPlan", accountPlanText(adminAccountResult));
  }

  function startCloudAccountClock() {
    clearInterval(cloudAccountTimer);
    clearTimeout(cloudAccountRefreshTimer);
    cloudAccountTimer = 0;
    cloudAccountRefreshTimer = 0;
    if (!cloudUser?.id || !cloudAccount) return;
    cloudAccountTimer = setInterval(() => {
      const nextCloudPremium = cloudAccountPremiumActive();
      if (cloudPremium !== nextCloudPremium) {
        cloudPremium = nextCloudPremium;
        applyEffectivePremium("cloud_access_expired");
      } else {
        renderCloudAccount();
        renderAdminResult();
      }
    }, 30000);
    cloudAccountRefreshTimer = setTimeout(() => {
      if (!document.hidden && navigator.onLine && cloudUser?.id) {
        loadCloudAccount(cloudUser).catch(error => {
          console.info("Cloud account refresh failed", error);
          startCloudAccountClock();
        });
      } else {
        startCloudAccountClock();
      }
    }, 60000);
  }

  function resetCloudAccount() {
    clearInterval(cloudAccountTimer);
    clearTimeout(cloudAccountRefreshTimer);
    cloudAccountTimer = 0;
    cloudAccountRefreshTimer = 0;
    cloudAccount = null;
    adminAccountResult = null;
    adminOverviewLoaded = false;
    adminOverviewData = null;
    cloudServerNow = 0;
    cloudServerPerformance = 0;
    cloudPremium = false;
    resetVipNotifications();
    applyEffectivePremium("cloud_account_signed_out");
  }

  async function loadCloudAccount(user = cloudUser) {
    const userId = user?.id || "";
    if (!cloudClient || !userId) return null;
    const { data, error } = await cloudClient.rpc("glowletter_my_access");
    if (error) throw error;
    if (cloudUser?.id !== userId) return null;
    const account = rpcAccountRow(data);
    if (!account) throw new Error("GlowLetter account record is unavailable");
    if (account.server_now) {
      cloudServerNow = Date.parse(account.server_now);
      cloudServerPerformance = globalThis.performance?.now ? performance.now() : 0;
    }
    cloudAccount = account;
    cloudPremium = cloudAccountPremiumActive(account);
    applyEffectivePremium("cloud_account");
    startCloudAccountClock();
    ensureVipNotifications(user).catch(error => console.info("VIP notification initialization failed", error));
    return account;
  }

  function normalizedSupportId(value) {
    const supportId = String(value || "").normalize("NFKC").trim().toUpperCase();
    return /^GL-(?:[0-9A-F]{4}-){7}[0-9A-F]{4}$/.test(supportId) ? supportId : "";
  }

  function setAdminBusy(busy) {
    ["#adminSupportId", "#adminLookupButton", "#adminVipDays", "#adminVipReason", "#adminVipMessage", "#adminGrantVip", "#adminGrantForever", "#adminRevokeVip", "#adminBulkDays", "#adminBulkReason", "#adminBulkMessage", "#adminGrantAll", "#adminRevokeAll", "#adminRefresh"].forEach(selector => {
      const control = $(selector);
      if (control) control.disabled = Boolean(busy);
    });
    $("#adminLookupButton")?.setAttribute("aria-busy", String(Boolean(busy)));
  }

  function rpcAccountRow(data) {
    const value = Array.isArray(data) ? data[0] : data;
    return normalizeCloudAccount(value);
  }

  async function lookupAdminAccount(event) {
    event?.preventDefault?.();
    if (!cloudClient || cloudAccount?.is_admin !== true) return;
    const rawQuery = String($("#adminSupportId").value || "").normalize("NFKC").trim();
    const email = rawQuery.includes("@") ? rawQuery.toLowerCase() : "";
    const supportId = email ? "" : normalizedSupportId(rawQuery);
    adminAccountResult = null;
    renderAdminResult();
    if (!supportId && !(email && email.length <= 254 && ADMIN_EMAIL_PATTERN.test(email))) {
      setAdminStatus(t("adminLookupInvalid"), "error");
      return;
    }
    setAdminBusy(true);
    setAdminStatus(t("adminSearching"));
    try {
      const { data, error } = email
        ? await cloudClient.rpc("glowletter_admin_lookup_by_email", { p_email: email })
        : await cloudClient.rpc("glowletter_admin_lookup", { p_support_id: supportId });
      if (error) throw error;
      adminAccountResult = rpcAccountRow(data);
      if (!adminAccountResult) {
        setAdminStatus(t("adminNotFound"), "error");
        return;
      }
      $("#adminSupportId").value = adminAccountResult.support_id;
      setAdminStatus();
      renderAdminResult();
    } catch (error) {
      console.info("Admin lookup failed", error);
      setAdminStatus(t("adminError"), "error");
    } finally {
      setAdminBusy(false);
    }
  }

  async function grantAdminVip() {
    if (!cloudClient || cloudAccount?.is_admin !== true || !adminAccountResult) return;
    const days = Number($("#adminVipDays").value);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      setAdminStatus(t("adminError"), "error");
      return;
    }
    const reason = VIP_NOTICE_REASONS.has($("#adminVipReason").value) ? $("#adminVipReason").value : "gift";
    const rawMessage = $("#adminVipMessage").value;
    const message = normalizeAdminVipMessage(rawMessage);
    if (message.length > VIP_NOTICE_MESSAGE_MAX || containsForbidden(message) || containsReligiousAuthorityClaim(message)) {
      setAdminStatus(t("adminNoticeInvalid"), "error");
      $("#adminVipMessage").focus();
      return;
    }
    setAdminBusy(true);
    setAdminStatus(t("adminSearching"));
    try {
      const { data, error } = await cloudClient.rpc("glowletter_admin_grant_vip_with_notice", {
        p_support_id: adminAccountResult.support_id,
        p_days: days,
        p_reason: reason,
        p_message: message || null
      });
      if (error) throw error;
      const updated = rpcAccountRow(data);
      if (!updated) throw new Error("VIP update returned no account");
      adminAccountResult = updated;
      renderAdminResult();
      setAdminStatus(t("adminGrantDone").replace("{date}", formatVipDate(updated.vip_until)), "success");
      $("#adminVipMessage").value = "";
      updateAdminVipMessageCount();
      if (updated.support_id === cloudAccount?.support_id) await loadCloudAccount(cloudUser);
    } catch (error) {
      console.info("Admin VIP grant failed", error);
      setAdminStatus(t("adminError"), "error");
    } finally {
      setAdminBusy(false);
    }
  }

  async function grantAdminForever() {
    if (!cloudClient || cloudAccount?.is_admin !== true || !adminAccountResult) return;
    const reason = VIP_NOTICE_REASONS.has($("#adminVipReason").value) ? $("#adminVipReason").value : "gift";
    const message = normalizeAdminVipMessage($("#adminVipMessage").value);
    if (message.length > VIP_NOTICE_MESSAGE_MAX || containsForbidden(message) || containsReligiousAuthorityClaim(message)) {
      setAdminStatus(t("adminNoticeInvalid"), "error");
      $("#adminVipMessage").focus();
      return;
    }
    setAdminBusy(true);
    setAdminStatus(t("adminSearching"));
    try {
      const { data, error } = await cloudClient.rpc("glowletter_admin_grant_forever", {
        p_support_id: adminAccountResult.support_id,
        p_reason: reason,
        p_message: message || null
      });
      if (error) throw error;
      const updated = rpcAccountRow(data);
      if (!updated) throw new Error("Forever grant returned no account");
      adminAccountResult = updated;
      renderAdminResult();
      setAdminStatus(t("adminGrantForeverDone"), "success");
      $("#adminVipMessage").value = "";
      updateAdminVipMessageCount();
      if (updated.support_id === cloudAccount?.support_id) await loadCloudAccount(cloudUser);
    } catch (error) {
      console.info("Admin forever grant failed", error);
      setAdminStatus(t("adminError"), "error");
    } finally {
      setAdminBusy(false);
    }
  }

  async function revokeAdminVip() {
    if (!cloudClient || cloudAccount?.is_admin !== true || !adminAccountResult) return;
    setAdminBusy(true);
    setAdminStatus(t("adminSearching"));
    try {
      const { data, error } = await cloudClient.rpc("glowletter_admin_revoke_vip", {
        p_support_id: adminAccountResult.support_id
      });
      if (error) throw error;
      const updated = rpcAccountRow(data);
      if (!updated) throw new Error("VIP revoke returned no account");
      adminAccountResult = updated;
      renderAdminResult();
      setAdminStatus(t("adminRevokeDone"), "success");
      if (updated.support_id === cloudAccount?.support_id) await loadCloudAccount(cloudUser);
    } catch (error) {
      console.info("Admin VIP revoke failed", error);
      setAdminStatus(t("adminError"), "error");
    } finally {
      setAdminBusy(false);
    }
  }

  // Admin overview: counts and the latest accounts; each row opens that account.
  let adminOverviewLoaded = false;
  let adminOverviewData = null;
  const ADMIN_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

  function adminDateLabel(value) {
    if (!value || !Number.isFinite(Date.parse(value))) return "";
    return new Intl.DateTimeFormat(DATE_LOCALES[lang] || "en-GB", { day: "numeric", month: "short", year: "2-digit" }).format(new Date(value));
  }

  function renderAdminOverview(overview = adminOverviewData) {
    const box = $("#adminOverview");
    if (!box) return;
    box.hidden = !overview;
    if (!overview) return;
    setText("#adminStatTotal", String(overview.total ?? 0));
    setText("#adminStatVip", String(overview.vip_active ?? 0));
    setText("#adminStatForever", String(overview.forever ?? 0));
    setText("#adminStatNew", String(overview.new_week ?? 0));
    const rows = Array.isArray(overview.recent) ? overview.recent : [];
    const items = rows.map(row => {
      const account = normalizeCloudAccount(row);
      if (!account) return "";
      const name = row.email ? String(row.email) : account.support_id;
      const signIn = row.last_sign_in_at ? adminDateLabel(row.last_sign_in_at) : t("adminRowNever");
      return `<li><button type="button" data-admin-id="${escapeHtml(account.support_id)}"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(accountPlanText(account))}</span><small>${escapeHtml(t("adminRowCreated"))} ${escapeHtml(adminDateLabel(row.created_at))} · ${escapeHtml(t("adminRowSignIn"))} ${escapeHtml(signIn)}</small></button></li>`;
    }).join("");
    $("#adminRecentList").innerHTML = items || `<li class="admin-recent-empty">${escapeHtml(t("adminRecentEmpty"))}</li>`;
  }

  async function loadAdminOverview() {
    if (!cloudClient || cloudAccount?.is_admin !== true) return;
    adminOverviewLoaded = true;
    try {
      const { data, error } = await cloudClient.rpc("glowletter_admin_overview");
      if (error) throw error;
      adminOverviewData = data && typeof data === "object" ? data : null;
    } catch (error) {
      console.info("Admin overview failed", error);
      adminOverviewData = null;
    }
    renderAdminOverview();
  }

  function adminBulkNotice() {
    const days = Number($("#adminBulkDays").value);
    const reason = VIP_NOTICE_REASONS.has($("#adminBulkReason").value) ? $("#adminBulkReason").value : "gift";
    return { days, reason, message: normalizeAdminVipMessage($("#adminBulkMessage").value) };
  }

  // VIP for everyone: the server skips admins and access with no end date.
  async function grantAdminVipAll() {
    if (!cloudClient || cloudAccount?.is_admin !== true) return;
    const { days, reason, message } = adminBulkNotice();
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      setAdminStatus(t("adminError"), "error");
      return;
    }
    if (message.length > VIP_NOTICE_MESSAGE_MAX || containsForbidden(message) || containsReligiousAuthorityClaim(message)) {
      setAdminStatus(t("adminNoticeInvalid"), "error");
      $("#adminBulkMessage").focus();
      return;
    }
    if (!globalThis.confirm(t("adminGrantAllConfirm").replace("{days}", String(days)))) return;
    setAdminBusy(true);
    setAdminStatus(t("adminSearching"));
    try {
      const { data, error } = await cloudClient.rpc("glowletter_admin_grant_vip_all", { p_days: days, p_reason: reason, p_message: message || null });
      if (error) throw error;
      setAdminStatus(t("adminGrantAllDone").replace("{count}", String(Number(data) || 0)), "success");
      $("#adminBulkMessage").value = "";
      adminAccountResult = null;
      renderAdminResult();
      await loadAdminOverview();
    } catch (error) {
      console.info("Admin mass grant failed", error);
      setAdminStatus(t("adminError"), "error");
    } finally {
      setAdminBusy(false);
    }
  }

  async function revokeAdminVipAll() {
    if (!cloudClient || cloudAccount?.is_admin !== true) return;
    if (!globalThis.confirm(t("adminRevokeAllConfirm"))) return;
    setAdminBusy(true);
    setAdminStatus(t("adminSearching"));
    try {
      const { data, error } = await cloudClient.rpc("glowletter_admin_revoke_vip_all");
      if (error) throw error;
      setAdminStatus(t("adminRevokeAllDone").replace("{count}", String(Number(data) || 0)), "success");
      adminAccountResult = null;
      renderAdminResult();
      await loadAdminOverview();
    } catch (error) {
      console.info("Admin mass revoke failed", error);
      setAdminStatus(t("adminError"), "error");
    } finally {
      setAdminBusy(false);
    }
  }

  async function copyAccountSupportId() {
    if (!cloudAccount?.support_id) return;
    await writeClipboard(cloudAccount.support_id);
    showToast(t("accountIdCopied"));
    haptic(10);
  }

  function preferredCloudProvider() {
    return AUTH_PROVIDER_PRIORITY.find(provider => cloudProviders[provider] === true) || "";
  }

  function cloudProviderLabel(provider) {
    const key = AUTH_PROVIDER_LABEL_KEYS[provider];
    return key ? t(key) : t("cloudUnavailable");
  }

  function cloudGuestStatusKey() {
    if (!cloudProviderLookupComplete) return "cloudProvidersChecking";
    if (!cloudProvidersKnown || !preferredCloudProvider()) return navigator.onLine ? "cloudUnavailable" : "cloudOffline";
    return "cloudSignInPrompt";
  }

  function renderCloudAccount() {
    renderSubscriptionCard();
    // Вход на виду: на главном экране, пока человек не вошёл.
    const homeSignIn = $("#homeSignIn");
    if (homeSignIn) homeSignIn.hidden = Boolean(cloudUser?.id) || !cloudClient;
    setText("#homeSignInLabel", t("homeSignIn"));
    const card = $("#accountCard");
    if (!card) return;
    setText("#accountTitle", t("accountTitle"));
    setText("#accountGuestNote", t("accountGuestNote"));
    setText("#accountPrivacyNote", t("accountPrivacy"));
    setText("#googleSignIn span", t("continueGoogle"));
    setText("#appleSignIn span", t("continueApple"));
    const appleArtwork = $("#appleSignInArtwork");
    if (appleArtwork) appleArtwork.src = APPLE_BUTTON_ARTWORK[lang] || APPLE_BUTTON_ARTWORK.en;
    setText("#facebookSignIn span", t("continueFacebook"));
    setText("#accountSignOut", t("signOut"));
    setText("#accountDelete", t("deleteAccount"));
    setText(".account-support-id > span", t("accountSupportLabel"));
    setText("#accountSupportNote", t("accountSupportNote"));
    $("#copyAccountId").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-copy"/></svg> ${escapeHtml(t("accountIdCopy"))}`;
    setText(".admin-panel-heading p", t("adminEyebrow"));
    setText("#adminPanelTitle", t("adminTitle"));
    setText(".admin-panel-description", t("adminDescription"));
    setText(".admin-lookup-form > label", t("adminIdLabel"));
    $("#adminSupportId").placeholder = t("adminIdPlaceholder");
    setText("#adminLookupButton", t("adminFind"));
    setText(".admin-result-summary p:nth-child(2) > span", t("adminCurrentPlan"));
    setText("#adminVipDaysLabel", t("adminDaysLabel"));
    setText("#adminVipDaysUnit", t("adminDaysUnit"));
    setText("#adminVipReasonLabel", t("adminNoticeReasonLabel"));
    setSelectOptions("#adminVipReason", SELECT_OPTIONS.vipNoticeReason[lang]);
    setSelectOptions("#adminBulkReason", SELECT_OPTIONS.vipNoticeReason[lang]);
    setText("#adminVipMessageLabel", t("adminNoticeMessageLabel"));
    $("#adminVipMessage").placeholder = t("adminNoticeMessagePlaceholder");
    setText("#adminVipMessageHint", t("adminNoticeHint"));
    updateAdminVipMessageCount();
    setText("#adminGrantVip", t("adminGrantVip"));
    setText("#adminRevokeVip", t("adminRevoke"));
    setText("#adminLookupHint", t("adminLookupHint")); setText("#adminBulkTitle", t("adminBulkTitle")); setText("#adminBulkNote", t("adminBulkNote"));
    setText("#adminBulkDaysLabel", t("adminDaysLabel")); setText("#adminBulkDaysUnit", t("adminDaysUnit")); setText("#adminBulkReasonLabel", t("adminNoticeReasonLabel")); setText("#adminBulkMessageLabel", t("adminNoticeMessageLabel"));
    const bulkMessage = $("#adminBulkMessage"); if (bulkMessage) bulkMessage.placeholder = t("adminNoticeMessagePlaceholder");
    setText("#adminGrantAll", t("adminGrantAll")); setText("#adminRevokeAll", t("adminRevokeAll")); setText("#adminRecentTitle", t("adminRecentTitle")); setText("#adminRefresh", t("adminRefresh"));
    setText("#adminStatTotalLabel", t("adminStatTotal")); setText("#adminStatVipLabel", t("adminStatVip")); setText("#adminStatForeverLabel", t("adminStatForever")); setText("#adminStatNewLabel", t("adminStatNew"));
    renderAdminOverview();
    const signedIn = Boolean(cloudUser?.id);
    const isAdmin = signedIn && cloudAccount?.is_admin === true;
    const identityReady = signedIn && cloudAccount !== null && !isAdmin;
    const accountStatus = $("#accountStatus");
    const quietSyncedState = signedIn && cloudStatusKey === "cloudSynced";
    const quietGuestState = !signedIn && cloudStatusKey === "cloudSignInPrompt";
    setText("#accountStatus", quietSyncedState || quietGuestState ? "" : t(cloudStatusKey));
    accountStatus.hidden = quietSyncedState || quietGuestState;
    const accountHeading = card.querySelector(".account-heading");
    accountHeading.hidden = quietSyncedState;
    card.dataset.signedIn = String(signedIn);
    card.classList.toggle("is-admin", isAdmin);
    $("#accountPrivacyNote").hidden = signedIn;
    card.dataset.state = cloudStatusKey === "cloudSyncing" || cloudAuthBusy ? "syncing" : cloudStatusKey === "cloudError" || cloudStatusKey === "cloudSignInError" ? "error" : "ready";

    $("#accountGuest").hidden = signedIn;
    $("#accountUser").hidden = !signedIn;
    const google = $("#googleSignIn");
    const apple = $("#appleSignIn");
    const facebook = $("#facebookSignIn");
    google.hidden = signedIn || !cloudProvidersKnown || !cloudProviders.google;
    apple.hidden = signedIn || !cloudProvidersKnown || !cloudProviders.apple;
    facebook.hidden = signedIn || !cloudProvidersKnown || !cloudProviders.facebook;
    google.disabled = cloudAuthBusy;
    apple.disabled = cloudAuthBusy;
    facebook.disabled = cloudAuthBusy;
    $("#accountSignOut").disabled = cloudAuthBusy;
    $("#accountDelete").disabled = cloudAuthBusy;
    // Пароль можно задать прямо здесь: у аккаунтов, заведённых через Google,
    // пароля нет вовсе, и вход «адрес + пароль» у них не работал в принципе.
    const passwordBlock = $("#accountPassword");
    if (passwordBlock) {
      passwordBlock.hidden = !signedIn;
      $("#accountPasswordToggle").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-lock"/></svg> ${escapeHtml(t("accountPasswordToggle"))}`;
      setText("#accountPasswordLabel", t("accountPasswordLabel"));
      setText("#accountPasswordConfirmLabel", t("accountPasswordConfirmLabel"));
      setText("#accountPasswordNote", t("accountPasswordNote"));
      setText("#accountPasswordSubmit", t("accountPasswordSubmit"));
    }
    const support = $("#accountSupport");
    const supportVisible = signedIn && Boolean(cloudAccount?.support_id) && !isAdmin;
    support.hidden = !supportVisible;
    $("#copyAccountId").disabled = !supportVisible;
    setText("#accountSupportId", supportVisible ? cloudAccount.support_id : "—");
    const adminBadge = $("#accountAdminBadge");
    adminBadge.hidden = !isAdmin;
    adminBadge.textContent = t("accountBadgeAdmin");
    const planState = signedIn ? accountPlanState(cloudAccount, { includeNative: true }) : "checking";
    const planBadge = $("#accountPlanBadge");
    planBadge.dataset.plan = planState;
    planBadge.textContent = accountPlanBadgeText(planState);
    setText("#accountPlanStatus", signedIn ? accountPlanText(cloudAccount, { includeNative: true }) : t("accountPlanChecking"));
    $("#accountPlanStatus").hidden = isAdmin;
    $("#accountAvatarButton").hidden = !identityReady;
    card.querySelector(".account-profile-copy > p").hidden = !identityReady;
    const adminPanel = $("#adminPanel");
    adminPanel.hidden = !isAdmin;
    if (isAdmin && !adminOverviewLoaded) loadAdminOverview();
    if (adminPanel.hidden) {
      adminAccountResult = null;
      $("#adminResult").hidden = true;
      setAdminStatus();
    } else {
      renderAdminResult();
    }

    if (identityReady) {
      const email = String(cloudUser.email || "");
      const metadata = cloudUser.user_metadata || {};
      const label = cleanName(metadata.full_name || metadata.name || email.split("@")[0] || "GlowLetter");
      setText("#accountUserName", label || "GlowLetter");
      setText("#accountUserEmail", email);
      setText("#accountAvatar", (label || email || "G").slice(0, 1).toUpperCase());
      const hasLocalAvatar = accountAvatarUserId === cloudUser.id && Boolean(accountAvatarUrl);
      const image = $("#accountAvatarImage");
      image.hidden = !hasLocalAvatar;
      $("#accountAvatar").hidden = hasLocalAvatar;
      $("#accountAvatarButton").setAttribute("aria-label", t("profilePhotoAria"));
    } else {
      setText("#accountUserName", "");
      setText("#accountUserEmail", "");
    }
    renderVipNotifications();
    renderSupportFormState();
  }

  function setSupportStatus(key = "", state = "") {
    const status = $("#supportStatus");
    if (!status) return;
    status.dataset.key = key;
    status.dataset.state = state;
    status.textContent = key ? t(key) : "";
  }

  function updateSupportMessageCount() {
    const message = $("#supportMessage");
    if (!message) return;
    setText("#supportMessageCount", `${message.value.length} / ${SUPPORT_MESSAGE_MAX}`);
  }

  function renderSupportFormState() {
    const form = $("#supportForm");
    const guest = $("#supportGuestState");
    if (!form || !guest) return;
    const signedIn = Boolean(cloudUser?.id);
    const isAdmin = signedIn && cloudAccount?.is_admin === true;
    form.hidden = !signedIn;
    guest.hidden = signedIn;
    setText("#supportEmailValue", signedIn ? String(cloudUser.email || "—") : "—");
    const supportIdVisible = signedIn && Boolean(cloudAccount?.support_id) && !isAdmin;
    $("#supportIdRow").hidden = !supportIdVisible;
    setText("#supportIdValue", supportIdVisible ? cloudAccount.support_id : "—");
    const provider = preferredCloudProvider();
    const signInButton = $("#supportSignInButton");
    signInButton.dataset.provider = provider;
    signInButton.disabled = signedIn || cloudAuthBusy || !cloudProvidersKnown || !provider;
    signInButton.textContent = !cloudProviderLookupComplete
      ? t("cloudProvidersChecking")
      : provider && cloudProvidersKnown
        ? cloudProviderLabel(provider)
        : t(navigator.onLine ? "cloudUnavailable" : "cloudOffline");
    const statusKey = $("#supportStatus")?.dataset.key;
    if (statusKey) setSupportStatus(statusKey, $("#supportStatus").dataset.state || "");
  }

  function openSupportForm() {
    setSupportStatus();
    updateSupportMessageCount();
    renderSupportFormState();
    layers.settings?.setAttribute("inert", "");
    openPanel(layers.support);
  }

  function supportPlatform() {
    if (location.hostname === "appassets.androidplatform.net") return "android";
    if (hasIosBillingBridge || /iPad|iPhone|iPod/u.test(navigator.userAgent)) return "ios";
    return "web";
  }

  async function submitSupportRequest(event) {
    event?.preventDefault();
    if (supportSubmitting) return;
    if (!cloudClient || !cloudUser?.id || !cloudSession?.access_token) {
      setSupportStatus("supportSignInRequired", "error");
      renderSupportFormState();
      return;
    }
    const categoryValue = String($("#supportCategory").value || "");
    const category = SUPPORT_CATEGORIES.has(categoryValue) ? categoryValue : "other";
    const message = String($("#supportMessage").value || "").normalize("NFKC").trim();
    if (message.length < SUPPORT_MESSAGE_MIN || message.length > SUPPORT_MESSAGE_MAX) {
      setSupportStatus("supportInvalid", "error");
      $("#supportMessage").focus();
      return;
    }

    supportSubmitting = true;
    const submit = $("#supportSubmit");
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    setText("#supportSubmitLabel", t("supportSending"));
    setSupportStatus();
    try {
      const { data, error } = await cloudClient.functions.invoke("submit-support", {
        body: {
          category,
          message,
          language: lang,
          app_version: String(CONFIG.appVersion || "web").slice(0, 32),
          platform: supportPlatform()
        }
      });
      if (error) {
        const status = Number(error?.context?.status || 0);
        if (status === 401) setSupportStatus("supportSignInRequired", "error");
        else if (status === 429) setSupportStatus("supportRateLimited", "error");
        else setSupportStatus("supportFailed", "error");
        return;
      }
      if (data?.accepted !== true) {
        setSupportStatus("supportFailed", "error");
        return;
      }
      $("#supportMessage").value = "";
      updateSupportMessageCount();
      const emailSent = data.emailSent === true || data.email_sent === true;
      setSupportStatus(emailSent ? "supportSent" : "supportSaved", "success");
      haptic([12, 28, 12]);
    } catch {
      setSupportStatus("supportFailed", "error");
    } finally {
      supportSubmitting = false;
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
      setText("#supportSubmitLabel", t("supportSubmit"));
    }
  }

  async function detectCloudProviders() {
    if (!cloudClient) return;
    cloudProviderLookupComplete = false;
    if (!cloudUser) setCloudStatus("cloudProvidersChecking");
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
        cache: "no-store"
      });
      if (!response.ok) throw new Error("provider settings unavailable");
      const settings = await response.json();
      cloudProviders = {
        google: settings?.external?.google === true,
        apple: settings?.external?.apple === true,
        facebook: settings?.external?.facebook === true
      };
      cloudProvidersKnown = true;
      cloudProviderLookupComplete = true;
      if (!cloudUser) setCloudStatus(cloudGuestStatusKey()); else renderCloudAccount();
    } catch {
      cloudProvidersKnown = false;
      cloudProviderLookupComplete = true;
      if (!cloudUser) setCloudStatus(cloudGuestStatusKey()); else renderCloudAccount();
    }
    maybePromptGoogleSignIn();
  }

  function cloudProgressState() {
    const entryId = Number(currentEntry()?.id);
    const storedId = Number(localStorage.getItem("nurLetterIndex") || 1);
    const currentLetterId = Number.isInteger(entryId) && entryId >= 1 && entryId <= 50
      ? entryId
      : Math.max(1, Math.min(Number.isFinite(storedId) ? storedId : 1, 50));
    const favoriteIds = [...favorites]
      .map(value => Number(value))
      .filter(value => Number.isInteger(value) && value >= 1 && value <= 50)
      .sort((left, right) => left - right);
    const volume = Math.max(0, Math.min(Number.isFinite(audio.volume) ? audio.volume : .62, 1));
    return {
      schema_version: CLOUD_SCHEMA_VERSION,
      sender_name: cleanName(cloudNames.sender),
      recipient_name: cleanName(cloudNames.recipient),
      language: SUPPORTED_LANGUAGES.includes(lang) ? lang : "en",
      current_letter_id: currentLetterId,
      favorite_ids: favoriteIds,
      rain_enabled: Boolean(rainScene.enabled),
      weather_enabled: Boolean(weatherEnabled && !IS_ANDROID_PLAY_APP),
      built_in_track: Math.max(0, Math.min(Number(cloudBuiltInTrack) || 0, 2)),
      nature_enabled: Boolean(isNaturePlaying || localStorage.getItem("nurNature") === "on"),
      fullscreen_enabled: Boolean(fullscreenActive() || localStorage.getItem(AUTO_FULLSCREEN_KEY) !== "off"),
      volume: Math.round(volume * 1000) / 1000
    };
  }

  function defaultCloudProgressState() {
    return {
      schema_version: CLOUD_SCHEMA_VERSION,
      sender_name: "",
      recipient_name: "",
      language: SUPPORTED_LANGUAGES.includes(lang) ? lang : "en",
      current_letter_id: 1,
      favorite_ids: [],
      rain_enabled: true,
      weather_enabled: false,
      built_in_track: 0,
      nature_enabled: false,
      fullscreen_enabled: true,
      volume: .62
    };
  }

  function normalizeProgressSnapshot(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const defaults = defaultCloudProgressState();
    const number = (key, min, max, fallback) => {
      const candidate = Number(value[key]);
      return Number.isFinite(candidate) ? Math.max(min, Math.min(candidate, max)) : fallback;
    };
    const boolean = key => typeof value[key] === "boolean" ? value[key] : defaults[key];
    const favoriteIds = [...new Set((Array.isArray(value.favorite_ids) ? value.favorite_ids : [])
      .map(item => Number(item))
      .filter(item => Number.isInteger(item) && item >= 1 && item <= 50))]
      .sort((left, right) => left - right);
    return {
      schema_version: CLOUD_SCHEMA_VERSION,
      sender_name: cleanName(value.sender_name),
      recipient_name: cleanName(value.recipient_name),
      language: SUPPORTED_LANGUAGES.includes(value.language) ? value.language : defaults.language,
      current_letter_id: Math.round(number("current_letter_id", 1, 50, defaults.current_letter_id)),
      favorite_ids: favoriteIds,
      rain_enabled: boolean("rain_enabled"),
      weather_enabled: !IS_ANDROID_PLAY_APP && boolean("weather_enabled"),
      built_in_track: Math.round(number("built_in_track", 0, 2, defaults.built_in_track)),
      nature_enabled: boolean("nature_enabled"),
      fullscreen_enabled: boolean("fullscreen_enabled"),
      volume: Math.round(number("volume", 0, 1, defaults.volume) * 1000) / 1000
    };
  }

  function readProgressSnapshot(key) {
    try { return normalizeProgressSnapshot(JSON.parse(localStorage.getItem(key) || "null")); }
    catch { return null; }
  }

  function writeProgressSnapshot(key, state) {
    const normalized = normalizeProgressSnapshot(state);
    if (!normalized) return null;
    try { localStorage.setItem(key, JSON.stringify(normalized)); }
    catch { return null; }
    return normalized;
  }

  function userSnapshotKey(userId) {
    return `${CLOUD_USER_SNAPSHOT_PREFIX}${encodeURIComponent(String(userId || ""))}`;
  }

  function userEnvelopeKey(userId) {
    return `${CLOUD_USER_ENVELOPE_PREFIX}${encodeURIComponent(String(userId || ""))}`;
  }

  function cloudStateEquals(left, right) {
    return cloudProgressSignature(normalizeProgressSnapshot(left)) === cloudProgressSignature(normalizeProgressSnapshot(right));
  }

  function nextEnvelopeVersion(value) {
    const current = Number.isSafeInteger(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
    return current >= Number.MAX_SAFE_INTEGER - 1 ? 1 : current + 1;
  }

  function normalizeCloudRevision(value) {
    const revision = Number(value);
    return Number.isSafeInteger(revision) && revision >= 0 ? revision : 0;
  }

  function normalizeProgressEnvelope(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const state = normalizeProgressSnapshot(value.state);
    const baseState = normalizeProgressSnapshot(value.baseState);
    if (!state || !baseState || typeof value.dirty !== "boolean") return null;
    const revision = Number(value.baseRevision);
    const version = Number(value.version);
    const dirtyAt = Number(value.dirtyAt);
    return {
      state,
      baseState,
      baseRevision: normalizeCloudRevision(revision),
      dirty: value.dirty,
      version: Number.isSafeInteger(version) && version >= 0 ? version : 0,
      dirtyAt: Number.isFinite(dirtyAt) && dirtyAt >= 0 && dirtyAt <= 8640000000000000 ? Math.round(dirtyAt) : 0
    };
  }

  function readProgressEnvelope(userId) {
    if (!userId) return null;
    try { return normalizeProgressEnvelope(JSON.parse(localStorage.getItem(userEnvelopeKey(userId)) || "null")); }
    catch { return null; }
  }

  function writeProgressEnvelope(userId, envelope) {
    if (!userId) return null;
    const normalized = normalizeProgressEnvelope(envelope);
    if (!normalized) return null;
    try { localStorage.setItem(userEnvelopeKey(userId), JSON.stringify(normalized)); }
    catch { return null; }
    return normalized;
  }

  function mergeProgressStates(localState, baseState, remoteState) {
    const local = normalizeProgressSnapshot(localState) || defaultCloudProgressState();
    const base = normalizeProgressSnapshot(baseState) || defaultCloudProgressState();
    const remote = normalizeProgressSnapshot(remoteState) || defaultCloudProgressState();
    const merged = {};
    Object.keys(defaultCloudProgressState()).forEach(key => {
      const localChanged = JSON.stringify(local[key]) !== JSON.stringify(base[key]);
      merged[key] = localChanged ? local[key] : remote[key];
    });
    return normalizeProgressSnapshot(merged) || defaultCloudProgressState();
  }

  function captureGuestBootstrap() {
    if (localStorage.getItem(CLOUD_EVER_AUTHENTICATED_KEY) === "1") return null;
    const state = cloudProgressState();
    state.sender_name = linkNamesActive ? cleanName(localStorage.getItem("nurFrom")) : cleanName(fromName);
    state.recipient_name = linkNamesActive ? cleanName(localStorage.getItem("nurTo")) : cleanName(toName);
    return writeProgressSnapshot(CLOUD_GUEST_SNAPSHOT_KEY, state);
  }

  function saveUserProgressSnapshot(userId, state = cloudProgressState()) {
    if (!userId) return null;
    return writeProgressSnapshot(userSnapshotKey(userId), state);
  }

  function dirtyProgressEnvelope(userId, state = cloudProgressState()) {
    if (!userId) return null;
    const normalizedState = normalizeProgressSnapshot(state) || defaultCloudProgressState();
    const existing = readProgressEnvelope(userId);
    if (existing && existing.dirty && cloudStateEquals(existing.state, normalizedState)) {
      saveUserProgressSnapshot(userId, normalizedState);
      return existing;
    }
    if (existing && !existing.dirty && cloudStateEquals(existing.state, normalizedState)) {
      saveUserProgressSnapshot(userId, normalizedState);
      return existing;
    }
    const fallbackBase = cloudBootstrapUserId === userId && cloudBootstrapState
      ? cloudBootstrapState
      : (readProgressSnapshot(userSnapshotKey(userId)) || defaultCloudProgressState());
    const envelope = writeProgressEnvelope(userId, {
      state: normalizedState,
      baseState: existing?.baseState || fallbackBase,
      baseRevision: existing?.baseRevision ?? (cloudLoadedUserId === userId ? cloudRevision : 0),
      dirty: true,
      version: nextEnvelopeVersion(existing?.version),
      dirtyAt: Date.now()
    });
    saveUserProgressSnapshot(userId, normalizedState);
    return envelope;
  }

  function cleanProgressEnvelope(userId, state, revision, version = 0) {
    const normalizedState = normalizeProgressSnapshot(state) || defaultCloudProgressState();
    const envelope = writeProgressEnvelope(userId, {
      state: normalizedState,
      baseState: normalizedState,
      baseRevision: normalizeCloudRevision(revision),
      dirty: false,
      version: Number.isSafeInteger(Number(version)) && Number(version) >= 0 ? Number(version) : 0,
      dirtyAt: 0
    });
    saveUserProgressSnapshot(userId, normalizedState);
    return envelope;
  }

  function bootstrapStateForUser(userId) {
    const envelope = readProgressEnvelope(userId);
    if (envelope) return envelope.state;
    const ownSnapshot = readProgressSnapshot(userSnapshotKey(userId));
    if (ownSnapshot) return ownSnapshot;
    const guestSnapshot = readProgressSnapshot(CLOUD_GUEST_SNAPSHOT_KEY);
    const guestOwner = localStorage.getItem(CLOUD_GUEST_OWNER_KEY) || "";
    const authenticatedBefore = localStorage.getItem(CLOUD_EVER_AUTHENTICATED_KEY) === "1";
    if (guestSnapshot && (guestOwner === userId || (!authenticatedBefore && !guestOwner))) {
      if (!guestOwner) localStorage.setItem(CLOUD_GUEST_OWNER_KEY, userId);
      return guestSnapshot;
    }
    return defaultCloudProgressState();
  }

  function guestViewState() {
    if (localStorage.getItem(CLOUD_EVER_AUTHENTICATED_KEY) !== "1") {
      return captureGuestBootstrap() || defaultCloudProgressState();
    }
    return readProgressSnapshot(CLOUD_GUEST_SNAPSHOT_KEY) || defaultCloudProgressState();
  }

  function applyIsolatedProgress(state) {
    const normalized = normalizeProgressSnapshot(state) || defaultCloudProgressState();
    cloudNamesExplicitlySaved = false;
    cloudNames = { sender: normalized.sender_name, recipient: normalized.recipient_name };
    applyCloudProgress(normalized);
    if (linkNamesActive && initialLinkNames) {
      if (normalized.sender_name) localStorage.setItem("nurFrom", normalized.sender_name); else localStorage.removeItem("nurFrom");
      if (normalized.recipient_name) localStorage.setItem("nurTo", normalized.recipient_name); else localStorage.removeItem("nurTo");
      setNames(initialLinkNames.sender, initialLinkNames.recipient, { persist: false });
    }
    return normalized;
  }

  function cloudProgressSignature(state = cloudProgressState()) {
    return JSON.stringify(state);
  }

  function scheduleCloudSync({ includeNames = false, immediate = false } = {}) {
    if (includeNames) {
      cloudNames = { sender: fromName, recipient: toName };
      cloudNamesExplicitlySaved = true;
    }
    if (cloudHydrating) return;
    if (!cloudUser?.id) {
      captureGuestBootstrap();
      return;
    }
    const envelope = dirtyProgressEnvelope(cloudUser.id);
    if (!cloudReady || !envelope?.dirty) return;
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(() => flushCloudSync(false), immediate ? 0 : CLOUD_SYNC_DELAY);
  }

  async function fetchCloudProgressRow(userId) {
    return cloudClient
      .from(CLOUD_TABLE)
      .select(CLOUD_SELECT_COLUMNS)
      .eq("user_id", userId)
      .maybeSingle();
  }

  function isUniqueRevisionConflict(error) {
    return String(error?.code || "") === "23505";
  }

  async function writeCloudProgressCas(userId, envelope, rowExists) {
    const baseRevision = normalizeCloudRevision(envelope.baseRevision);
    if (baseRevision >= Number.MAX_SAFE_INTEGER) throw new Error("cloud revision exhausted");
    const nextRevision = baseRevision + 1;
    const payload = {
      user_id: userId,
      ...envelope.state,
      revision: nextRevision,
      updated_at: new Date().toISOString()
    };
    let result;
    if (rowExists) {
      result = await cloudClient
        .from(CLOUD_TABLE)
        .update(payload)
        .eq("user_id", userId)
        .eq("revision", envelope.baseRevision)
        .select("revision,updated_at")
        .maybeSingle();
    } else {
      result = await cloudClient
        .from(CLOUD_TABLE)
        .insert(payload)
        .select("revision,updated_at")
        .maybeSingle();
    }
    if (result.error) {
      if (!rowExists && isUniqueRevisionConflict(result.error)) return { conflict: true };
      throw result.error;
    }
    if (!result.data) return { conflict: true };
    return {
      conflict: false,
      revision: Math.max(nextRevision, normalizeCloudRevision(result.data.revision)),
      updatedAt: String(result.data.updated_at || payload.updated_at)
    };
  }

  function persistConflictMerge(userId, latestEnvelope, remoteState, remoteRevision, rowExists) {
    const mergedState = mergeProgressStates(latestEnvelope.state, latestEnvelope.baseState, remoteState);
    const dirty = rowExists ? !cloudStateEquals(mergedState, remoteState) : true;
    const mergedEnvelope = writeProgressEnvelope(userId, {
      state: mergedState,
      baseState: remoteState,
      baseRevision: remoteRevision,
      dirty,
      version: nextEnvelopeVersion(latestEnvelope.version),
      dirtyAt: dirty ? (latestEnvelope.dirtyAt || Date.now()) : 0
    });
    saveUserProgressSnapshot(userId, mergedState);
    return mergedEnvelope;
  }

  function acknowledgeCloudWrite(userId, sentEnvelope, result) {
    const latest = readProgressEnvelope(userId) || sentEnvelope;
    if (latest.baseRevision > result.revision) return { pending: latest.dirty, envelope: latest };
    const unchanged = latest.version === sentEnvelope.version && cloudStateEquals(latest.state, sentEnvelope.state);
    let nextEnvelope;
    if (unchanged) {
      nextEnvelope = cleanProgressEnvelope(userId, sentEnvelope.state, result.revision, latest.version);
    } else {
      nextEnvelope = writeProgressEnvelope(userId, {
        state: latest.state,
        baseState: sentEnvelope.state,
        baseRevision: result.revision,
        dirty: true,
        version: latest.version,
        dirtyAt: latest.dirtyAt || Date.now()
      });
      saveUserProgressSnapshot(userId, latest.state);
    }
    if (!nextEnvelope) return { pending: true, envelope: latest, persistFailed: true };
    localStorage.setItem(`nurCloudRevision:${userId}`, String(result.revision));
    if (result.updatedAt) localStorage.setItem(`nurCloudUpdatedAt:${userId}`, result.updatedAt);
    return { pending: Boolean(nextEnvelope?.dirty), envelope: nextEnvelope };
  }

  async function flushCloudSync(force = false) {
    if (!cloudClient || !cloudReady || !cloudUser?.id || !cloudSession?.access_token) return false;
    if (cloudSyncing) {
      cloudSyncQueued = true;
      return false;
    }
    const userId = cloudUser.id;
    let envelope = readProgressEnvelope(userId);
    if (force && (!envelope || (!envelope.dirty && !cloudStateEquals(envelope.state, cloudProgressState())))) {
      envelope = dirtyProgressEnvelope(userId);
    }
    if (!envelope?.dirty) return true;

    cloudSyncing = true;
    cloudSyncQueued = false;
    setCloudStatus("cloudSyncing");
    try {
      let rowExists = cloudRowExists;
      for (let attempt = 0; attempt < CLOUD_MAX_WRITE_ATTEMPTS; attempt += 1) {
        envelope = readProgressEnvelope(userId) || envelope;
        if (!envelope?.dirty) return true;
        const sentEnvelope = envelope;
        const result = await writeCloudProgressCas(userId, sentEnvelope, rowExists);
        if (!result.conflict) {
          const acknowledged = acknowledgeCloudWrite(userId, sentEnvelope, result);
          if (acknowledged.persistFailed) throw new Error("progress envelope unavailable");
          if (cloudUser?.id === userId) {
            cloudRevision = result.revision;
            cloudRowExists = true;
            cloudLastSignature = cloudProgressSignature(sentEnvelope.state);
            if (!acknowledged.pending) {
              cloudNamesExplicitlySaved = false;
              setCloudStatus("cloudSynced");
            } else {
              cloudSyncQueued = true;
              setCloudStatus("cloudSyncing");
            }
          }
          return !acknowledged.pending;
        }

        const { data: remoteRow, error: remoteError } = await fetchCloudProgressRow(userId);
        if (remoteError) throw remoteError;
        rowExists = Boolean(remoteRow);
        const remoteState = remoteRow ? normalizeProgressSnapshot(remoteRow) : defaultCloudProgressState();
        const remoteRevision = remoteRow ? normalizeCloudRevision(remoteRow.revision) : 0;
        const latestEnvelope = readProgressEnvelope(userId) || sentEnvelope;
        envelope = persistConflictMerge(userId, latestEnvelope, remoteState, remoteRevision, rowExists);
        if (!envelope) throw new Error("progress envelope unavailable");
        if (cloudUser?.id === userId) {
          cloudRevision = remoteRevision;
          cloudRowExists = rowExists;
          applyIsolatedProgress(envelope.state);
        }
        if (!envelope.dirty) {
          localStorage.setItem(`nurCloudRevision:${userId}`, String(remoteRevision));
          if (remoteRow?.updated_at) localStorage.setItem(`nurCloudUpdatedAt:${userId}`, String(remoteRow.updated_at));
          if (cloudUser?.id === userId) setCloudStatus("cloudSynced");
          return true;
        }
      }
      if (cloudUser?.id === userId) setCloudStatus("cloudError");
      return false;
    } catch {
      if (cloudUser?.id === userId) setCloudStatus(navigator.onLine ? "cloudError" : "cloudOffline");
      return false;
    } finally {
      cloudSyncing = false;
      if (cloudSyncQueued) {
        cloudSyncQueued = false;
        if (cloudUser?.id && cloudReady) {
          clearTimeout(cloudSyncTimer);
          cloudSyncTimer = setTimeout(() => flushCloudSync(false), 0);
        }
      }
    }
  }

  function applyCloudProgress(row) {
    cloudHydrating = true;
    try {
      const remoteNames = {
        sender: cleanName(row.sender_name),
        recipient: cleanName(row.recipient_name)
      };
      if (!cloudNamesExplicitlySaved) cloudNames = remoteNames;
      if (!linkNamesActive && !cloudNamesExplicitlySaved) setNames(remoteNames.sender, remoteNames.recipient, { explicit: false });

      lang = SUPPORTED_LANGUAGES.includes(row.language) && UI[row.language] ? row.language : lang;
      localStorage.setItem("nurLanguage", lang);

      const remoteLetterId = Math.max(1, Math.min(Number(row.current_letter_id) || 1, 50));
      if (!sharedMessage) {
        const remoteIndex = letterDeck.findIndex(item => Number(item.id) === remoteLetterId);
        if (remoteIndex >= 0) currentIndex = remoteIndex;
      }
      localStorage.setItem("nurLetterIndex", String(remoteLetterId));

      favorites = new Set((Array.isArray(row.favorite_ids) ? row.favorite_ids : [])
        .map(value => Number(value))
        .filter(value => Number.isInteger(value) && value >= 1 && value <= 50)
        .map(String));
      localStorage.setItem("nurFavorites", JSON.stringify([...favorites]));

      rainScene.setEnabled(row.rain_enabled !== false, false);
      localStorage.setItem("nurRain", rainScene.enabled ? "on" : "off");
      weatherEnabled = !IS_ANDROID_PLAY_APP && row.weather_enabled === true;
      localStorage.setItem("nurWeather", weatherEnabled ? "on" : "off");

      // Kept only for backward compatibility with cloud schema v1.
      cloudBuiltInTrack = 0;

      const remoteNature = row.nature_enabled === true;
      localStorage.setItem("nurNature", remoteNature ? "on" : "off");
      if (!remoteNature && isNaturePlaying) setNaturePlaying(false, false);
      localStorage.setItem("nurFullscreen", row.fullscreen_enabled === true ? "on" : "off");

      const volume = Math.max(0, Math.min(Number(row.volume), 1));
      audio.volume = Number.isFinite(volume) ? volume : .62;
      localStorage.setItem("nurVolume", String(audio.volume));

      renderAudioControls();
      applyLanguage();
      if(weatherEnabled)setTimeout(()=>refreshWeather({silent:true}),0);else renderWeather();
      if (storyOpened) renderLetter();
      renderLibrary();

      const remoteSignatureState = cloudProgressState();
      remoteSignatureState.sender_name = remoteNames.sender;
      remoteSignatureState.recipient_name = remoteNames.recipient;
      cloudLastSignature = cloudProgressSignature(remoteSignatureState);
    } finally {
      cloudHydrating = false;
    }
  }

  async function loadCloudProgress(user) {
    const userId = user?.id || "";
    if (!userId || !cloudClient || cloudLoadingUserId === userId) return;
    cloudLoadingUserId = userId;
    const generation = ++cloudLoadGeneration;
    cloudReady = false;
    setCloudStatus("cloudChecking");
    try {
      const { data, error } = await fetchCloudProgressRow(userId);
      if (error) throw error;
      if (generation !== cloudLoadGeneration || cloudUser?.id !== userId) return;

      const existingEnvelope = readProgressEnvelope(userId);
      if (data) {
        const knownRevision = normalizeCloudRevision(localStorage.getItem(`nurCloudRevision:${userId}`));
        const remoteRevision = normalizeCloudRevision(data.revision);
        const remoteState = normalizeProgressSnapshot(data) || defaultCloudProgressState();
        const envelope = existingEnvelope?.dirty
          ? persistConflictMerge(userId, existingEnvelope, remoteState, remoteRevision, true)
          : cleanProgressEnvelope(userId, remoteState, remoteRevision, existingEnvelope?.version || 0);
        if (!envelope) throw new Error("progress envelope unavailable");
        cloudRevision = remoteRevision;
        cloudRowExists = true;
        applyIsolatedProgress(envelope.state);
        cloudBootstrapState = null;
        cloudBootstrapUserId = "";
        localStorage.setItem(`nurCloudRevision:${userId}`, String(remoteRevision));
        if (data.updated_at) localStorage.setItem(`nurCloudUpdatedAt:${userId}`, String(data.updated_at));
        if (remoteRevision < knownRevision) localStorage.setItem(`nurCloudRevisionReset:${userId}`, "seen");
        cloudReady = true;
        cloudLoadedUserId = userId;
        if (envelope.dirty) await flushCloudSync(false);
        else setCloudStatus("cloudSynced");
      } else {
        const bootstrap = existingEnvelope?.state || (cloudBootstrapUserId === userId && cloudBootstrapState
          ? cloudBootstrapState
          : bootstrapStateForUser(userId));
        const normalizedBootstrap = normalizeProgressSnapshot(bootstrap) || defaultCloudProgressState();
        const envelope = writeProgressEnvelope(userId, {
          state: normalizedBootstrap,
          baseState: defaultCloudProgressState(),
          baseRevision: 0,
          dirty: true,
          version: nextEnvelopeVersion(existingEnvelope?.version),
          dirtyAt: existingEnvelope?.dirtyAt || Date.now()
        });
        if (!envelope) throw new Error("progress envelope unavailable");
        saveUserProgressSnapshot(userId, normalizedBootstrap);
        applyIsolatedProgress(normalizedBootstrap);
        cloudRevision = 0;
        cloudRowExists = false;
        cloudLastSignature = "";
        cloudReady = true;
        cloudLoadedUserId = userId;
        cloudBootstrapState = null;
        cloudBootstrapUserId = "";
        await flushCloudSync(true);
      }
    } catch {
      if (generation === cloudLoadGeneration) {
        cloudReady = false;
        setCloudStatus(navigator.onLine ? "cloudError" : "cloudOffline");
      }
    } finally {
      if (cloudLoadingUserId === userId) cloudLoadingUserId = "";
    }
  }

  function syncNativeBillingAuth(session = cloudSession) {
    const accessToken = typeof session?.access_token === "string" ? session.access_token.trim() : "";
    if (!IS_ANDROID_PLAY_APP) return Boolean(accessToken);
    if (!trustedEntitlementSource || typeof window.NurBilling?.setAuthSession !== "function") return false;
    try {
      // The token stays in native memory; no raw user id is used as proof of identity.
      window.NurBilling.setAuthSession(accessToken);
      return Boolean(accessToken);
    } catch (error) {
      console.info("Native billing session bridge not ready", error);
      return false;
    }
  }

  async function handleCloudSession(session) {
    const previousUserId = cloudUser?.id || "";
    const nextUser = session?.user || null;
    if (previousUserId && previousUserId !== nextUser?.id) saveUserProgressSnapshot(previousUserId);
    cloudSession = session || null;
    syncNativeBillingAuth(cloudSession);
    cloudUser = nextUser;
    if (previousUserId !== (cloudUser?.id || "")) {
      resetCloudAccount();
      clearAccountAvatarPreview();
      if (cloudUser?.id) loadAccountAvatar(cloudUser.id);
    }
    renderCloudAccount();
    dispatchEvent(new CustomEvent("glowletter-cloud-session", { detail: {
      signedIn: Boolean(cloudUser?.id),
      userId: cloudUser?.id || "",
      email: cloudUser?.email || ""
    } }));
    if (cloudUser?.id) resumePurchaseAfterSignIn();
    if (!cloudUser?.id) {
      resetCloudAccount();
      clearTimeout(cloudSyncTimer);
      cloudLoadGeneration += 1;
      cloudSyncQueued = false;
      cloudReady = false;
      cloudLoadedUserId = "";
      cloudLoadingUserId = "";
      cloudRevision = 0;
      cloudRowExists = false;
      cloudLastSignature = "";
      cloudBootstrapState = null;
      cloudBootstrapUserId = "";
      cloudNamesExplicitlySaved = false;
      applyIsolatedProgress(guestViewState());
      setCloudStatus(cloudGuestStatusKey());
      return;
    }
    if (cloudLoadedUserId === cloudUser.id && cloudReady) {
      try { await loadCloudAccount(cloudUser); }
      catch (error) { console.info("Cloud account refresh failed", error); }
      setCloudStatus("cloudSynced");
      return;
    }
    if (cloudLoadingUserId === cloudUser.id) return;
    clearTimeout(cloudSyncTimer);
    cloudReady = false;
    cloudLoadedUserId = "";
    cloudRowExists = false;
    cloudNamesExplicitlySaved = false;
    cloudBootstrapState = bootstrapStateForUser(cloudUser.id);
    cloudBootstrapUserId = cloudUser.id;
    cloudRevision = readProgressEnvelope(cloudUser.id)?.baseRevision || 0;
    localStorage.setItem(CLOUD_EVER_AUTHENTICATED_KEY, "1");
    applyIsolatedProgress(cloudBootstrapState);
    try { await loadCloudAccount(cloudUser); }
    catch (error) {
      console.info("Cloud account load failed", error);
      cloudAccount = null;
      cloudPremium = false;
      applyEffectivePremium("cloud_account_error");
    }
    await loadCloudProgress(cloudUser);
  }

  async function exchangeCloudAuthCallback(rawUrl) {
    if (!cloudClient) return;
    const callback = authCallbackDetails(rawUrl);
    if (!isAcceptedAuthCallback(callback.url)) return;
    try { delete window.__nurPendingAuthCallback; } catch { window.__nurPendingAuthCallback = ""; }
    if (callback.error) {
      setCloudStatus("cloudSignInError");
      showToast(t("cloudSignInError"), 3800);
      return;
    }
    if (!callback.code || handledAuthCodes.has(callback.code)) return;
    handledAuthCodes.add(callback.code);
    cloudAuthBusy = true;
    setCloudStatus("cloudChecking");
    try {
      const { data, error } = await cloudClient.auth.exchangeCodeForSession(callback.code);
      if (error) throw error;
      await handleCloudSession(data?.session || null);
      announceSignedInAccount();
    } catch {
      setCloudStatus("cloudSignInError");
      showToast(t("cloudSignInError"), 3800);
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function signInWithCloud(provider) {
    if (!cloudClient || !cloudProvidersKnown || cloudProviders[provider] !== true || cloudAuthBusy) return;
    captureGuestBootstrap();
    cloudAuthBusy = true;
    setCloudStatus("cloudSigningIn");
    try {
      // Google always shows its account chooser: the phone's browser may already
      // hold another account, and a silent sign-in with it looked like a
      // privilege bug (every account "became" the owner).
      const queryParams = provider === "google" ? { prompt: "select_account" } : undefined;
      const { data, error } = await cloudClient.auth.signInWithOAuth({
        provider,
        options: { redirectTo: cloudRedirectUrl(), skipBrowserRedirect: true, queryParams }
      });
      if (error || !data?.url) throw error || new Error("missing authorization URL");
      const authorizeUrl = new URL(data.url);
      if (authorizeUrl.origin !== SUPABASE_URL) throw new Error("unexpected authorization origin");
      const bridge = nativeAuthBridge();
      if (bridge) {
        bridge.openAuthorizeUrl(authorizeUrl.toString());
        cloudAuthBusy = false;
        renderCloudAccount();
      } else {
        location.assign(authorizeUrl.toString());
      }
    } catch {
      cloudAuthBusy = false;
      setCloudStatus("cloudSignInError");
      showToast(t("cloudSignInError"), 3800);
    }
  }

  // «Продолжить с Google» аккаунтом телефона (Android): Google выдаёт ID-токен,
  // Supabase обменивает его на сессию. Сам nonce живёт только здесь, в натив
  // уходит его SHA-256. В браузере остаётся обычный вход через страницу Google.
  const GOOGLE_PROMPT_KEY = "nurGoogleSignInPromptV1";
  const GOOGLE_PROMPT_INTERVAL = 3 * 24 * 60 * 60 * 1000;
  let googleNonce = "";
  let googleSignInPending = false;
  let googleSignInAutomatic = false;
  let googleSignInOrigin = "";
  let googleAutoPromptArmed = false;
  let purchaseAfterSignIn = "";

  function nativeGoogleSignInAvailable() {
    return IS_ANDROID_PLAY_APP && typeof window.NurAuth?.signInWithGoogle === "function";
  }

  async function sha256Hex(value) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  async function signInWithGoogle({ automatic = false, origin = "" } = {}) {
    if (!nativeGoogleSignInAvailable()) {
      if (!automatic) signInWithCloud("google");
      return;
    }
    if (!cloudClient || googleSignInPending || cloudAuthBusy || cloudUser?.id) return;
    const raw = new Uint8Array(32);
    crypto.getRandomValues(raw);
    googleNonce = [...raw].map(byte => byte.toString(16).padStart(2, "0")).join("");
    googleSignInPending = true;
    googleSignInAutomatic = automatic;
    googleSignInOrigin = origin;
    try {
      window.NurAuth.signInWithGoogle(await sha256Hex(googleNonce), automatic);
    } catch {
      googleSignInPending = false;
      googleNonce = "";
      if (!automatic) signInWithCloud("google");
    }
  }

  window.onNativeGoogleCredential = async detail => {
    if (!googleSignInPending || !IS_ANDROID_PLAY_APP) return;
    const automatic = googleSignInAutomatic;
    const origin = googleSignInOrigin;
    const nonce = googleNonce;
    googleSignInPending = false;
    googleNonce = "";
    const status = String(detail?.status || "");
    if (status !== "success" || !detail?.idToken) {
      // Отказ человека уважаем; сбой в ручном входе ведём на страницу Google.
      if (!automatic && status !== "canceled") signInWithCloud("google");
      if (status === "canceled") purchaseAfterSignIn = "";
      // С главного экрана после отказа показываем другие способы входа.
      if (status === "canceled" && origin === "home") openAccountSection();
      return;
    }
    captureGuestBootstrap();
    cloudAuthBusy = true;
    setCloudStatus("cloudSigningIn");
    renderCloudAccount();
    try {
      const { data, error } = await cloudClient.auth.signInWithIdToken({ provider: "google", token: detail.idToken, nonce });
      if (error || !data?.session) throw error || new Error("missing_session");
      await handleCloudSession(data.session);
      announceSignedInAccount();
    } catch (error) {
      console.info("Google sign-in failed", error);
      purchaseAfterSignIn = "";
      setCloudStatus("cloudSignInError");
      if (!automatic) showToast(t("cloudSignInError"), 3800);
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  };

  // Первый запуск и переустановка: аккаунт, которым уже входили, входит сам,
  // иначе Google предлагает аккаунты телефона. Не чаще раза в три дня.
  function scheduleGoogleSignInPrompt() {
    googleAutoPromptArmed = true;
    maybePromptGoogleSignIn();
  }

  function maybePromptGoogleSignIn() {
    if (!googleAutoPromptArmed || !cloudProviderLookupComplete) return;
    googleAutoPromptArmed = false;
    if (!nativeGoogleSignInAvailable() || cloudUser?.id || cloudProviders.google !== true) return;
    let last = 0;
    try { last = Number(localStorage.getItem(GOOGLE_PROMPT_KEY)) || 0; } catch { /* storage can be unavailable */ }
    if (Date.now() - last < GOOGLE_PROMPT_INTERVAL) return;
    try { localStorage.setItem(GOOGLE_PROMPT_KEY, String(Date.now())); } catch { /* prompt once this session */ }
    setTimeout(() => { if (!cloudUser?.id) signInWithGoogle({ automatic: true }); }, 1200);
  }

  // Which account just signed in, by address: a wrong account is visible at once.
  function announceSignedInAccount() {
    const email = String(cloudUser?.email || "").trim();
    showToast(email ? t("signedInAs").replace("{email}", () => email) : t("googleSignedIn"), 4200);
  }

  // Вход по просьбе экрана: Google на телефоне, иначе раздел аккаунта.
  function requestSignIn(origin = "home") {
    if (nativeGoogleSignInAvailable() && cloudProviders.google === true) signInWithGoogle({ origin });
    else openAccountSection();
  }

  function openAccountSection() {
    $("#settingsButton").click();
    const section = $("#settingsAccountTitle")?.closest("details");
    if (section) section.open = true;
    requestAnimationFrame(() => $("#accountCard")?.scrollIntoView({ block: "start", behavior: REDUCED_MOTION.matches ? "auto" : "smooth" }));
  }

  // Покупка требует входа: вместо тоста сразу предлагаем войти, а после входа
  // окно оплаты Google Play открывается само.
  function requestSignInForPurchase(kind) {
    purchaseAfterSignIn = kind === "yearly" ? "yearly" : "monthly";
    showToast(t("signInToBuy"), 4300);
    if (nativeGoogleSignInAvailable() && cloudProviders.google === true) {
      signInWithGoogle();
      return;
    }
    closePaywall();
    openAccountSection();
  }

  function resumePurchaseAfterSignIn() {
    const kind = purchaseAfterSignIn;
    if (!kind || !cloudSession?.access_token) return;
    purchaseAfterSignIn = "";
    setTimeout(() => (kind === "yearly" ? purchaseYearly() : purchaseFullAccess()), 600);
  }

  function normalizedAuthEmail(value) {
    const email = String(value || "").normalize("NFKC").trim().toLowerCase();
    if (email.length < 3 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
      throw new Error("invalid_email");
    }
    return email;
  }

  async function signInWithPassword(email, password) {
    if (!cloudClient || cloudAuthBusy) throw new Error("auth_unavailable");
    const normalizedEmail = normalizedAuthEmail(email);
    if (typeof password !== "string" || password.length < 8 || password.length > 128) throw new Error("invalid_password");
    captureGuestBootstrap();
    cloudAuthBusy = true;
    setCloudStatus("cloudChecking");
    renderCloudAccount();
    try {
      const { data, error } = await cloudClient.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error || !data?.session) throw error || new Error("missing_session");
      await handleCloudSession(data.session);
      return { session: data.session, user: data.user || data.session.user };
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function registerEmail(email, password, name = "") {
    if (!cloudClient || cloudAuthBusy) throw new Error("auth_unavailable");
    const normalizedEmail = normalizedAuthEmail(email);
    const safeName = String(name || "").normalize("NFKC").replace(/[<>\r\n]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, 60);
    if (typeof password !== "string" || password.length < 8 || password.length > 128 || !/[\p{L}]/u.test(password) || !/\d/u.test(password)) {
      throw new Error("invalid_password");
    }
    captureGuestBootstrap();
    cloudAuthBusy = true;
    setCloudStatus("cloudChecking");
    renderCloudAccount();
    try {
      const { data, error } = await cloudClient.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: safeName ? { full_name: safeName } : {},
          emailRedirectTo: cloudRedirectUrl()
        }
      });
      if (error) throw error;
      if (data?.session) await handleCloudSession(data.session);
      return { session: data?.session || null, user: data?.user || null };
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function verifyEmailCode(email, token) {
    if (!cloudClient || cloudAuthBusy) throw new Error("auth_unavailable");
    const normalizedEmail = normalizedAuthEmail(email);
    const normalizedToken = String(token || "").replace(/\D/gu, "").slice(0, 6);
    if (normalizedToken.length !== 6) throw new Error("invalid_code");
    cloudAuthBusy = true;
    setCloudStatus("cloudChecking");
    renderCloudAccount();
    try {
      const { data, error } = await cloudClient.auth.verifyOtp({ email: normalizedEmail, token: normalizedToken, type: "email" });
      if (error || !data?.session) throw error || new Error("missing_session");
      await handleCloudSession(data.session);
      return { session: data.session, user: data.user || data.session.user };
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function sendLoginCode(email) {
    if (!cloudClient || cloudAuthBusy) throw new Error("auth_unavailable");
    const normalizedEmail = normalizedAuthEmail(email);
    captureGuestBootstrap();
    cloudAuthBusy = true;
    renderCloudAccount();
    try {
      const { error } = await cloudClient.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: false, emailRedirectTo: cloudRedirectUrl() }
      });
      if (error) throw error;
      return true;
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function verifyLoginCode(email, token) {
    if (!cloudClient || cloudAuthBusy) throw new Error("auth_unavailable");
    const normalizedEmail = normalizedAuthEmail(email);
    const normalizedToken = String(token || "").replace(/\D/gu, "").slice(0, 6);
    if (normalizedToken.length !== 6) throw new Error("invalid_code");
    cloudAuthBusy = true;
    setCloudStatus("cloudChecking");
    renderCloudAccount();
    try {
      const { data, error } = await cloudClient.auth.verifyOtp({ email: normalizedEmail, token: normalizedToken, type: "email" });
      if (error || !data?.session) throw error || new Error("missing_session");
      await handleCloudSession(data.session);
      return { session: data.session, user: data.user || data.session.user };
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function sendPasswordResetCode(email) {
    if (!cloudClient || cloudAuthBusy) throw new Error("auth_unavailable");
    const normalizedEmail = normalizedAuthEmail(email);
    cloudAuthBusy = true;
    renderCloudAccount();
    try {
      const { error } = await cloudClient.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: cloudRedirectUrl() });
      if (error) throw error;
      return true;
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function verifyPasswordResetCode(email, token) {
    if (!cloudClient || cloudAuthBusy) throw new Error("auth_unavailable");
    const normalizedEmail = normalizedAuthEmail(email);
    const normalizedToken = String(token || "").replace(/\D/gu, "").slice(0, 6);
    if (normalizedToken.length !== 6) throw new Error("invalid_code");
    cloudAuthBusy = true;
    setCloudStatus("cloudChecking");
    renderCloudAccount();
    try {
      const { data, error } = await cloudClient.auth.verifyOtp({ email: normalizedEmail, token: normalizedToken, type: "recovery" });
      if (error || !data?.session) throw error || new Error("missing_session");
      await handleCloudSession(data.session);
      return { session: data.session, user: data.user || data.session.user };
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function updateAccountPassword(password) {
    if (!cloudClient || cloudAuthBusy) throw new Error("auth_unavailable");
    if (typeof password !== "string" || password.length < 8 || password.length > 128) throw new Error("invalid_password");
    cloudAuthBusy = true;
    renderCloudAccount();
    try {
      const { error } = await cloudClient.auth.updateUser({ password });
      if (error) throw error;
      return true;
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function resendEmailCode(email) {
    if (!cloudClient || cloudAuthBusy) throw new Error("auth_unavailable");
    const normalizedEmail = normalizedAuthEmail(email);
    cloudAuthBusy = true;
    renderCloudAccount();
    try {
      const { error } = await cloudClient.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: { emailRedirectTo: cloudRedirectUrl() }
      });
      if (error) throw error;
      return true;
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function signOutCloud() {
    if (!cloudClient || cloudAuthBusy) return;
    cloudAuthBusy = true;
    renderCloudAccount();
    try {
      await flushCloudSync(false);
      const { error } = await cloudClient.auth.signOut();
      if (error) throw error;
      await handleCloudSession(null);
      showToast(t("cloudSignedOut"));
    } catch {
      setCloudStatus("cloudError");
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  async function deleteCloudAccount() {
    if (!cloudClient || !cloudUser?.id || cloudAuthBusy) return;
    if (!globalThis.confirm(t("deleteAccountConfirm"))) return;
    const deletedUserId = cloudUser.id;
    cloudAuthBusy = true;
    setCloudStatus("deleteAccountDeleting");
    try {
      const { data, error } = await cloudClient.functions.invoke("delete-account", {
        body: { confirmation: "DELETE_GLOWLETTER_ACCOUNT" }
      });
      if (error || data?.deleted !== true) throw error || new Error("account deletion was not confirmed");
      try { await cloudClient.auth.signOut({ scope: "local" }); } catch {}
      forgetDeletedAccountData(deletedUserId);
      cloudSession = null;
      cloudUser = null;
      await handleCloudSession(null);
      showToast(t("deleteAccountDone"), 4200);
    } catch (error) {
      console.info("Account deletion failed", error);
      setCloudStatus("cloudError");
      showToast(t("deleteAccountFail"), 5200);
    } finally {
      cloudAuthBusy = false;
      renderCloudAccount();
    }
  }

  // After a deletion nothing of the account may survive on the device: cloud
  // snapshots, revision markers, the Moments cache, reminder choices and the
  // profile photo are all keyed by the user id.
  function forgetDeletedAccountData(userId) {
    const id = String(userId || "");
    if (!id) return;
    try {
      const doomed = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key && key.includes(id)) doomed.push(key);
      }
      doomed.forEach(key => localStorage.removeItem(key));
    } catch {}
    deleteMedia(accountAvatarStorageKey(id)).catch(() => {});
  }

  async function initializeCloudAuth() {
    const pageCallback = authCallbackDetails(location.href);
    if (pageCallback.hasSensitiveData) stripAuthDataFromCurrentUrl();
    if (pageCallback.code) {
      if (localStorage.getItem(CLOUD_EVER_AUTHENTICATED_KEY) === "1") applyIsolatedProgress(defaultCloudProgressState());
      else captureGuestBootstrap();
    }
    if (!cloudConfigurationReady()) {
      setCloudStatus("cloudUnavailable");
      return;
    }

    cloudClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "glowletter-auth-v1"
      }
    });

    cloudClient.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => handleCloudSession(session), 0);
    });

    window.onNativeAuthCallback = rawUrl => exchangeCloudAuthCallback(rawUrl);
    addEventListener("nur-auth-callback", event => exchangeCloudAuthCallback(event.detail?.url || event.detail));
    const pendingNativeCallback = window.__nurPendingAuthCallback;
    try { delete window.__nurPendingAuthCallback; } catch { window.__nurPendingAuthCallback = ""; }

    detectCloudProviders();
    if (pageCallback.hasSensitiveData) await exchangeCloudAuthCallback(pageCallback.url?.toString());
    if (pendingNativeCallback) await exchangeCloudAuthCallback(pendingNativeCallback?.url || pendingNativeCallback);

    const { data, error } = await cloudClient.auth.getSession();
    if (error) {
      setCloudStatus("cloudSignInError");
      return;
    }
    await handleCloudSession(data?.session || null);
    scheduleGoogleSignInPrompt();
  }

  window.GlowLetterCloud = Object.freeze({
    signIn: provider => signInWithCloud(provider),
    signInWithPassword: (email, password) => signInWithPassword(email, password),
    registerEmail: (email, password, name) => registerEmail(email, password, name),
    verifyEmailCode: (email, token) => verifyEmailCode(email, token),
    resendEmailCode: email => resendEmailCode(email),
    sendPasswordResetCode: email => sendPasswordResetCode(email),
    verifyPasswordResetCode: (email, token) => verifyPasswordResetCode(email, token),
    updateAccountPassword: password => updateAccountPassword(password),
    sendLoginCode: email => sendLoginCode(email),
    verifyLoginCode: (email, token) => verifyLoginCode(email, token),
    signOut: () => signOutCloud(),
    deleteAccount: () => deleteCloudAccount(),
    syncNow: () => flushCloudSync(true),
    getClient: () => cloudClient,
    getUser: () => cloudUser,
    getSession: () => cloudSession,
    getState: () => ({
      configured: cloudConfigurationReady(),
      signedIn: Boolean(cloudUser?.id),
      userId: cloudUser?.id || "",
      supportId: cloudAccount?.support_id || "",
      isAdmin: cloudAccount?.is_admin === true,
      premiumForever: cloudAccount?.premium_forever === true,
      vipUntil: cloudAccount?.vip_until || null,
      ready: cloudReady,
      revision: cloudRevision,
      providers: { ...cloudProviders }
    })
  });

  function displayName(value) {
    return cleanName(value).replace(/\s*\([^)]*\)\s*/g, " ").trim() || cleanName(value);
  }

  function namesReady() {
    return Boolean(displayName(fromName) && displayName(toName));
  }

  function previewRecipient() {
    if (displayName(toName)) return displayName(toName);
    return { ru: "важного человека", en: "someone special", fr: "une personne importante", de: "einen besonderen Menschen", es: "alguien especial", it: "una persona speciale", pl: "kogoś wyjątkowego", uk: "важливу людину", pt: "alguém especial", nl: "iemand die belangrijk is", tr: "özel biri", ro: "cineva special", cs: "někoho výjimečného", sv: "någon speciell", el: "κάποιον ξεχωριστό", da: "en særlig person", no: "en som betyr mye", fi: "tärkeälle ihmiselle", ja: "大切な人", ko: "소중한 사람", zh: "重要的人", th: "คนพิเศษ", ar: "شخص عزيز", ind: "seseorang yang spesial", vi: "người đặc biệt" }[lang] || "someone special";
  }

  function encodeSharedMessage(text) {
    try {
      const bytes = new TextEncoder().encode(text);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
    } catch { return ""; }
  }

  function decodeSharedMessage(encoded) {
    if (!encoded || encoded.length > 12000) return "";
    try {
      const padded = encoded.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
      const binary = atob(padded);
      const text = new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0))).trim();
      return text.length <= 1800 && !containsForbidden(text) ? text : "";
    } catch { return ""; }
  }

  function entryText(entry) {
    const recipient = previewRecipient();
    return String(entry?.[lang] || entry?.en || entry?.ru || "").replaceAll("{to}", recipient);
  }

  function basePosition(entry) {
    return Number(entry?.id) || 0;
  }

  function canAccess(entry) {
    return Boolean(entry?.shared || isPremium || (basePosition(entry) > 0 && basePosition(entry) <= FREE_COUNT));
  }

  function currentEntry() { return letterDeck[currentIndex] || LETTERS[0]; }

  function haptic(pattern = 12) {
    try { navigator.vibrate?.(pattern); } catch {}
  }

  function showToast(message, duration = 2400) {
    clearTimeout(toastTimer);
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), duration);
  }

  function openPanel(layer) {
    if (!layer) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (trigger && !layer.contains(trigger)) panelTriggers.set(layer, trigger);
    layer.classList.add("is-open");
    layer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("main")?.setAttribute("inert", "");
    $(".topbar")?.setAttribute("inert", "");
    requestAnimationFrame(() => {
      const target = layer.querySelector(".panel-close, input:not([type='hidden']), textarea, select, button:not(.panel-backdrop)");
      target?.focus({ preventScroll: true });
    });
  }

  function closePanel(layer) {
    if (!layer) return;
    layer.classList.remove("is-open");
    layer.setAttribute("aria-hidden", "true");
    if (layer === layers.support) layers.settings?.removeAttribute("inert");
    if (layer === layers.notifications) releaseNotificationLayerContext();
    const anotherOpen = Object.values(layers).some(item => item.classList.contains("is-open"));
    if (!anotherOpen) {
      document.body.style.overflow = "";
      $("main")?.removeAttribute("inert");
      $(".topbar")?.removeAttribute("inert");
    }
    const trigger = panelTriggers.get(layer);
    panelTriggers.delete(layer);
    requestAnimationFrame(() => {
      if (trigger?.isConnected && !trigger.closest('[aria-hidden="true"]')) trigger.focus({ preventScroll: true });
    });
  }

  function updateUrl(includeMessage = Boolean(sharedMessage)) {
    const url = new URL(location.href);
    url.searchParams.delete(BETA_PARAMETER);
    AUTH_CALLBACK_PARAMETERS.forEach(key => url.searchParams.delete(key));
    if (fromName) url.searchParams.set("from", fromName); else url.searchParams.delete("from");
    if (toName) url.searchParams.set("to", toName); else url.searchParams.delete("to");
    // Links always name their language: without it a reader gets their phone's language.
    url.searchParams.set("lang", lang);
    const position = basePosition(currentEntry());
    if (position && namesReady()) url.searchParams.set("quote", String(position)); else url.searchParams.delete("quote");
    if (includeMessage && sharedMessage && namesReady()) url.searchParams.set("msg", encodeSharedMessage(sharedMessage));
    else url.searchParams.delete("msg");
    history.replaceState({}, "", url);
  }

  function setNames(sender, recipient, { persist = true, explicit = false } = {}) {
    if (persist && explicit) linkNamesActive = false;
    fromName = cleanName(sender);
    toName = cleanName(recipient);
    const fromDisplay = displayName(fromName);
    const toDisplay = displayName(toName);
    setText("#homeFrom", fromDisplay);
    setText("#homeTo", toDisplay);
    setText("#letterFrom", fromDisplay);
    setText("#letterTo", toDisplay);
    if ($("#settingsSenderName")) $("#settingsSenderName").value = fromName;
    if ($("#settingsRecipientName")) $("#settingsRecipientName").value = toName;
    if (persist) {
      if (fromName) localStorage.setItem("nurFrom", fromName); else localStorage.removeItem("nurFrom");
      if (toName) localStorage.setItem("nurTo", toName); else localStorage.removeItem("nurTo");
    }
    applyLanguage(false);
    updateUrl();
  }

  function setText(selector, value) {
    const element = $(selector);
    if (element) element.textContent = value;
  }

  function applyUiTheme(value, persist = true) {
    uiTheme = UI_THEMES.has(value) ? value : "garnet";
    document.body.dataset.uiTheme = uiTheme;
    $$('.theme-choice-grid [data-ui-theme]').forEach(button => {
      const active = button.dataset.uiTheme === uiTheme;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    });
    if (persist) localStorage.setItem("nurUiTheme", uiTheme);
  }

  function renderWeather() {
    const button = $("#weatherButton");
    const icon = $("#weatherIcon");
    const text = $("#weatherText");
    const state = $("#weatherState");
    const valid = weatherEnabled && weatherSnapshot && Number.isFinite(Number(weatherSnapshot.temperature));
    if (!valid) {
      if (icon) icon.innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-cloud"/></svg>`;
      if (text) text.textContent = t("weather");
      if (state) state.textContent = weatherEnabled ? "…" : t("stateOff");
      button?.classList.remove("has-weather");
      button?.removeAttribute("aria-busy");
      button?.setAttribute("aria-label", t("weatherAria"));
      button?.removeAttribute("title");
      $("#weatherToggle")?.classList.toggle("is-active", weatherEnabled);
      $("#weatherToggle")?.setAttribute("aria-pressed", String(weatherEnabled));
      const settingsIcon = $("#weatherToggle > i"); if (settingsIcon) settingsIcon.innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-cloud"/></svg>`;
      return;
    }
    const code = Number(weatherSnapshot.code) || 0;
    const mapped = weatherMap[code] || ["cloud", "Weather"];
    const dayIcon = code <= 1 ? (Number(weatherSnapshot.isDay) === 0 ? "moon" : "sun") : mapped[0];
    const temperature = `${Math.round(Number(weatherSnapshot.temperature))}°`;
    if (icon) icon.innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-${dayIcon}"/></svg>`;
    if (text) text.textContent = temperature;
    if (state) state.textContent = temperature;
    button?.classList.add("has-weather");
    button?.removeAttribute("aria-busy");
    const place = String(weatherSnapshot.place || "").trim();
    button?.setAttribute("aria-label", `${t("weather")}: ${temperature}${place ? ` · ${place}` : ""}`);
    button?.setAttribute("title", `${temperature}${place ? ` · ${place}` : ""}`);
    $("#weatherToggle")?.classList.add("is-active");
    $("#weatherToggle")?.setAttribute("aria-pressed", "true");
    const settingsIcon = $("#weatherToggle > i"); if (settingsIcon) settingsIcon.innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-${dayIcon}"/></svg>`;
  }

  function setSelectOptions(selector, options) {
    const select = $(selector);
    if (!select) return;
    const previous = select.value;
    select.innerHTML = options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
  }

  function applyLanguage(render = true) {
    premiumPrice = premiumPriceFromStore ? localizedMonthlyPrice(premiumPrice) : localizedFallbackPrice();
    yearlyPrice = yearlyPriceFromStore ? localizedYearlyPrice(yearlyPrice) : localizedYearlyFallbackPrice();
    document.documentElement.lang = HTML_LANGS[lang] || lang;
    document.documentElement.dir = isRtl() ? "rtl" : "ltr";
    document.title = displayName(toName) ? `${t("title")} · ${displayName(toName)}` : t("title");
    $("#languageButton").textContent = lang.toUpperCase();
    $$('[data-lang]').forEach(button => {
      const active = button.dataset.lang === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    setText("#languageTitle", t("langLabel"));
    $("#languageClose")?.setAttribute("aria-label", t("closeAria"));
    $("#languageBackdrop")?.setAttribute("aria-label", t("closeAria"));
    $(".brand-card h1").innerHTML = t("brand");
    const brandCopy = $(".brand-copy");
    brandCopy.innerHTML = displayName(toName)
      ? t("brandCopyPersonal").replace("{to}", () => `<strong id="homeTo">${escapeHtml(displayName(toName))}</strong>`)
      : escapeHtml(t("brandCopy"));
    const senderLine = $(".sender-line");
    setText(".sender-line", "");
    senderLine.hidden = !displayName(fromName);
    if (displayName(fromName)) {
      senderLine.append(`${t("from")} `);
      const senderStrong = document.createElement("strong"); senderStrong.id = "homeFrom"; senderStrong.textContent = displayName(fromName); senderLine.append(senderStrong);
    }
    setText("#openStoryButton > span:last-child", t("open"));
    $("#momentsOpenHome").innerHTML = `<span><svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-clock"/></svg></span> ${escapeHtml(t("momentsHome"))}`;
    const freeNote = $(".free-note");
    const freeSpans = $$(".free-note span"); if (freeSpans[0]) freeSpans[0].textContent = t("free"); if (freeSpans[1]) freeSpans[1].innerHTML = `${escapeHtml(t("full"))} <span class="price-label">${escapeHtml(premiumPrice)}</span>`;
    if (freeNote) freeNote.hidden = isPremium;
    renderWeather();
    setText("#nextLetter", t("next")); $("#nextLetter").insertAdjacentHTML("beforeend", " <span>→</span>");
    $("#copyLetter").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-copy"/></svg> ${t("copy")}`;
    updateSpeechButton(letterSpeechActive); $("#favoriteButton").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-bookmark"/></svg> ${escapeHtml(t("saved"))}`;
    letterStage.dataset.navigationHint = t("focusHint");
    $$(".go-home").forEach(button => button.innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-home"/></svg> ${escapeHtml(t("home"))}`);
    setText("#stageCaption", t("stage")); setText("#letterTitle", t("letterTitle")); setText("#letterForLabel", t("for")); setText(".signature span", t("warmSign"));
    setText("#setupTitle", t("setupTitle")); setText(".setup-note", t("setupNote")); setText("#setupSubmitLabel", t("setupSubmit")); setText("#setupError", t("namesSafety"));
    const setupLabels = $$("#setupForm .simple-form label > span"); if (setupLabels[0]) setupLabels[0].textContent = t("fromWho"); if (setupLabels[1]) setupLabels[1].textContent = t("forWho");
    $("#setupSenderName").placeholder = t("setupSenderPlaceholder"); $("#setupRecipientName").placeholder = t("setupRecipientPlaceholder");
    setText("#libraryTitle", t("library")); updateLetterPickerNote(); setText("#accessLabel", isPremium ? t("allCount") : t("openCount"));
    setText(".library-summary > span", t("collectionNote"));
    const categories = { all: t("all"), warm: t("warm"), gratitude: t("gratitude"), support: t("support"), family: t("family") }; $$("#categoryRow button").forEach(button => button.textContent = categories[button.dataset.category]);
    setText("#settingsTitle", t("settings")); setText("#settingsLetterTitle", t("settingsLetter")); setText("#settingsAtmosphereTitle", t("settingsAtmosphere")); setText("#settingsLookTitle", t("settingsLook")); setText("#settingsSoundTitle", t("settingsSound")); setText("#settingsAccountTitle", t("settingsAccountSection")); setText("#settingsAppTitle", t("settingsApp")); setText(".language-picker legend", t("langLabel")); setText("#customBackgroundButton", t("choosePhoto")); setText("#resetBackgroundButton", t("resetPhoto"));
    setText(".interface-theme-picker legend", t("themeTitle")); $(".theme-choice-grid")?.setAttribute("aria-label", t("themeAria")); const themeLabels = $$(".theme-choice-grid [data-ui-theme] span"); if(themeLabels[0])themeLabels[0].textContent=t("themeMoon");if(themeLabels[1])themeLabels[1].textContent=t("themeRose");if(themeLabels[2])themeLabels[2].textContent=t("themeForest");if(themeLabels[3])themeLabels[3].textContent=t("themeSand"); applyUiTheme(uiTheme, false);
    setText(".profile-picker legend", t("namesSettings")); const settingsNameLabels = $$(".profile-picker .simple-form label > span"); if (settingsNameLabels[0]) settingsNameLabels[0].textContent = t("fromWho"); if (settingsNameLabels[1]) settingsNameLabels[1].textContent = t("forWho"); $("#settingsSenderName").placeholder = t("setupSenderPlaceholder"); $("#settingsRecipientName").placeholder = t("setupRecipientPlaceholder"); setText("#settingsNamesError", t("namesSafety"));
    setText("#rainToggle strong", t("rainTitle")); setText("#rainToggle small", t("rainNote")); setText("#natureToggle strong", t("natureTitle")); setText("#natureToggle small", t("natureNote")); setText("#weatherToggle strong", t("weatherTitle")); setText("#weatherToggle small", t("weatherNote")); setText("#fullscreenToggle strong", t("fullscreenTitle")); setText("#fullscreenToggle small", t("fullscreenNote"));
    const naturePreferenceEnabled = isNaturePlaying || localStorage.getItem("nurNature") === "on";
    $("#natureToggle").classList.toggle("is-active", naturePreferenceEnabled); $("#weatherToggle").classList.toggle("is-active", weatherEnabled);
    setText("#rainToggle b", rainScene.enabled ? t("stateOn") : t("stateOff")); setText("#natureToggle b", naturePreferenceEnabled ? t("stateOn") : t("stateOff")); if (!$("#weatherState").textContent.includes("°")) setText("#weatherState", weatherEnabled ? t("stateOn") : t("stateOff")); updateFullscreenControl(); setText("#saveSettingsButton", t("saveSettings"));
    setText(".background-picker legend", t("personalBg")); setText(".background-preview strong", t("ownPhoto")); setText(".background-preview small", t("localOnly")); setText(".track-picker legend", t("music")); setText("#customTrackButton strong", t("customMusic")); if (!customAudioBlob) setText("#customTrackName", t("customMusicNote")); setText("#removeAudioButton", t("removeAudio")); setText("#audioShareNote", t("audioShareNote"));
    renderAudioControls();
    setText(".premium-settings-card h3", t("allLetters")); setText(".premium-settings-card p", t("onePurchase")); $("#settingsPurchase").innerHTML = `${escapeHtml(t("buy"))} <span class="price-label">${escapeHtml(premiumPrice)}</span>`;
    $("#paywallTitle").innerHTML = t("paywallTitle"); setText("#paywallLead", t("paywallBody")); const benefits=$$(".paywall-card li"); if(benefits[0])benefits[0].textContent=t("benefit1");if(benefits[1])benefits[1].textContent=t("benefit2");if(benefits[2])benefits[2].textContent=t("benefit3");if(benefits[3])benefits[3].textContent=t("benefit4"); setText("#purchaseButton > span", t("payButton")); setText("#purchaseYearlyButton > span", t("payYearlyButton")); setText("#purchaseYearlyButton > em", t("yearlyBadge")); setText(".paywall-card > small", t("storeNote"));
    setText("#privacyLink",t("privacy"));setText("#termsLink",t("terms"));setText("#deleteAccountLink",t("deletePage"));setText("#supportOpenButton",t("supportLink"));
    setText("#restoreButton", t("restore")); $("#manageSubscriptionButton").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-clock"/></svg> ${escapeHtml(t("manageSubscription"))}`; setText("#paywallManageSubscription", t("manageSubscription")); $("#settingsRestoreButton").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-download"/></svg> ${escapeHtml(t("subscriptionRestore"))}`; renderSubscriptionCard(); renderAppUpdate(); $$(".password-toggle").forEach(toggle => { const input = document.getElementById(toggle.getAttribute("aria-controls") || ""); if (input) renderPasswordToggle(toggle, input); }); $("#shareAppButton").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-share"/></svg> ${escapeHtml(t("shareApp"))}`; $("#qrOpenButton").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-qr"/></svg> ${escapeHtml(t("qrOpen"))}`; $("#installButton").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-plus"/></svg> ${escapeHtml(t("install"))}`; setText("#installHint", t("installIosHint")); $("#installHint").hidden = !(/iPad|iPhone|iPod/u.test(navigator.userAgent) && !navigator.standalone); $$(".price-label").forEach(label => label.textContent = premiumPrice); $$(".yearly-price-label").forEach(label => label.textContent = yearlyPrice);
    setText("#shareAppLayer .panel-eyebrow", t("shareChooserEyebrow")); setText("#shareAppTitle", t("shareChooserTitle")); setText("#shareAppLead", t("shareChooserLead")); setText("#shareTelegram span", t("shareTelegram")); setText("#shareWhatsapp span", t("shareWhatsapp")); setText("#shareEmail span", t("shareEmail")); setText("#shareCopyLink span", t("shareCopy"));
    setText("#publicationTitle",t("publishTitle"));setText("#publicationLead",t("publishLead"));setText("#publicationConsentText",t("publishConsent"));setText("#publicationAgreement",t("publishAgreement"));setText("#publicationTerms",t("publishTerms"));setText("#publicationAnd",t("publishAnd"));setText("#publicationPrivacy",t("publishPrivacy"));setText("#publicationError",t("publishRequired"));setText("#publicationCancel",t("publishCancel"));setText("#publicationConfirmLabel",t("publishConfirm"));
    setText("#reportLetterButton",t("reportLink"));setText("#reportTitle",t("reportTitle"));setText("#reportLead",t("reportLead"));setText("#reportCategoryLabel",t("reportCategory"));setText("#reportDetailsLabel",t("reportDetails"));$("#reportDetails").placeholder=t("reportPlaceholder");setText("#reportSubmitLabel",reportSubmitting?t("reportSending"):t("reportSubmit"));setSelectOptions("#reportCategory",CONTENT_REPORT_OPTIONS[lang]||CONTENT_REPORT_OPTIONS.en);
    $("#supportTitle").innerHTML=t("supportFormTitle");setText("#supportLead",t("supportFormLead"));setText("#supportGuestTitle",t("supportGuestTitle"));setText("#supportGuestNote",t("supportGuestNote"));setText("#supportCopyContact",t("supportCopyContact"));setText("#supportEmailLabel",t("supportEmailLabel"));setText("#supportIdLabel",t("supportIdLabel"));setText("#supportCategoryLabel",t("supportCategoryLabel"));setText("#supportMessageLabel",t("supportMessageLabel"));$("#supportMessage").placeholder=t("supportMessagePlaceholder");setText("#supportPrivacyNote",t("supportPrivacyNote"));setText("#supportSubmitLabel",supportSubmitting?t("supportSending"):t("supportSubmit"));setSelectOptions("#supportCategory",SELECT_OPTIONS.supportCategory[lang]);renderSupportFormState();updateSupportMessageCount();
    $("#qrTitle").innerHTML = t("qrTitle"); setText("#qrLead", t("qrLead")); setText("#qrPreviewCaption", currentQrMode === "personal" && currentQrCaption ? currentQrCaption : t("qrCaption")); setText("#qrPrivacy", t("qrPrivacy")); setText("#qrGenerateButton > span:nth-child(2)", t("qrGenerate")); setText("#qrDownloadButton", t("qrDownload")); setText("#qrCopyLinkButton", t("qrCopyLink")); setText("#qrCopyImageButton", t("qrCopyImage")); setText("#qrPrintButton", t("qrPrint")); setText("#qrPdfButton", t("qrPdf")); setText("#qrSendButton", t("qrSend")); setText("#qrSendTitle", t("qrSendTitle")); setText("#qrSendLead", t("qrSendLead")); setText("#qrSendWhatsapp span", t("shareWhatsapp")); setText("#qrSendTelegram span", t("shareTelegram")); setText("#qrSendSms span", t("qrSendSms")); setText("#qrSendEmail span", t("shareEmail")); setText("#qrSendOther span", t("qrSendOther")); setText("#qrSendFile span", t("qrSendFile")); setText("#qrSendCopy span", t("shareCopy")); setText("#composerEyebrow", t("composerEyebrow")); setText("#composerTitle", t("composerTitle")); setText("#composerLead", t("composerLead")); setText("#composerDoneLabel", t("composerDone")); setText("#composerCollection span", t("composerCollection")); const composerField = $("#composerText"); if (composerField) composerField.placeholder = t("composerPlaceholder"); updateComposerCounter(); const qrNameLabels=$$("#qrForm .simple-form label > span");if(qrNameLabels[0])qrNameLabels[0].textContent=t("fromWho");if(qrNameLabels[1])qrNameLabels[1].textContent=t("forWho");$("#qrSenderName").placeholder=t("setupSenderPlaceholder");$("#qrRecipientName").placeholder=t("setupRecipientPlaceholder");setText("#qrNamesError",t("namesSafety")); if(currentQrUrl) renderCurrentQr(false);
    renderCloudAccount();
    $("#homeButton").setAttribute("aria-label", t("homeAria")); $("#soundButton").setAttribute("aria-label", t(isMusicPlaying ? "soundOffAria" : "soundOnAria")); $("#natureButton").setAttribute("aria-label", t(isNaturePlaying ? "natureOffAria" : "natureOnAria")); $("#weatherButton").setAttribute("aria-label", t("weatherAria")); $("#languageButton").setAttribute("aria-label", t("languageAria")); $("#libraryButton").setAttribute("aria-label", t("libraryAria")); $("#settingsButton").setAttribute("aria-label", t("settingsAria")); $("#previousLetter").setAttribute("aria-label", t("previousAria")); $("#shareButton").setAttribute("aria-label", t("shareAria")); setText("#shareButtonLabel", t("shareAria"));
    renderWeather();
    $("#homeScreen").setAttribute("aria-label", t("homeScreenAria")); $(".letter-actions").setAttribute("aria-label", t("letterNavAria"));
    $("#setupBackdrop").setAttribute("aria-label", t("closeAria")); $("#setupClose").setAttribute("aria-label", t("closeAria")); $("#libraryBackdrop").setAttribute("aria-label", t("closeLibraryAria")); $("#libraryClose").setAttribute("aria-label", t("closeLibraryAria")); $("#settingsBackdrop").setAttribute("aria-label", t("closeSettingsAria")); $("#settingsClose").setAttribute("aria-label", t("closeSettingsAria")); $("#qrBackdrop").setAttribute("aria-label", t("qrCloseAria")); $("#qrClose").setAttribute("aria-label", t("qrCloseAria")); $("#shareAppBackdrop").setAttribute("aria-label", t("closeAria")); $("#shareAppClose").setAttribute("aria-label", t("closeAria")); $("#publicationBackdrop").setAttribute("aria-label",t("closeAria"));$("#publicationClose").setAttribute("aria-label",t("closeAria"));$("#reportBackdrop").setAttribute("aria-label",t("closeAria"));$("#reportClose").setAttribute("aria-label",t("closeAria")); $("#supportBackdrop").setAttribute("aria-label", t("closeAria")); $("#supportClose").setAttribute("aria-label", t("closeAria")); $("#notificationBackdrop").setAttribute("aria-label", t("closeAria")); $("#notificationClose").setAttribute("aria-label", t("closeAria")); $("#paywallBackdrop").setAttribute("aria-label", t("closeAria")); $("#paywallClose").setAttribute("aria-label", t("closeAria"));
    updatePurchaseConfiguration(purchaseConfigured);
    localStorage.setItem("nurLanguage", lang);
    updateUrl();
    if (render) { if (storyOpened) renderLetter(); renderLibrary(); }
    dispatchEvent(new CustomEvent("glowletter-language-changed", { detail: { language: lang } }));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }

  function ensureNames() {
    if (namesReady()) return true;
    openNameSetup();
    return false;
  }

  function openNameSetup() {
    pendingPremiumFeature = "";
    $("#setupSenderName").value = fromName;
    $("#setupRecipientName").value = toName;
    $("#setupError").hidden = true;
    openPanel(layers.setup);
    requestAnimationFrame(() => (fromName ? $("#setupRecipientName") : $("#setupSenderName"))?.focus());
  }

  function submitNameSetup(event) {
    event.preventDefault();
    const sender = cleanName($("#setupSenderName").value);
    const recipient = cleanName($("#setupRecipientName").value);
    if (!sender || !recipient || containsForbidden(sender) || containsForbidden(recipient)) {
      setText("#setupError", t("namesSafety"));
      $("#setupError").hidden = false;
      return;
    }
    setNames(sender, recipient, { explicit: true });
    closePanel(layers.setup);
    openStory();
  }

  function openStory() {
    pendingPremiumFeature = "";
    if (!ensureNames()) return;
    if (storyOpened) return;
    restoreGesturePreferences();
    storyOpened = true;
    haptic([12, 35, 18]);
    playMusic(true);
    homeScreen.classList.add("is-leaving");
    setTimeout(() => {
      homeScreen.hidden = true;
      document.body.classList.add("is-reading");
      homeScreen.classList.remove("is-leaving");
      letterStage.hidden = false;
      letterStage.classList.add("is-entering");
      $("#homeButton").hidden = false;
      renderLetter();
    }, 600);
  }

  function goHome() {
    stopLetterSpeech();
    setReadingFocus(false);
    pendingPremiumFeature = "";
    storyOpened = false;
    letterStage.hidden = true;
    homeScreen.hidden = false;
    document.body.classList.remove("is-reading");
    homeScreen.classList.remove("is-leaving");
    $("#homeButton").hidden = true;
    Object.values(layers).forEach(closePanel);
    haptic();
  }

  function hasReadingTextSelection() {
    const selection = window.getSelection?.();
    return Boolean(selection && !selection.isCollapsed && String(selection).trim());
  }

  function isReadingControlTarget(target) {
    return Boolean(target?.closest?.("button,a,input,textarea,select,label,[contenteditable='true'],[role='button'],[data-reading-no-swipe]"));
  }

  function isMouseSelectableText(target) {
    return Boolean(target?.closest?.("#letterText,#letterTitle,.letter-meta,.signature"));
  }

  function readingSwipeDirection(deltaX, deltaY, duration, viewportWidth) {
    const width = Number(viewportWidth) > 0 ? Number(viewportWidth) : innerWidth;
    const threshold = Math.max(READING_SWIPE.minDistance, Math.min(READING_SWIPE.maxDistance, width * READING_SWIPE.viewportRatio));
    const horizontal = Math.abs(deltaX);
    const vertical = Math.abs(deltaY);
    if (Number(duration) > READING_SWIPE.maxDuration || horizontal < threshold || horizontal < vertical * READING_SWIPE.axisRatio) return 0;
    // Arabic reads right to left, so the next letter lies on the left.
    return (deltaX < 0 ? 1 : -1) * (isRtl() ? -1 : 1);
  }

  function resetReadingSwipe(pointerId) {
    if (pointerId !== undefined) {
      try { if (letterStage.hasPointerCapture?.(pointerId)) letterStage.releasePointerCapture(pointerId); } catch {}
    }
    readingPointer = null;
    document.body.classList.remove("is-reading-swiping");
  }

  function startReadingSwipe(event) {
    if (!readingFocus || !storyOpened || Object.values(layers).some(layer => layer.classList.contains("is-open"))) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isReadingControlTarget(event.target) || hasReadingTextSelection()) return;
    // Mouse selection remains available on the actual words; drag the paper edge
    // or the surrounding stage to turn a letter. Touch swipes work everywhere.
    if (event.pointerType === "mouse" && isMouseSelectableText(event.target)) return;
    readingPointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: performance.now(),
      horizontal: false
    };
  }

  function updateReadingSwipe(event) {
    if (!readingPointer || event.pointerId !== readingPointer.id) return;
    const deltaX = event.clientX - readingPointer.startX;
    const deltaY = event.clientY - readingPointer.startY;
    if (!readingPointer.horizontal && Math.abs(deltaY) >= READING_SWIPE.intentDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
      resetReadingSwipe(event.pointerId);
      return;
    }
    if (!readingPointer.horizontal && Math.abs(deltaX) >= READING_SWIPE.intentDistance && Math.abs(deltaX) > Math.abs(deltaY) * READING_SWIPE.axisRatio) {
      readingPointer.horizontal = true;
      document.body.classList.add("is-reading-swiping");
      try { letterStage.setPointerCapture?.(event.pointerId); } catch {}
    }
    if (readingPointer?.horizontal && event.cancelable) event.preventDefault();
  }

  function finishReadingSwipe(event) {
    if (!readingPointer || event.pointerId !== readingPointer.id) return;
    const pointer = readingPointer;
    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;
    const duration = performance.now() - pointer.startedAt;
    resetReadingSwipe(event.pointerId);
    if (event.type === "pointercancel" || hasReadingTextSelection()) return;
    const direction = readingSwipeDirection(deltaX, deltaY, duration, letterStage.clientWidth);
    if (!direction) return;
    if (event.cancelable) event.preventDefault();
    // Keep every navigation path behind moveLetter(): it owns the 10-letter
    // free limit, paywall, and unlimited VIP access.
    moveLetter(direction);
  }

  function readingKeyboardDirection(event) {
    if (!readingFocus || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return 0;
    if (isReadingControlTarget(event.target) || hasReadingTextSelection()) return 0;
    const forward = isRtl() ? -1 : 1;
    if (event.key === "ArrowRight") return forward;
    if (event.key === "ArrowLeft") return -forward;
    return 0;
  }

  function setReadingFocus(enabled) {
    readingFocus = Boolean(enabled && storyOpened);
    document.body.classList.toggle("reading-focus", readingFocus);
    letterStage.dataset.navigationHint = t("focusHint");
    const button = $("#focusReadingButton");
    if (button) {
      button.setAttribute("aria-pressed", String(readingFocus));
      button.innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-book"/></svg> ${escapeHtml(t(readingFocus ? "focusExit" : "focusRead"))}`;
    }
    const letter = $("#letter");
    if (readingFocus) {
      letter?.setAttribute("tabindex", "-1");
      letter?.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight");
      requestAnimationFrame(() => letter?.focus({ preventScroll: true }));
    } else {
      resetReadingSwipe();
      letter?.removeAttribute("tabindex");
      letter?.removeAttribute("aria-keyshortcuts");
    }
  }

  function renderLetter() {
    if (!ensureNames()) return;
    const entry = currentEntry();
    if (!entry || !canAccess(entry)) { openPaywall(); return; }
    const position = entry.shared ? `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-spark"/></svg>` : String(entry.id).padStart(2, "0");
    $("#letterNumber").innerHTML = entry.shared ? `${position} PERSONAL` : `${escapeHtml(position)} / ${LETTERS.length}`;
    $("#letterTo").textContent = displayName(toName);
    $("#letterFrom").textContent = displayName(fromName);
    const text = $("#letterText");
    text.classList.remove("is-changing");
    text.textContent = entryText(entry);
    cancelAnimationFrame(letterAnimationFrame);
    letterAnimationFrame = requestAnimationFrame(() => {
      letterAnimationFrame = requestAnimationFrame(() => text.classList.add("is-changing"));
    });
    if (readingFocus) { $("#letter").scrollTop = 0; letterStage.scrollTop = 0; }
    const captions = [t("stage"), `${displayName(fromName)} · ${displayName(toName)}`, UI[lang].family, UI[lang].gratitude];
    $("#stageCaption").textContent = captions[Math.abs(Number(entry.id) || 0) % captions.length];
    const favorite = favorites.has(String(entry.id));
    $("#favoriteButton").classList.toggle("is-active", favorite);
    $("#favoriteButton").innerHTML = `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-bookmark"/></svg> ${escapeHtml(favorite ? t("favorite") : t("saved"))}`;
    if (!entry.shared) localStorage.setItem("nurLetterIndex", String(entry.id));
    updateUrl(Boolean(entry.shared));
    scheduleCloudSync();
  }

  function moveLetter(direction) {
    if (!letterDeck.length) return;
    const nextIndex = (currentIndex + direction + letterDeck.length) % letterDeck.length;
    if (!canAccess(letterDeck[nextIndex])) { openPaywall(); return; }
    stopLetterSpeech();
    currentIndex = nextIndex;
    renderLetter();
    haptic(8);
  }

  function openQuoteById(id) {
    const index = letterDeck.findIndex(item => Number(item.id) === Number(id));
    if (index < 0) return;
    if (!canAccess(letterDeck[index])) return openPaywall();
    stopLetterSpeech();
    currentIndex = index;
    closePanel(layers.library);
    if (!ensureNames()) return;
    if (!storyOpened) openStory(); else renderLetter();
  }

  async function writeClipboard(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const area = document.createElement("textarea"); area.value = text; area.style.position = "fixed"; area.style.opacity = "0"; document.body.append(area); area.select(); document.execCommand("copy"); area.remove();
    }
  }

  async function copyText(text) {
    await writeClipboard(text);
    showToast(t("copied")); haptic(10);
  }

  function renderLibrary() {
    const list = $("#quoteList");
    if (!list) return;
    const filtered = LETTERS.filter(entry => selectedCategory === "all" || entry.category === selectedCategory);
    const ownCard = letterPickerContext ? `<article class="quote-card quote-own" data-id="0"><div class="quote-body"><div class="quote-head"><b><svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-note"/></svg></b><span>${escapeHtml(pickerText("own"))}</span></div><p>${escapeHtml(pickerText("ownNote"))}</p><div class="quote-actions"><button type="button" class="quote-pick" data-action="own"><svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-check"/></svg> ${escapeHtml(pickerText("own"))}</button></div></div></article>` : "";
    list.innerHTML = ownCard + filtered.map(entry => {
      const accessible = canAccess(entry);
      const text = entryText(entry);
      const visibleText = accessible ? text : t("locked");
      return `<article class="quote-card${accessible ? "" : " is-locked"}" data-id="${entry.id}">
        <div class="quote-body"><div class="quote-head"><b>${String(entry.id).padStart(2, "0")}</b><span>${escapeHtml(t(entry.category) || entry.category)}</span></div><p>${escapeHtml(visibleText)}</p>
        <div class="quote-actions">${letterPickerContext && accessible ? `<button type="button" class="quote-pick" data-action="pick"><svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-check"/></svg> ${escapeHtml(pickerText("pick"))}</button>` : ""}<button type="button" data-action="open">${escapeHtml(t("openQuote"))}</button><button type="button" data-action="copy"><svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-copy"/></svg> ${escapeHtml(t("copy"))}</button></div></div>
        ${accessible ? "" : `<div class="lock-cover"><i><svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-lock"/></svg></i><strong>${escapeHtml(t("locked"))}</strong><button type="button" data-action="unlock">${escapeHtml(t("unlock"))}</button></div>`}
      </article>`;
    }).join("");
    setText("#accessLabel", isPremium ? t("allCount") : t("openCount"));
  }

  function pickerText(key) {
    const bank = PICKER_TEXT[lang] || PICKER_TEXT.en;
    return bank[key] || PICKER_TEXT.ru[key] || "";
  }

  function displayPersonalLetter(text, context = null, source = "library") {
    const value = String(text || "").normalize("NFKC").trim().slice(0, 1800);
    if (!value) return null;
    const sender = cleanName(context?.senderName || context?.sender) || fromName;
    const recipient = cleanName(context?.recipientName || context?.recipient) || toName;
    if (sender && recipient) setNames(sender, recipient, { explicit: true });
    sharedMessage = value;
    letterDeck = [{ id: "shared", category: "warm", shared: true, ru: value, en: value, fr: value }, ...LETTERS];
    currentIndex = 0;
    closePanel(layers.library);
    if (!storyOpened) openStory(); else renderLetter();
    updateUrl(true);
    const letterResult = {
      text: value,
      senderName: sender,
      recipientName: recipient,
      relationship: context?.relationship || "auto",
      tone: context?.tone || "auto",
      language: SUPPORTED_LANGUAGES.includes(context?.language) ? context.language : lang,
      source: String(context?.source || source || "library").slice(0, 32),
      context: context || null
    };
    dispatchEvent(new CustomEvent("glowletter-letter-created", { detail: letterResult }));
    return letterResult;
  }

  function updateLetterPickerNote() {
    const note = $("#libraryPickNote");
    if (!note) return;
    if (!letterPickerContext) {
      note.hidden = true;
      note.textContent = "";
      return;
    }
    const recipient = cleanName(letterPickerContext.recipientName || letterPickerContext.recipient) || toName;
    note.textContent = recipient
      ? pickerText("note").replace("{name}", () => displayName(recipient))
      : pickerText("noteGeneric");
    note.hidden = false;
  }

  function openLetterPicker(context = null) {
    letterPickerContext = context && typeof context === "object" ? { ...context } : null;
    const sender = cleanName(letterPickerContext?.senderName || letterPickerContext?.sender) || fromName;
    const recipient = cleanName(letterPickerContext?.recipientName || letterPickerContext?.recipient) || toName;
    if (sender && recipient) setNames(sender, recipient, { explicit: true });
    selectedCategory = "all";
    $$("#categoryRow button").forEach(button => button.classList.toggle("is-active", button.dataset.category === "all"));
    renderLibrary();
    updateLetterPickerNote();
    openPanel(layers.library);
  }

  function cancelLetterPicker() {
    if (!letterPickerContext) return;
    letterPickerContext = null;
    updateLetterPickerNote();
    renderLibrary();
  }

  function pickLetterForContext(id) {
    const entry = LETTERS.find(item => Number(item.id) === Number(id));
    if (!entry) return;
    if (!canAccess(entry)) return openPaywall();
    const context = letterPickerContext;
    letterPickerContext = null;
    updateLetterPickerNote();
    const result = displayPersonalLetter(entryText(entry), context, context?.source || "library");
    renderLibrary();
    if (!result) return;
    const onComplete = context?.onComplete;
    if (typeof onComplete === "function") {
      Promise.resolve(onComplete(result)).catch(error => console.info("Moments letter completion failed", error));
    }
    showToast(t("customAdded"), 3200);
  }

  // Письмо своими словами: тот же путь, что и письмо из коллекции, только текст
  // набирает человек. Текст проходит тот же фильтр, что имена.
  const COMPOSER_MAX = 1800;
  function updateComposerCounter() {
    const field = $("#composerText");
    if (!field) return;
    setText("#composerCounter", t("composerCounter").replace("{count}", String(field.value.length)).replace("{max}", String(COMPOSER_MAX)));
  }

  function openOwnTextComposer(context = null) {
    composerContext = context && typeof context === "object" ? { ...context } : {};
    letterPickerContext = null;
    updateLetterPickerNote();
    renderLibrary();
    closePanel(layers.library);
    const sender = cleanName(composerContext.senderName || composerContext.sender) || fromName;
    const recipient = cleanName(composerContext.recipientName || composerContext.recipient) || toName;
    if (sender && recipient) setNames(sender, recipient, { explicit: true });
    setText("#composerRoute", sender && recipient ? qrRouteText(sender, recipient) : "");
    const field = $("#composerText");
    field.value = String(composerContext.initialText || "").normalize("NFKC").slice(0, COMPOSER_MAX);
    $("#composerError").hidden = true;
    updateComposerCounter();
    openPanel(layers.composer);
    requestAnimationFrame(() => field.focus({ preventScroll: true }));
  }

  function closeOwnTextComposer() {
    composerContext = null;
    closePanel(layers.composer);
  }

  function submitOwnText() {
    const field = $("#composerText");
    const value = String(field.value || "").normalize("NFKC").trim().slice(0, COMPOSER_MAX);
    const error = $("#composerError");
    if (value.length < 10) { error.textContent = t("composerEmpty"); error.hidden = false; field.focus(); return; }
    if (containsForbidden(value)) { error.textContent = t("composerForbidden"); error.hidden = false; field.focus(); return; }
    error.hidden = true;
    const context = composerContext;
    composerContext = null;
    closePanel(layers.composer);
    const result = displayPersonalLetter(value, context, context?.source || "custom");
    if (!result) return;
    const onComplete = context?.onComplete;
    if (typeof onComplete === "function") {
      Promise.resolve(onComplete(result)).catch(error => console.info("Moments letter completion failed", error));
    }
    showToast(t("customAdded"), 3200);
  }

  function composerToCollection() {
    const context = composerContext;
    composerContext = null;
    closePanel(layers.composer);
    openLetterPicker(context);
  }

  function openPaywall(feature = "") {
    if (feature === "letter") pendingPremiumFeature = "letter";
    $$(".price-label").forEach(label => label.textContent = premiumPrice); $$(".yearly-price-label").forEach(label => label.textContent = yearlyPrice);
    openPanel(layers.paywall);
    haptic([15, 40, 15]);
  }

  function closePaywall() {
    pendingPremiumFeature = "";
    closePanel(layers.paywall);
  }

  function applyEffectivePremium(reason = "") {
    const wasPremium = isPremium;
    isPremium = Boolean(nativePremium || cloudPremium);
    entitlementState = isPremium ? "premium" : "free";
    document.body.classList.toggle("gl-premium-active", isPremium);
    document.body.dataset.access = isPremium ? "vip" : "free";
    $(".premium-settings-card").hidden = isPremium;
    $(".free-note").hidden = isPremium;
    $("#manageSubscriptionButton").hidden = !nativePremium;
    setText("#accessLabel", isPremium ? t("allCount") : t("openCount"));
    renderLibrary();
    renderCloudAccount();
    renderSubscriptionCard();
    dispatchEvent(new CustomEvent("glowletter-access-change", { detail: { premium: isPremium, reason } }));
    if (isPremium) {
      const requested = pendingPremiumFeature;
      pendingPremiumFeature = "";
      closePanel(layers.paywall);
      purchaseAttemptPending = false;
      if (!wasPremium) showToast(t("premiumOn"), 3600);
      if (requested === "letter") openLetterPicker();
    } else {
      if (reason) console.info("Entitlement:", reason);
      // Раньше причина уходила только в консоль: человек жал «Оформить подписку»,
      // и ничего не происходило. Теперь молчание заменено объяснением — но лишь
      // тогда, когда покупку действительно запрашивали.
      if (purchaseAttemptPending) {
        const code = String(reason || "");
        const message = purchaseFailureMessage(code);
        if (code === "purchase_canceled") purchaseAttemptPending = false;
        else if (message) { purchaseAttemptPending = false; showToast(message, 6000); }
      }
      if (pendingPremiumFeature) openPaywall(pendingPremiumFeature);
    }
  }

  // Каждая причина, по которой окно оплаты не открылось или доступ не выдан,
  // получает понятную фразу. Пустая строка — промежуточный шаг, ждём дальше.
  function purchaseFailureMessage(code) {
    if (["subscription_not_configured_in_play_console", "subscription_base_plan_not_available", "ambiguous_subscription_base_plan", "subscription_offer_token_missing", "product_unavailable"].includes(code)) return t("purchaseNotConfigured");
    if (code === "authentication_required" || code === "account_session_changed") return t("cloudSignInPrompt");
    if (code === "billing_security_not_configured") return t("purchaseUnavailable");
    if (code.startsWith("product_query_")) return t("purchaseStoreSilent");
    if (code.startsWith("billing_unavailable_") || code === "billing_disconnected") return t("purchaseStoreUnavailable");
    if (code.startsWith("billing_launch_") || code.startsWith("purchase_update_")) return t("purchaseLaunchFailed");
    if (code === "purchase_pending") return t("purchasePending");
    if (code.startsWith("verification_") || code.startsWith("server_did_not_") || code === "purchase_not_completed") return t("purchaseVerifyPending");
    return "";
  }

  function rememberStoreYearlyPrice(value) {
    if (!String(value || "").trim()) return;
    yearlyPrice = localizedYearlyPrice(value);
    yearlyPriceFromStore = true;
  }

  function updatePremium(owned, price, reason = "", yearly = "") {
    rememberStoreYearlyPrice(yearly);
    const transient = owned !== true && owned !== "true" && ["initializing", "restoring_purchases", "verifying_purchase"].includes(String(reason || ""));
    if (transient) {
      entitlementState = "checking";
      if (price) {
        premiumPrice = localizedMonthlyPrice(price);
        premiumPriceFromStore = true;
      }
      $$(".price-label").forEach(label => label.textContent = premiumPrice); $$(".yearly-price-label").forEach(label => label.textContent = yearlyPrice);
      return;
    }
    nativePremium = owned === true || owned === "true";
    if (price) {
      premiumPrice = localizedMonthlyPrice(price);
      premiumPriceFromStore = true;
    }
    $$(".price-label").forEach(label => label.textContent = premiumPrice); $$(".yearly-price-label").forEach(label => label.textContent = yearlyPrice);
    applyEffectivePremium(reason);
  }

  function updatePurchaseConfiguration(configured) {
    if (typeof configured !== "boolean") return;
    purchaseConfigured = configured;
    [$("#purchaseButton"), $("#purchaseYearlyButton"), $("#settingsPurchase"), $("#restoreButton")].forEach(button => {
      if (!button) return;
      button.classList.toggle("is-unavailable", !configured);
      button.setAttribute("aria-disabled", String(!configured));
      button.title = configured ? "" : t("purchaseUnavailable");
    });
  }

  window.onNativeEntitlement = (owned, price, reason, yearly) => { if (trustedEntitlementSource) updatePremium(owned, price, reason, yearly); };

  // Обновление из Google Play: нативный слой сообщает состояние, плашка
  // предлагает скачать новую версию, а после загрузки — перезапустить.
  // «Скрыть» действует до конца сеанса и только для текущего шага.
  const APP_UPDATE_VISIBLE = ["available", "downloading", "downloaded"];
  let appUpdate = { status: "none", availableVersionCode: 0, progress: 0 };
  let appUpdateDismissedKey = "";

  function appUpdateKey() { return `${appUpdate.status}:${appUpdate.availableVersionCode}`; }

  function renderAppUpdate() {
    const banner = $("#appUpdateBanner");
    if (!banner) return;
    const visible = APP_UPDATE_VISIBLE.includes(appUpdate.status) && appUpdateDismissedKey !== appUpdateKey();
    banner.hidden = !visible;
    $("#appUpdateClose").setAttribute("aria-label", t("appUpdateHide"));
    if (!visible) return;
    const action = $("#appUpdateAction");
    if (appUpdate.status === "downloading") {
      setText("#appUpdateText", appUpdate.progress > 0 ? `${t("appUpdateDownloading")} ${appUpdate.progress}%` : t("appUpdateDownloading"));
      action.hidden = true;
      return;
    }
    const ready = appUpdate.status === "downloaded";
    setText("#appUpdateText", t(ready ? "appUpdateReady" : "appUpdateAvailable"));
    action.textContent = t(ready ? "appUpdateRestart" : "appUpdateButton");
    action.hidden = false;
  }

  window.onNativeAppUpdate = detail => {
    if (!trustedEntitlementSource || !detail) return;
    const status = String(detail.status || "none");
    appUpdate = {
      status: APP_UPDATE_VISIBLE.includes(status) ? status : "none",
      availableVersionCode: Number(detail.availableVersionCode) || 0,
      progress: Math.max(0, Math.min(100, Math.round(Number(detail.progress) || 0)))
    };
    renderAppUpdate();
  };

  function runAppUpdateAction() {
    if (appUpdate.status === "downloaded") window.NurAppUpdate?.completeUpdate?.();
    else if (appUpdate.status === "available") window.NurAppUpdate?.startUpdate?.();
  }

  function dismissAppUpdate() {
    appUpdateDismissedKey = appUpdateKey();
    renderAppUpdate();
  }

  async function requestNativeEntitlement() {
    try {
      if (!trustedEntitlementSource || !window.NurBilling?.getEntitlement) {
        nativePremium = false;
        applyEffectivePremium("native_billing_unavailable");
        updatePurchaseConfiguration(Boolean(CONFIG.playStoreUrl || CONFIG.appStoreUrl));
        return;
      }
      const raw = await Promise.resolve(window.NurBilling.getEntitlement());
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data) {
        updatePremium(Boolean(data.entitled ?? data.owned ?? data.premium), data.priceLabel || data.price, data.reason, data.yearlyPriceLabel);
        updatePurchaseConfiguration(data.purchaseConfigured);
      }
    } catch (error) {
      nativePremium = false;
      applyEffectivePremium("native_billing_error");
      console.info("Billing bridge not ready", error);
    }
  }

  function purchaseFullAccess() {
    if (IS_ANDROID_PLAY_APP && trustedEntitlementSource && window.NurBilling?.purchaseFullAccess) {
      if (!cloudSession?.access_token || !syncNativeBillingAuth(cloudSession)) {
        requestSignInForPurchase("monthly");
        return;
      }
      purchaseAttemptPending = true; window.NurBilling.purchaseFullAccess();
      return;
    }
    if (purchaseConfigured === false) { showToast(t("purchaseUnavailable"), 4300); return; }
    if (trustedEntitlementSource && window.NurBilling?.purchaseFullAccess) { purchaseAttemptPending = true; window.NurBilling.purchaseFullAccess(); return; }
    if (CONFIG.playStoreUrl) { window.open(CONFIG.playStoreUrl, "_blank", "noopener"); return; }
    showToast(t("purchaseUnavailable"), 4300);
  }

  // Подписка на год: тот же товар Google Play, основной план yearly.
  function purchaseYearly() {
    if (trustedEntitlementSource && typeof window.NurBilling?.purchaseYearly === "function") {
      if (IS_ANDROID_PLAY_APP && (!cloudSession?.access_token || !syncNativeBillingAuth(cloudSession))) {
        requestSignInForPurchase("yearly");
        return;
      }
      purchaseAttemptPending = true;
      window.NurBilling.purchaseYearly();
      return;
    }
    if (CONFIG.playStoreUrl) { window.open(CONFIG.playStoreUrl, "_blank", "noopener"); return; }
    showToast(t("purchaseUnavailable"), 4300);
  }

  function restorePurchase() {
    if (IS_ANDROID_PLAY_APP && trustedEntitlementSource && window.NurBilling?.restorePurchases) {
      if (!cloudSession?.access_token || !syncNativeBillingAuth(cloudSession)) {
        showToast(t("cloudSignInPrompt"), 3800);
        return;
      }
      window.NurBilling.restorePurchases();
      return;
    }
    if (purchaseConfigured === false) { showToast(t("purchaseUnavailable"), 3800); return; }
    if (trustedEntitlementSource && window.NurBilling?.restorePurchases) { window.NurBilling.restorePurchases(); return; }
    showToast(t("purchaseUnavailable"), 3800);
  }

  function manageSubscription() {
    if (trustedEntitlementSource && typeof window.NurBilling?.manageSubscription === "function") {
      window.NurBilling.manageSubscription();
      return;
    }
    const isAppleDevice = /iPad|iPhone|iPod|Macintosh/u.test(navigator.userAgent) && !/Android/u.test(navigator.userAgent);
    const target = isAppleDevice
      ? (CONFIG.appStoreUrl || "https://apps.apple.com/account/subscriptions")
      : (CONFIG.playStoreUrl || `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(CONFIG.subscriptionProductId || "glowletter_premium_monthly")}&package=com.franceisl.glowletternext`);
    window.open(target, "_blank", "noopener");
  }

  class RainScene {
    constructor(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext("2d", { alpha: true, desynchronized: true }); this.lite = LITE_DEVICE; this.mobile = MOBILE_DEVICE && !this.lite; this.enabled = localStorage.getItem("nurRain") !== "off" && !REDUCED_MOTION.matches; this.intensity = .58; this.drops = []; this.splashes = []; this.frame = 0; this.resizeFrame = 0; this.lastPaint = 0; this.scheduleResize = this.scheduleResize.bind(this); this.draw = this.draw.bind(this);
      addEventListener("resize", this.scheduleResize, { passive: true });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { cancelAnimationFrame(this.frame); this.frame = 0; }
        else if (this.enabled) this.start();
      });
      addEventListener("pagehide", () => { cancelAnimationFrame(this.frame); this.frame = 0; }, { passive: true });
      this.resize(); this.setEnabled(this.enabled, false);
    }
    scheduleResize() { if (this.resizeFrame) return; this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=0;this.resize();}); }
    resize() { const dpr = this.lite ? 1 : Math.min(devicePixelRatio || 1, this.mobile ? 1.2 : 1.5); this.width = innerWidth; this.height = innerHeight; this.canvas.width = Math.round(this.width * dpr); this.canvas.height = Math.round(this.height * dpr); this.canvas.style.width = `${this.width}px`; this.canvas.style.height = `${this.height}px`; this.ctx.setTransform(dpr,0,0,dpr,0,0); const count = this.lite ? Math.max(12, Math.min(26, Math.round(this.width / 42))) : this.mobile ? Math.max(14, Math.min(32, Math.round(this.width / 34))) : Math.max(18, Math.min(54, Math.round(this.width / 24))); this.drops = Array.from({ length: count }, () => this.makeDrop(true)); this.splashes=[]; }
    makeDrop(randomY = false) { return { x: Math.random() * (this.width + 240) - 120, y: randomY ? Math.random() * this.height : -60, length: 22 + Math.random() * 43, speed: 7 + Math.random() * 9, width: 1.1 + Math.random() * 1.7, alpha: .11 + Math.random() * .28, drift: 1.5 + Math.random() * 2.7 }; }
    setEnabled(enabled, persist = true) { this.enabled = Boolean(enabled); this.canvas.classList.toggle("is-off", !this.enabled); $("#rainToggle").classList.toggle("is-active", this.enabled); $("#rainToggle").setAttribute("aria-pressed", String(this.enabled)); $("#rainToggle b").textContent = this.enabled ? t("stateOn") : t("stateOff"); if (persist) { localStorage.setItem("nurRain", this.enabled ? "on" : "off"); scheduleCloudSync(); } if (this.enabled) this.start(); else { cancelAnimationFrame(this.frame); this.frame=0; this.ctx.clearRect(0,0,this.width,this.height); } }
    setIntensity(value) { this.intensity = Math.max(.2, Math.min(1, value)); }
    start() { if(!this.enabled||document.hidden)return;cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(this.draw); }
    draw(timestamp = 0) { if (!this.enabled || document.hidden) { this.frame=0; return; } if((this.lite||this.mobile)&&timestamp-this.lastPaint<32){this.frame=requestAnimationFrame(this.draw);return;}this.lastPaint=timestamp; const ctx = this.ctx; ctx.clearRect(0,0,this.width,this.height); ctx.lineCap = "round"; for (let i=0;i<this.drops.length * this.intensity;i++) { const drop=this.drops[i]; if(this.lite||this.mobile){ctx.strokeStyle=`rgba(221,239,248,${drop.alpha*(this.lite ? .72 : .86)})`;}else{const gradient=ctx.createLinearGradient(drop.x,drop.y,drop.x+drop.drift,drop.y+drop.length);gradient.addColorStop(0,"rgba(220,236,245,0)");gradient.addColorStop(1,`rgba(221,239,248,${drop.alpha})`);ctx.strokeStyle=gradient;}ctx.lineWidth=drop.width;ctx.beginPath();ctx.moveTo(drop.x,drop.y);ctx.lineTo(drop.x+drop.drift,drop.y+drop.length);ctx.stroke();drop.x+=drop.drift;drop.y+=drop.speed;if(drop.y>this.height-5){const splashChance=this.lite ? .1 : (this.mobile ? .14 : .24);const splashLimit=this.lite?5:(this.mobile?8:18);if(Math.random()<splashChance&&this.splashes.length<splashLimit)this.splashes.push({x:drop.x,y:this.height-4,r:1,a:.35});this.drops[i]=this.makeDrop(false);} }
      this.splashes=this.splashes.filter(s=>{ctx.strokeStyle=`rgba(220,239,247,${s.a})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(s.x,s.y,s.r*2.3,s.r*.55,0,0,Math.PI*2);ctx.stroke();s.r+=.8;s.a-=.045;return s.a>0;}); this.frame=requestAnimationFrame(this.draw); }
  }

  class NatureSoundscape {
    constructor() { this.context=null;this.master=null;this.wind=null;this.timers=new Set(); }
    async start() { if (!this.context) this.create(); await this.context.resume(); this.master.gain.setTargetAtTime(.58,this.context.currentTime,.6); this.scheduleCricket();this.scheduleFrog(); }
    create() { const AudioCtx=window.AudioContext||window.webkitAudioContext;this.context=new AudioCtx();this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination); const length=this.context.sampleRate*2;const buffer=this.context.createBuffer(1,length,this.context.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*.34;const noise=this.context.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=this.context.createBiquadFilter();filter.type="lowpass";filter.frequency.value=520;const gain=this.context.createGain();gain.gain.value=.018;noise.connect(filter).connect(gain).connect(this.master);noise.start();this.wind=noise; }
    stop() { if(!this.context)return;this.master.gain.setTargetAtTime(0,this.context.currentTime,.3);this.timers.forEach(clearTimeout);this.timers.clear();setTimeout(()=>{if(!isNaturePlaying)this.context?.suspend?.().catch(()=>{});},500); }
    scheduleCricket() { if(!isNaturePlaying)return;const timer=setTimeout(()=>{this.timers.delete(timer);if(!isNaturePlaying)return;const now=this.context.currentTime;for(let i=0;i<4;i++){const osc=this.context.createOscillator();const gain=this.context.createGain();osc.type="sine";osc.frequency.value=3900+Math.random()*800;gain.gain.setValueAtTime(0,now+i*.09);gain.gain.linearRampToValueAtTime(.018,now+i*.09+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.055);osc.connect(gain).connect(this.master);osc.start(now+i*.09);osc.stop(now+i*.09+.07);}this.scheduleCricket();},3500+Math.random()*6500);this.timers.add(timer); }
    scheduleFrog() { if(!isNaturePlaying)return;const timer=setTimeout(()=>{this.timers.delete(timer);if(!isNaturePlaying)return;const now=this.context.currentTime;for(let i=0;i<2;i++){const osc=this.context.createOscillator();const gain=this.context.createGain();osc.type="triangle";osc.frequency.setValueAtTime(155+i*22,now+i*.2);osc.frequency.exponentialRampToValueAtTime(92,now+i*.2+.28);gain.gain.setValueAtTime(.0001,now+i*.2);gain.gain.exponentialRampToValueAtTime(.024,now+i*.2+.04);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.2+.32);osc.connect(gain).connect(this.master);osc.start(now+i*.2);osc.stop(now+i*.2+.35);}this.scheduleFrog();},11000+Math.random()*15000);this.timers.add(timer); }
  }

  const rainScene = new RainScene($("#rainCanvas"));
  const nature = new NatureSoundscape();

  function setNaturePlaying(enabled, announce = true) {
    isNaturePlaying = Boolean(enabled);
    $("#natureButton").classList.toggle("is-playing", isNaturePlaying); $("#natureButton").setAttribute("aria-pressed", String(isNaturePlaying)); $("#natureButton").setAttribute("aria-label", t(isNaturePlaying ? "natureOffAria" : "natureOnAria")); $("#natureToggle").classList.toggle("is-active", isNaturePlaying); $("#natureToggle").setAttribute("aria-pressed", String(isNaturePlaying)); $("#natureToggle b").textContent = isNaturePlaying ? t("stateOn") : t("stateOff");
    if (isNaturePlaying) nature.start().catch(() => {}); else nature.stop();
    localStorage.setItem("nurNature", isNaturePlaying ? "on" : "off");
    scheduleCloudSync();
    if (announce) showToast(isNaturePlaying ? t("natureOn") : t("natureOff"));
  }

  function toggleNature() { setNaturePlaying(!(isNaturePlaying || localStorage.getItem("nurNature") === "on")); }

  function createAtmosphere() {
    // Звёзды и метеоры: небо должно жить, но не мельтешить. Мерцание у каждой
    // звезды своё, метеор проходит раз в 9–16 секунд.
    const starHolder=$("#nightStars");const meteorHolder=$("#meteors");
    const starCount=LITE_DEVICE?0:(MOBILE_DEVICE?26:48);const meteorCount=LITE_DEVICE?0:(MOBILE_DEVICE?2:3);
    for(let i=0;i<starCount;i++){const star=document.createElement("i");star.className="night-star";star.style.setProperty("--left",`${Math.random()*100}%`);star.style.setProperty("--top",`${Math.random()*46}%`);star.style.setProperty("--size",`${1.4+Math.random()*2.2}px`);star.style.setProperty("--dim",(0.45+Math.random()*0.5).toFixed(2));star.style.setProperty("--duration",`${3+Math.random()*4.5}s`);star.style.setProperty("--delay",`-${Math.random()*7}s`);starHolder?.append(star);}
    for(let i=0;i<meteorCount;i++){const meteor=document.createElement("i");meteor.className="meteor";meteor.style.setProperty("--left",`${35+Math.random()*60}%`);meteor.style.setProperty("--top",`${4+Math.random()*26}%`);meteor.style.setProperty("--tail",`${70+Math.random()*50}px`);meteor.style.setProperty("--duration",`${9+Math.random()*7}s`);meteor.style.setProperty("--delay",`-${Math.random()*12}s`);meteorHolder?.append(meteor);}
    const colors=["#b7634b","#d48a59","#d59aa8","#8c684c","#d6a75c"];
    const leafCount=LITE_DEVICE?6:(MOBILE_DEVICE?9:18);const emberCount=LITE_DEVICE?0:(MOBILE_DEVICE?5:15);
    for(let i=0;i<leafCount;i++){const leaf=document.createElement("i");leaf.className="leaf";leaf.style.setProperty("--left",`${-5+Math.random()*106}%`);leaf.style.setProperty("--size",`${8+Math.random()*12}px`);leaf.style.setProperty("--duration",`${10+Math.random()*13}s`);leaf.style.setProperty("--delay",`${-Math.random()*20}s`);leaf.style.setProperty("--opacity",`${.2+Math.random()*.5}`);leaf.style.setProperty("--leaf-color",colors[Math.floor(Math.random()*colors.length)]);$("#leaves").append(leaf);}
    for(let i=0;i<emberCount;i++){const ember=document.createElement("i");ember.className="ember";ember.style.setProperty("--left",`${42+Math.random()*19}%`);ember.style.setProperty("--size",`${1+Math.random()*3}px`);ember.style.setProperty("--duration",`${3.2+Math.random()*3}s`);ember.style.setProperty("--delay",`${-Math.random()*5}s`);ember.style.setProperty("--drift",`${-35+Math.random()*70}px`);$("#embers").append(ember);}
  }

  function base64ToBlob(base64, mime) { base64=String(base64).replace(/\s+/g,"");const arrays=[];for(let offset=0;offset<base64.length;offset+=512*1024){const end=Math.min(base64.length,offset+512*1024);const safeEnd=end<base64.length?end-(end-offset)%4:end;const binary=atob(base64.slice(offset,safeEnd));const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);arrays.push(bytes);offset=safeEnd-512*1024;}return new Blob(arrays,{type:mime}); }

  function readSharedAudioToken(rawUrl = location.href) {
    try {
      const url = new URL(String(rawUrl || location.href), location.href);
      const token = new URLSearchParams(url.hash.replace(/^#/, "")).get("audio") || "";
      return SHARED_AUDIO_TOKEN_PATTERN.test(token) ? token : "";
    } catch {
      return "";
    }
  }

  function audioDescriptor(blob, name = customAudioName) {
    if (!(blob instanceof Blob) || blob.size < 1 || blob.size > SHARED_AUDIO_MAX_BYTES) return null;
    const extension = String(name || "").split(".").pop()?.toLowerCase() || "";
    const mimeType = SHARED_AUDIO_TYPES[extension];
    if (!mimeType) return null;
    const declared = String(blob.type || "").split(";", 1)[0].trim().toLowerCase();
    const accepted = new Set(["", mimeType, "audio/mp3", "audio/x-mp3", "audio/m4a", "audio/x-m4a", "audio/x-aac", "audio/x-wav", "audio/vnd.wave", "application/ogg", "video/mp4"]);
    return accepted.has(declared) ? { extension, mimeType } : null;
  }

  function audioFingerprint() {
    // This value only identifies the locally persisted selection so an
    // already-published temporary copy can be reused. It is not a security
    // token and does not need to hash the whole file. Avoiding subtle.digest
    // keeps audio sharing available in local iOS WKWebViews and avoids a
    // second 12 MB allocation on memory-constrained phones.
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  async function currentCloudAccessToken(forceRefresh = false) {
    if (!cloudClient || !cloudUser?.id) throw new Error("authentication_required");
    const result = forceRefresh
      ? await cloudClient.auth.refreshSession()
      : await cloudClient.auth.getSession();
    const session = result?.data?.session || null;
    if (result?.error || !session?.access_token || session.user?.id !== cloudUser.id) {
      throw new Error("authentication_required");
    }
    // onAuthStateChange also receives refreshed sessions, but update the
    // in-memory value immediately so a share started after app resume cannot
    // accidentally reuse an expired bearer token.
    cloudSession = session;
    syncNativeBillingAuth(session);
    return session.access_token;
  }

  async function sharedAudioRequest(action, payload = {}, requireUser = false) {
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) throw new Error("audio_service_unavailable");
    for (let attempt = 0; attempt < (requireUser ? 2 : 1); attempt += 1) {
      const headers = { "Content-Type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY };
      if (requireUser) headers.Authorization = `Bearer ${await currentCloudAccessToken(attempt > 0)}`;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${SHARED_AUDIO_FUNCTION}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, ...payload }),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer"
      });
      let data = null;
      try { data = await response.json(); } catch {}
      if (response.ok) return data || {};
      if (requireUser && response.status === 401 && attempt === 0) continue;
      const error = new Error(String(data?.error || "audio_service_unavailable"));
      error.status = response.status;
      throw error;
    }
    throw new Error("authentication_required");
  }

  function clearAudioSource() {
    audio.pause();
    if (currentAudioUrl.startsWith("blob:")) URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = "";
    audio.removeAttribute("src");
    audio.load();
    isMusicPlaying = false;
    $("#soundButton").classList.remove("is-playing");
    $("#soundButton").setAttribute("aria-pressed", "false");
  }

  function renderAudioControls() {
    const hasLocalAudio = customAudioBlob instanceof Blob;
    const hasSharedAudio = Boolean(incomingSharedAudioToken);
    selectedTrack = hasLocalAudio ? 3 : -1;
    $("#customTrackButton")?.classList.toggle("is-active", hasLocalAudio);
    if ($("#customTrackName")) $("#customTrackName").textContent = hasLocalAudio ? (customAudioName || t("customMusic")) : t("customMusicNote");
    if ($("#removeAudioButton")) $("#removeAudioButton").hidden = !hasLocalAudio;
    if ($("#soundButton")) $("#soundButton").hidden = !(hasLocalAudio || hasSharedAudio);
  }

  async function persistCustomAudio() {
    if (!customAudioBlob) return saveMedia("audio", null);
    return saveMedia("audio", {
      blob: customAudioBlob,
      name: customAudioName,
      fingerprint: customAudioFingerprint,
      temporaryShare: outgoingAudioShare
    });
  }

  async function ensureTemporarySharedAudio() {
    if (!customAudioBlob) return incomingSharedAudioToken || "";
    if (!cloudUser?.id || !cloudSession?.access_token || !cloudClient) throw new Error("authentication_required");
    const descriptor = audioDescriptor(customAudioBlob, customAudioName);
    if (!descriptor) throw new Error("invalid_audio_metadata");
    if (!customAudioFingerprint) customAudioFingerprint = audioFingerprint();
    const reusable = outgoingAudioShare
      && outgoingAudioShare.fingerprint === customAudioFingerprint
      && SHARED_AUDIO_TOKEN_PATTERN.test(outgoingAudioShare.token || "")
      && Date.parse(outgoingAudioShare.expiresAt || "") > Date.now() + 5 * 60 * 1000;
    if (reusable) return outgoingAudioShare.token;

    showToast(t("audioPreparing"), 5000);
    const reservation = await sharedAudioRequest("reserve", {
      mimeType: descriptor.mimeType,
      sizeBytes: customAudioBlob.size
    }, true);
    if (!reservation.objectPath || !reservation.uploadToken || !reservation.shareToken) throw new Error("audio_upload_unavailable");
    // File pickers use different aliases for the same format (for example
    // video/mp4 or audio/x-m4a on iOS). Force the canonical, server-approved
    // type on the uploaded Blob so final verification is identical on every
    // platform.
    const uploadBlob = customAudioBlob.slice(0, customAudioBlob.size, descriptor.mimeType);
    const { error: uploadError } = await cloudClient.storage
      .from(SHARED_AUDIO_BUCKET)
      .uploadToSignedUrl(reservation.objectPath, reservation.uploadToken, uploadBlob, {
        contentType: reservation.contentType || descriptor.mimeType,
        upsert: false
      });
    let finalized;
    try {
      // Finalize even when the browser reports an upload error: the request may
      // have reached Storage before the response was lost. If it did not, the
      // server securely removes the pending reservation immediately instead of
      // leaving it to consume the user's upload limit for two hours.
      finalized = await sharedAudioRequest("finalize", { shareToken: reservation.shareToken }, true);
    } catch (error) {
      if (uploadError) throw new Error("audio_upload_unavailable");
      throw error;
    }
    if (finalized.ready !== true || !SHARED_AUDIO_TOKEN_PATTERN.test(finalized.shareToken || "")) throw new Error("audio_finalize_failed");
    outgoingAudioShare = {
      token: finalized.shareToken,
      expiresAt: finalized.expiresAt,
      fingerprint: customAudioFingerprint
    };
    await persistCustomAudio();
    return outgoingAudioShare.token;
  }

  async function resolveIncomingSharedAudio(force = false) {
    if (!incomingSharedAudioToken) throw new Error("audio_unavailable");
    if (!force && resolvedSharedAudio?.token === incomingSharedAudioToken && resolvedSharedAudio.refreshAt > Date.now()) return resolvedSharedAudio.url;
    const result = await sharedAudioRequest("resolve", { shareToken: incomingSharedAudioToken });
    if (!result.signedPlaybackUrl) throw new Error("audio_unavailable");
    const ttl = Math.max(1, Math.min(Number(result.playbackExpiresIn) || 300, 300));
    resolvedSharedAudio = {
      token: incomingSharedAudioToken,
      url: result.signedPlaybackUrl,
      refreshAt: Date.now() + Math.max(15, ttl - 15) * 1000
    };
    return resolvedSharedAudio.url;
  }

  async function setAudioSource({ refreshRemote = false } = {}) {
    clearAudioSource();
    if (incomingSharedAudioToken) {
      currentAudioUrl = await resolveIncomingSharedAudio(refreshRemote);
      audio.src = currentAudioUrl;
    } else if (customAudioBlob) {
      currentAudioUrl = URL.createObjectURL(customAudioBlob);
      audio.src = currentAudioUrl;
    } else {
      throw new Error("audio_unavailable");
    }
    audio.load();
  }

  async function playMusic(quiet = false) {
    // Тихий режим не должен прятать проблему, когда в письме действительно
    // есть мелодия: иначе получатель просто не понимает, почему тишина.
    const silent = quiet && !incomingSharedAudioToken;
    try {
      if (!audio.src) await setAudioSource();
      await audio.play();
      isMusicPlaying = true;
      audioRecoveryAttempted = false;
      $("#soundButton").classList.add("is-playing");
      $("#soundButton").setAttribute("aria-pressed", "true");
      $("#soundButton").setAttribute("aria-label", t("soundOffAria"));
    } catch (error) {
      const unavailable = ["audio_unavailable", "invalid_share_token"].includes(String(error?.message || "")) || error?.status === 404;
      if (unavailable && incomingSharedAudioToken) {
        incomingSharedAudioToken = "";
        resolvedSharedAudio = null;
        renderAudioControls();
        showToast(t("audioExpired"));
      } else if (!silent) {
        showToast(t("audioPlayFail"));
      }
    }
  }

  function pauseMusic() {
    audio.pause();
    isMusicPlaying = false;
    $("#soundButton").classList.remove("is-playing");
    $("#soundButton").setAttribute("aria-pressed", "false");
    $("#soundButton").setAttribute("aria-label", t("soundOnAria"));
  }

  async function selectCustomAudio(file) {
    if (!file) return;
    if (file.size > SHARED_AUDIO_MAX_BYTES) return showToast(t("audioTooLarge"));
    if (!audioDescriptor(file, file.name)) return showToast(t("audioUnsupported"));
    clearAudioSource();
    customAudioBlob = file;
    customAudioName = file.name;
    customAudioFingerprint = "";
    outgoingAudioShare = null;
    selectedTrack = 3;
    localStorage.setItem("nurTrack", "3");
    renderAudioControls();
    try { await persistCustomAudio(); } catch {}
    await playMusic();
  }

  async function removeCustomAudio() {
    clearAudioSource();
    customAudioBlob = null;
    customAudioName = "";
    customAudioFingerprint = "";
    outgoingAudioShare = null;
    selectedTrack = -1;
    localStorage.removeItem("nurTrack");
    try { await saveMedia("audio", null); } catch {}
    renderAudioControls();
    showToast(t("audioRemoved"));
  }

  function handleSharedAudioNavigation() {
    const nextToken = readSharedAudioToken(location.href);
    if (nextToken === incomingSharedAudioToken) return;
    clearAudioSource();
    incomingSharedAudioToken = nextToken;
    resolvedSharedAudio = null;
    audioRecoveryAttempted = false;
    renderAudioControls();
  }

  function openMediaDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open("nur-letter-media",1);request.onupgradeneeded=()=>request.result.createObjectStore("assets");request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  async function saveMedia(key,value){const db=await openMediaDb();await new Promise((resolve,reject)=>{const tx=db.transaction("assets","readwrite");tx.objectStore("assets").put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}
  async function deleteMedia(key){const db=await openMediaDb();await new Promise((resolve,reject)=>{const tx=db.transaction("assets","readwrite");tx.objectStore("assets").delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}
  async function loadMedia(key){const db=await openMediaDb();const value=await new Promise((resolve,reject)=>{const request=db.transaction("assets").objectStore("assets").get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});db.close();return value;}

  function accountAvatarStorageKey(userId){return `profile-avatar:${String(userId||"")}`;}
  function clearAccountAvatarPreview(){if(accountAvatarUrl)URL.revokeObjectURL(accountAvatarUrl);accountAvatarUrl="";accountAvatarUserId="";const image=$("#accountAvatarImage");if(image){image.hidden=true;image.removeAttribute("src");}$("#accountAvatar")?.removeAttribute("hidden");}
  function applyAccountAvatar(blob,userId){if(!blob||cloudUser?.id!==userId)return;clearAccountAvatarPreview();accountAvatarUserId=userId;accountAvatarUrl=URL.createObjectURL(blob);const image=$("#accountAvatarImage");image.src=accountAvatarUrl;image.hidden=false;$("#accountAvatar").hidden=true;}
  async function loadAccountAvatar(userId){clearAccountAvatarPreview();if(!userId)return;try{const saved=await loadMedia(accountAvatarStorageKey(userId));if(cloudUser?.id===userId&&saved?.blob)applyAccountAvatar(saved.blob,userId);else if(cloudUser?.id===userId)renderCloudAccount();}catch{if(cloudUser?.id===userId)renderCloudAccount();}}
  async function optimizeAccountAvatar(file){const bitmap=await createImageBitmap(file);const side=Math.min(bitmap.width,bitmap.height);const output=Math.max(1,Math.min(512,side));const canvas=document.createElement("canvas");canvas.width=output;canvas.height=output;canvas.getContext("2d").drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,output,output);bitmap.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.9));if(!blob)throw new Error("avatar encoding failed");return blob;}
  async function selectAccountAvatar(event){const input=event.currentTarget;const file=input.files?.[0];input.value="";if(!file||!cloudUser?.id)return;if(!file.type.startsWith("image/")||file.size>8*1024*1024){showToast(t("profilePhotoTooLarge"));return;}const userId=cloudUser.id;try{const blob=await optimizeAccountAvatar(file);if(cloudUser?.id!==userId)return;await saveMedia(accountAvatarStorageKey(userId),{blob});applyAccountAvatar(blob,userId);showToast(t("profilePhotoReady"));}catch{showToast(t("profilePhotoFail"));}}

  async function optimizeBackground(file){const bitmap=await createImageBitmap(file);const scale=Math.min(1,1920/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement("canvas");canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext("2d").drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();return new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.88));}
  function applyBackground(blob){if(backgroundUrl)URL.revokeObjectURL(backgroundUrl);if(mobileBackgroundUrl&&mobileBackgroundUrl!==backgroundUrl)URL.revokeObjectURL(mobileBackgroundUrl);backgroundUrl=URL.createObjectURL(blob);mobileBackgroundUrl=backgroundUrl;document.documentElement.style.setProperty("--scene-image",`url("${backgroundUrl}")`);document.documentElement.style.setProperty("--mobile-scene-image",`url("${backgroundUrl}")`);$("#backgroundPreview").style.backgroundImage=`url("${backgroundUrl}")`;document.body.classList.add("has-custom-background");customBackgroundBlob=blob;}
  async function imageAsset(path){try{const response=await fetch(path,{cache:"force-cache"});if(response.ok)return response.blob();const fallback=await fetch(`${path}.b64`);if(fallback.ok)return base64ToBlob(await fallback.text(),"image/png");}catch{}return null;}
  async function setupBackground(){try{const saved=await loadMedia("background");if(saved?.blob){applyBackground(saved.blob);return;}}catch{}const [landscape,portrait]=await Promise.all([imageAsset("assets/campfire-lake.png"),imageAsset("assets/campfire-mobile.png")]);if(landscape){backgroundUrl=URL.createObjectURL(landscape);document.documentElement.style.setProperty("--scene-image",`url("${backgroundUrl}")`);$("#backgroundPreview").style.backgroundImage=`url("${backgroundUrl}")`;}if(portrait){mobileBackgroundUrl=URL.createObjectURL(portrait);document.documentElement.style.setProperty("--mobile-scene-image",`url("${mobileBackgroundUrl}")`);} }
  async function resetBackground(){try{await saveMedia("background",null);}catch{}if(backgroundUrl)URL.revokeObjectURL(backgroundUrl);if(mobileBackgroundUrl&&mobileBackgroundUrl!==backgroundUrl)URL.revokeObjectURL(mobileBackgroundUrl);backgroundUrl="";mobileBackgroundUrl="";customBackgroundBlob=null;document.documentElement.style.removeProperty("--scene-image");document.documentElement.style.removeProperty("--mobile-scene-image");document.body.classList.remove("has-custom-background");$("#backgroundPreview").style.backgroundImage="";await setupBackground();showToast(t("photoReset"));}

  const weatherMap={0:["sun","Clear"],1:["cloud","Mostly clear"],2:["cloud","Cloudy"],3:["cloud","Overcast"],45:["fog","Fog"],48:["fog","Fog"],51:["rain","Drizzle"],53:["rain","Drizzle"],55:["rain","Drizzle"],61:["rain","Rain"],63:["rain","Rain"],65:["rain","Heavy rain"],71:["snow","Snow"],73:["snow","Snow"],75:["snow","Snow"],80:["rain","Showers"],81:["rain","Showers"],82:["rain","Showers"],95:["bolt","Storm"],96:["bolt","Storm"],99:["bolt","Storm"]};
  const weatherFallbacks={
    "Europe/Paris":{latitude:48.8566,longitude:2.3522,place:"Paris"},"Europe/London":{latitude:51.5072,longitude:-.1276,place:"London"},"Europe/Moscow":{latitude:55.7558,longitude:37.6173,place:"Moscow"},
    "America/New_York":{latitude:40.7128,longitude:-74.006,place:"New York"},"America/Los_Angeles":{latitude:34.0522,longitude:-118.2437,place:"Los Angeles"},"Asia/Dubai":{latitude:25.2048,longitude:55.2708,place:"Dubai"},
    "Asia/Tokyo":{latitude:35.6762,longitude:139.6503,place:"Tokyo"},"Asia/Almaty":{latitude:43.2389,longitude:76.8897,place:"Almaty"},"Asia/Tashkent":{latitude:41.2995,longitude:69.2401,place:"Tashkent"}
  };

  function fallbackWeatherLocation(){
    let timezone="";try{timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch{}
    return weatherFallbacks[timezone]||{latitude:48.8566,longitude:2.3522,place:"Paris"};
  }

  function requestWeatherPosition(){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error("geolocation unavailable"));
      navigator.geolocation.getCurrentPosition(position=>resolve({latitude:position.coords.latitude,longitude:position.coords.longitude,place:""}),reject,{enableHighAccuracy:false,timeout:7000,maximumAge:30*60*1000});
    });
  }

  async function refreshWeather({silent=false}={}){
    if(IS_ANDROID_PLAY_APP){disableWeather({sync:false});return;}
    weatherEnabled=true;localStorage.setItem("nurWeather","on");
    $("#weatherButton")?.setAttribute("aria-busy","true");if($("#weatherText"))$("#weatherText").textContent="…";
    let locationData;
    try{locationData=await requestWeatherPosition();}
    catch{locationData=fallbackWeatherLocation();if(!silent)showToast(t("locationDenied"),3300);}
    try{
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${Number(locationData.latitude).toFixed(3)}&longitude=${Number(locationData.longitude).toFixed(3)}&current=temperature_2m,weather_code,is_day&timezone=auto`;
      const response=await fetch(url,{headers:{Accept:"application/json"}});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();const temperature=Number(data.current?.temperature_2m);const code=Number(data.current?.weather_code);if(!Number.isFinite(temperature)||!Number.isFinite(code))throw new Error("invalid weather");
      weatherSnapshot={temperature,code,isDay:Number(data.current?.is_day),place:locationData.place||"",updatedAt:Date.now()};
      localStorage.setItem(WEATHER_STORAGE_KEY,JSON.stringify(weatherSnapshot));document.body.dataset.weather=String(code);renderWeather();scheduleCloudSync();
    }catch{
      $("#weatherButton")?.removeAttribute("aria-busy");renderWeather();if(!weatherSnapshot){weatherEnabled=false;localStorage.setItem("nurWeather","off");renderWeather();}if(!silent)showToast(t("weatherFail"));
    }
  }

  function disableWeather({sync=true}={}){
    weatherEnabled=false;localStorage.setItem("nurWeather","off");localStorage.removeItem(WEATHER_STORAGE_KEY);weatherSnapshot=null;document.body.removeAttribute("data-weather");renderWeather();if(sync)scheduleCloudSync();
  }

  function toggleWeather(){if(IS_ANDROID_PLAY_APP){disableWeather({sync:false});return;}if(weatherEnabled)disableWeather();else refreshWeather();}

  function canvasLetterTypography() {
    const style = getComputedStyle(document.body);
    return {
      family: style.getPropertyValue("--gl-letter-font").trim() || '"Cormorant Garamond", Georgia, serif',
      bodyStyle: style.getPropertyValue("--gl-letter-style").trim() || "normal",
      signatureStyle: style.getPropertyValue("--gl-letter-signature-style").trim() || "italic",
      bodyWeight: style.getPropertyValue("--gl-letter-body-weight").trim() || "600",
      headingWeight: style.getPropertyValue("--gl-letter-heading-weight").trim() || "600"
    };
  }

  function canvasLetterFont(typography, size, { signature = false, heading = false } = {}) {
    const fontStyle = signature ? typography.signatureStyle : typography.bodyStyle;
    const weight = heading ? typography.headingWeight : typography.bodyWeight;
    return `${fontStyle} ${weight} ${size}px ${typography.family}`;
  }

  // Thai, Chinese and Japanese put no spaces between words: the browser's
  // segmenter finds the break points, and only real spaces stay in the text.
  const SEGMENTED_LANGUAGES = new Set(["th", "zh", "ja"]);
  function canvasTokens(paragraph) {
    const chunks = paragraph.trim().split(/\s+/).filter(Boolean);
    let segmenter = null;
    if (SEGMENTED_LANGUAGES.has(lang) && typeof Intl.Segmenter === "function") {
      try { segmenter = new Intl.Segmenter(HTML_LANGS[lang] || lang, { granularity: "word" }); } catch {}
    }
    if (!segmenter) return chunks.map(text => ({ text, glue: " " }));
    const tokens = [];
    for (const chunk of chunks) {
      Array.from(segmenter.segment(chunk), part => part.segment).forEach((text, index) => tokens.push({ text, glue: index ? "" : " " }));
    }
    return tokens;
  }

  function canvasWrappedLines(ctx, text, maxWidth) {
    const lines = [];
    const normalized = String(text || "").replace(/\r\n?/g, "\n").trim();
    const rawParagraphs = normalized ? normalized.split(/\n{2,}/).map(paragraph => paragraph.replace(/\n+/g, " ")).filter(Boolean) : [""];
    const paragraphs = rawParagraphs.length > 8 ? [rawParagraphs.join(" ")] : rawParagraphs;
    const pushToken = (token, currentLine) => {
      let line = currentLine;
      for (const character of Array.from(token)) {
        const candidate = `${line}${character}`;
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = character;
        } else {
          line = candidate;
        }
      }
      return line;
    };

    paragraphs.forEach((paragraph, paragraphIndex) => {
      let line = "";
      for (const token of canvasTokens(paragraph)) {
        const candidate = line ? `${line}${token.glue}${token.text}` : token.text;
        if (ctx.measureText(candidate).width <= maxWidth) {
          line = candidate;
        } else if (line) {
          lines.push(line);
          line = ctx.measureText(token.text).width <= maxWidth ? token.text : pushToken(token.text, "");
        } else {
          line = pushToken(token.text, "");
        }
      }
      if (line) lines.push(line);
      if (paragraphIndex < paragraphs.length - 1) lines.push("");
    });
    return lines.length ? lines : [""];
  }

  function fitCanvasParagraph(ctx, text, typography, maxWidth, maxHeight) {
    for (let size = 55; size >= 14; size -= 1) {
      ctx.font = canvasLetterFont(typography, size);
      const lineHeight = Math.round(size * 1.42);
      const lines = canvasWrappedLines(ctx, text, maxWidth);
      if (lines.length * lineHeight <= maxHeight) return { lines, lineHeight };
    }
    ctx.font = canvasLetterFont(typography, 14);
    const lines = canvasWrappedLines(ctx, text, maxWidth);
    return { lines, lineHeight: Math.max(1, Math.floor(maxHeight / Math.max(1, lines.length))) };
  }

  function fitCanvasSingleLine(ctx, text, typography, maxWidth, maxSize, options = {}) {
    for (let size = maxSize; size >= 16; size -= 1) {
      const font = canvasLetterFont(typography, size, options);
      ctx.font = font;
      if (ctx.measureText(text).width <= maxWidth) return font;
    }
    return canvasLetterFont(typography, 16, options);
  }

  async function generatePostcard(){
    const entry=currentEntry();if(!canAccess(entry))return openPaywall();
    const typography=canvasLetterTypography();
    const bodyText=entryText(entry);const recipientText=`${t("for")} ${displayName(toName)}`;const signatureText=`${t("from")} ${displayName(fromName)}`;
    try{if(document.fonts){await Promise.all([document.fonts.load(canvasLetterFont(typography,55),bodyText),document.fonts.load(canvasLetterFont(typography,66,{heading:true}),recipientText),document.fonts.load(canvasLetterFont(typography,49,{signature:true,heading:true}),signatureText),document.fonts.ready]);}}catch{}
    const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext("2d");const image=new Image();image.src=backgroundUrl||"assets/campfire-lake.png";
    try{await image.decode();const scale=Math.max(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h);}catch{ctx.fillStyle="#302335";ctx.fillRect(0,0,canvas.width,canvas.height);}
    const gradient=ctx.createLinearGradient(0,0,0,canvas.height);gradient.addColorStop(0,"rgba(20,18,28,.3)");gradient.addColorStop(.42,"rgba(26,19,28,.46)");gradient.addColorStop(1,"rgba(15,11,18,.88)");ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);
    // Рамка «Розы» ложится на края открытки так же, как на экране, и текст отодвигается от неё.
    const inset=document.body.dataset.glFrame==="roses"?await drawRosesFrame(ctx,canvas.width,canvas.height):0;
    const margin=Math.max(90,inset-40),textWidth=canvas.width-margin*2,top=Math.max(130,inset-10),bottom=canvas.height-Math.max(155,inset+10);
    ctx.fillStyle="#f1b8cb";ctx.font="700 24px system-ui";ctx.letterSpacing="6px";ctx.fillText("GLOWLETTER",margin,top);ctx.letterSpacing="0px";const rtl=isRtl();const textStart=rtl?canvas.width-margin:margin;const textEnd=rtl?margin:canvas.width-margin;if(rtl)ctx.direction="rtl";ctx.textAlign=rtl?"right":"left";
    ctx.fillStyle="#fff8ed";ctx.font=fitCanvasSingleLine(ctx,recipientText,typography,textWidth,66,{heading:true});ctx.fillText(recipientText,textStart,top+140);
    ctx.strokeStyle="rgba(255,238,229,.38)";ctx.beginPath();ctx.moveTo(margin,top+186);ctx.lineTo(canvas.width-margin,top+186);ctx.stroke();
    const bodyTop=top+310;ctx.fillStyle="#fffaf2";const fittedBody=fitCanvasParagraph(ctx,bodyText,typography,textWidth,bottom-bodyTop-200);fittedBody.lines.forEach((line,index)=>ctx.fillText(line,textStart,bodyTop+(index*fittedBody.lineHeight)));
    ctx.fillStyle="#f0c5d3";ctx.font=fitCanvasSingleLine(ctx,signatureText,typography,textWidth,49,{signature:true,heading:true});ctx.textAlign=rtl?"left":"right";ctx.fillText(signatureText,textEnd,bottom);ctx.textAlign=rtl?"right":"left";
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png",.95));const file=new File([blob],"glow-letter.png",{type:"image/png"});
    try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:t("title")});return;}}catch(error){if(error.name==="AbortError")return;}
    const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="glow-letter.png";link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);showToast(t("downloadReady"));
  }
  function speechLocale() {
    return SPEECH_LOCALES[lang] || "en-US";
  }

  function nativeSpeechBridge() {
    const bridge = window.NurSpeech;
    return bridge && typeof bridge.speak === "function" && typeof bridge.stop === "function" ? bridge : null;
  }

  function updateSpeechButton(active) {
    letterSpeechActive = Boolean(active);
    const button = $("#speakButton");
    if (!button) return;
    button.innerHTML = letterSpeechActive ? `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-book"/></svg> ${escapeHtml(t("stop"))}` : `<svg class="ic" aria-hidden="true" focusable="false"><use href="#ic-note"/></svg> ${escapeHtml(t("read"))}`;
    button.setAttribute("aria-pressed", String(letterSpeechActive));
  }

  function clearSpeechState() {
    clearTimeout(letterSpeechStartTimer);
    letterSpeechStartTimer = 0;
    letterSpeechSource = "";
    letterSpeechText = "";
    letterSpeechUtterance = null;
    updateSpeechButton(false);
  }

  function stopLetterSpeech() {
    letterSpeechRequest += 1;
    try { nativeSpeechBridge()?.stop(); } catch {}
    try { window.speechSynthesis?.cancel(); } catch {}
    clearSpeechState();
  }

  function startBrowserSpeech(text) {
    const synthesis = window.speechSynthesis;
    const Utterance = window.SpeechSynthesisUtterance;
    if (!synthesis || typeof synthesis.speak !== "function" || typeof Utterance !== "function") return false;
    try { synthesis.cancel(); } catch {}
    const request = ++letterSpeechRequest;
    const utterance = new Utterance(text);
    utterance.lang = speechLocale();
    utterance.rate = 0.9;
    utterance.pitch = 1;
    letterSpeechSource = "browser";
    letterSpeechText = text;
    letterSpeechUtterance = utterance;
    updateSpeechButton(true);
    utterance.onstart = () => {
      if (request === letterSpeechRequest && letterSpeechSource === "browser") updateSpeechButton(true);
    };
    utterance.onend = () => {
      if (request === letterSpeechRequest && letterSpeechSource === "browser") clearSpeechState();
    };
    utterance.onerror = event => {
      if (request !== letterSpeechRequest || letterSpeechSource !== "browser") return;
      const expectedStop = event?.error === "canceled" || event?.error === "interrupted";
      clearSpeechState();
      if (!expectedStop) showToast(t("speechUnavailable"));
    };
    try {
      synthesis.speak(utterance);
      // Some mobile Chromium builds leave the engine paused after an app switch.
      synthesis.resume?.();
      return true;
    } catch {
      clearSpeechState();
      return false;
    }
  }

  function handleNativeSpeechState(event) {
    if (letterSpeechSource !== "native") return;
    const state = String(event?.detail?.state || "");
    if (state === "loading" || state === "started") {
      if (state === "started") {
        clearTimeout(letterSpeechStartTimer);
        letterSpeechStartTimer = 0;
      }
      updateSpeechButton(true);
      return;
    }
    if (state === "done" || state === "stopped") {
      clearSpeechState();
      return;
    }
    if (state === "error") {
      const text = letterSpeechText;
      clearSpeechState();
      if (!startBrowserSpeech(text)) showToast(t("speechUnavailable"));
    }
  }

  function speakLetter() {
    if (letterSpeechActive) {
      stopLetterSpeech();
      return;
    }
    const text = entryText(currentEntry()).trim();
    if (!text) return;
    const bridge = nativeSpeechBridge();
    if (bridge) {
      letterSpeechRequest += 1;
      letterSpeechSource = "native";
      letterSpeechText = text;
      updateSpeechButton(true);
      try {
        bridge.speak(text, speechLocale());
        letterSpeechStartTimer = setTimeout(() => {
          if (letterSpeechSource !== "native") return;
          const pendingText = letterSpeechText;
          try { bridge.stop(); } catch {}
          clearSpeechState();
          if (!startBrowserSpeech(pendingText)) showToast(t("speechUnavailable"));
        }, 5000);
        return;
      } catch {
        clearSpeechState();
      }
    }
    if (!startBrowserSpeech(text)) showToast(t("speechUnavailable"));
  }

  function toggleFavorite(){const entry=currentEntry();const key=String(entry.id);if(favorites.has(key))favorites.delete(key);else favorites.add(key);localStorage.setItem("nurFavorites",JSON.stringify([...favorites]));renderLetter();scheduleCloudSync();haptic();}

  function createOpaqueReportReference(){
    if(typeof crypto?.randomUUID==="function")return crypto.randomUUID();
    const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);return [...bytes].map(value=>value.toString(16).padStart(2,"0")).join("");
  }

  function safeReportReference(value){
    const normalized=String(value||"").trim();
    return /^[A-Za-z0-9_-]{16,80}$/u.test(normalized)?normalized:createOpaqueReportReference();
  }

  function requestPublishConsent(){
    if(publicationResolver)return Promise.resolve(false);
    const checkbox=$("#publicationConsent");checkbox.checked=false;$("#publicationConfirm").disabled=true;$("#publicationError").hidden=true;openPanel(layers.publication);
    return new Promise(resolve=>{publicationResolver=resolve;});
  }

  function finishPublishConsent(accepted){
    if(!publicationResolver){closePanel(layers.publication);return;}
    if(accepted&&!$("#publicationConsent").checked){$("#publicationError").hidden=false;return;}
    const resolve=publicationResolver;publicationResolver=null;closePanel(layers.publication);resolve(Boolean(accepted));
  }

  function updateReportButton(){
    const button=$("#reportLetterButton");if(button)button.hidden=!activeReportContext;
  }

  function openContentReport(context={}){
    const kind=CONTENT_REPORT_KINDS.has(context.kind)?context.kind:"direct_letter";
    activeReportContext={kind,contentRef:safeReportReference(context.contentRef),momentPublicId:/^[0-9a-f-]{36}$/iu.test(context.momentPublicId||"")?String(context.momentPublicId):"",sender:cleanName(context.sender),recipient:cleanName(context.recipient),text:String(context.text||"").normalize("NFKC").trim().slice(0,1800),audioAttached:Boolean(context.audioAttached)};
    $("#reportForm").reset();$("#reportStatus").textContent="";$("#reportStatus").dataset.state="";reportSubmitting=false;$("#reportSubmit").disabled=false;setText("#reportSubmitLabel",t("reportSubmit"));openPanel(layers.report);
  }

  async function submitContentReport(event){
    event.preventDefault();if(reportSubmitting||!activeReportContext)return;
    const category=String($("#reportCategory").value||"");const details=String($("#reportDetails").value||"").normalize("NFKC").trim().slice(0,500);
    if(!CONTENT_REPORT_CATEGORIES.has(category))return;
    if(!/^https:\/\//iu.test(SUPABASE_URL)||!SUPABASE_PUBLISHABLE_KEY){setText("#reportStatus",t("reportFailed"));return;}
    reportSubmitting=true;$("#reportSubmit").disabled=true;setText("#reportSubmitLabel",t("reportSending"));setText("#reportStatus","");
    const headers={"Content-Type":"application/json",Accept:"application/json",apikey:SUPABASE_PUBLISHABLE_KEY};
    if(cloudSession?.access_token)headers.Authorization=`Bearer ${cloudSession.access_token}`;
    try{
      const response=await fetch(`${SUPABASE_URL}/functions/v1/submit-content-report`,{method:"POST",headers,cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer",body:JSON.stringify({contentKind:activeReportContext.kind,category,language:lang,platform:IS_ANDROID_PLAY_APP?"android_play":"web",appVersion:String(CONFIG.appVersion||"").slice(0,32),contentRef:activeReportContext.contentRef,momentPublicId:activeReportContext.momentPublicId||null,audioAttached:activeReportContext.audioAttached,sender:activeReportContext.sender,recipient:activeReportContext.recipient,text:activeReportContext.text,details})});
      if(response.status===429){setText("#reportStatus",t("reportRate"));return;}
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      setText("#reportStatus",t("reportSent"));$("#reportStatus").dataset.state="success";setTimeout(()=>closePanel(layers.report),1500);
    }catch{setText("#reportStatus",t("reportFailed"));}
    finally{reportSubmitting=false;$("#reportSubmit").disabled=false;setText("#reportSubmitLabel",t("reportSubmit"));}
  }

  async function shareLetter(){
    const entry=currentEntry();const url=new URL(CONFIG.publicShareUrl||`${location.origin}${location.pathname}`,location.href);url.search="";url.hash="";
    if(fromName)url.searchParams.set("from",fromName);if(toName)url.searchParams.set("to",toName);url.searchParams.set("lang",lang);url.searchParams.set("msg",encodeSharedMessage(entryText(entry)));
    const presentation={glFrame:document.body.dataset.glFrame,glInk:document.body.dataset.glInk,glType:document.body.dataset.glType};
    const presentationDefaults={glFrame:"none",glInk:"ink",glType:"classic"};
    Object.entries(presentation).forEach(([key,value])=>{if(value&&value!==presentationDefaults[key])url.searchParams.set(key,value);});
    if(!await requestPublishConsent())return;
    url.searchParams.set("rid",createOpaqueReportReference());
    let audioToken = incomingSharedAudioToken;
    if(customAudioBlob){
      // Если мелодию приложить не удалось, письмо всё равно должно уйти: раньше
      // здесь стоял return, и человек без входа в аккаунт вообще не мог
      // поделиться письмом, хотя текст никакого аккаунта не требует.
      try{audioToken=await ensureTemporarySharedAudio();}
      catch(error){
        audioToken="";
        if(error?.message==="authentication_required")showToast(t("audioSkippedSignIn"),6000);
        else if(error?.message==="invalid_audio_metadata")showToast(t("audioUnsupported"),5200);
        else showToast(t("audioSkippedFailed"),5200);
      }
    }
    if(SHARED_AUDIO_TOKEN_PATTERN.test(audioToken||""))url.hash=new URLSearchParams({audio:audioToken}).toString();
    const data={title:t("title"),text:`${displayName(toName)}, ${t("shareText")} — ${displayName(fromName)} ♡`,url:url.toString()};
    const nativeBridge=nativeShareBridge();
    if(nativeBridge){try{nativeBridge.share(data.title,data.text,data.url);return;}catch{}}
    try{if(navigator.share){await navigator.share(data);return;}}catch(error){if(error?.name==="AbortError")return;}
    openShareFallback(data.url,{title:data.title,message:data.text});
  }

  function buildAppShareUrl() {
    const publicUrl = new URL(CONFIG.publicShareUrl || `${location.origin}${location.pathname}`, location.href);
    publicUrl.search = "";
    publicUrl.hash = "";
    publicUrl.searchParams.set("lang", lang);
    return publicUrl.toString();
  }

  function nativeShareBridge() {
    const bridge = window.NurShare;
    return bridge && typeof bridge.share === "function" ? bridge : null;
  }

  function openShareFallback(url, options = {}) {
    const title = options.title || t("title");
    const message = options.message || t("shareAppText");
    fallbackShareUrl = url;
    $("#shareTelegram").href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
    $("#shareWhatsapp").href = `https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`;
    $("#shareEmail").href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}\n\n${url}`)}`;
    openPanel(layers.share);
  }

  async function copyFallbackShareLink() {
    if (!fallbackShareUrl) return;
    await writeClipboard(fallbackShareUrl);
    closePanel(layers.share);
    showToast(t("shareAppCopied"));
    haptic(10);
  }

  async function shareApplication() {
    const url = buildAppShareUrl();
    const nativeBridge = nativeShareBridge();
    if (nativeBridge) {
      try {
        nativeBridge.share(t("title"), t("shareAppText"), url);
        return;
      } catch {}
    }
    try {
      if (navigator.share) {
        await navigator.share({ title: t("title"), text: t("shareAppText"), url });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
    openShareFallback(url);
  }

  function qrPalette(){
    return {garnet:{foreground:"#6d1a20",background:"#f8f2e4",accent:"#a8791f"},indigo:{foreground:"#1b2350",background:"#f4f4f8",accent:"#a8791f"},saffron:{foreground:"#7d4c0f",background:"#f9f2e2",accent:"#8a5a12"},emerald:{foreground:"#123a2d",background:"#f2f6f1",accent:"#a8791f"}}[uiTheme]||{foreground:"#6d1a20",background:"#f8f2e4",accent:"#a8791f"};
  }

  function buildPublicQrUrl(sender,recipient){
    const base=new URL(CONFIG.publicShareUrl||`${location.origin}${location.pathname}`,location.href);base.search="";base.hash="";
    const parameters={lang,quote:1};if(sender)parameters.from=sender;if(recipient)parameters.to=recipient;
    const value=window.GlowLetterQR?.buildUrl?window.GlowLetterQR.buildUrl(base.toString(),parameters):base.toString();
    const safe=new URL(value,location.href);safe.hash="";safe.searchParams.delete(BETA_PARAMETER);safe.searchParams.delete("access");safe.searchParams.delete("beta");return safe.toString();
  }

  function qrRouteText(sender,recipient){
    if(!sender&&!recipient)return t("qrGenericRoute");
    return t("qrRoute").replace("{from}",displayName(sender)).replace("{to}",displayName(recipient));
  }

  function setQrActionsEnabled(enabled){
    ["#qrDownloadButton","#qrCopyLinkButton","#qrCopyImageButton","#qrPrintButton"].forEach(selector=>{const button=$(selector);if(button)button.disabled=!enabled;});
  }

  function clearQrPreview(){
    currentQrUrl="";currentQrMode="catalog";currentQrCaption="";currentQrSource="";setQrActionsEnabled(false);setText("#qrRoutePreview","");
    const canvas=$("#qrCanvas");const context=canvas?.getContext?.("2d");if(context){context.save();context.setTransform(1,0,0,1,0,0);context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.restore();}
  }

  function drawQrUrl(url,sender,recipient,notify=false){
    if(!window.GlowLetterQR?.renderToCanvas){showToast(t("qrUnavailable"));return false;}
    const palette=qrPalette();
    window.GlowLetterQR.renderToCanvas($("#qrCanvas"),url,{size:280,pixelRatio:Math.min(Number(devicePixelRatio)||1,2),margin:4,level:"M",foreground:palette.foreground,background:palette.background});
    setQrActionsEnabled(true);setText("#qrRoutePreview",qrRouteText(sender,recipient));if(notify)showToast(t("qrReady"));return true;
  }

  function renderCurrentQr(notify=false){
    if(!currentQrUrl)return false;
    return drawQrUrl(currentQrUrl,cleanName($("#qrSenderName")?.value||""),cleanName($("#qrRecipientName")?.value||""),notify);
  }

  function renderQrCode(notify=false){
    const sender=cleanName($("#qrSenderName")?.value||"");const recipient=cleanName($("#qrRecipientName")?.value||"");
    const invalid=!sender||!recipient||containsForbidden(sender)||containsForbidden(recipient);$("#qrNamesError").hidden=!invalid;if(invalid){clearQrPreview();return false;}
    currentQrMode="catalog";currentQrCaption="";currentQrSource="";currentQrUrl=buildPublicQrUrl(sender,recipient);setText("#qrPreviewCaption",t("qrCaption"));
    return drawQrUrl(currentQrUrl,sender,recipient,notify);
  }

  function openQrBuilder(){
    currentQrMode="catalog";currentQrCaption="";currentQrSource="";$("#qrSenderName").value=fromName;$("#qrRecipientName").value=toName;$("#qrNamesError").hidden=true;renderQrCode(false);openPanel(layers.qr);
  }

  function openPersonalQr(payload={}){
    const base=new URL(CONFIG.publicShareUrl||`${location.origin}${location.pathname}`,location.href);
    const safe=new URL(String(payload.url||""),base);
    const token=safe.searchParams.get("moment")||"";
    if(safe.origin!==base.origin||safe.pathname!==base.pathname||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(token))throw new Error("invalid_personal_qr");
    safe.hash="";safe.search="";safe.searchParams.set("moment",token);const qrLanguage=payload.language||payload.letter?.language;if(SUPPORTED_LANGUAGES.includes(qrLanguage))safe.searchParams.set("lang",qrLanguage);
    const sender=cleanName(payload.senderName||payload.sender||payload.letter?.sender_name_snapshot)||fromName;const recipient=cleanName(payload.recipientName||payload.recipient||payload.letter?.recipient_name_snapshot)||toName;
    if(!sender||!recipient||containsForbidden(sender)||containsForbidden(recipient))throw new Error("invalid_qr_names");
    currentQrMode="personal";currentQrSource=String(payload.letter?.source||payload.source||"");currentQrCaption=String(payload.caption||({ru:"Личное письмо",en:"Personal letter",fr:"Lettre personnelle",de:"Persönlicher Brief",es:"Carta personal",it:"Lettera personale",pl:"Osobisty list",uk:"Особистий лист",pt:"Carta pessoal",nl:"Persoonlijke brief",tr:"Kişisel mektup",ro:"Scrisoare personală",cs:"Osobní dopis",sv:"Personligt brev",el:"Προσωπικό γράμμα",da:"Personligt brev",no:"Personlig brev",fi:"Henkilökohtainen kirje",ja:"あなたへの手紙",ko:"개인 편지",zh:"私人信件",th:"จดหมายส่วนตัว",ar:"رسالة شخصية",ind:"Surat pribadi",vi:"Thư riêng"}[lang]||"Personal letter")).slice(0,48);currentQrUrl=safe.toString();
    $("#qrSenderName").value=sender;$("#qrRecipientName").value=recipient;$("#qrNamesError").hidden=true;setText("#qrPreviewCaption",currentQrCaption);drawQrUrl(currentQrUrl,sender,recipient,false);openPanel(layers.qr);
  }

  function openResolvedMoment(payload={}){
    const value=String(payload.text||"").normalize("NFKC").trim().slice(0,4000);
    const sender=cleanName(payload.senderName);const recipient=cleanName(payload.recipientName);
    if(!value||!sender||!recipient||containsForbidden(value)||containsForbidden(sender)||containsForbidden(recipient))throw new Error("invalid_resolved_letter");
    if(SUPPORTED_LANGUAGES.includes(payload.language)&&UI[payload.language])lang=payload.language;
    setNames(sender,recipient,{persist:false,explicit:false});
    sharedMessage=value;letterDeck=[{id:"shared",category:"warm",shared:true,ru:value,en:value,fr:value},...LETTERS];currentIndex=0;
    activeReportContext={kind:"moment_letter",contentRef:safeReportReference(payload.publicId),momentPublicId:String(payload.publicId||""),sender,recipient,text:value,audioAttached:false};updateReportButton();
    const safe=new URL(`${location.origin}${location.pathname}`);safe.search="";safe.hash="";const token=String(payload.publicId||params.get("moment")||"");if(token)safe.searchParams.set("moment",token);safe.searchParams.set("lang",lang);history.replaceState({},"",safe);
    applyLanguage(false);Object.values(layers).forEach(closePanel);if(!storyOpened)openStory();else renderLetter();
  }

  window.GlowLetterApp=Object.freeze({
    getState:()=>({language:lang,senderName:fromName,recipientName:toName,premium:isPremium,publicShareUrl:CONFIG.publicShareUrl||`${location.origin}${location.pathname}`}),
    openComposer:context=>{
      const request = context && typeof context === "object" ? { ...context } : {};
      if (request.text) { displayPersonalLetter(request.text, request, request.source || "history"); return true; }
      if (request.textMode === "own") { openOwnTextComposer(request); return true; }
      openLetterPicker(request);
      return true;
    },
    openQr:payload=>openPersonalQr(payload),
    openResolvedLetter:payload=>openResolvedMoment(payload),
    notify:(message,duration)=>showToast(String(message||""),duration),
    goHome:()=>goHome()
  });

  function momentsComposerRequest(request = {}) {
    return {
      ...request,
      senderName: request.senderName || request.sender || "",
      recipientName: request.recipientName || request.recipient || "",
      idea: request.idea || request.note || "",
      initialText: request.textMode === "own" ? String(request.note || "") : ""
    };
  }

  function bindMomentsIntegrationEvents() {
    if (momentsListenersBound) return;
    momentsListenersBound = true;
    addEventListener("glowletter-cloud-session", () => {
      const moments = window.GlowLetterMoments;
      if (!moments) return;
      Promise.resolve(moments.setSession(cloudUser)).catch(error => console.info("Moments session sync failed", error));
    });
    addEventListener("glowletter-language-changed", event => {
      const moments = window.GlowLetterMoments;
      if (!moments) return;
      moments.setLanguage(event.detail?.language || lang);
    });
    addEventListener("glowletter-letter-created", event => {
      const moments = window.GlowLetterMoments;
      const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
      const context = detail.context && typeof detail.context === "object" ? detail.context : {};
      if (!moments || typeof context.onComplete === "function") return;
      Promise.resolve(moments.recordLetter({
        text: detail.text,
        sender: detail.senderName,
        recipient: detail.recipientName,
        language: detail.language,
        tone: detail.tone,
        source: detail.source || context.source || "own",
        personId: context.personId,
        momentId: context.momentId,
        note: context.note || context.idea || ""
      })).catch(error => console.info("Moments history save failed", error));
    });
    addEventListener("glowletter-moment-resolved", event => {
      const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
      const letter = detail.letter && typeof detail.letter === "object" ? detail.letter : null;
      if (detail.locked || detail.status !== "ready" || !letter) return;
      try {
        window.GlowLetterApp.openResolvedLetter({
          text: letter.letter_text,
          senderName: letter.sender_name,
          recipientName: letter.recipient_name,
          language: letter.language,
          publicId: detail.publicId
        });
        window.GlowLetterMoments?.close();
      } catch (error) {
        console.info("Moments resolved letter could not be opened", error);
      }
    });
  }

  function initializeMomentsIntegration() {
    if (momentsIntegrationPromise) return momentsIntegrationPromise;
    const moments = window.GlowLetterMoments;
    if (!moments) return Promise.resolve(false);
    bindMomentsIntegrationEvents();
    momentsIntegrationPromise = Promise.resolve(moments.init({
      getClient: () => window.GlowLetterCloud?.getClient?.() || cloudClient,
      getUser: () => window.GlowLetterCloud?.getUser?.() || cloudUser,
      getLanguage: () => lang,
      requestSignIn: () => requestSignIn("moments"),
      openComposer: request => window.GlowLetterApp.openComposer(momentsComposerRequest(request)),
      requestPublishConsent: () => requestPublishConsent(),
      reportContent: request => openContentReport({kind:"moment_letter",contentRef:request?.publicId,momentPublicId:request?.publicId,sender:request?.sender,recipient:request?.recipient,text:request?.text,audioAttached:false}),
      openQr: request => window.GlowLetterApp.openQr({
        ...request,
        senderName: request?.senderName || request?.sender || request?.letter?.sender_name_snapshot || "",
        recipientName: request?.recipientName || request?.recipient || request?.letter?.recipient_name_snapshot || "",
        language: request?.language || request?.letter?.language || lang
      })
    })).then(async () => {
      await moments.setSession(cloudUser);
      moments.setLanguage(lang);
      return true;
    }).catch(error => {
      momentsIntegrationPromise = null;
      console.info("Moments initialization failed", error);
      return false;
    });
    return momentsIntegrationPromise;
  }

  function openMomentsHome() {
    initializeMomentsIntegration().then(ready => {
      if (ready) window.GlowLetterMoments?.open("people");
    });
  }

  // Карточка с QR печатается на A6 (105 × 148 мм при 300 dpi), поэтому холст
  // 1240 × 1748. Розы рисуются той же фотографией, что и рамка письма.
  const QR_CARD_WIDTH=1240,QR_CARD_HEIGHT=1748;
  const QR_CARD_TITLES={ru:"Тёплое письмо",en:"A warm letter",fr:"Une lettre chaleureuse",de:"Ein warmer Brief",es:"Una carta cálida",it:"Una lettera affettuosa",pl:"Ciepły list",uk:"Теплий лист",pt:"Uma carta calorosa",nl:"Een warme brief",tr:"Sıcak bir mektup",ro:"O scrisoare caldă",cs:"Vřelý dopis",sv:"Ett varmt brev",el:"Ένα ζεστό γράμμα",da:"Et varmt brev",no:"Et varmt brev",fi:"Lämmin kirje",ja:"あたたかい手紙",ko:"따뜻한 편지",zh:"一封溫暖的信",th:"จดหมายอันอบอุ่น",ar:"رسالة دافئة",ind:"Sepucuk surat hangat",vi:"Một lá thư ấm áp"};
  const QR_CARD_HINTS={ru:"Наведите камеру телефона на QR-код",en:"Point your phone camera at the QR code",fr:"Visez le QR code avec l’appareil photo",de:"Richte die Handykamera auf den QR-Code",es:"Apunta la cámara del móvil al código QR",it:"Inquadra il codice QR con la fotocamera",pl:"Skieruj aparat telefonu na kod QR",uk:"Наведіть камеру телефону на QR-код",pt:"Aponte a câmara do telemóvel para o código QR",nl:"Richt de camera van je telefoon op de QR-code",tr:"Telefon kamerasını QR koduna tutun",ro:"Îndreaptă camera telefonului spre codul QR",cs:"Namiřte fotoaparát telefonu na QR kód",sv:"Rikta telefonens kamera mot QR-koden",el:"Στρέψτε την κάμερα του τηλεφώνου στον κωδικό QR",da:"Ret telefonens kamera mod QR-koden",no:"Rett telefonkameraet mot QR-koden",fi:"Suuntaa puhelimen kamera QR-koodiin",ja:"スマートフォンのカメラをQRコードに向けてください",ko:"휴대폰 카메라를 QR 코드에 비춰 주세요",zh:"請用手機相機對準 QR 碼",th:"หันกล้องโทรศัพท์ไปที่ QR โค้ด",ar:"وجّه كاميرا هاتفك نحو رمز QR",ind:"Arahkan kamera ponsel ke kode QR",vi:"Hướng camera điện thoại vào mã QR"};
  let rosesFrameImage=null;
  function loadRosesFrame(){
    if(!rosesFrameImage)rosesFrameImage=new Promise(resolve=>{const image=new Image();image.decoding="async";image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src="assets/frame-roses.webp";});
    return rosesFrameImage;
  }
  // Та же геометрия, что у border-image в experience.css: срезы 380 px на
  // фотографии 2x, полоса 190 px при ширине карточки 532 px, вынос 60 px наружу.
  // Возвращает глубину, на которую розы заходят на бумагу.
  async function drawRosesFrame(ctx,width,height){
    const image=await loadRosesFrame();if(!image)return 0;
    const scale=(width/532)*.9,slice=380,band=190*scale,outset=60*scale;
    const sw=image.naturalWidth,sh=image.naturalHeight,midW=sw-slice*2,midH=sh-slice*2;
    const x0=-outset,y0=-outset,x1=width+outset-band,y1=height+outset-band;
    const draw=(sx,sy,sWidth,sHeight,dx,dy,dWidth,dHeight)=>ctx.drawImage(image,sx,sy,sWidth,sHeight,dx,dy,dWidth,dHeight);
    const spanX=width+outset*2-band*2,spanY=height+outset*2-band*2;
    const countX=Math.max(1,Math.round(spanX/(midW*scale/2))),countY=Math.max(1,Math.round(spanY/(midH*scale/2)));
    const stepX=spanX/countX,stepY=spanY/countY;
    for(let i=0;i<countX;i+=1){draw(slice,0,midW,slice,x0+band+i*stepX,y0,stepX+1,band);draw(slice,sh-slice,midW,slice,x0+band+i*stepX,y1,stepX+1,band);}
    for(let i=0;i<countY;i+=1){draw(0,slice,slice,midH,x0,y0+band+i*stepY,band,stepY+1);draw(sw-slice,slice,slice,midH,x1,y0+band+i*stepY,band,stepY+1);}
    draw(0,0,slice,slice,x0,y0,band,band);draw(sw-slice,0,slice,slice,x1,y0,band,band);draw(0,sh-slice,slice,slice,x0,y1,band,band);draw(sw-slice,sh-slice,slice,slice,x1,y1,band,band);
    return Math.round(band-outset);
  }
  function qrCardUsesRoses(){return document.body.dataset.glFrame==="roses"||currentQrSource==="florist";}
  async function createQrCardCanvas(){
    if(!currentQrUrl&& !renderQrCode(false))return null;
    const source=$("#qrCanvas");const canvas=document.createElement("canvas");canvas.width=QR_CARD_WIDTH;canvas.height=QR_CARD_HEIGHT;const ctx=canvas.getContext("2d");if(!ctx)return null;const palette=qrPalette();if(isRtl())ctx.direction="rtl";
    const gradient=ctx.createLinearGradient(0,0,canvas.width,canvas.height);gradient.addColorStop(0,palette.background);gradient.addColorStop(1,"#ece8ea");ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);
    const inset=qrCardUsesRoses()?await drawRosesFrame(ctx,canvas.width,canvas.height):0;
    if(!inset){ctx.strokeStyle=palette.accent;ctx.lineWidth=4;ctx.strokeRect(56,56,canvas.width-112,canvas.height-112);}
    const safeTop=Math.max(150,inset-20),safeSide=Math.max(120,inset-30),safeBottom=canvas.height-Math.max(150,inset-20),centerX=canvas.width/2;
    ctx.textAlign="center";ctx.fillStyle=palette.accent;ctx.font="800 30px Manrope, Arial";ctx.fillText("G L O W L E T T E R",centerX,safeTop+40);
    ctx.fillStyle=palette.foreground;ctx.font="600 72px Georgia, serif";ctx.fillText(QR_CARD_TITLES[lang]||"GlowLetter",centerX,safeTop+150);
    const qrSize=Math.max(420,Math.min(800,canvas.width-safeSide*2-120,safeBottom-(safeTop+220)-250)),qrTop=safeTop+220,qrLeft=centerX-qrSize/2;
    ctx.fillStyle="#ffffff";ctx.fillRect(qrLeft-24,qrTop-24,qrSize+48,qrSize+48);ctx.drawImage(source,qrLeft,qrTop,qrSize,qrSize);
    const sender=cleanName($("#qrSenderName")?.value||"");const recipient=cleanName($("#qrRecipientName")?.value||"");const route=qrRouteText(sender,recipient);const routeWidth=canvas.width-safeSide*2;let routeFontSize=48;ctx.fillStyle=palette.foreground;ctx.font=`600 ${routeFontSize}px Georgia, serif`;while(ctx.measureText(route).width>routeWidth&&routeFontSize>28){routeFontSize-=2;ctx.font=`600 ${routeFontSize}px Georgia, serif`;}
    const routeY=qrTop+qrSize+110;ctx.fillText(route,centerX,routeY);
    ctx.fillStyle=palette.accent;ctx.font="700 25px Manrope, Arial";ctx.fillText((currentQrCaption||t("qrCaption")).toLocaleUpperCase(lang),centerX,routeY+80);
    ctx.fillStyle="#756d77";ctx.font="500 23px Manrope, Arial";ctx.fillText(QR_CARD_HINTS[lang]||"Point your phone camera at the QR code",centerX,routeY+140);
    return canvas;
  }
  function createQrCardBlob(type="image/png",quality=.96){
    return createQrCardCanvas().then(canvas=>canvas?new Promise(resolve=>canvas.toBlob(resolve,type,quality)):null);
  }
  function qrFileName(extension){const recipient=cleanName($("#qrRecipientName")?.value||"").replace(/[^\p{L}\p{N}-]+/gu,"-");return `GlowLetter-QR${recipient?`-${recipient}`:""}.${extension}`;}
  function nativeFileShareBridge(){const bridge=window.NurShare;return bridge&&typeof bridge.shareFile==="function"?bridge:null;}
  function blobToBase64(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||"").split(",")[1]||"");reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}
  const isPhoneShell=()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // Файл уходит через системное окно «Поделиться» на телефоне (в приложении —
  // через мост, у WebView нет Web Share) и скачивается на компьютере.
  async function deliverFile(blob,filename,toastKey){
    const bridge=nativeFileShareBridge();
    if(bridge){try{bridge.shareFile(await blobToBase64(blob),blob.type||"application/octet-stream",filename);return true;}catch{}}
    if(isPhoneShell()){try{const file=new File([blob],filename,{type:blob.type});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:t("title")});return true;}}catch(error){if(error?.name==="AbortError")return false;}}
    const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);if(toastKey)showToast(t(toastKey));return true;
  }
  // Согласие на публикацию спрашивается один раз на ссылку, а не на каждую кнопку.
  function qrConsentSignature(){return `${currentQrMode}|${cleanName($("#qrSenderName")?.value||"")}|${cleanName($("#qrRecipientName")?.value||"")}|${currentQrMode==="personal"?currentQrUrl:""}`;}
  async function qrConsent(){
    if(qrConsentKey&&qrConsentKey===qrConsentSignature())return true;
    const accepted=await requestPublishConsent();if(accepted)qrConsentKey=qrConsentSignature();return accepted;
  }
  // PDF из одной страницы A6 с JPEG-картинкой карточки; без библиотек.
  async function jpegToPdf(jpegBlob,pixelWidth,pixelHeight,pageWidth,pageHeight){
    const image=new Uint8Array(await jpegBlob.arrayBuffer());const encoder=new TextEncoder();const parts=[];const offsets=[];let length=0;
    const push=chunk=>{const bytes=typeof chunk==="string"?encoder.encode(chunk):chunk;parts.push(bytes);length+=bytes.length;};
    const object=(number,body)=>{offsets[number]=length;push(`${number} 0 obj\n`);if(typeof body==="string")push(body);else{push(body.head);push(body.stream);push("\nendstream");}push("\nendobj\n");};
    push("%PDF-1.4\n");
    object(1,"<< /Type /Catalog /Pages 2 0 R >>");
    object(2,"<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    object(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
    object(4,{head:`<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`,stream:image});
    const content=encoder.encode(`q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`);
    object(5,{head:`<< /Length ${content.length} >>\nstream\n`,stream:content});
    const xref=length;
    push(`xref\n0 6\n0000000000 65535 f \n${[1,2,3,4,5].map(number=>`${String(offsets[number]).padStart(10,"0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts,{type:"application/pdf"});
  }
  async function downloadQrPdf(){
    if(!(currentQrMode==="personal"?renderCurrentQr(false):renderQrCode(false)))return;if(!await qrConsent())return;const canvas=await createQrCardCanvas();if(!canvas)return;
    const jpeg=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.92));if(!jpeg)return;
    const pdf=await jpegToPdf(jpeg,canvas.width,canvas.height,297.64,419.53);
    await deliverFile(pdf,qrFileName("pdf"),"qrPdfReady");
  }
  function qrSendMessage(){const sender=cleanName($("#qrSenderName")?.value||"")||fromName;const recipient=cleanName($("#qrRecipientName")?.value||"")||toName;return t("qrSendMessage").replace("{to}",displayName(recipient)).replace("{from}",displayName(sender));}
  async function openQrSend(){
    if(!(currentQrMode==="personal"?renderCurrentQr(false):renderQrCode(false)))return;if(!await qrConsent())return;
    const url=currentQrUrl;const message=qrSendMessage();const title=t("qrSendTitle");const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent);
    $("#qrSendWhatsapp").href=`https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`;
    $("#qrSendTelegram").href=`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
    $("#qrSendSms").href=`sms:${ios?"&":"?"}body=${encodeURIComponent(`${message}\n${url}`)}`;
    $("#qrSendEmail").href=`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}\n\n${url}`)}`;
    $("#qrSendOther").hidden=!(nativeShareBridge()||navigator.share);
    $("#qrSendFile").hidden=!(nativeFileShareBridge()||(isPhoneShell()&&typeof navigator.canShare==="function"));
    openPanel(layers.qrSend);
  }
  async function shareQrLinkNative(){
    if(!currentQrUrl||!await qrConsent())return;const data={title:t("qrSendTitle"),text:qrSendMessage(),url:currentQrUrl};
    const bridge=nativeShareBridge();if(bridge){try{bridge.share(data.title,data.text,data.url);return;}catch{}}
    try{if(navigator.share)await navigator.share(data);}catch(error){if(error?.name!=="AbortError")await copyQrLink();}
  }
  async function shareQrCardFile(){
    if(!(currentQrMode==="personal"?renderCurrentQr(false):renderQrCode(false)))return;if(!await qrConsent())return;const blob=await createQrCardBlob();if(!blob)return;await deliverFile(blob,qrFileName("png"),"downloadReady");
  }

  async function downloadQrCard(){
    if(!(currentQrMode==="personal"?renderCurrentQr(false):renderQrCode(false)))return;if(!await qrConsent())return;const blob=await createQrCardBlob();if(!blob)return;await deliverFile(blob,qrFileName("png"),"downloadReady");
  }

  async function copyQrImage(){
    if(!(currentQrMode==="personal"?renderCurrentQr(false):renderQrCode(false)))return;if(!await qrConsent())return;const blob=await createQrCardBlob();if(!blob)return;
    try{if(!navigator.clipboard?.write||typeof ClipboardItem!=="function")throw new Error("unsupported");await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);showToast(t("qrImageCopied"));}
    catch{showToast(t("qrImageCopyFail"),3200);}
  }

  async function copyQrLink(){if(!(currentQrMode==="personal"?renderCurrentQr(false):renderQrCode(false)))return;if(!await qrConsent())return;await writeClipboard(currentQrUrl);showToast(t("qrLinkCopied"));haptic(10);}

  async function printQrCard(){if(!(currentQrMode==="personal"?renderCurrentQr(false):renderQrCode(false)))return;if(!await qrConsent())return;window.print();}

  function isFullscreenShell(){return Boolean(matchMedia?.("(display-mode: fullscreen)").matches||navigator.standalone===true||location.hostname==="appassets.androidplatform.net"||location.protocol==="file:");}
  function fullscreenActive(){return Boolean(document.fullscreenElement||isFullscreenShell());}
  async function requestAutomaticFullscreen(){if(localStorage.getItem(AUTO_FULLSCREEN_KEY)==="off"||fullscreenActive()||typeof document.documentElement.requestFullscreen!=="function")return;try{await document.documentElement.requestFullscreen({navigationUI:"hide"});localStorage.setItem("nurFullscreen","on");}catch{}}
  function installAutomaticFullscreen(){const activate=event=>{if(event.target?.closest?.("#fullscreenToggle"))return;document.removeEventListener("click",activate);requestAutomaticFullscreen();};document.addEventListener("click",activate);requestAutomaticFullscreen();}
  function updateFullscreenControl(){const active=fullscreenActive();$("#fullscreenToggle")?.classList.toggle("is-active",active);$("#fullscreenToggle")?.setAttribute("aria-pressed",String(active));const state=$("#fullscreenToggle b");if(state)state.textContent=active?t("stateOn"):t("stateOpen");}
  async function toggleFullscreen(){if(isFullscreenShell()&&!document.fullscreenElement){localStorage.setItem(AUTO_FULLSCREEN_KEY,"on");updateFullscreenControl();return;}if(!document.fullscreenElement&&typeof document.documentElement.requestFullscreen!=="function"){showToast(t("fullscreenUnavailable"));return;}try{if(!document.fullscreenElement){localStorage.setItem(AUTO_FULLSCREEN_KEY,"on");await document.documentElement.requestFullscreen({navigationUI:"hide"});}else{localStorage.setItem(AUTO_FULLSCREEN_KEY,"off");await document.exitFullscreen?.();}}catch{showToast(t("fullscreenUnavailable"));}updateFullscreenControl();}
  function restoreGesturePreferences(){if(gesturePreferencesRestored)return;gesturePreferencesRestored=true;if(localStorage.getItem("nurNature")==="on"&&!isNaturePlaying)setNaturePlaying(true,false);requestAutomaticFullscreen();}
  function saveSettings({openQr=false}={}){
    const sender = cleanName($("#settingsSenderName").value);
    const recipient = cleanName($("#settingsRecipientName").value);
    const namesInvalid = openQr ? (!sender || !recipient || containsForbidden(sender) || containsForbidden(recipient)) : (Boolean(sender || recipient) && (!sender || !recipient || containsForbidden(sender) || containsForbidden(recipient)));
    $("#settingsNamesError").hidden = !namesInvalid;
    if (namesInvalid) return false;
    setNames(sender, recipient, { explicit: true });
    localStorage.setItem("nurLanguage",lang);localStorage.setItem("nurUiTheme",uiTheme);localStorage.setItem("nurRain",rainScene.enabled?"on":"off");localStorage.setItem("nurWeather",weatherEnabled&&!IS_ANDROID_PLAY_APP?"on":"off");localStorage.setItem("nurTrack",String(selectedTrack));localStorage.setItem("nurNature",isNaturePlaying?"on":"off");localStorage.setItem("nurFullscreen",fullscreenActive()||localStorage.getItem(AUTO_FULLSCREEN_KEY)!=="off"?"on":"off");localStorage.setItem("nurVolume",String(audio.volume));scheduleCloudSync({includeNames:true,immediate:true});showToast(t(openQr?"qrNamesSaved":"settingsSaved"));closePanel(layers.settings);if(openQr)requestAnimationFrame(openQrBuilder);return true;
  }

  function bindEvents(){
    $("#openStoryButton").addEventListener("click",openStory);$("#homeButton").addEventListener("click",goHome);$$(".go-home").forEach(button=>button.addEventListener("click",goHome));
    $("#momentsOpenHome").addEventListener("click",openMomentsHome);
    $("#setupForm").addEventListener("submit",submitNameSetup);$("#setupClose").addEventListener("click",()=>closePanel(layers.setup));$("#setupBackdrop").addEventListener("click",()=>closePanel(layers.setup));
    $("#nextLetter").addEventListener("click",()=>moveLetter(1));$("#previousLetter").addEventListener("click",()=>moveLetter(-1));$("#copyLetter").addEventListener("click",()=>copyText(entryText(currentEntry())));$("#shareButton").addEventListener("click",shareLetter);$("#favoriteButton").addEventListener("click",toggleFavorite);
    letterStage.addEventListener("pointerdown",startReadingSwipe);letterStage.addEventListener("pointermove",updateReadingSwipe,{passive:false});letterStage.addEventListener("pointerup",finishReadingSwipe);letterStage.addEventListener("pointercancel",finishReadingSwipe);
    $("#libraryButton").addEventListener("click",()=>{pendingPremiumFeature="";renderLibrary();openPanel(layers.library);});$("#libraryClose").addEventListener("click",cancelLetterPicker);$("#libraryBackdrop").addEventListener("click",cancelLetterPicker);$("#libraryClose").addEventListener("click",()=>closePanel(layers.library));$("#libraryBackdrop").addEventListener("click",()=>closePanel(layers.library));
    $("#settingsButton").addEventListener("click",()=>{pendingPremiumFeature="";$("#settingsSenderName").value=fromName;$("#settingsRecipientName").value=toName;$("#settingsNamesError").hidden=true;openPanel(layers.settings);if(cloudUser?.id){loadCloudAccount(cloudUser).catch(error=>console.info("Cloud account refresh failed",error));ensureVipNotifications(cloudUser,{reload:true}).catch(error=>console.info("VIP notification refresh failed",error));}});$("#settingsClose").addEventListener("click",()=>closePanel(layers.settings));$("#settingsBackdrop").addEventListener("click",()=>closePanel(layers.settings));$("#saveSettingsButton").addEventListener("click",()=>saveSettings());
    $$('.theme-choice-grid [data-ui-theme]').forEach(button=>button.addEventListener("click",()=>{applyUiTheme(button.dataset.uiTheme);if(currentQrUrl)renderCurrentQr(false);}));
    $("#qrOpenButton").addEventListener("click",()=>saveSettings({openQr:true}));$("#qrClose").addEventListener("click",()=>closePanel(layers.qr));$("#qrBackdrop").addEventListener("click",()=>closePanel(layers.qr));$("#qrForm").addEventListener("submit",event=>{event.preventDefault();renderQrCode(true);});$("#qrDownloadButton").addEventListener("click",downloadQrCard);$("#qrCopyLinkButton").addEventListener("click",copyQrLink);$("#qrCopyImageButton").addEventListener("click",copyQrImage);$("#qrPrintButton").addEventListener("click",printQrCard);
    $("#qrPdfButton").addEventListener("click",downloadQrPdf);$("#qrSendButton").addEventListener("click",openQrSend);$("#qrSendClose").addEventListener("click",()=>closePanel(layers.qrSend));$("#qrSendBackdrop").addEventListener("click",()=>closePanel(layers.qrSend));$("#qrSendCopy").addEventListener("click",copyQrLink);$("#qrSendOther").addEventListener("click",shareQrLinkNative);$("#qrSendFile").addEventListener("click",shareQrCardFile);
    $("#composerClose").addEventListener("click",closeOwnTextComposer);$("#composerBackdrop").addEventListener("click",closeOwnTextComposer);$("#composerDone").addEventListener("click",submitOwnText);$("#composerCollection").addEventListener("click",composerToCollection);$("#composerText").addEventListener("input",()=>{updateComposerCounter();$("#composerError").hidden=true;});
    $("#publicationConsent").addEventListener("change",event=>{$("#publicationConfirm").disabled=!event.target.checked;$("#publicationError").hidden=true;});$("#publicationConfirm").addEventListener("click",()=>finishPublishConsent(true));$("#publicationCancel").addEventListener("click",()=>finishPublishConsent(false));$("#publicationClose").addEventListener("click",()=>finishPublishConsent(false));$("#publicationBackdrop").addEventListener("click",()=>finishPublishConsent(false));
    $("#reportLetterButton").addEventListener("click",()=>activeReportContext&&openContentReport(activeReportContext));$("#reportClose").addEventListener("click",()=>closePanel(layers.report));$("#reportBackdrop").addEventListener("click",()=>closePanel(layers.report));$("#reportForm").addEventListener("submit",submitContentReport);
    $("#shareAppClose").addEventListener("click",()=>closePanel(layers.share));$("#shareAppBackdrop").addEventListener("click",()=>closePanel(layers.share));$("#shareCopyLink").addEventListener("click",copyFallbackShareLink);
    $("#supportOpenButton").addEventListener("click",openSupportForm);$("#supportClose").addEventListener("click",()=>closePanel(layers.support));$("#supportBackdrop").addEventListener("click",()=>closePanel(layers.support));$("#supportForm").addEventListener("submit",submitSupportRequest);$("#supportMessage").addEventListener("input",()=>{updateSupportMessageCount();if($("#supportStatus").dataset.state==="error")setSupportStatus();});$("#supportSignInButton").addEventListener("click",event=>{const provider=event.currentTarget.dataset.provider;if(provider)signInWithCloud(provider);});$("#supportCopyContact").addEventListener("click",async()=>{await writeClipboard(SUPPORT_EMAIL);showToast(t("supportContactCopied"));haptic(10);});
    $("#paywallClose").addEventListener("click",closePaywall);$("#paywallBackdrop").addEventListener("click",closePaywall);$("#purchaseButton").addEventListener("click",purchaseFullAccess);$("#purchaseYearlyButton").addEventListener("click",purchaseYearly);$("#settingsPurchase").addEventListener("click",()=>openPaywall());$("#restoreButton").addEventListener("click",restorePurchase);$("#settingsRestoreButton").addEventListener("click",restorePurchase);$("#manageSubscriptionButton").addEventListener("click",manageSubscription);$("#paywallManageSubscription").addEventListener("click",manageSubscription);
    $("#categoryRow").addEventListener("click",event=>{const button=event.target.closest("[data-category]");if(!button)return;selectedCategory=button.dataset.category;$$("#categoryRow button").forEach(item=>item.classList.toggle("is-active",item===button));renderLibrary();});
    $("#quoteList").addEventListener("click",event=>{const action=event.target.closest("[data-action]");const card=event.target.closest(".quote-card");if(!action||!card)return;const id=Number(card.dataset.id);if(action.dataset.action==="unlock")openPaywall();else if(action.dataset.action==="own")openOwnTextComposer(letterPickerContext);else if(action.dataset.action==="pick")pickLetterForContext(id);else if(action.dataset.action==="open")openQuoteById(id);else if(action.dataset.action==="copy"){const entry=LETTERS.find(item=>Number(item.id)===id);if(canAccess(entry))copyText(entryText(entry));else openPaywall();}});
    $("#languageButton").addEventListener("click",()=>openPanel(layers.language));$("#languageClose").addEventListener("click",()=>closePanel(layers.language));$("#languageBackdrop").addEventListener("click",()=>closePanel(layers.language));$$('[data-lang]').forEach(button=>button.addEventListener("click",()=>{stopLetterSpeech();lang=button.dataset.lang;rememberLanguageChoice();applyLanguage();scheduleCloudSync();if(layers.language.contains(button))closePanel(layers.language);}));
    $("#rainToggle").addEventListener("click",()=>{rainScene.setEnabled(!rainScene.enabled);showToast(rainScene.enabled?t("rainOn"):t("rainOff"));});$("#natureButton").addEventListener("click",toggleNature);$("#natureToggle").addEventListener("click",toggleNature);$("#weatherButton").addEventListener("click",()=>refreshWeather());$("#weatherToggle").addEventListener("click",toggleWeather);$("#fullscreenToggle").addEventListener("click",toggleFullscreen);
    $("#soundButton").addEventListener("click",()=>isMusicPlaying?pauseMusic():playMusic());$("#customTrackButton").addEventListener("click",()=>$("#customTrackInput").click());$("#customTrackInput").addEventListener("change",async event=>{const file=event.target.files?.[0];event.target.value="";await selectCustomAudio(file);});$("#removeAudioButton").addEventListener("click",removeCustomAudio);audio.addEventListener("error",async()=>{if(!incomingSharedAudioToken||audioRecoveryAttempted)return;audioRecoveryAttempted=true;try{await setAudioSource({refreshRemote:true});await playMusic(true);}catch{}});
    $("#customBackgroundButton").addEventListener("click",()=>$("#customBackgroundInput").click());$("#customBackgroundInput").addEventListener("change",async event=>{const file=event.target.files?.[0];if(!file)return;if(file.size>18*1024*1024)return showToast(t("backgroundTooLarge"));try{const blob=await optimizeBackground(file);applyBackground(blob);await saveMedia("background",{blob});showToast(t("photoReady"));}catch{showToast(t("backgroundFail"));}});$("#resetBackgroundButton").addEventListener("click",resetBackground);
    $("#shareAppButton").addEventListener("click",shareApplication);$("#installButton").addEventListener("click",async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("#installButton").hidden=true;});
    $("#googleSignIn").addEventListener("click",()=>signInWithGoogle());$("#homeSignIn").addEventListener("click",()=>requestSignIn("home"));$("#appleSignIn").addEventListener("click",()=>signInWithCloud("apple"));$("#facebookSignIn").addEventListener("click",()=>signInWithCloud("facebook"));$("#accountSignOut").addEventListener("click",signOutCloud);$("#accountDelete").addEventListener("click",deleteCloudAccount);$("#accountAvatarButton").addEventListener("click",()=>$("#accountAvatarInput").click());$("#accountAvatarInput").addEventListener("change",selectAccountAvatar);$("#copyAccountId").addEventListener("click",copyAccountSupportId);$("#accountPasswordToggle").addEventListener("click",()=>{const form=$("#accountPasswordForm");form.hidden=!form.hidden;if(!form.hidden)$("#accountPasswordInput").focus();});$("#accountPasswordForm").addEventListener("submit",saveAccountPassword);$("#notificationBell").addEventListener("click",()=>{openVipNotifications();ensureVipNotifications(cloudUser,{reload:true,presentUnread:false}).catch(error=>console.info("VIP notification refresh failed",error));});$("#notificationClose").addEventListener("click",closeVipNotifications);$("#notificationBackdrop").addEventListener("click",closeVipNotifications);$("#notificationAcknowledge").addEventListener("click",markActiveVipNotificationRead);$("#notificationHistoryList").addEventListener("click",selectVipNotificationFromHistory);$("#adminLookupForm").addEventListener("submit",lookupAdminAccount);$("#adminVipMessage").addEventListener("input",()=>{updateAdminVipMessageCount();if($("#adminStatus").dataset.state==="error")setAdminStatus();});$("#adminGrantVip").addEventListener("click",grantAdminVip);$("#adminGrantForever").addEventListener("click",grantAdminForever);$("#adminRevokeVip").addEventListener("click",revokeAdminVip);$("#adminGrantAll").addEventListener("click",grantAdminVipAll);$("#adminRevokeAll").addEventListener("click",revokeAdminVipAll);$("#adminRefresh").addEventListener("click",()=>loadAdminOverview());$("#adminRecentList").addEventListener("click",event=>{const button=event.target.closest("[data-admin-id]");if(!button)return;$("#adminSupportId").value=button.dataset.adminId;lookupAdminAccount();});
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&readingFocus){setReadingFocus(false);return;}if(event.key==="Escape"){pendingPremiumFeature="";const open=Object.values(layers).reverse().find(layer=>layer.classList.contains("is-open"));if(open===layers.paywall)closePaywall();else if(open===layers.publication)finishPublishConsent(false);else if(open)closePanel(open);}if(storyOpened&&!Object.values(layers).some(layer=>layer.classList.contains("is-open"))){if(readingFocus){const direction=readingKeyboardDirection(event);if(direction){event.preventDefault();moveLetter(direction);}return;}if(event.key==="ArrowRight")moveLetter(1);if(event.key==="ArrowLeft")moveLetter(-1);}});
    addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;$("#installButton").hidden=false;});
    document.addEventListener("fullscreenchange",()=>{const active=Boolean(document.fullscreenElement);updateFullscreenControl();localStorage.setItem("nurFullscreen",active?"on":"off");localStorage.setItem(AUTO_FULLSCREEN_KEY,active?"on":"off");scheduleCloudSync();});
    document.addEventListener("visibilitychange",()=>{if(document.hidden){stopLetterSpeech();flushCloudSync(false);}else if(cloudUser?.id){loadCloudAccount(cloudUser).catch(error=>console.info("Cloud account refresh failed",error));ensureVipNotifications(cloudUser,{reload:true}).catch(error=>console.info("VIP notification refresh failed",error));}});
    addEventListener("online",()=>{detectCloudProviders();if(cloudUser?.id){loadCloudAccount(cloudUser).catch(error=>console.info("Cloud account refresh failed",error));ensureVipNotifications(cloudUser,{reload:true}).catch(error=>console.info("VIP notification refresh failed",error));if(cloudReady)flushCloudSync(false);else loadCloudProgress(cloudUser);}});
    addEventListener("offline",()=>setCloudStatus("cloudOffline"));
    addEventListener("hashchange",handleSharedAudioNavigation);
    addEventListener("nur-entitlement",event=>{if(!trustedEntitlementSource)return;const data=event.detail||{};updatePremium(data.entitled??data.owned??false,data.priceLabel||data.price,data.reason,data.yearlyPriceLabel);updatePurchaseConfiguration(data.purchaseConfigured);});
    $("#appUpdateAction").addEventListener("click",runAppUpdateAction);$("#appUpdateClose").addEventListener("click",dismissAppUpdate);
    addEventListener("nur-speech-state",handleNativeSpeechState);
    let scenePointerFrame=0,scenePointerX=0,scenePointerY=0;
    addEventListener("pointermove",event=>{if(LITE_DEVICE||innerWidth<900||REDUCED_MOTION.matches)return;scenePointerX=event.clientX;scenePointerY=event.clientY;if(scenePointerFrame)return;scenePointerFrame=requestAnimationFrame(()=>{scenePointerFrame=0;const x=(scenePointerX/innerWidth-.5)*1.2;const y=(scenePointerY/innerHeight-.5)*.8;$("#cinematicBg").style.translate=`${x}% ${y}%`;});},{passive:true});
  }

  async function setupServiceWorker() {
    const hadController = Boolean(navigator.serviceWorker.controller);
    const registration = await navigator.serviceWorker.register("sw.js?v=50", { updateViaCache: "none" });
    let reloading = false;
    if (hadController) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloading) return;
        reloading = true;
        location.reload();
      });
    }
    const checkForUpdate = () => registration.update().catch(() => {});
    checkForUpdate();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) checkForUpdate(); });
    setInterval(checkForUpdate, 60 * 60 * 1000);
  }

  async function init(){
    if(LETTERS.length!==50)console.warn(`Expected 50 letters, received ${LETTERS.length}`);
    if(IS_ANDROID_PLAY_APP)disableWeather({sync:false});
    const storedVolume=Number(localStorage.getItem("nurVolume")||.62);audio.volume=Number.isFinite(storedVolume)?Math.max(0,Math.min(storedVolume,1)):.62;
    if(sharedMessage){activeReportContext={kind:"direct_letter",contentRef:safeReportReference(params.get("rid")),momentPublicId:"",sender:fromName,recipient:toName,text:sharedMessage,audioAttached:Boolean(incomingSharedAudioToken)};}updateReportButton();
    initializeCloudAuth().catch(()=>setCloudStatus("cloudUnavailable"));
    installPasswordToggles();bindEvents();installAutomaticFullscreen();setNames(fromName,toName,{persist:!linkNamesActive,explicit:false});applyLanguage();renderLibrary();requestNativeEntitlement();
    setTimeout(() => { initializeMomentsIntegration(); }, 0);
    if("serviceWorker" in navigator&&location.protocol.startsWith("http")&&location.hostname!=="appassets.androidplatform.net"){
      const registerServiceWorker=()=>setupServiceWorker().catch(()=>{});
      if(document.readyState==="complete")registerServiceWorker();else addEventListener("load",registerServiceWorker,{once:true});
    }
    try{
      const savedAudio=await loadMedia("audio");
      if(savedAudio?.blob&&audioDescriptor(savedAudio.blob,savedAudio.name||"")){
        customAudioBlob=savedAudio.blob;customAudioName=String(savedAudio.name||"");customAudioFingerprint=/^[0-9a-f]{64}$/u.test(savedAudio.fingerprint||"")?savedAudio.fingerprint:"";
        const temporary=savedAudio.temporaryShare;
        if(temporary&&SHARED_AUDIO_TOKEN_PATTERN.test(temporary.token||"")&&Date.parse(temporary.expiresAt||"")>Date.now()+5*60*1000)outgoingAudioShare=temporary;
        selectedTrack=3;localStorage.setItem("nurTrack","3");
      }else{selectedTrack=-1;localStorage.removeItem("nurTrack");}
    }catch{selectedTrack=-1;localStorage.removeItem("nurTrack");}
    renderAudioControls();
    // Готовим ссылку на присланное аудио заранее. Иначе первый тап уходит на
    // сетевой запрос, и к моменту play() жест уже «протух» — на iPhone браузер
    // отклоняет воспроизведение, причём молча.
    if(incomingSharedAudioToken)setAudioSource().catch(()=>{});
    createAtmosphere();await setupBackground();
    if(params.get("compose")==="1"||params.get("library")==="1")openPanel(layers.library);
    renderWeather();
    if(weatherEnabled){const stale=!weatherSnapshot||Date.now()-Number(weatherSnapshot.updatedAt||0)>30*60*1000;if(stale)refreshWeather({silent:true});}
  }

  init();
})();
