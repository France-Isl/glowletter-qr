(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const COPY = {
    ru: {
      title: "Вход или регистрация по e-mail",
      or: "или по e-mail",
      login: "Войти",
      register: "Регистрация",
      name: "Ваше имя",
      email: "E-mail",
      password: "Пароль",
      newPassword: "Придумайте пароль",
      hint: "Минимум 8 символов, буква и цифра. Никому не сообщайте пароль и код.",
      getCode: "Получить код",
      signIn: "Войти",
      codeTitle: "Введите код из письма",
      codeLabel: "Код подтверждения",
      verify: "Подтвердить e-mail",
      resend: "Отправить код ещё раз",
      change: "Изменить e-mail",
      sending: "Отправляю код…",
      checking: "Проверяю…",
      sent: "Код отправлен на {email}. Он действует ограниченное время.",
      resent: "Новый код отправлен.",
      ready: "E-mail подтверждён. Аккаунт готов.",
      invalid: "Проверьте e-mail, пароль или код и повторите.",
      confirmFirst: "Сначала подтвердите e-mail кодом из письма.",
      passwordRule: "Пароль должен содержать от 8 до 128 символов, букву и цифру.",
      wait: "Повторить через {seconds} сек.",
      rateLimited: "Слишком много попыток. Подождите немного и повторите.",
      unavailable: "Вход по e-mail временно недоступен. Проверьте интернет и повторите."
    },
    en: {
      title: "Sign in or register with email",
      or: "or use email",
      login: "Sign in",
      register: "Register",
      name: "Your name",
      email: "Email",
      password: "Password",
      newPassword: "Create a password",
      hint: "Use 8–128 characters with a letter and a number. Never share your password or code.",
      getCode: "Get verification code",
      signIn: "Sign in",
      codeTitle: "Enter the code from your email",
      codeLabel: "Verification code",
      verify: "Verify email",
      resend: "Send another code",
      change: "Change email",
      sending: "Sending code…",
      checking: "Checking…",
      sent: "A code was sent to {email}. It is valid for a limited time.",
      resent: "A new code was sent.",
      ready: "Email verified. Your account is ready.",
      invalid: "Check your email, password, or code and try again.",
      confirmFirst: "Verify your email first using the code in your message.",
      passwordRule: "Use 8–128 characters with a letter and a number.",
      wait: "Try again in {seconds}s.",
      rateLimited: "Too many attempts. Wait a moment and try again.",
      unavailable: "Email sign-in is temporarily unavailable. Check your connection and try again."
    },
    fr: {
      title: "Connexion ou inscription par e-mail",
      or: "ou avec l’e-mail",
      login: "Connexion",
      register: "Inscription",
      name: "Votre prénom",
      email: "E-mail",
      password: "Mot de passe",
      newPassword: "Créer un mot de passe",
      hint: "Utilisez 8 à 128 caractères, avec une lettre et un chiffre. Ne partagez jamais votre mot de passe ni le code.",
      getCode: "Recevoir le code",
      signIn: "Se connecter",
      codeTitle: "Saisissez le code reçu par e-mail",
      codeLabel: "Code de vérification",
      verify: "Confirmer l’e-mail",
      resend: "Renvoyer le code",
      change: "Modifier l’e-mail",
      sending: "Envoi du code…",
      checking: "Vérification…",
      sent: "Un code a été envoyé à {email}. Sa durée de validité est limitée.",
      resent: "Un nouveau code a été envoyé.",
      ready: "E-mail confirmé. Votre compte est prêt.",
      invalid: "Vérifiez l’e-mail, le mot de passe ou le code puis réessayez.",
      confirmFirst: "Confirmez d’abord votre e-mail avec le code reçu.",
      passwordRule: "Utilisez 8 à 128 caractères, avec une lettre et un chiffre.",
      wait: "Nouvel envoi dans {seconds} s.",
      rateLimited: "Trop de tentatives. Patientez un instant puis réessayez.",
      unavailable: "La connexion par e-mail est momentanément indisponible. Vérifiez votre connexion puis réessayez."
    }
  };

  const PENDING_KEY = "glowletter-pending-email";
  const RESEND_KEY = "glowletter-email-resend-after";
  const RESEND_DELAY_MS = 60000;
  let mode = "login";
  let busy = false;
  let resendUntil = 0;
  let countdownTimer = 0;
  let pendingEmailMemory = "";
  let statusRecord = null;

  function language() {
    const value = String(document.documentElement.lang || "ru").toLowerCase().split("-")[0];
    return COPY[value] ? value : "ru";
  }

  function c(key) {
    return COPY[language()][key] || COPY.ru[key] || key;
  }

  function normalizeEmail(value) {
    return String(value || "").normalize("NFKC").trim().toLowerCase().slice(0, 254);
  }

  function emailValue(selector) {
    return normalizeEmail($(selector)?.value);
  }

  function safeFocus(node) {
    if (!node) return;
    try { node.focus({ preventScroll: true }); } catch { node.focus(); }
  }

  function renderStatus(message = "", state = "") {
    const node = $("#emailAuthStatus");
    if (!node) return;
    node.textContent = message;
    node.dataset.state = state;
    node.setAttribute("aria-live", state === "error" ? "assertive" : "polite");
  }

  function status(message = "", state = "") {
    statusRecord = null;
    renderStatus(message, state);
  }

  function localizedStatus(key, state = "", replacements = {}) {
    statusRecord = { key, state, replacements };
    let message = c(key);
    Object.entries(replacements).forEach(([name, value]) => {
      message = message.replace(`{${name}}`, String(value));
    });
    renderStatus(message, state);
  }

  function setBusy(value, statusKey = "") {
    busy = value;
    const root = $("#emailAuth");
    if (root) root.setAttribute("aria-busy", String(value));
    document.querySelectorAll("#emailAuth button,#emailAuth input").forEach(control => {
      control.disabled = value;
    });
    if (statusKey) localizedStatus(statusKey);
    if (!value) updateCountdown();
  }

  function pendingEmail() {
    try { return normalizeEmail(sessionStorage.getItem(PENDING_KEY) || pendingEmailMemory); } catch { return pendingEmailMemory; }
  }

  function storedResendUntil() {
    try {
      const value = Number(sessionStorage.getItem(RESEND_KEY));
      return Number.isFinite(value) && value > Date.now() ? value : 0;
    } catch {
      return 0;
    }
  }

  function setPendingEmail(email) {
    pendingEmailMemory = normalizeEmail(email);
    try {
      if (pendingEmailMemory) sessionStorage.setItem(PENDING_KEY, pendingEmailMemory);
      else sessionStorage.removeItem(PENDING_KEY);
    } catch { /* Storage can be unavailable in private WebViews. */ }
  }

  function setResendUntil(timestamp) {
    const now = Date.now();
    resendUntil = Number.isFinite(timestamp) && timestamp > now
      ? Math.min(timestamp, now + RESEND_DELAY_MS)
      : 0;
    try {
      if (resendUntil) sessionStorage.setItem(RESEND_KEY, String(resendUntil));
      else sessionStorage.removeItem(RESEND_KEY);
    } catch { /* The in-memory cooldown still applies. */ }
  }

  function clearPendingVerification() {
    setPendingEmail("");
    setResendUntil(0);
  }

  function strongPassword(value) {
    return typeof value === "string"
      && value.length >= 8
      && value.length <= 128
      && /[\p{L}]/u.test(value)
      && /\d/u.test(value);
  }

  function isRateLimitError(error) {
    const code = String(error?.code || "").toLowerCase();
    return Number(error?.status) === 429 || code.includes("rate_limit") || code.includes("over_email_send_rate_limit");
  }

  function isUnconfirmedError(error) {
    return String(error?.code || "").toLowerCase() === "email_not_confirmed";
  }

  function isUnavailableError(error) {
    const code = String(error?.code || "").toLowerCase();
    const statusCode = Number(error?.status);
    return error?.name === "TypeError"
      || statusCode >= 500
      || code.includes("network")
      || code.includes("timeout")
      || code === "auth_unavailable";
  }

  function reportError(error) {
    if ((typeof navigator !== "undefined" && navigator.onLine === false) || isUnavailableError(error)) {
      localizedStatus("unavailable", "error");
    } else if (isRateLimitError(error)) {
      localizedStatus("rateLimited", "error");
    } else {
      localizedStatus("invalid", "error");
    }
  }

  function setTabState(tab, pane, active) {
    if (tab) {
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    }
    if (pane) pane.hidden = !active;
  }

  function selectMode(next, focusTab = false) {
    mode = next === "register" ? "register" : "login";
    const tabList = $(".email-auth-tabs");
    if (tabList) tabList.hidden = false;
    const loginTab = $("#emailLoginTab");
    const registerTab = $("#emailRegisterTab");
    setTabState(loginTab, $("#emailLoginPane"), mode === "login");
    setTabState(registerTab, $("#emailRegisterPane"), mode === "register");
    const verifyPane = $("#emailVerifyPane");
    if (verifyPane) verifyPane.hidden = true;
    status();
    if (focusTab) safeFocus(mode === "login" ? loginTab : registerTab);
  }

  function showVerification(email, statusKey = "sent", startCooldown = true) {
    setPendingEmail(email);
    const tabList = $(".email-auth-tabs");
    const loginPane = $("#emailLoginPane");
    const registerPane = $("#emailRegisterPane");
    const verifyPane = $("#emailVerifyPane");
    if (tabList) tabList.hidden = true;
    if (loginPane) loginPane.hidden = true;
    if (registerPane) registerPane.hidden = true;
    if (verifyPane) verifyPane.hidden = false;
    $("#emailCodeSentTo").textContent = email;
    $("#emailCode").value = "";
    localizedStatus(statusKey, statusKey === "sent" ? "success" : "", { email });
    setResendUntil(startCooldown ? Date.now() + RESEND_DELAY_MS : storedResendUntil());
    updateCountdown();
    safeFocus($("#emailCode"));
  }

  function updateCountdown() {
    clearTimeout(countdownTimer);
    const button = $("#emailResendCode");
    if (!button) return;
    const seconds = Math.max(0, Math.ceil((resendUntil - Date.now()) / 1000));
    button.disabled = busy || seconds > 0;
    button.textContent = seconds ? c("wait").replace("{seconds}", String(seconds)) : c("resend");
    if (seconds) countdownTimer = setTimeout(updateCountdown, 1000);
    else setResendUntil(0);
  }

  function translate() {
    const mapping = {
      emailAuthTitle: "title",
      emailAuthOr: "or",
      emailLoginTab: "login",
      emailRegisterTab: "register",
      emailRegisterNameLabel: "name",
      emailLoginEmailLabel: "email",
      emailRegisterEmailLabel: "email",
      emailLoginPasswordLabel: "password",
      emailRegisterPasswordLabel: "newPassword",
      emailPasswordHint: "hint",
      emailLoginSubmit: "signIn",
      emailRegisterSubmit: "getCode",
      emailCodeTitle: "codeTitle",
      emailCodeLabel: "codeLabel",
      emailVerifySubmit: "verify",
      emailChangeAddress: "change"
    };
    Object.entries(mapping).forEach(([id, key]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = c(key);
    });
    if (statusRecord) localizedStatus(statusRecord.key, statusRecord.state, statusRecord.replacements);
    updateCountdown();
  }

  function validForm(form) {
    if (!form || form.checkValidity()) return true;
    form.reportValidity();
    return false;
  }

  async function login(event) {
    event.preventDefault();
    if (busy || !validForm(event.currentTarget)) return;
    const api = window.GlowLetterCloud;
    const email = emailValue("#emailLoginEmail");
    const password = $("#emailLoginPassword").value;
    if (!api?.signInWithPassword) return localizedStatus("unavailable", "error");
    setBusy(true, "checking");
    try {
      await api.signInWithPassword(email, password);
      clearPendingVerification();
      $("#emailLoginPassword").value = "";
      localizedStatus("ready", "success");
    } catch (error) {
      if (isUnconfirmedError(error)) showVerification(email, "confirmFirst", false);
      else reportError(error);
    } finally {
      setBusy(false);
    }
  }

  async function register(event) {
    event.preventDefault();
    if (busy || !validForm(event.currentTarget)) return;
    const api = window.GlowLetterCloud;
    const email = emailValue("#emailRegisterEmail");
    const passwordInput = $("#emailRegisterPassword");
    const password = passwordInput.value;
    const name = String($("#emailRegisterName").value || "").normalize("NFKC").trim().slice(0, 60);
    if (!strongPassword(password)) return localizedStatus("passwordRule", "error");
    if (!api?.registerEmail) return localizedStatus("unavailable", "error");
    setBusy(true, "sending");
    try {
      const result = await api.registerEmail(email, password, name);
      passwordInput.value = "";
      if (result?.session) {
        clearPendingVerification();
        localizedStatus("ready", "success");
      } else {
        showVerification(email);
      }
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  }

  async function verify(event) {
    event.preventDefault();
    if (busy || !validForm(event.currentTarget)) return;
    const email = pendingEmail();
    const token = String($("#emailCode").value || "").replace(/\D/g, "").slice(0, 6);
    const api = window.GlowLetterCloud;
    if (!email || token.length !== 6) return localizedStatus("invalid", "error");
    if (!api?.verifyEmailCode) return localizedStatus("unavailable", "error");
    let retryCode = false;
    setBusy(true, "checking");
    try {
      await api.verifyEmailCode(email, token);
      clearPendingVerification();
      $("#emailCode").value = "";
      localizedStatus("ready", "success");
    } catch (error) {
      reportError(error);
      retryCode = true;
    } finally {
      setBusy(false);
      if (retryCode) {
        safeFocus($("#emailCode"));
        $("#emailCode").select();
      }
    }
  }

  async function resend() {
    if (busy || Date.now() < resendUntil) return;
    const email = pendingEmail();
    const api = window.GlowLetterCloud;
    if (!email || !api?.resendEmailCode) return localizedStatus("unavailable", "error");
    if (typeof navigator !== "undefined" && navigator.onLine === false) return localizedStatus("unavailable", "error");
    setBusy(true, "sending");
    try {
      await api.resendEmailCode(email);
      setResendUntil(Date.now() + RESEND_DELAY_MS);
      localizedStatus("resent", "success");
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  }

  function handleTabKeydown(event) {
    if (![/^ArrowLeft$/, /^ArrowRight$/, /^Home$/, /^End$/].some(pattern => pattern.test(event.key))) return;
    event.preventDefault();
    const next = event.key === "ArrowLeft" || event.key === "Home" ? "login" : "register";
    selectMode(next, true);
  }

  function prepareAccessibility() {
    const loginPane = $("#emailLoginPane");
    const registerPane = $("#emailRegisterPane");
    loginPane?.setAttribute("role", "tabpanel");
    loginPane?.setAttribute("aria-labelledby", "emailLoginTab");
    registerPane?.setAttribute("role", "tabpanel");
    registerPane?.setAttribute("aria-labelledby", "emailRegisterTab");
    $("#emailVerifyPane")?.setAttribute("aria-labelledby", "emailCodeTitle");
    $("#emailLoginEmail")?.setAttribute("aria-describedby", "emailAuthStatus");
    $("#emailLoginPassword")?.setAttribute("aria-describedby", "emailAuthStatus");
    $("#emailRegisterEmail")?.setAttribute("aria-describedby", "emailAuthStatus");
    $("#emailRegisterPassword")?.setAttribute("aria-describedby", "emailPasswordHint emailAuthStatus");
    $("#emailCode")?.setAttribute("aria-describedby", "emailCodeSentTo emailAuthStatus");
  }

  function init() {
    if (!$("#emailAuth")) return;
    prepareAccessibility();
    $("#emailLoginTab").addEventListener("click", () => selectMode("login"));
    $("#emailRegisterTab").addEventListener("click", () => selectMode("register"));
    $("#emailLoginTab").addEventListener("keydown", handleTabKeydown);
    $("#emailRegisterTab").addEventListener("keydown", handleTabKeydown);
    $("#emailLoginPane").addEventListener("submit", login);
    $("#emailRegisterPane").addEventListener("submit", register);
    $("#emailVerifyPane").addEventListener("submit", verify);
    $("#emailResendCode").addEventListener("click", resend);
    $("#emailChangeAddress").addEventListener("click", () => {
      clearPendingVerification();
      selectMode("register");
      safeFocus($("#emailRegisterEmail"));
    });
    $("#emailCode").addEventListener("input", event => {
      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
    });
    addEventListener("glowletter-language-changed", translate);
    addEventListener("glowletter-cloud-session", event => {
      if (!event.detail?.signedIn) return;
      clearPendingVerification();
      $("#emailLoginPassword").value = "";
      $("#emailRegisterPassword").value = "";
      $("#emailCode").value = "";
      localizedStatus("ready", "success");
    });
    translate();
    selectMode(mode);
    resendUntil = storedResendUntil();
    const pending = pendingEmail();
    if (pending) showVerification(pending, "sent", false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
