import { kinds } from "../content";

/** The four variable types as cards; hovering or focusing one re-keys its example. */
export function ValueKinds() {
  return (
    <section className="lp-kinds" aria-labelledby="lp-kinds-title">
      <div className="lp-grid">
        <h2 id="lp-kinds-title" className="lp-h2 lp-kinds__title" data-split="">
          {kinds.title}
        </h2>
      </div>
      <ul className="lp-grid lp-kinds__grid" data-reveal="stagger">
        {kinds.rows.map((row) => (
          <li key={row.name} className="lp-card lp-kind" data-row="" data-kind={row.name} data-spotlight="">
            <h3 className="lp-kind__name">{row.name}</h3>
            <p className="lp-kind__sees">
              <span className="lp-kind__label">The developer gets</span> {row.sees}
            </p>
            <p className="lp-kind__text">{row.text}</p>
            <code className="lp-kind__example" data-row-value="">
              {row.example}
            </code>
          </li>
        ))}
      </ul>
    </section>
  );
}
