"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/core/ui/cn";

type PopoverAlign = "start" | "center" | "end";

type PopoverTriggerElement = ReactElement<{
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>;

export interface PopoverProps {
  /** Elemento que abre o popover (ex.: `ActionButton`). Recebe `onClick`/`aria-expanded`. */
  trigger: PopoverTriggerElement;
  children: ReactNode;
  /** Alinhamento horizontal em relação ao gatilho. Padrão: `end`. */
  align?: PopoverAlign;
  /** Controlado externamente. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classes extras no popup (aplicadas via `twMerge`). */
  className?: string;
  /** Rótulo acessível do popup. */
  "aria-label"?: string;
}

const GAP = 6;
const VIEWPORT_MARGIN = 8;

/**
 * Popover próprio da app (sem dependência externa), no mesmo padrão do `Modal`:
 * gatilho via `cloneElement`, conteúdo em `createPortal` para o `body`,
 * posicionamento fixo medido no `useLayoutEffect` (com flip vertical e clamp
 * na viewport), fecha em clique fora/Escape.
 *
 * O portal fica montado depois do primeiro render e apenas recebe `hidden`
 * quando fechado: assim conteúdo montado dentro do popover (ex.: um
 * `Modal.Root`) não desmonta quando o popover fecha.
 */
export function Popover({
  trigger,
  children,
  align = "end",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  "aria-label": ariaLabel,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupId = useId();

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !mounted) return;

    function updatePosition() {
      const popupElement = popupRef.current;
      if (!triggerNode || !popupElement) return;

      const rect = triggerNode.getBoundingClientRect();
      const width = popupElement.offsetWidth;
      const height = popupElement.offsetHeight;

      let top = rect.bottom + GAP;
      if (top + height > window.innerHeight - VIEWPORT_MARGIN) {
        top = rect.top - GAP - height;
      }
      top = Math.min(
        Math.max(VIEWPORT_MARGIN, top),
        window.innerHeight - height - VIEWPORT_MARGIN,
      );

      const left =
        align === "end"
          ? rect.right - width
          : align === "start"
            ? rect.left
            : rect.left + (rect.width - width) / 2;
      const clampedLeft = Math.min(
        Math.max(VIEWPORT_MARGIN, left),
        window.innerWidth - width - VIEWPORT_MARGIN,
      );

      setPosition({ top, left: clampedLeft });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, mounted, align, triggerNode]);

  useEffect(() => {
    if (!open) return;

    function handleDocumentClick(event: globalThis.MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (popupRef.current?.contains(target)) return;
      if (triggerNode?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerNode?.focus();
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, triggerNode, setOpen]);

  // `cloneElement` com props arbitrárias (aria-*): o tipo do gatilho é
  // alargado aqui de propósito — o consumidor tipa apenas o `onClick`.
  const triggerElement = isValidElement(trigger)
    ? (trigger as ReactElement<Record<string, unknown>>)
    : null;
  const originalOnClick = triggerElement?.props.onClick as
    | MouseEventHandler<HTMLButtonElement>
    | undefined;

  return (
    <>
      {triggerElement
        ? cloneElement(triggerElement, {
            "aria-haspopup": "dialog",
            "aria-expanded": open,
            "aria-controls": open ? popupId : undefined,
            onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
              setTriggerNode(event.currentTarget);
              originalOnClick?.(event);
              if (!event.defaultPrevented) setOpen(!open);
            },
          })
        : null}
      {mounted
        ? createPortal(
            <div
              ref={popupRef}
              id={popupId}
              role="dialog"
              aria-label={ariaLabel}
              hidden={!open}
              onClick={() => setOpen(false)}
              data-slot="popover-popup"
              className={cn(
                "fixed z-50 min-w-56 rounded-app border border-border bg-surface p-1 shadow-overlay outline-none",
                className,
              )}
              style={
                position
                  ? { top: position.top, left: position.left }
                  : { top: 0, left: 0, visibility: "hidden" }
              }
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export interface PopoverItemProps extends Omit<
  ComponentProps<"button">,
  "type"
> {
  icon?: ReactNode;
  /** `destructive` aplica o tom de perigo (ex.: excluir). */
  variant?: "default" | "destructive";
}

export function PopoverItem({
  icon,
  variant = "default",
  className,
  children,
  ...props
}: PopoverItemProps) {
  return (
    <button
      type="button"
      data-slot="popover-item"
      {...props}
      className={cn(
        "flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
        variant === "destructive"
          ? "text-danger hover:bg-danger-subtle"
          : "text-foreground hover:bg-surface-subtle hover:text-foreground",
        className,
      )}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}
