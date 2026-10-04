/** Reduced-motion users keep native, instant scrolling. */
export function prefersSmoothScroll(
  matchMedia: (query: string) => { matches: boolean } = (query) => window.matchMedia(query),
) {
  return !matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Radix dialogs/sheets lock page scroll by setting `data-scroll-locked` on <body>; the smooth scroller must pause
 * then, or the wheel would move the page behind the overlay. Returns a cleanup function.
 */
export function watchScrollLock(lenis: { stop(): void; start(): void }, body: HTMLElement): () => void {
  let locked = false;
  const sync = () => {
    const now = body.hasAttribute("data-scroll-locked");
    if (now === locked) return;
    locked = now;
    if (now) lenis.stop();
    else lenis.start();
  };
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(body, { attributes: true, attributeFilter: ["data-scroll-locked"] });
  return () => observer.disconnect();
}
