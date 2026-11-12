import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY } from "@/constants";
import { ThemeToggle } from "@/shared/components/theme-toggle";

describe("FR-UI-008 top-bar theme switcher", () => {
  beforeAll(() => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("shows the current choice and switches the theme from its menu", async () => {
    render(<ThemeToggle />);
    const trigger = screen.getByRole("button", { name: "Theme: dark" });
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitemradio", { name: /Light/ }));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Theme: light" })).toBeInTheDocument();
  });
});
