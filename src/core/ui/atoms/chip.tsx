import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/core/ui/cn";

export const chipVariants = tv({
  base: "inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold",
  variants: {
    variant: {
      azul: "chip-azul",
      verde: "chip-verde",
      vermelho: "chip-vermelho",
      cinza: "chip-cinza",
      ambar: "chip-ambar",
      roxo: "chip-roxo",
    },
  },
  defaultVariants: { variant: "cinza" },
});

export interface ChipProps
  extends ComponentProps<"span">, VariantProps<typeof chipVariants> {}

export function Chip({ className, variant, ...props }: ChipProps) {
  return (
    <span
      data-slot="chip"
      className={cn(chipVariants({ variant }), className)}
      {...props}
    />
  );
}
