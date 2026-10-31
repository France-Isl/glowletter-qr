/*
  Магазин и кошелёк (01.11). Две валюты живут только на сервере:
    «Светлячки» — покупаются в Google Play (300 / 1000 / 3500 / 15000), 100 в подарок каждому;
    «Доллары» — валюта стола «Дурака», покупаются за светлячки и обратно не меняются.
  Здесь: подарки (цветы, мишки, сладости) для себя и друзей, рубашки колоды, сукно стола,
  усиления, обмен на доллары, отправка светлячков другу (до 1000 в день) и пин-коды.
  В «Настройках» — раздел «Светлячки и пин-код»; админ там же создаёт пин-коды.
*/
(() => {
  "use strict";
  if (window.GlowLetterShop) return;

  const COIN_PACKS = [
    { id: "glowletter_coins_300", coins: 300, price: "1,99 €" },
    { id: "glowletter_coins_1000", coins: 1000, price: "5,99 €" },
    { id: "glowletter_coins_3500", coins: 3500, price: "14,99 €" },
    { id: "glowletter_coins_15000", coins: 15000, price: "49,99 €" }
  ];
  const ART = {
    rose: "🌹", tulips: "🌷", sunflower: "🌻", lily: "🪷", bouquet: "💐", bear: "🧸", big_bear: "🧸", bear_rose: "🧸",
    heart_box: "💝", candy: "🍬", cake: "🎂", cupcake: "🧁", boost_x2: "⚡", hint: "💡", shield: "🛡️", insurance: "☂️"
  };
  const SCENE = { bear_rose: "🌹", big_bear: "❤️" };

  const TEXT = {
    ru: {
      title: "Магазин", coins: "Светлячки", dollars: "Доллары", tabGifts: "Подарки", tabStyle: "Колода и стол", tabBoost: "Усиления", tabDollars: "Доллары", tabCoins: "Светлячки", tabPin: "Пин-код",
      buy: "Купить", owned: "Есть: {n}", equip: "Выбрать", equipped: "Выбрано", give: "Подарить", use: "Включить", free: "Своё",
      rose: "Роза", tulips: "Тюльпаны", sunflower: "Подсолнух", lily: "Лилия", bouquet: "Букет", bear: "Мишка", big_bear: "Большой мишка", bear_rose: "Мишка с розой",
      heart_box: "Сердце-шкатулка", candy: "Конфеты", cake: "Торт", cupcake: "Пирожное",
      back_classic: "Бордовая классика", back_khokhloma: "Хохлома", back_gzhel: "Гжель", back_gold: "Золотая",
      cloth_green: "Зелёное сукно", cloth_burgundy: "Бордовое сукно", cloth_wood: "Дубовый стол", cloth_night: "Ночное сукно",
      boost_x2: "×2 к выигрышу на час", hint: "Подсказка хода", shield: "Щит серии", insurance: "Страховка от проигрыша",
      boost_x2Note: "Выигрыш в «Дураке» удваивается целый час", hintNote: "Покажет лучший ход в игре с ботами", shieldNote: "Пропуск дня не сбросит награду дня", insuranceNote: "Проигрыш вернёт половину ставки один раз",
      exchange: "{c} светлячков → {d} $", exchangeNote: "Доллары — для ставок в «Дураке». Обратно на светлячки не меняются.",
      coinsNote: "Светлячки покупаются в приложении GlowLetter из Google Play.", buyInApp: "Купить в приложении", soon: "Покупка светлячков откроется с новой версией приложения",
      sendTitle: "Отправить светлячки другу", sendNote: "Не больше 1000 в день. Сегодня отправлено: {n}", sendTo: "Кому", amount: "Сколько", send: "Отправить", sent: "Отправлено: {n}",
      pinTitle: "Пин-код", pinNote: "Введите код, который вам дали, — светлячки придут сразу", pinPlaceholder: "Например, GLOW2026", activate: "Активировать", pinOk: "+{n} светлячков!",
      code_invalid: "Такого кода нет", code_used_up: "Код уже использован полностью", code_already: "Вы уже активировали этот код", code_expired: "Срок кода закончился", rate_limited: "Слишком много попыток. Попробуйте через час",
      not_enough_coins: "Не хватает светлячков", not_enough_dollars: "Не хватает долларов", already_owned: "Уже куплено", locked: "Сначала купите", send_limit: "Лимит 1000 в день", not_friends: "Можно только друзьям",
      signIn: "Войдите в аккаунт", error: "Не получилось. Проверьте интернет", bought: "Куплено: {name}", gifted: "Подарок отправлен: {name}", chooseFriend: "Кому подарить?", noFriends: "Сначала добавьте друзей",
      boostOn: "Включено", balance: "{c} светлячков · {d} $", settingsTitle: "Светлячки и пин-код", openShop: "Открыть магазин",
      adminTitle: "Пин-коды (админ)", adminCoins: "Светлячков", adminUses: "Активаций", adminDays: "Дней (0 — без срока)", adminCode: "Свой код (можно пусто)", adminNote2: "Заметка", create: "Создать код", created: "Код {code} создан", uses: "{u} из {m}", off: "Выключить", on: "Включить", copy: "Копировать", copied: "Скопировано",
      wall: "Мои подарки", wallEmpty: "Пока подарков нет", homeDurak: "Дурак", homeShop: "Магазин",
      chatDurakFrom: "{name} зовёт сыграть в «Дурака»", chatDurakYou: "Вы позвали за стол «Дурака»", chatDurakJoin: "Сесть за стол", chatGiftFrom: "Подарок от {name}: {item}", chatGiftYou: "Вы подарили: {item}", chatCoinsFrom: "От {name}: {n} светлячков", chatCoinsYou: "Вы отправили {n} светлячков", chatThanks: "Спасибо!"
    },
    en: {
      title: "Shop", coins: "Fireflies", dollars: "Dollars", tabGifts: "Gifts", tabStyle: "Deck & table", tabBoost: "Boosts", tabDollars: "Dollars", tabCoins: "Fireflies", tabPin: "PIN code",
      buy: "Buy", owned: "Owned: {n}", equip: "Choose", equipped: "Selected", give: "Give", use: "Turn on", free: "Default",
      rose: "Rose", tulips: "Tulips", sunflower: "Sunflower", lily: "Lily", bouquet: "Bouquet", bear: "Teddy", big_bear: "Big teddy", bear_rose: "Teddy with a rose",
      heart_box: "Heart box", candy: "Candy", cake: "Cake", cupcake: "Cupcake",
      back_classic: "Burgundy classic", back_khokhloma: "Khokhloma", back_gzhel: "Gzhel", back_gold: "Gold",
      cloth_green: "Green felt", cloth_burgundy: "Burgundy felt", cloth_wood: "Oak table", cloth_night: "Night felt",
      boost_x2: "×2 winnings for an hour", hint: "Move hint", shield: "Streak shield", insurance: "Loss insurance",
      boost_x2Note: "Durak winnings are doubled for an hour", hintNote: "Shows the best move in games with bots", shieldNote: "Missing a day won't reset the daily reward", insuranceNote: "A loss returns half the stake once",
      exchange: "{c} fireflies → ${d}", exchangeNote: "Dollars are for Durak stakes. They can't be changed back into fireflies.",
      coinsNote: "Fireflies are bought in the GlowLetter app from Google Play.", buyInApp: "Buy in the app", soon: "Buying fireflies opens with the new app version",
      sendTitle: "Send fireflies to a friend", sendNote: "Up to 1000 a day. Sent today: {n}", sendTo: "To", amount: "Amount", send: "Send", sent: "Sent: {n}",
      pinTitle: "PIN code", pinNote: "Enter the code you were given — fireflies arrive at once", pinPlaceholder: "For example, GLOW2026", activate: "Activate", pinOk: "+{n} fireflies!",
      code_invalid: "No such code", code_used_up: "This code is fully used", code_already: "You have already used this code", code_expired: "This code has expired", rate_limited: "Too many attempts. Try again in an hour",
      not_enough_coins: "Not enough fireflies", not_enough_dollars: "Not enough dollars", already_owned: "Already bought", locked: "Buy it first", send_limit: "Limit is 1000 a day", not_friends: "Friends only",
      signIn: "Sign in to your account", error: "Something went wrong. Check the connection", bought: "Bought: {name}", gifted: "Gift sent: {name}", chooseFriend: "Who gets the gift?", noFriends: "Add friends first",
      boostOn: "On", balance: "{c} fireflies · ${d}", settingsTitle: "Fireflies & PIN code", openShop: "Open the shop",
      adminTitle: "PIN codes (admin)", adminCoins: "Fireflies", adminUses: "Activations", adminDays: "Days (0 — no limit)", adminCode: "Own code (optional)", adminNote2: "Note", create: "Create code", created: "Code {code} created", uses: "{u} of {m}", off: "Turn off", on: "Turn on", copy: "Copy", copied: "Copied",
      wall: "My gifts", wallEmpty: "No gifts yet", homeDurak: "Durak", homeShop: "Shop",
      chatDurakFrom: "{name} invites you to play Durak", chatDurakYou: "You invited them to a Durak table", chatDurakJoin: "Take a seat", chatGiftFrom: "A gift from {name}: {item}", chatGiftYou: "You gave: {item}", chatCoinsFrom: "From {name}: {n} fireflies", chatCoinsYou: "You sent {n} fireflies", chatThanks: "Thank you!"
    }
  };
  Object.entries(window.GLOWLETTER_SHOP_I18N || {}).forEach(([lang, values]) => { TEXT[lang] = { ...(TEXT[lang] || {}), ...values }; });

  const state = { root: null, tab: "gifts", wallet: null, items: [], busy: false, giving: null, wall: null, admin: null };
  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const signedIn = () => Boolean(cloud()?.getState?.().signedIn);
  const isAdmin = () => Boolean(cloud()?.getState?.().isAdmin);
  const language = () => String(app()?.getState?.().language || document.documentElement.lang || "ru").toLowerCase();
  const tr = (key, values = {}) => String(TEXT[language()]?.[key] ?? TEXT.en[key] ?? TEXT.ru[key] ?? key).replace(/\{(\w+)\}/g, (all, name) => values[name] ?? "");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const num = value => { try { return new Intl.NumberFormat(language() === "ind" ? "id" : language()).format(value || 0); } catch { return String(value || 0); } };
  const notify = (text, ms = 3600) => app()?.notify?.(text, ms);
  const errorText = error => { const code = String(error?.message || error?.code || ""); return TEXT.ru[code] ? tr(code) : tr("error"); };

  async function rpc(name, args = {}) {
    const db = client();
    if (!db) throw new Error("offline");
    const { data, error } = await db.rpc(name, args);
    if (error) throw new Error(error.message || "error");
    return data;
  }

  async function refresh() {
    if (!signedIn()) return;
    try {
      const [wallet, items] = await Promise.all([rpc("glowletter_wallet"), state.items.length ? state.items : rpc("glowletter_shop_items")]);
      state.wallet = wallet;
      state.items = items || [];
      dispatchEvent(new CustomEvent("glowletter-wallet-change", { detail: { coins: wallet.coins, dollars: wallet.dollars } }));
    } catch {}
    render();
    renderSettings();
  }

  const coinSvg = `<svg class="gs-coin" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" fill="#f2c96f" stroke="#a8741f" stroke-width="1.2"/><circle cx="12" cy="12" r="7.4" fill="none" stroke="#fff3c4" stroke-width=".9" opacity=".8"/><path d="M12 17.2s-4.3-2.6-5.5-5.2c-.8-1.9.4-4.1 2.5-4.1 1.2 0 2.1.7 3 1.8.9-1.1 1.8-1.8 3-1.8 2.1 0 3.3 2.2 2.5 4.1-1.2 2.6-5.5 5.2-5.5 5.2Z" fill="#a3213a"/></svg>`;

  function ensureRoot() {
    if (state.root) return state.root;
    const root = document.createElement("section");
    root.className = "gs-root";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.addEventListener("click", onClick);
    root.addEventListener("submit", onSubmit);
    root.addEventListener("keydown", event => { if (event.key === "Escape") { if (state.giving) { state.giving = null; render(); } else close(); } });
    document.body.append(root);
    state.root = root;
    return root;
  }

  function open(tab = "gifts") {
    ensureRoot();
    state.tab = ["gifts", "style", "boost", "dollars", "coins", "pin"].includes(tab) ? tab : "gifts";
    state.root.hidden = false;
    document.body.classList.add("gs-open");
    render();
    requestAnimationFrame(() => state.root.classList.add("is-open"));
    refresh();
  }

  function close() {
    if (!state.root) return;
    state.root.classList.remove("is-open");
    document.body.classList.remove("gs-open");
    setTimeout(() => { if (!state.root.classList.contains("is-open")) state.root.hidden = true; }, 240);
  }

  const owned = id => Number(state.wallet?.inventory?.[id] || 0);

  function giftArt(id) {
    return `<span class="gs-art" aria-hidden="true"><span class="gs-art-glow"></span><b>${ART[id] || "🎁"}</b>${SCENE[id] ? `<i>${SCENE[id]}</i>` : ""}</span>`;
  }

  function itemCard(item) {
    const n = owned(item.id);
    const priceBtn = `<button class="gs-buy" type="button" data-act="buy" data-id="${item.id}"${state.busy ? " disabled" : ""}>${coinSvg}${esc(num(item.price))}</button>`;
    if (item.kind === "gift") {
      return `<article class="gs-item">${giftArt(item.id)}<h4>${esc(tr(item.id))}</h4>${n ? `<small>${esc(tr("owned", { n }))}</small>` : "<small>&nbsp;</small>"}<div class="gs-row">${priceBtn}${n ? `<button class="gs-give" type="button" data-act="give" data-id="${item.id}">${esc(tr("give"))}</button>` : ""}</div></article>`;
    }
    if (item.kind === "boost") {
      const on = item.id === "boost_x2" && state.wallet?.boost_until;
      return `<article class="gs-item is-wide">${giftArt(item.id)}<div class="gs-text"><h4>${esc(tr(item.id))}</h4><p>${esc(tr(`${item.id}Note`))}</p>${n ? `<small>${esc(tr("owned", { n }))}</small>` : ""}${on ? `<small class="gs-on">⚡ ${esc(tr("boostOn"))}</small>` : ""}</div><div class="gs-col">${priceBtn}${n && item.id !== "hint" ? `<button class="gs-give" type="button" data-act="use" data-id="${item.id}">${esc(tr("use"))}</button>` : ""}</div></article>`;
    }
    return "";
  }

  function styleCard(id, kind, price) {
    const mine = kind === "back" ? state.wallet?.card_back : state.wallet?.cloth;
    const has = price === 0 || owned(id) > 0;
    const preview = kind === "back"
      ? `<span class="gs-back"><img src="${window.GlowDurakCards?.back(id) || ""}" alt=""></span>`
      : `<span class="gs-cloth" data-cloth="${id}"></span>`;
    const action = mine === id
      ? `<span class="gs-equipped">✓ ${esc(tr("equipped"))}</span>`
      : has ? `<button class="gs-give" type="button" data-act="equip" data-id="${id}">${esc(tr("equip"))}</button>`
        : `<button class="gs-buy" type="button" data-act="buy" data-id="${id}">${coinSvg}${esc(num(price))}</button>`;
    return `<article class="gs-item">${preview}<h4>${esc(tr(id))}</h4><small>${price === 0 ? esc(tr("free")) : "&nbsp;"}</small><div class="gs-row">${action}</div></article>`;
  }

  function tabBody() {
    const w = state.wallet;
    const items = state.items;
    if (state.tab === "gifts") {
      const wall = state.wall ? Object.entries(state.wall) : [];
      return `<div class="gs-grid">${items.filter(i => i.kind === "gift").map(itemCard).join("")}</div>
        <section class="gs-panel"><h3>${esc(tr("wall"))}</h3>${state.wall == null ? "…" : wall.length ? `<div class="gs-wall">${wall.map(([id, n]) => `<span>${ART[id] || "🎁"}<b>×${n}</b></span>`).join("")}</div>` : `<p class="gs-note">${esc(tr("wallEmpty"))}</p>`}</section>`;
    }
    if (state.tab === "style") {
      const price = id => items.find(i => i.id === id)?.price || 0;
      return `<div class="gs-grid">${["back_classic", "back_khokhloma", "back_gzhel", "back_gold"].map(id => styleCard(id, "back", id === "back_classic" ? 0 : price(id))).join("")}</div>
        <div class="gs-grid">${["cloth_green", "cloth_burgundy", "cloth_wood", "cloth_night"].map(id => styleCard(id, "cloth", id === "cloth_green" ? 0 : price(id))).join("")}</div>`;
    }
    if (state.tab === "boost") return `<div class="gs-list">${items.filter(i => i.kind === "boost").map(itemCard).join("")}</div>`;
    if (state.tab === "dollars") {
      const rates = w?.exchange || [];
      return `<p class="gs-note">${esc(tr("exchangeNote"))}</p><div class="gs-list">${rates.map((rate, i) => `<article class="gs-item is-wide gs-rate"><span class="gs-art" aria-hidden="true"><span class="gs-art-glow"></span><b>${["💵", "💰", "💰", "🏦", "👑"][i] || "💵"}</b></span><div class="gs-text"><h4>${esc(num(rate.dollars))} $</h4>${i ? `<small class="gs-on">+${Math.round((rate.dollars / rate.coins / 50 - 1) * 100)}%</small>` : ""}</div><button class="gs-buy" type="button" data-act="exchange" data-coins="${rate.coins}"${state.busy ? " disabled" : ""}>${coinSvg}${esc(num(rate.coins))}</button></article>`).join("")}</div>`;
    }
    if (state.tab === "coins") {
      const native = Boolean(window.NurBilling?.buyCoins);
      const friends = window.GlowLetterFriends?.friends?.() || [];
      return `<p class="gs-note">${esc(native ? "" : tr("coinsNote"))}</p>
        <div class="gs-list">${COIN_PACKS.map((pack, i) => `<article class="gs-item is-wide gs-pack${i === 3 ? " is-best" : ""}"><span class="gs-art" aria-hidden="true"><span class="gs-art-glow"></span>${coinSvg.replace("gs-coin", "gs-coin is-big")}</span><div class="gs-text"><h4>${esc(num(pack.coins))}</h4><small>${esc(tr("coins"))}</small></div><button class="gs-buy is-money" type="button" data-act="coins" data-id="${pack.id}"${native ? "" : " disabled"}>${esc(pack.price)}</button></article>`).join("")}</div>
        ${native ? "" : `<p class="gs-note">${esc(tr("soon"))}</p>`}
        <section class="gs-panel"><h3>${esc(tr("sendTitle"))}</h3><p class="gs-note">${esc(tr("sendNote", { n: num(w?.sent_today || 0) }))}</p>
          ${friends.length ? `<form class="gs-form" data-form="send"><label>${esc(tr("sendTo"))}<select name="to">${friends.map(f => `<option value="${esc(f.user_id)}">${esc(f.name)}</option>`).join("")}</select></label><label>${esc(tr("amount"))}<input name="amount" type="number" inputmode="numeric" min="1" max="1000" value="50"></label><button class="gs-primary" type="submit">${esc(tr("send"))}</button></form>` : `<p class="gs-note">${esc(tr("noFriends"))}</p>`}
        </section>`;
    }
    return pinForm();
  }

  function pinForm() {
    return `<section class="gs-panel gs-pin"><h3>${esc(tr("pinTitle"))}</h3><p class="gs-note">${esc(tr("pinNote"))}</p>
      <form class="gs-form is-inline" data-form="pin"><input name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24" placeholder="${esc(tr("pinPlaceholder"))}" required><button class="gs-primary" type="submit">${esc(tr("activate"))}</button></form></section>`;
  }

  function render() {
    if (!state.root || state.root.hidden) return;
    const w = state.wallet;
    const tabs = [["gifts", "tabGifts"], ["style", "tabStyle"], ["boost", "tabBoost"], ["dollars", "tabDollars"], ["coins", "tabCoins"], ["pin", "tabPin"]];
    state.root.innerHTML = `
      <header class="gs-top">
        <button class="gs-round" type="button" data-act="close" aria-label="×"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <h2>${esc(tr("title"))}</h2>
      </header>
      <div class="gs-balance">
        <div class="gs-bal is-coins">${coinSvg.replace("gs-coin", "gs-coin is-big")}<span><small>${esc(tr("coins"))}</small><b>${w ? esc(num(w.coins)) : "…"}</b></span></div>
        <div class="gs-bal is-dollars"><i>$</i><span><small>${esc(tr("dollars"))}</small><b>${w ? esc(num(w.dollars)) : "…"}</b></span></div>
      </div>
      <nav class="gs-tabs" role="tablist">${tabs.map(([id, key]) => `<button type="button" role="tab" aria-selected="${state.tab === id}" class="${state.tab === id ? "is-on" : ""}" data-tab="${id}">${esc(tr(key))}</button>`).join("")}</nav>
      <div class="gs-scroll">${signedIn() ? tabBody() : `<p class="gs-note">${esc(tr("signIn"))}</p>`}</div>
      ${state.giving ? givePicker() : ""}`;
    state.root.querySelector(".gs-tabs .is-on")?.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function givePicker() {
    const friends = window.GlowLetterFriends?.friends?.() || [];
    return `<div class="gs-sheet" role="dialog" aria-modal="true"><div class="gs-sheet-card">${giftArt(state.giving)}<h3>${esc(tr("chooseFriend"))}</h3>
      ${friends.length ? friends.map(f => `<button class="gs-friend" type="button" data-act="give-to" data-id="${esc(f.user_id)}" data-name="${esc(f.name)}">${f.online ? "🟢" : "⚪"} ${esc(f.name)}</button>`).join("") : `<p class="gs-note">${esc(tr("noFriends"))}</p>`}
      <button class="gs-link" type="button" data-act="give-cancel">×</button></div></div>`;
  }

  async function guarded(task) {
    if (state.busy) return;
    state.busy = true;
    render();
    try { await task(); } catch (error) { notify(errorText(error)); }
    finally { state.busy = false; await refresh(); }
  }

  async function onClick(event) {
    const tab = event.target.closest("[data-tab]");
    if (tab) {
      state.tab = tab.dataset.tab;
      render();
      if (state.tab === "gifts" && state.wall == null) rpc("glowletter_gift_wall", { p_user: null }).then(wall => { state.wall = wall || {}; render(); }).catch(() => { state.wall = {}; });
      return;
    }
    const button = event.target.closest("[data-act]");
    if (!button) return;
    const id = button.dataset.id;
    switch (button.dataset.act) {
      case "close": close(); return;
      case "buy": return guarded(async () => { await rpc("glowletter_shop_buy", { p_item: id, p_qty: 1 }); notify(tr("bought", { name: tr(id) })); try { navigator.vibrate?.(20); } catch {} });
      case "equip": return guarded(() => rpc("glowletter_shop_equip", { p_item: id }));
      case "use": return guarded(() => rpc("glowletter_boost_use", { p_item: id }));
      case "exchange": return guarded(async () => { const got = await rpc("glowletter_exchange", { p_coins: Number(button.dataset.coins) }); notify(`+${num(got.dollars_added)} $`); });
      case "give": state.giving = id; render(); return;
      case "give-cancel": state.giving = null; render(); return;
      case "give-to": { const item = state.giving; state.giving = null; return guarded(async () => { await rpc("glowletter_gift_send", { p_item: item, p_to: id }); notify(tr("gifted", { name: button.dataset.name || "" })); }); }
      case "coins": try { window.NurBilling?.buyCoins?.(id); } catch {} return;
      default:
    }
  }

  async function redeem(code) {
    const got = await rpc("glowletter_promo_redeem", { p_code: code });
    notify(tr("pinOk", { n: num(got.amount) }), 4200);
    try { navigator.vibrate?.([20, 40, 20]); } catch {}
  }

  async function onSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    if (form.dataset.form === "pin") return guarded(async () => { await redeem(String(data.get("code") || "")); form.reset(); });
    if (form.dataset.form === "send") return guarded(async () => {
      const amount = Math.round(Number(data.get("amount")) || 0);
      await rpc("glowletter_coins_send", { p_to: String(data.get("to") || ""), p_amount: amount });
      notify(tr("sent", { n: num(amount) }));
    });
  }

  // ——— «Настройки»: раздел «Светлячки и пин-код» ———
  async function renderSettings() {
    const host = document.querySelector("[data-shop-settings]");
    if (!host) return;
    const title = document.querySelector("#settingsWalletTitle");
    if (title) title.textContent = tr("settingsTitle");
    const w = state.wallet;
    host.innerHTML = `
      <div class="gs-set-balance">${coinSvg}<b>${w ? esc(tr("balance", { c: num(w.coins), d: num(w.dollars) })) : esc(signedIn() ? "…" : tr("signIn"))}</b><button type="button" class="gs-set-open" data-shop-open>${esc(tr("openShop"))}</button></div>
      <form class="gs-form is-inline" data-settings-pin><input name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24" placeholder="${esc(tr("pinPlaceholder"))}" aria-label="${esc(tr("pinTitle"))}" required><button class="gs-primary" type="submit">${esc(tr("activate"))}</button></form>
      <p class="gs-note">${esc(tr("pinNote"))}</p>
      ${isAdmin() ? adminBlock() : ""}`;
  }

  function adminBlock() {
    const list = state.admin || [];
    return `<section class="gs-admin"><h4>${esc(tr("adminTitle"))}</h4>
      <form class="gs-form" data-admin-pin>
        <label>${esc(tr("adminCoins"))}<input name="coins" type="number" min="1" max="1000000" value="1000" required></label>
        <label>${esc(tr("adminUses"))}<input name="uses" type="number" min="1" max="100000" value="20" required></label>
        <label>${esc(tr("adminDays"))}<input name="days" type="number" min="0" max="3650" value="0"></label>
        <label>${esc(tr("adminCode"))}<input name="code" maxlength="24" autocapitalize="characters" spellcheck="false"></label>
        <label>${esc(tr("adminNote2"))}<input name="note" maxlength="120"></label>
        <button class="gs-primary" type="submit">${esc(tr("create"))}</button>
      </form>
      <div class="gs-codes">${list.map(code => `<div class="gs-code${code.active ? "" : " is-off"}"><b>${esc(code.code)}</b><span>${coinSvg}${esc(num(code.coins))} · ${esc(tr("uses", { u: code.uses, m: code.max_uses }))}${code.note ? ` · ${esc(code.note)}` : ""}</span><button type="button" data-admin-copy="${esc(code.code)}">${esc(tr("copy"))}</button><button type="button" data-admin-toggle="${esc(code.code)}" data-on="${code.active ? "0" : "1"}">${esc(code.active ? tr("off") : tr("on"))}</button></div>`).join("")}</div>
    </section>`;
  }

  async function loadAdmin() {
    if (!isAdmin()) return;
    try { state.admin = await rpc("glowletter_admin_promo_list"); } catch { state.admin = []; }
    renderSettings();
  }

  document.addEventListener("submit", async event => {
    const pin = event.target.closest("[data-settings-pin]");
    const admin = event.target.closest("[data-admin-pin]");
    if (!pin && !admin) return;
    event.preventDefault();
    const data = new FormData(event.target);
    try {
      if (pin) { await redeem(String(data.get("code") || "")); pin.reset(); await refresh(); }
      else {
        const made = await rpc("glowletter_admin_promo_create", { p_code: String(data.get("code") || ""), p_coins: Number(data.get("coins")), p_max_uses: Number(data.get("uses")), p_note: String(data.get("note") || ""), p_days: Number(data.get("days") || 0) });
        notify(tr("created", { code: made.code }), 6000);
        admin.reset();
        await loadAdmin();
      }
    } catch (error) { notify(errorText(error)); }
  });
  document.addEventListener("click", async event => {
    if (event.target.closest("[data-shop-open]")) { open("gifts"); return; }
    if (event.target.closest("[data-open-shop]")) { event.preventDefault(); open("gifts"); return; }
    const copy = event.target.closest("[data-admin-copy]");
    if (copy) { try { await navigator.clipboard.writeText(copy.dataset.adminCopy); notify(tr("copied")); } catch {} return; }
    const toggle = event.target.closest("[data-admin-toggle]");
    if (toggle) { try { await rpc("glowletter_admin_promo_toggle", { p_code: toggle.dataset.adminToggle, p_active: toggle.dataset.on === "1" }); } catch (error) { notify(errorText(error)); } loadAdmin(); }
  });
  // Раздел в настройках обновляется, когда настройки открывают.
  document.addEventListener("toggle", event => { if (event.target?.id === "settingsWallet" && event.target.open) { refresh(); loadAdmin(); } }, true);
  addEventListener("glowletter-wallet-change", () => { if (state.root && !state.root.hidden) render(); });
  function localizeHome() {
    const durak = document.getElementById("homeQuickDurak");
    const shop = document.getElementById("homeQuickShop");
    if (durak) durak.textContent = tr("homeDurak");
    if (shop) shop.textContent = tr("homeShop");
    renderSettings();
  }
  addEventListener("glowletter-language-changed", () => setTimeout(() => { localizeHome(); render(); }, 0));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", localizeHome, { once: true }); else localizeHome();

  window.GlowLetterShop = Object.freeze({ open, refresh, text: tr, art: id => ART[id] || "🎁", number: num });
})();
