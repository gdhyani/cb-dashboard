/**
 * Runs `setup` once (it may return a cleanup function), when `el` comes within `margin` of the screen (one screen ahead by default), and returns a stop
 * function that runs the setup's cleanup (or cancels a setup that never ran). Sections far down the page set up their
 * GSAP motion this way instead of all at once while the page loads: every setup measures the page, and on a phone
 * dozens of those forced layouts at load were seconds of blocked main thread (PageSpeed TBT).
 */
export function whenNear(el: Element | null, setup: () => unknown, margin = "100% 0px"): () => void {
  if (!el) return () => {};
  let done = false;
  let cleanup: (() => void) | undefined;
  const io = new IntersectionObserver(
    (entries) => {
      if (done || !entries.some((e) => e.isIntersecting)) return;
      done = true;
      io.disconnect();
      const out = setup();
      if (typeof out === "function") cleanup = out as () => void;
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => {
    done = true;
    io.disconnect();
    cleanup?.();
  };
}
