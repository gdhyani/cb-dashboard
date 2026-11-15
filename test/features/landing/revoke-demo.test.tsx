import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Reduced motion: once its section is near, the demo renders its final frame straight away (no pin, no scroll).
vi.mock("@/features/landing/motion/env", async (load) => ({
  ...(await load<typeof import("@/features/landing/motion/env")>()),
  prefersReducedMotion: () => true,
}));

type Callback = (entries: { isIntersecting: boolean }[]) => void;
let near: Callback | undefined;

afterEach(() => {
  vi.unstubAllGlobals();
  near = undefined;
});

describe("FR-LP-002 the revoke story plays once GSAP is loaded on demand", () => {
  it("renders the revoked frame without a global gsap (it only exists after loadMotion)", async () => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: Callback) {
          near = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    // GSAP's ScrollTrigger needs matchMedia, which jsdom lacks.
    vi.stubGlobal(
      "matchMedia",
      (query: string) =>
        ({
          matches: false,
          media: query,
          addEventListener() {},
          removeEventListener() {},
        }) as unknown as MediaQueryList,
    );
    expect((globalThis as { gsap?: unknown }).gsap).toBeUndefined();
    const { RevokeDemo } = await import("@/features/landing/components/revoke-demo");
    const { container } = render(<RevokeDemo />);
    const demo = container.querySelector<HTMLElement>(".lp-demo");

    await act(async () => {
      near?.([{ isIntersecting: true }]);
      await vi.waitFor(() => expect(demo?.dataset.phase).toBe("revoked"));
    });
    expect(container.querySelector("[data-revoke-clock]")?.textContent).toBe("1.1 s");
    expect(container.querySelectorAll("[data-revoke-row][data-closed]")).toHaveLength(3);
  });
});
