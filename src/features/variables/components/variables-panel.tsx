"use client";

import { AlertTriangle, Copy, Trash2 } from "lucide-react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { useCopy } from "@/shared/hooks/use-copy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useVariableMutations, useVariables } from "../hooks/use-variables";
import { VARIABLE_TYPE_LABEL, type Variable } from "../types";
import { VariableFormDialog } from "./variable-form-dialog";

function source(v: Variable) {
  switch (v.type) {
    case "plain":
      return <span className="font-mono text-foreground">{v.value}</span>;
    case "generated":
      return <span className="font-mono text-subtle">personal · {v.format}</span>;
    case "visible":
      return <span className="font-mono text-subtle">•••• set</span>;
    default:
      return (
        <span className="font-mono text-subtle">
          {v.resourceName} → {v.field}
        </span>
      );
  }
}

export function VariablesPanel({ envId, isAdmin }: { envId: string; isAdmin: boolean }) {
  const variables = useVariables(envId);
  const { remove } = useVariableMutations(envId);
  const { copy } = useCopy("Key copied");
  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex justify-end">
          <VariableFormDialog envId={envId} />
        </div>
      )}
      <QueryState isPending={variables.isPending} error={variables.error} skeleton={<SkeletonRows rows={4} />}>
        {variables.data?.length === 0 ? (
          <EmptyState title="No variables yet" description="Every key your app reads from process.env lives here." />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {variables.data?.map((v, i) => (
              <StaggerItem key={v.id} index={i} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-mono text-sm">{v.key}</span>
                  <span className="truncate text-xs">{source(v)}</span>
                </div>
                <span className="flex shrink-0 items-center gap-1.5">
                  {v.type === "visible" && (
                    <Tooltip>
                      <TooltipTrigger aria-label="Why this is flagged">
                        <AlertTriangle className="size-3.5 text-destructive" />
                      </TooltipTrigger>
                      <TooltipContent>Real value delivered to developers (FR-UI-003).</TooltipContent>
                    </Tooltip>
                  )}
                  <BadgeLabel tone={v.type === "visible" ? "warning" : v.type === "brokered" ? "strong" : "default"}>
                    {VARIABLE_TYPE_LABEL[v.type]}
                  </BadgeLabel>
                </span>
                {isAdmin && (
                  <RowActions
                    label={`Actions for ${v.key}`}
                    actions={[
                      { label: "Copy key", icon: Copy, onSelect: () => void copy(v.key) },
                      {
                        label: "Delete variable",
                        icon: Trash2,
                        destructive: true,
                        confirm: {
                          title: `Delete ${v.key}?`,
                          description: "Running apps restart without it.",
                          confirmLabel: "Delete variable",
                          onConfirm: () => remove.mutateAsync(v.id),
                        },
                      },
                    ]}
                  />
                )}
              </StaggerItem>
            ))}
          </ul>
        )}
      </QueryState>
    </div>
  );
}
