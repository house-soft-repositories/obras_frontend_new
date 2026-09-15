import type { ChangeEventHandler, ComponentProps } from "react";
import { Input } from "./input";

type InputProps = ComponentProps<typeof Input>;

export interface InputPatternProps extends Omit<
  InputProps,
  "onChange" | "pattern"
> {
  /** Caracteres aceitos no valor do campo, por exemplo /\d/g. */
  pattern?: RegExp;
  /** Padrão HTML exposto ao navegador para validação semântica. */
  htmlPattern?: string;
  /**
   * Máscara visual. O caractere `9` recebe o próximo caractere aceito.
   * Exemplo: `99.999.999/9999-99`.
   */
  mask?: string;
  /** Recebe os valores bruto e formatado após cada alteração. */
  onValueChange?: (values: { raw: string; formatted: string }) => void;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export function filtrarValor(
  valor: string,
  pattern: RegExp,
  maxLength?: number,
) {
  const flags = pattern.flags.includes("g")
    ? pattern.flags
    : `${pattern.flags}g`;
  const resultado =
    valor.match(new RegExp(pattern.source, flags))?.join("") ?? "";
  return maxLength === undefined ? resultado : resultado.slice(0, maxLength);
}

export function aplicarMascara(valor: string, mascara?: string) {
  if (!mascara) return valor;

  let indiceValor = 0;
  let resultado = "";
  for (const caractereMascara of mascara) {
    if (caractereMascara === "9") {
      const proximo = valor[indiceValor];
      if (!proximo) break;
      resultado += proximo;
      indiceValor += 1;
      continue;
    }
    if (indiceValor > 0) resultado += caractereMascara;
  }
  return resultado;
}

/**
 * Campo construído sobre `Input` que mantém somente caracteres compatíveis com
 * o padrão informado. Útil para identificadores sem máscara, como CNPJ.
 */
export function InputPattern({
  htmlPattern,
  maxLength,
  mask,
  onChange,
  onValueChange,
  pattern = /./g,
  ...props
}: InputPatternProps) {
  const maxLengthExibido = mask ? mask.length : maxLength;
  const formatarValor = (valor: string) =>
    aplicarMascara(filtrarValor(valor, pattern, maxLength), mask);

  const aoMudar: ChangeEventHandler<HTMLInputElement> = (event) => {
    const raw = filtrarValor(event.currentTarget.value, pattern, maxLength);
    const formatted = aplicarMascara(raw, mask);
    event.currentTarget.value = formatted;
    onValueChange?.({ raw, formatted });
    onChange?.(event);
  };

  return (
    <Input
      {...props}
      data-slot="input-pattern"
      maxLength={maxLengthExibido}
      pattern={htmlPattern ?? pattern.source}
      onChange={aoMudar}
      value={
        typeof props.value === "string"
          ? formatarValor(props.value)
          : props.value
      }
    />
  );
}
