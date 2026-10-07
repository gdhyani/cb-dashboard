import { describe, expect, it } from "vitest";
import { checkCertificate, checkP8, checkServiceAccount, privateCaProvider } from "@/features/variables/lib/catalog";

const KEY =
  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCSECRETKEYBODY0001\n-----END PRIVATE KEY-----\n";
const CERT = "-----BEGIN CERTIFICATE-----\nMIIEQTCCAqmgAwIBAgIUCERTBODYLINE00000001\n-----END CERTIFICATE-----\n";
const SA = { type: "service_account", project_id: "p", client_email: "e@p.iam.gserviceaccount.com", private_key: KEY };

/** No message may carry the secret parts of what was uploaded (field names like client_email may be named). */
const SECRET_PARTS = ["SECRETKEYBODY", "CERTBODYLINE", "SECRETLIKE", "SECRET-ish", "MIIE", "e@p.iam"];
function expectNoEcho(message: string | undefined, _input: string) {
  for (const part of SECRET_PARTS) expect(message ?? "").not.toContain(part);
}

describe("uploaded file checks name the problem, never the content (B4, D2)", () => {
  it("service account: accepts a real key file; refuses certificates, other JSON and missing fields", () => {
    expect(checkServiceAccount(JSON.stringify(SA))).toBeUndefined();
    const cases: [string, RegExp][] = [
      [CERT, /certificate, not a service-account/],
      ["not json at all SECRETLIKE123", /isn't a JSON key file/],
      [JSON.stringify({ ...SA, type: "authorized_user" }), /not a service-account key/],
      [JSON.stringify({ ...SA, private_key: undefined }), /no private_key/],
      [JSON.stringify({ ...SA, client_email: "" }), /no client_email/],
    ];
    for (const [input, reason] of cases) {
      const msg = checkServiceAccount(input);
      expect(msg).toMatch(reason);
      expectNoEcho(msg, input);
    }
  });

  it("CA certificate: accepts PEM; refuses a private key, JSON and junk", () => {
    expect(checkCertificate(CERT)).toBeUndefined();
    for (const [input, reason] of [
      [KEY, /private key/],
      [JSON.stringify(SA), /JSON file/],
      ["SECRET-ish junk 123456789", /isn't a PEM certificate/],
    ] as const) {
      const msg = checkCertificate(input);
      expect(msg).toMatch(reason);
      expectNoEcho(msg, input);
    }
  });

  it(".p8: accepts a private key; refuses a certificate", () => {
    expect(checkP8(KEY)).toBeUndefined();
    expect(checkP8(CERT)).toMatch(/certificate/);
  });

  it("D3 private-CA providers are recognised from the database URL", () => {
    expect(privateCaProvider("mysql://u:p@testcb-x.aivencloud.com:12345/defaultdb")).toBe("Aiven");
    expect(privateCaProvider("postgresql://u:p@db-x.db.ondigitalocean.com:25060/app")).toBe("DigitalOcean");
    expect(privateCaProvider("postgresql://u:p@ep-x.neon.tech/app")).toBeUndefined();
    expect(privateCaProvider("not a url")).toBeUndefined();
  });
});
