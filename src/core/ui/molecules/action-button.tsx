"use client";

import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/core/ui/atoms/button";
import { Tooltip } from "@/core/ui/atoms/tooltip";
import { cn } from "@/core/ui/cn";

export interface ActionButtonProps extends ButtonProps {
  /** Ícone exibido sempre (mobile e desktop). */
  icon: ReactNode;
  /** Rótulo exibido só no desktop (lg+) e usado como tooltip/aria-label. */
  label: string;
  /** Tooltip customizado. Padrão: label. Toda ação deve ter tooltip. */
  tooltip?: string;
  /**
   * Mostra o rótulo sempre (sem o modo responsivo de ícone só).
   * Use dentro de menus/popovers, onde o rótulo é parte da linha.
   */
  alwaysShowLabel?: boolean;
}

/**
 * Botão de ação responsivo da página de detalhamento de obras:
 * ícone + tooltip sempre; rótulo textual só no desktop (via `size="action"`).
 * Pode ser usado dentro de `Modal.Trigger asChild` (onClick é repassado).
 */
export function ActionButton({
  icon,
  label,
  tooltip,
  alwaysShowLabel,
  children,
  ...props
}: ActionButtonProps) {
  return (
    <Tooltip content={tooltip ?? label}>
      <Button
        {...props}
        size={props.size ?? (alwaysShowLabel ? "sm" : "action")}
        aria-label={props["aria-label"] ?? label}
      >
        {icon}
        <span
          className={cn(
            "whitespace-nowrap",
            alwaysShowLabel ? "inline" : "hidden lg:inline",
          )}
        >
          {children ?? label}
        </span>
      </Button>
    </Tooltip>
  );
}
