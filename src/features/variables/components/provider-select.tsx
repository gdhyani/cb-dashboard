"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { ProviderDef } from "../lib/catalog";
import { ServiceLogo } from "@/shared/components/service-logo";

/** D6: the provider inside one type (AI: OpenAI … Custom; sign-in: Google, GitHub, Other). */
export function ProviderSelect({
  id,
  providers,
  value,
  onChange,
}: {
  id: string;
  providers: ProviderDef[];
  value: string;
  onChange: (provider: string) => void;
}) {
  const current = providers.find((p) => p.id === value) ?? providers[0];
  return (
    <Select value={current?.id} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger id={id}>
        <SelectValue>
          {current && (
            <span className="flex items-center gap-2">
              <ServiceLogo icon={current.icon} />
              {current.name}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {providers.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <span className="flex items-center gap-2">
              <ServiceLogo icon={p.icon} />
              {p.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
