---
name: GlowLetter
description: Тёплая ночь за стеклом — живая фотография на весь экран, тёмное стекло с золотым кантом, бордовые кнопки; письмо по-прежнему читается на слоновой кости.
colors:
  burgundy: "#a52a3a"
  burgundy-mid: "#861b30"
  burgundy-deep: "#74172b"
  burgundy-bright: "#c0394c"
  burgundy-press: "#8a1d33"
  burgundy-shadow: "#500818"
  gold-accent: "#f2c96f"
  gold-edge: "#f4ca7e"
  gold-edge-soft: "#f2cd91"
  gold-halo: "#f0c16e"
  gold-lamp: "#f0b464"
  ink-light: "#fff4e5"
  ink-cream: "#ffeed6"
  candle-light: "#ffecc8"
  glass-ember: "#1c0b12"
  glass-ember-floor: "#10070b"
  scene-ember: "#170b0c"
  scene-fade: "#24120a"
  glass-night: "#0a1224"
  glass-night-floor: "#080e1c"
  rose-heart: "#ff4f78"
  rose-glow: "#ff5f86"
  tile-rose: "#ffaab4"
  tile-rose-glow: "#ff6e8c"
  tile-lilac: "#cdb9ff"
  tile-lilac-glow: "#aa96ff"
  shadow: "#000000"
  glint: "#ffffff"
  season-night: "#1a0f2b"
  season-night-deep: "#120a1e"
  season-gold: "#ffc542"
  season-gold-soft: "#ffd77a"
  season-pink: "#ff5fae"
  season-pink-text: "#ff74b4"
  season-muted: "#ded2ee"
  night: "#14131f"
  night-deep: "#0c0b14"
  cream: "#f6efe0"
  paper: "#f8f2e4"
  ink: "#2a2118"
  letter-ink: "#3a3550"
  gold: "#d9a441"
  gold-bright: "#f2cc74"
  gold-dim: "rgba(217, 164, 65, .32)"
  madder: "#9e2b32"
  indigo: "#2f3a74"
  saffron: "#b5721c"
  emerald: "#1f5c48"
  ui-panel: "#f7f1e3"
  ui-panel-alt: "#ece0c9"
  ui-ink: "#2a2118"
  ui-muted: "#6f5f4a"
  ui-accent-deep: "#6d1a20"
  ui-gold: "#a8791f"
  gold-ink: "#4a340c"
  ui-border: "rgba(158, 43, 50, .22)"
  ui-surface: "rgba(255, 252, 245, .72)"
typography:
  display:
    fontFamily: "Manrope, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(34px, 9.6vw, 44px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-.01em"
  wordmark:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "31px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  layer-heading:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(30px, 7.4vw, 40px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-.02em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(30px, 7.4vw, 40px)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-.035em"
  paper-display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(30px, 7vw, 52px)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-.04em"
  hero:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(52px, 5.2vw, 78px)"
    fontWeight: 600
    lineHeight: 0.84
    letterSpacing: "-.03em"
  lead:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  alert-title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-.02em"
  letter:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(19px, 3.5vw, 26px)"
    fontWeight: 500
    lineHeight: 1.56
    letterSpacing: ".003em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: ".01em"
  scale:
    label: "11px"
    caption: "12px"
    body: "13px"
    control: "14px"
    button: "15px"
    title: "16px"
    title-lg: "18px"
    quote: "19px"
    alert: "22px"
    card-title: "26px"
rounded:
  band: "7px"
  chip: "10px"
  field: "12px"
  card: "14px"
  section: "16px"
  button: "18px"
  panel: "20px"
  glass: "22px"
  alert: "24px"
  seal: "26px"
  dialog: "28px"
  pill: "999px"
  circle: "50%"
spacing:
  hairline: "7px"
  xs: "10px"
  sm: "14px"
  md: "18px"
  lg: "22px"
  frame-top: "clamp(64px, 9vh, 96px)"
  frame-side: "clamp(12px, 4vw, 64px)"
  frame-bottom: "clamp(150px, 26vh, 240px)"
