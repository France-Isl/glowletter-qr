/*
  «Наш мир» (2.4.26): всё, к чему пара возвращается каждый день.

  • Огонёк дней — сколько дней подряд вы оба были в GlowLetter друг с другом.
  • Тёпа-питомец — кормите, играете, купаете вдвоём; растёт уровнями.
  • Сундук Тёпы — раз в день наклейка для переписки или рамка для фото.
  • Фото на экран друга — снимок сразу в переписке и в виджете на телефоне.
  • Слово дня (word.js), звонок (call.js), «Игровой стол» (table.js).
  • Рейтинг: пары недели, лиги, друзья; счёт в каждой игре; значки и титулы.

  Сервер: glowletter_pair_summary / pet_care / chest_* / ranking* / photo_send
  (миграция 20261031100000_play_together.sql). Всё — с полным доступом;
  питомец и игры открыты паре, если доступ есть хотя бы у одного.
*/
(() => {
  "use strict";

  if (window.GlowLetterWorld) return;

  const TEXT = {
    ru: {
      eyebrow: "Только вы двое", title: "Наш мир", close: "Закрыть", signIn: "Войдите, чтобы у вас с другом появился свой мир: огонёк, Тёпа, рейтинг.",
      signInButton: "Войти", noFriends: "Добавьте друга — и здесь появится ваш общий мир.", openFriends: "Открыть «Друзья»",
      with: "С кем:", call: "Позвонить", table: "Игровой стол", tableInvited: "Приглашение к столу отправлено",
      streak: "Огонёк", streakDays: "{n} дн. подряд", streakBest: "Рекорд: {n}", streakNone: "Зайдите сегодня оба — и огонёк загорится",
      todayMe: "Вы сегодня здесь", todayFriend: "{name} сегодня здесь", todayWait: "{name} ещё не заходил сегодня",
      league: "Лига недели", week: "{n} очков за неделю", total: "Всего: {n}", league_bronze: "Бронза", league_silver: "Серебро", league_gold: "Золото", league_diamond: "Бриллиант",
      nextLeague: "До лиги «{league}»: {n}", topLeague: "Высшая лига!",
      pet: "Тёпа-питомец", petLevel: "Уровень {n}", petHappy: "Тёпа доволен", petOk: "Тёпа ждёт заботы", petWait: "Тёпа ждёт вас обоих",
      feed: "Покормить", play: "Поиграть", wash: "Искупать", petIn: "через {time}", petDone: "Тёпе понравилось! +{xp}", petBonus: "Вы оба заботитесь — Тёпа растёт быстрее",
      petFriend: "{name} заботился о Тёпе {time} назад",
      chest: "Сундук Тёпы", chestOpen: "Открыть сундук", chestToday: "Сегодня в сундуке:", chestTomorrow: "Новый сундук — завтра",
      chestNew: "Новинка в коллекции!", collection: "Коллекция: {n} из {total}", stickers: "Наклейки", frames: "Рамки для фото",
      photo: "Фото на экран друга", photoNote: "Фото придёт в переписку, а на Android — прямо в виджет на главном экране друга.",
      photoPick: "Выбрать фото", photoSend: "Отправить {name}", photoSent: "Фото отправлено", photoNoFrame: "Без рамки",
      photoTooBig: "Не получилось уменьшить фото. Попробуйте другое.", widgetAdd: "Поставить виджет на экран", widgetHas: "Виджет уже на экране",
      widgetHint: "Нажмите и удерживайте пустое место на главном экране → «Виджеты» → GlowLetter.",
      word: "Слово дня", games: "Счёт в играх", gamesNone: "Сыграйте за «Игровым столом» — здесь появится счёт.", wins: "{me} : {friend}",
      played: "Сыграно: {n}", badges: "Значки пары", title_label: "Ваш титул", noTitle: "Новички",
      ranking: "Рейтинг", rankWorld: "Пары недели", rankFriends: "Друзья", rankMine: "Мои пары", rankPublic: "Показывать наши имена в общем рейтинге",
      rankPublicNote: "Имена пары видны всем, только если оба включили этот переключатель.", rankSecret: "Пара скрыла имена",
      rankEmpty: "На этой неделе ещё никто не набрал очков. Начните первыми!", rankYou: "вы", rankResets: "Рейтинг недели обнуляется в понедельник",
      place: "{n} место", points: "{n} очк.", premium: "«Наш мир» — часть полного доступа.", premiumButton: "Открыть полный доступ",
      error: "Не получилось загрузить. Проверьте интернет.", retry: "Повторить", tooSoon: "Тёпа уже доволен — загляните позже",
      game_lost: "Тёпа заблудился", game_explain: "Объясни слово", game_sketch: "Угадай рисунок", game_sea: "Морской бой", game_four: "Четыре в ряд", game_checkers: "Шашки", game_talk: "О чём поговорить",
      badge_spark: "Первый огонёк", badge_week: "Неделя вместе", badge_month: "Месяц вместе", badge_hundred: "100 дней вместе",
      badge_words: "Мастера слов", badge_captain: "Капитаны", badge_checkers: "Гроссмейстеры", badge_four: "Четыре в ряд",
      badge_artists: "Художники", badge_trackers: "Следопыты", badge_talkers: "Собеседники", badge_carers: "Заботливые",
      badge_collector: "Коллекционеры", badge_diamond: "Бриллиантовая пара",
      badge_spark_note: "1 день огонька", badge_week_note: "7 дней подряд", badge_month_note: "30 дней подряд", badge_hundred_note: "100 дней подряд",
      badge_words_note: "10 слов дня", badge_captain_note: "5 побед в морском бою", badge_checkers_note: "5 побед в шашках", badge_four_note: "5 побед в «Четыре в ряд»",
      badge_artists_note: "5 игр «Угадай рисунок»", badge_trackers_note: "5 раз довести Тёпу домой", badge_talkers_note: "5 колод «О чём поговорить»", badge_carers_note: "Тёпа 5 уровня",
      badge_collector_note: "20 сундуков", badge_diamond_note: "Лига «Бриллиант»",
      sticker_s01: "Привет!", sticker_s02: "Чай?", sticker_s03: "Это тебе", sticker_s04: "Молодец!", sticker_s05: "Ха-ха!",
      sticker_s06: "Спокойной ночи", sticker_s07: "Доброе утро", sticker_s08: "Учусь", sticker_s09: "Вкусно!", sticker_s10: "Играем?",
      sticker_s11: "Позвони", sticker_s12: "Спасибо", sticker_s13: "Ура!", sticker_s14: "Дождик", sticker_s15: "Уже в пути",
      sticker_s16: "Удачи!", sticker_s17: "Хм…", sticker_s18: "Ты справишься", sticker_s19: "Сюрприз", sticker_s20: "Сердечко",
      frame_f01: "Золото", frame_f02: "Сердечки", frame_f03: "Звёзды", frame_f04: "Цветы", frame_f05: "Снежинки", frame_f06: "Осень", frame_f07: "Море", frame_f08: "Ночное небо",
      minutes: "{n} мин", hours: "{n} ч"
    },
    en: {
      eyebrow: "Just you two", title: "Our world", close: "Close", signIn: "Sign in to get a world of your own with a friend: a streak, Teddy, rankings.",
      signInButton: "Sign in", noFriends: "Add a friend and your shared world will appear here.", openFriends: "Open Friends",
      with: "With:", call: "Call", table: "Game table", tableInvited: "Invitation to the table sent",
      streak: "Streak", streakDays: "{n} days in a row", streakBest: "Best: {n}", streakNone: "Both drop by today and the streak lights up",
      todayMe: "You’re here today", todayFriend: "{name} is here today", todayWait: "{name} hasn’t dropped by today yet",
      league: "League of the week", week: "{n} points this week", total: "Total: {n}", league_bronze: "Bronze", league_silver: "Silver", league_gold: "Gold", league_diamond: "Diamond",
      nextLeague: "To {league}: {n}", topLeague: "Top league!",
      pet: "Teddy the pet", petLevel: "Level {n}", petHappy: "Teddy is happy", petOk: "Teddy would like some care", petWait: "Teddy is waiting for you both",
      feed: "Feed", play: "Play", wash: "Bath", petIn: "in {time}", petDone: "Teddy loved it! +{xp}", petBonus: "You both take care of Teddy, so Teddy grows faster",
      petFriend: "{name} cared for Teddy {time} ago",
      chest: "Teddy’s chest", chestOpen: "Open the chest", chestToday: "Today’s chest:", chestTomorrow: "A new chest tomorrow",
      chestNew: "New in your collection!", collection: "Collection: {n} of {total}", stickers: "Stickers", frames: "Photo frames",
      photo: "Photo on a friend’s screen", photoNote: "The photo arrives in your chat and, on Android, right in the widget on your friend’s home screen.",
      photoPick: "Choose a photo", photoSend: "Send to {name}", photoSent: "Photo sent", photoNoFrame: "No frame",
      photoTooBig: "Couldn’t shrink this photo. Try another one.", widgetAdd: "Add the widget to the home screen", widgetHas: "The widget is on your screen",
      widgetHint: "Touch and hold an empty spot on the home screen → Widgets → GlowLetter.",
      word: "Word of the day", games: "Game score", gamesNone: "Play at the Game table and your score will appear here.", wins: "{me} : {friend}",
      played: "Played: {n}", badges: "Your badges", title_label: "Your title", noTitle: "Newcomers",
      ranking: "Rankings", rankWorld: "Pairs of the week", rankFriends: "Friends", rankMine: "My pairs", rankPublic: "Show our names in the public ranking",
      rankPublicNote: "A pair’s names are shown only if both turn this on.", rankSecret: "Names hidden",
      rankEmpty: "No points yet this week. Be the first!", rankYou: "you", rankResets: "The weekly ranking resets on Monday",
      place: "#{n}", points: "{n} pts", premium: "Our world is part of full access.", premiumButton: "Get full access",
      error: "Couldn’t load. Check your connection.", retry: "Try again", tooSoon: "Teddy is happy already, come back later",
      game_lost: "Teddy is lost", game_explain: "Explain the word", game_sketch: "Guess the drawing", game_sea: "Sea battle", game_four: "Four in a row", game_checkers: "Checkers", game_talk: "Let’s talk about",
      badge_spark: "First spark", badge_week: "A week together", badge_month: "A month together", badge_hundred: "100 days together",
      badge_words: "Word masters", badge_captain: "Captains", badge_checkers: "Grandmasters", badge_four: "Four in a row",
      badge_artists: "Artists", badge_trackers: "Trackers", badge_talkers: "Great talkers", badge_carers: "Caring pair",
      badge_collector: "Collectors", badge_diamond: "Diamond pair",
      badge_spark_note: "1 streak day", badge_week_note: "7 days in a row", badge_month_note: "30 days in a row", badge_hundred_note: "100 days in a row",
      badge_words_note: "10 words of the day", badge_captain_note: "5 sea battle wins", badge_checkers_note: "5 checkers wins", badge_four_note: "5 Four in a row wins",
      badge_artists_note: "5 Guess the drawing games", badge_trackers_note: "Bring Teddy home 5 times", badge_talkers_note: "5 conversation decks", badge_carers_note: "Teddy level 5",
      badge_collector_note: "20 chests", badge_diamond_note: "Diamond league",
      sticker_s01: "Hi!", sticker_s02: "Tea?", sticker_s03: "This is for you", sticker_s04: "Well done!", sticker_s05: "Haha!",
      sticker_s06: "Good night", sticker_s07: "Good morning", sticker_s08: "Studying", sticker_s09: "Yummy!", sticker_s10: "Shall we play?",
      sticker_s11: "Call me", sticker_s12: "Thank you", sticker_s13: "Hooray!", sticker_s14: "Rainy day", sticker_s15: "On my way",
      sticker_s16: "Good luck!", sticker_s17: "Hmm…", sticker_s18: "You can do it", sticker_s19: "Surprise", sticker_s20: "A little heart",
      frame_f01: "Gold", frame_f02: "Hearts", frame_f03: "Stars", frame_f04: "Flowers", frame_f05: "Snowflakes", frame_f06: "Autumn", frame_f07: "Sea", frame_f08: "Night sky",
      minutes: "{n} min", hours: "{n} h"
    },
    fr: {
      eyebrow: "Rien que vous deux", title: "Notre monde", close: "Fermer", signIn: "Connectez-vous pour avoir votre monde à deux : une série, Nounours, des classements.",
      signInButton: "Se connecter", noFriends: "Ajoutez un ami et votre monde commun apparaîtra ici.", openFriends: "Ouvrir « Amis »",
      with: "Avec :", call: "Appeler", table: "Table de jeu", tableInvited: "Invitation à la table envoyée",
      streak: "Série", streakDays: "{n} jours d’affilée", streakBest: "Record : {n}", streakNone: "Passez tous les deux aujourd’hui et la série s’allume",
      todayMe: "Vous êtes là aujourd’hui", todayFriend: "{name} est là aujourd’hui", todayWait: "{name} n’est pas encore passé aujourd’hui",
      league: "Ligue de la semaine", week: "{n} points cette semaine", total: "Total : {n}", league_bronze: "Bronze", league_silver: "Argent", league_gold: "Or", league_diamond: "Diamant",
      nextLeague: "Jusqu’à la ligue {league} : {n}", topLeague: "Ligue suprême !",
      pet: "Nounours, votre compagnon", petLevel: "Niveau {n}", petHappy: "Nounours est content", petOk: "Nounours aimerait un peu d’attention", petWait: "Nounours vous attend tous les deux",
      feed: "Nourrir", play: "Jouer", wash: "Bain", petIn: "dans {time}", petDone: "Nounours a adoré ça ! +{xp}", petBonus: "Vous vous occupez tous les deux de Nounours : il grandit plus vite",
      petFriend: "{name} s’est occupé de Nounours il y a {time}",
      chest: "Le coffre de Nounours", chestOpen: "Ouvrir le coffre", chestToday: "Dans le coffre aujourd’hui :", chestTomorrow: "Nouveau coffre demain",
      chestNew: "Nouveau dans la collection !", collection: "Collection : {n} sur {total}", stickers: "Autocollants", frames: "Cadres photo",
      photo: "Photo sur l’écran d’un ami", photoNote: "La photo arrive dans la conversation et, sur Android, directement dans le widget de l’écran d’accueil de votre ami.",
      photoPick: "Choisir une photo", photoSend: "Envoyer à {name}", photoSent: "Photo envoyée", photoNoFrame: "Sans cadre",
      photoTooBig: "Impossible de réduire cette photo. Essayez-en une autre.", widgetAdd: "Ajouter le widget à l’écran d’accueil", widgetHas: "Le widget est déjà sur l’écran",
      widgetHint: "Appuyez longuement sur un espace vide de l’écran d’accueil → Widgets → GlowLetter.",
      word: "Mot du jour", games: "Score des jeux", gamesNone: "Jouez à la Table de jeu et votre score apparaîtra ici.", wins: "{me} : {friend}",
      played: "Parties : {n}", badges: "Vos badges", title_label: "Votre titre", noTitle: "Débutants",
      ranking: "Classement", rankWorld: "Duos de la semaine", rankFriends: "Amis", rankMine: "Mes duos", rankPublic: "Afficher nos prénoms dans le classement public",
      rankPublicNote: "Les prénoms d’un duo ne s’affichent que si les deux l’activent.", rankSecret: "Prénoms masqués",
      rankEmpty: "Personne n’a encore de points cette semaine. Soyez les premiers !", rankYou: "vous", rankResets: "Le classement repart à zéro le lundi",
      place: "{n}ᵉ", points: "{n} pts", premium: "Notre monde fait partie de l’accès complet.", premiumButton: "Passer à l’accès complet",
      error: "Chargement impossible. Vérifiez la connexion.", retry: "Réessayer", tooSoon: "Nounours est déjà content, revenez plus tard",
      game_lost: "Nounours s’est perdu", game_explain: "Explique le mot", game_sketch: "Devine le dessin", game_sea: "Bataille navale", game_four: "Quatre à la suite", game_checkers: "Dames", game_talk: "De quoi parler",
      badge_spark: "Première étincelle", badge_week: "Une semaine ensemble", badge_month: "Un mois ensemble", badge_hundred: "100 jours ensemble",
      badge_words: "Maîtres des mots", badge_captain: "Capitaines", badge_checkers: "Grands maîtres", badge_four: "Quatre à la suite",
      badge_artists: "Artistes", badge_trackers: "Pisteurs", badge_talkers: "Bavards", badge_carers: "Duo attentionné",
      badge_collector: "Collectionneurs", badge_diamond: "Duo diamant",
      badge_spark_note: "1 jour de série", badge_week_note: "7 jours d’affilée", badge_month_note: "30 jours d’affilée", badge_hundred_note: "100 jours d’affilée",
      badge_words_note: "10 mots du jour", badge_captain_note: "5 victoires en bataille navale", badge_checkers_note: "5 victoires aux dames", badge_four_note: "5 victoires à Quatre à la suite",
      badge_artists_note: "5 parties de Devine le dessin", badge_trackers_note: "Ramener Nounours 5 fois", badge_talkers_note: "5 paquets « De quoi parler »", badge_carers_note: "Nounours niveau 5",
      badge_collector_note: "20 coffres", badge_diamond_note: "Ligue Diamant",
      sticker_s01: "Coucou !", sticker_s02: "Un thé ?", sticker_s03: "C’est pour toi", sticker_s04: "Bravo !", sticker_s05: "Haha !",
      sticker_s06: "Bonne nuit", sticker_s07: "Bonjour", sticker_s08: "Je révise", sticker_s09: "Miam !", sticker_s10: "On joue ?",
      sticker_s11: "Appelle-moi", sticker_s12: "Merci", sticker_s13: "Hourra !", sticker_s14: "Il pleut", sticker_s15: "J’arrive",
      sticker_s16: "Bonne chance !", sticker_s17: "Hmm…", sticker_s18: "Tu vas y arriver", sticker_s19: "Surprise", sticker_s20: "Petit cœur",
      frame_f01: "Or", frame_f02: "Cœurs", frame_f03: "Étoiles", frame_f04: "Fleurs", frame_f05: "Flocons", frame_f06: "Automne", frame_f07: "Mer", frame_f08: "Ciel de nuit",
      minutes: "{n} min", hours: "{n} h"
    }
  };

  // Наклейки и рамки из сундука; наклейку можно отправить в переписку ([[sticker:sNN]]).
  const STICKERS = Object.freeze({
    s01: "🧸👋", s02: "🧸☕", s03: "🧸🌸", s04: "🧸⭐", s05: "🧸😄", s06: "🧸🌙", s07: "🧸☀️", s08: "🧸📚", s09: "🧸🍰", s10: "🧸🎲",
    s11: "🧸📞", s12: "🧸🙏", s13: "🧸🎉", s14: "🧸🌧️", s15: "🧸🚲", s16: "🧸🍀", s17: "🧸🤔", s18: "🧸💪", s19: "🧸🎁", s20: "🧸❤️"
  });
  const FRAMES = Object.freeze(["f01", "f02", "f03", "f04", "f05", "f06", "f07", "f08"]);
  const LEAGUES = Object.freeze([["bronze", 0], ["silver", 150], ["gold", 400], ["diamond", 900]]);
  const PET_ACTIONS = Object.freeze([["feed", "🍯"], ["play", "🧶"], ["wash", "🫧"]]);
  const PET_COOLDOWN = 3 * 3600 * 1000;
  const GAME_ICONS = Object.freeze({ lost: "🧭", explain: "🗣️", sketch: "🖍️", sea: "⛵", four: "🔴", checkers: "♟️", talk: "💬" });
  // Значки пары: условие по сводке сервера (glowletter_pair_summary).
  const BADGES = Object.freeze([
    ["spark", "🔥", s => s.streak.best >= 1],
    ["week", "📅", s => s.streak.best >= 7],
    ["month", "🗓️", s => s.streak.best >= 30],
    ["hundred", "💯", s => s.streak.best >= 100],
    ["words", "🔤", s => s.words >= 10],
    ["captain", "⛵", s => (s.games.sea?.win || 0) >= 5],
    ["checkers", "♟️", s => (s.games.checkers?.win || 0) >= 5],
    ["four", "🔴", s => (s.games.four?.win || 0) >= 5],
    ["artists", "🖍️", s => (s.games.sketch?.played || 0) >= 5],
    ["trackers", "🧭", s => (s.games.lost?.played || 0) >= 5],
    ["talkers", "💬", s => (s.games.talk?.played || 0) >= 5],
    ["carers", "🧸", s => petLevel(s.pet.xp) >= 5],
    ["collector", "🎁", s => s.chests >= 20],
    ["diamond", "💎", s => s.league === "diamond"]
  ]);
  const FRIEND_KEY = "glowletter-world-friend";

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const signedIn = () => Boolean(cloud()?.getState?.().signedIn);
  const premium = () => Boolean(app()?.getState?.().premium);
  const lang = () => {
    const code = app()?.getState?.().language || document.documentElement.lang || "ru";
    return code === "id" ? "ind" : code;
  };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const fill = (text, values = {}) => String(text).replace(/\{(\w+)\}/gu, (match, key) => (key in values ? String(values[key]) : match));
  const tr = (key, values) => fill(TEXT[lang()]?.[key] ?? window.GLOWLETTER_ULTRA_I18N?.[lang()]?.world?.[key] ?? TEXT.en[key] ?? key, values);
  const icon = id => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const petLevel = xp => Math.floor(Math.max(0, Number(xp) || 0) / 100) + 1;
  const outfitPicture = index => {
    const outfits = window.GlowLetterCouple?.outfits || [];
    const outfit = outfits[Math.min(Math.max(0, index), outfits.length - 1)];
    return `assets/loves/${outfit?.picture || "s28d"}.webp`;
  };

  const state = {
    root: null, lastFocus: null, friendId: "", summary: null, chest: null, ranking: null, rankScope: "world",
    loading: false, error: "", notice: "", photo: null, photoFrame: "", busy: false, wordHost: null
  };

  async function rpc(name, args = {}) {
    const db = client();
    if (!db) throw new Error("offline");
    const { data, error } = await db.rpc(name, args);
    if (error) throw new Error(error.message || "error");
    return data;
  }

  const friends = () => window.GlowLetterFriends?.friends?.() || [];
  const friend = () => friends().find(row => row.user_id === state.friendId) || null;

  // ——— Окно ———

  function mount() {
    if (state.root) return state.root;
    const root = document.createElement("div");
    root.className = "glg-layer glu-layer";
    root.id = "worldLayer";
    root.hidden = true;
    root.innerHTML = `
      <button class="glg-backdrop" type="button" data-action="close" tabindex="-1" aria-hidden="true"></button>
      <section class="glg-panel" role="dialog" aria-modal="true" aria-labelledby="gluTitle">
        <header class="glg-header">
          <div><p class="glg-eyebrow" data-glu="eyebrow"></p><h2 id="gluTitle" data-glu="title"></h2></div>
          <button class="glg-close" type="button" data-action="close"><span aria-hidden="true">×</span></button>
        </header>
        <div class="glg-body glu-body" aria-live="polite"></div>
      </section>`;
    root.addEventListener("click", event => {
      const target = event.target.closest("[data-action]");
      if (target && root.contains(target)) onAction(target.dataset.action, target);
    });
    root.addEventListener("change", event => {
      if (event.target.matches("[data-photo-input]")) pickPhoto(event.target.files?.[0]);
      if (event.target.matches("[data-rank-public]")) setPublic(event.target.checked);
    });
    root.addEventListener("keydown", event => { if (event.key === "Escape") { event.stopPropagation(); close(); } });
    document.body.append(root);
    state.root = root;
    return root;
  }

  async function open(friendId) {
    const root = mount();
    if (root.hidden) state.lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("glg-open");
    requestAnimationFrame(() => root.classList.add("is-open"));
    if (friendId) state.friendId = friendId;
    state.notice = "";
    render();
    await refresh();
  }

  function close() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    document.body.classList.remove("glg-open");
    setTimeout(() => { if (!root.classList.contains("is-open")) root.hidden = true; }, 320);
    state.lastFocus?.focus?.({ preventScroll: true });
  }

  async function refresh() {
    if (!signedIn()) { render(); return; }
    const list = friends();
    if (!list.length) { render(); return; }
    if (!list.some(row => row.user_id === state.friendId)) {
      const saved = read(FRIEND_KEY);
      state.friendId = list.some(row => row.user_id === saved) ? saved : list[0].user_id;
    }
    write(FRIEND_KEY, state.friendId);
    state.loading = true;
    state.error = "";
    render();
    try {
      const target = state.friendId;
      const [summary, chest, ranking] = await Promise.all([
        rpc("glowletter_pair_summary", { p_friend: target }),
        rpc("glowletter_chest_state").catch(() => null),
        rpc("glowletter_ranking", { p_scope: state.rankScope }).catch(() => null),
        rpc("glowletter_pair_checkin", { p_friend: target }).catch(() => null)
      ]);
      if (target !== state.friendId) return;
      state.summary = normalise(summary);
      state.chest = chest;
      state.ranking = ranking;
    } catch (error) {
      state.error = tr("error");
    } finally {
      state.loading = false;
      render();
      updateHomeBadge();
    }
  }

  function normalise(summary) {
    const value = summary || {};
    return {
      paid: value.paid === true,
      streak: { current: Number(value.streak?.current || 0), best: Number(value.streak?.best || 0) },
      today: { me: value.today?.me === true, friend: value.today?.friend === true },
      week: Number(value.week || 0),
      total: Number(value.total || 0),
      league: ["bronze", "silver", "gold", "diamond"].includes(value.league) ? value.league : "bronze",
      pet: { xp: Number(value.pet?.xp || 0), mine: value.pet?.mine || {}, friend: value.pet?.friend || {} },
      games: value.games && typeof value.games === "object" ? value.games : {},
      words: Number(value.words || 0),
      chests: Number(value.chests || 0)
    };
  }

  // ——— Действия ———

  async function onAction(action, target) {
    if (action === "close") close();
    else if (action === "signin") { close(); document.querySelector("#homeSignIn")?.click(); }
    else if (action === "friends") { close(); window.GlowLetterFriends?.open?.(); }
    else if (action === "paywall") app()?.openPaywall?.();
    else if (action === "friend") { state.friendId = target.dataset.id; state.summary = null; await refresh(); }
    else if (action === "call") { const item = friend(); if (item) window.GlowLetterCall?.start?.({ user_id: item.user_id, name: item.name }); }
    else if (action === "table") openTable();
    else if (action === "pet") await care(target.dataset.pet);
    else if (action === "chest") await openChest();
    else if (action === "photo-pick") state.root.querySelector("[data-photo-input]")?.click();
    else if (action === "frame") { state.photoFrame = target.dataset.frame || ""; render(); }
    else if (action === "photo-send") await sendPhoto();
    else if (action === "widget") addWidget();
    else if (action === "rank") { state.rankScope = target.dataset.scope; state.ranking = null; render(); state.ranking = await rpc("glowletter_ranking", { p_scope: state.rankScope }).catch(() => null); render(); }
    else if (action === "retry") refresh();
  }

  async function openTable() {
    const item = friend();
    if (!item) return;
    if (!premium()) { app()?.openPaywall?.(); return; }
    const room = window.GlowLetterCall?.active?.() ? window.GlowLetterCall.room() : crypto.randomUUID();
    if (!window.GlowLetterCall?.active?.()) {
      try { await window.GlowLetterFriends?.sendPlayInvite?.(item.user_id, room); notify(tr("tableInvited")); } catch {}
    }
    window.GlowLetterTable?.open?.({ room, friend: { user_id: item.user_id, name: item.name } });
  }

  async function care(action) {
    if (state.busy || !PET_ACTIONS.some(([id]) => id === action)) return;
    state.busy = true;
    try {
      const before = state.summary?.pet.xp || 0;
      state.summary = normalise(await rpc("glowletter_pet_care", { p_friend: state.friendId, p_action: action }));
      state.notice = tr("petDone", { xp: Math.max(10, state.summary.pet.xp - before) });
      window.GlowLetterOnline?.burst?.(PET_ACTIONS.find(([id]) => id === action)[1], { small: true });
    } catch (error) {
      if (/premium_required/u.test(error.message)) app()?.openPaywall?.();
      else state.notice = /too_soon/u.test(error.message) ? tr("tooSoon") : tr("error");
    } finally {
      state.busy = false;
      render();
    }
  }

  async function openChest() {
    if (state.busy) return;
    if (!premium()) { app()?.openPaywall?.(); return; }
    state.busy = true;
    try {
      const owned = new Set(state.chest?.owned || []);
      const result = await rpc("glowletter_chest_open");
      state.chest = { today: result.reward, owned: [...owned, result.reward] };
      state.notice = owned.has(result.reward) ? "" : tr("chestNew");
      window.GlowLetterOnline?.burst?.("🎁", { small: true });
    } catch (error) {
      if (/premium_required/u.test(error.message)) app()?.openPaywall?.(); else state.notice = tr("error");
    } finally {
      state.busy = false;
      render();
      updateHomeBadge();
    }
  }

  // Фото уменьшаем на телефоне: до 1080 px по длинной стороне и не больше ~400 КБ.
  async function pickPhoto(file) {
    if (!file || !/^image\//u.test(file.type)) return;
    try {
      const bitmap = await createImageBitmap(file);
      let side = 1080;
      let blob = null;
      for (const quality of [0.84, 0.74, 0.64, 0.56]) {
        const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
        if (blob && blob.size <= 400000) break;
        side = Math.round(side * 0.85);
      }
      bitmap.close?.();
      if (!blob || blob.size > 440000) { state.notice = tr("photoTooBig"); render(); return; }
      if (state.photo?.url) URL.revokeObjectURL(state.photo.url);
      state.photo = { blob, url: URL.createObjectURL(blob) };
      state.notice = "";
    } catch {
      state.notice = tr("photoTooBig");
    }
    render();
  }

  async function sendPhoto() {
    const item = friend();
    if (!item || !state.photo || state.busy) return;
    if (!premium()) { app()?.openPaywall?.(); return; }
    state.busy = true;
    render();
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = reject;
        reader.readAsDataURL(state.photo.blob);
      });
      await window.GlowLetterFriends?.sendPhoto?.(item.user_id, "image/jpeg", base64, state.photoFrame || null);
      URL.revokeObjectURL(state.photo.url);
      state.photo = null;
      state.notice = tr("photoSent");
      window.GlowLetterOnline?.burst?.("📸", { small: true });
    } catch (error) {
      if (/premium_required/u.test(error.message)) app()?.openPaywall?.(); else state.notice = tr("error");
    } finally {
      state.busy = false;
      render();
    }
  }

  async function addWidget() {
    const bridge = window.NurWidget;
    if (!bridge) return;
    // Виджету нужен ключ устройства — тот же, что у уведомлений на телефон.
    try {
      const token = await rpc("glowletter_push_register");
      if (typeof token === "string" && /^[0-9a-f]{64}$/u.test(token)) bridge.enable(token);
    } catch {}
    if (!bridge.pin?.()) state.notice = tr("widgetHint");
    render();
  }

  async function setPublic(on) {
    try {
      await rpc("glowletter_ranking_visibility", { p_public: on });
      if (state.rankScope === "world") state.ranking = await rpc("glowletter_ranking", { p_scope: "world" });
    } catch { state.notice = tr("error"); }
    render();
  }

  const notify = message => app()?.notify?.(message, 2600);

  // ——— Отрисовка ———

  function render() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.querySelector("[data-glu=eyebrow]").textContent = tr("eyebrow");
    root.querySelector("[data-glu=title]").textContent = tr("title");
    root.querySelector(".glg-close").setAttribute("aria-label", tr("close"));
    const body = root.querySelector(".glu-body");
    if (!signedIn()) {
      body.innerHTML = `<div class="glg-center"><p class="glg-muted">${escapeHtml(tr("signIn"))}</p><button class="glg-primary" type="button" data-action="signin">${icon("ic-user")} ${escapeHtml(tr("signInButton"))}</button></div>`;
      return;
    }
    const list = friends();
    if (!list.length) {
      body.innerHTML = `<div class="glg-center"><img class="glu-bear-small" src="${outfitPicture(0)}" alt=""><p class="glg-muted">${escapeHtml(tr("noFriends"))}</p><button class="glg-primary" type="button" data-action="friends">${icon("ic-friends")} ${escapeHtml(tr("openFriends"))}</button></div>`;
      return;
    }
    const keepWord = state.wordHost;
    const summary = state.summary;
    const item = friend();
    const name = item?.name || "";
    body.innerHTML = `
      <div class="glu-friends" role="group" aria-label="${escapeHtml(tr("with"))}">
        ${list.map(row => `<button class="glu-chip${row.user_id === state.friendId ? " is-on" : ""}" type="button" data-action="friend" data-id="${escapeHtml(row.user_id)}" aria-pressed="${row.user_id === state.friendId}">${row.online ? `<span class="glu-online" aria-hidden="true"></span>` : ""}${escapeHtml(row.name)}</button>`).join("")}
      </div>
      <div class="glu-quick">
        <button class="glg-primary" type="button" data-action="call"><span aria-hidden="true">📞</span> ${escapeHtml(tr("call"))}</button>
        <button class="glg-secondary" type="button" data-action="table"><span aria-hidden="true">🎲</span> ${escapeHtml(tr("table"))}</button>
      </div>
      ${premium() || summary?.paid ? "" : `<div class="glu-card glu-premium"><p>${escapeHtml(tr("premium"))}</p><button class="glg-primary" type="button" data-action="paywall">${escapeHtml(tr("premiumButton"))}</button></div>`}
      ${state.notice ? `<p class="glu-notice" role="status">${escapeHtml(state.notice)}</p>` : ""}
      ${state.error ? `<div class="glu-card"><p class="glg-muted">${escapeHtml(state.error)}</p><button class="glg-secondary" type="button" data-action="retry">${escapeHtml(tr("retry"))}</button></div>` : ""}
      ${summary ? `
        ${renderStreak(summary, name)}
        ${renderPet(summary, name)}
        ${renderChest()}
        ${renderPhoto(name)}
        <section class="glu-card glu-word"><h3>${escapeHtml(tr("word"))}</h3><div class="glu-word-host"></div></section>
        ${renderGames(summary, name)}
        ${renderBadges(summary)}
        ${renderRanking()}` : state.loading ? `<p class="glg-center glg-muted">…</p>` : ""}`;
    const host = body.querySelector(".glu-word-host");
    if (host) {
      if (keepWord && keepWord.dataset.lang === lang()) host.replaceWith(keepWord);
      else mountWord(host);
    }
  }

  function mountWord(host) {
    host.dataset.lang = lang();
    state.wordHost = host;
    try {
      window.GlowLetterWord?.render?.(host, {
        lang: lang(), premium: premium(), signedIn: signedIn(),
        rpc, openPaywall: () => app()?.openPaywall?.(), toast: notify
      });
    } catch (error) {
      console.warn("word of the day failed", error);
    }
  }

  function renderStreak(summary, name) {
    const current = summary.streak.current;
    const index = LEAGUES.findIndex(([id]) => id === summary.league);
    const next = LEAGUES[index + 1];
    const titleBadge = [...BADGES].reverse().find(([, , test]) => test(summary));
    return `
      <section class="glu-card glu-streak">
        <div class="glu-flame${current ? " is-lit" : ""}" aria-hidden="true">🔥<b>${current}</b></div>
        <div class="glu-streak-text">
          <h3>${escapeHtml(tr("streak"))}</h3>
          <p class="glu-big">${escapeHtml(current ? tr("streakDays", { n: current }) : tr("streakNone"))}</p>
          <p class="glg-muted">${escapeHtml(tr("streakBest", { n: summary.streak.best }))}</p>
          <ul class="glu-today">
            <li class="${summary.today.me ? "is-done" : ""}">${summary.today.me ? "✓" : "○"} ${escapeHtml(tr("todayMe"))}</li>
            <li class="${summary.today.friend ? "is-done" : ""}">${summary.today.friend ? "✓" : "○"} ${escapeHtml(summary.today.friend ? tr("todayFriend", { name }) : tr("todayWait", { name }))}</li>
          </ul>
        </div>
      </section>
      <section class="glu-card glu-league glu-league-${summary.league}">
        <p class="glg-eyebrow">${escapeHtml(tr("league"))}</p>
        <p class="glu-league-name"><span aria-hidden="true">${{ bronze: "🥉", silver: "🥈", gold: "🥇", diamond: "💎" }[summary.league]}</span> ${escapeHtml(tr(`league_${summary.league}`))}</p>
        <p>${escapeHtml(tr("week", { n: summary.week }))} · ${escapeHtml(tr("total", { n: summary.total }))}</p>
        <div class="glu-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${next ? next[1] : summary.week}" aria-valuenow="${summary.week}"><i style="width:${next ? Math.min(100, Math.round((summary.week - LEAGUES[index][1]) / (next[1] - LEAGUES[index][1]) * 100)) : 100}%"></i></div>
        <p class="glg-muted">${escapeHtml(next ? tr("nextLeague", { league: tr(`league_${next[0]}`), n: next[1] - summary.week }) : tr("topLeague"))}</p>
        <p class="glu-title">${escapeHtml(tr("title_label"))}: <b>${titleBadge ? `${titleBadge[1]} ${escapeHtml(tr(`badge_${titleBadge[0]}`))}` : escapeHtml(tr("noTitle"))}</b></p>
      </section>`;
  }

  const since = time => {
    const minutes = Math.max(1, Math.round((Date.now() - new Date(time).getTime()) / 60000));
    return minutes < 60 ? tr("minutes", { n: minutes }) : tr("hours", { n: Math.round(minutes / 60) });
  };

  function renderPet(summary, name) {
    const level = petLevel(summary.pet.xp);
    const times = [...Object.values(summary.pet.mine), ...Object.values(summary.pet.friend)].map(time => new Date(time).getTime()).filter(Number.isFinite);
    const last = times.length ? Math.max(...times) : 0;
    const mood = last > Date.now() - 6 * 3600000 ? "petHappy" : last > Date.now() - 24 * 3600000 ? "petOk" : "petWait";
    const friendTimes = Object.values(summary.pet.friend).map(time => new Date(time).getTime()).filter(Number.isFinite);
    const friendLast = friendTimes.length ? Math.max(...friendTimes) : 0;
    return `
      <section class="glu-card glu-pet">
        <h3>${escapeHtml(tr("pet"))}</h3>
        <div class="glu-pet-row">
          <img class="glu-pet-img glu-mood-${mood}" src="${outfitPicture(level - 1)}" alt="">
          <div>
            <p class="glu-big">${escapeHtml(tr("petLevel", { n: level }))}</p>
            <div class="glu-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${summary.pet.xp % 100}"><i style="width:${summary.pet.xp % 100}%"></i></div>
            <p>${escapeHtml(tr(mood))}</p>
            ${friendLast ? `<p class="glg-muted">${escapeHtml(tr("petFriend", { name, time: since(friendLast) }))}</p>` : ""}
          </div>
        </div>
        <div class="glu-pet-actions">
          ${PET_ACTIONS.map(([id, emoji]) => {
            const at = new Date(summary.pet.mine[id] || 0).getTime();
            const wait = at + PET_COOLDOWN - Date.now();
            return `<button class="glu-pet-button" type="button" data-action="pet" data-pet="${id}" ${wait > 0 || state.busy ? "disabled" : ""}>
              <span aria-hidden="true">${emoji}</span><b>${escapeHtml(tr(id))}</b>${wait > 0 ? `<small>${escapeHtml(tr("petIn", { time: wait < 3600000 ? tr("minutes", { n: Math.ceil(wait / 60000) }) : tr("hours", { n: Math.ceil(wait / 3600000) }) }))}</small>` : ""}
            </button>`;
          }).join("")}
        </div>
        <p class="glg-muted glu-small">${escapeHtml(tr("petBonus"))}</p>
      </section>`;
  }

  function rewardView(reward) {
    const [kind, id] = String(reward || "").split(":");
    if (kind === "sticker" && STICKERS[id]) return `<span class="glu-sticker" aria-hidden="true">${STICKERS[id]}</span><b>${escapeHtml(tr(`sticker_${id}`))}</b>`;
    if (kind === "frame" && FRAMES.includes(id)) return `<span class="glu-frame-swatch glu-frame-${id}" aria-hidden="true"></span><b>${escapeHtml(tr(`frame_${id}`))}</b>`;
    return "";
  }

  function renderChest() {
    const owned = new Set(state.chest?.owned || []);
    const today = state.chest?.today || "";
    const total = Object.keys(STICKERS).length + FRAMES.length;
    return `
      <section class="glu-card glu-chest">
        <h3>${escapeHtml(tr("chest"))}</h3>
        ${today ? `<div class="glu-reward"><p class="glg-muted">${escapeHtml(tr("chestToday"))}</p><div class="glu-reward-item">${rewardView(today)}</div><p class="glg-muted">${escapeHtml(tr("chestTomorrow"))}</p></div>`
          : `<button class="glu-chest-button" type="button" data-action="chest" ${state.busy ? "disabled" : ""}><span aria-hidden="true">🎁</span>${escapeHtml(tr("chestOpen"))}</button>`}
        <p class="glu-small">${escapeHtml(tr("collection", { n: owned.size, total }))}</p>
        <details class="glu-collection">
          <summary>${escapeHtml(tr("stickers"))} · ${escapeHtml(tr("frames"))}</summary>
          <div class="glu-grid">
            ${Object.keys(STICKERS).map(id => `<span class="glu-cell${owned.has(`sticker:${id}`) ? "" : " is-locked"}" title="${escapeHtml(tr(`sticker_${id}`))}"><span aria-hidden="true">${owned.has(`sticker:${id}`) ? STICKERS[id] : "🔒"}</span><small>${escapeHtml(tr(`sticker_${id}`))}</small></span>`).join("")}
            ${FRAMES.map(id => `<span class="glu-cell${owned.has(`frame:${id}`) ? "" : " is-locked"}"><span class="glu-frame-swatch glu-frame-${id}" aria-hidden="true"></span><small>${escapeHtml(tr(`frame_${id}`))}</small></span>`).join("")}
          </div>
        </details>
      </section>`;
  }

  function renderPhoto(name) {
    const owned = new Set(state.chest?.owned || []);
    const frames = FRAMES.filter(id => owned.has(`frame:${id}`));
    const widget = window.NurWidget;
    return `
      <section class="glu-card glu-photo">
        <h3>${escapeHtml(tr("photo"))}</h3>
        <p class="glg-muted">${escapeHtml(tr("photoNote"))}</p>
        <input type="file" accept="image/*" data-photo-input hidden>
        ${state.photo ? `
          <figure class="glu-photo-preview${state.photoFrame ? ` glu-frame-${state.photoFrame}` : ""}"><img src="${state.photo.url}" alt=""></figure>
          ${frames.length ? `<div class="glu-frames" role="group">
            <button class="glu-chip${state.photoFrame ? "" : " is-on"}" type="button" data-action="frame" data-frame="">${escapeHtml(tr("photoNoFrame"))}</button>
            ${frames.map(id => `<button class="glu-chip${state.photoFrame === id ? " is-on" : ""}" type="button" data-action="frame" data-frame="${id}"><span class="glu-frame-swatch glu-frame-${id}" aria-hidden="true"></span>${escapeHtml(tr(`frame_${id}`))}</button>`).join("")}
          </div>` : ""}
          <div class="glu-quick">
            <button class="glg-primary" type="button" data-action="photo-send" ${state.busy ? "disabled" : ""}>${escapeHtml(tr("photoSend", { name }))}</button>
            <button class="glg-secondary" type="button" data-action="photo-pick">${escapeHtml(tr("photoPick"))}</button>
          </div>` : `<button class="glg-primary glg-wide" type="button" data-action="photo-pick"><span aria-hidden="true">📸</span> ${escapeHtml(tr("photoPick"))}</button>`}
        ${widget ? `<button class="glg-secondary glg-wide" type="button" data-action="widget" ${widget.installed?.() ? "disabled" : ""}>${escapeHtml(widget.installed?.() ? tr("widgetHas") : tr("widgetAdd"))}</button>` : ""}
      </section>`;
  }

  function renderGames(summary, name) {
    const entries = Object.entries(summary.games).filter(([id]) => GAME_ICONS[id]);
    return `
      <section class="glu-card glu-games">
        <h3>${escapeHtml(tr("games"))}</h3>
        ${entries.length ? `<ul class="glu-score">
          ${entries.map(([id, score]) => `<li><span aria-hidden="true">${GAME_ICONS[id]}</span><b>${escapeHtml(tr(`game_${id}`))}</b>
            ${["lost", "explain", "sketch", "talk"].includes(id) ? `<span>${escapeHtml(tr("played", { n: score.played || 0 }))}</span>`
              : `<span class="glu-score-num" aria-label="${escapeHtml(`${score.win || 0}:${score.loss || 0}`)}">${escapeHtml(tr("wins", { me: score.win || 0, friend: score.loss || 0 }))}</span>`}</li>`).join("")}
        </ul>` : `<p class="glg-muted">${escapeHtml(tr("gamesNone"))}</p>`}
      </section>`;
  }

  function renderBadges(summary) {
    return `
      <section class="glu-card glu-badges">
        <h3>${escapeHtml(tr("badges"))}</h3>
        <ul class="glu-badge-list">
          ${BADGES.map(([id, emoji, test]) => {
            const on = test(summary);
            return `<li class="${on ? "is-on" : "is-locked"}"><span aria-hidden="true">${on ? emoji : "🔒"}</span><b>${escapeHtml(tr(`badge_${id}`))}</b><small>${escapeHtml(tr(`badge_${id}_note`))}</small></li>`;
          }).join("")}
        </ul>
      </section>`;
  }

  function renderRanking() {
    const scope = state.rankScope;
    const data = state.ranking;
    const medal = place => ({ 1: "🥇", 2: "🥈", 3: "🥉" })[place] || `${place}.`;
    let rows = "";
    if (!data) rows = `<p class="glg-muted">…</p>`;
    else if (scope === "world") {
      const top = Array.isArray(data.top) ? data.top : [];
      const mine = Array.isArray(data.mine) ? data.mine : [];
      rows = `
        <label class="glu-switch"><input type="checkbox" data-rank-public ${data.public ? "checked" : ""}><span>${escapeHtml(tr("rankPublic"))}</span></label>
        <p class="glg-muted glu-small">${escapeHtml(tr("rankPublicNote"))}</p>
        ${mine.length ? `<p class="glg-eyebrow">${escapeHtml(tr("rankMine"))}</p><ol class="glu-rank">${mine.map(row => `<li class="is-mine"><span>${escapeHtml(tr("place", { n: row.place }))}</span><b>${escapeHtml(row.friend)}</b><em>${escapeHtml(tr(`league_${row.league}`))}</em><span>${escapeHtml(tr("points", { n: row.points }))}</span></li>`).join("")}</ol>` : ""}
        ${top.length ? `<ol class="glu-rank">${top.map(row => `<li class="${row.mine ? "is-mine" : ""}"><span>${medal(row.place)}</span><b>${row.names ? escapeHtml(row.names.filter(Boolean).join(" & ")) : `<i>${escapeHtml(tr("rankSecret"))}</i>`}</b><em>${escapeHtml(tr(`league_${row.league}`))}</em><span>${escapeHtml(tr("points", { n: row.points }))}</span></li>`).join("")}</ol>`
          : `<p class="glg-muted">${escapeHtml(tr("rankEmpty"))}</p>`}`;
    } else {
      const list = Array.isArray(data) ? data : [];
      rows = `<ol class="glu-rank">${list.map((row, index) => `<li class="${row.me ? "is-mine" : ""}"><span>${medal(index + 1)}</span><b>${escapeHtml(row.name || "—")}${row.me ? ` <small>(${escapeHtml(tr("rankYou"))})</small>` : ""}</b><em>${escapeHtml(tr(`league_${row.league}`))}</em><span>${escapeHtml(tr("points", { n: row.points }))}</span></li>`).join("")}</ol>`;
    }
    return `
      <section class="glu-card glu-ranking">
        <h3>${escapeHtml(tr("ranking"))}</h3>
        <div class="glu-tabs" role="tablist">
          <button class="glu-chip${scope === "world" ? " is-on" : ""}" type="button" role="tab" aria-selected="${scope === "world"}" data-action="rank" data-scope="world">${escapeHtml(tr("rankWorld"))}</button>
          <button class="glu-chip${scope === "friends" ? " is-on" : ""}" type="button" role="tab" aria-selected="${scope === "friends"}" data-action="rank" data-scope="friends">${escapeHtml(tr("rankFriends"))}</button>
        </div>
        ${rows}
        <p class="glg-muted glu-small">${escapeHtml(tr("rankResets"))}</p>
      </section>`;
  }

  // Значок на главной: сундук сегодня ещё не открыт.
  function updateHomeBadge() {
    const badge = document.querySelector("#worldBadge");
    if (!badge) return;
    const ready = signedIn() && premium() && state.chest && !state.chest.today;
    badge.hidden = !ready;
    badge.textContent = "1";
  }

  async function checkChest() {
    if (!signedIn() || !premium()) { updateHomeBadge(); return; }
    try { state.chest = await rpc("glowletter_chest_state"); } catch {}
    updateHomeBadge();
  }

  function init() {
    document.querySelector("#worldOpenHome")?.addEventListener("click", () => open());
    const label = document.querySelector("#worldOpenHomeLabel");
    const setLabel = () => { if (label) label.textContent = tr("title"); };
    setLabel();
    addEventListener("glowletter-language-changed", () => { setLabel(); render(); });
    addEventListener("glowletter-access-change", () => { checkChest(); render(); });
    addEventListener("glowletter-points", () => { if (state.root && !state.root.hidden) refresh(); });
    setTimeout(checkChest, 2500);
  }

  window.GlowLetterWorld = Object.freeze({
    open,
    stickers: STICKERS,
    frames: FRAMES,
    owned: () => (state.chest?.owned || []).slice(),
    loadOwned: async () => { if (!state.chest && signedIn()) { try { state.chest = await rpc("glowletter_chest_state"); } catch {} } return (state.chest?.owned || []).slice(); },
    text: (key, values) => tr(key, values)
  });
  init();
})();
