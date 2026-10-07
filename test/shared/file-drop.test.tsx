import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { FileDrop } from "@/shared/components/file-drop";

const PEM = "-----BEGIN CERTIFICATE-----\nMIIBszCCAVmgAwIBAgIUSECRETBODY\n-----END CERTIFICATE-----\n";
const windows = (s: string) => `﻿${s.replace(/\n/g, "\r\n")}`;

function setup(maxBytes = 32_000) {
  const onText = vi.fn();
  const onError = vi.fn();
  render(
    <FileDrop accept=".pem,.crt,.cer" maxBytes={maxBytes} label="CA certificate" onText={onText} onError={onError} />,
  );
  return { onText, onError, input: screen.getByLabelText(/choose a file/i) as HTMLInputElement };
}

describe("FileDrop: pick or drop a key / certificate file", () => {
  it("reads a chosen file into the field with BOM and CRLF removed, and never renders its content", async () => {
    const { onText, input } = setup();
    fireEvent.change(input, { target: { files: [new File([windows(PEM)], "ca.pem")] } });
    await waitFor(() => expect(onText).toHaveBeenCalledWith(PEM));
    expect(document.body.textContent).not.toContain("SECRETBODY");
    expect(input.value).toBe("");
  });

  it("accepts a dropped file", async () => {
    const { onText } = setup();
    const zone = screen.getByRole("group", { name: /CA certificate file/i });
    fireEvent.drop(zone, { dataTransfer: { files: [new File([PEM], "ca.pem")] } });
    await waitFor(() => expect(onText).toHaveBeenCalledWith(PEM));
  });

  it("refuses a file over the size limit without reading it", async () => {
    const { onText, onError, input } = setup(100);
    fireEvent.change(input, { target: { files: [new File(["x".repeat(500)], "big.pem")] } });
    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.stringMatching(/too large/)));
    expect(onText).not.toHaveBeenCalled();
  });

  it("shows only the file name once read, never the content", async () => {
    const { input } = setup();
    fireEvent.change(input, { target: { files: [new File([PEM], "aiven-ca.pem")] } });
    await screen.findByText(/aiven-ca\.pem/);
  });

  it("D4 the file input never offers autocomplete and the zone is keyboard reachable", () => {
    const { input } = setup();
    expect(input.getAttribute("accept")).toBe(".pem,.crt,.cer");
    expect(input.getAttribute("type")).toBe("file");
  });

  it("M9 a file that can't be read shows a plain error, never throws, and names no file", async () => {
    const { onText, onError, input } = setup();
    const broken = new File([PEM], "locked.pem");
    Object.defineProperty(broken, "text", { value: () => Promise.reject(new Error("NotReadableError")) });
    fireEvent.change(input, { target: { files: [broken] } });
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith("Couldn't read that file. Choose it again or paste its content."),
    );
    expect(onText).not.toHaveBeenCalled();
    expect(screen.queryByText(/locked\.pem/)).toBeNull();
  });

  it("M9 the file name goes away once the field is cleared", async () => {
    function Field() {
      const [value, setValue] = useState("");
      return (
        <FileDrop
          accept=".pem"
          maxBytes={32_000}
          label="CA certificate"
          onText={setValue}
          onError={vi.fn()}
          filled={value !== ""}
        >
          <button type="button" onClick={() => setValue("")}>
            Clear
          </button>
        </FileDrop>
      );
    }
    render(<Field />);
    fireEvent.change(screen.getByLabelText(/choose a file/i), { target: { files: [new File([PEM], "aiven-ca.pem")] } });
    await screen.findByText(/aiven-ca\.pem/);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByText(/aiven-ca\.pem/)).toBeNull();
  });

  it("M9 a file dropped on the field itself is read in, and the browser never opens it", async () => {
    const onText = vi.fn();
    render(
      <FileDrop accept=".pem" maxBytes={32_000} label="CA certificate" onText={onText} onError={vi.fn()}>
        <textarea aria-label="CA certificate value" />
      </FileDrop>,
    );
    const field = screen.getByLabelText("CA certificate value");
    // fireEvent returns false when the default (navigate to / open the file) was prevented.
    expect(fireEvent.dragOver(field)).toBe(false);
    expect(fireEvent.drop(field, { dataTransfer: { files: [new File([PEM], "ca.pem")] } })).toBe(false);
    await waitFor(() => expect(onText).toHaveBeenCalledWith(PEM));
  });
});
