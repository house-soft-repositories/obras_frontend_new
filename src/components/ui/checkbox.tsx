"use client";

import * as BaseCheckbox from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/core/ui/cn";

export interface CheckboxProps extends Omit<
  ComponentProps<typeof BaseCheckbox.Checkbox.Root>,
  "className"
> {
  className?: string;
}

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <BaseCheckbox.Checkbox.Root
      data-slot="checkbox"
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-sm border border-input bg-surface text-foreground transition-colors hover:border-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[checked]:border-foreground data-[checked]:bg-foreground data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Checkbox.Indicator
        data-slot="checkbox-indicator"
        className="data-indeterminate:hidden"
      >
        <Check className="size-3.5 text-white" aria-hidden="true" />
      </BaseCheckbox.Checkbox.Indicator>
      <BaseCheckbox.Checkbox.Indicator
        data-slot="checkbox-indeterminate-indicator"
        keepMounted
        className="hidden data-[indeterminate]:block"
      >
        <Minus className="size-3.5 text-white" aria-hidden="true" />
      </BaseCheckbox.Checkbox.Indicator>
    </BaseCheckbox.Checkbox.Root>
  );
}
