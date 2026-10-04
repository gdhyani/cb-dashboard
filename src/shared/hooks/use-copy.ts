"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

/** Copies text, flips `copied` for 1.5s and confirms with a toast ("Copied"). */
export function useCopy(label = "Copied to clipboard") {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(label);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        toast.error("Couldn't copy. Select the text and copy it manually.");
      }
    },
    [label],
  );
  return { copied, copy };
}
