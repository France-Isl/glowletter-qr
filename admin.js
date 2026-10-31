/* GlowLetter — большая админ-панель: «Защита» (блок, предупреждение, модерация,
   сброс статистики), «Подозрительные», «Журнал», «Статистика» и жалобы на людей.
   Все проверки прав — на сервере (private.glowletter_require_admin). */
(function () {
  "use strict";

  const cloud = () => window.GlowLetterCloud || null;
  const notify = message => window.GlowLetterApp?.notify?.(message, 4200);
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const when = value => { if (!value) return "—"; try { return new Intl.DateTimeFormat("ru", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); } catch { return String(value); } };
  const day = value => { try { return new Intl.DateTimeFormat("ru", { day: "numeric", month: "short", weekday: "short" }).format(new Date(`${value}T12:00:00Z`)); } catch { return value; } };
  const who = row => `${escapeHtml(row.name || row.target_name || "Без имени")}${row.support_id || row.target_support ? ` <small>${escapeHtml(row.support_id || row.target_support)}</small>` : ""}`;
  const state = { card: null, query: "", busy: false, statsDays: 14 };

  async function rpc(name, args = {}) {
    const db = cloud()?.getClient?.();
    if (!db) throw new Error("offline");
    const { data, error } = await db.rpc(name, args);
    if (error) throw error;
    return data;
  }
  const ERRORS = { admin_required: "Нужны права администратора", admin_target: "Аккаунт владельца защищён: его нельзя менять через админ-панель", not_found: "Пользователь не найден", cannot_block_admin: "Администратора заблокировать нельзя", empty_message: "Напишите текст предупреждения", offline: "Нет связи с сервером" };
  const fail = error => notify(ERRORS[String(error?.message || "")] || `Ошибка: ${String(error?.message || error || "")}`);
  const loading = node => { node.innerHTML = '<p class="gla-note">Загрузка…</p>'; };

  // ——— Защита ———
  async function renderGuard() {
    const node = $("#adminGuard");
    if (!node) return;
    node.innerHTML = `
      <form class="gla-search" data-gla-form="find">
        <input name="q" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="96" placeholder="GL-…, e-mail или код друга" value="${escapeHtml(state.query)}" aria-label="Кого найти">
        <button type="submit">Найти</button>
      </form>
      <div class="gla-card-slot" data-gla="card"></div>
      <div class="gla-block"><div class="gla-head"><h4>Сейчас заблокированы</h4><button type="button" data-gla-act="bans">Обновить</button></div><div data-gla="bans"><p class="gla-note">Загрузка…</p></div></div>`;
    if (state.card) drawCard();
    loadBans();
  }
  async function loadBans() {
    const box = $("#adminGuard [data-gla=bans]");
    if (!box) return;
    try {
      const rows = await rpc("glowletter_admin_bans");
      box.innerHTML = rows.length ? `<ul class="gla-list">${rows.map(row => `<li><span>${who(row)}<small>${row.until ? `до ${escapeHtml(when(row.until))}` : "навсегда"}${row.reason ? ` · ${escapeHtml(row.reason)}` : ""}</small></span><span class="gla-row-actions"><button type="button" data-gla-act="open" data-q="${escapeHtml(row.support_id || row.user_id)}">Открыть</button><button type="button" data-gla-act="unban" data-user="${escapeHtml(row.user_id)}">Разблокировать</button></span></li>`).join("")}</ul>` : '<p class="gla-note">Никто не заблокирован.</p>';
    } catch (error) { box.innerHTML = `<p class="gla-note">${escapeHtml(ERRORS[error?.message] || "Не удалось загрузить")}</p>`; }
  }
  async function find(query) {
    state.query = String(query || "").trim();
    if (!state.query) return;
    const slot = $("#adminGuard [data-gla=card]");
    if (slot) loading(slot);
    try {
      state.card = await rpc("glowletter_admin_guard_card", { p_query: state.query });
      if (!state.card) { if (slot) slot.innerHTML = '<p class="gla-note">Никого не нашли. Проверьте ID, e-mail или код друга.</p>'; return; }
      drawCard();
    } catch (error) { if (slot) slot.innerHTML = ""; fail(error); }
  }
  function drawCard() {
    const slot = $("#adminGuard [data-gla=card]");
    const c = state.card;
    if (!slot || !c) return;
    const access = c.premium_forever ? "Навсегда" : c.play_active ? "Подписка Google Play" : c.vip_until && new Date(c.vip_until) > new Date() ? `VIP до ${when(c.vip_until)}` : "Бесплатный";
    slot.innerHTML = `
      <article class="gla-card${c.ban ? " is-blocked" : ""}">
        <header><b>${escapeHtml(c.name || "Без имени")}</b>${c.is_admin ? '<span class="gla-tag is-admin">Админ</span>' : ""}${c.ban ? '<span class="gla-tag is-blocked">Заблокирован</span>' : ""}</header>
        <dl>
          <div><dt>ID</dt><dd>${escapeHtml(c.support_id || "—")}</dd></div>
          <div><dt>E-mail</dt><dd>${escapeHtml(c.email || "—")}</dd></div>
          <div><dt>Код друга</dt><dd>${escapeHtml(c.friend_code || "—")}</dd></div>
          <div><dt>Доступ</dt><dd>${escapeHtml(access)}</dd></div>
          <div><dt>Аккаунт создан</dt><dd>${escapeHtml(when(c.created_at))}</dd></div>
          <div><dt>Последний вход</dt><dd>${escapeHtml(when(c.last_sign_in))}</dd></div>
          <div><dt>Опыт за сутки / всего</dt><dd>${c.points_today} / ${c.points_total}</dd></div>
          <div><dt>Друзей · сообщений за 7 дней · фото</dt><dd>${c.friends} · ${c.messages_7d} · ${c.photos}</dd></div>
          <div><dt>Открытых жалоб</dt><dd>${c.reports}</dd></div>
        </dl>
        ${c.ban ? `<p class="gla-alert">Заблокирован ${c.ban.until ? `до ${escapeHtml(when(c.ban.until))}` : "навсегда"}${c.ban.reason ? `. Причина: ${escapeHtml(c.ban.reason)}` : ""}</p>` : ""}
        ${c.is_admin ? "" : `
        <section class="gla-section">
          <h5>${c.ban ? "Блокировка" : "Заблокировать"}</h5>
          ${c.ban ? `<button class="gla-btn" type="button" data-gla-act="unban" data-user="${escapeHtml(c.user_id)}">Разблокировать</button>` : `
          <div class="gla-inline">
            <select data-gla="days" aria-label="Срок"><option value="1">1 день</option><option value="3">3 дня</option><option value="7" selected>7 дней</option><option value="30">30 дней</option><option value="0">Навсегда</option></select>
            <input data-gla="ban-reason" type="text" maxlength="200" placeholder="Причина (её увидит пользователь)">
          </div>
          <button class="gla-btn is-danger" type="button" data-gla-act="ban">Заблокировать</button>
          <p class="gla-note">Заблокированный сразу теряет доступ, опыт и место в рейтинге и не может войти в аккаунт.</p>`}
        </section>
        <section class="gla-section">
          <h5>Предупреждение</h5>
          <textarea data-gla="warn" maxlength="300" rows="3" placeholder="Текст увидит пользователь при входе"></textarea>
          <button class="gla-btn" type="button" data-gla-act="warn">Отправить предупреждение</button>
          ${(c.warnings || []).length ? `<ul class="gla-mini">${c.warnings.map(w => `<li>${escapeHtml(when(w.at))} · ${w.seen ? "прочитано" : "не прочитано"}<br>${escapeHtml(w.message)}</li>`).join("")}</ul>` : ""}
        </section>
        <section class="gla-section">
          <h5>Модерация</h5>
          <div class="gla-grid">
            <button class="gla-btn is-soft" type="button" data-gla-act="mod" data-what="name">Сбросить имя</button>
            <button class="gla-btn is-soft" type="button" data-gla-act="mod" data-what="photos">Удалить фото</button>
            <button class="gla-btn is-soft" type="button" data-gla-act="mod" data-what="voice">Удалить голосовые</button>
            <button class="gla-btn is-soft" type="button" data-gla-act="mod" data-what="messages">Удалить сообщения</button>
          </div>
        </section>
        <section class="gla-section">
          <h5>Сброс статистики (мошенник)</h5>
          <input data-gla="reset-reason" type="text" maxlength="200" placeholder="Причина, например «накрутка опыта»">
          <label class="gla-check"><input data-gla="reset-medals" type="checkbox" checked> Забрать и медали</label>
          <button class="gla-btn is-danger" type="button" data-gla-act="reset">Сбросить опыт, игры и рейтинг</button>
        </section>`}
        <section class="gla-section">
          <h5>Доступ</h5>
          <button class="gla-btn is-soft" type="button" data-gla-act="access" data-q="${escapeHtml(c.support_id || c.email || "")}">Выдать или забрать доступ</button>
          <p class="gla-note">Бесплатно доступ получает только тот, кому выдали вы. Все выдачи пишутся в журнал.</p>
        </section>
      </article>`;
  }
  const MOD_TEXT = { name: "Сбросить имя этого пользователя?", photos: "Удалить все его фото для виджета?", voice: "Удалить все его голосовые?", messages: "Удалить все его личные сообщения у всех?" };

  async function act(button) {
    const action = button.dataset.glaAct;
    const c = state.card;
    if (state.busy) return;
    try {
      state.busy = true;
      if (action === "bans") return loadBans();
      if (action === "open") { setTab("guard"); await renderGuard(); return find(button.dataset.q); }
      if (action === "access") {
        const input = $("#adminSupportId");
        if (input) input.value = button.dataset.q || "";
        $("#adminTabAccounts")?.click();
        $("#adminLookupForm")?.requestSubmit?.();
        return;
      }
      if (action === "unban") {
        await rpc("glowletter_admin_unban", { p_user: button.dataset.user });
        notify("Разблокирован");
        if (c?.user_id === button.dataset.user) await find(state.query);
        return loadBans();
      }
      if (action === "ban" && c) {
        const days = Number($("#adminGuard [data-gla=days]")?.value || 7);
        const reason = $("#adminGuard [data-gla=ban-reason]")?.value || "";
        if (!confirm(`Заблокировать ${c.name || c.support_id} ${days ? `на ${days} дн.` : "навсегда"}?`)) return;
        await rpc("glowletter_admin_ban", { p_user: c.user_id, p_days: days || null, p_reason: reason });
        notify("Заблокирован");
        await find(state.query);
        return loadBans();
      }
      if (action === "warn" && c) {
        const message = $("#adminGuard [data-gla=warn]")?.value || "";
        await rpc("glowletter_admin_warn", { p_user: c.user_id, p_message: message });
        notify("Предупреждение отправлено");
        return find(state.query);
      }
      if (action === "mod" && c) {
        if (!confirm(MOD_TEXT[button.dataset.what])) return;
        const rows = await rpc("glowletter_admin_moderate", { p_user: c.user_id, p_what: button.dataset.what });
        notify(`Готово (${rows})`);
        return find(state.query);
      }
      if (action === "reset" && c) {
        if (!confirm(`Сбросить весь опыт, игры и рейтинг ${c.name || c.support_id}? Это не отменить.`)) return;
        const result = await rpc("glowletter_admin_reset_stats", { p_user: c.user_id, p_reason: $("#adminGuard [data-gla=reset-reason]")?.value || "", p_medals: Boolean($("#adminGuard [data-gla=reset-medals]")?.checked) });
        notify(`Сброшено: ${result.points} опыта, ${result.games} игр, ${result.medals} медалей`);
        return find(state.query);
      }
      if (action === "sus-reset") {
        if (!confirm("Сбросить опыт и рейтинг этого игрока за накрутку?")) return;
        await rpc("glowletter_admin_reset_stats", { p_user: button.dataset.user, p_reason: "накрутка опыта", p_medals: true });
        notify("Статистика сброшена");
        return renderSuspects();
      }
      if (action === "sus-ban") {
        if (!confirm("Заблокировать на 7 дней за накрутку?")) return;
        await rpc("glowletter_admin_ban", { p_user: button.dataset.user, p_days: 7, p_reason: "Накрутка опыта" });
        notify("Заблокирован на 7 дней");
        return renderSuspects();
      }
      if (action === "rep-dismiss" || action === "rep-ban") {
        if (action === "rep-ban") {
          if (!confirm("Заблокировать на 7 дней по жалобам?")) return;
          await rpc("glowletter_admin_ban", { p_user: button.dataset.user, p_days: 7, p_reason: "Жалобы пользователей" });
        }
        await rpc("glowletter_admin_resolve_user_report", { p_id: button.dataset.id, p_resolution: action === "rep-ban" ? "banned" : "dismissed" });
        notify(action === "rep-ban" ? "Заблокирован, жалобы закрыты" : "Жалобы закрыты");
        return renderUserReports();
      }
      if (action === "stats-days") { state.statsDays = Number(button.dataset.days) || 14; return renderStats(); }
      if (action === "refresh") return show(button.dataset.tab);
    } catch (error) { fail(error); }
    finally { state.busy = false; }
  }

  // ——— Подозрительные ———
  async function renderSuspects() {
    const node = $("#adminSuspects");
    if (!node) return;
    loading(node);
    try {
      const rows = await rpc("glowletter_admin_suspicious");
      node.innerHTML = `<div class="gla-head"><h4>Подозрительные игроки</h4><button type="button" data-gla-act="refresh" data-tab="suspects">Обновить</button></div>
        <p class="gla-note">Сервер сам отмечает тех, кто за сутки набрал много опыта, играет со многими свежими аккаунтами или получил жалобы на накрутку. Опыт больше 300 в день не начисляется никому.</p>
        ${rows.length ? `<ul class="gla-list">${rows.map(row => `<li><span>${who(row)}${row.blocked ? ' <span class="gla-tag is-blocked">Заблокирован</span>' : ""}
          <small>Опыт за сутки ${row.points_24h} · за неделю ${row.points_7d} · напарников за сутки ${row.partners_24h} · новых аккаунтов-напарников ${row.new_partners} · игр за сутки ${row.games_24h} · жалоб ${row.reports}</small></span>
          <span class="gla-row-actions"><button type="button" data-gla-act="open" data-q="${escapeHtml(row.support_id || row.user_id)}">Открыть</button><button type="button" data-gla-act="sus-reset" data-user="${escapeHtml(row.user_id)}">Сбросить</button>${row.blocked ? "" : `<button type="button" class="is-danger" data-gla-act="sus-ban" data-user="${escapeHtml(row.user_id)}">Блок 7 дней</button>`}</span></li>`).join("")}</ul>` : '<p class="gla-note">Подозрительных сейчас нет.</p>'}`;
    } catch (error) { node.innerHTML = `<p class="gla-note">${escapeHtml(ERRORS[error?.message] || "Не удалось загрузить")}</p>`; }
  }

  // ——— Жалобы на людей (во вкладке «Жалобы») ———
  const REASON = { abuse: "Оскорбления", adult: "Недопустимое содержание", spam: "Спам", cheat: "Накрутка опыта", other: "Другое" };
  async function renderUserReports() {
    const node = $("#adminUserReports");
    if (!node) return;
    loading(node);
    try {
      const rows = await rpc("glowletter_admin_user_reports");
      node.innerHTML = `<div class="gla-head"><h4>Жалобы на игроков</h4></div>
        ${rows.length ? `<ul class="gla-list">${rows.map(row => `<li><span><b>${escapeHtml(REASON[row.reason] || row.reason)}</b> на ${escapeHtml(row.target_name || "Без имени")} <small>${escapeHtml(row.target_support || "")}</small>${row.count > 1 ? ` <span class="gla-tag">жалоб: ${row.count}</span>` : ""}${row.blocked ? ' <span class="gla-tag is-blocked">Заблокирован</span>' : ""}
          <small>От ${escapeHtml(row.reporter_name || "Без имени")} ${escapeHtml(row.reporter_support || "")} · ${escapeHtml(when(row.at))}</small>${row.note ? `<small class="gla-quote">${escapeHtml(row.note)}</small>` : ""}</span>
          <span class="gla-row-actions"><button type="button" data-gla-act="open" data-q="${escapeHtml(row.target_support || row.target)}">Открыть</button><button type="button" data-gla-act="rep-dismiss" data-id="${escapeHtml(row.id)}">Закрыть</button>${row.blocked ? "" : `<button type="button" class="is-danger" data-gla-act="rep-ban" data-id="${escapeHtml(row.id)}" data-user="${escapeHtml(row.target)}">Блок 7 дней</button>`}</span></li>`).join("")}</ul>` : '<p class="gla-note">Жалоб на игроков нет.</p>'}`;
    } catch (error) { node.innerHTML = `<p class="gla-note">${escapeHtml(ERRORS[error?.message] || "Не удалось загрузить")}</p>`; }
  }

  // ——— Журнал ———
  const ACTION = { ban: "Блокировка", unban: "Разблокировка", warn: "Предупреждение", moderate: "Модерация", reset_stats: "Сброс статистики", reset_season: "Сброс сезона", unlock_all: "Открыта вся коллекция",
    report_dismissed: "Жалобы закрыты", report_banned: "Блок по жалобам", report_warned: "Предупреждение по жалобам", report_reset: "Сброс по жалобам",
    vip_grant: "Выдан VIP", vip_grant_forever: "Выдано «Навсегда»", vip_revoke: "Доступ забран", vip_grant_all: "VIP всем", vip_revoke_all: "Забран VIP у всех",
    coins: "Светлячки", dollars: "Игровые доллары", item: "Вещь из магазина" };
  const MOD = { name: "имя", photos: "фото", voice: "голосовые", messages: "сообщения" };
  function detail(row) {
    const d = row.details || {};
    if (row.action === "ban") return d.until ? `до ${when(d.until)}${d.reason ? `, ${d.reason}` : ""}` : `навсегда${d.reason ? `, ${d.reason}` : ""}`;
    if (row.action === "warn") return d.message || "";
    if (row.action === "moderate") return `${MOD[d.what] || d.what}: ${d.rows}`;
    if (row.action === "reset_stats") return `${d.points} опыта, ${d.games} игр, ${d.medals} медалей${d.reason ? `, ${d.reason}` : ""}`;
    if (row.action.startsWith("vip_")) return d.days ? `${d.days} дн.` : "";
    if (row.action === "coins" || row.action === "dollars") return `${d.delta > 0 ? "+" : ""}${d.delta}`;
    if (row.action === "item") return `${window.GlowLetterShop?.text?.(d.item) || d.item} ${d.qty > 0 ? "+" : ""}${d.qty}`;
    return "";
  }
  async function renderLog() {
    const node = $("#adminLog");
    if (!node) return;
    loading(node);
    try {
      const rows = await rpc("glowletter_admin_log_list", { p_limit: 150 });
      node.innerHTML = `<div class="gla-head"><h4>Журнал действий</h4><button type="button" data-gla-act="refresh" data-tab="log">Обновить</button></div>
        ${rows.length ? `<ul class="gla-list is-log">${rows.map(row => `<li><span><b>${escapeHtml(ACTION[row.action] || row.action)}</b> · ${row.target ? who(row) : "все"}<small>${escapeHtml(when(row.at))}${detail(row) ? ` · ${escapeHtml(detail(row))}` : ""}</small></span></li>`).join("")}</ul>` : '<p class="gla-note">Журнал пуст.</p>'}`;
    } catch (error) { node.innerHTML = `<p class="gla-note">${escapeHtml(ERRORS[error?.message] || "Не удалось загрузить")}</p>`; }
  }

  // ——— Статистика ———
  const COLS = [["new_users", "Новые"], ["active", "Активные"], ["purchases", "Покупки"], ["letters", "Письма"], ["messages", "Сообщения"], ["games", "Игры"], ["reports", "Жалобы"]];
  async function renderStats() {
    const node = $("#adminStats");
    if (!node) return;
    loading(node);
    try {
      const rows = await rpc("glowletter_admin_daily_stats", { p_days: state.statsDays }) || [];
      const total = key => rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
      node.innerHTML = `<div class="gla-head"><h4>Статистика по дням</h4><span class="gla-seg">${[7, 14, 30].map(n => `<button type="button" data-gla-act="stats-days" data-days="${n}" aria-pressed="${state.statsDays === n}">${n} дн.</button>`).join("")}</span></div>
        <div class="gla-totals">${COLS.map(([key, label]) => `<p><b>${total(key)}</b><small>${label}</small></p>`).join("")}</div>
        <div class="gla-table-wrap"><table class="gla-table"><thead><tr><th>День</th>${COLS.map(([, label]) => `<th>${label}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(row => `<tr><td>${escapeHtml(day(row.day))}</td>${COLS.map(([key]) => `<td>${Number(row[key] || 0)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
        <p class="gla-note">Дни по UTC. Тестовые покупки не считаются.</p>`;
    } catch (error) { node.innerHTML = `<p class="gla-note">${escapeHtml(ERRORS[error?.message] || "Не удалось загрузить")}</p>`; }
  }

  function setTab(tab) { document.querySelector(`#adminPanel [data-admin-tab="${tab}"]`)?.click(); }
  function show(tab) {
    if (tab === "guard") renderGuard();
    else if (tab === "suspects") renderSuspects();
    else if (tab === "log") renderLog();
    else if (tab === "stats") renderStats();
    else if (tab === "reports") renderUserReports();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("#adminPanel [data-gla-act]");
    if (button) { event.preventDefault(); act(button); }
  });
  document.addEventListener("submit", event => {
    const form = event.target.closest("#adminPanel [data-gla-form=find]");
    if (!form) return;
    event.preventDefault();
    find(new FormData(form).get("q"));
  });

  window.GlowLetterAdmin = Object.freeze({ show });
})();
