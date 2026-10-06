import Link from "next/link";
import { ServiceLogo } from "@/shared/components/service-logo";
import { PLATFORMS, platformHref } from "../lib/platforms";
import { StatusBadge } from "./status-badge";

/** FR-DOC-009: every platform as one grid of blocks; the badge carries the status, each block opens its page. */
export function PlatformCards() {
  return (
    <div className="not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PLATFORMS.map((p) => (
        <Link
          key={p.slug}
          href={platformHref(p)}
          className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-border-strong"
        >
          <ServiceLogo icon={p.logo} />
          <span className="flex-1 text-sm font-medium">{p.name}</span>
          <StatusBadge status={p.status} />
        </Link>
      ))}
    </div>
  );
}
