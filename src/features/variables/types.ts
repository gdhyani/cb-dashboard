export type VariableType = "plain" | "generated" | "visible" | "brokered";

export interface Variable {
  id: string;
  environmentId: string;
  key: string;
  type: VariableType;
  required: boolean;
  value: string | null;
  format: string | null;
  resourceId: string | null;
  resourceName: string | null;
  field: string | null;
  updatedAt: string;
}

export type CreateVariableInput =
  | { type: "plain"; key: string; value: string }
  | { type: "generated"; key: string; format: string }
  | { type: "visible"; key: string; value: string }
  | { type: "brokered"; key: string; resourceId: string; field: string };

export interface Preview {
  user: { id: string; name: string; email: string };
  hasAccess: boolean;
  entries: { key: string; type: VariableType; display: string }[];
}

export const GENERATED_FORMATS = [
  "hex:32",
  "hex:64",
  "base64:32",
  "base64url:32",
  "alnum:32",
  "alnum:48",
  "uuid",
] as const;

/** Display names; the API keeps the short type ids. */
export const VARIABLE_TYPE_LABEL: Record<VariableType, string> = {
  plain: "Plain value",
  brokered: "Managed secret",
  generated: "Per-user value",
  visible: "Exposed secret",
};
