import type { Role } from "@/features/auth/types";

export interface Org {
  id: string;
  name: string;
  role: Role;
  memberCount: number;
}
