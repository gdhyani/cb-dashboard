import Link from "next/link";
import { StaggerItem } from "@/shared/components/stagger";
import { formatPostDate } from "../../lib/blog";
import type { BlogPostSummary } from "../../lib/blog-source";

/** FR-DOC-010: the blog index, newest first. A plain typographic list: date, title, summary, reading time. */
export function BlogPostList({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {posts.map((p, i) => (
        <StaggerItem key={p.slug} index={i}>
          <Link href={p.url} className="group grid gap-2 py-8 sm:grid-cols-[10rem_1fr] sm:gap-8">
            <time dateTime={p.date} className="text-sm text-muted-foreground">
              {formatPostDate(p.date)}
            </time>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:underline group-hover:underline-offset-4">
                {p.title}
              </h2>
              <p className="mt-2 max-w-[65ch] text-[15px] leading-relaxed text-muted-foreground">{p.description}</p>
              <p className="mt-3 text-xs text-subtle">{p.minutes} min read</p>
            </div>
          </Link>
        </StaggerItem>
      ))}
    </ol>
  );
}
