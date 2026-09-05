import { describe, expect, it } from "vitest";
import { gerarSlug } from "./slug";

describe("gerarSlug", () => {
  it("converte nome em kebab-case sem acentos", () => {
    expect(gerarSlug("  Prefeitura de São Bento  ")).toBe(
      "prefeitura-de-sao-bento",
    );
  });

  it("unifica espaços e caracteres separadores em hífens", () => {
    expect(gerarSlug("Obras & Projetos   Ltda.")).toBe("obras-projetos-ltda");
  });
});
