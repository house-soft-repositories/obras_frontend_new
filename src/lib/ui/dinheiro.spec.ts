import { describe, expect, it } from "vitest";
import {
  digitosParaCanonico,
  formatarBRLEntrada,
  formatarMoeda,
  formatarMoedaCompacta,
} from "./dinheiro";

describe("formatarMoeda", () => {
  it("usa '.' para milhar e ',' para os centavos", () => {
    expect(formatarMoeda("1234567.89")).toBe("R$ 1.234.567,89");
    expect(formatarMoeda("1000")).toBe("R$ 1.000,00");
    expect(formatarMoeda(450000)).toBe("R$ 450.000,00");
  });

  it("sempre exibe 2 casas de centavos", () => {
    expect(formatarMoeda("0.5")).toBe("R$ 0,50");
    expect(formatarMoeda(0)).toBe("R$ 0,00");
    expect(formatarMoeda("30.00")).toBe("R$ 30,00");
  });

  it("separa 'R$' do numero com espaco normal (nao NBSP)", () => {
    expect(formatarMoeda(1)).toBe("R$ 1,00");
    expect(formatarMoeda(1)).not.toContain("\u00a0");
  });

  it("coloca o sinal antes do simbolo nos negativos", () => {
    expect(formatarMoeda("-1000")).toBe("-R$ 1.000,00");
  });

  it("devolve '—' para nulo, vazio ou nao numerico", () => {
    expect(formatarMoeda(null)).toBe("—");
    expect(formatarMoeda(undefined)).toBe("—");
    expect(formatarMoeda("")).toBe("—");
    expect(formatarMoeda("   ")).toBe("—");
    expect(formatarMoeda("abc")).toBe("—");
  });

  it("aceita um substituto para o vazio", () => {
    expect(formatarMoeda(null, { vazio: "R$ 0,00" })).toBe("R$ 0,00");
    expect(formatarMoeda("abc", { vazio: "" })).toBe("");
  });
});

describe("formatarMoedaCompacta", () => {
  it("abrevia a grandeza mantendo o padrao pt-BR", () => {
    expect(formatarMoedaCompacta(1500000)).toBe("R$ 1,5 mi");
    expect(formatarMoedaCompacta(450000)).toBe("R$ 450 mil");
    expect(formatarMoedaCompacta(0)).toBe("R$ 0");
  });

  it("devolve '—' para valor ausente", () => {
    expect(formatarMoedaCompacta(null)).toBe("—");
    expect(formatarMoedaCompacta("abc")).toBe("—");
  });
});

describe("formatarBRLEntrada", () => {
  it("formata o valor canonico e devolve vazio quando nao ha valor", () => {
    expect(formatarBRLEntrada("1234.56")).toBe("R$ 1.234,56");
    expect(formatarBRLEntrada("")).toBe("");
    expect(formatarBRLEntrada(null)).toBe("");
    expect(formatarBRLEntrada("abc")).toBe("");
  });
});

describe("digitosParaCanonico", () => {
  it("acumula os digitos como centavos", () => {
    expect(digitosParaCanonico("R$ 1.234,56")).toBe("1234.56");
    expect(digitosParaCanonico("7")).toBe("0.07");
    expect(digitosParaCanonico("")).toBe("");
  });
});
