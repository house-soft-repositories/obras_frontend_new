import { describe, expect, it } from "vitest";
import {
  corBarraRealizado,
  desvioEstagio,
  duracaoEstagio,
  larguraBarra,
  percentual,
  periodoEstagio,
  situacaoEstagio,
} from "./cronograma-estagio";

const base = { concluido: false, ativo: true, valorRealizado: null };

describe("situacaoEstagio — chip da linha do cronograma", () => {
  it("concluido vence todos os demais estados", () => {
    const s = situacaoEstagio(
      { ...base, concluido: true, ativo: false, valorRealizado: "10" },
      true,
    );
    expect(s.chave).toBe("concluido");
    expect(s.classe).toBe("chip-verde");
  });

  it("inativo vem antes de estagio atual (RN-CRO-02)", () => {
    expect(situacaoEstagio({ ...base, ativo: false }, true).chave).toBe(
      "inativo",
    );
  });

  it("estagio atual e destacado (RN-CRO-01)", () => {
    expect(situacaoEstagio(base, true).chave).toBe("atual");
  });

  it("com realizado lancado fica em andamento; sem realizado, nao iniciado", () => {
    expect(
      situacaoEstagio({ ...base, valorRealizado: "12" }, false).chave,
    ).toBe("em_andamento");
    expect(situacaoEstagio(base, false).chave).toBe("nao_iniciado");
  });

  it("sem cronograma, o percentual direto do estagio vale como realizado (RN-CRO-11)", () => {
    expect(
      situacaoEstagio({ ...base, percentualRealizado: "40" }, false).chave,
    ).toBe("em_andamento");
  });
});

describe("percentual e larguraBarra", () => {
  it("valores ausentes ou invalidos viram zero", () => {
    expect(percentual(null)).toBe(0);
    expect(percentual("")).toBe(0);
    expect(percentual("abc")).toBe(0);
    expect(percentual("82.5")).toBe(82.5);
  });

  it("a barra e limitada a 100% e nunca negativa", () => {
    expect(larguraBarra("140")).toBe("100%");
    expect(larguraBarra("-5")).toBe("0%");
    expect(larguraBarra("64")).toBe("64%");
  });
});

describe("desvioEstagio — Realizado x Meta em p.p.", () => {
  it("no ou acima da meta e positivo", () => {
    expect(desvioEstagio("50", "50")).toMatchObject({
      pontos: 0,
      tom: "positivo",
      texto: "0 p.p.",
    });
    expect(desvioEstagio("50", "60").texto).toBe("+10 p.p.");
  });

  it("ate 10 p.p. abaixo e atencao; mais que isso e critico", () => {
    expect(desvioEstagio("100", "95").tom).toBe("atencao");
    expect(desvioEstagio("100", "82").tom).toBe("critico");
    expect(desvioEstagio("100", "82").texto).toBe("-18 p.p.");
  });

  it("a cor da barra acompanha o tom", () => {
    expect(corBarraRealizado("critico")).toBe("var(--sem-vermelho)");
    expect(corBarraRealizado("atencao")).toBe("var(--sem-amarelo)");
    expect(corBarraRealizado("positivo")).toBe("var(--sem-verde)");
  });
});

describe("rotulos de periodo e duracao", () => {
  it("formata o periodo sem deslocar por fuso", () => {
    expect(periodoEstagio("2024-02-12", "2024-03-27")).toBe(
      "12/02/2024 → 27/03/2024",
    );
  });

  it("datas ausentes viram travessao", () => {
    expect(periodoEstagio(null, null)).toBe("— → —");
  });

  it("duracao nao informada vira travessao", () => {
    expect(duracaoEstagio(null)).toBe("—");
    expect(duracaoEstagio(45)).toBe("45 dias");
  });
});
