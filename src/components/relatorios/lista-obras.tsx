"use client";

import Link from "next/link";
import { corSemaforo, type ItemListaObras } from "@/lib/api/relatorios";
import { CartaoObra } from "./cartao-obra";

/** Modos LISTA (tabela) e CARTAO da lista de obras (RN-REL-13). */
export function ListaObras({
  obras,
  modo,
}: {
  obras: ItemListaObras[];
  modo: "LISTA" | "CARTAO";
}) {
  if (obras.length === 0) {
    return <p style={{ color: "#888" }}>Nenhuma obra para os filtros atuais.</p>;
  }
  if (modo === "CARTAO") {
    return (
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {obras.map((o) => (
          <CartaoObra key={o.obraId} obra={o} />
        ))}
      </div>
    );
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
          <th></th>
          <th>Nome</th>
          <th>Status</th>
          <th>Estagio</th>
          <th>% Realizado</th>
          <th>Localidade</th>
          <th>Contrato</th>
        </tr>
      </thead>
      <tbody>
        {obras.map((o) => (
          <tr key={o.obraId} style={{ borderBottom: "1px solid #f0f0f0" }}>
            <td>
              <span
                title={o.semaforo ?? "sem status"}
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: corSemaforo(o.semaforo),
                }}
              />
            </td>
            <td>
              <Link href={`/obras/${o.obraId}/editar`}>{o.nome}</Link>
            </td>
            <td>{o.statusObra}</td>
            <td>{o.estagioAtualNome ?? "—"}</td>
            <td>{o.percentualRealizado}%</td>
            <td>{o.localidadeNome ?? ""}</td>
            <td>{o.numeroContrato ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
