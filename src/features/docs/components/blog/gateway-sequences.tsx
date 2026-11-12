import { SEQUENCES, type SequenceName } from "../../lib/sequences";
import { SequenceDiagram } from "./sequence-diagram";

/** FR-DOC-010: one of the protocol walk-throughs in lib/sequences.ts, by name. */
export function Sequence({ name }: { name: SequenceName }) {
  const s = SEQUENCES[name];
  return <SequenceDiagram lanes={s.lanes} steps={s.steps} label={s.label} caption={s.caption} />;
}

export const HttpsPathSequence = () => <Sequence name="https" />;
export const PostgresLoginSequence = () => <Sequence name="postgres" />;
