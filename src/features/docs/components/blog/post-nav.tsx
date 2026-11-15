import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPostDate } from "../../lib/blog";
import type { BlogPostSummary } from "../../lib/blog-source";

/** End of a post: the newer and the older post, as two cards (like the docs' Previous / Next). */
export function PostNav({ newer, older }: { newer?: BlogPostSummary; older?: BlogPostSummary }) {
  if (!newer && !older) return null;
  return (
    <nav aria-label="More posts" className="mt-16 grid gap-3 border-t border-fd-border pt-10 sm:grid-cols-2">
      {older ? <PostCard post={older} label="Older post" direction="older" /> : <span className="max-sm:hidden" />}
      {newer && <PostCard post={newer} label="Newer post" direction="newer" />}
    </nav>
  );
}

function PostCard({ post, label, direction }: { post: BlogPostSummary; label: string; direction: "older" | "newer" }) {
  const Arrow = direction === "older" ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={post.url}
      className={`group flex flex-col gap-2 rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:border-border-strong ${
        direction === "newer" ? "sm:items-end sm:text-end" : ""
      }`}
    >
      <span className="inline-flex items-center gap-1.5 text-xs text-fd-muted-foreground">
        {direction === "older" && (
          <Arrow className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        )}
        {label} · {formatPostDate(post.date)}
        {direction === "newer" && (
          <Arrow className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        )}
      </span>
      <span className="font-medium leading-snug text-fd-foreground">{post.title}</span>
    </Link>
  );
}
