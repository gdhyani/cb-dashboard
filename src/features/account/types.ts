/** A dashboard sign-in (GET /orgs/:orgId/sessions). */
export interface AccountSession {
  id: string;
  user: { id: string; name: string; email: string };
  userAgent: string;
  createdAt: string;
  lastSeenAt: string | null;
  expiresAt: string;
  /** The session making this request. */
  current: boolean;
}

/** A CLI login (GET /me/devices). */
export interface AccountDevice {
  id: string;
  name: string;
  os: string;
  lastSeenAt: string | null;
  createdAt: string;
  agent: { online: boolean; version: string | null; activeTunnels: number; seenAt: string | null };
}
