import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Supabase PageSection: 48px above each section, an 18px section title with a short description, actions on the
 * right, content below (usually a Card or a table). `layout="horizontal"` puts the summary in a left column on wide
 * screens (settings-style).
 */
export function Section({
  title,
  description,
  actions,
  layout = "vertical",
  className,
  children,
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  layout?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
}) {
  const hasMeta = Boolean(title || description || actions);
  return (
    <section
      className={cn(
        "pt-10 md:pt-12",
        layout === "horizontal" ? "grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-12" : "flex flex-col gap-5",
        className,
      )}
    >
      {hasMeta && (
        <div
          className={cn(
            "flex flex-col gap-3",
            layout === "vertical" && "sm:flex-row sm:items-end sm:justify-between sm:gap-4",
          )}
        >
          <div className="flex min-w-0 flex-col gap-1">
            {title && <h2 className="heading-section text-foreground">{title}</h2>}
            {description && <div className="max-w-2xl text-sm text-foreground-light">{description}</div>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}
