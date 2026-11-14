import { agent } from "../content-story";
import { AgentDemo } from "./agent-demo";

export function AgentSection() {
  return (
    <section id="ai" className="lp-ai" aria-labelledby="lp-ai-title">
      <div className="lp-grid lp-section-head">
        <h2 id="lp-ai-title" className="lp-h2" data-split="">
          {agent.title}
        </h2>
        <p className="lp-section-head__intro" data-reveal="">
          {agent.intro}
        </p>
      </div>
      <div className="lp-grid lp-ai__body">
        <div className="lp-ai__demo">
          <AgentDemo />
        </div>
      </div>
    </section>
  );
}
