"use client";

import { useState } from "react";
import secoes from "@/components/obras/detalhe/secoes.module.css";
import type { GrupoDados } from "@/lib/ui/dados-obra";

/**
 * Aba Dados da obra no padrao da referencia Claude Design: grupos
 * "Identificação" e "Execução" em cards read-only, com o formulario de edicao
 * atras do botao "Editar dados" (mesmo padrao da guia Contrato). Equipe e
 * observacoes seguem abaixo, sempre visiveis.
 */
export function DadosObra({
  grupos,
  formulario,
  podeEditar,
}: {
  grupos: GrupoDados[];
  formulario: React.ReactNode;
  podeEditar: boolean;
}) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className={secoes.pilha}>
        <div className={secoes.secaoCabecalho}>
          <h2 className={secoes.secaoTitulo}>Editar dados da obra</h2>
          <button
            type="button"
            className={`btn-secundario ${secoes.secaoAcao}`}
            onClick={() => setEditando(false)}
          >
            Voltar aos dados
          </button>
        </div>
        {formulario}
      </div>
    );
  }

  return (
    <div className={secoes.pilha}>
      {grupos.map((g, i) => (
        <div key={g.titulo} className={secoes.secao}>
          <div className={secoes.secaoCabecalho}>
            <h2 className={secoes.secaoTitulo}>{g.titulo}</h2>
            {/* O botao de edicao acompanha o primeiro grupo, como no design. */}
            {i === 0 && podeEditar && (
              <button
                type="button"
                className={`btn-secundario ${secoes.secaoAcao}`}
                onClick={() => setEditando(true)}
              >
                Editar dados
              </button>
            )}
          </div>
          <div className={secoes.grade}>
            {g.itens.map((it) => (
              <div key={it.rotulo}>
                <div className="rotulo-campo">{it.rotulo}</div>
                <div className="valor-campo">{it.valor}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
