import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExtrasSection } from "@/features/variables/components/extras-section";
import { type DraftExtra, TYPES } from "@/features/variables/lib/catalog";

const defs = TYPES.supabase.extras();
const urlOnly: DraftExtra[] = [{ suggestedKey: "SUPABASE_URL", key: "SUPABASE_URL", on: true }];

function open(extras: DraftExtra[], fields: Record<string, string>) {
  render(<ExtrasSection defs={defs} extras={extras} fields={fields} onChange={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: /Suggested extra keys/ }));
  return screen.getByLabelText("Project URL (public)") as HTMLInputElement;
}

describe("OQ13 (10) Supabase extras: a value that defaults from another field shows that value", () => {
  it("shows the Project URL in SUPABASE_URL until the admin types their own", () => {
    expect(open(urlOnly, { upstreamUrl: "https://abcd1234.supabase.co" }).value).toBe("https://abcd1234.supabase.co");
  });

  it("an admin-typed value wins over the default", () => {
    const typed = [{ ...urlOnly[0], value: "https://custom.example.com" }];
    expect(open(typed, { upstreamUrl: "https://abcd1234.supabase.co" }).value).toBe("https://custom.example.com");
  });

  it("a cleared value shows the default as its hint (saving uses it)", () => {
    const input = open([{ ...urlOnly[0], value: "" }], { upstreamUrl: "https://abcd1234.supabase.co" });
    expect(input.value).toBe("");
    expect(input.placeholder).toBe("https://abcd1234.supabase.co");
  });

  it("the value field fits the dialog width (indented without overflowing)", () => {
    const input = open(urlOnly, {});
    expect(input.className).not.toMatch(/\bml-6\b/);
    expect(input.parentElement?.className).toMatch(/\bpl-6\b/);
  });
});
