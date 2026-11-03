import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/core/ui/cn";

export interface InputProps extends ComponentProps<"input"> {
  suffixButton?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, suffixButton, ...props }, ref) {
    if (!suffixButton) {
      return (
        <input
          ref={ref}
          data-slot="input"
          className={cn(
            "flex h-11 w-full rounded-app border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          data-slot="input"
          className={cn(
            "flex h-11 w-full rounded-app border border-input bg-surface px-3 py-2 pr-12 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <span className="absolute inset-y-0 right-2 flex items-center">
          {suffixButton}
        </span>
      </div>
    );
  },
);
Input.displayName = "Input";
