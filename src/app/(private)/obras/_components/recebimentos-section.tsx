"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  criarRecebimentoAction,
  listRecebimentosAction,
  removerRecebimentoAction,
} from "@/core/actions/obras/guias/recebimentos_actions";
import { useToast } from "@/core/hooks/useToast";
import {
  salvarRecebimentoSchema,
  type Recebimento,
  type TipoRecebimento,
} from "@/core/schemas/obras/recebimento_schema";
import { Button } from "@/core/ui/atoms/button";
import { AlertDialog } from "@/core/ui/molecules/alert-dialog";
import { Caption } from "@/core/ui/atoms/typography";
import { temRecebimentoLiberador } from "@/core/schemas/obras/recebimento_rules";

const tipos: Array<{ value: TipoRecebimento; label: string }> = [
  { value: "PROVISORIO", label: "Provisório" },
  { value: "DEFINITIVO", label: "Definitivo" },
  { value: "INAUGURACAO", label: "Inauguração" },
];

function labelTipo(tipo: TipoRecebimento) {
  return tipos.find((item) => item.value === tipo)?.label ?? tipo;
}

function dataDisplay(value: string | null | undefined) {
  if (!value) return "Não informada";
  const [year, month, day] = value.slice(0, 10).split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

export function RecebimentosSection({ obraId }: { obraId: string }) {
  const toast = useToast();
  const [items, setItems] = useState<Recebimento[]>([]);
  const [tipo, setTipo] = useState<TipoRecebimento>("PROVISORIO");
  const [data, setData] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoading(true);
    const response = await listRecebimentosAction(obraId);
    setLoading(false);
    if (!response.success) {
      toast.error(response.error);
      return;
    }
    setItems(response.data);
  }, [obraId, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function add() {
    const parsed = salvarRecebimentoSchema.safeParse({
      tipo,
      ...(data ? { data } : {}),
      ...(dataPrevista ? { dataPrevista } : {}),
    });
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Revise os dados do recebimento.",
      );
      return;
    }
    startTransition(async () => {
      const response = await criarRecebimentoAction(obraId, parsed.data);
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      toast.success("Recebimento cadastrado.");
      setData("");
      setDataPrevista("");
      await load();
    });
  }

  async function remove(itemId: string): Promise<boolean> {
    const response = await removerRecebimentoAction(obraId, itemId);
    if (!response.success) {
      toast.error(response.error);
      return false;
    }
    toast.success("Recebimento excluído.");
    await load();
    return true;
  }

  return (
    <section
      className="mt-5 grid gap-4 rounded-app border border-border bg-surface p-5"
      data-testid="recebimentos-section"
    >
      <div>
        <h2 className="font-display text-xl font-semibold">Recebimentos</h2>
        <Caption className="mt-1">
          Provisório e definitivo liberam a conclusão da obra. Inauguração é
          apenas um registro e não libera o status Concluída.
        </Caption>
      </div>
      <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Tipo
          <select
            className="h-11 rounded-app border border-input bg-surface px-3 text-sm font-normal text-foreground"
            value={tipo}
            onChange={(event) => setTipo(event.target.value as TipoRecebimento)}
            disabled={pending}
          >
            {tipos.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Data
          <input
            className="h-11 rounded-app border border-input bg-surface px-3 text-sm font-normal text-foreground"
            type="date"
            value={data}
            onChange={(event) => setData(event.target.value)}
            disabled={pending}
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Data prevista
          <input
            className="h-11 rounded-app border border-input bg-surface px-3 text-sm font-normal text-foreground"
            type="date"
            value={dataPrevista}
            onChange={(event) => setDataPrevista(event.target.value)}
            disabled={pending}
          />
        </label>
        <Button type="button" onClick={add} disabled={pending}>
          {pending ? "Salvando..." : "Cadastrar recebimento"}
        </Button>
      </div>
      {!loading && !temRecebimentoLiberador(items) ? (
        <p className="rounded-app border border-warning-border bg-warning-subtle p-4 text-sm text-muted">
          A obra não pode ser concluída enquanto não houver um recebimento
          provisório ou definitivo persistido.
        </p>
      ) : null}
      {loading ? (
        <Caption>Carregando recebimentos...</Caption>
      ) : items.length === 0 ? (
        <p className="rounded-app border border-dashed border-border p-4 text-sm text-muted">
          Nenhum recebimento cadastrado.
        </p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-app border border-border p-3 text-sm"
            >
              <div>
                <strong>{labelTipo(item.tipo)}</strong>
                <div className="text-xs text-muted">
                  Data: {dataDisplay(item.data)} · Prevista:{" "}
                  {dataDisplay(item.dataPrevista)}
                </div>
              </div>
              <AlertDialog.Confirm
                title="Excluir recebimento?"
                description="A exclusão pode impedir a conclusão da obra se este for o último recebimento liberador."
                tone="danger"
                confirmLabel="Excluir"
                confirmingLabel="Excluindo..."
                trigger={
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                  >
                    Excluir
                  </Button>
                }
                onConfirm={() => remove(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
