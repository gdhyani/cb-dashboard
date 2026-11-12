"use client";

import { useState } from "react";
import type { BarDatum } from "../../lib/blog-data";

const SECRET = "#fbbf24";
const PLAIN = "#a3a3a3";

/**
 * FR-DOC-010: a single-measure horizontal bar chart for the blog. Bars are thin with 4px rounded ends; values are
 * direct-labelled; hover or focus shows the note; a table view carries the same numbers. When `legend` is set,
 * bars marked `secret` are amber and the rest grey, and the legend names both.
 */
export function HBarChart({
  title,
  data,
  tableLabel,
  valueLabel,
  legend,
  format = (n) => n.toLocaleString("en-GB"),
}: {
  title: string;
  data: BarDatum[];
  tableLabel: string;
  valueLabel: string;
  legend?: { secret: string; plain: string };
  format?: (n: number) => string;
}) {
  const [active, setActive] = useState<BarDatum | null>(null);
  const max = Math.max(...data.map((d) => d.value));
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <figure className="not-prose my-6 rounded-xl border border-border p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {legend && (
          <ul className="flex gap-4 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-sm" style={{ background: SECRET }} />
              {legend.secret}
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-sm" style={{ background: PLAIN }} />
              {legend.plain}
            </li>
          </ul>
        )}
      </div>
      <div className="mt-5 flex flex-col gap-2.5">
        {data.map((d) => (
          <div
            key={d.label}
            data-testid="hbar"
            className="grid grid-cols-[minmax(0,10rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,13rem)_1fr]"
          >
            <span className="truncate text-xs text-muted-foreground">{d.label}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`${d.label}: ${format(d.value)}${d.note ? ` — ${d.note}` : ""}`}
                onMouseEnter={() => setActive(d)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(d)}
                onBlur={() => setActive(null)}
                className="h-4 rounded-[4px] outline-offset-2"
                style={{
                  width: `${Math.max(2, (d.value / max) * 78)}%`,
                  background: legend && d.secret ? SECRET : PLAIN,
                }}
              />
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{format(d.value)}</span>
            </div>
          </div>
        ))}
      </div>
      <p aria-live="polite" className="mt-4 min-h-5 text-xs text-muted-foreground">
        {active ? (
          <>
            <span className="font-medium text-foreground">{active.label}:</span> {active.note ?? format(active.value)}
          </>
        ) : (
          "Hover or focus a bar for details."
        )}
      </p>
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer text-muted-foreground">Show as a table</summary>
        <table aria-label={tableLabel} className="mt-3 w-full text-left">
          <thead className="text-muted-foreground">
            <tr>
              <th scope="col" className="py-1 font-medium">
                Kind
              </th>
              <th scope="col" className="py-1 font-medium">
                {valueLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-border">
                <th scope="row" className="py-1 font-normal">
                  {d.label}
                </th>
                <td className="py-1 tabular-nums">{format(d.value)}</td>
              </tr>
            ))}
            <tr className="border-t border-border font-semibold">
              <th scope="row" className="py-1">
                Total
              </th>
              <td className="py-1 tabular-nums">{format(total)}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </figure>
  );
}
