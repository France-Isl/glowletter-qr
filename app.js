(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const CONFIG = window.NUR_APP_CONFIG || {};
  const REPLY_ENGINE = window.NUR_REPLY_ENGINE || null;
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
  const BETA_STORAGE_KEY = "nurBetaCapability";
  const SUPABASE_URL = String(CONFIG.supabaseUrl || "").replace(/\/+$/, "");
  const SUPABASE_PUBLISHABLE_KEY = String(CONFIG.supabasePublishableKey || "").trim();
  const CLOUD_TABLE = "glowletter_progress";
  const CLOUD_SCHEMA_VERSION = 1;
  const CLOUD_SYNC_DELAY = 900;
  const CLOUD_MAX_WRITE_ATTEMPTS = 3;
  const CLOUD_SELECT_COLUMNS = "schema_version,sender_name,recipient_name,language,current_letter_id,favorite_ids,rain_enabled,weather_enabled,built_in_track,nature_enabled,fullscreen_enabled,volume,revision,updated_at";
  const AUTH_CALLBACK_PARAMETERS = ["code", "state", "error", "error_code", "error_description", "error_reason", "error_uri", "access_token", "refresh_token", "expires_in", "token_type", "provider_token", "provider_refresh_token"];
  const UI_THEMES = new Set(["moon", "rose", "forest", "sand"]);
  const WEATHER_STORAGE_KEY = "nurWeatherSnapshotV1";
  const SUPPORT_EMAIL = "ggooglov9@gmail.com";
  const SUPPORT_CATEGORIES = new Set(["technical", "account", "subscription", "content", "feedback", "other"]);
  const SUPPORT_MESSAGE_MIN = 20;
  const SUPPORT_MESSAGE_MAX = 2000;

  const UI = {
    ru: {
      title: "GlowLetter · Тёплые слова", brand: "Тёплые слова<br><em>находят путь</em>", brandCopy: "Тёплые слова для тех, кто по-настоящему важен.", from: "от", open: "Открыть письмо", create: "Создать своё письмо", free: "10 писем бесплатно", full: "полная версия — 21,99 €/месяц", weather: "Погода", next: "Следующее письмо", copy: "Копировать текст", copied: "Текст скопирован", read: "Прочитать", stop: "Остановить", postcard: "Открытка", saved: "Сохранить", favorite: "Сохранено", home: "На главную", personal: "Создать персональное письмо", stage: "Вечер сохранил эти слова для тебя", letterTitle: "Несколько слов для тебя", for: "для", warmSign: "С теплом,", aiTitle: "Личное письмо", aiEyebrow: "УМНЫЙ РЕДАКТОР · БЕЗ СЛУЧАЙНЫХ ФРАЗ", fromWho: "От кого", forWho: "Для кого", formHint: "Можно написать роль рядом с именем: «Амина (дочь)» → «Мама». Редактор сам подберёт смысл.", generate: "Создать красивое письмо", generating: "Собираю письмо по смыслу…", own: "Написать свой текст", ownWords: "Ваши слова", ownPlaceholder: "Напишите письмо своими словами…", useOwn: "Открыть моё письмо", ready: "ГОТОВОЕ ПИСЬМО", variant: "↻ Другой вариант", openAs: "Открыть как письмо", library: "Коллекция", openCount: "10 писем открыто", allCount: "Все 50 писем открыты", all: "Все", warm: "Тепло", gratitude: "Спасибо", support: "Поддержка", family: "Семья", openQuote: "Открыть", unlock: "Открыть полный доступ", locked: "Доступно в полной версии", settings: "Настроение", langLabel: "Язык приложения и писем", choosePhoto: "Выбрать фото", resetPhoto: "Вернуть озеро", buy: "Подписаться за", restore: "Восстановить подписку", purchaseUnavailable: "Подписка станет доступна в приложении из Google Play или App Store", restored: "Подписка проверена", premiumOn: "Полный доступ активен", safety: "Текст содержит запрещённую или двусмысленную формулировку. Измените его.", namesSafety: "Введите обычные имена или семейные роли.", customAdded: "Ваше письмо готово и сохранено в ссылке", rainOn: "Дождь включён", rainOff: "Дождь выключен", natureOn: "Ночной лес зазвучал", natureOff: "Звуки природы выключены", photoReady: "Личный фон сохранён на этом устройстве", photoReset: "Возвращён фон у озера", locationDenied: "Без разрешения местная погода недоступна", weatherFail: "Не удалось получить погоду", install: "Установить GlowLetter", shareText: "Это письмо для тебя", downloadReady: "Открытка готова", composeFail: "Облачный редактор недоступен — создан проверенный вариант", close: "Закрыть"
    },
    en: {
      title: "GlowLetter · Warm Words", brand: "Warm words<br><em>find their way</em>", brandCopy: "Warm words for the people who truly matter.", from: "from", open: "Open the letter", create: "Create your own letter", free: "10 letters free", full: "full version — €21.99/month", weather: "Weather", next: "Next letter", copy: "Copy text", copied: "Text copied", read: "Read aloud", stop: "Stop", postcard: "Postcard", saved: "Save", favorite: "Saved", home: "Home", personal: "Create a personal letter", stage: "The evening kept these words for you", letterTitle: "A few words for you", for: "for", warmSign: "With warmth,", aiTitle: "Personal letter", aiEyebrow: "SMART EDITOR · NO RANDOM PHRASES", fromWho: "From", forWho: "To", formHint: "You may add a role next to the name: “Amina (daughter)” → “Mum”. The editor will understand the context.", generate: "Create a beautiful letter", generating: "Building a coherent letter…", own: "Write your own text", ownWords: "Your words", ownPlaceholder: "Write your letter in your own words…", useOwn: "Open my letter", ready: "YOUR LETTER", variant: "↻ Another version", openAs: "Open as a letter", library: "Collection", openCount: "10 letters unlocked", allCount: "All 50 letters unlocked", all: "All", warm: "Warmth", gratitude: "Gratitude", support: "Support", family: "Family", openQuote: "Open", unlock: "Unlock full access", locked: "Available in the full version", settings: "Atmosphere", langLabel: "App and letter language", choosePhoto: "Choose a photo", resetPhoto: "Restore the lake", buy: "Subscribe for", restore: "Restore subscription", purchaseUnavailable: "Subscriptions are available in the Google Play or App Store app", restored: "Subscription checked", premiumOn: "Full access is active", safety: "This text contains a prohibited or ambiguous phrase. Please change it.", namesSafety: "Enter ordinary names or family roles.", customAdded: "Your letter is ready and saved in the link", rainOn: "Rain is on", rainOff: "Rain is off", natureOn: "The night forest is alive", natureOff: "Nature sounds are off", photoReady: "Your background is saved on this device", photoReset: "The lake background is back", locationDenied: "Local weather needs location permission", weatherFail: "Weather is unavailable", install: "Install GlowLetter", shareText: "This letter is for you", downloadReady: "Your postcard is ready", composeFail: "Cloud editor unavailable — a verified version was created", close: "Close"
    },
    fr: {
      title: "GlowLetter · Mots chaleureux", brand: "Les mots sincères<br><em>trouvent leur chemin</em>", brandCopy: "Des mots chaleureux pour les personnes qui comptent vraiment.", from: "de", open: "Ouvrir la lettre", create: "Créer votre lettre", free: "10 lettres gratuites", full: "version complète — 21,99 €/mois", weather: "Météo", next: "Lettre suivante", copy: "Copier le texte", copied: "Texte copié", read: "Lire à voix haute", stop: "Arrêter", postcard: "Carte", saved: "Enregistrer", favorite: "Enregistré", home: "Accueil", personal: "Créer une lettre personnelle", stage: "Le soir a gardé ces mots pour toi", letterTitle: "Quelques mots pour toi", for: "pour", warmSign: "Avec chaleur,", aiTitle: "Lettre personnelle", aiEyebrow: "ÉDITEUR INTELLIGENT · AUCUNE PHRASE ALÉATOIRE", fromWho: "De la part de", forWho: "Pour", formHint: "Vous pouvez ajouter le lien familial au nom : « Amina (fille) » → « Maman ». L’éditeur comprendra le contexte.", generate: "Créer une belle lettre", generating: "Je compose une lettre cohérente…", own: "Écrire votre propre texte", ownWords: "Vos mots", ownPlaceholder: "Écrivez votre lettre avec vos propres mots…", useOwn: "Ouvrir ma lettre", ready: "VOTRE LETTRE", variant: "↻ Une autre version", openAs: "Ouvrir comme lettre", library: "Collection", openCount: "10 lettres accessibles", allCount: "Les 50 lettres sont accessibles", all: "Toutes", warm: "Chaleur", gratitude: "Merci", support: "Soutien", family: "Famille", openQuote: "Ouvrir", unlock: "Débloquer l’accès complet", locked: "Disponible dans la version complète", settings: "Atmosphère", langLabel: "Langue de l’application et des lettres", choosePhoto: "Choisir une photo", resetPhoto: "Remettre le lac", buy: "S’abonner pour", restore: "Restaurer l’abonnement", purchaseUnavailable: "L’abonnement est disponible dans l’application Google Play ou App Store", restored: "Abonnement vérifié", premiumOn: "L’accès complet est actif", safety: "Ce texte contient une formulation interdite ou ambiguë. Modifiez-le.", namesSafety: "Saisissez des prénoms ordinaires ou des rôles familiaux.", customAdded: "Votre lettre est prête et enregistrée dans le lien", rainOn: "La pluie est activée", rainOff: "La pluie est désactivée", natureOn: "La forêt nocturne s’éveille", natureOff: "Les sons de la nature sont désactivés", photoReady: "Votre fond est enregistré sur cet appareil", photoReset: "Le lac est de retour", locationDenied: "La météo locale nécessite votre autorisation", weatherFail: "La météo est indisponible", install: "Installer GlowLetter", shareText: "Cette lettre est pour toi", downloadReady: "Votre carte est prête", composeFail: "L’éditeur en ligne est indisponible — une version vérifiée a été créée", close: "Fermer"
    }
  };

  const EXTRA_UI = {
    ru: { adabTitle:"Режим адаба всегда включён",adabNote:"Только уважительные слова. Темы 18+, грубость и запретное содержание блокируются.",ownNote:"Перед добавлением текст проходит тот же фильтр скромности. Он будет сохранён в персональной ссылке.",qualityTitle:"Почему текст стал лучше:",qualityBody:"редактор определяет семейный контекст, собирает цельное письмо из проверенных смыслов и проверяет результат. Никакой модели на 500 МБ.",religiousNote:"Фильтр помогает сохранять скромность и уважение, но не является религиозным заключением. Перед отправкой перечитайте письмо.",collectionEyebrow:"50 ПРОВЕРЕННЫХ ТЕКСТОВ",collectionNote:"Каждый текст автоматически обращается к выбранному человеку.",settingsEyebrow:"ВАША АТМОСФЕРА",rainTitle:"Живой дождь",rainNote:"крупные капли и брызги",natureTitle:"Ночной лес",natureNote:"сверчки, ветер и лягушки",weatherTitle:"Моя погода",weatherNote:"атмосфера по месту",fullscreenTitle:"Полный экран",fullscreenNote:"без лишних элементов",personalBg:"Личный фон",ownPhoto:"Своя фотография",localOnly:"Останется только на этом устройстве",music:"Музыка и нашиды",fullVersion:"ПРЕМИУМ",allLetters:"Откройте все функции GlowLetter",onePurchase:"Ежемесячная подписка: умные ответы, все письма и новые функции.",paywallEyebrow:"GLOWLETTER · ПРЕМИУМ",paywallTitle:"Умные письма<br><em>для важных людей</em>",paywallBody:"Первые 10 писем остаются бесплатными. Премиум продлевается ежемесячно и открывает все умные функции.",benefit1:"50 персональных писем",benefit2:"умный анализ сообщения",benefit3:"новые функции каждый месяц",payButton:"Оформить подписку",storeNote:"Автопродление можно отменить в аккаунте магазина. Цена отображается в местной валюте.",privacy:"Конфиденциальность",supportLink:"Поддержка",customMusic:"Добавить свой нашид",customMusicNote:"MP3, M4A, OGG или WAV" },
    en: { adabTitle:"Adab mode is always on",adabNote:"Respectful words only. Adult content, abuse, and prohibited themes are blocked.",ownNote:"Your text passes the same modesty filter and is saved inside the personal link.",qualityTitle:"Why the text is better:",qualityBody:"the editor identifies family context, builds one coherent letter from reviewed ideas, and validates the result. No 500 MB model download.",religiousNote:"The filter supports modest and respectful wording but is not a religious ruling. Please reread the letter before sending.",collectionEyebrow:"50 REVIEWED TEXTS",collectionNote:"Every text automatically addresses the person you selected.",settingsEyebrow:"YOUR ATMOSPHERE",rainTitle:"Living rain",rainNote:"large drops and gentle splashes",natureTitle:"Night forest",natureNote:"crickets, wind, and frogs",weatherTitle:"My weather",weatherNote:"atmosphere for your location",fullscreenTitle:"Full screen",fullscreenNote:"a clear, immersive view",personalBg:"Personal background",ownPhoto:"Your own photo",localOnly:"Stays only on this device",music:"Music and nasheeds",fullVersion:"PREMIUM",allLetters:"Unlock every GlowLetter feature",onePurchase:"Monthly subscription: smart replies, every letter, and new features.",paywallEyebrow:"GLOWLETTER · PREMIUM",paywallTitle:"Smart letters<br><em>for important people</em>",paywallBody:"The first 10 letters stay free. Premium renews monthly and unlocks every smart feature.",benefit1:"50 personal letters",benefit2:"smart message analysis",benefit3:"new features every month",payButton:"Start subscription",storeNote:"Auto-renewal can be cancelled in your store account. The local store price is shown.",privacy:"Privacy",supportLink:"Support",customMusic:"Add your own nasheed",customMusicNote:"MP3, M4A, OGG, or WAV" },
    fr: { adabTitle:"Le mode adab est toujours actif",adabNote:"Uniquement des mots respectueux. Le contenu adulte, la grossièreté et les thèmes interdits sont bloqués.",ownNote:"Votre texte passe le même filtre de pudeur et sera enregistré dans le lien personnel.",qualityTitle:"Pourquoi le texte est meilleur :",qualityBody:"l’éditeur reconnaît le contexte familial, compose une lettre cohérente avec des idées vérifiées et contrôle le résultat. Aucun modèle de 500 Mo.",religiousNote:"Le filtre favorise la pudeur et le respect, mais ne constitue pas un avis religieux. Relisez la lettre avant de l’envoyer.",collectionEyebrow:"50 TEXTES VÉRIFIÉS",collectionNote:"Chaque texte s’adresse automatiquement à la personne choisie.",settingsEyebrow:"VOTRE ATMOSPHÈRE",rainTitle:"Pluie vivante",rainNote:"grosses gouttes et éclaboussures douces",natureTitle:"Forêt nocturne",natureNote:"grillons, vent et grenouilles",weatherTitle:"Ma météo",weatherNote:"une ambiance adaptée au lieu",fullscreenTitle:"Plein écran",fullscreenNote:"une vue claire et immersive",personalBg:"Fond personnel",ownPhoto:"Votre photo",localOnly:"Reste uniquement sur cet appareil",music:"Musique et nasheeds",fullVersion:"PREMIUM",allLetters:"Débloquez toutes les fonctions",onePurchase:"Abonnement mensuel : réponses intelligentes, toutes les lettres et nouveautés.",paywallEyebrow:"GLOWLETTER · PREMIUM",paywallTitle:"Lettres intelligentes<br><em>pour les personnes importantes</em>",paywallBody:"Les 10 premières lettres restent gratuites. Premium se renouvelle chaque mois et ouvre toutes les fonctions intelligentes.",benefit1:"50 lettres personnelles",benefit2:"analyse intelligente du message",benefit3:"nouvelles fonctions chaque mois",payButton:"S’abonner",storeNote:"Le renouvellement automatique peut être annulé dans votre compte du magasin. Le prix local s’affiche.",privacy:"Confidentialité",supportLink:"Assistance",customMusic:"Ajouter votre nasheed",customMusicNote:"MP3, M4A, OGG ou WAV" }
  };
  Object.keys(UI).forEach(code => Object.assign(UI[code], EXTRA_UI[code]));
  UI.ru.brandCopyPersonal = "Тёплые слова, выбранные с заботой специально для {to}.";
  UI.en.brandCopyPersonal = "Warm words chosen with care especially for {to}.";
  UI.fr.brandCopyPersonal = "Des mots chaleureux choisis avec soin spécialement pour {to}.";
  Object.assign(UI.ru, {
    setupEyebrow:"ПЕРЕД ОТКРЫТИЕМ ПИСЬМА",setupTitle:"Для кого это письмо?",setupNote:"Имена нужны только для личного обращения и подписи.",setupSubmit:"Открыть письмо",
    create:"Создать своё письмо",replyAssist:"Помочь с ответом",letterMode:"Письмо",replyMode:"Ответ на сообщение",replyTitle:"Умный ответ",replyEyebrow:"ПОМОЩНИК ДЛЯ СПОКОЙНОГО ДИАЛОГА",
    relationshipLabel:"Кому вы пишете · необязательно",toneLabel:"Стиль письма · необязательно",optionalHint:"Выбор необязателен. Романтический стиль разрешён только для супруга или супруги; фильтр адаба остаётся включён.",romanticSpouseOnly:"Романтический стиль предназначен только для супруга или супруги. Выберите это отношение или другой стиль.",
    setupSenderPlaceholder:"Ваше имя",setupRecipientPlaceholder:"Имя получателя",aiSenderPlaceholder:"Ваше имя или Амина (дочь)",aiRecipientPlaceholder:"Имя или Мама",routeFrom:"ОТ",routeTo:"ДЛЯ",stateOn:"ВКЛ",stateOff:"ВЫКЛ",stateOpen:"ОТКРЫТЬ",trackPrimary:"основная мелодия",trackLight:"светлая версия",trackWarm:"тёплая версия",
    homeAria:"На главный экран",soundOnAria:"Включить нашид",soundOffAria:"Выключить нашид",natureOnAria:"Включить звуки природы",natureOffAria:"Выключить звуки природы",weatherAria:"Показать погоду",languageAria:"Изменить язык",libraryAria:"Коллекция писем",settingsAria:"Атмосфера и музыка",previousAria:"Предыдущее письмо",shareAria:"Поделиться письмом",closeAria:"Закрыть",closeEditorAria:"Закрыть редактор",closeLibraryAria:"Закрыть коллекцию",closeSettingsAria:"Закрыть настройки",homeScreenAria:"Главный экран",letterNavAria:"Переключение писем",aiModeAria:"Режим помощника",generatedLetterAria:"Сгенерированное письмо",generatedReplyAria:"Сгенерированный ответ",
    replyIncoming:"Что вам написали?",replyPlaceholder:"Вставьте сюда сообщение, на которое хотите ответить…",replyGoal:"Что вы хотите сказать · необязательно",replyGoalPlaceholder:"Например: принимаю предложение; приду в 19:00; хочу вежливо отказаться…",replyRelationshipLabel:"Кто вам написал · необязательно",replyToneLabel:"Как ответить · необязательно",replyLengthLabel:"Длина ответа",replyHint:"Помощник напишет уважительный ответ без 18+, грубости и двусмысленных фраз. Если вопрос требует вашего решения, добавьте главную мысль, чтобы ИИ ничего не придумал за вас.",replyGenerate:"Подготовить ответ",replyGenerating:"Подбираю спокойный ответ…",replyReady:"ГОТОВЫЙ ОТВЕТ",replyVariant:"↻ Другой вариант",copyReply:"▣ Скопировать ответ",replySafety:"Вставьте обычное сообщение без запрещённого содержания.",replyShort:"Добавьте сообщение, чтобы помощник понял контекст.",replyInsightTitle:"Смысл сообщения",replyNeedsGoal:"Нужна ваша точная мысль — заполните поле ниже",replyGoalOptional:"Можно сразу подготовить ответ",replyAuditSafe:"Проверка adab пройдена",replyAuditSafeDetails:"Ответ уважительный, без давления и запрещённых формулировок.",replyAuditWarning:"Перед копированием нужно исправить",replyAuditWarningDetails:"Проверьте смысл, тон и формулировки ответа.",
    checkingPurchase:"Проверяю подписку…",allLetters:"Откройте премиум GlowLetter",onePurchase:"Ежемесячная подписка: 50 писем, умный анализ, проверка adab и будущие функции.",paywallBody:"Первые 10 писем остаются бесплатными. Премиум автоматически продлевается каждый месяц, пока вы не отмените его в аккаунте магазина.",benefit1:"все 50 персональных писем",benefit2:"умный анализ сообщения",benefit3:"проверка уважительности и adab",benefit4:"новые тексты и функции",saveSettings:"Сохранить настройки",settingsSaved:"Настройки сохранены",manageSubscription:"Управление подпиской",terms:"Условия",deletePage:"Удаление аккаунта",installIosHint:"На iPhone: «Поделиться» → «На экран Домой».",
    accountTitle:"Аккаунт и синхронизация",accountGuestNote:"Войдите, чтобы сохранять письма и настройки на ваших устройствах.",accountPrivacy:"Фото, своя музыка, тексты из помощника и закрытый тестовый доступ остаются только на этом устройстве.",continueGoogle:"Продолжить с Google",continueFacebook:"Продолжить с Facebook",signOut:"Выйти",deleteAccount:"Удалить аккаунт",deleteAccountConfirm:"Удалить аккаунт GlowLetter и весь облачный прогресс без возможности восстановления? Подписка магазина отменяется отдельно.",deleteAccountDeleting:"Удаляю аккаунт…",deleteAccountDone:"Аккаунт и облачный прогресс удалены",deleteAccountFail:"Не удалось удалить аккаунт. Проверьте интернет или напишите в поддержку.",cloudChecking:"Проверяю вход…",cloudProvidersChecking:"Проверяю способы входа…",cloudSignInPrompt:"Войдите, чтобы включить облачное сохранение",cloudSyncing:"Сохраняю прогресс…",cloudSynced:"Прогресс сохранён в облаке",cloudOffline:"Нет связи — изменения остаются на устройстве",cloudError:"Не удалось синхронизировать. Попробую снова при подключении.",cloudUnavailable:"Облачный вход сейчас недоступен",cloudSignInError:"Не удалось войти. Попробуйте ещё раз.",cloudSigningIn:"Открываю безопасный вход…",cloudSignedOut:"Вы вышли из аккаунта"
  });
  Object.assign(UI.en, {
    setupEyebrow:"BEFORE OPENING THE LETTER",setupTitle:"Who is this letter for?",setupNote:"Names are used only for the personal greeting and signature.",setupSubmit:"Open the letter",
    create:"Create your own letter",replyAssist:"Help me reply",letterMode:"Letter",replyMode:"Reply to a message",replyTitle:"Smart reply",replyEyebrow:"A CALM CONVERSATION ASSISTANT",
    relationshipLabel:"Who are you writing to? · optional",toneLabel:"Letter style · optional",optionalHint:"Both choices are optional. Romantic style is available only for a spouse; adab filtering always stays on.",romanticSpouseOnly:"Romantic style is only for a spouse. Choose that relationship or another style.",
    setupSenderPlaceholder:"Your name",setupRecipientPlaceholder:"Recipient's name",aiSenderPlaceholder:"Your name or Amina (daughter)",aiRecipientPlaceholder:"Name or Mum",routeFrom:"FROM",routeTo:"TO",stateOn:"ON",stateOff:"OFF",stateOpen:"OPEN",trackPrimary:"main melody",trackLight:"light version",trackWarm:"warm version",
    homeAria:"Go to the home screen",soundOnAria:"Play nasheed",soundOffAria:"Pause nasheed",natureOnAria:"Turn on nature sounds",natureOffAria:"Turn off nature sounds",weatherAria:"Show weather",languageAria:"Change language",libraryAria:"Letter collection",settingsAria:"Atmosphere and music",previousAria:"Previous letter",shareAria:"Share letter",closeAria:"Close",closeEditorAria:"Close editor",closeLibraryAria:"Close collection",closeSettingsAria:"Close settings",homeScreenAria:"Home screen",letterNavAria:"Browse letters",aiModeAria:"Assistant mode",generatedLetterAria:"Generated letter",generatedReplyAria:"Generated reply",
    replyIncoming:"What did they write to you?",replyPlaceholder:"Paste the message you want to answer…",replyGoal:"What do you want to say? · optional",replyGoalPlaceholder:"For example: I agree; I will arrive at 7 pm; I want to decline politely…",replyRelationshipLabel:"Who wrote to you? · optional",replyToneLabel:"How should the reply sound? · optional",replyLengthLabel:"Reply length",replyHint:"The assistant drafts a respectful reply without adult, abusive, or suggestive wording. If the question needs your decision, add your main point so the AI does not invent it.",replyGenerate:"Draft a reply",replyGenerating:"Preparing a calm reply…",replyReady:"READY TO SEND",replyVariant:"↻ Another version",copyReply:"▣ Copy reply",replySafety:"Paste an ordinary message without prohibited content.",replyShort:"Add the received message so the assistant understands the context.",replyInsightTitle:"Message meaning",replyNeedsGoal:"Your exact point is needed — complete the field below",replyGoalOptional:"A reply can be drafted now",replyAuditSafe:"Adab check passed",replyAuditSafeDetails:"The reply is respectful and contains no pressure or prohibited wording.",replyAuditWarning:"Fix this before copying",replyAuditWarningDetails:"Review the meaning, tone, and wording of the reply.",
    checkingPurchase:"Checking subscription…",allLetters:"Unlock GlowLetter Premium",onePurchase:"Monthly subscription: 50 letters, smart analysis, adab checking, and future features.",paywallBody:"The first 10 letters stay free. Premium renews automatically every month until cancelled in your store account.",benefit1:"all 50 personal letters",benefit2:"smart message analysis",benefit3:"respect and adab checking",benefit4:"new letters and features",saveSettings:"Save settings",settingsSaved:"Settings saved",manageSubscription:"Manage subscription",terms:"Terms",deletePage:"Delete account",installIosHint:"On iPhone: Share → Add to Home Screen.",
    accountTitle:"Account and sync",accountGuestNote:"Sign in to keep your letters and settings across your devices.",accountPrivacy:"Photos, custom audio, assistant text, and private beta access stay only on this device.",continueGoogle:"Continue with Google",continueFacebook:"Continue with Facebook",signOut:"Sign out",deleteAccount:"Delete account",deleteAccountConfirm:"Permanently delete your GlowLetter account and cloud progress? Store subscriptions must be cancelled separately.",deleteAccountDeleting:"Deleting account…",deleteAccountDone:"Account and cloud progress deleted",deleteAccountFail:"Could not delete the account. Check your connection or contact support.",cloudChecking:"Checking your account…",cloudProvidersChecking:"Checking sign-in methods…",cloudSignInPrompt:"Sign in to enable cloud saving",cloudSyncing:"Saving your progress…",cloudSynced:"Progress saved to the cloud",cloudOffline:"Offline — changes remain on this device",cloudError:"Could not sync. I will retry when you are online.",cloudUnavailable:"Cloud sign-in is currently unavailable",cloudSignInError:"Could not sign in. Please try again.",cloudSigningIn:"Opening secure sign-in…",cloudSignedOut:"You are signed out"
  });
  Object.assign(UI.fr, {
    setupEyebrow:"AVANT D’OUVRIR LA LETTRE",setupTitle:"À qui s’adresse cette lettre ?",setupNote:"Les prénoms servent uniquement à personnaliser l’adresse et la signature.",setupSubmit:"Ouvrir la lettre",
    create:"Créer votre lettre",replyAssist:"M’aider à répondre",letterMode:"Lettre",replyMode:"Réponse à un message",replyTitle:"Réponse intelligente",replyEyebrow:"UN ASSISTANT POUR DIALOGUER SEREINEMENT",
    relationshipLabel:"À qui écrivez-vous ? · facultatif",toneLabel:"Style de la lettre · facultatif",optionalHint:"Ces choix sont facultatifs. Le style romantique est réservé aux époux ; le filtre d’adab reste toujours actif.",romanticSpouseOnly:"Le style romantique est réservé aux époux. Choisissez cette relation ou un autre style.",
    setupSenderPlaceholder:"Votre prénom",setupRecipientPlaceholder:"Prénom du destinataire",aiSenderPlaceholder:"Votre prénom ou Amina (fille)",aiRecipientPlaceholder:"Prénom ou Maman",routeFrom:"DE",routeTo:"POUR",stateOn:"ACTIF",stateOff:"INACTIF",stateOpen:"OUVRIR",trackPrimary:"mélodie principale",trackLight:"version lumineuse",trackWarm:"version chaleureuse",
    homeAria:"Aller à l’accueil",soundOnAria:"Lire le nasheed",soundOffAria:"Mettre le nasheed en pause",natureOnAria:"Activer les sons de la nature",natureOffAria:"Désactiver les sons de la nature",weatherAria:"Afficher la météo",languageAria:"Changer de langue",libraryAria:"Collection de lettres",settingsAria:"Ambiance et musique",previousAria:"Lettre précédente",shareAria:"Partager la lettre",closeAria:"Fermer",closeEditorAria:"Fermer l’éditeur",closeLibraryAria:"Fermer la collection",closeSettingsAria:"Fermer les réglages",homeScreenAria:"Écran d’accueil",letterNavAria:"Parcourir les lettres",aiModeAria:"Mode de l’assistant",generatedLetterAria:"Lettre générée",generatedReplyAria:"Réponse générée",
    replyIncoming:"Quel message avez-vous reçu ?",replyPlaceholder:"Collez le message auquel vous souhaitez répondre…",replyGoal:"Que souhaitez-vous répondre ? · facultatif",replyGoalPlaceholder:"Par exemple : je suis d’accord ; j’arriverai à 19 h ; je veux refuser poliment…",replyRelationshipLabel:"Qui vous a écrit ? · facultatif",replyToneLabel:"Quel ton employer ? · facultatif",replyLengthLabel:"Longueur de la réponse",replyHint:"L’assistant prépare une réponse respectueuse, sans contenu adulte, grossier ou ambigu. Si la question exige votre décision, ajoutez l’idée principale afin que l’IA ne l’invente pas.",replyGenerate:"Préparer une réponse",replyGenerating:"Je prépare une réponse sereine…",replyReady:"RÉPONSE PRÊTE",replyVariant:"↻ Une autre version",copyReply:"▣ Copier la réponse",replySafety:"Collez un message ordinaire sans contenu interdit.",replyShort:"Ajoutez le message reçu pour donner le contexte à l’assistant.",replyInsightTitle:"Sens du message",replyNeedsGoal:"Votre intention exacte est nécessaire — complétez le champ ci-dessous",replyGoalOptional:"Une réponse peut être préparée maintenant",replyAuditSafe:"Vérification adab réussie",replyAuditSafeDetails:"La réponse reste respectueuse, sans pression ni formulation interdite.",replyAuditWarning:"À corriger avant de copier",replyAuditWarningDetails:"Vérifiez le sens, le ton et les formulations de la réponse.",
    checkingPurchase:"Vérification de l’abonnement…",allLetters:"Débloquez GlowLetter Premium",onePurchase:"Abonnement mensuel : 50 lettres, analyse intelligente, contrôle adab et futures fonctions.",paywallBody:"Les 10 premières lettres restent gratuites. Premium se renouvelle automatiquement chaque mois jusqu’à son annulation dans le compte du magasin.",benefit1:"les 50 lettres personnelles",benefit2:"analyse intelligente du message",benefit3:"contrôle du respect et de l’adab",benefit4:"nouvelles lettres et fonctions",saveSettings:"Enregistrer les réglages",settingsSaved:"Réglages enregistrés",manageSubscription:"Gérer l’abonnement",terms:"Conditions",deletePage:"Supprimer le compte",installIosHint:"Sur iPhone : Partager → Sur l’écran d’accueil.",
    accountTitle:"Compte et synchronisation",accountGuestNote:"Connectez-vous pour retrouver vos lettres et réglages sur vos appareils.",accountPrivacy:"Les photos, les fichiers audio personnels, les textes de l’assistant et l’accès bêta privé restent uniquement sur cet appareil.",continueGoogle:"Continuer avec Google",continueFacebook:"Continuer avec Facebook",signOut:"Se déconnecter",deleteAccount:"Supprimer le compte",deleteAccountConfirm:"Supprimer définitivement votre compte GlowLetter et votre progression en ligne ? L’abonnement du magasin doit être annulé séparément.",deleteAccountDeleting:"Suppression du compte…",deleteAccountDone:"Compte et progression en ligne supprimés",deleteAccountFail:"Impossible de supprimer le compte. Vérifiez la connexion ou contactez l’assistance.",cloudChecking:"Vérification du compte…",cloudProvidersChecking:"Vérification des modes de connexion…",cloudSignInPrompt:"Connectez-vous pour activer la sauvegarde en ligne",cloudSyncing:"Enregistrement de votre progression…",cloudSynced:"Progression enregistrée en ligne",cloudOffline:"Hors connexion — les changements restent sur cet appareil",cloudError:"Synchronisation impossible. Nouvel essai dès le retour du réseau.",cloudUnavailable:"La connexion en ligne est indisponible",cloudSignInError:"Connexion impossible. Réessayez.",cloudSigningIn:"Ouverture de la connexion sécurisée…",cloudSignedOut:"Vous êtes déconnecté"
  });
  UI.ru.namesSettings = "Личное обращение";
  UI.en.namesSettings = "Personal names";
  UI.fr.namesSettings = "Personnalisation";
  Object.assign(UI.ru, {
    replyEyebrow: "ПОМОЩНИК, КОТОРЫЙ ПОНИМАЕТ СМЫСЛ",
    replyGenerating: "Понимаю смысл сообщения…",
    shareApp: "Поделиться приложением",
    shareAppText: "GlowLetter — тёплые письма для важных людей.",
    shareAppCopied: "Ссылка на приложение скопирована",
    shareChooserEyebrow: "GLOWLETTER · ПОДЕЛИТЬСЯ", shareChooserTitle: "Поделиться приложением", shareChooserLead: "Выберите удобный способ отправки.", shareTelegram: "Telegram", shareWhatsapp: "WhatsApp", shareEmail: "Почта", shareCopy: "Скопировать ссылку"
  });
  Object.assign(UI.en, {
    replyEyebrow: "AN ASSISTANT THAT UNDERSTANDS THE MESSAGE",
    replyGenerating: "Understanding the message…",
    shareApp: "Share the app",
    shareAppText: "GlowLetter — warm letters for the people who matter.",
    shareAppCopied: "App link copied",
    shareChooserEyebrow: "GLOWLETTER · SHARE", shareChooserTitle: "Share the app", shareChooserLead: "Choose how you would like to send it.", shareTelegram: "Telegram", shareWhatsapp: "WhatsApp", shareEmail: "Email", shareCopy: "Copy link"
  });
  Object.assign(UI.fr, {
    replyEyebrow: "UN ASSISTANT QUI COMPREND LE MESSAGE",
    replyGenerating: "Je comprends le sens du message…",
    shareApp: "Partager l’application",
    shareAppText: "GlowLetter — des lettres chaleureuses pour les personnes qui comptent.",
    shareAppCopied: "Lien de l’application copié",
    shareChooserEyebrow: "GLOWLETTER · PARTAGER", shareChooserTitle: "Partager l’application", shareChooserLead: "Choisissez votre mode d’envoi.", shareTelegram: "Telegram", shareWhatsapp: "WhatsApp", shareEmail: "E-mail", shareCopy: "Copier le lien"
  });
  Object.assign(UI.ru, {
    brandCopy:"Тёплые слова для тех, кто действительно важен.",stage:"Эти слова нашли путь к тебе",locationDenied:"Геолокация недоступна — показываю погоду ближайшего города",
    replyHint:"Помощник отвечает только на текущее сообщение, уважительно и без 18+, грубости или двусмысленных фраз. Перед отправкой перечитайте ответ.",replyCurrent:"Ответ будет создан только по этому сообщению",
    themeTitle:"Цвет интерфейса",themeAria:"Цвет интерфейса",themeMoon:"Лунный",themeRose:"Розовый",themeForest:"Лесной",themeSand:"Тёплый",
    qrOpen:"Создать QR-код письма",qrCloseAria:"Закрыть QR-код",qrTitle:"Письмо, которое<br><em>откроется по камере</em>",qrLead:"Укажите имена, скачайте QR-код и приложите его к цветам или подарку. Получатель увидит первые 10 писем бесплатно.",qrGenerate:"Обновить QR-код",qrCaption:"10 писем в подарок",qrPrivacy:"В QR-коде сохраняются только выбранные имена, язык и ссылка на бесплатную версию. Ключ полного доступа не передаётся.",qrDownload:"↓ Скачать PNG",qrCopyLink:"▣ Скопировать ссылку",qrCopyImage:"▦ Скопировать QR",qrPrint:"⌁ Распечатать",qrRoute:"Письмо от {from} для {to}",qrGenericRoute:"Тёплое письмо для вас",qrReady:"QR-код готов",qrLinkCopied:"Ссылка QR-кода скопирована",qrImageCopied:"QR-код скопирован",qrImageCopyFail:"На этом устройстве можно скачать QR-код как PNG",qrUnavailable:"QR-код временно недоступен",backgroundFail:"Не удалось обработать этот фон",backgroundTooLarge:"Выберите файл размером до 18 МБ",fullscreenUnavailable:"Полноэкранный режим недоступен на этом устройстве",speechUnavailable:"Озвучивание недоступно на этом устройстве"
  });
  Object.assign(UI.en, {
    brandCopy:"Warm words for the people who truly matter.",stage:"These words found their way to you",locationDenied:"Location is unavailable — showing weather for the nearest fallback city",
    replyHint:"The assistant replies only to the current message, respectfully and without adult, abusive, or suggestive wording. Please reread before sending.",replyCurrent:"The reply will use only this message",
    themeTitle:"Interface color",themeAria:"Interface color",themeMoon:"Moon",themeRose:"Rose",themeForest:"Forest",themeSand:"Warm",
    qrOpen:"Create a letter QR code",qrCloseAria:"Close QR code",qrTitle:"A letter that<br><em>opens with the camera</em>",qrLead:"Add the names, download the QR code, and attach it to flowers or a gift. The recipient can read the first 10 letters for free.",qrGenerate:"Update QR code",qrCaption:"10 letters as a gift",qrPrivacy:"The QR code contains only the selected names, language, and public free-version link. Full-access keys are never shared.",qrDownload:"↓ Download PNG",qrCopyLink:"▣ Copy link",qrCopyImage:"▦ Copy QR",qrPrint:"⌁ Print",qrRoute:"A letter from {from} to {to}",qrGenericRoute:"A warm letter for you",qrReady:"QR code is ready",qrLinkCopied:"QR link copied",qrImageCopied:"QR code copied",qrImageCopyFail:"Download the QR code as PNG on this device",qrUnavailable:"QR code is temporarily unavailable",backgroundFail:"This background could not be processed",backgroundTooLarge:"Choose a file up to 18 MB",fullscreenUnavailable:"Full screen is unavailable on this device",speechUnavailable:"Read aloud is unavailable on this device"
  });
  Object.assign(UI.fr, {
    brandCopy:"Des mots chaleureux pour les personnes qui comptent vraiment.",stage:"Ces mots ont trouvé leur chemin jusqu’à toi",locationDenied:"La position est indisponible — météo de la ville de secours affichée",
    replyHint:"L’assistant répond uniquement au message actuel, avec respect et sans contenu adulte, grossier ou ambigu. Relisez la réponse avant l’envoi.",replyCurrent:"La réponse utilisera uniquement ce message",
    themeTitle:"Couleur de l’interface",themeAria:"Couleur de l’interface",themeMoon:"Lune",themeRose:"Rose",themeForest:"Forêt",themeSand:"Chaleureux",
    qrOpen:"Créer le QR d’une lettre",qrCloseAria:"Fermer le QR code",qrTitle:"Une lettre qui<br><em>s’ouvre avec l’appareil photo</em>",qrLead:"Ajoutez les prénoms, téléchargez le QR code et joignez-le à des fleurs ou à un cadeau. Le destinataire lira gratuitement les 10 premières lettres.",qrGenerate:"Actualiser le QR code",qrCaption:"10 lettres en cadeau",qrPrivacy:"Le QR code contient uniquement les prénoms choisis, la langue et le lien public gratuit. La clé d’accès complet n’est jamais transmise.",qrDownload:"↓ Télécharger le PNG",qrCopyLink:"▣ Copier le lien",qrCopyImage:"▦ Copier le QR",qrPrint:"⌁ Imprimer",qrRoute:"Une lettre de {from} pour {to}",qrGenericRoute:"Une lettre chaleureuse pour vous",qrReady:"Le QR code est prêt",qrLinkCopied:"Lien du QR code copié",qrImageCopied:"QR code copié",qrImageCopyFail:"Téléchargez le QR code en PNG sur cet appareil",qrUnavailable:"Le QR code est momentanément indisponible",backgroundFail:"Ce fond n’a pas pu être traité",backgroundTooLarge:"Choisissez un fichier de 18 Mo maximum",fullscreenUnavailable:"Le plein écran est indisponible sur cet appareil",speechUnavailable:"La lecture à voix haute est indisponible sur cet appareil"
  });
  Object.assign(UI.ru, {
    accountSupportLabel:"ID для поддержки",accountSupportNote:"Это не пароль. Передавайте ID только официальной поддержке GlowLetter.",accountIdCopy:"Скопировать",accountIdCopied:"ID аккаунта скопирован",accountPlanChecking:"Проверяю доступ…",accountPlanFree:"Бесплатный доступ · 10 писем",accountPlanPermanent:"VIP · полный доступ без ограничений",accountPlanStore:"VIP · подписка активна",accountPlanVip:"Осталось {remaining} · до {date}",accountBadgeChecking:"…",accountBadgeFree:"FREE",accountBadgeVip:"VIP",accountBadgeAdmin:"АДМИНИСТРАТОР",profilePhotoAria:"Изменить фото профиля",profilePhotoReady:"Фото профиля сохранено на этом устройстве",profilePhotoFail:"Не удалось обработать фото",profilePhotoTooLarge:"Выберите фото размером до 8 МБ",
    adminEyebrow:"УПРАВЛЕНИЕ ДОСТУПОМ",adminTitle:"Админ-панель",adminDescription:"По ID видны только срок и статус доступа. Выдача и отзыв VIP записываются в защищённый журнал.",adminIdLabel:"ID аккаунта",adminIdPlaceholder:"Вставьте полный ID GL-…",adminFind:"Найти",adminSearching:"Ищу аккаунт…",adminNotFound:"Аккаунт с таким ID не найден",adminCurrentPlan:"Текущий план",adminDaysLabel:"Срок VIP",adminDaysUnit:"дней",adminGrantVip:"Выдать VIP",adminRevoke:"Отозвать VIP",adminGrantDone:"VIP-доступ выдан до {date}",adminRevokeDone:"VIP-доступ отозван",adminError:"Не удалось выполнить действие. Проверьте ID и подключение."
  });
  Object.assign(UI.en, {
    accountSupportLabel:"Support ID",accountSupportNote:"This is not a password. Share it only with official GlowLetter support.",accountIdCopy:"Copy",accountIdCopied:"Account ID copied",accountPlanChecking:"Checking access…",accountPlanFree:"Free access · 10 letters",accountPlanPermanent:"VIP · unlimited full access",accountPlanStore:"VIP · subscription active",accountPlanVip:"{remaining} left · until {date}",accountBadgeChecking:"…",accountBadgeFree:"FREE",accountBadgeVip:"VIP",accountBadgeAdmin:"ADMINISTRATOR",profilePhotoAria:"Change profile photo",profilePhotoReady:"Profile photo saved on this device",profilePhotoFail:"This photo could not be processed",profilePhotoTooLarge:"Choose a photo up to 8 MB",
    adminEyebrow:"ACCESS MANAGEMENT",adminTitle:"Admin panel",adminDescription:"Only access status and expiry are shown. VIP grants and revocations are written to a protected audit log.",adminIdLabel:"Account ID",adminIdPlaceholder:"Paste the full GL-… ID",adminFind:"Find",adminSearching:"Finding account…",adminNotFound:"No account was found with this ID",adminCurrentPlan:"Current plan",adminDaysLabel:"VIP duration",adminDaysUnit:"days",adminGrantVip:"Grant VIP",adminRevoke:"Revoke VIP",adminGrantDone:"VIP access granted until {date}",adminRevokeDone:"VIP access revoked",adminError:"The action could not be completed. Check the ID and connection."
  });
  Object.assign(UI.fr, {
    accountSupportLabel:"ID d’assistance",accountSupportNote:"Ce n’est pas un mot de passe. Partagez-le uniquement avec l’assistance officielle GlowLetter.",accountIdCopy:"Copier",accountIdCopied:"ID du compte copié",accountPlanChecking:"Vérification de l’accès…",accountPlanFree:"Accès gratuit · 10 lettres",accountPlanPermanent:"VIP · accès complet illimité",accountPlanStore:"VIP · abonnement actif",accountPlanVip:"Encore {remaining} · jusqu’au {date}",accountBadgeChecking:"…",accountBadgeFree:"FREE",accountBadgeVip:"VIP",accountBadgeAdmin:"ADMINISTRATEUR",profilePhotoAria:"Modifier la photo de profil",profilePhotoReady:"Photo de profil enregistrée sur cet appareil",profilePhotoFail:"Cette photo n’a pas pu être traitée",profilePhotoTooLarge:"Choisissez une photo de 8 Mo maximum",
    adminEyebrow:"GESTION DES ACCÈS",adminTitle:"Espace administrateur",adminDescription:"Seuls le statut et l’échéance sont visibles. Les attributions et retraits de VIP sont consignés dans un journal protégé.",adminIdLabel:"ID du compte",adminIdPlaceholder:"Collez l’ID GL-… complet",adminFind:"Rechercher",adminSearching:"Recherche du compte…",adminNotFound:"Aucun compte ne correspond à cet ID",adminCurrentPlan:"Offre actuelle",adminDaysLabel:"Durée VIP",adminDaysUnit:"jours",adminGrantVip:"Accorder le VIP",adminRevoke:"Retirer le VIP",adminGrantDone:"Accès VIP accordé jusqu’au {date}",adminRevokeDone:"Accès VIP retiré",adminError:"Action impossible. Vérifiez l’ID et la connexion."
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

  const SELECT_OPTIONS = {
    relationship: {
      ru:[["auto","Определить автоматически"],["mother","Маме"],["father","Папе"],["spouse","Супругу или супруге"],["child","Сыну или дочери"],["sibling","Брату или сестре"],["grandparent","Бабушке или дедушке"],["friend","Другу или подруге"],["teacher","Учителю или наставнику"],["universal","Другому человеку"]],
      en:[["auto","Detect automatically"],["mother","Mother"],["father","Father"],["spouse","Spouse"],["child","Son or daughter"],["sibling","Brother or sister"],["grandparent","Grandparent"],["friend","Friend"],["teacher","Teacher or mentor"],["universal","Someone else"]],
      fr:[["auto","Détecter automatiquement"],["mother","Mère"],["father","Père"],["spouse","Époux ou épouse"],["child","Fils ou fille"],["sibling","Frère ou sœur"],["grandparent","Grand-parent"],["friend","Ami ou amie"],["teacher","Professeur ou mentor"],["universal","Une autre personne"]]
    },
    tone: {
      ru:[["auto","Подобрать автоматически"],["loving","Любовное · скромно"],["romantic","Романтическое · только супругам"],["classic","Классическое"],["support","Поддержка"],["gratitude","Благодарность"]],
      en:[["auto","Choose automatically"],["loving","Loving · modest"],["romantic","Romantic · spouses only"],["classic","Classic"],["support","Support"],["gratitude","Gratitude"]],
      fr:[["auto","Choisir automatiquement"],["loving","Affectueux · avec pudeur"],["romantic","Romantique · époux uniquement"],["classic","Classique"],["support","Soutien"],["gratitude","Gratitude"]]
    },
    replyRelationship: {
      ru:[["auto","Не указывать"],["spouse","Супруг или супруга"],["family","Член семьи"],["friend","Друг или подруга"],["colleague","Коллега"],["universal","Другой человек"]],
      en:[["auto","Do not specify"],["spouse","Spouse"],["family","Family member"],["friend","Friend"],["colleague","Colleague"],["universal","Someone else"]],
      fr:[["auto","Ne pas préciser"],["spouse","Époux ou épouse"],["family","Membre de la famille"],["friend","Ami ou amie"],["colleague","Collègue"],["universal","Une autre personne"]]
    },
    replyTone: {
      ru:[["auto","Подобрать автоматически"],["calm","Спокойно"],["warm","Тепло"],["support","Поддержать"],["reconcile","Помириться"],["boundary","Обозначить границы"]],
      en:[["auto","Choose automatically"],["calm","Calmly"],["warm","Warmly"],["support","Supportively"],["reconcile","Reconcile"],["boundary","Set a boundary"]],
      fr:[["auto","Choisir automatiquement"],["calm","Avec calme"],["warm","Chaleureusement"],["support","Avec soutien"],["reconcile","Se réconcilier"],["boundary","Poser une limite"]]
    },
    replyLength: {
      ru:[["auto","Подобрать автоматически"],["short","Коротко"],["standard","Обычно"],["detailed","Подробно"]],
      en:[["auto","Choose automatically"],["short","Short"],["standard","Standard"],["detailed","Detailed"]],
      fr:[["auto","Choisir automatiquement"],["short","Courte"],["standard","Normale"],["detailed","Détaillée"]]
    },
    supportCategory: {
      ru:[["technical",UI.ru.supportCategoryTechnical],["account",UI.ru.supportCategoryAccount],["subscription",UI.ru.supportCategorySubscription],["content",UI.ru.supportCategoryContent],["feedback",UI.ru.supportCategoryFeedback],["other",UI.ru.supportCategoryOther]],
      en:[["technical",UI.en.supportCategoryTechnical],["account",UI.en.supportCategoryAccount],["subscription",UI.en.supportCategorySubscription],["content",UI.en.supportCategoryContent],["feedback",UI.en.supportCategoryFeedback],["other",UI.en.supportCategoryOther]],
      fr:[["technical",UI.fr.supportCategoryTechnical],["account",UI.fr.supportCategoryAccount],["subscription",UI.fr.supportCategorySubscription],["content",UI.fr.supportCategoryContent],["feedback",UI.fr.supportCategoryFeedback],["other",UI.fr.supportCategoryOther]]
    }
  };

  const REPLY_INTENT_LABELS = {
    ru:{religious_gratitude:"Благодарность Аллаху",islamic_greeting:"Исламское приветствие",gratitude:"Благодарность",celebration:"Добрая новость",appreciation:"Тёплые слова",support:"Нужна поддержка",apology:"Извинение",conflict:"Напряжённый разговор",time_question:"Вопрос о времени",wellbeing:"Забота о самочувствии",question:"Вопрос",greeting:"Приветствие",care:"Забота",neutral:"Нейтральное сообщение"},
    en:{religious_gratitude:"Gratitude to Allah",islamic_greeting:"Islamic greeting",gratitude:"Gratitude",celebration:"Good news",appreciation:"Warm appreciation",support:"Support needed",apology:"Apology",conflict:"Tense conversation",time_question:"Time question",wellbeing:"Checking in",question:"Question",greeting:"Greeting",care:"Care",neutral:"Neutral message"},
    fr:{religious_gratitude:"Gratitude envers Allah",islamic_greeting:"Salutation islamique",gratitude:"Gratitude",celebration:"Bonne nouvelle",appreciation:"Paroles chaleureuses",support:"Besoin de soutien",apology:"Excuse",conflict:"Échange tendu",time_question:"Question d’horaire",wellbeing:"Prendre des nouvelles",question:"Question",greeting:"Salutation",care:"Attention",neutral:"Message neutre"}
  };

  const REPLY_AUDIT_LABELS = {
    ru:{empty:"ответ пуст",forbidden:"есть запрещённая формулировка",religious_authority:"есть непроверенное религиозное утверждение",coercion:"ответ звучит как давление",improper_romance:"романтическая формулировка не подходит выбранному отношению",intent_mismatch:"ответ не совпадает со смыслом сообщения",goal_missing:"потеряна важная деталь из вашей мысли",tone_mismatch:"ответ не соответствует выбранному тону"},
    en:{empty:"the reply is empty",forbidden:"prohibited wording was found",religious_authority:"an unverified religious claim was found",coercion:"the reply sounds coercive",improper_romance:"romantic wording does not fit the selected relationship",intent_mismatch:"the reply does not match the message meaning",goal_missing:"an important detail from your point is missing",tone_mismatch:"the reply does not match the selected tone"},
    fr:{empty:"la réponse est vide",forbidden:"une formulation interdite a été détectée",religious_authority:"une affirmation religieuse non vérifiée a été détectée",coercion:"la réponse exerce une pression",improper_romance:"la formulation romantique ne convient pas à la relation choisie",intent_mismatch:"la réponse ne correspond pas au sens du message",goal_missing:"un détail important de votre intention a disparu",tone_mismatch:"la réponse ne correspond pas au ton choisi"}
  };

  const tracks = [
    { name: "Мураджан · slowed", source: "audio/track-1.mp3", fallback: "audio/track-1.b64" },
    { name: "Азан · nasheed", source: "audio/track-2.mp3", fallback: "audio/track-2.b64" },
    { name: "Лучшие нашиды", source: "audio/track-3.mp3", fallback: "audio/track-3.b64" }
  ];

  const forbiddenStems = [
    "секс", "эрот", "порн", "поцелу", "интим", "обнаж", "генитал", "оргазм", "возбужд", "мастурб", "проститу",
    "sex", "erotic", "porn", "kiss", "intimacy", "nude", "naked", "genital", "orgasm", "arous", "masturb", "prostitut",
    "sexe", "eroti", "porn", "baiser", "embrasser", "intimite", "nudite", "genital", "orgasme", "excite", "masturb", "prostitu",
    "алкогол", "водк", "коньяк", "наркот", "кокаин", "героин", "казино", "букмек", "шантаж", "угрож", "убить", "избить",
    "alcohol", "vodka", "drug", "cocaine", "heroin", "casino", "gambling", "blackmail", "threat", "kill",
    "alcool", "vodka", "drogue", "cocaine", "heroine", "casino", "parier", "chantage", "menace", "tuer",
    "бляд", "блят", "хуй", "хуе", "хуя", "хуи", "пизд", "ебан", "fuck", "shit", "bitch", "cunt", "putain", "merde", "connard", "salope"
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

  const relationshipContext = {
    ru: {
      mother:"Для меня особенно важны твоя материнская забота и терпение.",father:"Для меня особенно важны твоя надёжность и отцовская поддержка.",spouse:"Мне важно беречь уважение, доверие и спокойствие в нашей семье.",child:"Твоё спокойствие и уверенность в поддержке семьи имеют для меня большое значение.",sibling:"Наша семейная связь для меня важнее расстояний и случайных разногласий.",grandparent:"Я бережно отношусь к твоей мудрости, заботе и семейным воспоминаниям.",teacher:"Я ценю знания, терпение и уважение, которые ты передаёшь другим.",friend:"Я ценю нашу дружбу, честность и возможность спокойно говорить друг с другом."
    },
    en: {
      mother:"Your care as a mother and your patience mean a great deal to me.",father:"Your reliability and support as a father mean a great deal to me.",spouse:"I want to protect the respect, trust, and peace within our family.",child:"Your peace of mind and confidence in your family's support matter greatly to me.",sibling:"Our family bond matters more to me than distance or passing disagreements.",grandparent:"I deeply value your wisdom, care, and the family memories you preserve.",teacher:"I value the knowledge, patience, and respect you share with others.",friend:"I value our friendship, honesty, and the freedom to speak calmly with each other."
    },
    fr: {
      mother:"Ton attention maternelle et ta patience comptent énormément pour moi.",father:"Ta fiabilité et ton soutien paternel comptent énormément pour moi.",spouse:"Je veux préserver le respect, la confiance et la sérénité au sein de notre foyer.",child:"Ta sérénité et la certitude de pouvoir compter sur la famille sont essentielles pour moi.",sibling:"Notre lien familial compte davantage que la distance ou les désaccords passagers.",grandparent:"J’accorde une grande valeur à ta sagesse, ton attention et nos souvenirs de famille.",teacher:"J’apprécie le savoir, la patience et le respect que tu transmets aux autres.",friend:"J’apprécie notre amitié, notre honnêteté et la possibilité de parler sereinement."
    }
  };

  const replyComposer = {
    ru:{
      calm:["Спасибо за сообщение. Мне важно понять тебя правильно, поэтому не хочется отвечать поспешно или спорить с твоими чувствами. Давай спокойно обсудим всё и уточним, что каждый из нас имеет в виду. Я могу выслушать и постараться найти уважительное решение.","Спасибо за прямые слова. Я хочу ответить спокойно и без лишних предположений. Мне нужно немного времени, чтобы всё обдумать, после чего мы сможем поговорить внимательнее. Для меня важно сохранить уважение и услышать твою точку зрения."],
      warm:["Спасибо за сообщение и открытость. Для меня важно наше общение, поэтому я хочу ответить внимательно и искренне. Я ценю твоё доверие и могу спокойно продолжить разговор, чтобы мы лучше поняли друг друга.","Мне важно, что об этом получилось сказать прямо. Я отношусь к твоим словам с вниманием и не хочу оставлять их без ответа. Спасибо за доверие. Давай продолжим разговор спокойно и честно — для меня это действительно важно."],
      support:["Мне жаль, что тебе сейчас непросто. Не обязательно сразу находить все ответы или справляться без поддержки. Если захочется поговорить, я могу выслушать без лишних советов и давления. Береги себя и двигайся небольшими шагами — сейчас этого достаточно.","Я слышу, что этот момент требует много сил. Пожалуйста, не требуй от себя невозможного. Можно сделать паузу, отдохнуть и обратиться за поддержкой. Я рядом для спокойного разговора и постараюсь помочь так, как будет действительно удобно."],
      reconcile:["Мне не хочется, чтобы недопонимание становилось важнее нашего уважения друг к другу. Возможно, мои слова прозвучали неудачно; я могу спокойно выслушать твою сторону. Давай поговорим без упрёков и постараемся найти решение, с которым обоим будет спокойнее.","Для меня важнее восстановить спокойный диалог, чем доказывать свою правоту. Если мои слова задели тебя, мне жаль. Я могу объяснить свою мысль бережнее и услышать твою сторону. Давай дадим разговору ещё один честный и уважительный шанс."],
      boundary:["Я хочу ответить спокойно и честно. Мне важно, чтобы наш разговор оставался уважительным и без давления. Сейчас продолжать его в таком тоне для меня невозможно, поэтому лучше сделать паузу и вернуться к теме, когда получится говорить спокойнее.","Я понимаю, что тема важна, но мне также важно сохранить свои границы. Пожалуйста, давай обсуждать это без давления и резких слов. Если сейчас это трудно, лучше ненадолго остановиться и продолжить разговор тогда, когда получится услышать друг друга."]
    },
    en:{
      calm:["I read your message carefully. I want to understand you correctly, so I do not want to answer in a rush or argue with how you feel. Let us discuss this calmly and clarify what each of us means. I am ready to listen and look for a respectful way forward.","Thank you for saying this directly. I want to respond calmly and without making assumptions. I need a little time to think it through, and then we can speak more carefully. It matters to me that we keep the conversation respectful and that I understand your point of view."],
      warm:["Thank you for writing and sharing your thoughts with me. Our communication matters, so I want to answer with care and sincerity. I value your openness and I am ready to continue the conversation calmly so that we can understand each other better.","I appreciate that you chose to tell me this. I am taking your words seriously and do not want to leave them unanswered. Thank you for trusting me. Let us continue the conversation calmly and honestly, because that truly matters to me."],
      support:["I am sorry that things feel difficult right now. You do not have to find every answer immediately or carry everything alone. If you want, I am ready to listen without pressure or unnecessary advice. Please take care of yourself and move in small steps; that is enough for now.","I can hear that this moment is taking a lot of strength. Please do not demand the impossible from yourself. It is all right to pause, rest, and ask for support. I am here for a calm conversation and will try to help in a way that genuinely feels useful to you."],
      reconcile:["I do not want a misunderstanding to become more important than the respect between us. I accept that I may not have expressed myself well, and I am ready to listen calmly. Let us talk without blame and try to find a solution that gives both of us more peace.","Restoring a calm conversation matters more to me than proving that I am right. If my words hurt you, I am sorry. I am ready to explain myself more carefully and hear your side. Let us give this conversation another honest and respectful chance."],
      boundary:["I want to answer calmly and honestly. It is important to me that our conversation remains respectful and free from pressure. I am not ready to continue in this tone, so I suggest we pause and return to the subject when we can both speak more calmly.","I understand that this subject matters, but I also need to protect my boundaries. Please let us discuss it without pressure or harsh words. If that is difficult right now, it would be better to pause and continue when we can listen to each other more carefully."]
    },
    fr:{
      calm:["Merci pour ton message. Je veux comprendre correctement ce que tu ressens, sans répondre dans la précipitation ni le contester. Parlons-en calmement et précisons ce que chacun veut dire. Je peux écouter et chercher une solution respectueuse.","Merci d’avoir parlé directement. Je veux répondre avec calme et sans faire de suppositions. J’ai besoin d’un peu de temps pour réfléchir, puis nous pourrons en discuter avec davantage d’attention. Il est important pour moi de préserver le respect et de comprendre ton point de vue."],
      warm:["Merci pour ton message et pour tes pensées partagées. Notre échange compte pour moi, c’est pourquoi je veux répondre avec attention et sincérité. J’apprécie ton ouverture et je peux poursuivre la conversation calmement afin que nous puissions mieux nous comprendre.","J’apprécie sincèrement que ces mots aient été partagés. Je les prends au sérieux et je ne veux pas les laisser sans réponse. Merci pour ta confiance. Continuons à parler avec calme et honnêteté, car cela compte vraiment pour moi."],
      support:["Je comprends que cette période soit difficile. Il n’est pas nécessaire de trouver toutes les réponses immédiatement ni de tout porter sans aide. Si tu le souhaites, je peux écouter sans pression ni conseils inutiles. Prends soin de toi et avance par petits pas ; pour le moment, c’est déjà suffisant.","J’entends que ce moment demande beaucoup de force. Ne t’impose pas l’impossible. Tu peux faire une pause, te reposer et demander du soutien. Je suis disponible pour une conversation sereine et j’essaierai d’aider d’une manière réellement utile."],
      reconcile:["Je ne veux pas qu’un malentendu devienne plus important que le respect entre nous. Mes paroles ont peut-être manqué de clarté, et je peux écouter calmement ton point de vue. Parlons sans reproches et cherchons une solution qui nous apporte davantage de sérénité.","Retrouver un dialogue calme compte davantage que prouver qui a raison. Si mes paroles t’ont blessé, je le regrette. Je peux les expliquer avec plus de soin et entendre ton point de vue. Donnons une nouvelle chance sincère et respectueuse à cette conversation."],
      boundary:["Je veux répondre avec calme et honnêteté. Il est important que notre échange reste respectueux et sans pression. Je ne souhaite pas continuer sur ce ton ; il vaut mieux faire une pause et reprendre lorsque nous pourrons parler plus sereinement.","Je comprends que ce sujet soit important, mais je dois aussi préserver mes limites. Parlons-en sans pression ni paroles dures. Si cela est difficile maintenant, il vaut mieux faire une pause et reprendre lorsque nous pourrons nous écouter avec davantage d’attention."]
    }
  };

  const replyRelationshipContext = {
    ru:{spouse:"Мне важно сохранить спокойствие и взаимное уважение в нашей семье.",family:"Для меня важно сохранить добрый и уважительный семейный разговор.",friend:"Я ценю нашу дружбу и хочу говорить честно и спокойно.",colleague:"Хочу сохранить деловой, ясный и уважительный тон.",universal:"Мне важно ответить честно и уважительно."},
    en:{spouse:"It matters to me that we protect peace and mutual respect in our family.",family:"It matters to me that our family conversation stays kind and respectful.",friend:"I value our friendship and want to speak honestly and calmly.",colleague:"I want to keep the conversation clear, professional, and respectful.",universal:"I want to answer honestly and respectfully."},
    fr:{spouse:"Il est important pour moi de préserver la sérénité et le respect dans notre foyer.",family:"Il est important pour moi de préserver un dialogue familial bienveillant et respectueux.",friend:"Notre amitié compte pour moi et je souhaite parler avec sincérité et calme.",colleague:"Je souhaite garder un ton clair, professionnel et respectueux.",universal:"Je souhaite répondre avec sincérité et respect."}
  };

  const replyGoalFrames = {
    ru:{calm:["Я внимательно отношусь к этому сообщению и хочу ответить спокойно.","Если нужно, можно без спешки уточнить детали."],warm:["Спасибо за сообщение и открытость.","Мне важно продолжить этот разговор с вниманием и уважением."],support:["Я отношусь к этим словам внимательно и без давления.","Можно продолжить разговор спокойно, в удобном темпе."],reconcile:["Для меня важнее восстановить спокойный диалог, чем спорить.","Давай постараемся услышать друг друга без упрёков."],boundary:["Я хочу ответить честно и без резких слов.","Прошу отнестись к этому решению с уважением."]},
    en:{calm:["I read the message carefully and want to answer calmly.","We can clarify any details without rushing."],warm:["Thank you for the message and for being open with me.","I want to continue this conversation with care and respect."],support:["I am taking these words seriously and without pressure.","We can continue the conversation calmly, at a comfortable pace."],reconcile:["Restoring a calm conversation matters more to me than arguing.","Let us try to hear each other without blame."],boundary:["I want to answer honestly and without harsh words.","Please respect this decision."]},
    fr:{calm:["J’ai lu le message avec attention et je souhaite répondre calmement.","Nous pouvons préciser les détails sans nous presser."],warm:["Merci pour ce message et pour cette franchise.","Je souhaite poursuivre cet échange avec attention et respect."],support:["Je prends ces paroles au sérieux, sans mettre de pression.","Nous pouvons continuer à parler sereinement, au rythme qui convient."],reconcile:["Retrouver un dialogue calme compte davantage que prolonger un désaccord.","Essayons de nous écouter sans reproches."],boundary:["Je souhaite répondre avec sincérité et sans paroles dures.","Merci de respecter cette décision."]}
  };
  const replyDetailedClosings = {
    ru:"Если понадобится, я готов спокойно уточнить детали и выслушать твою точку зрения, сохраняя уважение в разговоре.",
    en:"If needed, I am ready to clarify the details calmly and listen to your point of view while keeping the conversation respectful.",
    fr:"Si nécessaire, je peux préciser les détails calmement et écouter ton point de vue tout en préservant le respect dans notre échange."
  };

  const questionReply = {
    ru:{general:"Спасибо за прямой вопрос. Мне важно ответить честно, поэтому не хочется говорить наугад или придумывать решение. Давай сначала уточним детали, от которых зависит ответ, и спокойно их обсудим.",time:"Спасибо за вопрос о времени. Сейчас точное время назвать не получится, и мне не хочется отвечать наугад. Если время важно для твоих планов, давай сначала уточним обстоятельства, от которых оно зависит."},
    en:{general:"Thank you for asking directly. I want to answer honestly, so I do not want to guess or invent a decision. Let us first clarify the details that affect the answer and discuss them calmly.",time:"Thank you for asking about the time. I cannot give an exact time right now, and I do not want to guess. If the timing matters for your plans, let us first clarify the circumstances that affect it."},
    fr:{general:"Merci d’avoir posé la question directement. Je souhaite répondre avec sincérité, sans deviner ni inventer une décision. Commençons par préciser calmement les éléments dont dépend la réponse.",time:"Merci pour la question concernant l’heure. Je ne peux pas donner une heure précise maintenant et je ne veux pas répondre au hasard. Si cela compte pour tes projets, commençons par préciser les circonstances dont l’horaire dépend."}
  };

  const LETTER_RELATIONSHIPS = new Set(["auto","mother","father","spouse","child","sibling","grandparent","teacher","friend","universal"]);
  const LETTER_TONES = new Set(["auto","loving","romantic","classic","support","gratitude"]);
  const REPLY_RELATIONSHIPS = new Set(["auto","spouse","family","friend","colleague","universal"]);
  const REPLY_TONES = new Set(["auto","calm","warm","support","reconcile","boundary"]);
  const REPLY_LENGTHS = new Set(["auto","short","standard","detailed"]);
  const REPLY_LENGTH_LIMITS = Object.freeze({
    short: Object.freeze({ minWords: 4, maxWords: 22, maxCharacters: 190, maxSentences: 3 }),
    standard: Object.freeze({ minWords: 12, maxWords: 50, maxCharacters: 440, maxSentences: 4 }),
    detailed: Object.freeze({ minWords: 24, maxWords: 65, maxCharacters: 560, maxSentences: 5 })
  });

  let lang = ["ru", "en", "fr"].includes(params.get("lang")) ? params.get("lang") : (localStorage.getItem("nurLanguage") || "ru");
  if (!UI[lang]) lang = "ru";
  const storedNamesAtLaunch = {
    sender: cleanName(localStorage.getItem("nurFrom")),
    recipient: cleanName(localStorage.getItem("nurTo"))
  };
  let fromName = cleanName(params.has("from") ? params.get("from") : storedNamesAtLaunch.sender);
  let toName = cleanName(params.has("to") ? params.get("to") : storedNamesAtLaunch.recipient);
  const initialNamesReady = Boolean(fromName && toName);
  let sharedMessage = initialNamesReady ? decodeSharedMessage(params.get("msg")) : "";
  let letterDeck = sharedMessage ? [{ id: "shared", category: "warm", shared: true, ru: sharedMessage, en: sharedMessage, fr: sharedMessage }, ...LETTERS] : [...LETTERS];
  let currentIndex = sharedMessage ? 0 : Math.max(0, Math.min(Number(params.get("quote") || (initialNamesReady ? localStorage.getItem("nurLetterIndex") : 1) || 1) - 1, Math.max(0, letterDeck.length - 1)));
  let storyOpened = false;
  let selectedCategory = "all";
  let selectedTrack = Math.max(0, Math.min(Number(localStorage.getItem("nurTrack") || 0), 3));
  let currentAudioUrl = "";
  let customAudioBlob = null;
  let backgroundUrl = "";
  let mobileBackgroundUrl = "";
  let customBackgroundBlob = null;
  let isMusicPlaying = false;
  let isNaturePlaying = false;
  let isPremium = false;
  let nativePremium = false;
  let cloudPremium = false;
  let betaAccess = false;
  let acceptedBetaCapability = "";
  let entitlementState = window.NurBilling?.getEntitlement ? "checking" : "free";
  let purchaseConfigured = null;
  let premiumPrice = CONFIG.defaultPrice || "21,99 €/месяц";
  let premiumPriceFromStore = false;
  let generatedMessage = "";
  let generatedReply = "";
  let composerVariant = 0;
  let replyVariant = 0;
  let lastReplyContext = { incoming: "", relationship: "auto", tone: "auto", length: "auto", goal: "", intent: "neutral" };
  let replyInsightTimer = 0;
  let aiMode = "letter";
  let pendingPremiumFeature = "";
  let toastTimer = 0;
  let deferredInstallPrompt = null;
  let weatherEnabled = localStorage.getItem("nurWeather") === "on";
  let weatherSnapshot = null;
  try {
    const storedWeather = JSON.parse(localStorage.getItem(WEATHER_STORAGE_KEY) || "null");
    if (storedWeather && Number.isFinite(Number(storedWeather.temperature)) && Number.isFinite(Number(storedWeather.code))) weatherSnapshot = storedWeather;
  } catch { localStorage.removeItem(WEATHER_STORAGE_KEY); }
  let uiTheme = UI_THEMES.has(localStorage.getItem("nurUiTheme")) ? localStorage.getItem("nurUiTheme") : "moon";
  let replyRequestVersion = 0;
  let replyRevealTimer = 0;
  let currentQrUrl = "";
  let gesturePreferencesRestored = false;
  let favorites;
  try { favorites = new Set(JSON.parse(localStorage.getItem("nurFavorites") || "[]")); }
  catch { favorites = new Set(); localStorage.removeItem("nurFavorites"); }
  const namesCameFromUrl = params.has("from") || params.has("to");
  const initialLinkNames = namesCameFromUrl
    ? { sender: cleanName(params.get("from")), recipient: cleanName(params.get("to")) }
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
  let cloudProviders = { google: false, facebook: false };
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
  let accountAvatarUrl = "";
  let accountAvatarUserId = "";
  let fallbackShareUrl = "";
  let supportSubmitting = false;
  const AUTO_FULLSCREEN_KEY = "nurAutoFullscreenV17";
  let cloudNames = linkNamesActive ? { sender: "", recipient: "" } : { sender: fromName, recipient: toName };
  let cloudBuiltInTrack = selectedTrack >= 0 && selectedTrack <= 2 ? selectedTrack : Math.max(0, Math.min(Number(localStorage.getItem("nurLastBuiltInTrack") || 0), 2));
  const handledAuthCodes = new Set();

  const audio = $("#nasheed");
  const homeScreen = $("#homeScreen");
  const letterStage = $("#letterStage");
  const layers = {
    setup: $("#setupLayer"), ai: $("#aiLayer"), library: $("#libraryLayer"), settings: $("#settingsLayer"), qr: $("#qrLayer"), share: $("#shareAppLayer"), support: $("#supportLayer"), paywall: $("#paywallLayer")
  };
  const panelTriggers = new WeakMap();

  function t(key) { return UI[lang][key] || UI.ru[key] || key; }

  function localizedFallbackPrice() {
    return { ru: "21,99 €/месяц", en: "€21.99/month", fr: "21,99 €/mois" }[lang] || "€21.99/month";
  }

  function localizedMonthlyPrice(value) {
    const raw = String(value || "").trim();
    if (!raw) return localizedFallbackPrice();
    const amount = raw.replace(/\s*\/\s*(?:month|месяц|mois)\s*$/iu, "").trim();
    const period = { ru: "/месяц", en: "/month", fr: "/mois" }[lang] || "/month";
    return `${amount}${period}`;
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
      return token.startsWith(stem);
    };
    if (tokens.some(token => tokenForms(token).some(form => forbiddenStems.some(stem => matches(form, stem)) || /^(sex|sexe|sexual|sexting|porn|porno|erotic|kiss|kisses|kissed|kissing)$/u.test(form)))) return true;
    const separatedRoots = ["sex", "sexe", "секс", "porn", "porno", "порн", "erotic", "эрот", "kiss", "поцелу", "intim", "интим"];
    const rootForms = [...new Set(separatedRoots.flatMap(tokenForms))];
    for (let start = 0; start < tokens.length; start += 1) {
      const joined = ["", "", ""];
      for (let end = start; end < Math.min(tokens.length, start + 5); end += 1) {
        const forms = tokenForms(tokens[end]);
        joined.forEach((_, index) => { joined[index] += forms[index]; });
        if (end > start && joined.some(candidate => rootForms.some(root => candidate.startsWith(root)))) return true;
        if (joined.some(candidate => candidate.length > 32)) break;
      }
    }
    return false;
  }

  function containsImproperRomance(value, relationship = "auto") {
    const text = normalize(value).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const strong = ["влюблен в тебя", "влюблена в тебя", "любовь моей жизни", "ты моя любимая", "ты мой любимый", "ты моя единственная", "ты мой единственный", "ты моя судьба", "in love with you", "deeply in love", "love of my life", "my beloved", "my darling", "darling", "soulmate", "my heart belongs to you", "my one and only", "amour de ma vie", "amoureux de toi", "amoureuse de toi", "mon amour", "ma cherie", "mon cheri", "ame soeur", "mon ame soeur", "mon coeur t appartient"];
    if (strong.some(phrase => text.includes(phrase))) return relationship !== "spouse";
    const familial = ["spouse", "family", "mother", "father", "child", "sibling", "grandparent"].includes(relationship);
    return !familial && ["я люблю тебя", "обожаю тебя", "i love you", "je t aime"].some(phrase => text.includes(phrase));
  }

  const replyGoalGroups = [
    { request: ["обсуд", "поговор", "discuss", "talk", "discut", "parl"], response: ["обсуд", "поговор", "диалог", "discuss", "talk", "conversation", "discut", "parl", "dialog"] },
    { request: ["вечер", "tonight", "evening", "soir"], response: ["вечер", "tonight", "evening", "soir"] },
    { request: ["приду", "приед", "верн", "домой", "arriv", "return", "home", "rentr", "maison"], response: ["прид", "приед", "верн", "буду дома", "arriv", "return", "home", "rentr", "maison"] },
    { request: ["соглас", "принима", "принять", "agree", "accept", "d accord", "accepte"], response: ["соглас", "приним", "agree", "accept", "d accord", "accepte"] },
    { request: ["отказ", "не могу", "не соглас", "declin", "cannot", "can t", "refus", "ne peux"], response: ["отказ", "не могу", "не получится", "не соглас", "declin", "cannot", "can t", "refus", "ne peux"] },
    { request: ["извин", "прости", "sorry", "apolog", "pardon", "desol"], response: ["извин", "прости", "sorry", "apolog", "pardon", "desol"] },
    { request: ["спасиб", "благодар", "thank", "grateful", "merci", "remerci"], response: ["спасиб", "благодар", "thank", "appreci", "grateful", "merci", "remerci"] }
  ];
  const replyGoalStopWords = new Set("я ты вы мы он она они мне мой моя мое хочу хотел хотела сказать что это этот этой только просто очень для из на по при без но или можно нужно надо i you we they he she me my our want would like say tell that this these those just very for from with without about and but or can need should je tu vous nous il elle ils elles me mon ma mes notre veux voudrais dire que ce cette ces pour avec sans sur et mais ou peux faut".split(" "));
  const toneSignals = {
    calm: ["спокой", "внимател", "уваж", "calm", "careful", "respect", "calme", "attention"],
    warm: ["спасиб", "цен", "важн", "тепл", "thank", "appreci", "care", "important", "merci", "compte", "attention"],
    support: ["поддерж", "выслуш", "рядом", "помоч", "без давления", "спокой", "support", "listen", "help", "without pressure", "calm", "soutien", "ecout", "aider", "sans pression", "serein"],
    reconcile: ["извин", "поним", "спокой", "услыш", "диалог", "sorry", "understand", "calm", "hear each other", "dialog", "pardon", "compren", "calme", "ecout"],
    boundary: ["границ", "прошу", "не могу", "не готов", "пауз", "уваж", "boundary", "cannot", "not ready", "pause", "respect", "limite", "ne peux", "pression"]
  };

  function sharesReplyStem(left, right) {
    const length = Math.min(left.length, right.length, 5);
    return length >= 4 && left.slice(0, length) === right.slice(0, length);
  }

  function replyFactsPreserved(text, goal = "") {
    if (!String(goal || "").trim()) return true;
    const normalizedGoal = normalize(goal).replace(/\s*:\s*/g, ":");
    const normalizedText = normalize(text).replace(/\s*:\s*/g, ":");
    const goalNumbers = normalizedGoal.match(/\d+(?::\d+)?/g) || [];
    const textNumbers = new Set(normalizedText.match(/\d+(?::\d+)?/g) || []);
    if (goalNumbers.some(anchor => !textNumbers.has(anchor))) return false;
    const matchedGroups = replyGoalGroups.filter(group => group.request.some(signal => normalizedGoal.includes(signal)));
    if (matchedGroups.some(group => !group.response.some(signal => normalizedText.includes(signal)))) return false;
    const signalTokens = matchedGroups.flatMap(group => group.request).flatMap(signal => normalize(signal).split(/[^\p{L}\p{N}]+/u)).filter(token => token.length >= 4);
    const topicTokens = normalizedGoal.split(/[^\p{L}\p{N}]+/u).filter(token => token.length >= 4 && !/^\d+$/u.test(token) && !replyGoalStopWords.has(token) && !signalTokens.some(signal => sharesReplyStem(token, signal)));
    if (!topicTokens.length) return true;
    const outputTokens = normalizedText.split(/[^\p{L}\p{N}]+/u).filter(token => token.length >= 4);
    return topicTokens.some(topic => outputTokens.some(output => sharesReplyStem(topic, output)));
  }

  function replyTonePreserved(text, tone = "auto") {
    const signals = toneSignals[tone];
    if (!signals) return true;
    const value = normalize(text);
    return signals.some(signal => value.includes(signal));
  }

  function cleanName(value) {
    return String(value || "").normalize("NFKC").replace(/[<>\n\r{}\[\]]/g, "").replace(/\s+/g, " ").trim().slice(0, 36);
  }

  async function capabilityHash(value) {
    if (!globalThis.crypto?.subtle) return "";
    const bytes = new TextEncoder().encode(String(value || ""));
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  async function initializeBetaAccess() {
    const expectedHash = String(CONFIG.betaAccessHash || "").trim().toLowerCase();
    const capabilityFragment = new URLSearchParams(location.hash.replace(/^#/, ""));
    const fragmentToken = String(capabilityFragment.get("access") || "").trim();
    const queryToken = String(params.get(BETA_PARAMETER) || "").trim();
    const savedToken = String(localStorage.getItem(BETA_STORAGE_KEY) || "").trim();
    const candidates = [...new Set([fragmentToken, queryToken, savedToken].filter(Boolean))];
    let acceptedToken = "";

    if (/^[a-f0-9]{64}$/.test(expectedHash)) {
      for (const token of candidates) {
        if (!/^[A-Za-z0-9_-]{40,128}$/.test(token)) continue;
        try {
          if ((await capabilityHash(token)) === expectedHash) {
            acceptedToken = token;
            break;
          }
        } catch {}
      }
    }

    if (acceptedToken) {
      betaAccess = true;
      acceptedBetaCapability = acceptedToken;
      isPremium = true;
      entitlementState = "premium";
      localStorage.setItem(BETA_STORAGE_KEY, acceptedToken);
      navigator.storage?.persist?.().catch(() => {});
    } else if (savedToken) {
      acceptedBetaCapability = "";
      localStorage.removeItem(BETA_STORAGE_KEY);
    }

    if (queryToken || fragmentToken) {
      const url = new URL(location.href);
      const cleanFragment = new URLSearchParams(url.hash.replace(/^#/, ""));
      url.searchParams.delete(BETA_PARAMETER);
      cleanFragment.delete("access");
      url.hash = cleanFragment.toString();
      history.replaceState(history.state || {}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  async function handleCapabilityNavigation() {
    const alreadyEnabled = betaAccess;
    await initializeBetaAccess();
    if (!alreadyEnabled && betaAccess) updatePremium(true, premiumPrice, "beta_capability");
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

  function formatVipRemaining(milliseconds) {
    const totalMinutes = Math.max(0, Math.ceil(Number(milliseconds || 0) / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (lang === "en") return [days ? `${days} d` : "", hours ? `${hours} h` : "", `${minutes} min`].filter(Boolean).join(" ");
    if (lang === "fr") return [days ? `${days} j` : "", hours ? `${hours} h` : "", `${minutes} min`].filter(Boolean).join(" ");
    return [days ? `${days} дн.` : "", hours ? `${hours} ч.` : "", `${minutes} мин.`].filter(Boolean).join(" ");
  }

  function formatVipDate(value) {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) return "—";
    try {
      return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : lang === "en" ? "en-GB" : "ru-RU", {
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
    if (includeNative && (nativePremium || betaAccess)) return t("accountPlanStore");
    return t("accountPlanFree");
  }

  function accountPlanState(account, { includeNative = false } = {}) {
    if (!account) return "checking";
    if (account.premium_forever) return "permanent";
    const expiry = Date.parse(account.vip_until || "");
    if (Number.isFinite(expiry) && expiry > trustedCloudNow()) return "vip";
    if (includeNative && (nativePremium || betaAccess)) return "store";
    return "free";
  }

  function accountPlanBadgeText(state) {
    if (["vip", "permanent", "store"].includes(state)) return t("accountBadgeVip");
    if (state === "free") return t("accountBadgeFree");
    return t("accountBadgeChecking");
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
    cloudServerNow = 0;
    cloudServerPerformance = 0;
    cloudPremium = false;
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
    return account;
  }

  function normalizedSupportId(value) {
    const supportId = String(value || "").normalize("NFKC").trim().toUpperCase();
    return /^GL-(?:[0-9A-F]{4}-){7}[0-9A-F]{4}$/.test(supportId) ? supportId : "";
  }

  function setAdminBusy(busy) {
    ["#adminSupportId", "#adminLookupButton", "#adminVipDays", "#adminGrantVip", "#adminRevokeVip"].forEach(selector => {
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
    const supportId = normalizedSupportId($("#adminSupportId").value);
    adminAccountResult = null;
    renderAdminResult();
    if (!supportId) {
      setAdminStatus(t("adminNotFound"), "error");
      return;
    }
    setAdminBusy(true);
    setAdminStatus(t("adminSearching"));
    try {
      const { data, error } = await cloudClient.rpc("glowletter_admin_lookup", { p_support_id: supportId });
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
    setAdminBusy(true);
    setAdminStatus(t("adminSearching"));
    try {
      const { data, error } = await cloudClient.rpc("glowletter_admin_grant_vip", {
        p_support_id: adminAccountResult.support_id,
        p_days: days
      });
      if (error) throw error;
      const updated = rpcAccountRow(data);
      if (!updated) throw new Error("VIP update returned no account");
      adminAccountResult = updated;
      renderAdminResult();
      setAdminStatus(t("adminGrantDone").replace("{date}", formatVipDate(updated.vip_until)), "success");
      if (updated.support_id === cloudAccount?.support_id) await loadCloudAccount(cloudUser);
    } catch (error) {
      console.info("Admin VIP grant failed", error);
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

  async function copyAccountSupportId() {
    if (!cloudAccount?.support_id) return;
    await writeClipboard(cloudAccount.support_id);
    showToast(t("accountIdCopied"));
    haptic(10);
  }

  function renderCloudAccount() {
    const card = $("#accountCard");
    if (!card) return;
    setText("#accountTitle", t("accountTitle"));
    setText("#accountGuestNote", t("accountGuestNote"));
    setText("#accountPrivacyNote", t("accountPrivacy"));
    setText("#googleSignIn span", t("continueGoogle"));
    setText("#facebookSignIn span", t("continueFacebook"));
    setText("#accountSignOut", t("signOut"));
    setText("#accountDelete", t("deleteAccount"));
    setText(".account-support-id > span", t("accountSupportLabel"));
    setText("#accountSupportNote", t("accountSupportNote"));
    setText("#copyAccountId", `⧉ ${t("accountIdCopy")}`);
    setText(".admin-panel-heading p", t("adminEyebrow"));
    setText("#adminPanelTitle", t("adminTitle"));
    setText(".admin-panel-description", t("adminDescription"));
    setText(".admin-lookup-form > label", t("adminIdLabel"));
    $("#adminSupportId").placeholder = t("adminIdPlaceholder");
    setText("#adminLookupButton", t("adminFind"));
    setText(".admin-result-summary p:nth-child(2) > span", t("adminCurrentPlan"));
    setText("#adminVipDaysLabel", t("adminDaysLabel"));
    setText("#adminVipDaysUnit", t("adminDaysUnit"));
    setText("#adminGrantVip", t("adminGrantVip"));
    setText("#adminRevokeVip", t("adminRevoke"));
    const signedIn = Boolean(cloudUser?.id);
    const accountStatus = $("#accountStatus");
    const quietSyncedState = signedIn && cloudStatusKey === "cloudSynced";
    setText("#accountStatus", quietSyncedState ? "" : t(cloudStatusKey));
    accountStatus.hidden = quietSyncedState;
    card.dataset.state = cloudStatusKey === "cloudSyncing" || cloudAuthBusy ? "syncing" : cloudStatusKey === "cloudError" || cloudStatusKey === "cloudSignInError" ? "error" : "ready";

    $("#accountGuest").hidden = signedIn;
    $("#accountUser").hidden = !signedIn;
    const google = $("#googleSignIn");
    const facebook = $("#facebookSignIn");
    google.hidden = signedIn || !cloudProvidersKnown || !cloudProviders.google;
    facebook.hidden = signedIn || !cloudProvidersKnown || !cloudProviders.facebook;
    google.disabled = cloudAuthBusy;
    facebook.disabled = cloudAuthBusy;
    $("#accountSignOut").disabled = cloudAuthBusy;
    $("#accountDelete").disabled = cloudAuthBusy;
    const isAdmin = signedIn && cloudAccount?.is_admin === true;
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
    const adminPanel = $("#adminPanel");
    adminPanel.hidden = !isAdmin;
    if (adminPanel.hidden) {
      adminAccountResult = null;
      $("#adminResult").hidden = true;
      setAdminStatus();
    } else {
      renderAdminResult();
    }

    if (signedIn) {
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
    }
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
    const provider = cloudProviders.google ? "google" : cloudProviders.facebook ? "facebook" : "";
    const signInButton = $("#supportSignInButton");
    signInButton.dataset.provider = provider;
    signInButton.disabled = signedIn || cloudAuthBusy || !cloudProvidersKnown || !provider;
    signInButton.textContent = !cloudProvidersKnown
      ? t("cloudProvidersChecking")
      : provider === "facebook" ? t("continueFacebook") : provider === "google" ? t("continueGoogle") : t("cloudUnavailable");
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
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
        cache: "no-store"
      });
      if (!response.ok) throw new Error("provider settings unavailable");
      const settings = await response.json();
      cloudProviders = {
        google: settings?.external?.google === true,
        facebook: settings?.external?.facebook === true
      };
      cloudProvidersKnown = true;
      if (!cloudUser) setCloudStatus("cloudSignInPrompt"); else renderCloudAccount();
    } catch {
      cloudProvidersKnown = false;
      if (!cloudUser) setCloudStatus(navigator.onLine ? "cloudUnavailable" : "cloudOffline");
    }
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
      language: ["ru", "en", "fr"].includes(lang) ? lang : "ru",
      current_letter_id: currentLetterId,
      favorite_ids: favoriteIds,
      rain_enabled: Boolean(rainScene.enabled),
      weather_enabled: Boolean(weatherEnabled),
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
      language: "ru",
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
      language: ["ru", "en", "fr"].includes(value.language) ? value.language : defaults.language,
      current_letter_id: Math.round(number("current_letter_id", 1, 50, defaults.current_letter_id)),
      favorite_ids: favoriteIds,
      rain_enabled: boolean("rain_enabled"),
      weather_enabled: boolean("weather_enabled"),
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

      lang = ["ru", "en", "fr"].includes(row.language) ? row.language : "ru";
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
      weatherEnabled = row.weather_enabled === true;
      localStorage.setItem("nurWeather", weatherEnabled ? "on" : "off");

      cloudBuiltInTrack = Math.max(0, Math.min(Number(row.built_in_track) || 0, 2));
      selectedTrack = cloudBuiltInTrack;
      localStorage.setItem("nurTrack", String(selectedTrack));
      localStorage.setItem("nurLastBuiltInTrack", String(cloudBuiltInTrack));

      const remoteNature = row.nature_enabled === true;
      localStorage.setItem("nurNature", remoteNature ? "on" : "off");
      if (!remoteNature && isNaturePlaying) setNaturePlaying(false, false);
      localStorage.setItem("nurFullscreen", row.fullscreen_enabled === true ? "on" : "off");

      const volume = Math.max(0, Math.min(Number(row.volume), 1));
      audio.volume = Number.isFinite(volume) ? volume : .62;
      localStorage.setItem("nurVolume", String(audio.volume));

      $$("[data-track]").forEach(option => option.classList.toggle("is-active", Number(option.dataset.track) === selectedTrack));
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

  async function handleCloudSession(session) {
    const previousUserId = cloudUser?.id || "";
    const nextUser = session?.user || null;
    if (previousUserId && previousUserId !== nextUser?.id) saveUserProgressSnapshot(previousUserId);
    cloudSession = session || null;
    cloudUser = nextUser;
    if (previousUserId !== (cloudUser?.id || "")) {
      resetCloudAccount();
      clearAccountAvatarPreview();
      if (cloudUser?.id) loadAccountAvatar(cloudUser.id);
    }
    renderCloudAccount();
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
      setCloudStatus(cloudProvidersKnown ? "cloudSignInPrompt" : "cloudProvidersChecking");
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
      const { data, error } = await cloudClient.auth.signInWithOAuth({
        provider,
        options: { redirectTo: cloudRedirectUrl(), skipBrowserRedirect: true }
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
      localStorage.removeItem(`${CLOUD_USER_SNAPSHOT_PREFIX}${deletedUserId}`);
      localStorage.removeItem(`${CLOUD_USER_ENVELOPE_PREFIX}${deletedUserId}`);
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
  }

  window.GlowLetterCloud = Object.freeze({
    signIn: provider => signInWithCloud(provider),
    signOut: () => signOutCloud(),
    deleteAccount: () => deleteCloudAccount(),
    syncNow: () => flushCloudSync(true),
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
    return lang === "en" ? "someone special" : lang === "fr" ? "une personne importante" : "важного человека";
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
    return String(entry?.[lang] || entry?.ru || "").replaceAll("{to}", recipient);
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
    if (lang === "ru") url.searchParams.delete("lang"); else url.searchParams.set("lang", lang);
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
    if ($("#aiSenderName")) $("#aiSenderName").value = fromName;
    if ($("#aiRecipientName")) $("#aiRecipientName").value = toName;
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
    uiTheme = UI_THEMES.has(value) ? value : "moon";
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
      if (icon) icon.textContent = "◌";
      if (text) text.textContent = t("weather");
      if (state) state.textContent = weatherEnabled ? "…" : t("stateOff");
      button?.classList.remove("has-weather");
      button?.removeAttribute("aria-busy");
      button?.setAttribute("aria-label", t("weatherAria"));
      button?.removeAttribute("title");
      $("#weatherToggle")?.classList.toggle("is-active", weatherEnabled);
      $("#weatherToggle")?.setAttribute("aria-pressed", String(weatherEnabled));
      const settingsIcon = $("#weatherToggle > i"); if (settingsIcon) settingsIcon.textContent = "◌";
      return;
    }
    const code = Number(weatherSnapshot.code) || 0;
    const mapped = weatherMap[code] || ["◐", "Weather"];
    const dayIcon = code <= 1 ? (Number(weatherSnapshot.isDay) === 0 ? "☾" : "☀") : mapped[0];
    const temperature = `${Math.round(Number(weatherSnapshot.temperature))}°`;
    if (icon) icon.textContent = dayIcon;
    if (text) text.textContent = temperature;
    if (state) state.textContent = temperature;
    button?.classList.add("has-weather");
    button?.removeAttribute("aria-busy");
    const place = String(weatherSnapshot.place || "").trim();
    button?.setAttribute("aria-label", `${t("weather")}: ${temperature}${place ? ` · ${place}` : ""}`);
    button?.setAttribute("title", `${temperature}${place ? ` · ${place}` : ""}`);
    $("#weatherToggle")?.classList.add("is-active");
    $("#weatherToggle")?.setAttribute("aria-pressed", "true");
    const settingsIcon = $("#weatherToggle > i"); if (settingsIcon) settingsIcon.textContent = dayIcon;
  }

  function setSelectOptions(selector, options) {
    const select = $(selector);
    if (!select) return;
    const previous = select.value;
    select.innerHTML = options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
  }

  function setAiMode(mode) {
    aiMode = mode === "reply" ? "reply" : "letter";
    const isReply = aiMode === "reply";
    $("#letterComposerPane").hidden = isReply;
    $("#replyComposerPane").hidden = !isReply;
    $$("[data-ai-mode]").forEach(button => {
      const active = button.dataset.aiMode === aiMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    setText("#aiTitle", isReply ? t("replyTitle") : t("aiTitle"));
    setText(".ai-panel .panel-header .panel-eyebrow", isReply ? t("replyEyebrow") : t("aiEyebrow"));
  }

  function applyLanguage(render = true) {
    premiumPrice = premiumPriceFromStore ? localizedMonthlyPrice(premiumPrice) : localizedFallbackPrice();
    document.documentElement.lang = lang;
    document.title = displayName(toName) ? `${t("title")} · ${displayName(toName)}` : t("title");
    $("#languageButton").textContent = lang.toUpperCase();
    $$('[data-lang]').forEach(button => button.classList.toggle("is-active", button.dataset.lang === lang));
    $(".brand-card h1").innerHTML = t("brand");
    const brandCopy = $(".brand-copy");
    brandCopy.innerHTML = displayName(toName)
      ? t("brandCopyPersonal").replace("{to}", `<strong id="homeTo">${escapeHtml(displayName(toName))}</strong>`)
      : escapeHtml(t("brandCopy"));
    const senderLine = $(".sender-line");
    setText(".sender-line", "");
    senderLine.hidden = !displayName(fromName);
    if (displayName(fromName)) {
      senderLine.append(`${t("from")} `);
      const senderStrong = document.createElement("strong"); senderStrong.id = "homeFrom"; senderStrong.textContent = displayName(fromName); senderLine.append(senderStrong);
    }
    setText("#openStoryButton > span:last-child", t("open"));
    $("#aiOpenHome").innerHTML = `<span>✦</span> ${escapeHtml(t("create"))} <b class="vip-badge">VIP</b>`;
    $("#replyOpenHome").innerHTML = `<span>↗</span> ${escapeHtml(t("replyAssist"))} <b class="vip-badge">VIP</b>`;
    setText("#aiOpenTop > span:last-child", t("create"));
    const freeSpans = $$(".free-note span"); if (freeSpans[0]) freeSpans[0].textContent = t("free"); if (freeSpans[1]) freeSpans[1].textContent = t("full");
    renderWeather();
    setText("#nextLetter", t("next")); $("#nextLetter").insertAdjacentHTML("beforeend", " <span>→</span>");
    $("#copyLetter").innerHTML = `<span>▣</span> ${t("copy")}`;
    setText("#speakButton", `◖ ${t("read")}`); setText("#postcardButton", `↓ ${t("postcard")}`); setText("#favoriteButton", `♡ ${t("saved")}`);
    $$(".go-home").forEach(button => button.textContent = `⌂ ${t("home")}`);
    $("#aiOpenLetter").innerHTML = `<span>✦</span> ${escapeHtml(t("personal"))} <b class="vip-badge">VIP</b>`;
    setText("#stageCaption", t("stage")); setText("#letterTitle", t("letterTitle")); setText("#letterForLabel", t("for")); setText(".signature span", t("warmSign"));
    setText("#setupLayer .panel-eyebrow", t("setupEyebrow")); setText("#setupTitle", t("setupTitle")); setText(".setup-note", t("setupNote")); setText("#setupSubmitLabel", t("setupSubmit")); setText("#setupError", t("namesSafety"));
    const setupLabels = $$("#setupForm .simple-form label > span"); if (setupLabels[0]) setupLabels[0].textContent = t("fromWho"); if (setupLabels[1]) setupLabels[1].textContent = t("forWho");
    $("#setupSenderName").placeholder = t("setupSenderPlaceholder"); $("#setupRecipientName").placeholder = t("setupRecipientPlaceholder");
    setText("#letterModeTab", `✦ ${t("letterMode")}`); setText("#replyModeTab", `↗ ${t("replyMode")}`);
    setText(".adab-banner strong", t("adabTitle")); setText(".adab-banner small", t("adabNote"));
    const letterLabels = $$("#aiForm .simple-form label > span"); if (letterLabels[0]) letterLabels[0].textContent = t("fromWho"); if (letterLabels[1]) letterLabels[1].textContent = t("forWho");
    $("#aiSenderName").placeholder = t("aiSenderPlaceholder"); $("#aiRecipientName").placeholder = t("aiRecipientPlaceholder");
    const nameRoute = $$("#aiForm .name-route span"); if (nameRoute[0]) nameRoute[0].textContent = t("routeFrom"); if (nameRoute[1]) nameRoute[1].textContent = t("routeTo");
    const letterChoices = $$("#aiForm .choice-grid label > span"); if (letterChoices[0]) letterChoices[0].textContent = t("relationshipLabel"); if (letterChoices[1]) letterChoices[1].textContent = t("toneLabel");
    setSelectOptions("#aiRelationship", SELECT_OPTIONS.relationship[lang]); setSelectOptions("#aiTone", SELECT_OPTIONS.tone[lang]);
    setText("#aiForm .form-hint", t("optionalHint")); setText(".generate-label", t("generate")); setText("#ownTextToggle b", t("own")); setText(".own-text-editor label > span", t("ownWords")); $("#ownText").placeholder = t("ownPlaceholder");
    $("#useOwnText").innerHTML = `${t("useOwn")} <span>→</span>`; setText(".generated-top > span", t("ready")); setText("#regenerateButton", t("variant")); setText("#copyGenerated", t("copy")); setText("#useGenerated", t("openAs"));
    setText(".own-text-editor > small", t("ownNote")); $(".quality-note p").innerHTML = `<strong>${escapeHtml(t("qualityTitle"))}</strong> ${escapeHtml(t("qualityBody"))}`; setText(".religious-note", t("religiousNote"));
    const replyTextLabels = $$("#replyForm .wide-label > span"); if (replyTextLabels[0]) replyTextLabels[0].textContent = t("replyIncoming");
    $("#replyIncoming").placeholder = t("replyPlaceholder");
    const replyChoices = $$("#replyForm .choice-grid label > span"); if (replyChoices[0]) replyChoices[0].textContent = t("replyRelationshipLabel"); if (replyChoices[1]) replyChoices[1].textContent = t("replyToneLabel");
    setText(".reply-length-label > span", t("replyLengthLabel"));
    setSelectOptions("#replyRelationship", SELECT_OPTIONS.replyRelationship[lang]); setSelectOptions("#replyTone", SELECT_OPTIONS.replyTone[lang]); setSelectOptions("#replyLength", SELECT_OPTIONS.replyLength[lang]);
    setText("#replyForm .form-hint", t("replyHint")); setText(".reply-generate-label", t("replyGenerate")); setText("#replyStatusText", t("replyGenerating")); setText("#replyGeneratedCard .generated-top > span", t("replyReady")); setText("#regenerateReply", t("replyVariant")); setText("#copyReply", t("copyReply")); setText("#replySafetyReason", t("replySafety"));
    updateReplyInsight(); renderReplyAudit();
    setText("#libraryTitle", t("library")); setText("#accessLabel", isPremium ? t("allCount") : t("openCount"));
    setText(".library-panel .panel-eyebrow", t("collectionEyebrow")); setText(".library-summary > span", t("collectionNote"));
    const categories = { all: t("all"), warm: t("warm"), gratitude: t("gratitude"), support: t("support"), family: t("family") }; $$("#categoryRow button").forEach(button => button.textContent = categories[button.dataset.category]);
    setText("#settingsTitle", t("settings")); setText(".settings-panel .panel-eyebrow", t("settingsEyebrow")); setText(".language-picker legend", t("langLabel")); setText("#customBackgroundButton", t("choosePhoto")); setText("#resetBackgroundButton", t("resetPhoto"));
    setText(".interface-theme-picker legend", t("themeTitle")); $(".theme-choice-grid")?.setAttribute("aria-label", t("themeAria")); const themeLabels = $$(".theme-choice-grid [data-ui-theme] span"); if(themeLabels[0])themeLabels[0].textContent=t("themeMoon");if(themeLabels[1])themeLabels[1].textContent=t("themeRose");if(themeLabels[2])themeLabels[2].textContent=t("themeForest");if(themeLabels[3])themeLabels[3].textContent=t("themeSand"); applyUiTheme(uiTheme, false);
    setText(".profile-picker legend", t("namesSettings")); const settingsNameLabels = $$(".profile-picker .simple-form label > span"); if (settingsNameLabels[0]) settingsNameLabels[0].textContent = t("fromWho"); if (settingsNameLabels[1]) settingsNameLabels[1].textContent = t("forWho"); $("#settingsSenderName").placeholder = t("setupSenderPlaceholder"); $("#settingsRecipientName").placeholder = t("setupRecipientPlaceholder"); setText("#settingsNamesError", t("namesSafety"));
    setText("#rainToggle strong", t("rainTitle")); setText("#rainToggle small", t("rainNote")); setText("#natureToggle strong", t("natureTitle")); setText("#natureToggle small", t("natureNote")); setText("#weatherToggle strong", t("weatherTitle")); setText("#weatherToggle small", t("weatherNote")); setText("#fullscreenToggle strong", t("fullscreenTitle")); setText("#fullscreenToggle small", t("fullscreenNote"));
    const naturePreferenceEnabled = isNaturePlaying || localStorage.getItem("nurNature") === "on";
    $("#natureToggle").classList.toggle("is-active", naturePreferenceEnabled); $("#weatherToggle").classList.toggle("is-active", weatherEnabled);
    setText("#rainToggle b", rainScene.enabled ? t("stateOn") : t("stateOff")); setText("#natureToggle b", naturePreferenceEnabled ? t("stateOn") : t("stateOff")); if (!$("#weatherState").textContent.includes("°")) setText("#weatherState", weatherEnabled ? t("stateOn") : t("stateOff")); updateFullscreenControl(); setText("#saveSettingsButton", t("saveSettings"));
    setText(".background-picker legend", t("personalBg")); setText(".background-preview strong", t("ownPhoto")); setText(".background-preview small", t("localOnly")); setText(".track-picker legend", t("music")); setText("#customTrackButton strong", t("customMusic")); if (!customAudioBlob) setText("#customTrackName", t("customMusicNote"));
    const trackNotes = $$(".track-option[data-track] small"); if (trackNotes[0]) trackNotes[0].textContent = t("trackPrimary"); if (trackNotes[1]) trackNotes[1].textContent = t("trackLight"); if (trackNotes[2]) trackNotes[2].textContent = t("trackWarm");
    setText(".premium-mini", t("fullVersion")); setText(".premium-settings-card h3", t("allLetters")); setText(".premium-settings-card p", t("onePurchase")); $("#settingsPurchase").innerHTML = `${escapeHtml(t("buy"))} <span class="price-label">${escapeHtml(premiumPrice)}</span>`;
    setText(".paywall-card > .panel-eyebrow", t("paywallEyebrow")); $("#paywallTitle").innerHTML = t("paywallTitle"); setText(".paywall-card > p", t("paywallBody")); const benefits=$$(".paywall-card li"); if(benefits[0])benefits[0].textContent=t("benefit1");if(benefits[1])benefits[1].textContent=t("benefit2");if(benefits[2])benefits[2].textContent=t("benefit3");if(benefits[3])benefits[3].textContent=t("benefit4"); setText("#purchaseButton > span", t("payButton")); setText(".paywall-card > small", t("storeNote"));
    setText("#privacyLink",t("privacy"));setText("#termsLink",t("terms"));setText("#deleteAccountLink",t("deletePage"));setText("#supportOpenButton",t("supportLink"));
    setText("#restoreButton", t("restore")); setText("#manageSubscriptionButton", `◌ ${t("manageSubscription")}`); setText("#paywallManageSubscription", t("manageSubscription")); setText("#shareAppButton", `↗ ${t("shareApp")}`); setText("#qrOpenButton", `▦ ${t("qrOpen")}`); setText("#installButton", `＋ ${t("install")}`); setText("#installHint", t("installIosHint")); $("#installHint").hidden = !(/iPad|iPhone|iPod/u.test(navigator.userAgent) && !navigator.standalone); $$(".price-label").forEach(label => label.textContent = premiumPrice);
    setText("#shareAppLayer .panel-eyebrow", t("shareChooserEyebrow")); setText("#shareAppTitle", t("shareChooserTitle")); setText("#shareAppLead", t("shareChooserLead")); setText("#shareTelegram span", t("shareTelegram")); setText("#shareWhatsapp span", t("shareWhatsapp")); setText("#shareEmail span", t("shareEmail")); setText("#shareCopyLink span", t("shareCopy"));
    setText("#supportEyebrow",t("supportFormEyebrow"));$("#supportTitle").innerHTML=t("supportFormTitle");setText("#supportLead",t("supportFormLead"));setText("#supportGuestTitle",t("supportGuestTitle"));setText("#supportGuestNote",t("supportGuestNote"));setText("#supportCopyContact",t("supportCopyContact"));setText("#supportEmailLabel",t("supportEmailLabel"));setText("#supportIdLabel",t("supportIdLabel"));setText("#supportCategoryLabel",t("supportCategoryLabel"));setText("#supportMessageLabel",t("supportMessageLabel"));$("#supportMessage").placeholder=t("supportMessagePlaceholder");setText("#supportPrivacyNote",t("supportPrivacyNote"));setText("#supportSubmitLabel",supportSubmitting?t("supportSending"):t("supportSubmit"));setSelectOptions("#supportCategory",SELECT_OPTIONS.supportCategory[lang]);renderSupportFormState();updateSupportMessageCount();
    $("#qrTitle").innerHTML = t("qrTitle"); setText("#qrLead", t("qrLead")); setText("#qrPreviewCaption", t("qrCaption")); setText("#qrPrivacy", t("qrPrivacy")); setText("#qrGenerateButton > span:nth-child(2)", t("qrGenerate")); setText("#qrDownloadButton", t("qrDownload")); setText("#qrCopyLinkButton", t("qrCopyLink")); setText("#qrCopyImageButton", t("qrCopyImage")); setText("#qrPrintButton", t("qrPrint")); const qrNameLabels=$$("#qrForm .simple-form label > span");if(qrNameLabels[0])qrNameLabels[0].textContent=t("fromWho");if(qrNameLabels[1])qrNameLabels[1].textContent=t("forWho");$("#qrSenderName").placeholder=t("setupSenderPlaceholder");$("#qrRecipientName").placeholder=t("setupRecipientPlaceholder");setText("#qrNamesError",t("namesSafety")); if(currentQrUrl) renderQrCode(false);
    renderCloudAccount();
    $("#homeButton").setAttribute("aria-label", t("homeAria")); $("#soundButton").setAttribute("aria-label", t(isMusicPlaying ? "soundOffAria" : "soundOnAria")); $("#natureButton").setAttribute("aria-label", t(isNaturePlaying ? "natureOffAria" : "natureOnAria")); $("#weatherButton").setAttribute("aria-label", t("weatherAria")); $("#languageButton").setAttribute("aria-label", t("languageAria")); $("#libraryButton").setAttribute("aria-label", t("libraryAria")); $("#aiOpenTop").setAttribute("aria-label", t("create")); $("#settingsButton").setAttribute("aria-label", t("settingsAria")); $("#previousLetter").setAttribute("aria-label", t("previousAria")); $("#shareButton").setAttribute("aria-label", t("shareAria"));
    renderWeather();
    $("#homeScreen").setAttribute("aria-label", t("homeScreenAria")); $(".letter-actions").setAttribute("aria-label", t("letterNavAria")); $(".ai-mode-tabs").setAttribute("aria-label", t("aiModeAria")); $("#generatedText").setAttribute("aria-label", t("generatedLetterAria")); $("#replyGeneratedText").setAttribute("aria-label", t("generatedReplyAria"));
    $("#setupBackdrop").setAttribute("aria-label", t("closeAria")); $("#setupClose").setAttribute("aria-label", t("closeAria")); $("#aiBackdrop").setAttribute("aria-label", t("closeEditorAria")); $("#aiClose").setAttribute("aria-label", t("closeEditorAria")); $("#libraryBackdrop").setAttribute("aria-label", t("closeLibraryAria")); $("#libraryClose").setAttribute("aria-label", t("closeLibraryAria")); $("#settingsBackdrop").setAttribute("aria-label", t("closeSettingsAria")); $("#settingsClose").setAttribute("aria-label", t("closeSettingsAria")); $("#qrBackdrop").setAttribute("aria-label", t("qrCloseAria")); $("#qrClose").setAttribute("aria-label", t("qrCloseAria")); $("#shareAppBackdrop").setAttribute("aria-label", t("closeAria")); $("#shareAppClose").setAttribute("aria-label", t("closeAria")); $("#supportBackdrop").setAttribute("aria-label", t("closeAria")); $("#supportClose").setAttribute("aria-label", t("closeAria")); $("#paywallBackdrop").setAttribute("aria-label", t("closeAria")); $("#paywallClose").setAttribute("aria-label", t("closeAria"));
    updatePurchaseConfiguration(purchaseConfigured);
    setAiMode(aiMode);
    localStorage.setItem("nurLanguage", lang);
    updateUrl();
    if (render) { if (storyOpened) renderLetter(); renderLibrary(); }
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
      homeScreen.classList.remove("is-leaving");
      letterStage.hidden = false;
      letterStage.classList.add("is-entering");
      $("#homeButton").hidden = false;
      renderLetter();
    }, 600);
  }

  function goHome() {
    window.speechSynthesis?.cancel();
    pendingPremiumFeature = "";
    storyOpened = false;
    letterStage.hidden = true;
    homeScreen.hidden = false;
    homeScreen.classList.remove("is-leaving");
    $("#homeButton").hidden = true;
    Object.values(layers).forEach(closePanel);
    haptic();
  }

  function renderLetter() {
    if (!ensureNames()) return;
    const entry = currentEntry();
    if (!entry || !canAccess(entry)) { openPaywall(); return; }
    const position = entry.shared ? "✦" : String(entry.id).padStart(2, "0");
    $("#letterNumber").textContent = entry.shared ? `${position} PERSONAL` : `${position} / ${LETTERS.length}`;
    $("#letterTo").textContent = displayName(toName);
    $("#letterFrom").textContent = displayName(fromName);
    const text = $("#letterText");
    text.classList.remove("is-changing"); void text.offsetWidth; text.textContent = entryText(entry); text.classList.add("is-changing");
    const captions = [t("stage"), `${displayName(fromName)} · ${displayName(toName)}`, UI[lang].family, UI[lang].gratitude];
    $("#stageCaption").textContent = captions[Math.abs(Number(entry.id) || 0) % captions.length];
    const favorite = favorites.has(String(entry.id));
    $("#favoriteButton").classList.toggle("is-active", favorite);
    $("#favoriteButton").textContent = `${favorite ? "♥" : "♡"} ${favorite ? t("favorite") : t("saved")}`;
    if (!entry.shared) localStorage.setItem("nurLetterIndex", String(entry.id));
    updateUrl(Boolean(entry.shared));
    scheduleCloudSync();
  }

  function moveLetter(direction) {
    if (!letterDeck.length) return;
    const nextIndex = (currentIndex + direction + letterDeck.length) % letterDeck.length;
    if (!canAccess(letterDeck[nextIndex])) { openPaywall(); return; }
    currentIndex = nextIndex;
    renderLetter();
    haptic(8);
  }

  function openQuoteById(id) {
    const index = letterDeck.findIndex(item => Number(item.id) === Number(id));
    if (index < 0) return;
    if (!canAccess(letterDeck[index])) return openPaywall();
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
    list.innerHTML = filtered.map(entry => {
      const accessible = canAccess(entry);
      const text = entryText(entry);
      const visibleText = accessible ? text : t("locked");
      return `<article class="quote-card${accessible ? "" : " is-locked"}" data-id="${entry.id}">
        <div class="quote-body"><div class="quote-head"><b>${String(entry.id).padStart(2, "0")}</b><span>${escapeHtml(t(entry.category) || entry.category)}</span></div><p>${escapeHtml(visibleText)}</p>
        <div class="quote-actions"><button type="button" data-action="open">${escapeHtml(t("openQuote"))}</button><button type="button" data-action="copy">▣ ${escapeHtml(t("copy"))}</button></div></div>
        ${accessible ? "" : `<div class="lock-cover"><i>◇</i><strong>${escapeHtml(t("locked"))}</strong><button type="button" data-action="unlock">${escapeHtml(t("unlock"))}</button></div>`}
      </article>`;
    }).join("");
    setText("#accessLabel", isPremium ? t("allCount") : t("openCount"));
  }

  function inferRelationship(_sender, recipient) {
    const tokens = new Set(normalize(recipient).split(/[^\p{L}\p{N}-]+/u).filter(Boolean));
    for (const [relationship, words] of Object.entries(relationshipWords)) {
      if (words.some(word => tokens.has(normalize(word)))) return relationship;
    }
    return "universal";
  }

  function resolveRelationship(sender, recipient, selected = "auto") {
    return LETTER_RELATIONSHIPS.has(selected) && selected !== "auto" ? selected : inferRelationship(sender, recipient);
  }

  function localCompose(sender, recipient, selectedRelationship = "auto", tone = "auto") {
    const relationship = resolveRelationship(sender, recipient, selectedRelationship);
    const useStyled = ["loving", "romantic", "support", "gratitude"].includes(tone);
    const bank = useStyled ? styledComposer[lang][tone] : (composer[lang][relationship] || composer[lang].universal);
    const index = composerVariant % bank.length;
    composerVariant += 1;
    let text = bank[index].replaceAll("{to}", displayName(recipient));
    const context = useStyled && tone !== "romantic" ? relationshipContext[lang]?.[relationship] : "";
    if (context) {
      const firstStop = text.search(/[.!?](?:\s|$)/u);
      text = firstStop >= 0 ? `${text.slice(0, firstStop + 1)} ${context} ${text.slice(firstStop + 1).trimStart()}` : `${text} ${context}`;
    }
    return text;
  }

  async function remoteCompose(sender, recipient, selectedRelationship = "auto", tone = "auto") {
    if (!CONFIG.aiEndpoint) throw new Error("No endpoint");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 16000);
    try {
      const relationship = resolveRelationship(sender, recipient, selectedRelationship);
      const headers = { "Content-Type": "application/json" };
      if (acceptedBetaCapability) headers["X-GlowLetter-Access"] = acceptedBetaCapability;
      const response = await fetch(CONFIG.aiEndpoint, { method: "POST", headers, body: JSON.stringify({ mode: "letter", from: sender, to: recipient, language: lang, relationship, tone }), signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const text = String(data.text || "").trim();
      if (text.length < 160 || text.length > 1800 || containsForbidden(text) || containsImproperRomance(text, relationship) || !normalize(text).includes(normalize(displayName(recipient)))) throw new Error("Unsafe or incomplete response");
      return text;
    } finally { clearTimeout(timeout); }
  }

  async function generateLetter() {
    if (!isPremium) return openPaywall("letter");
    const sender = cleanName($("#aiSenderName").value);
    const recipient = cleanName($("#aiRecipientName").value);
    if (!sender || !recipient || containsForbidden(sender) || containsForbidden(recipient)) return showSafety(t("namesSafety"));
    const selectedRelationship = LETTER_RELATIONSHIPS.has($("#aiRelationship").value) ? $("#aiRelationship").value : "auto";
    const tone = LETTER_TONES.has($("#aiTone").value) ? $("#aiTone").value : "auto";
    const relationship = resolveRelationship(sender, recipient, selectedRelationship);
    if (tone === "romantic" && relationship !== "spouse") return showSafety(t("romanticSpouseOnly"));
    setNames(sender, recipient, { explicit: true });
    $("#safetyMessage").hidden = true;
    $("#generatedCard").hidden = true;
    $("#generationStatus").hidden = false;
    const button = $("#generateButton"); button.disabled = true; setText(".generate-label", t("generating"));
    let progress = 8; $("#statusBar").style.width = `${progress}%`; $("#statusPercent").textContent = `${progress}%`; setText("#statusText", t("generating"));
    const timer = setInterval(() => { progress = Math.min(91, progress + 9); $("#statusBar").style.width = `${progress}%`; $("#statusPercent").textContent = `${progress}%`; }, 90);
    try {
      const local = localCompose(sender, recipient, selectedRelationship, tone);
      if (CONFIG.aiEndpoint) {
        try { generatedMessage = await remoteCompose(sender, recipient, selectedRelationship, tone); }
        catch { generatedMessage = local; showToast(t("composeFail"), 3400); }
      } else { await new Promise(resolve => setTimeout(resolve, 520)); generatedMessage = local; }
      if (containsForbidden(generatedMessage) || containsImproperRomance(generatedMessage, relationship)) throw new Error("Blocked output");
      $("#generatedText").value = generatedMessage;
      $("#statusBar").style.width = "100%"; $("#statusPercent").textContent = "100%";
      setTimeout(() => { $("#generationStatus").hidden = true; $("#generatedCard").hidden = false; $("#generatedCard").scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 180);
    } catch { showSafety(t("safety")); }
    finally { clearInterval(timer); button.disabled = false; setText(".generate-label", t("generate")); }
  }

  function showSafety(reason) {
    setText("#safetyReason", reason);
    $("#safetyMessage").hidden = false;
    $("#generatedCard").hidden = true;
    $("#generationStatus").hidden = true;
  }

  function inferReplyTone(incoming, selected = "auto") {
    if (REPLY_ENGINE?.resolveTone) return REPLY_ENGINE.resolveTone(incoming, selected);
    if (REPLY_TONES.has(selected) && selected !== "auto") return selected;
    const value = normalize(incoming);
    if (["прости", "извини", "обид", "ссор", "sorry", "apolog", "argument", "pardon", "desole", "dispute"].some(word => value.includes(word))) return "reconcile";
    if (["тяжел", "груст", "устал", "плохо", "помощ", "hard", "sad", "tired", "help", "difficult", "triste", "fatigue", "aide"].some(word => value.includes(word))) return "support";
    if (["спасибо", "рад", "прият", "thanks", "thank you", "glad", "happy", "merci", "heureux"].some(word => value.includes(word))) return "warm";
    return "calm";
  }

  function appendReplyContext(text, relationship) {
    const context = replyRelationshipContext[lang]?.[relationship];
    return context && !text.includes(context) ? `${text} ${context}` : text;
  }

  function replyAnalysis(incoming = $("#replyIncoming")?.value || "") {
    if (REPLY_ENGINE?.analyze) return REPLY_ENGINE.analyze(incoming);
    const intent = REPLY_ENGINE?.inferIntent?.(incoming) || "neutral";
    return {
      intent,
      confidence: intent === "neutral" ? "low" : "medium",
      recommendedTone: inferReplyTone(incoming, "auto"),
      recommendedLength: ["gratitude", "religious_gratitude", "greeting"].includes(intent) ? "short" : "standard",
      needsGoal: ["time_question", "question"].includes(intent)
    };
  }

  function resolveReplyLength(incoming, selected = "auto") {
    const safeSelected = REPLY_LENGTHS.has(selected) ? selected : "auto";
    return REPLY_ENGINE?.resolveLength?.(incoming, safeSelected)
      || (safeSelected === "auto" ? replyAnalysis(incoming).recommendedLength : safeSelected);
  }

  function replyFitsSelectedLength(text, incoming, selected = "auto") {
    const resolved = resolveReplyLength(incoming, selected);
    const limits = REPLY_LENGTH_LIMITS[resolved] || REPLY_LENGTH_LIMITS.standard;
    const value = String(text || "").trim();
    const words = value.split(/\s+/u).filter(Boolean).length;
    const sentences = value.split(/(?<=[.!?…])\s+/u).filter(Boolean).length;
    return Boolean(value)
      && words >= limits.minWords
      && words <= limits.maxWords
      && value.length <= limits.maxCharacters
      && sentences <= limits.maxSentences;
  }

  function replyOptionLabel(group, value) {
    return SELECT_OPTIONS[group]?.[lang]?.find(option => option[0] === value)?.[1] || value;
  }

  function updateReplyInsight() {
    const insight = $("#replyInsight");
    if (!insight) return;
    const incoming = String($("#replyIncoming")?.value || "").normalize("NFKC").trim();
    if (incoming.length < 3 || containsForbidden(incoming)) {
      insight.hidden = true;
      return;
    }
    const analysis = replyAnalysis(incoming);
    const selectedTone = REPLY_TONES.has($("#replyTone")?.value) ? $("#replyTone").value : "auto";
    const selectedLength = REPLY_LENGTHS.has($("#replyLength")?.value) ? $("#replyLength").value : "auto";
    const tone = selectedTone === "auto" ? analysis.recommendedTone : selectedTone;
    const length = selectedLength === "auto" ? analysis.recommendedLength : selectedLength;
    setText("#replyInsightTitle", t("replyInsightTitle"));
    setText("#replyInsightDetails", `${REPLY_INTENT_LABELS[lang]?.[analysis.intent] || analysis.intent} · ${replyOptionLabel("replyTone", tone)} · ${replyOptionLabel("replyLength", length)}`);
    setText("#replyInsightGoal", t("replyCurrent"));
    insight.hidden = false;
  }

  function replyAuditResult(value, context = lastReplyContext) {
    const intent = context.intent || replyAnalysis(context.incoming || "").intent;
    if (REPLY_ENGINE?.audit) return REPLY_ENGINE.audit(value, { ...context, intent });
    const blocked = !value || containsForbidden(value) || containsImproperRomance(value, context.relationship)
      || !replyFactsPreserved(value, context.goal) || !replyTonePreserved(value, context.tone);
    return { ok: !blocked, codes: blocked ? ["forbidden"] : [], severity: blocked ? "warning" : "safe" };
  }

  function renderReplyAudit(value = $("#replyGeneratedText")?.value || "", context = lastReplyContext) {
    const audit = $("#replyAudit");
    if (!audit) return { ok: false, codes: ["empty"], severity: "warning" };
    const result = replyAuditResult(value, context);
    const warning = !result.ok;
    audit.classList.toggle("is-warning", warning);
    audit.classList.toggle("is-safe", !warning);
    const mark = audit.querySelector(":scope > span");
    if (mark) mark.textContent = warning ? "!" : "✓";
    setText("#replyAuditTitle", t(warning ? "replyAuditWarning" : "replyAuditSafe"));
    const details = warning
      ? result.codes.map(code => REPLY_AUDIT_LABELS[lang]?.[code] || code).join("; ") || t("replyAuditWarningDetails")
      : t("replyAuditSafeDetails");
    setText("#replyAuditDetails", details);
    if ($("#copyReply")) $("#copyReply").disabled = warning;
    return result;
  }

  function localComposeReply(incoming, relationship = "auto", tone = "auto", goal = "", length = "auto") {
    const resolvedTone = inferReplyTone(incoming, tone);
    const cleanGoal = String(goal || "").normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, 320);
    if (cleanGoal) {
      const frames = replyGoalFrames[lang][resolvedTone] || replyGoalFrames[lang].calm;
      const statement = `${cleanGoal.charAt(0).toLocaleUpperCase(lang)}${cleanGoal.slice(1)}${/[.!?…]$/u.test(cleanGoal) ? "" : "."}`;
      const resolvedLength = REPLY_ENGINE?.resolveLength?.(incoming, length) || (length === "auto" ? "standard" : length);
      let composed = `${frames[0]} ${statement}`;
      if (resolvedLength !== "short") composed += ` ${frames[1]}`;
      if (resolvedLength === "detailed") composed += ` ${replyDetailedClosings[lang]}`;
      return appendReplyContext(composed, relationship);
    }
    if (REPLY_ENGINE?.compose) {
      const text = REPLY_ENGINE.compose({ incoming, language: lang, tone, length, variant: replyVariant });
      replyVariant += 1;
      return text;
    }
    const value = normalize(incoming);
    const asksTime = ["во сколько", "когда", "время", "придешь", "придете", "вернешь", "when", "what time", "arrive", "return", "quelle heure", "quand", "arriver", "rentrer"].some(word => value.includes(normalize(word)));
    const asksQuestion = incoming.includes("?") || asksTime || ["почему", "зачем", "как ты", "можно ли", "ты соглас", "что думаешь", "do you", "can you", "will you", "why", "how do", "what do you think", "est ce", "pourquoi", "comment", "peux tu", "vas tu"].some(word => value.includes(normalize(word)));
    if (asksQuestion) {
      return appendReplyContext(questionReply[lang][asksTime ? "time" : "general"], relationship);
    }
    const bank = replyComposer[lang][resolvedTone] || replyComposer[lang].calm;
    const index = replyVariant % bank.length;
    replyVariant += 1;
    return appendReplyContext(bank[index], relationship);
  }

  async function remoteComposeReply(incoming, relationship = "auto", tone = "auto", goal = "", length = "auto") {
    if (!CONFIG.aiEndpoint) throw new Error("No endpoint");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 16000);
    try {
      const intent = replyAnalysis(incoming).intent;
      const resolvedLength = resolveReplyLength(incoming, length);
      const headers = { "Content-Type": "application/json" };
      if (acceptedBetaCapability) headers["X-GlowLetter-Access"] = acceptedBetaCapability;
      const response = await fetch(CONFIG.aiEndpoint, { method: "POST", headers, body: JSON.stringify({ mode: "reply", incoming, goal, language: lang, relationship, tone, length: resolvedLength, intent }), signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const text = String(data.text || "").trim();
      const contextAligned = tone !== "auto" || !REPLY_ENGINE?.isAligned || REPLY_ENGINE.isAligned(text, intent);
      if (text.length < 12 || !replyFitsSelectedLength(text, incoming, resolvedLength) || containsForbidden(text) || containsImproperRomance(text, relationship) || !replyFactsPreserved(text, goal) || !replyTonePreserved(text, tone) || !contextAligned || /<[^>]+>/.test(text)) throw new Error("Unsafe or incomplete response");
      return text;
    } finally { clearTimeout(timeout); }
  }

  function showReplySafety(reason) {
    setText("#replySafetyReason", reason);
    $("#replySafety").hidden = false;
    $("#replyGeneratedCard").hidden = true;
    $("#replyStatus").hidden = true;
  }

  function invalidateReplyDraft() {
    replyRequestVersion += 1;
    clearTimeout(replyRevealTimer);
    replyRevealTimer = 0;
    replyVariant = 0;
    generatedReply = "";
    $("#replyGeneratedText").value = "";
    $("#replyGeneratedCard").hidden = true;
    $("#replySafety").hidden = true;
    $("#replyStatus").hidden = true;
  }

  async function generateReply() {
    if (!isPremium) return openPaywall("reply");
    clearTimeout(replyRevealTimer);
    replyRevealTimer = 0;
    const requestVersion = ++replyRequestVersion;
    const incoming = String($("#replyIncoming").value || "").normalize("NFKC").trim().slice(0, 1800);
    if (incoming.length < 3) return showReplySafety(t("replyShort"));
    if (containsForbidden(incoming)) return showReplySafety(t("replySafety"));
    const goal = "";
    const relationship = REPLY_RELATIONSHIPS.has($("#replyRelationship").value) ? $("#replyRelationship").value : "auto";
    const tone = REPLY_TONES.has($("#replyTone").value) ? $("#replyTone").value : "auto";
    const length = REPLY_LENGTHS.has($("#replyLength").value) ? $("#replyLength").value : "auto";
    if (containsImproperRomance(goal, relationship)) return showReplySafety(t("replySafety"));
    const analysis = replyAnalysis(incoming);
    lastReplyContext = { incoming, relationship, tone, length, goal, intent: analysis.intent };
    $("#replySafety").hidden = true;
    $("#replyGeneratedCard").hidden = true;
    $("#replyStatus").hidden = false;
    const button = $("#replyGenerateButton"); button.disabled = true; setText(".reply-generate-label", t("replyGenerating"));
    let progress = 8; $("#replyStatusBar").style.width = `${progress}%`; $("#replyStatusPercent").textContent = `${progress}%`; setText("#replyStatusText", t("replyGenerating"));
    const timer = setInterval(() => { progress = Math.min(91, progress + 11); $("#replyStatusBar").style.width = `${progress}%`; $("#replyStatusPercent").textContent = `${progress}%`; }, 90);
    try {
      const local = localComposeReply(incoming, relationship, tone, goal, length);
      if (CONFIG.aiEndpoint) {
        try { generatedReply = await remoteComposeReply(incoming, relationship, tone, goal, length); }
        catch { generatedReply = local; showToast(t("composeFail"), 3400); }
      } else { await new Promise(resolve => setTimeout(resolve, 480)); generatedReply = local; }
      if (requestVersion !== replyRequestVersion || incoming !== String($("#replyIncoming").value || "").normalize("NFKC").trim().slice(0, 1800)) return;
      const intent = analysis.intent;
      const contextAligned = tone !== "auto" || !REPLY_ENGINE?.isAligned || REPLY_ENGINE.isAligned(generatedReply, intent);
      const audit = replyAuditResult(generatedReply, lastReplyContext);
      if (containsForbidden(generatedReply) || containsImproperRomance(generatedReply, relationship) || !replyFitsSelectedLength(generatedReply, incoming, length) || !replyFactsPreserved(generatedReply, goal) || !replyTonePreserved(generatedReply, tone) || !contextAligned || !audit.ok) throw new Error("Blocked output");
      $("#replyGeneratedText").value = generatedReply;
      renderReplyAudit(generatedReply, lastReplyContext);
      $("#replyStatusBar").style.width = "100%"; $("#replyStatusPercent").textContent = "100%";
      replyRevealTimer = setTimeout(() => {
        if (requestVersion !== replyRequestVersion || incoming !== String($("#replyIncoming").value || "").normalize("NFKC").trim().slice(0, 1800)) return;
        replyRevealTimer = 0;
        $("#replyStatus").hidden = true;
        $("#replyGeneratedCard").hidden = false;
        $("#replyGeneratedCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 180);
    } catch { showReplySafety(t("replySafety")); }
    finally { clearInterval(timer); button.disabled = false; setText(".reply-generate-label", t("replyGenerate")); }
  }

  function usePersonalText(text) {
    if (!isPremium) return openPaywall("letter");
    const value = String(text || "").normalize("NFKC").trim().slice(0, 1800);
    const sender = cleanName($("#aiSenderName").value) || fromName;
    const recipient = cleanName($("#aiRecipientName").value) || toName;
    const selectedRelationship = LETTER_RELATIONSHIPS.has($("#aiRelationship").value) ? $("#aiRelationship").value : "auto";
    const relationship = resolveRelationship(sender, recipient, selectedRelationship);
    if (!value || value.length < 12 || containsForbidden(value) || containsImproperRomance(value, relationship)) return showSafety(t("safety"));
    if (!sender || !recipient || containsForbidden(sender) || containsForbidden(recipient)) return showSafety(t("namesSafety"));
    setNames(sender, recipient, { explicit: true });
    sharedMessage = value;
    letterDeck = [{ id: "shared", category: "warm", shared: true, ru: value, en: value, fr: value }, ...LETTERS];
    currentIndex = 0;
    closePanel(layers.ai);
    if (!storyOpened) openStory(); else renderLetter();
    updateUrl(true);
    showToast(t("customAdded"), 3200);
  }

  function openAiMode(mode = "letter") {
    setAiMode(mode);
    if (mode === "letter") {
      $("#aiSenderName").value = fromName;
      $("#aiRecipientName").value = toName;
    }
    openPanel(layers.ai);
    requestAnimationFrame(() => (mode === "reply" ? $("#replyIncoming") : (fromName ? $("#aiRecipientName") : $("#aiSenderName")))?.focus());
  }

  function requestPremiumFeature(feature) {
    pendingPremiumFeature = feature === "reply" ? "reply" : "letter";
    if (isPremium) {
      const requested = pendingPremiumFeature;
      pendingPremiumFeature = "";
      openAiMode(requested);
      return;
    }
    if (entitlementState === "checking") {
      showToast(t("checkingPurchase"));
      requestNativeEntitlement();
      return;
    }
    openPaywall(pendingPremiumFeature);
  }

  function openPaywall(feature = "") {
    if (feature === "letter" || feature === "reply") pendingPremiumFeature = feature;
    $$(".price-label").forEach(label => label.textContent = premiumPrice);
    openPanel(layers.paywall);
    haptic([15, 40, 15]);
  }

  function closePaywall() {
    pendingPremiumFeature = "";
    closePanel(layers.paywall);
  }

  function applyEffectivePremium(reason = "") {
    const wasPremium = isPremium;
    isPremium = Boolean(betaAccess || nativePremium || cloudPremium);
    entitlementState = isPremium ? "premium" : "free";
    $(".premium-settings-card").hidden = isPremium;
    setText("#accessLabel", isPremium ? t("allCount") : t("openCount"));
    renderLibrary();
    renderCloudAccount();
    if (isPremium) {
      const requested = pendingPremiumFeature;
      pendingPremiumFeature = "";
      closePanel(layers.paywall);
      if (!wasPremium) showToast(t("premiumOn"), 3600);
      if (requested) openAiMode(requested);
    } else {
      if (reason) console.info("Entitlement:", reason);
      if (pendingPremiumFeature) openPaywall(pendingPremiumFeature);
    }
  }

  function updatePremium(owned, price, reason = "") {
    const transient = owned !== true && owned !== "true" && ["initializing", "restoring_purchases", "verifying_purchase"].includes(String(reason || ""));
    if (transient) {
      entitlementState = "checking";
      if (price) {
        premiumPrice = localizedMonthlyPrice(price);
        if (String(reason) !== "beta_capability") premiumPriceFromStore = true;
      }
      $$(".price-label").forEach(label => label.textContent = premiumPrice);
      return;
    }
    if (String(reason) !== "beta_capability") nativePremium = owned === true || owned === "true";
    if (price) {
      premiumPrice = localizedMonthlyPrice(price);
      if (String(reason) !== "beta_capability") premiumPriceFromStore = true;
    }
    $$(".price-label").forEach(label => label.textContent = premiumPrice);
    applyEffectivePremium(reason);
  }

  function updatePurchaseConfiguration(configured) {
    if (typeof configured !== "boolean") return;
    purchaseConfigured = configured;
    [$("#purchaseButton"), $("#settingsPurchase"), $("#restoreButton")].forEach(button => {
      if (!button) return;
      button.classList.toggle("is-unavailable", !configured);
      button.setAttribute("aria-disabled", String(!configured));
      button.title = configured ? "" : t("purchaseUnavailable");
    });
  }

  window.onNativeEntitlement = (owned, price, reason) => { if (trustedEntitlementSource) updatePremium(owned, price, reason); };

  async function requestNativeEntitlement() {
    try {
      if (betaAccess) {
        updatePremium(true, premiumPrice, "beta_capability");
        return;
      }
      if (!trustedEntitlementSource || !window.NurBilling?.getEntitlement) {
        nativePremium = false;
        applyEffectivePremium("native_billing_unavailable");
        updatePurchaseConfiguration(Boolean(CONFIG.playStoreUrl || CONFIG.appStoreUrl));
        return;
      }
      const raw = await Promise.resolve(window.NurBilling.getEntitlement());
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data) {
        updatePremium(Boolean(data.entitled ?? data.owned ?? data.premium), data.priceLabel || data.price, data.reason);
        updatePurchaseConfiguration(data.purchaseConfigured);
      }
    } catch (error) {
      nativePremium = false;
      applyEffectivePremium("native_billing_error");
      console.info("Billing bridge not ready", error);
    }
  }

  function purchaseFullAccess() {
    if (purchaseConfigured === false) { showToast(t("purchaseUnavailable"), 4300); return; }
    if (trustedEntitlementSource && window.NurBilling?.purchaseFullAccess) { window.NurBilling.purchaseFullAccess(); return; }
    if (CONFIG.playStoreUrl) { window.open(CONFIG.playStoreUrl, "_blank", "noopener"); return; }
    showToast(t("purchaseUnavailable"), 4300);
  }

  function restorePurchase() {
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
      this.canvas = canvas; this.ctx = canvas.getContext("2d"); this.enabled = localStorage.getItem("nurRain") !== "off"; this.intensity = .58; this.drops = []; this.splashes = []; this.frame = 0; this.resize = this.resize.bind(this); this.draw = this.draw.bind(this);
      addEventListener("resize", this.resize, { passive: true }); document.addEventListener("visibilitychange", () => { if (!document.hidden && this.enabled) this.start(); }); this.resize(); this.setEnabled(this.enabled, false);
    }
    resize() { const dpr = Math.min(devicePixelRatio || 1, 1.5); this.width = innerWidth; this.height = innerHeight; this.canvas.width = Math.round(this.width * dpr); this.canvas.height = Math.round(this.height * dpr); this.canvas.style.width = `${this.width}px`; this.canvas.style.height = `${this.height}px`; this.ctx.setTransform(dpr,0,0,dpr,0,0); const count = Math.max(18, Math.min(54, Math.round(this.width / 24))); this.drops = Array.from({ length: count }, () => this.makeDrop(true)); }
    makeDrop(randomY = false) { return { x: Math.random() * (this.width + 240) - 120, y: randomY ? Math.random() * this.height : -60, length: 22 + Math.random() * 43, speed: 7 + Math.random() * 9, width: 1.1 + Math.random() * 1.7, alpha: .11 + Math.random() * .28, drift: 1.5 + Math.random() * 2.7 }; }
    setEnabled(enabled, persist = true) { this.enabled = Boolean(enabled); this.canvas.classList.toggle("is-off", !this.enabled); $("#rainToggle").classList.toggle("is-active", this.enabled); $("#rainToggle").setAttribute("aria-pressed", String(this.enabled)); $("#rainToggle b").textContent = this.enabled ? t("stateOn") : t("stateOff"); if (persist) { localStorage.setItem("nurRain", this.enabled ? "on" : "off"); scheduleCloudSync(); } if (this.enabled) this.start(); else { cancelAnimationFrame(this.frame); this.ctx.clearRect(0,0,this.width,this.height); } }
    setIntensity(value) { this.intensity = Math.max(.2, Math.min(1, value)); }
    start() { cancelAnimationFrame(this.frame); this.draw(); }
    draw() { if (!this.enabled || document.hidden) return; const ctx = this.ctx; ctx.clearRect(0,0,this.width,this.height); ctx.lineCap = "round"; for (let i=0;i<this.drops.length * this.intensity;i++) { const drop=this.drops[i]; const gradient=ctx.createLinearGradient(drop.x,drop.y,drop.x+drop.drift,drop.y+drop.length); gradient.addColorStop(0,"rgba(220,236,245,0)"); gradient.addColorStop(1,`rgba(221,239,248,${drop.alpha})`); ctx.strokeStyle=gradient;ctx.lineWidth=drop.width;ctx.beginPath();ctx.moveTo(drop.x,drop.y);ctx.lineTo(drop.x+drop.drift,drop.y+drop.length);ctx.stroke();drop.x+=drop.drift;drop.y+=drop.speed;if(drop.y>this.height-5){if(Math.random()<.24)this.splashes.push({x:drop.x,y:this.height-4,r:1,a:.35});this.drops[i]=this.makeDrop(false);} }
      this.splashes=this.splashes.filter(s=>{ctx.strokeStyle=`rgba(220,239,247,${s.a})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(s.x,s.y,s.r*2.3,s.r*.55,0,0,Math.PI*2);ctx.stroke();s.r+=.8;s.a-=.045;return s.a>0;}); this.frame=requestAnimationFrame(this.draw); }
  }

  class NatureSoundscape {
    constructor() { this.context=null;this.master=null;this.wind=null;this.timers=[]; }
    async start() { if (!this.context) this.create(); await this.context.resume(); this.master.gain.setTargetAtTime(.58,this.context.currentTime,.6); this.scheduleCricket();this.scheduleFrog(); }
    create() { const AudioCtx=window.AudioContext||window.webkitAudioContext;this.context=new AudioCtx();this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination); const length=this.context.sampleRate*2;const buffer=this.context.createBuffer(1,length,this.context.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*.34;const noise=this.context.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=this.context.createBiquadFilter();filter.type="lowpass";filter.frequency.value=520;const gain=this.context.createGain();gain.gain.value=.018;noise.connect(filter).connect(gain).connect(this.master);noise.start();this.wind=noise; }
    stop() { if(!this.context)return;this.master.gain.setTargetAtTime(0,this.context.currentTime,.3);this.timers.forEach(clearTimeout);this.timers=[]; }
    scheduleCricket() { if(!isNaturePlaying)return;const timer=setTimeout(()=>{if(!isNaturePlaying)return;const now=this.context.currentTime;for(let i=0;i<4;i++){const osc=this.context.createOscillator();const gain=this.context.createGain();osc.type="sine";osc.frequency.value=3900+Math.random()*800;gain.gain.setValueAtTime(0,now+i*.09);gain.gain.linearRampToValueAtTime(.018,now+i*.09+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.055);osc.connect(gain).connect(this.master);osc.start(now+i*.09);osc.stop(now+i*.09+.07);}this.scheduleCricket();},3500+Math.random()*6500);this.timers.push(timer); }
    scheduleFrog() { if(!isNaturePlaying)return;const timer=setTimeout(()=>{if(!isNaturePlaying)return;const now=this.context.currentTime;for(let i=0;i<2;i++){const osc=this.context.createOscillator();const gain=this.context.createGain();osc.type="triangle";osc.frequency.setValueAtTime(155+i*22,now+i*.2);osc.frequency.exponentialRampToValueAtTime(92,now+i*.2+.28);gain.gain.setValueAtTime(.0001,now+i*.2);gain.gain.exponentialRampToValueAtTime(.024,now+i*.2+.04);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.2+.32);osc.connect(gain).connect(this.master);osc.start(now+i*.2);osc.stop(now+i*.2+.35);}this.scheduleFrog();},11000+Math.random()*15000);this.timers.push(timer); }
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
    const colors=["#b7634b","#d48a59","#d59aa8","#8c684c","#d6a75c"];
    for(let i=0;i<18;i++){const leaf=document.createElement("i");leaf.className="leaf";leaf.style.setProperty("--left",`${-5+Math.random()*106}%`);leaf.style.setProperty("--size",`${8+Math.random()*12}px`);leaf.style.setProperty("--duration",`${10+Math.random()*13}s`);leaf.style.setProperty("--delay",`${-Math.random()*20}s`);leaf.style.setProperty("--opacity",`${.2+Math.random()*.5}`);leaf.style.setProperty("--leaf-color",colors[Math.floor(Math.random()*colors.length)]);$("#leaves").append(leaf);}
    for(let i=0;i<15;i++){const ember=document.createElement("i");ember.className="ember";ember.style.setProperty("--left",`${42+Math.random()*19}%`);ember.style.setProperty("--size",`${1+Math.random()*3}px`);ember.style.setProperty("--duration",`${3.2+Math.random()*3}s`);ember.style.setProperty("--delay",`${-Math.random()*5}s`);ember.style.setProperty("--drift",`${-35+Math.random()*70}px`);$("#embers").append(ember);}
  }

  function base64ToBlob(base64, mime) { base64=String(base64).replace(/\s+/g,"");const arrays=[];for(let offset=0;offset<base64.length;offset+=512*1024){const end=Math.min(base64.length,offset+512*1024);const safeEnd=end<base64.length?end-(end-offset)%4:end;const binary=atob(base64.slice(offset,safeEnd));const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);arrays.push(bytes);offset=safeEnd-512*1024;}return new Blob(arrays,{type:mime}); }

  async function getBuiltinBlob(index) { const response=await fetch(tracks[index].source);if(response.ok)return response.blob();const fallback=await fetch(tracks[index].fallback);if(!fallback.ok)throw new Error("Track missing");return base64ToBlob((await fallback.text()).trim(),"audio/mpeg"); }
  async function setAudioSource(index) { if(currentAudioUrl)URL.revokeObjectURL(currentAudioUrl);const blob=index===3?customAudioBlob:await getBuiltinBlob(index);if(!blob)throw new Error("Choose audio first");currentAudioUrl=URL.createObjectURL(blob);audio.src=currentAudioUrl;audio.load(); }
  async function playMusic(quiet=false) { try{if(!audio.src)await setAudioSource(selectedTrack);await audio.play();isMusicPlaying=true;$("#soundButton").classList.add("is-playing");$("#soundButton").setAttribute("aria-pressed","true");$("#soundButton").setAttribute("aria-label",t("soundOffAria"));}catch{if(!quiet)showToast("Tap again to start audio");} }
  function pauseMusic(){audio.pause();isMusicPlaying=false;$("#soundButton").classList.remove("is-playing");$("#soundButton").setAttribute("aria-pressed","false");$("#soundButton").setAttribute("aria-label",t("soundOnAria"));}
  async function selectTrack(index){const resume=isMusicPlaying;selectedTrack=index;localStorage.setItem("nurTrack",String(index));if(index>=0&&index<=2){cloudBuiltInTrack=index;localStorage.setItem("nurLastBuiltInTrack",String(index));scheduleCloudSync();}$$('.track-option').forEach(option=>option.classList.toggle("is-active",Number(option.dataset.track)===index||(index===3&&option.id==="customTrackButton")));audio.pause();audio.removeAttribute("src");audio.load();try{await setAudioSource(index);if(resume)await playMusic();showToast(index===3?$("#customTrackName").textContent:tracks[index].name);}catch(error){showToast(error.message);} }

  function openMediaDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open("nur-letter-media",1);request.onupgradeneeded=()=>request.result.createObjectStore("assets");request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  async function saveMedia(key,value){const db=await openMediaDb();await new Promise((resolve,reject)=>{const tx=db.transaction("assets","readwrite");tx.objectStore("assets").put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}
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

  const weatherMap={0:["☀","Clear"],1:["◐","Mostly clear"],2:["☁","Cloudy"],3:["☁","Overcast"],45:["≋","Fog"],48:["≋","Fog"],51:["☂","Drizzle"],53:["☂","Drizzle"],55:["☂","Drizzle"],61:["☂","Rain"],63:["☂","Rain"],65:["☂","Heavy rain"],71:["❄","Snow"],73:["❄","Snow"],75:["❄","Snow"],80:["☂","Showers"],81:["☂","Showers"],82:["☂","Showers"],95:["ϟ","Storm"],96:["ϟ","Storm"],99:["ϟ","Storm"]};
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

  function disableWeather(){
    weatherEnabled=false;localStorage.setItem("nurWeather","off");document.body.removeAttribute("data-weather");renderWeather();scheduleCloudSync();
  }

  function toggleWeather(){if(weatherEnabled)disableWeather();else refreshWeather();}

  async function generatePostcard(){const entry=currentEntry();if(!canAccess(entry))return openPaywall();const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext("2d");const image=new Image();image.src=backgroundUrl||"assets/campfire-lake.png";try{await image.decode();const scale=Math.max(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h);}catch{ctx.fillStyle="#302335";ctx.fillRect(0,0,canvas.width,canvas.height);}const gradient=ctx.createLinearGradient(0,0,0,canvas.height);gradient.addColorStop(0,"rgba(20,18,28,.3)");gradient.addColorStop(.42,"rgba(26,19,28,.46)");gradient.addColorStop(1,"rgba(15,11,18,.88)");ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#f1b8cb";ctx.font="700 24px system-ui";ctx.letterSpacing="6px";ctx.fillText("GLOWLETTER",90,130);ctx.fillStyle="#fff8ed";ctx.font="600 66px Georgia";ctx.fillText(`${t("for")} ${displayName(toName)}`,90,270);ctx.strokeStyle="rgba(255,238,229,.38)";ctx.beginPath();ctx.moveTo(90,316);ctx.lineTo(990,316);ctx.stroke();ctx.fillStyle="#fffaf2";ctx.font="600 55px Georgia";wrapCanvasText(ctx,entryText(entry),90,440,900,78);ctx.fillStyle="#f0c5d3";ctx.font="italic 600 49px Georgia";ctx.textAlign="right";ctx.fillText(`${t("from")} ${displayName(fromName)}`,990,1765);ctx.textAlign="left";const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png",.95));const file=new File([blob],"glow-letter.png",{type:"image/png"});try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:t("title")});return;}}catch(error){if(error.name==="AbortError")return;}const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="glow-letter.png";link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);showToast(t("downloadReady"));}
  function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight){const words=text.split(/\s+/);let line="";let currentY=y;for(const word of words){const test=`${line}${word} `;if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line.trim(),x,currentY);line=`${word} `;currentY+=lineHeight;if(currentY>1570)break;}else line=test;}if(line&&currentY<=1570)ctx.fillText(line.trim(),x,currentY);}

  function speakLetter(){if(!("speechSynthesis" in window)){showToast(t("speechUnavailable"));return;}const button=$("#speakButton");if(speechSynthesis.speaking){speechSynthesis.cancel();button.textContent=`◖ ${t("read")}`;return;}const utterance=new SpeechSynthesisUtterance(entryText(currentEntry()));utterance.lang=lang==="ru"?"ru-RU":lang==="fr"?"fr-FR":"en-US";utterance.rate=.9;utterance.pitch=1;utterance.onend=()=>button.textContent=`◖ ${t("read")}`;button.textContent=`■ ${t("stop")}`;speechSynthesis.speak(utterance);}

  function toggleFavorite(){const entry=currentEntry();const key=String(entry.id);if(favorites.has(key))favorites.delete(key);else favorites.add(key);localStorage.setItem("nurFavorites",JSON.stringify([...favorites]));renderLetter();scheduleCloudSync();haptic();}

  async function shareLetter(){
    const entry=currentEntry();const url=new URL(CONFIG.publicShareUrl||`${location.origin}${location.pathname}`,location.href);url.search="";url.hash="";
    if(fromName)url.searchParams.set("from",fromName);if(toName)url.searchParams.set("to",toName);url.searchParams.set("lang",lang);url.searchParams.set("msg",encodeSharedMessage(entryText(entry)));
    const data={title:t("title"),text:`${displayName(toName)}, ${t("shareText")} — ${displayName(fromName)} ♡`,url:url.toString()};
    try{if(navigator.share){await navigator.share(data);return;}}catch(error){if(error?.name==="AbortError")return;}
    await writeClipboard(data.url);showToast(t("shareAppCopied"));haptic(10);
  }

  function buildAppShareUrl() {
    const publicUrl = new URL(CONFIG.publicShareUrl || `${location.origin}${location.pathname}`, location.href);
    publicUrl.search = "";
    publicUrl.hash = "";
    if (["en", "fr"].includes(lang)) publicUrl.searchParams.set("lang", lang);
    return publicUrl.toString();
  }

  function nativeShareBridge() {
    const bridge = window.NurShare;
    return bridge && typeof bridge.share === "function" ? bridge : null;
  }

  function openShareFallback(url) {
    fallbackShareUrl = url;
    const message = t("shareAppText");
    $("#shareTelegram").href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
    $("#shareWhatsapp").href = `https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`;
    $("#shareEmail").href = `mailto:?subject=${encodeURIComponent(t("title"))}&body=${encodeURIComponent(`${message}\n\n${url}`)}`;
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
    return {moon:{foreground:"#302a38",background:"#fffdf8",accent:"#74677d"},rose:{foreground:"#4a2938",background:"#fffafc",accent:"#a6607b"},forest:{foreground:"#263e34",background:"#fbfdf8",accent:"#537565"},sand:{foreground:"#4b3828",background:"#fffaf3",accent:"#9a704a"}}[uiTheme]||{foreground:"#302a38",background:"#fffdf8",accent:"#74677d"};
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

  function renderQrCode(notify=false){
    const sender=cleanName($("#qrSenderName")?.value||"");const recipient=cleanName($("#qrRecipientName")?.value||"");
    const invalid=Boolean(sender||recipient)&&(!sender||!recipient||containsForbidden(sender)||containsForbidden(recipient));$("#qrNamesError").hidden=!invalid;if(invalid)return false;
    if(!window.GlowLetterQR?.renderToCanvas){showToast(t("qrUnavailable"));return false;}
    currentQrUrl=buildPublicQrUrl(sender,recipient);const palette=qrPalette();
    window.GlowLetterQR.renderToCanvas($("#qrCanvas"),currentQrUrl,{size:280,pixelRatio:Math.min(Number(devicePixelRatio)||1,2),margin:4,level:"M",foreground:palette.foreground,background:palette.background});
    setText("#qrRoutePreview",qrRouteText(sender,recipient));if(notify)showToast(t("qrReady"));return true;
  }

  function openQrBuilder(){
    $("#qrSenderName").value=fromName;$("#qrRecipientName").value=toName;$("#qrNamesError").hidden=true;renderQrCode(false);openPanel(layers.qr);
  }

  function createQrCardBlob(){
    if(!currentQrUrl&&!renderQrCode(false))return Promise.resolve(null);
    const source=$("#qrCanvas");const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=1600;const ctx=canvas.getContext("2d");if(!ctx)return Promise.resolve(null);const palette=qrPalette();
    const gradient=ctx.createLinearGradient(0,0,1200,1600);gradient.addColorStop(0,palette.background);gradient.addColorStop(1,"#ece8ea");ctx.fillStyle=gradient;ctx.fillRect(0,0,1200,1600);
    ctx.strokeStyle=palette.accent;ctx.lineWidth=4;ctx.strokeRect(56,56,1088,1488);ctx.textAlign="center";ctx.fillStyle=palette.accent;ctx.font="800 30px Manrope, Arial";ctx.fillText("G L O W L E T T E R",600,155);
    ctx.fillStyle=palette.foreground;ctx.font="600 72px Georgia, serif";ctx.fillText(({ru:"Тёплое письмо",en:"A warm letter",fr:"Une lettre chaleureuse"}[lang]||"GlowLetter"),600,265);
    ctx.fillStyle="#ffffff";ctx.fillRect(176,350,848,848);ctx.drawImage(source,200,374,800,800);
    const sender=cleanName($("#qrSenderName")?.value||"");const recipient=cleanName($("#qrRecipientName")?.value||"");const route=qrRouteText(sender,recipient);let routeFontSize=48;ctx.fillStyle=palette.foreground;ctx.font=`600 ${routeFontSize}px Georgia, serif`;while(ctx.measureText(route).width>1000&&routeFontSize>30){routeFontSize-=2;ctx.font=`600 ${routeFontSize}px Georgia, serif`;}ctx.fillText(route,600,1285);
    ctx.fillStyle=palette.accent;ctx.font="700 25px Manrope, Arial";ctx.fillText(t("qrCaption").toLocaleUpperCase(lang),600,1372);ctx.fillStyle="#756d77";ctx.font="500 23px Manrope, Arial";ctx.fillText(({ru:"Наведите камеру телефона на QR-код",en:"Point your phone camera at the QR code",fr:"Visez le QR code avec l’appareil photo"}[lang]),600,1430);
    return new Promise(resolve=>canvas.toBlob(resolve,"image/png",.96));
  }

  async function downloadQrCard(){
    if(!renderQrCode(false))return;const blob=await createQrCardBlob();if(!blob)return;const url=URL.createObjectURL(blob);const link=document.createElement("a");const recipient=cleanName($("#qrRecipientName")?.value||"").replace(/[^\p{L}\p{N}-]+/gu,"-");link.href=url;link.download=`GlowLetter-QR${recipient?`-${recipient}`:""}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);showToast(t("downloadReady"));
  }

  async function copyQrImage(){
    if(!renderQrCode(false))return;const blob=await createQrCardBlob();if(!blob)return;
    try{if(!navigator.clipboard?.write||typeof ClipboardItem!=="function")throw new Error("unsupported");await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);showToast(t("qrImageCopied"));}
    catch{showToast(t("qrImageCopyFail"),3200);}
  }

  async function copyQrLink(){if(!renderQrCode(false))return;await writeClipboard(currentQrUrl);showToast(t("qrLinkCopied"));haptic(10);}

  function isFullscreenShell(){return Boolean(matchMedia?.("(display-mode: fullscreen)").matches||navigator.standalone===true||location.hostname==="appassets.androidplatform.net"||location.protocol==="file:");}
  function fullscreenActive(){return Boolean(document.fullscreenElement||isFullscreenShell());}
  async function requestAutomaticFullscreen(){if(localStorage.getItem(AUTO_FULLSCREEN_KEY)==="off"||fullscreenActive()||typeof document.documentElement.requestFullscreen!=="function")return;try{await document.documentElement.requestFullscreen({navigationUI:"hide"});localStorage.setItem("nurFullscreen","on");}catch{}}
  function installAutomaticFullscreen(){const activate=event=>{if(event.target?.closest?.("#fullscreenToggle"))return;document.removeEventListener("click",activate);requestAutomaticFullscreen();};document.addEventListener("click",activate);requestAutomaticFullscreen();}
  function updateFullscreenControl(){const active=fullscreenActive();$("#fullscreenToggle")?.classList.toggle("is-active",active);$("#fullscreenToggle")?.setAttribute("aria-pressed",String(active));const state=$("#fullscreenToggle b");if(state)state.textContent=active?t("stateOn"):t("stateOpen");}
  async function toggleFullscreen(){if(isFullscreenShell()&&!document.fullscreenElement){localStorage.setItem(AUTO_FULLSCREEN_KEY,"on");updateFullscreenControl();return;}if(!document.fullscreenElement&&typeof document.documentElement.requestFullscreen!=="function"){showToast(t("fullscreenUnavailable"));return;}try{if(!document.fullscreenElement){localStorage.setItem(AUTO_FULLSCREEN_KEY,"on");await document.documentElement.requestFullscreen({navigationUI:"hide"});}else{localStorage.setItem(AUTO_FULLSCREEN_KEY,"off");await document.exitFullscreen?.();}}catch{showToast(t("fullscreenUnavailable"));}updateFullscreenControl();}
  function restoreGesturePreferences(){if(gesturePreferencesRestored)return;gesturePreferencesRestored=true;if(localStorage.getItem("nurNature")==="on"&&!isNaturePlaying)setNaturePlaying(true,false);requestAutomaticFullscreen();}
  function saveSettings(){
    const sender = cleanName($("#settingsSenderName").value);
    const recipient = cleanName($("#settingsRecipientName").value);
    const namesInvalid = Boolean(sender || recipient) && (!sender || !recipient || containsForbidden(sender) || containsForbidden(recipient));
    $("#settingsNamesError").hidden = !namesInvalid;
    if (namesInvalid) return;
    setNames(sender, recipient, { explicit: true });
    localStorage.setItem("nurLanguage",lang);localStorage.setItem("nurUiTheme",uiTheme);localStorage.setItem("nurRain",rainScene.enabled?"on":"off");localStorage.setItem("nurWeather",weatherEnabled?"on":"off");localStorage.setItem("nurTrack",String(selectedTrack));localStorage.setItem("nurNature",isNaturePlaying?"on":"off");localStorage.setItem("nurFullscreen",fullscreenActive()||localStorage.getItem(AUTO_FULLSCREEN_KEY)!=="off"?"on":"off");localStorage.setItem("nurVolume",String(audio.volume));scheduleCloudSync({includeNames:true,immediate:true});showToast(t("settingsSaved"));closePanel(layers.settings);
  }

  function bindEvents(){
    $("#openStoryButton").addEventListener("click",openStory);$("#homeButton").addEventListener("click",goHome);$$(".go-home").forEach(button=>button.addEventListener("click",goHome));
    $("#setupForm").addEventListener("submit",submitNameSetup);$("#setupClose").addEventListener("click",()=>closePanel(layers.setup));$("#setupBackdrop").addEventListener("click",()=>closePanel(layers.setup));
    $("#nextLetter").addEventListener("click",()=>moveLetter(1));$("#previousLetter").addEventListener("click",()=>moveLetter(-1));$("#copyLetter").addEventListener("click",()=>copyText(entryText(currentEntry())));$("#shareButton").addEventListener("click",shareLetter);$("#speakButton").addEventListener("click",speakLetter);$("#postcardButton").addEventListener("click",generatePostcard);$("#favoriteButton").addEventListener("click",toggleFavorite);
    [$("#aiOpenTop"),$("#aiOpenHome"),$("#aiOpenLetter")].forEach(button=>button.addEventListener("click",()=>requestPremiumFeature("letter")));$("#replyOpenHome").addEventListener("click",()=>requestPremiumFeature("reply"));$("#aiClose").addEventListener("click",()=>closePanel(layers.ai));$("#aiBackdrop").addEventListener("click",()=>closePanel(layers.ai));
    $$("[data-ai-mode]").forEach(button=>{button.addEventListener("click",()=>setAiMode(button.dataset.aiMode));button.addEventListener("keydown",event=>{if(!["ArrowLeft","ArrowRight"].includes(event.key))return;event.preventDefault();const next=button.dataset.aiMode==="letter"?$("#replyModeTab"):$("#letterModeTab");setAiMode(next.dataset.aiMode);next.focus();});});
    $("#libraryButton").addEventListener("click",()=>{pendingPremiumFeature="";renderLibrary();openPanel(layers.library);});$("#libraryClose").addEventListener("click",()=>closePanel(layers.library));$("#libraryBackdrop").addEventListener("click",()=>closePanel(layers.library));
    $("#settingsButton").addEventListener("click",()=>{pendingPremiumFeature="";$("#settingsSenderName").value=fromName;$("#settingsRecipientName").value=toName;$("#settingsNamesError").hidden=true;openPanel(layers.settings);if(cloudUser?.id)loadCloudAccount(cloudUser).catch(error=>console.info("Cloud account refresh failed",error));});$("#settingsClose").addEventListener("click",()=>closePanel(layers.settings));$("#settingsBackdrop").addEventListener("click",()=>closePanel(layers.settings));$("#saveSettingsButton").addEventListener("click",saveSettings);
    $$('.theme-choice-grid [data-ui-theme]').forEach(button=>button.addEventListener("click",()=>{applyUiTheme(button.dataset.uiTheme);if(currentQrUrl)renderQrCode(false);}));
    $("#qrOpenButton").addEventListener("click",openQrBuilder);$("#qrClose").addEventListener("click",()=>closePanel(layers.qr));$("#qrBackdrop").addEventListener("click",()=>closePanel(layers.qr));$("#qrForm").addEventListener("submit",event=>{event.preventDefault();renderQrCode(true);});$("#qrDownloadButton").addEventListener("click",downloadQrCard);$("#qrCopyLinkButton").addEventListener("click",copyQrLink);$("#qrCopyImageButton").addEventListener("click",copyQrImage);$("#qrPrintButton").addEventListener("click",()=>{if(renderQrCode(false))window.print();});
    $("#shareAppClose").addEventListener("click",()=>closePanel(layers.share));$("#shareAppBackdrop").addEventListener("click",()=>closePanel(layers.share));$("#shareCopyLink").addEventListener("click",copyFallbackShareLink);
    $("#supportOpenButton").addEventListener("click",openSupportForm);$("#supportClose").addEventListener("click",()=>closePanel(layers.support));$("#supportBackdrop").addEventListener("click",()=>closePanel(layers.support));$("#supportForm").addEventListener("submit",submitSupportRequest);$("#supportMessage").addEventListener("input",()=>{updateSupportMessageCount();if($("#supportStatus").dataset.state==="error")setSupportStatus();});$("#supportSignInButton").addEventListener("click",event=>{const provider=event.currentTarget.dataset.provider;if(provider)signInWithCloud(provider);});$("#supportCopyContact").addEventListener("click",async()=>{await writeClipboard(SUPPORT_EMAIL);showToast(t("supportContactCopied"));haptic(10);});
    $("#paywallClose").addEventListener("click",closePaywall);$("#paywallBackdrop").addEventListener("click",closePaywall);$("#purchaseButton").addEventListener("click",purchaseFullAccess);$("#settingsPurchase").addEventListener("click",purchaseFullAccess);$("#restoreButton").addEventListener("click",restorePurchase);$("#manageSubscriptionButton").addEventListener("click",manageSubscription);$("#paywallManageSubscription").addEventListener("click",manageSubscription);
    $("#aiForm").addEventListener("submit",event=>{event.preventDefault();generateLetter();});$("#regenerateButton").addEventListener("click",generateLetter);$("#copyGenerated").addEventListener("click",()=>{const value=$("#generatedText").value;const sender=cleanName($("#aiSenderName").value)||fromName;const recipient=cleanName($("#aiRecipientName").value)||toName;const selected=LETTER_RELATIONSHIPS.has($("#aiRelationship").value)?$("#aiRelationship").value:"auto";const relationship=resolveRelationship(sender,recipient,selected);if(!value||containsForbidden(value)||containsImproperRomance(value,relationship))showSafety(t("safety"));else copyText(value);});$("#useGenerated").addEventListener("click",()=>usePersonalText($("#generatedText").value));
    $("#replyForm").addEventListener("submit",event=>{event.preventDefault();generateReply();});$("#regenerateReply").addEventListener("click",generateReply);$("#copyReply").addEventListener("click",()=>{const value=$("#replyGeneratedText").value;const audit=renderReplyAudit(value,lastReplyContext);if(!audit.ok){showToast(t("replyAuditWarning"),3600);return;}copyText(value);});
    $("#replyIncoming").addEventListener("input",()=>{invalidateReplyDraft();clearTimeout(replyInsightTimer);replyInsightTimer=setTimeout(updateReplyInsight,120);});[$("#replyRelationship"),$("#replyTone"),$("#replyLength")].forEach(control=>control.addEventListener("change",()=>{invalidateReplyDraft();updateReplyInsight();}));$("#replyGeneratedText").addEventListener("input",()=>renderReplyAudit($("#replyGeneratedText").value,lastReplyContext));
    $("#ownTextToggle").addEventListener("click",()=>{const editor=$("#ownTextEditor");editor.hidden=!editor.hidden;$("#ownTextToggle").classList.toggle("is-open",!editor.hidden);$("#ownTextToggle").setAttribute("aria-expanded",String(!editor.hidden));});$("#useOwnText").addEventListener("click",()=>usePersonalText($("#ownText").value));
    $("#categoryRow").addEventListener("click",event=>{const button=event.target.closest("[data-category]");if(!button)return;selectedCategory=button.dataset.category;$$("#categoryRow button").forEach(item=>item.classList.toggle("is-active",item===button));renderLibrary();});
    $("#quoteList").addEventListener("click",event=>{const action=event.target.closest("[data-action]");const card=event.target.closest(".quote-card");if(!action||!card)return;const id=Number(card.dataset.id);if(action.dataset.action==="unlock")openPaywall();else if(action.dataset.action==="open")openQuoteById(id);else if(action.dataset.action==="copy"){const entry=LETTERS.find(item=>Number(item.id)===id);if(canAccess(entry))copyText(entryText(entry));else openPaywall();}});
    $("#languageButton").addEventListener("click",()=>{const order=["ru","en","fr"];lang=order[(order.indexOf(lang)+1)%order.length];applyLanguage();scheduleCloudSync();});$$('[data-lang]').forEach(button=>button.addEventListener("click",()=>{lang=button.dataset.lang;applyLanguage();scheduleCloudSync();}));
    $("#rainToggle").addEventListener("click",()=>{rainScene.setEnabled(!rainScene.enabled);showToast(rainScene.enabled?t("rainOn"):t("rainOff"));});$("#natureButton").addEventListener("click",toggleNature);$("#natureToggle").addEventListener("click",toggleNature);$("#weatherButton").addEventListener("click",()=>refreshWeather());$("#weatherToggle").addEventListener("click",toggleWeather);$("#fullscreenToggle").addEventListener("click",toggleFullscreen);
    $("#soundButton").addEventListener("click",()=>isMusicPlaying?pauseMusic():playMusic());$$('[data-track]').forEach(button=>button.addEventListener("click",()=>selectTrack(Number(button.dataset.track))));$("#customTrackButton").addEventListener("click",()=>$("#customTrackInput").click());$("#customTrackInput").addEventListener("change",async event=>{const file=event.target.files?.[0];if(!file)return;if(file.size>35*1024*1024)return showToast("Max 35 MB");customAudioBlob=file;$("#customTrackName").textContent=file.name;try{await saveMedia("audio",{blob:file,name:file.name});}catch{}await selectTrack(3);});
    $("#customBackgroundButton").addEventListener("click",()=>$("#customBackgroundInput").click());$("#customBackgroundInput").addEventListener("change",async event=>{const file=event.target.files?.[0];if(!file)return;if(file.size>18*1024*1024)return showToast(t("backgroundTooLarge"));try{const blob=await optimizeBackground(file);applyBackground(blob);await saveMedia("background",{blob});showToast(t("photoReady"));}catch{showToast(t("backgroundFail"));}});$("#resetBackgroundButton").addEventListener("click",resetBackground);
    $("#shareAppButton").addEventListener("click",shareApplication);$("#installButton").addEventListener("click",async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("#installButton").hidden=true;});
    $("#googleSignIn").addEventListener("click",()=>signInWithCloud("google"));$("#facebookSignIn").addEventListener("click",()=>signInWithCloud("facebook"));$("#accountSignOut").addEventListener("click",signOutCloud);$("#accountDelete").addEventListener("click",deleteCloudAccount);$("#accountAvatarButton").addEventListener("click",()=>$("#accountAvatarInput").click());$("#accountAvatarInput").addEventListener("change",selectAccountAvatar);$("#copyAccountId").addEventListener("click",copyAccountSupportId);$("#adminLookupForm").addEventListener("submit",lookupAdminAccount);$("#adminGrantVip").addEventListener("click",grantAdminVip);$("#adminRevokeVip").addEventListener("click",revokeAdminVip);
    document.addEventListener("keydown",event=>{if(event.key==="Escape"){pendingPremiumFeature="";const open=Object.values(layers).reverse().find(layer=>layer.classList.contains("is-open"));if(open===layers.paywall)closePaywall();else if(open)closePanel(open);}if(storyOpened&&!Object.values(layers).some(layer=>layer.classList.contains("is-open"))){if(event.key==="ArrowRight")moveLetter(1);if(event.key==="ArrowLeft")moveLetter(-1);}});
    addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;$("#installButton").hidden=false;});
    document.addEventListener("fullscreenchange",()=>{const active=Boolean(document.fullscreenElement);updateFullscreenControl();localStorage.setItem("nurFullscreen",active?"on":"off");localStorage.setItem(AUTO_FULLSCREEN_KEY,active?"on":"off");scheduleCloudSync();});
    document.addEventListener("visibilitychange",()=>{if(document.hidden)flushCloudSync(false);else if(cloudUser?.id)loadCloudAccount(cloudUser).catch(error=>console.info("Cloud account refresh failed",error));});
    addEventListener("online",()=>{detectCloudProviders();if(cloudUser?.id){loadCloudAccount(cloudUser).catch(error=>console.info("Cloud account refresh failed",error));if(cloudReady)flushCloudSync(false);else loadCloudProgress(cloudUser);}});
    addEventListener("offline",()=>setCloudStatus("cloudOffline"));
    addEventListener("hashchange",handleCapabilityNavigation);
    addEventListener("nur-entitlement",event=>{if(!trustedEntitlementSource)return;const data=event.detail||{};updatePremium(data.entitled??data.owned??false,data.priceLabel||data.price,data.reason);updatePurchaseConfiguration(data.purchaseConfigured);});
    addEventListener("pointermove",event=>{if(innerWidth<900||matchMedia("(prefers-reduced-motion: reduce)").matches)return;const x=(event.clientX/innerWidth-.5)*1.2;const y=(event.clientY/innerHeight-.5)*.8;$("#cinematicBg").style.translate=`${x}% ${y}%`;},{passive:true});
  }

  async function setupServiceWorker() {
    const hadController = Boolean(navigator.serviceWorker.controller);
    const registration = await navigator.serviceWorker.register("sw.js?v=19", { updateViaCache: "none" });
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
    const storedVolume=Number(localStorage.getItem("nurVolume")||.62);audio.volume=Number.isFinite(storedVolume)?Math.max(0,Math.min(storedVolume,1)):.62;
    await initializeBetaAccess();
    initializeCloudAuth().catch(()=>setCloudStatus("cloudUnavailable"));
    bindEvents();installAutomaticFullscreen();setNames(fromName,toName,{persist:!linkNamesActive,explicit:false});applyLanguage();renderLibrary();requestNativeEntitlement();
    if("serviceWorker" in navigator&&location.protocol.startsWith("http")&&location.hostname!=="appassets.androidplatform.net"){
      const registerServiceWorker=()=>setupServiceWorker().catch(()=>{});
      if(document.readyState==="complete")registerServiceWorker();else addEventListener("load",registerServiceWorker,{once:true});
    }
    try{const savedAudio=await loadMedia("audio");if(savedAudio?.blob){customAudioBlob=savedAudio.blob;$("#customTrackName").textContent=savedAudio.name||"Custom audio";}else if(selectedTrack===3)selectedTrack=0;}catch{if(selectedTrack===3)selectedTrack=0;}
    $$('[data-track]').forEach(option=>option.classList.toggle("is-active",Number(option.dataset.track)===selectedTrack||(selectedTrack===3&&option.id==="customTrackButton")));
    createAtmosphere();await setupBackground();
    if(params.get("compose")==="1")requestPremiumFeature("letter");else if(params.get("reply")==="1")requestPremiumFeature("reply");else if(params.get("library")==="1")openPanel(layers.library);
    renderWeather();
    if(weatherEnabled){const stale=!weatherSnapshot||Date.now()-Number(weatherSnapshot.updatedAt||0)>30*60*1000;if(stale)refreshWeather({silent:true});}
  }

  init();
})();
