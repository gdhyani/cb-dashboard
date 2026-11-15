"use client";

import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

/** Copies the post's address (without query or hash), next to "Copy Markdown". Says "Copied" for a moment. */
export function CopyLinkButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure origin or denied): nothing to copy into.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        "gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground",
        className,
      )}
    >
      {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
    </button>
  );
}
