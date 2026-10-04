import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceLogo } from "@/features/variables/components/service-logo";

describe("ServiceLogo", () => {
  it("renders the brand path for known icons and a letter fallback otherwise", () => {
    const { container, rerender } = render(<ServiceLogo icon="mongodb" />);
    expect(container.querySelector("svg path")).not.toBeNull();
    rerender(<ServiceLogo icon="letter:{}" />);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.textContent).toBe("{}");
    rerender(<ServiceLogo icon="no-such-brand" />);
    expect(container.textContent).toBe("NO");
  });
});
