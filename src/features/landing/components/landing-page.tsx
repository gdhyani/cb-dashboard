import { AdminControls } from "./admin-controls";
import { AgentSection } from "./agent-section";
import { FactsStrip } from "./facts-strip";
import { GetStarted } from "./get-started";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { LandingMotion } from "./landing-motion";
import { LeakStories } from "./leak-stories";
import { PlaceholderStory } from "./placeholder-story";
import { ServicesHub } from "./services-hub";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ThemeDock } from "./theme-dock";
import { TwoRoutes } from "./two-routes";
import { ValueKinds } from "./value-kinds";

/**
 * The public product page at `/` (signed-out visitors). Its own look: never the dashboard design system.
 * Story order: the problem (leaks, AI agents) → how cb stops it → where placeholder keys come from → details → start.
 */
export function LandingPage() {
  return (
    <div className="lp-root" data-landing="" id="top">
      <a className="lp-skip" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Hero />
        <LeakStories />
        <AgentSection />
        <HowItWorks />
        <PlaceholderStory />
        <TwoRoutes />
        <ValueKinds />
        <ServicesHub />
        <AdminControls />
        <FactsStrip />
        <GetStarted />
      </main>
      <SiteFooter />
      <ThemeDock />
      <LandingMotion />
    </div>
  );
}
