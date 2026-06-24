import { describe, expect, it } from "vitest";
import {
  filtrarLiquidacoesPorEmpenho,
  indicadoresVisao,
  validarEmpenho,
  validarPagamento,
  type FormularioEmpenho,
  type Liquidacao,
  type VisaoFisicoFinanceira,
} from "./financeiro";

function empenhoForm(over: Partial<FormularioEmpenho> = {}): FormularioEmpenho {
  return {
    fonteId: "f1",
    tipo: "ORDINARIO",
    numero: "E-1",
    dataEmpenho: "2016-03-01",
    valor: "1000.00",
    ...over,
  };
}

describe("validarEmpenho (RN-FIN-04/10)", () => {
  it("aceita empenho completo", () => {
    expect(validarEmpenho(empenhoForm())).toHaveLength(0);
  });

  it("exige tipo de empenho", () => {
    expect(validarEmpenho(empenhoForm({ tipo: "" }))).toContain(
      "Selecione o tipo de empenho",
    );
  });

  it("bloqueia valor nao positivo", () => {
    expect(validarEmpenho(empenhoForm({ valor: "0" }))).toContain(
      "Informe um valor positivo",
    );
    expect(validarEmpenho(empenhoForm({ valor: "-5" }))).toContain(
      "Informe um valor positivo",
    );
  });
});

describe("filtrarLiquidacoesPorEmpenho (select encadeado do pagamento)", () => {
  const liquidacoes: Liquidacao[] = [
    { id: "l1", empenhoId: "e1", fonteId: "f", numero: "1", dataLiquidacao: "", valor: "10", observacoes: null },
    { id: "l2", empenhoId: "e2", fonteId: "f", numero: "2", dataLiquidacao: "", valor: "20", observacoes: null },
    { id: "l3", empenhoId: "e1", fonteId: "f", numero: "3", dataLiquidacao: "", valor: "30", observacoes: null },
  ];

  it("retorna apenas as liquidacoes do empenho selecionado", () => {
    const r = filtrarLiquidacoesPorEmpenho(liquidacoes, "e1");
    expect(r.map((l) => l.id)).toEqual(["l1", "l3"]);
  });

  it("retorna vazio para empenho sem liquidacoes", () => {
    expect(filtrarLiquidacoesPorEmpenho(liquidacoes, "e9")).toHaveLength(0);
  });
});

describe("indicadoresVisao (RN-FIN-08)", () => {
  const v: VisaoFisicoFinanceira = {
    obraId: "o1",
    contratadoInicial: { valor: "180000.00", percentual: 90 },
    aditivadoTotal: { valor: "20000.00", percentual: 10 },
    totalContratado: { valor: "200000.00", percentual: 100 },
    medidoTotal: { valor: "60000.00", percentual: 30 },
    empenhadoTotal: { valor: "80000.00", percentual: 40 },
    liquidadoTotal: { valor: "50000.00", percentual: 25 },
    pagoTotal: { valor: "30000.00", percentual: 15 },
  };

  it("retorna os 7 indicadores na ordem do manual", () => {
    const ind = indicadoresVisao(v);
    expect(ind).toHaveLength(7);
    expect(ind.map((i) => i.titulo)).toEqual([
      "Contratado Inicial", "Aditivado", "Total Contratado",
      "Medido", "Empenhado", "Liquidado", "Pago",
    ]);
    expect(ind[4].indicador.percentual).toBe(40);
  });
});

describe("validarPagamento (RN-FIN-03)", () => {
  it("exige empenho e liquidacao", () => {
    const erros = validarPagamento({
      empenhoId: "", liquidacaoId: "", fonteId: "f",
      numeroOrdemBancaria: "OB", dataOrdemBancaria: "2016-03-10", valor: "10",
    });
    expect(erros).toContain("Selecione o empenho");
    expect(erros).toContain("Selecione a liquidacao");
  });
});
