"use client";

import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/shared/hooks/use-clipboard";

/**
 * Icon-only copy control whose only confirmation is inline ("Copied"). No toast library, so light pages (the landing
 * page) can use it; `CopyButton` is this plus a toast. Classes are joined as given; pass `mergeClasses` (the app's
 * `cn`) when a caller's className must override the defaults (that pulls tailwind-merge in, so the landing page does not).
 */
const joinClasses = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

export function InlineCopyButton({
  value,
  label = "Copy",
  className,
  onCopied,
  onError,
  mergeClasses = joinClasses,
}: {
  value: string;
  label?: string;
  className?: string;
  onCopied?: () => void;
  onError?: () => void;
  mergeClasses?: (...classes: (string | false | undefined)[]) => string;
}) {
  const { copied, copy } = useClipboard({ onCopied, onError });
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={() => void copy(value)}
      className={mergeClasses(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-subtle transition-colors hover:bg-accent hover:text-foreground",
        copied && "text-foreground",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      <span aria-live="polite">{copied ? "Copied" : ""}</span>
    </button>
  );
}
