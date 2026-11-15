import { InlineCopyButton } from "@/shared/components/inline-copy-button";
import { hero } from "../content";
import { FillLink } from "./fill-link";
import { HeroScene } from "./hero-scene";

export function Hero() {
  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-hero__stage lp-grid">
        <div className="lp-hero__copy">
          <p className="lp-hero__kicker lp-rise">{hero.kicker}</p>
          <h1 id="lp-hero-title" className="lp-display lp-hero__title lp-rise">
            {hero.title}
          </h1>
          <p className="lp-hero__lede lp-rise lp-rise--late">{hero.lede}</p>
          <div className="lp-hero__actions lp-rise lp-rise--late">
            <FillLink href={hero.primary.href} label={hero.primary.label} />
            <FillLink href={hero.secondary.href} label={hero.secondary.label} variant="secondary" />
          </div>
          <div className="lp-install lp-rise lp-rise--later">
            <code>{hero.install}</code>
            <InlineCopyButton value={hero.install} label="Copy install command" className="lp-copy" />
          </div>
        </div>
        <div className="lp-hero__scene">
          <HeroScene />
        </div>
      </div>
    </section>
  );
}
