import type { CSSProperties } from "react";
import { ServiceLogo } from "@/shared/components/service-logo";
import type { Service } from "../content";

/** One service in the services list: logo, name (with a Beta chip when not yet run for real) and a one-line note. */
export function ServiceRow({
  service,
  beta,
  motion,
  index,
}: {
  service: Service;
  beta: string;
  /** Revealed by the scrubbed list animation. */
  motion?: boolean;
  /** Position inside an opened group: staggers its CSS entrance. */
  index?: number;
}) {
  return (
    <li
      className="lp-svcrow"
      data-svc={motion ? "" : undefined}
      data-beta={service.beta ? "" : undefined}
      style={index === undefined ? undefined : ({ "--i": index } as CSSProperties)}
    >
      <span className="lp-svcrow__logo">
        <ServiceLogo icon={service.icon} />
      </span>
      <span className="lp-svcrow__body">
        <span className="lp-svcrow__name">
          {service.name}
          {service.beta ? <span className="lp-chip lp-chip--beta">{beta}</span> : null}
        </span>
        <span className="lp-svcrow__desc">{service.desc}</span>
      </span>
    </li>
  );
}
