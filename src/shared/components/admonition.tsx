import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const TYPES = {
  default: { box: "border-border bg-surface-200/40", badge: "bg-foreground-muted text-background", Icon: Info },
  note: { box: "border-border bg-surface-200/40", badge: "bg-foreground-muted text-background", Icon: Info },
  warning: {
    box: "border-warning/40 bg-warning/[0.06]",
    badge: "bg-warning text-warning-foreground",
    Icon: TriangleAlert,
  },
  destructive: {
    box: "border-destructive/40 bg-destructive/[0.06]",
    badge: "bg-destructive-solid text-white",
    Icon: CircleAlert,
  },
  success: { box: "border-success/40 bg-success/[0.06]", badge: "bg-success text-background", Icon: CircleCheck },
} as const;

/** Supabase Admonition: callout with a small filled icon badge, a title, body text and optional actions. */
export function Admonition({
  type = "default",
  title,
  children,
  actions,
  className,
}: {
  type?: keyof typeof TYPES;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const t = TYPES[type];
  return (
    <div
      role={type === "destructive" || type === "warning" ? "alert" : "note"}
      className={cn("flex w-full items-start gap-3 rounded-lg border p-4 text-sm", t.box, className)}
    >
      <span className={cn("mt-px flex size-[22px] shrink-0 items-center justify-center rounded-[5px]", t.badge)}>
        <t.Icon className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <p className="font-medium text-foreground">{title}</p>}
        {children && <div className="leading-relaxed text-foreground-light">{children}</div>}
        {actions && <div className="mt-2.5 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
