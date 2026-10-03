import { apiGet } from "@/shared/api/http";
import type { Health } from "../types";

export function getHealth(): Promise<Health> {
  return apiGet<Health>("/health");
}
