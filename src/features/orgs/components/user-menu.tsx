"use client";

import { BookOpen, LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DOCS_PATH } from "@/constants";
import { useLogout, useMe } from "@/features/auth/hooks/use-auth";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { THEME_CHOICES, type ThemeChoice } from "@/shared/theme/theme";
import { useTheme } from "@/shared/theme/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useOrg } from "../hooks/use-orgs";

const THEME_ICONS = { dark: Moon, light: Sun, system: Monitor } as const;

/** Avatar menu at the right of the top bar: who you are, Account, Theme, Docs, Sign out. */
export function UserMenu({ orgId }: { orgId: string }) {
  const router = useRouter();
  const me = useMe();
  const org = useOrg(orgId);
  const logout = useLogout();
  const { choice, setChoice } = useTheme();
  const name = me.data?.user.name ?? "";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex size-8 items-center justify-center rounded-full transition-opacity hover:opacity-80"
      >
        <AvatarInitials name={name} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm text-foreground">{name}</span>
            {org.data && <BadgeLabel tone={org.isAdmin ? "strong" : "default"}>{org.data.role}</BadgeLabel>}
          </span>
          <span className="truncate text-xs text-foreground-lighter">{me.data?.user.email}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/orgs/${orgId}/account`}>
            <UserRound /> Account preferences
          </Link>
        </DropdownMenuItem>
        {/* FR-DOC-002: Docs sits directly above Sign out. */}
        <DropdownMenuItem asChild>
          <Link href={DOCS_PATH}>
            <BookOpen /> Docs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={choice} onValueChange={(v) => setChoice(v as ThemeChoice)}>
          {THEME_CHOICES.map((t) => {
            const Icon = THEME_ICONS[t.value];
            return (
              <DropdownMenuRadioItem key={t.value} value={t.value}>
                <Icon /> {t.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout.mutate(undefined, { onSettled: () => router.replace("/login") })}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
