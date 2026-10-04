import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div className="flex min-w-0 flex-col gap-2">
        {eyebrow && <p className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">{eyebrow}</p>}
        <h1 className="truncate text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <div className="max-w-2xl text-sm text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
