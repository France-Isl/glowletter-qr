/*
  «Игровой стол» (2.4.26): три настольные игры вдвоём в реальном времени —
  «Морской бой» (лодки с мишками), «Четыре в ряд» и «Шашки» (русские правила).

  Каждая игра регистрируется через GlowLetterTable.register (см. table.js).
  Правила — чистые функции в начале файла: оба игрока считают одно и то же
  по общему списку ходов, а каждый пришедший ход проверяется своим движком
  (неправильный просто игнорируется). В «Морском бое» флот каждого хранится
  только у него самого: стреляющий шлёт клетку, защищающийся отвечает итогом.

  Связь бывает неровной (друг на минуту пропал, сообщение потерялось), поэтому:
  ход несёт свой номер n; кто отстал, просит «hello» и получает весь список;
  когда друг возвращается за стол, игра сама досылает то, что могло пропасть.
*/
(() => {
  "use strict";

  const isInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const isObj = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const samePrefix = (list, prefix) => prefix.every((item, index) => JSON.stringify(list[index]) === JSON.stringify(item));

  // ——— «Морской бой»: правила ———

  const SEA = 8;
  const LETTERS = "ABCDEFGH";
  const FLEET = Object.freeze([4, 3, 3, 2, 2, 2, 1, 1, 1, 1]);
  const seaName = index => `${LETTERS[index % SEA]}${Math.floor(index / SEA) + 1}`;

  // Клетка и все восемь соседей (внутри поля).
  function seaNeighbors(index) {
    const x = index % SEA;
    const y = Math.floor(index / SEA);
    const out = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < SEA && ny >= 0 && ny < SEA) out.push(ny * SEA + nx);
      }
    }
    return out;
  }

  // Случайная расстановка: лодки не касаются друг друга даже углами.
  function seaPlace(random = Math.random) {
    for (let attempt = 0; attempt < 2000; attempt += 1) {
      const blocked = new Set();
      const boats = [];
      for (const size of FLEET) {
        let placed = null;
        for (let tries = 0; tries < 60 && !placed; tries += 1) {
          const horizontal = random() < 0.5;
          const x = Math.floor(random() * (horizontal ? SEA - size + 1 : SEA));
          const y = Math.floor(random() * (horizontal ? SEA : SEA - size + 1));
          const cells = Array.from({ length: size }, (_, step) => (horizontal ? y * SEA + x + step : (y + step) * SEA + x));
          if (cells.every(cell => !blocked.has(cell))) placed = cells;
        }
        if (!placed) break;
        boats.push(placed);
        placed.forEach(cell => seaNeighbors(cell).forEach(near => blocked.add(near)));
      }
      if (boats.length === FLEET.length) return boats;
    }
    return null;
  }

  // Одна лодка: прямая непрерывная линия из 1–4 клеток.
  function seaLine(cells) {
    if (!Array.isArray(cells) || cells.length < 1 || cells.length > 4 || !cells.every(cell => isInt(cell, 0, SEA * SEA - 1))) return false;
    const sorted = [...cells].sort((left, right) => left - right);
    if (new Set(sorted).size !== sorted.length) return false;
    const sameRow = sorted.every(cell => Math.floor(cell / SEA) === Math.floor(sorted[0] / SEA));
    const step = sameRow ? 1 : SEA;
    return sorted.every((cell, index) => cell === sorted[0] + index * step);
  }

  // Весь флот: нужные размеры, прямые лодки, никто ни с кем не соприкасается.
  function seaValid(boats) {
    if (!Array.isArray(boats) || boats.length !== FLEET.length || !boats.every(seaLine)) return false;
    const sizes = boats.map(boat => boat.length).sort((left, right) => right - left);
    if (sizes.join() !== FLEET.join()) return false;
    for (let one = 0; one < boats.length; one += 1) {
      const zone = new Set(boats[one].flatMap(seaNeighbors));
      for (let two = one + 1; two < boats.length; two += 1) {
        if (boats[two].some(cell => zone.has(cell))) return false;
      }
    }
    return true;
  }

  // Выстрел по своему флоту: received — уже принятые выстрелы (Set или Map).
  function seaShoot(boats, received, index) {
    const has = cell => cell === index || received.has(cell);
    const boat = boats.find(item => item.includes(index));
    if (!boat) return { hit: false, sunk: false, cells: [], all: false };
    const sunk = boat.every(has);
    return { hit: true, sunk, cells: sunk ? [...boat] : [], all: boats.every(item => item.every(has)) };
  }

  // Клетки вокруг найденной лодки — там точно пусто.
  const seaAround = cells => [...new Set(cells.flatMap(seaNeighbors))].filter(cell => !cells.includes(cell));

  // ——— «Четыре в ряд»: правила ———

  const FOUR_W = 7;
  const FOUR_H = 6;
  const FOUR_DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

  // Линия из четырёх и больше через фишку (c, r); r считается снизу.
  function fourLine(grid, column, row) {
    const player = grid[column][row];
    for (const [dc, dr] of FOUR_DIRS) {
      const cells = [[column, row]];
      for (const sign of [1, -1]) {
        let c = column + dc * sign;
        let r = row + dr * sign;
        while (c >= 0 && c < FOUR_W && r >= 0 && r < FOUR_H && grid[c][r] === player) {
          cells.push([c, r]);
          c += dc * sign;
          r += dr * sign;
        }
      }
      if (cells.length >= 4) return cells;
    }
    return null;
  }

  // Партия целиком из списка столбцов. Игрок 0 — тот, кто ходит первым.
  function fourPlay(moves) {
    if (!Array.isArray(moves) || moves.length > FOUR_W * FOUR_H) return { valid: false };
    const grid = Array.from({ length: FOUR_W }, () => []);
    let winner = -1;
    let line = [];
    for (let index = 0; index < moves.length; index += 1) {
      const column = moves[index];
      if (winner >= 0 || !isInt(column, 0, FOUR_W - 1) || grid[column].length >= FOUR_H) return { valid: false };
      grid[column].push(index % 2);
      const found = fourLine(grid, column, grid[column].length - 1);
      if (found) { winner = index % 2; line = found; }
    }
    const draw = winner < 0 && moves.length === FOUR_W * FOUR_H;
    return { valid: true, grid, winner, line, draw, over: winner >= 0 || draw, next: moves.length % 2 };
  }

  // ——— «Шашки»: русские правила ———
  // Клетка = r * 8 + c, r = 0 сверху (сторона чёрных). Белые (1) ходят вверх.
  // Значения: 0 пусто, 1 белая, 2 белая дамка, -1 чёрная, -2 чёрная дамка.

  const CK_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const ckInside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const ckName = square => `${"abcdefgh"[square % 8]}${8 - Math.floor(square / 8)}`;

  function ckInitial() {
    const board = new Array(64).fill(0);
    for (let square = 0; square < 64; square += 1) {
      const r = Math.floor(square / 8);
      if ((r + (square % 8)) % 2 !== 1) continue;
      if (r <= 2) board[square] = -1;
      else if (r >= 5) board[square] = 1;
    }
    return board;
  }

  // Все цепочки взятия для шашки на from. Побитые шашки снимаются только после
  // хода (турецкий удар запрещён: через одну шашку дважды не бьют, и она мешает).
  function ckCaptures(board, from) {
    const piece = board[from];
    const color = Math.sign(piece);
    const promoteRow = color > 0 ? 0 : 7;
    const work = board.slice();
    work[from] = 0;
    const out = [];
    const steps = (pos, king, taken) => {
      const list = [];
      for (const [dr, dc] of CK_DIRS) {
        let r = Math.floor(pos / 8) + dr;
        let c = (pos % 8) + dc;
        if (king) while (ckInside(r, c) && work[r * 8 + c] === 0) { r += dr; c += dc; }
        if (!ckInside(r, c)) continue;
        const victim = r * 8 + c;
        if (Math.sign(work[victim]) !== -color || taken.includes(victim)) continue;
        const lands = [];
        let lr = r + dr;
        let lc = c + dc;
        while (ckInside(lr, lc) && work[lr * 8 + lc] === 0) {
          lands.push(lr * 8 + lc);
          if (!king) break;
          lr += dr;
          lc += dc;
        }
        if (lands.length) list.push({ victim, lands });
      }
      return list;
    };
    const walk = (pos, king, taken, path) => {
      const list = steps(pos, king, taken);
      if (!list.length) {
        if (taken.length) out.push({ path, captured: taken, king });
        return;
      }
      for (const { victim, lands } of list) {
        const nextTaken = [...taken, victim];
        let options = lands.map(land => ({ land, king: king || Math.floor(land / 8) === promoteRow }));
        // Дамка обязана встать туда, откуда бой продолжается, если такое поле есть.
        if (options.length > 1) {
          const going = options.filter(option => steps(option.land, option.king, nextTaken).length > 0);
          if (going.length) options = going;
        }
        for (const option of options) walk(option.land, option.king, nextTaken, [...path, option.land]);
      }
    };
    walk(from, Math.abs(piece) === 2, [], [from]);
    return out;
  }

  // Все разрешённые ходы цвета: если можно бить — только взятия (бить обязательно).
  function ckMoves(board, color) {
    const captures = [];
    const quiet = [];
    for (let from = 0; from < 64; from += 1) {
      if (Math.sign(board[from]) !== color) continue;
      captures.push(...ckCaptures(board, from));
      if (captures.length) continue;
      const king = Math.abs(board[from]) === 2;
      for (const [dr, dc] of CK_DIRS) {
        if (!king && dr !== -color) continue;
        let r = Math.floor(from / 8) + dr;
        let c = (from % 8) + dc;
        while (ckInside(r, c) && board[r * 8 + c] === 0) {
          const to = r * 8 + c;
          quiet.push({ path: [from, to], captured: [], king: king || r === (color > 0 ? 0 : 7) });
          if (!king) break;
          r += dr;
          c += dc;
        }
      }
    }
    return captures.length ? captures : quiet;
  }

  function ckApply(board, move) {
    const next = board.slice();
    const color = Math.sign(board[move.path[0]]);
    next[move.path[0]] = 0;
    move.captured.forEach(square => { next[square] = 0; });
    next[move.path[move.path.length - 1]] = color * (move.king ? 2 : 1);
    return next;
  }

  const ckPathOk = path => Array.isArray(path) && path.length >= 2 && path.length <= 14 && path.every(square => isInt(square, 0, 63));

  function ckFind(board, color, path) {
    if (!ckPathOk(path)) return null;
    return ckMoves(board, color).find(move => move.path.length === path.length && move.path.every((square, index) => square === path[index])) || null;
  }

  function ckStep(game, move) {
    const board = ckApply(game.board, move);
    const color = -game.color;
    const moves = ckMoves(board, color);
    return { valid: true, board, color, moves, loser: moves.length ? 0 : color };
  }

  // Партия из списка путей; первый ход — за белыми.
  function ckReplay(paths) {
    const board = ckInitial();
    let game = { valid: true, board, color: 1, moves: ckMoves(board, 1), loser: 0 };
    if (!Array.isArray(paths) || paths.length > 400) return { valid: false };
    for (const path of paths) {
      if (game.loser) return { valid: false };
      const move = ckFind(game.board, game.color, path);
      if (!move) return { valid: false };
      game = ckStep(game, move);
    }
    return game;
  }

  if (window.__GLOWLETTER_TEST__) {
    window.GlowLetterTableBoardTest = Object.freeze({
      SEA, FLEET, seaNeighbors, seaPlace, seaLine, seaValid, seaShoot, seaAround, seaName,
      FOUR_W, FOUR_H, fourPlay, fourLine,
      ckInitial, ckCaptures, ckMoves, ckApply, ckFind, ckReplay, ckName
    });
  }

  if (!window.GlowLetterTable) return;

  // ——— Общие помощники интерфейса ———

  const nameOf = api => api.friend?.name || api.t("someone");

  function turnLine(api, mine, mover) {
    if (!api.partnerHere()) return api.tt("away", { name: nameOf(api) });
    return mine ? api.tt("yourTurn") : api.tt("friendTurn", { name: mover || nameOf(api) });
  }

  // Зритель (за столом больше двух): видит доску и ходы обоих, сам не ходит.
  // Игрок с индексом 0 в api.players ходит первым.
  const playerName = (api, index) => api.players?.[index]?.name || api.t("someone");

  // Друг ушёл или вернулся: у стола нет события, поэтому смотрим раз в секунду.
  function watchPartner(api, onChange) {
    let here = api.partnerHere();
    const timer = setInterval(() => {
      const now = api.partnerHere();
      if (now === here) return;
      here = now;
      onChange(now);
    }, 900);
    return () => clearInterval(timer);
  }

  // Роуминг по клеткам: одна клетка в Tab, остальные — стрелками.
  function roving(container, cells, move) {
    const set = pos => {
      if (!cells[pos]) return;
      cells.forEach((cell, index) => { if (cell) cell.tabIndex = index === pos ? 0 : -1; });
    };
    set(cells.findIndex(Boolean));
    const onKey = event => {
      const cell = event.target.closest?.("[data-pos]");
      if (!cell || !container.contains(cell)) return;
      const next = move(Number(cell.dataset.pos), event.key);
      if (next < 0) return;
      event.preventDefault();
      if (!cells[next]) return;
      set(next);
      cells[next].focus();
    };
    const onFocus = event => {
      const cell = event.target.closest?.("[data-pos]");
      if (cell && container.contains(cell)) set(Number(cell.dataset.pos));
    };
    container.addEventListener("keydown", onKey);
    container.addEventListener("focusin", onFocus);
    return () => {
      container.removeEventListener("keydown", onKey);
      container.removeEventListener("focusin", onFocus);
    };
  }

  function gridMove(cols, rows) {
    return (pos, key) => {
      let x = pos % cols;
      let y = Math.floor(pos / cols);
      if (key === "ArrowLeft") x -= 1;
      else if (key === "ArrowRight") x += 1;
      else if (key === "ArrowUp") y -= 1;
      else if (key === "ArrowDown") y += 1;
      else if (key === "Home") x = 0;
      else if (key === "End") x = cols - 1;
      else return -1;
      x = Math.max(0, Math.min(cols - 1, x));
      y = Math.max(0, Math.min(rows - 1, y));
      return y * cols + x;
    };
  }

  // ——— «Морской бой» ———

  function mountSea(el, api) {
    const { t, escapeHtml: esc } = api;
    const stops = [];
    let phase = "place";
    let boats = seaPlace();
    let ready = false;
    let peerReady = false;
    let myTurn = false;
    let pending = -1;
    let finished = false;
    let iLost = false;
    const received = new Map();
    const shots = new Map();
    const reveal = new Set();

    el.innerHTML = `
      <div class="gltb gltb-sea">
        <p class="gltb-turn" aria-live="polite"></p>
        <div class="gltb-sea-boards">
          <section class="gltb-sea-side gltb-sea-enemy" hidden>
            <h3 class="gltb-sea-title">${esc(t("enemySea", { name: nameOf(api) }))}</h3>
            <div class="gltb-sea-grid" role="group" aria-label="${esc(t("enemySea", { name: nameOf(api) }))}">
              ${Array.from({ length: 64 }, (_, index) => `<button class="gltb-sea-cell" type="button" data-pos="${index}"></button>`).join("")}
            </div>
            <p class="gltb-sea-count" data-count="enemy"></p>
          </section>
          <section class="gltb-sea-side gltb-sea-mine is-big">
            <h3 class="gltb-sea-title">${esc(t("mySea"))}</h3>
            <div class="gltb-sea-grid" role="img">
              ${Array.from({ length: 64 }, () => '<span class="gltb-sea-cell"></span>').join("")}
            </div>
            <p class="gltb-sea-count" data-count="mine"></p>
          </section>
        </div>
        <div class="gltb-actions">
          <button class="glg-secondary" type="button" data-sea="shuffle">${esc(t("shuffle"))}</button>
          <button class="glg-primary" type="button" data-sea="ready">${esc(t("ready"))}</button>
        </div>
      </div>`;

    const root = el.querySelector(".gltb-sea");
    const turnNode = root.querySelector(".gltb-turn");
    const enemySide = root.querySelector(".gltb-sea-enemy");
    const mineSide = root.querySelector(".gltb-sea-mine");
    const enemyGrid = enemySide.querySelector(".gltb-sea-grid");
    const mineGrid = mineSide.querySelector(".gltb-sea-grid");
    const enemyCells = [...enemyGrid.children];
    const mineCells = [...mineGrid.children];
    const actions = root.querySelector(".gltb-actions");
    const shuffleButton = actions.querySelector("[data-sea=shuffle]");
    const readyButton = actions.querySelector("[data-sea=ready]");

    const finishOnce = result => {
      if (finished) return;
      finished = true;
      api.finish(result);
    };
    const canShoot = () => phase === "battle" && myTurn && pending < 0 && !finished && api.partnerHere();
    const sunkBoat = boat => boat.every(cell => received.has(cell));
    const enemySunk = () => {
      let count = 0;
      // Каждая найденная лодка помечена «sunk»; считаем по отдельным лодкам через соседство.
      const seen = new Set();
      for (const [cell, mark] of shots) {
        if (mark !== "sunk" || seen.has(cell)) continue;
        count += 1;
        const stack = [cell];
        while (stack.length) {
          const next = stack.pop();
          if (seen.has(next)) continue;
          seen.add(next);
          for (const near of [next - 1, next + 1, next - SEA, next + SEA]) {
            if (near < 0 || near >= 64 || shots.get(near) !== "sunk") continue;
            if (Math.abs((near % SEA) - (next % SEA)) > 1) continue;
            stack.push(near);
          }
        }
      }
      return count;
    };

    // Форма лодки: закруглённые нос и корма.
    function boatShape(boat, cell) {
      if (boat.length === 1) return "is-solo";
      const horizontal = boat[1] - boat[0] === 1;
      const index = boat.indexOf(cell);
      const edge = index === 0 ? "start" : index === boat.length - 1 ? "end" : "mid";
      return `is-${horizontal ? "h" : "v"}-${edge}`;
    }

    function render() {
      const battle = phase !== "place";
      enemySide.hidden = !battle;
      mineSide.classList.toggle("is-big", !battle);
      actions.hidden = battle;
      shuffleButton.disabled = ready;
      readyButton.disabled = ready;
      readyButton.textContent = ready ? t("readyDone") : t("ready");

      if (!api.partnerHere() && phase !== "over") turnNode.textContent = api.tt("away", { name: nameOf(api) });
      else if (phase === "place") turnNode.textContent = ready ? t("waitReady", { name: nameOf(api) }) : t("placeHint");
      else if (phase === "battle") turnNode.textContent = turnLine(api, myTurn);
      else turnNode.textContent = iLost ? api.tt("loss", { name: nameOf(api) }) : api.tt("win");
      turnNode.classList.toggle("is-mine", phase === "battle" && myTurn && api.partnerHere());

      // Своё море: лодки с мишками, попадания и промахи друга.
      let alive = 0;
      boats.forEach(boat => { if (!sunkBoat(boat)) alive += 1; });
      mineCells.forEach((cell, index) => {
        const boat = boats.find(item => item.includes(index));
        const shot = received.has(index);
        const sunk = boat ? sunkBoat(boat) : false;
        cell.className = `gltb-sea-cell${boat ? ` is-boat ${boatShape(boat, index)}` : ""}${shot ? (boat ? " is-hit" : " is-miss") : ""}${sunk ? " is-sunk" : ""}`;
        cell.textContent = boat ? (sunk ? "🛟" : "🧸") : "";
      });
      mineGrid.setAttribute("aria-label", t("myBoard", { n: alive, total: FLEET.length }));
      mineSide.querySelector("[data-count=mine]").textContent = battle ? t("boatsLeft", { n: alive }) : t("fleetNote");

      // Чужое море: только то, что известно по ответам.
      const open = canShoot();
      enemyCells.forEach((cell, index) => {
        const mark = shots.get(index) || (pending === index ? "wait" : reveal.has(index) ? "reveal" : "");
        cell.className = `gltb-sea-cell${mark ? ` is-${mark}` : ""}`;
        cell.textContent = { hit: "✸", sunk: "🛟", reveal: "🧸" }[mark] || "";
        const state = { hit: t("cellHit"), sunk: t("cellSunk"), miss: t("cellMiss"), near: t("cellNear"), wait: t("cellWait"), reveal: t("cellReveal") }[mark] || t("cellUnknown");
        cell.setAttribute("aria-label", `${seaName(index)}, ${state}`);
        cell.setAttribute("aria-disabled", String(!open || shots.has(index) || pending === index));
      });
      enemySide.querySelector("[data-count=enemy]").textContent = t("boatsLeft", { n: FLEET.length - enemySunk() });
    }

    function resetPlace() {
      phase = "place";
      boats = seaPlace();
      ready = false;
      peerReady = false;
      myTurn = false;
      pending = -1;
      received.clear();
      shots.clear();
      reveal.clear();
    }

    function maybeStart() {
      if (phase !== "place" || !ready || !peerReady) return;
      phase = "battle";
      myTurn = api.iStart;
      api.toast(t("battleStart"));
    }

    function shoot(index) {
      if (!canShoot() || shots.has(index)) return;
      pending = index;
      api.send("shot", { i: index });
      render();
    }

    function answer(index) {
      const result = seaShoot(boats, received, index);
      api.send("res", { i: index, hit: result.hit, sunk: result.sunk, cells: result.cells });
      return result;
    }

    function onShot(data) {
      if (!isObj(data) || !isInt(data.i, 0, 63)) return;
      // Выстрел пришёл, а «Готово» друга потерялось — значит, друг уже готов.
      if (phase === "place" && ready) { peerReady = true; maybeStart(); }
      if (phase !== "battle" && !(phase === "over" && iLost)) return;
      if (received.has(data.i)) { answer(data.i); return; } // повтор: ответ потерялся
      if (phase !== "battle" || myTurn) return;
      const result = answer(data.i);
      received.set(data.i, result.hit);
      if (!result.hit) myTurn = true;
      else api.toast(result.sunk ? t("lostBoat", { name: nameOf(api) }) : t("gotHit", { name: nameOf(api) }));
      if (result.all) {
        phase = "over";
        iLost = true;
        api.send("lost", {});
        finishOnce("loss");
      }
      render();
    }

    function onResult(data) {
      if (!isObj(data) || phase !== "battle" || pending < 0 || data.i !== pending) return;
      if (typeof data.hit !== "boolean" || typeof data.sunk !== "boolean") return;
      if (data.sunk && (!data.hit || !seaLine(data.cells) || !data.cells.includes(data.i))) return;
      shots.set(data.i, data.hit ? "hit" : "miss");
      if (data.sunk) {
        data.cells.forEach(cell => shots.set(cell, "sunk"));
        seaAround(data.cells).forEach(cell => { if (!shots.has(cell)) shots.set(cell, "near"); });
        api.toast(t("sunkToast"));
      } else if (data.hit) api.toast(t("hitToast"));
      if (!data.hit) myTurn = false;
      pending = -1;
      render();
    }

    function onLost() {
      if (phase === "over" && !iLost) { api.send("reveal", { b: boats }); return; }
      if (phase !== "battle") return;
      phase = "over";
      pending = -1;
      finishOnce("win");
      api.send("reveal", { b: boats });
      render();
    }

    function onReveal(data) {
      if (!isObj(data) || phase !== "over" || !iLost || !seaValid(data.b)) return;
      data.b.flat().forEach(cell => { if (!shots.has(cell)) reveal.add(cell); });
      render();
    }

    function onClick(event) {
      const action = event.target.closest("[data-sea]")?.dataset.sea;
      if (action === "shuffle" && phase === "place" && !ready) {
        boats = seaPlace();
        render();
        return;
      }
      if (action === "ready" && phase === "place" && !ready) {
        ready = true;
        api.send("ready", {});
        maybeStart();
        render();
        return;
      }
      const cell = event.target.closest(".gltb-sea-enemy [data-pos]");
      if (cell) shoot(Number(cell.dataset.pos));
    }

    root.addEventListener("click", onClick);
    stops.push(() => root.removeEventListener("click", onClick));
    stops.push(roving(enemyGrid, enemyCells, gridMove(SEA, SEA)));
    stops.push(watchPartner(api, here => {
      // Друг вернулся — досылаем то, что могло потеряться.
      if (here) {
        if (phase === "place" && ready) api.send("ready", {});
        else if (phase === "battle" && pending >= 0) api.send("shot", { i: pending });
        else if (phase === "over" && iLost) api.send("lost", {});
      }
      render();
    }));
    render();

    return {
      onMessage(type, data) {
        if (type === "ready") {
          if (phase !== "place") return;
          peerReady = true;
          if (ready) api.send("ready", {});
          maybeStart();
          render();
        } else if (type === "shot") onShot(data);
        else if (type === "res") onResult(data);
        else if (type === "lost") onLost();
        else if (type === "reveal") onReveal(data);
        else if (type === "reset") {
          // Друг перезагрузил игру и потерял свой флот.
          if (phase === "battle") { resetPlace(); api.toast(t("restarted")); }
          else if (phase === "place") peerReady = false;
          render();
        }
      },
      // Флот — тайна, поэтому в снимке только этап, готовность и итог.
      snapshot() {
        return { phase, ready, loser: phase === "over" ? (iLost ? api.me : api.friend.id) : null };
      },
      restore(data) {
        if (!isObj(data)) return;
        if (data.phase === "over" && (data.loser === api.me || data.loser === api.friend.id)) {
          phase = "over";
          iLost = data.loser === api.me;
          finishOnce(iLost ? "loss" : "win");
        } else if (data.phase === "place" || data.phase === "battle") {
          resetPlace();
          peerReady = data.phase === "place" && data.ready === true;
          api.send("reset", {});
          if (data.phase === "battle") api.toast(t("restarted"));
        }
        render();
      },
      destroy() {
        stops.splice(0).forEach(stop => stop());
      }
    };
  }

  // ——— «Четыре в ряд» ———

  function mountFour(el, api) {
    const { t, escapeHtml: esc } = api;
    const watch = Boolean(api.spectator);
    const mine = watch ? -1 : api.iStart ? 0 : 1;
    const colour = player => (player === 0 ? "gold" : "wine");
    const stops = [];
    let moves = [];
    let state = fourPlay(moves);
    let finished = false;
    let dropColumn = -1;

    el.innerHTML = `
      <div class="gltb gltb-four">
        <p class="gltb-turn" aria-live="polite"></p>
        <p class="gltb-legend">${watch ? esc(api.tt("watching")) : `<span class="gltb-disc gltb-disc-${colour(mine)}" aria-hidden="true"></span>${esc(t(mine === 0 ? "youGold" : "youWine"))}`}</p>
        <div class="gltb-four-board" role="group" aria-label="${esc(t("board"))}">
          ${Array.from({ length: FOUR_W }, (_, column) => `
            <button class="gltb-four-col" type="button" data-pos="${column}">
              ${Array.from({ length: FOUR_H }, (_, row) => `<span class="gltb-four-cell" data-row="${FOUR_H - 1 - row}"></span>`).join("")}
            </button>`).join("")}
        </div>
      </div>`;

    const root = el.querySelector(".gltb-four");
    const turnNode = root.querySelector(".gltb-turn");
    const board = root.querySelector(".gltb-four-board");
    const columns = [...board.querySelectorAll(".gltb-four-col")];

    const finishOnce = result => {
      if (finished) return;
      finished = true;
      api.finish(result);
    };
    const canPlay = () => !finished && !state.over && state.next === mine && api.partnerHere();

    function render() {
      if (state.over) turnNode.textContent = state.draw ? api.tt("draw") : state.winner === mine ? api.tt("win") : api.tt("loss", { name: watch ? playerName(api, state.winner) : nameOf(api) });
      else turnNode.textContent = turnLine(api, state.next === mine, watch ? playerName(api, state.next) : "");
      turnNode.classList.toggle("is-mine", canPlay());
      const win = new Set(state.line.map(([c, r]) => `${c}:${r}`));
      const open = canPlay();
      columns.forEach((button, column) => {
        const stack = state.grid[column];
        [...button.children].forEach(cell => {
          const row = Number(cell.dataset.row);
          const player = stack[row];
          if (player === undefined) { cell.innerHTML = ""; return; }
          const drop = column === dropColumn && row === stack.length - 1 && !reduced();
          const winning = win.has(`${column}:${row}`);
          const key = `${player}${winning ? "w" : ""}`;
          if (cell.dataset.key === key && !drop) return;
          cell.dataset.key = key;
          cell.innerHTML = `<span class="gltb-disc gltb-disc-${colour(player)}${winning ? " is-win" : ""}${drop ? " is-drop" : ""}" style="--gltb-fall:${FOUR_H - row}"></span>`;
        });
        [...button.children].forEach(cell => { if (stack[Number(cell.dataset.row)] === undefined) delete cell.dataset.key; });
        const free = FOUR_H - stack.length;
        button.setAttribute("aria-label", `${t("column", { n: column + 1 })}: ${free ? t("free", { n: free }) : t("full")}`);
        button.setAttribute("aria-disabled", String(!open || !free));
      });
      dropColumn = -1;
    }

    function adopt(list) {
      const next = fourPlay(list);
      if (!next.valid) return false;
      moves = list.slice();
      state = next;
      return true;
    }

    function checkEnd() {
      if (watch && (state.winner >= 0 || state.draw)) finishOnce("done");
      else if (state.winner >= 0) finishOnce(state.winner === mine ? "win" : "loss");
      else if (state.draw) finishOnce("draw");
    }

    function play(column) {
      if (!canPlay() || state.grid[column].length >= FOUR_H) return;
      adopt([...moves, column]);
      dropColumn = column;
      api.send("move", { n: moves.length - 1, c: column });
      render();
      checkEnd();
    }

    const validList = list => Array.isArray(list) && list.length <= FOUR_W * FOUR_H && list.every(column => isInt(column, 0, FOUR_W - 1));

    const onClick = event => {
      const button = event.target.closest(".gltb-four-col");
      if (button) play(Number(button.dataset.pos));
    };
    board.addEventListener("click", onClick);
    stops.push(() => board.removeEventListener("click", onClick));
    stops.push(roving(board, columns, (pos, key) => {
      if (key === "ArrowLeft" || key === "ArrowUp") return Math.max(0, pos - 1);
      if (key === "ArrowRight" || key === "ArrowDown") return Math.min(FOUR_W - 1, pos + 1);
      if (key === "Home") return 0;
      if (key === "End") return FOUR_W - 1;
      return -1;
    }));
    stops.push(watchPartner(api, here => {
      if (here) api.send("hello", { n: moves.length });
      render();
    }));
    render();

    return {
      onMessage(type, data) {
        if (!isObj(data)) return;
        if (type === "move") {
          if (!isInt(data.n, 0, FOUR_W * FOUR_H - 1) || !isInt(data.c, 0, FOUR_W - 1)) return;
          if (data.n > moves.length) { api.send("hello", { n: moves.length }); return; }
          if (data.n !== moves.length || state.over || state.next === mine || state.grid[data.c].length >= FOUR_H) return;
          adopt([...moves, data.c]);
          dropColumn = data.c;
          render();
          checkEnd();
        } else if (type === "hello") {
          if (!isInt(data.n, 0, FOUR_W * FOUR_H)) return;
          if (data.n < moves.length) api.send("moves", { list: moves });
          else if (data.n > moves.length) api.send("hello", { n: moves.length });
        } else if (type === "moves") {
          if (!validList(data.list) || data.list.length <= moves.length || !samePrefix(data.list, moves)) return;
          if (adopt(data.list)) { render(); checkEnd(); }
        }
      },
      snapshot() {
        return { moves: moves.slice() };
      },
      restore(data) {
        if (!isObj(data) || !validList(data.moves) || data.moves.length < moves.length) return;
        if (adopt(data.moves)) { render(); checkEnd(); }
      },
      destroy() {
        stops.splice(0).forEach(stop => stop());
      }
    };
  }

  // ——— «Шашки» ———

  function mountCheckers(el, api) {
    const { t, escapeHtml: esc } = api;
    const watch = Boolean(api.spectator);
    const me = watch ? 0 : api.iStart ? 1 : -1;
    const flip = me === -1;
    const toAbs = pos => (flip ? 63 - pos : pos);
    const stops = [];
    let paths = [];
    let game = ckReplay(paths);
    let prefix = [];
    let finished = false;
    let draw = "none";
    let drawKey = "";

    el.innerHTML = `
      <div class="gltb gltb-checkers">
        <p class="gltb-turn" aria-live="polite"></p>
        <p class="gltb-legend">${watch ? esc(api.tt("watching")) : `<span class="gltb-piece gltb-piece-${me > 0 ? "w" : "b"} is-mini" aria-hidden="true"></span>${esc(t(me > 0 ? "youWhite" : "youBlack"))}`}</p>
        <div class="gltb-ck-board" role="group" aria-label="${esc(t("board"))}">
          ${Array.from({ length: 64 }, (_, pos) => {
            const dark = (Math.floor(pos / 8) + (pos % 8)) % 2 === 1;
            return dark ? `<button class="gltb-ck-cell is-dark" type="button" data-pos="${pos}"></button>` : '<span class="gltb-ck-cell" aria-hidden="true"></span>';
          }).join("")}
        </div>
        <p class="gltb-hint" aria-live="polite"></p>
        <div class="gltb-ck-draw"></div>
      </div>`;

    const root = el.querySelector(".gltb-checkers");
    const turnNode = root.querySelector(".gltb-turn");
    const hintNode = root.querySelector(".gltb-hint");
    const drawNode = root.querySelector(".gltb-ck-draw");
    const boardNode = root.querySelector(".gltb-ck-board");
    const cells = [...boardNode.children].map(node => (node.tagName === "BUTTON" ? node : null));

    const finishOnce = result => {
      if (finished) return;
      finished = true;
      api.finish(result);
    };
    const over = () => finished || Boolean(game.loser);
    const myMove = () => !over() && game.color === me;
    const canPlay = () => myMove() && api.partnerHere();
    const matching = () => game.moves.filter(move => prefix.every((square, index) => move.path[index] === square));

    // Доска для показа: посреди цепочки шашка уже стоит на последнем поле.
    function view() {
      const board = game.board.slice();
      const taken = new Set();
      if (prefix.length > 1) {
        const move = matching()[0];
        const piece = board[prefix[0]];
        const promoteRow = piece > 0 ? 0 : 7;
        board[prefix[0]] = 0;
        board[prefix[prefix.length - 1]] = Math.abs(piece) === 2 || prefix.slice(1).some(square => Math.floor(square / 8) === promoteRow) ? Math.sign(piece) * 2 : piece;
        move?.captured.slice(0, prefix.length - 1).forEach(square => taken.add(square));
      }
      return { board, taken };
    }

    function render() {
      if (over()) {
        const result = game.loser ? (game.loser === me ? "loss" : "win") : "draw";
        turnNode.textContent = result === "draw" ? api.tt("draw")
          : watch ? api.tt("loss", { name: playerName(api, game.loser === 1 ? 1 : 0) })
          : result === "win" ? api.tt("win") : api.tt("loss", { name: nameOf(api) });
      } else turnNode.textContent = turnLine(api, myMove(), watch ? playerName(api, game.color === 1 ? 0 : 1) : "");
      turnNode.classList.toggle("is-mine", canPlay());

      const open = canPlay();
      const { board, taken } = view();
      const options = open ? matching() : [];
      const targets = new Set(prefix.length ? options.map(move => move.path[prefix.length]) : []);
      const movable = new Set(open && !prefix.length ? game.moves.map(move => move.path[0]) : []);
      const last = new Set(paths.length ? paths[paths.length - 1] : []);
      const capture = game.moves[0]?.captured.length > 0;

      cells.forEach((cell, pos) => {
        if (!cell) return;
        const square = toAbs(pos);
        const piece = board[square];
        const flags = [];
        if (movable.has(square)) flags.push("is-movable");
        if (targets.has(square)) flags.push("is-target");
        if (prefix.length && square === prefix[prefix.length - 1]) flags.push("is-selected");
        if (taken.has(square)) flags.push("is-taken");
        if (last.has(square) && !prefix.length) flags.push("is-last");
        cell.className = `gltb-ck-cell is-dark ${flags.join(" ")}`.trim();
        const kind = piece > 0 ? "w" : "b";
        const markup = piece ? `<span class="gltb-piece gltb-piece-${kind}${Math.abs(piece) === 2 ? " is-king" : ""}">${Math.abs(piece) === 2 ? '<span aria-hidden="true">♛</span>' : ""}</span>` : "";
        if (cell.dataset.markup !== markup) { cell.innerHTML = markup; cell.dataset.markup = markup; }
        const what = { 1: t("whiteMan"), 2: t("whiteKing"), "-1": t("blackMan"), "-2": t("blackKing") }[piece] || t("empty");
        const extra = [];
        if (movable.has(square)) extra.push(t("canMove"));
        if (targets.has(square)) extra.push(t("canGo"));
        if (prefix.length && square === prefix[prefix.length - 1]) extra.push(t("selected"));
        if (taken.has(square)) extra.push(t("taken"));
        cell.setAttribute("aria-label", [ckName(square), what, ...extra].join(", "));
        cell.setAttribute("aria-disabled", String(!(movable.has(square) || targets.has(square) || (prefix.length === 1 && game.moves.some(move => move.path[0] === square)))));
      });

      hintNode.textContent = open ? (prefix.length > 1 ? t("continueCapture") : capture ? t("mustCapture") : "") : "";
      renderDraw();
    }

    function renderDraw() {
      const here = api.partnerHere();
      const key = over() ? "over" : `${draw}:${here}`;
      if (key === drawKey) return;
      drawKey = key;
      if (over() || watch) { drawNode.innerHTML = ""; return; }
      if (draw === "got") {
        drawNode.innerHTML = `
          <p class="gltb-ck-ask">${esc(t("drawAsk", { name: nameOf(api) }))}</p>
          <div class="gltb-actions">
            <button class="glg-primary" type="button" data-draw="yes">${esc(t("drawAccept"))}</button>
            <button class="glg-secondary" type="button" data-draw="no">${esc(t("drawDecline"))}</button>
          </div>`;
      } else if (draw === "sent") {
        drawNode.innerHTML = `<p class="gltb-ck-ask">${esc(t("drawSent"))}</p>`;
      } else {
        drawNode.innerHTML = `<button class="glg-secondary gltb-ck-offer" type="button" data-draw="offer"${here ? "" : " disabled"}>${esc(t("offerDraw"))}</button>`;
      }
    }

    function commit(move) {
      paths = [...paths, move.path];
      game = ckStep(game, move);
      prefix = [];
      draw = "none";
      api.send("move", { n: paths.length - 1, p: move.path });
      render();
      checkEnd();
    }

    function checkEnd() {
      if (game.loser) finishOnce(watch ? "done" : game.loser === me ? "loss" : "win");
    }

    function tap(square) {
      if (!canPlay()) return;
      const starts = new Set(game.moves.map(move => move.path[0]));
      const targets = new Set(prefix.length ? matching().map(move => move.path[prefix.length]) : []);
      if (targets.has(square)) {
        prefix = [...prefix, square];
        const done = matching().find(move => move.path.length === prefix.length);
        if (done) { commit(done); return; }
      } else if (prefix.length <= 1 && starts.has(square)) {
        prefix = prefix[0] === square ? [] : [square];
      } else if (prefix.length > 1 && square === prefix[0]) {
        prefix = [];
      }
      render();
    }

    function adopt(list) {
      const next = ckReplay(list);
      if (!next.valid) return false;
      paths = list.map(path => path.slice());
      game = next;
      prefix = [];
      draw = "none";
      return true;
    }

    const validList = list => Array.isArray(list) && list.length <= 400 && list.every(ckPathOk);

    function onClick(event) {
      const drawAction = event.target.closest("[data-draw]")?.dataset.draw;
      if (drawAction && !over()) {
        if (drawAction === "offer" && draw === "none" && api.partnerHere()) {
          draw = "sent";
          api.send("draw", { n: paths.length });
        } else if (drawAction === "yes" && draw === "got") {
          api.send("drawYes", { n: paths.length });
          finishOnce("draw");
        } else if (drawAction === "no" && draw === "got") {
          draw = "none";
          api.send("drawNo", { n: paths.length });
        }
        render();
        return;
      }
      const cell = event.target.closest(".gltb-ck-cell[data-pos]");
      if (cell) tap(toAbs(Number(cell.dataset.pos)));
    }

    const onKey = event => {
      if (event.key !== "Escape" || !prefix.length) return;
      event.stopPropagation();
      prefix = [];
      render();
    };

    root.addEventListener("click", onClick);
    boardNode.addEventListener("keydown", onKey);
    stops.push(() => root.removeEventListener("click", onClick));
    stops.push(() => boardNode.removeEventListener("keydown", onKey));
    // Стрелки по тёмным полям: влево/вправо через клетку, вверх/вниз зигзагом.
    stops.push(roving(boardNode, cells, (pos, key) => {
      let r = Math.floor(pos / 8);
      let c = pos % 8;
      if (key === "ArrowLeft") c -= 2;
      else if (key === "ArrowRight") c += 2;
      else if (key === "ArrowUp") { r -= 1; c ^= 1; }
      else if (key === "ArrowDown") { r += 1; c ^= 1; }
      else if (key === "Home") c = r % 2 === 0 ? 1 : 0;
      else if (key === "End") c = r % 2 === 0 ? 7 : 6;
      else return -1;
      return ckInside(r, c) ? r * 8 + c : pos;
    }));
    stops.push(watchPartner(api, here => {
      if (here) {
        api.send("hello", { n: paths.length });
        if (draw === "sent") api.send("draw", { n: paths.length });
      }
      render();
    }));
    render();

    return {
      onMessage(type, data) {
        if (!isObj(data)) return;
        if (type === "move") {
          if (!isInt(data.n, 0, 399) || !ckPathOk(data.p)) return;
          if (data.n > paths.length) { api.send("hello", { n: paths.length }); return; }
          if (data.n !== paths.length || over() || game.color === me) return;
          const move = ckFind(game.board, game.color, data.p);
          if (!move) return; // чужой движок ошибся или ход подделан — не принимаем
          paths = [...paths, move.path];
          game = ckStep(game, move);
          prefix = [];
          draw = "none";
          render();
          checkEnd();
        } else if (type === "hello") {
          if (!isInt(data.n, 0, 400)) return;
          if (data.n < paths.length) api.send("moves", { list: paths });
          else if (data.n > paths.length) api.send("hello", { n: paths.length });
        } else if (type === "moves") {
          if (!validList(data.list) || data.list.length <= paths.length || !samePrefix(data.list, paths)) return;
          if (adopt(data.list)) { render(); checkEnd(); }
        } else if (type === "draw") {
          if (data.n !== paths.length || over() || watch) return;
          if (draw === "sent") { api.send("drawYes", { n: paths.length }); finishOnce("draw"); }
          else draw = "got";
          render();
        } else if (type === "drawYes") {
          // Зритель узнаёт о ничьей по согласию игрока.
          if (watch && data.n === paths.length && !over()) { finishOnce("done"); render(); return; }
          if (draw !== "sent" || data.n !== paths.length) return;
          finishOnce("draw");
          render();
        } else if (type === "drawNo") {
          if (draw !== "sent" || watch) return;
          draw = "none";
          api.toast(t("drawDeclined", { name: nameOf(api) }));
          render();
        }
      },
      snapshot() {
        return { paths: paths.map(path => path.slice()) };
      },
      restore(data) {
        if (!isObj(data) || !validList(data.paths) || data.paths.length < paths.length) return;
        if (adopt(data.paths)) { render(); checkEnd(); }
      },
      destroy() {
        stops.splice(0).forEach(stop => stop());
      }
    };
  }

  // ——— Тексты ———

  const SEA_TEXT = {
    ru: {
      title: "Морской бой", short: "Найдите лодки с мишками", someone: "второй игрок",
      placeHint: "Расставьте лодки и нажмите «Готово»", shuffle: "Перемешать", ready: "Готово", readyDone: "Вы готовы",
      waitReady: "Ждём, когда {name} расставит лодки…", battleStart: "Все готовы — начинаем!",
      fleetNote: "Лодки не касаются друг друга даже углами", enemySea: "Море: {name}", mySea: "Ваше море",
      myBoard: "Ваше море: на плаву {n} из {total} лодок", boatsLeft: "Лодок на плаву: {n}",
      cellUnknown: "не проверено", cellMiss: "мимо", cellHit: "попадание", cellSunk: "лодка найдена",
      cellNear: "рядом пусто", cellWait: "ждём ответа", cellReveal: "здесь была лодка",
      hitToast: "Попадание! Стреляйте ещё", sunkToast: "Лодка найдена! Мишки спасены 🛟",
      gotHit: "{name} попадает в вашу лодку", lostBoat: "{name} находит вашу лодку",
      restarted: "Партия началась заново: расставьте лодки"
    },
    en: {
      title: "Sea battle", short: "Find the teddy-bear boats", someone: "the other player",
      placeHint: "Place your boats and tap “Ready”", shuffle: "Shuffle", ready: "Ready", readyDone: "You’re ready",
      waitReady: "Waiting for {name} to place the boats…", battleStart: "Everyone’s ready — let’s go!",
      fleetNote: "Boats never touch, not even at the corners", enemySea: "Sea: {name}", mySea: "Your sea",
      myBoard: "Your sea: {n} of {total} boats afloat", boatsLeft: "Boats afloat: {n}",
      cellUnknown: "not checked", cellMiss: "miss", cellHit: "hit", cellSunk: "boat found",
      cellNear: "empty nearby", cellWait: "waiting for the answer", cellReveal: "a boat was here",
      hitToast: "Hit! Shoot again", sunkToast: "Boat found! The bears are safe 🛟",
      gotHit: "{name} hits your boat", lostBoat: "{name} finds your boat",
      restarted: "The game restarted: place your boats"
    },
    fr: {
      title: "Bataille navale", short: "Trouvez les bateaux des oursons", someone: "l’autre joueur",
      placeHint: "Placez vos bateaux puis touchez « Prêt »", shuffle: "Mélanger", ready: "Prêt", readyDone: "C’est prêt",
      waitReady: "On attend que {name} place ses bateaux…", battleStart: "Tout le monde est prêt, c’est parti !",
      fleetNote: "Les bateaux ne se touchent pas, même par les coins", enemySea: "Mer : {name}", mySea: "Votre mer",
      myBoard: "Votre mer : {n} bateaux sur {total} à flot", boatsLeft: "Bateaux à flot : {n}",
      cellUnknown: "pas encore visé", cellMiss: "dans l’eau", cellHit: "touché", cellSunk: "bateau trouvé",
      cellNear: "vide à côté", cellWait: "réponse en attente", cellReveal: "un bateau était ici",
      hitToast: "Touché ! Tirez encore", sunkToast: "Bateau trouvé ! Les oursons sont sauvés 🛟",
      gotHit: "{name} touche votre bateau", lostBoat: "{name} trouve votre bateau",
      restarted: "La partie recommence : placez vos bateaux"
    }
  };

  const FOUR_TEXT = {
    ru: {
      title: "Четыре в ряд", short: "Соберите четыре фишки в линию", someone: "второй игрок",
      youGold: "Ваши фишки — золотые", youWine: "Ваши фишки — вишнёвые", board: "Игровое поле, семь столбцов",
      column: "Столбец {n}", free: "свободно мест: {n}", full: "заполнен"
    },
    en: {
      title: "Four in a row", short: "Line up four discs in a row", someone: "the other player",
      youGold: "Your discs are gold", youWine: "Your discs are cherry", board: "Game board, seven columns",
      column: "Column {n}", free: "{n} free", full: "full"
    },
    fr: {
      title: "Quatre à la suite", short: "Alignez quatre jetons", someone: "l’autre joueur",
      youGold: "Vos jetons sont dorés", youWine: "Vos jetons sont cerise", board: "Plateau de jeu, sept colonnes",
      column: "Colonne {n}", free: "places libres : {n}", full: "pleine"
    }
  };

  const CHECKERS_TEXT = {
    ru: {
      title: "Шашки", short: "Русские шашки на двоих", someone: "второй игрок",
      youWhite: "Вы играете белыми", youBlack: "Вы играете чёрными", board: "Шашечная доска",
      empty: "пусто", whiteMan: "белая шашка", blackMan: "чёрная шашка", whiteKing: "белая дамка", blackKing: "чёрная дамка",
      canMove: "можно ходить", canGo: "сюда можно сходить", selected: "выбрана", taken: "побита",
      mustCapture: "Бить обязательно", continueCapture: "Продолжайте бить",
      offerDraw: "Предложить ничью", drawSent: "Предложение ничьей отправлено", drawAsk: "{name} предлагает ничью",
      drawAccept: "Согласиться на ничью", drawDecline: "Играть дальше", drawDeclined: "{name} хочет играть дальше"
    },
    en: {
      title: "Checkers", short: "Russian draughts for two", someone: "the other player",
      youWhite: "You play white", youBlack: "You play black", board: "Checkerboard",
      empty: "empty", whiteMan: "white piece", blackMan: "black piece", whiteKing: "white king", blackKing: "black king",
      canMove: "can move", canGo: "you can move here", selected: "selected", taken: "captured",
      mustCapture: "Capturing is required", continueCapture: "Keep capturing",
      offerDraw: "Offer a draw", drawSent: "Draw offer sent", drawAsk: "{name} offers a draw",
      drawAccept: "Accept the draw", drawDecline: "Keep playing", drawDeclined: "{name} wants to keep playing"
    },
    fr: {
      title: "Dames", short: "Dames russes à deux", someone: "l’autre joueur",
      youWhite: "Vous jouez les blancs", youBlack: "Vous jouez les noirs", board: "Damier",
      empty: "vide", whiteMan: "pion blanc", blackMan: "pion noir", whiteKing: "dame blanche", blackKing: "dame noire",
      canMove: "peut jouer", canGo: "vous pouvez aller ici", selected: "sélectionné", taken: "pris",
      mustCapture: "La prise est obligatoire", continueCapture: "Continuez la prise",
      offerDraw: "Proposer la nulle", drawSent: "Proposition de nulle envoyée", drawAsk: "{name} propose la nulle",
      drawAccept: "Accepter la nulle", drawDecline: "Continuer à jouer", drawDeclined: "{name} veut continuer à jouer"
    }
  };

  // Все три — вдвоём; остальные за столом смотрят (в «Морском бое» флот секретный — смотреть нечего).
  window.GlowLetterTable.register({ id: "sea", icon: "🧸", order: 60, players: 2, watch: false, text: SEA_TEXT, mount: mountSea });
  window.GlowLetterTable.register({ id: "four", icon: "🟡", order: 61, players: 2, text: FOUR_TEXT, mount: mountFour });
  window.GlowLetterTable.register({ id: "checkers", icon: "⚪", order: 62, players: 2, text: CHECKERS_TEXT, mount: mountCheckers });
})();
