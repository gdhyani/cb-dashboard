import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as api from "../api/audit.api";
import { auditKeys } from "../api/audit.keys";
import type { AuditCategory } from "../types";

export const useAudit = (orgId: string, page: number, pageSize = 25, category?: AuditCategory) =>
  useQuery({
    queryKey: auditKeys.list(orgId, page, pageSize, category ?? "all"),
    queryFn: () => api.listAudit(orgId, page, pageSize, category),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });
