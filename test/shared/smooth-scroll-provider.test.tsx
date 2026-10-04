import { act, render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SmoothScroll } from "@/shared/providers/smooth-scroll";

vi.mock("next/navigation", () => ({ usePathname: () => "/orgs/o1" }));

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as never;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
});

describe("<SmoothScroll /> (FR-UI motion)", () => {
  it("pauses page smooth-scrolling while a dialog locks the body, and resumes after", async () => {
    render(
      <SmoothScroll>
        <p>page</p>
      </SmoothScroll>,
    );
    await act(async () => {});
    expect(document.documentElement).toHaveClass("lenis");
    await act(async () => document.body.setAttribute("data-scroll-locked", "1"));
    expect(document.documentElement).toHaveClass("lenis-stopped");
    await act(async () => document.body.removeAttribute("data-scroll-locked"));
    expect(document.documentElement).not.toHaveClass("lenis-stopped");
  });
});
