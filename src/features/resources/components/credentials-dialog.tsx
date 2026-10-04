"use client";

import { useState } from "react";
import { FormField } from "@/shared/components/form-field";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { initialValues, isComplete, KINDS, toBody } from "../lib/kinds";
import type { CredentialsInput, Resource } from "../types";
import { KindFields } from "./kind-fields";

/**
 * Write-only credential entry for rotating a resource or a profile, or adding a profile (J2).
 * Values live in this form only until submit.
 */
export function CredentialsDialog({
  resource,
  mode,
  profileName,
  open,
  onOpenChange,
  pending,
  onSubmit,
}: {
  resource: Resource;
  mode: "rotate" | "add-profile";
  profileName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onSubmit: (body: CredentialsInput & { name?: string }) => Promise<unknown>;
}) {
  const fields = KINDS[resource.kind].secrets;
  const [values, setValues] = useState(() => initialValues(fields));
  const [name, setName] = useState("");
  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setValues(initialValues(fields));
      setName("");
    }
  };
  const adding = mode === "add-profile";
  const title = adding
    ? `Add a credential profile to ${resource.name}`
    : `Rotate ${profileName && profileName !== "default" ? `${profileName} on ` : ""}${resource.name}`;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {adding
              ? "A second set of real credentials, e.g. a read-only database user. Choose it per developer under Access."
              : "New connections use the new credentials. Apps keep their fake values; nothing changes on laptops."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit({ ...(adding ? { name } : {}), ...toBody(fields, values) }).then(() => close(false));
          }}
        >
          {adding && (
            <FormField id="profile-name" label="Profile name" hint="Lowercase, e.g. readonly or analytics.">
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder="readonly"
                className="font-mono"
              />
            </FormField>
          )}
          <KindFields
            idPrefix="credentials"
            fields={fields}
            values={values}
            rotating={!adding}
            onChange={(n, v) => setValues((prev) => ({ ...prev, [n]: v }))}
          />
          <DialogFooter>
            <Button type="submit" loading={pending} disabled={!isComplete(fields, values) || (adding && !name.trim())}>
              {adding ? "Add profile" : "Rotate credentials"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
