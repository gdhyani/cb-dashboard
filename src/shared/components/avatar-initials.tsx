/** Monochrome initials disc for people and devices. */
export function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-muted text-[11px] font-medium text-muted-foreground"
    >
      {initials || "?"}
    </span>
  );
}
