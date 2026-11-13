"use client";

import { Check, ChevronRight } from "lucide-react";
import { DropdownMenu as MenuPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/shared/lib/utils";

const DropdownMenu = MenuPrimitive.Root;
const DropdownMenuTrigger = MenuPrimitive.Trigger;
const DropdownMenuGroup = MenuPrimitive.Group;
const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;
const DropdownMenuSub = MenuPrimitive.Sub;

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
          "cb-pop z-50 min-w-40 overflow-hidden rounded-md bg-overlay p-1 text-foreground-light shadow-floating",
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
        "relative flex min-h-7 cursor-default select-none items-center gap-2 rounded-[6px] px-2 py-1.5 text-xs outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-foreground-lighter",
        variant === "destructive"
          ? "text-destructive data-[highlighted]:bg-destructive/10 [&_svg]:!text-destructive"
          : "text-foreground-light data-[highlighted]:bg-overlay-hover data-[highlighted]:text-foreground",
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
      className={cn("px-2 py-1.5 text-xs text-foreground-lighter", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border-overlay", className)}
      {...props}
    />
  );
}

const itemBase =
  "relative flex min-h-7 cursor-default select-none items-center gap-2 rounded-[6px] px-2 py-1.5 text-xs text-foreground-light outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-overlay-hover data-[highlighted]:text-foreground data-[state=open]:bg-overlay-hover [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-foreground-lighter";

/** One choice in a radio group (e.g. Theme: Dark / Light / System); a check marks the current one. */
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(itemBase, "pl-7", className)}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.ItemIndicator>
          <Check className="!text-foreground" />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.SubTrigger>) {
  return (
    <MenuPrimitive.SubTrigger data-slot="dropdown-menu-sub-trigger" className={cn(itemBase, className)} {...props}>
      {children}
      <ChevronRight className="ml-auto" />
    </MenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.SubContent>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn(
          "cb-pop z-50 min-w-36 overflow-hidden rounded-md bg-overlay p-1 text-foreground-light shadow-floating",
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
}

/** Keyboard hint at the end of an item. */
function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("ml-auto text-xs tracking-widest text-foreground-lighter", className)} {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
