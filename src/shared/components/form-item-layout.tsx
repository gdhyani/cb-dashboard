import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Label } from "@/shared/ui/label";

/**
 * Supabase FormItemLayout.
 * - `row` (settings pages): label + description on the left, the control on the right (stacks on phones).
 * - `horizontal` (wide dialogs/sheets): 4/8 grid.
 * - `vertical` (narrow dialogs): label above the control.
 * Errors replace the description and are announced.
 */
export function FormItemLayout({
  id,
  label,
  description,
  error,
  optional,
  layout = "row",
  children,
}: {
  id?: string;
  label: string;
  description?: ReactNode;
  error?: string;
  optional?: boolean;
  layout?: "row" | "horizontal" | "vertical";
  children: ReactNode;
}) {
  const meta = (
    <div className="flex min-w-0 flex-col">
      <Label htmlFor={id} className="leading-normal">
        {label}
        {optional && <span className="text-foreground-muted">Optional</span>}
      </Label>
      {description && !error && layout !== "vertical" && (
        <div className="mt-1 text-sm leading-normal text-foreground-lighter">{description}</div>
      )}
    </div>
  );
  const message = error ? (
    <p role="alert" className="mt-2 text-sm text-destructive">
      {error}
    </p>
  ) : (
    layout === "vertical" &&
    description && <div className="mt-2 text-sm leading-normal text-foreground-lighter">{description}</div>
  );
  return (
    <div
      className={cn(
        layout === "row" && "flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6",
        layout === "horizontal" && "flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-4",
        layout === "vertical" && "flex flex-col gap-2",
      )}
    >
      <div className={cn(layout === "row" && "md:flex-1", layout === "horizontal" && "md:col-span-4")}>{meta}</div>
      <div
        className={cn("min-w-0", layout === "row" && "md:w-1/2 xl:w-2/5", layout === "horizontal" && "md:col-span-8")}
      >
        {children}
        {message}
      </div>
    </div>
  );
}
