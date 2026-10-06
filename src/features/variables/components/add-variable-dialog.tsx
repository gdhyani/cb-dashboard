"use client";

import { AlertTriangle, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import type { Resource } from "@/features/resources";
import { WebhookSetup } from "@/features/webhooks";
import { ApiError } from "@/shared/api/api-error";
import { FormError } from "@/shared/components/form-error";
import { FormField } from "@/shared/components/form-field";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { useVariableMutations } from "../hooks/use-variables";
import {
  buildCreateRequest,
  type DraftState,
  dialogTitle,
  type FieldDef,
  fieldError,
  initialExtras,
  KEY_PATTERN,
  normalizeKey,
  TYPES,
  type TypeId,
  WEBHOOK_PROVIDERS,
} from "../lib/catalog";
import { GENERATED_FORMATS } from "../types";
import { AdvancedSection } from "./advanced-section";
import { ExtrasSection } from "./extras-section";
import { FieldInput } from "./field-input";
import { ProviderSelect } from "./provider-select";
import { ServiceLogo } from "./service-logo";
import { TypeSelect } from "./type-select";

const BASIC: TypeId[] = ["plain", "gen", "visible"];
const FORMAT: FieldDef = {
  name: "format",
  label: "Format",
  defaultValue: "base64:32",
  select: GENERATED_FORMATS.map((f) => ({ value: f, label: f })),
};
const KEY_HINT = "Use UPPER_SNAKE_CASE: letters, digits and _, not starting with a digit.";

function freshDraft(type: TypeId, provider?: string, key = ""): DraftState {
  const p = provider ?? TYPES[type].providers?.[0]?.id;
  return { key, type, provider: p, value: "", fields: {}, extras: initialExtras(type, p) };
}

/** Fields that depend on another (authHeader only for the named-header style). */
const visible = (f: FieldDef, fields: Record<string, string>) =>
  !f.showWhen || (fields[f.showWhen.field] ?? "") === f.showWhen.equals;

/** D1–D8: one dialog for every key — key, "What is this?", the real value, extras, advanced, Save & test. */
export function AddVariableDialog({
  envId,
  open,
  onOpenChange,
  initialType = "plain",
  initialProvider,
}: {
  envId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: TypeId;
  initialProvider?: string;
}) {
  const { create, createService } = useVariableMutations(envId);
  const [draft, setDraft] = useState<DraftState>(() => freshDraft(initialType, initialProvider));
  const [error, setError] = useState<unknown>(null);
  const [keyError, setKeyError] = useState<string>();
  /** Webhook services: after saving, how to set up the provider side (Connect, or URL + cb-made secret). */
  const [created, setCreated] = useState<{
    key: string;
    service: Resource;
    provider: string;
    generatedSecret?: string;
  } | null>(null);

  // Each opening starts clean (secrets never outlive the dialog — FR-UI-001).
  useEffect(() => {
    if (open) {
      setDraft(freshDraft(initialType, initialProvider));
      setError(null);
      setKeyError(undefined);
      setCreated(null);
    }
  }, [open, initialType, initialProvider]);

  const def = TYPES[draft.type];
  const required = def.required(draft.provider).filter((f) => visible(f, draft.fields));
  const advanced = def.advanced(draft.provider);
  const protectedType = !BASIC.includes(draft.type);
  const pending = create.isPending || createService.isPending;

  const keyInvalid = draft.key !== "" && !KEY_PATTERN.test(draft.key);
  const valueMode = def.valueMode?.(draft.provider) ?? "required";
  const valueMissing =
    draft.type !== "plain" && draft.type !== "gen" && valueMode === "required" && !draft.value.trim();
  const requiredMissing = required.some((f) => !f.optional && !f.select && !(draft.fields[f.name] ?? "").trim());
  const extraDefs = def.extras(draft.provider);
  const extrasInvalid = draft.extras.some((e) => {
    if (!e.on) return false;
    if (!KEY_PATTERN.test(e.key)) return true;
    // A ticked plain extra needs a value (its own, or the field it defaults from).
    const ed = extraDefs.find((x) => x.suggestedKey === e.suggestedKey);
    return Boolean(ed && !ed.field && !e.value?.trim() && !(ed.defaultFrom && draft.fields[ed.defaultFrom]?.trim()));
  });
  const fieldsInvalid = Boolean(fieldError([...required, ...advanced], draft.fields));
  const canSave =
    KEY_PATTERN.test(draft.key) && !valueMissing && !requiredMissing && !extrasInvalid && !fieldsInvalid && !pending;

  const update = (patch: Partial<DraftState>) => setDraft((d) => ({ ...d, ...patch }));
  const setField = (name: string, value: string) => setDraft((d) => ({ ...d, fields: { ...d.fields, [name]: value } }));

  async function submit() {
    setError(null);
    setKeyError(undefined);
    let req: ReturnType<typeof buildCreateRequest>;
    try {
      req = buildCreateRequest(draft);
    } catch {
      setError(
        new ApiError({
          code: "VALIDATION_FAILED",
          message: "That URL isn't valid. Use a full address such as https://api.example.com.",
          statusCode: 400,
          correlationId: "",
        }),
      );
      return;
    }
    try {
      const result =
        req.endpoint === "services"
          ? await createService.mutateAsync(req.body)
          : await create.mutateAsync(req.body as Parameters<typeof create.mutateAsync>[0]);
      // FR-UI-001: drop the request body (it holds the real value) from the mutation cache.
      createService.reset();
      create.reset();
      const service =
        req.endpoint === "services"
          ? (result as { service?: Resource & { generatedSecret?: string } }).service
          : undefined;
      if (service?.webhookUrl) {
        const { generatedSecret, ...rest } = service;
        setDraft((d) => ({ ...d, value: "", fields: {} }));
        setCreated({ key: draft.key, service: rest, provider: draft.provider ?? "stripe", generatedSecret });
        return;
      }
      onOpenChange(false);
    } catch (err) {
      const onKey =
        err instanceof ApiError &&
        (err.details?.some((d) => d.path === "key") ||
          (err.code === "CONFLICT" && err.message.startsWith(`${draft.key} already exists`)));
      if (onKey) setKeyError(err.message);
      else setError(err);
    }
  }

  if (created) {
    const providerName = WEBHOOK_PROVIDERS.find((p) => p.id === created.provider)?.name ?? "the provider";
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ServiceLogo icon={def.icon} />
              {created.provider === "razorpay" ? "Add this webhook in Razorpay" : `Connect ${providerName}`}
            </DialogTitle>
            <DialogDescription>
              {created.key} is saved. {providerName} sends webhooks to cb; cb checks them with the real secret and
              delivers each one only to the developer whose app caused it, on the port their app listens on.
            </DialogDescription>
          </DialogHeader>
          <WebhookSetup envId={envId} resource={created.service} generatedSecret={created.generatedSecret} />
          <p className="text-xs text-subtle">This setup is also in the key's Edit dialog and on the Webhooks tab.</p>
          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {draft.type !== "plain" && <ServiceLogo icon={def.icon} />}
            {dialogTitle("Add", draft.type)}
          </DialogTitle>
          <DialogDescription>
            {valueMode === "none"
              ? "cb makes the signing secret and shows it once after saving, with the URL to paste into the provider."
              : protectedType
                ? "Paste the real value once. cb keeps it on the server and tests it before saving."
                : "Every key your app reads from process.env lives here."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) void submit();
          }}
        >
          <FormField
            id="add-key"
            label="Key"
            hint="The name your code reads, e.g. DATABASE_URL."
            error={keyError ?? (keyInvalid ? KEY_HINT : undefined)}
          >
            <Input
              id="add-key"
              value={draft.key}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder="DATABASE_URL"
              className="font-mono"
              onChange={(e) => {
                setKeyError(undefined);
                update({ key: normalizeKey(e.target.value) });
              }}
            />
          </FormField>
          <FormField id="add-type" label="What is this?">
            <TypeSelect
              id="add-type"
              value={draft.type}
              onChange={(t) => setDraft((d) => freshDraft(t, undefined, d.key))}
            />
          </FormField>
          {def.providers && (
            <FormField id="add-provider" label="Provider">
              <ProviderSelect
                id="add-provider"
                providers={def.providers}
                value={draft.provider ?? ""}
                onChange={(p) =>
                  setDraft((d) => ({
                    ...freshDraft(d.type, p, d.key),
                    value: (TYPES[d.type].valueMode?.(p) ?? "required") === "none" ? "" : d.value,
                  }))
                }
              />
            </FormField>
          )}
          {draft.type === "visible" && (
            <p
              role="note"
              className="flex items-start gap-2 rounded-md border border-destructive/40 p-3 text-xs text-destructive"
            >
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
              The real value goes to every developer with access. Use it only when your app must compute with the secret
              itself. Payment webhook secrets don't need this — use the Webhook signing secret type.
            </p>
          )}
          {draft.type === "gen" ? (
            <>
              <FieldInput
                idPrefix="add"
                def={FORMAT}
                value={draft.format ?? ""}
                onChange={(v) => update({ format: v })}
              />
              <p className="text-xs text-subtle">
                Nothing to paste. Each developer gets their own value — use it for secrets your app invents
                (AUTH_SECRET, JWT_SECRET, SESSION_SECRET).
              </p>
            </>
          ) : (
            def.value &&
            valueMode !== "none" && (
              <FieldInput
                idPrefix="add"
                def={{
                  ...def.value,
                  placeholder:
                    def.providers?.find((p) => p.id === draft.provider)?.placeholder ?? def.value.placeholder,
                }}
                value={draft.value}
                onChange={(v) => update({ value: v })}
              />
            )
          )}
          {required.map((f) => (
            <FieldInput
              key={f.name}
              idPrefix="add"
              def={f}
              value={draft.fields[f.name] ?? ""}
              onChange={(v) => setField(f.name, v)}
            />
          ))}
          <ExtrasSection defs={extraDefs} extras={draft.extras} onChange={(extras) => update({ extras })} />
          <AdvancedSection idPrefix="add-adv" fields={advanced} values={draft.fields} onChange={setField} />
          {protectedType && draft.type !== "visible" && (
            <p className="flex items-start gap-2 rounded-md border border-border p-3 text-xs text-subtle">
              <Lock aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              Developers get a stand-in value that cb makes for each device — there is nothing to enter for it. The real
              value is encrypted on cb's server; nobody can view it again, but you can replace it any time.
            </p>
          )}
          <FormError error={error} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave} loading={pending}>
              {protectedType && draft.type !== "visible" ? "Save & test" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
