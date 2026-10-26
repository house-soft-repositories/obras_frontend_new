import { describe, expect, it } from "vitest";
import { statusObraChipVariant, statusObraLabel } from "./status-obra";

describe("status de obra", () => {
  it("transforma o enum em rótulo legível e chip colorido", () => {
    expect(statusObraLabel("EM_ABERTO")).toBe("Em aberto");
    expect(statusObraLabel("EM_DESENVOLVIMENTO")).toBe("Em execução");
    expect(statusObraChipVariant("EM_ABERTO")).toBe("ambar");
    expect(statusObraChipVariant("CONCLUIDO")).toBe("verde");
    expect(statusObraChipVariant("STATUS_DESCONHECIDO")).toBe("cinza");
  });
});
