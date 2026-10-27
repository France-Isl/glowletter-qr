/*
  Оформление письма (2.4.20): рамка и стиль текста.

  Рамки нарисованы векторами (SVG): они остаются чёткими на любом экране и не
  грузят телефон картинками. Цвет чернил и старые рамки убраны по просьбе
  владельца, из шрифтов оставлены три самых красивых. Фон выбирается в app.js.
*/
(() => {
  "use strict";

  const STORAGE_KEY = "glowletter-experience";
  // Рамка по умолчанию — выбор владельца из трёх вариантов.
  const DEFAULT_FRAME = "gold";
  const FRAMES = ["gold", "roses", "night", "none"];
  const TYPES = ["classic", "poetic", "clear"];

  const TEXT = {
    ru: {
      eyebrow: "ОФОРМЛЕНИЕ ПИСЬМА", title: "Как выглядит письмо",
      premium: "Премиум-оформление",
      frame: "Рамка письма", type: "Стиль текста", pro: "VIP",
      none: "Без рамки", frameGold: "Золото", frameRoses: "Розы", frameNight: "Ночное небо",
      classic: "Классика", poetic: "Поэтичный", clear: "Чёткий",
      locked: "Доступно в полной версии", saved: "Оформление сохранено"
    },
    en: {
      eyebrow: "LETTER STYLING", title: "How the letter looks",
      premium: "Premium styling",
      frame: "Letter frame", type: "Text style", pro: "VIP",
      none: "No frame", frameGold: "Gold", frameRoses: "Roses", frameNight: "Night sky",
      classic: "Classic", poetic: "Poetic", clear: "Clear",
      locked: "Available with full access", saved: "Style saved"
    },
    fr: {
      eyebrow: "STYLE DE LA LETTRE", title: "L’allure de la lettre",
      premium: "Style premium",
      frame: "Cadre de la lettre", type: "Style du texte", pro: "VIP",
      none: "Sans cadre", frameGold: "Or", frameRoses: "Roses", frameNight: "Ciel de nuit",
      classic: "Classique", poetic: "Poétique", clear: "Net",
      locked: "Disponible avec l’accès complet", saved: "Style enregistré"
    }
  };
  Object.entries(window.NUR_I18N_EXTRA || {}).forEach(([code, extra]) => {
    if (!TEXT[code] && extra?.experience) TEXT[code] = { ...TEXT.en, ...extra.experience };
  });

  const valid = (value, values, fallback) => values.includes(value) ? value : fallback;
  const safeJson = value => { try { return JSON.parse(value || "null") || {}; } catch { return {}; } };
  const stored = safeJson(localStorage.getItem(STORAGE_KEY));
  const params = new URLSearchParams(location.search);
  const state = {
    frame: valid(params.get("glFrame") || stored.frame, FRAMES, DEFAULT_FRAME),
    type: valid(params.get("glType") || stored.type, TYPES, "classic")
  };

  let premium = false;
  let statusTimer = 0;

  const settingsAnchor = document.querySelector(".scene-picker");
  const letter = document.querySelector("#letter");
  if (!settingsAnchor || !letter) return;

  // Углы рамок. Один уголок рисуется в левом верхнем углу, остальные три —
  // его зеркальные копии, поэтому рамка всегда симметрична.
  const CORNERS = {
    gold: '<svg viewBox="0 0 96 96" aria-hidden="true" focusable="false"><g fill="none" stroke="#b8863b" stroke-width="1.6"><path d="M12 52Q12 12 52 12"/><path d="M20 46Q20 20 46 20" stroke-width="1"/><path d="M12 30 30 12"/><path d="M12 40 40 12" stroke-width=".8"/></g><g fill="#b8863b"><path d="M12 12h9l-9 9z"/><rect x="25" y="25" width="7" height="7" transform="rotate(45 28.5 28.5)"/></g><g fill="#e4c27a"><circle cx="52" cy="12" r="2.4"/><circle cx="12" cy="52" r="2.4"/></g></svg>',
    roses: '<svg viewBox="0 0 132 132" aria-hidden="true" focusable="false"><defs><radialGradient id="glRoseFill" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#e98a98"/><stop offset=".6" stop-color="#c25b6b"/><stop offset="1" stop-color="#8e2f3f"/></radialGradient></defs><g fill="none" stroke="#6f8a5b" stroke-width="1.6" stroke-linecap="round"><path d="M30 30C60 34 86 26 112 14"/><path d="M30 30C34 60 26 86 14 112"/></g><g fill="#7f9b69"><path d="M70 30c8-10 20-10 24-6-6 6-16 10-24 6z"/><path d="M92 22c6-8 16-9 19-5-5 5-13 8-19 5z"/><path d="M30 70c-10 8-10 20-6 24 6-6 10-16 6-24z"/><path d="M22 92c-8 6-9 16-5 19 5-5 8-13 5-19z"/><path d="M52 36c4-8 12-10 16-8-3 6-10 9-16 8z"/><path d="M36 52c-8 4-10 12-8 16 6-3 9-10 8-16z"/></g><circle cx="30" cy="30" r="17" fill="url(#glRoseFill)"/><path d="M30 17c8 2 12 8 10 14-4-6-10-8-16-6 1-4 3-6 6-8z" fill="#f2a9b4" opacity=".75"/><path d="M19 32c2-8 9-12 16-10-6 3-9 9-8 15-4-1-7-2-8-5z" fill="#a33d4e" opacity=".8"/><path d="M26 26c4-3 9-2 10 2-3 0-6 2-7 5-2-2-3-4-3-7z" fill="#7a2232"/><circle cx="62" cy="22" r="6" fill="#e98a98"/><circle cx="22" cy="62" r="6" fill="#e98a98"/><circle cx="62" cy="22" r="2.5" fill="#a33d4e"/><circle cx="22" cy="62" r="2.5" fill="#a33d4e"/><g fill="#e4c27a"><circle cx="100" cy="30" r="2"/><circle cx="30" cy="100" r="2"/><circle cx="112" cy="14" r="2.6"/><circle cx="14" cy="112" r="2.6"/></g></svg>'
  };
  const NIGHT_TOP = '<svg viewBox="0 0 150 44" aria-hidden="true" focusable="false"><path d="M75 10a12 12 0 1 0 9 20 9.5 9.5 0 1 1-9-20z" fill="#d6a85a"/><g fill="#b8863b"><path d="m48 23 1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/><path d="m104 18 1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z"/><circle cx="34" cy="22" r="1.6"/><circle cx="118" cy="30" r="1.6"/><circle cx="92" cy="12" r="1.2"/></g></svg>';
  const NIGHT_BOTTOM = '<svg viewBox="0 0 120 36" aria-hidden="true" focusable="false"><path d="M22 18c18 0 28-6 38 0s20 0 38 0" fill="none" stroke="#7d1f2b" stroke-width="1.3" stroke-linecap="round"/><g fill="#7d1f2b"><path d="M40 16c3-6 9-6 10-4-3 3-7 5-10 4z"/><path d="M70 20c3 6 9 6 10 4-3-3-7-5-10-4z"/><circle cx="60" cy="18" r="3"/></g></svg>';

  const frameLayer = document.createElement("div");
  frameLayer.className = "gl-frame-art";
  frameLayer.setAttribute("aria-hidden", "true");
  letter.append(frameLayer);
  const drawFrame = frame => {
    if (frame === "gold" || frame === "roses") {
      frameLayer.innerHTML = ["tl", "tr", "bl", "br"].map(corner => `<i class="gl-corner gl-${corner}">${CORNERS[frame]}</i>`).join("");
    } else if (frame === "night") {
      frameLayer.innerHTML = `<i class="gl-night-top">${NIGHT_TOP}</i><i class="gl-night-bottom">${NIGHT_BOTTOM}</i>`;
    } else {
      frameLayer.innerHTML = "";
    }
  };

  const studio = document.createElement("section");
  studio.className = "gl-visual-studio";
  studio.setAttribute("aria-labelledby", "glVisualTitle");
  studio.innerHTML = `
    <header class="gl-studio-head"><div><small data-gl-text="eyebrow"></small><h3 id="glVisualTitle" data-gl-text="title"></h3></div><b class="gl-pro" data-gl-text="pro"></b></header>
    <div class="gl-premium-block">
      <fieldset class="gl-studio-group"><legend data-gl-text="frame"></legend><div class="gl-frame-grid" role="radiogroup"></div></fieldset>
      <fieldset class="gl-studio-group"><legend data-gl-text="type"></legend><div class="gl-type-grid" role="radiogroup"></div></fieldset>
      <p class="gl-locked-note" data-gl-text="locked"></p>
    </div>
    <p class="gl-studio-status" role="status" aria-live="polite"></p>`;
  settingsAnchor.insertAdjacentElement("afterend", studio);

  const FRAME_LABELS = { gold: "frameGold", roses: "frameRoses", night: "frameNight", none: "none" };
  FRAMES.forEach(id => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.glFrame = id;
    button.setAttribute("role", "radio");
    button.innerHTML = `<i class="gl-frame-swatch gl-swatch-${id}" aria-hidden="true"></i><span data-choice-label="${FRAME_LABELS[id]}"></span>`;
    studio.querySelector(".gl-frame-grid").append(button);
  });
  TYPES.forEach(id => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.glType = id;
    button.setAttribute("role", "radio");
    button.innerHTML = `<i class="gl-type-sample" aria-hidden="true">Aa</i><span data-choice-label="${id}"></span>`;
    studio.querySelector(".gl-type-grid").append(button);
  });

  const language = () => {
    const current = String(localStorage.getItem("nurLanguage") || document.querySelector("#languageButton")?.textContent || document.documentElement.lang || "ru").trim().toLowerCase();
    return TEXT[current] ? current : "en";
  };
  const copy = key => (TEXT[language()] || TEXT.en)[key] || TEXT.en[key] || TEXT.ru[key] || key;
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
    const values = { glFrame: state.frame, glType: state.type };
    const defaults = { glFrame: DEFAULT_FRAME, glType: "classic" };
    Object.entries(values).forEach(([key, value]) => value && value !== defaults[key] ? url.searchParams.set(key, value) : url.searchParams.delete(key));
    url.searchParams.delete("glInk");
    history.replaceState(history.state, "", url);
  };
  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncUrl();
  };

  const renderChoices = () => {
    [["glFrame", state.frame], ["glType", state.type]].forEach(([key, selected]) => {
      studio.querySelectorAll(`[data-${key.replace(/[A-Z]/g, value => `-${value.toLowerCase()}`)}]`).forEach(button => {
        const active = button.dataset[key] === selected;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-checked", String(active));
      });
    });
  };

  // Бумага письма почти непрозрачная: текст не просвечивает фоном и остаётся чётким.
  const applyPaper = () => {
    document.documentElement.style.setProperty("--gl-scene-dim", "0.2");
    document.documentElement.style.setProperty("--gl-paper-alpha", "0.95");
  };

  const applyDesign = () => {
    const sharedPresentation = params.has("msg") && ["glFrame", "glType"].some(key => params.has(key));
    const shownFrame = premium || sharedPresentation ? state.frame : DEFAULT_FRAME;
    document.body.dataset.glFrame = shownFrame;
    document.body.dataset.glInk = "ink";
    document.body.dataset.glType = premium || sharedPresentation ? state.type : "classic";
    letter.dataset.glFrame = shownFrame;
    drawFrame(shownFrame);
  };
  const detectPremium = () => {
    const card = document.querySelector(".premium-settings-card");
    premium = document.body.dataset.access === "vip" || document.body.classList.contains("gl-premium-active") || Boolean(card && card.hidden);
    const block = studio.querySelector(".gl-premium-block");
    block.classList.toggle("is-locked", !premium);
    studio.querySelector(".gl-locked-note").hidden = premium;
    studio.querySelectorAll("[data-gl-frame],[data-gl-type]").forEach(button => {
      const free = button.dataset.glFrame === DEFAULT_FRAME || button.dataset.glType === "classic";
      button.setAttribute("aria-disabled", String(!premium && !free));
    });
    applyDesign();
  };
  const requestPremium = () => {
    notify("locked");
    document.querySelector("#settingsPurchase")?.click();
  };

  studio.querySelector(".gl-frame-grid").addEventListener("click", event => {
    const button = event.target.closest("[data-gl-frame]"); if (!button) return;
    if (!premium && button.dataset.glFrame !== DEFAULT_FRAME) return requestPremium();
    state.frame = valid(button.dataset.glFrame, FRAMES, DEFAULT_FRAME); persist(); applyDesign(); renderChoices(); notify("saved");
  });
  studio.querySelector(".gl-type-grid").addEventListener("click", event => {
    const button = event.target.closest("[data-gl-type]"); if (!button) return;
    if (!premium && button.dataset.glType !== "classic") return requestPremium();
    state.type = valid(button.dataset.glType, TYPES, "classic"); persist(); applyDesign(); renderChoices(); notify("saved");
  });

  const premiumCard = document.querySelector(".premium-settings-card");
  if (premiumCard) new MutationObserver(detectPremium).observe(premiumCard, { attributes: true, attributeFilter: ["hidden", "style", "class"] });
  addEventListener("nur-entitlement", () => setTimeout(detectPremium));
  addEventListener("glowletter-access-change", event => { premium = Boolean(event.detail?.premium); detectPremium(); });
  new MutationObserver(() => setTimeout(() => { localize(); renderChoices(); }, 0)).observe(document.querySelector("#languageButton"), { childList: true, characterData: true, subtree: true });

  localize(); renderChoices(); applyPaper(); applyDesign(); detectPremium(); syncUrl();
})();
