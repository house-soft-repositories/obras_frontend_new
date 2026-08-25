import { describe, expect, it } from "vitest";
import {
  chipTipoAditivo,
  diasParadosTexto,
  partesPrazoFinal,
  prazoAditivo,
  situacaoParalisacao,
} from "./contrato-aba";
import { formatarData, formatarDataHora } from "./datas";

describe("chipTipoAditivo (RN-CON-06)", () => {
  it("cada tipo tem rotulo e tom proprios", () => {
    expect(chipTipoAditivo("VALOR")).toEqual({
      titulo: "Valor",
      classe: "chip-verde",
    });
    expect(chipTipoAditivo("PRAZO_E_VALOR").titulo).toBe("Prazo + valor");
    expect(chipTipoAditivo("OUTROS").classe).toBe("chip-cinza");
  });

  it("tipo desconhecido cai no cinza sem quebrar", () => {
    expect(chipTipoAditivo("QUALQUER")).toEqual({
      titulo: "QUALQUER",
      classe: "chip-cinza",
    });
  });
});

describe("prazoAditivo (RN-CON-07)", () => {
  it("dias aditivados aparecem somando", () => {
    expect(
      prazoAditivo({ prazoExecucaoDias: 90, prazoExecucaoData: null }),
    ).toBe("+ 90 dias");
  });

  it("prazo informado como data e formatado", () => {
    expect(
      prazoAditivo({
        prazoExecucaoDias: null,
        prazoExecucaoData: "2025-06-30",
      }),
    ).toBe("30/06/2025");
  });

  it("aditivo que nao mexe no prazo mostra travessao", () => {
    expect(
      prazoAditivo({ prazoExecucaoDias: null, prazoExecucaoData: null }),
    ).toBe("—");
  });
});

describe("situacaoParalisacao (RN-CON-12)", () => {
  it("sem reinicio registrado fica em aberto", () => {
    expect(
      situacaoParalisacao({ dataReinicio: null, diasParados: null }),
    ).toMatchObject({ aberta: true, titulo: "Em aberto" });
  });

  it("com data OU dias parados ja consta reiniciada", () => {
    expect(
      situacaoParalisacao({ dataReinicio: "2025-02-18", diasParados: null })
        .aberta,
    ).toBe(false);
    expect(
      situacaoParalisacao({ dataReinicio: null, diasParados: 15 }).aberta,
    ).toBe(false);
  });

  it("dias parados ausentes viram travessao", () => {
    expect(diasParadosTexto(null)).toBe("—");
    expect(diasParadosTexto(30)).toBe("30 dias parados");
  });
});

describe("partesPrazoFinal (RN-CON-01)", () => {
  it("decompoe o prazo final na ordem da regra-ouro", () => {
    const partes = partesPrazoFinal("2024-02-12", {
      diasBase: 540,
      diasParalisacoes: 45,
      diasAditivos: 90,
    });
    expect(partes.map((p) => p.valor)).toEqual([
      "12/02/2024",
      "540 dias",
      "+ 45 dias",
      "+ 90 dias",
    ]);
  });
});

describe("formatacao de datas", () => {
  it("data pura nao desloca por fuso", () => {
    expect(formatarData("2024-01-01")).toBe("01/01/2024");
    expect(formatarData(null)).toBe("—");
  });

  it("data-hora mantem hora e minuto", () => {
    expect(formatarDataHora("2025-03-02T09:40:12Z")).toBe("02/03/2025 09:40");
    expect(formatarDataHora(null)).toBe("—");
  });
});
