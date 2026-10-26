import { describe, expect, it } from "vitest";
import { criarAditivoSchema } from "./contrato_schema";

const base = {
  numero: "001",
  tipo: "PRAZO" as const,
  dataAssinatura: "2026-12-01",
};

describe("criarAditivoSchema", () => {
  it("aceita aditivo de prazo em dias", () => {
    expect(
      criarAditivoSchema.safeParse({
        ...base,
        tipoPrazoExecucao: "DIAS",
        prazoExecucaoDias: 30,
      }).success,
    ).toBe(true);
  });

  it("exige prazo em dias ou data final para aditivo de prazo", () => {
    const result = criarAditivoSchema.safeParse(base);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Informe se o prazo será em dias ou por data final.",
      );
    }
  });

  it("aceita aditivo de prazo por data final", () => {
    expect(
      criarAditivoSchema.safeParse({
        ...base,
        tipoPrazoExecucao: "DATA",
        prazoExecucaoData: "2027-12-01",
      }).success,
    ).toBe(true);
  });

  it("exige fonte para aditivo com valor", () => {
    const result = criarAditivoSchema.safeParse({
      numero: "002",
      tipo: "VALOR",
      dataAssinatura: "2026-12-01",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Vincule ao menos uma fonte e informe o valor do aditivo.",
      );
    }
  });

  it("aceita aditivo com fonte e valor", () => {
    expect(
      criarAditivoSchema.safeParse({
        numero: "002",
        tipo: "VALOR",
        dataAssinatura: "2026-12-01",
        fontes: [{ fonteId: "550e8400-e29b-41d4-a716-446655440000", valor: "2500.00" }],
      }).success,
    ).toBe(true);
  });
});
