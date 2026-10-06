/** SVG building blocks shared by the docs diagrams: a labelled box and an arrow with an optional label. */

export const BOX_W = 190;
export const BOX_H = 76;

export function ArrowMarker({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0L10 5L0 10z" fill="#8f8f8f" />
      </marker>
    </defs>
  );
}

export function Box({ x, y, label, sub }: { x: number; y: number; label: string; sub?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={8} fill="#0a0a0a" stroke="#3a3a3a" />
      <text x={x + BOX_W / 2} y={y + (sub ? 32 : 43)} textAnchor="middle" fill="#ededed" fontSize={14} fontWeight={600}>
        {label}
      </text>
      {sub && (
        <text x={x + BOX_W / 2} y={y + 54} textAnchor="middle" fill="#a1a1a1" fontSize={11}>
          {sub}
        </text>
      )}
    </g>
  );
}

export function Arrow({
  x1,
  x2,
  y,
  marker,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  marker: string;
  label?: string;
}) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#8f8f8f" markerEnd={`url(#${marker})`} />
      {label && (
        <text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" fill="#a1a1a1" fontSize={10}>
          {label}
        </text>
      )}
    </g>
  );
}
