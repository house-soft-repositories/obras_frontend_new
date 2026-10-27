import { tv } from "tailwind-variants";
import { cn } from "@/core/ui/cn";

const stepPillVariants = tv({
  base: "cursor-pointer rounded-full px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  variants: {
    state: {
      atual: "bg-accent font-semibold text-foreground",
      concluido: "bg-primary/15 font-semibold text-primary",
      pendente: "bg-surface-subtle text-muted hover:bg-border",
    },
  },
});

type StepPillsProps = {
  steps: readonly string[];
  current: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Indicador de etapas clicável de wizards multi-etapas.
 * Clicar em uma etapa anterior volta livremente; clicar em uma etapa
 * futura é um avanço — a validação dos inputs é responsabilidade do chamador.
 */
export function StepPills({
  steps,
  current,
  onSelect,
  disabled,
  className,
}: StepPillsProps) {
  return (
    <ol
      data-slot="step-pills"
      aria-label="Etapas do cadastro"
      className={cn("mt-4 flex flex-wrap gap-2", className)}
    >
      {steps.map((label, index) => (
        <li key={label}>
          <button
            type="button"
            disabled={disabled}
            aria-current={index === current ? "step" : undefined}
            onClick={() => onSelect(index)}
            className={stepPillVariants({
              state:
                index === current
                  ? "atual"
                  : index < current
                    ? "concluido"
                    : "pendente",
            })}
          >
            {index + 1}. {label}
          </button>
        </li>
      ))}
    </ol>
  );
}
