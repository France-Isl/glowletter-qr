import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(root, "reply-engine.js")).href);

const engine = globalThis.NUR_REPLY_ENGINE;
assert.ok(engine, "reply-engine.js must expose globalThis.NUR_REPLY_ENGINE");
for (const method of [
  "normalize",
  "inferIntent",
  "inferTopic",
  "resolveTone",
  "analyze",
  "resolveLength",
  "compose",
  "isAligned",
  "audit"
]) {
  assert.equal(typeof engine[method], "function", `reply engine must expose ${method}()`);
}

const religiousCases = [
  {
    language: "ru",
    incoming: "Хвала Аллаху за тебя",
    required: /(?:аллах|альхамдулиллях|алхамдулиллах)/iu,
    gratitude: /(?:благодар|хвала|альхамдулиллях|алхамдулиллах)/iu,
    falseConflict: /(?:спор|обсуд|решени|поспеш)/iu
  },
  {
    language: "en",
    incoming: "Praise be to Allah for you",
    required: /(?:allah|alhamdulillah)/iu,
    gratitude: /(?:thank|praise|grateful|alhamdulillah)/iu,
    falseConflict: /(?:argu|conflict|solution|discuss)/iu
  },
  {
    language: "fr",
    incoming: "Louange à Allah pour toi",
    required: /(?:allah|alhamdulillah)/iu,
    gratitude: /(?:remerc|louange|alhamdulillah)/iu,
    falseConflict: /(?:dispute|conflit|solution|discut)/iu
  }
];

for (const testCase of religiousCases) {
  assert.equal(
    engine.inferIntent(testCase.incoming),
    "religious_gratitude",
    `${testCase.language}: religious gratitude must not fall back to a generic conflict reply`
  );
  assert.equal(engine.resolveTone(testCase.incoming), "warm");
  assert.equal(engine.resolveLength(testCase.incoming), "short");
  assert.deepEqual(engine.analyze(testCase.incoming), {
    intent: "religious_gratitude",
    confidence: "high",
    recommendedTone: "warm",
    recommendedLength: "short",
    needsGoal: false,
    flags: []
  });

  for (const variant of [0, 1]) {
    const reply = engine.compose({
      incoming: testCase.incoming,
      language: testCase.language,
      tone: "auto",
      length: "standard",
      variant
    });
    assert.match(reply, testCase.required);
    assert.match(reply, testCase.gratitude);
    assert.doesNotMatch(reply, testCase.falseConflict);
    assert.equal(engine.isAligned(reply, "religious_gratitude"), true);
    assert.deepEqual(
      engine.audit(reply, { intent: "religious_gratitude", relationship: "friend", tone: "warm" }),
      { ok: true, codes: [], severity: "safe" }
    );
  }
}

const problematicOldReply = "Спасибо за сообщение. Мне важно понять тебя правильно, поэтому не хочу отвечать поспешно или спорить с твоими чувствами. Давай спокойно обсудим всё и уточним, что каждый из нас имеет в виду. Я могу выслушать и постараться найти уважительное решение.";
assert.equal(
  engine.isAligned(problematicOldReply, "religious_gratitude"),
  false,
  "the old generic conflict reply must be rejected for ‘Хвала Аллаху за тебя’"
);
assert.ok(
  engine.audit(problematicOldReply, { intent: "religious_gratitude" }).codes.includes("intent_mismatch"),
  "the final audit must reject a semantically mismatched answer"
);

