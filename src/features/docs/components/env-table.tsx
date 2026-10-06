import { BadgeLabel } from "@/shared/components/badge-label";

type Row = { name: string; example: string; kind: "plain" | "stand-in" | "generated" };
const KIND = {
  plain: ["Plain", "muted"],
  "stand-in": ["Stand-in", "strong"],
  generated: ["Generated", "default"],
} as const;

/** "What your app sees": the env vars cb puts in process.env for a connector (FR-DOC-006). */
export function EnvTable({ rows }: { rows: Row[] }) {
  return (
    <div className="not-prose my-5 overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="text-left text-xs text-subtle">
          <tr>
            <th className="px-4 py-2 font-medium">Variable</th>
            <th className="px-4 py-2 font-medium">Example value</th>
            <th className="px-4 py-2 font-medium">Kind</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border border-t border-border">
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="px-4 py-2 font-mono">{r.name}</td>
              <td className="px-4 py-2 font-mono text-xs break-all text-muted-foreground">{r.example}</td>
              <td className="px-4 py-2">
                <BadgeLabel tone={KIND[r.kind][1]}>{KIND[r.kind][0]}</BadgeLabel>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
