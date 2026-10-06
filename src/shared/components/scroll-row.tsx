"use client";

import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

type Fade = "none" | "start" | "end" | "both";

/**
 * A single row that scrolls sideways without a visible scrollbar: the edge that has more content fades out,
 * and a vertical mouse wheel scrolls the row (trackpads and touch scroll it natively).
 */
export function ScrollRow({ className, children, ...props }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState<Fade>("none");

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const start = el.scrollLeft > 1;
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setFade(start && end ? "both" : start ? "start" : end ? "end" : "none");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(el);
    // Native listener: React's wheel handler is passive, so it can't stop the page from scrolling too.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      // At either end the wheel goes back to scrolling the page, so the row never traps it.
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0 || (e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;
      e.preventDefault();
      // Instant: each wheel tick is already small, and the global smooth scroll-behavior would queue animations.
      el.scrollBy({ left: e.deltaY, behavior: "instant" });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer?.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, [measure]);

  return (
    <div
      ref={ref}
      data-fade={fade}
      onScroll={measure}
      className={cn(
        "flex min-w-0 flex-nowrap overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "data-[fade=end]:[mask-image:linear-gradient(to_right,#000_calc(100%_-_3rem),transparent)]",
        "data-[fade=start]:[mask-image:linear-gradient(to_left,#000_calc(100%_-_3rem),transparent)]",
        "data-[fade=both]:[mask-image:linear-gradient(to_right,transparent,#000_3rem,#000_calc(100%_-_3rem),transparent)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
