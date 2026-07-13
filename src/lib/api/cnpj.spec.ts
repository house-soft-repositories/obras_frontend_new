import { describe, expect, it } from "vitest";
import {
  cnpjValido,
  consultarCnpj,
  limparCnpj,
  mapearRespostaBrasilApi,
  mascararCnpj,
} from "./cnpj";

describe("limparCnpj", () => {
  it("remove tudo que nao e digito e limita a 14", () => {
    expect(limparCnpj("19.131.243/0001-97")).toBe("19131243000197");
    expect(limparCnpj("19131243000197999")).toBe("19131243000197");
    expect(limparCnpj("abc")).toBe("");
  });
});

describe("mascararCnpj", () => {
  it("formata progressivamente enquanto digita", () => {
    expect(mascararCnpj("1")).toBe("1");
    expect(mascararCnpj("191")).toBe("19.1");
    expect(mascararCnpj("191312")).toBe("19.131.2");
    expect(mascararCnpj("191312430")).toBe("19.131.243/0");
    expect(mascararCnpj("1913124300019")).toBe("19.131.243/0001-9");
    expect(mascararCnpj("19131243000197")).toBe("19.131.243/0001-97");
  });
});

describe("cnpjValido", () => {
  it("aceita CNPJs com digitos verificadores corretos", () => {
    expect(cnpjValido("19.131.243/0001-97")).toBe(true);
    expect(cnpjValido("00.000.000/0001-91")).toBe(true);
    expect(cnpjValido("11222333000181")).toBe(true);
  });
  it("rejeita DV errado, sequencia repetida e tamanho invalido", () => {
    expect(cnpjValido("19.131.243/0001-98")).toBe(false);
    expect(cnpjValido("11.111.111/1111-11")).toBe(false);
    expect(cnpjValido("123")).toBe(false);
    expect(cnpjValido("")).toBe(false);
  });
});

describe("mapearRespostaBrasilApi", () => {
  it("extrai identificacao, contato, socio (qsa) e endereco", () => {
    expect(
      mapearRespostaBrasilApi({
        razao_social: "OPEN KNOWLEDGE BRASIL",
        nome_fantasia: "  OKBR  ",
        email: "Contato@OK.ORG.BR",
        ddd_telefone_1: "1123456789",
        descricao_situacao_cadastral: "ATIVA",
        qsa: [
          { nome_socio: "HAYDEE SVAB", qualificacao_socio: "Presidente" },
          { nome_socio: "OUTRO SOCIO", qualificacao_socio: "Diretor" },
        ],
        cep: "01311902",
        descricao_tipo_de_logradouro: "AVENIDA",
        logradouro: "PAULISTA",
        numero: "37",
        complemento: "ANDAR 4",
        bairro: "BELA VISTA",
        municipio: "SAO PAULO",
        uf: "SP",
      }),
    ).toEqual({
      razaoSocial: "OPEN KNOWLEDGE BRASIL",
      nomeFantasia: "OKBR",
      email: "contato@ok.org.br",
      telefone: "1123456789",
      situacaoCadastral: "ATIVA",
      responsavel: "HAYDEE SVAB",
      cargoResponsavel: "Presidente",
      cep: "01311902",
      logradouro: "AVENIDA PAULISTA",
      numero: "37",
      complemento: "ANDAR 4",
      bairro: "BELA VISTA",
      cidade: "SAO PAULO",
      uf: "SP",
    });
  });
  it("normaliza campos vazios/ausentes para null", () => {
    const d = mapearRespostaBrasilApi({ razao_social: "X", email: "  " });
    expect(d.email).toBeNull();
    expect(d.telefone).toBeNull();
    expect(d.nomeFantasia).toBeNull();
    expect(d.responsavel).toBeNull();
    expect(d.cargoResponsavel).toBeNull();
    expect(d.logradouro).toBeNull();
    expect(d.cidade).toBeNull();
  });
});

describe("consultarCnpj", () => {
  const resposta = (status: number, corpo?: unknown) =>
    ({
      status,
      ok: status >= 200 && status < 300,
      json: async () => corpo,
    }) as Response;

  it("mapeia 200 para ok com dados", async () => {
    const r = await consultarCnpj("19131243000197", async () =>
      resposta(200, { razao_social: "OPEN KNOWLEDGE BRASIL" }),
    );
    expect(r).toMatchObject({
      status: "ok",
      dados: { razaoSocial: "OPEN KNOWLEDGE BRASIL" },
    });
  });
  it("mapeia 404 e 400 para nao-encontrado", async () => {
    expect(
      (await consultarCnpj("99999999000191", async () => resposta(404))).status,
    ).toBe("nao-encontrado");
    expect(
      (await consultarCnpj("123", async () => resposta(400))).status,
    ).toBe("nao-encontrado");
  });
  it("mapeia 5xx e falha de rede para indisponivel", async () => {
    expect(
      (await consultarCnpj("19131243000197", async () => resposta(500))).status,
    ).toBe("indisponivel");
    expect(
      (
        await consultarCnpj("19131243000197", async () => {
          throw new Error("offline");
        })
      ).status,
    ).toBe("indisponivel");
  });
});
