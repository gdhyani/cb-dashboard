import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY } from "@/constants";
import { ThemePicker } from "@/features/account/components/theme-picker";

beforeAll(() => {
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("Account › Appearance theme picker", () => {
  it("shows Dark selected by default", () => {
    render(<ThemePicker />);
    expect(screen.getByRole("radio", { name: /Dark/ })).toBeChecked();
  });

  it("stores and applies the chosen theme", () => {
    render(<ThemePicker />);
    fireEvent.click(screen.getByRole("radio", { name: /Light/ }));
    expect(screen.getByRole("radio", { name: /Light/ })).toBeChecked();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("System follows the device (dark here)", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    render(<ThemePicker />);
    fireEvent.click(screen.getByRole("radio", { name: /System/ }));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
