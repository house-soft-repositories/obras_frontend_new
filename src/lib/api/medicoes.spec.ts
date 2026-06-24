import { describe, expect, it } from "vitest";
import {
  construirPayloadMedicao,
  formularioVazio,
  somarFontes,
  validarMedicao,
  type FormularioMedicao,
} from "./medicoes";

function form(over: Partial<FormularioMedicao> = {}): FormularioMedicao {
  return {
    numero: "1",
    dataMedicao: "2016-03-01",
    tipo: "NORMAL",
    orgaoId: "org-1",
    observacoes: "",
    fontes: [{ fonteId: "f1", valor: "100.00" }],
    ...over,
  };
}

describe("validarMedicao (RN-CRO-20)", () => {
  it("aceita formulario completo com 1 fonte", () => {
    expect(validarMedicao(form())).toHaveLength(0);
  });

  it("bloqueia submit sem ao menos 1 fonte com valor", () => {
    const erros = validarMedicao(form({ fontes: [{ fonteId: "", valor: "" }] }));
    expect(erros).toContain("Adicione ao menos uma fonte de recurso com valor");
  });

  it("exige numero, data e orgao", () => {
    const erros = validarMedicao(
      form({ numero: "", dataMedicao: "", orgaoId: "" }),
    );
    expect(erros.length).toBeGreaterThanOrEqual(3);
  });
});

describe("somarFontes (valor total = soma das fontes)", () => {
  it("soma os valores digitados nas fontes", () => {
    expect(
      somarFontes([
        { fonteId: "a", valor: "100000.00" },
        { fonteId: "b", valor: "50000.50" },
      ]),
    ).toBe("150000.50");
  });

  it("ignora valores em branco / nao numericos", () => {
    expect(
      somarFontes([
        { fonteId: "a", valor: "100" },
        { fonteId: "b", valor: "" },
      ]),
    ).toBe("100.00");
  });
});

describe("construirPayloadMedicao", () => {
  it("envia apenas fontes validas e converte numero", () => {
    const payload = construirPayloadMedicao(
      form({
        numero: "3",
        fontes: [
          { fonteId: "f1", valor: "100" },
          { fonteId: "", valor: "" },
        ],
      }),
    );
    expect(payload.numero).toBe(3);
    expect(payload.fontes).toHaveLength(1);
    expect(payload.fontes[0]).toEqual({ fonteId: "f1", valor: "100.00" });
  });

  it("omite observacoes em branco", () => {
    const payload = construirPayloadMedicao(form({ observacoes: "  " }));
    expect(payload.observacoes).toBeUndefined();
  });
});

describe("formularioVazio", () => {
  it("comeca NORMAL com 1 par de fonte vazio", () => {
    const f = formularioVazio();
    expect(f.tipo).toBe("NORMAL");
    expect(f.fontes).toHaveLength(1);
  });
});
