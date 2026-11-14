import { gsap } from "gsap";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
/** Structure characters stay put while a value re-keys, so a URL keeps its shape. */
const KEEP = new Set([..."_-:/@.…+= "]);

/** The text of a re-key at progress p (0 → 1): settled characters left of the cursor, noise to its right. */
export function rekeyFrame(from: string, to: string, p: number, rand: () => number = Math.random): string {
  const length = Math.round(from.length + (to.length - from.length) * Math.min(1, p * 1.6));
  const settled = Math.floor(p * to.length);
  let out = "";
  for (let i = 0; i < length; i++) {
    const target = to[i] ?? "";
    // Settled, structural, or already right (a placeholder's cb prefix never changes between devices).
    if (i < settled || KEEP.has(target) || from[i] === target) out += target;
    else out += GLYPHS[Math.floor(rand() * GLYPHS.length)];
  }
  return p >= 1 ? to : out;
}

/**
 * The motion verb of the page: characters cycle and land left to right on their new value. Runs on the GSAP
 * ticker; the final text is always set on completion (and immediately when `instant`).
 */
export function rekey(el: HTMLElement, to: string, { duration = 0.7, delay = 0, instant = false } = {}) {
  const from = el.textContent ?? "";
  if (instant || from === to) {
    el.textContent = to;
    return null;
  }
  const state = { p: 0 };
  return gsap.to(state, {
    p: 1,
    duration,
    delay,
    ease: "none",
    onUpdate: () => {
      el.textContent = rekeyFrame(from, to, state.p);
    },
    onComplete: () => {
      el.textContent = to;
    },
    onInterrupt: () => {
      el.textContent = to;
    },
  });
}
