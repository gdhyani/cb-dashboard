import Image from "next/image";
import Link from "next/link";
import { StaggerItem } from "@/shared/components/stagger";
import { formatPostDate } from "../../lib/blog";
import type { BlogPostSummary } from "../../lib/blog-source";

const FEATURED = 4;

/**
 * FR-DOC-010: the blog index. The latest four posts sit in a bento grid with their covers (the newest takes the large
 * tile, the fourth runs full width with its cover beside the text); older posts follow as a plain list.
 */
export function BlogBento({ posts }: { posts: BlogPostSummary[] }) {
  const featured = posts.slice(0, FEATURED);
  const rest = posts.slice(FEATURED);
  return (
    <div className="flex flex-col gap-16">
      <ul aria-label="Latest posts" className="grid gap-4 md:grid-cols-3 md:grid-rows-[auto_auto]">
        {featured.map((p, i) => (
          <StaggerItem
            key={p.slug}
            index={i}
            className={i === 0 ? "md:col-span-2 md:row-span-2" : i === 3 ? "md:col-span-3" : undefined}
          >
            <Link
              href={p.url}
              className={`group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-[#0a0a0a] transition-colors hover:border-[#3a3a3a] ${
                i === 3 ? "md:flex-row" : ""
              }`}
            >
              <div
                className={i === 0 ? "aspect-[16/9]" : i === 3 ? "aspect-[16/9] md:w-1/2 md:shrink-0" : "aspect-[16/9]"}
              >
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  width={1200}
                  height={675}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
              <div className={i === 0 ? "p-6" : i === 3 ? "flex flex-col justify-center p-5 md:p-8" : "p-5"}>
                <time dateTime={p.date} className="text-xs text-subtle">
                  {formatPostDate(p.date)}
                </time>
                <h2
                  className={`mt-2 font-semibold tracking-tight text-foreground group-hover:underline group-hover:underline-offset-4 ${
                    i === 0 ? "text-2xl" : "text-base"
                  }`}
                >
                  {p.title}
                </h2>
                <p
                  className={`mt-2 text-muted-foreground ${i === 0 ? "text-[15px] leading-relaxed" : "line-clamp-2 text-sm"}`}
                >
                  {p.description}
                </p>
                <p className="mt-3 text-xs text-subtle">{p.minutes} min read</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </ul>
      {rest.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-foreground">More posts</h2>
          <ul aria-label="More posts" className="mt-4 divide-y divide-border border-y border-border">
            {rest.map((p, i) => (
              <StaggerItem key={p.slug} index={i}>
                <Link href={p.url} className="group grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8">
                  <time dateTime={p.date} className="text-sm text-muted-foreground">
                    {formatPostDate(p.date)}
                  </time>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:underline group-hover:underline-offset-4">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
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
