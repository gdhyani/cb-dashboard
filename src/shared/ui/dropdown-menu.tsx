"use client";

import { DropdownMenu as MenuPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/shared/lib/utils";

const DropdownMenu = MenuPrimitive.Root;
const DropdownMenuTrigger = MenuPrimitive.Trigger;
const DropdownMenuGroup = MenuPrimitive.Group;

function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-44 overflow-hidden rounded-lg border border-border-strong bg-popover p-1 text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.6)]",
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & { variant?: "default" | "destructive" }) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex h-8 cursor-default select-none items-center gap-2.5 rounded-md px-2.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
        variant === "destructive"
          ? "text-destructive data-[highlighted]:bg-destructive/10"
          : "text-muted-foreground data-[highlighted]:bg-white/[0.06] data-[highlighted]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Label>) {
  return (
    <MenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("px-2.5 py-1.5 text-xs text-subtle", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
