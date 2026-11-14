import {
  Bug,
  CloudUpload,
  FileWarning,
  GitBranch,
  type LucideIcon,
  MessageSquare,
  MonitorUp,
  Skull,
} from "lucide-react";
import { type Leak, leaks, MASK, withStandIns } from "../content-story";

/** Destination art: what each place the key ends up actually is. */
const DESTINATIONS: Record<string, LucideIcon> = {
  "collect.example.net": Skull,
  "log vendor": CloudUpload,
  "error tracker": Bug,
  "crash report": FileWarning,
  "git history": GitBranch,
  chat: MessageSquare,
  "screen share": MonitorUp,
};

function Terminal({ leak, withCb }: { leak: Leak; withCb: boolean }) {
  return (
    <div className="lp-term" data-cb={withCb ? "" : undefined}>
      <div className="lp-term__bar" aria-hidden="true">
        <span />
        <span />
        <span />
        {withCb ? <b className="lp-term__badge">with cb</b> : null}
        <em>{leak.window}</em>
      </div>
      <pre className="lp-term__body">
        {leak.lines.map((line) => {
          const text = withCb ? withStandIns(line.text) : line.text;
          const tone = withCb && line.tone === "hot" ? "safe" : (line.tone ?? "dim");
          return (
            <span key={line.text} className="lp-term__line" data-tone={tone} data-line={withCb ? undefined : ""}>
              {text}
            </span>
          );
        })}
      </pre>
    </div>
  );
}

/**
 * Four everyday leaks, each told by scroll (motion/start-landing.ts, [data-leak]): the row slides in from the right
 * and its terminal types out the problem; a scan line then sweeps it top to bottom into the same terminal with cb
 * (real keys become placeholders) and the destinations flip from "holds your key" to "gets a placeholder"; then the row
 * fades as the next one takes over. The "with cb" terminal is a second, clipped layer (hidden from assistive tech;
 * the sentence under the title says the same).
 */
export function LeakStories() {
  return (
    <section id="leaks" className="lp-leaks" aria-labelledby="lp-leaks-title">
      <div className="lp-grid lp-section-head lp-section-head--wide" data-rule="hot">
        <h2 id="lp-leaks-title" className="lp-h2" data-split="">
          {leaks.title}
        </h2>
        <p className="lp-section-head__intro" data-reveal="">
          {leaks.intro}
        </p>
      </div>
      <ol className="lp-leaks__list">
        {leaks.items.map((leak, i) => (
          <li key={leak.id} className="lp-leak lp-grid" data-leak="" data-side={i % 2 ? "right" : "left"}>
            <div className="lp-leak__copy">
              <span className="lp-leak__count">
                {i + 1} / {leaks.items.length}
              </span>
              <h3 className="lp-leak__title">{leak.title}</h3>
              <p className="lp-leak__text">{leak.text}</p>
              <p className="lp-leak__cb">
                <span className="lp-leak__cb-label">With cb</span> {leak.withCb}
              </p>
            </div>
            <div className="lp-leak__stage" data-leak-stage="">
              <div className="lp-leak__layers">
                <Terminal leak={leak} withCb={false} />
                <div className="lp-leak__overlay" data-leak-overlay="" aria-hidden="true">
                  <Terminal leak={leak} withCb />
                </div>
                <div className="lp-scene__scan lp-leak__scan" data-leak-scan="" aria-hidden="true">
                  <span>cb on</span>
                </div>
              </div>
              <div className="lp-leak__dests">
                {/* A spine from the terminal down the left, with a branch into each card: always attached. */}
                <span className="lp-leak__spine" data-leak-wire="" aria-hidden="true" />
                <ul className="lp-leak__to" aria-label="Where the key ends up">
                  {leak.to.map((t) => {
                    const Icon = DESTINATIONS[t] ?? CloudUpload;
                    return (
                      <li key={t} className="lp-dest" data-leak-to="">
                        <span className="lp-dest__art" aria-hidden="true">
                          <Icon size={20} strokeWidth={1.6} />
                        </span>
                        <span className="lp-dest__body">
                          <span className="lp-dest__name">{t}</span>
                          <span className="lp-dest__holds lp-dest__holds--hot">now holds sk_live_{MASK}</span>
                          <span className="lp-dest__holds lp-dest__holds--safe">gets a useless placeholder</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
