"use client";

import { useState } from "react";
import Link from "next/link";
import { corSemaforo, type ItemListaObras } from "@/lib/api/relatorios";
import { agruparPorDia, diasNoMes } from "@/lib/relatorios/calendario";

const MESES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Modo CALENDARIO (RN-REL-13): obras no dia do prazo do estagio atual. */
export function CalendarioObras({ obras }: { obras: ItemListaObras[] }) {
  // Mes inicial: o da primeira obra com prazo, ou um default fixo.
  const primeiro = obras.find((o) => o.prazoConclusaoEstagio)?.prazoConclusaoEstagio;
  const [ano, setAno] = useState(primeiro ? Number(primeiro.slice(0, 4)) : 2026);
  const [mes, setMes] = useState(primeiro ? Number(primeiro.slice(5, 7)) : 1);

  const porDia = agruparPorDia(obras, ano, mes);
  const total = diasNoMes(ano, mes);

  function navegar(delta: number) {
    let m = mes + delta;
    let a = ano;
    if (m < 1) { m = 12; a -= 1; }
    if (m > 12) { m = 1; a += 1; }
    setMes(m);
    setAno(a);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <button type="button" onClick={() => navegar(-1)}>◀</button>
        <strong>{MESES[mes - 1]} {ano}</strong>
        <button type="button" onClick={() => navegar(1)}>▶</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {Array.from({ length: total }, (_, i) => i + 1).map((dia) => {
          const obrasDia = porDia.get(dia) ?? [];
          return (
            <div
              key={dia}
              data-testid={`dia-${dia}`}
              style={{ border: "1px solid #eee", borderRadius: 6, minHeight: 64, padding: 4 }}
            >
              <div style={{ fontSize: 11, color: "#999" }}>{dia}</div>
              {obrasDia.map((o) => (
                <Link
                  key={o.obraId}
                  href={`/obras/${o.obraId}/editar`}
                  title={o.nome}
                  style={{
                    display: "block",
                    fontSize: 11,
                    borderLeft: `4px solid ${corSemaforo(o.semaforo)}`,
                    paddingLeft: 4,
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {o.nome}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
