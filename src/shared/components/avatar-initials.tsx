/** Initials disc for people and devices. */
export function AvatarInitials({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-300 font-medium text-foreground-light ${size === "sm" ? "size-6 text-[10px]" : "size-8 text-[11px]"}`}
    >
      {initials || "?"}
    </span>
  );
}
