import { apiGetPaginated } from "@/shared/api/http";
import type { AuditCategory, AuditEvent } from "../types";

export const listAudit = (orgId: string, page: number, pageSize = 25, category?: AuditCategory) =>
  apiGetPaginated<AuditEvent>(
    `/orgs/${orgId}/audit?page=${page}&pageSize=${pageSize}${category ? `&category=${category}` : ""}`,
  );
