import { describe, expect, it } from "vitest";
import {
  corSemaforo,
  lerFiltro,
  serializarFiltro,
  type FiltroObras,
} from "./relatorios";

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
    const p = serializarFiltro({ orgaoId: "", buscaTextual: undefined }, { formato: "CSV" });
    expect(p.has("orgaoId")).toBe(false);
    expect(p.has("buscaTextual")).toBe(false);
    expect(p.get("formato")).toBe("CSV");
  });

  it("roundtrip URL <-> filtro preserva arrays e escalares", () => {
    const f: FiltroObras = { tagIds: ["a", "b"], orgaoId: "o1", buscaTextual: "x" };
    const lido = lerFiltro(serializarFiltro(f));
    expect(lido.tagIds).toEqual(["a", "b"]);
    expect(lido.orgaoId).toBe("o1");
    expect(lido.buscaTextual).toBe("x");
  });
});

describe("corSemaforo (SemaforoDesempenho)", () => {
  it("aplica cor por valor e cinza quando sem status", () => {
    expect(corSemaforo("VERDE")).toBe("#16a34a");
    expect(corSemaforo("LARANJA")).toBe("#f59e0b");
    expect(corSemaforo("VERMELHO")).toBe("#dc2626");
    expect(corSemaforo(null)).toBe("#9ca3af");
  });
});
