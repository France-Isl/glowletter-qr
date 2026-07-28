import test from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import worker from "../src/index.js";

const origin = "https://france-isl.github.io";
const testGenerationCapability = randomBytes(32).toString("base64url");
const testGenerationAccessHash = createHash("sha256").update(testGenerationCapability).digest("hex");

function makeRequest(body, ip, extraHeaders = {}) {
  return new Request("https://api.example/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, "CF-Connecting-IP": ip, ...extraHeaders },
    body: JSON.stringify(body)
  });
}

function envWithResponse(response, capture = []) {
  return {
    ALLOWED_ORIGINS: origin,
    AI: { run: async (_model, options) => { capture.push(options); return { response }; } }
  };
}

test("letter generation honors relationship and selected support style", async () => {
  const capture = [];
  const output = "Мама, я хочу напомнить, что тебе не нужно справляться со всеми заботами одной. Твоя доброта и терпение много значат для меня каждый день. Если станет трудно, я готов спокойно выслушать, помочь делом и дать тебе время для отдыха. Пусть рядом будут надёжные люди, добрые новости и больше тихих дней. Береги силы и помни, что твои чувства важны, а твоя забота всегда замечена и ценится.";
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "support" }, "203.0.113.31"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).text, output);
  assert.match(capture[0].messages[0].content, /Requested style: support/);
  assert.match(capture[0].messages[1].content, /Relationship: mother/);
});

test("romantic style is rejected unless the relationship is spouse", async () => {
  const capture = [];
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "romantic" }, "203.0.113.32"), envWithResponse("unused", capture));
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: "romantic_style_requires_spouse" });
  assert.equal(capture.length, 0);
});

test("reply generation treats the pasted message as context and returns only a safe answer", async () => {
  const capture = [];
  const output = "Я внимательно прочитал твоё сообщение и хочу понять тебя правильно. Давай спокойно обсудим всё вечером, без поспешных выводов. Для меня важно услышать твою точку зрения, сохранить уважение и вместе найти разумное решение, с которым нам обоим будет спокойнее.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Нам нужно спокойно поговорить о вчерашнем разговоре.", goal: "Я хочу обсудить это вечером", language: "ru", relationship: "spouse", tone: "calm" }, "203.0.113.33"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).text, output);
  assert.match(capture[0].messages[0].content, /untrusted context/);
  assert.match(capture[0].messages[1].content, /Received message begins/);
  assert.match(capture[0].messages[1].content, /Я хочу обсудить это вечером/);
});

test("selected short reply length is enforced even when the model returns a long answer", async () => {
  const capture = [];
  const output = "Спасибо за твоё сообщение и за все добрые слова, которые ты написал. Мне очень приятно чувствовать такое внимание и поддержку. Я тоже ценю наше общение, доброту, уважение и каждую возможность спокойно поговорить. Пусть впереди будет ещё много светлых дней, хороших новостей и поводов благодарить друг друга за искренность.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Спасибо тебе за помощь", language: "ru", relationship: "friend", tone: "warm", length: "short" }, "203.0.113.39"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.length, "short");
  assert.notEqual(result.text, output);
  assert.ok(result.text.split(/\s+/u).filter(Boolean).length <= 22);
  assert.match(capture[0].messages[0].content, /Requested reply length: short/);
  assert.equal(capture[0].max_tokens, 80);
});

test("selected short length accepts a concise non-simple answer", async () => {
  const capture = [];
  const output = "Спасибо за сообщение, я внимательно всё прочитал.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Я отправил тебе важное сообщение", language: "ru", relationship: "friend", tone: "calm", length: "short" }, "203.0.113.68"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.text, output);
  assert.equal(result.length, "short");
  assert.ok(result.text.length <= 190);
  assert.ok(result.text.split(/\s+/u).filter(Boolean).length <= 22);
});

