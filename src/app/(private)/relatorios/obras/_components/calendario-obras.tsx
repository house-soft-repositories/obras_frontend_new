"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { Caption, Heading } from "@/core/ui/atoms/typography";
import {
  agruparPorDia,
  corSemaforo,
  diasNoMes,
  type FiltroRelatorioObras,
  type ItemListaObras,
} from "@/core/schemas/relatorios/obras_relatorio_schema";
import { ExportarRelatorioButton } from "./exportar-relatorio-button";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MAX_POR_DIA = 3;

/** Extrai ano/mês (1-based) do prazo ISO; null quando ausente ou inválido. */
function anoMesDoPrazo(prazo: string | null | undefined): {
  ano: number;
  mes: number;
} | null {
  if (!prazo) return null;
  const [a, m] = prazo.slice(0, 10).split("-").map(Number);
  if (!Number.isInteger(a) || !Number.isInteger(m) || m < 1 || m > 12)
    return null;
  return { ano: a, mes: m };
}

/**
 * Modo calendário: obras posicionadas no dia do prazo de conclusão do estágio
 * atual. Paridade visual com o legado, com grade alinhada à semana e navegação
 * entre meses.
 */
export function CalendarioObras({
  obras,
  filtros,
}: {
  obras: ItemListaObras[];
  filtros: FiltroRelatorioObras;
}) {
  const inicial = (() => {
    for (const o of obras) {
      const anoMes = anoMesDoPrazo(o.prazoConclusaoEstagio);
      if (anoMes) return anoMes;
    }
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
  })();

  const [ano, setAno] = useState(inicial.ano);
  const [mes, setMes] = useState(inicial.mes);

  const porDia = useMemo(
    () => agruparPorDia(obras, ano, mes),
    [obras, ano, mes],
  );
  const totalDias = diasNoMes(ano, mes);
  // 0 = domingo; desloca o dia 1 para a coluna certa da semana.
  const deslocamento = new Date(ano, mes - 1, 1).getDay();
  const hoje = new Date();
  const ehMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth() + 1;
  const emMes = [...porDia.values()].reduce((n, lista) => n + lista.length, 0);

  const titulo = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  function navegar(delta: number) {
    let proximoMes = mes + delta;
    let proximoAno = ano;
    if (proximoMes < 1) {
      proximoMes = 12;
      proximoAno -= 1;
    }
    if (proximoMes > 12) {
      proximoMes = 1;
      proximoAno += 1;
    }
    setMes(proximoMes);
    setAno(proximoAno);
  }

  return (
    <section
      aria-label="Calendário de prazos dos estágios"
      className="rounded-app border border-border bg-surface p-5 shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Mês anterior"
            onClick={() => navegar(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Heading as="h2" className="min-w-44 text-center text-xl capitalize">
            {titulo}
          </Heading>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Próximo mês"
            onClick={() => navegar(1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
        <ExportarRelatorioButton filtros={filtros} total={obras.length} />
      </div>
      <Caption className="mt-1">
        {emMes === 0
          ? "Nenhum prazo de estágio neste mês."
          : `${emMes} prazo(s) neste mês.`}{" "}
        {obras.length - emMes > 0
          ? `${obras.length - emMes} obra(s) com prazo em outro mês ou sem prazo.`
          : ""}
      </Caption>

      <div
        className="mt-4 grid grid-cols-7 gap-1.5"
        role="grid"
        aria-label={titulo}
      >
        {DIAS_SEMANA.map((dia) => (
          <p
            key={dia}
            className="pb-1 text-center text-xs font-semibold text-muted"
            aria-hidden="true"
          >
            {dia}
          </p>
        ))}
        {Array.from({ length: deslocamento }, (_, i) => (
          <span key={`vazio-${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: totalDias }, (_, i) => i + 1).map((dia) => {
          const obrasDia = porDia.get(dia) ?? [];
          const ehHoje = ehMesAtual && dia === hoje.getDate();
          return (
            <div
              key={dia}
              role="gridcell"
              data-slot="calendario-dia"
              data-testid={`dia-${dia}`}
              aria-label={`Dia ${dia}${obrasDia.length > 0 ? `, ${obrasDia.length} obra(s)` : ""}`}
              className={`min-h-20 rounded-app border bg-surface p-1.5 ${
                ehHoje ? "border-accent ring-1 ring-ring" : "border-border"
              }`}
            >
              <p
                className={`text-xs tabular-nums ${ehHoje ? "font-bold text-foreground" : "text-muted"}`}
              >
                {dia}
              </p>
              <ul className="mt-1 grid gap-1">
                {obrasDia.slice(0, MAX_POR_DIA).map((obra) => (
                  <li key={obra.obraId} className="min-w-0">
                    <Link
                      href={`/obras/${obra.obraId}`}
                      title={`${obra.nome} · ${obra.percentualRealizado}%`}
                      className="block truncate border-l-4 pl-1 text-xs font-medium hover:underline"
                      style={{
                        borderColor: corSemaforo(obra.semaforo),
                      }}
                    >
                      {obra.nome || "Obra sem nome"}
                    </Link>
                  </li>
                ))}
              </ul>
              {obrasDia.length > MAX_POR_DIA && (
                <p className="mt-1 pl-1 text-xs text-muted">
                  +{obrasDia.length - MAX_POR_DIA}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
