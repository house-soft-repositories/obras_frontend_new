"use client";

import { digitosParaCanonico, formatarBRLEntrada } from "@/lib/ui/dinheiro";

/**
 * Campo de dinheiro com mascara pt-BR: exibe "R$ 1.234,56" e emite o valor
 * canonico ("1234.56", ponto decimal). Acumula por centavos — digite os
 * numeros da direita para a esquerda.
 */
export function EntradaDinheiro({
  valor,
  onChange,
  placeholder = "R$ 0,00",
  required,
  style,
}: {
  valor: string;
  onChange: (canonico: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <input
      inputMode="numeric"
      placeholder={placeholder}
      required={required}
      style={style}
      value={formatarBRLEntrada(valor)}
      onChange={(e) => onChange(digitosParaCanonico(e.target.value))}
    />
  );
}
