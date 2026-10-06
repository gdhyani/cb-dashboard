import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ScrollRow } from "@/shared/components/scroll-row";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

/** jsdom has no layout: give the row a fixed viewport and content width. */
function size(el: HTMLElement, { client, scroll, left = 0 }: { client: number; scroll: number; left?: number }) {
  Object.defineProperty(el, "clientWidth", { configurable: true, value: client });
  Object.defineProperty(el, "scrollWidth", { configurable: true, value: scroll });
  el.scrollLeft = left;
}

function renderRow() {
  render(
    <ScrollRow>
      <button type="button">One</button>
      <button type="button">Two</button>
    </ScrollRow>,
  );
  const row = screen.getByRole("button", { name: "One" }).parentElement;
  if (!row) throw new Error("row not rendered");
  return row;
}

describe("ScrollRow (Quick add row without a visible scrollbar)", () => {
  it("hides the native scrollbar", () => {
    const row = renderRow();
    expect(row.className).toContain("[scrollbar-width:none]");
  });

  it("fades only the edges that have more content", () => {
    const row = renderRow();
    size(row, { client: 300, scroll: 900, left: 0 });
    act(() => fireEvent.scroll(row));
    expect(row.dataset.fade).toBe("end");

    size(row, { client: 300, scroll: 900, left: 300 });
    act(() => fireEvent.scroll(row));
    expect(row.dataset.fade).toBe("both");

    size(row, { client: 300, scroll: 900, left: 600 });
    act(() => fireEvent.scroll(row));
    expect(row.dataset.fade).toBe("start");
  });

  it("has no fade when everything fits", () => {
    const row = renderRow();
    size(row, { client: 900, scroll: 900 });
    act(() => fireEvent.scroll(row));
    expect(row.dataset.fade).toBe("none");
  });

  it("turns a vertical mouse wheel into horizontal scrolling when the row overflows", () => {
    const row = renderRow();
    size(row, { client: 300, scroll: 900 });
    row.scrollBy = vi.fn();
    fireEvent.wheel(row, { deltaY: 120, deltaX: 0 });
    expect(row.scrollBy).toHaveBeenCalledWith({ left: 120, behavior: "instant" });
  });

  it("lets the page scroll once the row is at its end", () => {
    const row = renderRow();
    row.scrollBy = vi.fn();
    size(row, { client: 300, scroll: 900, left: 600 });
    expect(fireEvent.wheel(row, { deltaY: 120, deltaX: 0 })).toBe(true);
    size(row, { client: 300, scroll: 900, left: 0 });
    expect(fireEvent.wheel(row, { deltaY: -120, deltaX: 0 })).toBe(true);
    expect(row.scrollBy).not.toHaveBeenCalled();
  });

  it("leaves trackpad sideways swipes and non-overflowing rows alone", () => {
    const row = renderRow();
    row.scrollBy = vi.fn();
    size(row, { client: 300, scroll: 900 });
    fireEvent.wheel(row, { deltaY: 2, deltaX: 40 });
    size(row, { client: 900, scroll: 900 });
    fireEvent.wheel(row, { deltaY: 120, deltaX: 0 });
    expect(row.scrollBy).not.toHaveBeenCalled();
  });
});