components:
  button-primary:
    backgroundColor: "{colors.burgundy}"
    textColor: "{colors.ink-light}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    padding: "0 20px"
    height: "50px"
  button-secondary:
    backgroundColor: "{colors.glass-ember-floor}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.button}"
    padding: "0 20px"
    height: "50px"
  button-round:
    backgroundColor: "{colors.glass-night-floor}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.circle}"
    size: "48px"
  glass-card:
    backgroundColor: "{colors.glass-ember}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.glass}"
    padding: "18px"
  glass-card-night:
    backgroundColor: "{colors.glass-night}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.glass}"
    padding: "18px"
  glass-field:
    backgroundColor: "{colors.glass-ember-floor}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.card}"
    height: "48px"
  alert-card:
    backgroundColor: "{colors.glass-ember}"
    textColor: "{colors.glint}"
    typography: "{typography.alert-title}"
    rounded: "{rounded.alert}"
    padding: "28px 22px 22px"
  season-card:
    backgroundColor: "{colors.season-night}"
    textColor: "{colors.glint}"
    rounded: "{rounded.glass}"
    padding: "16px"
  paper-panel:
    backgroundColor: "{colors.ui-panel}"
    textColor: "{colors.ui-ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.md}"
  letter-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.letter-ink}"
    typography: "{typography.letter}"
    rounded: "{rounded.section}"
---

# Design System: GlowLetter

## Overview

**Creative North Star: "Тёплая ночь за стеклом"**

С v96 (31.10.2026) GlowLetter живёт внутри фотографии. Каждый крупный слой
стоит на своей сцене во весь экран: мишки у озера и костра на главной, в
«Друзьях» и на экранах защиты (`assets/scenes/bears.webp`), мишки в розах в
«Настройках» (`roses.webp`), избушка у костра в «Играх» (`chat-campfire.webp`),
домик под луной в звонке (`call-cabin-moon.webp`). Фото не размывается и не
затемняется целиком: интерфейс лежит поверх него островами тёмного стекла с
золотым кантом, а главное действие — бордовая кнопка с золотой кромкой.

Главная собрана по картинке владельца: все размеры сняты с образца шириной
841px и заданы в его долях (`--u = min(100vw, 470px) / 841`), поэтому на любом
телефоне пропорции те же, что на образце. Остальные слои (Настройки, Игры,
Друзья, Защита, онлайн-функции) повторяют рецепт главной обычными пикселями.

Второй мир — бумага. Письмо читается на слоновой кости (`body.is-reading`), а
«Моменты», QR-карточки, пейволл и админка пока остаются в прежней палитре
«ковра»: марена, индиго, шафран или изумруд на светлом поле, золото на краю.
Это действующая система, а не мусор: её токены записаны ниже под «Neutral /
Paper». Третий, отдельный мир — ночной экран рейтинга сезона: фиолетовое небо,
неоновое золото и розовый, металлический пьедестал.

**Key Characteristics:**
- Фотография сцены во весь экран, без размытия; глубина — только стеклом и тенью.
- Тёмное стекло: `linear-gradient(180deg, rgba(28,11,18,.66), rgba(16,7,11,.6))` поверх тёплых сцен, `rgba(10,18,36,.64) → rgba(7,12,26,.58)` поверх озера.
- Золотой кант 1–1.5px `rgba(244,202,126,.55–.62)`; активное — сплошное `#f2c96f`.
- Бордовая кнопка `linear-gradient(110deg, #a52a3a, #861b30 55%, #74172b)` с кромкой `#f0c66f` и тёплым ореолом.
- Светлые чернила `#fff4e5`, приглушённые — `rgba(255,238,214,.8–.86)`, всегда с тенью текста над фото.
- Заголовки слоёв — Playfair Display 600; интерфейс — Manrope; письмо — Literata или выбранный пресет.

