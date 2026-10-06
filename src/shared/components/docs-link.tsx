import { BookOpen } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** FR-DOC-003 / FR-DOC-004: a quiet link from the app into the public docs. */
export function DocsLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      <BookOpen className="size-3.5" aria-hidden="true" />
      {children}
    </Link>
  );
}
