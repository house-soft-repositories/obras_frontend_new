import { describe, expect, it } from "vitest";
import type { Acompanhamento, Estagio } from "./cronograma";
import {
  agruparPrazosPorDia,
  calcularBarrasGantt,
  formatarValorAcompanhamento,
  matrizCalendario,
  serieHistorico,
} from "./cronograma-visoes";

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

describe("E3-08: Gantt", () => {
  it("posiciona a barra proporcionalmente ao intervalo da obra", () => {
    // obra de 2026-01-01 a 2026-01-11 (10 dias de span).
    const e = estagio({
      id: "a",
      dataInicio: "2026-01-06",
      dataPrazo: "2026-01-11",
    });
    const [barra] = calcularBarrasGantt([e], {
      inicio: "2026-01-01",
      fim: "2026-01-11",
    });
    expect(barra.left).toBeCloseTo(50, 5); // 5/10
    expect(barra.width).toBeCloseTo(50, 5); // 5/10
  });

  it("omite estagios sem datas", () => {
    const e = estagio({ id: "a" });
    expect(
      calcularBarrasGantt([e], { inicio: "2026-01-01", fim: "2026-12-31" }),
    ).toHaveLength(0);
  });
});

describe("E3-08: calendario", () => {
  it("monta a matriz mensal com offset do primeiro dia", () => {
    // 2026-06-01 e uma segunda (getUTCDay=1).
    const semanas = matrizCalendario(2026, 6);
    expect(semanas[0][0]).toBeNull(); // domingo vazio
    expect(semanas[0][1]).toBe(1); // segunda = dia 1
    // ultimo dia de junho = 30.
    expect(semanas.flat().filter((d) => d != null)).toHaveLength(30);
  });

  it("agrupa estagios por dia de prazo no mes", () => {
    const e1 = estagio({ id: "a", dataPrazo: "2026-06-10" });
    const e2 = estagio({ id: "b", dataPrazo: "2026-06-10" });
    const e3 = estagio({ id: "c", dataPrazo: "2026-07-01" });
    const mapa = agruparPrazosPorDia([e1, e2, e3], 2026, 6);
    expect(mapa.get(10)?.map((e) => e.id)).toEqual(["a", "b"]);
    expect(mapa.has(1)).toBe(false); // julho fica de fora
  });
});

describe("E3-08: historico Meta x Realizado", () => {
  it("ordena por data e converte valores", () => {
    const acomps: Acompanhamento[] = [
      {
        id: "2",
        estagioId: "e",
        dataReferencia: "2026-02-01",
        valorMeta: "20",
        valorRealizado: "18",
        criadoEm: "",
      },
      {
        id: "1",
        estagioId: "e",
        dataReferencia: "2026-01-01",
        valorMeta: "10",
        valorRealizado: null,
        criadoEm: "",
      },
    ];
    const serie = serieHistorico(acomps);
    expect(serie.map((p) => p.data)).toEqual(["2026-01-01", "2026-02-01"]);
    expect(serie[0].meta).toBe(10);
    expect(serie[0].realizado).toBeNull();
    expect(serie[1].realizado).toBe(18);
  });
});

describe("formatarValorAcompanhamento", () => {
  it("exibe valor FINANCEIRO como moeda pt-BR", () => {
    expect(formatarValorAcompanhamento("1234.56", "FINANCEIRO")).toBe(
      "R$ 1.234,56",
    );
    expect(formatarValorAcompanhamento("1000000", "FINANCEIRO")).toBe(
      "R$ 1.000.000,00",
    );
  });

  it("mantem a unidade propria dos demais tipos", () => {
    expect(formatarValorAcompanhamento("50", "PERCENTUAL")).toBe("50%");
    expect(formatarValorAcompanhamento("12", "NUMERICO")).toBe("12 un");
    expect(formatarValorAcompanhamento("12", null)).toBe("12");
  });

  it("devolve travessao quando nao ha valor", () => {
    expect(formatarValorAcompanhamento(null, "FINANCEIRO")).toBe("—");
    expect(formatarValorAcompanhamento(undefined, "PERCENTUAL")).toBe("—");
    expect(formatarValorAcompanhamento("", "NUMERICO")).toBe("—");
  });
});
