"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { APP_HOME_PATH, BLOG_PATH, DOCS_PATH, GITHUB_URLS } from "@/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

/** Phones: the blog's menu (the docs use their sidebar drawer instead). */
export function BlogMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu"
        className="flex size-8 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground data-[state=open]:bg-fd-accent"
      >
        <Menu className="size-4" strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={BLOG_PATH}>Blog</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={DOCS_PATH}>Docs</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={GITHUB_URLS.env} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={APP_HOME_PATH}>Open dashboard</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
