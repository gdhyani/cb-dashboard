import { describe, expect, it } from "vitest";
import { KINDS, toBody } from "@/features/resources/lib/kinds";

const PEM = "-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----";

describe("per-resource CA certificate (self-hosted databases)", () => {
  it("offers an optional CA certificate on database and mail kinds only", () => {
    for (const kind of ["postgres", "mysql", "mongodb", "redis", "smtp"] as const)
      expect(
        KINDS[kind].settings.find((f) => f.name === "caCert"),
        kind,
      ).toMatchObject({ optional: true, type: "multiline" });
    expect(KINDS.http.settings.find((f) => f.name === "caCert")).toBeUndefined();
  });

  it("sends the PEM trimmed, and nothing when left empty", () => {
    const fields = KINDS.postgres.settings;
    expect(toBody(fields, { caCert: `\n${PEM}\n` })).toEqual({ caCert: PEM });
    expect(toBody(fields, { caCert: "  " })).toEqual({});
  });
});
