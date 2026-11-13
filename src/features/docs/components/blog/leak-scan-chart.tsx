import { LEAK_SCANS } from "../../lib/blog-data";
import { HBarChart } from "./hbar-chart";

/** FR-DOC-010: files searched by each leak scan (PRD §17.4). Every scan found zero real secrets. */
export function LeakScanChart() {
  return (
    <HBarChart
      title="Files searched for real secrets, per scan (0 found every time)"
      data={LEAK_SCANS.map((s) => ({
        label: s.run,
        value: s.files,
        note: `${s.date}: ${s.secrets} real secrets searched for in ${s.files.toLocaleString("en-GB")} files, ${s.leaks} found`,
      }))}
      tableLabel="Leak scans"
      valueLabel="Files searched"
    />
  );
}
