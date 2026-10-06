"use client";

import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { fieldClasses } from "@/shared/ui/input";
import { PasswordInput } from "./password-input";

/**
 * FR-UI-001: the ONLY component that accepts secret text. Write-only: never pre-filled with a stored value,
 * autocomplete off, value lives in the form only until submit.
 */
export const SecretInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { isSet?: boolean }>(
  function SecretInput({ isSet, placeholder, ...props }, ref) {
    return (
      <PasswordInput
        ref={ref}
        noun="value"
        spellCheck={false}
        placeholder={isSet ? "•••••••• set — enter a new value to rotate" : placeholder}
        className="font-mono"
        {...props}
        // D4: last, so no caller can turn the browser's password manager back on for a secret.
        autoComplete="new-password"
      />
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
        spellCheck={false}
        rows={5}
        placeholder={isSet ? "•••••••• set — paste a new value to rotate" : placeholder}
        style={visible ? undefined : ({ WebkitTextSecurity: "disc" } as React.CSSProperties)}
        className={`${fieldClasses} min-h-28 resize-y py-2 pr-10 font-mono text-xs leading-relaxed ${className ?? ""}`}
        {...props}
        autoComplete="off"
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
