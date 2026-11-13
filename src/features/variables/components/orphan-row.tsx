"use client";

import type { Resource } from "@/features/resources";
import { type RowAction, RowActions } from "@/shared/components/row-actions";
import { ServiceLogo } from "@/shared/components/service-logo";
import { TableCell, TableRow } from "@/shared/ui/table";

/** Legacy data: a service no variable uses. Still testable and removable. */
export function OrphanRow({
  resource,
  chip,
  actions,
}: {
  resource: Resource;
  chip: { icon: string; label: string };
  actions?: RowAction[];
}) {
  const note = <span className="block truncate text-xs text-foreground-lighter">No variable uses this service</span>;
  return (
    <TableRow>
      <TableCell className="max-w-[14rem] py-2.5 sm:max-w-[18rem]">
        <span className="block truncate font-mono text-sm text-foreground-lighter">{resource.name}</span>
      </TableCell>
      <TableCell className="hidden min-w-[8rem] py-2.5 md:table-cell">{note}</TableCell>
      <TableCell className="hidden max-w-[14rem] py-2.5 sm:table-cell">
        <span className="flex min-w-0 items-center gap-2 text-xs text-foreground-light">
          <ServiceLogo icon={chip.icon} />
          <span className="truncate">{chip.label}</span>
        </span>
      </TableCell>
      <TableCell className="py-2.5" />
      {actions && (
        <TableCell className="w-10 py-1.5 pr-2 pl-0 text-right">
          <RowActions label={`Actions for ${resource.name}`} actions={actions} />
        </TableCell>
      )}
    </TableRow>
  );
}
