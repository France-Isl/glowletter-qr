/*
  «Голосовое письмо» (2.4.22): запись голоса с микрофона прямо в приложении.

  Запись идёт через MediaRecorder, потом переводится в WAV (моно, 22 кГц) —
  этот формат уже принимают сервер и проигрыватель письма, поэтому дальше
  голос едет по тому же пути, что и своё аудио из файла. Не больше 2 минут.
*/
(() => {
  "use strict";

  if (window.GlowLetterVoice) return;

  const MAX_SECONDS = 120;
  const SAMPLE_RATE = 22050;
  const ANCHORS = ["#customTrackButton", "#setupAudioButton", "#publicationAudioButton"];
  const MIC = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.8 11.5a6.2 6.2 0 0 0 12.4 0M12 17.7v3"/></svg>';

  const app = () => window.GlowLetterApp || null;
  const t = key => app()?.text?.(key) || key;
  // В приложении из Google Play микрофон есть только в сборках, где есть мост NurMicrophone.
  const inOldAndroidApp = () => location.hostname === "appassets.androidplatform.net" && typeof window.NurMicrophone?.available !== "function";
  const supported = () => !inOldAndroidApp() && Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && (window.AudioContext || window.webkitAudioContext));

  const state = { root: null, stream: null, recorder: null, chunks: [], started: 0, ticker: 0, stopTimer: 0, file: null, url: "", phase: "idle", lastFocus: null };

  function mount() {
    if (state.root) return state.root;
    const root = document.createElement("div");
    root.className = "glv-layer";
    root.hidden = true;
    root.innerHTML = `
      <button class="glv-backdrop" type="button" data-voice="close" tabindex="-1" aria-hidden="true"></button>
      <section class="glv-card" role="dialog" aria-modal="true" aria-labelledby="glvTitle">
        <button class="glv-close" type="button" data-voice="close"><span aria-hidden="true">×</span></button>
        <div class="glv-mic" aria-hidden="true">${MIC}</div>
        <h2 id="glvTitle"></h2>
        <p class="glv-lead"></p>
        <p class="glv-status" role="status" aria-live="polite"></p>
        <audio class="glv-preview" controls hidden></audio>
        <div class="glv-actions"></div>
      </section>`;
    root.addEventListener("click", event => {
      const target = event.target.closest("[data-voice]");
      if (target) onAction(target.dataset.voice);
    });
    root.addEventListener("keydown", event => { if (event.key === "Escape") { event.stopPropagation(); close(); } });
    document.body.append(root);
    state.root = root;
    return root;
  }

  function open() {
    const root = mount();
    state.lastFocus = document.activeElement;
    state.phase = supported() ? "idle" : "unsupported";
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add("is-open"));
    render();
  }

  function close() {
    stopStream();
    clearInterval(state.ticker);
    clearTimeout(state.stopTimer);
    if (state.recorder?.state === "recording") { state.recorder.onstop = null; state.recorder.stop(); }
    state.recorder = null;
    if (state.url) URL.revokeObjectURL(state.url);
    Object.assign(state, { url: "", file: null, phase: "idle" });
    if (!state.root) return;
    state.root.classList.remove("is-open");
    setTimeout(() => { if (!state.root.classList.contains("is-open")) state.root.hidden = true; }, 240);
    state.lastFocus?.focus?.({ preventScroll: true });
  }

  const clock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

  function render() {
    const root = state.root;
    if (!root) return;
    root.querySelector("#glvTitle").textContent = t("voiceTitle");
    root.querySelector(".glv-lead").textContent = t("voiceLead");
    root.querySelector(".glv-close").setAttribute("aria-label", t("close"));
    root.classList.toggle("is-recording", state.phase === "recording");
    const status = root.querySelector(".glv-status");
    const preview = root.querySelector(".glv-preview");
    preview.hidden = state.phase !== "ready";
    if (state.phase === "ready" && preview.src !== state.url) preview.src = state.url;
    const button = (action, label, primary = false) => `<button class="${primary ? "glv-primary" : "glv-secondary"}" type="button" data-voice="${action}">${label}</button>`;
    const actions = root.querySelector(".glv-actions");
    if (state.phase === "unsupported") { status.textContent = t("voiceUnsupported"); actions.innerHTML = button("close", t("close")); return; }
    if (state.phase === "denied") { status.textContent = t("voiceDenied"); actions.innerHTML = button("start", t("voiceStart"), true); return; }
    if (state.phase === "recording") { status.textContent = t("voiceRecording").replace("{time}", clock((Date.now() - state.started) / 1000)); actions.innerHTML = button("stop", `■ ${t("voiceStop")}`, true); return; }
    if (state.phase === "working") { status.textContent = "…"; actions.innerHTML = ""; return; }
    if (state.phase === "ready") { status.textContent = ""; actions.innerHTML = button("start", `↻ ${t("voiceAgain")}`) + button("use", t("voiceUse"), true); return; }
    status.textContent = "";
    actions.innerHTML = button("start", `● ${t("voiceStart")}`, true);
  }

  function onAction(action) {
    if (action === "close") close();
    else if (action === "start") start();
    else if (action === "stop") stop();
    else if (action === "use") use();
  }

  function stopStream() {
    state.stream?.getTracks?.().forEach(track => track.stop());
    state.stream = null;
  }

  async function start() {
    if (!supported()) { state.phase = "unsupported"; render(); return; }
    if (state.url) { URL.revokeObjectURL(state.url); state.url = ""; state.file = null; }
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      state.phase = "denied";
      render();
      return;
    }
    state.chunks = [];
    state.recorder = new MediaRecorder(state.stream);
    state.recorder.ondataavailable = event => { if (event.data?.size) state.chunks.push(event.data); };
    state.recorder.onstop = finish;
    state.recorder.start(250);
    state.started = Date.now();
    state.phase = "recording";
    render();
    clearInterval(state.ticker);
    state.ticker = setInterval(() => { if (state.phase === "recording") render(); }, 500);
    clearTimeout(state.stopTimer);
    state.stopTimer = setTimeout(stop, MAX_SECONDS * 1000);
  }

  function stop() {
    clearInterval(state.ticker);
    clearTimeout(state.stopTimer);
    if (state.recorder?.state === "recording") {
      state.phase = "working";
      render();
      state.recorder.stop();
    }
  }

  async function finish() {
    stopStream();
    try {
      const recorded = new Blob(state.chunks, { type: state.recorder?.mimeType || "audio/webm" });
      const wav = await toWav(recorded);
      state.file = new File([wav], `${t("voiceName")}.wav`, { type: "audio/wav" });
      state.url = URL.createObjectURL(state.file);
      state.phase = "ready";
    } catch {
      state.phase = "unsupported";
    }
    render();
  }

  // Любой формат записи браузера → WAV: моно, 16 бит, 22 кГц.
  async function toWav(blob) {
    const Context = window.AudioContext || window.webkitAudioContext;
    const context = new Context();
    try {
      const decoded = await context.decodeAudioData(await blob.arrayBuffer());
      const seconds = Math.min(decoded.duration, MAX_SECONDS);
      const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(seconds * SAMPLE_RATE)), SAMPLE_RATE);
      const source = offline.createBufferSource();
      source.buffer = decoded;
      source.connect(offline.destination);
      source.start();
      const samples = (await offline.startRendering()).getChannelData(0);
      const buffer = new ArrayBuffer(44 + samples.length * 2);
      const view = new DataView(buffer);
      const text = (offset, value) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
      text(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); text(8, "WAVE");
      text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
      view.setUint32(24, SAMPLE_RATE, true); view.setUint32(28, SAMPLE_RATE * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
      text(36, "data"); view.setUint32(40, samples.length * 2, true);
      samples.forEach((sample, index) => view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true));
      return new Blob([buffer], { type: "audio/wav" });
    } finally {
      context.close?.();
    }
  }

  async function use() {
    if (!state.file) return;
    const file = state.file;
    state.file = null;
    close();
    await app()?.useAudioFile?.(file);
    app()?.notify?.(t("voiceAttached"), 3200);
  }

  // Кнопка «Записать голос» рядом с каждой кнопкой «Своё аудио».
  function addButtons() {
    if (inOldAndroidApp()) return;
    ANCHORS.forEach(selector => {
      const anchor = document.querySelector(selector);
      if (!anchor || anchor.nextElementSibling?.classList.contains("glv-open")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "glv-open";
      button.innerHTML = `${MIC}<span></span>`;
      button.addEventListener("click", open);
      anchor.after(button);
    });
    localize();
  }

  function localize() {
    document.querySelectorAll(".glv-open span").forEach(node => { node.textContent = t("voiceRecord"); });
    render();
  }

  addButtons();
  addEventListener("glowletter-language-changed", () => setTimeout(localize, 0));
  window.GlowLetterVoice = Object.freeze({ open });
})();
