/*
  «Дурак» (01.11): подкидной и переводной, 24 или 36 карт, до четырёх игроков, боты, ставки в долларах.
  Вся партия живёт на сервере (supabase/functions/durak): сюда приходит только свой вид стола —
  своя рука, число карт у соперников, стол, козырь. Канал glowletter-durak:<стол> сообщает лишь
  номер версии, после чего клиент спрашивает свежий вид.
  Колода и рубашки — durak-cards.js, правила для подсветки ходов — durak-engine.js.
*/
(() => {
  "use strict";
  if (window.GlowLetterDurak) return;

  const CONFIG = window.NUR_APP_CONFIG || {};
  const FUNCTION_URL = `${CONFIG.supabaseUrl}/functions/v1/durak`;
  const STAKES = [0, 100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
  const EMOTES = { hi: "👋", gg: "🤝", wow: "😮", think: "🤔", lucky: "🍀", oops: "🙈", laugh: "😄", clap: "👏" };
  const SETUP_KEY = "glowletterDurakSetup";
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;

  const TEXT = {
    ru: {
      title: "Дурак", lead: "Карты в русском стиле, до четырёх игроков, ставки в долларах",
      classic: "Подкидной", transfer: "Переводной", mode: "Игра", deck: "Колода", cards: "{n} карт", players: "Игроки", stake: "Ставка", noStake: "Без ставки",
      playBots: "Играть с ботами", playFriends: "Стол для друзей", resume: "Вернуться к столу", myTables: "Мои столы",
      signIn: "Войдите в аккаунт, чтобы играть", balance: "Баланс", dollars: "{n} $", daily: "Награда дня", claim: "Забрать", dailyGot: "+{n} $ — награда дня {d} из 7",
      lobby: "Стол для друзей", waiting: "Ждём игроков…", invite: "Позвать", invited: "Позвали", start: "Начать игру", fillBots: "Пустые места займут боты", noFriends: "Добавьте друзей в «Друзьях», чтобы позвать их за стол",
      hostStarts: "Игру начнёт хозяин стола", seatFree: "Свободно", bot: "Бот", you: "Вы", leave: "Выйти", startedAlready: "Игра уже началась",
      yourTurn: "Ваш ход", defend: "Отбивайтесь", attackOrPass: "Подкиньте или «Бито»", takingAdd: "Соперник берёт — подкиньте или «Пас»", waitTurn: "Ход соперника",
      take: "Беру", pass: "Бито", passTake: "Пас", transferTo: "Перевести", hint: "Подсказка", hints: "Подсказки: {n}",
      attacks: "Ходит", defends: "Отбивается", takes: "Берёт", passed: "Пас", out: "Вышел", deckLeft: "В колоде: {n}", trump: "Козырь", discard: "Бито",
      win: "Победа!", escaped: "Вы вышли без проигрыша", fool: "Вы — дурак", draw: "Ничья", foolIs: "Дурак — {name}", again: "Ещё партию", toMenu: "В меню",
      net: "{sign}{n} $", insured: "Страховка вернула половину ставки", boosted: "×2 к выигрышу",
      notEnough: "Не хватает долларов для ставки", notEnoughWho: "Не хватает долларов: {names}", buyDollars: "Купить доллары",
      chat: "Сообщение…", send: "Отправить", forbidden: "Такое сообщение нельзя отправить", emotes: "Эмоции",
      error: "Не получилось. Проверьте интернет", full: "Стол заполнен", gone: "Стол не найден", stale: "Стол обновился",
      ranking: "Рейтинг недели", rankingNote: "Выигрыш у живых игроков за неделю", empty: "Пока пусто — сыграйте первым!", stats: "Партий {g} · побед {w} · дурак {f}",
      rank0: "Новичок", rank1: "Любитель", rank2: "Знаток", rank3: "Мастер", rank4: "Гроссмейстер", rank5: "Легенда",
      emo_hi: "Привет!", emo_gg: "Хорошая игра", emo_wow: "Ого!", emo_think: "Думаю…", emo_lucky: "Повезло!", emo_oops: "Упс", emo_laugh: "Ха-ха", emo_clap: "Браво",
      bot_b1: "Мишка Тёпа", bot_b2: "Лиса Алиса", bot_b3: "Кот Баюн", noHints: "Подсказки закончились — купите в магазине", inviteSent: "Приглашение отправлено: {name}",
      rules: "Правила", rulesText: "Козырь бьёт любую масть. Отбивайте старшей картой той же масти или козырем. Подкидывать можно карты того же достоинства, что уже на столе. В переводном можно перевести ход картой того же достоинства. Кто остался с картами — дурак."
    },
    en: {
      title: "Durak", lead: "Russian-style cards, up to four players, dollar stakes",
      classic: "Classic", transfer: "Transfer", mode: "Game", deck: "Deck", cards: "{n} cards", players: "Players", stake: "Stake", noStake: "No stake",
      playBots: "Play with bots", playFriends: "Table for friends", resume: "Back to the table", myTables: "My tables",
      signIn: "Sign in to play", balance: "Balance", dollars: "${n}", daily: "Daily reward", claim: "Claim", dailyGot: "+${n} — daily reward {d} of 7",
      lobby: "Table for friends", waiting: "Waiting for players…", invite: "Invite", invited: "Invited", start: "Start the game", fillBots: "Bots will take empty seats", noFriends: "Add friends in Friends to invite them",
      hostStarts: "The host starts the game", seatFree: "Free", bot: "Bot", you: "You", leave: "Leave", startedAlready: "The game has already started",
      yourTurn: "Your move", defend: "Defend", attackOrPass: "Throw in or Done", takingAdd: "Opponent takes — throw in or Pass", waitTurn: "Opponent's move",
      take: "Take", pass: "Done", passTake: "Pass", transferTo: "Transfer", hint: "Hint", hints: "Hints: {n}",
      attacks: "Attacks", defends: "Defends", takes: "Takes", passed: "Pass", out: "Out", deckLeft: "Deck: {n}", trump: "Trump", discard: "Discard",
      win: "Victory!", escaped: "You got out safely", fool: "You are the fool", draw: "Draw", foolIs: "The fool is {name}", again: "Play again", toMenu: "Menu",
      net: "{sign}${n}", insured: "Insurance returned half the stake", boosted: "×2 winnings",
      notEnough: "Not enough dollars for this stake", notEnoughWho: "Not enough dollars: {names}", buyDollars: "Buy dollars",
      chat: "Message…", send: "Send", forbidden: "This message can't be sent", emotes: "Emotes",
      error: "Something went wrong. Check the connection", full: "The table is full", gone: "Table not found", stale: "The table changed",
      ranking: "Weekly ranking", rankingNote: "Winnings against real players this week", empty: "Empty for now — play first!", stats: "Games {g} · wins {w} · fool {f}",
      rank0: "Newcomer", rank1: "Amateur", rank2: "Expert", rank3: "Master", rank4: "Grandmaster", rank5: "Legend",
      emo_hi: "Hi!", emo_gg: "Good game", emo_wow: "Wow!", emo_think: "Thinking…", emo_lucky: "Lucky!", emo_oops: "Oops", emo_laugh: "Ha-ha", emo_clap: "Bravo",
      bot_b1: "Teddy Tyopa", bot_b2: "Alice the Fox", bot_b3: "Bayun the Cat", noHints: "No hints left — buy more in the shop", inviteSent: "Invitation sent: {name}",
      rules: "Rules", rulesText: "Trump beats any suit. Beat a card with a higher card of the same suit or with a trump. You may throw in cards of a rank already on the table. In Transfer you can pass the attack on with a card of the same rank. Whoever is left with cards is the fool."
    }
  };
  Object.entries(window.GLOWLETTER_DURAK_I18N || {}).forEach(([lang, values]) => { TEXT[lang] = { ...(TEXT[lang] || {}), ...values }; });

  const state = {
    root: null, view: "home", busy: false, game: null, wallet: null, mine: [], ranking: null,
    setup: loadSetup(), selected: null, channel: null, channelId: "", poll: 0, tickTimer: 0, clock: 0,
    shownSeq: -1, shownTable: [], invited: new Set(), chatOpen: false, hint: null, bubbles: {}, lastChat: 0, rulesOpen: false
  };

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const signedIn = () => Boolean(cloud()?.getState?.().signedIn);
  const language = () => String(app()?.getState?.().language || document.documentElement.lang || "ru").toLowerCase();
  const tr = (key, values = {}) => String(TEXT[language()]?.[key] ?? TEXT.en[key] ?? TEXT.ru[key] ?? key).replace(/\{(\w+)\}/g, (all, name) => values[name] ?? "");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const num = value => { try { return new Intl.NumberFormat(language() === "ind" ? "id" : language()).format(value || 0); } catch { return String(value || 0); } };
  const notify = (text, ms = 3600) => app()?.notify?.(text, ms);
  const cards = () => window.GlowDurakCards;
  const letters = () => ["ru", "uk"].includes(language()) ? "ru" : "latin";
  const haptic = pattern => { try { navigator.vibrate?.(pattern); } catch {} };

  function loadSetup() {
    try { const saved = JSON.parse(localStorage.getItem(SETUP_KEY) || "{}"); return { mode: saved.mode === "transfer" ? "transfer" : "classic", deck: saved.deck === 24 ? 24 : 36, seats: [2, 3, 4].includes(saved.seats) ? saved.seats : 2, stake: STAKES.includes(saved.stake) ? saved.stake : 0 }; }
    catch { return { mode: "classic", deck: 36, seats: 2, stake: 0 }; }
  }
  function saveSetup() { try { localStorage.setItem(SETUP_KEY, JSON.stringify(state.setup)); } catch {} }

  async function call(action, payload = {}) {
    const session = cloud()?.getSession?.();
    const token = session?.access_token;
    if (!token) throw Object.assign(new Error("authentication_required"), { code: "authentication_required" });
    const response = await fetch(FUNCTION_URL, {
      method: "POST", cache: "no-store", credentials: "omit",
      headers: { "Content-Type": "application/json", apikey: CONFIG.supabasePublishableKey || "", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.error || "error"), { code: data.error || "error", who: data.who || null });
    return data;
  }

  async function rpc(name, args = {}) {
    const db = client();
    if (!db) throw new Error("offline");
    const { data, error } = await db.rpc(name, args);
    if (error) throw error;
    return data;
  }

  function errorText(error) {
    const code = error?.code || error?.message;
    if (code === "not_enough_dollars") return error.who?.length ? tr("notEnoughWho", { names: error.who.join(", ") }) : tr("notEnough");
    if (code === "full") return tr("full");
    if (code === "not_found") return tr("gone");
    if (code === "started") return tr("startedAlready");
    if (code === "forbidden") return tr("forbidden");
    if (code === "no_hints") return tr("noHints");
    if (code === "authentication_required") return tr("signIn");
    return tr("error");
  }

  // ——— Корень и общий рендер ———
  function ensureRoot() {
    if (state.root) return state.root;
    const root = document.createElement("section");
    root.className = "dk-root";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", tr("title"));
    root.addEventListener("click", onClick);
    root.addEventListener("submit", onSubmit);
    root.addEventListener("keydown", event => { if (event.key === "Escape") { if (state.chatOpen || state.rulesOpen) { state.chatOpen = false; state.rulesOpen = false; render(); } else close(); } });
    document.body.append(root);
    state.root = root;
    return root;
  }

  async function open(view = "home") {
    ensureRoot();
    state.root.hidden = false;
    document.body.classList.add("dk-open");
    state.view = view;
    render();
    requestAnimationFrame(() => state.root.classList.add("is-open"));
    if (signedIn()) {
      refreshWallet();
      if (view === "home") call("mine").then(data => { state.mine = data.games || []; if (state.view === "home") render(); }).catch(() => {});
    }
  }

  function close() {
    if (!state.root) return;
    stopTable();
    state.root.classList.remove("is-open");
    document.body.classList.remove("dk-open");
    setTimeout(() => { if (state.root && !state.root.classList.contains("is-open")) state.root.hidden = true; }, 260);
  }

  async function refreshWallet() {
    try { state.wallet = await rpc("glowletter_wallet"); render(true); } catch {}
  }

  function render(soft = false) {
    if (!state.root || state.root.hidden) return;
    if (soft && state.view === "table") { renderTable(); return; }
    const cloth = state.wallet?.cloth || "cloth_green";
    state.root.dataset.cloth = cloth;
    state.root.dataset.view = state.view;
    const views = { home: renderHome, lobby: renderLobby, table: renderTableShell, ranking: renderRanking };
    state.root.innerHTML = (views[state.view] || renderHome)();
    if (state.view === "table") renderTable();
  }

  const coinIcon = `<svg class="dk-coin" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" fill="url(#dkCoinG)"/><defs><radialGradient id="dkCoinG" cx=".35" cy=".3"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#f2c96f"/><stop offset="1" stop-color="#a8741f"/></radialGradient></defs><path d="M12 17.2s-4.3-2.6-5.5-5.2c-.8-1.9.4-4.1 2.5-4.1 1.2 0 2.1.7 3 1.8.9-1.1 1.8-1.8 3-1.8 2.1 0 3.3 2.2 2.5 4.1-1.2 2.6-5.5 5.2-5.5 5.2Z" fill="#a3213a"/></svg>`;

  function walletBar() {
    const w = state.wallet;
    if (!w) return `<div class="dk-wallet" aria-hidden="true"></div>`;
    return `<button class="dk-wallet" type="button" data-act="shop" aria-label="${esc(tr("balance"))}">
      <span class="dk-money is-dollars"><b>$</b>${esc(num(w.dollars))}</span>
      <span class="dk-money is-coins">${coinIcon}${esc(num(w.coins))}</span>
    </button>`;
  }

  function topbar(title, back = "close") {
    return `<header class="dk-top">
      <button class="dk-round" type="button" data-act="${back}" aria-label="←"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <h2>${esc(title)}</h2>
      ${walletBar()}
    </header>`;
  }

  function cardImg(card, extra = "") {
    return `<img class="dk-face" src="${cards().face(card, letters())}" alt="" draggable="false"${extra}>`;
  }
  const backImg = (style = state.wallet?.card_back || "back_classic") => `<img class="dk-face" src="${cards().back(style)}" alt="" draggable="false">`;

  function rankTitle(stats = {}) {
    const wins = stats.wins || 0;
    const level = wins >= 500 ? 5 : wins >= 200 ? 4 : wins >= 80 ? 3 : wins >= 25 ? 2 : wins >= 5 ? 1 : 0;
    return tr(`rank${level}`);
  }

  function seg(name, options, current) {
    return `<div class="dk-seg" role="radiogroup">${options.map(([value, label]) => `<button type="button" role="radio" aria-checked="${value === current}" class="${value === current ? "is-on" : ""}" data-set="${name}" data-value="${value}">${esc(label)}</button>`).join("")}</div>`;
  }

  function renderHome() {
    const s = state.setup;
    const w = state.wallet;
    const daily = w && !w.claimed_today ? `<button class="dk-daily" type="button" data-act="daily"><span class="dk-daily-gift" aria-hidden="true">🎁</span><span><b>${esc(tr("daily"))}</b><small>+${esc(num(w.daily_next))} $${w.daily_coins ? ` · +${w.daily_coins}` : ""}</small></span><i>${esc(tr("claim"))}</i></button>` : "";
    const mine = state.mine.filter(game => game.status !== "closed").slice(0, 3).map(game => `<button class="dk-resume" type="button" data-act="resume" data-id="${esc(game.id)}"><span>${esc(tr(game.settings.mode))} · ${esc(tr("cards", { n: game.settings.deck }))}${game.settings.stake ? ` · ${esc(num(game.settings.stake))} $` : ""}</span><b>${esc(tr("resume"))} →</b></button>`).join("");
    const stats = w?.stats || {};
    return `${topbar(tr("title"))}
    <div class="dk-scroll">
      <div class="dk-hero" aria-hidden="true">
        <div class="dk-fan">${["14h", "13s", "12d", "11c", "14s"].map((card, i) => `<span class="dk-card dk-fan-card" style="--i:${i - 2}">${cardImg(card)}</span>`).join("")}</div>
      </div>
      <p class="dk-lead">${esc(tr("lead"))}</p>
      ${signedIn() ? "" : `<p class="dk-note">${esc(tr("signIn"))}</p>`}
      ${daily}
      ${mine ? `<section class="dk-panel"><h3>${esc(tr("myTables"))}</h3>${mine}</section>` : ""}
      <section class="dk-panel dk-setup">
        <label>${esc(tr("mode"))}</label>${seg("mode", [["classic", tr("classic")], ["transfer", tr("transfer")]], s.mode)}
        <label>${esc(tr("deck"))}</label>${seg("deck", [[24, tr("cards", { n: 24 })], [36, tr("cards", { n: 36 })]], s.deck)}
        <label>${esc(tr("players"))}</label>${seg("seats", [[2, "2"], [3, "3"], [4, "4"]], s.seats)}
        <label>${esc(tr("stake"))}</label>
        <div class="dk-stakes">${STAKES.map(value => `<button type="button" class="${value === s.stake ? "is-on" : ""}" data-set="stake" data-value="${value}" ${w && value > w.dollars ? "data-poor" : ""}>${value ? `${esc(num(value))} $` : esc(tr("noStake"))}</button>`).join("")}</div>
      </section>
      <div class="dk-actions">
        <button class="dk-primary" type="button" data-act="solo"${state.busy ? " disabled" : ""}>${esc(tr("playBots"))}</button>
        <button class="dk-secondary" type="button" data-act="lobby"${state.busy ? " disabled" : ""}>${esc(tr("playFriends"))}</button>
      </div>
      <div class="dk-links">
        <button type="button" data-act="ranking">🏆 ${esc(tr("ranking"))}</button>
        <button type="button" data-act="rules">📜 ${esc(tr("rules"))}</button>
      </div>
      ${stats.games ? `<p class="dk-stats"><b>${esc(rankTitle(stats))}</b> · ${esc(tr("stats", { g: num(stats.games), w: num(stats.wins), f: num(stats.fools) }))}</p>` : ""}
      ${state.rulesOpen ? `<section class="dk-panel dk-rules"><h3>${esc(tr("rules"))}</h3><p>${esc(tr("rulesText"))}</p></section>` : ""}
    </div>`;
  }

  function seatName(seat) {
    if (!seat) return tr("seatFree");
    if (seat.bot) return tr(`bot_${seat.botKey || "b1"}`);
    if (seat.me) return seat.name || tr("you");
    return seat.name || "—";
  }

  function avatar(seat, i) {
    const name = seatName(seat);
    const hue = [12, 220, 140, 280][i % 4];
    return `<span class="dk-ava" style="--h:${hue}" aria-hidden="true">${seat?.bot ? "🧸" : esc(name.slice(0, 1).toUpperCase())}</span>`;
  }

  function renderLobby() {
    const g = state.game;
    if (!g) return renderHome();
    const seats = Array.from({ length: g.settings.seats }, (_, i) => g.seats[i] || null);
    const friends = (window.GlowLetterFriends?.friends?.() || []).filter(f => !g.seats.some(s => s.id === f.user_id));
    return `${topbar(tr("lobby"), "leave")}
    <div class="dk-scroll">
      <p class="dk-lead">${esc(tr(g.settings.mode))} · ${esc(tr("cards", { n: g.settings.deck }))}${g.settings.stake ? ` · ${esc(tr("stake"))} ${esc(num(g.settings.stake))} $` : ""}</p>
      <section class="dk-panel dk-seats">${seats.map((seat, i) => `<div class="dk-seat${seat ? "" : " is-free"}">${avatar(seat, i)}<span>${esc(seatName(seat))}${seat?.me ? ` · ${esc(tr("you"))}` : ""}</span></div>`).join("")}</section>
      <p class="dk-note">${esc(g.seats.length < g.settings.seats ? tr("waiting") : "")} ${g.settings.bots ? esc(tr("fillBots")) : ""}</p>
      ${g.host ? `<section class="dk-panel"><h3>${esc(tr("invite"))}</h3>${friends.length ? friends.map(f => `<div class="dk-friend"><span>${f.online ? "🟢" : "⚪"} ${esc(f.name)}</span><button type="button" data-act="invite" data-id="${esc(f.user_id)}" data-name="${esc(f.name)}"${state.invited.has(f.user_id) ? " disabled" : ""}>${esc(state.invited.has(f.user_id) ? tr("invited") : tr("invite"))}</button></div>`).join("") : `<p class="dk-note">${esc(tr("noFriends"))}</p>`}</section>` : ""}
      <div class="dk-actions">${g.host ? `<button class="dk-primary" type="button" data-act="start"${state.busy || (!g.settings.bots && g.seats.length < 2) ? " disabled" : ""}>${esc(tr("start"))}</button>` : `<p class="dk-note">${esc(tr("hostStarts"))}</p>`}</div>
    </div>`;
  }

  async function renderRankingData() {
    try { state.ranking = await rpc("glowletter_durak_ranking"); } catch { state.ranking = []; }
    if (state.view === "ranking") render();
  }

  function renderRanking() {
    const rows = state.ranking;
    return `${topbar(tr("ranking"), "home")}
    <div class="dk-scroll">
      <p class="dk-lead">${esc(tr("rankingNote"))}</p>
      <section class="dk-panel dk-rank">${rows == null ? "<p class=\"dk-note\">…</p>" : rows.length ? rows.map((row, i) => `<div class="dk-rank-row${row.me ? " is-me" : ""}"><b>${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</b><span>${esc(row.name || "—")}</span><i>+${esc(num(row.won))} $</i></div>`).join("") : `<p class="dk-note">${esc(tr("empty"))}</p>`}</section>
    </div>`;
  }

  // ——— Стол ———
  function renderTableShell() {
    return `<div class="dk-table" data-table>
      <header class="dk-top is-table">
        <button class="dk-round" type="button" data-act="leave" aria-label="${esc(tr("leave"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="dk-top-info" data-info></div>
        ${walletBar()}
      </header>
      <div class="dk-opponents" data-opponents></div>
      <div class="dk-center">
        <div class="dk-deck" data-deck></div>
        <div class="dk-battle" data-battle></div>
        <div class="dk-discard" data-discard></div>
      </div>
      <div class="dk-status" data-status aria-live="polite"></div>
      <div class="dk-buttons" data-buttons></div>
      <div class="dk-hand" data-hand></div>
      <div class="dk-overlay" data-overlay></div>
    </div>`;
  }

  const suitName = { s: "♠", c: "♣", d: "♦", h: "♥" };
  const suitIcon = suit => `<svg class="dk-suit${cards().isRed(suit) ? " is-red" : ""}" viewBox="0 0 100 100" aria-hidden="true"><path d="${cards().SUIT[suit]}"/></svg>`;

  function relativeSeats(g) {
    const n = g.players.length, me = Math.max(0, g.me);
    return Array.from({ length: n - 1 }, (_, k) => (me + 1 + k) % n);
  }

  function seatStatus(g, i) {
    const p = g.players[i];
    if (p.out) return tr("out");
    if (g.phase !== "play") return "";
    if (i === g.defender) return g.taking ? tr("takes") : tr("defends");
    if (i === g.attacker) return tr("attacks");
    if (g.passed.includes(i)) return tr("passed");
    return "";
  }

  function renderTable() {
    const root = state.root;
    const view = state.game;
    if (!root || !view?.game) return;
    const g = view.game;
    const q = selector => root.querySelector(selector);
    if (!q("[data-table]")) { root.innerHTML = renderTableShell(); }
    const legal = g.legal || [];
    const myTurn = g.must.includes(g.me);
    const seats = view.seats;

    q("[data-info]").innerHTML = `<span class="dk-trump-chip">${esc(tr("trump"))} ${suitIcon(g.trump)}</span><span>${esc(tr(g.mode))}${view.settings.stake ? ` · ${esc(num(view.settings.stake))} $` : ""}</span>`;

    const opponents = relativeSeats(g);
    q("[data-opponents]").dataset.count = String(opponents.length);
    q("[data-opponents]").innerHTML = opponents.map(i => {
      const p = g.players[i], seat = seats[i];
      const shown = Math.min(p.count, 8);
      const active = g.must.includes(i) && g.phase === "play";
      const bubble = state.bubbles[i];
      return `<div class="dk-opp${active ? " is-active" : ""}${p.out ? " is-out" : ""}${g.durak === i && g.phase === "over" ? " is-fool" : ""}" data-seat="${i}">
        <div class="dk-opp-cards">${Array.from({ length: shown }, (_, k) => `<span class="dk-mini" style="--k:${k - (shown - 1) / 2}">${backImg(seat?.back)}</span>`).join("")}</div>
        <div class="dk-opp-id">${avatar(seat, i)}${active && view.deadline ? timerRing(view.deadline) : ""}<b>${esc(seatName(seat))}</b><small>${p.count} · ${esc(seatStatus(g, i))}</small></div>
        ${bubble && bubble.until > Date.now() ? `<div class="dk-bubble">${esc(bubble.text)}</div>` : ""}
      </div>`;
    }).join("");

    q("[data-deck]").innerHTML = g.deck > 0 || g.trumpCard ? `
      ${g.deck > 0 ? `<span class="dk-card dk-trump-card">${cardImg(g.trumpCard)}</span>` : `<span class="dk-trump-ghost">${suitIcon(g.trump)}</span>`}
      ${g.deck > 1 ? `<span class="dk-card dk-pile" style="--depth:${Math.min(6, Math.ceil(g.deck / 5))}">${backImg()}</span>` : ""}
      <b class="dk-count">${g.deck}</b>` : "";
    q("[data-discard]").innerHTML = g.discard ? `<span class="dk-card dk-discard-pile">${backImg()}</span><b class="dk-count">${esc(tr("discard"))}</b>` : "";

    // Стол: новые карты прилетают со стороны того, кто положил.
    const lastSeen = state.shownTable;
    const targets = state.selected ? legal.filter(a => a.card === state.selected && a.type === "defend").map(a => a.slot) : [];
    q("[data-battle]").innerHTML = g.table.map((pair, slot) => {
      const newA = !lastSeen[slot] || lastSeen[slot].a !== pair.a;
      const newD = pair.d && (!lastSeen[slot] || lastSeen[slot].d !== pair.d);
      return `<div class="dk-pair${targets.includes(slot) ? " is-target" : ""}" data-slot="${slot}">
        <span class="dk-card dk-attack${newA ? " is-new" : ""}" style="--r:${((slot * 37) % 9) - 4}deg">${cardImg(pair.a)}</span>
        ${pair.d ? `<span class="dk-card dk-defense${newD ? " is-new" : ""}" style="--r:${((slot * 53) % 11) + 4}deg">${cardImg(pair.d)}</span>` : ""}
      </div>`;
    }).join("");
    state.shownTable = g.table.map(pair => ({ ...pair }));

    let status = "";
    if (g.phase === "over") status = "";
    else if (myTurn) {
      if (g.me === g.defender) status = tr("defend");
      else if (!g.table.length) status = tr("yourTurn");
      else status = g.taking ? tr("takingAdd") : tr("attackOrPass");
    } else status = tr("waitTurn");
    q("[data-status]").innerHTML = `${myTurn && view.deadline ? timerRing(view.deadline, true) : ""}<span>${esc(status)}</span>${g.deck ? `<small>${esc(tr("deckLeft", { n: g.deck }))}</small>` : ""}`;
    q("[data-status]").classList.toggle("is-mine", myTurn);

    const canTake = legal.some(a => a.type === "take");
    const canPass = legal.some(a => a.type === "pass");
    const transfer = state.selected && legal.some(a => a.type === "transfer" && a.card === state.selected);
    const hints = state.wallet?.inventory?.hint || 0;
    const withBots = seats.some(s => s.bot);
    q("[data-buttons]").innerHTML = g.phase === "play" ? `
      ${canTake ? `<button class="dk-btn is-take" type="button" data-act="take">${esc(tr("take"))}</button>` : ""}
      ${canPass ? `<button class="dk-btn is-pass" type="button" data-act="pass">${esc(g.taking ? tr("passTake") : tr("pass"))}</button>` : ""}
      ${transfer ? `<button class="dk-btn is-transfer" type="button" data-act="transfer">${esc(tr("transferTo"))} →</button>` : ""}
      <span class="dk-btn-gap"></span>
      ${withBots && myTurn ? `<button class="dk-chip-btn" type="button" data-act="hint" title="${esc(tr("hints", { n: hints }))}">💡 ${hints}</button>` : ""}
      <button class="dk-chip-btn" type="button" data-act="chat" aria-label="${esc(tr("emotes"))}">💬</button>` : "";

    const hand = g.hand;
    const playable = new Set(legal.filter(a => a.card).map(a => a.card));
    const count = hand.length;
    const spread = Math.min(9, 60 / Math.max(1, count));
    q("[data-hand]").innerHTML = hand.map((card, k) => {
      const offset = k - (count - 1) / 2;
      const isHint = state.hint?.card === card;
      return `<button type="button" class="dk-card dk-hand-card${playable.has(card) && myTurn ? " is-playable" : ""}${state.selected === card ? " is-selected" : ""}${isHint ? " is-hint" : ""}" style="--o:${offset};--a:${(offset * spread).toFixed(2)}deg;--z:${k}" data-card="${esc(card)}" aria-label="${esc(cardLabel(card))}">${cardImg(card)}</button>`;
    }).join("");
    q("[data-hand]").style.setProperty("--n", String(count));

    q("[data-overlay]").innerHTML = g.phase === "over" ? resultOverlay(view) : state.chatOpen ? chatPanel(view) : "";
    state.shownSeq = g.seq;
  }

  function cardLabel(card) {
    const rank = parseInt(card, 10), suit = card.slice(-1);
    const names = letters() === "ru" ? { 11: "В", 12: "Д", 13: "К", 14: "Т" } : { 11: "J", 12: "Q", 13: "K", 14: "A" };
    return `${rank <= 10 ? rank : names[rank]}${suitName[suit]}`;
  }

  function timerRing(deadline, big = false) {
    const left = Math.max(0, deadline - Date.now());
    const total = 30000;
    return `<span class="dk-timer${big ? " is-big" : ""}" style="--t:${(left / 1000).toFixed(1)}s;--p:${(left / total).toFixed(3)}" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5"/></svg><i>${Math.ceil(left / 1000)}</i></span>`;
  }

  function resultOverlay(view) {
    const g = view.game;
    const mine = view.rewards?.[view.seats[g.me]?.id] || null;
    let title = tr("draw");
    if (g.durak >= 0) title = g.durak === g.me ? tr("fool") : g.order[0] === g.me ? tr("win") : tr("escaped");
    const fool = g.durak >= 0 ? seatName(view.seats[g.durak]) : "";
    const net = mine?.net ?? 0;
    const order = [...g.order.filter(i => i !== g.durak), ...(g.durak >= 0 ? [g.durak] : [])];
    return `<div class="dk-result${g.durak === g.me ? " is-fool" : g.durak < 0 ? " is-draw" : " is-win"}" role="dialog" aria-modal="true">
      <div class="dk-result-crest" aria-hidden="true">${g.durak === g.me ? "🎖️" : g.durak < 0 ? "🤝" : "🏆"}</div>
      <h3>${esc(title)}</h3>
      ${fool && g.durak !== g.me ? `<p>${esc(tr("foolIs", { name: fool }))}</p>` : ""}
      ${view.settings.stake ? `<p class="dk-net ${net >= 0 ? "is-plus" : "is-minus"}">${esc(tr("net", { sign: net > 0 ? "+" : net < 0 ? "−" : "", n: num(Math.abs(net)) }))}</p>` : ""}
      ${mine?.insured ? `<p class="dk-note">${esc(tr("insured"))}</p>` : ""}${mine?.boosted && net > 0 ? `<p class="dk-note">${esc(tr("boosted"))}</p>` : ""}
      <ol class="dk-places">${order.map(i => `<li class="${i === g.durak ? "is-fool" : ""}">${avatar(view.seats[i], i)}<span>${esc(seatName(view.seats[i]))}</span>${i === g.durak ? `<em class="dk-pogony" aria-hidden="true"><i></i><i></i></em>` : ""}</li>`).join("")}</ol>
      <div class="dk-actions"><button class="dk-primary" type="button" data-act="rematch">${esc(tr("again"))}</button><button class="dk-secondary" type="button" data-act="menu">${esc(tr("toMenu"))}</button></div>
    </div>`;
  }

  function chatPanel(view) {
    const lines = (view.chat || []).slice(-12).map(line => `<li><b>${esc(seatName(view.seats[line.seat]))}:</b> ${line.emote ? `${EMOTES[line.emote] || ""} ${esc(tr(`emo_${line.emote}`))}` : esc(line.text)}</li>`).join("");
    return `<div class="dk-chat" role="dialog" aria-label="${esc(tr("emotes"))}">
      <div class="dk-emotes">${Object.entries(EMOTES).map(([key, icon]) => `<button type="button" data-act="emote" data-emote="${key}"><span>${icon}</span><small>${esc(tr(`emo_${key}`))}</small></button>`).join("")}</div>
      <ul class="dk-chat-log">${lines}</ul>
      <form class="dk-chat-form" data-form="chat"><input name="text" maxlength="120" autocomplete="off" placeholder="${esc(tr("chat"))}"><button class="dk-primary" type="submit">${esc(tr("send"))}</button></form>
      <button class="dk-chat-close" type="button" data-act="chat" aria-label="×">×</button>
    </div>`;
  }

  // ——— Сеть: канал версии, опрос, таймер ———
  function watch(id) {
    if (state.channelId === id) return;
    stopTable(false);
    state.channelId = id;
    const db = client();
    if (db?.channel) {
      try {
        state.channel = db.channel(`glowletter-durak:${id}`, { config: { broadcast: { self: false } } })
          .on("broadcast", { event: "v" }, payload => { if ((payload?.payload?.v || 0) > (state.game?.version || 0)) refreshView(); })
          .subscribe();
      } catch { state.channel = null; }
    }
    clearInterval(state.poll);
    state.poll = setInterval(() => { if (!document.hidden && state.root && !state.root.hidden) refreshView(); }, 6000);
    clearInterval(state.clock);
    state.clock = setInterval(clockTick, 1000);
  }

  function stopTable(full = true) {
    clearInterval(state.poll); clearInterval(state.clock);
    state.poll = 0; state.clock = 0;
    if (state.channel) { try { client()?.removeChannel?.(state.channel); } catch {} }
    state.channel = null;
    state.channelId = "";
    if (full) { state.selected = null; state.hint = null; }
  }

  let refreshing = false;
  async function refreshView() {
    if (refreshing || !state.game?.id) return;
    refreshing = true;
    try { apply(await call("view", { game: state.game.id })); }
    catch (error) { if (error.code === "not_found") { notify(tr("gone")); toHome(); } }
    finally { refreshing = false; }
  }

  let ticking = false;
  function clockTick() {
    const view = state.game;
    if (!view || state.view !== "table") return;
    state.root?.querySelectorAll(".dk-timer").forEach(el => {
      const left = Math.max(0, (view.deadline || 0) - Date.now());
      el.querySelector("i").textContent = String(Math.ceil(left / 1000));
      el.style.setProperty("--p", (left / 30000).toFixed(3));
      el.classList.toggle("is-low", left < 8000);
    });
    if (view.deadline && Date.now() > view.deadline + 800 && !ticking && view.game?.phase === "play") {
      ticking = true;
      call("tick", { game: view.id }).then(apply).catch(() => {}).finally(() => { ticking = false; });
    }
  }

  function apply(view) {
    if (!view) return;
    const before = state.game;
    const chat = view.chat || [];
    if (chat.length) {
      const fresh = chat.filter(line => line.at > state.lastChat);
      fresh.forEach(line => { state.bubbles[line.seat] = { text: line.emote ? `${EMOTES[line.emote] || ""} ${tr(`emo_${line.emote}`)}` : line.text, until: Date.now() + 4200 }; });
      state.lastChat = Math.max(state.lastChat, ...chat.map(line => line.at));
    }
    const sweep = before?.game && view.game && view.game.seq > before.game.seq && before.game.table.length && view.game.log?.some(entry => entry.n > before.game.seq && (entry.t === "beat" || entry.t === "take"));
    state.game = view;
    if (view.status === "lobby") { state.view = "lobby"; render(); return; }
    if (view.status === "closed") { toHome(); return; }
    if (!view.game) return;
    if (state.view !== "table") { state.view = "table"; state.shownTable = []; render(); watch(view.id); return; }
    if (state.selected && !view.game.hand.includes(state.selected)) state.selected = null;
    if (view.game.must.includes(view.game.me) && !before?.game?.must?.includes(before.game.me)) haptic(25);
    if (sweep) {
      const take = view.game.log.some(entry => entry.n > before.game.seq && entry.t === "take");
      const battle = state.root.querySelector("[data-battle]");
      battle?.classList.add(take ? "is-taken" : "is-swept");
      setTimeout(() => { battle?.classList.remove("is-taken", "is-swept"); state.shownTable = []; renderTable(); }, 380);
      return;
    }
    renderTable();
    if (view.game.phase === "over" && before?.game?.phase === "play") { haptic([40, 60, 40]); refreshWallet(); }
  }

  function toHome() {
    stopTable();
    state.game = null;
    state.view = "home";
    render();
    if (signedIn()) call("mine").then(data => { state.mine = data.games || []; if (state.view === "home") render(); }).catch(() => {});
  }

  async function act(move) {
    const view = state.game;
    if (!view?.game || state.busy) return;
    state.busy = true;
    state.selected = null;
    state.hint = null;
    try { apply(await call("act", { game: view.id, move, seq: view.game.seq })); haptic(12); }
    catch (error) { if (error.code === "stale" || error.code === "illegal") await refreshView(); else notify(errorText(error)); }
    finally { state.busy = false; }
  }

  function onHandCard(card) {
    const g = state.game?.game;
    if (!g || !g.must.includes(g.me)) return;
    const options = (g.legal || []).filter(a => a.card === card);
    if (!options.length) { const el = state.root.querySelector(`[data-card="${card}"]`); el?.classList.remove("is-shake"); void el?.offsetWidth; el?.classList.add("is-shake"); return; }
    const defends = options.filter(a => a.type === "defend");
    const transfer = options.find(a => a.type === "transfer");
    const attack = options.find(a => a.type === "attack");
    if (attack) return act(attack);
    if (defends.length === 1 && !transfer) return act(defends[0]);
    if (!defends.length && transfer) return act(transfer);
    state.selected = state.selected === card ? null : card;
    renderTable();
  }

  async function startGame(solo) {
    if (!signedIn()) { notify(tr("signIn")); return; }
    if (state.busy) return;
    state.busy = true;
    render();
    try {
      const view = await call("create", { solo, settings: { ...state.setup, bots: true } });
      state.invited = new Set();
      apply(view);
      if (!solo) watch(view.id);
    } catch (error) {
      notify(errorText(error));
      if (error.code === "not_enough_dollars") window.GlowLetterShop?.open?.("dollars");
    } finally { state.busy = false; if (state.view === "home") render(); }
  }

  async function join(id) {
    if (!UUID.test(String(id || ""))) return;
    if (!state.root || state.root.hidden) await open("home");
    if (!signedIn()) { notify(tr("signIn")); return; }
    try {
      let view;
      try { view = await call("join", { game: id }); }
      catch (error) { if (error.code === "started") view = await call("view", { game: id }); else throw error; }
      apply(view);
      watch(id);
      refreshWallet();
    } catch (error) { notify(errorText(error)); }
  }

  async function onClick(event) {
    const card = event.target.closest("[data-card]");
    if (card && state.root.contains(card)) { onHandCard(card.dataset.card); return; }
    const pair = event.target.closest("[data-slot]");
    if (pair && state.selected) {
      const slot = Number(pair.dataset.slot);
      const move = (state.game?.game?.legal || []).find(a => a.type === "defend" && a.card === state.selected && a.slot === slot);
      if (move) act(move);
      return;
    }
    const set = event.target.closest("[data-set]");
    if (set) {
      const key = set.dataset.set;
      const value = key === "mode" ? set.dataset.value : Number(set.dataset.value);
      state.setup = { ...state.setup, [key]: value };
      saveSetup();
      render();
      return;
    }
    const button = event.target.closest("[data-act]");
    if (!button) return;
    const action = button.dataset.act;
    const view = state.game;
    switch (action) {
      case "close": close(); return;
      case "home": state.view = "home"; render(); return;
      case "shop": window.GlowLetterShop?.open?.(); return;
      case "solo": startGame(true); return;
      case "lobby": startGame(false); return;
      case "ranking": state.view = "ranking"; state.ranking = null; render(); renderRankingData(); return;
      case "rules": state.rulesOpen = !state.rulesOpen; render(); return;
      case "resume": join(button.dataset.id); return;
      case "daily":
        try {
          const got = await rpc("glowletter_daily_claim");
          notify(tr("dailyGot", { n: num(got.dollars_added), d: ((got.streak - 1) % 7) + 1 }));
          haptic([20, 40, 20]);
        } catch (error) { notify(errorText(error)); }
        refreshWallet();
        return;
      case "invite": {
        const id = button.dataset.id;
        try {
          await rpc("glowletter_messages_send", { p_to: id, p_body: `[[durak:${view.id}]]` });
          state.invited.add(id);
          notify(tr("inviteSent", { name: button.dataset.name || "" }));
          render();
        } catch (error) { notify(errorText(error)); }
        return;
      }
      case "start":
        if (state.busy) return;
        state.busy = true;
        try { apply(await call("start", { game: view.id })); } catch (error) { notify(errorText(error)); } finally { state.busy = false; if (state.view === "lobby") render(); }
        return;
      case "leave":
        if (view?.id && (view.status === "lobby" || view.game?.phase === "play")) call("leave", { game: view.id }).catch(() => {});
        toHome();
        return;
      case "menu": toHome(); return;
      case "rematch":
        try { apply(await call("rematch", { game: view.id })); refreshWallet(); }
        catch (error) { if (error.code === "not_finished") refreshView(); else notify(errorText(error)); }
        return;
      case "take": act({ type: "take" }); return;
      case "pass": act({ type: "pass" }); return;
      case "transfer": { const move = (view.game.legal || []).find(a => a.type === "transfer" && a.card === state.selected); if (move) act(move); return; }
      case "hint":
        try {
          const data = await call("hint", { game: view.id });
          state.hint = data.hint;
          state.game = { ...state.game, ...data };
          refreshWallet();
          renderTable();
        } catch (error) { notify(errorText(error)); }
        return;
      case "chat": state.chatOpen = !state.chatOpen; renderTable(); if (state.chatOpen) state.root.querySelector(".dk-chat input")?.focus(); return;
      case "emote":
        state.chatOpen = false;
        try { apply(await call("say", { game: view.id, emote: button.dataset.emote })); } catch (error) { notify(errorText(error)); }
        return;
      default:
    }
  }

  async function onSubmit(event) {
    const form = event.target.closest("[data-form=chat]");
    if (!form) return;
    event.preventDefault();
    const text = String(new FormData(form).get("text") || "").trim();
    if (!text || !state.game?.id) return;
    try { state.chatOpen = false; apply(await call("say", { game: state.game.id, text })); } catch (error) { notify(errorText(error)); }
  }

  // Вход: кнопка на главной и в «Играх».
  document.addEventListener("click", event => {
    const entry = event.target.closest("[data-open-durak]");
    if (entry) { event.preventDefault(); open("home"); }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && state.view === "table") refreshView(); });
  addEventListener("glowletter-wallet-change", () => refreshWallet());

  window.GlowLetterDurak = Object.freeze({ open: () => open("home"), join, text: tr });
})();
