"use client";

import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { agent } from "../content-story";
import { centerPin } from "../motion/center-pin";
import { prefersReducedMotion } from "../motion/env";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger);

type Mode = "without" | "with";
/** Share of the scroll spent typing the session; past SWITCH the same session re-keys into placeholders. */
const TYPE_END = 0.45;
const SWITCH = 0.6;

/**
 * An AI coding agent fixing a bug, told by scroll (no controls), on every screen size the same way: the demo pins in
 * the vertical centre of the screen together with its heading (.lp-ai__body is tall, .lp-ai__pin is sticky at its
 * own height, see centerPin).
 * First the session types out (it reads .env, writes a debug line, commits) and "where the key is now" lights up red;
 * past the switch point the SAME session re-keys into placeholders and the list and verdict turn yellow. Scrolling back
 * reverses it. On small screens the demo is scaled down just enough to fit the screen (--fit).
 */
export function AgentDemo() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const body = el?.closest<HTMLElement>(".lp-ai__body");
    const stage = el?.closest<HTMLElement>(".lp-ai__pin");
    const inner = el?.closest<HTMLElement>(".lp-ai__inner");
    if (!el || !body || !stage || !inner) return;
    const reduced = prefersReducedMotion();
    const steps = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    const values = Array.from(el.querySelectorAll<HTMLElement>("[data-agent-value]"));
    const where = Array.from(el.querySelectorAll<HTMLElement>("[data-where]"));
    const verdict = el.querySelector<HTMLElement>("[data-verdict]");
    const phases = Array.from(el.querySelectorAll<HTMLElement>("[data-phase]"));
    const fill = el.querySelector<HTMLElement>("[data-phase-fill]");
    const envSteps = agent.steps.filter((s) => s.kind === "env");
    let mode: Mode = "without";

    // Measured in the demo's TALLER state: placeholders and the "with cb" verdict wrap to more lines than real keys.
    const measure = (node: HTMLElement) => () => {
      const saved = values.map((v) => v.textContent);
      const savedVerdict = verdict?.textContent ?? "";
      const heights: number[] = [];
      for (const m of ["without", "with"] as Mode[]) {
        values.forEach((v, i) => {
          const s = envSteps[i];
          if (s && s.kind === "env") v.textContent = m === "with" ? s.standIn : s.real;
        });
        if (verdict) verdict.textContent = agent.verdict[m];
        heights.push(node.offsetHeight);
      }
      values.forEach((v, i) => {
        v.textContent = saved[i] ?? "";
      });
      if (verdict) verdict.textContent = savedVerdict;
      return Math.max(...heights) + el.offsetHeight * 0.02;
    };
    let pinned: ReturnType<typeof centerPin> | undefined;

    const ctx = gsap.context(() => {
      const write = (m: Mode, animate: boolean) =>
        values.forEach((v, i) => {
          const s = envSteps[i];
          if (s?.kind !== "env") return;
          const text = m === "with" ? s.standIn : s.real;
          gsap.killTweensOf(v);
          if (!animate) v.textContent = text;
          else
            gsap.to(v, {
              duration: 0.9,
              delay: i * 0.1,
              scrambleText: { text, chars: "abcdefghijklmnopqrstuvwxyz-_•", speed: 0.5 },
            });
        });
      const setMode = (m: Mode, animate: boolean) => {
        if (m === mode && animate) return;
        mode = m;
        el.dataset.mode = m;
        if (verdict) verdict.textContent = agent.verdict[m];
        for (const p of phases) p.dataset.on = p.dataset.phase === m ? "true" : "false";
        write(m, animate);
      };

      setMode("without", false);
      // Heading + demo together when they fit the screen; otherwise (phones, short screens) the demo alone.
      const pin = centerPin(stage, [
        { content: inner, measure: measure(inner) },
        { content: el, measure: measure(el) },
      ]);
      pinned = pin;

      if (reduced) {
        ScrollTrigger.create({
          trigger: body,
          start: "top 45%",
          end: pin.end,
          onUpdate: (self) => setMode(self.progress >= SWITCH ? "with" : "without", false),
        });
        return;
      }

      // Typing, scrubbed by scroll: each line clips in from the left (stepped like a terminal), then the list lights.
      const typing = gsap.timeline({ paused: true });
      for (const step of steps) {
        const kind = step.dataset.step;
        if (kind === "env" || kind === "code")
          typing.fromTo(
            step,
            { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" },
            { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "steps(24)" },
          );
        else typing.fromTo(step, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" });
      }
      typing.fromTo(where, { autoAlpha: 0.35, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.15 });
      if (verdict) typing.fromTo(verdict, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });

      ScrollTrigger.create({
        trigger: body,
        start: "top 45%",
        end: pin.end,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          typing.progress(Math.min(1, p / TYPE_END));
          if (fill) gsap.set(fill, { scaleX: p });
          setMode(p >= SWITCH ? "with" : "without", true);
        },
      });
    }, el);
    return () => {
      pinned?.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root} className="lp-agent" data-mode="without">
      <div className="lp-phases" aria-hidden="true">
        <span className="lp-phases__item" data-phase="without" data-on="true">
          1 · {agent.toggle.without}
        </span>
        <span className="lp-phases__track">
          <span className="lp-phases__fill" data-phase-fill="" />
        </span>
        <span className="lp-phases__item" data-phase="with" data-on="false">
          2 · {agent.toggle.with}
        </span>
      </div>
      <div className="lp-agent__grid">
        <div className="lp-term lp-agent__term">
          <div className="lp-term__bar" aria-hidden="true">
            <span />
            <span />
            <span />
            <em>{agent.window}</em>
          </div>
          <ol className="lp-agent__steps">
            {agent.steps.map((s, i) => {
              const key = `${s.kind}-${i}`;
              if (s.kind === "user")
                return (
                  <li key={key} className="lp-agent__user" data-step="user">
                    <span aria-hidden="true">›</span> {s.text}
                  </li>
                );
              if (s.kind === "say")
                return (
                  <li key={key} className="lp-agent__say" data-step="say">
                    <span className="lp-agent__dot" aria-hidden="true" /> {s.text}
                  </li>
                );
              if (s.kind === "tool")
                return (
                  <li key={key} className="lp-agent__tool" data-step="tool">
                    <b>{s.name}</b>({s.arg})
                  </li>
                );
              if (s.kind === "env")
                return (
                  <li key={key} className="lp-agent__env" data-step="env">
                    <span className="lp-agent__env-key">{s.key}=</span>
                    <span className="lp-agent__env-value" data-agent-value="">
                      {s.real}
                    </span>
                  </li>
                );
              return (
                <li key={key} className="lp-agent__code" data-step="code">
                  {s.text}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="lp-agent__where">
          <h3 className="lp-agent__where-title">{agent.whereTitle}</h3>
          <ul>
            {agent.where.map((w) => (
              <li key={w} data-where="">
                <span className="lp-agent__where-mark" aria-hidden="true" />
                {w}
              </li>
            ))}
          </ul>
          <p className="lp-agent__verdict" data-verdict="" aria-live="polite">
            {agent.verdict.without}
          </p>
        </div>
      </div>
    </div>
  );
}
