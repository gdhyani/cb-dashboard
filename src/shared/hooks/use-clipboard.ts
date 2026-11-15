"use client";

import { useCallback, useState } from "react";

/**
 * Copies text and flips `copied` for 1.5s. No toast library: pages that must stay light (the landing page) use this
 * directly; the app's `useCopy` adds the toast on top.
 */
export function useClipboard({ onCopied, onError }: { onCopied?: () => void; onError?: () => void } = {}) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onCopied?.();
        setTimeout(() => setCopied(false), 1500);
      } catch {
        onError?.();
      }
    },
    [onCopied, onError],
  );
  return { copied, copy };
}
