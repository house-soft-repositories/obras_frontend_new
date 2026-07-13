"use client";

import { somarFontes, type ParFonteValor } from "@/lib/api/contratos";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import { EntradaDinheiro } from "@/components/comum/entrada-dinheiro";
import { formatarBRLEntrada } from "@/lib/ui/dinheiro";

/**
 * Editor de N pares fonte+valor com a soma exibida (RN-CON-04/13). Reutilizado
 * pelo formulario de Contrato e pelo de Aditivo (tipos VALOR/PRAZO_E_VALOR/FONTE).
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
    <fieldset style={{ border: "1px solid #eee", borderRadius: 6 }}>
      <legend>Fontes de recurso</legend>
      {fontes.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <select
            value={p.fonteId}
            onChange={(e) => setPar(i, { fonteId: e.target.value })}
            style={{ flex: 1 }}
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
          <button type="button" onClick={() => remover(i)}>
            remover
          </button>
        </div>
      ))}
      <button type="button" onClick={add}>
        + adicionar
      </button>
      <p style={{ marginTop: 8, fontWeight: 700 }}>
        Soma das fontes: {formatarBRLEntrada(soma)}
      </p>
    </fieldset>
  );
}
