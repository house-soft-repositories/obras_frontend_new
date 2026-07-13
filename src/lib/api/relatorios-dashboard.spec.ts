import { describe, expect, it } from "vitest";
import type { ContagemPorStatus } from "./relatorios";
import { montarKpisDashboard } from "./relatorios-dashboard";

const contagem: ContagemPorStatus = {
  total: 40,
  emAberto: 5,
  emDesenvolvimento: 21,
  concluidas: 10,
  paralisadas: 3,
  canceladas: 1,
};

const zerada: ContagemPorStatus = {
  total: 0,
  emAberto: 0,
  emDesenvolvimento: 0,
  concluidas: 0,
  paralisadas: 0,
  canceladas: 0,
};

describe("montarKpisDashboard", () => {
  it("monta os 4 cartoes na ordem do design, com cores e valores fixos", () => {
    const kpis = montarKpisDashboard(contagem, 6);
    expect(kpis.map((k) => k.label)).toEqual([
      "Total de obras",
      "Em desenvolvimento",
      "Concluídas",
      "Paralisadas",
    ]);
    expect(kpis.map((k) => k.cor)).toEqual([
      "#2563eb",
      "#16a34a",
      "#0891b2",
      "#dc2626",
    ]);
    expect(kpis.map((k) => k.valor)).toEqual([40, 21, 10, 3]);
  });

  it("calcula percentuais da carteira com Math.round", () => {
    const kpis = montarKpisDashboard(contagem, 6);
    expect(kpis[1].sub).toBe("53% da carteira"); // 21/40 = 52.5 -> 53
    expect(kpis[2].sub).toBe("25% da carteira"); // 10/40 = 25
  });

  it("total 0 nao divide por zero: percentuais viram 0%", () => {
    const kpis = montarKpisDashboard(zerada, 0);
    expect(kpis[1].sub).toBe("0% da carteira");
    expect(kpis[2].sub).toBe("0% da carteira");
    expect(kpis[0].sub).toBe("em 0 órgãos");
  });

  it("subtitulos: orgaos no plural/singular e alerta das paralisadas", () => {
    expect(montarKpisDashboard(contagem, 6)[0].sub).toBe("em 6 órgãos");
    expect(montarKpisDashboard(contagem, 1)[0].sub).toBe("em 1 órgão");
    expect(montarKpisDashboard(contagem, 6)[3].sub).toBe("requerem atenção");
  });
});
