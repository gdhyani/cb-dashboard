"use client";

import { useMemo, useState } from "react";
import { useServiceMutations } from "@/features/resources";
import { ApiError } from "@/shared/api/api-error";
import { FormError } from "@/shared/components/form-error";
import { FormField } from "@/shared/components/form-field";
import { timeAgo } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { useVariableMutations } from "../hooks/use-variables";
import {
  dialogTitle,
  type FieldDef,
  fieldError,
  formatHeaderLines,
  KEY_PATTERN,
  normalizeKey,
  parseHeaderLines,
  TYPES,
  type TypeId,
} from "../lib/catalog";
import type { ServiceGroup } from "../lib/group";
import { GENERATED_FORMATS, type Variable } from "../types";
import { FieldInput } from "./field-input";
import { ReadonlyLogin } from "./readonly-login";
import { ServiceLogo } from "./service-logo";

const READONLY_TYPES: Partial<Record<TypeId, string>> = {
  mongodb: "Read-only login",
  postgres: "Read-only login",
  mysql: "Read-only login",
  redis: "Read-only login",
  stripe: "Restricted key",
};
const FORMAT: FieldDef = {
  name: "format",
  label: "Format",
  select: GENERATED_FORMATS.map((f) => ({ value: f, label: f })),
};
const KEY_HINT = "Use UPPER_SNAKE_CASE: letters, digits and _, not starting with a digit.";

const hostOf = (u: unknown) => {
  try {
    return new URL(String(u)).host;
  } catch {
    return "";
  }
};
const asText = (v: unknown) =>
  Array.isArray(v) ? v.join(", ") : v && typeof v === "object" ? formatHeaderLines(v) : v == null ? "" : String(v);
const basicType = (v: Variable): TypeId =>
  v.type === "generated" ? "gen" : v.type === "visible" ? "visible" : "plain";

/**
 * D9: rename the key, replace the value (tested, never viewable), change connection settings, rename extra keys.
 * The type never changes here — add a new variable and remove this one instead.
 * Mounted per opening (the panel renders it only while editing), so typed secrets never outlive it (FR-UI-001).
 */
