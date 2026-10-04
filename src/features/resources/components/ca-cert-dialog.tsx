"use client";

import { useState } from "react";
import { FormField } from "@/shared/components/form-field";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";

/** Add, replace or remove the public CA certificate a self-hosted or private-CA server presents. */
export function CaCertDialog({
  open,
  onOpenChange,
  resourceName,
  current,
  pending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceName: string;
  current: string;
  pending: boolean;
  /** "" removes the certificate. */
  onSave: (caCert: string) => Promise<unknown>;
}) {
  const [value, setValue] = useState(current);
  const save = async (next: string) => {
    await onSave(next);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>CA certificate for {resourceName}</DialogTitle>
          <DialogDescription>
            Only needed when the server's certificate isn't issued by a public CA. It's public, not a secret: the
            gateway trusts it for this resource only and still checks the host name.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void save(value.trim());
          }}
        >
          <FormField id="ca-cert" label="CA certificate (PEM)">
            <Textarea
              id="ca-cert"
              rows={8}
              className="font-mono text-xs"
              value={value}
              placeholder={"-----BEGIN CERTIFICATE-----\n…\n-----END CERTIFICATE-----"}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormField>
          <DialogFooter className="gap-2 sm:justify-between">
            {current ? (
              <Button type="button" variant="ghost" disabled={pending} onClick={() => void save("")}>
                Remove certificate
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={pending || !value.trim() || value.trim() === current.trim()}>
              Save certificate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
