/*
  «Игровой стол» · игры для разговора вдвоём (2.4.26).

  Четыре игры для table.js (GlowLetterTable.register):
    • lost    — «Тёпа заблудился»: штурман видит весь лабиринт, второй ведёт мишку в тумане.
    • explain — «Объясни слово»: раунды по 60 секунд, счёт общий.
    • sketch  — «Угадай рисунок»: один рисует на общем холсте, другой угадывает.
    • talk    — «О чём поговорить»: карточки с темами, когда разговор затих.

  Обычно друзья в это время говорят в звонке, но каждая игра работает и без него:
  подсказки кнопками, ответы текстом с автопроверкой.

  Как устроена синхронизация:
    • api.rng() — общий генератор: лабиринты и порядок слов одинаковы у обоих, потому что
      при запуске (и при возвращении друга) он вызывается в одном и том же порядке.
    • В раундовых играх хозяин раунда — тот, кто объясняет/рисует/ведёт мишку. Только он меняет
      состояние и рассылает его целиком («st» с номером версии); второй присылает просьбы
      («hit», «guess») и принимает только более новое состояние.
    • Время раунда передаётся как «сколько осталось» (мс), а не как отметка часов —
      часы на двух телефонах могут расходиться.
    • Пока друга нет за столом, таймеры стоят; когда он вернулся, хозяин раунда шлёт состояние снова.
    • snapshot()/restore() — партия для друга, который заново сел за стол. Штрихи рисунка
      в снимок не входят (сообщение не больше 8 КБ): вернувшийся просит их отдельно («need»).

  Слова и карточки — window.GLOWLETTER_TABLE_CONTENT (table-content.js); если языка нет, берётся английский.
*/
(() => {
  "use strict";

  const BEAR_PICTURE = "assets/loves/s28d.webp";
  const LEVELS = [7, 9, 11];
  const ROUNDS = 4;
  const EXPLAIN_MS = 60000;
  const SKETCH_MS = 80000;
  const TALK_CARDS = 12;
  const MAZE_PX = 720;
  const SIZE = 900;
  const PAPER = "#fff8ef";
  const COLORS = ["#2b2233", "#c8423b", "#e98aa3", "#f0a04b", "#e7c35a", "#4f9d69", "#4b7bd1", "#8a62c9"];
  const WIDTHS = [6, 16];
  const ERASER = 40;
  const MAX_STROKES = 600;
  const MAX_POINTS = 1200;
  const HINTS = ["up", "down", "left", "right", "stop", "almost"];
  const TALK_ICONS = { childhood: "🪁", travel: "🧳", food: "🍲", dreams: "🌟", whatif: "💭", funny: "😄" };

  // Направления: бит открытого прохода в клетке и обратный бит у соседа.
  const DIRS = [
    { name: "up", dx: 0, dy: -1, bit: 1, back: 4, arrow: "↑" },
    { name: "right", dx: 1, dy: 0, bit: 2, back: 8, arrow: "→" },
    { name: "down", dx: 0, dy: 1, bit: 4, back: 1, arrow: "↓" },
    { name: "left", dx: -1, dy: 0, bit: 8, back: 2, arrow: "←" }
  ];

  // ——— Чистые помощники (их же проверяют тесты) ———

  function seeded(seed) {
    let value = seed >>> 0 || 1;
    return () => {
      value = (value + 0x6d2b79f5) >>> 0;
      let mixed = value;
      mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
      return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Перестановка 0…n-1 (Фишер — Йейтс).
  function shuffled(count, rand) {
    const list = Array.from({ length: Math.max(0, count) }, (_, index) => index);
    for (let index = list.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(rand() * (index + 1));
      [list[index], list[swap]] = [list[swap], list[index]];
    }
    return list;
  }

  // Для сравнения ответов: регистр, ё=е, диакритика, пунктуация, артикли не важны.
  function normalize(text) {
    return String(text ?? "").toLowerCase().normalize("NFD").replace(/\p{M}+/gu, "")
      .replace(/[’'`´-]/gu, " ").replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\s+/gu, " ").trim()
      .replace(/^(?:the|an|a|to|le|la|les|l|un|une|des|du)\s+/u, "");
  }

  function distance(left, right) {
    const row = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let i = 1; i <= left.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= right.length; j += 1) {
        const saved = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
        previous = saved;
      }
    }
    return row[right.length];
  }

  // Верно, если совпало, если слово целиком есть в коротком ответе или если опечатка небольшая.
  function isGuess(guess, word) {
    const said = normalize(guess);
    const target = normalize(word);
    if (!said || !target) return false;
    if (said === target) return true;
    if (` ${said} `.includes(` ${target} `) && said.split(" ").length <= target.split(" ").length + 2) return true;
    const limit = target.length >= 9 ? 2 : target.length >= 5 ? 1 : 0;
    return limit > 0 && Math.abs(said.length - target.length) <= limit && distance(said, target) <= limit;
  }

  // Лабиринт без замкнутых комнат (поиск с возвратом) и с парой лишних проходов, чтобы штурману
  // было легче исправлять ошибки. Старт — в углу, домик — в самой дальней клетке.
  function makeMaze(size, rand) {
    const open = new Array(size * size).fill(0);
    const seen = new Uint8Array(size * size);
    const corners = [[0, 0], [size - 1, 0], [0, size - 1], [size - 1, size - 1]];
    const [sx, sy] = corners[Math.floor(rand() * corners.length)];
    const stack = [sy * size + sx];
    seen[stack[0]] = 1;
    while (stack.length) {
      const cell = stack[stack.length - 1];
      const x = cell % size;
      const y = Math.floor(cell / size);
      const choices = DIRS.map((dir, index) => ({ dir, index, nx: x + dir.dx, ny: y + dir.dy }))
        .filter(({ nx, ny }) => nx >= 0 && ny >= 0 && nx < size && ny < size && !seen[ny * size + nx]);
      if (!choices.length) { stack.pop(); continue; }
      const { dir, nx, ny } = choices[Math.floor(rand() * choices.length)];
      const next = ny * size + nx;
      open[cell] |= dir.bit;
      open[next] |= dir.back;
      seen[next] = 1;
      stack.push(next);
    }
    for (let extra = 0; extra < Math.floor(size / 2); extra += 1) {
      const x = Math.floor(rand() * size);
      const y = Math.floor(rand() * size);
      const dir = DIRS[Math.floor(rand() * 4)];
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      open[y * size + x] |= dir.bit;
      open[ny * size + nx] |= dir.back;
    }
    const far = distances({ size, open }, sx, sy);
    let home = 0;
    far.forEach((value, index) => { if (value > far[home]) home = index; });
    return { size, open, start: { x: sx, y: sy }, home: { x: home % size, y: Math.floor(home / size) } };
  }

  function canMove(maze, x, y, dirIndex) {
    const dir = DIRS[dirIndex];
    if (!dir || x < 0 || y < 0 || x >= maze.size || y >= maze.size) return false;
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    return nx >= 0 && ny >= 0 && nx < maze.size && ny < maze.size && Boolean(maze.open[y * maze.size + x] & dir.bit);
  }

  function distances(maze, sx, sy) {
    const far = new Array(maze.size * maze.size).fill(-1);
    const queue = [[sx, sy]];
    far[sy * maze.size + sx] = 0;
    for (let head = 0; head < queue.length; head += 1) {
      const [x, y] = queue[head];
      DIRS.forEach((dir, index) => {
        if (!canMove(maze, x, y, index)) return;
        const next = (y + dir.dy) * maze.size + x + dir.dx;
        if (far[next] >= 0) return;
        far[next] = far[y * maze.size + x] + 1;
        queue.push([x + dir.dx, y + dir.dy]);
      });
    }
    return far;
  }

  // Длина кратчайшего пути от старта до домика (-1 — дороги нет).
  const solve = maze => distances(maze, maze.start.x, maze.start.y)[maze.home.y * maze.size + maze.home.x];

  function contentFor(kind, lang) {
    const all = window.GLOWLETTER_TABLE_CONTENT?.[kind] || {};
    const list = all[lang];
    return Array.isArray(list) && list.length ? list : Array.isArray(all.en) ? all.en : [];
  }

  const clock = ms => {
    const seconds = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  };

  if (window.__GLOWLETTER_TEST__) {
    window.GlowLetterTablePartyTest = Object.freeze({ seeded, shuffled, normalize, isGuess, makeMaze, canMove, solve, contentFor, clock, LEVELS, DIRS });
  }

  if (!window.GlowLetterTable) return;

  // ——— Общее для всех игр ———

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const int = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const text = (value, max) => typeof value === "string" && value.length <= max;
  const otherOf = api => (api.first === api.me ? api.friend.id : api.me);
  const ownerOf = (api, index) => (index % 2 === 0 ? api.first : otherOf(api));
  const buzz = pattern => { try { if (navigator.userActivation?.hasBeenActive !== false) navigator.vibrate?.(pattern); } catch {} };
  // Сравнение ключей состояния [раунд, фаза, версия] слева направо.
  const compare = (left, right) => { for (let index = 0; index < left.length; index += 1) { if (left[index] !== right[index]) return left[index] - right[index]; } return 0; };

  // Обратный отсчёт по своим часам; другу передаётся только остаток.
  function countdown() {
    let left = 0;
    let deadline = 0;
    let running = false;
    let paused = false;
    const timer = {
      set(ms, pause = false) { running = true; paused = Boolean(pause); left = Math.max(0, ms); deadline = Date.now() + left; },
      stop() { running = false; paused = false; left = 0; },
      pause() { if (running && !paused) { left = timer.left(); paused = true; } },
      resume() { if (running && paused) { paused = false; deadline = Date.now() + left; } },
      left: () => (!running ? 0 : paused ? left : Math.max(0, deadline - Date.now())),
      running: () => running,
      paused: () => paused
    };
    return timer;
  }

  function stopwatch() {
    let total = 0;
    let since = 0;
    const watch = {
      start() { if (!since) since = Date.now(); },
      stop() { if (since) { total += Date.now() - since; since = 0; } },
      set(ms) { total = Math.max(0, ms); if (since) since = Date.now(); },
      reset() { total = 0; since = 0; },
      ms: () => total + (since ? Date.now() - since : 0)
    };
    return watch;
  }

  // Каркас игры: строка роли, предупреждение «друга нет», основная часть.
  function frame(el, id) {
    el.innerHTML = `
      <div class="gltp gltp-${id}">
        <div class="gltp-bar"><span class="gltp-pill" data-ref="role"></span><span class="gltp-meta" data-ref="meta" aria-live="polite"></span></div>
        <p class="gltp-away" data-ref="away" role="status" hidden></p>
        <div class="gltp-main" data-ref="main"></div>
      </div>`;
    const ref = name => el.querySelector(`[data-ref="${name}"]`);
    return { root: el.firstElementChild, ref };
  }

  // Раз в четверть секунды: проверяем, за столом ли друг, и двигаем таймер.
  function ticker(api, { onPartner, onTick }) {
    let here = api.partnerHere();
    const id = setInterval(() => {
      const now = api.partnerHere();
      if (now !== here) { here = now; onPartner(now); }
      onTick?.();
    }, 250);
    return { here: () => here, stop: () => clearInterval(id) };
  }

  function showAway(node, api, here) {
    node.hidden = here;
    node.textContent = here ? "" : api.tt("away", { name: api.friend.name || "" });
  }

  // Перерисовка без потери набранного ответа и фокуса.
  function keepInput(el, render) {
    const input = el.querySelector("input[data-keep]");
    const value = input?.value || "";
    const focused = Boolean(input) && document.activeElement === input;
    render();
    const next = el.querySelector("input[data-keep]");
    if (next) {
      next.value = value;
      if (focused) next.focus({ preventScroll: true });
    }
  }

  const timerHtml = (api, ms, total) => `
    <div class="gltp-timer" role="timer" aria-label="${escapeHtml(api.t("timeLeft", { s: Math.ceil(ms / 1000) }))}">
      <b data-ref="clock">${clock(ms)}</b>
      <span class="gltp-progress"><i data-ref="bar" style="--gltp-left:${(ms / total).toFixed(3)}"></i></span>
    </div>`;

  function paintTimer(el, ms, total) {
    const node = el.querySelector("[data-ref=clock]");
    if (node) node.textContent = clock(ms);
    el.querySelector("[data-ref=bar]")?.style.setProperty("--gltp-left", (ms / total).toFixed(3));
    el.querySelector(".gltp-timer")?.classList.toggle("is-low", ms <= 10000);
  }

  const guessForm = api => `
    <form class="gltp-guess" data-form="guess" autocomplete="off">
      <input data-keep type="text" maxlength="40" enterkeyhint="send" autocapitalize="off" spellcheck="false" aria-label="${escapeHtml(api.t("guessLabel"))}" placeholder="${escapeHtml(api.t("guessLabel"))}" />
      <button class="glg-primary" type="submit">${escapeHtml(api.t("guessSend"))}</button>
    </form>`;

  const chips = (list, label) => (list.length ? `
    <ul class="gltp-chips" aria-label="${escapeHtml(label)}">
      ${list.map(item => `<li class="${item.ok ? "is-ok" : ""}">${item.ok ? "✓ " : ""}${escapeHtml(item.t)}</li>`).join("")}
    </ul>` : "");

  // ——— 1. «Тёпа заблудился» ———

  function mountLost(el, api) {
    const mazes = LEVELS.map(size => makeMaze(size, api.rng));
    const PHASE = { play: 0, home: 1, done: 2 };
    const s = { level: 0, phase: "play", x: mazes[0].start.x, y: mazes[0].start.y, k: 0, times: [] };
    const watch = stopwatch();
    const { ref } = frame(el, "lost");
    const name = () => api.friend.name || "";
    let hintTimer = 0;
    let bumpTimer = 0;
    let finished = false;
    let swipe = null;
    let tip = "";

    ref("main").innerHTML = `
      <p class="gltp-tip" data-ref="tip" aria-live="polite"></p>
      <div class="gltp-board">
        <canvas width="${MAZE_PX}" height="${MAZE_PX}" role="img"></canvas>
        <div class="gltp-hint" data-ref="hint" role="alert" hidden></div>
        <div class="gltp-cover" data-ref="cover" hidden></div>
      </div>
      <div class="gltp-controls" data-ref="controls"></div>`;
    const canvas = el.querySelector("canvas");
    const context = canvas.getContext("2d");

    const iWalk = () => ownerOf(api, s.level) === api.me;
    const maze = () => mazes[Math.min(s.level, mazes.length - 1)];
    const total = () => s.times.reduce((sum, value) => sum + (Number(value) || 0), 0);
    const sendState = () => api.send("st", { level: s.level, phase: s.phase, x: s.x, y: s.y, k: s.k, times: s.times, ms: watch.ms() });

    function draw() {
      const current = maze();
      const cell = MAZE_PX / current.size;
      context.fillStyle = "#fbf3e2";
      context.fillRect(0, 0, MAZE_PX, MAZE_PX);
      context.strokeStyle = "#3a2c1c";
      context.lineWidth = Math.max(4, cell * 0.12);
      context.lineCap = "round";
      context.beginPath();
      for (let y = 0; y < current.size; y += 1) {
        for (let x = 0; x < current.size; x += 1) {
          const open = current.open[y * current.size + x];
          const left = x * cell;
          const top = y * cell;
          if (!(open & 1)) { context.moveTo(left, top); context.lineTo(left + cell, top); }
          if (!(open & 8)) { context.moveTo(left, top); context.lineTo(left, top + cell); }
          if (x === current.size - 1 && !(open & 2)) { context.moveTo(left + cell, top); context.lineTo(left + cell, top + cell); }
          if (y === current.size - 1 && !(open & 4)) { context.moveTo(left, top + cell); context.lineTo(left + cell, top + cell); }
        }
      }
      context.stroke();
      const bx = (s.x + 0.5) * cell;
      const by = (s.y + 0.5) * cell;
      context.fillStyle = "rgba(217, 164, 65, .35)";
      context.beginPath();
      context.arc(bx, by, cell * 0.42, 0, Math.PI * 2);
      context.fill();
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `${Math.round(cell * 0.66)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui,sans-serif`;
      context.fillText("🏡", (current.home.x + 0.5) * cell, (current.home.y + 0.5) * cell + cell * 0.04);
      context.fillText("🧸", bx, by + cell * 0.04);
      // Туман: идущему видно только клетки вокруг мишки (радиус ~1,5 клетки).
      if (iWalk() && s.phase === "play") {
        const radius = cell * 1.6;
        const fog = context.createRadialGradient(bx, by, radius * 0.6, bx, by, radius);
        fog.addColorStop(0, "rgba(12, 11, 20, 0)");
        fog.addColorStop(1, "rgba(12, 11, 20, 1)");
        context.fillStyle = fog;
        context.fillRect(0, 0, MAZE_PX, MAZE_PX);
      }
      canvas.setAttribute("aria-label", api.t(iWalk() ? "mazeFog" : "mazeFull"));
    }

    function renderUi() {
      const walk = iWalk();
      ref("role").textContent = s.phase === "done" ? api.t("title") : walk ? api.t("roleWalker") : api.t("roleGuide");
      ref("role").classList.toggle("is-me", walk && s.phase === "play");
      ref("meta").textContent = `${api.t("level", { n: Math.min(s.level + 1, LEVELS.length), total: LEVELS.length })} · ${clock(s.phase === "done" ? total() : watch.ms())}`;
      ref("tip").textContent = tip || (s.phase !== "play" ? "" : walk ? api.t("walkerTip", { name: name() }) : api.t("guideTip", { name: name() }));
      const cover = ref("cover");
      cover.hidden = s.phase === "play";
      if (s.phase === "home") {
        cover.innerHTML = `
          <p class="gltp-big" aria-hidden="true">🧸🏡</p>
          <h3>${escapeHtml(api.t("home"))}</h3>
          <p>${escapeHtml(api.t("levelTime", { t: clock(s.times[s.level] || 0) }))}</p>
          <p class="gltp-muted">${escapeHtml(api.t("swap"))}</p>
          <button class="glg-primary" type="button" data-act="next">${escapeHtml(api.t("next"))}</button>`;
      } else if (s.phase === "done") {
        cover.innerHTML = `
          <img class="gltp-bear" src="${BEAR_PICTURE}" alt="" width="120" height="120" decoding="async" />
          <h3>${escapeHtml(api.t("doneTitle"))}</h3>
          <p class="gltp-score">${escapeHtml(api.t("total", { t: clock(total()) }))}</p>`;
      }
      const controls = ref("controls");
      if (s.phase !== "play") { controls.innerHTML = ""; return; }
      controls.innerHTML = walk ? `
        <div class="gltp-pad" role="group" aria-label="${escapeHtml(api.t("controls"))}">
          ${DIRS.map((dir, index) => `<button class="gltp-key gltp-key-${dir.name}" type="button" data-act="move" data-dir="${index}" aria-label="${escapeHtml(api.t(dir.name))}">${dir.arrow}</button>`).join("")}
        </div>` : `
        <div class="gltp-hints" role="group" aria-label="${escapeHtml(api.t("hintsLabel"))}">
          ${HINTS.map(hint => {
            const dir = DIRS.find(item => item.name === hint);
            return `<button class="gltp-key${dir ? "" : " gltp-key-word"}" type="button" data-act="hint" data-hint="${hint}" aria-label="${escapeHtml(api.t(hint))}">${escapeHtml(dir ? dir.arrow : api.t(hint))}</button>`;
          }).join("")}
        </div>`;
    }

    const render = () => { draw(); renderUi(); };

    function setTip(value) {
      tip = value;
      renderUi();
      clearTimeout(bumpTimer);
      bumpTimer = setTimeout(() => { tip = ""; renderUi(); }, 1600);
    }

    function move(dirIndex) {
      if (!iWalk() || s.phase !== "play") return;
      if (!loop.here()) { api.toast(api.tt("away", { name: name() })); return; }
      const current = maze();
      if (!canMove(current, s.x, s.y, dirIndex)) {
        buzz(30);
        if (!reduced()) { canvas.classList.remove("is-bump"); void canvas.offsetWidth; canvas.classList.add("is-bump"); }
        setTip(api.t("wall"));
        return;
      }
      s.x += DIRS[dirIndex].dx;
      s.y += DIRS[dirIndex].dy;
      s.k += 1;
      if (s.x === current.home.x && s.y === current.home.y) {
        watch.stop();
        s.times[s.level] = watch.ms();
        s.phase = s.level >= LEVELS.length - 1 ? "done" : "home";
        buzz([60, 40, 60]);
      }
      sendState();
      render();
      if (s.phase === "done") complete();
    }

    function goLevel(level) {
      if (level >= LEVELS.length) return;
      Object.assign(s, { level, phase: "play", x: mazes[level].start.x, y: mazes[level].start.y, k: 0 });
      watch.reset();
      if (loop.here()) watch.start();
      render();
    }

    function complete() {
      if (finished) return;
      finished = true;
      watch.stop();
      api.finish("done");
    }

    function showHint(hint) {
      const node = ref("hint");
      const dir = DIRS.find(item => item.name === hint);
      node.innerHTML = `<b aria-hidden="true">${escapeHtml(dir ? dir.arrow : hint === "stop" ? "✋" : "✨")}</b><span>${escapeHtml(api.t(hint))}</span>`;
      node.hidden = false;
      node.classList.remove("is-pop");
      void node.offsetWidth;
      if (!reduced()) node.classList.add("is-pop");
      buzz(40);
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => { node.hidden = true; }, 1700);
    }

    function validState(data) {
      if (!data || !int(data.level, 0, LEVELS.length - 1) || !(data.phase in PHASE)) return false;
      const size = LEVELS[data.level];
      return int(data.x, 0, size - 1) && int(data.y, 0, size - 1) && int(data.k, 0, 100000)
        && Array.isArray(data.times) && data.times.length <= LEVELS.length && data.times.every(value => value == null || (Number.isFinite(value) && value >= 0))
        && Number.isFinite(data.ms) && data.ms >= 0;
    }

    function apply(data) {
      Object.assign(s, { level: data.level, phase: data.phase, x: data.x, y: data.y, k: data.k, times: data.times.map(value => Math.min(Number(value) || 0, 86400000)) });
      watch.set(Math.min(data.ms, 86400000));
      if (s.phase === "play" && loop.here()) watch.start(); else watch.stop();
      render();
      if (s.phase === "done") complete();
    }

    function onClick(event) {
      const button = event.target.closest("[data-act]");
      if (!button || !el.contains(button)) return;
      const action = button.dataset.act;
      if (action === "move") move(Number(button.dataset.dir));
      else if (action === "hint" && HINTS.includes(button.dataset.hint) && s.phase === "play" && !iWalk()) {
        api.send("hint", { h: button.dataset.hint, level: s.level });
        button.classList.remove("is-sent");
        void button.offsetWidth;
        button.classList.add("is-sent");
        setTip(api.t("hintSent"));
      } else if (action === "next" && s.phase === "home") {
        api.send("next", { level: s.level + 1 });
        goLevel(s.level + 1);
      }
    }

    // Свайп по лабиринту или касание рядом с мишкой — шаг в ту сторону.
    function onDown(event) {
      if (!iWalk() || s.phase !== "play") return;
      swipe = { x: event.clientX, y: event.clientY };
    }
    function onUp(event) {
      if (!swipe) return;
      const box = canvas.getBoundingClientRect();
      let dx = event.clientX - swipe.x;
      let dy = event.clientY - swipe.y;
      swipe = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
        const cell = box.width / maze().size;
        dx = event.clientX - (box.left + (s.x + 0.5) * cell);
        dy = event.clientY - (box.top + (s.y + 0.5) * cell);
        if (Math.max(Math.abs(dx), Math.abs(dy)) < cell * 0.4) return;
      }
      move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
    const KEYS = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3 };
    function onKey(event) {
      if (!el.isConnected || event.altKey || event.ctrlKey || event.metaKey || event.target?.closest?.("input, textarea, select, [contenteditable]")) return;
      const dir = KEYS[event.key];
      if (dir == null || !iWalk() || s.phase !== "play") return;
      event.preventDefault();
      move(dir);
    }

    el.addEventListener("click", onClick);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", () => { swipe = null; });
    document.addEventListener("keydown", onKey);

    const loop = ticker(api, {
      onPartner(here) {
        showAway(ref("away"), api, here);
        if (here && s.phase === "play") watch.start(); else watch.stop();
        if (here && iWalk()) sendState();
        renderUi();
      },
      onTick() { if (s.phase === "play") ref("meta").textContent = `${api.t("level", { n: s.level + 1, total: LEVELS.length })} · ${clock(watch.ms())}`; }
    });
    showAway(ref("away"), api, loop.here());
    if (loop.here()) watch.start();
    render();

    return {
      onMessage(type, data) {
        if (type === "st" && validState(data)) {
          if (compare([data.level, PHASE[data.phase], data.k], [s.level, PHASE[s.phase], s.k]) >= 0) apply(data);
        } else if (type === "hint" && data && HINTS.includes(data.h) && data.level === s.level && iWalk() && s.phase === "play") {
          showHint(data.h);
        } else if (type === "next" && data && int(data.level, 1, LEVELS.length - 1) && s.phase === "home" && data.level === s.level + 1) {
          goLevel(data.level);
        }
      },
      snapshot: () => ({ level: s.level, phase: s.phase, x: s.x, y: s.y, k: s.k, times: s.times.slice(), ms: watch.ms() }),
      restore(data) { if (validState(data)) apply(data); },
      destroy() {
        loop.stop();
        clearTimeout(hintTimer);
        clearTimeout(bumpTimer);
        el.removeEventListener("click", onClick);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointerup", onUp);
        document.removeEventListener("keydown", onKey);
      }
    };
  }

  // ——— 2. «Объясни слово» ———

  function mountExplain(el, api) {
    const deck = contentFor("explain", api.lang);
    const order = shuffled(deck.length, seeded(Math.floor(api.rng() * 4294967296)));
    const PHASE = { ready: 0, play: 1, after: 2 };
    const s = { v: 0, r: 0, phase: "ready", pos: 0, n: 0, word: "", score: 0, list: [] };
    const timer = countdown();
    const { ref } = frame(el, "explain");
    const name = () => api.friend.name || "";
    let mine = [];
    let theirs = [];
    let finished = false;

    const iExplain = () => ownerOf(api, s.r) === api.me;
    const nextWord = () => { const word = deck.length ? String(deck[order[s.pos % deck.length]]) : "?"; s.pos += 1; return word; };
    const broadcast = () => { s.v += 1; api.send("st", { ...s, list: s.list.slice(-40), left: timer.left() }); };
    const resend = () => api.send("st", { ...s, list: s.list.slice(-40), left: timer.left() });

    function render() {
      keepInput(el, () => {
        const me = iExplain();
        ref("role").textContent = me ? api.t("explainerMe") : api.t("explainerFriend", { name: name() });
        ref("role").classList.toggle("is-me", me);
        ref("meta").textContent = `${api.t("round", { n: s.r + 1, total: ROUNDS })} · ${api.t("score", { n: s.score })}`;
        ref("main").innerHTML = s.phase === "ready" ? ready(me) : s.phase === "play" ? play(me) : after();
      });
    }

    const turn = me => `<p class="gltp-turn">${escapeHtml(me ? api.tt("yourTurn") : api.tt("friendTurn", { name: name() }))}</p>`;

    const ready = me => `
      <div class="gltp-card gltp-center">
        ${turn(me)}
        <p class="gltp-big" aria-hidden="true">🗣️</p>
        <p>${escapeHtml(me ? api.t("readyMe") : api.t("readyFriend", { name: name() }))}</p>
        <p class="gltp-muted">${escapeHtml(api.t("rule"))}</p>
        ${me ? `<button class="glg-primary gltp-wide" type="button" data-act="start"${loop.here() ? "" : " disabled"}>${escapeHtml(api.t("start"))}</button>` : ""}
      </div>`;

    const play = me => me ? `
      ${timerHtml(api, timer.left(), EXPLAIN_MS)}
      <div class="gltp-card gltp-word">
        <small>${escapeHtml(api.t("yourWord"))}</small>
        <strong>${escapeHtml(s.word)}</strong>
      </div>
      <p class="gltp-muted gltp-center-text">${escapeHtml(api.t("rule"))}</p>
      <div class="gltp-actions">
        <button class="glg-secondary" type="button" data-act="skip"${loop.here() ? "" : " disabled"}>${escapeHtml(api.t("skip"))}</button>
        <button class="glg-primary" type="button" data-act="got"${loop.here() ? "" : " disabled"}>✓ ${escapeHtml(api.t("got"))}</button>
      </div>
      ${theirs.length ? `<p class="gltp-label">${escapeHtml(api.t("theirGuesses", { name: name() }))}</p>${chips(theirs, api.t("theirGuesses", { name: name() }))}` : ""}` : `
      ${timerHtml(api, timer.left(), EXPLAIN_MS)}
      <div class="gltp-card gltp-center">
        <p class="gltp-big" aria-hidden="true">👂</p>
        <p>${escapeHtml(api.t("listen"))}</p>
      </div>
      ${guessForm(api)}
      <p class="gltp-feedback" data-ref="feedback" aria-live="polite"></p>
      ${chips(mine, api.t("guessLabel"))}`;

    function after() {
      const last = s.r >= ROUNDS - 1;
      const words = s.list.length ? `<ul class="gltp-words">${s.list.map(item => `<li class="${item.ok ? "is-ok" : "is-skip"}"><span aria-hidden="true">${item.ok ? "✓" : "–"}</span> ${escapeHtml(item.w)}<span class="gltp-sr"> · ${escapeHtml(api.t(item.ok ? "gotMark" : "skipMark"))}</span></li>`).join("")}</ul>` : `<p class="gltp-muted">${escapeHtml(api.t("noWords"))}</p>`;
      return `
        <div class="gltp-card gltp-center">
          <h3>${escapeHtml(api.t(last ? "doneTitle" : "afterTitle"))}</h3>
          <p class="gltp-score">${escapeHtml(api.t(last ? "doneScore" : "score", { n: s.score }))}</p>
        </div>
        <p class="gltp-label">${escapeHtml(api.t("afterWords"))}</p>
        ${words}
        ${last ? "" : `<button class="glg-primary gltp-wide" type="button" data-act="next">${escapeHtml(api.t("next"))}</button>`}`;
    }

    function startRound() {
      if (!iExplain() || s.phase !== "ready" || !loop.here()) return;
      Object.assign(s, { phase: "play", list: [] });
      s.word = nextWord();
      s.n += 1;
      theirs = [];
      timer.set(EXPLAIN_MS);
      broadcast();
      render();
    }

    function mark(ok) {
      if (!iExplain() || s.phase !== "play" || !s.word) return;
      s.list.push({ w: s.word, ok });
      if (ok) { s.score += 1; buzz(40); }
      s.word = nextWord();
      s.n += 1;
      theirs = [];
      broadcast();
      render();
      if (ok && !reduced()) el.querySelector(".gltp-word")?.classList.add("is-hit");
    }

    function endRound() {
      if (s.word) s.list.push({ w: s.word, ok: false });
      Object.assign(s, { phase: "after", word: "" });
      timer.stop();
      broadcast();
      render();
      if (s.r >= ROUNDS - 1) complete();
    }

    function goRound(round) {
      if (round >= ROUNDS) return;
      Object.assign(s, { v: 0, r: round, phase: "ready", word: "", list: [] });
      timer.stop();
      mine = [];
      theirs = [];
      render();
    }

    function complete() { if (!finished) { finished = true; api.finish("done"); } }

    function submitGuess(input) {
      const value = input.value.trim().slice(0, 40);
      if (!value || iExplain() || s.phase !== "play") return;
      input.value = "";
      const ok = isGuess(value, s.word);
      mine.unshift({ t: value, ok });
      mine = mine.slice(0, 8);
      if (ok) api.send("hit", { n: s.n }); else api.send("guess", { n: s.n, t: value });
      render();
      const feedback = el.querySelector("[data-ref=feedback]");
      if (feedback) { feedback.textContent = api.t(ok ? "guessYes" : "guessNo"); feedback.classList.toggle("is-ok", ok); }
      if (ok) buzz(40);
    }

    function validState(data) {
      return data && int(data.r, 0, ROUNDS - 1) && data.phase in PHASE && int(data.v, 0, 100000) && int(data.pos, 0, 100000) && int(data.n, 0, 100000)
        && text(data.word, 80) && int(data.score, 0, 10000) && Array.isArray(data.list) && data.list.length <= 40
        && data.list.every(item => item && text(item.w, 80) && typeof item.ok === "boolean")
        && Number.isFinite(data.left) && data.left >= 0 && data.left <= EXPLAIN_MS;
    }

    function apply(data) {
      const wordChanged = data.n !== s.n;
      Object.assign(s, { v: data.v, r: data.r, phase: data.phase, pos: data.pos, n: data.n, word: data.word, score: data.score, list: data.list.map(item => ({ w: item.w, ok: item.ok })) });
      if (s.phase === "play") timer.set(data.left, !loop.here()); else timer.stop();
      if (wordChanged) mine = [];
      render();
      if (s.phase === "after" && s.r >= ROUNDS - 1) complete();
    }

    function onClick(event) {
      const button = event.target.closest("[data-act]");
      if (!button || !el.contains(button)) return;
      const action = button.dataset.act;
      if (action === "start") startRound();
      else if (action === "got") mark(true);
      else if (action === "skip") mark(false);
      else if (action === "next" && s.phase === "after" && s.r + 1 < ROUNDS) { api.send("next", { r: s.r + 1 }); goRound(s.r + 1); }
    }

    function onSubmit(event) {
      const form = event.target.closest("[data-form=guess]");
      if (!form) return;
      event.preventDefault();
      submitGuess(form.querySelector("input"));
    }

    el.addEventListener("click", onClick);
    el.addEventListener("submit", onSubmit);

    const loop = ticker(api, {
      onPartner(here) {
        showAway(ref("away"), api, here);
        if (here) timer.resume(); else timer.pause();
        if (here && iExplain() && s.v > 0) resend();
        render();
      },
      onTick() {
        if (s.phase !== "play") return;
        paintTimer(el, timer.left(), EXPLAIN_MS);
        if (iExplain() && !timer.paused() && timer.left() <= 0) endRound();
      }
    });
    showAway(ref("away"), api, loop.here());
    render();

    return {
      onMessage(type, data) {
        if (type === "st" && validState(data)) {
          if (compare([data.r, PHASE[data.phase], data.v], [s.r, PHASE[s.phase], s.v]) >= 0) apply(data);
        } else if (type === "hit" && data && data.n === s.n && iExplain() && s.phase === "play") {
          mark(true);
        } else if (type === "guess" && data && data.n === s.n && text(data.t, 40) && data.t.trim() && iExplain() && s.phase === "play") {
          theirs.unshift({ t: data.t.trim(), ok: false });
          theirs = theirs.slice(0, 6);
          render();
        } else if (type === "next" && data && int(data.r, 1, ROUNDS - 1) && s.phase === "after" && data.r === s.r + 1) {
          goRound(data.r);
        }
      },
      snapshot: () => ({ ...s, list: s.list.slice(-40), left: timer.left() }),
      restore(data) { if (validState(data)) apply(data); },
      destroy() {
        loop.stop();
        el.removeEventListener("click", onClick);
        el.removeEventListener("submit", onSubmit);
      }
    };
  }

  // ——— 3. «Угадай рисунок» ———

  function mountSketch(el, api) {
    const deck = contentFor("sketch", api.lang);
    const order = shuffled(deck.length, seeded(Math.floor(api.rng() * 4294967296)));
    const PHASE = { choose: 0, draw: 1, after: 2 };
    const s = { v: 0, r: 0, phase: "choose", pos: 0, word: "", score: 0, gain: 0 };
    const timer = countdown();
    const { ref } = frame(el, "sketch");
    const name = () => api.friend.name || "";
    const board = { strokes: [], current: null, pending: [], color: COLORS[0], width: WIDTHS[0], eraser: false, flush: 0 };
    let mine = [];
    let theirs = [];
    let finished = false;
    let colorNames = [];

    ref("main").innerHTML = `
      <div data-ref="top"></div>
      <div class="gltp-paper" data-ref="paper">
        <canvas width="${SIZE}" height="${SIZE}" role="img"></canvas>
      </div>
      <div data-ref="panel"></div>`;
    const canvas = el.querySelector("canvas");
    const context = canvas.getContext("2d");

    const iDraw = () => ownerOf(api, s.r) === api.me;
    const options = () => [0, 1, 2].map(step => (deck.length ? String(deck[order[(s.pos + step) % deck.length]]) : "?"));
    const broadcast = () => { s.v += 1; api.send("st", { ...s, left: timer.left() }); };
    const resend = () => api.send("st", { ...s, left: timer.left() });
    const canDraw = () => iDraw() && s.phase === "draw" && loop.here();

    function render() {
      colorNames = String(api.t("colorNames")).split(",").map(item => item.trim());
      keepInput(el, () => {
        const me = iDraw();
        ref("role").textContent = me ? api.t("drawerMe") : api.t("drawerFriend", { name: name() });
        ref("role").classList.toggle("is-me", me);
        ref("meta").textContent = `${api.t("round", { n: s.r + 1, total: ROUNDS })} · ${api.t("score", { n: s.score })}`;
        ref("paper").hidden = s.phase === "choose";
        ref("paper").classList.toggle("is-live", canDraw());
        canvas.setAttribute("aria-label", api.t("canvasLabel"));
        ref("top").innerHTML = top(me);
        ref("panel").innerHTML = panel(me);
      });
    }

    const mask = word => [...word].map(character => (/[\p{L}\p{N}]/u.test(character) ? "_" : character === " " ? " " : character)).join("");
    const letters = word => [...word].filter(character => /[\p{L}\p{N}]/u.test(character)).length;

    function top(me) {
      if (s.phase === "choose") return "";
      if (s.phase === "after") {
        return `<div class="gltp-card gltp-center gltp-compact">
          <p class="gltp-result ${s.gain ? "is-ok" : ""}">${escapeHtml(s.gain ? api.t("afterGuessed", { n: s.gain }) : api.t("afterMissed"))}</p>
          <p>${escapeHtml(api.t("wordWas", { word: s.word }))}</p>
        </div>`;
      }
      return `${timerHtml(api, timer.left(), SKETCH_MS)}
        ${me ? `<p class="gltp-draw-word">${escapeHtml(api.t("drawWord", { word: s.word }))}</p>`
        : `<p class="gltp-mask" aria-label="${escapeHtml(api.t("letters", { n: letters(s.word) }))}"><span aria-hidden="true">${escapeHtml(mask(s.word))}</span> <small>${escapeHtml(api.t("letters", { n: letters(s.word) }))}</small></p>`}`;
    }

    function panel(me) {
      if (s.phase === "choose") {
        return me ? `
          <div class="gltp-card gltp-center">
            <p class="gltp-turn">${escapeHtml(api.tt("yourTurn"))}</p>
            <h3>${escapeHtml(api.t("choose"))}</h3>
            <div class="gltp-choices">
              ${options().map((word, index) => `<button class="glg-secondary" type="button" data-act="choose" data-index="${index}"${loop.here() ? "" : " disabled"}>${escapeHtml(word)}</button>`).join("")}
            </div>
            <p class="gltp-muted">${escapeHtml(api.t("noLetters"))}</p>
          </div>` : `
          <div class="gltp-card gltp-center">
            <p class="gltp-turn">${escapeHtml(api.tt("friendTurn", { name: name() }))}</p>
            <p class="gltp-big" aria-hidden="true">✏️</p>
            <p>${escapeHtml(api.t("chooseFriend", { name: name() }))}</p>
          </div>`;
      }
      if (s.phase === "after") {
        const last = s.r >= ROUNDS - 1;
        return last ? `
          <div class="gltp-card gltp-center">
            <h3>${escapeHtml(api.t("doneTitle"))}</h3>
            <p class="gltp-score">${escapeHtml(api.t("doneScore", { n: s.score }))}</p>
          </div>` : `<button class="glg-primary gltp-wide" type="button" data-act="next">${escapeHtml(api.t("next"))}</button>`;
      }
      if (me) {
        return `
          <div class="gltp-tools" role="group" aria-label="${escapeHtml(api.t("colors"))}">
            ${COLORS.map((color, index) => `<button type="button" class="gltp-swatch${!board.eraser && board.color === color ? " is-active" : ""}" style="--gltp-swatch:${color}" data-act="color" data-color="${color}" aria-label="${escapeHtml(colorNames[index] || `${api.t("colors")} ${index + 1}`)}" aria-pressed="${!board.eraser && board.color === color}"></button>`).join("")}
          </div>
          <div class="gltp-tools">
            ${WIDTHS.map((width, index) => `<button type="button" class="gltp-tool${!board.eraser && board.width === width ? " is-active" : ""}" data-act="width" data-width="${width}" aria-pressed="${!board.eraser && board.width === width}" aria-label="${escapeHtml(api.t(index ? "thick" : "thin"))}"><i style="--gltp-dot:${Math.max(6, width * 0.8)}px"></i></button>`).join("")}
            <button type="button" class="gltp-tool${board.eraser ? " is-active" : ""}" data-act="eraser" aria-pressed="${board.eraser}">${escapeHtml(api.t("eraser"))}</button>
            <button type="button" class="gltp-tool" data-act="undo">↶ ${escapeHtml(api.t("undo"))}</button>
            <button type="button" class="gltp-tool" data-act="clear">${escapeHtml(api.t("clear"))}</button>
          </div>
          <button class="glg-primary gltp-wide" type="button" data-act="got"${loop.here() ? "" : " disabled"}>✓ ${escapeHtml(api.t("got"))}</button>
          ${theirs.length ? `<p class="gltp-label">${escapeHtml(api.t("theirGuesses", { name: name() }))}</p>${chips(theirs, api.t("theirGuesses", { name: name() }))}` : ""}`;
      }
      return `
        <p class="gltp-muted">${escapeHtml(api.t("guessTip"))}</p>
        ${guessForm(api)}
        <p class="gltp-feedback" data-ref="feedback" aria-live="polite"></p>
        ${chips(mine, api.t("guessLabel"))}`;
    }

    // Холст: те же штрихи, что в «Рисуем вместе» (online.js), только рисует один.
    function paint() {
      context.fillStyle = PAPER;
      context.fillRect(0, 0, SIZE, SIZE);
      for (const stroke of board.strokes) paintStroke(stroke, 0);
    }

    function paintStroke(stroke, start) {
      const points = stroke.p;
      if (points.length < 2) return;
      context.strokeStyle = stroke.c;
      context.fillStyle = stroke.c;
      context.lineWidth = stroke.w;
      context.lineCap = "round";
      context.lineJoin = "round";
      if (points.length === 2) {
        context.beginPath();
        context.arc(points[0], points[1], stroke.w / 2, 0, Math.PI * 2);
        context.fill();
        return;
      }
      context.beginPath();
      context.moveTo(points[start], points[start + 1]);
      for (let index = start + 2; index < points.length; index += 2) context.lineTo(points[index], points[index + 1]);
      context.stroke();
    }

    const pointOf = event => {
      const box = canvas.getBoundingClientRect();
      return [Math.max(0, Math.min(SIZE, Math.round(((event.clientX - box.left) / box.width) * SIZE))), Math.max(0, Math.min(SIZE, Math.round(((event.clientY - box.top) / box.height) * SIZE)))];
    };

    function onDown(event) {
      if (!canDraw() || board.strokes.length >= MAX_STROKES) return;
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      const stroke = { id: `${api.me.slice(0, 8)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, c: board.eraser ? PAPER : board.color, w: board.eraser ? ERASER : board.width, p: pointOf(event) };
      board.strokes.push(stroke);
      board.current = stroke;
      board.pending = [...stroke.p];
      paintStroke(stroke, 0);
      clearInterval(board.flush);
      board.flush = setInterval(flush, 60);
    }

    function onMove(event) {
      const stroke = board.current;
      if (!stroke || stroke.p.length >= MAX_POINTS * 2) return;
      event.preventDefault();
      const [x, y] = pointOf(event);
      if (Math.abs(x - stroke.p[stroke.p.length - 2]) + Math.abs(y - stroke.p[stroke.p.length - 1]) < 3) return;
      stroke.p.push(x, y);
      board.pending.push(x, y);
      paintStroke(stroke, stroke.p.length - 4);
    }

    function onUp() {
      if (!board.current) return;
      flush();
      clearInterval(board.flush);
      board.flush = 0;
      board.current = null;
    }

    // Каждый кусок продолжает линию с последней отправленной точки — у друга она не рвётся.
    function flush() {
      const stroke = board.current;
      if (!stroke || !board.pending.length) return;
      api.send("s", { r: s.r, id: stroke.id, c: stroke.c, w: stroke.w, p: board.pending });
      board.pending = board.pending.length >= 2 ? [] : board.pending;
    }

    const validStroke = data => data && int(data.r, 0, ROUNDS - 1) && text(data.id, 40) && (data.c === PAPER || COLORS.includes(data.c))
      && (WIDTHS.includes(data.w) || data.w === ERASER) && Array.isArray(data.p) && data.p.length <= MAX_POINTS * 2;
    const cleanPoints = points => points.filter(Number.isFinite).map(value => Math.max(0, Math.min(SIZE, Math.round(value))));

    function onSegment(data, replace) {
      if (!validStroke(data) || data.r !== s.r || s.phase === "choose") return;
      const points = cleanPoints(data.p);
      let stroke = board.strokes.find(item => item.id === data.id);
      if (!stroke) {
        if (board.strokes.length >= MAX_STROKES) return;
        stroke = { id: data.id, c: data.c, w: data.w, p: [] };
        board.strokes.push(stroke);
      }
      if (replace) { stroke.p = points.slice(0, MAX_POINTS * 2); paint(); return; }
      if (stroke.p.length >= MAX_POINTS * 2) return;
      const from = stroke.p.length;
      stroke.p.push(...points);
      paintStroke(stroke, Math.max(0, from - 2));
    }

    // Вернувшемуся другу — все штрихи раунда кусками по 400 чисел (сообщение < 8 КБ).
    function shareAll() {
      for (const stroke of board.strokes) {
        if (stroke === board.current) continue;
        for (let index = 0, part = 0; index < Math.max(stroke.p.length, 1); index += 400, part += 1) {
          api.send("full", { r: s.r, id: stroke.id, c: stroke.c, w: stroke.w, p: stroke.p.slice(index, index + 400), k: part });
        }
      }
    }

    function clearBoard() {
      onUp();
      board.strokes = [];
      paint();
    }

    function choose(index) {
      if (!iDraw() || s.phase !== "choose" || !loop.here()) return;
      const word = options()[index];
      if (!word) return;
      Object.assign(s, { phase: "draw", word, gain: 0 });
      s.pos += 3;
      clearBoard();
      theirs = [];
      timer.set(SKETCH_MS);
      broadcast();
      render();
    }

    function guessed() {
      if (!iDraw() || s.phase !== "draw") return;
      s.gain = 5 + Math.ceil(timer.left() / 10000);
      s.score += s.gain;
      endRound();
      buzz([50, 40, 50]);
    }

    function endRound() {
      onUp();
      s.phase = "after";
      timer.stop();
      broadcast();
      render();
      if (s.r >= ROUNDS - 1) complete();
    }

    function goRound(round) {
      if (round >= ROUNDS) return;
      Object.assign(s, { v: 0, r: round, phase: "choose", word: "", gain: 0 });
      timer.stop();
      clearBoard();
      mine = [];
      theirs = [];
      render();
    }

    function complete() { if (!finished) { finished = true; api.finish("done"); } }

    function submitGuess(input) {
      const value = input.value.trim().slice(0, 40);
      if (!value || iDraw() || s.phase !== "draw") return;
      input.value = "";
      const ok = isGuess(value, s.word);
      mine.unshift({ t: value, ok });
      mine = mine.slice(0, 8);
      if (ok) api.send("hit", { r: s.r }); else api.send("guess", { r: s.r, t: value });
      render();
      const feedback = el.querySelector("[data-ref=feedback]");
      if (feedback) { feedback.textContent = api.t(ok ? "guessYes" : "guessNo"); feedback.classList.toggle("is-ok", ok); }
      if (ok) buzz(40);
    }

    function validState(data) {
      return data && int(data.r, 0, ROUNDS - 1) && data.phase in PHASE && int(data.v, 0, 100000) && int(data.pos, 0, 100000)
        && text(data.word, 80) && int(data.score, 0, 10000) && int(data.gain, 0, 20)
        && Number.isFinite(data.left) && data.left >= 0 && data.left <= SKETCH_MS;
    }

    function apply(data) {
      const fresh = data.r !== s.r || (data.phase === "draw" && s.phase === "choose");
      Object.assign(s, { v: data.v, r: data.r, phase: data.phase, pos: data.pos, word: data.word, score: data.score, gain: data.gain });
      if (fresh) { clearBoard(); mine = []; theirs = []; }
      if (s.phase === "draw") timer.set(data.left, !loop.here()); else timer.stop();
      render();
      if (s.phase === "after" && s.r >= ROUNDS - 1) complete();
    }

    function onClick(event) {
      const button = event.target.closest("[data-act]");
      if (!button || !el.contains(button)) return;
      switch (button.dataset.act) {
        case "choose": choose(Number(button.dataset.index)); return;
        case "got": guessed(); return;
        case "next": if (s.phase === "after" && s.r + 1 < ROUNDS) { api.send("next", { r: s.r + 1 }); goRound(s.r + 1); } return;
        case "color": if (COLORS.includes(button.dataset.color)) { board.color = button.dataset.color; board.eraser = false; render(); } return;
        case "width": board.width = WIDTHS.includes(Number(button.dataset.width)) ? Number(button.dataset.width) : WIDTHS[0]; board.eraser = false; render(); return;
        case "eraser": board.eraser = !board.eraser; render(); return;
        case "undo": {
          if (!iDraw() || s.phase !== "draw" || board.current) return;
          const stroke = board.strokes.pop();
          if (!stroke) return;
          api.send("u", { r: s.r, id: stroke.id });
          paint();
          return;
        }
        case "clear":
          if (!iDraw() || s.phase !== "draw" || !board.strokes.length) return;
          clearBoard();
          api.send("x", { r: s.r });
          return;
        default:
      }
    }

    function onSubmit(event) {
      const form = event.target.closest("[data-form=guess]");
      if (!form) return;
      event.preventDefault();
      submitGuess(form.querySelector("input"));
    }

    el.addEventListener("click", onClick);
    el.addEventListener("submit", onSubmit);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const loop = ticker(api, {
      onPartner(here) {
        showAway(ref("away"), api, here);
        if (here) timer.resume(); else { timer.pause(); onUp(); }
        if (here && iDraw() && s.v > 0) { resend(); shareAll(); }
        render();
      },
      onTick() {
        if (s.phase !== "draw") return;
        paintTimer(el, timer.left(), SKETCH_MS);
        if (iDraw() && !timer.paused() && timer.left() <= 0) endRound();
      }
    });
    showAway(ref("away"), api, loop.here());
    paint();
    render();

    return {
      onMessage(type, data) {
        if (type === "st" && validState(data)) {
          if (compare([data.r, PHASE[data.phase], data.v], [s.r, PHASE[s.phase], s.v]) >= 0) apply(data);
        } else if (type === "s") onSegment(data, false);
        else if (type === "full") onSegment(data, data?.k === 0);
        else if (type === "u" && data && data.r === s.r && text(data.id, 40)) { board.strokes = board.strokes.filter(stroke => stroke.id !== data.id); paint(); }
        else if (type === "x" && data && data.r === s.r) { board.strokes = []; paint(); }
        else if (type === "need" && data && data.r === s.r && s.phase !== "choose") shareAll();
        else if (type === "hit" && data && data.r === s.r && iDraw() && s.phase === "draw") guessed();
        else if (type === "guess" && data && data.r === s.r && text(data.t, 40) && data.t.trim() && iDraw() && s.phase === "draw") {
          theirs.unshift({ t: data.t.trim(), ok: false });
          theirs = theirs.slice(0, 6);
          render();
        } else if (type === "next" && data && int(data.r, 1, ROUNDS - 1) && s.phase === "after" && data.r === s.r + 1) goRound(data.r);
      },
      snapshot: () => ({ ...s, left: timer.left() }),
      restore(data) {
        if (!validState(data)) return;
        apply(data);
        if (s.phase !== "choose") api.send("need", { r: s.r });
      },
      destroy() {
        loop.stop();
        clearInterval(board.flush);
        el.removeEventListener("click", onClick);
        el.removeEventListener("submit", onSubmit);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
      }
    };
  }

  // ——— 4. «О чём поговорить» ———

  function mountTalk(el, api) {
    // Порядок — по английскому списку: на всех языках под одним номером одна и та же карточка.
    const base = contentFor("talk", "en");
    const local = contentFor("talk", api.lang);
    const order = shuffled(base.length, seeded(Math.floor(api.rng() * 4294967296)));
    const s = { pos: 0, card: order[0] ?? 0 };
    const { ref } = frame(el, "talk");
    const name = () => api.friend.name || "";
    let finished = false;

    const cardOf = index => {
      const own = local[index];
      const fallback = base[index];
      return own && (!fallback || own.c === fallback.c) ? own : fallback || { c: "funny", t: "" };
    };

    function render() {
      const done = s.pos >= TALK_CARDS;
      const meFirst = ownerOf(api, s.pos) === api.me;
      ref("role").textContent = done ? api.t("title") : meFirst ? api.t("firstMe") : api.t("firstFriend", { name: name() });
      ref("role").classList.toggle("is-me", !done && meFirst);
      ref("meta").textContent = api.t("card", { n: Math.min(s.pos + 1, TALK_CARDS), total: TALK_CARDS });
      if (done) {
        ref("main").innerHTML = `
          <div class="gltp-card gltp-center">
            <img class="gltp-bear" src="${BEAR_PICTURE}" alt="" width="120" height="120" decoding="async" />
            <h3>${escapeHtml(api.t("doneTitle", { n: TALK_CARDS }))}</h3>
            <p class="gltp-muted">${escapeHtml(api.t("doneNote", { again: api.tt("again") }))}</p>
          </div>`;
        return;
      }
      const card = cardOf(s.card);
      const category = TALK_ICONS[card.c] ? card.c : "funny";
      ref("main").innerHTML = `
        <article class="gltp-card gltp-talk-card${reduced() ? "" : " is-new"}" data-cat="${category}" aria-live="polite">
          <p class="gltp-cat"><span aria-hidden="true">${TALK_ICONS[category]}</span> ${escapeHtml(api.t(`cat_${category}`))}</p>
          <p class="gltp-question">${escapeHtml(card.t)}</p>
        </article>
        <span class="gltp-progress gltp-talk-progress" aria-hidden="true"><i style="--gltp-left:${((s.pos + 1) / TALK_CARDS).toFixed(3)}"></i></span>
        <button class="glg-primary gltp-wide" type="button" data-act="next">${escapeHtml(api.t(s.pos + 1 >= TALK_CARDS ? "finish" : "next"))} →</button>
        <p class="gltp-muted gltp-center-text">${escapeHtml(api.t("noCall"))}</p>`;
    }

    function go(pos, card) {
      s.pos = pos;
      s.card = card;
      render();
      if (s.pos >= TALK_CARDS && !finished) { finished = true; api.finish("done"); }
    }

    function onClick(event) {
      const button = event.target.closest("[data-act=next]");
      if (!button || !el.contains(button) || s.pos >= TALK_CARDS) return;
      const pos = s.pos + 1;
      const card = pos < TALK_CARDS ? order[pos % Math.max(order.length, 1)] ?? 0 : s.card;
      api.send("next", { pos, card });
      go(pos, card);
    }

    const valid = data => data && int(data.pos, 0, TALK_CARDS) && int(data.card, 0, Math.max(base.length - 1, 0));

    el.addEventListener("click", onClick);
    const loop = ticker(api, { onPartner: here => showAway(ref("away"), api, here) });
    showAway(ref("away"), api, loop.here());
    render();

    return {
      onMessage(type, data) {
        if (type === "next" && valid(data) && data.pos > s.pos) go(data.pos, data.card);
      },
      snapshot: () => ({ pos: s.pos, card: s.card }),
      restore(data) { if (valid(data)) go(data.pos, data.card); },
      destroy() {
        loop.stop();
        el.removeEventListener("click", onClick);
      }
    };
  }

  // ——— Тексты и регистрация ———

  const TABLE = window.GlowLetterTable;

  TABLE.register({
    id: "lost", icon: "🧸", order: 20,
    text: {
      ru: {
        title: "Тёпа заблудился", short: "Выведите мишку домой вдвоём",
        roleGuide: "Вы — штурман", roleWalker: "Вы ведёте Тёпу",
        guideTip: "Вам виден весь лабиринт. Подсказывайте {name} голосом или кнопками ниже.",
        walkerTip: "Видно только то, что рядом. Слушайте {name} и ведите Тёпу стрелками, свайпом или касанием.",
        level: "Уровень {n} из {total}", controls: "Управление Тёпой", hintsLabel: "Быстрые подсказки",
        up: "Вверх", down: "Вниз", left: "Влево", right: "Вправо", stop: "Стоп", almost: "Почти!",
        hintSent: "Подсказка отправлена", wall: "Там стена — попробуйте другой путь",
        home: "Тёпа дома!", levelTime: "Уровень пройден за {t}", swap: "Теперь меняетесь ролями.", next: "Следующий уровень",
        doneTitle: "Все три домика найдены!", total: "Общее время: {t}",
        mazeFull: "Лабиринт: видны Тёпа и домик", mazeFog: "Лабиринт в тумане: видно только клетки вокруг Тёпы"
      },
      en: {
        title: "Teddy is lost", short: "Guide the bear home together",
        roleGuide: "You are the guide", roleWalker: "You walk Teddy",
        guideTip: "You can see the whole maze. Guide {name} by voice or with the buttons below.",
        walkerTip: "You only see what’s nearby. Listen to {name} and move Teddy with arrows, swipes or taps.",
        level: "Level {n} of {total}", controls: "Move Teddy", hintsLabel: "Quick hints",
        up: "Up", down: "Down", left: "Left", right: "Right", stop: "Stop", almost: "Almost!",
        hintSent: "Hint sent", wall: "That’s a wall — try another way",
        home: "Teddy is home!", levelTime: "Level done in {t}", swap: "Now you swap roles.", next: "Next level",
        doneTitle: "All three homes found!", total: "Total time: {t}",
        mazeFull: "Maze: Teddy and the house are visible", mazeFog: "Foggy maze: only the cells around Teddy are visible"
      },
      fr: {
        title: "Nounours est perdu", short: "Ramenez l’ourson à la maison",
        roleGuide: "Vous guidez", roleWalker: "Vous menez Nounours",
        guideTip: "Vous voyez tout le labyrinthe. Guidez {name} à la voix ou avec les boutons ci-dessous.",
        walkerTip: "Vous ne voyez qu’autour de vous. Écoutez {name} et déplacez Nounours avec les flèches, en glissant ou en touchant.",
        level: "Niveau {n} sur {total}", controls: "Déplacer Nounours", hintsLabel: "Indices rapides",
        up: "Haut", down: "Bas", left: "Gauche", right: "Droite", stop: "Stop", almost: "Presque !",
        hintSent: "Indice envoyé", wall: "C’est un mur — essayez un autre chemin",
        home: "Nounours est à la maison !", levelTime: "Niveau terminé en {t}", swap: "Maintenant, on échange les rôles.", next: "Niveau suivant",
        doneTitle: "Les trois maisons sont trouvées !", total: "Temps total : {t}",
        mazeFull: "Labyrinthe : Nounours et la maison sont visibles", mazeFog: "Labyrinthe dans le brouillard : seules les cases autour de Nounours sont visibles"
      }
    },
    mount: mountLost
  });

  const GUESS_TEXT = {
    ru: { guessLabel: "Ваш вариант", guessSend: "Проверить", guessNo: "Не то — попробуйте ещё", guessYes: "Верно!", theirGuesses: "Варианты: {name}", round: "Раунд {n} из {total}", next: "Следующий раунд", timeLeft: "Осталось {s} с", got: "Угадано" },
    en: { guessLabel: "Your guess", guessSend: "Check", guessNo: "Not quite — try again", guessYes: "Correct!", theirGuesses: "Guesses from {name}", round: "Round {n} of {total}", next: "Next round", timeLeft: "{s} s left", got: "Guessed" },
    fr: { guessLabel: "Votre réponse", guessSend: "Vérifier", guessNo: "Pas tout à fait — réessayez", guessYes: "Bravo, c’est ça !", theirGuesses: "Propositions de {name}", round: "Manche {n} sur {total}", next: "Manche suivante", timeLeft: "Encore {s} s", got: "Deviné" }
  };

  TABLE.register({
    id: "explain", icon: "🗣️", order: 30,
    text: {
      ru: {
        ...GUESS_TEXT.ru, title: "Объясни слово", short: "Объясняйте, не называя слово",
        explainerMe: "Вы объясняете", explainerFriend: "Объясняет {name}, вы угадываете",
        readyMe: "Нажмите «Старт», когда будете готовы. На раунд — 60 секунд.", readyFriend: "{name} вот-вот начнёт раунд. Приготовьтесь угадывать!",
        start: "Старт", yourWord: "Ваше слово", rule: "Объясняйте вслух, не называя само слово и однокоренные.",
        skip: "Пропустить", listen: "Слушайте и угадывайте вслух — или напишите ответ.",
        score: "Вместе угадано: {n}", afterTitle: "Раунд окончен", afterWords: "Слова раунда", noWords: "В этом раунде слов не было",
        doneTitle: "Игра окончена!", doneScore: "Вместе вы угадали слов: {n}", gotMark: "угадано", skipMark: "пропущено"
      },
      en: {
        ...GUESS_TEXT.en, title: "Explain the word", short: "Explain it without saying it",
        explainerMe: "You explain", explainerFriend: "{name} explains, you guess",
        readyMe: "Tap “Start” when you’re ready. The round lasts 60 seconds.", readyFriend: "{name} is about to start the round. Get ready to guess!",
        start: "Start", yourWord: "Your word", rule: "Explain out loud without saying the word or words from the same root.",
        skip: "Skip", listen: "Listen and guess out loud — or type your answer.",
        score: "Guessed together: {n}", afterTitle: "Round over", afterWords: "Words this round", noWords: "No words this round",
        doneTitle: "Game over!", doneScore: "Words you guessed together: {n}", gotMark: "guessed", skipMark: "skipped"
      },
      fr: {
        ...GUESS_TEXT.fr, title: "Expliquez le mot", short: "Expliquez sans dire le mot",
        explainerMe: "Vous expliquez", explainerFriend: "{name} explique, vous devinez",
        readyMe: "Touchez « C’est parti » pour commencer. La manche dure 60 secondes.", readyFriend: "{name} va lancer la manche. Préparez-vous à deviner !",
        start: "C’est parti", yourWord: "Votre mot", rule: "Expliquez à voix haute sans dire le mot ni ses dérivés.",
        skip: "Passer", listen: "Écoutez et devinez à voix haute — ou écrivez votre réponse.",
        score: "Devinés ensemble : {n}", afterTitle: "Manche terminée", afterWords: "Mots de la manche", noWords: "Aucun mot dans cette manche",
        doneTitle: "Partie terminée !", doneScore: "Mots devinés ensemble : {n}", gotMark: "deviné", skipMark: "passé"
      }
    },
    mount: mountExplain
  });

  TABLE.register({
    id: "sketch", icon: "🎨", order: 40,
    text: {
      ru: {
        ...GUESS_TEXT.ru, title: "Угадай рисунок", short: "Один рисует, другой угадывает",
        drawerMe: "Вы рисуете", drawerFriend: "Рисует {name}, вы угадываете",
        choose: "Выберите слово для рисунка", chooseFriend: "{name} выбирает слово…", drawWord: "Рисуйте: {word}",
        noLetters: "Без букв и цифр на рисунке. На рисунок — 80 секунд.", letters: "Букв: {n}",
        guessTip: "Угадывайте вслух или напишите ответ. Чем быстрее, тем больше очков.",
        colors: "Цвет", colorNames: "Чёрный, Красный, Розовый, Оранжевый, Жёлтый, Зелёный, Синий, Фиолетовый",
        thin: "Тонкая линия", thick: "Толстая линия", eraser: "Ластик", undo: "Отменить", clear: "Очистить",
        canvasLabel: "Холст для рисунка", afterGuessed: "Угадано! +{n}", afterMissed: "Время вышло — не угадано", wordWas: "Слово: {word}",
        score: "Очки вдвоём: {n}", doneTitle: "Игра окончена!", doneScore: "Вместе вы набрали очков: {n}"
      },
      en: {
        ...GUESS_TEXT.en, title: "Guess the drawing", short: "One draws, the other guesses",
        drawerMe: "You draw", drawerFriend: "{name} draws, you guess",
        choose: "Pick a word to draw", chooseFriend: "{name} is picking a word…", drawWord: "Draw: {word}",
        noLetters: "No letters or numbers in the drawing. You have 80 seconds.", letters: "Letters: {n}",
        guessTip: "Guess out loud or type your answer. The faster, the more points.",
        colors: "Colour", colorNames: "Black, Red, Pink, Orange, Yellow, Green, Blue, Purple",
        thin: "Thin line", thick: "Thick line", eraser: "Eraser", undo: "Undo", clear: "Clear",
        canvasLabel: "Drawing canvas", afterGuessed: "Guessed! +{n}", afterMissed: "Time’s up — not guessed", wordWas: "The word: {word}",
        score: "Points together: {n}", doneTitle: "Game over!", doneScore: "Points you scored together: {n}"
      },
      fr: {
        ...GUESS_TEXT.fr, title: "Devinez le dessin", short: "L’un dessine, l’autre devine",
        drawerMe: "Vous dessinez", drawerFriend: "{name} dessine, vous devinez",
        choose: "Choisissez un mot à dessiner", chooseFriend: "{name} choisit un mot…", drawWord: "Dessinez : {word}",
        noLetters: "Pas de lettres ni de chiffres dans le dessin. Vous avez 80 secondes.", letters: "Lettres : {n}",
        guessTip: "Devinez à voix haute ou écrivez votre réponse. Plus c’est rapide, plus il y a de points.",
        colors: "Couleur", colorNames: "Noir, Rouge, Rose, Orange, Jaune, Vert, Bleu, Violet",
        thin: "Trait fin", thick: "Trait épais", eraser: "Gomme", undo: "Annuler", clear: "Effacer",
        canvasLabel: "Zone de dessin", afterGuessed: "Deviné ! +{n}", afterMissed: "Temps écoulé — pas deviné", wordWas: "Le mot : {word}",
        score: "Points ensemble : {n}", doneTitle: "Partie terminée !", doneScore: "Points marqués ensemble : {n}"
      }
    },
    mount: mountSketch
  });

  TABLE.register({
    id: "talk", icon: "💬", order: 60,
    text: {
      ru: {
        title: "О чём поговорить", short: "Карточки, когда разговор затих",
        next: "Следующая", finish: "Завершить", card: "Карточка {n} из {total}", firstMe: "Начинаете вы", firstFriend: "Начинает {name}",
        cat_childhood: "Детство", cat_travel: "Путешествия", cat_food: "Еда", cat_dreams: "Мечты", cat_whatif: "Если бы…", cat_funny: "Смешное",
        noCall: "Без звонка можно отвечать в переписке.", doneTitle: "{n} тем позади!", doneNote: "Хотите ещё — нажмите «{again}»."
      },
      en: {
        title: "Something to talk about", short: "Cards for when the chat goes quiet",
        next: "Next card", finish: "Finish", card: "Card {n} of {total}", firstMe: "You answer first", firstFriend: "{name} answers first",
        cat_childhood: "Childhood", cat_travel: "Travel", cat_food: "Food", cat_dreams: "Dreams", cat_whatif: "What if…", cat_funny: "Funny",
        noCall: "No call? Answer in your chat.", doneTitle: "{n} topics done!", doneNote: "Want more? Tap “{again}”."
      },
      fr: {
        title: "De quoi parler", short: "Des cartes pour relancer la discussion",
        next: "Suivante", finish: "Terminer", card: "Carte {n} sur {total}", firstMe: "Vous répondez en premier", firstFriend: "{name} répond en premier",
        cat_childhood: "Enfance", cat_travel: "Voyages", cat_food: "Cuisine", cat_dreams: "Rêves", cat_whatif: "Et si…", cat_funny: "Pour rire",
        noCall: "Pas d’appel ? Répondez dans la discussion.", doneTitle: "{n} sujets abordés !", doneNote: "Encore ? Touchez « {again} »."
      }
    },
    mount: mountTalk
  });
})();
