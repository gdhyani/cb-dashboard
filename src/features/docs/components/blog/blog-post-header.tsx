import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BLOG_PATH } from "@/constants";
import { formatPostDate } from "../../lib/blog";
import type { BlogPostSummary } from "../../lib/blog-source";

/** FR-DOC-010: a post's title block: back link, title, summary, date, author and reading time. */
export function BlogPostHeader({ post }: { post: BlogPostSummary }) {
  return (
    <header className="mb-10 border-b border-border pb-8">
      <Link
        href={BLOG_PATH}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All posts
      </Link>
      <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.description}</p>
      <p className="mt-6 text-sm text-subtle">
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>, by {post.author}, {post.minutes} min read
      </p>
    </header>
  );
}
