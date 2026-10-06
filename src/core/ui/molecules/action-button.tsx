"use client";

import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/core/ui/atoms/button";
import { Tooltip } from "@/core/ui/atoms/tooltip";

export interface ActionButtonProps extends ButtonProps {
  /** Ícone exibido sempre (mobile e desktop). */
  icon: ReactNode;
  /** Rótulo exibido só no desktop (lg+) e usado como tooltip/aria-label. */
  label: string;
  /** Tooltip customizado. Padrão: label. Toda ação deve ter tooltip. */
  tooltip?: string;
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
  children,
  ...props
}: ActionButtonProps) {
  return (
    <Tooltip content={tooltip ?? label}>
      <Button
        {...props}
        size={props.size ?? "action"}
        aria-label={props["aria-label"] ?? label}
      >
        {icon}
        <span className="hidden whitespace-nowrap lg:inline">
          {children ?? label}
        </span>
      </Button>
    </Tooltip>
  );
}
