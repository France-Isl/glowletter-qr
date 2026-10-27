/*
  Оформление письма (2.4.20): только стиль текста.

  Рамок нет по решению владельца: письмо — чистая бумага на красивом фоне.
  Цвет чернил убран, из шрифтов оставлены три самых красивых. Фон выбирается
  в app.js.
*/
(() => {
  "use strict";

  const STORAGE_KEY = "glowletter-experience";
  const TYPES = ["classic", "poetic", "clear"];

  const TEXT = {
    ru: {
      eyebrow: "ОФОРМЛЕНИЕ ПИСЬМА", title: "Как выглядит письмо",
      premium: "Премиум-оформление",
      type: "Стиль текста", pro: "VIP",
      classic: "Классика", poetic: "Поэтичный", clear: "Чёткий",
      locked: "Доступно в полной версии", saved: "Оформление сохранено"
    },
    en: {
      eyebrow: "LETTER STYLING", title: "How the letter looks",
      premium: "Premium styling",
      type: "Text style", pro: "VIP",
      classic: "Classic", poetic: "Poetic", clear: "Clear",
      locked: "Available with full access", saved: "Style saved"
    },
    fr: {
      eyebrow: "STYLE DE LA LETTRE", title: "L’allure de la lettre",
      premium: "Style premium",
      type: "Style du texte", pro: "VIP",
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
    type: valid(params.get("glType") || stored.type, TYPES, "classic")
  };

  let premium = false;
  let statusTimer = 0;

  const settingsAnchor = document.querySelector(".scene-picker");
  const letter = document.querySelector("#letter");
  if (!settingsAnchor || !letter) return;

  const studio = document.createElement("section");
  studio.className = "gl-visual-studio";
  studio.setAttribute("aria-labelledby", "glVisualTitle");
  studio.innerHTML = `
    <header class="gl-studio-head"><div><small data-gl-text="eyebrow"></small><h3 id="glVisualTitle" data-gl-text="title"></h3></div><b class="gl-pro" data-gl-text="pro"></b></header>
    <div class="gl-premium-block">
      <fieldset class="gl-studio-group"><legend data-gl-text="type"></legend><div class="gl-type-grid" role="radiogroup"></div></fieldset>
      <p class="gl-locked-note" data-gl-text="locked"></p>
    </div>
    <p class="gl-studio-status" role="status" aria-live="polite"></p>`;
  settingsAnchor.insertAdjacentElement("afterend", studio);

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
    const values = { glType: state.type };
    const defaults = { glType: "classic" };
    Object.entries(values).forEach(([key, value]) => value && value !== defaults[key] ? url.searchParams.set(key, value) : url.searchParams.delete(key));
    url.searchParams.delete("glInk");
    url.searchParams.delete("glFrame");
    history.replaceState(history.state, "", url);
  };
  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncUrl();
  };

  const renderChoices = () => {
    [["glType", state.type]].forEach(([key, selected]) => {
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
    const sharedPresentation = params.has("msg") && ["glType"].some(key => params.has(key));
    document.body.dataset.glFrame = "none";
    document.body.dataset.glInk = "ink";
    document.body.dataset.glType = premium || sharedPresentation ? state.type : "classic";
    letter.dataset.glFrame = "none";
  };
  const detectPremium = () => {
    const card = document.querySelector(".premium-settings-card");
    premium = document.body.dataset.access === "vip" || document.body.classList.contains("gl-premium-active") || Boolean(card && card.hidden);
    const block = studio.querySelector(".gl-premium-block");
    block.classList.toggle("is-locked", !premium);
    studio.querySelector(".gl-locked-note").hidden = premium;
    studio.querySelectorAll("[data-gl-type]").forEach(button => {
      const free = button.dataset.glType === "classic";
      button.setAttribute("aria-disabled", String(!premium && !free));
    });
    applyDesign();
  };
  const requestPremium = () => {
    notify("locked");
    document.querySelector("#settingsPurchase")?.click();
  };

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
