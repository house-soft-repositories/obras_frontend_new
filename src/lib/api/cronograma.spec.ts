import { describe, expect, it } from "vitest";
import {
  construirPayloadEstagio,
  filtrarEstagios,
  montarArvore,
  type Estagio,
} from "./cronograma";

function estagio(over: Partial<Estagio> & { id: string }): Estagio {
  return {
    obraId: "o1",
    estagioPaiId: null,
    descricao: "Etapa",
    ordem: 0,
    ativo: true,
    modoDuracao: "NAO_INFORMADO",
    dataInicio: null,
    dataPrazo: null,
    totalDias: null,
    estagioPrecedenteId: null,
    responsavelUsuarioId: null,
    obraVinculadaId: null,
    tipoValor: null,
    percentualRealizado: null,
    concluido: false,
    dataConclusao: null,
    latitude: null,
    longitude: null,
    valorMeta: null,
    valorRealizado: null,
    ...over,
  };
}

describe("E3-07: arvore e filtros do cronograma", () => {
  it("montarArvore aninha subatividades sob a raiz preservando a ordem", () => {
    const raiz = estagio({ id: "a", ordem: 0 });
    const sub1 = estagio({ id: "s1", estagioPaiId: "a", ordem: 1 });
    const sub2 = estagio({ id: "s2", estagioPaiId: "a", ordem: 0 });
    const arvore = montarArvore([sub1, raiz, sub2]);
    expect(arvore).toHaveLength(1);
    expect(arvore[0].id).toBe("a");
    expect(arvore[0].subatividades.map((s) => s.id)).toEqual(["s2", "s1"]);
  });

  it("RN-CRO-22: filtro 'ativas' remove inativos e concluidos", () => {
    const a = estagio({ id: "a" });
    const b = estagio({ id: "b", ativo: false });
    const c = estagio({ id: "c", concluido: true });
    expect(filtrarEstagios([a, b, c], "ativas", null).map((e) => e.id)).toEqual([
      "a",
    ]);
  });

  it("RN-CRO-22: filtro 'minhas' mantem so os do usuario logado", () => {
    const a = estagio({ id: "a", responsavelUsuarioId: "u1" });
    const b = estagio({ id: "b", responsavelUsuarioId: "u2" });
    expect(filtrarEstagios([a, b], "minhas", "u1").map((e) => e.id)).toEqual([
      "a",
    ]);
  });

  it("construirPayloadEstagio descarta datas fora do modo DIAS_CORRIDOS", () => {
    const payload = construirPayloadEstagio({
      descricao: "EXEC",
      modoDuracao: "NAO_INFORMADO",
      dataInicio: "2026-01-01",
      totalDias: "10",
    }) as Record<string, unknown>;
    expect("dataInicio" in payload).toBe(false);
    expect("totalDias" in payload).toBe(false);
  });

  it("construirPayloadEstagio envia inicio + total_dias no modo DIAS_CORRIDOS", () => {
    const payload = construirPayloadEstagio({
      descricao: "EXEC",
      modoDuracao: "DIAS_CORRIDOS",
      dataInicio: "2026-06-01",
      totalDias: "6",
    }) as Record<string, unknown>;
    expect(payload.dataInicio).toBe("2026-06-01");
    expect(payload.totalDias).toBe(6);
    expect("dataPrazo" in payload).toBe(false);
  });
});
