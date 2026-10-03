import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api/api-error";
import { shouldRetry } from "@/shared/api/query-client";

const err = (statusCode: number, code = "X") => new ApiError({ code, message: "m", statusCode, correlationId: "c" });

describe("query retry policy", () => {
  it("does not retry client errors", () => {
    expect(shouldRetry(0, err(404))).toBe(false);
    expect(shouldRetry(0, err(401))).toBe(false);
  });

  it("retries network and server errors up to twice", () => {
    const network = new ApiError({
      code: "NETWORK_ERROR",
      message: "m",
      statusCode: 0,
      correlationId: "c",
      isNetwork: true,
    });
    expect(shouldRetry(0, network)).toBe(true);
    expect(shouldRetry(1, err(503))).toBe(true);
    expect(shouldRetry(2, err(503))).toBe(false);
  });
});
