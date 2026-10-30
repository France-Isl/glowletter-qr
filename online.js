/*
  Онлайн с друзьями (2.4.25): то, что видно поверх любого экрана.

  • burst — сердечки и другие реакции летят по экрану у друга в ту же секунду.
  • bearVisit — Тёпа приходит в гости с подарком (в том наряде, что выбрал друг).
  • draw — «Рисуем вместе»: общая открытка, штрихи идут через Realtime broadcast
    канала glowletter-draw:<комната>; на сервере ничего не хранится. Готовую
    открытку можно сохранить картинкой.

  Сообщения и приглашения отправляет friends.js, тексты — тоже оттуда.
*/
(() => {
  "use strict";

  if (window.GlowLetterOnline) return;

  const SIZE = 900;
  const COLORS = ["#2b2233", "#c8423b", "#e98aa3", "#f0a04b", "#e7c35a", "#4f9d69", "#4b7bd1", "#8a62c9"];
  const PAPER = "#fff8ef";
  const WIDTHS = [5, 12, 26];
  const MAX_STROKES = 1500;
  const MAX_POINTS = 1200;

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const userId = () => cloud()?.getState?.().userId || "";
  const tr = (key, values) => window.GlowLetterFriends?.text?.(key, values) || key;
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const icon = id => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

  // ——— Сердечки по экрану ———

  function burst(emoji, options = {}) {
    const layer = document.createElement("div");
    layer.className = "glo-burst";
    layer.setAttribute("aria-hidden", "true");
    const count = reduced() ? 1 : options.small ? 7 : 16;
    for (let index = 0; index < count; index += 1) {
      const piece = document.createElement("span");
      piece.textContent = emoji;
      if (reduced()) piece.className = "is-still";
      else {
        piece.style.setProperty("--x", `${8 + Math.random() * 84}vw`);
        piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 24}vw`);
        piece.style.setProperty("--size", `${(options.small ? 22 : 28) + Math.random() * (options.small ? 14 : 30)}px`);
        piece.style.setProperty("--delay", `${Math.random() * 0.7}s`);
        piece.style.setProperty("--time", `${2.2 + Math.random() * 1.4}s`);
        piece.style.setProperty("--turn", `${(Math.random() - 0.5) * 50}deg`);
      }
      layer.append(piece);
    }
    document.body.append(layer);
    setTimeout(() => layer.remove(), 4200);
  }

  // ——— Тёпа в гостях ———

  function bearVisit(visit) {
    document.querySelector(".glo-bear")?.remove();
    const picture = window.GlowLetterCouple?.outfits?.find(outfit => outfit.id === visit.outfit)?.picture || "s28d";
    const pop = document.createElement("div");
    pop.className = "glo-bear";
    pop.innerHTML = `
      <div class="glo-bear-backdrop" data-bear="close"></div>
      <section class="glo-bear-card" role="alertdialog" aria-modal="true" aria-labelledby="gloBearTitle" aria-describedby="gloBearGift">
        <button class="glg-close" type="button" data-bear="close" aria-label="${escapeHtml(visit.close)}"><span aria-hidden="true">×</span></button>
        <div class="glo-bear-stage" aria-hidden="true">
          <img src="assets/loves/${escapeHtml(picture)}.webp" alt="" width="220" height="220" decoding="async" />
          <span class="glo-bear-gift">${escapeHtml(visit.giftEmoji)}</span>
        </div>
        <h2 id="gloBearTitle">${escapeHtml(visit.title)}</h2>
        <p id="gloBearGift">${escapeHtml(visit.gift)} ${escapeHtml(visit.giftEmoji)}</p>
        <div class="glo-bear-actions">
          <button class="glg-secondary" type="button" data-bear="back">🧸 ${escapeHtml(visit.back)}</button>
          <button class="glg-primary" type="button" data-bear="thanks">❤️ ${escapeHtml(visit.thanks)}</button>
        </div>
      </section>`;
    const done = () => { pop.classList.remove("is-open"); setTimeout(() => pop.remove(), 260); };
    pop.addEventListener("click", event => {
      const action = event.target.closest("[data-bear]")?.dataset.bear;
      if (!action) return;
      done();
      if (action === "thanks") visit.onThanks?.();
      if (action === "back") visit.onBack?.();
    });
    pop.addEventListener("keydown", event => { if (event.key === "Escape") done(); });
    document.body.append(pop);
    requestAnimationFrame(() => { pop.classList.add("is-open"); pop.querySelector("[data-bear=thanks]")?.focus(); });
    try { navigator.vibrate?.([80, 60, 80]); } catch {}
  }

  // ——— Рисуем вместе ———

  const board = { root: null, canvas: null, context: null, room: "", friend: null, channel: null, strokes: [], current: null, pending: [], color: COLORS[0], width: WIDTHS[1], eraser: false, partner: false, flush: 0, cursor: null, cursorTimer: 0, lastFocus: null };

  function mountBoard() {
    if (board.root) return board.root;
    const root = document.createElement("div");
    root.className = "glg-layer glo-draw";
    root.hidden = true;
    root.innerHTML = `
      <button class="glg-backdrop" type="button" data-draw="close" tabindex="-1" aria-hidden="true"></button>
      <section class="glg-panel" role="dialog" aria-modal="true" aria-labelledby="gloDrawTitle">
        <header class="glg-header">
          <div><p class="glg-eyebrow" data-text="eyebrow"></p><h2 id="gloDrawTitle" data-text="title"></h2></div>
          <button class="glg-close" type="button" data-draw="close"><span aria-hidden="true">×</span></button>
        </header>
        <div class="glg-body glo-draw-body">
          <p class="glo-draw-status" role="status" aria-live="polite"></p>
          <div class="glo-draw-paper">
            <canvas width="${SIZE}" height="${SIZE}"></canvas>
            <span class="glo-draw-cursor" hidden></span>
          </div>
          <div class="glo-draw-colors" role="group"></div>
          <div class="glo-draw-sizes" role="group"></div>
          <div class="glo-draw-actions">
            <button class="glg-secondary" type="button" data-draw="undo"></button>
            <button class="glg-secondary" type="button" data-draw="clear"></button>
          </div>
          <button class="glg-primary glg-wide" type="button" data-draw="save"></button>
        </div>
      </section>`;
    root.addEventListener("click", event => {
      const target = event.target.closest("[data-draw]");
      if (target && root.contains(target)) onBoardAction(target.dataset.draw, target);
    });
    root.addEventListener("keydown", event => { if (event.key === "Escape") { event.stopPropagation(); closeBoard(); } });
    const canvas = root.querySelector("canvas");
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    document.body.append(root);
    board.root = root;
    board.canvas = canvas;
    board.context = canvas.getContext("2d");
    return root;
  }

  function renderBoard() {
    const root = board.root;
    if (!root) return;
    root.querySelector("[data-text=eyebrow]").textContent = tr("drawEyebrow");
    root.querySelector("[data-text=title]").textContent = tr("drawTitle");
    root.querySelector(".glg-close").setAttribute("aria-label", tr("close"));
    renderStatus();
    const colors = root.querySelector(".glo-draw-colors");
    colors.setAttribute("aria-label", tr("drawColor"));
    colors.innerHTML = COLORS.map(color => `<button type="button" class="glo-swatch${!board.eraser && board.color === color ? " is-active" : ""}" style="--swatch:${color}" data-draw="color" data-color="${color}" aria-label="${escapeHtml(tr("drawColor"))} ${color}" aria-pressed="${!board.eraser && board.color === color}"></button>`).join("");
    const sizes = root.querySelector(".glo-draw-sizes");
    sizes.setAttribute("aria-label", tr("drawSize"));
    sizes.innerHTML = WIDTHS.map(width => `<button type="button" class="glo-size${!board.eraser && board.width === width ? " is-active" : ""}" data-draw="size" data-width="${width}" aria-label="${escapeHtml(tr("drawSize"))} ${width}" aria-pressed="${!board.eraser && board.width === width}"><i style="--dot:${Math.max(6, width * 0.9)}px"></i></button>`).join("")
      + `<button type="button" class="glo-eraser${board.eraser ? " is-active" : ""}" data-draw="eraser" aria-pressed="${board.eraser}">${escapeHtml(tr("drawEraser"))}</button>`;
    root.querySelector("[data-draw=undo]").textContent = `↶ ${tr("drawUndo")}`;
    root.querySelector("[data-draw=clear]").textContent = tr("drawClear");
    root.querySelector("[data-draw=save]").innerHTML = `${icon("ic-download")} ${escapeHtml(tr("drawSave"))}`;
  }

  function renderStatus() {
    const status = board.root?.querySelector(".glo-draw-status");
    if (!status) return;
    const name = board.friend?.name || "";
    status.textContent = !board.channel ? tr("drawOffline") : board.partner ? tr("drawWith", { name }) : tr("drawWaiting", { name });
    status.classList.toggle("is-live", Boolean(board.partner));
  }

  function draw(room, friend = {}) {
    if (!/^[0-9a-f-]{36}$/u.test(String(room || ""))) return;
    const root = mountBoard();
    if (board.room !== room) {
      leaveChannel();
      Object.assign(board, { room, friend, strokes: [], current: null, pending: [], partner: false });
      paint();
      joinChannel();
    }
    board.lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("glg-open");
    requestAnimationFrame(() => root.classList.add("is-open"));
    renderBoard();
  }

  function closeBoard() {
    const root = board.root;
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    document.body.classList.remove("glg-open");
    setTimeout(() => { if (!root.classList.contains("is-open")) root.hidden = true; }, 320);
    leaveChannel();
    board.room = "";
    board.lastFocus?.focus?.({ preventScroll: true });
  }

  function joinChannel() {
    const db = client();
    if (!db?.channel) { board.channel = null; return; }
    const channel = db.channel(`glowletter-draw:${board.room}`, { config: { broadcast: { self: false }, presence: { key: userId() || crypto.randomUUID() } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const people = Object.keys(channel.presenceState() || {}).length;
        const was = board.partner;
        board.partner = people > 1;
        if (board.partner && !was) channel.send({ type: "broadcast", event: "hi", payload: {} });
        renderStatus();
      })
      .on("broadcast", { event: "s" }, ({ payload }) => onRemoteSegment(payload))
      .on("broadcast", { event: "u" }, ({ payload }) => { board.strokes = board.strokes.filter(stroke => stroke.id !== payload?.id); paint(); })
      .on("broadcast", { event: "x" }, () => { board.strokes = []; paint(); })
      .on("broadcast", { event: "hi" }, () => shareAll())
      .on("broadcast", { event: "all" }, ({ payload }) => onRemoteAll(payload))
      .subscribe(status => {
        if (status === "SUBSCRIBED") channel.track({ at: Date.now() });
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { board.partner = false; renderStatus(); }
      });
    board.channel = channel;
  }

  function leaveChannel() {
    clearInterval(board.flush);
    board.flush = 0;
    if (board.channel) { try { client()?.removeChannel?.(board.channel); } catch {} }
    board.channel = null;
    board.partner = false;
  }

  const send = (event, payload) => { try { board.channel?.send({ type: "broadcast", event, payload }); } catch {} };

  // Новичку отдаём все штрихи кусками, чтобы не упереться в размер сообщения.
  function shareAll() {
    const strokes = board.strokes.filter(stroke => stroke.p.length >= 2);
    for (let index = 0; index < strokes.length; index += 40) {
      send("all", { strokes: strokes.slice(index, index + 40).map(({ id, c, w, p }) => ({ id, c, w, p })) });
    }
  }

  const validStroke = stroke => stroke && typeof stroke.id === "string" && stroke.id.length <= 40
    && (stroke.c === PAPER || COLORS.includes(stroke.c)) && WIDTHS.includes(stroke.w) && Array.isArray(stroke.p);
  const cleanPoints = points => points.filter(Number.isFinite).map(value => Math.max(0, Math.min(SIZE, Math.round(value))));

  function onRemoteAll(payload) {
    let changed = false;
    for (const stroke of (payload?.strokes || []).slice(0, 40)) {
      if (!validStroke(stroke) || board.strokes.some(item => item.id === stroke.id) || board.strokes.length >= MAX_STROKES) continue;
      board.strokes.push({ id: stroke.id, c: stroke.c, w: stroke.w, p: cleanPoints(stroke.p).slice(0, MAX_POINTS * 2) });
      changed = true;
    }
    if (changed) paint();
  }

  function onRemoteSegment(payload) {
    if (!validStroke(payload)) return;
    const points = cleanPoints(payload.p);
    let stroke = board.strokes.find(item => item.id === payload.id);
    if (!stroke) {
      if (board.strokes.length >= MAX_STROKES) return;
      stroke = { id: payload.id, c: payload.c, w: payload.w, p: [] };
      board.strokes.push(stroke);
    }
    if (stroke.p.length >= MAX_POINTS * 2) return;
    const from = stroke.p.length;
    stroke.p.push(...points);
    paintStroke(stroke, Math.max(0, from - 2));
    if (points.length >= 2) showCursor(points[points.length - 2], points[points.length - 1]);
  }

  function showCursor(x, y) {
    const cursor = board.root?.querySelector(".glo-draw-cursor");
    if (!cursor) return;
    cursor.hidden = false;
    cursor.textContent = (board.friend?.name || "♥").trim()[0]?.toUpperCase() || "♥";
    cursor.style.left = `${(x / SIZE) * 100}%`;
    cursor.style.top = `${(y / SIZE) * 100}%`;
    clearTimeout(board.cursorTimer);
    board.cursorTimer = setTimeout(() => { cursor.hidden = true; }, 1500);
  }

  function paint() {
    const context = board.context;
    if (!context) return;
    context.fillStyle = PAPER;
    context.fillRect(0, 0, SIZE, SIZE);
    for (const stroke of board.strokes) paintStroke(stroke, 0);
  }

  function paintStroke(stroke, start) {
    const context = board.context;
    const points = stroke.p;
    if (!context || points.length < 2) return;
    context.strokeStyle = stroke.c;
    context.fillStyle = stroke.c;
    context.lineWidth = stroke.w;
    context.lineCap = "round";
    context.lineJoin = "round";
    if (points.length === 2) {
      context.beginPath();
      context.arc(points[0], points[1], stroke.w / 2, 0, Math.PI * 2);
      context.fill();
      return;
    }
    context.beginPath();
    context.moveTo(points[start], points[start + 1]);
    for (let index = start + 2; index < points.length; index += 2) context.lineTo(points[index], points[index + 1]);
    context.stroke();
  }

  const pointOf = event => {
    const box = board.canvas.getBoundingClientRect();
    return [Math.round(((event.clientX - box.left) / box.width) * SIZE), Math.round(((event.clientY - box.top) / box.height) * SIZE)];
  };

  function onDown(event) {
    if (board.strokes.length >= MAX_STROKES) return;
    event.preventDefault();
    board.canvas.setPointerCapture?.(event.pointerId);
    const stroke = { id: `${userId().slice(0, 8)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, c: board.eraser ? PAPER : board.color, w: board.eraser ? WIDTHS[2] : board.width, p: pointOf(event), mine: true };
    board.strokes.push(stroke);
    board.current = stroke;
    board.pending = [...stroke.p];
    paintStroke(stroke, 0);
    clearInterval(board.flush);
    board.flush = setInterval(flushSegment, 60);
  }

  function onMove(event) {
    const stroke = board.current;
    if (!stroke || stroke.p.length >= MAX_POINTS * 2) return;
    event.preventDefault();
    const [x, y] = pointOf(event);
    const lastX = stroke.p[stroke.p.length - 2];
    const lastY = stroke.p[stroke.p.length - 1];
    if (Math.abs(x - lastX) + Math.abs(y - lastY) < 3) return;
    stroke.p.push(x, y);
    board.pending.push(x, y);
    paintStroke(stroke, stroke.p.length - 4);
  }

  function onUp() {
    if (!board.current) return;
    flushSegment();
    clearInterval(board.flush);
    board.flush = 0;
    board.current = null;
  }

  // Каждый кусок начинается с последней уже отправленной точки — у друга линия не рвётся.
  function flushSegment() {
    const stroke = board.current;
    if (!stroke || !board.pending.length) return;
    const points = board.pending;
    send("s", { id: stroke.id, c: stroke.c, w: stroke.w, p: points });
    board.pending = points.length >= 2 ? [] : points;
  }

  async function onBoardAction(action, target) {
    switch (action) {
      case "close": closeBoard(); return;
      case "color": board.color = target.dataset.color; board.eraser = false; renderBoard(); return;
      case "eraser": board.eraser = !board.eraser; renderBoard(); return;
      case "size": board.width = Number(target.dataset.width); board.eraser = false; renderBoard(); return;
      case "undo": {
        const index = board.strokes.map(stroke => Boolean(stroke.mine)).lastIndexOf(true);
        if (index < 0) return;
        const [stroke] = board.strokes.splice(index, 1);
        send("u", { id: stroke.id });
        paint();
        return;
      }
      case "clear":
        if (!board.strokes.length || !window.confirm(tr("drawClearConfirm"))) return;
        board.strokes = [];
        send("x", {});
        paint();
        return;
      case "save": return saveCard();
      default:
    }
  }

  async function saveCard() {
    const out = document.createElement("canvas");
    out.width = SIZE;
    out.height = SIZE + 70;
    const context = out.getContext("2d");
    context.fillStyle = PAPER;
    context.fillRect(0, 0, out.width, out.height);
    context.drawImage(board.canvas, 0, 0);
    context.fillStyle = "#b28a4a";
    context.font = "800 22px Manrope, system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText("GLOWLETTER · bezam.org", SIZE / 2, SIZE + 44);
    const blob = await new Promise(resolve => out.toBlob(resolve, "image/png"));
    if (!blob) return;
    const name = `${tr("drawFile")}.png`;
    const deliver = app()?.deliverFile;
    if (typeof deliver === "function") { await deliver(blob, name); }
    else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    }
    app()?.notify?.(tr("drawSaved"), 2600);
  }

  window.GlowLetterOnline = Object.freeze({ burst, bearVisit, draw });
})();
