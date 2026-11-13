import type { ReactNode } from "react";

/**
 * Supabase PageHeader: title (Title Case, 22px Manrope), a declarative one-line description, actions on the right.
 * Optional `icon` sits left of the title; `breadcrumb` renders as a quiet line above (the top bar already shows
 * where you are, so most pages leave it out). `nav` (a PageNav) sits flush below, full width.
 */
export function PageHeader({
  breadcrumb,
  icon,
  title,
  description,
  actions,
  nav,
}: {
  breadcrumb?: ReactNode;
  /** @deprecated The top bar breadcrumbs replace back links. Accepted and ignored. */
  backHref?: string;
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  nav?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 pt-10 md:gap-4 md:pt-12">
      {breadcrumb && <div className="min-w-0 text-sm text-foreground-lighter">{breadcrumb}</div>}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <span className="shrink-0 text-foreground-light [&_svg]:size-6">{icon}</span>}
          <div className="flex min-w-0 flex-col gap-1.5">
            {/* Phones get a larger title, like Studio on mobile. */}
            <h1 className="heading-title truncate text-foreground max-md:text-[1.625rem]">{title}</h1>
            {description && <div className="text-base text-foreground-light">{description}</div>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {nav}
    </header>
  );
}
