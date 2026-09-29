"use client";

import * as BaseSwitch from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { cn } from "@/core/ui/cn";

export interface SwitchProps
  extends Omit<ComponentProps<typeof BaseSwitch.Switch.Root>, "className"> {
  className?: string;
}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Switch.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-input px-0.5 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "data-[checked]:bg-accent",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Switch.Thumb
        data-slot="switch-thumb"
        className="size-5 rounded-full bg-surface shadow transition-transform duration-150 data-[checked]:translate-x-5"
      />
    </BaseSwitch.Switch.Root>
  );
}