## Colors

Ночь у огня: тёмное вино стекла, золото свечи по краю, бордо на действии и
светлые тёплые чернила. Холодный цвет допускается только как ночное стекло над
озером и в небе рейтинга.

### Primary
- **Бордо** (`{colors.burgundy}` → `{colors.burgundy-mid}` → `{colors.burgundy-deep}`): три точки главного градиента кнопки (110°). Также заливка выбранного состояния (`rgba(165,42,58,.55–.7)`) и активной вкладки. В «Настройках» подменяет `--ui-accent` на **яркое бордо** (`{colors.burgundy-bright}`) и `--ui-accent-deep` на **нажатое бордо** (`{colors.burgundy-press}`).
- **Винная тень** (`{colors.burgundy-shadow}`): цвет тени под бордовой кнопкой (`0 10px 26px rgba(80,8,24,.45)`). Тень кнопки окрашена, а не чёрная.

### Secondary
- **Золото свечи** (`{colors.gold-accent}`): сплошное золото — кромка кнопки, активная граница выбора, заголовки разделов настроек (`summary`, `legend`, `h4`), код друга, бейдж «Новое», `accent-color` чекбоксов.
- **Золотой кант** (`{colors.gold-edge}`): полупрозрачная граница стекла (.55 в Настройках, .62 в Играх и Друзьях, .4 у вторичных кнопок), линия-разделитель внутри раздела.
- **Мягкий кант** (`{colors.gold-edge-soft}`): граница круглых кнопок закрытия и «домой» (`rgba(242,205,145,.55)`), тонкие золотые блики.
- **Ореол** (`{colors.gold-halo}`) и **лампа** (`{colors.gold-lamp}`): только свечение в `box-shadow` — вокруг круглых кнопок шапки, плиток главной, кнопки.

### Tertiary
- **Сердце** (`{colors.rose-heart}`) и **розовый свет** (`{colors.rose-glow}`): сердце в словесном знаке, акценты любви и звонка.
- **Цвет плиток главной**: «Моменты» — золото, «Игры» и «Мы вдвоём» — **розовый кант** (`{colors.tile-rose}`, свечение `{colors.tile-rose-glow}`), «Друзья» — **сиреневый кант** (`{colors.tile-lilac}`, свечение `{colors.tile-lilac-glow}`). Цвет только в рамке и свечении, фон плитки — то же стекло.
- **Ночь сезона** (`{colors.season-night}` → `{colors.season-night-deep}`), **неоновое золото** (`{colors.season-gold}`, `{colors.season-gold-soft}`), **неоновый розовый** (`{colors.season-pink}`, текст `{colors.season-pink-text}`), **сиреневая дымка** (`{colors.season-muted}`): только экран рейтинга. Металлы пьедестала (золото, серебро, розовое золото) — тональные рампы в сайдкаре.

