/*
  «Мы вдвоём» (2.4.24): вопрос дня и общий мишка Тёпа.

  Человек выбирает одного из друзей. Каждый день у всех один и тот же вопрос
  (dq001–dq120 по кругу, номер даёт сервер). Свой ответ пишется один раз, ответ
  друга виден только после своего. Тёпа растёт от числа дней, когда ответили
  оба, и за них открывает наряды. Первые три наряда бесплатно; остальные и
  архив прошлых ответов — с полным доступом. Вопросы на всех языках и тексты
  на остальных языках — в couple-i18n.js.
*/
(() => {
  "use strict";

  if (window.GlowLetterCouple) return;

  const PARTNER_KEY = "glowletter-couple-partner";
  const OUTFIT_KEY = "glowletter-couple-outfit";
  const FREE_OUTFITS = 3;
  // Наряды Тёпы: картинка из «Что мы любим» и сколько дней вместе нужно.
  const OUTFITS = Object.freeze([
    { id: "o01", picture: "s36a", days: 0 },
    { id: "o02", picture: "s28d", days: 1 },
    { id: "o03", picture: "s24b", days: 3 },
    { id: "o04", picture: "s05c", days: 5 },
    { id: "o05", picture: "s38b", days: 7 },
    { id: "o06", picture: "s23d", days: 10 },
    { id: "o07", picture: "s25a", days: 14 },
    { id: "o08", picture: "s30b", days: 21 },
    { id: "o09", picture: "s34d", days: 30 },
    { id: "o10", picture: "s42c", days: 45 },
    { id: "o11", picture: "s27c", days: 60 },
    { id: "o12", picture: "s10d", days: 100 }
  ]);
  const icon = id => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

  const TEXT = {
    ru: {
      home: "Мы вдвоём", noName: "Друг", eyebrow: "GLOWLETTER · МЫ ВДВОЁМ", title: "Мы вдвоём", close: "Закрыть", back: "Назад",
      signIn: "Войдите, чтобы каждый день отвечать на вопрос вместе с близким человеком.", signInButton: "Войти",
      noFriends: "Сначала добавьте близкого человека в друзья — по коду дружбы.", openFriends: "Открыть «Друзья»",
      pickTitle: "С кем отвечаем на вопросы?", pickNote: "Выберите друга. Вопрос дня и мишка Тёпа будут общими для вас двоих.", changePartner: "Сменить друга",
      questionTitle: "Вопрос дня", answerPlaceholder: "Ваш ответ…", answerSend: "Ответить", answerNote: "Ответ можно написать один раз. Ответ друга откроется после вашего.",
      yourAnswer: "Ваш ответ", theirAnswer: "Ответ: {name}", waitingThem: "{name} ещё не ответил(а). Ответ появится здесь.", theirsHidden: "{name} уже ответил(а)! Напишите свой ответ, чтобы увидеть.",
      together: "Дней вместе: {n}", streak: "Дней подряд: {n}",
      petTitle: "Мишка Тёпа", moodBoth: "Тёпа счастлив: сегодня вы оба ответили!", moodMine: "Тёпа ждёт, что ответит {name}", moodTheirs: "Тёпа ждёт вашего ответа", moodNone: "Тёпа проснулся и ждёт вопрос дня",
      wardrobe: "Гардероб Тёпы", wardrobeNote: "Каждый день, когда вы оба отвечаете, Тёпа растёт и получает новые наряды.", daysLeft: "Ещё дней: {n}", wear: "Надеть", wearing: "Надето", premiumLock: "Полный доступ",
      o01: "Малыш", o02: "Писатель", o03: "Уютный свитер", o04: "Повар", o05: "Зимняя шапка", o06: "Дождевик", o07: "Путешественник", o08: "Лесная шляпа", o09: "Лыжник", o10: "Мореход", o11: "Воздухоплаватель", o12: "Капитан",
      history: "Архив ответов", historyNote: "Все ваши прошлые ответы друг другу.", historyOpen: "Открыть архив", historyEmpty: "Пока нет прошлых дней, где ответили оба.", more: "Показать ещё", book: "Скачать книгу ответов (PDF)", bookMaking: "Собираю книгу…", bookNote: "Красивая книга с Тёпой на обложке и всеми вашими ответами — можно распечатать или подарить.", bookTitle: "Книга наших ответов", bookSubtitle: "Вы и {name}", bookFile: "glowletter-kniga-otvetov",
      myBear: "Ваш Тёпа", theirBear: "Тёпа · {name}", bearNote: "Ваш Тёпа — как вы: выберите наряд, и {name} увидит его рядом со своим.", locked: "Этот наряд ещё не открыт.",
      story: "Наша история", storyNote: "Ваши общие даты: дружба, первые письма и дни, когда вы отвечали вместе.", storyOpen: "Открыть нашу историю", storyFriends: "Вы стали друзьями", storyFirstSent: "Вы впервые написали: {name}", storyFirstReceived: "{name} впервые написал(а) вам", storyFirstDay: "Первый вопрос дня, на который вы ответили оба", storyOutfit: "Тёпа получил наряд «{outfit}»", storyNow: "Сегодня", storyLetters: "Писем друг другу: {n}", storyBest: "Самая длинная серия: {n}", storyEmpty: "История только начинается — ответьте сегодня на вопрос дня вместе.",
      readerTitle: "Тёпа читает письмо", readerStop: "Стоп", readerVideo: "Сохранить видео", readerVideoMaking: "Записываю видео… {n} с", readerVideoNote: "Видео с Тёпой и текстом письма. Если к письму прикреплено ваше аудио, оно тоже будет в видео.", readerVideoFile: "glowletter-tepa-chitaet", readerVideoFailed: "На этом устройстве не получилось записать видео.", readerFor: "Для: {name}", readerFrom: "С теплом, {name}",
      premiumNote: "Архив ответов и все наряды Тёпы — с полным доступом.", saved: "Ответ сохранён",
      forbidden: "В ответе есть недопустимые слова или ссылки.", failed: "Не получилось. Проверьте связь и попробуйте ещё раз.", notFriends: "Вы больше не друзья с этим человеком."
    },
    en: {
      home: "Just us two", noName: "Friend", eyebrow: "GLOWLETTER · JUST US TWO", title: "Just us two", close: "Close", back: "Back",
      signIn: "Sign in to answer a question every day together with someone close.", signInButton: "Sign in",
      noFriends: "First add someone close as a friend — with a friend code.", openFriends: "Open Friends",
      pickTitle: "Who do we answer with?", pickNote: "Choose a friend. The question of the day and Teddy the bear will be shared by you two.", changePartner: "Change friend",
      questionTitle: "Question of the day", answerPlaceholder: "Your answer…", answerSend: "Answer", answerNote: "You can answer once. Your friend’s answer opens after yours.",
      yourAnswer: "Your answer", theirAnswer: "{name}’s answer", waitingThem: "{name} hasn’t answered yet. The answer will appear here.", theirsHidden: "{name} has already answered! Write yours to see it.",
      together: "Days together: {n}", streak: "Days in a row: {n}",
      petTitle: "Teddy the bear", moodBoth: "Teddy is happy: you both answered today!", moodMine: "Teddy is waiting for {name} to answer", moodTheirs: "Teddy is waiting for your answer", moodNone: "Teddy woke up and is waiting for the question of the day",
      wardrobe: "Teddy’s wardrobe", wardrobeNote: "Every day you both answer, Teddy grows and gets new outfits.", daysLeft: "Days to go: {n}", wear: "Wear", wearing: "Wearing", premiumLock: "Full access",
      o01: "Little one", o02: "Writer", o03: "Cosy sweater", o04: "Chef", o05: "Winter hat", o06: "Raincoat", o07: "Traveller", o08: "Forest hat", o09: "Skier", o10: "Sailor", o11: "Balloonist", o12: "Captain",
      history: "Answer archive", historyNote: "All your past answers to each other.", historyOpen: "Open the archive", historyEmpty: "No past days where you both answered yet.", more: "Show more", book: "Download the answer book (PDF)", bookMaking: "Making the book…", bookNote: "A beautiful book with Teddy on the cover and all your answers — print it or give it as a gift.", bookTitle: "The book of our answers", bookSubtitle: "You and {name}", bookFile: "glowletter-answer-book",
      myBear: "Your Teddy", theirBear: "Teddy · {name}", bearNote: "Your Teddy is like you: choose an outfit and {name} will see it next to theirs.", locked: "This outfit isn’t open yet.",
      story: "Our story", storyNote: "Your shared dates: your friendship, first letters and the days you answered together.", storyOpen: "Open our story", storyFriends: "You became friends", storyFirstSent: "Your first letter to {name}", storyFirstReceived: "The first letter from {name}", storyFirstDay: "The first question of the day you both answered", storyOutfit: "Teddy got the “{outfit}” outfit", storyNow: "Today", storyLetters: "Letters to each other: {n}", storyBest: "Longest streak: {n}", storyEmpty: "Your story is just beginning — answer today’s question together.",
      readerTitle: "Teddy reads the letter", readerStop: "Stop", readerVideo: "Save video", readerVideoMaking: "Recording the video… {n} s", readerVideoNote: "A video with Teddy and the letter text. If your own audio is attached to the letter, it will be in the video too.", readerVideoFile: "glowletter-teddy-reads", readerVideoFailed: "The video couldn’t be recorded on this device.", readerFor: "For: {name}", readerFrom: "Warmly, {name}",
      premiumNote: "The answer archive and all of Teddy’s outfits come with full access.", saved: "Answer saved",
      forbidden: "The answer has words or links that aren’t allowed.", failed: "Something went wrong. Check your connection and try again.", notFriends: "You are no longer friends with this person."
    },
    fr: {
      home: "Nous deux", noName: "Ami", eyebrow: "GLOWLETTER · NOUS DEUX", title: "Nous deux", close: "Fermer", back: "Retour",
      signIn: "Connectez-vous pour répondre chaque jour à une question avec un proche.", signInButton: "Se connecter",
      noFriends: "Ajoutez d’abord un proche en ami, avec un code d’ami.", openFriends: "Ouvrir « Amis »",
      pickTitle: "Avec qui répondons-nous ?", pickNote: "Choisissez un ami. La question du jour et Nounours seront partagés entre vous deux.", changePartner: "Changer d’ami",
      questionTitle: "Question du jour", answerPlaceholder: "Votre réponse…", answerSend: "Répondre", answerNote: "On ne répond qu’une fois. La réponse de votre ami s’ouvre après la vôtre.",
      yourAnswer: "Votre réponse", theirAnswer: "Réponse de {name}", waitingThem: "{name} n’a pas encore répondu. La réponse apparaîtra ici.", theirsHidden: "{name} a déjà répondu ! Écrivez votre réponse pour la voir.",
      together: "Jours ensemble : {n}", streak: "Jours d’affilée : {n}",
      petTitle: "Nounours", moodBoth: "Nounours est heureux : vous avez répondu tous les deux aujourd’hui !", moodMine: "Nounours attend la réponse de {name}", moodTheirs: "Nounours attend votre réponse", moodNone: "Nounours s’est réveillé et attend la question du jour",
      wardrobe: "La garde-robe de Nounours", wardrobeNote: "Chaque jour où vous répondez tous les deux, Nounours grandit et reçoit de nouvelles tenues.", daysLeft: "Encore {n} jours", wear: "Mettre", wearing: "Porté", premiumLock: "Accès complet",
      o01: "Petit", o02: "Écrivain", o03: "Pull douillet", o04: "Cuisinier", o05: "Bonnet d’hiver", o06: "Imperméable", o07: "Voyageur", o08: "Chapeau des bois", o09: "Skieur", o10: "Marin", o11: "Aéronaute", o12: "Capitaine",
      history: "Archives des réponses", historyNote: "Toutes vos réponses passées l’un à l’autre.", historyOpen: "Ouvrir les archives", historyEmpty: "Pas encore de jours passés où vous avez répondu tous les deux.", more: "Afficher plus", book: "Télécharger le livre des réponses (PDF)", bookMaking: "Création du livre…", bookNote: "Un beau livre avec Nounours en couverture et toutes vos réponses, à imprimer ou à offrir.", bookTitle: "Le livre de nos réponses", bookSubtitle: "Vous et {name}", bookFile: "glowletter-livre-des-reponses",
      myBear: "Votre Nounours", theirBear: "Nounours · {name}", bearNote: "Votre Nounours vous ressemble : choisissez une tenue et {name} la verra à côté de la sienne.", locked: "Cette tenue n’est pas encore ouverte.",
      story: "Notre histoire", storyNote: "Vos dates communes : votre amitié, les premières lettres et les jours où vous avez répondu ensemble.", storyOpen: "Ouvrir notre histoire", storyFriends: "Vous êtes devenus amis", storyFirstSent: "Votre première lettre à {name}", storyFirstReceived: "La première lettre de {name}", storyFirstDay: "La première question du jour à laquelle vous avez répondu tous les deux", storyOutfit: "Nounours a reçu la tenue « {outfit} »", storyNow: "Aujourd’hui", storyLetters: "Lettres échangées : {n}", storyBest: "Plus longue série : {n}", storyEmpty: "Votre histoire ne fait que commencer : répondez ensemble à la question du jour.",
      readerTitle: "Nounours lit la lettre", readerStop: "Stop", readerVideo: "Enregistrer la vidéo", readerVideoMaking: "Enregistrement de la vidéo… {n} s", readerVideoNote: "Une vidéo avec Nounours et le texte de la lettre. Si votre audio est joint à la lettre, il sera aussi dans la vidéo.", readerVideoFile: "glowletter-nounours-lit", readerVideoFailed: "La vidéo n’a pas pu être enregistrée sur cet appareil.", readerFor: "Pour : {name}", readerFrom: "Avec tendresse, {name}",
      premiumNote: "Les archives et toutes les tenues de Nounours sont incluses dans l’accès complet.", saved: "Réponse enregistrée",
      forbidden: "La réponse contient des mots ou des liens interdits.", failed: "Un problème est survenu. Vérifiez la connexion et réessayez.", notFriends: "Vous n’êtes plus amis avec cette personne."
    }
  };
  const PACKS = window.GLOWLETTER_COUPLE_I18N || {};
  Object.entries(PACKS).forEach(([code, pack]) => { if (!TEXT[code] && pack?.text) TEXT[code] = pack.text; });

  const state = { root: null, view: "loading", friends: [], partner: null, today: null, history: [], historyDone: false, story: null, busy: false, error: "", waiting: [], lastFocus: null };

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const userId = () => cloud()?.getState?.().userId || "";
  const signedIn = () => Boolean(cloud()?.getState?.().signedIn);
  const premium = () => Boolean(app()?.getState?.().premium);
  const friendsApi = () => window.GlowLetterFriends || null;
  const language = () => {
    const current = String(app()?.getState?.().language || localStorage.getItem("nurLanguage") || "ru").toLowerCase();
    return TEXT[current] ? current : "en";
  };
  const tr = (key, values = {}) => String((TEXT[language()] || TEXT.en)[key] ?? TEXT.en[key] ?? key).replace(/\{(\w+)\}/gu, (_, name) => String(values[name] ?? ""));
  const question = id => PACKS[language()]?.questions?.[id] || PACKS.en?.questions?.[id] || "";
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const notify = (message, duration = 3600) => app()?.notify?.(message, duration);
  const storageKey = base => `${base}:${userId()}`;
  const read = key => { try { return localStorage.getItem(key) || ""; } catch { return ""; } };
  const write = (key, value) => { try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key); } catch {} };
  // Местная дата телефона: вопрос меняется в полночь у каждого.
  const today = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  const dateLabel = value => {
    try { return new Intl.DateTimeFormat(language() === "ind" ? "id" : language(), { day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`)); }
    catch { return value; }
  };
  const fullDate = value => {
    try { return new Intl.DateTimeFormat(language() === "ind" ? "id" : language(), { day: "numeric", month: "long", year: "numeric" }).format(new Date(value)); }
    catch { return String(value).slice(0, 10); }
  };
  const friends = () => state.friends;
  const unlocked = outfit => (state.today?.together || 0) >= outfit.days && (premium() || OUTFITS.indexOf(outfit) < FREE_OUTFITS);
  // «Мишка как ты»: свой наряд хранится на сервере, друг видит его рядом со своим.
  const currentOutfit = () => {
    const saved = OUTFITS.find(outfit => outfit.id === (state.today?.my_bear || read(storageKey(`${OUTFIT_KEY}:${state.partner?.user_id}`))));
    if (saved && unlocked(saved)) return saved;
    return [...OUTFITS].reverse().find(unlocked) || OUTFITS[0];
  };
  const partnerOutfit = () => OUTFITS.find(outfit => outfit.id === state.today?.their_bear)
    || [...OUTFITS.slice(0, FREE_OUTFITS)].reverse().find(outfit => (state.today?.together || 0) >= outfit.days) || OUTFITS[0];
  const picture = outfit => `assets/loves/${outfit.picture}.webp`;

  // ——— Окно ———

  function mount() {
    if (state.root) return state.root;
    const root = document.createElement("div");
    root.className = "glg-layer glc-layer";
    root.id = "coupleLayer";
    root.hidden = true;
    root.innerHTML = `
      <button class="glg-backdrop" type="button" data-action="close" tabindex="-1" aria-hidden="true"></button>
      <section class="glg-panel" role="dialog" aria-modal="true" aria-labelledby="glcTitle">
        <header class="glg-header">
          <div><p class="glg-eyebrow" data-glc="eyebrow"></p><h2 id="glcTitle" data-glc="title"></h2></div>
          <button class="glg-close" type="button" data-action="close"><span aria-hidden="true">×</span></button>
        </header>
        <div class="glg-body glc-body" aria-live="polite"></div>
      </section>`;
    root.addEventListener("click", event => {
      const target = event.target.closest("[data-action]");
      if (target && root.contains(target)) onAction(target.dataset.action, target);
    });
    root.addEventListener("submit", event => { event.preventDefault(); onAction(event.target.dataset.submit, event.target); });
    root.addEventListener("keydown", event => { if (event.key === "Escape") { event.stopPropagation(); close(); } });
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
    state.error = "";
    state.view = signedIn() ? "loading" : "signin";
    render();
    if (signedIn()) await refresh();
  }

  function close() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    document.body.classList.remove("glg-open");
    setTimeout(() => { if (!root.classList.contains("is-open")) root.hidden = true; }, 320);
    state.lastFocus?.focus?.({ preventScroll: true });
  }

  function render() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.querySelector("[data-glc=eyebrow]").textContent = tr("eyebrow");
    root.querySelector("[data-glc=title]").textContent = tr("title");
    root.querySelector(".glg-close").setAttribute("aria-label", tr("close"));
    const views = {
      signin: () => `<div class="glg-center"><p class="glg-muted">${escapeHtml(tr("signIn"))}</p><button class="glg-primary" type="button" data-action="signin">${icon("ic-user")} ${escapeHtml(tr("signInButton"))}</button></div>`,
      loading: () => `<p class="glg-center glg-muted">…</p>`,
      nofriends: () => `<div class="glg-center"><img class="glc-bear-small" src="${picture(OUTFITS[0])}" alt="" /><p class="glg-muted">${escapeHtml(tr("noFriends"))}</p><button class="glg-primary" type="button" data-action="friends">${icon("ic-friends")} ${escapeHtml(tr("openFriends"))}</button></div>`,
      pick: renderPick,
      main: renderMain,
      history: renderHistory,
      story: renderStory
    };
    root.querySelector(".glc-body").innerHTML = (views[state.view] || renderMain)();
  }

  function renderPick() {
    const waiting = new Set(state.waiting);
    return `
      <h3>${escapeHtml(tr("pickTitle"))}</h3>
      <p class="glg-muted">${escapeHtml(tr("pickNote"))}</p>
      <ul class="glf-list">${friends().map(friend => `<li><button class="glf-row glf-friend" type="button" data-action="pick" data-id="${escapeHtml(friend.user_id)}"><span class="glf-avatar${friend.online ? " is-online" : ""}">${escapeHtml((friend.name[0] || "♥").toUpperCase())}</span><span class="glf-who"><span class="glf-name">${escapeHtml(friend.name)}</span></span>${waiting.has(friend.user_id) ? `<b class="glg-new">1</b>` : ""}</button></li>`).join("")}</ul>`;
  }

  function renderMain() {
    const day = state.today;
    if (!day) return `<p class="glg-center glg-muted">…</p>`;
    const name = state.partner?.name || "";
    const outfit = currentOutfit();
    const mood = day.mine && day.theirs ? tr("moodBoth") : day.mine ? tr("moodMine", { name }) : day.partner_answered ? tr("moodTheirs") : tr("moodNone");
    const answer = day.mine
      ? `<div class="glc-answer is-mine"><small>${escapeHtml(tr("yourAnswer"))}</small><p dir="auto">${escapeHtml(day.mine)}</p></div>
         ${day.theirs ? `<div class="glc-answer"><small>${escapeHtml(tr("theirAnswer", { name }))}</small><p dir="auto">${escapeHtml(day.theirs)}</p></div>` : `<p class="glg-note">${escapeHtml(tr("waitingThem", { name }))}</p>`}`
      : `${day.partner_answered ? `<p class="glc-hint">${escapeHtml(tr("theirsHidden", { name }))}</p>` : ""}
         <form class="glc-compose" data-submit="answer" novalidate>
           <textarea name="answer" rows="3" maxlength="500" dir="auto" placeholder="${escapeHtml(tr("answerPlaceholder"))}" required></textarea>
           <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
           <button class="glg-primary glg-wide" type="submit"${state.busy ? " disabled" : ""}>${escapeHtml(tr("answerSend"))}</button>
           <p class="glg-note">${escapeHtml(tr("answerNote"))}</p>
         </form>`;
    return `
      <div class="glc-partner"><span>♥ ${escapeHtml(name)}</span>${friends().length > 1 ? `<button class="glg-link" type="button" data-action="change">${escapeHtml(tr("changePartner"))}</button>` : ""}</div>
      <article class="glg-hero glc-pet">
        <div class="glc-bears">
          <figure><img class="glc-bear" src="${picture(outfit)}" alt="${escapeHtml(`${tr("myBear")} — ${tr(outfit.id)}`)}" /><figcaption>${escapeHtml(tr("myBear"))}</figcaption></figure>
          <figure><img class="glc-bear" src="${picture(partnerOutfit())}" alt="${escapeHtml(`${tr("theirBear", { name })} — ${tr(partnerOutfit().id)}`)}" /><figcaption>${escapeHtml(tr("theirBear", { name }))}</figcaption></figure>
        </div>
        <h3>${escapeHtml(tr("petTitle"))}</h3>
        <p>${escapeHtml(mood)}</p>
        <div class="glc-stats"><span>${escapeHtml(tr("together", { n: day.together || 0 }))}</span><span>${escapeHtml(tr("streak", { n: day.streak || 0 }))}</span></div>
      </article>
      <section class="glg-section glc-question">
        <p class="glg-step">${escapeHtml(tr("questionTitle"))} · ${escapeHtml(dateLabel(day.day))}</p>
        <h3 class="glc-question-text" dir="auto">${escapeHtml(question(day.question))}</h3>
        ${answer}
      </section>
      ${renderWardrobe(outfit)}
      <section class="glg-section">
        <h3>${escapeHtml(tr("story"))}</h3>
        <p class="glg-muted">${escapeHtml(tr("storyNote"))}</p>
        <button class="glg-secondary glg-wide" type="button" data-action="story">${escapeHtml(tr("storyOpen"))}</button>
      </section>
      <section class="glg-section">
        <h3>${escapeHtml(tr("history"))}</h3>
        <p class="glg-muted">${escapeHtml(tr("historyNote"))}</p>
        <button class="glg-secondary glg-wide" type="button" data-action="history">${premium() ? "" : "🔒 "}${escapeHtml(tr("historyOpen"))}</button>
      </section>
      ${premium() ? "" : `<p class="glg-note">${escapeHtml(tr("premiumNote"))}</p>`}`;
  }

  function renderWardrobe(current) {
    const together = state.today?.together || 0;
    const cards = OUTFITS.map((outfit, index) => {
      const daysOk = together >= outfit.days;
      const paid = premium() || index < FREE_OUTFITS;
      const status = !daysOk ? tr("daysLeft", { n: outfit.days - together }) : !paid ? `🔒 ${tr("premiumLock")}` : outfit === current ? tr("wearing") : tr("wear");
      const action = daysOk && !paid ? "paywall" : daysOk && outfit !== current ? "wear" : "";
      return `<li><button class="glc-outfit${daysOk && paid ? "" : " is-locked"}${outfit === current ? " is-current" : ""}" type="button"${action ? ` data-action="${action}" data-id="${outfit.id}"` : " disabled"}>
        <img src="${picture(outfit)}" alt="" loading="lazy" />
        <span class="glc-outfit-name">${escapeHtml(tr(outfit.id))}</span>
        <small>${escapeHtml(status)}</small>
      </button></li>`;
    }).join("");
    return `<section class="glg-section"><h3>${escapeHtml(tr("wardrobe"))}</h3><p class="glg-muted">${escapeHtml(tr("wardrobeNote"))} ${escapeHtml(tr("bearNote", { name: state.partner?.name || "" }))}</p><ul class="glc-wardrobe">${cards}</ul></section>`;
  }

  // «Наша история»: общие даты пары от дружбы до сегодня.
  function renderStory() {
    const story = state.story;
    const name = state.partner?.name || "";
    const back = `<button class="glg-link glg-back" type="button" data-action="main">← ${escapeHtml(tr("back"))}</button><h3>${escapeHtml(tr("story"))}</h3>`;
    if (!story) return `${back}<p class="glg-center glg-muted">…</p><p class="glg-error" role="alert">${escapeHtml(state.error)}</p>`;
    const events = [];
    if (story.friends_since) events.push({ at: story.friends_since, title: tr("storyFriends") });
    if (story.first_sent) events.push({ at: story.first_sent, title: tr("storyFirstSent", { name }) });
    if (story.first_received) events.push({ at: story.first_received, title: tr("storyFirstReceived", { name }) });
    for (const milestone of story.milestones || []) {
      const outfit = OUTFITS.find(item => item.days === Number(milestone.n));
      events.push({
        at: `${milestone.day}T12:00:00`,
        title: Number(milestone.n) === 1 ? tr("storyFirstDay") : tr("together", { n: milestone.n }),
        note: outfit ? tr("storyOutfit", { outfit: tr(outfit.id) }) : "",
        outfit
      });
    }
    events.sort((a, b) => new Date(a.at) - new Date(b.at));
    const items = events.map(event => `<li class="glc-event">
        <p class="glg-step">${escapeHtml(fullDate(event.at))}</p>
        <h3 dir="auto">${escapeHtml(event.title)}</h3>
        ${event.note ? `<p class="glg-muted">${escapeHtml(event.note)}</p>` : ""}
        ${event.outfit ? `<img src="${picture(event.outfit)}" alt="" loading="lazy" />` : ""}
      </li>`).join("");
    const together = state.today?.together || 0;
    return `${back}
      ${together ? "" : `<p class="glc-hint">${escapeHtml(tr("storyEmpty"))}</p>`}
      <ol class="glc-story">${items}
        <li class="glc-event is-now">
          <p class="glg-step">${escapeHtml(tr("storyNow"))}</p>
          <div class="glc-stats"><span>${escapeHtml(tr("together", { n: together }))}</span><span>${escapeHtml(tr("storyBest", { n: story.best_streak || 0 }))}</span><span>${escapeHtml(tr("storyLetters", { n: story.letters || 0 }))}</span></div>
        </li>
      </ol>`;
  }

  function renderHistory() {
    const name = state.partner?.name || "";
    const items = state.history.map(row => `<li class="glc-day">
        <p class="glg-step">${escapeHtml(dateLabel(row.day))}</p>
        <h3 dir="auto">${escapeHtml(question(row.question_id))}</h3>
        <div class="glc-answer is-mine"><small>${escapeHtml(tr("yourAnswer"))}</small><p dir="auto">${escapeHtml(row.mine)}</p></div>
        <div class="glc-answer"><small>${escapeHtml(tr("theirAnswer", { name }))}</small><p dir="auto">${escapeHtml(row.theirs)}</p></div>
      </li>`).join("");
    return `
      <button class="glg-link glg-back" type="button" data-action="main">← ${escapeHtml(tr("back"))}</button>
      <h3>${escapeHtml(tr("history"))}</h3>
      ${items ? `<ul class="glc-history">${items}</ul>` : `<p class="glg-muted">${escapeHtml(tr("historyEmpty"))}</p>`}
      ${items && !state.historyDone ? `<button class="glg-secondary glg-wide" type="button" data-action="more"${state.busy ? " disabled" : ""}>${escapeHtml(tr("more"))}</button>` : ""}
      ${items ? `<button class="glg-primary glg-wide" type="button" data-action="book"${state.busy ? " disabled" : ""}>${icon("ic-book")} ${escapeHtml(state.busy === "book" ? tr("bookMaking") : tr("book"))}</button><p class="glg-note">${escapeHtml(tr("bookNote"))}</p>` : ""}
      <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>`;
  }

  // ——— «Книга наших ответов»: обложка с Тёпой и все дни, PDF формата A5 ———

  const BOOK = Object.freeze({ width: 1240, height: 1754, margin: 120, pageWidth: 419.53, pageHeight: 595.28 });

  function loadImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  function wrapLines(context, text, width) {
    const lines = [];
    for (const paragraph of String(text || "").split(/\n+/u)) {
      let line = "";
      for (const word of paragraph.split(/\s+/u).filter(Boolean)) {
        const next = line ? `${line} ${word}` : word;
        if (context.measureText(next).width <= width || !line) line = next;
        else { lines.push(line); line = word; }
      }
      if (line) lines.push(line);
    }
    return lines;
  }

  async function makeBook() {
    const appApi = app();
    if (!appApi?.makePdf || !appApi?.deliverFile) { state.error = tr("failed"); render(); return; }
    state.busy = "book";
    render();
    try {
      while (!state.historyDone && state.history.length < 400) {
        const before = state.history.at(-1)?.day || null;
        const rows = (await rpc("glowletter_couple_history", { p_partner: state.partner.user_id, p_before: before, p_limit: 100 })) || [];
        state.history.push(...rows);
        state.historyDone = rows.length < 100;
      }
      await Promise.all(["600 40px 'Cormorant Garamond'", "700 28px Manrope", "500 30px Manrope"].map(font => document.fonts?.load?.(font).catch(() => null)));
      const rtl = language() === "ar";
      const { width, height, margin } = BOOK;
      const inner = width - margin * 2;
      const pages = [];
      let canvas = null;
      let context = null;
      let y = 0;
      const ink = "#2b2226";
      const accent = "#8c2f39";
      const muted = "#7a6a62";
      const startPage = () => {
        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext("2d");
        context.fillStyle = "#fbf6ee";
        context.fillRect(0, 0, width, height);
        context.strokeStyle = "#d8c39a";
        context.lineWidth = 3;
        context.strokeRect(48, 48, width - 96, height - 96);
        context.direction = rtl ? "rtl" : "ltr";
        context.textAlign = rtl ? "right" : "left";
        y = margin;
      };
      const finishPage = async () => {
        context.fillStyle = muted;
        context.font = "500 24px Manrope, sans-serif";
        context.textAlign = "center";
        context.fillText(`GlowLetter · ${pages.length + 1}`, width / 2, height - 72);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9));
        pages.push({ blob, width, height });
      };
      const x = rtl ? width - margin : margin;
      const write = (lines, font, color, lineHeight) => {
        context.font = font;
        context.fillStyle = color;
        context.textAlign = rtl ? "right" : "left";
        for (const line of lines) { context.fillText(line, x, y); y += lineHeight; }
      };

      // Обложка.
      startPage();
      const outfit = currentOutfit();
      const cover = await loadImage(picture(outfit));
      if (cover) {
        const imageHeight = inner * cover.height / cover.width;
        context.save();
        context.beginPath();
        context.roundRect?.(margin, 200, inner, imageHeight, 36);
        context.clip();
        context.drawImage(cover, margin, 200, inner, imageHeight);
        context.restore();
        y = 200 + imageHeight + 140;
      } else y = 520;
      context.textAlign = "center";
      context.fillStyle = ink;
      context.font = "600 92px 'Cormorant Garamond', Georgia, serif";
      for (const line of wrapLines(context, tr("bookTitle"), inner)) { context.fillText(line, width / 2, y); y += 100; }
      context.fillStyle = accent;
      context.font = "700 40px Manrope, sans-serif";
      context.fillText(tr("bookSubtitle", { name: state.partner.name }), width / 2, y + 20);
      context.fillStyle = muted;
      context.font = "500 34px Manrope, sans-serif";
      context.fillText(tr("together", { n: state.today?.together || state.history.length }), width / 2, y + 90);
      await finishPage();

      // Дни — от первого к последнему.
      startPage();
      for (const row of [...state.history].reverse()) {
        context.font = "600 52px 'Cormorant Garamond', Georgia, serif";
        const questionLines = wrapLines(context, question(row.question_id), inner);
        context.font = "500 32px Manrope, sans-serif";
        const mineLines = wrapLines(context, row.mine, inner);
        const theirLines = wrapLines(context, row.theirs, inner);
        const needed = 60 + questionLines.length * 60 + 50 + mineLines.length * 44 + 50 + theirLines.length * 44 + 70;
        if (y + needed > height - 160 && y > margin) { await finishPage(); startPage(); }
        write([dateLabel(row.day).toUpperCase()], "700 26px Manrope, sans-serif", accent, 60);
        write(questionLines, "600 52px 'Cormorant Garamond', Georgia, serif", ink, 60);
        y += 10;
        write([tr("yourAnswer")], "700 24px Manrope, sans-serif", muted, 40);
        write(mineLines, "500 32px Manrope, sans-serif", ink, 44);
        y += 10;
        write([tr("theirAnswer", { name: state.partner.name })], "700 24px Manrope, sans-serif", muted, 40);
        write(theirLines, "500 32px Manrope, sans-serif", ink, 44);
        context.strokeStyle = "#e6d8bd";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(margin, y + 14);
        context.lineTo(width - margin, y + 14);
        context.stroke();
        y += 60;
      }
      await finishPage();
      const pdf = await appApi.makePdf(pages, BOOK.pageWidth, BOOK.pageHeight);
      await appApi.deliverFile(pdf, `${tr("bookFile")}.pdf`);
    } catch {
      state.error = tr("failed");
    }
    state.busy = false;
    render();
  }

  // ——— Данные ———

  async function rpc(name, args) {
    const db = client();
    if (!db) throw new Error("offline");
    const { data, error } = await db.rpc(name, args);
    if (error) throw error;
    return data;
  }

  async function refresh() {
    if (!signedIn()) { state.view = "signin"; render(); return; }
    // Список друзей берём прямо с сервера: окно «Друзья» могло ещё не загрузиться.
    try {
      const rows = (await rpc("glowletter_friends_list", {})) || [];
      state.friends = rows.filter(row => row.status === "friend").map(row => ({ user_id: row.user_id, name: row.display_name || tr("noName"), online: Boolean(row.last_seen) && Date.now() - new Date(row.last_seen).getTime() < 150000 }));
    } catch { state.friends = friendsApi()?.friends?.() || []; }
    const list = friends();
    await loadWaiting();
    if (!list.length) { state.view = "nofriends"; render(); return; }
    const saved = read(storageKey(PARTNER_KEY));
    state.partner = list.find(friend => friend.user_id === (state.partner?.user_id || saved)) || (list.length === 1 ? list[0] : null);
    if (!state.partner) { state.view = "pick"; render(); return; }
    await loadToday();
  }

  async function loadToday() {
    try {
      state.today = await rpc("glowletter_couple_today", { p_partner: state.partner.user_id, p_day: today() });
      state.view = "main";
    } catch (error) {
      if (String(error?.message) === "not_friends") { write(storageKey(PARTNER_KEY), ""); state.partner = null; state.view = "pick"; notify(tr("notFriends")); }
      else { state.view = "main"; state.error = tr("failed"); }
    }
    render();
  }

  async function loadWaiting() {
    if (!signedIn()) { state.waiting = []; updateBadge(); return; }
    try { state.waiting = ((await rpc("glowletter_couple_waiting", { p_day: today() })) || []).map(String); }
    catch { state.waiting = []; }
    updateBadge();
  }

  async function loadHistory(reset) {
    if (reset) { state.history = []; state.historyDone = false; }
    const before = state.history.at(-1)?.day || null;
    state.busy = true;
    render();
    try {
      const rows = (await rpc("glowletter_couple_history", { p_partner: state.partner.user_id, p_before: before, p_limit: 30 })) || [];
      state.history.push(...rows);
      state.historyDone = rows.length < 30;
    } catch (error) {
      if (String(error?.message) === "premium_required") { state.view = "main"; app()?.openPaywall?.(); }
      else state.error = tr("failed");
    }
    state.busy = false;
    render();
  }

  async function onAction(action, target) {
    state.error = "";
    switch (action) {
      case "close": close(); return;
      case "signin": close(); app()?.requestSignIn?.("couple"); return;
      case "friends": close(); friendsApi()?.open?.(); return;
      case "change": state.view = "pick"; render(); return;
      case "pick": {
        state.partner = friends().find(friend => friend.user_id === target.dataset.id) || null;
        if (!state.partner) return;
        write(storageKey(PARTNER_KEY), state.partner.user_id);
        state.today = null;
        state.view = "main";
        render();
        await loadToday();
        return;
      }
      case "answer": {
        const text = String(target.elements.answer.value || "").trim();
        if (!text || state.busy) return;
        state.busy = true;
        render();
        try {
          state.today = await rpc("glowletter_couple_answer", { p_partner: state.partner.user_id, p_day: today(), p_answer: text });
          notify(tr("saved"), 2400);
          state.waiting = state.waiting.filter(id => id !== state.partner.user_id);
          updateBadge();
        } catch (error) {
          const message = String(error?.message);
          state.error = message === "forbidden" ? tr("forbidden") : tr("failed");
          state.busy = false;
          render();
          const field = state.root?.querySelector(".glc-compose textarea");
          if (field) field.value = text;
          return;
        }
        state.busy = false;
        render();
        return;
      }
      case "wear": {
        if (state.busy) return;
        write(storageKey(`${OUTFIT_KEY}:${state.partner?.user_id}`), target.dataset.id);
        state.busy = true;
        try {
          state.today = await rpc("glowletter_couple_wear", { p_partner: state.partner.user_id, p_outfit: target.dataset.id, p_day: today() });
        } catch (error) {
          const message = String(error?.message);
          if (message === "premium_required") app()?.openPaywall?.();
          else notify(message === "locked" ? tr("locked") : tr("failed"));
        }
        state.busy = false;
        render();
        state.root?.querySelector(".glc-pet")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      case "story": {
        state.view = "story";
        state.story = null;
        render();
        try { state.story = await rpc("glowletter_couple_story", { p_partner: state.partner.user_id }); }
        catch { state.error = tr("failed"); }
        render();
        return;
      }
      case "paywall": app()?.openPaywall?.(); return;
      case "history": {
        if (!premium()) { app()?.openPaywall?.(); return; }
        state.view = "history";
        await loadHistory(true);
        return;
      }
      case "more": await loadHistory(false); return;
      case "book": if (!state.busy) await makeBook(); return;
      case "main": state.view = "main"; render(); return;
      default:
    }
  }

  function updateBadge() {
    const badge = document.querySelector("#coupleBadge");
    if (!badge) return;
    badge.textContent = String(state.waiting.length);
    badge.hidden = !state.waiting.length;
  }

  function localizeHome() {
    const label = document.querySelector("#coupleOpenHomeLabel");
    if (label) label.textContent = tr("home");
  }

  function init() {
    document.querySelector("#coupleOpenHome")?.addEventListener("click", () => open());
    localizeHome();
    addEventListener("glowletter-language-changed", () => setTimeout(() => { localizeHome(); render(); }, 0));
    addEventListener("glowletter-cloud-session", event => { if (event.detail?.signedIn) setTimeout(loadWaiting, 1500); else { state.waiting = []; state.partner = null; state.today = null; updateBadge(); } });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible" || !signedIn()) return;
      if (state.root && !state.root.hidden && state.partner) loadToday(); else loadWaiting();
    });
    if (signedIn()) setTimeout(loadWaiting, 1500);
  }

  // Наряд Тёпы для этого друга — чтобы в гости он пришёл таким же (friends.js).
  const bearFor = partnerId => {
    if (partnerId && state.partner?.user_id === partnerId && state.today) return currentOutfit().id;
    return OUTFITS.find(outfit => outfit.id === read(storageKey(`${OUTFIT_KEY}:${partnerId}`)))?.id || OUTFITS[0].id;
  };
  window.GlowLetterCouple = Object.freeze({ open: () => open(), outfits: OUTFITS, bearFor, text: (key, values) => tr(key, values), language: () => language() });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
