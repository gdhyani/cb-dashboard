import type { ReactNode } from "react";
import { Label } from "@/shared/ui/label";

/** Supabase vertical FormItemLayout for dialogs: label above, helper text below. Errors replace the helper text. */
export function FormField({
  id,
  label,
  error,
  hint,
  aside,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="text-sm text-foreground">
          {label}
        </Label>
        {aside && <span className="text-xs text-foreground-lighter">{aside}</span>}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm leading-normal text-foreground-lighter">{hint}</p>
      )}
    </div>
  );
}
