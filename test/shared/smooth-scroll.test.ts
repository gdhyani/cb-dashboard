import { afterEach, describe, expect, it, vi } from "vitest";
import { prefersSmoothScroll, watchScrollLock } from "@/shared/lib/smooth-scroll";

const media = (reduce: boolean) => ((q: string) => ({ matches: reduce && q.includes("reduce") })) as never;

describe("smooth scroll (FR-UI motion)", () => {
  afterEach(() => document.body.removeAttribute("data-scroll-locked"));

  it("is on by default and off when the user prefers reduced motion", () => {
    expect(prefersSmoothScroll(media(false))).toBe(true);
    expect(prefersSmoothScroll(media(true))).toBe(false);
  });

  it("pauses while a dialog locks page scroll and resumes after", async () => {
    const lenis = { stop: vi.fn(), start: vi.fn() };
    const stopWatching = watchScrollLock(lenis, document.body);
    document.body.setAttribute("data-scroll-locked", "1");
    await Promise.resolve();
    expect(lenis.stop).toHaveBeenCalledTimes(1);
    document.body.removeAttribute("data-scroll-locked");
    await Promise.resolve();
    expect(lenis.start).toHaveBeenCalledTimes(1);
    stopWatching();
  });

  it("starts paused when a lock is already present", () => {
    document.body.setAttribute("data-scroll-locked", "1");
    const lenis = { stop: vi.fn(), start: vi.fn() };
    watchScrollLock(lenis, document.body)();
    expect(lenis.stop).toHaveBeenCalledTimes(1);
  });
});
