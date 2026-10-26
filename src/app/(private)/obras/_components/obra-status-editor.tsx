"use client";

import { useState, useTransition } from "react";
import updateStatusObraAction from "@/core/actions/obras/update_status_obra_action";
import {
  statusObraLabel,
  statusObraChipVariant,
} from "@/core/utils/status-obra";
import type { StatusObra } from "@/core/schemas/obras/update_status_obra_schema";
import { Button } from "@/core/ui/atoms/button";
import { Chip } from "@/core/ui/atoms/chip";
import { useToast } from "@/core/hooks/useToast";

const statuses: StatusObra[] = [
  "EM_ABERTO",
  "EM_DESENVOLVIMENTO",
  "CONCLUIDO",
  "PARALISADO",
  "CANCELADO",
];

export function ObraStatusEditor({
  obraId,
  status,
  onUpdated,
}: {
  obraId: string;
  status: string;
  onUpdated: () => void;
}) {
  const toast = useToast();
  const [selectedStatus, setSelectedStatus] = useState<StatusObra | "">(
    statuses.includes(status as StatusObra) ? (status as StatusObra) : "",
  );
  const [pending, startTransition] = useTransition();

  function saveStatus() {
    if (!selectedStatus || selectedStatus === status) return;
    startTransition(async () => {
      const result = await updateStatusObraAction(obraId, {
        novoStatus: selectedStatus,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Status da obra atualizado.");
      onUpdated();
    });
  }

  return (
    <section className="mt-5 rounded-app border border-border bg-surface-subtle p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">
            Status da obra
          </span>
          <Chip variant={statusObraChipVariant(status)}>
            {statusObraLabel(status)}
          </Chip>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label
            className="grid gap-1 text-xs font-semibold text-muted"
            htmlFor="obra-status"
          >
            Alterar status
            <select
              id="obra-status"
              className="h-11 min-w-52 rounded-app border border-input bg-surface px-3 text-sm font-normal text-foreground"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as StatusObra)
              }
              disabled={pending}
            >
              <option value="">Selecione</option>
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {statusObraLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="primary"
            disabled={pending || !selectedStatus || selectedStatus === status}
            onClick={saveStatus}
          >
            {pending ? "Salvando..." : "Salvar status"}
          </Button>
        </div>
      </div>
      {selectedStatus === "CONCLUIDO" ? (
        <p className="mt-3 text-sm text-muted">
          Para concluir, a obra precisa ter pelo menos um recebimento provisório
          ou definitivo cadastrado. Inauguração não libera a conclusão.
        </p>
      ) : null}
    </section>
  );
}
