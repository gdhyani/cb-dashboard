import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArchitectureDiagram } from "@/features/docs/components/architecture-diagram";
import { Callout } from "@/features/docs/components/callout";
import { EnvTable } from "@/features/docs/components/env-table";
import { Field } from "@/features/docs/components/field";
import { Fields } from "@/features/docs/components/fields";
import { Frame } from "@/features/docs/components/frame";
import { RequestFlowDiagram } from "@/features/docs/components/request-flow-diagram";
import { RoutingLayersDiagram } from "@/features/docs/components/routing-layers-diagram";
import { StatusBadge } from "@/features/docs/components/status-badge";
import { WebhookFlowDiagram } from "@/features/docs/components/webhook-flow-diagram";

vi.mock("next/image", () => ({
  // biome-ignore lint/performance/noImgElement: test double for next/image
  default: ({ alt, ...props }: { src: string; alt: string; className?: string }) => <img alt={alt} {...props} />,
}));

describe("FR-DOC-007 Frame", () => {
  it("renders the framed screenshot full width with alt text and a caption", () => {
    render(
      <Frame src="/docs/images/quick-start/add-variable.png" alt="Add variable dialog" caption="The Add dialog" />,
    );
    const img = screen.getByAltText("Add variable dialog");
    expect(img).toHaveClass("w-full", "h-auto");
    expect(screen.getByText("The Add dialog")).toBeInTheDocument();
  });
});

describe("FR-DOC-007 Callout", () => {
  it.each(["note", "tip", "warning", "danger"] as const)("renders a %s with its role", (type) => {
    render(<Callout type={type}>Body</Callout>);
    const box = screen.getByRole(type === "danger" || type === "warning" ? "alert" : "note");
    expect(box).toHaveAttribute("data-callout", type);
    expect(box).toHaveTextContent("Body");
  });
});

describe("FR-DOC-007 Fields", () => {
  it("required block is open; optional block is collapsed until clicked", () => {
    render(
      <>
        <Fields title="Required">
          <Field name="Key" type="text" required>
            Name your app reads.
          </Field>
        </Fields>
        <Fields title="Optional (Advanced)" collapsible>
          <Field name="Port" type="number" default="5432">
            Upstream port.
          </Field>
        </Fields>
      </>,
    );
    expect(screen.getByText("Name your app reads.")).toBeVisible();
    expect(screen.getByText("Upstream port.")).not.toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Optional \(Advanced\)/ }));
    expect(screen.getByText("Upstream port.")).toBeVisible();
    expect(screen.getByText("5432")).toBeInTheDocument();
  });
});

describe("FR-DOC-006 EnvTable", () => {
  it("lists each variable with its example and kind", () => {
    render(
      <EnvTable
        rows={[{ name: "DATABASE_URL", example: "postgresql://cbu_ab12cd34:…@127.0.0.1:7401/app", kind: "stand-in" }]}
      />,
    );
    expect(screen.getByRole("columnheader", { name: "Variable" })).toBeInTheDocument();
    expect(screen.getByText("DATABASE_URL")).toBeInTheDocument();
    expect(screen.getByText("Stand-in")).toBeInTheDocument();
  });
});

describe("FR-DOC-006 / FR-DOC-009 StatusBadge", () => {
  it.each([
    ["supported", "Supported"],
    ["beta", "Beta"],
    ["coming-soon", "Coming soon"],
  ] as const)("%s reads %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe("FR-DOC-007 diagrams", () => {
  it.each([
    ["architecture", ArchitectureDiagram, ["Your app", "cb agent", "cb gateway", "Real service"]],
    ["request flow", RequestFlowDiagram, ["Stand-in", "Real credential"]],
    ["routing layers", RoutingLayersDiagram, ["Layer 1", "Layer 2"]],
    ["webhooks", WebhookFlowDiagram, ["Provider", "cb backend", "Your device"]],
  ] as const)("%s is a labelled, framed SVG", (_name, Diagram, labels) => {
    render(<Diagram />);
    const svg = screen.getByRole("img");
    expect(svg.getAttribute("aria-label")).toBeTruthy();
    expect(svg.closest("[data-docs-frame]")).not.toBeNull();
    for (const l of labels) expect(screen.getAllByText(l).length).toBeGreaterThan(0);
  });
});
