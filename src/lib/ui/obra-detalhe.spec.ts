import { describe, expect, it } from "vitest";
import { abaAtivaDoPathname, abasDetalheObra } from "./obra-detalhe";

describe("abasDetalheObra (RF-14)", () => {
  it("gera as 6 abas na ordem com os hrefs das rotas existentes", () => {
    const abas = abasDetalheObra("o1");
    expect(abas.map((a) => a.titulo)).toEqual([
      "Dados",
      "Cronograma",
      "Contrato",
      "Medições",
      "Financeiro",
      "Arquivos",
    ]);
    expect(abas.map((a) => a.href)).toEqual([
      "/obras/o1/editar",
      "/obras/o1/cronograma",
      "/obras/o1/contrato",
      "/obras/o1/medicoes",
      "/obras/o1/financeiro",
      "/obras/o1/arquivos",
    ]);
  });
});

describe("abaAtivaDoPathname (RF-14)", () => {
  it("mapeia /editar para a aba Dados", () => {
    expect(abaAtivaDoPathname("/obras/o1/editar")).toBe("dados");
  });

  it("mantem Cronograma ativa nas sub-rotas gantt e calendario", () => {
    expect(abaAtivaDoPathname("/obras/o1/cronograma")).toBe("cronograma");
    expect(abaAtivaDoPathname("/obras/o1/cronograma/gantt")).toBe(
      "cronograma",
    );
    expect(abaAtivaDoPathname("/obras/o1/cronograma/calendario")).toBe(
      "cronograma",
    );
  });

  it("mapeia as demais secoes do detalhe", () => {
    expect(abaAtivaDoPathname("/obras/o1/contrato")).toBe("contrato");
    expect(abaAtivaDoPathname("/obras/o1/medicoes")).toBe("medicoes");
    expect(abaAtivaDoPathname("/obras/o1/financeiro")).toBe("financeiro");
    expect(abaAtivaDoPathname("/obras/o1/arquivos/")).toBe("arquivos");
  });

  it("retorna null fora das rotas de detalhe", () => {
    expect(abaAtivaDoPathname("/obras")).toBeNull();
    expect(abaAtivaDoPathname("/obras/nova")).toBeNull();
    expect(abaAtivaDoPathname("/obras/o1")).toBeNull();
    expect(abaAtivaDoPathname("/dashboard")).toBeNull();
    expect(abaAtivaDoPathname("/obras/o1/desconhecida")).toBeNull();
  });
});
