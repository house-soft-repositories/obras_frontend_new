"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/core/ui/cn";
import Formmaters from "@/core/utils/formmaters";

type InputMoneyChange = {
  valorFormatado: string;
  valorInCents: number;
};

type InputMoneyProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "inputMode" | "type" | "value" | "onChange"
> & {
  valueInCents?: string | number | null;
  onChange?: ComponentPropsWithoutRef<"input">["onChange"];
  onValueChange?: (value: InputMoneyChange) => void;
};

export function formatMoneyFromCents(valueInCents: string | number | null | undefined) {
  return Formmaters.moneyFromCents(valueInCents);
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export const InputMoney = forwardRef<HTMLInputElement, InputMoneyProps>(
  function InputMoney(
    { className, valueInCents, onChange, onValueChange, placeholder = "R$ 0,00", ...props },
    ref,
  ) {
    const valorInCents = Number(valueInCents || 0);
    const valorFormatado = formatMoneyFromCents(valorInCents);

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        data-slot="input-money"
        {...props}
        className={cn(
          "!flex !h-11 !w-full !rounded-app !border !border-input !bg-surface !px-3 !py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        placeholder={placeholder}
        value={valorFormatado}
        onChange={(event) => {
          const nextValorInCents = Number(onlyDigits(event.target.value) || 0);
          event.target.value = String(nextValorInCents);
          onChange?.(event);
          onValueChange?.({
            valorFormatado: formatMoneyFromCents(nextValorInCents),
            valorInCents: nextValorInCents,
          });
        }}
      />
    );
  },
);
