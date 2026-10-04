import type { ReactNode } from "react";
import { Label } from "@/shared/ui/label";

/** Label above, small helper text below. Errors replace the helper text. */
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
        <Label htmlFor={id} className="text-[13px] font-medium text-foreground">
          {label}
        </Label>
        {aside && <span className="text-xs text-subtle">{aside}</span>}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs leading-relaxed text-subtle">{hint}</p>
      )}
    </div>
  );
}
