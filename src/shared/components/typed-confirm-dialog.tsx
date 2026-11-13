"use client";

import { type ReactNode, useState } from "react";
import { ApiError } from "@/shared/api/api-error";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Admonition } from "./admonition";
import { CopyButton } from "./copy-button";
import { FormField } from "./form-field";
import { PasswordInput } from "./password-input";

/**
 * Supabase TextConfirmDialog for irreversible actions (FR-UI-002): a red warning, the consequences, the exact text to
 * type (copyable), optionally the account password, and a red confirm button that stays disabled until it matches.
 * The password is dropped as soon as the dialog closes.
 */
export function TypedConfirmDialog({
  open,
  onOpenChange,
  title,
  warning,
  children,
  confirmText,
  confirmTextLabel,
  confirmLabel,
  requirePassword = false,
  caseInsensitive = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** One line in the red admonition, e.g. "This cannot be undone". */
  warning: string;
  /** What will happen, shown under the warning. */
  children?: ReactNode;
  /** Text the user must type, e.g. the organization name or their email. */
  confirmText: string;
  confirmTextLabel: string;
  confirmLabel: string;
  requirePassword?: boolean;
  caseInsensitive?: boolean;
  onConfirm: (input: { confirm: string; password: string }) => Promise<unknown>;
}) {
  const [typed, setTyped] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const norm = (v: string) => (caseInsensitive ? v.trim().toLowerCase() : v.trim());
  const matches = norm(typed) === norm(confirmText);
  const ready = matches && (!requirePassword || password.length > 0);

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setTyped("");
      setPassword("");
      setError(undefined);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(undefined);
    try {
      await onConfirm({ confirm: typed.trim(), password });
    } catch (err) {
      setError(err instanceof ApiError ? `${err.message} (${err.code})` : "Something went wrong. Try again");
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <form method="post" onSubmit={submit} className="contents">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <Admonition type="destructive" title={warning} className="-mx-5 -mt-4 w-auto rounded-none border-x-0">
            {children}
          </Admonition>
          <DialogDescription className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-foreground-light">
            Type
            <span className="inline-flex items-center gap-0.5 rounded-md border border-border bg-surface-200 py-0.5 pl-2 font-mono text-xs text-foreground">
              {confirmText}
              <CopyButton value={confirmText} label={`Copy ${confirmTextLabel}`} className="h-6 px-1.5" />
            </span>
            to confirm
          </DialogDescription>
          <FormField id="typed-confirm" label={confirmTextLabel}>
            <Input
              id="typed-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={typed.length > 0 && !matches}
            />
          </FormField>
          {requirePassword && (
            <FormField id="typed-confirm-password" label="Your password" hint="Needed to confirm it is you">
              <PasswordInput
                id="typed-confirm-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </FormField>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!ready} loading={busy}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
