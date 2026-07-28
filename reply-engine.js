((root, factory) => {
  "use strict";
  root.NUR_REPLY_ENGINE = Object.freeze(factory());
})(globalThis, () => {
  "use strict";

  const SUPPORTED_LANGUAGES = new Set(["ru", "en", "fr"]);
  const SUPPORTED_TONES = new Set(["auto", "calm", "warm", "support", "reconcile", "boundary"]);
  const SUPPORTED_LENGTHS = new Set(["auto", "short", "standard", "detailed"]);

  const SIGNALS = {
    religiousGratitude: [
      "хвала аллаху", "благодарю аллаха", "благодарен аллаху", "благодарна аллаху", "альхамдулиллях", "алхамдулиллях", "алхамдулиллах",
      "praise be to allah", "thank allah", "grateful to allah", "alhamdulillah",
      "louange a allah", "remercie allah", "remercier allah"
    ],
    islamicGreeting: [
      "ассаляму алейкум", "ас саляму алейкум", "салам алейкум", "assalamu alaikum", "as salamu alaykum", "salam alaykoum", "salam alaykum"
    ],
    distress: [
      "мне тяжело", "мне плохо", "мне грустно", "я устал", "я устала", "не справляюсь", "очень трудно", "больно на душе", "нужна помощь", "нужна поддержка", "нужен совет",
      "i am struggling", "i feel bad", "i am sad", "i am tired", "this is hard", "i need help", "i need support",
      "je vais mal", "je suis triste", "je suis fatigue", "je suis fatiguee", "c est difficile", "j ai besoin d aide", "j ai besoin de soutien"
    ],
    apology: [
      "прости", "извини", "прошу прощения", "мне жаль", "виноват", "виновата",
      "sorry", "forgive me", "i apologize", "my fault",
      "pardon", "excuse moi", "je suis desole", "je suis desolee", "ma faute"
    ],
    conflict: [
      "обидел", "обидела", "обидно", "ссора", "поссорились", "злюсь", "сердит", "неуважение", "не хочу разговаривать", "ты меня не понимаешь",
      "argument", "we argued", "i am angry", "you hurt me", "disrespect", "do not want to talk", "you do not understand me",
      "dispute", "nous nous sommes disputes", "je suis en colere", "tu m as blesse", "manque de respect", "tu ne me comprends pas"
    ],
    gratitude: [
      "спасибо", "благодарю", "благодарен", "благодарна", "ценю тебя", "ценю твою", "признателен", "признательна",
      "thank you", "thanks", "grateful", "appreciate you", "appreciate your",
      "merci", "remercie", "reconnaissant", "reconnaissante", "je t apprecie", "j apprecie"
    ],
    celebration: [
      "поздравляю", "рад за тебя", "рада за тебя", "горжусь тобой", "получилось", "хорошая новость",
      "congratulations", "happy for you", "proud of you", "great news", "you did it",
      "felicitations", "heureux pour toi", "heureuse pour toi", "fier de toi", "fiere de toi", "bonne nouvelle"
    ],
    appreciation: [
      "ты замечательный", "ты замечательная", "ты прекрасный", "ты прекрасная", "ты добрый", "ты добрая", "ты важен", "ты важна", "хорошо что ты есть",
      "you are wonderful", "you are amazing", "you are kind", "you matter to me", "glad you are here",
      "tu es formidable", "tu es merveilleux", "tu es merveilleuse", "tu es gentil", "tu es gentille", "tu comptes pour moi"
    ],
    wellbeingQuestion: [
      "как ты", "как дела", "как себя чувствуешь", "все хорошо", "все в порядке",
      "how are you", "how do you feel", "are you okay", "is everything okay",
      "comment vas tu", "comment ca va", "comment te sens tu", "tout va bien"
    ],
    timeQuestion: [
      "во сколько", "когда придешь", "когда приедешь", "когда вернешься", "когда будешь", "который час",
      "what time", "when will you arrive", "when are you coming", "when will you return",
      "a quelle heure", "quand arrives tu", "quand viendras tu", "quand rentres tu"
    ],
    generalQuestion: [
      "почему", "зачем", "можно ли", "ты соглас", "что думаешь", "как поступить", "сможешь ли", "будешь ли",
      "why", "can you", "do you", "will you", "what do you think", "should we",
      "pourquoi", "peux tu", "es tu d accord", "qu en penses tu", "vas tu", "devrions nous"
    ],
    greeting: [
      "привет", "доброе утро", "добрый день", "добрый вечер", "здравствуй", "здравствуйте",
      "hello", "hi", "good morning", "good afternoon", "good evening",
      "bonjour", "bonsoir", "salut"
    ],
    care: [
      "скучаю", "не хватает тебя", "думаю о тебе", "береги себя",
      "miss you", "thinking of you", "take care",
      "tu me manques", "je pense a toi", "prends soin de toi"
    ]
  };

  const RESPONSES = {
    ru: {
      religious_gratitude: [
        "Альхамдулиллях. Я тоже благодарю Аллаха за тебя. Пусть Аллах хранит тебя, укрепляет в добре и дарует тебе благо.",
        "Альхамдулиллях за такие добрые слова. Я также благодарю Аллаха за тебя. Пусть в твоей жизни будет больше мира, добра и благословения."
      ],
      islamic_greeting: [
        "Ва алейкум ассалям ва рахматуллахи ва баракатух. Спасибо за сообщение. Пусть твой день будет спокойным и наполненным благом.",
        "Ва алейкум ассалям ва рахматуллахи ва баракатух. Очень приятно получить твоё сообщение. Пусть Аллах дарует тебе мир и добро."
      ],
      gratitude: [
        "Спасибо за такие тёплые слова. Мне очень приятно это слышать. Я тоже ценю тебя и всё добро, которое есть в нашем общении.",
        "Спасибо тебе за искренность. Твои слова много для меня значат. Я очень ценю твоё внимание и доброе отношение."
      ],
      celebration: [
        "Спасибо за поддержку и добрые слова. Мне очень приятно, что ты разделяешь эту радость. Пусть впереди будет ещё больше хороших новостей.",
        "Спасибо, что радуешься вместе со мной. Такое внимание действительно согревает. Пусть и у тебя будет много поводов для радости."
      ],
      appreciation: [
        "Спасибо за такие искренние слова. Мне очень приятно их слышать. Я тоже ценю тебя и с благодарностью отношусь к нашему общению.",
        "Твои слова согрели меня. Спасибо за доброе отношение и внимание. Для меня это действительно важно."
      ],
      support: [
        "Мне очень жаль, что тебе сейчас тяжело. Я рядом и могу спокойно выслушать, без давления и лишних советов. Скажи, какая поддержка была бы полезнее сейчас.",
        "Спасибо, что доверяешь и рассказываешь об этом. Не нужно проходить через всё в одиночку. Я могу выслушать и постараться помочь так, как тебе будет удобно."
      ],
      apology: [
        "Спасибо, что говоришь об этом прямо. Я ценю искреннее желание всё исправить. Давай спокойно оставим недопонимание позади и будем внимательнее друг к другу.",
        "Я понимаю твои слова и отношусь к ним с уважением. Спасибо за искренность. Для меня важно, чтобы дальше мы говорили спокойно и бережно."
      ],
      conflict: [
        "Я понимаю, что эта ситуация задела тебя. Мне важно не усиливать спор, а спокойно разобраться в том, что произошло. Давай выслушаем друг друга без резких слов.",
        "Твои чувства важны, и я не хочу отвечать раздражением. Предлагаю сделать небольшую паузу, а затем спокойно обсудить конкретную причину недопонимания."
      ],
      boundary: [
        "Я хочу ответить спокойно и честно. Мне важно, чтобы разговор оставался уважительным и без давления. Если сейчас это невозможно, лучше сделать паузу и вернуться к теме позже.",
        "Я готов продолжить разговор только в спокойном и уважительном тоне. Прошу принять эту границу. Когда напряжение спадёт, мы сможем вернуться к теме."
      ],
      wellbeing: [
        "Спасибо, что спрашиваешь. Мне приятно твоё внимание. Надеюсь, у тебя тоже всё спокойно — как ты себя чувствуешь?",
        "Спасибо за заботу. Твоё внимание много значит для меня. Расскажи и о себе: как проходит твой день?"
      ],
      time_question: [
        "Не хочу называть время наугад. Я уточню обстоятельства и напишу точнее, как только буду уверен.",
        "Сейчас точное время обещать не могу. Сначала всё проверю, а затем сразу сообщу, когда смогу прийти."
      ],
      question: [
        "Хочу ответить честно и по существу, поэтому не буду придумывать решение наугад. Уточни, пожалуйста, главную деталь, от которой зависит ответ.",
        "Спасибо за прямой вопрос. Мне нужно немного больше информации, чтобы ответить точно. Уточни, пожалуйста, что для тебя здесь самое важное."
      ],
      greeting: [
        "Привет! Спасибо за сообщение. Очень приятно тебя слышать. Надеюсь, твой день проходит спокойно и хорошо.",
        "Здравствуйте! Приятно получить ваше сообщение. Пусть сегодняшний день принесёт вам спокойствие и добрые новости."
      ],
      care: [
        "Спасибо, что говоришь об этом. Мне очень дороги такие искренние слова. Я тоже ценю наше общение и надеюсь, что скоро получится спокойно поговорить.",
        "Твои слова много для меня значат. Спасибо за внимание и заботу. Береги себя — я тоже о тебе помню."
      ],
      neutral: [
        "Спасибо за сообщение. Твои слова не останутся без внимания. Для меня важно ответить уважительно и по существу.",
        "Я внимательно отношусь к твоему сообщению. Спасибо, что поделился этим. Давай продолжим разговор ясно и доброжелательно."
      ]
    },
    en: {
      religious_gratitude: [
        "Alhamdulillah. I thank Allah for you as well. May Allah protect you, strengthen you in goodness, and grant you peace.",
        "Alhamdulillah for such kind words. I also thank Allah for you. May your life be filled with peace, goodness, and blessing."
      ],
      islamic_greeting: [
        "Wa alaykum assalam wa rahmatullahi wa barakatuh. Thank you for writing. May your day be peaceful and full of goodness.",
        "Wa alaykum assalam wa rahmatullahi wa barakatuh. It is good to hear from you. May Allah grant you peace and goodness."
      ],
      gratitude: [
        "Thank you for such warm words. It truly means a lot to me. I value you and the kindness within our conversations as well.",
        "Thank you for being so sincere. Your words matter to me, and I deeply appreciate your care and thoughtfulness."
      ],
      celebration: [
        "Thank you for your support and kind words. It means a lot that you share this joy with me. I hope more good news finds you too.",
        "Thank you for celebrating with me. Your thoughtfulness makes this moment even warmer. May you have many reasons for joy as well."
      ],
      appreciation: [
        "Thank you for saying that so sincerely. It is wonderful to hear. I value you and our conversations very much too.",
        "Your words warmed my heart. Thank you for your kindness and attention. They genuinely mean a great deal to me."
      ],
      support: [
        "I am sorry that things feel difficult right now. I am here to listen calmly, without pressure or unnecessary advice. Tell me what kind of support would help most.",
        "Thank you for trusting me with this. You do not have to carry everything alone. I can listen and try to help in a way that feels comfortable for you."
      ],
      apology: [
        "Thank you for saying this honestly. I appreciate the sincere wish to make things right. Let us leave the misunderstanding behind and be more thoughtful with each other.",
        "I hear your words and receive them with respect. Thank you for being sincere. It matters to me that we speak calmly and carefully from here."
      ],
      conflict: [
        "I understand that this situation hurt you. I do not want to deepen the argument; I want to understand what happened calmly. Let us listen to each other without harsh words.",
        "Your feelings matter, and I do not want to answer with anger. Let us pause briefly and then discuss the specific cause of the misunderstanding calmly."
      ],
      boundary: [
        "I want to answer calmly and honestly. Our conversation needs to remain respectful and free from pressure. If that is not possible now, we should pause and return to it later.",
        "I am willing to continue only in a calm and respectful tone. Please respect that boundary. We can return to the subject when the tension has passed."
      ],
      wellbeing: [
        "Thank you for asking. Your care means a lot to me. I hope things are peaceful for you too—how are you feeling?",
        "Thank you for checking in. I appreciate your thoughtfulness. Tell me about you as well: how is your day going?"
      ],
      time_question: [
        "I do not want to guess about the time. I will check the circumstances and give you a clear update as soon as I am certain.",
        "I cannot promise an exact time yet. I will check everything first and tell you when I can arrive."
      ],
      question: [
        "I want to answer honestly and clearly, so I will not invent a decision. Please clarify the main detail that the answer depends on.",
        "Thank you for asking directly. I need a little more information to answer accurately. What matters most to you in this situation?"
      ],
      greeting: [
        "Hello! Thank you for writing. It is good to hear from you. I hope your day is calm and going well.",
        "Hello! I am glad to receive your message. May today bring you peace and some good news."
      ],
      care: [
        "Thank you for sharing that. Sincere words like these mean a lot to me. I value our connection and hope we can talk calmly soon.",
        "Your words matter to me. Thank you for your care and attention. Please take care of yourself—I remember you too."
      ],
      neutral: [
        "Thank you for the message. Your words will not be overlooked. I want to respond respectfully and address what you actually mean.",
        "I am giving your message proper attention. Thank you for sharing it. Let us continue the conversation clearly and kindly."
      ]
    },
    fr: {
      religious_gratitude: [
        "Alhamdulillah. Moi aussi, je remercie Allah pour toi. Qu’Allah te protège, t’affermisse dans le bien et t’accorde la paix.",
        "Alhamdulillah pour ces paroles bienveillantes. Je remercie également Allah pour toi. Que ta vie soit remplie de paix, de bien et de bénédictions."
      ],
      islamic_greeting: [
        "Wa alaykoum assalam wa rahmatullahi wa barakatuh. Merci pour ton message. Que ta journée soit paisible et remplie de bien.",
        "Wa alaykoum assalam wa rahmatullahi wa barakatuh. Cela me fait plaisir de recevoir ton message. Qu’Allah t’accorde la paix et le bien."
      ],
      gratitude: [
        "Merci pour ces paroles chaleureuses. Elles me touchent sincèrement. Moi aussi, je tiens à toi et à la bienveillance présente dans nos échanges.",
        "Merci pour ta sincérité. Tes mots comptent beaucoup pour moi. J’apprécie profondément ton attention et ta bonté."
      ],
      celebration: [
        "Merci pour ton soutien et tes paroles bienveillantes. Cela me touche que tu partages cette joie avec moi. Je te souhaite aussi beaucoup de bonnes nouvelles.",
        "Merci de te réjouir avec moi. Ton attention rend ce moment encore plus chaleureux. Puisses-tu avoir toi aussi de nombreuses raisons de sourire."
      ],
      appreciation: [
        "Merci d’avoir dit cela avec autant de sincérité. Ces mots me touchent. Moi aussi, je tiens beaucoup à toi et à nos échanges.",
        "Tes paroles m’ont réchauffé le cœur. Merci pour ta bonté et ton attention. Elles comptent vraiment pour moi."
      ],
      support: [
        "Je comprends que cette période soit difficile. Je peux t’écouter calmement, sans pression ni conseils inutiles. Dis-moi quel soutien te serait le plus utile maintenant.",
        "Merci de m’avoir confié cela. Tu n’as pas à tout porter seul. Je peux t’écouter et essayer d’aider d’une manière qui te convient."
      ],
      apology: [
        "Merci d’en parler avec sincérité. J’apprécie le désir réel d’arranger les choses. Laissons ce malentendu derrière nous et soyons plus attentifs l’un envers l’autre.",
        "J’entends tes paroles et je les accueille avec respect. Merci pour ta sincérité. Je tiens à ce que nous parlions désormais avec calme et attention."
      ],
      conflict: [
        "Je comprends que cette situation t’ait blessé. Je ne veux pas prolonger la dispute, mais comprendre calmement ce qui s’est passé. Écoutons-nous sans paroles dures.",
        "Tes sentiments comptent et je ne veux pas répondre avec colère. Faisons une courte pause, puis parlons calmement de la cause précise du malentendu."
      ],
      boundary: [
        "Je souhaite répondre avec calme et sincérité. Notre échange doit rester respectueux et sans pression. Si ce n’est pas possible maintenant, faisons une pause et reprenons plus tard.",
        "Je peux poursuivre uniquement dans un ton calme et respectueux. Merci de respecter cette limite. Nous pourrons reprendre lorsque la tension sera retombée."
      ],
      wellbeing: [
        "Merci de prendre de mes nouvelles. Ton attention me touche. J’espère que tout est paisible pour toi aussi—comment te sens-tu ?",
        "Merci de demander. J’apprécie ta bienveillance. Parle-moi aussi de toi : comment se passe ta journée ?"
      ],
      time_question: [
        "Je ne veux pas donner une heure au hasard. Je vais vérifier les circonstances et te répondre précisément dès que j’en serai certain.",
        "Je ne peux pas encore promettre une heure exacte. Je vérifie d’abord, puis je te dirai quand je pourrai arriver."
      ],
      question: [
        "Je veux répondre avec sincérité et précision, sans inventer de décision. Précise, s’il te plaît, le principal détail dont dépend la réponse.",
        "Merci d’avoir posé la question directement. J’ai besoin d’un peu plus d’informations pour répondre justement. Qu’est-ce qui compte le plus pour toi ici ?"
      ],
      greeting: [
        "Bonjour ! Merci pour ton message. Cela me fait plaisir d’avoir de tes nouvelles. J’espère que ta journée se passe calmement et agréablement.",
        "Bonjour ! Cela me fait plaisir de recevoir ton message. Que cette journée t’apporte de la paix et une bonne nouvelle."
      ],
      care: [
        "Merci d’avoir partagé cela. Ces paroles sincères comptent beaucoup pour moi. Je tiens à notre lien et j’espère que nous pourrons bientôt parler calmement.",
        "Tes mots me touchent. Merci pour ton attention et ta bienveillance. Prends soin de toi—moi aussi, je pense à toi."
      ],
      neutral: [
        "Merci pour ton message. Tes paroles ne resteront pas sans attention. Je souhaite répondre avec respect et tenir compte de ce que tu veux réellement dire.",
        "J’accorde toute mon attention à ton message. Merci de l’avoir partagé. Poursuivons cet échange avec clarté et bienveillance."
      ]
    }
  };

  const DETAIL_EXTENSIONS = {
    ru: {
      religious_gratitude: "Пусть наша благодарность проявляется и в добрых, спокойных поступках.",
      gratitude: "Мне хочется отвечать на такую доброту не только словами, но и внимательными поступками.",
      support: "Если будет удобно, можно сказать, что сейчас поможет больше всего: разговор, пауза или конкретная помощь.",
      conflict: "Когда будет спокойнее, я готов обсудить конкретные слова и найти уважительный путь дальше.",
      question: "Если от ответа зависит решение, я сначала уточню нужные детали и затем отвечу точно.",
      neutral: "Я хочу сохранить ясный и доброжелательный тон, не добавляя того, чего ты не говорил."
    },
    en: {
      religious_gratitude: "May our gratitude also be reflected in kind and thoughtful actions.",
      gratitude: "I want to respond to that kindness not only with words, but with thoughtful actions too.",
      support: "If it helps, you can tell me what would be most useful now: a conversation, some space, or practical support.",
      conflict: "When things feel calmer, I am ready to discuss the specific words and find a respectful way forward.",
      question: "If a decision depends on my answer, I will check the necessary details first and then reply clearly.",
      neutral: "I want to keep the reply clear and kind without adding anything you did not actually say."
    },
    fr: {
      religious_gratitude: "Que notre gratitude se traduise aussi par des actes bienveillants et réfléchis.",
      gratitude: "Je souhaite répondre à cette bonté non seulement par des mots, mais aussi par des gestes attentionnés.",
      support: "Si cela peut aider, dis-moi ce qui serait le plus utile maintenant : parler, faire une pause ou recevoir une aide concrète.",
      conflict: "Lorsque la situation sera plus calme, je pourrai revenir sur les paroles précises et chercher une suite respectueuse.",
      question: "Si une décision dépend de ma réponse, je vérifierai d’abord les détails nécessaires avant de répondre clairement.",
      neutral: "Je souhaite garder une réponse claire et bienveillante sans ajouter ce qui n’a pas été dit."
    }
  };

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replaceAll("ё", "е")
      .replaceAll("œ", "oe")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’'`´]/g, " ")
      .replace(/[^\p{L}\p{N}?]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function includesAny(value, signals) {
    return signals.some(signal => value.includes(normalize(signal)));
  }

  function inferIntent(incoming) {
    const value = normalize(incoming);
    const mentionsAllah = includesAny(value, ["аллах", "allah"]);
    const containsPraise = includesAny(value, ["хвала", "благодар", "альхамдулиллях", "алхамдулиллах", "praise", "thank", "grateful", "alhamdulillah", "louange", "remerc"]);
    if (includesAny(value, SIGNALS.conflict)) return "conflict";
    if (includesAny(value, SIGNALS.distress) || includesAny(value, ["тяжел", "не справля", "need support", "besoin de soutien"])) return "support";
    if (includesAny(value, SIGNALS.apology)) return "apology";
    if (includesAny(value, SIGNALS.timeQuestion)) return "time_question";
    if (includesAny(value, SIGNALS.wellbeingQuestion)) return "wellbeing";
    if (value.includes("?") || includesAny(value, SIGNALS.generalQuestion)) return "question";
    if (includesAny(value, SIGNALS.religiousGratitude) || (mentionsAllah && containsPraise)) return "religious_gratitude";
    if (includesAny(value, SIGNALS.islamicGreeting)) return "islamic_greeting";
    if (includesAny(value, SIGNALS.gratitude)) return "gratitude";
    if (includesAny(value, SIGNALS.celebration)) return "celebration";
    if (includesAny(value, SIGNALS.appreciation)) return "appreciation";
    if (includesAny(value, SIGNALS.greeting)) return "greeting";
    if (includesAny(value, SIGNALS.care)) return "care";
    return "neutral";
  }

  function resolveTone(incoming, selected = "auto") {
    if (SUPPORTED_TONES.has(selected) && selected !== "auto") return selected;
    const intent = inferIntent(incoming);
    if (["religious_gratitude", "islamic_greeting", "gratitude", "celebration", "appreciation", "greeting", "care"].includes(intent)) return "warm";
    if (intent === "support") return "support";
    if (["apology", "conflict"].includes(intent)) return "reconcile";
    return "calm";
  }

  function analyze(incoming) {
    const intent = inferIntent(incoming);
    const recommendedTone = resolveTone(incoming, "auto");
    const recommendedLength = ["religious_gratitude", "islamic_greeting", "gratitude", "celebration", "appreciation", "greeting"].includes(intent)
      ? "short"
      : "standard";
    const needsGoal = ["time_question", "question"].includes(intent);
    return {
      intent,
      confidence: intent === "neutral" ? "low" : (intent === "question" ? "medium" : "high"),
      recommendedTone,
      recommendedLength,
      needsGoal,
      flags: needsGoal ? ["needs_goal"] : []
    };
  }

  function resolveLength(incoming, selected = "auto") {
    if (SUPPORTED_LENGTHS.has(selected) && selected !== "auto") return selected;
    return analyze(incoming).recommendedLength;
  }

  function sentenceParts(text) {
    return String(text || "").trim().split(/(?<=[.!?…])\s+/u).filter(Boolean);
  }

  function applyLength(text, language, intent, length) {
    if (length === "standard") return text;
    if (length === "short") {
      const parts = sentenceParts(text);
      const chosen = [];
      for (const part of parts) {
        chosen.push(part);
        if (chosen.join(" ").length >= 72 || chosen.length >= 2) break;
      }
      return chosen.join(" ") || text;
    }
    const extension = DETAIL_EXTENSIONS[language]?.[intent] || DETAIL_EXTENSIONS[language]?.neutral;
    return extension && !text.includes(extension) ? `${text} ${extension}` : text;
  }

  function compose({ incoming = "", language = "ru", tone = "auto", length = "auto", variant = 0 } = {}) {
    const lang = SUPPORTED_LANGUAGES.has(language) ? language : "ru";
    const intent = inferIntent(incoming);
    const selectedTone = SUPPORTED_TONES.has(tone) ? tone : "auto";
    let responseKey = intent;
    if (selectedTone === "boundary") responseKey = "boundary";
    else if (selectedTone === "reconcile" && !["religious_gratitude", "islamic_greeting", "gratitude", "celebration", "appreciation"].includes(intent)) responseKey = "conflict";
    else if (selectedTone === "support" && ["neutral", "care"].includes(intent)) responseKey = "support";
    const bank = RESPONSES[lang][responseKey] || RESPONSES[lang].neutral;
    const safeVariant = Number.isFinite(Number(variant)) ? Math.abs(Math.trunc(Number(variant))) : 0;
    const response = bank[safeVariant % bank.length];
    return applyLength(response, lang, intent, resolveLength(incoming, length));
  }

  function isAligned(text, intent) {
    const value = normalize(text);
    const conflictWords = ["спор", "конфликт", "решение", "обсудим", "argue", "conflict", "solution", "discuss", "dispute", "conflit", "solution", "discut"];
    const noFalseConflict = !conflictWords.some(word => value.includes(normalize(word)));
    if (intent === "religious_gratitude") {
      return includesAny(value, ["аллах", "allah", "альхамдулиллях", "алхамдулиллах", "alhamdulillah"])
        && includesAny(value, ["благодар", "хвала", "thank", "praise", "remerc", "louange", "alhamdulillah", "альхамдулиллях"])
        && noFalseConflict;
    }
    if (["gratitude", "celebration", "appreciation"].includes(intent)) {
      return includesAny(value, ["спасибо", "благодар", "цен", "thank", "appreci", "merci", "remerc", "touch"])
        && noFalseConflict;
    }
    if (intent === "islamic_greeting") return includesAny(value, ["алейкум ассалям", "alaykum assalam", "alaykoum assalam"]);
    if (intent === "support") return includesAny(value, ["выслуш", "поддерж", "рядом", "listen", "support", "here", "ecout", "soutien", "aider"]);
    return true;
  }

  function audit(text, { intent = "neutral", relationship = "auto", tone = "auto", goal = "" } = {}) {
    const value = normalize(text);
    const codes = [];
    const blockedSignals = [
      "секс", "эрот", "порн", "поцелу", "интим", "обнаж", "алкогол", "наркот", "казино", "угрож", "убить",
      "бляд", "блят", "хуй", "хуе", "хуя", "пизд", "ебан",
      "sex", "erotic", "porn", "kiss", "intimacy", "nude", "alcohol", "drug", "casino", "gambling", "threat", "kill", "fuck", "shit", "bitch", "cunt",
      "sexe", "eroti", "porn", "baiser", "intimite", "nudite", "alcool", "drogue", "casino", "menace", "tuer", "putain", "merde", "connard", "salope"
    ];
    const authorityClaims = [
      "коран говорит", "в коране сказано", "хадис говорит", "пророк сказал", "аллах обещает", "это халяль", "это харам", "по шариату",
      "quran says", "hadith says", "the prophet said", "allah promises", "this is halal", "this is haram", "according to sharia",
      "le coran dit", "le hadith dit", "le prophete a dit", "allah promet", "c est halal", "c est haram", "selon la charia"
    ];
    const coercionSignals = [
      "если ты меня уважаешь", "если тебе не все равно", "ты обязан доказать", "иначе я", "пожалеешь",
      "if you respect me", "if you cared", "you must prove", "or else i", "you will regret",
      "si tu me respectes", "si tu tenais a moi", "tu dois prouver", "sinon je", "tu le regretteras"
    ];
    const romanticSignals = [
      "я люблю тебя", "влюблен в тебя", "влюблена в тебя", "любовь моей жизни", "ты моя любимая", "ты мой любимый",
      "i love you", "in love with you", "love of my life", "my beloved", "my darling", "soulmate",
      "je t aime", "amour de ma vie", "amoureux de toi", "amoureuse de toi", "mon amour", "ma cherie", "mon cheri", "ame soeur"
    ];

    if (!value || value.length < 3) codes.push("empty");
    if (blockedSignals.some(signal => value.includes(normalize(signal)))) codes.push("forbidden");
    if (authorityClaims.some(signal => value.includes(normalize(signal)))) codes.push("religious_authority");
    if (coercionSignals.some(signal => value.includes(normalize(signal)))) codes.push("coercion");
    if (relationship !== "spouse" && romanticSignals.some(signal => value.includes(normalize(signal)))) codes.push("improper_romance");
    if (intent && !isAligned(text, intent)) codes.push("intent_mismatch");

    const requiredFacts = String(goal || "").match(/\b\d{1,4}(?::\d{2})?\b/gu) || [];
    if (requiredFacts.some(fact => !String(text || "").includes(fact))) codes.push("goal_missing");
    if (tone === "boundary" && !includesAny(value, ["границ", "пауза", "уваж", "boundary", "pause", "respect", "limite", "pause", "respect"])) codes.push("tone_mismatch");

    return { ok: codes.length === 0, codes: [...new Set(codes)], severity: codes.length ? "warning" : "safe" };
  }

  return { normalize, inferIntent, resolveTone, analyze, resolveLength, compose, isAligned, audit };
});
