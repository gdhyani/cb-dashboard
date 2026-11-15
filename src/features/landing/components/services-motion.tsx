"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "../motion/env";
import { loadMotion } from "../motion/load";
import { whenNear } from "../motion/when-near";

/**
 * The services section's motion (the section itself is server-rendered, so its brand logos never ship as JavaScript):
 * when it comes near, the wires draw in, the tiles light up and the list fills in. Phones: a group opened or closed, so
 * every scroll story below re-measures for the new page height. The rows' entrance is CSS (`.lp-svcgroup[open]` in
 * landing.css), so it starts in the very frame the rows appear.
 */
export function ServicesMotion({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    // `toggle` does not bubble: listen in the capture phase for every <details> in the section.
    const onToggle = () => void loadMotion().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
    el.addEventListener("toggle", onToggle, true);
    const stop = whenNear(el, async () => {
      if (prefersReducedMotion()) return;
      const { gsap } = await loadMotion();
      const ctx = gsap.context(() => {
        const hub = gsap.timeline({
          scrollTrigger: { trigger: "[data-hub]", start: "top 80%", end: "bottom 45%", scrub: 0.6 },
        });
        hub
          .from(
            "[data-hub-left]",
            { autoAlpha: 0, x: -30, scale: 0.7, stagger: 0.08, duration: 0.4, ease: "back.out(2)" },
            0,
          )
          .fromTo(
            "[data-wire-in]",
            { drawSVG: "0%" },
            { drawSVG: "100%", stagger: 0.06, duration: 0.6, ease: "none" },
            0.2,
          )
          .from("[data-hub-core]", { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: "back.out(2)" }, 0.55)
          .fromTo(
            "[data-wire-out]",
            { drawSVG: "0%" },
            { drawSVG: "100%", stagger: 0.06, duration: 0.6, ease: "none" },
            0.8,
          )
          .from(
            "[data-hub-right]",
            { autoAlpha: 0, x: 30, scale: 0.7, stagger: 0.08, duration: 0.4, ease: "back.out(2)" },
            1,
          );

        gsap.from("[data-svc]", {
          autoAlpha: 0,
          y: 18,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-svc-list]", start: "top 85%", end: "bottom 70%", scrub: 0.6 },
        });
        gsap.from("[data-svc-group]", {
          autoAlpha: 0,
          y: 14,
          stagger: 0.06,
          ease: "power2.out",
          // Measured from the list's top only: opening a group makes the list taller, and an end tied to its bottom
          // would pull the revealed groups back to half opacity on the refresh that follows.
          scrollTrigger: { trigger: "[data-svc-groups]", start: "top 90%", end: "top 45%", scrub: 0.6 },
        });
        gsap.from("[data-more]", {
          autoAlpha: 0,
          yPercent: 40,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-more]", start: "top 95%", end: "top 65%", scrub: 0.6 },
        });
      }, el);
      return () => ctx.revert();
    });
    return () => {
      el.removeEventListener("toggle", onToggle, true);
      stop();
    };
  }, [sectionId]);
  return null;
}
