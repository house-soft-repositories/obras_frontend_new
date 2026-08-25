import { describe, expect, it } from "vitest";
import {
  alternarChip,
  aplicarFiltro,
  contarFiltrosAtivos,
  lerEstadoListagem,
  montarFiltroApi,
  montarQueryUrl,
  paginasVisiveis,
  resumoPaginacao,
  totalPaginas,
} from "./obras-privadas-listagem";

const VAZIO = lerEstadoListagem(new URLSearchParams());

describe("lerEstadoListagem", () => {
  it("sem parametros retorna estado limpo na pagina 1 e visao lista", () => {
    expect(VAZIO.pagina).toBe(1);
    expect(VAZIO.visao).toBe("lista");
    expect(contarFiltrosAtivos(VAZIO.filtro)).toBe(0);
  });

  it("le filtros, chips, visao e pagina", () => {
    const e = lerEstadoListagem(
      new URLSearchParams(
        "busca=acacias&situacaoAlvara=SEM_ALVARA&autuada=1&semVisita90=1&visao=mapa&pagina=3",
      ),
    );
    expect(e.filtro.buscaTextual).toBe("acacias");
    expect(e.filtro.situacaoAlvara).toBe("SEM_ALVARA");
    expect(e.filtro.autuada).toBe(true);
    expect(e.filtro.semVisita90).toBe(true);
    expect(e.visao).toBe("mapa");
    expect(e.pagina).toBe(3);
  });

  it("pagina invalida cai para 1", () => {
    expect(lerEstadoListagem(new URLSearchParams("pagina=0")).pagina).toBe(1);
    expect(lerEstadoListagem(new URLSearchParams("pagina=abc")).pagina).toBe(1);
  });

  it("aceita objeto simples alem de URLSearchParams", () => {
    expect(lerEstadoListagem({ busca: "acacias" }).filtro.buscaTextual).toBe(
      "acacias",
    );
  });
});

describe("montarQueryUrl", () => {
  it("estado limpo nao polui a URL", () => {
    expect(montarQueryUrl(VAZIO)).toBe("");
  });

  it("faz ida e volta com lerEstadoListagem", () => {
    const original = lerEstadoListagem(
      new URLSearchParams("busca=acacias&andamento=PARALISADA&embargada=1&pagina=2"),
    );
    const ida = montarQueryUrl(original);
    expect(lerEstadoListagem(new URLSearchParams(ida))).toEqual(original);
  });

  it("omite pagina 1 e visao lista", () => {
    expect(montarQueryUrl({ ...VAZIO, pagina: 1, visao: "lista" })).toBe("");
    expect(montarQueryUrl({ ...VAZIO, visao: "mapa" })).toBe("?visao=mapa");
  });
});

describe("montarFiltroApi", () => {
  it("traduz o chip 'sem visita' para semVisitaHaDias=90", () => {
    const api = montarFiltroApi({
      ...VAZIO,
      filtro: { semVisita90: true },
    });
    expect(api.semVisitaHaDias).toBe(90);
  });

  it("chip 'sem alvara' vira o valor do enum, nao um booleano", () => {
    const api = montarFiltroApi({ ...VAZIO, filtro: { semAlvara: true } });
    expect(api.situacaoAlvara).toBe("SEM_ALVARA");
  });

  it("o chip vence o select quando os dois falam de alvara", () => {
    const api = montarFiltroApi({
      ...VAZIO,
      filtro: { semAlvara: true, situacaoAlvara: "COM_ALVARA_VIGENTE" },
    });
    expect(api.situacaoAlvara).toBe("SEM_ALVARA");
  });

  it("envia paginacao sempre", () => {
    const api = montarFiltroApi({ ...VAZIO, pagina: 2 });
    expect(api.page).toBe(2);
    expect(api.limit).toBe(50);
  });

  it("chips desligados nao viram parametro", () => {
    const api = montarFiltroApi(VAZIO);
    expect(api.autuada).toBeUndefined();
    expect(api.semVisitaHaDias).toBeUndefined();
  });
});

describe("alternarChip e aplicarFiltro", () => {
  it("liga e desliga o chip", () => {
    const ligado = alternarChip(VAZIO, "autuada");
    expect(ligado.filtro.autuada).toBe(true);
    expect(alternarChip(ligado, "autuada").filtro.autuada).toBeUndefined();
  });

  it("alterar filtro volta para a primeira pagina", () => {
    const e = { ...VAZIO, pagina: 5 };
    expect(alternarChip(e, "embargada").pagina).toBe(1);
    expect(aplicarFiltro(e, "bairro", "Centro").pagina).toBe(1);
  });

  it("select vazio limpa o filtro", () => {
    const com = aplicarFiltro(VAZIO, "bairro", "Centro");
    expect(aplicarFiltro(com, "bairro", "").filtro.bairro).toBeUndefined();
  });
});

describe("paginacao", () => {
  it("calcula o total de paginas", () => {
    expect(totalPaginas(318)).toBe(7);
    expect(totalPaginas(50)).toBe(1);
    expect(totalPaginas(0)).toBe(1);
  });

  it("mostra primeira, ultima e a janela ao redor da atual", () => {
    expect(paginasVisiveis(1, 7)).toEqual([1, 2, 7]);
    expect(paginasVisiveis(4, 7)).toEqual([1, 3, 4, 5, 7]);
    expect(paginasVisiveis(7, 7)).toEqual([1, 6, 7]);
  });

  it("nao repete pagina quando o total e pequeno", () => {
    expect(paginasVisiveis(1, 1)).toEqual([1]);
  });

  it("resume o intervalo exibido", () => {
    expect(resumoPaginacao(1, 318)).toBe("Exibindo 1–50 de 318");
    expect(resumoPaginacao(7, 318)).toBe("Exibindo 301–318 de 318");
    expect(resumoPaginacao(1, 0)).toBe("Nenhum registro");
  });
});
