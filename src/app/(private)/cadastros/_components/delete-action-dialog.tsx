"use client";

import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import {
  AlertDialog,
  DeleteAlertTrigger,
  type AlertDialogConfirmResult,
} from "@/core/ui/molecules/alert-dialog";

interface DeleteActionDialogProps {
  ariaLabel: string;
  title: string;
  description: ReactNode;
  tooltip: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  onConfirm: () => AlertDialogConfirmResult | Promise<AlertDialogConfirmResult>;
}

export function DeleteActionDialog({
  ariaLabel,
  title,
  description,
  tooltip,
  confirmLabel = "Excluir",
  confirmingLabel = "Excluindo...",
  onConfirm,
}: DeleteActionDialogProps) {
  return (
    <AlertDialog.Confirm
      title={title}
      description={description}
      tone="danger"
      confirmLabel={confirmLabel}
      confirmingLabel={confirmingLabel}
      tooltip={tooltip}
      ariaLabel={ariaLabel}
      icon={<Trash2 aria-hidden="true" className="size-5" />}
      trigger={<DeleteAlertTrigger aria-label={ariaLabel} />}
      onConfirm={onConfirm}
    />
  );
}
