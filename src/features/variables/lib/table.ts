import type { Variable } from "../types";
import { TYPES } from "./catalog";
import type { Grouped, ServiceGroup } from "./group";

export type KeyStatus = "ok" | "rejected" | "unknown";

/** One unit of the Variables table: a standalone key, or a service with its main key and extras. */
export type TableUnit =
  | { kind: "variable"; id: string; variable: Variable; typeKey: string; typeName: string; status?: undefined }
  | { kind: "service"; id: string; group: ServiceGroup; typeKey: string; typeName: string; status?: KeyStatus };

export const STATUS_FILTERS: { value: KeyStatus; label: string }[] = [
  { value: "ok", label: "Working" },
  { value: "rejected", label: "Expired" },
  { value: "unknown", label: "Not checked" },
];

const BASIC_TYPE: Record<Variable["type"], { key: string; name: string }> = {
  plain: { key: "plain", name: TYPES.plain.name },
  generated: { key: "gen", name: TYPES.gen.name },
  visible: { key: "visible", name: TYPES.visible.name },
  brokered: { key: "protected", name: "Protected" },
};

/** The table's units in display order: grouped items first, then services no variable uses. */
export function toUnits(grouped: Grouped): TableUnit[] {
  const service = (group: ServiceGroup): TableUnit => ({
    kind: "service",
    id: group.resource.id,
    group,
    typeKey: group.type,
    typeName: TYPES[group.type].name,
    status: group.resource.health?.status,
  });
  return [
    ...grouped.items.map((item): TableUnit => {
      if (item.kind === "service") return service(item.group);
      const v = item.row.variable;
      const t = BASIC_TYPE[v.type];
      return { kind: "variable", id: v.id, variable: v, typeKey: t.key, typeName: t.name };
    }),
    ...grouped.orphans.map(service),
  ];
}

/** Search text of a unit: every key it holds (a service matches when any of its keys does). */
export const unitFields = (u: TableUnit): string[] =>
  u.kind === "variable"
    ? [u.variable.key]
    : u.group.rows.length
      ? u.group.rows.map((r) => r.variable.key)
      : [u.group.resource.name];

export const unitFilters = {
  type: (u: TableUnit, value: string) => u.typeKey === value,
  status: (u: TableUnit, value: string) => u.status === value,
};

/**
 * While searching, a service shows its main key (as the parent) and only the extra keys that match.
 * Returns the ids of the extra keys to show.
 */
export function visibleRowIds(units: TableUnit[], search: string): Set<string> {
  const q = search.trim().toLowerCase();
  const ids = new Set<string>();
  for (const u of units) {
    if (u.kind !== "service") continue;
    for (const r of u.group.rows) if (!q || r.variable.key.toLowerCase().includes(q)) ids.add(r.variable.id);
  }
  return ids;
}
