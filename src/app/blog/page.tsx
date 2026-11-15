import type { Metadata } from "next";
import { PRODUCT_NAME } from "@/constants";
import { BlogIndex, formatPostDate, listPosts, SectionHero } from "@/features/docs";

export const metadata: Metadata = {
  title: `Blog — ${PRODUCT_NAME}`,
  description: "Why we build cb, and how it keeps real keys off developer machines.",
};

export default async function BlogIndexPage() {
  const posts = await listPosts();
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-12 pb-16 sm:px-6">
      <SectionHero
        section="blog"
        kicker={`Notes from the team building ${PRODUCT_NAME}`}
        lede={<>Why we build {PRODUCT_NAME}, and how it keeps real keys off every developer machine.</>}
      >
        {posts[0] && (
          <p className="font-mono text-xs text-subtle">
            {posts.length} posts · latest {formatPostDate(posts[0].date)}
          </p>
        )}
      </SectionHero>
      <div>
        <BlogIndex posts={posts} />
      </div>
    </main>
  );
}
