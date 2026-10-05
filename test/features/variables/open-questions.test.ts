import { describe, expect, it } from "vitest";
import { buildCreateRequest, parseHeaderLines, TYPES } from "@/features/variables/lib/catalog";

describe("OQ8 Google key as a file path", () => {
  it("'A file path' maps to the credentialsFile field", () => {
    const req = buildCreateRequest({
      key: "GOOGLE_APPLICATION_CREDENTIALS",
      type: "gcp",
      value: '{"type":"service_account"}',
      fields: { readsAs: "file" },
      extras: [],
    });
    expect(req.body.mainField).toBe("credentialsFile");
  });
});

describe("OQ9 API services: CA certificate and extra headers", () => {
  it("parses 'Name: value' lines; rejects keys and malformed lines", () => {
    expect(parseHeaderLines("OpenAI-Organization: org_1\n\n x-beta : a=b:c ")).toEqual({
      headers: { "OpenAI-Organization": "org_1", "x-beta": "a=b:c" },
    });
    expect(parseHeaderLines("Authorization: Bearer x").error).toMatch(/set by cb/);
    expect(parseHeaderLines("no colon here").error).toMatch(/Name: value/);
  });

  it("an API key service sends caCert and the parsed headers", () => {
    const req = buildCreateRequest({
      key: "INTERNAL_API_KEY",
      type: "http",
      value: "real",
      fields: {
        upstreamUrl: "https://api.internal.example",
        caCert: "-----BEGIN CERTIFICATE-----\nAAA\n-----END CERTIFICATE-----",
        extraHeaders: "x-tenant: shop",
      },
      extras: [],
    });
    expect(req.body.resource).toMatchObject({
      caCert: expect.stringContaining("BEGIN CERTIFICATE"),
      extraHeaders: { "x-tenant": "shop" },
    });
  });

  it("AI services offer extra headers too", () => {
    expect(TYPES.ai.advanced("openai").map((f) => f.name)).toContain("extraHeaders");
  });
});
