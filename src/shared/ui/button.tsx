import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-white",
        secondary: "border border-border-strong bg-transparent text-foreground hover:border-ring hover:bg-white/[0.04]",
        outline: "border border-border-strong bg-transparent text-foreground hover:border-ring hover:bg-white/[0.04]",
        ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        "destructive-ghost": "text-destructive hover:bg-destructive/10",
        link: "h-auto px-0 text-foreground underline-offset-4 hover:underline",
      },
      size: {
        // A little shorter on phones so more fits on screen; regular from sm up.
        default: "h-8 px-3.5 sm:h-9 sm:px-4",
        xs: "h-6.5 gap-1.5 rounded-md px-2.5 text-[13px] sm:h-7",
        sm: "h-7 px-3 text-[13px] sm:h-8",
        lg: "h-9 px-5 sm:h-10",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-7",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner and keeps the label width; the button is disabled while loading. */
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="absolute animate-spin" aria-hidden="true" />}
          <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>{children}</span>
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
