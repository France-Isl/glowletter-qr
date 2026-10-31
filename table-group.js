/*
  «Игровой стол» · игры на компанию до четырёх человек: все отвечают одновременно,
  потом карточки переворачиваются и видно, кто что выбрал.

    • who   — «Кто из нас…»: вопрос, каждый выбирает одного из игроков; больше всех голосов — 👑.
    • pics  — «Выбери картинку»: четыре картинки; очко тем, кто совпал с большинством.
    • guess — «Угадай ответ»: ведёт раунд каждый по очереди (кто за столом) и честно отвечает на вопрос,
      остальные угадывают его ответ. Очко за угаданное, ведущему — если угадал хоть кто-то.

  Раунд: 20 секунд на ответ (кольцо-таймер, точки «ответили N из M»), раскрытие ответов,
  через 12 секунд или по кнопке — следующий раунд. После восьми раундов — итоги с 🥇🥈🥉
  и «Ещё партия» стола. Итог на сервер не записывается (record: false): очки только в партии.

  Синхронизация. Состоянием раунда распоряжается «ведущий стола» — первый по списку
  участник, который сейчас за столом (если он ушёл, его место сразу занимает следующий).
  Ответы рассылаются всем («a»), ведущий стола считает и рассылает состояние целиком
  («st» с версией [раунд, фаза, номер]); принимается только более новое. Время передаётся
  остатком в мс. Вопросы и порядок у всех одинаковые: api.rng() общий.

  Вопросы — window.GLOWLETTER_TABLE_GROUP (table-group-content.js и …-i18n.js).
*/
(() => {
  "use strict";

  const ROUNDS = 8;
  const ANSWER_MS = 20000;
  const REVEAL_MS = 12000;
  const PHASE = { ask: 0, reveal: 1, end: 2 };
  const MEDALS = ["🥇", "🥈", "🥉"];
  const RING = 2 * Math.PI * 20;

  // ——— Чистые помощники (их же проверяют тесты) ———

  function seeded(seed) {
    let value = seed >>> 0 || 1;
    return () => {
      value = (value + 0x6d2b79f5) >>> 0;
      let mixed = value;
      mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
      return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(count, rand) {
    const list = Array.from({ length: Math.max(0, count) }, (_, index) => index);
    for (let index = list.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(rand() * (index + 1));
      [list[index], list[swap]] = [list[swap], list[index]];
    }
    return list;
  }

  const optionCount = (kind, players) => (kind === "who" ? players : 4);

  // Сколько раз выбрали каждый вариант.
  function tally(answers, options) {
    const counts = new Array(options).fill(0);
    for (const choice of answers) if (Number.isInteger(choice) && choice >= 0 && choice < options) counts[choice] += 1;
    return counts;
  }

  // Итог раунда: top — выделенные варианты, gain — сколько очков получил каждый игрок.
  // host — номер того, кто ведёт раунд в «Угадай ответ».
  function scoreRound(kind, answers, players, host = 0) {
    const gain = new Array(players).fill(0);
    if (kind === "who") {
      const counts = tally(answers, players);
      const max = Math.max(0, ...counts);
      counts.forEach((count, index) => { gain[index] = count; });
      return { gain, top: max > 0 ? counts.map((count, index) => (count === max ? index : -1)).filter(index => index >= 0) : [] };
    }
    if (kind === "pics") {
      const counts = tally(answers, 4);
      const max = Math.max(0, ...counts);
      const top = max >= 2 ? counts.map((count, index) => (count === max ? index : -1)).filter(index => index >= 0) : [];
      answers.forEach((choice, index) => { if (top.includes(choice)) gain[index] = 1; });
      return { gain, top };
    }
    const secret = answers[host];
    if (!Number.isInteger(secret)) return { gain, top: [] };
    let right = 0;
    answers.forEach((choice, index) => { if (index !== host && choice === secret) { gain[index] = 1; right += 1; } });
    if (right) gain[host] = 1;
    return { gain, top: [secret] };
  }

  // Места с общими местами при равенстве: 5, 5, 3 → 1, 1, 3.
  function ranking(scores) {
    const order = scores.map((score, index) => ({ index, score })).sort((left, right) => right.score - left.score || left.index - right.index);
    order.forEach((item, position) => { item.place = position && order[position - 1].score === item.score ? order[position - 1].place : position + 1; });
    return order;
  }

  // Вопросы на языке, иначе английский; номер — общий для всех языков.
  function itemsFor(kind, lang) {
    const all = window.GLOWLETTER_TABLE_GROUP?.[kind] || {};
    const base = Array.isArray(all.en) ? all.en : [];
    const local = Array.isArray(all[lang]) ? all[lang] : base;
    return { count: base.length, emoji: Array.isArray(all.emoji) ? all.emoji : [], item: index => local[index] ?? base[index] };
  }

  if (window.__GLOWLETTER_TEST__) {
    window.GlowLetterTableGroupTest = Object.freeze({ seeded, shuffled, tally, scoreRound, ranking, itemsFor, optionCount, ROUNDS, ANSWER_MS });
  }

  if (!window.GlowLetterTable) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const int = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const buzz = pattern => { try { if (navigator.userActivation?.hasBeenActive !== false) navigator.vibrate?.(pattern); } catch {} };
  const compare = (left, right) => { for (let index = 0; index < left.length; index += 1) { if (left[index] !== right[index]) return left[index] - right[index]; } return 0; };

  function countdown() {
    let left = 0;
    let deadline = 0;
    let paused = false;
    const timer = {
      set(ms, pause = false) { paused = Boolean(pause); left = Math.max(0, ms); deadline = Date.now() + left; },
      pause() { if (!paused) { left = timer.left(); paused = true; } },
      resume() { if (paused) { paused = false; deadline = Date.now() + left; } },
      left: () => (paused ? left : Math.max(0, deadline - Date.now())),
      paused: () => paused
    };
    return timer;
  }

  function mountGroup(kind, el, api) {
    const roster = api.players.map(item => item.id);
    const n = roster.length;
    const mine = roster.indexOf(api.me);
    const options = optionCount(kind, n);
    const content = itemsFor(kind, api.lang);
    const order = shuffled(content.count, seeded(Math.floor(api.rng() * 4294967296)));
    const itemAt = round => (order.length ? order[round % order.length] : 0);
    const s = { v: 0, r: 0, phase: "ask", item: itemAt(0), host: 0, answers: new Array(n).fill(null), scores: new Array(n).fill(0), log: [] };
    const timer = countdown();
    let present = api.present();
    let finished = false;
    let shown = "";
    timer.set(ANSWER_MS);

    el.innerHTML = `<div class="gltg gltg-${kind}" data-ref="root"></div>`;
    const root = el.firstElementChild;

    const nameAt = index => api.players[index]?.name || "…";
    const lead = () => roster.find(id => present.includes(id)) || "";
    const iLead = () => lead() === api.me;
    const together = () => present.length >= 2;
    const total = () => (s.phase === "ask" ? ANSWER_MS : REVEAL_MS);
    const waiting = () => roster.map((id, index) => index).filter(index => present.includes(roster[index]));
    const allIn = () => waiting().every(index => s.answers[index] != null);
    const pack = () => ({ ...s, answers: s.answers.slice(), scores: s.scores.slice(), log: s.log.map(entry => ({ ...entry })), left: timer.left() });
    const broadcast = () => { s.v += 1; api.send("st", pack()); };
    const label = (index, me = index === mine) => `${escapeHtml(nameAt(index))}${me ? ` <small>(${escapeHtml(api.tt("you"))})</small>` : ""}`;
    const chip = (index, extra = "", delay = 0) => `<li class="gltg-chip${index === mine ? " is-me" : ""}${extra}" style="--gltg-c:${index};--gltg-d:${delay}">${escapeHtml(nameAt(index))}</li>`;

    // ——— Текст вопроса и вариантов ———

    function question(entry = s) {
      const item = content.item(entry.item);
      return kind === "guess" ? String(item?.[0] ?? "") : String(item ?? "");
    }

    function optionHtml(index, entry = s) {
      if (kind === "who") return `<span class="gltg-face" aria-hidden="true">${escapeHtml([...nameAt(index)][0]?.toUpperCase() || "?")}</span><span class="gltg-opt-text">${label(index)}</span>`;
      const emoji = content.emoji[entry.item]?.[index] || "❔";
      if (kind === "pics") return `<span class="gltg-pic" aria-hidden="true">${escapeHtml(emoji)}</span><span class="gltp-sr gltg-sr">${escapeHtml(api.t("picture", { n: index + 1 }))} ${escapeHtml(emoji)}</span>`;
      const text = content.item(entry.item)?.[index + 1] ?? "";
      return `<span class="gltg-pic gltg-pic-small" aria-hidden="true">${escapeHtml(emoji)}</span><span class="gltg-opt-text">${escapeHtml(text)}</span>`;
    }

    function ringHtml() {
      const ms = timer.left();
      return `
        <div class="gltg-ring${ms <= 5000 && s.phase === "ask" ? " is-low" : ""}" role="timer" aria-label="${escapeHtml(api.t("timeLeft", { s: Math.ceil(ms / 1000) }))}">
          <svg viewBox="0 0 48 48" aria-hidden="true"><circle class="gltg-ring-track" cx="24" cy="24" r="20"/><circle class="gltg-ring-left" data-ref="ring" cx="24" cy="24" r="20" stroke-dasharray="${RING.toFixed(2)}" stroke-dashoffset="${(RING * (1 - ms / total())).toFixed(2)}"/></svg>
          <b data-ref="sec">${Math.ceil(ms / 1000)}</b>
        </div>`;
    }

    function leadLine() {
      if (kind !== "guess") return "";
      const host = s.host;
      const text = host === mine ? api.t("hostMe") : api.t("hostOther", { name: nameAt(host) });
      return `<p class="gltg-lead${host === mine ? " is-me" : ""}">${escapeHtml(text)}</p>`;
    }

    // ——— Экраны ———

    function render() {
      if (s.phase === "end") { renderEnd(); return; }
      const key = `${s.r}:${s.phase}`;
      const fresh = key !== shown;
      shown = key;
      const head = `
        <div class="gltg-bar">
          <span class="gltg-round">${escapeHtml(api.t("round", { n: s.r + 1, total: ROUNDS }))}</span>
          ${ringHtml()}
        </div>
        ${leadLine()}
        <article class="gltg-q${fresh && !reduced() ? " is-new" : ""}" aria-live="polite"><p>${escapeHtml(question())}</p></article>`;
      root.innerHTML = head + (s.phase === "ask" ? askHtml() : revealHtml(fresh));
      if (s.phase === "reveal" && fresh) buzz([40, 30, 40]);
    }

    function askHtml() {
      const picked = mine >= 0 ? s.answers[mine] : null;
      const answered = s.answers.filter(choice => choice != null).length;
      const list = Array.from({ length: options }, (_, index) => index);
      const note = mine < 0 ? api.t("watchTip") : !together() ? api.t("alone") : picked != null ? api.t("waitOthers") : kind === "who" ? api.t("tapName") : kind === "pics" ? api.t("pickPic") : "";
      return `
        <div class="gltg-options gltg-options-${kind}${kind === "who" && n === 3 ? " is-three" : ""}" role="group" aria-label="${escapeHtml(question())}">
          ${list.map(index => `
            <button class="gltg-opt${picked === index ? " is-picked" : ""}${picked != null && picked !== index ? " is-dim" : ""}" type="button" data-act="pick" data-index="${index}" style="--gltg-c:${index}" aria-pressed="${picked === index}"${mine < 0 || picked != null ? " disabled" : ""}>
              ${optionHtml(index)}
            </button>`).join("")}
        </div>
        <div class="gltg-dots" aria-label="${escapeHtml(api.t("answered", { n: answered, total: n }))}">
          <span class="gltg-dots-text">${escapeHtml(api.t("answered", { n: answered, total: n }))}</span>
          <ul>${roster.map((id, index) => `<li class="gltg-dot${s.answers[index] != null ? " is-in" : ""}${present.includes(id) ? "" : " is-away"}${index === mine ? " is-me" : ""}" style="--gltg-c:${index}" title="${escapeHtml(nameAt(index))}"><i aria-hidden="true"></i>${escapeHtml(nameAt(index))}</li>`).join("")}</ul>
        </div>
        <p class="gltg-note" aria-live="polite">${escapeHtml(note)}</p>`;
    }

    function revealHtml(fresh) {
      const last = s.log[s.log.length - 1] || { top: [], gain: new Array(n).fill(0), a: s.answers, host: s.host };
      const answers = last.a;
      const host = last.host ?? s.host;
      const anim = fresh && !reduced() ? " is-anim" : "";
      const cards = Array.from({ length: options }, (_, option) => {
        const voters = answers.map((choice, index) => (choice === option && !(kind === "guess" && index === host) ? index : -1)).filter(index => index >= 0);
        const top = last.top.includes(option);
        const badge = kind === "who" && top ? `<span class="gltg-badge">👑</span>`
          : kind === "pics" && top ? `<span class="gltg-badge">${escapeHtml(api.t("majority"))}</span>`
          : kind === "guess" && top ? `<span class="gltg-badge">${escapeHtml(api.t("hostAnswer", { name: nameAt(host) }))}</span>` : "";
        return `
          <div class="gltg-card${top ? " is-top" : ""}${anim}" style="--gltg-c:${option};--gltg-i:${option}">
            ${badge}
            <div class="gltg-card-face">${optionHtml(option, last)}</div>
            <ul class="gltg-chips" aria-label="${escapeHtml(api.t("chosenBy"))}">
              ${voters.length ? voters.map((index, step) => chip(index, kind === "guess" && top ? " is-right" : "", option * 2 + step)).join("") : `<li class="gltg-none">${escapeHtml(kind === "who" ? api.t("noVotes") : "—")}</li>`}
            </ul>
          </div>`;
      }).join("");
      const missing = answers.map((choice, index) => (choice == null ? index : -1)).filter(index => index >= 0);
      const summary = summaryLine(last, host);
      const next = s.r + 1 >= ROUNDS ? api.t("toResults") : api.t("next");
      return `
        <div class="gltg-cards gltg-cards-${kind}${kind === "who" && n === 3 ? " is-three" : ""}">${cards}</div>
        <p class="gltg-summary${anim}" aria-live="polite">${escapeHtml(summary)}</p>
        ${missing.length ? `<p class="gltg-missing">${escapeHtml(api.t("noAnswer"))}: ${escapeHtml(missing.map(nameAt).join(", "))}</p>` : ""}
        ${scoreboard(last.gain)}
        <div class="gltg-next">
          <button class="glg-primary gltp-wide" type="button" data-act="next">${escapeHtml(next)} →</button>
          <p class="gltg-auto" data-ref="auto">${escapeHtml(api.t("autoNext", { s: Math.ceil(timer.left() / 1000) }))}</p>
        </div>`;
    }

    function summaryLine(entry, host) {
      if (kind === "who") return entry.top.length ? api.t("mostVotes", { names: entry.top.map(nameAt).join(", ") }) : api.t("noVotes");
      if (kind === "pics") return entry.top.length ? api.t("matched") : api.t("noMajority");
      if (!entry.top.length) return api.t("hostSilent", { name: nameAt(host) });
      const right = entry.gain.map((value, index) => (value && index !== host ? index : -1)).filter(index => index >= 0);
      return right.length ? api.t("guessedRight", { names: right.map(nameAt).join(", ") }) : api.t("nobodyRight");
    }

    function scoreboard(gain) {
      return `
        <ul class="gltg-score">
          ${ranking(s.scores).map(({ index, score }) => `
            <li class="${index === mine ? "is-me" : ""}" style="--gltg-c:${index}">
              <span class="gltg-score-name">${escapeHtml(nameAt(index))}</span>
              <b>${escapeHtml(api.t(kind === "who" ? "votes" : "pts", { n: score }))}</b>
              ${gain?.[index] ? `<span class="gltg-plus">+${gain[index]}</span>` : ""}
            </li>`).join("")}
        </ul>`;
    }

    function renderEnd() {
      const places = ranking(s.scores);
      const recap = s.log.map(entry => {
        const host = entry.host ?? 0;
        let result;
        if (kind === "who") result = entry.top.length ? `👑 ${entry.top.map(nameAt).join(", ")}` : "—";
        else if (kind === "pics") result = entry.top.length ? entry.top.map(option => content.emoji[entry.item]?.[option] || "").join(" ") : "—";
        else result = entry.top.length ? `${nameAt(host)}: ${content.emoji[entry.item]?.[entry.top[0]] || ""} ${content.item(entry.item)?.[entry.top[0] + 1] ?? ""}` : "—";
        return `<li><span>${escapeHtml(question(entry))}</span><b>${escapeHtml(result)}</b></li>`;
      }).join("");
      root.innerHTML = `
        <div class="gltg-end${reduced() ? "" : " is-anim"}">
          <p class="gltg-trophy" aria-hidden="true">🏆</p>
          <h3>${escapeHtml(api.t("endTitle"))}</h3>
          <p class="gltg-muted">${escapeHtml(api.t(kind === "who" ? "endWho" : "endScore"))}</p>
          <ol class="gltg-rank">
            ${places.map(({ index, score, place }, step) => `
              <li class="${index === mine ? "is-me" : ""}${place === 1 ? " is-first" : ""}" style="--gltg-c:${index};--gltg-d:${step}">
                <span class="gltg-medal${place > 3 ? " is-num" : ""}" aria-label="${escapeHtml(api.t("place", { n: place }))}">${MEDALS[place - 1] || `${place}.`}</span>
                <span class="gltg-rank-name">${label(index)}</span>
                <b>${escapeHtml(api.t(kind === "who" ? "votes" : "pts", { n: score }))}</b>
              </li>`).join("")}
          </ol>
          ${recap ? `<details class="gltg-recap"><summary>${escapeHtml(api.t("recap"))}</summary><ol>${recap}</ol></details>` : ""}
        </div>`;
      if (!finished) { finished = true; api.finish("done"); }
    }

    function paint() {
      const ms = timer.left();
      const ring = root.querySelector("[data-ref=ring]");
      if (ring) ring.setAttribute("stroke-dashoffset", (RING * (1 - ms / total())).toFixed(2));
      const sec = root.querySelector("[data-ref=sec]");
      if (sec) sec.textContent = String(Math.ceil(ms / 1000));
      root.querySelector(".gltg-ring")?.classList.toggle("is-low", ms <= 5000 && s.phase === "ask");
      const auto = root.querySelector("[data-ref=auto]");
      if (auto) auto.textContent = api.t("autoNext", { s: Math.ceil(ms / 1000) });
    }

    // ——— Ход игры (меняет только ведущий стола) ———

    function reveal() {
      if (s.phase !== "ask") return;
      const answers = s.answers.slice();
      const { gain, top } = scoreRound(kind, answers, n, s.host);
      s.scores = s.scores.map((score, index) => score + gain[index]);
      s.log.push({ item: s.item, a: answers, top, gain, host: s.host });
      s.phase = "reveal";
      timer.set(REVEAL_MS, !together());
      broadcast();
      render();
    }

    function advance() {
      if (s.phase !== "reveal") return;
      if (s.r + 1 >= ROUNDS) {
        s.phase = "end";
      } else {
        s.r += 1;
        s.phase = "ask";
        s.item = itemAt(s.r);
        // Ведёт следующий по кругу из тех, кто за столом.
        for (let step = 1; step <= n; step += 1) {
          const next = (s.host + step) % n;
          if (present.includes(roster[next]) || step === n) { s.host = next; break; }
        }
        s.answers = new Array(n).fill(null);
        timer.set(ANSWER_MS, !together());
      }
      broadcast();
      render();
    }

    function pick(index) {
      if (mine < 0 || s.phase !== "ask" || s.answers[mine] != null || !int(index, 0, options - 1)) return;
      s.answers[mine] = index;
      buzz(25);
      api.send("a", { r: s.r, c: index });
      if (iLead()) { broadcast(); if (allIn() && together()) reveal(); }
      render();
    }

    const validLog = entry => entry && int(entry.item, 0, 100000) && Array.isArray(entry.a) && entry.a.length === n
      && entry.a.every(choice => choice == null || int(choice, 0, options - 1))
      && Array.isArray(entry.top) && entry.top.length <= options && entry.top.every(choice => int(choice, 0, options - 1))
      && Array.isArray(entry.gain) && entry.gain.length === n && entry.gain.every(value => int(value, 0, 4)) && int(entry.host, 0, n - 1);

    function validState(data) {
      return data && int(data.v, 0, 1000000) && int(data.r, 0, ROUNDS - 1) && data.phase in PHASE && int(data.item, 0, 100000) && int(data.host, 0, n - 1)
        && Array.isArray(data.answers) && data.answers.length === n && data.answers.every(choice => choice == null || int(choice, 0, options - 1))
        && Array.isArray(data.scores) && data.scores.length === n && data.scores.every(value => int(value, 0, 1000))
        && Array.isArray(data.log) && data.log.length <= ROUNDS && data.log.every(validLog)
        && Number.isFinite(data.left) && data.left >= 0 && data.left <= Math.max(ANSWER_MS, REVEAL_MS);
    }

    function apply(data) {
      const sameRound = data.r === s.r && data.phase === "ask" && s.phase === "ask";
      const answers = data.answers.slice();
      // Ответ, который уже дошёл до меня, не теряем, даже если ведущий стола его ещё не видел.
      if (sameRound) s.answers.forEach((choice, index) => { if (answers[index] == null && choice != null) answers[index] = choice; });
      Object.assign(s, { v: data.v, r: data.r, phase: data.phase, item: data.item, host: data.host, answers, scores: data.scores.slice(), log: data.log.map(entry => ({ item: entry.item, a: entry.a.slice(), top: entry.top.slice(), gain: entry.gain.slice(), host: entry.host })) });
      if (s.phase !== "end") timer.set(data.left, !together());
      render();
    }

    function onClick(event) {
      const button = event.target.closest("[data-act]");
      if (!button || !el.contains(button)) return;
      if (button.dataset.act === "pick") pick(Number(button.dataset.index));
      else if (button.dataset.act === "next" && s.phase === "reveal") {
        if (iLead()) advance();
        else { api.send("next", { r: s.r }); button.disabled = true; }
      }
    }

    el.addEventListener("click", onClick);

    const tick = setInterval(() => {
      if (s.phase === "end") return;
      paint();
      if (!iLead() || timer.paused()) return;
      if (s.phase === "ask" && (timer.left() <= 0 || (allIn() && together()))) reveal();
      else if (s.phase === "reveal" && timer.left() <= 0) advance();
    }, 250);

    render();

    return {
      onMessage(type, data, from) {
        if (type === "st" && validState(data)) {
          if (compare([data.r, PHASE[data.phase], data.v], [s.r, PHASE[s.phase], s.v]) > 0) apply(data);
        } else if (type === "a" && data && int(data.c, 0, options - 1) && data.r === s.r && s.phase === "ask") {
          const index = roster.indexOf(from);
          if (index < 0 || s.answers[index] != null) return;
          s.answers[index] = data.c;
          if (iLead()) { broadcast(); if (allIn() && together()) { reveal(); return; } }
          render();
        } else if (type === "next" && data && data.r === s.r && s.phase === "reveal" && iLead()) {
          advance();
        }
      },
      onPlayers(ids) {
        const wasLead = iLead();
        present = Array.isArray(ids) ? ids.slice() : api.present();
        if (together()) timer.resume(); else timer.pause();
        // Ведущий стола сменился — напоминаем свой ответ новому.
        if (!wasLead && s.phase === "ask" && mine >= 0 && s.answers[mine] != null) api.send("a", { r: s.r, c: s.answers[mine] });
        if (iLead() && !wasLead && s.v > 0) api.send("st", pack());
        if (s.phase !== "end") render();
      },
      snapshot: () => pack(),
      restore(data) { if (validState(data) && compare([data.r, PHASE[data.phase], data.v], [s.r, PHASE[s.phase], s.v]) >= 0) apply(data); },
      destroy() {
        clearInterval(tick);
        el.removeEventListener("click", onClick);
      }
    };
  }

  // ——— Тексты и регистрация ———

  const COMMON = {
    ru: {
      round: "Раунд {n} из {total}", answered: "Ответили: {n} из {total}", timeLeft: "Осталось {s} с",
      waitOthers: "Ответ принят — ждём остальных…", watchTip: "Вы смотрите: отвечают участники партии",
      alone: "Ждём, когда остальные вернутся к столу…", noAnswer: "Без ответа", chosenBy: "Выбрали",
      next: "Следующий раунд", toResults: "Итоги", autoNext: "Дальше через {s} с",
      endTitle: "Игра окончена!", endScore: "Итоговые очки", recap: "Все раунды", pts: "Очки: {n}", place: "Место {n}"
    },
    en: {
      round: "Round {n} of {total}", answered: "Answered: {n} of {total}", timeLeft: "{s} s left",
      waitOthers: "Answer saved — waiting for the others…", watchTip: "You’re watching: only players in this game answer",
      alone: "Waiting for the others to come back to the table…", noAnswer: "No answer", chosenBy: "Chosen by",
      next: "Next round", toResults: "Results", autoNext: "Moving on in {s} s",
      endTitle: "Game over!", endScore: "Final points", recap: "All rounds", pts: "Points: {n}", place: "Place {n}"
    },
    fr: {
      round: "Manche {n} sur {total}", answered: "Réponses : {n} sur {total}", timeLeft: "Encore {s} s",
      waitOthers: "Réponse enregistrée — on attend les autres…", watchTip: "Vous regardez : seuls les participants répondent",
      alone: "On attend que les autres reviennent à la table…", noAnswer: "Sans réponse", chosenBy: "Choisi par",
      next: "Manche suivante", toResults: "Résultats", autoNext: "Suite dans {s} s",
      endTitle: "Partie terminée !", endScore: "Points finaux", recap: "Toutes les manches", pts: "Points : {n}", place: "Place {n}"
    }
  };

  const TEXT = {
    who: {
      ru: { title: "Кто из нас…", short: "Все выбирают, о ком вопрос", tapName: "Выберите, кто подходит больше всех", mostVotes: "Больше всего голосов: {names}", noVotes: "Голосов нет", votes: "Голоса: {n}", endWho: "Кого выбирали чаще всех" },
      en: { title: "Who of us…", short: "Everyone picks who fits the question", tapName: "Tap the person who fits best", mostVotes: "Most votes: {names}", noVotes: "No votes", votes: "Votes: {n}", endWho: "Who was chosen most often" },
      fr: { title: "Qui de nous…", short: "Désignez qui correspond le mieux", tapName: "Touchez la personne qui correspond le mieux", mostVotes: "Le plus de voix : {names}", noVotes: "Aucune voix", votes: "Voix : {n}", endWho: "Qui revient le plus souvent" }
    },
    pics: {
      ru: { title: "Выбери картинку", short: "Совпадите с большинством", pickPic: "Выберите картинку, которая ближе вам", picture: "Картинка {n}", majority: "Выбор большинства", matched: "Совпали с большинством — по очку!", noMajority: "У всех свой вкус — в этот раз без очков" },
      en: { title: "Pick a picture", short: "Match the most popular pick", pickPic: "Pick the picture that feels closest", picture: "Picture {n}", majority: "Most popular", matched: "In tune with the majority — a point each!", noMajority: "Everyone has their own taste — no points this time" },
      fr: { title: "Choisis une image", short: "Choisissez comme la majorité", pickPic: "Choisissez l’image qui vous parle le plus", picture: "Image {n}", majority: "Choix de la majorité", matched: "En accord avec la majorité — un point chacun !", noMajority: "Chacun ses goûts — pas de points cette fois" }
    },
    guess: {
      ru: { title: "Угадай ответ", short: "Угадайте ответ того, кто ведёт", hostMe: "Раунд ведёте вы — выберите свой честный ответ", hostOther: "Раунд ведёт {name}. Что выберет {name}?", hostAnswer: "Ответ: {name}", guessedRight: "Угадали: {names}", nobodyRight: "В этот раз ответ не угадан", hostSilent: "{name} не отвечает — раунд без очков" },
      en: { title: "Guess the answer", short: "Guess the secret answer", hostMe: "You lead this round — pick your honest answer", hostOther: "{name} leads this round. What will {name} pick?", hostAnswer: "{name}’s answer", guessedRight: "Guessed right: {names}", nobodyRight: "Nobody guessed it this time", hostSilent: "No answer from {name} — no points this round" },
      fr: { title: "Devine la réponse", short: "Devinez la réponse secrète", hostMe: "Vous menez cette manche — choisissez votre vraie réponse", hostOther: "{name} mène cette manche. Que va choisir {name} ?", hostAnswer: "Réponse de {name}", guessedRight: "Bien deviné : {names}", nobodyRight: "Personne n’a deviné cette fois", hostSilent: "Pas de réponse de {name} — manche sans points" }
    }
  };

  const ICONS = { who: "🙋", pics: "🖼️", guess: "🎯" };
  const ORDER = { who: 10, pics: 12, guess: 14 };
  const TABLE = window.GlowLetterTable;
  for (const kind of ["who", "pics", "guess"]) {
    const text = {};
    for (const lang of ["ru", "en", "fr"]) text[lang] = { ...COMMON[lang], ...TEXT[kind][lang] };
    TABLE.register({ id: kind, icon: ICONS[kind], order: ORDER[kind], players: 4, record: false, text, mount: (el, api) => mountGroup(kind, el, api) });
  }
})();
