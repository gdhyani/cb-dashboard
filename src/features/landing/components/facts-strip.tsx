import { Braces, RefreshCw, Stethoscope, Webhook } from "lucide-react";
import { extras, facts } from "../content";

const EXTRA_ICONS = [Webhook, RefreshCw, Braces, Stethoscope];

/** Real measurements from the leak scan and the M7 benchmarks (PRD §17.4), then the smaller features. */
export function FactsStrip() {
  return (
    <section className="lp-facts" data-tone="night" aria-labelledby="lp-facts-title">
      <div className="lp-grid">
        <h2 id="lp-facts-title" className="lp-h2 lp-facts__title" data-split="">
          {facts.title}
        </h2>
      </div>
      <dl className="lp-grid lp-facts__list">
        {facts.items.map((f) => (
          <div key={`${f.value} ${f.unit}`} className="lp-card lp-fact" data-reveal="" data-spotlight="">
            <dt className="lp-fact__figure">
              <span className="lp-fact__value" data-rekey="">
                {f.value}
              </span>
              <span className="lp-fact__unit">{f.unit}</span>
            </dt>
            <dd className="lp-fact__text">{f.text}</dd>
          </div>
        ))}
      </dl>
      <div className="lp-grid lp-extras">
        <h2 className="lp-extras__title" data-reveal="">
          {extras.title}
        </h2>
        <dl className="lp-extras__list" data-reveal="stagger">
          {extras.items.map((e, i) => {
            const Icon = EXTRA_ICONS[i] ?? Braces;
            return (
              <div key={e.name} className="lp-card lp-extra" data-spotlight="">
                <dt>
                  <span className="lp-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  {e.name}
                </dt>
                <dd>{e.text}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
