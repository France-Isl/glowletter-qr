/*
  Звонок в приложении (2.4.26): голос между друзьями через WebRTC, номер
  телефона не нужен. Звонящий шлёт другу сообщение [[call:комната]] (его
  показывает friends.js: входящий звонок или «пропущенный» в переписке);
  дальше оба встречаются в канале Realtime glowletter-call:<комната>, где
  идут только служебные сигналы (offer/answer/ice). Сам звук идёт напрямую
  между телефонами и шифруется WebRTC; на сервере ничего не записывается.

  Во время звонка: сердечки и Тёпа летят у обоих, «Играть» открывает
  «Игровой стол» (table.js) в той же комнате — разговор не прерывается.
  Начать звонок можно с полным доступом; ответить может любой друг.
*/
(() => {
  "use strict";

  if (window.GlowLetterCall) return;

  const TEXT = {
    ru: {
      calling: "Звоним…", ringing: "{name} звонит", incoming: "Входящий звонок", accept: "Ответить", decline: "Отклонить",
      hangup: "Завершить", mute: "Выключить микрофон", unmute: "Включить микрофон", play: "Играть", hearts: "Сердечко",
      bear: "Тёпа", connecting: "Соединяем…", connected: "Разговор идёт", reconnecting: "Связь прерывается, восстанавливаем…",
      ended: "Звонок завершён", declined: "{name} сейчас не может ответить", missed: "{name} не ответил на звонок",
      busy: "{name} сейчас разговаривает", failed: "Не удалось соединиться. Попробуйте ещё раз или через Wi-Fi.",
      micDenied: "Нет доступа к микрофону. Разрешите его в настройках телефона или браузера.",
      unsupported: "Этот браузер не умеет звонить. Откройте GlowLetter в приложении или в Chrome.",
      premium: "Звонить можно с полным доступом. Отвечать на звонки друзей — бесплатно.",
      callButton: "Позвонить", minimize: "Свернуть", expand: "Развернуть звонок", friendMuted: "{name}: микрофон выключен",
      callBubble: "Звонок", callBack: "Перезвонить", missedBubble: "Пропущенный звонок", inCall: "Звонок с {name}"
    },
    en: {
      calling: "Calling…", ringing: "{name} is calling", incoming: "Incoming call", accept: "Answer", decline: "Decline",
      hangup: "End call", mute: "Mute microphone", unmute: "Unmute microphone", play: "Play", hearts: "Heart",
      bear: "Teddy", connecting: "Connecting…", connected: "On the call", reconnecting: "Connection dropped, reconnecting…",
      ended: "Call ended", declined: "{name} can’t answer right now", missed: "{name} didn’t answer",
      busy: "{name} is on another call", failed: "Couldn’t connect. Try again or switch to Wi-Fi.",
      micDenied: "No access to the microphone. Allow it in your phone or browser settings.",
      unsupported: "This browser can’t make calls. Open GlowLetter in the app or in Chrome.",
      premium: "Calling is part of full access. Answering a friend’s call is free.",
      callButton: "Call", minimize: "Minimise", expand: "Open the call", friendMuted: "{name} muted the microphone",
      callBubble: "Call", callBack: "Call back", missedBubble: "Missed call", inCall: "Call with {name}"
    },
    fr: {
      calling: "Appel en cours…", ringing: "{name} vous appelle", incoming: "Appel entrant", accept: "Répondre", decline: "Refuser",
      hangup: "Raccrocher", mute: "Couper le micro", unmute: "Activer le micro", play: "Jouer", hearts: "Cœur",
      bear: "Nounours", connecting: "Connexion…", connected: "Appel en cours", reconnecting: "La connexion a sauté, on rétablit…",
      ended: "Appel terminé", declined: "{name} ne peut pas répondre pour l’instant", missed: "{name} n’a pas répondu",
      busy: "{name} est déjà en appel", failed: "Connexion impossible. Réessayez ou passez en Wi-Fi.",
      micDenied: "Pas d’accès au micro. Autorisez-le dans les réglages du téléphone ou du navigateur.",
      unsupported: "Ce navigateur ne permet pas d’appeler. Ouvrez GlowLetter dans l’application ou dans Chrome.",
      premium: "Appeler fait partie de l’accès complet. Répondre à un ami est gratuit.",
      callButton: "Appeler", minimize: "Réduire", expand: "Ouvrir l’appel", friendMuted: "{name} a coupé son micro",
      callBubble: "Appel", callBack: "Rappeler", missedBubble: "Appel manqué", inCall: "Appel avec {name}"
    }
  };

  const ROOM = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
  const RING_MS = 45000;
  const INVITE_FRESH_MS = 50000;
  const ICE_SERVERS = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];

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
  const tr = (key, values) => fill(TEXT[lang()]?.[key] ?? window.GLOWLETTER_ULTRA_I18N?.[lang()]?.call?.[key] ?? TEXT.en[key] ?? key, values);
  const native = () => window.NurCall || null;
  const supported = () => Boolean(window.RTCPeerConnection && navigator.mediaDevices?.getUserMedia);

  // phase: idle → outgoing / incoming → connecting → connected → ended
  const call = {
    phase: "idle", room: "", friend: null, caller: false, channel: null, peer: null, stream: null, remote: null,
    muted: false, friendMuted: false, startedAt: 0, ringTimer: 0, tickTimer: 0, dropTimer: 0, ring: null,
    root: null, expanded: true, pendingIce: [], seen: new Set(), note: ""
  };

  function iceServers() {
    const extra = Array.isArray(window.NUR_APP_CONFIG?.turnServers) ? window.NUR_APP_CONFIG.turnServers : [];
    return [...ICE_SERVERS, ...extra];
  }

  // ——— Начать звонок ———

  async function start(friend) {
    if (!friend?.user_id) return false;
    if (call.phase !== "idle") { setExpanded(true); return false; }
    if (!premium()) { app()?.openPaywall?.(); return false; }
    if (!supported()) { toast(tr("unsupported")); return false; }
    const room = crypto.randomUUID();
    Object.assign(call, { phase: "outgoing", room, friend: { user_id: friend.user_id, name: friend.name || "" }, caller: true, note: "" });
    render();
    if (!(await openMicrophone())) return false;
    try {
      await window.GlowLetterFriends?.sendCallInvite?.(friend.user_id, room);
    } catch (error) {
      console.warn("call invite failed", error);
      end(tr("failed"));
      return false;
    }
    joinChannel();
    startRingback();
    call.ringTimer = setTimeout(() => {
      if (call.phase === "outgoing") { signal("cancel", {}); end(tr("missed", { name: call.friend.name })); }
    }, RING_MS);
    return true;
  }

  // ——— Входящий (friends.js видит [[call:комната]]) ———

  function incoming(friend, room, createdAt) {
    if (!ROOM.test(String(room || "")) || !friend?.user_id || call.seen.has(room)) return false;
    call.seen.add(room);
    const age = Date.now() - new Date(createdAt || Date.now()).getTime();
    if (age > INVITE_FRESH_MS) return false;
    if (call.phase !== "idle") {
      // Уже разговариваем — второй звонящий услышит «занято».
      const busy = client()?.channel?.(`glowletter-call:${room}`, { config: { broadcast: { self: false } } });
      busy?.subscribe(status => {
        if (status !== "SUBSCRIBED") return;
        busy.send({ type: "broadcast", event: "busy", payload: {} });
        setTimeout(() => { try { client()?.removeChannel?.(busy); } catch {} }, 1500);
      });
      return false;
    }
    Object.assign(call, { phase: "incoming", room, friend: { user_id: friend.user_id, name: friend.name || "" }, caller: false, expanded: true, note: "" });
    joinChannel();
    startRingtone();
    call.ringTimer = setTimeout(() => { if (call.phase === "incoming") end(""); }, Math.max(5000, RING_MS - age));
    render();
    return true;
  }

  async function accept() {
    if (call.phase !== "incoming") return;
    stopRing();
    if (!supported()) { decline(); toast(tr("unsupported")); return; }
    call.phase = "connecting";
    render();
    if (!(await openMicrophone())) { signal("decline", {}); return; }
    createPeer();
    signal("accept", {});
  }

  function decline() {
    if (call.phase !== "incoming") return;
    signal("decline", {});
    end("");
  }

  function hangup() {
    if (call.phase === "idle") return;
    signal(call.phase === "outgoing" ? "cancel" : "hangup", {});
    end(tr("ended"));
  }

  // ——— Микрофон и соединение ———

  async function openMicrophone() {
    try {
      native()?.prepare?.();
      call.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
      call.stream.getAudioTracks().forEach(track => { track.enabled = !call.muted; });
      return true;
    } catch (error) {
      console.warn("microphone", error);
      end(tr("micDenied"));
      return false;
    }
  }

  function createPeer() {
    if (call.peer) return call.peer;
    const peer = new RTCPeerConnection({ iceServers: iceServers() });
    call.stream?.getTracks().forEach(track => peer.addTrack(track, call.stream));
    peer.onicecandidate = event => { if (event.candidate) signal("ice", { candidate: event.candidate.toJSON() }); };
    peer.ontrack = event => {
      const audio = remoteAudio();
      if (audio.srcObject !== event.streams[0]) {
        audio.srcObject = event.streams[0];
        audio.play?.().catch(() => {});
      }
    };
    peer.onconnectionstatechange = () => onConnectionState(peer.connectionState);
    peer.oniceconnectionstatechange = () => { if (peer.iceConnectionState === "failed" && call.caller) restartIce(); };
    call.peer = peer;
    return peer;
  }

  function onConnectionState(stateName) {
    if (stateName === "connected") {
      clearTimeout(call.dropTimer);
      if (call.phase !== "connected") {
        call.phase = "connected";
        call.startedAt = call.startedAt || Date.now();
        clearInterval(call.tickTimer);
        call.tickTimer = setInterval(renderTimer, 1000);
        native()?.setActive?.(true);
        client()?.rpc?.("glowletter_pair_checkin", { p_friend: call.friend.user_id })?.then?.(() => {}, () => {});
      }
      call.note = "";
      render();
    } else if (stateName === "disconnected") {
      call.note = tr("reconnecting");
      render();
      clearTimeout(call.dropTimer);
      call.dropTimer = setTimeout(() => { if (call.peer?.connectionState !== "connected") restartIce(); }, 4000);
    } else if (stateName === "failed") {
      if (call.caller) restartIce();
      clearTimeout(call.dropTimer);
      call.dropTimer = setTimeout(() => { if (call.peer?.connectionState !== "connected") { signal("hangup", {}); end(tr("failed")); } }, 15000);
    }
  }

  async function makeOffer(options = {}) {
    const peer = createPeer();
    try {
      const offer = await peer.createOffer(options);
      await peer.setLocalDescription(offer);
      signal("offer", { sdp: peer.localDescription.toJSON() });
    } catch (error) {
      console.warn("offer", error);
    }
  }

  function restartIce() {
    if (!call.caller || !call.peer || call.phase === "idle") return;
    try { call.peer.restartIce?.(); } catch {}
    makeOffer({ iceRestart: true });
  }

  async function onOffer(payload) {
    if (call.caller || !payload?.sdp) return;
    const peer = createPeer();
    try {
      await peer.setRemoteDescription(payload.sdp);
      await flushIce();
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      signal("answer", { sdp: peer.localDescription.toJSON() });
    } catch (error) {
      console.warn("answer", error);
    }
  }

  async function onAnswer(payload) {
    if (!call.caller || !payload?.sdp || !call.peer) return;
    try {
      await call.peer.setRemoteDescription(payload.sdp);
      await flushIce();
    } catch (error) {
      console.warn("remote answer", error);
    }
  }

  async function onIce(payload) {
    if (!payload?.candidate) return;
    if (!call.peer?.remoteDescription) { call.pendingIce.push(payload.candidate); return; }
    try { await call.peer.addIceCandidate(payload.candidate); } catch {}
  }

  async function flushIce() {
    const list = call.pendingIce.splice(0);
    for (const candidate of list) { try { await call.peer.addIceCandidate(candidate); } catch {} }
  }

  function remoteAudio() {
    if (!call.remote) {
      call.remote = document.createElement("audio");
      call.remote.autoplay = true;
      call.remote.setAttribute("playsinline", "");
      call.remote.hidden = true;
      document.body.append(call.remote);
    }
    return call.remote;
  }

  // ——— Сигналы ———

  function joinChannel() {
    const db = client();
    if (!db?.channel) { end(tr("failed")); return; }
    const channel = db.channel(`glowletter-call:${call.room}`, { config: { broadcast: { self: false } } });
    channel
      .on("broadcast", { event: "accept" }, () => {
        if (!call.caller || call.phase !== "outgoing") return;
        stopRing();
        clearTimeout(call.ringTimer);
        call.phase = "connecting";
        render();
        makeOffer();
      })
      .on("broadcast", { event: "decline" }, () => { if (call.caller && call.phase === "outgoing") end(tr("declined", { name: call.friend.name })); })
      .on("broadcast", { event: "busy" }, () => { if (call.caller && call.phase === "outgoing") end(tr("busy", { name: call.friend.name })); })
      .on("broadcast", { event: "cancel" }, () => { if (!call.caller && call.phase === "incoming") end(""); })
      .on("broadcast", { event: "hangup" }, () => { if (call.phase !== "idle") end(tr("ended")); })
      .on("broadcast", { event: "offer" }, ({ payload }) => onOffer(payload))
      .on("broadcast", { event: "answer" }, ({ payload }) => onAnswer(payload))
      .on("broadcast", { event: "ice" }, ({ payload }) => onIce(payload))
      .on("broadcast", { event: "mute" }, ({ payload }) => { call.friendMuted = payload?.on === true; render(); })
      .on("broadcast", { event: "react" }, ({ payload }) => { if (payload?.kind === "heart") window.GlowLetterOnline?.burst?.("❤️", { small: true }); })
      .on("broadcast", { event: "bear" }, () => bearHere(false))
      // Друг сел за стол во время звонка — открываем стол и здесь.
      .on("broadcast", { event: "table" }, () => { const table = window.GlowLetterTable; if (call.phase === "connected" && !(table?.isOpen?.() && table.room?.() === call.room)) openTable(false); })
      .subscribe(status => {
        if (status === "SUBSCRIBED" && call.caller && call.phase === "outgoing") signal("ring", {});
      });
    call.channel = channel;
  }

  function signal(event, payload) {
    try { call.channel?.send({ type: "broadcast", event, payload }); } catch {}
  }

  // ——— Конец звонка ———

  function end(message) {
    stopRing();
    clearTimeout(call.ringTimer);
    clearTimeout(call.dropTimer);
    clearInterval(call.tickTimer);
    try { call.peer?.close(); } catch {}
    call.stream?.getTracks().forEach(track => track.stop());
    if (call.remote) { call.remote.srcObject = null; }
    const channel = call.channel;
    if (channel) setTimeout(() => { try { client()?.removeChannel?.(channel); } catch {} }, 800);
    native()?.setActive?.(false);
    Object.assign(call, { phase: "idle", peer: null, stream: null, channel: null, muted: false, friendMuted: false, startedAt: 0, pendingIce: [] });
    // «Игровой стол» не закрываем: партию можно доиграть и без звонка.
    render();
    if (message) toast(message);
  }

  // ——— Во время звонка ———

  function toggleMute() {
    call.muted = !call.muted;
    call.stream?.getAudioTracks().forEach(track => { track.enabled = !call.muted; });
    signal("mute", { on: call.muted });
    render();
  }

  function sendHeart() {
    window.GlowLetterOnline?.burst?.("❤️", { small: true });
    signal("react", { kind: "heart" });
  }

  function sendBear() {
    bearHere(true);
    signal("bear", {});
  }

  function bearHere(mine) {
    const node = call.root?.querySelector(".glk-bear");
    if (!node) return;
    node.classList.remove("is-on");
    void node.offsetWidth;
    node.classList.add("is-on");
    if (!mine) window.GlowLetterOnline?.burst?.("🧸", { small: true });
  }

  function openTable(invite = true) {
    if (!call.friend) return;
    setExpanded(false);
    window.GlowLetterTable?.open?.({ room: call.room, friend: { user_id: call.friend.user_id, name: call.friend.name } });
    if (invite) signal("table", {});
  }

  // ——— Звуки (тихие короткие сигналы) ———

  function tone(pattern) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = call.ring?.context || new AudioContext();
      const beep = () => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = pattern.frequency;
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(pattern.volume, context.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + pattern.length);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + pattern.length + 0.05);
        if (pattern.vibrate) navigator.vibrate?.(pattern.vibrate);
      };
      beep();
      call.ring = { context, timer: setInterval(beep, pattern.every) };
    } catch {}
  }

  const startRingback = () => tone({ frequency: 440, volume: 0.06, length: 1.1, every: 3000 });
  const startRingtone = () => tone({ frequency: 660, volume: 0.12, length: 0.7, every: 1600, vibrate: [300, 200, 300] });

  function stopRing() {
    if (!call.ring) return;
    clearInterval(call.ring.timer);
    try { call.ring.context.close(); } catch {}
    navigator.vibrate?.(0);
    call.ring = null;
  }

  // ——— Окно звонка ———

  function mount() {
    if (call.root) return call.root;
    const root = document.createElement("section");
    root.className = "glk";
    root.hidden = true;
    root.setAttribute("aria-live", "polite");
    root.addEventListener("click", event => {
      const button = event.target.closest("[data-call]");
      if (!button) return;
      const action = button.dataset.call;
      if (action === "accept") accept();
      else if (action === "decline") decline();
      else if (action === "hangup") hangup();
      else if (action === "mute") toggleMute();
      else if (action === "heart") sendHeart();
      else if (action === "bear") sendBear();
      else if (action === "play") openTable();
      else if (action === "min") setExpanded(false);
      else if (action === "expand") setExpanded(true);
    });
    document.body.append(root);
    call.root = root;
    return root;
  }

  function setExpanded(value) {
    call.expanded = value;
    render();
  }

  const elapsed = () => {
    if (!call.startedAt) return "";
    const seconds = Math.floor((Date.now() - call.startedAt) / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  };

  function renderTimer() {
    call.root?.querySelectorAll(".glk-time").forEach(node => { node.textContent = elapsed(); });
  }

  function bearPicture() {
    const id = window.GlowLetterCouple?.bearFor?.(call.friend?.user_id);
    const picture = window.GlowLetterCouple?.outfits?.find(outfit => outfit.id === id)?.picture || "s28d";
    return `assets/loves/${picture}.webp`;
  }

  function render() {
    const root = mount();
    document.body.classList.toggle("glk-active", call.phase !== "idle");
    if (call.phase === "idle") { root.hidden = true; root.innerHTML = ""; return; }
    root.hidden = false;
    const name = escapeHtml(call.friend?.name || "");
    const status = call.note || {
      outgoing: tr("calling"), incoming: tr("incoming"), connecting: tr("connecting"), connected: tr("connected")
    }[call.phase] || "";
    const live = call.phase === "connected" || call.phase === "connecting";
    if (!call.expanded && call.phase !== "incoming") {
      root.className = "glk is-mini";
      root.innerHTML = `
        <button class="glk-pill" type="button" data-call="expand" aria-label="${escapeHtml(tr("expand"))}">
          <span class="glk-dot" aria-hidden="true"></span><b>${escapeHtml(tr("inCall", { name: call.friend?.name || "" }))}</b><span class="glk-time">${elapsed()}</span>
        </button>
        <button class="glk-round glk-mute${call.muted ? " is-on" : ""}" type="button" data-call="mute" aria-pressed="${call.muted}" aria-label="${escapeHtml(call.muted ? tr("unmute") : tr("mute"))}">${`<span class="glk-emoji" aria-hidden="true">${call.muted ? "🔇" : "🎙️"}</span>`}</button>
        <button class="glk-round glk-end" type="button" data-call="hangup" aria-label="${escapeHtml(tr("hangup"))}">${`<span class="glk-emoji glk-phone" aria-hidden="true">📞</span>`}</button>`;
      return;
    }
    root.className = `glk is-full is-${call.phase}`;
    root.innerHTML = `
      <div class="glk-card" role="dialog" aria-modal="false" aria-label="${escapeHtml(call.phase === "incoming" ? tr("ringing", { name: call.friend?.name || "" }) : tr("inCall", { name: call.friend?.name || "" }))}">
        ${call.phase === "incoming" ? "" : `<button class="glk-min" type="button" data-call="min" aria-label="${escapeHtml(tr("minimize"))}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`}
        <div class="glk-avatar${call.phase === "incoming" || call.phase === "outgoing" ? " is-ringing" : ""}"><img src="${escapeHtml(bearPicture())}" alt="" loading="lazy"><span class="glk-bear" aria-hidden="true">🧸</span></div>
        <h2 class="glk-name">${name}</h2>
        <p class="glk-status">${escapeHtml(status)} <span class="glk-time">${call.phase === "connected" ? elapsed() : ""}</span></p>
        ${call.friendMuted ? `<p class="glk-muted-note">${escapeHtml(tr("friendMuted", { name: call.friend?.name || "" }))}</p>` : ""}
        ${call.phase === "incoming" ? `
          <div class="glk-answer">
            <button class="glk-big glk-decline" type="button" data-call="decline">${`<span class="glk-emoji glk-phone" aria-hidden="true">📞</span>`}<span>${escapeHtml(tr("decline"))}</span></button>
            <button class="glk-big glk-accept" type="button" data-call="accept">${`<span class="glk-emoji glk-phone" aria-hidden="true">📞</span>`}<span>${escapeHtml(tr("accept"))}</span></button>
          </div>` : `
          <div class="glk-tools">
            <button class="glk-tool${call.muted ? " is-on" : ""}" type="button" data-call="mute" aria-pressed="${call.muted}">${`<span class="glk-emoji" aria-hidden="true">${call.muted ? "🔇" : "🎙️"}</span>`}<span>${escapeHtml(call.muted ? tr("unmute") : tr("mute"))}</span></button>
            <button class="glk-tool" type="button" data-call="heart" ${live ? "" : "disabled"}><span class="glk-emoji" aria-hidden="true">❤️</span><span>${escapeHtml(tr("hearts"))}</span></button>
            <button class="glk-tool" type="button" data-call="bear" ${live ? "" : "disabled"}><span class="glk-emoji" aria-hidden="true">🧸</span><span>${escapeHtml(tr("bear"))}</span></button>
            <button class="glk-tool glk-play" type="button" data-call="play" ${live ? "" : "disabled"}><span class="glk-emoji" aria-hidden="true">🎲</span><span>${escapeHtml(tr("play"))}</span></button>
          </div>
          <button class="glk-big glk-end" type="button" data-call="hangup">${`<span class="glk-emoji glk-phone" aria-hidden="true">📞</span>`}<span>${escapeHtml(tr("hangup"))}</span></button>`}
      </div>`;
    if (call.phase === "incoming") root.querySelector("[data-call=accept]")?.focus({ preventScroll: true });
  }

  function toast(message) {
    if (app()?.notify) { app().notify(message, 3200); return; }
    const node = document.createElement("p");
    node.className = "glk-toast";
    node.setAttribute("role", "status");
    node.textContent = message;
    document.body.append(node);
    setTimeout(() => node.remove(), 3200);
  }

  addEventListener("pagehide", () => { if (call.phase !== "idle") signal("hangup", {}); });

  window.GlowLetterCall = Object.freeze({
    start,
    incoming,
    hangup,
    active: () => call.phase !== "idle",
    room: () => call.room,
    supported,
    text: (key, values) => tr(key, values)
  });
})();
