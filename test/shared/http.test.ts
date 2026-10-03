import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api/api-error";
import { apiGet, apiGetPaginated, apiPost, http } from "@/shared/api/http";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
});
afterEach(() => mock.restore());

const pagination = { page: 1, pageSize: 2, total: 3, totalPages: 2, hasNext: true, hasPrev: false };

describe("http instance", () => {
  it("sends a generated correlation id", async () => {
    mock
      .onGet("/things")
      .reply((config) => [
        200,
        { success: true, data: config.headers?.["x-correlation-id"], meta: { correlationId: "x" } },
      ]);
    expect(await apiGet<string>("/things")).toMatch(UUID);
  });

  it("sends the flow's correlation id when provided", async () => {
    mock
      .onGet("/things")
      .reply((config) => [
        200,
        { success: true, data: config.headers?.["x-correlation-id"], meta: { correlationId: "x" } },
      ]);
    expect(await apiGet<string>("/things", { correlationId: "flow-7" })).toBe("flow-7");
  });

  it("unwraps the success envelope", async () => {
    mock.onPost("/projects").reply(201, { success: true, data: { id: "p1" }, meta: { correlationId: "c1" } });
    expect(await apiPost<{ id: string }>("/projects", { name: "x" })).toEqual({ id: "p1" });
  });

  it("unwraps paginated lists", async () => {
    mock
      .onGet("/projects")
      .reply(200, { success: true, data: [{ id: "a" }, { id: "b" }], meta: { correlationId: "c", pagination } });
    expect(await apiGetPaginated<{ id: string }>("/projects")).toEqual({
      items: [{ id: "a" }, { id: "b" }],
      pagination,
    });
  });

  it("turns the error envelope into an ApiError", async () => {
    mock.onGet("/projects/x").reply(404, {
      success: false,
      error: {
        code: "PROJECT_NOT_FOUND",
        message: "Project not found",
        statusCode: 404,
        details: [{ path: "id", message: "x" }],
        correlationId: "c-404",
      },
    });
    const err = await apiGet("/projects/x").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found",
      statusCode: 404,
      details: [{ path: "id", message: "x" }],
      correlationId: "c-404",
      isNetwork: false,
    });
  });

  it("turns network failures into NETWORK_ERROR", async () => {
    mock.onGet("/down").networkError();
    const err = await apiGet("/down").catch((e: unknown) => e);
    expect(err).toMatchObject({ code: "NETWORK_ERROR", statusCode: 0, isNetwork: true });
    expect((err as ApiError).correlationId).toMatch(UUID);
  });

  it("turns non-envelope error responses into UNEXPECTED_RESPONSE", async () => {
    mock.onGet("/html").reply(502, "<html>bad gateway</html>");
    const err = await apiGet("/html").catch((e: unknown) => e);
    expect(err).toMatchObject({ code: "UNEXPECTED_RESPONSE", statusCode: 502 });
  });
});
