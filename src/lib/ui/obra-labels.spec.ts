import { describe, expect, it } from "vitest";
import {
  iniciais,
  perfilLabel,
  saudacaoPorHora,
  semaforoInfo,
  statusObraChipClasse,
  statusObraLabel,
} from "./obra-labels";

describe("statusObraLabel", () => {
  it("traduz os status conhecidos para PT-BR acentuado", () => {
    expect(statusObraLabel("EM_ABERTO")).toBe("Em aberto");
    expect(statusObraLabel("EM_DESENVOLVIMENTO")).toBe("Em execução");
    expect(statusObraLabel("PARALISADO")).toBe("Paralisada");
    expect(statusObraLabel("CONCLUIDO")).toBe("Concluída");
    expect(statusObraLabel("CANCELADO")).toBe("Cancelada");
  });
  it("devolve o proprio valor quando desconhecido", () => {
    expect(statusObraLabel("OUTRO")).toBe("OUTRO");
    expect(statusObraLabel("")).toBe("");
  });
});

describe("statusObraChipClasse", () => {
  it("mapeia cada status para a classe global de chip", () => {
    expect(statusObraChipClasse("EM_DESENVOLVIMENTO")).toBe("chip-azul");
    expect(statusObraChipClasse("CONCLUIDO")).toBe("chip-verde");
    expect(statusObraChipClasse("PARALISADO")).toBe("chip-vermelho");
    expect(statusObraChipClasse("EM_ABERTO")).toBe("chip-cinza");
    expect(statusObraChipClasse("CANCELADO")).toBe("chip-cinza");
  });
  it("usa chip cinza para valores desconhecidos", () => {
    expect(statusObraChipClasse("OUTRO")).toBe("chip-cinza");
  });
});

describe("semaforoInfo", () => {
  it("devolve rotulo e variavel CSS de cor por cor do semaforo", () => {
    expect(semaforoInfo("VERDE")).toEqual({
      rotulo: "No prazo",
      cor: "var(--sem-verde)",
    });
    expect(semaforoInfo("LARANJA")).toEqual({
      rotulo: "Dentro da meta",
      cor: "var(--sem-laranja)",
    });
    expect(semaforoInfo("VERMELHO")).toEqual({
      rotulo: "Atrasado",
      cor: "var(--sem-vermelho)",
    });
  });
  it("trata null/undefined como sem status (cinza)", () => {
    expect(semaforoInfo(null)).toEqual({
      rotulo: "Sem status",
      cor: "var(--sem-cinza)",
    });
    expect(semaforoInfo(undefined)).toEqual({
      rotulo: "Sem status",
      cor: "var(--sem-cinza)",
    });
  });
});

describe("saudacaoPorHora", () => {
  it("bom dia entre 5 e 11", () => {
    expect(saudacaoPorHora(5)).toBe("Bom dia");
    expect(saudacaoPorHora(8)).toBe("Bom dia");
    expect(saudacaoPorHora(11)).toBe("Bom dia");
  });
  it("boa tarde entre 12 e 17", () => {
    expect(saudacaoPorHora(12)).toBe("Boa tarde");
    expect(saudacaoPorHora(17)).toBe("Boa tarde");
  });
  it("boa noite nas demais horas", () => {
    expect(saudacaoPorHora(18)).toBe("Boa noite");
    expect(saudacaoPorHora(23)).toBe("Boa noite");
    expect(saudacaoPorHora(0)).toBe("Boa noite");
    expect(saudacaoPorHora(4)).toBe("Boa noite");
  });
});

describe("iniciais", () => {
  it("usa as duas primeiras palavras", () => {
    expect(iniciais("Mariana Rocha")).toBe("MR");
    expect(iniciais("ana beatriz da silva")).toBe("AB");
  });
  it("uma palavra vira uma letra", () => {
    expect(iniciais("Mariana")).toBe("M");
  });
  it("vazio ou apenas espacos vira string vazia", () => {
    expect(iniciais("")).toBe("");
    expect(iniciais("   ")).toBe("");
  });
  it("ignora espacos extras entre palavras", () => {
    expect(iniciais("  joão   pedro  ")).toBe("JP");
  });
});

describe("perfilLabel", () => {
  it("traduz os perfis conhecidos", () => {
    expect(perfilLabel("SUPER_ADMIN")).toBe("Super admin");
    expect(perfilLabel("ADMIN_TENANT")).toBe("Administrador");
    expect(perfilLabel("GESTOR_ORGAO")).toBe("Gestor");
    expect(perfilLabel("RESPONSAVEL_OBRA")).toBe("Responsável por obra");
    expect(perfilLabel("CONSULTA")).toBe("Consulta");
  });
  it("devolve o proprio valor quando desconhecido", () => {
    expect(perfilLabel("OUTRO_PERFIL")).toBe("OUTRO_PERFIL");
  });
});
