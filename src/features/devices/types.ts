export interface Device {
  id: string;
  name: string;
  os: string;
  user: { id: string; name: string; email: string };
  lastSeenAt: string | null;
  createdAt: string;
  revoked: boolean;
  /** From the agent heartbeat; online = reported within the last 3 minutes. */
  agent: { online: boolean; version: string | null; activeTunnels: number; seenAt: string | null };
}

export interface WebSession {
  id: string;
  user: { id: string; name: string; email: string };
  userAgent: string;
  createdAt: string;
  lastSeenAt: string | null;
  expiresAt: string;
  current: boolean;
}
