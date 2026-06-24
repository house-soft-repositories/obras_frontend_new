import { describe, expect, it } from "vitest";
import {
  aplicarFiltro,
  construirPayloadDuplicacao,
  filtrosParaQueryString,
  queryStringParaFiltros,
  type FiltrosObras,
} from "./obras-listagem";

describe("E2-08: sincronia de filtros com a query string", () => {
  it("filtros -> query string ignora vazios", () => {
    const qs = filtrosParaQueryString({
      busca: "escola",
      status: "EM_ABERTO",
      tipo: "",
      page: 2,
    });
    const params = new URLSearchParams(qs);
    expect(params.get("busca")).toBe("escola");
    expect(params.get("status")).toBe("EM_ABERTO");
    expect(params.has("tipo")).toBe(false);
    expect(params.get("page")).toBe("2");
  });

  it("query string -> filtros converte page para numero", () => {
    const filtros = queryStringParaFiltros("busca=ponte&page=3&tag=urgente");
    expect(filtros).toEqual<FiltrosObras>({
      busca: "ponte",
      page: 3,
      tag: "urgente",
    });
  });

  it("alterar um filtro atualiza a query string e reseta a pagina", () => {
    const atuais: FiltrosObras = { busca: "x", page: 4 };
    const qs = aplicarFiltro(atuais, "status", "CONCLUIDO");
    const params = new URLSearchParams(qs);
    expect(params.get("status")).toBe("CONCLUIDO");
    expect(params.get("busca")).toBe("x");
    expect(params.has("page")).toBe(false); // reset
  });

  it("limpar um filtro o remove da query string", () => {
    const qs = aplicarFiltro({ status: "CONCLUIDO", busca: "x" }, "status", "");
    const params = new URLSearchParams(qs);
    expect(params.has("status")).toBe(false);
    expect(params.get("busca")).toBe("x");
  });
});

describe("E2-08: payload de duplicacao (RN-OBR-19)", () => {
  it("envia as 3 opcoes (copiarArquivos, manterEquipe, copiarEstagios)", () => {
    const payload = construirPayloadDuplicacao({
      nome: "Obra copia",
      responsavelUsuarioId: "u2",
      dataInicio: "2026-02-01",
      dataPrazo: "2026-12-01",
      copiarArquivos: true,
      manterEquipe: true,
      copiarEstagios: false,
    });
    expect(payload).toMatchObject({
      nome: "Obra copia",
      copiarArquivos: true,
      manterEquipe: true,
      copiarEstagios: false,
    });
  });
});