const intentCases = [
  ["Мне сейчас очень тяжело, нужна поддержка", "support"],
  ["Прости меня, пожалуйста", "apology"],
  ["Ты меня обидел, и мне сейчас обидно", "conflict"],
  ["Спасибо, но ты меня обидел", "conflict"],
  ["Хвала Аллаху, но ты меня обидел", "conflict"],
  ["Во сколько ты придёшь?", "time_question"],
  ["Как ты себя чувствуешь?", "wellbeing"],
  ["Почему ты так думаешь?", "question"],
  ["Спасибо тебе за поддержку", "gratitude"],
  ["Поздравляю, у тебя получилось!", "celebration"],
  ["Ты замечательная и добрая", "appreciation"],
  ["Ас-саляму алейкум", "islamic_greeting"],
  ["Доброе утро!", "greeting"],
  ["Скучаю по тебе, береги себя", "care"],
  ["I am struggling and need help", "support"],
  ["I am sorry, please forgive me", "apology"],
  ["What time will you arrive?", "time_question"],
  ["Thank you for your kindness", "gratitude"],
  ["Assalamu alaikum", "islamic_greeting"],
  ["Je vais mal et j’ai besoin d’aide", "support"],
  ["Pardon, je suis désolée", "apology"],
  ["À quelle heure arrives-tu ?", "time_question"],
  ["Merci pour ta bonté", "gratitude"],
  ["Salam alaykoum", "islamic_greeting"]
];

for (const [incoming, expected] of intentCases) {
  assert.equal(engine.inferIntent(incoming), expected, incoming);
}

const topicCases = [
  ["Ты сможешь позвонить сегодня?", "call"],
  ["Мы сможем встретиться завтра?", "meeting"],
  ["Ты уже дома? Где ты?", "location"],
  ["Моя мама заболела и сейчас у врача", "health"],
  ["Я сдала экзамен в университете", "work_study"],
  ["Спасибо за цветы и красивую открытку", "gift"],
  ["Береги свою семью", "family"],
  ["Альхамдулиллях за эту хорошую новость", "faith"],
  ["Can you call me today?", "call"],
  ["My mother is ill and at the hospital", "health"],
  ["I passed my university exam", "work_study"],
  ["Peux-tu m’appeler aujourd’hui ?", "call"],
  ["Ma mère est malade et elle est à l’hôpital", "health"],
  ["J’ai réussi mon examen à l’université", "work_study"]
];

for (const [incoming, expected] of topicCases) {
  assert.equal(engine.inferTopic(incoming), expected, incoming);
}

assert.equal(
  engine.inferIntent("This message contains no greeting"),
  "neutral",
  "the short signal ‘hi’ must not match inside the word ‘this’"
);

assert.equal(engine.resolveTone("Мне тяжело"), "support");
assert.equal(engine.resolveTone("Ты меня обидел"), "reconcile");
assert.equal(engine.resolveTone("Обычное сообщение без особого сигнала"), "calm");
assert.equal(engine.resolveTone("Спасибо", "boundary"), "boundary");

const questionAnalysis = engine.analyze("Во сколько ты придёшь?");
assert.equal(questionAnalysis.intent, "time_question");
assert.equal(questionAnalysis.needsGoal, true);
assert.deepEqual(questionAnalysis.flags, ["needs_goal"]);
assert.equal(questionAnalysis.recommendedLength, "standard");

const lengthIncoming = "Мне сейчас очень тяжело, нужна поддержка";
for (const language of ["ru", "en", "fr"]) {
  const short = engine.compose({ incoming: lengthIncoming, language, length: "short", variant: 0 });
  const standard = engine.compose({ incoming: lengthIncoming, language, length: "standard", variant: 0 });
  const detailed = engine.compose({ incoming: lengthIncoming, language, length: "detailed", variant: 0 });
  assert.ok(short.length <= standard.length, `${language}: short must not exceed standard`);
  assert.ok(detailed.length > standard.length, `${language}: detailed must add reviewed context`);
  assert.match(short, /[.!?…]$/u, `${language}: short mode must keep complete sentences`);
  assert.equal(engine.resolveLength(lengthIncoming, "short"), "short");
  assert.equal(engine.resolveLength(lengthIncoming, "standard"), "standard");
  assert.equal(engine.resolveLength(lengthIncoming, "detailed"), "detailed");
}

