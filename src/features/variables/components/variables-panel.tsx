"use client";

import { Copy, FileUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { KeyAccessDialog } from "@/features/access";
import { useResources } from "@/features/resources";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import type { RowAction } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { useCopy } from "@/shared/hooks/use-copy";
import { Button } from "@/shared/ui/button";
import { useVariableMutations, useVariables } from "../hooks/use-variables";
import type { TypeId } from "../lib/catalog";
import { chipLabel, groupVariables, type ServiceGroup } from "../lib/group";
import type { Variable } from "../types";
import { AddVariableDialog } from "./add-variable-dialog";
import { ConnectionMap } from "./connection-map";
import { EditVariableDialog } from "./edit-variable-dialog";
import { ImportEnvDialog } from "./import-env-dialog";
import { QuickAdd } from "./quick-add";
import { ServiceRows, serviceIcon } from "./service-rows";
import { VariableRow } from "./variable-row";

const BASIC_CHIP: Record<string, { icon: string; type: TypeId }> = {
  plain: { icon: "letter:Aa", type: "plain" },
  generated: { icon: "secret", type: "gen" },
  visible: { icon: "letter:!", type: "visible" },
  brokered: { icon: "letter:●", type: "plain" },
};

/** D1: every key of the environment in one place — quick add, grouped keys, and how apps reach each service. */
export function VariablesPanel({ projectId, envId, isAdmin }: { projectId: string; envId: string; isAdmin: boolean }) {
  const variables = useVariables(envId);
  const resources = useResources(envId);
  const { remove } = useVariableMutations(envId);
  const { copy } = useCopy("Key copied");
  const [adding, setAdding] = useState<{ type: TypeId; provider?: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [editing, setEditing] = useState<{
    variable?: Variable;
    group?: ServiceGroup;
    replace?: boolean;
    view?: boolean;
  } | null>(null);
  const onEdit = (variable: Variable, group?: ServiceGroup, replace?: boolean) =>
    setEditing({ variable, group, replace });
  /** D9: a click on a key opens it read-only; Edit in the dialog unlocks it. */
  const onOpen = (variable: Variable, group?: ServiceGroup) => setEditing({ variable, group, view: true });
  const [sharing, setSharing] = useState<{ resourceId: string; keyName: string } | null>(null);
  const onAccess = (group: ServiceGroup, keyName: string) => setSharing({ resourceId: group.resource.id, keyName });
  const grouped = useMemo(
    () => groupVariables(variables.data ?? [], resources.data ?? []),
    [variables.data, resources.data],
  );

  const standaloneActions = (v: Variable): RowAction[] => [
    { label: "Edit", icon: Pencil, onSelect: () => onEdit(v) },
    { label: "Copy key", icon: Copy, onSelect: () => void copy(v.key) },
    {
      label: "Remove",
      icon: Trash2,
      destructive: true,
      confirm: {
        title: `Remove ${v.key}?`,
        description: "Running apps restart without it.",
        confirmLabel: "Remove variable",
        onConfirm: () => remove.mutateAsync(v.id),
      },
    },
  ];

  let index = 0;
  const services = [...grouped.items.flatMap((i) => (i.kind === "service" ? [i.group] : [])), ...grouped.orphans];
  const empty = grouped.items.length === 0 && grouped.orphans.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <QuickAdd onPick={(type, provider) => setAdding({ type, provider })} />
          <div className="flex shrink-0 gap-2 self-end sm:self-auto">
            <Button variant="ghost" onClick={() => setImporting(true)}>
              <FileUp />
              Import .env
            </Button>
            <Button onClick={() => setAdding({ type: "plain" })}>
              <Plus />
              Add variable
            </Button>
          </div>
        </div>
      )}
      <QueryState
        isPending={variables.isPending || resources.isPending}
        error={variables.error ?? resources.error}
        skeleton={<SkeletonRows rows={4} />}
      >
        {empty ? (
          <EmptyState title="No variables yet" description="Every key your app reads from process.env lives here." />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {grouped.items.map((item) => {
              if (item.kind === "service") {
                const start = index;
                index += item.group.rows.length;
                return (
                  <ServiceRows
                    key={item.group.resource.id}
                    envId={envId}
                    group={item.group}
                    startIndex={start}
                    isAdmin={isAdmin}
                    onRemoveVariable={(id) => remove.mutateAsync(id)}
                    onEdit={onEdit}
                    onOpen={onOpen}
                    onAccess={onAccess}
                    onEditService={(group) => setEditing({ group })}
                  />
                );
              }
              const v = item.row.variable;
              const chip = BASIC_CHIP[v.type] ?? BASIC_CHIP.plain;
              return (
                <VariableRow
                  key={v.id}
                  index={index++}
                  variable={v}
                  isMain={false}
                  chip={{
                    icon: chip?.icon ?? "letter:Aa",
                    label: v.type === "brokered" ? "Protected" : chipLabel(chip?.type ?? "plain"),
                  }}
                  actions={isAdmin ? standaloneActions(v) : undefined}
                  onOpen={isAdmin ? () => onOpen(v) : undefined}
                />
              );
            })}
            {grouped.orphans.map((group) => (
              <ServiceRows
                key={group.resource.id}
                envId={envId}
                group={group}
                startIndex={index++}
                isAdmin={isAdmin}
                onRemoveVariable={(id) => remove.mutateAsync(id)}
                onEdit={onEdit}
                onOpen={onOpen}
                onAccess={onAccess}
                onEditService={(group) => setEditing({ group })}
              />
            ))}
          </ul>
        )}
      </QueryState>
      <ConnectionMap
        services={services.map((g) => ({
          id: g.resource.id,
          label: g.main?.key ?? g.resource.name,
          detail: chipLabel(g.type, g.provider),
          icon: serviceIcon(g),
        }))}
      />
      {isAdmin && sharing && (
        <KeyAccessDialog
          projectId={projectId}
          envId={envId}
          resourceId={sharing.resourceId}
          keyName={sharing.keyName}
          open
          onOpenChange={(open) => !open && setSharing(null)}
        />
      )}
      {isAdmin && editing && (
        <EditVariableDialog
          key={editing.variable?.id ?? editing.group?.resource.id}
          envId={envId}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          variable={editing.variable}
          group={editing.group}
          startReplacing={editing.replace}
          initialMode={editing.view ? "view" : "edit"}
          takenKeys={(variables.data ?? []).map((v) => v.key)}
        />
      )}
      {isAdmin && importing && (
        <ImportEnvDialog
          envId={envId}
          open
          onOpenChange={(open) => !open && setImporting(false)}
          existingKeys={(variables.data ?? []).map((v) => v.key)}
        />
      )}
      {isAdmin && adding && (
        <AddVariableDialog
          key={`${adding.type}-${adding.provider ?? ""}`}
          envId={envId}
          open
          onOpenChange={(open) => !open && setAdding(null)}
          initialType={adding?.type}
          initialProvider={adding?.provider}
        />
      )}
    </div>
  );
}
