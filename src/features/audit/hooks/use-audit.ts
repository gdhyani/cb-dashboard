import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as api from "../api/audit.api";
import { auditKeys } from "../api/audit.keys";

export const useAudit = (orgId: string, page: number, pageSize = 25, enabled = true) =>
  useQuery({
    queryKey: auditKeys.list(orgId, page, pageSize),
    queryFn: () => api.listAudit(orgId, page, pageSize),
    placeholderData: keepPreviousData,
    enabled,
    refetchInterval: 15_000,
  });
