"use client";

import { FormField } from "@/shared/components/form-field";
import { SecretInput, SecretTextarea } from "@/shared/components/secret-input";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { FieldSpec } from "../lib/kinds";

/** Renders registry fields; secrets go through the write-only inputs only (FR-UI-001). */
export function KindFields({
  idPrefix,
  fields,
  values,
  onChange,
  rotating = false,
}: {
  idPrefix: string;
  fields: FieldSpec[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  /** Secret placeholders say "set — enter a new value". */
  rotating?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const id = `${idPrefix}-${f.name}`;
        const wide = f.type !== "select" && (f.type.startsWith("secret") || f.type === "list" || !f.optional);
        const value = values[f.name] ?? "";
        const hint = f.type.startsWith("secret") ? "Write-only. Stored encrypted; never shown again." : f.hint;
        return (
          <div key={f.name} className={cn(wide && "sm:col-span-2")}>
            <FormField id={id} label={f.label} hint={hint}>
              {f.type === "select" ? (
                <Select value={value} onValueChange={(v) => onChange(f.name, v)}>
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === "secret" ? (
                <SecretInput
                  id={id}
                  isSet={rotating}
                  value={value}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(f.name, e.target.value)}
                />
              ) : f.type === "secret-multiline" ? (
                <SecretTextarea
                  id={id}
                  isSet={rotating}
                  value={value}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(f.name, e.target.value)}
                />
              ) : (
                <Input
                  id={id}
                  value={value}
                  placeholder={f.placeholder}
                  className={cn(f.mono && "font-mono")}
                  onChange={(e) => onChange(f.name, e.target.value)}
                />
              )}
            </FormField>
          </div>
        );
      })}
    </div>
  );
}
