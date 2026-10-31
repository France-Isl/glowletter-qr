/* Рейтинг сезона (15 дней): «Весь мир» (топ-100) и «Друзья», пьедестал с коронами, ранги-лиги по опыту,
   «Мой профиль» с уровнем, медалями и историей побед, церемония вручения медали, уведомления о месте,
   знак «В комнату зашёл ADMIN» и админ-вкладка «Игры». Тексты ru/en/fr здесь, остальные 22 — ranking-i18n.js. */
(() => {
  "use strict";

  const TEXT = {
    ru: {
      brand: "GlowLetter", world: "Весь мир", friends: "Друзья", worldNote: "Топ игроков за 15 дней", friendsNote: "Топ среди друзей за 15 дней",
      left: "Осталось: {time}", days: "{n} дн.", colPlayer: "Игрок", colFriend: "Друг", colRank: "Ранг", colXp: "Опыт", you: "Вы", hidden: "Игрок скрыт",
      inviteTitle: "Пригласить друзей", inviteNote: "Играйте вместе и поднимайтесь в рейтинге!", empty: "В этом сезоне ещё никто не набрал опыта. Сыграйте — и станьте первым!",
      failed: "Не удалось загрузить рейтинг", league_bronze: "Бронза", league_silver: "Серебро", league_gold: "Золото", league_platinum: "Платина", league_diamond: "Алмаз",
      title_newbie: "Новичок", title_player: "Профи", title_master: "Мастер", title_champion: "Чемпион", title_legend: "Легенда",
      infoTitle: "Как устроен рейтинг", info1: "Сезон длится 15 дней. Опыт дают игры, огонёк дней подряд, Тёпа и слово дня.",
      info2: "В конце сезона: 1 место — золотая медаль, 2 — серебряная, 3 — бронзовая. Опыт сезона обнуляется сам, а медали остаются навсегда.",
      info3: "Ранг зависит от опыта за сезон: Бронза, Серебро (100), Золото (300), Платина (600), Алмаз (1000).",
      info4: "Титул — за все сезоны: Новичок → Профи (300 опыта) → Мастер (любая медаль) → Чемпион (золото) → Легенда (3 золота).",
      showName: "Показывать моё имя во «Всём мире»", profile: "Мой профиль", profileOf: "Профиль", level: "Уровень {n}", tabStats: "Статистика", tabMedals: "Награды", tabTitles: "Достижения",
      myMedals: "Мои медали", medals: "Медали", gold: "Золотые", silver: "Серебряные", bronze: "Бронзовые", history: "История побед", season: "Сезон #{n}", noMedals: "Медалей пока нет — всё впереди!",
      statSeason: "Опыт сезона", statPlace: "Место в мире", statTotal: "Весь опыт", statGames: "Сыграно игр", statWins: "Победы", statFriends: "Друзья", pOnline: "В сети", pSeen: "Последний раз в сети: {time}", pSince: "В GlowLetter с {date}", statCards: "Партий в Дурака и Шашки", statCardWins: "Побед за столом", statStreak: "Лучшая серия побед", statGifts: "Подарков получено", gifts: "Подарки", noGifts: "Подарков пока нет", write: "Написать", call: "Позвонить", tabAdmin: "Админ",
      ceremonyTitle: "Сезон #{n} завершён!", place1: "1 место — Золотая медаль", place2: "2 место — Серебряная медаль", place3: "3 место — Бронзовая медаль", ceremonyTake: "Забрать награду",
      rankDown: "Вы опустились на {place}-е место. {name} теперь выше вас!", rankUp: "Вы поднялись на {place}-е место!", back: "Назад", close: "Закрыть", info: "Как это работает",
      open: "Рейтинг", adminJoined: "В комнату зашёл", private: "Профиль закрыт", xp: "XP", now: "сейчас", editName: "Изменить имя", save: "Сохранить"
    },
    en: {
      brand: "GlowLetter", world: "Whole world", friends: "Friends", worldNote: "Top players of the 15-day season", friendsNote: "Top among friends in 15 days",
      left: "Left: {time}", days: "{n} d", colPlayer: "Player", colFriend: "Friend", colRank: "Rank", colXp: "XP", you: "You", hidden: "Hidden player",
      inviteTitle: "Invite friends", inviteNote: "Play together and climb the ranking!", empty: "Nobody has earned XP this season yet. Play — and be the first!",
      failed: "Couldn’t load the ranking", league_bronze: "Bronze", league_silver: "Silver", league_gold: "Gold", league_platinum: "Platinum", league_diamond: "Diamond",
      title_newbie: "Newbie", title_player: "Pro", title_master: "Master", title_champion: "Champion", title_legend: "Legend",
      infoTitle: "How the ranking works", info1: "A season lasts 15 days. You earn XP from games, your day streak, Teddy and the word of the day.",
      info2: "When the season ends: 1st place gets a gold medal, 2nd silver, 3rd bronze. Season XP resets by itself, medals stay forever.",
      info3: "Your rank depends on season XP: Bronze, Silver (100), Gold (300), Platinum (600), Diamond (1000).",
      info4: "Your title counts all seasons: Newbie → Pro (300 XP) → Master (any medal) → Champion (gold) → Legend (3 golds).",
      showName: "Show my name in the whole world", profile: "My profile", profileOf: "Profile", level: "Level {n}", tabStats: "Stats", tabMedals: "Awards", tabTitles: "Achievements",
      myMedals: "My medals", medals: "Medals", gold: "Gold", silver: "Silver", bronze: "Bronze", history: "Win history", season: "Season #{n}", noMedals: "No medals yet — it’s all ahead!",
      statSeason: "Season XP", statPlace: "World place", statTotal: "All XP", statGames: "Games played", statWins: "Wins", statFriends: "Friends", pOnline: "Online", pSeen: "Last online: {time}", pSince: "On GlowLetter since {date}", statCards: "Durak and Checkers games", statCardWins: "Table wins", statStreak: "Best win streak", statGifts: "Gifts received", gifts: "Gifts", noGifts: "No gifts yet", write: "Message", call: "Call", tabAdmin: "Admin",
      ceremonyTitle: "Season #{n} is over!", place1: "1st place — Gold medal", place2: "2nd place — Silver medal", place3: "3rd place — Bronze medal", ceremonyTake: "Collect the award",
      rankDown: "You dropped to place {place}. {name} is above you now!", rankUp: "You climbed to place {place}!", back: "Back", close: "Close", info: "How it works",
      open: "Ranking", adminJoined: "Entered the room:", private: "This profile is private", xp: "XP", now: "now", editName: "Change name", save: "Save"
    },
    fr: {
      brand: "GlowLetter", world: "Monde entier", friends: "Amis", worldNote: "Meilleurs joueurs de la saison de 15 jours", friendsNote: "Meilleurs amis sur 15 jours",
      left: "Reste : {time}", days: "{n} j", colPlayer: "Joueur", colFriend: "Ami", colRank: "Rang", colXp: "XP", you: "Vous", hidden: "Joueur masqué",
      inviteTitle: "Inviter des amis", inviteNote: "Jouez ensemble et montez au classement !", empty: "Personne n’a encore gagné d’XP cette saison. Jouez et soyez le premier !",
      failed: "Impossible de charger le classement", league_bronze: "Bronze", league_silver: "Argent", league_gold: "Or", league_platinum: "Platine", league_diamond: "Diamant",
      title_newbie: "Débutant", title_player: "Pro", title_master: "Maître", title_champion: "Champion", title_legend: "Légende",
      infoTitle: "Comment fonctionne le classement", info1: "Une saison dure 15 jours. Les jeux, la série de jours, Nounours et le mot du jour donnent de l’XP.",
      info2: "À la fin de la saison : 1re place — médaille d’or, 2e — argent, 3e — bronze. L’XP de saison repart à zéro, les médailles restent pour toujours.",
      info3: "Le rang dépend de l’XP de la saison : Bronze, Argent (100), Or (300), Platine (600), Diamant (1000).",
      info4: "Le titre compte toutes les saisons : Débutant → Pro (300 XP) → Maître (une médaille) → Champion (or) → Légende (3 ors).",
      showName: "Afficher mon nom dans le monde entier", profile: "Mon profil", profileOf: "Profil", level: "Niveau {n}", tabStats: "Statistiques", tabMedals: "Récompenses", tabTitles: "Succès",
      myMedals: "Mes médailles", medals: "Médailles", gold: "Or", silver: "Argent", bronze: "Bronze", history: "Historique des victoires", season: "Saison n° {n}", noMedals: "Pas encore de médaille — tout est devant vous !",
      statSeason: "XP de la saison", statPlace: "Place mondiale", statTotal: "XP total", statGames: "Parties jouées", statWins: "Victoires", statFriends: "Amis", pOnline: "En ligne", pSeen: "Dernière connexion : {time}", pSince: "Sur GlowLetter depuis {date}", statCards: "Parties de Durak et de dames", statCardWins: "Victoires à la table", statStreak: "Meilleure série de victoires", statGifts: "Cadeaux reçus", gifts: "Cadeaux", noGifts: "Pas encore de cadeaux", write: "Écrire", call: "Appeler", tabAdmin: "Admin",
      ceremonyTitle: "La saison n° {n} est terminée !", place1: "1re place — Médaille d’or", place2: "2e place — Médaille d’argent", place3: "3e place — Médaille de bronze", ceremonyTake: "Récupérer la récompense",
      rankDown: "Vous êtes descendu à la place {place}. {name} est devant vous !", rankUp: "Vous êtes monté à la place {place} !", back: "Retour", close: "Fermer", info: "Comment ça marche",
      open: "Classement", adminJoined: "Entre dans la salle :", private: "Ce profil est privé", xp: "XP", now: "maintenant", editName: "Modifier le nom", save: "Enregistrer"
    }
  };
  Object.assign(TEXT, window.GLOWLETTER_RANKING_I18N || {});

  const LEAGUES = Object.freeze([["diamond", 1000], ["platinum", 600], ["gold", 300], ["silver", 100], ["bronze", 0]]);
  const RANK_KEY = "glowletter-rank-friends";
  const state = { root: null, scope: "world", data: null, loading: false, error: "", timer: 0, profile: null, profileTab: "medals", profileOnly: false, adminCard: null, info: false, editName: false, admin: null, seenAdmin: new Set() };

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const me = () => cloud()?.getState?.().userId || "";
  const signedIn = () => Boolean(cloud()?.getState?.().signedIn);
  const language = () => { const value = String(app()?.getState?.().language || "ru").toLowerCase(); return TEXT[value] ? value : "en"; };
  const tr = (key, values = {}) => String(TEXT[language()]?.[key] ?? TEXT.en[key] ?? TEXT.ru[key] ?? key).replace(/\{(\w+)\}/g, (all, name) => values[name] ?? "");
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const notify = (message, ms = 4200) => app()?.notify?.(message, ms);
  const number = value => { try { return new Intl.NumberFormat(language() === "ind" ? "id" : language()).format(value || 0); } catch { return String(value || 0); } };
  const league = points => LEAGUES.find(([, min]) => (points || 0) >= min)[0];
  async function rpc(name, args = {}) {
    const db = client();
    if (!db) throw new Error("offline");
    const { data, error } = await db.rpc(name, args);
    if (error) throw error;
    return data;
  }

  // Уровень по всему опыту: на каждый следующий уровень нужно на 50 опыта больше (100, 150, 200…).
  function levelOf(total) {
    let level = 1, need = 100, rest = Math.max(0, total || 0);
    while (rest >= need) { rest -= need; level += 1; need += 50; }
    return { level, have: rest, need };
  }

  // ——— Картинки (свои SVG, без внешних файлов) ———

  const hue = seed => { let h = 0; for (const ch of String(seed || "?")) h = (h * 31 + ch.codePointAt(0)) % 360; return h; };
  // Аватар — маленькая картина (закат, луна, сакура, кошки, море, город); выбирается по игроку.
  const SCENES = [
    '<rect width="100" height="100" fill="url(#glrSky0)"/><circle cx="50" cy="66" r="18" fill="#ffd27a" opacity=".85"/><path d="M0 74 18 60l14 9 16-15 18 13 14-8 20 12v29H0Z" fill="#4b2245"/><circle cx="50" cy="44" r="12" fill="#1b0f1e"/><path d="M38 41c0-10 5-17 12-17s12 7 12 17l1 9H37Z" fill="#1b0f1e"/><path d="M20 100c2-22 14-36 30-36s28 14 30 36Z" fill="#1b0f1e"/>',
    '<rect width="100" height="100" fill="url(#glrSky1)"/><circle cx="70" cy="27" r="11" fill="#fff3c4"/><circle cx="75" cy="23" r="10" fill="#2a2a7a"/><circle cx="22" cy="20" r="1.4" fill="#fff"/><circle cx="36" cy="12" r="1" fill="#fff"/><circle cx="84" cy="48" r="1.2" fill="#fff"/><path d="M34 52c0-14 7-24 16-24s16 10 16 24v8H34Z" fill="#120c26"/><path d="M18 100c2-24 15-38 32-38s30 14 32 38Z" fill="#120c26"/><path d="M42 50c1-7 4-11 8-11s7 4 8 11l-1 6H43Z" fill="#2b1f4a"/>',
    '<rect width="100" height="100" fill="url(#glrSky2)"/><path d="M47 100 49 62h4l2 38Z" fill="#5b2a3a"/><circle cx="38" cy="52" r="15" fill="#ff8fc2"/><circle cx="60" cy="48" r="17" fill="#ffa8d2"/><circle cx="50" cy="36" r="15" fill="#ffc2df"/><circle cx="30" cy="40" r="10" fill="#ff9fcb"/><circle cx="70" cy="34" r="10" fill="#ffb5d8"/><path d="M0 88c20-6 40-6 60 0s30 4 40 0v12H0Z" fill="#7a2f5f"/>',
    '<rect width="100" height="100" fill="url(#glrSky3)"/><circle cx="50" cy="40" r="22" fill="#ffd9a8" opacity=".9"/><path d="M28 100V70c0-8 3-14 8-17l-2-10 7 6h6l7-6-2 10c5 3 8 9 8 17v30Z" fill="#1d1028"/><path d="M60 100V78c0-6 2-10 6-12l-1-8 5 5h4l5-5-1 8c4 2 6 6 6 12v22Z" fill="#2a1638"/>',
    '<rect width="100" height="100" fill="url(#glrSky4)"/><circle cx="56" cy="58" r="14" fill="#ffe08a"/><rect y="64" width="100" height="36" fill="#3b2a6a"/><path d="M0 70h100M10 78h80M20 86h60" stroke="#ffb46a" stroke-width="1.6" opacity=".55"/><path d="M24 100c2-20 3-34 8-46" stroke="#1a0f20" stroke-width="3.4" fill="none"/><path d="M32 54c-10-4-18-2-22 4 8-3 14-2 22-4Zm0 0c4-10 12-14 20-12-8 1-14 6-20 12Zm0 0c-4-9-12-12-20-10 8 2 14 5 20 10Zm0 0c10-2 17 2 20 8-7-4-13-6-20-8Z" fill="#1a0f20"/>',
    '<rect width="100" height="100" fill="url(#glrSky5)"/><circle cx="72" cy="30" r="8" fill="#fff0c2"/><path d="M0 100V74h10V62l5-6 5 6v12h8V56c0-8 6-14 12-16 6 2 12 8 12 16v18h8V60l5-7 5 7v14h10V66l5-5 5 5v34Z" fill="#24122e"/><circle cx="40" cy="38" r="2.4" fill="#24122e"/>'
  ];
  function avatar(row, size = "") {
    const scene = hue(row?.user_id || row?.name || row?.place) % SCENES.length;
    return `<span class="glr-ava${size ? ` is-${size}` : ""}" aria-hidden="true"><svg viewBox="0 0 100 100" focusable="false">${SCENES[scene]}</svg></span>`;
  }
  // Корона, лавры, кольцо и восьмиугольный значок — как на фото владельца.
  const GEM = { gold: "#e3263f", silver: "#2f6dff", bronze: "#d8243a" };
  const CROWN = tone => `<svg class="glr-crown is-${tone}" viewBox="0 0 80 56" aria-hidden="true" focusable="false"><path d="M9 46 5 17l12 13 6-19 10 15 7-22 7 22 10-15 6 19 12-13-4 29Z" fill="url(#glrShine-${tone})" stroke="rgba(40,20,0,.35)" stroke-width="1" stroke-linejoin="round"/><path d="M13 41 11 26l7 7 5-12 9 13 8-17 8 17 9-13 5 12 7-7-2 15Z" fill="rgba(255,255,255,.22)"/><path d="M8 43q32-7 64 0v8q-32-6-64 0Z" fill="url(#glrShine-${tone})" stroke="rgba(40,20,0,.35)" stroke-width="1"/><path d="M10 45q30-6 60 0" stroke="rgba(255,255,255,.75)" stroke-width="1.2" fill="none"/><path d="M40 27l4 6-4 6-4-6Z" fill="${GEM[tone]}" stroke="rgba(255,255,255,.7)" stroke-width=".8"/><circle cx="5" cy="16" r="3.6" fill="url(#glrShine-${tone})"/><circle cx="23" cy="10" r="3.4" fill="url(#glrShine-${tone})"/><circle cx="40" cy="4" r="4" fill="url(#glrShine-${tone})"/><circle cx="57" cy="10" r="3.4" fill="url(#glrShine-${tone})"/><circle cx="75" cy="16" r="3.6" fill="url(#glrShine-${tone})"/><circle cx="39" cy="2.8" r="1.4" fill="#fff"/></svg>`;
  const LEAF = "M0 0C4.2-5 4.6-13 0-20C-4.6-13-4.2-5 0 0Z";
  function laurel(tone) {
    const leaves = [];
    const top = tone === "gold" ? 318 : 302;
    const count = tone === "gold" ? 9 : 8;
    for (let i = 0; i < count; i += 1) {
      const k = i / (count - 1);
      const theta = 204 + k * (top - 204);
      const size = .9 + k * .45;
      for (const [r, tilt, scale] of [[58, -36, 1], [54, 24, .8]]) {
        const a = theta * Math.PI / 180;
        const x = 60 + r * Math.sin(a);
        const y = 60 - r * Math.cos(a);
        const phi = theta + 90 + tilt;
        for (const side of [1, -1]) {
          const sx = side === 1 ? x : 120 - x;
          const rot = side === 1 ? phi : -phi;
          leaves.push(`<path d="${LEAF}" transform="translate(${sx.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${(size * scale).toFixed(2)})" fill="url(#glrLeaf-${tone})" stroke="rgba(30,15,0,.28)" stroke-width=".7"/>`);
        }
      }
    }
    const stem = (a, side) => `${(60 + side * 53 * Math.sin(a * Math.PI / 180)).toFixed(1)} ${(60 - 53 * Math.cos(a * Math.PI / 180)).toFixed(1)}`;
    const stems = `M${stem(198, 1)}A53 53 0 0 1 ${stem(top - 8, 1)}M${stem(198, -1)}A53 53 0 0 0 ${stem(top - 8, -1)}`;
    return `<svg class="glr-laurel" viewBox="-22 -22 164 164" aria-hidden="true" focusable="false"><path d="${stems}" fill="none" stroke="url(#glrLeaf-${tone})" stroke-width="2.2" stroke-linecap="round"/>${leaves.join("")}</svg>`;
  }
  const RING = tone => `<svg class="glr-ring" viewBox="-22 -22 164 164" aria-hidden="true" focusable="false"><circle cx="60" cy="60" r="47.6" fill="none" stroke="rgba(20,10,0,.55)" stroke-width="9.2"/><circle cx="60" cy="60" r="47.6" fill="none" stroke="url(#glrShine-${tone})" stroke-width="7.4"/><circle cx="60" cy="60" r="50.6" fill="none" stroke="rgba(255,255,255,.55)" stroke-width=".8"/><circle cx="60" cy="60" r="44.4" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1"/></svg>`;
  const OCT = r => Array.from({ length: 8 }, (_, i) => {
    const a = (22.5 + i * 45) * Math.PI / 180;
    return `${(24 + r * Math.sin(a)).toFixed(2)} ${(24 - r * Math.cos(a)).toFixed(2)}`;
  }).join(" ");
  const BADGE = (place, tone) => `<span class="glr-badge is-${tone}" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><polygon points="${OCT(23.5)}" fill="rgba(25,12,0,.55)"/><polygon points="${OCT(22.4)}" fill="url(#glrShine-${tone})"/><polygon points="${OCT(17.6)}" fill="rgba(30,15,0,.4)"/><polygon points="${OCT(16.8)}" fill="url(#glrFace-${tone})"/><polygon points="${OCT(16.8)}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width=".7"/></svg><b>${place}</b></span>`;
  const ROSETTE = (place, tone) => `<span class="glr-rosette is-${tone}" aria-hidden="true"><svg viewBox="-28 -28 56 56" focusable="false"><path d="M0-26 6-21 14-22 16-14 23-9 20-1 23 7 16 12 14 20 6 19 0 25-6 19-14 20-16 12-23 7-20-1-23-9-16-14-14-22-6-21Z" fill="url(#glrMetal-${tone})" stroke="rgba(0,0,0,.3)"/><circle r="16" fill="url(#glrMetal-${tone})" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/><circle r="12.5" fill="url(#glrDeep-${tone})"/></svg><b>${place}</b></span>`;
  const MEDAL = (place, tone, big = false) => `<span class="glr-medal is-${tone}${big ? " is-big" : ""}" aria-hidden="true"><svg viewBox="0 0 64 74" focusable="false"><path d="M18 0h12l6 22H24Z" fill="#c2185b"/><path d="M34 0h12l-6 22H28Z" fill="#7b1fa2"/><g transform="translate(32 46)"><path d="M0-26 6-21 14-22 16-14 23-9 20-1 23 7 16 12 14 20 6 19 0 25-6 19-14 20-16 12-23 7-20-1-23-9-16-14-14-22-6-21Z" fill="url(#glrMetal-${tone})" stroke="rgba(0,0,0,.25)"/><circle r="15" fill="url(#glrMetal-${tone})" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/></g></svg><b>${place}</b></span>`;
  const XP = `<span class="glr-xp" aria-hidden="true">XP</span>`;
  const LEAGUE_ICON = id => id === "diamond"
    ? `<svg class="glr-league-ic is-diamond" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 3h12l4 6-10 12L2 9Z" fill="#5fd0ff"/><path d="M2 9h20M8 3l4 18 4-18M6 3l2 6 4-6 4 6 2-6" fill="none" stroke="#e8fbff" stroke-width="1" opacity=".8"/></svg>`
    : `<svg class="glr-league-ic is-${id}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 20 5v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5Z" fill="url(#glrMetal-${id === "platinum" ? "silver" : id})"/><path d="M12 7l1.5 3 3.3.4-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.4Z" fill="rgba(255,255,255,.85)"/></svg>`;
  const ICON = Object.freeze({
    back: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    people: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.4" fill="currentColor"/><path d="M2.5 19c.6-3.6 3.1-5.6 6.5-5.6s5.9 2 6.5 5.6Z" fill="currentColor"/><circle cx="17" cy="9" r="2.6" fill="currentColor" opacity=".75"/><path d="M15.6 13.6c3 .1 5.2 1.9 5.9 5.4h-4.3" fill="currentColor" opacity=".75"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.5v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.3" fill="currentColor"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.6 4.5 13.2a4.7 4.7 0 0 1 6.6-6.7l.9.9.9-.9a4.7 4.7 0 0 1 6.6 6.7Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    chart: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 20V11M12 20V5M19 20v-7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    cup: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4h10v5a5 5 0 0 1-10 0Z" fill="currentColor"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3M8 20h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" fill="currentColor"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10.3 2.6h3.4l.5 2.6 1.8.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.8 2.6.5v3.4l-2.6.5-.8 1.8 1.5 2.2-2.4 2.4-2.2-1.5-1.8.8-.5 2.6h-3.4l-.5-2.6-1.8-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.8-2.6-.5v-3.4l2.6-.5.8-1.8-1.5-2.2 2.4-2.4 2.2 1.5 1.8-.8Z" fill="currentColor"/><circle cx="12" cy="12" r="3.4" fill="#1d1430"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m4 20 1-4.6L15.6 4.8a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L8.6 19ZM14 6.4l3.6 3.6M4 20h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tick: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    flag: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 21V4m0 0h11l-2 4 2 4H5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="5" width="16" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 10h16M9 3v4M15 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  });
  // Градиенты металла — один раз на страницу.
  const DEFS = `<svg class="glr-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="glrMetal-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#ffc83d"/><stop offset="1" stop-color="#c98a12"/></linearGradient>
    <linearGradient id="glrMetal-silver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#c9d3e6"/><stop offset="1" stop-color="#7f8aa6"/></linearGradient>
    <linearGradient id="glrMetal-bronze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd2b8"/><stop offset=".5" stop-color="#f08a5d"/><stop offset="1" stop-color="#a5482a"/></linearGradient>
    <linearGradient id="glrDeep-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd257"/><stop offset="1" stop-color="#d08a12"/></linearGradient>
    <linearGradient id="glrDeep-silver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9c8ea"/><stop offset="1" stop-color="#5d6f9c"/></linearGradient>
    <linearGradient id="glrDeep-bronze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a76"/><stop offset="1" stop-color="#b8432c"/></linearGradient>
    <linearGradient id="glrShine-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset=".22" stop-color="#ffd24d"/><stop offset=".48" stop-color="#b97a10"/><stop offset=".7" stop-color="#ffe68c"/><stop offset="1" stop-color="#a8680a"/></linearGradient>
    <linearGradient id="glrShine-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".22" stop-color="#dfe4f4"/><stop offset=".48" stop-color="#8b93b2"/><stop offset=".7" stop-color="#f6f8ff"/><stop offset="1" stop-color="#77809f"/></linearGradient>
    <linearGradient id="glrShine-bronze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6d8"/><stop offset=".22" stop-color="#f4a88c"/><stop offset=".48" stop-color="#ad5847"/><stop offset=".7" stop-color="#ffcdb6"/><stop offset="1" stop-color="#9c4a3c"/></linearGradient>
    <linearGradient id="glrFace-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset=".55" stop-color="#ffbf2e"/><stop offset="1" stop-color="#e09412"/></linearGradient>
    <linearGradient id="glrFace-silver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e3e7f3"/><stop offset="1" stop-color="#b9c0d6"/></linearGradient>
    <linearGradient id="glrFace-bronze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9c6"/><stop offset=".55" stop-color="#f2a486"/><stop offset="1" stop-color="#d0785e"/></linearGradient>
    <linearGradient id="glrLeaf-gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#ffc93a"/><stop offset="1" stop-color="#b4740c"/></linearGradient>
    <linearGradient id="glrLeaf-silver" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#cfd5ea"/><stop offset="1" stop-color="#7d86a6"/></linearGradient>
    <linearGradient id="glrLeaf-bronze" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe0d2"/><stop offset=".5" stop-color="#f29a7c"/><stop offset="1" stop-color="#a24f3e"/></linearGradient>
    <linearGradient id="glrSky0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a2a7a"/><stop offset=".55" stop-color="#e2667a"/><stop offset="1" stop-color="#ffb35c"/></linearGradient>
    <linearGradient id="glrSky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151c5a"/><stop offset="1" stop-color="#5b3aa0"/></linearGradient>
    <linearGradient id="glrSky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7d6ea"/><stop offset="1" stop-color="#c25b9c"/></linearGradient>
    <linearGradient id="glrSky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43207a"/><stop offset="1" stop-color="#e2649c"/></linearGradient>
    <linearGradient id="glrSky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3a8a"/><stop offset=".6" stop-color="#ff8a6a"/><stop offset="1" stop-color="#ffc06a"/></linearGradient>
    <linearGradient id="glrSky5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a8a"/><stop offset=".6" stop-color="#c25c9a"/><stop offset="1" stop-color="#ff9a6a"/></linearGradient>
    <radialGradient id="glrSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd59a"/><stop offset=".35" stop-color="#ff8a5c" stop-opacity=".8"/><stop offset="1" stop-color="#ff5c8a" stop-opacity="0"/></radialGradient>
    <radialGradient id="glrCloud" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffa0c0" stop-opacity=".9"/><stop offset="1" stop-color="#ff9ac8" stop-opacity="0"/></radialGradient>
    <linearGradient id="glrDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0f2c" stop-opacity="0"/><stop offset=".3" stop-color="#55205e"/><stop offset=".55" stop-color="#d0507a"/><stop offset=".7" stop-color="#ff9a5c"/><stop offset=".82" stop-color="#c2466e"/><stop offset="1" stop-color="#2a1236"/></linearGradient>
  </defs></svg>`;
  // Закат за пьедесталом: облака, горы, сердечки и искры.
  const SCENE = `<div class="glr-scene" aria-hidden="true"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" focusable="false">
    <rect width="400" height="300" fill="url(#glrDusk)"/>
    <ellipse cx="200" cy="195" rx="210" ry="80" fill="url(#glrSun)"/><ellipse cx="200" cy="200" rx="90" ry="34" fill="url(#glrSun)"/>
    <ellipse cx="80" cy="120" rx="120" ry="34" fill="url(#glrCloud)"/><ellipse cx="320" cy="110" rx="130" ry="36" fill="url(#glrCloud)"/><ellipse cx="200" cy="160" rx="160" ry="30" fill="url(#glrCloud)" opacity=".6"/>
    <path d="M0 210 50 160l40 30 50-55 60 60 50-45 50 35 50-40 50 45v110H0Z" fill="#3a1748" opacity=".85"/>
    <path d="M0 240 70 200l50 25 60-35 70 40 60-30 90 35v65H0Z" fill="#24102f"/>
  </svg><i class="is-heart"></i><i class="is-heart"></i><i class="is-heart"></i><i></i><i></i><i></i><i></i><i></i></div>`;
  const TONE = { 1: "gold", 2: "silver", 3: "bronze" };

  // ——— Окно ———

  function mount() {
    if (state.root) return state.root;
    if (!document.querySelector(".glr-defs")) document.body.insertAdjacentHTML("beforeend", DEFS);
    const root = document.createElement("div");
    root.className = "glr";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.addEventListener("click", onClick);
    root.addEventListener("change", onChange);
    root.addEventListener("submit", onSubmit);
    root.addEventListener("keydown", event => { if (event.key === "Escape") { event.stopPropagation(); back(); } });
    document.body.append(root);
    state.root = root;
    return root;
  }

  async function open(options = {}) {
    if (!signedIn()) { app()?.openPaywall?.(); return; }
    const root = mount();
    state.scope = options.scope === "friends" ? "friends" : state.scope;
    state.profile = null;
    state.info = false;
    // Профиль по нажатию на имя (чат, стол «Дурака»): «Назад» возвращает туда, откуда открыли.
    state.profileOnly = Boolean(options.only && options.profile);
    root.hidden = false;
    document.body.classList.add("glr-open");
    requestAnimationFrame(() => root.classList.add("is-open"));
    clearInterval(state.timer);
    state.timer = setInterval(tick, 1000);
    render();
    if (!state.profileOnly) await load();
    if (options.profile) openProfile(options.profile === true ? me() : options.profile);
  }

  function close() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    document.body.classList.remove("glr-open");
    clearInterval(state.timer);
    setTimeout(() => { if (!root.classList.contains("is-open")) root.hidden = true; }, 260);
  }

  function back() {
    if (state.info) { state.info = false; render(); return; }
    if (state.profile && !state.profileOnly) { state.profile = null; render(); return; }
    close();
  }

  async function load() {
    state.loading = true; state.error = "";
    render();
    try {
      state.data = await rpc("glowletter_season_ranking", { p_scope: state.scope });
      if (state.scope === "friends") watchFriendsPlace(state.data);
    } catch { state.error = tr("failed"); state.data = null; }
    state.loading = false;
    render();
  }

  function left() {
    const ends = new Date(state.data?.ends_at || 0).getTime();
    let seconds = Math.max(0, Math.floor((ends - Date.now()) / 1000));
    const days = Math.floor(seconds / 86400); seconds %= 86400;
    const clock = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(value => String(value).padStart(2, "0")).join(":");
    return `${days ? `${tr("days", { n: days })} ` : ""}${clock}`;
  }
  function tick() {
    const node = state.root?.querySelector("[data-glr=left]");
    if (node) node.textContent = tr("left", { time: left() });
  }

  function render() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.innerHTML = `<div class="glr-sky" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="glr-screen">${state.info ? renderInfo() : state.profile ? renderProfile() : renderBoard()}</div>`;
  }

  function header(title, brand = false, right = "") {
    return `<header class="glr-head">
      <button class="glr-icon" type="button" data-glr-action="back" aria-label="${escapeHtml(tr("back"))}">${ICON.back}</button>
      <h2 class="${brand ? "glr-brand" : ""}">${escapeHtml(title)}${brand ? ICON.heart : ""}</h2>
      ${right || `<span class="glr-icon is-empty"></span>`}
    </header>`;
  }

  function renderBoard() {
    const data = state.data;
    const top = data?.top || [];
    const friends = state.scope === "friends";
    const podium = [top[1], top[0], top[2]];
    const rest = top.slice(3);
    const mine = data?.mine;
    return `${header(tr("brand"), true, `<button class="glr-icon is-crown" type="button" data-glr-action="info" aria-label="${escapeHtml(tr("info"))}">${CROWN("gold")}</button>`)}
      <div class="glr-tabs-wrap">
      <div class="glr-tabs" role="tablist">
        <button type="button" role="tab" class="is-world" aria-selected="${!friends}" data-glr-action="scope" data-scope="world">${ICON.globe}<span>${escapeHtml(tr("world"))}</span></button>
        <button type="button" role="tab" class="is-friends" aria-selected="${friends}" data-glr-action="scope" data-scope="friends">${ICON.people}<span>${escapeHtml(tr("friends"))}</span></button>
      </div></div>
      <section class="glr-stage">${SCENE}
      <p class="glr-note">${escapeHtml(tr(friends ? "friendsNote" : "worldNote"))}</p>
      <p class="glr-left">${ICON.clock}<span data-glr="left">${escapeHtml(tr("left", { time: data ? left() : "…" }))}</span></p>
      ${state.loading && !data ? `<div class="glr-loading" aria-busy="true"><span></span><span></span><span></span></div></section>` : state.error ? `<p class="glr-empty">${escapeHtml(state.error)}</p></section>` : `
      <div class="glr-podium">${podium.map((row, index) => pedestal(row, [2, 1, 3][index])).join("")}</div></section>
      ${top.length ? "" : `<p class="glr-empty">${escapeHtml(tr("empty"))}</p>`}
      ${rest.length ? `<div class="glr-table" role="table">
        <div class="glr-row is-head" role="row"><span>#</span><span>${escapeHtml(tr(friends ? "colFriend" : "colPlayer"))}</span><span>${escapeHtml(tr("colRank"))}</span><span>${escapeHtml(tr("colXp"))}</span></div>
        ${rest.map(row).join("")}
      </div>` : ""}`}
      ${friends
        ? `<button class="glr-invite" type="button" data-glr-action="invite"><span class="glr-invite-ic">${ICON.people}</span><span><b>${escapeHtml(tr("inviteTitle"))}</b><small>${escapeHtml(tr("inviteNote"))}</small></span>${ICON.chevron}</button>`
        : `<button class="glr-me" type="button" data-glr-action="profile" data-user="${escapeHtml(me())}"><b class="glr-me-place">${mine?.place ? `#${mine.place}` : "—"}</b>${avatar({ user_id: me(), name: myName() }, "md")}<span><b>${escapeHtml(myName() || tr("you"))}</b><small>${LEAGUE_ICON(league(mine?.points))}${escapeHtml(tr(`league_${league(mine?.points)}`))}</small></span><b class="glr-me-xp">${number(mine?.points)} ${XP}</b>${ICON.chevron}</button>`}`;
  }

  function myName() {
    return state.data?.mine?.name || (state.data?.top || []).find(item => item.me)?.name || "";
  }

  function pedestal(item, place) {
    const tone = TONE[place];
    const name = item ? (item.me ? tr("you") : item.name == null ? tr("hidden") : item.name) : "—";
    const action = item?.user_id ? ` data-glr-action="profile" data-user="${escapeHtml(item.user_id)}"` : "";
    return `<button class="glr-ped is-${place}${item ? "" : " is-empty"}" type="button"${action}${item ? "" : " disabled"}>
      <span class="glr-ped-crown">${CROWN(tone)}</span>
      <span class="glr-ped-ring">${laurel(tone)}${avatar(item || { place }, place === 1 ? "xl" : "lg")}${RING(tone)}${BADGE(place, tone)}</span>
      <span class="glr-ped-block">
        <b class="glr-ped-name">${escapeHtml(name)}</b>
        <small class="glr-title is-${escapeHtml(item?.title || "newbie")}">${item ? escapeHtml(tr(`title_${item.title || "newbie"}`)) : "&nbsp;"}</small>
        <b class="glr-ped-xp">${item ? `${number(item.points)} ${XP}` : "&nbsp;"}</b>
      </span>${place === 1 ? `<span class="glr-ped-base"></span>` : ""}
    </button>`;
  }

  function row(item) {
    const id = league(item.points);
    const name = item.me ? tr("you") : item.name == null ? tr("hidden") : item.name;
    const action = item.user_id ? ` data-glr-action="profile" data-user="${escapeHtml(item.user_id)}"` : "";
    return `<div class="glr-row${item.me ? " is-me" : ""}" role="row"${action}${item.user_id ? ' tabindex="0"' : ""}>
      <span class="glr-place">${item.place}</span>
      <span class="glr-who">${avatar(item, "sm")}<b>${escapeHtml(name)}</b></span>
      <span class="glr-league is-${id}">${LEAGUE_ICON(id)}${escapeHtml(tr(`league_${id}`))}</span>
      <span class="glr-pts">${number(item.points)} ${XP}</span>
    </div>`;
  }

  function renderInfo() {
    return `${header(tr("infoTitle"))}
      <div class="glr-card glr-info">
        <p>${escapeHtml(tr("info1"))}</p><p>${escapeHtml(tr("info2"))}</p><p>${escapeHtml(tr("info3"))}</p><p>${escapeHtml(tr("info4"))}</p>
        <label class="glr-switch"><input type="checkbox" data-glr-change="public"${state.data?.public ? " checked" : ""}><span></span>${escapeHtml(tr("showName"))}</label>
      </div>`;
  }

  // ——— Профиль: уровень, статистика, награды, достижения ———

  async function openProfile(userId) {
    state.profile = { userId, loading: true };
    state.profileTab = "stats";
    state.editName = false;
    state.adminCard = null;
    render();
    try { state.profile = { userId, data: await rpc("glowletter_medal_wall", { p_user: userId }) }; }
    catch (error) { state.profile = { userId, error: String(error?.message) === "private" ? tr("private") : tr("failed") }; }
    render();
  }

  const isAdmin = () => Boolean(cloud()?.getState?.().isAdmin);
  const ONLINE_MS = 3 * 60 * 1000;
  function presence(data) {
    if (data.me || !data.last_seen) return "";
    const seen = new Date(data.last_seen).getTime();
    if (Date.now() - seen < ONLINE_MS) return `<p class="glr-presence is-online"><i aria-hidden="true"></i>${escapeHtml(tr("pOnline"))}</p>`;
    let time = "";
    try { time = new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(seen)); } catch {}
    return `<p class="glr-presence"><i aria-hidden="true"></i>${escapeHtml(tr("pSeen", { time }))}</p>`;
  }
  function sinceText(data) {
    if (!data.since) return "";
    try { return tr("pSince", { date: new Intl.DateTimeFormat(locale(), { dateStyle: "long" }).format(new Date(data.since)) }); } catch { return ""; }
  }
  // Подарки, которые человеку дарили друзья: картинка из магазина и сколько раз.
  function giftsWall(data) {
    const items = data.gifts?.items || [];
    const shop = window.GlowLetterShop;
    return `<section class="glr-card glr-gifts"><h4>${escapeHtml(tr("gifts"))}<b>${number(data.gifts?.total)}</b></h4>
      ${items.length ? `<ul>${items.map(gift => `<li><span class="glr-gift-art" aria-hidden="true">${shop?.art?.(gift.item) || ""}</span><small>${escapeHtml(shop?.text?.(gift.item) || "")}</small>${gift.n > 1 ? `<b>×${number(gift.n)}</b>` : ""}</li>`).join("")}</ul>` : `<p class="glr-empty">${escapeHtml(tr("noGifts"))}</p>`}
    </section>`;
  }
  function personActions(data) {
    if (data.me || data.relation !== "friend") return "";
    return `<div class="glr-person-actions">
      <button class="glr-person-btn" type="button" data-glr-action="write">${ICON.pencil}<span>${escapeHtml(tr("write"))}</span></button>
      <button class="glr-person-btn" type="button" data-glr-action="call">${ICON.phone}<span>${escapeHtml(tr("call"))}</span></button>
    </div>`;
  }

  function renderProfile() {
    const profile = state.profile;
    const data = profile.data;
    if (!data) return `${header(tr("profileOf"))}${profile.loading ? `<div class="glr-loading"><span></span><span></span><span></span></div>` : `<p class="glr-empty">${escapeHtml(profile.error || "")}</p>`}`;
    const lvl = levelOf(data.total_points);
    const id = league(data.season_points);
    const counts = data.counts || {};
    const tab = state.profileTab;
    const edit = data.me && state.editName;
    return `${header(data.me ? tr("profile") : tr("profileOf"), false, data.me ? `<button class="glr-icon is-gear" type="button" data-glr-action="info" aria-label="${escapeHtml(tr("info"))}">${ICON.gear}</button>` : window.GlowLetterGuard ? `<button class="glr-icon is-report" type="button" data-glr-action="report" aria-label="${escapeHtml(window.GlowLetterGuard.label("report"))}">${ICON.flag}</button>` : "")}
      <section class="glr-card glr-hero">
        <span class="glr-hero-moon" aria-hidden="true"></span>
        ${avatar({ user_id: data.user_id, name: data.name }, "hero")}
        <div>
          ${edit ? `<form class="glr-name-form" data-glr-form="name"><input name="name" type="text" dir="auto" maxlength="36" autocomplete="name" value="${escapeHtml(data.name || "")}" aria-label="${escapeHtml(tr("editName"))}" required><button class="glr-icon is-save" type="submit" aria-label="${escapeHtml(tr("save"))}">${ICON.tick}</button></form>`
            : `<h3><span>${escapeHtml(data.name || tr("you"))}</span>${data.vip ? `<em class="glr-vip">VIP</em>` : ""}${data.me ? `<button class="glr-edit" type="button" data-glr-action="edit-name" aria-label="${escapeHtml(tr("editName"))}">${ICON.pencil}</button>` : ""}</h3>`}
          ${presence(data)}
          <p class="glr-hero-league is-${id}">${LEAGUE_ICON(id)}${escapeHtml(tr(`league_${id}`))}</p>
          <p class="glr-level"><span>${escapeHtml(tr("level", { n: lvl.level }))}</span><span>${number(lvl.have)} / ${number(lvl.need)} XP</span></p>
          <span class="glr-bar"><i style="width:${Math.round(lvl.have / lvl.need * 100)}%"></i></span>
          ${sinceText(data) ? `<p class="glr-since">${escapeHtml(sinceText(data))}</p>` : ""}
        </div>
      </section>
      ${personActions(data)}
      <div class="glr-subtabs${isAdmin() ? " has-admin" : ""}" role="tablist">
        ${[["stats", ICON.chart, "tabStats"], ["medals", ICON.cup, "tabMedals"], ["titles", ICON.star, "tabTitles"], ...(isAdmin() ? [["admin", ICON.gear, "tabAdmin"]] : [])].map(([key, icon, label]) => `<button type="button" role="tab" aria-selected="${tab === key}" data-glr-action="ptab" data-tab="${key}">${icon}<span>${escapeHtml(tr(label))}</span></button>`).join("")}
      </div>
      ${tab === "admin" && isAdmin() ? renderAdminTab(data)
      : tab === "stats" ? `<section class="glr-card glr-stats">
          ${[["statSeason", `${number(data.season_points)} XP`], ["statPlace", data.season_place ? `#${data.season_place}` : "—"], ["statTotal", `${number(data.total_points)} XP`], ["statGames", number(data.games?.played)], ["statWins", number(data.games?.win)], ["statFriends", number(data.friends)],
             ["statCards", number(data.cards?.games)], ["statCardWins", number(data.cards?.wins)], ["statStreak", number(data.cards?.best_streak)], ["statGifts", number(data.gifts?.total)]]
            .map(([key, value]) => `<p><small>${escapeHtml(tr(key))}</small><b>${escapeHtml(value)}</b></p>`).join("")}
        </section>
        ${giftsWall(data)}`
      : tab === "titles" ? `<section class="glr-card glr-titles">
          ${["newbie", "player", "master", "champion", "legend"].map((key, index, list) => { const on = index <= list.indexOf(data.title); return `<p class="${on ? "is-on" : ""}"><span class="glr-title is-${key}">${escapeHtml(tr(`title_${key}`))}</span><small>${on ? "✓" : "🔒"}</small></p>`; }).join("")}
          <p class="glr-titles-note">${escapeHtml(tr("info4"))}</p>
        </section>`
      : `<section class="glr-card glr-medals">
          <h4>${CROWN("gold")}${escapeHtml(tr(data.me ? "myMedals" : "medals"))}</h4>
          <div class="glr-medal-row">
            ${[["gold", 1], ["silver", 2], ["bronze", 3]].map(([tone, place]) => `<p>${ROSETTE(counts[tone] || 0, tone)}<b class="is-${tone}">${number(counts[tone])}</b><small>${escapeHtml(tr(tone))}</small></p>`).join("")}
          </div>
        </section>
        <h4 class="glr-history-title">${CROWN("gold")}${escapeHtml(tr("history"))}</h4>
        ${(data.medals || []).length ? `<ol class="glr-history">${data.medals.map(medal => `<li class="is-${TONE[medal.place]}">${ROSETTE(medal.place, TONE[medal.place])}<span><b>${CROWN(TONE[medal.place])}${escapeHtml(tr("season", { n: medal.season }))}</b><small>${escapeHtml(range(medal.starts_at, medal.ends_at))}</small></span><span class="glr-history-xp"><b>${number(medal.points)} XP</b><small>${ICON.calendar}${escapeHtml(day(medal.ends_at, -1))}</small></span>${ICON.chevron}</li>`).join("")}</ol>`
          : `<p class="glr-empty">${escapeHtml(tr("noMedals"))}</p>`}`}`;
  }

  const locale = () => language() === "ind" ? "id" : language();
  function day(value, shift = 0) { try { const date = new Date(new Date(value).getTime() + shift * 86400000); return new Intl.DateTimeFormat(locale(), { day: "2-digit", month: "2-digit", year: "numeric" }).format(date); } catch { return ""; } }
  function range(start, end) {
    try {
      const a = new Date(start), b = new Date(new Date(end).getTime() - 86400000);
      const format = new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short", year: "numeric" });
      return format.formatRange ? format.formatRange(a, b) : `${format.format(a)} – ${format.format(b)}`;
    } catch { return ""; }
  }

  // ——— События ———

  async function onClick(event) {
    const target = event.target.closest("[data-glr-action]");
    if (!target) return;
    const action = target.dataset.glrAction;
    if (action === "back") back();
    else if (action === "info") { state.info = true; render(); }
    else if (action === "scope") { if (state.scope !== target.dataset.scope) { state.scope = target.dataset.scope; state.data = null; await load(); } }
    else if (action === "profile") openProfile(target.dataset.user);
    else if (action === "report") window.GlowLetterGuard?.report?.(state.profile?.userId);
    else if (action === "ptab") { state.profileTab = target.dataset.tab; render(); if (state.profileTab === "admin") loadAdminCard(); }
    else if (action === "write") { const id = state.profile?.userId; close(); window.GlowLetterFriends?.chat?.(id); }
    else if (action === "call") { const data = state.profile?.data; close(); if (data) window.GlowLetterCall?.start?.({ user_id: data.user_id, name: data.name }); }
    else if (action === "padmin") adminAct(target);
    else if (action === "invite") { close(); window.GlowLetterFriends?.open?.(); }
    else if (action === "edit-name") { state.editName = true; render(); state.root.querySelector(".glr-name-form input")?.focus(); }
  }

  async function onSubmit(event) {
    if (event.target.dataset.glrForm !== "name") return;
    event.preventDefault();
    const name = event.target.elements.name.value.replace(/\s+/g, " ").trim().slice(0, 36);
    if (!name) return;
    try { await rpc("glowletter_friends_set_name", { p_name: name }); }
    catch { notify(tr("failed")); return; }
    state.editName = false;
    if (state.profile?.data) state.profile.data.name = name;
    if (state.data?.mine) state.data.mine.name = name;
    render();
  }

  async function onChange(event) {
    if (event.target.dataset.glrChange !== "public") return;
    const on = event.target.checked;
    try { await rpc("glowletter_ranking_visibility", { p_public: on }); if (state.data) state.data.public = on; }
    catch { event.target.checked = !on; notify(tr("failed")); }
  }

  // ——— Уведомления о месте среди друзей ———

  function watchFriendsPlace(data) {
    const mine = (data?.top || []).find(item => item.me);
    if (!mine) return;
    let before = null;
    try { before = JSON.parse(localStorage.getItem(RANK_KEY) || "null"); } catch {}
    const order = (data.top || []).map(item => item.user_id);
    try { localStorage.setItem(RANK_KEY, JSON.stringify({ season: data.season, place: mine.place, order })); } catch {}
    if (!before || before.season !== data.season || before.place === mine.place) return;
    if (mine.place > before.place) {
      const passer = (data.top || []).find(item => !item.me && item.place < mine.place && before.order.indexOf(item.user_id) > before.order.indexOf(me()));
      notify(tr("rankDown", { place: mine.place, name: passer?.name || "" }).replace(/\s+!/, "!"), 6000);
    } else if (mine.place <= 3) notify(tr("rankUp", { place: mine.place }), 4200);
  }

  async function checkFriendsPlace() {
    if (!signedIn()) return;
    try { watchFriendsPlace(await rpc("glowletter_season_ranking", { p_scope: "friends" })); } catch {}
  }

  // ——— Церемония вручения медали ———

  async function checkMedals() {
    if (!signedIn()) return;
    let medals = [];
    try { medals = await rpc("glowletter_medals_unseen"); } catch { return; }
    if (!Array.isArray(medals) || !medals.length) return;
    const medal = medals[medals.length - 1];
    if (!document.querySelector(".glr-defs")) document.body.insertAdjacentHTML("beforeend", DEFS);
    const tone = TONE[medal.place];
    const layer = document.createElement("div");
    layer.className = `glr-ceremony is-${tone}`;
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.innerHTML = `<div class="glr-rays" aria-hidden="true"></div>
      <div class="glr-ceremony-card">
        <p class="glr-ceremony-season">${escapeHtml(tr("ceremonyTitle", { n: medal.season }))}</p>
        ${MEDAL(medal.place, tone, true)}
        <h2>${escapeHtml(tr(`place${medal.place}`))}</h2>
        <p class="glr-ceremony-xp">${number(medal.points)} XP</p>
        <button type="button" class="glr-take">${escapeHtml(tr("ceremonyTake"))}</button>
      </div>`;
    document.body.append(layer);
    requestAnimationFrame(() => layer.classList.add("is-open"));
    const online = window.GlowLetterOnline;
    setTimeout(() => { online?.burst?.("🎉"); online?.burst?.(medal.place === 1 ? "🏆" : "✨", { small: true }); }, 350);
    try { navigator.vibrate?.([30, 60, 30]); } catch {}
    layer.querySelector(".glr-take").addEventListener("click", async () => {
      layer.classList.remove("is-open");
      setTimeout(() => layer.remove(), 300);
      try { await rpc("glowletter_medals_seen"); } catch {}
      open({ profile: true });
    }, { once: true });
    layer.querySelector(".glr-take").focus({ preventScroll: true });
  }

  // ——— «В комнату зашёл ADMIN»: один раз на комнату, 1 секунда; правду проверяет сервер ———

  async function announceAdmin(userId, name, room) {
    const key = `${room}:${userId}`;
    if (!userId || !room || state.seenAdmin.has(key)) return;
    state.seenAdmin.add(key);
    let real = false;
    try { real = await rpc("glowletter_is_admin_user", { p_user: userId }); } catch {}
    if (!real) return;
    const node = document.createElement("div");
    node.className = "glr-admin";
    node.setAttribute("role", "status");
    node.innerHTML = `<span class="glr-admin-glow" aria-hidden="true"></span><small>${escapeHtml(tr("adminJoined"))}</small><b>ADMIN</b>${name ? `<em>${escapeHtml(name)}</em>` : ""}`;
    document.body.append(node);
    setTimeout(() => node.remove(), 1600);
  }

  // ——— Админ-вкладка «Игры»: проверить игрока, сбросить опыт сезона, открыть всё ———

  const ADMIN_TEXT = {
    find: "Найти игрока", placeholder: "Код друга, GL-ID или e-mail", search: "Найти", notFound: "Игрок не найден", error: "Не получилось",
    season: "Сезон #{n}", seasonPoints: "Опыт сезона", place: "Место", total: "Весь опыт", today: "За 24 часа", games: "Игры", friends: "Друзья",
    sources: "Откуда опыт", game: "игры", streak: "огонёк", pet: "Тёпа", word: "слово дня", resets: "Сбросы", medals: "Медали", unlocked: "Открыто админом",
    reset: "Сбросить опыт сезона", resetReason: "Причина (видна только админам)", resetConfirm: "Сбросить опыт сезона у {name}? Медали прошлых сезонов останутся.", resetDone: "Опыт сезона сброшен",
    unlock: "Открыть всё (наклейки, рамки, наряды Тёпы)", unlockDone: "Открыто: {n}", owner: "Аккаунт владельца: сбросы и выдачи к нему не применяются", suspicious: "Подозрительно много опыта за сутки"
  };
  const at = (key, values = {}) => ADMIN_TEXT[key].replace(/\{(\w+)\}/g, (all, name) => values[name] ?? "");

  function renderAdmin(container) {
    if (!container || !cloud()?.getState?.().isAdmin) return;
    state.admin = { container, player: null, busy: false, status: "" };
    paintAdmin();
    if (!container.dataset.glrBound) {
      container.dataset.glrBound = "1";
      container.addEventListener("submit", event => { if (event.target.matches(".glr-admin-find")) { event.preventDefault(); adminFind(event.target.elements.q.value); } });
      container.addEventListener("click", event => {
        const button = event.target.closest("[data-glr-admin]");
        if (!button) return;
        const kind = button.dataset.glrAdmin;
        if (kind === "reset") adminReset();
        else if (kind === "unlock") adminUnlock(state.admin.player?.user_id);
        else if (kind === "profile") { open({ profile: state.admin.player?.user_id }); }
      });
    }
  }

  function paintAdmin() {
    const admin = state.admin;
    if (!admin) return;
    const p = admin.player;
    const sources = p?.by_source || {};
    admin.container.innerHTML = `<form class="glr-admin-find admin-lookup-form"><label><span>${at("find")}</span><span class="admin-lookup-row"><input name="q" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="96" placeholder="${at("placeholder")}" required><button type="submit"${admin.busy ? " disabled" : ""}>${at("search")}</button></span></label></form>
      <p class="admin-status" role="status">${escapeHtml(admin.status)}</p>
      ${p ? `<article class="glr-admin-card">
        <header>${avatar({ user_id: p.user_id, name: p.name }, "md")}<div><b>${escapeHtml(p.name || "—")}</b><small>${escapeHtml(p.friend_code || "")} · ${escapeHtml(p.support_id || "")}</small><small>${escapeHtml(p.email || "")}</small></div><button type="button" class="glr-admin-link" data-glr-admin="profile">🏅</button></header>
        ${p.today_points >= 400 ? `<p class="glr-admin-warn">⚠️ ${at("suspicious")}: ${number(p.today_points)} XP</p>` : ""}
        <dl>
          <div><dt>${at("season", { n: p.season })} · ${at("seasonPoints")}</dt><dd>${number(p.season_points)} XP</dd></div>
          <div><dt>${at("place")}</dt><dd>${p.season_place ? `#${p.season_place}` : "—"}</dd></div>
          <div><dt>${at("total")}</dt><dd>${number(p.total_points)} XP</dd></div>
          <div><dt>${at("today")}</dt><dd>${number(p.today_points)} XP</dd></div>
          <div><dt>${at("games")}</dt><dd>${number(p.games?.played)} · ${number(p.games?.win)}🏆 · ${number(p.games?.partners)}👥</dd></div>
          <div><dt>${at("friends")}</dt><dd>${number(p.friends)}</dd></div>
          <div><dt>${at("sources")}</dt><dd>${["game", "streak", "pet", "word"].map(key => `${at(key)} ${number(sources[key])}`).join(" · ")}</dd></div>
          <div><dt>${at("medals")}</dt><dd>🥇${number(p.counts?.gold)} 🥈${number(p.counts?.silver)} 🥉${number(p.counts?.bronze)}</dd></div>
          <div><dt>${at("unlocked")}</dt><dd>${number(p.unlocked)}</dd></div>
        </dl>
        ${(p.resets || []).length ? `<p class="glr-admin-resets"><b>${at("resets")}:</b> ${p.resets.map(item => `${at("season", { n: item.season })} — ${number(item.points_before)} XP${item.reason ? ` (${escapeHtml(item.reason)})` : ""}`).join("; ")}</p>` : ""}
        ${p.is_admin ? `<p class="glr-admin-owner">👑 ${at("owner")}</p>` : `<label class="glr-admin-reason"><span>${at("resetReason")}</span><input type="text" maxlength="200" data-glr-reason></label>
        <div class="glr-admin-actions">
          <button class="glr-admin-btn is-danger" type="button" data-glr-admin="reset"${admin.busy ? " disabled" : ""}>↺ ${at("reset")}</button>
          <button class="glr-admin-btn" type="button" data-glr-admin="unlock"${admin.busy ? " disabled" : ""}>🔓 ${at("unlock")}</button>
        </div>`}
      </article>` : ""}`;
  }

  async function adminFind(query) {
    const admin = state.admin;
    admin.busy = true; admin.status = "…"; paintAdmin();
    try {
      admin.player = await rpc("glowletter_admin_player", { p_query: String(query || "").trim() });
      admin.status = admin.player ? "" : at("notFound");
    } catch { admin.status = at("error"); }
    admin.busy = false; paintAdmin();
  }

  async function adminReset() {
    const admin = state.admin;
    const player = admin?.player;
    if (!player || !window.confirm(at("resetConfirm", { name: player.name || player.friend_code || "" }))) return;
    const reason = admin.container.querySelector("[data-glr-reason]")?.value || "";
    admin.busy = true; paintAdmin();
    try { await rpc("glowletter_admin_reset_season", { p_user: player.user_id, p_reason: reason }); admin.status = at("resetDone"); admin.player = await rpc("glowletter_admin_player", { p_query: player.user_id }); }
    catch { admin.status = at("error"); }
    admin.busy = false; paintAdmin();
  }

  async function adminUnlock(userId) {
    const admin = state.admin;
    if (!userId) return;
    admin.busy = true; paintAdmin();
    try {
      const added = await rpc("glowletter_admin_unlock_all", { p_user: userId });
      admin.status = at("unlockDone", { n: added });
      if (admin.player?.user_id === userId) admin.player = await rpc("glowletter_admin_player", { p_query: userId });
      if (userId === me()) window.GlowLetterWorld?.loadOwned?.(true);
    } catch { admin.status = at("error"); }
    admin.busy = false; paintAdmin();
  }

  // ——— Профиль глазами админа: светлячки, доллары, VIP, вещи (владелец 31.10: «давать им монеты, вип, всё что хочу») ———
  // Тексты только по-русски: вкладку видит один владелец. Права проверяет сервер (glowletter_require_admin).

  const PA = {
    wallet: "Кошелёк", coins: "Светлячки", dollars: "Игровые доллары", access: "Доступ", free: "Бесплатный", forever: "Навсегда", vipTill: "VIP до {d}", paid: "Подписка Google Play",
    give: "Дать", take: "Забрать", amount: "Сколько", vip: "VIP-доступ", days: "{n} дн.", year: "1 год", foreverBtn: "Навсегда", revoke: "Забрать VIP",
    items: "Вещи из магазина", item: "Вещь", qty: "Шт.", has: "Есть: {list}", none: "Ничего нет", unlock: "Открыть всё (наклейки, рамки, наряды Тёпы)",
    ids: "ID: {id} · код друга: {code}", banned: "Заблокирован", done: "Готово", fail: "Не получилось: {e}", sure: "{what} — {name}?", ownerNote: "Это аккаунт администратора: VIP ему выдавать не нужно",
    loading: "Загрузка…", guard: "Блок, предупреждение, модерация — в админ-панели"
  };
  const pa = (key, values = {}) => PA[key].replace(/\{(\w+)\}/g, (all, name) => values[name] ?? "");
  const SHOP_ITEMS = ["rose", "tulips", "sunflower", "lily", "bouquet", "bear", "big_bear", "bear_rose", "heart_box", "candy", "cake", "cupcake", "back_khokhloma", "back_gzhel", "back_gold", "cloth_burgundy", "cloth_wood", "cloth_night", "boost_x2", "shield", "insurance"];

  async function loadAdminCard() {
    const userId = state.profile?.userId;
    if (!userId || !isAdmin()) return;
    try { state.adminCard = await rpc("glowletter_admin_profile", { p_user: userId }); }
    catch (error) { state.adminCard = { error: String(error?.message || error) }; }
    if (state.profile?.userId === userId) render();
  }

  function renderAdminTab(data) {
    const c = state.adminCard;
    if (!c) return `<section class="glr-card glr-padmin"><p class="glr-empty">${pa("loading")}</p></section>`;
    if (c.error) return `<section class="glr-card glr-padmin"><p class="glr-empty">${escapeHtml(pa("fail", { e: c.error }))}</p></section>`;
    const access = c.premium_forever ? pa("forever") : c.vip_until && new Date(c.vip_until) > new Date() ? pa("vipTill", { d: day(c.vip_until) }) : c.paid ? pa("paid") : pa("free");
    const shop = window.GlowLetterShop;
    const owned = Object.entries(c.inventory || {}).map(([id, qty]) => `${shop?.text?.(id) || id} ×${number(qty)}`).join(", ");
    const money = (kind, label, value) => `<div class="glr-pa-row"><p><small>${label}</small><b>${number(value)}</b></p>
        <input type="number" inputmode="numeric" min="1" step="1" value="${kind === "coins" ? 100 : 1000}" data-pa="${kind}" aria-label="${pa("amount")}">
        <button type="button" class="glr-pa-btn" data-glr-action="padmin" data-do="${kind}" data-sign="1">${pa("give")}</button>
        <button type="button" class="glr-pa-btn is-soft" data-glr-action="padmin" data-do="${kind}" data-sign="-1">${pa("take")}</button></div>`;
    return `<section class="glr-card glr-padmin">
        <p class="glr-pa-ids">${escapeHtml(pa("ids", { id: c.support_id || "—", code: c.friend_code || "—" }))}${c.email ? `<br>${escapeHtml(c.email)}` : ""}${c.banned ? ` · <b class="is-bad">${pa("banned")}</b>` : ""}</p>
        <h4>${pa("wallet")}</h4>
        ${money("coins", pa("coins"), c.coins)}
        ${money("dollars", pa("dollars"), c.dollars)}
        <h4>${pa("vip")} · <span class="glr-pa-access">${escapeHtml(access)}</span></h4>
        ${c.is_admin ? `<p class="glr-empty">${pa("ownerNote")}</p>` : `<div class="glr-pa-grid">
          ${[7, 30, 90, 365].map(n => `<button type="button" class="glr-pa-btn" data-glr-action="padmin" data-do="vip" data-days="${n}">${n === 365 ? pa("year") : pa("days", { n })}</button>`).join("")}
          <button type="button" class="glr-pa-btn is-gold" data-glr-action="padmin" data-do="forever">${pa("foreverBtn")}</button>
          <button type="button" class="glr-pa-btn is-soft" data-glr-action="padmin" data-do="revoke">${pa("revoke")}</button>
        </div>`}
        <h4>${pa("items")}</h4>
        <div class="glr-pa-row is-items">
          <select data-pa="item" aria-label="${pa("item")}">${SHOP_ITEMS.map(id => `<option value="${id}">${escapeHtml(shop?.text?.(id) || id)}</option>`).join("")}</select>
          <input type="number" inputmode="numeric" min="1" max="100" step="1" value="1" data-pa="qty" aria-label="${pa("qty")}">
          <button type="button" class="glr-pa-btn" data-glr-action="padmin" data-do="item" data-sign="1">${pa("give")}</button>
          <button type="button" class="glr-pa-btn is-soft" data-glr-action="padmin" data-do="item" data-sign="-1">${pa("take")}</button>
        </div>
        <p class="glr-pa-note">${escapeHtml(owned ? pa("has", { list: owned }) : pa("none"))}</p>
        <button type="button" class="glr-pa-btn is-wide" data-glr-action="padmin" data-do="unlock">${pa("unlock")}</button>
        <p class="glr-pa-note">${pa("guard")}</p>
      </section>`;
  }

  async function adminAct(button) {
    const c = state.adminCard;
    const data = state.profile?.data;
    if (!c || !data || state.adminBusy) return;
    const what = button.dataset.do;
    const field = name => state.root.querySelector(`[data-pa="${name}"]`);
    const sign = Number(button.dataset.sign) || 1;
    const amount = Math.round(Math.abs(Number(field(what)?.value) || 0)) * sign;
    const name = data.name || c.friend_code || "";
    let call = null, label = button.textContent.trim();
    if (what === "coins" || what === "dollars") {
      if (!amount) return;
      label = `${sign > 0 ? pa("give") : pa("take")} ${number(Math.abs(amount))} — ${what === "coins" ? pa("coins") : pa("dollars")}`;
      call = () => rpc(what === "coins" ? "glowletter_admin_coins" : "glowletter_admin_dollars", { p_user: c.user_id, p_delta: amount, p_reason: "profile" });
    } else if (what === "item") {
      const qty = Math.min(100, Math.round(Math.abs(Number(field("qty")?.value) || 0))) * sign;
      const item = field("item")?.value;
      if (!qty || !item) return;
      label = `${sign > 0 ? pa("give") : pa("take")}: ${window.GlowLetterShop?.text?.(item) || item} ×${Math.abs(qty)}`;
      call = () => rpc("glowletter_admin_give_item", { p_user: c.user_id, p_item: item, p_qty: qty });
    } else if (what === "vip") call = () => rpc("glowletter_admin_grant_vip", { p_support_id: c.support_id, p_days: Number(button.dataset.days) });
    else if (what === "forever") call = () => rpc("glowletter_admin_grant_forever", { p_support_id: c.support_id, p_reason: "gift", p_message: null });
    else if (what === "revoke") call = () => rpc("glowletter_admin_revoke_vip", { p_support_id: c.support_id });
    else if (what === "unlock") call = () => rpc("glowletter_admin_unlock_all", { p_user: c.user_id });
    if (!call || !window.confirm(pa("sure", { what: label, name }))) return;
    state.adminBusy = true;
    try {
      await call();
      notify(`${pa("done")}: ${label}`);
      if (c.user_id === me()) { window.GlowLetterShop?.refresh?.(); window.GlowLetterWorld?.loadOwned?.(true); }
    } catch (error) { notify(pa("fail", { e: String(error?.message || error) })); }
    state.adminBusy = false;
    await loadAdminCard();
    try { state.profile = { userId: data.user_id, data: await rpc("glowletter_medal_wall", { p_user: data.user_id }) }; render(); } catch {}
  }

  // ——— Запуск ———

  function start() {
    if (!signedIn()) return;
    setTimeout(() => { checkMedals(); checkFriendsPlace(); }, 2500);
  }
  addEventListener("glowletter-cloud-session", event => { if (event.detail?.signedIn) start(); });
  addEventListener("glowletter-language-changed", () => setTimeout(render, 0));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && signedIn() && Date.now() - (state.lastCheck || 0) > 600000) { state.lastCheck = Date.now(); checkFriendsPlace(); } });
  if (signedIn()) start();

  window.GlowLetterRanking = Object.freeze({
    open: options => open(options || {}),
    close,
    isOpen: () => Boolean(state.root && !state.root.hidden),
    profile: (userId, options) => open({ profile: userId || true, only: Boolean(options?.only) }),
    checkMedals,
    announceAdmin,
    renderAdmin,
    text: (key, values) => tr(key, values),
    league,
    levelOf
  });
})();
