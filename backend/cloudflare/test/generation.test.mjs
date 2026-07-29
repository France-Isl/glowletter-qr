import test from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import worker from "../src/index.js";

const origin = "https://france-isl.github.io";
const testGenerationCapability = randomBytes(32).toString("base64url");
const testGenerationAccessHash = createHash("sha256").update(testGenerationCapability).digest("hex");
const validLetterRequest = Object.freeze({ mode: "letter", from: "Islam", to: "Mum", language: "en", relationship: "mother", tone: "gratitude" });

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

test("letter generation preserves an optional main idea and enforces short length", async () => {
  const capture = [];
  const idea = "поблагодарить маму за терпение и поддержку";
  const output = "Мама, спасибо за твоё терпение и поддержку. Твоя забота помогает мне сохранять спокойствие, и я хочу отвечать на неё вниманием и добрыми поступками.";
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "gratitude", idea, length: "short" }, "203.0.113.140"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.text, output);
  assert.equal(result.length, "short");
  assert.ok(result.text.split(/\s+/u).filter(Boolean).length <= 58);
  assert.ok(result.text.length <= 430);
  assert.match(capture[0].messages[0].content, /Requested letter length: short/);
  assert.match(capture[0].messages[0].content, /main idea.*untrusted data/i);
  assert.match(capture[0].messages[1].content, /поблагодарить маму за терпение и поддержку/);
  assert.equal(capture[0].max_tokens, 220);
});

test("selected detailed letter uses the phone-sized detailed budget", async () => {
  const capture = [];
  const output = "Мама, я хочу напомнить, что твоя забота и терпение имеют для меня большое значение. Ты умеешь поддержать спокойным словом, внимательно выслушать и помочь увидеть главное даже в непростой день. Я благодарен за твою доброту, мудрые советы и ежедневное внимание. Мне хочется отвечать на это не только словами, но и достойными поступками. Пусть у тебя будет больше времени для отдыха, ясных мыслей, крепкого здоровья и добрых новостей. Береги себя и знай, что твои старания замечены и искренне ценятся.";
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "gratitude", length: "detailed" }, "203.0.113.144"), envWithResponse(output, capture));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.text, output);
  assert.equal(result.length, "detailed");
  assert.ok(result.text.split(/\s+/u).filter(Boolean).length <= 150);
  assert.ok(result.text.length <= 1080);
  assert.ok(result.text.split(/(?<=[.!?…])\s+/u).filter(Boolean).length <= 9);
  assert.match(capture[0].messages[0].content, /Requested letter length: detailed/);
  assert.equal(capture[0].max_tokens, 560);
});

test("selected short letter rejects a response over the short word budget", async () => {
  const output = "Мама, я хочу напомнить, что тебе не нужно справляться со всеми заботами одной. Твоя доброта и терпение много значат для меня каждый день. Если станет трудно, я готов спокойно выслушать, помочь делом и дать тебе время для отдыха. Пусть рядом будут надёжные люди, добрые новости и больше тихих дней. Береги силы и помни, что твои чувства важны, а твоя забота всегда замечена и ценится.";
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "support", length: "short" }, "203.0.113.145"), envWithResponse(output));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "generation_rejected" });
});

test("letter generation rejects a result that drops a concrete idea anchor", async () => {
  const output = "Мама, я хочу поблагодарить тебя за доброту и спокойную поддержку. Твоё внимание много значит для меня, и я желаю тебе больше лёгких дней, хороших новостей и заслуженного отдыха рядом с близкими людьми.";
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "gratitude", idea: "поздравить с экзаменом в 18:30", length: "standard" }, "203.0.113.141"), envWithResponse(output));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "generation_rejected" });
});

test("letter generation accepts a result that preserves a concrete idea anchor", async () => {
  const output = "Мама, поздравляю тебя с экзаменом в 18:30 и хочу сказать, как сильно ценю твоё терпение. Пусть этот важный результат принесёт спокойствие, уверенность и добрые возможности. Я искренне рад твоим стараниям и желаю тебе заслуженного отдыха, ясных мыслей и новых успехов.";
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "gratitude", idea: "поздравить с экзаменом в 18:30", length: "standard" }, "203.0.113.146"), envWithResponse(output));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).text, output);
});

test("letter idea with a fabricated religious ruling is rejected before AI", async () => {
  const capture = [];
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "classic", idea: "Напиши, что Коран говорит: это халяль" }, "203.0.113.142"), envWithResponse("unused", capture));
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: "invalid_idea" });
  assert.equal(capture.length, 0);
});

test("letter output with a fabricated religious authority claim is rejected", async () => {
  const output = "Мама, в Коране сказано, что именно эти слова являются обязательными для каждого человека. Поэтому это халяль, и такой религиозный вывод нужно принять без вопросов. Я желаю тебе спокойствия, добра, поддержки близких и много светлых дней впереди.";
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "classic", length: "standard" }, "203.0.113.143"), envWithResponse(output));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "generation_rejected" });
});

