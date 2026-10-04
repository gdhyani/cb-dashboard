import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CaCertDialog } from "@/features/resources/components/ca-cert-dialog";
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

  it("saves a new certificate, and removes it with an empty string", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { unmount } = render(
      <CaCertDialog open onOpenChange={() => {}} resourceName="orders-db" current="" pending={false} onSave={onSave} />,
    );
    fireEvent.change(screen.getByLabelText("CA certificate (PEM)"), { target: { value: PEM } });
    fireEvent.click(screen.getByRole("button", { name: "Save certificate" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(PEM));
    unmount();
    render(
      <CaCertDialog
        open
        onOpenChange={() => {}}
        resourceName="orders-db"
        current={PEM}
        pending={false}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove certificate" }));
    await waitFor(() => expect(onSave).toHaveBeenLastCalledWith(""));
  });
});
