import { agent } from "../content-story";
import { AgentDemo } from "./agent-demo";

/**
 * The AI agent story. The heading and the demo pin TOGETHER (.lp-ai__pin is sticky, .lp-ai__inner is what centerPin
 * centres and scales), so the pinned screen is one full frame instead of a demo floating in empty space.
 */
export function AgentSection() {
  return (
    <section id="ai" className="lp-ai" aria-labelledby="lp-ai-title">
      <div className="lp-ai__body">
        <div className="lp-ai__pin">
          <div className="lp-ai__inner">
            <div className="lp-grid lp-section-head">
              <h2 id="lp-ai-title" className="lp-h2" data-split="">
                {agent.title}
              </h2>
              <p className="lp-section-head__intro" data-reveal="">
                {agent.intro}
              </p>
            </div>
            <div className="lp-grid">
              <div className="lp-ai__demo">
                <AgentDemo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
