import { ENV_COMPOSITION } from "../../lib/blog-data";
import { HBarChart } from "./hbar-chart";

/** FR-DOC-010: what one real app's .env is made of (cb's real-provider test app, names only). */
export function EnvCompositionChart() {
  return (
    <HBarChart
      title="49 values in one real app's .env, by kind"
      data={ENV_COMPOSITION}
      tableLabel="Env values by kind"
      valueLabel="Values"
      legend={{ secret: "Gives access if leaked", plain: "Safe to read" }}
    />
  );
}
