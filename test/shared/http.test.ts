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

  it("sends the CSRF header on mutations only", async () => {
    mock
      .onPost("/x")
      .reply((config) => [
        200,
        { success: true, data: config.headers?.["x-cb-csrf"] ?? null, meta: { correlationId: "c" } },
      ]);
    mock
      .onGet("/x")
      .reply((config) => [
        200,
        { success: true, data: config.headers?.["x-cb-csrf"] ?? null, meta: { correlationId: "c" } },
      ]);
    expect(await apiPost<string>("/x")).toBe("1");
    expect(await apiGet<string | null>("/x")).toBeNull();
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

describe("ApiError cause (M11, FR-UI-001)", () => {
  it("M11 keeps only the method and the path without its query string, never the full request URL", async () => {
    mock.onGet(/\/orgs\/o1\/things/).reply(404, { success: false, error: { code: "NOT_FOUND", message: "nope" } });
    mock.onGet(/\/down/).networkError();
    const failed = [
      await apiGet("/orgs/o1/things?token=stand-in-value#frag").catch((e: unknown) => e),
      await apiGet("/down?q=stand-in-value").catch((e: unknown) => e),
    ];
    for (const err of failed) {
      expect(err).toBeInstanceOf(ApiError);
      const cause = (err as ApiError).cause as Record<string, unknown>;
      expect(cause).not.toHaveProperty("url");
      expect(JSON.stringify(cause)).not.toContain("stand-in-value");
      expect(cause.method).toBe("get");
    }
    expect(((failed[0] as ApiError).cause as Record<string, unknown>).path).toBe("/orgs/o1/things");
    expect(((failed[1] as ApiError).cause as Record<string, unknown>).path).toBe("/down");
  });
});
