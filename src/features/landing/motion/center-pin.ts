import { ScrollTrigger } from "gsap/ScrollTrigger";

const GAP = 12;

/** One way to frame a pinned story: `content` (inside the stage) is what is centred on screen and, if needed, scaled. */
export type PinOption = { content: HTMLElement; measure?: () => number };

export type CenterPin = {
  /** ScrollTrigger `start` for the moment the stage pins (its track's top reaches the sticky line). */
  start: () => string;
  /** ScrollTrigger `end` for the moment the stage lets go (its track's bottom reaches the stage's bottom). */
  end: () => string;
  destroy: () => void;
};

/**
 * Pins a scroll story in the vertical centre of the screen (below the fixed header) WITHOUT a full-screen box around
 * it: `stage` gets `data-pinned` (CSS: `position: sticky; top: var(--pin-top)` at its own height; its parent is the
 * tall scroll track), so there is no empty screen above or below it, before, during or after the pin.
 *
 * `options` go from the fullest frame to the smallest (e.g. heading + demo, then the demo alone). The first one that
 * fits the screen at 85% scale or more is centred; otherwise the last one, scaled down to fit (never below `minFit`,
 * never grown). When a smaller frame is chosen the stage sticks with a negative offset, so whatever sits above that
 * frame (the heading) scrolls away and only the frame stays centred. Everything above the frame fades out over the
 * last stretch before the pin, so no half-cut lines of it stay stuck at the top of the screen (the header hides on
 * scroll down and would otherwise uncover them). Re-measured on every ScrollTrigger refresh, before positions are
 * computed.
 */
export function centerPin(stage: HTMLElement, options: PinOption[], opts: { minFit?: number } = {}): CenterPin {
  const minFit = opts.minFit ?? 0.6;
  let top = 0;
  let bottom = 0;
  let offset = 0;
  /** Whatever sits above the pinned frame inside the stage (the heading, when the demo alone is pinned). */
  let above: HTMLElement[] = [];
  let fadeAt = 0;
  let heights: number[] = [];
  let heightsKey = "";
  const track = stage.parentElement;

  const aboveOf = (content: HTMLElement) => {
    const out: HTMLElement[] = [];
    for (let node: HTMLElement | null = content; node && node !== stage; node = node.parentElement) {
      for (let sib = node.previousElementSibling; sib; sib = sib.previousElementSibling)
        if (sib instanceof HTMLElement) out.push(sib);
    }
    return out;
  };
  const fade = (progress: number) => {
    for (const e of above) e.style.opacity = String(1 - progress);
  };

  const reset = () => {
    for (const o of options) {
      o.content.style.removeProperty("scale");
      o.content.style.removeProperty("margin-bottom");
    }
    stage.style.removeProperty("--pin-top");
    for (const e of above) e.style.removeProperty("opacity");
    above = [];
  };

  const layout = () => {
    reset();
    stage.setAttribute("data-pinned", "");
    const header = Number.parseFloat(getComputedStyle(stage).getPropertyValue("--lp-header")) || 64;
    const vh = window.innerHeight;
    const room = vh - header - GAP * 2;
    // Heights only change with the width and once the fonts land; refreshes in between reuse them (each measure
    // forces a full-page layout, and a page load runs several refreshes).
    const key = `${window.innerWidth}|${document.fonts?.status ?? ""}`;
    if (key !== heightsKey) {
      heights = options.map((o) => (o.measure ? o.measure() : o.content.offsetHeight));
      heightsKey = key;
    }
    const sized = options.map((o, i) => ({ o, h: heights[i] ?? 0 }));
    const pick = sized.find(({ h }) => h * 0.85 <= room) ?? sized[sized.length - 1];
    if (!pick) return;
    const { o, h } = pick;
    const fit = h > room ? Math.max(minFit, room / h) : 1;
    const shown = Math.ceil(h * fit);
    offset = o.content.getBoundingClientRect().top - stage.getBoundingClientRect().top;
    above = offset > 0 ? aboveOf(o.content) : [];
    if (fit < 1) {
      o.content.style.scale = String(fit);
      o.content.style.marginBottom = `${shown - h}px`;
    }
    top = Math.round(header + Math.max(GAP, (vh - header - shown) / 2) - offset);
    bottom = top + stage.offsetHeight;
    stage.style.setProperty("--pin-top", `${top}px`);
    fadeAt = top + Math.min(offset, vh * 0.35);
  };

  layout();
  ScrollTrigger.addEventListener("refreshInit", layout);
  // Fades `above` out over the last stretch of travel before the stage pins (no-op when nothing is above the frame).
  const fader = track
    ? ScrollTrigger.create({
        trigger: track,
        start: () => `top ${fadeAt}px`,
        end: () => `top ${top}px`,
        invalidateOnRefresh: true,
        onUpdate: (self) => fade(self.progress),
        onRefresh: (self) => fade(self.progress),
      })
    : undefined;
  return {
    start: () => `top ${top}px`,
    end: () => `bottom ${bottom}px`,
    destroy: () => {
      ScrollTrigger.removeEventListener("refreshInit", layout);
      fader?.kill();
      reset();
      stage.removeAttribute("data-pinned");
    },
  };
}
