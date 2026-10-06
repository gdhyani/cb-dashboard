import Image from "next/image";

/**
 * FR-DOC-007: a documentation screenshot. The PNG already sits on the docs gradient (scripts/frame-images.mjs),
 * so this only sizes it, rounds it and adds a caption.
 */
export function Frame({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="not-prose my-6">
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        sizes="(min-width: 1024px) 760px, 100vw"
        className="h-auto w-full rounded-xl"
      />
      {caption && <figcaption className="mt-2 text-center text-hint text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
