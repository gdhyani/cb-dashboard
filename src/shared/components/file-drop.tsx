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
}: {
  accept: string;
  maxBytes: number;
  /** What the file is, e.g. "CA certificate" (names the zone for screen readers). */
  label: string;
  onText: (text: string) => void;
  onError: (message: string) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [name, setName] = useState<string>();

  async function handle(file: File | undefined) {
    if (input.current) input.current.value = "";
    if (!file) return;
    if (file.size > maxBytes) {
      onError(`That file is too large for a ${label} (max ${Math.round(maxBytes / 1000)} KB).`);
      return;
    }
    const text = normalizeFileText(await file.text());
    setName(file.name);
    onText(text);
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: a drop zone wrapping a labelled file input; fieldset would add a border/legend
    <div
      role="group"
      aria-label={`${label} file`}
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
  );
}
