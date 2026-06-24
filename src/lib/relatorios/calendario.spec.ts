import { describe, expect, it } from "vitest";
import type { ItemListaObras } from "@/lib/api/relatorios";
import { agruparPorDia, diasNoMes } from "./calendario";

function obra(id: string, prazo: string | null): ItemListaObras {
  return {
    obraId: id, nome: id, statusObra: "EM_DESENVOLVIMENTO", estagioAtualNome: null,
    prazoConclusaoEstagio: prazo, percentualRealizado: 0, semaforo: null, orgaoId: null,
    localidadeNome: null, responsavelNome: null, tags: [], acaoConveniada: null,
    prioritaria: false, empresaExecutora: null, numeroContrato: null, localizacoes: [],
    dataCriacao: "2026-01-01T00:00:00Z", ultimaAtualizacao: null,
  };
}

describe("agruparPorDia (RN-REL-13 calendario)", () => {
  it("agrupa obras no dia correto do prazo do estagio atual", () => {
    const obras = [
      obra("a", "2026-06-10"),
      obra("b", "2026-06-10"),
      obra("c", "2026-06-25"),
      obra("d", "2026-07-01"), // outro mes -> fora
      obra("e", null), // sem prazo -> fora
    ];
    const mapa = agruparPorDia(obras, 2026, 6);
    expect(mapa.get(10)?.map((o) => o.obraId)).toEqual(["a", "b"]);
    expect(mapa.get(25)?.map((o) => o.obraId)).toEqual(["c"]);
    expect(mapa.has(1)).toBe(false);
  });

  it("diasNoMes calcula corretamente", () => {
    expect(diasNoMes(2026, 2)).toBe(28);
    expect(diasNoMes(2026, 6)).toBe(30);
  });
});
