import { BadgeLabel } from "@/shared/components/badge-label";
import type { BadgeTone } from "@/shared/lib/badge-tones";

export type DocStatus = "supported" | "beta" | "coming-soon";

const STATUS: Record<DocStatus, { label: string; tone: BadgeTone }> = {
  supported: { label: "Supported", tone: "success" },
  beta: { label: "Beta", tone: "warning" },
  "coming-soon": { label: "Coming soon", tone: "muted" },
};

/** FR-DOC-006 / FR-DOC-009: connector or platform status, used by the sidebar, page titles and card grids. */
export function StatusBadge({ status }: { status: DocStatus }) {
  const s = STATUS[status];
  return <BadgeLabel tone={s.tone}>{s.label}</BadgeLabel>;
}
