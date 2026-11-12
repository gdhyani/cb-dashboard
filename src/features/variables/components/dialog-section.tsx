import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * A block of a Studio modal body, split from the one above by a hairline that runs to the dialog's edges.
 * Optional mono micro-title (`heading-meta`), like Studio's modal sections.
 */
export function DialogSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "-mx-5 flex flex-col gap-4 border-t border-border px-5 pt-4 first:border-t-0 first:pt-0",
        className,
      )}
    >
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <h3 className="heading-meta text-foreground-lighter">{title}</h3>}
          {description && <p className="text-sm text-foreground-lighter">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
