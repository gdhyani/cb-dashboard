import Link from "next/link";
import { ServiceLogo } from "@/shared/components/service-logo";
import { PLATFORMS, type PlatformGroup, platformHref } from "../lib/platforms";
import { StatusBadge } from "./status-badge";

const TITLES: Record<PlatformGroup, string> = {
  frameworks: "Frameworks",
  tooling: "Tools and test runners",
  "coming-soon": "Coming soon",
};

/** FR-DOC-009: support matrix, grouped; each card links to its platform page. */
export function PlatformCards() {
  return (
    <div className="not-prose my-6 flex flex-col gap-6">
      {(Object.keys(TITLES) as PlatformGroup[]).map((g) => (
        <section key={g} className="flex flex-col gap-3">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">{TITLES[g]}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.filter((p) => p.group === g).map((p) => (
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
        </section>
      ))}
    </div>
  );
}
