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

  const QUESTION_IDS = Object.freeze(Array.from({ length: 99 }, (_, index) => `q${String(index + 1).padStart(2, "0")}`));
  const QUIZ_SIZE = 20;
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
      duel: "Дуэль «Кто быстрее»", loves: "Что мы любим", cards: "Карточки для половинки", who: "Кто из нас?", phrase: "Закончи фразу", truth: "Правда или ложь",
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
      ynTitle: "Да или нет", ynNote: "Живая игра вдвоём: на каждую карточку 5 секунд. Кто успел ответить — увидит ответ партнёра.", ynCreate: "Создать комнату", ynWaiting: "Ждём, когда {name} откроет ссылку…", ynWaitingAny: "Ждём партнёра…", ynShareText: "{name} зовёт тебя в живую игру «Да или нет»", ynPartnerHere: "{name} уже в игре!", ynStart: "Начать игру", ynWaitHost: "{name} сейчас начнёт игру", ynYes: "Да", ynNo: "Нет", ynMissed: "Не успели — карточка закрыта", ynMatch: "Совпали!", ynRound: "Карточка {n} из {total}", ynAnswered: "Ответ принят, ждём партнёра…", ynFinal: "Совпало {score} из {total}", ynFinalHigh: "Вы чувствуете друг друга с полуслова", ynFinalMid: "Вы такие разные — и такие близкие", ynAgain: "Сыграть ещё раз", ynLeft: "Партнёр отключился. Ждём возвращения…", ynYou: "Вы", ynOffline: "Не удаётся подключиться к игре. Проверьте интернет и откройте ссылку снова.", ynJoin: "Войти в игру", ynJoinLead: "{name} ждёт вас. На каждый ответ — 5 секунд!", ynStepNames: "Ваше имя и имя партнёра", ynRoomReady: "Комната готова — отправьте ссылку", ynStayHere: "Не закрывайте этот экран: игра начнётся, когда партнёр откроет ссылку.", featYesNo: "Живая игра «Да или нет» — 5 секунд на ответ", ynPartnerMissed: "Ответа нет — время вышло", lvTitle: "Что мы любим", lvNote: "Живая игра вдвоём: 4 картинки, у каждого 10 секунд выбрать, что ближе. Можно выбрать одно и то же!", lvShareText: "{name} зовёт тебя в живую игру «Что мы любим»", lvJoinLead: "{name} ждёт вас. Выбирайте картинку, которая вам ближе!", lvRound: "Тема {n} из {total}", lvPick: "Выберите, что вам ближе", lvBoth: "Вы оба выбрали: {item}", lvCommon: "Вы оба любите", lvDiff: "Разные вкусы — тем интереснее!", mcTitle: "Карточки с мишками", mcNote: "Живая игра на память вдвоём: по очереди открывайте по две карточки и ищите пары. Три уровня — от 8 до 16 карточек.", mcShareText: "{name} зовёт тебя в живую игру «Карточки с мишками»", mcJoinLead: "{name} ждёт вас. Ищите пары по очереди!", mcLevel: "Уровень {n} из {total}", mcTurnYou: "Ваш ход — откройте две карточки", mcTurnThem: "Ходит {name}", mcPairs: "Пар найдено: {found} из {total}", mcLevelDone: "Все пары найдены!", mcTimeUp: "Время уровня вышло", mcNext: "Дальше — уровень {n}", mcFinal: "Найдено пар: {found} из {total}", mcFinalHigh: "Отличная команда!", mcFinalMid: "Хорошая игра — давайте ещё!", featCards: "Живая игра «Карточки с мишками» — ищите пары вдвоём", featGamesSoon3: "Дуэль «Кто быстрее»", lvFinalHigh: "У вас так много общего!", lvFinalMid: "Вы такие разные — и этим дополняете друг друга", featLoves: "Живая игра «Что мы любим» — 4 картинки, выбирайте вместе", featGamesSoon2: "Дуэль «Кто быстрее» и карточки с мишками",
      duTitle: "Кто быстрее", duNote: "Живая дуэль: одно слово и четыре картинки. Первым нажмите нужную — ошибка стоит раунда.", duShareText: "{name} вызывает тебя на живую дуэль «Кто быстрее»", duJoinLead: "{name} ждёт вас. Найдите нужную картинку быстрее!", duRound: "Раунд {n} из {total}", duFind: "Найдите: {item}", duYouWon: "Вы были быстрее!", duTheyWon: "Быстрее: {name}", duWrong: "Не та картинка — раунд проигран", duNobody: "Никто не успел", duScore: "Вы {you} : {them} {name}", duFinalWin: "Победа! Сегодня у вас зоркий глаз.", duFinalLose: "В этот раз победа за {name} — реванш?", duFinalDraw: "Ничья — вы на равных!", duSeconds: "{s} с", featDuel: "Живая дуэль «Кто быстрее» — найдите картинку первым", whoTitle: "Кто из нас?", whoNote: "Живая игра вдвоём: один вопрос — нажмите «Я» или имя партнёра. Узнайте, совпадают ли ваши мнения.", whoShareText: "{name} зовёт тебя в живую игру «Кто из нас?»", whoJoinLead: "{name} ждёт вас. Отвечайте честно — потом сравните!", whoRound: "Вопрос {n} из {total}", whoMe: "Я", whoAgree: "Вы согласны: {name}", whoDiffer: "Мнения разошлись — обсудите!", whoFinal: "Совпало {score} из {total}", whoFinalHigh: "Вы так хорошо видите друг друга!", whoFinalMid: "Есть о чём поговорить — и это прекрасно", featWho: "Живая игра «Кто из нас?» — совпадают ли мнения", phTitle: "Закончи фразу", phNote: "Живая игра вдвоём: оба заканчивают одну тёплую фразу своими словами, а потом читают ответы друг друга.", phShareText: "{name} зовёт тебя в живую игру «Закончи фразу»", phJoinLead: "{name} ждёт вас. Заканчивайте фразы своими словами!", phRound: "Фраза {n} из {total}", phPlaceholder: "Ваше продолжение…", phDone: "Готово", phWaiting: "Ждём, что напишет {name}…", phSkipped: "Без ответа", phSave: "Сохранить в «Книгу пары»", phSaved: "Сохранено в «Книге пары»", phForbidden: "Напишите без ссылок и грубых слов.", phNext: "Следующая фраза", phFinal: "Фраз закончено вместе: {count}", phFinalLead: "Сохраните самые тёплые ответы в «Книгу пары».", featPhrase: "Живая игра «Закончи фразу» с «Книгой пары»", bookTitle: "Книга пары", bookNote: "Самые тёплые ответы из «Закончи фразу» — хранятся в вашем аккаунте.", bookOpen: "Открыть книгу", bookEmpty: "Пока книга пуста. Сыграйте в «Закончи фразу» и сохраните ответы, которые понравились.", bookDelete: "Удалить", bookDeleteConfirm: "Удалить эту страницу из книги?", bookYou: "Вы", inviteTitle: "Позвать друга", inviteNote: "Друг получит сообщение с игрой.", invite: "Позвать", invited: "Позвали", inviteNone: "Добавьте друзей в разделе «Друзья» — и зовите их в игру одним нажатием.", inviteSent: "Приглашение отправлено: {name}",
      tfTitle: "Правда или ложь", tfNote: "Живая игра вдвоём: интересные факты о мире. 12 секунд — правда это или ложь? Очко за каждый верный ответ.", tfShareText: "{name} зовёт тебя в живую игру «Правда или ложь»", tfJoinLead: "{name} ждёт вас. Правда или ложь — решайте быстро!", tfRound: "Факт {n} из {total}", tfTrue: "Правда", tfFalse: "Ложь", tfIsTrue: "Это правда!", tfIsFalse: "Это ложь!", tfFirstYou: "Вы первыми ответили верно!", tfFirstThem: "Первым верно ответил игрок {name}", tfFinalWin: "Победа! Вы знаете о мире больше.", tfFinalLose: "В этот раз больше знает {name} — реванш?", tfFinalDraw: "Ничья — вы знаете одинаково много!", featTruth: "Живая игра «Правда или ложь» — интересные факты о мире"
    },
    en: {
      homeLink: "Games for two", eyebrow: "GLOWLETTER · GAMES FOR TWO", title: "Play together", close: "Close",
      lead: "Send a game to someone dear to you. Playing from a link is free and needs no account.",
      quizTitle: "How well do you know me?", quizNote: "Answer questions about yourself and let someone close try to guess. The result comes back to you.",
      create: "Create a quiz", soon: "Soon", soonTitle: "More games on the way",
      duel: "“Who’s faster” duel", loves: "What we love", cards: "Memory cards for two", who: "Which of us?", phrase: "Finish the sentence", truth: "True or false",
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
      ynTitle: "Yes or no", ynNote: "A live game for two: 5 seconds for each card. Answer in time to see your partner’s answer.", ynCreate: "Create a room", ynWaiting: "Waiting for {name}…", ynWaitingAny: "Waiting for your partner…", ynShareText: "{name} invites you to the live game “Yes or no”", ynPartnerHere: "{name} is here!", ynStart: "Start the game", ynWaitHost: "{name} is about to start the game", ynYes: "Yes", ynNo: "No", ynMissed: "Too late — this card stays closed", ynMatch: "A match!", ynRound: "Card {n} of {total}", ynAnswered: "Answer sent, waiting for your partner…", ynFinal: "{score} of {total} matched", ynFinalHigh: "You understand each other without words", ynFinalMid: "So different — and so close", ynAgain: "Play again", ynLeft: "Your partner disconnected. Waiting for them to come back…", ynYou: "You", ynOffline: "Can’t connect to the game. Check your connection and open the link again.", ynJoin: "Join the game", ynJoinLead: "{name} is waiting for you. 5 seconds for each answer!", ynStepNames: "Your name and your partner’s", ynRoomReady: "The room is ready — send the link", ynStayHere: "Keep this screen open: the game starts when your partner opens the link.", featYesNo: "Live game “Yes or no” — 5 seconds per answer", ynPartnerMissed: "No answer — time ran out", lvTitle: "What we love", lvNote: "A live game for two: 4 pictures, 10 seconds each to pick what you love most. You can pick the same one!", lvShareText: "{name} invites you to the live game “What we love”", lvJoinLead: "{name} is waiting for you. Pick the picture you love most!", lvRound: "Topic {n} of {total}", lvPick: "Pick what you love most", lvBoth: "You both picked: {item}", lvCommon: "You both love", lvDiff: "Different tastes — even more interesting!", mcTitle: "Memory cards with bears", mcNote: "A live memory game for two: take turns opening two cards and find the pairs. Three levels, from 8 to 16 cards.", mcShareText: "{name} invites you to the live game “Memory cards with bears”", mcJoinLead: "{name} is waiting for you. Take turns finding pairs!", mcLevel: "Level {n} of {total}", mcTurnYou: "Your turn — open two cards", mcTurnThem: "{name}’s turn", mcPairs: "Pairs found: {found} of {total}", mcLevelDone: "All pairs found!", mcTimeUp: "Time is up for this level", mcNext: "Next: level {n}", mcFinal: "Pairs found: {found} of {total}", mcFinalHigh: "A wonderful team!", mcFinalMid: "Nice game — let’s play again!", featCards: "Live game “Memory cards with bears” — find pairs together", featGamesSoon3: "“Who’s faster” duel", lvFinalHigh: "You have so much in common!", lvFinalMid: "So different — and you complete each other", featLoves: "Live game “What we love” — 4 pictures, choose together", featGamesSoon2: "“Who’s faster” duel and memory cards with bears",
      duTitle: "Who’s faster", duNote: "A live duel: one word and four pictures. Tap the right picture first — a wrong tap loses the round.", duShareText: "{name} challenges you to the live duel “Who’s faster”", duJoinLead: "{name} is waiting for you. Find the right picture faster!", duRound: "Round {n} of {total}", duFind: "Find: {item}", duYouWon: "You were faster!", duTheyWon: "{name} was faster", duWrong: "Wrong picture — this round is lost", duNobody: "Nobody found it in time", duScore: "You {you} : {them} {name}", duFinalWin: "Victory! Sharp eyes today.", duFinalLose: "{name} wins this time — rematch?", duFinalDraw: "A draw — perfectly matched!", duSeconds: "{s} s", featDuel: "Live duel “Who’s faster” — find the picture first", whoTitle: "Which of us?", whoNote: "A live game for two: one question, tap “Me” or your partner’s name. See if you agree about each other.", whoShareText: "{name} invites you to the live game “Which of us?”", whoJoinLead: "{name} is waiting for you. Answer honestly — then compare!", whoRound: "Question {n} of {total}", whoMe: "Me", whoAgree: "You agree: {name}", whoDiffer: "Opinions differ — talk it over!", whoFinal: "You agreed {score} times out of {total}", whoFinalHigh: "You see each other so clearly!", whoFinalMid: "Lots to talk about — and that’s lovely", featWho: "Live game “Which of us?” — see if you agree", phTitle: "Finish the sentence", phNote: "A live game for two: both finish the same warm sentence in your own words, then read each other’s answers.", phShareText: "{name} invites you to the live game “Finish the sentence”", phJoinLead: "{name} is waiting for you. Finish each sentence in your own words!", phRound: "Sentence {n} of {total}", phPlaceholder: "Your ending…", phDone: "Done", phWaiting: "Waiting for {name}…", phSkipped: "No answer", phSave: "Save to the couple’s book", phSaved: "Saved in the couple’s book", phForbidden: "Please write it without links or rude words.", phNext: "Next sentence", phFinal: "Sentences finished together: {count}", phFinalLead: "Save the answers you like most to the couple’s book.", featPhrase: "Live game “Finish the sentence” with a couple’s book", bookTitle: "Couple’s book", bookNote: "The warmest answers from “Finish the sentence”, kept in your account.", bookOpen: "Open the book", bookEmpty: "The book is empty for now. Play “Finish the sentence” and save the answers you like.", bookDelete: "Delete", bookDeleteConfirm: "Delete this page from the book?", bookYou: "You", inviteTitle: "Invite a friend", inviteNote: "Your friend will get a message with the game.", invite: "Invite", invited: "Invited", inviteNone: "Add friends in the “Friends” section to invite them in one tap.", inviteSent: "Invitation sent to {name}",
      tfTitle: "True or false", tfNote: "A live game for two: amazing facts about the world. 12 seconds — true or false? A point for every right answer.", tfShareText: "{name} invites you to the live game “True or false”", tfJoinLead: "{name} is waiting for you. True or false — decide fast!", tfRound: "Fact {n} of {total}", tfTrue: "True", tfFalse: "False", tfIsTrue: "It’s true!", tfIsFalse: "It’s false!", tfFirstYou: "You were right first!", tfFirstThem: "{name} was right first", tfFinalWin: "Victory! You know more about the world.", tfFinalLose: "{name} knows more this time — rematch?", tfFinalDraw: "A draw — you know just as much!", featTruth: "Live game “True or false” — amazing facts about the world"
    },
    fr: {
      homeLink: "Jeux à deux", eyebrow: "GLOWLETTER · JEUX À DEUX", title: "Jouez ensemble", close: "Fermer",
      lead: "Envoyez un jeu à quelqu’un qui vous est cher. Jouer depuis un lien est gratuit et sans compte.",
      quizTitle: "Me connais-tu vraiment ?", quizNote: "Répondez à des questions sur vous, et un proche essaie de deviner. Le résultat vous revient.",
      create: "Créer un quiz", soon: "Bientôt", soonTitle: "D’autres jeux arrivent",
      duel: "Duel « Le plus rapide »", loves: "Ce que nous aimons", cards: "Cartes mémoire à deux", who: "Qui de nous deux ?", phrase: "Termine la phrase", truth: "Vrai ou faux",
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
      ynTitle: "Oui ou non", ynNote: "Un jeu en direct à deux : 5 secondes par carte. Répondez à temps pour voir la réponse de l’autre.", ynCreate: "Créer une salle", ynWaiting: "En attente de {name}…", ynWaitingAny: "En attente de l’autre joueur…", ynShareText: "{name} t’invite au jeu en direct « Oui ou non »", ynPartnerHere: "{name} est là !", ynStart: "Lancer la partie", ynWaitHost: "{name} va lancer la partie", ynYes: "Oui", ynNo: "Non", ynMissed: "Trop tard — cette carte reste fermée", ynMatch: "Même réponse !", ynRound: "Carte {n} sur {total}", ynAnswered: "Réponse envoyée, en attente de l’autre…", ynFinal: "{score} sur {total} en commun", ynFinalHigh: "Vous vous comprenez sans un mot", ynFinalMid: "Si différents — et si proches", ynAgain: "Rejouer", ynLeft: "L’autre joueur s’est déconnecté. On attend son retour…", ynYou: "Vous", ynOffline: "Connexion au jeu impossible. Vérifiez internet et rouvrez le lien.", ynJoin: "Rejoindre la partie", ynJoinLead: "{name} vous attend. 5 secondes pour chaque réponse !", ynStepNames: "Votre prénom et celui de l’autre", ynRoomReady: "La salle est prête — envoyez le lien", ynStayHere: "Gardez cet écran ouvert : la partie commence quand l’autre ouvre le lien.", featYesNo: "Jeu en direct « Oui ou non » — 5 secondes par réponse", ynPartnerMissed: "Pas de réponse — le temps est écoulé", lvTitle: "Ce que nous aimons", lvNote: "Un jeu en direct à deux : 4 images, 10 secondes pour choisir ce que vous préférez. Vous pouvez choisir la même !", lvShareText: "{name} t’invite au jeu en direct « Ce que nous aimons »", lvJoinLead: "{name} vous attend. Choisissez l’image que vous préférez !", lvRound: "Thème {n} sur {total}", lvPick: "Choisissez ce que vous préférez", lvBoth: "Vous avez choisi tous les deux : {item}", lvCommon: "Vous aimez tous les deux", lvDiff: "Des goûts différents — c’est encore plus intéressant !", mcTitle: "Cartes mémoire aux oursons", mcNote: "Un jeu de mémoire en direct à deux : retournez deux cartes chacun votre tour et trouvez les paires. Trois niveaux, de 8 à 16 cartes.", mcShareText: "{name} t’invite au jeu en direct « Cartes mémoire aux oursons »", mcJoinLead: "{name} vous attend. Trouvez les paires chacun votre tour !", mcLevel: "Niveau {n} sur {total}", mcTurnYou: "À vous — retournez deux cartes", mcTurnThem: "Au tour de {name}", mcPairs: "Paires trouvées : {found} sur {total}", mcLevelDone: "Toutes les paires sont trouvées !", mcTimeUp: "Le temps du niveau est écoulé", mcNext: "Ensuite : niveau {n}", mcFinal: "Paires trouvées : {found} sur {total}", mcFinalHigh: "Une équipe formidable !", mcFinalMid: "Belle partie — on rejoue ?", featCards: "Jeu en direct « Cartes mémoire aux oursons » — trouvez les paires à deux", featGamesSoon3: "Duel « Le plus rapide »", lvFinalHigh: "Vous avez tant de choses en commun !", lvFinalMid: "Si différents — et vous vous complétez", featLoves: "Jeu en direct « Ce que nous aimons » — 4 images, choisissez ensemble", featGamesSoon2: "Duel « Le plus rapide » et cartes mémoire avec des oursons",
      duTitle: "Le plus rapide", duNote: "Un duel en direct : un mot et quatre images. Touchez la bonne image en premier — une erreur coûte la manche.", duShareText: "{name} te défie au duel en direct « Le plus rapide »", duJoinLead: "{name} vous attend. Trouvez la bonne image plus vite !", duRound: "Manche {n} sur {total}", duFind: "Trouvez : {item}", duYouWon: "Vous avez été plus rapide !", duTheyWon: "Plus rapide : {name}", duWrong: "Mauvaise image — manche perdue", duNobody: "Personne n’a trouvé à temps", duScore: "Vous {you} : {them} {name}", duFinalWin: "Victoire ! Quel coup d’œil aujourd’hui.", duFinalLose: "Cette fois, la victoire revient à {name} — revanche ?", duFinalDraw: "Égalité — parfaitement assortis !", duSeconds: "{s} s", featDuel: "Duel en direct « Le plus rapide » — trouvez l’image en premier", whoTitle: "Qui de nous deux ?", whoNote: "Un jeu en direct à deux : une question, touchez « Moi » ou le prénom de l’autre. Voyez si vous êtes d’accord.", whoShareText: "{name} t’invite au jeu en direct « Qui de nous deux ? »", whoJoinLead: "{name} vous attend. Répondez sincèrement — puis comparez !", whoRound: "Question {n} sur {total}", whoMe: "Moi", whoAgree: "Vous êtes d’accord : {name}", whoDiffer: "Avis différents — parlez-en !", whoFinal: "D’accord {score} fois sur {total}", whoFinalHigh: "Vous vous voyez si bien l’un l’autre !", whoFinalMid: "De quoi bavarder — et c’est très bien", featWho: "Jeu en direct « Qui de nous deux ? » — êtes-vous d’accord ?", phTitle: "Termine la phrase", phNote: "Un jeu en direct à deux : chacun termine la même phrase tendre avec ses mots, puis vous lisez vos réponses.", phShareText: "{name} t’invite au jeu en direct « Termine la phrase »", phJoinLead: "{name} vous attend. Terminez chaque phrase avec vos mots !", phRound: "Phrase {n} sur {total}", phPlaceholder: "Votre suite…", phDone: "Terminé", phWaiting: "En attente de {name}…", phSkipped: "Pas de réponse", phSave: "Garder dans le livre du couple", phSaved: "Gardé dans le livre du couple", phForbidden: "Écrivez sans liens ni mots grossiers.", phNext: "Phrase suivante", phFinal: "Phrases terminées ensemble : {count}", phFinalLead: "Gardez vos réponses préférées dans le livre du couple.", featPhrase: "Jeu en direct « Termine la phrase » avec le livre du couple", bookTitle: "Livre du couple", bookNote: "Les plus belles réponses de « Termine la phrase », gardées dans votre compte.", bookOpen: "Ouvrir le livre", bookEmpty: "Le livre est vide pour l’instant. Jouez à « Termine la phrase » et gardez les réponses qui vous plaisent.", bookDelete: "Supprimer", bookDeleteConfirm: "Supprimer cette page du livre ?", bookYou: "Vous", inviteTitle: "Inviter un ami", inviteNote: "Votre ami recevra un message avec le jeu.", invite: "Inviter", invited: "Invité", inviteNone: "Ajoutez des amis dans la rubrique « Amis » pour les inviter d’un geste.", inviteSent: "Invitation envoyée à {name}",
      tfTitle: "Vrai ou faux", tfNote: "Un jeu en direct à deux : des faits étonnants sur le monde. 12 secondes — vrai ou faux ? Un point par bonne réponse.", tfShareText: "{name} t’invite au jeu en direct « Vrai ou faux »", tfJoinLead: "{name} vous attend. Vrai ou faux — décidez vite !", tfRound: "Fait {n} sur {total}", tfTrue: "Vrai", tfFalse: "Faux", tfIsTrue: "C’est vrai !", tfIsFalse: "C’est faux !", tfFirstYou: "Vous avez trouvé en premier !", tfFirstThem: "{name} a trouvé en premier", tfFinalWin: "Victoire ! Vous en savez plus sur le monde.", tfFinalLose: "Cette fois, {name} en sait plus — revanche ?", tfFinalDraw: "Égalité — vous en savez autant l’un que l’autre !", featTruth: "Jeu en direct « Vrai ou faux » — des faits étonnants sur le monde"
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
      q07: ["Я скорее…", "Жаворонок", "Сова", "Сплю, когда получится", "Люблю дневной сон"],
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
      q32: ["Как я отношусь к сюрпризам?", "Очень люблю", "Немного волнуюсь", "Люблю устраивать их другим", "Предпочитаю знать заранее"],
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
      q32: ["Qu’est-ce que je pense des surprises ?", "Je les aime beaucoup", "Elles me rendent un peu fébrile", "J’aime en faire aux autres", "Je préfère savoir à l’avance"],
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
    // Прежние картинки (по просьбе владельца пока скрыты, вернуть потом):
    // c01 hug, c03 sunrise, c06 dance, c09 picnic, c12 dance, c18 kitchen, c22 hug, c26 hug, c31 picnic,
    // c32 hug, c36 sunrise, c39 hug; скрытые карточки: c04 hug, c05 sea, c10 kitchen, c13 picnic, c15 hug,
    // c16 rain, c21 dance, c24 sunrise, c27 sea, c29 hug, c33 kitchen, c35 skating.
    c01: "s03d", c02: "roses", c03: "s16d", c04: "hug", c05: "sea", c06: "s02d", c07: "bears", c08: "bears",
    c09: "s09a", c10: "kitchen", c11: "kitten", c12: "s04c", c13: "picnic", c14: "letter", c15: "hug", c16: "rain",
    c17: "bears", c18: "s05c", c19: "kitten", c20: "bears", c21: "dance", c22: "s08c", c23: "bears", c24: "sunrise",
    c25: "letter", c26: "s15a", c27: "sea", c28: "letter", c29: "hug", c30: "roses", c31: "s11c", c32: "s04b",
    c33: "kitchen", c34: "bears", c35: "skating", c36: "s07a", c37: "kitten", c38: "roses", c39: "s08a", c40: "kitten"
  });
  const YES_NO_IDS = Object.freeze(Array.from({ length: 90 }, (_, index) => `c${String(index + 1).padStart(2, "0")}`));
  const YES_NO_ROUNDS = 40;
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
      c09: ["Любишь мои сюрпризы?", "очень любит твои сюрпризы", "любит, когда ты просто рядом"],
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
      c09: ["Do you love my surprises?", "really loves your surprises", "loves it when you’re simply near"],
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
      c09: ["Tu aimes mes surprises ?", "aime beaucoup tes surprises", "aime surtout quand tu es là"],
      c10: ["On fait une tarte ensemble ?", "met déjà son tablier", "préfère acheter un gâteau"],
      c11: ["On regarde un film ce soir ?", "choisit déjà le film", "préfère simplement discuter"],
      c12: ["Tu aimes ma voix ?", "pourrait l’écouter sans fin", "préfère encore ton rire"],
      c13: ["On fait un pique-nique ce week-end ?", "prépare le plaid", "propose un café douillet"],
      c14: ["Tu veux recevoir une lettre de moi ?", "attend ta lettre", "veut tout entendre de vive voix"],
      c15: ["Je compte beaucoup pour toi ?", "tu comptes énormément", "tu comptes plus que tu ne crois"],
      c16: ["On se promène sous la pluie ?", "prend un parapluie pour deux", "préparera du thé à la maison"],
      c17: ["On se ressemble ?", "vous êtes deux moitiés", "vous vous complétez à merveille"],
      c18: ["Tu aimes ma cuisine ?", "en redemande", "aime cuisiner avec toi"],
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
  const LOVES_ROUNDS = 40;
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

  // «Кто из нас?» — 40 вопросов, «Закончи фразу» — 30 начал фраз. ru, en, fr здесь,
  // остальные языки — в games-i18n.js (who, phrases).
  const WHO = {
    ru: ["Кто из нас чаще опаздывает?", "Кто первым мирится?", "Кто лучше готовит?", "Кто чаще смеётся?", "Кто дольше собирается?", "Кто чаще теряет ключи?", "Кто лучше помнит важные даты?", "Кто больше любит сладкое?", "Кто первым засыпает?", "Кто раньше встаёт утром?", "Кто чаще говорит «я скучаю»?", "Кто лучше выбирает подарки?", "Кто чаще шутит?", "Кто лучше водит машину?", "Кто дольше говорит по телефону?", "Кто больше любит путешествовать?", "Кто быстрее обижается?", "Кто быстрее прощает?", "Кто чаще фотографирует?", "Кто бережливее?", "Кто чаще покупает лишнее?", "Кто лучше утешает?", "Кто спокойнее в трудную минуту?", "Кто чаще ищет свой телефон?", "Кто больше любит принимать гостей?", "Кто чаще готовит завтрак?", "Кто лучше ориентируется в незнакомом городе?", "Кто пишет более длинные сообщения?", "Кто первым предлагает погулять?", "Кто больше любит животных?", "Кто лучше хранит секреты?", "Кто дольше выбирает блюдо в кафе?", "Кто больше переживает за близких?", "Кто чаще делает сюрпризы?", "Кто лучше наводит порядок?", "Кто первым замечает новую причёску?", "Кто чаще вспоминает смешные истории?", "Кто терпеливее?", "Кто чаще говорит «спасибо»?", "Кто первым предлагает помощь?"],
    en: ["Which of us is late more often?", "Which of us makes peace first?", "Which of us cooks better?", "Which of us laughs more often?", "Which of us takes longer to get ready?", "Which of us loses the keys more often?", "Which of us remembers important dates better?", "Which of us has the sweeter tooth?", "Which of us falls asleep first?", "Which of us gets up earlier?", "Which of us says “I miss you” more often?", "Which of us chooses better gifts?", "Which of us jokes more often?", "Which of us drives better?", "Which of us talks longer on the phone?", "Which of us loves travelling more?", "Which of us gets hurt more easily?", "Which of us forgives faster?", "Which of us takes more photos?", "Which of us is better with money?", "Which of us buys things we don’t need more often?", "Which of us is better at comforting?", "Which of us stays calmer in hard moments?", "Which of us is always looking for their phone?", "Which of us loves having guests more?", "Which of us makes breakfast more often?", "Which of us finds the way better in a new city?", "Which of us writes longer messages?", "Which of us suggests a walk first?", "Which of us loves animals more?", "Which of us keeps secrets better?", "Which of us takes longer to choose from a menu?", "Which of us worries more about loved ones?", "Which of us makes more surprises?", "Which of us is tidier?", "Which of us notices a new haircut first?", "Which of us remembers funny stories more often?", "Which of us is more patient?", "Which of us says “thank you” more often?", "Which of us offers help first?"],
    fr: ["Qui de nous deux est le plus souvent en retard ?", "Qui de nous deux fait la paix en premier ?", "Qui de nous deux cuisine le mieux ?", "Qui de nous deux rit le plus souvent ?", "Qui de nous deux met le plus de temps à se préparer ?", "Qui de nous deux perd le plus souvent les clés ?", "Qui de nous deux retient le mieux les dates importantes ?", "Qui de nous deux est le plus gourmand ?", "Qui de nous deux s’endort en premier ?", "Qui de nous deux se lève le plus tôt ?", "Qui de nous deux dit le plus souvent « tu me manques » ?", "Qui de nous deux choisit les meilleurs cadeaux ?", "Qui de nous deux plaisante le plus souvent ?", "Qui de nous deux conduit le mieux ?", "Qui de nous deux parle le plus longtemps au téléphone ?", "Qui de nous deux aime le plus voyager ?", "Qui de nous deux se vexe le plus vite ?", "Qui de nous deux pardonne le plus vite ?", "Qui de nous deux prend le plus de photos ?", "Qui de nous deux gère le mieux l’argent ?", "Qui de nous deux achète le plus souvent des choses inutiles ?", "Qui de nous deux sait le mieux consoler ?", "Qui de nous deux reste le plus calme dans les moments difficiles ?", "Qui de nous deux cherche toujours son téléphone ?", "Qui de nous deux aime le plus recevoir des invités ?", "Qui de nous deux prépare le plus souvent le petit-déjeuner ?", "Qui de nous deux s’oriente le mieux dans une ville inconnue ?", "Qui de nous deux écrit les messages les plus longs ?", "Qui de nous deux propose une promenade en premier ?", "Qui de nous deux aime le plus les animaux ?", "Qui de nous deux garde le mieux les secrets ?", "Qui de nous deux met le plus de temps à choisir au restaurant ?", "Qui de nous deux s’inquiète le plus pour ses proches ?", "Qui de nous deux fait le plus de surprises ?", "Qui de nous deux est le plus ordonné ?", "Qui de nous deux remarque en premier une nouvelle coiffure ?", "Qui de nous deux se souvient le plus des histoires drôles ?", "Qui de nous deux est le plus patient ?", "Qui de nous deux dit le plus souvent « merci » ?", "Qui de nous deux propose son aide en premier ?"],
  };
  const PHRASES = {
    ru: ["Я улыбаюсь, когда ты…", "Мой любимый день с тобой — это…", "Спасибо тебе за…", "Когда мне грустно, мне помогает…", "Я хочу, чтобы однажды мы вместе…", "Самое тёплое воспоминание о нас — …", "Ты лучше всех умеешь…", "Мне спокойно, когда…", "Если бы у нас был целый свободный день, мы бы…", "Я горжусь тобой, потому что…", "Наш идеальный вечер — это…", "Я никогда не забуду, как ты…", "Мне нравится, когда ты говоришь…", "В следующем году я хочу, чтобы мы…", "Ты для меня как…", "Лучший подарок от тебя — это…", "Я скучаю по тебе, когда…", "Мы смешнее всего, когда…", "Мне давно хочется сказать тебе…", "Наше место — это…", "Когда я думаю о тебе, я…", "Ты делаешь мой день лучше, когда…", "Мне нравится наша привычка…", "Моё желание для нас: …", "Самое смешное, что с нами случалось, — …", "Я чувствую твою заботу, когда ты…", "Утро с тобой — это…", "Если описать нас одним словом, это…", "Я хочу научиться у тебя…", "Спасибо, что ты всегда…"],
    en: ["I smile when you…", "My favourite day with you is…", "Thank you for…", "When I’m sad, what helps me is…", "One day I want us to…", "The warmest memory of us is…", "You are the best at…", "I feel calm when…", "If we had a whole free day, we would…", "I’m proud of you because…", "Our perfect evening is…", "I will never forget how you…", "I like it when you say…", "Next year I want us to…", "To me, you are like…", "The best gift from you is…", "I miss you when…", "We are funniest when…", "I’ve long wanted to tell you…", "Our place is…", "When I think of you, I…", "You make my day better when…", "I like our habit of…", "My wish for us: …", "The funniest thing that happened to us is…", "I feel your care when you…", "A morning with you is…", "If we were one word, it would be…", "I want to learn from you how to…", "Thank you for always…"],
    fr: ["Je souris quand tu…", "Ma journée préférée avec toi, c’est…", "Merci pour…", "Quand je suis triste, ce qui m’aide, c’est…", "Un jour, je veux que nous…", "Le plus tendre souvenir de nous, c’est…", "Personne ne sait mieux que toi…", "Tout est paisible quand…", "Si nous avions toute une journée libre, nous…", "Ce que j’admire chez toi, c’est…", "Notre soirée idéale, c’est…", "Je n’oublierai jamais comment tu…", "J’aime quand tu dis…", "L’année prochaine, je veux que nous…", "Pour moi, tu es comme…", "Le plus beau cadeau de ta part, c’est…", "Tu me manques quand…", "Nous sommes les plus drôles quand…", "Depuis longtemps, j’ai envie de te dire…", "Notre endroit, c’est…", "Quand je pense à toi, je…", "Tu rends ma journée plus belle quand…", "J’aime notre habitude de…", "Mon vœu pour nous : …", "La chose la plus drôle qui nous soit arrivée, c’est…", "Je sens que tu prends soin de moi quand tu…", "Un matin avec toi, c’est…", "Si nous étions un seul mot, ce serait…", "Je veux apprendre de toi à…", "Merci d’être toujours…"],
  };
  Object.entries(window.GLOWLETTER_GAMES_I18N || {}).forEach(([code, pack]) => {
    if (!WHO[code] && Array.isArray(pack?.who) && pack.who.length >= 40) WHO[code] = pack.who;
    if (!PHRASES[code] && Array.isArray(pack?.phrases) && pack.phrases.length >= 30) PHRASES[code] = pack.phrases;
  });
  // «Правда или ложь»: [утверждение, правда ли это, короткий факт]. ru, en, fr здесь, остальные — в games-i18n.js (truth).
  const TRUTH = { ru: {}, en: {}, fr: {} };
  Object.entries(window.GLOWLETTER_GAMES_I18N || {}).forEach(([code, pack]) => {
    if (!TRUTH[code] && pack?.truth && typeof pack.truth === "object") TRUTH[code] = pack.truth;
  });
  const TRUTH_IDS = Object.freeze(Array.from({ length: 60 }, (_, index) => `t${String(index + 1).padStart(2, "0")}`));
  const WHO_IDS = Object.freeze(Array.from({ length: 85 }, (_, index) => `w${String(index + 1).padStart(2, "0")}`));
  const PHRASE_IDS = Object.freeze(Array.from({ length: 70 }, (_, index) => `p${String(index + 1).padStart(2, "0")}`));

  // Скромный режим (28.10, просьба владельца): карточки про объятия, танцы, свидания,
  // завтрак в постель и «скучаю» пока не выпадают в играх. Тексты и картинки НЕ удалены —
  // чтобы вернуть, достаточно убрать id из этого списка.
  const HIDDEN = new Set([
    "c04", "c05", "c10", "c11", "c13", "c15", "c16", "c19", "c21", "c24", "c25", "c27", "c28", "c29", "c33", "c35", "c40",
    "s13", "s14",
    "q06", "q22", "q23", "q31", "q41", "q59", "q60",
    "w09", "w10", "w11", "w26",
    "p11", "p17", "p27",
    // Вторая волна (28.10): всё про чувства, «рядом», общие фото, портреты, внешность.
    "c01", "c03", "c07", "c08", "c09", "c12", "c17", "c22", "c23", "c31", "c36", "c37", "c39",
    "q08", "q27", "q35", "q42", "q46", "q58",
    "w36",
    "p02", "p05", "p06", "p09", "p12", "p13", "p14", "p15", "p19", "p20", "p21", "p24", "p28"
  ]);
  const shown = ids => ids.filter(id => !HIDDEN.has(id) && !HIDDEN.has(id.slice(0, 3)));

  // 2.4.23 (28.10): много новых скромных карточек — про еду, природу, страны, привычки.
  // ru, en, fr здесь; остальные языки — в games-i18n.js (пока их нет, показывается английский).
  const YES_NO_ART_MORE = Object.freeze({"c41":"s05d","c42":"s16a","c43":"s04a","c44":"s10b","c45":"s05c","c46":"s05c","c47":"s09a","c48":"s09c","c49":"s01b","c50":"s16c","c51":"s03c","c52":"s06b","c53":"s16b","c54":"s09b","c55":"s16d","c56":"s03b","c57":"s04c","c58":"s04b","c59":"s05a","c60":"s10a","c61":"s03a","c62":"s11c","c63":"s11b","c64":"s12a","c65":"s12b","c66":"s05c","c67":"s03d","c68":"s08b","c69":"s08c","c70":"s06a","c71":"s06d","c72":"s07a","c73":"s07c","c74":"s08d","c75":"s02d","c76":"s10c","c77":"s16a","c78":"s11d","c79":"s11a","c80":"s12d","c81":"s04d","c82":"s07b","c83":"s02b","c84":"s15c","c85":"s10d","c86":"s01c","c87":"s07d","c88":"s09b","c89":"s01d","c90":"s15d"});
  Object.assign(YES_NO.ru, {"c41":["Любишь острую еду?","чем острее, тем лучше","выбирает что-нибудь помягче"],"c42":["Умеешь плавать?","плавает как рыба","пока держится у берега"],"c43":["Хочешь завести кота?","уже придумывает кличку","больше любит собак"],"c44":["Хочешь когда-нибудь побывать в Стамбуле?","уже мечтает о Босфоре","выбирает другой город"],"c45":["Любишь готовить?","готовит с удовольствием","лучше помоет посуду"],"c46":["Хочешь научиться готовить плов?","уже ищет рецепт","лучше попробует чужой"],"c47":["Любишь читать книги?","всегда с книгой","больше любит слушать истории"],"c48":["Умеешь кататься на велосипеде?","крутит педали хоть сейчас","обещает научиться"],"c49":["Горы нравятся больше, чем море?","выбирает горы","выбирает море"],"c50":["Хочешь побывать в пустыне?","мечтает о песчаных дюнах","лучше выберет лес"],"c51":["Любишь зиму?","ждёт первого снега","ждёт лета"],"c52":["Пьёшь чай без сахара?","любит чистый вкус чая","без ложки сахара никак"],"c53":["Боишься пауков?","обходит их стороной","спокойно выносит их на улицу"],"c54":["Любишь рисовать?","уже берёт кисточку","лучше посмотрит на чужие картины"],"c55":["Хочешь увидеть северное сияние?","уже смотрит, где его лучше видно","лучше полюбуется звёздами"],"c56":["Любишь дождливую погоду?","любит шум дождя за окном","ждёт солнца"],"c57":["Умеешь ездить верхом?","уверенно держится в седле","пока только мечтает об этом"],"c58":["Хочешь завести собаку?","мечтает о верном друге","пока хватает других забот"],"c59":["Сладкое любишь больше, чем солёное?","без сладкого никуда","выбирает солёное"],"c60":["Любишь ездить на поезде?","любит стук колёс","выбирает самолёт"],"c61":["Тебе легко начинать день рано?","бодро начинает день","раскачивается до обеда"],"c62":["Любишь походы с палаткой?","уже собирает рюкзак","выбирает уютную гостиницу"],"c63":["Хочешь жить у моря?","мечтает о шуме волн","выбирает город"],"c64":["Ешь мороженое зимой?","ест его в любой мороз","только летом"],"c65":["Любишь шоколад?","знает все его сорта","спокойно проходит мимо"],"c66":["Умеешь печь пироги?","печёт, как бабушка","обещает научиться"],"c67":["Любишь смотреть на звёзды?","знает созвездия","больше любит солнечный день"],"c68":["Хочешь когда-нибудь посадить свой сад?","уже выбирает саженцы","начнёт с цветка в горшке"],"c69":["Любишь полевые цветы?","любит ромашки и васильки","больше любит садовые"],"c70":["Пьёшь кофе?","без кофе день не начинается","выбирает чай"],"c71":["Любишь домашний лимонад?","уже режет лимоны","лучше выпьет воды"],"c72":["Хочешь когда-нибудь побывать в Японии?","мечтает увидеть цветущую сакуру","выбирает другую страну"],"c73":["Любишь осень?","любит шуршать листьями","ждёт весну"],"c74":["Нравится запах лаванды?","любит этот аромат","выбирает другие ароматы"],"c75":["Любишь настольные игры?","уже раскладывает поле","предпочитает прогулку"],"c76":["Умеешь водить машину?","уверенно сидит за рулём","пока на пассажирском месте"],"c77":["Хочешь когда-нибудь увидеть океан?","мечтает о большой волне","хватит и моря"],"c78":["Хочешь пожить на ферме?","уже кормит кур","остаётся в городе"],"c79":["Любишь большие города?","любит огни города","выбирает тишину"],"c80":["Фрукты любишь больше, чем конфеты?","выбирает фрукты","выбирает конфеты"],"c81":["Хочешь увидеть дельфинов в море?","очень хочет их увидеть","лучше почитает о них"],"c82":["Любишь лето?","ждёт жарких дней","любит прохладу"],"c83":["Любишь гулять в парке?","гуляет при любой погоде","больше любит быть дома"],"c84":["Любишь писать от руки?","пишет ровным почерком","печатает в телефоне"],"c85":["Любишь кататься на лодке?","уже берёт вёсла","остаётся на берегу"],"c86":["Хочешь объехать весь мир?","уже рисует маршрут","хватит пары стран"],"c87":["Умеешь лепить снеговика?","слепит самого большого","лучше поиграет в снежки"],"c88":["Хочешь освоить что-то новое в этом году?","уже выбирает курсы","и так хватает дел"],"c89":["Любишь тишину?","ценит тишину","любит, когда вокруг оживлённо"],"c90":["Любишь дарить подарки близким?","радует близких без повода","больше помогает делом"]});
  Object.assign(YES_NO.en, {"c41":["Do you like spicy food?","the spicier, the better","picks something milder"],"c42":["Can you swim?","swims like a fish","stays close to the shore for now"],"c43":["Would you like to have a cat?","is already thinking of a name","prefers dogs"],"c44":["Would you like to visit Istanbul one day?","already dreams of the Bosphorus","would pick another city"],"c45":["Do you like cooking?","cooks with pleasure","would rather do the dishes"],"c46":["Would you like to learn to cook pilaf?","is already looking for a recipe","would rather taste someone else’s"],"c47":["Do you like reading books?","always has a book nearby","prefers listening to stories"],"c48":["Can you ride a bike?","could ride off right now","promises to learn"],"c49":["Do you prefer the mountains to the sea?","picks the mountains","picks the sea"],"c50":["Would you like to see a desert?","dreams of sand dunes","would rather pick a forest"],"c51":["Do you like winter?","waits for the first snow","waits for summer"],"c52":["Do you drink tea without sugar?","likes the pure taste of tea","can’t do without a spoonful of sugar"],"c53":["Are you afraid of spiders?","keeps well away from them","calmly carries them outside"],"c54":["Do you like drawing?","is already picking up a brush","would rather look at other people’s paintings"],"c55":["Would you like to see the northern lights?","is already checking where to see them","would rather gaze at the stars"],"c56":["Do you like rainy weather?","loves the sound of rain outside","waits for the sun"],"c57":["Can you ride a horse?","sits confidently in the saddle","only dreams of it for now"],"c58":["Would you like to have a dog?","dreams of a loyal friend","has enough to look after for now"],"c59":["Do you prefer sweet to savoury?","can’t live without sweets","picks savoury"],"c60":["Do you like travelling by train?","loves the rhythm of the wheels","picks the plane"],"c61":["Is it easy for you to start the day early?","starts the day full of energy","needs until lunch to get going"],"c62":["Do you like camping in a tent?","is already packing a backpack","picks a cosy hotel"],"c63":["Would you like to live by the sea?","dreams of the sound of the waves","picks the city"],"c64":["Do you eat ice cream in winter?","eats it even in the frost","only in summer"],"c65":["Do you like chocolate?","knows every kind of it","walks past it calmly"],"c66":["Can you bake pies?","bakes like a grandmother","promises to learn"],"c67":["Do you like looking at the stars?","knows the constellations","prefers a sunny day"],"c68":["Would you like to plant your own garden one day?","is already choosing seedlings","will start with a flower in a pot"],"c69":["Do you like wildflowers?","loves daisies and cornflowers","prefers garden flowers"],"c70":["Do you drink coffee?","the day doesn’t start without coffee","picks tea"],"c71":["Do you like homemade lemonade?","is already slicing lemons","would rather have water"],"c72":["Would you like to visit Japan one day?","dreams of seeing the cherry blossoms","would pick another country"],"c73":["Do you like autumn?","loves rustling through the leaves","waits for spring"],"c74":["Do you like the smell of lavender?","loves that scent","prefers other scents"],"c75":["Do you like board games?","is already setting up the board","prefers a walk"],"c76":["Can you drive a car?","drives with confidence","is a passenger for now"],"c77":["Would you like to see the ocean one day?","dreams of a big wave","the sea is enough"],"c78":["Would you like to live on a farm for a while?","is already feeding the hens","stays in the city"],"c79":["Do you like big cities?","loves the city lights","picks peace and quiet"],"c80":["Do you prefer fruit to sweets?","picks fruit","picks sweets"],"c81":["Would you like to see dolphins in the sea?","would love to see them","would rather read about them"],"c82":["Do you like summer?","waits for the hot days","loves cool weather"],"c83":["Do you like walking in the park?","walks in any weather","prefers staying at home"],"c84":["Do you like writing by hand?","has neat handwriting","types on the phone"],"c85":["Do you like boat trips?","is already grabbing the oars","stays on the shore"],"c86":["Would you like to travel around the world?","is already drawing a route","a couple of countries is enough"],"c87":["Can you build a snowman?","will build the biggest one","would rather have a snowball fight"],"c88":["Would you like to learn something new this year?","is already choosing a course","has enough to do already"],"c89":["Do you like silence?","values the quiet","likes it when things are lively"],"c90":["Do you like giving presents to your family?","brings joy to the family for no special reason","prefers to help in practical ways"]});
  Object.assign(YES_NO.fr, {"c41":["Tu aimes la cuisine épicée ?","plus c’est épicé, mieux c’est","choisit quelque chose de plus doux"],"c42":["Tu sais nager ?","nage comme un poisson","reste près du bord pour l’instant"],"c43":["Tu aimerais avoir un chat ?","cherche déjà un nom","préfère les chiens"],"c44":["Tu aimerais visiter Istanbul un jour ?","rêve déjà du Bosphore","choisirait une autre ville"],"c45":["Tu aimes cuisiner ?","cuisine avec plaisir","préfère faire la vaisselle"],"c46":["Tu aimerais apprendre à cuisiner le plov ?","cherche déjà une recette","préfère goûter celui des autres"],"c47":["Tu aimes lire ?","a toujours un livre sous la main","préfère écouter des histoires"],"c48":["Tu sais faire du vélo ?","pédalerait tout de suite","promet d’apprendre"],"c49":["Tu préfères la montagne à la mer ?","choisit la montagne","choisit la mer"],"c50":["Tu aimerais voir un désert ?","rêve de dunes de sable","préférerait une forêt"],"c51":["Tu aimes l’hiver ?","attend la première neige","attend l’été"],"c52":["Tu bois ton thé sans sucre ?","aime le goût pur du thé","ne peut pas se passer d’une cuillère de sucre"],"c53":["Tu as peur des araignées ?","les évite soigneusement","les sort dehors sans paniquer"],"c54":["Tu aimes dessiner ?","prend déjà un pinceau","préfère regarder les tableaux des autres"],"c55":["Tu aimerais voir une aurore boréale ?","cherche déjà où l’observer","préfère contempler les étoiles"],"c56":["Tu aimes quand il pleut ?","aime le bruit de la pluie dehors","attend le soleil"],"c57":["Tu sais monter à cheval ?","tient bien en selle","en rêve seulement pour l’instant"],"c58":["Tu aimerais avoir un chien ?","rêve d’un ami fidèle","a déjà assez à faire pour l’instant"],"c59":["Tu préfères le sucré au salé ?","ne peut pas se passer de sucré","choisit le salé"],"c60":["Tu aimes voyager en train ?","aime le bruit des roues sur les rails","choisit l’avion"],"c61":["C’est facile pour toi de commencer la journée tôt ?","commence la journée avec énergie","a besoin de la matinée pour démarrer"],"c62":["Tu aimes camper sous la tente ?","prépare déjà son sac à dos","choisit un hôtel douillet"],"c63":["Tu aimerais vivre au bord de la mer ?","rêve du bruit des vagues","choisit la ville"],"c64":["Tu manges de la glace en hiver ?","en mange même quand il gèle","seulement en été"],"c65":["Tu aimes le chocolat ?","en connaît toutes les sortes","passe devant sans s’arrêter"],"c66":["Tu sais faire des tartes ?","les réussit comme une grand-mère","promet d’apprendre"],"c67":["Tu aimes regarder les étoiles ?","connaît les constellations","préfère une journée ensoleillée"],"c68":["Tu aimerais planter ton propre jardin un jour ?","choisit déjà les plants","commencera par une fleur en pot"],"c69":["Tu aimes les fleurs des champs ?","aime les marguerites et les bleuets","préfère les fleurs du jardin"],"c70":["Tu bois du café ?","la journée ne commence pas sans café","choisit le thé"],"c71":["Tu aimes la limonade maison ?","coupe déjà les citrons","préfère un verre d’eau"],"c72":["Tu aimerais aller au Japon un jour ?","rêve de voir les cerisiers en fleurs","choisirait un autre pays"],"c73":["Tu aimes l’automne ?","aime marcher dans les feuilles mortes","attend le printemps"],"c74":["Tu aimes l’odeur de la lavande ?","aime ce parfum","préfère d’autres senteurs"],"c75":["Tu aimes les jeux de société ?","installe déjà le plateau","préfère une promenade"],"c76":["Tu sais conduire ?","conduit avec assurance","laisse le volant aux autres pour l’instant"],"c77":["Tu aimerais voir l’océan un jour ?","rêve d’une grande vague","la mer lui suffit"],"c78":["Tu aimerais vivre un temps à la ferme ?","nourrit déjà les poules","reste en ville"],"c79":["Tu aimes les grandes villes ?","aime les lumières de la ville","choisit le calme"],"c80":["Tu préfères les fruits aux bonbons ?","choisit les fruits","choisit les bonbons"],"c81":["Tu aimerais voir des dauphins en mer ?","aimerait beaucoup les voir","préfère lire à leur sujet"],"c82":["Tu aimes l’été ?","attend les jours de chaleur","aime la fraîcheur"],"c83":["Tu aimes te promener au parc ?","se promène par tous les temps","préfère rester à la maison"],"c84":["Tu aimes écrire à la main ?","a une écriture soignée","tape sur son téléphone"],"c85":["Tu aimes faire du bateau ?","prend déjà les rames","reste sur la rive"],"c86":["Tu aimerais faire le tour du monde ?","trace déjà l’itinéraire","quelques pays suffiront"],"c87":["Tu sais faire un bonhomme de neige ?","fera le plus grand","préfère une bataille de boules de neige"],"c88":["Tu aimerais apprendre quelque chose de nouveau cette année ?","choisit déjà un cours","a déjà bien assez à faire"],"c89":["Tu aimes le silence ?","apprécie le calme","aime quand il y a de l’animation"],"c90":["Tu aimes offrir des cadeaux à tes proches ?","fait plaisir à ses proches sans raison","préfère aider concrètement"]});
  Object.assign(QUESTIONS.ru, {"q61":["Какое блюдо у меня получается лучше всего?","Суп","Плов","Выпечка","Салат"],"q62":["Какую страну я хочу увидеть первой?","Турцию","Японию","Марокко","Норвегию"],"q63":["Каким спортом я скорее займусь?","Плаванием","Бегом","Велоспортом","Футболом"],"q64":["Какую книгу я скорее выберу?","Приключения","Историческую","Сказки","Энциклопедию"],"q65":["К кому я пойду в зоопарке первым делом?","К слонам","К обезьянам","К пингвинам","К жирафам"],"q66":["Как я отношусь к острой еде?","Чем острее, тем лучше","Немного можно","Только чуть-чуть","Совсем не ем"],"q67":["Какой предмет в школе мне нравился больше всех?","Математика","Литература","География","Физкультура"],"q68":["Моя детская мечта о профессии?","Врач","Учитель","Космонавт","Повар"],"q69":["Как я отношусь к походам?","Мечтаю о многодневном","Только на один день","Только с удобствами","Лучше дома"],"q70":["Моё настроение по утрам?","Бодрое","Сонное","Молчаливое","Разговорчивое"],"q71":["Какой орех мне вкуснее всего?","Фундук","Грецкий","Кешью","Миндаль"],"q72":["Что я сделаю с неожиданно свободным часом?","Почитаю","Прогуляюсь","Позвоню родным","Приготовлю что-нибудь"],"q73":["Какую погоду я не люблю?","Жару","Ветер","Слякоть","Сильный мороз"],"q74":["В какой цвет я покрашу стены в своей комнате?","Белый","Бежевый","Зелёный","Голубой"],"q75":["Во что я скорее сыграю?","В шахматы","В шашки","Соберу пазл","В игру в слова"],"q76":["Что я приготовлю для гостей?","Плов","Пирог","Салаты","Закажу еду"],"q77":["Чего я точно не стану есть?","Грибы","Рыбу","Оливки","Варёный лук"],"q78":["Какой чай я завариваю?","Покрепче","Слабенький","Сладкий","С травами"],"q79":["Что для меня важнее всего в доме?","Чистота","Уют","Много света","Тишина"],"q80":["Как я учусь новому?","Читаю","Смотрю видеоуроки","Пробую на практике","Спрашиваю других"],"q81":["Какое дикое животное мне интереснее всего?","Тигр","Медведь","Орёл","Дельфин"],"q82":["Что я скорее подарю маме?","Цветы","Что-то своими руками","Поездку","Тёплый плед"],"q83":["Чем я занимаюсь в дороге?","Смотрю в окно","Читаю","Разговариваю","Перекусываю"],"q84":["Моё любимое блюдо из курицы?","Куриный шашлык","Курица с рисом","Котлеты","Наггетсы"],"q85":["Какое место в поезде я выберу?","У окна","У прохода","Против хода","Мне всё равно"],"q86":["Что я делаю, когда что-то идёт не так?","Сразу действую","Сначала думаю","Прошу совета","Немного переживаю"],"q87":["Какое качество во мне главное?","Доброта","Честность","Упорство","Весёлый нрав"],"q88":["Где я лучше всего отдохну?","В деревне у родных","В гостинице у моря","В палатке","Дома"],"q89":["Какую выпечку я выберу?","Самсу","Хачапури","Чак-чак","Эклер"],"q90":["Какой язык мне интереснее всего выучить?","Арабский","Английский","Турецкий","Японский"],"q91":["Сколько я продержусь без сладкого?","День","Неделю","Месяц","Сколько угодно"],"q92":["Что я делаю, если опаздываю?","Бегу со всех ног","Звоню и предупреждаю","Беру такси","Я не опаздываю"],"q93":["Что я делаю, когда ломается техника?","Чиню своими руками","Читаю инструкцию","Зову на помощь","Нажимаю все кнопки подряд"],"q94":["Что я положу в чемодан первым?","Аптечку","Книгу","Зарядку","Перекус"],"q95":["Какое занятие меня успокаивает?","Готовка","Уборка","Рисование","Прогулка"],"q96":["Чем я хочу заниматься на пенсии?","Садом","Путешествиями","Чтением","Внуками"],"q97":["Что меня больше всего раздражает?","Шум","Беспорядок","Опоздания","Грубость"],"q98":["Какой запах мне нравится больше всего?","Свежего хлеба","Дождя","Цветов","Моря"],"q99":["Что я выберу на десерт?","Фрукты","Мороженое","Пирог","Просто чай"]});
  Object.assign(QUESTIONS.en, {"q61":["Which dish do I make best?","Soup","Pilaf","Baking","Salad"],"q62":["Which country do I want to see first?","Turkey","Japan","Morocco","Norway"],"q63":["Which sport would I rather take up?","Swimming","Running","Cycling","Football"],"q64":["Which book would I pick?","An adventure","A history book","Fairy tales","An encyclopedia"],"q65":["Which animals would I visit first at the zoo?","The elephants","The monkeys","The penguins","The giraffes"],"q66":["How do I feel about spicy food?","The spicier, the better","A bit is fine","Only a tiny bit","I don’t eat it at all"],"q67":["Which school subject did I like most?","Maths","Literature","Geography","PE"],"q68":["My childhood dream job?","Doctor","Teacher","Astronaut","Chef"],"q69":["How do I feel about hiking trips?","I dream of a long one","Just for a day","Only with comforts","Home is better"],"q70":["My mood in the morning?","Full of energy","Still sleepy","Quiet","Chatty"],"q71":["Which nut do I like best?","Hazelnut","Walnut","Cashew","Almond"],"q72":["What would I do with an unexpected free hour?","Read","Go for a walk","Call my family","Cook something"],"q73":["What weather do I dislike?","Heat","Wind","Slush","Hard frost"],"q74":["What colour would I paint my room?","White","Beige","Green","Light blue"],"q75":["What would I rather play?","Chess","Draughts","A jigsaw puzzle","A word game"],"q76":["What would I cook for guests?","Pilaf","A pie","Salads","I’d order food"],"q77":["What would I definitely not eat?","Mushrooms","Fish","Olives","Boiled onion"],"q78":["How do I make my tea?","Strong","Weak","Sweet","With herbs"],"q79":["What matters most to me in a home?","Cleanliness","Cosiness","Lots of light","Quiet"],"q80":["How do I learn new things?","Reading","Watching video lessons","Trying it in practice","Asking others"],"q81":["Which wild animal fascinates me most?","Tiger","Bear","Eagle","Dolphin"],"q82":["What would I give my mum?","Flowers","Something handmade","A trip","A warm blanket"],"q83":["What do I do on a journey?","Look out of the window","Read","Chat","Snack"],"q84":["My favourite chicken dish?","Chicken skewers","Chicken with rice","Chicken patties","Nuggets"],"q85":["Which seat do I pick on a train?","By the window","By the aisle","Facing backwards","I don’t mind"],"q86":["What do I do when things go wrong?","Act right away","Think first","Ask for advice","Worry a little"],"q87":["What is my main quality?","Kindness","Honesty","Persistence","Cheerfulness"],"q88":["Where would I rest best?","With relatives in the countryside","In a hotel by the sea","In a tent","At home"],"q89":["Which pastry would I pick?","Samsa","Khachapuri","Chak-chak","An éclair"],"q90":["Which language would I most like to learn?","Arabic","English","Turkish","Japanese"],"q91":["How long could I go without sweets?","A day","A week","A month","As long as needed"],"q92":["What do I do when I’m running late?","Run as fast as I can","Call ahead to warn","Take a taxi","I’m never late"],"q93":["What do I do when a gadget breaks?","Fix it myself","Read the manual","Call for help","Press every button"],"q94":["What goes into my suitcase first?","A first-aid kit","A book","A charger","A snack"],"q95":["What activity calms me down?","Cooking","Tidying up","Drawing","A walk"],"q96":["What do I want to do when I retire?","Gardening","Travelling","Reading","Spending time with grandchildren"],"q97":["What annoys me most?","Noise","Mess","Lateness","Rudeness"],"q98":["Which smell do I like most?","Fresh bread","Rain","Flowers","The sea"],"q99":["What would I pick for dessert?","Fruit","Ice cream","Pie","Just tea"]});
  Object.assign(QUESTIONS.fr, {"q61":["Quel plat je réussis le mieux ?","La soupe","Le plov","Les pâtisseries","La salade"],"q62":["Quel pays je veux voir en premier ?","La Turquie","Le Japon","Le Maroc","La Norvège"],"q63":["Quel sport je choisirais plutôt ?","La natation","La course","Le vélo","Le football"],"q64":["Quel livre je choisirais ?","Une aventure","Un livre d’histoire","Des contes","Une encyclopédie"],"q65":["Quels animaux je verrais en premier au zoo ?","Les éléphants","Les singes","Les manchots","Les girafes"],"q66":["Qu’est-ce que je pense de la cuisine épicée ?","Plus c’est épicé, mieux c’est","Un peu, ça va","Juste une pointe","Je n’en mange pas du tout"],"q67":["Quelle matière je préférais à l’école ?","Les maths","La littérature","La géographie","Le sport"],"q68":["Mon métier de rêve quand j’étais enfant ?","Médecin","Professeur","Astronaute","Chef cuisinier"],"q69":["Qu’est-ce que je pense des randonnées ?","Je rêve d’une longue rando","Juste pour une journée","Seulement avec du confort","Je préfère la maison"],"q70":["Mon humeur le matin ?","Pleine d’énergie","Encore endormie","Silencieuse","Bavarde"],"q71":["Quelle noix je préfère ?","La noisette","La noix","La noix de cajou","L’amande"],"q72":["Que ferais-je d’une heure libre inattendue ?","Lire","Me promener","Appeler ma famille","Cuisiner quelque chose"],"q73":["Quel temps je n’aime pas ?","La canicule","Le vent","La gadoue","Le grand froid"],"q74":["De quelle couleur je peindrais ma chambre ?","Blanc","Beige","Vert","Bleu clair"],"q75":["À quoi je jouerais plutôt ?","Aux échecs","Aux dames","Un puzzle","Un jeu de mots"],"q76":["Que préparerais-je pour des invités ?","Un plov","Une tarte","Des salades","Je commanderais"],"q77":["Qu’est-ce que je ne mangerais jamais ?","Des champignons","Du poisson","Des olives","De l’oignon cuit"],"q78":["Comment je prépare mon thé ?","Bien fort","Léger","Sucré","Aux herbes"],"q79":["Qu’est-ce qui compte le plus pour moi dans une maison ?","La propreté","Le confort","Beaucoup de lumière","Le calme"],"q80":["Comment j’apprends de nouvelles choses ?","En lisant","Avec des tutoriels vidéo","En pratiquant","En demandant aux autres"],"q81":["Quel animal sauvage me fascine le plus ?","Le tigre","L’ours","L’aigle","Le dauphin"],"q82":["Que j’offrirais plutôt à ma mère ?","Des fleurs","Un objet fait main","Un voyage","Un plaid bien chaud"],"q83":["Que fais-je pendant un trajet ?","Je regarde par la fenêtre","Je lis","Je discute","Je grignote"],"q84":["Mon plat de poulet préféré ?","Brochettes de poulet","Poulet au riz","Boulettes de poulet","Nuggets"],"q85":["Quelle place je choisis dans le train ?","Côté fenêtre","Côté couloir","Dos à la marche","Peu importe"],"q86":["Que fais-je quand quelque chose tourne mal ?","J’agis tout de suite","Je réfléchis d’abord","Je demande conseil","Je m’inquiète un peu"],"q87":["Quelle est ma plus grande qualité ?","La gentillesse","L’honnêteté","La persévérance","La bonne humeur"],"q88":["Où je me reposerais le mieux ?","Chez la famille à la campagne","À l’hôtel au bord de la mer","Sous une tente","À la maison"],"q89":["Quelle pâtisserie je choisirais ?","Une samsa","Un khatchapouri","Un tchak-tchak","Un éclair"],"q90":["Quelle langue j’aimerais le plus apprendre ?","L’arabe","L’anglais","Le turc","Le japonais"],"q91":["Combien de temps je tiendrais sans sucreries ?","Un jour","Une semaine","Un mois","Aussi longtemps qu’il faut"],"q92":["Que fais-je quand je suis en retard ?","Je cours à toute vitesse","J’appelle pour prévenir","Je prends un taxi","Je ne suis jamais en retard"],"q93":["Que fais-je quand un appareil tombe en panne ?","Je le répare moi-même","Je lis le mode d’emploi","J’appelle à l’aide","J’appuie sur tous les boutons"],"q94":["Qu’est-ce que je mets en premier dans ma valise ?","La trousse de secours","Un livre","Le chargeur","Un en-cas"],"q95":["Quelle activité me calme ?","Cuisiner","Ranger","Dessiner","Une promenade"],"q96":["Que veux-je faire à la retraite ?","Jardiner","Voyager","Lire","M’occuper des petits-enfants"],"q97":["Qu’est-ce qui m’agace le plus ?","Le bruit","Le désordre","Les retards","L’impolitesse"],"q98":["Quelle odeur je préfère ?","Le pain frais","La pluie","Les fleurs","La mer"],"q99":["Que choisirais-je comme dessert ?","Des fruits","Une glace","Une tarte","Juste un thé"]});
  WHO.ru.push(...["Кто из нас лучше считает в уме?","Кто из нас больше читает?","Кто из нас быстрее печатает?","Кто из нас чаще звонит родителям?","Кто из нас лучше рассказывает истории?","Кто из нас аккуратнее пишет от руки?","Кто из нас больше любит острое?","Кто из нас чаще что-нибудь забывает дома?","Кто из нас лучше разбирается в технике?","Кто из нас больше любит учиться новому?","Кто из нас лучше всё планирует?","Кто из нас лучше торгуется на рынке?","Кто из нас больше любит природу?","Кто из нас быстрее ест?","Кто из нас пьёт больше чая?","Кто из нас лучше ухаживает за растениями?","Кто из нас лучше знает географию?","Кто из нас лучше играет в шахматы?","Кто из нас лучше выбирает фрукты на рынке?","Кто из нас чаще смотрит прогноз погоды?","Кто из нас больше боится пауков?","Кто из нас смелее?","Кто из нас любопытнее?","Кто из нас быстрее решает головоломки?","Кто из нас лучше рисует?","Кто из нас чаще помогает соседям?","Кто из нас лучше ладит с детьми?","Кто из нас больше любит ходить пешком?","Кто из нас чаще читает инструкции?","Кто из нас лучше запоминает имена?","Кто из нас быстрее учит слова на другом языке?","Кто из нас лучше печёт?","Кто из нас даёт лучшие советы?","Кто из нас больше любит холодную погоду?","Кто из нас лучше справится в походе?","Кто из нас чаще читает новости?","Кто из нас чаще пробует новые блюда?","Кто из нас быстрее собирает чемодан?","Кто из нас лучше чинит вещи?","Кто из нас чаще разговаривает с животными?","Кто из нас чаще моет посуду?","Кто из нас лучше знает историю?","Кто из нас чаще откладывает дела на потом?","Кто из нас быстрее находит общий язык с новыми людьми?","Кто из нас больше заботится о здоровье?"]);
  WHO.en.push(...["Which of us is better at mental maths?","Which of us reads more?","Which of us types faster?","Which of us calls their parents more often?","Which of us tells stories better?","Which of us has neater handwriting?","Which of us likes spicy food more?","Which of us forgets things at home more often?","Which of us is better with gadgets?","Which of us loves learning new things more?","Which of us is better at planning?","Which of us is better at bargaining at the market?","Which of us loves nature more?","Which of us eats faster?","Which of us drinks more tea?","Which of us takes better care of plants?","Which of us knows geography better?","Which of us plays chess better?","Which of us picks better fruit at the market?","Which of us checks the weather forecast more often?","Which of us is more afraid of spiders?","Which of us is braver?","Which of us is more curious?","Which of us solves puzzles faster?","Which of us draws better?","Which of us helps the neighbours more often?","Which of us gets on better with children?","Which of us likes walking more?","Which of us reads the instructions more often?","Which of us remembers names better?","Which of us learns words in another language faster?","Which of us is better at baking?","Which of us gives better advice?","Which of us likes cold weather more?","Which of us would do better on a hike?","Which of us reads the news more often?","Which of us tries new dishes more often?","Which of us packs a suitcase faster?","Which of us is better at fixing things?","Which of us talks to animals more often?","Which of us does the dishes more often?","Which of us knows history better?","Which of us puts things off more often?","Which of us gets along with new people faster?","Which of us takes more care of their health?"]);
  WHO.fr.push(...["Qui de nous deux calcule le mieux de tête ?","Qui de nous deux lit le plus ?","Qui de nous deux tape le plus vite ?","Qui de nous deux appelle le plus souvent ses parents ?","Qui de nous deux raconte le mieux les histoires ?","Qui de nous deux écrit le plus soigneusement à la main ?","Qui de nous deux aime le plus les plats épicés ?","Qui de nous deux oublie le plus souvent quelque chose à la maison ?","Qui de nous deux s’y connaît le mieux en technique ?","Qui de nous deux aime le plus apprendre de nouvelles choses ?","Qui de nous deux organise le mieux les choses ?","Qui de nous deux marchande le mieux au marché ?","Qui de nous deux aime le plus la nature ?","Qui de nous deux mange le plus vite ?","Qui de nous deux boit le plus de thé ?","Qui de nous deux prend le mieux soin des plantes ?","Qui de nous deux connaît le mieux la géographie ?","Qui de nous deux joue le mieux aux échecs ?","Qui de nous deux choisit les meilleurs fruits au marché ?","Qui de nous deux regarde le plus souvent la météo ?","Qui de nous deux a le plus peur des araignées ?","Qui de nous deux a le plus de courage ?","Qui de nous deux est le plus curieux ?","Qui de nous deux résout le plus vite les énigmes ?","Qui de nous deux dessine le mieux ?","Qui de nous deux aide le plus souvent les voisins ?","Qui de nous deux s’entend le mieux avec les enfants ?","Qui de nous deux aime le plus marcher ?","Qui de nous deux lit le plus souvent les modes d’emploi ?","Qui de nous deux retient le mieux les prénoms ?","Qui de nous deux apprend le plus vite les mots d’une autre langue ?","Qui de nous deux réussit le mieux les pâtisseries ?","Qui de nous deux donne les meilleurs conseils ?","Qui de nous deux aime le plus le froid ?","Qui de nous deux se débrouillerait le mieux en randonnée ?","Qui de nous deux lit le plus souvent les actualités ?","Qui de nous deux goûte le plus souvent de nouveaux plats ?","Qui de nous deux fait sa valise le plus vite ?","Qui de nous deux répare le mieux les objets ?","Qui de nous deux parle le plus souvent aux animaux ?","Qui de nous deux fait le plus souvent la vaisselle ?","Qui de nous deux connaît le mieux l’histoire ?","Qui de nous deux remet le plus souvent les choses à plus tard ?","Qui de nous deux sympathise le plus vite avec de nouvelles personnes ?","Qui de nous deux prend le plus soin de sa santé ?"]);
  PHRASES.ru.push(...["Моя любимая еда в детстве — …","Если бы мне дали один день в любой стране, я бы…","Лучший совет, который мне дали, — …","Я всегда смеюсь, когда…","Моё любимое место в родном городе — …","Если бы у меня был свой маленький магазин, там продавались бы…","Блюдо, которое я готовлю лучше всего, — …","Детская мечта, которую я помню до сих пор, — …","Меня легко порадовать, если…","Самое удивительное место, где мне удалось побывать, — …","Я хочу научиться…","Мой идеальный выходной начинается с…","Будь у меня возможность завести любое животное, это был бы…","Моя семья всегда говорит, что я…","Я никак не могу привыкнуть к…","Самая полезная моя привычка — …","Лучшая книга, которую мне доводилось читать, — …","Через десять лет мне хочется…","Мой дом мечты — это…","Самое смешное, что случалось со мной в детстве, — …","Счастье для меня — это…","Мне трудно отказаться от…","Если бы у меня была суперсила, она бы…","Больше всего в людях я ценю…","Когда у меня свободный вечер, я…","Мой любимый запах — …","Еда, которую я ни за что не стану есть, — …","Вещь, без которой я не выхожу из дома, — …","Мне хочется побывать в…, потому что…","Лучший подарок, который мне дарили, — …","Моя самая необычная привычка — …","Если бы у меня был лишний час каждый день, я бы…","Человек, у которого я многому учусь, — …","В трудный день меня выручает…","Самое вкусное, что мне доводилось пробовать в поездке, — …","Если бы можно было на один день сменить профессию, мой выбор — …","Время года, которое мне ближе всего, — …","Мои друзья говорят, что я…","Однажды мне хочется научить кого-нибудь…","Маленькая радость моего дня — …"]);
  PHRASES.en.push(...["My favourite food as a child was…","If I were given one day in any country, I would…","The best advice I’ve ever been given is…","I always laugh when…","My favourite place in my home town is…","If I had my own little shop, it would sell…","The dish I cook best is…","A childhood dream I still remember is…","It’s easy to make me happy if…","The most amazing place I’ve been to is…","I want to learn…","My perfect day off starts with…","If I could have any animal at all, it would be…","My family always says that I…","I just can’t get used to…","My most useful habit is…","The best book I’ve ever read is…","In ten years I would like to…","My dream home is…","The funniest thing that happened to me as a child is…","To me, happiness is…","It’s hard for me to give up…","If I had a superpower, it would…","What I value most in people is…","When I have a free evening, I…","My favourite smell is…","The food I would never eat is…","The one thing I never leave home without is…","I would like to visit… because…","The best present I’ve ever received is…","My most unusual habit is…","If I had an extra hour every day, I would…","Someone I learn a lot from is…","On a hard day, what gets me through is…","The tastiest thing I’ve tried on a trip is…","If I could change jobs for one day, I would choose…","The season closest to my heart is…","My friends say that I…","One day I would like to teach someone…","A small joy in my day is…"]);
  PHRASES.fr.push(...["Mon plat préféré d’enfance, c’est…","Si on m’offrait une journée dans n’importe quel pays, je…","Le meilleur conseil qu’on m’ait donné, c’est…","Je ris toujours quand…","Mon endroit préféré dans ma ville natale, c’est…","Si j’avais ma propre petite boutique, on y vendrait…","Le plat que je cuisine le mieux, c’est…","Un rêve d’enfance dont je me souviens encore, c’est…","C’est facile de me faire plaisir si…","L’endroit le plus étonnant que j’aie visité, c’est…","Je veux apprendre…","Mon jour de repos idéal commence par…","Si je pouvais avoir n’importe quel animal, ce serait…","Ma famille dit toujours que je…","Je n’arrive pas à m’habituer à…","Mon habitude la plus utile, c’est…","Le meilleur livre que j’aie lu, c’est…","Dans dix ans, j’aimerais…","La maison de mes rêves, c’est…","La chose la plus drôle qui me soit arrivée enfant, c’est…","Pour moi, le bonheur, c’est…","J’ai du mal à renoncer à…","Si j’avais un super-pouvoir, il me permettrait de…","Ce que j’apprécie le plus chez les gens, c’est…","Quand j’ai une soirée libre, je…","Mon odeur préférée, c’est…","Un plat que je ne mangerai jamais, c’est…","L’objet sans lequel je ne sors jamais, c’est…","J’aimerais aller à… parce que…","Le plus beau cadeau qu’on m’ait offert, c’est…","Mon habitude la plus étrange, c’est…","Si j’avais une heure de plus chaque jour, je…","Une personne qui m’apprend beaucoup, c’est…","Dans une journée difficile, ce qui m’aide, c’est…","La chose la plus délicieuse goûtée en voyage, c’est…","Si je pouvais changer de métier pour une journée, je choisirais…","La saison qui me ressemble le plus, c’est…","Mes amis disent que je…","Un jour, j’aimerais apprendre à quelqu’un à…","Un petit bonheur de ma journée, c’est…"]);
  Object.assign(TRUTH.ru, {"t01":["У осьминога три сердца.",true,"Два сердца гонят кровь через жабры, а третье — по всему телу."],"t02":["Великую Китайскую стену видно с Луны невооружённым глазом.",false,"С Луны её не видно: стена слишком узкая. Даже с орбиты её почти не разглядеть."],"t03":["Мёд может храниться тысячи лет и не портиться.",true,"В древнеегипетских гробницах находили мёд, который сохранился тысячи лет."],"t04":["Бананы растут на деревьях.",false,"Банан — гигантская трава: его «ствол» состоит из плотно свёрнутых листьев."],"t05":["Венера — самая горячая планета Солнечной системы.",true,"Плотная атмосфера разогревает Венеру примерно до 460 °C — горячее Меркурия."],"t06":["Летучие мыши слепые.",false,"Летучие мыши видят, а в темноте ещё и находят дорогу с помощью эхолокации."],"t07":["Кит — это рыба.",false,"Киты — млекопитающие: они дышат воздухом и кормят детёнышей молоком."],"t08":["Сахара — самая большая пустыня в мире.",false,"Самая большая пустыня — Антарктида. Сахара — крупнейшая из жарких пустынь."],"t09":["В шее жирафа столько же позвонков, сколько у человека.",true,"И у жирафа, и у человека семь шейных позвонков, просто у жирафа они очень длинные."],"t10":["С точки зрения ботаники помидор — это ягода.",true,"Ботаники считают помидор ягодой: это сочный плод с семенами внутри."],"t11":["С точки зрения ботаники клубника — это ягода.",false,"Это ложная ягода: настоящие плоды клубники — маленькие «семечки» снаружи."],"t12":["В космосе можно услышать звук взрыва.",false,"В космосе почти нет воздуха, поэтому звуку не через что распространяться."],"t13":["Высоко в горах вода закипает при более низкой температуре.",true,"В горах давление воздуха ниже, поэтому вода кипит раньше, чем при 100 °C."],"t14":["Пингвины живут на Северном полюсе.",false,"Дикие пингвины живут только в Южном полушарии, на Севере их нет."],"t15":["Эверест — самая высокая гора над уровнем моря.",true,"Высота Эвереста — около 8 849 метров над уровнем моря."],"t16":["Человек использует только 10 % своего мозга.",false,"Это миф: за день в работе участвуют практически все отделы мозга."],"t17":["Сердце человека бьётся примерно 100 000 раз в сутки.",true,"При пульсе около 70 ударов в минуту выходит примерно 100 000 ударов за сутки."],"t18":["Золотая рыбка помнит всего три секунды.",false,"Опыты показывают, что золотые рыбки помнят то, чему научились, месяцами."],"t19":["Австралия — это и страна, и целый материк.",true,"Австралия — единственная страна, которая занимает весь материк."],"t20":["Молния никогда не бьёт в одно место дважды.",false,"Ещё как бьёт: в высокие здания молния попадает много раз за год."],"t21":["Страус прячет голову в песок, когда боится.",false,"Это миф: испуганный страус убегает или прижимается к земле, чтобы его не заметили."],"t22":["Самая маленькая птица в мире — колибри.",true,"Колибри-пчёлка с Кубы весит около 2 граммов — меньше любой другой птицы."],"t23":["Арбуз примерно на 90 % состоит из воды.",true,"В арбузе около 92 % воды — поэтому он так хорошо утоляет жажду."],"t24":["У паука шесть ног.",false,"У паука восемь ног. Шесть ног у насекомых, а паук — не насекомое."],"t25":["Луна светится сама.",false,"Луна не светится сама: она отражает свет Солнца."],"t26":["Слон — самое крупное животное на суше.",true,"Африканский саванный слон может весить больше 6 тонн."],"t27":["Синий кит — самое большое животное, известное науке.",true,"Синий кит бывает длиннее 30 метров — он больше любого известного динозавра."],"t28":["Хамелеон меняет цвет только для маскировки.",false,"Цвет хамелеона чаще зависит от настроения, температуры и общения с сородичами."],"t29":["Телефон изобрёл Томас Эдисон.",false,"Патент на телефон в 1876 году получил Александр Белл."],"t30":["Пенициллин открыл Александр Флеминг.",true,"Флеминг открыл пенициллин в 1928 году — это был первый антибиотик."],"t31":["Самый высокий вулкан Солнечной системы находится на Марсе.",true,"Гора Олимп на Марсе высотой около 22 км — почти в 2,5 раза выше Эвереста."],"t32":["Кровь в венах синего цвета.",false,"Кровь всегда красная, а вены кажутся синими из-за того, как свет проходит через кожу."],"t33":["Атлантический океан — самый большой на Земле.",false,"Самый большой — Тихий океан: он больше всей суши планеты, вместе взятой."],"t34":["Россия — самая большая страна в мире по площади.",true,"Площадь России — больше 17 миллионов квадратных километров."],"t35":["У Канады самая длинная береговая линия в мире.",true,"Берег Канады тянется больше чем на 200 000 км — длиннее, чем у любой другой страны."],"t36":["Желудок коровы состоит из четырёх отделов.",true,"У коровы один желудок, но в нём четыре отдела — так она переваривает траву."],"t37":["Лев — самая крупная кошка в мире.",false,"Самая крупная кошка — тигр, особенно амурский."],"t38":["Земля — ближайшая к Солнцу планета.",false,"Ближе всех к Солнцу Меркурий, потом Венера, а Земля — третья."],"t39":["Свет от Солнца летит до Земли около 8 минут.",true,"Свет проходит 150 миллионов километров от Солнца до Земли примерно за 8 минут 20 секунд."],"t40":["Дельфины спят, отключая половину мозга по очереди.",true,"Одна половина мозга отдыхает, а другая следит за дыханием и опасностью."],"t41":["Картофель родом из Ирландии.",false,"Картофель родом из Южной Америки: его выращивали в Андах тысячи лет назад."],"t42":["Шоколад делают из семян дерева какао.",true,"Плоды какао растут прямо на стволе, а внутри них — семена, из которых делают шоколад."],"t43":["Акула — это млекопитающее.",false,"Акула — рыба: она дышит жабрами. Млекопитающие среди морских жителей — киты и дельфины."],"t44":["Некоторые виды бамбука вырастают почти на метр за сутки.",true,"Бамбук — одно из самых быстрорастущих растений на Земле."],"t45":["Сова может повернуть голову на 360 градусов.",false,"Сова поворачивает голову примерно на 270 градусов — это очень много, но не полный круг."],"t46":["Алмаз и графит в карандаше состоят из одного вещества.",true,"И то и другое — чистый углерод, просто его атомы соединены по-разному."],"t47":["Верблюд хранит воду в горбу.",false,"В горбу верблюда запас жира, а не воды. Он даёт энергию в долгом пути."],"t48":["Самая маленькая кость человека находится в ухе.",true,"Стремечко в среднем ухе — всего около 3 миллиметров."],"t49":["Крупные попугаи могут жить больше 50 лет.",true,"Ара и какаду при хорошем уходе нередко живут 50 лет и дольше."],"t50":["Первый полёт на самолёте с мотором совершили братья Райт.",true,"Братья Райт поднялись в воздух в 1903 году; первый полёт длился 12 секунд."],"t51":["Колесо изобрели в Средние века.",false,"Колесу больше 5 000 лет: его использовали в Месопотамии примерно 3500 лет до н. э."],"t52":["Морской конёк — это рыба.",true,"Морской конёк дышит жабрами и плавает с помощью плавника, как другие рыбы."],"t53":["Колибри умеет летать задом наперёд.",true,"Колибри — единственные птицы, которые умеют уверенно летать назад."],"t54":["Летом Эйфелева башня становится немного выше.",true,"От жары металл расширяется, и башня вырастает примерно на 15 сантиметров."],"t55":["Кожа — самый большой орган человека.",true,"У взрослого человека кожа весит несколько килограммов и защищает всё тело."],"t56":["Быка злит красный цвет.",false,"Быки плохо различают красный: их раздражает движение, а не цвет ткани."],"t57":["Комнатная муха живёт всего один день.",false,"Комнатная муха живёт около месяца. Всего день-два живут взрослые подёнки."],"t58":["Ананас растёт на дереве.",false,"Ананас растёт на низком травянистом растении, прямо из центра его розетки."],"t59":["Арахис — это орех.",false,"Арахис — бобовое растение, родственник гороха и фасоли. Его плоды зреют под землёй."],"t60":["На Северном и Южном полюсах одинаково холодно.",false,"Южный полюс гораздо холоднее: он на высоком ледяном материке, а Северный — посреди океана."]});
  Object.assign(TRUTH.en, {"t01":["An octopus has three hearts.",true,"Two hearts pump blood through the gills, and the third pumps it around the body."],"t02":["The Great Wall of China can be seen from the Moon with the naked eye.",false,"It can’t: the wall is far too narrow. Even from orbit it is very hard to spot."],"t03":["Honey can keep for thousands of years without going off.",true,"Honey thousands of years old has been found still preserved in ancient Egyptian tombs."],"t04":["Bananas grow on trees.",false,"The banana plant is a giant herb: its “trunk” is made of tightly rolled leaves."],"t05":["Venus is the hottest planet in the Solar System.",true,"Its thick atmosphere heats Venus to about 460 °C — hotter than Mercury."],"t06":["Bats are blind.",false,"Bats can see, and in the dark they also find their way using echolocation."],"t07":["A whale is a fish.",false,"Whales are mammals: they breathe air and feed their young on milk."],"t08":["The Sahara is the largest desert in the world.",false,"The largest desert is Antarctica. The Sahara is the largest hot desert."],"t09":["A giraffe has the same number of neck bones as a human.",true,"Both have seven neck vertebrae — the giraffe’s are just very long."],"t10":["Botanically speaking, a tomato is a berry.",true,"Botanists class the tomato as a berry: a fleshy fruit with seeds inside."],"t11":["Botanically speaking, a strawberry is a berry.",false,"It’s a false berry: the real fruits are the tiny “seeds” on the outside."],"t12":["You can hear an explosion in space.",false,"Space has almost no air, so sound has nothing to travel through."],"t13":["High in the mountains, water boils at a lower temperature.",true,"Air pressure is lower up there, so water boils before reaching 100 °C."],"t14":["Penguins live at the North Pole.",false,"Wild penguins live only in the Southern Hemisphere, not in the far north."],"t15":["Everest is the highest mountain above sea level.",true,"Everest stands about 8,849 metres above sea level."],"t16":["People use only 10% of their brain.",false,"That’s a myth: almost every part of the brain is active over a day."],"t17":["A human heart beats about 100,000 times a day.",true,"At around 70 beats a minute, that adds up to roughly 100,000 beats a day."],"t18":["A goldfish has a memory of only three seconds.",false,"Experiments show goldfish can remember what they’ve learned for months."],"t19":["Australia is both a country and a continent.",true,"Australia is the only country that covers a whole continent."],"t20":["Lightning never strikes the same place twice.",false,"It does: tall buildings are struck by lightning many times a year."],"t21":["An ostrich buries its head in the sand when scared.",false,"A myth: a frightened ostrich runs away or lies flat on the ground to hide."],"t22":["The smallest bird in the world is a hummingbird.",true,"The bee hummingbird of Cuba weighs about 2 grams — less than any other bird."],"t23":["A watermelon is about 90% water.",true,"Watermelon is around 92% water — that’s why it’s so refreshing."],"t24":["A spider has six legs.",false,"A spider has eight legs. Insects have six, and spiders aren’t insects."],"t25":["The Moon makes its own light.",false,"The Moon has no light of its own: it reflects sunlight."],"t26":["The elephant is the largest land animal.",true,"An African bush elephant can weigh more than 6 tonnes."],"t27":["The blue whale is the largest animal known to science.",true,"Blue whales can be over 30 metres long — bigger than any known dinosaur."],"t28":["A chameleon changes colour only to camouflage itself.",false,"Its colour depends more on mood, temperature and signalling to other chameleons."],"t29":["The telephone was invented by Thomas Edison.",false,"Alexander Graham Bell received the telephone patent in 1876."],"t30":["Penicillin was discovered by Alexander Fleming.",true,"Fleming discovered penicillin in 1928 — the first antibiotic."],"t31":["The tallest volcano in the Solar System is on Mars.",true,"Olympus Mons on Mars is about 22 km high — nearly 2.5 times taller than Everest."],"t32":["The blood in our veins is blue.",false,"Blood is always red; veins only look blue because of how light passes through skin."],"t33":["The Atlantic is the largest ocean on Earth.",false,"The largest is the Pacific: it is bigger than all the land on Earth put together."],"t34":["Russia is the largest country in the world by area.",true,"Russia covers more than 17 million square kilometres."],"t35":["Canada has the longest coastline in the world.",true,"Canada’s coastline runs for more than 200,000 km — longer than any other country’s."],"t36":["A cow’s stomach has four compartments.",true,"A cow has one stomach with four chambers — that’s how it digests grass."],"t37":["The lion is the biggest cat in the world.",false,"The biggest cat is the tiger, especially the Siberian tiger."],"t38":["Earth is the planet closest to the Sun.",false,"Mercury is closest, then Venus; Earth is the third planet."],"t39":["Sunlight takes about 8 minutes to reach Earth.",true,"Light covers the 150 million km from the Sun in about 8 minutes 20 seconds."],"t40":["Dolphins sleep with one half of their brain at a time.",true,"One half rests while the other keeps watch and remembers to breathe."],"t41":["Potatoes come from Ireland.",false,"Potatoes come from South America: they were grown in the Andes thousands of years ago."],"t42":["Chocolate is made from the seeds of the cacao tree.",true,"Cacao pods grow right on the trunk, and the seeds inside become chocolate."],"t43":["A shark is a mammal.",false,"A shark is a fish: it breathes through gills. Whales and dolphins are the sea mammals."],"t44":["Some kinds of bamboo can grow almost a metre in a day.",true,"Bamboo is one of the fastest-growing plants on Earth."],"t45":["An owl can turn its head a full 360 degrees.",false,"An owl can turn its head about 270 degrees — a lot, but not a full circle."],"t46":["A diamond and pencil graphite are made of the same substance.",true,"Both are pure carbon — the atoms are just arranged differently."],"t47":["A camel stores water in its hump.",false,"A camel’s hump stores fat, not water — it provides energy on long journeys."],"t48":["The smallest bone in the human body is in the ear.",true,"The stirrup bone in the middle ear is only about 3 millimetres long."],"t49":["Large parrots can live for more than 50 years.",true,"Well cared-for macaws and cockatoos often live 50 years or more."],"t50":["The Wright brothers made the first powered aeroplane flight.",true,"They flew in 1903; the very first flight lasted 12 seconds."],"t51":["The wheel was invented in the Middle Ages.",false,"The wheel is over 5,000 years old: it was used in Mesopotamia around 3500 BC."],"t52":["A seahorse is a fish.",true,"A seahorse breathes through gills and swims with a fin, like other fish."],"t53":["A hummingbird can fly backwards.",true,"Hummingbirds are the only birds that can truly fly backwards."],"t54":["The Eiffel Tower gets a little taller in summer.",true,"Heat makes the metal expand, and the tower grows by about 15 centimetres."],"t55":["Skin is the largest organ of the human body.",true,"An adult’s skin weighs several kilograms and protects the whole body."],"t56":["The colour red makes a bull angry.",false,"Bulls can barely tell red apart: it’s the movement that provokes them, not the colour."],"t57":["A housefly lives for just one day.",false,"A housefly lives about a month. It’s adult mayflies that live only a day or two."],"t58":["Pineapples grow on trees.",false,"A pineapple grows on a low leafy plant, right out of the middle of it."],"t59":["A peanut is a nut.",false,"A peanut is a legume, related to peas and beans. Its pods ripen underground."],"t60":["The North and South Poles are equally cold.",false,"The South Pole is much colder: it sits on a high icy continent, the North Pole on an ocean."]});
  Object.assign(TRUTH.fr, {"t01":["La pieuvre a trois cœurs.",true,"Deux cœurs envoient le sang vers les branchies, le troisième dans tout le corps."],"t02":["On voit la Grande Muraille de Chine depuis la Lune à l’œil nu.",false,"Non : elle est bien trop étroite. Même depuis l’orbite, on la distingue à peine."],"t03":["Le miel peut se conserver des milliers d’années.",true,"On a trouvé dans des tombes égyptiennes du miel conservé depuis des milliers d’années."],"t04":["Les bananes poussent sur des arbres.",false,"Le bananier est une herbe géante : son « tronc » est fait de feuilles enroulées."],"t05":["Vénus est la planète la plus chaude du système solaire.",true,"Son atmosphère épaisse la chauffe à environ 460 °C, plus que Mercure."],"t06":["Les chauves-souris sont aveugles.",false,"Elles voient, et dans le noir elles s’orientent aussi grâce à l’écholocation."],"t07":["La baleine est un poisson.",false,"Les baleines sont des mammifères : elles respirent de l’air et allaitent leurs petits."],"t08":["Le Sahara est le plus grand désert du monde.",false,"Le plus grand désert est l’Antarctique. Le Sahara est le plus grand désert chaud."],"t09":["La girafe a autant de vertèbres au cou que l’humain.",true,"Les deux en ont sept : celles de la girafe sont simplement très longues."],"t10":["Pour les botanistes, la tomate est une baie.",true,"C’est un fruit charnu avec des graines à l’intérieur : une vraie baie."],"t11":["Pour les botanistes, la fraise est une baie.",false,"C’est un faux fruit : les vrais fruits sont les petits « grains » à sa surface."],"t12":["Dans l’espace, on peut entendre une explosion.",false,"L’espace n’a presque pas d’air : le son n’a rien pour se propager."],"t13":["En haute montagne, l’eau bout à une température plus basse.",true,"La pression de l’air y est plus faible, donc l’eau bout avant 100 °C."],"t14":["Les manchots vivent au pôle Nord.",false,"Les manchots sauvages vivent seulement dans l’hémisphère Sud."],"t15":["L’Everest est la plus haute montagne au-dessus du niveau de la mer.",true,"L’Everest culmine à environ 8 849 mètres au-dessus du niveau de la mer."],"t16":["L’être humain n’utilise que 10 % de son cerveau.",false,"C’est un mythe : presque toutes les zones du cerveau travaillent dans la journée."],"t17":["Le cœur humain bat environ 100 000 fois par jour.",true,"À environ 70 battements par minute, cela fait près de 100 000 par jour."],"t18":["Le poisson rouge n’a que trois secondes de mémoire.",false,"Des expériences montrent qu’il se souvient de ce qu’il a appris pendant des mois."],"t19":["L’Australie est à la fois un pays et un continent.",true,"C’est le seul pays qui occupe tout un continent."],"t20":["La foudre ne tombe jamais deux fois au même endroit.",false,"Si : les grands bâtiments sont frappés plusieurs fois par an."],"t21":["L’autruche enfouit sa tête dans le sable quand elle a peur.",false,"C’est un mythe : elle s’enfuit ou se couche au sol pour passer inaperçue."],"t22":["Le plus petit oiseau du monde est un colibri.",true,"Le colibri d’Elena, à Cuba, pèse environ 2 grammes."],"t23":["La pastèque contient environ 90 % d’eau.",true,"Elle contient près de 92 % d’eau, d’où son côté si rafraîchissant."],"t24":["L’araignée a six pattes.",false,"Elle en a huit. Ce sont les insectes qui en ont six, et l’araignée n’en est pas un."],"t25":["La Lune produit sa propre lumière.",false,"Elle n’a pas de lumière propre : elle reflète celle du Soleil."],"t26":["L’éléphant est le plus grand animal terrestre.",true,"L’éléphant de savane d’Afrique peut peser plus de 6 tonnes."],"t27":["La baleine bleue est le plus grand animal connu.",true,"Elle peut dépasser 30 mètres, plus que n’importe quel dinosaure connu."],"t28":["Le caméléon change de couleur uniquement pour se camoufler.",false,"Sa couleur dépend surtout de son humeur, de la température et de ses échanges avec les autres."],"t29":["C’est Thomas Edison qui a inventé le téléphone.",false,"C’est Alexander Graham Bell qui a obtenu le brevet du téléphone en 1876."],"t30":["La pénicilline a été découverte par Alexander Fleming.",true,"Fleming l’a découverte en 1928 : ce fut le premier antibiotique."],"t31":["Le plus haut volcan du système solaire se trouve sur Mars.",true,"Olympus Mons mesure environ 22 km, près de 2,5 fois l’Everest."],"t32":["Le sang dans nos veines est bleu.",false,"Le sang est toujours rouge : les veines paraissent bleues à cause de la lumière à travers la peau."],"t33":["L’Atlantique est le plus grand océan de la Terre.",false,"Le plus grand est le Pacifique : il est plus vaste que toutes les terres réunies."],"t34":["La Russie est le plus grand pays du monde par la superficie.",true,"Elle s’étend sur plus de 17 millions de kilomètres carrés."],"t35":["Le Canada a le plus long littoral du monde.",true,"Ses côtes s’étendent sur plus de 200 000 km, plus que tout autre pays."],"t36":["L’estomac de la vache a quatre compartiments.",true,"La vache a un seul estomac à quatre poches : c’est ainsi qu’elle digère l’herbe."],"t37":["Le lion est le plus grand félin du monde.",false,"Le plus grand félin est le tigre, surtout le tigre de Sibérie."],"t38":["La Terre est la planète la plus proche du Soleil.",false,"C’est Mercure, puis Vénus ; la Terre n’arrive qu’en troisième."],"t39":["La lumière du Soleil met environ 8 minutes à atteindre la Terre.",true,"Elle parcourt 150 millions de km en 8 minutes et 20 secondes environ."],"t40":["Les dauphins dorment avec une moitié du cerveau à la fois.",true,"Une moitié se repose pendant que l’autre surveille et pense à respirer."],"t41":["La pomme de terre vient d’Irlande.",false,"Elle vient d’Amérique du Sud : on la cultivait dans les Andes il y a des milliers d’années."],"t42":["Le chocolat est fait à partir des graines du cacaoyer.",true,"Les cabosses poussent sur le tronc, et leurs graines deviennent du chocolat."],"t43":["Le requin est un mammifère.",false,"Le requin est un poisson qui respire par des branchies, contrairement aux dauphins."],"t44":["Certains bambous poussent de près d’un mètre par jour.",true,"Le bambou est l’une des plantes qui poussent le plus vite sur Terre."],"t45":["La chouette peut tourner la tête à 360 degrés.",false,"Elle la tourne d’environ 270 degrés : c’est beaucoup, mais pas un tour complet."],"t46":["Le diamant et le graphite du crayon sont faits de la même substance.",true,"Les deux sont du carbone pur, dont les atomes sont simplement agencés autrement."],"t47":["Le chameau stocke de l’eau dans sa bosse.",false,"Sa bosse contient de la graisse, pas de l’eau : une réserve d’énergie pour la route."],"t48":["Le plus petit os du corps humain se trouve dans l’oreille.",true,"L’étrier, dans l’oreille moyenne, mesure environ 3 millimètres."],"t49":["Les grands perroquets peuvent vivre plus de 50 ans.",true,"Bien soignés, les aras et les cacatoès vivent souvent 50 ans ou plus."],"t50":["Les frères Wright ont réalisé le premier vol en avion à moteur.",true,"Ils ont volé en 1903 ; le tout premier vol a duré 12 secondes."],"t51":["La roue a été inventée au Moyen Âge.",false,"Elle a plus de 5 000 ans : on l’utilisait en Mésopotamie vers 3500 av. J.-C."],"t52":["L’hippocampe est un poisson.",true,"Il respire par des branchies et nage grâce à une nageoire, comme les autres poissons."],"t53":["Le colibri sait voler en marche arrière.",true,"Les colibris sont les seuls oiseaux capables de vraiment voler à reculons."],"t54":["La tour Eiffel grandit un peu en été.",true,"La chaleur dilate le métal, et la tour gagne environ 15 centimètres."],"t55":["La peau est le plus grand organe du corps humain.",true,"Chez l’adulte, elle pèse plusieurs kilos et protège tout le corps."],"t56":["La couleur rouge rend le taureau furieux.",false,"Le taureau distingue mal le rouge : c’est le mouvement qui l’excite, pas la couleur."],"t57":["La mouche domestique ne vit qu’un jour.",false,"Elle vit environ un mois. Ce sont les éphémères adultes qui vivent un ou deux jours."],"t58":["L’ananas pousse sur un arbre.",false,"Il pousse sur une plante basse, au centre d’une rosette de feuilles."],"t59":["La cacahuète est une noix.",false,"C’est une légumineuse, cousine du pois et du haricot. Ses gousses mûrissent sous terre."],"t60":["Il fait aussi froid au pôle Nord qu’au pôle Sud.",false,"Le pôle Sud est bien plus froid : il est sur un continent glacé, le pôle Nord sur l’océan."]});

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
    channelUser: "",
    book: [],
    bookLoading: false
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
  const truthCard = id => (TRUTH[language()] || TRUTH.en)[id] || TRUTH.en[id] || ["", true, ""];
  const whoText = id => (WHO[language()] || WHO.en)[WHO_IDS.indexOf(id)] || WHO.en[WHO_IDS.indexOf(id)] || "";
  const phraseText = id => (PHRASES[language()] || PHRASES.en)[PHRASE_IDS.indexOf(id)] || PHRASES.en[PHRASE_IDS.indexOf(id)] || "";
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
    root.querySelector("[data-glg=title]").textContent = isPlay ? tr("quizTitle") : isYesNo ? tr(ROOM_TITLES[state.yn?.kind] || "ynTitle") : tr("title");
    root.querySelector(".glg-close").setAttribute("aria-label", tr("close"));
    const body = root.querySelector(".glg-body");
    const views = { hub: renderHub, names: renderNames, answers: renderAnswers, created: renderCreated, detail: renderDetail, "play-loading": renderPlayLoading, "play-missing": renderPlayMissing, "play-intro": renderPlayIntro, "play-question": renderPlayQuestion, "play-result": renderPlayResult, "yn-loading": renderPlayLoading, "yn-names": renderYesNoNames, "yn-lobby": renderYesNoLobby, "yn-join": renderYesNoJoin, "yn-card": renderYesNoCard, "yn-end": renderYesNoEnd, "yn-missing": renderYesNoMissing, book: renderBook };
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
      <article class="glg-hero glg-yn-hero">
        ${cardsBadge()}
        <h3>${escapeHtml(tr("mcTitle"))}</h3>
        <p>${escapeHtml(tr("mcNote"))}</p>
        <button class="glg-primary" type="button" data-action="mc-create">${icon("ic-plus")} ${escapeHtml(tr("ynCreate"))}</button>
      </article>
      <article class="glg-hero glg-yn-hero">
        ${truthBadge()}
        <h3>${escapeHtml(tr("tfTitle"))}</h3>
        <p>${escapeHtml(tr("tfNote"))}</p>
        <button class="glg-primary" type="button" data-action="tf-create">${icon("ic-plus")} ${escapeHtml(tr("ynCreate"))}</button>
      </article>
      <article class="glg-hero glg-yn-hero">
        ${lovesThumbs("s12")}
        <h3>${escapeHtml(tr("duTitle"))}</h3>
        <p>${escapeHtml(tr("duNote"))}</p>
        <button class="glg-primary" type="button" data-action="du-create">${icon("ic-plus")} ${escapeHtml(tr("ynCreate"))}</button>
      </article>
      <article class="glg-hero glg-yn-hero">
        <div class="glg-yn-chips glg-who-chips" aria-hidden="true"><b>${escapeHtml(tr("whoMe"))}</b><i>?</i><b>♥</b></div>
        <h3>${escapeHtml(tr("whoTitle"))}</h3>
        <p>${escapeHtml(tr("whoNote"))}</p>
        <button class="glg-primary" type="button" data-action="who-create">${icon("ic-plus")} ${escapeHtml(tr("ynCreate"))}</button>
      </article>
      <article class="glg-hero glg-yn-hero">
        <div class="glg-ph-badge" aria-hidden="true">${HEART}<span>…</span></div>
        <h3>${escapeHtml(tr("phTitle"))}</h3>
        <p>${escapeHtml(tr("phNote"))}</p>
        <div class="glg-actions"><button class="glg-secondary" type="button" data-action="book">${escapeHtml(tr("bookTitle"))}</button><button class="glg-primary" type="button" data-action="ph-create">${icon("ic-plus")} ${escapeHtml(tr("ynCreate"))}</button></div>
      </article>
      ${mine}`;
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
      case "mc-create": return startYesNoCreate("cards");
      case "du-create": return startYesNoCreate("duel");
      case "who-create": return startYesNoCreate("who");
      case "ph-create": return startYesNoCreate("phrase");
      case "tf-create": return startYesNoCreate("truth");
      case "ph-submit": return submitPhrase(target);
      case "ph-next": return hostNext(state.yn?.index ?? 0);
      case "ph-save": return saveToBook(state.yn?.index ?? -1);
      case "book": if (state.yn) leaveYesNo(); return openBook();
      case "book-delete": return deleteBookPage(target.dataset.id);
      case "invite-friend": return inviteFriend(target.dataset.id);
      case "mc-flip": return cardsFlip(state.yn?.role, Number(target.dataset.index));
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
      items: shuffle(shown(QUESTION_IDS)).slice(0, QUIZ_SIZE).map(id => ({ id, answer: null }))
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
    const pool = shown(QUESTION_IDS).filter(id => !used.has(id));
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

  // «Кто быстрее»: 6 секунд найти картинку; «Кто из нас?»: 10 секунд;
  // «Закончи фразу»: минута на ответ, дальше ведущий листает сам.
  const DUEL_SECONDS = 6;
  const DUEL_ROUNDS = 20;
  const DUEL_REVEAL_MS = 2800;
  const WHO_SECONDS = 10;
  const WHO_ROUNDS = 40;
  const WHO_REVEAL_MS = 3400;
  const PHRASE_SECONDS = 60;
  const PHRASE_ROUNDS = 12;
  const PHRASE_MAX = 200;
  // В этих играх раунд открывается сразу, как только ответили оба.
  const TRUTH_SECONDS = 12;
  const TRUTH_ROUNDS = 35;
  const TRUTH_REVEAL_MS = 5200;
  const EARLY_REVEAL = Object.freeze(["duel", "who", "phrase", "truth"]);

  const roomSeconds = yn => ({ loves: LOVES_SECONDS, duel: DUEL_SECONDS, who: WHO_SECONDS, phrase: PHRASE_SECONDS, truth: TRUTH_SECONDS })[yn?.kind] || YES_NO_SECONDS;
  const roomChoices = yn => (yn?.kind === "loves" || yn?.kind === "duel" ? LOVES_CHOICES : yn?.kind === "who" ? ["host", "guest"] : yn?.kind === "truth" ? ["true", "false"] : ["yes", "no"]);
  const roomRounds = kind => ({ loves: LOVES_ROUNDS, duel: DUEL_ROUNDS, who: WHO_ROUNDS, phrase: PHRASE_ROUNDS, truth: TRUTH_ROUNDS })[kind] || YES_NO_ROUNDS;
  const roomDeckIds = kind => ({ loves: LOVES_IDS, duel: CARD_PICTURES, who: WHO_IDS, phrase: PHRASE_IDS, truth: TRUTH_IDS.filter(id => truthCard(id)[0]) })[kind] || YES_NO_IDS;
  const roomRevealMs = kind => ({ loves: LOVES_REVEAL_MS, duel: DUEL_REVEAL_MS, who: WHO_REVEAL_MS, truth: TRUTH_REVEAL_MS })[kind] || YES_NO_REVEAL_MS;
  const validAnswer = (yn, value) => (yn?.kind === "phrase"
    ? typeof value === "string" && Boolean(value.trim()) && value.length <= PHRASE_MAX
    : roomChoices(yn).includes(value));
  const partnerOf = role => (role === "host" ? "guest" : "host");
  const nameOf = (yn, role) => (role === "host" ? yn.hostName : yn.guestName) || tr("anonymous");
  function newDeck(kind) {
    if (kind === "duel") return shuffle(shown(CARD_PICTURES)).slice(0, DUEL_ROUNDS);
    return shuffle(shown(roomDeckIds(kind))).slice(0, roomRounds(kind));
  }
  const lovesImage = (id, choice) => `assets/loves/${id}${choice}.webp`;
  function lovesThumbs(id) {
    return `<div class="glg-lv-thumbs" aria-hidden="true">${LOVES_CHOICES.map(choice => `<i style="background-image:url('${lovesImage(id, choice)}')"></i>`).join("")}</div>`;
  }
  function truthBadge() {
    return `<div class="glg-yn-chips glg-tf-chips" aria-hidden="true"><b>${escapeHtml(tr("tfTrue"))}</b><i>?</i><b>${escapeHtml(tr("tfFalse"))}</b></div>`;
  }
  function cardsBadge() {
    return `<div class="glg-mc-badge" aria-hidden="true">${["s04a", "", "", "s04a"].map(id => id ? `<i style="background-image:url('assets/loves/${id}.webp')"></i>` : `<i class="is-back">${HEART}</i>`).join("")}</div>`;
  }
  function roomBadge(yn) {
    if (yn?.kind === "cards") return cardsBadge();
    if (yn?.kind === "loves") return lovesThumbs("s07");
    if (yn?.kind === "duel") return lovesThumbs("s12");
    if (yn?.kind === "who") return `<div class="glg-yn-chips glg-who-chips" aria-hidden="true"><b>${escapeHtml(tr("whoMe"))}</b><i>?</i><b>♥</b></div>`;
    if (yn?.kind === "truth") return truthBadge();
    if (yn?.kind === "phrase") return `<div class="glg-ph-badge" aria-hidden="true">${HEART}<span>…</span></div>`;
    return `<div class="glg-yn-chips" aria-hidden="true"><b>${escapeHtml(tr("ynYes"))}</b><i>5</i><b>${escapeHtml(tr("ynNo"))}</b></div>`;
  }

  function startYesNoCreate(kind = "yesno", options = {}) {
    if (!premium()) { app()?.openPaywall?.(); return; }
    if (!signedIn()) { renderSignIn(); return; }
    if (state.yn) leaveYesNo();
    const appState = app()?.getState?.() || {};
    state.yn = { kind: ROOM_TITLES[kind] ? kind : "yesno", role: "host", roomId: "", hostName: cleanName(appState.senderName), guestName: cleanName(options.guestName || appState.recipientName), partnerOnline: false, phase: "names", deck: [], index: 0, answers: { host: [], guest: [] }, times: { host: [], guest: [] }, wins: { host: 0, guest: 0 }, revealed: [], saved: [], invited: [], pendingInvite: options.inviteFriend || "", mine: null, timers: [], channel: null };
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
      if (yn.pendingInvite) inviteFriend(yn.pendingInvite);
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
      <section class="glg-section glg-center glg-yn-wait">${status}</section>
      ${yn.partnerOnline ? "" : renderInviteFriends()}`;
  }

  // «Позвать друга»: друзья из раздела «Друзья» получают сообщение с игрой.
  function renderInviteFriends() {
    const friendsApi = window.GlowLetterFriends;
    if (!friendsApi?.friends || !signedIn()) return "";
    const friends = friendsApi.friends();
    const yn = state.yn;
    const rows = friends.map(friend => {
      const sent = yn.invited.includes(friend.user_id);
      return `<li class="glg-invite-row"><span class="glg-invite-dot${friend.online ? " is-online" : ""}" aria-hidden="true"></span><span class="glg-invite-name">${escapeHtml(friend.name)}</span>
        <button class="${sent ? "glg-secondary" : "glg-primary"} glg-invite-button" type="button" data-action="invite-friend" data-id="${escapeHtml(friend.user_id)}"${sent ? " disabled" : ""}>${escapeHtml(tr(sent ? "invited" : "invite"))}</button></li>`;
    }).join("");
    return `<section class="glg-section glg-invite"><h3>${escapeHtml(tr("inviteTitle"))}</h3>
      ${friends.length ? `<p class="glg-muted">${escapeHtml(tr("inviteNote"))}</p><ul class="glg-invite-list">${rows}</ul>` : `<p class="glg-muted">${escapeHtml(tr("inviteNone"))}</p>`}</section>`;
  }

  async function inviteFriend(friendId) {
    const yn = state.yn;
    const friendsApi = window.GlowLetterFriends;
    if (!yn?.roomId || !friendId || !friendsApi?.inviteToGame || yn.invited.includes(friendId)) return;
    yn.invited.push(friendId);
    if (state.view === "yn-lobby") render();
    try {
      const name = await friendsApi.inviteToGame(friendId, yn.kind, yn.roomId);
      notify(tr("inviteSent", { name: name || "" }), 3000);
    } catch {
      yn.invited = yn.invited.filter(id => id !== friendId);
      notify(tr("failed"), 3600);
      if (state.view === "yn-lobby") render();
    }
  }

  async function shareRoom() {
    const yn = state.yn;
    if (!yn?.roomId) return;
    const text = tr({ loves: "lvShareText", cards: "mcShareText", duel: "duShareText", who: "whoShareText", phrase: "phShareText", truth: "tfShareText" }[yn.kind] || "ynShareText", { name: yn.hostName || "GlowLetter" });
    const title = tr(ROOM_TITLES[yn.kind] || "ynTitle");
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
    if (state.yn) leaveYesNo();
    state.yn = { kind: "yesno", role: "guest", roomId, hostName: "", guestName: "", partnerOnline: false, phase: "join", deck: [], index: 0, answers: { host: [], guest: [] }, times: { host: [], guest: [] }, wins: { host: 0, guest: 0 }, revealed: [], saved: [], invited: [], mine: null, timers: [], channel: null, offline: false };
    open("yn-loading");
    const base = String(appConfig().supabaseUrl || "").replace(/\/+$/u, "");
    const headers = { Accept: "application/json" };
    if (appConfig().supabasePublishableKey) headers.apikey = appConfig().supabasePublishableKey;
    try {
      const response = await fetch(`${base}/functions/v1/couple-quiz?room=${encodeURIComponent(roomId)}`, { headers, cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.state !== "ready" || !ROOM_TITLES[payload.kind]) throw new Error("missing");
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
        <p class="glg-muted">${escapeHtml(tr({ loves: "lvJoinLead", cards: "mcJoinLead", duel: "duJoinLead", who: "whoJoinLead", phrase: "phJoinLead", truth: "tfJoinLead" }[yn.kind] || "ynJoinLead", { name: yn.hostName }))}</p>
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
    clearTimeout(state.yn?.turnTimer);
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
    if (yn.kind === "cards") { hostStartCards(); return; }
    clearYesNoTimers();
    yn.deck = newDeck(yn.kind);
    yn.answers = { host: [], guest: [] };
    yn.times = { host: [], guest: [] };
    yn.wins = { host: 0, guest: 0 };
    yn.revealed = [];
    yn.saved = [];
    sendYesNo({ type: "start", deck: yn.deck, guestName: yn.guestName });
    hostRound(0);
  }

  function hostRound(index) {
    const yn = state.yn;
    if (!yn) return;
    // Колода едет с каждым раундом: партнёр, пропустивший «start», догонит игру.
    sendYesNo({ type: "round", index, deck: yn.deck });
    beginRound(index);
    yn.timers.push(setTimeout(() => { if (state.yn === yn) hostReveal(index); }, roomSeconds(yn) * 1000 + 1200));
  }

  async function hostReveal(index) {
    const yn = state.yn;
    if (!yn || yn.revealed[index]) return;
    yn.revealed[index] = true;
    const host = yn.answers.host[index] ?? null;
    let guest = yn.answers.guest[index] ?? null;
    // Текст партнёра проверяется тем же фильтром слов, что и свой.
    if (yn.kind === "phrase" && guest && !(await phraseAllowed(guest))) guest = null;
    if (state.yn !== yn) return;
    yn.answers.guest[index] = guest;
    const extra = {};
    if (yn.kind === "duel") {
      const right = yn.deck[index].slice(-1);
      const ms = role => (yn.answers[role][index] === right ? Number(yn.times[role][index]) : Infinity);
      const winner = ms("host") === Infinity && ms("guest") === Infinity ? null : ms("host") <= ms("guest") ? "host" : "guest";
      if (winner) yn.wins[winner] += 1;
      Object.assign(extra, { hostMs: yn.times.host[index] ?? null, guestMs: yn.times.guest[index] ?? null, winner, wins: { ...yn.wins } });
    }
    if (yn.kind === "truth") {
      // Очко за каждый верный ответ; кто ответил верно быстрее — тот «первый».
      const right = truthCard(yn.deck[index])[1] ? "true" : "false";
      const ms = role => (yn.answers[role][index] === right ? Number(yn.times[role][index]) : Infinity);
      ["host", "guest"].forEach(role => { if (yn.answers[role][index] === right) yn.wins[role] += 1; });
      const winner = ms("host") === Infinity && ms("guest") === Infinity ? null : ms("host") <= ms("guest") ? "host" : "guest";
      Object.assign(extra, { winner, wins: { ...yn.wins } });
    }
    sendYesNo({ type: "reveal", index, host, guest, ...extra });
    showReveal(index, host, guest, extra);
    if (yn.kind === "phrase") return;
    yn.timers.push(setTimeout(() => { if (state.yn === yn) hostNext(index); }, roomRevealMs(yn.kind)));
  }

  function hostNext(index) {
    const yn = state.yn;
    if (!yn || yn.role !== "host") return;
    clearYesNoTimers();
    if (index + 1 < yn.deck.length) hostRound(index + 1);
    else { sendYesNo({ type: "end", host: yn.answers.host, guest: yn.answers.guest, wins: yn.wins }); showYesNoEnd(); }
  }

  function maybeRevealEarly(index) {
    const yn = state.yn;
    if (!yn || yn.role !== "host" || !EARLY_REVEAL.includes(yn.kind) || yn.index !== index) return;
    if (yn.answers.host[index] != null && yn.answers.guest[index] != null) {
      clearYesNoTimers();
      hostReveal(index);
    }
  }

  async function phraseAllowed(text) {
    const client = yesNoClient();
    if (!client?.rpc) return false;
    try {
      const { data, error } = await client.rpc("glowletter_check_phrase", { p_text: String(text).slice(0, PHRASE_MAX) });
      return !error && data === true;
    } catch { return false; }
  }

  function onYesNoMessage(message) {
    const yn = state.yn;
    if (!yn) return;
    if (yn.kind === "cards") { onCardsMessage(message); return; }
    const index = Number(message.index);
    if (message.type === "answer" && yn.role === "host" && Number.isInteger(index) && validAnswer(yn, message.value)) {
      if (yn.phase === "round" && yn.index === index && yn.answers.guest[index] == null) {
        yn.answers.guest[index] = yn.kind === "phrase" ? message.value.trim().slice(0, PHRASE_MAX) : message.value;
        if (yn.kind === "duel" || yn.kind === "truth") yn.times.guest[index] = Math.max(0, Math.min(Number(message.ms) || roomSeconds(yn) * 1000, roomSeconds(yn) * 1000));
        maybeRevealEarly(index);
      }
      return;
    }
    if (yn.role !== "guest") return;
    const deckOf = list => list.filter(id => roomDeckIds(yn.kind).includes(id)).slice(0, roomRounds(yn.kind));
    if (message.type === "start" && Array.isArray(message.deck)) {
      yn.deck = deckOf(message.deck);
      yn.answers = { host: [], guest: [] };
      yn.wins = { host: 0, guest: 0 };
      yn.saved = [];
    } else if (message.type === "round" && Number.isInteger(index)) {
      if (Array.isArray(message.deck) && message.deck.join() !== yn.deck.join()) yn.deck = deckOf(message.deck);
      beginRound(index);
    } else if (message.type === "reveal" && Number.isInteger(index)) {
      const value = answer => (validAnswer(yn, answer) ? answer : null);
      yn.answers.host[index] = value(message.host);
      yn.answers.guest[index] = value(message.guest);
      const extra = {};
      if (yn.kind === "duel") {
        const ms = value => (Number.isFinite(Number(value)) ? Number(value) : null);
        Object.assign(extra, { hostMs: ms(message.hostMs), guestMs: ms(message.guestMs), winner: ["host", "guest"].includes(message.winner) ? message.winner : null });
        if (message.wins) yn.wins = { host: Number(message.wins.host) || 0, guest: Number(message.wins.guest) || 0 };
      }
      if (yn.kind === "truth") {
        Object.assign(extra, { winner: ["host", "guest"].includes(message.winner) ? message.winner : null });
        if (message.wins) yn.wins = { host: Number(message.wins.host) || 0, guest: Number(message.wins.guest) || 0 };
      }
      showReveal(index, yn.answers.host[index], yn.answers.guest[index], extra);
    } else if (message.type === "end") {
      if (message.wins) yn.wins = { host: Number(message.wins.host) || 0, guest: Number(message.wins.guest) || 0 };
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
    yn.order = yn.kind === "duel" ? shuffle(LOVES_CHOICES) : LOVES_CHOICES;
    state.error = "";
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
    if (!yn || yn.phase !== "round" || yn.mine || !validAnswer(yn, value)) return;
    const ms = Math.min(Date.now() - yn.roundStart, roomSeconds(yn) * 1000);
    yn.mine = value;
    yn.answers[yn.role][yn.index] = value;
    yn.times[yn.role][yn.index] = ms;
    if (yn.role === "guest") sendYesNo({ type: "answer", index: yn.index, value, ms });
    updateYesNoCard();
    maybeRevealEarly(yn.index);
  }

  async function submitPhrase(form) {
    const yn = state.yn;
    const text = String(form.elements.answer?.value || "").replace(/\s+/gu, " ").trim().slice(0, PHRASE_MAX);
    if (!yn || yn.phase !== "round" || yn.mine || !text || state.busy) return;
    state.busy = true;
    const index = yn.index;
    const allowed = await phraseAllowed(text);
    state.busy = false;
    if (state.yn !== yn || yn.index !== index) return;
    if (!allowed) {
      state.error = tr("phForbidden");
      const error = state.root?.querySelector(".glg-ph-form .glg-error");
      if (error) error.textContent = state.error;
      return;
    }
    answerYesNo(text);
  }

  async function saveToBook(index) {
    const yn = state.yn;
    if (!yn || yn.kind !== "phrase" || yn.saved.includes(index) || !signedIn()) return;
    const client = cloud()?.getClient?.();
    if (!client) return;
    yn.saved.push(index);
    render();
    try {
      const { error } = await client.rpc("glowletter_book_add", {
        p_prompt: yn.deck[index], p_language: language(), p_partner: nameOf(yn, partnerOf(yn.role)),
        p_mine: yn.answers[yn.role][index] || null, p_theirs: yn.answers[partnerOf(yn.role)][index] || null
      });
      if (error) throw error;
      notify(tr("phSaved"), 2600);
    } catch {
      yn.saved = yn.saved.filter(item => item !== index);
      notify(tr("failed"), 3600);
      render();
    }
  }

  function showReveal(index, host, guest, extra = {}) {
    const yn = state.yn;
    if (!yn) return;
    yn.index = index;
    yn.phase = "reveal";
    yn.reveal = { host, guest, ...extra };
    state.view = "yn-card";
    render();
  }

  // Карточка перерисовывается целиком только при смене фазы, чтобы полоска
  // таймера шла плавно.
  function updateYesNoCard() {
    if (state.view !== "yn-card") return;
    if (state.yn?.kind !== "yesno") { render(); return; }
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
    if (yn.kind === "cards") return renderCardsBoard();
    if (yn.kind === "loves") return renderLovesCard();
    if (yn.kind === "duel") return renderDuelCard();
    if (yn.kind === "truth") return renderTruthCard();
    if (yn.kind === "who") return renderWhoCard();
    if (yn.kind === "phrase") return renderPhraseCard();
    const id = yn.deck[yn.index];
    const [text, yesText, noText] = yesNoCard(id);
    const artId = YES_NO_ART[id] || YES_NO_ART_MORE[id] || "";
    const art = /^s\d\d[a-d]$/u.test(artId) ? lovesImage(artId.slice(0, 3), artId.slice(3)) : YES_NO_ART_FILES[artId] || YES_NO_ART_FILES.bears;
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
    if (yn.kind === "cards") return renderCardsEnd();
    if (yn.kind === "duel") return renderDuelEnd();
    if (yn.kind === "truth") return renderTruthEnd();
    if (yn.kind === "phrase") return renderPhraseEnd();
    const total = yn.deck.length;
    const score = yn.deck.filter((_, index) => yn.answers.host[index] && yn.answers.host[index] === yn.answers.guest[index]).length;
    const ratio = total ? score / total : 0;
    return `
      <article class="glg-score">
        ${hearts(Math.round(ratio * 10), 10)}
        <p class="glg-score-number">${escapeHtml(tr(yn.kind === "who" ? "whoFinal" : "ynFinal", { score, total }))}</p>
        <h3>${escapeHtml(tr(yn.kind === "loves" ? (ratio >= 0.5 ? "lvFinalHigh" : "lvFinalMid") : yn.kind === "who" ? (ratio >= 0.6 ? "whoFinalHigh" : "whoFinalMid") : (ratio >= 0.6 ? "ynFinalHigh" : "ynFinalMid")))}</h3>
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

  // ——— «Кто быстрее», «Кто из нас?», «Закончи фразу» ———

  function endActions(yn) {
    return `<div class="glg-actions glg-stack">
        ${yn.role === "host" ? `<button class="glg-primary" type="button" data-action="yn-again"${yn.partnerOnline ? "" : " disabled"}>↻ ${escapeHtml(tr("ynAgain"))}</button>` : `<p class="glg-muted glg-center">${escapeHtml(tr("ynWaitHost", { name: yn.hostName }))}</p>`}
        <button class="glg-secondary" type="button" data-action="close">${escapeHtml(tr("home"))}</button>
      </div>`;
  }

  function scoreLine(yn, mine, theirs) {
    return `<p class="glg-mc-scores"><span>${escapeHtml(tr("ynYou"))} <b>${HEART} ${mine}</b></span><span>${escapeHtml(nameOf(yn, partnerOf(yn.role)))} <b>${HEART} ${theirs}</b></span></p>`;
  }

  function renderDuelCard() {
    const yn = state.yn;
    const card = yn.deck[yn.index] || "";
    const id = card.slice(0, 3);
    const right = card.slice(-1);
    const [, ...labels] = lovesSet(id);
    const item = labels[LOVES_CHOICES.indexOf(right)] || "";
    const reveal = yn.phase === "reveal";
    const mine = reveal ? yn.reveal[yn.role] : yn.mine;
    const theirs = reveal ? yn.reveal[partnerOf(yn.role)] : null;
    const tiles = (yn.order || LOVES_CHOICES).map(choice => {
      const classes = ["glg-lv-tile", "glg-du-tile"];
      if (mine === choice) classes.push(choice === right ? "is-right" : "is-wrong");
      if (reveal && choice === right) classes.push("is-answer");
      const badges = `${mine === choice ? `<b class="glg-lv-badge is-you">${escapeHtml(tr("ynYou"))}</b>` : ""}${theirs === choice ? `<b class="glg-lv-badge is-them">${escapeHtml(nameOf(yn, partnerOf(yn.role)))}</b>` : ""}`;
      const open = yn.phase === "round" && !yn.mine;
      return `<button class="${classes.join(" ")}" type="button" data-action="yn-answer" data-value="${choice}"${open ? "" : " disabled"} aria-label="${escapeHtml(labels[LOVES_CHOICES.indexOf(choice)])}">
        <span class="glg-lv-img" style="background-image:url('${lovesImage(id, choice)}')"></span>${badges}
      </button>`;
    }).join("");
    let status;
    if (reveal) {
      const seconds = role => {
        const value = yn.reveal[`${role}Ms`];
        return Number.isFinite(value) ? ` · ${tr("duSeconds", { s: (value / 1000).toFixed(2) })}` : "";
      };
      if (!yn.reveal.winner) status = tr("duNobody");
      else if (yn.reveal.winner === yn.role) status = `${tr("duYouWon")}${seconds(yn.role)}`;
      else status = `${tr("duTheyWon", { name: nameOf(yn, partnerOf(yn.role)) })}${seconds(partnerOf(yn.role))}`;
    } else if (yn.mine) status = yn.mine === right ? tr("ynAnswered") : tr("duWrong");
    else if (yn.phase === "closed") status = tr("ynMissed");
    else status = "";
    return `
      <p class="glg-step">${escapeHtml(tr("duRound", { n: yn.index + 1, total: yn.deck.length }))}</p>
      <h3 class="glg-lv-topic glg-du-find">${escapeHtml(tr("duFind", { item }))}</h3>
      ${reveal ? "" : timerBar(yn)}
      <div class="glg-lv-grid glg-du-grid${reveal ? " is-revealed" : yn.mine ? " is-answered" : ""}">${tiles}</div>
      <p class="glg-yn-status glg-lv-status${reveal && yn.reveal.winner === yn.role ? " is-match" : ""}">${escapeHtml(status)}</p>
      ${scoreLine(yn, yn.wins[yn.role], yn.wins[partnerOf(yn.role)])}`;
  }

  function renderDuelEnd() {
    const yn = state.yn;
    const mine = yn.wins[yn.role];
    const theirs = yn.wins[partnerOf(yn.role)];
    const name = nameOf(yn, partnerOf(yn.role));
    return `
      <article class="glg-score">
        ${lovesThumbs("s12")}
        <p class="glg-score-number">${escapeHtml(tr("duScore", { you: mine, them: theirs, name }))}</p>
        <h3>${escapeHtml(mine > theirs ? tr("duFinalWin") : mine < theirs ? tr("duFinalLose", { name }) : tr("duFinalDraw"))}</h3>
      </article>
      ${endActions(yn)}`;
  }

  function renderTruthCard() {
    const yn = state.yn;
    const [statement, isTrue, fact] = truthCard(yn.deck[yn.index]);
    const right = isTrue ? "true" : "false";
    const reveal = yn.phase === "reveal";
    const partner = partnerOf(yn.role);
    const label = value => (value === "true" ? tr("tfTrue") : value === "false" ? tr("tfFalse") : "—");
    let body;
    if (reveal) {
      const mine = yn.reveal[yn.role];
      const theirs = yn.reveal[partner];
      const line = (name, value) => `<p class="glg-yn-line"><b>${escapeHtml(name)}</b> <span class="glg-tf-answer${value ? (value === right ? " is-right" : " is-wrong") : ""}">${value ? (value === right ? "✓ " : "✗ ") : ""}${escapeHtml(label(value))}</span></p>`;
      body = `<div class="glg-yn-reveal glg-tf-reveal${mine === right ? " is-match" : ""}">
        <p class="glg-tf-verdict is-${right}">${escapeHtml(tr(isTrue ? "tfIsTrue" : "tfIsFalse"))}</p>
        ${fact ? `<p class="glg-tf-fact">${escapeHtml(fact)}</p>` : ""}
        ${line(tr("ynYou"), mine)}${line(nameOf(yn, partner), theirs)}
        ${yn.reveal.winner ? `<p class="glg-yn-caption">${escapeHtml(yn.reveal.winner === yn.role ? tr("tfFirstYou") : tr("tfFirstThem", { name: nameOf(yn, partner) }))}</p>` : ""}
      </div>`;
    } else if (yn.phase === "round" && !yn.mine) {
      body = `${timerBar(yn)}<div class="glg-yn-actions"><button class="glg-yn-button is-yes" type="button" data-action="yn-answer" data-value="true">${escapeHtml(tr("tfTrue"))}</button><button class="glg-yn-button is-no" type="button" data-action="yn-answer" data-value="false">${escapeHtml(tr("tfFalse"))}</button></div>`;
    } else {
      body = `${yn.phase === "round" ? timerBar(yn) : ""}<p class="glg-yn-status">${escapeHtml(yn.mine ? `${label(yn.mine)} · ${tr("ynAnswered")}` : tr("ynMissed"))}</p>`;
    }
    return `
      <p class="glg-step">${escapeHtml(tr("tfRound", { n: yn.index + 1, total: yn.deck.length }))}</p>
      <article class="glg-yn-card glg-tf-card${reveal ? " is-revealed" : ""}">
        ${truthBadge()}
        <h3>${escapeHtml(statement)}</h3>
        ${body}
      </article>
      ${scoreLine(yn, yn.wins[yn.role], yn.wins[partner])}`;
  }

  function renderTruthEnd() {
    const yn = state.yn;
    const mine = yn.wins[yn.role];
    const theirs = yn.wins[partnerOf(yn.role)];
    const name = nameOf(yn, partnerOf(yn.role));
    return `
      <article class="glg-score">
        ${truthBadge()}
        <p class="glg-score-number">${escapeHtml(tr("duScore", { you: mine, them: theirs, name }))}</p>
        <h3>${escapeHtml(mine > theirs ? tr("tfFinalWin") : mine < theirs ? tr("tfFinalLose", { name }) : tr("tfFinalDraw"))}</h3>
      </article>
      ${endActions(yn)}`;
  }

  function renderWhoCard() {
    const yn = state.yn;
    const id = yn.deck[yn.index];
    const partner = partnerOf(yn.role);
    const reveal = yn.phase === "reveal";
    let body;
    if (reveal) {
      const mine = yn.reveal[yn.role];
      const theirs = yn.reveal[partner];
      const label = role => (role === yn.role ? tr("whoMe") : nameOf(yn, role));
      const agree = mine && theirs && mine === theirs;
      body = `<div class="glg-yn-reveal${agree ? " is-match" : ""}">
          ${agree ? `<p class="glg-yn-match">${HEART} ${escapeHtml(tr("whoAgree", { name: nameOf(yn, mine) }))}</p>` : `<p class="glg-yn-caption">${escapeHtml(mine && theirs ? tr("whoDiffer") : !mine ? tr("ynMissed") : tr("ynPartnerMissed"))}</p>`}
          <p class="glg-yn-line"><b>${escapeHtml(nameOf(yn, partner))}</b> <span class="glg-yn-answer">${escapeHtml(theirs ? nameOf(yn, theirs) : "—")}</span></p>
          <p class="glg-yn-line is-mine"><b>${escapeHtml(tr("ynYou"))}</b> <span class="glg-yn-answer">${escapeHtml(mine ? label(mine) : "—")}</span></p>
        </div>`;
    } else body = timerBar(yn);
    let actions = "";
    if (!reveal) {
      if (yn.phase === "round" && !yn.mine) {
        actions = `<div class="glg-yn-actions"><button class="glg-yn-button is-yes" type="button" data-action="yn-answer" data-value="${yn.role}">${escapeHtml(tr("whoMe"))}</button><button class="glg-yn-button is-no" type="button" data-action="yn-answer" data-value="${partner}">${escapeHtml(nameOf(yn, partner))}</button></div>`;
      } else {
        actions = `<div class="glg-yn-actions"><p class="glg-yn-status">${escapeHtml(yn.mine ? `${yn.mine === yn.role ? tr("whoMe") : nameOf(yn, partner)} · ${tr("ynAnswered")}` : tr("ynMissed"))}</p></div>`;
      }
    }
    return `
      <p class="glg-step">${escapeHtml(tr("whoRound", { n: yn.index + 1, total: yn.deck.length }))}</p>
      <article class="glg-yn-card glg-who-card${reveal ? " is-revealed" : ""}">
        <div class="glg-yn-chips glg-who-chips" aria-hidden="true"><b>${escapeHtml(tr("whoMe"))}</b><i>?</i><b>${escapeHtml(nameOf(yn, partner))}</b></div>
        <h3>${escapeHtml(whoText(id))}</h3>
        ${body}
      </article>
      ${actions}`;
  }

  function renderPhraseCard() {
    const yn = state.yn;
    const id = yn.deck[yn.index];
    const partner = partnerOf(yn.role);
    const prompt = phraseText(id);
    if (yn.phase === "reveal") {
      const mine = yn.reveal[yn.role];
      const theirs = yn.reveal[partner];
      const saved = yn.saved.includes(yn.index);
      const canSave = signedIn() && (mine || theirs);
      return `
        <p class="glg-step">${escapeHtml(tr("phRound", { n: yn.index + 1, total: yn.deck.length }))}</p>
        <article class="glg-yn-card glg-ph-card is-revealed">
          <h3>${escapeHtml(prompt)}</h3>
          <div class="glg-ph-answers">
            <p class="glg-ph-answer"><b>${escapeHtml(nameOf(yn, partner))}</b><span>${escapeHtml(theirs || tr("phSkipped"))}</span></p>
            <p class="glg-ph-answer is-mine"><b>${escapeHtml(tr("ynYou"))}</b><span>${escapeHtml(mine || tr("phSkipped"))}</span></p>
          </div>
        </article>
        <div class="glg-actions glg-stack">
          ${canSave ? `<button class="glg-secondary" type="button" data-action="ph-save"${saved ? " disabled" : ""}>${HEART} ${escapeHtml(tr(saved ? "phSaved" : "phSave"))}</button>` : ""}
          ${yn.role === "host" ? `<button class="glg-primary" type="button" data-action="ph-next">${escapeHtml(tr(yn.index + 1 < yn.deck.length ? "phNext" : "next"))} →</button>` : `<p class="glg-muted glg-center">${escapeHtml(tr("ynWaitHost", { name: yn.hostName }))}</p>`}
        </div>`;
    }
    const form = yn.phase === "round" && !yn.mine
      ? `<form class="glg-form glg-ph-form" data-submit="ph-submit" novalidate>
          <textarea name="answer" rows="3" maxlength="${PHRASE_MAX}" dir="auto" placeholder="${escapeHtml(tr("phPlaceholder"))}"></textarea>
          <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
          <button class="glg-primary glg-wide" type="submit">${escapeHtml(tr("phDone"))}</button>
        </form>`
      : `<p class="glg-yn-status">${escapeHtml(yn.mine ? tr("phWaiting", { name: nameOf(yn, partner) }) : tr("ynMissed"))}</p>`;
    return `
      <p class="glg-step">${escapeHtml(tr("phRound", { n: yn.index + 1, total: yn.deck.length }))}</p>
      <article class="glg-yn-card glg-ph-card">
        <h3>${escapeHtml(prompt)}</h3>
        ${timerBar(yn)}
      </article>
      ${form}`;
  }

  function renderPhraseEnd() {
    const yn = state.yn;
    const count = yn.deck.filter((_, index) => yn.answers.host[index] && yn.answers.guest[index]).length;
    return `
      <article class="glg-score">
        <div class="glg-ph-badge" aria-hidden="true">${HEART}<span>…</span></div>
        <p class="glg-score-number">${escapeHtml(tr("phFinal", { count }))}</p>
        <h3>${escapeHtml(tr("phFinalLead"))}</h3>
      </article>
      ${signedIn() ? `<button class="glg-secondary glg-wide" type="button" data-action="book">${escapeHtml(tr("bookOpen"))}</button>` : ""}
      ${endActions(yn)}`;
  }

  // ——— «Книга пары» ———

  async function openBook() {
    if (!signedIn()) { renderSignIn(); return; }
    state.view = "book";
    state.bookLoading = true;
    render();
    const client = cloud()?.getClient?.();
    try {
      const { data, error } = await client.from("glowletter_couple_book").select("id, prompt_id, language, partner_name, mine, theirs, created_at").order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      state.book = data || [];
    } catch { state.error = tr("failed"); }
    state.bookLoading = false;
    if (state.view === "book") render();
  }

  function renderBook() {
    const pages = state.book.map(page => `<li class="glg-book-page">
        <p class="glg-book-prompt">${escapeHtml(phraseText(page.prompt_id))}</p>
        ${page.mine ? `<p class="glg-ph-answer is-mine"><b>${escapeHtml(tr("bookYou"))}</b><span>${escapeHtml(page.mine)}</span></p>` : ""}
        ${page.theirs ? `<p class="glg-ph-answer"><b>${escapeHtml(page.partner_name || tr("anonymous"))}</b><span>${escapeHtml(page.theirs)}</span></p>` : ""}
        <p class="glg-book-meta">${escapeHtml(formatDate(page.created_at))} · <button class="glg-link" type="button" data-action="book-delete" data-id="${escapeHtml(page.id)}">${escapeHtml(tr("bookDelete"))}</button></p>
      </li>`).join("");
    return `
      <button class="glg-link glg-back" type="button" data-action="hub">← ${escapeHtml(tr("back"))}</button>
      <article class="glg-hero glg-book-hero"><div class="glg-ph-badge" aria-hidden="true">${HEART}<span>…</span></div><h3>${escapeHtml(tr("bookTitle"))}</h3><p>${escapeHtml(tr("bookNote"))}</p></article>
      <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
      ${state.bookLoading ? `<p class="glg-center glg-muted">…</p>` : pages ? `<ul class="glg-book">${pages}</ul>` : `<p class="glg-muted glg-center">${escapeHtml(tr("bookEmpty"))}</p>`}`;
  }

  async function deleteBookPage(id) {
    if (!id || !window.confirm(tr("bookDeleteConfirm"))) return;
    const client = cloud()?.getClient?.();
    const { error } = await client.from("glowletter_couple_book").delete().eq("id", id);
    if (error) { notify(tr("failed"), 3600); return; }
    state.book = state.book.filter(page => page.id !== id);
    render();
  }

  // ——— «Карточки с мишками»: игра на память вдвоём ———
  //
  // Ведущий хранит поле и рассылает его целиком после каждого изменения, партнёр
  // только просит открыть карточку. Ходы по очереди: нашёл пару — ходишь ещё,
  // не нашёл — ход переходит. На ход 12 секунд, на уровень — своё время.

  const ROOM_TITLES = Object.freeze({ yesno: "ynTitle", loves: "lvTitle", cards: "mcTitle", duel: "duTitle", who: "whoTitle", phrase: "phTitle", truth: "tfTitle" });
  const CARD_LEVELS = Object.freeze([{ cards: 8, seconds: 75 }, { cards: 12, seconds: 110 }, { cards: 16, seconds: 150 }]);
  const CARD_TURN_SECONDS = 12;
  const CARD_PICTURES = Object.freeze(LOVES_IDS.flatMap(id => LOVES_CHOICES.map(choice => `${id}${choice}`)));

  function cardsBoard(levelIndex) {
    const pairs = CARD_LEVELS[levelIndex].cards / 2;
    const pictures = shuffle(shown(CARD_PICTURES)).slice(0, pairs);
    return shuffle([...pictures, ...pictures]);
  }

  function hostStartCards() {
    const yn = state.yn;
    clearYesNoTimers();
    yn.mc = { level: 0, board: cardsBoard(0), open: [], matched: [], turn: "host", scores: { host: 0, guest: 0 }, phase: "play", levelEnds: Date.now() + CARD_LEVELS[0].seconds * 1000, turnEnds: Date.now() + CARD_TURN_SECONDS * 1000, found: 0, total: 0, note: "" };
    cardsLevelTimer();
    cardsPublish();
  }

  function cardsPublish() {
    const yn = state.yn;
    if (!yn?.mc) return;
    const now = Date.now();
    sendYesNo({ type: "mstate", mc: { ...yn.mc, levelLeft: yn.mc.levelEnds - now, turnLeft: yn.mc.turnEnds - now } });
    showCards();
  }

  function showCards() {
    const yn = state.yn;
    yn.phase = yn.mc.phase === "end" ? "end" : "play";
    state.view = yn.mc.phase === "end" ? "yn-end" : "yn-card";
    render();
  }

  function cardsLevelTimer() {
    const yn = state.yn;
    const level = yn.mc.level;
    yn.timers.push(setTimeout(() => { if (state.yn === yn && yn.mc.level === level && yn.mc.phase === "play") cardsLevelDone(true); }, yn.mc.levelEnds - Date.now()));
    cardsTurnTimer();
  }

  function cardsTurnTimer() {
    const yn = state.yn;
    clearTimeout(yn.turnTimer);
    const { level, turnEnds } = yn.mc;
    yn.turnTimer = setTimeout(() => {
      if (state.yn !== yn || yn.mc.phase !== "play" || yn.mc.level !== level || yn.mc.turnEnds !== turnEnds) return;
      yn.mc.open = [];
      cardsNextTurn(true);
    }, turnEnds - Date.now());
  }

  function cardsNextTurn(switchTurn) {
    const yn = state.yn;
    if (switchTurn) yn.mc.turn = yn.mc.turn === "host" ? "guest" : "host";
    yn.mc.turnEnds = Date.now() + CARD_TURN_SECONDS * 1000;
    cardsTurnTimer();
    cardsPublish();
  }

  // Открыть карточку: ведущий решает сам, партнёр присылает просьбу.
  function cardsFlip(role, index) {
    const yn = state.yn;
    if (!yn?.mc || !Number.isInteger(index)) return;
    if (yn.role === "guest") {
      if (yn.mc.turn === "guest" && yn.mc.phase === "play") sendYesNo({ type: "mflip", index });
      return;
    }
    const mc = yn.mc;
    if (mc.phase !== "play" || mc.turn !== role || mc.lock || index < 0 || index >= mc.board.length) return;
    if (mc.matched.includes(index) || mc.open.includes(index) || mc.open.length >= 2) return;
    mc.open.push(index);
    if (mc.open.length < 2) { cardsPublish(); return; }
    const [first, second] = mc.open;
    if (mc.board[first] === mc.board[second]) {
      mc.matched.push(first, second);
      mc.scores[role] += 1;
      mc.open = [];
      if (mc.matched.length === mc.board.length) { cardsLevelDone(false); return; }
      cardsNextTurn(false);
      return;
    }
    mc.lock = true;
    cardsPublish();
    yn.timers.push(setTimeout(() => {
      if (state.yn !== yn || yn.mc !== mc) return;
      mc.lock = false;
      mc.open = [];
      cardsNextTurn(true);
    }, 1100));
  }

  function cardsLevelDone(timeUp) {
    const yn = state.yn;
    const mc = yn.mc;
    clearTimeout(yn.turnTimer);
    mc.found += mc.matched.length / 2;
    mc.total += mc.board.length / 2;
    mc.note = timeUp ? "mcTimeUp" : "mcLevelDone";
    mc.open = [];
    const last = mc.level + 1 >= CARD_LEVELS.length;
    mc.phase = last ? "end" : "between";
    cardsPublish();
    if (last) return;
    yn.timers.push(setTimeout(() => {
      if (state.yn !== yn || yn.mc !== mc) return;
      mc.level += 1;
      mc.board = cardsBoard(mc.level);
      mc.matched = [];
      mc.phase = "play";
      mc.note = "";
      mc.turn = mc.turn === "host" ? "guest" : "host";
      mc.levelEnds = Date.now() + CARD_LEVELS[mc.level].seconds * 1000;
      mc.turnEnds = Date.now() + CARD_TURN_SECONDS * 1000;
      cardsLevelTimer();
      cardsPublish();
    }, 3500));
  }

  function onCardsMessage(message) {
    const yn = state.yn;
    if (yn.role === "host" && message.type === "mflip") { cardsFlip("guest", Number(message.index)); return; }
    if (yn.role !== "guest" || message.type !== "mstate" || !message.mc || typeof message.mc !== "object") return;
    const mc = message.mc;
    const valid = Array.isArray(mc.board) && mc.board.length <= 16 && mc.board.every(id => CARD_PICTURES.includes(id));
    if (!valid) return;
    const now = Date.now();
    yn.mc = { ...mc, levelEnds: now + Number(mc.levelLeft || 0), turnEnds: now + Number(mc.turnLeft || 0) };
    showCards();
  }

  function cardsClock(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function renderCardsBoard() {
    const yn = state.yn;
    const mc = yn.mc;
    if (!mc) return renderPlayLoading();
    const partnerName = (yn.role === "host" ? yn.guestName : yn.hostName) || tr("anonymous");
    if (mc.phase === "between") {
      return `<article class="glg-score glg-mc-between">
        <div class="glg-mc-hug" style="background-image:url('assets/scenes/bears-thumb.webp')" aria-hidden="true"></div>
        <h3>${escapeHtml(tr(mc.note || "mcLevelDone"))}</h3>
        <p class="glg-muted">${escapeHtml(tr("mcNext", { n: mc.level + 2 }))}</p>
      </article>`;
    }
    const myTurn = mc.turn === yn.role;
    const columns = mc.board.length > 8 ? 4 : 4;
    const tiles = mc.board.map((id, index) => {
      const shown = mc.matched.includes(index) || mc.open.includes(index);
      const matched = mc.matched.includes(index);
      return `<button class="glg-mc-card${shown ? " is-open" : ""}${matched ? " is-matched" : ""}" type="button" data-action="mc-flip" data-index="${index}"${myTurn && !shown && !mc.lock ? "" : " disabled"} aria-label="${index + 1}">
        <span class="glg-mc-back">${HEART}</span>
        <span class="glg-mc-face" style="background-image:url('assets/loves/${id}.webp')">${matched ? `<i>${HEART}</i>` : ""}</span>
      </button>`;
    }).join("");
    const turnLeft = Math.max(0, mc.turnEnds - Date.now()) / 1000;
    return `
      <div class="glg-mc-head">
        <p class="glg-step">${escapeHtml(tr("mcLevel", { n: mc.level + 1, total: CARD_LEVELS.length }))}</p>
        <b class="glg-mc-clock" data-mc-clock>${escapeHtml(cardsClock(mc.levelEnds - Date.now()))}</b>
      </div>
      <p class="glg-mc-turn${myTurn ? " is-mine" : ""}">${escapeHtml(myTurn ? tr("mcTurnYou") : tr("mcTurnThem", { name: partnerName }))}</p>
      <div class="glg-yn-timer" aria-hidden="true"><i style="animation-duration:${CARD_TURN_SECONDS}s;animation-delay:-${(CARD_TURN_SECONDS - turnLeft).toFixed(2)}s"></i></div>
      <div class="glg-mc-grid" style="--mc-columns:${columns}">${tiles}</div>
      <p class="glg-mc-scores"><span>${escapeHtml(tr("ynYou"))} <b>${HEART} ${mc.scores[yn.role]}</b></span><span>${escapeHtml(partnerName)} <b>${HEART} ${mc.scores[yn.role === "host" ? "guest" : "host"]}</b></span></p>`;
  }

  function renderCardsEnd() {
    const yn = state.yn;
    const mc = yn.mc;
    const partnerName = (yn.role === "host" ? yn.guestName : yn.hostName) || tr("anonymous");
    const ratio = mc.total ? mc.found / mc.total : 0;
    return `
      <article class="glg-score">
        <div class="glg-mc-hug" style="background-image:url('assets/scenes/bears-thumb.webp')" aria-hidden="true"></div>
        <p class="glg-score-number">${escapeHtml(tr("mcFinal", { found: mc.found, total: mc.total }))}</p>
        <h3>${escapeHtml(tr(ratio >= 0.7 ? "mcFinalHigh" : "mcFinalMid"))}</h3>
        <p class="glg-mc-scores"><span>${escapeHtml(tr("ynYou"))} <b>${HEART} ${mc.scores[yn.role]}</b></span><span>${escapeHtml(partnerName)} <b>${HEART} ${mc.scores[yn.role === "host" ? "guest" : "host"]}</b></span></p>
      </article>
      <div class="glg-actions glg-stack">
        ${yn.role === "host" ? `<button class="glg-primary" type="button" data-action="yn-again"${yn.partnerOnline ? "" : " disabled"}>↻ ${escapeHtml(tr("ynAgain"))}</button>` : `<p class="glg-muted glg-center">${escapeHtml(tr("ynWaitHost", { name: yn.hostName }))}</p>`}
        <button class="glg-secondary" type="button" data-action="close">${escapeHtml(tr("home"))}</button>
      </div>`;
  }

  // Часы уровня тикают без перерисовки поля.
  setInterval(() => {
    const clock = state.root?.querySelector("[data-mc-clock]");
    if (clock && state.yn?.mc) clock.textContent = cardsClock(state.yn.mc.levelEnds - Date.now());
  }, 500);

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
    block.innerHTML = group("groupGames", [["featQuiz"], ["featYesNo"], ["featLoves"], ["featCards"], ["featDuel"]]) + group("groupFun", [["featTruth"], ["featWho"], ["featPhrase"]]) + group("groupLetters", [["featCollection"], ["featMoments"], ["featAudio"]]);
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

  window.GlowLetterGames = Object.freeze({
    open: () => open("hub"),
    play: publicId => UUID_PATTERN.test(publicId) && startPlay(publicId.toLowerCase()),
    questionIds: QUESTION_IDS,
    roomKinds: Object.keys(ROOM_TITLES),
    title: kind => tr(ROOM_TITLES[kind] || "title"),
    // Комната для друга из «Друзей»: после создания друг сразу получает приглашение.
    createFor: (kind, friend = {}) => {
      if (!ROOM_TITLES[kind]) return;
      open("hub");
      startYesNoCreate(kind, { guestName: friend.name, inviteFriend: friend.id });
    },
    join: roomId => UUID_PATTERN.test(roomId) && joinYesNoRoom(roomId.toLowerCase())
  });
  init();
})();
