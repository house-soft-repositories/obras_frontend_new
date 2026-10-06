import { describe, expect, it } from "vitest";
import { aplicarMascara } from "./input-pattern";

describe("aplicarMascara", () => {
  it("preserva literais no início da máscara quando há valor", () => {
    expect(aplicarMascara("869", "(99) 99999-9999")).toBe("(86) 9");
  });

  it("não exibe literais iniciais quando o valor está vazio", () => {
    expect(aplicarMascara("", "(99) 99999-9999")).toBe("");
  });
});
