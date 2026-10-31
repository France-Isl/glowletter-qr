// Встроенные письма: первые 10 — бесплатные, с текстами на 25 языках. Тексты писем 11–50 приходят
// с сервера (glowletter_builtin_letters) только при полном доступе; здесь у них лишь номер и категория.
window.NUR_LETTERS = Object.freeze([
  {
    "id": 1,
    "category": "warm",
    "ru": "Забыть можно многое, но только не твои красивые глаза — они остаются в памяти даже тогда, когда тебя нет рядом.",
    "en": "Many things can be forgotten, but not your beautiful eyes — they stay in my memory even when you are not near.",
    "fr": "On peut oublier bien des choses, mais pas tes beaux yeux — ils restent gravés dans ma mémoire, même quand tu n’es pas près de moi.",
    "de": "Vieles kann man vergessen, aber nicht deine schönen Augen — sie bleiben in meiner Erinnerung, auch wenn du nicht bei mir bist.",
    "es": "Se pueden olvidar muchas cosas, pero no tus hermosos ojos: se quedan en mi memoria incluso cuando no estás cerca.",
    "it": "Si possono dimenticare tante cose, ma non i tuoi occhi bellissimi: restano nella mia memoria anche quando non ti ho accanto.",
    "pl": "Można zapomnieć wiele rzeczy, ale nie twoje piękne oczy — zostają w pamięci nawet wtedy, gdy nie ma cię obok.",
    "uk": "Багато що можна забути, але тільки не твої гарні очі — вони залишаються в пам’яті навіть тоді, коли тебе немає поруч.",
    "pt": "Muitas coisas podem ser esquecidas, mas não os seus lindos olhos — eles ficam na minha memória mesmo quando você não está por perto.",
    "nl": "Veel dingen kun je vergeten, maar niet jouw mooie ogen — die blijven in mijn geheugen, zelfs als je niet in de buurt bent.",
    "tr": "Pek çok şey unutulabilir ama senin güzel gözlerin asla — yanımda olmadığın zamanlarda bile hafızamda kalıyorlar.",
    "ro": "Multe lucruri pot fi uitate, dar nu și ochii tăi frumoși — ei rămân în amintirea mea chiar și atunci când nu ești aproape.",
    "cs": "Leccos se dá zapomenout, ale tvoje krásné oči ne — zůstávají v mé paměti, i když nejsi nablízku.",
    "sv": "Mycket kan man glömma, men inte dina vackra ögon — de stannar i mitt minne även när du inte är nära.",
    "el": "Πολλά μπορεί κανείς να ξεχάσει, αλλά όχι τα όμορφα μάτια σου — μένουν στη μνήμη μου ακόμη κι όταν δεν είσαι κοντά.",
    "da": "Meget kan glemmes, men ikke dine smukke øjne — de bliver i min erindring, selv når du ikke er i nærheden.",
    "no": "Mye kan glemmes, men ikke de vakre øynene dine – de blir i minnet mitt selv når du ikke er i nærheten.",
    "fi": "Monen asian voi unohtaa, mutta ei sinun kauniita silmiäsi — ne jäävät mieleeni silloinkin, kun et ole lähellä.",
    "ja": "忘れてしまうことはたくさんあるけれど、あなたの美しい瞳だけは忘れられません。そばにいないときも、その眼差しはずっと心に残っています。",
    "ko": "많은 것을 잊을 수 있어도 당신의 아름다운 눈만은 잊을 수 없어요. 곁에 없을 때조차 그 눈빛은 제 기억 속에 남아 있어요.",
    "zh": "很多事情都可以忘記，唯獨你那雙好看的眼睛忘不掉——即使你不在身邊，它們也一直留在我的記憶裡。",
    "th": "หลายสิ่งอาจลืมเลือนได้ แต่ไม่ใช่ดวงตาอันงดงามของคุณ ดวงตาคู่นั้นยังคงอยู่ในความทรงจำของฉัน แม้ในยามที่คุณไม่ได้อยู่ใกล้",
    "ar": "يمكن أن تُنسى أشياء كثيرة، إلا عينيك الجميلتين؛ فهما باقيتان في ذاكرتي حتى في غيابك.",
    "ind": "Banyak hal bisa dilupakan, tapi tidak dengan matamu yang indah — ia tetap tinggal di ingatanku, bahkan saat kamu tidak ada di dekatku.",
    "vi": "Nhiều điều có thể quên đi, nhưng đôi mắt đẹp của bạn thì không — chúng vẫn ở lại trong ký ức của mình, ngay cả khi bạn không ở bên."
  },
  {
    "id": 2,
    "category": "warm",
    "ru": "Знаешь, я прекрасно умею плавать, но каждый раз, когда смотрю в твои глаза, всё равно тону.",
    "en": "You know, I am a very good swimmer, yet every time I look into your eyes, I still lose myself in them.",
    "fr": "Tu sais, je nage très bien, mais chaque fois que je regarde tes yeux, je m’y perds malgré tout.",
    "de": "Weißt du, ich kann sehr gut schwimmen, und doch versinke ich jedes Mal, wenn ich dir in die Augen sehe.",
    "es": "¿Sabes? Nado muy bien y, aun así, cada vez que te miro a los ojos me pierdo en ellos.",
    "it": "Sai, nuoto benissimo, eppure ogni volta che ti guardo negli occhi mi ci perdo.",
    "pl": "Wiesz, świetnie pływam, a jednak za każdym razem, gdy patrzę ci w oczy, tonę.",
    "uk": "Знаєш, я чудово вмію плавати, та щоразу, коли дивлюся в твої очі, все одно тону.",
    "pt": "Sabe, eu nado muito bem, mas sempre que olho nos seus olhos, acabo por me afundar mesmo assim.",
    "nl": "Weet je, ik kan heel goed zwemmen, en toch verdrink ik elke keer als ik in jouw ogen kijk.",
    "tr": "Biliyor musun, çok iyi yüzerim; ama gözlerine her baktığımda yine de boğuluyorum.",
    "ro": "Știi, înot foarte bine, și totuși, de fiecare dată când mă uit în ochii tăi, tot mă scufund.",
    "cs": "Víš, plavu opravdu dobře, a přesto se pokaždé, když se ti podívám do očí, stejně topím.",
    "sv": "Du vet, jag simmar riktigt bra, och ändå sjunker jag varje gång jag ser in i dina ögon.",
    "el": "Ξέρεις, κολυμπάω πολύ καλά, κι όμως κάθε φορά που κοιτάζω τα μάτια σου βυθίζομαι.",
    "da": "Ved du hvad, jeg er ellers en rigtig god svømmer, men hver gang jeg ser ind i dine øjne, synker jeg alligevel.",
    "no": "Vet du, jeg er faktisk en veldig god svømmer, men hver gang jeg ser inn i øynene dine, forsvinner jeg likevel helt i dem.",
    "fi": "Tiedätkö, olen oikein hyvä uimari, mutta aina kun katson silmiisi, uppoan niihin silti.",
    "ja": "泳ぎにはけっこう自信があるんです。それなのに、あなたの瞳をのぞき込むたびに、やっぱりいつも溺れてしまいます。",
    "ko": "있잖아요, 저는 수영을 꽤 잘하는데도 당신의 눈을 바라볼 때마다 그 안에 그만 빠져들고 말아요.",
    "zh": "你知道嗎，我明明很會游泳，可是每一次望進你的眼睛，還是會不由自主地陷進去，怎麼也游不出來。",
    "th": "รู้ไหม ฉันว่ายน้ำเก่งมาก แต่ทุกครั้งที่มองเข้าไปในดวงตาของคุณ ฉันก็ยังคงจมลงไปในนั้นอยู่ดี",
    "ar": "الحقيقة أنني أجيد السباحة جيدًا، ومع ذلك أضيع في عينيك كلما نظرت إليهما.",
    "ind": "Kamu tahu, aku sebenarnya perenang yang andal, tapi setiap kali menatap matamu, aku tetap saja tenggelam di dalamnya.",
    "vi": "Bạn biết không, mình bơi rất giỏi, vậy mà mỗi lần nhìn vào mắt bạn, mình vẫn chìm đắm trong đó."
  },
  {
    "id": 3,
    "category": "warm",
    "ru": "Твоя улыбка обладает удивительной силой: появляется на твоём лице, а счастливее почему-то становлюсь я.",
    "en": "Your smile has an amazing gift: it appears on your face, yet somehow I am the one who becomes happier.",
    "fr": "Ton sourire a un pouvoir merveilleux : il apparaît sur ton visage, et pourtant, c’est mon bonheur qui grandit.",
    "de": "Dein Lächeln hat eine erstaunliche Kraft: Es erscheint auf deinem Gesicht, und glücklicher werde irgendwie ich.",
    "es": "Tu sonrisa tiene un don asombroso: aparece en tu cara y, sin embargo, quien se siente más feliz soy yo.",
    "it": "Il tuo sorriso ha un potere sorprendente: appare sul tuo viso, eppure, chissà come, sono io a sentirmi più felice.",
    "pl": "Twój uśmiech ma niezwykłą moc: pojawia się na twojej twarzy, a szczęście jakimś cudem czuję ja.",
    "uk": "У твоєї усмішки дивовижний дар: вона з’являється на твоєму обличчі, а більше щастя чомусь стає в мене.",
    "pt": "O seu sorriso tem um dom incrível: aparece no seu rosto, mas de alguma forma sou eu que fico mais feliz.",
    "nl": "Jouw glimlach heeft een wonderlijke gave: hij verschijnt op jouw gezicht, maar op de een of andere manier word ik er gelukkiger van.",
    "tr": "Gülümsemenin şaşırtıcı bir yeteneği var: senin yüzünde beliriyor ama nedense mutlu olan ben oluyorum.",
    "ro": "Zâmbetul tău are un dar uimitor: apare pe chipul tău, dar, nu știu cum, bucuria crește în mine.",
    "cs": "Tvůj úsměv má zvláštní dar: objeví se na tvé tváři, a přitom víc štěstí přibude nějak mně.",
    "sv": "Ditt leende har en märklig gåva: det dyker upp i ditt ansikte, men på något sätt är det jag som blir gladare.",
    "el": "Το χαμόγελό σου έχει ένα παράξενο χάρισμα: εμφανίζεται στο πρόσωπό σου, αλλά, δεν ξέρω πώς, η χαρά μεγαλώνει μέσα μου.",
    "da": "Dit smil har en forunderlig evne: det lyser op i dit ansigt, og alligevel er det på en eller anden måde mig, der bliver gladere.",
    "no": "Smilet ditt har en forunderlig gave: det dukker opp i ansiktet ditt, men på et eller annet vis er det jeg som blir lykkeligere.",
    "fi": "Hymylläsi on ihmeellinen lahja: se ilmestyy sinun kasvoillesi, mutta jostain syystä minä olen se, joka tulee onnellisemmaksi.",
    "ja": "あなたの笑顔には不思議な力があります。浮かぶのはあなたの顔なのに、なぜだか幸せになるのは私のほうなのです。",
    "ko": "당신의 미소에는 신기한 힘이 있어요. 미소는 당신 얼굴에 피어나는데, 어쩐지 더 행복해지는 건 저예요.",
    "zh": "你的笑容有一種奇妙的本領：明明是出現在你的臉上，可不知道為什麼，變得更快樂的那個人，卻總是我。",
    "th": "รอยยิ้มของคุณมีพรสวรรค์ที่น่าอัศจรรย์: มันปรากฏบนใบหน้าของคุณ แต่คนที่มีความสุขมากขึ้นกลับกลายเป็นฉัน",
    "ar": "لابتسامتك سرّ عجيب: تظهر على وجهك، أما السعادة فتزداد في قلبي أنا.",
    "ind": "Senyummu punya keajaiban tersendiri: ia muncul di wajahmu, tapi entah bagaimana justru aku yang jadi lebih bahagia.",
    "vi": "Nụ cười của bạn có một sức mạnh kỳ diệu: nó nở trên gương mặt bạn, vậy mà không hiểu sao người hạnh phúc hơn lại là mình."
  },
  {
    "id": 4,
    "category": "warm",
    "ru": "Иногда хочется остановить время, чтобы ещё немного побыть рядом с тобой.",
    "en": "Sometimes I wish I could pause time, just to stay by your side a little longer.",
    "fr": "Parfois, j’aimerais arrêter le temps, simplement pour rester encore un peu près de toi.",
    "de": "Manchmal möchte ich die Zeit anhalten, nur um noch ein wenig länger bei dir zu sein.",
    "es": "A veces quisiera detener el tiempo, solo para quedarme un poco más a tu lado.",
    "it": "A volte vorrei fermare il tempo, solo per restare ancora un po’ accanto a te.",
    "pl": "Czasem chciałoby się zatrzymać czas, żeby jeszcze chwilę pobyć przy tobie.",
    "uk": "Іноді мені хочеться зупинити час, щоб просто побути поруч із тобою трохи довше.",
    "pt": "Às vezes gostaria de parar o tempo, só para ficar ao seu lado um pouco mais.",
    "nl": "Soms zou ik de tijd willen stilzetten, gewoon om iets langer bij jou te kunnen blijven.",
    "tr": "Bazen zamanı durdurmak istiyorum; sadece yanında biraz daha kalabilmek için.",
    "ro": "Uneori aș vrea să opresc timpul, doar ca să mai stau puțin lângă tine.",
    "cs": "Někdy bych chtěl zastavit čas, jen abych mohl zůstat vedle tebe o trochu déle.",
    "sv": "Ibland önskar jag att jag kunde stanna tiden, bara för att få vara kvar vid din sida lite längre.",
    "el": "Μερικές φορές θα ήθελα να σταματήσω τον χρόνο, μόνο και μόνο για να μείνω δίπλα σου λίγο ακόμη.",
    "da": "Nogle gange ville jeg ønske, at jeg kunne sætte tiden på pause, bare for at blive ved din side lidt længere.",
    "no": "Noen ganger skulle jeg ønske jeg kunne sette tiden på pause, bare for å bli ved din side litt lenger.",
    "fi": "Joskus toivon, että voisin pysäyttää ajan — vain jäädäkseni viereesi hetkeksi pidempään.",
    "ja": "ときどき、時間を止められたらと思います。ほんの少しだけ長く、あなたのそばにいられるように。",
    "ko": "가끔은 시간을 잠시 멈추고 싶어요. 그저 당신 곁에 조금만 더 머물고 싶어서요.",
    "zh": "有時候，我真希望能按下時間的暫停鍵，什麼都不做，什麼都不想，只為了在你身邊多待一會兒。",
    "th": "บางครั้งฉันก็อยากหยุดเวลาไว้ เพียงเพื่อจะได้อยู่เคียงข้างคุณนานขึ้นอีกสักนิด",
    "ar": "أتمنى أحيانًا لو أستطيع إيقاف الزمن، فقط لأبقى إلى جانبك وقتًا أطول قليلًا.",
    "ind": "Kadang aku ingin menghentikan waktu sejenak, hanya supaya bisa berada di sisimu sedikit lebih lama.",
    "vi": "Đôi khi mình ước có thể dừng thời gian lại, chỉ để được ở bên bạn thêm một chút nữa."
  },
  {
    "id": 5,
    "category": "warm",
    "ru": "Ты умеешь делать красивым даже самый обычный день — достаточно одного сообщения от тебя.",
    "en": "You know how to make even the most ordinary day beautiful — one message from you is enough.",
    "fr": "Tu sais embellir même la journée la plus ordinaire — un seul message de toi suffit.",
    "de": "Du kannst selbst den gewöhnlichsten Tag schön machen — dafür reicht eine einzige Nachricht von dir.",
    "es": "Sabes hacer bonito hasta el día más corriente: basta con un solo mensaje tuyo.",
    "it": "Sai rendere bello anche il giorno più normale: basta un tuo messaggio.",
    "pl": "Potrafisz sprawić, że nawet najzwyklejszy dzień staje się piękny — wystarczy jedna wiadomość od ciebie.",
    "uk": "Ти вмієш зробити гарним навіть найзвичайніший день — досить одного повідомлення від тебе.",
    "pt": "Você sabe tornar bonito até o dia mais comum — basta uma mensagem sua.",
    "nl": "Jij weet zelfs de gewoonste dag mooi te maken — één berichtje van jou is genoeg.",
    "tr": "En sıradan günü bile güzelleştirmeyi biliyorsun — senden gelen tek bir mesaj yetiyor.",
    "ro": "Știi să faci frumoasă chiar și cea mai obișnuită zi — ajunge un singur mesaj de la tine.",
    "cs": "Umíš udělat krásným i ten nejobyčejnější den — stačí jedna zpráva od tebe.",
    "sv": "Du kan göra även den vanligaste dag vacker — ett enda meddelande från dig räcker.",
    "el": "Ξέρεις να κάνεις όμορφη ακόμη και την πιο συνηθισμένη μέρα — αρκεί ένα μήνυμα από σένα.",
    "da": "Du kan gøre selv den mest almindelige dag smuk — én besked fra dig er nok.",
    "no": "Du kan gjøre selv den mest vanlige dag vakker – én melding fra deg er nok.",
    "fi": "Sinä osaat tehdä tavallisimmastakin päivästä kauniin — yksi viesti sinulta riittää.",
    "ja": "あなたは、どんなにありふれた一日も美しく変えてしまいます。あなたからのメッセージがひとつ届くだけで、それで十分なのです。",
    "ko": "당신은 가장 평범한 하루도 아름답게 만들 줄 알아요. 당신에게서 온 메시지 하나면 충분하거든요.",
    "zh": "你總有辦法讓最平凡的一天變得美好——不需要什麼特別的事，只要收到你的一則訊息，就已經足夠了。",
    "th": "คุณทำให้แม้แต่วันธรรมดาที่สุดกลายเป็นวันที่งดงามได้ เพียงข้อความเดียวจากคุณก็เพียงพอแล้ว",
    "ar": "حتى أكثر الأيام عاديةً يصير جميلًا بفضلك؛ تكفي رسالة واحدة منك.",
    "ind": "Kamu tahu cara membuat hari yang paling biasa pun terasa indah — satu pesan darimu saja sudah cukup.",
    "vi": "Bạn biết cách làm cho cả một ngày bình thường nhất trở nên đẹp đẽ — chỉ cần một tin nhắn từ bạn là đủ."
  },
  {
    "id": 6,
    "category": "warm",
    "ru": "Когда ты улыбаешься, мне хочется улыбаться в ответ, даже если до этого настроение было совсем другим.",
    "en": "When you smile, I want to smile back, even if I was feeling completely different just a moment before.",
    "fr": "Quand tu souris, j’ai envie de te répondre par un sourire, même si mon humeur était tout autre juste avant.",
    "de": "Wenn du lächelst, möchte ich zurücklächeln, selbst wenn meine Stimmung einen Moment zuvor ganz anders war.",
    "es": "Cuando sonríes, me dan ganas de sonreírte también, aunque un momento antes mi ánimo fuera muy distinto.",
    "it": "Quando sorridi, mi viene voglia di sorriderti a mia volta, anche se un attimo prima il mio umore era tutt’altro.",
    "pl": "Kiedy się uśmiechasz, mam ochotę uśmiechnąć się w odpowiedzi, nawet jeśli chwilę wcześniej nastrój był zupełnie inny.",
    "uk": "Коли ти усміхаєшся, мені хочеться усміхнутися у відповідь, навіть якщо мить тому настрій був зовсім інший.",
    "pt": "Quando você sorri, dá-me vontade de sorrir de volta, mesmo que um momento antes eu estivesse sentindo algo completamente diferente.",
    "nl": "Als jij lacht, wil ik teruglachen, ook al voelde ik me een moment eerder heel anders.",
    "tr": "Sen gülümseyince ben de gülümsemek istiyorum, bir an önce bambaşka hissediyor olsam bile.",
    "ro": "Când zâmbești, îmi vine să-ți zâmbesc înapoi, chiar dacă o clipă înainte mă simțeam cu totul altfel.",
    "cs": "Když se usmíváš, chci se usmát zpátky, i kdybych se před chvílí cítil úplně jinak.",
    "sv": "När du ler vill jag le tillbaka, även om jag kände något helt annat en stund tidigare.",
    "el": "Όταν χαμογελάς, θέλω να σου χαμογελάσω κι εγώ, ακόμη κι αν μια στιγμή πριν ένιωθα εντελώς διαφορετικά.",
    "da": "Når du smiler, får jeg lyst til at smile tilbage, selv hvis jeg et øjeblik forinden havde det helt anderledes.",
    "no": "Når du smiler, får jeg lyst til å smile tilbake, selv om jeg følte noe helt annet bare et øyeblikk før.",
    "fi": "Kun sinä hymyilet, minun tekee mieli hymyillä takaisin, vaikka hetkeä aiemmin olisin tuntenut aivan toisin.",
    "ja": "あなたが笑うと、私もつい笑い返したくなります。その少し前まで、まったく違う気分でいたとしても。",
    "ko": "당신이 웃으면 저도 따라 웃고 싶어져요. 바로 조금 전까지 전혀 다른 기분이었더라도요.",
    "zh": "只要你一笑，我就忍不住想跟著笑起來。哪怕就在前一秒鐘，我的心情還完全是另一回事，看到你的笑容，也都不一樣了。",
    "th": "เมื่อคุณยิ้ม ฉันก็อยากยิ้มตอบ แม้ว่าเพียงครู่ก่อนหน้านั้นฉันจะรู้สึกต่างออกไปโดยสิ้นเชิงก็ตาม",
    "ar": "ابتسامتك تجعلني أرغب في أن أبتسم بدوري، حتى لو كان مزاجي مختلفًا تمامًا قبل لحظة.",
    "ind": "Saat kamu tersenyum, aku ingin membalasnya dengan senyum, meski sesaat sebelumnya perasaanku sama sekali berbeda.",
    "vi": "Khi bạn cười, mình cũng muốn mỉm cười đáp lại, dù chỉ một khoảnh khắc trước đó tâm trạng mình còn hoàn toàn khác."
  },
  {
    "id": 7,
    "category": "warm",
    "ru": "Рядом с тобой часы пролетают как минуты, а без тебя минуты иногда кажутся часами.",
    "en": "With you, hours pass like minutes; without you, minutes can sometimes feel like hours.",
    "fr": "Près de toi, les heures passent comme des minutes ; loin de toi, les minutes semblent parfois durer des heures.",
    "de": "Mit dir vergehen Stunden wie Minuten, ohne dich fühlen sich Minuten manchmal wie Stunden an.",
    "es": "Contigo, las horas pasan como minutos; sin ti, a veces los minutos parecen horas.",
    "it": "Con te le ore passano come minuti; senza di te, a volte i minuti sembrano ore.",
    "pl": "Przy tobie godziny mijają jak minuty, a bez ciebie minuty czasem wydają się godzinami.",
    "uk": "З тобою години минають, як хвилини; без тебе хвилини іноді тягнуться, як години.",
    "pt": "Com você, as horas passam como minutos; sem você, os minutos às vezes parecem horas.",
    "nl": "Met jou gaan de uren voorbij als minuten; zonder jou voelen minuten soms als uren.",
    "tr": "Seninleyken saatler dakika gibi geçiyor; sensizken dakikalar bazen saat gibi uzuyor.",
    "ro": "Cu tine, orele trec ca minutele; fără tine, minutele par uneori ore.",
    "cs": "S tebou hodiny plynou jako minuty; bez tebe se minuty někdy táhnou jako hodiny.",
    "sv": "Med dig går timmarna som minuter; utan dig känns minuterna ibland som timmar.",
    "el": "Μαζί σου οι ώρες περνούν σαν λεπτά· χωρίς εσένα τα λεπτά μοιάζουν καμιά φορά με ώρες.",
    "da": "Sammen med dig flyver timerne af sted som minutter; uden dig kan minutterne nogle gange føles som timer.",
    "no": "Med deg går timene som minutter; uten deg kan minuttene noen ganger kjennes som timer.",
    "fi": "Sinun kanssasi tunnit kuluvat kuin minuutit; ilman sinua minuutit tuntuvat joskus tunneilta.",
    "ja": "あなたといると、何時間もほんの数分のように過ぎていきます。あなたがいないと、数分が何時間にも感じられることがあるのに。",
    "ko": "당신과 함께면 몇 시간이 몇 분처럼 흘러가고, 당신이 없으면 몇 분이 몇 시간처럼 느껴질 때가 있어요.",
    "zh": "和你在一起的時候，幾個小時像幾分鐘一樣飛快；沒有你的時候，短短幾分鐘有時卻漫長得像幾個小時。",
    "th": "เมื่ออยู่กับคุณ หลายชั่วโมงผ่านไปราวกับไม่กี่นาที แต่เมื่อไม่มีคุณ บางครั้งไม่กี่นาทีก็ยาวนานราวกับหลายชั่วโมง",
    "ar": "معك تمرّ الساعات كأنها دقائق، ومن دونك تبدو الدقائق أحيانًا كأنها ساعات.",
    "ind": "Bersamamu, jam-jam berlalu seperti menit; tanpamu, menit-menit kadang terasa seperti berjam-jam.",
    "vi": "Bên bạn, hàng giờ trôi qua như vài phút; vắng bạn, vài phút đôi khi dài như hàng giờ."
  },
  {
    "id": 8,
    "category": "warm",
    "ru": "Я могу забыть, о чём мы говорили, но никогда не забуду, что чувствовал в тот момент, когда смотрел на тебя.",
    "en": "I may forget what we talked about, but I will never forget how I felt in that moment when I looked at you.",
    "fr": "J’oublierai peut-être ce dont nous parlions, mais jamais ce que j’ai ressenti à cet instant en te regardant.",
    "de": "Vielleicht vergesse ich, worüber wir gesprochen haben, aber nie, was ich in dem Moment gefühlt habe, als ich dich ansah.",
    "es": "Puede que olvide de qué hablamos, pero nunca olvidaré lo que sentí en ese instante, al mirarte.",
    "it": "Forse dimenticherò di cosa abbiamo parlato, ma non dimenticherò mai cosa ho provato in quel momento, guardandoti.",
    "pl": "Mogę zapomnieć, o czym była mowa, ale nigdy nie zapomnę tego, co czuje serce, kiedy na ciebie patrzę.",
    "uk": "Я можу забути, про що ми говорили, але ніколи не забуду, що було в мене на серці тієї миті, коли мій погляд зупинився на тобі.",
    "pt": "Posso esquecer sobre o que conversámos, mas nunca vou esquecer o que senti naquele momento em que olhei para você.",
    "nl": "Ik vergeet misschien waar we het over hadden, maar nooit wat ik voelde op het moment dat ik naar jou keek.",
    "tr": "Ne konuştuğumuzu unutabilirim ama sana baktığım o an hissettiklerimi asla unutmayacağım.",
    "ro": "Pot uita despre ce am vorbit, dar nu voi uita niciodată ce am simțit în clipa în care te-am privit.",
    "cs": "Můžu zapomenout, o čem jsme mluvili, ale nikdy nezapomenu, co jsem cítil ve chvíli, kdy jsem se na tebe díval.",
    "sv": "Jag kanske glömmer vad vi pratade om, men jag glömmer aldrig vad jag kände i den stund då jag såg på dig.",
    "el": "Μπορεί να ξεχάσω τι είπαμε, αλλά δεν θα ξεχάσω ποτέ τι ένιωσα εκείνη τη στιγμή που σε κοίταξα.",
    "da": "Jeg kan måske glemme, hvad vi talte om, men jeg glemmer aldrig, hvad jeg følte i det øjeblik, jeg så på dig.",
    "no": "Jeg kan komme til å glemme hva vi snakket om, men jeg glemmer aldri hva jeg følte i det øyeblikket jeg så på deg.",
    "fi": "Saatan unohtaa, mistä puhuimme, mutta en koskaan unohda, miltä minusta tuntui sillä hetkellä, kun katsoin sinua.",
    "ja": "何を話したかは忘れてしまうかもしれません。でも、あなたを見つめたあの瞬間に感じたことは、決して忘れません。",
    "ko": "우리가 무슨 이야기를 나눴는지는 잊을지 몰라도, 당신을 바라보던 그 순간의 마음만은 결코 잊지 못할 거예요.",
    "zh": "我也許會忘記我們當時聊了些什麼，卻怎麼也忘不了那一刻——當我看著你的時候，心裡是什麼樣的感覺。",
    "th": "ฉันอาจลืมว่าเราคุยอะไรกัน แต่จะไม่มีวันลืมความรู้สึกในชั่วขณะที่ฉันมองคุณ",
    "ar": "قد أنسى ما تحدثنا عنه، لكنني لن أنسى أبدًا ما شعرت به في تلك اللحظة حين نظرت إليك.",
    "ind": "Aku mungkin lupa apa yang kita bicarakan, tapi aku takkan pernah lupa apa yang kurasakan saat menatapmu waktu itu.",
    "vi": "Mình có thể quên chúng ta đã nói về điều gì, nhưng sẽ không bao giờ quên cảm giác của mình trong khoảnh khắc ngắm nhìn bạn."
  },
  {
    "id": 9,
    "category": "support",
    "ru": "Ты прекрасна даже тогда, когда сама этого не замечаешь.",
    "en": "You are beautiful even when you do not notice it yourself.",
    "fr": "Tu es magnifique, même lorsque tu ne t’en rends pas compte.",
    "de": "Du bist wunderschön, selbst wenn du es gar nicht bemerkst.",
    "es": "Tienes una belleza que brilla incluso cuando tú no la notas.",
    "it": "Hai una bellezza che risplende anche quando non te ne accorgi.",
    "pl": "Twoje piękno widać nawet wtedy, gdy tego nie zauważasz.",
    "uk": "Твоя краса помітна навіть тоді, коли ти цього не помічаєш.",
    "pt": "A sua beleza aparece mesmo quando você não a nota.",
    "nl": "Jouw schoonheid is zichtbaar, zelfs als je het zelf niet merkt.",
    "tr": "Güzelliğin, sen fark etmediğinde bile görünüyor.",
    "ro": "Frumusețea ta se vede chiar și atunci când tu nu o observi.",
    "cs": "Tvoje krása je vidět, i když si jí sama nevšímáš.",
    "sv": "Din skönhet syns även när du själv inte märker den.",
    "el": "Η ομορφιά σου φαίνεται ακόμη κι όταν εσύ δεν την προσέχεις.",
    "da": "Du er smuk, også når du ikke selv lægger mærke til det.",
    "no": "Du er vakker, også når du ikke legger merke til det selv.",
    "fi": "Olet kaunis silloinkin, kun et itse sitä huomaa — ehkä juuri silloin kaikkein eniten.",
    "ja": "あなたは美しい人です。自分では気づいていないときでさえ、その美しさはいつも変わりません。",
    "ko": "당신은 스스로 알아채지 못하는 순간에도 아름다운 사람이에요. 당신이 모르는 그 모습을 저는 늘 보고 있어요.",
    "zh": "你真的很美好——即使在你自己完全沒有察覺的時候，這份美好也依然在那裡，一點都沒有少，一直被我看見。",
    "th": "คุณงดงามเสมอ แม้ในยามที่คุณเองก็ไม่ทันสังเกตเห็นความงามนั้น",
    "ar": "جمالك حاضر حتى في اللحظات التي يغيب فيها عن انتباهك.",
    "ind": "Kamu menawan, bahkan saat kamu sendiri tidak menyadarinya.",
    "vi": "Bạn đẹp ngay cả khi chính bạn không nhận ra điều đó."
  },
  {
    "id": 10,
    "category": "warm",
    "ru": "Если бы за каждую мысль о тебе появлялась звезда, ночное небо стало бы намного ярче.",
    "en": "If a star appeared for every thought of you, the night sky would shine much brighter.",
    "fr": "Si une étoile apparaissait chaque fois que je pense à toi, le ciel nocturne serait bien plus lumineux.",
    "de": "Wenn für jeden Gedanken an dich ein Stern erschiene, würde der Nachthimmel viel heller leuchten.",
    "es": "Si por cada pensamiento dedicado a ti apareciera una estrella, el cielo nocturno brillaría mucho más.",
    "it": "Se per ogni pensiero dedicato a te nascesse una stella, il cielo notturno brillerebbe molto di più.",
    "pl": "Gdyby każda myśl o tobie zapalała gwiazdę, nocne niebo świeciłoby dużo jaśniej.",
    "uk": "Якби за кожну думку про тебе на небі з’являлася зірка, нічне небо сяяло б набагато яскравіше.",
    "pt": "Se surgisse uma estrela por cada pensamento em você, o céu da noite brilharia muito mais.",
    "nl": "Als er voor elke gedachte aan jou een ster verscheen, zou de nachthemel veel helderder stralen.",
    "tr": "Seni her düşündüğümde gökyüzünde bir yıldız belirseydi, gece çok daha parlak olurdu.",
    "ro": "Dacă pentru fiecare gând despre tine ar apărea o stea, cerul nopții ar străluci mult mai tare.",
    "cs": "Kdyby se za každou myšlenku na tebe objevila hvězda, noční obloha by zářila mnohem jasněji.",
    "sv": "Om en stjärna tändes för varje tanke på dig skulle natthimlen lysa mycket starkare.",
    "el": "Αν για κάθε σκέψη μου για σένα εμφανιζόταν ένα αστέρι, ο νυχτερινός ουρανός θα έλαμπε πολύ πιο δυνατά.",
    "da": "Hvis der tændtes en ny stjerne for hver tanke om dig, ville nattehimlen lyse meget klarere.",
    "no": "Hvis det tentes en stjerne for hver tanke på deg, ville nattehimmelen lyst mye sterkere.",
    "fi": "Jos jokaisesta ajatuksesta sinusta syttyisi tähti, yötaivas loistaisi paljon kirkkaampana.",
    "ja": "あなたを想うたびに星がひとつ生まれるなら、夜空は今よりもずっと明るく輝いているはずです。",
    "ko": "당신을 떠올릴 때마다 별이 하나씩 생긴다면, 밤하늘은 지금보다 훨씬 더 환하게 빛날 거예요.",
    "zh": "如果每想起你一次，天上就會多出一顆星星，那麼今晚的夜空，一定會比現在明亮好幾倍，亮得讓人捨不得睡。",
    "th": "หากทุกครั้งที่คิดถึงคุณมีดาวดวงหนึ่งปรากฏขึ้น ท้องฟ้ายามค่ำคืนคงสว่างไสวกว่านี้อีกมาก",
    "ar": "لو ظهرت نجمة مع كل فكرة تخطر لي عنك، لصارت سماء الليل أشد إشراقًا بكثير.",
    "ind": "Seandainya setiap kali aku memikirkanmu muncul satu bintang, langit malam pasti akan bersinar jauh lebih terang.",
    "vi": "Nếu mỗi lần mình nghĩ về bạn lại có một ngôi sao xuất hiện, bầu trời đêm hẳn đã sáng hơn rất nhiều."
  },
  {
    "id": 11,
    "category": "warm"
  },
  {
    "id": 12,
    "category": "gratitude"
  },
  {
    "id": 13,
    "category": "warm"
  },
  {
    "id": 14,
    "category": "warm"
  },
  {
    "id": 15,
    "category": "warm"
  },
  {
    "id": 16,
    "category": "warm"
  },
  {
    "id": 17,
    "category": "warm"
  },
  {
    "id": 18,
    "category": "warm"
  },
  {
    "id": 19,
    "category": "gratitude"
  },
  {
    "id": 20,
    "category": "support"
  },
  {
    "id": 21,
    "category": "warm"
  },
  {
    "id": 22,
    "category": "warm"
  },
  {
    "id": 23,
    "category": "support"
  },
  {
    "id": 24,
    "category": "gratitude"
  },
  {
    "id": 25,
    "category": "warm"
  },
  {
    "id": 26,
    "category": "support"
  },
  {
    "id": 27,
    "category": "support"
  },
  {
    "id": 28,
    "category": "gratitude"
  },
  {
    "id": 29,
    "category": "support"
  },
  {
    "id": 30,
    "category": "support"
  },
  {
    "id": 31,
    "category": "warm"
  },
  {
    "id": 32,
    "category": "support"
  },
  {
    "id": 33,
    "category": "support"
  },
  {
    "id": 34,
    "category": "gratitude"
  },
  {
    "id": 35,
    "category": "gratitude"
  },
  {
    "id": 36,
    "category": "gratitude"
  },
  {
    "id": 37,
    "category": "family"
  },
  {
    "id": 38,
    "category": "gratitude"
  },
  {
    "id": 39,
    "category": "family"
  },
  {
    "id": 40,
    "category": "warm"
  },
  {
    "id": 41,
    "category": "support"
  },
  {
    "id": 42,
    "category": "gratitude"
  },
  {
    "id": 43,
    "category": "support"
  },
  {
    "id": 44,
    "category": "warm"
  },
  {
    "id": 45,
    "category": "support"
  },
  {
    "id": 46,
    "category": "family"
  },
  {
    "id": 47,
    "category": "family"
  },
  {
    "id": 48,
    "category": "support"
  },
  {
    "id": 49,
    "category": "support"
  },
  {
    "id": 50,
    "category": "warm"
  }
]);
