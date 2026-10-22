import { describe, expect, it } from "vitest";
import { temRecebimentoLiberador } from "./recebimento_rules";
import type { Recebimento } from "./recebimento_schema";

const recebimento = (tipo: Recebimento["tipo"]): Recebimento => ({
  id: "00000000-0000-0000-0000-000000000001",
  tipo,
  data: null,
  dataPrevista: null,
});

describe("regras de recebimento para conclusão", () => {
  it("considera provisório e definitivo como liberadores", () => {
    expect(temRecebimentoLiberador([recebimento("PROVISORIO")])).toBe(true);
    expect(temRecebimentoLiberador([recebimento("DEFINITIVO")])).toBe(true);
  });

  it("não considera inauguração como liberador", () => {
    expect(temRecebimentoLiberador([recebimento("INAUGURACAO")])).toBe(false);
  });

  it("não libera conclusão sem recebimento válido", () => {
    expect(temRecebimentoLiberador([])).toBe(false);
    expect(
      temRecebimentoLiberador([recebimento("INAUGURACAO"), recebimento("INAUGURACAO")]),
    ).toBe(false);
  });
});
