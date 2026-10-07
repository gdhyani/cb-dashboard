"use client";

import { FileUp } from "lucide-react";
import { useId, useRef, useState } from "react";

/** Files are read in the browser and handed to the field as text; Windows saves (BOM, CRLF) are normalised. */
export function normalizeFileText(text: string): string {
  return text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
}

/**
 * Pick or drop a key / certificate file (service-account JSON, CA .pem, .p8) instead of pasting it. The content goes
 * straight into the form field (write-only, FR-UI-001) and is never rendered here — only the file name is shown.
 */
export function FileDrop({
  accept,
  maxBytes,
  label,
  onText,
  onError,
  filled = true,
  children,
}: {
  accept: string;
  maxBytes: number;
  /** What the file is, e.g. "CA certificate" (names the zone for screen readers). */
  label: string;
  onText: (text: string) => void;
  onError: (message: string) => void;
  /** M9: whether the field still holds a value; once it is cleared the file name is no longer shown. */
  filled?: boolean;
  /** The field itself: a file dropped on it is read in too, instead of the browser opening the file (M9). */
  children?: React.ReactNode;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [name, setName] = useState<string>();
  if (!filled && name) setName(undefined);

  async function handle(file: File | undefined) {
    if (input.current) input.current.value = "";
    if (!file) return;
    if (file.size > maxBytes) {
      setName(undefined);
      onError(`That file is too large for a ${label} (max ${Math.round(maxBytes / 1000)} KB).`);
      return;
    }
    let text: string;
    try {
      text = normalizeFileText(await file.text());
    } catch {
      // M9: the browser's read error is not shown (it can name local paths); the admin gets a plain next step.
      setName(undefined);
      onError("Couldn't read that file. Choose it again or paste its content.");
      return;
    }
    setName(file.name);
    onText(text);
  }

  return (
    // M9: dragover/drop are handled for the whole component (field + zone) so the browser never opens the file.
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop only; the keyboard path is the labelled file input
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void handle(e.dataTransfer.files?.[0]);
      }}
    >
      {children}
      {/* biome-ignore lint/a11y/useSemanticElements: a drop zone wrapping a labelled file input; fieldset would add a border/legend */}
      <div
        role="group"
        aria-label={`${label} file`}
        className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-dashed px-3 py-2 text-xs transition-colors ${
          over ? "border-foreground text-foreground" : "border-border text-subtle"
        }`}
      >
        <FileUp aria-hidden className="size-3.5 shrink-0" />
        <span>Drop the file here or</span>
        <label
          htmlFor={id}
          className="cursor-pointer text-foreground underline underline-offset-2 focus-within:outline-2"
        >
          choose a file
          <input
            id={id}
            ref={input}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => void handle(e.target.files?.[0])}
          />
        </label>
        {name && <span className="ml-auto truncate font-mono text-foreground">{name} — read</span>}
      </div>
    </div>
  );
}
