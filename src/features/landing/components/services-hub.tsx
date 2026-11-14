"use client";

import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { ServiceLogo } from "@/shared/components/service-logo";
import { type Service, services } from "../content";
import { prefersReducedMotion } from "../motion/env";

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

// Hub geometry in a 1000 × 380 box; tiles are placed in % so they follow the box at any width.
const W = 1000;
const H = 380;
const HUB = { x: 500, y: 190, half: 62 };
const LEFT_X = 150;
const RIGHT_X = 850;
const spread = (n: number) => Array.from({ length: n }, (_, i) => 40 + (i * (H - 80)) / Math.max(1, n - 1));
const wireIn = (y: number) =>
  `M${LEFT_X + 30} ${y} C${LEFT_X + 190} ${y} ${HUB.x - HUB.half - 150} ${HUB.y} ${HUB.x - HUB.half} ${HUB.y}`;
const wireOut = (y: number) =>
  `M${HUB.x + HUB.half} ${HUB.y} C${HUB.x + HUB.half + 150} ${HUB.y} ${RIGHT_X - 190} ${y} ${RIGHT_X - 30} ${y}`;

// "Any other API" is the closing "and more", not a list row.
const all: Service[] = services.groups.filter((g) => g.name !== "Any other API").flatMap((g): Service[] => g.items);

/**
 * "The services your .env already talks to" as one panel: your app on the left, wired through cb in the middle, to
 * the services on the right; under it, every service in one list. Told by scroll: the wires draw in, the tiles light
 * up, the list fills in one service at a time, and it ends on a big "and more."
 */
export function ServicesHub() {
  const root = useRef<HTMLElement>(null);
  const leftY = spread(services.hubLeft.length);
  const rightY = spread(services.hubRight.length);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
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
      gsap.from("[data-more]", {
        autoAlpha: 0,
        yPercent: 40,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-more]", start: "top 95%", end: "top 65%", scrub: 0.6 },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="services" className="lp-services" aria-labelledby="lp-services-title">
      <div className="lp-grid lp-services__head">
        <h2 id="lp-services-title" className="lp-h2" data-split="">
          {services.title}
        </h2>
        <p className="lp-services__legend" data-reveal="">
          <span className="lp-chip lp-chip--beta">{services.legend.beta}</span> {services.legend.betaText}
        </p>
      </div>
      <div className="lp-grid">
        <div className="lp-card lp-hubpanel">
          <div className="lp-hub" data-hub="" aria-hidden="true">
            <svg className="lp-hub__wires" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
              {leftY.map((y) => (
                <path key={`in-${y}`} d={wireIn(y)} data-wire-in="" />
              ))}
              {rightY.map((y) => (
                <path key={`out-${y}`} d={wireOut(y)} data-wire-out="" />
              ))}
            </svg>
            {services.hubLeft.map((s, i) => (
              <span
                key={s.name}
                className="lp-hub__tile"
                data-hub-left=""
                style={{ left: `${(LEFT_X / W) * 100}%`, top: `${((leftY[i] ?? 0) / H) * 100}%` }}
              >
                <ServiceLogo icon={s.icon} />
              </span>
            ))}
            <span className="lp-hub__core" data-hub-core="" style={{ left: "50%", top: "50%" }}>
              cb
            </span>
            {services.hubRight.map((s, i) => (
              <span
                key={s.name}
                className="lp-hub__tile"
                data-hub-right=""
                style={{ left: `${(RIGHT_X / W) * 100}%`, top: `${((rightY[i] ?? 0) / H) * 100}%` }}
              >
                <ServiceLogo icon={s.icon} />
              </span>
            ))}
            <span className="lp-hub__side lp-hub__side--left">your app</span>
            <span className="lp-hub__side lp-hub__side--right">the real services</span>
          </div>

          <ul className="lp-svclist" data-svc-list="">
            {all.map((s) => (
              <li key={s.name} className="lp-svcrow" data-svc="" data-beta={s.beta ? "" : undefined}>
                <span className="lp-svcrow__logo">
                  <ServiceLogo icon={s.icon} />
                </span>
                <span className="lp-svcrow__body">
                  <span className="lp-svcrow__name">
                    {s.name}
                    {s.beta ? <span className="lp-chip lp-chip--beta">{services.legend.beta}</span> : null}
                  </span>
                  <span className="lp-svcrow__desc">{s.desc}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="lp-more" data-more="">
            <p className="lp-more__word">{services.more}</p>
            <p className="lp-more__text">{services.moreText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
