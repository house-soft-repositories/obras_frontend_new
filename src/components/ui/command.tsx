"use client";

import * as Popover from "@base-ui/react/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";

export interface CommandOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface CommandBaseProps {
  label: string;
  options: CommandOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
}

interface CommandSingleProps extends CommandBaseProps {
  multiple?: false;
  value?: string;
  onValueChange: (value: string | undefined) => void;
}

interface CommandMultipleProps extends CommandBaseProps {
  multiple: true;
  value: string[];
  onValueChange: (value: string[]) => void;
}

export type CommandProps = CommandSingleProps | CommandMultipleProps;

export function Command(props: CommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listboxId = useId();
  const searchId = useId();
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return props.options.filter((option) =>
      `${option.label} ${option.description ?? ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery),
    );
  }, [props.options, query]);

  const selectedOptions = props.options.filter((option) =>
    props.multiple
      ? props.value.includes(option.value)
      : option.value === props.value,
  );
  const summary = props.multiple
    ? selectedOptions.length === 0
      ? (props.placeholder ?? "Selecione…")
      : `${selectedOptions.length} selecionado${selectedOptions.length === 1 ? "" : "s"}`
    : (selectedOptions[0]?.label ?? props.placeholder ?? "Selecione…");

  function selectOption(option: CommandOption) {
    if (option.disabled) return;
    if (props.multiple) {
      props.onValueChange(
        props.value.includes(option.value)
          ? props.value.filter((value) => value !== option.value)
          : [...props.value, option.value],
      );
      return;
    }
    props.onValueChange(
      option.value === props.value ? undefined : option.value,
    );
    setOpen(false);
  }

  return (
    <div data-slot="command" className={cn("grid gap-2", props.className)}>
      <span className="text-sm leading-5 font-semibold text-foreground">
        {props.label}
      </span>
      <Popover.Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Popover.Trigger
          disabled={props.disabled}
          aria-controls={open ? listboxId : undefined}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-app border border-input bg-surface px-3 text-left text-sm text-foreground transition-colors hover:border-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-muted"
        >
          <span
            className={selectedOptions.length === 0 ? "text-muted" : undefined}
          >
            {summary}
          </span>
          <ChevronsUpDown
            className="size-4 shrink-0 text-muted"
            aria-hidden="true"
          />
        </Popover.Popover.Trigger>
        <Popover.Popover.Portal>
          <Popover.Popover.Positioner
            side="bottom"
            align="start"
            sideOffset={6}
            className="z-50 w-[var(--anchor-width)] max-md:fixed max-md:inset-x-3 max-md:bottom-3 max-md:w-auto"
          >
            <Popover.Popover.Popup className="w-full min-w-72 overflow-hidden rounded-app border border-border bg-surface p-2 shadow-overlay outline-none">
              <label className="relative block" htmlFor={searchId}>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <span className="sr-only">Buscar em {props.label}</span>
                <input
                  id={searchId}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar…"
                  className="h-11 w-full rounded-app border border-input bg-surface py-0 pr-3 pl-9 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <div
                id={listboxId}
                role="listbox"
                aria-label={props.label}
                aria-multiselectable={props.multiple || undefined}
                aria-busy={false}
                className="mt-2 max-h-58 overflow-y-auto"
              >
                {filteredOptions.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted">
                    {props.emptyMessage ?? "Nenhum resultado encontrado."}
                  </p>
                ) : (
                  filteredOptions.map((option) => {
                    const selected = props.multiple
                      ? props.value.includes(option.value)
                      : props.value === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={option.disabled}
                        onClick={() => selectOption(option)}
                        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span>
                          <span className="block font-medium">
                            {option.label}
                          </span>
                          {option.description ? (
                            <span className="block text-xs text-muted">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                        {selected ? (
                          <Check
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </Popover.Popover.Popup>
          </Popover.Popover.Positioner>
        </Popover.Popover.Portal>
      </Popover.Popover.Root>
    </div>
  );
}
