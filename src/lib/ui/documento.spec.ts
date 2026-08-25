import { describe, expect, it } from "vitest";
import {
  cpfValido,
  documentoValidoParaTipo,
  iniciaisNome,
  limparCpf,
  mascararCpf,
  mascararDocumento,
  mascararPorTipo,
  problemaDocumento,
  rotuloDocumento,
  siglaTipoPessoa,
} from "./documento";

describe("problemaDocumento", () => {
  it("aceita CPF e CNPJ validos, com e sem mascara", () => {
    expect(problemaDocumento("529.982.247-25", "FISICA")).toBeNull();
    expect(problemaDocumento("52998224725", "FISICA")).toBeNull();
    expect(problemaDocumento("19.131.243/0001-97", "JURIDICA")).toBeNull();
  });

  it("aceita CPF que comeca com zero", () => {
    expect(problemaDocumento("000.000.001-91", "FISICA")).toBeNull();
  });

  it("distingue numero incompleto de digito verificador errado", () => {
    // O caso do CPF copiado de planilha, que chega sem o zero a esquerda.
    expect(problemaDocumento("0000000191", "FISICA")).toMatch(
      /incompleto: 10 de 11 dígitos \(falta 1\)/,
    );
    expect(problemaDocumento("529.982.247-26", "FISICA")).toMatch(
      /dígitos verificadores não conferem/,
    );
  });

  it("explica a recusa de sequencias repetidas em vez de mandar conferir digitos", () => {
    expect(problemaDocumento("111.111.111-11", "FISICA")).toMatch(
      /todos os dígitos iguais/,
    );
  });

  it("cobra o documento quando o campo esta vazio", () => {
    expect(problemaDocumento("", "FISICA")).toBe("Informe o CPF.");
    expect(problemaDocumento("", "JURIDICA")).toBe("Informe o CNPJ.");
  });

  it("usa o rotulo e o tamanho do tipo declarado", () => {
    expect(problemaDocumento("19131243", "JURIDICA")).toMatch(
      /CNPJ incompleto: 8 de 14 dígitos \(faltam 6\)/,
    );
  });

  it("concorda com documentoValidoParaTipo em todos os casos", () => {
    const casos = [
      ["52998224725", "FISICA"],
      ["52998224726", "FISICA"],
      ["11111111111", "FISICA"],
      ["19131243000197", "JURIDICA"],
      ["19131243000198", "JURIDICA"],
    ] as const;
    for (const [valor, tipo] of casos) {
      expect(problemaDocumento(valor, tipo) === null).toBe(
        documentoValidoParaTipo(valor, tipo),
      );
    }
  });
});

describe("CPF", () => {
  it("aceita CPF valido com e sem mascara", () => {
    expect(cpfValido("529.982.247-25")).toBe(true);
    expect(cpfValido("52998224725")).toBe(true);
  });

  it("rejeita digito verificador errado", () => {
    expect(cpfValido("529.982.247-26")).toBe(false);
  });

  it("rejeita sequencias repetidas", () => {
    expect(cpfValido("111.111.111-11")).toBe(false);
    expect(cpfValido("000.000.000-00")).toBe(false);
  });

  it("rejeita tamanho incorreto", () => {
    expect(cpfValido("5299822472")).toBe(false);
    expect(cpfValido("")).toBe(false);
  });

  it("limpa e trunca em 11 digitos", () => {
    expect(limparCpf("529.982.247-25")).toBe("52998224725");
    expect(limparCpf("52998224725999")).toBe("52998224725");
  });

  it("mascara progressivamente enquanto digita", () => {
    expect(mascararCpf("529")).toBe("529");
    expect(mascararCpf("5299")).toBe("529.9");
    expect(mascararCpf("529982")).toBe("529.982");
    expect(mascararCpf("52998224725")).toBe("529.982.247-25");
  });
});

describe("coerencia entre tipo e documento", () => {
  it("PF exige CPF", () => {
    expect(documentoValidoParaTipo("529.982.247-25", "FISICA")).toBe(true);
    expect(documentoValidoParaTipo("11.222.333/0001-81", "FISICA")).toBe(false);
  });

  it("PJ exige CNPJ", () => {
    expect(documentoValidoParaTipo("11.222.333/0001-81", "JURIDICA")).toBe(true);
    expect(documentoValidoParaTipo("529.982.247-25", "JURIDICA")).toBe(false);
  });

  it("mascara conforme o tipo escolhido", () => {
    expect(mascararPorTipo("52998224725", "FISICA")).toBe("529.982.247-25");
    expect(mascararPorTipo("11222333000181", "JURIDICA")).toBe(
      "11.222.333/0001-81",
    );
  });
});

describe("mascararDocumento (deducao pelo tamanho)", () => {
  it("deduz CPF em 11 digitos e CNPJ em 14", () => {
    expect(mascararDocumento("52998224725")).toBe("529.982.247-25");
    expect(mascararDocumento("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("documento incompleto sai sem mascara, nao errado", () => {
    expect(mascararDocumento("123")).toBe("123");
    expect(mascararDocumento("529982247")).toBe("529982247");
  });
});

describe("rotulos", () => {
  it("sigla e rotulo por tipo", () => {
    expect(siglaTipoPessoa("FISICA")).toBe("PF");
    expect(siglaTipoPessoa("JURIDICA")).toBe("PJ");
    expect(rotuloDocumento("FISICA")).toBe("CPF");
    expect(rotuloDocumento("JURIDICA")).toBe("CNPJ");
  });

  it("iniciais usam as duas primeiras palavras", () => {
    expect(iniciaisNome("Marcos Andrade Silva")).toBe("MA");
    expect(iniciaisNome("Construtora Horizonte Ltda")).toBe("CH");
    expect(iniciaisNome("Ana")).toBe("A");
  });
});
