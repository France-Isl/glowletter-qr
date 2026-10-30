/*
  «Тёпа читает письмо» (2.4.24).

  Пока письмо звучит вслух (кнопка «Читать» в app.js), внизу экрана сидит
  мишка Тёпа и показывает фразу, которую сейчас слышно. Отсюда же можно
  сохранить вертикальное видео: Тёпа, имена и текст письма по фразам. Голос
  телефона в видео записать нельзя, поэтому звук в видео — только своё аудио
  письма, если человек его прикрепил. Видео — с полным доступом. Тексты —
  из couple.js (GlowLetterCouple.text).
*/
(() => {
  "use strict";

  if (window.GlowLetterBearReader) return;

  const PICTURE = "assets/loves/s28d.webp";
  const VIDEO = Object.freeze({ width: 720, height: 1280, fps: 30, maxSeconds: 180, bits: 1_200_000 });
  const state = { root: null, text: "", sentences: [], index: 0, timer: 0, startedAt: 0, recording: false };

  const app = () => window.GlowLetterApp || null;
  const tr = (key, values) => window.GlowLetterCouple?.text?.(key, values) || key;
  const premium = () => Boolean(app()?.getState?.().premium);
  const rtl = () => window.GlowLetterCouple?.language?.() === "ar";
  const icon = id => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  // Фразы по знакам конца предложения; начало каждой — чтобы ловить onboundary.
  function split(text) {
    const parts = [];
    const pattern = /[^.!?…。！？\n]+[.!?…。！？]*["»”)]*\s*/gu;
    let match;
    while ((match = pattern.exec(text))) {
      const value = match[0].trim();
      if (value) parts.push({ text: value, start: match.index });
    }
    return parts.length ? parts : [{ text: text.trim(), start: 0 }];
  }
  const seconds = sentence => Math.max(2.2, sentence.text.length * 0.075);

  function mount() {
    if (state.root) return state.root;
    const root = document.createElement("aside");
    root.className = "bear-reader";
    root.hidden = true;
    root.setAttribute("aria-live", "polite");
    root.innerHTML = `
      <img class="bear-reader-picture" src="${PICTURE}" alt="" />
      <div class="bear-reader-body">
        <p class="bear-reader-title"></p>
        <p class="bear-reader-line" dir="auto"></p>
        <div class="bear-reader-actions">
          <button type="button" data-action="stop"></button>
          <button type="button" data-action="video"></button>
        </div>
        <small class="bear-reader-note"></small>
      </div>`;
    root.addEventListener("click", event => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "stop") app()?.stopReading?.();
      if (action === "video") saveVideo();
    });
    document.body.append(root);
    state.root = root;
    return root;
  }

  function paint() {
    const root = state.root;
    if (!root) return;
    root.querySelector(".bear-reader-title").textContent = tr("readerTitle");
    root.querySelector(".bear-reader-line").textContent = state.sentences[state.index]?.text || "";
    root.querySelector("[data-action=stop]").innerHTML = `${icon("ic-book")} ${escapeHtml(tr("readerStop"))}`;
    const video = root.querySelector("[data-action=video]");
    video.hidden = !app()?.canShareVideo?.();
    video.disabled = state.recording;
    video.innerHTML = `${premium() ? "" : "🔒 "}${escapeHtml(state.recording ? tr("readerVideoMaking", { n: state.recording }) : tr("readerVideo"))}`;
    root.querySelector(".bear-reader-note").textContent = video.hidden ? "" : tr("readerVideoNote");
  }

  // Без onboundary (голос Android) фраза сменяется по примерному времени чтения.
  function tick() {
    clearTimeout(state.timer);
    const sentence = state.sentences[state.index];
    if (!sentence || state.index >= state.sentences.length - 1) return;
    state.timer = setTimeout(() => { state.index += 1; paint(); tick(); }, seconds(sentence) * 1000);
  }

  function show(text) {
    const root = mount();
    if (state.text !== text || root.hidden) {
      state.text = text;
      state.sentences = split(text);
      state.index = 0;
      tick();
    }
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add("is-open"));
    paint();
  }

  function hide() {
    clearTimeout(state.timer);
    const root = state.root;
    if (!root || root.hidden || state.recording) return;
    root.classList.remove("is-open");
    setTimeout(() => { if (!root.classList.contains("is-open")) root.hidden = true; }, 320);
  }

  function onSpeech(event) {
    const detail = event.detail || {};
    if (!detail.active) { hide(); return; }
    const text = String(detail.text || "").trim();
    if (!text) return;
    show(text);
    if (Number.isFinite(detail.charIndex)) {
      const index = state.sentences.findLastIndex?.(sentence => sentence.start <= detail.charIndex) ?? 0;
      if (index >= 0 && index !== state.index) { state.index = index; paint(); tick(); }
    }
  }

  // ——— Видео: 720×1280, Тёпа, «Для: …», фразы письма и подпись ———

  function loadImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  function wrap(context, text, width) {
    const lines = [];
    const words = String(text || "").split(/\s+/u).filter(Boolean);
    // Языки без пробелов (японский, китайский, тайский) переносятся по знакам.
    const units = words.length > 1 ? words : [...String(text || "")];
    const joiner = words.length > 1 ? " " : "";
    let line = "";
    for (const unit of units) {
      const next = line ? `${line}${joiner}${unit}` : unit;
      if (context.measureText(next).width <= width || !line) line = next;
      else { lines.push(line); line = unit; }
    }
    if (line) lines.push(line);
    return lines;
  }

  function pickType() {
    const types = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    return types.find(type => window.MediaRecorder?.isTypeSupported?.(type)) || "";
  }

  async function audioTrack(blob) {
    if (!blob) return null;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const buffer = await context.decodeAudioData(await blob.arrayBuffer());
      const destination = context.createMediaStreamDestination();
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(destination);
      return { context, source, track: destination.stream.getAudioTracks()[0], duration: buffer.duration };
    } catch { return null; }
  }

  async function saveVideo() {
    if (state.recording) return;
    if (!premium()) { app()?.stopReading?.(); app()?.openPaywall?.(); return; }
    const letter = app()?.readingLetter?.();
    const type = pickType();
    if (!letter?.text || !type) { app()?.notify?.(tr("readerVideoFailed")); return; }
    app()?.stopReading?.();
    state.recording = 1;
    show(letter.text);
    let audio = null;
    try {
      await Promise.all(["600 60px 'Cormorant Garamond'", "600 40px Manrope"].map(font => document.fonts?.load?.(font).catch(() => null)));
      const picture = await loadImage(PICTURE);
      const sentences = split(letter.text);
      audio = await audioTrack(letter.audio);
      const textSeconds = sentences.reduce((sum, sentence) => sum + seconds(sentence), 0);
      const total = Math.min(VIDEO.maxSeconds, Math.max(textSeconds, audio?.duration || 0) + 3);
      const stretch = (total - 3) / textSeconds;
      const canvas = document.createElement("canvas");
      canvas.width = VIDEO.width;
      canvas.height = VIDEO.height;
      const context = canvas.getContext("2d");
      const stream = canvas.captureStream(VIDEO.fps);
      if (audio?.track) stream.addTrack(audio.track);
      const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: VIDEO.bits });
      const chunks = [];
      recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
      const done = new Promise(resolve => { recorder.onstop = resolve; });

      const draw = elapsed => {
        const { width, height } = VIDEO;
        const right = rtl();
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#2b1d24");
        gradient.addColorStop(1, "#4a2a33");
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        // Тёпа: лёгкое приближение за всё видео.
        if (picture) {
          const zoom = 1 + Math.min(elapsed / total, 1) * 0.08;
          const boxWidth = width - 96;
          const boxHeight = boxWidth * 2 / 3;
          context.save();
          context.beginPath();
          context.roundRect?.(48, 120, boxWidth, boxHeight, 32);
          context.clip();
          const drawWidth = boxWidth * zoom;
          const drawHeight = drawWidth * picture.height / picture.width;
          context.drawImage(picture, 48 - (drawWidth - boxWidth) / 2, 120 + (boxHeight - drawHeight) / 2, drawWidth, drawHeight);
          context.restore();
        }
        context.textAlign = "center";
        context.direction = right ? "rtl" : "ltr";
        context.fillStyle = "#d8b56d";
        context.font = "700 22px Manrope, sans-serif";
        context.fillText("GLOWLETTER", width / 2, 90);
        context.fillStyle = "#fff6ea";
        context.font = "600 48px 'Cormorant Garamond', Georgia, serif";
        context.fillText(tr("readerFor", { name: letter.recipient || "" }), width / 2, 600);
        // Текущая фраза.
        let clock = 0;
        let current = sentences.length - 1;
        for (let index = 0; index < sentences.length; index += 1) {
          clock += seconds(sentences[index]) * stretch;
          if (elapsed < clock) { current = index; break; }
        }
        const finished = elapsed >= total - 3;
        context.font = "600 46px 'Cormorant Garamond', Georgia, serif";
        const lines = finished ? [] : wrap(context, sentences[current].text, width - 140).slice(0, 9);
        let y = 760;
        context.fillStyle = "#fffaf2";
        for (const line of lines) { context.fillText(line, width / 2, y); y += 58; }
        if (finished) {
          context.fillStyle = "#f0c5d3";
          context.font = "600 52px 'Cormorant Garamond', Georgia, serif";
          context.fillText(tr("readerFrom", { name: letter.sender || "" }), width / 2, 820);
        }
        // Полоска прогресса и адрес.
        context.fillStyle = "rgba(255, 246, 234, .2)";
        context.fillRect(96, height - 150, width - 192, 4);
        context.fillStyle = "#d8b56d";
        context.fillRect(96, height - 150, (width - 192) * Math.min(elapsed / total, 1), 4);
        context.fillStyle = "rgba(255, 246, 234, .7)";
        context.font = "600 24px Manrope, sans-serif";
        context.fillText("bezam.org", width / 2, height - 90);
      };

      draw(0);
      recorder.start(1000);
      audio?.source.start();
      const started = performance.now();
      await new Promise(resolve => {
        const frame = () => {
          const elapsed = (performance.now() - started) / 1000;
          draw(elapsed);
          const shown = Math.ceil(total - elapsed);
          if (shown !== state.recording) { state.recording = Math.max(1, shown); paint(); }
          if (elapsed >= total) { resolve(); return; }
          // В фоне requestAnimationFrame спит — подстраховка таймером.
          setTimeout(frame, 1000 / VIDEO.fps);
        };
        frame();
      });
      recorder.stop();
      await done;
      const blob = new Blob(chunks, { type: type.split(";")[0] });
      const extension = blob.type === "video/mp4" ? "mp4" : "webm";
      await app()?.deliverFile?.(blob, `${tr("readerVideoFile")}.${extension}`);
    } catch {
      app()?.notify?.(tr("readerVideoFailed"));
    }
    try { audio?.source.stop(); audio?.context.close(); } catch {}
    state.recording = false;
    paint();
    hide();
  }

  addEventListener("glowletter-letter-speech", onSpeech);
  addEventListener("glowletter-language-changed", () => setTimeout(paint, 0));

  window.GlowLetterBearReader = Object.freeze({ saveVideo: () => saveVideo() });
})();
