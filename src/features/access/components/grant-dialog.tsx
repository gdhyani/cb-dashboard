"use client";

import { addHours } from "date-fns";
import { type ReactNode, useState } from "react";
import { FormField } from "@/shared/components/form-field";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const DURATIONS = [
  { value: "permanent", label: "No expiry", hours: 0 },
  { value: "1h", label: "1 hour", hours: 1 },
  { value: "8h", label: "8 hours", hours: 8 },
  { value: "24h", label: "1 day", hours: 24 },
  { value: "168h", label: "1 week", hours: 168 },
];

/** J4: permanent or temporary access. */
export function GrantDialog({
  trigger,
  title,
  onGrant,
}: {
  trigger: ReactNode;
  title: string;
  onGrant: (expiresAt: string | null) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState("permanent");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Time-limited access ends automatically, and active connections are terminated when it expires.
          </DialogDescription>
        </DialogHeader>
        <FormField id="grant-duration" label="Duration">
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger id="grant-duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <DialogFooter>
          <Button
            disabled={busy}
            onClick={async () => {
              const hours = DURATIONS.find((d) => d.value === duration)?.hours ?? 0;
              setBusy(true);
              try {
                await onGrant(hours ? addHours(new Date(), hours).toISOString() : null);
                setOpen(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            Grant access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