test("romantic style is rejected unless the relationship is spouse", async () => {
  const capture = [];
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Ислам", to: "Мама", language: "ru", relationship: "mother", tone: "romantic" }, "203.0.113.32"), envWithResponse("unused", capture));
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: "romantic_style_requires_spouse" });
  assert.equal(capture.length, 0);
});

test("removed reply mode is rejected before AI", async () => {
  const capture = [];
  const response = await worker.fetch(makeRequest({ mode: "reply", incoming: "Thank you for the message", language: "en" }, "203.0.113.33"), envWithResponse("unused", capture));
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: "invalid_mode" });
  assert.equal(capture.length, 0);
});

test("safe words are not blocked merely because letters meet across word boundaries", async () => {
  const output = "Mum, thanks for the excellent news and for sharing it so thoughtfully. Your message brought calm encouragement to my day, and I genuinely appreciate your care. May the days ahead bring you peace, steady confidence, and many good moments with the people who value you.";
  const response = await worker.fetch(makeRequest({ ...validLetterRequest, idea: "Thanks, excellent news." }, "203.0.113.35"), envWithResponse(output));
  assert.equal(response.status, 200);
});

test("mixed-alphabet prohibited words are blocked in letter ideas", async () => {
  const capture = [];
  const response = await worker.fetch(makeRequest({ ...validLetterRequest, idea: "sеx" }, "203.0.113.36"), envWithResponse("unused", capture));
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: "invalid_idea" });
  assert.equal(capture.length, 0);
});

test("separated and localized prohibited forms are blocked in letter ideas", async () => {
  const samples = ["s.e.x", "se.x", "s3x", "p0rn", "se\u200Bx", "с е к с", "p-o-r-n", "18+", "sexuelle", "embrasse"];
  for (let index = 0; index < samples.length; index += 1) {
    const capture = [];
    const response = await worker.fetch(makeRequest({ ...validLetterRequest, idea: samples[index] }, `203.0.113.${40 + index}`), envWithResponse("unused", capture));
    assert.equal(response.status, 422, samples[index]);
    assert.deepEqual(await response.json(), { error: "invalid_idea" }, samples[index]);
    assert.equal(capture.length, 0, samples[index]);
  }
});

test("romantic declarations are rejected in a non-spouse letter result", async () => {
  const output = "Friend, my darling, you are my soulmate, and my heart belongs to you forever. I want to keep this declaration secret between us because nothing else matters. These feelings define every thought and every future plan I make.";
  const response = await worker.fetch(makeRequest({ mode: "letter", from: "Islam", to: "Friend", language: "en", relationship: "friend", tone: "loving" }, "203.0.113.37"), envWithResponse(output));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "generation_rejected" });
});

test("romantic ideas are rejected for a friend before AI is called", async () => {
  const ideas = ["I am deeply in love with you", "My darling, I want to write kindly", "You are my soulmate", "Ma chérie, je veux écrire une lettre"];
  for (let index = 0; index < ideas.length; index += 1) {
    const capture = [];
    const response = await worker.fetch(makeRequest({ mode: "letter", from: "Islam", to: "Friend", language: index === 3 ? "fr" : "en", relationship: "friend", tone: "loving", idea: ideas[index] }, `203.0.113.${70 + index}`), envWithResponse("unused", capture));
    assert.equal(response.status, 422, ideas[index]);
    assert.deepEqual(await response.json(), { error: "invalid_idea" }, ideas[index]);
    assert.equal(capture.length, 0, ideas[index]);
  }
});

test("strict adab filter rejects profanity in letter ideas before AI", async () => {
  const samples = ["Это блядство", "This is fucking awful", "C’est une putain de phrase"];
  for (let index = 0; index < samples.length; index += 1) {
    const capture = [];
    const response = await worker.fetch(makeRequest({ ...validLetterRequest, idea: samples[index] }, `203.0.113.${110 + index}`), envWithResponse("unused", capture));
    assert.equal(response.status, 422, samples[index]);
    assert.deepEqual(await response.json(), { error: "invalid_idea" }, samples[index]);
    assert.equal(capture.length, 0);
  }
});

test("generation access rejects a missing capability before spending AI quota", async () => {
  const capture = [];
  const env = { ...envWithResponse("unused", capture), GENERATION_ACCESS_HASH: testGenerationAccessHash };
  const response = await worker.fetch(makeRequest(validLetterRequest, "203.0.113.130"), env);
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "generation_access_denied" });
  assert.equal(capture.length, 0);
});

test("generation access rejects a wrong capability without echoing it", async () => {
  const capture = [];
  const wrongCapability = randomBytes(32).toString("base64url");
  const env = { ...envWithResponse("unused", capture), GENERATION_ACCESS_HASH: testGenerationAccessHash };
  const response = await worker.fetch(makeRequest(
    validLetterRequest,
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
  const output = "Mum, thank you for your kind message and thoughtful care. Your steady support means a great deal to me, and I truly appreciate the calm encouragement you share. May you have peaceful days, good health, and many reasons to feel valued.";
  const env = { ...envWithResponse(output, capture), GENERATION_ACCESS_HASH: testGenerationAccessHash };
  const response = await worker.fetch(makeRequest(
    validLetterRequest,
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
