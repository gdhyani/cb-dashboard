"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Power } from "lucide-react";
import { useEffect, useRef } from "react";
import { admin } from "../content";
import { type CenterPin, centerPin } from "../motion/center-pin";
import { prefersReducedMotion } from "../motion/env";
import { whenNear } from "../motion/when-near";

gsap.registerPlugin(ScrollTrigger);

const STEP = 0.38; // demo seconds between closed connections (cb's real bound is 5 s)
/** Scroll windows (share of the pinned scroll): live → the admin's action → connections close → banner. */
const ACTION = [0.18, 0.4] as const;
const CLOSE = [0.45, 0.8] as const;
const BANNER = 0.84;

const span = (p: number, [a, b]: readonly [number, number]) => gsap.utils.clamp(0, 1, (p - a) / (b - a));

/**
 * "Access you can take back in seconds", told by scroll (no buttons). While the section is pinned: the three
 * connections are live; an admin's "turn off access" action fills in, with its reason; the connections close one by
 * one, each showing the error that client really gets, while the clock counts; then the banner the developer sees.
 * Scrolling back reverses it. Desktop pins the whole section ([data-revoke-track]); phones pin the demo alone. Text
 * never changes through React: both states of every row are rendered and CSS shows one.
 */
export function RevokeDemo() {
  const root = useRef<HTMLDivElement>(null);
  const { demo } = admin;

  // Set up when the section comes near the screen, not while the page loads (see whenNear).
  useEffect(
    () =>
      whenNear(root.current, () => {
        const el = root.current;
        if (!el) return;
        const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-revoke-row]"));
        const clock = el.querySelector<HTMLElement>("[data-revoke-clock]");
        const fill = el.querySelector<HTMLElement>("[data-revoke-fill]");
        const action = el.querySelector<HTMLElement>("[data-revoke-action]");
        if (!clock || !fill || !action) return;
        const total = rows.length;

        const render = (p: number) => {
          const a = span(p, ACTION);
          gsap.set(fill, { scaleX: a });
          action.dataset.state = a <= 0 ? "idle" : a < 1 ? "pressing" : "done";
          const c = span(p, CLOSE);
          clock.textContent = `${(c * STEP * total).toFixed(1)} s`;
          rows.forEach((r, i) => {
            r.toggleAttribute("data-closed", c * total >= i + 0.5);
          });
          el.dataset.phase = p >= BANNER ? "revoked" : c > 0 ? "revoking" : "live";
        };

        if (prefersReducedMotion()) {
          render(1);
          return;
        }
        const mm = gsap.matchMedia();
        // The pinned box is sticky at its own height in the screen's centre (see centerPin); the story runs while pinned.
        const pin = (
          trigger: Element | null,
          stage: HTMLElement | null,
          content: HTMLElement | null,
          minFit: number,
        ) => {
          if (!trigger || !stage || !content) return;
          render(0);
          const p: CenterPin = centerPin(stage, [{ content }], { minFit });
          ScrollTrigger.create({
            trigger,
            start: p.start,
            end: p.end,
            invalidateOnRefresh: true,
            onUpdate: (self) => render(self.progress),
          });
          return () => p.destroy();
        };
        // Desktop pins the whole section; phones pin only the demo (the copy and cards are too tall to pin with it).
        mm.add("(min-width: 961px)", () =>
          pin(
            el.closest("[data-revoke-track]"),
            el.closest<HTMLElement>(".lp-admin__stage"),
            el.closest<HTMLElement>(".lp-admin__inner"),
            0.7,
          ),
        );
        mm.add("(max-width: 960px)", () =>
          pin(el.closest(".lp-admin__demo"), el.closest<HTMLElement>(".lp-admin__demo-stage"), el, 1),
        );
        return () => mm.revert();
      }),
    [],
  );

  return (
    <div ref={root} className="lp-demo" data-phase="live">
      <div className="lp-demo__head">
        <span className="lp-demo__label">{demo.label}</span>
        <span className="lp-demo__clock" data-revoke-clock="" aria-hidden="true">
          0.0 s
        </span>
      </div>
      <ul className="lp-demo__rows">
        {demo.rows.map((row) => (
          <li key={row.service} className="lp-demo__row" data-revoke-row="">
            <span className="lp-demo__status" aria-hidden="true" />
            <span className="lp-demo__service">{row.service}</span>
            <span className="lp-demo__detail">{row.detail}</span>
            <span className="lp-demo__state">
              <span className="lp-demo__open">open</span>
              <span className="lp-demo__error">{row.error}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="lp-demo__banner">{demo.banner}</p>
      <div className="lp-demo__foot">
        <div className="lp-demo__action" data-revoke-action="" data-state="idle">
          <span className="lp-demo__action-fill" data-revoke-fill="" aria-hidden="true" />
          <span className="lp-demo__action-icon" aria-hidden="true">
            <Power size={15} strokeWidth={2.25} />
          </span>
          <span className="lp-demo__action-text">
            <b>
              {demo.action.who} · {demo.action.what}
            </b>
            <span>{demo.action.reason}</span>
          </span>
          <span className="lp-demo__action-done" aria-hidden="true">
            <Check size={14} strokeWidth={3} />
            {demo.action.done}
          </span>
        </div>
        <p className="lp-demo__caption">{demo.caption}</p>
      </div>
    </div>
  );
}
