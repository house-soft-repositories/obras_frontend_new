import { describe, expect, it } from "vitest";
import {
  construirPayloadObra,
  datasSomenteLeitura,
  GUIAS_OBRA,
  parseTagsEntrada,
  subclassificacaoHabilitada,
  type FormularioObra,
} from "./obras";

function form(parcial: Partial<FormularioObra>): FormularioObra {
  return {
    nome: "Escola",
    tipo: "OBRA",
    responsavelUsuarioId: "u1",
    orgaoId: "o1",
    orcamentos: [{ fonteId: "f1", valor: "1000.00" }],
    ...parcial,
  };
}

describe("E2-07: regras de UI do cadastro de Obra", () => {
  it("expoe as 6 guias do cadastro", () => {
    expect(GUIAS_OBRA).toHaveLength(6);
    expect(GUIAS_OBRA.map((g) => g.titulo)).toEqual([
      "Projeto",
      "Geral",
      "Localizacao",
      "Titularidade",
      "Licenciamento",
      "Recebimento",
    ]);
  });

  it("RN-OBR-13: subclassificacao habilitada apenas quando tipo = OBRA", () => {
    expect(subclassificacaoHabilitada("OBRA")).toBe(true);
    expect(subclassificacaoHabilitada("SERVICOS")).toBe(false);
    expect(subclassificacaoHabilitada("AQUISICAO")).toBe(false);
  });

  it("RN-OBR-04: datas ficam somente leitura nos modos automaticos", () => {
    expect(datasSomenteLeitura("DEFINIDO_PELO_USUARIO")).toBe(false);
    expect(datasSomenteLeitura("ESTAGIO_ATUAL")).toBe(true);
    expect(datasSomenteLeitura("EXECUCAO_CONTRATO")).toBe(true);
  });

  it("payload valido inclui orcamentos e descarta campos vazios", () => {
    const payload = construirPayloadObra(
      form({ descricao: "", dataInicio: "2026-01-01" }),
    );
    expect(payload.nome).toBe("Escola");
    expect(payload.orcamentos).toHaveLength(1);
    expect("descricao" in payload).toBe(false);
    expect(payload.dataInicio).toBe("2026-01-01");
  });

  it("RN-OBR-13: payload descarta subclassificacao quando tipo != OBRA", () => {
    const payload = construirPayloadObra(
      form({ tipo: "SERVICOS", subclassificacaoId: "sub1" }),
    );
    expect("subclassificacaoId" in payload).toBe(false);
  });

  it("parseTagsEntrada deduplica por nome", () => {
    expect(parseTagsEntrada("pavimentacao, drenagem; drenagem")).toEqual([
      "pavimentacao",
      "drenagem",
    ]);
  });
});
