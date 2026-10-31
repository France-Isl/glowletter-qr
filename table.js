/*
  «Игровой стол» (2.4.26): игры вдвоём в реальном времени — во время звонка
  или просто по приглашению [[play:комната]] из переписки.

  Стол — общий канал Realtime broadcast glowletter-table:<комната>; на сервере
  ничего не хранится, кроме итога партии (glowletter_play_record → очки паре,
  рейтинг и огонёк дней). Каждая игра регистрируется отдельно:

    GlowLetterTable.register({
      id: "four", icon: "🔴", order: 50,
      text: { ru: {...}, en: {...}, fr: {...} },   // остальные языки — GLOWLETTER_TABLE_I18N[lang][id]
      mount(el, api) { ...; return { onMessage(type, data, from) {}, onPartner(here) {}, snapshot() {}, restore(data) {}, destroy() {} }; }
    });

  api: me, friend {id, name}, first (кто ходит первым), iStart, seed, rng() — общий
  для обоих генератор случайных чисел (после restore начинается заново — счётчик
  храните в snapshot), send(type, data), t(key, values) — тексты игры, tt(key) —
  тексты стола, lang, partnerHere(), finish(result: win|loss|draw|done), toast(text),
  escapeHtml(text). send возвращает false, если сообщение не ушло. Из mount() ничего
  не отправляйте: при возвращении к партии restore() вызывается уже после mount().
  Итог партии сервер засчитывает один раз (по id партии).
  Сообщение игры не больше ~8 КБ; приходят только чужие сообщения.
*/
(() => {
  "use strict";

  if (window.GlowLetterTable) return;

  const TEXT = {
    ru: {
      title: "Игровой стол", pick: "Во что играем?", waiting: "Ждём, когда {name} сядет за стол…", here: "{name} за столом",
      away: "{name} пока не за столом", invite: "Позвать к столу", invited: "Приглашение отправлено", close: "Выйти из-за стола",
      back: "К выбору игры", again: "Ещё партия", other: "Другая игра", points: "+{n} очков вашей паре",
      win: "Победа!", loss: "В этот раз выигрывает {name}", draw: "Ничья", done: "Готово! Отличная игра",
      yourTurn: "Ваш ход", friendTurn: "Ходит {name}", started: "{name} выбирает игру: {game}", left: "{name} вышел из игры",
      premiumNote: "Начинать игры можно с полным доступом. Если у друга он есть — играть можно вместе бесплатно.",
      offline: "Нет связи со столом. Проверьте интернет.", score: "Счёт: {me} : {friend}"
    },
    en: {
      title: "Game table", pick: "What shall we play?", waiting: "Waiting for {name} to join…", here: "{name} is at the table",
      away: "{name} isn’t at the table yet", invite: "Invite to the table", invited: "Invitation sent", close: "Leave the table",
      back: "Choose a game", again: "Play again", other: "Another game", points: "+{n} points for you two",
      win: "You win!", loss: "{name} wins this time", draw: "It’s a draw", done: "Done! Great game",
      yourTurn: "Your turn", friendTurn: "{name}’s turn", started: "{name} picked a game: {game}", left: "{name} left the game",
      premiumNote: "Starting games is part of full access. If your friend has it, you can play together for free.",
      offline: "Can’t reach the table. Check your connection.", score: "Score: {me} : {friend}"
    },
    fr: {
      title: "Table de jeu", pick: "On joue à quoi ?", waiting: "On attend que {name} arrive…", here: "{name} est à la table",
      away: "{name} n’est pas encore à la table", invite: "Inviter à la table", invited: "Invitation envoyée", close: "Quitter la table",
      back: "Choisir un jeu", again: "Rejouer", other: "Un autre jeu", points: "+{n} points pour vous deux",
      win: "Victoire !", loss: "Cette fois, {name} gagne", draw: "Égalité", done: "Bravo ! Belle partie",
      yourTurn: "À vous de jouer", friendTurn: "Au tour de {name}", started: "{name} a choisi un jeu : {game}", left: "{name} a quitté la partie",
      premiumNote: "Lancer des jeux fait partie de l’accès complet. Si votre ami l’a, vous jouez ensemble gratuitement.",
      offline: "Impossible de joindre la table. Vérifiez la connexion.", score: "Score : {me} : {friend}"
    }
  };

  const GAMES = new Map();
  const ROOM = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
  const MAX_PAYLOAD = 8000;

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const userId = () => cloud()?.getState?.().userId || "";
  const premium = () => Boolean(app()?.getState?.().premium);
  const lang = () => {
    const code = app()?.getState?.().language || document.documentElement.lang || "ru";
    return code === "id" ? "ind" : code;
  };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const fill = (text, values = {}) => String(text).replace(/\{(\w+)\}/gu, (match, key) => (key in values ? String(values[key]) : match));

  function tableText(key, values) {
    const extra = window.GLOWLETTER_TABLE_I18N?.[lang()]?.table || {};
    return fill(TEXT[lang()]?.[key] ?? extra[key] ?? TEXT.en[key] ?? key, values);
  }

  function gameText(game, key, values) {
    const extra = window.GLOWLETTER_TABLE_I18N?.[lang()]?.[game.id] || {};
    return fill(game.text?.[lang()]?.[key] ?? extra[key] ?? game.text?.en?.[key] ?? key, values);
  }

  // Общий генератор случайных чисел: у обоих одна раздача, одна карта, одно слово.
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

  const state = {
    root: null, room: "", friend: null, channel: null, partner: false, online: true,
    match: null, instance: null, startedAt: 0, recorded: false, lastFocus: null, toastTimer: 0
  };

  function register(game) {
    if (!game?.id || typeof game.mount !== "function" || GAMES.has(game.id)) return;
    GAMES.set(game.id, game);
    if (state.root && !state.root.hidden && !state.match) render();
  }

  // ——— Окно ———

  function mount() {
    if (state.root) return state.root;
    const root = document.createElement("div");
    root.className = "glg-layer glt-layer";
    root.hidden = true;
    root.innerHTML = `
      <button class="glg-backdrop" type="button" data-action="close" tabindex="-1" aria-hidden="true"></button>
      <section class="glg-panel glt-panel" role="dialog" aria-modal="true" aria-labelledby="gltTitle">
        <header class="glg-header glt-head">
          <button class="glt-icon" type="button" data-action="back" aria-label="">‹</button>
          <div class="glt-head-text"><h2 id="gltTitle"></h2><p class="glt-status" aria-live="polite"></p></div>
          <button class="glg-close" type="button" data-action="close"><span aria-hidden="true">×</span></button>
        </header>
        <div class="glg-body glt-body"></div>
        <p class="glt-toast" role="status" hidden></p>
      </section>`;
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
    document.body.append(root);
    state.root = root;
    return root;
  }

  function open({ room, friend } = {}) {
    if (!ROOM.test(String(room || "")) || !friend?.user_id) return false;
    const root = mount();
    if (state.room !== room) {
      leave();
      Object.assign(state, { room, friend: { id: friend.user_id, name: friend.name || "" }, match: null, partner: false });
      join();
    }
    state.lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("glg-open", "glt-active");
    requestAnimationFrame(() => root.classList.add("is-open"));
    render();
    root.querySelector("[data-action=close]")?.focus({ preventScroll: true });
    return true;
  }

  function close() {
    const root = state.root;
    if (!root || root.hidden) return;
    if (state.match) send("exit", {});
    stopGame();
    root.classList.remove("is-open");
    document.body.classList.remove("glg-open", "glt-active");
    setTimeout(() => { if (!root.classList.contains("is-open")) root.hidden = true; }, 320);
    leave();
    state.room = "";
    state.lastFocus?.focus?.({ preventScroll: true });
    dispatchEvent(new CustomEvent("glowletter-table-closed"));
  }

  function onClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || !state.root.contains(button)) return;
    const action = button.dataset.action;
    if (action === "close") close();
    else if (action === "back") { if (state.match) { send("exit", {}); stopGame(); render(); } else close(); }
    else if (action === "pick") start(button.dataset.game);
    else if (action === "again" && state.match) start(state.match.game);
    else if (action === "other") { send("exit", {}); stopGame(); render(); }
    else if (action === "paywall") app()?.openPaywall?.();
  }

  function renderStatus() {
    const status = state.root?.querySelector(".glt-status");
    if (!status) return;
    const name = state.friend?.name || "";
    status.textContent = !state.online ? tableText("offline") : state.partner ? tableText("here", { name }) : tableText("waiting", { name });
    status.classList.toggle("is-here", state.partner && state.online);
  }

  function render() {
    const root = state.root;
    if (!root) return;
    const game = state.match ? GAMES.get(state.match.game) : null;
    root.querySelector("#gltTitle").textContent = game ? gameText(game, "title") : tableText("title");
    root.querySelector("[data-action=back]").setAttribute("aria-label", game ? tableText("back") : tableText("close"));
    root.querySelector("[data-action=close]").setAttribute("aria-label", tableText("close"));
    renderStatus();
    if (game) return;
    const body = root.querySelector(".glt-body");
    const games = [...GAMES.values()].sort((left, right) => (left.order || 99) - (right.order || 99));
    body.innerHTML = `
      <h3 class="glt-pick-title">${escapeHtml(tableText("pick"))}</h3>
      <div class="glt-games">
        ${games.map(item => `
          <button class="glt-game" type="button" data-action="pick" data-game="${escapeHtml(item.id)}">
            <span class="glt-game-icon" aria-hidden="true">${escapeHtml(item.icon || "🎲")}</span>
            <span class="glt-game-text"><b>${escapeHtml(gameText(item, "title"))}</b><small>${escapeHtml(gameText(item, "short"))}</small></span>
          </button>`).join("")}
      </div>
      ${premium() ? "" : `<p class="glg-note glt-note">${escapeHtml(tableText("premiumNote"))}</p>`}`;
  }

  // ——— Партия ———

  function start(gameId) {
    if (!GAMES.has(gameId)) return;
    const first = Math.random() < 0.5 ? userId() : state.friend.id;
    const match = { game: gameId, id: crypto.randomUUID(), first, seed: Math.floor(Math.random() * 4294967295) };
    send("start", match);
    begin(match);
  }

  function begin(match, snapshot) {
    const game = GAMES.get(match.game);
    if (!game) return;
    stopGame();
    state.match = match;
    state.startedAt = Date.now();
    state.recorded = false;
    render();
    const body = state.root.querySelector(".glt-body");
    body.innerHTML = `<div class="glt-stage" data-game="${escapeHtml(game.id)}"></div><div class="glt-after" hidden></div>`;
    const api = Object.freeze({
      me: userId(),
      friend: Object.freeze({ ...state.friend }),
      first: match.first,
      iStart: match.first === userId(),
      seed: match.seed,
      rng: seeded(match.seed),
      lang: lang(),
      t: (key, values) => gameText(game, key, values),
      tt: (key, values) => tableText(key, values),
      send: (type, data) => send("g", { match: match.id, type: String(type), data }),
      partnerHere: () => state.partner,
      finish: result => finish(match, result),
      toast,
      escapeHtml
    });
    try {
      state.instance = game.mount(body.querySelector(".glt-stage"), api) || {};
      if (snapshot != null) state.instance.restore?.(snapshot);
    } catch (error) {
      console.warn("table game failed", error);
      state.instance = null;
    }
  }

  function stopGame() {
    try { state.instance?.destroy?.(); } catch {}
    state.instance = null;
    state.match = null;
  }

  async function finish(match, result) {
    if (state.match?.id !== match.id || state.recorded) return;
    state.recorded = true;
    const after = state.root.querySelector(".glt-after");
    const name = state.friend?.name || "";
    const title = { win: tableText("win"), loss: tableText("loss", { name }), draw: tableText("draw"), done: tableText("done") }[result] || tableText("done");
    if (after) {
      after.hidden = false;
      after.innerHTML = `
        <p class="glt-result glt-result-${escapeHtml(result)}">${escapeHtml(title)}</p>
        <p class="glt-points" aria-live="polite"></p>
        <div class="glt-after-actions">
          <button class="glg-primary" type="button" data-action="again">${escapeHtml(tableText("again"))}</button>
          <button class="glg-secondary" type="button" data-action="other">${escapeHtml(tableText("other"))}</button>
        </div>`;
    }
    if (result === "win" && !matchMedia("(prefers-reduced-motion: reduce)").matches) window.GlowLetterOnline?.burst?.("🏆", { small: true });
    try {
      const { data, error } = await client().rpc("glowletter_play_record", { p_friend: state.friend.id, p_game: match.game, p_room: match.id, p_result: result });
      if (error) throw error;
      const points = Number(data?.points || 0);
      const line = state.root.querySelector(".glt-points");
      if (points > 0 && line) line.textContent = tableText("points", { n: points });
      dispatchEvent(new CustomEvent("glowletter-points", { detail: { friend: state.friend.id, points } }));
    } catch (error) {
      if (!/premium_required/u.test(String(error?.message || ""))) console.warn("play record failed", error);
    }
  }

  function toast(text) {
    const node = state.root?.querySelector(".glt-toast");
    if (!node) return;
    node.textContent = text;
    node.hidden = false;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => { node.hidden = true; }, 2600);
  }

  // ——— Канал ———

  function join() {
    const db = client();
    if (!db?.channel) { state.online = false; return; }
    const channel = db.channel(`glowletter-table:${state.room}`, { config: { broadcast: { self: false }, presence: { key: userId() || crypto.randomUUID() } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const was = state.partner;
        state.partner = Object.keys(channel.presenceState() || {}).length > 1;
        // Друг подсел к столу посреди партии — отдаём ему партию целиком.
        if (state.partner && !was && state.match) {
          let snapshot = null;
          try { snapshot = state.instance?.snapshot?.() ?? null; } catch {}
          send("sync", { ...state.match, snapshot });
        }
        if (state.partner !== was) { try { state.instance?.onPartner?.(state.partner); } catch {} }
        renderStatus();
      })
      .on("broadcast", { event: "start" }, ({ payload }) => onStart(payload))
      .on("broadcast", { event: "sync" }, ({ payload }) => { if (!state.match && validMatch(payload)) begin(payload, payload.snapshot); })
      .on("broadcast", { event: "exit" }, () => {
        if (!state.match) return;
        toast(tableText("left", { name: state.friend?.name || "" }));
        stopGame();
        render();
      })
      .on("broadcast", { event: "g" }, ({ payload }) => {
        if (!payload || payload.match !== state.match?.id) return;
        try { state.instance?.onMessage?.(String(payload.type || ""), payload.data, state.friend.id); } catch (error) { console.warn("table message failed", error); }
      })
      .subscribe(status => {
        if (status === "SUBSCRIBED") { state.online = true; channel.track({ at: Date.now() }); }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { state.online = false; state.partner = false; }
        renderStatus();
      });
    state.channel = channel;
  }

  const validMatch = match => match && GAMES.has(match.game) && ROOM.test(String(match.id || ""))
    && [userId(), state.friend?.id].includes(match.first) && Number.isFinite(match.seed);

  function onStart(match) {
    if (!validMatch(match)) return;
    // Оба нажали одновременно — остаётся партия с меньшим номером, у обоих одна и та же.
    if (state.match && Date.now() - state.startedAt < 2000 && state.match.id < match.id) return;
    begin(match);
    const game = GAMES.get(match.game);
    toast(tableText("started", { name: state.friend?.name || "", game: gameText(game, "title") }));
  }

  // false — сообщение не ушло (нет канала или больше MAX_PAYLOAD): игра должна разбить его на части.
  function send(event, payload) {
    try {
      if (!state.channel || JSON.stringify(payload).length > MAX_PAYLOAD) return false;
      state.channel.send({ type: "broadcast", event, payload });
      return true;
    } catch { return false; }
  }

  function leave() {
    if (state.channel) { try { client()?.removeChannel?.(state.channel); } catch {} }
    state.channel = null;
    state.partner = false;
  }

  // Вернулись в приложение (делились ссылкой, отвечали в WhatsApp): если связь со столом
  // оборвалась, садимся за него заново — партия вернётся снимком от друга.
  function checkConnection() {
    if (document.visibilityState !== "visible" || !state.room || !state.root || state.root.hidden) return;
    const room = state.room;
    setTimeout(() => {
      if (state.room !== room || !state.root || state.root.hidden || state.channel?.state === "joined") return;
      leave();
      join();
      renderStatus();
    }, 2500);
  }
  document.addEventListener("visibilitychange", checkConnection);
  addEventListener("online", checkConnection);

  window.GlowLetterTable = Object.freeze({
    register,
    open,
    close,
    isOpen: () => Boolean(state.root && !state.root.hidden),
    room: () => state.room,
    text: (key, values) => tableText(key, values),
    games: () => [...GAMES.keys()]
  });
})();
