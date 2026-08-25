import { describe, expect, it } from "vitest";
import { coordenadas, gruposDadosObra } from "./dados-obra";

const completa = {
  nome: "Reforma da Escola Municipal João Ribeiro",
  codigo: "OBR-2024-0142",
  orgaoNome: "Sec. de Educação",
  tipo: "REFORMA",
  localidadeNome: "Centro",
  status: "EM_DESENVOLVIMENTO",
  empresaContratadaNome: "Construtora Alfa Ltda",
  responsavelNome: "Paulo Santos",
  dataInicio: "2024-02-12",
  prazoFinal: "2025-12-18",
  latitude: "-23.55052",
  longitude: "-46.63331",
  vincularPagamentoPercentual: true,
};

describe("gruposDadosObra — aba Dados", () => {
  it("monta os dois grupos do design, na ordem", () => {
    const grupos = gruposDadosObra(completa);
    expect(grupos.map((g) => g.titulo)).toEqual(["Identificação", "Execução"]);
    expect(grupos[0].itens).toHaveLength(6);
    expect(grupos[1].itens).toHaveLength(6);
  });

  it("formata datas em pt-BR e traduz os enums", () => {
    const [identificacao, execucao] = gruposDadosObra(completa);
    // `rotuloEnum` preserva a caixa alta de proposito (nao quebrar siglas
    // como "SEM OGU"); so troca "_" por espaco.
    expect(
      gruposDadosObra({
        ...completa,
        tipo: "INVESTIMENTO_PRIVADO",
      })[0].itens.find((i) => i.rotulo === "Tipo")?.valor,
    ).toBe("INVESTIMENTO PRIVADO");
    expect(identificacao.itens.find((i) => i.rotulo === "Tipo")?.valor).toBe(
      "REFORMA",
    );
    // Rotulos de status seguem a decisao do design-v2 (EM_DESENVOLVIMENTO
    // aparece como "Em execução").
    expect(identificacao.itens.find((i) => i.rotulo === "Status")?.valor).toBe(
      "Em execução",
    );
    expect(
      execucao.itens.find((i) => i.rotulo === "Data de início")?.valor,
    ).toBe("12/02/2024");
    expect(
      execucao.itens.find((i) => i.rotulo === "Prazo final de execução")?.valor,
    ).toBe("18/12/2025");
  });

  it("a vinculação de pagamento aparece como Ativo/Inativo", () => {
    const ativo = gruposDadosObra(completa)[1].itens.at(-1);
    expect(ativo?.valor).toBe("Ativo");
    const inativo = gruposDadosObra({
      ...completa,
      vincularPagamentoPercentual: false,
    })[1].itens.at(-1);
    expect(inativo?.valor).toBe("Inativo");
  });

  it("campos ausentes viram travessao, sem quebrar a grade", () => {
    const vazia = gruposDadosObra({
      nome: null,
      codigo: null,
      orgaoNome: null,
      tipo: null,
      localidadeNome: null,
      status: null,
      empresaContratadaNome: null,
      responsavelNome: null,
      dataInicio: null,
      prazoFinal: null,
      latitude: null,
      longitude: null,
      vincularPagamentoPercentual: false,
    });
    const valores = vazia.flatMap((g) => g.itens.map((i) => i.valor));
    expect(valores.filter((v) => v === "—")).toHaveLength(11);
  });
});

describe("coordenadas", () => {
  it("exige o par completo", () => {
    expect(coordenadas("-23.55052", "-46.63331")).toBe("-23.55052 / -46.63331");
    expect(coordenadas("-23.55052", null)).toBe("—");
    expect(coordenadas(null, null)).toBe("—");
  });
});
