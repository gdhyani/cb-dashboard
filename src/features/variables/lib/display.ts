import type { Variable } from "../types";

const LOCAL_URL_FIELDS = new Set(["baseUrl", "endpoint", "host", "port"]);
const STAND_IN_FIELDS = new Set(["accessKeyId", "user", "password", "privateKey"]);
const FROM_SERVICE_FIELDS = new Set(["projectId", "clientEmail", "region", "keyId", "teamId"]);

/** What the value column says. Protected values are never shown (FR-UI-001); plain values are. */
export function describeValue(v: Variable, isMain: boolean): { text: string; mono: boolean } {
  switch (v.type) {
    case "plain":
      return { text: v.value ?? "", mono: true };
    case "generated":
      return { text: `generated for each developer · ${v.format ?? ""}`, mono: false };
    case "visible":
      return { text: "•••• set · shown to developers", mono: false };
    default:
      // By field, not by position: a legacy group may show a host or an email first.
      if (v.field && LOCAL_URL_FIELDS.has(v.field)) return { text: "local URL, set by cb", mono: false };
      if (v.field && STAND_IN_FIELDS.has(v.field)) return { text: "stand-in, made by cb", mono: false };
      if (v.field && FROM_SERVICE_FIELDS.has(v.field)) return { text: "from the service settings", mono: false };
      if (isMain || !v.field) return { text: "●●●●●●●● · real value hidden", mono: false };
      return { text: "stand-in, made by cb", mono: false };
  }
}
