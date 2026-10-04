export const variableKeys = {
  list: (envId: string) => ["environments", envId, "variables"] as const,
  preview: (envId: string, userId: string) => ["environments", envId, "preview", userId] as const,
};
