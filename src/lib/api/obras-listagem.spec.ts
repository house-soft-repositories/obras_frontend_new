import { describe, expect, it } from "vitest";
import { ErroApi } from "./obras";
import {
  acaoConveniadaLabel,
  apenasUuids,
  aplicarFiltroListagem,
  buscarPaginaObras,
  construirPayloadDuplicacao,
  corBarra,
  estadoParaQueryString,
  irParaPagina,
  larguraBarra,
  lerEstadoListagem,
  montarConsultaObras,
  paginasVisiveis,
  percentualLabel,
  resumoPaginacao,
  resumoTotalObras,
  TAMANHO_PAGINA,
  temFiltroAvancado,
  tipoObraLabel,
  totalPaginas,
  type EstadoListagemObras,
} from "./obras-listagem";

const UUID_A = "11111111-2222-3333-4444-555555555555";
const UUID_B = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("E2-08: estado da listagem <-> query string da URL", () => {
  it("le escalares, arrays e pagina da query string", () => {
    const estado = lerEstadoListagem(
      new URLSearchParams(
        "buscaTextual=escola&tipo=OBRA&orgaoId=o1&statusObra=EM_ABERTO" +
          `&statusObra=CONCLUIDO&tagIds=${UUID_A}&prioritaria=true&pagina=3`,
      ),
    );
    expect(estado.filtro).toEqual({
      buscaTextual: "escola",
      tipo: "OBRA",
      orgaoId: "o1",
      statusObra: ["EM_ABERTO", "CONCLUIDO"],
      tagIds: [UUID_A],
      prioritaria: "true",
    });
    expect(estado.pagina).toBe(3);
  });

  it("ignora chaves desconhecidas e vazios; pagina invalida vira 1", () => {
    for (const pagina of ["0", "-2", "1.5", "abc", ""]) {
      const estado = lerEstadoListagem(
        new URLSearchParams(`busca=antiga&tipo=&pagina=${pagina}`),
      );
      expect(estado.filtro).toEqual({});
      expect(estado.pagina).toBe(1);
    }
  });

  it("estadoParaQueryString omite pagina 1 e nao envia tamanho", () => {
    const qs = estadoParaQueryString({
      filtro: { tipo: "OBRA", statusObra: ["EM_ABERTO"] },
      pagina: 1,
    });
    const params = new URLSearchParams(qs);
    expect(params.get("tipo")).toBe("OBRA");
    expect(params.get("statusObra")).toBe("EM_ABERTO");
    expect(params.has("pagina")).toBe(false);
    expect(params.has("tamanho")).toBe(false);
  });

  it("estadoParaQueryString inclui pagina > 1", () => {
    const params = new URLSearchParams(
      estadoParaQueryString({ filtro: {}, pagina: 4 }),
    );
    expect(params.get("pagina")).toBe("4");
  });

  it("faz ida e volta (URL -> estado -> URL) sem perder filtros", () => {
    const original = new URLSearchParams(
      `buscaTextual=ponte&statusObra=PARALISADO&tagIds=${UUID_A}&tagIds=${UUID_B}&pagina=2`,
    );
    const estado = lerEstadoListagem(original);
    const volta = new URLSearchParams(estadoParaQueryString(estado));
    expect(volta.get("buscaTextual")).toBe("ponte");
    expect(volta.getAll("statusObra")).toEqual(["PARALISADO"]);
    expect(volta.getAll("tagIds")).toEqual([UUID_A, UUID_B]);
    expect(volta.get("pagina")).toBe("2");
  });
});

