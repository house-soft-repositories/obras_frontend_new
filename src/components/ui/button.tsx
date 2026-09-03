import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/core/ui/cn";

export const buttonVariants = tv({
  base: "!inline-flex !min-h-11 cursor-pointer items-center justify-center gap-2 !rounded-app !border !px-4 !py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  variants: {
    variant: {
      primary:
        "!border-accent !bg-accent text-foreground hover:!bg-accent-hover",
      secondary:
        "!border-border !bg-surface text-foreground hover:!bg-surface-subtle",
      destructive:
        "!border-transparent !bg-foreground text-white hover:!bg-foreground/90",
      ghost:
        "!border-transparent !bg-transparent text-muted hover:!bg-surface-subtle hover:text-foreground",
    },
    size: {
      icon: "!size-11 !p-0",
      sm: "!min-h-9 !px-3 !py-1.5 text-xs",
      md: "!min-h-11 !px-4 !py-2 text-sm",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export interface ButtonProps
  extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
