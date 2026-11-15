import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StaggerItem } from "@/shared/components/stagger";
import { formatPostDate } from "../../lib/blog";
import type { BlogPostSummary } from "../../lib/blog-source";

const COVER = "aspect-[16/9] overflow-hidden bg-fd-muted";
const COVER_IMG = "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]";

function Meta({ post }: { post: BlogPostSummary }) {
  return (
    <p className="font-mono text-xs text-subtle">
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      <span aria-hidden> · </span>
      {post.minutes} min read
    </p>
  );
}

/**
 * FR-DOC-010: the blog index. The newest post is one wide feature (cover beside the text, a "Latest" tag and a read
 * link); every other post follows in an even grid of same-sized cards, newest first, so the page reads in one order.
 */
export function BlogIndex({ posts }: { posts: BlogPostSummary[] }) {
  const [latest, ...rest] = posts;
  if (!latest) return null;
  return (
    <div className="flex flex-col gap-16">
      <section aria-label="Latest post">
        <Link
          href={latest.url}
          className="group grid overflow-hidden rounded-xl border border-fd-border bg-fd-card transition-colors hover:border-border-strong md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
        >
          <div className={`${COVER} md:aspect-auto md:min-h-80`}>
            <Image
              src={latest.image}
              alt={latest.imageAlt}
              width={1200}
              height={675}
              priority
              unoptimized
              className={COVER_IMG}
            />
          </div>
          <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
            <span className="w-fit rounded-[3px] bg-mark px-1.5 py-0.5 font-mono text-xs leading-none text-mark-ink">
              Latest
            </span>
            <h2 className="text-balance text-2xl font-semibold leading-tight tracking-[-0.02em] text-fd-foreground md:text-3xl">
              {latest.title}
            </h2>
            <p className="text-[15px] leading-relaxed text-fd-muted-foreground">{latest.description}</p>
            <Meta post={latest} />
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-fd-foreground">
              Read the post
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </section>
      {rest.length > 0 && (
        <section aria-labelledby="blog-all-posts">
          <div className="flex items-baseline justify-between border-b border-fd-border pb-3">
            <h2 id="blog-all-posts" className="text-lg font-semibold tracking-tight text-fd-foreground">
              Earlier posts
            </h2>
            <span className="font-mono text-xs text-subtle">{rest.length}</span>
          </div>
          <ul aria-label="Earlier posts" className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <StaggerItem key={p.slug} index={i}>
                <Link href={p.url} className="group flex h-full flex-col">
                  <div
                    className={`${COVER} rounded-lg border border-fd-border transition-colors group-hover:border-border-strong`}
                  >
                    <Image src={p.image} alt={p.imageAlt} width={1200} height={675} unoptimized className={COVER_IMG} />
                  </div>
                  <div className="mt-4 flex flex-1 flex-col gap-2">
                    <Meta post={p} />
                    <h3 className="text-balance font-semibold leading-snug text-fd-foreground decoration-mark decoration-2 underline-offset-4 group-hover:underline">
                      {p.title}
                    </h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-fd-muted-foreground">{p.description}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
