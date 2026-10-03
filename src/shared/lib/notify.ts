import { toast } from "sonner";
import { ApiError } from "@/shared/api/api-error";

/** One way to surface errors: message + code + correlation id (quote it to find server logs). */
export function notifyError(error: unknown, fallback = "Something went wrong."): void {
  if (error instanceof ApiError) {
    const detail = error.details?.map((d) => `${d.path}: ${d.message}`).join(" · ");
    toast.error(error.message, {
      description: [detail, `${error.code} · ${error.correlationId}`].filter(Boolean).join("\n"),
    });
    return;
  }
  toast.error(fallback);
}

export function notifySuccess(message: string): void {
  toast.success(message);
}
