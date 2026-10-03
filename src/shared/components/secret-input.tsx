"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { Input } from "@/shared/ui/input";

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
