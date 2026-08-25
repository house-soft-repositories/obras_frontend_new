import { describe, expect, it } from "vitest";
import {
  ehAtivo,
  ehRotaPrivada,
  marcaDaRota,
  MENU,
  MENU_PRIVADAS,
  menuDaRota,
} from "./navegacao";

describe("ehRotaPrivada", () => {
  it("reconhece a listagem e as subrotas do modulo privado", () => {
    expect(ehRotaPrivada("/obras-privadas")).toBe(true);
    expect(ehRotaPrivada("/obras-privadas/nova")).toBe(true);
    expect(ehRotaPrivada("/obras-privadas/abc-123/fiscalizacoes")).toBe(true);
  });

  it("inclui o cadastro de pessoas, que so serve ao modulo privado", () => {
    expect(ehRotaPrivada("/cadastros/pessoas")).toBe(true);
  });

  it("nao confunde com rotas publicas de prefixo parecido", () => {
    expect(ehRotaPrivada("/obras")).toBe(false);
    expect(ehRotaPrivada("/obras/abc-123")).toBe(false);
    expect(ehRotaPrivada("/cadastros/orgaos")).toBe(false);
    expect(ehRotaPrivada("/dashboard")).toBe(false);
  });
});

describe("menuDaRota e marcaDaRota", () => {
  it("troca o menu inteiro dentro do modulo privado", () => {
    expect(menuDaRota("/obras")).toBe(MENU);
    expect(menuDaRota("/obras-privadas")).toBe(MENU_PRIVADAS);
  });

  it("o menu privado oferece saida para o lado publico", () => {
    expect(MENU_PRIVADAS.some((i) => i.href === "/obras")).toBe(true);
  });

  it("o menu publico oferece entrada para o lado privado", () => {
    expect(MENU.some((i) => i.href === "/obras-privadas")).toBe(true);
  });

  it("troca a marca da sidebar", () => {
    expect(marcaDaRota("/obras").titulo).toBe("Obras Públicas");
    expect(marcaDaRota("/obras").subtitulo).toBeNull();
    expect(marcaDaRota("/obras-privadas").titulo).toBe("Obras Privadas");
    expect(marcaDaRota("/obras-privadas").subtitulo).toBe(
      "Fiscalização de terceiros",
    );
  });
});

describe("ehAtivo", () => {
  it("mantem o comportamento existente do lado publico", () => {
    expect(ehAtivo("/obras", "/obras")).toBe(true);
    expect(ehAtivo("/obras/abc-123/contrato", "/obras")).toBe(true);
    expect(ehAtivo("/obras/nova", "/obras")).toBe(false);
    expect(ehAtivo("/obras/nova", "/obras/nova")).toBe(true);
    expect(ehAtivo("/cadastros/orgaos", "/cadastros/orgaos")).toBe(true);
  });

  it("a listagem privada cobre o detalhe da obra", () => {
    expect(ehAtivo("/obras-privadas", "/obras-privadas")).toBe(true);
    expect(ehAtivo("/obras-privadas/abc-123", "/obras-privadas")).toBe(true);
    expect(
      ehAtivo("/obras-privadas/abc-123/fiscalizacoes", "/obras-privadas"),
    ).toBe(true);
  });

  it("a listagem privada NAO cobre subrotas que tem item proprio", () => {
    for (const rota of [
      "/obras-privadas/nova",
      "/obras-privadas/mapa",
      "/obras-privadas/fiscalizacoes",
      "/obras-privadas/licenciamento",
      "/obras-privadas/autos",
    ]) {
      expect(ehAtivo(rota, "/obras-privadas")).toBe(false);
    }
  });

  it("cada subrota fixa acende o proprio item", () => {
    expect(ehAtivo("/obras-privadas/autos", "/obras-privadas/autos")).toBe(true);
    expect(
      ehAtivo("/obras-privadas/fiscalizacoes", "/obras-privadas/fiscalizacoes"),
    ).toBe(true);
  });

  it("'nova obra privada' vale so na rota exata", () => {
    expect(ehAtivo("/obras-privadas/nova", "/obras-privadas/nova")).toBe(true);
    expect(ehAtivo("/obras-privadas", "/obras-privadas/nova")).toBe(false);
  });

  it("o link de volta '/obras' nunca acende dentro do modulo privado", () => {
    expect(ehAtivo("/obras-privadas", "/obras")).toBe(false);
    expect(ehAtivo("/obras-privadas/abc-123", "/obras")).toBe(false);
    expect(ehAtivo("/cadastros/pessoas", "/obras")).toBe(false);
  });

  it("nunca acende dois itens do menu privado ao mesmo tempo", () => {
    const rotas = [
      "/obras-privadas",
      "/obras-privadas/nova",
      "/obras-privadas/mapa",
      "/obras-privadas/fiscalizacoes",
      "/obras-privadas/licenciamento",
      "/obras-privadas/autos",
      "/obras-privadas/abc-123/fotos",
      "/cadastros/pessoas",
    ];
    for (const rota of rotas) {
      const ativos = MENU_PRIVADAS.filter((i) => ehAtivo(rota, i.href));
      expect(ativos.length, `${rota} -> ${ativos.map((a) => a.href)}`).toBe(1);
    }
  });
});
