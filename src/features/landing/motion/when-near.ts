type Cleanup = () => void;

/**
 * Runs `setup` once, when `el` comes within `margin` of the screen (one screen ahead by default), and returns a stop
 * function that runs the setup's cleanup (or cancels a setup that never ran). `setup` may return a cleanup function, or
 * a promise of one (it loads the motion code first, see motion/kit); a cleanup that arrives after stop runs at once.
 * Sections far down the page set up their GSAP motion this way instead of all at once while the page loads: every setup
 * measures the page, and on a phone dozens of those forced layouts at load were seconds of blocked main thread.
 */
export function whenNear(el: Element | null, setup: () => unknown, margin = "100% 0px"): () => void {
  if (!el) return () => {};
  let started = false;
  let stopped = false;
  let cleanup: Cleanup | undefined;
  const take = (out: unknown) => {
    if (typeof out !== "function") return;
    if (stopped) (out as Cleanup)();
    else cleanup = out as Cleanup;
  };
  const io = new IntersectionObserver(
    (entries) => {
      if (started || stopped || !entries.some((e) => e.isIntersecting)) return;
      started = true;
      io.disconnect();
      const out = setup();
      if (out instanceof Promise) void out.then(take);
      else take(out);
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => {
    stopped = true;
    io.disconnect();
    cleanup?.();
    cleanup = undefined;
  };
}
