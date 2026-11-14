"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Lock, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { placeholders } from "../content-story";
import { prefersReducedMotion } from "../motion/env";

gsap.registerPlugin(ScrollTrigger);

const STEPS = placeholders.steps.length;

/**
 * "Where placeholder keys come from", told by scroll in four steps, the same way on every screen size: the section
 * pins in the middle of the screen and one figure (the cb server card and the devices under it) builds up as the
 * steps advance. 1: the real key goes in, encrypted. 2: Maya's device + environment + service + the server secret
 * make her placeholder. 3: Ravi's device gets a different one. 4: Maya's placeholder copied to another device is
 * refused. Scrolling back reverses it. No controls. Under reduced motion everything is shown at once, as a list.
 */
export function PlaceholderStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    const body = el?.querySelector<HTMLElement>("[data-keys-body]");
    const stage = el?.querySelector<HTMLElement>("[data-keys-stage]");
    const fitBox = el?.querySelector<HTMLElement>("[data-keys-fit]");
    if (!el || !body || !stage || !fitBox) return;
    if (prefersReducedMotion()) {
      el.dataset.static = "";
      return;
    }
    const steps = Array.from(el.querySelectorAll<HTMLElement>("[data-keys-step]"));
    let active = -1;
    const setStep = (i: number) => {
      if (i === active) return;
      active = i;
      el.dataset.step = String(i);
      steps.forEach((s, k) => {
        s.dataset.on = k === i ? "true" : "false";
        s.dataset.done = k < i ? "true" : "false";
      });
    };

    // Shrink the figure just enough to fit short screens (never grows it).
    const fitToScreen = () => {
      fitBox.style.setProperty("--fit", "1");
      const cs = getComputedStyle(stage);
      const room = stage.clientHeight - Number.parseFloat(cs.paddingTop) - Number.parseFloat(cs.paddingBottom);
      const need = fitBox.scrollHeight;
      fitBox.style.setProperty("--fit", String(need > room ? Math.max(0.62, room / need) : 1));
    };

    const ctx = gsap.context(() => {
      setStep(0);
      fitToScreen();
      ScrollTrigger.addEventListener("refresh", fitToScreen);

      // One scrubbed timeline, one unit per step; each step animates in its first ~60% and then holds.
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      // 1 · the real key goes into the server, then the lock closes on it.
      tl.fromTo("[data-keys-vault]", { autoAlpha: 0, x: -36 }, { autoAlpha: 1, x: 0, duration: 0.35 }, 0.05)
        .fromTo("[data-keys-lock]", { scale: 1.6, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.2 }, 0.35)
        .fromTo("[data-keys-note]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.45);
      // 2 · the four ingredients light up one by one, the wire drops, Maya's placeholder types out.
      tl.fromTo(
        "[data-keys-part]",
        { autoAlpha: 0, y: 10, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.14, stagger: 0.07, ease: "back.out(2)" },
        1.0,
      )
        .fromTo("[data-keys-wire]", { scaleY: 0 }, { scaleY: 1, duration: 0.15, ease: "none" }, 1.35)
        .fromTo("[data-keys-row='0']", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 1.45)
        .fromTo(
          "[data-keys-row='0'] [data-keys-value]",
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.15, ease: "steps(20)" },
          1.5,
        );
      tl.fromTo("[data-keys-footnote]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 1.7);
      // 3 · the recipe's device changes to Ravi's, and Ravi's own placeholder appears.
      tl.to("[data-keys-device='0']", { autoAlpha: 0, yPercent: -60, duration: 0.12 }, 2.05)
        .fromTo(
          "[data-keys-device='1']",
          { autoAlpha: 0, yPercent: 60 },
          { autoAlpha: 1, yPercent: 0, duration: 0.12 },
          2.1,
        )
        .fromTo("[data-keys-row='1']", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 2.3)
        .fromTo(
          "[data-keys-row='1'] [data-keys-value]",
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.15, ease: "steps(20)" },
          2.35,
        );
      // 4 · Maya's placeholder, copied to another device, is refused.
      tl.to("[data-keys-recipe]", { autoAlpha: 0.45, duration: 0.1 }, 3.0)
        .fromTo("[data-keys-row='2']", { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.15 }, 3.05)
        .fromTo(
          "[data-keys-row='2'] [data-keys-verdict]",
          { autoAlpha: 0, scale: 0.6 },
          { autoAlpha: 1, scale: 1, duration: 0.12, ease: "back.out(3)" },
          3.18,
        )
        // Pad the timeline to exactly one unit per step, so progress maps 1:1 to the scroll.
        .to({}, { duration: 0.01 }, STEPS - 0.01);

      ScrollTrigger.create({
        trigger: body,
        start: "top 55%",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const t = self.progress * STEPS;
          tl.progress(t / STEPS);
          setStep(Math.min(STEPS - 1, Math.floor(t)));
        },
      });
    }, el);
    return () => {
      ScrollTrigger.removeEventListener("refresh", fitToScreen);
      ctx.revert();
    };
  }, []);

  const { recipe } = placeholders;
  return (
    <section ref={root} id="placeholders" className="lp-keys" aria-labelledby="lp-keys-title" data-step="0">
      <div className="lp-grid lp-section-head lp-section-head--wide" data-rule="cold">
        <h2 id="lp-keys-title" className="lp-h2" data-split="">
          {placeholders.title}
        </h2>
        <p className="lp-section-head__intro" data-reveal="">
          {placeholders.intro}
        </p>
      </div>
      <div className="lp-keys__body" data-keys-body="">
        <div className="lp-keys__stage" data-keys-stage="">
          <div className="lp-grid lp-keys__fit" data-keys-fit="">
            <ol className="lp-keys__steps">
              {placeholders.steps.map((s, i) => (
                <li key={s.title} className="lp-keys__step" data-keys-step="" data-on={i === 0} data-done="false">
                  <span className="lp-keys__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="lp-keys__copy">
                    <h3 className="lp-keys__title">{s.title}</h3>
                    <p className="lp-keys__text">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="lp-keys__figure">
              <div className="lp-keys__server" aria-hidden="true">
                <span className="lp-keys__server-name">{placeholders.server}</span>
                <div className="lp-keys__vault" data-keys-vault="">
                  <span className="lp-keys__lock" data-keys-lock="">
                    <Lock size={16} strokeWidth={2.25} />
                  </span>
                  <span className="lp-keys__vault-label">{placeholders.vault.label}</span>
                  <code className="lp-keys__real">{placeholders.vault.value}</code>
                  <span className="lp-keys__vault-note" data-keys-note="">
                    {placeholders.vault.note}
                  </span>
                </div>
                <div className="lp-keys__recipe" data-keys-recipe="">
                  <span className="lp-keys__recipe-label">{recipe.label}</span>
                  <div className="lp-keys__parts">
                    <span className="lp-keys__part lp-keys__part--device" data-keys-part="">
                      {recipe.devices.map((d, i) => (
                        <span key={d} className="lp-keys__device" data-keys-device={i}>
                          {d}
                        </span>
                      ))}
                    </span>
                    <span className="lp-keys__plus">+</span>
                    <span className="lp-keys__part" data-keys-part="">
                      {recipe.env}
                    </span>
                    <span className="lp-keys__plus">+</span>
                    <span className="lp-keys__part" data-keys-part="">
                      {recipe.service}
                    </span>
                    <span className="lp-keys__plus">+</span>
                    <span className="lp-keys__part lp-keys__part--secret" data-keys-part="">
                      <Lock size={12} strokeWidth={2.5} />
                      {recipe.secret}
                    </span>
                  </div>
                </div>
              </div>
              <span className="lp-keys__wire" data-keys-wire="" aria-hidden="true" />
              <ul className="lp-keys__issued" aria-hidden="true">
                {placeholders.issued.map((l, i) => (
                  <li key={l.device} className="lp-keys__row" data-keys-row={i} data-ok={l.ok}>
                    <span className="lp-keys__device-name">
                      {l.device}
                      {l.ok ? null : <em>{placeholders.copied}</em>}
                    </span>
                    <code className="lp-keys__value" data-keys-value="">
                      {l.value}
                    </code>
                    <span className="lp-keys__verdict" data-keys-verdict="">
                      {l.ok ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                      {l.verdict}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="lp-keys__footnote" data-keys-footnote="">
                {placeholders.footnote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
