"use client";

import { ServiceLogo } from "@/shared/components/service-logo";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { TYPE_GROUPS, TYPES, type TypeId } from "../lib/catalog";

/** "What is this?" — grouped list of every type (D6: AI and sign-in are single entries with a provider). */
export function TypeSelect({ id, value, onChange }: { id: string; value: TypeId; onChange: (type: TypeId) => void }) {
  const current = TYPES[value];
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v as TypeId)}>
      <SelectTrigger id={id}>
        <SelectValue>
          <span className="flex items-center gap-2">
            <ServiceLogo icon={current.icon} />
            {current.name}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {TYPE_GROUPS.map(({ group, ids }) => (
          <SelectGroup key={group}>
            <div aria-hidden className="px-2 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              {group}
            </div>
            {ids.map((t) => (
              <SelectItem key={t} value={t}>
                <span className="flex items-center gap-2">
                  <ServiceLogo icon={TYPES[t].icon} />
                  <span>{TYPES[t].name}</span>
                  <span className="text-xs text-subtle">{TYPES[t].desc}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
