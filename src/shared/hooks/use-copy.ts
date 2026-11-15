"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { useClipboard } from "./use-clipboard";

/** Copies text, flips `copied` for 1.5s and confirms with a toast ("Copied"). */
export function useCopy(label = "Copied to clipboard") {
  const handlers = useMemo(
    () => ({
      onCopied: () => toast.success(label),
      onError: () => toast.error("Couldn't copy. Select the text and copy it manually."),
    }),
    [label],
  );
  return useClipboard(handlers);
}