describe("E2-08: aplicar filtros e paginar", () => {
  const estado: EstadoListagemObras = {
    filtro: { buscaTextual: "x", statusObra: ["EM_ABERTO"] },
    pagina: 4,
  };

  it("alterar um filtro mantem os demais e volta para a pagina 1", () => {
    const params = new URLSearchParams(
      aplicarFiltroListagem(estado, "orgaoId", "o9"),
    );
    expect(params.get("orgaoId")).toBe("o9");
    expect(params.get("buscaTextual")).toBe("x");
    expect(params.get("statusObra")).toBe("EM_ABERTO");
    expect(params.has("pagina")).toBe(false); // reset para 1
  });

  it("valor vazio ('' ou []) remove o filtro", () => {
    const semBusca = new URLSearchParams(
      aplicarFiltroListagem(estado, "buscaTextual", ""),
    );
    expect(semBusca.has("buscaTextual")).toBe(false);

    const semStatus = new URLSearchParams(
      aplicarFiltroListagem(estado, "statusObra", []),
    );
    expect(semStatus.has("statusObra")).toBe(false);
    expect(semStatus.get("buscaTextual")).toBe("x");
  });

  it("filtro de array substitui os valores anteriores", () => {
    const params = new URLSearchParams(
      aplicarFiltroListagem(estado, "statusObra", ["CONCLUIDO"]),
    );
    expect(params.getAll("statusObra")).toEqual(["CONCLUIDO"]);
  });

  it("irParaPagina troca so a pagina, mantendo os filtros", () => {
    const params = new URLSearchParams(irParaPagina(estado, 2));
    expect(params.get("pagina")).toBe("2");
    expect(params.get("buscaTextual")).toBe("x");
  });
});

describe("E2-08: consulta ao GET /relatorios/obras (FiltroObrasDto)", () => {
  it("envia pagina e tamanho explicitos com os nomes do backend", () => {
    const params = new URLSearchParams(
      montarConsultaObras({ filtro: { tipo: "OBRA" }, pagina: 2 }),
    );
    expect(params.get("tipo")).toBe("OBRA");
    expect(params.get("pagina")).toBe("2");
    expect(params.get("tamanho")).toBe(String(TAMANHO_PAGINA));
  });

  it("saneia tagIds para apenas UUIDs (IsUUID no backend)", () => {
    const params = new URLSearchParams(
      montarConsultaObras({
        filtro: { tagIds: ["urgente", UUID_A] },
        pagina: 1,
      }),
    );
    expect(params.getAll("tagIds")).toEqual([UUID_A]);
  });

  it("apenasUuids devolve undefined quando nada resta", () => {
    expect(apenasUuids(["nao-e-uuid"])).toBeUndefined();
    expect(apenasUuids(undefined)).toBeUndefined();
    expect(apenasUuids([` ${UUID_B} `])).toEqual([` ${UUID_B} `]);
  });
});

