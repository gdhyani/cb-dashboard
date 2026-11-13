import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Splash } from "@/shared/components/splash";
import { THEME_BOOT_SCRIPT } from "@/shared/theme/theme";

const runBoot = (path: string) => {
  window.history.replaceState(null, "", path);
  new Function(THEME_BOOT_SCRIPT)();
};

describe("First-landing splash", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    delete document.documentElement.dataset.splash;
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });
  afterEach(() => vi.restoreAllMocks());

  it("is decorative: the wordmark with a strike, hidden from screen readers", () => {
    const { container } = render(<Splash />);
    const splash = container.querySelector(".cb-splash");
    expect(splash).toHaveAttribute("aria-hidden", "true");
    expect(splash?.querySelector(".cb-splash-strike")).not.toBeNull();
  });

  it("plays on the first dashboard load of a tab and is skipped after that", () => {
    runBoot("/orgs/o1");
    expect(document.documentElement.dataset.splash).toBeUndefined();
    runBoot("/orgs/o1/members");
    expect(document.documentElement.dataset.splash).toBe("skip");
  });

  it("docs and blog visits never use up the splash", () => {
    runBoot("/docs/quick-start");
    runBoot("/blog");
    expect(window.sessionStorage.length).toBe(0);
    runBoot("/login");
    expect(document.documentElement.dataset.splash).toBeUndefined();
  });
});
