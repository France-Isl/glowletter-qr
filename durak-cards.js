/*
  Колода «Дурака» в русском стиле (01.11): своя SVG-графика без внешних файлов.
  Кремовая бумага с двойной золотой рамкой, крупные масти, двусторонние картинки
  (король в короне с бородой, дама в кокошнике, валет в шапке), тузы в цветочном венке.
  Рубашки: классическая бордовая с золотой сеткой, хохлома, гжель, золотая.
  GlowDurakCards.face(card, letters) / back(style) — data:URL картинки; кэшируются.
*/
(function () {
  "use strict";

  const SUIT = {
    h: "M50 90C22 68 5 52 5 32 5 17 16 7 30 7c9 0 16 5 20 13 4-8 11-13 20-13 14 0 25 10 25 25 0 20-17 36-45 58Z",
    d: "M50 3Q67 30 88 50 67 70 50 97 33 70 12 50 33 30 50 3Z",
    s: "M50 5C41 25 7 39 7 62c0 14 11 22 23 22 7 0 13-4 16-9-1 9-5 15-11 19h30c-6-4-10-10-11-19 3 5 9 9 16 9 12 0 23-8 23-22C93 39 59 25 50 5Z",
    c: "M50 7a19 19 0 1 1-.1 0ZM27 40a19 19 0 1 1-.1 0ZM73 40a19 19 0 1 1-.1 0ZM46 52c1 22-3 33-12 42h32c-9-9-13-20-12-42Z"
  };
  const RED = "#b0142f", BLACK = "#1f1a2e", GOLD = "#c9962f", GOLD_LIGHT = "#f3d587", BLUE = "#21418f";
  const isRed = suit => suit === "h" || suit === "d";
  const cache = new Map();
  const url = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const pip = (suit, x, y, size, flip = false) =>
    `<path d="${SUIT[suit]}" fill="${isRed(suit) ? RED : BLACK}" transform="translate(${x - size / 2} ${y - size / 2}) scale(${size / 100})${flip ? ` rotate(180 50 50)` : ""}"/>`;

  const PIPS = {
    6: [[72, 88], [178, 88], [72, 175], [178, 175], [72, 262], [178, 262]],
    7: [[72, 88], [178, 88], [125, 131], [72, 175], [178, 175], [72, 262], [178, 262]],
    8: [[72, 88], [178, 88], [125, 131], [72, 175], [178, 175], [125, 219], [72, 262], [178, 262]],
    9: [[72, 82], [178, 82], [72, 142], [178, 142], [125, 175], [72, 208], [178, 208], [72, 268], [178, 268]],
    10: [[72, 82], [178, 82], [125, 112], [72, 142], [178, 142], [72, 208], [178, 208], [125, 238], [72, 268], [178, 268]]
  };

  function paper(inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 350">
<defs>
<linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset=".55" stop-color="#fbf3df"/><stop offset="1" stop-color="#f1e2bf"/></linearGradient>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GOLD_LIGHT}"/><stop offset=".5" stop-color="${GOLD}"/><stop offset="1" stop-color="#9c6d1d"/></linearGradient>
</defs>
<rect width="250" height="350" rx="20" fill="url(#p)"/>
<rect x="9" y="9" width="232" height="332" rx="14" fill="none" stroke="url(#g)" stroke-width="2.4"/>
<rect x="14" y="14" width="222" height="322" rx="11" fill="none" stroke="url(#g)" stroke-width=".9" opacity=".8"/>
${inner}
</svg>`;
  }

  function index(label, suit) {
    const color = isRed(suit) ? RED : BLACK;
    const small = `<text x="0" y="0" font-family="Georgia,'Times New Roman',serif" font-weight="700" font-size="${label.length > 1 ? 30 : 34}" fill="${color}" text-anchor="middle">${label}</text>${pip(suit, 0, 24, 22)}`;
    return `<g transform="translate(34 46)">${small}</g><g transform="rotate(180 125 175) translate(34 46)">${small}</g>`;
  }

  // Узор-завиток для углов картинок и тузов.
  const curl = (x, y, r, color) => `<path d="M${x} ${y}c${r} -${r} ${r * 2.4} 0 ${r * 1.6} ${r}c-.6 .8-1.8 .6-2-.4" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;

  function figure(kind, suit) {
    const robe = isRed(suit) ? RED : BLUE;
    const robe2 = isRed(suit) ? BLUE : RED;
    const ink = "#3a2320";
    let head = "", extra = "";
    if (kind === "K") {
      head = `<path d="M92 70 96 40l14 15 15-22 15 22 14-15 4 30Z" fill="url(#g)" stroke="#7a5414" stroke-width="1.2"/>
<circle cx="125" cy="47" r="4" fill="${robe2}"/><circle cx="104" cy="58" r="3" fill="${robe}"/><circle cx="146" cy="58" r="3" fill="${robe}"/>
<path d="M92 70h66v7H92Z" fill="url(#g)"/>`;
      extra = `<path d="M100 100q25 56 50 0-6 24-25 26-19-2-25-26Z" fill="#8a5a2e"/><path d="M110 104q15 8 30 0" stroke="#5e3a1b" stroke-width="2" fill="none"/>`;
    } else if (kind === "Q") {
      head = `<path d="M86 82Q84 30 125 24q41 6 39 58Z" fill="${robe2}" stroke="url(#g)" stroke-width="3"/>
<path d="M95 70q30-30 60 0" fill="none" stroke="url(#g)" stroke-width="2.5"/>
${[100, 112, 125, 138, 150].map((x, i) => `<circle cx="${x}" cy="${44 + Math.abs(2 - i) * 7}" r="3" fill="#fff7e0" stroke="${GOLD}" stroke-width="1"/>`).join("")}
<path d="M96 84q-8 40 2 70M154 84q8 40-2 70" stroke="#6b3a1a" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    } else {
      head = `<path d="M96 76q1-28 29-30 28 2 29 30Z" fill="${robe2}"/><rect x="92" y="70" width="66" height="12" rx="6" fill="#efe3cf" stroke="#b49a72"/>
<path d="M150 56q14-12 22-4" stroke="url(#g)" stroke-width="3" fill="none"/><circle cx="172" cy="52" r="4" fill="url(#g)"/>`;
      extra = `<path d="M100 86q25 10 50 0v6q-25 8-50 0Z" fill="#6b3a1a"/>`;
    }
    const face = `<ellipse cx="125" cy="98" rx="24" ry="27" fill="#f6dcc2" stroke="#d6b190" stroke-width="1"/>
<ellipse cx="116" cy="96" rx="2.6" ry="3.2" fill="${ink}"/><ellipse cx="134" cy="96" rx="2.6" ry="3.2" fill="${ink}"/>
<path d="M112 89q4-3 8 0M130 89q4-3 8 0" stroke="${ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<circle cx="111" cy="106" r="4.5" fill="#f2a3a0" opacity=".6"/><circle cx="139" cy="106" r="4.5" fill="#f2a3a0" opacity=".6"/>
<path d="M119 113q6 4 12 0" stroke="#a3443f" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    const body = `<path d="M50 175q4-46 75-52 71 6 75 52Z" fill="${robe}"/>
<path d="M50 175q4-46 75-52 71 6 75 52" fill="none" stroke="url(#g)" stroke-width="3"/>
<path d="M100 126q25 20 50 0l6 49h-62Z" fill="#fff4dc" opacity=".95"/>
<path d="M125 128v47" stroke="url(#g)" stroke-width="3"/>
${[136, 148, 160].map(y => `<circle cx="125" cy="${y}" r="3" fill="${robe2}" stroke="${GOLD}"/>`).join("")}
${kind === "K" ? `<path d="M62 168q30-30 40-36M188 168q-30-30-40-36" stroke="#fff" stroke-width="7" fill="none"/>${[70, 82, 168, 180].map(x => `<circle cx="${x}" cy="${x < 125 ? 160 - (x - 70) : 160 - (180 - x)}" r="1.6" fill="#111"/>`).join("")}` : ""}
${curl(62, 160, 8, GOLD_LIGHT)}${curl(170, 160, 8, GOLD_LIGHT)}`;
    const half = `${body}${extra.includes("M100 100") ? "" : ""}${face}${extra}${head}${pip(suit, 196, 112, 30)}`;
    return `<clipPath id="c"><rect x="24" y="24" width="202" height="302" rx="8"/></clipPath>
<g clip-path="url(#c)">
<rect x="24" y="24" width="202" height="302" rx="8" fill="${isRed(suit) ? "#fbe9dc" : "#e9eef8"}" opacity=".7"/>
<g>${half}</g><g transform="rotate(180 125 175)">${half}</g>
<path d="M30 175h190" stroke="url(#g)" stroke-width="1.6"/>
</g>
<rect x="24" y="24" width="202" height="302" rx="8" fill="none" stroke="url(#g)" stroke-width="1.6"/>`;
  }

  function ace(suit) {
    const leaves = Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      const x = 125 + Math.cos(a) * 78, y = 175 + Math.sin(a) * 78;
      return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="11" ry="5" transform="rotate(${i * 30 + 90} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 2 ? "#3f7a3a" : GOLD}" opacity=".9"/>`;
    }).join("");
    const berries = Array.from({ length: 12 }, (_, i) => {
      const a = ((i * 30 + 15) * Math.PI) / 180;
      return `<circle cx="${(125 + Math.cos(a) * 86).toFixed(1)}" cy="${(175 + Math.sin(a) * 86).toFixed(1)}" r="4.5" fill="${RED}" stroke="#7a0d20" stroke-width="1"/>`;
    }).join("");
    return `<circle cx="125" cy="175" r="70" fill="none" stroke="url(#g)" stroke-width="3"/>
<circle cx="125" cy="175" r="62" fill="${isRed(suit) ? "#fff1e6" : "#eef2fb"}" stroke="url(#g)" stroke-width="1.2"/>
${leaves}${berries}
${pip(suit, 125, 175, 92)}
<path d="M125 92v-8M125 266v-8M42 175h8M200 175h8" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>`;
  }

  const LETTERS = {
    ru: { 11: "В", 12: "Д", 13: "К", 14: "Т" },
    latin: { 11: "J", 12: "Q", 13: "K", 14: "A" }
  };

  function face(card, letters = "ru") {
    const key = `${card}|${letters}`;
    if (cache.has(key)) return cache.get(key);
    const rank = parseInt(card, 10), suit = card.slice(-1);
    const set = LETTERS[letters] || LETTERS.latin;
    const label = rank <= 10 ? String(rank) : set[rank];
    let inner;
    if (rank <= 10) inner = PIPS[rank].map(([x, y]) => pip(suit, x, y, 40, y > 175)).join("");
    else if (rank === 14) inner = ace(suit);
    else inner = figure(rank === 13 ? "K" : rank === 12 ? "Q" : "J", suit);
    const value = url(paper(`${inner}${index(label, suit)}`));
    cache.set(key, value);
    return value;
  }

  const BACKS = {
    back_classic: { base: "#6e1024", base2: "#3e0814", line: GOLD_LIGHT, mid: "#f3d587", motif: "heart" },
    back_khokhloma: { base: "#17110f", base2: "#000", line: "#d9301f", mid: GOLD_LIGHT, motif: "berry" },
    back_gzhel: { base: "#fbfdff", base2: "#dfe9fb", line: "#1f4fb8", mid: "#1f4fb8", motif: "flower" },
    back_gold: { base: "#f2cf73", base2: "#b9832a", line: "#7a1428", mid: "#7a1428", motif: "crown" }
  };

  function back(style = "back_classic") {
    const key = `back|${style}`;
    if (cache.has(key)) return cache.get(key);
    const b = BACKS[style] || BACKS.back_classic;
    const motif = {
      heart: `<path d="${SUIT.h}" transform="translate(95 145) scale(.6)" fill="${b.mid}"/>`,
      berry: `${[[-20, -8], [0, -18], [20, -8], [-10, 12], [10, 12]].map(([x, y]) => `<circle cx="${125 + x}" cy="${175 + y}" r="9" fill="#d9301f" stroke="${GOLD_LIGHT}" stroke-width="2"/>`).join("")}<path d="M90 200q35-30 70 0" stroke="${GOLD_LIGHT}" stroke-width="3" fill="none"/>`,
      flower: `${Array.from({ length: 8 }, (_, i) => `<ellipse cx="125" cy="150" rx="9" ry="22" fill="${b.mid}" transform="rotate(${i * 45} 125 175)"/>`).join("")}<circle cx="125" cy="175" r="10" fill="#fff" stroke="${b.mid}" stroke-width="3"/>`,
      crown: `<path d="M92 196 96 156l14 16 15-26 15 26 14-16 4 40Z" fill="${b.mid}"/><rect x="92" y="196" width="66" height="9" fill="${b.mid}"/>`
    }[b.motif];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 350">
<defs>
<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b.base}"/><stop offset="1" stop-color="${b.base2}"/></linearGradient>
<pattern id="l" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 11h22M11 0v22" stroke="${b.line}" stroke-width="1.1" opacity=".55"/><circle cx="11" cy="11" r="2" fill="${b.line}" opacity=".8"/></pattern>
</defs>
<rect width="250" height="350" rx="20" fill="#fffaf0"/>
<rect x="8" y="8" width="234" height="334" rx="14" fill="url(#b)"/>
<rect x="8" y="8" width="234" height="334" rx="14" fill="url(#l)"/>
<rect x="18" y="18" width="214" height="314" rx="10" fill="none" stroke="${b.line}" stroke-width="2"/>
<ellipse cx="125" cy="175" rx="62" ry="78" fill="url(#b)" stroke="${b.line}" stroke-width="3"/>
<ellipse cx="125" cy="175" rx="52" ry="68" fill="none" stroke="${b.line}" stroke-width="1" opacity=".8"/>
${motif}
</svg>`;
    const value = url(svg);
    cache.set(key, value);
    return value;
  }

  window.GlowDurakCards = Object.freeze({ face, back, SUIT, isRed, backs: Object.keys(BACKS) });
})();
