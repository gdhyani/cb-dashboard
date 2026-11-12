import type * as React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Supabase Card: surface-100 panel, hairline border. Header and content rows are split by hairlines; settings forms
 * put one field per CardContent row and the actions in CardFooter (right-aligned).
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("overflow-hidden rounded-lg border border-border bg-surface-100 shadow-xs", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 border-b border-border px-4 py-4 md:px-6", className)}
      {...props}
    />
  );
}

/** Mono uppercase micro-title — the Supabase card heading. */
function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="card-title" className={cn("heading-meta text-foreground", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-sm text-foreground-lighter", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("border-b border-border px-4 py-4 last:border-none md:px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center justify-end gap-2 border-t border-border px-4 py-3 md:px-6", className)}
      {...props}
    />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