export function EditVariableDialog({
  envId,
  open,
  onOpenChange,
  variable,
  group,
  startReplacing = false,
  takenKeys = [],
}: {
  envId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent for a service no variable uses (legacy data): settings and value only. */
  variable?: Variable;
  group?: ServiceGroup;
  startReplacing?: boolean;
  /** Keys already used in the environment, so a clashing rename is refused before any write (review I2). */
  takenKeys?: string[];
}) {
  const { update } = useVariableMutations(envId);
  const services = useServiceMutations(envId);
  const isMain = Boolean(group && (!variable || group.main?.id === variable.id));
  const type: TypeId = isMain && group ? group.type : variable ? basicType(variable) : "plain";
  const def = TYPES[type];
  const config = group?.resource.config ?? {};

  const settingsDefs = useMemo(
    () =>
      isMain
        ? [...def.required(group?.provider), ...def.advanced(group?.provider)].filter(
            (f) => !f.secret && f.name !== "readsAs",
          )
        : [],
    [isMain, def, group?.provider],
  );
  const secretDefs = useMemo(
    () => (isMain && def.value ? [def.value, ...def.required(group?.provider).filter((f) => f.secret)] : []),
    [isMain, def, group?.provider],
  );
  const initialSettings = useMemo(
    () => Object.fromEntries(settingsDefs.map((f) => [f.name, asText(config[f.name])])),
    [settingsDefs, config],
  );
  const extras = isMain && group ? group.rows.filter((r) => r.extra).map((r) => r.variable) : [];

  const [key, setKey] = useState(variable?.key ?? "");
  const [value, setValue] = useState(variable?.value ?? "");
  const [format, setFormat] = useState(variable?.format ?? "");
  const [replacing, setReplacing] = useState(startReplacing);
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [extraKeys, setExtraKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(extras.map((x) => [x.id, x.key])),
  );
  const [error, setError] = useState<unknown>(null);
  const [keyError, setKeyError] = useState<string>();
  const [pending, setPending] = useState(false);

  // review I5: a new address for the service needs the key again (the backend refuses it otherwise).
  const moved = ["upstreamUrl", "endpoint", "tokenUrl"].some(
    (k) => k in initialSettings && hostOf(settings[k]) !== hostOf(initialSettings[k]),
  );
  const replacingNow = replacing || (isMain && moved);
  const secretMissing = replacingNow && secretDefs.some((f) => !(secrets[f.name] ?? "").trim());
  const taken = new Set(takenKeys);
  const keyTaken = Boolean(variable && key !== variable.key && taken.has(key));
  const extraInvalid = extras.some((x) => {
    const k = extraKeys[x.id] ?? x.key;
    return !KEY_PATTERN.test(k) || (k !== x.key && taken.has(k));
  });
  const settingsInvalid = Boolean(fieldError(settingsDefs, settings));
  const canSave =
    (!variable || KEY_PATTERN.test(key)) &&
    !keyTaken &&
    !secretMissing &&
    !extraInvalid &&
    !settingsInvalid &&
    !pending;

  async function save() {
    setError(null);
    setKeyError(undefined);
    setPending(true);
    try {
      // 1. The service first: it is tested, so it is the step most likely to be refused.
      if (isMain && group) {
        const body: Record<string, unknown> = {};
        if (replacingNow) for (const f of secretDefs) body[f.name] = secrets[f.name];
        for (const f of settingsDefs) {
          const next = settings[f.name] ?? "";
          if (next === (initialSettings[f.name] ?? "")) continue;
          body[f.name] =
            f.name === "redirectHosts"
              ? next
                  .split(",")
                  .map((h) => h.trim())
                  .filter(Boolean)
              : f.name === "extraHeaders"
                ? (parseHeaderLines(next).headers ?? {})
                : f.name === "port" && group.resource.kind === "webhook"
                  ? next.trim()
                    ? Number(next)
                    : null
                  : next;
        }
        if (Object.keys(body).length > 0)
          await services.update.mutateAsync({ id: group.resource.id, body: { ...body, test: true } });
      }
      // 2. The variable itself: key, and value/format for basic types.
      const own: { key?: string; value?: string; format?: string } = {};
      if (variable && key !== variable.key) own.key = key;
      if (variable?.type === "plain" && value !== (variable.value ?? "")) own.value = value;
      if (variable?.type === "visible" && replacingNow && secrets.value) own.value = secrets.value;
      if (variable?.type === "generated" && format && format !== variable.format) own.format = format;
      if (variable && Object.keys(own).length > 0) {
        try {
          await update.mutateAsync({ id: variable.id, ...own });
        } catch (err) {
          if (err instanceof ApiError && err.code === "CONFLICT") {
            setKeyError(err.message);
            return;
          }
          throw err;
        }
      }
      // 3. Extra keys of the service.
      for (const x of extras) {
        const next = extraKeys[x.id];
        if (next && next !== x.key) await update.mutateAsync({ id: x.id, key: next });
      }
      onOpenChange(false);
    } catch (err) {
      setError(err);
    } finally {
      setPending(false);
    }
  }

  const visibleSecretDef: FieldDef = { name: "value", label: "Value", secret: true };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type !== "plain" && <ServiceLogo icon={def.icon} />}
            {variable
              ? `${dialogTitle("Edit", type)} · ${variable.key}`
              : `Edit ${def.title} service · ${group?.resource.name ?? ""}`}
          </DialogTitle>
          <DialogDescription>Rename the key, replace the value or change settings at any time.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) void save();
          }}
        >
          {variable && (
            <FormField
              id="edit-key"
              label="Key"
              hint="Apps under cb run restart with the new name — make sure your code reads it."
              error={
                keyError ??
                (keyTaken ? `${key} already exists in this environment.` : KEY_PATTERN.test(key) ? undefined : KEY_HINT)
              }
            >
              <Input
                id="edit-key"
                value={key}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                onChange={(e) => {
                  setKeyError(undefined);
                  setKey(normalizeKey(e.target.value));
                }}
              />
            </FormField>
          )}
          {variable && (
            <p className="flex items-center gap-2 text-xs text-subtle">
              <ServiceLogo icon={def.icon} />
              {def.name} — to change the type, add a new variable and remove this one.
            </p>
          )}

          {variable?.type === "plain" && (
            <FormField id="edit-value" label="Value">
              <Input id="edit-value" value={value} className="font-mono" onChange={(e) => setValue(e.target.value)} />
            </FormField>
          )}
          {variable?.type === "generated" && (
            <FieldInput idPrefix="edit" def={FORMAT} value={format} onChange={setFormat} />
          )}

          {(isMain || variable?.type === "visible") && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                <span className="text-xs text-subtle">
                  ●●●●●●●● · set {timeAgo(group?.resource.rotatedAt ?? variable?.updatedAt)} · can't be viewed
                </span>
                {!replacingNow && (
                  <Button type="button" size="sm" variant="outline" onClick={() => setReplacing(true)}>
                    Replace value
                  </Button>
                )}
              </div>
              {isMain && moved && !replacing && (
                <p className="text-xs text-subtle">A new address needs the key again, so it isn't sent anywhere new.</p>
              )}
              {replacingNow &&
                (isMain ? secretDefs : [visibleSecretDef]).map((f) => (
                  <FieldInput
                    key={f.name}
                    idPrefix="edit-secret"
                    def={{ ...f, label: `${f.label} (new value)` }}
                    value={secrets[f.name] ?? ""}
                    onChange={(v) => setSecrets((s) => ({ ...s, [f.name]: v }))}
                  />
                ))}
            </div>
          )}

          {settingsDefs
            .filter((f) => !f.showWhen || (settings[f.showWhen.field] ?? "") === f.showWhen.equals)
            .map((f) => (
              <FieldInput
                key={f.name}
                idPrefix="edit"
                def={f}
                value={settings[f.name] ?? ""}
                onChange={(v) => setSettings((s) => ({ ...s, [f.name]: v }))}
                error={settings[f.name]?.trim() ? f.validate?.(settings[f.name]?.trim() ?? "") : undefined}
              />
            ))}

          {extras.length > 0 && (
            <section className="flex flex-col gap-2 border-t border-border pt-3">
              <span className="text-[13px] font-medium">Extra keys of this service</span>
              {extras.map((x) => (
                <Input
                  key={x.id}
                  aria-label={`Key name (was ${x.key})`}
                  value={extraKeys[x.id] ?? x.key}
                  className="h-8 font-mono text-xs"
                  onChange={(e) => setExtraKeys((k) => ({ ...k, [x.id]: normalizeKey(e.target.value) }))}
                />
              ))}
            </section>
          )}

          {isMain && group && READONLY_TYPES[type] && def.value && (
            <ReadonlyLogin resourceId={group.resource.id} valueField={def.value} label={READONLY_TYPES[type] ?? ""} />
          )}

          <FormError error={error} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave} loading={pending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
