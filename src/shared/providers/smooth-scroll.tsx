"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { prefersSmoothScroll, watchScrollLock } from "@/shared/lib/smooth-scroll";

/** Runs inside ReactLenis: the instance only exists after Lenis mounts, so read it through useLenis. */
function LenisSync() {
  const lenis = useLenis();
  const pathname = usePathname();
  useEffect(() => (lenis ? watchScrollLock(lenis, document.body) : undefined), [lenis]);
  // Each navigation starts at the top without easing from the previous page's offset.
  useEffect(() => {
    if (pathname) lenis?.scrollTo(0, { immediate: true });
  }, [lenis, pathname]);
  return null;
}

/** Page-wide inertial scrolling; nested scroll areas (dialogs, sheets, menus) keep native scrolling. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(prefersSmoothScroll());
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // The docs scroll natively: code blocks and tables scroll sideways only, and the page keeps the vertical wheel.
  const pathname = usePathname();
  if (!enabled || pathname?.startsWith("/docs")) return children;
  return (
    <ReactLenis root options={{ lerp: 0.14, anchors: true, allowNestedScroll: true }}>
      <LenisSync />
      {children}
    </ReactLenis>
  );
}
