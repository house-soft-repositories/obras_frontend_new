"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import {
  cloneElement,
  useState,
  useTransition,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Button, buttonVariants } from "@/core/ui/atoms/button";
import { Tooltip } from "@/core/ui/atoms/tooltip";
import { cn } from "@/core/ui/cn";
import { Modal } from "@/core/ui/molecules/modal";

export type AlertDialogConfirmResult = boolean | void;

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  tone?: "danger" | "default";
  icon?: ReactNode;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  onConfirm?: () => AlertDialogConfirmResult | Promise<AlertDialogConfirmResult>;
  children?: ReactNode;
}

function AlertDialogRoot({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: Pick<AlertDialogProps, "open" | "defaultOpen" | "onOpenChange" | "children">) {
  return (
    <Modal.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </Modal.Root>
  );
}

function AlertDialogContent({
  title,
  description,
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  confirmingLabel,
  tone = "default",
  icon,
  isLoading: externalLoading,
  confirmDisabled,
  onConfirm,
}: Omit<AlertDialogProps, "open" | "defaultOpen" | "onOpenChange" | "children">) {
  const [isPending, startTransition] = useTransition();
  const isLoading = externalLoading ?? isPending;

  function handleConfirm() {
    if (!onConfirm || isLoading) return;
    startTransition(async () => {
      await onConfirm();
    });
  }

  const isDanger = tone === "danger";

  return (
    <Modal.Portal>
      <Modal.Backdrop />
      <Modal.Popup
        role="alertdialog"
        aria-modal="true"
        data-slot="alert-dialog"
        className="max-w-sm gap-4 p-5 text-center sm:p-6"
      >
        <Modal.CloseIcon />
        <div
          data-slot="alert-dialog-icon"
          className={cn(
            "mx-auto flex size-11 items-center justify-center rounded-full border",
            isDanger
              ? "border-danger-border bg-danger-subtle text-danger"
              : "border-border bg-surface-subtle text-muted",
          )}
        >
          {icon ?? <TriangleAlert aria-hidden="true" className="size-5" />}
        </div>
        <Modal.Header className="items-center text-center">
          <Modal.Title className="text-center text-lg">{title}</Modal.Title>
          {description ? (
            <Modal.Description className="text-center">
              {description}
            </Modal.Description>
          ) : null}
        </Modal.Header>
        <Modal.Footer className="sm:justify-center">
          <Modal.Close
            data-slot="alert-dialog-cancel"
            disabled={isLoading}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            {cancelLabel}
          </Modal.Close>
          <Button
            type="button"
            data-slot="alert-dialog-confirm"
            variant={isDanger ? "destructive" : "primary"}
            disabled={isLoading || confirmDisabled}
            onClick={handleConfirm}
          >
            {isLoading ? (confirmingLabel ?? "Aguarde...") : confirmLabel}
          </Button>
        </Modal.Footer>
      </Modal.Popup>
    </Modal.Portal>
  );
}

export interface ConfirmAlertDialogProps extends Omit<
  AlertDialogProps,
  "children"
> {
  trigger?: ReactElement;
  tooltip?: string;
  ariaLabel?: string;
}

export function ConfirmAlertDialog({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  confirmingLabel,
  tone = "default",
  icon,
  isLoading,
  confirmDisabled,
  onConfirm,
  trigger,
  tooltip,
  ariaLabel,
}: ConfirmAlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    defaultOpen ?? false,
  );
  const currentOpen = open ?? uncontrolledOpen;

  function setOpen(next: boolean) {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  const triggerNode = trigger ? (
    cloneElement(
      trigger as ReactElement<Record<string, unknown>>,
      {
        onClick: (event: MouseEvent) => {
          (trigger.props as { onClick?: (e: MouseEvent) => void }).onClick?.(
            event,
          );
          if (!event.defaultPrevented) setOpen(true);
        },
        "aria-label":
          ariaLabel ??
          (trigger.props as { "aria-label"?: string })["aria-label"],
      } as Record<string, unknown>,
    )
  ) : null;

  return (
    <AlertDialogRoot open={currentOpen} onOpenChange={setOpen}>
      {triggerNode ? (
        tooltip ? (
          <Tooltip content={tooltip}>{triggerNode}</Tooltip>
        ) : (
          triggerNode
        )
      ) : null}
      <AlertDialogContent
        title={title}
        description={description}
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        confirmingLabel={confirmingLabel}
        tone={tone}
        icon={icon}
        isLoading={isLoading}
        confirmDisabled={confirmDisabled}
        onConfirm={async () => {
          const result = await onConfirm?.();
          if (result !== false) setOpen(false);
        }}
      />
    </AlertDialogRoot>
  );
}

export const AlertDialog = {
  Root: AlertDialogRoot,
  Content: AlertDialogContent,
  Confirm: ConfirmAlertDialog,
};

export interface DeleteAlertTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  "aria-label"?: string;
}

export function DeleteAlertTrigger({
  ariaLabel,
  "aria-label": ariaLabelProp,
  disabled,
  onClick,
  ...props
}: DeleteAlertTriggerProps) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="iconSm"
      aria-label={ariaLabel ?? ariaLabelProp}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      <Trash2 aria-hidden="true" />
    </Button>
  );
}
