"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/core/ui/cn";

type SelectFormProps = ComponentProps<"select"> & {
  label: string;
  error?: ReactNode;
  helperText?: ReactNode;
};

export function SelectForm({
  id,
  label,
  error,
  helperText,
  className,
  required,
  children,
  ...props
}: SelectFormProps) {
  const helperId = helperText && id ? `${id}-helper` : undefined;
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="text-sm leading-5 font-semibold text-foreground"
      >
        {label}
        {required ? (
          <span className="ml-1 text-[var(--cor-perigo)]">*</span>
        ) : null}
      </label>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={
          [helperId, errorId].filter(Boolean).join(" ") || undefined
        }
        className={cn(
          "h-11 w-full rounded-app border border-input bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          Boolean(error) &&
            "!border-[var(--cor-perigo)] focus-visible:!ring-[var(--cor-perigo-borda)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {helperText ? (
        <p id={helperId} className="text-xs leading-5 text-muted">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          className="text-xs leading-5 text-[var(--cor-perigo)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckboxForm({
  id,
  label,
  ...props
}: ComponentProps<"input"> & { label: string }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 text-sm font-medium text-foreground"
    >
      <input
        id={id}
        type="checkbox"
        className="size-4 rounded border-input accent-[var(--cor-destaque)]"
        {...props}
      />
      {label}
    </label>
  );
}
