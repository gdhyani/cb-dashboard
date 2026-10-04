"use client";

import { Check, Copy } from "lucide-react";
import { useCopy } from "@/shared/hooks/use-copy";
import { cn } from "@/shared/lib/utils";

/** Icon-only copy control with inline "Copied" confirmation. */
export function CopyButton({
  value,
  label = "Copy",
  toastLabel,
  className,
}: {
  value: string;
  label?: string;
  toastLabel?: string;
  className?: string;
}) {
  const { copied, copy } = useCopy(toastLabel);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={() => void copy(value)}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-subtle transition-colors hover:bg-white/[0.06] hover:text-foreground",
        copied && "text-foreground",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      <span aria-live="polite">{copied ? "Copied" : ""}</span>
    </button>
  );
}
