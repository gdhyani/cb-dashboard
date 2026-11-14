import { CopyButton } from "@/shared/components/copy-button";
import { start } from "../content";

/** The developer's onboarding, as the four commands they actually type (PRD J5). */
export function GetStarted() {
  return (
    <section id="start" className="lp-start lp-grid" aria-labelledby="lp-start-title">
      <h2 id="lp-start-title" className="lp-h2 lp-start__title" data-split="">
        {start.title}
      </h2>
      <ol className="lp-card lp-start__steps" data-reveal="stagger">
        {start.steps.map((s, i) => (
          <li key={s.cmd} className="lp-step">
            <span className="lp-step__index" aria-hidden="true">
              {i + 1}
            </span>
            <span className="lp-step__cmd">
              <code>{s.cmd}</code>
              <CopyButton value={s.cmd} label={`Copy ${s.cmd}`} className="lp-copy" />
            </span>
            <span className="lp-step__text">{s.text}</span>
          </li>
        ))}
      </ol>
      <p className="lp-start__platforms" data-reveal="">
        {start.platforms}
      </p>
    </section>
  );
}
