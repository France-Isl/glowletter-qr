import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const config = fs.readFileSync(path.join(root, "config.js"), "utf8");

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  const brace = source.indexOf("{", start);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = brace; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (["\"", "'", "`"].includes(character)) { quote = character; continue; }
    if (character === "{") depth += 1;
    if (character === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Could not parse ${name}`);
}

const swipeConfigSource = app.match(/const READING_SWIPE = Object\.freeze\((\{[\s\S]*?\})\);/)?.[1];
assert.ok(swipeConfigSource, "reading swipe thresholds must be explicit and reviewable");
const swipeConfig = vm.runInNewContext(`(${swipeConfigSource})`);
const swipeDirectionSource = extractFunction(app, "readingSwipeDirection");
const swipeContext = { READING_SWIPE: swipeConfig, innerWidth: 390 };
vm.runInNewContext(`${swipeDirectionSource}; this.swipeDirection = readingSwipeDirection;`, swipeContext);

// A deliberate horizontal swipe turns one letter in its natural direction.
assert.equal(swipeContext.swipeDirection(-80, 10, 320, 390), 1);
assert.equal(swipeContext.swipeDirection(80, 10, 320, 390), -1);

// Small, vertical, slow, and desktop-width accidental drags do not navigate.
assert.equal(swipeContext.swipeDirection(-35, 3, 220, 390), 0);
assert.equal(swipeContext.swipeDirection(-85, 78, 300, 390), 0);
assert.equal(swipeContext.swipeDirection(-90, 4, swipeConfig.maxDuration + 1, 390), 0);
assert.equal(swipeContext.swipeDirection(-80, 3, 250, 1200), 0);
assert.equal(swipeContext.swipeDirection(-120, 3, 250, 1200), 1);

const startSwipe = extractFunction(app, "startReadingSwipe");
const finishSwipe = extractFunction(app, "finishReadingSwipe");
const controlTarget = extractFunction(app, "isReadingControlTarget");
const selectionCheck = extractFunction(app, "hasReadingTextSelection");
const keyboardDirection = extractFunction(app, "readingKeyboardDirection");
const moveLetter = extractFunction(app, "moveLetter");

assert.match(controlTarget, /button,a,input,textarea,select,label/);
assert.match(selectionCheck, /getSelection/);
assert.match(startSwipe, /hasReadingTextSelection\(\)/);
assert.match(startSwipe, /pointerType === "mouse"[\s\S]*isMouseSelectableText/);
assert.match(finishSwipe, /hasReadingTextSelection\(\)/);
assert.match(finishSwipe, /moveLetter\(direction\)/, "swipes must use the normal guarded navigation path");
assert.doesNotMatch(finishSwipe, /currentIndex\s*=/, "a gesture must never bypass access checks by assigning the index");
assert.match(keyboardDirection, /isReadingControlTarget\(event\.target\)/);
assert.match(keyboardDirection, /ArrowRight/);
assert.match(keyboardDirection, /ArrowLeft/);

// The shared navigation path preserves exactly ten free letters and opens the
// existing paywall before changing the index; active VIP remains unlimited.
assert.match(config, /freeLetterCount:\s*10/);
assert.match(app, /function canAccess\(entry\)[\s\S]{0,220}entry\?\.shared\s*\|\|\s*isPremium[\s\S]{0,180}basePosition\(entry\)[\s\S]{0,80}FREE_COUNT/);
assert.match(moveLetter, /if\s*\(!canAccess\(letterDeck\[nextIndex\]\)\)\s*\{\s*openPaywall\(\);\s*return;\s*\}/);
assert.ok(moveLetter.indexOf("openPaywall()") < moveLetter.indexOf("currentIndex = nextIndex"));

assert.match(app, /letterStage\.addEventListener\("pointerdown",startReadingSwipe\)/);
assert.match(app, /letterStage\.addEventListener\("pointermove",updateReadingSwipe,\{passive:false\}\)/);
assert.match(app, /letterStage\.addEventListener\("pointerup",finishReadingSwipe\)/);
assert.match(app, /readingFocus[\s\S]{0,160}readingKeyboardDirection\(event\)[\s\S]{0,120}moveLetter\(direction\)/);
assert.match(app, /if\s*\(readingFocus\)\s*\{\s*\$\("#letter"\)\.scrollTop\s*=\s*0/);

assert.match(styles, /body\.reading-focus \.letter-stage[^}]*touch-action:pan-y pinch-zoom/);
assert.match(styles, /body\.reading-focus \.letter[^}]*touch-action:pan-y pinch-zoom/);
assert.match(styles, /body\.reading-focus \.letter-stage::after[^}]*data-navigation-hint/);

for (const hint of ["Свайп или стрелки", "Swipe or arrow keys", "Balayage ou flèches"]) {
  assert.ok(app.includes(hint), `localized reading hint is missing: ${hint}`);
}

console.log(JSON.stringify({
  ok: true,
  gestures: ["touch", "mouse", "keyboard"],
  freeLetters: 10,
  paywallPath: "moveLetter"
}));