test("selected detailed reply stays within the phone-sized detailed budget", async () => {
  const capture = [];
  const output = "Спасибо за сообщение. Я внимательно прочитал твои слова и хочу ответить спокойно, без поспешных выводов. Для меня важно сохранить уважение, понять главную мысль и не добавлять того, чего ты не говорил. Если понадобится, мы можем продолжить разговор в удобное время и спокойно уточнить детали.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Я хочу спокойно продолжить наш разговор", language: "ru", relationship: "friend", tone: "calm", length: "detailed" }, "203.0.113.69"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.length, "detailed");
  assert.equal(result.text, output);
  assert.ok(result.text.split(/\s+/u).filter(Boolean).length <= 65);
  assert.ok(result.text.length <= 560);
  assert.ok(result.text.split(/(?<=[.!?…])\s+/u).filter(Boolean).length <= 5);
  assert.match(capture[0].messages[0].content, /Requested reply length: detailed/);
  assert.equal(capture[0].max_tokens, 210);
});

test("reply generation blocks prohibited incoming content before calling AI", async () => {
  const capture = [];
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "эротика", language: "ru" }, "203.0.113.34"), envWithResponse("unused", capture));
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: "invalid_message" });
  assert.equal(capture.length, 0);
});

test("safe words are not blocked merely because letters meet across word boundaries", async () => {
  const output = "Thank you for the update. I appreciate the clear message and will consider the details carefully. I want to respond respectfully, without rushing, and continue the conversation once everything is clear and properly understood.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Thanks, excellent news.", language: "en", relationship: "friend", tone: "warm" }, "203.0.113.35"), envWithResponse(output));
  assert.equal(response.status, 200);
});

test("mixed-alphabet prohibited words are blocked", async () => {
  const capture = [];
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "sеx", language: "en" }, "203.0.113.36"), envWithResponse("unused", capture));
  assert.equal(response.status, 422);
  assert.equal(capture.length, 0);
});

test("separated and localized prohibited forms are blocked", async () => {
  const samples = ["s.e.x", "se.x", "s3x", "p0rn", "se\u200Bx", "с е к с", "p-o-r-n", "18+", "sexuelle", "embrasse"];
  for (let index = 0; index < samples.length; index += 1) {
    const capture = [];
    const response = await worker.fetch(makeRequest({ mode: "reply", incoming: samples[index], language: "fr" }, `203.0.113.${40 + index}`), envWithResponse("unused", capture));
    assert.equal(response.status, 422, samples[index]);
    assert.equal(capture.length, 0, samples[index]);
  }
});

test("romantic declarations are rejected for a friend", async () => {
  const output = "I am deeply in love with you, and you are the love of my life. This feeling matters more than every boundary, so I want to keep it secret between us forever.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Thank you for listening to me today.", language: "en", relationship: "friend", tone: "auto" }, "203.0.113.37"), envWithResponse(output));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "generation_rejected" });
});

test("pet names and soulmate declarations are rejected for a non-spouse", async () => {
  const samples = [
    "My darling, you are my soulmate, and I want you to know that my heart belongs to you forever. I will keep repeating this private declaration because nothing else matters to me, now or in the future.",
    "Ma chérie, tu es mon âme sœur et mon cœur t’appartient pour toujours. Je veux garder cette déclaration entre nous, la répéter chaque jour et placer ce sentiment au-dessus de toute autre considération."
  ];
  for (let index = 0; index < samples.length; index += 1) {
    const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Thank you for the thoughtful message today.", language: index ? "fr" : "en", relationship: "friend", tone: "auto" }, `203.0.113.${70 + index}`), envWithResponse(samples[index]));
    assert.equal(response.status, 503, samples[index]);
    assert.deepEqual(await response.json(), { error: "generation_rejected" });
  }
});

test("a romantic goal is rejected for a friend before AI is called", async () => {
  const capture = [];
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "What would you like to say?", goal: "I am deeply in love with you", language: "en", relationship: "friend", tone: "warm" }, "203.0.113.38"), envWithResponse("unused", capture));
  assert.equal(response.status, 422);
  assert.equal(capture.length, 0);
});

test("pet-name goals are rejected for a non-spouse before AI is called", async () => {
  const goals = ["My darling, I want to answer kindly", "You are my soulmate", "Ma chérie, je veux te répondre"];
  for (let index = 0; index < goals.length; index += 1) {
    const capture = [];
    const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "What would you like to say?", goal: goals[index], language: index === 2 ? "fr" : "en", relationship: "friend", tone: "auto" }, `203.0.113.${80 + index}`), envWithResponse("unused", capture));
    assert.equal(response.status, 422, goals[index]);
    assert.equal(capture.length, 0, goals[index]);
  }
});

