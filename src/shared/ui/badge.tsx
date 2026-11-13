import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { BADGE_SHAPE, BADGE_TONES } from "@/shared/lib/badge-tones";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  cn(
    BADGE_SHAPE,
    "w-fit shrink-0 justify-center overflow-hidden transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  ),
  {
    variants: {
      variant: {
        // Coloured tones come from the design system's badge palette (shared with BadgeLabel).
        default: BADGE_TONES.default,
        strong: BADGE_TONES.strong,
        success: BADGE_TONES.success,
        warning: BADGE_TONES.warning,
        destructive: BADGE_TONES.danger,
        muted: BADGE_TONES.muted,
        outline: "border-border-strong text-foreground [a&]:hover:bg-accent",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
