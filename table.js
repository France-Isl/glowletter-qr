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

  За столом до четырёх человек (MAX_PLAYERS); пятый видит «Стол заполнен».
  open({ room, friend }) — как раньше; open({ room, players: [{ user_id, name }, …] }) — сразу
  несколько человек (например, из группового звонка). Игра объявляет, сколько в неё играют:
  players: 4 (по умолчанию 2); watch: false — если со стороны смотреть нечего (морской бой);
  record: false — итог не отправляется на сервер (групповые игры: glowletter_play_results
  знает только парные). Кто сидит за столом, но в партию не попал, — зритель: api.spectator.
  Ещё в api: players — участники партии [{ id, name }] (первый в списке ходит первым),
  present() — id участников, которые сейчас за столом, name(id). Экземпляр игры может
  принимать onPlayers(ids) — участники за столом, при каждом изменении (onPartner остаётся);
  onMessage(type, data, from) получает id отправителя.
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
      yourTurn: "Ваш ход", friendTurn: "Ходит {name}", started: "{name} выбирает игру: {game}", left: "{name} выходит из игры",
      premiumNote: "Начинать игры можно с полным доступом. Если у друга он есть — играть можно вместе бесплатно.",
      offline: "Нет связи со столом. Проверьте интернет.", score: "Счёт: {me} : {friend}",
      full: "Стол заполнен", fullNote: "За столом уже четыре человека. Загляните чуть позже.", hereMany: "За столом: {names}",
      inviteMore: "Позвать ещё", inviteTitle: "Кого позвать к столу?", inviteNone: "Сейчас больше некого позвать",
      watching: "Вы смотрите партию", watchNote: "Сейчас играют: {names}. Следующую партию можно начать вместе.",
      twoOnly: "Эта игра для двоих — остальные смотрят.", players: "Игроков: {n}", you: "вы"
    },
    en: {
      title: "Game table", pick: "What shall we play?", waiting: "Waiting for {name} to join…", here: "{name} is at the table",
      away: "{name} isn’t at the table yet", invite: "Invite to the table", invited: "Invitation sent", close: "Leave the table",
      back: "Choose a game", again: "Play again", other: "Another game", points: "+{n} points for you two",
      win: "You win!", loss: "{name} wins this time", draw: "It’s a draw", done: "Done! Great game",
      yourTurn: "Your turn", friendTurn: "{name}’s turn", started: "{name} picked a game: {game}", left: "{name} left the game",
      premiumNote: "Starting games is part of full access. If your friend has it, you can play together for free.",
      offline: "Can’t reach the table. Check your connection.", score: "Score: {me} : {friend}",
      full: "The table is full", fullNote: "Four people are already at the table. Try again a little later.", hereMany: "At the table: {names}",
      inviteMore: "Invite someone", inviteTitle: "Who should join the table?", inviteNone: "Nobody else to invite right now",
      watching: "You’re watching this game", watchNote: "Now playing: {names}. You can all start the next game together.",
      twoOnly: "This game is for two — everyone else watches.", players: "Players: {n}", you: "you"
    },
    fr: {
      title: "Table de jeu", pick: "On joue à quoi ?", waiting: "On attend que {name} arrive…", here: "{name} est à la table",
      away: "{name} n’est pas encore à la table", invite: "Inviter à la table", invited: "Invitation envoyée", close: "Quitter la table",
      back: "Choisir un jeu", again: "Rejouer", other: "Un autre jeu", points: "+{n} points pour vous deux",
      win: "Victoire !", loss: "Cette fois, {name} gagne", draw: "Égalité", done: "Bravo ! Belle partie",
      yourTurn: "À vous de jouer", friendTurn: "Au tour de {name}", started: "{name} a choisi un jeu : {game}", left: "{name} a quitté la partie",
      premiumNote: "Lancer des jeux fait partie de l’accès complet. Si votre ami l’a, vous jouez ensemble gratuitement.",
      offline: "Impossible de joindre la table. Vérifiez la connexion.", score: "Score : {me} : {friend}",
      full: "La table est complète", fullNote: "Quatre personnes sont déjà à la table. Revenez un peu plus tard.", hereMany: "À la table : {names}",
      inviteMore: "Inviter quelqu’un", inviteTitle: "Qui inviter à la table ?", inviteNone: "Personne d’autre à inviter pour l’instant",
      watching: "Vous regardez la partie", watchNote: "En jeu : {names}. La prochaine partie peut se lancer tous ensemble.",
      twoOnly: "Ce jeu se joue à deux — les autres regardent.", players: "Joueurs : {n}", you: "vous"
    }
  };

  const GAMES = new Map();
  const ROOM = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
  const MAX_PAYLOAD = 8000;
  const MAX_PLAYERS = 4;
  const ID = /^[\w-]{1,64}$/u;

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const userId = () => cloud()?.getState?.().userId || "";
  const premium = () => Boolean(app()?.getState?.().premium);
  const cleanName = value => String(value ?? "").replace(/\s+/gu, " ").trim().slice(0, 40);
  const myName = () => cleanName(window.GlowLetterFriends?.myName?.() || app()?.getState?.().senderName || "");
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
    match: null, instance: null, startedAt: 0, recorded: false, lastFocus: null, toastTimer: 0,
    names: new Map(), seated: [], full: false, joinedAt: 0, inviting: false, quit: new Set(), joinSeq: 0
  };

  // ——— Кто за столом ———

  const nameOf = id => (id === userId() ? myName() : state.names.get(id) || (id === state.friend?.id ? state.friend.name : "")) || "";
  const others = () => state.seated.filter(id => id !== userId());
  const listNames = ids => ids.map(nameOf).filter(Boolean).join(", ");
  const maxOf = game => Math.max(2, Math.min(MAX_PLAYERS, Number(game?.players) || 2));
  const rosterOf = match => (Array.isArray(match?.players) ? match.players : []);
  const iPlay = match => rosterOf(match).includes(userId());
  const presentOf = match => rosterOf(match).filter(id => id === userId() || (state.seated.includes(id) && !state.quit.has(id)));

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

  function open({ room, friend, players } = {}) {
    const me = userId();
    const list = (Array.isArray(players) ? players : []).filter(item => item?.user_id && ID.test(String(item.user_id)));
    const main = friend?.user_id && ID.test(String(friend.user_id)) ? friend : list.find(item => item.user_id !== me);
    if (!ROOM.test(String(room || "")) || !main?.user_id) return false;
    const root = mount();
    for (const item of [...list, main]) if (item.user_id !== me && cleanName(item.name)) state.names.set(item.user_id, cleanName(item.name));
    if (state.room !== room) {
      leave();
      Object.assign(state, { room, friend: { id: main.user_id, name: cleanName(main.name) }, match: null, partner: false, seated: [], full: false, inviting: false });
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
    else if (action === "invite-more") { state.inviting = !state.inviting; render(); }
    else if (action === "invite-friend") inviteFriend(button.dataset.id);
  }

  function renderStatus() {
    const status = state.root?.querySelector(".glt-status");
    if (!status) return;
    const name = state.friend?.name || "";
    const here = others();
    status.textContent = !state.online ? tableText("offline")
      : state.full ? tableText("full")
      : state.match && !iPlay(state.match) ? tableText("watching")
      : here.length > 1 ? tableText("hereMany", { names: listNames(here) })
      : here.length ? tableText("here", { name: nameOf(here[0]) || name })
      : tableText("waiting", { name });
    status.classList.toggle("is-here", state.partner && state.online && !state.full);
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
    if (state.full) {
      body.innerHTML = `
        <div class="glt-full">
          <p class="glt-full-icon" aria-hidden="true">🪑</p>
          <h3>${escapeHtml(tableText("full"))}</h3>
          <p>${escapeHtml(tableText("fullNote"))}</p>
        </div>`;
      return;
    }
    const games = [...GAMES.values()].sort((left, right) => (left.order || 99) - (right.order || 99));
    const count = Math.max(2, state.seated.length);
    body.innerHTML = `
      <h3 class="glt-pick-title">${escapeHtml(tableText("pick"))}</h3>
      ${seatsHtml()}
      <div class="glt-games">
        ${games.map(item => {
          const max = maxOf(item);
          const tight = count > max;
          const range = max > 2 ? `2–${max}` : "2";
          const seats = tableText("players", { n: range });
          return `
          <button class="glt-game${tight ? " is-tight" : ""}" type="button" data-action="pick" data-game="${escapeHtml(item.id)}">
            <span class="glt-game-icon" aria-hidden="true">${escapeHtml(item.icon || "🎲")}</span>
            <span class="glt-game-text"><b>${escapeHtml(gameText(item, "title"))}</b><small>${escapeHtml(gameText(item, "short"))}</small>
              <span class="glt-game-seats"><span aria-hidden="true">👥 ${range}</span><span class="glt-sr">${escapeHtml(seats)}${tight ? `. ${escapeHtml(tableText("twoOnly"))}` : ""}</span></span></span>
          </button>`;
        }).join("")}
      </div>
      ${premium() ? "" : `<p class="glg-note glt-note">${escapeHtml(tableText("premiumNote"))}</p>`}`;
  }

  // Кто за столом (со мной) и «Позвать ещё», пока есть свободные места.
  function seatsHtml() {
    const me = userId();
    const ids = state.seated.includes(me) ? state.seated : [me, ...state.seated];
    const friends = window.GlowLetterFriends;
    const canInvite = Boolean(state.room) && ids.length < MAX_PLAYERS && typeof friends?.friends === "function" && typeof friends?.sendPlayInvite === "function";
    const candidates = canInvite && state.inviting ? friends.friends().filter(row => row?.user_id && !ids.includes(row.user_id)).slice(0, 12) : [];
    return `
      <div class="glt-seats">
        <ul class="glt-seat-list">
          ${ids.map(id => `<li class="glt-seat${id === me ? " is-me" : ""}"><span class="glt-seat-dot" aria-hidden="true">${escapeHtml([...(nameOf(id) || "?")][0].toUpperCase())}</span><span>${escapeHtml(nameOf(id) || "…")}${id === me ? ` <small>(${escapeHtml(tableText("you"))})</small>` : ""}</span></li>`).join("")}
        </ul>
        ${canInvite ? `<button class="glg-secondary glt-invite-more" type="button" data-action="invite-more" aria-expanded="${state.inviting}">＋ ${escapeHtml(tableText("inviteMore"))}</button>` : ""}
      </div>
      ${canInvite && state.inviting ? `
        <div class="glt-invite-list" role="group" aria-label="${escapeHtml(tableText("inviteTitle"))}">
          <p class="glt-invite-title">${escapeHtml(tableText("inviteTitle"))}</p>
          ${candidates.length ? candidates.map(row => `<button class="glt-invite-friend${row.online ? " is-online" : ""}" type="button" data-action="invite-friend" data-id="${escapeHtml(row.user_id)}">${escapeHtml(cleanName(row.name) || "…")}</button>`).join("") : `<p class="glg-note">${escapeHtml(tableText("inviteNone"))}</p>`}
        </div>` : ""}`;
  }

  async function inviteFriend(id) {
    const friends = window.GlowLetterFriends;
    if (!id || !state.room || typeof friends?.sendPlayInvite !== "function") return;
    const row = friends.friends?.().find(item => item.user_id === id);
    if (row?.name) state.names.set(id, cleanName(row.name));
    state.inviting = false;
    try {
      await friends.sendPlayInvite(id, state.room);
      toast(tableText("invited"));
    } catch (error) {
      console.warn("table invite failed", error);
      toast(tableText("offline"));
    }
    if (!state.match) render();
  }

  // ——— Партия ———

  // Участники партии: я и те, кто сейчас за столом (в игре для двоих — я и друг, если он здесь).
  // Первым в списке стоит тот, кто ходит первым.
  function pickRoster(game) {
    const me = userId();
    const here = others();
    const ids = maxOf(game) <= 2
      ? [me, here.includes(state.friend.id) ? state.friend.id : here[0] || state.friend.id]
      : [me, ...(here.length ? here : [state.friend.id])].slice(0, maxOf(game));
    const unique = [...new Set(ids.filter(Boolean))];
    const first = unique[Math.floor(Math.random() * unique.length)];
    return [first, ...unique.filter(id => id !== first)];
  }

  function start(gameId) {
    const game = GAMES.get(gameId);
    if (!game || state.full) return;
    state.inviting = false;
    const players = pickRoster(game);
    const names = Object.fromEntries(players.map(id => [id, nameOf(id)]));
    const match = { game: gameId, id: crypto.randomUUID(), first: players[0], seed: Math.floor(Math.random() * 4294967295), players, names };
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
    state.quit = new Set();
    render();
    const body = state.root.querySelector(".glt-body");
    body.innerHTML = `<div class="glt-stage" data-game="${escapeHtml(game.id)}"></div><div class="glt-after" hidden></div>`;
    const me = userId();
    const roster = rosterOf(match);
    for (const [id, name] of Object.entries(match.names || {})) if (id !== me && !state.names.has(id) && cleanName(name)) state.names.set(id, cleanName(name));
    const spectator = !roster.includes(me);
    const players = Object.freeze(roster.map(id => Object.freeze({ id, name: nameOf(id) })));
    const opponent = players.find(item => item.id !== me && item.id === state.friend.id) || players.find(item => item.id !== me) || { id: state.friend.id, name: state.friend.name };
    const stage = body.querySelector(".glt-stage");
    if (spectator && game.watch === false) {
      // Смотреть нечего (у каждого свой секретный флот) — просто показываем, кто играет.
      state.instance = {};
      stage.innerHTML = `
        <div class="glt-watch">
          <p class="glt-full-icon" aria-hidden="true">${escapeHtml(game.icon || "🎲")}</p>
          <h3>${escapeHtml(tableText("watching"))}</h3>
          <p>${escapeHtml(tableText("watchNote", { names: listNames(roster) }))}</p>
          <button class="glg-secondary" type="button" data-action="other">${escapeHtml(tableText("back"))}</button>
        </div>`;
      return;
    }
    const api = Object.freeze({
      me,
      friend: Object.freeze({ id: opponent.id, name: opponent.name }),
      players,
      spectator,
      first: match.first,
      iStart: match.first === me,
      seed: match.seed,
      rng: seeded(match.seed),
      lang: lang(),
      t: (key, values) => gameText(game, key, values),
      tt: (key, values) => tableText(key, values),
      name: id => nameOf(id),
      present: () => presentOf(match),
      send: (type, data) => send("g", { match: match.id, type: String(type), data, from: me }),
      partnerHere: () => presentOf(match).some(id => id !== me),
      finish: result => finish(match, result),
      toast,
      escapeHtml
    });
    try {
      state.instance = game.mount(stage, api) || {};
      if (snapshot != null) state.instance.restore?.(snapshot);
      state.instance.onPlayers?.(presentOf(match));
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
    const me = userId();
    const game = GAMES.get(match.game);
    const spectator = !iPlay(match);
    const roster = rosterOf(match);
    const rival = roster.includes(state.friend.id) && state.friend.id !== me ? state.friend.id : roster.find(id => id !== me);
    const name = nameOf(rival) || state.friend?.name || "";
    if (spectator) result = "done";
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
    // Зрители и групповые игры ничего не записывают: glowletter_play_record знает только
    // парные игры, по одной записи на партию от каждого игрока.
    if (spectator || game?.record === false || !rival) return;
    try {
      const { data, error } = await client().rpc("glowletter_play_record", { p_friend: rival, p_game: match.game, p_room: match.id, p_result: result });
      if (error) throw error;
      const points = Number(data?.points || 0);
      const line = state.root.querySelector(".glt-points");
      if (points > 0 && line) line.textContent = tableText("points", { n: points });
      dispatchEvent(new CustomEvent("glowletter-points", { detail: { friend: rival, points } }));
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

  // Сервер пускает за стол только тех, кого позвали (или кто начал игру с полным доступом).
  async function join() {
    const db = client();
    const room = state.room;
    const seq = ++state.joinSeq;
    if (!db?.channel || !cloud()?.openRoom) { state.online = false; return; }
    let channel;
    try {
      channel = await cloud().openRoom(`glowletter-table:${room}`, room, "play", { broadcast: { self: false }, presence: { key: userId() || crypto.randomUUID() } });
    } catch (error) {
      if (state.room !== room || seq !== state.joinSeq) return;
      state.online = false;
      renderStatus();
      if (/premium_required/u.test(String(error?.message || ""))) app()?.openPaywall?.();
      return;
    }
    if (state.room !== room || seq !== state.joinSeq) { try { db.removeChannel?.(channel); } catch {} return; }
    if (!state.joinedAt) state.joinedAt = Date.now();
    channel
      .on("presence", { event: "sync" }, () => onPresence(channel))
      .on("broadcast", { event: "start" }, ({ payload }) => { if (!state.full) onStart(payload); })
      .on("broadcast", { event: "sync" }, ({ payload }) => { if (!state.full && !state.match && validMatch(payload)) begin(normalMatch(payload), payload.snapshot); })
      .on("broadcast", { event: "exit" }, ({ payload }) => onExit(payload))
      .on("broadcast", { event: "g" }, ({ payload }) => {
        if (!payload || state.full || payload.match !== state.match?.id) return;
        const roster = rosterOf(state.match);
        const from = typeof payload.from === "string" && (roster.includes(payload.from) || state.seated.includes(payload.from)) ? payload.from : state.friend.id;
        try { state.instance?.onMessage?.(String(payload.type || ""), payload.data, from); } catch (error) { console.warn("table message failed", error); }
      })
      .subscribe(status => {
        if (status === "SUBSCRIBED") { state.online = true; channel.track({ at: state.joinedAt, name: myName() }); }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { state.online = false; state.partner = false; }
        renderStatus();
      });
    state.channel = channel;
  }

  // Кто за столом: первые четыре по времени прихода; пятый видит «Стол заполнен».
  function onPresence(channel) {
    const me = userId();
    const raw = channel.presenceState() || {};
    const list = Object.entries(raw).map(([id, metas]) => {
      const meta = (Array.isArray(metas) ? metas : []).reduce((best, item) => (best && Number(best.at) <= Number(item?.at) ? best : item), null) || {};
      return { id, at: Number(meta.at) || 0, name: cleanName(meta.name) };
    }).sort((left, right) => left.at - right.at || (left.id < right.id ? -1 : 1));
    for (const item of list) if (item.name && item.id !== me) state.names.set(item.id, item.name);
    for (const item of list) if (item.id !== me) window.GlowLetterRanking?.announceAdmin?.(item.id, item.name, state.room);
    const before = state.seated;
    const wasPartner = state.partner;
    const wasFull = state.full;
    state.seated = list.slice(0, MAX_PLAYERS).map(item => item.id);
    state.full = Boolean(me) && list.some(item => item.id === me) && !state.seated.includes(me);
    if (state.full && state.match) stopGame();
    state.partner = !state.full && others().length > 0;
    // Кто-то подсел к столу посреди партии — отдаём ему партию целиком.
    const newcomer = state.seated.some(id => id !== me && !before.includes(id));
    if (newcomer && state.match && !state.full) {
      let snapshot = null;
      try { snapshot = state.instance?.snapshot?.() ?? null; } catch {}
      send("sync", { ...state.match, snapshot });
    }
    if (state.partner !== wasPartner) { try { state.instance?.onPartner?.(state.partner); } catch {} }
    if (state.match) { try { state.instance?.onPlayers?.(presentOf(state.match)); } catch {} }
    if (!state.match && (String(before) !== String(state.seated) || wasFull !== state.full)) render(); else renderStatus();
  }

  // Партия от прежней версии приложения (без списка игроков) — это двое: я и друг.
  function normalMatch(payload) {
    const { snapshot, ...match } = payload;
    if (Array.isArray(match.players)) return match;
    const pair = [userId(), state.friend?.id].filter(Boolean);
    return { ...match, players: [match.first, ...pair.filter(id => id !== match.first)] };
  }

  function validMatch(match) {
    if (!match || !GAMES.has(match.game) || !ROOM.test(String(match.id || "")) || !Number.isFinite(match.seed)) return false;
    if (match.names != null && (typeof match.names !== "object" || Object.keys(match.names).length > MAX_PLAYERS)) return false;
    if (match.players == null) return [userId(), state.friend?.id].includes(match.first);
    const list = match.players;
    return Array.isArray(list) && list.length >= 2 && list.length <= MAX_PLAYERS && new Set(list).size === list.length
      && list.every(id => typeof id === "string" && ID.test(id)) && list[0] === match.first;
  }

  function onStart(payload) {
    if (!validMatch(payload)) return;
    const match = normalMatch(payload);
    // Нажали одновременно — остаётся партия с меньшим номером, у всех одна и та же.
    if (state.match && Date.now() - state.startedAt < 2000 && state.match.id < match.id) return;
    begin(match);
    const game = GAMES.get(match.game);
    const starter = typeof payload.from === "string" ? payload.from : state.friend?.id;
    toast(tableText(iPlay(match) ? "started" : "watching", { name: nameOf(starter), game: gameText(game, "title") }));
  }

  // Ушёл участник партии: вдвоём партия кончается; втроём-вчетвером игра идёт дальше,
  // пока за столом остаются хотя бы двое. Уход зрителя ничего не меняет.
  function onExit(payload) {
    const match = state.match;
    if (!match) return;
    const roster = rosterOf(match);
    const from = typeof payload?.from === "string" ? payload.from : state.friend?.id;
    if (!roster.includes(from)) return;
    state.quit.add(from);
    toast(tableText("left", { name: nameOf(from) }));
    if (roster.length > 2 && presentOf(match).length >= 2 && iPlay(match)) {
      try { state.instance?.onPlayers?.(presentOf(match)); } catch {}
      return;
    }
    stopGame();
    render();
  }

  // false — сообщение не ушло (нет канала или больше MAX_PAYLOAD): игра должна разбить его на части.
  function send(event, payload) {
    try {
      if (!state.channel || JSON.stringify(payload).length > MAX_PAYLOAD) return false;
      state.channel.send({ type: "broadcast", event, payload: event === "exit" || event === "start" ? { ...payload, from: userId() } : payload });
      return true;
    } catch { return false; }
  }

  function leave() {
    state.joinSeq++;
    if (state.channel) { try { client()?.removeChannel?.(state.channel); } catch {} }
    state.channel = null;
    state.partner = false;
    state.seated = [];
    state.full = false;
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
    games: () => [...GAMES.keys()],
    players: () => state.seated.map(id => ({ user_id: id, name: nameOf(id) })),
    maxPlayers: MAX_PLAYERS
  });
})();
