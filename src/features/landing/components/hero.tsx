import { CopyButton } from "@/shared/components/copy-button";
import { hero } from "../content";
import { FillLink } from "./fill-link";
import { HeroScene } from "./hero-scene";

export function Hero() {
  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-hero__stage lp-grid">
        <div className="lp-hero__copy">
          <p className="lp-hero__kicker" data-reveal="" data-intro="">
            {hero.kicker}
          </p>
          <h1 id="lp-hero-title" className="lp-display lp-hero__title lp-rise">
            {hero.title}
          </h1>
          <p className="lp-hero__lede lp-rise lp-rise--late">{hero.lede}</p>
          <div className="lp-hero__actions" data-reveal="" data-intro="" data-delay="0.4">
            <FillLink href={hero.primary.href} label={hero.primary.label} />
            <FillLink href={hero.secondary.href} label={hero.secondary.label} variant="secondary" />
          </div>
          <div className="lp-install" data-reveal="" data-intro="" data-delay="0.5">
            <code>{hero.install}</code>
            <CopyButton value={hero.install} label="Copy install command" className="lp-copy" />
          </div>
        </div>
        <div className="lp-hero__scene">
          <HeroScene />
        </div>
      </div>
    </section>
  );
}
