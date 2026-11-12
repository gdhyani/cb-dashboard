"use client";

import { useState } from "react";
import { COVERAGE, coverageTotals } from "../../lib/coverage";

const VERIFIED = "#34d399";
const BETA = "#fbbf24";
const MAX = Math.max(...COVERAGE.map((g) => g.verified.length + g.beta.length));

type Hover = { group: string; kind: "Verified" | "Beta"; names: string[] } | null;

/**
 * FR-DOC-010: providers per connector family, verified against a real account vs Beta (PRD §17.4). Status colours
 * always come with a label (legend, hover and the table view), never colour alone.
 */
export function CoverageChart() {
  const [hover, setHover] = useState<Hover>(null);
  const totals = coverageTotals();
  return (
    <figure className="not-prose my-6 rounded-xl border border-border p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Providers tested end to end</p>
        <ul className="flex gap-4 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm" style={{ background: VERIFIED }} />
            Verified with a real account
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm" style={{ background: BETA }} />
            Beta
          </li>
        </ul>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {COVERAGE.map((g) => (
          <div
            key={g.group}
            data-testid="coverage-bar"
            className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3"
          >
            <span className="truncate text-xs text-muted-foreground">{g.group}</span>
            <div className="flex items-center gap-2">
              <div
                className="flex h-5 gap-[2px]"
                style={{ width: `${((g.verified.length + g.beta.length) / MAX) * 80}%` }}
              >
                {(
                  [
                    ["Verified", g.verified, VERIFIED],
                    ["Beta", g.beta, BETA],
                  ] as const
                )
                  .filter(([, names]) => names.length > 0)
                  .map(([kind, names, color]) => (
                    <button
                      key={kind}
                      type="button"
                      aria-label={`${g.group}: ${names.length} ${kind.toLowerCase()} — ${names.join(", ")}`}
                      onMouseEnter={() => setHover({ group: g.group, kind, names })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ group: g.group, kind, names })}
                      onBlur={() => setHover(null)}
                      className="h-full rounded-[4px] outline-offset-2"
                      style={{ background: color, flexGrow: names.length }}
                    />
                  ))}
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {g.verified.length}
                {g.beta.length ? ` + ${g.beta.length} beta` : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p aria-live="polite" className="mt-4 min-h-10 text-xs text-muted-foreground">
        {hover ? (
          <>
            <span className="font-medium text-foreground">
              {hover.group}, {hover.kind.toLowerCase()}:
            </span>{" "}
            {hover.names.join(", ")}
          </>
        ) : (
          `${totals.verified} providers verified with real accounts, ${totals.beta} in Beta. Hover a bar to see which.`
        )}
      </p>
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer text-muted-foreground">Show as a table</summary>
        <table aria-label="Provider coverage" className="mt-3 w-full text-left">
          <thead className="text-muted-foreground">
            <tr>
              <th scope="col" className="py-1 font-medium">
                Family
              </th>
              <th scope="col" className="py-1 font-medium">
                Verified
              </th>
              <th scope="col" className="py-1 font-medium">
                Beta
              </th>
            </tr>
          </thead>
          <tbody>
            {COVERAGE.map((g) => (
              <tr key={g.group} className="border-t border-border">
                <th scope="row" className="py-1 font-normal">
                  {g.group}
                </th>
                <td className="py-1 tabular-nums">{g.verified.length}</td>
                <td className="py-1 tabular-nums">{g.beta.length}</td>
              </tr>
            ))}
            <tr className="border-t border-border font-semibold">
              <th scope="row" className="py-1">
                Total
              </th>
              <td className="py-1 tabular-nums">{totals.verified}</td>
              <td className="py-1 tabular-nums">{totals.beta}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </figure>
  );
}