describe("E2-08: paginacao visivel (janela de ate 5)", () => {
  it("mostra todas quando ha 5 paginas ou menos", () => {
    expect(paginasVisiveis(1, 1)).toEqual([1]);
    expect(paginasVisiveis(2, 3)).toEqual([1, 2, 3]);
    expect(paginasVisiveis(5, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("centraliza a pagina atual e gruda nas bordas", () => {
    expect(paginasVisiveis(1, 10)).toEqual([1, 2, 3, 4, 5]);
    expect(paginasVisiveis(2, 10)).toEqual([1, 2, 3, 4, 5]);
    expect(paginasVisiveis(5, 10)).toEqual([3, 4, 5, 6, 7]);
    expect(paginasVisiveis(9, 10)).toEqual([6, 7, 8, 9, 10]);
    expect(paginasVisiveis(10, 10)).toEqual([6, 7, 8, 9, 10]);
  });

  it("sem resultados ainda devolve a pagina 1", () => {
    expect(paginasVisiveis(1, 0)).toEqual([1]);
  });

  it("totalPaginas arredonda para cima e nunca fica abaixo de 1", () => {
    expect(totalPaginas(0)).toBe(1);
    expect(totalPaginas(TAMANHO_PAGINA)).toBe(1);
    expect(totalPaginas(TAMANHO_PAGINA + 1)).toBe(2);
    expect(totalPaginas(7, 3)).toBe(3);
  });

  it("resumoPaginacao monta 'Mostrando X–Y de Z'", () => {
    expect(resumoPaginacao(1, 120)).toBe("Mostrando 1–50 de 120");
    expect(resumoPaginacao(3, 120)).toBe("Mostrando 101–120 de 120");
    expect(resumoPaginacao(2, 7, 3)).toBe("Mostrando 4–6 de 7");
    expect(resumoPaginacao(1, 0)).toBe("Mostrando 0 de 0");
  });
});

describe("E2-08: rotulos e barras", () => {
  it("tipoObraLabel cobre os 5 valores do enum TipoObra", () => {
    expect(tipoObraLabel("OBRA")).toBe("Obra");
    expect(tipoObraLabel("AQUISICAO")).toBe("Aquisição");
    expect(tipoObraLabel("SERVICOS")).toBe("Serviços");
    expect(tipoObraLabel("INVESTIMENTO_PRIVADO")).toBe("Investimento privado");
    expect(tipoObraLabel("PROGRAMA_PROJETO")).toBe("Programa/Projeto");
    expect(tipoObraLabel("OUTRO")).toBe("OUTRO"); // fallback
  });

  it("acaoConveniadaLabel traduz o enum AcaoConveniada", () => {
    expect(acaoConveniadaLabel("NAO")).toBe("Não conveniada");
    expect(acaoConveniadaLabel("FEDERAL")).toBe("Federal");
    expect(acaoConveniadaLabel("ESTADUAL")).toBe("Estadual");
  });

  it("resumoTotalObras pluraliza corretamente", () => {
    expect(resumoTotalObras(0)).toBe("0 obras cadastradas");
    expect(resumoTotalObras(1)).toBe("1 obra cadastrada");
    expect(resumoTotalObras(24)).toBe("24 obras cadastradas");
  });

  it("larguraBarra limita o preenchimento a 0–100", () => {
    expect(larguraBarra(-5)).toBe(0);
    expect(larguraBarra(33.4)).toBe(33.4);
    expect(larguraBarra(140)).toBe(100);
    expect(larguraBarra(Number.NaN)).toBe(0);
  });

  it("percentualLabel arredonda para inteiro e nunca fica negativo", () => {
    expect(percentualLabel(0)).toBe("0%");
    expect(percentualLabel(33.4)).toBe("33%");
    expect(percentualLabel(99.6)).toBe("100%");
    expect(percentualLabel(-3)).toBe("0%");
    expect(percentualLabel(Number.NaN)).toBe("0%");
  });

  it("corBarra fica verde a partir de 100%", () => {
    expect(corBarra(99.9, "var(--cor-acento)")).toBe("var(--cor-acento)");
    expect(corBarra(100, "var(--cor-acento)")).toBe("var(--sem-verde)");
    expect(corBarra(120, "#0891b2")).toBe("var(--sem-verde)");
  });

  it("temFiltroAvancado detecta filtros do painel 'Mais filtros'", () => {
    expect(temFiltroAvancado({})).toBe(false);
    expect(temFiltroAvancado({ buscaTextual: "x", tipo: "OBRA" })).toBe(false);
    expect(temFiltroAvancado({ eixoId: "e1" })).toBe(true);
    expect(temFiltroAvancado({ tagIds: [] })).toBe(false);
    expect(temFiltroAvancado({ tagIds: [UUID_A] })).toBe(true);
    expect(temFiltroAvancado({ prioritaria: "true" })).toBe(true);
  });
});

describe("E2-08: buscarPaginaObras (proxy autenticado)", () => {
  it("consulta GET /api/proxy/relatorios/obras com filtros e paginacao", async () => {
    let urlChamada = "";
    const fakeFetch = (async (url: RequestInfo | URL) => {
      urlChamada = String(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({ itens: [], total: 42 }),
      };
    }) as unknown as typeof fetch;

    const pagina = await buscarPaginaObras(
      { filtro: { tipo: "OBRA", statusObra: ["EM_ABERTO"] }, pagina: 2 },
      fakeFetch,
    );
    expect(pagina.total).toBe(42);
    expect(urlChamada.startsWith("/api/proxy/relatorios/obras?")).toBe(true);
    const params = new URLSearchParams(urlChamada.split("?")[1]);
    expect(params.get("tipo")).toBe("OBRA");
    expect(params.get("statusObra")).toBe("EM_ABERTO");
    expect(params.get("pagina")).toBe("2");
    expect(params.get("tamanho")).toBe(String(TAMANHO_PAGINA));
  });

  it("resposta nao-ok vira ErroApi com o status", async () => {
    const fakeFetch = (async () => ({
      ok: false,
      status: 403,
      json: async () => ({ message: "sem acesso" }),
    })) as unknown as typeof fetch;

    const promessa = buscarPaginaObras({ filtro: {}, pagina: 1 }, fakeFetch);
    await expect(promessa).rejects.toBeInstanceOf(ErroApi);
    await expect(promessa).rejects.toMatchObject({ status: 403 });
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
