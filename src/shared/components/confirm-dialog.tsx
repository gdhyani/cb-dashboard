"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { FormField } from "./form-field";

interface ConfirmDialogProps {
  /** Optional trigger; omit and control with `open`/`onOpenChange` when opened from a menu. */
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  /** FR-UI-002: when set, the user must give a reason (environment suspension). */
  requireReason?: boolean;
  onConfirm: (reason: string) => Promise<unknown> | undefined;
}

/** FR-UI-002: every destructive action goes through this dialog. */
export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = true,
  requireReason = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [innerOpen, setInnerOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const isOpen = open ?? innerOpen;
  const setOpen = (next: boolean) => {
    (onOpenChange ?? setInnerOpen)(next);
    if (!next) setReason("");
  };
  const blocked = requireReason && reason.trim().length < 3;
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {requireReason && (
          <FormField id="confirm-reason" label="Reason" hint="Shown to developers and recorded in the activity log.">
            <Input
              id="confirm-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Suspected credential leak"
              autoFocus
            />
          </FormField>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={blocked}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm(reason.trim());
                setOpen(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
