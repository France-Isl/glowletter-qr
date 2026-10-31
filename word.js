/*
  «Слово дня на двоих» (2.4.27, полный доступ). Ежедневная игра: угадать слово
  из 5 букв за 6 попыток. После каждой попытки буквы окрашиваются: на своём месте,
  есть в слове, нет в слове. Экранная клавиатура и обычная тоже работают.

  • Слово одно на всех для языка: день — дата UTC, номер слова считается из номера дня
    (дни с 1970-01-01 UTC) перестановкой без повторов внутри круга длиной в список.
  • Списки и алфавиты — word-lists.js (GLOWLETTER_WORDS, GLOWLETTER_WORD_RULES).
    ja, ko, zh, th, vi играют английским словом — об этом пишется под заголовком.
  • Прогресс хранится в localStorage на день и язык. По окончании игры результат уходит
    на сервер (glowletter_word_submit), ниже — таблица друзей (glowletter_word_friends).
  • Время — от первой набранной буквы до конца игры.
  • Тексты: ru, en, fr здесь, остальные 22 языка — в word-i18n.js (GLOWLETTER_WORD_I18N).

  API: window.GlowLetterWord.render(host, ctx), где
  ctx = { lang, premium, signedIn, rpc(name, args) → Promise<data>, openPaywall(), toast(text) }.
*/
(() => {
  "use strict";

  if (window.GlowLetterWord) return;

  const LENGTH = 5;
  const MAX_TRIES = 6;
  const STORAGE_PREFIX = "glowletter.word.v1";
  const REVEAL_MS = 300;
  const SQUARES = Object.freeze({ right: "🟩", present: "🟨", absent: "⬜" });
  const LANG_ALIASES = Object.freeze({ id: "ind", nb: "no", nn: "no" });

  const TEXT = {
    ru: {
      title: "Слово дня", lead: "Угадайте слово из 5 букв за 6 попыток. Слово одно на всех — сравните с друзьями, кто угадает быстрее.",
      legendRight: "На своём месте", legendPresent: "Есть в слове", legendAbsent: "Нет в слове",
      englishNote: "Для вашего языка слово дня — на английском.",
      enter: "Ввод", erase: "Стереть", notEnough: "Нужно 5 букв", onlyLetters: "Только буквы с клавиатуры игры",
      winTitle: "Угадано!", loseTitle: "В этот раз не получилось", answerWas: "Слово дня: {word}",
      triesUsed: "Попытки: {n} из 6", timeUsed: "Время: {time}", nextWord: "Новое слово через {time}",
      share: "Поделиться", copied: "Результат скопирован",
      friendsTitle: "Друзья сегодня", friendsEmpty: "Из друзей сегодня ещё никто не играл.", friendsLoading: "Загружаю…",
      friendsFailed: "Не удалось загрузить результаты друзей.", you: "вы", thName: "Кто", thTries: "Попытки", thTime: "Время",
      notSolved: "не угадано", friend: "Друг", signInNote: "Войдите в аккаунт, чтобы сравнить результат с друзьями.",
      premiumTitle: "Слово дня — в полном доступе", premiumNote: "Новое слово каждый день и таблица с друзьями: кто угадал быстрее.",
      unlock: "Открыть полный доступ", saveFailed: "Результат не отправлен. Проверьте связь и попробуйте ещё раз.", retry: "Повторить",
      tileRight: "{letter}: на своём месте", tilePresent: "{letter}: есть в слове, но в другом месте", tileAbsent: "{letter}: нет в слове",
      tileEmpty: "пусто", rowLabel: "Попытка {n}", boardLabel: "Игровое поле", keyboardLabel: "Клавиатура"
    },
    en: {
      title: "Word of the day", lead: "Guess the 5-letter word in 6 tries. Everyone gets the same word — see which friend solves it faster.",
      legendRight: "Right place", legendPresent: "In the word", legendAbsent: "Not in the word",
      englishNote: "For your language, the word of the day is in English.",
      enter: "Enter", erase: "Delete", notEnough: "5 letters needed", onlyLetters: "Only letters from the game keyboard",
      winTitle: "Solved!", loseTitle: "Not this time", answerWas: "Today’s word: {word}",
      triesUsed: "Tries: {n} of 6", timeUsed: "Time: {time}", nextWord: "New word in {time}",
      share: "Share", copied: "Result copied",
      friendsTitle: "Friends today", friendsEmpty: "None of your friends has played today yet.", friendsLoading: "Loading…",
      friendsFailed: "Couldn’t load your friends’ results.", you: "you", thName: "Who", thTries: "Tries", thTime: "Time",
      notSolved: "not solved", friend: "Friend", signInNote: "Sign in to compare your result with friends.",
      premiumTitle: "Word of the day is part of full access", premiumNote: "A new word every day and a table with friends: who solved it faster.",
      unlock: "Get full access", saveFailed: "Your result wasn’t sent. Check your connection and try again.", retry: "Try again",
      tileRight: "{letter}: right place", tilePresent: "{letter}: in the word, but in another place", tileAbsent: "{letter}: not in the word",
      tileEmpty: "empty", rowLabel: "Try {n}", boardLabel: "Game board", keyboardLabel: "Keyboard"
    },
    fr: {
      title: "Mot du jour", lead: "Devinez le mot de 5 lettres en 6 essais. Le mot est le même pour tous — voyez qui le trouve le plus vite parmi vos amis.",
      legendRight: "Bien placée", legendPresent: "Dans le mot", legendAbsent: "Pas dans le mot",
      englishNote: "Pour votre langue, le mot du jour est en anglais.",
      enter: "Entrée", erase: "Effacer", notEnough: "Il faut 5 lettres", onlyLetters: "Seulement les lettres du clavier du jeu",
      winTitle: "Trouvé !", loseTitle: "Pas cette fois", answerWas: "Mot du jour : {word}",
      triesUsed: "Essais : {n} sur 6", timeUsed: "Temps : {time}", nextWord: "Nouveau mot dans {time}",
      share: "Partager", copied: "Résultat copié",
      friendsTitle: "Amis aujourd’hui", friendsEmpty: "Aucun de vos amis n’a encore joué aujourd’hui.", friendsLoading: "Chargement…",
      friendsFailed: "Impossible de charger les résultats de vos amis.", you: "vous", thName: "Qui", thTries: "Essais", thTime: "Temps",
      notSolved: "non trouvé", friend: "Ami", signInNote: "Connectez-vous pour comparer votre résultat avec vos amis.",
      premiumTitle: "Le mot du jour fait partie de l’accès complet", premiumNote: "Un nouveau mot chaque jour et un tableau avec vos amis : qui l’a trouvé le plus vite.",
      unlock: "Obtenir l’accès complet", saveFailed: "Votre résultat n’a pas été envoyé. Vérifiez la connexion et réessayez.", retry: "Réessayer",
      tileRight: "{letter} : bien placée", tilePresent: "{letter} : dans le mot, mais ailleurs", tileAbsent: "{letter} : pas dans le mot",
      tileEmpty: "vide", rowLabel: "Essai {n}", boardLabel: "Grille de jeu", keyboardLabel: "Clavier"
    }
  };
  Object.entries(window.GLOWLETTER_WORD_I18N || {}).forEach(([code, pack]) => {
    if (TEXT[code] || !pack || typeof pack !== "object") return;
    TEXT[code] = pack;
  });

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const reduced = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

  // <pure> — чистые функции; tests/word-contract.test.mjs выполняет этот блок отдельно.
  function dayKey(date) { return new Date(date).toISOString().slice(0, 10); }
  function dayNumber(key) { return Math.floor(Date.parse(`${key}T00:00:00Z`) / 86400000); }
  function mix32(value) {
    let x = value | 0;
    x ^= x >>> 16; x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15; x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    return x >>> 0;
  }
  // Номер слова дня: внутри каждого круга из size дней — перестановка без повторов,
  // поэтому соседние дни не идут по списку подряд, а слово не повторяется раньше конца круга.
  function wordIndex(day, size) {
    if (size < 2) return 0;
    const cycle = Math.floor(day / size);
    let bits = 1;
    while ((1 << bits) < size) bits += 1;
    const mask = (1 << bits) - 1;
    const shift = Math.max(1, bits >> 1);
    const keys = [0, 1, 2].map(round => mix32(cycle * 3 + round + 0x51ed));
    const step = value => {
      let x = value;
      for (const key of keys) {
        x = (x + key) & mask;
        x = Math.imul(x, (key >>> 8) | 1) & mask;
        x ^= x >>> shift;
      }
      return x;
    };
    let x = ((day % size) + size) % size;
    do { x = step(x); } while (x >= size);
    return x;
  }
  // Буква приводится к букве алфавита: заглавная, без огласовок, É→E, Ё→Е, أ→ا, ά→Α.
  // null — в строке есть знак, которого нет в алфавите языка.
  function foldWord(raw, rule) {
    const upper = String(raw ?? "").normalize("NFC").toLocaleUpperCase(rule.locale || "en");
    const out = [];
    for (const char of Array.from(upper)) {
      if (/\p{M}|ـ/u.test(char)) continue;
      if (rule.alphabet.includes(char)) { out.push(char); continue; }
      if (rule.fold && rule.fold[char]) { out.push(rule.fold[char]); continue; }
      const base = char.normalize("NFD").replace(/\p{M}/gu, "");
      if (base.length === 1 && rule.alphabet.includes(base)) { out.push(base); continue; }
      return null;
    }
    return out.join("");
  }
  // Цвета попытки: сначала буквы на своих местах, затем остальные — не больше, чем их в слове.
  function evaluate(guess, answer) {
    const g = Array.from(guess);
    const a = Array.from(answer);
    const result = g.map(() => "absent");
    const left = new Map();
    g.forEach((letter, index) => {
      if (letter === a[index]) result[index] = "right";
      else left.set(a[index], (left.get(a[index]) || 0) + 1);
    });
    g.forEach((letter, index) => {
      if (result[index] === "right") return;
      const count = left.get(letter) || 0;
      if (count > 0) { result[index] = "present"; left.set(letter, count - 1); }
    });
    return result;
  }
  // </pure>

  function playLanguage(code) {
    const words = window.GLOWLETTER_WORDS || {};
    const rules = window.GLOWLETTER_WORD_RULES || {};
    return Array.isArray(words[code]) && words[code].length && rules[code] ? code : "en";
  }
  function formatSeconds(total) {
    const seconds = Math.max(0, Math.round(Number(total) || 0));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = String(seconds % 60).padStart(2, "0");
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
  }
  function untilNextDay(now = Date.now()) {
    const date = new Date(now);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1) - now;
  }
  function readStore(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* приватный режим или полное хранилище */ }
  }

  const controllers = new WeakMap();

  function render(host, ctx = {}) {
    if (!host) return;
    controllers.get(host)?.abort();
    const controller = new AbortController();
    controllers.set(host, controller);
    const { signal } = controller;

    const requested = String(ctx.lang || "en").toLowerCase();
    const uiLang = TEXT[LANG_ALIASES[requested] || requested] ? (LANG_ALIASES[requested] || requested) : "en";
    const lang = playLanguage(LANG_ALIASES[requested] || requested);
    const rule = window.GLOWLETTER_WORD_RULES?.[lang];
    const list = window.GLOWLETTER_WORDS?.[lang];
    const tr = (key, values = {}) => String((TEXT[uiLang] || TEXT.en)[key] ?? TEXT.en[key] ?? key).replace(/\{(\w+)\}/gu, (_, name) => String(values[name] ?? ""));
    const toast = text => { try { ctx.toast?.(text); } catch { /* ничего */ } };

    if (!rule || !Array.isArray(list) || !list.length) {
      host.innerHTML = `<div class="glw"><p class="glw-lead">${escapeHtml(tr("friendsFailed"))}</p></div>`;
      return;
    }

    const day = dayKey(Date.now());
    const answerRaw = String(list[wordIndex(dayNumber(day), list.length)]).normalize("NFC");
    const answer = foldWord(answerRaw, rule) || "";
    const storageKey = `${STORAGE_PREFIX}.${day}.${lang}`;
    const alphabet = Array.from(rule.alphabet);
    const wordLang = { ind: "id", no: "nb" }[lang] || lang;
    const isWord = value => typeof value === "string" && foldWord(value, rule) === value && Array.from(value).length === LENGTH;

    const saved = readStore(storageKey) || {};
    const state = {
      guesses: Array.isArray(saved.guesses) ? saved.guesses.filter(isWord).slice(0, MAX_TRIES) : [],
      current: typeof saved.current === "string" && foldWord(saved.current, rule) === saved.current ? Array.from(saved.current).slice(0, LENGTH).join("") : "",
      startedAt: Number(saved.startedAt) || 0,
      finishedAt: Number(saved.finishedAt) || 0,
      submitted: saved.submitted === true,
      friends: null,
      submitFailed: false,
      revealRow: -1,
      popIndex: -1,
      shake: false,
      announce: ""
    };
    const solved = () => state.guesses.includes(answer);
    const done = () => solved() || state.guesses.length >= MAX_TRIES;
    if (done() && !state.finishedAt) state.finishedAt = state.startedAt || Date.now();
    if (done()) state.current = "";
    const seconds = () => Math.min(86400, Math.max(1, Math.round(((state.finishedAt || Date.now()) - (state.startedAt || state.finishedAt || Date.now())) / 1000)));
    const save = () => writeStore(storageKey, {
      guesses: state.guesses, current: state.current, startedAt: state.startedAt, finishedAt: state.finishedAt, submitted: state.submitted
    });

    const tileLabel = (letter, mark) => tr(mark === "right" ? "tileRight" : mark === "present" ? "tilePresent" : "tileAbsent", { letter });

    function keyStates() {
      const rank = { absent: 1, present: 2, right: 3 };
      const best = new Map();
      for (const guess of state.guesses) {
        const marks = evaluate(guess, answer);
        Array.from(guess).forEach((letter, index) => {
          if ((rank[marks[index]] || 0) > (rank[best.get(letter)] || 0)) best.set(letter, marks[index]);
        });
      }
      return best;
    }

    function boardHtml(teaser) {
      const rows = [];
      for (let row = 0; row < MAX_TRIES; row += 1) {
        const guess = state.guesses[row];
        const isCurrent = !teaser && row === state.guesses.length && !done();
        const letters = guess ? Array.from(guess) : isCurrent ? Array.from(state.current) : [];
        const marks = guess ? evaluate(guess, answer) : teaser && row === 0 ? ["right", "absent", "present", "absent", "right"] : null;
        const classes = ["glw-row"];
        if (row === state.revealRow && !reduced()) classes.push("is-reveal");
        if (isCurrent && state.shake && !reduced()) classes.push("is-shake");
        const tiles = [];
        for (let index = 0; index < LENGTH; index += 1) {
          const letter = letters[index] || "";
          const mark = marks ? marks[index] : "";
          const tileClasses = ["glw-tile"];
          if (letter) tileClasses.push("is-filled");
          if (mark) tileClasses.push(`is-${mark}`);
          if (isCurrent && index === state.popIndex && !reduced()) tileClasses.push("is-pop");
          const label = teaser ? "" : mark ? tileLabel(letter, mark) : letter || tr("tileEmpty");
          tiles.push(`<span class="${tileClasses.join(" ")}" style="--i:${index}"${teaser ? "" : ` role="img" aria-label="${escapeHtml(label)}"`}>${escapeHtml(letter)}</span>`);
        }
        rows.push(`<div class="${classes.join(" ")}"${teaser ? "" : ` role="group" aria-label="${escapeHtml(tr("rowLabel", { n: row + 1 }))}"`}>${tiles.join("")}</div>`);
      }
      return `<div class="glw-board"${teaser ? ' aria-hidden="true"' : ` role="group" aria-label="${escapeHtml(tr("boardLabel"))}"`}>${rows.join("")}</div>`;
    }

    function keyboardHtml() {
      const states = keyStates();
      const keys = alphabet.map(letter => {
        const mark = states.get(letter);
        const label = mark ? tileLabel(letter, mark) : letter;
        return `<button class="glw-key${mark ? ` is-${mark}` : ""}" type="button" data-key="${escapeHtml(letter)}" aria-label="${escapeHtml(label)}">${escapeHtml(letter)}</button>`;
      }).join("");
      return `<div class="glw-keyboard" role="group" aria-label="${escapeHtml(tr("keyboardLabel"))}">
        <div class="glw-keys" lang="${wordLang}">${keys}</div>
        <div class="glw-actions">
          <button class="glw-key is-wide" type="button" data-action="enter">${escapeHtml(tr("enter"))}</button>
          <button class="glw-key is-wide" type="button" data-action="erase" aria-label="${escapeHtml(tr("erase"))}"><span class="glw-erase" aria-hidden="true">⌫</span></button>
        </div>
      </div>`;
    }

    function legendHtml() {
      return `<ul class="glw-legend">
        <li><span class="glw-mini is-right" aria-hidden="true"></span>${escapeHtml(tr("legendRight"))}</li>
        <li><span class="glw-mini is-present" aria-hidden="true"></span>${escapeHtml(tr("legendPresent"))}</li>
        <li><span class="glw-mini is-absent" aria-hidden="true"></span>${escapeHtml(tr("legendAbsent"))}</li>
      </ul>`;
    }

    function friendsHtml() {
      if (!ctx.signedIn) return `<p class="glw-muted">${escapeHtml(tr("signInNote"))}</p>`;
      if (state.friends === "loading" || state.friends === null) return `<p class="glw-muted">${escapeHtml(tr("friendsLoading"))}</p>`;
      if (state.friends === "error") return `<p class="glw-muted">${escapeHtml(tr("friendsFailed"))}</p><button class="glw-secondary" type="button" data-action="friends">${escapeHtml(tr("retry"))}</button>`;
      const rows = state.friends.filter(row => row && typeof row === "object");
      if (!rows.some(row => !row.me)) {
        return `${rows.length ? friendsTable(rows) : ""}<p class="glw-muted">${escapeHtml(tr("friendsEmpty"))}</p>`;
      }
      return friendsTable(rows);
    }

    function friendsTable(rows) {
      const body = rows.map(row => {
        const name = String(row.display_name || "").trim() || tr("friend");
        const tries = row.solved ? `${Number(row.attempts) || 0}/${MAX_TRIES}` : tr("notSolved");
        const time = row.solved ? formatSeconds(row.seconds) : "—";
        return `<tr class="${row.me ? "is-me" : ""}">
          <td class="glw-name"><span>${escapeHtml(name)}</span>${row.me ? ` <b class="glw-you">${escapeHtml(tr("you"))}</b>` : ""}</td>
          <td>${escapeHtml(tries)}</td>
          <td class="glw-num">${escapeHtml(time)}</td>
        </tr>`;
      }).join("");
      return `<table class="glw-table">
        <thead><tr><th scope="col">${escapeHtml(tr("thName"))}</th><th scope="col">${escapeHtml(tr("thTries"))}</th><th scope="col">${escapeHtml(tr("thTime"))}</th></tr></thead>
        <tbody>${body}</tbody>
      </table>`;
    }

    // «Новое слово через {time}»: время стоит там, где его ставит перевод, и обновляется каждую секунду.
    function countdownHtml() {
      const [before, after = ""] = tr("nextWord", { time: "\u0000" }).split("\u0000");
      return `${escapeHtml(before)}<b data-countdown>${escapeHtml(formatSeconds(untilNextDay() / 1000))}</b>${escapeHtml(after)}`;
    }

    function resultHtml() {
      const win = solved();
      return `<section class="glw-result${win ? " is-win" : ""}">
        <h3>${escapeHtml(tr(win ? "winTitle" : "loseTitle"))}</h3>
        <p class="glw-answer">${escapeHtml(tr("answerWas", { word: answerRaw }))}</p>
        <p class="glw-stats">${win ? `<span>${escapeHtml(tr("triesUsed", { n: state.guesses.length }))}</span>` : ""}<span>${escapeHtml(tr("timeUsed", { time: formatSeconds(seconds()) }))}</span></p>
        <button class="glw-primary" type="button" data-action="share">${escapeHtml(tr("share"))}</button>
        ${state.submitFailed ? `<p class="glw-muted">${escapeHtml(tr("saveFailed"))}</p><button class="glw-secondary" type="button" data-action="submit">${escapeHtml(tr("retry"))}</button>` : ""}
        <p class="glw-next">${countdownHtml()}</p>
      </section>
      <section class="glw-friends"><h3>${escapeHtml(tr("friendsTitle"))}</h3>${friendsHtml()}</section>`;
    }

    function paint() {
      if (signal.aborted) return;
      const premium = ctx.premium === true;
      const note = lang !== uiLang ? `<p class="glw-note">${escapeHtml(tr("englishNote"))}</p>` : "";
      let body;
      if (!premium) {
        body = `${boardHtml(true)}
          <section class="glw-lock">
            <h3>${escapeHtml(tr("premiumTitle"))}</h3>
            <p class="glw-muted">${escapeHtml(tr("premiumNote"))}</p>
            <button class="glw-primary" type="button" data-action="unlock">${escapeHtml(tr("unlock"))}</button>
          </section>`;
      } else {
        body = `${boardHtml(false)}${done() ? resultHtml() : keyboardHtml()}`;
      }
      host.innerHTML = `<div class="glw${premium ? "" : " is-locked"}"${rule.rtl ? ' dir="rtl"' : ""}>
        <header class="glw-head">
          <h3 class="glw-title">${escapeHtml(tr("title"))}</h3>
          <p class="glw-lead">${escapeHtml(tr("lead"))}</p>
          ${note}
          ${legendHtml()}
        </header>
        ${body}
        <p class="glw-sr" aria-live="polite">${escapeHtml(state.announce)}</p>
      </div>`;
      state.revealRow = -1;
      state.popIndex = -1;
      state.shake = false;
    }

    function complain(key) {
      toast(tr(key));
      state.shake = true;
      state.announce = tr(key);
      paint();
    }

    function addLetter(letter) {
      if (done() || Array.from(state.current).length >= LENGTH) return;
      if (!state.startedAt) state.startedAt = Date.now();
      state.current += letter;
      state.popIndex = Array.from(state.current).length - 1;
      state.announce = "";
      save();
      paint();
    }

    function erase() {
      if (done() || !state.current) return;
      state.current = Array.from(state.current).slice(0, -1).join("");
      state.announce = "";
      save();
      paint();
    }

    function enter() {
      if (done()) return;
      if (Array.from(state.current).length !== LENGTH) { complain("notEnough"); return; }
      const guess = state.current;
      const marks = evaluate(guess, answer);
      state.guesses.push(guess);
      state.current = "";
      state.revealRow = state.guesses.length - 1;
      state.announce = `${tr("rowLabel", { n: state.guesses.length })}: ${Array.from(guess).map((letter, index) => tileLabel(letter, marks[index])).join(", ")}`;
      if (done()) {
        state.finishedAt = Date.now();
        if (!state.startedAt) state.startedAt = state.finishedAt;
        state.announce += `. ${tr(solved() ? "winTitle" : "loseTitle")} ${tr("answerWas", { word: answerRaw })}`;
      }
      save();
      paint();
      if (done()) setTimeout(finish, reduced() ? 0 : REVEAL_MS * LENGTH);
    }

    async function finish() {
      if (signal.aborted || !done() || ctx.premium !== true || !ctx.signedIn) return;
      if (!state.submitted) {
        try {
          await ctx.rpc("glowletter_word_submit", { p_day: day, p_lang: lang, p_solved: solved(), p_attempts: state.guesses.length, p_seconds: seconds() });
          state.submitted = true;
          state.submitFailed = false;
          save();
        } catch (error) {
          const message = String(error?.message || error || "");
          if (/already_played/u.test(message)) {
            state.submitted = true;
            state.submitFailed = false;
            save();
          } else if (/premium_required/u.test(message)) {
            try { ctx.openPaywall?.(); } catch { /* ничего */ }
            return;
          } else {
            state.submitFailed = true;
          }
        }
      }
      await loadFriends();
    }

    async function loadFriends() {
      if (signal.aborted || !ctx.signedIn) return;
      state.friends = "loading";
      paint();
      try {
        const rows = await ctx.rpc("glowletter_word_friends", { p_day: day });
        state.friends = Array.isArray(rows) ? rows : [];
      } catch {
        state.friends = "error";
      }
      paint();
    }

    function squaresText() {
      const lines = state.guesses.map(guess => evaluate(guess, answer).map(mark => SQUARES[mark]).join(""));
      return `${tr("title")} · ${solved() ? state.guesses.length : "X"}/${MAX_TRIES}\n${lines.join("\n")}`;
    }

    async function share() {
      const text = squaresText();
      if (navigator.share) {
        try { await navigator.share({ text }); return; } catch (error) { if (error?.name === "AbortError") return; }
      }
      try {
        await navigator.clipboard.writeText(text);
        toast(tr("copied"));
        return;
      } catch { /* запасной путь ниже */ }
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.append(area);
        area.select();
        document.execCommand("copy");
        area.remove();
        toast(tr("copied"));
      } catch { /* ничего */ }
    }

    host.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target.closest("button") : null;
      if (!target || !host.contains(target)) return;
      if (target.dataset.key) { if (ctx.premium === true) addLetter(target.dataset.key); return; }
      const action = target.dataset.action;
      if (action === "enter") enter();
      else if (action === "erase") erase();
      else if (action === "share") share();
      else if (action === "unlock") { try { ctx.openPaywall?.(); } catch { /* ничего */ } }
      else if (action === "friends") loadFriends();
      else if (action === "submit") { state.submitFailed = false; finish(); }
    }, { signal });

    document.addEventListener("keydown", event => {
      if (!host.isConnected) { controller.abort(); return; }
      if (ctx.premium !== true || done() || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      if (!host.getClientRects().length) return;
      const field = event.target instanceof Element ? event.target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']") : null;
      if (field) return;
      if (event.key === "Enter") { event.preventDefault(); enter(); return; }
      if (event.key === "Backspace") { event.preventDefault(); erase(); return; }
      if (Array.from(event.key || "").length !== 1 || !/\p{L}/u.test(event.key)) return;
      const letter = foldWord(event.key, rule);
      event.preventDefault();
      if (letter && Array.from(letter).length === 1) addLetter(letter);
      else complain("onlyLetters");
    }, { signal });

    // Обратный отсчёт до нового слова; в полночь UTC игра открывается заново.
    const timer = setInterval(() => {
      if (!host.isConnected) { controller.abort(); return; }
      if (dayKey(Date.now()) !== day) { render(host, ctx); return; }
      const out = host.querySelector("[data-countdown]");
      if (out) out.textContent = formatSeconds(untilNextDay() / 1000);
    }, 1000);
    signal.addEventListener("abort", () => clearInterval(timer));

    paint();
    if (done()) finish();
  }

  window.GlowLetterWord = Object.freeze({ render });
})();
