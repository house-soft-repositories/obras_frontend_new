import { useId, type ComponentProps, type ReactNode } from "react";
import { Input } from "@/core/ui/atoms/input";
import { cn } from "@/core/ui/cn";

export interface InputFormProps extends ComponentProps<typeof Input> {
  label: string;
  error?: ReactNode;
  helperText?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
}

export function InputForm({
  id,
  label,
  error,
  helperText,
  className,
  containerClassName,
  labelClassName,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputFormProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, helperId, errorId]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div data-slot="input-form" className={cn("grid gap-2", containerClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          "text-sm leading-5 font-semibold text-foreground",
          labelClassName,
        )}
      >
        {label}
        {required ? <span className="ml-1 text-[var(--cor-perigo)]">*</span> : null}
      </label>

      <Input
        id={inputId}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy}
        className={cn(
          error &&
            "!border-[var(--cor-perigo)] focus-visible:!ring-[var(--cor-perigo-borda)]",
          className,
        )}
        {...props}
      />

      {helperText ? (
        <p id={helperId} className="text-xs leading-5 text-muted">
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs leading-5 text-[var(--cor-perigo)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
