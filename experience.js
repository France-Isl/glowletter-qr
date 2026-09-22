/*
  Оформление письма: рамка, цвет текста и шрифт.

  Видеофоны убраны намеренно: на слабых телефонах они подтормаживали, а письмо
  всегда лежит на одной и той же фотографии озера. Поэтому прозрачность бумаги
  больше не подстраивается под кадр, а задана один раз и подобрана так, чтобы
  текст читался на этом фоне.
*/
(() => {
  "use strict";

  const STORAGE_KEY = "glowletter-experience";
  const FRAMES = ["none", "hearts", "moon", "forest", "pearl"];
  const INKS = ["ink", "plum", "forest", "midnight"];
  const TYPES = ["classic", "elegant", "clear", "poetic", "literary"];

  const TEXT = {
    ru: {
      eyebrow: "ОФОРМЛЕНИЕ ПИСЬМА", title: "Как выглядит письмо",
      premium: "Премиум-оформление",
      frame: "Рамка письма", color: "Цвет текста", type: "Стиль текста", pro: "VIP",
      none: "Без рамки", hearts: "Сердца", moon: "Лунный свет", forestFrame: "Лесное золото",
      pearl: "Жемчуг", ink: "Чернила", plum: "Слива", forestInk: "Лес", midnight: "Полночь",
      classic: "Классика", elegant: "Элегантный", clear: "Чёткий", poetic: "Поэтичный", literary: "Литературный",
      locked: "Доступно в полной версии", saved: "Оформление сохранено", share: "Оформление добавлено в ссылку"
    },
    en: {
      eyebrow: "LETTER STYLING", title: "How the letter looks",
      premium: "Premium styling",
      frame: "Letter frame", color: "Text color", type: "Text style", pro: "VIP",
      none: "No frame", hearts: "Hearts", moon: "Moonlight", forestFrame: "Forest gold",
      pearl: "Pearl", ink: "Ink", plum: "Plum", forestInk: "Forest", midnight: "Midnight",
      classic: "Classic", elegant: "Elegant", clear: "Clear", poetic: "Poetic", literary: "Literary",
      locked: "Available with full access", saved: "Style saved", share: "Styling added to the link"
    },
    fr: {
      eyebrow: "STYLE DE LA LETTRE", title: "L’allure de la lettre",
      premium: "Style premium",
      frame: "Cadre de la lettre", color: "Couleur du texte", type: "Style du texte", pro: "VIP",
      none: "Sans cadre", hearts: "Cœurs", moon: "Clair de lune", forestFrame: "Or forestier",
      pearl: "Perle", ink: "Encre", plum: "Prune", forestInk: "Forêt", midnight: "Minuit",
      classic: "Classique", elegant: "Élégant", clear: "Net", poetic: "Poétique", literary: "Littéraire",
      locked: "Disponible avec l’accès complet", saved: "Style enregistré", share: "Style ajouté au lien"
    }
  };

  const valid = (value, values, fallback) => values.includes(value) ? value : fallback;
  const safeJson = value => { try { return JSON.parse(value || "null") || {}; } catch { return {}; } };
  const stored = safeJson(localStorage.getItem(STORAGE_KEY));
  const params = new URLSearchParams(location.search);
  const state = {
    frame: valid(params.get("glFrame") || stored.frame, FRAMES, "none"),
    ink: valid(params.get("glInk") || stored.ink, INKS, "ink"),
    type: valid(params.get("glType") || stored.type, TYPES, "classic")
  };

  const mobileDevice = document.documentElement.dataset.glPerf === "mobile";
  let premium = false;
  let statusTimer = 0;

  const app = document.querySelector("#app");
  const settingsPanel = document.querySelector(".settings-panel");
  const backgroundPicker = document.querySelector(".background-picker");
  const letter = document.querySelector("#letter");
  if (!app || !settingsPanel || !backgroundPicker || !letter) return;

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
    <div class="gl-premium-block"><header><div><span data-gl-text="premium"></span><small data-gl-text="locked"></small></div><b data-gl-text="pro"></b></header>
      <fieldset class="gl-studio-group"><legend data-gl-text="frame"></legend><div class="gl-frame-grid" role="radiogroup"></div></fieldset>
      <fieldset class="gl-studio-group gl-compact"><legend data-gl-text="color"></legend><div class="gl-ink-grid" role="radiogroup"></div></fieldset>
      <fieldset class="gl-studio-group gl-compact"><legend data-gl-text="type"></legend><div class="gl-type-grid" role="radiogroup"></div></fieldset>
    </div>
    <p class="gl-studio-status" role="status" aria-live="polite"></p>`;
  backgroundPicker.insertAdjacentElement("afterend", studio);

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
  makeChoices(studio.querySelector(".gl-type-grid"), TYPES, "glType", { classic: "classic", elegant: "elegant", clear: "clear", poetic: "poetic", literary: "literary" });

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
    studio.querySelectorAll("[data-choice-label]").forEach(node => { node.textContent = copy(node.dataset.choiceLabel); });
  };

  const syncUrl = () => {
    const url = new URL(location.href);
    const values = { glFrame: state.frame, glInk: state.ink, glType: state.type };
    Object.entries(values).forEach(([key, value]) => value && value !== ({ glFrame: "none", glInk: "ink", glType: "classic" })[key] ? url.searchParams.set(key, value) : url.searchParams.delete(key));
    history.replaceState(history.state, "", url);
  };
  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncUrl();
  };

  const renderChoices = () => {
    [["glFrame", state.frame], ["glInk", state.ink], ["glType", state.type]].forEach(([key, selected]) => {
      studio.querySelectorAll(`[data-${key.replace(/[A-Z]/g, value => `-${value.toLowerCase()}`)}]`).forEach(button => {
        const active = button.dataset[key] === selected;
        button.classList.toggle("is-active", active); button.setAttribute("aria-checked", String(active));
        const mark = button.querySelector(":scope > b");
        if (mark) mark.textContent = active ? "✓" : (button.dataset.glFrame === "none" ? "—" : "✦");
      });
    });
  };

  // Одна фотография вместо видео, поэтому и затемнение, и плотность бумаги
  // постоянные. Значения подобраны в пользу читаемости текста.
  const applyPaper = () => {
    document.documentElement.style.setProperty("--gl-scene-dim", "0.32");
    document.documentElement.style.setProperty("--gl-paper-alpha", mobileDevice ? "0.92" : "0.88");
  };

  const applyDesign = () => {
    const sharedPresentation = params.has("msg") && ["glFrame", "glInk", "glType"].some(key => params.has(key));
    const shownFrame = premium || sharedPresentation ? state.frame : "none";
    document.body.dataset.glFrame = shownFrame;
    document.body.dataset.glInk = premium || sharedPresentation ? state.ink : "ink";
    document.body.dataset.glType = premium || sharedPresentation ? state.type : "classic";
    letter.dataset.glFrame = shownFrame;
  };
  const detectPremium = () => {
    const card = document.querySelector(".premium-settings-card");
    premium = document.body.dataset.access === "vip" || document.body.classList.contains("gl-premium-active") || Boolean(card && card.hidden);
    document.body.classList.toggle("gl-premium-active", premium);
    const block = studio.querySelector(".gl-premium-block");
    block.classList.toggle("is-locked", !premium);
    const lockedHint = block.querySelector('[data-gl-text="locked"]');
    if (lockedHint) lockedHint.hidden = premium;
    studio.querySelectorAll("[data-gl-frame],[data-gl-ink],[data-gl-type]").forEach(button => button.setAttribute("aria-disabled", String(!premium && button.dataset.glFrame !== "none")));
    applyDesign();
  };
  const requestPremium = () => {
    notify("locked");
    const libraryUnlock = document.querySelector('#quoteList [data-action="unlock"]');
    if (libraryUnlock) libraryUnlock.click();
    else document.querySelector("#settingsPurchase")?.click();
  };

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

  const premiumCard = document.querySelector(".premium-settings-card");
  if (premiumCard) new MutationObserver(detectPremium).observe(premiumCard, { attributes: true, attributeFilter: ["hidden", "style", "class"] });
  addEventListener("nur-entitlement", () => setTimeout(detectPremium));
  addEventListener("glowletter-access-change", event => { premium = Boolean(event.detail?.premium); detectPremium(); });
  new MutationObserver(() => {
    letter.classList.remove("gl-letter-alive");
    requestAnimationFrame(() => letter.classList.add("gl-letter-alive"));
  }).observe(document.querySelector("#letterText"), { childList: true, characterData: true, subtree: true });
  new MutationObserver(() => setTimeout(() => { localize(); renderChoices(); }, 0)).observe(document.querySelector("#languageButton"), { childList: true, characterData: true, subtree: true });

  localize(); renderChoices(); applyPaper(); applyDesign(); detectPremium(); syncUrl();
})();
