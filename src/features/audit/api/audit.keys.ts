export const auditKeys = {
  list: (orgId: string, page: number, pageSize: number) => ["orgs", orgId, "audit", page, pageSize] as const,
};
