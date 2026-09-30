"use client";

import type { ComponentProps } from "react";

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
