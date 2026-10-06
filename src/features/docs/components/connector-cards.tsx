import Link from "next/link";
import { ServiceLogo } from "@/shared/components/service-logo";
import { CONNECTORS, type ConnectorGroup, connectorHref } from "../lib/connectors";
import { StatusBadge } from "./status-badge";

/** Grid of connector pages with logos and Beta badges (FR-DOC-006). */
export function ConnectorCards({ group }: { group?: ConnectorGroup }) {
  const list = group ? CONNECTORS.filter((c) => c.group === group) : CONNECTORS;
  return (
    <div className="not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c) => (
        <Link
          key={c.slug}
          href={connectorHref(c)}
          className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-border-strong"
        >
          <ServiceLogo icon={c.logo} />
          <span className="flex-1 text-sm font-medium">{c.name}</span>
          {c.beta && <StatusBadge status="beta" />}
        </Link>
      ))}
    </div>
  );
}