### Neutral
- **Светлые чернила** (`{colors.ink-light}`): весь текст поверх стекла, текст кнопок. Заголовки слоёв чуть теплее (`#fff4df`).
- **Сливочные чернила** (`{colors.ink-cream}`): вторичный текст `rgba(255,238,214,.75–.86)`, плейсхолдер `.6`.
- **Свеча** (`{colors.candle-light}`): тёплые блики и подсветки на стекле.
- **Тёплое стекло** (`{colors.glass-ember}` → `{colors.glass-ember-floor}`): верх и низ градиента стеклянной карточки; поля ввода и вторичные кнопки — плоский низ `rgba(20–24,10,14–16,.6–.66)`.
- **Ночное стекло** (`{colors.glass-night}` → `{colors.glass-night-floor}`): то же стекло над озером («Друзья», рамка-герой главной, круглые кнопки шапки).
- **Подложка сцены** (`{colors.scene-ember}`, `{colors.scene-fade}`): цвет под фото, пока оно грузится, и тёплая темнота, в которую уходит низ фотографии на главной.
- **Тень** (`{colors.shadow}`) и **блик** (`{colors.glint}`): чёрный только в тенях и тени текста, белый только во внутреннем блике стекла (`inset 0 1px rgba(255,255,255,.1)`) и в тексте экранов защиты и рейтинга.
- **Paper (бумажный мир):** ночь (`{colors.night}`, `{colors.night-deep}`), слоновая кость (`{colors.cream}`, `{colors.paper}`, `{colors.ui-panel}`, `{colors.ui-panel-alt}`), чернила (`{colors.ink}`, `{colors.ui-ink}`, `{colors.ui-muted}`), чернила письма (`{colors.letter-ink}`), золото шитья (`{colors.gold}`, `{colors.gold-bright}`, `{colors.gold-dim}`, `{colors.ui-gold}`, `{colors.gold-ink}`) и четыре краски темы (`{colors.madder}`, `{colors.indigo}`, `{colors.saffron}`, `{colors.emerald}`, глубина `{colors.ui-accent-deep}`). Действуют в чтении письма, «Моментах», QR, пейволле, админке; переключаются `body[data-ui-theme]`.

### Named Rules

**Правило «бордо держит действие, золото держит край».** Заливка кнопки — только
бордовый градиент. Золото — кромка, граница выбора, заголовок раздела, свечение.
Сплошная золотая площадь допускается только в маленьком бейдже («Новое»).

**Правило окрашенной тени.** Тени стекла — `rgba(0,0,0,.3–.55)`, тень кнопки —
винная `rgba(80,8,24,.45)`, свечение — золото. Серых теней нет.

**Правило одной сцены.** Один слой — одна фотография. Поверх неё нет второго
фона, видео или узора; стекло полупрозрачное, чтобы сцена читалась сквозь него.

## Typography

**Display / UI Font:** Manrope (system-ui, sans-serif)
**Layer Heading Font:** Playfair Display (Georgia, serif)
**Wordmark Font:** Cormorant Garamond (Georgia, serif)
**Lead Font:** Georgia (Times New Roman, serif)
**Letter Font:** Literata (Georgia, serif) или пресет письма через `--gl-letter-font`

**Character:** Playfair Display 600 даёт заголовкам слоёв вечерний, книжный
голос; Manrope держит всё рабочее — кнопки, поля, подписи. Cormorant остаётся в
словесном знаке GlowLetter, Georgia — в подводке главной. Все шрифты локальные
(`fonts/local-fonts.css`), внешних запросов нет.

### Hierarchy
- **Display** (Manrope 600, `clamp(34px, 9.6vw, 44px)`, 1.1, -.01em): заголовок рамки-героя на главной; вторая строка `em` — золото `#f2c46f`. На главной реальный кегль задаётся в долях образца (`calc(var(--u) * 57)`).
- **Wordmark** (Cormorant Garamond 700, 31px, 1): «GlowLetter» с сердцем в шапке главной.
- **Layer heading** (Playfair Display 600, `clamp(30px, 7.4vw, 40px)`, 1, -.02em): `h2` в шапке Настроек, Игр, Друзей; цвет `#fff4df`, тень `0 2px 16px rgba(0,0,0,.7)`.
- **Headline** (Manrope 800, `clamp(30px, 7.4vw, 40px)`, .96): заголовки бумажных карточек — пейволл, QR, поддержка.
- **Paper display** (Manrope 800, `clamp(30px, 7vw, 52px)`, .94, -.04em) и **Hero** (шрифт письма 600, `clamp(52px, 5.2vw, 78px)`, .84): крупные заголовки бумажного мира — заголовок письма, шапка бумажной панели, VIP-уведомление; Hero — заголовок главной на широком экране в режиме чтения.
- **Lead** (Georgia 400, 16px, 1.4): подводка под заголовком главной.
- **Alert title** (Manrope 700, 22px): заголовок экранов защиты — нет интернета, блокировка, предупреждение, жалоба.
- **Title** (Manrope 800, 16px, -.02em): заголовки разделов и карточек.
- **Letter** (Literata 500–600, `clamp(19px, 3.5vw, 26px)`, 1.56): тело письма.
- **Body** (Manrope 500, 13px, 1.5): подводки и описания на стекле и бумаге.
- **Label** (Manrope 600, 11px): мета, подписи, eyebrow (`letter-spacing .22em` в фото-мире).
- **Шкала шагов:** 11 / 12 / 13 / 14 / 15 / 16 / 18 / 19 / 22 / 26px. 14px — поля ввода и вкладки, 15px — текст кнопок и строк списка, 18px — крупные строки списков, 19px — цитата, 26px — заголовок карточки.

