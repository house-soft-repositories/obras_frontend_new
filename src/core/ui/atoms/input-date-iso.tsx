"use client";

import { Calendar } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
  type ComponentProps,
  type FocusEventHandler,
  type MouseEventHandler,
} from "react";
import { cn } from "@/core/ui/cn";
import { InputPattern } from "./input-pattern";

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const BR_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

/**
 * ISO (`yyyy-MM-dd`) -> exibição (`dd/mm/aaaa`). Qualquer valor fora do
 * padrão ISO devolve string vazia.
 */
export function isoToBrDisplay(value: string | null | undefined): string {
  if (!value) return "";
  const match = ISO_DATE_RE.exec(value.trim());
  if (!match) return "";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/**
 * Exibição (`dd/mm/aaaa`) -> ISO (`yyyy-MM-dd`). Devolve `null` quando o
 * texto está incompleto ou não representa uma data real de calendário
 * (ex.: 31/02/2024). A validação usa UTC apenas como calendário, o valor
 * devolvido é sempre a string ISO — nenhum `Date` trafega no formulário,
 * então não há deslocamento de fuso.
 */
export function brToIsoDate(texto: string | null | undefined): string | null {
  if (!texto) return null;
  const match = BR_DATE_RE.exec(texto.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (day < 1 || month < 1 || month > 12 || year < 1000 || year > 9999) {
    return null;
  }
  const calendario = new Date(Date.UTC(year, month - 1, day));
  if (
    calendario.getUTCFullYear() !== year ||
    calendario.getUTCMonth() !== month - 1 ||
    calendario.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year.toString().padStart(4, "0")}-${pad2(month)}-${pad2(day)}`;
}

export interface InputDateIsoProps
  extends Omit<
    ComponentProps<"input">,
    | "type"
    | "value"
    | "defaultValue"
    | "onChange"
    | "pattern"
    | "min"
    | "max"
    | "step"
  > {
  /** Valor ISO (`yyyy-MM-dd`) ou string vazia. Mesmo contrato do `type="date"` nativo. */
  value: string | null | undefined;
  /** Chamado com o ISO sempre que o texto forma uma data válida (ou é limpo). */
  onIsoChange?: (iso: string) => void;
}

/**
 * Campo de data com exibição `dd/mm/aaaa` (máscara + botão de calendário)
 * que mantém o valor em ISO (`yyyy-MM-dd`).
 *
 * Componente controlado: use com `watch`/`setValue` (mesmo padrão do
 * `InputMoney`), não com `register`, pois exibição e valor têm formatos
 * diferentes. O contrato com o React Hook Form e com os schemas é idêntico
 * ao do input nativo `type="date"`, então nenhum schema precisa mudar.
 */
export function InputDateIso({
  value,
  onIsoChange,
  className,
  disabled,
  readOnly,
  onBlur,
  placeholder = "dd/mm/aaaa",
  ...props
}: InputDateIsoProps) {
  const normalizedValue = value ?? "";
  const [texto, setTexto] = useState(() => isoToBrDisplay(normalizedValue));
  const nativeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTexto(isoToBrDisplay(normalizedValue));
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [normalizedValue]);

  const abrirSeletor: MouseEventHandler<HTMLButtonElement> = () => {
    if (disabled || readOnly) return;

    if (typeof nativeInputRef.current?.showPicker === "function") {
      nativeInputRef.current.showPicker();
      return;
    }
    nativeInputRef.current?.click();
  };

  const aoDigitar: ChangeEventHandler<HTMLInputElement> = (event) => {
    const formatted = event.currentTarget.value;
    setTexto(formatted);
    if (formatted === "") {
      onIsoChange?.("");
      return;
    }
    const iso = brToIsoDate(formatted);
    if (iso) onIsoChange?.(iso);
  };

  const aoSair: FocusEventHandler<HTMLInputElement> = (event) => {
    // Texto parcial/inválido volta a refletir o valor confirmado.
    if (texto !== "" && !brToIsoDate(texto)) {
      setTexto(isoToBrDisplay(normalizedValue));
    }
    onBlur?.(event);
  };

  const aoSelecionarData: ChangeEventHandler<HTMLInputElement> = (event) => {
    onIsoChange?.(event.currentTarget.value);
  };

  return (
    <span className="relative block">
      <InputPattern
        {...props}
        data-slot="input-date-iso"
        className={cn("pr-11", className)}
        disabled={disabled}
        inputMode="numeric"
        mask="99/99/9999"
        maxLength={8}
        onBlur={aoSair}
        onChange={aoDigitar}
        pattern={/\d/g}
        placeholder={placeholder}
        readOnly={readOnly}
        type="text"
        value={texto}
      />
      <button
        type="button"
        aria-label="Selecionar data"
        className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-app text-muted transition hover:bg-muted/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || readOnly}
        onClick={abrirSeletor}
        tabIndex={-1}
      >
        <Calendar size={16} aria-hidden="true" />
      </button>
      <input
        ref={nativeInputRef}
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px opacity-0"
        onChange={aoSelecionarData}
        tabIndex={-1}
        type="date"
        value={ISO_DATE_RE.test(normalizedValue) ? normalizedValue : ""}
      />
    </span>
  );
}