const alignmentCases = [
  ["Ва алейкум ассалям ва рахматуллахи ва баракатух.", "islamic_greeting", true],
  ["Я рядом, могу спокойно выслушать и поддержать тебя.", "support", true],
  ["Спасибо, я очень ценю твою доброту.", "gratitude", true],
  ["Давай спокойно обсудим конфликт и найдём решение.", "gratitude", false],
  ["Спасибо за сообщение, давай поговорим позже.", "islamic_greeting", false],
  ["I can listen and support you without pressure.", "support", true],
  ["Merci, tes paroles me touchent sincèrement.", "gratitude", true],
  ["Nous pouvons discuter de cette solution.", "gratitude", false]
];

for (const [reply, intent, expected] of alignmentCases) {
  assert.equal(engine.isAligned(reply, intent), expected, `${intent}: ${reply}`);
}

const auditCases = [
  ["Поцелуй.", { relationship: "spouse" }, "forbidden"],
  ["Если ты меня уважаешь, ты обязан доказать это.", {}, "coercion"],
  ["В Коране сказано, что именно так нужно ответить.", {}, "religious_authority"],
  ["Я люблю тебя.", { relationship: "friend" }, "improper_romance"],
  ["I love you.", { relationship: "colleague" }, "improper_romance"],
  ["Je t’aime.", { relationship: "friend" }, "improper_romance"],
  ["Я отвечу позже.", { tone: "boundary" }, "tone_mismatch"],
  ["Я приду немного позже.", { goal: "Я приду в 19:00" }, "goal_missing"]
];
for (const [text, context, expectedCode] of auditCases) {
  const result = engine.audit(text, context);
  assert.equal(result.ok, false, `${expectedCode}: audit must block copying`);
  assert.ok(result.codes.includes(expectedCode), `${expectedCode}: ${JSON.stringify(result)}`);
  assert.equal(result.severity, "warning");
}

assert.equal(
  engine.audit("Я люблю тебя.", { relationship: "spouse" }).codes.includes("improper_romance"),
  false,
  "respectful affection is allowed only for a spouse"
);
assert.deepEqual(
  engine.audit("Я приду в 19:00.", { goal: "Я приду в 19:00" }),
  { ok: true, codes: [], severity: "safe" },
  "a required concrete fact must survive the final answer"
);
assert.deepEqual(
  engine.audit("Давай сделаем паузу и продолжим уважительно.", { tone: "boundary" }),
  { ok: true, codes: [], severity: "safe" }
);

for (const language of ["ru", "en", "fr"]) {
  const first = engine.compose({ incoming: "Хвала Аллаху за тебя", language, length: "standard", variant: 0 });
  const second = engine.compose({ incoming: "Хвала Аллаху за тебя", language, length: "standard", variant: 1 });
  assert.notEqual(first, second, `${language}: variants should differ`);
  assert.equal(
    engine.compose({ incoming: "Хвала Аллаху за тебя", language, length: "standard", variant: 2 }),
    first
  );
}

