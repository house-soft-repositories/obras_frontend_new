import { describe, expect, it } from "vitest";
import type { VisaoFisicoFinanceira } from "@/lib/api/financeiro";
import { cartoesTotais, chipTipoEmpenho } from "./financeiro-aba";
import { chipTipoMedicao, resumoMedido } from "./medicao-aba";

describe("chipTipoMedicao (RN-CRO-20)", () => {
  it("tipos do boletim tem rotulo acentuado e tom proprio", () => {
    expect(chipTipoMedicao("NORMAL")).toEqual({
      titulo: "Normal",
      classe: "chip-azul",
    });
    expect(chipTipoMedicao("RETIFICACAO").titulo).toBe("Retificação");
    expect(chipTipoMedicao("EXTRA").classe).toBe("chip-roxo");
  });
});

describe("resumoMedido — subtitulo do card de medicoes", () => {
  it("inclui o percentual sobre o total contratado quando conhecido", () => {
    expect(resumoMedido(5, 68)).toBe("68% do total contratado · 5 boletins");
  });

  it("sem percentual, mostra apenas a contagem", () => {
    expect(resumoMedido(3, null)).toBe("3 boletins");
  });

  it("singular no primeiro boletim", () => {
    expect(resumoMedido(1, null)).toBe("1 boletim");
  });
});

describe("chipTipoEmpenho (RN-FIN-04)", () => {
  it("global se distingue dos demais", () => {
    expect(chipTipoEmpenho("ORDINARIO").classe).toBe("chip-azul");
    expect(chipTipoEmpenho("GLOBAL")).toEqual({
      titulo: "Global",
      classe: "chip-roxo",
    });
  });
});

describe("cartoesTotais (RN-FIN-08)", () => {
  const ind = (valor: string, percentual: number) => ({ valor, percentual });
  const visao: VisaoFisicoFinanceira = {
    obraId: "o1",
    contratadoInicial: ind("4200000.00", 87),
    aditivadoTotal: ind("630000.00", 13),
    totalContratado: ind("4830000.00", 100),
    medidoTotal: ind("3284400.00", 68),
    empenhadoTotal: ind("4830000.00", 100),
    liquidadoTotal: ind("3100000.00", 64),
    pagoTotal: ind("2950000.00", 61),
  };

  it("traz empenhado, liquidado e pago na ordem do manual 10.7", () => {
    const cartoes = cartoesTotais(visao);
    expect(cartoes.map((c) => c.chave)).toEqual([
      "empenhado",
      "liquidado",
      "pago",
    ]);
  });

  it("formata valor em pt-BR e percentual sobre o total contratado", () => {
    const [, liquidado] = cartoesTotais(visao);
    expect(liquidado.valorFormatado).toBe("R$ 3.100.000,00");
    expect(liquidado.percentualTexto).toBe("64%");
  });
});
