"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyCommand({ command, label }: { command: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label ?? `Copy ${command}`}
      onClick={() => {
        void navigator.clipboard.writeText(command).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="group flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-left font-mono text-sm text-foreground transition-colors hover:border-ring"
    >
      <span className="truncate">
        <span className="select-none text-subtle">$ </span>
        {command}
      </span>
      {copied ? (
        <Check className="size-4 shrink-0" />
      ) : (
        <Copy className="size-4 shrink-0 text-subtle group-hover:text-foreground" />
      )}
    </button>
  );
}
