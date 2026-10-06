"use client";

import type { Resource } from "@/features/resources";
import { type RowAction, RowActions } from "@/shared/components/row-actions";
import { ServiceLogo } from "@/shared/components/service-logo";
import { StaggerItem } from "@/shared/components/stagger";

/** Legacy data: a service no variable uses. Still testable and removable. */
export function OrphanRow({
  resource,
  index,
  chip,
  actions,
}: {
  resource: Resource;
  index: number;
  chip: { icon: string; label: string };
  actions?: RowAction[];
}) {
  return (
    <StaggerItem index={index} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="truncate font-mono text-sm text-subtle sm:w-[38%] sm:shrink-0">{resource.name}</span>
        <span className="truncate text-xs text-subtle">No variable uses this service</span>
      </div>
      <span className="flex max-w-[40%] shrink-0 items-center gap-1.5 truncate text-xs text-subtle">
        <ServiceLogo icon={chip.icon} />
        {chip.label}
      </span>
      {actions && <RowActions label={`Actions for ${resource.name}`} actions={actions} />}
    </StaggerItem>
  );
}
