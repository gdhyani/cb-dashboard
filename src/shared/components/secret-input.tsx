"use client";

import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { fieldClasses, Input } from "@/shared/ui/input";

/**
 * FR-UI-001: the ONLY component that accepts secret text. Write-only: never pre-filled with a stored value,
 * autocomplete off, value lives in the form only until submit.
 */
export const SecretInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { isSet?: boolean }>(
  function SecretInput({ isSet, placeholder, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          autoComplete="off"
          spellCheck={false}
          placeholder={isSet ? "•••••••• set — enter a new value to rotate" : placeholder}
          className="pr-10 font-mono"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide value" : "Show value"}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-subtle hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
);

/** Multi-line secrets (service-account JSON, .p8 keys). Same write-only rules; masked until revealed. */
export const SecretTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { isSet?: boolean }
>(function SecretTextarea({ isSet, placeholder, className, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <textarea
        ref={ref}
        autoComplete="off"
        spellCheck={false}
        rows={5}
        placeholder={isSet ? "•••••••• set — paste a new value to rotate" : placeholder}
        style={visible ? undefined : ({ WebkitTextSecurity: "disc" } as React.CSSProperties)}
        className={`${fieldClasses} min-h-28 resize-y py-2 pr-10 font-mono text-xs leading-relaxed ${className ?? ""}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide value" : "Show value"}
        className="absolute top-2 right-0 flex w-10 items-center justify-center text-subtle hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
