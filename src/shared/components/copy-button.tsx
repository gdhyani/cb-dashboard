"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { InlineCopyButton } from "./inline-copy-button";

/** Icon-only copy control with inline "Copied" confirmation and a toast. */
export function CopyButton({
  value,
  label = "Copy",
  toastLabel = "Copied to clipboard",
  className,
}: {
  value: string;
  label?: string;
  toastLabel?: string;
  className?: string;
}) {
  const handlers = useMemo(
    () => ({
      onCopied: () => toast.success(toastLabel),
      onError: () => toast.error("Couldn't copy. Select the text and copy it manually."),
    }),
    [toastLabel],
  );
  return <InlineCopyButton value={value} label={label} className={className} mergeClasses={cn} {...handlers} />;
}
