import { describe, expect, it } from "vitest";
import {
  filtrarCadastro,
  mensagemErroApi,
  moedaBRL,
  montarAtribuicaoPerfil,
  ouTraco,
  resumoRegistros,
  tipoFonteLabel,
  tipoLocalidadeLabel,
  tipoOrgaoLabel,
} from "./cadastro-labels";

describe("tipoOrgaoLabel", () => {
  it("traduz os tipos conhecidos para PT-BR acentuado", () => {
    expect(tipoOrgaoLabel("SECRETARIA")).toBe("Secretaria");
    expect(tipoOrgaoLabel("AUTARQUIA")).toBe("Autarquia");
    expect(tipoOrgaoLabel("FUNDACAO")).toBe("Fundação");
    expect(tipoOrgaoLabel("EMPRESA_PUBLICA")).toBe("Empresa pública");
  });
  it("usa travessao para nulo/indefinido e o valor cru quando desconhecido", () => {
    expect(tipoOrgaoLabel(null)).toBe("—");
    expect(tipoOrgaoLabel(undefined)).toBe("—");
    expect(tipoOrgaoLabel("OUTRO")).toBe("OUTRO");
  });
});

describe("tipoLocalidadeLabel", () => {
  it("traduz os tipos conhecidos para PT-BR acentuado", () => {
    expect(tipoLocalidadeLabel("BAIRRO")).toBe("Bairro");
    expect(tipoLocalidadeLabel("DISTRITO")).toBe("Distrito");
    expect(tipoLocalidadeLabel("REGIAO")).toBe("Região");
    expect(tipoLocalidadeLabel("ZONA_RURAL")).toBe("Zona rural");
  });
  it("usa travessao para nulo e o valor cru quando desconhecido", () => {
    expect(tipoLocalidadeLabel(null)).toBe("—");
    expect(tipoLocalidadeLabel("OUTRO")).toBe("OUTRO");
  });
});

describe("tipoFonteLabel", () => {
  it("traduz os tipos conhecidos para PT-BR acentuado", () => {
    expect(tipoFonteLabel("FEDERAL")).toBe("Federal");
    expect(tipoFonteLabel("ESTADUAL")).toBe("Estadual");
    expect(tipoFonteLabel("MUNICIPAL")).toBe("Municipal");
    expect(tipoFonteLabel("CONVENIO")).toBe("Convênio");
  });
  it("usa travessao para nulo e o valor cru quando desconhecido", () => {
    expect(tipoFonteLabel(null)).toBe("—");
    expect(tipoFonteLabel("OUTRO")).toBe("OUTRO");
  });
});

describe("ouTraco", () => {
  it("devolve o valor aparado quando preenchido", () => {
    expect(ouTraco("  Secretaria de Obras ")).toBe("Secretaria de Obras");
  });
  it("devolve travessao para nulo, indefinido ou em branco", () => {
    expect(ouTraco(null)).toBe("—");
    expect(ouTraco(undefined)).toBe("—");
    expect(ouTraco("   ")).toBe("—");
  });
});

describe("moedaBRL", () => {
  it("formata strings numericas da API em reais pt-BR", () => {
    // Intl pt-BR separa "R$" do numero com espaco nao separavel (U+00A0).
    expect(moedaBRL("1000.00")).toBe("R$\u00a01.000,00");
    expect(moedaBRL("1234567.89")).toBe("R$\u00a01.234.567,89");
    expect(moedaBRL(0)).toBe("R$\u00a00,00");
  });
  it("devolve travessao para nulo, vazio ou nao numerico", () => {
    expect(moedaBRL(null)).toBe("—");
    expect(moedaBRL(undefined)).toBe("—");
    expect(moedaBRL("")).toBe("—");
    expect(moedaBRL("abc")).toBe("—");
  });
});

describe("resumoRegistros", () => {
  it("pluraliza a contagem de registros", () => {
    expect(resumoRegistros(0)).toBe("0 registros");
    expect(resumoRegistros(1)).toBe("1 registro");
    expect(resumoRegistros(12)).toBe("12 registros");
  });
});

describe("filtrarCadastro", () => {
  const itens = [
    { nome: "Secretaria de Obras", sigla: "SEOBRAS" },
    { nome: "Fundação Cultural", sigla: null },
    { nome: "Autarquia de Água", sigla: "AAG" },
  ];
  const campos = (i: (typeof itens)[number]) => [i.nome, i.sigla];

  it("devolve tudo com busca vazia ou so espacos", () => {
    expect(filtrarCadastro(itens, "", campos)).toEqual(itens);
    expect(filtrarCadastro(itens, "   ", campos)).toEqual(itens);
  });
  it("filtra por qualquer campo, sem diferenciar maiusculas", () => {
    expect(filtrarCadastro(itens, "seobras", campos)).toEqual([itens[0]]);
    expect(filtrarCadastro(itens, "FUNDAÇÃO", campos)).toEqual([itens[1]]);
  });
  it("ignora campos nulos e devolve vazio sem correspondencia", () => {
    expect(filtrarCadastro(itens, "inexistente", campos)).toEqual([]);
  });
});

describe("mensagemErroApi", () => {
  it("monta a mensagem com o message do corpo (string ou lista)", () => {
    expect(mensagemErroApi(409, { message: "codigo duplicado" })).toBe(
      "Erro 409: codigo duplicado",
    );
    expect(mensagemErroApi(400, { message: ["a", "b"] })).toBe(
      "Erro 400: a, b",
    );
  });
  it("usa fallback quando o corpo nao tem message", () => {
    expect(mensagemErroApi(500, null)).toBe("Erro 500: falha na API");
    expect(mensagemErroApi(502, {})).toBe("Erro 502: falha na API");
  });
});

describe("montarAtribuicaoPerfil", () => {
  it("devolve null quando nenhum perfil foi escolhido", () => {
    expect(montarAtribuicaoPerfil("", "orgao-1")).toBeNull();
  });
  it("monta ADMIN_TENANT e CONSULTA no escopo TENANT (sem orgao)", () => {
    expect(montarAtribuicaoPerfil("ADMIN_TENANT", null)).toEqual({
      ok: true,
      payload: { perfil: "ADMIN_TENANT", escopo: "TENANT" },
    });
    expect(montarAtribuicaoPerfil("CONSULTA", "orgao-1")).toEqual({
      ok: true,
      payload: { perfil: "CONSULTA", escopo: "TENANT" },
    });
  });
  it("monta GESTOR_ORGAO no escopo ORGAO com o orgao selecionado", () => {
    expect(montarAtribuicaoPerfil("GESTOR_ORGAO", "orgao-1")).toEqual({
      ok: true,
      payload: { perfil: "GESTOR_ORGAO", escopo: "ORGAO", orgaoId: "orgao-1" },
    });
  });
  it("recusa GESTOR_ORGAO sem orgao e perfis desconhecidos", () => {
    expect(montarAtribuicaoPerfil("GESTOR_ORGAO", "")).toEqual({
      ok: false,
      erro: "Selecione o órgão do usuário para conceder o perfil Gestor.",
    });
    expect(montarAtribuicaoPerfil("SUPER_ADMIN", null)).toMatchObject({
      ok: false,
    });
  });
});
