import { routes } from "../content";

type Route = (typeof routes)["layer1"];

function RouteCard({ route }: { route: Route }) {
  const last = route.flow.length - 1;
  return (
    <article className="lp-card lp-route" data-spotlight="">
      <span className="lp-route__label">{route.label}</span>
      <h3 className="lp-route__name">{route.name}</h3>
      <p className="lp-route__text">{route.text}</p>
      <ol className="lp-route__flow" aria-label="Where the connection goes">
        {route.flow.map((step, i) => (
          <li key={step} className="lp-route__step" data-kind={i === 0 ? "app" : i === last ? "service" : "cb"}>
            <span className="lp-route__chip">{step}</span>
          </li>
        ))}
      </ol>
      <pre className="lp-code">
        <code>
          {route.code.map((line) => (
            <span key={line} className="lp-code__line">
              {line}
            </span>
          ))}
        </code>
      </pre>
    </article>
  );
}

/** The two routing layers as two equal cards, each with the path its connection takes. */
export function TwoRoutes() {
  return (
    <section className="lp-routes" aria-labelledby="lp-routes-title">
      <div className="lp-grid">
        <h2 id="lp-routes-title" className="lp-h2 lp-routes__title" data-split="">
          {routes.title}
        </h2>
      </div>
      <div className="lp-grid lp-routes__cards" data-reveal="stagger">
        <RouteCard route={routes.layer1} />
        <RouteCard route={routes.layer2} />
      </div>
    </section>
  );
}
