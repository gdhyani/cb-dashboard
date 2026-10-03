export const resourceKeys = {
  list: (envId: string) => ["environments", envId, "resources"] as const,
};
