"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useResources } from "@/features/resources/hooks/use-resources";
import { FormField } from "@/shared/components/form-field";
import { SecretInput } from "@/shared/components/secret-input";
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
import { useVariableMutations } from "../hooks/use-variables";
import { type CreateVariableInput, GENERATED_FORMATS, type VariableType } from "../types";

const TYPE_HELP: Record<VariableType, string> = {
  plain: "Non-secret value, same for everyone (PORT, feature flags).",
  generated: "Personal random value per developer (session secrets). Worthless anywhere else.",
  brokered: "Fake per-device value routed through cb; the real credential stays on the server.",
  visible: "Real value given to developers. Last resort — it ends up on laptops.",
};

/** J3: define a variable of any type. */
export function VariableFormDialog({ envId }: { envId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<VariableType>("plain");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [format, setFormat] = useState<string>("hex:32");
  const [resourceId, setResourceId] = useState("");
  const [field, setField] = useState("");
  const resources = useResources(envId);
  const { create } = useVariableMutations(envId);
  const resource = resources.data?.find((r) => r.id === resourceId);

  const body = (): CreateVariableInput => {
    if (type === "plain" || type === "visible") return { type, key, value };
    if (type === "generated") return { type, key, format };
    return { type, key, resourceId, field };
  };
  const valid =
    /^[A-Z_][A-Z0-9_]*$/.test(key) &&
    (type === "generated" || (type === "brokered" ? Boolean(resourceId && field) : type === "plain" || Boolean(value)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add variable</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add variable</DialogTitle>
          <DialogDescription>{TYPE_HELP[type]}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(body(), {
              onSuccess: () => {
                setOpen(false);
                setKey("");
                setValue("");
              },
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField id="var-key" label="Key">
              <Input
                id="var-key"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
                placeholder="DATABASE_URL"
                className="font-mono"
                autoFocus
              />
            </FormField>
            <FormField id="var-type" label="Type">
              <Select value={type} onValueChange={(v) => setType(v as VariableType)}>
                <SelectTrigger id="var-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plain">plain</SelectItem>
                  <SelectItem value="brokered">brokered</SelectItem>
                  <SelectItem value="generated">generated</SelectItem>
                  <SelectItem value="visible">visible (real value)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          {type === "plain" && (
            <FormField id="var-value" label="Value">
              <Input id="var-value" value={value} onChange={(e) => setValue(e.target.value)} className="font-mono" />
            </FormField>
          )}
          {type === "visible" && (
            <>
              <p
                role="note"
                className="flex items-start gap-2 rounded-md border border-destructive/40 p-3 text-xs text-destructive"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                This real value is delivered to every developer with access. Prefer a brokered resource whenever the
                service supports it.
              </p>
              <FormField id="var-secret" label="Real value" hint="Write-only in the dashboard.">
                <SecretInput id="var-secret" value={value} onChange={(e) => setValue(e.target.value)} />
              </FormField>
            </>
          )}
          {type === "generated" && (
            <FormField id="var-format" label="Format">
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="var-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENERATED_FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
          {type === "brokered" && (
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="var-resource"
                label="Resource"
                hint={resources.data?.length === 0 ? "Add a resource first." : undefined}
              >
                <Select
                  value={resourceId}
                  onValueChange={(v) => {
                    setResourceId(v);
                    setField(resources.data?.find((r) => r.id === v)?.brokeredFields[0] ?? "");
                  }}
                >
                  <SelectTrigger id="var-resource">
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.data?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} ({r.kind})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="var-field" label="Field">
                <Select value={field} onValueChange={setField} disabled={!resource}>
                  <SelectTrigger id="var-field">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {resource?.brokeredFields.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={!valid || create.isPending}>
              Save variable
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
