/*
  Друзья и личные сообщения (2.4.22).

  У каждого аккаунта есть код дружбы. По нему человека добавляют в друзья;
  писать можно только принятым друзьям. «В сети» — по отметке last_seen,
  которую приложение обновляет раз в минуту, пока открыто. Новые сообщения
  и заявки приходят через Realtime. Сообщения проходят фильтр слов, ссылки
  запрещены, есть «Пожаловаться» и «Заблокировать». Тексты на остальных
  языках — в friends-i18n.js.
*/
(() => {
  "use strict";

  if (window.GlowLetterFriends) return;

  const ONLINE_MS = 150000;
  const HEARTBEAT_MS = 60000;
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.7 4.3 13a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l1.2 1.2 1.2-1.2a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5Z"/></svg>';
  const icon = id => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

  const TEXT = {
    ru: {
      home: "Друзья", eyebrow: "GLOWLETTER · ДРУЗЬЯ", title: "Друзья", close: "Закрыть", back: "Назад",
      signIn: "Войдите, чтобы добавлять друзей и переписываться.", signInButton: "Войти",
      nameTitle: "Как вас зовут?", nameNote: "Это имя увидят ваши друзья.", namePlaceholder: "Ваше имя", nameSave: "Сохранить", nameInvalid: "Введите обычное имя.",
      myCode: "Ваш код дружбы", codeNote: "Дайте этот код близкому человеку — по нему вас добавят в друзья.", copyCode: "Скопировать", shareCode: "Поделиться", codeCopied: "Код скопирован",
      shareText: "Добавь меня в друзья в GlowLetter — мой код: {code}",
      addTitle: "Добавить друга", addPlaceholder: "Код друга", add: "Добавить",
      notFound: "Такого кода нет. Проверьте и попробуйте ещё раз.", self: "Это ваш собственный код.", sent: "Заявка отправлена", accepted: "Теперь вы друзья!", already: "Вы уже друзья", pendingAlready: "Заявка уже отправлена",
      requests: "Заявки в друзья", accept: "Принять", decline: "Отклонить", outgoing: "Ждут ответа",
      friends: "Ваши друзья", none: "Пока нет друзей. Поделитесь своим кодом!",
      online: "В сети", offlineAgo: "Не в сети · {time}", offline: "Не в сети", justNow: "только что", minutesAgo: "{n} мин назад", hoursAgo: "{n} ч назад", daysAgo: "{n} дн назад",
      placeholder: "Сообщение…", send: "Отправить", emptyChat: "Напишите первое тёплое сообщение", noName: "Друг",
      block: "Заблокировать", blockConfirm: "Заблокировать {name}? Вы больше не будете получать сообщения от этого человека.", blocked: "Пользователь заблокирован",
      remove: "Удалить из друзей", removeConfirm: "Удалить {name} из друзей?", removed: "Удалено из друзей",
      report: "Пожаловаться", reportConfirm: "Пожаловаться на это сообщение?", reported: "Жалоба отправлена. Спасибо!",
      forbidden: "В сообщении есть недопустимые слова или ссылки.", rateLimited: "Слишком много сообщений. Подождите немного.", failed: "Не получилось. Проверьте связь и попробуйте ещё раз.",
      newMessage: "{name}: {text}", newRequest: "{name} хочет добавить вас в друзья", safety: "Пишите только тем, кого знаете. Если что-то не так — пожалуйтесь или заблокируйте."
    },
    en: {
      home: "Friends", eyebrow: "GLOWLETTER · FRIENDS", title: "Friends", close: "Close", back: "Back",
      signIn: "Sign in to add friends and send messages.", signInButton: "Sign in",
      nameTitle: "What’s your name?", nameNote: "Your friends will see this name.", namePlaceholder: "Your name", nameSave: "Save", nameInvalid: "Enter an ordinary name.",
      myCode: "Your friend code", codeNote: "Give this code to someone close — they can add you as a friend.", copyCode: "Copy", shareCode: "Share", codeCopied: "Code copied",
      shareText: "Add me as a friend on GlowLetter — my code: {code}",
      addTitle: "Add a friend", addPlaceholder: "Friend’s code", add: "Add",
      notFound: "No such code. Check it and try again.", self: "This is your own code.", sent: "Request sent", accepted: "You are friends now!", already: "You are already friends", pendingAlready: "Request already sent",
      requests: "Friend requests", accept: "Accept", decline: "Decline", outgoing: "Waiting for an answer",
      friends: "Your friends", none: "No friends yet. Share your code!",
      online: "Online", offlineAgo: "Offline · {time}", offline: "Offline", justNow: "just now", minutesAgo: "{n} min ago", hoursAgo: "{n} h ago", daysAgo: "{n} d ago",
      placeholder: "Message…", send: "Send", emptyChat: "Write the first warm message", noName: "Friend",
      block: "Block", blockConfirm: "Block {name}? You will no longer get messages from this person.", blocked: "User blocked",
      remove: "Remove friend", removeConfirm: "Remove {name} from friends?", removed: "Removed from friends",
      report: "Report", reportConfirm: "Report this message?", reported: "Report sent. Thank you!",
      forbidden: "The message has words or links that aren’t allowed.", rateLimited: "Too many messages. Please wait a little.", failed: "Something went wrong. Check your connection and try again.",
      newMessage: "{name}: {text}", newRequest: "{name} wants to add you as a friend", safety: "Write only to people you know. If something feels wrong, report or block."
    },
    fr: {
      home: "Amis", eyebrow: "GLOWLETTER · AMIS", title: "Amis", close: "Fermer", back: "Retour",
      signIn: "Connectez-vous pour ajouter des amis et écrire des messages.", signInButton: "Se connecter",
      nameTitle: "Comment vous appelez-vous ?", nameNote: "Vos amis verront ce prénom.", namePlaceholder: "Votre prénom", nameSave: "Enregistrer", nameInvalid: "Saisissez un prénom ordinaire.",
      myCode: "Votre code d’ami", codeNote: "Donnez ce code à un proche : il pourra vous ajouter en ami.", copyCode: "Copier", shareCode: "Partager", codeCopied: "Code copié",
      shareText: "Ajoute-moi en ami sur GlowLetter — mon code : {code}",
      addTitle: "Ajouter un ami", addPlaceholder: "Code de l’ami", add: "Ajouter",
      notFound: "Ce code n’existe pas. Vérifiez et réessayez.", self: "C’est votre propre code.", sent: "Demande envoyée", accepted: "Vous êtes amis maintenant !", already: "Vous êtes déjà amis", pendingAlready: "Demande déjà envoyée",
      requests: "Demandes d’ami", accept: "Accepter", decline: "Refuser", outgoing: "En attente de réponse",
      friends: "Vos amis", none: "Pas encore d’amis. Partagez votre code !",
      online: "En ligne", offlineAgo: "Hors ligne · {time}", offline: "Hors ligne", justNow: "à l’instant", minutesAgo: "il y a {n} min", hoursAgo: "il y a {n} h", daysAgo: "il y a {n} j",
      placeholder: "Message…", send: "Envoyer", emptyChat: "Écrivez le premier message tendre", noName: "Ami",
      block: "Bloquer", blockConfirm: "Bloquer {name} ? Vous ne recevrez plus de messages de cette personne.", blocked: "Utilisateur bloqué",
      remove: "Retirer des amis", removeConfirm: "Retirer {name} de vos amis ?", removed: "Retiré des amis",
      report: "Signaler", reportConfirm: "Signaler ce message ?", reported: "Signalement envoyé. Merci !",
      forbidden: "Le message contient des mots ou des liens interdits.", rateLimited: "Trop de messages. Patientez un peu.", failed: "Un problème est survenu. Vérifiez la connexion et réessayez.",
      newMessage: "{name} : {text}", newRequest: "{name} veut vous ajouter en ami", safety: "N’écrivez qu’aux personnes que vous connaissez. En cas de souci, signalez ou bloquez."
    }
  };
  Object.entries(window.GLOWLETTER_FRIENDS_I18N || {}).forEach(([code, pack]) => { if (!TEXT[code] && pack) TEXT[code] = pack; });

  const state = { root: null, view: "list", me: null, rows: [], chatWith: null, messages: [], busy: false, error: "", channel: null, channelUser: "", heartbeat: 0, lastFocus: null };

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const client = () => cloud()?.getClient?.() || null;
  const userId = () => cloud()?.getState?.().userId || "";
  const signedIn = () => Boolean(cloud()?.getState?.().signedIn);
  const language = () => {
    const current = String(app()?.getState?.().language || localStorage.getItem("nurLanguage") || "ru").toLowerCase();
    return TEXT[current] ? current : "en";
  };
  const tr = (key, values = {}) => String((TEXT[language()] || TEXT.en)[key] ?? TEXT.en[key] ?? key).replace(/\{(\w+)\}/gu, (_, name) => String(values[name] ?? ""));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const cleanName = value => String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, 36);
  const notify = (message, duration = 3600) => app()?.notify?.(message, duration);
  const nameOf = row => row?.display_name || tr("noName");
  const isOnline = row => Boolean(row?.last_seen) && Date.now() - new Date(row.last_seen).getTime() < ONLINE_MS;
  const ago = value => {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 2) return tr("justNow");
    if (minutes < 60) return tr("minutesAgo", { n: minutes });
    if (minutes < 1440) return tr("hoursAgo", { n: Math.round(minutes / 60) });
    return tr("daysAgo", { n: Math.round(minutes / 1440) });
  };
  const statusText = row => isOnline(row) ? tr("online") : row?.last_seen ? tr("offlineAgo", { time: ago(row.last_seen) }) : tr("offline");
  const timeOf = value => { try { return new Intl.DateTimeFormat(language() === "ind" ? "id" : language(), { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); } catch { return ""; } };
  const initial = name => escapeHtml((cleanName(name)[0] || "♥").toUpperCase());

  // ——— Окно ———

  function mount() {
    if (state.root) return state.root;
    const root = document.createElement("div");
    root.className = "glg-layer glf-layer";
    root.id = "friendsLayer";
    root.hidden = true;
    root.innerHTML = `
      <button class="glg-backdrop" type="button" data-action="close" tabindex="-1" aria-hidden="true"></button>
      <section class="glg-panel" role="dialog" aria-modal="true" aria-labelledby="glfTitle">
        <header class="glg-header">
          <div><p class="glg-eyebrow" data-glf="eyebrow"></p><h2 id="glfTitle" data-glf="title"></h2></div>
          <button class="glg-close" type="button" data-action="close"><span aria-hidden="true">×</span></button>
        </header>
        <div class="glg-body glf-body" aria-live="polite"></div>
      </section>`;
    root.addEventListener("click", event => {
      const target = event.target.closest("[data-action]");
      if (target && root.contains(target)) onAction(target.dataset.action, target);
    });
    root.addEventListener("submit", event => { event.preventDefault(); onAction(event.target.dataset.submit, event.target); });
    root.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.stopPropagation(); close(); return; }
      // Enter отправляет, Shift+Enter — новая строка.
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing && event.target.matches(".glf-compose textarea")) {
        event.preventDefault();
        event.target.form.requestSubmit();
      }
    });
    document.body.append(root);
    state.root = root;
    return root;
  }

  async function open() {
    const root = mount();
    if (root.hidden) state.lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("glg-open");
    requestAnimationFrame(() => root.classList.add("is-open"));
    state.view = signedIn() ? "loading" : "signin";
    render();
    if (signedIn()) await refresh(true);
  }

  function close() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    document.body.classList.remove("glg-open");
    setTimeout(() => { if (!root.classList.contains("is-open")) root.hidden = true; }, 320);
    state.chatWith = null;
    state.lastFocus?.focus?.({ preventScroll: true });
  }

  function render() {
    const root = state.root;
    if (!root || root.hidden) return;
    root.querySelector("[data-glf=eyebrow]").textContent = tr("eyebrow");
    root.querySelector("[data-glf=title]").textContent = state.view === "chat" ? nameOf(state.chatWith) : tr("title");
    root.querySelector(".glg-close").setAttribute("aria-label", tr("close"));
    const body = root.querySelector(".glf-body");
    const views = { signin: renderSignIn, loading: () => `<p class="glg-center glg-muted">…</p>`, name: renderName, list: renderList, chat: renderChat };
    body.innerHTML = (views[state.view] || renderList)();
    if (state.view === "chat") {
      const scroller = body.querySelector(".glf-messages");
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    } else body.scrollTop = 0;
  }

  function renderSignIn() {
    return `<div class="glg-center"><p class="glg-muted">${escapeHtml(tr("signIn"))}</p><button class="glg-primary" type="button" data-action="signin">${icon("ic-user")} ${escapeHtml(tr("signInButton"))}</button></div>`;
  }

  function renderName() {
    return `<form class="glg-form" data-submit="save-name" novalidate>
      <h3>${escapeHtml(tr("nameTitle"))}</h3>
      <p class="glg-muted">${escapeHtml(tr("nameNote"))}</p>
      <label><span>${escapeHtml(tr("namePlaceholder"))}</span><input name="name" type="text" dir="auto" maxlength="36" autocomplete="name" value="${escapeHtml(state.me?.display_name || cleanName(app()?.getState?.().senderName))}" required /></label>
      <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
      <button class="glg-primary glg-wide" type="submit">${escapeHtml(tr("nameSave"))}</button>
    </form>`;
  }

  function renderList() {
    const friends = state.rows.filter(row => row.status === "friend").sort((a, b) => (isOnline(b) - isOnline(a)) || ((b.unread || 0) - (a.unread || 0)) || String(b.last_message_at || "").localeCompare(String(a.last_message_at || "")));
    const incoming = state.rows.filter(row => row.status === "incoming");
    const outgoing = state.rows.filter(row => row.status === "outgoing");
    const avatar = row => `<span class="glf-avatar${isOnline(row) ? " is-online" : ""}">${initial(nameOf(row))}</span>`;
    return `
      <article class="glg-hero glf-code-card">
        <p class="glg-step">${escapeHtml(tr("myCode"))}</p>
        <p class="glf-code">${escapeHtml(state.me?.friend_code || "")}</p>
        <p class="glg-muted">${escapeHtml(tr("codeNote"))}</p>
        <div class="glg-actions"><button class="glg-primary" type="button" data-action="share-code">${icon("ic-share")} ${escapeHtml(tr("shareCode"))}</button><button class="glg-secondary" type="button" data-action="copy-code">${icon("ic-copy")} ${escapeHtml(tr("copyCode"))}</button></div>
      </article>
      <form class="glg-form glf-add" data-submit="add" novalidate>
        <h3>${escapeHtml(tr("addTitle"))}</h3>
        <div class="glf-add-row"><input name="code" type="text" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${escapeHtml(tr("addPlaceholder"))}" /><button class="glg-primary" type="submit"${state.busy ? " disabled" : ""}>${escapeHtml(tr("add"))}</button></div>
        <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
      </form>
      ${incoming.length ? `<section class="glg-section"><h3>${escapeHtml(tr("requests"))}</h3><ul class="glf-list">${incoming.map(row => `<li class="glf-row">${avatar(row)}<span class="glf-name">${escapeHtml(nameOf(row))}</span><span class="glf-row-actions"><button class="glg-primary glf-small" type="button" data-action="accept" data-id="${escapeHtml(row.user_id)}">${escapeHtml(tr("accept"))}</button><button class="glg-secondary glf-small" type="button" data-action="decline" data-id="${escapeHtml(row.user_id)}">${escapeHtml(tr("decline"))}</button></span></li>`).join("")}</ul></section>` : ""}
      <section class="glg-section"><h3>${escapeHtml(tr("friends"))}</h3>
        ${friends.length ? `<ul class="glf-list">${friends.map(row => `<li><button class="glf-row glf-friend" type="button" data-action="chat" data-id="${escapeHtml(row.user_id)}">${avatar(row)}<span class="glf-who"><span class="glf-name">${escapeHtml(nameOf(row))}</span><small class="${isOnline(row) ? "is-online" : ""}">${escapeHtml(statusText(row))}</small></span>${row.unread ? `<b class="glg-new">${row.unread}</b>` : ""}</button></li>`).join("")}</ul>` : `<p class="glg-muted">${escapeHtml(tr("none"))}</p>`}
      </section>
      ${outgoing.length ? `<section class="glg-section"><h3>${escapeHtml(tr("outgoing"))}</h3><ul class="glf-list">${outgoing.map(row => `<li class="glf-row is-muted">${avatar(row)}<span class="glf-name">${escapeHtml(nameOf(row))}</span></li>`).join("")}</ul></section>` : ""}
      <p class="glf-safety">${escapeHtml(tr("safety"))}</p>`;
  }

  function renderChat() {
    const friend = state.chatWith;
    const me = userId();
    const bubbles = state.messages.map(message => {
      const mine = message.sender === me;
      return `<li class="glf-bubble${mine ? " is-mine" : ""}"><span>${escapeHtml(message.body)}</span><small>${escapeHtml(timeOf(message.created_at))}${mine ? "" : ` · <button type="button" class="glf-report" data-action="report" data-id="${escapeHtml(message.id)}">${escapeHtml(tr("report"))}</button>`}</small></li>`;
    }).join("");
    return `
      <div class="glf-chat-head">
        <button class="glg-link glg-back" type="button" data-action="list">← ${escapeHtml(tr("back"))}</button>
        <small class="${isOnline(friend) ? "is-online" : ""}">${escapeHtml(statusText(friend))}</small>
      </div>
      <ul class="glf-messages">${bubbles || `<li class="glf-empty">${HEART}<span>${escapeHtml(tr("emptyChat"))}</span></li>`}</ul>
      <form class="glf-compose" data-submit="send" novalidate>
        <textarea name="body" rows="1" maxlength="1000" dir="auto" placeholder="${escapeHtml(tr("placeholder"))}"></textarea>
        <button class="glg-primary" type="submit" aria-label="${escapeHtml(tr("send"))}"${state.busy ? " disabled" : ""}>➤</button>
      </form>
      <p class="glg-error" role="alert">${escapeHtml(state.error)}</p>
      <div class="glf-chat-tools"><button class="glg-link" type="button" data-action="remove">${escapeHtml(tr("remove"))}</button><button class="glg-link glg-danger" type="button" data-action="block">${escapeHtml(tr("block"))}</button></div>`;
  }

  // ——— Действия ———

  async function rpc(name, args) {
    const db = client();
    if (!db) throw new Error("offline");
    const { data, error } = await db.rpc(name, args);
    if (error) throw error;
    return data;
  }

  async function onAction(action, target) {
    state.error = "";
    try {
      switch (action) {
        case "close": close(); return;
        case "signin": close(); app()?.requestSignIn?.("friends"); return;
        case "list": state.chatWith = null; state.view = "list"; render(); refresh(false); return;
        case "save-name": {
          const name = cleanName(target.elements.name.value);
          if (!name) { state.error = tr("nameInvalid"); render(); return; }
          try { await rpc("glowletter_friends_set_name", { p_name: name }); }
          catch (error) { state.error = String(error?.message) === "forbidden" ? tr("nameInvalid") : tr("failed"); render(); return; }
          state.me = { ...state.me, display_name: name };
          state.view = "list";
          render();
          return;
        }
        case "copy-code": {
          try { await navigator.clipboard.writeText(state.me?.friend_code || ""); notify(tr("codeCopied"), 2400); }
          catch { window.prompt(tr("myCode"), state.me?.friend_code || ""); }
          return;
        }
        case "share-code": return shareCode();
        case "add": {
          const code = String(target.elements.code.value || "").toUpperCase().replace(/[^A-Z0-9]/gu, "");
          if (!code) return;
          state.busy = true; render();
          try {
            const result = await rpc("glowletter_friends_request", { p_code: code });
            notify(tr({ sent: "sent", accepted: "accepted", already: "already", pending: "pendingAlready" }[result] || "sent"), 3200);
          } catch (error) {
            const message = String(error?.message || "");
            state.error = message === "not_found" ? tr("notFound") : message === "self" ? tr("self") : message === "rate_limited" ? tr("rateLimited") : tr("failed");
          }
          state.busy = false;
          await refresh(false);
          return;
        }
        case "accept": case "decline":
          await rpc("glowletter_friends_respond", { p_user: target.dataset.id, p_accept: action === "accept" });
          if (action === "accept") notify(tr("accepted"), 3000);
          await refresh(false);
          return;
        case "chat": return openChat(target.dataset.id);
        case "send": return sendMessage(target);
        case "report": {
          if (!window.confirm(tr("reportConfirm"))) return;
          await rpc("glowletter_messages_report", { p_message: target.dataset.id, p_reason: "abuse" });
          notify(tr("reported"), 3000);
          return;
        }
        case "block": {
          const friend = state.chatWith;
          if (!friend || !window.confirm(tr("blockConfirm", { name: nameOf(friend) }))) return;
          await rpc("glowletter_friends_block", { p_user: friend.user_id });
          notify(tr("blocked"), 3000);
          state.chatWith = null; state.view = "list";
          await refresh(false);
          return;
        }
        case "remove": {
          const friend = state.chatWith;
          if (!friend || !window.confirm(tr("removeConfirm", { name: nameOf(friend) }))) return;
          await rpc("glowletter_friends_remove", { p_user: friend.user_id });
          notify(tr("removed"), 3000);
          state.chatWith = null; state.view = "list";
          await refresh(false);
          return;
        }
        default:
      }
    } catch {
      state.busy = false;
      state.error = tr("failed");
      render();
    }
  }

  async function shareCode() {
    const code = state.me?.friend_code || "";
    const text = tr("shareText", { code });
    const url = String(app()?.getState?.().publicShareUrl || "https://bezam.org/");
    const bridge = window.NurShare;
    if (bridge && typeof bridge.share === "function") { try { bridge.share(tr("title"), text, url); return; } catch {} }
    if (navigator.share) { try { await navigator.share({ title: tr("title"), text, url }); return; } catch (error) { if (error?.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(`${text}\n${url}`); notify(tr("codeCopied"), 2400); } catch { window.prompt(tr("myCode"), code); }
  }

  async function refresh(first) {
    if (!signedIn()) { state.view = "signin"; render(); updateBadge(); return; }
    try {
      if (first || !state.me) {
        const me = await rpc("glowletter_friends_me", {});
        state.me = Array.isArray(me) ? me[0] : me;
      }
      state.rows = (await rpc("glowletter_friends_list", {})) || [];
      if (state.view === "loading") state.view = state.me?.display_name ? "list" : "name";
      if (state.chatWith) state.chatWith = state.rows.find(row => row.user_id === state.chatWith.user_id) || state.chatWith;
    } catch {
      if (state.view === "loading") state.view = "list";
      state.error = tr("failed");
    }
    updateBadge();
    if (state.view !== "chat") render();
    else {
      const status = state.root?.querySelector(".glf-chat-head small");
      if (status) { status.textContent = statusText(state.chatWith); status.classList.toggle("is-online", isOnline(state.chatWith)); }
    }
  }

  async function openChat(friendId) {
    const friend = state.rows.find(row => row.user_id === friendId);
    if (!friend) return;
    state.chatWith = friend;
    state.view = "chat";
    state.messages = [];
    render();
    const db = client();
    const me = userId();
    const { data } = await db.from("glowletter_messages").select("id, sender, recipient, body, created_at, read_at")
      .or(`and(sender.eq.${me},recipient.eq.${friendId}),and(sender.eq.${friendId},recipient.eq.${me})`)
      .order("created_at", { ascending: false }).limit(150);
    if (state.chatWith?.user_id !== friendId) return;
    state.messages = (data || []).reverse();
    render();
    if (friend.unread) {
      await rpc("glowletter_messages_mark_read", { p_from: friendId }).catch(() => {});
      friend.unread = 0;
      updateBadge();
    }
    requestAnimationFrame(() => state.root?.querySelector(".glf-compose textarea")?.focus({ preventScroll: true }));
  }

  async function sendMessage(form) {
    const friend = state.chatWith;
    const textarea = form.elements.body;
    const body = String(textarea.value || "").trim();
    if (!friend || !body || state.busy) return;
    state.busy = true;
    try {
      const id = await rpc("glowletter_messages_send", { p_to: friend.user_id, p_body: body });
      state.messages.push({ id, sender: userId(), recipient: friend.user_id, body, created_at: new Date().toISOString() });
      state.busy = false;
      render();
    } catch (error) {
      const message = String(error?.message || "");
      state.busy = false;
      state.error = message === "forbidden" ? tr("forbidden") : message === "rate_limited" ? tr("rateLimited") : tr("failed");
      render();
      const again = state.root?.querySelector(".glf-compose textarea");
      if (again) again.value = body;
    }
  }

  // ——— Realtime, онлайн и значок на главной ———

  function subscribe() {
    const db = client();
    const me = userId();
    if (!db?.channel || !me || state.channelUser === me) return;
    if (state.channel) db.removeChannel?.(state.channel);
    state.channelUser = me;
    state.channel = db.channel(`glowletter-friends:${me}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "glowletter_messages", filter: `recipient=eq.${me}` }, payload => onIncoming(payload?.new))
      .on("postgres_changes", { event: "*", schema: "public", table: "glowletter_friendships", filter: `addressee=eq.${me}` }, payload => onFriendship(payload))
      .on("postgres_changes", { event: "*", schema: "public", table: "glowletter_friendships", filter: `requester=eq.${me}` }, () => refresh(false))
      .subscribe();
  }

  async function onIncoming(message) {
    if (!message?.id) return;
    const row = state.rows.find(item => item.user_id === message.sender);
    const chatOpen = state.root && !state.root.hidden && state.view === "chat" && state.chatWith?.user_id === message.sender;
    if (chatOpen) {
      if (!state.messages.some(item => item.id === message.id)) state.messages.push(message);
      render();
      rpc("glowletter_messages_mark_read", { p_from: message.sender }).catch(() => {});
      return;
    }
    if (row) row.unread = (row.unread || 0) + 1;
    else await refresh(false);
    updateBadge();
    if (state.root && !state.root.hidden && state.view === "list") render();
    const sender = state.rows.find(item => item.user_id === message.sender);
    notify(tr("newMessage", { name: nameOf(sender), text: String(message.body).slice(0, 80) }), 5000);
  }

  async function onFriendship(payload) {
    await refresh(false);
    if (payload?.eventType === "INSERT" && payload.new?.status === "pending") {
      const row = state.rows.find(item => item.user_id === payload.new.requester);
      notify(tr("newRequest", { name: nameOf(row) }), 5000);
    }
  }

  function updateBadge() {
    const badge = document.querySelector("#friendsBadge");
    if (!badge) return;
    const count = state.rows.reduce((sum, row) => sum + (row.status === "friend" ? Number(row.unread || 0) : row.status === "incoming" ? 1 : 0), 0);
    badge.hidden = !count;
    badge.textContent = String(count);
  }

  function heartbeat() {
    clearInterval(state.heartbeat);
    if (!signedIn()) return;
    const beat = () => {
      if (document.visibilityState !== "visible" || !signedIn()) return;
      rpc("glowletter_friends_touch", {}).catch(() => {});
      if (state.root && !state.root.hidden) refresh(false);
    };
    beat();
    state.heartbeat = setInterval(beat, HEARTBEAT_MS);
  }

  async function startSession() {
    if (!signedIn()) return;
    subscribe();
    heartbeat();
    try { state.rows = (await rpc("glowletter_friends_list", {})) || []; } catch {}
    updateBadge();
  }

  function stopSession() {
    clearInterval(state.heartbeat);
    if (state.channel) client()?.removeChannel?.(state.channel);
    state.channel = null; state.channelUser = ""; state.rows = []; state.me = null;
    updateBadge();
    if (state.root && !state.root.hidden) { state.view = "signin"; render(); }
  }

  function localizeHome() {
    const label = document.querySelector("#friendsOpenHomeLabel");
    if (label) label.textContent = tr("home");
  }

  function init() {
    document.querySelector("#friendsOpenHome")?.addEventListener("click", () => open());
    localizeHome();
    addEventListener("glowletter-language-changed", () => setTimeout(() => { localizeHome(); render(); }, 0));
    addEventListener("glowletter-cloud-session", event => { if (event.detail?.signedIn) startSession(); else stopSession(); });
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && signedIn()) rpc("glowletter_friends_touch", {}).catch(() => {}); });
    if (signedIn()) startSession();
  }

  window.GlowLetterFriends = Object.freeze({ open: () => open() });
  init();
})();
