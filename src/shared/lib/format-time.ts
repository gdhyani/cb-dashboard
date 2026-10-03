import { formatDistanceToNowStrict } from "date-fns";

export function timeAgo(iso: string | null | undefined): string {
  return iso ? `${formatDistanceToNowStrict(new Date(iso))} ago` : "never";
}

export function timeUntil(iso: string): string {
  const date = new Date(iso);
  return date.getTime() <= Date.now() ? "expired" : `in ${formatDistanceToNowStrict(date)}`;
}
