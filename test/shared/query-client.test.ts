import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api/api-error";
import { makeQueryClient, shouldRetry } from "@/shared/api/query-client";

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

describe("FR-UI-006 expired session handling", () => {
  it("calls onUnauthorized when a query fails with UNAUTHORIZED", async () => {
    const onUnauthorized = vi.fn();
    const client = makeQueryClient({ onUnauthorized });
    await client
      .fetchQuery({ queryKey: ["x"], queryFn: () => Promise.reject(err(401, "UNAUTHORIZED")) })
      .catch(() => {});
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("ignores wrong-password and other errors", async () => {
    const onUnauthorized = vi.fn();
    const client = makeQueryClient({ onUnauthorized });
    await client
      .getMutationCache()
      .build(client, { mutationFn: () => Promise.reject(err(401, "INVALID_CREDENTIALS")) })
      .execute(undefined)
      .catch(() => {});
    await client.fetchQuery({ queryKey: ["y"], queryFn: () => Promise.reject(err(403, "FORBIDDEN")) }).catch(() => {});
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("can skip the redirect for a query that expects to be signed out", async () => {
    const onUnauthorized = vi.fn();
    const client = makeQueryClient({ onUnauthorized });
    await client
      .fetchQuery({
        queryKey: ["me"],
        queryFn: () => Promise.reject(err(401, "UNAUTHORIZED")),
        meta: { allowSignedOut: true },
      })
      .catch(() => {});
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
