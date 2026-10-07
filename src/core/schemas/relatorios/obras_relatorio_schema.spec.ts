import { describe, expect, it } from "vitest";
import {
  apenasUuids,
  corSemaforo,
  dashboardSchema,
  itemListaObrasSchema,
  lerFiltro,
  montarConsultaObras,
  normalizarPaginacao,
  paginaObrasSchema,
  serializarFiltro,
  totalPaginas,
  type FiltroObras,
} from "@/core/schemas/relatorios/obras_relatorio_schema";

describe("serializarFiltro — 6 grupos (RN-REL-06..12)", () => {
  it("serializa os 6 grupos em query params", () => {
    const f: FiltroObras = {
      acaoConveniada: "FEDERAL", // 8.4.1
      tagIds: ["t1", "t2"], // 8.4.2 (OU -> repete)
      orgaoId: "org1", // 8.4.3
      statusObra: ["EM_DESENVOLVIMENTO"], // 8.4.4
      percentualMin: "60",
      percentualMax: "80",
      dataCriacaoDe: "2026-01-01", // 8.4.5
      buscaTextual: "escola", // 8.4.6
    };
    const p = serializarFiltro(f);
    expect(p.get("acaoConveniada")).toBe("FEDERAL");
    expect(p.getAll("tagIds")).toEqual(["t1", "t2"]);
    expect(p.get("orgaoId")).toBe("org1");
    expect(p.getAll("statusObra")).toEqual(["EM_DESENVOLVIMENTO"]);
    expect(p.get("percentualMin")).toBe("60");
    expect(p.get("percentualMax")).toBe("80");
    expect(p.get("dataCriacaoDe")).toBe("2026-01-01");
    expect(p.get("buscaTextual")).toBe("escola");
  });

  it("omite campos vazios e adiciona extras", () => {
    const p = serializarFiltro(
      { orgaoId: "", buscaTextual: undefined },
      { formato: "CSV" },
    );
    expect(p.has("orgaoId")).toBe(false);
    expect(p.has("buscaTextual")).toBe(false);
    expect(p.get("formato")).toBe("CSV");
  });

  it("roundtrip URL <-> filtro preserva arrays e escalares", () => {
    const f: FiltroObras = {
      tagIds: ["a", "b"],
      orgaoId: "o1",
      buscaTextual: "x",
    };
    const lido = lerFiltro(serializarFiltro(f));
    expect(lido.tagIds).toEqual(["a", "b"]);
    expect(lido.orgaoId).toBe("o1");
    expect(lido.buscaTextual).toBe("x");
  });

  it("ignora chaves fora do schema (pagina/tamanho nunca vazam p/ o filtro)", () => {
    const p = new URLSearchParams("orgaoId=o1&pagina=2&tamanho=50&modo=MAPA");
    expect(lerFiltro(p)).toEqual({ orgaoId: "o1" });
  });
});

describe("corSemaforo (SemaforoDesempenho)", () => {
  it("aplica cor por valor e cinza quando sem status", () => {
    expect(corSemaforo("VERDE")).toBe("#16a34a");
    expect(corSemaforo("LARANJA")).toBe("#f59e0b");
    expect(corSemaforo("VERMELHO")).toBe("#dc2626");
    expect(corSemaforo(null)).toBe("#9ca3af");
    expect(corSemaforo(undefined)).toBe("#9ca3af");
  });
});

describe("montarConsultaObras (FiltroObrasDto)", () => {
  it("envia filtros + pagina/tamanho explícitos", () => {
    const qs = new URLSearchParams(
      montarConsultaObras({ orgaoId: "o1", buscaTextual: "x" }, { pagina: 2 }),
    );
    expect(qs.get("orgaoId")).toBe("o1");
    expect(qs.get("buscaTextual")).toBe("x");
    expect(qs.get("pagina")).toBe("2");
    expect(qs.get("tamanho")).toBe("50");
  });

  it("saneia tagIds para só UUIDs (DTO valida com IsUUID)", () => {
    const uuid = "c7a2c55b-179f-47ad-afc1-7ef9ee8106c1";
    const qs = new URLSearchParams(
      montarConsultaObras({ tagIds: ["lixo", uuid] }, { pagina: 1 }),
    );
    expect(qs.getAll("tagIds")).toEqual([uuid]);
    expect(
      new URLSearchParams(
        montarConsultaObras({ tagIds: ["lixo"] }, { pagina: 1 }),
      ).has("tagIds"),
    ).toBe(false);
  });

  it("apenasUuids devolve undefined quando nada resta", () => {
    expect(apenasUuids(undefined)).toBeUndefined();
    expect(apenasUuids(["x"])).toBeUndefined();
  });
});

describe("paginacao", () => {
  it("normaliza pagina mínima 1 e tamanho default 50 teto 200", () => {
    expect(normalizarPaginacao(0, 500)).toEqual({ pagina: 1, tamanho: 200 });
    expect(normalizarPaginacao(undefined, undefined)).toEqual({
      pagina: 1,
      tamanho: 50,
    });
    expect(normalizarPaginacao(3, 20)).toEqual({ pagina: 3, tamanho: 20 });
  });

  it("totalPaginas tem mínimo 1", () => {
    expect(totalPaginas(0)).toBe(1);
    expect(totalPaginas(8, 50)).toBe(1);
    expect(totalPaginas(51, 50)).toBe(2);
  });
});

