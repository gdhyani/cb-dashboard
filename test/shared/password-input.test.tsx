import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PasswordInput } from "@/shared/components/password-input";

describe("FR-UI-006 PasswordInput", () => {
  it("masks by default and toggles visibility with the eye button", () => {
    render(<PasswordInput aria-label="Password" autoComplete="current-password" defaultValue="hunter22" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "current-password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggle is not a submit button", () => {
    render(<PasswordInput aria-label="Password" />);
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute("type", "button");
  });
});