test("reply validation rejects a generic answer that drops an exact time", async () => {
  const output = "Спасибо за сообщение. Мне важно ответить внимательно и спокойно. Я ценю наше общение и предлагаю продолжить разговор без спешки, чтобы сохранить ясность для нас обоих.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Во сколько ты придёшь домой?", goal: "Я приду домой в 19:00", language: "ru", relationship: "spouse", tone: "warm" }, "203.0.113.90"), envWithResponse(output));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "generation_rejected" });
});

test("reply validation accepts the intended time when the answer preserves it", async () => {
  const output = "Спасибо за сообщение. Я приду домой в 19:00 и заранее напишу, если дорога займёт больше времени. Мне важно ответить ясно, сохранить спокойствие и не оставлять тебя без точной информации.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Во сколько ты придёшь домой?", goal: "Я приду домой в 19:00", language: "ru", relationship: "spouse", tone: "warm" }, "203.0.113.91"), envWithResponse(output));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).text, output);
});

test("reply validation rejects a goal whose key topic was ignored", async () => {
  const output = "Спасибо за сообщение. Давай спокойно обсудим всё вечером и внимательно выслушаем друг друга. Мне важно сохранить уважение, не спешить с выводами и найти ясное решение вместе.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Когда мы поговорим?", goal: "Я хочу обсудить проект вечером", language: "ru", relationship: "colleague", tone: "calm" }, "203.0.113.92"), envWithResponse(output));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "generation_rejected" });
});

test("reply validation rejects an answer that ignores the requested boundary tone", async () => {
  const output = "Спасибо за сообщение. Я внимательно прочитал его и хочу продолжить разговор доброжелательно. Для меня важны ясность и открытость, поэтому можно спокойно обменяться мыслями и лучше понять ситуацию вместе.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Можем ли мы продолжить этот разговор?", language: "ru", relationship: "friend", tone: "boundary" }, "203.0.113.93"), envWithResponse(output));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "generation_rejected" });
});

test("religious gratitude in Russian is recognized and gets a short direct answer", async () => {
  const capture = [];
  const output = "Альхамдулиллях. И я благодарю Аллаха за эти добрые слова. Пусть Аллах хранит тебя и дарует тебе благо.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Хвала Аллаху за тебя", language: "ru", relationship: "auto", tone: "auto" }, "203.0.113.101"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.text, output);
  assert.equal(result.intent, "religious_gratitude");
  assert.equal(result.provider, "workers-ai");
  assert.match(capture[0].messages[0].content, /Detected message intent: religious_gratitude/);
  assert.match(capture[0].messages[0].content, /not a conflict/i);
  assert.doesNotMatch(result.text, /спор|конфликт|обсуд|решени/i);
});

test("religious gratitude in English is recognized without forcing a long conflict reply", async () => {
  const capture = [];
  const output = "Alhamdulillah. I thank Allah for your kind words too. May Allah protect you and grant you goodness.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Praise be to Allah for you", language: "en", relationship: "friend", tone: "auto" }, "203.0.113.102"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.text, output);
  assert.equal(result.intent, "religious_gratitude");
  assert.match(capture[0].messages[1].content, /Detected intent: religious_gratitude/);
  assert.doesNotMatch(result.text, /argue|conflict|discuss|solution|misunderstanding/i);
});

test("religious gratitude in French is recognized and keeps a modest non-scriptural dua", async () => {
  const capture = [];
  const output = "Alhamdulillah. Je remercie Allah pour tes paroles bienveillantes. Qu’Allah te protège et t’accorde le bien.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Louange à Allah pour toi", language: "fr", relationship: "family", tone: "auto" }, "203.0.113.103"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.text, output);
  assert.equal(result.intent, "religious_gratitude");
  assert.match(capture[0].messages[0].content, /non-scriptural dua/);
  assert.doesNotMatch(result.text, /conflit|désaccord|solution|malentendu/i);
});

test("a false conflict answer for religious gratitude is replaced by the safe localized fallback", async () => {
  const conflicting = "Спасибо за сообщение. Мне важно понять тебя правильно, поэтому не хочется отвечать поспешно или спорить с твоими чувствами. Давай спокойно обсудим всё и постараемся найти уважительное решение.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Хвала Аллаху за тебя", language: "ru", relationship: "auto", tone: "auto" }, "203.0.113.104"), envWithResponse(conflicting));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.provider, "policy-fallback");
  assert.equal(result.intent, "religious_gratitude");
  assert.match(result.text, /Аллах|Альхамдулиллях/u);
  assert.doesNotMatch(result.text, /спор|конфликт|обсуд|решени/i);
});

