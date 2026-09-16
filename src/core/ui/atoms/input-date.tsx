import { Calendar } from "lucide-react";
import {
  useRef,
  type ChangeEventHandler,
  type ComponentProps,
  type MouseEventHandler,
  type Ref,
} from "react";
import { cn } from "@/core/ui/cn";
import { InputPattern } from "./input-pattern";

type InputPatternProps = ComponentProps<typeof InputPattern>;

export type InputDateProps = Omit<InputPatternProps, "mask" | "pattern" | "type">;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function isoToBrDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function InputDate({
  className,
  disabled,
  onChange,
  readOnly,
  ref,
  ...props
}: InputDateProps) {
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const nativeInputRef = useRef<HTMLInputElement | null>(null);

  const abrirSeletor: MouseEventHandler<HTMLButtonElement> = () => {
    if (disabled || readOnly) return;

    if (typeof nativeInputRef.current?.showPicker === "function") {
      nativeInputRef.current.showPicker();
      return;
    }
    nativeInputRef.current?.click();
  };

  const aoSelecionarData: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!textInputRef.current) return;

    textInputRef.current.value = isoToBrDate(event.currentTarget.value);
    onChange?.({
      ...event,
      currentTarget: textInputRef.current,
      target: textInputRef.current,
    });
  };

  return (
    <span className="relative block">
      <InputPattern
        {...props}
        ref={(element) => {
          textInputRef.current = element;
          assignRef(ref, element);
        }}
        className={cn("pr-11", className)}
        disabled={disabled}
        inputMode="numeric"
        mask="99/99/9999"
        maxLength={8}
        onChange={onChange}
        pattern={/\d/g}
        placeholder={props.placeholder ?? "dd/mm/aaaa"}
        readOnly={readOnly}
        type="text"
      />
      <button
        type="button"
        aria-label="Selecionar data"
        className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-app text-muted transition hover:bg-muted/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || readOnly}
        onClick={abrirSeletor}
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
      />
    </span>
  );
}
