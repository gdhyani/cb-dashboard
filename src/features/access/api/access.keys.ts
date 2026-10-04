export const accessKeys = {
  matrix: (projectId: string) => ["projects", projectId, "access"] as const,
};
