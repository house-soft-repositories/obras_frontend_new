import { describe, expect, it } from "vitest";
import {
  contarPrazo,
  contarValidadeAlvara,
  diasEntre,
  excedenteArea,
  formatarArea,
  formatarDataCurta,
  formatarDataHora,
  formatarTamanho,
  formatarVolume,
  prazoEncerrado,
  resumoUltimaVisita,
} from "./prazo";

const HOJE = "2026-08-11";

describe("contarPrazo (RN-PRV-11)", () => {
  it("conta os dias restantes", () => {
    expect(contarPrazo("2026-08-22", false, HOJE)).toEqual({
      dias: 11,
      vencido: false,
      rotulo: "faltam 11 dias",
    });
  });

  it("marca vencido quando a data limite passou", () => {
    expect(contarPrazo("2026-07-08", false, HOJE)).toEqual({
      dias: -34,
      vencido: true,
      rotulo: "vencido há 34 dias",
    });
  });

  it("singulariza 1 dia vencido", () => {
    expect(contarPrazo("2026-08-10", false, HOJE).rotulo).toBe(
      "vencido há 1 dia",
    );
  });

  it("distingue o dia do vencimento", () => {
    expect(contarPrazo(HOJE, false, HOJE)).toEqual({
      dias: 0,
      vencido: false,
      rotulo: "vence hoje",
    });
  });

  it("auto encerrado nunca aparece como vencido", () => {
    const r = contarPrazo("2026-06-03", true, HOJE);
    expect(r.vencido).toBe(false);
    expect(r.rotulo).toBe("no prazo");
  });

  it("sem data limite nao exibe contagem", () => {
    expect(contarPrazo(null, false, HOJE)).toEqual({
      dias: null,
      vencido: false,
      rotulo: "",
    });
  });

  it("reconhece as situacoes em que o prazo nao corre", () => {
    expect(prazoEncerrado("CUMPRIDO")).toBe(true);
    expect(prazoEncerrado("QUITADO")).toBe(true);
    expect(prazoEncerrado("ABERTO")).toBe(false);
    expect(prazoEncerrado("EM_RECURSO")).toBe(false);
  });
});

describe("validade do alvara", () => {
  it("conta os dias ate o vencimento", () => {
    expect(contarValidadeAlvara("2026-09-14", HOJE).rotulo).toBe(
      "faltam 34 dias",
    );
  });

  it("marca vencido apos a data", () => {
    expect(contarValidadeAlvara("2026-03-02", HOJE).vencido).toBe(true);
  });
});

describe("diasEntre", () => {
  it("atravessa mes e ano", () => {
    expect(diasEntre("2026-12-20", "2027-01-19")).toBe(30);
  });

  it("retorna null em data invalida", () => {
    expect(diasEntre("xx", "2026-01-01")).toBeNull();
  });
});

describe("resumoUltimaVisita", () => {
  it("alerta obra nunca visitada", () => {
    expect(resumoUltimaVisita(null, HOJE)).toEqual({
      rotulo: "Nunca visitada",
      dias: null,
      alerta: true,
    });
  });

  it("alerta acima de 90 dias sem visita", () => {
    const r = resumoUltimaVisita("2026-04-11", HOJE);
    expect(r.dias).toBe(122);
    expect(r.alerta).toBe(true);
    expect(r.rotulo).toBe("11/04/2026");
  });

  it("nao alerta visita recente", () => {
    expect(resumoUltimaVisita("2026-07-22", HOJE).alerta).toBe(false);
  });

  it("90 dias exatos ainda nao alerta", () => {
    expect(resumoUltimaVisita("2026-05-13", HOJE).dias).toBe(90);
    expect(resumoUltimaVisita("2026-05-13", HOJE).alerta).toBe(false);
  });
});

describe("formatacao", () => {
  it("data curta sem deslocamento de fuso", () => {
    expect(formatarDataCurta("2026-08-11")).toBe("11/08/2026");
    expect(formatarDataCurta(null)).toBe("—");
  });

  it("data e hora da timeline", () => {
    expect(formatarDataHora("2026-08-02T09:15:00.000Z")).toBe(
      "02/08/2026 09:15",
    );
  });

  it("area em pt-BR", () => {
    expect(formatarArea("212.50")).toBe("212,50 m²");
    expect(formatarArea("1234.5")).toBe("1.234,50 m²");
    expect(formatarArea(null)).toBe("—");
    expect(formatarArea("abc")).toBe("—");
  });

  it("volume de entulho", () => {
    expect(formatarVolume("6")).toBe("6,00 m³");
  });

  it("tamanho de arquivo", () => {
    expect(formatarTamanho(512)).toBe("512 B");
    expect(formatarTamanho(640 * 1024)).toBe("640 KB");
    expect(formatarTamanho(1.8 * 1024 * 1024)).toBe("1,8 MB");
    expect(formatarTamanho(null)).toBe("—");
  });
});

describe("excedenteArea (RN-PRV-08)", () => {
  it("calcula o excedente quando a executada supera a aprovada", () => {
    expect(excedenteArea("212.50", "238.90")).toBe("26,40 m²");
  });

  it("nao ha excedente quando as areas batem", () => {
    expect(excedenteArea("212.50", "212.50")).toBeNull();
  });

  it("nao ha excedente quando a executada e menor", () => {
    expect(excedenteArea("212.50", "180.00")).toBeNull();
  });

  it("sem uma das areas nao ha o que comparar", () => {
    expect(excedenteArea(null, "238.90")).toBeNull();
    expect(excedenteArea("212.50", null)).toBeNull();
  });
});
