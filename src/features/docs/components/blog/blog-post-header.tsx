import { MarkdownCopyButton, ViewOptionsPopover } from "fumadocs-ui/layouts/notebook/page";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BLOG_MARKDOWN_PATH, BLOG_PATH } from "@/constants";
import { formatPostDate } from "../../lib/blog";
import type { BlogPostSummary } from "../../lib/blog-source";
import { CopyLinkButton } from "./copy-link-button";

/**
 * FR-DOC-010: a post's title block. Back link and meta (date, author, reading time), the title and summary, the page
 * actions the docs have (copy the link, copy the post as Markdown for an AI assistant, open it in one), then the cover.
 */
export function BlogPostHeader({ post }: { post: BlogPostSummary }) {
  const markdownUrl = `${BLOG_MARKDOWN_PATH}/${post.slug}`;
  return (
    <header className="mb-12">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link
          href={BLOG_PATH}
          className="group inline-flex items-center gap-1.5 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
        >
          <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" />
          All posts
        </Link>
        <span aria-hidden className="h-4 w-px bg-fd-border max-sm:hidden" />
        <p className="text-subtle">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden> · </span>
          {post.author}
          <span aria-hidden> · </span>
          {post.minutes} min read
        </p>
      </div>
      <h1 className="mt-6 max-w-[22ch] text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-fd-foreground sm:text-5xl">
        {post.title}
      </h1>
      <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-fd-muted-foreground">{post.description}</p>
      <div className="mt-7 flex flex-wrap items-center gap-2">
        <CopyLinkButton />
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} />
      </div>
      <figure className="mt-10 overflow-hidden rounded-xl border border-fd-border">
        <Image
          src={post.image}
          alt={post.imageAlt}
          width={1200}
          height={675}
          priority
          unoptimized
          className="aspect-[16/9] h-auto w-full object-cover"
        />
      </figure>
    </header>
  );
}
