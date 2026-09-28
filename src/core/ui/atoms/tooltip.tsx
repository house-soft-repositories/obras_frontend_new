"use client";

import * as BaseTooltip from "@base-ui/react/tooltip";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/core/ui/cn";

export const tooltipPopupVariants = tv({
  base: "z-50 max-w-64 rounded-app border border-border bg-surface-raised px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-overlay outline-none transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
  variants: {
    tone: {
      default: "",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export type TooltipProviderProps = ComponentProps<typeof BaseTooltip.Tooltip.Provider>;

export function TooltipProvider({ delay = 350, closeDelay = 100, ...props }: TooltipProviderProps) {
  return (
    <BaseTooltip.Tooltip.Provider
      data-slot="tooltip-provider"
      delay={delay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

export interface TooltipProps
  extends Omit<ComponentProps<typeof BaseTooltip.Tooltip.Root>, "children">,
    VariantProps<typeof tooltipPopupVariants> {
  children: ReactElement;
  content: ReactNode;
  side?: ComponentProps<typeof BaseTooltip.Tooltip.Positioner>["side"];
  align?: ComponentProps<typeof BaseTooltip.Tooltip.Positioner>["align"];
  sideOffset?: ComponentProps<typeof BaseTooltip.Tooltip.Positioner>["sideOffset"];
  delay?: ComponentProps<typeof BaseTooltip.Tooltip.Trigger>["delay"];
  closeDelay?: ComponentProps<typeof BaseTooltip.Tooltip.Trigger>["closeDelay"];
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
  sideOffset = 8,
  delay,
  closeDelay,
  tone,
  className,
  ...props
}: TooltipProps) {
  return (
    <BaseTooltip.Tooltip.Root {...props}>
      <BaseTooltip.Tooltip.Trigger
        data-slot="tooltip-trigger"
        delay={delay}
        closeDelay={closeDelay}
        render={children}
      />
      <BaseTooltip.Tooltip.Portal>
        <BaseTooltip.Tooltip.Positioner
          data-slot="tooltip-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BaseTooltip.Tooltip.Popup
            data-slot="tooltip-popup"
            className={cn(tooltipPopupVariants({ tone }), className)}
          >
            {content}
          </BaseTooltip.Tooltip.Popup>
        </BaseTooltip.Tooltip.Positioner>
      </BaseTooltip.Tooltip.Portal>
    </BaseTooltip.Tooltip.Root>
  );
}
