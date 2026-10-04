"use client";

import { FormField } from "@/shared/components/form-field";
import { SecretInput, SecretTextarea } from "@/shared/components/secret-input";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import type { FieldDef } from "../lib/catalog";

/** One catalog field: secret fields use the write-only inputs (FR-UI-001), selects use the shared Select. */
export function FieldInput({
  idPrefix,
  def,
  value,
  onChange,
  isSet,
  error,
}: {
  idPrefix: string;
  def: FieldDef;
  value: string;
  onChange: (value: string) => void;
  /** Edit mode: a stored secret exists; the input stays empty and only replaces it. */
  isSet?: boolean;
  error?: string;
}) {
  const id = `${idPrefix}-${def.name}`;
  const label = def.optional ? `${def.label} (optional)` : def.label;
  let control: React.ReactNode;
  if (def.select) {
    const current = value || def.defaultValue || "";
    control = (
      <Select value={current} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger id={id}>
          <SelectValue>{def.select.find((o) => o.value === current)?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {def.select.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  } else if (def.secret && def.multiline) {
    control = (
      <SecretTextarea
        id={id}
        value={value}
        isSet={isSet}
        placeholder={def.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else if (def.secret) {
    control = (
      <SecretInput
        id={id}
        value={value}
        isSet={isSet}
        placeholder={def.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else if (def.multiline) {
    control = (
      <Textarea
        id={id}
        value={value}
        rows={4}
        placeholder={def.placeholder}
        className="font-mono text-xs"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else {
    control = (
      <Input
        id={id}
        value={value}
        placeholder={def.placeholder}
        className="font-mono"
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <FormField id={id} label={label} hint={def.hint} error={error}>
      {control}
    </FormField>
  );
}
