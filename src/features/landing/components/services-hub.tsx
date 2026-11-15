import { ChevronDown } from "lucide-react";
import { ServiceLogo } from "@/shared/components/service-logo";
import { type Service, services } from "../content";
import { ServiceRow } from "./service-row";
import { ServicesMotion } from "./services-motion";

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
const groups = services.groups.filter((g) => g.name !== "Any other API");
const all: Service[] = groups.flatMap((g): Service[] => g.items);

/**
 * "The services your .env already talks to" as one panel: your app on the left, wired through cb in the middle, to
 * the services on the right; under it, every service in one list (on phones: one collapsed row per group, opened by
 * tap, so the page is not 23 rows long). Told by scroll: the wires draw in, the tiles light up, the list fills in one
 * service at a time, and it ends on a big "and more."
 */
export function ServicesHub() {
  const leftY = spread(services.hubLeft.length);
  const rightY = spread(services.hubRight.length);

  return (
    <section id="services" className="lp-services" aria-labelledby="lp-services-title">
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
              <ServiceRow key={s.name} service={s} beta={services.legend.beta} motion />
            ))}
          </ul>

          <div className="lp-svcgroups" data-svc-groups="">
            {groups.map((g) => (
              <details key={g.name} className="lp-svcgroup" data-svc-group="">
                <summary className="lp-svcgroup__head">
                  <span className="lp-svcgroup__name">{g.name}</span>
                  <span className="lp-svcgroup__logos" aria-hidden="true">
                    {g.items.slice(0, 4).map((s) => (
                      <span key={s.name} className="lp-svcgroup__logo">
                        <ServiceLogo icon={s.icon} />
                      </span>
                    ))}
                  </span>
                  <span className="lp-svcgroup__count">{g.items.length}</span>
                  <ChevronDown className="lp-svcgroup__chev" size={18} strokeWidth={2} aria-hidden="true" />
                </summary>
                <ul className="lp-svcgroup__list">
                  {g.items.map((s, i) => (
                    <ServiceRow key={s.name} service={s} beta={services.legend.beta} index={i} />
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="lp-more" data-more="">
            <p className="lp-more__word">{services.more}</p>
            <p className="lp-more__text">{services.moreText}</p>
          </div>
        </div>
      </div>
      <ServicesMotion sectionId="services" />
    </section>
  );
}