### Named Rules

**Правило типографического пола.** 11px — низ шкалы текста. Ниже ставятся только
значки (эмодзи, медали), не слова.

**Правило трёх голосов.** Manrope — интерфейс, Playfair — заголовок слоя,
шрифт письма — письмо. Cormorant и Georgia живут только на главной.

**Правило тени над фото.** Любой текст прямо над фотографией (без стекла) несёт
`text-shadow` 8–16px чёрного .6–.8.

## Layout

Одна колонка под телефон в руке. Главная — вертикальная композиция образца:
шапка (словесный знак, круглые кнопки 80u), рамка-герой высотой 950u с мишками
внутри, ряд из четырёх плиток (`repeat(4, minmax(0, 1fr))`, зазор 20u), полоса
«Наш мир», блок «Быстрые действия», ниже вход и «Новое в коллекции». Ширина
образца ограничена 470px; на экранах шире 600px фото переходит в `cover`.

Слои (Настройки, Игры, Друзья) — полноэкранная панель с фото, шапка с eyebrow,
заголовком Playfair и круглой кнопкой закрытия 48px, ниже стопка стеклянных
карточек. Экраны защиты — одна карточка `min(100%, 380px)` по центру сцены.
Бумажный мир сохраняет прежний кадр: `clamp(64px, 9vh, 96px)` сверху,
`clamp(12px, 4vw, 64px)` по бокам.

Шаги отступов: 10 / 14 / 18 / 22px; внутренние отступы стекла 16–22px.
Узкие телефоны подстраиваются на 340–380px, низкие — на `max-height: 700px`.

## Elevation & Depth

Глубина создаётся тремя слоями: фотография, полупрозрачное стекло, свет.
Размытия (`backdrop-filter`) в фото-мире нет — стекло тёмное ровно настолько,
чтобы текст читался, а сцена оставалась видна.

### Shadow Vocabulary
- **Стекло** (`0 16px 36px rgba(0,0,0,.34), inset 0 1px rgba(255,255,255,.1)`): карточки Настроек; в Играх и Друзьях — `0 18px 40px`.
- **Кнопка** (`0 10px 26px rgba(80,8,24,.45), 0 0 16px rgba(240,198,111,.25)`): бордовая кнопка — винная тень плюс золотой ореол.
- **Ореол хрома** (`0 0 calc(var(--u)*26) rgba(240,190,110,.32), inset 0 1px rgba(255,235,200,.15)`): круглые кнопки шапки главной.
- **Выбор** (`0 0 12px rgba(242,201,111,.35)`): выбранная плитка выбора.
- **Тревога** (`0 0 24px rgba(255,180,60,.35), 0 18px 40px rgba(0,0,0,.55)`): карточка экрана защиты.

### Named Rules

**Правило света вместо высоты.** Важное поднимается свечением золота, а не
более тёмной тенью. Тень только отделяет стекло от фото.

## Shapes

Мягкие крупные скругления: стекло 22px (`{rounded.glass}`), кнопки 18px
(`{rounded.button}`), поля и плитки выбора 14px, круглые кнопки — круг, кнопки
защиты — пилюля. На главной радиусы заданы в долях образца (26–34u). Кант всегда
1–1.5px, на главной 1.5–2px. Бумажный мир сохраняет кайму `--carpet-band` 7px.

