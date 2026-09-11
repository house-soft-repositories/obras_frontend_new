"use client";

import { X } from "lucide-react";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/core/ui/cn";

type ModalContextValue = {
  open: boolean;
  titleId: string;
  descriptionId: string;
  setOpen: (open: boolean) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext(component: string) {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(`${component} deve ser usado dentro de Modal.Root.`);
  }
  return context;
}

export interface ModalRootProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ModalRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: ModalRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const titleId = useId();
  const descriptionId = useId();
  const currentOpen = open ?? uncontrolledOpen;

  function setOpen(nextOpen: boolean) {
    if (open === undefined) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <ModalContext.Provider
      value={{ open: currentOpen, titleId, descriptionId, setOpen }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export interface ModalTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

function ModalTrigger({ asChild, children, onClick, ...props }: ModalTriggerProps) {
  const { setOpen } = useModalContext("Modal.Trigger");

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(true);
  }

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
    }>;

    return cloneElement(child, {
      ...props,
      onClick(event: MouseEvent<HTMLButtonElement>) {
        child.props.onClick?.(event);
        handleClick(event);
      },
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

function ModalPortal({ children }: { children: ReactNode }) {
  const { open } = useModalContext("Modal.Portal");

  if (!open || typeof document === "undefined") return null;

  return createPortal(children, document.body);
}

function ModalBackdrop({ className, ...props }: ComponentProps<"div">) {
  const { setOpen } = useModalContext("Modal.Backdrop");

  return (
    <div
      data-slot="modal-backdrop"
      className={cn("fixed inset-0 z-50 bg-black/45", className)}
      onMouseDown={() => setOpen(false)}
      {...props}
    />
  );
}

function ModalPopup({ className, children, ...props }: ComponentProps<"div">) {
  const { titleId, descriptionId, setOpen } = useModalContext("Modal.Popup");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-slot="modal-popup"
      className={cn(
        "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 rounded-app border border-border bg-surface p-6 text-foreground shadow-overlay outline-none",
        className,
      )}
      onMouseDown={(event) => event.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}

function ModalHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

function ModalFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function ModalTitle({ className, ...props }: ComponentProps<"h2">) {
  const { titleId } = useModalContext("Modal.Title");

  return (
    <h2
      id={titleId}
      className={cn(
        "font-display text-xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ModalDescription({ className, ...props }: ComponentProps<"p">) {
  const { descriptionId } = useModalContext("Modal.Description");

  return (
    <p
      id={descriptionId}
      className={cn("text-sm leading-6 text-muted", className)}
      {...props}
    />
  );
}

function ModalBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("grid gap-4", className)} {...props} />;
}

function ModalClose({ onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useModalContext("Modal.Close");

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(false);
  }

  return <button type="button" onClick={handleClick} {...props} />;
}

function ModalCloseIcon({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <ModalClose
      aria-label="Fechar modal"
      className={cn(
        "absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-app text-muted transition-colors hover:bg-surface-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children ?? <X aria-hidden="true" className="size-4" />}
    </ModalClose>
  );
}

export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Portal: ModalPortal,
  Backdrop: ModalBackdrop,
  Popup: ModalPopup,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
  CloseIcon: ModalCloseIcon,
};
