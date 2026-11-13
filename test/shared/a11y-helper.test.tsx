import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../a11y";

describe("NFR-A11Y axe helper", () => {
  it("reports real violations (an unnamed button, an image without alt, an unlabelled input)", async () => {
    render(
      <div>
        <button type="button" />
        {/* biome-ignore lint/a11y/useAltText: deliberate violation for the helper test */}
        {/* biome-ignore lint/performance/noImgElement: a plain img is the point of this test */}
        <img src="x.png" />
        <input type="text" />
      </div>,
    );
    const v = await axeViolations();
    expect(v.some((x) => x.startsWith("button-name"))).toBe(true);
    expect(v.some((x) => x.startsWith("image-alt"))).toBe(true);
    expect(v.some((x) => x.startsWith("label"))).toBe(true);
  });
});
