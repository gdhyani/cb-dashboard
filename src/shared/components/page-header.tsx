import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Every page header sits on the subtle grid pattern (same feel on every page).
 * One-line mono breadcrumb (optional back link), then the display title with its actions on the
 * same row — vertically centred on the title — and the description below.
 */
export function PageHeader({
  breadcrumb,
  backHref,
  title,
  description,
  actions,
}: {
  breadcrumb?: ReactNode;
  backHref?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="cb-grid-wide -mx-4 -mt-8 flex flex-col gap-3 px-4 pt-8 pb-6 sm:-mx-6 sm:px-6 md:-mt-10 md:pt-10">
      {(breadcrumb || backHref) && (
        <div className="flex min-w-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-subtle">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back"
              className="-ml-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
            </Link>
          )}
          <div className="min-w-0 flex-1">{breadcrumb}</div>
        </div>
      )}
      <div className="flex min-w-0 items-center justify-between gap-4">
        <h1 className="min-w-0 truncate text-display font-semibold">{title}</h1>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {description && <div className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</div>}
    </header>
  );
}