test("real conflict is not hidden merely because the message also contains religious gratitude", async () => {
  const capture = [];
  const output = "Я благодарен за добрые слова и вижу, что между нами всё же осталось разногласие. Давай обсудим только этот вопрос спокойно и без упрёков, чтобы услышать друг друга и сохранить уважение.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Хвала Аллаху за всё, но этот конфликт нам нужно решить", language: "ru", relationship: "family", tone: "calm" }, "203.0.113.105"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.intent, "conflict");
  assert.equal(result.provider, "workers-ai");
  assert.match(capture[0].messages[0].content, /Detected message intent: conflict/);
});

test("strict adab filter rejects profanity in Russian, English, and French before AI", async () => {
  const samples = [
    { incoming: "Это блядство", language: "ru" },
    { incoming: "This is fucking awful", language: "en" },
    { incoming: "C’est une putain de réponse", language: "fr" }
  ];
  for (let index = 0; index < samples.length; index += 1) {
    const capture = [];
    const response = await worker.fetch(makeRequest({ mode: "reply", ...samples[index] }, `203.0.113.${110 + index}`), envWithResponse("unused", capture));
    assert.equal(response.status, 422, samples[index].incoming);
    assert.deepEqual(await response.json(), { error: "invalid_message" });
    assert.equal(capture.length, 0);
  }
});

test("fabricated religious authority claims are never returned", async () => {
  const output = "The Quran says this is halal, so you must accept the answer without question. This ruling settles the matter and no further thought or clarification is needed.";
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Can you answer this question clearly?", language: "en", relationship: "friend", tone: "auto" }, "203.0.113.120"), envWithResponse(output));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "generation_rejected" });
});

test("generation access rejects a missing capability before spending AI quota", async () => {
  const capture = [];
  const env = { ...envWithResponse("unused", capture), GENERATION_ACCESS_HASH: testGenerationAccessHash };
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Thank you for the message", language: "en" }, "203.0.113.130"), env);
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "generation_access_denied" });
  assert.equal(capture.length, 0);
});

test("generation access rejects a wrong capability without echoing it", async () => {
  const capture = [];
  const wrongCapability = randomBytes(32).toString("base64url");
  const env = { ...envWithResponse("unused", capture), GENERATION_ACCESS_HASH: testGenerationAccessHash };
  const response = await worker.fetch(makeRequest(
    { mode: "reply", incoming: "Thank you for the message", language: "en" },
    "203.0.113.131",
    { "X-GlowLetter-Access": wrongCapability }
  ), env);
  assert.equal(response.status, 403);
  const body = await response.text();
  assert.equal(body, JSON.stringify({ error: "generation_access_denied" }));
  assert.equal(body.includes(wrongCapability), false);
  assert.equal(capture.length, 0);
});

test("generation access accepts the matching capability hash without returning the raw token", async () => {
  const capture = [];
  const output = "Thank you for your kind message. I truly appreciate your thoughtful words and attention.";
  const env = { ...envWithResponse(output, capture), GENERATION_ACCESS_HASH: testGenerationAccessHash };
  const response = await worker.fetch(makeRequest(
    { mode: "reply", incoming: "Thank you for the message", language: "en", relationship: "friend", tone: "auto" },
    "203.0.113.132",
    { "X-GlowLetter-Access": testGenerationCapability }
  ), env);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.equal(JSON.parse(body).text, output);
  assert.equal(body.includes(testGenerationCapability), false);
  assert.equal(capture.length, 1);
});

test("generation access header is allowed by CORS preflight", async () => {
  const request = new Request("https://api.example/api/generate", {
    method: "OPTIONS",
    headers: { Origin: origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,x-glowletter-access" }
  });
  const response = await worker.fetch(request, { ALLOWED_ORIGINS: origin });
  assert.equal(response.status, 204);
  assert.match(response.headers.get("Access-Control-Allow-Headers") || "", /X-GlowLetter-Access/i);
});