## Components

### Buttons
- **Primary:** бордовый градиент 110° (`#a52a3a → #861b30 55% → #74172b`), кромка 1px `#f0c66f`, текст `{colors.ink-light}` Manrope 800, высота 50px, радиус 18px, тень «Кнопка».
- **Secondary:** стекло `rgba(20,10,14,.62)`, кант `rgba(244,202,126,.62)`, светлый текст.
- **Round control:** круг 48px (80u на главной), стекло, мягкий кант, ореол хрома.
- **Guard button:** пилюля 48px, вертикальный бордовый градиент, кромка золота; мягкий вариант — белое стекло `.08`.

### Chips / Choice tiles
- **Style:** стекло `rgba(24,10,16,.6)`, кант `.4`, светлые чернила.
- **Selected:** граница `#f2c96f`, заливка `rgba(165,42,58,.55)`, свечение «Выбор».

### Cards / Containers
- **Glass card:** радиус 22px (23px в Играх и Друзьях — расхождение, см. Do's and Don'ts), градиент тёплого или ночного стекла, кант золота, тень «Стекло», отступ 16–22px.
- **Paper panel / Letter sheet:** слоновая кость, кайма, чернила письма `{colors.letter-ink}`.

### Inputs / Fields
- **Style:** стекло `rgba(24,10,16,.66)`, кант `rgba(244,202,126,.55)`, текст `#fff4e5`, плейсхолдер `rgba(255,238,214,.6)`.
- **Focus:** граница становится сплошным золотом.

### Navigation
- **Шапка главной:** словесный знак слева, круглые кнопки (язык, рейтинг-кубок, коллекция, меню) справа.
- **Шапка слоя:** eyebrow золотом с трекингом .22em, заголовок Playfair, круглая кнопка закрытия.

### Home tiles (signature)
Четыре вертикальные плитки на стекле: иконка 54u, подпись 23u, кант своего цвета
(золото / розовый / розовый / сиреневый) и свечение того же цвета.

### Season podium (signature)
Ночь сезона: небо `season-night`, пьедесталы-цилиндры с металлическими крышками
(золото, серебро, розовое золото), толстое кольцо над аватаром, корона, лавр,
восьмиугольные бейджи 1-2-3. Металлы и неон — рампы сайдкара.

## Do's and Don'ts

### Do:
- **Do** ставить каждый новый слой на свою фотографию сцены и класть контент на стекло `linear-gradient(180deg, rgba(28,11,18,.66), rgba(16,7,11,.6))` с кантом `rgba(244,202,126,.55–.62)`.
- **Do** делать главное действие бордовой кнопкой `linear-gradient(110deg,#a52a3a,#861b30 55%,#74172b)` с кромкой `#f0c66f`.
- **Do** брать светлые чернила `#fff4e5` и сливочные `rgba(255,238,214,.8)`; для заголовка слоя — Playfair Display 600.
- **Do** подменять `--ui-*` на уровне слоя (как `#settingsLayer`, `#gamesLayer`, `.glf-layer`), а не переписывать цвета у каждого элемента.
- **Do** брать размеры из шкалы 11–26px и радиусы из `rounded`.

### Don't:
- **Don't** размывать или затемнять фотографию целиком и не класть поверх неё второй фон.
- **Don't** вводить новое золото рядом с `#f2c96f` / `#f4ca7e` (например `#ffc35a`, `#ffbe5a` в экранах защиты и онлайн-функциях) — это расхождение, его надо свести к токену.
- **Don't** использовать розово-сливовую палитру старого входа (`#b84d7d`, `#7b4d79`, `#975a79`) в новых экранах.
- **Don't** ставить текст мельче 11px и заводить соседние шаги 21/23/25/27px рядом с 22/26px.
- **Don't** заливать текст градиентом (`background-clip: text`) — заголовок держится цветом и тенью.
