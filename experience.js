(() => {
  "use strict";

  if (window.__glowLetterExperience) return;
  window.__glowLetterExperience = true;

  const STORAGE_KEY = "glowletterExperienceV1";
  const ASSET_ROOT = "assets/video/";
  const SCENES = [
    { id: "still", file: "", icon: "▧" },
    { id: "mishka", file: "mishka.mp4", icon: "🐻" },
    { id: "kotyta", file: "kotyta.mp4", icon: "🐱" },
    { id: "lis", file: "lis.mp4", icon: "🦊" },
    { id: "kot", file: "kot.mp4", icon: "🐈" }
  ];
  const FRAMES = ["none", "hearts", "moon", "forest", "pearl"];
  const INKS = ["ink", "plum", "forest", "midnight"];
  const TYPES = ["classic", "elegant", "clear"];
  const TEXT = {
    ru: {
      eyebrow: "ВИЗУАЛЬНАЯ СТУДИЯ", title: "Живой фон", scene: "Видео-фон",
      sceneHint: "Фон повторяется без остановки", still: "Фото / озеро", mishka: "Мишка",
      kotyta: "Котята", lis: "Лисёнок", kot: "Кот", smart: "Умная читаемость",
      smartHint: "Прозрачность письма сама подстраивается под свет в видео", premium: "Премиум-оформление",
      frame: "Рамка письма", color: "Цвет текста", type: "Стиль текста", pro: "PRO",
      none: "Без рамки", hearts: "Сердца", moon: "Лунный свет", forestFrame: "Лесное золото",
      pearl: "Жемчуг", ink: "Чернила", plum: "Слива", forestInk: "Лес", midnight: "Полночь",
      classic: "Классика", elegant: "Элегантный", clear: "Чёткий", locked: "Доступно в полной версии",
      saved: "Оформление сохранено", fallback: "Видео недоступно — возвращён фон с фотографией",
      reduced: "Видео приостановлено системной настройкой движения", data: "Видео приостановлено для экономии трафика",
      on: "ВКЛ", off: "ВЫКЛ", share: "Оформление добавлено в ссылку"
    },
    en: {
      eyebrow: "VISUAL STUDIO", title: "Living background", scene: "Video background",
      sceneHint: "The background loops continuously", still: "Photo / lake", mishka: "Bear",
      kotyta: "Kittens", lis: "Little fox", kot: "Cat", smart: "Smart readability",
      smartHint: "Letter transparency adapts to the light in the video", premium: "Premium styling",
      frame: "Letter frame", color: "Text color", type: "Text style", pro: "PRO",
      none: "No frame", hearts: "Hearts", moon: "Moonlight", forestFrame: "Forest gold",
      pearl: "Pearl", ink: "Ink", plum: "Plum", forestInk: "Forest", midnight: "Midnight",
      classic: "Classic", elegant: "Elegant", clear: "Clear", locked: "Available with full access",
      saved: "Style saved", fallback: "Video unavailable — restored the photo background",
      reduced: "Video paused by the reduced-motion setting", data: "Video paused to save data",
      on: "ON", off: "OFF", share: "Styling added to the link"
    },
    fr: {
      eyebrow: "STUDIO VISUEL", title: "Fond vivant", scene: "Fond vidéo",
      sceneHint: "Le fond se répète en continu", still: "Photo / lac", mishka: "Ourson",
      kotyta: "Chatons", lis: "Renardeau", kot: "Chat", smart: "Lisibilité intelligente",
      smartHint: "La transparence s’adapte à la lumière de la vidéo", premium: "Style premium",
      frame: "Cadre de la lettre", color: "Couleur du texte", type: "Style du texte", pro: "PRO",
      none: "Sans cadre", hearts: "Cœurs", moon: "Clair de lune", forestFrame: "Or forestier",
      pearl: "Perle", ink: "Encre", plum: "Prune", forestInk: "Forêt", midnight: "Minuit",
      classic: "Classique", elegant: "Élégant", clear: "Clair", locked: "Disponible avec l’accès complet",
      saved: "Style enregistré", fallback: "Vidéo indisponible — retour au fond photo",
      reduced: "Vidéo en pause selon le réglage de mouvement", data: "Vidéo en pause pour économiser les données",
      on: "OUI", off: "NON", share: "Style ajouté au lien"
    }
  };

  const valid = (value, values, fallback) => values.includes(value) ? value : fallback;
  const safeJson = value => { try { return JSON.parse(value || "null") || {}; } catch { return {}; } };
  const stored = safeJson(localStorage.getItem(STORAGE_KEY));
  const params = new URLSearchParams(location.search);
  const state = {
    scene: valid(params.get("glScene") || stored.scene, SCENES.map(item => item.id), "still"),
    frame: valid(params.get("glFrame") || stored.frame, FRAMES, "none"),
    ink: valid(params.get("glInk") || stored.ink, INKS, "ink"),
    type: valid(params.get("glType") || stored.type, TYPES, "classic"),
    smart: stored.smart !== false
  };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  let premium = false;
  let sampleTimer = 0;
  let statusTimer = 0;

  const app = document.querySelector("#app");
  const settingsPanel = document.querySelector(".settings-panel");
  const backgroundPicker = document.querySelector(".background-picker");
  const letter = document.querySelector("#letter");
  if (!app || !settingsPanel || !backgroundPicker || !letter) return;

  const videoLayer = document.createElement("div");
  videoLayer.className = "gl-video-layer";
  videoLayer.setAttribute("aria-hidden", "true");
  videoLayer.innerHTML = '<video class="gl-video-background" muted loop playsinline disablepictureinpicture tabindex="-1"></video><div class="gl-video-shade"></div>';
  const cinematic = document.querySelector("#cinematicBg");
  (cinematic || app.firstElementChild).insertAdjacentElement("afterend", videoLayer);
  const video = videoLayer.querySelector("video");
  video.defaultMuted = true;
  video.muted = true;

  const frameLayer = document.createElement("div");
  frameLayer.className = "gl-frame-layer";
  frameLayer.setAttribute("aria-hidden", "true");
  frameLayer.innerHTML = '<i class="gl-orbit gl-orbit-a">♡</i><i class="gl-orbit gl-orbit-b">✦</i><i class="gl-corner gl-corner-a">☾</i><i class="gl-corner gl-corner-b">❦</i><span class="gl-sparkles"></span>';
  letter.append(frameLayer);

  const studio = document.createElement("section");
  studio.className = "gl-visual-studio";
  studio.setAttribute("aria-labelledby", "glVisualTitle");
  studio.innerHTML = `
    <header class="gl-studio-head"><span aria-hidden="true">✦</span><div><small data-gl-text="eyebrow"></small><h3 id="glVisualTitle" data-gl-text="title"></h3></div></header>
    <fieldset class="gl-studio-group"><legend data-gl-text="scene"></legend><p data-gl-text="sceneHint"></p><div class="gl-scene-grid" role="radiogroup" aria-labelledby="glVisualTitle"></div></fieldset>
    <button class="gl-smart-toggle" type="button" role="switch"><span aria-hidden="true">◐</span><span><strong data-gl-text="smart"></strong><small data-gl-text="smartHint"></small></span><b></b></button>
    <div class="gl-premium-block"><header><div><span data-gl-text="premium"></span><small data-gl-text="locked"></small></div><b data-gl-text="pro"></b></header>
      <fieldset class="gl-studio-group"><legend data-gl-text="frame"></legend><div class="gl-frame-grid" role="radiogroup"></div></fieldset>
      <fieldset class="gl-studio-group gl-compact"><legend data-gl-text="color"></legend><div class="gl-ink-grid" role="radiogroup"></div></fieldset>
      <fieldset class="gl-studio-group gl-compact"><legend data-gl-text="type"></legend><div class="gl-type-grid" role="radiogroup"></div></fieldset>
    </div>
    <p class="gl-studio-status" role="status" aria-live="polite"></p>`;
  backgroundPicker.insertAdjacentElement("afterend", studio);

  const sceneGrid = studio.querySelector(".gl-scene-grid");
  SCENES.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.glScene = item.id;
    button.setAttribute("role", "radio");
    const preview = item.file
      ? `<img loading="lazy" decoding="async" src="${ASSET_ROOT}${item.id}.jpg" alt="" />`
      : '<span class="gl-still-preview" aria-hidden="true">▧</span>';
    button.innerHTML = `${preview}<span><i aria-hidden="true">${item.icon}</i><b data-scene-label="${item.id}"></b></span>`;
    sceneGrid.append(button);
  });

  const makeChoices = (target, items, key, labelMap) => {
    items.forEach(id => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset[key] = id;
      button.setAttribute("role", "radio");
      button.innerHTML = `<i aria-hidden="true"></i><span data-choice-label="${labelMap[id] || id}"></span><b aria-hidden="true">${id === "none" ? "—" : "✦"}</b>`;
      target.append(button);
    });
  };
  makeChoices(studio.querySelector(".gl-frame-grid"), FRAMES, "glFrame", { none: "none", hearts: "hearts", moon: "moon", forest: "forestFrame", pearl: "pearl" });
  makeChoices(studio.querySelector(".gl-ink-grid"), INKS, "glInk", { ink: "ink", plum: "plum", forest: "forestInk", midnight: "midnight" });
  makeChoices(studio.querySelector(".gl-type-grid"), TYPES, "glType", { classic: "classic", elegant: "elegant", clear: "clear" });

  const language = () => {
    const current = String(localStorage.getItem("nurLanguage") || document.querySelector("#languageButton")?.textContent || "ru").trim().toLowerCase();
    return ["ru", "en", "fr"].includes(current) ? current : "ru";
  };
  const copy = key => (TEXT[language()] || TEXT.ru)[key] || TEXT.ru[key] || key;
  const notify = key => {
    const node = studio.querySelector(".gl-studio-status");
    node.textContent = copy(key);
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { node.textContent = ""; }, 3200);
  };
  const localize = () => {
    studio.querySelectorAll("[data-gl-text]").forEach(node => { node.textContent = copy(node.dataset.glText); });
    studio.querySelectorAll("[data-scene-label]").forEach(node => { node.textContent = copy(node.dataset.sceneLabel); });
    studio.querySelectorAll("[data-choice-label]").forEach(node => { node.textContent = copy(node.dataset.choiceLabel); });
    studio.querySelector(".gl-smart-toggle b").textContent = state.smart ? copy("on") : copy("off");
  };

  const syncUrl = () => {
    const url = new URL(location.href);
    const values = { glScene: state.scene, glFrame: state.frame, glInk: state.ink, glType: state.type };
    Object.entries(values).forEach(([key, value]) => value && value !== ({ glScene: "still", glFrame: "none", glInk: "ink", glType: "classic" })[key] ? url.searchParams.set(key, value) : url.searchParams.delete(key));
    history.replaceState(history.state, "", url);
  };
  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncUrl();
  };

  const renderChoices = () => {
    studio.querySelectorAll("[data-gl-scene]").forEach(button => {
      const active = button.dataset.glScene === state.scene;
      button.classList.toggle("is-active", active); button.setAttribute("aria-checked", String(active));
    });
    [["glFrame", state.frame], ["glInk", state.ink], ["glType", state.type]].forEach(([key, selected]) => {
      studio.querySelectorAll(`[data-${key.replace(/[A-Z]/g, value => `-${value.toLowerCase()}`)}]`).forEach(button => {
        const active = button.dataset[key] === selected;
        button.classList.toggle("is-active", active); button.setAttribute("aria-checked", String(active));
      });
    });
    const smart = studio.querySelector(".gl-smart-toggle");
    smart.classList.toggle("is-active", state.smart); smart.setAttribute("aria-checked", String(state.smart));
    smart.querySelector("b").textContent = state.smart ? copy("on") : copy("off");
  };

  const setPalette = luminance => {
    const light = Math.max(0, Math.min(1, luminance));
    const dim = state.smart ? (.17 + light * .25) : .28;
    const paper = state.smart ? (.70 + light * .1) : .76;
    document.documentElement.style.setProperty("--gl-scene-dim", dim.toFixed(3));
    document.documentElement.style.setProperty("--gl-paper-alpha", paper.toFixed(3));
  };
  const samplePalette = () => {
    if (!state.smart || video.readyState < 2 || !video.videoWidth) return setPalette(.5);
    try {
      const canvas = document.createElement("canvas"); canvas.width = 32; canvas.height = 18;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(video, 0, 0, 32, 18);
      const pixels = context.getImageData(0, 0, 32, 18).data;
      let sum = 0; for (let index = 0; index < pixels.length; index += 4) sum += (.2126 * pixels[index] + .7152 * pixels[index + 1] + .0722 * pixels[index + 2]) / 255;
      setPalette(sum / (pixels.length / 4));
    } catch { setPalette(.5); }
  };
  const playVideo = () => {
    if (state.scene === "still" || reduceMotion.matches || saveData || document.hidden) return;
    video.play().catch(() => document.addEventListener("pointerdown", () => video.play().catch(() => {}), { once: true, passive: true }));
  };
  const applyScene = () => {
    const selected = SCENES.find(item => item.id === state.scene) || SCENES[0];
    document.body.classList.toggle("gl-video-active", Boolean(selected.file));
    document.body.dataset.glScene = selected.id;
    if (!selected.file) {
      video.pause(); video.removeAttribute("src"); video.load(); setPalette(.5); return;
    }
    const source = `${ASSET_ROOT}${selected.file}`;
    if (!video.src.endsWith(source)) { video.src = source; video.preload = saveData ? "metadata" : "auto"; video.load(); }
    if (reduceMotion.matches) notify("reduced"); else if (saveData) notify("data"); else playVideo();
  };
  const applyDesign = () => {
    const sharedPresentation = params.has("msg") && params.has("glFrame");
    const shownFrame = premium || sharedPresentation ? state.frame : "none";
    document.body.dataset.glFrame = shownFrame;
    document.body.dataset.glInk = premium || sharedPresentation ? state.ink : "ink";
    document.body.dataset.glType = premium || sharedPresentation ? state.type : "classic";
    letter.dataset.glFrame = shownFrame;
  };
  const detectPremium = () => {
    const card = document.querySelector(".premium-settings-card");
    premium = Boolean(card && card.hidden);
    document.body.classList.toggle("gl-premium-active", premium);
    studio.querySelector(".gl-premium-block").classList.toggle("is-locked", !premium);
    studio.querySelectorAll("[data-gl-frame],[data-gl-ink],[data-gl-type]").forEach(button => button.setAttribute("aria-disabled", String(!premium && button.dataset.glFrame !== "none")));
    applyDesign();
  };
  const requestPremium = () => {
    notify("locked");
    const libraryUnlock = document.querySelector('#quoteList [data-action="unlock"]');
    if (libraryUnlock) libraryUnlock.click();
    else document.querySelector("#aiOpenTop")?.click();
  };

  sceneGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-gl-scene]"); if (!button) return;
    state.scene = valid(button.dataset.glScene, SCENES.map(item => item.id), "still");
    persist(); applyScene(); renderChoices(); notify("saved");
  });
  studio.querySelector(".gl-frame-grid").addEventListener("click", event => {
    const button = event.target.closest("[data-gl-frame]"); if (!button) return;
    if (!premium && button.dataset.glFrame !== "none") return requestPremium();
    state.frame = valid(button.dataset.glFrame, FRAMES, "none"); persist(); applyDesign(); renderChoices(); notify("saved");
  });
  studio.querySelector(".gl-ink-grid").addEventListener("click", event => {
    const button = event.target.closest("[data-gl-ink]"); if (!button) return;
    if (!premium) return requestPremium();
    state.ink = valid(button.dataset.glInk, INKS, "ink"); persist(); applyDesign(); renderChoices(); notify("saved");
  });
  studio.querySelector(".gl-type-grid").addEventListener("click", event => {
    const button = event.target.closest("[data-gl-type]"); if (!button) return;
    if (!premium) return requestPremium();
    state.type = valid(button.dataset.glType, TYPES, "classic"); persist(); applyDesign(); renderChoices(); notify("saved");
  });
  studio.querySelector(".gl-smart-toggle").addEventListener("click", () => {
    state.smart = !state.smart; persist(); samplePalette(); renderChoices(); notify("saved");
  });

  document.querySelector("#customBackgroundInput")?.addEventListener("change", event => { if (event.target.files?.length) { state.scene = "still"; persist(); applyScene(); renderChoices(); } });
  document.querySelector("#resetBackgroundButton")?.addEventListener("click", () => { state.scene = "still"; persist(); applyScene(); renderChoices(); });
  const encodeSharedText = text => {
    try {
      const bytes = new TextEncoder().encode(String(text || "").trim());
      let binary = "";
      for (let index = 0; index < bytes.length; index += 8192) binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
      return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
    } catch { return ""; }
  };
  const copyShareUrl = async value => {
    try { await navigator.clipboard.writeText(value); }
    catch {
      const input = document.createElement("textarea"); input.value = value; input.setAttribute("readonly", ""); input.style.position = "fixed"; input.style.opacity = "0";
      document.body.append(input); input.select(); document.execCommand("copy"); input.remove();
    }
  };
  document.querySelector("#shareButton")?.addEventListener("click", event => {
    syncUrl();
    event.preventDefault(); event.stopImmediatePropagation();
    const canonicalShareUrl = String(window.NUR_APP_CONFIG?.publicShareUrl || "").trim();
    const url = new URL(canonicalShareUrl || location.href);
    const sender = document.querySelector("#letterFrom")?.textContent?.trim() || "";
    const recipient = document.querySelector("#letterTo")?.textContent?.trim() || "";
    const message = encodeSharedText(document.querySelector("#letterText")?.textContent || "");
    if (sender) url.searchParams.set("from", sender);
    if (recipient) url.searchParams.set("to", recipient);
    if (message) url.searchParams.set("msg", message);
    url.searchParams.set("lang", language());
    if (state.scene !== "still") url.searchParams.set("glScene", state.scene);
    if (state.frame !== "none") url.searchParams.set("glFrame", state.frame);
    if (state.ink !== "ink") url.searchParams.set("glInk", state.ink);
    if (state.type !== "classic") url.searchParams.set("glType", state.type);
    url.searchParams.delete("quote");
    // Shared letters are always public/free links. Owner access never leaves
    // the current device through a share action.
    url.hash = "";
    const data = { title: document.title, text: recipient ? `${recipient}, это письмо для тебя — ${sender} ♡` : document.title, url: url.toString() };
    if (navigator.share) navigator.share(data).catch(error => { if (error?.name !== "AbortError") copyShareUrl(data.url); });
    else copyShareUrl(data.url);
    notify("share");
  }, true);
  video.addEventListener("loadeddata", () => { samplePalette(); playVideo(); });
  video.addEventListener("ended", () => { video.currentTime = 0; playVideo(); });
  video.addEventListener("error", () => { state.scene = "still"; persist(); applyScene(); renderChoices(); notify("fallback"); });
  document.addEventListener("visibilitychange", () => document.hidden ? video.pause() : playVideo());
  addEventListener("pageshow", playVideo);
  const motionChanged = () => applyScene();
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", motionChanged); else reduceMotion.addListener(motionChanged);

  const premiumCard = document.querySelector(".premium-settings-card");
  if (premiumCard) new MutationObserver(detectPremium).observe(premiumCard, { attributes: true, attributeFilter: ["hidden", "style", "class"] });
  addEventListener("nur-entitlement", () => setTimeout(detectPremium));
  new MutationObserver(() => {
    letter.classList.remove("gl-letter-alive");
    requestAnimationFrame(() => letter.classList.add("gl-letter-alive"));
  }).observe(document.querySelector("#letterText"), { childList: true, characterData: true, subtree: true });
  new MutationObserver(() => setTimeout(() => { localize(); renderChoices(); }, 0)).observe(document.querySelector("#languageButton"), { childList: true, characterData: true, subtree: true });

  clearInterval(sampleTimer);
  sampleTimer = setInterval(() => { if (!document.hidden && state.scene !== "still") samplePalette(); }, 4500);
  localize(); renderChoices(); applyScene(); applyDesign(); detectPremium(); syncUrl();
})();
