"use client";

import { Check, Copy } from "lucide-react";
import { useCopy } from "@/shared/hooks/use-copy";
import { cn } from "@/shared/lib/utils";

/** A command or link the user is meant to copy: whole row is the button, confirmation is inline + toast. */
export function CopyCommand({
  command,
  label,
  prompt = true,
  toastLabel,
}: {
  command: string;
  label?: string;
  prompt?: boolean;
  toastLabel?: string;
}) {
  const { copied, copy } = useCopy(toastLabel);
  return (
    <button
      type="button"
      aria-label={label ?? `Copy ${command}`}
      onClick={() => void copy(command)}
      className="group flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left font-mono text-[13px] text-foreground transition-colors hover:border-border-strong"
    >
      <span className="truncate">
        {prompt && <span className="select-none text-subtle">$ </span>}
        {command}
      </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 font-sans text-xs text-subtle group-hover:text-foreground",
          copied && "text-foreground",
        )}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </span>
    </button>
  );
}
