import type { Metadata } from "next";
import { PRODUCT_NAME } from "@/constants";
import { BlogBento, listPosts } from "@/features/docs";

export const metadata: Metadata = {
  title: `Blog — ${PRODUCT_NAME}`,
  description: "Why we build cb, and how it keeps real keys off developer laptops.",
};

export default async function BlogIndexPage() {
  const posts = await listPosts();
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground">Blog</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-muted-foreground">
        Why we build {PRODUCT_NAME}, and how it keeps real keys off every developer laptop.
      </p>
      <div className="mt-12">
        <BlogBento posts={posts} />
      </div>
    </main>
  );
}
