// Игры для двоих на двадцати двух языках сверх ru/en/fr: тексты экрана
// (text), вопросы теста (questions), карточки «Да или нет» (yesNo), темы «Что мы любим» (loves),
// вопросы «Кто из нас?» (who) и начала фраз «Закончи фразу» (phrases). Порядок вариантов совпадает с
// games.js — номер верного варианта хранится на сервере, поэтому варианты
// нельзя переставлять.
window.GLOWLETTER_GAMES_I18N = Object.freeze({
  "de": {
    "text": {
      "homeLink": "Spiele zu zweit",
      "eyebrow": "GLOWLETTER · SPIELE ZU ZWEIT",
      "title": "Gemeinsam spielen",
      "close": "Schließen",
      "lead": "Schicke einem lieben Menschen ein Spiel. Über den Link spielt man kostenlos und ohne Konto.",
      "quizTitle": "Wie gut kennst du mich?",
      "quizNote": "Beantworte Fragen über dich, und ein lieber Mensch versucht zu raten. Das Ergebnis kommt zu dir zurück.",
      "create": "Quiz erstellen",
      "soon": "Bald",
      "soonTitle": "Weitere Spiele folgen",
      "duel": "Duell „Wer ist schneller“",
      "loves": "Was wir lieben",
      "cards": "Memory-Karten zu zweit",
      "who": "Wer von uns?",
      "phrase": "Beende den Satz",
      "myQuizzes": "Meine Quiz",
      "noQuizzes": "Noch keine Quiz. Das erste ist in zwei Minuten erstellt.",
      "forWhom": "Für {name}",
      "noRecipient": "Quiz",
      "resultsCount": "Ergebnisse: {count}",
      "newResults": "Neu: {count}",
      "noResults": "Noch hat niemand gespielt.",
      "anonymous": "Ohne Namen",
      "results": "Ergebnisse",
      "copyLink": "Link kopieren",
      "share": "Senden",
      "deleteQuiz": "Quiz löschen",
      "deleteConfirm": "Dieses Quiz und seine Ergebnisse löschen? Der Link funktioniert dann nicht mehr.",
      "deleted": "Quiz gelöscht",
      "linkCopied": "Link kopiert",
      "back": "Zurück",
      "next": "Weiter",
      "stepNames": "Schritt 1 von 2 · Namen",
      "yourName": "Dein Name",
      "yourNamePlaceholder": "Wie heißt du",
      "recipient": "Für wen · optional",
      "recipientPlaceholder": "Name des lieben Menschen",
      "nameRequired": "Gib deinen Namen ein.",
      "forbiddenName": "Gib einen gewöhnlichen Namen ein.",
      "stepAnswers": "Schritt 2 von 2 · Deine Antworten",
      "answersLead": "Markiere, was auf dich zutrifft. Jede Frage lässt sich austauschen.",
      "swap": "Andere Frage",
      "progress": "{done} von {total} beantwortet",
      "answerAll": "Wähle bei jeder Frage eine Antwort.",
      "finish": "Link erhalten",
      "creating": "Quiz wird erstellt…",
      "createdTitle": "Dein Quiz ist fertig!",
      "createdLead": "Sende den Link. Sobald geantwortet wurde, erscheint das Ergebnis unter „Meine Quiz“.",
      "shareText": "{name} lädt dich zum Spiel „Wie gut kennst du mich?“ ein",
      "signInTitle": "Anmeldung erforderlich",
      "signInNote": "Das Quiz wird in deinem Konto gespeichert, damit die Ergebnisse bei dir ankommen.",
      "signIn": "Anmelden",
      "premiumNote": "Spiele erstellen gehört zum Vollzugang. Über einen Link spielen alle kostenlos.",
      "failed": "Das hat nicht geklappt. Prüfe die Verbindung und versuche es erneut.",
      "rateLimited": "Zu viele Versuche. Bitte später erneut versuchen.",
      "playEyebrow": "EIN SPIEL ZU ZWEIT",
      "playInvite": "{name} lädt dich zum Spielen ein",
      "playLead": "Fragen: {count}. Rate die Antworten — am Ende siehst du, wie viele übereinstimmen.",
      "playName": "Dein Name · optional",
      "playNamePlaceholder": "Damit man dich erkennt",
      "start": "Los geht’s",
      "playLoading": "Spiel wird geladen…",
      "playMissing": "Dieses Spiel ist nicht verfügbar: Der Link wurde gelöscht oder ist abgelaufen.",
      "playOffline": "Für das Spiel ist eine Internetverbindung nötig.",
      "retry": "Erneut versuchen",
      "questionOf": "Frage {n} von {total}",
      "asks": "{name} fragt",
      "counting": "Übereinstimmungen werden gezählt…",
      "scoreOf": "{score} von {total}",
      "tierAll": "Perfekt! Ihr kennt euch besser als alle anderen",
      "tierHigh": "Ihr kennt euch richtig gut",
      "tierMid": "Nicht schlecht! Es gibt noch einiges zu entdecken",
      "tierLow": "Viele schöne Entdeckungen liegen vor euch",
      "sentTo": "{name} sieht dein Ergebnis",
      "review": "Deine Antworten",
      "rightAnswer": "Richtige Antwort",
      "makeOwn": "Eigenes Quiz erstellen",
      "home": "Zur Startseite",
      "resultToast": "{name}: {score} von {total} bei „Wie gut kennst du mich?“",
      "ownerAnswers": "Antworten des Erstellers",
      "playerAnswers": "Antworten von {name}",
      "paywallTitle": "Spiele, Spaß<br><em>und Briefe</em>",
      "groupGames": "Spiele",
      "groupFun": "Spaß",
      "groupLetters": "Briefe",
      "featQuiz": "„Wie gut kennst du mich?“ — das Ergebnis kommt zu dir",
      "featGamesSoon": "Duell „Wer ist schneller“, „Was wir lieben“, Memory-Karten mit Bärchen",
      "featFunSoon": "„Wer von uns?“ und „Beende den Satz“ mit dem Buch eures Paares",
      "featCollection": "Die ganze Sammlung an Briefen und Gedichten in 25 Sprachen",
      "featMoments": "Momente, Erinnerungen und ein QR-Brief, der sich am richtigen Tag öffnet",
      "featAudio": "Eigenes Audio im Brief und Antworten des Empfängers",
      "ynTitle": "Ja oder Nein",
      "ynNote": "Ein Live-Spiel zu zweit: 5 Sekunden pro Karte. Wer rechtzeitig antwortet, sieht die Antwort des anderen.",
      "ynCreate": "Raum erstellen",
      "ynWaiting": "Wir warten, bis {name} den Link öffnet…",
      "ynWaitingAny": "Wir warten auf deine Begleitung…",
      "ynShareText": "{name} lädt dich zum Live-Spiel „Ja oder Nein“ ein",
      "ynPartnerHere": "{name} ist da!",
      "ynStart": "Spiel starten",
      "ynWaitHost": "{name} startet gleich das Spiel",
      "ynYes": "Ja",
      "ynNo": "Nein",
      "ynMissed": "Zu spät — diese Karte bleibt zu",
      "ynMatch": "Gleiche Antwort!",
      "ynRound": "Karte {n} von {total}",
      "ynAnswered": "Antwort gesendet, wir warten auf die andere Antwort…",
      "ynFinal": "{score} von {total} gleich",
      "ynFinalHigh": "Ihr versteht euch ohne Worte",
      "ynFinalMid": "So verschieden — und so nah",
      "ynAgain": "Noch einmal spielen",
      "ynLeft": "Die Verbindung zum anderen ist weg. Wir warten…",
      "ynYou": "Du",
      "ynOffline": "Keine Verbindung zum Spiel. Prüfe das Internet und öffne den Link erneut.",
      "ynJoin": "Mitspielen",
      "ynJoinLead": "{name} wartet auf dich. 5 Sekunden pro Antwort!",
      "ynStepNames": "Dein Name und der Name deiner Begleitung",
      "ynRoomReady": "Der Raum ist bereit — sende den Link",
      "ynStayHere": "Lass diesen Bildschirm offen: Das Spiel beginnt, sobald der Link geöffnet wird.",
      "featYesNo": "Live-Spiel „Ja oder Nein“ — 5 Sekunden pro Antwort",
      "ynPartnerMissed": "Keine Antwort — die Zeit ist um",
      "lvTitle": "Was wir lieben",
      "lvNote": "Ein Live-Spiel zu zweit: 4 Bilder, je 10 Sekunden, um zu wählen, was ihr am liebsten mögt. Ihr dürft auch dasselbe wählen!",
      "lvShareText": "{name} lädt dich zum Live-Spiel „Was wir lieben“ ein",
      "lvJoinLead": "{name} wartet auf dich. Wähle das Bild, das du am liebsten magst!",
      "lvRound": "Thema {n} von {total}",
      "lvPick": "Wähle, was du am liebsten magst",
      "lvBoth": "Ihr habt beide gewählt: {item}",
      "lvCommon": "Ihr liebt beide",
      "lvDiff": "Verschiedene Geschmäcker — umso spannender!",
      "lvFinalHigh": "Ihr habt so viel gemeinsam!",
      "lvFinalMid": "So verschieden — und ihr ergänzt euch",
      "featLoves": "Live-Spiel „Was wir lieben“ — 4 Bilder, gemeinsam wählen",
      "featGamesSoon2": "Duell „Wer ist schneller“ und Memory-Karten mit Bärchen",
      "mcTitle": "Memory-Karten mit Bärchen",
      "mcNote": "Ein Live-Memory zu zweit: Deckt abwechselnd zwei Karten auf und findet die Paare. Drei Level, von 8 bis 16 Karten.",
      "mcShareText": "{name} lädt dich zum Live-Spiel „Memory-Karten mit Bärchen“ ein",
      "mcJoinLead": "{name} wartet auf dich. Findet die Paare abwechselnd!",
      "mcLevel": "Level {n} von {total}",
      "mcTurnYou": "Du bist dran — deck zwei Karten auf",
      "mcTurnThem": "{name} ist dran",
      "mcPairs": "Gefundene Paare: {found} von {total}",
      "mcLevelDone": "Alle Paare gefunden!",
      "mcTimeUp": "Die Zeit für dieses Level ist um",
      "mcNext": "Weiter: Level {n}",
      "mcFinal": "Gefundene Paare: {found} von {total}",
      "mcFinalHigh": "Ein tolles Team!",
      "mcFinalMid": "Schönes Spiel — noch eine Runde?",
      "featCards": "Live-Spiel „Memory-Karten mit Bärchen“ — findet Paare zu zweit",
      "featGamesSoon3": "Duell „Wer ist schneller“",
      "duTitle": "Wer ist schneller",
      "duNote": "Ein Live-Duell: ein Wort und vier Bilder. Tippe als Erstes auf das richtige Bild — ein falscher Tipp kostet die Runde.",
      "duShareText": "{name} fordert dich zum Live-Duell „Wer ist schneller“ heraus",
      "duJoinLead": "{name} wartet auf dich. Finde das richtige Bild schneller!",
      "duRound": "Runde {n} von {total}",
      "duFind": "Finde: {item}",
      "duYouWon": "Du warst schneller!",
      "duTheyWon": "Schneller: {name}",
      "duWrong": "Falsches Bild — diese Runde ist verloren",
      "duNobody": "Niemand hat es rechtzeitig gefunden",
      "duScore": "Du {you} : {them} {name}",
      "duFinalWin": "Gewonnen! Heute mit scharfem Blick.",
      "duFinalLose": "Diesmal gewinnt {name} — Revanche?",
      "duFinalDraw": "Unentschieden — ihr seid gleich stark!",
      "duSeconds": "{s} s",
      "featDuel": "Live-Duell „Wer ist schneller“ — finde das Bild als Erstes",
      "whoTitle": "Wer von uns?",
      "whoNote": "Ein Live-Spiel zu zweit: eine Frage — tippe auf „Ich“ oder auf den Namen deiner Begleitung. Seht, ob ihr euch einig seid.",
      "whoShareText": "{name} lädt dich zum Live-Spiel „Wer von uns?“ ein",
      "whoJoinLead": "{name} wartet auf dich. Antworte ehrlich — dann vergleicht ihr!",
      "whoRound": "Frage {n} von {total}",
      "whoMe": "Ich",
      "whoAgree": "Ihr seid euch einig: {name}",
      "whoDiffer": "Verschiedene Meinungen — sprecht darüber!",
      "whoFinal": "{score} von {total} Mal einig",
      "whoFinalHigh": "Ihr kennt einander so gut!",
      "whoFinalMid": "Viel Gesprächsstoff — und das ist schön",
      "featWho": "Live-Spiel „Wer von uns?“ — seid ihr euch einig?",
      "phTitle": "Beende den Satz",
      "phNote": "Ein Live-Spiel zu zweit: Ihr beendet beide denselben warmen Satz mit euren eigenen Worten und lest dann eure Antworten.",
      "phShareText": "{name} lädt dich zum Live-Spiel „Beende den Satz“ ein",
      "phJoinLead": "{name} wartet auf dich. Beende jeden Satz mit deinen eigenen Worten!",
      "phRound": "Satz {n} von {total}",
      "phPlaceholder": "Deine Fortsetzung…",
      "phDone": "Fertig",
      "phWaiting": "Wir warten auf {name}…",
      "phSkipped": "Keine Antwort",
      "phSave": "Im Buch eures Paares speichern",
      "phSaved": "Im Buch eures Paares gespeichert",
      "phForbidden": "Bitte schreib ohne Links und grobe Wörter.",
      "phNext": "Nächster Satz",
      "phFinal": "Gemeinsam beendete Sätze: {count}",
      "phFinalLead": "Speichert eure liebsten Antworten im Buch eures Paares.",
      "featPhrase": "Live-Spiel „Beende den Satz“ mit dem Buch eures Paares",
      "bookTitle": "Buch eures Paares",
      "bookNote": "Die wärmsten Antworten aus „Beende den Satz“, gespeichert in deinem Konto.",
      "bookOpen": "Buch öffnen",
      "bookEmpty": "Das Buch ist noch leer. Spielt „Beende den Satz“ und speichert die Antworten, die euch gefallen.",
      "bookDelete": "Löschen",
      "bookDeleteConfirm": "Diese Seite aus dem Buch löschen?",
      "bookYou": "Du",
      "inviteTitle": "Freunde einladen",
      "inviteNote": "Die Einladung kommt als Nachricht mit dem Spiel an.",
      "invite": "Einladen",
      "invited": "Eingeladen",
      "inviteNone": "Füge im Bereich „Freunde“ Menschen hinzu, um sie mit einem Tippen einzuladen.",
      "inviteSent": "Einladung an {name} gesendet"
    },
    "questions": {
      "q01": [
        "Meine Lieblingsjahreszeit?",
        "Frühling",
        "Sommer",
        "Herbst",
        "Winter"
      ],
      "q02": [
        "Was wähle ich zum Frühstück?",
        "Kaffee und Croissant",
        "Haferbrei",
        "Eier",
        "Nur Tee"
      ],
      "q03": [
        "Mein perfekter freier Tag?",
        "Zu Hause unter der Decke",
        "Ein Spaziergang im Park",
        "Ein Ausflug ins Grüne",
        "Zeit mit Freunden"
      ],
      "q04": [
        "Wohin träume ich zu reisen?",
        "Ans Meer",
        "In die Berge",
        "In eine große Stadt",
        "In ein gemütliches Landhaus"
      ],
      "q05": [
        "Mein Lieblingseis?",
        "Vanille",
        "Schokolade",
        "Erdbeere",
        "Pistazie"
      ],
      "q06": [
        "Was muntert mich am schnellsten auf?",
        "Eine Umarmung",
        "Eine Überraschung",
        "Liebe Worte",
        "Etwas Leckeres"
      ],
      "q07": [
        "Ich bin eher…",
        "Frühaufsteher",
        "Nachteule",
        "Ich schlafe, wann immer es geht",
        "Fan vom Mittagsschlaf"
      ],
      "q08": [
        "Welchen Film wähle ich heute Abend?",
        "Eine Komödie",
        "Eine romantische Geschichte",
        "Einen Krimi",
        "Einen Zeichentrickfilm"
      ],
      "q09": [
        "Meine Lieblingsfarbe?",
        "Rot",
        "Blau",
        "Grün",
        "Rosa"
      ],
      "q10": [
        "Wovor habe ich am meisten Angst?",
        "Vor Spinnen",
        "Vor der Höhe",
        "Vor der Dunkelheit",
        "Vor dem Zuspätkommen"
      ],
      "q11": [
        "Welche Blumen liebe ich?",
        "Rosen",
        "Tulpen",
        "Pfingstrosen",
        "Gänseblümchen"
      ],
      "q12": [
        "Was mache ich, wenn ich traurig bin?",
        "Einen lieben Menschen anrufen",
        "Etwas Süßes essen",
        "Spazieren gehen",
        "Schlafen gehen"
      ],
      "q13": [
        "Welches Tier steht mir am nächsten?",
        "Ein Kätzchen",
        "Ein Hund",
        "Ein Bärenjunges",
        "Ein kleiner Fuchs"
      ],
      "q14": [
        "Das schönste Geschenk für mich?",
        "Etwas Selbstgemachtes",
        "Eine Reise",
        "Schmuck",
        "Ein Buch"
      ],
      "q15": [
        "Mein Lieblingsgetränk?",
        "Schwarzer Tee",
        "Grüner Tee",
        "Kaffee",
        "Heiße Schokolade"
      ],
      "q16": [
        "Mein Lieblingssnack?",
        "Schokolade",
        "Chips",
        "Obst",
        "Ein Gebäck"
      ],
      "q17": [
        "Was wähle ich auf Reisen?",
        "Museen",
        "Den Strand",
        "Das örtliche Essen",
        "Ziellos umherschlendern"
      ],
      "q18": [
        "Wie verbringe ich am liebsten den Abend?",
        "Mit einem Buch",
        "Mit einer Serie",
        "Mit Gesprächen",
        "Bei einem Spaziergang"
      ],
      "q19": [
        "Welches Wetter mag ich am liebsten?",
        "Sonnenschein",
        "Warmen Regen",
        "Schneefall",
        "Eine leichte Brise"
      ],
      "q20": [
        "Welche Superkraft würde zu mir passen?",
        "Fliegen",
        "Gedanken lesen",
        "Die Zeit anhalten",
        "Teleportieren"
      ],
      "q21": [
        "Was ist mir bei lieben Menschen am wichtigsten?",
        "Vertrauen",
        "Fürsorge",
        "Humor",
        "Unterstützung"
      ],
      "q22": [
        "Auf welches Fest freue ich mich am meisten?",
        "Silvester",
        "Meinen Geburtstag",
        "Die Sommerferien",
        "Den Valentinstag"
      ],
      "q23": [
        "Wie sage ich meistens „Ich hab dich lieb“?",
        "Mit Worten",
        "Mit Taten",
        "Mit Umarmungen",
        "Mit Geschenken"
      ],
      "q24": [
        "Was bestelle ich im Café?",
        "Pasta",
        "Sushi",
        "Einen Salat",
        "Ein Dessert"
      ],
      "q25": [
        "Meine Lieblingstageszeit?",
        "Morgen",
        "Nachmittag",
        "Abend",
        "Nacht"
      ],
      "q26": [
        "Welche Küche wähle ich?",
        "Italienisch",
        "Japanisch",
        "Hausmannskost",
        "Mexikanisch"
      ],
      "q27": [
        "Wo kann ich am besten nachdenken?",
        "Unter der Dusche",
        "Beim Spazierengehen",
        "Unterwegs",
        "Vor dem Einschlafen"
      ],
      "q28": [
        "Was mache ich morgens als Erstes?",
        "Aufs Handy schauen",
        "Wasser trinken",
        "Kaffee kochen",
        "Noch etwas liegen bleiben"
      ],
      "q29": [
        "Mein Lieblingsobst?",
        "Apfel",
        "Banane",
        "Mango",
        "Wassermelone"
      ],
      "q30": [
        "Welches Hobby passt am besten zu mir?",
        "Zeichnen",
        "Kochen",
        "Sport",
        "Lesen"
      ],
      "q31": [
        "Wie möchte ich meinen Geburtstag feiern?",
        "Mit einer großen Party",
        "Mit einem Abendessen zu zweit",
        "Mit einer Reise",
        "Mit einem ruhigen Abend zu Hause"
      ],
      "q32": [
        "Wie stehe ich zu Überraschungen?",
        "Ich liebe sie",
        "Sie machen mich etwas nervös",
        "Ich bereite sie gern für andere vor",
        "Ich weiß lieber vorher Bescheid"
      ],
      "q33": [
        "Welche Süßigkeit mag ich am liebsten?",
        "Kuchen",
        "Eis",
        "Kekse",
        "Bonbons"
      ],
      "q34": [
        "Was nehme ich auf eine einsame Insel mit?",
        "Ein Buch",
        "Mein Handy",
        "Eine Decke",
        "Eine Kamera"
      ],
      "q35": [
        "Wie entspanne ich nach einem harten Tag?",
        "Ein warmes Bad",
        "Eine Serie",
        "Ein Spaziergang",
        "Ein Gespräch mit einem lieben Menschen"
      ],
      "q36": [
        "Wie reise ich am liebsten?",
        "Mit dem Zug",
        "Mit dem Flugzeug",
        "Mit dem Auto",
        "Mit dem Fahrrad"
      ],
      "q37": [
        "Mein liebstes Kinderspiel?",
        "Verstecken",
        "Fangen",
        "Bauklötze",
        "Malen"
      ],
      "q38": [
        "Welches Märchen steht mir am nächsten?",
        "Aschenputtel",
        "Der kleine Prinz",
        "Pu der Bär",
        "Alice im Wunderland"
      ],
      "q39": [
        "Womit würde ich einem lieben Menschen eher eine Freude machen?",
        "Mit einer Überraschung",
        "Mit einer Karte",
        "Mit einer Reise",
        "Mit einem Abendessen"
      ],
      "q40": [
        "Was fotografiere ich am häufigsten?",
        "Mich selbst",
        "Die Natur",
        "Essen",
        "Ich fotografiere kaum"
      ],
      "q41": [
        "Mein Lieblingsplatz zu Hause?",
        "Das Bett",
        "Die Küche",
        "Das Sofa",
        "Der Balkon"
      ],
      "q42": [
        "Was fällt mir an einem Menschen zuerst auf?",
        "Das Lächeln",
        "Die Augen",
        "Die Stimme",
        "Der Humor"
      ],
      "q43": [
        "Was bringt mich am schnellsten zum Lachen?",
        "Lustige Videos",
        "Witze von lieben Menschen",
        "Peinliche Momente",
        "Tiere"
      ],
      "q44": [
        "Was trinke ich an einem heißen Sommertag?",
        "Limonade",
        "Eistee",
        "Saft",
        "Wasser mit Eis"
      ],
      "q45": [
        "Welches Element steht mir am nächsten?",
        "Wasser",
        "Feuer",
        "Erde",
        "Luft"
      ],
      "q46": [
        "Welche Geschichten liebe ich?",
        "Abenteuer",
        "Liebesgeschichten",
        "Science-Fiction",
        "Wahre Geschichten"
      ],
      "q47": [
        "Wie verbringe ich einen Regentag?",
        "Mit Lesen",
        "Mit Schlafen",
        "Mit einem Film",
        "Mit einem Spaziergang unterm Schirm"
      ],
      "q48": [
        "Was schätze ich an einem Geschenk am meisten?",
        "Die Aufmerksamkeit",
        "Den Nutzen",
        "Die Schönheit",
        "Die Überraschung"
      ],
      "q49": [
        "Welche Kartoffeln wähle ich?",
        "Püree",
        "Pommes",
        "Ofenkartoffeln",
        "Chips"
      ],
      "q50": [
        "Wohin gehe ich in einer neuen Stadt zuerst?",
        "In ein Café",
        "In ein Museum",
        "In einen Park",
        "Shoppen"
      ],
      "q51": [
        "Was mache ich, wenn ich nicht schlafen kann?",
        "Lesen",
        "Am Handy scrollen",
        "Schäfchen zählen",
        "Warme Milch trinken"
      ],
      "q52": [
        "Wie bereite ich mich auf einen wichtigen Tag vor?",
        "Ich plane alles im Voraus",
        "Ich mache alles in letzter Minute",
        "Ich bitte um Hilfe",
        "Ich bin aufgeregt und schlafe schlecht"
      ],
      "q53": [
        "Welchen Sport schaue ich am liebsten?",
        "Fußball",
        "Tennis",
        "Eiskunstlauf",
        "Ich schaue keinen Sport"
      ],
      "q54": [
        "Welches Haustier passt zu mir?",
        "Eine Katze",
        "Ein Hund",
        "Ein Papagei",
        "Ein Hamster"
      ],
      "q55": [
        "Was für Nachrichten schreibe ich?",
        "Lange",
        "Kurze",
        "Voller Emojis",
        "Sprachnachrichten"
      ],
      "q56": [
        "Welches Geschenk bewahre ich am längsten auf?",
        "Einen Brief",
        "Ein Spielzeug",
        "Ein Foto",
        "Ein Schmuckstück"
      ],
      "q57": [
        "Was würde ich eher wählen?",
        "Tee am Kamin",
        "Ein Picknick im Gras",
        "Einen Spaziergang am Meer",
        "Einen Kinobesuch"
      ],
      "q58": [
        "Welches Kompliment freut mich am meisten?",
        "Über mein Aussehen",
        "Über meinen Verstand",
        "Über meine Herzlichkeit",
        "Über meinen Humor"
      ],
      "q59": [
        "Mein perfekter Morgen?",
        "Frühstück im Bett",
        "Früh joggen gehen",
        "Lange ausschlafen",
        "Kaffee auf dem Balkon"
      ],
      "q60": [
        "Was möchte ich lernen?",
        "Tanzen",
        "Kochen",
        "Eine neue Sprache",
        "Zeichnen"
      ]
    },
    "yesNo": {
      "c01": [
        "Vermisst du mich gerade?",
        "vermisst dich sehr",
        "hält durch, denkt aber an dich"
      ],
      "c02": [
        "Lächelst du, wenn du meine Nachricht siehst?",
        "lächelt immer",
        "lächelt still in sich hinein"
      ],
      "c03": [
        "Erinnerst du dich an unser erstes Treffen?",
        "erinnert sich an jede Minute",
        "erinnert sich an das Wichtigste — dich"
      ],
      "c04": [
        "Möchtest du heute eine Umarmung?",
        "wartet auf deine Umarmung",
        "spart Umarmungen für später auf"
      ],
      "c05": [
        "Fahren wir zusammen ans Meer?",
        "packt schon den Koffer",
        "träumt von den Bergen"
      ],
      "c06": [
        "Bringe ich dich zum Lachen?",
        "lacht von Herzen",
        "versteckt ein Lächeln"
      ],
      "c07": [
        "Fühlst du dich bei mir ruhig?",
        "fühlt sich bei dir geborgen",
        "hat mit dir viel Spaß"
      ],
      "c08": [
        "Denkst du tagsüber an mich?",
        "denkt sehr oft an dich",
        "denkt gerade jetzt an dich"
      ],
      "c09": [
        "Liebst du meine Überraschungen?",
        "liebt deine Überraschungen",
        "mag es, wenn du einfach da bist"
      ],
      "c10": [
        "Backen wir zusammen einen Kuchen?",
        "bindet schon die Schürze um",
        "kauft lieber einen Kuchen"
      ],
      "c11": [
        "Schauen wir heute Abend einen Film?",
        "sucht schon einen Film aus",
        "möchte lieber einfach reden"
      ],
      "c12": [
        "Magst du meine Stimme?",
        "könnte ewig zuhören",
        "mag dein Lachen noch mehr"
      ],
      "c13": [
        "Machen wir am Wochenende ein Picknick?",
        "legt die Decke bereit",
        "lädt dich in ein gemütliches Café ein"
      ],
      "c14": [
        "Möchtest du einen Brief von mir?",
        "wartet auf deinen Brief",
        "möchte alles persönlich hören"
      ],
      "c15": [
        "Bin ich dir sehr wichtig?",
        "du bist unglaublich wichtig",
        "wichtiger, als du denkst"
      ],
      "c16": [
        "Gehen wir im Regen spazieren?",
        "nimmt einen Schirm für zwei",
        "kocht lieber Tee zu Hause"
      ],
      "c17": [
        "Sind wir uns ähnlich?",
        "ihr seid wie zwei Hälften",
        "ihr ergänzt euch perfekt"
      ],
      "c18": [
        "Magst du, wie ich koche?",
        "will noch einen Nachschlag",
        "kocht am liebsten mit dir zusammen"
      ],
      "c19": [
        "Holen wir uns zusammen ein Haustier?",
        "sucht schon einen Namen aus",
        "ein Teddybär reicht vorerst"
      ],
      "c20": [
        "Weißt du, was ich liebe?",
        "kennt es auswendig",
        "möchte noch mehr erfahren"
      ],
      "c21": [
        "Tanzen wir?",
        "reicht dir schon die Hand",
        "klatscht begeistert mit"
      ],
      "c22": [
        "Inspiriere ich dich?",
        "du inspirierst jeden Tag",
        "bei dir ist es einfach warm"
      ],
      "c23": [
        "Bewahrst du unsere Fotos auf?",
        "hütet jedes einzelne",
        "wartet auf neue, noch schönere"
      ],
      "c24": [
        "Sehen wir uns zusammen den Sonnenaufgang an?",
        "stellt schon den Wecker",
        "schaut lieber den Sonnenuntergang"
      ],
      "c25": [
        "Verrätst du mir ein Geheimnis?",
        "flüstert es dir ins Ohr",
        "es bleibt ein Rätsel"
      ],
      "c26": [
        "Glaubst du an mich?",
        "glaubt fest an dich",
        "feuert dich jeden Tag an"
      ],
      "c27": [
        "Verreisen wir nur zu zweit?",
        "träumt davon",
        "nimmt alle Lieben mit"
      ],
      "c28": [
        "Wartest du auf meinen Anruf?",
        "wartet mit einem Lächeln",
        "möchte lieber, dass du vorbeikommst"
      ],
      "c29": [
        "Magst du meine Umarmungen?",
        "die wärmsten der Welt",
        "hält am liebsten Händchen"
      ],
      "c30": [
        "Lesen wir uns gegenseitig vor?",
        "sucht schon ein Buch aus",
        "hört dir lieber zu"
      ],
      "c31": [
        "Machen wir heute ein gemeinsames Foto?",
        "sucht schon einen schönen Hintergrund",
        "erst wird geredet"
      ],
      "c32": [
        "Hebe ich deine Laune?",
        "das tust du immer",
        "mit dir ist sogar Traurigkeit leichter"
      ],
      "c33": [
        "Frühstücken wir morgen zusammen?",
        "kocht schon Kakao",
        "möchte lieber ausschlafen"
      ],
      "c34": [
        "Erinnerst du dich an meinen Geburtstag?",
        "auch ohne Erinnerung",
        "plant heimlich eine Überraschung"
      ],
      "c35": [
        "Gehen wir Schlittschuh laufen?",
        "holt schon die Schlittschuhe",
        "feuert dich vom Rand aus an"
      ],
      "c36": [
        "Ist heute ein guter Tag für dich?",
        "ein toller Tag",
        "wird besser, wenn du da bist"
      ],
      "c37": [
        "Zeichnest du mein Porträt?",
        "nimmt schon den Bleistift",
        "malt ein kleines Herz"
      ],
      "c38": [
        "Pflanzen wir zusammen einen Baum?",
        "sucht schon den Platz aus",
        "fängt mit einer Blume am Fenster an"
      ],
      "c39": [
        "Möchtest du ein Kompliment hören?",
        "kann es kaum erwarten",
        "ist schüchtern, möchte aber sehr"
      ],
      "c40": [
        "Spielen wir später noch einmal?",
        "will noch eine Runde",
        "umarmt lieber, statt zu spielen"
      ]
    },
    "loves": {
      "s01": [
        "Wo Urlaub machen?",
        "Strand",
        "Berge",
        "Reisen",
        "Ruhe für mich"
      ],
      "s02": [
        "Der perfekte Abend?",
        "Film zu Hause",
        "Spaziergang",
        "Restaurant",
        "Brettspiele"
      ],
      "s03": [
        "Lieblingswetter?",
        "Sonne",
        "Regen",
        "Schnee",
        "Sternennacht"
      ],
      "s04": [
        "Lieblingstier?",
        "Kätzchen",
        "Welpe",
        "Pferd",
        "Delfin"
      ],
      "s05": [
        "Was gibt’s zum Abendessen?",
        "Pizza",
        "Sushi",
        "Gebäck",
        "Grillen"
      ],
      "s06": [
        "Lieblingsgetränk?",
        "Kaffee",
        "Tee",
        "Kakao",
        "Limonade"
      ],
      "s07": [
        "Lieblingsjahreszeit?",
        "Frühling",
        "Sommer",
        "Herbst",
        "Winter"
      ],
      "s08": [
        "Lieblingsblumen?",
        "Rosen",
        "Tulpen",
        "Sonnenblumen",
        "Lavendel"
      ],
      "s09": [
        "Wie entspannen?",
        "Mit einem Buch",
        "Malen",
        "Radfahren",
        "Schlafen in der Hängematte"
      ],
      "s10": [
        "Wie reisen?",
        "Mit dem Zug",
        "Mit dem Flugzeug",
        "Mit dem Auto",
        "Mit dem Schiff"
      ],
      "s11": [
        "Traumhaus?",
        "Stadtwohnung",
        "Haus am Meer",
        "Hütte in den Bergen",
        "Bauernhof"
      ],
      "s12": [
        "Etwas Süßes?",
        "Eis",
        "Schokolade",
        "Torte",
        "Obst"
      ],
      "s13": [
        "Der perfekte Morgen?",
        "Frühstück im Bett",
        "Joggen",
        "Ausschlafen",
        "Kaffee auf dem Balkon"
      ],
      "s14": [
        "Traum-Date?",
        "Picknick",
        "Eisbahn",
        "Freizeitpark",
        "Sterne auf dem Dach"
      ],
      "s15": [
        "Das schönste Geschenk?",
        "Ein Blumenstrauß",
        "Ein Brief",
        "Eine Reise",
        "Eine Geschenkbox"
      ],
      "s16": [
        "Lieblingsnatur?",
        "Meer",
        "Wald",
        "Wüste",
        "Nordlicht"
      ]
    },
    "who": [
      "Wer von uns kommt öfter zu spät?",
      "Wer von uns versöhnt sich zuerst?",
      "Wer von uns kocht besser?",
      "Wer von uns lacht öfter?",
      "Wer von uns braucht länger zum Fertigmachen?",
      "Wer von uns verliert öfter die Schlüssel?",
      "Wer von uns merkt sich wichtige Daten besser?",
      "Wer von uns nascht lieber Süßes?",
      "Wer von uns schläft zuerst ein?",
      "Wer von uns steht früher auf?",
      "Wer von uns sagt öfter „Ich vermisse dich“?",
      "Wer von uns sucht die besseren Geschenke aus?",
      "Wer von uns macht öfter Witze?",
      "Wer von uns fährt besser Auto?",
      "Wer von uns telefoniert länger?",
      "Wer von uns reist lieber?",
      "Wer von uns ist schneller gekränkt?",
      "Wer von uns verzeiht schneller?",
      "Wer von uns macht mehr Fotos?",
      "Wer von uns kann besser mit Geld umgehen?",
      "Wer von uns kauft öfter Dinge, die wir nicht brauchen?",
      "Wer von uns kann besser trösten?",
      "Wer von uns bleibt in schweren Momenten ruhiger?",
      "Wer von uns sucht ständig das Handy?",
      "Wer von uns hat lieber Gäste?",
      "Wer von uns macht öfter das Frühstück?",
      "Wer von uns findet sich in einer fremden Stadt besser zurecht?",
      "Wer von uns schreibt längere Nachrichten?",
      "Wer von uns schlägt zuerst einen Spaziergang vor?",
      "Wer von uns mag Tiere mehr?",
      "Wer von uns kann Geheimnisse besser bewahren?",
      "Wer von uns braucht länger, um etwas von der Speisekarte zu wählen?",
      "Wer von uns sorgt sich mehr um die Liebsten?",
      "Wer von uns macht mehr Überraschungen?",
      "Wer von uns hält besser Ordnung?",
      "Wer von uns bemerkt eine neue Frisur zuerst?",
      "Wer von uns erinnert sich öfter an lustige Geschichten?",
      "Wer von uns hat mehr Geduld?",
      "Wer von uns sagt öfter „Danke“?",
      "Wer von uns bietet zuerst Hilfe an?"
    ],
    "phrases": [
      "Ich lächle, wenn du…",
      "Mein liebster Tag mit dir ist…",
      "Danke dir für…",
      "Wenn ich traurig bin, hilft mir…",
      "Eines Tages möchte ich, dass wir zusammen…",
      "Die wärmste Erinnerung an uns ist…",
      "Niemand kann so gut wie du…",
      "Ich fühle mich ruhig, wenn…",
      "Wenn wir einen ganzen freien Tag hätten, würden wir…",
      "Ich bin stolz auf dich, weil…",
      "Unser perfekter Abend ist…",
      "Ich werde nie vergessen, wie du…",
      "Ich mag es, wenn du sagst…",
      "Nächstes Jahr möchte ich, dass wir…",
      "Für mich bist du wie…",
      "Das schönste Geschenk von dir ist…",
      "Ich vermisse dich, wenn…",
      "Am lustigsten sind wir, wenn…",
      "Schon lange möchte ich dir sagen…",
      "Unser Ort ist…",
      "Wenn ich an dich denke, …",
      "Du machst meinen Tag schöner, wenn…",
      "Ich mag unsere Gewohnheit, …",
      "Mein Wunsch für uns: …",
      "Das Lustigste, was uns passiert ist, war…",
      "Ich spüre deine Fürsorge, wenn du…",
      "Ein Morgen mit dir ist…",
      "Wenn wir ein einziges Wort wären, wäre es…",
      "Ich möchte von dir lernen, wie man…",
      "Danke, dass du immer…"
    ]
  },
  "es": {
    "text": {
      "homeLink": "Juegos para dos",
      "eyebrow": "GLOWLETTER · JUEGOS PARA DOS",
      "title": "Jugad juntos",
      "close": "Cerrar",
      "lead": "Envía un juego a alguien querido. Jugar desde un enlace es gratis y no requiere cuenta.",
      "quizTitle": "¿Cuánto me conoces?",
      "quizNote": "Responde preguntas sobre ti y deja que alguien cercano intente adivinar. El resultado te llega a ti.",
      "create": "Crear un test",
      "soon": "Pronto",
      "soonTitle": "Más juegos en camino",
      "duel": "Duelo «¿Quién es más rápido?»",
      "loves": "Lo que nos gusta",
      "cards": "Cartas de memoria para dos",
      "who": "¿Quién de los dos?",
      "phrase": "Completa la frase",
      "myQuizzes": "Mis tests",
      "noQuizzes": "Aún no hay tests. Crear el primero lleva un par de minutos.",
      "forWhom": "Para {name}",
      "noRecipient": "Test",
      "resultsCount": "Resultados: {count}",
      "newResults": "Nuevos: {count}",
      "noResults": "Todavía nadie ha jugado.",
      "anonymous": "Sin nombre",
      "results": "Resultados",
      "copyLink": "Copiar enlace",
      "share": "Enviar",
      "deleteQuiz": "Eliminar test",
      "deleteConfirm": "¿Eliminar este test y sus resultados? El enlace dejará de funcionar.",
      "deleted": "Test eliminado",
      "linkCopied": "Enlace copiado",
      "back": "Atrás",
      "next": "Siguiente",
      "stepNames": "Paso 1 de 2 · Nombres",
      "yourName": "Tu nombre",
      "yourNamePlaceholder": "¿Cómo te llamas?",
      "recipient": "Para quién · opcional",
      "recipientPlaceholder": "Su nombre",
      "nameRequired": "Escribe tu nombre.",
      "forbiddenName": "Escribe un nombre normal.",
      "stepAnswers": "Paso 2 de 2 · Tus respuestas",
      "answersLead": "Marca lo que es cierto sobre ti. Puedes cambiar cualquier pregunta.",
      "swap": "Otra pregunta",
      "progress": "{done} de {total} respondidas",
      "answerAll": "Elige una respuesta en cada pregunta.",
      "finish": "Obtener el enlace",
      "creating": "Creando el test…",
      "createdTitle": "¡Tu test está listo!",
      "createdLead": "Envía el enlace. Cuando respondan, el resultado aparecerá en «Mis tests».",
      "shareText": "{name} te invita a jugar a «¿Cuánto me conoces?»",
      "signInTitle": "Inicia sesión para continuar",
      "signInNote": "El test se guarda en tu cuenta para que los resultados te lleguen a ti.",
      "signIn": "Iniciar sesión",
      "premiumNote": "Crear juegos forma parte del acceso completo. Jugar desde un enlace es gratis para todos.",
      "failed": "Algo ha fallado. Revisa la conexión e inténtalo de nuevo.",
      "rateLimited": "Demasiados intentos. Inténtalo más tarde.",
      "playEyebrow": "UN JUEGO PARA DOS",
      "playInvite": "{name} te invita a jugar",
      "playLead": "Preguntas: {count}. Adivina las respuestas: al final verás cuántas coinciden.",
      "playName": "Tu nombre · opcional",
      "playNamePlaceholder": "Para que sepan que eres tú",
      "start": "Empezar",
      "playLoading": "Cargando el juego…",
      "playMissing": "Este juego no está disponible: el enlace se eliminó o ha caducado.",
      "playOffline": "El juego necesita conexión a internet.",
      "retry": "Reintentar",
      "questionOf": "Pregunta {n} de {total}",
      "asks": "{name} pregunta",
      "counting": "Contando coincidencias…",
      "scoreOf": "{score} de {total}",
      "tierAll": "¡Perfecto! Os conocéis mejor que nadie",
      "tierHigh": "Os conocéis muy bien",
      "tierMid": "¡No está mal! Aún queda mucho por descubrir",
      "tierLow": "Os esperan muchos descubrimientos bonitos",
      "sentTo": "{name} verá tu resultado",
      "review": "Tus respuestas",
      "rightAnswer": "Respuesta correcta",
      "makeOwn": "Crear mi propio test",
      "home": "Inicio",
      "resultToast": "{name}: {score} de {total} en «¿Cuánto me conoces?»",
      "ownerAnswers": "Respuestas del autor",
      "playerAnswers": "Respuestas de {name}",
      "paywallTitle": "Juegos, diversión<br><em>y cartas</em>",
      "groupGames": "Juegos",
      "groupFun": "Diversión",
      "groupLetters": "Cartas",
      "featQuiz": "«¿Cuánto me conoces?»: el resultado te llega a ti",
      "featGamesSoon": "Duelo «¿Quién es más rápido?», «Lo que nos gusta», cartas con ositos",
      "featFunSoon": "«¿Quién de los dos?» y «Completa la frase» con el libro de la pareja",
      "featCollection": "Toda la colección de cartas y poemas en 25 idiomas",
      "featMoments": "Momentos, recordatorios y una carta QR que se abre el día indicado",
      "featAudio": "Tu propio audio en la carta y respuestas del destinatario",
      "ynTitle": "Sí o no",
      "ynNote": "Un juego en directo para dos: 5 segundos por tarjeta. Si respondes a tiempo, verás la respuesta de la otra persona.",
      "ynCreate": "Crear sala",
      "ynWaiting": "Esperamos a que {name} abra el enlace…",
      "ynWaitingAny": "Esperando a la otra persona…",
      "ynShareText": "{name} te invita al juego en directo «Sí o no»",
      "ynPartnerHere": "¡{name} ya está aquí!",
      "ynStart": "Empezar el juego",
      "ynWaitHost": "{name} va a empezar el juego",
      "ynYes": "Sí",
      "ynNo": "No",
      "ynMissed": "Demasiado tarde: esta tarjeta queda cerrada",
      "ynMatch": "¡Coincidís!",
      "ynRound": "Tarjeta {n} de {total}",
      "ynAnswered": "Respuesta enviada, esperando a la otra persona…",
      "ynFinal": "{score} de {total} coincidencias",
      "ynFinalHigh": "Os entendéis sin palabras",
      "ynFinalMid": "Tan distintos y tan cerca",
      "ynAgain": "Jugar otra vez",
      "ynLeft": "La otra persona se ha desconectado. Esperamos su vuelta…",
      "ynYou": "Tú",
      "ynOffline": "No se puede conectar al juego. Revisa internet y abre el enlace de nuevo.",
      "ynJoin": "Entrar al juego",
      "ynJoinLead": "{name} te espera. ¡5 segundos por respuesta!",
      "ynStepNames": "Tu nombre y el de la otra persona",
      "ynRoomReady": "La sala está lista: envía el enlace",
      "ynStayHere": "No cierres esta pantalla: el juego empieza cuando se abra el enlace.",
      "featYesNo": "Juego en directo «Sí o no»: 5 segundos por respuesta",
      "ynPartnerMissed": "Sin respuesta: se acabó el tiempo",
      "lvTitle": "Lo que nos gusta",
      "lvNote": "Un juego en directo para dos: 4 imágenes, 10 segundos para elegir lo que más te gusta. ¡Podéis elegir lo mismo!",
      "lvShareText": "{name} te invita al juego en directo «Lo que nos gusta»",
      "lvJoinLead": "{name} te espera. ¡Elige la imagen que más te guste!",
      "lvRound": "Tema {n} de {total}",
      "lvPick": "Elige lo que más te gusta",
      "lvBoth": "Los dos habéis elegido: {item}",
      "lvCommon": "A los dos os encanta",
      "lvDiff": "Gustos distintos: ¡aún más interesante!",
      "lvFinalHigh": "¡Tenéis muchísimo en común!",
      "lvFinalMid": "Tan distintos, y os complementáis",
      "featLoves": "Juego en directo «Lo que nos gusta»: 4 imágenes, elegid juntos",
      "featGamesSoon2": "Duelo «¿Quién es más rápido?» y cartas de memoria con ositos",
      "mcTitle": "Cartas de memoria con ositos",
      "mcNote": "Un juego de memoria en directo para dos: por turnos, dad la vuelta a dos cartas y encontrad las parejas. Tres niveles, de 8 a 16 cartas.",
      "mcShareText": "{name} te invita al juego en directo «Cartas de memoria con ositos»",
      "mcJoinLead": "{name} te espera. ¡Encontrad las parejas por turnos!",
      "mcLevel": "Nivel {n} de {total}",
      "mcTurnYou": "Tu turno: da la vuelta a dos cartas",
      "mcTurnThem": "Turno de {name}",
      "mcPairs": "Parejas encontradas: {found} de {total}",
      "mcLevelDone": "¡Todas las parejas encontradas!",
      "mcTimeUp": "Se acabó el tiempo del nivel",
      "mcNext": "Siguiente: nivel {n}",
      "mcFinal": "Parejas encontradas: {found} de {total}",
      "mcFinalHigh": "¡Un equipo estupendo!",
      "mcFinalMid": "Buena partida: ¿otra?",
      "featCards": "Juego en directo «Cartas de memoria con ositos»: buscad parejas juntos",
      "featGamesSoon3": "Duelo «¿Quién es más rápido?»",
      "duTitle": "¿Quién es más rápido?",
      "duNote": "Un duelo en directo: una palabra y cuatro imágenes. Toca primero la imagen correcta; si fallas, pierdes la ronda.",
      "duShareText": "{name} te reta al duelo en directo «¿Quién es más rápido?»",
      "duJoinLead": "{name} te espera. ¡Encuentra antes la imagen correcta!",
      "duRound": "Ronda {n} de {total}",
      "duFind": "Encuentra: {item}",
      "duYouWon": "¡Has llegado antes!",
      "duTheyWon": "Más rapidez: {name}",
      "duWrong": "Imagen equivocada: ronda perdida",
      "duNobody": "Nadie la encontró a tiempo",
      "duScore": "Tú {you} : {them} {name}",
      "duFinalWin": "¡Victoria! Hoy tienes buen ojo.",
      "duFinalLose": "Esta vez gana {name}. ¿Revancha?",
      "duFinalDraw": "Empate: ¡estáis a la par!",
      "duSeconds": "{s} s",
      "featDuel": "Duelo en directo «¿Quién es más rápido?»: encuentra la imagen antes",
      "whoTitle": "¿Quién de los dos?",
      "whoNote": "Un juego en directo para dos: una pregunta, toca «Yo» o el nombre de la otra persona. Descubrid si estáis de acuerdo.",
      "whoShareText": "{name} te invita al juego en directo «¿Quién de los dos?»",
      "whoJoinLead": "{name} te espera. Responde con sinceridad y luego comparad.",
      "whoRound": "Pregunta {n} de {total}",
      "whoMe": "Yo",
      "whoAgree": "Coincidís: {name}",
      "whoDiffer": "Opiniones distintas: ¡habladlo!",
      "whoFinal": "Coincidisteis {score} de {total} veces",
      "whoFinalHigh": "¡Os conocéis muy bien!",
      "whoFinalMid": "Mucho de qué hablar, y eso es precioso",
      "featWho": "Juego en directo «¿Quién de los dos?»: ¿coincidís?",
      "phTitle": "Completa la frase",
      "phNote": "Un juego en directo para dos: cada quien completa la misma frase tierna con sus palabras y luego leéis las respuestas.",
      "phShareText": "{name} te invita al juego en directo «Completa la frase»",
      "phJoinLead": "{name} te espera. ¡Completa cada frase con tus palabras!",
      "phRound": "Frase {n} de {total}",
      "phPlaceholder": "Tu final…",
      "phDone": "Listo",
      "phWaiting": "Esperando a {name}…",
      "phSkipped": "Sin respuesta",
      "phSave": "Guardar en el libro de la pareja",
      "phSaved": "Guardado en el libro de la pareja",
      "phForbidden": "Escríbelo sin enlaces ni palabras groseras.",
      "phNext": "Siguiente frase",
      "phFinal": "Frases completadas a dúo: {count}",
      "phFinalLead": "Guardad vuestras respuestas favoritas en el libro de la pareja.",
      "featPhrase": "Juego en directo «Completa la frase» con el libro de la pareja",
      "bookTitle": "Libro de la pareja",
      "bookNote": "Las respuestas más tiernas de «Completa la frase», guardadas en tu cuenta.",
      "bookOpen": "Abrir el libro",
      "bookEmpty": "Por ahora el libro está vacío. Jugad a «Completa la frase» y guardad las respuestas que os gusten.",
      "bookDelete": "Eliminar",
      "bookDeleteConfirm": "¿Eliminar esta página del libro?",
      "bookYou": "Tú",
      "inviteTitle": "Invitar a alguien",
      "inviteNote": "Recibirá un mensaje con el juego.",
      "invite": "Invitar",
      "invited": "Invitación enviada",
      "inviteNone": "Añade amigos en la sección «Amigos» para invitarlos con un toque.",
      "inviteSent": "Invitación enviada a {name}"
    },
    "questions": {
      "q01": [
        "¿Mi estación favorita?",
        "Primavera",
        "Verano",
        "Otoño",
        "Invierno"
      ],
      "q02": [
        "¿Qué elegiría para desayunar?",
        "Café y cruasán",
        "Gachas de avena",
        "Huevos",
        "Solo té"
      ],
      "q03": [
        "¿Mi día libre perfecto?",
        "En casa bajo una manta",
        "Un paseo por el parque",
        "Una escapada fuera de la ciudad",
        "Tiempo con amigos"
      ],
      "q04": [
        "¿Adónde sueño con viajar?",
        "Al mar",
        "A la montaña",
        "A una gran ciudad",
        "A una casita acogedora en el campo"
      ],
      "q05": [
        "¿Mi helado favorito?",
        "Vainilla",
        "Chocolate",
        "Fresa",
        "Pistacho"
      ],
      "q06": [
        "¿Qué me anima más rápido?",
        "Un abrazo",
        "Una sorpresa",
        "Palabras bonitas",
        "Algo rico"
      ],
      "q07": [
        "Yo soy más bien…",
        "De madrugar",
        "De trasnochar",
        "De dormir cuando se puede",
        "Fan de la siesta"
      ],
      "q08": [
        "¿Qué película elegiría esta noche?",
        "Una comedia",
        "Una historia romántica",
        "Una de misterio",
        "Una de animación"
      ],
      "q09": [
        "¿Mi color favorito?",
        "Rojo",
        "Azul",
        "Verde",
        "Rosa"
      ],
      "q10": [
        "¿Qué es lo que más miedo me da?",
        "Las arañas",
        "Las alturas",
        "La oscuridad",
        "Llegar tarde"
      ],
      "q11": [
        "¿Qué flores me encantan?",
        "Rosas",
        "Tulipanes",
        "Peonías",
        "Margaritas"
      ],
      "q12": [
        "¿Qué hago cuando estoy triste?",
        "Llamo a alguien cercano",
        "Como algo dulce",
        "Salgo a caminar",
        "Me voy a dormir"
      ],
      "q13": [
        "¿Qué animal se parece más a mí?",
        "Un gatito",
        "Un perro",
        "Un osezno",
        "Un zorrito"
      ],
      "q14": [
        "¿El mejor regalo para mí?",
        "Algo hecho a mano",
        "Un viaje",
        "Una joya",
        "Un libro"
      ],
      "q15": [
        "¿Mi bebida favorita?",
        "Té negro",
        "Té verde",
        "Café",
        "Chocolate caliente"
      ],
      "q16": [
        "¿Mi tentempié favorito?",
        "Chocolate",
        "Patatas fritas",
        "Fruta",
        "Un pastelito"
      ],
      "q17": [
        "¿Qué elijo cuando viajo?",
        "Museos",
        "La playa",
        "La comida local",
        "Pasear sin plan"
      ],
      "q18": [
        "¿Cómo me gusta pasar la tarde?",
        "Con un libro",
        "Con una serie",
        "Charlando",
        "Dando un paseo"
      ],
      "q19": [
        "¿Qué tiempo me gusta más?",
        "Sol",
        "Lluvia templada",
        "Nevada",
        "Una brisa suave"
      ],
      "q20": [
        "¿Qué superpoder me iría bien?",
        "Volar",
        "Leer mentes",
        "Detener el tiempo",
        "Teletransportarme"
      ],
      "q21": [
        "¿Qué es lo que más valoro en mis seres queridos?",
        "La confianza",
        "El cariño",
        "El sentido del humor",
        "El apoyo"
      ],
      "q22": [
        "¿Qué celebración espero con más ganas?",
        "Año Nuevo",
        "Mi cumpleaños",
        "Las vacaciones de verano",
        "San Valentín"
      ],
      "q23": [
        "¿Cómo suelo decir «te quiero»?",
        "Con palabras",
        "Con hechos",
        "Con abrazos",
        "Con regalos"
      ],
      "q24": [
        "¿Qué pediría en una cafetería?",
        "Pasta",
        "Sushi",
        "Una ensalada",
        "Un postre"
      ],
      "q25": [
        "¿Mi momento favorito del día?",
        "La mañana",
        "La tarde",
        "El atardecer",
        "La noche"
      ],
      "q26": [
        "¿Qué cocina elegiría?",
        "Italiana",
        "Japonesa",
        "Casera",
        "Mexicana"
      ],
      "q27": [
        "¿Dónde pienso mejor?",
        "En la ducha",
        "Paseando",
        "De viaje",
        "Antes de dormir"
      ],
      "q28": [
        "¿Qué hago nada más levantarme?",
        "Mirar el móvil",
        "Beber agua",
        "Preparar café",
        "Quedarme un rato más en la cama"
      ],
      "q29": [
        "¿Mi fruta favorita?",
        "Manzana",
        "Plátano",
        "Mango",
        "Sandía"
      ],
      "q30": [
        "¿Qué afición va más conmigo?",
        "Dibujar",
        "Cocinar",
        "Hacer deporte",
        "Leer"
      ],
      "q31": [
        "¿Cómo quiero celebrar mi cumpleaños?",
        "Con una gran fiesta",
        "Con una cena para dos",
        "Con un viaje",
        "Con una tarde tranquila en casa"
      ],
      "q32": [
        "¿Qué me parecen las sorpresas?",
        "Me encantan",
        "Me ponen un poco de los nervios",
        "Me encanta prepararlas para otros",
        "Prefiero saberlo de antemano"
      ],
      "q33": [
        "¿Qué dulce prefiero?",
        "Tarta",
        "Helado",
        "Galletas",
        "Caramelos"
      ],
      "q34": [
        "¿Qué me llevaría a una isla desierta?",
        "Un libro",
        "Mi móvil",
        "Una manta",
        "Una cámara"
      ],
      "q35": [
        "¿Cómo descanso después de un día duro?",
        "Un baño caliente",
        "Una serie",
        "Un paseo",
        "Una charla con alguien cercano"
      ],
      "q36": [
        "¿Qué medio de transporte me gusta más?",
        "El tren",
        "El avión",
        "El coche",
        "La bicicleta"
      ],
      "q37": [
        "¿Mi juego favorito de la infancia?",
        "El escondite",
        "El pilla-pilla",
        "Las construcciones",
        "Dibujar"
      ],
      "q38": [
        "¿Qué cuento se parece más a mí?",
        "Cenicienta",
        "El Principito",
        "Winnie the Pooh",
        "Alicia en el país de las maravillas"
      ],
      "q39": [
        "¿Cómo alegraría antes a un ser querido?",
        "Con una sorpresa",
        "Con una tarjeta",
        "Con un viaje",
        "Con una cena"
      ],
      "q40": [
        "¿Qué fotografío más?",
        "A mí",
        "La naturaleza",
        "La comida",
        "Casi no hago fotos"
      ],
      "q41": [
        "¿Mi rincón favorito de casa?",
        "La cama",
        "La cocina",
        "El sofá",
        "El balcón"
      ],
      "q42": [
        "¿Qué es lo primero que noto en una persona?",
        "La sonrisa",
        "Los ojos",
        "La voz",
        "El sentido del humor"
      ],
      "q43": [
        "¿Qué me hace reír más rápido?",
        "Vídeos graciosos",
        "Las bromas de mis seres queridos",
        "Situaciones incómodas",
        "Los animales"
      ],
      "q44": [
        "¿Qué bebo en un día caluroso?",
        "Limonada",
        "Té helado",
        "Zumo",
        "Agua con hielo"
      ],
      "q45": [
        "¿Qué elemento se parece más a mí?",
        "El agua",
        "El fuego",
        "La tierra",
        "El aire"
      ],
      "q46": [
        "¿Qué historias me encantan?",
        "De aventuras",
        "De amor",
        "De ciencia ficción",
        "Reales"
      ],
      "q47": [
        "¿Cómo paso un día de lluvia?",
        "Leyendo",
        "Durmiendo",
        "Viendo una película",
        "Paseando con paraguas"
      ],
      "q48": [
        "¿Qué valoro más de un regalo?",
        "El detalle",
        "Que sea útil",
        "Que sea bonito",
        "La sorpresa"
      ],
      "q49": [
        "¿Qué patatas elegiría?",
        "Puré",
        "Fritas",
        "Al horno",
        "De bolsa"
      ],
      "q50": [
        "¿Adónde voy primero en una ciudad nueva?",
        "A un café",
        "A un museo",
        "A un parque",
        "De tiendas"
      ],
      "q51": [
        "¿Qué hago cuando no puedo dormir?",
        "Leo",
        "Miro el móvil",
        "Cuento ovejas",
        "Tomo leche caliente"
      ],
      "q52": [
        "¿Cómo me preparo para un día importante?",
        "Lo planeo todo antes",
        "Lo dejo para el último momento",
        "Pido ayuda",
        "Me entran los nervios y no duermo"
      ],
      "q53": [
        "¿Qué deporte me gusta más ver?",
        "Fútbol",
        "Tenis",
        "Patinaje artístico",
        "No veo deporte"
      ],
      "q54": [
        "¿Qué mascota va conmigo?",
        "Un gato",
        "Un perro",
        "Un loro",
        "Un hámster"
      ],
      "q55": [
        "¿Qué tipo de mensajes escribo?",
        "Largos",
        "Cortos",
        "Llenos de emojis",
        "Notas de voz"
      ],
      "q56": [
        "¿Qué regalo he guardado más tiempo?",
        "Una carta",
        "Un juguete",
        "Una foto",
        "Una joya"
      ],
      "q57": [
        "¿Qué elegiría antes?",
        "Té junto a la chimenea",
        "Un pícnic en la hierba",
        "Un paseo junto al mar",
        "Ir al cine"
      ],
      "q58": [
        "¿Qué cumplido me haría más ilusión?",
        "Sobre mi aspecto",
        "Sobre mi inteligencia",
        "Sobre mi bondad",
        "Sobre mi sentido del humor"
      ],
      "q59": [
        "¿Mi mañana perfecta?",
        "Desayuno en la cama",
        "Correr temprano",
        "Dormir hasta tarde",
        "Café en el balcón"
      ],
      "q60": [
        "¿Qué quiero aprender?",
        "A bailar",
        "A cocinar",
        "Un idioma nuevo",
        "A dibujar"
      ]
    },
    "yesNo": {
      "c01": [
        "¿Me echas de menos ahora mismo?",
        "te echa mucho de menos",
        "aguanta, pero piensa en ti"
      ],
      "c02": [
        "¿Sonríes cuando ves mi mensaje?",
        "siempre sonríe",
        "sonríe por dentro"
      ],
      "c03": [
        "¿Recuerdas nuestro primer encuentro?",
        "recuerda cada minuto",
        "recuerda lo esencial: a ti"
      ],
      "c04": [
        "¿Quieres un abrazo hoy?",
        "espera tu abrazo",
        "guarda los abrazos para luego"
      ],
      "c05": [
        "¿Vamos juntos al mar?",
        "ya está haciendo la maleta",
        "sueña con la montaña"
      ],
      "c06": [
        "¿Te hago reír?",
        "se ríe de corazón",
        "esconde una sonrisa"
      ],
      "c07": [
        "¿Estás en calma conmigo?",
        "siente paz a tu lado",
        "se divierte contigo"
      ],
      "c08": [
        "¿Piensas en mí durante el día?",
        "piensa en ti muy a menudo",
        "piensa en ti justo ahora"
      ],
      "c09": [
        "¿Te encantan mis sorpresas?",
        "le encantan tus sorpresas",
        "prefiere tenerte simplemente cerca"
      ],
      "c10": [
        "¿Hacemos juntos un pastel?",
        "ya se está poniendo el delantal",
        "prefiere comprar una tarta"
      ],
      "c11": [
        "¿Vemos una película esta noche?",
        "ya está eligiendo la película",
        "prefiere simplemente charlar"
      ],
      "c12": [
        "¿Te gusta mi voz?",
        "podría escucharla sin fin",
        "le gusta aún más tu risa"
      ],
      "c13": [
        "¿Hacemos un pícnic el fin de semana?",
        "prepara la manta",
        "te invita a un café acogedor"
      ],
      "c14": [
        "¿Quieres recibir una carta mía?",
        "espera tu carta",
        "quiere oírlo todo en persona"
      ],
      "c15": [
        "¿Soy muy importante para ti?",
        "importas muchísimo",
        "más de lo que crees"
      ],
      "c16": [
        "¿Paseamos bajo la lluvia?",
        "coge un paraguas para dos",
        "prefiere hacer té en casa"
      ],
      "c17": [
        "¿Nos parecemos?",
        "sois como dos mitades",
        "os complementáis de maravilla"
      ],
      "c18": [
        "¿Te gusta cómo cocino?",
        "pide repetir",
        "le encanta cocinar contigo"
      ],
      "c19": [
        "¿Tenemos una mascota juntos?",
        "ya está eligiendo el nombre",
        "de momento basta con un osito de peluche"
      ],
      "c20": [
        "¿Sabes lo que me encanta?",
        "lo sabe de memoria",
        "quiere saber todavía más"
      ],
      "c21": [
        "¿Bailamos?",
        "ya te tiende la mano",
        "aplaudirá con ganas"
      ],
      "c22": [
        "¿Te inspiro?",
        "le inspiras cada día",
        "a tu lado simplemente hay calidez"
      ],
      "c23": [
        "¿Guardas nuestras fotos?",
        "las guarda todas con cariño",
        "espera otras nuevas, aún mejores"
      ],
      "c24": [
        "¿Vemos juntos el amanecer?",
        "ya pone el despertador",
        "prefiere ver la puesta de sol"
      ],
      "c25": [
        "¿Me cuentas un secreto?",
        "te lo susurrará al oído",
        "que siga siendo un misterio"
      ],
      "c26": [
        "¿Crees en mí?",
        "cree en ti muchísimo",
        "te anima cada día"
      ],
      "c27": [
        "¿Viajamos solos tú y yo?",
        "sueña con ello",
        "se llevará a toda la familia"
      ],
      "c28": [
        "¿Esperas mi llamada?",
        "la espera con una sonrisa",
        "prefiere verte en persona"
      ],
      "c29": [
        "¿Te gustan mis abrazos?",
        "los más cálidos del mundo",
        "le encanta ir de la mano"
      ],
      "c30": [
        "¿Nos leemos en voz alta?",
        "ya está eligiendo un libro",
        "prefiere escucharte"
      ],
      "c31": [
        "¿Nos hacemos una foto juntos hoy?",
        "ya busca un fondo bonito",
        "primero, charlar"
      ],
      "c32": [
        "¿Te levanto el ánimo?",
        "siempre",
        "contigo hasta la tristeza pesa menos"
      ],
      "c33": [
        "¿Desayunamos juntos mañana?",
        "ya prepara el cacao",
        "sueña con dormir hasta tarde"
      ],
      "c34": [
        "¿Recuerdas mi cumpleaños?",
        "sin necesidad de recordatorio",
        "prepara una sorpresa en secreto"
      ],
      "c35": [
        "¿Vamos a patinar sobre hielo?",
        "saca ya los patines",
        "te animará desde la barandilla"
      ],
      "c36": [
        "¿Es un buen día para ti?",
        "un día genial",
        "será mejor contigo cerca"
      ],
      "c37": [
        "¿Dibujas mi retrato?",
        "ya coge el lápiz",
        "dibujará un corazoncito"
      ],
      "c38": [
        "¿Plantamos juntos un árbol?",
        "elige el lugar",
        "empezará con una flor en la ventana"
      ],
      "c39": [
        "¿Quieres oír un cumplido?",
        "lo espera con ilusión",
        "le da vergüenza, pero lo desea mucho"
      ],
      "c40": [
        "¿Jugamos otra vez luego?",
        "quiere otra ronda",
        "prefiere un abrazo a jugar"
      ]
    },
    "loves": {
      "s01": [
        "¿Dónde pasar las vacaciones?",
        "Playa",
        "Montaña",
        "Viajar",
        "Tiempo a solas"
      ],
      "s02": [
        "¿La tarde perfecta?",
        "Cine en casa",
        "Un paseo",
        "Restaurante",
        "Juegos de mesa"
      ],
      "s03": [
        "¿Tiempo favorito?",
        "Sol",
        "Lluvia",
        "Nieve",
        "Noche estrellada"
      ],
      "s04": [
        "¿Animal favorito?",
        "Gatito",
        "Cachorro",
        "Caballo",
        "Delfín"
      ],
      "s05": [
        "¿Qué cenamos?",
        "Pizza",
        "Sushi",
        "Pasteles",
        "Barbacoa"
      ],
      "s06": [
        "¿Bebida favorita?",
        "Café",
        "Té",
        "Chocolate caliente",
        "Limonada"
      ],
      "s07": [
        "¿Estación favorita?",
        "Primavera",
        "Verano",
        "Otoño",
        "Invierno"
      ],
      "s08": [
        "¿Flores favoritas?",
        "Rosas",
        "Tulipanes",
        "Girasoles",
        "Lavanda"
      ],
      "s09": [
        "¿Cómo descansar?",
        "Con un libro",
        "Dibujando",
        "En bici",
        "Siesta en la hamaca"
      ],
      "s10": [
        "¿Cómo viajar?",
        "En tren",
        "En avión",
        "En coche",
        "En barco"
      ],
      "s11": [
        "¿Casa de ensueño?",
        "Piso en la ciudad",
        "Casa junto al mar",
        "Cabaña en la montaña",
        "Granja"
      ],
      "s12": [
        "¿Algo dulce?",
        "Helado",
        "Chocolate",
        "Tarta",
        "Fruta"
      ],
      "s13": [
        "¿La mañana perfecta?",
        "Desayuno en la cama",
        "Correr",
        "Dormir hasta tarde",
        "Café en el balcón"
      ],
      "s14": [
        "¿Cita de ensueño?",
        "Pícnic",
        "Pista de hielo",
        "Parque de atracciones",
        "Estrellas en la azotea"
      ],
      "s15": [
        "¿El mejor regalo?",
        "Un ramo de flores",
        "Una carta",
        "Un viaje",
        "Una caja regalo"
      ],
      "s16": [
        "¿Naturaleza favorita?",
        "Mar",
        "Bosque",
        "Desierto",
        "Aurora boreal"
      ]
    },
    "who": [
      "¿Quién de los dos llega tarde más a menudo?",
      "¿Quién de los dos hace las paces primero?",
      "¿Quién de los dos cocina mejor?",
      "¿Quién de los dos se ríe más a menudo?",
      "¿Quién de los dos tarda más en arreglarse?",
      "¿Quién de los dos pierde las llaves más a menudo?",
      "¿Quién de los dos recuerda mejor las fechas importantes?",
      "¿Quién de los dos tiene más debilidad por lo dulce?",
      "¿Quién de los dos se duerme primero?",
      "¿Quién de los dos se levanta más temprano?",
      "¿Quién de los dos dice «te echo de menos» más a menudo?",
      "¿Quién de los dos elige mejores regalos?",
      "¿Quién de los dos bromea más a menudo?",
      "¿Quién de los dos conduce mejor?",
      "¿Quién de los dos habla más tiempo por teléfono?",
      "¿Quién de los dos disfruta más de viajar?",
      "¿Quién de los dos se ofende más fácilmente?",
      "¿Quién de los dos perdona más rápido?",
      "¿Quién de los dos hace más fotos?",
      "¿Quién de los dos administra mejor el dinero?",
      "¿Quién de los dos compra más a menudo cosas que no necesitamos?",
      "¿Quién de los dos consuela mejor?",
      "¿Quién de los dos mantiene más la calma en los momentos difíciles?",
      "¿Quién de los dos siempre está buscando su móvil?",
      "¿Quién de los dos disfruta más recibiendo invitados?",
      "¿Quién de los dos prepara el desayuno más a menudo?",
      "¿Quién de los dos se orienta mejor en una ciudad nueva?",
      "¿Quién de los dos escribe mensajes más largos?",
      "¿Quién de los dos propone primero dar un paseo?",
      "¿Quién de los dos quiere más a los animales?",
      "¿Quién de los dos guarda mejor los secretos?",
      "¿Quién de los dos tarda más en elegir de la carta?",
      "¿Quién de los dos se preocupa más por sus seres queridos?",
      "¿Quién de los dos da más sorpresas?",
      "¿Quién de los dos mantiene mejor el orden?",
      "¿Quién de los dos nota primero un corte de pelo nuevo?",
      "¿Quién de los dos recuerda historias divertidas más a menudo?",
      "¿Quién de los dos tiene más paciencia?",
      "¿Quién de los dos dice «gracias» más a menudo?",
      "¿Quién de los dos ofrece ayuda primero?"
    ],
    "phrases": [
      "Sonrío cuando tú…",
      "Mi día favorito contigo es…",
      "Gracias por…",
      "Cuando estoy triste, lo que me ayuda es…",
      "Algún día quiero que hagamos…",
      "El recuerdo más tierno de nosotros es…",
      "Nadie sabe mejor que tú…",
      "Siento calma cuando…",
      "Si tuviéramos un día entero libre, nosotros…",
      "Siento orgullo de ti porque…",
      "Nuestra tarde perfecta es…",
      "Nunca olvidaré cómo tú…",
      "Me gusta cuando dices…",
      "El año que viene quiero que…",
      "Para mí, eres como…",
      "El mejor regalo que me has hecho es…",
      "Te echo de menos cuando…",
      "Nos reímos más cuando…",
      "Hace tiempo que quiero decirte…",
      "Nuestro lugar es…",
      "Cuando pienso en ti, yo…",
      "Haces mi día mejor cuando…",
      "Me gusta nuestra costumbre de…",
      "Mi deseo para nosotros: …",
      "Lo más divertido que nos ha pasado es…",
      "Siento tu cariño cuando tú…",
      "Una mañana contigo es…",
      "Si fuéramos una sola palabra, sería…",
      "Quiero aprender de ti a…",
      "Gracias por estar siempre…"
    ]
  },
  "it": {
    "text": {
      "homeLink": "Giochi in due",
      "eyebrow": "GLOWLETTER · GIOCHI IN DUE",
      "title": "Giocate insieme",
      "close": "Chiudi",
      "lead": "Invia un gioco a una persona cara. Giocare da un link è gratis e non serve un account.",
      "quizTitle": "Quanto mi conosci?",
      "quizNote": "Rispondi a domande su di te e lascia che una persona vicina provi a indovinare. Il risultato torna a te.",
      "create": "Crea un quiz",
      "soon": "Presto",
      "soonTitle": "Altri giochi in arrivo",
      "duel": "Sfida «Chi è più veloce»",
      "loves": "Ciò che amiamo",
      "cards": "Carte memory in due",
      "who": "Chi di noi?",
      "phrase": "Completa la frase",
      "myQuizzes": "I miei quiz",
      "noQuizzes": "Ancora nessun quiz. Il primo si crea in un paio di minuti.",
      "forWhom": "Per {name}",
      "noRecipient": "Quiz",
      "resultsCount": "Risultati: {count}",
      "newResults": "Nuovi: {count}",
      "noResults": "Nessuno ha ancora giocato.",
      "anonymous": "Senza nome",
      "results": "Risultati",
      "copyLink": "Copia il link",
      "share": "Invia",
      "deleteQuiz": "Elimina il quiz",
      "deleteConfirm": "Eliminare questo quiz e i suoi risultati? Il link smetterà di funzionare.",
      "deleted": "Quiz eliminato",
      "linkCopied": "Link copiato",
      "back": "Indietro",
      "next": "Avanti",
      "stepNames": "Passo 1 di 2 · Nomi",
      "yourName": "Il tuo nome",
      "yourNamePlaceholder": "Come ti chiami",
      "recipient": "Per chi · facoltativo",
      "recipientPlaceholder": "Il suo nome",
      "nameRequired": "Inserisci il tuo nome.",
      "forbiddenName": "Inserisci un nome normale.",
      "stepAnswers": "Passo 2 di 2 · Le tue risposte",
      "answersLead": "Segna ciò che è vero per te. Ogni domanda si può cambiare.",
      "swap": "Un’altra domanda",
      "progress": "{done} su {total} risposte",
      "answerAll": "Scegli una risposta per ogni domanda.",
      "finish": "Ottieni il link",
      "creating": "Creo il quiz…",
      "createdTitle": "Il tuo quiz è pronto!",
      "createdLead": "Invia il link. Quando risponderanno, il risultato apparirà in «I miei quiz».",
      "shareText": "{name} ti invita a giocare a «Quanto mi conosci?»",
      "signInTitle": "Accedi per continuare",
      "signInNote": "Il quiz resta nel tuo account, così i risultati arrivano a te.",
      "signIn": "Accedi",
      "premiumNote": "Creare giochi fa parte dell’accesso completo. Giocare da un link è gratis per tutti.",
      "failed": "Qualcosa è andato storto. Controlla la connessione e riprova.",
      "rateLimited": "Troppi tentativi. Riprova più tardi.",
      "playEyebrow": "UN GIOCO IN DUE",
      "playInvite": "{name} ti invita a giocare",
      "playLead": "Domande: {count}. Indovina le risposte: alla fine vedrai quante coincidono.",
      "playName": "Il tuo nome · facoltativo",
      "playNamePlaceholder": "Per farti riconoscere",
      "start": "Inizia",
      "playLoading": "Carico il gioco…",
      "playMissing": "Questo gioco non è disponibile: il link è stato eliminato o è scaduto.",
      "playOffline": "Per giocare serve una connessione a internet.",
      "retry": "Riprova",
      "questionOf": "Domanda {n} di {total}",
      "asks": "{name} chiede",
      "counting": "Conto le risposte uguali…",
      "scoreOf": "{score} su {total}",
      "tierAll": "Perfetto! Vi conoscete meglio di chiunque altro",
      "tierHigh": "Vi conoscete davvero bene",
      "tierMid": "Niente male! C’è ancora tanto da scoprire",
      "tierLow": "Vi aspettano tante belle scoperte",
      "sentTo": "{name} vedrà il tuo risultato",
      "review": "Le tue risposte",
      "rightAnswer": "Risposta giusta",
      "makeOwn": "Crea il mio quiz",
      "home": "Home",
      "resultToast": "{name}: {score} su {total} a «Quanto mi conosci?»",
      "ownerAnswers": "Risposte dell’autore",
      "playerAnswers": "Risposte di {name}",
      "paywallTitle": "Giochi, svago<br><em>e lettere</em>",
      "groupGames": "Giochi",
      "groupFun": "Svago",
      "groupLetters": "Lettere",
      "featQuiz": "«Quanto mi conosci?»: il risultato torna a te",
      "featGamesSoon": "Sfida «Chi è più veloce», «Ciò che amiamo», carte con gli orsetti",
      "featFunSoon": "«Chi di noi?» e «Completa la frase» con il libro della coppia",
      "featCollection": "L’intera raccolta di lettere e poesie in 25 lingue",
      "featMoments": "Momenti, promemoria e una lettera QR che si apre nel giorno giusto",
      "featAudio": "Il tuo audio nella lettera e le risposte del destinatario",
      "ynTitle": "Sì o no",
      "ynNote": "Un gioco dal vivo in due: 5 secondi per carta. Chi risponde in tempo vede la risposta dell’altro.",
      "ynCreate": "Crea una stanza",
      "ynWaiting": "Aspettiamo che {name} apra il link…",
      "ynWaitingAny": "In attesa dell’altra persona…",
      "ynShareText": "{name} ti invita al gioco dal vivo «Sì o no»",
      "ynPartnerHere": "{name} è qui!",
      "ynStart": "Inizia il gioco",
      "ynWaitHost": "{name} sta per iniziare il gioco",
      "ynYes": "Sì",
      "ynNo": "No",
      "ynMissed": "Troppo tardi: questa carta resta chiusa",
      "ynMatch": "Stessa risposta!",
      "ynRound": "Carta {n} di {total}",
      "ynAnswered": "Risposta inviata, in attesa dell’altra persona…",
      "ynFinal": "{score} su {total} in comune",
      "ynFinalHigh": "Vi capite senza parole",
      "ynFinalMid": "Così diversi, e così vicini",
      "ynAgain": "Gioca ancora",
      "ynLeft": "L’altra persona si è disconnessa. Aspettiamo che torni…",
      "ynYou": "Tu",
      "ynOffline": "Impossibile collegarsi al gioco. Controlla internet e riapri il link.",
      "ynJoin": "Entra nel gioco",
      "ynJoinLead": "{name} ti aspetta. 5 secondi per ogni risposta!",
      "ynStepNames": "Il tuo nome e quello dell’altra persona",
      "ynRoomReady": "La stanza è pronta: invia il link",
      "ynStayHere": "Tieni aperta questa schermata: il gioco inizia quando il link viene aperto.",
      "featYesNo": "Gioco dal vivo «Sì o no»: 5 secondi per risposta",
      "ynPartnerMissed": "Nessuna risposta: tempo scaduto",
      "lvTitle": "Ciò che amiamo",
      "lvNote": "Un gioco dal vivo in due: 4 immagini, 10 secondi per scegliere ciò che preferisci. Potete scegliere la stessa!",
      "lvShareText": "{name} ti invita al gioco dal vivo «Ciò che amiamo»",
      "lvJoinLead": "{name} ti aspetta. Scegli l’immagine che preferisci!",
      "lvRound": "Tema {n} di {total}",
      "lvPick": "Scegli ciò che preferisci",
      "lvBoth": "Avete scelto entrambi: {item}",
      "lvCommon": "Amate entrambi",
      "lvDiff": "Gusti diversi: ancora più interessante!",
      "lvFinalHigh": "Avete così tanto in comune!",
      "lvFinalMid": "Così diversi, e vi completate",
      "featLoves": "Gioco dal vivo «Ciò che amiamo»: 4 immagini, scegliete insieme",
      "featGamesSoon2": "Sfida «Chi è più veloce» e carte memory con gli orsetti",
      "mcTitle": "Carte memory con gli orsetti",
      "mcNote": "Un memory dal vivo in due: a turno girate due carte e trovate le coppie. Tre livelli, da 8 a 16 carte.",
      "mcShareText": "{name} ti invita al gioco dal vivo «Carte memory con gli orsetti»",
      "mcJoinLead": "{name} ti aspetta. Trovate le coppie a turno!",
      "mcLevel": "Livello {n} di {total}",
      "mcTurnYou": "Tocca a te: gira due carte",
      "mcTurnThem": "Tocca a {name}",
      "mcPairs": "Coppie trovate: {found} su {total}",
      "mcLevelDone": "Tutte le coppie trovate!",
      "mcTimeUp": "Il tempo del livello è finito",
      "mcNext": "Poi: livello {n}",
      "mcFinal": "Coppie trovate: {found} su {total}",
      "mcFinalHigh": "Una squadra fantastica!",
      "mcFinalMid": "Bella partita: un’altra?",
      "featCards": "Gioco dal vivo «Carte memory con gli orsetti»: trovate le coppie insieme",
      "featGamesSoon3": "Sfida «Chi è più veloce»",
      "duTitle": "Chi è più veloce",
      "duNote": "Una sfida dal vivo: una parola e quattro immagini. Tocca prima tu l’immagine giusta: un tocco sbagliato fa perdere il round.",
      "duShareText": "{name} ti sfida dal vivo a «Chi è più veloce»",
      "duJoinLead": "{name} ti aspetta. Trova prima l’immagine giusta!",
      "duRound": "Round {n} di {total}",
      "duFind": "Trova: {item}",
      "duYouWon": "Hai fatto prima tu!",
      "duTheyWon": "Ha fatto prima {name}",
      "duWrong": "Immagine sbagliata: round perso",
      "duNobody": "Nessuno l’ha trovata in tempo",
      "duScore": "Tu {you} : {them} {name}",
      "duFinalWin": "Vittoria! Che occhio oggi.",
      "duFinalLose": "Questa volta vince {name}: rivincita?",
      "duFinalDraw": "Pareggio: siete alla pari!",
      "duSeconds": "{s} s",
      "featDuel": "Sfida dal vivo «Chi è più veloce»: trova prima tu l’immagine",
      "whoTitle": "Chi di noi?",
      "whoNote": "Un gioco dal vivo per due: una domanda, tocca «Io» o il nome dell’altra persona. Scoprite se la pensate allo stesso modo.",
      "whoShareText": "{name} ti invita al gioco dal vivo «Chi di noi?»",
      "whoJoinLead": "{name} ti aspetta. Rispondi con sincerità, poi confrontate!",
      "whoRound": "Domanda {n} di {total}",
      "whoMe": "Io",
      "whoAgree": "Siete d’accordo: {name}",
      "whoDiffer": "Opinioni diverse: parlatene!",
      "whoFinal": "D’accordo {score} volte su {total}",
      "whoFinalHigh": "Vi conoscete davvero bene!",
      "whoFinalMid": "Tanto di cui parlare, ed è bellissimo",
      "featWho": "Gioco dal vivo «Chi di noi?»: siete d’accordo?",
      "phTitle": "Completa la frase",
      "phNote": "Un gioco dal vivo per due: completate la stessa frase affettuosa con parole vostre, poi leggete le vostre risposte.",
      "phShareText": "{name} ti invita al gioco dal vivo «Completa la frase»",
      "phJoinLead": "{name} ti aspetta. Completa ogni frase con parole tue!",
      "phRound": "Frase {n} di {total}",
      "phPlaceholder": "Il tuo finale…",
      "phDone": "Fatto",
      "phWaiting": "In attesa di {name}…",
      "phSkipped": "Nessuna risposta",
      "phSave": "Salva nel libro della coppia",
      "phSaved": "Salvato nel libro della coppia",
      "phForbidden": "Scrivi senza link né parole volgari.",
      "phNext": "Frase successiva",
      "phFinal": "Frasi completate insieme: {count}",
      "phFinalLead": "Salvate le risposte che vi piacciono di più nel libro della coppia.",
      "featPhrase": "Gioco dal vivo «Completa la frase» con il libro della coppia",
      "bookTitle": "Libro della coppia",
      "bookNote": "Le risposte più affettuose di «Completa la frase», conservate nel tuo account.",
      "bookOpen": "Apri il libro",
      "bookEmpty": "Per ora il libro è vuoto. Giocate a «Completa la frase» e salvate le risposte che vi piacciono.",
      "bookDelete": "Elimina",
      "bookDeleteConfirm": "Eliminare questa pagina dal libro?",
      "bookYou": "Tu",
      "inviteTitle": "Invita qualcuno",
      "inviteNote": "Riceverà un messaggio con il gioco.",
      "invite": "Invita",
      "invited": "Invito inviato",
      "inviteNone": "Aggiungi persone nella sezione «Amici» per invitarle con un tocco.",
      "inviteSent": "Invito inviato a {name}"
    },
    "questions": {
      "q01": [
        "La mia stagione preferita?",
        "Primavera",
        "Estate",
        "Autunno",
        "Inverno"
      ],
      "q02": [
        "Cosa sceglierei a colazione?",
        "Caffè e cornetto",
        "Porridge",
        "Uova",
        "Solo tè"
      ],
      "q03": [
        "Il mio giorno libero ideale?",
        "A casa sotto una coperta",
        "Una passeggiata al parco",
        "Una gita fuori città",
        "Tempo con gli amici"
      ],
      "q04": [
        "Dove sogno di andare?",
        "Al mare",
        "In montagna",
        "In una grande città",
        "In una casetta accogliente in campagna"
      ],
      "q05": [
        "Il mio gelato preferito?",
        "Vaniglia",
        "Cioccolato",
        "Fragola",
        "Pistacchio"
      ],
      "q06": [
        "Cosa mi tira su più in fretta?",
        "Un abbraccio",
        "Una sorpresa",
        "Parole dolci",
        "Qualcosa di buono"
      ],
      "q07": [
        "Sono più…",
        "Una persona mattiniera",
        "Una persona nottambula",
        "Una persona che dorme quando può",
        "Amante del pisolino"
      ],
      "q08": [
        "Che film sceglierei stasera?",
        "Una commedia",
        "Una storia romantica",
        "Un giallo",
        "Un film d’animazione"
      ],
      "q09": [
        "Il mio colore preferito?",
        "Rosso",
        "Blu",
        "Verde",
        "Rosa"
      ],
      "q10": [
        "Di cosa ho più paura?",
        "Dei ragni",
        "Dell’altezza",
        "Del buio",
        "Di arrivare tardi"
      ],
      "q11": [
        "Quali fiori amo?",
        "Rose",
        "Tulipani",
        "Peonie",
        "Margherite"
      ],
      "q12": [
        "Cosa faccio quando sono triste?",
        "Chiamo una persona cara",
        "Mangio qualcosa di dolce",
        "Vado a camminare",
        "Vado a dormire"
      ],
      "q13": [
        "Quale animale mi somiglia di più?",
        "Un gattino",
        "Un cane",
        "Un orsetto",
        "Una volpacchiotta"
      ],
      "q14": [
        "Il regalo più bello per me?",
        "Qualcosa fatto a mano",
        "Un viaggio",
        "Un gioiello",
        "Un libro"
      ],
      "q15": [
        "La mia bevanda preferita?",
        "Tè nero",
        "Tè verde",
        "Caffè",
        "Cioccolata calda"
      ],
      "q16": [
        "Il mio spuntino preferito?",
        "Cioccolato",
        "Patatine",
        "Frutta",
        "Un pasticcino"
      ],
      "q17": [
        "Cosa scelgo in viaggio?",
        "I musei",
        "La spiaggia",
        "La cucina locale",
        "Passeggiare senza meta"
      ],
      "q18": [
        "Come amo passare la serata?",
        "Con un libro",
        "Con una serie",
        "Chiacchierando",
        "Passeggiando"
      ],
      "q19": [
        "Che tempo mi piace di più?",
        "Il sole",
        "Una pioggia tiepida",
        "La neve che cade",
        "Una brezza leggera"
      ],
      "q20": [
        "Quale superpotere mi starebbe bene?",
        "Volare",
        "Leggere nel pensiero",
        "Fermare il tempo",
        "Teletrasportarmi"
      ],
      "q21": [
        "Cosa conta di più per me nelle persone care?",
        "La fiducia",
        "La premura",
        "Il senso dell’umorismo",
        "Il sostegno"
      ],
      "q22": [
        "Quale festa aspetto di più?",
        "Capodanno",
        "Il mio compleanno",
        "Le vacanze estive",
        "San Valentino"
      ],
      "q23": [
        "Come dico più spesso «ti voglio bene»?",
        "Con le parole",
        "Con i gesti",
        "Con gli abbracci",
        "Con i regali"
      ],
      "q24": [
        "Cosa ordinerei al bar?",
        "Pasta",
        "Sushi",
        "Un’insalata",
        "Un dolce"
      ],
      "q25": [
        "Il mio momento preferito della giornata?",
        "La mattina",
        "Il pomeriggio",
        "La sera",
        "La notte"
      ],
      "q26": [
        "Quale cucina sceglierei?",
        "Italiana",
        "Giapponese",
        "Casalinga",
        "Messicana"
      ],
      "q27": [
        "Dove penso meglio?",
        "Sotto la doccia",
        "Passeggiando",
        "In viaggio",
        "Prima di dormire"
      ],
      "q28": [
        "Cosa faccio per prima cosa al mattino?",
        "Guardo il telefono",
        "Bevo acqua",
        "Preparo il caffè",
        "Resto ancora un po’ a letto"
      ],
      "q29": [
        "Il mio frutto preferito?",
        "Mela",
        "Banana",
        "Mango",
        "Anguria"
      ],
      "q30": [
        "Quale hobby mi somiglia di più?",
        "Disegnare",
        "Cucinare",
        "Fare sport",
        "Leggere"
      ],
      "q31": [
        "Come voglio festeggiare il compleanno?",
        "Con una grande festa",
        "Con una cena a due",
        "Con un viaggio",
        "Con una serata tranquilla a casa"
      ],
      "q32": [
        "Cosa penso delle sorprese?",
        "Mi piacciono tanto",
        "Mi agitano un po’",
        "Mi piace farle agli altri",
        "Preferisco saperlo prima"
      ],
      "q33": [
        "Quale dolce preferisco?",
        "La torta",
        "Il gelato",
        "I biscotti",
        "Le caramelle"
      ],
      "q34": [
        "Cosa porterei su un’isola deserta?",
        "Un libro",
        "Il telefono",
        "Una coperta",
        "Una macchina fotografica"
      ],
      "q35": [
        "Come mi rilasso dopo una giornata pesante?",
        "Un bagno caldo",
        "Una serie",
        "Una passeggiata",
        "Una chiacchierata con una persona cara"
      ],
      "q36": [
        "Quale mezzo di trasporto preferisco?",
        "Il treno",
        "L’aereo",
        "L’auto",
        "La bicicletta"
      ],
      "q37": [
        "Il mio gioco preferito dell’infanzia?",
        "Nascondino",
        "Acchiapparella",
        "Le costruzioni",
        "Disegnare"
      ],
      "q38": [
        "Quale fiaba mi somiglia di più?",
        "Cenerentola",
        "Il Piccolo Principe",
        "Winnie the Pooh",
        "Alice nel Paese delle Meraviglie"
      ],
      "q39": [
        "Come farei felice una persona cara?",
        "Con una sorpresa",
        "Con un biglietto",
        "Con un viaggio",
        "Con una cena"
      ],
      "q40": [
        "Cosa fotografo più spesso?",
        "Me",
        "La natura",
        "Il cibo",
        "Non faccio quasi foto"
      ],
      "q41": [
        "Il mio angolo preferito di casa?",
        "Il letto",
        "La cucina",
        "Il divano",
        "Il balcone"
      ],
      "q42": [
        "Cosa noto per primo in una persona?",
        "Il sorriso",
        "Gli occhi",
        "La voce",
        "Il senso dell’umorismo"
      ],
      "q43": [
        "Cosa mi fa ridere più in fretta?",
        "I video divertenti",
        "Le battute delle persone care",
        "Le situazioni imbarazzanti",
        "Gli animali"
      ],
      "q44": [
        "Cosa bevo in una giornata calda?",
        "Limonata",
        "Tè freddo",
        "Succo",
        "Acqua con ghiaccio"
      ],
      "q45": [
        "Quale elemento mi somiglia di più?",
        "L’acqua",
        "Il fuoco",
        "La terra",
        "L’aria"
      ],
      "q46": [
        "Quali storie amo?",
        "Di avventura",
        "D’amore",
        "Di fantascienza",
        "Vere"
      ],
      "q47": [
        "Come passo una giornata di pioggia?",
        "Leggendo",
        "Dormendo",
        "Guardando un film",
        "Passeggiando con l’ombrello"
      ],
      "q48": [
        "Cosa apprezzo di più in un regalo?",
        "Il pensiero",
        "L’utilità",
        "La bellezza",
        "La sorpresa"
      ],
      "q49": [
        "Quali patate sceglierei?",
        "Purè",
        "Patatine fritte",
        "Al forno",
        "Patatine in busta"
      ],
      "q50": [
        "Dove vado per primo in una città nuova?",
        "In un caffè",
        "In un museo",
        "In un parco",
        "Per negozi"
      ],
      "q51": [
        "Cosa faccio quando non riesco a dormire?",
        "Leggo",
        "Scorro il telefono",
        "Conto le pecore",
        "Bevo latte caldo"
      ],
      "q52": [
        "Come mi preparo a un giorno importante?",
        "Pianifico tutto prima",
        "Faccio tutto all’ultimo momento",
        "Chiedo aiuto",
        "Mi agito e non dormo"
      ],
      "q53": [
        "Quale sport mi piace di più guardare?",
        "Calcio",
        "Tennis",
        "Pattinaggio artistico",
        "Non guardo lo sport"
      ],
      "q54": [
        "Quale animale domestico fa per me?",
        "Un gatto",
        "Un cane",
        "Un pappagallo",
        "Un criceto"
      ],
      "q55": [
        "Che tipo di messaggi scrivo?",
        "Lunghi",
        "Brevi",
        "Pieni di emoji",
        "Vocali"
      ],
      "q56": [
        "Quale regalo conservo da più tempo?",
        "Una lettera",
        "Un giocattolo",
        "Una foto",
        "Un gioiello"
      ],
      "q57": [
        "Cosa sceglierei piuttosto?",
        "Un tè davanti al camino",
        "Un picnic sul prato",
        "Una passeggiata al mare",
        "Una serata al cinema"
      ],
      "q58": [
        "Quale complimento mi farebbe più piacere?",
        "Sul mio aspetto",
        "Sulla mia intelligenza",
        "Sulla mia gentilezza",
        "Sul mio umorismo"
      ],
      "q59": [
        "La mia mattina perfetta?",
        "Colazione a letto",
        "Una corsa all’alba",
        "Dormire a lungo",
        "Caffè sul balcone"
      ],
      "q60": [
        "Cosa voglio imparare?",
        "A ballare",
        "A cucinare",
        "Una nuova lingua",
        "A disegnare"
      ]
    },
    "yesNo": {
      "c01": [
        "Ti manco in questo momento?",
        "sente tanto la tua mancanza",
        "resiste, ma pensa a te"
      ],
      "c02": [
        "Sorridi quando vedi un mio messaggio?",
        "sorride sempre",
        "sorride dentro di sé"
      ],
      "c03": [
        "Ricordi il nostro primo incontro?",
        "ricorda ogni minuto",
        "ricorda l’essenziale: te"
      ],
      "c04": [
        "Vuoi un abbraccio oggi?",
        "aspetta il tuo abbraccio",
        "tiene gli abbracci per dopo"
      ],
      "c05": [
        "Andiamo insieme al mare?",
        "sta già facendo la valigia",
        "sogna la montagna"
      ],
      "c06": [
        "Ti faccio ridere?",
        "ride di cuore",
        "nasconde un sorriso"
      ],
      "c07": [
        "Ti senti in pace con me?",
        "accanto a te sente pace",
        "si diverte con te"
      ],
      "c08": [
        "Pensi a me durante il giorno?",
        "pensa a te molto spesso",
        "pensa a te proprio ora"
      ],
      "c09": [
        "Ami le mie sorprese?",
        "ama tanto le tue sorprese",
        "ama soprattutto averti vicino"
      ],
      "c10": [
        "Facciamo una torta insieme?",
        "sta già mettendo il grembiule",
        "preferisce comprarla"
      ],
      "c11": [
        "Guardiamo un film stasera?",
        "sta già scegliendo il film",
        "preferisce chiacchierare"
      ],
      "c12": [
        "Ti piace la mia voce?",
        "potrebbe ascoltarla all’infinito",
        "ama ancora di più la tua risata"
      ],
      "c13": [
        "Facciamo un picnic nel weekend?",
        "prepara la coperta",
        "ti invita in un caffè accogliente"
      ],
      "c14": [
        "Vuoi ricevere una mia lettera?",
        "aspetta la tua lettera",
        "vuole sentire tutto di persona"
      ],
      "c15": [
        "Conto molto per te?",
        "conti tantissimo",
        "più di quanto immagini"
      ],
      "c16": [
        "Passeggiamo sotto la pioggia?",
        "prende un ombrello per due",
        "preferisce fare un tè a casa"
      ],
      "c17": [
        "Ci somigliamo?",
        "siete come due metà",
        "vi completate alla perfezione"
      ],
      "c18": [
        "Ti piace come cucino?",
        "chiede il bis",
        "ama cucinare insieme a te"
      ],
      "c19": [
        "Prendiamo un animale insieme?",
        "sta già scegliendo il nome",
        "per ora basta un orsetto di peluche"
      ],
      "c20": [
        "Sai cosa amo?",
        "lo sa a memoria",
        "vuole scoprirne ancora di più"
      ],
      "c21": [
        "Balliamo?",
        "ti porge già la mano",
        "applaudirà con gioia"
      ],
      "c22": [
        "Ti ispiro?",
        "sei d’ispirazione ogni giorno",
        "accanto a te c’è semplicemente calore"
      ],
      "c23": [
        "Conservi le nostre foto?",
        "le custodisce tutte",
        "ne aspetta di nuove, ancora più belle"
      ],
      "c24": [
        "Guardiamo l’alba insieme?",
        "sta mettendo la sveglia",
        "preferisce il tramonto"
      ],
      "c25": [
        "Mi racconti un segreto?",
        "te lo sussurrerà all’orecchio",
        "che resti un mistero"
      ],
      "c26": [
        "Credi in me?",
        "crede fortemente in te",
        "ti incoraggia ogni giorno"
      ],
      "c27": [
        "Partiamo in viaggio, solo noi due?",
        "lo sogna",
        "porterà tutte le persone care"
      ],
      "c28": [
        "Aspetti una mia chiamata?",
        "la aspetta con un sorriso",
        "preferisce vederti di persona"
      ],
      "c29": [
        "Ti piacciono i miei abbracci?",
        "i più caldi del mondo",
        "ama tenersi per mano"
      ],
      "c30": [
        "Ci leggiamo qualcosa ad alta voce?",
        "sta già scegliendo un libro",
        "preferisce ascoltarti"
      ],
      "c31": [
        "Facciamo una foto insieme oggi?",
        "cerca già uno sfondo carino",
        "prima, quattro chiacchiere"
      ],
      "c32": [
        "Ti tiro su il morale?",
        "sempre",
        "con te anche la tristezza è più leggera"
      ],
      "c33": [
        "Facciamo colazione insieme domani?",
        "sta già preparando la cioccolata",
        "sogna di dormire a lungo"
      ],
      "c34": [
        "Ricordi il mio compleanno?",
        "senza bisogno di promemoria",
        "prepara una sorpresa in segreto"
      ],
      "c35": [
        "Andiamo a pattinare?",
        "tira fuori i pattini",
        "farà il tifo per te dal bordo"
      ],
      "c36": [
        "Oggi è una bella giornata per te?",
        "una giornata splendida",
        "sarà migliore con te vicino"
      ],
      "c37": [
        "Mi fai un ritratto?",
        "prende già la matita",
        "disegnerà un cuoricino"
      ],
      "c38": [
        "Piantiamo un albero insieme?",
        "sceglie il posto",
        "comincerà con un fiore sul davanzale"
      ],
      "c39": [
        "Vuoi un complimento?",
        "non vede l’ora",
        "è timidezza, ma lo desidera tanto"
      ],
      "c40": [
        "Rigiochiamo più tardi?",
        "vuole un altro round",
        "preferisce un abbraccio al gioco"
      ]
    },
    "loves": {
      "s01": [
        "Dove andare in vacanza?",
        "Spiaggia",
        "Montagna",
        "Viaggiare",
        "Un po’ di solitudine"
      ],
      "s02": [
        "La serata perfetta?",
        "Film a casa",
        "Una passeggiata",
        "Ristorante",
        "Giochi da tavolo"
      ],
      "s03": [
        "Il tempo preferito?",
        "Sole",
        "Pioggia",
        "Neve",
        "Notte stellata"
      ],
      "s04": [
        "L’animale preferito?",
        "Gattino",
        "Cucciolo",
        "Cavallo",
        "Delfino"
      ],
      "s05": [
        "Cosa si mangia stasera?",
        "Pizza",
        "Sushi",
        "Pasticcini",
        "Grigliata"
      ],
      "s06": [
        "La bevanda preferita?",
        "Caffè",
        "Tè",
        "Cioccolata calda",
        "Limonata"
      ],
      "s07": [
        "La stagione preferita?",
        "Primavera",
        "Estate",
        "Autunno",
        "Inverno"
      ],
      "s08": [
        "I fiori preferiti?",
        "Rose",
        "Tulipani",
        "Girasoli",
        "Lavanda"
      ],
      "s09": [
        "Come rilassarsi?",
        "Con un libro",
        "Disegnando",
        "In bicicletta",
        "Pisolino in amaca"
      ],
      "s10": [
        "Come viaggiare?",
        "In treno",
        "In aereo",
        "In auto",
        "In nave"
      ],
      "s11": [
        "La casa dei sogni?",
        "Appartamento in città",
        "Casa al mare",
        "Baita in montagna",
        "Fattoria"
      ],
      "s12": [
        "Qualcosa di dolce?",
        "Gelato",
        "Cioccolato",
        "Torta",
        "Frutta"
      ],
      "s13": [
        "La mattina perfetta?",
        "Colazione a letto",
        "Corsa",
        "Dormire a lungo",
        "Caffè sul balcone"
      ],
      "s14": [
        "L’appuntamento dei sogni?",
        "Picnic",
        "Pista di pattinaggio",
        "Luna park",
        "Stelle sul tetto"
      ],
      "s15": [
        "Il regalo più bello?",
        "Un mazzo di fiori",
        "Una lettera",
        "Un viaggio",
        "Una scatola regalo"
      ],
      "s16": [
        "La natura preferita?",
        "Mare",
        "Bosco",
        "Deserto",
        "Aurora boreale"
      ]
    },
    "who": [
      "Chi di noi arriva più spesso in ritardo?",
      "Chi di noi fa pace prima?",
      "Chi di noi cucina meglio?",
      "Chi di noi ride più spesso?",
      "Chi di noi ci mette di più a prepararsi?",
      "Chi di noi perde più spesso le chiavi?",
      "Chi di noi ricorda meglio le date importanti?",
      "Chi di noi ha più voglia di dolci?",
      "Chi di noi si addormenta prima?",
      "Chi di noi si alza prima la mattina?",
      "Chi di noi dice più spesso «mi manchi»?",
      "Chi di noi sceglie regali migliori?",
      "Chi di noi scherza più spesso?",
      "Chi di noi guida meglio?",
      "Chi di noi parla più a lungo al telefono?",
      "Chi di noi ama di più viaggiare?",
      "Chi di noi se la prende più facilmente?",
      "Chi di noi perdona più in fretta?",
      "Chi di noi scatta più foto?",
      "Chi di noi gestisce meglio i soldi?",
      "Chi di noi compra più spesso cose che non servono?",
      "Chi di noi sa consolare meglio?",
      "Chi di noi mantiene più la calma nei momenti difficili?",
      "Chi di noi cerca sempre il telefono?",
      "Chi di noi ama di più avere ospiti?",
      "Chi di noi prepara più spesso la colazione?",
      "Chi di noi si orienta meglio in una città nuova?",
      "Chi di noi scrive messaggi più lunghi?",
      "Chi di noi propone prima una passeggiata?",
      "Chi di noi ama di più gli animali?",
      "Chi di noi sa mantenere meglio i segreti?",
      "Chi di noi ci mette di più a scegliere dal menù?",
      "Chi di noi si preoccupa di più per le persone care?",
      "Chi di noi fa più sorprese?",
      "Chi di noi tiene più in ordine le cose?",
      "Chi di noi nota prima un nuovo taglio di capelli?",
      "Chi di noi ricorda più spesso storie divertenti?",
      "Chi di noi è più paziente?",
      "Chi di noi dice più spesso «grazie»?",
      "Chi di noi offre aiuto prima?"
    ],
    "phrases": [
      "Sorrido quando tu…",
      "Il mio giorno preferito con te è…",
      "Grazie per…",
      "Quando sono triste, mi aiuta…",
      "Un giorno voglio che insieme…",
      "Il ricordo più tenero di noi è…",
      "La cosa che sai fare meglio è…",
      "Mi sento in pace quando…",
      "Se avessimo un’intera giornata libera, noi…",
      "Ti ammiro perché…",
      "La nostra serata perfetta è…",
      "Non dimenticherò mai come tu…",
      "Mi piace quando dici…",
      "L’anno prossimo voglio che noi…",
      "Per me sei come…",
      "Il regalo più bello da parte tua è…",
      "Mi manchi quando…",
      "Ridiamo di più quando…",
      "Da tanto voglio dirti…",
      "Il nostro posto è…",
      "Quando penso a te, io…",
      "Rendi la mia giornata migliore quando…",
      "Mi piace la nostra abitudine di…",
      "Il mio desiderio per noi: …",
      "La cosa più divertente che ci è successa è…",
      "Sento che ti prendi cura di me quando…",
      "Una mattina con te è…",
      "Se fossimo una sola parola, sarebbe…",
      "Voglio imparare da te a…",
      "Grazie perché ogni volta tu…"
    ]
  },
  "pl": {
    "text": {
      "homeLink": "Gry we dwoje",
      "eyebrow": "GLOWLETTER · GRY WE DWOJE",
      "title": "Grajcie razem",
      "close": "Zamknij",
      "lead": "Wyślij grę komuś bliskiemu. Gra z linku jest darmowa i nie wymaga konta.",
      "quizTitle": "Jak dobrze mnie znasz?",
      "quizNote": "Odpowiedz na pytania o sobie, a bliska osoba spróbuje zgadnąć. Wynik wróci do ciebie.",
      "create": "Utwórz quiz",
      "soon": "Wkrótce",
      "soonTitle": "Kolejne gry w drodze",
      "duel": "Pojedynek „Kto szybszy”",
      "loves": "Co kochamy",
      "cards": "Karty pamięci we dwoje",
      "who": "Kto z nas?",
      "phrase": "Dokończ zdanie",
      "myQuizzes": "Moje quizy",
      "noQuizzes": "Nie ma jeszcze quizów. Pierwszy utworzysz w dwie minuty.",
      "forWhom": "Dla: {name}",
      "noRecipient": "Quiz",
      "resultsCount": "Wyniki: {count}",
      "newResults": "Nowe: {count}",
      "noResults": "Nikt jeszcze nie zagrał.",
      "anonymous": "Bez imienia",
      "results": "Wyniki",
      "copyLink": "Kopiuj link",
      "share": "Wyślij",
      "deleteQuiz": "Usuń quiz",
      "deleteConfirm": "Usunąć ten quiz i jego wyniki? Link przestanie działać.",
      "deleted": "Quiz usunięty",
      "linkCopied": "Link skopiowany",
      "back": "Wstecz",
      "next": "Dalej",
      "stepNames": "Krok 1 z 2 · Imiona",
      "yourName": "Twoje imię",
      "yourNamePlaceholder": "Jak masz na imię",
      "recipient": "Dla kogo · opcjonalnie",
      "recipientPlaceholder": "Imię bliskiej osoby",
      "nameRequired": "Wpisz swoje imię.",
      "forbiddenName": "Wpisz zwykłe imię.",
      "stepAnswers": "Krok 2 z 2 · Twoje odpowiedzi",
      "answersLead": "Zaznacz, co jest o tobie prawdą. Każde pytanie można wymienić.",
      "swap": "Inne pytanie",
      "progress": "Zaznaczono {done} z {total}",
      "answerAll": "Wybierz odpowiedź w każdym pytaniu.",
      "finish": "Pobierz link",
      "creating": "Tworzę quiz…",
      "createdTitle": "Quiz gotowy!",
      "createdLead": "Wyślij link. Gdy ktoś odpowie, wynik pojawi się w „Moich quizach”.",
      "shareText": "{name} zaprasza cię do gry „Jak dobrze mnie znasz?”",
      "signInTitle": "Wymagane logowanie",
      "signInNote": "Quiz jest zapisany na twoim koncie, aby wyniki trafiły do ciebie.",
      "signIn": "Zaloguj się",
      "premiumNote": "Tworzenie gier wchodzi w skład pełnego dostępu. Gra z linku jest darmowa dla wszystkich.",
      "failed": "Nie udało się. Sprawdź połączenie i spróbuj ponownie.",
      "rateLimited": "Zbyt wiele prób. Spróbuj później.",
      "playEyebrow": "GRA WE DWOJE",
      "playInvite": "{name} zaprasza cię do gry",
      "playLead": "Pytań: {count}. Zgadnij odpowiedzi — na końcu zobaczysz, ile się zgadza.",
      "playName": "Twoje imię · opcjonalnie",
      "playNamePlaceholder": "Żeby wiedzieli, że to ty",
      "start": "Zaczynamy",
      "playLoading": "Ładuję grę…",
      "playMissing": "Ta gra jest niedostępna: link usunięto lub wygasł.",
      "playOffline": "Do gry potrzebny jest internet.",
      "retry": "Spróbuj ponownie",
      "questionOf": "Pytanie {n} z {total}",
      "asks": "{name} pyta",
      "counting": "Liczę zgodne odpowiedzi…",
      "scoreOf": "{score} z {total}",
      "tierAll": "Idealnie! Znacie się najlepiej na świecie",
      "tierHigh": "Znacie się naprawdę dobrze",
      "tierMid": "Nieźle! Jest jeszcze co odkrywać",
      "tierLow": "Przed wami wiele miłych odkryć",
      "sentTo": "{name} zobaczy twój wynik",
      "review": "Twoje odpowiedzi",
      "rightAnswer": "Właściwa odpowiedź",
      "makeOwn": "Utwórz własny quiz",
      "home": "Strona główna",
      "resultToast": "{name}: {score} z {total} w quizie „Jak dobrze mnie znasz?”",
      "ownerAnswers": "Odpowiedzi autora",
      "playerAnswers": "Odpowiedzi: {name}",
      "paywallTitle": "Gry, rozrywka<br><em>i listy</em>",
      "groupGames": "Gry",
      "groupFun": "Rozrywka",
      "groupLetters": "Listy",
      "featQuiz": "„Jak dobrze mnie znasz?” — wynik wraca do ciebie",
      "featGamesSoon": "Pojedynek „Kto szybszy”, „Co kochamy”, karty z misiami",
      "featFunSoon": "„Kto z nas?” i „Dokończ zdanie” z księgą pary",
      "featCollection": "Cała kolekcja listów i wierszy w 25 językach",
      "featMoments": "Chwile, przypomnienia i list QR, który otworzy się we właściwy dzień",
      "featAudio": "Własne audio w liście i odpowiedzi odbiorcy",
      "ynTitle": "Tak czy nie",
      "ynNote": "Gra na żywo we dwoje: 5 sekund na każdą kartę. Kto odpowie na czas, zobaczy odpowiedź drugiej osoby.",
      "ynCreate": "Utwórz pokój",
      "ynWaiting": "Czekamy, aż {name} otworzy link…",
      "ynWaitingAny": "Czekamy na drugą osobę…",
      "ynShareText": "{name} zaprasza cię do gry na żywo „Tak czy nie”",
      "ynPartnerHere": "{name} już jest!",
      "ynStart": "Zacznij grę",
      "ynWaitHost": "{name} za chwilę zacznie grę",
      "ynYes": "Tak",
      "ynNo": "Nie",
      "ynMissed": "Za późno — ta karta pozostaje zakryta",
      "ynMatch": "Zgodność!",
      "ynRound": "Karta {n} z {total}",
      "ynAnswered": "Odpowiedź wysłana, czekamy na drugą osobę…",
      "ynFinal": "Zgodnie: {score} z {total}",
      "ynFinalHigh": "Rozumiecie się bez słów",
      "ynFinalMid": "Tacy różni — i tacy bliscy",
      "ynAgain": "Zagraj jeszcze raz",
      "ynLeft": "Druga osoba się rozłączyła. Czekamy na powrót…",
      "ynYou": "Ty",
      "ynOffline": "Nie można połączyć się z grą. Sprawdź internet i otwórz link ponownie.",
      "ynJoin": "Dołącz do gry",
      "ynJoinLead": "{name} czeka na ciebie. 5 sekund na każdą odpowiedź!",
      "ynStepNames": "Twoje imię i imię drugiej osoby",
      "ynRoomReady": "Pokój gotowy — wyślij link",
      "ynStayHere": "Nie zamykaj tego ekranu: gra zacznie się, gdy link zostanie otwarty.",
      "featYesNo": "Gra na żywo „Tak czy nie” — 5 sekund na odpowiedź",
      "ynPartnerMissed": "Brak odpowiedzi — czas minął",
      "lvTitle": "Co kochamy",
      "lvNote": "Gra na żywo we dwoje: 4 obrazki i 10 sekund, by wybrać, co lubisz najbardziej. Możecie wybrać to samo!",
      "lvShareText": "{name} zaprasza cię do gry na żywo „Co kochamy”",
      "lvJoinLead": "{name} czeka na ciebie. Wybierz obrazek, który lubisz najbardziej!",
      "lvRound": "Temat {n} z {total}",
      "lvPick": "Wybierz, co lubisz najbardziej",
      "lvBoth": "Oboje wybraliście: {item}",
      "lvCommon": "Oboje kochacie",
      "lvDiff": "Różne gusta — tym ciekawiej!",
      "lvFinalHigh": "Macie tak wiele wspólnego!",
      "lvFinalMid": "Tacy różni — i świetnie się uzupełniacie",
      "featLoves": "Gra na żywo „Co kochamy” — 4 obrazki, wybierajcie razem",
      "featGamesSoon2": "Pojedynek „Kto szybszy” i karty pamięci z misiami",
      "mcTitle": "Karty pamięci z misiami",
      "mcNote": "Memory na żywo we dwoje: na zmianę odkrywajcie po dwie karty i szukajcie par. Trzy poziomy, od 8 do 16 kart.",
      "mcShareText": "{name} zaprasza cię do gry na żywo „Karty pamięci z misiami”",
      "mcJoinLead": "{name} czeka na ciebie. Szukajcie par na zmianę!",
      "mcLevel": "Poziom {n} z {total}",
      "mcTurnYou": "Twój ruch — odkryj dwie karty",
      "mcTurnThem": "Ruch: {name}",
      "mcPairs": "Znalezione pary: {found} z {total}",
      "mcLevelDone": "Wszystkie pary znalezione!",
      "mcTimeUp": "Czas poziomu minął",
      "mcNext": "Dalej: poziom {n}",
      "mcFinal": "Znalezione pary: {found} z {total}",
      "mcFinalHigh": "Świetna drużyna!",
      "mcFinalMid": "Dobra gra — jeszcze raz?",
      "featCards": "Gra na żywo „Karty pamięci z misiami” — szukajcie par razem",
      "featGamesSoon3": "Pojedynek „Kto szybszy”",
      "duTitle": "Kto szybszy",
      "duNote": "Pojedynek na żywo: jedno słowo i cztery obrazki. Dotknij właściwego obrazka szybciej — pomyłka oznacza przegraną rundę.",
      "duShareText": "{name} wyzywa cię na pojedynek na żywo „Kto szybszy”",
      "duJoinLead": "{name} czeka na ciebie. Znajdź właściwy obrazek szybciej!",
      "duRound": "Runda {n} z {total}",
      "duFind": "Znajdź: {item}",
      "duYouWon": "Masz szybszy refleks!",
      "duTheyWon": "Szybciej: {name}",
      "duWrong": "Nie ten obrazek — runda przegrana",
      "duNobody": "Nikt nie zdążył znaleźć",
      "duScore": "Ty {you} : {them} {name}",
      "duFinalWin": "Wygrana! Dziś masz bystre oko.",
      "duFinalLose": "Tym razem wygrywa {name} — rewanż?",
      "duFinalDraw": "Remis — siły wyrównane!",
      "duSeconds": "{s} s",
      "featDuel": "Pojedynek na żywo „Kto szybszy” — znajdź obrazek najszybciej",
      "whoTitle": "Kto z nas?",
      "whoNote": "Gra na żywo we dwoje: jedno pytanie — dotknij „Ja” albo imienia drugiej osoby. Sprawdźcie, czy się zgadzacie.",
      "whoShareText": "{name} zaprasza cię do gry na żywo „Kto z nas?”",
      "whoJoinLead": "{name} czeka na ciebie. Odpowiadaj szczerze — potem porównajcie!",
      "whoRound": "Pytanie {n} z {total}",
      "whoMe": "Ja",
      "whoAgree": "Zgadzacie się: {name}",
      "whoDiffer": "Różne zdania — porozmawiajcie o tym!",
      "whoFinal": "Zgodność: {score} z {total}",
      "whoFinalHigh": "Tak dobrze się znacie!",
      "whoFinalMid": "Jest o czym rozmawiać — i to jest piękne",
      "featWho": "Gra na żywo „Kto z nas?” — czy się zgadzacie?",
      "phTitle": "Dokończ zdanie",
      "phNote": "Gra na żywo we dwoje: każda osoba kończy to samo ciepłe zdanie własnymi słowami, a potem czytacie swoje odpowiedzi.",
      "phShareText": "{name} zaprasza cię do gry na żywo „Dokończ zdanie”",
      "phJoinLead": "{name} czeka na ciebie. Dokończ każde zdanie własnymi słowami!",
      "phRound": "Zdanie {n} z {total}",
      "phPlaceholder": "Twoje zakończenie…",
      "phDone": "Gotowe",
      "phWaiting": "{name} jeszcze pisze…",
      "phSkipped": "Brak odpowiedzi",
      "phSave": "Zapisz w księdze pary",
      "phSaved": "Zapisano w księdze pary",
      "phForbidden": "Napisz to bez linków i niegrzecznych słów.",
      "phNext": "Następne zdanie",
      "phFinal": "Zdania dokończone razem: {count}",
      "phFinalLead": "Zapiszcie najcieplejsze odpowiedzi w księdze pary.",
      "featPhrase": "Gra na żywo „Dokończ zdanie” z księgą pary",
      "bookTitle": "Księga pary",
      "bookNote": "Najcieplejsze odpowiedzi z „Dokończ zdanie”, zapisane na twoim koncie.",
      "bookOpen": "Otwórz księgę",
      "bookEmpty": "Księga jest na razie pusta. Zagrajcie w „Dokończ zdanie” i zapiszcie odpowiedzi, które wam się podobają.",
      "bookDelete": "Usuń",
      "bookDeleteConfirm": "Usunąć tę stronę z księgi?",
      "bookYou": "Ty",
      "inviteTitle": "Zaproś kogoś",
      "inviteNote": "Ta osoba dostanie wiadomość z grą.",
      "invite": "Zaproś",
      "invited": "Zaproszono",
      "inviteNone": "Dodaj znajomych w sekcji „Znajomi”, aby zapraszać ich jednym dotknięciem.",
      "inviteSent": "Zaproszenie wysłane: {name}"
    },
    "questions": {
      "q01": [
        "Moja ulubiona pora roku?",
        "Wiosna",
        "Lato",
        "Jesień",
        "Zima"
      ],
      "q02": [
        "Co wybiorę na śniadanie?",
        "Kawę i rogalika",
        "Owsiankę",
        "Jajka",
        "Tylko herbatę"
      ],
      "q03": [
        "Mój idealny dzień wolny?",
        "W domu pod kocem",
        "Spacer po parku",
        "Wypad za miasto",
        "Spotkanie z przyjaciółmi"
      ],
      "q04": [
        "Dokąd marzę pojechać?",
        "Nad morze",
        "W góry",
        "Do dużego miasta",
        "Do przytulnego domku na wsi"
      ],
      "q05": [
        "Moje ulubione lody?",
        "Waniliowe",
        "Czekoladowe",
        "Truskawkowe",
        "Pistacjowe"
      ],
      "q06": [
        "Co najszybciej poprawia mi humor?",
        "Przytulenie",
        "Niespodzianka",
        "Ciepłe słowa",
        "Coś pysznego"
      ],
      "q07": [
        "Jestem raczej…",
        "Rannym ptaszkiem",
        "Nocnym markiem",
        "Śpiochem, gdy tylko się da",
        "Fanem drzemek"
      ],
      "q08": [
        "Jaki film wybiorę na wieczór?",
        "Komedię",
        "Romantyczną historię",
        "Kryminał",
        "Animację"
      ],
      "q09": [
        "Mój ulubiony kolor?",
        "Czerwony",
        "Niebieski",
        "Zielony",
        "Różowy"
      ],
      "q10": [
        "Czego boję się najbardziej?",
        "Pająków",
        "Wysokości",
        "Ciemności",
        "Spóźnienia"
      ],
      "q11": [
        "Jakie kwiaty kocham?",
        "Róże",
        "Tulipany",
        "Piwonie",
        "Stokrotki"
      ],
      "q12": [
        "Co robię, gdy jest mi smutno?",
        "Dzwonię do bliskich",
        "Jem coś słodkiego",
        "Idę na spacer",
        "Kładę się spać"
      ],
      "q13": [
        "Które zwierzę jest mi najbliższe?",
        "Kotek",
        "Pies",
        "Miś",
        "Liska"
      ],
      "q14": [
        "Najlepszy prezent dla mnie?",
        "Coś zrobionego własnoręcznie",
        "Podróż",
        "Biżuteria",
        "Książka"
      ],
      "q15": [
        "Mój ulubiony napój?",
        "Czarna herbata",
        "Zielona herbata",
        "Kawa",
        "Kakao"
      ],
      "q16": [
        "Moja ulubiona przekąska?",
        "Czekolada",
        "Chipsy",
        "Owoce",
        "Ciastko"
      ],
      "q17": [
        "Co wybieram w podróży?",
        "Muzea",
        "Plażę",
        "Lokalną kuchnię",
        "Spacery bez planu"
      ],
      "q18": [
        "Jak lubię spędzać wieczór?",
        "Z książką",
        "Z serialem",
        "Na rozmowach",
        "Na spacerze"
      ],
      "q19": [
        "Jaka pogoda najbardziej mi odpowiada?",
        "Słońce",
        "Ciepły deszcz",
        "Padający śnieg",
        "Lekki wiatr"
      ],
      "q20": [
        "Jaka supermoc by do mnie pasowała?",
        "Latanie",
        "Czytanie w myślach",
        "Zatrzymywanie czasu",
        "Teleportacja"
      ],
      "q21": [
        "Co jest dla mnie najważniejsze w bliskich?",
        "Zaufanie",
        "Troska",
        "Poczucie humoru",
        "Wsparcie"
      ],
      "q22": [
        "Na jakie święto czekam najbardziej?",
        "Nowy Rok",
        "Moje urodziny",
        "Wakacje",
        "Walentynki"
      ],
      "q23": [
        "Jak najczęściej mówię „kocham”?",
        "Słowami",
        "Czynami",
        "Przytuleniem",
        "Prezentami"
      ],
      "q24": [
        "Co zamówię w kawiarni?",
        "Makaron",
        "Sushi",
        "Sałatkę",
        "Deser"
      ],
      "q25": [
        "Moja ulubiona pora dnia?",
        "Rano",
        "Popołudnie",
        "Wieczór",
        "Noc"
      ],
      "q26": [
        "Jaką kuchnię wybiorę?",
        "Włoską",
        "Japońską",
        "Domową",
        "Meksykańską"
      ],
      "q27": [
        "Gdzie najlepiej mi się myśli?",
        "Pod prysznicem",
        "Na spacerze",
        "W podróży",
        "Przed snem"
      ],
      "q28": [
        "Co robię rano w pierwszej kolejności?",
        "Patrzę w telefon",
        "Piję wodę",
        "Robię kawę",
        "Leżę jeszcze chwilę"
      ],
      "q29": [
        "Mój ulubiony owoc?",
        "Jabłko",
        "Banan",
        "Mango",
        "Arbuz"
      ],
      "q30": [
        "Które hobby jest mi najbliższe?",
        "Rysowanie",
        "Gotowanie",
        "Sport",
        "Czytanie"
      ],
      "q31": [
        "Jak chcę świętować urodziny?",
        "Głośną imprezą",
        "Kolacją we dwoje",
        "Wyjazdem",
        "Spokojnym wieczorem w domu"
      ],
      "q32": [
        "Co sądzę o niespodziankach?",
        "Uwielbiam je",
        "Trochę mnie stresują",
        "Lubię przygotowywać je innym",
        "Wolę wiedzieć wcześniej"
      ],
      "q33": [
        "Jaki słodycz lubię najbardziej?",
        "Tort",
        "Lody",
        "Ciastka",
        "Cukierki"
      ],
      "q34": [
        "Co zabiorę na bezludną wyspę?",
        "Książkę",
        "Telefon",
        "Koc",
        "Aparat"
      ],
      "q35": [
        "Jak odpoczywam po trudnym dniu?",
        "Ciepła kąpiel",
        "Serial",
        "Spacer",
        "Rozmowa z bliską osobą"
      ],
      "q36": [
        "Jaki środek transportu lubię najbardziej?",
        "Pociąg",
        "Samolot",
        "Samochód",
        "Rower"
      ],
      "q37": [
        "Moja ulubiona zabawa z dzieciństwa?",
        "Chowanego",
        "Berek",
        "Klocki",
        "Rysowanie"
      ],
      "q38": [
        "Która baśń jest mi najbliższa?",
        "Kopciuszek",
        "Mały Książę",
        "Kubuś Puchatek",
        "Alicja w Krainie Czarów"
      ],
      "q39": [
        "Czym chętniej ucieszę bliską osobę?",
        "Niespodzianką",
        "Kartką",
        "Wyjazdem",
        "Kolacją"
      ],
      "q40": [
        "Co najczęściej fotografuję?",
        "Siebie",
        "Przyrodę",
        "Jedzenie",
        "Prawie nie robię zdjęć"
      ],
      "q41": [
        "Moje ulubione miejsce w domu?",
        "Łóżko",
        "Kuchnia",
        "Kanapa",
        "Balkon"
      ],
      "q42": [
        "Co zauważam w człowieku najpierw?",
        "Uśmiech",
        "Oczy",
        "Głos",
        "Poczucie humoru"
      ],
      "q43": [
        "Co najszybciej mnie rozśmiesza?",
        "Zabawne filmiki",
        "Żarty bliskich",
        "Niezręczne sytuacje",
        "Zwierzęta"
      ],
      "q44": [
        "Co piję w upalny dzień?",
        "Lemoniadę",
        "Mrożoną herbatę",
        "Sok",
        "Wodę z lodem"
      ],
      "q45": [
        "Który żywioł jest mi najbliższy?",
        "Woda",
        "Ogień",
        "Ziemia",
        "Powietrze"
      ],
      "q46": [
        "Jakie historie kocham?",
        "Przygodowe",
        "O miłości",
        "Fantastykę",
        "Prawdziwe"
      ],
      "q47": [
        "Jak spędzam deszczowy dzień?",
        "Czytam",
        "Śpię",
        "Oglądam film",
        "Spaceruję pod parasolem"
      ],
      "q48": [
        "Co najbardziej cenię w prezencie?",
        "Pamięć",
        "Przydatność",
        "Piękno",
        "Zaskoczenie"
      ],
      "q49": [
        "Jakie ziemniaki wybiorę?",
        "Purée",
        "Frytki",
        "Pieczone",
        "Chipsy"
      ],
      "q50": [
        "Dokąd idę najpierw w nowym mieście?",
        "Do kawiarni",
        "Do muzeum",
        "Do parku",
        "Na zakupy"
      ],
      "q51": [
        "Co robię, gdy nie mogę zasnąć?",
        "Czytam",
        "Przeglądam telefon",
        "Liczę owce",
        "Piję ciepłe mleko"
      ],
      "q52": [
        "Jak przygotowuję się do ważnego dnia?",
        "Wszystko planuję wcześniej",
        "Robię wszystko na ostatnią chwilę",
        "Proszę o pomoc",
        "Denerwuję się i nie śpię"
      ],
      "q53": [
        "Jaki sport lubię oglądać najbardziej?",
        "Piłkę nożną",
        "Tenis",
        "Łyżwiarstwo figurowe",
        "Nie oglądam sportu"
      ],
      "q54": [
        "Jaki zwierzak do mnie pasuje?",
        "Kot",
        "Pies",
        "Papuga",
        "Chomik"
      ],
      "q55": [
        "Jakie wiadomości piszę?",
        "Długie",
        "Krótkie",
        "Pełne emotek",
        "Głosowe"
      ],
      "q56": [
        "Jaki prezent przechowuję najdłużej?",
        "List",
        "Zabawkę",
        "Zdjęcie",
        "Biżuterię"
      ],
      "q57": [
        "Co raczej wybiorę?",
        "Herbatę przy kominku",
        "Piknik na trawie",
        "Spacer nad morzem",
        "Wyjście do kina"
      ],
      "q58": [
        "Który komplement ucieszy mnie najbardziej?",
        "O wyglądzie",
        "O inteligencji",
        "O dobroci",
        "O poczuciu humoru"
      ],
      "q59": [
        "Mój idealny poranek?",
        "Śniadanie do łóżka",
        "Poranny bieg",
        "Długie spanie",
        "Kawa na balkonie"
      ],
      "q60": [
        "Czego chcę się nauczyć?",
        "Tańczyć",
        "Gotować",
        "Nowego języka",
        "Rysować"
      ]
    },
    "yesNo": {
      "c01": [
        "Tęsknisz za mną w tej chwili?",
        "bardzo tęskni",
        "trzyma się, ale myśli o tobie"
      ],
      "c02": [
        "Uśmiechasz się, gdy widzisz moją wiadomość?",
        "zawsze się uśmiecha",
        "uśmiecha się w duchu"
      ],
      "c03": [
        "Pamiętasz nasze pierwsze spotkanie?",
        "pamięta każdą minutę",
        "pamięta najważniejsze — ciebie"
      ],
      "c04": [
        "Chcesz się dziś przytulić?",
        "czeka na twoje przytulenie",
        "zostawia przytulasy na później"
      ],
      "c05": [
        "Pojedziemy razem nad morze?",
        "już pakuje walizkę",
        "marzy o górach"
      ],
      "c06": [
        "Rozśmieszam cię?",
        "śmieje się od serca",
        "ukrywa uśmiech"
      ],
      "c07": [
        "Czujesz się przy mnie spokojnie?",
        "przy tobie czuje spokój",
        "dobrze się z tobą bawi"
      ],
      "c08": [
        "Myślisz o mnie w ciągu dnia?",
        "myśli o tobie bardzo często",
        "myśli o tobie właśnie teraz"
      ],
      "c09": [
        "Lubisz moje niespodzianki?",
        "uwielbia twoje niespodzianki",
        "najbardziej lubi, gdy jesteś obok"
      ],
      "c10": [
        "Upieczemy razem ciasto?",
        "już zakłada fartuch",
        "woli kupić tort"
      ],
      "c11": [
        "Obejrzymy wieczorem film?",
        "już wybiera film",
        "woli po prostu pogadać"
      ],
      "c12": [
        "Lubisz mój głos?",
        "może słuchać bez końca",
        "jeszcze bardziej kocha twój śmiech"
      ],
      "c13": [
        "Zrobimy piknik w weekend?",
        "szykuje koc",
        "zaprasza do przytulnej kawiarni"
      ],
      "c14": [
        "Chcesz dostać ode mnie list?",
        "czeka na twój list",
        "chce usłyszeć wszystko osobiście"
      ],
      "c15": [
        "Jestem dla ciebie ważny/a?",
        "jesteś bardzo ważny/a",
        "ważniejszy/a, niż myślisz"
      ],
      "c16": [
        "Pospacerujemy w deszczu?",
        "bierze parasol dla dwojga",
        "zaparzy herbatę w domu"
      ],
      "c17": [
        "Jesteśmy do siebie podobni?",
        "jesteście jak dwie połówki",
        "świetnie się uzupełniacie"
      ],
      "c18": [
        "Smakuje ci, jak gotuję?",
        "prosi o dokładkę",
        "uwielbia gotować razem z tobą"
      ],
      "c19": [
        "Weźmiemy razem zwierzaka?",
        "już wybiera imię",
        "na razie wystarczy pluszowy miś"
      ],
      "c20": [
        "Wiesz, co kocham?",
        "zna na pamięć",
        "chce wiedzieć jeszcze więcej"
      ],
      "c21": [
        "Zatańczymy?",
        "już podaje ci rękę",
        "będzie klaskać"
      ],
      "c22": [
        "Inspiruję cię?",
        "inspirujesz każdego dnia",
        "przy tobie jest po prostu ciepło"
      ],
      "c23": [
        "Przechowujesz nasze zdjęcia?",
        "strzeże każdego",
        "czeka na nowe, jeszcze piękniejsze"
      ],
      "c24": [
        "Powitamy razem wschód słońca?",
        "nastawia budzik",
        "woli pożegnać zachód"
      ],
      "c25": [
        "Zdradzisz mi sekret?",
        "szepnie ci do ucha",
        "niech zostanie tajemnicą"
      ],
      "c26": [
        "Wierzysz we mnie?",
        "bardzo w ciebie wierzy",
        "dopinguje cię każdego dnia"
      ],
      "c27": [
        "Pojedziemy w podróż tylko we dwoje?",
        "marzy o tym",
        "zabierze wszystkich bliskich"
      ],
      "c28": [
        "Czekasz na mój telefon?",
        "czeka z uśmiechem",
        "woli, żebyś wpadł/a w odwiedziny"
      ],
      "c29": [
        "Lubisz moje przytulasy?",
        "najcieplejsze na świecie",
        "lubi trzymać się za ręce"
      ],
      "c30": [
        "Poczytamy sobie na głos?",
        "już wybiera książkę",
        "woli posłuchać ciebie"
      ],
      "c31": [
        "Zrobimy dziś wspólne zdjęcie?",
        "już szuka ładnego tła",
        "najpierw rozmowa"
      ],
      "c32": [
        "Poprawiam ci humor?",
        "zawsze",
        "z tobą nawet smutek jest lżejszy"
      ],
      "c33": [
        "Zjemy jutro razem śniadanie?",
        "już robi kakao",
        "marzy, by dłużej pospać"
      ],
      "c34": [
        "Pamiętasz moje urodziny?",
        "pamięta bez przypominania",
        "w tajemnicy szykuje niespodziankę"
      ],
      "c35": [
        "Pójdziemy na łyżwy?",
        "wyciąga łyżwy",
        "będzie kibicować przy bandzie"
      ],
      "c36": [
        "Czy to dla ciebie dobry dzień?",
        "świetny dzień",
        "będzie lepszy, gdy będziesz obok"
      ],
      "c37": [
        "Narysujesz mój portret?",
        "już bierze ołówek",
        "narysuje serduszko"
      ],
      "c38": [
        "Posadzimy razem drzewo?",
        "wybiera miejsce",
        "zacznie od kwiatka na parapecie"
      ],
      "c39": [
        "Chcesz usłyszeć komplement?",
        "nie może się doczekać",
        "wstydzi się, ale bardzo chce"
      ],
      "c40": [
        "Zagramy później jeszcze raz?",
        "chce jeszcze jedną rundę",
        "woli się przytulić niż grać"
      ]
    },
    "loves": {
      "s01": [
        "Gdzie spędzić urlop?",
        "Plaża",
        "Góry",
        "Podróże",
        "Chwila samotności"
      ],
      "s02": [
        "Idealny wieczór?",
        "Kino w domu",
        "Spacer",
        "Restauracja",
        "Gry planszowe"
      ],
      "s03": [
        "Ulubiona pogoda?",
        "Słońce",
        "Deszcz",
        "Śnieg",
        "Gwiaździsta noc"
      ],
      "s04": [
        "Ulubione zwierzę?",
        "Kotek",
        "Szczeniak",
        "Koń",
        "Delfin"
      ],
      "s05": [
        "Co na kolację?",
        "Pizza",
        "Sushi",
        "Ciastka",
        "Grill"
      ],
      "s06": [
        "Ulubiony napój?",
        "Kawa",
        "Herbata",
        "Kakao",
        "Lemoniada"
      ],
      "s07": [
        "Ulubiona pora roku?",
        "Wiosna",
        "Lato",
        "Jesień",
        "Zima"
      ],
      "s08": [
        "Ulubione kwiaty?",
        "Róże",
        "Tulipany",
        "Słoneczniki",
        "Lawenda"
      ],
      "s09": [
        "Jak odpocząć?",
        "Z książką",
        "Rysując",
        "Na rowerze",
        "Drzemka w hamaku"
      ],
      "s10": [
        "Jak podróżować?",
        "Pociągiem",
        "Samolotem",
        "Samochodem",
        "Statkiem"
      ],
      "s11": [
        "Wymarzony dom?",
        "Mieszkanie w mieście",
        "Dom nad morzem",
        "Domek w górach",
        "Farma"
      ],
      "s12": [
        "Coś słodkiego?",
        "Lody",
        "Czekolada",
        "Tort",
        "Owoce"
      ],
      "s13": [
        "Idealny poranek?",
        "Śniadanie do łóżka",
        "Bieganie",
        "Długi sen",
        "Kawa na balkonie"
      ],
      "s14": [
        "Wymarzona randka?",
        "Piknik",
        "Lodowisko",
        "Wesołe miasteczko",
        "Gwiazdy na dachu"
      ],
      "s15": [
        "Najlepszy prezent?",
        "Bukiet kwiatów",
        "List",
        "Podróż",
        "Pudełko z prezentem"
      ],
      "s16": [
        "Ulubiona przyroda?",
        "Morze",
        "Las",
        "Pustynia",
        "Zorza polarna"
      ]
    },
    "who": [
      "Kto z nas częściej się spóźnia?",
      "Kto z nas szybciej godzi się po kłótni?",
      "Kto z nas lepiej gotuje?",
      "Kto z nas częściej się śmieje?",
      "Kto z nas dłużej się szykuje?",
      "Kto z nas częściej gubi klucze?",
      "Kto z nas lepiej pamięta ważne daty?",
      "Kto z nas bardziej lubi słodycze?",
      "Kto z nas szybciej zasypia?",
      "Kto z nas wcześniej wstaje?",
      "Kto z nas częściej mówi „tęsknię”?",
      "Kto z nas wybiera lepsze prezenty?",
      "Kto z nas częściej żartuje?",
      "Kto z nas lepiej prowadzi samochód?",
      "Kto z nas dłużej rozmawia przez telefon?",
      "Kto z nas bardziej lubi podróżować?",
      "Kto z nas łatwiej się obraża?",
      "Kto z nas szybciej wybacza?",
      "Kto z nas robi więcej zdjęć?",
      "Kto z nas lepiej radzi sobie z pieniędzmi?",
      "Kto z nas częściej kupuje niepotrzebne rzeczy?",
      "Kto z nas lepiej pociesza?",
      "Kto z nas zachowuje więcej spokoju w trudnych chwilach?",
      "Kto z nas wiecznie szuka telefonu?",
      "Kto z nas bardziej lubi przyjmować gości?",
      "Kto z nas częściej robi śniadanie?",
      "Kto z nas lepiej odnajduje drogę w nowym mieście?",
      "Kto z nas pisze dłuższe wiadomości?",
      "Kto z nas szybciej proponuje spacer?",
      "Kto z nas bardziej kocha zwierzęta?",
      "Kto z nas lepiej dochowuje tajemnic?",
      "Kto z nas dłużej wybiera danie z menu?",
      "Kto z nas bardziej martwi się o bliskich?",
      "Kto z nas częściej robi niespodzianki?",
      "Kto z nas lepiej dba o porządek?",
      "Kto z nas szybciej zauważa nową fryzurę?",
      "Kto z nas częściej wspomina zabawne historie?",
      "Kto z nas ma więcej cierpliwości?",
      "Kto z nas częściej mówi „dziękuję”?",
      "Kto z nas szybciej oferuje pomoc?"
    ],
    "phrases": [
      "Uśmiecham się, kiedy ty…",
      "Mój ulubiony dzień z tobą to…",
      "Dziękuję ci za…",
      "Kiedy jest mi smutno, pomaga mi…",
      "Chcę, żebyśmy kiedyś razem…",
      "Najcieplejsze wspomnienie o nas to…",
      "Najlepiej na świecie umiesz…",
      "Czuję spokój, kiedy…",
      "Gdyby był przed nami cały wolny dzień, …",
      "Czuję dumę z ciebie, bo…",
      "Nasz idealny wieczór to…",
      "Nigdy nie zapomnę, jak ty…",
      "Lubię, kiedy mówisz…",
      "W przyszłym roku chcę, żebyśmy…",
      "Dla mnie jesteś jak…",
      "Najlepszy prezent od ciebie to…",
      "Tęsknię za tobą, kiedy…",
      "Najzabawniej jest z nami, kiedy…",
      "Od dawna chcę ci powiedzieć…",
      "Nasze miejsce to…",
      "Kiedy myślę o tobie, …",
      "Mój dzień jest lepszy, kiedy ty…",
      "Lubię nasz zwyczaj…",
      "Moje życzenie dla nas: …",
      "Najzabawniejsze, co nas spotkało, to…",
      "Czuję twoją troskę, kiedy…",
      "Poranek z tobą to…",
      "Jednym słowem my to…",
      "Chcę nauczyć się od ciebie…",
      "Dziękuję, że zawsze…"
    ]
  },
  "uk": {
    "text": {
      "homeLink": "Ігри для двох",
      "eyebrow": "GLOWLETTER · ІГРИ ДЛЯ ДВОХ",
      "title": "Грайте разом",
      "close": "Закрити",
      "lead": "Надішліть гру тому, хто вам дорогий. Грати за посиланням можна безкоштовно і без входу.",
      "quizTitle": "Наскільки добре ти мене знаєш?",
      "quizNote": "Дайте відповіді на запитання про себе, а близька людина спробує вгадати. Результат прийде вам.",
      "create": "Створити тест",
      "soon": "Незабаром",
      "soonTitle": "Готуємо наступні ігри",
      "duel": "Дуель «Хто швидше»",
      "loves": "Що ми любимо",
      "cards": "Картки для половинки",
      "who": "Хто з нас?",
      "phrase": "Закінчи фразу",
      "myQuizzes": "Мої тести",
      "noQuizzes": "Тестів поки немає. Створіть перший — це кілька хвилин.",
      "forWhom": "Для: {name}",
      "noRecipient": "Тест",
      "resultsCount": "Результатів: {count}",
      "newResults": "Нове: {count}",
      "noResults": "Поки ніхто не пройшов тест.",
      "anonymous": "Без імені",
      "results": "Результати",
      "copyLink": "Скопіювати посилання",
      "share": "Надіслати",
      "deleteQuiz": "Видалити тест",
      "deleteConfirm": "Видалити тест і його результати? Посилання перестане працювати.",
      "deleted": "Тест видалено",
      "linkCopied": "Посилання скопійовано",
      "back": "Назад",
      "next": "Далі",
      "stepNames": "Крок 1 з 2 · Імена",
      "yourName": "Ваше ім’я",
      "yourNamePlaceholder": "Як вас звати",
      "recipient": "Для кого · необов’язково",
      "recipientPlaceholder": "Ім’я близької людини",
      "nameRequired": "Введіть своє ім’я.",
      "forbiddenName": "Введіть звичайне ім’я.",
      "stepAnswers": "Крок 2 з 2 · Ваші відповіді",
      "answersLead": "Позначте, що про вас правда. Будь-яке запитання можна замінити.",
      "swap": "Інше запитання",
      "progress": "Позначено {done} з {total}",
      "answerAll": "Позначте відповідь у кожному запитанні.",
      "finish": "Отримати посилання",
      "creating": "Створюю тест…",
      "createdTitle": "Тест готовий!",
      "createdLead": "Надішліть посилання. Коли людина відповість, результат з’явиться в «Моїх тестах».",
      "shareText": "{name} запрошує тебе в гру «Наскільки добре ти мене знаєш?»",
      "signInTitle": "Потрібен вхід в акаунт",
      "signInNote": "Тест зберігається у вашому акаунті, щоб результати прийшли саме вам.",
      "signIn": "Увійти",
      "premiumNote": "Створювати ігри можна з повним доступом. Грати за посиланням — безкоштовно для всіх.",
      "failed": "Не вдалося. Перевірте зв’язок і спробуйте ще раз.",
      "rateLimited": "Забагато спроб. Спробуйте пізніше.",
      "playEyebrow": "ГРА ДЛЯ ДВОХ",
      "playInvite": "{name} запрошує вас у гру",
      "playLead": "Запитань: {count}. Вгадайте відповіді — наприкінці побачите, скільки збіглося.",
      "playName": "Ваше ім’я · необов’язково",
      "playNamePlaceholder": "Щоб вас упізнали",
      "start": "Почати",
      "playLoading": "Завантажую гру…",
      "playMissing": "Гра недоступна: посилання видалили або його строк закінчився.",
      "playOffline": "Для гри потрібен інтернет.",
      "retry": "Повторити",
      "questionOf": "Запитання {n} з {total}",
      "asks": "{name} запитує",
      "counting": "Рахую збіги…",
      "scoreOf": "{score} з {total}",
      "tierAll": "Ідеально! Ви знаєте одне одного найкраще",
      "tierHigh": "Ви дуже добре знаєте одне одного",
      "tierMid": "Непогано! Є що дізнатися одне про одного",
      "tierLow": "Попереду багато приємних відкриттів",
      "sentTo": "{name} побачить ваш результат",
      "review": "Ваші відповіді",
      "rightAnswer": "Правильна відповідь",
      "makeOwn": "Створити свій тест",
      "home": "На головну",
      "resultToast": "{name}: {score} з {total} у тесті «Наскільки добре ти мене знаєш?»",
      "ownerAnswers": "Відповіді автора",
      "playerAnswers": "Відповіді: {name}",
      "paywallTitle": "Ігри, розваги<br><em>і листи</em>",
      "groupGames": "Ігри",
      "groupFun": "Розваги",
      "groupLetters": "Листи",
      "featQuiz": "«Наскільки добре ти мене знаєш?» — результат приходить вам",
      "featGamesSoon": "Дуель «Хто швидше», «Що ми любимо», картки з ведмедиками",
      "featFunSoon": "«Хто з нас?» і «Закінчи фразу» з «Книгою пари»",
      "featCollection": "Уся колекція листів і віршів 25 мовами",
      "featMoments": "Моменти, нагадування і QR-лист, що відкриється в потрібний день",
      "featAudio": "Своє аудіо в листі та відповідь отримувача",
      "ynTitle": "Так чи ні",
      "ynNote": "Жива гра для двох: 5 секунд на кожну картку. Хто встигне відповісти — побачить відповідь партнера.",
      "ynCreate": "Створити кімнату",
      "ynWaiting": "Чекаємо, коли {name} відкриє посилання…",
      "ynWaitingAny": "Чекаємо партнера…",
      "ynShareText": "{name} кличе тебе в живу гру «Так чи ні»",
      "ynPartnerHere": "{name} уже в грі!",
      "ynStart": "Почати гру",
      "ynWaitHost": "{name} зараз почне гру",
      "ynYes": "Так",
      "ynNo": "Ні",
      "ynMissed": "Не встигли — картка закрита",
      "ynMatch": "Збіглися!",
      "ynRound": "Картка {n} з {total}",
      "ynAnswered": "Відповідь прийнято, чекаємо партнера…",
      "ynFinal": "Збіглося {score} з {total}",
      "ynFinalHigh": "Ви відчуваєте одне одного з півслова",
      "ynFinalMid": "Такі різні — і такі близькі",
      "ynAgain": "Зіграти ще раз",
      "ynLeft": "Партнер від’єднався. Чекаємо повернення…",
      "ynYou": "Ви",
      "ynOffline": "Не вдається під’єднатися до гри. Перевірте інтернет і відкрийте посилання знову.",
      "ynJoin": "Увійти в гру",
      "ynJoinLead": "{name} чекає на вас. На кожну відповідь — 5 секунд!",
      "ynStepNames": "Ваше ім’я та ім’я партнера",
      "ynRoomReady": "Кімната готова — надішліть посилання",
      "ynStayHere": "Не закривайте цей екран: гра почнеться, коли партнер відкриє посилання.",
      "featYesNo": "Жива гра «Так чи ні» — 5 секунд на відповідь",
      "ynPartnerMissed": "Відповіді немає — час вийшов",
      "lvTitle": "Що ми любимо",
      "lvNote": "Жива гра для двох: 4 картинки, 10 секунд, щоб обрати, що ближче. Можна обрати те саме!",
      "lvShareText": "{name} кличе тебе в живу гру «Що ми любимо»",
      "lvJoinLead": "{name} чекає на вас. Обирайте картинку, яка вам ближча!",
      "lvRound": "Тема {n} з {total}",
      "lvPick": "Оберіть, що вам ближче",
      "lvBoth": "Ви обоє обрали: {item}",
      "lvCommon": "Ви обоє любите",
      "lvDiff": "Різні смаки — тим цікавіше!",
      "lvFinalHigh": "У вас так багато спільного!",
      "lvFinalMid": "Ви такі різні — і цим доповнюєте одне одного",
      "featLoves": "Жива гра «Що ми любимо» — 4 картинки, обирайте разом",
      "featGamesSoon2": "Дуель «Хто швидше» і картки з ведмедиками",
      "mcTitle": "Картки з ведмедиками",
      "mcNote": "Жива гра на пам’ять для двох: по черзі відкривайте по дві картки й шукайте пари. Три рівні — від 8 до 16 карток.",
      "mcShareText": "{name} кличе тебе в живу гру «Картки з ведмедиками»",
      "mcJoinLead": "{name} чекає на вас. Шукайте пари по черзі!",
      "mcLevel": "Рівень {n} з {total}",
      "mcTurnYou": "Ваш хід — відкрийте дві картки",
      "mcTurnThem": "Ходить {name}",
      "mcPairs": "Знайдено пар: {found} з {total}",
      "mcLevelDone": "Усі пари знайдено!",
      "mcTimeUp": "Час рівня вийшов",
      "mcNext": "Далі — рівень {n}",
      "mcFinal": "Знайдено пар: {found} з {total}",
      "mcFinalHigh": "Чудова команда!",
      "mcFinalMid": "Гарна гра — зіграймо ще!",
      "featCards": "Жива гра «Картки з ведмедиками» — шукайте пари разом",
      "featGamesSoon3": "Дуель «Хто швидше»",
      "duTitle": "Хто швидше",
      "duNote": "Жива дуель: одне слово й чотири картинки. Першими торкніться потрібної — помилка коштує раунду.",
      "duShareText": "{name} викликає тебе на живу дуель «Хто швидше»",
      "duJoinLead": "{name} чекає на вас. Знайдіть потрібну картинку швидше!",
      "duRound": "Раунд {n} з {total}",
      "duFind": "Знайдіть: {item}",
      "duYouWon": "Ви були швидші!",
      "duTheyWon": "Швидше: {name}",
      "duWrong": "Не та картинка — раунд програно",
      "duNobody": "Ніхто не встиг",
      "duScore": "Ви {you} : {them} {name}",
      "duFinalWin": "Перемога! Сьогодні у вас пильне око.",
      "duFinalLose": "Цього разу перемога за {name} — реванш?",
      "duFinalDraw": "Нічия — ви на рівних!",
      "duSeconds": "{s} с",
      "featDuel": "Жива дуель «Хто швидше» — знайдіть картинку першими",
      "whoTitle": "Хто з нас?",
      "whoNote": "Жива гра вдвох: одне запитання — торкніться «Я» або імені іншої людини. Дізнайтеся, чи збігаються ваші думки.",
      "whoShareText": "{name} кличе тебе в живу гру «Хто з нас?»",
      "whoJoinLead": "{name} чекає на вас. Відповідайте чесно — потім порівняйте!",
      "whoRound": "Запитання {n} з {total}",
      "whoMe": "Я",
      "whoAgree": "Ви згодні: {name}",
      "whoDiffer": "Думки розійшлися — обговоріть!",
      "whoFinal": "Збіглося {score} з {total}",
      "whoFinalHigh": "Ви так добре бачите одне одного!",
      "whoFinalMid": "Є про що поговорити — і це чудово",
      "featWho": "Жива гра «Хто з нас?» — чи збігаються думки",
      "phTitle": "Закінчи фразу",
      "phNote": "Жива гра вдвох: ви закінчуєте одну теплу фразу своїми словами, а потім читаєте відповіді одне одного.",
      "phShareText": "{name} кличе тебе в живу гру «Закінчи фразу»",
      "phJoinLead": "{name} чекає на вас. Закінчуйте фрази своїми словами!",
      "phRound": "Фраза {n} з {total}",
      "phPlaceholder": "Ваше продовження…",
      "phDone": "Готово",
      "phWaiting": "Чекаємо, що напише {name}…",
      "phSkipped": "Без відповіді",
      "phSave": "Зберегти в «Книгу пари»",
      "phSaved": "Збережено в «Книзі пари»",
      "phForbidden": "Напишіть без посилань і грубих слів.",
      "phNext": "Наступна фраза",
      "phFinal": "Фраз закінчено разом: {count}",
      "phFinalLead": "Збережіть найтепліші відповіді в «Книгу пари».",
      "featPhrase": "Жива гра «Закінчи фразу» з «Книгою пари»",
      "bookTitle": "Книга пари",
      "bookNote": "Найтепліші відповіді із «Закінчи фразу» — зберігаються у вашому акаунті.",
      "bookOpen": "Відкрити книгу",
      "bookEmpty": "Поки що книга порожня. Зіграйте в «Закінчи фразу» і збережіть відповіді, які сподобалися.",
      "bookDelete": "Видалити",
      "bookDeleteConfirm": "Видалити цю сторінку з книги?",
      "bookYou": "Ви",
      "inviteTitle": "Запросити в гру",
      "inviteNote": "Людина отримає повідомлення з грою.",
      "invite": "Запросити",
      "invited": "Запрошено",
      "inviteNone": "Додайте друзів у розділі «Друзі» — і запрошуйте їх у гру одним дотиком.",
      "inviteSent": "Запрошення надіслано: {name}"
    },
    "questions": {
      "q01": [
        "Моя улюблена пора року?",
        "Весна",
        "Літо",
        "Осінь",
        "Зима"
      ],
      "q02": [
        "Що я оберу на сніданок?",
        "Каву з круасаном",
        "Кашу",
        "Яєчню",
        "Тільки чай"
      ],
      "q03": [
        "Мій ідеальний вихідний?",
        "Удома під пледом",
        "Прогулянка парком",
        "Поїздка за місто",
        "Зустріч із друзями"
      ],
      "q04": [
        "Куди я мрію поїхати?",
        "До моря",
        "У гори",
        "У велике місто",
        "У затишний будиночок у селі"
      ],
      "q05": [
        "Моє улюблене морозиво?",
        "Ванільне",
        "Шоколадне",
        "Полуничне",
        "Фісташкове"
      ],
      "q06": [
        "Що порадує мене найшвидше?",
        "Обійми",
        "Сюрприз",
        "Теплі слова",
        "Щось смачне"
      ],
      "q07": [
        "Я радше…",
        "Жайворонок",
        "Сова",
        "Сплю, коли виходить",
        "Люблю денний сон"
      ],
      "q08": [
        "Який фільм я оберу на вечір?",
        "Комедію",
        "Романтичну історію",
        "Детектив",
        "Мультфільм"
      ],
      "q09": [
        "Мій улюблений колір?",
        "Червоний",
        "Синій",
        "Зелений",
        "Рожевий"
      ],
      "q10": [
        "Чого я боюся найбільше?",
        "Павуків",
        "Висоти",
        "Темряви",
        "Запізнитися"
      ],
      "q11": [
        "Які квіти я люблю?",
        "Троянди",
        "Тюльпани",
        "Півонії",
        "Ромашки"
      ],
      "q12": [
        "Що я роблю, коли сумно?",
        "Телефоную близьким",
        "Їм солодке",
        "Іду гуляти",
        "Лягаю спати"
      ],
      "q13": [
        "Яка тварина мені найближча?",
        "Котик",
        "Собака",
        "Ведмежа",
        "Лисичка"
      ],
      "q14": [
        "Найкращий подарунок для мене?",
        "Зроблений власноруч",
        "Подорож",
        "Прикраса",
        "Книжка"
      ],
      "q15": [
        "Мій улюблений напій?",
        "Чорний чай",
        "Зелений чай",
        "Кава",
        "Какао"
      ],
      "q16": [
        "Мій улюблений перекус?",
        "Шоколад",
        "Чипси",
        "Фрукти",
        "Тістечко"
      ],
      "q17": [
        "Що я оберу в подорожі?",
        "Музеї",
        "Пляж",
        "Місцеву кухню",
        "Прогулянки без плану"
      ],
      "q18": [
        "Як я люблю проводити вечір?",
        "З книжкою",
        "Із серіалом",
        "За розмовами",
        "На прогулянці"
      ],
      "q19": [
        "Яка погода мені до душі?",
        "Сонце",
        "Теплий дощ",
        "Снігопад",
        "Легкий вітер"
      ],
      "q20": [
        "Яка суперсила мені пасувала б?",
        "Літати",
        "Читати думки",
        "Зупиняти час",
        "Миттєво переміщатися"
      ],
      "q21": [
        "Що для мене найважливіше в близьких людях?",
        "Довіра",
        "Турбота",
        "Почуття гумору",
        "Підтримка"
      ],
      "q22": [
        "Яке свято я чекаю найбільше?",
        "Новий рік",
        "День народження",
        "Літню відпустку",
        "День закоханих"
      ],
      "q23": [
        "Як я найчастіше кажу «люблю»?",
        "Словами",
        "Ділами",
        "Обіймами",
        "Подарунками"
      ],
      "q24": [
        "Що я замовлю в кафе?",
        "Пасту",
        "Суші",
        "Салат",
        "Десерт"
      ],
      "q25": [
        "Мій улюблений час доби?",
        "Ранок",
        "День",
        "Вечір",
        "Ніч"
      ],
      "q26": [
        "Яку кухню я оберу?",
        "Італійську",
        "Японську",
        "Домашню",
        "Мексиканську"
      ],
      "q27": [
        "Де мені найкраще думається?",
        "У душі",
        "На прогулянці",
        "У дорозі",
        "Перед сном"
      ],
      "q28": [
        "Що я роблю зранку насамперед?",
        "Дивлюся в телефон",
        "П’ю воду",
        "Варю каву",
        "Ще трохи лежу"
      ],
      "q29": [
        "Мій улюблений фрукт?",
        "Яблуко",
        "Банан",
        "Манго",
        "Кавун"
      ],
      "q30": [
        "Яке хобі мені найближче?",
        "Малювання",
        "Кулінарія",
        "Спорт",
        "Читання"
      ],
      "q31": [
        "Як я хочу відсвяткувати день народження?",
        "Гучною вечіркою",
        "Вечерею удвох",
        "Подорожжю",
        "Тихим вечором удома"
      ],
      "q32": [
        "Як я ставлюся до сюрпризів?",
        "Дуже люблю",
        "Трохи хвилююся",
        "Люблю влаштовувати їх іншим",
        "Волію знати заздалегідь"
      ],
      "q33": [
        "Які солодощі мені найближчі?",
        "Торт",
        "Морозиво",
        "Печиво",
        "Цукерки"
      ],
      "q34": [
        "Що я візьму на безлюдний острів?",
        "Книжку",
        "Телефон",
        "Плед",
        "Фотоапарат"
      ],
      "q35": [
        "Як я відпочиваю після важкого дня?",
        "Тепла ванна",
        "Серіал",
        "Прогулянка",
        "Розмова з близькою людиною"
      ],
      "q36": [
        "Який транспорт мені подобається найбільше?",
        "Потяг",
        "Літак",
        "Машина",
        "Велосипед"
      ],
      "q37": [
        "Моя улюблена гра в дитинстві?",
        "Хованки",
        "Квач",
        "Конструктор",
        "Малювання"
      ],
      "q38": [
        "Яка казка мені найближча?",
        "Попелюшка",
        "Маленький принц",
        "Вінні-Пух",
        "Аліса в Країні чудес"
      ],
      "q39": [
        "Чим я радше потішу близьку людину?",
        "Сюрпризом",
        "Листівкою",
        "Подорожжю",
        "Вечерею"
      ],
      "q40": [
        "Що я фотографую найчастіше?",
        "Себе",
        "Природу",
        "Їжу",
        "Майже не фотографую"
      ],
      "q41": [
        "Моє улюблене місце вдома?",
        "Ліжко",
        "Кухня",
        "Диван",
        "Балкон"
      ],
      "q42": [
        "Що я помічаю в людині насамперед?",
        "Усмішку",
        "Очі",
        "Голос",
        "Почуття гумору"
      ],
      "q43": [
        "Що найшвидше мене розсмішить?",
        "Смішні відео",
        "Жарти близьких",
        "Незручні ситуації",
        "Тварини"
      ],
      "q44": [
        "Що я п’ю в спеку?",
        "Лимонад",
        "Холодний чай",
        "Сік",
        "Воду з льодом"
      ],
      "q45": [
        "Яка стихія мені найближча?",
        "Вода",
        "Вогонь",
        "Земля",
        "Повітря"
      ],
      "q46": [
        "Які історії я люблю?",
        "Пригоди",
        "Про кохання",
        "Фантастику",
        "З життя"
      ],
      "q47": [
        "Як я проводжу дощовий день?",
        "Читаю",
        "Сплю",
        "Дивлюся фільм",
        "Гуляю під парасолькою"
      ],
      "q48": [
        "Що я ціную в подарунку найбільше?",
        "Увагу",
        "Користь",
        "Красу",
        "Несподіванку"
      ],
      "q49": [
        "Яку картоплю я оберу?",
        "Пюре",
        "Картоплю фрі",
        "Запечену",
        "Чипси"
      ],
      "q50": [
        "Куди я піду насамперед у новому місті?",
        "У кафе",
        "У музей",
        "У парк",
        "По магазинах"
      ],
      "q51": [
        "Що я роблю, коли не спиться?",
        "Читаю",
        "Гортаю телефон",
        "Рахую овечок",
        "П’ю тепле молоко"
      ],
      "q52": [
        "Як я готуюся до важливого дня?",
        "Усе планую заздалегідь",
        "Роблю в останню мить",
        "Прошу допомоги",
        "Хвилююся і не сплю"
      ],
      "q53": [
        "Який спорт мені найцікавіше дивитися?",
        "Футбол",
        "Теніс",
        "Фігурне катання",
        "Не дивлюся спорт"
      ],
      "q54": [
        "Який улюбленець мені до душі?",
        "Кішка",
        "Собака",
        "Папуга",
        "Хом’ячок"
      ],
      "q55": [
        "Які повідомлення я пишу?",
        "Довгі",
        "Короткі",
        "З купою смайликів",
        "Голосові"
      ],
      "q56": [
        "Який подарунок я зберігаю найдовше?",
        "Лист",
        "Іграшку",
        "Фотографію",
        "Прикрасу"
      ],
      "q57": [
        "Що я радше оберу?",
        "Чай біля каміна",
        "Пікнік на траві",
        "Прогулянку біля моря",
        "Похід у кіно"
      ],
      "q58": [
        "Який комплімент порадує мене найбільше?",
        "Про зовнішність",
        "Про розум",
        "Про доброту",
        "Про почуття гумору"
      ],
      "q59": [
        "Мій ідеальний ранок?",
        "Сніданок у ліжко",
        "Рання пробіжка",
        "Довгий сон",
        "Кава на балконі"
      ],
      "q60": [
        "Чого я хочу навчитися?",
        "Танцювати",
        "Готувати",
        "Нової мови",
        "Малювати"
      ]
    },
    "yesNo": {
      "c01": [
        "Сумуєш за мною просто зараз?",
        "дуже сумує",
        "тримається, але думає про тебе"
      ],
      "c02": [
        "Усміхаєшся, коли бачиш моє повідомлення?",
        "завжди усміхається",
        "усміхається подумки"
      ],
      "c03": [
        "Пам’ятаєш нашу першу зустріч?",
        "пам’ятає кожну хвилину",
        "пам’ятає головне — тебе"
      ],
      "c04": [
        "Хочеш сьогодні обійматися?",
        "чекає твоїх обіймів",
        "береже обійми на потім"
      ],
      "c05": [
        "Поїдемо разом до моря?",
        "уже пакує валізу",
        "мріє про гори"
      ],
      "c06": [
        "Я тебе смішу?",
        "сміється від душі",
        "ховає усмішку"
      ],
      "c07": [
        "Тобі зі мною спокійно?",
        "поруч із тобою спокійно",
        "з тобою весело й цікаво"
      ],
      "c08": [
        "Згадуєш мене вдень?",
        "згадує дуже часто",
        "згадує просто зараз"
      ],
      "c09": [
        "Любиш мої сюрпризи?",
        "дуже любить твої сюрпризи",
        "любить, коли ти просто поруч"
      ],
      "c10": [
        "Спечемо разом пиріг?",
        "уже вдягає фартух",
        "краще купить торт"
      ],
      "c11": [
        "Подивимося ввечері фільм удвох?",
        "уже обирає фільм",
        "хоче просто поговорити"
      ],
      "c12": [
        "Подобається мій голос?",
        "може слухати безкінечно",
        "ще більше любить твій сміх"
      ],
      "c13": [
        "Влаштуємо пікнік на вихідних?",
        "готує плед",
        "кличе в затишне кафе"
      ],
      "c14": [
        "Хочеш отримати від мене лист?",
        "чекає на твій лист",
        "хоче почути все наживо"
      ],
      "c15": [
        "Я для тебе багато значу?",
        "ти значиш дуже багато",
        "більше, ніж ти думаєш"
      ],
      "c16": [
        "Погуляємо під дощем?",
        "бере парасольку на двох",
        "заварить чай удома"
      ],
      "c17": [
        "Ми з тобою схожі?",
        "ви як дві половинки",
        "ви чудово доповнюєте одне одного"
      ],
      "c18": [
        "Подобається, як я готую?",
        "просить добавки",
        "любить готувати разом із тобою"
      ],
      "c19": [
        "Заведемо спільного улюбленця?",
        "уже обирає ім’я",
        "поки вистачає плюшевого ведмедика"
      ],
      "c20": [
        "Знаєш, що я люблю?",
        "знає напам’ять",
        "хоче дізнатися ще більше"
      ],
      "c21": [
        "Потанцюємо?",
        "уже простягає руку",
        "плескатиме в долоні"
      ],
      "c22": [
        "Я тебе надихаю?",
        "надихаєш щодня",
        "поруч із тобою просто тепло"
      ],
      "c23": [
        "Зберігаєш наші фото?",
        "береже кожне",
        "чекає нових, ще кращих"
      ],
      "c24": [
        "Зустрінемо світанок разом?",
        "ставить будильник",
        "краще проведемо захід сонця"
      ],
      "c25": [
        "Розкажеш мені секрет?",
        "прошепоче на вушко",
        "нехай лишиться загадкою"
      ],
      "c26": [
        "Віриш у мене?",
        "дуже вірить у тебе",
        "підтримує тебе щодня"
      ],
      "c27": [
        "Вирушимо в подорож удвох?",
        "мріє про це",
        "візьме з собою всіх близьких"
      ],
      "c28": [
        "Чекаєш на мій дзвінок?",
        "чекає з усмішкою",
        "краще приходь у гості"
      ],
      "c29": [
        "Подобаються мої обійми?",
        "найтепліші у світі",
        "любить триматися за руки"
      ],
      "c30": [
        "Почитаємо вголос одне одному?",
        "уже обирає книжку",
        "краще послухає тебе"
      ],
      "c31": [
        "Зробимо спільне фото сьогодні?",
        "уже шукає гарне тло",
        "спершу — розмови"
      ],
      "c32": [
        "Я покращую тобі настрій?",
        "завжди покращуєш",
        "з тобою навіть сумувати легше"
      ],
      "c33": [
        "Поснідаємо завтра разом?",
        "уже варить какао",
        "мріє довше поспати"
      ],
      "c34": [
        "Пам’ятаєш мій день народження?",
        "пам’ятає без нагадувань",
        "таємно готує сюрприз"
      ],
      "c35": [
        "Підемо на ковзанку?",
        "дістає ковзани",
        "вболіватиме за тебе біля бортика"
      ],
      "c36": [
        "Тобі сьогодні добре?",
        "день чудовий",
        "стане кращим, коли ти поруч"
      ],
      "c37": [
        "Намалюєш мій портрет?",
        "уже бере олівець",
        "намалює сердечко"
      ],
      "c38": [
        "Посадимо разом дерево?",
        "обирає місце",
        "почне з квітки на підвіконні"
      ],
      "c39": [
        "Хочеш почути комплімент?",
        "чекає з нетерпінням",
        "соромиться, але дуже хоче"
      ],
      "c40": [
        "Зіграємо ще раз потім?",
        "хоче ще раунд",
        "хоче обійняти замість гри"
      ]
    },
    "loves": {
      "s01": [
        "Де провести відпустку?",
        "Пляж",
        "Гори",
        "Подорож",
        "Усамітнення"
      ],
      "s02": [
        "Ідеальний вечір?",
        "Кіно вдома",
        "Прогулянка",
        "Ресторан",
        "Настільні ігри"
      ],
      "s03": [
        "Улюблена погода?",
        "Сонце",
        "Дощ",
        "Сніг",
        "Зоряна ніч"
      ],
      "s04": [
        "Улюблена тварина?",
        "Кошеня",
        "Цуценя",
        "Кінь",
        "Дельфін"
      ],
      "s05": [
        "Що на вечерю?",
        "Піца",
        "Суші",
        "Тістечка",
        "Барбекю"
      ],
      "s06": [
        "Улюблений напій?",
        "Кава",
        "Чай",
        "Какао",
        "Лимонад"
      ],
      "s07": [
        "Улюблена пора року?",
        "Весна",
        "Літо",
        "Осінь",
        "Зима"
      ],
      "s08": [
        "Улюблені квіти?",
        "Троянди",
        "Тюльпани",
        "Соняшники",
        "Лаванда"
      ],
      "s09": [
        "Як відпочивати?",
        "З книжкою",
        "Малювати",
        "На велосипеді",
        "Спати в гамаку"
      ],
      "s10": [
        "Як подорожувати?",
        "Потягом",
        "Літаком",
        "Машиною",
        "Кораблем"
      ],
      "s11": [
        "Дім мрії?",
        "Квартира в місті",
        "Будинок біля моря",
        "Будиночок у горах",
        "Ферма"
      ],
      "s12": [
        "Щось солодке?",
        "Морозиво",
        "Шоколад",
        "Торт",
        "Фрукти"
      ],
      "s13": [
        "Ідеальний ранок?",
        "Сніданок у ліжко",
        "Пробіжка",
        "Довгий сон",
        "Кава на балконі"
      ],
      "s14": [
        "Побачення мрії?",
        "Пікнік",
        "Ковзанка",
        "Парк атракціонів",
        "Зорі на даху"
      ],
      "s15": [
        "Найкращий подарунок?",
        "Букет квітів",
        "Лист",
        "Подорож",
        "Подарунок у коробці"
      ],
      "s16": [
        "Улюблена природа?",
        "Море",
        "Ліс",
        "Пустеля",
        "Північне сяйво"
      ]
    },
    "who": [
      "Хто з нас частіше запізнюється?",
      "Хто з нас швидше йде на примирення?",
      "Хто з нас краще готує?",
      "Хто з нас частіше сміється?",
      "Хто з нас довше збирається?",
      "Хто з нас частіше губить ключі?",
      "Хто з нас краще пам’ятає важливі дати?",
      "Хто з нас більше любить солодке?",
      "Хто з нас швидше засинає?",
      "Хто з нас раніше встає вранці?",
      "Хто з нас частіше каже «я сумую»?",
      "Хто з нас краще вибирає подарунки?",
      "Хто з нас частіше жартує?",
      "Хто з нас краще водить машину?",
      "Хто з нас довше говорить по телефону?",
      "Хто з нас більше любить подорожувати?",
      "Хто з нас швидше ображається?",
      "Хто з нас швидше прощає?",
      "Хто з нас частіше фотографує?",
      "Хто з нас краще дає раду грошам?",
      "Хто з нас частіше купує зайве?",
      "Хто з нас краще втішає?",
      "Хто з нас спокійніше тримається у скрутну хвилину?",
      "Хто з нас частіше шукає свій телефон?",
      "Хто з нас більше любить приймати гостей?",
      "Хто з нас частіше готує сніданок?",
      "Хто з нас краще орієнтується в незнайомому місті?",
      "Хто з нас пише довші повідомлення?",
      "Хто з нас частіше кличе на прогулянку?",
      "Хто з нас більше любить тварин?",
      "Хто з нас краще зберігає таємниці?",
      "Хто з нас довше вибирає страву в кафе?",
      "Хто з нас більше хвилюється за близьких?",
      "Хто з нас частіше робить сюрпризи?",
      "Хто з нас краще наводить лад?",
      "Хто з нас швидше помічає нову зачіску?",
      "Хто з нас частіше згадує смішні історії?",
      "Хто з нас має більше терпіння?",
      "Хто з нас частіше каже «дякую»?",
      "Хто з нас швидше пропонує допомогу?"
    ],
    "phrases": [
      "Я усміхаюся, коли ти…",
      "Мій улюблений день з тобою — це…",
      "Дякую тобі за…",
      "Коли мені сумно, мені допомагає…",
      "Я хочу, щоб колись ми разом…",
      "Найтепліший спогад про нас — …",
      "Ти найкраще вмієш…",
      "Мені спокійно, коли…",
      "Якби в нас був цілий вільний день, ми б…",
      "Я пишаюся тобою, бо…",
      "Наш ідеальний вечір — це…",
      "Я ніколи не забуду, як ти…",
      "Мені подобається, коли ти кажеш…",
      "Наступного року я хочу, щоб ми…",
      "Ти для мене як…",
      "Найкращий подарунок від тебе — це…",
      "Я сумую за тобою, коли…",
      "Нам найвеселіше, коли…",
      "Мені давно хочеться сказати тобі…",
      "Наше місце — це…",
      "Коли я думаю про тебе, я…",
      "Ти робиш мій день кращим, коли…",
      "Мені подобається наша звичка…",
      "Моє бажання для нас: …",
      "Найсмішніше, що з нами траплялося, — …",
      "Я відчуваю твою турботу, коли ти…",
      "Ранок із тобою — це…",
      "Якщо описати нас одним словом, це…",
      "Я хочу навчитися в тебе…",
      "Дякую, що ти завжди…"
    ]
  },
  "pt": {
    "text": {
      "homeLink": "Jogos a dois",
      "eyebrow": "GLOWLETTER · JOGOS A DOIS",
      "title": "Joguem juntos",
      "close": "Fechar",
      "lead": "Envie um jogo a alguém querido. Jogar a partir de um link é grátis e não precisa de conta.",
      "quizTitle": "Quanto você me conhece?",
      "quizNote": "Responda a perguntas sobre você, e alguém próximo tenta adivinhar. O resultado volta para você.",
      "create": "Criar um quiz",
      "soon": "Em breve",
      "soonTitle": "Mais jogos a caminho",
      "duel": "Duelo «Quem é mais rápido»",
      "loves": "O que amamos",
      "cards": "Cartas de memória a dois",
      "who": "Quem de nós?",
      "phrase": "Complete a frase",
      "myQuizzes": "Meus quizzes",
      "noQuizzes": "Ainda não há quizzes. O primeiro leva dois minutos.",
      "forWhom": "Para {name}",
      "noRecipient": "Quiz",
      "resultsCount": "Resultados: {count}",
      "newResults": "Novos: {count}",
      "noResults": "Ninguém jogou ainda.",
      "anonymous": "Sem nome",
      "results": "Resultados",
      "copyLink": "Copiar link",
      "share": "Enviar",
      "deleteQuiz": "Excluir quiz",
      "deleteConfirm": "Excluir este quiz e os resultados? O link deixará de funcionar.",
      "deleted": "Quiz excluído",
      "linkCopied": "Link copiado",
      "back": "Voltar",
      "next": "Avançar",
      "stepNames": "Passo 1 de 2 · Nomes",
      "yourName": "Seu nome",
      "yourNamePlaceholder": "Como você se chama",
      "recipient": "Para quem · opcional",
      "recipientPlaceholder": "Nome da pessoa querida",
      "nameRequired": "Digite seu nome.",
      "forbiddenName": "Digite um nome comum.",
      "stepAnswers": "Passo 2 de 2 · Suas respostas",
      "answersLead": "Marque o que é verdade sobre você. Qualquer pergunta pode ser trocada.",
      "swap": "Outra pergunta",
      "progress": "{done} de {total} respondidas",
      "answerAll": "Escolha uma resposta em cada pergunta.",
      "finish": "Obter o link",
      "creating": "Criando o quiz…",
      "createdTitle": "Seu quiz está pronto!",
      "createdLead": "Envie o link. Quando a pessoa responder, o resultado aparece em «Meus quizzes».",
      "shareText": "{name} convida você para o jogo «Quanto você me conhece?»",
      "signInTitle": "Entre na sua conta",
      "signInNote": "O quiz fica na sua conta para que os resultados cheguem a você.",
      "signIn": "Entrar",
      "premiumNote": "Criar jogos faz parte do acesso completo. Jogar a partir de um link é grátis para todos.",
      "failed": "Algo deu errado. Verifique a conexão e tente novamente.",
      "rateLimited": "Tentativas demais. Tente mais tarde.",
      "playEyebrow": "UM JOGO A DOIS",
      "playInvite": "{name} convida você para jogar",
      "playLead": "Perguntas: {count}. Adivinhe as respostas — no fim você verá quantas coincidem.",
      "playName": "Seu nome · opcional",
      "playNamePlaceholder": "Para saberem que é você",
      "start": "Começar",
      "playLoading": "Carregando o jogo…",
      "playMissing": "Este jogo não está disponível: o link foi excluído ou expirou.",
      "playOffline": "O jogo precisa de conexão com a internet.",
      "retry": "Tentar de novo",
      "questionOf": "Pergunta {n} de {total}",
      "asks": "{name} pergunta",
      "counting": "Contando as coincidências…",
      "scoreOf": "{score} de {total}",
      "tierAll": "Perfeito! Vocês se conhecem melhor que ninguém",
      "tierHigh": "Vocês se conhecem muito bem",
      "tierMid": "Nada mal! Ainda há o que descobrir",
      "tierLow": "Muitas descobertas bonitas pela frente",
      "sentTo": "{name} verá seu resultado",
      "review": "Suas respostas",
      "rightAnswer": "Resposta certa",
      "makeOwn": "Criar meu quiz",
      "home": "Início",
      "resultToast": "{name}: {score} de {total} em «Quanto você me conhece?»",
      "ownerAnswers": "Respostas do autor",
      "playerAnswers": "Respostas de {name}",
      "paywallTitle": "Jogos, diversão<br><em>e cartas</em>",
      "groupGames": "Jogos",
      "groupFun": "Diversão",
      "groupLetters": "Cartas",
      "featQuiz": "«Quanto você me conhece?» — o resultado volta para você",
      "featGamesSoon": "Duelo «Quem é mais rápido», «O que amamos», cartas com ursinhos",
      "featFunSoon": "«Quem de nós?» e «Complete a frase» com o livro do casal",
      "featCollection": "Toda a coleção de cartas e poemas em 25 idiomas",
      "featMoments": "Momentos, lembretes e uma carta QR que abre no dia certo",
      "featAudio": "Seu próprio áudio na carta e respostas do destinatário",
      "ynTitle": "Sim ou não",
      "ynNote": "Um jogo ao vivo a dois: 5 segundos por cartão. Quem responder a tempo vê a resposta da outra pessoa.",
      "ynCreate": "Criar sala",
      "ynWaiting": "Esperando {name} abrir o link…",
      "ynWaitingAny": "Esperando a outra pessoa…",
      "ynShareText": "{name} convida você para o jogo ao vivo «Sim ou não»",
      "ynPartnerHere": "{name} chegou!",
      "ynStart": "Começar o jogo",
      "ynWaitHost": "{name} já vai começar o jogo",
      "ynYes": "Sim",
      "ynNo": "Não",
      "ynMissed": "Tarde demais — este cartão fica fechado",
      "ynMatch": "Combinaram!",
      "ynRound": "Cartão {n} de {total}",
      "ynAnswered": "Resposta enviada, esperando a outra pessoa…",
      "ynFinal": "{score} de {total} em comum",
      "ynFinalHigh": "Vocês se entendem sem palavras",
      "ynFinalMid": "Tão diferentes — e tão próximos",
      "ynAgain": "Jogar de novo",
      "ynLeft": "A outra pessoa se desconectou. Esperando a volta…",
      "ynYou": "Você",
      "ynOffline": "Não foi possível conectar ao jogo. Verifique a internet e abra o link de novo.",
      "ynJoin": "Entrar no jogo",
      "ynJoinLead": "{name} está esperando por você. 5 segundos por resposta!",
      "ynStepNames": "Seu nome e o da outra pessoa",
      "ynRoomReady": "A sala está pronta — envie o link",
      "ynStayHere": "Mantenha esta tela aberta: o jogo começa quando o link for aberto.",
      "featYesNo": "Jogo ao vivo «Sim ou não» — 5 segundos por resposta",
      "ynPartnerMissed": "Sem resposta — o tempo acabou",
      "lvTitle": "O que amamos",
      "lvNote": "Um jogo ao vivo a dois: 4 imagens, 10 segundos para escolher o que você mais gosta. Vocês podem escolher a mesma!",
      "lvShareText": "{name} convida você para o jogo ao vivo «O que amamos»",
      "lvJoinLead": "{name} está esperando por você. Escolha a imagem de que mais gosta!",
      "lvRound": "Tema {n} de {total}",
      "lvPick": "Escolha o que você mais gosta",
      "lvBoth": "Vocês dois escolheram: {item}",
      "lvCommon": "Vocês dois amam",
      "lvDiff": "Gostos diferentes — ainda mais interessante!",
      "lvFinalHigh": "Vocês têm tanto em comum!",
      "lvFinalMid": "Tão diferentes — e se completam",
      "featLoves": "Jogo ao vivo «O que amamos» — 4 imagens, escolham juntos",
      "featGamesSoon2": "Duelo «Quem é mais rápido» e cartas de memória com ursinhos",
      "mcTitle": "Cartas de memória com ursinhos",
      "mcNote": "Um jogo da memória ao vivo a dois: revezem-se virando duas cartas e encontrem os pares. Três níveis, de 8 a 16 cartas.",
      "mcShareText": "{name} convida você para o jogo ao vivo «Cartas de memória com ursinhos»",
      "mcJoinLead": "{name} está esperando por você. Encontrem os pares revezando!",
      "mcLevel": "Nível {n} de {total}",
      "mcTurnYou": "Sua vez — vire duas cartas",
      "mcTurnThem": "Vez de {name}",
      "mcPairs": "Pares encontrados: {found} de {total}",
      "mcLevelDone": "Todos os pares encontrados!",
      "mcTimeUp": "O tempo do nível acabou",
      "mcNext": "Próximo: nível {n}",
      "mcFinal": "Pares encontrados: {found} de {total}",
      "mcFinalHigh": "Que time incrível!",
      "mcFinalMid": "Bom jogo — mais uma?",
      "featCards": "Jogo ao vivo «Cartas de memória com ursinhos» — encontrem pares juntos",
      "featGamesSoon3": "Duelo «Quem é mais rápido»",
      "duTitle": "Quem é mais rápido",
      "duNote": "Um duelo ao vivo: uma palavra e quatro imagens. Toque primeiro na imagem certa — um toque errado faz perder a rodada.",
      "duShareText": "{name} desafia você para o duelo ao vivo «Quem é mais rápido»",
      "duJoinLead": "{name} está esperando por você. Encontre a imagem certa mais depressa!",
      "duRound": "Rodada {n} de {total}",
      "duFind": "Encontre: {item}",
      "duYouWon": "Você chegou primeiro!",
      "duTheyWon": "Chegou primeiro: {name}",
      "duWrong": "Imagem errada — rodada perdida",
      "duNobody": "Ninguém encontrou a tempo",
      "duScore": "Você {you} : {them} {name}",
      "duFinalWin": "Vitória! Que olhar afiado hoje.",
      "duFinalLose": "Desta vez quem vence é {name} — revanche?",
      "duFinalDraw": "Empate — vocês estão de igual para igual!",
      "duSeconds": "{s} s",
      "featDuel": "Duelo ao vivo «Quem é mais rápido» — encontre a imagem primeiro",
      "whoTitle": "Quem de nós?",
      "whoNote": "Um jogo ao vivo para dois: uma pergunta, toque em «Eu» ou no nome da outra pessoa. Vejam se vocês concordam.",
      "whoShareText": "{name} convida você para o jogo ao vivo «Quem de nós?»",
      "whoJoinLead": "{name} está esperando por você. Responda com sinceridade — depois comparem!",
      "whoRound": "Pergunta {n} de {total}",
      "whoMe": "Eu",
      "whoAgree": "Vocês concordam: {name}",
      "whoDiffer": "Opiniões diferentes — conversem sobre isso!",
      "whoFinal": "Vocês concordaram {score} de {total} vezes",
      "whoFinalHigh": "Vocês se conhecem tão bem!",
      "whoFinalMid": "Muito assunto para conversar — e isso é lindo",
      "featWho": "Jogo ao vivo «Quem de nós?» — vocês concordam?",
      "phTitle": "Complete a frase",
      "phNote": "Um jogo ao vivo para dois: cada pessoa completa a mesma frase carinhosa com as próprias palavras, e depois vocês leem as respostas.",
      "phShareText": "{name} convida você para o jogo ao vivo «Complete a frase»",
      "phJoinLead": "{name} está esperando por você. Complete cada frase com suas palavras!",
      "phRound": "Frase {n} de {total}",
      "phPlaceholder": "Seu final…",
      "phDone": "Pronto",
      "phWaiting": "Esperando {name}…",
      "phSkipped": "Sem resposta",
      "phSave": "Salvar no livro do casal",
      "phSaved": "Salvo no livro do casal",
      "phForbidden": "Escreva sem links nem palavras grosseiras.",
      "phNext": "Próxima frase",
      "phFinal": "Frases completadas a dois: {count}",
      "phFinalLead": "Salvem as respostas de que mais gostaram no livro do casal.",
      "featPhrase": "Jogo ao vivo «Complete a frase» com o livro do casal",
      "bookTitle": "Livro do casal",
      "bookNote": "As respostas mais carinhosas de «Complete a frase», guardadas na sua conta.",
      "bookOpen": "Abrir o livro",
      "bookEmpty": "O livro ainda está vazio. Joguem «Complete a frase» e salvem as respostas de que gostarem.",
      "bookDelete": "Excluir",
      "bookDeleteConfirm": "Excluir esta página do livro?",
      "bookYou": "Você",
      "inviteTitle": "Convidar alguém",
      "inviteNote": "A pessoa vai receber uma mensagem com o jogo.",
      "invite": "Convidar",
      "invited": "Convite enviado",
      "inviteNone": "Adicione amigos na seção «Amigos» para convidar com um toque.",
      "inviteSent": "Convite enviado para {name}"
    },
    "questions": {
      "q01": [
        "Minha estação favorita?",
        "Primavera",
        "Verão",
        "Outono",
        "Inverno"
      ],
      "q02": [
        "O que eu escolheria no café da manhã?",
        "Café e croissant",
        "Mingau",
        "Ovos",
        "Só chá"
      ],
      "q03": [
        "Meu dia de folga perfeito?",
        "Em casa debaixo de uma manta",
        "Um passeio no parque",
        "Uma escapada da cidade",
        "Tempo com amigos"
      ],
      "q04": [
        "Para onde sonho viajar?",
        "Para a praia",
        "Para as montanhas",
        "Para uma cidade grande",
        "Para uma casinha aconchegante no campo"
      ],
      "q05": [
        "Meu sorvete favorito?",
        "Baunilha",
        "Chocolate",
        "Morango",
        "Pistache"
      ],
      "q06": [
        "O que me anima mais rápido?",
        "Um abraço",
        "Uma surpresa",
        "Palavras carinhosas",
        "Algo gostoso"
      ],
      "q07": [
        "Eu sou mais…",
        "De acordar cedo",
        "De dormir tarde",
        "De dormir quando dá",
        "Fã de uma soneca"
      ],
      "q08": [
        "Que filme eu escolheria hoje à noite?",
        "Uma comédia",
        "Uma história romântica",
        "Um mistério",
        "Uma animação"
      ],
      "q09": [
        "Minha cor favorita?",
        "Vermelho",
        "Azul",
        "Verde",
        "Rosa"
      ],
      "q10": [
        "Do que tenho mais medo?",
        "De aranhas",
        "De altura",
        "Do escuro",
        "De me atrasar"
      ],
      "q11": [
        "Que flores eu amo?",
        "Rosas",
        "Tulipas",
        "Peônias",
        "Margaridas"
      ],
      "q12": [
        "O que faço quando estou triste?",
        "Ligo para alguém próximo",
        "Como um doce",
        "Saio para caminhar",
        "Vou dormir"
      ],
      "q13": [
        "Que animal mais combina comigo?",
        "Um gatinho",
        "Um cachorro",
        "Um filhote de urso",
        "Uma raposinha"
      ],
      "q14": [
        "O melhor presente para mim?",
        "Algo feito à mão",
        "Uma viagem",
        "Uma joia",
        "Um livro"
      ],
      "q15": [
        "Minha bebida favorita?",
        "Chá preto",
        "Chá verde",
        "Café",
        "Chocolate quente"
      ],
      "q16": [
        "Meu lanche favorito?",
        "Chocolate",
        "Batata chips",
        "Frutas",
        "Um docinho de padaria"
      ],
      "q17": [
        "O que escolho numa viagem?",
        "Museus",
        "A praia",
        "A comida local",
        "Passear sem roteiro"
      ],
      "q18": [
        "Como gosto de passar a noite?",
        "Com um livro",
        "Com uma série",
        "Conversando",
        "Caminhando"
      ],
      "q19": [
        "Que tempo mais me agrada?",
        "Sol",
        "Chuva morna",
        "Neve caindo",
        "Uma brisa leve"
      ],
      "q20": [
        "Que superpoder combinaria comigo?",
        "Voar",
        "Ler mentes",
        "Parar o tempo",
        "Me teletransportar"
      ],
      "q21": [
        "O que mais importa para mim nas pessoas queridas?",
        "Confiança",
        "Cuidado",
        "Senso de humor",
        "Apoio"
      ],
      "q22": [
        "Que data eu mais espero?",
        "Ano-Novo",
        "Meu aniversário",
        "As férias de verão",
        "Dia dos Namorados"
      ],
      "q23": [
        "Como costumo dizer «eu te amo»?",
        "Com palavras",
        "Com atitudes",
        "Com abraços",
        "Com presentes"
      ],
      "q24": [
        "O que eu pediria num café?",
        "Massa",
        "Sushi",
        "Uma salada",
        "Uma sobremesa"
      ],
      "q25": [
        "Minha hora favorita do dia?",
        "Manhã",
        "Tarde",
        "Fim de tarde",
        "Noite"
      ],
      "q26": [
        "Que cozinha eu escolheria?",
        "Italiana",
        "Japonesa",
        "Caseira",
        "Mexicana"
      ],
      "q27": [
        "Onde eu penso melhor?",
        "No banho",
        "Caminhando",
        "Viajando",
        "Antes de dormir"
      ],
      "q28": [
        "O que faço logo de manhã?",
        "Olho o celular",
        "Bebo água",
        "Faço café",
        "Fico mais um pouco na cama"
      ],
      "q29": [
        "Minha fruta favorita?",
        "Maçã",
        "Banana",
        "Manga",
        "Melancia"
      ],
      "q30": [
        "Que hobby combina mais comigo?",
        "Desenhar",
        "Cozinhar",
        "Esporte",
        "Ler"
      ],
      "q31": [
        "Como quero comemorar meu aniversário?",
        "Com uma festa animada",
        "Com um jantar a dois",
        "Com uma viagem",
        "Com uma noite tranquila em casa"
      ],
      "q32": [
        "O que acho de surpresas?",
        "Gosto muito",
        "Me dão um frio na barriga",
        "Gosto de fazer para os outros",
        "Prefiro saber antes"
      ],
      "q33": [
        "Que doce eu prefiro?",
        "Bolo",
        "Sorvete",
        "Biscoitos",
        "Balas"
      ],
      "q34": [
        "O que levaria para uma ilha deserta?",
        "Um livro",
        "O celular",
        "Uma manta",
        "Uma câmera"
      ],
      "q35": [
        "Como descanso depois de um dia difícil?",
        "Um banho quente",
        "Uma série",
        "Uma caminhada",
        "Uma conversa com alguém próximo"
      ],
      "q36": [
        "Que meio de transporte eu mais gosto?",
        "Trem",
        "Avião",
        "Carro",
        "Bicicleta"
      ],
      "q37": [
        "Minha brincadeira favorita na infância?",
        "Esconde-esconde",
        "Pega-pega",
        "Blocos de montar",
        "Desenhar"
      ],
      "q38": [
        "Que conto de fadas mais combina comigo?",
        "Cinderela",
        "O Pequeno Príncipe",
        "Ursinho Pooh",
        "Alice no País das Maravilhas"
      ],
      "q39": [
        "Como eu alegraria alguém querido?",
        "Com uma surpresa",
        "Com um cartão",
        "Com uma viagem",
        "Com um jantar"
      ],
      "q40": [
        "O que eu mais fotografo?",
        "Selfies",
        "A natureza",
        "Comida",
        "Quase não tiro fotos"
      ],
      "q41": [
        "Meu cantinho favorito em casa?",
        "A cama",
        "A cozinha",
        "O sofá",
        "A varanda"
      ],
      "q42": [
        "O que noto primeiro numa pessoa?",
        "O sorriso",
        "Os olhos",
        "A voz",
        "O senso de humor"
      ],
      "q43": [
        "O que me faz rir mais rápido?",
        "Vídeos engraçados",
        "Piadas de quem eu amo",
        "Situações constrangedoras",
        "Animais"
      ],
      "q44": [
        "O que bebo num dia quente?",
        "Limonada",
        "Chá gelado",
        "Suco",
        "Água com gelo"
      ],
      "q45": [
        "Que elemento mais combina comigo?",
        "Água",
        "Fogo",
        "Terra",
        "Ar"
      ],
      "q46": [
        "Que histórias eu amo?",
        "De aventura",
        "De amor",
        "De ficção científica",
        "Reais"
      ],
      "q47": [
        "Como passo um dia de chuva?",
        "Lendo",
        "Dormindo",
        "Vendo um filme",
        "Caminhando de guarda-chuva"
      ],
      "q48": [
        "O que mais valorizo num presente?",
        "O carinho",
        "A utilidade",
        "A beleza",
        "A surpresa"
      ],
      "q49": [
        "Que batata eu escolheria?",
        "Purê",
        "Batata frita",
        "Assada",
        "Batata chips"
      ],
      "q50": [
        "Aonde vou primeiro numa cidade nova?",
        "Num café",
        "Num museu",
        "Num parque",
        "Às lojas"
      ],
      "q51": [
        "O que faço quando não consigo dormir?",
        "Leio",
        "Mexo no celular",
        "Conto carneirinhos",
        "Tomo leite morno"
      ],
      "q52": [
        "Como me preparo para um dia importante?",
        "Planejo tudo antes",
        "Faço tudo na última hora",
        "Peço ajuda",
        "Bate a ansiedade e não durmo"
      ],
      "q53": [
        "Que esporte mais gosto de assistir?",
        "Futebol",
        "Tênis",
        "Patinação artística",
        "Não assisto esporte"
      ],
      "q54": [
        "Que bichinho combina comigo?",
        "Um gato",
        "Um cachorro",
        "Um papagaio",
        "Um hamster"
      ],
      "q55": [
        "Que tipo de mensagens escrevo?",
        "Longas",
        "Curtas",
        "Cheias de emojis",
        "Áudios"
      ],
      "q56": [
        "Que presente guardo há mais tempo?",
        "Uma carta",
        "Um brinquedo",
        "Uma foto",
        "Uma joia"
      ],
      "q57": [
        "O que eu escolheria?",
        "Chá perto da lareira",
        "Piquenique na grama",
        "Passeio à beira-mar",
        "Uma ida ao cinema"
      ],
      "q58": [
        "Que elogio me deixaria mais feliz?",
        "Sobre minha aparência",
        "Sobre minha inteligência",
        "Sobre minha bondade",
        "Sobre meu senso de humor"
      ],
      "q59": [
        "Minha manhã perfeita?",
        "Café da manhã na cama",
        "Corrida cedo",
        "Dormir até tarde",
        "Café na varanda"
      ],
      "q60": [
        "O que quero aprender?",
        "Dançar",
        "Cozinhar",
        "Uma nova língua",
        "Desenhar"
      ]
    },
    "yesNo": {
      "c01": [
        "Você está com saudade de mim agora?",
        "sente muita saudade",
        "aguenta firme, mas pensa em você"
      ],
      "c02": [
        "Você sorri quando vê minha mensagem?",
        "sempre sorri",
        "sorri por dentro"
      ],
      "c03": [
        "Lembra do nosso primeiro encontro?",
        "lembra de cada minuto",
        "lembra do essencial: você"
      ],
      "c04": [
        "Quer um abraço hoje?",
        "espera o seu abraço",
        "guarda os abraços para depois"
      ],
      "c05": [
        "Vamos juntos para a praia?",
        "já está fazendo a mala",
        "sonha com as montanhas"
      ],
      "c06": [
        "Eu faço você rir?",
        "ri de coração",
        "esconde um sorriso"
      ],
      "c07": [
        "Você fica em paz comigo?",
        "sente paz ao seu lado",
        "se diverte com você"
      ],
      "c08": [
        "Você pensa em mim durante o dia?",
        "pensa em você muitas vezes",
        "está pensando em você agora"
      ],
      "c09": [
        "Você ama minhas surpresas?",
        "gosta muito das suas surpresas",
        "gosta mesmo é de ter você por perto"
      ],
      "c10": [
        "Vamos fazer uma torta juntos?",
        "já está pondo o avental",
        "prefere comprar um bolo"
      ],
      "c11": [
        "Vamos ver um filme hoje à noite?",
        "já está escolhendo o filme",
        "prefere só conversar"
      ],
      "c12": [
        "Você gosta da minha voz?",
        "ouviria sem parar",
        "gosta ainda mais da sua risada"
      ],
      "c13": [
        "Vamos fazer um piquenique no fim de semana?",
        "prepara a manta",
        "chama você para um café aconchegante"
      ],
      "c14": [
        "Quer receber uma carta minha?",
        "espera a sua carta",
        "quer ouvir tudo pessoalmente"
      ],
      "c15": [
        "Sou muito importante para você?",
        "você importa demais",
        "mais do que você imagina"
      ],
      "c16": [
        "Vamos passear na chuva?",
        "pega um guarda-chuva para dois",
        "vai fazer chá em casa"
      ],
      "c17": [
        "A gente se parece?",
        "vocês são duas metades",
        "vocês se completam perfeitamente"
      ],
      "c18": [
        "Você gosta da minha comida?",
        "pede mais um prato",
        "gosta de cozinhar junto com você"
      ],
      "c19": [
        "Vamos ter um bichinho juntos?",
        "já está escolhendo o nome",
        "por enquanto basta um ursinho de pelúcia"
      ],
      "c20": [
        "Você sabe do que eu gosto?",
        "sabe de cor",
        "quer descobrir ainda mais"
      ],
      "c21": [
        "Vamos dançar?",
        "já está estendendo a mão",
        "vai bater palmas"
      ],
      "c22": [
        "Eu te inspiro?",
        "você inspira todos os dias",
        "ao seu lado é simplesmente quentinho"
      ],
      "c23": [
        "Você guarda nossas fotos?",
        "guarda cada uma com carinho",
        "espera novas, ainda mais bonitas"
      ],
      "c24": [
        "Vamos ver o nascer do sol juntos?",
        "já põe o despertador",
        "prefere ver o pôr do sol"
      ],
      "c25": [
        "Você me conta um segredo?",
        "vai sussurrar no seu ouvido",
        "que continue um mistério"
      ],
      "c26": [
        "Você acredita em mim?",
        "acredita muito em você",
        "torce por você todos os dias"
      ],
      "c27": [
        "Vamos viajar só nós dois?",
        "sonha com isso",
        "vai levar todos os queridos"
      ],
      "c28": [
        "Você espera a minha ligação?",
        "espera com um sorriso",
        "prefere que você venha visitar"
      ],
      "c29": [
        "Você gosta dos meus abraços?",
        "os mais quentinhos do mundo",
        "gosta de andar de mãos dadas"
      ],
      "c30": [
        "Vamos ler em voz alta um para o outro?",
        "já está escolhendo um livro",
        "prefere ouvir você"
      ],
      "c31": [
        "Vamos tirar uma foto juntos hoje?",
        "já procura um fundo bonito",
        "primeiro, uma boa conversa"
      ],
      "c32": [
        "Eu melhoro o seu humor?",
        "sempre",
        "com você até a tristeza fica mais leve"
      ],
      "c33": [
        "Vamos tomar café da manhã juntos amanhã?",
        "já está fazendo chocolate quente",
        "sonha em dormir até mais tarde"
      ],
      "c34": [
        "Você lembra do meu aniversário?",
        "lembra sem precisar de aviso",
        "prepara uma surpresa em segredo"
      ],
      "c35": [
        "Vamos patinar no gelo?",
        "já pega os patins",
        "vai torcer por você da beira da pista"
      ],
      "c36": [
        "Hoje está sendo um bom dia para você?",
        "um dia ótimo",
        "vai ficar melhor com você por perto"
      ],
      "c37": [
        "Você desenha o meu retrato?",
        "já pega o lápis",
        "vai desenhar um coraçãozinho"
      ],
      "c38": [
        "Vamos plantar uma árvore juntos?",
        "escolhe o lugar",
        "vai começar com uma flor na janela"
      ],
      "c39": [
        "Quer ouvir um elogio?",
        "mal pode esperar",
        "fica com vergonha, mas quer muito"
      ],
      "c40": [
        "Vamos jogar de novo depois?",
        "quer mais uma rodada",
        "prefere um abraço a jogar"
      ]
    },
    "loves": {
      "s01": [
        "Onde passar as férias?",
        "Praia",
        "Montanhas",
        "Viajar",
        "Um tempo só para mim"
      ],
      "s02": [
        "A noite perfeita?",
        "Filme em casa",
        "Um passeio",
        "Restaurante",
        "Jogos de tabuleiro"
      ],
      "s03": [
        "Tempo favorito?",
        "Sol",
        "Chuva",
        "Neve",
        "Noite estrelada"
      ],
      "s04": [
        "Animal favorito?",
        "Gatinho",
        "Filhote de cachorro",
        "Cavalo",
        "Golfinho"
      ],
      "s05": [
        "O que tem pro jantar?",
        "Pizza",
        "Sushi",
        "Doces",
        "Churrasco"
      ],
      "s06": [
        "Bebida favorita?",
        "Café",
        "Chá",
        "Chocolate quente",
        "Limonada"
      ],
      "s07": [
        "Estação favorita?",
        "Primavera",
        "Verão",
        "Outono",
        "Inverno"
      ],
      "s08": [
        "Flores favoritas?",
        "Rosas",
        "Tulipas",
        "Girassóis",
        "Lavanda"
      ],
      "s09": [
        "Como descansar?",
        "Com um livro",
        "Desenhando",
        "De bicicleta",
        "Soneca na rede"
      ],
      "s10": [
        "Como viajar?",
        "De trem",
        "De avião",
        "De carro",
        "De navio"
      ],
      "s11": [
        "Casa dos sonhos?",
        "Apartamento na cidade",
        "Casa na praia",
        "Chalé na montanha",
        "Fazenda"
      ],
      "s12": [
        "Algo doce?",
        "Sorvete",
        "Chocolate",
        "Bolo",
        "Frutas"
      ],
      "s13": [
        "A manhã perfeita?",
        "Café da manhã na cama",
        "Corrida",
        "Dormir até tarde",
        "Café na varanda"
      ],
      "s14": [
        "Encontro dos sonhos?",
        "Piquenique",
        "Pista de gelo",
        "Parque de diversões",
        "Estrelas no terraço"
      ],
      "s15": [
        "O melhor presente?",
        "Um buquê",
        "Uma carta",
        "Uma viagem",
        "Uma caixa de presente"
      ],
      "s16": [
        "Natureza favorita?",
        "Mar",
        "Floresta",
        "Deserto",
        "Aurora boreal"
      ]
    },
    "who": [
      "Quem de nós se atrasa com mais frequência?",
      "Quem de nós faz as pazes primeiro?",
      "Quem de nós cozinha melhor?",
      "Quem de nós ri com mais frequência?",
      "Quem de nós demora mais para se arrumar?",
      "Quem de nós perde as chaves com mais frequência?",
      "Quem de nós lembra melhor as datas importantes?",
      "Quem de nós gosta mais de doces?",
      "Quem de nós pega no sono primeiro?",
      "Quem de nós acorda mais cedo?",
      "Quem de nós diz «tenho saudade» com mais frequência?",
      "Quem de nós escolhe presentes melhores?",
      "Quem de nós brinca com mais frequência?",
      "Quem de nós dirige melhor?",
      "Quem de nós fala mais tempo ao telefone?",
      "Quem de nós gosta mais de viajar?",
      "Quem de nós se magoa com mais facilidade?",
      "Quem de nós perdoa mais rápido?",
      "Quem de nós tira mais fotos?",
      "Quem de nós lida melhor com dinheiro?",
      "Quem de nós compra coisas desnecessárias com mais frequência?",
      "Quem de nós consola melhor?",
      "Quem de nós mantém mais a calma nos momentos difíceis?",
      "Quem de nós vive procurando o celular?",
      "Quem de nós gosta mais de receber visitas?",
      "Quem de nós prepara o café da manhã com mais frequência?",
      "Quem de nós se orienta melhor numa cidade nova?",
      "Quem de nós escreve mensagens mais longas?",
      "Quem de nós sugere um passeio primeiro?",
      "Quem de nós gosta mais de animais?",
      "Quem de nós guarda melhor os segredos?",
      "Quem de nós demora mais para escolher no cardápio?",
      "Quem de nós se preocupa mais com as pessoas queridas?",
      "Quem de nós faz mais surpresas?",
      "Quem de nós mantém tudo mais organizado?",
      "Quem de nós nota primeiro um corte de cabelo novo?",
      "Quem de nós lembra histórias engraçadas com mais frequência?",
      "Quem de nós tem mais paciência?",
      "Quem de nós agradece com mais frequência?",
      "Quem de nós oferece ajuda primeiro?"
    ],
    "phrases": [
      "Eu sorrio quando você…",
      "Meu dia favorito com você é…",
      "Agradeço por…",
      "Quando estou triste, o que me ajuda é…",
      "Um dia quero que a gente…",
      "A lembrança mais carinhosa de nós é…",
      "Ninguém sabe melhor do que você…",
      "Sinto calma quando…",
      "Se a gente tivesse um dia inteiro livre, a gente…",
      "Tenho orgulho de você porque…",
      "Nossa noite perfeita é…",
      "Nunca vou esquecer como você…",
      "Gosto quando você diz…",
      "No ano que vem, quero que a gente…",
      "Para mim, você é como…",
      "O melhor presente que você me deu é…",
      "Sinto sua falta quando…",
      "A gente se diverte mais quando…",
      "Faz tempo que quero dizer a você…",
      "O nosso lugar é…",
      "Quando penso em você, eu…",
      "Você deixa meu dia melhor quando…",
      "Gosto do nosso hábito de…",
      "Meu desejo para nós: …",
      "A coisa mais engraçada que aconteceu com a gente foi…",
      "Sinto o seu cuidado quando você…",
      "Uma manhã com você é…",
      "Se a gente fosse uma só palavra, seria…",
      "Quero aprender com você a…",
      "Agradeço por você sempre…"
    ]
  },
  "nl": {
    "text": {
      "homeLink": "Spellen voor twee",
      "eyebrow": "GLOWLETTER · SPELLEN VOOR TWEE",
      "title": "Speel samen",
      "close": "Sluiten",
      "lead": "Stuur een spel naar iemand die je dierbaar is. Spelen via een link is gratis en zonder account.",
      "quizTitle": "Hoe goed ken je mij?",
      "quizNote": "Beantwoord vragen over jezelf en laat iemand die dicht bij je staat raden. De uitslag komt naar jou.",
      "create": "Quiz maken",
      "soon": "Binnenkort",
      "soonTitle": "Er komen meer spellen aan",
      "duel": "Duel ‘Wie is sneller’",
      "loves": "Waar we van houden",
      "cards": "Memorykaarten voor twee",
      "who": "Wie van ons?",
      "phrase": "Maak de zin af",
      "myQuizzes": "Mijn quizzen",
      "noQuizzes": "Nog geen quizzen. De eerste maak je in een paar minuten.",
      "forWhom": "Voor {name}",
      "noRecipient": "Quiz",
      "resultsCount": "Uitslagen: {count}",
      "newResults": "Nieuw: {count}",
      "noResults": "Nog niemand heeft gespeeld.",
      "anonymous": "Zonder naam",
      "results": "Uitslagen",
      "copyLink": "Link kopiëren",
      "share": "Versturen",
      "deleteQuiz": "Quiz verwijderen",
      "deleteConfirm": "Deze quiz en de uitslagen verwijderen? De link werkt dan niet meer.",
      "deleted": "Quiz verwijderd",
      "linkCopied": "Link gekopieerd",
      "back": "Terug",
      "next": "Verder",
      "stepNames": "Stap 1 van 2 · Namen",
      "yourName": "Je naam",
      "yourNamePlaceholder": "Hoe heet je",
      "recipient": "Voor wie · optioneel",
      "recipientPlaceholder": "Naam van je dierbare",
      "nameRequired": "Vul je naam in.",
      "forbiddenName": "Vul een gewone naam in.",
      "stepAnswers": "Stap 2 van 2 · Jouw antwoorden",
      "answersLead": "Kies wat waar is over jou. Elke vraag kun je vervangen.",
      "swap": "Andere vraag",
      "progress": "{done} van {total} beantwoord",
      "answerAll": "Kies bij elke vraag een antwoord.",
      "finish": "Link ophalen",
      "creating": "Quiz wordt gemaakt…",
      "createdTitle": "Je quiz is klaar!",
      "createdLead": "Stuur de link. Zodra er geantwoord is, staat de uitslag bij ‘Mijn quizzen’.",
      "shareText": "{name} nodigt je uit voor het spel ‘Hoe goed ken je mij?’",
      "signInTitle": "Log in om verder te gaan",
      "signInNote": "De quiz staat in je account, zodat de uitslagen bij jou terechtkomen.",
      "signIn": "Inloggen",
      "premiumNote": "Spellen maken hoort bij volledige toegang. Spelen via een link is gratis voor iedereen.",
      "failed": "Dat lukte niet. Controleer je verbinding en probeer het opnieuw.",
      "rateLimited": "Te veel pogingen. Probeer het later opnieuw.",
      "playEyebrow": "EEN SPEL VOOR TWEE",
      "playInvite": "{name} nodigt je uit om te spelen",
      "playLead": "Vragen: {count}. Raad de antwoorden — aan het eind zie je hoeveel er overeenkomen.",
      "playName": "Je naam · optioneel",
      "playNamePlaceholder": "Zodat ze weten dat jij het bent",
      "start": "Beginnen",
      "playLoading": "Spel laden…",
      "playMissing": "Dit spel is niet beschikbaar: de link is verwijderd of verlopen.",
      "playOffline": "Voor het spel is internet nodig.",
      "retry": "Opnieuw proberen",
      "questionOf": "Vraag {n} van {total}",
      "asks": "{name} vraagt",
      "counting": "Overeenkomsten tellen…",
      "scoreOf": "{score} van {total}",
      "tierAll": "Perfect! Jullie kennen elkaar als geen ander",
      "tierHigh": "Jullie kennen elkaar echt goed",
      "tierMid": "Niet slecht! Er valt nog genoeg te ontdekken",
      "tierLow": "Er wachten nog veel mooie ontdekkingen",
      "sentTo": "{name} ziet je uitslag",
      "review": "Jouw antwoorden",
      "rightAnswer": "Juiste antwoord",
      "makeOwn": "Mijn eigen quiz maken",
      "home": "Startscherm",
      "resultToast": "{name}: {score} van {total} bij ‘Hoe goed ken je mij?’",
      "ownerAnswers": "Antwoorden van de maker",
      "playerAnswers": "Antwoorden van {name}",
      "paywallTitle": "Spellen, plezier<br><em>en brieven</em>",
      "groupGames": "Spellen",
      "groupFun": "Plezier",
      "groupLetters": "Brieven",
      "featQuiz": "‘Hoe goed ken je mij?’ — de uitslag komt naar jou",
      "featGamesSoon": "Duel ‘Wie is sneller’, ‘Waar we van houden’, memorykaarten met beertjes",
      "featFunSoon": "‘Wie van ons?’ en ‘Maak de zin af’ met het boek van jullie twee",
      "featCollection": "De hele verzameling brieven en gedichten in 25 talen",
      "featMoments": "Momenten, herinneringen en een QR-brief die op de juiste dag opengaat",
      "featAudio": "Eigen audio in de brief en antwoorden van de ontvanger",
      "ynTitle": "Ja of nee",
      "ynNote": "Een live spel voor twee: 5 seconden per kaart. Wie op tijd antwoordt, ziet het antwoord van de ander.",
      "ynCreate": "Kamer maken",
      "ynWaiting": "We wachten tot {name} de link opent…",
      "ynWaitingAny": "We wachten op de ander…",
      "ynShareText": "{name} nodigt je uit voor het live spel ‘Ja of nee’",
      "ynPartnerHere": "{name} is er!",
      "ynStart": "Spel starten",
      "ynWaitHost": "{name} start zo het spel",
      "ynYes": "Ja",
      "ynNo": "Nee",
      "ynMissed": "Te laat — deze kaart blijft dicht",
      "ynMatch": "Hetzelfde antwoord!",
      "ynRound": "Kaart {n} van {total}",
      "ynAnswered": "Antwoord verstuurd, we wachten op de ander…",
      "ynFinal": "{score} van {total} hetzelfde",
      "ynFinalHigh": "Jullie begrijpen elkaar zonder woorden",
      "ynFinalMid": "Zo verschillend — en zo dichtbij",
      "ynAgain": "Nog een keer spelen",
      "ynLeft": "De ander is weg. We wachten tot die terugkomt…",
      "ynYou": "Jij",
      "ynOffline": "Geen verbinding met het spel. Controleer je internet en open de link opnieuw.",
      "ynJoin": "Meedoen",
      "ynJoinLead": "{name} wacht op je. 5 seconden per antwoord!",
      "ynStepNames": "Jouw naam en die van de ander",
      "ynRoomReady": "De kamer is klaar — stuur de link",
      "ynStayHere": "Houd dit scherm open: het spel begint zodra de link wordt geopend.",
      "featYesNo": "Live spel ‘Ja of nee’ — 5 seconden per antwoord",
      "ynPartnerMissed": "Geen antwoord — de tijd is om",
      "lvTitle": "Waar we van houden",
      "lvNote": "Een live spel voor twee: 4 plaatjes, 10 seconden om te kiezen waar je het meest van houdt. Jullie mogen hetzelfde kiezen!",
      "lvShareText": "{name} nodigt je uit voor het live spel ‘Waar we van houden’",
      "lvJoinLead": "{name} wacht op je. Kies het plaatje waar je het meest van houdt!",
      "lvRound": "Thema {n} van {total}",
      "lvPick": "Kies waar je het meest van houdt",
      "lvBoth": "Jullie kozen allebei: {item}",
      "lvCommon": "Jullie houden allebei van",
      "lvDiff": "Verschillende smaken — des te leuker!",
      "lvFinalHigh": "Jullie hebben zoveel gemeen!",
      "lvFinalMid": "Zo verschillend — en jullie vullen elkaar aan",
      "featLoves": "Live spel ‘Waar we van houden’ — 4 plaatjes, samen kiezen",
      "featGamesSoon2": "Duel ‘Wie is sneller’ en memorykaarten met beertjes",
      "mcTitle": "Memorykaarten met beertjes",
      "mcNote": "Een live memoryspel voor twee: draai om de beurt twee kaarten om en zoek de paren. Drie levels, van 8 tot 16 kaarten.",
      "mcShareText": "{name} nodigt je uit voor het live spel ‘Memorykaarten met beertjes’",
      "mcJoinLead": "{name} wacht op je. Zoek om de beurt de paren!",
      "mcLevel": "Level {n} van {total}",
      "mcTurnYou": "Jij bent aan de beurt — draai twee kaarten om",
      "mcTurnThem": "{name} is aan de beurt",
      "mcPairs": "Gevonden paren: {found} van {total}",
      "mcLevelDone": "Alle paren gevonden!",
      "mcTimeUp": "De tijd voor dit level is om",
      "mcNext": "Volgende: level {n}",
      "mcFinal": "Gevonden paren: {found} van {total}",
      "mcFinalHigh": "Wat een team!",
      "mcFinalMid": "Leuk gespeeld — nog een keer?",
      "featCards": "Live spel ‘Memorykaarten met beertjes’ — samen paren zoeken",
      "featGamesSoon3": "Duel ‘Wie is sneller’",
      "duTitle": "Wie is sneller",
      "duNote": "Een live duel: één woord en vier plaatjes. Tik als eerste op het juiste plaatje — een verkeerde tik kost de ronde.",
      "duShareText": "{name} daagt je uit voor het live duel ‘Wie is sneller’",
      "duJoinLead": "{name} wacht op je. Vind het juiste plaatje sneller!",
      "duRound": "Ronde {n} van {total}",
      "duFind": "Zoek: {item}",
      "duYouWon": "Jij was sneller!",
      "duTheyWon": "Sneller: {name}",
      "duWrong": "Verkeerd plaatje — deze ronde is verloren",
      "duNobody": "Niemand vond het op tijd",
      "duScore": "Jij {you} : {them} {name}",
      "duFinalWin": "Gewonnen! Scherpe ogen vandaag.",
      "duFinalLose": "Deze keer wint {name} — revanche?",
      "duFinalDraw": "Gelijkspel — jullie zijn aan elkaar gewaagd!",
      "duSeconds": "{s} s",
      "featDuel": "Live duel ‘Wie is sneller’ — vind als eerste het plaatje",
      "whoTitle": "Wie van ons?",
      "whoNote": "Een live spel voor twee: één vraag, tik op ‘Ik’ of op de naam van de ander. Kijk of jullie het met elkaar eens zijn.",
      "whoShareText": "{name} nodigt je uit voor het live spel ‘Wie van ons?’",
      "whoJoinLead": "{name} wacht op je. Antwoord eerlijk — en vergelijk dan!",
      "whoRound": "Vraag {n} van {total}",
      "whoMe": "Ik",
      "whoAgree": "Jullie zijn het eens: {name}",
      "whoDiffer": "Verschillende meningen — praat erover!",
      "whoFinal": "{score} van de {total} keer eens",
      "whoFinalHigh": "Jullie kennen elkaar zo goed!",
      "whoFinalMid": "Genoeg om over te praten — en dat is mooi",
      "featWho": "Live spel ‘Wie van ons?’ — zijn jullie het eens?",
      "phTitle": "Maak de zin af",
      "phNote": "Een live spel voor twee: jullie maken allebei dezelfde warme zin af in eigen woorden en lezen daarna elkaars antwoorden.",
      "phShareText": "{name} nodigt je uit voor het live spel ‘Maak de zin af’",
      "phJoinLead": "{name} wacht op je. Maak elke zin af in je eigen woorden!",
      "phRound": "Zin {n} van {total}",
      "phPlaceholder": "Jouw einde…",
      "phDone": "Klaar",
      "phWaiting": "Wachten op {name}…",
      "phSkipped": "Geen antwoord",
      "phSave": "Bewaren in het boek van jullie twee",
      "phSaved": "Bewaard in het boek van jullie twee",
      "phForbidden": "Schrijf het zonder links of grove woorden.",
      "phNext": "Volgende zin",
      "phFinal": "Samen afgemaakte zinnen: {count}",
      "phFinalLead": "Bewaar jullie mooiste antwoorden in het boek van jullie twee.",
      "featPhrase": "Live spel ‘Maak de zin af’ met het boek van jullie twee",
      "bookTitle": "Het boek van jullie twee",
      "bookNote": "De warmste antwoorden uit ‘Maak de zin af’, bewaard in je account.",
      "bookOpen": "Boek openen",
      "bookEmpty": "Het boek is nog leeg. Speel ‘Maak de zin af’ en bewaar de antwoorden die jullie mooi vinden.",
      "bookDelete": "Verwijderen",
      "bookDeleteConfirm": "Deze pagina uit het boek verwijderen?",
      "bookYou": "Jij",
      "inviteTitle": "Iemand uitnodigen",
      "inviteNote": "Die persoon krijgt een bericht met het spel.",
      "invite": "Uitnodigen",
      "invited": "Uitgenodigd",
      "inviteNone": "Voeg vrienden toe in het onderdeel ‘Vrienden’ om ze met één tik uit te nodigen.",
      "inviteSent": "Uitnodiging verstuurd naar {name}"
    },
    "questions": {
      "q01": [
        "Mijn favoriete seizoen?",
        "Lente",
        "Zomer",
        "Herfst",
        "Winter"
      ],
      "q02": [
        "Wat kies ik als ontbijt?",
        "Koffie met een croissant",
        "Havermout",
        "Eieren",
        "Alleen thee"
      ],
      "q03": [
        "Mijn perfecte vrije dag?",
        "Thuis onder een dekentje",
        "Een wandeling in het park",
        "Een uitstapje buiten de stad",
        "Tijd met vrienden"
      ],
      "q04": [
        "Waar droom ik van om naartoe te gaan?",
        "Naar zee",
        "Naar de bergen",
        "Naar een grote stad",
        "Naar een knus huisje op het platteland"
      ],
      "q05": [
        "Mijn favoriete ijs?",
        "Vanille",
        "Chocolade",
        "Aardbei",
        "Pistache"
      ],
      "q06": [
        "Waar word ik het snelst blij van?",
        "Een knuffel",
        "Een verrassing",
        "Lieve woorden",
        "Iets lekkers"
      ],
      "q07": [
        "Ik ben eerder…",
        "Een ochtendmens",
        "Een avondmens",
        "Iemand die slaapt wanneer het kan",
        "Fan van een middagdutje"
      ],
      "q08": [
        "Welke film kies ik vanavond?",
        "Een komedie",
        "Een romantisch verhaal",
        "Een detective",
        "Een animatiefilm"
      ],
      "q09": [
        "Mijn favoriete kleur?",
        "Rood",
        "Blauw",
        "Groen",
        "Roze"
      ],
      "q10": [
        "Waar ben ik het bangst voor?",
        "Spinnen",
        "Hoogte",
        "Het donker",
        "Te laat komen"
      ],
      "q11": [
        "Van welke bloemen houd ik?",
        "Rozen",
        "Tulpen",
        "Pioenrozen",
        "Madeliefjes"
      ],
      "q12": [
        "Wat doe ik als ik verdrietig ben?",
        "Iemand bellen die dichtbij staat",
        "Iets zoets eten",
        "Een wandeling maken",
        "Gaan slapen"
      ],
      "q13": [
        "Welk dier past het best bij mij?",
        "Een kitten",
        "Een hond",
        "Een berenwelp",
        "Een vosje"
      ],
      "q14": [
        "Het mooiste cadeau voor mij?",
        "Iets zelfgemaakts",
        "Een reis",
        "Een sieraad",
        "Een boek"
      ],
      "q15": [
        "Mijn favoriete drankje?",
        "Zwarte thee",
        "Groene thee",
        "Koffie",
        "Warme chocolademelk"
      ],
      "q16": [
        "Mijn favoriete snack?",
        "Chocolade",
        "Chips",
        "Fruit",
        "Een gebakje"
      ],
      "q17": [
        "Wat kies ik op reis?",
        "Musea",
        "Het strand",
        "Het lokale eten",
        "Zonder plan rondslenteren"
      ],
      "q18": [
        "Hoe breng ik graag de avond door?",
        "Met een boek",
        "Met een serie",
        "Met praten",
        "Met een wandeling"
      ],
      "q19": [
        "Welk weer vind ik het fijnst?",
        "Zonneschijn",
        "Warme regen",
        "Sneeuw",
        "Een zacht briesje"
      ],
      "q20": [
        "Welke superkracht zou bij mij passen?",
        "Vliegen",
        "Gedachten lezen",
        "De tijd stilzetten",
        "Teleporteren"
      ],
      "q21": [
        "Wat vind ik het belangrijkst in mijn dierbaren?",
        "Vertrouwen",
        "Zorgzaamheid",
        "Gevoel voor humor",
        "Steun"
      ],
      "q22": [
        "Naar welk feest kijk ik het meest uit?",
        "Oud en nieuw",
        "Mijn verjaardag",
        "De zomervakantie",
        "Valentijnsdag"
      ],
      "q23": [
        "Hoe zeg ik meestal ‘ik hou van je’?",
        "Met woorden",
        "Met daden",
        "Met knuffels",
        "Met cadeautjes"
      ],
      "q24": [
        "Wat bestel ik in een café?",
        "Pasta",
        "Sushi",
        "Een salade",
        "Een toetje"
      ],
      "q25": [
        "Mijn favoriete moment van de dag?",
        "De ochtend",
        "De middag",
        "De avond",
        "De nacht"
      ],
      "q26": [
        "Welke keuken kies ik?",
        "Italiaans",
        "Japans",
        "Huisgemaakt",
        "Mexicaans"
      ],
      "q27": [
        "Waar denk ik het best na?",
        "Onder de douche",
        "Tijdens een wandeling",
        "Onderweg",
        "Voor het slapengaan"
      ],
      "q28": [
        "Wat doe ik ’s ochtends als eerste?",
        "Op mijn telefoon kijken",
        "Water drinken",
        "Koffie zetten",
        "Nog even blijven liggen"
      ],
      "q29": [
        "Mijn favoriete fruit?",
        "Appel",
        "Banaan",
        "Mango",
        "Watermeloen"
      ],
      "q30": [
        "Welke hobby past het best bij mij?",
        "Tekenen",
        "Koken",
        "Sporten",
        "Lezen"
      ],
      "q31": [
        "Hoe wil ik mijn verjaardag vieren?",
        "Met een groot feest",
        "Met een etentje voor twee",
        "Met een reisje",
        "Met een rustige avond thuis"
      ],
      "q32": [
        "Wat vind ik van verrassingen?",
        "Ik ben er dol op",
        "Ze maken me een beetje zenuwachtig",
        "Ik bereid ze graag voor anderen voor",
        "Ik weet het liever van tevoren"
      ],
      "q33": [
        "Welke zoetigheid vind ik het lekkerst?",
        "Taart",
        "IJs",
        "Koekjes",
        "Snoep"
      ],
      "q34": [
        "Wat neem ik mee naar een onbewoond eiland?",
        "Een boek",
        "Mijn telefoon",
        "Een deken",
        "Een camera"
      ],
      "q35": [
        "Hoe ontspan ik na een zware dag?",
        "Een warm bad",
        "Een serie",
        "Een wandeling",
        "Een gesprek met iemand dichtbij"
      ],
      "q36": [
        "Hoe reis ik het liefst?",
        "Met de trein",
        "Met het vliegtuig",
        "Met de auto",
        "Met de fiets"
      ],
      "q37": [
        "Mijn favoriete spel als kind?",
        "Verstoppertje",
        "Tikkertje",
        "Bouwblokken",
        "Tekenen"
      ],
      "q38": [
        "Welk sprookje past het best bij mij?",
        "Assepoester",
        "De Kleine Prins",
        "Winnie de Poeh",
        "Alice in Wonderland"
      ],
      "q39": [
        "Waarmee maak ik iemand dierbaar eerder blij?",
        "Met een verrassing",
        "Met een kaartje",
        "Met een reisje",
        "Met een etentje"
      ],
      "q40": [
        "Wat fotografeer ik het vaakst?",
        "Mezelf",
        "De natuur",
        "Eten",
        "Ik maak bijna geen foto’s"
      ],
      "q41": [
        "Mijn favoriete plek in huis?",
        "Het bed",
        "De keuken",
        "De bank",
        "Het balkon"
      ],
      "q42": [
        "Wat valt mij als eerste op aan iemand?",
        "De glimlach",
        "De ogen",
        "De stem",
        "Het gevoel voor humor"
      ],
      "q43": [
        "Waar moet ik het snelst om lachen?",
        "Grappige filmpjes",
        "Grapjes van dierbaren",
        "Ongemakkelijke momenten",
        "Dieren"
      ],
      "q44": [
        "Wat drink ik op een warme zomerdag?",
        "Limonade",
        "IJsthee",
        "Sap",
        "Water met ijs"
      ],
      "q45": [
        "Welk element past het best bij mij?",
        "Water",
        "Vuur",
        "Aarde",
        "Lucht"
      ],
      "q46": [
        "Van welke verhalen houd ik?",
        "Avonturen",
        "Liefdesverhalen",
        "Sciencefiction",
        "Echte verhalen"
      ],
      "q47": [
        "Hoe breng ik een regenachtige dag door?",
        "Lezen",
        "Slapen",
        "Een film kijken",
        "Wandelen onder een paraplu"
      ],
      "q48": [
        "Wat waardeer ik het meest aan een cadeau?",
        "De aandacht",
        "Het nut",
        "De schoonheid",
        "De verrassing"
      ],
      "q49": [
        "Welke aardappelen kies ik?",
        "Puree",
        "Friet",
        "Uit de oven",
        "Chips"
      ],
      "q50": [
        "Waar ga ik als eerste heen in een nieuwe stad?",
        "Naar een café",
        "Naar een museum",
        "Naar een park",
        "Winkelen"
      ],
      "q51": [
        "Wat doe ik als ik niet kan slapen?",
        "Lezen",
        "Op mijn telefoon scrollen",
        "Schaapjes tellen",
        "Warme melk drinken"
      ],
      "q52": [
        "Hoe bereid ik me voor op een belangrijke dag?",
        "Ik plan alles vooruit",
        "Ik doe alles op het laatste moment",
        "Ik vraag om hulp",
        "Ik ben zenuwachtig en slaap slecht"
      ],
      "q53": [
        "Welke sport kijk ik het liefst?",
        "Voetbal",
        "Tennis",
        "Kunstschaatsen",
        "Ik kijk geen sport"
      ],
      "q54": [
        "Welk huisdier past bij mij?",
        "Een kat",
        "Een hond",
        "Een papegaai",
        "Een hamster"
      ],
      "q55": [
        "Wat voor berichtjes stuur ik?",
        "Lange",
        "Korte",
        "Vol emoji’s",
        "Spraakberichten"
      ],
      "q56": [
        "Welk cadeau bewaar ik het langst?",
        "Een brief",
        "Een knuffel",
        "Een foto",
        "Een sieraad"
      ],
      "q57": [
        "Wat kies ik eerder?",
        "Thee bij de open haard",
        "Een picknick in het gras",
        "Een wandeling aan zee",
        "Naar de bioscoop"
      ],
      "q58": [
        "Welk compliment maakt mij het blijst?",
        "Over mijn uiterlijk",
        "Over mijn verstand",
        "Over mijn vriendelijkheid",
        "Over mijn humor"
      ],
      "q59": [
        "Mijn perfecte ochtend?",
        "Ontbijt op bed",
        "Vroeg hardlopen",
        "Lekker uitslapen",
        "Koffie op het balkon"
      ],
      "q60": [
        "Wat wil ik leren?",
        "Dansen",
        "Koken",
        "Een nieuwe taal",
        "Tekenen"
      ]
    },
    "yesNo": {
      "c01": [
        "Mis je me op dit moment?",
        "mist je heel erg",
        "houdt vol, maar denkt aan je"
      ],
      "c02": [
        "Glimlach je als je mijn bericht ziet?",
        "glimlacht altijd",
        "glimlacht vanbinnen"
      ],
      "c03": [
        "Weet je onze eerste ontmoeting nog?",
        "weet elke minuut nog",
        "weet het belangrijkste nog — jou"
      ],
      "c04": [
        "Wil je vandaag een knuffel?",
        "wacht op je knuffel",
        "bewaart knuffels voor later"
      ],
      "c05": [
        "Gaan we samen naar zee?",
        "pakt de koffer al in",
        "droomt van de bergen"
      ],
      "c06": [
        "Maak ik je aan het lachen?",
        "lacht van harte",
        "verbergt een glimlach"
      ],
      "c07": [
        "Voel je je rustig bij mij?",
        "voelt rust bij jou",
        "heeft plezier met jou"
      ],
      "c08": [
        "Denk je overdag aan mij?",
        "denkt heel vaak aan je",
        "denkt nu meteen aan je"
      ],
      "c09": [
        "Hou je van mijn verrassingen?",
        "is dol op je verrassingen",
        "vindt het fijnst als je er gewoon bent"
      ],
      "c10": [
        "Bakken we samen een taart?",
        "doet al een schort voor",
        "koopt liever een taart"
      ],
      "c11": [
        "Kijken we vanavond samen een film?",
        "kiest al een film",
        "wil liever gewoon praten"
      ],
      "c12": [
        "Vind je mijn stem fijn?",
        "kan er eindeloos naar luisteren",
        "houdt nog meer van je lach"
      ],
      "c13": [
        "Gaan we dit weekend picknicken?",
        "legt het kleed klaar",
        "nodigt je uit in een knus café"
      ],
      "c14": [
        "Wil je een brief van mij krijgen?",
        "wacht op je brief",
        "wil alles liever persoonlijk horen"
      ],
      "c15": [
        "Beteken ik veel voor je?",
        "je betekent ontzettend veel",
        "meer dan je denkt"
      ],
      "c16": [
        "Wandelen we in de regen?",
        "pakt een paraplu voor twee",
        "zet liever thee thuis"
      ],
      "c17": [
        "Lijken we op elkaar?",
        "jullie zijn twee helften",
        "jullie vullen elkaar perfect aan"
      ],
      "c18": [
        "Vind je mijn kookkunst lekker?",
        "vraagt om nog een bord",
        "kookt het liefst samen met jou"
      ],
      "c19": [
        "Nemen we samen een huisdier?",
        "kiest al een naam",
        "een knuffelbeer is voorlopig genoeg"
      ],
      "c20": [
        "Weet je waar ik van hou?",
        "kent het uit het hoofd",
        "wil nog meer ontdekken"
      ],
      "c21": [
        "Dansen we?",
        "steekt al een hand uit",
        "klapt enthousiast mee"
      ],
      "c22": [
        "Inspireer ik je?",
        "je inspireert elke dag",
        "bij jou is het gewoon warm"
      ],
      "c23": [
        "Bewaar je onze foto’s?",
        "koestert ze allemaal",
        "wacht op nieuwe, nog mooiere"
      ],
      "c24": [
        "Kijken we samen naar de zonsopgang?",
        "zet al een wekker",
        "kijkt liever naar de zonsondergang"
      ],
      "c25": [
        "Vertel je me een geheim?",
        "fluistert het in je oor",
        "laat het een raadsel blijven"
      ],
      "c26": [
        "Geloof je in mij?",
        "gelooft heel erg in je",
        "moedigt je elke dag aan"
      ],
      "c27": [
        "Gaan we op reis, alleen wij tweeën?",
        "droomt ervan",
        "neemt alle dierbaren mee"
      ],
      "c28": [
        "Wacht je op mijn telefoontje?",
        "wacht met een glimlach",
        "ziet je liever langskomen"
      ],
      "c29": [
        "Vind je mijn knuffels fijn?",
        "de warmste van de wereld",
        "houdt graag je hand vast"
      ],
      "c30": [
        "Lezen we elkaar voor?",
        "kiest al een boek",
        "luistert liever naar jou"
      ],
      "c31": [
        "Maken we vandaag samen een foto?",
        "zoekt al een mooie achtergrond",
        "eerst even praten"
      ],
      "c32": [
        "Maak ik je vrolijker?",
        "altijd",
        "met jou is zelfs verdriet lichter"
      ],
      "c33": [
        "Ontbijten we morgen samen?",
        "maakt al warme chocomel",
        "droomt van uitslapen"
      ],
      "c34": [
        "Weet je mijn verjaardag nog?",
        "zonder herinnering",
        "plant stiekem een verrassing"
      ],
      "c35": [
        "Gaan we schaatsen?",
        "pakt de schaatsen al",
        "moedigt je aan vanaf de kant"
      ],
      "c36": [
        "Is het een goede dag voor je?",
        "een geweldige dag",
        "wordt beter als jij er bent"
      ],
      "c37": [
        "Teken je mijn portret?",
        "pakt al een potlood",
        "tekent een hartje"
      ],
      "c38": [
        "Planten we samen een boom?",
        "kiest de plek",
        "begint met een bloem op de vensterbank"
      ],
      "c39": [
        "Wil je een compliment horen?",
        "kan niet wachten",
        "is verlegen, maar wil het heel graag"
      ],
      "c40": [
        "Spelen we straks nog een keer?",
        "wil nog een ronde",
        "knuffelt liever dan te spelen"
      ]
    },
    "loves": {
      "s01": [
        "Waar op vakantie?",
        "Strand",
        "Bergen",
        "Reizen",
        "Even alleen"
      ],
      "s02": [
        "De perfecte avond?",
        "Film thuis",
        "Wandeling",
        "Restaurant",
        "Bordspellen"
      ],
      "s03": [
        "Favoriete weer?",
        "Zon",
        "Regen",
        "Sneeuw",
        "Sterrennacht"
      ],
      "s04": [
        "Favoriete dier?",
        "Kitten",
        "Puppy",
        "Paard",
        "Dolfijn"
      ],
      "s05": [
        "Wat eten we?",
        "Pizza",
        "Sushi",
        "Gebak",
        "Barbecue"
      ],
      "s06": [
        "Favoriete drankje?",
        "Koffie",
        "Thee",
        "Warme chocomel",
        "Limonade"
      ],
      "s07": [
        "Favoriete seizoen?",
        "Lente",
        "Zomer",
        "Herfst",
        "Winter"
      ],
      "s08": [
        "Favoriete bloemen?",
        "Rozen",
        "Tulpen",
        "Zonnebloemen",
        "Lavendel"
      ],
      "s09": [
        "Hoe ontspannen?",
        "Met een boek",
        "Tekenen",
        "Fietsen",
        "Dutje in de hangmat"
      ],
      "s10": [
        "Hoe reizen?",
        "Met de trein",
        "Met het vliegtuig",
        "Met de auto",
        "Met de boot"
      ],
      "s11": [
        "Droomhuis?",
        "Stadsappartement",
        "Huis aan zee",
        "Berghut",
        "Boerderij"
      ],
      "s12": [
        "Iets zoets?",
        "IJs",
        "Chocolade",
        "Taart",
        "Fruit"
      ],
      "s13": [
        "De perfecte ochtend?",
        "Ontbijt op bed",
        "Hardlopen",
        "Uitslapen",
        "Koffie op het balkon"
      ],
      "s14": [
        "Droomdate?",
        "Picknick",
        "IJsbaan",
        "Pretpark",
        "Sterren op het dak"
      ],
      "s15": [
        "Mooiste cadeau?",
        "Een boeket",
        "Een brief",
        "Een reis",
        "Een cadeaudoos"
      ],
      "s16": [
        "Favoriete natuur?",
        "Zee",
        "Bos",
        "Woestijn",
        "Noorderlicht"
      ]
    },
    "who": [
      "Wie van ons is vaker te laat?",
      "Wie van ons maakt het als eerste weer goed?",
      "Wie van ons kookt beter?",
      "Wie van ons lacht vaker?",
      "Wie van ons doet er langer over om zich klaar te maken?",
      "Wie van ons verliest vaker de sleutels?",
      "Wie van ons onthoudt belangrijke datums beter?",
      "Wie van ons is meer een zoetekauw?",
      "Wie van ons valt als eerste in slaap?",
      "Wie van ons staat eerder op?",
      "Wie van ons zegt vaker ‘ik mis je’?",
      "Wie van ons kiest betere cadeaus?",
      "Wie van ons maakt vaker grapjes?",
      "Wie van ons rijdt beter auto?",
      "Wie van ons belt langer?",
      "Wie van ons reist liever?",
      "Wie van ons is sneller gekwetst?",
      "Wie van ons vergeeft sneller?",
      "Wie van ons maakt meer foto’s?",
      "Wie van ons kan beter met geld omgaan?",
      "Wie van ons koopt vaker dingen die we niet nodig hebben?",
      "Wie van ons kan beter troosten?",
      "Wie van ons blijft rustiger in moeilijke momenten?",
      "Wie van ons is altijd de telefoon kwijt?",
      "Wie van ons heeft liever gasten over de vloer?",
      "Wie van ons maakt vaker het ontbijt?",
      "Wie van ons vindt de weg beter in een nieuwe stad?",
      "Wie van ons schrijft langere berichten?",
      "Wie van ons stelt als eerste een wandeling voor?",
      "Wie van ons houdt meer van dieren?",
      "Wie van ons kan beter geheimen bewaren?",
      "Wie van ons doet er langer over om iets van de kaart te kiezen?",
      "Wie van ons maakt zich meer zorgen om dierbaren?",
      "Wie van ons zorgt vaker voor verrassingen?",
      "Wie van ons houdt alles beter op orde?",
      "Wie van ons ziet als eerste een nieuw kapsel?",
      "Wie van ons denkt vaker terug aan grappige verhalen?",
      "Wie van ons heeft meer geduld?",
      "Wie van ons zegt vaker ‘dank je’?",
      "Wie van ons biedt als eerste hulp aan?"
    ],
    "phrases": [
      "Ik glimlach als jij…",
      "Mijn favoriete dag met jou is…",
      "Dank je voor…",
      "Als ik verdrietig ben, helpt het me als…",
      "Ooit wil ik dat wij samen…",
      "De warmste herinnering aan ons is…",
      "Niemand kan zo goed als jij…",
      "Ik voel me rustig als…",
      "Als we een hele vrije dag hadden, zouden we…",
      "Ik ben trots op je omdat…",
      "Onze perfecte avond is…",
      "Ik zal nooit vergeten hoe jij…",
      "Ik vind het fijn als je zegt…",
      "Volgend jaar wil ik dat wij…",
      "Voor mij ben jij als…",
      "Het mooiste cadeau van jou is…",
      "Ik mis je als…",
      "We zijn het grappigst als…",
      "Ik wil je al lang zeggen…",
      "Onze plek is…",
      "Als ik aan jou denk, …",
      "Je maakt mijn dag mooier als…",
      "Ik hou van onze gewoonte om…",
      "Mijn wens voor ons: …",
      "Het grappigste wat ons ooit overkwam, was…",
      "Ik voel dat je om me geeft als je…",
      "Een ochtend met jou is…",
      "Als wij één woord waren, zou het zijn…",
      "Ik wil van jou leren hoe je…",
      "Dank je dat je altijd…"
    ]
  },
  "tr": {
    "text": {
      "homeLink": "İki kişilik oyunlar",
      "eyebrow": "GLOWLETTER · İKİ KİŞİLİK OYUNLAR",
      "title": "Birlikte oynayın",
      "close": "Kapat",
      "lead": "Değer verdiğin birine bir oyun gönder. Bağlantıdan oynamak ücretsizdir ve hesap gerektirmez.",
      "quizTitle": "Beni ne kadar tanıyorsun?",
      "quizNote": "Kendinle ilgili soruları yanıtla, yakının da tahmin etmeye çalışsın. Sonuç sana gelir.",
      "create": "Test oluştur",
      "soon": "Yakında",
      "soonTitle": "Yeni oyunlar yolda",
      "duel": "“Kim daha hızlı” düellosu",
      "loves": "Neleri seviyoruz",
      "cards": "İki kişilik hafıza kartları",
      "who": "Hangimiz?",
      "phrase": "Cümleyi tamamla",
      "myQuizzes": "Testlerim",
      "noQuizzes": "Henüz test yok. İlkini oluşturmak birkaç dakika sürer.",
      "forWhom": "Kime: {name}",
      "noRecipient": "Test",
      "resultsCount": "Sonuçlar: {count}",
      "newResults": "Yeni: {count}",
      "noResults": "Henüz kimse oynamadı.",
      "anonymous": "İsimsiz",
      "results": "Sonuçlar",
      "copyLink": "Bağlantıyı kopyala",
      "share": "Gönder",
      "deleteQuiz": "Testi sil",
      "deleteConfirm": "Bu test ve sonuçları silinsin mi? Bağlantı artık çalışmayacak.",
      "deleted": "Test silindi",
      "linkCopied": "Bağlantı kopyalandı",
      "back": "Geri",
      "next": "İleri",
      "stepNames": "Adım 1/2 · İsimler",
      "yourName": "Adın",
      "yourNamePlaceholder": "Adın ne",
      "recipient": "Kime · isteğe bağlı",
      "recipientPlaceholder": "Sevdiğin kişinin adı",
      "nameRequired": "Adını yaz.",
      "forbiddenName": "Sıradan bir isim yaz.",
      "stepAnswers": "Adım 2/2 · Senin yanıtların",
      "answersLead": "Senin için doğru olanı işaretle. Her soru değiştirilebilir.",
      "swap": "Başka soru",
      "progress": "{total} sorudan {done} yanıtlandı",
      "answerAll": "Her soru için bir yanıt seç.",
      "finish": "Bağlantıyı al",
      "creating": "Test oluşturuluyor…",
      "createdTitle": "Testin hazır!",
      "createdLead": "Bağlantıyı gönder. Yanıt gelince sonuç “Testlerim” bölümünde görünür.",
      "shareText": "{name} seni “Beni ne kadar tanıyorsun?” oyununa davet ediyor",
      "signInTitle": "Giriş yapman gerekiyor",
      "signInNote": "Sonuçların sana ulaşması için test hesabında saklanır.",
      "signIn": "Giriş yap",
      "premiumNote": "Oyun oluşturmak tam erişime dahildir. Bağlantıdan oynamak herkes için ücretsizdir.",
      "failed": "Olmadı. Bağlantını kontrol edip yeniden dene.",
      "rateLimited": "Çok fazla deneme. Daha sonra yeniden dene.",
      "playEyebrow": "İKİ KİŞİLİK OYUN",
      "playInvite": "{name} seni oyuna davet ediyor",
      "playLead": "Soru sayısı: {count}. Yanıtları tahmin et — sonunda kaç tanesinin eşleştiğini göreceksin.",
      "playName": "Adın · isteğe bağlı",
      "playNamePlaceholder": "Seni tanısınlar diye",
      "start": "Başla",
      "playLoading": "Oyun yükleniyor…",
      "playMissing": "Bu oyun kullanılamıyor: bağlantı silinmiş ya da süresi dolmuş.",
      "playOffline": "Oyun için internet bağlantısı gerekir.",
      "retry": "Yeniden dene",
      "questionOf": "Soru {n}/{total}",
      "asks": "{name} soruyor",
      "counting": "Eşleşmeler sayılıyor…",
      "scoreOf": "{score}/{total}",
      "tierAll": "Mükemmel! Birbirinizi herkesten iyi tanıyorsunuz",
      "tierHigh": "Birbirinizi çok iyi tanıyorsunuz",
      "tierMid": "Fena değil! Keşfedecek daha çok şey var",
      "tierLow": "Önünüzde pek çok güzel keşif var",
      "sentTo": "{name} sonucunu görecek",
      "review": "Yanıtların",
      "rightAnswer": "Doğru yanıt",
      "makeOwn": "Kendi testimi oluştur",
      "home": "Ana sayfa",
      "resultToast": "{name}: “Beni ne kadar tanıyorsun?” testinde {score}/{total}",
      "ownerAnswers": "Testi hazırlayanın yanıtları",
      "playerAnswers": "{name} adlı kişinin yanıtları",
      "paywallTitle": "Oyunlar, eğlence<br><em>ve mektuplar</em>",
      "groupGames": "Oyunlar",
      "groupFun": "Eğlence",
      "groupLetters": "Mektuplar",
      "featQuiz": "“Beni ne kadar tanıyorsun?” — sonuç sana gelir",
      "featGamesSoon": "“Kim daha hızlı” düellosu, “Neleri seviyoruz”, ayıcıklı hafıza kartları",
      "featFunSoon": "“Hangimiz?” ve çiftin kitabıyla “Cümleyi tamamla”",
      "featCollection": "25 dilde mektup ve şiirlerin tüm koleksiyonu",
      "featMoments": "Anlar, hatırlatıcılar ve doğru günde açılan QR mektup",
      "featAudio": "Mektupta kendi sesin ve alıcının yanıtı",
      "ynTitle": "Evet mi hayır mı",
      "ynNote": "İki kişilik canlı oyun: her kart için 5 saniye. Zamanında yanıtlayan, karşısındakinin yanıtını görür.",
      "ynCreate": "Oda oluştur",
      "ynWaiting": "{name} bağlantıyı açana kadar bekliyoruz…",
      "ynWaitingAny": "Diğer oyuncuyu bekliyoruz…",
      "ynShareText": "{name} seni canlı “Evet mi hayır mı” oyununa davet ediyor",
      "ynPartnerHere": "{name} burada!",
      "ynStart": "Oyunu başlat",
      "ynWaitHost": "{name} birazdan oyunu başlatacak",
      "ynYes": "Evet",
      "ynNo": "Hayır",
      "ynMissed": "Geç kaldın — bu kart kapalı kalıyor",
      "ynMatch": "Aynı yanıt!",
      "ynRound": "Kart {n}/{total}",
      "ynAnswered": "Yanıt gönderildi, diğer oyuncu bekleniyor…",
      "ynFinal": "{total} kartta {score} eşleşme",
      "ynFinalHigh": "Birbirinizi sözsüz anlıyorsunuz",
      "ynFinalMid": "Çok farklı — ve çok yakın",
      "ynAgain": "Tekrar oyna",
      "ynLeft": "Diğer oyuncunun bağlantısı koptu. Dönmesini bekliyoruz…",
      "ynYou": "Sen",
      "ynOffline": "Oyuna bağlanılamıyor. İnterneti kontrol edip bağlantıyı yeniden aç.",
      "ynJoin": "Oyuna katıl",
      "ynJoinLead": "{name} seni bekliyor. Her yanıt için 5 saniye!",
      "ynStepNames": "Senin ve diğer oyuncunun adı",
      "ynRoomReady": "Oda hazır — bağlantıyı gönder",
      "ynStayHere": "Bu ekranı kapatma: bağlantı açılınca oyun başlar.",
      "featYesNo": "Canlı “Evet mi hayır mı” oyunu — yanıt başına 5 saniye",
      "ynPartnerMissed": "Yanıt yok — süre doldu",
      "lvTitle": "Neleri seviyoruz",
      "lvNote": "İki kişilik canlı oyun: 4 resim, en sevdiğini seçmek için 10 saniye. Aynısını da seçebilirsiniz!",
      "lvShareText": "{name} seni canlı “Neleri seviyoruz” oyununa davet ediyor",
      "lvJoinLead": "{name} seni bekliyor. En sevdiğin resmi seç!",
      "lvRound": "Konu {n}/{total}",
      "lvPick": "En sevdiğini seç",
      "lvBoth": "İkiniz de seçtiniz: {item}",
      "lvCommon": "İkinizin de sevdikleri",
      "lvDiff": "Farklı zevkler — daha da ilginç!",
      "lvFinalHigh": "Ne çok ortak noktanız var!",
      "lvFinalMid": "Çok farklısınız — ve birbirinizi tamamlıyorsunuz",
      "featLoves": "Canlı “Neleri seviyoruz” oyunu — 4 resim, birlikte seçin",
      "featGamesSoon2": "“Kim daha hızlı” düellosu ve ayıcıklı hafıza kartları",
      "mcTitle": "Ayıcıklı hafıza kartları",
      "mcNote": "İki kişilik canlı hafıza oyunu: sırayla ikişer kart açın ve eşleri bulun. 8’den 16 karta üç seviye.",
      "mcShareText": "{name} seni canlı “Ayıcıklı hafıza kartları” oyununa davet ediyor",
      "mcJoinLead": "{name} seni bekliyor. Eşleri sırayla bulun!",
      "mcLevel": "Seviye {n}/{total}",
      "mcTurnYou": "Sıra sende — iki kart aç",
      "mcTurnThem": "Sıra {name} adlı kişide",
      "mcPairs": "Bulunan eşler: {found}/{total}",
      "mcLevelDone": "Tüm eşler bulundu!",
      "mcTimeUp": "Bu seviyenin süresi doldu",
      "mcNext": "Sırada: seviye {n}",
      "mcFinal": "Bulunan eşler: {found}/{total}",
      "mcFinalHigh": "Harika bir takım!",
      "mcFinalMid": "Güzel oyundu — bir daha?",
      "featCards": "Canlı “Ayıcıklı hafıza kartları” — eşleri birlikte bulun",
      "featGamesSoon3": "“Kim daha hızlı” düellosu",
      "duTitle": "Kim daha hızlı",
      "duNote": "Canlı düello: bir kelime ve dört resim. Doğru resme ilk siz dokunun — yanlış dokunuş turu kaybettirir.",
      "duShareText": "{name} size “Kim daha hızlı” canlı düellosunda meydan okuyor",
      "duJoinLead": "{name} sizi bekliyor. Doğru resmi daha hızlı bulun!",
      "duRound": "Tur {n} / {total}",
      "duFind": "Bulun: {item}",
      "duYouWon": "Siz daha hızlıydınız!",
      "duTheyWon": "Daha hızlı: {name}",
      "duWrong": "Yanlış resim — bu tur kaybedildi",
      "duNobody": "Kimse zamanında bulamadı",
      "duScore": "Siz {you} : {them} {name}",
      "duFinalWin": "Zafer! Bugün gözleriniz çok keskin.",
      "duFinalLose": "Bu sefer kazanan: {name} — rövanş?",
      "duFinalDraw": "Berabere — tam denk geldiniz!",
      "duSeconds": "{s} sn",
      "featDuel": "“Kim daha hızlı” canlı düellosu — resmi ilk siz bulun",
      "whoTitle": "Hangimiz?",
      "whoNote": "İki kişilik canlı oyun: bir soru, “Ben”e ya da partnerinizin adına dokunun. Birbiriniz hakkında aynı fikirde misiniz, görün.",
      "whoShareText": "{name} sizi “Hangimiz?” canlı oyununa davet ediyor",
      "whoJoinLead": "{name} sizi bekliyor. Dürüstçe cevaplayın — sonra karşılaştırın!",
      "whoRound": "Soru {n} / {total}",
      "whoMe": "Ben",
      "whoAgree": "Aynı fikirdesiniz: {name}",
      "whoDiffer": "Fikirler farklı — konuşun!",
      "whoFinal": "{total} sorudan {score} tanesinde aynı fikirdeydiniz",
      "whoFinalHigh": "Birbirinizi ne kadar net görüyorsunuz!",
      "whoFinalMid": "Konuşacak çok şey var — bu da çok güzel",
      "featWho": "“Hangimiz?” canlı oyunu — aynı fikirde misiniz?",
      "phTitle": "Cümleyi tamamla",
      "phNote": "İki kişilik canlı oyun: ikiniz de aynı sıcak cümleyi kendi sözlerinizle tamamlarsınız, sonra birbirinizin cevaplarını okursunuz.",
      "phShareText": "{name} sizi “Cümleyi tamamla” canlı oyununa davet ediyor",
      "phJoinLead": "{name} sizi bekliyor. Her cümleyi kendi sözlerinizle tamamlayın!",
      "phRound": "Cümle {n} / {total}",
      "phPlaceholder": "Sizin devamınız…",
      "phDone": "Tamam",
      "phWaiting": "{name} bekleniyor…",
      "phSkipped": "Cevap yok",
      "phSave": "Çiftin kitabına kaydet",
      "phSaved": "Çiftin kitabına kaydedildi",
      "phForbidden": "Lütfen bağlantı ve kaba sözler olmadan yazın.",
      "phNext": "Sonraki cümle",
      "phFinal": "Birlikte tamamlanan cümleler: {count}",
      "phFinalLead": "En sevdiğiniz cevapları çiftin kitabına kaydedin.",
      "featPhrase": "Çiftin kitabıyla “Cümleyi tamamla” canlı oyunu",
      "bookTitle": "Çiftin kitabı",
      "bookNote": "“Cümleyi tamamla” oyunundan en sıcak cevaplar, hesabınızda saklanır.",
      "bookOpen": "Kitabı aç",
      "bookEmpty": "Kitap şimdilik boş. “Cümleyi tamamla” oynayın ve beğendiğiniz cevapları kaydedin.",
      "bookDelete": "Sil",
      "bookDeleteConfirm": "Bu sayfa kitaptan silinsin mi?",
      "bookYou": "Siz",
      "inviteTitle": "Arkadaş davet et",
      "inviteNote": "Arkadaşınıza oyunla ilgili bir mesaj gelecek.",
      "invite": "Davet et",
      "invited": "Davet edildi",
      "inviteNone": "Tek dokunuşla davet etmek için “Arkadaşlar” bölümünden arkadaş ekleyin.",
      "inviteSent": "Davet gönderildi: {name}"
    },
    "questions": {
      "q01": [
        "En sevdiğim mevsim?",
        "İlkbahar",
        "Yaz",
        "Sonbahar",
        "Kış"
      ],
      "q02": [
        "Kahvaltıda ne seçerim?",
        "Kahve ve kruvasan",
        "Yulaf lapası",
        "Yumurta",
        "Sadece çay"
      ],
      "q03": [
        "Mükemmel tatil günüm?",
        "Evde battaniye altında",
        "Parkta yürüyüş",
        "Şehir dışına kaçamak",
        "Arkadaşlarla buluşma"
      ],
      "q04": [
        "Nereye gitmeyi hayal ediyorum?",
        "Denize",
        "Dağlara",
        "Büyük bir şehre",
        "Köyde şirin bir eve"
      ],
      "q05": [
        "En sevdiğim dondurma?",
        "Vanilyalı",
        "Çikolatalı",
        "Çilekli",
        "Fıstıklı"
      ],
      "q06": [
        "Beni en çabuk ne mutlu eder?",
        "Sarılmak",
        "Sürpriz",
        "Tatlı sözler",
        "Lezzetli bir şey"
      ],
      "q07": [
        "Ben daha çok…",
        "Sabah insanıyım",
        "Gece kuşuyum",
        "Fırsat buldukça uyurum",
        "Öğle uykusu severim"
      ],
      "q08": [
        "Bu akşam hangi filmi seçerim?",
        "Komedi",
        "Romantik bir hikâye",
        "Polisiye",
        "Animasyon"
      ],
      "q09": [
        "En sevdiğim renk?",
        "Kırmızı",
        "Mavi",
        "Yeşil",
        "Pembe"
      ],
      "q10": [
        "En çok neden korkarım?",
        "Örümceklerden",
        "Yükseklikten",
        "Karanlıktan",
        "Geç kalmaktan"
      ],
      "q11": [
        "Hangi çiçekleri severim?",
        "Gül",
        "Lale",
        "Şakayık",
        "Papatya"
      ],
      "q12": [
        "Üzgünken ne yaparım?",
        "Sevdiklerimi ararım",
        "Tatlı bir şey yerim",
        "Yürüyüşe çıkarım",
        "Uyurum"
      ],
      "q13": [
        "Bana en yakın hayvan hangisi?",
        "Kedi yavrusu",
        "Köpek",
        "Ayı yavrusu",
        "Küçük tilki"
      ],
      "q14": [
        "Benim için en güzel hediye?",
        "El yapımı bir şey",
        "Bir seyahat",
        "Bir takı",
        "Bir kitap"
      ],
      "q15": [
        "En sevdiğim içecek?",
        "Siyah çay",
        "Yeşil çay",
        "Kahve",
        "Sıcak çikolata"
      ],
      "q16": [
        "En sevdiğim atıştırmalık?",
        "Çikolata",
        "Cips",
        "Meyve",
        "Pasta"
      ],
      "q17": [
        "Seyahatte neyi seçerim?",
        "Müzeler",
        "Plaj",
        "Yerel mutfak",
        "Plansız gezmek"
      ],
      "q18": [
        "Akşamı nasıl geçirmeyi severim?",
        "Kitapla",
        "Diziyle",
        "Sohbet ederek",
        "Yürüyüşte"
      ],
      "q19": [
        "Hangi hava içimi açar?",
        "Güneş",
        "Ilık yağmur",
        "Kar yağışı",
        "Hafif rüzgâr"
      ],
      "q20": [
        "Hangi süper güç bana yakışır?",
        "Uçmak",
        "Akıl okumak",
        "Zamanı durdurmak",
        "Işınlanmak"
      ],
      "q21": [
        "Sevdiklerimde en çok neye önem veririm?",
        "Güven",
        "İlgi",
        "Mizah",
        "Destek"
      ],
      "q22": [
        "En çok hangi günü beklerim?",
        "Yılbaşı",
        "Doğum günüm",
        "Yaz tatili",
        "Sevgililer Günü"
      ],
      "q23": [
        "“Seni seviyorum”u en çok nasıl söylerim?",
        "Sözlerle",
        "Davranışlarla",
        "Sarılarak",
        "Hediyelerle"
      ],
      "q24": [
        "Kafede ne sipariş ederim?",
        "Makarna",
        "Suşi",
        "Salata",
        "Tatlı"
      ],
      "q25": [
        "Günün en sevdiğim zamanı?",
        "Sabah",
        "Öğleden sonra",
        "Akşam",
        "Gece"
      ],
      "q26": [
        "Hangi mutfağı seçerim?",
        "İtalyan",
        "Japon",
        "Ev yemekleri",
        "Meksika"
      ],
      "q27": [
        "En iyi nerede düşünürüm?",
        "Duşta",
        "Yürürken",
        "Yolculukta",
        "Uyumadan önce"
      ],
      "q28": [
        "Sabah ilk iş ne yaparım?",
        "Telefonuma bakarım",
        "Su içerim",
        "Kahve yaparım",
        "Biraz daha yatakta kalırım"
      ],
      "q29": [
        "En sevdiğim meyve?",
        "Elma",
        "Muz",
        "Mango",
        "Karpuz"
      ],
      "q30": [
        "Hangi hobi bana en uygun?",
        "Resim",
        "Yemek yapmak",
        "Spor",
        "Kitap okumak"
      ],
      "q31": [
        "Doğum günümü nasıl kutlamak isterim?",
        "Büyük bir partiyle",
        "Baş başa bir akşam yemeğiyle",
        "Bir geziyle",
        "Evde sakin bir akşamla"
      ],
      "q32": [
        "Sürprizler hakkında ne düşünürüm?",
        "Bayılırım",
        "Biraz heyecanlandırır",
        "Başkalarına yapmayı severim",
        "Önceden bilmeyi tercih ederim"
      ],
      "q33": [
        "Hangi tatlıyı tercih ederim?",
        "Pasta",
        "Dondurma",
        "Kurabiye",
        "Şeker"
      ],
      "q34": [
        "Issız bir adaya ne götürürüm?",
        "Bir kitap",
        "Telefonumu",
        "Bir battaniye",
        "Bir fotoğraf makinesi"
      ],
      "q35": [
        "Zor bir günün ardından nasıl dinlenirim?",
        "Sıcak bir banyo",
        "Bir dizi",
        "Bir yürüyüş",
        "Yakın biriyle sohbet"
      ],
      "q36": [
        "En çok hangi ulaşımı severim?",
        "Tren",
        "Uçak",
        "Araba",
        "Bisiklet"
      ],
      "q37": [
        "Çocukken en sevdiğim oyun?",
        "Saklambaç",
        "Kovalamaca",
        "Lego",
        "Resim yapmak"
      ],
      "q38": [
        "Hangi masal bana en yakın?",
        "Külkedisi",
        "Küçük Prens",
        "Winnie the Pooh",
        "Alice Harikalar Diyarında"
      ],
      "q39": [
        "Sevdiğim birini neyle sevindiririm?",
        "Bir sürprizle",
        "Bir kartla",
        "Bir geziyle",
        "Bir akşam yemeğiyle"
      ],
      "q40": [
        "En çok neyin fotoğrafını çekerim?",
        "Kendimin",
        "Doğanın",
        "Yemeklerin",
        "Neredeyse hiç çekmem"
      ],
      "q41": [
        "Evde en sevdiğim yer?",
        "Yatak",
        "Mutfak",
        "Kanepe",
        "Balkon"
      ],
      "q42": [
        "Bir insanda ilk neyi fark ederim?",
        "Gülüşünü",
        "Gözlerini",
        "Sesini",
        "Mizah anlayışını"
      ],
      "q43": [
        "Beni en çabuk ne güldürür?",
        "Komik videolar",
        "Sevdiklerimin şakaları",
        "Garip durumlar",
        "Hayvanlar"
      ],
      "q44": [
        "Sıcak bir yaz gününde ne içerim?",
        "Limonata",
        "Soğuk çay",
        "Meyve suyu",
        "Buzlu su"
      ],
      "q45": [
        "Hangi element bana en yakın?",
        "Su",
        "Ateş",
        "Toprak",
        "Hava"
      ],
      "q46": [
        "Hangi hikâyeleri severim?",
        "Macera",
        "Aşk",
        "Bilim kurgu",
        "Gerçek hikâyeler"
      ],
      "q47": [
        "Yağmurlu bir günü nasıl geçiririm?",
        "Kitap okuyarak",
        "Uyuyarak",
        "Film izleyerek",
        "Şemsiyeyle yürüyerek"
      ],
      "q48": [
        "Bir hediyede en çok neye değer veririm?",
        "İlgiye",
        "İşe yaramasına",
        "Güzelliğine",
        "Sürprize"
      ],
      "q49": [
        "Hangi patatesi seçerim?",
        "Püre",
        "Kızartma",
        "Fırında",
        "Cips"
      ],
      "q50": [
        "Yeni bir şehirde ilk nereye giderim?",
        "Bir kafeye",
        "Bir müzeye",
        "Bir parka",
        "Alışverişe"
      ],
      "q51": [
        "Uyuyamadığımda ne yaparım?",
        "Kitap okurum",
        "Telefonda gezinirim",
        "Koyun sayarım",
        "Ilık süt içerim"
      ],
      "q52": [
        "Önemli bir güne nasıl hazırlanırım?",
        "Her şeyi önceden planlarım",
        "Son dakikaya bırakırım",
        "Yardım isterim",
        "Heyecanlanır, uyuyamam"
      ],
      "q53": [
        "En çok hangi sporu izlemeyi severim?",
        "Futbol",
        "Tenis",
        "Artistik patinaj",
        "Spor izlemem"
      ],
      "q54": [
        "Hangi evcil hayvan bana uygun?",
        "Kedi",
        "Köpek",
        "Papağan",
        "Hamster"
      ],
      "q55": [
        "Nasıl mesajlar yazarım?",
        "Uzun",
        "Kısa",
        "Bol emojili",
        "Sesli mesaj"
      ],
      "q56": [
        "En uzun süre hangi hediyeyi saklarım?",
        "Bir mektup",
        "Bir oyuncak",
        "Bir fotoğraf",
        "Bir takı"
      ],
      "q57": [
        "Hangisini seçerim?",
        "Şömine başında çay",
        "Çimlerde piknik",
        "Deniz kenarında yürüyüş",
        "Sinemaya gitmek"
      ],
      "q58": [
        "Hangi iltifat beni en çok mutlu eder?",
        "Görünüşüme dair",
        "Zekâma dair",
        "İyiliğime dair",
        "Mizah anlayışıma dair"
      ],
      "q59": [
        "Mükemmel sabahım?",
        "Yatakta kahvaltı",
        "Erken koşu",
        "Uzun bir uyku",
        "Balkonda kahve"
      ],
      "q60": [
        "Ne öğrenmek istiyorum?",
        "Dans etmeyi",
        "Yemek yapmayı",
        "Yeni bir dil",
        "Resim yapmayı"
      ]
    },
    "yesNo": {
      "c01": [
        "Şu an beni özlüyor musun?",
        "seni çok özlüyor",
        "dayanıyor ama seni düşünüyor"
      ],
      "c02": [
        "Mesajımı görünce gülümsüyor musun?",
        "hep gülümsüyor",
        "içinden gülümsüyor"
      ],
      "c03": [
        "İlk buluşmamızı hatırlıyor musun?",
        "her dakikasını hatırlıyor",
        "en önemlisini hatırlıyor — seni"
      ],
      "c04": [
        "Bugün sarılmak ister misin?",
        "sarılmanı bekliyor",
        "sarılmaları sonraya saklıyor"
      ],
      "c05": [
        "Birlikte denize gidelim mi?",
        "bavulu hazırlıyor bile",
        "dağların hayalini kuruyor"
      ],
      "c06": [
        "Seni güldürüyor muyum?",
        "içten gülüyor",
        "gülümsemesini saklıyor"
      ],
      "c07": [
        "Yanımda huzurlu musun?",
        "yanında huzur buluyor",
        "seninle çok eğleniyor"
      ],
      "c08": [
        "Gün içinde beni düşünüyor musun?",
        "seni çok sık düşünüyor",
        "şu an seni düşünüyor"
      ],
      "c09": [
        "Sürprizlerimi seviyor musun?",
        "sürprizlerine bayılıyor",
        "en çok yanında olmanı seviyor"
      ],
      "c10": [
        "Birlikte turta yapalım mı?",
        "önlüğü bile taktı",
        "pasta almayı tercih ediyor"
      ],
      "c11": [
        "Akşam birlikte film izleyelim mi?",
        "filmi seçiyor bile",
        "sadece sohbet etmek istiyor"
      ],
      "c12": [
        "Sesimi seviyor musun?",
        "durmadan dinleyebilir",
        "gülüşünü daha çok seviyor"
      ],
      "c13": [
        "Hafta sonu piknik yapalım mı?",
        "battaniyeyi hazırlıyor",
        "seni şirin bir kafeye çağırıyor"
      ],
      "c14": [
        "Benden mektup almak ister misin?",
        "mektubunu bekliyor",
        "her şeyi yüz yüze duymak istiyor"
      ],
      "c15": [
        "Senin için önemli miyim?",
        "çok önemlisin",
        "düşündüğünden de fazla"
      ],
      "c16": [
        "Yağmurda yürüyelim mi?",
        "iki kişilik şemsiye alıyor",
        "evde çay demleyecek"
      ],
      "c17": [
        "Birbirimize benziyor muyuz?",
        "iki yarım gibisiniz",
        "birbirinizi harika tamamlıyorsunuz"
      ],
      "c18": [
        "Yemeklerimi seviyor musun?",
        "bir tabak daha istiyor",
        "seninle birlikte yemek yapmayı seviyor"
      ],
      "c19": [
        "Birlikte bir evcil hayvan alalım mı?",
        "ismini seçiyor bile",
        "şimdilik bir oyuncak ayı yeter"
      ],
      "c20": [
        "Neleri sevdiğimi biliyor musun?",
        "ezbere biliyor",
        "daha fazlasını öğrenmek istiyor"
      ],
      "c21": [
        "Dans edelim mi?",
        "elini uzatıyor bile",
        "alkışlayacak"
      ],
      "c22": [
        "Sana ilham veriyor muyum?",
        "her gün ilham veriyorsun",
        "yanında sadece sıcacık hissediyor"
      ],
      "c23": [
        "Fotoğraflarımızı saklıyor musun?",
        "her birini özenle saklıyor",
        "yenilerini, daha güzellerini bekliyor"
      ],
      "c24": [
        "Gün doğumunu birlikte izleyelim mi?",
        "alarm kuruyor",
        "gün batımını tercih ediyor"
      ],
      "c25": [
        "Bana bir sır verir misin?",
        "kulağına fısıldayacak",
        "sır olarak kalsın"
      ],
      "c26": [
        "Bana inanıyor musun?",
        "sana çok inanıyor",
        "her gün seni destekliyor"
      ],
      "c27": [
        "Sadece ikimiz seyahate çıkalım mı?",
        "bunun hayalini kuruyor",
        "tüm sevdiklerini götürecek"
      ],
      "c28": [
        "Aramamı bekliyor musun?",
        "gülümseyerek bekliyor",
        "gelmeni tercih ediyor"
      ],
      "c29": [
        "Sarılmalarımı seviyor musun?",
        "dünyanın en sıcakları",
        "el ele tutuşmayı seviyor"
      ],
      "c30": [
        "Birbirimize sesli kitap okuyalım mı?",
        "kitabı seçiyor bile",
        "seni dinlemeyi tercih ediyor"
      ],
      "c31": [
        "Bugün birlikte fotoğraf çekelim mi?",
        "güzel bir arka plan arıyor",
        "önce biraz sohbet"
      ],
      "c32": [
        "Moralini yükseltiyor muyum?",
        "her zaman",
        "seninle hüzün bile daha hafif"
      ],
      "c33": [
        "Yarın birlikte kahvaltı yapalım mı?",
        "kakaoyu hazırlıyor bile",
        "uzun uzun uyumayı hayal ediyor"
      ],
      "c34": [
        "Doğum günümü hatırlıyor musun?",
        "hatırlatmaya gerek yok",
        "gizlice sürpriz hazırlıyor"
      ],
      "c35": [
        "Buz pateni yapmaya gidelim mi?",
        "patenleri çıkarıyor",
        "kenardan seni destekleyecek"
      ],
      "c36": [
        "Bugün senin için güzel bir gün mü?",
        "harika bir gün",
        "sen yanındayken daha güzel olacak"
      ],
      "c37": [
        "Portremi çizer misin?",
        "kalemi aldı bile",
        "küçük bir kalp çizecek"
      ],
      "c38": [
        "Birlikte ağaç dikelim mi?",
        "yeri seçiyor",
        "pencere önündeki bir çiçekle başlayacak"
      ],
      "c39": [
        "Bir iltifat duymak ister misin?",
        "sabırsızlıkla bekliyor",
        "utanıyor ama çok istiyor"
      ],
      "c40": [
        "Sonra bir daha oynayalım mı?",
        "bir tur daha istiyor",
        "oyun yerine sarılmak istiyor"
      ]
    },
    "loves": {
      "s01": [
        "Tatil nerede?",
        "Plaj",
        "Dağlar",
        "Seyahat",
        "Yalnız kalmak"
      ],
      "s02": [
        "Mükemmel akşam?",
        "Evde film",
        "Yürüyüş",
        "Restoran",
        "Kutu oyunları"
      ],
      "s03": [
        "En sevdiğin hava?",
        "Güneş",
        "Yağmur",
        "Kar",
        "Yıldızlı gece"
      ],
      "s04": [
        "En sevdiğin hayvan?",
        "Kedi yavrusu",
        "Köpek yavrusu",
        "At",
        "Yunus"
      ],
      "s05": [
        "Akşam yemeği?",
        "Pizza",
        "Suşi",
        "Pastalar",
        "Mangal"
      ],
      "s06": [
        "En sevdiğin içecek?",
        "Kahve",
        "Çay",
        "Sıcak çikolata",
        "Limonata"
      ],
      "s07": [
        "En sevdiğin mevsim?",
        "İlkbahar",
        "Yaz",
        "Sonbahar",
        "Kış"
      ],
      "s08": [
        "En sevdiğin çiçekler?",
        "Güller",
        "Laleler",
        "Ayçiçekleri",
        "Lavanta"
      ],
      "s09": [
        "Nasıl dinlenirsin?",
        "Kitapla",
        "Resim yaparak",
        "Bisikletle",
        "Hamakta uyuyarak"
      ],
      "s10": [
        "Nasıl seyahat edersin?",
        "Trenle",
        "Uçakla",
        "Arabayla",
        "Gemiyle"
      ],
      "s11": [
        "Hayalindeki ev?",
        "Şehirde daire",
        "Deniz kenarında ev",
        "Dağda kulübe",
        "Çiftlik"
      ],
      "s12": [
        "Tatlı bir şey?",
        "Dondurma",
        "Çikolata",
        "Pasta",
        "Meyve"
      ],
      "s13": [
        "Mükemmel sabah?",
        "Yatakta kahvaltı",
        "Koşu",
        "Uzun uyku",
        "Balkonda kahve"
      ],
      "s14": [
        "Hayalindeki buluşma?",
        "Piknik",
        "Buz pisti",
        "Lunapark",
        "Çatıda yıldızlar"
      ],
      "s15": [
        "En güzel hediye?",
        "Çiçek buketi",
        "Mektup",
        "Seyahat",
        "Hediye kutusu"
      ],
      "s16": [
        "En sevdiğin doğa?",
        "Deniz",
        "Orman",
        "Çöl",
        "Kuzey ışıkları"
      ]
    },
    "who": [
      "Hangimiz daha sık geç kalır?",
      "Hangimiz ilk barışır?",
      "Hangimiz daha iyi yemek yapar?",
      "Hangimiz daha sık güler?",
      "Hangimiz daha uzun sürede hazırlanır?",
      "Hangimiz anahtarları daha sık kaybeder?",
      "Hangimiz önemli tarihleri daha iyi hatırlar?",
      "Hangimiz tatlıyı daha çok sever?",
      "Hangimiz önce uyuyakalır?",
      "Hangimiz daha erken kalkar?",
      "Hangimiz daha sık “Seni özledim” der?",
      "Hangimiz daha güzel hediyeler seçer?",
      "Hangimiz daha sık şaka yapar?",
      "Hangimiz daha iyi araba kullanır?",
      "Hangimiz telefonda daha uzun konuşur?",
      "Hangimiz seyahat etmeyi daha çok sever?",
      "Hangimiz daha çabuk kırılır?",
      "Hangimiz daha çabuk affeder?",
      "Hangimiz daha çok fotoğraf çeker?",
      "Hangimiz parayı daha iyi idare eder?",
      "Hangimiz gereksiz şeyleri daha sık satın alır?",
      "Hangimiz teselli etmekte daha iyidir?",
      "Hangimiz zor anlarda daha sakin kalır?",
      "Hangimiz telefonunu sürekli arar?",
      "Hangimiz misafir ağırlamayı daha çok sever?",
      "Hangimiz kahvaltıyı daha sık hazırlar?",
      "Hangimiz yeni bir şehirde yolunu daha iyi bulur?",
      "Hangimiz daha uzun mesajlar yazar?",
      "Hangimiz yürüyüşe çıkmayı ilk önerir?",
      "Hangimiz hayvanları daha çok sever?",
      "Hangimiz sırları daha iyi saklar?",
      "Hangimiz menüden seçim yaparken daha uzun düşünür?",
      "Hangimiz sevdikleri için daha çok endişelenir?",
      "Hangimiz daha çok sürpriz yapar?",
      "Hangimiz daha düzenlidir?",
      "Hangimiz yeni bir saç kesimini ilk fark eder?",
      "Hangimiz komik hikâyeleri daha sık hatırlar?",
      "Hangimiz daha sabırlıdır?",
      "Hangimiz daha sık “teşekkürler” der?",
      "Hangimiz yardım etmeyi ilk önerir?"
    ],
    "phrases": [
      "Şunu yaptığında gülümsüyorum: …",
      "Seninle en sevdiğim gün…",
      "Sana teşekkür ederim, çünkü…",
      "Üzgün olduğumda bana iyi gelen…",
      "Bir gün birlikte…",
      "Bizimle ilgili en sıcak anım…",
      "En iyi yaptığın şey…",
      "Kendimi huzurlu hissettiğim an…",
      "Bütün bir boş günümüz olsa…",
      "Seninle gurur duyuyorum, çünkü…",
      "Mükemmel akşamımız…",
      "Senin şu hâlini hiç unutmayacağım: …",
      "Şunu söylemen hoşuma gidiyor: …",
      "Gelecek yıl birlikte…",
      "Benim için sen tıpkı…",
      "Senden aldığım en güzel hediye…",
      "Seni en çok özlediğim an…",
      "En komik hâlimiz…",
      "Uzun zamandır sana söylemek istediğim şey…",
      "Bizim yerimiz…",
      "Seni düşündüğümde…",
      "Günümü güzelleştiriyorsun, özellikle…",
      "Sevdiğim alışkanlığımız…",
      "Bizim için dileğim: …",
      "Başımıza gelen en komik şey…",
      "İlgini en çok hissettiğim an…",
      "Seninle bir sabah…",
      "Bizi tek kelimeyle anlatsam…",
      "Senden öğrenmek istediğim şey…",
      "Teşekkürler, çünkü sen her zaman…"
    ]
  },
  "ro": {
    "text": {
      "homeLink": "Jocuri în doi",
      "eyebrow": "GLOWLETTER · JOCURI ÎN DOI",
      "title": "Jucați împreună",
      "close": "Închide",
      "lead": "Trimite un joc cuiva drag. Jocul dintr-un link este gratuit și nu cere cont.",
      "quizTitle": "Cât de bine mă cunoști?",
      "quizNote": "Răspunde la întrebări despre tine, iar cineva apropiat încearcă să ghicească. Rezultatul vine la tine.",
      "create": "Creează un test",
      "soon": "În curând",
      "soonTitle": "Pregătim alte jocuri",
      "duel": "Duelul „Cine e mai rapid”",
      "loves": "Ce iubim",
      "cards": "Cărți de memorie în doi",
      "who": "Care dintre noi?",
      "phrase": "Completează fraza",
      "myQuizzes": "Testele mele",
      "noQuizzes": "Încă nu ai teste. Primul se face în câteva minute.",
      "forWhom": "Pentru {name}",
      "noRecipient": "Test",
      "resultsCount": "Rezultate: {count}",
      "newResults": "Noi: {count}",
      "noResults": "Nimeni nu a jucat încă.",
      "anonymous": "Fără nume",
      "results": "Rezultate",
      "copyLink": "Copiază linkul",
      "share": "Trimite",
      "deleteQuiz": "Șterge testul",
      "deleteConfirm": "Ștergi testul și rezultatele lui? Linkul nu va mai funcționa.",
      "deleted": "Test șters",
      "linkCopied": "Link copiat",
      "back": "Înapoi",
      "next": "Mai departe",
      "stepNames": "Pasul 1 din 2 · Nume",
      "yourName": "Numele tău",
      "yourNamePlaceholder": "Cum te cheamă",
      "recipient": "Pentru cine · opțional",
      "recipientPlaceholder": "Numele persoanei dragi",
      "nameRequired": "Scrie-ți numele.",
      "forbiddenName": "Scrie un nume obișnuit.",
      "stepAnswers": "Pasul 2 din 2 · Răspunsurile tale",
      "answersLead": "Marchează ce e adevărat despre tine. Orice întrebare poate fi schimbată.",
      "swap": "Altă întrebare",
      "progress": "{done} din {total} răspunse",
      "answerAll": "Alege un răspuns la fiecare întrebare.",
      "finish": "Obține linkul",
      "creating": "Creez testul…",
      "createdTitle": "Testul tău e gata!",
      "createdLead": "Trimite linkul. Când persoana răspunde, rezultatul apare în „Testele mele”.",
      "shareText": "{name} te invită la jocul „Cât de bine mă cunoști?”",
      "signInTitle": "Este nevoie de autentificare",
      "signInNote": "Testul rămâne în contul tău, ca rezultatele să ajungă la tine.",
      "signIn": "Autentificare",
      "premiumNote": "Crearea jocurilor face parte din accesul complet. Jocul dintr-un link este gratuit pentru toți.",
      "failed": "Nu a mers. Verifică conexiunea și încearcă din nou.",
      "rateLimited": "Prea multe încercări. Încearcă mai târziu.",
      "playEyebrow": "UN JOC ÎN DOI",
      "playInvite": "{name} te invită la joc",
      "playLead": "Întrebări: {count}. Ghicește răspunsurile — la final vei vedea câte se potrivesc.",
      "playName": "Numele tău · opțional",
      "playNamePlaceholder": "Ca să știe că ești tu",
      "start": "Începe",
      "playLoading": "Se încarcă jocul…",
      "playMissing": "Jocul nu este disponibil: linkul a fost șters sau a expirat.",
      "playOffline": "Jocul are nevoie de internet.",
      "retry": "Încearcă din nou",
      "questionOf": "Întrebarea {n} din {total}",
      "asks": "{name} întreabă",
      "counting": "Număr potrivirile…",
      "scoreOf": "{score} din {total}",
      "tierAll": "Perfect! Vă cunoașteți mai bine ca oricine",
      "tierHigh": "Vă cunoașteți foarte bine",
      "tierMid": "Nu e rău! Mai sunt multe de descoperit",
      "tierLow": "Vă așteaptă multe descoperiri frumoase",
      "sentTo": "{name} va vedea rezultatul tău",
      "review": "Răspunsurile tale",
      "rightAnswer": "Răspunsul corect",
      "makeOwn": "Creează testul meu",
      "home": "Acasă",
      "resultToast": "{name}: {score} din {total} la „Cât de bine mă cunoști?”",
      "ownerAnswers": "Răspunsurile autorului",
      "playerAnswers": "Răspunsurile lui {name}",
      "paywallTitle": "Jocuri, distracție<br><em>și scrisori</em>",
      "groupGames": "Jocuri",
      "groupFun": "Distracție",
      "groupLetters": "Scrisori",
      "featQuiz": "„Cât de bine mă cunoști?” — rezultatul vine la tine",
      "featGamesSoon": "Duelul „Cine e mai rapid”, „Ce iubim”, cărți cu ursuleți",
      "featFunSoon": "„Care dintre noi?” și „Completează fraza” cu cartea cuplului",
      "featCollection": "Întreaga colecție de scrisori și poezii în 25 de limbi",
      "featMoments": "Momente, mementouri și o scrisoare QR care se deschide în ziua potrivită",
      "featAudio": "Propriul audio în scrisoare și răspunsurile destinatarului",
      "ynTitle": "Da sau nu",
      "ynNote": "Un joc live în doi: 5 secunde pentru fiecare carte. Cine răspunde la timp vede răspunsul celuilalt.",
      "ynCreate": "Creează o cameră",
      "ynWaiting": "Așteptăm ca {name} să deschidă linkul…",
      "ynWaitingAny": "Îl așteptăm pe celălalt jucător…",
      "ynShareText": "{name} te invită la jocul live „Da sau nu”",
      "ynPartnerHere": "{name} a venit!",
      "ynStart": "Începe jocul",
      "ynWaitHost": "{name} începe imediat jocul",
      "ynYes": "Da",
      "ynNo": "Nu",
      "ynMissed": "Prea târziu — cartea rămâne închisă",
      "ynMatch": "Același răspuns!",
      "ynRound": "Cartea {n} din {total}",
      "ynAnswered": "Răspuns trimis, îl așteptăm pe celălalt…",
      "ynFinal": "{score} din {total} la fel",
      "ynFinalHigh": "Vă înțelegeți fără cuvinte",
      "ynFinalMid": "Atât de diferiți — și atât de apropiați",
      "ynAgain": "Joacă din nou",
      "ynLeft": "Celălalt jucător s-a deconectat. Așteptăm să revină…",
      "ynYou": "Tu",
      "ynOffline": "Nu ne putem conecta la joc. Verifică internetul și deschide linkul din nou.",
      "ynJoin": "Intră în joc",
      "ynJoinLead": "{name} te așteaptă. 5 secunde pentru fiecare răspuns!",
      "ynStepNames": "Numele tău și al celuilalt",
      "ynRoomReady": "Camera e gata — trimite linkul",
      "ynStayHere": "Nu închide acest ecran: jocul începe când linkul este deschis.",
      "featYesNo": "Jocul live „Da sau nu” — 5 secunde pe răspuns",
      "ynPartnerMissed": "Niciun răspuns — timpul a expirat",
      "lvTitle": "Ce iubim",
      "lvNote": "Un joc live în doi: 4 imagini, 10 secunde ca să alegi ce îți place cel mai mult. Puteți alege același lucru!",
      "lvShareText": "{name} te invită la jocul live „Ce iubim”",
      "lvJoinLead": "{name} te așteaptă. Alege imaginea care îți place cel mai mult!",
      "lvRound": "Tema {n} din {total}",
      "lvPick": "Alege ce îți place cel mai mult",
      "lvBoth": "Ați ales amândoi: {item}",
      "lvCommon": "Amândoi iubiți",
      "lvDiff": "Gusturi diferite — cu atât mai interesant!",
      "lvFinalHigh": "Aveți atât de multe în comun!",
      "lvFinalMid": "Atât de diferiți — și vă completați",
      "featLoves": "Jocul live „Ce iubim” — 4 imagini, alegeți împreună",
      "featGamesSoon2": "Duelul „Cine e mai rapid” și cărți de memorie cu ursuleți",
      "mcTitle": "Cărți de memorie cu ursuleți",
      "mcNote": "Un joc de memorie live în doi: pe rând, întoarceți câte două cărți și găsiți perechile. Trei niveluri, de la 8 la 16 cărți.",
      "mcShareText": "{name} te invită la jocul live „Cărți de memorie cu ursuleți”",
      "mcJoinLead": "{name} te așteaptă. Găsiți perechile pe rând!",
      "mcLevel": "Nivelul {n} din {total}",
      "mcTurnYou": "E rândul tău — întoarce două cărți",
      "mcTurnThem": "E rândul lui {name}",
      "mcPairs": "Perechi găsite: {found} din {total}",
      "mcLevelDone": "Toate perechile au fost găsite!",
      "mcTimeUp": "Timpul nivelului s-a terminat",
      "mcNext": "Urmează: nivelul {n}",
      "mcFinal": "Perechi găsite: {found} din {total}",
      "mcFinalHigh": "O echipă minunată!",
      "mcFinalMid": "Joc frumos — încă unul?",
      "featCards": "Jocul live „Cărți de memorie cu ursuleți” — găsiți perechi împreună",
      "featGamesSoon3": "Duelul „Cine e mai rapid”",
      "duTitle": "Cine e mai iute",
      "duNote": "Un duel live: un cuvânt și patru imagini. Atingeți cât mai repede imaginea corectă — o atingere greșită pierde runda.",
      "duShareText": "{name} te provoacă la duelul live „Cine e mai iute”",
      "duJoinLead": "{name} vă așteaptă. Găsiți imaginea corectă mai repede!",
      "duRound": "Runda {n} din {total}",
      "duFind": "Găsiți: {item}",
      "duYouWon": "Ați reacționat mai repede!",
      "duTheyWon": "Mai repede: {name}",
      "duWrong": "Imagine greșită — runda e pierdută",
      "duNobody": "Nimeni n-a găsit-o la timp",
      "duScore": "Dvs. {you} : {them} {name}",
      "duFinalWin": "Victorie! Ochi ageri azi.",
      "duFinalLose": "De data asta câștigă {name} — revanșă?",
      "duFinalDraw": "Egalitate — un meci perfect echilibrat!",
      "duSeconds": "{s} s",
      "featDuel": "Duelul live „Cine e mai iute” — găsiți imaginea cât mai repede",
      "whoTitle": "Cine dintre noi?",
      "whoNote": "Un joc live în doi: o întrebare, atingeți „Eu” sau numele persoanei dragi. Vedeți dacă vă potriviți în păreri.",
      "whoShareText": "{name} te invită la jocul live „Cine dintre noi?”",
      "whoJoinLead": "{name} vă așteaptă. Răspundeți sincer — apoi comparați!",
      "whoRound": "Întrebarea {n} din {total}",
      "whoMe": "Eu",
      "whoAgree": "Sunteți de acord: {name}",
      "whoDiffer": "Păreri diferite — vorbiți despre asta!",
      "whoFinal": "Ați fost de acord de {score} ori din {total}",
      "whoFinalHigh": "Vă vedeți atât de limpede!",
      "whoFinalMid": "Aveți multe de discutat — și e minunat",
      "featWho": "Jocul live „Cine dintre noi?” — vedeți dacă sunteți de acord",
      "phTitle": "Termină fraza",
      "phNote": "Un joc live în doi: fiecare termină aceeași frază caldă cu propriile cuvinte, apoi vă citiți răspunsurile.",
      "phShareText": "{name} te invită la jocul live „Termină fraza”",
      "phJoinLead": "{name} vă așteaptă. Terminați fiecare frază cu propriile cuvinte!",
      "phRound": "Fraza {n} din {total}",
      "phPlaceholder": "Continuarea dvs.…",
      "phDone": "Gata",
      "phWaiting": "Așteptăm răspunsul de la {name}…",
      "phSkipped": "Fără răspuns",
      "phSave": "Salvează în cartea cuplului",
      "phSaved": "Salvat în cartea cuplului",
      "phForbidden": "Scrieți fără linkuri sau cuvinte urâte.",
      "phNext": "Fraza următoare",
      "phFinal": "Fraze terminate împreună: {count}",
      "phFinalLead": "Salvați răspunsurile preferate în cartea cuplului.",
      "featPhrase": "Jocul live „Termină fraza” cu cartea cuplului",
      "bookTitle": "Cartea cuplului",
      "bookNote": "Cele mai calde răspunsuri din „Termină fraza”, păstrate în contul dvs.",
      "bookOpen": "Deschide cartea",
      "bookEmpty": "Cartea e goală deocamdată. Jucați „Termină fraza” și salvați răspunsurile care vă plac.",
      "bookDelete": "Șterge",
      "bookDeleteConfirm": "Ștergeți această pagină din carte?",
      "bookYou": "Dvs.",
      "inviteTitle": "Invită la joc",
      "inviteNote": "Persoana invitată va primi un mesaj cu jocul.",
      "invite": "Invită",
      "invited": "Invitație trimisă",
      "inviteNone": "Adăugați prieteni în secțiunea „Prieteni” ca să-i invitați dintr-o atingere.",
      "inviteSent": "Invitație trimisă către {name}"
    },
    "questions": {
      "q01": [
        "Anotimpul meu preferat?",
        "Primăvara",
        "Vara",
        "Toamna",
        "Iarna"
      ],
      "q02": [
        "Ce aș alege la micul dejun?",
        "Cafea și croissant",
        "Terci de ovăz",
        "Ouă",
        "Doar ceai"
      ],
      "q03": [
        "Ziua mea liberă perfectă?",
        "Acasă sub o pătură",
        "O plimbare în parc",
        "O ieșire din oraș",
        "Timp cu prietenii"
      ],
      "q04": [
        "Unde visez să merg?",
        "La mare",
        "La munte",
        "Într-un oraș mare",
        "Într-o căsuță primitoare la țară"
      ],
      "q05": [
        "Înghețata mea preferată?",
        "Vanilie",
        "Ciocolată",
        "Căpșuni",
        "Fistic"
      ],
      "q06": [
        "Ce mă înveselește cel mai repede?",
        "O îmbrățișare",
        "O surpriză",
        "Cuvinte calde",
        "Ceva gustos"
      ],
      "q07": [
        "Sunt mai degrabă…",
        "O persoană matinală",
        "O persoană nocturnă",
        "Cineva care doarme când se poate",
        "Fan al somnului de după-amiază"
      ],
      "q08": [
        "Ce film aș alege diseară?",
        "O comedie",
        "O poveste romantică",
        "Un polițist",
        "Un film de animație"
      ],
      "q09": [
        "Culoarea mea preferată?",
        "Roșu",
        "Albastru",
        "Verde",
        "Roz"
      ],
      "q10": [
        "De ce mi-e cel mai frică?",
        "De păianjeni",
        "De înălțime",
        "De întuneric",
        "Să întârzii"
      ],
      "q11": [
        "Ce flori iubesc?",
        "Trandafiri",
        "Lalele",
        "Bujori",
        "Margarete"
      ],
      "q12": [
        "Ce fac când am o zi tristă?",
        "Sun pe cineva drag",
        "Mănânc ceva dulce",
        "Ies la plimbare",
        "Mă culc"
      ],
      "q13": [
        "Ce animal mi se potrivește cel mai bine?",
        "Un pisoi",
        "Un câine",
        "Un ursuleț",
        "O vulpiță"
      ],
      "q14": [
        "Cel mai frumos cadou pentru mine?",
        "Ceva făcut de mână",
        "O călătorie",
        "O bijuterie",
        "O carte"
      ],
      "q15": [
        "Băutura mea preferată?",
        "Ceai negru",
        "Ceai verde",
        "Cafea",
        "Ciocolată caldă"
      ],
      "q16": [
        "Gustarea mea preferată?",
        "Ciocolată",
        "Chipsuri",
        "Fructe",
        "O prăjitură"
      ],
      "q17": [
        "Ce aleg când călătoresc?",
        "Muzee",
        "Plaja",
        "Mâncarea locală",
        "Plimbări fără plan"
      ],
      "q18": [
        "Cum îmi place să petrec seara?",
        "Cu o carte",
        "Cu un serial",
        "Povestind",
        "La plimbare"
      ],
      "q19": [
        "Ce vreme îmi place cel mai mult?",
        "Soare",
        "Ploaie caldă",
        "Ninsoare",
        "O adiere ușoară"
      ],
      "q20": [
        "Ce superputere mi s-ar potrivi?",
        "Să zbor",
        "Să citesc gândurile",
        "Să opresc timpul",
        "Să mă teleportez"
      ],
      "q21": [
        "Ce contează cel mai mult pentru mine la cei dragi?",
        "Încrederea",
        "Grija",
        "Umorul",
        "Sprijinul"
      ],
      "q22": [
        "Ce sărbătoare aștept cel mai mult?",
        "Anul Nou",
        "Ziua mea",
        "Vacanța de vară",
        "Ziua Îndrăgostiților"
      ],
      "q23": [
        "Cum spun cel mai des „te iubesc”?",
        "Prin cuvinte",
        "Prin fapte",
        "Prin îmbrățișări",
        "Prin cadouri"
      ],
      "q24": [
        "Ce aș comanda la cafenea?",
        "Paste",
        "Sushi",
        "O salată",
        "Un desert"
      ],
      "q25": [
        "Momentul meu preferat al zilei?",
        "Dimineața",
        "După-amiaza",
        "Seara",
        "Noaptea"
      ],
      "q26": [
        "Ce bucătărie aș alege?",
        "Italiană",
        "Japoneză",
        "Gătită acasă",
        "Mexicană"
      ],
      "q27": [
        "Unde gândesc cel mai bine?",
        "Sub duș",
        "La plimbare",
        "În drum",
        "Înainte de somn"
      ],
      "q28": [
        "Ce fac primul lucru dimineața?",
        "Mă uit pe telefon",
        "Beau apă",
        "Fac cafea",
        "Mai stau puțin în pat"
      ],
      "q29": [
        "Fructul meu preferat?",
        "Măr",
        "Banană",
        "Mango",
        "Pepene roșu"
      ],
      "q30": [
        "Ce hobby mi se potrivește cel mai bine?",
        "Desenul",
        "Gătitul",
        "Sportul",
        "Cititul"
      ],
      "q31": [
        "Cum vreau să-mi sărbătoresc ziua?",
        "Cu o petrecere mare",
        "Cu o cină în doi",
        "Cu o călătorie",
        "Cu o seară liniștită acasă"
      ],
      "q32": [
        "Ce cred despre surprize?",
        "Le ador",
        "Mă emoționează puțin",
        "Îmi place să le fac altora",
        "Prefer să știu dinainte"
      ],
      "q33": [
        "Ce dulce prefer?",
        "Tort",
        "Înghețată",
        "Biscuiți",
        "Bomboane"
      ],
      "q34": [
        "Ce aș lua pe o insulă pustie?",
        "O carte",
        "Telefonul",
        "O pătură",
        "Un aparat foto"
      ],
      "q35": [
        "Cum mă relaxez după o zi grea?",
        "O baie caldă",
        "Un serial",
        "O plimbare",
        "O discuție cu cineva drag"
      ],
      "q36": [
        "Ce mijloc de transport îmi place cel mai mult?",
        "Trenul",
        "Avionul",
        "Mașina",
        "Bicicleta"
      ],
      "q37": [
        "Jocul meu preferat din copilărie?",
        "De-a v-ați ascunselea",
        "Leapșa",
        "Construcțiile",
        "Desenul"
      ],
      "q38": [
        "Ce poveste mi se potrivește cel mai bine?",
        "Cenușăreasa",
        "Micul Prinț",
        "Winnie de Pluș",
        "Alice în Țara Minunilor"
      ],
      "q39": [
        "Cu ce aș bucura mai degrabă pe cineva drag?",
        "Cu o surpriză",
        "Cu o felicitare",
        "Cu o călătorie",
        "Cu o cină"
      ],
      "q40": [
        "Ce fotografiez cel mai des?",
        "Pe mine",
        "Natura",
        "Mâncarea",
        "Aproape că nu fac poze"
      ],
      "q41": [
        "Locul meu preferat din casă?",
        "Patul",
        "Bucătăria",
        "Canapeaua",
        "Balconul"
      ],
      "q42": [
        "Ce observ prima dată la un om?",
        "Zâmbetul",
        "Ochii",
        "Vocea",
        "Umorul"
      ],
      "q43": [
        "Ce mă face să râd cel mai repede?",
        "Videoclipuri amuzante",
        "Glumele celor dragi",
        "Situațiile stânjenitoare",
        "Animalele"
      ],
      "q44": [
        "Ce beau într-o zi caldă de vară?",
        "Limonadă",
        "Ceai rece",
        "Suc",
        "Apă cu gheață"
      ],
      "q45": [
        "Ce element mi se potrivește cel mai bine?",
        "Apa",
        "Focul",
        "Pământul",
        "Aerul"
      ],
      "q46": [
        "Ce povești iubesc?",
        "De aventură",
        "De dragoste",
        "SF",
        "Adevărate"
      ],
      "q47": [
        "Cum petrec o zi ploioasă?",
        "Citind",
        "Dormind",
        "Uitându-mă la un film",
        "Plimbându-mă cu umbrela"
      ],
      "q48": [
        "Ce prețuiesc cel mai mult la un cadou?",
        "Atenția",
        "Utilitatea",
        "Frumusețea",
        "Surpriza"
      ],
      "q49": [
        "Ce cartofi aș alege?",
        "Piure",
        "Cartofi prăjiți",
        "La cuptor",
        "Chipsuri"
      ],
      "q50": [
        "Unde merg prima dată într-un oraș nou?",
        "Într-o cafenea",
        "Într-un muzeu",
        "Într-un parc",
        "La cumpărături"
      ],
      "q51": [
        "Ce fac când nu pot dormi?",
        "Citesc",
        "Mă uit pe telefon",
        "Număr oi",
        "Beau lapte cald"
      ],
      "q52": [
        "Cum mă pregătesc pentru o zi importantă?",
        "Planific totul dinainte",
        "Fac totul în ultima clipă",
        "Cer ajutor",
        "Am emoții și nu dorm"
      ],
      "q53": [
        "Ce sport îmi place să urmăresc?",
        "Fotbal",
        "Tenis",
        "Patinaj artistic",
        "Nu urmăresc sport"
      ],
      "q54": [
        "Ce animal de companie mi se potrivește?",
        "O pisică",
        "Un câine",
        "Un papagal",
        "Un hamster"
      ],
      "q55": [
        "Ce fel de mesaje scriu?",
        "Lungi",
        "Scurte",
        "Pline de emoji",
        "Mesaje vocale"
      ],
      "q56": [
        "Ce cadou păstrez de cel mai mult timp?",
        "O scrisoare",
        "O jucărie",
        "O fotografie",
        "O bijuterie"
      ],
      "q57": [
        "Ce aș alege mai degrabă?",
        "Ceai lângă șemineu",
        "Picnic pe iarbă",
        "Plimbare pe malul mării",
        "O seară la cinema"
      ],
      "q58": [
        "Ce compliment m-ar bucura cel mai mult?",
        "Despre înfățișare",
        "Despre inteligență",
        "Despre bunătate",
        "Despre umor"
      ],
      "q59": [
        "Dimineața mea perfectă?",
        "Mic dejun la pat",
        "Alergare devreme",
        "Somn lung",
        "Cafea pe balcon"
      ],
      "q60": [
        "Ce vreau să învăț?",
        "Să dansez",
        "Să gătesc",
        "O limbă nouă",
        "Să desenez"
      ]
    },
    "yesNo": {
      "c01": [
        "Îți e dor de mine chiar acum?",
        "îi e tare dor",
        "rezistă, dar se gândește la tine"
      ],
      "c02": [
        "Zâmbești când vezi mesajul meu?",
        "zâmbește mereu",
        "zâmbește în sinea sa"
      ],
      "c03": [
        "Îți amintești prima noastră întâlnire?",
        "își amintește fiecare minut",
        "își amintește esențialul — pe tine"
      ],
      "c04": [
        "Vrei o îmbrățișare azi?",
        "așteaptă îmbrățișarea ta",
        "păstrează îmbrățișările pentru mai târziu"
      ],
      "c05": [
        "Mergem împreună la mare?",
        "își face deja bagajul",
        "visează la munte"
      ],
      "c06": [
        "Te fac să râzi?",
        "râde din inimă",
        "ascunde un zâmbet"
      ],
      "c07": [
        "Ai liniște lângă mine?",
        "lângă tine simte liniște",
        "se distrează cu tine"
      ],
      "c08": [
        "Te gândești la mine în timpul zilei?",
        "se gândește foarte des la tine",
        "se gândește la tine chiar acum"
      ],
      "c09": [
        "Îți plac surprizele mele?",
        "adoră surprizele tale",
        "iubește să te aibă pur și simplu aproape"
      ],
      "c10": [
        "Facem împreună o plăcintă?",
        "își pune deja șorțul",
        "preferă să cumpere un tort"
      ],
      "c11": [
        "Ne uităm diseară la un film?",
        "alege deja filmul",
        "vrea doar să stați de vorbă"
      ],
      "c12": [
        "Îți place vocea mea?",
        "ar asculta-o la nesfârșit",
        "îți iubește și mai mult râsul"
      ],
      "c13": [
        "Facem un picnic în weekend?",
        "pregătește pătura",
        "te cheamă într-o cafenea primitoare"
      ],
      "c14": [
        "Vrei să primești o scrisoare de la mine?",
        "așteaptă scrisoarea ta",
        "vrea să audă totul față în față"
      ],
      "c15": [
        "Contez mult pentru tine?",
        "contezi enorm",
        "mai mult decât crezi"
      ],
      "c16": [
        "Ne plimbăm prin ploaie?",
        "ia o umbrelă pentru doi",
        "face un ceai acasă"
      ],
      "c17": [
        "Semănăm unul cu altul?",
        "sunteți ca două jumătăți",
        "vă completați perfect"
      ],
      "c18": [
        "Îți place cum gătesc?",
        "mai cere o porție",
        "adoră să gătească împreună cu tine"
      ],
      "c19": [
        "Luăm împreună un animăluț?",
        "îi alege deja numele",
        "deocamdată ajunge un ursuleț de pluș"
      ],
      "c20": [
        "Știi ce iubesc?",
        "știe pe de rost",
        "vrea să afle și mai mult"
      ],
      "c21": [
        "Dansăm?",
        "îți întinde deja mâna",
        "va bate din palme"
      ],
      "c22": [
        "Te inspir?",
        "inspiri în fiecare zi",
        "lângă tine e pur și simplu cald"
      ],
      "c23": [
        "Păstrezi pozele noastre?",
        "le păstrează pe toate cu grijă",
        "așteaptă altele noi, și mai frumoase"
      ],
      "c24": [
        "Privim împreună răsăritul?",
        "pune deja alarma",
        "preferă apusul"
      ],
      "c25": [
        "Îmi spui un secret?",
        "ți-l va șopti la ureche",
        "să rămână un mister"
      ],
      "c26": [
        "Crezi în mine?",
        "crede foarte mult în tine",
        "te încurajează în fiecare zi"
      ],
      "c27": [
        "Plecăm într-o călătorie doar noi doi?",
        "visează la asta",
        "îi ia pe toți cei dragi"
      ],
      "c28": [
        "Aștepți să te sun?",
        "așteaptă zâmbind",
        "preferă să vii în vizită"
      ],
      "c29": [
        "Îți plac îmbrățișările mele?",
        "cele mai calde din lume",
        "iubește să vă țineți de mână"
      ],
      "c30": [
        "Ne citim cu voce tare unul altuia?",
        "alege deja o carte",
        "preferă să te asculte"
      ],
      "c31": [
        "Facem azi o poză împreună?",
        "caută deja un fundal frumos",
        "mai întâi, povești"
      ],
      "c32": [
        "Îți ridic moralul?",
        "mereu",
        "cu tine până și tristețea e mai ușoară"
      ],
      "c33": [
        "Luăm micul dejun împreună mâine?",
        "face deja cacao",
        "visează să doarmă mai mult"
      ],
      "c34": [
        "Îți amintești ziua mea?",
        "fără niciun memento",
        "pregătește în secret o surpriză"
      ],
      "c35": [
        "Mergem la patinoar?",
        "scoate patinele",
        "te va susține de pe margine"
      ],
      "c36": [
        "E o zi bună pentru tine?",
        "o zi minunată",
        "va fi mai bună cu tine aproape"
      ],
      "c37": [
        "Îmi desenezi portretul?",
        "ia deja creionul",
        "va desena o inimioară"
      ],
      "c38": [
        "Plantăm împreună un copac?",
        "alege locul",
        "va începe cu o floare la fereastră"
      ],
      "c39": [
        "Vrei să auzi un compliment?",
        "abia așteaptă",
        "se rușinează, dar își dorește mult"
      ],
      "c40": [
        "Mai jucăm o dată mai târziu?",
        "vrea încă o rundă",
        "preferă o îmbrățișare în loc de joc"
      ]
    },
    "loves": {
      "s01": [
        "Unde în vacanță?",
        "Plajă",
        "Munte",
        "Călătorie",
        "Puțină singurătate"
      ],
      "s02": [
        "Seara perfectă?",
        "Film acasă",
        "Plimbare",
        "Restaurant",
        "Jocuri de societate"
      ],
      "s03": [
        "Vremea preferată?",
        "Soare",
        "Ploaie",
        "Zăpadă",
        "Noapte înstelată"
      ],
      "s04": [
        "Animalul preferat?",
        "Pisoi",
        "Cățeluș",
        "Cal",
        "Delfin"
      ],
      "s05": [
        "Ce mâncăm la cină?",
        "Pizza",
        "Sushi",
        "Prăjituri",
        "Grătar"
      ],
      "s06": [
        "Băutura preferată?",
        "Cafea",
        "Ceai",
        "Ciocolată caldă",
        "Limonadă"
      ],
      "s07": [
        "Anotimpul preferat?",
        "Primăvara",
        "Vara",
        "Toamna",
        "Iarna"
      ],
      "s08": [
        "Florile preferate?",
        "Trandafiri",
        "Lalele",
        "Floarea-soarelui",
        "Lavandă"
      ],
      "s09": [
        "Cum te relaxezi?",
        "Cu o carte",
        "Desenând",
        "Pe bicicletă",
        "Somn în hamac"
      ],
      "s10": [
        "Cum călătorim?",
        "Cu trenul",
        "Cu avionul",
        "Cu mașina",
        "Cu vaporul"
      ],
      "s11": [
        "Casa visurilor?",
        "Apartament în oraș",
        "Casă la mare",
        "Cabană la munte",
        "Fermă"
      ],
      "s12": [
        "Ceva dulce?",
        "Înghețată",
        "Ciocolată",
        "Tort",
        "Fructe"
      ],
      "s13": [
        "Dimineața perfectă?",
        "Mic dejun la pat",
        "Alergare",
        "Somn lung",
        "Cafea pe balcon"
      ],
      "s14": [
        "Întâlnirea visurilor?",
        "Picnic",
        "Patinoar",
        "Parc de distracții",
        "Stele pe acoperiș"
      ],
      "s15": [
        "Cel mai frumos cadou?",
        "Un buchet",
        "O scrisoare",
        "O călătorie",
        "O cutie cu cadou"
      ],
      "s16": [
        "Natura preferată?",
        "Marea",
        "Pădurea",
        "Deșertul",
        "Aurora boreală"
      ]
    },
    "who": [
      "Cine dintre noi întârzie mai des?",
      "Cine dintre noi face pace mai repede?",
      "Cine dintre noi gătește mai bine?",
      "Cine dintre noi râde mai des?",
      "Cine dintre noi are nevoie de mai mult timp ca să se pregătească?",
      "Cine dintre noi pierde cheile mai des?",
      "Cine dintre noi ține minte mai bine datele importante?",
      "Cine dintre noi iubește mai mult dulciurile?",
      "Cine dintre noi adoarme mai repede?",
      "Cine dintre noi se trezește mai devreme?",
      "Cine dintre noi spune mai des „Mi-e dor de tine”?",
      "Cine dintre noi alege cadouri mai bune?",
      "Cine dintre noi glumește mai des?",
      "Cine dintre noi conduce mai bine?",
      "Cine dintre noi vorbește mai mult la telefon?",
      "Cine dintre noi iubește mai mult călătoriile?",
      "Cine dintre noi se supără mai ușor?",
      "Cine dintre noi iartă mai repede?",
      "Cine dintre noi face mai multe poze?",
      "Cine dintre noi se descurcă mai bine cu banii?",
      "Cine dintre noi cumpără mai des lucruri inutile?",
      "Cine dintre noi știe să consoleze mai bine?",
      "Cine dintre noi își păstrează mai bine calmul în momentele grele?",
      "Cine dintre noi își caută mereu telefonul?",
      "Cine dintre noi iubește mai mult să primească oaspeți?",
      "Cine dintre noi face mai des micul dejun?",
      "Cine dintre noi se orientează mai bine într-un oraș nou?",
      "Cine dintre noi scrie mesaje mai lungi?",
      "Cine dintre noi propune mai des o plimbare?",
      "Cine dintre noi iubește mai mult animalele?",
      "Cine dintre noi păstrează mai bine secretele?",
      "Cine dintre noi alege mai greu din meniu?",
      "Cine dintre noi își face mai multe griji pentru cei dragi?",
      "Cine dintre noi face mai multe surprize?",
      "Cine dintre noi ține mai bine ordinea?",
      "Cine dintre noi observă mai repede o tunsoare nouă?",
      "Cine dintre noi își amintește mai des povești amuzante?",
      "Cine dintre noi are mai multă răbdare?",
      "Cine dintre noi spune mai des „mulțumesc”?",
      "Cine dintre noi sare mai repede în ajutor?"
    ],
    "phrases": [
      "Zâmbesc când tu…",
      "Ziua mea preferată cu tine este…",
      "Îți mulțumesc pentru…",
      "Când am o zi tristă, mă ajută…",
      "Într-o zi, aș vrea să…",
      "Cea mai caldă amintire despre noi este…",
      "Nimeni nu știe mai bine ca tine să…",
      "Am liniște în suflet când…",
      "Dacă am avea o zi întreagă liberă, noi…",
      "Mă mândresc cu tine pentru că…",
      "Seara noastră perfectă este…",
      "Nu voi uita niciodată cum tu…",
      "Îmi place când spui…",
      "Anul viitor vreau să…",
      "Pentru mine, ești ca…",
      "Cel mai frumos cadou de la tine este…",
      "Mi-e dor de tine când…",
      "Ne distrăm cel mai mult când…",
      "De mult vreau să-ți spun…",
      "Locul nostru este…",
      "Când mă gândesc la tine, eu…",
      "Îmi faci ziua mai frumoasă când…",
      "Îmi place obiceiul nostru de a…",
      "Dorința mea pentru noi: …",
      "Cel mai amuzant lucru care ni s-a întâmplat este…",
      "Îți simt grija când…",
      "O dimineață cu tine este…",
      "Dacă am fi un singur cuvânt, acesta ar fi…",
      "Vreau să învăț de la tine să…",
      "Îți mulțumesc că mereu…"
    ]
  },
  "cs": {
    "text": {
      "homeLink": "Hry pro dva",
      "eyebrow": "GLOWLETTER · HRY PRO DVA",
      "title": "Hrajte spolu",
      "close": "Zavřít",
      "lead": "Pošlete hru někomu, na kom vám záleží. Hrát z odkazu je zdarma a bez účtu.",
      "quizTitle": "Jak dobře mě znáš?",
      "quizNote": "Odpovězte na otázky o sobě a blízký člověk zkusí hádat. Výsledek přijde vám.",
      "create": "Vytvořit kvíz",
      "soon": "Brzy",
      "soonTitle": "Chystáme další hry",
      "duel": "Souboj „Kdo je rychlejší“",
      "loves": "Co máme rádi",
      "cards": "Pexeso pro dva",
      "who": "Kdo z nás?",
      "phrase": "Dokonči větu",
      "myQuizzes": "Moje kvízy",
      "noQuizzes": "Zatím žádné kvízy. První vytvoříte za pár minut.",
      "forWhom": "Pro: {name}",
      "noRecipient": "Kvíz",
      "resultsCount": "Výsledky: {count}",
      "newResults": "Nové: {count}",
      "noResults": "Zatím nikdo nehrál.",
      "anonymous": "Bez jména",
      "results": "Výsledky",
      "copyLink": "Kopírovat odkaz",
      "share": "Odeslat",
      "deleteQuiz": "Smazat kvíz",
      "deleteConfirm": "Smazat tento kvíz i jeho výsledky? Odkaz přestane fungovat.",
      "deleted": "Kvíz smazán",
      "linkCopied": "Odkaz zkopírován",
      "back": "Zpět",
      "next": "Dál",
      "stepNames": "Krok 1 ze 2 · Jména",
      "yourName": "Vaše jméno",
      "yourNamePlaceholder": "Jak se jmenujete",
      "recipient": "Pro koho · nepovinné",
      "recipientPlaceholder": "Jméno blízkého člověka",
      "nameRequired": "Zadejte své jméno.",
      "forbiddenName": "Zadejte běžné jméno.",
      "stepAnswers": "Krok 2 ze 2 · Vaše odpovědi",
      "answersLead": "Označte, co o vás platí. Každou otázku lze vyměnit.",
      "swap": "Jiná otázka",
      "progress": "Zodpovězeno {done} z {total}",
      "answerAll": "U každé otázky vyberte odpověď.",
      "finish": "Získat odkaz",
      "creating": "Vytvářím kvíz…",
      "createdTitle": "Kvíz je hotový!",
      "createdLead": "Pošlete odkaz. Jakmile dorazí odpověď, výsledek se objeví v „Mých kvízech“.",
      "shareText": "{name} tě zve do hry „Jak dobře mě znáš?“",
      "signInTitle": "Je potřeba přihlášení",
      "signInNote": "Kvíz se ukládá do vašeho účtu, aby výsledky přišly právě vám.",
      "signIn": "Přihlásit se",
      "premiumNote": "Vytváření her je součástí plného přístupu. Hrát z odkazu může každý zdarma.",
      "failed": "Nepovedlo se. Zkontrolujte připojení a zkuste to znovu.",
      "rateLimited": "Příliš mnoho pokusů. Zkuste to později.",
      "playEyebrow": "HRA PRO DVA",
      "playInvite": "{name} vás zve do hry",
      "playLead": "Otázek: {count}. Hádejte odpovědi — na konci uvidíte, kolik se shoduje.",
      "playName": "Vaše jméno · nepovinné",
      "playNamePlaceholder": "Ať vás poznají",
      "start": "Začít",
      "playLoading": "Načítám hru…",
      "playMissing": "Hra není dostupná: odkaz byl smazán nebo vypršel.",
      "playOffline": "Ke hře je potřeba internet.",
      "retry": "Zkusit znovu",
      "questionOf": "Otázka {n} z {total}",
      "asks": "{name} se ptá",
      "counting": "Počítám shody…",
      "scoreOf": "{score} z {total}",
      "tierAll": "Dokonalé! Znáte se nejlépe ze všech",
      "tierHigh": "Znáte se opravdu dobře",
      "tierMid": "Není to špatné! Máte ještě co objevovat",
      "tierLow": "Čeká vás spousta milých objevů",
      "sentTo": "{name} uvidí váš výsledek",
      "review": "Vaše odpovědi",
      "rightAnswer": "Správná odpověď",
      "makeOwn": "Vytvořit vlastní kvíz",
      "home": "Domů",
      "resultToast": "{name}: {score} z {total} v kvízu „Jak dobře mě znáš?“",
      "ownerAnswers": "Odpovědi autora",
      "playerAnswers": "Odpovědi: {name}",
      "paywallTitle": "Hry, zábava<br><em>a dopisy</em>",
      "groupGames": "Hry",
      "groupFun": "Zábava",
      "groupLetters": "Dopisy",
      "featQuiz": "„Jak dobře mě znáš?“ — výsledek přijde vám",
      "featGamesSoon": "Souboj „Kdo je rychlejší“, „Co máme rádi“, pexeso s medvídky",
      "featFunSoon": "„Kdo z nás?“ a „Dokonči větu“ s knihou páru",
      "featCollection": "Celá sbírka dopisů a básní ve 25 jazycích",
      "featMoments": "Okamžiky, připomínky a QR dopis, který se otevře ve správný den",
      "featAudio": "Vlastní audio v dopise a odpověď příjemce",
      "ynTitle": "Ano, nebo ne",
      "ynNote": "Živá hra pro dva: 5 sekund na každou kartu. Kdo odpoví včas, uvidí odpověď toho druhého.",
      "ynCreate": "Vytvořit místnost",
      "ynWaiting": "Čekáme, až {name} otevře odkaz…",
      "ynWaitingAny": "Čekáme na druhého hráče…",
      "ynShareText": "{name} tě zve do živé hry „Ano, nebo ne“",
      "ynPartnerHere": "{name} je tady!",
      "ynStart": "Začít hru",
      "ynWaitHost": "{name} hned spustí hru",
      "ynYes": "Ano",
      "ynNo": "Ne",
      "ynMissed": "Pozdě — karta zůstává zavřená",
      "ynMatch": "Shoda!",
      "ynRound": "Karta {n} z {total}",
      "ynAnswered": "Odpověď odeslána, čekáme na druhého…",
      "ynFinal": "Shoda {score} z {total}",
      "ynFinalHigh": "Rozumíte si beze slov",
      "ynFinalMid": "Tak rozdílní — a tak blízcí",
      "ynAgain": "Hrát znovu",
      "ynLeft": "Druhý hráč se odpojil. Čekáme na návrat…",
      "ynYou": "Vy",
      "ynOffline": "Ke hře se nelze připojit. Zkontrolujte internet a otevřete odkaz znovu.",
      "ynJoin": "Vstoupit do hry",
      "ynJoinLead": "{name} na vás čeká. Na každou odpověď 5 sekund!",
      "ynStepNames": "Vaše jméno a jméno druhého hráče",
      "ynRoomReady": "Místnost je připravená — pošlete odkaz",
      "ynStayHere": "Nezavírejte tuto obrazovku: hra začne, jakmile se odkaz otevře.",
      "featYesNo": "Živá hra „Ano, nebo ne“ — 5 sekund na odpověď",
      "ynPartnerMissed": "Bez odpovědi — čas vypršel",
      "lvTitle": "Co máme rádi",
      "lvNote": "Živá hra pro dva: 4 obrázky a 10 sekund na výběr toho, co je vám nejbližší. Můžete vybrat totéž!",
      "lvShareText": "{name} tě zve do živé hry „Co máme rádi“",
      "lvJoinLead": "{name} na vás čeká. Vyberte obrázek, který je vám nejbližší!",
      "lvRound": "Téma {n} z {total}",
      "lvPick": "Vyberte, co je vám nejbližší",
      "lvBoth": "Oba jste vybrali: {item}",
      "lvCommon": "Oba milujete",
      "lvDiff": "Různé chutě — o to zajímavější!",
      "lvFinalHigh": "Máte toho tolik společného!",
      "lvFinalMid": "Tak rozdílní — a skvěle se doplňujete",
      "featLoves": "Živá hra „Co máme rádi“ — 4 obrázky, vybírejte spolu",
      "featGamesSoon2": "Souboj „Kdo je rychlejší“ a pexeso s medvídky",
      "mcTitle": "Pexeso s medvídky",
      "mcNote": "Živé pexeso pro dva: střídavě otáčejte po dvou kartách a hledejte páry. Tři úrovně, od 8 do 16 karet.",
      "mcShareText": "{name} tě zve do živé hry „Pexeso s medvídky“",
      "mcJoinLead": "{name} na vás čeká. Hledejte páry střídavě!",
      "mcLevel": "Úroveň {n} z {total}",
      "mcTurnYou": "Jste na tahu — otočte dvě karty",
      "mcTurnThem": "Na tahu: {name}",
      "mcPairs": "Nalezené páry: {found} z {total}",
      "mcLevelDone": "Všechny páry nalezeny!",
      "mcTimeUp": "Čas úrovně vypršel",
      "mcNext": "Dál: úroveň {n}",
      "mcFinal": "Nalezené páry: {found} z {total}",
      "mcFinalHigh": "Skvělý tým!",
      "mcFinalMid": "Pěkná hra — ještě jednu?",
      "featCards": "Živá hra „Pexeso s medvídky“ — hledejte páry spolu",
      "featGamesSoon3": "Souboj „Kdo je rychlejší“",
      "duTitle": "Kdo je rychlejší",
      "duNote": "Živý souboj: jedno slovo a čtyři obrázky. Klepněte na správný obrázek jako první — chybné klepnutí stojí kolo.",
      "duShareText": "{name} tě vyzývá na živý souboj „Kdo je rychlejší“",
      "duJoinLead": "{name} na vás čeká. Najděte správný obrázek rychleji!",
      "duRound": "Kolo {n} z {total}",
      "duFind": "Najděte: {item}",
      "duYouWon": "Tentokrát jste rychlejší vy!",
      "duTheyWon": "Rychlejší: {name}",
      "duWrong": "Špatný obrázek — kolo je ztracené",
      "duNobody": "Nikdo to nestihl",
      "duScore": "Vy {you} : {them} {name}",
      "duFinalWin": "Vítězství! Dnes máte bystré oko.",
      "duFinalLose": "Tentokrát vítězí {name} — odveta?",
      "duFinalDraw": "Remíza — dokonale vyrovnaný zápas!",
      "duSeconds": "{s} s",
      "featDuel": "Živý souboj „Kdo je rychlejší“ — najděte obrázek jako první",
      "whoTitle": "Kdo z nás?",
      "whoNote": "Živá hra pro dva: jedna otázka, klepněte na „Já“ nebo na druhé jméno. Zjistěte, jestli se na sebe díváte stejně.",
      "whoShareText": "{name} tě zve do živé hry „Kdo z nás?“",
      "whoJoinLead": "{name} na vás čeká. Odpovídejte upřímně — pak porovnejte!",
      "whoRound": "Otázka {n} z {total}",
      "whoMe": "Já",
      "whoAgree": "Shoda: {name}",
      "whoDiffer": "Názory se liší — promluvte si o tom!",
      "whoFinal": "Shoda {score} z {total}",
      "whoFinalHigh": "Vidíte se navzájem tak jasně!",
      "whoFinalMid": "Máte si o čem povídat — a to je krásné",
      "featWho": "Živá hra „Kdo z nás?“ — shodnete se?",
      "phTitle": "Dokonči větu",
      "phNote": "Živá hra pro dva: stejnou vřelou větu dokončíte vlastními slovy a pak si navzájem přečtete odpovědi.",
      "phShareText": "{name} tě zve do živé hry „Dokonči větu“",
      "phJoinLead": "{name} na vás čeká. Dokončete každou větu vlastními slovy!",
      "phRound": "Věta {n} z {total}",
      "phPlaceholder": "Vaše pokračování…",
      "phDone": "Hotovo",
      "phWaiting": "Čekáme na odpověď: {name}…",
      "phSkipped": "Bez odpovědi",
      "phSave": "Uložit do knihy páru",
      "phSaved": "Uloženo v knize páru",
      "phForbidden": "Pište prosím bez odkazů a hrubých slov.",
      "phNext": "Další věta",
      "phFinal": "Společně dokončené věty: {count}",
      "phFinalLead": "Odpovědi, které se vám nejvíc líbí, uložte do knihy páru.",
      "featPhrase": "Živá hra „Dokonči větu“ s knihou páru",
      "bookTitle": "Kniha páru",
      "bookNote": "Nejvřelejší odpovědi ze hry „Dokonči větu“, uložené ve vašem účtu.",
      "bookOpen": "Otevřít knihu",
      "bookEmpty": "Kniha je zatím prázdná. Zahrajte si „Dokonči větu“ a uložte odpovědi, které se vám líbí.",
      "bookDelete": "Smazat",
      "bookDeleteConfirm": "Smazat tuto stránku z knihy?",
      "bookYou": "Vy",
      "inviteTitle": "Pozvat přátele",
      "inviteNote": "Pozvaná osoba dostane zprávu se hrou.",
      "invite": "Pozvat",
      "invited": "Pozvánka odeslána",
      "inviteNone": "Přidejte si přátele v sekci „Přátelé“ a zvěte je jedním klepnutím.",
      "inviteSent": "Pozvánka odeslána: {name}"
    },
    "questions": {
      "q01": [
        "Moje oblíbené roční období?",
        "Jaro",
        "Léto",
        "Podzim",
        "Zima"
      ],
      "q02": [
        "Co si vyberu k snídani?",
        "Kávu a croissant",
        "Ovesnou kaši",
        "Vajíčka",
        "Jen čaj"
      ],
      "q03": [
        "Můj ideální volný den?",
        "Doma pod dekou",
        "Procházka parkem",
        "Výlet za město",
        "Čas s přáteli"
      ],
      "q04": [
        "Kam sním, že pojedu?",
        "K moři",
        "Do hor",
        "Do velkého města",
        "Do útulné chaloupky na venkově"
      ],
      "q05": [
        "Moje oblíbená zmrzlina?",
        "Vanilková",
        "Čokoládová",
        "Jahodová",
        "Pistáciová"
      ],
      "q06": [
        "Co mi nejrychleji zvedne náladu?",
        "Objetí",
        "Překvapení",
        "Milá slova",
        "Něco dobrého"
      ],
      "q07": [
        "Jsem spíš…",
        "Ranní ptáče",
        "Noční sova",
        "Spím, kdykoli to jde",
        "Miluji odpolední spánek"
      ],
      "q08": [
        "Jaký film si dnes večer vyberu?",
        "Komedii",
        "Romantický příběh",
        "Detektivku",
        "Animák"
      ],
      "q09": [
        "Moje oblíbená barva?",
        "Červená",
        "Modrá",
        "Zelená",
        "Růžová"
      ],
      "q10": [
        "Čeho se bojím nejvíc?",
        "Pavouků",
        "Výšek",
        "Tmy",
        "Že přijdu pozdě"
      ],
      "q11": [
        "Jaké květiny mám rád/a?",
        "Růže",
        "Tulipány",
        "Pivoňky",
        "Sedmikrásky"
      ],
      "q12": [
        "Co dělám, když je mi smutno?",
        "Volám blízkým",
        "Jím něco sladkého",
        "Jdu na procházku",
        "Jdu spát"
      ],
      "q13": [
        "Které zvíře je mi nejbližší?",
        "Kotě",
        "Pes",
        "Medvídě",
        "Lištička"
      ],
      "q14": [
        "Nejlepší dárek pro mě?",
        "Něco vyrobeného vlastníma rukama",
        "Výlet",
        "Šperk",
        "Kniha"
      ],
      "q15": [
        "Můj oblíbený nápoj?",
        "Černý čaj",
        "Zelený čaj",
        "Káva",
        "Kakao"
      ],
      "q16": [
        "Moje oblíbená svačinka?",
        "Čokoláda",
        "Chipsy",
        "Ovoce",
        "Zákusek"
      ],
      "q17": [
        "Co si vyberu na cestách?",
        "Muzea",
        "Pláž",
        "Místní kuchyni",
        "Toulky bez plánu"
      ],
      "q18": [
        "Jak rád/a trávím večer?",
        "S knihou",
        "Se seriálem",
        "Povídáním",
        "Na procházce"
      ],
      "q19": [
        "Jaké počasí mám nejradši?",
        "Slunce",
        "Teplý déšť",
        "Sněžení",
        "Lehký vánek"
      ],
      "q20": [
        "Jaká superschopnost by se ke mně hodila?",
        "Létat",
        "Číst myšlenky",
        "Zastavit čas",
        "Teleportovat se"
      ],
      "q21": [
        "Co je pro mě u blízkých nejdůležitější?",
        "Důvěra",
        "Péče",
        "Smysl pro humor",
        "Podpora"
      ],
      "q22": [
        "Na jaký svátek se těším nejvíc?",
        "Silvestr",
        "Moje narozeniny",
        "Letní prázdniny",
        "Valentýn"
      ],
      "q23": [
        "Jak nejčastěji říkám „mám tě rád/a“?",
        "Slovy",
        "Činy",
        "Objetím",
        "Dárky"
      ],
      "q24": [
        "Co si objednám v kavárně?",
        "Těstoviny",
        "Sushi",
        "Salát",
        "Dezert"
      ],
      "q25": [
        "Moje oblíbená denní doba?",
        "Ráno",
        "Odpoledne",
        "Večer",
        "Noc"
      ],
      "q26": [
        "Jakou kuchyni si vyberu?",
        "Italskou",
        "Japonskou",
        "Domácí",
        "Mexickou"
      ],
      "q27": [
        "Kde se mi nejlépe přemýšlí?",
        "Ve sprše",
        "Na procházce",
        "Na cestě",
        "Před spaním"
      ],
      "q28": [
        "Co dělám ráno jako první?",
        "Kouknu do telefonu",
        "Napiju se vody",
        "Uvařím kávu",
        "Ještě chvíli ležím"
      ],
      "q29": [
        "Moje oblíbené ovoce?",
        "Jablko",
        "Banán",
        "Mango",
        "Meloun"
      ],
      "q30": [
        "Jaký koníček je mi nejbližší?",
        "Kreslení",
        "Vaření",
        "Sport",
        "Čtení"
      ],
      "q31": [
        "Jak chci slavit narozeniny?",
        "Velkou oslavou",
        "Večeří ve dvou",
        "Výletem",
        "Klidným večerem doma"
      ],
      "q32": [
        "Co si myslím o překvapeních?",
        "Zbožňuji je",
        "Trochu mě znervózňují",
        "Rád/a je chystám pro druhé",
        "Raději vím dopředu"
      ],
      "q33": [
        "Jakou sladkost mám nejradši?",
        "Dort",
        "Zmrzlinu",
        "Sušenky",
        "Bonbony"
      ],
      "q34": [
        "Co si vezmu na pustý ostrov?",
        "Knihu",
        "Telefon",
        "Deku",
        "Foťák"
      ],
      "q35": [
        "Jak si odpočinu po těžkém dni?",
        "Teplá koupel",
        "Seriál",
        "Procházka",
        "Rozhovor s blízkým člověkem"
      ],
      "q36": [
        "Jaký dopravní prostředek mám nejradši?",
        "Vlak",
        "Letadlo",
        "Auto",
        "Kolo"
      ],
      "q37": [
        "Moje oblíbená hra z dětství?",
        "Schovávaná",
        "Honička",
        "Stavebnice",
        "Kreslení"
      ],
      "q38": [
        "Která pohádka je mi nejbližší?",
        "Popelka",
        "Malý princ",
        "Medvídek Pú",
        "Alenka v říši divů"
      ],
      "q39": [
        "Čím spíš potěším blízkého člověka?",
        "Překvapením",
        "Přáníčkem",
        "Výletem",
        "Večeří"
      ],
      "q40": [
        "Co nejčastěji fotím?",
        "Sebe",
        "Přírodu",
        "Jídlo",
        "Skoro nefotím"
      ],
      "q41": [
        "Moje oblíbené místo doma?",
        "Postel",
        "Kuchyň",
        "Gauč",
        "Balkon"
      ],
      "q42": [
        "Čeho si na člověku všimnu nejdřív?",
        "Úsměvu",
        "Očí",
        "Hlasu",
        "Smyslu pro humor"
      ],
      "q43": [
        "Co mě nejrychleji rozesměje?",
        "Vtipná videa",
        "Vtipy blízkých",
        "Trapné situace",
        "Zvířata"
      ],
      "q44": [
        "Co piju v letním vedru?",
        "Limonádu",
        "Ledový čaj",
        "Džus",
        "Vodu s ledem"
      ],
      "q45": [
        "Který živel je mi nejbližší?",
        "Voda",
        "Oheň",
        "Země",
        "Vzduch"
      ],
      "q46": [
        "Jaké příběhy mám rád/a?",
        "Dobrodružné",
        "O lásce",
        "Sci-fi",
        "Skutečné"
      ],
      "q47": [
        "Jak trávím deštivý den?",
        "Čtu",
        "Spím",
        "Dívám se na film",
        "Procházím se s deštníkem"
      ],
      "q48": [
        "Čeho si na dárku cením nejvíc?",
        "Pozornosti",
        "Užitečnosti",
        "Krásy",
        "Překvapení"
      ],
      "q49": [
        "Jaké brambory si vyberu?",
        "Kaši",
        "Hranolky",
        "Pečené",
        "Chipsy"
      ],
      "q50": [
        "Kam jdu v novém městě nejdřív?",
        "Do kavárny",
        "Do muzea",
        "Do parku",
        "Nakupovat"
      ],
      "q51": [
        "Co dělám, když nemůžu spát?",
        "Čtu",
        "Projíždím telefon",
        "Počítám ovečky",
        "Piju teplé mléko"
      ],
      "q52": [
        "Jak se chystám na důležitý den?",
        "Vše plánuji dopředu",
        "Dělám vše na poslední chvíli",
        "Požádám o pomoc",
        "Mám trému a nespím"
      ],
      "q53": [
        "Jaký sport nejraději sleduji?",
        "Fotbal",
        "Tenis",
        "Krasobruslení",
        "Sport nesleduji"
      ],
      "q54": [
        "Jaký mazlíček se ke mně hodí?",
        "Kočka",
        "Pes",
        "Papoušek",
        "Křeček"
      ],
      "q55": [
        "Jaké zprávy píšu?",
        "Dlouhé",
        "Krátké",
        "Plné smajlíků",
        "Hlasové"
      ],
      "q56": [
        "Který dárek mám schovaný nejdéle?",
        "Dopis",
        "Hračku",
        "Fotku",
        "Šperk"
      ],
      "q57": [
        "Co si spíš vyberu?",
        "Čaj u krbu",
        "Piknik v trávě",
        "Procházku u moře",
        "Kino"
      ],
      "q58": [
        "Který kompliment mě potěší nejvíc?",
        "Na vzhled",
        "Na chytrost",
        "Na laskavost",
        "Na smysl pro humor"
      ],
      "q59": [
        "Moje ideální ráno?",
        "Snídaně do postele",
        "Ranní běh",
        "Dlouhé spaní",
        "Káva na balkoně"
      ],
      "q60": [
        "Co se chci naučit?",
        "Tančit",
        "Vařit",
        "Nový jazyk",
        "Kreslit"
      ]
    },
    "yesNo": {
      "c01": [
        "Stýská se ti po mně právě teď?",
        "moc se stýská",
        "drží se, ale myslí na tebe"
      ],
      "c02": [
        "Usmíváš se, když vidíš moji zprávu?",
        "vždycky se usmívá",
        "usmívá se v duchu"
      ],
      "c03": [
        "Pamatuješ si naše první setkání?",
        "pamatuje si každou minutu",
        "pamatuje si to hlavní — tebe"
      ],
      "c04": [
        "Chceš se dnes obejmout?",
        "čeká na tvé objetí",
        "šetří objetí na potom"
      ],
      "c05": [
        "Pojedeme spolu k moři?",
        "už balí kufr",
        "sní o horách"
      ],
      "c06": [
        "Rozesměju tě?",
        "směje se od srdce",
        "schovává úsměv"
      ],
      "c07": [
        "Je ti se mnou klidně?",
        "vedle tebe cítí klid",
        "s tebou je legrace"
      ],
      "c08": [
        "Vzpomeneš si na mě přes den?",
        "vzpomíná velmi často",
        "vzpomíná právě teď"
      ],
      "c09": [
        "Máš rád/a moje překvapení?",
        "zbožňuje tvá překvapení",
        "nejvíc potěší, když jsi prostě nablízku"
      ],
      "c10": [
        "Upečeme spolu koláč?",
        "už si bere zástěru",
        "radši koupí dort"
      ],
      "c11": [
        "Podíváme se večer na film?",
        "už vybírá film",
        "chce si jen povídat"
      ],
      "c12": [
        "Líbí se ti můj hlas?",
        "poslouchat by se dal donekonečna",
        "ještě víc miluje tvůj smích"
      ],
      "c13": [
        "Uděláme o víkendu piknik?",
        "chystá deku",
        "zve tě do útulné kavárny"
      ],
      "c14": [
        "Chceš ode mě dostat dopis?",
        "čeká na tvůj dopis",
        "chce všechno slyšet osobně"
      ],
      "c15": [
        "Znamenám pro tebe hodně?",
        "znamenáš strašně moc",
        "víc, než si myslíš"
      ],
      "c16": [
        "Projdeme se v dešti?",
        "bere deštník pro dva",
        "uvaří čaj doma"
      ],
      "c17": [
        "Jsme si podobní?",
        "jste jako dvě poloviny",
        "skvěle se doplňujete"
      ],
      "c18": [
        "Chutná ti, jak vařím?",
        "chce přidat",
        "miluje vaření spolu s tebou"
      ],
      "c19": [
        "Pořídíme si spolu mazlíčka?",
        "už vybírá jméno",
        "zatím stačí plyšový medvídek"
      ],
      "c20": [
        "Víš, co miluju?",
        "zná to nazpaměť",
        "chce vědět ještě víc"
      ],
      "c21": [
        "Zatančíme si?",
        "už ti podává ruku",
        "bude tleskat"
      ],
      "c22": [
        "Inspiruju tě?",
        "inspiruješ každý den",
        "vedle tebe je prostě teplo"
      ],
      "c23": [
        "Schováváš naše fotky?",
        "opatruje každou",
        "čeká na nové, ještě hezčí"
      ],
      "c24": [
        "Přivítáme spolu východ slunce?",
        "nastavuje budík",
        "radši západ slunce"
      ],
      "c25": [
        "Prozradíš mi tajemství?",
        "pošeptá ti ho do ouška",
        "ať zůstane záhadou"
      ],
      "c26": [
        "Věříš ve mě?",
        "moc v tebe věří",
        "fandí ti každý den"
      ],
      "c27": [
        "Vyrazíme na cestu jen ve dvou?",
        "sní o tom",
        "vezme s sebou všechny blízké"
      ],
      "c28": [
        "Čekáš na můj telefonát?",
        "čeká s úsměvem",
        "radši přijď na návštěvu"
      ],
      "c29": [
        "Líbí se ti moje objetí?",
        "nejteplejší na světě",
        "miluje držení za ruce"
      ],
      "c30": [
        "Budeme si číst nahlas?",
        "už vybírá knihu",
        "radši bude poslouchat tebe"
      ],
      "c31": [
        "Uděláme si dnes společnou fotku?",
        "už hledá hezké pozadí",
        "nejdřív si popovídat"
      ],
      "c32": [
        "Zvedám ti náladu?",
        "vždycky",
        "s tebou je i smutek lehčí"
      ],
      "c33": [
        "Nasnídáme se zítra spolu?",
        "už vaří kakao",
        "sní o tom, že si přispí"
      ],
      "c34": [
        "Pamatuješ si moje narozeniny?",
        "bez připomínání",
        "tajně chystá překvapení"
      ],
      "c35": [
        "Půjdeme bruslit?",
        "vytahuje brusle",
        "bude ti fandit od mantinelu"
      ],
      "c36": [
        "Je dnes pro tebe dobrý den?",
        "skvělý den",
        "bude lepší, když budeš poblíž"
      ],
      "c37": [
        "Nakreslíš můj portrét?",
        "už bere tužku",
        "nakreslí srdíčko"
      ],
      "c38": [
        "Zasadíme spolu strom?",
        "vybírá místo",
        "začne kytkou na parapetu"
      ],
      "c39": [
        "Chceš slyšet kompliment?",
        "nemůže se dočkat",
        "stydí se, ale moc chce"
      ],
      "c40": [
        "Zahrajeme si pak znovu?",
        "chce další kolo",
        "radši objetí než hra"
      ]
    },
    "loves": {
      "s01": [
        "Kam na dovolenou?",
        "Pláž",
        "Hory",
        "Cestování",
        "Chvíle o samotě"
      ],
      "s02": [
        "Dokonalý večer?",
        "Film doma",
        "Procházka",
        "Restaurace",
        "Deskové hry"
      ],
      "s03": [
        "Oblíbené počasí?",
        "Slunce",
        "Déšť",
        "Sníh",
        "Hvězdná noc"
      ],
      "s04": [
        "Oblíbené zvíře?",
        "Kotě",
        "Štěně",
        "Kůň",
        "Delfín"
      ],
      "s05": [
        "Co k večeři?",
        "Pizza",
        "Sushi",
        "Zákusky",
        "Grilování"
      ],
      "s06": [
        "Oblíbený nápoj?",
        "Káva",
        "Čaj",
        "Kakao",
        "Limonáda"
      ],
      "s07": [
        "Oblíbené roční období?",
        "Jaro",
        "Léto",
        "Podzim",
        "Zima"
      ],
      "s08": [
        "Oblíbené květiny?",
        "Růže",
        "Tulipány",
        "Slunečnice",
        "Levandule"
      ],
      "s09": [
        "Jak odpočívat?",
        "S knihou",
        "Kreslením",
        "Na kole",
        "Spánek v houpací síti"
      ],
      "s10": [
        "Jak cestovat?",
        "Vlakem",
        "Letadlem",
        "Autem",
        "Lodí"
      ],
      "s11": [
        "Dům snů?",
        "Byt ve městě",
        "Dům u moře",
        "Chata na horách",
        "Farma"
      ],
      "s12": [
        "Něco sladkého?",
        "Zmrzlina",
        "Čokoláda",
        "Dort",
        "Ovoce"
      ],
      "s13": [
        "Dokonalé ráno?",
        "Snídaně do postele",
        "Běh",
        "Dlouhé spaní",
        "Káva na balkoně"
      ],
      "s14": [
        "Rande snů?",
        "Piknik",
        "Kluziště",
        "Zábavní park",
        "Hvězdy na střeše"
      ],
      "s15": [
        "Nejlepší dárek?",
        "Kytice",
        "Dopis",
        "Výlet",
        "Dárková krabice"
      ],
      "s16": [
        "Oblíbená příroda?",
        "Moře",
        "Les",
        "Poušť",
        "Polární záře"
      ]
    },
    "who": [
      "Kdo z nás častěji chodí pozdě?",
      "Kdo z nás se usmiřuje jako první?",
      "Kdo z nás vaří lépe?",
      "Kdo z nás se častěji směje?",
      "Kdo z nás se déle chystá?",
      "Kdo z nás častěji ztrácí klíče?",
      "Kdo z nás si lépe pamatuje důležitá data?",
      "Kdo z nás má raději sladké?",
      "Kdo z nás usíná jako první?",
      "Kdo z nás vstává dřív?",
      "Kdo z nás častěji říká „stýská se mi“?",
      "Kdo z nás vybírá lepší dárky?",
      "Kdo z nás častěji vtipkuje?",
      "Kdo z nás řídí lépe?",
      "Kdo z nás déle telefonuje?",
      "Kdo z nás raději cestuje?",
      "Kdo z nás se snáz urazí?",
      "Kdo z nás rychleji odpouští?",
      "Kdo z nás víc fotí?",
      "Kdo z nás lépe hospodaří s penězi?",
      "Kdo z nás častěji kupuje zbytečnosti?",
      "Kdo z nás umí lépe utěšit?",
      "Kdo z nás zůstává v těžkých chvílích klidnější?",
      "Kdo z nás pořád hledá telefon?",
      "Kdo z nás má raději návštěvy?",
      "Kdo z nás častěji chystá snídani?",
      "Kdo z nás se lépe vyzná v cizím městě?",
      "Kdo z nás píše delší zprávy?",
      "Kdo z nás jako první navrhne procházku?",
      "Kdo z nás má raději zvířata?",
      "Kdo z nás lépe udrží tajemství?",
      "Kdo z nás déle vybírá z jídelního lístku?",
      "Kdo z nás se víc bojí o blízké?",
      "Kdo z nás dělá víc překvapení?",
      "Kdo z nás víc dbá na pořádek?",
      "Kdo z nás si jako první všimne nového účesu?",
      "Kdo z nás si častěji vybavuje vtipné příhody?",
      "Kdo z nás je trpělivější?",
      "Kdo z nás častěji říká „děkuji“?",
      "Kdo z nás jako první nabídne pomoc?"
    ],
    "phrases": [
      "Usmívám se, když…",
      "Můj nejoblíbenější den s tebou je…",
      "Děkuji ti za…",
      "Když je mi smutno, pomáhá mi…",
      "Jednou si přeju, abychom spolu…",
      "Nejvřelejší vzpomínka na nás je…",
      "Nejlépe ze všech umíš…",
      "Je mi klidně, když…",
      "Kdyby nás čekal celý volný den…",
      "Cítím na tebe hrdost, protože…",
      "Náš dokonalý večer je…",
      "Nikdy nezapomenu, jak jsi…",
      "Líbí se mi, když říkáš…",
      "Příští rok si přeju, abychom…",
      "Pro mě jsi jako…",
      "Nejlepší dárek od tebe je…",
      "Stýská se mi po tobě, když…",
      "Nejvíc legrace máme, když…",
      "Dlouho ti chci říct…",
      "Naše místo je…",
      "Když na tebe myslím, tak…",
      "Děláš mi den hezčí, když…",
      "Líbí se mi náš zvyk…",
      "Moje přání pro nás: …",
      "Nejvtipnější věc, která se nám stala, je…",
      "Cítím tvou péči, když…",
      "Ráno s tebou je…",
      "Kdyby nás vystihovalo jedno slovo, bylo by to…",
      "Chci se od tebe naučit…",
      "Děkuji, že vždycky…"
    ]
  },
  "sv": {
    "text": {
      "homeLink": "Spel för två",
      "eyebrow": "GLOWLETTER · SPEL FÖR TVÅ",
      "title": "Spela tillsammans",
      "close": "Stäng",
      "lead": "Skicka ett spel till någon du tycker om. Att spela via länk är gratis och kräver inget konto.",
      "quizTitle": "Hur väl känner du mig?",
      "quizNote": "Svara på frågor om dig själv och låt någon som står dig nära gissa. Resultatet kommer till dig.",
      "create": "Skapa ett quiz",
      "soon": "Snart",
      "soonTitle": "Fler spel är på väg",
      "duel": "Duellen ”Vem är snabbast”",
      "loves": "Det vi älskar",
      "cards": "Memorykort för två",
      "who": "Vem av oss?",
      "phrase": "Avsluta meningen",
      "myQuizzes": "Mina quiz",
      "noQuizzes": "Inga quiz än. Det första tar ett par minuter.",
      "forWhom": "Till {name}",
      "noRecipient": "Quiz",
      "resultsCount": "Resultat: {count}",
      "newResults": "Nytt: {count}",
      "noResults": "Ingen har spelat än.",
      "anonymous": "Utan namn",
      "results": "Resultat",
      "copyLink": "Kopiera länk",
      "share": "Skicka",
      "deleteQuiz": "Radera quiz",
      "deleteConfirm": "Radera det här quizet och dess resultat? Länken slutar fungera.",
      "deleted": "Quizet raderat",
      "linkCopied": "Länken kopierad",
      "back": "Tillbaka",
      "next": "Nästa",
      "stepNames": "Steg 1 av 2 · Namn",
      "yourName": "Ditt namn",
      "yourNamePlaceholder": "Vad heter du",
      "recipient": "Till vem · valfritt",
      "recipientPlaceholder": "Namnet på den du tycker om",
      "nameRequired": "Skriv ditt namn.",
      "forbiddenName": "Skriv ett vanligt namn.",
      "stepAnswers": "Steg 2 av 2 · Dina svar",
      "answersLead": "Markera det som stämmer om dig. Varje fråga kan bytas ut.",
      "swap": "Annan fråga",
      "progress": "{done} av {total} besvarade",
      "answerAll": "Välj ett svar på varje fråga.",
      "finish": "Hämta länken",
      "creating": "Skapar quizet…",
      "createdTitle": "Ditt quiz är klart!",
      "createdLead": "Skicka länken. När någon svarat syns resultatet under ”Mina quiz”.",
      "shareText": "{name} bjuder in dig till spelet ”Hur väl känner du mig?”",
      "signInTitle": "Logga in för att fortsätta",
      "signInNote": "Quizet sparas i ditt konto så att resultaten kommer till dig.",
      "signIn": "Logga in",
      "premiumNote": "Att skapa spel ingår i full åtkomst. Att spela via länk är gratis för alla.",
      "failed": "Det gick inte. Kontrollera anslutningen och försök igen.",
      "rateLimited": "För många försök. Försök igen senare.",
      "playEyebrow": "ETT SPEL FÖR TVÅ",
      "playInvite": "{name} bjuder in dig att spela",
      "playLead": "Frågor: {count}. Gissa svaren — till sist ser du hur många som stämmer.",
      "playName": "Ditt namn · valfritt",
      "playNamePlaceholder": "Så att de vet att det är du",
      "start": "Börja",
      "playLoading": "Laddar spelet…",
      "playMissing": "Spelet är inte tillgängligt: länken har raderats eller gått ut.",
      "playOffline": "Spelet kräver internetanslutning.",
      "retry": "Försök igen",
      "questionOf": "Fråga {n} av {total}",
      "asks": "{name} frågar",
      "counting": "Räknar matchningar…",
      "scoreOf": "{score} av {total}",
      "tierAll": "Perfekt! Ni känner varandra bättre än någon annan",
      "tierHigh": "Ni känner varandra riktigt bra",
      "tierMid": "Inte illa! Det finns mer att upptäcka",
      "tierLow": "Många fina upptäckter väntar",
      "sentTo": "{name} ser ditt resultat",
      "review": "Dina svar",
      "rightAnswer": "Rätt svar",
      "makeOwn": "Skapa mitt eget quiz",
      "home": "Startsidan",
      "resultToast": "{name}: {score} av {total} i ”Hur väl känner du mig?”",
      "ownerAnswers": "Skaparens svar",
      "playerAnswers": "Svar från {name}",
      "paywallTitle": "Spel, nöje<br><em>och brev</em>",
      "groupGames": "Spel",
      "groupFun": "Nöje",
      "groupLetters": "Brev",
      "featQuiz": "”Hur väl känner du mig?” — resultatet kommer till dig",
      "featGamesSoon": "Duellen ”Vem är snabbast”, ”Det vi älskar”, memorykort med björnar",
      "featFunSoon": "”Vem av oss?” och ”Avsluta meningen” med parets bok",
      "featCollection": "Hela samlingen av brev och dikter på 25 språk",
      "featMoments": "Ögonblick, påminnelser och ett QR-brev som öppnas på rätt dag",
      "featAudio": "Eget ljud i brevet och svar från mottagaren",
      "ynTitle": "Ja eller nej",
      "ynNote": "Ett livespel för två: 5 sekunder per kort. Den som svarar i tid ser den andras svar.",
      "ynCreate": "Skapa ett rum",
      "ynWaiting": "Vi väntar på att {name} öppnar länken…",
      "ynWaitingAny": "Vi väntar på den andra…",
      "ynShareText": "{name} bjuder in dig till livespelet ”Ja eller nej”",
      "ynPartnerHere": "{name} är här!",
      "ynStart": "Starta spelet",
      "ynWaitHost": "{name} startar snart spelet",
      "ynYes": "Ja",
      "ynNo": "Nej",
      "ynMissed": "För sent — kortet förblir stängt",
      "ynMatch": "Samma svar!",
      "ynRound": "Kort {n} av {total}",
      "ynAnswered": "Svaret skickat, vi väntar på den andra…",
      "ynFinal": "{score} av {total} lika",
      "ynFinalHigh": "Ni förstår varandra utan ord",
      "ynFinalMid": "Så olika — och så nära",
      "ynAgain": "Spela igen",
      "ynLeft": "Den andra har kopplats bort. Vi väntar på att hen kommer tillbaka…",
      "ynYou": "Du",
      "ynOffline": "Kan inte ansluta till spelet. Kontrollera internet och öppna länken igen.",
      "ynJoin": "Gå med i spelet",
      "ynJoinLead": "{name} väntar på dig. 5 sekunder per svar!",
      "ynStepNames": "Ditt namn och den andras",
      "ynRoomReady": "Rummet är klart — skicka länken",
      "ynStayHere": "Håll skärmen öppen: spelet börjar när länken öppnas.",
      "featYesNo": "Livespelet ”Ja eller nej” — 5 sekunder per svar",
      "ynPartnerMissed": "Inget svar — tiden tog slut",
      "lvTitle": "Det vi älskar",
      "lvNote": "Ett livespel för två: 4 bilder och 10 sekunder att välja det du gillar mest. Ni får välja samma!",
      "lvShareText": "{name} bjuder in dig till livespelet ”Det vi älskar”",
      "lvJoinLead": "{name} väntar på dig. Välj bilden du gillar mest!",
      "lvRound": "Tema {n} av {total}",
      "lvPick": "Välj det du gillar mest",
      "lvBoth": "Ni valde båda: {item}",
      "lvCommon": "Ni älskar båda",
      "lvDiff": "Olika smak — ännu roligare!",
      "lvFinalHigh": "Ni har så mycket gemensamt!",
      "lvFinalMid": "Så olika — och ni kompletterar varandra",
      "featLoves": "Livespelet ”Det vi älskar” — 4 bilder, välj tillsammans",
      "featGamesSoon2": "Duellen ”Vem är snabbast” och memorykort med björnar",
      "mcTitle": "Memorykort med björnar",
      "mcNote": "Ett livememory för två: vänd två kort i taget, turvis, och hitta paren. Tre nivåer, från 8 till 16 kort.",
      "mcShareText": "{name} bjuder in dig till livespelet ”Memorykort med björnar”",
      "mcJoinLead": "{name} väntar på dig. Hitta paren turvis!",
      "mcLevel": "Nivå {n} av {total}",
      "mcTurnYou": "Din tur — vänd två kort",
      "mcTurnThem": "{name}s tur",
      "mcPairs": "Hittade par: {found} av {total}",
      "mcLevelDone": "Alla par hittade!",
      "mcTimeUp": "Tiden för nivån är slut",
      "mcNext": "Nästa: nivå {n}",
      "mcFinal": "Hittade par: {found} av {total}",
      "mcFinalHigh": "Ett fantastiskt lag!",
      "mcFinalMid": "Fint spelat — en gång till?",
      "featCards": "Livespelet ”Memorykort med björnar” — hitta par tillsammans",
      "featGamesSoon3": "Duellen ”Vem är snabbast”",
      "duTitle": "Vem är snabbast",
      "duNote": "En liveduell: ett ord och fyra bilder. Tryck först på rätt bild — fel tryck kostar rundan.",
      "duShareText": "{name} utmanar dig till liveduellen ”Vem är snabbast”",
      "duJoinLead": "{name} väntar på dig. Hitta rätt bild snabbare!",
      "duRound": "Runda {n} av {total}",
      "duFind": "Hitta: {item}",
      "duYouWon": "Du var snabbast!",
      "duTheyWon": "{name} var snabbast",
      "duWrong": "Fel bild — rundan är förlorad",
      "duNobody": "Ingen hann hitta den",
      "duScore": "Du {you} : {them} {name}",
      "duFinalWin": "Seger! Skarpa ögon i dag.",
      "duFinalLose": "{name} vinner den här gången — revansch?",
      "duFinalDraw": "Oavgjort — helt jämnt!",
      "duSeconds": "{s} s",
      "featDuel": "Liveduellen ”Vem är snabbast” — hitta bilden först",
      "whoTitle": "Vem av oss?",
      "whoNote": "Ett livespel för två: en fråga, tryck på ”Jag” eller på din partners namn. Se om ni tycker likadant om varandra.",
      "whoShareText": "{name} bjuder in dig till livespelet ”Vem av oss?”",
      "whoJoinLead": "{name} väntar på dig. Svara ärligt — jämför sedan!",
      "whoRound": "Fråga {n} av {total}",
      "whoMe": "Jag",
      "whoAgree": "Ni är överens: {name}",
      "whoDiffer": "Ni tycker olika — prata om det!",
      "whoFinal": "Ni var överens {score} av {total} gånger",
      "whoFinalHigh": "Ni ser verkligen varandra!",
      "whoFinalMid": "Mycket att prata om — och det är fint",
      "featWho": "Livespelet ”Vem av oss?” — se om ni är överens",
      "phTitle": "Avsluta meningen",
      "phNote": "Ett livespel för två: ni avslutar båda samma varma mening med egna ord och läser sedan varandras svar.",
      "phShareText": "{name} bjuder in dig till livespelet ”Avsluta meningen”",
      "phJoinLead": "{name} väntar på dig. Avsluta varje mening med egna ord!",
      "phRound": "Mening {n} av {total}",
      "phPlaceholder": "Din fortsättning…",
      "phDone": "Klar",
      "phWaiting": "Väntar på {name}…",
      "phSkipped": "Inget svar",
      "phSave": "Spara i parets bok",
      "phSaved": "Sparat i parets bok",
      "phForbidden": "Skriv utan länkar och fula ord.",
      "phNext": "Nästa mening",
      "phFinal": "Meningar avslutade tillsammans: {count}",
      "phFinalLead": "Spara de svar ni gillar mest i parets bok.",
      "featPhrase": "Livespelet ”Avsluta meningen” med parets bok",
      "bookTitle": "Parets bok",
      "bookNote": "De varmaste svaren från ”Avsluta meningen”, sparade i ditt konto.",
      "bookOpen": "Öppna boken",
      "bookEmpty": "Boken är tom än så länge. Spela ”Avsluta meningen” och spara svaren du gillar.",
      "bookDelete": "Radera",
      "bookDeleteConfirm": "Radera den här sidan ur boken?",
      "bookYou": "Du",
      "inviteTitle": "Bjud in en vän",
      "inviteNote": "Din vän får ett meddelande med spelet.",
      "invite": "Bjud in",
      "invited": "Inbjuden",
      "inviteNone": "Lägg till vänner under ”Vänner” så kan du bjuda in dem med ett tryck.",
      "inviteSent": "Inbjudan skickad till {name}"
    },
    "questions": {
      "q01": [
        "Min favoritårstid?",
        "Våren",
        "Sommaren",
        "Hösten",
        "Vintern"
      ],
      "q02": [
        "Vad väljer jag till frukost?",
        "Kaffe och croissant",
        "Gröt",
        "Ägg",
        "Bara te"
      ],
      "q03": [
        "Min perfekta lediga dag?",
        "Hemma under en filt",
        "En promenad i parken",
        "En tur ut ur stan",
        "Tid med vänner"
      ],
      "q04": [
        "Vart drömmer jag om att resa?",
        "Till havet",
        "Till fjällen",
        "Till en storstad",
        "Till en mysig stuga på landet"
      ],
      "q05": [
        "Min favoritglass?",
        "Vanilj",
        "Choklad",
        "Jordgubb",
        "Pistage"
      ],
      "q06": [
        "Vad gör mig glad snabbast?",
        "En kram",
        "En överraskning",
        "Snälla ord",
        "Något gott"
      ],
      "q07": [
        "Jag är mer…",
        "En morgonmänniska",
        "En nattuggla",
        "Någon som sover när det går",
        "En vän av tupplurar"
      ],
      "q08": [
        "Vilken film väljer jag i kväll?",
        "En komedi",
        "En romantisk berättelse",
        "En deckare",
        "En animerad film"
      ],
      "q09": [
        "Min favoritfärg?",
        "Röd",
        "Blå",
        "Grön",
        "Rosa"
      ],
      "q10": [
        "Vad är jag mest rädd för?",
        "Spindlar",
        "Höjder",
        "Mörker",
        "Att komma för sent"
      ],
      "q11": [
        "Vilka blommor älskar jag?",
        "Rosor",
        "Tulpaner",
        "Pioner",
        "Prästkragar"
      ],
      "q12": [
        "Vad gör jag när jag är ledsen?",
        "Ringer någon nära",
        "Äter något sött",
        "Går ut och promenerar",
        "Lägger mig och sover"
      ],
      "q13": [
        "Vilket djur står mig närmast?",
        "En kattunge",
        "En hund",
        "En björnunge",
        "En liten räv"
      ],
      "q14": [
        "Den bästa presenten för mig?",
        "Något handgjort",
        "En resa",
        "Ett smycke",
        "En bok"
      ],
      "q15": [
        "Min favoritdryck?",
        "Svart te",
        "Grönt te",
        "Kaffe",
        "Varm choklad"
      ],
      "q16": [
        "Mitt favoritmellanmål?",
        "Choklad",
        "Chips",
        "Frukt",
        "En bakelse"
      ],
      "q17": [
        "Vad väljer jag på resor?",
        "Museer",
        "Stranden",
        "Den lokala maten",
        "Att strosa utan plan"
      ],
      "q18": [
        "Hur tillbringar jag helst kvällen?",
        "Med en bok",
        "Med en serie",
        "Med samtal",
        "På en promenad"
      ],
      "q19": [
        "Vilket väder gillar jag mest?",
        "Sol",
        "Varmt regn",
        "Snöfall",
        "En lätt bris"
      ],
      "q20": [
        "Vilken superkraft skulle passa mig?",
        "Att flyga",
        "Att läsa tankar",
        "Att stoppa tiden",
        "Att teleportera mig"
      ],
      "q21": [
        "Vad är viktigast för mig hos mina nära?",
        "Tillit",
        "Omtanke",
        "Humor",
        "Stöd"
      ],
      "q22": [
        "Vilken högtid ser jag mest fram emot?",
        "Nyår",
        "Min födelsedag",
        "Sommarlovet",
        "Alla hjärtans dag"
      ],
      "q23": [
        "Hur säger jag oftast ”jag älskar dig”?",
        "Med ord",
        "Med handlingar",
        "Med kramar",
        "Med presenter"
      ],
      "q24": [
        "Vad beställer jag på ett kafé?",
        "Pasta",
        "Sushi",
        "En sallad",
        "En efterrätt"
      ],
      "q25": [
        "Min favorittid på dygnet?",
        "Morgonen",
        "Eftermiddagen",
        "Kvällen",
        "Natten"
      ],
      "q26": [
        "Vilket kök väljer jag?",
        "Italienskt",
        "Japanskt",
        "Husmanskost",
        "Mexikanskt"
      ],
      "q27": [
        "Var tänker jag bäst?",
        "I duschen",
        "På promenad",
        "På resande fot",
        "Innan jag somnar"
      ],
      "q28": [
        "Vad gör jag först på morgonen?",
        "Kollar mobilen",
        "Dricker vatten",
        "Gör kaffe",
        "Ligger kvar en stund"
      ],
      "q29": [
        "Min favoritfrukt?",
        "Äpple",
        "Banan",
        "Mango",
        "Vattenmelon"
      ],
      "q30": [
        "Vilken hobby passar mig bäst?",
        "Teckna",
        "Laga mat",
        "Träna",
        "Läsa"
      ],
      "q31": [
        "Hur vill jag fira min födelsedag?",
        "Med en stor fest",
        "Med en middag för två",
        "Med en resa",
        "Med en lugn kväll hemma"
      ],
      "q32": [
        "Vad tycker jag om överraskningar?",
        "Jag älskar dem",
        "De gör mig lite nervös",
        "Jag gillar att ordna dem åt andra",
        "Jag vill helst veta i förväg"
      ],
      "q33": [
        "Vilket godis gillar jag mest?",
        "Tårta",
        "Glass",
        "Kakor",
        "Godis"
      ],
      "q34": [
        "Vad tar jag med till en öde ö?",
        "En bok",
        "Mobilen",
        "En filt",
        "En kamera"
      ],
      "q35": [
        "Hur kopplar jag av efter en tuff dag?",
        "Ett varmt bad",
        "En serie",
        "En promenad",
        "Ett samtal med någon nära"
      ],
      "q36": [
        "Hur reser jag helst?",
        "Med tåg",
        "Med flyg",
        "Med bil",
        "Med cykel"
      ],
      "q37": [
        "Min favoritlek som barn?",
        "Kurragömma",
        "Tafatt",
        "Byggklossar",
        "Rita"
      ],
      "q38": [
        "Vilken saga står mig närmast?",
        "Askungen",
        "Lille prinsen",
        "Nalle Puh",
        "Alice i Underlandet"
      ],
      "q39": [
        "Hur skulle jag hellre glädja någon kär?",
        "Med en överraskning",
        "Med ett kort",
        "Med en resa",
        "Med en middag"
      ],
      "q40": [
        "Vad fotograferar jag oftast?",
        "Mig själv",
        "Naturen",
        "Mat",
        "Jag fotar nästan aldrig"
      ],
      "q41": [
        "Min favoritplats hemma?",
        "Sängen",
        "Köket",
        "Soffan",
        "Balkongen"
      ],
      "q42": [
        "Vad lägger jag märke till först hos en människa?",
        "Leendet",
        "Ögonen",
        "Rösten",
        "Humorn"
      ],
      "q43": [
        "Vad får mig att skratta snabbast?",
        "Roliga klipp",
        "Skämt från nära och kära",
        "Pinsamma situationer",
        "Djur"
      ],
      "q44": [
        "Vad dricker jag en varm sommardag?",
        "Lemonad",
        "Iste",
        "Juice",
        "Vatten med is"
      ],
      "q45": [
        "Vilket element står mig närmast?",
        "Vatten",
        "Eld",
        "Jord",
        "Luft"
      ],
      "q46": [
        "Vilka berättelser älskar jag?",
        "Äventyr",
        "Kärlekshistorier",
        "Science fiction",
        "Sanna historier"
      ],
      "q47": [
        "Hur tillbringar jag en regnig dag?",
        "Läser",
        "Sover",
        "Ser en film",
        "Promenerar med paraply"
      ],
      "q48": [
        "Vad uppskattar jag mest i en present?",
        "Omtanken",
        "Nyttan",
        "Skönheten",
        "Överraskningen"
      ],
      "q49": [
        "Vilken potatis väljer jag?",
        "Mos",
        "Pommes",
        "Ugnsbakad",
        "Chips"
      ],
      "q50": [
        "Vart går jag först i en ny stad?",
        "Till ett kafé",
        "Till ett museum",
        "Till en park",
        "Och shoppar"
      ],
      "q51": [
        "Vad gör jag när jag inte kan sova?",
        "Läser",
        "Scrollar på mobilen",
        "Räknar får",
        "Dricker varm mjölk"
      ],
      "q52": [
        "Hur förbereder jag mig inför en viktig dag?",
        "Planerar allt i förväg",
        "Gör allt i sista minuten",
        "Ber om hjälp",
        "Blir nervös och sover dåligt"
      ],
      "q53": [
        "Vilken sport tittar jag helst på?",
        "Fotboll",
        "Tennis",
        "Konståkning",
        "Jag tittar inte på sport"
      ],
      "q54": [
        "Vilket husdjur passar mig?",
        "En katt",
        "En hund",
        "En papegoja",
        "En hamster"
      ],
      "q55": [
        "Vilka slags meddelanden skriver jag?",
        "Långa",
        "Korta",
        "Fulla av emojis",
        "Röstmeddelanden"
      ],
      "q56": [
        "Vilken present har jag sparat längst?",
        "Ett brev",
        "En leksak",
        "Ett foto",
        "Ett smycke"
      ],
      "q57": [
        "Vad väljer jag hellre?",
        "Te vid brasan",
        "Picknick i gräset",
        "Promenad vid havet",
        "Bio"
      ],
      "q58": [
        "Vilken komplimang gör mig gladast?",
        "Om mitt utseende",
        "Om mitt förstånd",
        "Om min vänlighet",
        "Om min humor"
      ],
      "q59": [
        "Min perfekta morgon?",
        "Frukost på sängen",
        "Tidig löprunda",
        "Sova länge",
        "Kaffe på balkongen"
      ],
      "q60": [
        "Vad vill jag lära mig?",
        "Dansa",
        "Laga mat",
        "Ett nytt språk",
        "Teckna"
      ]
    },
    "yesNo": {
      "c01": [
        "Saknar du mig just nu?",
        "saknar dig väldigt mycket",
        "håller ut, men tänker på dig"
      ],
      "c02": [
        "Ler du när du ser mitt meddelande?",
        "ler alltid",
        "ler inombords"
      ],
      "c03": [
        "Minns du vårt första möte?",
        "minns varje minut",
        "minns det viktigaste — dig"
      ],
      "c04": [
        "Vill du ha en kram i dag?",
        "väntar på din kram",
        "sparar kramarna till senare"
      ],
      "c05": [
        "Ska vi åka till havet tillsammans?",
        "packar redan väskan",
        "drömmer om fjällen"
      ],
      "c06": [
        "Får jag dig att skratta?",
        "skrattar från hjärtat",
        "döljer ett leende"
      ],
      "c07": [
        "Känner du dig lugn med mig?",
        "känner sig lugn bredvid dig",
        "har roligt med dig"
      ],
      "c08": [
        "Tänker du på mig under dagen?",
        "tänker på dig väldigt ofta",
        "tänker på dig just nu"
      ],
      "c09": [
        "Älskar du mina överraskningar?",
        "älskar dina överraskningar",
        "tycker mest om när du bara är nära"
      ],
      "c10": [
        "Ska vi baka en paj tillsammans?",
        "tar redan på förklädet",
        "köper hellre en tårta"
      ],
      "c11": [
        "Ska vi se en film i kväll?",
        "väljer redan film",
        "vill hellre bara prata"
      ],
      "c12": [
        "Tycker du om min röst?",
        "skulle kunna lyssna i evighet",
        "älskar ditt skratt ännu mer"
      ],
      "c13": [
        "Ska vi ha picknick i helgen?",
        "gör filten redo",
        "bjuder in dig till ett mysigt kafé"
      ],
      "c14": [
        "Vill du få ett brev från mig?",
        "väntar på ditt brev",
        "vill höra allt ansikte mot ansikte"
      ],
      "c15": [
        "Betyder jag mycket för dig?",
        "du betyder enormt mycket",
        "mer än du tror"
      ],
      "c16": [
        "Ska vi promenera i regnet?",
        "tar ett paraply för två",
        "kokar hellre te hemma"
      ],
      "c17": [
        "Är vi lika varandra?",
        "ni är som två halvor",
        "ni kompletterar varandra perfekt"
      ],
      "c18": [
        "Gillar du min matlagning?",
        "vill ha mer",
        "älskar att laga mat tillsammans med dig"
      ],
      "c19": [
        "Ska vi skaffa ett husdjur tillsammans?",
        "väljer redan namn",
        "en nallebjörn räcker så länge"
      ],
      "c20": [
        "Vet du vad jag älskar?",
        "kan det utantill",
        "vill veta ännu mer"
      ],
      "c21": [
        "Ska vi dansa?",
        "räcker redan fram handen",
        "klappar händerna"
      ],
      "c22": [
        "Inspirerar jag dig?",
        "du inspirerar varje dag",
        "bredvid dig är det bara varmt"
      ],
      "c23": [
        "Sparar du våra foton?",
        "värnar om varenda en",
        "väntar på nya, ännu finare"
      ],
      "c24": [
        "Ska vi se soluppgången tillsammans?",
        "ställer redan väckarklockan",
        "ser hellre solnedgången"
      ],
      "c25": [
        "Berättar du en hemlighet för mig?",
        "viskar den i ditt öra",
        "låt den förbli ett mysterium"
      ],
      "c26": [
        "Tror du på mig?",
        "tror starkt på dig",
        "hejar på dig varje dag"
      ],
      "c27": [
        "Ska vi resa bort, bara vi två?",
        "drömmer om det",
        "tar med alla nära och kära"
      ],
      "c28": [
        "Väntar du på mitt samtal?",
        "väntar med ett leende",
        "vill hellre att du kommer förbi"
      ],
      "c29": [
        "Tycker du om mina kramar?",
        "de varmaste i världen",
        "håller gärna handen"
      ],
      "c30": [
        "Ska vi läsa högt för varandra?",
        "väljer redan en bok",
        "lyssnar hellre på dig"
      ],
      "c31": [
        "Ska vi ta ett foto tillsammans i dag?",
        "letar redan efter en fin bakgrund",
        "först lite prat"
      ],
      "c32": [
        "Gör jag dig gladare?",
        "alltid",
        "med dig blir till och med sorg lättare"
      ],
      "c33": [
        "Ska vi äta frukost tillsammans i morgon?",
        "gör redan varm choklad",
        "drömmer om att sova länge"
      ],
      "c34": [
        "Minns du min födelsedag?",
        "utan påminnelse",
        "planerar en överraskning i hemlighet"
      ],
      "c35": [
        "Ska vi åka skridskor?",
        "plockar fram skridskorna",
        "hejar på dig vid sargen"
      ],
      "c36": [
        "Är i dag en bra dag för dig?",
        "en toppendag",
        "blir bättre när du är nära"
      ],
      "c37": [
        "Ritar du mitt porträtt?",
        "tar redan pennan",
        "ritar ett litet hjärta"
      ],
      "c38": [
        "Ska vi plantera ett träd tillsammans?",
        "väljer platsen",
        "börjar med en blomma i fönstret"
      ],
      "c39": [
        "Vill du höra en komplimang?",
        "kan knappt vänta",
        "blir blyg men vill gärna"
      ],
      "c40": [
        "Ska vi spela igen sen?",
        "vill köra en runda till",
        "kramas hellre än spelar"
      ]
    },
    "loves": {
      "s01": [
        "Var på semester?",
        "Strand",
        "Berg",
        "Resor",
        "Egentid"
      ],
      "s02": [
        "Den perfekta kvällen?",
        "Film hemma",
        "Promenad",
        "Restaurang",
        "Brädspel"
      ],
      "s03": [
        "Favoritväder?",
        "Sol",
        "Regn",
        "Snö",
        "Stjärnklar natt"
      ],
      "s04": [
        "Favoritdjur?",
        "Kattunge",
        "Valp",
        "Häst",
        "Delfin"
      ],
      "s05": [
        "Vad blir det till middag?",
        "Pizza",
        "Sushi",
        "Bakelser",
        "Grillat"
      ],
      "s06": [
        "Favoritdryck?",
        "Kaffe",
        "Te",
        "Varm choklad",
        "Lemonad"
      ],
      "s07": [
        "Favoritårstid?",
        "Vår",
        "Sommar",
        "Höst",
        "Vinter"
      ],
      "s08": [
        "Favoritblommor?",
        "Rosor",
        "Tulpaner",
        "Solrosor",
        "Lavendel"
      ],
      "s09": [
        "Hur kopplar du av?",
        "Med en bok",
        "Ritar",
        "Cyklar",
        "Sover i hängmattan"
      ],
      "s10": [
        "Hur reser vi?",
        "Med tåg",
        "Med flyg",
        "Med bil",
        "Med båt"
      ],
      "s11": [
        "Drömhem?",
        "Lägenhet i stan",
        "Hus vid havet",
        "Stuga i fjällen",
        "Gård"
      ],
      "s12": [
        "Något sött?",
        "Glass",
        "Choklad",
        "Tårta",
        "Frukt"
      ],
      "s13": [
        "Den perfekta morgonen?",
        "Frukost på sängen",
        "Löprunda",
        "Sovmorgon",
        "Kaffe på balkongen"
      ],
      "s14": [
        "Drömdejt?",
        "Picknick",
        "Skridskobana",
        "Nöjespark",
        "Stjärnor på taket"
      ],
      "s15": [
        "Bästa presenten?",
        "En bukett",
        "Ett brev",
        "En resa",
        "En presentask"
      ],
      "s16": [
        "Favoritnatur?",
        "Hav",
        "Skog",
        "Öken",
        "Norrsken"
      ]
    },
    "who": [
      "Vem av oss är oftare sen?",
      "Vem av oss sluter fred först?",
      "Vem av oss lagar bäst mat?",
      "Vem av oss skrattar oftare?",
      "Vem av oss tar längst tid på sig att göra sig i ordning?",
      "Vem av oss tappar bort nycklarna oftare?",
      "Vem av oss minns viktiga datum bäst?",
      "Vem av oss är mest sockersugen?",
      "Vem av oss somnar först?",
      "Vem av oss går upp tidigast?",
      "Vem av oss säger ”jag saknar dig” oftare?",
      "Vem av oss väljer bäst presenter?",
      "Vem av oss skämtar oftare?",
      "Vem av oss kör bil bäst?",
      "Vem av oss pratar längst i telefon?",
      "Vem av oss älskar att resa mest?",
      "Vem av oss blir lättast sårad?",
      "Vem av oss förlåter snabbast?",
      "Vem av oss tar flest bilder?",
      "Vem av oss är bäst på att hantera pengar?",
      "Vem av oss köper oftare onödiga saker?",
      "Vem av oss är bäst på att trösta?",
      "Vem av oss håller sig lugnast i svåra stunder?",
      "Vem av oss letar alltid efter sin telefon?",
      "Vem av oss gillar mest att ha gäster?",
      "Vem av oss lagar frukost oftare?",
      "Vem av oss hittar bäst i en ny stad?",
      "Vem av oss skriver längst meddelanden?",
      "Vem av oss föreslår en promenad först?",
      "Vem av oss älskar djur mest?",
      "Vem av oss är bäst på att hålla hemligheter?",
      "Vem av oss tar längst tid på sig att välja från menyn?",
      "Vem av oss oroar sig mest för nära och kära?",
      "Vem av oss ordnar flest överraskningar?",
      "Vem av oss är mest ordningsam?",
      "Vem av oss märker en ny frisyr först?",
      "Vem av oss minns roliga historier oftare?",
      "Vem av oss är mest tålmodig?",
      "Vem av oss säger ”tack” oftare?",
      "Vem av oss erbjuder hjälp först?"
    ],
    "phrases": [
      "Jag ler när du…",
      "Min favoritdag med dig är…",
      "Tack för…",
      "När jag är ledsen hjälper det att…",
      "En dag vill jag att vi…",
      "Det varmaste minnet av oss är…",
      "Du är bäst på att…",
      "Jag känner mig lugn när…",
      "Om vi hade en hel ledig dag skulle vi…",
      "Jag är stolt över dig för att…",
      "Vår perfekta kväll är…",
      "Jag kommer aldrig att glömma hur du…",
      "Jag gillar när du säger…",
      "Nästa år vill jag att vi…",
      "För mig är du som…",
      "Den bästa gåvan från dig är…",
      "Jag saknar dig när…",
      "Vi är som roligast när…",
      "Jag har länge velat säga till dig…",
      "Vårt ställe är…",
      "När jag tänker på dig, så…",
      "Du gör min dag bättre när…",
      "Jag gillar vår vana att…",
      "Min önskan för oss: …",
      "Det roligaste som har hänt oss är…",
      "Jag känner din omtanke när du…",
      "En morgon med dig är…",
      "Om vi var ett enda ord skulle det vara…",
      "Jag vill lära mig av dig hur man…",
      "Tack för att du alltid…"
    ]
  },
  "el": {
    "text": {
      "homeLink": "Παιχνίδια για δύο",
      "eyebrow": "GLOWLETTER · ΠΑΙΧΝΙΔΙΑ ΓΙΑ ΔΥΟ",
      "title": "Παίξτε μαζί",
      "close": "Κλείσιμο",
      "lead": "Στείλτε ένα παιχνίδι σε κάποιον αγαπημένο. Το παιχνίδι από σύνδεσμο είναι δωρεάν και χωρίς λογαριασμό.",
      "quizTitle": "Πόσο καλά με ξέρεις;",
      "quizNote": "Απαντήστε σε ερωτήσεις για εσάς και αφήστε έναν δικό σας άνθρωπο να μαντέψει. Το αποτέλεσμα έρχεται σε εσάς.",
      "create": "Δημιουργία κουίζ",
      "soon": "Σύντομα",
      "soonTitle": "Έρχονται κι άλλα παιχνίδια",
      "duel": "Μονομαχία «Ποιος είναι πιο γρήγορος»",
      "loves": "Τι αγαπάμε",
      "cards": "Κάρτες μνήμης για δύο",
      "who": "Ποιος από τους δύο;",
      "phrase": "Συμπλήρωσε τη φράση",
      "myQuizzes": "Τα κουίζ μου",
      "noQuizzes": "Δεν υπάρχουν ακόμη κουίζ. Το πρώτο φτιάχνεται σε δύο λεπτά.",
      "forWhom": "Για: {name}",
      "noRecipient": "Κουίζ",
      "resultsCount": "Αποτελέσματα: {count}",
      "newResults": "Νέα: {count}",
      "noResults": "Κανείς δεν έχει παίξει ακόμη.",
      "anonymous": "Χωρίς όνομα",
      "results": "Αποτελέσματα",
      "copyLink": "Αντιγραφή συνδέσμου",
      "share": "Αποστολή",
      "deleteQuiz": "Διαγραφή κουίζ",
      "deleteConfirm": "Να διαγραφεί το κουίζ και τα αποτελέσματά του; Ο σύνδεσμος θα σταματήσει να λειτουργεί.",
      "deleted": "Το κουίζ διαγράφηκε",
      "linkCopied": "Ο σύνδεσμος αντιγράφηκε",
      "back": "Πίσω",
      "next": "Επόμενο",
      "stepNames": "Βήμα 1 από 2 · Ονόματα",
      "yourName": "Το όνομά σας",
      "yourNamePlaceholder": "Πώς σας λένε",
      "recipient": "Για ποιον · προαιρετικό",
      "recipientPlaceholder": "Το όνομα του αγαπημένου σας",
      "nameRequired": "Γράψτε το όνομά σας.",
      "forbiddenName": "Γράψτε ένα συνηθισμένο όνομα.",
      "stepAnswers": "Βήμα 2 από 2 · Οι απαντήσεις σας",
      "answersLead": "Σημειώστε τι ισχύει για εσάς. Κάθε ερώτηση μπορεί να αλλάξει.",
      "swap": "Άλλη ερώτηση",
      "progress": "{done} από {total} απαντήθηκαν",
      "answerAll": "Επιλέξτε απάντηση σε κάθε ερώτηση.",
      "finish": "Λήψη συνδέσμου",
      "creating": "Δημιουργία κουίζ…",
      "createdTitle": "Το κουίζ σας είναι έτοιμο!",
      "createdLead": "Στείλτε τον σύνδεσμο. Όταν απαντήσουν, το αποτέλεσμα θα φανεί στα «Τα κουίζ μου».",
      "shareText": "{name} σε προσκαλεί στο παιχνίδι «Πόσο καλά με ξέρεις;»",
      "signInTitle": "Χρειάζεται σύνδεση",
      "signInNote": "Το κουίζ φυλάσσεται στον λογαριασμό σας, ώστε τα αποτελέσματα να έρχονται σε εσάς.",
      "signIn": "Σύνδεση",
      "premiumNote": "Η δημιουργία παιχνιδιών ανήκει στην πλήρη πρόσβαση. Το παιχνίδι από σύνδεσμο είναι δωρεάν για όλους.",
      "failed": "Κάτι πήγε στραβά. Ελέγξτε τη σύνδεση και δοκιμάστε ξανά.",
      "rateLimited": "Πάρα πολλές προσπάθειες. Δοκιμάστε αργότερα.",
      "playEyebrow": "ΕΝΑ ΠΑΙΧΝΙΔΙ ΓΙΑ ΔΥΟ",
      "playInvite": "{name} σας προσκαλεί να παίξετε",
      "playLead": "Ερωτήσεις: {count}. Μαντέψτε τις απαντήσεις — στο τέλος θα δείτε πόσες ταιριάζουν.",
      "playName": "Το όνομά σας · προαιρετικό",
      "playNamePlaceholder": "Για να σας αναγνωρίσουν",
      "start": "Έναρξη",
      "playLoading": "Φόρτωση παιχνιδιού…",
      "playMissing": "Το παιχνίδι δεν είναι διαθέσιμο: ο σύνδεσμος διαγράφηκε ή έληξε.",
      "playOffline": "Το παιχνίδι χρειάζεται σύνδεση στο διαδίκτυο.",
      "retry": "Ξανά",
      "questionOf": "Ερώτηση {n} από {total}",
      "asks": "{name} ρωτά",
      "counting": "Μετράμε τις αντιστοιχίες…",
      "scoreOf": "{score} από {total}",
      "tierAll": "Τέλεια! Γνωρίζεστε καλύτερα από οποιονδήποτε",
      "tierHigh": "Γνωρίζεστε πολύ καλά",
      "tierMid": "Όχι άσχημα! Έχετε κι άλλα να ανακαλύψετε",
      "tierLow": "Σας περιμένουν πολλές όμορφες ανακαλύψεις",
      "sentTo": "{name} θα δει το αποτέλεσμά σας",
      "review": "Οι απαντήσεις σας",
      "rightAnswer": "Σωστή απάντηση",
      "makeOwn": "Δημιουργία δικού μου κουίζ",
      "home": "Αρχική",
      "resultToast": "{name}: {score} από {total} στο «Πόσο καλά με ξέρεις;»",
      "ownerAnswers": "Απαντήσεις δημιουργού",
      "playerAnswers": "Απαντήσεις: {name}",
      "paywallTitle": "Παιχνίδια, διασκέδαση<br><em>και γράμματα</em>",
      "groupGames": "Παιχνίδια",
      "groupFun": "Διασκέδαση",
      "groupLetters": "Γράμματα",
      "featQuiz": "«Πόσο καλά με ξέρεις;» — το αποτέλεσμα έρχεται σε εσάς",
      "featGamesSoon": "Μονομαχία «Ποιος είναι πιο γρήγορος», «Τι αγαπάμε», κάρτες με αρκουδάκια",
      "featFunSoon": "«Ποιος από τους δύο;» και «Συμπλήρωσε τη φράση» με το βιβλίο του ζευγαριού",
      "featCollection": "Όλη η συλλογή γραμμάτων και ποιημάτων σε 25 γλώσσες",
      "featMoments": "Στιγμές, υπενθυμίσεις και γράμμα QR που ανοίγει τη σωστή μέρα",
      "featAudio": "Δικός σας ήχος στο γράμμα και απαντήσεις του παραλήπτη",
      "ynTitle": "Ναι ή όχι",
      "ynNote": "Ζωντανό παιχνίδι για δύο: 5 δευτερόλεπτα για κάθε κάρτα. Όποιος απαντήσει εγκαίρως βλέπει την απάντηση του άλλου.",
      "ynCreate": "Δημιουργία δωματίου",
      "ynWaiting": "Περιμένουμε να ανοίξει τον σύνδεσμο: {name}…",
      "ynWaitingAny": "Περιμένουμε τον άλλο παίκτη…",
      "ynShareText": "Πρόσκληση από {name} στο ζωντανό παιχνίδι «Ναι ή όχι»",
      "ynPartnerHere": "Ήρθε: {name}!",
      "ynStart": "Έναρξη παιχνιδιού",
      "ynWaitHost": "Το παιχνίδι ξεκινά σε λίγο ({name})",
      "ynYes": "Ναι",
      "ynNo": "Όχι",
      "ynMissed": "Πολύ αργά — η κάρτα μένει κλειστή",
      "ynMatch": "Ίδια απάντηση!",
      "ynRound": "Κάρτα {n} από {total}",
      "ynAnswered": "Η απάντηση στάλθηκε, περιμένουμε τον άλλο…",
      "ynFinal": "{score} από {total} ίδιες",
      "ynFinalHigh": "Καταλαβαίνεστε χωρίς λόγια",
      "ynFinalMid": "Τόσο διαφορετικοί — και τόσο κοντά",
      "ynAgain": "Παίξτε ξανά",
      "ynLeft": "Ο άλλος παίκτης αποσυνδέθηκε. Περιμένουμε…",
      "ynYou": "Εσείς",
      "ynOffline": "Δεν είναι δυνατή η σύνδεση στο παιχνίδι. Ελέγξτε το διαδίκτυο και ανοίξτε ξανά τον σύνδεσμο.",
      "ynJoin": "Μπείτε στο παιχνίδι",
      "ynJoinLead": "Σας περιμένει: {name}. 5 δευτερόλεπτα για κάθε απάντηση!",
      "ynStepNames": "Το όνομά σας και του άλλου παίκτη",
      "ynRoomReady": "Το δωμάτιο είναι έτοιμο — στείλτε τον σύνδεσμο",
      "ynStayHere": "Μην κλείσετε αυτή την οθόνη: το παιχνίδι ξεκινά μόλις ανοίξει ο σύνδεσμος.",
      "featYesNo": "Ζωντανό παιχνίδι «Ναι ή όχι» — 5 δευτερόλεπτα ανά απάντηση",
      "ynPartnerMissed": "Καμία απάντηση — ο χρόνος τελείωσε",
      "lvTitle": "Τι αγαπάμε",
      "lvNote": "Ζωντανό παιχνίδι για δύο: 4 εικόνες και 10 δευτερόλεπτα για να διαλέξετε τι σας αρέσει περισσότερο. Μπορείτε να διαλέξετε το ίδιο!",
      "lvShareText": "Πρόσκληση από {name} στο ζωντανό παιχνίδι «Τι αγαπάμε»",
      "lvJoinLead": "Σας περιμένει: {name}. Διαλέξτε την εικόνα που σας αρέσει περισσότερο!",
      "lvRound": "Θέμα {n} από {total}",
      "lvPick": "Διαλέξτε τι σας αρέσει περισσότερο",
      "lvBoth": "Διαλέξατε και οι δύο: {item}",
      "lvCommon": "Αγαπάτε και οι δύο",
      "lvDiff": "Διαφορετικά γούστα — ακόμη πιο ενδιαφέρον!",
      "lvFinalHigh": "Έχετε τόσα κοινά!",
      "lvFinalMid": "Τόσο διαφορετικοί — και συμπληρώνεστε",
      "featLoves": "Ζωντανό παιχνίδι «Τι αγαπάμε» — 4 εικόνες, διαλέξτε μαζί",
      "featGamesSoon2": "Μονομαχία «Ποιος είναι πιο γρήγορος» και κάρτες μνήμης με αρκουδάκια",
      "mcTitle": "Κάρτες μνήμης με αρκουδάκια",
      "mcNote": "Ζωντανό παιχνίδι μνήμης για δύο: γυρίστε με τη σειρά δύο κάρτες και βρείτε τα ζευγάρια. Τρία επίπεδα, από 8 έως 16 κάρτες.",
      "mcShareText": "Πρόσκληση από {name} στο ζωντανό παιχνίδι «Κάρτες μνήμης με αρκουδάκια»",
      "mcJoinLead": "Σας περιμένει: {name}. Βρείτε τα ζευγάρια με τη σειρά!",
      "mcLevel": "Επίπεδο {n} από {total}",
      "mcTurnYou": "Η σειρά σας — γυρίστε δύο κάρτες",
      "mcTurnThem": "Σειρά: {name}",
      "mcPairs": "Ζευγάρια: {found} από {total}",
      "mcLevelDone": "Βρέθηκαν όλα τα ζευγάρια!",
      "mcTimeUp": "Ο χρόνος του επιπέδου τελείωσε",
      "mcNext": "Επόμενο: επίπεδο {n}",
      "mcFinal": "Ζευγάρια: {found} από {total}",
      "mcFinalHigh": "Υπέροχη ομάδα!",
      "mcFinalMid": "Ωραίο παιχνίδι — άλλο ένα;",
      "featCards": "Ζωντανό παιχνίδι «Κάρτες μνήμης με αρκουδάκια» — βρείτε ζευγάρια μαζί",
      "featGamesSoon3": "Μονομαχία «Ποιος είναι πιο γρήγορος»",
      "duTitle": "Ποιος προλαβαίνει",
      "duNote": "Ζωντανή μονομαχία: μία λέξη και τέσσερις εικόνες. Πατήστε πρώτα τη σωστή εικόνα — ένα λάθος πάτημα κοστίζει τον γύρο.",
      "duShareText": "{name} σε προκαλεί στη ζωντανή μονομαχία «Ποιος προλαβαίνει»",
      "duJoinLead": "{name} σας περιμένει. Βρείτε τη σωστή εικόνα πιο γρήγορα!",
      "duRound": "Γύρος {n} από {total}",
      "duFind": "Βρείτε: {item}",
      "duYouWon": "Τα καταφέρατε πιο γρήγορα!",
      "duTheyWon": "Πιο γρήγορα: {name}",
      "duWrong": "Λάθος εικόνα — ο γύρος χάθηκε",
      "duNobody": "Κανείς δεν το βρήκε εγκαίρως",
      "duScore": "Εσείς {you} : {them} {name}",
      "duFinalWin": "Νίκη! Κοφτερό μάτι σήμερα.",
      "duFinalLose": "Αυτή τη φορά νικά: {name} — ρεβάνς;",
      "duFinalDraw": "Ισοπαλία — απόλυτη ισορροπία!",
      "duSeconds": "{s} δευτ.",
      "featDuel": "Ζωντανή μονομαχία «Ποιος προλαβαίνει» — βρείτε πρώτα την εικόνα",
      "whoTitle": "Ποιος από εμάς;",
      "whoNote": "Ζωντανό παιχνίδι για δύο: μία ερώτηση, πατήστε «Εγώ» ή το άλλο όνομα. Δείτε αν οι απόψεις σας συμπίπτουν.",
      "whoShareText": "{name} σε προσκαλεί στο ζωντανό παιχνίδι «Ποιος από εμάς;»",
      "whoJoinLead": "{name} σας περιμένει. Απαντήστε με ειλικρίνεια — και μετά συγκρίνετε!",
      "whoRound": "Ερώτηση {n} από {total}",
      "whoMe": "Εγώ",
      "whoAgree": "Συμφωνείτε: {name}",
      "whoDiffer": "Οι απόψεις διαφέρουν — συζητήστε το!",
      "whoFinal": "Συμφωνήσατε {score} φορές στις {total}",
      "whoFinalHigh": "Γνωρίζεστε τόσο καλά!",
      "whoFinalMid": "Έχετε πολλά να πείτε — και αυτό είναι υπέροχο",
      "featWho": "Ζωντανό παιχνίδι «Ποιος από εμάς;» — συμφωνείτε;",
      "phTitle": "Συμπλήρωσε τη φράση",
      "phNote": "Ζωντανό παιχνίδι για δύο: συμπληρώνετε την ίδια ζεστή φράση με δικά σας λόγια και μετά διαβάζετε ο καθένας τις απαντήσεις του άλλου.",
      "phShareText": "{name} σε προσκαλεί στο ζωντανό παιχνίδι «Συμπλήρωσε τη φράση»",
      "phJoinLead": "{name} σας περιμένει. Συμπληρώστε κάθε φράση με δικά σας λόγια!",
      "phRound": "Φράση {n} από {total}",
      "phPlaceholder": "Η συνέχειά σας…",
      "phDone": "Έτοιμο",
      "phWaiting": "Αναμονή για: {name}…",
      "phSkipped": "Χωρίς απάντηση",
      "phSave": "Αποθήκευση στο βιβλίο του ζευγαριού",
      "phSaved": "Αποθηκεύτηκε στο βιβλίο του ζευγαριού",
      "phForbidden": "Γράψτε χωρίς συνδέσμους και αγενείς λέξεις.",
      "phNext": "Επόμενη φράση",
      "phFinal": "Φράσεις που συμπληρώσατε μαζί: {count}",
      "phFinalLead": "Αποθηκεύστε τις απαντήσεις που σας αρέσουν περισσότερο στο βιβλίο του ζευγαριού.",
      "featPhrase": "Ζωντανό παιχνίδι «Συμπλήρωσε τη φράση» με το βιβλίο του ζευγαριού",
      "bookTitle": "Το βιβλίο του ζευγαριού",
      "bookNote": "Οι πιο ζεστές απαντήσεις από το «Συμπλήρωσε τη φράση», φυλαγμένες στον λογαριασμό σας.",
      "bookOpen": "Άνοιγμα βιβλίου",
      "bookEmpty": "Το βιβλίο είναι ακόμα άδειο. Παίξτε «Συμπλήρωσε τη φράση» και αποθηκεύστε τις απαντήσεις που σας αρέσουν.",
      "bookDelete": "Διαγραφή",
      "bookDeleteConfirm": "Διαγραφή αυτής της σελίδας από το βιβλίο;",
      "bookYou": "Εσείς",
      "inviteTitle": "Πρόσκληση φίλων",
      "inviteNote": "Θα σταλεί μήνυμα με το παιχνίδι.",
      "invite": "Πρόσκληση",
      "invited": "Στάλθηκε",
      "inviteNone": "Προσθέστε φίλους στην ενότητα «Φίλοι» για να τους προσκαλείτε με ένα πάτημα.",
      "inviteSent": "Η πρόσκληση στάλθηκε: {name}"
    },
    "questions": {
      "q01": [
        "Η αγαπημένη μου εποχή;",
        "Άνοιξη",
        "Καλοκαίρι",
        "Φθινόπωρο",
        "Χειμώνας"
      ],
      "q02": [
        "Τι θα διάλεγα για πρωινό;",
        "Καφέ και κρουασάν",
        "Χυλό βρώμης",
        "Αυγά",
        "Μόνο τσάι"
      ],
      "q03": [
        "Η ιδανική μου μέρα ξεκούρασης;",
        "Στο σπίτι κάτω από μια κουβέρτα",
        "Βόλτα στο πάρκο",
        "Εκδρομή έξω από την πόλη",
        "Χρόνος με φίλους"
      ],
      "q04": [
        "Πού ονειρεύομαι να ταξιδέψω;",
        "Στη θάλασσα",
        "Στα βουνά",
        "Σε μια μεγάλη πόλη",
        "Σε ένα ζεστό σπιτάκι στην εξοχή"
      ],
      "q05": [
        "Το αγαπημένο μου παγωτό;",
        "Βανίλια",
        "Σοκολάτα",
        "Φράουλα",
        "Φιστίκι"
      ],
      "q06": [
        "Τι μου φτιάχνει πιο γρήγορα τη διάθεση;",
        "Μια αγκαλιά",
        "Μια έκπληξη",
        "Τρυφερά λόγια",
        "Κάτι νόστιμο"
      ],
      "q07": [
        "Είμαι περισσότερο…",
        "Πρωινός τύπος",
        "Νυχτοπούλι",
        "Κοιμάμαι όποτε μπορώ",
        "Λάτρης του μεσημεριανού ύπνου"
      ],
      "q08": [
        "Ποια ταινία θα διάλεγα απόψε;",
        "Κωμωδία",
        "Ρομαντική ιστορία",
        "Αστυνομική",
        "Κινούμενα σχέδια"
      ],
      "q09": [
        "Το αγαπημένο μου χρώμα;",
        "Κόκκινο",
        "Μπλε",
        "Πράσινο",
        "Ροζ"
      ],
      "q10": [
        "Τι φοβάμαι περισσότερο;",
        "Τις αράχνες",
        "Το ύψος",
        "Το σκοτάδι",
        "Να αργήσω"
      ],
      "q11": [
        "Ποια λουλούδια αγαπώ;",
        "Τριαντάφυλλα",
        "Τουλίπες",
        "Παιώνιες",
        "Μαργαρίτες"
      ],
      "q12": [
        "Τι κάνω όταν νιώθω λύπη;",
        "Τηλεφωνώ σε δικό μου άνθρωπο",
        "Τρώω κάτι γλυκό",
        "Βγαίνω για περπάτημα",
        "Πάω για ύπνο"
      ],
      "q13": [
        "Ποιο ζώο μού ταιριάζει περισσότερο;",
        "Ένα γατάκι",
        "Ένας σκύλος",
        "Ένα αρκουδάκι",
        "Ένα αλεπουδάκι"
      ],
      "q14": [
        "Το καλύτερο δώρο για μένα;",
        "Κάτι χειροποίητο",
        "Ένα ταξίδι",
        "Ένα κόσμημα",
        "Ένα βιβλίο"
      ],
      "q15": [
        "Το αγαπημένο μου ρόφημα;",
        "Μαύρο τσάι",
        "Πράσινο τσάι",
        "Καφές",
        "Ζεστή σοκολάτα"
      ],
      "q16": [
        "Το αγαπημένο μου σνακ;",
        "Σοκολάτα",
        "Πατατάκια",
        "Φρούτα",
        "Ένα γλυκό"
      ],
      "q17": [
        "Τι διαλέγω στα ταξίδια;",
        "Μουσεία",
        "Την παραλία",
        "Την τοπική κουζίνα",
        "Βόλτες χωρίς πρόγραμμα"
      ],
      "q18": [
        "Πώς μου αρέσει να περνάω το βράδυ;",
        "Με ένα βιβλίο",
        "Με μια σειρά",
        "Με κουβέντα",
        "Με μια βόλτα"
      ],
      "q19": [
        "Ποιος καιρός μού αρέσει πιο πολύ;",
        "Ήλιος",
        "Ζεστή βροχή",
        "Χιονόπτωση",
        "Ένα απαλό αεράκι"
      ],
      "q20": [
        "Ποια υπερδύναμη θα μου ταίριαζε;",
        "Να πετάω",
        "Να διαβάζω σκέψεις",
        "Να σταματώ τον χρόνο",
        "Να τηλεμεταφέρομαι"
      ],
      "q21": [
        "Τι μετράει περισσότερο για μένα στους δικούς μου;",
        "Η εμπιστοσύνη",
        "Η φροντίδα",
        "Το χιούμορ",
        "Η στήριξη"
      ],
      "q22": [
        "Ποια γιορτή περιμένω πιο πολύ;",
        "Την Πρωτοχρονιά",
        "Τα γενέθλιά μου",
        "Τις καλοκαιρινές διακοπές",
        "Του Αγίου Βαλεντίνου"
      ],
      "q23": [
        "Πώς λέω συνήθως «σ’ αγαπώ»;",
        "Με λόγια",
        "Με πράξεις",
        "Με αγκαλιές",
        "Με δώρα"
      ],
      "q24": [
        "Τι θα παράγγελνα σε ένα καφέ;",
        "Ζυμαρικά",
        "Σούσι",
        "Μια σαλάτα",
        "Ένα γλυκό"
      ],
      "q25": [
        "Η αγαπημένη μου ώρα της ημέρας;",
        "Το πρωί",
        "Το απόγευμα",
        "Το βράδυ",
        "Η νύχτα"
      ],
      "q26": [
        "Ποια κουζίνα θα διάλεγα;",
        "Ιταλική",
        "Ιαπωνική",
        "Σπιτική",
        "Μεξικάνικη"
      ],
      "q27": [
        "Πού σκέφτομαι καλύτερα;",
        "Στο ντους",
        "Περπατώντας",
        "Στον δρόμο",
        "Πριν κοιμηθώ"
      ],
      "q28": [
        "Τι κάνω πρώτο το πρωί;",
        "Κοιτάζω το κινητό",
        "Πίνω νερό",
        "Φτιάχνω καφέ",
        "Μένω λίγο ακόμη στο κρεβάτι"
      ],
      "q29": [
        "Το αγαπημένο μου φρούτο;",
        "Μήλο",
        "Μπανάνα",
        "Μάνγκο",
        "Καρπούζι"
      ],
      "q30": [
        "Ποιο χόμπι μού ταιριάζει περισσότερο;",
        "Ζωγραφική",
        "Μαγειρική",
        "Αθλητισμός",
        "Διάβασμα"
      ],
      "q31": [
        "Πώς θέλω να γιορτάσω τα γενέθλιά μου;",
        "Με μεγάλο πάρτι",
        "Με δείπνο για δύο",
        "Με ένα ταξίδι",
        "Με ήσυχο βράδυ στο σπίτι"
      ],
      "q32": [
        "Τι πιστεύω για τις εκπλήξεις;",
        "Τις λατρεύω",
        "Με αγχώνουν λίγο",
        "Μου αρέσει να τις κάνω σε άλλους",
        "Προτιμώ να ξέρω από πριν"
      ],
      "q33": [
        "Ποιο γλυκό προτιμώ;",
        "Τούρτα",
        "Παγωτό",
        "Μπισκότα",
        "Καραμέλες"
      ],
      "q34": [
        "Τι θα έπαιρνα σε ένα έρημο νησί;",
        "Ένα βιβλίο",
        "Το κινητό μου",
        "Μια κουβέρτα",
        "Μια φωτογραφική μηχανή"
      ],
      "q35": [
        "Πώς ξεκουράζομαι μετά από δύσκολη μέρα;",
        "Ζεστό μπάνιο",
        "Μια σειρά",
        "Μια βόλτα",
        "Κουβέντα με δικό μου άνθρωπο"
      ],
      "q36": [
        "Ποιο μέσο μεταφοράς μου αρέσει πιο πολύ;",
        "Τρένο",
        "Αεροπλάνο",
        "Αυτοκίνητο",
        "Ποδήλατο"
      ],
      "q37": [
        "Το αγαπημένο μου παιδικό παιχνίδι;",
        "Κρυφτό",
        "Κυνηγητό",
        "Τουβλάκια",
        "Ζωγραφική"
      ],
      "q38": [
        "Ποιο παραμύθι μού μοιάζει περισσότερο;",
        "Σταχτοπούτα",
        "Ο Μικρός Πρίγκιπας",
        "Γουίνι το αρκουδάκι",
        "Η Αλίκη στη χώρα των θαυμάτων"
      ],
      "q39": [
        "Πώς θα χαροποιούσα έναν δικό μου άνθρωπο;",
        "Με μια έκπληξη",
        "Με μια κάρτα",
        "Με ένα ταξίδι",
        "Με ένα δείπνο"
      ],
      "q40": [
        "Τι φωτογραφίζω πιο συχνά;",
        "Τον εαυτό μου",
        "Τη φύση",
        "Φαγητό",
        "Σχεδόν δεν φωτογραφίζω"
      ],
      "q41": [
        "Η αγαπημένη μου γωνιά στο σπίτι;",
        "Το κρεβάτι",
        "Η κουζίνα",
        "Ο καναπές",
        "Το μπαλκόνι"
      ],
      "q42": [
        "Τι προσέχω πρώτα σε έναν άνθρωπο;",
        "Το χαμόγελο",
        "Τα μάτια",
        "Τη φωνή",
        "Το χιούμορ"
      ],
      "q43": [
        "Τι με κάνει να γελάω πιο γρήγορα;",
        "Αστεία βίντεο",
        "Τα αστεία των δικών μου",
        "Αμήχανες στιγμές",
        "Τα ζώα"
      ],
      "q44": [
        "Τι πίνω μια ζεστή καλοκαιρινή μέρα;",
        "Λεμονάδα",
        "Κρύο τσάι",
        "Χυμό",
        "Νερό με πάγο"
      ],
      "q45": [
        "Ποιο στοιχείο μού ταιριάζει περισσότερο;",
        "Νερό",
        "Φωτιά",
        "Γη",
        "Αέρας"
      ],
      "q46": [
        "Ποιες ιστορίες αγαπώ;",
        "Περιπέτειας",
        "Αγάπης",
        "Επιστημονικής φαντασίας",
        "Αληθινές"
      ],
      "q47": [
        "Πώς περνάω μια βροχερή μέρα;",
        "Διαβάζω",
        "Κοιμάμαι",
        "Βλέπω ταινία",
        "Περπατάω με ομπρέλα"
      ],
      "q48": [
        "Τι εκτιμώ περισσότερο σε ένα δώρο;",
        "Τη σκέψη",
        "Τη χρησιμότητα",
        "Την ομορφιά",
        "Την έκπληξη"
      ],
      "q49": [
        "Ποιες πατάτες θα διάλεγα;",
        "Πουρέ",
        "Τηγανητές",
        "Φούρνου",
        "Πατατάκια"
      ],
      "q50": [
        "Πού πάω πρώτα σε μια νέα πόλη;",
        "Σε ένα καφέ",
        "Σε ένα μουσείο",
        "Σε ένα πάρκο",
        "Για ψώνια"
      ],
      "q51": [
        "Τι κάνω όταν δεν μπορώ να κοιμηθώ;",
        "Διαβάζω",
        "Χαζεύω στο κινητό",
        "Μετράω προβατάκια",
        "Πίνω ζεστό γάλα"
      ],
      "q52": [
        "Πώς προετοιμάζομαι για μια σημαντική μέρα;",
        "Τα σχεδιάζω όλα από πριν",
        "Τα κάνω όλα την τελευταία στιγμή",
        "Ζητάω βοήθεια",
        "Αγχώνομαι και δεν κοιμάμαι"
      ],
      "q53": [
        "Ποιο άθλημα μου αρέσει να βλέπω;",
        "Ποδόσφαιρο",
        "Τένις",
        "Καλλιτεχνικό πατινάζ",
        "Δεν βλέπω αθλήματα"
      ],
      "q54": [
        "Ποιο κατοικίδιο μού ταιριάζει;",
        "Μια γάτα",
        "Ένας σκύλος",
        "Ένας παπαγάλος",
        "Ένα χάμστερ"
      ],
      "q55": [
        "Τι μηνύματα γράφω;",
        "Μεγάλα",
        "Σύντομα",
        "Γεμάτα emoji",
        "Φωνητικά"
      ],
      "q56": [
        "Ποιο δώρο κρατάω περισσότερο καιρό;",
        "Ένα γράμμα",
        "Ένα παιχνίδι",
        "Μια φωτογραφία",
        "Ένα κόσμημα"
      ],
      "q57": [
        "Τι θα διάλεγα μάλλον;",
        "Τσάι δίπλα στο τζάκι",
        "Πικνίκ στο γρασίδι",
        "Βόλτα δίπλα στη θάλασσα",
        "Σινεμά"
      ],
      "q58": [
        "Ποιο κομπλιμέντο θα με χαροποιούσε περισσότερο;",
        "Για την εμφάνισή μου",
        "Για το μυαλό μου",
        "Για την καλοσύνη μου",
        "Για το χιούμορ μου"
      ],
      "q59": [
        "Το τέλειο πρωινό μου;",
        "Πρωινό στο κρεβάτι",
        "Πρωινό τρέξιμο",
        "Πολύς ύπνος",
        "Καφές στο μπαλκόνι"
      ],
      "q60": [
        "Τι θέλω να μάθω;",
        "Να χορεύω",
        "Να μαγειρεύω",
        "Μια νέα γλώσσα",
        "Να ζωγραφίζω"
      ]
    },
    "yesNo": {
      "c01": [
        "Σου λείπω αυτή τη στιγμή;",
        "σε νοσταλγεί πολύ",
        "κρατιέται, αλλά σε σκέφτεται"
      ],
      "c02": [
        "Χαμογελάς όταν βλέπεις το μήνυμά μου;",
        "χαμογελά πάντα",
        "χαμογελά κρυφά"
      ],
      "c03": [
        "Θυμάσαι την πρώτη μας συνάντηση;",
        "θυμάται κάθε λεπτό",
        "θυμάται το πιο σημαντικό — εσένα"
      ],
      "c04": [
        "Θέλεις μια αγκαλιά σήμερα;",
        "περιμένει την αγκαλιά σου",
        "κρατά τις αγκαλιές για μετά"
      ],
      "c05": [
        "Πάμε μαζί στη θάλασσα;",
        "ετοιμάζει ήδη βαλίτσα",
        "ονειρεύεται τα βουνά"
      ],
      "c06": [
        "Σε κάνω να γελάς;",
        "γελά από καρδιάς",
        "κρύβει ένα χαμόγελο"
      ],
      "c07": [
        "Νιώθεις ηρεμία μαζί μου;",
        "νιώθει γαλήνη δίπλα σου",
        "περνά τέλεια μαζί σου"
      ],
      "c08": [
        "Με σκέφτεσαι μέσα στη μέρα;",
        "σε σκέφτεται πολύ συχνά",
        "σε σκέφτεται τώρα"
      ],
      "c09": [
        "Αγαπάς τις εκπλήξεις μου;",
        "λατρεύει τις εκπλήξεις σου",
        "αγαπά απλώς να είσαι κοντά"
      ],
      "c10": [
        "Φτιάχνουμε μαζί μια πίτα;",
        "φορά ήδη ποδιά",
        "προτιμά να αγοράσει τούρτα"
      ],
      "c11": [
        "Βλέπουμε ταινία απόψε;",
        "διαλέγει ήδη ταινία",
        "θέλει απλώς να μιλήσετε"
      ],
      "c12": [
        "Σου αρέσει η φωνή μου;",
        "θα την άκουγε ατελείωτα",
        "αγαπά ακόμη πιο πολύ το γέλιο σου"
      ],
      "c13": [
        "Κάνουμε πικνίκ το Σαββατοκύριακο;",
        "ετοιμάζει την κουβέρτα",
        "σε καλεί σε ένα ζεστό καφέ"
      ],
      "c14": [
        "Θέλεις ένα γράμμα από μένα;",
        "περιμένει το γράμμα σου",
        "θέλει να τα ακούσει από κοντά"
      ],
      "c15": [
        "Είμαι σημαντικός άνθρωπος για σένα;",
        "είσαι πάρα πολύ σημαντικός άνθρωπος",
        "περισσότερο απ’ όσο νομίζεις"
      ],
      "c16": [
        "Περπατάμε στη βροχή;",
        "παίρνει ομπρέλα για δύο",
        "θα φτιάξει τσάι στο σπίτι"
      ],
      "c17": [
        "Μοιάζουμε;",
        "είστε σαν δύο μισά",
        "συμπληρώνετε τέλεια ο ένας τον άλλον"
      ],
      "c18": [
        "Σου αρέσει πώς μαγειρεύω;",
        "ζητά κι άλλο",
        "λατρεύει να μαγειρεύετε μαζί"
      ],
      "c19": [
        "Παίρνουμε μαζί ένα κατοικίδιο;",
        "διαλέγει ήδη όνομα",
        "για τώρα αρκεί ένα λούτρινο αρκουδάκι"
      ],
      "c20": [
        "Ξέρεις τι αγαπώ;",
        "το ξέρει απέξω",
        "θέλει να μάθει ακόμη περισσότερα"
      ],
      "c21": [
        "Χορεύουμε;",
        "σου δίνει ήδη το χέρι",
        "θα χειροκροτεί"
      ],
      "c22": [
        "Σε εμπνέω;",
        "εμπνέεις κάθε μέρα",
        "δίπλα σου απλώς υπάρχει ζεστασιά"
      ],
      "c23": [
        "Κρατάς τις φωτογραφίες μας;",
        "τις φυλάει όλες",
        "περιμένει καινούριες, ακόμη πιο όμορφες"
      ],
      "c24": [
        "Βλέπουμε μαζί την ανατολή;",
        "βάζει ήδη ξυπνητήρι",
        "προτιμά το ηλιοβασίλεμα"
      ],
      "c25": [
        "Μου λες ένα μυστικό;",
        "θα σου το ψιθυρίσει",
        "ας μείνει μυστήριο"
      ],
      "c26": [
        "Πιστεύεις σε μένα;",
        "πιστεύει πολύ σε σένα",
        "σε ενθαρρύνει κάθε μέρα"
      ],
      "c27": [
        "Πάμε ταξίδι, μόνο εμείς οι δύο;",
        "το ονειρεύεται",
        "θα πάρει μαζί όλους τους δικούς σας"
      ],
      "c28": [
        "Περιμένεις το τηλεφώνημά μου;",
        "περιμένει με χαμόγελο",
        "προτιμά να έρθεις από κοντά"
      ],
      "c29": [
        "Σου αρέσουν οι αγκαλιές μου;",
        "οι πιο ζεστές στον κόσμο",
        "αγαπά να κρατιέστε από το χέρι"
      ],
      "c30": [
        "Διαβάζουμε φωναχτά ο ένας στον άλλον;",
        "διαλέγει ήδη βιβλίο",
        "προτιμά να σε ακούει"
      ],
      "c31": [
        "Βγάζουμε σήμερα μια κοινή φωτογραφία;",
        "ψάχνει ήδη όμορφο φόντο",
        "πρώτα κουβέντα"
      ],
      "c32": [
        "Σου φτιάχνω τη διάθεση;",
        "πάντα",
        "μαζί σου ακόμη και η λύπη είναι πιο ελαφριά"
      ],
      "c33": [
        "Παίρνουμε πρωινό μαζί αύριο;",
        "φτιάχνει ήδη κακάο",
        "ονειρεύεται να κοιμηθεί περισσότερο"
      ],
      "c34": [
        "Θυμάσαι τα γενέθλιά μου;",
        "χωρίς υπενθύμιση",
        "ετοιμάζει κρυφά μια έκπληξη"
      ],
      "c35": [
        "Πάμε για πατινάζ;",
        "βγάζει τα πατίνια",
        "θα σε επευφημεί από την άκρη"
      ],
      "c36": [
        "Είναι καλή μέρα για σένα σήμερα;",
        "υπέροχη μέρα",
        "θα γίνει καλύτερη όταν είσαι κοντά"
      ],
      "c37": [
        "Θα ζωγραφίσεις το πορτρέτο μου;",
        "πιάνει ήδη μολύβι",
        "θα ζωγραφίσει μια καρδούλα"
      ],
      "c38": [
        "Φυτεύουμε μαζί ένα δέντρο;",
        "διαλέγει το σημείο",
        "θα ξεκινήσει με ένα λουλούδι στο περβάζι"
      ],
      "c39": [
        "Θέλεις να ακούσεις ένα κομπλιμέντο;",
        "ανυπομονεί",
        "ντρέπεται, αλλά το θέλει πολύ"
      ],
      "c40": [
        "Ξαναπαίζουμε αργότερα;",
        "θέλει άλλον έναν γύρο",
        "προτιμά μια αγκαλιά από το παιχνίδι"
      ]
    },
    "loves": {
      "s01": [
        "Πού για διακοπές;",
        "Παραλία",
        "Βουνά",
        "Ταξίδι",
        "Λίγη μοναξιά"
      ],
      "s02": [
        "Το τέλειο βράδυ;",
        "Ταινία στο σπίτι",
        "Βόλτα",
        "Εστιατόριο",
        "Επιτραπέζια"
      ],
      "s03": [
        "Αγαπημένος καιρός;",
        "Ήλιος",
        "Βροχή",
        "Χιόνι",
        "Έναστρη νύχτα"
      ],
      "s04": [
        "Αγαπημένο ζώο;",
        "Γατάκι",
        "Κουτάβι",
        "Άλογο",
        "Δελφίνι"
      ],
      "s05": [
        "Τι τρώμε για βραδινό;",
        "Πίτσα",
        "Σούσι",
        "Γλυκά",
        "Μπάρμπεκιου"
      ],
      "s06": [
        "Αγαπημένο ρόφημα;",
        "Καφές",
        "Τσάι",
        "Ζεστή σοκολάτα",
        "Λεμονάδα"
      ],
      "s07": [
        "Αγαπημένη εποχή;",
        "Άνοιξη",
        "Καλοκαίρι",
        "Φθινόπωρο",
        "Χειμώνας"
      ],
      "s08": [
        "Αγαπημένα λουλούδια;",
        "Τριαντάφυλλα",
        "Τουλίπες",
        "Ηλιοτρόπια",
        "Λεβάντα"
      ],
      "s09": [
        "Πώς ξεκουράζεστε;",
        "Με ένα βιβλίο",
        "Ζωγραφίζοντας",
        "Με ποδήλατο",
        "Ύπνος στην αιώρα"
      ],
      "s10": [
        "Πώς ταξιδεύουμε;",
        "Με τρένο",
        "Με αεροπλάνο",
        "Με αυτοκίνητο",
        "Με πλοίο"
      ],
      "s11": [
        "Σπίτι των ονείρων;",
        "Διαμέρισμα στην πόλη",
        "Σπίτι δίπλα στη θάλασσα",
        "Καλύβα στα βουνά",
        "Φάρμα"
      ],
      "s12": [
        "Κάτι γλυκό;",
        "Παγωτό",
        "Σοκολάτα",
        "Τούρτα",
        "Φρούτα"
      ],
      "s13": [
        "Το τέλειο πρωινό;",
        "Πρωινό στο κρεβάτι",
        "Τρέξιμο",
        "Πολύς ύπνος",
        "Καφές στο μπαλκόνι"
      ],
      "s14": [
        "Ραντεβού των ονείρων;",
        "Πικνίκ",
        "Παγοδρόμιο",
        "Λούνα παρκ",
        "Αστέρια στην ταράτσα"
      ],
      "s15": [
        "Το καλύτερο δώρο;",
        "Μπουκέτο",
        "Γράμμα",
        "Ταξίδι",
        "Κουτί δώρου"
      ],
      "s16": [
        "Αγαπημένη φύση;",
        "Θάλασσα",
        "Δάσος",
        "Έρημος",
        "Βόρειο σέλας"
      ]
    },
    "who": [
      "Ποιος από εμάς αργεί πιο συχνά;",
      "Ποιος από εμάς κάνει πρώτα το βήμα για να τα βρούμε;",
      "Ποιος από εμάς μαγειρεύει καλύτερα;",
      "Ποιος από εμάς γελάει πιο συχνά;",
      "Ποιος από εμάς αργεί περισσότερο να ετοιμαστεί;",
      "Ποιος από εμάς χάνει πιο συχνά τα κλειδιά;",
      "Ποιος από εμάς θυμάται καλύτερα τις σημαντικές ημερομηνίες;",
      "Ποιος από εμάς αγαπά πιο πολύ τα γλυκά;",
      "Ποιος από εμάς αποκοιμιέται πρώτα;",
      "Ποιος από εμάς ξυπνά νωρίτερα;",
      "Ποιος από εμάς λέει πιο συχνά «μου λείπεις»;",
      "Ποιος από εμάς διαλέγει καλύτερα δώρα;",
      "Ποιος από εμάς αστειεύεται πιο συχνά;",
      "Ποιος από εμάς οδηγεί καλύτερα;",
      "Ποιος από εμάς μιλάει περισσότερο στο τηλέφωνο;",
      "Ποιος από εμάς αγαπά πιο πολύ τα ταξίδια;",
      "Ποιος από εμάς πληγώνεται πιο εύκολα;",
      "Ποιος από εμάς συγχωρεί πιο γρήγορα;",
      "Ποιος από εμάς βγάζει περισσότερες φωτογραφίες;",
      "Ποιος από εμάς τα πάει καλύτερα με τα χρήματα;",
      "Ποιος από εμάς αγοράζει πιο συχνά περιττά πράγματα;",
      "Ποιος από εμάς ξέρει να παρηγορεί καλύτερα;",
      "Ποιος από εμάς διατηρεί καλύτερα την ψυχραιμία στις δύσκολες στιγμές;",
      "Ποιος από εμάς ψάχνει πάντα το κινητό;",
      "Ποιος από εμάς αγαπά πιο πολύ να έχει καλεσμένους;",
      "Ποιος από εμάς φτιάχνει πιο συχνά πρωινό;",
      "Ποιος από εμάς προσανατολίζεται καλύτερα σε μια άγνωστη πόλη;",
      "Ποιος από εμάς γράφει μεγαλύτερα μηνύματα;",
      "Ποιος από εμάς προτείνει πρώτα βόλτα;",
      "Ποιος από εμάς αγαπά πιο πολύ τα ζώα;",
      "Ποιος από εμάς κρατά καλύτερα μυστικά;",
      "Ποιος από εμάς αργεί περισσότερο να διαλέξει από το μενού;",
      "Ποιος από εμάς ανησυχεί περισσότερο για τα αγαπημένα πρόσωπα;",
      "Ποιος από εμάς κάνει περισσότερες εκπλήξεις;",
      "Ποιος από εμάς κρατά καλύτερα την τάξη;",
      "Ποιος από εμάς προσέχει πρώτα ένα καινούργιο κούρεμα;",
      "Ποιος από εμάς θυμάται πιο συχνά αστείες ιστορίες;",
      "Ποιος από εμάς έχει περισσότερη υπομονή;",
      "Ποιος από εμάς λέει πιο συχνά «ευχαριστώ»;",
      "Ποιος από εμάς προσφέρει πρώτα βοήθεια;"
    ],
    "phrases": [
      "Χαμογελάω όταν εσύ…",
      "Η αγαπημένη μου μέρα μαζί σου είναι…",
      "Σε ευχαριστώ για…",
      "Όταν νιώθω λύπη, με βοηθά…",
      "Κάποια μέρα θέλω να…",
      "Η πιο ζεστή ανάμνηση από εμάς είναι…",
      "Κανείς δεν ξέρει καλύτερα από σένα να…",
      "Νιώθω ηρεμία όταν…",
      "Αν είχαμε μια ολόκληρη ελεύθερη μέρα, θα…",
      "Νιώθω περηφάνια για σένα, γιατί…",
      "Η τέλεια βραδιά μας είναι…",
      "Δεν θα ξεχάσω ποτέ πώς…",
      "Μου αρέσει όταν λες…",
      "Του χρόνου θέλω να…",
      "Για μένα είσαι σαν…",
      "Το καλύτερο δώρο από σένα είναι…",
      "Μου λείπεις όταν…",
      "Γελάμε περισσότερο όταν…",
      "Καιρό ήθελα να σου πω…",
      "Το μέρος μας είναι…",
      "Όταν σε σκέφτομαι, …",
      "Κάνεις τη μέρα μου καλύτερη όταν…",
      "Μου αρέσει η συνήθειά μας να…",
      "Η ευχή μου για εμάς: …",
      "Το πιο αστείο που μας έχει συμβεί είναι…",
      "Νιώθω τη φροντίδα σου όταν…",
      "Ένα πρωινό μαζί σου είναι…",
      "Αν ήμασταν μία λέξη, θα ήταν…",
      "Θέλω να μάθω από σένα πώς να…",
      "Σε ευχαριστώ που πάντα…"
    ]
  },
  "da": {
    "text": {
      "homeLink": "Spil for to",
      "eyebrow": "GLOWLETTER · SPIL FOR TO",
      "title": "Spil sammen",
      "close": "Luk",
      "lead": "Send et spil til en, du holder af. Det er gratis at spille fra et link og kræver ingen konto.",
      "quizTitle": "Hvor godt kender du mig?",
      "quizNote": "Svar på spørgsmål om dig selv, og lad en, der står dig nær, gætte. Resultatet kommer til dig.",
      "create": "Lav en quiz",
      "soon": "Snart",
      "soonTitle": "Flere spil er på vej",
      "duel": "Duellen “Hvem er hurtigst”",
      "loves": "Det, vi elsker",
      "cards": "Huskekort for to",
      "who": "Hvem af os?",
      "phrase": "Gør sætningen færdig",
      "myQuizzes": "Mine quizzer",
      "noQuizzes": "Ingen quizzer endnu. Den første tager et par minutter.",
      "forWhom": "Til {name}",
      "noRecipient": "Quiz",
      "resultsCount": "Resultater: {count}",
      "newResults": "Nyt: {count}",
      "noResults": "Ingen har spillet endnu.",
      "anonymous": "Uden navn",
      "results": "Resultater",
      "copyLink": "Kopiér link",
      "share": "Send",
      "deleteQuiz": "Slet quiz",
      "deleteConfirm": "Slet denne quiz og dens resultater? Linket holder op med at virke.",
      "deleted": "Quizzen er slettet",
      "linkCopied": "Link kopieret",
      "back": "Tilbage",
      "next": "Næste",
      "stepNames": "Trin 1 af 2 · Navne",
      "yourName": "Dit navn",
      "yourNamePlaceholder": "Hvad hedder du",
      "recipient": "Til hvem · valgfrit",
      "recipientPlaceholder": "Navnet på din kære",
      "nameRequired": "Skriv dit navn.",
      "forbiddenName": "Skriv et almindeligt navn.",
      "stepAnswers": "Trin 2 af 2 · Dine svar",
      "answersLead": "Markér det, der passer på dig. Alle spørgsmål kan byttes ud.",
      "swap": "Andet spørgsmål",
      "progress": "{done} af {total} besvaret",
      "answerAll": "Vælg et svar til hvert spørgsmål.",
      "finish": "Hent linket",
      "creating": "Laver quizzen…",
      "createdTitle": "Din quiz er klar!",
      "createdLead": "Send linket. Når der er svaret, kan du se resultatet under “Mine quizzer”.",
      "shareText": "{name} inviterer dig til spillet “Hvor godt kender du mig?”",
      "signInTitle": "Log ind for at fortsætte",
      "signInNote": "Quizzen gemmes på din konto, så resultaterne kommer til dig.",
      "signIn": "Log ind",
      "premiumNote": "At lave spil hører til fuld adgang. At spille fra et link er gratis for alle.",
      "failed": "Det lykkedes ikke. Tjek forbindelsen, og prøv igen.",
      "rateLimited": "For mange forsøg. Prøv igen senere.",
      "playEyebrow": "ET SPIL FOR TO",
      "playInvite": "{name} inviterer dig til at spille",
      "playLead": "Spørgsmål: {count}. Gæt svarene — til sidst ser du, hvor mange der passer.",
      "playName": "Dit navn · valgfrit",
      "playNamePlaceholder": "Så de ved, det er dig",
      "start": "Start",
      "playLoading": "Indlæser spillet…",
      "playMissing": "Spillet er ikke tilgængeligt: linket er slettet eller udløbet.",
      "playOffline": "Spillet kræver internetforbindelse.",
      "retry": "Prøv igen",
      "questionOf": "Spørgsmål {n} af {total}",
      "asks": "{name} spørger",
      "counting": "Tæller sammenfald…",
      "scoreOf": "{score} af {total}",
      "tierAll": "Perfekt! I kender hinanden bedre end nogen anden",
      "tierHigh": "I kender hinanden rigtig godt",
      "tierMid": "Ikke dårligt! Der er mere at opdage",
      "tierLow": "Mange dejlige opdagelser venter",
      "sentTo": "{name} kan se dit resultat",
      "review": "Dine svar",
      "rightAnswer": "Rigtigt svar",
      "makeOwn": "Lav min egen quiz",
      "home": "Forside",
      "resultToast": "{name}: {score} af {total} i “Hvor godt kender du mig?”",
      "ownerAnswers": "Opretterens svar",
      "playerAnswers": "Svar fra {name}",
      "paywallTitle": "Spil, sjov<br><em>og breve</em>",
      "groupGames": "Spil",
      "groupFun": "Sjov",
      "groupLetters": "Breve",
      "featQuiz": "“Hvor godt kender du mig?” — resultatet kommer til dig",
      "featGamesSoon": "Duellen “Hvem er hurtigst”, “Det, vi elsker”, huskekort med bamser",
      "featFunSoon": "“Hvem af os?” og “Gør sætningen færdig” med parrets bog",
      "featCollection": "Hele samlingen af breve og digte på 25 sprog",
      "featMoments": "Øjeblikke, påmindelser og et QR-brev, der åbner på den rigtige dag",
      "featAudio": "Din egen lyd i brevet og svar fra modtageren",
      "ynTitle": "Ja eller nej",
      "ynNote": "Et livespil for to: 5 sekunder per kort. Den, der svarer i tide, ser den andens svar.",
      "ynCreate": "Opret rum",
      "ynWaiting": "Vi venter på, at {name} åbner linket…",
      "ynWaitingAny": "Vi venter på den anden…",
      "ynShareText": "{name} inviterer dig til livespillet “Ja eller nej”",
      "ynPartnerHere": "{name} er her!",
      "ynStart": "Start spillet",
      "ynWaitHost": "{name} starter snart spillet",
      "ynYes": "Ja",
      "ynNo": "Nej",
      "ynMissed": "For sent — kortet forbliver lukket",
      "ynMatch": "Samme svar!",
      "ynRound": "Kort {n} af {total}",
      "ynAnswered": "Svaret er sendt, vi venter på den anden…",
      "ynFinal": "{score} af {total} ens",
      "ynFinalHigh": "I forstår hinanden uden ord",
      "ynFinalMid": "Så forskellige — og så tæt på",
      "ynAgain": "Spil igen",
      "ynLeft": "Den anden har mistet forbindelsen. Vi venter…",
      "ynYou": "Dig",
      "ynOffline": "Kan ikke forbinde til spillet. Tjek internettet og åbn linket igen.",
      "ynJoin": "Deltag i spillet",
      "ynJoinLead": "{name} venter på dig. 5 sekunder per svar!",
      "ynStepNames": "Dit navn og den andens",
      "ynRoomReady": "Rummet er klar — send linket",
      "ynStayHere": "Hold skærmen åben: spillet starter, når linket bliver åbnet.",
      "featYesNo": "Livespillet “Ja eller nej” — 5 sekunder per svar",
      "ynPartnerMissed": "Intet svar — tiden løb ud",
      "lvTitle": "Det, vi elsker",
      "lvNote": "Et livespil for to: 4 billeder og 10 sekunder til at vælge det, du holder mest af. I må gerne vælge det samme!",
      "lvShareText": "{name} inviterer dig til livespillet “Det, vi elsker”",
      "lvJoinLead": "{name} venter på dig. Vælg det billede, du holder mest af!",
      "lvRound": "Emne {n} af {total}",
      "lvPick": "Vælg det, du holder mest af",
      "lvBoth": "I valgte begge: {item}",
      "lvCommon": "I elsker begge",
      "lvDiff": "Forskellig smag — endnu mere spændende!",
      "lvFinalHigh": "I har så meget til fælles!",
      "lvFinalMid": "Så forskellige — og I supplerer hinanden",
      "featLoves": "Livespillet “Det, vi elsker” — 4 billeder, vælg sammen",
      "featGamesSoon2": "Duellen “Hvem er hurtigst” og huskekort med bamser",
      "mcTitle": "Huskekort med bamser",
      "mcNote": "Et live vendespil for to: vend skiftevis to kort og find parrene. Tre niveauer, fra 8 til 16 kort.",
      "mcShareText": "{name} inviterer dig til livespillet “Huskekort med bamser”",
      "mcJoinLead": "{name} venter på dig. Find parrene på skift!",
      "mcLevel": "Niveau {n} af {total}",
      "mcTurnYou": "Din tur — vend to kort",
      "mcTurnThem": "{name}s tur",
      "mcPairs": "Fundne par: {found} af {total}",
      "mcLevelDone": "Alle par er fundet!",
      "mcTimeUp": "Tiden for niveauet er gået",
      "mcNext": "Næste: niveau {n}",
      "mcFinal": "Fundne par: {found} af {total}",
      "mcFinalHigh": "Sikke et hold!",
      "mcFinalMid": "Godt spil — en gang til?",
      "featCards": "Livespillet “Huskekort med bamser” — find par sammen",
      "featGamesSoon3": "Duellen “Hvem er hurtigst”",
      "duTitle": "Hvem er hurtigst",
      "duNote": "En live-duel: ét ord og fire billeder. Tryk først på det rigtige billede — et forkert tryk koster runden.",
      "duShareText": "{name} udfordrer dig til live-duellen »Hvem er hurtigst«",
      "duJoinLead": "{name} venter på dig. Find det rigtige billede hurtigere!",
      "duRound": "Runde {n} af {total}",
      "duFind": "Find: {item}",
      "duYouWon": "Du var hurtigst!",
      "duTheyWon": "{name} var hurtigst",
      "duWrong": "Forkert billede — runden er tabt",
      "duNobody": "Ingen nåede at finde det",
      "duScore": "Du {you} : {them} {name}",
      "duFinalWin": "Sejr! Skarpe øjne i dag.",
      "duFinalLose": "{name} vinder denne gang — revanche?",
      "duFinalDraw": "Uafgjort — helt lige!",
      "duSeconds": "{s} s",
      "featDuel": "Live-duellen »Hvem er hurtigst« — find billedet først",
      "whoTitle": "Hvem af os?",
      "whoNote": "Et livespil for to: ét spørgsmål, tryk på »Mig« eller din partners navn. Se, om I er enige om hinanden.",
      "whoShareText": "{name} inviterer dig til livespillet »Hvem af os?«",
      "whoJoinLead": "{name} venter på dig. Svar ærligt — og sammenlign bagefter!",
      "whoRound": "Spørgsmål {n} af {total}",
      "whoMe": "Mig",
      "whoAgree": "I er enige: {name}",
      "whoDiffer": "I er uenige — snak om det!",
      "whoFinal": "I var enige {score} ud af {total} gange",
      "whoFinalHigh": "I ser virkelig hinanden!",
      "whoFinalMid": "Meget at snakke om — og det er dejligt",
      "featWho": "Livespillet »Hvem af os?« — se, om I er enige",
      "phTitle": "Gør sætningen færdig",
      "phNote": "Et livespil for to: I gør begge den samme varme sætning færdig med jeres egne ord og læser så hinandens svar.",
      "phShareText": "{name} inviterer dig til livespillet »Gør sætningen færdig«",
      "phJoinLead": "{name} venter på dig. Gør hver sætning færdig med dine egne ord!",
      "phRound": "Sætning {n} af {total}",
      "phPlaceholder": "Din fortsættelse…",
      "phDone": "Færdig",
      "phWaiting": "Venter på {name}…",
      "phSkipped": "Intet svar",
      "phSave": "Gem i parrets bog",
      "phSaved": "Gemt i parrets bog",
      "phForbidden": "Skriv uden links og grimme ord.",
      "phNext": "Næste sætning",
      "phFinal": "Sætninger gjort færdige sammen: {count}",
      "phFinalLead": "Gem de svar, I bedst kan lide, i parrets bog.",
      "featPhrase": "Livespillet »Gør sætningen færdig« med parrets bog",
      "bookTitle": "Parrets bog",
      "bookNote": "De varmeste svar fra »Gør sætningen færdig«, gemt på din konto.",
      "bookOpen": "Åbn bogen",
      "bookEmpty": "Bogen er tom indtil videre. Spil »Gør sætningen færdig«, og gem de svar, du kan lide.",
      "bookDelete": "Slet",
      "bookDeleteConfirm": "Slet denne side fra bogen?",
      "bookYou": "Du",
      "inviteTitle": "Inviter en ven",
      "inviteNote": "Din ven får en besked med spillet.",
      "invite": "Inviter",
      "invited": "Inviteret",
      "inviteNone": "Tilføj venner under »Venner« for at invitere dem med ét tryk.",
      "inviteSent": "Invitation sendt til {name}"
    },
    "questions": {
      "q01": [
        "Min yndlingsårstid?",
        "Forår",
        "Sommer",
        "Efterår",
        "Vinter"
      ],
      "q02": [
        "Hvad vælger jeg til morgenmad?",
        "Kaffe og croissant",
        "Havregrød",
        "Æg",
        "Kun te"
      ],
      "q03": [
        "Min perfekte fridag?",
        "Hjemme under et tæppe",
        "En gåtur i parken",
        "En tur ud af byen",
        "Tid med venner"
      ],
      "q04": [
        "Hvor drømmer jeg om at rejse hen?",
        "Til havet",
        "Til bjergene",
        "Til en storby",
        "Til et hyggeligt hus på landet"
      ],
      "q05": [
        "Min yndlingsis?",
        "Vanilje",
        "Chokolade",
        "Jordbær",
        "Pistacie"
      ],
      "q06": [
        "Hvad gør mig glad hurtigst?",
        "Et kram",
        "En overraskelse",
        "Søde ord",
        "Noget lækkert"
      ],
      "q07": [
        "Jeg er mest…",
        "Et morgenmenneske",
        "Et B-menneske",
        "En, der sover, når det kan lade sig gøre",
        "Fan af middagslure"
      ],
      "q08": [
        "Hvilken film vælger jeg i aften?",
        "En komedie",
        "En romantisk historie",
        "En krimi",
        "En tegnefilm"
      ],
      "q09": [
        "Min yndlingsfarve?",
        "Rød",
        "Blå",
        "Grøn",
        "Lyserød"
      ],
      "q10": [
        "Hvad er jeg mest bange for?",
        "Edderkopper",
        "Højder",
        "Mørke",
        "At komme for sent"
      ],
      "q11": [
        "Hvilke blomster elsker jeg?",
        "Roser",
        "Tulipaner",
        "Pæoner",
        "Margueritter"
      ],
      "q12": [
        "Hvad gør jeg, når jeg er ked af det?",
        "Ringer til en, der står mig nær",
        "Spiser noget sødt",
        "Går en tur",
        "Går i seng"
      ],
      "q13": [
        "Hvilket dyr står mit hjerte nærmest?",
        "En killing",
        "En hund",
        "En bjørneunge",
        "En lille ræv"
      ],
      "q14": [
        "Den bedste gave til mig?",
        "Noget hjemmelavet",
        "En rejse",
        "Et smykke",
        "En bog"
      ],
      "q15": [
        "Min yndlingsdrik?",
        "Sort te",
        "Grøn te",
        "Kaffe",
        "Varm kakao"
      ],
      "q16": [
        "Min yndlingssnack?",
        "Chokolade",
        "Chips",
        "Frugt",
        "Et stykke kage"
      ],
      "q17": [
        "Hvad vælger jeg på rejser?",
        "Museer",
        "Stranden",
        "Den lokale mad",
        "At slentre uden plan"
      ],
      "q18": [
        "Hvordan bruger jeg helst aftenen?",
        "Med en bog",
        "Med en serie",
        "Med en god snak",
        "På en gåtur"
      ],
      "q19": [
        "Hvilket vejr kan jeg bedst lide?",
        "Solskin",
        "Lun regn",
        "Snefald",
        "En let brise"
      ],
      "q20": [
        "Hvilken superkraft ville passe til mig?",
        "At flyve",
        "At læse tanker",
        "At stoppe tiden",
        "At teleportere"
      ],
      "q21": [
        "Hvad betyder mest for mig hos mine nærmeste?",
        "Tillid",
        "Omsorg",
        "Humor",
        "Støtte"
      ],
      "q22": [
        "Hvilken højtid glæder jeg mig mest til?",
        "Nytår",
        "Min fødselsdag",
        "Sommerferien",
        "Valentinsdag"
      ],
      "q23": [
        "Hvordan siger jeg oftest “jeg elsker dig”?",
        "Med ord",
        "Med handlinger",
        "Med kram",
        "Med gaver"
      ],
      "q24": [
        "Hvad bestiller jeg på en café?",
        "Pasta",
        "Sushi",
        "En salat",
        "En dessert"
      ],
      "q25": [
        "Mit yndlingstidspunkt på dagen?",
        "Morgenen",
        "Eftermiddagen",
        "Aftenen",
        "Natten"
      ],
      "q26": [
        "Hvilket køkken vælger jeg?",
        "Italiensk",
        "Japansk",
        "Hjemmelavet",
        "Mexicansk"
      ],
      "q27": [
        "Hvor tænker jeg bedst?",
        "I bad",
        "På gåtur",
        "På farten",
        "Før jeg falder i søvn"
      ],
      "q28": [
        "Hvad gør jeg først om morgenen?",
        "Tjekker telefonen",
        "Drikker vand",
        "Laver kaffe",
        "Bliver liggende lidt endnu"
      ],
      "q29": [
        "Min yndlingsfrugt?",
        "Æble",
        "Banan",
        "Mango",
        "Vandmelon"
      ],
      "q30": [
        "Hvilken hobby passer bedst til mig?",
        "Tegning",
        "Madlavning",
        "Sport",
        "Læsning"
      ],
      "q31": [
        "Hvordan vil jeg fejre min fødselsdag?",
        "Med en stor fest",
        "Med en middag for to",
        "Med en rejse",
        "Med en stille aften derhjemme"
      ],
      "q32": [
        "Hvad synes jeg om overraskelser?",
        "Jeg elsker dem",
        "De gør mig lidt nervøs",
        "Jeg kan godt lide at lave dem for andre",
        "Jeg vil helst vide det på forhånd"
      ],
      "q33": [
        "Hvilken sødt kan jeg bedst lide?",
        "Kage",
        "Is",
        "Småkager",
        "Slik"
      ],
      "q34": [
        "Hvad tager jeg med på en øde ø?",
        "En bog",
        "Min telefon",
        "Et tæppe",
        "Et kamera"
      ],
      "q35": [
        "Hvordan slapper jeg af efter en hård dag?",
        "Et varmt bad",
        "En serie",
        "En gåtur",
        "En snak med en, der står mig nær"
      ],
      "q36": [
        "Hvordan rejser jeg helst?",
        "Med tog",
        "Med fly",
        "Med bil",
        "På cykel"
      ],
      "q37": [
        "Min yndlingsleg som barn?",
        "Gemmeleg",
        "Tagfat",
        "Byggeklodser",
        "Tegning"
      ],
      "q38": [
        "Hvilket eventyr står mig nærmest?",
        "Askepot",
        "Den lille prins",
        "Peter Plys",
        "Alice i Eventyrland"
      ],
      "q39": [
        "Hvordan glæder jeg helst en, jeg holder af?",
        "Med en overraskelse",
        "Med et kort",
        "Med en rejse",
        "Med en middag"
      ],
      "q40": [
        "Hvad fotograferer jeg oftest?",
        "Mig selv",
        "Naturen",
        "Mad",
        "Jeg tager næsten ikke billeder"
      ],
      "q41": [
        "Mit yndlingssted derhjemme?",
        "Sengen",
        "Køkkenet",
        "Sofaen",
        "Altanen"
      ],
      "q42": [
        "Hvad lægger jeg først mærke til hos et menneske?",
        "Smilet",
        "Øjnene",
        "Stemmen",
        "Humoren"
      ],
      "q43": [
        "Hvad får mig hurtigst til at grine?",
        "Sjove videoer",
        "Mine kæres jokes",
        "Pinlige situationer",
        "Dyr"
      ],
      "q44": [
        "Hvad drikker jeg på en varm sommerdag?",
        "Lemonade",
        "Iste",
        "Juice",
        "Vand med is"
      ],
      "q45": [
        "Hvilket element står mig nærmest?",
        "Vand",
        "Ild",
        "Jord",
        "Luft"
      ],
      "q46": [
        "Hvilke historier elsker jeg?",
        "Eventyr",
        "Kærlighedshistorier",
        "Science fiction",
        "Sande historier"
      ],
      "q47": [
        "Hvordan bruger jeg en regnvejrsdag?",
        "Læser",
        "Sover",
        "Ser en film",
        "Går tur med paraply"
      ],
      "q48": [
        "Hvad sætter jeg mest pris på ved en gave?",
        "Omtanken",
        "Nytten",
        "Skønheden",
        "Overraskelsen"
      ],
      "q49": [
        "Hvilke kartofler vælger jeg?",
        "Mos",
        "Pommes frites",
        "Ovnbagte",
        "Chips"
      ],
      "q50": [
        "Hvor går jeg først hen i en ny by?",
        "På café",
        "På museum",
        "I en park",
        "På shopping"
      ],
      "q51": [
        "Hvad gør jeg, når jeg ikke kan sove?",
        "Læser",
        "Scroller på telefonen",
        "Tæller får",
        "Drikker varm mælk"
      ],
      "q52": [
        "Hvordan forbereder jeg mig til en vigtig dag?",
        "Planlægger alt i forvejen",
        "Gør alt i sidste øjeblik",
        "Beder om hjælp",
        "Bliver nervøs og sover dårligt"
      ],
      "q53": [
        "Hvilken sport ser jeg helst?",
        "Fodbold",
        "Tennis",
        "Kunstskøjteløb",
        "Jeg ser ikke sport"
      ],
      "q54": [
        "Hvilket kæledyr passer til mig?",
        "En kat",
        "En hund",
        "En papegøje",
        "En hamster"
      ],
      "q55": [
        "Hvilke beskeder skriver jeg?",
        "Lange",
        "Korte",
        "Fulde af emojis",
        "Talebeskeder"
      ],
      "q56": [
        "Hvilken gave har jeg gemt længst?",
        "Et brev",
        "Et legetøj",
        "Et foto",
        "Et smykke"
      ],
      "q57": [
        "Hvad vælger jeg hellere?",
        "Te ved pejsen",
        "Picnic i græsset",
        "En gåtur ved havet",
        "En tur i biografen"
      ],
      "q58": [
        "Hvilken kompliment gør mig gladest?",
        "Om mit udseende",
        "Om min klogskab",
        "Om min venlighed",
        "Om min humor"
      ],
      "q59": [
        "Min perfekte morgen?",
        "Morgenmad på sengen",
        "En tidlig løbetur",
        "At sove længe",
        "Kaffe på altanen"
      ],
      "q60": [
        "Hvad vil jeg lære?",
        "At danse",
        "At lave mad",
        "Et nyt sprog",
        "At tegne"
      ]
    },
    "yesNo": {
      "c01": [
        "Savner du mig lige nu?",
        "savner dig meget",
        "holder ud, men tænker på dig"
      ],
      "c02": [
        "Smiler du, når du ser min besked?",
        "smiler altid",
        "smiler indvendigt"
      ],
      "c03": [
        "Kan du huske vores første møde?",
        "husker hvert minut",
        "husker det vigtigste — dig"
      ],
      "c04": [
        "Vil du have et kram i dag?",
        "venter på dit kram",
        "gemmer krammene til senere"
      ],
      "c05": [
        "Skal vi tage til havet sammen?",
        "pakker allerede kufferten",
        "drømmer om bjergene"
      ],
      "c06": [
        "Får jeg dig til at grine?",
        "griner af hjertet",
        "skjuler et smil"
      ],
      "c07": [
        "Føler du dig rolig sammen med mig?",
        "føler ro ved siden af dig",
        "har det sjovt med dig"
      ],
      "c08": [
        "Tænker du på mig i løbet af dagen?",
        "tænker meget ofte på dig",
        "tænker på dig lige nu"
      ],
      "c09": [
        "Elsker du mine overraskelser?",
        "elsker dine overraskelser",
        "holder mest af, når du bare er der"
      ],
      "c10": [
        "Skal vi bage en tærte sammen?",
        "tager allerede forklædet på",
        "køber hellere en kage"
      ],
      "c11": [
        "Skal vi se en film i aften?",
        "vælger allerede film",
        "vil hellere bare snakke"
      ],
      "c12": [
        "Kan du lide min stemme?",
        "kunne lytte i det uendelige",
        "elsker din latter endnu mere"
      ],
      "c13": [
        "Skal vi holde picnic i weekenden?",
        "gør tæppet klar",
        "inviterer dig på en hyggelig café"
      ],
      "c14": [
        "Vil du have et brev fra mig?",
        "venter på dit brev",
        "vil høre det hele ansigt til ansigt"
      ],
      "c15": [
        "Betyder jeg meget for dig?",
        "du betyder enormt meget",
        "mere end du tror"
      ],
      "c16": [
        "Skal vi gå en tur i regnen?",
        "tager en paraply til to",
        "laver hellere te derhjemme"
      ],
      "c17": [
        "Ligner vi hinanden?",
        "I er som to halvdele",
        "I supplerer hinanden perfekt"
      ],
      "c18": [
        "Kan du lide min mad?",
        "vil have mere",
        "elsker at lave mad sammen med dig"
      ],
      "c19": [
        "Skal vi få et kæledyr sammen?",
        "vælger allerede navn",
        "en bamse er nok indtil videre"
      ],
      "c20": [
        "Ved du, hvad jeg elsker?",
        "kan det udenad",
        "vil gerne vide endnu mere"
      ],
      "c21": [
        "Skal vi danse?",
        "rækker allerede hånden frem",
        "klapper med"
      ],
      "c22": [
        "Inspirerer jeg dig?",
        "du inspirerer hver dag",
        "ved siden af dig er der bare varmt"
      ],
      "c23": [
        "Gemmer du vores billeder?",
        "passer på hvert eneste",
        "venter på nye, endnu smukkere"
      ],
      "c24": [
        "Skal vi se solopgangen sammen?",
        "stiller allerede vækkeuret",
        "ser hellere solnedgangen"
      ],
      "c25": [
        "Vil du fortælle mig en hemmelighed?",
        "hvisker den i dit øre",
        "lad den forblive et mysterium"
      ],
      "c26": [
        "Tror du på mig?",
        "tror stærkt på dig",
        "hepper på dig hver dag"
      ],
      "c27": [
        "Skal vi rejse væk, kun os to?",
        "drømmer om det",
        "tager alle de kære med"
      ],
      "c28": [
        "Venter du på mit opkald?",
        "venter med et smil",
        "vil hellere have, at du kommer forbi"
      ],
      "c29": [
        "Kan du lide mine kram?",
        "verdens varmeste",
        "holder gerne i hånd"
      ],
      "c30": [
        "Skal vi læse højt for hinanden?",
        "vælger allerede en bog",
        "lytter hellere til dig"
      ],
      "c31": [
        "Skal vi tage et billede sammen i dag?",
        "leder allerede efter en fin baggrund",
        "først en snak"
      ],
      "c32": [
        "Gør jeg dig gladere?",
        "altid",
        "med dig er selv sorg lettere"
      ],
      "c33": [
        "Skal vi spise morgenmad sammen i morgen?",
        "laver allerede kakao",
        "drømmer om at sove længe"
      ],
      "c34": [
        "Kan du huske min fødselsdag?",
        "uden påmindelse",
        "planlægger i hemmelighed en overraskelse"
      ],
      "c35": [
        "Skal vi stå på skøjter?",
        "finder skøjterne frem",
        "hepper på dig fra kanten"
      ],
      "c36": [
        "Er i dag en god dag for dig?",
        "en fantastisk dag",
        "bliver bedre, når du er der"
      ],
      "c37": [
        "Tegner du mit portræt?",
        "tager allerede blyanten",
        "tegner et lille hjerte"
      ],
      "c38": [
        "Skal vi plante et træ sammen?",
        "vælger stedet",
        "starter med en blomst i vindueskarmen"
      ],
      "c39": [
        "Vil du høre et kompliment?",
        "kan ikke vente",
        "er genert, men vil så gerne"
      ],
      "c40": [
        "Skal vi spille igen senere?",
        "vil have en runde til",
        "krammer hellere end at spille"
      ]
    },
    "loves": {
      "s01": [
        "Hvor på ferie?",
        "Strand",
        "Bjerge",
        "Rejser",
        "Alenetid"
      ],
      "s02": [
        "Den perfekte aften?",
        "Film derhjemme",
        "Gåtur",
        "Restaurant",
        "Brætspil"
      ],
      "s03": [
        "Yndlingsvejr?",
        "Sol",
        "Regn",
        "Sne",
        "Stjerneklar nat"
      ],
      "s04": [
        "Yndlingsdyr?",
        "Killing",
        "Hvalp",
        "Hest",
        "Delfin"
      ],
      "s05": [
        "Hvad skal vi have til aftensmad?",
        "Pizza",
        "Sushi",
        "Kager",
        "Grill"
      ],
      "s06": [
        "Yndlingsdrik?",
        "Kaffe",
        "Te",
        "Varm kakao",
        "Lemonade"
      ],
      "s07": [
        "Yndlingsårstid?",
        "Forår",
        "Sommer",
        "Efterår",
        "Vinter"
      ],
      "s08": [
        "Yndlingsblomster?",
        "Roser",
        "Tulipaner",
        "Solsikker",
        "Lavendel"
      ],
      "s09": [
        "Hvordan slapper du af?",
        "Med en bog",
        "Tegner",
        "På cykel",
        "Lur i hængekøjen"
      ],
      "s10": [
        "Hvordan rejser vi?",
        "Med tog",
        "Med fly",
        "Med bil",
        "Med skib"
      ],
      "s11": [
        "Drømmehjem?",
        "Lejlighed i byen",
        "Hus ved havet",
        "Hytte i bjergene",
        "Gård"
      ],
      "s12": [
        "Noget sødt?",
        "Is",
        "Chokolade",
        "Kage",
        "Frugt"
      ],
      "s13": [
        "Den perfekte morgen?",
        "Morgenmad på sengen",
        "Løbetur",
        "Sove længe",
        "Kaffe på altanen"
      ],
      "s14": [
        "Drømmedate?",
        "Picnic",
        "Skøjtebane",
        "Forlystelsespark",
        "Stjerner på taget"
      ],
      "s15": [
        "Den bedste gave?",
        "En buket",
        "Et brev",
        "En rejse",
        "En gaveæske"
      ],
      "s16": [
        "Yndlingsnatur?",
        "Hav",
        "Skov",
        "Ørken",
        "Nordlys"
      ]
    },
    "who": [
      "Hvem af os kommer oftest for sent?",
      "Hvem af os slutter fred først?",
      "Hvem af os laver bedst mad?",
      "Hvem af os griner oftest?",
      "Hvem af os er længst tid om at gøre sig klar?",
      "Hvem af os mister oftest nøglerne?",
      "Hvem af os husker vigtige datoer bedst?",
      "Hvem af os har den største søde tand?",
      "Hvem af os falder først i søvn?",
      "Hvem af os står tidligst op?",
      "Hvem af os siger oftest »jeg savner dig«?",
      "Hvem af os vælger de bedste gaver?",
      "Hvem af os laver oftest sjov?",
      "Hvem af os kører bedst bil?",
      "Hvem af os taler længst i telefon?",
      "Hvem af os elsker mest at rejse?",
      "Hvem af os bliver lettest såret?",
      "Hvem af os tilgiver hurtigst?",
      "Hvem af os tager flest billeder?",
      "Hvem af os er bedst til at styre pengene?",
      "Hvem af os køber oftest ting, vi ikke har brug for?",
      "Hvem af os er bedst til at trøste?",
      "Hvem af os bevarer roen bedst i svære stunder?",
      "Hvem af os leder altid efter sin telefon?",
      "Hvem af os elsker mest at have gæster?",
      "Hvem af os laver oftest morgenmad?",
      "Hvem af os finder bedst vej i en ny by?",
      "Hvem af os skriver de længste beskeder?",
      "Hvem af os foreslår først en gåtur?",
      "Hvem af os elsker dyr mest?",
      "Hvem af os er bedst til at holde på en hemmelighed?",
      "Hvem af os er længst tid om at vælge fra menuen?",
      "Hvem af os bekymrer sig mest for sine kære?",
      "Hvem af os laver flest overraskelser?",
      "Hvem af os er mest ordentlig?",
      "Hvem af os bemærker først en ny frisure?",
      "Hvem af os husker oftest sjove historier?",
      "Hvem af os er mest tålmodig?",
      "Hvem af os siger oftest »tak«?",
      "Hvem af os tilbyder først hjælp?"
    ],
    "phrases": [
      "Jeg smiler, når du…",
      "Min yndlingsdag med dig er…",
      "Tak for…",
      "Når jeg er ked af det, hjælper det at…",
      "En dag vil jeg gerne have, at vi…",
      "Det varmeste minde om os er…",
      "Du er bedst til at…",
      "Jeg føler mig rolig, når…",
      "Hvis vi havde en hel fri dag, ville vi…",
      "Jeg er stolt af dig, fordi…",
      "Vores perfekte aften er…",
      "Jeg glemmer aldrig, hvordan du…",
      "Jeg kan lide, når du siger…",
      "Næste år vil jeg gerne have, at vi…",
      "For mig er du som…",
      "Den bedste gave fra dig er…",
      "Jeg savner dig, når…",
      "Vi er sjovest, når…",
      "Jeg har længe gerne villet sige til dig…",
      "Vores sted er…",
      "Når jeg tænker på dig, så…",
      "Du gør min dag bedre, når…",
      "Jeg kan lide vores vane med at…",
      "Mit ønske for os: …",
      "Det sjoveste, der er sket for os, er…",
      "Jeg mærker din omsorg, når du…",
      "En morgen med dig er…",
      "Hvis vi var ét ord, ville det være…",
      "Jeg vil gerne lære af dig, hvordan man…",
      "Tak, fordi du altid…"
    ]
  },
  "no": {
    "text": {
      "homeLink": "Spill for to",
      "eyebrow": "GLOWLETTER · SPILL FOR TO",
      "title": "Spill sammen",
      "close": "Lukk",
      "lead": "Send et spill til noen du er glad i. Det er gratis å spille fra en lenke, og det trengs ingen konto.",
      "quizTitle": "Hvor godt kjenner du meg?",
      "quizNote": "Svar på spørsmål om deg selv, og la noen som står deg nær, gjette. Resultatet kommer til deg.",
      "create": "Lag en quiz",
      "soon": "Snart",
      "soonTitle": "Flere spill er på vei",
      "duel": "Duellen «Hvem er raskest»",
      "loves": "Det vi elsker",
      "cards": "Huskekort for to",
      "who": "Hvem av oss?",
      "phrase": "Fullfør setningen",
      "myQuizzes": "Mine quizer",
      "noQuizzes": "Ingen quizer ennå. Den første tar et par minutter.",
      "forWhom": "Til {name}",
      "noRecipient": "Quiz",
      "resultsCount": "Resultater: {count}",
      "newResults": "Nytt: {count}",
      "noResults": "Ingen har spilt ennå.",
      "anonymous": "Uten navn",
      "results": "Resultater",
      "copyLink": "Kopier lenke",
      "share": "Send",
      "deleteQuiz": "Slett quiz",
      "deleteConfirm": "Slette denne quizen og resultatene? Lenken slutter å virke.",
      "deleted": "Quizen er slettet",
      "linkCopied": "Lenken er kopiert",
      "back": "Tilbake",
      "next": "Neste",
      "stepNames": "Trinn 1 av 2 · Navn",
      "yourName": "Navnet ditt",
      "yourNamePlaceholder": "Hva heter du",
      "recipient": "Til hvem · valgfritt",
      "recipientPlaceholder": "Navnet på den du er glad i",
      "nameRequired": "Skriv navnet ditt.",
      "forbiddenName": "Skriv et vanlig navn.",
      "stepAnswers": "Trinn 2 av 2 · Svarene dine",
      "answersLead": "Marker det som stemmer om deg. Alle spørsmål kan byttes.",
      "swap": "Annet spørsmål",
      "progress": "{done} av {total} besvart",
      "answerAll": "Velg et svar på hvert spørsmål.",
      "finish": "Hent lenken",
      "creating": "Lager quizen…",
      "createdTitle": "Quizen din er klar!",
      "createdLead": "Send lenken. Når noen har svart, ser du resultatet under «Mine quizer».",
      "shareText": "{name} inviterer deg til spillet «Hvor godt kjenner du meg?»",
      "signInTitle": "Logg inn for å fortsette",
      "signInNote": "Quizen lagres på kontoen din, så resultatene kommer til deg.",
      "signIn": "Logg inn",
      "premiumNote": "Å lage spill er en del av full tilgang. Å spille fra en lenke er gratis for alle.",
      "failed": "Det gikk ikke. Sjekk tilkoblingen og prøv igjen.",
      "rateLimited": "For mange forsøk. Prøv igjen senere.",
      "playEyebrow": "ET SPILL FOR TO",
      "playInvite": "{name} inviterer deg til å spille",
      "playLead": "Spørsmål: {count}. Gjett svarene — til slutt ser du hvor mange som stemmer.",
      "playName": "Navnet ditt · valgfritt",
      "playNamePlaceholder": "Så de vet at det er deg",
      "start": "Start",
      "playLoading": "Laster spillet…",
      "playMissing": "Spillet er ikke tilgjengelig: lenken er slettet eller utløpt.",
      "playOffline": "Spillet krever internettforbindelse.",
      "retry": "Prøv igjen",
      "questionOf": "Spørsmål {n} av {total}",
      "asks": "{name} spør",
      "counting": "Teller treff…",
      "scoreOf": "{score} av {total}",
      "tierAll": "Perfekt! Dere kjenner hverandre bedre enn noen",
      "tierHigh": "Dere kjenner hverandre veldig godt",
      "tierMid": "Ikke verst! Det er mer å oppdage",
      "tierLow": "Mange fine oppdagelser venter",
      "sentTo": "{name} ser resultatet ditt",
      "review": "Svarene dine",
      "rightAnswer": "Riktig svar",
      "makeOwn": "Lag min egen quiz",
      "home": "Startsiden",
      "resultToast": "{name}: {score} av {total} i «Hvor godt kjenner du meg?»",
      "ownerAnswers": "Svarene til den som laget quizen",
      "playerAnswers": "Svarene til {name}",
      "paywallTitle": "Spill, moro<br><em>og brev</em>",
      "groupGames": "Spill",
      "groupFun": "Moro",
      "groupLetters": "Brev",
      "featQuiz": "«Hvor godt kjenner du meg?» — resultatet kommer til deg",
      "featGamesSoon": "Duellen «Hvem er raskest», «Det vi elsker», huskekort med bamser",
      "featFunSoon": "«Hvem av oss?» og «Fullfør setningen» med parets bok",
      "featCollection": "Hele samlingen av brev og dikt på 25 språk",
      "featMoments": "Øyeblikk, påminnelser og et QR-brev som åpnes på riktig dag",
      "featAudio": "Egen lyd i brevet og svar fra mottakeren",
      "ynTitle": "Ja eller nei",
      "ynNote": "Et livespill for to: 5 sekunder per kort. Den som svarer i tide, ser den andres svar.",
      "ynCreate": "Lag et rom",
      "ynWaiting": "Vi venter på at {name} åpner lenken…",
      "ynWaitingAny": "Vi venter på den andre…",
      "ynShareText": "{name} inviterer deg til livespillet «Ja eller nei»",
      "ynPartnerHere": "{name} er her!",
      "ynStart": "Start spillet",
      "ynWaitHost": "{name} starter snart spillet",
      "ynYes": "Ja",
      "ynNo": "Nei",
      "ynMissed": "For sent — kortet forblir lukket",
      "ynMatch": "Samme svar!",
      "ynRound": "Kort {n} av {total}",
      "ynAnswered": "Svaret er sendt, vi venter på den andre…",
      "ynFinal": "{score} av {total} like",
      "ynFinalHigh": "Dere forstår hverandre uten ord",
      "ynFinalMid": "Så ulike — og så nære",
      "ynAgain": "Spill igjen",
      "ynLeft": "Den andre mistet forbindelsen. Vi venter…",
      "ynYou": "Deg",
      "ynOffline": "Får ikke koblet til spillet. Sjekk internett og åpne lenken på nytt.",
      "ynJoin": "Bli med i spillet",
      "ynJoinLead": "{name} venter på deg. 5 sekunder per svar!",
      "ynStepNames": "Navnet ditt og den andres",
      "ynRoomReady": "Rommet er klart — send lenken",
      "ynStayHere": "Hold skjermen åpen: spillet starter når lenken åpnes.",
      "featYesNo": "Livespillet «Ja eller nei» — 5 sekunder per svar",
      "ynPartnerMissed": "Ikke noe svar — tiden er ute",
      "lvTitle": "Det vi elsker",
      "lvNote": "Et livespill for to: 4 bilder og 10 sekunder til å velge det du liker best. Dere kan gjerne velge det samme!",
      "lvShareText": "{name} inviterer deg til livespillet «Det vi elsker»",
      "lvJoinLead": "{name} venter på deg. Velg bildet du liker best!",
      "lvRound": "Tema {n} av {total}",
      "lvPick": "Velg det du liker best",
      "lvBoth": "Dere valgte begge: {item}",
      "lvCommon": "Dere elsker begge",
      "lvDiff": "Ulik smak — enda mer spennende!",
      "lvFinalHigh": "Dere har så mye til felles!",
      "lvFinalMid": "Så ulike — og dere utfyller hverandre",
      "featLoves": "Livespillet «Det vi elsker» — 4 bilder, velg sammen",
      "featGamesSoon2": "Duellen «Hvem er raskest» og huskekort med bamser",
      "mcTitle": "Huskekort med bamser",
      "mcNote": "Et live huskespill for to: snu to kort hver sin gang og finn parene. Tre nivåer, fra 8 til 16 kort.",
      "mcShareText": "{name} inviterer deg til livespillet «Huskekort med bamser»",
      "mcJoinLead": "{name} venter på deg. Finn parene på omgang!",
      "mcLevel": "Nivå {n} av {total}",
      "mcTurnYou": "Din tur — snu to kort",
      "mcTurnThem": "{name} sin tur",
      "mcPairs": "Funnet par: {found} av {total}",
      "mcLevelDone": "Alle parene er funnet!",
      "mcTimeUp": "Tiden for nivået er ute",
      "mcNext": "Neste: nivå {n}",
      "mcFinal": "Funnet par: {found} av {total}",
      "mcFinalHigh": "For et lag!",
      "mcFinalMid": "Fint spilt — en gang til?",
      "featCards": "Livespillet «Huskekort med bamser» — finn par sammen",
      "featGamesSoon3": "Duellen «Hvem er raskest»",
      "duTitle": "Hvem er raskest",
      "duNote": "En live-duell: ett ord og fire bilder. Trykk først på riktig bilde — et feil trykk koster runden.",
      "duShareText": "{name} utfordrer deg til live-duellen «Hvem er raskest»",
      "duJoinLead": "{name} venter på deg. Finn riktig bilde raskere!",
      "duRound": "Runde {n} av {total}",
      "duFind": "Finn: {item}",
      "duYouWon": "Du var raskest!",
      "duTheyWon": "{name} var raskest",
      "duWrong": "Feil bilde — runden er tapt",
      "duNobody": "Ingen rakk å finne det",
      "duScore": "Du {you} : {them} {name}",
      "duFinalWin": "Seier! Skarpe øyne i dag.",
      "duFinalLose": "{name} vinner denne gangen — revansj?",
      "duFinalDraw": "Uavgjort — helt likt!",
      "duSeconds": "{s} s",
      "featDuel": "Live-duellen «Hvem er raskest» — finn bildet først",
      "whoTitle": "Hvem av oss?",
      "whoNote": "Et livespill for to: ett spørsmål, trykk på «Meg» eller partnerens navn. Se om dere er enige om hverandre.",
      "whoShareText": "{name} inviterer deg til livespillet «Hvem av oss?»",
      "whoJoinLead": "{name} venter på deg. Svar ærlig — og sammenlign etterpå!",
      "whoRound": "Spørsmål {n} av {total}",
      "whoMe": "Meg",
      "whoAgree": "Dere er enige: {name}",
      "whoDiffer": "Dere er uenige — snakk om det!",
      "whoFinal": "Dere var enige {score} av {total} ganger",
      "whoFinalHigh": "Dere ser virkelig hverandre!",
      "whoFinalMid": "Mye å snakke om — og det er fint",
      "featWho": "Livespillet «Hvem av oss?» — se om dere er enige",
      "phTitle": "Fullfør setningen",
      "phNote": "Et livespill for to: dere fullfører begge den samme varme setningen med egne ord og leser så hverandres svar.",
      "phShareText": "{name} inviterer deg til livespillet «Fullfør setningen»",
      "phJoinLead": "{name} venter på deg. Fullfør hver setning med egne ord!",
      "phRound": "Setning {n} av {total}",
      "phPlaceholder": "Din fortsettelse…",
      "phDone": "Ferdig",
      "phWaiting": "Venter på {name}…",
      "phSkipped": "Ikke noe svar",
      "phSave": "Lagre i parets bok",
      "phSaved": "Lagret i parets bok",
      "phForbidden": "Skriv uten lenker og stygge ord.",
      "phNext": "Neste setning",
      "phFinal": "Setninger fullført sammen: {count}",
      "phFinalLead": "Lagre svarene dere liker best i parets bok.",
      "featPhrase": "Livespillet «Fullfør setningen» med parets bok",
      "bookTitle": "Parets bok",
      "bookNote": "De varmeste svarene fra «Fullfør setningen», lagret på kontoen din.",
      "bookOpen": "Åpne boken",
      "bookEmpty": "Boken er tom foreløpig. Spill «Fullfør setningen» og lagre svarene du liker.",
      "bookDelete": "Slett",
      "bookDeleteConfirm": "Slette denne siden fra boken?",
      "bookYou": "Du",
      "inviteTitle": "Inviter en venn",
      "inviteNote": "Vennen din får en melding med spillet.",
      "invite": "Inviter",
      "invited": "Invitert",
      "inviteNone": "Legg til venner under «Venner» for å invitere dem med ett trykk.",
      "inviteSent": "Invitasjon sendt til {name}"
    },
    "questions": {
      "q01": [
        "Min favorittårstid?",
        "Våren",
        "Sommeren",
        "Høsten",
        "Vinteren"
      ],
      "q02": [
        "Hva velger jeg til frokost?",
        "Kaffe og croissant",
        "Grøt",
        "Egg",
        "Bare te"
      ],
      "q03": [
        "Min perfekte fridag?",
        "Hjemme under et teppe",
        "En tur i parken",
        "En tur ut av byen",
        "Tid med venner"
      ],
      "q04": [
        "Hvor drømmer jeg om å reise?",
        "Til havet",
        "Til fjellet",
        "Til en storby",
        "Til en koselig hytte på landet"
      ],
      "q05": [
        "Favorittisen min?",
        "Vanilje",
        "Sjokolade",
        "Jordbær",
        "Pistasj"
      ],
      "q06": [
        "Hva gjør meg glad raskest?",
        "En klem",
        "En overraskelse",
        "Fine ord",
        "Noe godt"
      ],
      "q07": [
        "Jeg er mer…",
        "Et A-menneske",
        "Et B-menneske",
        "En som sover når det passer",
        "Glad i middagslur"
      ],
      "q08": [
        "Hvilken film velger jeg i kveld?",
        "En komedie",
        "En romantisk historie",
        "En krim",
        "En tegnefilm"
      ],
      "q09": [
        "Favorittfargen min?",
        "Rød",
        "Blå",
        "Grønn",
        "Rosa"
      ],
      "q10": [
        "Hva er jeg mest redd for?",
        "Edderkopper",
        "Høyder",
        "Mørket",
        "Å komme for sent"
      ],
      "q11": [
        "Hvilke blomster elsker jeg?",
        "Roser",
        "Tulipaner",
        "Peoner",
        "Prestekrager"
      ],
      "q12": [
        "Hva gjør jeg når jeg er lei meg?",
        "Ringer noen som står meg nær",
        "Spiser noe søtt",
        "Går en tur",
        "Legger meg"
      ],
      "q13": [
        "Hvilket dyr står hjertet mitt nærmest?",
        "En kattunge",
        "En hund",
        "En bjørneunge",
        "En liten rev"
      ],
      "q14": [
        "Den beste gaven til meg?",
        "Noe hjemmelaget",
        "En reise",
        "Et smykke",
        "En bok"
      ],
      "q15": [
        "Favorittdrikken min?",
        "Svart te",
        "Grønn te",
        "Kaffe",
        "Varm sjokolade"
      ],
      "q16": [
        "Favorittsnacksen min?",
        "Sjokolade",
        "Potetgull",
        "Frukt",
        "Et kakestykke"
      ],
      "q17": [
        "Hva velger jeg på reise?",
        "Museer",
        "Stranden",
        "Den lokale maten",
        "Å rusle uten plan"
      ],
      "q18": [
        "Hvordan liker jeg å tilbringe kvelden?",
        "Med en bok",
        "Med en serie",
        "Med prat",
        "På tur"
      ],
      "q19": [
        "Hvilket vær liker jeg best?",
        "Sol",
        "Lunt regn",
        "Snøfall",
        "En lett bris"
      ],
      "q20": [
        "Hvilken superkraft ville passet meg?",
        "Å fly",
        "Å lese tanker",
        "Å stoppe tiden",
        "Å teleportere meg"
      ],
      "q21": [
        "Hva betyr mest for meg hos mine nærmeste?",
        "Tillit",
        "Omtanke",
        "Humor",
        "Støtte"
      ],
      "q22": [
        "Hvilken høytid gleder jeg meg mest til?",
        "Nyttår",
        "Bursdagen min",
        "Sommerferien",
        "Valentinsdagen"
      ],
      "q23": [
        "Hvordan sier jeg oftest «jeg elsker deg»?",
        "Med ord",
        "Med handlinger",
        "Med klemmer",
        "Med gaver"
      ],
      "q24": [
        "Hva bestiller jeg på en kafé?",
        "Pasta",
        "Sushi",
        "En salat",
        "En dessert"
      ],
      "q25": [
        "Favorittiden min på døgnet?",
        "Morgenen",
        "Ettermiddagen",
        "Kvelden",
        "Natten"
      ],
      "q26": [
        "Hvilket kjøkken velger jeg?",
        "Italiensk",
        "Japansk",
        "Hjemmelaget",
        "Meksikansk"
      ],
      "q27": [
        "Hvor tenker jeg best?",
        "I dusjen",
        "På tur",
        "På reise",
        "Før jeg sovner"
      ],
      "q28": [
        "Hva gjør jeg først om morgenen?",
        "Sjekker mobilen",
        "Drikker vann",
        "Lager kaffe",
        "Blir liggende litt til"
      ],
      "q29": [
        "Favorittfrukten min?",
        "Eple",
        "Banan",
        "Mango",
        "Vannmelon"
      ],
      "q30": [
        "Hvilken hobby passer meg best?",
        "Tegning",
        "Matlaging",
        "Trening",
        "Lesing"
      ],
      "q31": [
        "Hvordan vil jeg feire bursdagen min?",
        "Med en stor fest",
        "Med middag for to",
        "Med en reise",
        "Med en rolig kveld hjemme"
      ],
      "q32": [
        "Hva synes jeg om overraskelser?",
        "Jeg elsker dem",
        "De gjør meg litt nervøs",
        "Jeg liker å lage dem for andre",
        "Jeg vil helst vite det på forhånd"
      ],
      "q33": [
        "Hvilken søtsak liker jeg best?",
        "Kake",
        "Is",
        "Kjeks",
        "Godteri"
      ],
      "q34": [
        "Hva tar jeg med til en øde øy?",
        "En bok",
        "Mobilen",
        "Et teppe",
        "Et kamera"
      ],
      "q35": [
        "Hvordan slapper jeg av etter en tung dag?",
        "Et varmt bad",
        "En serie",
        "En tur",
        "En prat med noen jeg er glad i"
      ],
      "q36": [
        "Hvordan reiser jeg helst?",
        "Med tog",
        "Med fly",
        "Med bil",
        "På sykkel"
      ],
      "q37": [
        "Favorittleken min som barn?",
        "Gjemsel",
        "Sisten",
        "Byggeklosser",
        "Tegning"
      ],
      "q38": [
        "Hvilket eventyr står meg nærmest?",
        "Askepott",
        "Den lille prinsen",
        "Ole Brumm",
        "Alice i Eventyrland"
      ],
      "q39": [
        "Hvordan vil jeg helst glede noen jeg er glad i?",
        "Med en overraskelse",
        "Med et kort",
        "Med en reise",
        "Med en middag"
      ],
      "q40": [
        "Hva tar jeg oftest bilde av?",
        "Meg selv",
        "Naturen",
        "Mat",
        "Jeg tar nesten ikke bilder"
      ],
      "q41": [
        "Favorittstedet mitt hjemme?",
        "Sengen",
        "Kjøkkenet",
        "Sofaen",
        "Balkongen"
      ],
      "q42": [
        "Hva legger jeg først merke til hos et menneske?",
        "Smilet",
        "Øynene",
        "Stemmen",
        "Humoren"
      ],
      "q43": [
        "Hva får meg raskest til å le?",
        "Morsomme videoer",
        "Vitser fra mine nærmeste",
        "Pinlige situasjoner",
        "Dyr"
      ],
      "q44": [
        "Hva drikker jeg en varm sommerdag?",
        "Limonade",
        "Iste",
        "Juice",
        "Vann med is"
      ],
      "q45": [
        "Hvilket element står meg nærmest?",
        "Vann",
        "Ild",
        "Jord",
        "Luft"
      ],
      "q46": [
        "Hvilke historier elsker jeg?",
        "Eventyr",
        "Kjærlighetshistorier",
        "Science fiction",
        "Sanne historier"
      ],
      "q47": [
        "Hvordan tilbringer jeg en regnværsdag?",
        "Leser",
        "Sover",
        "Ser en film",
        "Går tur med paraply"
      ],
      "q48": [
        "Hva setter jeg mest pris på ved en gave?",
        "Omtanken",
        "Nytten",
        "Skjønnheten",
        "Overraskelsen"
      ],
      "q49": [
        "Hvilke poteter velger jeg?",
        "Potetmos",
        "Pommes frites",
        "Ovnsbakte",
        "Potetgull"
      ],
      "q50": [
        "Hvor går jeg først i en ny by?",
        "På kafé",
        "På museum",
        "I en park",
        "På shopping"
      ],
      "q51": [
        "Hva gjør jeg når jeg ikke får sove?",
        "Leser",
        "Scroller på mobilen",
        "Teller sauer",
        "Drikker varm melk"
      ],
      "q52": [
        "Hvordan forbereder jeg meg til en viktig dag?",
        "Planlegger alt på forhånd",
        "Gjør alt i siste liten",
        "Ber om hjelp",
        "Blir nervøs og sover dårlig"
      ],
      "q53": [
        "Hvilken sport liker jeg best å se på?",
        "Fotball",
        "Tennis",
        "Kunstløp",
        "Jeg ser ikke på sport"
      ],
      "q54": [
        "Hvilket kjæledyr passer meg?",
        "En katt",
        "En hund",
        "En papegøye",
        "En hamster"
      ],
      "q55": [
        "Hva slags meldinger skriver jeg?",
        "Lange",
        "Korte",
        "Fulle av emojier",
        "Talemeldinger"
      ],
      "q56": [
        "Hvilken gave har jeg tatt vare på lengst?",
        "Et brev",
        "En leke",
        "Et bilde",
        "Et smykke"
      ],
      "q57": [
        "Hva velger jeg heller?",
        "Te ved peisen",
        "Piknik i gresset",
        "En tur ved havet",
        "En kinotur"
      ],
      "q58": [
        "Hvilket kompliment gjør meg gladest?",
        "Om utseendet mitt",
        "Om hodet mitt",
        "Om godheten min",
        "Om humoren min"
      ],
      "q59": [
        "Min perfekte morgen?",
        "Frokost på senga",
        "En tidlig løpetur",
        "Sove lenge",
        "Kaffe på balkongen"
      ],
      "q60": [
        "Hva vil jeg lære?",
        "Å danse",
        "Å lage mat",
        "Et nytt språk",
        "Å tegne"
      ]
    },
    "yesNo": {
      "c01": [
        "Savner du meg akkurat nå?",
        "savner deg veldig",
        "holder ut, men tenker på deg"
      ],
      "c02": [
        "Smiler du når du ser meldingen min?",
        "smiler alltid",
        "smiler innvendig"
      ],
      "c03": [
        "Husker du vårt første møte?",
        "husker hvert minutt",
        "husker det viktigste — deg"
      ],
      "c04": [
        "Vil du ha en klem i dag?",
        "venter på klemmen din",
        "sparer klemmene til senere"
      ],
      "c05": [
        "Skal vi dra til havet sammen?",
        "pakker allerede kofferten",
        "drømmer om fjellet"
      ],
      "c06": [
        "Får jeg deg til å le?",
        "ler av hele hjertet",
        "skjuler et smil"
      ],
      "c07": [
        "Føler du deg rolig med meg?",
        "føler ro ved siden av deg",
        "har det gøy med deg"
      ],
      "c08": [
        "Tenker du på meg i løpet av dagen?",
        "tenker veldig ofte på deg",
        "tenker på deg akkurat nå"
      ],
      "c09": [
        "Elsker du overraskelsene mine?",
        "elsker overraskelsene dine",
        "liker best når du bare er der"
      ],
      "c10": [
        "Skal vi bake en pai sammen?",
        "tar allerede på forkleet",
        "kjøper heller en kake"
      ],
      "c11": [
        "Skal vi se en film i kveld?",
        "velger allerede film",
        "vil heller bare prate"
      ],
      "c12": [
        "Liker du stemmen min?",
        "kunne lyttet i en evighet",
        "elsker latteren din enda mer"
      ],
      "c13": [
        "Skal vi ha piknik i helgen?",
        "gjør teppet klart",
        "inviterer deg på en koselig kafé"
      ],
      "c14": [
        "Vil du få et brev fra meg?",
        "venter på brevet ditt",
        "vil høre alt ansikt til ansikt"
      ],
      "c15": [
        "Betyr jeg mye for deg?",
        "du betyr enormt mye",
        "mer enn du tror"
      ],
      "c16": [
        "Skal vi gå tur i regnet?",
        "tar en paraply til to",
        "lager heller te hjemme"
      ],
      "c17": [
        "Ligner vi på hverandre?",
        "dere er som to halvdeler",
        "dere utfyller hverandre perfekt"
      ],
      "c18": [
        "Liker du maten jeg lager?",
        "vil ha mer",
        "elsker å lage mat sammen med deg"
      ],
      "c19": [
        "Skal vi skaffe et kjæledyr sammen?",
        "velger allerede navn",
        "en kosebamse holder foreløpig"
      ],
      "c20": [
        "Vet du hva jeg elsker?",
        "kan det utenat",
        "vil vite enda mer"
      ],
      "c21": [
        "Skal vi danse?",
        "rekker allerede frem hånden",
        "klapper i hendene"
      ],
      "c22": [
        "Inspirerer jeg deg?",
        "du inspirerer hver dag",
        "ved siden av deg er det bare varmt"
      ],
      "c23": [
        "Tar du vare på bildene våre?",
        "tar vare på hvert eneste",
        "venter på nye, enda finere"
      ],
      "c24": [
        "Skal vi se soloppgangen sammen?",
        "stiller allerede vekkerklokka",
        "ser heller solnedgangen"
      ],
      "c25": [
        "Forteller du meg en hemmelighet?",
        "hvisker den i øret ditt",
        "la det forbli et mysterium"
      ],
      "c26": [
        "Tror du på meg?",
        "tror sterkt på deg",
        "heier på deg hver dag"
      ],
      "c27": [
        "Skal vi reise bort, bare vi to?",
        "drømmer om det",
        "tar med alle de kjære"
      ],
      "c28": [
        "Venter du på at jeg ringer?",
        "venter med et smil",
        "vil heller at du kommer innom"
      ],
      "c29": [
        "Liker du klemmene mine?",
        "verdens varmeste",
        "holder gjerne hender"
      ],
      "c30": [
        "Skal vi lese høyt for hverandre?",
        "velger allerede en bok",
        "hører heller på deg"
      ],
      "c31": [
        "Skal vi ta et bilde sammen i dag?",
        "leter allerede etter en fin bakgrunn",
        "først litt prat"
      ],
      "c32": [
        "Gjør jeg deg gladere?",
        "alltid",
        "med deg blir selv tristhet lettere"
      ],
      "c33": [
        "Skal vi spise frokost sammen i morgen?",
        "lager allerede kakao",
        "drømmer om å sove lenge"
      ],
      "c34": [
        "Husker du bursdagen min?",
        "uten påminnelse",
        "planlegger en overraskelse i hemmelighet"
      ],
      "c35": [
        "Skal vi gå på skøyter?",
        "finner frem skøytene",
        "heier på deg fra vant"
      ],
      "c36": [
        "Er i dag en god dag for deg?",
        "en strålende dag",
        "blir bedre når du er der"
      ],
      "c37": [
        "Tegner du portrettet mitt?",
        "tar allerede blyanten",
        "tegner et lite hjerte"
      ],
      "c38": [
        "Skal vi plante et tre sammen?",
        "velger stedet",
        "begynner med en blomst i vinduskarmen"
      ],
      "c39": [
        "Vil du høre et kompliment?",
        "gleder seg veldig",
        "er sjenert, men vil så gjerne"
      ],
      "c40": [
        "Skal vi spille igjen senere?",
        "vil ha en runde til",
        "klemmer heller enn å spille"
      ]
    },
    "loves": {
      "s01": [
        "Hvor på ferie?",
        "Strand",
        "Fjell",
        "Reiser",
        "Alenetid"
      ],
      "s02": [
        "Den perfekte kvelden?",
        "Film hjemme",
        "Tur",
        "Restaurant",
        "Brettspill"
      ],
      "s03": [
        "Favorittvær?",
        "Sol",
        "Regn",
        "Snø",
        "Stjerneklar natt"
      ],
      "s04": [
        "Favorittdyr?",
        "Kattunge",
        "Valp",
        "Hest",
        "Delfin"
      ],
      "s05": [
        "Hva blir det til middag?",
        "Pizza",
        "Sushi",
        "Kaker",
        "Grilling"
      ],
      "s06": [
        "Favorittdrikk?",
        "Kaffe",
        "Te",
        "Varm sjokolade",
        "Limonade"
      ],
      "s07": [
        "Favorittårstid?",
        "Vår",
        "Sommer",
        "Høst",
        "Vinter"
      ],
      "s08": [
        "Favorittblomster?",
        "Roser",
        "Tulipaner",
        "Solsikker",
        "Lavendel"
      ],
      "s09": [
        "Hvordan slapper du av?",
        "Med en bok",
        "Tegner",
        "På sykkel",
        "Lur i hengekøya"
      ],
      "s10": [
        "Hvordan reiser vi?",
        "Med tog",
        "Med fly",
        "Med bil",
        "Med båt"
      ],
      "s11": [
        "Drømmehjem?",
        "Leilighet i byen",
        "Hus ved havet",
        "Hytte på fjellet",
        "Gård"
      ],
      "s12": [
        "Noe søtt?",
        "Is",
        "Sjokolade",
        "Kake",
        "Frukt"
      ],
      "s13": [
        "Den perfekte morgenen?",
        "Frokost på senga",
        "Løpetur",
        "Sove lenge",
        "Kaffe på balkongen"
      ],
      "s14": [
        "Drømmedate?",
        "Piknik",
        "Skøytebane",
        "Fornøyelsespark",
        "Stjerner på taket"
      ],
      "s15": [
        "Den beste gaven?",
        "En bukett",
        "Et brev",
        "En reise",
        "En gaveeske"
      ],
      "s16": [
        "Favorittnatur?",
        "Hav",
        "Skog",
        "Ørken",
        "Nordlys"
      ]
    },
    "who": [
      "Hvem av oss kommer oftest for sent?",
      "Hvem av oss slutter fred først?",
      "Hvem av oss lager best mat?",
      "Hvem av oss ler oftest?",
      "Hvem av oss bruker lengst tid på å gjøre seg klar?",
      "Hvem av oss mister nøklene oftest?",
      "Hvem av oss husker viktige datoer best?",
      "Hvem av oss er mest glad i søtsaker?",
      "Hvem av oss sovner først?",
      "Hvem av oss står opp tidligst?",
      "Hvem av oss sier oftest «jeg savner deg»?",
      "Hvem av oss velger de beste gavene?",
      "Hvem av oss tuller oftest?",
      "Hvem av oss kjører best bil?",
      "Hvem av oss snakker lengst i telefonen?",
      "Hvem av oss elsker å reise mest?",
      "Hvem av oss blir lettest såret?",
      "Hvem av oss tilgir raskest?",
      "Hvem av oss tar flest bilder?",
      "Hvem av oss er best med penger?",
      "Hvem av oss kjøper oftest ting vi ikke trenger?",
      "Hvem av oss er best til å trøste?",
      "Hvem av oss holder seg roligst i vanskelige stunder?",
      "Hvem av oss leter alltid etter telefonen sin?",
      "Hvem av oss liker best å ha gjester?",
      "Hvem av oss lager frokost oftest?",
      "Hvem av oss finner best fram i en ny by?",
      "Hvem av oss skriver de lengste meldingene?",
      "Hvem av oss foreslår en tur først?",
      "Hvem av oss er mest glad i dyr?",
      "Hvem av oss er best til å holde på hemmeligheter?",
      "Hvem av oss bruker lengst tid på å velge fra menyen?",
      "Hvem av oss bekymrer seg mest for sine kjære?",
      "Hvem av oss lager flest overraskelser?",
      "Hvem av oss er mest ryddig?",
      "Hvem av oss legger først merke til en ny frisyre?",
      "Hvem av oss husker morsomme historier oftest?",
      "Hvem av oss er mest tålmodig?",
      "Hvem av oss sier oftest «takk»?",
      "Hvem av oss tilbyr hjelp først?"
    ],
    "phrases": [
      "Jeg smiler når du…",
      "Favorittdagen min med deg er…",
      "Takk for…",
      "Når jeg er lei meg, hjelper det å…",
      "En dag vil jeg at vi…",
      "Det varmeste minnet om oss er…",
      "Du er best til å…",
      "Jeg føler meg rolig når…",
      "Hvis vi hadde en hel fri dag, ville vi…",
      "Jeg er stolt av deg fordi…",
      "Vår perfekte kveld er…",
      "Jeg glemmer aldri hvordan du…",
      "Jeg liker når du sier…",
      "Neste år vil jeg at vi…",
      "For meg er du som…",
      "Den beste gaven fra deg er…",
      "Jeg savner deg når…",
      "Vi er morsomst når…",
      "Jeg har lenge hatt lyst til å si til deg…",
      "Stedet vårt er…",
      "Når jeg tenker på deg, så…",
      "Du gjør dagen min bedre når…",
      "Jeg liker vanen vår med å…",
      "Mitt ønske for oss: …",
      "Det morsomste som har skjedd oss, er…",
      "Jeg merker omsorgen din når du…",
      "En morgen med deg er…",
      "Hvis vi var ett ord, ville det vært…",
      "Jeg vil lære av deg hvordan man…",
      "Takk for at du alltid…"
    ]
  },
  "fi": {
    "text": {
      "homeLink": "Pelejä kahdelle",
      "eyebrow": "GLOWLETTER · PELEJÄ KAHDELLE",
      "title": "Pelatkaa yhdessä",
      "close": "Sulje",
      "lead": "Lähetä peli jollekulle rakkaalle. Linkin kautta pelaaminen on ilmaista eikä vaadi tiliä.",
      "quizTitle": "Kuinka hyvin tunnet minut?",
      "quizNote": "Vastaa kysymyksiin itsestäsi, ja läheinen yrittää arvata. Tulos tulee sinulle.",
      "create": "Luo visa",
      "soon": "Pian",
      "soonTitle": "Lisää pelejä tulossa",
      "duel": "Kaksintaistelu ”Kuka on nopein”",
      "loves": "Mitä rakastamme",
      "cards": "Muistipeli kahdelle",
      "who": "Kumpi meistä?",
      "phrase": "Täydennä lause",
      "myQuizzes": "Omat visat",
      "noQuizzes": "Ei vielä visoja. Ensimmäinen syntyy parissa minuutissa.",
      "forWhom": "Kenelle: {name}",
      "noRecipient": "Visa",
      "resultsCount": "Tuloksia: {count}",
      "newResults": "Uusia: {count}",
      "noResults": "Kukaan ei ole vielä pelannut.",
      "anonymous": "Nimetön",
      "results": "Tulokset",
      "copyLink": "Kopioi linkki",
      "share": "Lähetä",
      "deleteQuiz": "Poista visa",
      "deleteConfirm": "Poistetaanko visa ja sen tulokset? Linkki lakkaa toimimasta.",
      "deleted": "Visa poistettu",
      "linkCopied": "Linkki kopioitu",
      "back": "Takaisin",
      "next": "Seuraava",
      "stepNames": "Vaihe 1/2 · Nimet",
      "yourName": "Nimesi",
      "yourNamePlaceholder": "Mikä on nimesi",
      "recipient": "Kenelle · valinnainen",
      "recipientPlaceholder": "Läheisesi nimi",
      "nameRequired": "Kirjoita nimesi.",
      "forbiddenName": "Kirjoita tavallinen nimi.",
      "stepAnswers": "Vaihe 2/2 · Vastauksesi",
      "answersLead": "Merkitse, mikä pitää paikkansa sinusta. Jokaisen kysymyksen voi vaihtaa.",
      "swap": "Toinen kysymys",
      "progress": "Vastattu {done}/{total}",
      "answerAll": "Valitse vastaus jokaiseen kysymykseen.",
      "finish": "Hae linkki",
      "creating": "Luodaan visaa…",
      "createdTitle": "Visasi on valmis!",
      "createdLead": "Lähetä linkki. Kun vastaus tulee, tulos näkyy kohdassa ”Omat visat”.",
      "shareText": "{name} kutsuu sinut peliin ”Kuinka hyvin tunnet minut?”",
      "signInTitle": "Kirjaudu jatkaaksesi",
      "signInNote": "Visa tallennetaan tilillesi, jotta tulokset tulevat sinulle.",
      "signIn": "Kirjaudu",
      "premiumNote": "Pelien luominen kuuluu täyteen käyttöoikeuteen. Linkin kautta pelaaminen on ilmaista kaikille.",
      "failed": "Ei onnistunut. Tarkista yhteys ja yritä uudelleen.",
      "rateLimited": "Liian monta yritystä. Yritä myöhemmin.",
      "playEyebrow": "PELI KAHDELLE",
      "playInvite": "{name} kutsuu sinut pelaamaan",
      "playLead": "Kysymyksiä: {count}. Arvaa vastaukset — lopuksi näet, moniko osui.",
      "playName": "Nimesi · valinnainen",
      "playNamePlaceholder": "Jotta sinut tunnistetaan",
      "start": "Aloita",
      "playLoading": "Ladataan peliä…",
      "playMissing": "Peli ei ole saatavilla: linkki on poistettu tai vanhentunut.",
      "playOffline": "Peli tarvitsee internetyhteyden.",
      "retry": "Yritä uudelleen",
      "questionOf": "Kysymys {n}/{total}",
      "asks": "{name} kysyy",
      "counting": "Lasketaan osumia…",
      "scoreOf": "{score}/{total}",
      "tierAll": "Täydellistä! Tunnette toisenne paremmin kuin kukaan",
      "tierHigh": "Tunnette toisenne todella hyvin",
      "tierMid": "Ei hassumpaa! Löydettävää riittää vielä",
      "tierLow": "Edessä on monta ihanaa löytöä",
      "sentTo": "{name} näkee tuloksesi",
      "review": "Vastauksesi",
      "rightAnswer": "Oikea vastaus",
      "makeOwn": "Luo oma visa",
      "home": "Etusivu",
      "resultToast": "{name}: {score}/{total} visassa ”Kuinka hyvin tunnet minut?”",
      "ownerAnswers": "Tekijän vastaukset",
      "playerAnswers": "Vastaukset: {name}",
      "paywallTitle": "Pelejä, hauskaa<br><em>ja kirjeitä</em>",
      "groupGames": "Pelit",
      "groupFun": "Hauskaa",
      "groupLetters": "Kirjeet",
      "featQuiz": "”Kuinka hyvin tunnet minut?” — tulos tulee sinulle",
      "featGamesSoon": "Kaksintaistelu ”Kuka on nopein”, ”Mitä rakastamme”, muistipeli nallekorteilla",
      "featFunSoon": "”Kumpi meistä?” ja ”Täydennä lause” parin kirjan kanssa",
      "featCollection": "Koko kirje- ja runokokoelma 25 kielellä",
      "featMoments": "Hetket, muistutukset ja QR-kirje, joka aukeaa oikeana päivänä",
      "featAudio": "Oma ääni kirjeessä ja vastaanottajan vastaus",
      "ynTitle": "Kyllä vai ei",
      "ynNote": "Live-peli kahdelle: 5 sekuntia jokaiseen korttiin. Ajoissa vastannut näkee toisen vastauksen.",
      "ynCreate": "Luo huone",
      "ynWaiting": "Odotetaan, että {name} avaa linkin…",
      "ynWaitingAny": "Odotetaan toista pelaajaa…",
      "ynShareText": "{name} kutsuu sinut live-peliin ”Kyllä vai ei”",
      "ynPartnerHere": "{name} on paikalla!",
      "ynStart": "Aloita peli",
      "ynWaitHost": "{name} aloittaa pelin pian",
      "ynYes": "Kyllä",
      "ynNo": "Ei",
      "ynMissed": "Liian myöhään — kortti pysyy kiinni",
      "ynMatch": "Sama vastaus!",
      "ynRound": "Kortti {n}/{total}",
      "ynAnswered": "Vastaus lähetetty, odotetaan toista…",
      "ynFinal": "{score}/{total} samoin",
      "ynFinalHigh": "Ymmärrätte toisianne ilman sanoja",
      "ynFinalMid": "Niin erilaiset — ja niin lähellä",
      "ynAgain": "Pelaa uudelleen",
      "ynLeft": "Toinen pelaaja katosi linjoilta. Odotetaan…",
      "ynYou": "Sinä",
      "ynOffline": "Peliin ei saada yhteyttä. Tarkista internet ja avaa linkki uudelleen.",
      "ynJoin": "Liity peliin",
      "ynJoinLead": "{name} odottaa sinua. 5 sekuntia per vastaus!",
      "ynStepNames": "Sinun ja toisen pelaajan nimi",
      "ynRoomReady": "Huone on valmis — lähetä linkki",
      "ynStayHere": "Pidä tämä näkymä auki: peli alkaa, kun linkki avataan.",
      "featYesNo": "Live-peli ”Kyllä vai ei” — 5 sekuntia per vastaus",
      "ynPartnerMissed": "Ei vastausta — aika loppui",
      "lvTitle": "Mitä rakastamme",
      "lvNote": "Live-peli kahdelle: 4 kuvaa ja 10 sekuntia aikaa valita, mistä pidät eniten. Saatte valita saman!",
      "lvShareText": "{name} kutsuu sinut live-peliin ”Mitä rakastamme”",
      "lvJoinLead": "{name} odottaa sinua. Valitse kuva, josta pidät eniten!",
      "lvRound": "Aihe {n}/{total}",
      "lvPick": "Valitse, mistä pidät eniten",
      "lvBoth": "Valitsitte molemmat: {item}",
      "lvCommon": "Rakastatte molemmat",
      "lvDiff": "Eri maut — sitäkin kiinnostavampaa!",
      "lvFinalHigh": "Teillä on niin paljon yhteistä!",
      "lvFinalMid": "Niin erilaiset — ja täydennätte toisianne",
      "featLoves": "Live-peli ”Mitä rakastamme” — 4 kuvaa, valitkaa yhdessä",
      "featGamesSoon2": "Kaksintaistelu ”Kuka on nopein” ja muistipeli nallekorteilla",
      "mcTitle": "Muistipeli nallekorteilla",
      "mcNote": "Live-muistipeli kahdelle: kääntäkää vuorotellen kaksi korttia ja etsikää parit. Kolme tasoa, 8–16 korttia.",
      "mcShareText": "{name} kutsuu sinut live-peliin ”Muistipeli nallekorteilla”",
      "mcJoinLead": "{name} odottaa sinua. Etsikää parit vuorotellen!",
      "mcLevel": "Taso {n}/{total}",
      "mcTurnYou": "Sinun vuorosi — käännä kaksi korttia",
      "mcTurnThem": "Vuorossa: {name}",
      "mcPairs": "Löydetyt parit: {found}/{total}",
      "mcLevelDone": "Kaikki parit löytyivät!",
      "mcTimeUp": "Tason aika loppui",
      "mcNext": "Seuraavaksi: taso {n}",
      "mcFinal": "Löydetyt parit: {found}/{total}",
      "mcFinalHigh": "Upea tiimi!",
      "mcFinalMid": "Hyvä peli — uudestaan?",
      "featCards": "Live-peli ”Muistipeli nallekorteilla” — etsikää parit yhdessä",
      "featGamesSoon3": "Kaksintaistelu ”Kuka on nopein”",
      "duTitle": "Kumpi on nopeampi",
      "duNote": "Live-kaksintaistelu: yksi sana ja neljä kuvaa. Napauta oikeaa kuvaa ensin — väärä napautus vie kierroksen.",
      "duShareText": "{name} haastaa sinut live-kaksintaisteluun ”Kumpi on nopeampi”",
      "duJoinLead": "{name} odottaa sinua. Löydä oikea kuva nopeammin!",
      "duRound": "Kierros {n}/{total}",
      "duFind": "Etsi: {item}",
      "duYouWon": "Olit nopeampi!",
      "duTheyWon": "{name} oli nopeampi",
      "duWrong": "Väärä kuva — kierros meni",
      "duNobody": "Kukaan ei ehtinyt löytää sitä",
      "duScore": "Sinä {you} : {them} {name}",
      "duFinalWin": "Voitto! Tarkat silmät tänään.",
      "duFinalLose": "Tällä kertaa voittaa {name} — revanssi?",
      "duFinalDraw": "Tasapeli — täysin tasaväkiset!",
      "duSeconds": "{s} s",
      "featDuel": "Live-kaksintaistelu ”Kumpi on nopeampi” — löydä kuva ensin",
      "whoTitle": "Kumpi meistä?",
      "whoNote": "Live-peli kahdelle: yksi kysymys, napauta ”Minä” tai kumppanisi nimeä. Katso, oletteko samaa mieltä toisistanne.",
      "whoShareText": "{name} kutsuu sinut live-peliin ”Kumpi meistä?”",
      "whoJoinLead": "{name} odottaa sinua. Vastaa rehellisesti — ja vertailkaa sitten!",
      "whoRound": "Kysymys {n}/{total}",
      "whoMe": "Minä",
      "whoAgree": "Olette samaa mieltä: {name}",
      "whoDiffer": "Mielipiteet eroavat — jutelkaa siitä!",
      "whoFinal": "Samaa mieltä {score}/{total} kertaa",
      "whoFinalHigh": "Näette toisenne niin selvästi!",
      "whoFinalMid": "Paljon juteltavaa — ja se on ihanaa",
      "featWho": "Live-peli ”Kumpi meistä?” — oletteko samaa mieltä?",
      "phTitle": "Täydennä lause",
      "phNote": "Live-peli kahdelle: kumpikin täydentää saman lämpimän lauseen omin sanoin, ja sitten luette toistenne vastaukset.",
      "phShareText": "{name} kutsuu sinut live-peliin ”Täydennä lause”",
      "phJoinLead": "{name} odottaa sinua. Täydennä jokainen lause omin sanoin!",
      "phRound": "Lause {n}/{total}",
      "phPlaceholder": "Sinun jatkosi…",
      "phDone": "Valmis",
      "phWaiting": "Odotetaan: {name}…",
      "phSkipped": "Ei vastausta",
      "phSave": "Tallenna parin kirjaan",
      "phSaved": "Tallennettu parin kirjaan",
      "phForbidden": "Kirjoita ilman linkkejä ja rumia sanoja.",
      "phNext": "Seuraava lause",
      "phFinal": "Yhdessä täydennetyt lauseet: {count}",
      "phFinalLead": "Tallenna mieluisimmat vastaukset parin kirjaan.",
      "featPhrase": "Live-peli ”Täydennä lause” ja parin kirja",
      "bookTitle": "Parin kirja",
      "bookNote": "Lämpimimmät vastaukset pelistä ”Täydennä lause”, tallessa tililläsi.",
      "bookOpen": "Avaa kirja",
      "bookEmpty": "Kirja on vielä tyhjä. Pelaa ”Täydennä lause” ja tallenna vastaukset, joista pidät.",
      "bookDelete": "Poista",
      "bookDeleteConfirm": "Poistetaanko tämä sivu kirjasta?",
      "bookYou": "Sinä",
      "inviteTitle": "Kutsu ystävä",
      "inviteNote": "Ystäväsi saa viestin, jossa on peli.",
      "invite": "Kutsu",
      "invited": "Kutsuttu",
      "inviteNone": "Lisää ystäviä ”Ystävät”-osiossa, niin voit kutsua heidät yhdellä napautuksella.",
      "inviteSent": "Kutsu lähetetty: {name}"
    },
    "questions": {
      "q01": [
        "Lempivuodenaikani?",
        "Kevät",
        "Kesä",
        "Syksy",
        "Talvi"
      ],
      "q02": [
        "Mitä valitsen aamiaiseksi?",
        "Kahvin ja croissantin",
        "Puuroa",
        "Kananmunia",
        "Pelkkää teetä"
      ],
      "q03": [
        "Täydellinen vapaapäiväni?",
        "Kotona viltin alla",
        "Kävely puistossa",
        "Retki kaupungin ulkopuolelle",
        "Aikaa ystävien kanssa"
      ],
      "q04": [
        "Minne haaveilen matkustavani?",
        "Meren rannalle",
        "Vuorille",
        "Suurkaupunkiin",
        "Kodikkaaseen mökkiin maalle"
      ],
      "q05": [
        "Lempijäätelöni?",
        "Vanilja",
        "Suklaa",
        "Mansikka",
        "Pistaasi"
      ],
      "q06": [
        "Mikä ilahduttaa minua nopeimmin?",
        "Halaus",
        "Yllätys",
        "Lämpimät sanat",
        "Jotain herkullista"
      ],
      "q07": [
        "Olen enemmän…",
        "Aamuihminen",
        "Iltaihminen",
        "Nukun, kun ehdin",
        "Päiväunien ystävä"
      ],
      "q08": [
        "Minkä elokuvan valitsen tänä iltana?",
        "Komedian",
        "Romanttisen tarinan",
        "Dekkarin",
        "Animaation"
      ],
      "q09": [
        "Lempivärini?",
        "Punainen",
        "Sininen",
        "Vihreä",
        "Vaaleanpunainen"
      ],
      "q10": [
        "Mitä pelkään eniten?",
        "Hämähäkkejä",
        "Korkeita paikkoja",
        "Pimeää",
        "Myöhästymistä"
      ],
      "q11": [
        "Mistä kukista pidän?",
        "Ruusut",
        "Tulppaanit",
        "Pionit",
        "Päivänkakkarat"
      ],
      "q12": [
        "Mitä teen, kun olen surullinen?",
        "Soitan läheiselle",
        "Syön jotain makeaa",
        "Lähden kävelylle",
        "Menen nukkumaan"
      ],
      "q13": [
        "Mikä eläin on lähimpänä sydäntäni?",
        "Kissanpentu",
        "Koira",
        "Karhunpentu",
        "Pieni kettu"
      ],
      "q14": [
        "Paras lahja minulle?",
        "Jotain itse tehtyä",
        "Matka",
        "Koru",
        "Kirja"
      ],
      "q15": [
        "Lempijuomani?",
        "Musta tee",
        "Vihreä tee",
        "Kahvi",
        "Kaakao"
      ],
      "q16": [
        "Lempivälipalani?",
        "Suklaa",
        "Sipsit",
        "Hedelmät",
        "Leivos"
      ],
      "q17": [
        "Mitä valitsen matkoilla?",
        "Museot",
        "Rannan",
        "Paikallisen ruoan",
        "Kuljeskelun ilman suunnitelmaa"
      ],
      "q18": [
        "Miten vietän mieluiten illan?",
        "Kirjan kanssa",
        "Sarjan parissa",
        "Jutellen",
        "Kävelyllä"
      ],
      "q19": [
        "Millaisesta säästä pidän eniten?",
        "Aurinkoisesta",
        "Lämpimästä sateesta",
        "Lumisateesta",
        "Kevyestä tuulesta"
      ],
      "q20": [
        "Mikä supervoima sopisi minulle?",
        "Lentäminen",
        "Ajatusten lukeminen",
        "Ajan pysäyttäminen",
        "Teleporttaus"
      ],
      "q21": [
        "Mikä on minulle tärkeintä läheisissä?",
        "Luottamus",
        "Huolenpito",
        "Huumorintaju",
        "Tuki"
      ],
      "q22": [
        "Mitä juhlaa odotan eniten?",
        "Uutta vuotta",
        "Syntymäpäivääni",
        "Kesälomaa",
        "Ystävänpäivää"
      ],
      "q23": [
        "Miten sanon useimmiten ”rakastan sinua”?",
        "Sanoin",
        "Teoin",
        "Halauksin",
        "Lahjoin"
      ],
      "q24": [
        "Mitä tilaan kahvilassa?",
        "Pastaa",
        "Sushia",
        "Salaatin",
        "Jälkiruoan"
      ],
      "q25": [
        "Lempiaikani vuorokaudesta?",
        "Aamu",
        "Iltapäivä",
        "Ilta",
        "Yö"
      ],
      "q26": [
        "Minkä keittiön valitsen?",
        "Italialaisen",
        "Japanilaisen",
        "Kotiruoan",
        "Meksikolaisen"
      ],
      "q27": [
        "Missä ajattelen parhaiten?",
        "Suihkussa",
        "Kävelyllä",
        "Matkalla",
        "Ennen nukahtamista"
      ],
      "q28": [
        "Mitä teen aamulla ensimmäiseksi?",
        "Katson puhelinta",
        "Juon vettä",
        "Keitän kahvit",
        "Lojun vielä hetken"
      ],
      "q29": [
        "Lempihedelmäni?",
        "Omena",
        "Banaani",
        "Mango",
        "Vesimeloni"
      ],
      "q30": [
        "Mikä harrastus sopii minulle parhaiten?",
        "Piirtäminen",
        "Ruoanlaitto",
        "Urheilu",
        "Lukeminen"
      ],
      "q31": [
        "Miten haluan juhlia syntymäpäivääni?",
        "Isoilla juhlilla",
        "Illallisella kahdestaan",
        "Matkalla",
        "Rauhallisella illalla kotona"
      ],
      "q32": [
        "Mitä ajattelen yllätyksistä?",
        "Rakastan niitä",
        "Ne jännittävät vähän",
        "Järjestän niitä mielelläni muille",
        "Haluan mieluummin tietää etukäteen"
      ],
      "q33": [
        "Mistä herkusta pidän eniten?",
        "Kakusta",
        "Jäätelöstä",
        "Kekseistä",
        "Karkeista"
      ],
      "q34": [
        "Mitä veisin autiolle saarelle?",
        "Kirjan",
        "Puhelimen",
        "Viltin",
        "Kameran"
      ],
      "q35": [
        "Miten rentoudun rankan päivän jälkeen?",
        "Lämmin kylpy",
        "Sarja",
        "Kävely",
        "Juttelu läheisen kanssa"
      ],
      "q36": [
        "Millä matkustan mieluiten?",
        "Junalla",
        "Lentokoneella",
        "Autolla",
        "Pyörällä"
      ],
      "q37": [
        "Lempileikkini lapsena?",
        "Piilosta",
        "Hippa",
        "Rakennuspalikat",
        "Piirtäminen"
      ],
      "q38": [
        "Mikä satu on lähimpänä minua?",
        "Tuhkimo",
        "Pikku prinssi",
        "Nalle Puh",
        "Liisa Ihmemaassa"
      ],
      "q39": [
        "Miten ilahduttaisin mieluummin läheistä?",
        "Yllätyksellä",
        "Kortilla",
        "Matkalla",
        "Illallisella"
      ],
      "q40": [
        "Mitä kuvaan useimmiten?",
        "Itseäni",
        "Luontoa",
        "Ruokaa",
        "En juuri kuvaa"
      ],
      "q41": [
        "Lempipaikkani kotona?",
        "Sänky",
        "Keittiö",
        "Sohva",
        "Parveke"
      ],
      "q42": [
        "Mitä huomaan ihmisestä ensimmäiseksi?",
        "Hymyn",
        "Silmät",
        "Äänen",
        "Huumorintajun"
      ],
      "q43": [
        "Mikä naurattaa minua nopeimmin?",
        "Hauskat videot",
        "Läheisten vitsit",
        "Kiusalliset tilanteet",
        "Eläimet"
      ],
      "q44": [
        "Mitä juon kuumana kesäpäivänä?",
        "Limonadia",
        "Jääteetä",
        "Mehua",
        "Jäävettä"
      ],
      "q45": [
        "Mikä elementti on lähimpänä minua?",
        "Vesi",
        "Tuli",
        "Maa",
        "Ilma"
      ],
      "q46": [
        "Millaisia tarinoita rakastan?",
        "Seikkailuja",
        "Rakkaustarinoita",
        "Tieteisfiktiota",
        "Tositarinoita"
      ],
      "q47": [
        "Miten vietän sadepäivän?",
        "Luen",
        "Nukun",
        "Katson elokuvan",
        "Kävelen sateenvarjon alla"
      ],
      "q48": [
        "Mitä arvostan lahjassa eniten?",
        "Ajatusta",
        "Hyödyllisyyttä",
        "Kauneutta",
        "Yllätystä"
      ],
      "q49": [
        "Millaiset perunat valitsen?",
        "Muussin",
        "Ranskalaiset",
        "Uuniperunat",
        "Sipsit"
      ],
      "q50": [
        "Minne menen ensimmäiseksi uudessa kaupungissa?",
        "Kahvilaan",
        "Museoon",
        "Puistoon",
        "Ostoksille"
      ],
      "q51": [
        "Mitä teen, kun en saa unta?",
        "Luen",
        "Selaan puhelinta",
        "Lasken lampaita",
        "Juon lämmintä maitoa"
      ],
      "q52": [
        "Miten valmistaudun tärkeään päivään?",
        "Suunnittelen kaiken etukäteen",
        "Teen kaiken viime tingassa",
        "Pyydän apua",
        "Jännitän enkä saa unta"
      ],
      "q53": [
        "Mitä urheilua katson mieluiten?",
        "Jalkapalloa",
        "Tennistä",
        "Taitoluistelua",
        "En katso urheilua"
      ],
      "q54": [
        "Mikä lemmikki sopii minulle?",
        "Kissa",
        "Koira",
        "Papukaija",
        "Hamsteri"
      ],
      "q55": [
        "Millaisia viestejä kirjoitan?",
        "Pitkiä",
        "Lyhyitä",
        "Täynnä emojeita",
        "Ääniviestejä"
      ],
      "q56": [
        "Minkä lahjan olen säilyttänyt pisimpään?",
        "Kirjeen",
        "Lelun",
        "Valokuvan",
        "Korun"
      ],
      "q57": [
        "Minkä valitsisin mieluummin?",
        "Teetä takan ääressä",
        "Piknikin nurmella",
        "Kävelyn meren rannalla",
        "Elokuvat"
      ],
      "q58": [
        "Mikä kohteliaisuus ilahduttaisi eniten?",
        "Ulkonäöstäni",
        "Älystäni",
        "Ystävällisyydestäni",
        "Huumoristani"
      ],
      "q59": [
        "Täydellinen aamuni?",
        "Aamiainen sängyssä",
        "Aikainen lenkki",
        "Pitkät unet",
        "Kahvi parvekkeella"
      ],
      "q60": [
        "Mitä haluan oppia?",
        "Tanssimaan",
        "Kokkaamaan",
        "Uuden kielen",
        "Piirtämään"
      ]
    },
    "yesNo": {
      "c01": [
        "Ikävöitkö minua juuri nyt?",
        "ikävöi sinua kovasti",
        "kestää, mutta ajattelee sinua"
      ],
      "c02": [
        "Hymyiletkö, kun näet viestini?",
        "hymyilee aina",
        "hymyilee sisäisesti"
      ],
      "c03": [
        "Muistatko ensitapaamisemme?",
        "muistaa jokaisen minuutin",
        "muistaa tärkeimmän — sinut"
      ],
      "c04": [
        "Haluatko halauksen tänään?",
        "odottaa halaustasi",
        "säästää halaukset myöhemmäksi"
      ],
      "c05": [
        "Lähdetäänkö yhdessä meren rannalle?",
        "pakkaa jo laukkua",
        "haaveilee vuorista"
      ],
      "c06": [
        "Saanko sinut nauramaan?",
        "nauraa sydämestään",
        "piilottaa hymyn"
      ],
      "c07": [
        "Onko sinulla rauhallinen olo kanssani?",
        "tuntee rauhaa vierelläsi",
        "pitää hauskaa kanssasi"
      ],
      "c08": [
        "Ajatteletko minua päivän aikana?",
        "ajattelee sinua hyvin usein",
        "ajattelee sinua juuri nyt"
      ],
      "c09": [
        "Rakastatko yllätyksiäni?",
        "rakastaa yllätyksiäsi",
        "pitää eniten siitä, että olet lähellä"
      ],
      "c10": [
        "Leivotaanko yhdessä piirakka?",
        "laittaa jo esiliinaa",
        "ostaa mieluummin kakun"
      ],
      "c11": [
        "Katsotaanko illalla elokuva?",
        "valitsee jo elokuvaa",
        "haluaa mieluummin jutella"
      ],
      "c12": [
        "Pidätkö äänestäni?",
        "voisi kuunnella loputtomiin",
        "rakastaa nauruasi vielä enemmän"
      ],
      "c13": [
        "Pidetäänkö viikonloppuna piknik?",
        "laittaa viltin valmiiksi",
        "kutsuu sinut kodikkaaseen kahvilaan"
      ],
      "c14": [
        "Haluatko kirjeen minulta?",
        "odottaa kirjettäsi",
        "haluaa kuulla kaiken kasvotusten"
      ],
      "c15": [
        "Merkitsenkö sinulle paljon?",
        "merkitset valtavasti",
        "enemmän kuin arvaatkaan"
      ],
      "c16": [
        "Kävelläänkö sateessa?",
        "ottaa sateenvarjon kahdelle",
        "keittää mieluummin teetä kotona"
      ],
      "c17": [
        "Olemmeko samanlaisia?",
        "olette kuin kaksi puolikasta",
        "täydennätte toisianne täydellisesti"
      ],
      "c18": [
        "Pidätkö ruoanlaitostani?",
        "pyytää lisää",
        "rakastaa kokata yhdessä kanssasi"
      ],
      "c19": [
        "Hankitaanko yhdessä lemmikki?",
        "valitsee jo nimeä",
        "nalle riittää toistaiseksi"
      ],
      "c20": [
        "Tiedätkö, mitä rakastan?",
        "osaa ulkoa",
        "haluaa tietää vielä enemmän"
      ],
      "c21": [
        "Tanssitaanko?",
        "ojentaa jo kätensä",
        "taputtaa käsiään"
      ],
      "c22": [
        "Inspiroinko sinua?",
        "inspiroit joka päivä",
        "vierelläsi on vain lämmin olo"
      ],
      "c23": [
        "Säilytätkö valokuviamme?",
        "vaalii jokaista",
        "odottaa uusia, vielä kauniimpia"
      ],
      "c24": [
        "Katsotaanko auringonnousu yhdessä?",
        "laittaa jo herätyksen",
        "katsoo mieluummin auringonlaskua"
      ],
      "c25": [
        "Kerrotko minulle salaisuuden?",
        "kuiskaa sen korvaasi",
        "pysyköön se arvoituksena"
      ],
      "c26": [
        "Uskotko minuun?",
        "uskoo sinuun vahvasti",
        "kannustaa sinua joka päivä"
      ],
      "c27": [
        "Lähdetäänkö matkalle, vain me kaksi?",
        "haaveilee siitä",
        "ottaa kaikki läheiset mukaan"
      ],
      "c28": [
        "Odotatko soittoani?",
        "odottaa hymyillen",
        "toivoo mieluummin, että tulet käymään"
      ],
      "c29": [
        "Pidätkö halauksistani?",
        "maailman lämpimimmät",
        "pitää mielellään kädestä"
      ],
      "c30": [
        "Luetaanko toisillemme ääneen?",
        "valitsee jo kirjaa",
        "kuuntelee mieluummin sinua"
      ],
      "c31": [
        "Otetaanko tänään yhteiskuva?",
        "etsii jo kaunista taustaa",
        "ensin jutellaan"
      ],
      "c32": [
        "Piristänkö sinua?",
        "aina",
        "kanssasi suru on kevyempää"
      ],
      "c33": [
        "Syödäänkö huomenna aamiainen yhdessä?",
        "keittää jo kaakaota",
        "haaveilee pitkistä unista"
      ],
      "c34": [
        "Muistatko syntymäpäiväni?",
        "ilman muistutusta",
        "valmistelee salaa yllätystä"
      ],
      "c35": [
        "Lähdetäänkö luistelemaan?",
        "kaivaa luistimet esiin",
        "kannustaa sinua laidalta"
      ],
      "c36": [
        "Onko tänään hyvä päivä sinulle?",
        "loistava päivä",
        "paranee, kun olet lähellä"
      ],
      "c37": [
        "Piirrätkö muotokuvani?",
        "ottaa jo kynän",
        "piirtää pienen sydämen"
      ],
      "c38": [
        "Istutetaanko yhdessä puu?",
        "valitsee paikan",
        "aloittaa ikkunalaudan kukasta"
      ],
      "c39": [
        "Haluatko kuulla kohteliaisuuden?",
        "odottaa innolla",
        "ujostuttaa, mutta haluaa kovasti"
      ],
      "c40": [
        "Pelataanko myöhemmin uudelleen?",
        "haluaa vielä yhden kierroksen",
        "halaa mieluummin kuin pelaa"
      ]
    },
    "loves": {
      "s01": [
        "Minne lomalle?",
        "Ranta",
        "Vuoret",
        "Matkailu",
        "Omaa aikaa"
      ],
      "s02": [
        "Täydellinen ilta?",
        "Elokuva kotona",
        "Kävely",
        "Ravintola",
        "Lautapelit"
      ],
      "s03": [
        "Lempisää?",
        "Aurinko",
        "Sade",
        "Lumi",
        "Tähtiyö"
      ],
      "s04": [
        "Lempieläin?",
        "Kissanpentu",
        "Koiranpentu",
        "Hevonen",
        "Delfiini"
      ],
      "s05": [
        "Mitä illalliseksi?",
        "Pizza",
        "Sushi",
        "Leivokset",
        "Grilli"
      ],
      "s06": [
        "Lempijuoma?",
        "Kahvi",
        "Tee",
        "Kaakao",
        "Limonadi"
      ],
      "s07": [
        "Lempivuodenaika?",
        "Kevät",
        "Kesä",
        "Syksy",
        "Talvi"
      ],
      "s08": [
        "Lempikukat?",
        "Ruusut",
        "Tulppaanit",
        "Auringonkukat",
        "Laventeli"
      ],
      "s09": [
        "Miten rentoutua?",
        "Kirjan kanssa",
        "Piirtäen",
        "Pyöräillen",
        "Päiväunet riippumatossa"
      ],
      "s10": [
        "Miten matkustetaan?",
        "Junalla",
        "Lentokoneella",
        "Autolla",
        "Laivalla"
      ],
      "s11": [
        "Unelmakoti?",
        "Kaupunkiasunto",
        "Talo meren rannalla",
        "Mökki vuorilla",
        "Maatila"
      ],
      "s12": [
        "Jotain makeaa?",
        "Jäätelö",
        "Suklaa",
        "Kakku",
        "Hedelmät"
      ],
      "s13": [
        "Täydellinen aamu?",
        "Aamiainen sängyssä",
        "Lenkki",
        "Pitkät unet",
        "Kahvi parvekkeella"
      ],
      "s14": [
        "Unelmatreffit?",
        "Piknik",
        "Luistinrata",
        "Huvipuisto",
        "Tähdet katolla"
      ],
      "s15": [
        "Paras lahja?",
        "Kukkakimppu",
        "Kirje",
        "Matka",
        "Lahjarasia"
      ],
      "s16": [
        "Lempiluonto?",
        "Meri",
        "Metsä",
        "Aavikko",
        "Revontulet"
      ]
    },
    "who": [
      "Kumpi meistä myöhästyy useammin?",
      "Kumpi meistä tekee sovinnon ensin?",
      "Kumpi meistä kokkaa paremmin?",
      "Kumpi meistä nauraa useammin?",
      "Kumpi meistä laittautuu pidempään?",
      "Kumpi meistä hukkaa avaimet useammin?",
      "Kumpi meistä muistaa tärkeät päivämäärät paremmin?",
      "Kumpi meistä on suurempi herkkusuu?",
      "Kumpi meistä nukahtaa ensin?",
      "Kumpi meistä herää aikaisemmin?",
      "Kumpi meistä sanoo useammin ”minulla on ikävä sinua”?",
      "Kumpi meistä valitsee parempia lahjoja?",
      "Kumpi meistä vitsailee useammin?",
      "Kumpi meistä ajaa autoa paremmin?",
      "Kumpi meistä puhuu puhelimessa pidempään?",
      "Kumpi meistä rakastaa matkustamista enemmän?",
      "Kumpi meistä loukkaantuu helpommin?",
      "Kumpi meistä antaa anteeksi nopeammin?",
      "Kumpi meistä ottaa enemmän kuvia?",
      "Kumpi meistä osaa käsitellä rahaa paremmin?",
      "Kumpi meistä ostaa useammin turhia tavaroita?",
      "Kumpi meistä osaa lohduttaa paremmin?",
      "Kumpi meistä pysyy rauhallisempana vaikeina hetkinä?",
      "Kumpi meistä etsii aina puhelintaan?",
      "Kumpi meistä pitää enemmän vieraiden kutsumisesta?",
      "Kumpi meistä tekee aamiaisen useammin?",
      "Kumpi meistä löytää paremmin perille uudessa kaupungissa?",
      "Kumpi meistä kirjoittaa pidempiä viestejä?",
      "Kumpi meistä ehdottaa kävelyä ensin?",
      "Kumpi meistä rakastaa eläimiä enemmän?",
      "Kumpi meistä pitää salaisuudet paremmin?",
      "Kumpi meistä valitsee ruokalistalta pidempään?",
      "Kumpi meistä huolehtii läheisistä enemmän?",
      "Kumpi meistä järjestää enemmän yllätyksiä?",
      "Kumpi meistä on siistimpi?",
      "Kumpi meistä huomaa uuden kampauksen ensin?",
      "Kumpi meistä muistelee hauskoja juttuja useammin?",
      "Kumpi meistä on kärsivällisempi?",
      "Kumpi meistä sanoo useammin ”kiitos”?",
      "Kumpi meistä tarjoaa apua ensin?"
    ],
    "phrases": [
      "Hymyilen, kun sinä…",
      "Lempipäiväni kanssasi on…",
      "Kiitos siitä, että…",
      "Kun olen surullinen, minua auttaa…",
      "Jonain päivänä haluan, että me…",
      "Lämpimin muistoni meistä on…",
      "Sinä osaat parhaiten…",
      "Tunnen oloni rauhalliseksi, kun…",
      "Jos meillä olisi kokonainen vapaapäivä, me…",
      "Olen ylpeä sinusta, koska…",
      "Täydellinen iltamme on…",
      "En koskaan unohda, kuinka sinä…",
      "Pidän siitä, kun sanot…",
      "Ensi vuonna haluan, että me…",
      "Minulle olet kuin…",
      "Paras lahja sinulta on…",
      "Minulla on ikävä sinua, kun…",
      "Olemme hauskimmillamme, kun…",
      "Olen pitkään halunnut sanoa sinulle…",
      "Meidän paikkamme on…",
      "Kun ajattelen sinua, minä…",
      "Teet päivästäni paremman, kun…",
      "Pidän tavastamme…",
      "Toiveeni meille: …",
      "Hauskin asia, joka meille on sattunut, on…",
      "Tunnen huolenpitosi, kun sinä…",
      "Aamu kanssasi on…",
      "Jos olisimme yksi sana, se olisi…",
      "Haluan oppia sinulta, miten…",
      "Kiitos, että aina…"
    ]
  },
  "ja": {
    "text": {
      "homeLink": "ふたりで遊ぶゲーム",
      "eyebrow": "GLOWLETTER · ふたりのゲーム",
      "title": "いっしょに遊ぼう",
      "close": "閉じる",
      "lead": "大切な人にゲームを送りましょう。リンクから遊ぶのは無料で、アカウントも不要です。",
      "quizTitle": "わたしのこと、どれくらい知ってる？",
      "quizNote": "自分についての質問に答えて、大切な人に当ててもらいましょう。結果はあなたに届きます。",
      "create": "クイズを作る",
      "soon": "近日公開",
      "soonTitle": "次のゲームを準備中",
      "duel": "早押し対決",
      "loves": "ふたりの好きなもの",
      "cards": "ふたりの神経衰弱",
      "who": "どっちがそう？",
      "phrase": "文の続きを書こう",
      "myQuizzes": "わたしのクイズ",
      "noQuizzes": "まだクイズはありません。最初のクイズは数分で作れます。",
      "forWhom": "{name}へ",
      "noRecipient": "クイズ",
      "resultsCount": "結果：{count}件",
      "newResults": "新着：{count}",
      "noResults": "まだ誰も遊んでいません。",
      "anonymous": "名前なし",
      "results": "結果",
      "copyLink": "リンクをコピー",
      "share": "送る",
      "deleteQuiz": "クイズを削除",
      "deleteConfirm": "このクイズと結果を削除しますか？リンクは使えなくなります。",
      "deleted": "クイズを削除しました",
      "linkCopied": "リンクをコピーしました",
      "back": "戻る",
      "next": "次へ",
      "stepNames": "ステップ1/2 · 名前",
      "yourName": "あなたの名前",
      "yourNamePlaceholder": "お名前",
      "recipient": "相手 · 任意",
      "recipientPlaceholder": "大切な人の名前",
      "nameRequired": "名前を入力してください。",
      "forbiddenName": "ふつうの名前を入力してください。",
      "stepAnswers": "ステップ2/2 · あなたの答え",
      "answersLead": "自分に当てはまるものを選んでください。質問はいつでも入れ替えられます。",
      "swap": "別の質問",
      "progress": "{total}問中{done}問に回答",
      "answerAll": "すべての質問で答えを選んでください。",
      "finish": "リンクを受け取る",
      "creating": "クイズを作成中…",
      "createdTitle": "クイズができました！",
      "createdLead": "リンクを送りましょう。相手が答えると「わたしのクイズ」に結果が表示されます。",
      "shareText": "{name}から「わたしのこと、どれくらい知ってる？」ゲームの招待です",
      "signInTitle": "ログインが必要です",
      "signInNote": "結果があなたに届くよう、クイズはアカウントに保存されます。",
      "signIn": "ログイン",
      "premiumNote": "ゲーム作成はフルアクセスに含まれます。リンクから遊ぶのは誰でも無料です。",
      "failed": "うまくいきませんでした。接続を確認して、もう一度お試しください。",
      "rateLimited": "試行回数が多すぎます。しばらくしてからお試しください。",
      "playEyebrow": "ふたりのゲーム",
      "playInvite": "{name}からゲームの招待です",
      "playLead": "質問は{count}問。答えを当ててください。最後にいくつ一致したかわかります。",
      "playName": "あなたの名前 · 任意",
      "playNamePlaceholder": "あなただとわかるように",
      "start": "はじめる",
      "playLoading": "ゲームを読み込み中…",
      "playMissing": "このゲームは利用できません。リンクが削除されたか、期限が切れています。",
      "playOffline": "ゲームにはインターネット接続が必要です。",
      "retry": "再試行",
      "questionOf": "{total}問中{n}問目",
      "asks": "{name}からの質問",
      "counting": "一致を数えています…",
      "scoreOf": "{total}問中{score}問",
      "tierAll": "完璧！誰よりもお互いを知っています",
      "tierHigh": "お互いをとてもよく知っています",
      "tierMid": "なかなか！まだ知らないこともありそう",
      "tierLow": "これからすてきな発見がたくさんあります",
      "sentTo": "{name}にあなたの結果が届きます",
      "review": "あなたの答え",
      "rightAnswer": "正解",
      "makeOwn": "自分のクイズを作る",
      "home": "ホーム",
      "resultToast": "{name}：「わたしのこと、どれくらい知ってる？」で{total}問中{score}問",
      "ownerAnswers": "作成者の答え",
      "playerAnswers": "{name}の答え",
      "paywallTitle": "ゲーム、楽しみ<br><em>そして手紙</em>",
      "groupGames": "ゲーム",
      "groupFun": "楽しみ",
      "groupLetters": "手紙",
      "featQuiz": "「わたしのこと、どれくらい知ってる？」結果はあなたに届きます",
      "featGamesSoon": "早押し対決、「ふたりの好きなもの」、くまの神経衰弱",
      "featFunSoon": "「どっちがそう？」と「文の続きを書こう」、ふたりのノート付き",
      "featCollection": "25言語の手紙と詩のコレクションすべて",
      "featMoments": "記念日、リマインダー、決めた日に開くQRレター",
      "featAudio": "手紙に自分の音声、受け取った人からの返事",
      "ynTitle": "イエス・ノー",
      "ynNote": "ふたりで遊ぶライブゲーム。1枚につき5秒。時間内に答えると、相手の答えが見られます。",
      "ynCreate": "ルームを作る",
      "ynWaiting": "{name}がリンクを開くのを待っています…",
      "ynWaitingAny": "相手を待っています…",
      "ynShareText": "{name}からライブゲーム「イエス・ノー」への招待です",
      "ynPartnerHere": "{name}が来ました！",
      "ynStart": "ゲームをはじめる",
      "ynWaitHost": "{name}がまもなくゲームをはじめます",
      "ynYes": "イエス",
      "ynNo": "ノー",
      "ynMissed": "時間切れ — このカードは閉じたままです",
      "ynMatch": "同じ答え！",
      "ynRound": "{total}枚中{n}枚目",
      "ynAnswered": "答えを送りました。相手を待っています…",
      "ynFinal": "{total}枚中{score}枚が一致",
      "ynFinalHigh": "言葉がなくても通じ合っています",
      "ynFinalMid": "ちがうからこそ、近いふたり",
      "ynAgain": "もう一度遊ぶ",
      "ynLeft": "相手の接続が切れました。戻るのを待っています…",
      "ynYou": "あなた",
      "ynOffline": "ゲームに接続できません。インターネットを確認して、リンクを開き直してください。",
      "ynJoin": "ゲームに参加",
      "ynJoinLead": "{name}が待っています。答えは5秒以内に！",
      "ynStepNames": "あなたと相手の名前",
      "ynRoomReady": "ルームの準備ができました — リンクを送りましょう",
      "ynStayHere": "この画面は開いたままに。相手がリンクを開くとゲームが始まります。",
      "featYesNo": "ライブゲーム「イエス・ノー」— 答えは5秒",
      "ynPartnerMissed": "回答なし — 時間切れ",
      "lvTitle": "ふたりの好きなもの",
      "lvNote": "ふたりで遊ぶライブゲーム。4枚の絵から、いちばん好きなものを10秒で選びます。同じものを選んでもOK！",
      "lvShareText": "{name}からライブゲーム「ふたりの好きなもの」への招待です",
      "lvJoinLead": "{name}が待っています。いちばん好きな絵を選んでね！",
      "lvRound": "{total}テーマ中{n}番目",
      "lvPick": "いちばん好きなものを選んでね",
      "lvBoth": "ふたりとも選んだのは：{item}",
      "lvCommon": "ふたりとも好きなもの",
      "lvDiff": "好みがちがうのも楽しい！",
      "lvFinalHigh": "共通点がたくさん！",
      "lvFinalMid": "ちがうからこそ、補い合えるふたり",
      "featLoves": "ライブゲーム「ふたりの好きなもの」— 4枚の絵からいっしょに選ぶ",
      "featGamesSoon2": "早押し対決と、くまの神経衰弱",
      "mcTitle": "くまの神経衰弱",
      "mcNote": "ふたりで遊ぶライブ神経衰弱。交代で2枚ずつめくって、ペアを探そう。8枚から16枚まで、3つのレベル。",
      "mcShareText": "{name}からライブゲーム「くまの神経衰弱」への招待です",
      "mcJoinLead": "{name}が待っています。交代でペアを探そう！",
      "mcLevel": "レベル {n}/{total}",
      "mcTurnYou": "あなたの番 — 2枚めくってね",
      "mcTurnThem": "{name}の番",
      "mcPairs": "見つけたペア：{found}/{total}",
      "mcLevelDone": "全部のペアを見つけた！",
      "mcTimeUp": "このレベルは時間切れ",
      "mcNext": "次はレベル {n}",
      "mcFinal": "見つけたペア：{found}/{total}",
      "mcFinalHigh": "最高のチーム！",
      "mcFinalMid": "いい勝負！もう一回？",
      "featCards": "ライブゲーム「くまの神経衰弱」— ふたりでペア探し",
      "featGamesSoon3": "早押し対決",
      "duTitle": "どっちが速い？",
      "duNote": "ライブ対決：ひとつの言葉と4枚の絵。正しい絵を先にタップしましょう。間違えるとそのラウンドは負けです。",
      "duShareText": "{name}さんからライブ対決「どっちが速い？」の挑戦が届きました",
      "duJoinLead": "{name}さんが待っています。正しい絵をすばやく見つけましょう！",
      "duRound": "ラウンド {n}/{total}",
      "duFind": "探して：{item}",
      "duYouWon": "あなたの方が速かった！",
      "duTheyWon": "{name}さんの方が速かった",
      "duWrong": "違う絵です — このラウンドは負け",
      "duNobody": "時間内に誰も見つけられませんでした",
      "duScore": "あなた {you} : {them} {name}",
      "duFinalWin": "勝利！今日は目が冴えていますね。",
      "duFinalLose": "今回は{name}さんの勝ち — もう一回？",
      "duFinalDraw": "引き分け — 息ぴったり！",
      "duSeconds": "{s}秒",
      "featDuel": "ライブ対決「どっちが速い？」— 先に絵を見つけよう",
      "whoTitle": "ふたりのどっち？",
      "whoNote": "ふたりで遊ぶライブゲーム：質問はひとつ。「自分」かパートナーの名前をタップ。お互いの見方が合うか確かめましょう。",
      "whoShareText": "{name}さんがライブゲーム「ふたりのどっち？」に招待しています",
      "whoJoinLead": "{name}さんが待っています。正直に答えて、あとで比べましょう！",
      "whoRound": "質問 {n}/{total}",
      "whoMe": "自分",
      "whoAgree": "意見が一致：{name}",
      "whoDiffer": "意見が分かれました — 話し合ってみて！",
      "whoFinal": "{total}問中{score}問で一致しました",
      "whoFinalHigh": "お互いのことをよくわかっていますね！",
      "whoFinalMid": "話したいことがたくさん — それも素敵です",
      "featWho": "ライブゲーム「ふたりのどっち？」— 意見が合うか確かめよう",
      "phTitle": "文を完成させよう",
      "phNote": "ふたりで遊ぶライブゲーム：同じあたたかい文の続きをそれぞれ自分の言葉で書き、お互いの答えを読みましょう。",
      "phShareText": "{name}さんがライブゲーム「文を完成させよう」に招待しています",
      "phJoinLead": "{name}さんが待っています。自分の言葉で文を完成させましょう！",
      "phRound": "文 {n}/{total}",
      "phPlaceholder": "続きを書く…",
      "phDone": "完了",
      "phWaiting": "{name}さんを待っています…",
      "phSkipped": "回答なし",
      "phSave": "「ふたりの本」に保存",
      "phSaved": "「ふたりの本」に保存しました",
      "phForbidden": "リンクや乱暴な言葉を使わずに書いてください。",
      "phNext": "次の文",
      "phFinal": "一緒に完成させた文：{count}",
      "phFinalLead": "気に入った答えを「ふたりの本」に保存しましょう。",
      "featPhrase": "ライブゲーム「文を完成させよう」と「ふたりの本」",
      "bookTitle": "ふたりの本",
      "bookNote": "「文を完成させよう」のいちばんあたたかい答えを、アカウントに保存しています。",
      "bookOpen": "本を開く",
      "bookEmpty": "本はまだ空です。「文を完成させよう」で遊んで、気に入った答えを保存しましょう。",
      "bookDelete": "削除",
      "bookDeleteConfirm": "このページを本から削除しますか？",
      "bookYou": "あなた",
      "inviteTitle": "友だちを招待",
      "inviteNote": "友だちにゲームのメッセージが届きます。",
      "invite": "招待",
      "invited": "招待済み",
      "inviteNone": "「友だち」で友だちを追加すると、ワンタップで招待できます。",
      "inviteSent": "{name}さんに招待を送りました"
    },
    "questions": {
      "q01": [
        "わたしの好きな季節は？",
        "春",
        "夏",
        "秋",
        "冬"
      ],
      "q02": [
        "朝ごはんに選ぶのは？",
        "コーヒーとクロワッサン",
        "おかゆ・オートミール",
        "卵料理",
        "お茶だけ"
      ],
      "q03": [
        "理想の休日は？",
        "家でブランケットにくるまる",
        "公園をお散歩",
        "郊外へおでかけ",
        "友だちと過ごす"
      ],
      "q04": [
        "行ってみたい場所は？",
        "海",
        "山",
        "大都会",
        "田舎のかわいい家"
      ],
      "q05": [
        "好きなアイスの味は？",
        "バニラ",
        "チョコレート",
        "いちご",
        "ピスタチオ"
      ],
      "q06": [
        "いちばん早く元気が出るのは？",
        "ハグ",
        "サプライズ",
        "やさしい言葉",
        "おいしいもの"
      ],
      "q07": [
        "わたしはどちらかというと…",
        "朝型",
        "夜型",
        "寝られるときに寝る",
        "お昼寝が大好き"
      ],
      "q08": [
        "今夜選ぶ映画は？",
        "コメディ",
        "恋愛もの",
        "ミステリー",
        "アニメ"
      ],
      "q09": [
        "好きな色は？",
        "赤",
        "青",
        "緑",
        "ピンク"
      ],
      "q10": [
        "いちばん苦手なものは？",
        "クモ",
        "高いところ",
        "暗やみ",
        "遅刻"
      ],
      "q11": [
        "好きな花は？",
        "バラ",
        "チューリップ",
        "シャクヤク",
        "マーガレット"
      ],
      "q12": [
        "悲しいときにすることは？",
        "大切な人に電話する",
        "甘いものを食べる",
        "散歩に出る",
        "寝る"
      ],
      "q13": [
        "いちばん近いと思う動物は？",
        "子ねこ",
        "犬",
        "子ぐま",
        "子ぎつね"
      ],
      "q14": [
        "わたしにいちばんうれしい贈り物は？",
        "手作りのもの",
        "旅行",
        "アクセサリー",
        "本"
      ],
      "q15": [
        "好きな飲み物は？",
        "紅茶",
        "緑茶",
        "コーヒー",
        "ココア"
      ],
      "q16": [
        "好きなおやつは？",
        "チョコレート",
        "ポテトチップス",
        "フルーツ",
        "ケーキ"
      ],
      "q17": [
        "旅行で選ぶのは？",
        "美術館・博物館",
        "ビーチ",
        "ご当地グルメ",
        "気ままな散策"
      ],
      "q18": [
        "夜の過ごし方は？",
        "読書",
        "ドラマ",
        "おしゃべり",
        "散歩"
      ],
      "q19": [
        "好きな天気は？",
        "晴れ",
        "あたたかい雨",
        "雪",
        "そよ風"
      ],
      "q20": [
        "わたしに似合う超能力は？",
        "空を飛ぶ",
        "心を読む",
        "時間を止める",
        "瞬間移動"
      ],
      "q21": [
        "大切な人にいちばん求めるものは？",
        "信頼",
        "思いやり",
        "ユーモア",
        "支え"
      ],
      "q22": [
        "いちばん楽しみな行事は？",
        "お正月",
        "誕生日",
        "夏休み",
        "バレンタイン"
      ],
      "q23": [
        "「大好き」をいちばんよく伝える方法は？",
        "言葉で",
        "行動で",
        "ハグで",
        "プレゼントで"
      ],
      "q24": [
        "カフェで注文するのは？",
        "パスタ",
        "お寿司",
        "サラダ",
        "デザート"
      ],
      "q25": [
        "わたしの好きな時間帯は？",
        "朝",
        "昼",
        "夕方",
        "夜"
      ],
      "q26": [
        "選ぶ料理のジャンルは？",
        "イタリアン",
        "和食",
        "家庭料理",
        "メキシカン"
      ],
      "q27": [
        "いちばん考えごとがはかどる場所は？",
        "シャワー中",
        "散歩中",
        "移動中",
        "寝る前"
      ],
      "q28": [
        "朝いちばんにすることは？",
        "スマホを見る",
        "水を飲む",
        "コーヒーをいれる",
        "もう少しごろごろする"
      ],
      "q29": [
        "好きな果物は？",
        "りんご",
        "バナナ",
        "マンゴー",
        "スイカ"
      ],
      "q30": [
        "わたしに合う趣味は？",
        "絵を描く",
        "料理",
        "スポーツ",
        "読書"
      ],
      "q31": [
        "誕生日はどう祝いたい？",
        "にぎやかなパーティー",
        "ふたりでディナー",
        "旅行",
        "家で静かな夜"
      ],
      "q32": [
        "サプライズはどう？",
        "大好き",
        "ちょっとドキドキする",
        "人にするのが好き",
        "前もって知りたい"
      ],
      "q33": [
        "好きなスイーツは？",
        "ケーキ",
        "アイス",
        "クッキー",
        "キャンディ"
      ],
      "q34": [
        "無人島に持っていくものは？",
        "本",
        "スマホ",
        "ブランケット",
        "カメラ"
      ],
      "q35": [
        "大変な一日のあと、どう休む？",
        "あたたかいお風呂",
        "ドラマ",
        "散歩",
        "大切な人とおしゃべり"
      ],
      "q36": [
        "好きな乗り物は？",
        "電車",
        "飛行機",
        "車",
        "自転車"
      ],
      "q37": [
        "子どものころ好きだった遊びは？",
        "かくれんぼ",
        "鬼ごっこ",
        "ブロック遊び",
        "お絵かき"
      ],
      "q38": [
        "わたしに近いおとぎ話は？",
        "シンデレラ",
        "星の王子さま",
        "くまのプーさん",
        "不思議の国のアリス"
      ],
      "q39": [
        "大切な人を喜ばせるなら？",
        "サプライズ",
        "カード",
        "旅行",
        "ディナー"
      ],
      "q40": [
        "いちばんよく撮る写真は？",
        "自撮り",
        "自然",
        "ごはん",
        "ほとんど撮らない"
      ],
      "q41": [
        "家でいちばん好きな場所は？",
        "ベッド",
        "キッチン",
        "ソファ",
        "ベランダ"
      ],
      "q42": [
        "人を見てまず気づくのは？",
        "笑顔",
        "目",
        "声",
        "ユーモア"
      ],
      "q43": [
        "いちばん笑ってしまうのは？",
        "おもしろ動画",
        "大切な人の冗談",
        "気まずい場面",
        "動物"
      ],
      "q44": [
        "暑い夏の日に飲むのは？",
        "レモネード",
        "アイスティー",
        "ジュース",
        "氷水"
      ],
      "q45": [
        "わたしに近い元素は？",
        "水",
        "火",
        "土",
        "風"
      ],
      "q46": [
        "好きな物語は？",
        "冒険もの",
        "恋の物語",
        "SF",
        "実話"
      ],
      "q47": [
        "雨の日の過ごし方は？",
        "読書",
        "昼寝",
        "映画",
        "傘をさして散歩"
      ],
      "q48": [
        "プレゼントでいちばんうれしいのは？",
        "気持ち",
        "役に立つこと",
        "きれいなこと",
        "サプライズ感"
      ],
      "q49": [
        "じゃがいもなら？",
        "マッシュポテト",
        "フライドポテト",
        "ベイクドポテト",
        "ポテトチップス"
      ],
      "q50": [
        "初めての街でまず行くのは？",
        "カフェ",
        "美術館・博物館",
        "公園",
        "お店めぐり"
      ],
      "q51": [
        "眠れないときは？",
        "本を読む",
        "スマホを見る",
        "羊を数える",
        "ホットミルクを飲む"
      ],
      "q52": [
        "大事な日の準備は？",
        "前もって全部計画",
        "ぎりぎりにやる",
        "人に手伝ってもらう",
        "緊張して眠れない"
      ],
      "q53": [
        "観るのが好きなスポーツは？",
        "サッカー",
        "テニス",
        "フィギュアスケート",
        "スポーツは観ない"
      ],
      "q54": [
        "わたしに合うペットは？",
        "ねこ",
        "いぬ",
        "インコ",
        "ハムスター"
      ],
      "q55": [
        "どんなメッセージを送る？",
        "長文",
        "短文",
        "絵文字たっぷり",
        "ボイスメッセージ"
      ],
      "q56": [
        "いちばん長く大切にしている贈り物は？",
        "手紙",
        "おもちゃ",
        "写真",
        "アクセサリー"
      ],
      "q57": [
        "選ぶならどっち？",
        "暖炉のそばで紅茶",
        "芝生でピクニック",
        "海辺の散歩",
        "映画館"
      ],
      "q58": [
        "いちばんうれしいほめ言葉は？",
        "見た目について",
        "頭のよさについて",
        "やさしさについて",
        "ユーモアについて"
      ],
      "q59": [
        "理想の朝は？",
        "ベッドで朝ごはん",
        "早朝ランニング",
        "ゆっくり朝寝坊",
        "ベランダでコーヒー"
      ],
      "q60": [
        "身につけたいことは？",
        "ダンス",
        "料理",
        "新しい言語",
        "絵"
      ]
    },
    "yesNo": {
      "c01": [
        "いま、わたしに会いたい？",
        "とても会いたがっています",
        "がまんしているけど、あなたのことを考えています"
      ],
      "c02": [
        "わたしのメッセージを見ると笑顔になる？",
        "いつも笑顔になります",
        "心の中でほほえんでいます"
      ],
      "c03": [
        "初めて会った日のこと、覚えてる？",
        "一分一秒まで覚えています",
        "いちばん大事なこと — あなたを覚えています"
      ],
      "c04": [
        "今日ハグしたい？",
        "あなたのハグを待っています",
        "ハグはあとのお楽しみ"
      ],
      "c05": [
        "いっしょに海へ行こうか？",
        "もう荷造りしています",
        "山にあこがれています"
      ],
      "c06": [
        "わたし、あなたを笑わせてる？",
        "心から笑っています",
        "笑顔をかくしています"
      ],
      "c07": [
        "わたしといると落ち着く？",
        "あなたのそばだと安心します",
        "あなたといると楽しいです"
      ],
      "c08": [
        "昼間、わたしのことを思い出す？",
        "とてもよく思い出します",
        "ちょうど今、思い出しています"
      ],
      "c09": [
        "わたしのサプライズは好き？",
        "あなたのサプライズが大好き",
        "そばにいてくれるのがいちばん"
      ],
      "c10": [
        "いっしょにパイを焼こうか？",
        "もうエプロンをつけています",
        "ケーキを買うほうがいい"
      ],
      "c11": [
        "今夜いっしょに映画を観る？",
        "もう映画を選んでいます",
        "おしゃべりしたい気分"
      ],
      "c12": [
        "わたしの声は好き？",
        "ずっと聞いていられます",
        "あなたの笑い声がもっと好き"
      ],
      "c13": [
        "週末にピクニックしない？",
        "ブランケットを準備中",
        "すてきなカフェに誘っています"
      ],
      "c14": [
        "わたしからの手紙、ほしい？",
        "あなたの手紙を待っています",
        "直接聞きたいと思っています"
      ],
      "c15": [
        "わたしはあなたにとって大切？",
        "とても大切です",
        "思っている以上に大切です"
      ],
      "c16": [
        "雨の中を散歩しようか？",
        "ふたり用の傘を持っています",
        "家でお茶をいれます"
      ],
      "c17": [
        "わたしたち、似てる？",
        "ふたりでひとつのよう",
        "ぴったり補い合っています"
      ],
      "c18": [
        "わたしの料理、好き？",
        "おかわりしたいそうです",
        "いっしょに作るのが大好き"
      ],
      "c19": [
        "いっしょにペットを飼おうか？",
        "もう名前を考えています",
        "今はぬいぐるみのくまで十分"
      ],
      "c20": [
        "わたしの好きなもの、知ってる？",
        "ぜんぶ覚えています",
        "もっと知りたいと思っています"
      ],
      "c21": [
        "いっしょに踊る？",
        "もう手を差し出しています",
        "拍手で応援します"
      ],
      "c22": [
        "わたし、あなたの刺激になってる？",
        "毎日、心を動かされています",
        "そばにいるとただ温かい"
      ],
      "c23": [
        "ふたりの写真、とってある？",
        "一枚一枚大切にしています",
        "もっとすてきな新しい写真を待っています"
      ],
      "c24": [
        "いっしょに日の出を見ようか？",
        "目覚ましをセット中",
        "夕日のほうがいいそうです"
      ],
      "c25": [
        "ひみつを教えてくれる？",
        "耳もとでささやきます",
        "ひみつのままにしておきます"
      ],
      "c26": [
        "わたしを信じてる？",
        "心から信じています",
        "毎日あなたを応援しています"
      ],
      "c27": [
        "ふたりきりで旅に出ようか？",
        "それが夢です",
        "大切な人みんなを連れて行きます"
      ],
      "c28": [
        "わたしの電話、待ってる？",
        "笑顔で待っています",
        "会いに来てほしいそうです"
      ],
      "c29": [
        "わたしのハグ、好き？",
        "世界でいちばん温かい",
        "手をつなぐのが好き"
      ],
      "c30": [
        "お互いに本を読み聞かせしようか？",
        "もう本を選んでいます",
        "あなたの声を聞いていたい"
      ],
      "c31": [
        "今日いっしょに写真を撮ろうか？",
        "すてきな背景を探しています",
        "まずはおしゃべり"
      ],
      "c32": [
        "わたし、あなたを元気にしてる？",
        "いつも元気をもらっています",
        "あなたといると悲しみも軽くなります"
      ],
      "c33": [
        "明日いっしょに朝ごはんを食べよう？",
        "もうココアを作っています",
        "ゆっくり寝ていたい"
      ],
      "c34": [
        "わたしの誕生日、覚えてる？",
        "言われなくても覚えています",
        "こっそりサプライズを準備中"
      ],
      "c35": [
        "スケートに行こうか？",
        "スケート靴を出しています",
        "リンクのそばで応援します"
      ],
      "c36": [
        "今日はいい日？",
        "最高の一日",
        "あなたがいればもっとよくなります"
      ],
      "c37": [
        "わたしの似顔絵を描いてくれる？",
        "もう鉛筆を持っています",
        "小さなハートを描きます"
      ],
      "c38": [
        "いっしょに木を植えようか？",
        "場所を選んでいます",
        "まずは窓辺の花から"
      ],
      "c39": [
        "ほめ言葉を聞きたい？",
        "楽しみにしています",
        "照れくさいけど、聞きたい"
      ],
      "c40": [
        "あとでもう一回遊ぶ？",
        "もう一回やりたい",
        "ゲームよりハグしたい"
      ]
    },
    "loves": {
      "s01": [
        "休みはどこで過ごす？",
        "ビーチ",
        "山",
        "旅",
        "ひとりの時間"
      ],
      "s02": [
        "理想の夜は？",
        "おうち映画",
        "お散歩",
        "レストラン",
        "ボードゲーム"
      ],
      "s03": [
        "好きな天気は？",
        "晴れ",
        "雨",
        "雪",
        "星空の夜"
      ],
      "s04": [
        "好きな動物は？",
        "子ねこ",
        "子いぬ",
        "馬",
        "イルカ"
      ],
      "s05": [
        "夕ごはんは？",
        "ピザ",
        "お寿司",
        "スイーツ",
        "バーベキュー"
      ],
      "s06": [
        "好きな飲み物は？",
        "コーヒー",
        "紅茶",
        "ココア",
        "レモネード"
      ],
      "s07": [
        "好きな季節は？",
        "春",
        "夏",
        "秋",
        "冬"
      ],
      "s08": [
        "好きな花は？",
        "バラ",
        "チューリップ",
        "ひまわり",
        "ラベンダー"
      ],
      "s09": [
        "どうやってくつろぐ？",
        "読書",
        "お絵かき",
        "サイクリング",
        "ハンモックでお昼寝"
      ],
      "s10": [
        "どうやって旅する？",
        "電車",
        "飛行機",
        "車",
        "船"
      ],
      "s11": [
        "夢の家は？",
        "街のマンション",
        "海辺の家",
        "山の小屋",
        "牧場"
      ],
      "s12": [
        "甘いものなら？",
        "アイス",
        "チョコレート",
        "ケーキ",
        "フルーツ"
      ],
      "s13": [
        "理想の朝は？",
        "ベッドで朝ごはん",
        "ジョギング",
        "朝寝坊",
        "ベランダでコーヒー"
      ],
      "s14": [
        "夢のデートは？",
        "ピクニック",
        "スケートリンク",
        "遊園地",
        "屋上で星空"
      ],
      "s15": [
        "いちばんうれしい贈り物は？",
        "花束",
        "手紙",
        "旅行",
        "プレゼントの箱"
      ],
      "s16": [
        "好きな自然は？",
        "海",
        "森",
        "砂漠",
        "オーロラ"
      ]
    },
    "who": [
      "よく遅刻するのはどっち？",
      "先に仲直りするのはどっち？",
      "料理が上手なのはどっち？",
      "よく笑うのはどっち？",
      "支度に時間がかかるのはどっち？",
      "よく鍵をなくすのはどっち？",
      "大切な日付をよく覚えているのはどっち？",
      "甘いものが好きなのはどっち？",
      "先に寝てしまうのはどっち？",
      "朝早く起きるのはどっち？",
      "「会いたい」とよく言うのはどっち？",
      "プレゼント選びが上手なのはどっち？",
      "よく冗談を言うのはどっち？",
      "運転が上手なのはどっち？",
      "電話が長いのはどっち？",
      "旅行がより好きなのはどっち？",
      "傷つきやすいのはどっち？",
      "すぐに許すのはどっち？",
      "写真をよく撮るのはどっち？",
      "お金の管理が上手なのはどっち？",
      "いらない物をよく買ってしまうのはどっち？",
      "慰めるのが上手なのはどっち？",
      "大変なときに落ち着いているのはどっち？",
      "いつもスマホを探しているのはどっち？",
      "お客さんを招くのが好きなのはどっち？",
      "朝ごはんをよく作るのはどっち？",
      "知らない街で道がわかるのはどっち？",
      "長いメッセージを書くのはどっち？",
      "先に散歩に誘うのはどっち？",
      "動物がより好きなのはどっち？",
      "秘密を守るのが上手なのはどっち？",
      "メニュー選びに時間がかかるのはどっち？",
      "大切な人のことをより心配するのはどっち？",
      "サプライズをよくするのはどっち？",
      "きれい好きなのはどっち？",
      "新しい髪型に先に気づくのはどっち？",
      "面白い話をよく思い出すのはどっち？",
      "我慢強いのはどっち？",
      "「ありがとう」をよく言うのはどっち？",
      "先に手を貸すのはどっち？"
    ],
    "phrases": [
      "私が笑顔になるのは、あなたが…",
      "あなたと過ごしたいちばん好きな日は…",
      "ありがとうと伝えたいのは…",
      "悲しいとき、私を助けてくれるのは…",
      "いつかふたりで一緒に…",
      "ふたりのいちばんあたたかい思い出は…",
      "あなたが誰よりも上手なのは…",
      "私が安心できるのは…",
      "丸一日自由な日があったら、ふたりで…",
      "あなたを誇りに思うのは…",
      "ふたりの理想の夜は…",
      "ずっと忘れないのは、あなたが…",
      "あなたに言われてうれしい言葉は…",
      "来年、ふたりで…",
      "私にとってあなたは、まるで…",
      "あなたからのいちばんのプレゼントは…",
      "あなたに会いたくなるのは…",
      "ふたりがいちばん面白いのは…",
      "ずっと伝えたかったことは…",
      "ふたりの場所は…",
      "あなたのことを考えると、私は…",
      "あなたが私の一日を明るくしてくれるのは…",
      "ふたりの好きな習慣は…",
      "ふたりへの願い：…",
      "ふたりに起きたいちばん面白いことは…",
      "あなたの思いやりを感じるのは、あなたが…",
      "あなたと迎える朝は…",
      "ふたりをひと言で表すと…",
      "あなたから学びたいことは…",
      "いつもありがとう。あなたはいつも…"
    ]
  },
  "ko": {
    "text": {
      "homeLink": "둘이 하는 게임",
      "eyebrow": "GLOWLETTER · 둘이 하는 게임",
      "title": "함께 놀아요",
      "close": "닫기",
      "lead": "소중한 사람에게 게임을 보내 보세요. 링크로 하는 게임은 무료이고 계정이 필요 없어요.",
      "quizTitle": "나를 얼마나 잘 알아?",
      "quizNote": "나에 대한 질문에 답하고, 가까운 사람이 맞혀 보게 하세요. 결과는 나에게 와요.",
      "create": "퀴즈 만들기",
      "soon": "곧 출시",
      "soonTitle": "다음 게임을 준비 중이에요",
      "duel": "누가 더 빠를까 대결",
      "loves": "우리가 좋아하는 것",
      "cards": "둘이 하는 기억력 카드",
      "who": "우리 중 누구?",
      "phrase": "문장 완성하기",
      "myQuizzes": "내 퀴즈",
      "noQuizzes": "아직 퀴즈가 없어요. 첫 퀴즈는 몇 분이면 만들 수 있어요.",
      "forWhom": "{name}에게",
      "noRecipient": "퀴즈",
      "resultsCount": "결과 {count}개",
      "newResults": "새 결과 {count}",
      "noResults": "아직 아무도 참여하지 않았어요.",
      "anonymous": "이름 없음",
      "results": "결과",
      "copyLink": "링크 복사",
      "share": "보내기",
      "deleteQuiz": "퀴즈 삭제",
      "deleteConfirm": "이 퀴즈와 결과를 삭제할까요? 링크가 더 이상 작동하지 않아요.",
      "deleted": "퀴즈를 삭제했어요",
      "linkCopied": "링크를 복사했어요",
      "back": "뒤로",
      "next": "다음",
      "stepNames": "1/2단계 · 이름",
      "yourName": "내 이름",
      "yourNamePlaceholder": "이름이 무엇인가요",
      "recipient": "받는 사람 · 선택",
      "recipientPlaceholder": "소중한 사람의 이름",
      "nameRequired": "이름을 입력하세요.",
      "forbiddenName": "일반적인 이름을 입력하세요.",
      "stepAnswers": "2/2단계 · 나의 답",
      "answersLead": "나에게 맞는 것을 고르세요. 질문은 언제든 바꿀 수 있어요.",
      "swap": "다른 질문",
      "progress": "{total}개 중 {done}개 답함",
      "answerAll": "모든 질문에 답을 고르세요.",
      "finish": "링크 받기",
      "creating": "퀴즈를 만드는 중…",
      "createdTitle": "퀴즈가 준비됐어요!",
      "createdLead": "링크를 보내세요. 상대가 답하면 '내 퀴즈'에 결과가 나타나요.",
      "shareText": "{name} 님이 '나를 얼마나 잘 알아?' 게임에 초대했어요",
      "signInTitle": "로그인이 필요해요",
      "signInNote": "결과가 나에게 오도록 퀴즈는 내 계정에 저장돼요.",
      "signIn": "로그인",
      "premiumNote": "게임 만들기는 전체 이용권에 포함돼요. 링크로 하는 게임은 누구나 무료예요.",
      "failed": "실패했어요. 연결을 확인하고 다시 시도하세요.",
      "rateLimited": "시도가 너무 많아요. 나중에 다시 시도하세요.",
      "playEyebrow": "둘이 하는 게임",
      "playInvite": "{name} 님이 게임에 초대했어요",
      "playLead": "질문 {count}개. 답을 맞혀 보세요. 마지막에 몇 개가 일치했는지 볼 수 있어요.",
      "playName": "내 이름 · 선택",
      "playNamePlaceholder": "나라는 걸 알 수 있게",
      "start": "시작",
      "playLoading": "게임을 불러오는 중…",
      "playMissing": "이 게임을 이용할 수 없어요. 링크가 삭제되었거나 만료되었어요.",
      "playOffline": "게임을 하려면 인터넷 연결이 필요해요.",
      "retry": "다시 시도",
      "questionOf": "{total}개 중 {n}번째 질문",
      "asks": "{name} 님의 질문",
      "counting": "일치하는 답을 세는 중…",
      "scoreOf": "{total}개 중 {score}개",
      "tierAll": "완벽해요! 누구보다 서로를 잘 알아요",
      "tierHigh": "서로를 정말 잘 알고 있어요",
      "tierMid": "나쁘지 않아요! 아직 알아갈 게 있어요",
      "tierLow": "앞으로 즐거운 발견이 많을 거예요",
      "sentTo": "{name} 님이 결과를 보게 돼요",
      "review": "나의 답",
      "rightAnswer": "정답",
      "makeOwn": "내 퀴즈 만들기",
      "home": "홈",
      "resultToast": "{name}: '나를 얼마나 잘 알아?'에서 {total}개 중 {score}개",
      "ownerAnswers": "만든 사람의 답",
      "playerAnswers": "{name} 님의 답",
      "paywallTitle": "게임, 즐거움<br><em>그리고 편지</em>",
      "groupGames": "게임",
      "groupFun": "즐거움",
      "groupLetters": "편지",
      "featQuiz": "'나를 얼마나 잘 알아?' — 결과가 나에게 와요",
      "featGamesSoon": "누가 더 빠를까 대결, '우리가 좋아하는 것', 곰돌이 기억력 카드",
      "featFunSoon": "'우리 중 누구?'와 커플 노트가 있는 '문장 완성하기'",
      "featCollection": "25개 언어로 된 편지와 시 전체 컬렉션",
      "featMoments": "기념일, 알림, 원하는 날에 열리는 QR 편지",
      "featAudio": "편지 속 나의 오디오와 받는 사람의 답장",
      "ynTitle": "예스 노",
      "ynNote": "둘이 하는 실시간 게임: 카드마다 5초. 제때 답하면 상대의 답을 볼 수 있어요.",
      "ynCreate": "방 만들기",
      "ynWaiting": "{name} 님이 링크를 열기를 기다리는 중…",
      "ynWaitingAny": "상대를 기다리는 중…",
      "ynShareText": "{name} 님이 실시간 게임 '예스 노'에 초대했어요",
      "ynPartnerHere": "{name} 님이 들어왔어요!",
      "ynStart": "게임 시작",
      "ynWaitHost": "{name} 님이 곧 게임을 시작해요",
      "ynYes": "예스",
      "ynNo": "노",
      "ynMissed": "시간 초과 — 이 카드는 닫혀 있어요",
      "ynMatch": "같은 답!",
      "ynRound": "{total}장 중 {n}번째 카드",
      "ynAnswered": "답을 보냈어요. 상대를 기다리는 중…",
      "ynFinal": "{total}장 중 {score}장 일치",
      "ynFinalHigh": "말하지 않아도 통하는 사이",
      "ynFinalMid": "다르지만 그래서 더 가까운 사이",
      "ynAgain": "다시 하기",
      "ynLeft": "상대의 연결이 끊겼어요. 돌아오기를 기다리는 중…",
      "ynYou": "나",
      "ynOffline": "게임에 연결할 수 없어요. 인터넷을 확인하고 링크를 다시 열어 주세요.",
      "ynJoin": "게임 참여",
      "ynJoinLead": "{name} 님이 기다리고 있어요. 답은 5초 안에!",
      "ynStepNames": "내 이름과 상대 이름",
      "ynRoomReady": "방이 준비됐어요 — 링크를 보내세요",
      "ynStayHere": "이 화면을 닫지 마세요. 링크가 열리면 게임이 시작돼요.",
      "featYesNo": "실시간 게임 '예스 노' — 답은 5초",
      "ynPartnerMissed": "답 없음 — 시간 초과",
      "lvTitle": "우리가 좋아하는 것",
      "lvNote": "둘이 하는 실시간 게임: 그림 4장 중 가장 좋아하는 것을 10초 안에 골라요. 같은 걸 골라도 돼요!",
      "lvShareText": "{name} 님이 실시간 게임 '우리가 좋아하는 것'에 초대했어요",
      "lvJoinLead": "{name} 님이 기다리고 있어요. 가장 좋아하는 그림을 골라요!",
      "lvRound": "{total}개 주제 중 {n}번째",
      "lvPick": "가장 좋아하는 것을 골라요",
      "lvBoth": "둘 다 고른 것: {item}",
      "lvCommon": "둘 다 좋아하는 것",
      "lvDiff": "취향이 달라서 더 재미있어요!",
      "lvFinalHigh": "공통점이 정말 많아요!",
      "lvFinalMid": "다르지만 서로를 채워 주는 사이",
      "featLoves": "실시간 게임 '우리가 좋아하는 것' — 그림 4장, 함께 고르기",
      "featGamesSoon2": "누가 더 빠를까 대결과 곰돌이 기억력 카드",
      "mcTitle": "곰돌이 기억력 카드",
      "mcNote": "둘이 하는 실시간 기억력 게임: 번갈아 카드 두 장을 뒤집어 짝을 찾아요. 8장부터 16장까지 세 단계.",
      "mcShareText": "{name} 님이 실시간 게임 '곰돌이 기억력 카드'에 초대했어요",
      "mcJoinLead": "{name} 님이 기다리고 있어요. 번갈아 짝을 찾아요!",
      "mcLevel": "{total}단계 중 {n}단계",
      "mcTurnYou": "내 차례 — 카드 두 장을 뒤집어요",
      "mcTurnThem": "{name} 님 차례",
      "mcPairs": "찾은 짝: {found}/{total}",
      "mcLevelDone": "모든 짝을 찾았어요!",
      "mcTimeUp": "이번 단계 시간이 끝났어요",
      "mcNext": "다음: {n}단계",
      "mcFinal": "찾은 짝: {found}/{total}",
      "mcFinalHigh": "환상의 팀!",
      "mcFinalMid": "좋은 게임! 한 번 더?",
      "featCards": "실시간 게임 '곰돌이 기억력 카드' — 함께 짝 찾기",
      "featGamesSoon3": "누가 더 빠를까 대결",
      "duTitle": "누가 더 빠를까",
      "duNote": "실시간 대결: 단어 하나와 그림 네 장. 맞는 그림을 먼저 눌러요 — 잘못 누르면 그 라운드는 져요.",
      "duShareText": "{name} 님이 실시간 대결 “누가 더 빠를까”에 도전장을 보냈어요",
      "duJoinLead": "{name} 님이 기다리고 있어요. 맞는 그림을 더 빨리 찾아봐요!",
      "duRound": "라운드 {n}/{total}",
      "duFind": "찾기: {item}",
      "duYouWon": "내가 더 빨랐어요!",
      "duTheyWon": "{name} 님이 더 빨랐어요",
      "duWrong": "다른 그림이에요 — 이번 라운드는 졌어요",
      "duNobody": "아무도 제시간에 못 찾았어요",
      "duScore": "나 {you} : {them} {name}",
      "duFinalWin": "승리! 오늘 눈썰미가 대단해요.",
      "duFinalLose": "이번엔 {name} 님의 승리 — 한 판 더 할까요?",
      "duFinalDraw": "무승부 — 완벽한 호흡이에요!",
      "duSeconds": "{s}초",
      "featDuel": "실시간 대결 “누가 더 빠를까” — 그림을 먼저 찾아요",
      "whoTitle": "우리 중 누구?",
      "whoNote": "둘이 하는 실시간 게임: 질문 하나에 “나” 또는 상대의 이름을 눌러요. 서로에 대한 생각이 같은지 확인해 봐요.",
      "whoShareText": "{name} 님이 실시간 게임 “우리 중 누구?”에 초대했어요",
      "whoJoinLead": "{name} 님이 기다리고 있어요. 솔직하게 답하고 비교해 봐요!",
      "whoRound": "질문 {n}/{total}",
      "whoMe": "나",
      "whoAgree": "같은 생각이에요: {name}",
      "whoDiffer": "생각이 달라요 — 이야기해 봐요!",
      "whoFinal": "{total}번 중 {score}번 생각이 같았어요",
      "whoFinalHigh": "서로를 정말 잘 알고 있네요!",
      "whoFinalMid": "나눌 이야기가 많아요 — 그것도 멋져요",
      "featWho": "실시간 게임 “우리 중 누구?” — 생각이 같은지 확인해요",
      "phTitle": "문장 완성하기",
      "phNote": "둘이 하는 실시간 게임: 같은 따뜻한 문장을 각자 자기 말로 완성하고, 서로의 답을 읽어요.",
      "phShareText": "{name} 님이 실시간 게임 “문장 완성하기”에 초대했어요",
      "phJoinLead": "{name} 님이 기다리고 있어요. 문장을 자기 말로 완성해 봐요!",
      "phRound": "문장 {n}/{total}",
      "phPlaceholder": "이어서 써 보세요…",
      "phDone": "완료",
      "phWaiting": "{name} 님을 기다리는 중…",
      "phSkipped": "답 없음",
      "phSave": "커플 북에 저장",
      "phSaved": "커플 북에 저장했어요",
      "phForbidden": "링크나 거친 말 없이 써 주세요.",
      "phNext": "다음 문장",
      "phFinal": "함께 완성한 문장: {count}",
      "phFinalLead": "마음에 드는 답을 커플 북에 저장해요.",
      "featPhrase": "실시간 게임 “문장 완성하기”와 커플 북",
      "bookTitle": "커플 북",
      "bookNote": "“문장 완성하기”의 가장 따뜻한 답을 계정에 보관해요.",
      "bookOpen": "책 열기",
      "bookEmpty": "아직 책이 비어 있어요. “문장 완성하기”를 하고 마음에 드는 답을 저장해 봐요.",
      "bookDelete": "삭제",
      "bookDeleteConfirm": "이 페이지를 책에서 삭제할까요?",
      "bookYou": "나",
      "inviteTitle": "친구 초대",
      "inviteNote": "친구에게 게임 메시지가 전송돼요.",
      "invite": "초대",
      "invited": "초대함",
      "inviteNone": "“친구” 메뉴에서 친구를 추가하면 한 번에 초대할 수 있어요.",
      "inviteSent": "{name} 님에게 초대를 보냈어요"
    },
    "questions": {
      "q01": [
        "내가 좋아하는 계절은?",
        "봄",
        "여름",
        "가을",
        "겨울"
      ],
      "q02": [
        "아침으로 고를 것은?",
        "커피와 크루아상",
        "죽이나 오트밀",
        "달걀 요리",
        "차만"
      ],
      "q03": [
        "나의 완벽한 휴일은?",
        "집에서 담요 덮고",
        "공원 산책",
        "교외 나들이",
        "친구들과 함께"
      ],
      "q04": [
        "가 보고 싶은 곳은?",
        "바다",
        "산",
        "대도시",
        "시골의 아늑한 집"
      ],
      "q05": [
        "좋아하는 아이스크림 맛은?",
        "바닐라",
        "초콜릿",
        "딸기",
        "피스타치오"
      ],
      "q06": [
        "나를 가장 빨리 기분 좋게 하는 것은?",
        "포옹",
        "깜짝 선물",
        "다정한 말",
        "맛있는 음식"
      ],
      "q07": [
        "나는 어느 쪽이냐면…",
        "아침형",
        "저녁형",
        "잘 수 있을 때 자는 편",
        "낮잠을 사랑하는 편"
      ],
      "q08": [
        "오늘 밤 고를 영화는?",
        "코미디",
        "로맨스",
        "추리물",
        "애니메이션"
      ],
      "q09": [
        "좋아하는 색은?",
        "빨강",
        "파랑",
        "초록",
        "분홍"
      ],
      "q10": [
        "가장 무서워하는 것은?",
        "거미",
        "높은 곳",
        "어둠",
        "지각"
      ],
      "q11": [
        "좋아하는 꽃은?",
        "장미",
        "튤립",
        "작약",
        "데이지"
      ],
      "q12": [
        "슬플 때 나는?",
        "가까운 사람에게 전화해요",
        "단것을 먹어요",
        "산책을 나가요",
        "잠을 자요"
      ],
      "q13": [
        "나와 가장 닮은 동물은?",
        "아기 고양이",
        "강아지",
        "아기 곰",
        "아기 여우"
      ],
      "q14": [
        "나에게 최고의 선물은?",
        "손으로 만든 것",
        "여행",
        "액세서리",
        "책"
      ],
      "q15": [
        "좋아하는 음료는?",
        "홍차",
        "녹차",
        "커피",
        "코코아"
      ],
      "q16": [
        "좋아하는 간식은?",
        "초콜릿",
        "감자칩",
        "과일",
        "케이크"
      ],
      "q17": [
        "여행에서 고르는 것은?",
        "박물관",
        "해변",
        "현지 음식",
        "계획 없이 걷기"
      ],
      "q18": [
        "저녁을 보내는 방법은?",
        "책과 함께",
        "드라마와 함께",
        "수다 떨며",
        "산책하며"
      ],
      "q19": [
        "좋아하는 날씨는?",
        "맑은 날",
        "따뜻한 비",
        "눈 오는 날",
        "산들바람"
      ],
      "q20": [
        "나에게 어울리는 초능력은?",
        "하늘을 나는 것",
        "마음을 읽는 것",
        "시간을 멈추는 것",
        "순간 이동"
      ],
      "q21": [
        "소중한 사람에게서 가장 중요한 것은?",
        "믿음",
        "배려",
        "유머",
        "응원"
      ],
      "q22": [
        "가장 기다리는 날은?",
        "새해",
        "내 생일",
        "여름휴가",
        "밸런타인데이"
      ],
      "q23": [
        "'사랑해'를 가장 자주 표현하는 방법은?",
        "말로",
        "행동으로",
        "포옹으로",
        "선물로"
      ],
      "q24": [
        "카페에서 주문할 것은?",
        "파스타",
        "초밥",
        "샐러드",
        "디저트"
      ],
      "q25": [
        "내가 좋아하는 하루 중 시간은?",
        "아침",
        "낮",
        "저녁",
        "밤"
      ],
      "q26": [
        "내가 고를 요리는?",
        "이탈리아 요리",
        "일식",
        "집밥",
        "멕시코 요리"
      ],
      "q27": [
        "생각이 가장 잘 되는 곳은?",
        "샤워할 때",
        "산책할 때",
        "이동할 때",
        "잠들기 전"
      ],
      "q28": [
        "아침에 가장 먼저 하는 일은?",
        "휴대폰 보기",
        "물 마시기",
        "커피 내리기",
        "조금 더 뒹굴기"
      ],
      "q29": [
        "좋아하는 과일은?",
        "사과",
        "바나나",
        "망고",
        "수박"
      ],
      "q30": [
        "나에게 어울리는 취미는?",
        "그림 그리기",
        "요리",
        "운동",
        "독서"
      ],
      "q31": [
        "생일은 어떻게 보내고 싶어?",
        "신나는 파티",
        "둘만의 저녁",
        "여행",
        "집에서 조용한 저녁"
      ],
      "q32": [
        "깜짝 이벤트에 대한 생각은?",
        "정말 좋아",
        "조금 떨려",
        "남에게 해 주는 게 좋아",
        "미리 아는 게 좋아"
      ],
      "q33": [
        "좋아하는 디저트는?",
        "케이크",
        "아이스크림",
        "쿠키",
        "사탕"
      ],
      "q34": [
        "무인도에 가져갈 것은?",
        "책",
        "휴대폰",
        "담요",
        "카메라"
      ],
      "q35": [
        "힘든 하루 뒤에 쉬는 방법은?",
        "따뜻한 목욕",
        "드라마",
        "산책",
        "가까운 사람과 대화"
      ],
      "q36": [
        "좋아하는 교통수단은?",
        "기차",
        "비행기",
        "자동차",
        "자전거"
      ],
      "q37": [
        "어릴 때 좋아한 놀이는?",
        "숨바꼭질",
        "술래잡기",
        "블록 놀이",
        "그림 그리기"
      ],
      "q38": [
        "나와 닮은 동화는?",
        "신데렐라",
        "어린 왕자",
        "곰돌이 푸",
        "이상한 나라의 앨리스"
      ],
      "q39": [
        "소중한 사람을 기쁘게 한다면?",
        "깜짝 선물",
        "카드",
        "여행",
        "저녁 식사"
      ],
      "q40": [
        "가장 자주 찍는 사진은?",
        "셀카",
        "자연",
        "음식",
        "거의 안 찍어"
      ],
      "q41": [
        "집에서 가장 좋아하는 곳은?",
        "침대",
        "부엌",
        "소파",
        "베란다"
      ],
      "q42": [
        "사람을 보면 가장 먼저 보는 것은?",
        "미소",
        "눈",
        "목소리",
        "유머 감각"
      ],
      "q43": [
        "나를 가장 빨리 웃게 하는 것은?",
        "웃긴 영상",
        "가까운 사람의 농담",
        "어색한 상황",
        "동물"
      ],
      "q44": [
        "더운 여름날 마시는 것은?",
        "레모네이드",
        "아이스티",
        "주스",
        "얼음물"
      ],
      "q45": [
        "나와 가장 닮은 원소는?",
        "물",
        "불",
        "흙",
        "바람"
      ],
      "q46": [
        "좋아하는 이야기는?",
        "모험",
        "사랑 이야기",
        "SF",
        "실화"
      ],
      "q47": [
        "비 오는 날은 어떻게 보내?",
        "책 읽기",
        "잠자기",
        "영화 보기",
        "우산 쓰고 산책"
      ],
      "q48": [
        "선물에서 가장 중요한 것은?",
        "마음",
        "쓸모",
        "예쁨",
        "놀라움"
      ],
      "q49": [
        "감자 요리라면?",
        "으깬 감자",
        "감자튀김",
        "구운 감자",
        "감자칩"
      ],
      "q50": [
        "새로운 도시에서 먼저 가는 곳은?",
        "카페",
        "박물관",
        "공원",
        "쇼핑"
      ],
      "q51": [
        "잠이 안 올 때는?",
        "책 읽기",
        "휴대폰 보기",
        "양 세기",
        "따뜻한 우유 마시기"
      ],
      "q52": [
        "중요한 날을 준비하는 방법은?",
        "미리 다 계획해",
        "마지막 순간에 해",
        "도움을 청해",
        "긴장해서 잠을 못 자"
      ],
      "q53": [
        "보는 걸 좋아하는 스포츠는?",
        "축구",
        "테니스",
        "피겨스케이팅",
        "스포츠는 안 봐"
      ],
      "q54": [
        "나에게 어울리는 반려동물은?",
        "고양이",
        "강아지",
        "앵무새",
        "햄스터"
      ],
      "q55": [
        "어떤 메시지를 보내?",
        "긴 메시지",
        "짧은 메시지",
        "이모티콘 가득",
        "음성 메시지"
      ],
      "q56": [
        "가장 오래 간직한 선물은?",
        "편지",
        "장난감",
        "사진",
        "액세서리"
      ],
      "q57": [
        "고른다면?",
        "벽난로 옆 차 한 잔",
        "잔디밭 소풍",
        "바닷가 산책",
        "영화관"
      ],
      "q58": [
        "가장 기쁜 칭찬은?",
        "외모 칭찬",
        "똑똑함 칭찬",
        "다정함 칭찬",
        "유머 칭찬"
      ],
      "q59": [
        "나의 완벽한 아침은?",
        "침대에서 아침 식사",
        "이른 아침 달리기",
        "늦잠",
        "베란다에서 커피"
      ],
      "q60": [
        "배우고 싶은 것은?",
        "춤",
        "요리",
        "새로운 언어",
        "그림"
      ]
    },
    "yesNo": {
      "c01": [
        "지금 내가 보고 싶어?",
        "많이 보고 싶어 해요",
        "참고 있지만 당신을 생각해요"
      ],
      "c02": [
        "내 메시지를 보면 웃어?",
        "항상 웃어요",
        "속으로 미소 지어요"
      ],
      "c03": [
        "우리 첫 만남 기억해?",
        "매 순간을 기억해요",
        "가장 중요한 것, 당신을 기억해요"
      ],
      "c04": [
        "오늘 안아 줄까?",
        "당신의 포옹을 기다려요",
        "포옹은 나중을 위해 아껴요"
      ],
      "c05": [
        "같이 바다 갈까?",
        "벌써 짐을 싸고 있어요",
        "산을 꿈꾸고 있어요"
      ],
      "c06": [
        "내가 당신을 웃게 해?",
        "진심으로 웃어요",
        "미소를 숨기고 있어요"
      ],
      "c07": [
        "나랑 있으면 편해?",
        "당신 곁에서 편안해요",
        "당신과 있으면 즐거워요"
      ],
      "c08": [
        "낮에 내 생각 해?",
        "아주 자주 생각해요",
        "지금 바로 생각하고 있어요"
      ],
      "c09": [
        "내 깜짝 선물 좋아해?",
        "당신의 깜짝 선물을 정말 좋아해요",
        "곁에 있어 주는 게 제일 좋아요"
      ],
      "c10": [
        "같이 파이 구울까?",
        "벌써 앞치마를 둘렀어요",
        "케이크를 사는 게 좋대요"
      ],
      "c11": [
        "오늘 밤 같이 영화 볼까?",
        "벌써 영화를 고르고 있어요",
        "그냥 이야기하고 싶대요"
      ],
      "c12": [
        "내 목소리 좋아?",
        "끝없이 들을 수 있어요",
        "당신의 웃음소리를 더 좋아해요"
      ],
      "c13": [
        "주말에 소풍 갈까?",
        "돗자리를 챙기고 있어요",
        "아늑한 카페로 초대해요"
      ],
      "c14": [
        "내 편지 받고 싶어?",
        "당신의 편지를 기다려요",
        "직접 듣고 싶어 해요"
      ],
      "c15": [
        "내가 당신에게 소중해?",
        "정말 소중해요",
        "생각보다 훨씬 더요"
      ],
      "c16": [
        "빗속을 같이 걸을까?",
        "둘이 쓸 우산을 챙겨요",
        "집에서 차를 끓일래요"
      ],
      "c17": [
        "우리 닮았어?",
        "둘은 한 쌍 같아요",
        "서로를 완벽하게 채워 줘요"
      ],
      "c18": [
        "내 요리 좋아해?",
        "더 달라고 해요",
        "같이 요리하는 걸 좋아해요"
      ],
      "c19": [
        "같이 반려동물 키울까?",
        "벌써 이름을 고르고 있어요",
        "지금은 곰 인형으로 충분해요"
      ],
      "c20": [
        "내가 뭘 좋아하는지 알아?",
        "다 외우고 있어요",
        "더 알고 싶어 해요"
      ],
      "c21": [
        "같이 춤출까?",
        "벌써 손을 내밀고 있어요",
        "박수로 응원할게요"
      ],
      "c22": [
        "내가 당신에게 영감을 줘?",
        "매일 영감을 줘요",
        "곁에 있으면 그냥 따뜻해요"
      ],
      "c23": [
        "우리 사진 간직하고 있어?",
        "한 장 한 장 소중히 간직해요",
        "더 멋진 새 사진을 기다려요"
      ],
      "c24": [
        "같이 해돋이 볼까?",
        "알람을 맞추고 있어요",
        "노을이 더 좋대요"
      ],
      "c25": [
        "비밀 하나 말해 줄래?",
        "귓속말로 알려 줄 거예요",
        "비밀로 남겨 둘래요"
      ],
      "c26": [
        "나를 믿어?",
        "진심으로 믿어요",
        "매일 응원하고 있어요"
      ],
      "c27": [
        "둘이서만 여행 갈까?",
        "그게 꿈이에요",
        "소중한 사람들을 모두 데려가요"
      ],
      "c28": [
        "내 전화 기다려?",
        "웃으며 기다려요",
        "직접 와 주길 바라요"
      ],
      "c29": [
        "내 포옹 좋아해?",
        "세상에서 가장 따뜻해요",
        "손잡는 걸 좋아해요"
      ],
      "c30": [
        "서로 책 읽어 줄까?",
        "벌써 책을 고르고 있어요",
        "당신 목소리를 듣고 싶어요"
      ],
      "c31": [
        "오늘 같이 사진 찍을까?",
        "예쁜 배경을 찾고 있어요",
        "먼저 이야기부터"
      ],
      "c32": [
        "내가 기분을 좋게 해 줘?",
        "항상 그래요",
        "당신과 있으면 슬픔도 가벼워져요"
      ],
      "c33": [
        "내일 같이 아침 먹을까?",
        "벌써 코코아를 만들고 있어요",
        "늦잠을 자고 싶대요"
      ],
      "c34": [
        "내 생일 기억해?",
        "알려 주지 않아도 기억해요",
        "몰래 깜짝 이벤트를 준비 중이에요"
      ],
      "c35": [
        "스케이트 타러 갈까?",
        "스케이트를 꺼내고 있어요",
        "링크 옆에서 응원할게요"
      ],
      "c36": [
        "오늘 좋은 하루야?",
        "최고의 하루예요",
        "당신이 있으면 더 좋아져요"
      ],
      "c37": [
        "내 초상화 그려 줄래?",
        "벌써 연필을 들었어요",
        "작은 하트를 그려 줄게요"
      ],
      "c38": [
        "같이 나무 심을까?",
        "자리를 고르고 있어요",
        "창가의 꽃부터 시작할게요"
      ],
      "c39": [
        "칭찬 듣고 싶어?",
        "정말 기대돼요",
        "쑥스럽지만 듣고 싶어요"
      ],
      "c40": [
        "나중에 또 할까?",
        "한 판 더 하고 싶어요",
        "게임보다 포옹이 좋아요"
      ]
    },
    "loves": {
      "s01": [
        "휴가는 어디서?",
        "해변",
        "산",
        "여행",
        "혼자만의 시간"
      ],
      "s02": [
        "완벽한 저녁은?",
        "집에서 영화",
        "산책",
        "레스토랑",
        "보드게임"
      ],
      "s03": [
        "좋아하는 날씨는?",
        "맑음",
        "비",
        "눈",
        "별이 빛나는 밤"
      ],
      "s04": [
        "좋아하는 동물은?",
        "아기 고양이",
        "강아지",
        "말",
        "돌고래"
      ],
      "s05": [
        "저녁 메뉴는?",
        "피자",
        "초밥",
        "디저트",
        "바비큐"
      ],
      "s06": [
        "좋아하는 음료는?",
        "커피",
        "차",
        "코코아",
        "레모네이드"
      ],
      "s07": [
        "좋아하는 계절은?",
        "봄",
        "여름",
        "가을",
        "겨울"
      ],
      "s08": [
        "좋아하는 꽃은?",
        "장미",
        "튤립",
        "해바라기",
        "라벤더"
      ],
      "s09": [
        "어떻게 쉬어?",
        "책 읽기",
        "그림 그리기",
        "자전거",
        "해먹에서 낮잠"
      ],
      "s10": [
        "어떻게 여행해?",
        "기차",
        "비행기",
        "자동차",
        "배"
      ],
      "s11": [
        "꿈의 집은?",
        "도시 아파트",
        "바닷가 집",
        "산속 오두막",
        "농장"
      ],
      "s12": [
        "달콤한 건?",
        "아이스크림",
        "초콜릿",
        "케이크",
        "과일"
      ],
      "s13": [
        "완벽한 아침은?",
        "침대에서 아침",
        "달리기",
        "늦잠",
        "베란다에서 커피"
      ],
      "s14": [
        "꿈의 데이트는?",
        "소풍",
        "스케이트장",
        "놀이공원",
        "옥상에서 별 보기"
      ],
      "s15": [
        "최고의 선물은?",
        "꽃다발",
        "편지",
        "여행",
        "선물 상자"
      ],
      "s16": [
        "좋아하는 자연은?",
        "바다",
        "숲",
        "사막",
        "오로라"
      ]
    },
    "who": [
      "우리 중 누가 더 자주 늦을까요?",
      "우리 중 누가 먼저 화해할까요?",
      "우리 중 누가 요리를 더 잘할까요?",
      "우리 중 누가 더 자주 웃을까요?",
      "우리 중 누가 준비하는 데 더 오래 걸릴까요?",
      "우리 중 누가 열쇠를 더 자주 잃어버릴까요?",
      "우리 중 누가 중요한 날짜를 더 잘 기억할까요?",
      "우리 중 누가 단것을 더 좋아할까요?",
      "우리 중 누가 먼저 잠들까요?",
      "우리 중 누가 아침에 더 일찍 일어날까요?",
      "우리 중 누가 “보고 싶어”라는 말을 더 자주 할까요?",
      "우리 중 누가 선물을 더 잘 고를까요?",
      "우리 중 누가 농담을 더 자주 할까요?",
      "우리 중 누가 운전을 더 잘할까요?",
      "우리 중 누가 전화를 더 오래 할까요?",
      "우리 중 누가 여행을 더 좋아할까요?",
      "우리 중 누가 더 쉽게 서운해할까요?",
      "우리 중 누가 더 빨리 용서할까요?",
      "우리 중 누가 사진을 더 많이 찍을까요?",
      "우리 중 누가 돈 관리를 더 잘할까요?",
      "우리 중 누가 필요 없는 물건을 더 자주 살까요?",
      "우리 중 누가 위로를 더 잘할까요?",
      "우리 중 누가 힘든 순간에 더 침착할까요?",
      "우리 중 누가 늘 휴대폰을 찾고 있을까요?",
      "우리 중 누가 손님 초대를 더 좋아할까요?",
      "우리 중 누가 아침을 더 자주 차릴까요?",
      "우리 중 누가 낯선 도시에서 길을 더 잘 찾을까요?",
      "우리 중 누가 메시지를 더 길게 쓸까요?",
      "우리 중 누가 먼저 산책하자고 할까요?",
      "우리 중 누가 동물을 더 좋아할까요?",
      "우리 중 누가 비밀을 더 잘 지킬까요?",
      "우리 중 누가 메뉴를 고르는 데 더 오래 걸릴까요?",
      "우리 중 누가 가까운 사람들을 더 걱정할까요?",
      "우리 중 누가 서프라이즈를 더 자주 준비할까요?",
      "우리 중 누가 더 깔끔할까요?",
      "우리 중 누가 새 헤어스타일을 먼저 알아챌까요?",
      "우리 중 누가 재미있는 이야기를 더 자주 떠올릴까요?",
      "우리 중 누가 더 참을성이 많을까요?",
      "우리 중 누가 “고마워”라는 말을 더 자주 할까요?",
      "우리 중 누가 먼저 도와주겠다고 할까요?"
    ],
    "phrases": [
      "내가 미소 짓게 되는 건 네가…",
      "너와 함께한 날 중 가장 좋아하는 날은…",
      "네게 고마운 건…",
      "슬플 때 나에게 힘이 되는 건…",
      "언젠가 우리 함께…",
      "우리의 가장 따뜻한 추억은…",
      "네가 누구보다 잘하는 건…",
      "내 마음이 편안해질 때는…",
      "하루 종일 자유로운 날이 있다면 우리는…",
      "네가 자랑스러운 이유는…",
      "우리의 완벽한 저녁은…",
      "절대 잊지 못할 건 네가…",
      "네가 해 주면 좋은 말은…",
      "내년에는 우리가…",
      "나에게 너는 마치…",
      "너에게 받은 최고의 선물은…",
      "네가 보고 싶어질 때는…",
      "우리가 제일 웃길 때는…",
      "오래전부터 너에게 하고 싶던 말은…",
      "우리의 장소는…",
      "너를 생각하면 나는…",
      "네가 내 하루를 더 좋게 만들 때는…",
      "내가 좋아하는 우리의 습관은…",
      "우리를 위한 내 소원: …",
      "우리에게 있었던 가장 웃긴 일은…",
      "네 마음 씀씀이를 느낄 때는 네가…",
      "너와 함께하는 아침은…",
      "우리를 한 단어로 표현하면…",
      "너에게 배우고 싶은 건…",
      "늘 고마워, 네가 언제나…"
    ]
  },
  "zh": {
    "text": {
      "homeLink": "兩人遊戲",
      "eyebrow": "GLOWLETTER · 兩人遊戲",
      "title": "一起玩吧",
      "close": "關閉",
      "lead": "把遊戲送給你珍惜的人。透過連結遊玩完全免費，也不需要帳號。",
      "quizTitle": "你有多了解我？",
      "quizNote": "回答關於自己的問題，讓親近的人來猜。結果會回到你這裡。",
      "create": "建立測驗",
      "soon": "即將推出",
      "soonTitle": "更多遊戲準備中",
      "duel": "「誰最快」對決",
      "loves": "我們喜歡的事",
      "cards": "兩人記憶卡",
      "who": "我們之中是誰？",
      "phrase": "完成這句話",
      "myQuizzes": "我的測驗",
      "noQuizzes": "還沒有測驗。建立第一個只需要幾分鐘。",
      "forWhom": "給 {name}",
      "noRecipient": "測驗",
      "resultsCount": "結果：{count}",
      "newResults": "新結果：{count}",
      "noResults": "還沒有人玩過。",
      "anonymous": "未署名",
      "results": "結果",
      "copyLink": "複製連結",
      "share": "傳送",
      "deleteQuiz": "刪除測驗",
      "deleteConfirm": "要刪除這個測驗和結果嗎？連結將無法再使用。",
      "deleted": "測驗已刪除",
      "linkCopied": "連結已複製",
      "back": "返回",
      "next": "下一步",
      "stepNames": "步驟 1/2 · 名字",
      "yourName": "你的名字",
      "yourNamePlaceholder": "你叫什麼名字",
      "recipient": "給誰 · 選填",
      "recipientPlaceholder": "對方的名字",
      "nameRequired": "請輸入你的名字。",
      "forbiddenName": "請輸入一般的名字。",
      "stepAnswers": "步驟 2/2 · 你的答案",
      "answersLead": "選出符合你的答案。每個問題都可以更換。",
      "swap": "換個問題",
      "progress": "已回答 {done}/{total}",
      "answerAll": "請為每個問題選擇答案。",
      "finish": "取得連結",
      "creating": "正在建立測驗…",
      "createdTitle": "測驗完成了！",
      "createdLead": "把連結傳出去。對方作答後，結果會出現在「我的測驗」。",
      "shareText": "{name} 邀請你玩「你有多了解我？」",
      "signInTitle": "需要登入",
      "signInNote": "測驗會存在你的帳號裡，結果才會傳給你。",
      "signIn": "登入",
      "premiumNote": "建立遊戲屬於完整版功能。透過連結遊玩對所有人都免費。",
      "failed": "沒有成功。請檢查網路後再試一次。",
      "rateLimited": "嘗試次數太多，請稍後再試。",
      "playEyebrow": "兩人遊戲",
      "playInvite": "{name} 邀請你來玩",
      "playLead": "共 {count} 題。猜猜答案，最後會看到有幾題相同。",
      "playName": "你的名字 · 選填",
      "playNamePlaceholder": "讓對方知道是你",
      "start": "開始",
      "playLoading": "正在載入遊戲…",
      "playMissing": "無法使用這個遊戲：連結已刪除或過期。",
      "playOffline": "遊戲需要網路連線。",
      "retry": "重試",
      "questionOf": "第 {n}/{total} 題",
      "asks": "{name} 想問",
      "counting": "正在計算相同的答案…",
      "scoreOf": "{score}/{total}",
      "tierAll": "太完美了！你們比誰都了解彼此",
      "tierHigh": "你們真的很了解彼此",
      "tierMid": "還不錯！還有很多可以認識的地方",
      "tierLow": "接下來還有許多美好的發現",
      "sentTo": "{name} 會看到你的結果",
      "review": "你的答案",
      "rightAnswer": "正確答案",
      "makeOwn": "建立我的測驗",
      "home": "首頁",
      "resultToast": "{name}：「你有多了解我？」答對 {score}/{total}",
      "ownerAnswers": "出題者的答案",
      "playerAnswers": "{name} 的答案",
      "paywallTitle": "遊戲、娛樂<br><em>與信件</em>",
      "groupGames": "遊戲",
      "groupFun": "娛樂",
      "groupLetters": "信件",
      "featQuiz": "「你有多了解我？」— 結果會回到你這裡",
      "featGamesSoon": "「誰最快」對決、「我們喜歡的事」、小熊記憶卡",
      "featFunSoon": "「我們之中是誰？」與附情侶手帳的「完成這句話」",
      "featCollection": "25 種語言的完整信件與詩作收藏",
      "featMoments": "紀念日、提醒，以及在指定日子開啟的 QR 信件",
      "featAudio": "在信中加入自己的音訊，以及收件人的回覆",
      "ynTitle": "是或否",
      "ynNote": "兩人即時遊戲：每張卡片 5 秒。準時回答，就能看到對方的答案。",
      "ynCreate": "建立房間",
      "ynWaiting": "等待 {name} 打開連結…",
      "ynWaitingAny": "等待對方加入…",
      "ynShareText": "{name} 邀請你玩即時遊戲「是或否」",
      "ynPartnerHere": "{name} 來了！",
      "ynStart": "開始遊戲",
      "ynWaitHost": "{name} 即將開始遊戲",
      "ynYes": "是",
      "ynNo": "否",
      "ynMissed": "太晚了 — 這張卡片維持關閉",
      "ynMatch": "答案一樣！",
      "ynRound": "第 {n}/{total} 張",
      "ynAnswered": "已送出答案，等待對方…",
      "ynFinal": "{total} 張中有 {score} 張相同",
      "ynFinalHigh": "你們心有靈犀",
      "ynFinalMid": "如此不同，卻又如此親近",
      "ynAgain": "再玩一次",
      "ynLeft": "對方已斷線，等待回來…",
      "ynYou": "你",
      "ynOffline": "無法連線到遊戲。請檢查網路並重新開啟連結。",
      "ynJoin": "加入遊戲",
      "ynJoinLead": "{name} 在等你。每題 5 秒！",
      "ynStepNames": "你和對方的名字",
      "ynRoomReady": "房間準備好了 — 傳送連結吧",
      "ynStayHere": "請保持這個畫面開啟：對方打開連結後遊戲就會開始。",
      "featYesNo": "即時遊戲「是或否」— 每題 5 秒",
      "ynPartnerMissed": "沒有回答 — 時間到了",
      "lvTitle": "我們喜歡的",
      "lvNote": "兩人即時遊戲：4 張圖片，10 秒內選出最喜歡的。可以選一樣的喔！",
      "lvShareText": "{name} 邀請你玩即時遊戲「我們喜歡的」",
      "lvJoinLead": "{name} 在等你。選出你最喜歡的圖片吧！",
      "lvRound": "第 {n}/{total} 個主題",
      "lvPick": "選出你最喜歡的",
      "lvBoth": "你們都選了：{item}",
      "lvCommon": "你們都喜歡",
      "lvDiff": "喜好不同，更有趣！",
      "lvFinalHigh": "你們有好多共同點！",
      "lvFinalMid": "如此不同，卻能互相補足",
      "featLoves": "即時遊戲「我們喜歡的」— 4 張圖片，一起選",
      "featGamesSoon2": "「誰最快」對決與小熊記憶卡",
      "mcTitle": "小熊記憶卡",
      "mcNote": "兩人即時記憶遊戲：輪流翻開兩張卡片，找出成對的圖案。共三關，從 8 張到 16 張。",
      "mcShareText": "{name} 邀請你玩即時遊戲「小熊記憶卡」",
      "mcJoinLead": "{name} 在等你。輪流找出成對的卡片吧！",
      "mcLevel": "第 {n}/{total} 關",
      "mcTurnYou": "輪到你了 — 翻開兩張卡片",
      "mcTurnThem": "輪到 {name}",
      "mcPairs": "已找到：{found}/{total} 對",
      "mcLevelDone": "全部配對完成！",
      "mcTimeUp": "本關時間到",
      "mcNext": "下一關：第 {n} 關",
      "mcFinal": "找到 {found}/{total} 對",
      "mcFinalHigh": "超棒的團隊！",
      "mcFinalMid": "玩得好！再來一局？",
      "featCards": "即時遊戲「小熊記憶卡」— 一起找配對",
      "featGamesSoon3": "「誰最快」對決",
      "duTitle": "誰比較快",
      "duNote": "即時對決：一個詞、四張圖片。先點到正確的圖片——點錯就輸掉這一回合。",
      "duShareText": "{name} 向你發起即時對決「誰比較快」",
      "duJoinLead": "{name} 在等你。快點找出正確的圖片！",
      "duRound": "第 {n} 回合，共 {total} 回合",
      "duFind": "找出：{item}",
      "duYouWon": "你比較快！",
      "duTheyWon": "{name} 比較快",
      "duWrong": "圖片選錯了——這一回合輸了",
      "duNobody": "沒有人及時找到",
      "duScore": "你 {you} : {them} {name}",
      "duFinalWin": "勝利！今天眼力真好。",
      "duFinalLose": "這次 {name} 贏了——再來一局？",
      "duFinalDraw": "平手——旗鼓相當！",
      "duSeconds": "{s} 秒",
      "featDuel": "即時對決「誰比較快」——搶先找到圖片",
      "whoTitle": "是你還是我？",
      "whoNote": "兩人即時遊戲：一個問題，點「我」或對方的名字。看看你們對彼此的看法是否一致。",
      "whoShareText": "{name} 邀請你玩即時遊戲「是你還是我？」",
      "whoJoinLead": "{name} 在等你。誠實作答，然後比對看看！",
      "whoRound": "第 {n} 題，共 {total} 題",
      "whoMe": "我",
      "whoAgree": "你們意見一致：{name}",
      "whoDiffer": "意見不同——聊一聊吧！",
      "whoFinal": "{total} 題中有 {score} 題一致",
      "whoFinalHigh": "你們真的很了解彼此！",
      "whoFinalMid": "有好多可以聊的——這也很美好",
      "featWho": "即時遊戲「是你還是我？」——看看意見是否一致",
      "phTitle": "把句子寫完",
      "phNote": "兩人即時遊戲：兩人各自用自己的話，接著寫完同一句溫暖的話，再讀讀對方的回答。",
      "phShareText": "{name} 邀請你玩即時遊戲「把句子寫完」",
      "phJoinLead": "{name} 在等你。用自己的話把每一句寫完吧！",
      "phRound": "第 {n} 句，共 {total} 句",
      "phPlaceholder": "你的接續…",
      "phDone": "完成",
      "phWaiting": "正在等 {name}…",
      "phSkipped": "未作答",
      "phSave": "儲存到「兩人之書」",
      "phSaved": "已儲存到「兩人之書」",
      "phForbidden": "請不要包含連結或粗魯的字詞。",
      "phNext": "下一句",
      "phFinal": "一起寫完的句子：{count}",
      "phFinalLead": "把最喜歡的回答儲存到「兩人之書」。",
      "featPhrase": "即時遊戲「把句子寫完」，附「兩人之書」",
      "bookTitle": "兩人之書",
      "bookNote": "來自「把句子寫完」最溫暖的回答，保存在你的帳號中。",
      "bookOpen": "打開書",
      "bookEmpty": "書裡還是空的。玩一局「把句子寫完」，儲存你喜歡的回答吧。",
      "bookDelete": "刪除",
      "bookDeleteConfirm": "要從書中刪除這一頁嗎？",
      "bookYou": "你",
      "inviteTitle": "邀請好友",
      "inviteNote": "好友會收到一則附有遊戲的訊息。",
      "invite": "邀請",
      "invited": "已邀請",
      "inviteNone": "在「好友」中新增好友，就能一鍵邀請。",
      "inviteSent": "已傳送邀請給 {name}"
    },
    "questions": {
      "q01": [
        "我最喜歡的季節？",
        "春天",
        "夏天",
        "秋天",
        "冬天"
      ],
      "q02": [
        "早餐我會選什麼？",
        "咖啡配可頌",
        "燕麥粥",
        "蛋料理",
        "只喝茶"
      ],
      "q03": [
        "我理想的休假日？",
        "在家裹著毯子",
        "到公園散步",
        "去郊外走走",
        "和朋友相聚"
      ],
      "q04": [
        "我夢想去哪裡？",
        "海邊",
        "山上",
        "大城市",
        "鄉間溫馨小屋"
      ],
      "q05": [
        "我最愛的冰淇淋口味？",
        "香草",
        "巧克力",
        "草莓",
        "開心果"
      ],
      "q06": [
        "什麼最快讓我開心？",
        "一個擁抱",
        "一個驚喜",
        "溫暖的話",
        "好吃的東西"
      ],
      "q07": [
        "我比較像…",
        "早起的人",
        "夜貓子",
        "有空就睡",
        "超愛午睡"
      ],
      "q08": [
        "今晚我會選哪種電影？",
        "喜劇",
        "浪漫故事",
        "推理片",
        "動畫"
      ],
      "q09": [
        "我最喜歡的顏色？",
        "紅色",
        "藍色",
        "綠色",
        "粉紅色"
      ],
      "q10": [
        "我最怕什麼？",
        "蜘蛛",
        "高處",
        "黑暗",
        "遲到"
      ],
      "q11": [
        "我喜歡哪種花？",
        "玫瑰",
        "鬱金香",
        "芍藥",
        "雛菊"
      ],
      "q12": [
        "難過時我會做什麼？",
        "打電話給親近的人",
        "吃點甜的",
        "出去走走",
        "去睡覺"
      ],
      "q13": [
        "哪種動物最像我？",
        "小貓",
        "小狗",
        "小熊",
        "小狐狸"
      ],
      "q14": [
        "對我來說最好的禮物？",
        "親手做的東西",
        "一趟旅行",
        "飾品",
        "一本書"
      ],
      "q15": [
        "我最愛的飲料？",
        "紅茶",
        "綠茶",
        "咖啡",
        "熱可可"
      ],
      "q16": [
        "我最愛的點心？",
        "巧克力",
        "洋芋片",
        "水果",
        "蛋糕"
      ],
      "q17": [
        "旅行時我會選什麼？",
        "博物館",
        "海灘",
        "在地美食",
        "隨意漫步"
      ],
      "q18": [
        "我喜歡怎麼度過晚上？",
        "看書",
        "追劇",
        "聊天",
        "散步"
      ],
      "q19": [
        "我最喜歡什麼天氣？",
        "晴天",
        "溫暖的雨",
        "下雪",
        "微風"
      ],
      "q20": [
        "哪種超能力最適合我？",
        "飛行",
        "讀心術",
        "讓時間停止",
        "瞬間移動"
      ],
      "q21": [
        "我最看重親近的人哪一點？",
        "信任",
        "體貼",
        "幽默感",
        "支持"
      ],
      "q22": [
        "我最期待哪個節日？",
        "新年",
        "我的生日",
        "暑假",
        "情人節"
      ],
      "q23": [
        "我最常怎麼表達「我愛你」？",
        "用說的",
        "用行動",
        "用擁抱",
        "用禮物"
      ],
      "q24": [
        "在咖啡館我會點什麼？",
        "義大利麵",
        "壽司",
        "沙拉",
        "甜點"
      ],
      "q25": [
        "我最喜歡一天中的哪個時段？",
        "早上",
        "下午",
        "傍晚",
        "晚上"
      ],
      "q26": [
        "我會選哪種料理？",
        "義式",
        "日式",
        "家常菜",
        "墨西哥菜"
      ],
      "q27": [
        "我在哪裡最能思考？",
        "洗澡時",
        "散步時",
        "通勤路上",
        "睡前"
      ],
      "q28": [
        "我早上第一件事是什麼？",
        "看手機",
        "喝水",
        "泡咖啡",
        "再賴床一下"
      ],
      "q29": [
        "我最喜歡的水果？",
        "蘋果",
        "香蕉",
        "芒果",
        "西瓜"
      ],
      "q30": [
        "哪個興趣最適合我？",
        "畫畫",
        "做菜",
        "運動",
        "閱讀"
      ],
      "q31": [
        "我想怎麼過生日？",
        "熱鬧的派對",
        "兩人晚餐",
        "一趟旅行",
        "在家安靜的夜晚"
      ],
      "q32": [
        "我對驚喜的看法？",
        "超愛",
        "有點緊張",
        "喜歡為別人準備",
        "寧願先知道"
      ],
      "q33": [
        "我比較喜歡哪種甜點？",
        "蛋糕",
        "冰淇淋",
        "餅乾",
        "糖果"
      ],
      "q34": [
        "去無人島我會帶什麼？",
        "一本書",
        "手機",
        "毯子",
        "相機"
      ],
      "q35": [
        "辛苦一天後我怎麼放鬆？",
        "泡個熱水澡",
        "追劇",
        "散步",
        "和親近的人聊天"
      ],
      "q36": [
        "我最喜歡哪種交通工具？",
        "火車",
        "飛機",
        "汽車",
        "腳踏車"
      ],
      "q37": [
        "我小時候最愛的遊戲？",
        "捉迷藏",
        "鬼抓人",
        "積木",
        "畫畫"
      ],
      "q38": [
        "哪個童話最像我？",
        "灰姑娘",
        "小王子",
        "小熊維尼",
        "愛麗絲夢遊仙境"
      ],
      "q39": [
        "我會怎麼讓親近的人開心？",
        "準備驚喜",
        "寫張卡片",
        "安排旅行",
        "請吃晚餐"
      ],
      "q40": [
        "我最常拍什麼？",
        "自拍",
        "風景",
        "美食",
        "幾乎不拍照"
      ],
      "q41": [
        "家裡我最喜歡的角落？",
        "床",
        "廚房",
        "沙發",
        "陽台"
      ],
      "q42": [
        "我對一個人最先注意的是？",
        "笑容",
        "眼睛",
        "聲音",
        "幽默感"
      ],
      "q43": [
        "什麼最快讓我笑出來？",
        "搞笑影片",
        "親友的玩笑",
        "尷尬場面",
        "動物"
      ],
      "q44": [
        "炎熱夏天我會喝什麼？",
        "檸檬水",
        "冰茶",
        "果汁",
        "冰水"
      ],
      "q45": [
        "哪個元素最像我？",
        "水",
        "火",
        "土",
        "風"
      ],
      "q46": [
        "我喜歡哪種故事？",
        "冒險",
        "愛情",
        "科幻",
        "真實故事"
      ],
      "q47": [
        "下雨天我怎麼過？",
        "看書",
        "睡覺",
        "看電影",
        "撐傘散步"
      ],
      "q48": [
        "禮物中我最在意什麼？",
        "心意",
        "實用",
        "好看",
        "驚喜"
      ],
      "q49": [
        "我會選哪種馬鈴薯？",
        "薯泥",
        "薯條",
        "烤馬鈴薯",
        "洋芋片"
      ],
      "q50": [
        "到新城市我先去哪？",
        "咖啡館",
        "博物館",
        "公園",
        "逛街"
      ],
      "q51": [
        "睡不著時我會做什麼？",
        "看書",
        "滑手機",
        "數羊",
        "喝熱牛奶"
      ],
      "q52": [
        "重要的日子我怎麼準備？",
        "提早全部計畫好",
        "拖到最後一刻",
        "找人幫忙",
        "緊張到睡不著"
      ],
      "q53": [
        "我最喜歡看哪種運動？",
        "足球",
        "網球",
        "花式滑冰",
        "不看運動"
      ],
      "q54": [
        "哪種寵物適合我？",
        "貓",
        "狗",
        "鸚鵡",
        "倉鼠"
      ],
      "q55": [
        "我傳什麼樣的訊息？",
        "長訊息",
        "短訊息",
        "滿滿表情符號",
        "語音訊息"
      ],
      "q56": [
        "我保存最久的禮物？",
        "一封信",
        "一個玩具",
        "一張照片",
        "一件飾品"
      ],
      "q57": [
        "我比較會選？",
        "壁爐旁喝茶",
        "草地野餐",
        "海邊散步",
        "看電影"
      ],
      "q58": [
        "哪種稱讚最讓我開心？",
        "外表",
        "聰明",
        "善良",
        "幽默"
      ],
      "q59": [
        "我理想的早晨？",
        "床上早餐",
        "清晨慢跑",
        "睡到自然醒",
        "陽台咖啡"
      ],
      "q60": [
        "我想學什麼？",
        "跳舞",
        "做菜",
        "新語言",
        "畫畫"
      ]
    },
    "yesNo": {
      "c01": [
        "你現在想我嗎？",
        "非常想你",
        "忍著，但正想著你"
      ],
      "c02": [
        "看到我的訊息會微笑嗎？",
        "總是會微笑",
        "在心裡偷偷微笑"
      ],
      "c03": [
        "你記得我們第一次見面嗎？",
        "記得每一分鐘",
        "記得最重要的 — 你"
      ],
      "c04": [
        "今天想抱抱嗎？",
        "等著你的擁抱",
        "把擁抱留到之後"
      ],
      "c05": [
        "一起去海邊好嗎？",
        "已經在收行李了",
        "嚮往山上"
      ],
      "c06": [
        "我會逗你笑嗎？",
        "發自內心地笑",
        "偷偷藏著笑容"
      ],
      "c07": [
        "跟我在一起你安心嗎？",
        "在你身邊很安心",
        "跟你在一起很開心"
      ],
      "c08": [
        "白天會想到我嗎？",
        "常常想到你",
        "此刻正想著你"
      ],
      "c09": [
        "你喜歡我的驚喜嗎？",
        "超愛你的驚喜",
        "最喜歡你就在身邊"
      ],
      "c10": [
        "一起烤個派好嗎？",
        "已經穿上圍裙了",
        "寧願買個蛋糕"
      ],
      "c11": [
        "今晚一起看電影好嗎？",
        "已經在挑電影了",
        "只想好好聊天"
      ],
      "c12": [
        "你喜歡我的聲音嗎？",
        "可以一直聽下去",
        "更喜歡你的笑聲"
      ],
      "c13": [
        "週末去野餐好嗎？",
        "正在準備野餐墊",
        "邀你去溫馨的咖啡館"
      ],
      "c14": [
        "想收到我的信嗎？",
        "等著你的信",
        "想當面聽你說"
      ],
      "c15": [
        "我對你很重要嗎？",
        "非常重要",
        "比你想的還重要"
      ],
      "c16": [
        "一起在雨中散步好嗎？",
        "帶著兩人用的傘",
        "在家泡茶比較好"
      ],
      "c17": [
        "我們像嗎？",
        "你們像兩個半圓",
        "你們完美互補"
      ],
      "c18": [
        "喜歡我做的菜嗎？",
        "還想再來一碗",
        "最愛和你一起下廚"
      ],
      "c19": [
        "一起養寵物好嗎？",
        "已經在想名字了",
        "現在有隻泰迪熊就夠了"
      ],
      "c20": [
        "你知道我喜歡什麼嗎？",
        "倒背如流",
        "還想知道更多"
      ],
      "c21": [
        "一起跳舞好嗎？",
        "已經伸出手了",
        "會在旁邊拍手"
      ],
      "c22": [
        "我能給你靈感嗎？",
        "你每天都給予靈感",
        "在你身邊就覺得溫暖"
      ],
      "c23": [
        "你會保存我們的照片嗎？",
        "每一張都好好珍藏",
        "期待更美的新照片"
      ],
      "c24": [
        "一起看日出好嗎？",
        "正在設鬧鐘",
        "比較喜歡看夕陽"
      ],
      "c25": [
        "告訴我一個秘密好嗎？",
        "會在你耳邊悄悄說",
        "就讓它保持神秘吧"
      ],
      "c26": [
        "你相信我嗎？",
        "非常相信你",
        "每天都為你加油"
      ],
      "c27": [
        "只有我們兩個人去旅行好嗎？",
        "夢想成真",
        "要帶上所有親愛的人"
      ],
      "c28": [
        "你在等我的電話嗎？",
        "笑著等你",
        "更希望你來看看"
      ],
      "c29": [
        "喜歡我的擁抱嗎？",
        "全世界最溫暖",
        "喜歡手牽手"
      ],
      "c30": [
        "我們互相朗讀好嗎？",
        "已經在挑書了",
        "更想聽你讀"
      ],
      "c31": [
        "今天一起拍張照好嗎？",
        "正在找漂亮的背景",
        "先聊聊天"
      ],
      "c32": [
        "我能讓你心情變好嗎？",
        "一直都是",
        "和你在一起，連難過都變輕了"
      ],
      "c33": [
        "明天一起吃早餐好嗎？",
        "已經在泡可可了",
        "想多睡一會兒"
      ],
      "c34": [
        "你記得我的生日嗎？",
        "不用提醒也記得",
        "正偷偷準備驚喜"
      ],
      "c35": [
        "一起去溜冰好嗎？",
        "正在拿出溜冰鞋",
        "會在場邊為你加油"
      ],
      "c36": [
        "今天對你來說是好日子嗎？",
        "超棒的一天",
        "有你在會更好"
      ],
      "c37": [
        "你會幫我畫像嗎？",
        "已經拿起鉛筆了",
        "會畫一顆小愛心"
      ],
      "c38": [
        "一起種棵樹好嗎？",
        "正在挑地點",
        "先從窗台上的花開始"
      ],
      "c39": [
        "想聽一句讚美嗎？",
        "迫不及待",
        "有點害羞，但很想聽"
      ],
      "c40": [
        "等等再玩一次好嗎？",
        "想再來一局",
        "比起遊戲更想抱抱"
      ]
    },
    "loves": {
      "s01": [
        "假期去哪裡？",
        "海灘",
        "山上",
        "旅行",
        "獨處時光"
      ],
      "s02": [
        "完美的夜晚？",
        "在家看電影",
        "散步",
        "餐廳",
        "桌遊"
      ],
      "s03": [
        "最喜歡的天氣？",
        "晴天",
        "下雨",
        "下雪",
        "星空"
      ],
      "s04": [
        "最喜歡的動物？",
        "小貓",
        "小狗",
        "馬",
        "海豚"
      ],
      "s05": [
        "晚餐吃什麼？",
        "披薩",
        "壽司",
        "甜點",
        "烤肉"
      ],
      "s06": [
        "最喜歡的飲料？",
        "咖啡",
        "茶",
        "熱可可",
        "檸檬水"
      ],
      "s07": [
        "最喜歡的季節？",
        "春天",
        "夏天",
        "秋天",
        "冬天"
      ],
      "s08": [
        "最喜歡的花？",
        "玫瑰",
        "鬱金香",
        "向日葵",
        "薰衣草"
      ],
      "s09": [
        "怎麼放鬆？",
        "看書",
        "畫畫",
        "騎腳踏車",
        "在吊床午睡"
      ],
      "s10": [
        "怎麼旅行？",
        "火車",
        "飛機",
        "開車",
        "搭船"
      ],
      "s11": [
        "夢想的家？",
        "城市公寓",
        "海邊小屋",
        "山中木屋",
        "農場"
      ],
      "s12": [
        "來點甜的？",
        "冰淇淋",
        "巧克力",
        "蛋糕",
        "水果"
      ],
      "s13": [
        "完美的早晨？",
        "床上早餐",
        "晨跑",
        "睡到自然醒",
        "陽台咖啡"
      ],
      "s14": [
        "夢想的約會？",
        "野餐",
        "溜冰場",
        "遊樂園",
        "屋頂看星星"
      ],
      "s15": [
        "最棒的禮物？",
        "一束花",
        "一封信",
        "一趟旅行",
        "禮物盒"
      ],
      "s16": [
        "最喜歡的大自然？",
        "大海",
        "森林",
        "沙漠",
        "極光"
      ]
    },
    "who": [
      "我們誰比較常遲到？",
      "我們誰會先和好？",
      "我們誰煮飯比較好吃？",
      "我們誰比較愛笑？",
      "我們誰出門準備比較久？",
      "我們誰比較常弄丟鑰匙？",
      "我們誰比較記得重要的日子？",
      "我們誰比較愛吃甜食？",
      "我們誰先睡著？",
      "我們誰比較早起？",
      "我們誰比較常說「我想你」？",
      "我們誰比較會挑禮物？",
      "我們誰比較愛開玩笑？",
      "我們誰開車比較厲害？",
      "我們誰講電話比較久？",
      "我們誰比較喜歡旅行？",
      "我們誰比較容易覺得委屈？",
      "我們誰原諒得比較快？",
      "我們誰拍照比較多？",
      "我們誰比較會理財？",
      "我們誰比較常買用不到的東西？",
      "我們誰比較會安慰人？",
      "我們誰在困難時比較冷靜？",
      "我們誰總是在找手機？",
      "我們誰比較喜歡招待客人？",
      "我們誰比較常做早餐？",
      "我們誰在陌生城市比較會認路？",
      "我們誰傳的訊息比較長？",
      "我們誰會先提議去散步？",
      "我們誰比較喜歡動物？",
      "我們誰比較守得住秘密？",
      "我們誰點餐時考慮比較久？",
      "我們誰比較掛念家人朋友？",
      "我們誰比較常製造驚喜？",
      "我們誰比較愛整潔？",
      "我們誰會先發現對方的新髮型？",
      "我們誰比較常想起好笑的往事？",
      "我們誰比較有耐心？",
      "我們誰比較常說「謝謝」？",
      "我們誰會先主動幫忙？"
    ],
    "phrases": [
      "讓我微笑的是，你…",
      "和你在一起最喜歡的一天是…",
      "謝謝你…",
      "我難過的時候，能幫到我的是…",
      "我希望有一天我們一起…",
      "關於我們最溫暖的回憶是…",
      "你最擅長的是…",
      "我覺得安心的時候是…",
      "如果我們有一整天的空閒，我們會…",
      "我為你感到驕傲，因為…",
      "我們最完美的夜晚是…",
      "我永遠不會忘記你…",
      "我喜歡你說…",
      "明年我希望我們…",
      "對我來說，你就像…",
      "你送我最好的禮物是…",
      "我想你的時候是…",
      "我們最好笑的時候是…",
      "我一直想對你說…",
      "我們的地方是…",
      "想到你的時候，我…",
      "你會讓我的一天更美好，只要你…",
      "我喜歡我們的一個習慣是…",
      "我對我們的心願：…",
      "我們遇過最好笑的事是…",
      "我感受到你的關心，是在你…",
      "和你一起的早晨是…",
      "如果用一個詞形容我們，那就是…",
      "我想向你學習如何…",
      "謝謝你總是…"
    ]
  },
  "th": {
    "text": {
      "homeLink": "เกมสำหรับสองคน",
      "eyebrow": "GLOWLETTER · เกมสำหรับสองคน",
      "title": "เล่นด้วยกัน",
      "close": "ปิด",
      "lead": "ส่งเกมให้คนที่คุณรัก เล่นผ่านลิงก์ได้ฟรีและไม่ต้องมีบัญชี",
      "quizTitle": "รู้จักฉันดีแค่ไหน?",
      "quizNote": "ตอบคำถามเกี่ยวกับตัวคุณ แล้วให้คนใกล้ชิดลองทาย ผลจะส่งกลับมาหาคุณ",
      "create": "สร้างแบบทดสอบ",
      "soon": "เร็ว ๆ นี้",
      "soonTitle": "เกมใหม่กำลังมา",
      "duel": "ดวล «ใครเร็วกว่า»",
      "loves": "สิ่งที่เรารัก",
      "cards": "การ์ดจับคู่สำหรับสองคน",
      "who": "ใครในเรา?",
      "phrase": "เติมประโยคให้จบ",
      "myQuizzes": "แบบทดสอบของฉัน",
      "noQuizzes": "ยังไม่มีแบบทดสอบ สร้างอันแรกได้ในไม่กี่นาที",
      "forWhom": "ถึง {name}",
      "noRecipient": "แบบทดสอบ",
      "resultsCount": "ผลลัพธ์: {count}",
      "newResults": "ใหม่: {count}",
      "noResults": "ยังไม่มีใครเล่น",
      "anonymous": "ไม่ระบุชื่อ",
      "results": "ผลลัพธ์",
      "copyLink": "คัดลอกลิงก์",
      "share": "ส่ง",
      "deleteQuiz": "ลบแบบทดสอบ",
      "deleteConfirm": "ลบแบบทดสอบนี้และผลลัพธ์ไหม? ลิงก์จะใช้ไม่ได้อีก",
      "deleted": "ลบแบบทดสอบแล้ว",
      "linkCopied": "คัดลอกลิงก์แล้ว",
      "back": "ย้อนกลับ",
      "next": "ถัดไป",
      "stepNames": "ขั้นที่ 1/2 · ชื่อ",
      "yourName": "ชื่อของคุณ",
      "yourNamePlaceholder": "คุณชื่ออะไร",
      "recipient": "ถึงใคร · ไม่บังคับ",
      "recipientPlaceholder": "ชื่อคนที่คุณรัก",
      "nameRequired": "กรุณาใส่ชื่อของคุณ",
      "forbiddenName": "กรุณาใส่ชื่อทั่วไป",
      "stepAnswers": "ขั้นที่ 2/2 · คำตอบของคุณ",
      "answersLead": "เลือกสิ่งที่เป็นจริงเกี่ยวกับคุณ เปลี่ยนคำถามได้ทุกข้อ",
      "swap": "คำถามอื่น",
      "progress": "ตอบแล้ว {done} จาก {total}",
      "answerAll": "เลือกคำตอบให้ครบทุกข้อ",
      "finish": "รับลิงก์",
      "creating": "กำลังสร้างแบบทดสอบ…",
      "createdTitle": "แบบทดสอบพร้อมแล้ว!",
      "createdLead": "ส่งลิงก์ไปได้เลย เมื่ออีกฝ่ายตอบ ผลจะแสดงใน «แบบทดสอบของฉัน»",
      "shareText": "{name} ชวนคุณเล่นเกม «รู้จักฉันดีแค่ไหน?»",
      "signInTitle": "ต้องเข้าสู่ระบบ",
      "signInNote": "แบบทดสอบจะเก็บไว้ในบัญชีของคุณ เพื่อให้ผลส่งถึงคุณ",
      "signIn": "เข้าสู่ระบบ",
      "premiumNote": "การสร้างเกมอยู่ในสิทธิ์ใช้งานเต็มรูปแบบ ส่วนการเล่นผ่านลิงก์ฟรีสำหรับทุกคน",
      "failed": "ไม่สำเร็จ โปรดตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง",
      "rateLimited": "ลองหลายครั้งเกินไป โปรดลองใหม่ภายหลัง",
      "playEyebrow": "เกมสำหรับสองคน",
      "playInvite": "{name} ชวนคุณมาเล่นเกม",
      "playLead": "คำถาม {count} ข้อ ทายคำตอบให้ถูก ตอนจบจะเห็นว่าตรงกันกี่ข้อ",
      "playName": "ชื่อของคุณ · ไม่บังคับ",
      "playNamePlaceholder": "เพื่อให้รู้ว่าเป็นคุณ",
      "start": "เริ่ม",
      "playLoading": "กำลังโหลดเกม…",
      "playMissing": "เกมนี้ใช้ไม่ได้ ลิงก์ถูกลบหรือหมดอายุแล้ว",
      "playOffline": "เกมนี้ต้องใช้อินเทอร์เน็ต",
      "retry": "ลองอีกครั้ง",
      "questionOf": "ข้อ {n} จาก {total}",
      "asks": "{name} ถามว่า",
      "counting": "กำลังนับคำตอบที่ตรงกัน…",
      "scoreOf": "{score} จาก {total}",
      "tierAll": "สมบูรณ์แบบ! คุณรู้จักกันดีที่สุด",
      "tierHigh": "คุณรู้จักกันดีมาก",
      "tierMid": "ไม่เลว! ยังมีอะไรให้รู้จักกันอีก",
      "tierLow": "ยังมีเรื่องดี ๆ ให้ค้นพบอีกมาก",
      "sentTo": "{name} จะเห็นผลของคุณ",
      "review": "คำตอบของคุณ",
      "rightAnswer": "คำตอบที่ถูก",
      "makeOwn": "สร้างแบบทดสอบของฉัน",
      "home": "หน้าแรก",
      "resultToast": "{name}: {score} จาก {total} ใน «รู้จักฉันดีแค่ไหน?»",
      "ownerAnswers": "คำตอบของผู้สร้าง",
      "playerAnswers": "คำตอบของ {name}",
      "paywallTitle": "เกม ความสนุก<br><em>และจดหมาย</em>",
      "groupGames": "เกม",
      "groupFun": "ความสนุก",
      "groupLetters": "จดหมาย",
      "featQuiz": "«รู้จักฉันดีแค่ไหน?» — ผลส่งกลับมาหาคุณ",
      "featGamesSoon": "ดวล «ใครเร็วกว่า», «สิ่งที่เรารัก», การ์ดจับคู่ลายหมี",
      "featFunSoon": "«ใครในเรา?» และ «เติมประโยคให้จบ» พร้อมสมุดของคู่รัก",
      "featCollection": "คอลเลกชันจดหมายและบทกวีทั้งหมดใน 25 ภาษา",
      "featMoments": "วันสำคัญ การแจ้งเตือน และจดหมาย QR ที่เปิดในวันที่กำหนด",
      "featAudio": "เสียงของคุณเองในจดหมาย และคำตอบจากผู้รับ",
      "ynTitle": "ใช่หรือไม่",
      "ynNote": "เกมสดสำหรับสองคน: การ์ดละ 5 วินาที ใครตอบทันจะได้เห็นคำตอบของอีกฝ่าย",
      "ynCreate": "สร้างห้อง",
      "ynWaiting": "รอให้ {name} เปิดลิงก์…",
      "ynWaitingAny": "กำลังรออีกฝ่าย…",
      "ynShareText": "{name} ชวนคุณเล่นเกมสด «ใช่หรือไม่»",
      "ynPartnerHere": "{name} มาแล้ว!",
      "ynStart": "เริ่มเกม",
      "ynWaitHost": "{name} กำลังจะเริ่มเกม",
      "ynYes": "ใช่",
      "ynNo": "ไม่",
      "ynMissed": "ช้าไป — การ์ดใบนี้ปิดอยู่",
      "ynMatch": "ตอบตรงกัน!",
      "ynRound": "การ์ด {n} จาก {total}",
      "ynAnswered": "ส่งคำตอบแล้ว กำลังรออีกฝ่าย…",
      "ynFinal": "ตรงกัน {score} จาก {total}",
      "ynFinalHigh": "คุณเข้าใจกันโดยไม่ต้องพูด",
      "ynFinalMid": "แตกต่างกัน แต่ใกล้ชิดกันมาก",
      "ynAgain": "เล่นอีกครั้ง",
      "ynLeft": "อีกฝ่ายหลุดการเชื่อมต่อ กำลังรอ…",
      "ynYou": "คุณ",
      "ynOffline": "เชื่อมต่อเกมไม่ได้ โปรดตรวจสอบอินเทอร์เน็ตแล้วเปิดลิงก์อีกครั้ง",
      "ynJoin": "เข้าร่วมเกม",
      "ynJoinLead": "{name} รอคุณอยู่ ตอบข้อละ 5 วินาที!",
      "ynStepNames": "ชื่อของคุณและอีกฝ่าย",
      "ynRoomReady": "ห้องพร้อมแล้ว — ส่งลิงก์ได้เลย",
      "ynStayHere": "อย่าปิดหน้านี้: เกมจะเริ่มเมื่อมีคนเปิดลิงก์",
      "featYesNo": "เกมสด «ใช่หรือไม่» — ตอบข้อละ 5 วินาที",
      "ynPartnerMissed": "ไม่มีคำตอบ — หมดเวลา",
      "lvTitle": "สิ่งที่เรารัก",
      "lvNote": "เกมสดสำหรับสองคน: รูป 4 ภาพ มีเวลา 10 วินาทีเลือกสิ่งที่ชอบที่สุด เลือกเหมือนกันก็ได้!",
      "lvShareText": "{name} ชวนคุณเล่นเกมสด «สิ่งที่เรารัก»",
      "lvJoinLead": "{name} รอคุณอยู่ เลือกภาพที่คุณชอบที่สุดเลย!",
      "lvRound": "หัวข้อ {n} จาก {total}",
      "lvPick": "เลือกสิ่งที่คุณชอบที่สุด",
      "lvBoth": "คุณทั้งคู่เลือก: {item}",
      "lvCommon": "สิ่งที่คุณทั้งคู่รัก",
      "lvDiff": "ชอบต่างกัน ยิ่งน่าสนใจ!",
      "lvFinalHigh": "คุณมีอะไรเหมือนกันเยอะมาก!",
      "lvFinalMid": "ต่างกัน แต่เติมเต็มกันและกัน",
      "featLoves": "เกมสด «สิ่งที่เรารัก» — 4 ภาพ เลือกด้วยกัน",
      "featGamesSoon2": "ดวล «ใครเร็วกว่า» และการ์ดจับคู่ลายหมี",
      "mcTitle": "การ์ดจับคู่ลายหมี",
      "mcNote": "เกมความจำสดสำหรับสองคน: ผลัดกันเปิดการ์ดทีละสองใบแล้วหาคู่ มีสามด่าน ตั้งแต่ 8 ถึง 16 ใบ",
      "mcShareText": "{name} ชวนคุณเล่นเกมสด «การ์ดจับคู่ลายหมี»",
      "mcJoinLead": "{name} รอคุณอยู่ ผลัดกันหาคู่กันเลย!",
      "mcLevel": "ด่าน {n} จาก {total}",
      "mcTurnYou": "ตาคุณ — เปิดการ์ดสองใบ",
      "mcTurnThem": "ตาของ {name}",
      "mcPairs": "หาคู่ได้ {found} จาก {total}",
      "mcLevelDone": "หาคู่ครบแล้ว!",
      "mcTimeUp": "หมดเวลาด่านนี้",
      "mcNext": "ต่อไป: ด่าน {n}",
      "mcFinal": "หาคู่ได้ {found} จาก {total}",
      "mcFinalHigh": "ทีมที่ยอดเยี่ยม!",
      "mcFinalMid": "เล่นดีมาก — อีกรอบไหม?",
      "featCards": "เกมสด «การ์ดจับคู่ลายหมี» — หาคู่ด้วยกัน",
      "featGamesSoon3": "ดวล «ใครเร็วกว่า»",
      "duTitle": "ใครเร็วกว่า",
      "duNote": "ดวลสด: หนึ่งคำ สี่ภาพ แตะภาพที่ถูกต้องให้ไวกว่า — แตะผิดจะเสียรอบนั้น",
      "duShareText": "{name} ท้าคุณดวลสด “ใครเร็วกว่า”",
      "duJoinLead": "{name} กำลังรอคุณอยู่ หาภาพที่ถูกต้องให้เร็วกว่า!",
      "duRound": "รอบที่ {n} จาก {total}",
      "duFind": "หา: {item}",
      "duYouWon": "คุณเร็วกว่า!",
      "duTheyWon": "{name} เร็วกว่า",
      "duWrong": "ภาพไม่ถูก — เสียรอบนี้",
      "duNobody": "ไม่มีใครหาเจอทันเวลา",
      "duScore": "คุณ {you} : {them} {name}",
      "duFinalWin": "ชนะแล้ว! วันนี้ตาไวมาก",
      "duFinalLose": "รอบนี้ {name} ชนะ — แก้มือไหม?",
      "duFinalDraw": "เสมอ — สูสีกันสุด ๆ!",
      "duSeconds": "{s} วิ",
      "featDuel": "ดวลสด “ใครเร็วกว่า” — หาภาพให้เจอก่อน",
      "whoTitle": "ใครในเราสองคน?",
      "whoNote": "เกมสดสำหรับสองคน: หนึ่งคำถาม แตะ “ฉัน” หรือชื่อของอีกฝ่าย ดูว่าคุณคิดตรงกันไหม",
      "whoShareText": "{name} ชวนคุณเล่นเกมสด “ใครในเราสองคน?”",
      "whoJoinLead": "{name} กำลังรอคุณอยู่ ตอบตามจริง — แล้วมาเทียบกัน!",
      "whoRound": "คำถามที่ {n} จาก {total}",
      "whoMe": "ฉัน",
      "whoAgree": "คิดตรงกัน: {name}",
      "whoDiffer": "ความเห็นต่างกัน — ลองคุยกันดู!",
      "whoFinal": "คิดตรงกัน {score} จาก {total} ครั้ง",
      "whoFinalHigh": "คุณเข้าใจกันดีมาก!",
      "whoFinalMid": "มีเรื่องให้คุยกันอีกเยอะ — และนั่นก็น่ารักดี",
      "featWho": "เกมสด “ใครในเราสองคน?” — ดูว่าคิดตรงกันไหม",
      "phTitle": "ต่อประโยคให้จบ",
      "phNote": "เกมสดสำหรับสองคน: ทั้งคู่ต่อประโยคอบอุ่นเดียวกันด้วยคำพูดของตัวเอง แล้วอ่านคำตอบของกันและกัน",
      "phShareText": "{name} ชวนคุณเล่นเกมสด “ต่อประโยคให้จบ”",
      "phJoinLead": "{name} กำลังรอคุณอยู่ ต่อแต่ละประโยคด้วยคำพูดของคุณเอง!",
      "phRound": "ประโยคที่ {n} จาก {total}",
      "phPlaceholder": "ตอนจบของคุณ…",
      "phDone": "เสร็จแล้ว",
      "phWaiting": "กำลังรอ {name}…",
      "phSkipped": "ไม่มีคำตอบ",
      "phSave": "บันทึกลงสมุดของเราสองคน",
      "phSaved": "บันทึกลงสมุดของเราสองคนแล้ว",
      "phForbidden": "กรุณาเขียนโดยไม่มีลิงก์หรือคำหยาบ",
      "phNext": "ประโยคถัดไป",
      "phFinal": "ประโยคที่ต่อด้วยกัน: {count}",
      "phFinalLead": "บันทึกคำตอบที่ชอบที่สุดลงสมุดของเราสองคน",
      "featPhrase": "เกมสด “ต่อประโยคให้จบ” พร้อมสมุดของเราสองคน",
      "bookTitle": "สมุดของเราสองคน",
      "bookNote": "คำตอบที่อบอุ่นที่สุดจาก “ต่อประโยคให้จบ” เก็บไว้ในบัญชีของคุณ",
      "bookOpen": "เปิดสมุด",
      "bookEmpty": "ตอนนี้สมุดยังว่างอยู่ ลองเล่น “ต่อประโยคให้จบ” แล้วบันทึกคำตอบที่ชอบ",
      "bookDelete": "ลบ",
      "bookDeleteConfirm": "ลบหน้านี้ออกจากสมุดไหม?",
      "bookYou": "คุณ",
      "inviteTitle": "ชวนเพื่อน",
      "inviteNote": "เพื่อนจะได้รับข้อความพร้อมเกม",
      "invite": "ชวน",
      "invited": "ชวนแล้ว",
      "inviteNone": "เพิ่มเพื่อนในส่วน “เพื่อน” เพื่อชวนได้ในแตะเดียว",
      "inviteSent": "ส่งคำชวนถึง {name} แล้ว"
    },
    "questions": {
      "q01": [
        "ฤดูที่ฉันชอบที่สุด?",
        "ฤดูใบไม้ผลิ",
        "ฤดูร้อน",
        "ฤดูใบไม้ร่วง",
        "ฤดูหนาว"
      ],
      "q02": [
        "มื้อเช้าฉันจะเลือกอะไร?",
        "กาแฟกับครัวซองต์",
        "โจ๊ก",
        "ไข่",
        "แค่ชา"
      ],
      "q03": [
        "วันหยุดในฝันของฉัน?",
        "อยู่บ้านใต้ผ้าห่ม",
        "เดินเล่นในสวน",
        "ไปเที่ยวนอกเมือง",
        "ใช้เวลากับเพื่อน"
      ],
      "q04": [
        "ฉันฝันอยากไปที่ไหน?",
        "ทะเล",
        "ภูเขา",
        "เมืองใหญ่",
        "บ้านหลังเล็กอบอุ่นในชนบท"
      ],
      "q05": [
        "ไอศกรีมรสโปรดของฉัน?",
        "วานิลลา",
        "ช็อกโกแลต",
        "สตรอว์เบอร์รี",
        "พิสตาชิโอ"
      ],
      "q06": [
        "อะไรทำให้ฉันอารมณ์ดีเร็วที่สุด?",
        "การกอด",
        "เซอร์ไพรส์",
        "คำพูดอบอุ่น",
        "ของอร่อย"
      ],
      "q07": [
        "ฉันเป็นคนแบบ…",
        "ตื่นเช้า",
        "นอนดึก",
        "นอนเมื่อมีโอกาส",
        "รักการงีบกลางวัน"
      ],
      "q08": [
        "คืนนี้ฉันจะเลือกหนังแบบไหน?",
        "ตลก",
        "เรื่องรักโรแมนติก",
        "สืบสวน",
        "แอนิเมชัน"
      ],
      "q09": [
        "สีที่ฉันชอบ?",
        "แดง",
        "น้ำเงิน",
        "เขียว",
        "ชมพู"
      ],
      "q10": [
        "ฉันกลัวอะไรที่สุด?",
        "แมงมุม",
        "ที่สูง",
        "ความมืด",
        "มาสาย"
      ],
      "q11": [
        "ดอกไม้ที่ฉันรัก?",
        "กุหลาบ",
        "ทิวลิป",
        "โบตั๋น",
        "เดซี่"
      ],
      "q12": [
        "เวลาเศร้าฉันทำอะไร?",
        "โทรหาคนใกล้ชิด",
        "กินของหวาน",
        "ออกไปเดินเล่น",
        "เข้านอน"
      ],
      "q13": [
        "สัตว์ที่ใกล้ใจฉันที่สุด?",
        "ลูกแมว",
        "สุนัข",
        "ลูกหมี",
        "ลูกจิ้งจอก"
      ],
      "q14": [
        "ของขวัญที่ดีที่สุดสำหรับฉัน?",
        "ของทำมือ",
        "ทริปท่องเที่ยว",
        "เครื่องประดับ",
        "หนังสือ"
      ],
      "q15": [
        "เครื่องดื่มที่ฉันชอบ?",
        "ชาดำ",
        "ชาเขียว",
        "กาแฟ",
        "โกโก้ร้อน"
      ],
      "q16": [
        "ของว่างที่ฉันชอบ?",
        "ช็อกโกแลต",
        "มันฝรั่งทอด",
        "ผลไม้",
        "ขนมเค้ก"
      ],
      "q17": [
        "เวลาเที่ยวฉันเลือกอะไร?",
        "พิพิธภัณฑ์",
        "ชายหาด",
        "อาหารท้องถิ่น",
        "เดินเล่นแบบไม่มีแผน"
      ],
      "q18": [
        "ฉันชอบใช้เวลาตอนเย็นแบบไหน?",
        "อ่านหนังสือ",
        "ดูซีรีส์",
        "นั่งคุยกัน",
        "เดินเล่น"
      ],
      "q19": [
        "อากาศแบบไหนที่ฉันชอบ?",
        "แดดสดใส",
        "ฝนอุ่น ๆ",
        "หิมะตก",
        "ลมเย็นเบา ๆ"
      ],
      "q20": [
        "พลังพิเศษแบบไหนเหมาะกับฉัน?",
        "บินได้",
        "อ่านใจคน",
        "หยุดเวลา",
        "เคลื่อนย้ายในพริบตา"
      ],
      "q21": [
        "สิ่งที่ฉันให้ความสำคัญที่สุดในคนใกล้ชิด?",
        "ความไว้ใจ",
        "ความใส่ใจ",
        "อารมณ์ขัน",
        "การสนับสนุน"
      ],
      "q22": [
        "วันไหนที่ฉันรอคอยที่สุด?",
        "ปีใหม่",
        "วันเกิดของฉัน",
        "วันหยุดฤดูร้อน",
        "วันวาเลนไทน์"
      ],
      "q23": [
        "ฉันบอก «รัก» บ่อยที่สุดด้วยวิธีไหน?",
        "ด้วยคำพูด",
        "ด้วยการกระทำ",
        "ด้วยการกอด",
        "ด้วยของขวัญ"
      ],
      "q24": [
        "ที่ร้านกาแฟฉันจะสั่งอะไร?",
        "พาสต้า",
        "ซูชิ",
        "สลัด",
        "ของหวาน"
      ],
      "q25": [
        "ช่วงเวลาที่ฉันชอบที่สุดของวัน?",
        "เช้า",
        "บ่าย",
        "เย็น",
        "กลางคืน"
      ],
      "q26": [
        "ฉันจะเลือกอาหารแบบไหน?",
        "อิตาเลียน",
        "ญี่ปุ่น",
        "อาหารบ้าน ๆ",
        "เม็กซิกัน"
      ],
      "q27": [
        "ฉันคิดอะไรได้ดีที่สุดตอนไหน?",
        "ตอนอาบน้ำ",
        "ตอนเดินเล่น",
        "ระหว่างเดินทาง",
        "ก่อนนอน"
      ],
      "q28": [
        "ตื่นเช้ามาฉันทำอะไรก่อน?",
        "ดูโทรศัพท์",
        "ดื่มน้ำ",
        "ชงกาแฟ",
        "นอนต่ออีกนิด"
      ],
      "q29": [
        "ผลไม้ที่ฉันชอบ?",
        "แอปเปิล",
        "กล้วย",
        "มะม่วง",
        "แตงโม"
      ],
      "q30": [
        "งานอดิเรกแบบไหนเหมาะกับฉัน?",
        "วาดรูป",
        "ทำอาหาร",
        "ออกกำลังกาย",
        "อ่านหนังสือ"
      ],
      "q31": [
        "ฉันอยากฉลองวันเกิดแบบไหน?",
        "ปาร์ตี้สนุก ๆ",
        "มื้อค่ำสองคน",
        "ไปเที่ยว",
        "อยู่บ้านเงียบ ๆ"
      ],
      "q32": [
        "ฉันรู้สึกยังไงกับเซอร์ไพรส์?",
        "ชอบมาก",
        "ตื่นเต้นนิดหน่อย",
        "ชอบทำให้คนอื่น",
        "อยากรู้ล่วงหน้ามากกว่า"
      ],
      "q33": [
        "ขนมหวานที่ฉันชอบ?",
        "เค้ก",
        "ไอศกรีม",
        "คุกกี้",
        "ลูกอม"
      ],
      "q34": [
        "ไปเกาะร้างฉันจะเอาอะไรไป?",
        "หนังสือ",
        "โทรศัพท์",
        "ผ้าห่ม",
        "กล้องถ่ายรูป"
      ],
      "q35": [
        "หลังวันที่เหนื่อยฉันพักผ่อนยังไง?",
        "อาบน้ำอุ่น",
        "ดูซีรีส์",
        "เดินเล่น",
        "คุยกับคนใกล้ชิด"
      ],
      "q36": [
        "ฉันชอบเดินทางด้วยอะไรที่สุด?",
        "รถไฟ",
        "เครื่องบิน",
        "รถยนต์",
        "จักรยาน"
      ],
      "q37": [
        "เกมที่ฉันชอบตอนเด็ก?",
        "ซ่อนหา",
        "วิ่งไล่จับ",
        "ตัวต่อ",
        "วาดรูป"
      ],
      "q38": [
        "นิทานเรื่องไหนคล้ายฉันที่สุด?",
        "ซินเดอเรลลา",
        "เจ้าชายน้อย",
        "หมีพูห์",
        "อลิซในแดนมหัศจรรย์"
      ],
      "q39": [
        "ฉันจะทำให้คนที่รักดีใจด้วยอะไร?",
        "เซอร์ไพรส์",
        "การ์ด",
        "ทริปเที่ยว",
        "มื้อค่ำ"
      ],
      "q40": [
        "ฉันถ่ายรูปอะไรบ่อยที่สุด?",
        "เซลฟี่",
        "ธรรมชาติ",
        "อาหาร",
        "แทบไม่ถ่ายเลย"
      ],
      "q41": [
        "มุมโปรดในบ้านของฉัน?",
        "เตียง",
        "ห้องครัว",
        "โซฟา",
        "ระเบียง"
      ],
      "q42": [
        "สิ่งแรกที่ฉันสังเกตในตัวคน?",
        "รอยยิ้ม",
        "ดวงตา",
        "น้ำเสียง",
        "อารมณ์ขัน"
      ],
      "q43": [
        "อะไรทำให้ฉันหัวเราะเร็วที่สุด?",
        "คลิปตลก",
        "มุกของคนใกล้ชิด",
        "สถานการณ์เขิน ๆ",
        "สัตว์"
      ],
      "q44": [
        "วันร้อน ๆ ฉันดื่มอะไร?",
        "น้ำมะนาว",
        "ชาเย็น",
        "น้ำผลไม้",
        "น้ำเย็นใส่น้ำแข็ง"
      ],
      "q45": [
        "ธาตุไหนใกล้เคียงฉันที่สุด?",
        "น้ำ",
        "ไฟ",
        "ดิน",
        "ลม"
      ],
      "q46": [
        "ฉันชอบเรื่องแบบไหน?",
        "ผจญภัย",
        "ความรัก",
        "ไซไฟ",
        "เรื่องจริง"
      ],
      "q47": [
        "วันฝนตกฉันทำอะไร?",
        "อ่านหนังสือ",
        "นอน",
        "ดูหนัง",
        "กางร่มเดินเล่น"
      ],
      "q48": [
        "ฉันให้คุณค่ากับอะไรในของขวัญ?",
        "ความใส่ใจ",
        "ความมีประโยชน์",
        "ความสวยงาม",
        "ความประหลาดใจ"
      ],
      "q49": [
        "ฉันจะเลือกมันฝรั่งแบบไหน?",
        "มันบด",
        "เฟรนช์ฟรายส์",
        "มันอบ",
        "มันฝรั่งทอดกรอบ"
      ],
      "q50": [
        "ไปเมืองใหม่ฉันไปที่ไหนก่อน?",
        "คาเฟ่",
        "พิพิธภัณฑ์",
        "สวนสาธารณะ",
        "ช้อปปิ้ง"
      ],
      "q51": [
        "นอนไม่หลับฉันทำอะไร?",
        "อ่านหนังสือ",
        "เล่นโทรศัพท์",
        "นับแกะ",
        "ดื่มนมอุ่น"
      ],
      "q52": [
        "ฉันเตรียมตัวสำหรับวันสำคัญยังไง?",
        "วางแผนทุกอย่างล่วงหน้า",
        "ทำนาทีสุดท้าย",
        "ขอให้คนช่วย",
        "ตื่นเต้นจนนอนไม่หลับ"
      ],
      "q53": [
        "กีฬาที่ฉันชอบดู?",
        "ฟุตบอล",
        "เทนนิส",
        "สเก็ตลีลา",
        "ไม่ดูกีฬา"
      ],
      "q54": [
        "สัตว์เลี้ยงแบบไหนเหมาะกับฉัน?",
        "แมว",
        "สุนัข",
        "นกแก้ว",
        "แฮมสเตอร์"
      ],
      "q55": [
        "ฉันส่งข้อความแบบไหน?",
        "ยาว ๆ",
        "สั้น ๆ",
        "อีโมจิเต็มไปหมด",
        "ข้อความเสียง"
      ],
      "q56": [
        "ของขวัญที่ฉันเก็บไว้นานที่สุด?",
        "จดหมาย",
        "ของเล่น",
        "รูปถ่าย",
        "เครื่องประดับ"
      ],
      "q57": [
        "ฉันจะเลือกอะไรมากกว่า?",
        "จิบชาข้างเตาผิง",
        "ปิกนิกบนสนามหญ้า",
        "เดินเล่นริมทะเล",
        "ไปดูหนัง"
      ],
      "q58": [
        "คำชมแบบไหนทำให้ฉันดีใจที่สุด?",
        "เรื่องหน้าตา",
        "เรื่องความฉลาด",
        "เรื่องความใจดี",
        "เรื่องอารมณ์ขัน"
      ],
      "q59": [
        "เช้าในฝันของฉัน?",
        "อาหารเช้าบนเตียง",
        "วิ่งตอนเช้า",
        "นอนยาว ๆ",
        "กาแฟที่ระเบียง"
      ],
      "q60": [
        "ฉันอยากเรียนอะไร?",
        "เต้น",
        "ทำอาหาร",
        "ภาษาใหม่",
        "วาดรูป"
      ]
    },
    "yesNo": {
      "c01": [
        "ตอนนี้คิดถึงฉันไหม?",
        "คิดถึงมาก",
        "อดทนอยู่ แต่คิดถึงคุณ"
      ],
      "c02": [
        "เห็นข้อความของฉันแล้วยิ้มไหม?",
        "ยิ้มทุกครั้ง",
        "แอบยิ้มในใจ"
      ],
      "c03": [
        "จำวันแรกที่เราเจอกันได้ไหม?",
        "จำได้ทุกนาที",
        "จำสิ่งสำคัญที่สุดได้ — คุณ"
      ],
      "c04": [
        "วันนี้อยากกอดไหม?",
        "รออ้อมกอดของคุณ",
        "เก็บอ้อมกอดไว้ทีหลัง"
      ],
      "c05": [
        "ไปทะเลด้วยกันไหม?",
        "กำลังจัดกระเป๋าแล้ว",
        "ฝันถึงภูเขา"
      ],
      "c06": [
        "ฉันทำให้คุณหัวเราะไหม?",
        "หัวเราะจากใจ",
        "แอบซ่อนรอยยิ้ม"
      ],
      "c07": [
        "อยู่กับฉันแล้วสบายใจไหม?",
        "อยู่ข้างคุณแล้วสงบ",
        "อยู่กับคุณแล้วสนุก"
      ],
      "c08": [
        "ระหว่างวันคิดถึงฉันไหม?",
        "คิดถึงบ่อยมาก",
        "กำลังคิดถึงอยู่ตอนนี้"
      ],
      "c09": [
        "ชอบเซอร์ไพรส์ของฉันไหม?",
        "ชอบเซอร์ไพรส์ของคุณมาก",
        "ชอบที่สุดคือมีคุณอยู่ใกล้ ๆ"
      ],
      "c10": [
        "อบพายด้วยกันไหม?",
        "ใส่ผ้ากันเปื้อนแล้ว",
        "ขอซื้อเค้กดีกว่า"
      ],
      "c11": [
        "คืนนี้ดูหนังด้วยกันไหม?",
        "กำลังเลือกหนัง",
        "อยากคุยกันมากกว่า"
      ],
      "c12": [
        "ชอบเสียงของฉันไหม?",
        "ฟังได้ไม่มีเบื่อ",
        "ชอบเสียงหัวเราะของคุณมากกว่า"
      ],
      "c13": [
        "สุดสัปดาห์ไปปิกนิกกันไหม?",
        "เตรียมผ้าปูแล้ว",
        "ชวนไปคาเฟ่อบอุ่น"
      ],
      "c14": [
        "อยากได้จดหมายจากฉันไหม?",
        "รอจดหมายของคุณ",
        "อยากฟังต่อหน้ามากกว่า"
      ],
      "c15": [
        "ฉันสำคัญกับคุณไหม?",
        "สำคัญมาก",
        "มากกว่าที่คุณคิด"
      ],
      "c16": [
        "เดินเล่นกลางสายฝนกันไหม?",
        "หยิบร่มสำหรับสองคน",
        "ขอชงชาที่บ้าน"
      ],
      "c17": [
        "เราคล้ายกันไหม?",
        "เหมือนสองครึ่งที่เติมกัน",
        "เติมเต็มกันได้อย่างลงตัว"
      ],
      "c18": [
        "ชอบอาหารที่ฉันทำไหม?",
        "ขอเพิ่มอีกจาน",
        "ชอบทำอาหารด้วยกันกับคุณ"
      ],
      "c19": [
        "เลี้ยงสัตว์ด้วยกันไหม?",
        "กำลังคิดชื่ออยู่",
        "ตอนนี้มีตุ๊กตาหมีก็พอ"
      ],
      "c20": [
        "รู้ไหมว่าฉันชอบอะไร?",
        "จำได้ขึ้นใจ",
        "อยากรู้มากกว่านี้อีก"
      ],
      "c21": [
        "เต้นรำด้วยกันไหม?",
        "ยื่นมือมาแล้ว",
        "จะปรบมือเชียร์"
      ],
      "c22": [
        "ฉันเป็นแรงบันดาลใจให้คุณไหม?",
        "เป็นแรงบันดาลใจทุกวัน",
        "อยู่ข้างคุณแล้วอบอุ่น"
      ],
      "c23": [
        "เก็บรูปของเราไว้ไหม?",
        "เก็บไว้อย่างดีทุกใบ",
        "รอรูปใหม่ที่สวยกว่านี้"
      ],
      "c24": [
        "ดูพระอาทิตย์ขึ้นด้วยกันไหม?",
        "ตั้งนาฬิกาปลุกแล้ว",
        "ขอดูพระอาทิตย์ตกดีกว่า"
      ],
      "c25": [
        "บอกความลับฉันสักเรื่องไหม?",
        "จะกระซิบข้างหู",
        "ขอเก็บเป็นความลับ"
      ],
      "c26": [
        "เชื่อในตัวฉันไหม?",
        "เชื่อในตัวคุณมาก",
        "เป็นกำลังใจให้ทุกวัน"
      ],
      "c27": [
        "ไปเที่ยวกันแค่สองคนไหม?",
        "ฝันถึงสิ่งนี้",
        "จะพาคนที่รักไปด้วยทั้งหมด"
      ],
      "c28": [
        "รอโทรศัพท์จากฉันไหม?",
        "รอด้วยรอยยิ้ม",
        "อยากให้มาหามากกว่า"
      ],
      "c29": [
        "ชอบอ้อมกอดของฉันไหม?",
        "อบอุ่นที่สุดในโลก",
        "ชอบจับมือกัน"
      ],
      "c30": [
        "อ่านหนังสือให้กันฟังไหม?",
        "กำลังเลือกหนังสือ",
        "อยากฟังคุณอ่านมากกว่า"
      ],
      "c31": [
        "วันนี้ถ่ายรูปคู่กันไหม?",
        "กำลังหาฉากสวย ๆ",
        "คุยกันก่อน"
      ],
      "c32": [
        "ฉันทำให้คุณอารมณ์ดีขึ้นไหม?",
        "เสมอ",
        "อยู่กับคุณ ความเศร้าก็เบาลง"
      ],
      "c33": [
        "พรุ่งนี้กินข้าวเช้าด้วยกันไหม?",
        "กำลังชงโกโก้",
        "อยากนอนต่ออีกหน่อย"
      ],
      "c34": [
        "จำวันเกิดฉันได้ไหม?",
        "จำได้โดยไม่ต้องเตือน",
        "แอบเตรียมเซอร์ไพรส์อยู่"
      ],
      "c35": [
        "ไปเล่นสเก็ตน้ำแข็งกันไหม?",
        "หยิบรองเท้าสเก็ตแล้ว",
        "จะเชียร์อยู่ข้างลาน"
      ],
      "c36": [
        "วันนี้เป็นวันดีของคุณไหม?",
        "วันที่ยอดเยี่ยม",
        "จะดีขึ้นเมื่อมีคุณ"
      ],
      "c37": [
        "วาดรูปฉันให้หน่อยไหม?",
        "หยิบดินสอแล้ว",
        "จะวาดหัวใจดวงเล็ก"
      ],
      "c38": [
        "ปลูกต้นไม้ด้วยกันไหม?",
        "กำลังเลือกที่",
        "เริ่มจากดอกไม้ริมหน้าต่างก่อน"
      ],
      "c39": [
        "อยากฟังคำชมไหม?",
        "รอไม่ไหวแล้ว",
        "เขินแต่ก็อยากฟังมาก"
      ],
      "c40": [
        "เดี๋ยวเล่นอีกรอบไหม?",
        "อยากเล่นอีกตา",
        "อยากกอดมากกว่าเล่นเกม"
      ]
    },
    "loves": {
      "s01": [
        "ไปเที่ยวที่ไหนดี?",
        "ชายหาด",
        "ภูเขา",
        "เดินทาง",
        "อยู่คนเดียวเงียบ ๆ"
      ],
      "s02": [
        "ค่ำคืนที่สมบูรณ์แบบ?",
        "ดูหนังที่บ้าน",
        "เดินเล่น",
        "ร้านอาหาร",
        "บอร์ดเกม"
      ],
      "s03": [
        "อากาศที่ชอบ?",
        "แดดสดใส",
        "ฝน",
        "หิมะ",
        "คืนดาวพราว"
      ],
      "s04": [
        "สัตว์ที่ชอบ?",
        "ลูกแมว",
        "ลูกสุนัข",
        "ม้า",
        "โลมา"
      ],
      "s05": [
        "มื้อเย็นกินอะไร?",
        "พิซซ่า",
        "ซูชิ",
        "ขนมหวาน",
        "บาร์บีคิว"
      ],
      "s06": [
        "เครื่องดื่มที่ชอบ?",
        "กาแฟ",
        "ชา",
        "โกโก้ร้อน",
        "น้ำมะนาว"
      ],
      "s07": [
        "ฤดูที่ชอบ?",
        "ใบไม้ผลิ",
        "ฤดูร้อน",
        "ใบไม้ร่วง",
        "ฤดูหนาว"
      ],
      "s08": [
        "ดอกไม้ที่ชอบ?",
        "กุหลาบ",
        "ทิวลิป",
        "ทานตะวัน",
        "ลาเวนเดอร์"
      ],
      "s09": [
        "พักผ่อนแบบไหน?",
        "อ่านหนังสือ",
        "วาดรูป",
        "ปั่นจักรยาน",
        "นอนเปล"
      ],
      "s10": [
        "เดินทางด้วยอะไร?",
        "รถไฟ",
        "เครื่องบิน",
        "รถยนต์",
        "เรือ"
      ],
      "s11": [
        "บ้านในฝัน?",
        "คอนโดในเมือง",
        "บ้านริมทะเล",
        "กระท่อมบนเขา",
        "ฟาร์ม"
      ],
      "s12": [
        "ของหวานอะไรดี?",
        "ไอศกรีม",
        "ช็อกโกแลต",
        "เค้ก",
        "ผลไม้"
      ],
      "s13": [
        "เช้าที่สมบูรณ์แบบ?",
        "อาหารเช้าบนเตียง",
        "วิ่งตอนเช้า",
        "นอนยาว ๆ",
        "กาแฟที่ระเบียง"
      ],
      "s14": [
        "เดตในฝัน?",
        "ปิกนิก",
        "ลานสเก็ต",
        "สวนสนุก",
        "ดูดาวบนดาดฟ้า"
      ],
      "s15": [
        "ของขวัญที่ดีที่สุด?",
        "ช่อดอกไม้",
        "จดหมาย",
        "ทริปเที่ยว",
        "กล่องของขวัญ"
      ],
      "s16": [
        "ธรรมชาติที่ชอบ?",
        "ทะเล",
        "ป่า",
        "ทะเลทราย",
        "แสงเหนือ"
      ]
    },
    "who": [
      "ในเราสองคน ใครมาสายบ่อยกว่า?",
      "ในเราสองคน ใครเป็นฝ่ายง้อก่อน?",
      "ในเราสองคน ใครทำอาหารเก่งกว่า?",
      "ในเราสองคน ใครหัวเราะบ่อยกว่า?",
      "ในเราสองคน ใครแต่งตัวนานกว่า?",
      "ในเราสองคน ใครทำกุญแจหายบ่อยกว่า?",
      "ในเราสองคน ใครจำวันสำคัญได้ดีกว่า?",
      "ในเราสองคน ใครชอบของหวานมากกว่า?",
      "ในเราสองคน ใครหลับก่อน?",
      "ในเราสองคน ใครตื่นเช้ากว่า?",
      "ในเราสองคน ใครพูดว่า “คิดถึง” บ่อยกว่า?",
      "ในเราสองคน ใครเลือกของขวัญเก่งกว่า?",
      "ในเราสองคน ใครพูดเล่นบ่อยกว่า?",
      "ในเราสองคน ใครขับรถเก่งกว่า?",
      "ในเราสองคน ใครคุยโทรศัพท์นานกว่า?",
      "ในเราสองคน ใครชอบเที่ยวมากกว่า?",
      "ในเราสองคน ใครน้อยใจง่ายกว่า?",
      "ในเราสองคน ใครให้อภัยเร็วกว่า?",
      "ในเราสองคน ใครถ่ายรูปเยอะกว่า?",
      "ในเราสองคน ใครจัดการเงินเก่งกว่า?",
      "ในเราสองคน ใครซื้อของไม่จำเป็นบ่อยกว่า?",
      "ในเราสองคน ใครปลอบใจเก่งกว่า?",
      "ในเราสองคน ใครใจเย็นกว่าในยามลำบาก?",
      "ในเราสองคน ใครชอบหาโทรศัพท์ตัวเองไม่เจอ?",
      "ในเราสองคน ใครชอบต้อนรับแขกมากกว่า?",
      "ในเราสองคน ใครทำอาหารเช้าบ่อยกว่า?",
      "ในเราสองคน ใครหาทางในเมืองที่ไม่คุ้นเก่งกว่า?",
      "ในเราสองคน ใครเขียนข้อความยาวกว่า?",
      "ในเราสองคน ใครชวนไปเดินเล่นก่อน?",
      "ในเราสองคน ใครรักสัตว์มากกว่า?",
      "ในเราสองคน ใครเก็บความลับเก่งกว่า?",
      "ในเราสองคน ใครเลือกเมนูนานกว่า?",
      "ในเราสองคน ใครเป็นห่วงคนใกล้ชิดมากกว่า?",
      "ในเราสองคน ใครเซอร์ไพรส์บ่อยกว่า?",
      "ในเราสองคน ใครเป็นระเบียบกว่า?",
      "ในเราสองคน ใครสังเกตทรงผมใหม่ได้ก่อน?",
      "ในเราสองคน ใครนึกถึงเรื่องตลกบ่อยกว่า?",
      "ในเราสองคน ใครอดทนกว่า?",
      "ในเราสองคน ใครพูดว่า “ขอบคุณ” บ่อยกว่า?",
      "ในเราสองคน ใครเสนอความช่วยเหลือก่อน?"
    ],
    "phrases": [
      "ฉันยิ้มเมื่อเธอ…",
      "วันที่ฉันชอบที่สุดกับเธอคือ…",
      "ขอบคุณเธอที่…",
      "เวลาฉันเศร้า สิ่งที่ช่วยฉันได้คือ…",
      "สักวันฉันอยากให้เราได้…",
      "ความทรงจำที่อบอุ่นที่สุดของเราคือ…",
      "เธอเก่งที่สุดเรื่อง…",
      "ฉันรู้สึกสงบใจเมื่อ…",
      "ถ้าเรามีวันว่างทั้งวัน เราจะ…",
      "ฉันภูมิใจในตัวเธอ เพราะ…",
      "ตอนเย็นที่สมบูรณ์แบบของเราคือ…",
      "ฉันจะไม่มีวันลืมตอนที่เธอ…",
      "ฉันชอบเวลาเธอพูดว่า…",
      "ปีหน้าฉันอยากให้เรา…",
      "สำหรับฉัน เธอเหมือน…",
      "ของขวัญที่ดีที่สุดจากเธอคือ…",
      "ฉันคิดถึงเธอเมื่อ…",
      "เราตลกที่สุดตอนที่…",
      "ฉันอยากบอกเธอมานานแล้วว่า…",
      "สถานที่ของเราคือ…",
      "เมื่อฉันคิดถึงเธอ ฉัน…",
      "เธอทำให้วันของฉันดีขึ้นเมื่อ…",
      "ฉันชอบนิสัยของเราที่…",
      "สิ่งที่ฉันปรารถนาสำหรับเรา: …",
      "เรื่องที่ตลกที่สุดที่เกิดขึ้นกับเราคือ…",
      "ฉันรู้สึกได้ว่าเธอใส่ใจ เมื่อเธอ…",
      "เช้าที่มีเธอคือ…",
      "ถ้าเราเป็นคำคำเดียว คำนั้นคือ…",
      "ฉันอยากเรียนรู้จากเธอเรื่อง…",
      "ขอบคุณที่เธอมักจะ…"
    ]
  },
  "ar": {
    "text": {
      "homeLink": "ألعاب لشخصين",
      "eyebrow": "GLOWLETTER · ألعاب لشخصين",
      "title": "العبا معًا",
      "close": "إغلاق",
      "lead": "أرسل لعبة إلى شخص عزيز عليك. اللعب عبر الرابط مجاني ولا يحتاج إلى حساب.",
      "quizTitle": "إلى أي حد تعرفني؟",
      "quizNote": "أجب عن أسئلة عن نفسك، ودع شخصًا قريبًا يحاول التخمين. تصلك النتيجة.",
      "create": "إنشاء اختبار",
      "soon": "قريبًا",
      "soonTitle": "ألعاب أخرى في الطريق",
      "duel": "تحدي «من الأسرع»",
      "loves": "ما نحبه",
      "cards": "بطاقات الذاكرة لشخصين",
      "who": "من منا؟",
      "phrase": "أكمل الجملة",
      "myQuizzes": "اختباراتي",
      "noQuizzes": "لا توجد اختبارات بعد. إنشاء الأول يستغرق دقائق قليلة.",
      "forWhom": "إلى {name}",
      "noRecipient": "اختبار",
      "resultsCount": "النتائج: {count}",
      "newResults": "جديد: {count}",
      "noResults": "لم يلعب أحد بعد.",
      "anonymous": "بلا اسم",
      "results": "النتائج",
      "copyLink": "نسخ الرابط",
      "share": "إرسال",
      "deleteQuiz": "حذف الاختبار",
      "deleteConfirm": "هل تريد حذف هذا الاختبار ونتائجه؟ سيتوقف الرابط عن العمل.",
      "deleted": "تم حذف الاختبار",
      "linkCopied": "تم نسخ الرابط",
      "back": "رجوع",
      "next": "التالي",
      "stepNames": "الخطوة 1 من 2 · الأسماء",
      "yourName": "اسمك",
      "yourNamePlaceholder": "ما اسمك",
      "recipient": "لمن · اختياري",
      "recipientPlaceholder": "اسم الشخص العزيز",
      "nameRequired": "اكتب اسمك.",
      "forbiddenName": "اكتب اسمًا عاديًا.",
      "stepAnswers": "الخطوة 2 من 2 · إجاباتك",
      "answersLead": "اختر ما ينطبق عليك. يمكن تبديل أي سؤال.",
      "swap": "سؤال آخر",
      "progress": "تمت الإجابة عن {done} من {total}",
      "answerAll": "اختر إجابة لكل سؤال.",
      "finish": "الحصول على الرابط",
      "creating": "جارٍ إنشاء الاختبار…",
      "createdTitle": "اختبارك جاهز!",
      "createdLead": "أرسل الرابط. عند الإجابة ستظهر النتيجة في «اختباراتي».",
      "shareText": "دعوة من {name} إلى لعبة «إلى أي حد تعرفني؟»",
      "signInTitle": "يلزم تسجيل الدخول",
      "signInNote": "يُحفظ الاختبار في حسابك لتصلك النتائج.",
      "signIn": "تسجيل الدخول",
      "premiumNote": "إنشاء الألعاب جزء من الوصول الكامل. اللعب عبر الرابط مجاني للجميع.",
      "failed": "لم ينجح ذلك. تحقق من الاتصال وحاول مرة أخرى.",
      "rateLimited": "محاولات كثيرة جدًا. حاول لاحقًا.",
      "playEyebrow": "لعبة لشخصين",
      "playInvite": "دعوة من {name} للعب",
      "playLead": "عدد الأسئلة: {count}. خمّن الإجابات، وفي النهاية سترى كم منها تطابق.",
      "playName": "اسمك · اختياري",
      "playNamePlaceholder": "ليعرفوا أنه أنت",
      "start": "ابدأ",
      "playLoading": "جارٍ تحميل اللعبة…",
      "playMissing": "هذه اللعبة غير متاحة: حُذف الرابط أو انتهت صلاحيته.",
      "playOffline": "تحتاج اللعبة إلى اتصال بالإنترنت.",
      "retry": "إعادة المحاولة",
      "questionOf": "السؤال {n} من {total}",
      "asks": "سؤال من {name}",
      "counting": "جارٍ حساب التطابقات…",
      "scoreOf": "{score} من {total}",
      "tierAll": "رائع! تعرفان بعضكما أفضل من أي أحد",
      "tierHigh": "تعرفان بعضكما جيدًا جدًا",
      "tierMid": "ليس سيئًا! ما زال هناك الكثير لتكتشفاه",
      "tierLow": "تنتظركما اكتشافات جميلة كثيرة",
      "sentTo": "ستصل نتيجتك إلى {name}",
      "review": "إجاباتك",
      "rightAnswer": "الإجابة الصحيحة",
      "makeOwn": "إنشاء اختباري",
      "home": "الرئيسية",
      "resultToast": "{name}: {score} من {total} في «إلى أي حد تعرفني؟»",
      "ownerAnswers": "إجابات صاحب الاختبار",
      "playerAnswers": "إجابات {name}",
      "paywallTitle": "ألعاب وتسلية<br><em>ورسائل</em>",
      "groupGames": "ألعاب",
      "groupFun": "تسلية",
      "groupLetters": "رسائل",
      "featQuiz": "«إلى أي حد تعرفني؟» — تصلك النتيجة",
      "featGamesSoon": "تحدي «من الأسرع»، «ما نحبه»، بطاقات الذاكرة مع الدببة",
      "featFunSoon": "«من منا؟» و«أكمل الجملة» مع دفتر الثنائي",
      "featCollection": "مجموعة الرسائل والقصائد كاملة بخمس وعشرين لغة",
      "featMoments": "لحظات وتذكيرات ورسالة QR تُفتح في اليوم المناسب",
      "featAudio": "صوتك الخاص في الرسالة وردود المستلم",
      "ynTitle": "نعم أو لا",
      "ynNote": "لعبة مباشرة لشخصين: 5 ثوانٍ لكل بطاقة. من يجيب في الوقت يرى إجابة الطرف الآخر.",
      "ynCreate": "إنشاء غرفة",
      "ynWaiting": "بانتظار فتح الرابط: {name}…",
      "ynWaitingAny": "بانتظار الطرف الآخر…",
      "ynShareText": "دعوة من {name} إلى اللعبة المباشرة «نعم أو لا»",
      "ynPartnerHere": "وصل الآن: {name}!",
      "ynStart": "ابدأ اللعبة",
      "ynWaitHost": "اللعبة ستبدأ قريبًا مع {name}",
      "ynYes": "نعم",
      "ynNo": "لا",
      "ynMissed": "فات الوقت — تبقى البطاقة مغلقة",
      "ynMatch": "الإجابة نفسها!",
      "ynRound": "البطاقة {n} من {total}",
      "ynAnswered": "أُرسلت الإجابة، بانتظار الطرف الآخر…",
      "ynFinal": "تطابقت {score} من {total}",
      "ynFinalHigh": "تفهمان بعضكما دون كلمات",
      "ynFinalMid": "مختلفان جدًا — وقريبان جدًا",
      "ynAgain": "العب مرة أخرى",
      "ynLeft": "انقطع اتصال الطرف الآخر. بانتظار العودة…",
      "ynYou": "أنت",
      "ynOffline": "تعذّر الاتصال باللعبة. تحقّق من الإنترنت وافتح الرابط مجددًا.",
      "ynJoin": "ادخل اللعبة",
      "ynJoinLead": "اللعبة جاهزة مع {name}. 5 ثوانٍ لكل إجابة!",
      "ynStepNames": "اسمك واسم الطرف الآخر",
      "ynRoomReady": "الغرفة جاهزة — أرسل الرابط",
      "ynStayHere": "أبقِ هذه الشاشة مفتوحة: تبدأ اللعبة عند فتح الرابط.",
      "featYesNo": "لعبة «نعم أو لا» المباشرة — 5 ثوانٍ لكل إجابة",
      "ynPartnerMissed": "لا إجابة — انتهى الوقت",
      "lvTitle": "ما نحبه",
      "lvNote": "لعبة مباشرة لشخصين: 4 صور و10 ثوانٍ لاختيار الأحب إليك. يمكنكما اختيار الشيء نفسه!",
      "lvShareText": "دعوة من {name} إلى اللعبة المباشرة «ما نحبه»",
      "lvJoinLead": "اللعبة جاهزة مع {name}. اختر الصورة الأحب إليك!",
      "lvRound": "الموضوع {n} من {total}",
      "lvPick": "اختر الأحب إليك",
      "lvBoth": "اخترتما معًا: {item}",
      "lvCommon": "ما تحبانه معًا",
      "lvDiff": "أذواق مختلفة — وهذا أجمل!",
      "lvFinalHigh": "بينكما الكثير من القواسم المشتركة!",
      "lvFinalMid": "مختلفان جدًا — وتكملان بعضكما",
      "featLoves": "لعبة «ما نحبه» المباشرة — 4 صور، اختارا معًا",
      "featGamesSoon2": "تحدي «من الأسرع» وبطاقات الذاكرة مع الدببة",
      "mcTitle": "بطاقات الذاكرة مع الدببة",
      "mcNote": "لعبة ذاكرة مباشرة لشخصين: اقلبا بالتناوب بطاقتين وابحثا عن الأزواج. ثلاثة مستويات، من 8 إلى 16 بطاقة.",
      "mcShareText": "دعوة من {name} إلى اللعبة المباشرة «بطاقات الذاكرة مع الدببة»",
      "mcJoinLead": "اللعبة جاهزة مع {name}. ابحثا عن الأزواج بالتناوب!",
      "mcLevel": "المستوى {n} من {total}",
      "mcTurnYou": "دورك — اقلب بطاقتين",
      "mcTurnThem": "الدور الآن لـ {name}",
      "mcPairs": "الأزواج المكتشفة: {found} من {total}",
      "mcLevelDone": "تم العثور على كل الأزواج!",
      "mcTimeUp": "انتهى وقت المستوى",
      "mcNext": "التالي: المستوى {n}",
      "mcFinal": "الأزواج المكتشفة: {found} من {total}",
      "mcFinalHigh": "فريق رائع!",
      "mcFinalMid": "لعبة جميلة — مرة أخرى؟",
      "featCards": "لعبة «بطاقات الذاكرة مع الدببة» المباشرة — ابحثا عن الأزواج معًا",
      "featGamesSoon3": "تحدي «من الأسرع»",
      "duTitle": "مَن الأسرع",
      "duNote": "مبارزة مباشرة: كلمة واحدة وأربع صور. يفوز بالجولة مَن يلمس الصورة الصحيحة أولًا، واللمسة الخاطئة تعني خسارتها.",
      "duShareText": "تحدٍّ من {name}: مبارزة مباشرة «مَن الأسرع»",
      "duJoinLead": "{name} بانتظارك. مَن يجد الصورة الصحيحة أولًا يفوز!",
      "duRound": "الجولة {n} من {total}",
      "duFind": "المطلوب: {item}",
      "duYouWon": "كنت الأسرع!",
      "duTheyWon": "الأسرع: {name}",
      "duWrong": "صورة خاطئة — خسارة هذه الجولة",
      "duNobody": "لم يجدها أحد في الوقت المحدد",
      "duScore": "أنت {you} : {them} {name}",
      "duFinalWin": "فوز! نظرك حادّ اليوم.",
      "duFinalLose": "الفوز هذه المرة من نصيب {name} — جولة أخرى؟",
      "duFinalDraw": "تعادل — أنتما على المستوى نفسه!",
      "duSeconds": "{s} ث",
      "featDuel": "مبارزة مباشرة «مَن الأسرع» — العثور على الصورة أولًا",
      "whoTitle": "مَن منّا؟",
      "whoNote": "لعبة مباشرة لشخصين: سؤال واحد، والإجابة بلمس «أنا» أو اسم الطرف الآخر. لنرَ هل تتفقان في رأيكما عن بعضكما.",
      "whoShareText": "دعوة من {name} إلى اللعبة المباشرة «مَن منّا؟»",
      "whoJoinLead": "{name} بانتظارك. لنُجِب بصدق ثم نقارن!",
      "whoRound": "السؤال {n} من {total}",
      "whoMe": "أنا",
      "whoAgree": "اتفقتما: {name}",
      "whoDiffer": "الآراء مختلفة — تحدّثا في الأمر!",
      "whoFinal": "اتفقتما {score} مرة من {total}",
      "whoFinalHigh": "كم تعرفان بعضكما جيدًا!",
      "whoFinalMid": "هناك الكثير للحديث عنه — وهذا جميل",
      "featWho": "لعبة مباشرة «مَن منّا؟» — هل تتفقان؟",
      "phTitle": "إكمال الجملة",
      "phNote": "لعبة مباشرة لشخصين: يُكمل كلٌّ منكما الجملة الدافئة نفسها بكلماته، ثم تقرآن إجابات بعضكما.",
      "phShareText": "دعوة من {name} إلى اللعبة المباشرة «إكمال الجملة»",
      "phJoinLead": "{name} بانتظارك. لنُكمل كل جملة بكلماتنا!",
      "phRound": "الجملة {n} من {total}",
      "phPlaceholder": "تكملتك…",
      "phDone": "تم",
      "phWaiting": "بانتظار {name}…",
      "phSkipped": "لا إجابة",
      "phSave": "حفظ في «كتابنا»",
      "phSaved": "تم الحفظ في «كتابنا»",
      "phForbidden": "يُرجى الكتابة دون روابط أو كلمات مسيئة.",
      "phNext": "الجملة التالية",
      "phFinal": "جُمل أكملناها معًا: {count}",
      "phFinalLead": "يمكن حفظ الإجابات المفضلة في «كتابنا».",
      "featPhrase": "لعبة مباشرة «إكمال الجملة» مع «كتابنا»",
      "bookTitle": "كتابنا",
      "bookNote": "أدفأ الإجابات من «إكمال الجملة»، محفوظة في حسابك.",
      "bookOpen": "فتح الكتاب",
      "bookEmpty": "الكتاب فارغ حاليًا. بعد لعب «إكمال الجملة» يمكن حفظ الإجابات المفضلة هنا.",
      "bookDelete": "حذف",
      "bookDeleteConfirm": "حذف هذه الصفحة من الكتاب؟",
      "bookYou": "أنت",
      "inviteTitle": "دعوة صديق",
      "inviteNote": "ستصل إلى صديقك رسالة فيها اللعبة.",
      "invite": "دعوة",
      "invited": "تمت الدعوة",
      "inviteNone": "بعد إضافة أصدقاء في قسم «الأصدقاء» يمكن دعوتهم بلمسة واحدة.",
      "inviteSent": "أُرسلت الدعوة إلى {name}"
    },
    "questions": {
      "q01": [
        "فصلي المفضل؟",
        "الربيع",
        "الصيف",
        "الخريف",
        "الشتاء"
      ],
      "q02": [
        "ماذا أختار للفطور؟",
        "قهوة وكرواسون",
        "عصيدة",
        "بيض",
        "شاي فقط"
      ],
      "q03": [
        "يوم عطلتي المثالي؟",
        "في البيت تحت بطانية",
        "نزهة في الحديقة",
        "رحلة خارج المدينة",
        "وقت مع الأصدقاء"
      ],
      "q04": [
        "إلى أين أحلم بالسفر؟",
        "إلى البحر",
        "إلى الجبال",
        "إلى مدينة كبيرة",
        "إلى بيت دافئ في الريف"
      ],
      "q05": [
        "آيس كريمي المفضل؟",
        "الفانيليا",
        "الشوكولاتة",
        "الفراولة",
        "الفستق"
      ],
      "q06": [
        "ما الذي يسعدني بسرعة؟",
        "عناق",
        "مفاجأة",
        "كلمات دافئة",
        "شيء لذيذ"
      ],
      "q07": [
        "أنا في الغالب…",
        "من محبي الصباح الباكر",
        "من محبي السهر",
        "أنام كلما سنحت الفرصة",
        "أحب قيلولة الظهيرة"
      ],
      "q08": [
        "أي فيلم أختار الليلة؟",
        "كوميديا",
        "قصة رومانسية",
        "فيلم غموض",
        "رسوم متحركة"
      ],
      "q09": [
        "لوني المفضل؟",
        "الأحمر",
        "الأزرق",
        "الأخضر",
        "الوردي"
      ],
      "q10": [
        "ممَّ أخاف أكثر؟",
        "العناكب",
        "المرتفعات",
        "الظلام",
        "التأخر"
      ],
      "q11": [
        "أي الزهور أحب؟",
        "الورد",
        "التوليب",
        "الفاوانيا",
        "الأقحوان"
      ],
      "q12": [
        "ماذا أفعل حين أحزن؟",
        "أتصل بشخص قريب",
        "آكل شيئًا حلوًا",
        "أخرج للمشي",
        "أخلد إلى النوم"
      ],
      "q13": [
        "أي حيوان هو الأقرب إلى قلبي؟",
        "قطة صغيرة",
        "كلب",
        "دبدوب صغير",
        "ثعلب صغير"
      ],
      "q14": [
        "أجمل هدية لي؟",
        "شيء مصنوع باليد",
        "رحلة",
        "قطعة حُليّ",
        "كتاب"
      ],
      "q15": [
        "مشروبي المفضل؟",
        "شاي أسود",
        "شاي أخضر",
        "قهوة",
        "كاكاو ساخن"
      ],
      "q16": [
        "وجبتي الخفيفة المفضلة؟",
        "الشوكولاتة",
        "رقائق البطاطا",
        "الفاكهة",
        "قطعة حلوى"
      ],
      "q17": [
        "ماذا أختار في السفر؟",
        "المتاحف",
        "الشاطئ",
        "المطبخ المحلي",
        "التجول بلا خطة"
      ],
      "q18": [
        "كيف أحب أن أقضي المساء؟",
        "مع كتاب",
        "مع مسلسل",
        "في الحديث",
        "في نزهة"
      ],
      "q19": [
        "أي طقس أحب أكثر؟",
        "الشمس",
        "مطر دافئ",
        "تساقط الثلج",
        "نسيم خفيف"
      ],
      "q20": [
        "أي قوة خارقة تناسبني؟",
        "الطيران",
        "قراءة الأفكار",
        "إيقاف الوقت",
        "الانتقال الفوري"
      ],
      "q21": [
        "ما أهم شيء عندي في المقرّبين؟",
        "الثقة",
        "الاهتمام",
        "روح الدعابة",
        "الدعم"
      ],
      "q22": [
        "أي مناسبة أنتظرها أكثر؟",
        "رأس السنة",
        "عيد ميلادي",
        "عطلة الصيف",
        "عيد الحب"
      ],
      "q23": [
        "كيف أقول «أحبك» غالبًا؟",
        "بالكلمات",
        "بالأفعال",
        "بالعناق",
        "بالهدايا"
      ],
      "q24": [
        "ماذا أطلب في المقهى؟",
        "باستا",
        "سوشي",
        "سلطة",
        "حلوى"
      ],
      "q25": [
        "وقتي المفضل من اليوم؟",
        "الصباح",
        "الظهيرة",
        "المساء",
        "الليل"
      ],
      "q26": [
        "أي مطبخ أختار؟",
        "الإيطالي",
        "الياباني",
        "الطبخ المنزلي",
        "المكسيكي"
      ],
      "q27": [
        "أين أفكر بشكل أفضل؟",
        "تحت الدش",
        "أثناء المشي",
        "في الطريق",
        "قبل النوم"
      ],
      "q28": [
        "ماذا أفعل أولًا في الصباح؟",
        "أنظر إلى الهاتف",
        "أشرب الماء",
        "أحضّر القهوة",
        "أبقى في السرير قليلًا"
      ],
      "q29": [
        "فاكهتي المفضلة؟",
        "التفاح",
        "الموز",
        "المانجو",
        "البطيخ"
      ],
      "q30": [
        "أي هواية تناسبني أكثر؟",
        "الرسم",
        "الطبخ",
        "الرياضة",
        "القراءة"
      ],
      "q31": [
        "كيف أحب أن أحتفل بعيد ميلادي؟",
        "بحفلة كبيرة",
        "بعشاء لشخصين",
        "برحلة",
        "بأمسية هادئة في البيت"
      ],
      "q32": [
        "ما رأيي في المفاجآت؟",
        "أحبها كثيرًا",
        "تربكني قليلًا",
        "أحب أن أعدّها للآخرين",
        "أفضّل أن أعرف مسبقًا"
      ],
      "q33": [
        "أي حلوى أفضّل؟",
        "الكعك",
        "الآيس كريم",
        "البسكويت",
        "السكاكر"
      ],
      "q34": [
        "ماذا آخذ إلى جزيرة مهجورة؟",
        "كتابًا",
        "هاتفي",
        "بطانية",
        "كاميرا"
      ],
      "q35": [
        "كيف أرتاح بعد يوم صعب؟",
        "حمام دافئ",
        "مسلسل",
        "نزهة",
        "حديث مع شخص قريب"
      ],
      "q36": [
        "أي وسيلة تنقل أحب أكثر؟",
        "القطار",
        "الطائرة",
        "السيارة",
        "الدراجة"
      ],
      "q37": [
        "لعبتي المفضلة في الطفولة؟",
        "الغميضة",
        "المطاردة",
        "المكعبات",
        "الرسم"
      ],
      "q38": [
        "أي حكاية تشبهني أكثر؟",
        "سندريلا",
        "الأمير الصغير",
        "ويني الدبدوب",
        "أليس في بلاد العجائب"
      ],
      "q39": [
        "كيف أُسعد شخصًا عزيزًا؟",
        "بمفاجأة",
        "ببطاقة",
        "برحلة",
        "بعشاء"
      ],
      "q40": [
        "ماذا أصوّر أكثر؟",
        "نفسي",
        "الطبيعة",
        "الطعام",
        "نادرًا ما أصوّر"
      ],
      "q41": [
        "مكاني المفضل في البيت؟",
        "السرير",
        "المطبخ",
        "الأريكة",
        "الشرفة"
      ],
      "q42": [
        "ما أول ما ألاحظه في الشخص؟",
        "الابتسامة",
        "العينان",
        "الصوت",
        "روح الدعابة"
      ],
      "q43": [
        "ما الذي يضحكني بسرعة؟",
        "مقاطع مضحكة",
        "نكات المقرّبين",
        "المواقف المحرجة",
        "الحيوانات"
      ],
      "q44": [
        "ماذا أشرب في يوم صيفي حار؟",
        "ليموناضة",
        "شاي مثلّج",
        "عصير",
        "ماء بالثلج"
      ],
      "q45": [
        "أي عنصر هو الأقرب إليّ؟",
        "الماء",
        "النار",
        "التراب",
        "الهواء"
      ],
      "q46": [
        "أي قصص أحب؟",
        "المغامرات",
        "قصص الحب",
        "الخيال العلمي",
        "القصص الحقيقية"
      ],
      "q47": [
        "كيف أقضي يومًا ممطرًا؟",
        "أقرأ",
        "أنام",
        "أشاهد فيلمًا",
        "أتمشى تحت المظلة"
      ],
      "q48": [
        "ما أكثر ما أقدّره في الهدية؟",
        "الاهتمام",
        "الفائدة",
        "الجمال",
        "المفاجأة"
      ],
      "q49": [
        "أي بطاطا أختار؟",
        "مهروسة",
        "مقلية",
        "مشوية في الفرن",
        "رقائق"
      ],
      "q50": [
        "إلى أين أذهب أولًا في مدينة جديدة؟",
        "إلى مقهى",
        "إلى متحف",
        "إلى حديقة",
        "للتسوق"
      ],
      "q51": [
        "ماذا أفعل حين لا أستطيع النوم؟",
        "أقرأ",
        "أتصفح الهاتف",
        "أعدّ الخراف",
        "أشرب حليبًا دافئًا"
      ],
      "q52": [
        "كيف أستعد ليوم مهم؟",
        "أخطط لكل شيء مسبقًا",
        "أؤجل إلى اللحظة الأخيرة",
        "أطلب المساعدة",
        "أقلق ولا أنام"
      ],
      "q53": [
        "أي رياضة أحب مشاهدتها؟",
        "كرة القدم",
        "التنس",
        "التزلج الفني",
        "لا أشاهد الرياضة"
      ],
      "q54": [
        "أي حيوان أليف يناسبني؟",
        "قطة",
        "كلب",
        "ببغاء",
        "هامستر"
      ],
      "q55": [
        "ما نوع الرسائل التي أكتبها؟",
        "طويلة",
        "قصيرة",
        "مليئة بالرموز التعبيرية",
        "رسائل صوتية"
      ],
      "q56": [
        "أي هدية احتفظت بها أطول مدة؟",
        "رسالة",
        "لعبة",
        "صورة",
        "قطعة حُليّ"
      ],
      "q57": [
        "ماذا أختار على الأرجح؟",
        "شاي قرب المدفأة",
        "نزهة على العشب",
        "مشي على شاطئ البحر",
        "السينما"
      ],
      "q58": [
        "أي مديح يسعدني أكثر؟",
        "عن مظهري",
        "عن ذكائي",
        "عن طيبتي",
        "عن روح الدعابة"
      ],
      "q59": [
        "صباحي المثالي؟",
        "فطور في السرير",
        "ركض مبكر",
        "نوم طويل",
        "قهوة في الشرفة"
      ],
      "q60": [
        "ماذا أريد أن أتعلم؟",
        "الرقص",
        "الطبخ",
        "لغة جديدة",
        "الرسم"
      ]
    },
    "yesNo": {
      "c01": [
        "هل تشتاق إليّ الآن؟",
        "شوق كبير إليك",
        "صبر، لكن التفكير فيك لا يتوقف"
      ],
      "c02": [
        "هل تبتسم حين ترى رسالتي؟",
        "ابتسامة في كل مرة",
        "ابتسامة خفية في القلب"
      ],
      "c03": [
        "هل تتذكر لقاءنا الأول؟",
        "كل دقيقة محفوظة في الذاكرة",
        "الأهم محفوظ — أنت"
      ],
      "c04": [
        "هل تريد عناقًا اليوم؟",
        "انتظار لعناقك",
        "العناق مؤجَّل لوقت لاحق"
      ],
      "c05": [
        "هل نذهب معًا إلى البحر؟",
        "الحقيبة تُحزم الآن",
        "حنين إلى الجبال"
      ],
      "c06": [
        "هل أُضحكك؟",
        "ضحك من القلب",
        "ابتسامة مخبّأة"
      ],
      "c07": [
        "هل تشعر بالسكينة معي؟",
        "سكينة إلى جانبك",
        "مرح ومتعة معك"
      ],
      "c08": [
        "هل تفكر فيّ خلال النهار؟",
        "تفكير فيك كثيرًا جدًا",
        "تفكير فيك في هذه اللحظة"
      ],
      "c09": [
        "هل تحب مفاجآتي؟",
        "حب كبير لمفاجآتك",
        "الأجمل أن تكون قريبًا فقط"
      ],
      "c10": [
        "هل نخبز فطيرة معًا؟",
        "المريلة جاهزة بالفعل",
        "شراء كعكة أفضل"
      ],
      "c11": [
        "هل نشاهد فيلمًا الليلة؟",
        "اختيار الفيلم جارٍ",
        "رغبة في الحديث فقط"
      ],
      "c12": [
        "هل يعجبك صوتي؟",
        "استماع بلا نهاية",
        "ضحكتك أجمل"
      ],
      "c13": [
        "هل نقوم بنزهة في عطلة الأسبوع؟",
        "البساط يُجهَّز",
        "دعوة إلى مقهى دافئ"
      ],
      "c14": [
        "هل تريد رسالة مني؟",
        "انتظار لرسالتك",
        "الأفضل أن يُقال كل شيء وجهًا لوجه"
      ],
      "c15": [
        "هل أنا مهم بالنسبة إليك؟",
        "مهم جدًا",
        "أكثر مما تظن"
      ],
      "c16": [
        "هل نتمشى تحت المطر؟",
        "مظلة تتسع لاثنين",
        "شاي في البيت أفضل"
      ],
      "c17": [
        "هل نحن متشابهان؟",
        "كأنكما نصفان لواحد",
        "تكملان بعضكما تمامًا"
      ],
      "c18": [
        "هل يعجبك طبخي؟",
        "طلب لطبق آخر",
        "الطبخ معك هو الأجمل"
      ],
      "c19": [
        "هل نقتني حيوانًا أليفًا معًا؟",
        "اختيار الاسم جارٍ",
        "دبدوب محشو يكفي الآن"
      ],
      "c20": [
        "هل تعرف ما أحب؟",
        "معرفة عن ظهر قلب",
        "رغبة في معرفة المزيد"
      ],
      "c21": [
        "هل نرقص؟",
        "اليد ممدودة إليك",
        "تصفيق وتشجيع"
      ],
      "c22": [
        "هل أُلهمك؟",
        "إلهام كل يوم",
        "دفء بسيط إلى جانبك"
      ],
      "c23": [
        "هل تحتفظ بصورنا؟",
        "كل صورة محفوظة بعناية",
        "انتظار لصور جديدة أجمل"
      ],
      "c24": [
        "هل نشاهد شروق الشمس معًا؟",
        "المنبّه مضبوط",
        "الغروب أجمل"
      ],
      "c25": [
        "هل تخبرني بسر؟",
        "همسة في أذنك",
        "ليبقَ لغزًا"
      ],
      "c26": [
        "هل تؤمن بي؟",
        "إيمان كبير بك",
        "تشجيع لك كل يوم"
      ],
      "c27": [
        "هل نسافر نحن الاثنين فقط؟",
        "حلم جميل",
        "الأحبة جميعًا معنا"
      ],
      "c28": [
        "هل تنتظر اتصالي؟",
        "انتظار بابتسامة",
        "زيارتك أجمل من اتصال"
      ],
      "c29": [
        "هل تعجبك أحضاني؟",
        "الأدفأ في العالم",
        "حب لتشابك الأيدي"
      ],
      "c30": [
        "هل نقرأ لبعضنا بصوت عالٍ؟",
        "اختيار الكتاب جارٍ",
        "الاستماع إليك أجمل"
      ],
      "c31": [
        "هل نلتقط صورة معًا اليوم؟",
        "بحث عن خلفية جميلة",
        "الحديث أولًا"
      ],
      "c32": [
        "هل أُحسّن مزاجك؟",
        "دائمًا",
        "معك حتى الحزن أخف"
      ],
      "c33": [
        "هل نتناول الفطور معًا غدًا؟",
        "الكاكاو يُحضَّر الآن",
        "حلم بنوم أطول"
      ],
      "c34": [
        "هل تتذكر عيد ميلادي؟",
        "دون أي تذكير",
        "مفاجأة تُحضَّر سرًا"
      ],
      "c35": [
        "هل نذهب للتزلج على الجليد؟",
        "الزلاجات جاهزة",
        "تشجيع لك من جانب الحلبة"
      ],
      "c36": [
        "هل يومك جميل اليوم؟",
        "يوم رائع",
        "سيصبح أجمل بقربك"
      ],
      "c37": [
        "هل ترسم صورتي؟",
        "القلم في اليد",
        "رسم قلب صغير"
      ],
      "c38": [
        "هل نزرع شجرة معًا؟",
        "اختيار المكان جارٍ",
        "البداية بزهرة على النافذة"
      ],
      "c39": [
        "هل تريد سماع إطراء؟",
        "انتظار بشوق",
        "خجل، لكن مع رغبة كبيرة"
      ],
      "c40": [
        "هل نلعب مرة أخرى لاحقًا؟",
        "جولة أخرى من فضلك",
        "العناق أجمل من اللعب"
      ]
    },
    "loves": {
      "s01": [
        "أين نقضي العطلة؟",
        "الشاطئ",
        "الجبال",
        "السفر",
        "وقت هادئ وحدي"
      ],
      "s02": [
        "الأمسية المثالية؟",
        "فيلم في البيت",
        "نزهة",
        "مطعم",
        "ألعاب لوحية"
      ],
      "s03": [
        "الطقس المفضل؟",
        "الشمس",
        "المطر",
        "الثلج",
        "ليلة مليئة بالنجوم"
      ],
      "s04": [
        "الحيوان المفضل؟",
        "قطة صغيرة",
        "جرو",
        "حصان",
        "دلفين"
      ],
      "s05": [
        "ماذا نأكل على العشاء؟",
        "بيتزا",
        "سوشي",
        "حلويات",
        "شواء"
      ],
      "s06": [
        "المشروب المفضل؟",
        "قهوة",
        "شاي",
        "كاكاو ساخن",
        "ليموناضة"
      ],
      "s07": [
        "الفصل المفضل؟",
        "الربيع",
        "الصيف",
        "الخريف",
        "الشتاء"
      ],
      "s08": [
        "الزهور المفضلة؟",
        "الورد",
        "التوليب",
        "عباد الشمس",
        "اللافندر"
      ],
      "s09": [
        "كيف نسترخي؟",
        "مع كتاب",
        "بالرسم",
        "على الدراجة",
        "قيلولة في الأرجوحة"
      ],
      "s10": [
        "كيف نسافر؟",
        "بالقطار",
        "بالطائرة",
        "بالسيارة",
        "بالسفينة"
      ],
      "s11": [
        "بيت الأحلام؟",
        "شقة في المدينة",
        "بيت على البحر",
        "كوخ في الجبال",
        "مزرعة"
      ],
      "s12": [
        "شيء حلو؟",
        "آيس كريم",
        "شوكولاتة",
        "كعكة",
        "فاكهة"
      ],
      "s13": [
        "الصباح المثالي؟",
        "فطور في السرير",
        "ركض",
        "نوم طويل",
        "قهوة في الشرفة"
      ],
      "s14": [
        "موعد الأحلام؟",
        "نزهة",
        "حلبة تزلج",
        "مدينة ملاهٍ",
        "نجوم على السطح"
      ],
      "s15": [
        "أجمل هدية؟",
        "باقة زهور",
        "رسالة",
        "رحلة",
        "صندوق هدية"
      ],
      "s16": [
        "الطبيعة المفضلة؟",
        "البحر",
        "الغابة",
        "الصحراء",
        "الشفق القطبي"
      ]
    },
    "who": [
      "مَن منّا يتأخر أكثر؟",
      "مَن منّا يبادر بالصلح أولًا؟",
      "مَن منّا يطبخ أفضل؟",
      "مَن منّا يضحك أكثر؟",
      "مَن منّا يستغرق وقتًا أطول في الاستعداد؟",
      "مَن منّا يُضيّع المفاتيح أكثر؟",
      "مَن منّا يتذكر التواريخ المهمة أفضل؟",
      "مَن منّا يحب الحلويات أكثر؟",
      "مَن منّا ينام أولًا؟",
      "مَن منّا يستيقظ أبكر؟",
      "مَن منّا يقول «اشتقت إليك» أكثر؟",
      "مَن منّا يختار الهدايا أفضل؟",
      "مَن منّا يمزح أكثر؟",
      "مَن منّا يقود السيارة أفضل؟",
      "مَن منّا يتحدث على الهاتف وقتًا أطول؟",
      "مَن منّا يحب السفر أكثر؟",
      "مَن منّا يتضايق بسرعة أكبر؟",
      "مَن منّا يسامح أسرع؟",
      "مَن منّا يلتقط صورًا أكثر؟",
      "مَن منّا يُحسن إدارة المال أكثر؟",
      "مَن منّا يشتري أشياء لا نحتاجها أكثر؟",
      "مَن منّا أبرع في المواساة؟",
      "مَن منّا أهدأ في اللحظات الصعبة؟",
      "مَن منّا يبحث عن هاتفه دائمًا؟",
      "مَن منّا يحب استقبال الضيوف أكثر؟",
      "مَن منّا يُعدّ الفطور أكثر؟",
      "مَن منّا يعرف الطريق أفضل في مدينة جديدة؟",
      "مَن منّا يكتب رسائل أطول؟",
      "مَن منّا يقترح التنزه أولًا؟",
      "مَن منّا يحب الحيوانات أكثر؟",
      "مَن منّا يحفظ الأسرار أفضل؟",
      "مَن منّا يستغرق وقتًا أطول في اختيار الطعام من القائمة؟",
      "مَن منّا يقلق على الأحبة أكثر؟",
      "مَن منّا يصنع مفاجآت أكثر؟",
      "مَن منّا أكثر ترتيبًا؟",
      "مَن منّا يلاحظ تسريحة الشعر الجديدة أولًا؟",
      "مَن منّا يتذكر القصص المضحكة أكثر؟",
      "مَن منّا أكثر صبرًا؟",
      "مَن منّا يقول «شكرًا» أكثر؟",
      "مَن منّا يعرض المساعدة أولًا؟"
    ],
    "phrases": [
      "أبتسم عندما…",
      "يومي المفضل معك هو…",
      "شكرًا لك على…",
      "عندما أحزن، يساعدني…",
      "يومًا ما أريد أن نقوم معًا بـ…",
      "أدفأ ذكرى لنا هي…",
      "لا أحد يُتقن مثلك…",
      "أشعر بالطمأنينة عندما…",
      "لو كان لدينا يوم كامل فارغ، لكنّا…",
      "يملؤني الفخر بك لأن…",
      "أمسيتنا المثالية هي…",
      "لن أنسى أبدًا كيف…",
      "تعجبني منك كلمة…",
      "في العام القادم أتمنى لنا أن…",
      "بالنسبة لي، أنت مثل…",
      "أجمل هدية منك هي…",
      "أشتاق إليك عندما…",
      "نكون في أطرف حالاتنا عندما…",
      "منذ زمن أريد أن أقول لك…",
      "مكاننا هو…",
      "عندما أفكر فيك، أنا…",
      "يصبح يومي أجمل عندما…",
      "تعجبني عادتنا في…",
      "أمنيتي لنا: …",
      "أطرف ما حدث لنا هو…",
      "أشعر باهتمامك بي عندما…",
      "الصباح معك هو…",
      "لو كنّا كلمة واحدة، لكانت…",
      "أريد أن أتعلم منك كيف…",
      "شكرًا لأنك دائمًا…"
    ]
  },
  "ind": {
    "text": {
      "homeLink": "Game berdua",
      "eyebrow": "GLOWLETTER · GAME BERDUA",
      "title": "Main bersama",
      "close": "Tutup",
      "lead": "Kirim game kepada orang tersayang. Bermain lewat tautan gratis dan tanpa akun.",
      "quizTitle": "Seberapa kenal kamu denganku?",
      "quizNote": "Jawab pertanyaan tentang dirimu, lalu biarkan orang terdekat menebak. Hasilnya kembali kepadamu.",
      "create": "Buat kuis",
      "soon": "Segera",
      "soonTitle": "Game lain sedang disiapkan",
      "duel": "Duel «Siapa paling cepat»",
      "loves": "Yang kita sukai",
      "cards": "Kartu ingatan berdua",
      "who": "Siapa di antara kita?",
      "phrase": "Lengkapi kalimat",
      "myQuizzes": "Kuis saya",
      "noQuizzes": "Belum ada kuis. Kuis pertama bisa dibuat dalam beberapa menit.",
      "forWhom": "Untuk {name}",
      "noRecipient": "Kuis",
      "resultsCount": "Hasil: {count}",
      "newResults": "Baru: {count}",
      "noResults": "Belum ada yang bermain.",
      "anonymous": "Tanpa nama",
      "results": "Hasil",
      "copyLink": "Salin tautan",
      "share": "Kirim",
      "deleteQuiz": "Hapus kuis",
      "deleteConfirm": "Hapus kuis ini beserta hasilnya? Tautan tidak akan berfungsi lagi.",
      "deleted": "Kuis dihapus",
      "linkCopied": "Tautan disalin",
      "back": "Kembali",
      "next": "Lanjut",
      "stepNames": "Langkah 1 dari 2 · Nama",
      "yourName": "Namamu",
      "yourNamePlaceholder": "Siapa namamu",
      "recipient": "Untuk siapa · opsional",
      "recipientPlaceholder": "Nama orang tersayang",
      "nameRequired": "Tulis namamu.",
      "forbiddenName": "Tulis nama yang biasa.",
      "stepAnswers": "Langkah 2 dari 2 · Jawabanmu",
      "answersLead": "Tandai yang benar tentang dirimu. Setiap pertanyaan bisa diganti.",
      "swap": "Pertanyaan lain",
      "progress": "{done} dari {total} terjawab",
      "answerAll": "Pilih jawaban untuk setiap pertanyaan.",
      "finish": "Dapatkan tautan",
      "creating": "Membuat kuis…",
      "createdTitle": "Kuismu sudah siap!",
      "createdLead": "Kirim tautannya. Setelah dijawab, hasilnya muncul di «Kuis saya».",
      "shareText": "{name} mengajakmu bermain «Seberapa kenal kamu denganku?»",
      "signInTitle": "Perlu masuk akun",
      "signInNote": "Kuis disimpan di akunmu agar hasilnya sampai kepadamu.",
      "signIn": "Masuk",
      "premiumNote": "Membuat game termasuk akses penuh. Bermain lewat tautan gratis untuk semua.",
      "failed": "Tidak berhasil. Periksa koneksi lalu coba lagi.",
      "rateLimited": "Terlalu banyak percobaan. Coba lagi nanti.",
      "playEyebrow": "GAME BERDUA",
      "playInvite": "{name} mengajakmu bermain",
      "playLead": "Pertanyaan: {count}. Tebak jawabannya — di akhir kamu akan melihat berapa yang cocok.",
      "playName": "Namamu · opsional",
      "playNamePlaceholder": "Supaya mereka tahu ini kamu",
      "start": "Mulai",
      "playLoading": "Memuat game…",
      "playMissing": "Game ini tidak tersedia: tautan dihapus atau sudah kedaluwarsa.",
      "playOffline": "Game ini membutuhkan internet.",
      "retry": "Coba lagi",
      "questionOf": "Pertanyaan {n} dari {total}",
      "asks": "{name} bertanya",
      "counting": "Menghitung jawaban yang cocok…",
      "scoreOf": "{score} dari {total}",
      "tierAll": "Sempurna! Kalian saling mengenal lebih baik dari siapa pun",
      "tierHigh": "Kalian sangat saling mengenal",
      "tierMid": "Lumayan! Masih ada yang bisa dikenali",
      "tierLow": "Banyak penemuan indah menanti kalian",
      "sentTo": "{name} akan melihat hasilmu",
      "review": "Jawabanmu",
      "rightAnswer": "Jawaban benar",
      "makeOwn": "Buat kuisku sendiri",
      "home": "Beranda",
      "resultToast": "{name}: {score} dari {total} di «Seberapa kenal kamu denganku?»",
      "ownerAnswers": "Jawaban pembuat",
      "playerAnswers": "Jawaban {name}",
      "paywallTitle": "Game, hiburan<br><em>dan surat</em>",
      "groupGames": "Game",
      "groupFun": "Hiburan",
      "groupLetters": "Surat",
      "featQuiz": "«Seberapa kenal kamu denganku?» — hasilnya kembali kepadamu",
      "featGamesSoon": "Duel «Siapa paling cepat», «Yang kita sukai», kartu ingatan bergambar beruang",
      "featFunSoon": "«Siapa di antara kita?» dan «Lengkapi kalimat» dengan buku pasangan",
      "featCollection": "Seluruh koleksi surat dan puisi dalam 25 bahasa",
      "featMoments": "Momen, pengingat, dan surat QR yang terbuka di hari yang tepat",
      "featAudio": "Audiomu sendiri di surat dan balasan dari penerima",
      "ynTitle": "Ya atau tidak",
      "ynNote": "Game langsung berdua: 5 detik untuk setiap kartu. Yang menjawab tepat waktu bisa melihat jawaban pasangannya.",
      "ynCreate": "Buat ruang",
      "ynWaiting": "Menunggu {name} membuka tautan…",
      "ynWaitingAny": "Menunggu pasangan…",
      "ynShareText": "{name} mengajakmu bermain game langsung «Ya atau tidak»",
      "ynPartnerHere": "{name} sudah datang!",
      "ynStart": "Mulai game",
      "ynWaitHost": "{name} akan segera memulai game",
      "ynYes": "Ya",
      "ynNo": "Tidak",
      "ynMissed": "Terlambat — kartu ini tetap tertutup",
      "ynMatch": "Jawabannya sama!",
      "ynRound": "Kartu {n} dari {total}",
      "ynAnswered": "Jawaban terkirim, menunggu pasangan…",
      "ynFinal": "{score} dari {total} sama",
      "ynFinalHigh": "Kalian saling mengerti tanpa kata",
      "ynFinalMid": "Begitu berbeda — dan begitu dekat",
      "ynAgain": "Main lagi",
      "ynLeft": "Pasangan terputus. Menunggu kembali…",
      "ynYou": "Kamu",
      "ynOffline": "Tidak bisa terhubung ke game. Periksa internet lalu buka tautan lagi.",
      "ynJoin": "Masuk ke game",
      "ynJoinLead": "{name} menunggumu. 5 detik untuk setiap jawaban!",
      "ynStepNames": "Namamu dan nama pasangan",
      "ynRoomReady": "Ruang sudah siap — kirim tautannya",
      "ynStayHere": "Biarkan layar ini terbuka: game dimulai saat tautan dibuka.",
      "featYesNo": "Game langsung «Ya atau tidak» — 5 detik per jawaban",
      "ynPartnerMissed": "Tidak ada jawaban — waktu habis",
      "lvTitle": "Yang kita sukai",
      "lvNote": "Game langsung berdua: 4 gambar, 10 detik untuk memilih yang paling kamu sukai. Boleh memilih yang sama!",
      "lvShareText": "{name} mengajakmu bermain game langsung «Yang kita sukai»",
      "lvJoinLead": "{name} menunggumu. Pilih gambar yang paling kamu sukai!",
      "lvRound": "Tema {n} dari {total}",
      "lvPick": "Pilih yang paling kamu sukai",
      "lvBoth": "Kalian berdua memilih: {item}",
      "lvCommon": "Yang kalian berdua sukai",
      "lvDiff": "Selera berbeda — makin seru!",
      "lvFinalHigh": "Kalian punya banyak kesamaan!",
      "lvFinalMid": "Begitu berbeda — dan saling melengkapi",
      "featLoves": "Game langsung «Yang kita sukai» — 4 gambar, pilih bersama",
      "featGamesSoon2": "Duel «Siapa paling cepat» dan kartu ingatan bergambar beruang",
      "mcTitle": "Kartu ingatan beruang",
      "mcNote": "Game ingatan langsung berdua: bergantian membuka dua kartu dan temukan pasangannya. Tiga level, dari 8 sampai 16 kartu.",
      "mcShareText": "{name} mengajakmu bermain game langsung «Kartu ingatan beruang»",
      "mcJoinLead": "{name} menunggumu. Temukan pasangan secara bergantian!",
      "mcLevel": "Level {n} dari {total}",
      "mcTurnYou": "Giliranmu — buka dua kartu",
      "mcTurnThem": "Giliran {name}",
      "mcPairs": "Pasangan ditemukan: {found} dari {total}",
      "mcLevelDone": "Semua pasangan ditemukan!",
      "mcTimeUp": "Waktu level ini habis",
      "mcNext": "Berikutnya: level {n}",
      "mcFinal": "Pasangan ditemukan: {found} dari {total}",
      "mcFinalHigh": "Tim yang hebat!",
      "mcFinalMid": "Permainan seru — sekali lagi?",
      "featCards": "Game langsung «Kartu ingatan beruang» — cari pasangan bersama",
      "featGamesSoon3": "Duel «Siapa paling cepat»",
      "duTitle": "Siapa lebih cepat",
      "duNote": "Duel langsung: satu kata dan empat gambar. Ketuk gambar yang benar lebih dulu — salah ketuk berarti kalah di ronde itu.",
      "duShareText": "{name} menantangmu dalam duel langsung “Siapa lebih cepat”",
      "duJoinLead": "{name} sedang menunggumu. Temukan gambar yang benar lebih cepat!",
      "duRound": "Ronde {n} dari {total}",
      "duFind": "Temukan: {item}",
      "duYouWon": "Kamu lebih cepat!",
      "duTheyWon": "{name} lebih cepat",
      "duWrong": "Gambar salah — ronde ini kalah",
      "duNobody": "Tidak ada yang menemukannya tepat waktu",
      "duScore": "Kamu {you} : {them} {name}",
      "duFinalWin": "Menang! Matamu jeli hari ini.",
      "duFinalLose": "Kali ini {name} menang — main lagi?",
      "duFinalDraw": "Seri — kalian seimbang!",
      "duSeconds": "{s} dtk",
      "featDuel": "Duel langsung “Siapa lebih cepat” — temukan gambarnya lebih dulu",
      "whoTitle": "Siapa di antara kita?",
      "whoNote": "Game langsung untuk berdua: satu pertanyaan, ketuk “Aku” atau nama pasanganmu. Lihat apakah pendapat kalian sama.",
      "whoShareText": "{name} mengajakmu main game langsung “Siapa di antara kita?”",
      "whoJoinLead": "{name} sedang menunggumu. Jawab dengan jujur — lalu bandingkan!",
      "whoRound": "Pertanyaan {n} dari {total}",
      "whoMe": "Aku",
      "whoAgree": "Kalian sepakat: {name}",
      "whoDiffer": "Pendapat kalian berbeda — coba bicarakan!",
      "whoFinal": "Kalian sepakat {score} dari {total} kali",
      "whoFinalHigh": "Kalian benar-benar saling mengenal!",
      "whoFinalMid": "Banyak yang bisa dibicarakan — dan itu menyenangkan",
      "featWho": "Game langsung “Siapa di antara kita?” — apakah kalian sepakat",
      "phTitle": "Lengkapi kalimat",
      "phNote": "Game langsung untuk berdua: kalian sama-sama melengkapi kalimat hangat yang sama dengan kata-kata sendiri, lalu saling membaca jawaban.",
      "phShareText": "{name} mengajakmu main game langsung “Lengkapi kalimat”",
      "phJoinLead": "{name} sedang menunggumu. Lengkapi setiap kalimat dengan kata-katamu sendiri!",
      "phRound": "Kalimat {n} dari {total}",
      "phPlaceholder": "Lanjutanmu…",
      "phDone": "Selesai",
      "phWaiting": "Menunggu {name}…",
      "phSkipped": "Tidak ada jawaban",
      "phSave": "Simpan ke Buku Berdua",
      "phSaved": "Tersimpan di Buku Berdua",
      "phForbidden": "Tulis tanpa tautan atau kata-kata kasar, ya.",
      "phNext": "Kalimat berikutnya",
      "phFinal": "Kalimat yang dilengkapi bersama: {count}",
      "phFinalLead": "Simpan jawaban favorit kalian ke Buku Berdua.",
      "featPhrase": "Game langsung “Lengkapi kalimat” dengan Buku Berdua",
      "bookTitle": "Buku Berdua",
      "bookNote": "Jawaban terhangat dari “Lengkapi kalimat”, tersimpan di akunmu.",
      "bookOpen": "Buka buku",
      "bookEmpty": "Bukunya masih kosong. Mainkan “Lengkapi kalimat” dan simpan jawaban yang kamu suka.",
      "bookDelete": "Hapus",
      "bookDeleteConfirm": "Hapus halaman ini dari buku?",
      "bookYou": "Kamu",
      "inviteTitle": "Ajak teman",
      "inviteNote": "Temanmu akan menerima pesan berisi game.",
      "invite": "Ajak",
      "invited": "Sudah diajak",
      "inviteNone": "Tambahkan teman di bagian “Teman” agar bisa mengajak mereka dengan sekali ketuk.",
      "inviteSent": "Undangan terkirim ke {name}"
    },
    "questions": {
      "q01": [
        "Musim favoritku?",
        "Musim semi",
        "Musim panas",
        "Musim gugur",
        "Musim dingin"
      ],
      "q02": [
        "Apa yang kupilih untuk sarapan?",
        "Kopi dan croissant",
        "Bubur",
        "Telur",
        "Teh saja"
      ],
      "q03": [
        "Hari libur sempurnaku?",
        "Di rumah di bawah selimut",
        "Jalan-jalan di taman",
        "Pergi ke luar kota",
        "Bersama teman-teman"
      ],
      "q04": [
        "Ke mana aku ingin pergi?",
        "Ke pantai",
        "Ke pegunungan",
        "Ke kota besar",
        "Ke rumah mungil yang nyaman di desa"
      ],
      "q05": [
        "Es krim favoritku?",
        "Vanila",
        "Cokelat",
        "Stroberi",
        "Pistachio"
      ],
      "q06": [
        "Apa yang paling cepat membuatku senang?",
        "Pelukan",
        "Kejutan",
        "Kata-kata hangat",
        "Sesuatu yang enak"
      ],
      "q07": [
        "Aku lebih seperti…",
        "Orang pagi",
        "Orang malam",
        "Tidur kapan pun bisa",
        "Suka tidur siang"
      ],
      "q08": [
        "Film apa yang kupilih malam ini?",
        "Komedi",
        "Kisah romantis",
        "Misteri",
        "Animasi"
      ],
      "q09": [
        "Warna favoritku?",
        "Merah",
        "Biru",
        "Hijau",
        "Merah muda"
      ],
      "q10": [
        "Apa yang paling kutakuti?",
        "Laba-laba",
        "Ketinggian",
        "Kegelapan",
        "Terlambat"
      ],
      "q11": [
        "Bunga apa yang kusukai?",
        "Mawar",
        "Tulip",
        "Peoni",
        "Aster"
      ],
      "q12": [
        "Apa yang kulakukan saat sedih?",
        "Menelepon orang terdekat",
        "Makan yang manis",
        "Jalan-jalan",
        "Tidur"
      ],
      "q13": [
        "Hewan apa yang paling mirip denganku?",
        "Anak kucing",
        "Anjing",
        "Anak beruang",
        "Rubah kecil"
      ],
      "q14": [
        "Hadiah terbaik untukku?",
        "Buatan tangan",
        "Perjalanan",
        "Perhiasan",
        "Buku"
      ],
      "q15": [
        "Minuman favoritku?",
        "Teh hitam",
        "Teh hijau",
        "Kopi",
        "Cokelat panas"
      ],
      "q16": [
        "Camilan favoritku?",
        "Cokelat",
        "Keripik",
        "Buah",
        "Kue"
      ],
      "q17": [
        "Apa yang kupilih saat bepergian?",
        "Museum",
        "Pantai",
        "Kuliner lokal",
        "Jalan-jalan tanpa rencana"
      ],
      "q18": [
        "Bagaimana aku suka menghabiskan malam?",
        "Dengan buku",
        "Dengan serial",
        "Mengobrol",
        "Berjalan-jalan"
      ],
      "q19": [
        "Cuaca apa yang paling kusukai?",
        "Cerah",
        "Hujan hangat",
        "Salju turun",
        "Angin sepoi-sepoi"
      ],
      "q20": [
        "Kekuatan super apa yang cocok untukku?",
        "Terbang",
        "Membaca pikiran",
        "Menghentikan waktu",
        "Teleportasi"
      ],
      "q21": [
        "Apa yang terpenting bagiku dari orang tersayang?",
        "Kepercayaan",
        "Perhatian",
        "Selera humor",
        "Dukungan"
      ],
      "q22": [
        "Perayaan apa yang paling kutunggu?",
        "Tahun Baru",
        "Ulang tahunku",
        "Liburan musim panas",
        "Hari Valentine"
      ],
      "q23": [
        "Bagaimana aku biasanya bilang «aku sayang kamu»?",
        "Dengan kata-kata",
        "Dengan tindakan",
        "Dengan pelukan",
        "Dengan hadiah"
      ],
      "q24": [
        "Apa yang kupesan di kafe?",
        "Pasta",
        "Sushi",
        "Salad",
        "Hidangan penutup"
      ],
      "q25": [
        "Waktu favoritku dalam sehari?",
        "Pagi",
        "Siang",
        "Sore",
        "Malam"
      ],
      "q26": [
        "Masakan apa yang kupilih?",
        "Italia",
        "Jepang",
        "Masakan rumah",
        "Meksiko"
      ],
      "q27": [
        "Di mana aku paling bisa berpikir?",
        "Saat mandi",
        "Saat jalan-jalan",
        "Di perjalanan",
        "Sebelum tidur"
      ],
      "q28": [
        "Apa yang pertama kulakukan di pagi hari?",
        "Melihat ponsel",
        "Minum air",
        "Membuat kopi",
        "Rebahan sebentar lagi"
      ],
      "q29": [
        "Buah favoritku?",
        "Apel",
        "Pisang",
        "Mangga",
        "Semangka"
      ],
      "q30": [
        "Hobi apa yang paling cocok untukku?",
        "Menggambar",
        "Memasak",
        "Olahraga",
        "Membaca"
      ],
      "q31": [
        "Bagaimana aku ingin merayakan ulang tahun?",
        "Pesta meriah",
        "Makan malam berdua",
        "Jalan-jalan",
        "Malam tenang di rumah"
      ],
      "q32": [
        "Bagaimana perasaanku tentang kejutan?",
        "Suka sekali",
        "Agak deg-degan",
        "Suka menyiapkannya untuk orang lain",
        "Lebih suka tahu sebelumnya"
      ],
      "q33": [
        "Makanan manis apa yang kusukai?",
        "Kue tart",
        "Es krim",
        "Biskuit",
        "Permen"
      ],
      "q34": [
        "Apa yang kubawa ke pulau terpencil?",
        "Buku",
        "Ponsel",
        "Selimut",
        "Kamera"
      ],
      "q35": [
        "Bagaimana aku bersantai setelah hari yang berat?",
        "Mandi air hangat",
        "Menonton serial",
        "Jalan-jalan",
        "Mengobrol dengan orang terdekat"
      ],
      "q36": [
        "Transportasi apa yang paling kusukai?",
        "Kereta",
        "Pesawat",
        "Mobil",
        "Sepeda"
      ],
      "q37": [
        "Permainan favoritku waktu kecil?",
        "Petak umpet",
        "Kejar-kejaran",
        "Balok susun",
        "Menggambar"
      ],
      "q38": [
        "Dongeng apa yang paling mirip denganku?",
        "Cinderella",
        "Pangeran Kecil",
        "Winnie the Pooh",
        "Alice di Negeri Ajaib"
      ],
      "q39": [
        "Bagaimana aku membahagiakan orang tersayang?",
        "Dengan kejutan",
        "Dengan kartu",
        "Dengan perjalanan",
        "Dengan makan malam"
      ],
      "q40": [
        "Apa yang paling sering kufoto?",
        "Diri sendiri",
        "Alam",
        "Makanan",
        "Hampir tidak pernah memotret"
      ],
      "q41": [
        "Tempat favoritku di rumah?",
        "Tempat tidur",
        "Dapur",
        "Sofa",
        "Balkon"
      ],
      "q42": [
        "Apa yang pertama kuperhatikan dari seseorang?",
        "Senyumnya",
        "Matanya",
        "Suaranya",
        "Selera humornya"
      ],
      "q43": [
        "Apa yang paling cepat membuatku tertawa?",
        "Video lucu",
        "Candaan orang tersayang",
        "Situasi canggung",
        "Hewan"
      ],
      "q44": [
        "Apa yang kuminum di hari yang panas?",
        "Limun",
        "Es teh",
        "Jus",
        "Air es"
      ],
      "q45": [
        "Elemen apa yang paling mirip denganku?",
        "Air",
        "Api",
        "Tanah",
        "Udara"
      ],
      "q46": [
        "Cerita apa yang kusukai?",
        "Petualangan",
        "Kisah cinta",
        "Fiksi ilmiah",
        "Kisah nyata"
      ],
      "q47": [
        "Bagaimana aku menghabiskan hari hujan?",
        "Membaca",
        "Tidur",
        "Menonton film",
        "Jalan-jalan berpayung"
      ],
      "q48": [
        "Apa yang paling kuhargai dari hadiah?",
        "Perhatiannya",
        "Kegunaannya",
        "Keindahannya",
        "Kejutannya"
      ],
      "q49": [
        "Kentang apa yang kupilih?",
        "Kentang tumbuk",
        "Kentang goreng",
        "Kentang panggang",
        "Keripik"
      ],
      "q50": [
        "Ke mana aku pergi pertama kali di kota baru?",
        "Ke kafe",
        "Ke museum",
        "Ke taman",
        "Belanja"
      ],
      "q51": [
        "Apa yang kulakukan saat tidak bisa tidur?",
        "Membaca",
        "Main ponsel",
        "Menghitung domba",
        "Minum susu hangat"
      ],
      "q52": [
        "Bagaimana aku bersiap untuk hari penting?",
        "Merencanakan semuanya lebih dulu",
        "Mengerjakan di menit terakhir",
        "Minta bantuan",
        "Gugup sampai tidak bisa tidur"
      ],
      "q53": [
        "Olahraga apa yang paling suka kutonton?",
        "Sepak bola",
        "Tenis",
        "Seluncur indah",
        "Tidak menonton olahraga"
      ],
      "q54": [
        "Hewan peliharaan apa yang cocok untukku?",
        "Kucing",
        "Anjing",
        "Burung beo",
        "Hamster"
      ],
      "q55": [
        "Pesan seperti apa yang kutulis?",
        "Panjang",
        "Pendek",
        "Penuh emoji",
        "Pesan suara"
      ],
      "q56": [
        "Hadiah apa yang paling lama kusimpan?",
        "Surat",
        "Mainan",
        "Foto",
        "Perhiasan"
      ],
      "q57": [
        "Mana yang lebih kupilih?",
        "Teh di dekat perapian",
        "Piknik di rumput",
        "Jalan-jalan di tepi laut",
        "Nonton di bioskop"
      ],
      "q58": [
        "Pujian apa yang paling membuatku senang?",
        "Tentang penampilan",
        "Tentang kecerdasan",
        "Tentang kebaikan",
        "Tentang selera humor"
      ],
      "q59": [
        "Pagi sempurnaku?",
        "Sarapan di tempat tidur",
        "Lari pagi",
        "Tidur panjang",
        "Kopi di balkon"
      ],
      "q60": [
        "Apa yang ingin kupelajari?",
        "Menari",
        "Memasak",
        "Bahasa baru",
        "Menggambar"
      ]
    },
    "yesNo": {
      "c01": [
        "Kamu kangen aku sekarang?",
        "kangen sekali",
        "menahan diri, tapi memikirkanmu"
      ],
      "c02": [
        "Kamu tersenyum saat melihat pesanku?",
        "selalu tersenyum",
        "tersenyum dalam hati"
      ],
      "c03": [
        "Ingat pertemuan pertama kita?",
        "ingat setiap menitnya",
        "ingat yang terpenting — kamu"
      ],
      "c04": [
        "Mau pelukan hari ini?",
        "menunggu pelukanmu",
        "menyimpan pelukan untuk nanti"
      ],
      "c05": [
        "Kita ke pantai bersama?",
        "sudah berkemas",
        "memimpikan gunung"
      ],
      "c06": [
        "Aku membuatmu tertawa?",
        "tertawa dari hati",
        "menyembunyikan senyum"
      ],
      "c07": [
        "Kamu merasa tenang bersamaku?",
        "merasa tenang di dekatmu",
        "senang bersamamu"
      ],
      "c08": [
        "Kamu memikirkanku di siang hari?",
        "sangat sering memikirkanmu",
        "sedang memikirkanmu sekarang"
      ],
      "c09": [
        "Kamu suka kejutanku?",
        "sangat suka kejutanmu",
        "paling suka saat kamu ada di dekat"
      ],
      "c10": [
        "Kita membuat pai bersama?",
        "sudah memakai celemek",
        "lebih suka membeli kue"
      ],
      "c11": [
        "Nonton film bersama malam ini?",
        "sudah memilih film",
        "lebih ingin mengobrol"
      ],
      "c12": [
        "Kamu suka suaraku?",
        "bisa mendengarnya tanpa henti",
        "lebih suka tawamu"
      ],
      "c13": [
        "Piknik akhir pekan ini?",
        "menyiapkan tikar",
        "mengajakmu ke kafe yang nyaman"
      ],
      "c14": [
        "Mau dapat surat dariku?",
        "menunggu suratmu",
        "ingin mendengar semuanya langsung"
      ],
      "c15": [
        "Aku penting bagimu?",
        "sangat penting",
        "lebih dari yang kamu kira"
      ],
      "c16": [
        "Jalan-jalan di bawah hujan?",
        "membawa payung untuk berdua",
        "lebih suka membuat teh di rumah"
      ],
      "c17": [
        "Kita mirip?",
        "kalian seperti dua belahan",
        "kalian saling melengkapi dengan sempurna"
      ],
      "c18": [
        "Kamu suka masakanku?",
        "minta tambah",
        "suka memasak bersamamu"
      ],
      "c19": [
        "Kita pelihara hewan bersama?",
        "sudah memilih nama",
        "untuk sekarang boneka beruang sudah cukup"
      ],
      "c20": [
        "Kamu tahu apa yang kusukai?",
        "hafal di luar kepala",
        "ingin tahu lebih banyak"
      ],
      "c21": [
        "Kita berdansa?",
        "sudah mengulurkan tangan",
        "akan bertepuk tangan"
      ],
      "c22": [
        "Aku menginspirasimu?",
        "menginspirasi setiap hari",
        "di dekatmu rasanya hangat"
      ],
      "c23": [
        "Kamu menyimpan foto-foto kita?",
        "menyimpan setiap foto dengan sayang",
        "menunggu foto baru yang lebih indah"
      ],
      "c24": [
        "Kita lihat matahari terbit bersama?",
        "sudah memasang alarm",
        "lebih suka matahari terbenam"
      ],
      "c25": [
        "Mau cerita satu rahasia?",
        "akan membisikkannya padamu",
        "biar tetap jadi misteri"
      ],
      "c26": [
        "Kamu percaya padaku?",
        "sangat percaya padamu",
        "menyemangatimu setiap hari"
      ],
      "c27": [
        "Kita bepergian berdua saja?",
        "memimpikannya",
        "akan mengajak semua orang tersayang"
      ],
      "c28": [
        "Kamu menunggu teleponku?",
        "menunggu sambil tersenyum",
        "lebih suka kamu datang berkunjung"
      ],
      "c29": [
        "Kamu suka pelukanku?",
        "paling hangat di dunia",
        "suka bergandengan tangan"
      ],
      "c30": [
        "Kita saling membacakan buku?",
        "sudah memilih buku",
        "lebih suka mendengarkanmu"
      ],
      "c31": [
        "Foto bersama hari ini?",
        "sudah mencari latar yang cantik",
        "mengobrol dulu"
      ],
      "c32": [
        "Aku membuat suasana hatimu lebih baik?",
        "selalu",
        "bersamamu, kesedihan pun terasa ringan"
      ],
      "c33": [
        "Sarapan bersama besok?",
        "sudah membuat cokelat panas",
        "ingin tidur lebih lama"
      ],
      "c34": [
        "Kamu ingat ulang tahunku?",
        "ingat tanpa diingatkan",
        "diam-diam menyiapkan kejutan"
      ],
      "c35": [
        "Kita main seluncur es?",
        "sudah mengeluarkan sepatu seluncur",
        "akan menyemangatimu dari pinggir"
      ],
      "c36": [
        "Hari ini hari yang baik untukmu?",
        "hari yang luar biasa",
        "akan lebih baik kalau kamu ada"
      ],
      "c37": [
        "Mau menggambar potretku?",
        "sudah memegang pensil",
        "akan menggambar hati kecil"
      ],
      "c38": [
        "Kita menanam pohon bersama?",
        "memilih tempatnya",
        "mulai dari bunga di jendela"
      ],
      "c39": [
        "Mau dengar pujian?",
        "tidak sabar",
        "malu tapi sangat ingin"
      ],
      "c40": [
        "Nanti main lagi?",
        "ingin satu ronde lagi",
        "lebih ingin berpelukan daripada main"
      ]
    },
    "loves": {
      "s01": [
        "Liburan ke mana?",
        "Pantai",
        "Gunung",
        "Jalan-jalan",
        "Waktu menyendiri"
      ],
      "s02": [
        "Malam yang sempurna?",
        "Nonton di rumah",
        "Jalan-jalan",
        "Restoran",
        "Permainan papan"
      ],
      "s03": [
        "Cuaca favorit?",
        "Cerah",
        "Hujan",
        "Salju",
        "Malam berbintang"
      ],
      "s04": [
        "Hewan favorit?",
        "Anak kucing",
        "Anak anjing",
        "Kuda",
        "Lumba-lumba"
      ],
      "s05": [
        "Makan malam apa?",
        "Pizza",
        "Sushi",
        "Kue manis",
        "Barbekyu"
      ],
      "s06": [
        "Minuman favorit?",
        "Kopi",
        "Teh",
        "Cokelat panas",
        "Limun"
      ],
      "s07": [
        "Musim favorit?",
        "Musim semi",
        "Musim panas",
        "Musim gugur",
        "Musim dingin"
      ],
      "s08": [
        "Bunga favorit?",
        "Mawar",
        "Tulip",
        "Bunga matahari",
        "Lavender"
      ],
      "s09": [
        "Cara bersantai?",
        "Membaca buku",
        "Menggambar",
        "Bersepeda",
        "Tidur di hammock"
      ],
      "s10": [
        "Bepergian naik apa?",
        "Kereta",
        "Pesawat",
        "Mobil",
        "Kapal"
      ],
      "s11": [
        "Rumah impian?",
        "Apartemen di kota",
        "Rumah tepi laut",
        "Pondok di gunung",
        "Peternakan"
      ],
      "s12": [
        "Yang manis-manis?",
        "Es krim",
        "Cokelat",
        "Kue tart",
        "Buah"
      ],
      "s13": [
        "Pagi yang sempurna?",
        "Sarapan di tempat tidur",
        "Lari pagi",
        "Tidur panjang",
        "Kopi di balkon"
      ],
      "s14": [
        "Kencan impian?",
        "Piknik",
        "Arena seluncur es",
        "Taman hiburan",
        "Bintang di atap"
      ],
      "s15": [
        "Hadiah terbaik?",
        "Buket bunga",
        "Surat",
        "Perjalanan",
        "Kotak hadiah"
      ],
      "s16": [
        "Alam favorit?",
        "Laut",
        "Hutan",
        "Gurun",
        "Aurora"
      ]
    },
    "who": [
      "Siapa di antara kita yang lebih sering terlambat?",
      "Siapa di antara kita yang lebih dulu berbaikan?",
      "Siapa di antara kita yang lebih pandai memasak?",
      "Siapa di antara kita yang lebih sering tertawa?",
      "Siapa di antara kita yang lebih lama bersiap-siap?",
      "Siapa di antara kita yang lebih sering kehilangan kunci?",
      "Siapa di antara kita yang lebih ingat tanggal-tanggal penting?",
      "Siapa di antara kita yang lebih suka makanan manis?",
      "Siapa di antara kita yang lebih dulu tertidur?",
      "Siapa di antara kita yang bangun lebih pagi?",
      "Siapa di antara kita yang lebih sering bilang “aku kangen”?",
      "Siapa di antara kita yang lebih pandai memilih hadiah?",
      "Siapa di antara kita yang lebih sering bercanda?",
      "Siapa di antara kita yang lebih jago menyetir?",
      "Siapa di antara kita yang lebih lama bicara di telepon?",
      "Siapa di antara kita yang lebih suka bepergian?",
      "Siapa di antara kita yang lebih mudah tersinggung?",
      "Siapa di antara kita yang lebih cepat memaafkan?",
      "Siapa di antara kita yang lebih banyak mengambil foto?",
      "Siapa di antara kita yang lebih pandai mengatur uang?",
      "Siapa di antara kita yang lebih sering membeli barang yang tidak perlu?",
      "Siapa di antara kita yang lebih pandai menghibur?",
      "Siapa di antara kita yang lebih tenang di saat sulit?",
      "Siapa di antara kita yang selalu mencari ponselnya?",
      "Siapa di antara kita yang lebih suka menerima tamu?",
      "Siapa di antara kita yang lebih sering membuat sarapan?",
      "Siapa di antara kita yang lebih pandai mencari jalan di kota baru?",
      "Siapa di antara kita yang menulis pesan lebih panjang?",
      "Siapa di antara kita yang lebih dulu mengajak jalan-jalan?",
      "Siapa di antara kita yang lebih sayang binatang?",
      "Siapa di antara kita yang lebih pandai menjaga rahasia?",
      "Siapa di antara kita yang lebih lama memilih menu?",
      "Siapa di antara kita yang lebih mengkhawatirkan orang-orang tersayang?",
      "Siapa di antara kita yang lebih sering memberi kejutan?",
      "Siapa di antara kita yang lebih rapi?",
      "Siapa di antara kita yang lebih dulu menyadari potongan rambut baru?",
      "Siapa di antara kita yang lebih sering mengingat cerita lucu?",
      "Siapa di antara kita yang lebih sabar?",
      "Siapa di antara kita yang lebih sering bilang “terima kasih”?",
      "Siapa di antara kita yang lebih dulu menawarkan bantuan?"
    ],
    "phrases": [
      "Aku tersenyum saat kamu…",
      "Hari favoritku bersamamu adalah…",
      "Terima kasih untuk…",
      "Saat aku sedih, yang membantuku adalah…",
      "Suatu hari nanti aku ingin kita…",
      "Kenangan terhangat tentang kita adalah…",
      "Kamu paling jago dalam…",
      "Aku merasa tenang saat…",
      "Kalau kita punya satu hari penuh yang bebas, kita akan…",
      "Aku bangga padamu karena…",
      "Malam sempurna kita adalah…",
      "Aku tidak akan pernah lupa bagaimana kamu…",
      "Aku suka saat kamu bilang…",
      "Tahun depan aku ingin kita…",
      "Bagiku, kamu seperti…",
      "Hadiah terbaik darimu adalah…",
      "Aku kangen kamu saat…",
      "Kita paling lucu saat…",
      "Sudah lama aku ingin bilang padamu…",
      "Tempat kita adalah…",
      "Saat aku memikirkanmu, aku…",
      "Kamu membuat hariku lebih baik saat…",
      "Aku suka kebiasaan kita…",
      "Harapanku untuk kita: …",
      "Hal paling lucu yang pernah terjadi pada kita adalah…",
      "Aku merasakan perhatianmu saat kamu…",
      "Pagi bersamamu adalah…",
      "Kalau kita satu kata, kata itu adalah…",
      "Aku ingin belajar darimu cara…",
      "Terima kasih karena kamu selalu…"
    ]
  },
  "vi": {
    "text": {
      "homeLink": "Trò chơi cho hai người",
      "eyebrow": "GLOWLETTER · TRÒ CHƠI CHO HAI NGƯỜI",
      "title": "Cùng nhau chơi",
      "close": "Đóng",
      "lead": "Gửi một trò chơi cho người thân yêu. Chơi qua liên kết miễn phí và không cần tài khoản.",
      "quizTitle": "Bạn hiểu mình đến đâu?",
      "quizNote": "Trả lời các câu hỏi về bản thân, rồi để người thân thử đoán. Kết quả sẽ gửi về cho bạn.",
      "create": "Tạo bài trắc nghiệm",
      "soon": "Sắp có",
      "soonTitle": "Thêm trò chơi đang được chuẩn bị",
      "duel": "Đấu «Ai nhanh hơn»",
      "loves": "Điều chúng mình yêu thích",
      "cards": "Thẻ ghi nhớ cho hai người",
      "who": "Ai trong hai ta?",
      "phrase": "Hoàn thành câu",
      "myQuizzes": "Bài trắc nghiệm của tôi",
      "noQuizzes": "Chưa có bài nào. Tạo bài đầu tiên chỉ mất vài phút.",
      "forWhom": "Gửi {name}",
      "noRecipient": "Bài trắc nghiệm",
      "resultsCount": "Kết quả: {count}",
      "newResults": "Mới: {count}",
      "noResults": "Chưa có ai chơi.",
      "anonymous": "Không tên",
      "results": "Kết quả",
      "copyLink": "Sao chép liên kết",
      "share": "Gửi",
      "deleteQuiz": "Xóa bài trắc nghiệm",
      "deleteConfirm": "Xóa bài này và các kết quả? Liên kết sẽ không dùng được nữa.",
      "deleted": "Đã xóa bài trắc nghiệm",
      "linkCopied": "Đã sao chép liên kết",
      "back": "Quay lại",
      "next": "Tiếp",
      "stepNames": "Bước 1/2 · Tên",
      "yourName": "Tên của bạn",
      "yourNamePlaceholder": "Bạn tên là gì",
      "recipient": "Gửi cho ai · không bắt buộc",
      "recipientPlaceholder": "Tên người thân yêu",
      "nameRequired": "Hãy nhập tên của bạn.",
      "forbiddenName": "Hãy nhập một cái tên bình thường.",
      "stepAnswers": "Bước 2/2 · Câu trả lời của bạn",
      "answersLead": "Chọn điều đúng với bạn. Câu hỏi nào cũng có thể đổi.",
      "swap": "Câu hỏi khác",
      "progress": "Đã trả lời {done}/{total}",
      "answerAll": "Hãy chọn đáp án cho mọi câu hỏi.",
      "finish": "Nhận liên kết",
      "creating": "Đang tạo bài trắc nghiệm…",
      "createdTitle": "Bài trắc nghiệm đã sẵn sàng!",
      "createdLead": "Hãy gửi liên kết. Khi người kia trả lời, kết quả sẽ hiện trong «Bài trắc nghiệm của tôi».",
      "shareText": "{name} mời bạn chơi «Bạn hiểu mình đến đâu?»",
      "signInTitle": "Cần đăng nhập",
      "signInNote": "Bài trắc nghiệm được lưu trong tài khoản để kết quả gửi về cho bạn.",
      "signIn": "Đăng nhập",
      "premiumNote": "Tạo trò chơi thuộc quyền truy cập đầy đủ. Chơi qua liên kết miễn phí cho mọi người.",
      "failed": "Không thành công. Hãy kiểm tra kết nối và thử lại.",
      "rateLimited": "Quá nhiều lần thử. Hãy thử lại sau.",
      "playEyebrow": "TRÒ CHƠI CHO HAI NGƯỜI",
      "playInvite": "{name} mời bạn cùng chơi",
      "playLead": "Số câu hỏi: {count}. Hãy đoán đáp án — cuối cùng bạn sẽ thấy có bao nhiêu câu trùng.",
      "playName": "Tên của bạn · không bắt buộc",
      "playNamePlaceholder": "Để người ấy biết là bạn",
      "start": "Bắt đầu",
      "playLoading": "Đang tải trò chơi…",
      "playMissing": "Trò chơi không khả dụng: liên kết đã bị xóa hoặc hết hạn.",
      "playOffline": "Trò chơi cần kết nối internet.",
      "retry": "Thử lại",
      "questionOf": "Câu {n}/{total}",
      "asks": "{name} hỏi",
      "counting": "Đang đếm câu trùng…",
      "scoreOf": "{score}/{total}",
      "tierAll": "Hoàn hảo! Hai bạn hiểu nhau hơn ai hết",
      "tierHigh": "Hai bạn hiểu nhau rất rõ",
      "tierMid": "Không tệ! Vẫn còn điều để khám phá",
      "tierLow": "Còn nhiều điều thú vị đang chờ hai bạn",
      "sentTo": "{name} sẽ thấy kết quả của bạn",
      "review": "Câu trả lời của bạn",
      "rightAnswer": "Đáp án đúng",
      "makeOwn": "Tạo bài của tôi",
      "home": "Trang chủ",
      "resultToast": "{name}: {score}/{total} trong «Bạn hiểu mình đến đâu?»",
      "ownerAnswers": "Đáp án của người tạo",
      "playerAnswers": "Câu trả lời của {name}",
      "paywallTitle": "Trò chơi, giải trí<br><em>và thư</em>",
      "groupGames": "Trò chơi",
      "groupFun": "Giải trí",
      "groupLetters": "Thư",
      "featQuiz": "«Bạn hiểu mình đến đâu?» — kết quả gửi về cho bạn",
      "featGamesSoon": "Đấu «Ai nhanh hơn», «Điều chúng mình yêu thích», thẻ ghi nhớ hình gấu",
      "featFunSoon": "«Ai trong hai ta?» và «Hoàn thành câu» cùng cuốn sổ đôi",
      "featCollection": "Toàn bộ bộ sưu tập thư và thơ bằng 25 ngôn ngữ",
      "featMoments": "Khoảnh khắc, lời nhắc và thư QR mở đúng ngày",
      "featAudio": "Âm thanh của riêng bạn trong thư và lời hồi âm của người nhận",
      "ynTitle": "Có hay không",
      "ynNote": "Trò chơi trực tiếp cho hai người: mỗi thẻ 5 giây. Ai trả lời kịp sẽ thấy câu trả lời của người kia.",
      "ynCreate": "Tạo phòng",
      "ynWaiting": "Đang chờ {name} mở liên kết…",
      "ynWaitingAny": "Đang chờ người kia…",
      "ynShareText": "{name} mời bạn chơi trò trực tiếp «Có hay không»",
      "ynPartnerHere": "{name} đã vào!",
      "ynStart": "Bắt đầu trò chơi",
      "ynWaitHost": "{name} sắp bắt đầu trò chơi",
      "ynYes": "Có",
      "ynNo": "Không",
      "ynMissed": "Trễ rồi — thẻ này vẫn đóng",
      "ynMatch": "Trùng câu trả lời!",
      "ynRound": "Thẻ {n}/{total}",
      "ynAnswered": "Đã gửi câu trả lời, đang chờ người kia…",
      "ynFinal": "Trùng {score}/{total}",
      "ynFinalHigh": "Hai bạn hiểu nhau không cần lời",
      "ynFinalMid": "Khác nhau thật nhiều — mà gần nhau thật gần",
      "ynAgain": "Chơi lại",
      "ynLeft": "Người kia đã mất kết nối. Đang chờ quay lại…",
      "ynYou": "Bạn",
      "ynOffline": "Không kết nối được trò chơi. Hãy kiểm tra internet và mở lại liên kết.",
      "ynJoin": "Vào trò chơi",
      "ynJoinLead": "{name} đang chờ bạn. Mỗi câu trả lời 5 giây!",
      "ynStepNames": "Tên bạn và tên người kia",
      "ynRoomReady": "Phòng đã sẵn sàng — hãy gửi liên kết",
      "ynStayHere": "Hãy giữ màn hình này: trò chơi bắt đầu khi liên kết được mở.",
      "featYesNo": "Trò chơi trực tiếp «Có hay không» — 5 giây mỗi câu",
      "ynPartnerMissed": "Không có câu trả lời — hết giờ",
      "lvTitle": "Điều chúng mình thích",
      "lvNote": "Trò chơi trực tiếp cho hai người: 4 bức tranh, 10 giây để chọn điều bạn thích nhất. Có thể chọn giống nhau!",
      "lvShareText": "{name} mời bạn chơi trò trực tiếp «Điều chúng mình thích»",
      "lvJoinLead": "{name} đang chờ bạn. Hãy chọn bức tranh bạn thích nhất!",
      "lvRound": "Chủ đề {n}/{total}",
      "lvPick": "Chọn điều bạn thích nhất",
      "lvBoth": "Cả hai đều chọn: {item}",
      "lvCommon": "Cả hai cùng thích",
      "lvDiff": "Khác sở thích — càng thú vị!",
      "lvFinalHigh": "Hai bạn có thật nhiều điểm chung!",
      "lvFinalMid": "Khác nhau — mà bổ sung cho nhau",
      "featLoves": "Trò chơi trực tiếp «Điều chúng mình thích» — 4 bức tranh, cùng chọn",
      "featGamesSoon2": "Đấu «Ai nhanh hơn» và thẻ ghi nhớ hình gấu",
      "mcTitle": "Thẻ ghi nhớ hình gấu",
      "mcNote": "Trò chơi trí nhớ trực tiếp cho hai người: lần lượt lật hai thẻ và tìm các cặp. Ba cấp độ, từ 8 đến 16 thẻ.",
      "mcShareText": "{name} mời bạn chơi trò trực tiếp «Thẻ ghi nhớ hình gấu»",
      "mcJoinLead": "{name} đang chờ bạn. Hãy lần lượt tìm các cặp!",
      "mcLevel": "Cấp {n}/{total}",
      "mcTurnYou": "Lượt của bạn — lật hai thẻ",
      "mcTurnThem": "Lượt của {name}",
      "mcPairs": "Đã tìm được {found}/{total} cặp",
      "mcLevelDone": "Đã tìm đủ các cặp!",
      "mcTimeUp": "Hết giờ cấp này",
      "mcNext": "Tiếp theo: cấp {n}",
      "mcFinal": "Tìm được {found}/{total} cặp",
      "mcFinalHigh": "Một đội tuyệt vời!",
      "mcFinalMid": "Chơi hay lắm — thêm ván nữa?",
      "featCards": "Trò chơi trực tiếp «Thẻ ghi nhớ hình gấu» — cùng tìm cặp",
      "featGamesSoon3": "Đấu «Ai nhanh hơn»",
      "duTitle": "Ai nhanh hơn",
      "duNote": "Đấu trực tiếp: một từ và bốn bức ảnh. Chạm vào ảnh đúng trước — chạm sai là thua vòng đó.",
      "duShareText": "{name} thách bạn đấu trực tiếp “Ai nhanh hơn”",
      "duJoinLead": "{name} đang chờ bạn. Tìm ảnh đúng nhanh hơn nào!",
      "duRound": "Vòng {n}/{total}",
      "duFind": "Tìm: {item}",
      "duYouWon": "Bạn nhanh hơn!",
      "duTheyWon": "{name} nhanh hơn",
      "duWrong": "Sai ảnh — thua vòng này",
      "duNobody": "Không ai tìm kịp",
      "duScore": "Bạn {you} : {them} {name}",
      "duFinalWin": "Chiến thắng! Hôm nay mắt bạn tinh quá.",
      "duFinalLose": "Lần này {name} thắng — chơi lại nhé?",
      "duFinalDraw": "Hòa — ngang tài ngang sức!",
      "duSeconds": "{s} giây",
      "featDuel": "Đấu trực tiếp “Ai nhanh hơn” — tìm ảnh trước",
      "whoTitle": "Ai trong hai ta?",
      "whoNote": "Trò chơi trực tiếp cho hai người: một câu hỏi, chạm “Mình” hoặc tên người kia. Xem hai bạn có cùng ý về nhau không.",
      "whoShareText": "{name} mời bạn chơi trò chơi trực tiếp “Ai trong hai ta?”",
      "whoJoinLead": "{name} đang chờ bạn. Trả lời thật lòng — rồi so sánh nhé!",
      "whoRound": "Câu hỏi {n}/{total}",
      "whoMe": "Mình",
      "whoAgree": "Hai bạn cùng ý: {name}",
      "whoDiffer": "Ý kiến khác nhau — cùng trò chuyện nhé!",
      "whoFinal": "Hai bạn cùng ý {score}/{total} lần",
      "whoFinalHigh": "Hai bạn hiểu nhau thật rõ!",
      "whoFinalMid": "Có nhiều điều để trò chuyện — và thế thật tuyệt",
      "featWho": "Trò chơi trực tiếp “Ai trong hai ta?” — xem có cùng ý không",
      "phTitle": "Hoàn thành câu",
      "phNote": "Trò chơi trực tiếp cho hai người: cả hai cùng viết tiếp một câu ấm áp bằng lời của mình, rồi đọc câu trả lời của nhau.",
      "phShareText": "{name} mời bạn chơi trò chơi trực tiếp “Hoàn thành câu”",
      "phJoinLead": "{name} đang chờ bạn. Hãy viết tiếp từng câu bằng lời của bạn!",
      "phRound": "Câu {n}/{total}",
      "phPlaceholder": "Phần viết tiếp của bạn…",
      "phDone": "Xong",
      "phWaiting": "Đang chờ {name}…",
      "phSkipped": "Không trả lời",
      "phSave": "Lưu vào Sổ của hai ta",
      "phSaved": "Đã lưu vào Sổ của hai ta",
      "phForbidden": "Vui lòng viết không kèm liên kết hay từ ngữ thô lỗ.",
      "phNext": "Câu tiếp theo",
      "phFinal": "Số câu đã cùng hoàn thành: {count}",
      "phFinalLead": "Lưu những câu trả lời bạn thích nhất vào Sổ của hai ta.",
      "featPhrase": "Trò chơi trực tiếp “Hoàn thành câu” cùng Sổ của hai ta",
      "bookTitle": "Sổ của hai ta",
      "bookNote": "Những câu trả lời ấm áp nhất từ “Hoàn thành câu”, được lưu trong tài khoản của bạn.",
      "bookOpen": "Mở sổ",
      "bookEmpty": "Sổ vẫn còn trống. Hãy chơi “Hoàn thành câu” và lưu những câu trả lời bạn thích.",
      "bookDelete": "Xóa",
      "bookDeleteConfirm": "Xóa trang này khỏi sổ?",
      "bookYou": "Bạn",
      "inviteTitle": "Mời bạn bè",
      "inviteNote": "Bạn bè sẽ nhận được tin nhắn kèm trò chơi.",
      "invite": "Mời",
      "invited": "Đã mời",
      "inviteNone": "Thêm bạn bè trong mục “Bạn bè” để mời chỉ với một chạm.",
      "inviteSent": "Đã gửi lời mời đến {name}"
    },
    "questions": {
      "q01": [
        "Mùa mình yêu thích nhất?",
        "Mùa xuân",
        "Mùa hè",
        "Mùa thu",
        "Mùa đông"
      ],
      "q02": [
        "Bữa sáng mình sẽ chọn gì?",
        "Cà phê và bánh sừng bò",
        "Cháo",
        "Trứng",
        "Chỉ trà"
      ],
      "q03": [
        "Ngày nghỉ lý tưởng của mình?",
        "Ở nhà cuộn chăn",
        "Dạo công viên",
        "Đi chơi ngoại thành",
        "Gặp gỡ bạn bè"
      ],
      "q04": [
        "Mình mơ được đi đâu?",
        "Biển",
        "Núi",
        "Một thành phố lớn",
        "Ngôi nhà nhỏ ấm cúng ở quê"
      ],
      "q05": [
        "Vị kem mình thích nhất?",
        "Vani",
        "Sô-cô-la",
        "Dâu",
        "Hạt dẻ cười"
      ],
      "q06": [
        "Điều gì làm mình vui nhanh nhất?",
        "Một cái ôm",
        "Một bất ngờ",
        "Lời nói ấm áp",
        "Món gì đó ngon"
      ],
      "q07": [
        "Mình là người…",
        "Dậy sớm",
        "Thức khuya",
        "Ngủ khi nào có thể",
        "Mê ngủ trưa"
      ],
      "q08": [
        "Tối nay mình sẽ chọn phim gì?",
        "Hài",
        "Chuyện tình lãng mạn",
        "Trinh thám",
        "Hoạt hình"
      ],
      "q09": [
        "Màu mình thích nhất?",
        "Đỏ",
        "Xanh dương",
        "Xanh lá",
        "Hồng"
      ],
      "q10": [
        "Mình sợ gì nhất?",
        "Nhện",
        "Độ cao",
        "Bóng tối",
        "Bị muộn"
      ],
      "q11": [
        "Mình yêu loài hoa nào?",
        "Hoa hồng",
        "Tulip",
        "Mẫu đơn",
        "Cúc họa mi"
      ],
      "q12": [
        "Khi buồn mình làm gì?",
        "Gọi cho người thân",
        "Ăn đồ ngọt",
        "Đi dạo",
        "Đi ngủ"
      ],
      "q13": [
        "Con vật nào gần với mình nhất?",
        "Mèo con",
        "Chó",
        "Gấu con",
        "Cáo nhỏ"
      ],
      "q14": [
        "Món quà tuyệt nhất với mình?",
        "Đồ tự tay làm",
        "Một chuyến đi",
        "Trang sức",
        "Một cuốn sách"
      ],
      "q15": [
        "Đồ uống mình thích nhất?",
        "Trà đen",
        "Trà xanh",
        "Cà phê",
        "Ca cao nóng"
      ],
      "q16": [
        "Món ăn vặt mình thích nhất?",
        "Sô-cô-la",
        "Khoai tây chiên",
        "Trái cây",
        "Bánh ngọt"
      ],
      "q17": [
        "Khi đi du lịch mình chọn gì?",
        "Bảo tàng",
        "Bãi biển",
        "Ẩm thực địa phương",
        "Dạo chơi không kế hoạch"
      ],
      "q18": [
        "Mình thích dành buổi tối thế nào?",
        "Đọc sách",
        "Xem phim bộ",
        "Trò chuyện",
        "Đi dạo"
      ],
      "q19": [
        "Mình thích thời tiết nào nhất?",
        "Nắng",
        "Mưa ấm",
        "Tuyết rơi",
        "Gió nhẹ"
      ],
      "q20": [
        "Siêu năng lực nào hợp với mình?",
        "Bay",
        "Đọc suy nghĩ",
        "Dừng thời gian",
        "Dịch chuyển tức thời"
      ],
      "q21": [
        "Điều mình coi trọng nhất ở người thân?",
        "Sự tin tưởng",
        "Sự quan tâm",
        "Óc hài hước",
        "Sự ủng hộ"
      ],
      "q22": [
        "Dịp nào mình mong chờ nhất?",
        "Năm mới",
        "Sinh nhật mình",
        "Kỳ nghỉ hè",
        "Lễ Tình nhân"
      ],
      "q23": [
        "Mình thường nói «thương» bằng cách nào?",
        "Bằng lời",
        "Bằng hành động",
        "Bằng cái ôm",
        "Bằng quà"
      ],
      "q24": [
        "Ở quán cà phê mình sẽ gọi gì?",
        "Mì Ý",
        "Sushi",
        "Salad",
        "Tráng miệng"
      ],
      "q25": [
        "Thời điểm mình thích nhất trong ngày?",
        "Buổi sáng",
        "Buổi trưa",
        "Buổi chiều tối",
        "Ban đêm"
      ],
      "q26": [
        "Mình sẽ chọn món ăn nào?",
        "Món Ý",
        "Món Nhật",
        "Cơm nhà",
        "Món Mexico"
      ],
      "q27": [
        "Mình suy nghĩ tốt nhất ở đâu?",
        "Khi tắm",
        "Khi đi dạo",
        "Trên đường đi",
        "Trước khi ngủ"
      ],
      "q28": [
        "Sáng dậy mình làm gì đầu tiên?",
        "Xem điện thoại",
        "Uống nước",
        "Pha cà phê",
        "Nằm nướng thêm chút"
      ],
      "q29": [
        "Loại trái cây mình thích nhất?",
        "Táo",
        "Chuối",
        "Xoài",
        "Dưa hấu"
      ],
      "q30": [
        "Sở thích nào hợp với mình nhất?",
        "Vẽ",
        "Nấu ăn",
        "Thể thao",
        "Đọc sách"
      ],
      "q31": [
        "Mình muốn đón sinh nhật thế nào?",
        "Tiệc thật vui",
        "Bữa tối hai người",
        "Một chuyến đi",
        "Buổi tối yên bình ở nhà"
      ],
      "q32": [
        "Mình thấy bất ngờ thế nào?",
        "Rất thích",
        "Hơi hồi hộp",
        "Thích tạo bất ngờ cho người khác",
        "Muốn biết trước hơn"
      ],
      "q33": [
        "Đồ ngọt mình thích nhất?",
        "Bánh kem",
        "Kem",
        "Bánh quy",
        "Kẹo"
      ],
      "q34": [
        "Ra đảo hoang mình sẽ mang gì?",
        "Một cuốn sách",
        "Điện thoại",
        "Chăn",
        "Máy ảnh"
      ],
      "q35": [
        "Sau một ngày mệt mình thư giãn thế nào?",
        "Tắm nước ấm",
        "Xem phim bộ",
        "Đi dạo",
        "Trò chuyện với người thân"
      ],
      "q36": [
        "Mình thích đi bằng phương tiện nào nhất?",
        "Tàu hỏa",
        "Máy bay",
        "Ô tô",
        "Xe đạp"
      ],
      "q37": [
        "Trò chơi mình thích hồi nhỏ?",
        "Trốn tìm",
        "Đuổi bắt",
        "Xếp hình",
        "Vẽ tranh"
      ],
      "q38": [
        "Câu chuyện cổ tích nào giống mình nhất?",
        "Lọ Lem",
        "Hoàng tử bé",
        "Gấu Pooh",
        "Alice ở xứ sở thần tiên"
      ],
      "q39": [
        "Mình sẽ làm người thân vui bằng cách nào?",
        "Một bất ngờ",
        "Một tấm thiệp",
        "Một chuyến đi",
        "Một bữa tối"
      ],
      "q40": [
        "Mình hay chụp gì nhất?",
        "Ảnh tự sướng",
        "Thiên nhiên",
        "Đồ ăn",
        "Hầu như không chụp"
      ],
      "q41": [
        "Góc yêu thích của mình trong nhà?",
        "Giường",
        "Bếp",
        "Ghế sofa",
        "Ban công"
      ],
      "q42": [
        "Điều đầu tiên mình để ý ở một người?",
        "Nụ cười",
        "Đôi mắt",
        "Giọng nói",
        "Óc hài hước"
      ],
      "q43": [
        "Điều gì làm mình cười nhanh nhất?",
        "Video hài",
        "Câu đùa của người thân",
        "Tình huống ngượng ngùng",
        "Động vật"
      ],
      "q44": [
        "Ngày hè nóng mình uống gì?",
        "Nước chanh",
        "Trà đá",
        "Nước ép",
        "Nước đá"
      ],
      "q45": [
        "Nguyên tố nào gần với mình nhất?",
        "Nước",
        "Lửa",
        "Đất",
        "Không khí"
      ],
      "q46": [
        "Mình thích những câu chuyện nào?",
        "Phiêu lưu",
        "Tình yêu",
        "Khoa học viễn tưởng",
        "Chuyện có thật"
      ],
      "q47": [
        "Ngày mưa mình làm gì?",
        "Đọc sách",
        "Ngủ",
        "Xem phim",
        "Che ô đi dạo"
      ],
      "q48": [
        "Mình quý điều gì nhất ở món quà?",
        "Tấm lòng",
        "Sự hữu ích",
        "Vẻ đẹp",
        "Sự bất ngờ"
      ],
      "q49": [
        "Mình sẽ chọn khoai tây kiểu nào?",
        "Nghiền",
        "Chiên",
        "Nướng",
        "Snack khoai"
      ],
      "q50": [
        "Đến thành phố mới mình đi đâu trước?",
        "Quán cà phê",
        "Bảo tàng",
        "Công viên",
        "Mua sắm"
      ],
      "q51": [
        "Khi mất ngủ mình làm gì?",
        "Đọc sách",
        "Lướt điện thoại",
        "Đếm cừu",
        "Uống sữa ấm"
      ],
      "q52": [
        "Mình chuẩn bị cho ngày quan trọng thế nào?",
        "Lên kế hoạch trước hết",
        "Để đến phút cuối",
        "Nhờ người giúp",
        "Hồi hộp đến mất ngủ"
      ],
      "q53": [
        "Môn thể thao mình thích xem nhất?",
        "Bóng đá",
        "Quần vợt",
        "Trượt băng nghệ thuật",
        "Không xem thể thao"
      ],
      "q54": [
        "Thú cưng nào hợp với mình?",
        "Mèo",
        "Chó",
        "Vẹt",
        "Chuột hamster"
      ],
      "q55": [
        "Mình hay nhắn tin kiểu gì?",
        "Dài",
        "Ngắn",
        "Đầy biểu tượng cảm xúc",
        "Tin nhắn thoại"
      ],
      "q56": [
        "Món quà mình giữ lâu nhất?",
        "Một lá thư",
        "Một món đồ chơi",
        "Một tấm ảnh",
        "Một món trang sức"
      ],
      "q57": [
        "Mình sẽ chọn gì hơn?",
        "Trà bên lò sưởi",
        "Dã ngoại trên cỏ",
        "Dạo biển",
        "Đi xem phim"
      ],
      "q58": [
        "Lời khen nào làm mình vui nhất?",
        "Về ngoại hình",
        "Về sự thông minh",
        "Về lòng tốt",
        "Về óc hài hước"
      ],
      "q59": [
        "Buổi sáng lý tưởng của mình?",
        "Ăn sáng trên giường",
        "Chạy bộ sớm",
        "Ngủ thật lâu",
        "Cà phê ở ban công"
      ],
      "q60": [
        "Mình muốn học gì?",
        "Nhảy",
        "Nấu ăn",
        "Một ngôn ngữ mới",
        "Vẽ"
      ]
    },
    "yesNo": {
      "c01": [
        "Lúc này có nhớ mình không?",
        "nhớ bạn rất nhiều",
        "cố gắng nhưng vẫn nghĩ về bạn"
      ],
      "c02": [
        "Thấy tin nhắn của mình có mỉm cười không?",
        "luôn mỉm cười",
        "mỉm cười trong lòng"
      ],
      "c03": [
        "Còn nhớ lần đầu mình gặp nhau không?",
        "nhớ từng phút",
        "nhớ điều quan trọng nhất — bạn"
      ],
      "c04": [
        "Hôm nay muốn ôm không?",
        "đang chờ cái ôm của bạn",
        "để dành cái ôm cho sau"
      ],
      "c05": [
        "Mình cùng đi biển nhé?",
        "đã xếp vali rồi",
        "mơ về núi"
      ],
      "c06": [
        "Mình có làm bạn cười không?",
        "cười từ tận đáy lòng",
        "giấu nụ cười"
      ],
      "c07": [
        "Ở bên mình có thấy bình yên không?",
        "thấy bình yên bên bạn",
        "thấy vui khi ở cùng bạn"
      ],
      "c08": [
        "Ban ngày có nghĩ về mình không?",
        "nghĩ về bạn rất thường xuyên",
        "đang nghĩ về bạn ngay lúc này"
      ],
      "c09": [
        "Có thích bất ngờ của mình không?",
        "rất mê những bất ngờ của bạn",
        "thích nhất là có bạn bên cạnh"
      ],
      "c10": [
        "Mình cùng nướng bánh nhé?",
        "đã đeo tạp dề",
        "mua bánh kem thì hơn"
      ],
      "c11": [
        "Tối nay cùng xem phim nhé?",
        "đang chọn phim",
        "chỉ muốn trò chuyện"
      ],
      "c12": [
        "Có thích giọng của mình không?",
        "có thể nghe mãi không chán",
        "thích tiếng cười của bạn hơn"
      ],
      "c13": [
        "Cuối tuần đi dã ngoại nhé?",
        "đang chuẩn bị tấm thảm",
        "rủ bạn đến quán cà phê ấm cúng"
      ],
      "c14": [
        "Muốn nhận thư của mình không?",
        "đang chờ thư của bạn",
        "muốn nghe trực tiếp hơn"
      ],
      "c15": [
        "Mình có quan trọng với bạn không?",
        "rất quan trọng",
        "hơn cả bạn nghĩ"
      ],
      "c16": [
        "Mình đi dạo dưới mưa nhé?",
        "mang ô cho hai người",
        "pha trà ở nhà thì hơn"
      ],
      "c17": [
        "Hai ta có giống nhau không?",
        "như hai nửa của một",
        "bổ sung cho nhau thật hoàn hảo"
      ],
      "c18": [
        "Có thích món mình nấu không?",
        "xin thêm phần nữa",
        "thích nấu ăn cùng bạn"
      ],
      "c19": [
        "Mình cùng nuôi thú cưng nhé?",
        "đang chọn tên rồi",
        "giờ có gấu bông là đủ"
      ],
      "c20": [
        "Có biết mình thích gì không?",
        "thuộc lòng",
        "muốn biết thêm nữa"
      ],
      "c21": [
        "Mình nhảy cùng nhau nhé?",
        "đã đưa tay ra",
        "sẽ vỗ tay cổ vũ"
      ],
      "c22": [
        "Mình có truyền cảm hứng cho bạn không?",
        "truyền cảm hứng mỗi ngày",
        "bên bạn chỉ thấy ấm áp"
      ],
      "c23": [
        "Có giữ ảnh của hai ta không?",
        "giữ gìn từng tấm",
        "chờ những tấm mới đẹp hơn"
      ],
      "c24": [
        "Cùng ngắm bình minh nhé?",
        "đang đặt báo thức",
        "thích ngắm hoàng hôn hơn"
      ],
      "c25": [
        "Kể mình nghe một bí mật nhé?",
        "sẽ thì thầm vào tai bạn",
        "cứ để là bí ẩn"
      ],
      "c26": [
        "Có tin mình không?",
        "rất tin bạn",
        "cổ vũ bạn mỗi ngày"
      ],
      "c27": [
        "Mình đi du lịch chỉ hai đứa nhé?",
        "mơ về điều đó",
        "sẽ rủ tất cả người thân"
      ],
      "c28": [
        "Có đang chờ mình gọi không?",
        "chờ với nụ cười",
        "muốn bạn ghé thăm hơn"
      ],
      "c29": [
        "Có thích cái ôm của mình không?",
        "ấm áp nhất trên đời",
        "thích nắm tay nhau"
      ],
      "c30": [
        "Mình đọc sách cho nhau nghe nhé?",
        "đang chọn sách",
        "thích nghe bạn đọc hơn"
      ],
      "c31": [
        "Hôm nay chụp ảnh chung nhé?",
        "đang tìm phông nền đẹp",
        "trò chuyện trước đã"
      ],
      "c32": [
        "Mình có làm bạn vui hơn không?",
        "luôn luôn",
        "bên bạn, nỗi buồn cũng nhẹ hơn"
      ],
      "c33": [
        "Mai mình ăn sáng cùng nhau nhé?",
        "đang pha ca cao",
        "muốn ngủ thêm chút nữa"
      ],
      "c34": [
        "Có nhớ sinh nhật mình không?",
        "nhớ mà không cần nhắc",
        "đang bí mật chuẩn bị bất ngờ"
      ],
      "c35": [
        "Mình đi trượt băng nhé?",
        "đã lấy giày trượt",
        "sẽ cổ vũ bạn bên rào"
      ],
      "c36": [
        "Hôm nay là ngày tốt với bạn chứ?",
        "một ngày tuyệt vời",
        "sẽ tốt hơn khi có bạn"
      ],
      "c37": [
        "Vẽ chân dung mình nhé?",
        "đã cầm bút chì",
        "sẽ vẽ một trái tim nhỏ"
      ],
      "c38": [
        "Mình cùng trồng cây nhé?",
        "đang chọn chỗ",
        "bắt đầu từ chậu hoa bên cửa sổ"
      ],
      "c39": [
        "Muốn nghe một lời khen không?",
        "háo hức chờ",
        "ngại ngùng nhưng rất muốn"
      ],
      "c40": [
        "Lát nữa chơi lại nhé?",
        "muốn thêm một ván",
        "muốn ôm hơn là chơi"
      ]
    },
    "loves": {
      "s01": [
        "Đi nghỉ ở đâu?",
        "Biển",
        "Núi",
        "Du lịch",
        "Thời gian một mình"
      ],
      "s02": [
        "Buổi tối hoàn hảo?",
        "Xem phim ở nhà",
        "Đi dạo",
        "Nhà hàng",
        "Trò chơi cờ bàn"
      ],
      "s03": [
        "Thời tiết yêu thích?",
        "Nắng",
        "Mưa",
        "Tuyết",
        "Đêm đầy sao"
      ],
      "s04": [
        "Con vật yêu thích?",
        "Mèo con",
        "Cún con",
        "Ngựa",
        "Cá heo"
      ],
      "s05": [
        "Tối nay ăn gì?",
        "Pizza",
        "Sushi",
        "Bánh ngọt",
        "Đồ nướng"
      ],
      "s06": [
        "Đồ uống yêu thích?",
        "Cà phê",
        "Trà",
        "Ca cao nóng",
        "Nước chanh"
      ],
      "s07": [
        "Mùa yêu thích?",
        "Xuân",
        "Hè",
        "Thu",
        "Đông"
      ],
      "s08": [
        "Hoa yêu thích?",
        "Hoa hồng",
        "Tulip",
        "Hướng dương",
        "Oải hương"
      ],
      "s09": [
        "Thư giãn thế nào?",
        "Đọc sách",
        "Vẽ tranh",
        "Đạp xe",
        "Ngủ trên võng"
      ],
      "s10": [
        "Đi du lịch bằng gì?",
        "Tàu hỏa",
        "Máy bay",
        "Ô tô",
        "Tàu thủy"
      ],
      "s11": [
        "Ngôi nhà mơ ước?",
        "Căn hộ thành phố",
        "Nhà bên biển",
        "Nhà gỗ trên núi",
        "Nông trại"
      ],
      "s12": [
        "Món ngọt nào?",
        "Kem",
        "Sô-cô-la",
        "Bánh kem",
        "Trái cây"
      ],
      "s13": [
        "Buổi sáng hoàn hảo?",
        "Ăn sáng trên giường",
        "Chạy bộ",
        "Ngủ nướng",
        "Cà phê ban công"
      ],
      "s14": [
        "Buổi hẹn mơ ước?",
        "Dã ngoại",
        "Sân trượt băng",
        "Công viên giải trí",
        "Ngắm sao trên sân thượng"
      ],
      "s15": [
        "Món quà tuyệt nhất?",
        "Bó hoa",
        "Lá thư",
        "Chuyến đi",
        "Hộp quà"
      ],
      "s16": [
        "Thiên nhiên yêu thích?",
        "Biển",
        "Rừng",
        "Sa mạc",
        "Cực quang"
      ]
    },
    "who": [
      "Ai trong hai ta hay đến muộn hơn?",
      "Ai trong hai ta làm lành trước?",
      "Ai trong hai ta nấu ăn ngon hơn?",
      "Ai trong hai ta hay cười hơn?",
      "Ai trong hai ta chuẩn bị lâu hơn?",
      "Ai trong hai ta hay làm mất chìa khóa hơn?",
      "Ai trong hai ta nhớ ngày quan trọng tốt hơn?",
      "Ai trong hai ta hảo ngọt hơn?",
      "Ai trong hai ta ngủ trước?",
      "Ai trong hai ta dậy sớm hơn?",
      "Ai trong hai ta hay nói lời nhớ nhung hơn?",
      "Ai trong hai ta chọn quà giỏi hơn?",
      "Ai trong hai ta hay đùa hơn?",
      "Ai trong hai ta lái xe giỏi hơn?",
      "Ai trong hai ta nói chuyện điện thoại lâu hơn?",
      "Ai trong hai ta thích đi du lịch hơn?",
      "Ai trong hai ta dễ tự ái hơn?",
      "Ai trong hai ta tha thứ nhanh hơn?",
      "Ai trong hai ta chụp ảnh nhiều hơn?",
      "Ai trong hai ta quản lý tiền giỏi hơn?",
      "Ai trong hai ta hay mua đồ không cần thiết hơn?",
      "Ai trong hai ta an ủi giỏi hơn?",
      "Ai trong hai ta bình tĩnh hơn lúc khó khăn?",
      "Ai trong hai ta lúc nào cũng tìm điện thoại?",
      "Ai trong hai ta thích đón khách hơn?",
      "Ai trong hai ta hay làm bữa sáng hơn?",
      "Ai trong hai ta tìm đường ở thành phố lạ giỏi hơn?",
      "Ai trong hai ta viết tin nhắn dài hơn?",
      "Ai trong hai ta rủ đi dạo trước?",
      "Ai trong hai ta thích động vật hơn?",
      "Ai trong hai ta giữ bí mật giỏi hơn?",
      "Ai trong hai ta chọn món lâu hơn?",
      "Ai trong hai ta lo lắng cho người thân nhiều hơn?",
      "Ai trong hai ta hay tạo bất ngờ hơn?",
      "Ai trong hai ta gọn gàng hơn?",
      "Ai trong hai ta nhận ra kiểu tóc mới trước?",
      "Ai trong hai ta hay nhớ lại chuyện vui hơn?",
      "Ai trong hai ta kiên nhẫn hơn?",
      "Ai trong hai ta hay nói “cảm ơn” hơn?",
      "Ai trong hai ta chủ động giúp đỡ trước?"
    ],
    "phrases": [
      "Mình mỉm cười khi bạn…",
      "Ngày mình thích nhất bên bạn là…",
      "Cảm ơn bạn vì…",
      "Khi mình buồn, điều giúp mình là…",
      "Một ngày nào đó, mình muốn hai ta cùng…",
      "Kỷ niệm ấm áp nhất của hai ta là…",
      "Bạn giỏi nhất ở chỗ…",
      "Mình thấy bình yên khi…",
      "Nếu có trọn một ngày rảnh, hai ta sẽ…",
      "Mình tự hào về bạn vì…",
      "Buổi tối hoàn hảo của hai ta là…",
      "Mình sẽ không bao giờ quên cách bạn…",
      "Mình thích khi bạn nói…",
      "Năm sau, mình muốn hai ta…",
      "Với mình, bạn giống như…",
      "Món quà tuyệt nhất bạn tặng là…",
      "Mình nhớ bạn khi…",
      "Hai ta vui nhộn nhất khi…",
      "Từ lâu mình đã muốn nói với bạn…",
      "Nơi của hai ta là…",
      "Khi nghĩ về bạn, mình…",
      "Bạn làm ngày của mình tốt đẹp hơn khi…",
      "Mình thích thói quen của hai ta là…",
      "Điều ước của mình cho hai ta: …",
      "Chuyện buồn cười nhất từng xảy ra với hai ta là…",
      "Mình cảm nhận sự quan tâm của bạn khi bạn…",
      "Buổi sáng bên bạn là…",
      "Nếu hai ta là một từ, từ đó sẽ là…",
      "Mình muốn học từ bạn cách…",
      "Cảm ơn vì bạn luôn…"
    ]
  }
});

// ВРЕМЕННО (28.10): английские надписи «Правды или лжи», пока идёт перевод.
Object.values(window.GLOWLETTER_GAMES_I18N).forEach(pack => { pack.text = Object.assign({"truth":"True or false","tfTitle":"True or false","tfNote":"A live game for two: amazing facts about the world. 12 seconds — true or false? A point for every right answer.","tfShareText":"{name} invites you to the live game “True or false”","tfJoinLead":"{name} is waiting for you. True or false — decide fast!","tfRound":"Fact {n} of {total}","tfTrue":"True","tfFalse":"False","tfIsTrue":"It’s true!","tfIsFalse":"It’s false!","tfFirstYou":"You were right first!","tfFirstThem":"{name} was right first","tfFinalWin":"Victory! You know more about the world.","tfFinalLose":"{name} knows more this time — rematch?","tfFinalDraw":"A draw — you know just as much!","featTruth":"Live game “True or false” — amazing facts about the world"}, pack.text); });
