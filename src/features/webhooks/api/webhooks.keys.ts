export const webhookKeys = {
  all: (envId: string) => ["environments", envId, "webhook-events"] as const,
  list: (envId: string, page: number) => ["environments", envId, "webhook-events", page] as const,
};
