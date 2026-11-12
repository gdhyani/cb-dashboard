"use client";

import { Copy, FileUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { KeyAccessDialog } from "@/features/access";
import { useResources } from "@/features/resources";
import { DocsLink } from "@/shared/components/docs-link";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import type { RowAction } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerBlock } from "@/shared/components/stagger";
import { TableToolbar } from "@/shared/components/table-toolbar";
import { useCopy } from "@/shared/hooks/use-copy";
import { useTableQuery } from "@/shared/hooks/use-table-query";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useVariableMutations, useVariables } from "../hooks/use-variables";
import type { TypeId } from "../lib/catalog";
import { chipLabel, groupVariables, type ServiceGroup } from "../lib/group";
import { STATUS_FILTERS, type TableUnit, toUnits, unitFields, unitFilters, visibleRowIds } from "../lib/table";
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

/**
 * D1: every key of the environment in one Studio table — quick add, a toolbar (search by key, filter by type and
 * status), keys grouped under their service's main key, and how apps reach each service.
 */
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
  const units = useMemo(() => toUnits(grouped), [grouped]);
  const query = useTableQuery<TableUnit, "type" | "status">({ rows: units, fields: unitFields, filters: unitFilters });
  const visibleIds = useMemo(() => visibleRowIds(query.rows, query.search), [query.rows, query.search]);

  const typeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const u of units) seen.set(u.typeKey, u.typeName);
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [units]);
  const hasStatus = units.some((u) => u.status);

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

  const services = [...grouped.items.flatMap((i) => (i.kind === "service" ? [i.group] : [])), ...grouped.orphans];
  const empty = units.length === 0;
  const rowCount = (list: TableUnit[], ids?: Set<string>) =>
    list.reduce(
      (n, u) =>
        n +
        (u.kind === "variable"
          ? 1
          : Math.max(1, u.group.rows.filter((r) => !r.extra || !ids || ids.has(r.variable.id)).length)),
      0,
    );
  const columns = isAdmin ? 5 : 4;

  const addActions = isAdmin && (
    <>
      <Button variant="secondary" size="sm" onClick={() => setImporting(true)}>
        <FileUp />
        Import .env
      </Button>
      <Button size="sm" onClick={() => setAdding({ type: "plain" })}>
        <Plus />
        Add variable
      </Button>
    </>
  );

  return (
    <div className="flex flex-col gap-5">
      {isAdmin && <QuickAdd onPick={(type, provider) => setAdding({ type, provider })} />}
      <QueryState
        isPending={variables.isPending || resources.isPending}
        error={variables.error ?? resources.error}
        skeleton={<SkeletonRows rows={4} />}
      >
        {empty ? (
          <EmptyState
            title="No variables yet"
            description="Every key your app reads from process.env lives here"
            action={
              <>
                {addActions}
                <DocsLink href="/docs/guides/dashboard/variables">How variables work</DocsLink>
              </>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            <TableToolbar
              search={query.search}
              onSearch={query.setSearch}
              placeholder="Search by key…"
              count={rowCount(query.rows, visibleIds)}
              total={rowCount(units)}
              noun="variable"
              onClear={query.clear}
              filters={
                <>
                  <Select value={query.filter("type")} onValueChange={(v) => query.setFilter("type", v)}>
                    <SelectTrigger className="h-[28px] w-auto text-xs" aria-label="Filter by type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {typeOptions.map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasStatus && (
                    <Select value={query.filter("status")} onValueChange={(v) => query.setFilter("status", v)}>
                      <SelectTrigger className="h-[28px] w-auto text-xs" aria-label="Filter by status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any status</SelectItem>
                        {STATUS_FILTERS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              }
              actions={addActions || undefined}
            />
            <StaggerBlock>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead className="hidden md:table-cell">Value</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && (
                      <TableHead className="w-10">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.rows.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={columns} className="py-6 text-center text-foreground-lighter">
                        No variables match your search
                      </TableCell>
                    </TableRow>
                  )}
                  {query.rows.map((unit) => {
                    if (unit.kind === "service")
                      return (
                        <ServiceRows
                          key={unit.id}
                          envId={envId}
                          group={unit.group}
                          visibleIds={query.search.trim() ? visibleIds : undefined}
                          isAdmin={isAdmin}
                          onRemoveVariable={(id) => remove.mutateAsync(id)}
                          onEdit={onEdit}
                          onOpen={onOpen}
                          onAccess={onAccess}
                          onEditService={(group) => setEditing({ group })}
                        />
                      );
                    const v = unit.variable;
                    const chip = BASIC_CHIP[v.type] ?? BASIC_CHIP.plain;
                    return (
                      <VariableRow
                        key={unit.id}
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
                </TableBody>
              </Table>
            </StaggerBlock>
          </div>
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
