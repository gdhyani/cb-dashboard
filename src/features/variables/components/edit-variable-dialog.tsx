"use client";

import { useMemo, useRef, useState } from "react";
import { useServiceMutations } from "@/features/resources";
import { WebhookSetup } from "@/features/webhooks";
import { ApiError } from "@/shared/api/api-error";
import { FormError } from "@/shared/components/form-error";
import { FormField } from "@/shared/components/form-field";
import { ServiceLogo } from "@/shared/components/service-logo";
import { timeAgo } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { useVariableMutations } from "../hooks/use-variables";
import {
  awsEndpoint,
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
 * Opened from a click on a key it starts read-only; Edit unlocks the same form, and Save or Cancel return to it.
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
  initialMode = "edit",
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
  /** "view": read-only with an Edit button (a click on a key); "edit": ready to change (menu actions). */
  initialMode?: "view" | "edit";
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
    () =>
      isMain && def.value
        ? [
            def.value,
            ...def.required(group?.provider).filter((f) => f.secret),
            // Optional secrets (Stripe's thin-events secret) can be set without retyping the main one.
            ...def.advanced(group?.provider).filter((f) => f.secret),
          ]
        : [],
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
  // B10: a stored CA certificate is shown by subject and expiry only; Remove sends "" on Save.
  const storedCa = config.caCertFile as { subject: string; notAfter: string } | undefined;
  const [removeCa, setRemoveCa] = useState(false);
  const [extraKeys, setExtraKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(extras.map((x) => [x.id, x.key])),
  );
  const [error, setError] = useState<unknown>(null);
  const [keyError, setKeyError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const editButton = useRef<HTMLButtonElement>(null);
  const editing = mode === "edit";

  // review I5: a new address for the service needs the key again (the backend refuses it otherwise).
  // AWS S3/SES (and older SQS variables): the endpoint follows the region, so a new region is a new address too.
  const awsService = group?.resource.kind === "aws" && group.provider !== "compatible" ? group.provider : undefined;
  const awsNewEndpoint =
    awsService && settings.region?.trim() && settings.region.trim() !== (initialSettings.region ?? "")
      ? awsEndpoint(awsService, settings.region.trim())
      : undefined;
  const moved =
    Boolean(awsNewEndpoint && hostOf(awsNewEndpoint) !== hostOf(config.endpoint)) ||
    ["upstreamUrl", "endpoint", "tokenUrl"].some(
      (k) => k in initialSettings && hostOf(settings[k]) !== hostOf(initialSettings[k]),
    );
  const replacingNow = editing && (replacing || (isMain && moved));
  const mainOptional = def.valueMode?.(group?.provider) === "optional" && !(isMain && moved);
  const secretRequired = (f: FieldDef) => !(f.optional && (f.name !== def.value?.name || mainOptional));
  const secretMissing = replacingNow && secretDefs.some((f) => secretRequired(f) && !(secrets[f.name] ?? "").trim());
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

  /** Back to the read-only view; typed secrets are dropped (FR-UI-001), unsaved edits too when `discard`. */
  function toView(discard: boolean) {
    setSecrets({});
    if (discard) setRemoveCa(false);
    setReplacing(false);
    setError(null);
    setKeyError(undefined);
    if (discard) {
      setKey(variable?.key ?? "");
      setValue(variable?.value ?? "");
      setFormat(variable?.format ?? "");
      setSettings(initialSettings);
      setExtraKeys(Object.fromEntries(extras.map((x) => [x.id, x.key])));
    }
    setMode("view");
  }

  async function save() {
    setError(null);
    setKeyError(undefined);
    setPending(true);
    try {
      // 1. The service first: it is tested, so it is the step most likely to be refused.
      if (isMain && group) {
        const body: Record<string, unknown> = {};
        if (replacingNow)
          for (const f of secretDefs)
            if ((secrets[f.name] ?? "").trim() || secretRequired(f)) body[f.name] = secrets[f.name];
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
                : f.name === "thinPath" && !next.trim()
                  ? null
                  : next;
        }
        if (removeCa && !(settings.caCert ?? "").trim()) body.caCert = "";
        if (awsNewEndpoint) body.endpoint = awsNewEndpoint;
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
      toView(false);
    } catch (err) {
      setError(err);
    } finally {
      setPending(false);
    }
  }

  const visibleSecretDef: FieldDef = { name: "value", label: "Value", secret: true };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] max-w-lg overflow-y-auto"
        onOpenAutoFocus={(e) => {
          // Read-only: focus Edit, not a field that only looks typeable.
          if (editing) return;
          e.preventDefault();
          editButton.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type !== "plain" && <ServiceLogo icon={def.icon} />}
            {variable
              ? `${dialogTitle(editing ? "Edit" : "View", type)} · ${variable.key}`
              : `${editing ? "Edit " : ""}${def.title} service · ${group?.resource.name ?? ""}`}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Rename the key, replace the value or change settings at any time."
              : "Stored values can't be viewed. Choose Edit to rename the key, replace the value or change settings."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (editing && canSave) void save();
          }}
        >
          {variable && (
            <FormField
              id="edit-key"
              label="Key"
              hint={editing ? "Apps under cb run restart with the new name — make sure your code reads it." : undefined}
              error={
                keyError ??
                (keyTaken ? `${key} already exists in this environment.` : KEY_PATTERN.test(key) ? undefined : KEY_HINT)
              }
            >
              <Input
                id="edit-key"
                value={key}
                readOnly={!editing}
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
              <Input
                id="edit-value"
                value={value}
                readOnly={!editing}
                className="font-mono"
                onChange={(e) => setValue(e.target.value)}
              />
            </FormField>
          )}
          {variable?.type === "generated" && (
            <FieldInput idPrefix="edit" def={FORMAT} value={format} onChange={setFormat} readOnly={!editing} />
          )}

          {(isMain || variable?.type === "visible") && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                <span className="text-xs text-subtle">
                  ●●●●●●●● · set {timeAgo(group?.resource.rotatedAt ?? variable?.updatedAt)} · can't be viewed
                </span>
                {editing && !replacingNow && (
                  <Button type="button" size="sm" variant="outline" onClick={() => setReplacing(true)}>
                    Replace value
                  </Button>
                )}
              </div>
              {editing && isMain && moved && !replacing && (
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

          {isMain && group?.resource.webhookUrl && <WebhookSetup envId={envId} resource={group.resource} />}

          {settingsDefs
            .filter((f) => !f.showWhen || (settings[f.showWhen.field] ?? "") === f.showWhen.equals)
            .map((f) => (
              <div key={f.name} className="flex flex-col gap-1.5">
                {f.name === "caCert" && storedCa && !removeCa && (
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-subtle">
                    <span>
                      Set · <span className="font-mono text-foreground">{storedCa.subject}</span> · valid until{" "}
                      {new Date(storedCa.notAfter).toLocaleDateString()}
                    </span>
                    {editing && (
                      <button
                        type="button"
                        onClick={() => setRemoveCa(true)}
                        className="text-destructive underline underline-offset-2"
                      >
                        Remove CA certificate
                      </button>
                    )}
                  </p>
                )}
                {f.name === "caCert" && removeCa && (
                  <p className="text-xs text-subtle">The CA certificate is removed when you save.</p>
                )}
                <FieldInput
                  idPrefix="edit"
                  def={
                    f.name === "caCert" && storedCa
                      ? { ...f, hint: "Drop a new file (or paste it) to replace the one stored." }
                      : f
                  }
                  value={settings[f.name] ?? ""}
                  onChange={(v) => setSettings((s) => ({ ...s, [f.name]: v }))}
                  readOnly={!editing}
                  error={editing && settings[f.name]?.trim() ? f.validate?.(settings[f.name]?.trim() ?? "") : undefined}
                />
              </div>
            ))}

          {extras.length > 0 && (
            <section className="flex flex-col gap-2 border-t border-border pt-3">
              <span className="text-[13px] font-medium">Extra keys of this service</span>
              {extras.map((x) => (
                <Input
                  key={x.id}
                  aria-label={`Key name (was ${x.key})`}
                  value={extraKeys[x.id] ?? x.key}
                  readOnly={!editing}
                  className="h-8 font-mono text-xs"
                  onChange={(e) => setExtraKeys((k) => ({ ...k, [x.id]: normalizeKey(e.target.value) }))}
                />
              ))}
            </section>
          )}

          {editing && isMain && group && READONLY_TYPES[type] && def.value && (
            <ReadonlyLogin resourceId={group.resource.id} valueField={def.value} label={READONLY_TYPES[type] ?? ""} />
          )}

          <FormError error={error} />
          {/* Separate keys: React must not turn the clicked Edit button into the submit button (it would save). */}
          {editing ? (
            <DialogFooter key="edit">
              <Button type="button" variant="ghost" disabled={pending} onClick={() => toView(true)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSave} loading={pending}>
                Save
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter key="view">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button ref={editButton} type="button" onClick={() => setMode("edit")}>
                Edit
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
