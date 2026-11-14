import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrgUnavailable } from "@/features/orgs/components/org-unavailable";
import { ApiError } from "@/shared/api/api-error";

describe("FR-UI-007 org that can't be loaded", () => {
  it("shows one page-level message with the code, correlation id and a way back", () => {
    render(
      <OrgUnavailable
        error={
          new ApiError({ code: "NOT_FOUND", message: "Organization not found.", statusCode: 404, correlationId: "c-1" })
        }
      />,
    );
    expect(screen.getByText("Organization not available")).toBeInTheDocument();
    expect(screen.getByText(/NOT_FOUND · correlation id c-1/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to my organization" })).toHaveAttribute("href", "/dashboard");
  });

  it("shows the server's message for other failures", () => {
    render(
      <OrgUnavailable
        error={
          new ApiError({ code: "INTERNAL_ERROR", message: "Server error.", statusCode: 500, correlationId: "c-2" })
        }
      />,
    );
    expect(screen.getByText("Organization could not be loaded")).toBeInTheDocument();
    expect(screen.getByText("Server error.")).toBeInTheDocument();
  });
});
