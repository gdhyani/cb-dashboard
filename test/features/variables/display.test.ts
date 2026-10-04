import { describe, expect, it } from "vitest";
import { describeValue } from "@/features/variables/lib/display";
import type { Variable } from "@/features/variables/types";

const v = (field: string): Variable => ({
  id: field,
  environmentId: "e",
  key: field.toUpperCase(),
  type: "brokered",
  required: false,
  value: null,
  format: null,
  resourceId: "r",
  resourceName: null,
  field,
  updatedAt: "",
});

describe("value column for protected keys (legacy groups)", () => {
  it("says what the key really holds, even when a legacy group shows it first", () => {
    expect(describeValue(v("host"), true).text).toBe("local URL, set by cb");
    expect(describeValue(v("clientEmail"), true).text).toBe("from the service settings");
    expect(describeValue(v("url"), true).text).toContain("real value hidden");
    expect(describeValue(v("privateKey"), true).text).toBe("stand-in, made by cb");
  });
});
