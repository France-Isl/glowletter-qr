(() => {
  "use strict";

  if (window.GlowLetterMoments) return;

  const PEOPLE_TABLE = "glowletter_people";
  const MOMENTS_TABLE = "glowletter_moments";
  const LETTERS_TABLE = "glowletter_letters";
  const QR_TABLE = "glowletter_qr_links";
  const STORAGE_PREFIX = "glowletterMomentsV2:";
  const REMINDER_OPT_IN_PREFIX = "glowletterMomentsReminderOptInV1:";
  const REMINDER_DAYS = Object.freeze([7, 3, 1]);
  const LANGUAGES = Object.freeze(["ru", "en", "fr"]);
  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
  const RELATIONSHIPS = Object.freeze(["auto", "mother", "father", "spouse", "child", "sibling", "grandparent", "friend", "teacher", "universal"]);
  const TONES = Object.freeze(["auto", "loving", "romantic", "classic", "support", "gratitude"]);
  const LENGTHS = Object.freeze(["auto", "short", "standard", "detailed"]);
  const MOMENT_KINDS = Object.freeze(["birthday", "anniversary", "holiday", "meeting", "other"]);

  const TEXT = {
    ru: {
      eyebrow: "GLOWLETTER · ВАЖНЫЕ МОМЕНТЫ", title: "Люди, даты и письма", close: "Закрыть",
      peopleTab: "Люди", datesTab: "Даты", historyTab: "История", floristTab: "Флорист",
      peopleIntro: "Сохраните имя, отношение и любимый стиль письма.", addPerson: "＋ Добавить человека",
      noPeople: "Пока никого нет. Добавьте важного человека, чтобы готовить письма быстрее.",
      personName: "Имя", relationship: "Кем вам приходится", letterLanguage: "Язык письма", tone: "Стиль письма", length: "Обычная длина",
      savePerson: "Сохранить человека", cancel: "Отмена", edit: "Изменить", remove: "Удалить", write: "Написать письмо", addDate: "Добавить дату",
      personRequired: "Укажите имя.", deletePersonConfirm: "Удалить этого человека и локальные связи с ним?",
      datesIntro: "GlowLetter покажет важные даты за 7, 3 и 1 день.", reminderOptIn: "Показывать напоминания в GlowLetter",
      reminderOptInNote: "Напоминания проверяются при открытии приложения. Системные уведомления настраиваются мобильным приложением отдельно.",
      exportAll: "↓ Экспортировать календарь", newDate: "＋ Добавить дату", noDates: "Важных дат пока нет.",
      datePerson: "Человек", noPerson: "Без привязки", eventTitle: "Название события", eventKind: "Тип события", eventDate: "Дата",
      recurrence: "Повторение", annually: "Каждый год", once: "Один раз", timeZone: "Часовой пояс",
      remindBefore: "Напомнить заранее", days7: "за 7 дней", days3: "за 3 дня", days1: "за 1 день",
      saveDate: "Сохранить дату", exportIcs: "Календарь .ics", upcomingIn: "Через {days}", today: "Сегодня", past: "Дата прошла",
      reminderDue: "Пора подготовить письмо: до «{title}» осталось {days} дн.", deleteDateConfirm: "Удалить эту дату?",
      historyIntro: "Здесь остаются принятые письма и созданные для них QR-ссылки.",
      noHistory: "Созданных писем пока нет.", createQr: "Создать QR", openQr: "Открыть QR", revokeQr: "Отключить QR", readLetter: "Открыть письмо",
      qrActive: "QR активен", qrLocked: "Откроется {date}", qrRevoked: "QR отключён", qrExpired: "Срок QR закончился",
      deleteLetter: "Удалить", deleteLetterConfirm: "Удалить письмо из истории? Активную QR-ссылку сначала нужно отключить.",
      floristIntro: "Быстрый мастер: заполните данные клиента и продолжите в редакторе письма.",
      sender: "От кого", recipient: "Для кого", unlockAt: "Когда открыть письмо", floristDate: "Дата события", note: "Что важно сказать",
      notePlaceholder: "Например: поблагодарить за поддержку и пожелать спокойствия", continueComposer: "Продолжить в редакторе",
      senderPlaceholder: "Имя отправителя", recipientPlaceholder: "Имя получателя", floristRequired: "Укажите отправителя и получателя.",
      composerOpened: "Редактор письма открыт", saved: "Сохранено", saveFailedLocal: "Облако недоступно — изменения сохранены на этом устройстве.",
      cloudSynced: "Данные синхронизированы", cloudLoading: "Загружаю личные данные…", localMode: "Локальный режим", cloudNeeded: "Войдите в аккаунт, чтобы создать постоянный QR.",
      qrCreated: "Постоянный QR готов", qrCreateFailed: "Не удалось создать QR. Проверьте вход и интернет.", qrRevokedDone: "QR отключён", qrRevokeFailed: "Не удалось отключить QR.",
      sharedLoading: "Открываю письмо…", sharedLockedTitle: "Письмо ждёт своего момента", sharedLocked: "Оно откроется {date}.",
      sharedReady: "Письмо для вас", sharedUnavailable: "Эта ссылка недоступна или была отключена.", sharedOffline: "Для открытия письма нужен интернет.",
      fromLabel: "От", forLabel: "Для", sourceAi: "Помощник", sourceOwn: "Свой текст", sourceFlorist: "Флорист", sourceCatalog: "Коллекция", sourceUnknown: "Письмо",
      relationAuto: "Определить автоматически", relationMother: "Мама", relationFather: "Папа", relationSpouse: "Супруг или супруга", relationChild: "Сын или дочь", relationSibling: "Брат или сестра", relationGrandparent: "Бабушка или дедушка", relationFriend: "Друг или подруга", relationTeacher: "Учитель или наставник", relationUniversal: "Другой человек",
      toneAuto: "Подбирать автоматически", toneLoving: "Тёплый", toneRomantic: "Романтический · супругам", toneClassic: "Классический", toneSupport: "Поддержка", toneGratitude: "Благодарность",
      lengthAuto: "Подбирать автоматически", lengthShort: "Короткое", lengthStandard: "Среднее", lengthDetailed: "Подробное",
      kindBirthday: "День рождения", kindAnniversary: "Годовщина", kindHoliday: "Праздник", kindMeeting: "Встреча", kindOther: "Другое",
      languageRu: "Русский", languageEn: "English", languageFr: "Français", statusReady: "Готово", retry: "Повторить"
    },
    en: {
      eyebrow: "GLOWLETTER · IMPORTANT MOMENTS", title: "People, dates and letters", close: "Close",
      peopleTab: "People", datesTab: "Dates", historyTab: "History", floristTab: "Florist",
      peopleIntro: "Save a name, relationship, and preferred letter style.", addPerson: "＋ Add person",
      noPeople: "No one here yet. Add someone important to prepare letters faster.",
      personName: "Name", relationship: "Relationship", letterLanguage: "Letter language", tone: "Letter style", length: "Usual length",
      savePerson: "Save person", cancel: "Cancel", edit: "Edit", remove: "Delete", write: "Write a letter", addDate: "Add a date",
      personRequired: "Enter a name.", deletePersonConfirm: "Delete this person and local links to them?",
      datesIntro: "GlowLetter highlights important dates 7, 3, and 1 day ahead.", reminderOptIn: "Show reminders in GlowLetter",
      reminderOptInNote: "Reminders are checked when the app opens. System notifications are configured separately by the mobile app.",
      exportAll: "↓ Export calendar", newDate: "＋ Add date", noDates: "No important dates yet.",
      datePerson: "Person", noPerson: "No person", eventTitle: "Event name", eventKind: "Event type", eventDate: "Date",
      recurrence: "Repeat", annually: "Every year", once: "Once", timeZone: "Time zone",
      remindBefore: "Remind me", days7: "7 days before", days3: "3 days before", days1: "1 day before",
      saveDate: "Save date", exportIcs: ".ics calendar", upcomingIn: "In {days} days", today: "Today", past: "Past date",
      reminderDue: "Time to prepare a letter: {days} days until “{title}”.", deleteDateConfirm: "Delete this date?",
      historyIntro: "Accepted letters and their QR links stay here.", noHistory: "No created letters yet.",
      createQr: "Create QR", openQr: "Open QR", revokeQr: "Disable QR", readLetter: "Open letter",
      qrActive: "QR active", qrLocked: "Opens {date}", qrRevoked: "QR disabled", qrExpired: "QR expired",
      deleteLetter: "Delete", deleteLetterConfirm: "Delete this letter from history? Disable its active QR link first.",
      floristIntro: "A quick flow: enter the client details and continue in the letter editor.",
      sender: "From", recipient: "To", unlockAt: "Open the letter at", floristDate: "Event date", note: "What matters most",
      notePlaceholder: "For example: thank them for their support and wish them peace", continueComposer: "Continue in editor",
      senderPlaceholder: "Sender name", recipientPlaceholder: "Recipient name", floristRequired: "Enter the sender and recipient.",
      composerOpened: "Letter editor opened", saved: "Saved", saveFailedLocal: "Cloud unavailable — changes are saved on this device.",
      cloudSynced: "Data synced", cloudLoading: "Loading your private data…", localMode: "Local mode", cloudNeeded: "Sign in to create a permanent QR.",
      qrCreated: "Permanent QR is ready", qrCreateFailed: "Could not create the QR. Check your account and connection.", qrRevokedDone: "QR disabled", qrRevokeFailed: "Could not disable the QR.",
      sharedLoading: "Opening the letter…", sharedLockedTitle: "This letter is waiting for its moment", sharedLocked: "It will open {date}.",
      sharedReady: "A letter for you", sharedUnavailable: "This link is unavailable or has been disabled.", sharedOffline: "An internet connection is required to open this letter.",
      fromLabel: "From", forLabel: "To", sourceAi: "Assistant", sourceOwn: "Own text", sourceFlorist: "Florist", sourceCatalog: "Collection", sourceUnknown: "Letter",
      relationAuto: "Detect automatically", relationMother: "Mother", relationFather: "Father", relationSpouse: "Spouse", relationChild: "Son or daughter", relationSibling: "Brother or sister", relationGrandparent: "Grandparent", relationFriend: "Friend", relationTeacher: "Teacher or mentor", relationUniversal: "Someone else",
      toneAuto: "Choose automatically", toneLoving: "Warm", toneRomantic: "Romantic · spouses", toneClassic: "Classic", toneSupport: "Support", toneGratitude: "Gratitude",
      lengthAuto: "Choose automatically", lengthShort: "Short", lengthStandard: "Medium", lengthDetailed: "Detailed",
      kindBirthday: "Birthday", kindAnniversary: "Anniversary", kindHoliday: "Holiday", kindMeeting: "Meeting", kindOther: "Other",
      languageRu: "Русский", languageEn: "English", languageFr: "Français", statusReady: "Ready", retry: "Retry"
    },
    fr: {
      eyebrow: "GLOWLETTER · MOMENTS IMPORTANTS", title: "Personnes, dates et lettres", close: "Fermer",
      peopleTab: "Personnes", datesTab: "Dates", historyTab: "Historique", floristTab: "Fleuriste",
      peopleIntro: "Enregistrez un prénom, le lien et le style de lettre préféré.", addPerson: "＋ Ajouter une personne",
      noPeople: "Personne pour le moment. Ajoutez une personne importante pour préparer les lettres plus vite.",
      personName: "Prénom", relationship: "Lien", letterLanguage: "Langue de la lettre", tone: "Style de lettre", length: "Longueur habituelle",
      savePerson: "Enregistrer", cancel: "Annuler", edit: "Modifier", remove: "Supprimer", write: "Écrire une lettre", addDate: "Ajouter une date",
      personRequired: "Saisissez un prénom.", deletePersonConfirm: "Supprimer cette personne et les liens locaux associés ?",
      datesIntro: "GlowLetter signale les dates importantes 7, 3 et 1 jour à l’avance.", reminderOptIn: "Afficher les rappels dans GlowLetter",
      reminderOptInNote: "Les rappels sont vérifiés à l’ouverture de l’application. Les notifications système sont configurées séparément par l’application mobile.",
      exportAll: "↓ Exporter le calendrier", newDate: "＋ Ajouter une date", noDates: "Aucune date importante.",
      datePerson: "Personne", noPerson: "Sans personne", eventTitle: "Nom de l’événement", eventKind: "Type d’événement", eventDate: "Date",
      recurrence: "Répétition", annually: "Chaque année", once: "Une fois", timeZone: "Fuseau horaire",
      remindBefore: "Me rappeler", days7: "7 jours avant", days3: "3 jours avant", days1: "1 jour avant",
      saveDate: "Enregistrer la date", exportIcs: "Calendrier .ics", upcomingIn: "Dans {days} jours", today: "Aujourd’hui", past: "Date passée",
      reminderDue: "Il est temps de préparer une lettre : « {title} » est dans {days} jours.", deleteDateConfirm: "Supprimer cette date ?",
      historyIntro: "Les lettres acceptées et leurs liens QR restent ici.", noHistory: "Aucune lettre créée.",
      createQr: "Créer le QR", openQr: "Ouvrir le QR", revokeQr: "Désactiver le QR", readLetter: "Ouvrir la lettre",
      qrActive: "QR actif", qrLocked: "Ouverture le {date}", qrRevoked: "QR désactivé", qrExpired: "QR expiré",
      deleteLetter: "Supprimer", deleteLetterConfirm: "Supprimer cette lettre ? Désactivez d’abord son QR actif.",
      floristIntro: "Parcours rapide : saisissez les informations du client puis continuez dans l’éditeur.",
      sender: "De la part de", recipient: "Pour", unlockAt: "Ouvrir la lettre le", floristDate: "Date de l’événement", note: "L’idée essentielle",
      notePlaceholder: "Par exemple : remercier pour le soutien et souhaiter de la sérénité", continueComposer: "Continuer dans l’éditeur",
      senderPlaceholder: "Prénom de l’expéditeur", recipientPlaceholder: "Prénom du destinataire", floristRequired: "Saisissez l’expéditeur et le destinataire.",
      composerOpened: "Éditeur de lettre ouvert", saved: "Enregistré", saveFailedLocal: "Cloud indisponible — les changements restent sur cet appareil.",
      cloudSynced: "Données synchronisées", cloudLoading: "Chargement de vos données privées…", localMode: "Mode local", cloudNeeded: "Connectez-vous pour créer un QR permanent.",
      qrCreated: "Le QR permanent est prêt", qrCreateFailed: "Impossible de créer le QR. Vérifiez le compte et la connexion.", qrRevokedDone: "QR désactivé", qrRevokeFailed: "Impossible de désactiver le QR.",
      sharedLoading: "Ouverture de la lettre…", sharedLockedTitle: "Cette lettre attend son moment", sharedLocked: "Elle s’ouvrira le {date}.",
      sharedReady: "Une lettre pour vous", sharedUnavailable: "Ce lien est indisponible ou a été désactivé.", sharedOffline: "Une connexion internet est nécessaire pour ouvrir cette lettre.",
      fromLabel: "De", forLabel: "Pour", sourceAi: "Assistant", sourceOwn: "Texte personnel", sourceFlorist: "Fleuriste", sourceCatalog: "Collection", sourceUnknown: "Lettre",
      relationAuto: "Détecter automatiquement", relationMother: "Mère", relationFather: "Père", relationSpouse: "Époux ou épouse", relationChild: "Fils ou fille", relationSibling: "Frère ou sœur", relationGrandparent: "Grand-parent", relationFriend: "Ami ou amie", relationTeacher: "Professeur ou mentor", relationUniversal: "Une autre personne",
      toneAuto: "Choisir automatiquement", toneLoving: "Chaleureux", toneRomantic: "Romantique · époux", toneClassic: "Classique", toneSupport: "Soutien", toneGratitude: "Gratitude",
      lengthAuto: "Choisir automatiquement", lengthShort: "Courte", lengthStandard: "Moyenne", lengthDetailed: "Détaillée",
      kindBirthday: "Anniversaire", kindAnniversary: "Anniversaire de relation", kindHoliday: "Fête", kindMeeting: "Rencontre", kindOther: "Autre",
      languageRu: "Русский", languageEn: "English", languageFr: "Français", statusReady: "Prêt", retry: "Réessayer"
    }
  };

  const config = {
    getClient: () => null,
    getUser: () => null,
    getLanguage: () => "ru",
    translate: null,
    openComposer: null,
    openQr: null
  };

  const state = {
    initialized: false,
    loading: false,
    loaded: false,
    busy: false,
    language: "ru",
    user: null,
    client: null,
    activeTab: "people",
    people: [],
    moments: [],
    letters: [],
    qrLinks: [],
    root: null,
    previousFocus: null,
    previousOverflow: "",
    sharedMode: false,
    toastTimer: 0,
    statusKey: ""
  };

  function cleanText(value, max = 2000) {
    return String(value ?? "").normalize("NFKC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu, "").trim().slice(0, max);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function validLanguage(value) {
    return LANGUAGES.includes(value) ? value : "ru";
  }

  function validUuid(value) {
    const candidate = cleanText(value, 64).toLowerCase();
    return UUID_PATTERN.test(candidate) ? candidate : "";
  }

  function uuid() {
    if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const value = [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
    return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
  }

  function parseDateOnly(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/u);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day, 12));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return { year, month, day, date };
  }

  function datePartsAtNoon(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) return null;
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      date: new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12))
    };
  }

  function calendarDate(year, month, day) {
    if (month === 2 && day === 29) {
      const leap = new Date(Date.UTC(year, 1, 29, 12));
      if (leap.getUTCMonth() !== 1) return new Date(Date.UTC(year, 1, 28, 12));
    }
    return new Date(Date.UTC(year, month - 1, day, 12));
  }

  function isAnnual(moment) {
    return moment?.recurrence === "annual" || moment?.annual === true;
  }

  function nextOccurrence(momentOrDate, now = new Date()) {
    const moment = typeof momentOrDate === "string" ? { event_date: momentOrDate, recurrence: "once" } : (momentOrDate || {});
    const source = parseDateOnly(moment.event_date || moment.date);
    const today = datePartsAtNoon(now);
    if (!source || !today) return null;
    if (!isAnnual(moment)) {
      const daysUntil = Math.round((source.date - today.date) / 86400000);
      return { date: source.date, dateString: formatDateOnly(source.date), daysUntil, past: daysUntil < 0 };
    }
    let occurrence = calendarDate(today.year, source.month, source.day);
    if (occurrence < today.date) occurrence = calendarDate(today.year + 1, source.month, source.day);
    const daysUntil = Math.round((occurrence - today.date) / 86400000);
    return { date: occurrence, dateString: formatDateOnly(occurrence), daysUntil, past: false };
  }

  function reminderEnabled(moment, days) {
    const key = `remind_${days}d`;
    if (typeof moment?.[key] === "boolean") return moment[key];
    if (Array.isArray(moment?.reminder_days)) return moment.reminder_days.map(Number).includes(days);
    return true;
  }

  function getDueReminders(moment, now = new Date()) {
    const occurrence = nextOccurrence(moment, now);
    if (!occurrence || occurrence.past) return [];
    return REMINDER_DAYS
      .filter(days => reminderEnabled(moment, days) && occurrence.daysUntil === days)
      .map(days => ({ days, momentId: moment?.id || "", title: cleanText(moment?.title, 100), occurrence: occurrence.dateString }));
  }

  function formatDateOnly(date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  }

  function icsDate(value) {
    const parsed = parseDateOnly(value);
    return parsed ? `${parsed.year}${String(parsed.month).padStart(2, "0")}${String(parsed.day).padStart(2, "0")}` : "";
  }

  function nextIcsDate(value) {
    const parsed = parseDateOnly(value);
    if (!parsed) return "";
    const next = new Date(parsed.date.getTime() + 86400000);
    return `${next.getUTCFullYear()}${String(next.getUTCMonth() + 1).padStart(2, "0")}${String(next.getUTCDate()).padStart(2, "0")}`;
  }

  function escapeIcs(value) {
    return cleanText(value, 1200).replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(";", "\\;").replaceAll(",", "\\,");
  }

  function foldIcsLine(line) {
    const chunks = [];
    let remaining = String(line);
    while (remaining.length > 73) {
      chunks.push(remaining.slice(0, 73));
      remaining = remaining.slice(73);
    }
    chunks.push(remaining);
    return chunks.join("\r\n ");
  }

  function createIcs(moment, person = null, options = {}) {
    const start = icsDate(moment?.event_date);
    if (!start) return "";
    const title = cleanText(moment?.title || options.title || "GlowLetter", 100);
    const personName = cleanText(person?.display_name || person?.name, 60);
    const description = cleanText(options.description || (personName ? `${title} · ${personName}` : title), 400);
    const id = validUuid(moment?.id) || uuid();
    const stamp = new Date(options.now || Date.now()).toISOString().replace(/[-:]/gu, "").replace(/\.\d{3}Z$/u, "Z");
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GlowLetter//Moments//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT", `UID:${id}@glowletter`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${nextIcsDate(moment.event_date)}`,
      `SUMMARY:${escapeIcs(title)}`, `DESCRIPTION:${escapeIcs(description)}`
    ];
    if (isAnnual(moment)) lines.push("RRULE:FREQ=YEARLY");
    REMINDER_DAYS.filter(days => reminderEnabled(moment, days)).forEach(days => {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `TRIGGER:-P${days}D`, `DESCRIPTION:${escapeIcs(title)}`, "END:VALARM");
    });
    lines.push("END:VEVENT", "END:VCALENDAR", "");
    return lines.map(foldIcsLine).join("\r\n");
  }

  function tr(key, variables = {}) {
    const externalKey = `moments.${key}`;
    let value = "";
    if (typeof config.translate === "function") {
      try {
        const translated = config.translate(externalKey, variables, state.language);
        if (typeof translated === "string" && translated && translated !== externalKey && translated !== key) value = translated;
      } catch {}
    }
    if (!value) value = TEXT[state.language]?.[key] || TEXT.ru[key] || key;
    return String(value).replace(/\{([a-zA-Z0-9_]+)\}/gu, (_match, name) => variables[name] ?? `{${name}}`);
  }

  function normalizePerson(row = {}) {
    return {
      id: validUuid(row.id) || uuid(), user_id: validUuid(row.user_id),
      display_name: cleanText(row.display_name || row.name, 36),
      relationship: RELATIONSHIPS.includes(row.relationship) ? row.relationship : "auto",
      language: validLanguage(row.language), tone: TONES.includes(row.tone || row.style) ? (row.tone || row.style) : "auto",
      default_length: LENGTHS.includes(row.default_length) ? row.default_length : "auto",
      created_at: cleanText(row.created_at, 40) || new Date().toISOString(), updated_at: cleanText(row.updated_at, 40),
      _localOnly: row._localOnly === true
    };
  }

  function normalizeMoment(row = {}) {
    const reminderDays = Array.isArray(row.reminder_days) ? row.reminder_days.map(Number) : [];
    return {
      id: validUuid(row.id) || uuid(), user_id: validUuid(row.user_id), person_id: validUuid(row.person_id),
      title: cleanText(row.title, 100), kind: MOMENT_KINDS.includes(row.kind) ? row.kind : "other",
      event_date: parseDateOnly(row.event_date)?.date ? String(row.event_date).slice(0, 10) : "",
      recurrence: row.recurrence === "annual" || row.annual === true ? "annual" : "once",
      time_zone: cleanText(row.time_zone, 80) || localTimeZone(),
      remind_7d: typeof row.remind_7d === "boolean" ? row.remind_7d : (!reminderDays.length || reminderDays.includes(7)),
      remind_3d: typeof row.remind_3d === "boolean" ? row.remind_3d : (!reminderDays.length || reminderDays.includes(3)),
      remind_1d: typeof row.remind_1d === "boolean" ? row.remind_1d : (!reminderDays.length || reminderDays.includes(1)),
      created_at: cleanText(row.created_at, 40) || new Date().toISOString(), updated_at: cleanText(row.updated_at, 40),
      _localOnly: row._localOnly === true
    };
  }

  function normalizeLetter(row = {}) {
    return {
      id: validUuid(row.id) || uuid(), user_id: validUuid(row.user_id), person_id: validUuid(row.person_id), moment_id: validUuid(row.moment_id),
      source: cleanText(row.source, 32) || "own", text: cleanText(row.text || row.letter_text, 1800), language: validLanguage(row.language),
      tone: TONES.includes(row.tone) ? row.tone : "auto", sender_name_snapshot: cleanText(row.sender_name_snapshot || row.sender_name, 36),
      recipient_name_snapshot: cleanText(row.recipient_name_snapshot || row.recipient_name, 36), occasion_snapshot: cleanText(row.occasion_snapshot || row.note, 420),
      created_at: cleanText(row.created_at, 40) || new Date().toISOString(), updated_at: cleanText(row.updated_at, 40), _localOnly: row._localOnly === true
    };
  }

  function normalizeQrLink(row = {}) {
    return {
      id: validUuid(row.id) || uuid(), user_id: validUuid(row.user_id), public_id: validUuid(row.public_id), kind: cleanText(row.kind, 24) || "letter",
      letter_id: validUuid(row.letter_id), person_id: validUuid(row.person_id), status: cleanText(row.status, 24) || "active",
      unlock_at: cleanText(row.unlock_at, 40), expires_at: cleanText(row.expires_at, 40), created_at: cleanText(row.created_at, 40) || new Date().toISOString()
    };
  }

  function localTimeZone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; }
  }

  function accountKey() {
    return validUuid(state.user?.id) || "guest";
  }

  function cacheKey() {
    return `${STORAGE_PREFIX}${encodeURIComponent(accountKey())}`;
  }

  function readCache() {
    try {
      const parsed = JSON.parse(localStorage.getItem(cacheKey()) || "null");
      if (!parsed || typeof parsed !== "object") return null;
      return {
        people: Array.isArray(parsed.people) ? parsed.people.map(normalizePerson) : [],
        moments: Array.isArray(parsed.moments) ? parsed.moments.map(normalizeMoment) : [],
        letters: Array.isArray(parsed.letters) ? parsed.letters.map(normalizeLetter) : [],
        qrLinks: Array.isArray(parsed.qrLinks) ? parsed.qrLinks.map(normalizeQrLink) : []
      };
    } catch { return null; }
  }

  function writeCache() {
    try {
      localStorage.setItem(cacheKey(), JSON.stringify({
        people: state.people, moments: state.moments, letters: state.letters, qrLinks: state.qrLinks, updatedAt: new Date().toISOString()
      }));
      return true;
    } catch { return false; }
  }

  function reminderOptedIn() {
    return localStorage.getItem(`${REMINDER_OPT_IN_PREFIX}${encodeURIComponent(accountKey())}`) !== "off";
  }

  function setReminderOptIn(enabled) {
    localStorage.setItem(`${REMINDER_OPT_IN_PREFIX}${encodeURIComponent(accountKey())}`, enabled ? "on" : "off");
    window.dispatchEvent(new CustomEvent("glowletter-moments-reminder-change", { detail: { enabled: Boolean(enabled), moments: state.moments } }));
  }

  function safeClient() {
    try { return typeof config.getClient === "function" ? config.getClient() : null; } catch { return null; }
  }

  function firstRow(value) {
    const row = Array.isArray(value) ? value[0] : value;
    return row && typeof row === "object" ? row : null;
  }

  function mergeLocalOnly(remoteRows, localRows) {
    const remoteIds = new Set(remoteRows.map(row => row.id));
    return [...remoteRows, ...localRows.filter(row => row._localOnly && !remoteIds.has(row.id))];
  }

  async function fetchOwnerRows(table, normalizer, ascending = false) {
    if (!state.client || !validUuid(state.user?.id)) return { data: null, error: new Error("local") };
    try {
      const result = await state.client.from(table).select("*").eq("user_id", state.user.id).order("created_at", { ascending });
      if (result.error) return { data: null, error: result.error };
      return { data: (Array.isArray(result.data) ? result.data : []).map(normalizer), error: null };
    } catch (error) { return { data: null, error }; }
  }

  async function loadAll({ quiet = false } = {}) {
    if (state.loading) return;
    state.loading = true;
    const cached = readCache();
    if (cached) Object.assign(state, cached);
    if (!quiet) setStatus("cloudLoading");
    renderAll();
    state.client = await Promise.resolve(safeClient());
    if (!state.client || !validUuid(state.user?.id)) {
      state.loaded = true;
      state.loading = false;
      setStatus("localMode");
      renderAll();
      return;
    }
    const [people, moments, letters, qrLinks] = await Promise.all([
      fetchOwnerRows(PEOPLE_TABLE, normalizePerson, true), fetchOwnerRows(MOMENTS_TABLE, normalizeMoment, true),
      fetchOwnerRows(LETTERS_TABLE, normalizeLetter, false), fetchOwnerRows(QR_TABLE, normalizeQrLink, false)
    ]);
    let failed = false;
    if (!people.error) state.people = mergeLocalOnly(people.data, state.people); else failed = true;
    if (!moments.error) state.moments = mergeLocalOnly(moments.data, state.moments); else failed = true;
    if (!letters.error) state.letters = mergeLocalOnly(letters.data, state.letters); else failed = true;
    if (!qrLinks.error) state.qrLinks = qrLinks.data; else failed = true;
    state.loaded = true;
    state.loading = false;
    writeCache();
    setStatus(failed ? "saveFailedLocal" : "cloudSynced");
    renderAll();
  }

  function stripLocalFields(row) {
    return Object.fromEntries(Object.entries(row).filter(([key, value]) => !key.startsWith("_") && value !== undefined));
  }

  async function createOwnerRow(table, payload, normalizer, collectionName) {
    const local = normalizer({ ...payload, id: validUuid(payload.id) || uuid(), user_id: validUuid(state.user?.id), created_at: new Date().toISOString(), _localOnly: true });
    let saved = local;
    if (state.client && validUuid(state.user?.id)) {
      try {
        const result = await state.client.from(table).insert(stripLocalFields({ ...payload, id: local.id, user_id: state.user.id })).select("*").single();
        if (!result.error && result.data) saved = normalizer(result.data);
      } catch {}
    }
    state[collectionName] = [saved, ...state[collectionName].filter(item => item.id !== saved.id)];
    writeCache();
    renderAll();
    if (saved._localOnly) showToast("saveFailedLocal"); else showToast("saved");
    return saved;
  }

  async function updateOwnerRow(table, id, payload, normalizer, collectionName) {
    const existing = state[collectionName].find(item => item.id === id);
    if (!existing) return null;
    let saved = normalizer({ ...existing, ...payload, updated_at: new Date().toISOString(), _localOnly: existing._localOnly });
    if (state.client && validUuid(state.user?.id) && !existing._localOnly) {
      try {
        const result = await state.client.from(table).update(stripLocalFields(payload)).eq("id", id).eq("user_id", state.user.id).select("*").maybeSingle();
        if (!result.error && result.data) saved = normalizer(result.data);
        else saved._localOnly = true;
      } catch { saved._localOnly = true; }
    }
    state[collectionName] = state[collectionName].map(item => item.id === id ? saved : item);
    writeCache();
    renderAll();
    showToast(saved._localOnly ? "saveFailedLocal" : "saved");
    return saved;
  }

  async function deleteOwnerRow(table, id, collectionName) {
    const existing = state[collectionName].find(item => item.id === id);
    if (!existing) return true;
    if (state.client && validUuid(state.user?.id) && !existing._localOnly) {
      try {
        const result = await state.client.from(table).delete().eq("id", id).eq("user_id", state.user.id);
        if (result.error) { showToast("saveFailedLocal"); return false; }
      } catch { showToast("saveFailedLocal"); return false; }
    }
    state[collectionName] = state[collectionName].filter(item => item.id !== id);
    writeCache();
    renderAll();
    return true;
  }

  function ensureStyles() {
    if (document.querySelector('link[data-glowletter-moments-style],style[data-glowletter-moments-style]')) return;
    const current = document.currentScript?.src || [...document.scripts].find(script => /(?:^|\/)moments\.js(?:\?|$)/u.test(script.src))?.src || "";
    const href = current ? new URL("moments.css", current).toString() : "moments.css";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.glowletterMomentsStyle = "true";
    document.head.append(link);
  }

  function ensureDom() {
    if (state.root?.isConnected) return state.root;
    const existingRoot = document.getElementById("momentsLayer");
    if (existingRoot) {
      state.root = existingRoot;
      bindDomEvents();
      return existingRoot;
    }
    const root = document.createElement("div");
    root.id = "momentsLayer";
    root.className = "glm-layer";
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <button class="glm-backdrop" id="momentsBackdrop" type="button" data-action="close" aria-label=""></button>
      <section class="glm-panel" role="dialog" aria-modal="true" aria-labelledby="momentsTitle">
        <header class="glm-header">
          <div><p class="glm-eyebrow" data-i18n="eyebrow"></p><h2 id="momentsTitle" data-i18n="title"></h2></div>
          <button class="glm-close" id="momentsClose" type="button" data-action="close" aria-label="">×</button>
        </header>
        <p class="glm-sync-status" id="momentsSyncStatus" role="status" aria-live="polite"></p>
        <div class="glm-tabs" id="momentsTabs" role="tablist">
          <button type="button" role="tab" data-tab="people" aria-controls="momentsPeoplePane"><span>♡</span><b data-i18n="peopleTab"></b></button>
          <button type="button" role="tab" data-tab="dates" aria-controls="momentsDatesPane"><span>◷</span><b data-i18n="datesTab"></b></button>
          <button type="button" role="tab" data-tab="history" aria-controls="momentsHistoryPane"><span>✉</span><b data-i18n="historyTab"></b></button>
          <button type="button" role="tab" data-tab="florist" aria-controls="momentsFloristPane"><span>✿</span><b data-i18n="floristTab"></b></button>
        </div>
        <div class="glm-content" id="momentsContent">
          <section class="glm-pane" id="momentsPeoplePane" role="tabpanel" data-pane="people">
            <div class="glm-intro"><p data-i18n="peopleIntro"></p><button type="button" data-action="person-new" data-i18n="addPerson"></button></div>
            <form class="glm-form" id="momentsPersonForm" hidden>
              <input id="momentsPersonId" type="hidden" />
              <label class="glm-wide"><span data-i18n="personName"></span><input id="momentsPersonDisplayName" type="text" maxlength="36" autocomplete="off" required /></label>
              <div class="glm-form-grid">
                <label><span data-i18n="relationship"></span><select id="momentsPersonRelationship"></select></label>
                <label><span data-i18n="letterLanguage"></span><select id="momentsPersonLanguage"></select></label>
                <label><span data-i18n="tone"></span><select id="momentsPersonTone"></select></label>
                <label><span data-i18n="length"></span><select id="momentsPersonLength"></select></label>
              </div>
              <p class="glm-form-error" id="momentsPersonError" role="alert" hidden></p>
              <div class="glm-form-actions"><button class="glm-primary" type="submit" data-i18n="savePerson"></button><button type="button" data-action="person-cancel" data-i18n="cancel"></button></div>
            </form>
            <div class="glm-list" id="momentsPeopleList"></div>
          </section>
          <section class="glm-pane" id="momentsDatesPane" role="tabpanel" data-pane="dates" hidden>
            <div class="glm-intro"><p data-i18n="datesIntro"></p><button type="button" data-action="date-new" data-i18n="newDate"></button></div>
            <label class="glm-opt-in"><input id="momentsReminderOptIn" type="checkbox" /><span><strong data-i18n="reminderOptIn"></strong><small data-i18n="reminderOptInNote"></small></span></label>
            <button class="glm-calendar-all" id="momentsExportAllIcs" type="button" data-action="ics-all" data-i18n="exportAll"></button>
            <div class="glm-due" id="momentsDueReminders" hidden></div>
            <form class="glm-form" id="momentsDateForm" hidden>
              <input id="momentsDateId" type="hidden" />
              <div class="glm-form-grid">
                <label><span data-i18n="datePerson"></span><select id="momentsDatePerson"></select></label>
                <label><span data-i18n="eventKind"></span><select id="momentsDateKind"></select></label>
                <label class="glm-wide"><span data-i18n="eventTitle"></span><input id="momentsDateTitle" type="text" maxlength="100" required /></label>
                <label><span data-i18n="eventDate"></span><input id="momentsEventDate" type="date" required /></label>
                <label><span data-i18n="recurrence"></span><select id="momentsRecurrence"><option value="annual"></option><option value="once"></option></select></label>
                <label class="glm-wide"><span data-i18n="timeZone"></span><input id="momentsTimeZone" type="text" maxlength="80" /></label>
              </div>
              <fieldset class="glm-reminders"><legend data-i18n="remindBefore"></legend>
                <label><input id="momentsRemind7d" type="checkbox" checked /><span data-i18n="days7"></span></label>
                <label><input id="momentsRemind3d" type="checkbox" checked /><span data-i18n="days3"></span></label>
                <label><input id="momentsRemind1d" type="checkbox" checked /><span data-i18n="days1"></span></label>
              </fieldset>
              <div class="glm-form-actions"><button class="glm-primary" type="submit" data-i18n="saveDate"></button><button type="button" data-action="date-cancel" data-i18n="cancel"></button></div>
            </form>
            <div class="glm-list" id="momentsDatesList"></div>
          </section>
          <section class="glm-pane" id="momentsHistoryPane" role="tabpanel" data-pane="history" hidden>
            <div class="glm-intro glm-intro-single"><p data-i18n="historyIntro"></p></div>
            <div class="glm-list" id="momentsHistoryList"></div>
          </section>
          <section class="glm-pane" id="momentsFloristPane" role="tabpanel" data-pane="florist" hidden>
            <div class="glm-intro glm-intro-single"><p data-i18n="floristIntro"></p></div>
            <form class="glm-form glm-florist" id="momentsFloristForm">
              <div class="glm-florist-route" aria-hidden="true"><span>✦</span><i>→</i><span>♡</span></div>
              <div class="glm-form-grid">
                <label><span data-i18n="sender"></span><input id="momentsFloristSender" type="text" maxlength="36" required /></label>
                <label><span data-i18n="recipient"></span><input id="momentsFloristRecipient" type="text" maxlength="36" required /></label>
                <label><span data-i18n="letterLanguage"></span><select id="momentsFloristLanguage"></select></label>
                <label><span data-i18n="unlockAt"></span><input id="momentsFloristUnlockAt" type="datetime-local" /></label>
                <label><span data-i18n="floristDate"></span><input id="momentsFloristEventDate" type="date" /></label>
                <label class="glm-wide"><span data-i18n="note"></span><textarea id="momentsFloristNote" rows="5" maxlength="420"></textarea></label>
              </div>
              <p class="glm-form-error" id="momentsFloristError" role="alert" hidden></p>
              <button class="glm-primary glm-submit-wide" type="submit" data-i18n="continueComposer"></button>
            </form>
          </section>
        </div>
        <section class="glm-shared" id="momentsSharedView" hidden aria-live="polite">
          <div class="glm-shared-mark" aria-hidden="true">♡</div>
          <p class="glm-shared-status" id="momentsSharedStatus" role="status" aria-live="polite"></p>
          <h3 id="momentsSharedTitle"></h3>
          <p class="glm-shared-route" id="momentsSharedRoute"></p>
          <div class="glm-shared-letter" id="momentsSharedLetter" hidden></div>
          <time id="momentsSharedUnlock"></time>
        </section>
        <div class="glm-toast" id="momentsToast" role="status" aria-live="polite"></div>
      </section>`;
    document.body.append(root);
    state.root = root;
    bindDomEvents();
    return root;
  }

  function query(selector) {
    return state.root?.querySelector(selector) || null;
  }

  function setStatus(key = "") {
    state.statusKey = key;
    const node = query("#momentsSyncStatus");
    if (node) node.textContent = key ? tr(key) : "";
  }

  function showToast(key, variables = {}) {
    const node = query("#momentsToast");
    if (!node) return;
    clearTimeout(state.toastTimer);
    node.textContent = tr(key, variables);
    node.classList.add("is-visible");
    state.toastTimer = setTimeout(() => node.classList.remove("is-visible"), 3000);
  }

  function optionMarkup(items, selected) {
    return items.map(([value, label]) => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`).join("");
  }

  function relationshipOptions() {
    const keys = { auto: "relationAuto", mother: "relationMother", father: "relationFather", spouse: "relationSpouse", child: "relationChild", sibling: "relationSibling", grandparent: "relationGrandparent", friend: "relationFriend", teacher: "relationTeacher", universal: "relationUniversal" };
    return RELATIONSHIPS.map(value => [value, tr(keys[value])]);
  }

  function toneOptions() {
    const keys = { auto: "toneAuto", loving: "toneLoving", romantic: "toneRomantic", classic: "toneClassic", support: "toneSupport", gratitude: "toneGratitude" };
    return TONES.map(value => [value, tr(keys[value])]);
  }

  function lengthOptions() {
    const keys = { auto: "lengthAuto", short: "lengthShort", standard: "lengthStandard", detailed: "lengthDetailed" };
    return LENGTHS.map(value => [value, tr(keys[value])]);
  }

  function languageOptions() {
    return [["ru", tr("languageRu")], ["en", tr("languageEn")], ["fr", tr("languageFr")]];
  }

  function kindOptions() {
    const keys = { birthday: "kindBirthday", anniversary: "kindAnniversary", holiday: "kindHoliday", meeting: "kindMeeting", other: "kindOther" };
    return MOMENT_KINDS.map(value => [value, tr(keys[value])]);
  }

  function refreshSelects() {
    const values = selector => query(selector)?.value || "";
    const personRelationship = values("#momentsPersonRelationship") || "auto";
    const personLanguage = values("#momentsPersonLanguage") || state.language;
    const personTone = values("#momentsPersonTone") || "auto";
    const personLength = values("#momentsPersonLength") || "auto";
    const floristLanguage = values("#momentsFloristLanguage") || state.language;
    const dateKind = values("#momentsDateKind") || "birthday";
    const datePerson = values("#momentsDatePerson");
    query("#momentsPersonRelationship").innerHTML = optionMarkup(relationshipOptions(), personRelationship);
    query("#momentsPersonLanguage").innerHTML = optionMarkup(languageOptions(), personLanguage);
    query("#momentsPersonTone").innerHTML = optionMarkup(toneOptions(), personTone);
    query("#momentsPersonLength").innerHTML = optionMarkup(lengthOptions(), personLength);
    query("#momentsFloristLanguage").innerHTML = optionMarkup(languageOptions(), floristLanguage);
    query("#momentsDateKind").innerHTML = optionMarkup(kindOptions(), dateKind);
    const people = [["", tr("noPerson")], ...state.people.slice().sort((a, b) => a.display_name.localeCompare(b.display_name, state.language)).map(person => [person.id, person.display_name])];
    query("#momentsDatePerson").innerHTML = optionMarkup(people, datePerson);
    const recurrence = query("#momentsRecurrence");
    if (recurrence) {
      const current = recurrence.value || "annual";
      recurrence.innerHTML = optionMarkup([["annual", tr("annually")], ["once", tr("once")]], current);
    }
  }

  function applyLanguage() {
    if (!state.root) return;
    state.root.lang = state.language;
    state.root.querySelectorAll("[data-i18n]").forEach(node => { node.textContent = tr(node.dataset.i18n); });
    query("#momentsBackdrop")?.setAttribute("aria-label", tr("close"));
    query("#momentsClose")?.setAttribute("aria-label", tr("close"));
    const name = query("#momentsPersonDisplayName"); if (name) name.placeholder = tr("personName");
    const sender = query("#momentsFloristSender"); if (sender) sender.placeholder = tr("senderPlaceholder");
    const recipient = query("#momentsFloristRecipient"); if (recipient) recipient.placeholder = tr("recipientPlaceholder");
    const note = query("#momentsFloristNote"); if (note) note.placeholder = tr("notePlaceholder");
    refreshSelects();
    if (state.statusKey) setStatus(state.statusKey);
  }

  function personById(id) {
    return state.people.find(person => person.id === id) || null;
  }

  function sourceLabel(source) {
    return tr(({ ai: "sourceAi", own: "sourceOwn", florist: "sourceFlorist", catalog: "sourceCatalog" })[source] || "sourceUnknown");
  }

  function formatDisplayDate(value, withTime = false) {
    if (!value) return "";
    const parsed = withTime ? new Date(value) : parseDateOnly(String(value).slice(0, 10))?.date;
    if (!parsed || !Number.isFinite(parsed.getTime())) return "";
    try {
      return new Intl.DateTimeFormat(state.language, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "long", timeZone: "UTC" }).format(parsed);
    } catch { return String(value); }
  }

  function renderTabs() {
    state.root.querySelectorAll("[data-tab]").forEach(button => {
      const active = button.dataset.tab === state.activeTab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    state.root.querySelectorAll("[data-pane]").forEach(pane => { pane.hidden = pane.dataset.pane !== state.activeTab; });
  }

  function renderPeople() {
    const list = query("#momentsPeopleList");
    if (!list) return;
    const people = state.people.slice().sort((a, b) => a.display_name.localeCompare(b.display_name, state.language));
    if (!people.length) { list.innerHTML = `<div class="glm-empty"><span>♡</span><p>${escapeHtml(tr("noPeople"))}</p></div>`; return; }
    list.innerHTML = people.map(person => `
      <article class="glm-card glm-person-card" data-id="${person.id}">
        <div class="glm-avatar" aria-hidden="true">${escapeHtml(person.display_name.slice(0, 1).toLocaleUpperCase(state.language) || "♡")}</div>
        <div class="glm-card-main"><h3>${escapeHtml(person.display_name)}</h3><p>${escapeHtml(relationshipOptions().find(([value]) => value === person.relationship)?.[1] || tr("relationUniversal"))} · ${escapeHtml(languageOptions().find(([value]) => value === person.language)?.[1] || person.language)} · ${escapeHtml(toneOptions().find(([value]) => value === person.tone)?.[1] || tr("toneAuto"))}</p></div>
        <div class="glm-card-actions"><button type="button" data-action="person-compose" data-id="${person.id}">${escapeHtml(tr("write"))}</button><button type="button" data-action="person-date" data-id="${person.id}">${escapeHtml(tr("addDate"))}</button><button type="button" data-action="person-edit" data-id="${person.id}">${escapeHtml(tr("edit"))}</button><button class="glm-danger" type="button" data-action="person-delete" data-id="${person.id}">${escapeHtml(tr("remove"))}</button></div>
      </article>`).join("");
  }

  function upcomingLabel(occurrence) {
    if (!occurrence) return tr("past");
    if (occurrence.daysUntil === 0) return tr("today");
    if (occurrence.daysUntil < 0) return tr("past");
    return tr("upcomingIn", { days: occurrence.daysUntil });
  }

  function renderDueReminders() {
    const holder = query("#momentsDueReminders");
    if (!holder) return;
    const due = reminderOptedIn() ? state.moments.flatMap(moment => getDueReminders(moment).map(reminder => ({ ...reminder, moment }))) : [];
    holder.hidden = !due.length;
    holder.innerHTML = due.map(item => `<button type="button" data-action="date-compose" data-id="${item.moment.id}"><span>◷</span><b>${escapeHtml(tr("reminderDue", { title: item.moment.title, days: item.days }))}</b><i>→</i></button>`).join("");
  }

  function renderDates() {
    const list = query("#momentsDatesList");
    if (!list) return;
    query("#momentsReminderOptIn").checked = reminderOptedIn();
    renderDueReminders();
    const moments = state.moments.map(moment => ({ moment, occurrence: nextOccurrence(moment) })).sort((a, b) => (a.occurrence?.daysUntil ?? 999999) - (b.occurrence?.daysUntil ?? 999999));
    if (!moments.length) { list.innerHTML = `<div class="glm-empty"><span>◷</span><p>${escapeHtml(tr("noDates"))}</p></div>`; return; }
    list.innerHTML = moments.map(({ moment, occurrence }) => {
      const person = personById(moment.person_id);
      const reminderText = REMINDER_DAYS.filter(days => reminderEnabled(moment, days)).join(" · ");
      return `<article class="glm-card glm-date-card" data-id="${moment.id}">
        <time datetime="${escapeHtml(occurrence?.dateString || moment.event_date)}"><b>${escapeHtml(String((occurrence?.date || parseDateOnly(moment.event_date)?.date)?.getUTCDate() || "—").padStart(2, "0"))}</b><span>${escapeHtml(formatDisplayDate(occurrence?.dateString || moment.event_date).split(" ").slice(1).join(" "))}</span></time>
        <div class="glm-card-main"><h3>${escapeHtml(moment.title)}</h3><p>${escapeHtml(person?.display_name || tr("noPerson"))} · ${escapeHtml(upcomingLabel(occurrence))}</p><small>${escapeHtml(isAnnual(moment) ? tr("annually") : tr("once"))} · ${escapeHtml(reminderText ? `${reminderText} d` : "—")}</small></div>
        <div class="glm-card-actions"><button type="button" data-action="date-compose" data-id="${moment.id}">${escapeHtml(tr("write"))}</button><button type="button" data-action="date-ics" data-id="${moment.id}">${escapeHtml(tr("exportIcs"))}</button><button type="button" data-action="date-edit" data-id="${moment.id}">${escapeHtml(tr("edit"))}</button><button class="glm-danger" type="button" data-action="date-delete" data-id="${moment.id}">${escapeHtml(tr("remove"))}</button></div>
      </article>`;
    }).join("");
  }

  function qrForLetter(letterId) {
    return state.qrLinks.find(link => link.letter_id === letterId && !["revoked", "expired"].includes(link.status)) || state.qrLinks.find(link => link.letter_id === letterId) || null;
  }

  function qrStatus(link) {
    if (!link) return "";
    if (link.status === "revoked") return tr("qrRevoked");
    if (link.status === "expired" || (link.expires_at && Date.parse(link.expires_at) <= Date.now())) return tr("qrExpired");
    if (link.unlock_at && Date.parse(link.unlock_at) > Date.now()) return tr("qrLocked", { date: formatDisplayDate(link.unlock_at, true) });
    return tr("qrActive");
  }

  function renderHistory() {
    const list = query("#momentsHistoryList");
    if (!list) return;
    const letters = state.letters.slice().sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    if (!letters.length) { list.innerHTML = `<div class="glm-empty"><span>✉</span><p>${escapeHtml(tr("noHistory"))}</p></div>`; return; }
    list.innerHTML = letters.map(letter => {
      const link = qrForLetter(letter.id);
      const active = link && !["revoked", "expired"].includes(link.status);
      return `<article class="glm-card glm-history-card" data-id="${letter.id}">
        <div class="glm-history-top"><span>${escapeHtml(sourceLabel(letter.source))}</span><time>${escapeHtml(formatDisplayDate(letter.created_at, true))}</time></div>
        <div class="glm-card-main"><h3>${escapeHtml(letter.recipient_name_snapshot || personById(letter.person_id)?.display_name || tr("sourceUnknown"))}</h3><p>${escapeHtml(letter.text.slice(0, 230))}${letter.text.length > 230 ? "…" : ""}</p>${link ? `<small class="glm-qr-state ${escapeHtml(link.status)}">▦ ${escapeHtml(qrStatus(link))}</small>` : ""}</div>
        <div class="glm-card-actions"><button type="button" data-action="letter-open" data-id="${letter.id}">${escapeHtml(tr("readLetter"))}</button>${active ? `<button type="button" data-action="qr-open" data-id="${link.id}">${escapeHtml(tr("openQr"))}</button><button type="button" data-action="qr-revoke" data-id="${link.id}">${escapeHtml(tr("revokeQr"))}</button>` : `<button type="button" data-action="qr-create" data-id="${letter.id}">${escapeHtml(tr("createQr"))}</button>`}<button class="glm-danger" type="button" data-action="letter-delete" data-id="${letter.id}">${escapeHtml(tr("deleteLetter"))}</button></div>
      </article>`;
    }).join("");
  }

  function renderAll() {
    if (!state.root) return;
    applyLanguage();
    renderTabs();
    renderPeople();
    renderDates();
    renderHistory();
  }

  function showForm(selector, show = true) {
    const form = query(selector);
    if (!form) return;
    form.hidden = !show;
    if (show) requestAnimationFrame(() => form.querySelector("input:not([type='hidden']),select,textarea")?.focus({ preventScroll: true }));
  }

  function resetPersonForm(person = null) {
    query("#momentsPersonId").value = person?.id || "";
    query("#momentsPersonDisplayName").value = person?.display_name || "";
    query("#momentsPersonRelationship").value = person?.relationship || "auto";
    query("#momentsPersonLanguage").value = person?.language || state.language;
    query("#momentsPersonTone").value = person?.tone || "auto";
    query("#momentsPersonLength").value = person?.default_length || "auto";
    query("#momentsPersonError").hidden = true;
  }

  function resetDateForm(moment = null, personId = "") {
    query("#momentsDateId").value = moment?.id || "";
    query("#momentsDatePerson").value = moment?.person_id || personId || "";
    query("#momentsDateTitle").value = moment?.title || "";
    query("#momentsDateKind").value = moment?.kind || "birthday";
    query("#momentsEventDate").value = moment?.event_date || "";
    query("#momentsRecurrence").value = moment?.recurrence || "annual";
    query("#momentsTimeZone").value = moment?.time_zone || localTimeZone();
    query("#momentsRemind7d").checked = moment?.remind_7d !== false;
    query("#momentsRemind3d").checked = moment?.remind_3d !== false;
    query("#momentsRemind1d").checked = moment?.remind_1d !== false;
  }

  async function submitPerson(event) {
    event.preventDefault();
    const id = validUuid(query("#momentsPersonId").value);
    const payload = {
      display_name: cleanText(query("#momentsPersonDisplayName").value, 36), relationship: query("#momentsPersonRelationship").value,
      language: validLanguage(query("#momentsPersonLanguage").value), tone: query("#momentsPersonTone").value,
      default_length: query("#momentsPersonLength").value
    };
    if (!payload.display_name) { const error = query("#momentsPersonError"); error.textContent = tr("personRequired"); error.hidden = false; return; }
    if (id) await updateOwnerRow(PEOPLE_TABLE, id, payload, normalizePerson, "people");
    else await createOwnerRow(PEOPLE_TABLE, payload, normalizePerson, "people");
    resetPersonForm(); showForm("#momentsPersonForm", false);
  }

  async function submitDate(event) {
    event.preventDefault();
    const id = validUuid(query("#momentsDateId").value);
    const payload = {
      person_id: validUuid(query("#momentsDatePerson").value) || null, title: cleanText(query("#momentsDateTitle").value, 100),
      kind: MOMENT_KINDS.includes(query("#momentsDateKind").value) ? query("#momentsDateKind").value : "other",
      event_date: query("#momentsEventDate").value, recurrence: query("#momentsRecurrence").value === "annual" ? "annual" : "once",
      time_zone: cleanText(query("#momentsTimeZone").value, 80) || localTimeZone(),
      remind_7d: query("#momentsRemind7d").checked, remind_3d: query("#momentsRemind3d").checked, remind_1d: query("#momentsRemind1d").checked
    };
    if (!payload.title || !parseDateOnly(payload.event_date)) return;
    if (id) await updateOwnerRow(MOMENTS_TABLE, id, payload, normalizeMoment, "moments");
    else await createOwnerRow(MOMENTS_TABLE, payload, normalizeMoment, "moments");
    resetDateForm(); showForm("#momentsDateForm", false);
  }

  function composerPayloadForPerson(person, extra = {}) {
    return {
      mode: extra.mode || "person", source: extra.source || "ai", personId: person?.id || "", momentId: extra.moment?.id || "",
      sender: cleanText(extra.sender, 36), recipient: cleanText(extra.recipient || person?.display_name, 36),
      language: validLanguage(extra.language || person?.language || state.language), relationship: person?.relationship || "auto",
      tone: person?.tone || "auto", length: person?.default_length || "auto", note: cleanText(extra.note || extra.moment?.title, 420),
      eventDate: extra.eventDate || extra.moment?.event_date || "", unlockAt: extra.unlockAt || ""
    };
  }

  async function invokeComposer(payload) {
    if (typeof config.openComposer !== "function") return null;
    let completed = false;
    const complete = async value => {
      if (completed) return null;
      const text = cleanText(typeof value === "string" ? value : (value?.text || value?.letter_text), 1800);
      if (!text) return null;
      completed = true;
      const letter = await recordLetter({ ...payload, ...(typeof value === "object" ? value : {}), text });
      if (payload.createQrAfterUse && letter) await createQrForLetter(letter, { unlockAt: payload.unlockAt });
      return letter;
    };
    const request = { ...payload, onComplete: complete };
    try {
      const result = await Promise.resolve(config.openComposer(request));
      if (result) await complete(result);
      showToast("composerOpened");
      return result;
    } catch { return null; }
  }

  async function submitFlorist(event) {
    event.preventDefault();
    const sender = cleanText(query("#momentsFloristSender").value, 36);
    const recipient = cleanText(query("#momentsFloristRecipient").value, 36);
    if (!sender || !recipient) { const error = query("#momentsFloristError"); error.textContent = tr("floristRequired"); error.hidden = false; return; }
    query("#momentsFloristError").hidden = true;
    const unlockValue = query("#momentsFloristUnlockAt").value;
    const unlockAt = unlockValue && Number.isFinite(new Date(unlockValue).getTime()) ? new Date(unlockValue).toISOString() : "";
    await invokeComposer(composerPayloadForPerson(null, {
      mode: "florist", source: "florist", sender, recipient, language: query("#momentsFloristLanguage").value,
      unlockAt, eventDate: query("#momentsFloristEventDate").value, note: query("#momentsFloristNote").value, createQrAfterUse: true
    }));
  }

  async function recordLetter(value = {}) {
    const table = "glowletter_letters";
    const text = cleanText(value.text || value.letter_text, 1800);
    if (!text) return null;
    const payload = {
      person_id: validUuid(value.personId || value.person_id) || null, moment_id: validUuid(value.momentId || value.moment_id) || null,
      source: cleanText(value.source, 32) || "own", text, language: validLanguage(value.language), tone: TONES.includes(value.tone) ? value.tone : "auto",
      sender_name_snapshot: cleanText(value.sender || value.sender_name_snapshot, 36), recipient_name_snapshot: cleanText(value.recipient || value.recipient_name_snapshot, 36),
      occasion_snapshot: cleanText(value.note || value.occasion_snapshot, 420)
    };
    return createOwnerRow(table, payload, normalizeLetter, "letters");
  }

  function publicMomentUrl(publicId) {
    const appConfig = window.NUR_APP_CONFIG || {};
    const base = new URL(appConfig.publicShareUrl || `${location.origin}${location.pathname}`, location.href);
    base.search = ""; base.hash = "";
    base.searchParams.set("moment", publicId);
    return base.toString();
  }

  async function createQrForLetter(letterOrId, options = {}) {
    const letter = typeof letterOrId === "string" ? state.letters.find(item => item.id === letterOrId) : letterOrId;
    state.client = await Promise.resolve(safeClient());
    if (!letter || !state.client || !validUuid(state.user?.id)) { showToast("cloudNeeded"); return null; }
    const unlockAt = cleanText(options.unlockAt || options.unlock_at, 40) || null;
    try {
      const result = await state.client.rpc("glowletter_create_qr_link", {
        p_kind: "letter", p_letter_id: letter.id, p_person_id: letter.person_id || null,
        p_unlock_at: unlockAt, p_expires_at: null
      });
      if (result.error) throw result.error;
      const raw = firstRow(result.data);
      if (!raw || !validUuid(raw.public_id)) throw new Error("invalid qr response");
      const link = normalizeQrLink({ ...raw, user_id: state.user.id, kind: "letter", letter_id: letter.id, person_id: letter.person_id, status: raw.status || "active" });
      state.qrLinks = [link, ...state.qrLinks.filter(item => item.id !== link.id)];
      writeCache(); renderHistory(); showToast("qrCreated");
      const url = publicMomentUrl(link.public_id);
      if (typeof config.openQr === "function") await Promise.resolve(config.openQr({ url, publicId: link.public_id, link, letter, sender: letter.sender_name_snapshot, recipient: letter.recipient_name_snapshot, unlockAt: link.unlock_at }));
      return { ...link, url };
    } catch { showToast("qrCreateFailed"); return null; }
  }

  async function revokeQrLink(linkOrId) {
    const link = typeof linkOrId === "string" ? state.qrLinks.find(item => item.id === linkOrId) : linkOrId;
    state.client = await Promise.resolve(safeClient());
    if (!link || !state.client || !validUuid(state.user?.id)) { showToast("qrRevokeFailed"); return false; }
    try {
      const result = await state.client.rpc("glowletter_revoke_qr_link", { p_id: link.id });
      if (result.error) throw result.error;
      state.qrLinks = state.qrLinks.map(item => item.id === link.id ? { ...item, status: "revoked" } : item);
      writeCache(); renderHistory(); showToast("qrRevokedDone"); return true;
    } catch { showToast("qrRevokeFailed"); return false; }
  }

  async function openQrLink(link) {
    const letter = state.letters.find(item => item.id === link?.letter_id) || null;
    if (!link || !validUuid(link.public_id)) return;
    const url = publicMomentUrl(link.public_id);
    if (typeof config.openQr === "function") await Promise.resolve(config.openQr({ url, publicId: link.public_id, link, letter, sender: letter?.sender_name_snapshot, recipient: letter?.recipient_name_snapshot, unlockAt: link.unlock_at }));
  }

  function downloadIcsFile(content, filename = "GlowLetter-Moments.ics") {
    if (!content) return;
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function exportAllIcs() {
    if (!state.moments.length) return;
    const bodies = state.moments.map(moment => createIcs(moment, personById(moment.person_id))).filter(Boolean).map(value => value.replace(/^BEGIN:VCALENDAR\r\n(?:[^\r]+\r\n){4}/u, "").replace(/END:VCALENDAR\r\n$/u, ""));
    const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GlowLetter//Moments//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...bodies, "END:VCALENDAR", ""].join("\r\n");
    downloadIcsFile(content);
  }

  async function handleAction(action, id) {
    if (action === "close") return close();
    if (action === "person-new") { resetPersonForm(); return showForm("#momentsPersonForm", true); }
    if (action === "person-cancel") return showForm("#momentsPersonForm", false);
    if (action === "person-edit") { const person = personById(id); resetPersonForm(person); return showForm("#momentsPersonForm", true); }
    if (action === "person-delete") { if (confirm(tr("deletePersonConfirm"))) await deleteOwnerRow(PEOPLE_TABLE, id, "people"); return; }
    if (action === "person-compose") { const person = personById(id); if (person) await invokeComposer(composerPayloadForPerson(person)); return; }
    if (action === "person-date") { state.activeTab = "dates"; renderTabs(); resetDateForm(null, id); showForm("#momentsDateForm", true); return; }
    if (action === "date-new") { resetDateForm(); return showForm("#momentsDateForm", true); }
    if (action === "date-cancel") return showForm("#momentsDateForm", false);
    if (action === "date-edit") { const moment = state.moments.find(item => item.id === id); resetDateForm(moment); return showForm("#momentsDateForm", true); }
    if (action === "date-delete") { if (confirm(tr("deleteDateConfirm"))) await deleteOwnerRow(MOMENTS_TABLE, id, "moments"); return; }
    if (action === "date-compose") { const moment = state.moments.find(item => item.id === id); if (moment) await invokeComposer(composerPayloadForPerson(personById(moment.person_id), { moment })); return; }
    if (action === "date-ics") { const moment = state.moments.find(item => item.id === id); if (moment) downloadIcsFile(createIcs(moment, personById(moment.person_id)), `GlowLetter-${moment.event_date}.ics`); return; }
    if (action === "ics-all") return exportAllIcs();
    if (action === "letter-open") { const letter = state.letters.find(item => item.id === id); if (letter && typeof config.openComposer === "function") await Promise.resolve(config.openComposer({ mode: "history", source: letter.source, letter, text: letter.text, sender: letter.sender_name_snapshot, recipient: letter.recipient_name_snapshot, language: letter.language, tone: letter.tone })); return; }
    if (action === "letter-delete") {
      const active = state.qrLinks.some(link => link.letter_id === id && !["revoked", "expired"].includes(link.status));
      if (active || !confirm(tr("deleteLetterConfirm"))) return;
      await deleteOwnerRow(LETTERS_TABLE, id, "letters"); return;
    }
    if (action === "qr-create") return createQrForLetter(id);
    if (action === "qr-open") return openQrLink(state.qrLinks.find(item => item.id === id));
    if (action === "qr-revoke") return revokeQrLink(id);
  }

  function bindDomEvents() {
    state.root.addEventListener("click", event => {
      const tab = event.target.closest("[data-tab]");
      if (tab) { state.activeTab = tab.dataset.tab; renderTabs(); return; }
      const action = event.target.closest("[data-action]");
      if (action) handleAction(action.dataset.action, action.dataset.id || "");
    });
    query("#momentsPersonForm").addEventListener("submit", submitPerson);
    query("#momentsDateForm").addEventListener("submit", submitDate);
    query("#momentsFloristForm").addEventListener("submit", submitFlorist);
    query("#momentsReminderOptIn").addEventListener("change", event => { setReminderOptIn(event.currentTarget.checked); renderDueReminders(); });
    document.addEventListener("keydown", handleKeydown);
  }

  function handleKeydown(event) {
    if (!state.root || state.root.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...state.root.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),a[href]')].filter(node => !node.closest("[hidden]"));
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function open(tab = "") {
    ensureStyles(); ensureDom();
    if (["people", "dates", "history", "florist"].includes(tab)) state.activeTab = tab;
    state.sharedMode = false;
    query("#momentsTabs").hidden = false; query("#momentsContent").hidden = false; query("#momentsSharedView").hidden = true;
    state.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    state.previousOverflow = document.body.style.overflow;
    state.root.hidden = false; state.root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => { state.root.classList.add("is-open"); query("#momentsClose")?.focus({ preventScroll: true }); });
    renderAll();
    if (!state.loaded) loadAll({ quiet: true });
  }

  function close() {
    if (!state.root || state.root.hidden) return;
    state.root.classList.remove("is-open");
    state.root.setAttribute("aria-hidden", "true");
    document.body.style.overflow = state.previousOverflow;
    setTimeout(() => { if (state.root && !state.root.classList.contains("is-open")) state.root.hidden = true; }, 300);
    const target = state.previousFocus;
    state.previousFocus = null;
    requestAnimationFrame(() => target?.isConnected && target.focus({ preventScroll: true }));
  }

  async function resolveAccessToken() {
    try {
      const session = await state.client?.auth?.getSession?.();
      return cleanText(session?.data?.session?.access_token, 4096);
    } catch { return ""; }
  }

  function renderShared(result, status = "ready") {
    ensureStyles(); ensureDom();
    state.sharedMode = true;
    state.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    state.previousOverflow = document.body.style.overflow;
    state.root.hidden = false; state.root.setAttribute("aria-hidden", "false"); state.root.classList.add("is-open", "is-shared");
    document.body.style.overflow = "hidden";
    query("#momentsTabs").hidden = true; query("#momentsContent").hidden = true; query("#momentsSharedView").hidden = false;
    const locked = status === "locked" || (!result?.letter_text && result?.unlock_at && Date.parse(result.unlock_at) > Date.now());
    query("#momentsSharedStatus").textContent = locked ? tr("sharedLockedTitle") : status === "error" ? tr("sharedUnavailable") : tr("sharedReady");
    query("#momentsSharedTitle").textContent = cleanText(result?.title, 100) || (locked ? tr("sharedLockedTitle") : tr("sharedReady"));
    const sender = cleanText(result?.sender_name, 36); const recipient = cleanText(result?.recipient_name, 36);
    query("#momentsSharedRoute").textContent = [sender ? `${tr("fromLabel")}: ${sender}` : "", recipient ? `${tr("forLabel")}: ${recipient}` : ""].filter(Boolean).join(" · ");
    const letter = query("#momentsSharedLetter"); letter.hidden = locked || !result?.letter_text; letter.textContent = cleanText(result?.letter_text, 1800);
    const unlock = query("#momentsSharedUnlock"); unlock.textContent = locked ? tr("sharedLocked", { date: formatDisplayDate(result.unlock_at, true) }) : ""; unlock.dateTime = cleanText(result?.unlock_at, 40);
    requestAnimationFrame(() => query("#momentsClose")?.focus({ preventScroll: true }));
  }

  async function handleSharedToken(url = location.href) {
    const publicId = validUuid(url) || validUuid(new URL(url, location.href).searchParams.get("moment"));
    if (!publicId) return null;
    renderShared({ title: tr("sharedLoading") }, "loading");
    const appConfig = window.NUR_APP_CONFIG || {};
    const base = cleanText(appConfig.supabaseUrl, 500).replace(/\/+$/u, "");
    if (!/^https:\/\//iu.test(base)) { renderShared({}, "error"); return null; }
    state.client = await Promise.resolve(safeClient());
    const token = await resolveAccessToken();
    const headers = { Accept: "application/json" };
    const publishable = cleanText(appConfig.supabasePublishableKey, 4096);
    if (publishable) headers.apikey = publishable;
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const response = await fetch(`${base}/functions/v1/resolve-letter?public_id=${encodeURIComponent(publicId)}`, {
        method: "GET", headers, cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer"
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const raw = firstRow(payload?.data ?? payload) || {};
      const letterText = cleanText(raw.letter_text ?? raw.text, 1800);
      const status = cleanText(raw.status || raw.state || payload?.status || payload?.state, 24).toLowerCase() || (letterText ? "ready" : "locked");
      const row = {
        status,
        title: cleanText(raw.title, 100),
        letter_text: letterText,
        sender_name: cleanText(raw.sender_name ?? raw.senderName, 36),
        recipient_name: cleanText(raw.recipient_name ?? raw.recipientName, 36),
        language: validLanguage(raw.language),
        unlock_at: cleanText(raw.unlock_at ?? raw.unlockAt, 40),
        expires_at: cleanText(raw.expires_at ?? raw.expiresAt, 40)
      };
      if (["revoked", "expired", "missing", "not_found"].includes(status)) { renderShared({}, "error"); return { status }; }
      renderShared(row, status);
      window.dispatchEvent(new CustomEvent("glowletter-moment-resolved", {
        detail: { publicId, status, locked: status === "locked", letter: status === "ready" ? { ...row } : null }
      }));
      return { ...row, status };
    } catch {
      renderShared({ title: navigator.onLine ? tr("sharedUnavailable") : tr("sharedOffline") }, "error");
      return null;
    }
  }

  async function setSession(user) {
    const nextUser = user && typeof user === "object" ? user : null;
    const changed = validUuid(nextUser?.id) !== validUuid(state.user?.id);
    state.user = nextUser;
    state.client = await Promise.resolve(safeClient());
    if (changed) {
      state.people = []; state.moments = []; state.letters = []; state.qrLinks = []; state.loaded = false;
      await loadAll();
    }
    return state.user;
  }

  function setLanguage(language) {
    state.language = validLanguage(language);
    applyLanguage(); renderAll();
    return state.language;
  }

  async function init(options = {}) {
    for (const key of Object.keys(config)) if (key in options && (typeof options[key] === "function" || options[key] === null)) config[key] = options[key];
    ensureStyles(); ensureDom();
    let language = "ru";
    try { language = await Promise.resolve(config.getLanguage()); } catch {}
    state.language = validLanguage(language);
    try { state.user = await Promise.resolve(config.getUser()); } catch { state.user = null; }
    state.client = await Promise.resolve(safeClient());
    state.initialized = true;
    applyLanguage();
    await loadAll({ quiet: true });
    if (new URL(location.href).searchParams.has("moment")) await handleSharedToken();
    return api;
  }

  const helpers = Object.freeze({ parseDateOnly, nextOccurrence, getDueReminders, createIcs, escapeIcs, formatDateOnly });
  window.GlowLetterMoments = Object.freeze({
    init, setSession, setLanguage, open, close, handleSharedToken, recordLetter, createQrForLetter, revokeQrLink,
    nextOccurrence, getDueReminders, createIcs, helpers,
    getState: () => Object.freeze({ user: state.user, language: state.language, people: [...state.people], moments: [...state.moments], letters: [...state.letters], qrLinks: [...state.qrLinks] })
  });
  const api = window.GlowLetterMoments;
})();
