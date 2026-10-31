/*
  Звонок в приложении (2.4.26, общий звонок — 2.4.27): голос между друзьями
  через WebRTC, номер телефона не нужен. Звонящий шлёт другу сообщение
  [[call:комната]] (его показывает friends.js: входящий звонок или
  «пропущенный» в переписке); дальше все встречаются в канале Realtime
  glowletter-call:<комната>, где идут только служебные сигналы
  (offer/answer/ice) и присутствие (кто сейчас в звонке). Сам звук идёт
  напрямую между телефонами и шифруется WebRTC; на сервере ничего не
  записывается. Если напрямую не соединиться (мобильный интернет, оператор),
  звук идёт через ретранслятор: временный логин выдаёт функция turn.

  Общий звонок — до четырёх человек (MAX_PEOPLE): у каждой пары своё
  соединение («сетка»), предложение (offer) всегда делает тот, у кого id
  меньше, — так двое не начнут одновременно. Каждый сигнал несёт from и to,
  чужие сигналы пропускаются. Любой участник может позвать ещё друга
  кнопкой «Добавить»; пятый увидит «Звонок заполнен». Кто положил трубку —
  выходит только сам; звонок заканчивается, когда остаёшься один.

  Видеозвонок: start(friend, { video: true }) — камера идёт по тем же
  соединениям (у каждой пары есть видеоканал, камеру можно включить и
  выключить без пересогласования). Нет камеры (или WebView её не даёт) —
  звонок идёт со звуком и об этом коротко говорится.

  Во время звонка: сердечки летят у всех, «Играть» открывает «Игровой стол»
  (table.js) в той же комнате — разговор не прерывается.
  Начать звонок можно с полным доступом; ответить может любой друг.
*/
(() => {
  "use strict";

  if (window.GlowLetterCall) return;

  const TEXT = {
    ru: {
      calling: "Звоним…", ringing: "{name} звонит", incoming: "Входящий звонок", accept: "Ответить", decline: "Отклонить",
      hangup: "Завершить", mute: "Выключить микрофон", unmute: "Включить микрофон", play: "Играть вместе", hearts: "Сердечко",
      bear: "Тёпа", connecting: "Соединяем…", connected: "Разговор идёт", reconnecting: "Связь прерывается, восстанавливаем…",
      ended: "Звонок завершён", declined: "{name} сейчас не может ответить", missed: "{name} не ответил на звонок",
      busy: "{name} сейчас разговаривает", failed: "Не удалось соединиться. Попробуйте ещё раз или через Wi-Fi.",
      micDenied: "Нет доступа к микрофону. Разрешите его в настройках телефона или браузера.",
      unsupported: "Этот браузер не умеет звонить. Откройте GlowLetter в приложении или в Chrome.",
      premium: "Звонить можно с полным доступом. Отвечать на звонки друзей — бесплатно.",
      callButton: "Позвонить", minimize: "Свернуть", expand: "Развернуть звонок", friendMuted: "{name}: микрофон выключен",
      callBubble: "Звонок", callBack: "Перезвонить", missedBubble: "Пропущенный звонок", inCall: "Звонок с {name}",
      add: "Добавить", addTitle: "Позвать в звонок", addNone: "Пока некого позвать: все друзья уже здесь или их ещё нет.",
      inviteSent: "{name}: приглашение отправлено", invited: "Ждём ответа", full: "Звонок заполнен: в нём уже четыре человека.",
      joined: "{name} в звонке", left: "{name} уже не в звонке", groupCall: "Звонок · {n}", groupTitle: "Общий звонок",
      groupRinging: "{name} зовёт в общий звонок", you: "Вы", close: "Закрыть",
      videoCall: "Видеозвонок", incomingVideo: "Входящий видеозвонок", acceptVideo: "С видео", acceptAudio: "Ответить только со звуком",
      cameraOn: "Включить камеру", cameraOff: "Выключить камеру", flip: "Сменить камеру",
      cameraFailed: "Камера недоступна — звонок идёт со звуком.", flipFailed: "Не удалось сменить камеру."
    },
    en: {
      calling: "Calling…", ringing: "{name} is calling", incoming: "Incoming call", accept: "Answer", decline: "Decline",
      hangup: "End call", mute: "Mute microphone", unmute: "Unmute microphone", play: "Play together", hearts: "Heart",
      bear: "Teddy", connecting: "Connecting…", connected: "On the call", reconnecting: "Connection dropped, reconnecting…",
      ended: "Call ended", declined: "{name} can’t answer right now", missed: "{name} didn’t answer",
      busy: "{name} is on another call", failed: "Couldn’t connect. Try again or switch to Wi-Fi.",
      micDenied: "No access to the microphone. Allow it in your phone or browser settings.",
      unsupported: "This browser can’t make calls. Open GlowLetter in the app or in Chrome.",
      premium: "Calling is part of full access. Answering a friend’s call is free.",
      callButton: "Call", minimize: "Minimise", expand: "Open the call", friendMuted: "{name} muted the microphone",
      callBubble: "Call", callBack: "Call back", missedBubble: "Missed call", inCall: "Call with {name}",
      add: "Add", addTitle: "Invite to the call", addNone: "No one to invite yet: your friends are already here or you haven’t added any.",
      inviteSent: "Inviting {name}…", invited: "Waiting for an answer", full: "This call is full: four people are already on it.",
      joined: "{name} joined the call", left: "{name} left the call", groupCall: "Call · {n}", groupTitle: "Group call",
      groupRinging: "{name} invites you to a group call", you: "You", close: "Close",
      videoCall: "Video call", incomingVideo: "Incoming video call", acceptVideo: "With video", acceptAudio: "Answer with audio only",
      cameraOn: "Turn camera on", cameraOff: "Turn camera off", flip: "Switch camera",
      cameraFailed: "Camera unavailable — the call continues with audio.", flipFailed: "Couldn’t switch the camera."
    },
    fr: {
      calling: "Appel en cours…", ringing: "{name} vous appelle", incoming: "Appel entrant", accept: "Répondre", decline: "Refuser",
      hangup: "Raccrocher", mute: "Couper le micro", unmute: "Activer le micro", play: "Jouer ensemble", hearts: "Cœur",
      bear: "Nounours", connecting: "Connexion…", connected: "Appel en cours", reconnecting: "La connexion a sauté, on rétablit…",
      ended: "Appel terminé", declined: "{name} ne peut pas répondre pour l’instant", missed: "{name} n’a pas répondu",
      busy: "{name} est déjà en appel", failed: "Connexion impossible. Réessayez ou passez en Wi-Fi.",
      micDenied: "Pas d’accès au micro. Autorisez-le dans les réglages du téléphone ou du navigateur.",
      unsupported: "Ce navigateur ne permet pas d’appeler. Ouvrez GlowLetter dans l’application ou dans Chrome.",
      premium: "Appeler fait partie de l’accès complet. Répondre à un ami est gratuit.",
      callButton: "Appeler", minimize: "Réduire", expand: "Ouvrir l’appel", friendMuted: "{name} a coupé son micro",
      callBubble: "Appel", callBack: "Rappeler", missedBubble: "Appel manqué", inCall: "Appel avec {name}",
      add: "Ajouter", addTitle: "Inviter dans l’appel", addNone: "Personne à inviter pour l’instant : vos amis sont déjà là ou vous n’en avez pas encore.",
      inviteSent: "On invite {name}…", invited: "En attente de réponse", full: "L’appel est complet : quatre personnes y sont déjà.",
      joined: "{name} a rejoint l’appel", left: "{name} a quitté l’appel", groupCall: "Appel · {n}", groupTitle: "Appel de groupe",
      groupRinging: "{name} vous invite à un appel de groupe", you: "Vous", close: "Fermer",
      videoCall: "Appel vidéo", incomingVideo: "Appel vidéo entrant", acceptVideo: "Avec vidéo", acceptAudio: "Répondre en audio seulement",
      cameraOn: "Activer la caméra", cameraOff: "Couper la caméra", flip: "Changer de caméra",
      cameraFailed: "Caméra indisponible — l’appel continue en audio.", flipFailed: "Impossible de changer de caméra."
    }
  };

  const ROOM = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
  const MAX_PEOPLE = 4;
  const RING_MS = 45000;
  const INVITE_FRESH_MS = 50000;
  const CONNECT_MS = 30000;
  const SPEAK_LEVEL = 0.03;
  const METER_MS = 120;
  const videoConstraints = facing => ({ facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } });
  const ICE_SERVERS = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
  const RELAY_URL = `${(window.NUR_APP_CONFIG || {}).supabaseUrl || ""}/functions/v1/turn`;
  const RELAY_WAIT_MS = 4000;
  // Владелец 01.11: видеозвонков нет, только звук. Видео из старых версий приложения не показывается.
  const VIDEO_CALLS = false;

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
  const friendsList = () => { try { return window.GlowLetterFriends?.friends?.() || []; } catch { return []; } };
  const myName = () => String(window.GlowLetterFriends?.myName?.() || app()?.getState?.().senderName || "").slice(0, 36);
  const initial = name => escapeHtml(Array.from(String(name || "").trim())[0]?.toUpperCase() || "♡");

  // Сигнал мой, если его прислал другой участник и он адресован мне или всем ("*").
  const forMe = payload => Boolean(payload) && typeof payload.from === "string" && payload.from !== "" && payload.from !== userId()
    && (payload.to === userId() || payload.to === "*");
  // Предложение делает тот, у кого id меньше: у каждой пары ровно один «звонящий».
  const offersTo = id => userId() < id;

  // phase: idle → outgoing / incoming → connecting → connected → ended
  const call = {
    phase: "idle", room: "", friend: null, caller: false, channel: null, stream: null, subscribed: false, tracked: false,
    muted: false, startedAt: 0, joinedAt: 0, ringTimer: 0, tickTimer: 0, connectTimer: 0, ring: null,
    root: null, expanded: true, seen: new Set(), note: "", sawOthers: false, picking: false, pickFocus: false,
    members: new Map(), // кто в звонке по присутствию: id → { name, muted, at }
    peers: new Map(), // соединение с каждым: id → { pc, pendingIce, audio, connected, dropTimer, helloTimer, checked }
    names: new Map(), invited: new Map(), muteOf: new Map(), known: new Set(),
    meter: { context: null, nodes: new Map(), raf: 0, last: 0 },
    // Видео: video — это видеозвонок; camera — моя камера сейчас включена; camOf — камеры остальных.
    video: false, camera: false, facing: "user", cameraTrack: null, camOf: new Map(), stage: null, ui: null, self: null, tiles: new Map()
  };

  // Ретранслятор звука выдаёт сервер (функция turn): временный логин. Он нужен, когда напрямую
  // не соединиться — мобильный интернет, слабая сеть, ограничения у оператора. Нет ответа за 4 с
  // или ретранслятор не настроен — звоним напрямую, как раньше.
  const relay = { servers: [], until: 0, loading: null };

  function loadRelay() {
    if (Date.now() < relay.until) return Promise.resolve();
    if (relay.loading) return relay.loading;
    const token = cloud()?.getSession?.()?.access_token;
    if (!token || !RELAY_URL.startsWith("https://")) return Promise.resolve();
    const request = fetch(RELAY_URL, {
      method: "POST", cache: "no-store", credentials: "omit",
      headers: { "Content-Type": "application/json", apikey: window.NUR_APP_CONFIG?.supabasePublishableKey || "", Authorization: `Bearer ${token}` },
      body: "{}"
    }).then(response => (response.ok ? response.json() : null)).then(data => {
      const servers = Array.isArray(data?.iceServers) ? data.iceServers.filter(server => server && server.urls) : [];
      relay.servers = servers;
      relay.until = Date.now() + (servers.length ? Math.max(600, (Number(data.ttl) || 3600) - 1800) : 600) * 1000;
    }).catch(() => {});
    relay.loading = Promise.race([request, new Promise(resolve => setTimeout(resolve, RELAY_WAIT_MS))]).finally(() => { relay.loading = null; });
    return relay.loading;
  }

  function iceServers() {
    const extra = Array.isArray(window.NUR_APP_CONFIG?.turnServers) ? window.NUR_APP_CONFIG.turnServers : [];
    return [...ICE_SERVERS, ...relay.servers, ...extra];
  }

  const live = () => call.phase === "connecting" || call.phase === "connected";
  const othersIds = () => [...new Set([...call.members.keys(), ...call.peers.keys()])].filter(id => id && id !== userId());
  const count = () => 1 + othersIds().length;
  const nameFor = id => call.members.get(id)?.name || call.names.get(id) || (call.friend?.user_id === id ? call.friend.name : "")
    || friendsList().find(row => row.user_id === id)?.name || "";
  const mutedOf = id => (call.muteOf.has(id) ? call.muteOf.get(id) : call.members.get(id)?.muted === true);
  const audioTrack = () => call.stream?.getAudioTracks()[0] || null;
  const partner = () => {
    const ids = othersIds();
    return ids.length === 1 ? { user_id: ids[0], name: nameFor(ids[0]) } : call.friend;
  };
  const isGroup = () => call.phase !== "incoming" && othersIds().length >= 2;

  // ——— Начать звонок ———

  async function start(friend, options = {}) {
    if (!friend?.user_id) return false;
    if (call.phase !== "idle") { setExpanded(true); return false; }
    if (!premium()) { app()?.openPaywall?.(); return false; }
    if (!supported()) { toast(tr("unsupported")); return false; }
    const room = crypto.randomUUID();
    Object.assign(call, { phase: "outgoing", room, friend: { user_id: friend.user_id, name: friend.name || "" }, caller: true, note: "", expanded: true, video: VIDEO_CALLS && options?.video === true });
    render();
    if (!(await openMedia(call.video))) { end(tr("micDenied")); return false; }
    if (call.phase !== "outgoing" || call.room !== room) return false;
    call.tracked = true;
    if (!(await joinChannel())) return false;
    try {
      await window.GlowLetterFriends?.sendCallInvite?.(friend.user_id, room);
    } catch (error) {
      console.warn("call invite failed", error);
      end(tr("failed"));
      return false;
    }
    markInvited(friend.user_id);
    startRingback();
    call.ringTimer = setTimeout(() => {
      if (call.phase === "outgoing" && !othersIds().length) { signal("cancel", {}); end(tr("missed", { name: call.friend.name })); }
    }, RING_MS);
    return true;
  }

  // ——— Позвать ещё друга (до четырёх человек) ———

  function markInvited(id) {
    const stamp = Date.now();
    call.invited.set(id, stamp);
    setTimeout(() => { if (call.invited.get(id) === stamp) { call.invited.delete(id); if (call.picking) render(); } }, RING_MS);
  }

  function pickable() {
    const inCall = new Set(othersIds());
    return friendsList()
      .filter(row => row?.user_id && row.user_id !== userId() && !inCall.has(row.user_id))
      .sort((a, b) => Number(Boolean(b.online)) - Number(Boolean(a.online)) || String(a.name).localeCompare(String(b.name)));
  }

  function openPicker() {
    if (!live()) return;
    if (count() >= MAX_PEOPLE) { toast(tr("full")); return; }
    call.picking = true;
    call.pickFocus = true;
    render();
  }

  async function invite(id) {
    if (!live() || !id || call.invited.has(id) || othersIds().includes(id)) return;
    if (count() >= MAX_PEOPLE) { call.picking = false; render(); toast(tr("full")); return; }
    const friend = friendsList().find(row => row.user_id === id);
    if (!friend) return;
    call.names.set(id, friend.name || "");
    markInvited(id);
    call.picking = false;
    render();
    try {
      await window.GlowLetterFriends?.sendCallInvite?.(id, call.room);
      toast(tr("inviteSent", { name: friend.name || "" }));
    } catch (error) {
      console.warn("call invite failed", error);
      call.invited.delete(id);
      render();
      toast(tr("failed"));
    }
  }

  // ——— Входящий (friends.js видит [[call:комната]]) ———

  function incoming(friend, room, createdAt) {
    // Одно и то же приглашение (комната + время) показываем один раз; позвать снова в ту же комнату можно.
    const key = `${room}|${createdAt || ""}`;
    if (!ROOM.test(String(room || "")) || !friend?.user_id || call.seen.has(key) || (call.phase !== "idle" && room === call.room)) return false;
    call.seen.add(key);
    const age = Date.now() - new Date(createdAt || Date.now()).getTime();
    if (age > INVITE_FRESH_MS) return false;
    if (call.phase !== "idle") {
      // Уже разговариваем — позвавший услышит «занято».
      cloud()?.openRoom?.(`glowletter-call:${room}`, room, "call", { broadcast: { self: false } }).then(busy => {
        busy.subscribe(status => {
          if (status !== "SUBSCRIBED") return;
          busy.send({ type: "broadcast", event: "busy", payload: { from: userId(), to: friend.user_id } });
          setTimeout(() => { try { client()?.removeChannel?.(busy); } catch {} }, 1500);
        });
      }).catch(() => {});
      return false;
    }
    Object.assign(call, { phase: "incoming", room, friend: { user_id: friend.user_id, name: friend.name || "" }, caller: false, expanded: true, note: "" });
    call.names.set(friend.user_id, friend.name || "");
    joinChannel();
    startRingtone();
    call.ringTimer = setTimeout(() => { if (call.phase === "incoming") end(""); }, Math.max(5000, RING_MS - age));
    render();
    return true;
  }

  async function accept(withVideo = true) {
    if (call.phase !== "incoming") return;
    stopRing();
    clearTimeout(call.ringTimer);
    if (!supported()) { decline(); toast(tr("unsupported")); return; }
    if (call.members.size >= MAX_PEOPLE) { end(tr("full")); return; }
    call.phase = "connecting";
    call.note = "";
    render();
    if (!(await openMedia(withVideo && call.video))) { signal("decline", {}, call.friend.user_id); end(tr("micDenied")); return; }
    if (call.phase !== "connecting") return;
    call.tracked = true;
    armConnectTimer();
    signal("accept", { name: myName() });
    if (call.subscribed) trackMe();
    onPresence();
  }

  function decline() {
    if (call.phase !== "incoming") return;
    signal("decline", {}, call.friend.user_id);
    end("");
  }

  function hangup(message = tr("ended")) {
    if (call.phase === "idle") return;
    if (call.phase === "outgoing" && !othersIds().length) signal("cancel", {});
    else if (call.phase === "incoming") signal("decline", {}, call.friend.user_id);
    else signal("hangup", {});
    end(message);
  }

  // Первый ответивший — звонящий перестаёт гудеть и начинает соединяться.
  function beginTalking() {
    if (call.phase !== "outgoing") return;
    stopRing();
    clearTimeout(call.ringTimer);
    call.phase = "connecting";
    armConnectTimer();
  }

  function armConnectTimer() {
    clearTimeout(call.connectTimer);
    call.connectTimer = setTimeout(() => {
      if (call.phase === "connecting" && ![...call.peers.values()].some(entry => entry.connected)) hangup(tr("failed"));
    }, CONNECT_MS);
  }

  // ——— Микрофон и камера ———

  async function openMedia(wantVideo) {
    const audio = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
    const relayReady = loadRelay();
    native()?.prepare?.();
    let stream = null;
    if (wantVideo) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio, video: videoConstraints(call.facing) });
      } catch (error) {
        console.warn("camera", error);
      }
    }
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio, video: false });
      } catch (error) {
        console.warn("microphone", error);
        return false;
      }
    }
    if (call.phase === "idle") { stream.getTracks().forEach(track => track.stop()); return false; }
    call.stream = stream;
    call.cameraTrack = stream.getVideoTracks()[0] || null;
    call.camera = Boolean(call.cameraTrack);
    // Камеру не дали (или в приложении её нет) — разговор идёт со звуком.
    if (wantVideo && !call.camera) toast(tr("cameraFailed"));
    stream.getAudioTracks().forEach(track => { track.enabled = !call.muted; });
    if (audioTrack()) meterAdd(userId(), new MediaStream([audioTrack()]));
    await relayReady;
    return true;
  }

  // Видеоканал пары (есть у каждой пары в видеозвонке, даже если камера выключена).
  const videoTransceiver = entry => entry.pc.getTransceivers?.().find(item => item.receiver?.track?.kind === "video" && !item.stopped) || null;

  function setCameraTrack(track) {
    const old = call.cameraTrack;
    call.cameraTrack = track;
    if (old && old !== track) { call.stream?.removeTrack(old); old.stop(); }
    if (track) call.stream?.addTrack(track);
    for (const entry of call.peers.values()) videoTransceiver(entry)?.sender?.replaceTrack(track)?.catch?.(() => {});
  }

  async function openCamera(facing) {
    const media = await navigator.mediaDevices.getUserMedia({ video: videoConstraints(facing), audio: false });
    const track = media.getVideoTracks()[0];
    if (!track) throw new Error("no camera");
    return track;
  }

  async function toggleCamera() {
    if (!call.video || call.phase === "idle" || call.phase === "incoming") return;
    if (call.camera) {
      setCameraTrack(null);
      call.camera = false;
    } else {
      try {
        setCameraTrack(await openCamera(call.facing));
        call.camera = true;
      } catch (error) {
        console.warn("camera", error);
        toast(tr("cameraFailed"));
      }
    }
    if (call.phase === "idle") return;
    signal("camera", { on: call.camera });
    if (call.subscribed) trackMe();
    render();
  }

  // Передняя ↔ задняя камера. Многие телефоны не открывают вторую, пока работает первая, — сначала гасим старую.
  async function flipCamera() {
    if (!call.camera || call.phase === "idle") return;
    const next = call.facing === "user" ? "environment" : "user";
    call.cameraTrack?.stop();
    try {
      setCameraTrack(await openCamera(next));
      call.facing = next;
    } catch (error) {
      console.warn("flip camera", error);
      toast(tr("flipFailed"));
      try { setCameraTrack(await openCamera(call.facing)); }
      catch { setCameraTrack(null); call.camera = false; signal("camera", { on: false }); if (call.subscribed) trackMe(); }
    }
    render();
  }

  // ——— Соединения: по одному на каждого участника ———

  function ensurePeer(id) {
    const existing = call.peers.get(id);
    if (existing) return existing;
    const peer = new RTCPeerConnection({ iceServers: iceServers() });
    const entry = { id, pc: peer, pendingIce: [], audio: null, connected: false, dropTimer: 0, helloTimer: 0, checked: false };
    peer.onicecandidate = event => { if (event.candidate) signal("ice", { candidate: event.candidate.toJSON() }, id); };
    peer.ontrack = event => onRemoteTrack(entry, event.track);
    peer.onconnectionstatechange = () => onPeerState(entry);
    peer.oniceconnectionstatechange = () => { if (peer.iceConnectionState === "failed" && offersTo(id)) restartIce(entry); };
    call.peers.set(id, entry);
    return entry;
  }

  // Подключиться к участнику: offer шлёт меньший id, больший ждёт (и через 5 с напоминает «hello»).
  function connectTo(id) {
    if (!id || id === userId() || !call.tracked || !call.stream || !live()) return;
    if (call.peers.has(id)) return;
    if (offersTo(id)) { makeOffer(id); return; }
    const entry = ensurePeer(id);
    entry.helloTimer = setTimeout(() => {
      if (call.peers.get(id) === entry && !entry.pc.remoteDescription) signal("hello", { name: myName() }, id);
    }, 5000);
  }

  function onRemoteTrack(entry, track) {
    if (call.peers.get(entry.id) !== entry || !track) return;
    if (track.kind === "video") {
      if (!VIDEO_CALLS) return;
      entry.videoTrack = track;
      entry.videoStream = new MediaStream([track]);
      track.onmute = track.onunmute = track.onended = () => renderStage();
      call.video = true;
      renderStage();
      return;
    }
    const stream = new MediaStream([track]);
    if (!entry.audio) {
      entry.audio = document.createElement("audio");
      entry.audio.autoplay = true;
      entry.audio.setAttribute("playsinline", "");
      entry.audio.hidden = true;
      entry.audio.dataset.callAudio = entry.id;
      document.body.append(entry.audio);
    }
    entry.audio.srcObject = stream;
    entry.audio.play?.().catch(() => {});
    meterAdd(entry.id, stream);
  }

  // Свои дорожки — в каналы пары (offer: создаём каналы; answer: заполняем пришедшие).
  async function attachLocal(entry) {
    const transceivers = entry.pc.getTransceivers?.() || [];
    if (!transceivers.length) {
      entry.pc.addTransceiver(audioTrack() || "audio", { direction: "sendrecv", streams: call.stream ? [call.stream] : [] });
      if (call.video) entry.pc.addTransceiver(call.cameraTrack || "video", { direction: "sendrecv", streams: call.stream ? [call.stream] : [] });
      return;
    }
    for (const transceiver of transceivers) {
      const kind = transceiver.receiver?.track?.kind;
      if (transceiver.stopped || !kind) continue;
      if (kind === "video" && VIDEO_CALLS) call.video = true;
      const track = kind === "audio" ? audioTrack() : call.cameraTrack;
      if (!transceiver.sender.track && track) { try { await transceiver.sender.replaceTrack(track); } catch {} }
      try { if (call.stream) transceiver.sender.setStreams?.(call.stream); } catch {}
      transceiver.direction = "sendrecv";
    }
  }

  function onPeerState(entry) {
    if (call.peers.get(entry.id) !== entry) return;
    const stateName = entry.pc.connectionState;
    if (stateName === "connected") {
      clearTimeout(entry.dropTimer);
      entry.connected = true;
      call.sawOthers = true;
      if (!entry.checked) {
        entry.checked = true;
        client()?.rpc?.("glowletter_pair_checkin", { p_friend: entry.id })?.then?.(() => {}, () => {});
      }
      if (call.phase !== "connected") {
        stopRing();
        clearTimeout(call.ringTimer);
        clearTimeout(call.connectTimer);
        call.phase = "connected";
        call.startedAt = call.startedAt || Date.now();
        clearInterval(call.tickTimer);
        call.tickTimer = setInterval(renderTimer, 1000);
        native()?.setActive?.(true);
      }
      call.note = [...call.peers.values()].some(other => other.pc.connectionState === "disconnected") ? tr("reconnecting") : "";
      render();
    } else if (stateName === "disconnected") {
      entry.connected = false;
      call.note = tr("reconnecting");
      render();
      clearTimeout(entry.dropTimer);
      entry.dropTimer = setTimeout(() => { if (entry.pc.connectionState !== "connected") restartIce(entry); }, 4000);
    } else if (stateName === "failed") {
      entry.connected = false;
      if (offersTo(entry.id)) restartIce(entry);
      clearTimeout(entry.dropTimer);
      entry.dropTimer = setTimeout(() => {
        if (call.peers.get(entry.id) !== entry || entry.pc.connectionState === "connected") return;
        removePeer(entry.id);
        if (![...call.peers.values()].some(other => other.connected)) hangup(tr("failed"));
        else { call.note = ""; render(); }
      }, 15000);
    }
  }

  async function makeOffer(id, options = {}) {
    const entry = ensurePeer(id);
    try {
      await attachLocal(entry);
      const offer = await entry.pc.createOffer(options);
      await entry.pc.setLocalDescription(offer);
      signal("offer", { sdp: entry.pc.localDescription.toJSON(), name: myName() }, id);
    } catch (error) {
      console.warn("offer", error);
    }
  }

  function restartIce(entry) {
    if (!offersTo(entry.id) || call.peers.get(entry.id) !== entry || call.phase === "idle") return;
    try { entry.pc.restartIce?.(); } catch {}
    makeOffer(entry.id, { iceRestart: true });
  }

  async function onOffer(payload) {
    const from = payload.from;
    if (!payload.sdp || offersTo(from) || !call.tracked || !call.stream) return;
    beginTalking();
    if (!live()) return;
    if (!call.peers.has(from) && count() >= MAX_PEOPLE) return;
    const entry = ensurePeer(from);
    clearTimeout(entry.helloTimer);
    try {
      await entry.pc.setRemoteDescription(payload.sdp);
      await flushIce(entry);
      await attachLocal(entry);
      const answer = await entry.pc.createAnswer();
      await entry.pc.setLocalDescription(answer);
      signal("answer", { sdp: entry.pc.localDescription.toJSON(), name: myName() }, from);
    } catch (error) {
      console.warn("answer", error);
    }
  }

  async function onAnswer(payload) {
    const entry = call.peers.get(payload.from);
    if (!entry || !payload.sdp || !offersTo(payload.from)) return;
    try {
      await entry.pc.setRemoteDescription(payload.sdp);
      await flushIce(entry);
    } catch (error) {
      console.warn("remote answer", error);
    }
  }

  async function onIce(payload) {
    if (!payload.candidate) return;
    const entry = call.peers.get(payload.from);
    if (!entry) return;
    if (!entry.pc.remoteDescription) { entry.pendingIce.push(payload.candidate); return; }
    try { await entry.pc.addIceCandidate(payload.candidate); } catch {}
  }

  async function flushIce(entry) {
    const list = entry.pendingIce.splice(0);
    for (const candidate of list) { try { await entry.pc.addIceCandidate(candidate); } catch {} }
  }

  function removePeer(id) {
    const entry = call.peers.get(id);
    if (!entry) return;
    if (entry.videoTrack) entry.videoTrack.onmute = entry.videoTrack.onunmute = entry.videoTrack.onended = null;
    call.peers.delete(id);
    clearTimeout(entry.dropTimer);
    clearTimeout(entry.helloTimer);
    try { entry.pc.close(); } catch {}
    if (entry.audio) { entry.audio.srcObject = null; entry.audio.remove(); }
    meterRemove(id);
  }

  // ——— Кто в звонке ———

  function trackMe() {
    if (!call.channel || !call.tracked) return;
    call.joinedAt = call.joinedAt || Date.now();
    try { call.channel.track?.({ user_id: userId(), name: myName(), muted: call.muted, at: call.joinedAt, video: call.video, camera: call.camera })?.catch?.(() => {}); } catch {}
  }

  function readPresence() {
    const state = call.channel?.presenceState?.() || {};
    const next = new Map();
    for (const [key, metas] of Object.entries(state)) {
      const list = Array.isArray(metas) ? metas : [];
      const meta = list[list.length - 1] || {};
      const id = String(meta.user_id || key || "");
      if (!id || id === userId()) continue;
      next.set(id, { name: String(meta.name || "").slice(0, 36), muted: meta.muted === true, at: Number(meta.at) || 0, video: meta.video === true, camera: meta.camera === true });
    }
    return next;
  }

  // Пятый, зашедший одновременно с четвёртым, выходит: порядок — по времени входа, затем по id.
  function overCapacity() {
    if (!call.tracked || !call.joinedAt) return false;
    const all = [...call.members.entries()].map(([id, member]) => ({ id, at: member.at || Infinity }));
    all.push({ id: userId(), at: call.joinedAt });
    all.sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1));
    return all.findIndex(item => item.id === userId()) >= MAX_PEOPLE;
  }

  function onPresence() {
    if (call.phase === "idle" || !call.channel) return;
    const next = readPresence();
    for (const [id, person] of next) window.GlowLetterRanking?.announceAdmin?.(id, person.name, call.room);
    const left = [...call.members.keys()].filter(id => !next.has(id));
    call.members = next;
    for (const [id, member] of next) {
      if (member.name) call.names.set(id, member.name);
      call.muteOf.set(id, member.muted);
      call.camOf.set(id, member.camera);
    }
    if (next.size) call.sawOthers = true;
    if (call.phase === "incoming") {
      if (call.sawOthers && !next.size) { end(""); return; }
      call.note = next.size >= MAX_PEOPLE ? tr("full") : "";
      // Позвали в видеозвонок — видно по присутствию тех, кто уже в звонке.
      call.video = VIDEO_CALLS && [...next.values()].some(member => member.video);
      render();
      return;
    }
    if (!call.tracked) { render(); return; }
    if (overCapacity()) { hangup(tr("full")); return; }
    if (next.size) beginTalking();
    const hadOthers = call.known.size > 0;
    for (const id of next.keys()) {
      noteJoined(id, hadOthers);
      call.invited.delete(id);
      connectTo(id);
    }
    // Пропал из присутствия, но звук ещё идёт — оставляем (присутствие могло мигнуть).
    for (const id of left) {
      if (!call.peers.get(id)?.connected) removePeer(id);
    }
    if (left.length && aloneCheck(left)) return;
    render();
  }

  // «{name} в звонке» — когда к уже идущему разговору присоединяется ещё кто-то.
  function noteJoined(id, hadOthers = call.known.size > 0) {
    if (!id || call.known.has(id)) return;
    call.known.add(id);
    if (hadOthers) toast(tr("joined", { name: nameFor(id) }));
  }

  function onLeft(id) {
    if (!call.members.has(id) && !call.peers.has(id)) return;
    call.members.delete(id);
    removePeer(id);
    if (call.phase === "incoming") {
      if (call.sawOthers && !othersIds().length) end(""); else render();
      return;
    }
    if (!aloneCheck([id])) render();
  }

  // Остался один — звонок закончился. Если нет — короткое «… уже не в звонке».
  function aloneCheck(ids) {
    if (!live() || !call.sawOthers) return false;
    if (!othersIds().length) { end(tr("ended")); return true; }
    for (const id of ids) {
      if (othersIds().includes(id)) continue;
      if (call.known.delete(id)) toast(tr("left", { name: nameFor(id) }));
    }
    return false;
  }

  function onRefused(from, key) {
    call.invited.delete(from);
    const name = nameFor(from);
    if (call.phase === "outgoing" && from === call.friend?.user_id && !othersIds().length) { end(tr(key, { name })); return; }
    if (live()) { toast(tr(key, { name })); if (call.picking) render(); }
  }

  // ——— Сигналы ———

  // Сервер пускает в комнату только позвавшего (с полным доступом) и приглашённых.
  async function joinChannel() {
    const db = client();
    const room = call.room;
    if (!db?.channel || !cloud()?.openRoom) { end(tr("failed")); return false; }
    let channel;
    try {
      channel = await cloud().openRoom(`glowletter-call:${room}`, room, "call", { broadcast: { self: false }, presence: { key: userId() } });
    } catch (error) {
      if (call.room !== room || call.phase === "idle") return false;
      const paywall = call.caller && /premium_required/u.test(String(error?.message || ""));
      end(call.caller && !paywall ? tr("failed") : "");
      if (paywall) app()?.openPaywall?.();
      return false;
    }
    if (call.room !== room || call.phase === "idle") { try { db.removeChannel?.(channel); } catch {} return false; }
    const on = (event, handler) => channel.on("broadcast", { event }, message => {
      const payload = message?.payload;
      if (call.channel !== channel || !forMe(payload)) return;
      if (typeof payload.name === "string" && payload.name) call.names.set(payload.from, payload.name.slice(0, 36));
      handler(payload);
    });
    on("accept", payload => {
      if (!call.tracked) return;
      beginTalking();
      call.invited.delete(payload.from);
      call.sawOthers = true;
      noteJoined(payload.from);
      connectTo(payload.from);
      render();
    });
    on("decline", payload => onRefused(payload.from, "declined"));
    on("busy", payload => onRefused(payload.from, "busy"));
    on("cancel", payload => { if (call.phase === "incoming" && payload.from === call.friend?.user_id) end(""); });
    on("hangup", payload => onLeft(payload.from));
    on("hello", payload => {
      if (!offersTo(payload.from) || !live()) return;
      const entry = call.peers.get(payload.from);
      if (entry && !entry.connected) removePeer(payload.from);
      connectTo(payload.from);
    });
    on("offer", onOffer);
    on("answer", onAnswer);
    on("ice", onIce);
    on("mute", payload => { call.muteOf.set(payload.from, payload.on === true); render(); });
    on("camera", payload => { call.camOf.set(payload.from, payload.on === true); render(); });
    on("react", payload => { if (payload.kind === "heart") heartRain(); });
    on("bear", () => bearHere(false));
    // Кто-то сел за стол во время звонка — открываем стол и здесь.
    on("table", () => { const table = window.GlowLetterTable; if (call.phase === "connected" && !(table?.isOpen?.() && table.room?.() === call.room)) openTable(false); });
    channel.on("presence", { event: "sync" }, () => { if (call.channel === channel) onPresence(); });
    channel.subscribe(status => {
      if (call.channel !== channel || status !== "SUBSCRIBED") return;
      call.subscribed = true;
      trackMe();
      onPresence();
    });
    call.channel = channel;
    return true;
  }

  function signal(event, payload = {}, to = "*") {
    try { call.channel?.send({ type: "broadcast", event, payload: { ...payload, from: userId(), to } }); } catch {}
  }

  // ——— Конец звонка ———

  function end(message) {
    stopRing();
    clearTimeout(call.ringTimer);
    clearTimeout(call.connectTimer);
    clearInterval(call.tickTimer);
    for (const id of [...call.peers.keys()]) removePeer(id);
    meterStop();
    call.stream?.getTracks().forEach(track => track.stop());
    call.cameraTrack?.stop();
    const channel = call.channel;
    if (channel) {
      try { channel.untrack?.()?.catch?.(() => {}); } catch {}
      setTimeout(() => { try { client()?.removeChannel?.(channel); } catch {} }, 800);
    }
    native()?.setActive?.(false);
    Object.assign(call, {
      phase: "idle", stream: null, channel: null, subscribed: false, tracked: false, muted: false, startedAt: 0, joinedAt: 0,
      sawOthers: false, picking: false, note: "", members: new Map(), names: new Map(), invited: new Map(), muteOf: new Map(), known: new Set(),
      video: false, camera: false, facing: "user", cameraTrack: null, camOf: new Map()
    });
    // «Игровой стол» не закрываем: партию можно доиграть и без звонка.
    render();
    if (message) toast(message);
  }

  // ——— Во время звонка ———

  function toggleMute() {
    call.muted = !call.muted;
    call.stream?.getAudioTracks().forEach(track => { track.enabled = !call.muted; });
    signal("mute", { on: call.muted });
    if (call.subscribed) trackMe();
    render();
  }

  // Сердечки разлетаются по всему экрану — у всех.
  function heartRain() {
    const online = window.GlowLetterOnline;
    online?.burst?.("❤️");
    setTimeout(() => online?.burst?.("💗", { small: true }), 180);
  }

  function sendHeart() {
    heartRain();
    const disc = call.root?.querySelector(".glk-heart .glk-disc");
    if (disc) { disc.classList.remove("is-pop"); void disc.offsetWidth; disc.classList.add("is-pop"); }
    signal("react", { kind: "heart" });
  }

  function sendBear() {
    bearHere(true);
    window.GlowLetterOnline?.burst?.("🧸", { small: true });
    signal("bear", {});
  }

  function bearHere(mine) {
    const node = call.root?.querySelector(".glk-bear");
    if (node) {
      node.classList.remove("is-on");
      void node.offsetWidth;
      node.classList.add("is-on");
    }
    if (!mine) window.GlowLetterOnline?.burst?.("🧸", { small: true });
  }

  // Все участники звонка по времени входа (у всех одинаковый порядок) — для «Игрового стола».
  function participants() {
    const others = othersIds()
      .map(id => ({ user_id: id, name: nameFor(id), at: call.members.get(id)?.at || Infinity }))
      .sort((a, b) => a.at - b.at || (a.user_id < b.user_id ? -1 : 1))
      .slice(0, MAX_PEOPLE - 1);
    return [...others, { user_id: userId(), name: myName(), at: call.joinedAt || Infinity }]
      .sort((a, b) => a.at - b.at || (a.user_id < b.user_id ? -1 : 1))
      .map(({ user_id, name }) => ({ user_id, name }));
  }

  function openTable(invite = true) {
    const friend = partner();
    if (!friend?.user_id) return;
    setExpanded(false);
    window.GlowLetterTable?.open?.({ room: call.room, friend: { user_id: friend.user_id, name: friend.name }, players: participants() });
    if (invite) signal("table", {});
  }

  // ——— Кто говорит: уровень звука каждого (AnalyserNode), раз в ~120 мс через requestAnimationFrame ———

  function meterAdd(id, stream) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext || !stream || !id) return;
      const meter = call.meter;
      meter.context = meter.context || new AudioContext();
      if (meter.context.state === "suspended") meter.context.resume?.().catch?.(() => {});
      meterRemove(id);
      const source = meter.context.createMediaStreamSource(stream);
      const analyser = meter.context.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);
      meter.nodes.set(id, { source, analyser, data: new Uint8Array(analyser.fftSize), until: 0, speaking: false });
      if (!meter.raf) meter.raf = requestAnimationFrame(meterTick);
    } catch (error) {
      console.warn("call meter", error);
    }
  }

  function meterRemove(id) {
    const node = call.meter.nodes.get(id);
    if (!node) return;
    try { node.source.disconnect(); } catch {}
    call.meter.nodes.delete(id);
  }

  function meterTick(now) {
    const meter = call.meter;
    meter.raf = 0;
    if (call.phase === "idle" || !meter.nodes.size) return;
    if (now - meter.last >= METER_MS) {
      meter.last = now;
      let loudest = 0;
      for (const [id, node] of meter.nodes) {
        node.analyser.getByteTimeDomainData(node.data);
        let sum = 0;
        for (let index = 0; index < node.data.length; index += 1) { const value = (node.data[index] - 128) / 128; sum += value * value; }
        const quiet = id === userId() ? call.muted : mutedOf(id);
        const level = Math.sqrt(sum / node.data.length);
        if (!quiet) loudest = Math.max(loudest, level);
        if (!quiet && level > SPEAK_LEVEL) node.until = now + 350;
        const speaking = node.until > now;
        if (speaking !== node.speaking) { node.speaking = speaking; markSpeaking(id, speaking); }
      }
      // Звуковая волна под именем — от громкости голоса (тишина — ровная линия).
      call.root?.querySelector(".glk-wave")?.style.setProperty("--lvl", Math.min(1, loudest * 9).toFixed(2));
    }
    meter.raf = requestAnimationFrame(meterTick);
  }

  function markSpeaking(id, on) {
    call.root?.querySelectorAll("[data-member]").forEach(node => { if (node.dataset.member === id) node.classList.toggle("is-speaking", on); });
  }

  const speaking = id => Boolean(call.meter.nodes.get(id)?.speaking);

  function meterStop() {
    const meter = call.meter;
    if (meter.raf) cancelAnimationFrame(meter.raf);
    for (const id of [...meter.nodes.keys()]) meterRemove(id);
    try { meter.context?.close?.(); } catch {}
    Object.assign(meter, { context: null, raf: 0, last: 0 });
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
    // Видео живёт в отдельном слое, который не перерисовывается вместе с кнопками.
    // Фон — настоящая фотография (домик, Тёпа, фонарики, луна); тоже не перерисовывается.
    root.innerHTML = '<div class="glk-bg" aria-hidden="true"><img src="assets/scenes/call-cabin-moon.webp" alt="" decoding="async"><i class="glk-glow is-a"></i><i class="glk-glow is-b"></i><i class="glk-glow is-c"></i><i class="glk-glow is-d"></i><i class="glk-spark"></i><i class="glk-spark"></i><i class="glk-spark"></i><i class="glk-spark"></i><i class="glk-spark"></i></div><div class="glk-stage" hidden><div class="glk-tiles"></div><div class="glk-self" hidden><video autoplay playsinline muted></video></div></div><div class="glk-ui"></div>';
    call.stage = root.querySelector(".glk-stage");
    call.self = root.querySelector(".glk-self");
    call.ui = root.querySelector(".glk-ui");
    root.addEventListener("click", event => {
      const button = event.target.closest("[data-call]");
      if (!button || button.disabled) return;
      const action = button.dataset.call;
      if (action === "accept") accept(true);
      else if (action === "accept-audio") accept(false);
      else if (action === "camera") toggleCamera();
      else if (action === "flip") flipCamera();
      else if (action === "decline") decline();
      else if (action === "hangup") hangup();
      else if (action === "mute") toggleMute();
      else if (action === "heart") sendHeart();
      else if (action === "bear") sendBear();
      else if (action === "play") openTable();
      else if (action === "add") openPicker();
      else if (action === "invite") invite(button.dataset.id);
      else if (action === "pick-close") { call.picking = false; render(); }
      else if (action === "min") setExpanded(false);
      else if (action === "expand") setExpanded(true);
    });
    root.addEventListener("keydown", event => {
      if (event.key === "Escape" && call.picking) { call.picking = false; render(); }
    });
    document.body.append(root);
    call.root = root;
    return root;
  }

  function setExpanded(value) {
    call.expanded = value;
    if (!value) call.picking = false;
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

  function bearPicture(id) {
    const outfit = window.GlowLetterCouple?.bearFor?.(id);
    const picture = window.GlowLetterCouple?.outfits?.find(item => item.id === outfit)?.picture || "s28d";
    return `assets/loves/${picture}.webp`;
  }

  // Значки звонка: свои рисунки вместо смайликов, чтобы экран выглядел цельно.
  const ICON = Object.freeze({
    mic: '<svg class="glk-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8.6" y="2.8" width="6.8" height="11.6" rx="3.4" fill="currentColor"/><path d="M5.4 11.2a6.6 6.6 0 0 0 13.2 0M12 17.8v3.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    micOff: '<svg class="glk-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8.6" y="2.8" width="6.8" height="11.6" rx="3.4" fill="currentColor"/><path d="M5.4 11.2a6.6 6.6 0 0 0 13.2 0M12 17.8v3.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 3.5 20 20.5" stroke="var(--glk-cut, #1b1726)" stroke-width="4.4" stroke-linecap="round"/><path d="M4 3.5 20 20.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    heart: '<svg class="glk-ic glk-heart-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><linearGradient id="glkHeart" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a70"/><stop offset="1" stop-color="#d7102f"/></linearGradient></defs><path d="M12 20.6 4.5 13.2a4.7 4.7 0 0 1 6.6-6.7l.9.9.9-.9a4.7 4.7 0 0 1 6.6 6.7Z" fill="url(#glkHeart)"/><path d="M7.4 8.6a2.2 2.2 0 0 1 2.4-.9" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/></svg>',
    play: '<svg class="glk-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.2 7h9.6a4.6 4.6 0 0 1 4.5 3.7l.9 4.6a2.9 2.9 0 0 1-5 2.5L15.6 16H8.4l-1.6 1.8a2.9 2.9 0 0 1-5-2.5l.9-4.6A4.6 4.6 0 0 1 7.2 7Z" fill="currentColor"/><path d="M7.6 10v3.4M5.9 11.7h3.4" stroke="var(--glk-cut, #1b1726)" stroke-width="1.7" stroke-linecap="round"/><circle cx="15.6" cy="10.6" r="1.05" fill="var(--glk-cut, #1b1726)"/><circle cx="17.6" cy="12.8" r="1.05" fill="var(--glk-cut, #1b1726)"/></svg>',
    phone: '<svg class="glk-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 3.6h2.6l1.5 4.1-1.9 1.4a11 11 0 0 0 5.9 5.9l1.4-1.9 4.1 1.5v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.8a2 2 0 0 1 2-2.2Z" fill="currentColor"/></svg>',
    add: '<svg class="glk-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="9.5" cy="8" r="3.8" fill="currentColor"/><path d="M2.6 20.2a6.9 6.9 0 0 1 13.8 0Z" fill="currentColor"/><path d="M19 7.4v6.4M15.8 10.6h6.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    camera: '<svg class="glk-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2.4" y="6.2" width="13.4" height="11.6" rx="3" fill="currentColor"/><path d="M16.9 10.3 21.6 7.5v9l-4.7-2.8Z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    cameraOff: '<svg class="glk-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2.4" y="6.2" width="13.4" height="11.6" rx="3" fill="currentColor"/><path d="M16.9 10.3 21.6 7.5v9l-4.7-2.8Z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M4 3.5 20 20.5" stroke="var(--glk-cut, #1b1726)" stroke-width="4.4" stroke-linecap="round"/><path d="M4 3.5 20 20.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    flip: '<svg class="glk-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.3 5.4 9.6 3.8h4.8l1.3 1.6H19a2.2 2.2 0 0 1 2.2 2.2v9.6A2.2 2.2 0 0 1 19 19.4H5a2.2 2.2 0 0 1-2.2-2.2V7.6A2.2 2.2 0 0 1 5 5.4Z" fill="currentColor"/><path d="M8.3 12.2a3.7 3.7 0 0 1 6.5-2.4M15.7 12.6a3.7 3.7 0 0 1-6.5 2.4" fill="none" stroke="var(--glk-cut, #1b1726)" stroke-width="1.7" stroke-linecap="round"/><path d="M15.3 7.6v2.5h-2.5M8.7 17.2v-2.5h2.5" fill="none" stroke="var(--glk-cut, #1b1726)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg class="glk-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  });

  function renderPeople() {
    // На экране «Вы» — последним.
    const list = participants().sort((a, b) => Number(a.user_id === userId()) - Number(b.user_id === userId()));
    return `<ul class="glk-people" data-count="${list.length}">${list.map(person => {
      const mine = person.user_id === userId();
      const name = mine ? tr("you") : person.name;
      const muted = mine ? call.muted : mutedOf(person.user_id);
      return `<li class="glk-person${speaking(person.user_id) ? " is-speaking" : ""}${mine ? " is-me" : ""}" data-member="${escapeHtml(person.user_id)}">
        <span class="glk-face" aria-hidden="true">${initial(mine ? person.name || name : name)}${muted ? `<span class="glk-badge">${ICON.micOff}</span>` : ""}</span>
        <b class="glk-person-name">${escapeHtml(name)}</b>
        ${muted && !mine ? `<span class="glk-sr">${escapeHtml(tr("friendMuted", { name }))}</span>` : ""}
      </li>`;
    }).join("")}</ul>`;
  }

  function renderPicker() {
    const list = pickable();
    return `
      <div class="glk-sheet" role="dialog" aria-modal="true" aria-label="${escapeHtml(tr("addTitle"))}">
        <div class="glk-sheet-head">
          <h3>${escapeHtml(tr("addTitle"))}</h3>
          <button class="glk-sheet-close" type="button" data-call="pick-close" aria-label="${escapeHtml(tr("close"))}">${ICON.close}</button>
        </div>
        ${list.length ? `<ul class="glk-pick-list">${list.map(row => {
          const waiting = call.invited.has(row.user_id);
          return `<li><button class="glk-pick${row.online ? " is-online" : ""}" type="button" data-call="invite" data-id="${escapeHtml(row.user_id)}" ${waiting ? "disabled" : ""}>
            <span class="glk-pick-face" aria-hidden="true">${initial(row.name)}</span>
            <span class="glk-pick-name">${escapeHtml(row.name)}</span>
            ${waiting ? `<small>${escapeHtml(tr("invited"))}</small>` : `<span class="glk-pick-plus" aria-hidden="true">${ICON.add}</span>`}
          </button></li>`;
        }).join("")}</ul>` : `<p class="glk-sheet-empty">${escapeHtml(tr("addNone"))}</p>`}
      </div>`;
  }

  function render() {
    const root = mount();
    document.body.classList.toggle("glk-active", call.phase !== "idle");
    if (call.phase === "idle") { root.hidden = true; call.ui.innerHTML = ""; renderStage(); return; }
    root.hidden = false;
    const group = isGroup();
    const who = partner() || { user_id: "", name: "" };
    const status = call.note || {
      outgoing: call.video ? `${tr("videoCall")} · ${tr("calling")}` : tr("calling"),
      incoming: call.members.size >= 2 ? tr("groupRinging", { name: call.friend?.name || "" }) : call.video ? tr("incomingVideo") : tr("incoming"),
      connecting: tr("connecting"), connected: tr("connected")
    }[call.phase] || "";
    const canTalk = live();
    const title = group ? tr("groupCall", { n: count() }) : tr("inCall", { name: who.name || "" });
    if (!call.expanded && call.phase !== "incoming") {
      root.className = "glk is-mini";
      renderStage();
      call.ui.innerHTML = `
        <button class="glk-pill" type="button" data-call="expand" aria-label="${escapeHtml(tr("expand"))}">
          <span class="glk-dot" aria-hidden="true"></span><b>${escapeHtml(title)}</b><span class="glk-time">${elapsed()}</span>
        </button>
        <button class="glk-round glk-mute${call.muted ? " is-on" : ""}" type="button" data-call="mute" aria-pressed="${call.muted}" aria-label="${escapeHtml(call.muted ? tr("unmute") : tr("mute"))}">${call.muted ? ICON.micOff : ICON.mic}</button>
        <button class="glk-round glk-end" type="button" data-call="hangup" aria-label="${escapeHtml(tr("hangup"))}"><span class="glk-phone">${ICON.phone}</span></button>`;
      return;
    }
    const active = document.activeElement && root.contains(document.activeElement) ? document.activeElement : null;
    const focused = active?.dataset?.call ? `[data-call="${active.dataset.call}"]${active.dataset.id ? `[data-id="${CSS.escape(active.dataset.id)}"]` : ""}` : "";
    const videoOn = videoStageOn() && othersIds().length > 0;
    root.className = `glk is-full is-${call.phase}${group ? " is-group" : ""}${videoOn ? " is-video" : ""}`;
    const full = count() >= MAX_PEOPLE;
    const incomingTitle = call.video ? tr("incomingVideo") : tr("incoming");
    const tagline = String(window.GlowLetterApp?.text?.("brand") || "").replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
    const wave = `<span class="glk-wave" aria-hidden="true">${"<i></i>".repeat(17)}</span>`;
    const line = call.phase === "connected" && !call.note ? `<span class="glk-time">${elapsed()}</span>` : `${escapeHtml(status)} <span class="glk-time">${call.phase === "connected" ? elapsed() : ""}</span>`;
    call.ui.innerHTML = `
      <div class="glk-brand" aria-hidden="true"><b>GlowLetter<svg viewBox="0 0 24 24"><path d="M12 20.7 4.3 13a4.6 4.6 0 0 1 6.5-6.5l1.2 1.2 1.2-1.2A4.6 4.6 0 0 1 19.7 13Z"/></svg></b>${tagline ? `<small>${escapeHtml(tagline)}</small>` : ""}</div>
      <div class="glk-card" role="dialog" aria-modal="false" aria-label="${escapeHtml(call.phase === "incoming" ? tr("ringing", { name: call.friend?.name || "" }) : title)}">
        ${call.phase !== "connected" ? "" : `<button class="glk-add" type="button" data-call="add" ${full ? "disabled" : ""} aria-label="${escapeHtml(full ? tr("full") : tr("addTitle"))}"><span class="glk-add-ic">${ICON.add}</span><span>${escapeHtml(tr("add"))}</span></button>`}
        ${call.phase === "incoming" ? "" : `<button class="glk-min" type="button" data-call="min" aria-label="${escapeHtml(tr("minimize"))}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`}
        ${group ? `
          <h2 class="glk-name glk-group-title">${escapeHtml(tr("groupTitle"))}</h2>
          <p class="glk-status">${line}</p>
          ${wave}
          ${renderPeople()}` : `
          <div class="glk-avatar${call.phase === "incoming" || call.phase === "outgoing" ? " is-ringing" : ""}${speaking(who.user_id) ? " is-speaking" : ""}" data-member="${escapeHtml(who.user_id || "")}"><img src="${escapeHtml(bearPicture(who.user_id))}" alt="" loading="lazy"><span class="glk-bear" aria-hidden="true">🧸</span><span class="glk-avatar-heart" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20.7 4.3 13a4.6 4.6 0 0 1 6.5-6.5l1.2 1.2 1.2-1.2A4.6 4.6 0 0 1 19.7 13Z"/></svg></span></div>
          <h2 class="glk-name">${escapeHtml(who.name || "")}</h2>
          <p class="glk-status">${line}</p>
          ${wave}
          ${call.phase !== "incoming" && who.user_id && mutedOf(who.user_id) ? `<p class="glk-muted-note">${escapeHtml(tr("friendMuted", { name: who.name || "" }))}</p>` : ""}`}
        ${call.phase === "incoming" ? `
          <div class="glk-answer" aria-label="${escapeHtml(incomingTitle)}">
            <button class="glk-big glk-decline" type="button" data-call="decline"><span class="glk-phone">${ICON.phone}</span><span>${escapeHtml(tr("decline"))}</span></button>
            ${call.video
              ? `<button class="glk-big glk-accept" type="button" data-call="accept"><span class="glk-phone">${ICON.camera}</span><span>${escapeHtml(tr("acceptVideo"))}</span></button>`
              : `<button class="glk-big glk-accept" type="button" data-call="accept"><span class="glk-phone">${ICON.phone}</span><span>${escapeHtml(tr("accept"))}</span></button>`}
          </div>
          ${call.video ? `<button class="glk-answer-audio" type="button" data-call="accept-audio"><span class="glk-phone">${ICON.phone}</span><span>${escapeHtml(tr("acceptAudio"))}</span></button>` : ""}` : `
          <div class="glk-tools${call.video ? " is-six" : ""}">
            <button class="glk-tool glk-mic${call.muted ? " is-on" : ""}" type="button" data-call="mute" aria-pressed="${call.muted}"><span class="glk-disc">${call.muted ? ICON.micOff : ICON.mic}</span><span>${escapeHtml(call.muted ? tr("unmute") : tr("mute"))}</span></button>
            ${call.video ? `<button class="glk-tool glk-cam${call.camera ? "" : " is-off"}" type="button" data-call="camera" aria-pressed="${!call.camera}"><span class="glk-disc">${call.camera ? ICON.camera : ICON.cameraOff}</span><span>${escapeHtml(call.camera ? tr("cameraOff") : tr("cameraOn"))}</span></button>
            <button class="glk-tool glk-flip" type="button" data-call="flip" ${call.camera ? "" : "disabled"}><span class="glk-disc">${ICON.flip}</span><span>${escapeHtml(tr("flip"))}</span></button>` : ""}
            <button class="glk-tool glk-heart" type="button" data-call="heart" ${canTalk ? "" : "disabled"}><span class="glk-disc">${ICON.heart}</span><span>${escapeHtml(tr("hearts"))}</span></button>
            <button class="glk-tool glk-teddy" type="button" data-call="bear" ${canTalk ? "" : "disabled"}><span class="glk-disc"><span class="glk-emoji">🧸</span></span><span>${escapeHtml(tr("bear"))}</span></button>
            <button class="glk-tool glk-play" type="button" data-call="play" ${canTalk ? "" : "disabled"}><span class="glk-disc"><span class="glk-emoji">🎲</span></span><span>${escapeHtml(tr("play"))}</span></button>
          </div>
          <button class="glk-hang" type="button" data-call="hangup"><span class="glk-phone">${ICON.phone}</span><span>${escapeHtml(tr("hangup"))}</span></button>`}
        ${call.picking && call.phase !== "incoming" ? renderPicker() : ""}
      </div>`;
    renderStage();
    if (call.phase === "incoming") root.querySelector("[data-call=accept]")?.focus({ preventScroll: true });
    else if (call.picking && call.pickFocus) { call.pickFocus = false; root.querySelector(".glk-sheet .glk-pick:not(:disabled), .glk-sheet-close")?.focus({ preventScroll: true }); }
    else if (focused) root.querySelector(focused)?.focus({ preventScroll: true });
  }

  // ——— Видео: плитки остальных (до трёх, сеткой 2×2) и своё маленькое зеркальное окошко ———

  const videoStageOn = () => call.video && call.expanded && call.phase !== "idle" && call.phase !== "incoming";

  function renderStage() {
    const stage = call.stage;
    if (!stage) return;
    const on = videoStageOn();
    const ids = on ? participants().map(person => person.user_id).filter(id => id !== userId()) : [];
    for (const [id, tile] of call.tiles) {
      if (ids.includes(id)) continue;
      tile.video.srcObject = null;
      tile.node.remove();
      call.tiles.delete(id);
    }
    const box = stage.querySelector(".glk-tiles");
    ids.forEach((id, index) => {
      let tile = call.tiles.get(id);
      if (!tile) {
        const node = document.createElement("div");
        node.className = "glk-tile";
        node.dataset.member = id;
        node.innerHTML = '<video autoplay playsinline muted></video><span class="glk-face" aria-hidden="true"></span><b class="glk-tile-name"></b><span class="glk-badge" hidden></span>';
        tile = { node, video: node.querySelector("video") };
        call.tiles.set(id, tile);
      }
      if (box.children[index] !== tile.node) box.insertBefore(tile.node, box.children[index] || null);
      const entry = call.peers.get(id);
      const track = entry?.videoTrack;
      const showing = Boolean(track && track.readyState !== "ended" && !track.muted && call.camOf.get(id) !== false);
      if (showing && tile.video.srcObject !== entry.videoStream) { tile.video.srcObject = entry.videoStream; tile.video.play?.().catch(() => {}); }
      if (!showing && tile.video.srcObject) tile.video.srcObject = null;
      tile.node.classList.toggle("is-cam", showing);
      tile.node.classList.toggle("is-speaking", speaking(id));
      const name = nameFor(id);
      tile.node.querySelector(".glk-face").textContent = Array.from(String(name || "").trim())[0]?.toUpperCase() || "♡";
      tile.node.querySelector(".glk-tile-name").textContent = name;
      const badge = tile.node.querySelector(".glk-badge");
      badge.hidden = !mutedOf(id);
      if (!badge.hidden && !badge.firstChild) badge.innerHTML = ICON.micOff;
    });
    stage.dataset.count = String(ids.length);
    const selfOn = on && call.camera && Boolean(call.cameraTrack);
    const selfVideo = call.self.querySelector("video");
    call.self.hidden = !selfOn;
    call.self.classList.toggle("is-mirror", call.facing === "user");
    if (selfOn) {
      if (selfVideo.srcObject?.getVideoTracks?.()[0] !== call.cameraTrack) { selfVideo.srcObject = new MediaStream([call.cameraTrack]); selfVideo.play?.().catch(() => {}); }
    } else if (selfVideo.srcObject) selfVideo.srcObject = null;
    stage.hidden = !(ids.length || selfOn);
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

  addEventListener("pagehide", () => { if (call.phase !== "idle" && call.phase !== "incoming") signal("hangup", {}); });

  window.GlowLetterCall = Object.freeze({
    // start(friend) — звонок со звуком; start(friend, { video: true }) — видеозвонок.
    start: (friend, options) => start(friend, options),
    incoming,
    hangup: () => hangup(),
    active: () => call.phase !== "idle",
    room: () => call.room,
    count: () => (call.phase === "idle" ? 0 : count()),
    participants: () => (call.phase === "idle" ? [] : participants()),
    maxPeople: MAX_PEOPLE,
    supported,
    text: (key, values) => tr(key, values)
  });
})();
