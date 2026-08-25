"use client";

import { somarFontes, type ParFonteValor } from "@/lib/api/contratos";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import { EntradaDinheiro } from "@/components/comum/entrada-dinheiro";
import { formatarBRLEntrada } from "@/lib/ui/dinheiro";
import estilos from "./fontes-editor.module.css";

/**
 * Editor de N pares fonte+valor com a soma exibida (RN-CON-04/13). Reutilizado
 * pelo formulario de Contrato, pelo de Aditivo (tipos VALOR/PRAZO_E_VALOR/FONTE)
 * e pelo de Medicao (RN-CRO-20).
 */
export function FontesEditor({
  fontes,
  opcoesFonte,
  onChange,
}: {
  fontes: ParFonteValor[];
  opcoesFonte: OpcaoSelect[];
  onChange: (fontes: ParFonteValor[]) => void;
}) {
  function setPar(i: number, patch: Partial<ParFonteValor>) {
    onChange(fontes.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function add() {
    onChange([...fontes, { fonteId: "", valor: "" }]);
  }
  function remover(i: number) {
    onChange(fontes.filter((_, idx) => idx !== i));
  }

  const soma = somarFontes(fontes);

  return (
    <fieldset className={estilos.bloco}>
      <legend className={estilos.titulo}>Fontes de recurso</legend>
      <div className={estilos.linhas}>
        {fontes.map((p, i) => (
          <div key={i} className={estilos.linha}>
            <select
              className={estilos.fonte}
              value={p.fonteId}
              onChange={(e) => setPar(i, { fonteId: e.target.value })}
              aria-label={`Fonte ${i + 1}`}
            >
              <option value="">— fonte —</option>
              {opcoesFonte.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
            <EntradaDinheiro
              valor={p.valor}
              onChange={(v) => setPar(i, { valor: v })}
              style={{ width: 140 }}
            />
            <button
              type="button"
              className={estilos.remover}
              onClick={() => remover(i)}
              aria-label={`Remover fonte ${i + 1}`}
            >
              Remover
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={estilos.adicionar} onClick={add}>
        ＋ Adicionar fonte
      </button>
      <p className={estilos.soma}>
        <span className={estilos.somaRotulo}>Soma das fontes</span>
        <span className={estilos.somaValor}>{formatarBRLEntrada(soma)}</span>
      </p>
    </fieldset>
  );
}
