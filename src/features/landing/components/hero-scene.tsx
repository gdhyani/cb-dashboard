"use client";

import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { scene } from "../content-story";
import { prefersReducedMotion } from "../motion/env";
import { SceneArt } from "./scene-art";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

/**
 * The hero's signature, told by scroll (nothing to click). At rest the scene shows the problem: real keys in a .env,
 * red pulses running out to five readers. As the visitor scrolls (desktop): the hero copy steps aside, the scene glides
 * from the right to the centre and pins, a scan line sweeps from top to bottom and everything above it becomes the
 * "with cb" picture (placeholders, readers struck through, only the gateway lit); then the scene fades for the next
 * section. Phones: the same sweep runs while the scene scrolls past, without the move. Reduced motion: both states,
 * one under the other.
 */
export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const hero = el?.closest<HTMLElement>(".lp-hero");
    const copy = hero?.querySelector<HTMLElement>(".lp-hero__copy");
    if (!el || !hero || !copy || prefersReducedMotion()) return;
    const overlay = el.querySelector<HTMLElement>("[data-overlay]");
    const scan = el.querySelector<HTMLElement>("[data-scan]");
    const layers = el.querySelector<HTMLElement>("[data-layers]");
    const captions = Array.from(el.querySelectorAll<HTMLElement>("[data-caption]"));
    if (!overlay || !scan || !layers) return;
    const base = el.querySelector<SVGSVGElement>('.lp-art[data-mode="without"]');
    const legs = Array.from(base?.querySelectorAll<SVGPathElement>("[data-leg]") ?? []);
    const pulses = Array.from(base?.querySelectorAll<SVGCircleElement>("[data-pulse]") ?? []);

    const ctx = gsap.context(() => {
      // Idle: the problem keeps happening, red pulses run from the .env to every reader.
      const idle = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      pulses.forEach((p, i) => {
        const path = legs[i];
        if (!path) return;
        idle.fromTo(
          p,
          { opacity: 1 },
          {
            opacity: 1,
            duration: 1.2,
            ease: "power2.inOut",
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
            onComplete: () => {
              gsap.set(p, { opacity: 0 });
            },
          },
          i * 0.15,
        );
      });

      const sweep = (tl: gsap.core.Timeline, at: number, length: number) => {
        tl.fromTo(
          scan,
          { y: 0, autoAlpha: 1 },
          { y: () => layers.offsetHeight, ease: "none", duration: length, immediateRender: false },
          at,
        )
          .fromTo(
            overlay,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: length },
            at,
          )
          .to(scan, { autoAlpha: 0, duration: 0.04 }, at + length)
          .to(captions[0] ?? {}, { autoAlpha: 0, duration: 0.05 }, at + length * 0.5)
          .fromTo(captions[1] ?? {}, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, at + length * 0.5);
      };

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1101px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        // 1. The copy steps aside; the scene glides to the centre of the stage.
        tl.to(copy, { autoAlpha: 0, x: -80, duration: 0.2, ease: "power2.in" }, 0).to(
          el,
          {
            x: () => {
              const stage = el.offsetParent as HTMLElement | null;
              const width = stage?.clientWidth ?? window.innerWidth;
              return width / 2 - (el.offsetLeft + el.offsetWidth / 2);
            },
            scale: 1.06,
            duration: 0.25,
            ease: "power2.inOut",
          },
          0.02,
        );
        // 2. The scan line sweeps top to bottom: above it, the picture with cb.
        sweep(tl, 0.32, 0.45);
        // 3. Hold, then hand over to the next section.
        tl.to(el, { autoAlpha: 0, y: -40, duration: 0.12, ease: "power2.in" }, 0.88);
      });
      mm.add("(max-width: 1100px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: layers,
            start: "top 65%",
            end: "bottom 35%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        sweep(tl, 0, 1);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="lp-scene">
      <figure className="lp-scene__figure" aria-label={scene.label}>
        <div className="lp-scene__layers" data-layers="">
          <SceneArt mode="without" />
          <div className="lp-scene__overlay" data-overlay="">
            <SceneArt mode="with" />
          </div>
          <div className="lp-scene__scan" data-scan="" aria-hidden="true">
            <span>cb on</span>
          </div>
        </div>
        <figcaption className="lp-scene__captions">
          <span className="lp-scene__caption" data-caption="without">
            <b>{scene.modes.without.label}.</b> {scene.modes.without.caption}
          </span>
          <span className="lp-scene__caption" data-caption="with">
            <b>{scene.modes.with.label}.</b> {scene.modes.with.caption}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