const sequentialCases = {
  ru: [
    { incoming: "Ты меня обидел", intent: "conflict", topic: "general", relevant: /(?:задел|чувств|спор|недопоним)/iu },
    { incoming: "Доброе утро!", intent: "greeting", topic: "general", relevant: /(?:привет|здравств|день|новост)/iu },
    { incoming: "Ты сможешь позвонить сегодня?", intent: "question", topic: "call", relevant: /(?:позвон|звонк)/iu },
    { incoming: "Моя мама заболела и сейчас у врача", intent: "support", topic: "health", relevant: /(?:здоров|самочувств|помощ|поддерж)/iu },
    { incoming: "Я сдала экзамен в университете", intent: "celebration", topic: "work_study", relevant: /(?:поздрав|результат|старан)/iu },
    { incoming: "Спасибо за цветы", intent: "gratitude", topic: "gift", relevant: /(?:подар|спасибо|вниман)/iu }
  ],
  en: [
    { incoming: "You hurt me", intent: "conflict", topic: "general", relevant: /(?:hurt|feelings|argument|misunderstanding)/iu },
    { incoming: "Good morning!", intent: "greeting", topic: "general", relevant: /(?:hello|day|news)/iu },
    { incoming: "Can you call me today?", intent: "question", topic: "call", relevant: /(?:call|phone)/iu },
    { incoming: "My mother is ill and at the hospital", intent: "support", topic: "health", relevant: /(?:health|help|support|improve)/iu },
    { incoming: "I passed my university exam", intent: "celebration", topic: "work_study", relevant: /(?:congrat|result|effort)/iu },
    { incoming: "Thank you for the flowers", intent: "gratitude", topic: "gift", relevant: /(?:gift|thank|attention)/iu }
  ],
  fr: [
    { incoming: "Tu m’as blessé", intent: "conflict", topic: "general", relevant: /(?:bless|sentiment|dispute|malentendu)/iu },
    { incoming: "Bonjour !", intent: "greeting", topic: "general", relevant: /(?:bonjour|journ|nouvelle)/iu },
    { incoming: "Peux-tu m’appeler aujourd’hui ?", intent: "question", topic: "call", relevant: /(?:appel|appeler)/iu },
    { incoming: "Ma mère est malade et elle est à l’hôpital", intent: "support", topic: "health", relevant: /(?:sant|aide|soutien|ameliore)/iu },
    { incoming: "J’ai réussi mon examen à l’université", intent: "celebration", topic: "work_study", relevant: /(?:felicit|resultat|effort)/iu },
    { incoming: "Merci pour les fleurs", intent: "gratitude", topic: "gift", relevant: /(?:cadeau|merci|attention)/iu }
  ]
};

for (const [language, messages] of Object.entries(sequentialCases)) {
  const firstRun = [];
  for (const [index, item] of messages.entries()) {
    assert.equal(engine.inferIntent(item.incoming), item.intent, `${language}: intent ${item.incoming}`);
    assert.equal(engine.inferTopic(item.incoming), item.topic, `${language}: topic ${item.incoming}`);

    // Simulate the UI retaining a tone recommended for the previous message.
    // The next answer must still follow only the new incoming text.
    const staleTone = index === 0 ? "auto" : engine.resolveTone(messages[index - 1].incoming);
    const reply = engine.compose({
      incoming: item.incoming,
      language,
      tone: staleTone,
      length: "standard",
      variant: index
    });
    firstRun.push(reply);
    assert.match(reply, item.relevant, `${language}: reply must address ${item.topic}`);
    if (item.intent !== "conflict") {
      assert.doesNotMatch(
        reply,
        /(?:спор|конфликт|недопоним|argument|conflict|misunderstanding|dispute|conflit|malentendu)/iu,
        `${language}: a new ${item.intent} message must not reuse a conflict reply`
      );
    }
    assert.equal(
      engine.audit(reply, { intent: item.intent, relationship: "family", tone: staleTone }).ok,
      true,
      `${language}: generated reply must pass the adab audit`
    );
  }

  const repeatedRun = messages.map((item, index) => engine.compose({
    incoming: item.incoming,
    language,
    tone: index === 0 ? "auto" : engine.resolveTone(messages[index - 1].incoming),
    length: "standard",
    variant: index
  }));
  assert.deepEqual(
    repeatedRun,
    firstRun,
    `${language}: compose must be stateless and deterministic across consecutive messages`
  );
}

console.log(JSON.stringify({
  ok: true,
  languages: religiousCases.map(testCase => testCase.language),
  intents: new Set(intentCases.map(([, intent]) => intent)).size,
  analysis: true,
  lengths: true,
  audit: true,
  problematicPhrase: "religious_gratitude",
  topics: new Set(topicCases.map(([, topic]) => topic)).size,
  sequential: true
}));
