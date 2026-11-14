import { how } from "../content";

/**
 * The explainer: a sticky figure of the path (app → preload → agent | tunnel → gateway → service) next to one
 * chapter per stop. The figure mirrors the chapters, so it is hidden from assistive tech; the chapters carry the text.
 */
export function HowItWorks() {
  const onMachine = how.chapters.filter((c) => c.where === "machine").length;
  return (
    <section id="how" className="lp-how" aria-labelledby="lp-how-title">
      <div className="lp-grid lp-how__head">
        <h2 id="lp-how-title" className="lp-h2" data-split="">
          {how.title}
        </h2>
        <p className="lp-how__intro" data-reveal="">
          {how.intro}
        </p>
      </div>
      <div className="lp-grid lp-how__body">
        <div className="lp-how__stage">
          <div className="lp-path" data-path="" data-step="0" aria-hidden="true">
            <div className="lp-path__track">
              {how.chapters.map((c, i) => (
                <div key={c.id} className="lp-path__item" data-where={c.where}>
                  {i === onMachine ? (
                    <div className="lp-path__boundary">
                      <span>{how.boundary}</span>
                    </div>
                  ) : null}
                  <div className="lp-path__node" data-node="">
                    <span className="lp-path__dot" data-node-dot="" />
                    <span className="lp-path__label">
                      <span className="lp-path__name">{c.node}</span>
                      <span className="lp-path__detail">{c.detail}</span>
                    </span>
                  </div>
                </div>
              ))}
              <div className="lp-path__caption" data-path-caption="">
                {how.chapters[0]?.node}
              </div>
              <div className="lp-packet" data-packet="" data-state="real">
                <span className="lp-packet__note" data-packet-note="">
                  real key, in your .env
                </span>
                <span className="lp-packet__label" data-packet-label="">
                  sk_live_••••••••
                </span>
              </div>
            </div>
          </div>
        </div>
        <ol className="lp-chapters">
          {how.chapters.map((c, i) => (
            <li key={c.id} className="lp-chapter" data-chapter="" data-where={c.where}>
              <span className="lp-chapter__index">
                {String(i + 1).padStart(2, "0")}
                <span className="lp-chapter__where">
                  {c.where === "machine" ? "on the developer machine" : "on the cb server"}
                </span>
              </span>
              <h3 className="lp-chapter__title">{c.title}</h3>
              <p className="lp-chapter__text">{c.text}</p>
              {c.code ? (
                <code className="lp-chapter__code" data-real={c.code.includes("sk_live") ? "" : undefined}>
                  {c.code}
                </code>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
