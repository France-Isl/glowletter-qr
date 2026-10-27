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

  const QUESTION_IDS = Object.freeze(Array.from({ length: 24 }, (_, index) => `q${String(index + 1).padStart(2, "0")}`));
  const QUIZ_SIZE = 8;
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
      featMoments: "Моменты, напоминания и QR-письмо, которое откроется в нужный день", featAudio: "Своё аудио в письме и ответ получателя"
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
      featMoments: "Moments, reminders and a QR letter that opens on the right day", featAudio: "Your own audio in a letter and replies from the recipient"
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
      featMoments: "Moments, rappels et lettre QR qui s’ouvre le bon jour", featAudio: "Votre propre audio dans la lettre et la réponse du destinataire"
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
      q24: ["Что я закажу в кафе?", "Пасту", "Суши", "Салат", "Десерт"]
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
      q24: ["What would I order in a café?", "Pasta", "Sushi", "A salad", "Dessert"]
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
      q24: ["Que vais-je commander au café ?", "Des pâtes", "Des sushis", "Une salade", "Un dessert"]
    }
  };
  Object.entries(window.GLOWLETTER_GAMES_I18N || {}).forEach(([code, pack]) => {
    if (TEXT[code] || !pack || typeof pack !== "object") return;
    if (pack.text) TEXT[code] = pack.text;
    if (pack.questions) QUESTIONS[code] = pack.questions;
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
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const cleanName = value => String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, 36);
  const premium = () => Boolean(app()?.getState?.().premium);
  const signedIn = () => Boolean(cloud()?.getState?.().signedIn);
  const notify = (message, duration = 3600) => app()?.notify?.(message, duration);
  const shareBase = () => String(app()?.getState?.().publicShareUrl || appConfig().publicShareUrl || `${location.origin}${location.pathname}`);
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
    state.lastFocus?.focus?.({ preventScroll: true });
  }

  function render() {
    const root = state.root;
    if (!root) return;
    const isPlay = state.view.startsWith("play");
    root.classList.toggle("is-play", isPlay);
    root.querySelector("[data-glg=eyebrow]").textContent = isPlay ? tr("playEyebrow") : tr("eyebrow");
    root.querySelector("[data-glg=title]").textContent = isPlay ? tr("quizTitle") : tr("title");
    root.querySelector(".glg-close").setAttribute("aria-label", tr("close"));
    const body = root.querySelector(".glg-body");
    const views = { hub: renderHub, names: renderNames, answers: renderAnswers, created: renderCreated, detail: renderDetail, "play-loading": renderPlayLoading, "play-missing": renderPlayMissing, "play-intro": renderPlayIntro, "play-question": renderPlayQuestion, "play-result": renderPlayResult };
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
    const soon = ["duel", "loves", "cards", "who", "phrase"].map(key => `<li>${escapeHtml(tr(key))}</li>`).join("");
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
    block.innerHTML = group("groupGames", [["featQuiz"], ["featGamesSoon", true]]) + group("groupFun", [["featFunSoon", true]]) + group("groupLetters", [["featCollection"], ["featMoments"], ["featAudio"]]);
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
  }

  window.GlowLetterGames = Object.freeze({ open: () => open("hub"), play: publicId => UUID_PATTERN.test(publicId) && startPlay(publicId.toLowerCase()), questionIds: QUESTION_IDS });
  init();
})();
