export const resourceKeys = {
  list: (envId: string) => ["environments", envId, "resources"] as const,
  profiles: (resourceId: string) => ["resources", resourceId, "profiles"] as const,
  presets: ["presets"] as const,
};
