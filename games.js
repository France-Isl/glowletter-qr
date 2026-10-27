/*
  Игры для двоих (2.4.22). Первая игра — «Насколько хорошо ты меня знаешь?».

  Автор с полным доступом отвечает на вопросы о себе из проверенного списка,
  получает ссылку и отправляет её близкому человеку. Тот играет без входа и
  без покупки; сервер (функция couple-quiz) считает совпадения, а результат
  приходит автору сюда же, в «Мои тесты». Своих вопросов нет: в игре только
  добрые вопросы из списка ниже. Тексты на остальных языках лежат в
  games-i18n.js; если фразы нет, берётся английская.

  Модуль также собирает список возможностей в окне покупки:
  игры · развлечения · письма.
*/
(() => {
  "use strict";

  if (window.GlowLetterGames) return;

  const QUESTION_IDS = Object.freeze(Array.from({ length: 60 }, (_, index) => `q${String(index + 1).padStart(2, "0")}`));
  const QUIZ_SIZE = 15;
  const QUIZZES_TABLE = "glowletter_quizzes";
  const RESULTS_TABLE = "glowletter_quiz_results";
  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.7 4.3 13a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l1.2 1.2 1.2-1.2a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5Z"/></svg>';
  const icon = id => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

  const TEXT = {
    ru: {
      homeLink: "Игры для двоих", eyebrow: "GLOWLETTER · ИГРЫ ДЛЯ ДВОИХ", title: "Играйте вместе", close: "Закрыть",
      lead: "Отправьте игру тому, кто вам дорог. Играть по ссылке можно без входа и бесплатно.",
      quizTitle: "Насколько хорошо ты меня знаешь?", quizNote: "Ответьте на вопросы о себе, а близкий человек попробует угадать. Результат придёт вам.",
      create: "Создать тест", soon: "Скоро", soonTitle: "Готовим следующие игры",
      duel: "Дуэль «Кто быстрее»", loves: "Что мы любим", cards: "Карточки для половинки", who: "Кто из нас?", phrase: "Закончи фразу",
      myQuizzes: "Мои тесты", noQuizzes: "Тестов пока нет. Создайте первый — это пара минут.", forWhom: "Для: {name}", noRecipient: "Тест",
      resultsCount: "Результатов: {count}", newResults: "Новое: {count}", noResults: "Пока никто не прошёл тест.", anonymous: "Без имени",
      results: "Результаты", copyLink: "Скопировать ссылку", share: "Отправить", deleteQuiz: "Удалить тест", deleteConfirm: "Удалить тест и его результаты? Ссылка перестанет работать.",
      deleted: "Тест удалён", linkCopied: "Ссылка скопирована", back: "Назад", next: "Дальше",
      stepNames: "Шаг 1 из 2 · Имена", yourName: "Ваше имя", yourNamePlaceholder: "Как вас зовут", recipient: "Для кого · необязательно", recipientPlaceholder: "Имя близкого человека",
      nameRequired: "Введите своё имя.", forbiddenName: "Введите обычное имя.",
      stepAnswers: "Шаг 2 из 2 · Ваши ответы", answersLead: "Отметьте, что правда о вас. Любой вопрос можно заменить.", swap: "Другой вопрос",
      progress: "Отмечено {done} из {total}", answerAll: "Отметьте ответ в каждом вопросе.", finish: "Получить ссылку", creating: "Создаю тест…",
      createdTitle: "Тест готов!", createdLead: "Отправьте ссылку. Когда человек ответит, результат появится в «Моих тестах».",
      shareText: "{name} приглашает тебя в игру «Насколько хорошо ты меня знаешь?»",
      signInTitle: "Нужен вход в аккаунт", signInNote: "Тест хранится в вашем аккаунте, чтобы результаты пришли именно вам.", signIn: "Войти",
      premiumNote: "Создавать игры можно с полным доступом. Играть по ссылке — бесплатно для всех.",
      failed: "Не получилось. Проверьте связь и попробуйте ещё раз.", rateLimited: "Слишком много попыток. Попробуйте позже.",
      playEyebrow: "ИГРА ДЛЯ ДВОИХ", playInvite: "{name} приглашает вас в игру", playLead: "Вопросов: {count}. Угадайте ответы — в конце вы увидите, сколько совпало.",
      playName: "Ваше имя · необязательно", playNamePlaceholder: "Чтобы вас узнали", start: "Начать", playLoading: "Загружаю игру…",
      playMissing: "Игра недоступна: ссылку удалили или её срок закончился.", playOffline: "Для игры нужен интернет.", retry: "Повторить",
      questionOf: "Вопрос {n} из {total}", asks: "{name} спрашивает", counting: "Считаю совпадения…",
      scoreOf: "{score} из {total}", tierAll: "Идеально! Вы знаете друг друга лучше всех", tierHigh: "Вы очень хорошо знаете друг друга",
      tierMid: "Неплохо! Есть что узнать друг о друге", tierLow: "Впереди много приятных открытий",
      sentTo: "{name} увидит ваш результат", review: "Ваши ответы", rightAnswer: "Верный ответ",
      makeOwn: "Создать свой тест", home: "На главную", resultToast: "{name}: {score} из {total} в тесте «Насколько хорошо ты меня знаешь?»",
      ownerAnswers: "Ответы автора", playerAnswers: "Ответы {name}",
      paywallTitle: "Игры, развлечения<br><em>и письма</em>", groupGames: "Игры", groupFun: "Развлечения", groupLetters: "Письма",
      featQuiz: "«Насколько хорошо ты меня знаешь?» — результат приходит вам", featGamesSoon: "Дуэль «Кто быстрее», «Что мы любим», карточки с мишками",
      featFunSoon: "«Кто из нас?» и «Закончи фразу» с «Книгой пары»", featCollection: "Вся коллекция писем и стихов на 25 языках",
      featMoments: "Моменты, напоминания и QR-письмо, которое откроется в нужный день", featAudio: "Своё аудио в письме и ответ получателя",
      ynTitle: "Да или нет", ynNote: "Живая игра вдвоём: на каждую карточку 5 секунд. Кто успел ответить — увидит ответ партнёра.", ynCreate: "Создать комнату", ynWaiting: "Ждём, когда {name} откроет ссылку…", ynWaitingAny: "Ждём партнёра…", ynShareText: "{name} зовёт тебя в живую игру «Да или нет»", ynPartnerHere: "{name} уже в игре!", ynStart: "Начать игру", ynWaitHost: "{name} сейчас начнёт игру", ynYes: "Да", ynNo: "Нет", ynMissed: "Не успели — карточка закрыта", ynMatch: "Совпали!", ynRound: "Карточка {n} из {total}", ynAnswered: "Ответ принят, ждём партнёра…", ynFinal: "Совпало {score} из {total}", ynFinalHigh: "Вы чувствуете друг друга с полуслова", ynFinalMid: "Вы такие разные — и такие близкие", ynAgain: "Сыграть ещё раз", ynLeft: "Партнёр отключился. Ждём возвращения…", ynYou: "Вы", ynOffline: "Не удаётся подключиться к игре. Проверьте интернет и откройте ссылку снова.", ynJoin: "Войти в игру", ynJoinLead: "{name} ждёт вас. На каждый ответ — 5 секунд!", ynStepNames: "Ваше имя и имя партнёра", ynRoomReady: "Комната готова — отправьте ссылку", ynStayHere: "Не закрывайте этот экран: игра начнётся, когда партнёр откроет ссылку.", featYesNo: "Живая игра «Да или нет» — 5 секунд на ответ", ynPartnerMissed: "Ответа нет — время вышло", lvTitle: "Что мы любим", lvNote: "Живая игра вдвоём: 4 картинки, у каждого 10 секунд выбрать, что ближе. Можно выбрать одно и то же!", lvShareText: "{name} зовёт тебя в живую игру «Что мы любим»", lvJoinLead: "{name} ждёт вас. Выбирайте картинку, которая вам ближе!", lvRound: "Тема {n} из {total}", lvPick: "Выберите, что вам ближе", lvBoth: "Вы оба выбрали: {item}", lvCommon: "Вы оба любите", lvDiff: "Разные вкусы — тем интереснее!", lvFinalHigh: "У вас так много общего!", lvFinalMid: "Вы такие разные — и этим дополняете друг друга", featLoves: "Живая игра «Что мы любим» — 4 картинки, выбирайте вместе", featGamesSoon2: "Дуэль «Кто быстрее» и карточки с мишками"
    },
    en: {
      homeLink: "Games for two", eyebrow: "GLOWLETTER · GAMES FOR TWO", title: "Play together", close: "Close",
      lead: "Send a game to someone dear to you. Playing from a link is free and needs no account.",
      quizTitle: "How well do you know me?", quizNote: "Answer questions about yourself and let someone close try to guess. The result comes back to you.",
      create: "Create a quiz", soon: "Soon", soonTitle: "More games on the way",
      duel: "“Who’s faster” duel", loves: "What we love", cards: "Memory cards for two", who: "Which of us?", phrase: "Finish the sentence",
      myQuizzes: "My quizzes", noQuizzes: "No quizzes yet. Creating the first one takes a couple of minutes.", forWhom: "For {name}", noRecipient: "Quiz",
      resultsCount: "Results: {count}", newResults: "New: {count}", noResults: "Nobody has played this quiz yet.", anonymous: "No name",
      results: "Results", copyLink: "Copy link", share: "Send", deleteQuiz: "Delete quiz", deleteConfirm: "Delete this quiz and its results? The link will stop working.",
      deleted: "Quiz deleted", linkCopied: "Link copied", back: "Back", next: "Next",
      stepNames: "Step 1 of 2 · Names", yourName: "Your name", yourNamePlaceholder: "What’s your name", recipient: "For whom · optional", recipientPlaceholder: "Their name",
      nameRequired: "Enter your name.", forbiddenName: "Enter an ordinary name.",
      stepAnswers: "Step 2 of 2 · Your answers", answersLead: "Mark what is true about you. Any question can be swapped.", swap: "Another question",
      progress: "{done} of {total} answered", answerAll: "Pick an answer for every question.", finish: "Get the link", creating: "Creating the quiz…",
      createdTitle: "Your quiz is ready!", createdLead: "Send the link. When they answer, the result appears in “My quizzes”.",
      shareText: "{name} invites you to play “How well do you know me?”",
      signInTitle: "Sign in to continue", signInNote: "The quiz is kept in your account so that the results come to you.", signIn: "Sign in",
      premiumNote: "Creating games is part of full access. Playing from a link is free for everyone.",
      failed: "Something went wrong. Check your connection and try again.", rateLimited: "Too many attempts. Please try again later.",
      playEyebrow: "A GAME FOR TWO", playInvite: "{name} invites you to play", playLead: "Questions: {count}. Guess the answers — at the end you’ll see how many matched.",
      playName: "Your name · optional", playNamePlaceholder: "So they know it’s you", start: "Start", playLoading: "Loading the game…",
      playMissing: "This game is unavailable: the link was deleted or has expired.", playOffline: "The game needs an internet connection.", retry: "Try again",
      questionOf: "Question {n} of {total}", asks: "{name} asks", counting: "Counting the matches…",
      scoreOf: "{score} of {total}", tierAll: "Perfect! You know each other better than anyone", tierHigh: "You know each other really well",
      tierMid: "Not bad! There’s more to discover about each other", tierLow: "Lots of lovely discoveries ahead",
      sentTo: "{name} will see your result", review: "Your answers", rightAnswer: "Right answer",
      makeOwn: "Create my own quiz", home: "Home", resultToast: "{name}: {score} of {total} in “How well do you know me?”",
      ownerAnswers: "Author’s answers", playerAnswers: "{name}’s answers",
      paywallTitle: "Games, fun<br><em>and letters</em>", groupGames: "Games", groupFun: "Fun", groupLetters: "Letters",
      featQuiz: "“How well do you know me?” — the result comes back to you", featGamesSoon: "“Who’s faster” duel, “What we love”, memory cards with bears",
      featFunSoon: "“Which of us?” and “Finish the sentence” with a couple’s book", featCollection: "The whole collection of letters and poems in 25 languages",
      featMoments: "Moments, reminders and a QR letter that opens on the right day", featAudio: "Your own audio in a letter and replies from the recipient",
      ynTitle: "Yes or no", ynNote: "A live game for two: 5 seconds for each card. Answer in time to see your partner’s answer.", ynCreate: "Create a room", ynWaiting: "Waiting for {name}…", ynWaitingAny: "Waiting for your partner…", ynShareText: "{name} invites you to the live game “Yes or no”", ynPartnerHere: "{name} is here!", ynStart: "Start the game", ynWaitHost: "{name} is about to start the game", ynYes: "Yes", ynNo: "No", ynMissed: "Too late — this card stays closed", ynMatch: "A match!", ynRound: "Card {n} of {total}", ynAnswered: "Answer sent, waiting for your partner…", ynFinal: "{score} of {total} matched", ynFinalHigh: "You understand each other without words", ynFinalMid: "So different — and so close", ynAgain: "Play again", ynLeft: "Your partner disconnected. Waiting for them to come back…", ynYou: "You", ynOffline: "Can’t connect to the game. Check your connection and open the link again.", ynJoin: "Join the game", ynJoinLead: "{name} is waiting for you. 5 seconds for each answer!", ynStepNames: "Your name and your partner’s", ynRoomReady: "The room is ready — send the link", ynStayHere: "Keep this screen open: the game starts when your partner opens the link.", featYesNo: "Live game “Yes or no” — 5 seconds per answer", ynPartnerMissed: "No answer — time ran out", lvTitle: "What we love", lvNote: "A live game for two: 4 pictures, 10 seconds each to pick what you love most. You can pick the same one!", lvShareText: "{name} invites you to the live game “What we love”", lvJoinLead: "{name} is waiting for you. Pick the picture you love most!", lvRound: "Topic {n} of {total}", lvPick: "Pick what you love most", lvBoth: "You both picked: {item}", lvCommon: "You both love", lvDiff: "Different tastes — even more interesting!", lvFinalHigh: "You have so much in common!", lvFinalMid: "So different — and you complete each other", featLoves: "Live game “What we love” — 4 pictures, choose together", featGamesSoon2: "“Who’s faster” duel and memory cards with bears"
    },
    fr: {
      homeLink: "Jeux à deux", eyebrow: "GLOWLETTER · JEUX À DEUX", title: "Jouez ensemble", close: "Fermer",
      lead: "Envoyez un jeu à quelqu’un qui vous est cher. Jouer depuis un lien est gratuit et sans compte.",
      quizTitle: "Me connais-tu vraiment ?", quizNote: "Répondez à des questions sur vous, et un proche essaie de deviner. Le résultat vous revient.",
      create: "Créer un quiz", soon: "Bientôt", soonTitle: "D’autres jeux arrivent",
      duel: "Duel « Le plus rapide »", loves: "Ce que nous aimons", cards: "Cartes mémoire à deux", who: "Qui de nous deux ?", phrase: "Termine la phrase",
      myQuizzes: "Mes quiz", noQuizzes: "Aucun quiz pour l’instant. Le premier se crée en deux minutes.", forWhom: "Pour {name}", noRecipient: "Quiz",
      resultsCount: "Résultats : {count}", newResults: "Nouveau : {count}", noResults: "Personne n’a encore joué.", anonymous: "Sans nom",
      results: "Résultats", copyLink: "Copier le lien", share: "Envoyer", deleteQuiz: "Supprimer le quiz", deleteConfirm: "Supprimer ce quiz et ses résultats ? Le lien ne fonctionnera plus.",
      deleted: "Quiz supprimé", linkCopied: "Lien copié", back: "Retour", next: "Suivant",
      stepNames: "Étape 1 sur 2 · Prénoms", yourName: "Votre prénom", yourNamePlaceholder: "Comment vous appelez-vous", recipient: "Pour qui · facultatif", recipientPlaceholder: "Son prénom",
      nameRequired: "Saisissez votre prénom.", forbiddenName: "Saisissez un prénom ordinaire.",
      stepAnswers: "Étape 2 sur 2 · Vos réponses", answersLead: "Indiquez ce qui est vrai pour vous. Chaque question peut être remplacée.", swap: "Autre question",
      progress: "{done} sur {total} répondues", answerAll: "Choisissez une réponse pour chaque question.", finish: "Obtenir le lien", creating: "Création du quiz…",
      createdTitle: "Votre quiz est prêt !", createdLead: "Envoyez le lien. Quand la personne aura répondu, le résultat apparaîtra dans « Mes quiz ».",
      shareText: "{name} t’invite à jouer à « Me connais-tu vraiment ? »",
      signInTitle: "Connexion nécessaire", signInNote: "Le quiz est gardé dans votre compte pour que les résultats vous parviennent.", signIn: "Se connecter",
      premiumNote: "La création de jeux fait partie de l’accès complet. Jouer depuis un lien est gratuit pour tous.",
      failed: "Un problème est survenu. Vérifiez la connexion et réessayez.", rateLimited: "Trop de tentatives. Réessayez plus tard.",
      playEyebrow: "UN JEU À DEUX", playInvite: "{name} vous invite à jouer", playLead: "Questions : {count}. Devinez les réponses — à la fin, vous verrez combien correspondent.",
      playName: "Votre prénom · facultatif", playNamePlaceholder: "Pour qu’on vous reconnaisse", start: "Commencer", playLoading: "Chargement du jeu…",
      playMissing: "Ce jeu n’est plus disponible : le lien a été supprimé ou a expiré.", playOffline: "Le jeu nécessite une connexion internet.", retry: "Réessayer",
      questionOf: "Question {n} sur {total}", asks: "{name} demande", counting: "Calcul des réponses communes…",
      scoreOf: "{score} sur {total}", tierAll: "Parfait ! Vous vous connaissez mieux que personne", tierHigh: "Vous vous connaissez vraiment bien",
      tierMid: "Pas mal ! Il reste des choses à découvrir", tierLow: "De belles découvertes vous attendent",
      sentTo: "{name} verra votre résultat", review: "Vos réponses", rightAnswer: "Bonne réponse",
      makeOwn: "Créer mon quiz", home: "Accueil", resultToast: "{name} : {score} sur {total} à « Me connais-tu vraiment ? »",
      ownerAnswers: "Réponses de l’auteur", playerAnswers: "Réponses de {name}",
      paywallTitle: "Jeux, détente<br><em>et lettres</em>", groupGames: "Jeux", groupFun: "Détente", groupLetters: "Lettres",
      featQuiz: "« Me connais-tu vraiment ? » — le résultat vous revient", featGamesSoon: "Duel « Le plus rapide », « Ce que nous aimons », cartes avec des oursons",
      featFunSoon: "« Qui de nous deux ? » et « Termine la phrase » avec le livre du couple", featCollection: "Toute la collection de lettres et de poèmes en 25 langues",
      featMoments: "Moments, rappels et lettre QR qui s’ouvre le bon jour", featAudio: "Votre propre audio dans la lettre et la réponse du destinataire",
      ynTitle: "Oui ou non", ynNote: "Un jeu en direct à deux : 5 secondes par carte. Répondez à temps pour voir la réponse de l’autre.", ynCreate: "Créer une salle", ynWaiting: "En attente de {name}…", ynWaitingAny: "En attente de l’autre joueur…", ynShareText: "{name} t’invite au jeu en direct « Oui ou non »", ynPartnerHere: "{name} est là !", ynStart: "Lancer la partie", ynWaitHost: "{name} va lancer la partie", ynYes: "Oui", ynNo: "Non", ynMissed: "Trop tard — cette carte reste fermée", ynMatch: "Même réponse !", ynRound: "Carte {n} sur {total}", ynAnswered: "Réponse envoyée, en attente de l’autre…", ynFinal: "{score} sur {total} en commun", ynFinalHigh: "Vous vous comprenez sans un mot", ynFinalMid: "Si différents — et si proches", ynAgain: "Rejouer", ynLeft: "L’autre joueur s’est déconnecté. On attend son retour…", ynYou: "Vous", ynOffline: "Connexion au jeu impossible. Vérifiez internet et rouvrez le lien.", ynJoin: "Rejoindre la partie", ynJoinLead: "{name} vous attend. 5 secondes pour chaque réponse !", ynStepNames: "Votre prénom et celui de l’autre", ynRoomReady: "La salle est prête — envoyez le lien", ynStayHere: "Gardez cet écran ouvert : la partie commence quand l’autre ouvre le lien.", featYesNo: "Jeu en direct « Oui ou non » — 5 secondes par réponse", ynPartnerMissed: "Pas de réponse — le temps est écoulé", lvTitle: "Ce que nous aimons", lvNote: "Un jeu en direct à deux : 4 images, 10 secondes pour choisir ce que vous préférez. Vous pouvez choisir la même !", lvShareText: "{name} t’invite au jeu en direct « Ce que nous aimons »", lvJoinLead: "{name} vous attend. Choisissez l’image que vous préférez !", lvRound: "Thème {n} sur {total}", lvPick: "Choisissez ce que vous préférez", lvBoth: "Vous avez choisi tous les deux : {item}", lvCommon: "Vous aimez tous les deux", lvDiff: "Des goûts différents — c’est encore plus intéressant !", lvFinalHigh: "Vous avez tant de choses en commun !", lvFinalMid: "Si différents — et vous vous complétez", featLoves: "Jeu en direct « Ce que nous aimons » — 4 images, choisissez ensemble", featGamesSoon2: "Duel « Le plus rapide » et cartes mémoire avec des oursons"
    }
  };

  // Вопросы: текст и четыре варианта. Номера вопросов хранятся на сервере,
  // поэтому их нельзя переставлять — только дописывать новые в конец.
  const QUESTIONS = {
    ru: {
      q01: ["Моё любимое время года?", "Весна", "Лето", "Осень", "Зима"],
      q02: ["Что я выберу на завтрак?", "Кофе с круассаном", "Кашу", "Яичницу", "Только чай"],
      q03: ["Мой идеальный выходной?", "Дома под пледом", "Прогулка по парку", "Поездка за город", "Встреча с друзьями"],
      q04: ["Куда я мечтаю поехать?", "К морю", "В горы", "В большой город", "В уютный домик в деревне"],
      q05: ["Моё любимое мороженое?", "Ванильное", "Шоколадное", "Клубничное", "Фисташковое"],
      q06: ["Что порадует меня быстрее всего?", "Объятия", "Сюрприз", "Тёплые слова", "Что-нибудь вкусное"],
      q07: ["Я скорее…", "Жаворонок", "Сова", "Сплю, когда получится", "Обожаю дневной сон"],
      q08: ["Какой фильм я выберу на вечер?", "Комедию", "Романтическую историю", "Детектив", "Мультфильм"],
      q09: ["Мой любимый цвет?", "Красный", "Синий", "Зелёный", "Розовый"],
      q10: ["Чего я боюсь больше всего?", "Пауков", "Высоты", "Темноты", "Опоздать"],
      q11: ["Какие цветы я люблю?", "Розы", "Тюльпаны", "Пионы", "Ромашки"],
      q12: ["Что я делаю, когда грустно?", "Звоню близким", "Ем сладкое", "Иду гулять", "Ложусь спать"],
      q13: ["Какое животное мне ближе всего?", "Котик", "Собака", "Медвежонок", "Лисичка"],
      q14: ["Лучший подарок для меня?", "Сделанный своими руками", "Путешествие", "Украшение", "Книга"],
      q15: ["Мой любимый напиток?", "Чёрный чай", "Зелёный чай", "Кофе", "Какао"],
      q16: ["Мой любимый перекус?", "Шоколад", "Чипсы", "Фрукты", "Пирожное"],
      q17: ["Что я выберу в путешествии?", "Музеи", "Пляж", "Местную кухню", "Прогулки без плана"],
      q18: ["Как я люблю проводить вечер?", "С книгой", "С сериалом", "За разговорами", "На прогулке"],
      q19: ["Какая погода мне по душе?", "Солнце", "Тёплый дождь", "Снегопад", "Лёгкий ветер"],
      q20: ["Какая суперсила мне подошла бы?", "Летать", "Читать мысли", "Останавливать время", "Мгновенно перемещаться"],
      q21: ["Что для меня важнее всего в близких людях?", "Доверие", "Забота", "Чувство юмора", "Поддержка"],
      q22: ["Какой праздник я жду больше всего?", "Новый год", "День рождения", "Летний отпуск", "День влюблённых"],
      q23: ["Как я чаще говорю «люблю»?", "Словами", "Делами", "Объятиями", "Подарками"],
      q24: ["Что я закажу в кафе?", "Пасту", "Суши", "Салат", "Десерт"],
      q25: ["Моё любимое время суток?", "Утро", "День", "Вечер", "Ночь"],
      q26: ["Какую кухню я выберу?", "Итальянскую", "Японскую", "Домашнюю", "Мексиканскую"],
      q27: ["Где мне лучше всего думается?", "В душе", "На прогулке", "В дороге", "Перед сном"],
      q28: ["Что я делаю первым делом утром?", "Смотрю телефон", "Пью воду", "Варю кофе", "Валяюсь ещё немного"],
      q29: ["Мой любимый фрукт?", "Яблоко", "Банан", "Манго", "Арбуз"],
      q30: ["Какое хобби мне ближе?", "Рисование", "Готовка", "Спорт", "Чтение"],
      q31: ["Как я хочу отметить день рождения?", "Шумной вечеринкой", "Ужином вдвоём", "Поездкой", "Тихим вечером дома"],
      q32: ["Как я отношусь к сюрпризам?", "Обожаю", "Немного волнуюсь", "Люблю устраивать их другим", "Предпочитаю знать заранее"],
      q33: ["Какая сладость мне ближе?", "Торт", "Мороженое", "Печенье", "Конфеты"],
      q34: ["Что я возьму на необитаемый остров?", "Книгу", "Телефон", "Плед", "Фотоаппарат"],
      q35: ["Как я отдыхаю после трудного дня?", "Тёплая ванна", "Сериал", "Прогулка", "Разговор с близким"],
      q36: ["Какой транспорт мне нравится больше?", "Поезд", "Самолёт", "Машина", "Велосипед"],
      q37: ["Моя любимая игра в детстве?", "Прятки", "Догонялки", "Конструктор", "Рисование"],
      q38: ["Какая сказка мне ближе?", "Золушка", "Маленький принц", "Винни-Пух", "Алиса в Стране чудес"],
      q39: ["Чем я скорее порадую близкого?", "Сюрпризом", "Открыткой", "Поездкой", "Ужином"],
      q40: ["Что я чаще фотографирую?", "Себя", "Природу", "Еду", "Почти не фотографирую"],
      q41: ["Моё любимое место дома?", "Кровать", "Кухня", "Диван", "Балкон"],
      q42: ["Что я замечаю в человеке первым?", "Улыбку", "Глаза", "Голос", "Чувство юмора"],
      q43: ["Что меня рассмешит быстрее всего?", "Смешные видео", "Шутки близких", "Неловкие ситуации", "Животные"],
      q44: ["Что я выпью летом в жару?", "Лимонад", "Холодный чай", "Сок", "Воду со льдом"],
      q45: ["Какая стихия мне ближе?", "Вода", "Огонь", "Земля", "Воздух"],
      q46: ["Какие истории я люблю?", "Приключения", "Про любовь", "Фантастику", "Из жизни"],
      q47: ["Как я провожу дождливый день?", "Читаю", "Сплю", "Смотрю фильм", "Гуляю под зонтом"],
      q48: ["Что я ценю в подарке больше всего?", "Внимание", "Пользу", "Красоту", "Неожиданность"],
      q49: ["Какую картошку я выберу?", "Пюре", "Картофель фри", "Запечённую", "Чипсы"],
      q50: ["Куда я пойду первым делом в новом городе?", "В кафе", "В музей", "В парк", "По магазинам"],
      q51: ["Что я делаю, когда не спится?", "Читаю", "Листаю телефон", "Считаю овечек", "Пью тёплое молоко"],
      q52: ["Как я готовлюсь к важному дню?", "Всё планирую заранее", "Делаю в последний момент", "Прошу помощи", "Волнуюсь и не сплю"],
      q53: ["Какой спорт мне интереснее смотреть?", "Футбол", "Теннис", "Фигурное катание", "Спорт не смотрю"],
      q54: ["Какой питомец мне по душе?", "Кошка", "Собака", "Попугай", "Хомячок"],
      q55: ["Какие сообщения я пишу?", "Длинные", "Короткие", "С кучей смайликов", "Голосовые"],
      q56: ["Какой подарок я храню дольше всего?", "Письмо", "Игрушку", "Фотографию", "Украшение"],
      q57: ["Что я скорее выберу?", "Чай у камина", "Пикник на траве", "Прогулку у моря", "Поход в кино"],
      q58: ["Какой комплимент меня порадует больше?", "Про внешность", "Про ум", "Про доброту", "Про чувство юмора"],
      q59: ["Моё идеальное утро?", "Завтрак в постель", "Ранняя пробежка", "Долгий сон", "Кофе на балконе"],
      q60: ["Чему я хочу научиться?", "Танцевать", "Готовить", "Новому языку", "Рисовать"]
    },
    en: {
      q01: ["My favourite season?", "Spring", "Summer", "Autumn", "Winter"],
      q02: ["What would I pick for breakfast?", "Coffee and a croissant", "Porridge", "Eggs", "Just tea"],
      q03: ["My perfect day off?", "At home under a blanket", "A walk in the park", "A trip out of town", "Time with friends"],
      q04: ["Where do I dream of going?", "To the sea", "To the mountains", "To a big city", "To a cosy country cottage"],
      q05: ["My favourite ice cream?", "Vanilla", "Chocolate", "Strawberry", "Pistachio"],
      q06: ["What cheers me up fastest?", "A hug", "A surprise", "Kind words", "Something tasty"],
      q07: ["I’m more of…", "An early bird", "A night owl", "Someone who sleeps whenever possible", "A fan of afternoon naps"],
      q08: ["Which film would I choose tonight?", "A comedy", "A romantic story", "A mystery", "An animated film"],
      q09: ["My favourite colour?", "Red", "Blue", "Green", "Pink"],
      q10: ["What am I most afraid of?", "Spiders", "Heights", "The dark", "Being late"],
      q11: ["Which flowers do I love?", "Roses", "Tulips", "Peonies", "Daisies"],
      q12: ["What do I do when I feel sad?", "Call someone close", "Eat something sweet", "Go for a walk", "Go to sleep"],
      q13: ["Which animal is closest to my heart?", "A kitten", "A dog", "A bear cub", "A little fox"],
      q14: ["The best present for me?", "Something handmade", "A trip", "Jewellery", "A book"],
      q15: ["My favourite drink?", "Black tea", "Green tea", "Coffee", "Hot chocolate"],
      q16: ["My favourite snack?", "Chocolate", "Crisps", "Fruit", "A pastry"],
      q17: ["What do I choose when travelling?", "Museums", "The beach", "Local food", "Wandering without a plan"],
      q18: ["How do I like to spend an evening?", "With a book", "With a series", "Talking", "On a walk"],
      q19: ["What weather do I like best?", "Sunshine", "Warm rain", "Falling snow", "A light breeze"],
      q20: ["Which superpower would suit me?", "Flying", "Reading minds", "Stopping time", "Teleporting"],
      q21: ["What matters most to me in the people I love?", "Trust", "Care", "A sense of humour", "Support"],
      q22: ["Which celebration do I look forward to most?", "New Year", "My birthday", "Summer holidays", "Valentine’s Day"],
      q23: ["How do I usually say “I love you”?", "With words", "With actions", "With hugs", "With gifts"],
      q24: ["What would I order in a café?", "Pasta", "Sushi", "A salad", "Dessert"],
      q25: ["My favourite time of day?", "Morning", "Afternoon", "Evening", "Night"],
      q26: ["Which cuisine would I pick?", "Italian", "Japanese", "Home cooking", "Mexican"],
      q27: ["Where do I think best?", "In the shower", "On a walk", "On the road", "Before sleep"],
      q28: ["What do I do first thing in the morning?", "Check my phone", "Drink water", "Make coffee", "Stay in bed a bit longer"],
      q29: ["My favourite fruit?", "Apple", "Banana", "Mango", "Watermelon"],
      q30: ["Which hobby suits me best?", "Drawing", "Cooking", "Sport", "Reading"],
      q31: ["How do I want to celebrate my birthday?", "A lively party", "Dinner for two", "A trip", "A quiet evening at home"],
      q32: ["How do I feel about surprises?", "I love them", "They make me a little nervous", "I love making them for others", "I prefer to know in advance"],
      q33: ["Which sweet treat do I prefer?", "Cake", "Ice cream", "Biscuits", "Sweets"],
      q34: ["What would I take to a desert island?", "A book", "My phone", "A blanket", "A camera"],
      q35: ["How do I relax after a hard day?", "A warm bath", "A series", "A walk", "A talk with someone close"],
      q36: ["Which way of travelling do I like most?", "Train", "Plane", "Car", "Bicycle"],
      q37: ["My favourite childhood game?", "Hide-and-seek", "Tag", "Building blocks", "Drawing"],
      q38: ["Which fairy tale is closest to me?", "Cinderella", "The Little Prince", "Winnie-the-Pooh", "Alice in Wonderland"],
      q39: ["How would I rather delight someone dear?", "With a surprise", "With a card", "With a trip", "With a dinner"],
      q40: ["What do I photograph most?", "Myself", "Nature", "Food", "I hardly take photos"],
      q41: ["My favourite spot at home?", "The bed", "The kitchen", "The sofa", "The balcony"],
      q42: ["What do I notice first in a person?", "Their smile", "Their eyes", "Their voice", "Their sense of humour"],
      q43: ["What makes me laugh fastest?", "Funny videos", "Jokes from loved ones", "Awkward moments", "Animals"],
      q44: ["What do I drink on a hot summer day?", "Lemonade", "Iced tea", "Juice", "Water with ice"],
      q45: ["Which element is closest to me?", "Water", "Fire", "Earth", "Air"],
      q46: ["Which stories do I love?", "Adventures", "Love stories", "Science fiction", "True stories"],
      q47: ["How do I spend a rainy day?", "Reading", "Sleeping", "Watching a film", "Walking under an umbrella"],
      q48: ["What do I value most in a present?", "The thought", "Usefulness", "Beauty", "Surprise"],
      q49: ["Which potatoes would I choose?", "Mashed", "Fries", "Baked", "Crisps"],
      q50: ["Where do I go first in a new city?", "A café", "A museum", "A park", "The shops"],
      q51: ["What do I do when I can’t sleep?", "Read", "Scroll my phone", "Count sheep", "Drink warm milk"],
      q52: ["How do I prepare for an important day?", "I plan everything ahead", "I do it at the last minute", "I ask for help", "I worry and can’t sleep"],
      q53: ["Which sport do I enjoy watching most?", "Football", "Tennis", "Figure skating", "I don’t watch sport"],
      q54: ["Which pet suits me best?", "A cat", "A dog", "A parrot", "A hamster"],
      q55: ["What kind of messages do I write?", "Long ones", "Short ones", "Full of emojis", "Voice messages"],
      q56: ["Which present have I kept the longest?", "A letter", "A toy", "A photo", "A piece of jewellery"],
      q57: ["What would I rather choose?", "Tea by the fireplace", "A picnic on the grass", "A walk by the sea", "A trip to the cinema"],
      q58: ["Which compliment would please me most?", "About my looks", "About my mind", "About my kindness", "About my sense of humour"],
      q59: ["My perfect morning?", "Breakfast in bed", "An early run", "A long lie-in", "Coffee on the balcony"],
      q60: ["What do I want to learn?", "To dance", "To cook", "A new language", "To draw"]
    },
    fr: {
      q01: ["Ma saison préférée ?", "Le printemps", "L’été", "L’automne", "L’hiver"],
      q02: ["Que vais-je choisir au petit-déjeuner ?", "Café et croissant", "Du porridge", "Des œufs", "Juste du thé"],
      q03: ["Mon jour de repos idéal ?", "À la maison sous un plaid", "Une balade au parc", "Une escapade hors de la ville", "Un moment entre amis"],
      q04: ["Où est-ce que je rêve d’aller ?", "À la mer", "À la montagne", "Dans une grande ville", "Dans une petite maison à la campagne"],
      q05: ["Ma glace préférée ?", "Vanille", "Chocolat", "Fraise", "Pistache"],
      q06: ["Qu’est-ce qui me rend joie le plus vite ?", "Un câlin", "Une surprise", "Des mots tendres", "Quelque chose de bon"],
      q07: ["Je suis plutôt…", "Du matin", "Du soir", "Je dors quand je peux", "Fan de la sieste"],
      q08: ["Quel film vais-je choisir ce soir ?", "Une comédie", "Une histoire romantique", "Un policier", "Un dessin animé"],
      q09: ["Ma couleur préférée ?", "Rouge", "Bleu", "Vert", "Rose"],
      q10: ["De quoi ai-je le plus peur ?", "Des araignées", "Du vide", "Du noir", "D’être en retard"],
      q11: ["Quelles fleurs est-ce que j’aime ?", "Les roses", "Les tulipes", "Les pivoines", "Les marguerites"],
      q12: ["Que fais-je quand je suis triste ?", "J’appelle un proche", "Je mange du sucré", "Je vais marcher", "Je vais dormir"],
      q13: ["Quel animal me ressemble le plus ?", "Un chaton", "Un chien", "Un ourson", "Un renardeau"],
      q14: ["Le plus beau cadeau pour moi ?", "Un cadeau fait main", "Un voyage", "Un bijou", "Un livre"],
      q15: ["Ma boisson préférée ?", "Thé noir", "Thé vert", "Café", "Chocolat chaud"],
      q16: ["Mon en-cas préféré ?", "Du chocolat", "Des chips", "Des fruits", "Une pâtisserie"],
      q17: ["Que vais-je choisir en voyage ?", "Les musées", "La plage", "La cuisine locale", "Flâner sans programme"],
      q18: ["Comment j’aime passer la soirée ?", "Avec un livre", "Devant une série", "À discuter", "En promenade"],
      q19: ["Quel temps est-ce que je préfère ?", "Le soleil", "Une pluie tiède", "La neige qui tombe", "Une brise légère"],
      q20: ["Quel super-pouvoir me conviendrait ?", "Voler", "Lire dans les pensées", "Arrêter le temps", "Me téléporter"],
      q21: ["Qu’est-ce qui compte le plus pour moi chez mes proches ?", "La confiance", "L’attention", "L’humour", "Le soutien"],
      q22: ["Quelle fête est-ce que j’attends le plus ?", "Le Nouvel An", "Mon anniversaire", "Les vacances d’été", "La Saint-Valentin"],
      q23: ["Comment je dis le plus souvent « je t’aime » ?", "Avec des mots", "Avec des gestes", "Avec des câlins", "Avec des cadeaux"],
      q24: ["Que vais-je commander au café ?", "Des pâtes", "Des sushis", "Une salade", "Un dessert"],
      q25: ["Mon moment préféré de la journée ?", "Le matin", "L’après-midi", "Le soir", "La nuit"],
      q26: ["Quelle cuisine vais-je choisir ?", "Italienne", "Japonaise", "Faite maison", "Mexicaine"],
      q27: ["Où est-ce que je réfléchis le mieux ?", "Sous la douche", "En marchant", "En voyage", "Avant de dormir"],
      q28: ["Que fais-je en premier le matin ?", "Je regarde mon téléphone", "Je bois de l’eau", "Je prépare un café", "Je traîne encore au lit"],
      q29: ["Mon fruit préféré ?", "La pomme", "La banane", "La mangue", "La pastèque"],
      q30: ["Quel loisir me ressemble le plus ?", "Le dessin", "La cuisine", "Le sport", "La lecture"],
      q31: ["Comment ai-je envie de fêter mon anniversaire ?", "Une grande fête", "Un dîner à deux", "Un voyage", "Une soirée calme à la maison"],
      q32: ["Qu’est-ce que je pense des surprises ?", "J’adore", "Elles me rendent un peu fébrile", "J’adore en faire aux autres", "Je préfère savoir à l’avance"],
      q33: ["Quelle douceur je préfère ?", "Un gâteau", "Une glace", "Des biscuits", "Des bonbons"],
      q34: ["Qu’emporterais-je sur une île déserte ?", "Un livre", "Mon téléphone", "Un plaid", "Un appareil photo"],
      q35: ["Comment je me détends après une dure journée ?", "Un bain chaud", "Une série", "Une promenade", "Une discussion avec un proche"],
      q36: ["Quel moyen de transport j’aime le plus ?", "Le train", "L’avion", "La voiture", "Le vélo"],
      q37: ["Mon jeu préféré quand j’étais enfant ?", "Cache-cache", "Le chat perché", "Les jeux de construction", "Le dessin"],
      q38: ["Quel conte me ressemble le plus ?", "Cendrillon", "Le Petit Prince", "Winnie l’Ourson", "Alice au pays des merveilles"],
      q39: ["Comment ferais-je plaisir à un proche ?", "Avec une surprise", "Avec une carte", "Avec un voyage", "Avec un dîner"],
      q40: ["Qu’est-ce que je photographie le plus ?", "Moi-même", "La nature", "La nourriture", "Je ne prends presque pas de photos"],
      q41: ["Mon coin préféré à la maison ?", "Le lit", "La cuisine", "Le canapé", "Le balcon"],
      q42: ["Que remarque-je d’abord chez quelqu’un ?", "Le sourire", "Les yeux", "La voix", "L’humour"],
      q43: ["Qu’est-ce qui me fait rire le plus vite ?", "Les vidéos drôles", "Les blagues de mes proches", "Les situations gênantes", "Les animaux"],
      q44: ["Que bois-je quand il fait chaud ?", "De la limonade", "Du thé glacé", "Du jus", "De l’eau avec des glaçons"],
      q45: ["Quel élément me ressemble le plus ?", "L’eau", "Le feu", "La terre", "L’air"],
      q46: ["Quelles histoires j’aime ?", "Les aventures", "Les histoires d’amour", "La science-fiction", "Les histoires vraies"],
      q47: ["Comment je passe un jour de pluie ?", "Je lis", "Je dors", "Je regarde un film", "Je me promène sous un parapluie"],
      q48: ["Qu’est-ce que j’apprécie le plus dans un cadeau ?", "L’attention", "L’utilité", "La beauté", "La surprise"],
      q49: ["Quelles pommes de terre vais-je choisir ?", "En purée", "Des frites", "Au four", "Des chips"],
      q50: ["Où vais-je d’abord dans une nouvelle ville ?", "Dans un café", "Dans un musée", "Dans un parc", "Dans les boutiques"],
      q51: ["Que fais-je quand je n’arrive pas à dormir ?", "Je lis", "Je fais défiler mon téléphone", "Je compte les moutons", "Je bois du lait chaud"],
      q52: ["Comment je prépare un jour important ?", "Je planifie tout à l’avance", "Je fais tout au dernier moment", "Je demande de l’aide", "Je m’inquiète et je dors mal"],
      q53: ["Quel sport j’aime le plus regarder ?", "Le football", "Le tennis", "Le patinage artistique", "Je ne regarde pas le sport"],
      q54: ["Quel animal de compagnie me conviendrait ?", "Un chat", "Un chien", "Un perroquet", "Un hamster"],
      q55: ["Quel genre de messages j’écris ?", "Des longs", "Des courts", "Pleins d’émojis", "Des messages vocaux"],
      q56: ["Quel cadeau ai-je gardé le plus longtemps ?", "Une lettre", "Un jouet", "Une photo", "Un bijou"],
      q57: ["Que choisirais-je plutôt ?", "Un thé au coin du feu", "Un pique-nique sur l’herbe", "Une balade au bord de la mer", "Une séance de cinéma"],
      q58: ["Quel compliment me ferait le plus plaisir ?", "Sur mon apparence", "Sur mon intelligence", "Sur ma gentillesse", "Sur mon humour"],
      q59: ["Ma matinée idéale ?", "Le petit-déjeuner au lit", "Un footing tôt le matin", "Une longue grasse matinée", "Un café sur le balcon"],
      q60: ["Qu’ai-je envie d’apprendre ?", "À danser", "À cuisiner", "Une nouvelle langue", "À dessiner"]
    }
  };

  // «Да или нет»: вопрос, подпись к ответу «да», подпись к ответу «нет».
  // Подписи — о партнёре в третьем лице и без рода; номера карточек не менять.
  // Картинка к каждой карточке: новые рисунки из assets/cards и три фона приложения.
  const YES_NO_ART_FILES = Object.freeze({
    hug: "assets/cards/hug.webp", sea: "assets/cards/sea.webp", rain: "assets/cards/rain.webp",
    picnic: "assets/cards/picnic.webp", kitchen: "assets/cards/kitchen.webp", dance: "assets/cards/dance.webp",
    sunrise: "assets/cards/sunrise.webp", skating: "assets/cards/skating.webp", letter: "assets/cards/letter.webp", bears: "assets/scenes/bears-thumb.webp", roses: "assets/scenes/roses-thumb.webp",
    kitten: "assets/scenes/kitten-thumb.webp"
  });
  const YES_NO_ART = Object.freeze({
    c01: "hug", c02: "roses", c03: "sunrise", c04: "hug", c05: "sea", c06: "dance", c07: "bears", c08: "bears",
    c09: "picnic", c10: "kitchen", c11: "kitten", c12: "dance", c13: "picnic", c14: "letter", c15: "hug", c16: "rain",
    c17: "bears", c18: "kitchen", c19: "kitten", c20: "bears", c21: "dance", c22: "hug", c23: "bears", c24: "sunrise",
    c25: "letter", c26: "hug", c27: "sea", c28: "letter", c29: "hug", c30: "roses", c31: "picnic", c32: "hug",
    c33: "kitchen", c34: "bears", c35: "skating", c36: "sunrise", c37: "kitten", c38: "roses", c39: "hug", c40: "kitten"
  });
  const YES_NO_IDS = Object.freeze(Array.from({ length: 40 }, (_, index) => `c${String(index + 1).padStart(2, "0")}`));
  const YES_NO_ROUNDS = 20;
  const YES_NO = {
    ru: {
      c01: ["Скучаешь по мне прямо сейчас?", "очень скучает", "держится, но думает о тебе"],
      c02: ["Улыбаешься, когда видишь моё сообщение?", "всегда улыбается", "улыбается про себя"],
      c03: ["Помнишь нашу первую встречу?", "помнит каждую минуту", "помнит главное — тебя"],
      c04: ["Хочешь сегодня обняться?", "ждёт твоих объятий", "бережёт объятия на потом"],
      c05: ["Поедем вместе к морю?", "уже собирает чемодан", "мечтает о горах"],
      c06: ["Я тебя смешу?", "смеётся от души", "прячет улыбку"],
      c07: ["Тебе со мной спокойно?", "рядом с тобой спокойно", "с тобой весело и интересно"],
      c08: ["Вспоминаешь меня днём?", "вспоминает очень часто", "вспомнит прямо сейчас"],
      c09: ["Любишь мои сюрпризы?", "обожает твои сюрпризы", "любит, когда ты просто рядом"],
      c10: ["Испечём вместе пирог?", "уже надевает фартук", "лучше купит торт"],
      c11: ["Посмотрим вечером фильм вдвоём?", "уже выбирает фильм", "хочет просто поговорить"],
      c12: ["Нравится мой голос?", "может слушать бесконечно", "больше любит твой смех"],
      c13: ["Устроим пикник на выходных?", "готовит плед", "зовёт в уютное кафе"],
      c14: ["Хочешь получить от меня письмо?", "ждёт твоё письмо", "хочет услышать всё вживую"],
      c15: ["Я твой лучший друг?", "ты лучший друг", "ты даже больше, чем друг"],
      c16: ["Погуляем под дождём?", "берёт зонт на двоих", "заварит чай дома"],
      c17: ["Мы с тобой похожи?", "вы как две половинки", "вы прекрасно дополняете друг друга"],
      c18: ["Нравится, как я готовлю?", "просит добавки", "любит готовить вместе с тобой"],
      c19: ["Заведём общего питомца?", "уже выбирает имя", "пока хватает плюшевого мишки"],
      c20: ["Знаешь, что я люблю?", "знает наизусть", "хочет узнать ещё больше"],
      c21: ["Потанцуем?", "уже протягивает руку", "будет хлопать в ладоши"],
      c22: ["Я тебя вдохновляю?", "ты вдохновляешь каждый день", "рядом с тобой просто тепло"],
      c23: ["Хранишь наши фото?", "бережёт каждое", "ждёт новых, ещё лучше"],
      c24: ["Встретим рассвет вместе?", "ставит будильник", "лучше проводим закат"],
      c25: ["Расскажешь мне секрет?", "шепнёт на ушко", "пусть останется загадка"],
      c26: ["Гордишься мной?", "очень гордится", "верит в тебя всем сердцем"],
      c27: ["Отправимся в путешествие вдвоём?", "мечтает об этом", "возьмёт с собой всех близких"],
      c28: ["Ждёшь моего звонка?", "ждёт с улыбкой", "лучше приходи в гости"],
      c29: ["Нравятся мои объятия?", "самые тёплые на свете", "любит держаться за руки"],
      c30: ["Почитаем вслух друг другу?", "уже выбирает книгу", "лучше послушает тебя"],
      c31: ["Сделаем общее фото сегодня?", "уже ищет красивый фон", "сначала — разговоры"],
      c32: ["Я поднимаю тебе настроение?", "всегда поднимаешь", "с тобой даже грустить легче"],
      c33: ["Позавтракаем завтра вместе?", "уже варит какао", "мечтает поспать подольше"],
      c34: ["Помнишь мой день рождения?", "помнит без напоминаний", "готовит сюрприз втайне"],
      c35: ["Пойдём на каток?", "достаёт коньки", "будет болеть за тебя у бортика"],
      c36: ["Тебе сегодня хорошо?", "день отличный", "станет лучше, когда ты рядом"],
      c37: ["Нарисуешь мой портрет?", "уже берёт карандаш", "нарисует сердечко"],
      c38: ["Посадим вместе дерево?", "выбирает место", "начнёт с цветка на подоконнике"],
      c39: ["Хочешь услышать комплимент?", "ждёт с нетерпением", "смущается, но очень хочет"],
      c40: ["Сыграем ещё раз потом?", "хочет ещё раунд", "хочет обнять вместо игры"]
    },
    en: {
      c01: ["Do you miss me right now?", "misses you a lot", "is holding on, but thinking of you"],
      c02: ["Do you smile when you see my message?", "always smiles", "smiles quietly inside"],
      c03: ["Do you remember the first time we met?", "remembers every minute", "remembers what matters — you"],
      c04: ["Do you want a hug today?", "is waiting for your hug", "is saving hugs for later"],
      c05: ["Shall we go to the sea together?", "is already packing", "dreams of the mountains"],
      c06: ["Do I make you laugh?", "laughs from the heart", "is hiding a smile"],
      c07: ["Do you feel calm with me?", "feels calm beside you", "has fun with you"],
      c08: ["Do you think of me during the day?", "thinks of you very often", "is thinking of you right now"],
      c09: ["Do you love my surprises?", "adores your surprises", "loves it when you’re simply near"],
      c10: ["Shall we bake a pie together?", "is already putting on an apron", "would rather buy a cake"],
      c11: ["Shall we watch a film tonight?", "is already choosing a film", "would rather just talk"],
      c12: ["Do you like my voice?", "could listen forever", "loves your laugh even more"],
      c13: ["Shall we have a picnic this weekend?", "is getting the blanket ready", "invites you to a cosy café"],
      c14: ["Would you like a letter from me?", "is waiting for your letter", "wants to hear it in person"],
      c15: ["Am I your best friend?", "you’re the best friend", "you’re even more than a friend"],
      c16: ["Shall we walk in the rain?", "takes an umbrella for two", "will make tea at home"],
      c17: ["Are we alike?", "you’re two halves of one whole", "you complete each other perfectly"],
      c18: ["Do you like my cooking?", "asks for seconds", "loves cooking together with you"],
      c19: ["Shall we get a pet together?", "is already picking a name", "a teddy bear is enough for now"],
      c20: ["Do you know what I love?", "knows it by heart", "wants to learn even more"],
      c21: ["Shall we dance?", "is already reaching for your hand", "will clap along"],
      c22: ["Do I inspire you?", "you inspire every day", "it’s simply warm beside you"],
      c23: ["Do you keep our photos?", "treasures every one", "is waiting for new, better ones"],
      c24: ["Shall we watch the sunrise together?", "is setting an alarm", "would rather watch the sunset"],
      c25: ["Will you tell me a secret?", "will whisper it to you", "let it stay a mystery"],
      c26: ["Are you proud of me?", "is very proud", "believes in you with all their heart"],
      c27: ["Shall we travel, just the two of us?", "dreams about it", "will bring all your loved ones"],
      c28: ["Are you waiting for my call?", "is waiting with a smile", "would rather you came over"],
      c29: ["Do you like my hugs?", "the warmest in the world", "loves holding hands"],
      c30: ["Shall we read aloud to each other?", "is already choosing a book", "would rather listen to you"],
      c31: ["Shall we take a photo together today?", "is looking for a pretty spot", "talking comes first"],
      c32: ["Do I lift your mood?", "you always do", "even sadness is lighter with you"],
      c33: ["Shall we have breakfast together tomorrow?", "is already making cocoa", "dreams of sleeping in"],
      c34: ["Do you remember my birthday?", "remembers without reminders", "is secretly planning a surprise"],
      c35: ["Shall we go ice skating?", "is getting the skates", "will cheer for you by the rink"],
      c36: ["Is today a good day for you?", "a great day", "will be better when you’re near"],
      c37: ["Will you draw my portrait?", "is already holding a pencil", "will draw a little heart"],
      c38: ["Shall we plant a tree together?", "is choosing the spot", "will start with a flower on the windowsill"],
      c39: ["Would you like a compliment?", "can’t wait", "is shy but really wants one"],
      c40: ["Shall we play again later?", "wants another round", "would rather hug than play"]
    },
    fr: {
      c01: ["Je te manque en ce moment ?", "tu lui manques beaucoup", "tient bon, mais pense à toi"],
      c02: ["Tu souris quand tu vois mon message ?", "sourit toujours", "sourit intérieurement"],
      c03: ["Tu te souviens de notre première rencontre ?", "se souvient de chaque minute", "se souvient de l’essentiel : toi"],
      c04: ["Tu veux un câlin aujourd’hui ?", "attend ton câlin", "garde les câlins pour plus tard"],
      c05: ["On part ensemble à la mer ?", "fait déjà sa valise", "rêve de montagne"],
      c06: ["Je te fais rire ?", "rit de bon cœur", "cache un sourire"],
      c07: ["Tu te sens bien avec moi ?", "se sent en paix près de toi", "s’amuse avec toi"],
      c08: ["Tu penses à moi dans la journée ?", "pense à toi très souvent", "pense à toi en ce moment même"],
      c09: ["Tu aimes mes surprises ?", "adore tes surprises", "aime surtout quand tu es là"],
      c10: ["On fait une tarte ensemble ?", "met déjà son tablier", "préfère acheter un gâteau"],
      c11: ["On regarde un film ce soir ?", "choisit déjà le film", "préfère simplement discuter"],
      c12: ["Tu aimes ma voix ?", "pourrait l’écouter sans fin", "préfère encore ton rire"],
      c13: ["On fait un pique-nique ce week-end ?", "prépare le plaid", "propose un café douillet"],
      c14: ["Tu veux recevoir une lettre de moi ?", "attend ta lettre", "veut tout entendre de vive voix"],
      c15: ["Je compte beaucoup pour toi ?", "tu comptes énormément", "tu comptes plus que tu ne crois"],
      c16: ["On se promène sous la pluie ?", "prend un parapluie pour deux", "préparera du thé à la maison"],
      c17: ["On se ressemble ?", "vous êtes deux moitiés", "vous vous complétez à merveille"],
      c18: ["Tu aimes ma cuisine ?", "en redemande", "adore cuisiner avec toi"],
      c19: ["On adopte un animal ensemble ?", "choisit déjà son nom", "un ourson en peluche suffit pour l’instant"],
      c20: ["Tu sais ce que j’aime ?", "le sait par cœur", "veut en apprendre encore plus"],
      c21: ["On danse ?", "te tend déjà la main", "va applaudir"],
      c22: ["Je t’inspire ?", "tu l’inspires chaque jour", "près de toi, il fait simplement chaud"],
      c23: ["Tu gardes nos photos ?", "les garde précieusement", "attend de nouvelles, encore plus belles"],
      c24: ["On regarde le lever du soleil ensemble ?", "met un réveil", "préfère le coucher du soleil"],
      c25: ["Tu me confies un secret ?", "te le chuchotera", "que cela reste un mystère"],
      c26: ["Tu crois en moi ?", "croit en toi très fort", "t’encourage chaque jour"],
      c27: ["On part en voyage, rien que nous deux ?", "en rêve", "emmènera tous vos proches"],
      c28: ["Tu attends mon appel ?", "l’attend avec un sourire", "préfère que tu passes"],
      c29: ["Tu aimes mes câlins ?", "les plus chauds du monde", "aime se tenir la main"],
      c30: ["On se lit des histoires à voix haute ?", "choisit déjà un livre", "préfère t’écouter"],
      c31: ["On fait une photo ensemble aujourd’hui ?", "cherche déjà un joli décor", "d’abord, on discute"],
      c32: ["Je te remonte le moral ?", "toujours", "même la tristesse est plus légère avec toi"],
      c33: ["On prend le petit-déjeuner ensemble demain ?", "prépare déjà le chocolat", "rêve de faire la grasse matinée"],
      c34: ["Tu te souviens de mon anniversaire ?", "s’en souvient sans rappel", "prépare une surprise en secret"],
      c35: ["On va à la patinoire ?", "sort les patins", "t’encouragera depuis le bord"],
      c36: ["C’est une bonne journée pour toi ?", "une super journée", "elle sera meilleure avec toi"],
      c37: ["Tu dessines mon portrait ?", "prend déjà un crayon", "dessinera un petit cœur"],
      c38: ["On plante un arbre ensemble ?", "choisit l’endroit", "commencera par une fleur sur le rebord"],
      c39: ["Tu veux un compliment ?", "l’attend avec impatience", "est timide mais en a très envie"],
      c40: ["On rejoue plus tard ?", "veut une autre manche", "préfère un câlin à un jeu"]
    }
  };

  // «Что мы любим»: тема и четыре варианта; картинки — assets/loves/<тема><a–d>.webp.
  const LOVES_IDS = Object.freeze(Array.from({ length: 16 }, (_, index) => `s${String(index + 1).padStart(2, "0")}`));
  const LOVES_ROUNDS = 12;
  const LOVES_CHOICES = Object.freeze(["a", "b", "c", "d"]);
  const LOVES = {
    ru: {
      s01: ["Где провести отпуск?", "Пляж", "Горы", "Путешествие", "Уединение"],
      s02: ["Идеальный вечер?", "Кино дома", "Прогулка", "Ресторан", "Настольные игры"],
      s03: ["Любимая погода?", "Солнце", "Дождь", "Снег", "Звёздная ночь"],
      s04: ["Любимое животное?", "Котёнок", "Щенок", "Лошадь", "Дельфин"],
      s05: ["Что на ужин?", "Пицца", "Суши", "Пирожные", "Барбекю"],
      s06: ["Любимый напиток?", "Кофе", "Чай", "Какао", "Лимонад"],
      s07: ["Любимое время года?", "Весна", "Лето", "Осень", "Зима"],
      s08: ["Любимые цветы?", "Розы", "Тюльпаны", "Подсолнухи", "Лаванда"],
      s09: ["Как отдыхать?", "С книгой", "Рисовать", "На велосипеде", "Спать в гамаке"],
      s10: ["Как путешествовать?", "Поездом", "Самолётом", "На машине", "На корабле"],
      s11: ["Дом мечты?", "Квартира в городе", "Дом у моря", "Домик в горах", "Ферма"],
      s12: ["Что из сладкого?", "Мороженое", "Шоколад", "Торт", "Фрукты"],
      s13: ["Идеальное утро?", "Завтрак в постель", "Пробежка", "Долгий сон", "Кофе на балконе"],
      s14: ["Свидание мечты?", "Пикник", "Каток", "Парк аттракционов", "Звёзды на крыше"],
      s15: ["Лучший подарок?", "Букет цветов", "Письмо", "Путешествие", "Подарок в коробке"],
      s16: ["Любимая природа?", "Море", "Лес", "Пустыня", "Северное сияние"]
    },
    en: {
      s01: ["Where to spend a holiday?", "Beach", "Mountains", "Travelling", "Quiet time alone"],
      s02: ["Perfect evening?", "Movie at home", "A walk", "Restaurant", "Board games"],
      s03: ["Favourite weather?", "Sunshine", "Rain", "Snow", "Starry night"],
      s04: ["Favourite animal?", "Kitten", "Puppy", "Horse", "Dolphin"],
      s05: ["What’s for dinner?", "Pizza", "Sushi", "Pastries", "Barbecue"],
      s06: ["Favourite drink?", "Coffee", "Tea", "Hot chocolate", "Lemonade"],
      s07: ["Favourite season?", "Spring", "Summer", "Autumn", "Winter"],
      s08: ["Favourite flowers?", "Roses", "Tulips", "Sunflowers", "Lavender"],
      s09: ["How to relax?", "With a book", "Drawing", "Cycling", "Napping in a hammock"],
      s10: ["How to travel?", "By train", "By plane", "By car", "By ship"],
      s11: ["Dream home?", "City apartment", "House by the sea", "Mountain cabin", "Farm"],
      s12: ["Something sweet?", "Ice cream", "Chocolate", "Cake", "Fruit"],
      s13: ["Perfect morning?", "Breakfast in bed", "A morning run", "Sleeping in", "Coffee on the balcony"],
      s14: ["Dream date?", "Picnic", "Ice rink", "Amusement park", "Stars on the roof"],
      s15: ["Best present?", "A bouquet", "A letter", "A trip", "A gift box"],
      s16: ["Favourite nature?", "Sea", "Forest", "Desert", "Northern lights"]
    },
    fr: {
      s01: ["Où passer les vacances ?", "La plage", "La montagne", "Le voyage", "Un moment au calme"],
      s02: ["La soirée idéale ?", "Film à la maison", "Une balade", "Le restaurant", "Jeux de société"],
      s03: ["Le temps préféré ?", "Le soleil", "La pluie", "La neige", "Une nuit étoilée"],
      s04: ["L’animal préféré ?", "Un chaton", "Un chiot", "Un cheval", "Un dauphin"],
      s05: ["Qu’est-ce qu’on mange ?", "Une pizza", "Des sushis", "Des pâtisseries", "Un barbecue"],
      s06: ["La boisson préférée ?", "Café", "Thé", "Chocolat chaud", "Limonade"],
      s07: ["La saison préférée ?", "Le printemps", "L’été", "L’automne", "L’hiver"],
      s08: ["Les fleurs préférées ?", "Les roses", "Les tulipes", "Les tournesols", "La lavande"],
      s09: ["Comment se détendre ?", "Avec un livre", "En dessinant", "À vélo", "Sieste dans un hamac"],
      s10: ["Comment voyager ?", "En train", "En avion", "En voiture", "En bateau"],
      s11: ["La maison de rêve ?", "Appartement en ville", "Maison au bord de la mer", "Chalet à la montagne", "Une ferme"],
      s12: ["Quelque chose de sucré ?", "Une glace", "Du chocolat", "Un gâteau", "Des fruits"],
      s13: ["Le matin idéal ?", "Petit-déjeuner au lit", "Un footing", "Faire la grasse matinée", "Café sur le balcon"],
      s14: ["Le rendez-vous de rêve ?", "Un pique-nique", "La patinoire", "Un parc d’attractions", "Les étoiles sur le toit"],
      s15: ["Le plus beau cadeau ?", "Un bouquet", "Une lettre", "Un voyage", "Une boîte cadeau"],
      s16: ["La nature préférée ?", "La mer", "La forêt", "Le désert", "Les aurores boréales"]
    }
  };
  Object.entries(window.GLOWLETTER_GAMES_I18N || {}).forEach(([code, pack]) => {
    if (TEXT[code] || !pack || typeof pack !== "object") return;
    if (pack.text) TEXT[code] = pack.text;
    if (pack.questions) QUESTIONS[code] = pack.questions;
    if (pack.yesNo) YES_NO[code] = pack.yesNo;
    if (pack.loves) LOVES[code] = pack.loves;
  });

  const state = {
    root: null,
    view: "hub",
    lastFocus: null,
    quizzes: [],
    results: [],
    loaded: false,
    loading: false,
    busy: false,
    error: "",
    draft: null,
    created: null,
    detailId: "",
    play: null,
    yn: null,
    channel: null,
    channelUser: ""
  };

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const appConfig = () => window.NUR_APP_CONFIG || {};
  const language = () => {
    const current = String(app()?.getState?.().language || localStorage.getItem("nurLanguage") || document.documentElement.lang || "ru").toLowerCase();
    return TEXT[current] ? current : "en";
  };
  const tr = (key, values = {}) => {
    const template = (TEXT[language()] || TEXT.en)[key] ?? TEXT.en[key] ?? key;
    return String(template).replace(/\{(\w+)\}/gu, (_, name) => String(values[name] ?? ""));
  };
  const question = id => (QUESTIONS[language()] || QUESTIONS.en)[id] || QUESTIONS.en[id] || ["", "", "", "", ""];
  const yesNoCard = id => (YES_NO[language()] || YES_NO.en)[id] || YES_NO.en[id] || ["", "", ""];
  const lovesSet = id => (LOVES[language()] || LOVES.en)[id] || LOVES.en[id] || ["", "", "", "", ""];
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const cleanName = value => String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, 36);
  const premium = () => Boolean(app()?.getState?.().premium);
  const signedIn = () => Boolean(cloud()?.getState?.().signedIn);
  const notify = (message, duration = 3600) => app()?.notify?.(message, duration);
  const shareBase = () => String(app()?.getState?.().publicShareUrl || appConfig().publicShareUrl || `${location.origin}${location.pathname}`);
  const roomUrl = publicId => {
    const url = new URL(shareBase());
    url.search = "";
    url.hash = "";
    url.searchParams.set("yn", publicId);
    url.searchParams.set("lang", language());
    return url.toString();
  };
  const quizUrl = publicId => {
    const url = new URL(shareBase());
    url.search = "";
    url.hash = "";
    url.searchParams.set("quiz", publicId);
    url.searchParams.set("lang", language());
    return url.toString();
  };
  const formatDate = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    try { return new Intl.DateTimeFormat(language() === "ind" ? "id" : language(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date); }
    catch { return date.toLocaleString(); }
  };
  const shuffle = list => {
    const copy = list.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  };
  const unseenCount = () => state.results.filter(result => !result.seen_at).length;

  // ——— Разметка ———

  function mount() {
    if (state.root) return state.root;
    const root = document.createElement("div");
    root.className = "glg-layer";
    root.id = "gamesLayer";
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <button class="glg-backdrop" type="button" data-action="close" tabindex="-1" aria-hidden="true"></button>
      <section class="glg-panel" role="dialog" aria-modal="true" aria-labelledby="glgTitle">
        <header class="glg-header">
          <div><p class="glg-eyebrow" data-glg="eyebrow"></p><h2 id="glgTitle" data-glg="title"></h2></div>
          <button class="glg-close" type="button" data-action="close"><span aria-hidden="true">×</span></button>
        </header>
        <div class="glg-body" aria-live="polite"></div>
      </section>`;
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    root.addEventListener("submit", event => { event.preventDefault(); onAction(event.target.dataset.submit || "", event.target); });
    root.addEventListener("keydown", event => { if (event.key === "Escape") { event.stopPropagation(); close(); } });
    document.body.append(root);
    state.root = root;
    return root;
  }

  function open(view = "hub") {
    const root = mount();
    if (root.hidden) state.lastFocus = document.activeElement;
    state.view = view;
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("glg-open");
    requestAnimationFrame(() => root.classList.add("is-open"));
    render();
    if (view === "hub" || view === "detail") loadOwnData();
    requestAnimationFrame(() => root.querySelector(".glg-close")?.focus({ preventScroll: true }));
  }

  function close() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("glg-open");
    setTimeout(() => { if (!root.classList.contains("is-open")) root.hidden = true; }, 320);
    if (state.play) {
      const url = new URL(location.href);
      url.searchParams.delete("quiz");
      history.replaceState(history.state, "", url);
      state.play = null;
    }
    if (state.yn) leaveYesNo();
    state.lastFocus?.focus?.({ preventScroll: true });
  }

  function render() {
    const root = state.root;
    if (!root) return;
    const isPlay = state.view.startsWith("play");
    const isYesNo = state.view.startsWith("yn-");
    root.classList.toggle("is-play", isPlay || isYesNo);
    root.querySelector("[data-glg=eyebrow]").textContent = isPlay || isYesNo ? tr("playEyebrow") : tr("eyebrow");
    root.querySelector("[data-glg=title]").textContent = isPlay ? tr("quizTitle") : isYesNo ? tr(state.yn?.kind === "loves" ? "lvTitle" : "ynTitle") : tr("title");
    root.querySelector(".glg-close").setAttribute("aria-label", tr("close"));
    const body = root.querySelector(".glg-body");
    const views = { hub: renderHub, names: renderNames, answers: renderAnswers, created: renderCreated, detail: renderDetail, "play-loading": renderPlayLoading, "play-missing": renderPlayMissing, "play-intro": renderPlayIntro, "play-question": renderPlayQuestion, "play-result": renderPlayResult, "yn-loading": renderPlayLoading, "yn-names": renderYesNoNames, "yn-lobby": renderYesNoLobby, "yn-join": renderYesNoJoin, "yn-card": renderYesNoCard, "yn-end": renderYesNoEnd, "yn-missing": renderYesNoMissing };
    body.innerHTML = (views[state.view] || renderHub)();
    body.scrollTop = 0;
  }

  function renderHub() {
    const quizzes = state.quizzes.map(quiz => {
      const results = state.results.filter(result => result.quiz_id === quiz.id);
      const fresh = results.filter(result => !result.seen_at).length;
      const label = quiz.recipient_name ? tr("forWhom", { name: quiz.recipient_name }) : tr("noRecipient");
      return `<li><button class="glg-quiz-row" type="button" data-action="detail" data-id="${escapeHtml(quiz.id)}">
        <span class="glg-quiz-name">${escapeHtml(label)}</span>
        <span class="glg-quiz-meta">${escapeHtml(formatDate(quiz.created_at))} · ${escapeHtml(tr("resultsCount", { count: results.length }))}</span>
        ${fresh ? `<b class="glg-new">${escapeHtml(tr("newResults", { count: fresh }))}</b>` : ""}
      </button></li>`;
    }).join("");
    const soon = ["duel", "cards", "who", "phrase"].map(key => `<li>${escapeHtml(tr(key))}</li>`).join("");
    const mine = signedIn()
      ? `<section class="glg-section"><h3>${escapeHtml(tr("myQuizzes"))}</h3>${state.quizzes.length ? `<ul class="glg-quiz-list">${quizzes}</ul>` : `<p class="glg-muted">${escapeHtml(state.loading ? "…" : tr("noQuizzes"))}</p>`}</section>`
      : "";
    return `
      <p class="glg-lead">${escapeHtml(tr("lead"))}</p>
      <article class="glg-hero">
        <div class="glg-hero-hearts" aria-hidden="true">${HEART}${HEART}</div>
        <h3>${escapeHtml(tr("quizTitle"))}</h3>
        <p>${escapeHtml(tr("quizNote"))}</p>
        <button class="glg-primary" type="button" data-action="start-create">${icon("ic-plus")} ${escapeHtml(tr("create"))}</button>
        ${premium() ? "" : `<p class="glg-note">${escapeHtml(tr("premiumNote"))}</p>`}
      </article>
      <article class="glg-hero glg-yn-hero">
        <div class="glg-yn-chips" aria-hidden="true"><b>${escapeHtml(tr("ynYes"))}</b><i>5</i><b>${escapeHtml(tr("ynNo"))}</b></div>
        <h3>${escapeHtml(tr("ynTitle"))}</h3>
        <p>${escapeHtml(tr("ynNote"))}</p>
        <button class="glg-primary" type="button" data-action="yn-create">${icon("ic-plus")} ${escapeHtml(tr("ynCreate"))}</button>
      </article>
      <article class="glg-hero glg-yn-hero">
        ${lovesThumbs("s01")}
        <h3>${escapeHtml(tr("lvTitle"))}</h3>
        <p>${escapeHtml(tr("lvNote"))}</p>
        <button class="glg-primary" type="button" data-action="lv-create">${icon("ic-plus")} ${escapeHtml(tr("ynCreate"))}</button>
      </article>
      ${mine}
      <section class="glg-section glg-soon"><h3>${escapeHtml(tr("soonTitle"))} <span class="glg-chip">${escapeHtml(tr("soon"))}</span></h3><ul>${soon}</ul></section>`;
  }

  function renderNames() {
    const draft = state.draft;
    return `
      <form class="glg-form" data-submit="names-submit" novalidate>
        <p class="glg-step">${escapeHtml(tr("stepNames"))}</p>
        <label><span>${escapeHtml(tr("yourName"))}</span><input name="sender" type="text" dir="auto" maxlength="36" autocomplete="name" value="${escapeHtml(draft.sender)}" placeholder="${escapeHtml(tr("yourNamePlaceholder"))}" required /></label>
        <label><span>${escapeHtml(tr("recipient"))}</span><input name="recipient" type="text" dir="auto" maxlength="36" autocomplete="off" value="${escapeHtml(draft.recipient)}" placeholder="${escapeHtml(tr("recipientPlaceholder"))}" /></label>
        <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
        <div class="glg-actions"><button class="glg-secondary" type="button" data-action="hub">${escapeHtml(tr("back"))}</button><button class="glg-primary" type="submit">${escapeHtml(tr("next"))} →</button></div>
      </form>`;
  }

  function renderAnswers() {
    const draft = state.draft;
    const done = draft.items.filter(item => item.answer !== null).length;
    const cards = draft.items.map((item, index) => {
      const [text, ...options] = question(item.id);
      return `<fieldset class="glg-question" data-index="${index}">
        <legend><span class="glg-number">${index + 1}</span>${escapeHtml(text)}</legend>
        <div class="glg-options">${options.map((option, choice) => `<button type="button" class="glg-option${item.answer === choice ? " is-picked" : ""}" data-action="pick" data-index="${index}" data-choice="${choice}" aria-pressed="${item.answer === choice}">${escapeHtml(option)}</button>`).join("")}</div>
        <button class="glg-link" type="button" data-action="swap" data-index="${index}">↻ ${escapeHtml(tr("swap"))}</button>
      </fieldset>`;
    }).join("");
    return `
      <p class="glg-step">${escapeHtml(tr("stepAnswers"))}</p>
      <p class="glg-muted">${escapeHtml(tr("answersLead"))}</p>
      ${cards}
      <div class="glg-sticky">
        <p class="glg-progress-label">${escapeHtml(tr("progress", { done, total: draft.items.length }))}</p>
        <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
        <div class="glg-actions"><button class="glg-secondary" type="button" data-action="names">${escapeHtml(tr("back"))}</button><button class="glg-primary" type="button" data-action="create"${state.busy ? " disabled" : ""}>${escapeHtml(state.busy ? tr("creating") : tr("finish"))}</button></div>
      </div>`;
  }

  function linkActions(publicId) {
    return `<div class="glg-link-box"><code>${escapeHtml(quizUrl(publicId))}</code></div>
      <div class="glg-actions"><button class="glg-primary" type="button" data-action="share" data-public="${escapeHtml(publicId)}">${icon("ic-share")} ${escapeHtml(tr("share"))}</button><button class="glg-secondary" type="button" data-action="copy" data-public="${escapeHtml(publicId)}">${icon("ic-copy")} ${escapeHtml(tr("copyLink"))}</button></div>`;
  }

  function renderCreated() {
    const created = state.created;
    return `
      <article class="glg-hero glg-done">
        <div class="glg-hero-hearts" aria-hidden="true">${HEART}${HEART}${HEART}</div>
        <h3>${escapeHtml(tr("createdTitle"))}</h3>
        <p>${escapeHtml(tr("createdLead"))}</p>
        ${linkActions(created.public_id)}
      </article>
      <button class="glg-secondary glg-wide" type="button" data-action="hub">${escapeHtml(tr("myQuizzes"))}</button>`;
  }

  function hearts(score, total) {
    return `<div class="glg-hearts" aria-hidden="true">${Array.from({ length: total }, (_, index) => `<i class="${index < score ? "is-on" : ""}" style="--i:${index}">${HEART}</i>`).join("")}</div>`;
  }

  function renderDetail() {
    const quiz = state.quizzes.find(item => item.id === state.detailId);
    if (!quiz) return renderHub();
    const answers = Array.isArray(quiz.questions) ? quiz.questions : [];
    const results = state.results.filter(result => result.quiz_id === quiz.id);
    const rows = results.map(result => {
      const name = result.player_name || tr("anonymous");
      const review = answers.map((item, index) => {
        const [text, ...options] = question(item.id);
        const given = Array.isArray(result.answers) ? result.answers[index] : null;
        const right = given === item.answer;
        return `<li class="${right ? "is-right" : "is-wrong"}"><span>${escapeHtml(text)}</span><b>${right ? "✓" : "✗"} ${escapeHtml(options[given] ?? "—")}</b>${right ? "" : `<small>${escapeHtml(tr("ownerAnswers"))}: ${escapeHtml(options[item.answer] ?? "")}</small>`}</li>`;
      }).join("");
      return `<li class="glg-result${result.seen_at ? "" : " is-new"}"><details>
        <summary><span class="glg-result-name">${escapeHtml(name)}</span><strong>${escapeHtml(tr("scoreOf", { score: result.score, total: result.total }))}</strong><time>${escapeHtml(formatDate(result.created_at))}</time></summary>
        ${hearts(result.score, result.total)}
        <ul class="glg-review">${review}</ul>
      </details></li>`;
    }).join("");
    return `
      <button class="glg-link glg-back" type="button" data-action="hub">← ${escapeHtml(tr("myQuizzes"))}</button>
      <h3 class="glg-detail-title">${escapeHtml(quiz.recipient_name ? tr("forWhom", { name: quiz.recipient_name }) : tr("quizTitle"))}</h3>
      ${linkActions(quiz.public_id)}
      <section class="glg-section"><h3>${escapeHtml(tr("results"))}</h3>${results.length ? `<ul class="glg-results">${rows}</ul>` : `<p class="glg-muted">${escapeHtml(tr("noResults"))}</p>`}</section>
      <button class="glg-link glg-danger" type="button" data-action="delete" data-id="${escapeHtml(quiz.id)}">${escapeHtml(tr("deleteQuiz"))}</button>`;
  }

  function renderPlayLoading() {
    return `<p class="glg-center glg-muted">${escapeHtml(tr("playLoading"))}</p>`;
  }

  function renderPlayMissing() {
    return `<div class="glg-center"><p>${escapeHtml(state.play?.offline ? tr("playOffline") : tr("playMissing"))}</p>
      <button class="glg-secondary" type="button" data-action="close">${escapeHtml(tr("home"))}</button></div>`;
  }

  function renderPlayIntro() {
    const play = state.play;
    return `
      <form class="glg-form glg-intro" data-submit="play-start" novalidate>
        <div class="glg-hero-hearts" aria-hidden="true">${HEART}${HEART}</div>
        <h3>${escapeHtml(tr("playInvite", { name: play.sender }))}</h3>
        <p class="glg-muted">${escapeHtml(tr("playLead", { count: play.questions.length }))}</p>
        <label><span>${escapeHtml(tr("playName"))}</span><input name="player" type="text" dir="auto" maxlength="36" autocomplete="name" value="${escapeHtml(play.player)}" placeholder="${escapeHtml(tr("playNamePlaceholder"))}" /></label>
        <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
        <button class="glg-primary glg-wide" type="submit">${escapeHtml(tr("start"))} →</button>
      </form>`;
  }

  function renderPlayQuestion() {
    const play = state.play;
    const index = play.index;
    const [text, ...options] = question(play.questions[index]);
    const percent = Math.round((index / play.questions.length) * 100);
    if (play.sending) return `<div class="glg-center"><div class="glg-hero-hearts glg-pulse" aria-hidden="true">${HEART}</div><p>${escapeHtml(tr("counting"))}</p></div>`;
    return `
      <div class="glg-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${play.questions.length}" aria-valuenow="${index}"><i style="--glg-progress:${percent / 100}"></i></div>
      <p class="glg-step">${escapeHtml(tr("questionOf", { n: index + 1, total: play.questions.length }))}</p>
      <p class="glg-asks">${escapeHtml(tr("asks", { name: play.sender }))}</p>
      <h3 class="glg-play-question">${escapeHtml(text)}</h3>
      <div class="glg-options glg-play-options">${options.map((option, choice) => `<button type="button" class="glg-option${play.answers[index] === choice ? " is-picked" : ""}" data-action="answer" data-choice="${choice}">${escapeHtml(option)}</button>`).join("")}</div>
      <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
      ${state.error && play.answers.every(answer => answer !== null) ? `<button class="glg-primary glg-wide" type="button" data-action="retry">↻ ${escapeHtml(tr("retry"))}</button>` : ""}
      ${index > 0 ? `<button class="glg-link" type="button" data-action="play-back">← ${escapeHtml(tr("back"))}</button>` : ""}`;
  }

  function renderPlayResult() {
    const play = state.play;
    const { score, total, correct } = play.result;
    const ratio = total ? score / total : 0;
    const tier = score === total ? "tierAll" : ratio >= 0.75 ? "tierHigh" : ratio >= 0.4 ? "tierMid" : "tierLow";
    const review = play.questions.map((id, index) => {
      const [text, ...options] = question(id);
      const right = play.answers[index] === correct[index];
      return `<li class="${right ? "is-right" : "is-wrong"}"><span>${escapeHtml(text)}</span><b>${right ? "✓" : "✗"} ${escapeHtml(options[play.answers[index]] ?? "")}</b>${right ? "" : `<small>${escapeHtml(tr("rightAnswer"))}: ${escapeHtml(options[correct[index]] ?? "")}</small>`}</li>`;
    }).join("");
    return `
      <article class="glg-score">
        ${hearts(score, total)}
        <p class="glg-score-number">${escapeHtml(tr("scoreOf", { score, total }))}</p>
        <h3>${escapeHtml(tr(tier))}</h3>
        <p class="glg-muted">${escapeHtml(tr("sentTo", { name: play.sender }))}</p>
      </article>
      <section class="glg-section"><h3>${escapeHtml(tr("review"))}</h3><ul class="glg-review">${review}</ul></section>
      <div class="glg-actions glg-stack"><button class="glg-primary" type="button" data-action="make-own">${icon("ic-plus")} ${escapeHtml(tr("makeOwn"))}</button><button class="glg-secondary" type="button" data-action="close">${escapeHtml(tr("home"))}</button></div>`;
  }

  // ——— Действия ———

  function onClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target || !state.root.contains(target)) return;
    onAction(target.dataset.action, target);
  }

  function onInput(event) {
    const field = event.target;
    if (state.view === "names" && state.draft) state.draft[field.name] = cleanName(field.value);
    if (state.view === "play-intro" && state.play && field.name === "player") state.play.player = cleanName(field.value);
  }

  function onAction(action, target) {
    state.error = "";
    switch (action) {
      case "close": close(); return;
      case "hub": state.view = "hub"; render(); loadOwnData(); return;
      case "start-create": return startCreate();
      case "names": state.view = "names"; render(); return;
      case "pick": {
        const item = state.draft.items[Number(target.dataset.index)];
        if (item) item.answer = Number(target.dataset.choice);
        return rerenderKeepingScroll();
      }
      case "swap": return swapQuestion(Number(target.dataset.index));
      case "create": return createQuiz();
      case "share": return shareQuiz(target.dataset.public);
      case "copy": return copyQuiz(target.dataset.public);
      case "detail": state.detailId = target.dataset.id; state.view = "detail"; render(); markSeen(state.detailId); return;
      case "delete": return deleteQuiz(target.dataset.id);
      case "answer": return answerQuestion(Number(target.dataset.choice));
      case "play-back": if (state.play.index > 0) { state.play.index -= 1; render(); } return;
      case "make-own": {
        const url = new URL(location.href);
        url.searchParams.delete("quiz");
        history.replaceState(history.state, "", url);
        state.play = null;
        state.view = "hub";
        render();
        loadOwnData();
        return;
      }
      case "names-submit": {
        const sender = cleanName(target.elements.sender.value);
        if (!sender) { state.error = tr("nameRequired"); render(); return; }
        state.draft.sender = sender;
        state.draft.recipient = cleanName(target.elements.recipient.value);
        state.view = "answers";
        render();
        return;
      }
      case "play-start":
        state.play.player = cleanName(target.elements.player.value);
        state.view = "play-question";
        render();
        return;
      case "retry": submitPlay(); return;
      case "yn-create": return startYesNoCreate("yesno");
      case "lv-create": return startYesNoCreate("loves");
      case "yn-names-submit": return createYesNoRoom(target);
      case "yn-start": return hostStartYesNo();
      case "yn-join-submit": return guestJoinYesNo(target);
      case "yn-answer": return answerYesNo(target.dataset.value);
      case "yn-again": return hostStartYesNo();
      case "yn-share": return shareRoom();
      case "yn-copy": return copyRoom();
      default:
    }
  }

  function rerenderKeepingScroll() {
    const body = state.root.querySelector(".glg-body");
    const top = body.scrollTop;
    render();
    body.scrollTop = top;
  }

  function startCreate() {
    if (!premium()) { app()?.openPaywall?.(); return; }
    if (!signedIn()) { renderSignIn(); return; }
    const appState = app()?.getState?.() || {};
    state.draft = {
      sender: state.draft?.sender || cleanName(appState.senderName),
      recipient: state.draft?.recipient || cleanName(appState.recipientName),
      items: shuffle(QUESTION_IDS).slice(0, QUIZ_SIZE).map(id => ({ id, answer: null }))
    };
    state.view = "names";
    render();
    requestAnimationFrame(() => state.root.querySelector("input[name=sender]")?.focus());
  }

  function renderSignIn() {
    const body = state.root.querySelector(".glg-body");
    body.innerHTML = `<div class="glg-center"><h3>${escapeHtml(tr("signInTitle"))}</h3><p class="glg-muted">${escapeHtml(tr("signInNote"))}</p>
      <div class="glg-actions"><button class="glg-secondary" type="button" data-action="hub">${escapeHtml(tr("back"))}</button><button class="glg-primary" type="button" data-glg-signin>${icon("ic-user")} ${escapeHtml(tr("signIn"))}</button></div></div>`;
    body.querySelector("[data-glg-signin]").addEventListener("click", () => { close(); app()?.requestSignIn?.("games"); });
  }

  function swapQuestion(index) {
    const used = new Set(state.draft.items.map(item => item.id));
    const pool = QUESTION_IDS.filter(id => !used.has(id));
    if (!pool.length) return;
    state.draft.items[index] = { id: pool[Math.floor(Math.random() * pool.length)], answer: null };
    rerenderKeepingScroll();
  }

  async function createQuiz() {
    const draft = state.draft;
    if (!draft || state.busy) return;
    if (!draft.sender) { state.view = "names"; state.error = tr("nameRequired"); render(); return; }
    if (draft.items.some(item => item.answer === null)) { state.error = tr("answerAll"); rerenderKeepingScroll(); return; }
    const client = cloud()?.getClient?.();
    if (!client || !signedIn()) { renderSignIn(); return; }
    state.busy = true;
    rerenderKeepingScroll();
    try {
      const { data, error } = await client.rpc("glowletter_create_quiz", {
        p_sender_name: draft.sender,
        p_recipient_name: draft.recipient || null,
        p_language: language(),
        p_questions: draft.items.map(item => ({ id: item.id, answer: item.answer }))
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.public_id) throw new Error("empty");
      state.created = row;
      state.quizzes = [{ id: row.id, public_id: row.public_id, sender_name: draft.sender, recipient_name: draft.recipient || null, created_at: new Date().toISOString(), questions: draft.items.map(item => ({ ...item })) }, ...state.quizzes];
      state.draft = null;
      state.view = "created";
    } catch (error) {
      const message = String(error?.message || "");
      if (message === "premium_required") { state.busy = false; app()?.openPaywall?.(); render(); return; }
      if (message === "authentication_required") { state.busy = false; renderSignIn(); return; }
      if (message === "forbidden") { state.view = "names"; state.error = tr("forbiddenName"); }
      else state.error = message === "rate_limited" ? tr("rateLimited") : tr("failed");
    }
    state.busy = false;
    render();
  }

  async function copyQuiz(publicId) {
    const url = quizUrl(publicId);
    try { await navigator.clipboard.writeText(url); notify(tr("linkCopied"), 2600); }
    catch { window.prompt(tr("copyLink"), url); }
  }

  async function shareQuiz(publicId) {
    const quiz = state.quizzes.find(item => item.public_id === publicId);
    const text = tr("shareText", { name: quiz?.sender_name || cleanName(app()?.getState?.().senderName) || "GlowLetter" });
    const url = quizUrl(publicId);
    // В приложении Android системное окно «Поделиться» открывает мост NurShare.
    const bridge = window.NurShare;
    if (bridge && typeof bridge.share === "function") {
      try { bridge.share(tr("quizTitle"), text, url); return; } catch {}
    }
    if (navigator.share) {
      try { await navigator.share({ title: tr("quizTitle"), text, url }); return; }
      catch (error) { if (error?.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(`${text}\n${url}`); notify(tr("linkCopied"), 2600); }
    catch { window.prompt(tr("copyLink"), url); }
  }

  async function deleteQuiz(id) {
    if (!id || !window.confirm(tr("deleteConfirm"))) return;
    const client = cloud()?.getClient?.();
    if (!client) return;
    const { error } = await client.from(QUIZZES_TABLE).delete().eq("id", id);
    if (error) { notify(tr("failed")); return; }
    state.quizzes = state.quizzes.filter(quiz => quiz.id !== id);
    state.results = state.results.filter(result => result.quiz_id !== id);
    updateBadge();
    notify(tr("deleted"), 2600);
    state.view = "hub";
    render();
  }

  // ——— Данные автора ———

  async function loadOwnData() {
    const client = cloud()?.getClient?.();
    const userId = cloud()?.getState?.().userId || "";
    if (!client || !userId || state.loading) { updateBadge(); return; }
    state.loading = true;
    try {
      const [quizzes, results] = await Promise.all([
        client.from(QUIZZES_TABLE).select("id, public_id, sender_name, recipient_name, questions, created_at, expires_at").order("created_at", { ascending: false }).limit(50),
        client.from(RESULTS_TABLE).select("id, quiz_id, player_name, answers, score, total, created_at, seen_at").order("created_at", { ascending: false }).limit(300)
      ]);
      if (!quizzes.error) state.quizzes = quizzes.data || [];
      if (!results.error) state.results = results.data || [];
      state.loaded = true;
    } finally {
      state.loading = false;
    }
    updateBadge();
    subscribe(client, userId);
    if (state.root && !state.root.hidden && ["hub", "detail"].includes(state.view)) {
      render();
      if (state.view === "detail") markSeen(state.detailId);
    }
  }

  async function markSeen(quizId) {
    const fresh = state.results.filter(result => result.quiz_id === quizId && !result.seen_at);
    if (!fresh.length) return;
    const client = cloud()?.getClient?.();
    const now = new Date().toISOString();
    fresh.forEach(result => { result.seen_at = now; });
    updateBadge();
    if (client) await client.from(RESULTS_TABLE).update({ seen_at: now }).in("id", fresh.map(result => result.id));
  }

  function subscribe(client, userId) {
    if (!client?.channel || state.channelUser === userId) return;
    if (state.channel) client.removeChannel?.(state.channel);
    state.channelUser = userId;
    state.channel = client.channel(`glowletter-quiz-results:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: RESULTS_TABLE, filter: `user_id=eq.${userId}` }, payload => {
        const result = payload?.new;
        if (!result?.id || state.results.some(item => item.id === result.id)) return;
        state.results = [result, ...state.results];
        updateBadge();
        notify(tr("resultToast", { name: result.player_name || tr("anonymous"), score: result.score, total: result.total }), 6000);
        if (state.root && !state.root.hidden && state.view === "hub") render();
        if (state.root && !state.root.hidden && state.view === "detail" && state.detailId === result.quiz_id) { render(); markSeen(result.quiz_id); }
      })
      .subscribe();
  }

  function resetOwnData() {
    const client = cloud()?.getClient?.();
    if (state.channel) client?.removeChannel?.(state.channel);
    state.channel = null;
    state.channelUser = "";
    state.quizzes = [];
    state.results = [];
    state.loaded = false;
    updateBadge();
  }

  // ——— Игра по ссылке ———

  async function startPlay(publicId) {
    state.play = { publicId, sender: "", questions: [], answers: [], index: 0, player: "", sending: false, result: null, offline: false };
    open("play-loading");
    const base = String(appConfig().supabaseUrl || "").replace(/\/+$/u, "");
    const headers = { Accept: "application/json" };
    if (appConfig().supabasePublishableKey) headers.apikey = appConfig().supabasePublishableKey;
    try {
      const response = await fetch(`${base}/functions/v1/couple-quiz?id=${encodeURIComponent(publicId)}`, { headers, cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" });
      const payload = await response.json().catch(() => ({}));
      const questions = Array.isArray(payload.questions) ? payload.questions.filter(id => QUESTION_IDS.includes(id)) : [];
      if (!response.ok || payload.state !== "ready" || questions.length !== payload.questions.length || questions.length < 5) throw new Error("missing");
      Object.assign(state.play, { sender: cleanName(payload.senderName) || "GlowLetter", player: cleanName(payload.recipientName), questions, answers: questions.map(() => null) });
      state.view = "play-intro";
    } catch (error) {
      state.play.offline = !navigator.onLine;
      state.view = "play-missing";
    }
    render();
  }

  function answerQuestion(choice) {
    const play = state.play;
    if (!play || play.sending) return;
    play.answers[play.index] = choice;
    render();
    setTimeout(() => {
      if (play !== state.play) return;
      if (play.index < play.questions.length - 1) { play.index += 1; render(); }
      else submitPlay();
    }, 260);
  }

  async function submitPlay() {
    const play = state.play;
    if (!play || play.sending) return;
    state.error = "";
    play.sending = true;
    render();
    const base = String(appConfig().supabaseUrl || "").replace(/\/+$/u, "");
    const headers = { Accept: "application/json", "Content-Type": "application/json" };
    if (appConfig().supabasePublishableKey) headers.apikey = appConfig().supabasePublishableKey;
    try {
      const response = await fetch(`${base}/functions/v1/couple-quiz`, {
        method: "POST", headers, cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer",
        body: JSON.stringify({ publicId: play.publicId, name: play.player, answers: play.answers, language: language() })
      });
      const payload = await response.json().catch(() => ({}));
      if (payload.state === "forbidden_text") { play.sending = false; play.player = ""; state.view = "play-intro"; state.error = tr("forbiddenName"); render(); return; }
      if (response.status === 429) throw Object.assign(new Error("rate"), { rate: true });
      if (!response.ok || payload.state !== "accepted" || !Array.isArray(payload.correct)) throw new Error("failed");
      play.result = { score: Number(payload.score) || 0, total: Number(payload.total) || play.questions.length, correct: payload.correct.map(Number) };
      state.view = "play-result";
    } catch (error) {
      state.error = error?.rate ? tr("rateLimited") : tr("failed");
    }
    play.sending = false;
    render();
  }


  // ——— «Да или нет»: живая игра вдвоём ———
  //
  // Комната — запись в glowletter_game_rooms (создаёт автор с полным доступом),
  // ход игры — Realtime Broadcast на канале glowletter-yesno:<номер комнаты>.
  // Ведущий (автор) раздаёт карточки и после 5 секунд объявляет ответы обоих;
  // кто не успел ответить, видит карточку закрытой.

  const YES_NO_SECONDS = 5;
  const YES_NO_REVEAL_MS = 3200;
  const LOVES_SECONDS = 10;
  const LOVES_REVEAL_MS = 3600;

  const roomSeconds = yn => (yn?.kind === "loves" ? LOVES_SECONDS : YES_NO_SECONDS);
  const roomChoices = yn => (yn?.kind === "loves" ? LOVES_CHOICES : ["yes", "no"]);
  const lovesImage = (id, choice) => `assets/loves/${id}${choice}.webp`;
  function lovesThumbs(id) {
    return `<div class="glg-lv-thumbs" aria-hidden="true">${LOVES_CHOICES.map(choice => `<i style="background-image:url('${lovesImage(id, choice)}')"></i>`).join("")}</div>`;
  }
  function roomBadge(yn) {
    if (yn?.kind === "loves") return lovesThumbs("s07");
    return `<div class="glg-yn-chips" aria-hidden="true"><b>${escapeHtml(tr("ynYes"))}</b><i>5</i><b>${escapeHtml(tr("ynNo"))}</b></div>`;
  }

  function startYesNoCreate(kind = "yesno") {
    if (!premium()) { app()?.openPaywall?.(); return; }
    if (!signedIn()) { renderSignIn(); return; }
    const appState = app()?.getState?.() || {};
    state.yn = { kind: kind === "loves" ? "loves" : "yesno", role: "host", roomId: "", hostName: cleanName(appState.senderName), guestName: cleanName(appState.recipientName), partnerOnline: false, phase: "names", deck: [], index: 0, answers: { host: [], guest: [] }, mine: null, timers: [], channel: null };
    state.view = "yn-names";
    render();
    requestAnimationFrame(() => state.root.querySelector("input[name=host]")?.focus());
  }

  function renderYesNoNames() {
    const yn = state.yn;
    return `
      <form class="glg-form" data-submit="yn-names-submit" novalidate>
        <p class="glg-step">${escapeHtml(tr("ynStepNames"))}</p>
        <label><span>${escapeHtml(tr("yourName"))}</span><input name="host" type="text" dir="auto" maxlength="36" autocomplete="name" value="${escapeHtml(yn.hostName)}" placeholder="${escapeHtml(tr("yourNamePlaceholder"))}" required /></label>
        <label><span>${escapeHtml(tr("recipient"))}</span><input name="guest" type="text" dir="auto" maxlength="36" autocomplete="off" value="${escapeHtml(yn.guestName)}" placeholder="${escapeHtml(tr("recipientPlaceholder"))}" /></label>
        <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
        <div class="glg-actions"><button class="glg-secondary" type="button" data-action="hub">${escapeHtml(tr("back"))}</button><button class="glg-primary" type="submit"${state.busy ? " disabled" : ""}>${escapeHtml(state.busy ? tr("creating") : tr("ynCreate"))}</button></div>
      </form>`;
  }

  async function createYesNoRoom(form) {
    const yn = state.yn;
    if (!yn || state.busy) return;
    yn.hostName = cleanName(form.elements.host.value);
    yn.guestName = cleanName(form.elements.guest.value);
    if (!yn.hostName) { state.error = tr("nameRequired"); render(); return; }
    const client = cloud()?.getClient?.();
    if (!client) { state.error = tr("failed"); render(); return; }
    state.busy = true;
    render();
    try {
      const { data, error } = await client.rpc("glowletter_create_game_room", { p_kind: yn.kind, p_host_name: yn.hostName, p_guest_name: yn.guestName || null, p_language: language() });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.public_id) throw new Error("empty");
      yn.roomId = row.public_id;
      yn.phase = "lobby";
      state.view = "yn-lobby";
      connectYesNo();
    } catch (error) {
      const message = String(error?.message || "");
      if (message === "premium_required") { state.busy = false; app()?.openPaywall?.(); render(); return; }
      if (message === "authentication_required") { state.busy = false; renderSignIn(); return; }
      state.error = message === "forbidden" ? tr("forbiddenName") : message === "rate_limited" ? tr("rateLimited") : tr("failed");
    }
    state.busy = false;
    render();
  }

  function renderYesNoLobby() {
    const yn = state.yn;
    const partner = yn.guestName || "";
    const status = yn.partnerOnline
      ? `<p class="glg-yn-status is-online">${HEART} ${escapeHtml(tr("ynPartnerHere", { name: partner || tr("ynWaitingAny").replace(/…$/u, "") }))}</p>
         <button class="glg-primary glg-wide" type="button" data-action="yn-start">${escapeHtml(tr("ynStart"))} →</button>`
      : `<p class="glg-yn-status"><span class="glg-yn-dot" aria-hidden="true"></span>${escapeHtml(partner ? tr("ynWaiting", { name: partner }) : tr("ynWaitingAny"))}</p>
         <p class="glg-muted">${escapeHtml(tr("ynStayHere"))}</p>`;
    return `
      <article class="glg-hero">
        ${roomBadge(yn)}
        <h3>${escapeHtml(tr("ynRoomReady"))}</h3>
        <div class="glg-link-box"><code>${escapeHtml(roomUrl(yn.roomId))}</code></div>
        <div class="glg-actions"><button class="glg-primary" type="button" data-action="yn-share">${icon("ic-share")} ${escapeHtml(tr("share"))}</button><button class="glg-secondary" type="button" data-action="yn-copy">${icon("ic-copy")} ${escapeHtml(tr("copyLink"))}</button></div>
      </article>
      <section class="glg-section glg-center glg-yn-wait">${status}</section>`;
  }

  async function shareRoom() {
    const yn = state.yn;
    if (!yn?.roomId) return;
    const loves = yn.kind === "loves";
    const text = tr(loves ? "lvShareText" : "ynShareText", { name: yn.hostName || "GlowLetter" });
    const title = tr(loves ? "lvTitle" : "ynTitle");
    const url = roomUrl(yn.roomId);
    const bridge = window.NurShare;
    if (bridge && typeof bridge.share === "function") {
      try { bridge.share(title, text, url); return; } catch {}
    }
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; }
      catch (error) { if (error?.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(`${text}\n${url}`); notify(tr("linkCopied"), 2600); }
    catch { window.prompt(tr("copyLink"), url); }
  }

  async function copyRoom() {
    const url = roomUrl(state.yn?.roomId || "");
    try { await navigator.clipboard.writeText(url); notify(tr("linkCopied"), 2600); }
    catch { window.prompt(tr("copyLink"), url); }
  }

  async function joinYesNoRoom(roomId) {
    state.yn = { kind: "yesno", role: "guest", roomId, hostName: "", guestName: "", partnerOnline: false, phase: "join", deck: [], index: 0, answers: { host: [], guest: [] }, mine: null, timers: [], channel: null, offline: false };
    open("yn-loading");
    const base = String(appConfig().supabaseUrl || "").replace(/\/+$/u, "");
    const headers = { Accept: "application/json" };
    if (appConfig().supabasePublishableKey) headers.apikey = appConfig().supabasePublishableKey;
    try {
      const response = await fetch(`${base}/functions/v1/couple-quiz?room=${encodeURIComponent(roomId)}`, { headers, cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.state !== "ready" || !["yesno", "loves"].includes(payload.kind)) throw new Error("missing");
      Object.assign(state.yn, { kind: payload.kind, hostName: cleanName(payload.hostName) || "GlowLetter", guestName: cleanName(payload.guestName) });
      state.view = "yn-join";
    } catch {
      state.yn.offline = !navigator.onLine;
      state.view = "yn-missing";
    }
    render();
  }

  function renderYesNoMissing() {
    return `<div class="glg-center"><p>${escapeHtml(state.yn?.offline ? tr("ynOffline") : tr("playMissing"))}</p>
      <button class="glg-secondary" type="button" data-action="close">${escapeHtml(tr("home"))}</button></div>`;
  }

  function renderYesNoJoin() {
    const yn = state.yn;
    if (yn.phase === "waiting") {
      return `<div class="glg-center glg-yn-wait"><div class="glg-hero-hearts glg-pulse" aria-hidden="true">${HEART}</div>
        <p class="glg-yn-status">${escapeHtml(yn.partnerOnline ? tr("ynWaitHost", { name: yn.hostName }) : tr("ynLeft"))}</p></div>`;
    }
    return `
      <form class="glg-form glg-intro" data-submit="yn-join-submit" novalidate>
        ${roomBadge(yn)}
        <h3>${escapeHtml(tr("playInvite", { name: yn.hostName }))}</h3>
        <p class="glg-muted">${escapeHtml(tr(yn.kind === "loves" ? "lvJoinLead" : "ynJoinLead", { name: yn.hostName }))}</p>
        <label><span>${escapeHtml(tr("playName"))}</span><input name="guest" type="text" dir="auto" maxlength="36" autocomplete="name" value="${escapeHtml(yn.guestName)}" placeholder="${escapeHtml(tr("playNamePlaceholder"))}" /></label>
        <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
        <button class="glg-primary glg-wide" type="submit">${escapeHtml(tr("ynJoin"))} →</button>
      </form>`;
  }

  function guestJoinYesNo(form) {
    const yn = state.yn;
    yn.guestName = cleanName(form.elements.guest.value) || yn.guestName;
    yn.phase = "waiting";
    render();
    connectYesNo();
  }

  function yesNoClient() {
    const client = cloud()?.getClient?.();
    if (client?.channel) return client;
    const factory = window.supabase?.createClient;
    if (!factory || !appConfig().supabaseUrl || !appConfig().supabasePublishableKey) return null;
    state.ynClient = state.ynClient || factory(appConfig().supabaseUrl, appConfig().supabasePublishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    return state.ynClient;
  }

  function connectYesNo() {
    const yn = state.yn;
    const client = yesNoClient();
    if (!yn || !client) { if (yn) { yn.offline = true; state.view = "yn-missing"; render(); } return; }
    const channel = client.channel(`glowletter-yesno:${yn.roomId}`, { config: { broadcast: { self: false }, presence: { key: yn.role } } });
    yn.channel = channel;
    channel
      .on("presence", { event: "sync" }, () => {
        const other = yn.role === "host" ? "guest" : "host";
        const presence = channel.presenceState()[other] || [];
        const online = presence.length > 0;
        if (online && yn.role === "host") yn.guestName = cleanName(presence[0]?.name) || yn.guestName;
        if (online !== yn.partnerOnline) {
          yn.partnerOnline = online;
          if (["yn-lobby", "yn-join"].includes(state.view)) render();
          else if (!online) notify(tr("ynLeft"), 4000);
        }
      })
      .on("broadcast", { event: "yn" }, ({ payload }) => onYesNoMessage(payload || {}))
      .subscribe(async status => {
        if (status === "SUBSCRIBED") {
          await channel.track({ role: yn.role, name: yn.role === "host" ? yn.hostName : yn.guestName });
        } else if (["CHANNEL_ERROR", "TIMED_OUT"].includes(status) && yn === state.yn && yn.phase !== "end") {
          yn.offline = true;
          state.view = "yn-missing";
          render();
        }
      });
  }

  function sendYesNo(payload) {
    state.yn?.channel?.send({ type: "broadcast", event: "yn", payload });
  }

  function clearYesNoTimers() {
    (state.yn?.timers || []).forEach(clearTimeout);
    if (state.yn) state.yn.timers = [];
  }

  function leaveYesNo() {
    const yn = state.yn;
    clearYesNoTimers();
    if (yn?.channel) {
      try { yn.channel.untrack?.(); } catch {}
      (cloud()?.getClient?.() || state.ynClient)?.removeChannel?.(yn.channel);
    }
    const url = new URL(location.href);
    url.searchParams.delete("yn");
    history.replaceState(history.state, "", url);
    state.yn = null;
  }

  // Ведущий: раздаёт колоду и ведёт раунды.
  function hostStartYesNo() {
    const yn = state.yn;
    if (!yn || yn.role !== "host" || !yn.partnerOnline) return;
    clearYesNoTimers();
    yn.deck = yn.kind === "loves" ? shuffle(LOVES_IDS).slice(0, LOVES_ROUNDS) : shuffle(YES_NO_IDS).slice(0, YES_NO_ROUNDS);
    yn.answers = { host: [], guest: [] };
    sendYesNo({ type: "start", deck: yn.deck, guestName: yn.guestName });
    hostRound(0);
  }

  function hostRound(index) {
    const yn = state.yn;
    if (!yn) return;
    // Колода едет с каждым раундом: партнёр, пропустивший «start», догонит игру.
    sendYesNo({ type: "round", index, deck: yn.deck });
    beginRound(index);
    yn.timers.push(setTimeout(() => hostReveal(index), roomSeconds(yn) * 1000 + 1200));
  }

  function hostReveal(index) {
    const yn = state.yn;
    if (!yn) return;
    const host = yn.answers.host[index] ?? null;
    const guest = yn.answers.guest[index] ?? null;
    sendYesNo({ type: "reveal", index, host, guest });
    showReveal(index, host, guest);
    yn.timers.push(setTimeout(() => {
      if (index + 1 < yn.deck.length) hostRound(index + 1);
      else { sendYesNo({ type: "end", host: yn.answers.host, guest: yn.answers.guest }); showYesNoEnd(); }
    }, yn.kind === "loves" ? LOVES_REVEAL_MS : YES_NO_REVEAL_MS));
  }

  function onYesNoMessage(message) {
    const yn = state.yn;
    if (!yn) return;
    const index = Number(message.index);
    if (message.type === "answer" && yn.role === "host" && Number.isInteger(index) && roomChoices(yn).includes(message.value)) {
      if (yn.phase === "round" && yn.index === index && yn.answers.guest[index] == null) yn.answers.guest[index] = message.value;
      return;
    }
    if (yn.role !== "guest") return;
    if (message.type === "start" && Array.isArray(message.deck)) {
      const ids = yn.kind === "loves" ? LOVES_IDS : YES_NO_IDS;
      yn.deck = message.deck.filter(id => ids.includes(id)).slice(0, yn.kind === "loves" ? LOVES_ROUNDS : YES_NO_ROUNDS);
      yn.answers = { host: [], guest: [] };
    } else if (message.type === "round" && Number.isInteger(index)) {
      if (Array.isArray(message.deck) && message.deck.join() !== yn.deck.join()) {
        const ids = yn.kind === "loves" ? LOVES_IDS : YES_NO_IDS;
        yn.deck = message.deck.filter(id => ids.includes(id)).slice(0, yn.kind === "loves" ? LOVES_ROUNDS : YES_NO_ROUNDS);
      }
      beginRound(index);
    } else if (message.type === "reveal" && Number.isInteger(index)) {
      const value = answer => (roomChoices(yn).includes(answer) ? answer : null);
      yn.answers.host[index] = value(message.host);
      yn.answers.guest[index] = value(message.guest);
      showReveal(index, yn.answers.host[index], yn.answers.guest[index]);
    } else if (message.type === "end") {
      showYesNoEnd();
    }
  }

  function beginRound(index) {
    const yn = state.yn;
    if (!yn || !yn.deck[index]) return;
    yn.index = index;
    yn.phase = "round";
    yn.mine = null;
    yn.roundStart = Date.now();
    state.view = "yn-card";
    render();
    yn.timers.push(setTimeout(() => {
      if (yn === state.yn && yn.phase === "round" && yn.index === index) {
        yn.phase = "closed";
        updateYesNoCard();
      }
    }, roomSeconds(yn) * 1000));
  }

  function answerYesNo(value) {
    const yn = state.yn;
    if (!yn || yn.phase !== "round" || yn.mine || !roomChoices(yn).includes(value)) return;
    yn.mine = value;
    yn.answers[yn.role][yn.index] = value;
    if (yn.role === "guest") sendYesNo({ type: "answer", index: yn.index, value });
    updateYesNoCard();
  }

  function showReveal(index, host, guest) {
    const yn = state.yn;
    if (!yn) return;
    yn.index = index;
    yn.phase = "reveal";
    yn.reveal = { host, guest };
    state.view = "yn-card";
    render();
  }

  // Карточка перерисовывается целиком только при смене фазы, чтобы полоска
  // таймера шла плавно.
  function updateYesNoCard() {
    if (state.view !== "yn-card") return;
    if (state.yn?.kind === "loves") { render(); return; }
    const body = state.root?.querySelector(".glg-body");
    const actions = body?.querySelector(".glg-yn-actions");
    if (actions) actions.outerHTML = yesNoActions();
  }

  function yesNoActions() {
    const yn = state.yn;
    if (yn.phase === "round" && !yn.mine) {
      return `<div class="glg-yn-actions"><button class="glg-yn-button is-yes" type="button" data-action="yn-answer" data-value="yes">${escapeHtml(tr("ynYes"))}</button><button class="glg-yn-button is-no" type="button" data-action="yn-answer" data-value="no">${escapeHtml(tr("ynNo"))}</button></div>`;
    }
    if (yn.phase === "round" || (yn.phase === "closed" && yn.mine)) {
      return `<div class="glg-yn-actions"><p class="glg-yn-status">${escapeHtml(yn.mine === "yes" ? tr("ynYes") : tr("ynNo"))} · ${escapeHtml(tr("ynAnswered"))}</p></div>`;
    }
    if (yn.phase === "closed") return `<div class="glg-yn-actions"><p class="glg-yn-status">${escapeHtml(tr("ynMissed"))}</p></div>`;
    return `<div class="glg-yn-actions"></div>`;
  }

  // Полоска таймера продолжает с того места, где была, даже после перерисовки.
  function timerBar(yn) {
    const elapsed = Math.max(0, (Date.now() - (yn.roundStart || Date.now())) / 1000);
    return `<div class="glg-yn-timer" aria-hidden="true"><i style="animation-duration:${roomSeconds(yn)}s;animation-delay:-${elapsed.toFixed(2)}s"></i></div>`;
  }

  function renderLovesCard() {
    const yn = state.yn;
    const id = yn.deck[yn.index];
    const [topic, ...labels] = lovesSet(id);
    const partnerRole = yn.role === "host" ? "guest" : "host";
    const partnerName = (yn.role === "host" ? yn.guestName : yn.hostName) || tr("anonymous");
    const reveal = yn.phase === "reveal";
    const mine = reveal ? yn.reveal[yn.role] : yn.mine;
    const theirs = reveal && mine ? yn.reveal[partnerRole] : null;
    const tiles = LOVES_CHOICES.map((choice, index) => {
      const classes = ["glg-lv-tile"];
      if (mine === choice) classes.push("is-mine");
      if (theirs === choice) classes.push("is-partner");
      if (reveal && mine === choice && theirs === choice) classes.push("is-match");
      const badges = `${mine === choice ? `<b class="glg-lv-badge is-you">${escapeHtml(tr("ynYou"))}</b>` : ""}${theirs === choice ? `<b class="glg-lv-badge is-them">${escapeHtml(partnerName)}</b>` : ""}`;
      const open = yn.phase === "round" && !yn.mine;
      return `<button class="${classes.join(" ")}" type="button" data-action="yn-answer" data-value="${choice}"${open ? "" : " disabled"}>
        <span class="glg-lv-img" style="background-image:url('${lovesImage(id, choice)}')"></span>
        <span class="glg-lv-label">${escapeHtml(labels[index])}</span>${badges}
      </button>`;
    }).join("");
    let status = "";
    if (reveal) {
      if (!mine) status = tr("ynMissed");
      else if (!theirs) status = tr("ynPartnerMissed");
      else if (theirs === mine) status = `♥ ${tr("lvBoth", { item: labels[LOVES_CHOICES.indexOf(mine)] })}`;
      else status = tr("lvDiff");
    } else if (yn.mine) status = tr("ynAnswered");
    else if (yn.phase === "closed") status = tr("ynMissed");
    else status = tr("lvPick");
    return `
      <p class="glg-step">${escapeHtml(tr("lvRound", { n: yn.index + 1, total: yn.deck.length }))}</p>
      <h3 class="glg-lv-topic">${escapeHtml(topic)}</h3>
      ${reveal ? "" : timerBar(yn)}
      <div class="glg-lv-grid${reveal ? " is-revealed" : yn.mine ? " is-answered" : ""}">${tiles}</div>
      <p class="glg-yn-status glg-lv-status${reveal && theirs && theirs === mine ? " is-match" : ""}">${escapeHtml(status)}</p>`;
  }

  function renderYesNoCard() {
    const yn = state.yn;
    if (yn.kind === "loves") return renderLovesCard();
    const id = yn.deck[yn.index];
    const [text, yesText, noText] = yesNoCard(id);
    const art = YES_NO_ART_FILES[YES_NO_ART[id]] || YES_NO_ART_FILES.bears;
    const partnerRole = yn.role === "host" ? "guest" : "host";
    const partnerName = (yn.role === "host" ? yn.guestName : yn.hostName) || tr("anonymous");
    let reveal = "";
    if (yn.phase === "reveal") {
      const mine = yn.reveal[yn.role];
      const theirs = yn.reveal[partnerRole];
      if (!mine) {
        reveal = `<div class="glg-yn-reveal is-closed"><p>${escapeHtml(tr("ynMissed"))}</p></div>`;
      } else {
        const caption = theirs === "yes" ? yesText : theirs === "no" ? noText : "";
        const match = theirs && theirs === mine;
        reveal = `<div class="glg-yn-reveal${match ? " is-match" : ""}">
          ${match ? `<p class="glg-yn-match">${HEART} ${escapeHtml(tr("ynMatch"))}</p>` : ""}
          <p class="glg-yn-line"><b>${escapeHtml(partnerName)}</b> <span class="glg-yn-answer is-${escapeHtml(theirs || "none")}">${escapeHtml(theirs === "yes" ? tr("ynYes") : theirs === "no" ? tr("ynNo") : "—")}</span></p>
          ${caption ? `<p class="glg-yn-caption">${escapeHtml(caption)}</p>` : `<p class="glg-yn-caption is-missed">${escapeHtml(tr("ynPartnerMissed"))}</p>`}
          <p class="glg-yn-line is-mine"><b>${escapeHtml(tr("ynYou"))}</b> <span class="glg-yn-answer is-${escapeHtml(mine)}">${escapeHtml(mine === "yes" ? tr("ynYes") : tr("ynNo"))}</span></p>
        </div>`;
      }
    }
    return `
      <p class="glg-step">${escapeHtml(tr("ynRound", { n: yn.index + 1, total: yn.deck.length }))}</p>
      <article class="glg-yn-card${yn.phase === "reveal" ? " is-revealed" : ""}">
        <div class="glg-yn-art" style="background-image:url('${art}')" aria-hidden="true"></div>
        <h3>${escapeHtml(text)}</h3>
        ${yn.phase === "reveal" ? reveal : timerBar(yn)}
      </article>
      ${yn.phase === "reveal" ? "" : yesNoActions()}`;
  }

  function showYesNoEnd() {
    const yn = state.yn;
    if (!yn) return;
    clearYesNoTimers();
    yn.phase = "end";
    state.view = "yn-end";
    render();
  }

  function renderYesNoEnd() {
    const yn = state.yn;
    const total = yn.deck.length;
    const score = yn.deck.filter((_, index) => yn.answers.host[index] && yn.answers.host[index] === yn.answers.guest[index]).length;
    const ratio = total ? score / total : 0;
    return `
      <article class="glg-score">
        ${hearts(Math.round(ratio * 10), 10)}
        <p class="glg-score-number">${escapeHtml(tr("ynFinal", { score, total }))}</p>
        <h3>${escapeHtml(tr(yn.kind === "loves" ? (ratio >= 0.5 ? "lvFinalHigh" : "lvFinalMid") : (ratio >= 0.6 ? "ynFinalHigh" : "ynFinalMid")))}</h3>
      </article>
      ${yn.kind === "loves" && score ? `<section class="glg-section"><h3>${escapeHtml(tr("lvCommon"))}</h3><ul class="glg-lv-common">${yn.deck.map((id, index) => {
        const pick = yn.answers.host[index];
        if (!pick || pick !== yn.answers.guest[index]) return "";
        return `<li><i style="background-image:url('${lovesImage(id, pick)}')"></i><span>${escapeHtml(lovesSet(id)[LOVES_CHOICES.indexOf(pick) + 1])}</span></li>`;
      }).join("")}</ul></section>` : ""}
      <div class="glg-actions glg-stack">
        ${yn.role === "host" ? `<button class="glg-primary" type="button" data-action="yn-again"${yn.partnerOnline ? "" : " disabled"}>↻ ${escapeHtml(tr("ynAgain"))}</button>` : `<p class="glg-muted glg-center">${escapeHtml(tr("ynWaitHost", { name: yn.hostName }))}</p>`}
        <button class="glg-secondary" type="button" data-action="close">${escapeHtml(tr("home"))}</button>
      </div>`;
  }

  // ——— Вход на главной и окно покупки ———

  function updateBadge() {
    const badge = document.querySelector("#gamesResultsBadge");
    if (!badge) return;
    const count = unseenCount();
    badge.hidden = !count;
    badge.textContent = String(count);
  }

  function localizeHome() {
    const label = document.querySelector("#gamesOpenHomeLabel");
    if (label) label.textContent = tr("homeLink");
  }

  function localizePaywall() {
    const card = document.querySelector(".paywall-card");
    if (!card) return;
    const title = card.querySelector("#paywallTitle");
    if (title) title.innerHTML = tr("paywallTitle");
    let block = card.querySelector(".paywall-features");
    if (!block) {
      block = document.createElement("div");
      block.className = "paywall-features";
      const list = card.querySelector(":scope > ul");
      if (list) list.replaceWith(block);
      else card.querySelector("#paywallLead")?.after(block);
    }
    const group = (name, items) => `<section><h3>${escapeHtml(tr(name))}</h3><ul>${items.map(([key, soon]) => `<li${soon ? ' class="is-soon"' : ""}>${escapeHtml(tr(key))}${soon ? ` <span class="glg-chip">${escapeHtml(tr("soon"))}</span>` : ""}</li>`).join("")}</ul></section>`;
    block.innerHTML = group("groupGames", [["featQuiz"], ["featYesNo"], ["featLoves"], ["featGamesSoon2", true]]) + group("groupFun", [["featFunSoon", true]]) + group("groupLetters", [["featCollection"], ["featMoments"], ["featAudio"]]);
  }

  function localize() {
    localizeHome();
    localizePaywall();
    if (state.root && !state.root.hidden) render();
  }

  function init() {
    document.querySelector("#gamesOpenHome")?.addEventListener("click", () => open("hub"));
    localize();
    addEventListener("glowletter-language-changed", () => setTimeout(localize, 0));
    addEventListener("glowletter-access-change", () => { if (state.root && !state.root.hidden && state.view === "hub") render(); });
    addEventListener("glowletter-cloud-session", event => {
      if (event.detail?.signedIn) loadOwnData();
      else resetOwnData();
    });
    if (cloud()?.getState?.().signedIn) loadOwnData();
    const publicId = new URLSearchParams(location.search).get("quiz") || "";
    if (UUID_PATTERN.test(publicId)) startPlay(publicId.toLowerCase());
    const roomId = new URLSearchParams(location.search).get("yn") || "";
    if (!UUID_PATTERN.test(publicId) && UUID_PATTERN.test(roomId)) joinYesNoRoom(roomId.toLowerCase());
  }

  window.GlowLetterGames = Object.freeze({ open: () => open("hub"), play: publicId => UUID_PATTERN.test(publicId) && startPlay(publicId.toLowerCase()), questionIds: QUESTION_IDS });
  init();
})();
