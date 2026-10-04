"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useVariableMutations } from "@/features/variables/hooks/use-variables";
import { FormField } from "@/shared/components/form-field";
import { cn } from "@/shared/lib/utils";
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
import { Skeleton } from "@/shared/ui/skeleton";
import { usePresets, useResourceMutations } from "../hooks/use-resources";
import { type FieldSpec, initialValues, isComplete, KIND_ORDER, KINDS, toBody } from "../lib/kinds";
import type { Preset, ResourceKind } from "../types";
import { KindFields } from "./kind-fields";

const CATEGORY_ORDER: Preset["category"][] = ["AI", "Payments", "Auth", "Database", "Storage", "Email", "Push"];

/** Preset defaults → form values (lists joined, secrets get the preset's placeholder). */
function valuesFromPreset(preset: Preset, fields: FieldSpec[]): Record<string, string> {
  const values = initialValues(fields);
  for (const [key, value] of Object.entries(preset.defaults))
    values[key] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
  return values;
}

function PresetPicker({ onPick, onBlank }: { onPick: (p: Preset) => void; onBlank: () => void }) {
  const presets = usePresets();
  if (presets.isPending)
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-md" />
        ))}
      </div>
    );
  const groups = CATEGORY_ORDER.map((c) => [c, presets.data?.filter((p) => p.category === c) ?? []] as const).filter(
    ([, list]) => list.length,
  );
  return (
    <div className="flex max-h-[55dvh] flex-col gap-4 overflow-y-auto pr-1">
      {groups.map(([category, list]) => (
        <section key={category} className="flex flex-col gap-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">{category}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {list.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick(p)}
                className="flex flex-col items-start gap-0.5 rounded-md border border-border px-3 py-2.5 text-left transition-colors hover:border-border-strong hover:bg-white/[0.03]"
              >
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-[11px] text-subtle">{KINDS[p.kind].label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
      <button
        type="button"
        onClick={onBlank}
        className="rounded-md border border-dashed border-border-strong px-3 py-2.5 text-left text-sm text-muted-foreground hover:text-foreground"
      >
        Start blank — choose the type yourself
      </button>
    </div>
  );
}

/**
 * J2: add a resource, optionally from a provider preset (which also proposes the app's variables).
 * Credentials are write-only (FR-UI-001): sent once, never shown again.
 */
export function ResourceFormDialog({ envId }: { envId: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"pick" | "form">("pick");
  const [preset, setPreset] = useState<Preset | null>(null);
  const [kind, setKind] = useState<ResourceKind>("postgres");
  const [name, setName] = useState("");
  const spec = KINDS[kind];
  const fields = [...spec.settings, ...spec.secrets];
  const [values, setValues] = useState(() => initialValues(fields));
  const [addVariables, setAddVariables] = useState(true);
  const [plainValues, setPlainValues] = useState<Record<string, string>>({});
  const { create } = useResourceMutations(envId);
  const variables = useVariableMutations(envId);

  const pickKind = (next: ResourceKind) => {
    setKind(next);
    setValues(initialValues([...KINDS[next].settings, ...KINDS[next].secrets]));
  };
  const usePreset = (p: Preset) => {
    setPreset(p);
    setKind(p.kind);
    setValues(valuesFromPreset(p, [...KINDS[p.kind].settings, ...KINDS[p.kind].secrets]));
    setName(p.id);
    setStep("form");
  };
  const reset = () => {
    setStep("pick");
    setPreset(null);
    setName("");
    setPlainValues({});
    setAddVariables(true);
    pickKind("postgres");
  };
  const fieldsWithPlaceholder = fields.map((f) =>
    preset && f.type.startsWith("secret") && spec.secrets.length === 1
      ? { ...f, placeholder: preset.secretPlaceholder }
      : f,
  );

  const submit = () =>
    create.mutate(
      { kind, name: name.trim(), ...toBody(fields, values) },
      {
        onSuccess: async (resource) => {
          if (preset && addVariables) {
            await variables.createMany
              .mutateAsync([
                ...preset.variables.map((v) => ({
                  type: "brokered" as const,
                  key: v.key,
                  resourceId: resource.id,
                  field: v.field,
                })),
                ...(preset.plainVariables ?? [])
                  .filter((v) => plainValues[v.key]?.trim())
                  .map((v) => ({ type: "plain" as const, key: v.key, value: plainValues[v.key]?.trim() ?? "" })),
              ])
              .catch(() => undefined);
          }
          setOpen(false);
          reset();
        },
      },
    );

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
          <DialogTitle>{step === "pick" ? "Add resource" : preset ? `Add ${preset.name}` : "Add resource"}</DialogTitle>
          <DialogDescription>
            {step === "pick"
              ? "Start from a provider, or set one up yourself. Real credentials stay on the server."
              : (preset?.description ??
                "Real credentials stay on the server. Developers only ever get per-device fake values.")}
          </DialogDescription>
        </DialogHeader>
        {step === "pick" ? (
          <PresetPicker onPick={usePreset} onBlank={() => setStep("form")} />
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <button
              type="button"
              onClick={() => setStep("pick")}
              className="-mt-2 flex items-center gap-1.5 self-start text-xs text-subtle hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> All providers
            </button>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="resource-kind" label="Type" hint={preset ? undefined : spec.description}>
                <Select value={kind} onValueChange={(v) => pickKind(v as ResourceKind)} disabled={Boolean(preset)}>
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
              fields={fieldsWithPlaceholder}
              values={values}
              onChange={(n, v) => setValues((prev) => ({ ...prev, [n]: v }))}
            />
            {preset && preset.variables.length > 0 && (
              <div className="flex flex-col gap-3 rounded-md border border-border p-3">
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={addVariables}
                    onChange={(e) => setAddVariables(e.target.checked)}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                      addVariables ? "border-foreground bg-foreground text-background" : "border-border-strong",
                    )}
                  >
                    {addVariables && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span>Add the variables apps expect</span>
                    <span className="font-mono text-xs text-subtle">
                      {[...preset.variables.map((v) => v.key), ...(preset.plainVariables ?? []).map((v) => v.key)].join(
                        " · ",
                      )}
                    </span>
                  </span>
                </label>
                {addVariables &&
                  (preset.plainVariables ?? []).map((v) => (
                    <FormField key={v.key} id={`plain-${v.key}`} label={`${v.key} (plain, not secret)`}>
                      <Input
                        id={`plain-${v.key}`}
                        value={plainValues[v.key] ?? ""}
                        placeholder={v.hint}
                        className="font-mono"
                        onChange={(e) => setPlainValues((p) => ({ ...p, [v.key]: e.target.value }))}
                      />
                    </FormField>
                  ))}
              </div>
            )}
            <DialogFooter>
              <Button
                type="submit"
                loading={create.isPending || variables.createMany.isPending}
                disabled={!name.trim() || !isComplete(fields, values)}
              >
                Save resource
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
