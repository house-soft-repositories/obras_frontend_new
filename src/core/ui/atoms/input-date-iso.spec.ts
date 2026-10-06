import { describe, expect, it } from "vitest";
import { brToIsoDate, isoToBrDisplay } from "./input-date-iso";

describe("isoToBrDisplay", () => {
  it("converte ISO em dd/mm/aaaa", () => {
    expect(isoToBrDisplay("2024-05-12")).toBe("12/05/2024");
  });

  it("devolve vazio para valor ausente ou fora do padrão ISO", () => {
    expect(isoToBrDisplay("")).toBe("");
    expect(isoToBrDisplay(null)).toBe("");
    expect(isoToBrDisplay(undefined)).toBe("");
    expect(isoToBrDisplay("12/05/2024")).toBe("");
    expect(isoToBrDisplay("2024-5-2")).toBe("");
  });
});

describe("brToIsoDate", () => {
  it("converte dd/mm/aaaa em ISO", () => {
    expect(brToIsoDate("12/05/2024")).toBe("2024-05-12");
  });

  it("aceita 29/02 em ano bissexto e rejeita em ano comum", () => {
    expect(brToIsoDate("29/02/2024")).toBe("2024-02-29");
    expect(brToIsoDate("29/02/2023")).toBeNull();
  });

  it("rejeita datas inexistentes e texto parcial", () => {
    expect(brToIsoDate("31/02/2024")).toBeNull();
    expect(brToIsoDate("32/01/2024")).toBeNull();
    expect(brToIsoDate("00/01/2024")).toBeNull();
    expect(brToIsoDate("13/13/2024")).toBeNull();
    expect(brToIsoDate("12/05/20")).toBeNull();
    expect(brToIsoDate("")).toBeNull();
    expect(brToIsoDate(null)).toBeNull();
  });

  it("faz round-trip com isoToBrDisplay sem deslocamento de dia", () => {
    expect(brToIsoDate(isoToBrDisplay("2024-01-01"))).toBe("2024-01-01");
    expect(brToIsoDate(isoToBrDisplay("2023-12-31"))).toBe("2023-12-31");
  });
});
