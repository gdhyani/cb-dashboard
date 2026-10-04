"use client";

import { useState } from "react";
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
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useResourceMutations } from "../hooks/use-resources";
import { initialValues, isComplete, KIND_ORDER, KINDS, toBody } from "../lib/kinds";
import type { ResourceKind } from "../types";
import { KindFields } from "./kind-fields";

/** J2: add a resource. Credentials are write-only (FR-UI-001): sent once, never shown again. */
export function ResourceFormDialog({ envId }: { envId: string }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ResourceKind>("postgres");
  const [name, setName] = useState("");
  const spec = KINDS[kind];
  const fields = [...spec.settings, ...spec.secrets];
  const [values, setValues] = useState(() => initialValues(fields));
  const { create } = useResourceMutations(envId);

  const pickKind = (next: ResourceKind) => {
    setKind(next);
    setValues(initialValues([...KINDS[next].settings, ...KINDS[next].secrets]));
  };
  const reset = () => {
    setName("");
    pickKind(kind);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Add resource</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add resource</DialogTitle>
          <DialogDescription>
            Real credentials stay on the server. Developers only ever get per-device fake values.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              { kind, name: name.trim(), ...toBody(fields, values) },
              {
                onSuccess: () => {
                  setOpen(false);
                  reset();
                },
              },
            );
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="resource-kind" label="Type" hint={spec.description}>
              <Select value={kind} onValueChange={(v) => pickKind(v as ResourceKind)}>
                <SelectTrigger id="resource-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_ORDER.map((k) => (
                    <SelectItem key={k} value={k}>
                      {KINDS[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="resource-name" label="Name">
              <Input
                id="resource-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={spec.namePlaceholder}
              />
            </FormField>
          </div>
          <KindFields
            idPrefix="resource"
            fields={fields}
            values={values}
            onChange={(n, v) => setValues((prev) => ({ ...prev, [n]: v }))}
          />
          <DialogFooter>
            <Button type="submit" loading={create.isPending} disabled={!name.trim() || !isComplete(fields, values)}>
              Save resource
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
