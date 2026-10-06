import { describe, expect, it } from "vitest";
import type { Resource } from "@/features/resources";
import {
  buildCreateRequest,
  dialogTitle,
  fieldError,
  QUICK_ADD,
  TYPE_GROUPS,
  TYPES,
} from "@/features/variables/lib/catalog";
import { chipLabel, typeOfResource } from "@/features/variables/lib/group";

describe("FR-GW-005 Supabase type: project URL + secret key, public values as plain extras", () => {
  it("is a Databases type with a Quick add chip", () => {
    expect(TYPE_GROUPS.find((g) => g.group === "Databases")?.ids).toContain("supabase");
    expect(QUICK_ADD.some((q) => q.type === "supabase")).toBe(true);
    expect(dialogTitle("Add", "supabase")).toBe("Add Supabase variable");
  });

  it("maps to the supabase preset with the project host redirected and the URL / publishable key as extras", () => {
    const req = buildCreateRequest({
      key: "SUPABASE_SECRET_KEY",
      type: "supabase",
      value: "sb_secret_real",
      fields: { upstreamUrl: "https://abcd1234.supabase.co" },
      extras: [
        { suggestedKey: "SUPABASE_URL", key: "SUPABASE_URL", on: true },
        { suggestedKey: "NEXT_PUBLIC_SUPABASE_URL", key: "NEXT_PUBLIC_SUPABASE_URL", on: true },
        {
          suggestedKey: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
          key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
          on: true,
          value: "sb_publishable_x",
        },
      ],
    });
    expect(req.body).toMatchObject({
      key: "SUPABASE_SECRET_KEY",
      preset: "supabase",
      resource: {
        kind: "http",
        upstreamUrl: "https://abcd1234.supabase.co",
        apiKey: "sb_secret_real",
        redirectHosts: ["abcd1234.supabase.co:443"],
      },
      extras: [
        { key: "SUPABASE_URL", value: "https://abcd1234.supabase.co" },
        { key: "NEXT_PUBLIC_SUPABASE_URL", value: "https://abcd1234.supabase.co" },
        { key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", value: "sb_publishable_x" },
      ],
    });
  });

  it("checks the project URL and the key shape before saving", () => {
    const req = TYPES.supabase.required();
    expect(fieldError(req, { upstreamUrl: "abcd.supabase.co" })).toMatch(/https:\/\//);
    expect(fieldError(req, { upstreamUrl: "https://abcd1234.supabase.co" })).toBeUndefined();
    expect(TYPES.supabase.value?.validate?.("sb_publishable_oops")).toMatch(/secret key/);
    expect(TYPES.supabase.value?.validate?.("sb_secret_ok")).toBeUndefined();
  });

  it("stored Supabase services group under the type", () => {
    const r = {
      kind: "http",
      config: { provider: "supabase", upstreamUrl: "https://abcd.supabase.co" },
    } as unknown as Resource;
    expect(typeOfResource(r)).toEqual({ type: "supabase" });
    expect(chipLabel("supabase")).toBe("Supabase");
  });
});
