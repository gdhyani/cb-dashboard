"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/shared/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

/** Supabase modal: app-coloured surface, header and footer bands split off by hairlines, 512px by default. */
function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="cb-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "cb-pop fixed top-1/2 left-1/2 z-50 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-dialog shadow-floating outline-none",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-4 overflow-y-auto p-5">{children}</div>
        <DialogPrimitive.Close
          className="absolute top-3.5 right-3.5 rounded-md p-1 text-foreground opacity-40 transition-opacity hover:opacity-100"
          aria-label="Close"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("-mx-5 -mt-5 flex flex-col gap-1.5 border-b border-border px-5 py-4 pr-12", className)}
      {...props}
    />
  );
}

/** Sits flush with the dialog edges below a hairline; actions on the right (Cancel, then the confirm action). */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-5 -mb-5 mt-1 flex flex-col-reverse gap-2 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-sans text-base leading-snug font-normal text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm leading-normal text-foreground-lighter", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