describe("regressão: payload real de GET /api/relatorios/dashboard", () => {
  const payload = {
    quantificadoresPorOrgao: [
      {
        acimaMeta: 0,
        prazoVencido: 0,
        abaixoMeta: 0,
        semStatus: 8,
        totalObras: 8,
        orgaoId: "c7a2c55b-179f-47ad-afc1-7ef9ee8106c1",
        dataReferencia: "2026-10-07T12:21:48.037Z",
      },
    ],
    fluxoAgregado: {
      obraId: null,
      orgaoId: null,
      contratadoInicial: "0.00",
      aditivadoTotal: "0.00",
      totalContratado: "0.00",
      medidoTotal: "4500.00",
      empenhadoTotal: "2500.00",
      liquidadoTotal: "2000.00",
      pagoTotal: "0.00",
      percentuaisPorIndicador: { medido: 0, empenhado: 0, liquidado: 0, pago: 0 },
      percentualFisico: 0,
      percentualFinanceiro: 0,
      dataReferencia: "2026-10-07T12:21:48.036Z",
    },
    contagemPorStatus: {
      total: 8,
      emAberto: 8,
      emDesenvolvimento: 0,
      concluidas: 0,
      paralisadas: 0,
      canceladas: 0,
    },
    obrasPorOrgao: [
      {
        orgaoId: "c7a2c55b-179f-47ad-afc1-7ef9ee8106c1",
        orgaoNome: "Setur",
        total: 8,
      },
    ],
  };

  it("parseia contagem, órgãos e quantificadores (dashboard não fica vazio)", () => {
    const dash = dashboardSchema.parse(payload);
    expect(dash.contagemPorStatus.total).toBe(8);
    expect(dash.contagemPorStatus.emAberto).toBe(8);
    expect(dash.obrasPorOrgao).toEqual([
      {
        orgaoId: "c7a2c55b-179f-47ad-afc1-7ef9ee8106c1",
        orgaoNome: "Setur",
        total: 8,
      },
    ]);
    expect(dash.quantificadoresPorOrgao[0]?.semStatus).toBe(8);
    expect(dash.quantificadoresPorOrgao[0]?.totalObras).toBe(8);
  });

  it("converte dinheiro (string) para número no fluxo agregado", () => {
    const dash = dashboardSchema.parse(payload);
    expect(dash.fluxoAgregado.totalContratado).toBe(0);
    expect(dash.fluxoAgregado.medidoTotal).toBe(4500);
    expect(dash.fluxoAgregado.empenhadoTotal).toBe(2500);
    expect(dash.fluxoAgregado.liquidadoTotal).toBe(2000);
    expect(dash.fluxoAgregado.pagoTotal).toBe(0);
  });

  it("seção fora do contrato zera só ela, sem derrubar o resto", () => {
    const dash = dashboardSchema.parse({
      ...payload,
      fluxoAgregado: "resposta-invalida",
    });
    expect(dash.contagemPorStatus.total).toBe(8);
    expect(dash.fluxoAgregado.medidoTotal).toBe(0);
  });
});

describe("item da lista (GET /api/relatorios/obras)", () => {
  const item = {
    obraId: "o1",
    codigo: "OB-001",
    nome: "Escola",
    tipo: "OBRA",
    statusObra: "EM_DESENVOLVIMENTO",
    estagioAtualNome: "Fundação",
    prazoConclusaoEstagio: "2026-12-01",
    percentualRealizado: 42,
    percentualFinanceiro: 30,
    semaforo: "VERDE",
    orgaoId: "org1",
    orgaoNome: "Setur",
    localidadeNome: "Centro",
    responsavelNome: "Ana",
    tags: ["t1"],
    acaoConveniada: "FEDERAL",
    prioritaria: true,
    empresaExecutora: "Construtora X",
    numeroContrato: "CT-1",
    localizacoes: [
      { localidade: "Centro", uf: "SP", latitude: -23.5, longitude: -46.6 },
    ],
    dataCriacao: "2026-01-01",
    ultimaAtualizacao: "2026-10-01",
  };

  it("parseia o item no contrato do backend", () => {
    const parsed = itemListaObrasSchema.parse(item);
    expect(parsed.obraId).toBe("o1");
    expect(parsed.semaforo).toBe("VERDE");
    expect(parsed.localizacoes).toHaveLength(1);
  });

  it("semaforo desconhecido vira null em vez de invalidar o item", () => {
    const parsed = itemListaObrasSchema.parse({ ...item, semaforo: "AZUL" });
    expect(parsed.semaforo).toBeNull();
    expect(parsed.obraId).toBe("o1");
  });

  it("pagina preserva total e itens", () => {
    const pagina = paginaObrasSchema.parse({ itens: [item], total: 42 });
    expect(pagina.total).toBe(42);
    expect(pagina.itens).toHaveLength(1);
  });
});
