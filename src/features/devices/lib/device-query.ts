import type { Device, WebSession } from "../types";

/** "Chrome on macOS" from a user agent; good enough to recognise a session. */
export function describeBrowser(ua: string): string {
  const browser = browserName(ua);
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} on ${os}` : browser;
}

export function browserName(ua: string): string {
  return /Edg\//.test(ua)
    ? "Edge"
    : /Firefox\//.test(ua)
      ? "Firefox"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : "Browser";
}

const byText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });
const byTime = (a: string | null, b: string | null) => (a ? Date.parse(a) : 0) - (b ? Date.parse(b) : 0);

// CLI devices -------------------------------------------------------------------------------------------------------

export const deviceSearchFields = (d: Device) => [d.name, d.os, d.user.name, d.user.email];

export const deviceFilters = {
  /** running | stopped */
  agent: (d: Device, value: string) => (value === "running" ? d.agent.online : !d.agent.online),
  /** active | revoked */
  status: (d: Device, value: string) => (value === "revoked" ? d.revoked : !d.revoked),
};

export const deviceSorters = {
  name: (a: Device, b: Device) => byText(a.name, b.name),
  user: (a: Device, b: Device) => byText(a.user.name || a.user.email, b.user.name || b.user.email),
  seen: (a: Device, b: Device) => byTime(a.lastSeenAt, b.lastSeenAt),
};

// Dashboard sessions ------------------------------------------------------------------------------------------------

export const sessionSearchFields = (s: WebSession) => [describeBrowser(s.userAgent), s.user.name, s.user.email];

export const sessionFilters = {
  browser: (s: WebSession, value: string) => browserName(s.userAgent) === value,
};

export const sessionSorters = {
  user: (a: WebSession, b: WebSession) => byText(a.user.name || a.user.email, b.user.name || b.user.email),
  active: (a: WebSession, b: WebSession) => byTime(a.lastSeenAt ?? a.createdAt, b.lastSeenAt ?? b.createdAt),
};
