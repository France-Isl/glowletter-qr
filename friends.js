/*
  Друзья и личные сообщения (2.4.22).

  У каждого аккаунта есть код дружбы. По нему человека добавляют в друзья;
  писать можно только принятым друзьям. «В сети» — по отметке last_seen,
  которую приложение обновляет раз в минуту, пока открыто. Новые сообщения
  и заявки приходят через Realtime. Сообщения проходят фильтр слов, ссылки
  запрещены, есть «Пожаловаться» и «Заблокировать». Тексты на остальных
  языках — в friends-i18n.js.
*/
(() => {
  "use strict";

  if (window.GlowLetterFriends) return;

  const ONLINE_MS = 150000;
  const HEARTBEAT_MS = 60000;
  // Приглашение в живую игру — обычное сообщение особого вида, без ссылки.
  const INVITE_PATTERN = /^\[\[game:(yesno|loves|cards|duel|who|phrase|truth|countries|hints|dreams):([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\]$/u;
  // 2.4.25, онлайн: сердечки, Тёпа в гостях, «Рисуем вместе» и голосовые — тоже сообщения особого вида.
  const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
  const REACT_PATTERN = /^\[\[react:(heart|sparkle|smile|laugh|sun|flower|star|thumbs)\]\]$/u;
  const BEAR_PATTERN = /^\[\[bear:(o(?:0[1-9]|1[0-2])):(flower|tea|cake|star|balloon|book|heart|sun)\]\]$/u;
  const DRAW_PATTERN = new RegExp(`^\\[\\[draw:(${UUID})\\]\\]$`, "u");
  const RAIN_PATTERN = /^\[\[rain:(hearts|petals|bouquets|stars|confetti|butterflies)\]\]$/u;
  const FX_PATTERN = /^\[\[fx:(hearts|glow|big)\]\]([\s\S]+)$/u;
  const LIKE_PATTERN = new RegExp(`^\\[\\[(like|unlike):(${UUID})\\]\\]$`, "u");
  const UUID_ONLY = new RegExp(`^${UUID}$`, "u");
  // Дождь по экрану: первая картинка летит крупно, вторая — мелко (всего не больше 24 штук).
  const RAINS = Object.freeze({ hearts: ["❤️", "💗"], petals: ["🌸", "🌺"], bouquets: ["💐", "🌷"], stars: ["⭐", "✨"], confetti: ["🎉", "🎊"], butterflies: ["🦋", "🌼"] });
  const FX = Object.freeze({ hearts: "💕", glow: "✨", big: "🔆" });
  // Живые наклейки: как двигается вторая картинка рядом с Тёпой.
  const STICKER_MOTION = Object.freeze({ s01: "wave", s02: "bob", s03: "bloom", s04: "twinkle", s05: "bounce", s06: "twinkle", s07: "spin", s08: "bob", s09: "bob", s10: "spin", s11: "shake", s12: "bob", s13: "pop", s14: "bob", s15: "slide", s16: "spin", s17: "tilt", s18: "pop", s19: "shake", s20: "beat" });
  const VOICE_PATTERN = new RegExp(`^\\[\\[voice:(${UUID}):([1-9]|[1-5]\\d|60)\\]\\]$`, "u");
  const REACTIONS = Object.freeze({ heart: "❤️", sparkle: "✨", smile: "😊", laugh: "😂", sun: "☀️", flower: "🌸", star: "⭐", thumbs: "👍" });
  const GIFTS = Object.freeze({ flower: "🌷", tea: "☕", cake: "🍰", star: "⭐", balloon: "🎈", book: "📖", heart: "💝", sun: "☀️" });
  const VOICE_MAX_SECONDS = 60;
  // 2.4.26: звонок, «Игровой стол», фото на экран друга и наклейки из «Сундука Тёпы».
  const CALL_PATTERN = new RegExp(`^\\[\\[call:(${UUID})\\]\\]$`, "u");
  const PLAY_PATTERN = new RegExp(`^\\[\\[play:(${UUID})\\]\\]$`, "u");
  const PHOTO_PATTERN = new RegExp(`^\\[\\[photo:(${UUID})\\]\\]$`, "u");
  const STICKER_PATTERN = /^\[\[sticker:(s(?:0[1-9]|1\d|20))\]\]$/u;
  const MIC = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.8 11.5a6.2 6.2 0 0 0 12.4 0M12 17.7v3"/></svg>';
  const PHONE = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 3.6h2.6l1.5 4.1-1.9 1.4a11 11 0 0 0 5.9 5.9l1.4-1.9 4.1 1.5v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.8a2 2 0 0 1 2-2.2Z"/></svg>';
  const GAME = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.2 7h9.6a4.6 4.6 0 0 1 4.5 3.7l.9 4.6a2.9 2.9 0 0 1-5 2.5L15.6 16H8.4l-1.6 1.8a2.9 2.9 0 0 1-5-2.5l.9-4.6A4.6 4.6 0 0 1 7.2 7Z" fill="currentColor"/><path d="M7.6 10v3.4M5.9 11.7h3.4" stroke="var(--gold-bright)" stroke-width="1.7" stroke-linecap="round"/><circle cx="15.6" cy="10.6" r="1.05" fill="var(--gold-bright)"/><circle cx="17.6" cy="12.8" r="1.05" fill="var(--gold-bright)"/></svg>';
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.7 4.3 13a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l1.2 1.2 1.2-1.2a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5Z"/></svg>';
  const icon = id => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

  const TEXT = {
    ru: {
      ranking: "Рейтинг", videoCall: "Видеозвонок", attach: "Отправить фото", emojiAll: "Все смайлики", effects: "Эффекты", callSub: "Аудио / Видео", tableSub: "Играть вместе", worldSub: "Открыть", bearSub: "Отправить", drawSub: "Совместный холст", stickerSub: "Магазин", playSub: "Пригласить в игру", callAudio: "Аудиозвонок", callVideo: "Видеозвонок", photoSending: "Отправляю фото…", photoTooBig: "Фото слишком большое", msgSent: "Отправлено", msgRead: "Прочитано",
      home: "Друзья", eyebrow: "GLOWLETTER · ДРУЗЬЯ", title: "Друзья", close: "Закрыть", back: "Назад",
      signIn: "Войдите, чтобы добавлять друзей и переписываться.", signInButton: "Войти",
      nameTitle: "Как вас зовут?", nameNote: "Это имя увидят ваши друзья.", namePlaceholder: "Ваше имя", nameSave: "Сохранить", nameInvalid: "Введите обычное имя.",
      myCode: "Ваш код дружбы", codeNote: "Дайте этот код близкому человеку — по нему вас добавят в друзья.", copyCode: "Скопировать", shareCode: "Поделиться", codeCopied: "Код скопирован",
      shareText: "Добавь меня в друзья в GlowLetter — мой код: {code}",
      addTitle: "Добавить друга", addPlaceholder: "Код друга", add: "Добавить",
      notFound: "Такого кода нет. Проверьте и попробуйте ещё раз.", self: "Это ваш собственный код.", sent: "Заявка отправлена", accepted: "Теперь вы друзья!", already: "Вы уже друзья", pendingAlready: "Заявка уже отправлена",
      requests: "Заявки в друзья", accept: "Принять", decline: "Отклонить", outgoing: "Ждут ответа",
      friends: "Ваши друзья", none: "Пока нет друзей. Поделитесь своим кодом!",
      online: "Онлайн", offlineAgo: "Не в сети · {time}", offline: "Не в сети", justNow: "только что", minutesAgo: "{n} мин назад", hoursAgo: "{n} ч назад", daysAgo: "{n} дн назад",
      placeholder: "Сообщение…", send: "Отправить", emptyChat: "Напишите первое тёплое сообщение", noName: "Друг",
      block: "Заблокировать", blockConfirm: "Заблокировать {name}? Вы больше не будете получать сообщения от этого человека.", blocked: "Пользователь заблокирован",
      remove: "Удалить из друзей", removeConfirm: "Удалить {name} из друзей?", removed: "Удалено из друзей",
      report: "Пожаловаться", reportConfirm: "Пожаловаться на это сообщение?", reported: "Жалоба отправлена. Спасибо!",
      forbidden: "В сообщении есть недопустимые слова или ссылки.", rateLimited: "Слишком много сообщений. Подождите немного.", failed: "Не получилось. Проверьте связь и попробуйте ещё раз.",
      newMessage: "{name}: {text}", newRequest: "{name} хочет добавить вас в друзья", safety: "Пишите только тем, кого знаете. Если что-то не так — пожалуйтесь или заблокируйте.",
      playTogether: "Сыграть вместе", pickGame: "Выберите игру", inviteMessage: "Давай сыграем в «{game}»!", invitePlay: "Играть", inviteYou: "Вы позвали в игру «{game}»", newInvite: "{name} зовёт вас в игру «{game}»", inviteLater: "Позже", inviteHeading: "Приглашение в игру",
      onlineNow: "Сейчас в сети", onlineHeart: "{name}: отправить сердечко", onlinePlay: "{name}: позвать в игру", reactions: "Реакции", reactFrom: "{name} шлёт вам {emoji}", reactSent: "Отправлено: {emoji}",
      bearSend: "Тёпа в гости", bearPick: "Что Тёпа понесёт в подарок?", bearVisit: "{name} отправляет вам Тёпу в гости!", bearGift: "Тёпа принёс {gift}", bearYou: "Тёпа ушёл в гости и понёс {gift}", bearThanks: "Спасибо!", bearBack: "Отправить Тёпу в ответ", bearSent: "Тёпа отправился в гости", bearOpen: "Посмотреть",
      gift_flower: "цветок", gift_tea: "чай", gift_cake: "пирожное", gift_star: "звёздочку", gift_balloon: "шарик", gift_book: "книжку", gift_heart: "сердечко", gift_sun: "солнышко",
      drawTogether: "Рисовать вместе", drawEyebrow: "GLOWLETTER · РИСУЕМ ВМЕСТЕ", drawTitle: "Общая открытка", drawWaiting: "{name} вот-вот присоединится…", drawWith: "{name} рисует с вами", drawInvite: "{name} зовёт рисовать вместе", drawYou: "Вы позвали рисовать вместе", drawJoin: "Рисовать", drawHeading: "Приглашение рисовать",
      drawUndo: "Отменить", drawClear: "Очистить", drawClearConfirm: "Очистить открытку для вас обоих?", drawEraser: "Ластик", drawSave: "Сохранить открытку", drawColor: "Цвет", drawSize: "Толщина", drawFile: "glowletter-card", drawSaved: "Открытка сохранена", drawOffline: "Нет связи — рисунок видите только вы.",
      voiceRecord: "Записать голосовое", voiceRecording: "Запись {time}", voiceCancel: "Отмена", voiceMessage: "Голосовое · {time}", voiceGone: "Голосовое больше недоступно", voiceDenied: "Нет доступа к микрофону. Разрешите его в настройках.", voiceUnsupported: "На этом устройстве запись голоса недоступна. Обновите приложение.", voiceShort: "Слишком коротко — запишите хотя бы секунду.", voiceNew: "{name}: голосовое сообщение", voiceNote: "Голосовые сообщения хранятся 30 дней.", voicePlay: "Слушать", voiceStop: "Стоп",
      pushTitle: "Уведомления на телефон", pushNote: "Сообщим, когда друг написал вам, прочитал ваше письмо или ответил на него. Приложение проверяет новости примерно раз в 15 минут.", pushOn: "Включить", pushOff: "Выключить", pushEnabled: "Уведомления включены", pushDisabled: "Уведомления выключены", pushBlocked: "Разрешите уведомления для GlowLetter в настройках телефона.", pushChannel: "Друзья и письма", pushGame: "{name} зовёт вас играть", pushMany: "Новых сообщений: {n}", pushOpened: "Ваше письмо прочитали ✨", pushOpenedMany: "Прочитано ваших писем: {n}", pushReply: "Ответ на ваше письмо",
      callChat: "Звонок", callMissed: "{name}: пропущенный звонок", callBack: "Перезвонить", callYou: "Вы звонили", callButton: "Позвонить", tableButton: "Игровой стол", toolsMore: "Игры и подарки", menu: "Ещё", rainButton: "Дождь по экрану", rainPick: "Какой дождь отправить?", rain_hearts: "Сердечки", rain_petals: "Лепестки", rain_bouquets: "Букеты", rain_stars: "Звёзды", rain_confetti: "Конфетти", rain_butterflies: "Бабочки", rainYou: "Вы отправили дождь: {rain}", rainFrom: "{name} отправляет вам дождь: {rain}", rainAgain: "Ещё раз", fxTitle: "Отправить с эффектом", fx_hearts: "В сердечках", fx_glow: "Сияние", fx_big: "Крупно", fxHint: "Удержите, чтобы отправить с эффектом", likeFrom: "{name}: ❤️ на ваше сообщение", liked: "Сердечко",
      playInvite: "{name} зовёт за игровой стол", playYou: "Вы позвали за игровой стол", tableJoin: "К столу", tableHeading: "Игровой стол",
      photoNew: "{name}: новое фото", photoYou: "Ваше фото", photoGone: "Фото больше не доступно", stickerNew: "{name}: наклейка", stickerPick: "Наклейки",
      stickersNone: "Наклейки появляются в «Сундуке Тёпы» в «Нашем мире».", worldOpen: "Наш мир", pushCall: "📞 Пропущенный звонок: {name}", pushPhoto: "📸 {name}: новое фото", pushSticker: "🧸 {name}: наклейка"
    },
    en: {
      ranking: "Ranking", videoCall: "Video call", attach: "Send a photo", emojiAll: "All emoji", effects: "Effects", callSub: "Audio / Video", tableSub: "Play together", worldSub: "Open", bearSub: "Send", drawSub: "Shared canvas", stickerSub: "Shop", playSub: "Invite to a game", callAudio: "Audio call", callVideo: "Video call", photoSending: "Sending the photo…", photoTooBig: "The photo is too large", msgSent: "Sent", msgRead: "Read",
      home: "Friends", eyebrow: "GLOWLETTER · FRIENDS", title: "Friends", close: "Close", back: "Back",
      signIn: "Sign in to add friends and send messages.", signInButton: "Sign in",
      nameTitle: "What’s your name?", nameNote: "Your friends will see this name.", namePlaceholder: "Your name", nameSave: "Save", nameInvalid: "Enter an ordinary name.",
      myCode: "Your friend code", codeNote: "Give this code to someone close — they can add you as a friend.", copyCode: "Copy", shareCode: "Share", codeCopied: "Code copied",
      shareText: "Add me as a friend on GlowLetter — my code: {code}",
      addTitle: "Add a friend", addPlaceholder: "Friend’s code", add: "Add",
      notFound: "No such code. Check it and try again.", self: "This is your own code.", sent: "Request sent", accepted: "You are friends now!", already: "You are already friends", pendingAlready: "Request already sent",
      requests: "Friend requests", accept: "Accept", decline: "Decline", outgoing: "Waiting for an answer",
      friends: "Your friends", none: "No friends yet. Share your code!",
      online: "Online", offlineAgo: "Offline · {time}", offline: "Offline", justNow: "just now", minutesAgo: "{n} min ago", hoursAgo: "{n} h ago", daysAgo: "{n} d ago",
      placeholder: "Message…", send: "Send", emptyChat: "Write the first warm message", noName: "Friend",
      block: "Block", blockConfirm: "Block {name}? You will no longer get messages from this person.", blocked: "User blocked",
      remove: "Remove friend", removeConfirm: "Remove {name} from friends?", removed: "Removed from friends",
      report: "Report", reportConfirm: "Report this message?", reported: "Report sent. Thank you!",
      forbidden: "The message has words or links that aren’t allowed.", rateLimited: "Too many messages. Please wait a little.", failed: "Something went wrong. Check your connection and try again.",
      newMessage: "{name}: {text}", newRequest: "{name} wants to add you as a friend", safety: "Write only to people you know. If something feels wrong, report or block.",
      playTogether: "Play together", pickGame: "Choose a game", inviteMessage: "Let’s play “{game}”!", invitePlay: "Play", inviteYou: "You invited to play “{game}”", newInvite: "{name} invites you to play “{game}”", inviteLater: "Later", inviteHeading: "Game invitation",
      onlineNow: "Online now", onlineHeart: "A heart for {name}", onlinePlay: "Invite {name} to play", reactions: "Reactions", reactFrom: "{name} sends you {emoji}", reactSent: "Sent: {emoji}",
      bearSend: "Send Teddy over", bearPick: "What gift should Teddy bring?", bearVisit: "{name} sent Teddy to visit you!", bearGift: "Teddy brought {gift}", bearYou: "Teddy went visiting with {gift}", bearThanks: "Thank you!", bearBack: "Send Teddy back", bearSent: "Teddy is on his way", bearOpen: "Look",
      gift_flower: "a flower", gift_tea: "some tea", gift_cake: "a cake", gift_star: "a little star", gift_balloon: "a balloon", gift_book: "a book", gift_heart: "a little heart", gift_sun: "some sunshine",
      drawTogether: "Draw together", drawEyebrow: "GLOWLETTER · DRAWING TOGETHER", drawTitle: "Our card", drawWaiting: "Waiting for {name}…", drawWith: "{name} is drawing with you", drawInvite: "{name} invites you to draw together", drawYou: "You invited to draw together", drawJoin: "Draw", drawHeading: "Drawing invitation",
      drawUndo: "Undo", drawClear: "Clear", drawClearConfirm: "Clear the card for both of you?", drawEraser: "Eraser", drawSave: "Save the card", drawColor: "Colour", drawSize: "Brush size", drawFile: "glowletter-card", drawSaved: "Card saved", drawOffline: "No connection — only you can see the drawing.",
      voiceRecord: "Record a voice message", voiceRecording: "Recording {time}", voiceCancel: "Cancel", voiceMessage: "Voice message · {time}", voiceGone: "This voice message is no longer available", voiceDenied: "No access to the microphone. Allow it in settings.", voiceUnsupported: "Voice recording isn’t available on this device. Update the app.", voiceShort: "Too short — record at least one second.", voiceNew: "{name}: voice message", voiceNote: "Voice messages are kept for 30 days.", voicePlay: "Play", voiceStop: "Stop",
      pushTitle: "Phone notifications", pushNote: "We’ll let you know when a friend writes to you, reads your letter or replies to it. The app checks for news about every 15 minutes.", pushOn: "Turn on", pushOff: "Turn off", pushEnabled: "Notifications are on", pushDisabled: "Notifications are off", pushBlocked: "Allow notifications for GlowLetter in your phone settings.", pushChannel: "Friends and letters", pushGame: "{name} invites you to play", pushMany: "New messages: {n}", pushOpened: "Your letter has been read ✨", pushOpenedMany: "Letters read: {n}", pushReply: "A reply to your letter",
      callChat: "Call", callMissed: "Missed call from {name}", callBack: "Call back", callYou: "You called", callButton: "Call", tableButton: "Game table", toolsMore: "Games and gifts", menu: "More", rainButton: "Screen rain", rainPick: "Which rain to send?", rain_hearts: "Hearts", rain_petals: "Petals", rain_bouquets: "Bouquets", rain_stars: "Stars", rain_confetti: "Confetti", rain_butterflies: "Butterflies", rainYou: "You sent a rain: {rain}", rainFrom: "{name} sends you a rain: {rain}", rainAgain: "Again", fxTitle: "Send with an effect", fx_hearts: "With hearts", fx_glow: "Glow", fx_big: "Big", fxHint: "Hold to send with an effect", likeFrom: "{name}: ❤️ on your message", liked: "Heart",
      playInvite: "{name} invites you to the game table", playYou: "You invited them to the game table", tableJoin: "Join", tableHeading: "Game table",
      photoNew: "{name}: new photo", photoYou: "Your photo", photoGone: "This photo is no longer available", stickerNew: "{name}: sticker", stickerPick: "Stickers",
      stickersNone: "Stickers come from Teddy’s chest in Our world.", worldOpen: "Our world", pushCall: "📞 Missed call: {name}", pushPhoto: "📸 {name}: new photo", pushSticker: "🧸 {name}: sticker"
    },
    fr: {
      ranking: "Classement", videoCall: "Appel vidéo", attach: "Envoyer une photo", emojiAll: "Tous les émojis", effects: "Effets", callSub: "Audio / Vidéo", tableSub: "Jouer ensemble", worldSub: "Ouvrir", bearSub: "Envoyer", drawSub: "Toile commune", stickerSub: "Boutique", playSub: "Inviter à jouer", callAudio: "Appel audio", callVideo: "Appel vidéo", photoSending: "Envoi de la photo…", photoTooBig: "La photo est trop lourde", msgSent: "Envoyé", msgRead: "Lu",
      home: "Amis", eyebrow: "GLOWLETTER · AMIS", title: "Amis", close: "Fermer", back: "Retour",
      signIn: "Connectez-vous pour ajouter des amis et écrire des messages.", signInButton: "Se connecter",
      nameTitle: "Comment vous appelez-vous ?", nameNote: "Vos amis verront ce prénom.", namePlaceholder: "Votre prénom", nameSave: "Enregistrer", nameInvalid: "Saisissez un prénom ordinaire.",
      myCode: "Votre code d’ami", codeNote: "Donnez ce code à un proche : il pourra vous ajouter en ami.", copyCode: "Copier", shareCode: "Partager", codeCopied: "Code copié",
      shareText: "Ajoute-moi en ami sur GlowLetter — mon code : {code}",
      addTitle: "Ajouter un ami", addPlaceholder: "Code de l’ami", add: "Ajouter",
      notFound: "Ce code n’existe pas. Vérifiez et réessayez.", self: "C’est votre propre code.", sent: "Demande envoyée", accepted: "Vous êtes amis maintenant !", already: "Vous êtes déjà amis", pendingAlready: "Demande déjà envoyée",
      requests: "Demandes d’ami", accept: "Accepter", decline: "Refuser", outgoing: "En attente de réponse",
      friends: "Vos amis", none: "Pas encore d’amis. Partagez votre code !",
      online: "En ligne", offlineAgo: "Hors ligne · {time}", offline: "Hors ligne", justNow: "à l’instant", minutesAgo: "il y a {n} min", hoursAgo: "il y a {n} h", daysAgo: "il y a {n} j",
      placeholder: "Message…", send: "Envoyer", emptyChat: "Écrivez le premier message tendre", noName: "Ami",
      block: "Bloquer", blockConfirm: "Bloquer {name} ? Vous ne recevrez plus de messages de cette personne.", blocked: "Utilisateur bloqué",
      remove: "Retirer des amis", removeConfirm: "Retirer {name} de vos amis ?", removed: "Retiré des amis",
      report: "Signaler", reportConfirm: "Signaler ce message ?", reported: "Signalement envoyé. Merci !",
      forbidden: "Le message contient des mots ou des liens interdits.", rateLimited: "Trop de messages. Patientez un peu.", failed: "Un problème est survenu. Vérifiez la connexion et réessayez.",
      newMessage: "{name} : {text}", newRequest: "{name} veut vous ajouter en ami", safety: "N’écrivez qu’aux personnes que vous connaissez. En cas de souci, signalez ou bloquez.",
      playTogether: "Jouer ensemble", pickGame: "Choisissez un jeu", inviteMessage: "On joue à « {game} » ?", invitePlay: "Jouer", inviteYou: "Vous avez invité à jouer à « {game} »", newInvite: "{name} vous invite à jouer à « {game} »", inviteLater: "Plus tard", inviteHeading: "Invitation à jouer",
      onlineNow: "En ligne maintenant", onlineHeart: "Un cœur pour {name}", onlinePlay: "Inviter {name} à jouer", reactions: "Réactions", reactFrom: "{name} vous envoie {emoji}", reactSent: "Envoyé : {emoji}",
      bearSend: "Envoyer Nounours", bearPick: "Quel cadeau Nounours apporte-t-il ?", bearVisit: "{name} vous envoie Nounours en visite !", bearGift: "Nounours apporte {gift}", bearYou: "Nounours est parti en visite avec {gift}", bearThanks: "Merci !", bearBack: "Renvoyer Nounours", bearSent: "Nounours est en route", bearOpen: "Voir",
      gift_flower: "une fleur", gift_tea: "du thé", gift_cake: "un gâteau", gift_star: "une petite étoile", gift_balloon: "un ballon", gift_book: "un livre", gift_heart: "un petit cœur", gift_sun: "un rayon de soleil",
      drawTogether: "Dessiner ensemble", drawEyebrow: "GLOWLETTER · DESSIN À DEUX", drawTitle: "Notre carte", drawWaiting: "On attend {name}…", drawWith: "{name} dessine avec vous", drawInvite: "{name} vous invite à dessiner ensemble", drawYou: "Vous avez invité à dessiner ensemble", drawJoin: "Dessiner", drawHeading: "Invitation à dessiner",
      drawUndo: "Annuler", drawClear: "Effacer", drawClearConfirm: "Effacer la carte pour vous deux ?", drawEraser: "Gomme", drawSave: "Enregistrer la carte", drawColor: "Couleur", drawSize: "Épaisseur", drawFile: "glowletter-carte", drawSaved: "Carte enregistrée", drawOffline: "Pas de connexion : vous seul voyez le dessin.",
      voiceRecord: "Enregistrer un message vocal", voiceRecording: "Enregistrement {time}", voiceCancel: "Annuler", voiceMessage: "Message vocal · {time}", voiceGone: "Ce message vocal n’est plus disponible", voiceDenied: "Pas d’accès au micro. Autorisez-le dans les réglages.", voiceUnsupported: "L’enregistrement vocal n’est pas disponible sur cet appareil. Mettez l’application à jour.", voiceShort: "Trop court : enregistrez au moins une seconde.", voiceNew: "{name} : message vocal", voiceNote: "Les messages vocaux sont conservés 30 jours.", voicePlay: "Écouter", voiceStop: "Stop",
      pushTitle: "Notifications sur le téléphone", pushNote: "Nous vous prévenons quand un ami vous écrit, lit votre lettre ou y répond. L’application vérifie les nouveautés environ toutes les 15 minutes.", pushOn: "Activer", pushOff: "Désactiver", pushEnabled: "Notifications activées", pushDisabled: "Notifications désactivées", pushBlocked: "Autorisez les notifications de GlowLetter dans les réglages du téléphone.", pushChannel: "Amis et lettres", pushGame: "{name} vous invite à jouer", pushMany: "Nouveaux messages : {n}", pushOpened: "Votre lettre a été lue ✨", pushOpenedMany: "Lettres lues : {n}", pushReply: "Une réponse à votre lettre",
      callChat: "Appel", callMissed: "Appel manqué : {name}", callBack: "Rappeler", callYou: "Vous avez appelé", callButton: "Appeler", tableButton: "Table de jeu", toolsMore: "Jeux et cadeaux", menu: "Plus", rainButton: "Pluie sur l’écran", rainPick: "Quelle pluie envoyer ?", rain_hearts: "Cœurs", rain_petals: "Pétales", rain_bouquets: "Bouquets", rain_stars: "Étoiles", rain_confetti: "Confettis", rain_butterflies: "Papillons", rainYou: "Vous avez envoyé une pluie : {rain}", rainFrom: "{name} vous envoie une pluie : {rain}", rainAgain: "Encore", fxTitle: "Envoyer avec un effet", fx_hearts: "En cœurs", fx_glow: "Éclat", fx_big: "En grand", fxHint: "Maintenez pour envoyer avec un effet", likeFrom: "{name} : ❤️ sur votre message", liked: "Cœur",
      playInvite: "{name} vous invite à la table de jeu", playYou: "Invitation à la table de jeu envoyée", tableJoin: "Rejoindre", tableHeading: "Table de jeu",
      photoNew: "{name} : nouvelle photo", photoYou: "Votre photo", photoGone: "Cette photo n’est plus disponible", stickerNew: "{name} : autocollant", stickerPick: "Autocollants",
      stickersNone: "Les autocollants viennent du coffre de Nounours dans Notre monde.", worldOpen: "Notre monde", pushCall: "📞 Appel manqué : {name}", pushPhoto: "📸 {name} : nouvelle photo", pushSticker: "🧸 {name} : autocollant"
    }
  };
  Object.entries(window.GLOWLETTER_FRIENDS_I18N || {}).forEach(([code, pack]) => { if (!TEXT[code] && pack) TEXT[code] = pack; });

  const state = { root: null, view: "list", me: null, rows: [], chatWith: null, messages: [], picking: false, bearPicking: false, busy: false, error: "", channel: null, channelUser: "", heartbeat: 0, lastFocus: null, lastReaction: 0, recording: null, voices: new Map(), playing: null, stickerPicking: false, photos: new Map(), menuOpen: false, rainPicking: false, emojiOpen: false, callPick: false, typing: false, newestShown: "", photoBusy: false, fxOpen: false, lastTap: null, holdTimer: 0, holdFired: false };

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const userId = () => cloud()?.getState?.().userId || "";
  const signedIn = () => Boolean(cloud()?.getState?.().signedIn);
  const language = () => {
    const current = String(app()?.getState?.().language || localStorage.getItem("nurLanguage") || "ru").toLowerCase();
    return TEXT[current] ? current : "en";
  };
  const tr = (key, values = {}) => String((TEXT[language()] || TEXT.en)[key] ?? TEXT.en[key] ?? key).replace(/\{(\w+)\}/gu, (_, name) => String(values[name] ?? ""));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const cleanName = value => String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, 36);
  const notify = (message, duration = 3600) => app()?.notify?.(message, duration);
  const nameOf = row => row?.display_name || tr("noName");
  const isOnline = row => Boolean(row?.last_seen) && Date.now() - new Date(row.last_seen).getTime() < ONLINE_MS;
  const ago = value => {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 2) return tr("justNow");
    if (minutes < 60) return tr("minutesAgo", { n: minutes });
    if (minutes < 1440) return tr("hoursAgo", { n: Math.round(minutes / 60) });
    return tr("daysAgo", { n: Math.round(minutes / 1440) });
  };
  const statusText = row => isOnline(row) ? tr("online") : row?.last_seen ? tr("offlineAgo", { time: ago(row.last_seen) }) : tr("offline");
  const timeOf = value => { try { return new Intl.DateTimeFormat(language() === "ind" ? "id" : language(), { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); } catch { return ""; } };
  const games = () => window.GlowLetterGames || null;
  const gameTitle = kind => games()?.title?.(kind) || kind;
  const parseInvite = body => {
    const game = INVITE_PATTERN.exec(String(body || ""));
    if (game) return { kind: game[1], room: game[2] };
    const draw = DRAW_PATTERN.exec(String(body || ""));
    if (draw) return { kind: "draw", room: draw[1] };
    const play = PLAY_PATTERN.exec(String(body || ""));
    return play ? { kind: "play", room: play[1] } : null;
  };
  const parseCall = body => CALL_PATTERN.exec(String(body || ""))?.[1] || "";
  const parsePhoto = body => PHOTO_PATTERN.exec(String(body || ""))?.[1] || "";
  const parseSticker = body => STICKER_PATTERN.exec(String(body || ""))?.[1] || "";
  const world = () => window.GlowLetterWorld || null;
  const stickerView = id => world()?.stickers?.[id] || "🧸";
  const stickerLabel = id => world()?.text?.(`sticker_${id}`) || "";
  const parseReaction = body => REACT_PATTERN.exec(String(body || ""))?.[1] || "";
  const parseBear = body => { const match = BEAR_PATTERN.exec(String(body || "")); return match ? { outfit: match[1], gift: match[2] } : null; };
  const parseRain = body => RAIN_PATTERN.exec(String(body || ""))?.[1] || "";
  const parseFx = body => { const match = FX_PATTERN.exec(String(body || "")); return match ? { kind: match[1], text: match[2] } : null; };
  const parseLike = body => { const match = LIKE_PATTERN.exec(String(body || "")); return match ? { on: match[1] === "like", id: match[2] } : null; };
  const stickerParts = id => { const view = stickerView(id); return view.startsWith("🧸") ? ["🧸", view.slice(2)] : ["", view]; };
  const parseVoice = body => { const match = VOICE_PATTERN.exec(String(body || "")); return match ? { id: match[1], seconds: Number(match[2]) } : null; };
  const clock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  const inviteText = (invite, name) => invite.kind === "draw" ? tr("drawInvite", { name }) : invite.kind === "play" ? tr("playInvite", { name }) : tr("newInvite", { name, game: gameTitle(invite.kind) });
  const previewText = (body, name = "") => {
    const invite = parseInvite(body);
    if (invite) return invite.kind === "draw" ? tr("drawInvite", { name }) : invite.kind === "play" ? `🎲 ${tr("tableHeading")}` : tr("inviteMessage", { game: gameTitle(invite.kind) });
    if (parseCall(body)) return `📞 ${tr("callChat")}`;
    if (parsePhoto(body)) return `📸 ${tr("photoNew", { name })}`;
    const sticker = parseSticker(body);
    if (sticker) return `${stickerView(sticker)} ${stickerLabel(sticker)}`;
    const reaction = parseReaction(body);
    if (reaction) return REACTIONS[reaction];
    const bear = parseBear(body);
    if (bear) return `🧸 ${tr("bearGift", { gift: tr(`gift_${bear.gift}`) })}`;
    const voice = parseVoice(body);
    if (voice) return tr("voiceMessage", { time: clock(voice.seconds) });
    const rain = parseRain(body);
    if (rain) return `${RAINS[rain][0]} ${tr(`rain_${rain}`)}`;
    const fx = parseFx(body);
    if (fx) return fx.text;
    if (parseLike(body)) return "❤️";
    return String(body || "");
  };
  const online = () => window.GlowLetterOnline || null;
  const initial = name => escapeHtml((cleanName(name)[0] || "♥").toUpperCase());

  // ——— Окно ———

  function mount() {
    if (state.root) return state.root;
    const root = document.createElement("div");
    root.className = "glg-layer glf-layer";
    root.id = "friendsLayer";
    root.hidden = true;
    root.innerHTML = `
      <button class="glg-backdrop" type="button" data-action="close" tabindex="-1" aria-hidden="true"></button>
      <section class="glg-panel" role="dialog" aria-modal="true" aria-labelledby="glfTitle">
        <header class="glg-header">
          <div><p class="glg-eyebrow" data-glf="eyebrow"></p><h2 id="glfTitle" data-glf="title"></h2></div>
          <button class="glg-close" type="button" data-action="close"><span aria-hidden="true">×</span></button>
        </header>
        <div class="glg-body glf-body" aria-live="polite"></div>
      </section>`;
    root.addEventListener("click", event => {
      const target = event.target.closest("[data-action]");
      if (target && root.contains(target)) onAction(target.dataset.action, target);
    });
    root.addEventListener("submit", event => { event.preventDefault(); onAction(event.target.dataset.submit, event.target); });
    root.addEventListener("input", event => { if (event.target.matches(".glf-compose textarea")) sizeField(event.target); });
    // Пока пишут (открыта клавиатура) — плитки под полем прячутся, переписке остаётся место.
    root.addEventListener("focusin", event => { if (event.target.matches(".glf-compose textarea") && !state.typing) { state.typing = true; event.target.closest(".glf-chat-foot")?.classList.add("is-typing"); } });
    root.addEventListener("focusout", event => {
      if (!event.target.matches(".glf-compose textarea")) return;
      setTimeout(() => { if (document.activeElement?.matches?.(".glf-compose textarea")) return; state.typing = false; state.root?.querySelector(".glf-chat-foot")?.classList.remove("is-typing"); }, 220);
    });
    root.addEventListener("change", event => { if (event.target.matches(".glf-photo-input")) { const file = event.target.files?.[0]; event.target.value = ""; sendChatPhoto(file); } });
    // Удержать «Отправить» — выбрать эффект; обычное нажатие отправляет как раньше.
    root.addEventListener("pointerdown", event => {
      if (!event.target.closest(".glf-send")) return;
      state.holdFired = false;
      clearTimeout(state.holdTimer);
      state.holdTimer = setTimeout(() => { state.holdFired = true; openFx(); }, 450);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(type => root.addEventListener(type, () => clearTimeout(state.holdTimer)));
    root.addEventListener("contextmenu", event => { if (event.target.closest(".glf-send")) { event.preventDefault(); clearTimeout(state.holdTimer); state.holdFired = true; openFx(); } });
    root.addEventListener("click", event => { if (state.holdFired && event.target.closest(".glf-send")) { event.preventDefault(); event.stopPropagation(); state.holdFired = false; } }, true);
    // Двойное касание по сообщению — сердечко на нём (как в Instagram).
    root.addEventListener("pointerup", event => {
      const bubble = event.target.closest("[data-mid]");
      if (!bubble || event.target.closest("button, a, audio")) return;
      const now = Date.now();
      if (state.lastTap?.id === bubble.dataset.mid && now - state.lastTap.at < 320) { state.lastTap = null; toggleLike(bubble); }
      else state.lastTap = { id: bubble.dataset.mid, at: now };
    });
    root.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.stopPropagation(); close(); return; }
      // Enter отправляет, Shift+Enter — новая строка.
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing && event.target.matches(".glf-compose textarea")) {
        event.preventDefault();
        event.target.form.requestSubmit();
      }
    });
    document.body.append(root);
    state.root = root;
    return root;
  }

  async function open() {
    const root = mount();
    if (root.hidden) state.lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("glg-open");
    requestAnimationFrame(() => root.classList.add("is-open"));
    state.view = signedIn() ? "loading" : "signin";
    render();
    if (signedIn()) await refresh(true);
  }

  function close() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    document.body.classList.remove("glg-open");
    setTimeout(() => { if (!root.classList.contains("is-open")) root.hidden = true; }, 320);
    stopVoice(false);
    stopPlayback();
    state.chatWith = null;
    state.lastFocus?.focus?.({ preventScroll: true });
  }

  function render() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.querySelector("[data-glf=eyebrow]").textContent = tr("eyebrow");
    root.querySelector("[data-glf=title]").textContent = state.view === "chat" ? nameOf(state.chatWith) : tr("title");
    root.querySelector(".glg-close").setAttribute("aria-label", tr("close"));
    const body = root.querySelector(".glf-body");
    const views = { signin: renderSignIn, loading: () => `<p class="glg-center glg-muted">…</p>`, name: renderName, list: renderList, chat: renderChat };
    const draft = body.querySelector(".glf-compose textarea")?.value || "";
    root.classList.toggle("glf-chat-mode", state.view === "chat");
    body.innerHTML = (views[state.view] || renderList)();
    if (state.view === "chat") {
      const field = body.querySelector(".glf-compose textarea");
      if (field && draft) { field.value = draft; sizeField(field); }
      if (state.fxOpen && !draft) state.fxOpen = false;
      const scroller = body.querySelector(".glf-messages");
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    } else body.scrollTop = 0;
  }

  function renderSignIn() {
    return `<div class="glg-center"><p class="glg-muted">${escapeHtml(tr("signIn"))}</p><button class="glg-primary" type="button" data-action="signin">${icon("ic-user")} ${escapeHtml(tr("signInButton"))}</button></div>`;
  }

  function renderName() {
    return `<form class="glg-form" data-submit="save-name" novalidate>
      <h3>${escapeHtml(tr("nameTitle"))}</h3>
      <p class="glg-muted">${escapeHtml(tr("nameNote"))}</p>
      <label><span>${escapeHtml(tr("namePlaceholder"))}</span><input name="name" type="text" dir="auto" maxlength="36" autocomplete="name" value="${escapeHtml(state.me?.display_name || cleanName(app()?.getState?.().senderName))}" required /></label>
      <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
      <button class="glg-primary glg-wide" type="submit">${escapeHtml(tr("nameSave"))}</button>
    </form>`;
  }

  function renderList() {
    const friends = state.rows.filter(row => row.status === "friend").sort((a, b) => (isOnline(b) - isOnline(a)) || ((b.unread || 0) - (a.unread || 0)) || String(b.last_message_at || "").localeCompare(String(a.last_message_at || "")));
    const incoming = state.rows.filter(row => row.status === "incoming");
    const outgoing = state.rows.filter(row => row.status === "outgoing");
    const avatar = row => `<span class="glf-avatar${isOnline(row) ? " is-online" : ""}">${initial(nameOf(row))}</span>`;
    return `
      <article class="glg-hero glf-code-card">
        <p class="glg-step">${escapeHtml(tr("myCode"))}</p>
        <p class="glf-code">${escapeHtml(state.me?.friend_code || "")}</p>
        <p class="glg-muted">${escapeHtml(tr("codeNote"))}</p>
        <div class="glg-actions"><button class="glg-primary" type="button" data-action="share-code">${icon("ic-share")} ${escapeHtml(tr("shareCode"))}</button><button class="glg-secondary" type="button" data-action="copy-code">${icon("ic-copy")} ${escapeHtml(tr("copyCode"))}</button></div>
      </article>
      <form class="glg-form glf-add" data-submit="add" novalidate>
        <h3>${escapeHtml(tr("addTitle"))}</h3>
        <div class="glf-add-row"><input name="code" type="text" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${escapeHtml(tr("addPlaceholder"))}" /><button class="glg-primary" type="submit"${state.busy ? " disabled" : ""}>${escapeHtml(tr("add"))}</button></div>
        <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
      </form>
      ${incoming.length ? `<section class="glg-section"><h3>${escapeHtml(tr("requests"))}</h3><ul class="glf-list">${incoming.map(row => `<li class="glf-row">${avatar(row)}<span class="glf-name">${escapeHtml(nameOf(row))}</span><span class="glf-row-actions"><button class="glg-primary glf-small" type="button" data-action="accept" data-id="${escapeHtml(row.user_id)}">${escapeHtml(tr("accept"))}</button><button class="glg-secondary glf-small" type="button" data-action="decline" data-id="${escapeHtml(row.user_id)}">${escapeHtml(tr("decline"))}</button></span></li>`).join("")}</ul></section>` : ""}
      <section class="glg-section"><h3>${escapeHtml(tr("friends"))}</h3>
        ${friends.length ? `<ul class="glf-list">${friends.map(row => `<li><button class="glf-row glf-friend" type="button" data-action="chat" data-id="${escapeHtml(row.user_id)}">${avatar(row)}<span class="glf-who"><span class="glf-name">${escapeHtml(nameOf(row))}</span><small class="${isOnline(row) ? "is-online" : ""}">${escapeHtml(statusText(row))}</small></span>${row.unread ? `<b class="glg-new">${row.unread}</b>` : ""}</button></li>`).join("")}</ul>` : `<p class="glg-muted">${escapeHtml(tr("none"))}</p>`}
      </section>
      ${renderPush()}
      ${outgoing.length ? `<section class="glg-section"><h3>${escapeHtml(tr("outgoing"))}</h3><ul class="glf-list">${outgoing.map(row => `<li class="glf-row is-muted">${avatar(row)}<span class="glf-name">${escapeHtml(nameOf(row))}</span></li>`).join("")}</ul></section>` : ""}
      <p class="glf-safety">${escapeHtml(tr("safety"))}</p>`;
  }

  // Значки шапки и нижней панели — свои рисунки с объёмом (золото, янтарь, бордо).
  const ICONS = Object.freeze({
    back: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trophy: '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><defs><linearGradient id="glfGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a3"/><stop offset=".5" stop-color="#f2b43a"/><stop offset="1" stop-color="#b9750f"/></linearGradient></defs><path d="M9 6h14v6a7 7 0 0 1-14 0Z" fill="url(#glfGold)"/><path d="M9 8H5.5a4 4 0 0 0 4.2 5.4M23 8h3.5a4 4 0 0 1-4.2 5.4" fill="none" stroke="#d99a22" stroke-width="2" stroke-linecap="round"/><path d="M14 18.5h4l.8 4h-5.6Z" fill="#d99a22"/><rect x="10.5" y="22.5" width="11" height="4" rx="1.4" fill="url(#glfGold)"/><path d="M12.4 8.4c.2 2.6 1 4.4 2.6 5.6" fill="none" stroke="#fff6d6" stroke-width="1.4" stroke-linecap="round" opacity=".85"/></svg>',
    phone: '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><defs><linearGradient id="glfAmber" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6b25c"/><stop offset="1" stop-color="#b8611d"/></linearGradient></defs><path d="M9.2 4.8h3.3l2 5.4-2.5 1.8a14.6 14.6 0 0 0 7.9 7.9l1.8-2.5 5.4 2v3.3a2.7 2.7 0 0 1-2.9 2.7A22 22 0 0 1 6.5 7.7a2.7 2.7 0 0 1 2.7-2.9Z" fill="url(#glfAmber)"/><path d="M9.4 7.2c.5 4.4 2.4 8.3 5.4 11.2" fill="none" stroke="#ffe2b8" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></svg>',
    video: '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><defs><linearGradient id="glfCam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98a5a"/><stop offset="1" stop-color="#7a3f1d"/></linearGradient></defs><rect x="3.5" y="9" width="18" height="14" rx="3.6" fill="url(#glfCam)"/><path d="m22 14.2 6.5-3.6v10.8L22 17.8Z" fill="url(#glfCam)"/><rect x="6" y="11.4" width="7" height="2" rx="1" fill="#f3d2b6" opacity=".55"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="5.5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="18.5" cy="12" r="2" fill="currentColor"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><linearGradient id="glfHeart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7f9c"/><stop offset="1" stop-color="#d81b47"/></linearGradient></defs><path d="M12 20.7 4.3 13a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l1.2 1.2 1.2-1.2a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5Z" fill="url(#glfHeart)"/><path d="M7 8.2a2.4 2.4 0 0 1 2.6-1" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="9" y="3.2" width="6" height="11.2" rx="3" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0M12 17.6v3.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    smile: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="15" cy="10" r="1.2" fill="currentColor"/><path d="M8.2 14.2a4.6 4.6 0 0 0 7.6 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    clip: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m20 11.5-7.6 7.6a5 5 0 0 1-7.1-7.1l8-8a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.7 1.7 0 0 1-2.4-2.4l7.3-7.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3.4 20.2 21 12 3.4 3.8l2.2 6.8L14 12l-8.4 1.4Z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    removeFriend: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="8" r="3.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 20c.6-3.8 3.1-5.8 6.5-5.8 1.2 0 2.3.2 3.2.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="17.5" cy="17.5" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15.9 17.5h3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    block: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m6 6 12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    tick: '<svg class="glf-tick" viewBox="0 0 18 12" aria-hidden="true" focusable="false"><path d="m1.5 6.5 3.4 3.4L11.5 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ticks: '<svg class="glf-tick is-read" viewBox="0 0 18 12" aria-hidden="true" focusable="false"><path d="m1 6.5 3.4 3.4L11 2M7.6 9.6l.3.3L14.5 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  });
  // Полная коллекция смайликов (вставляются в текст).
  const EMOJIS = Object.freeze(["😊", "😂", "🥰", "😍", "😘", "🤗", "😉", "😄", "😁", "🙂", "😇", "🥳", "😎", "🤩", "😌", "🤭", "😴", "🥺", "😢", "😭", "😮", "😅", "🙈", "🤔", "👍", "👏", "🙌", "🤝", "👋", "💪", "🙏", "✌️", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "💖", "💕", "💐", "🌸", "🌹", "🌷", "🌻", "☀️", "🌙", "⭐", "✨", "🔥", "🎉", "🎁", "🎂", "🍰", "☕", "🍓", "🍫", "🧸", "🐱", "🐶", "🦋", "🌈", "🎲"]);
  // Плитки под полем ввода (как на образце): значок, название, подпись; тон карточки.
  const TILES = Object.freeze([
    ["call-pick", "📞", "callButton", "callSub", "is-rose"],
    ["table", "🎲", "tableButton", "tableSub", ""],
    ["world", "🌍", "worldOpen", "worldSub", "is-lilac"],
    ["bear-pick", "🧸", "bearSend", "bearSub", ""],
    ["draw", "✏️", "drawTogether", "drawSub", ""],
    ["sticker-pick", "🏷️", "stickerPick", "stickerSub", ""]
  ]);

  function renderChat() {
    const friend = state.chatWith;
    const me = userId();
    const likes = likeMap();
    const shown = state.messages.filter(message => !parseLike(message.body));
    const newest = shown[shown.length - 1]?.id || "";
    const fresh = state.newestShown && newest !== state.newestShown ? newest : "";
    state.newestShown = newest || state.newestShown || "-";
    const report = message => `<button type="button" class="glf-report" data-action="report" data-id="${escapeHtml(message.id)}">${escapeHtml(tr("report"))}</button>`;
    const bubbles = shown.map(message => withLike(message, likes, (() => {
      const mine = message.sender === me;
      // Время и галочки: одна — отправлено, две — прочитано.
      const meta = (extra = "") => `<small class="glf-meta"><time>${escapeHtml(timeOf(message.created_at))}</time>${mine ? `<span role="img" aria-label="${escapeHtml(tr(message.read_at ? "msgRead" : "msgSent"))}">${message.read_at ? ICONS.ticks : ICONS.tick}</span>` : ""}${extra}</small>`;
      // Карточка-приглашение: бордовая, со значком, кнопкой и большим предметом справа.
      const card = (icon, text, button = "", decor = "", kind = "") => `<li class="glf-bubble glf-invite glf-card${kind}${mine ? " is-mine" : ""}${decor ? " has-decor" : ""}"><span class="glf-card-ic" aria-hidden="true">${icon}</span><span class="glf-card-text">${escapeHtml(text)}</span>${button}${decor ? `<span class="glf-card-decor" aria-hidden="true">${decor}</span>` : ""}${meta()}</li>`;
      const pill = (action, label, room = "", arrow = true) => `<button class="glf-pill" type="button" data-action="${action}"${room ? ` data-room="${escapeHtml(room)}"` : ""}>${escapeHtml(label)}${arrow ? ICONS.arrow : ""}</button>`;
      const invite = parseInvite(message.body);
      const rain = parseRain(message.body);
      if (rain) {
        const text = mine ? tr("rainYou", { rain: tr(`rain_${rain}`) }) : tr("rainFrom", { name: nameOf(friend), rain: tr(`rain_${rain}`) });
        return card(RAINS[rain][0], text, pill("replay-rain", `${RAINS[rain][1]} ${tr("rainAgain")}`, "", false).replace('data-action="replay-rain"', `data-action="replay-rain" data-kind="${rain}"`), "", " glf-rain-note");
      }
      const fx = parseFx(message.body);
      if (fx) return `<li class="glf-bubble glf-fx is-${fx.kind}${mine ? " is-mine" : ""}"><span>${escapeHtml(fx.text)}</span>${meta(mine ? "" : ` · ${report(message)}`)}</li>`;
      if (invite?.kind === "draw") return card("✏️", mine ? tr("drawYou") : tr("drawInvite", { name: nameOf(friend) }), mine ? "" : pill("join-draw", tr("drawJoin"), invite.room), "", " is-line");
      if (invite?.kind === "play") return card("🎲", mine ? tr("playYou") : tr("playInvite", { name: nameOf(friend) }), pill("join-table", tr("tableJoin"), invite.room), "🎲");
      if (parseCall(message.body)) return card(ICONS.phone, mine ? tr("callYou") : tr("callMissed", { name: nameOf(friend) }), pill("call", tr("callBack"), "", false), "", " glf-call-note");
      const photo = parsePhoto(message.body);
      if (photo) {
        const loaded = state.photos.get(photo);
        if (loaded === undefined) loadPhoto(photo);
        const view = loaded === "gone" ? `<span class="glf-photo-gone">${escapeHtml(tr("photoGone"))}</span>`
          : loaded ? `<img class="glf-photo${loaded.frame ? ` glu-frame-${escapeHtml(loaded.frame)}` : ""}" src="${loaded.url}" alt="${escapeHtml(mine ? tr("photoYou") : tr("photoNew", { name: nameOf(friend) }))}">`
          : `<span class="glf-photo is-loading" aria-hidden="true">📸</span>`;
        return `<li class="glf-bubble glf-photo-bubble${mine ? " is-mine" : ""}">${view}${meta()}</li>`;
      }
      const sticker = parseSticker(message.body);
      if (sticker) { const [bear, thing] = stickerParts(sticker); return `<li class="glf-sticker glf-soft${mine ? " is-mine" : ""}"><span class="glf-live is-${STICKER_MOTION[sticker] || "bob"}" aria-hidden="true"><i>${bear}</i><i>${thing}</i></span><span class="glf-soft-side"><b>${escapeHtml(stickerLabel(sticker))}</b>${meta()}</span></li>`; }
      if (invite) return card("🎲", mine ? tr("inviteYou", { game: gameTitle(invite.kind) }) : tr("newInvite", { name: nameOf(friend), game: gameTitle(invite.kind) }), mine ? "" : pill("join-game", tr("invitePlay"), invite.room), "🎲");
      const reaction = parseReaction(message.body);
      if (reaction) return `<li class="glf-react glf-soft${mine ? " is-mine" : ""}"><span class="glf-react-emoji" aria-hidden="true">${REACTIONS[reaction]}</span>${meta()}</li>`;
      const bear = parseBear(message.body);
      if (bear) {
        const gift = tr(`gift_${bear.gift}`);
        return card("🧸", `${mine ? tr("bearYou", { gift }) : tr("bearGift", { gift })} ${GIFTS[bear.gift]}`, mine ? "" : `<button class="glf-pill" type="button" data-action="see-bear" data-id="${escapeHtml(message.id)}">${escapeHtml(tr("bearOpen"))}${ICONS.arrow}</button>`, "", " glf-bear-note");
      }
      const voice = parseVoice(message.body);
      if (voice) {
        const playing = state.playing?.id === voice.id;
        const gone = state.voices.get(voice.id) === "gone";
        return `<li class="glf-bubble glf-voice${mine ? " is-mine" : ""}"><button class="glf-voice-play${playing ? " is-playing" : ""}" type="button" data-action="play-voice" data-id="${escapeHtml(voice.id)}" aria-label="${escapeHtml(tr(playing ? "voiceStop" : "voicePlay"))}"${gone ? " disabled" : ""}><span aria-hidden="true">${playing ? "■" : "▶"}</span></button><span>${escapeHtml(gone ? tr("voiceGone") : tr("voiceMessage", { time: clock(voice.seconds) }))}</span>${meta(mine ? "" : ` · ${report(message)}`)}</li>`;
      }
      return `<li class="glf-bubble${mine ? " is-mine" : ""}"><span>${escapeHtml(message.body)}</span>${meta(mine ? "" : ` · ${report(message)}`)}</li>`;
    })())).map((html, index) => shown[index].id === fresh ? html.replace(/^<li class="/u, '<li class="is-new ') : html).join("");
    const online = isOnline(friend);
    const head = (action, icon, label, extra = "") => `<button class="glf-head-button is-${action}" type="button" data-action="${action}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"${extra}>${icon}</button>`;
    return `
      <div class="glf-chat-head">
        <button class="glf-head-back" type="button" data-action="list" aria-label="${escapeHtml(tr("back"))}" title="${escapeHtml(tr("back"))}">${ICONS.back}</button>
        <span class="glf-avatar glf-head-ava${online ? " is-online" : ""}" aria-hidden="true"><span>${initial(nameOf(friend))}</span></span>
        <span class="glf-who"><b class="glf-name"><span>${escapeHtml(nameOf(friend))}</span><i class="glf-name-heart">${ICONS.heart}</i></b><small class="${online ? "is-online" : ""}">${escapeHtml(statusText(friend))}</small></span>
        <span class="glf-head-actions">
          ${window.GlowLetterRanking ? head("ranking", ICONS.trophy, tr("ranking")) : ""}
          ${head("call", ICONS.phone, tr("callButton"))}
          ${head("video-call", ICONS.video, tr("videoCall"))}
          ${head("menu", ICONS.more, tr("menu"), ` aria-expanded="${state.menuOpen}"`)}
        </span>
        ${state.menuOpen ? `<div class="glf-menu" role="menu">
          <button type="button" role="menuitem" data-action="world">🌍 ${escapeHtml(tr("worldOpen"))}</button>
          ${window.GlowLetterRanking ? `<button type="button" role="menuitem" data-action="ranking">🏆 ${escapeHtml(tr("ranking"))}</button>` : ""}
          <button type="button" role="menuitem" data-action="remove">${escapeHtml(tr("remove"))}</button>
          <button class="glg-danger" type="button" role="menuitem" data-action="block">${escapeHtml(tr("block"))}</button>
        </div>` : ""}
      </div>
      <div class="glf-feed">
        <span class="glf-feed-glow" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        <ul class="glf-messages">${bubbles || `<li class="glf-empty">${HEART}<span>${escapeHtml(tr("emptyChat"))}</span><button class="glf-pill" type="button" data-action="table">🎲 ${escapeHtml(tr("tableButton"))}</button></li>`}</ul>
      </div>
      <div class="glf-chat-foot${state.typing ? " is-typing" : ""}">
        ${state.recording ? "" : `<div class="glf-quick" role="group" aria-label="${escapeHtml(tr("reactions"))}">${Object.entries(REACTIONS).map(([kind, emoji]) => `<button type="button" data-action="react" data-kind="${kind}" aria-label="${escapeHtml(emoji)}">${emoji}</button>`).join("")}<button class="glf-quick-more${state.rainPicking ? " is-open" : ""}" type="button" data-action="effects" aria-expanded="${Boolean(state.rainPicking)}" aria-label="${escapeHtml(tr("effects"))}" title="${escapeHtml(tr("effects"))}">${ICONS.plus}</button></div>`}
        ${state.fxOpen ? `<div class="glf-fx-menu" role="menu" aria-label="${escapeHtml(tr("fxTitle"))}"><b>${escapeHtml(tr("fxTitle"))}</b>${Object.entries(FX).map(([kind, emoji]) => `<button type="button" role="menuitem" data-action="send-fx" data-fx="${kind}"><span aria-hidden="true">${emoji}</span>${escapeHtml(tr(`fx_${kind}`))}</button>`).join("")}</div>` : ""}
        ${renderCompose()}
        ${state.error ? `<p class="glg-error" role="alert">${escapeHtml(state.error)}</p>` : ""}
        ${renderTools()}
      </div>`;
  }

  const pickerOpen = () => Boolean(state.picking || state.bearPicking || state.rainPicking || state.stickerPicking || state.emojiOpen || state.callPick);
  function closePickers() { state.picking = false; state.bearPicking = false; state.rainPicking = false; state.stickerPicking = false; state.emojiOpen = false; state.callPick = false; state.fxOpen = false; }

  // Под полем ввода: плитки 3 × 2, большая «Сыграть вместе» и управление дружбой; выбор (подарок, наклейка, игра) — на их месте.
  function renderTools() {
    if (pickerOpen()) {
      const title = state.emojiOpen ? tr("emojiAll") : state.rainPicking ? tr("effects") : state.callPick ? tr("callButton") : state.bearPicking ? tr("bearPick") : state.stickerPicking ? tr("stickerPick") : tr("pickGame");
      return `<section class="glf-dock glf-picker" id="glf-tools">
        <header class="glf-picker-head"><b>${escapeHtml(title)}</b><button class="glf-picker-close" type="button" data-action="close-picker" aria-label="${escapeHtml(tr("close"))}">${ICONS.close}</button></header>
        ${state.emojiOpen ? `<div class="glf-emoji-grid">${EMOJIS.map(emoji => `<button type="button" data-action="emoji-insert" data-emoji="${emoji}">${emoji}</button>`).join("")}</div>` : ""}
        ${state.callPick ? `<div class="glf-call-pick"><button class="glf-tile is-rose" type="button" data-action="call"><span class="glf-tile-ic" aria-hidden="true">📞</span><span><b>${escapeHtml(tr("callAudio"))}</b></span></button><button class="glf-tile is-lilac" type="button" data-action="video-call"><span class="glf-tile-ic" aria-hidden="true">🎥</span><span><b>${escapeHtml(tr("callVideo"))}</b></span></button></div>` : ""}
        ${state.rainPicking ? `<div class="glf-rain-grid">${Object.entries(RAINS).map(([kind, [emoji]]) => `<button type="button" data-action="send-rain" data-kind="${kind}"><span aria-hidden="true">${emoji}</span>${escapeHtml(tr(`rain_${kind}`))}</button>`).join("")}</div><p class="glf-picker-note">${escapeHtml(tr("fxHint"))}</p>` : ""}
        ${state.bearPicking ? `<div class="glf-gift-grid">${Object.entries(GIFTS).map(([gift, emoji]) => `<button type="button" data-action="send-bear" data-gift="${gift}" aria-label="${escapeHtml(tr(`gift_${gift}`))}" title="${escapeHtml(tr(`gift_${gift}`))}">${emoji}</button>`).join("")}</div>` : ""}
        ${state.stickerPicking ? renderStickers() : ""}
        ${renderGamePicker()}
      </section>`;
    }
    const canPlay = (games()?.roomKinds || []).length > 0;
    return `<section class="glf-dock" id="glf-tools">
      <div class="glf-tiles">${TILES.map(([action, icon, title, sub, tone]) => `<button class="glf-tile ${tone}" type="button" data-action="${action}"><span class="glf-tile-ic" aria-hidden="true">${icon}</span><span><b>${escapeHtml(tr(title))}</b><small>${escapeHtml(tr(sub))}</small></span></button>`).join("")}</div>
      <button class="glf-play-big" type="button" data-action="${canPlay ? "pick-game" : "table"}"><i class="glf-spark" aria-hidden="true"></i><i class="glf-spark" aria-hidden="true"></i><span class="glf-play-dice" aria-hidden="true">🎲</span><span><b>${escapeHtml(tr("playTogether"))}</b><small>${escapeHtml(tr("playSub"))}</small></span>${ICONS.chevron}</button>
      <div class="glf-friend-actions"><button class="is-remove" type="button" data-action="remove">${ICONS.removeFriend}<span>${escapeHtml(tr("remove"))}</span></button><i aria-hidden="true"></i><button class="is-block" type="button" data-action="block">${ICONS.block}<span>${escapeHtml(tr("block"))}</span></button></div>
    </section>`;
  }

  // Поле сообщения: микрофон, поле со смайликом, скрепка (фото) и бордовая «Отправить»; во время записи — таймер.
  function renderCompose() {
    if (state.recording) {
      return `<div class="glf-compose glf-recording" role="status"><span class="glf-rec-dot" aria-hidden="true"></span><b class="glf-rec-time">${escapeHtml(tr("voiceRecording", { time: clock(state.recording.seconds || 0) }))}</b><button class="glf-pill is-light" type="button" data-action="voice-cancel">${escapeHtml(tr("voiceCancel"))}</button><button class="glf-round glf-send" type="button" data-action="voice-send" aria-label="${escapeHtml(tr("send"))}">${ICONS.send}</button></div><p class="glf-voice-note">${escapeHtml(tr("voiceNote"))}</p>`;
    }
    return `<form class="glf-compose glf-bar" data-submit="send" novalidate>
        <button class="glf-round glf-mic" type="button" data-action="voice-start" aria-label="${escapeHtml(tr("voiceRecord"))}" title="${escapeHtml(tr("voiceRecord"))}">${ICONS.mic}</button>
        <span class="glf-field">
          <textarea name="body" rows="1" maxlength="1000" dir="auto" placeholder="${escapeHtml(tr("placeholder"))}"></textarea>
          <button class="glf-emoji" type="button" data-action="react-pick" aria-expanded="${Boolean(state.emojiOpen)}" aria-label="${escapeHtml(tr("emojiAll"))}" title="${escapeHtml(tr("emojiAll"))}">${ICONS.smile}</button>
        </span>
        <button class="glf-round glf-attach" type="button" data-action="attach" aria-label="${escapeHtml(tr("attach"))}" title="${escapeHtml(tr("attach"))}"${state.photoBusy ? " disabled" : ""}>${ICONS.clip}</button>
        <input class="glf-photo-input" type="file" accept="image/*" hidden tabindex="-1">
        <button class="glf-round glf-send" type="submit" aria-label="${escapeHtml(tr("send"))}" title="${escapeHtml(tr("fxHint"))}"${state.busy ? " disabled" : ""}>${ICONS.send}</button>
      </form>`;
  }

  // Поле растёт вместе с текстом (до пяти строк).
  function sizeField(field) {
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 120)}px`;
    field.form?.classList.toggle("has-text", field.value.trim() !== "");
  }

  // Смайлик из коллекции — в текст, туда, где стоит курсор.
  function insertEmoji(emoji) {
    const field = state.root?.querySelector(".glf-compose textarea");
    if (!field) return;
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? start;
    field.value = `${field.value.slice(0, start)}${emoji}${field.value.slice(end)}`.slice(0, 1000);
    const at = start + emoji.length;
    try { field.setSelectionRange(at, at); } catch {}
    sizeField(field);
  }

  // Фото через скрепку: сжимаем до JPEG и отправляем так же, как из «Нашего мира».
  async function sendChatPhoto(file) {
    const friend = state.chatWith;
    if (!friend || !file || state.photoBusy) return;
    state.photoBusy = true;
    notify(tr("photoSending"), 2000);
    try {
      const bitmap = await createImageBitmap(file);
      let blob = null;
      for (const [side, quality] of [[1280, .82], [1024, .76], [800, .7], [640, .64]]) {
        const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
        if (blob && blob.size <= 440000) break;
      }
      bitmap.close?.();
      if (!blob || blob.size > 440000) throw new Error("too_big");
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      await sendPhoto(friend.user_id, "image/jpeg", base64, null);
      online()?.burst?.("📸", { small: true });
    } catch (error) {
      const message = String(error?.message || "");
      if (/premium_required/u.test(message)) app()?.openPaywall?.();
      else notify(message === "too_big" ? tr("photoTooBig") : message === "rate_limited" ? tr("rateLimited") : tr("failed"), 3200);
    } finally {
      state.photoBusy = false;
    }
  }

  // «Сыграть вместе»: выбор живой игры прямо из переписки (открывается плиткой).
  function renderGamePicker() {
    const kinds = games()?.roomKinds || [];
    if (!kinds.length || !state.picking) return "";
    return `<section class="glf-games"><h3>${escapeHtml(tr("pickGame"))}</h3><div class="glf-games-grid">${kinds.map(kind => `<button class="glg-secondary" type="button" data-action="start-game" data-kind="${escapeHtml(kind)}">${escapeHtml(gameTitle(kind))}</button>`).join("")}</div></section>`;
  }

  // ——— Действия ———

  async function rpc(name, args) {
    const db = client();
    if (!db) throw new Error("offline");
    const { data, error } = await db.rpc(name, args);
    if (error) throw error;
    return data;
  }

  async function onAction(action, target) {
    state.error = "";
    if (action !== "menu") state.menuOpen = false;
    try {
      switch (action) {
        case "close": close(); return;
        case "signin": close(); app()?.requestSignIn?.("friends"); return;
        case "list": stopVoice(false); stopPlayback(); state.chatWith = null; state.view = "list"; render(); refresh(false); return;
        case "save-name": {
          const name = cleanName(target.elements.name.value);
          if (!name) { state.error = tr("nameInvalid"); render(); return; }
          try { await rpc("glowletter_friends_set_name", { p_name: name }); }
          catch (error) { state.error = String(error?.message) === "forbidden" ? tr("nameInvalid") : tr("failed"); render(); return; }
          state.me = { ...state.me, display_name: name };
          state.view = "list";
          render();
          return;
        }
        case "copy-code": {
          try { await navigator.clipboard.writeText(state.me?.friend_code || ""); notify(tr("codeCopied"), 2400); }
          catch { window.prompt(tr("myCode"), state.me?.friend_code || ""); }
          return;
        }
        case "share-code": return shareCode();
        case "add": {
          const code = String(target.elements.code.value || "").toUpperCase().replace(/[^A-Z0-9]/gu, "");
          if (!code) return;
          state.busy = true; render();
          try {
            const result = await rpc("glowletter_friends_request", { p_code: code });
            notify(tr({ sent: "sent", accepted: "accepted", already: "already", pending: "pendingAlready" }[result] || "sent"), 3200);
          } catch (error) {
            const message = String(error?.message || "");
            state.error = message === "not_found" ? tr("notFound") : message === "self" ? tr("self") : message === "rate_limited" ? tr("rateLimited") : tr("failed");
          }
          state.busy = false;
          await refresh(false);
          return;
        }
        case "accept": case "decline":
          await rpc("glowletter_friends_respond", { p_user: target.dataset.id, p_accept: action === "accept" });
          if (action === "accept") notify(tr("accepted"), 3000);
          await refresh(false);
          return;
        case "chat": return openChat(target.dataset.id);
        case "menu": state.menuOpen = !state.menuOpen; render(); return;
        case "react-pick": { const open = !state.emojiOpen; closePickers(); state.emojiOpen = open; render(); return; }
        case "emoji-insert": insertEmoji(target.dataset.emoji); return;
        case "close-picker": closePickers(); render(); return;
        case "call-pick": { const open = !state.callPick; closePickers(); state.callPick = open; render(); return; }
        case "attach": state.root?.querySelector(".glf-photo-input")?.click(); return;
        case "video-call": { const friend = state.chatWith; if (friend) window.GlowLetterCall?.start?.({ user_id: friend.user_id, name: nameOf(friend) }, { video: true }); return; }
        case "ranking": close(); window.GlowLetterRanking?.open?.({ scope: "friends" }); return;
        case "rain-pick": case "effects": { const open = !state.rainPicking; closePickers(); state.rainPicking = open; render(); return; }
        case "send-rain": return sendRain(state.chatWith?.user_id, target.dataset.kind);
        case "replay-rain": playRain(target.dataset.kind); return;
        case "send-fx": { const form = state.root?.querySelector("form.glf-compose"); state.fxOpen = false; if (form) return sendMessage(form, target.dataset.fx); return; }
        case "pick-game": { const open = !state.picking; closePickers(); state.picking = open; render(); return; }
        case "start-game": {
          const friend = state.chatWith;
          if (!friend) return;
          state.picking = false;
          close();
          games()?.createFor?.(target.dataset.kind, { id: friend.user_id, name: nameOf(friend) });
          return;
        }
        case "join-game": close(); games()?.join?.(target.dataset.room); return;
        case "react": return sendReaction(state.chatWith?.user_id, target.dataset.kind);
        case "bear-pick": { const open = !state.bearPicking; closePickers(); state.bearPicking = open; render(); return; }
        case "send-bear": return sendBear(state.chatWith?.user_id, target.dataset.gift);
        case "see-bear": {
          const message = state.messages.find(item => item.id === target.dataset.id);
          if (message) showBear(state.chatWith, message);
          return;
        }
        case "draw": return startDraw(state.chatWith);
        case "call": { const friend = state.chatWith; if (friend) window.GlowLetterCall?.start?.({ user_id: friend.user_id, name: nameOf(friend) }); return; }
        case "table": return startTable(state.chatWith);
        case "join-table": { const friend = state.chatWith; if (!friend) return; close(); window.GlowLetterTable?.open?.({ room: target.dataset.room, friend: { user_id: friend.user_id, name: nameOf(friend) } }); return; }
        case "world": { const friend = state.chatWith; close(); world()?.open?.(friend?.user_id); return; }
        case "sticker-pick": { const open = !state.stickerPicking; closePickers(); state.stickerPicking = open; if (open) await world()?.loadOwned?.(); render(); return; }
        case "send-sticker": return sendSticker(state.chatWith?.user_id, target.dataset.id);
        case "join-draw": { const friend = state.chatWith; close(); online()?.draw?.(target.dataset.room, { id: friend?.user_id, name: nameOf(friend) }); return; }
        case "push-on": return enablePush();
        case "push-off": notify(tr("pushDisabled"), 2400); return disablePush();
        case "voice-start": return startVoice();
        case "voice-cancel": stopVoice(false); return;
        case "voice-send": stopVoice(true); return;
        case "play-voice": return playVoice(target.dataset.id);
        case "send": return sendMessage(target);
        case "report": {
          if (!window.confirm(tr("reportConfirm"))) return;
          await rpc("glowletter_messages_report", { p_message: target.dataset.id, p_reason: "abuse" });
          notify(tr("reported"), 3000);
          return;
        }
        case "block": {
          const friend = state.chatWith;
          if (!friend || !window.confirm(tr("blockConfirm", { name: nameOf(friend) }))) return;
          await rpc("glowletter_friends_block", { p_user: friend.user_id });
          notify(tr("blocked"), 3000);
          state.chatWith = null; state.view = "list";
          await refresh(false);
          return;
        }
        case "remove": {
          const friend = state.chatWith;
          if (!friend || !window.confirm(tr("removeConfirm", { name: nameOf(friend) }))) return;
          await rpc("glowletter_friends_remove", { p_user: friend.user_id });
          notify(tr("removed"), 3000);
          state.chatWith = null; state.view = "list";
          await refresh(false);
          return;
        }
        default:
      }
    } catch {
      state.busy = false;
      state.error = tr("failed");
      render();
    }
  }

  async function shareCode() {
    const code = state.me?.friend_code || "";
    const text = tr("shareText", { code });
    const url = String(app()?.getState?.().publicShareUrl || "https://bezam.org/");
    const bridge = window.NurShare;
    if (bridge && typeof bridge.share === "function") { try { bridge.share(tr("title"), text, url); return; } catch {} }
    if (navigator.share) { try { await navigator.share({ title: tr("title"), text, url }); return; } catch (error) { if (error?.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(`${text}\n${url}`); notify(tr("codeCopied"), 2400); } catch { window.prompt(tr("myCode"), code); }
  }

  async function refresh(first) {
    if (!signedIn()) { state.view = "signin"; render(); updateBadge(); return; }
    try {
      if (first || !state.me) {
        const me = await rpc("glowletter_friends_me", {});
        state.me = Array.isArray(me) ? me[0] : me;
      }
      state.rows = (await rpc("glowletter_friends_list", {})) || [];
      if (state.view === "loading") state.view = state.me?.display_name ? "list" : "name";
      if (state.chatWith) state.chatWith = state.rows.find(row => row.user_id === state.chatWith.user_id) || state.chatWith;
    } catch {
      if (state.view === "loading") state.view = "list";
      state.error = tr("failed");
    }
    updateBadge();
    if (state.view !== "chat") render();
    else {
      const status = state.root?.querySelector(".glf-chat-head small");
      if (status) { status.textContent = statusText(state.chatWith); status.classList.toggle("is-online", isOnline(state.chatWith)); }
    }
  }

  async function openChat(friendId, options = {}) {
    const friend = state.rows.find(row => row.user_id === friendId);
    if (!friend) return;
    state.chatWith = friend;
    closePickers();
    state.picking = Boolean(options.pick);
    state.menuOpen = false;
    state.typing = false;
    state.view = "chat";
    state.messages = [];
    state.newestShown = "";
    render();
    const db = client();
    const me = userId();
    const { data } = await db.from("glowletter_messages").select("id, sender, recipient, body, created_at, read_at")
      .or(`and(sender.eq.${me},recipient.eq.${friendId}),and(sender.eq.${friendId},recipient.eq.${me})`)
      .order("created_at", { ascending: false }).limit(150);
    if (state.chatWith?.user_id !== friendId) return;
    state.messages = (data || []).reverse();
    state.newestShown = "";
    render();
    const rain = friend.unread ? [...state.messages].reverse().find(item => item.sender === friendId && !item.read_at && parseRain(item.body)) : null;
    if (rain) setTimeout(() => playRain(parseRain(rain.body)), 350);
    if (friend.unread) {
      await rpc("glowletter_messages_mark_read", { p_from: friendId }).catch(() => {});
      friend.unread = 0;
      updateBadge();
    }
  }

  async function sendMessage(form, fx = "") {
    const friend = state.chatWith;
    const textarea = form.elements.body;
    const text = String(textarea.value || "").trim();
    const prefix = FX[fx] ? `[[fx:${fx}]]` : "";
    const body = prefix + text.slice(0, 1000 - prefix.length);
    if (!friend || !text || state.busy) return;
    state.busy = true;
    try {
      const id = await rpc("glowletter_messages_send", { p_to: friend.user_id, p_body: body });
      state.messages.push({ id, sender: userId(), recipient: friend.user_id, body, created_at: new Date().toISOString() });
      state.busy = false;
      textarea.value = "";
      render();
      if (prefix) fxBurst(fx);
    } catch (error) {
      const message = String(error?.message || "");
      state.busy = false;
      state.error = message === "forbidden" ? tr("forbidden") : message === "rate_limited" ? tr("rateLimited") : tr("failed");
      render();
      const again = state.root?.querySelector(".glf-compose textarea");
      if (again) { again.value = text; sizeField(again); }
    }
  }

  // ——— Уведомления на телефон (Android, мост NurNotify) ———

  const PUSH_USER_KEY = "glowletter-push-user";
  const readPushUser = () => { try { return localStorage.getItem(PUSH_USER_KEY) || ""; } catch { return ""; } };
  const notifier = () => (typeof window.NurNotify?.available === "function" ? window.NurNotify : null);
  const pushOn = () => { try { return Boolean(notifier()?.enabled()); } catch { return false; } };
  // Тексты уведомлений — на языке приложения; телефон подставляет имя и текст сам.
  const pushTexts = () => JSON.stringify({
    channel: tr("pushChannel"), noName: tr("noName"), text: tr("newMessage"), voice: tr("voiceNew"), bear: tr("bearVisit"),
    draw: tr("drawInvite"), game: tr("pushGame"), many: tr("pushMany"), opened: tr("pushOpened"), openedMany: tr("pushOpenedMany"), reply: tr("pushReply"),
    call: tr("pushCall"), photo: tr("pushPhoto"), sticker: tr("pushSticker")
  });

  function renderPush() {
    if (!notifier()) return "";
    const enabled = pushOn();
    return `<section class="glg-section glf-push"><h3>🔔 ${escapeHtml(tr("pushTitle"))}</h3><p class="glg-muted">${escapeHtml(tr("pushNote"))}</p>
      <div class="glf-push-row"><small class="${enabled ? "is-online" : ""}">${escapeHtml(tr(enabled ? "pushEnabled" : "pushDisabled"))}</small><button class="${enabled ? "glg-secondary" : "glg-primary"} glf-small" type="button" data-action="${enabled ? "push-off" : "push-on"}">${escapeHtml(tr(enabled ? "pushOff" : "pushOn"))}</button></div></section>`;
  }

  async function enablePush() {
    const bridge = notifier();
    if (!bridge) return;
    const token = await rpc("glowletter_push_register", {});
    bridge.enable(String(token || ""), pushTexts());
    try { localStorage.setItem(PUSH_USER_KEY, userId()); } catch {}
    notify(tr("pushEnabled"), 2600);
    render();
    // Разрешение спрашивает система; если его не дали, подсказываем, где включить.
    setTimeout(() => { try { if (pushOn() && !bridge.permitted()) notify(tr("pushBlocked"), 5200); } catch {} }, 6000);
  }

  async function disablePush() {
    const bridge = notifier();
    if (!bridge) return;
    let token = "";
    try { token = String(bridge.disable() || ""); } catch {}
    try { localStorage.removeItem(PUSH_USER_KEY); } catch {}
    if (/^[0-9a-f]{64}$/u.test(token)) await rpc("glowletter_push_unregister", { p_token: token }).catch(() => {});
    // Виджет с фото друга работает на том же ключе устройства — выдаём ему новый.
    if (window.NurWidget?.installed?.() && userId()) {
      try { const fresh = await rpc("glowletter_push_register"); if (/^[0-9a-f]{64}$/u.test(String(fresh))) window.NurWidget.enable(String(fresh)); } catch {}
    }
    render();
  }

  // ——— Онлайн: сердечки, Тёпа, «Рисуем вместе», голосовые ———

  async function sendSpecial(friendId, body) {
    const id = await rpc("glowletter_messages_send", { p_to: friendId, p_body: body });
    if (state.chatWith?.user_id === friendId) {
      state.messages.push({ id, sender: userId(), recipient: friendId, body, created_at: new Date().toISOString() });
      if (state.root && !state.root.hidden && state.view === "chat") render();
    }
    return id;
  }

  function playRain(kind) {
    const pair = RAINS[kind];
    if (!pair) return;
    online()?.burst?.(pair[0]);
    setTimeout(() => online()?.burst?.(pair[1], { small: true }), 200);
  }

  async function sendRain(friendId, kind) {
    if (!friendId || !RAINS[kind]) return;
    state.rainPicking = false;
    playRain(kind);
    try { await sendSpecial(friendId, `[[rain:${kind}]]`); }
    catch (error) { state.error = String(error?.message) === "rate_limited" ? tr("rateLimited") : tr("failed"); }
    render();
  }

  function fxBurst(kind) {
    if (kind === "hearts") online()?.burst?.("💕", { small: true });
    else if (kind === "glow") online()?.burst?.("✨", { small: true });
  }

  function openFx() {
    const field = state.root?.querySelector(".glf-compose textarea");
    if (!field?.value.trim()) return;
    try { navigator.vibrate?.(20); } catch {}
    closePickers();
    state.fxOpen = true;
    render();
  }

  // Кто поставил сердечко на какое сообщение: последнее «like/unlike» от человека решает.
  function likeMap() {
    const likes = new Map();
    for (const message of state.messages) {
      const like = parseLike(message.body);
      if (!like) continue;
      const set = likes.get(like.id) || new Set();
      if (like.on) set.add(message.sender); else set.delete(message.sender);
      likes.set(like.id, set);
    }
    return likes;
  }

  // Сердечко ставится на обычные сообщения, эффекты, фото, голосовые и наклейки.
  function withLike(message, likes, html) {
    const body = message.body;
    if (parseInvite(body) || parseCall(body) || parseReaction(body) || parseBear(body) || parseRain(body)) return html;
    const count = likes.get(message.id)?.size || 0;
    const badge = count ? `<span class="glf-liked" role="img" aria-label="${escapeHtml(tr("liked"))}">❤️${count > 1 ? "<b>2</b>" : ""}</span>` : "";
    return html.replace(/^<li class="([^"]*)"/u, (all, classes) => `<li class="${classes}${count ? " is-liked" : ""}" data-mid="${escapeHtml(message.id)}"`).replace(/<\/li>$/u, `${badge}</li>`);
  }

  async function toggleLike(bubble) {
    const friend = state.chatWith;
    const id = bubble.dataset.mid;
    if (!friend || !UUID_ONLY.test(id)) return;
    const mine = likeMap().get(id)?.has(userId());
    if (!mine) {
      const rect = bubble.getBoundingClientRect();
      const pop = document.createElement("span");
      pop.className = "glf-heart-pop";
      pop.setAttribute("aria-hidden", "true");
      pop.textContent = "❤️";
      pop.style.left = `${rect.left + rect.width / 2}px`;
      pop.style.top = `${rect.top + rect.height / 2}px`;
      document.body.append(pop);
      setTimeout(() => pop.remove(), 900);
      try { navigator.vibrate?.(15); } catch {}
    }
    try { await sendSpecial(friend.user_id, `[[${mine ? "unlike" : "like"}:${id}]]`); }
    catch (error) { notify(String(error?.message) === "rate_limited" ? tr("rateLimited") : tr("failed"), 3200); }
  }

  // Не чаще раза в секунду: иначе легко упереться в лимит сообщений.
  async function sendReaction(friendId, kind) {
    if (!friendId || !REACTIONS[kind] || Date.now() - state.lastReaction < 1000) return;
    state.lastReaction = Date.now();
    online()?.burst?.(REACTIONS[kind], { small: true });
    try { await sendSpecial(friendId, `[[react:${kind}]]`); notify(tr("reactSent", { emoji: REACTIONS[kind] }), 1800); }
    catch (error) { notify(String(error?.message) === "rate_limited" ? tr("rateLimited") : tr("failed"), 3200); }
  }

  async function sendBear(friendId, gift) {
    if (!friendId || !GIFTS[gift]) return;
    const outfit = window.GlowLetterCouple?.bearFor?.(friendId) || "o01";
    state.bearPicking = false;
    try { await sendSpecial(friendId, `[[bear:${outfit}:${gift}]]`); notify(`🧸 ${tr("bearSent")}`, 2600); }
    catch (error) { state.error = String(error?.message) === "rate_limited" ? tr("rateLimited") : tr("failed"); }
    render();
  }

  function showBear(sender, message) {
    const bear = parseBear(message?.body);
    if (!bear) return;
    const senderId = message.sender;
    online()?.bearVisit?.({
      title: tr("bearVisit", { name: nameOf(sender) }),
      gift: tr("bearGift", { gift: tr(`gift_${bear.gift}`) }),
      giftEmoji: GIFTS[bear.gift],
      outfit: bear.outfit,
      thanks: tr("bearThanks"),
      back: tr("bearBack"),
      close: tr("close"),
      onThanks: () => sendReaction(senderId, "heart"),
      onBack: async () => {
        if (!state.rows.length) await refresh(false);
        await open();
        await openChat(senderId);
        state.bearPicking = true;
        render();
      }
    });
  }

  async function startTable(friend) {
    if (!friend) return;
    if (!window.GlowLetterApp?.getState?.().premium) { window.GlowLetterApp?.openPaywall?.(); return; }
    const call = window.GlowLetterCall;
    const room = call?.active?.() ? call.room() : crypto.randomUUID();
    if (!call?.active?.()) {
      try { await sendSpecial(friend.user_id, `[[play:${room}]]`); }
      catch (error) { state.error = String(error?.message) === "rate_limited" ? tr("rateLimited") : tr("failed"); render(); return; }
    }
    close();
    window.GlowLetterTable?.open?.({ room, friend: { user_id: friend.user_id, name: nameOf(friend) } });
  }

  function renderStickers() {
    const owned = (world()?.owned?.() || []).filter(item => item.startsWith("sticker:")).map(item => item.slice(8)).sort();
    return `<section class="glf-games glf-gifts"><h3>${escapeHtml(tr("stickerPick"))}</h3>${owned.length
      ? `<div class="glf-gift-grid glf-sticker-grid">${owned.map(id => `<button class="glg-secondary" type="button" data-action="send-sticker" data-id="${escapeHtml(id)}" title="${escapeHtml(stickerLabel(id))}" aria-label="${escapeHtml(stickerLabel(id))}">${stickerView(id)}</button>`).join("")}</div>`
      : `<p class="glg-muted">${escapeHtml(tr("stickersNone"))}</p>`}</section>`;
  }

  async function sendSticker(friendId, id) {
    if (!friendId || !STICKER_PATTERN.test(`[[sticker:${id}]]`)) return;
    state.stickerPicking = false;
    try { await sendSpecial(friendId, `[[sticker:${id}]]`); }
    catch (error) { state.error = String(error?.message) === "rate_limited" ? tr("rateLimited") : tr("failed"); render(); }
  }

  // Фото из «Нашего мира»: приходит в переписку и в виджет на телефоне друга.
  async function loadPhoto(id) {
    if (state.photos.has(id)) return;
    state.photos.set(id, null);
    try {
      const rows = await rpc("glowletter_photo_get", { p_id: id });
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (!row?.image) state.photos.set(id, "gone");
      else {
        const bytes = Uint8Array.from(atob(row.image), character => character.charCodeAt(0));
        state.photos.set(id, { url: URL.createObjectURL(new Blob([bytes], { type: row.mime_type })), frame: row.frame || "", base64: row.image });
      }
    } catch {
      state.photos.delete(id);
      return;
    }
    if (state.root && !state.root.hidden && state.view === "chat") render();
  }

  async function sendPhoto(friendId, mime, base64, frame) {
    const id = await rpc("glowletter_photo_send", { p_to: friendId, p_mime: mime, p_image: base64, p_frame: frame || null });
    if (state.chatWith?.user_id === friendId && state.view === "chat") await openChat(friendId);
    return id;
  }

  async function startDraw(friend) {
    if (!friend) return;
    const room = crypto.randomUUID();
    try { await sendSpecial(friend.user_id, `[[draw:${room}]]`); }
    catch (error) { state.error = String(error?.message) === "rate_limited" ? tr("rateLimited") : tr("failed"); render(); return; }
    close();
    online()?.draw?.(room, { id: friend.user_id, name: nameOf(friend) });
  }

  // В приложении из Google Play микрофон есть только в сборках с мостом NurMicrophone (как в voice.js).
  const voiceSupported = () => !(location.hostname === "appassets.androidplatform.net" && typeof window.NurMicrophone?.available !== "function")
    && Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  const voiceMime = () => ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"].find(type => { try { return MediaRecorder.isTypeSupported(type); } catch { return false; } }) || "";

  async function startVoice() {
    if (state.recording || !state.chatWith) return;
    if (!voiceSupported()) { state.error = tr("voiceUnsupported"); render(); return; }
    stopPlayback();
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch { state.error = tr("voiceDenied"); render(); return; }
    const mime = voiceMime();
    let recorder;
    try { recorder = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 32000 }); }
    catch { stream.getTracks().forEach(track => track.stop()); state.error = tr("voiceUnsupported"); render(); return; }
    const recording = { stream, recorder, chunks: [], started: Date.now(), seconds: 0, friendId: state.chatWith.user_id, send: false, ticker: 0 };
    recorder.ondataavailable = event => { if (event.data?.size) recording.chunks.push(event.data); };
    recorder.onstop = () => finishVoice(recording);
    recorder.start(250);
    recording.ticker = setInterval(() => {
      recording.seconds = Math.floor((Date.now() - recording.started) / 1000);
      if (recording.seconds >= VOICE_MAX_SECONDS) { stopVoice(true); return; }
      const label = state.root?.querySelector(".glf-rec-time");
      if (label) label.textContent = tr("voiceRecording", { time: clock(recording.seconds) });
    }, 250);
    state.recording = recording;
    render();
    try { navigator.vibrate?.(30); } catch {}
  }

  function stopVoice(send) {
    const recording = state.recording;
    if (!recording) return;
    recording.send = send;
    clearInterval(recording.ticker);
    state.recording = null;
    if (recording.recorder.state !== "inactive") recording.recorder.stop();
    else finishVoice(recording);
    if (state.root && !state.root.hidden && state.view === "chat") render();
  }

  async function finishVoice(recording) {
    recording.stream.getTracks().forEach(track => track.stop());
    if (!recording.send) return;
    const seconds = Math.min(VOICE_MAX_SECONDS, Math.round((Date.now() - recording.started) / 1000));
    if (seconds < 1) { notify(tr("voiceShort"), 2800); return; }
    const blob = new Blob(recording.chunks, { type: recording.recorder.mimeType || voiceMime() || "audio/webm" });
    try {
      const audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const id = await rpc("glowletter_voice_send", { p_to: recording.friendId, p_mime: blob.type, p_audio: audio, p_seconds: seconds });
      const parsed = await client().from("glowletter_messages").select("id, sender, recipient, body, created_at, read_at").eq("id", id).maybeSingle();
      const message = parsed.data || null;
      if (message) {
        const voice = parseVoice(message.body);
        if (voice) state.voices.set(voice.id, URL.createObjectURL(blob));
        if (state.chatWith?.user_id === recording.friendId && !state.messages.some(item => item.id === id)) state.messages.push(message);
      }
      if (state.root && !state.root.hidden && state.view === "chat") render();
    } catch (error) {
      const message = String(error?.message || "");
      notify(message === "rate_limited" ? tr("rateLimited") : tr("failed"), 3600);
    }
  }

  function stopPlayback() {
    if (!state.playing) return;
    state.playing.audio.pause();
    state.playing = null;
  }

  async function playVoice(id) {
    if (state.playing?.id === id) { stopPlayback(); render(); return; }
    stopPlayback();
    let url = state.voices.get(id);
    if (url === "gone") return;
    if (!url) {
      try {
        const rows = await rpc("glowletter_voice_get", { p_id: id });
        const row = Array.isArray(rows) ? rows[0] : rows;
        if (!row?.audio) { state.voices.set(id, "gone"); render(); return; }
        const bytes = Uint8Array.from(atob(row.audio), character => character.charCodeAt(0));
        url = URL.createObjectURL(new Blob([bytes], { type: row.mime_type }));
        state.voices.set(id, url);
      } catch { notify(tr("failed"), 3000); return; }
    }
    const audio = new Audio(url);
    state.playing = { id, audio };
    audio.onended = () => { if (state.playing?.audio === audio) { state.playing = null; render(); } };
    try { await audio.play(); } catch { state.playing = null; notify(tr("failed"), 3000); }
    render();
  }

  // Полоска «Сейчас в сети» на главной: имя — открыть переписку, ❤️ — сердечко, 🎲 — позвать в игру.
  function renderStrip() {
    const strip = document.querySelector("#onlineStrip");
    if (!strip) return;
    const friends = signedIn() ? state.rows.filter(row => row.status === "friend" && isOnline(row)) : [];
    strip.hidden = !friends.length;
    if (!friends.length) { strip.innerHTML = ""; return; }
    strip.innerHTML = `<p class="online-strip-title"><i aria-hidden="true"></i>${escapeHtml(tr("onlineNow"))} · ${friends.length}</p>
      <ul>${friends.slice(0, 8).map(row => `<li class="online-chip">
        <button class="online-chip-name" type="button" data-online="chat" data-id="${escapeHtml(row.user_id)}"><span class="glf-avatar is-online">${initial(nameOf(row))}</span><span>${escapeHtml(nameOf(row))}</span>${row.unread ? `<b>${row.unread}</b>` : ""}</button>
        <button class="online-chip-act" type="button" data-online="heart" data-id="${escapeHtml(row.user_id)}" aria-label="${escapeHtml(tr("onlineHeart", { name: nameOf(row) }))}">❤️</button>
        ${games()?.roomKinds?.length ? `<button class="online-chip-act" type="button" data-online="play" data-id="${escapeHtml(row.user_id)}" aria-label="${escapeHtml(tr("onlinePlay", { name: nameOf(row) }))}">🎲</button>` : ""}
      </li>`).join("")}</ul>`;
  }

  async function onStrip(event) {
    const target = event.target.closest("[data-online]");
    if (!target) return;
    const id = target.dataset.id;
    if (target.dataset.online === "heart") { sendReaction(id, "heart"); return; }
    await open();
    await openChat(id, { pick: target.dataset.online === "play" });
  }

  // ——— Realtime, онлайн и значок на главной ———

  function subscribe() {
    const db = client();
    const me = userId();
    if (!db?.channel || !me || state.channelUser === me) return;
    if (state.channel) db.removeChannel?.(state.channel);
    state.channelUser = me;
    state.channel = db.channel(`glowletter-friends:${me}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "glowletter_messages", filter: `recipient=eq.${me}` }, payload => onIncoming(payload?.new))
      .on("postgres_changes", { event: "*", schema: "public", table: "glowletter_friendships", filter: `addressee=eq.${me}` }, payload => onFriendship(payload))
      .on("postgres_changes", { event: "*", schema: "public", table: "glowletter_friendships", filter: `requester=eq.${me}` }, () => refresh(false))
      .subscribe();
  }

  async function onIncoming(message) {
    if (!message?.id) return;
    const row = state.rows.find(item => item.user_id === message.sender);
    const reaction = parseReaction(message.body);
    const bear = parseBear(message.body);
    const chatOpen = state.root && !state.root.hidden && state.view === "chat" && state.chatWith?.user_id === message.sender;
    const like = parseLike(message.body);
    if (like) {
      if (chatOpen) { if (!state.messages.some(item => item.id === message.id)) state.messages.push(message); render(); rpc("glowletter_messages_mark_read", { p_from: message.sender }).catch(() => {}); }
      else if (like.on) notify(tr("likeFrom", { name: nameOf(row) }), 3200);
      return;
    }
    const rain = parseRain(message.body);
    if (rain) playRain(rain);
    const fx = parseFx(message.body);
    if (fx) fxBurst(fx.kind);
    // Сердечки летят по экрану, где бы человек ни был; в непрочитанные они не идут.
    if (reaction) {
      online()?.burst?.(REACTIONS[reaction]);
      if (chatOpen) { if (!state.messages.some(item => item.id === message.id)) state.messages.push(message); render(); }
      else notify(tr("reactFrom", { name: nameOf(row), emoji: REACTIONS[reaction] }), 3600);
      try { navigator.vibrate?.(40); } catch {}
      return;
    }
    const callRoom = parseCall(message.body);
    if (callRoom) window.GlowLetterCall?.incoming?.({ user_id: message.sender, name: nameOf(row) }, callRoom, message.created_at);
    const photo = parsePhoto(message.body);
    if (photo) toWidget(photo, nameOf(row));
    if (chatOpen) {
      if (!state.messages.some(item => item.id === message.id)) state.messages.push(message);
      render();
      rpc("glowletter_messages_mark_read", { p_from: message.sender }).catch(() => {});
      if (bear) showBear(row, message);
      return;
    }
    if (row) row.unread = (row.unread || 0) + 1;
    else await refresh(false);
    updateBadge();
    renderStrip();
    if (state.root && !state.root.hidden && state.view === "list") render();
    const sender = state.rows.find(item => item.user_id === message.sender);
    const invite = parseInvite(message.body);
    if (invite) showInvitePopup(sender, message.sender, invite);
    else if (bear) showBear(sender, message);
    else if (parseVoice(message.body)) notify(tr("voiceNew", { name: nameOf(sender) }), 5000);
    else if (callRoom) return;
    else if (photo) notify(`📸 ${tr("photoNew", { name: nameOf(sender) })}`, 5000);
    else if (parseSticker(message.body)) notify(`${nameOf(sender)}: ${previewText(message.body)}`, 4000);
    else notify(tr("newMessage", { name: nameOf(sender), text: previewText(message.body).slice(0, 80) }), 5000);
  }

  // Фото пришло, пока приложение открыто, — сразу в виджет на главном экране.
  async function toWidget(id, name) {
    const bridge = window.NurWidget;
    if (!bridge?.installed?.()) return;
    await loadPhoto(id);
    const loaded = state.photos.get(id);
    if (loaded?.base64) { try { bridge.show(id, name, loaded.base64); } catch {} }
  }

  // Большое окно «Имя зовёт вас в игру» поверх любого экрана — не нужно заходить в «Друзья».
  function showInvitePopup(sender, senderId, invite) {
    document.querySelector(".glf-invite-pop")?.remove();
    const drawing = invite.kind === "draw";
    const table = invite.kind === "play";
    const pop = document.createElement("div");
    pop.className = "glf-invite-pop";
    pop.innerHTML = `
      <div class="glf-invite-pop-backdrop" data-pop="later"></div>
      <section class="glf-invite-pop-card" role="alertdialog" aria-modal="true" aria-labelledby="glfInvitePopTitle" aria-describedby="glfInvitePopText">
        <div class="glf-invite-pop-icon" aria-hidden="true">${drawing ? "✏️" : "🎲"}</div>
        <p class="glf-invite-pop-eyebrow" id="glfInvitePopTitle">${escapeHtml(tr(drawing ? "drawHeading" : table ? "tableHeading" : "inviteHeading"))}</p>
        <h2 id="glfInvitePopText">${escapeHtml(inviteText(invite, nameOf(sender)))}</h2>
        <div class="glf-invite-pop-actions">
          <button class="glg-secondary" type="button" data-pop="later">${escapeHtml(tr("inviteLater"))}</button>
          <button class="glg-primary" type="button" data-pop="play">${escapeHtml(tr(drawing ? "drawJoin" : table ? "tableJoin" : "invitePlay"))} →</button>
        </div>
      </section>`;
    const done = () => { pop.classList.remove("is-open"); setTimeout(() => pop.remove(), 220); };
    pop.addEventListener("click", event => {
      const action = event.target.closest("[data-pop]")?.dataset.pop;
      if (!action) return;
      done();
      if (action !== "play") return;
      if (senderId) rpc("glowletter_messages_mark_read", { p_from: senderId }).then(() => refresh(false)).catch(() => {});
      if (state.root && !state.root.hidden) close();
      if (drawing) online()?.draw?.(invite.room, { id: senderId, name: nameOf(sender) });
      else if (table) window.GlowLetterTable?.open?.({ room: invite.room, friend: { user_id: senderId, name: nameOf(sender) } });
      else games()?.join?.(invite.room);
    });
    pop.addEventListener("keydown", event => { if (event.key === "Escape") done(); });
    document.body.append(pop);
    requestAnimationFrame(() => { pop.classList.add("is-open"); pop.querySelector("[data-pop=play]")?.focus(); });
    try { navigator.vibrate?.([120, 80, 120]); } catch {}
  }

  async function onFriendship(payload) {
    await refresh(false);
    if (payload?.eventType === "INSERT" && payload.new?.status === "pending") {
      const row = state.rows.find(item => item.user_id === payload.new.requester);
      notify(tr("newRequest", { name: nameOf(row) }), 5000);
    }
  }

  function updateBadge() {
    const badge = document.querySelector("#friendsBadge");
    if (!badge) { renderStrip(); return; }
    const count = state.rows.reduce((sum, row) => sum + (row.status === "friend" ? Number(row.unread || 0) : row.status === "incoming" ? 1 : 0), 0);
    badge.hidden = !count;
    badge.textContent = String(count);
    renderStrip();
  }

  function heartbeat() {
    clearInterval(state.heartbeat);
    if (!signedIn()) return;
    const beat = () => {
      if (document.visibilityState !== "visible" || !signedIn()) return;
      rpc("glowletter_friends_touch", {}).catch(() => {});
      // Список обновляем и при закрытом окне — для полоски «Сейчас в сети».
      if (state.root && !state.root.hidden) refresh(false);
      else rpc("glowletter_friends_list", {}).then(rows => { state.rows = rows || []; updateBadge(); }).catch(() => {});
    };
    beat();
    state.heartbeat = setInterval(beat, HEARTBEAT_MS);
  }

  async function startSession() {
    if (!signedIn()) return;
    if (pushOn()) {
      // Ключ принадлежит другому аккаунту — выключаем, новый человек включит сам.
      if (readPushUser() && readPushUser() !== userId()) disablePush();
      else { try { notifier().setTexts(pushTexts()); } catch {} }
    }
    subscribe();
    heartbeat();
    try { state.rows = (await rpc("glowletter_friends_list", {})) || []; } catch {}
    updateBadge();
    showRecentInvite();
  }

  // Позвали, пока приложение было закрыто: при входе показываем свежее (до 20 минут) приглашение,
  // а непрочитанного Тёпу (до трёх дней) — его визит.
  async function showRecentInvite() {
    const db = client();
    const me = userId();
    if (!db?.from || !me) return;
    try {
      const since = new Date(Date.now() - 72 * 3600 * 1000).toISOString();
      const fresh = Date.now() - 20 * 60 * 1000;
      const { data } = await db.from("glowletter_messages").select("id, sender, body, created_at")
        .eq("recipient", me).is("read_at", null).gte("created_at", since).order("created_at", { ascending: false }).limit(30);
      // Открыли приложение по уведомлению, пока друг ещё звонит, — сразу входящий звонок.
      const ringing = (data || []).find(item => parseCall(item.body) && Date.now() - new Date(item.created_at).getTime() < 45000);
      if (ringing) {
        const caller = state.rows.find(row => row.user_id === ringing.sender);
        window.GlowLetterCall?.incoming?.({ user_id: ringing.sender, name: nameOf(caller) }, parseCall(ringing.body), ringing.created_at);
        return;
      }
      const message = (data || []).find(item => (parseInvite(item.body) && new Date(item.created_at).getTime() >= fresh) || parseBear(item.body));
      if (!message) return;
      const seenKey = `glowletter-invite-seen:${message.id}`;
      try { if (sessionStorage.getItem(seenKey)) return; sessionStorage.setItem(seenKey, "1"); } catch {}
      const sender = state.rows.find(row => row.user_id === message.sender);
      if (parseBear(message.body)) showBear(sender, message);
      else showInvitePopup(sender, message.sender, parseInvite(message.body));
    } catch {}
  }

  function stopSession() {
    clearInterval(state.heartbeat);
    // Вышли из аккаунта (а не просто ещё не вошли при запуске) — уведомления этого аккаунта больше не нужны.
    if (state.channelUser && pushOn()) disablePush();
    if (state.channel) client()?.removeChannel?.(state.channel);
    state.channel = null; state.channelUser = ""; state.rows = []; state.me = null;
    updateBadge();
    if (state.root && !state.root.hidden) { state.view = "signin"; render(); }
  }

  function localizeHome() {
    const label = document.querySelector("#friendsOpenHomeLabel");
    if (label) label.textContent = tr("home");
  }

  function init() {
    document.querySelector("#friendsOpenHome")?.addEventListener("click", () => open());
    document.querySelector("#onlineStrip")?.addEventListener("click", onStrip);
    localizeHome();
    addEventListener("glowletter-language-changed", () => setTimeout(() => { localizeHome(); render(); renderStrip(); if (pushOn()) { try { notifier().setTexts(pushTexts()); } catch {} } }, 0));
    addEventListener("glowletter-cloud-session", event => { if (event.detail?.signedIn) startSession(); else stopSession(); });
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && signedIn()) rpc("glowletter_friends_touch", {}).catch(() => {}); });
    if (signedIn()) startSession();
  }

  // Для игр: список друзей и приглашение в комнату.
  async function inviteToGame(friendId, kind, roomId) {
    const friend = state.rows.find(row => row.user_id === friendId && row.status === "friend");
    if (!friend || !INVITE_PATTERN.test(`[[game:${kind}:${roomId}]]`)) throw new Error("invalid");
    const body = `[[game:${kind}:${roomId}]]`;
    const id = await rpc("glowletter_messages_send", { p_to: friendId, p_body: body });
    if (state.chatWith?.user_id === friendId) state.messages.push({ id, sender: userId(), recipient: friendId, body, created_at: new Date().toISOString() });
    return nameOf(friend);
  }

  window.GlowLetterFriends = Object.freeze({
    open: () => open(),
    text: (key, values) => tr(key, values),
    myName: () => state.me?.display_name || "",
    friends: () => state.rows.filter(row => row.status === "friend").map(row => ({ user_id: row.user_id, name: nameOf(row), online: isOnline(row) })),
    inviteToGame,
    sendCallInvite: (friendId, room) => sendSpecial(friendId, `[[call:${room}]]`),
    sendPlayInvite: (friendId, room) => sendSpecial(friendId, `[[play:${room}]]`),
    sendPhoto,
    // Окно приглашения (для проверки и будущих ссылок-приглашений).
    showInvite: (name, kind, roomId) => { if (INVITE_PATTERN.test(`[[game:${kind}:${roomId}]]`)) showInvitePopup({ display_name: name }, "", { kind, room: roomId }); }
  });
  init();
})();
