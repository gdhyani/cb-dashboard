"use client";

import { Copy, KeyRound, Pencil, PlugZap, Trash2, Users } from "lucide-react";
import { useServiceMutations, useTestResource } from "@/features/resources";
import type { RowAction } from "@/shared/components/row-actions";
import { useCopy } from "@/shared/hooks/use-copy";
import { AI_PROVIDERS, OAUTH_PROVIDERS, TYPES } from "../lib/catalog";
import { chipLabel, type ServiceGroup } from "../lib/group";
import type { Variable } from "../types";
import { OrphanRow } from "./orphan-row";
import { VariableRow } from "./variable-row";

/** The icon of a service: its provider's mark when it has one, else the type's. */
export function serviceIcon(group: Pick<ServiceGroup, "type" | "provider">): string {
  const provider = [...AI_PROVIDERS, ...OAUTH_PROVIDERS].find(
    (p) => p.id === group.provider && TYPES[group.type].providers?.includes(p),
  );
  return provider?.icon ?? TYPES[group.type].icon;
}

/** A service's keys (main first, extras indented) — or, for a service no variable uses, one removable row. */
export function ServiceRows({
  envId,
  group,
  startIndex,
  isAdmin,
  onRemoveVariable,
  onEdit,
  onAccess,
  onEditService,
}: {
  envId: string;
  group: ServiceGroup;
  startIndex: number;
  isAdmin: boolean;
  onRemoveVariable: (id: string) => Promise<unknown>;
  onEdit: (variable: Variable, group: ServiceGroup, replace?: boolean) => void;
  onAccess: (group: ServiceGroup, keyName: string) => void;
  /** Services no variable uses: settings and value only (review I4). */
  onEditService: (group: ServiceGroup) => void;
}) {
  const services = useServiceMutations(envId);
  const test = useTestResource(group.resource.id);
  const { copy } = useCopy("Key copied");
  const label = chipLabel(group.type, group.provider);
  const chip = { icon: serviceIcon(group), label };
  const keys = group.rows.map((r) => r.variable.key);
  const removeService: RowAction = {
    label: "Remove",
    icon: Trash2,
    destructive: true,
    confirm: {
      title: keys.length ? `Remove ${label} and its keys?` : `Remove ${label}?`,
      description: keys.length
        ? `${keys.join(", ")} will be removed. Running apps lose access within seconds.`
        : "No variable uses this service. Removing it deletes its stored credentials.",
      confirmLabel: "Remove service",
      onConfirm: () => services.remove.mutateAsync(group.resource.id),
    },
  };
  const testAction: RowAction = { label: "Test connection", icon: PlugZap, onSelect: () => test.mutate(undefined) };

  if (group.rows.length === 0)
    return (
      <OrphanRow
        resource={group.resource}
        index={startIndex}
        chip={chip}
        actions={
          isAdmin
            ? [
                { label: "Edit settings", icon: Pencil, onSelect: () => onEditService(group) },
                testAction,
                removeService,
              ]
            : undefined
        }
      />
    );

  return (
    <>
      {group.rows.map((row, i) => {
        const copyKey: RowAction = { label: "Copy key", icon: Copy, onSelect: () => void copy(row.variable.key) };
        const editAction: RowAction = { label: "Edit", icon: Pencil, onSelect: () => onEdit(row.variable, group) };
        const actions: RowAction[] = row.extra
          ? [
              editAction,
              copyKey,
              {
                label: "Remove",
                icon: Trash2,
                destructive: true,
                confirm: {
                  title: `Remove ${row.variable.key}?`,
                  description: `Only this key is removed; ${row.parentKey ?? "the service"} stays.`,
                  confirmLabel: "Remove variable",
                  onConfirm: () => onRemoveVariable(row.variable.id),
                },
              },
            ]
          : [
              editAction,
              { label: "Replace value", icon: KeyRound, onSelect: () => onEdit(row.variable, group, true) },
              { label: "Who can use it", icon: Users, onSelect: () => onAccess(group, row.variable.key) },
              copyKey,
              testAction,
              removeService,
            ];
        return (
          <VariableRow
            key={row.variable.id}
            index={startIndex + i}
            variable={row.variable}
            isMain={!row.extra}
            parentKey={row.extra ? row.parentKey : undefined}
            chip={chip}
            actions={isAdmin ? actions : undefined}
            onOpen={isAdmin ? () => onEdit(row.variable, group) : undefined}
          />
        );
      })}
    </>
  );
}
