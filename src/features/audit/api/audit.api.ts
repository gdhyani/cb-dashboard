import { apiGetPaginated } from "@/shared/api/http";
import type { AuditEvent } from "../types";

export const listAudit = (orgId: string, page: number, pageSize = 25) =>
  apiGetPaginated<AuditEvent>(`/orgs/${orgId}/audit?page=${page}&pageSize=${pageSize}`);
