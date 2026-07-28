import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(root, "reply-engine.js")).href);

const engine = globalThis.NUR_REPLY_ENGINE;
assert.ok(engine, "reply-engine.js must expose globalThis.NUR_REPLY_ENGINE");
for (const method of ["normalize", "inferIntent", "resolveTone", "compose", "isAligned"]) {
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

  for (const variant of [0, 1]) {
    const reply = engine.compose({
      incoming: testCase.incoming,
      language: testCase.language,
      tone: "auto",
      variant
    });
    assert.match(reply, testCase.required);
    assert.match(reply, testCase.gratitude);
    assert.doesNotMatch(reply, testCase.falseConflict);
    assert.equal(engine.isAligned(reply, "religious_gratitude"), true);
  }
}

const problematicOldReply = "Спасибо за сообщение. Мне важно понять тебя правильно, поэтому не хочу отвечать поспешно или спорить с твоими чувствами. Давай спокойно обсудим всё и уточним, что каждый из нас имеет в виду. Я могу выслушать и постараться найти уважительное решение.";
assert.equal(
  engine.isAligned(problematicOldReply, "religious_gratitude"),
  false,
  "the old generic conflict reply must be rejected for ‘Хвала Аллаху за тебя’"
);

const intentCases = [
  ["Мне сейчас очень тяжело, нужна поддержка", "support"],
  ["Прости меня, пожалуйста", "apology"],
  ["Ты меня обидел, и мне сейчас обидно", "conflict"],
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

assert.equal(engine.resolveTone("Мне тяжело"), "support");
assert.equal(engine.resolveTone("Ты меня обидел"), "reconcile");
assert.equal(engine.resolveTone("Обычное сообщение без особого сигнала"), "calm");
assert.equal(engine.resolveTone("Спасибо", "boundary"), "boundary");

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

for (const language of ["ru", "en", "fr"]) {
  const first = engine.compose({ incoming: "Хвала Аллаху за тебя", language, variant: 0 });
  const second = engine.compose({ incoming: "Хвала Аллаху за тебя", language, variant: 1 });
  assert.notEqual(first, second, `${language}: variants should differ`);
  assert.equal(engine.compose({ incoming: "Хвала Аллаху за тебя", language, variant: 2 }), first);
}

console.log(JSON.stringify({
  ok: true,
  languages: religiousCases.map(testCase => testCase.language),
  intents: new Set(intentCases.map(([, intent]) => intent)).size,
  problematicPhrase: "religious_gratitude",
  alignment: true
}));
