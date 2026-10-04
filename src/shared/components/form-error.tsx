import { CircleAlert } from "lucide-react";
import { ApiError } from "@/shared/api/api-error";

/** Form-level error from a failed submit: message plus code · correlation id (quote it to find server logs). */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  const apiError = error instanceof ApiError ? error : null;
  const detail = apiError?.details?.map((d) => `${d.path}: ${d.message}`).join(" · ");
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-md border border-destructive/40 bg-destructive/[0.06] px-3 py-2.5 text-sm"
    >
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-foreground">{apiError?.message ?? "Something went wrong. Try again."}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
        {apiError && (
          <p className="break-all font-mono text-[11px] text-subtle">
            {apiError.code}
            {apiError.correlationId && ` · ${apiError.correlationId}`}
          </p>
        )}
      </div>
    </div>
  );
}
