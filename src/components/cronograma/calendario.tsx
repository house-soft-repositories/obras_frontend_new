"use client";

import { useState } from "react";
import type { Estagio } from "@/lib/api/cronograma";
import {
  agruparPrazosPorDia,
  matrizCalendario,
} from "@/lib/api/cronograma-visoes";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

/**
 * Calendario mensal: em cada dia, os estagios previstos para conclusao
 * (data_prazo) naquele dia (RN-CRO-22).
 */
export function Calendario({
  estagios,
  anoInicial,
  mesInicial,
}: {
  estagios: Estagio[];
  anoInicial: number;
  mesInicial: number;
}) {
  const [ano, setAno] = useState(anoInicial);
  const [mes, setMes] = useState(mesInicial);

  const semanas = matrizCalendario(ano, mes);
  const prazos = agruparPrazosPorDia(estagios, ano, mes);

  function navegar(delta: number) {
    let m = mes + delta;
    let a = ano;
    if (m < 1) {
      m = 12;
      a -= 1;
    } else if (m > 12) {
      m = 1;
      a += 1;
    }
    setMes(m);
    setAno(a);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <button type="button" onClick={() => navegar(-1)}>
          ◀
        </button>
        <strong>
          {String(mes).padStart(2, "0")}/{ano}
        </strong>
        <button type="button" onClick={() => navegar(1)}>
          ▶
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            {DIAS.map((d) => (
              <th key={d} style={{ border: "1px solid #eee", fontSize: 12, padding: 4 }}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanas.map((semana, i) => (
            <tr key={i}>
              {semana.map((dia, j) => (
                <td
                  key={j}
                  style={{
                    border: "1px solid #eee",
                    verticalAlign: "top",
                    height: 72,
                    padding: 4,
                    fontSize: 12,
                    background: dia ? "#fff" : "#fafafa",
                  }}
                >
                  {dia && (
                    <>
                      <div style={{ color: "#888" }}>{dia}</div>
                      {(prazos.get(dia) ?? []).map((e) => (
                        <div
                          key={e.id}
                          title={e.descricao}
                          style={{
                            background: e.concluido ? "#cfe9cf" : "#dde7ff",
                            borderRadius: 3,
                            padding: "1px 3px",
                            marginTop: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {e.descricao}
                        </div>
                      ))}
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
