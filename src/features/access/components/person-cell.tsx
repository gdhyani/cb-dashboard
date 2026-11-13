import type { Member } from "@/features/members/types";
import { AvatarInitials } from "@/shared/components/avatar-initials";

/** Avatar, name and email — the first cell of every access table. */
export function PersonCell({ member }: { member: Member }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <AvatarInitials name={member.name} />
      <span className="min-w-0">
        <span className="block max-w-[14rem] truncate text-sm text-foreground">{member.name}</span>
        <span className="block max-w-[14rem] truncate font-mono text-xs text-foreground-lighter">{member.email}</span>
      </span>
    </span>
  );
}
