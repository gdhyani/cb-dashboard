const ROWS = [
  {
    type: "Plain",
    laptop: "The value itself",
    worksFor: "Anyone",
    real: "In the app, by design",
    note: "Not a secret: a port, a feature flag, a public URL.",
  },
  {
    type: "Random secret",
    laptop: "A value made for this developer",
    worksFor: "This developer’s setup only",
    real: "There is no shared value",
    note: "Session and cookie secrets the app only checks itself.",
  },
  {
    type: "Shown as-is",
    laptop: "The real value",
    worksFor: "Anyone who has it",
    real: "On the laptop: the one exception",
    note: "A last resort for a secret the app computes with itself. Marked with a warning everywhere.",
    warn: true,
  },
  {
    type: "Protected",
    laptop: "A stand-in",
    worksFor: "This device, through cb, while access lasts",
    real: "Only on the cb server, encrypted",
    note: "Databases, payment and AI keys, cloud keys, sign-in secrets, webhook secrets, key files.",
    safe: true,
  },
];

/** FR-DOC-010: the four kinds of env value cb manages and what a developer's laptop holds for each. */
export function ValueTypesMatrix() {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-border">
      <table aria-label="Env value types" className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-3 font-medium">
              Type
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              The laptop holds
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              It works for
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              The real value lives
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.type} className="border-b border-border align-top last:border-0">
              <th scope="row" className="px-4 py-3 font-semibold text-foreground">
                {r.type}
              </th>
              <td className="px-4 py-3">
                <span className={r.warn ? "text-amber-300" : r.safe ? "text-emerald-300" : undefined}>{r.laptop}</span>
                <p className="mt-1 text-xs text-muted-foreground">{r.note}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.worksFor}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.real}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
