import { describe, expect, it } from "vitest";
import {
  podeEscrever,
  aditivoMostraFontes,
  aditivoMostraPrazo,
  aditivoMostraVigencia,
  aditivoSomenteBasico,
  campoReinicioDesabilitado,
  construirPayloadAditivo,
  construirPayloadContrato,
  fontesValidas,
  somarFontes,
  validarAditivo,
  validarContrato,
  validarParalisacao,
  validarReinicio,
  type FormularioAditivo,
  type FormularioContrato,
} from "./contratos";

function contrato(parcial: Partial<FormularioContrato>): FormularioContrato {
  return {
    empresaContratadaId: "e1",
    numero: "001/2026",
    dataOs: "2026-02-01",
    tipoPrazoExecucao: "DIAS",
    prazoExecucaoDias: "120",
    fontes: [{ fonteId: "f1", valor: "1000.00" }],
    ...parcial,
  };
}

function aditivo(parcial: Partial<FormularioAditivo>): FormularioAditivo {
  return {
    numero: "1",
    tipo: "OUTROS",
    fontes: [],
    ...parcial,
  };
}

describe("E4-05: regras do formulario de Contrato (RN-CON-03/04)", () => {
  it("RN-CON-03: tipo DIAS exige prazo_execucao_dias", () => {
    expect(validarContrato(contrato({ prazoExecucaoDias: "" }))).toContain(
      "Informe o prazo de execucao em dias",
    );
    expect(validarContrato(contrato({ prazoExecucaoDias: "120" }))).toEqual([]);
  });

  it("RN-CON-03: tipo DATA exige prazo_execucao_data", () => {
    const semData = contrato({
      tipoPrazoExecucao: "DATA",
      prazoExecucaoDias: "",
      prazoExecucaoData: "",
    });
    expect(validarContrato(semData)).toContain(
      "Informe a data do prazo de execucao",
    );
    const comData = contrato({
      tipoPrazoExecucao: "DATA",
      prazoExecucaoDias: "",
      prazoExecucaoData: "2026-06-01",
    });
    expect(validarContrato(comData)).toEqual([]);
  });

  it("RN-CON-04: envio sem nenhuma fonte exibe erro de validacao", () => {
    expect(validarContrato(contrato({ fontes: [] }))).toContain(
      "Adicione ao menos uma fonte de recurso com valor",
    );
    expect(
      validarContrato(contrato({ fontes: [{ fonteId: "", valor: "" }] })),
    ).toContain("Adicione ao menos uma fonte de recurso com valor");
  });

  it("RN-CON-04: adicionar 2 fontes atualiza a soma exibida", () => {
    expect(somarFontes([{ fonteId: "f1", valor: "1000.00" }])).toBe("1000.00");
    expect(
      somarFontes([
        { fonteId: "f1", valor: "1000.50" },
        { fonteId: "f2", valor: "2500.50" },
      ]),
    ).toBe("3501.00");
  });

  it("somarFontes ignora pares vazios/invalidos", () => {
    expect(
      somarFontes([
        { fonteId: "f1", valor: "100" },
        { fonteId: "", valor: "" },
        { fonteId: "f2", valor: "abc" },
      ]),
    ).toBe("100.00");
  });

  it("payload de contrato so inclui o campo de prazo do tipo ativo", () => {
    const comDias = construirPayloadContrato("obra1", contrato({}));
    expect(comDias.prazoExecucaoDias).toBe(120);
    expect("prazoExecucaoData" in comDias).toBe(false);
    expect(comDias.fontes).toHaveLength(1);
    expect(comDias.fontes[0].valor).toBe("1000.00");

    const comData = construirPayloadContrato(
      "obra1",
      contrato({
        tipoPrazoExecucao: "DATA",
        prazoExecucaoDias: "",
        prazoExecucaoData: "2026-06-01",
      }),
    );
    expect(comData.prazoExecucaoData).toBe("2026-06-01");
    expect("prazoExecucaoDias" in comData).toBe(false);
  });
});

describe("E4-06: campos condicionais do Aditivo por tipo (RN-CON-06/07)", () => {
  it("tipo VALOR oculta campos de prazo e exibe pares fonte+valor", () => {
    expect(aditivoMostraPrazo("VALOR")).toBe(false);
    expect(aditivoMostraFontes("VALOR")).toBe(true);
  });

  it("tipo PRAZO oculta fontes e exibe prazo", () => {
    expect(aditivoMostraFontes("PRAZO")).toBe(false);
    expect(aditivoMostraPrazo("PRAZO")).toBe(true);
  });

  it("tipo PRAZO_E_VALOR exibe prazo e fontes", () => {
    expect(aditivoMostraPrazo("PRAZO_E_VALOR")).toBe(true);
    expect(aditivoMostraFontes("PRAZO_E_VALOR")).toBe(true);
  });

  it("tipo FONTE exibe fontes mas nao prazo", () => {
    expect(aditivoMostraFontes("FONTE")).toBe(true);
    expect(aditivoMostraPrazo("FONTE")).toBe(false);
  });

  it("tipo OUTROS exibe apenas numero/data/observacoes", () => {
    expect(aditivoSomenteBasico("OUTROS")).toBe(true);
    expect(aditivoMostraPrazo("OUTROS")).toBe(false);
    expect(aditivoMostraFontes("OUTROS")).toBe(false);
    expect(aditivoMostraVigencia("OUTROS")).toBe(false);
  });

  it("validacao exige fontes para VALOR e prazo para PRAZO", () => {
    expect(validarAditivo(aditivo({ tipo: "VALOR", fontes: [] }))).toContain(
      "Adicione ao menos uma fonte com valor",
    );
    expect(
      validarAditivo(
        aditivo({ tipo: "PRAZO", tipoPrazoExecucao: "DIAS", prazoExecucaoDias: "" }),
      ),
    ).toContain("Informe o prazo aditivado em dias");
    expect(validarAditivo(aditivo({ tipo: "OUTROS" }))).toEqual([]);
  });

  it("payload de aditivo OUTROS nao carrega prazo/vigencia/fontes", () => {
    const p = construirPayloadAditivo(
      aditivo({ tipo: "OUTROS", observacoes: "ajuste textual" }),
    );
    expect(p.tipo).toBe("OUTROS");
    expect(p.observacoes).toBe("ajuste textual");
    expect("prazoExecucaoDias" in p).toBe(false);
    expect("vigenciaDias" in p).toBe(false);
    expect("fontes" in p).toBe(false);
  });

  it("payload de aditivo VALOR carrega fontes mas nao prazo", () => {
    const p = construirPayloadAditivo(
      aditivo({ tipo: "VALOR", fontes: [{ fonteId: "f1", valor: "20000" }] }),
    );
    expect(p.fontes).toHaveLength(1);
    expect(p.fontes?.[0].valor).toBe("20000.00");
    expect("prazoExecucaoDias" in p).toBe(false);
  });
});

describe("E4-06: paralisacao e reinicio (RN-CON-11/12)", () => {
  it("RN-CON-11: paralisacao bloqueia envio sem termo", () => {
    const erros = validarParalisacao({
      dataParalisacao: "2026-03-01",
      motivo: "chuva",
      termoParalisacaoArquivoId: "",
    });
    expect(erros).toContain("Anexe o termo de paralisacao");
    expect(
      validarParalisacao({
        dataParalisacao: "2026-03-01",
        motivo: "chuva",
        termoParalisacaoArquivoId: "arq1",
      }),
    ).toEqual([]);
  });

  it("RN-CON-12: data_reinicio preenchida desabilita dias_parados", () => {
    const d = campoReinicioDesabilitado({
      dataReinicio: "2026-04-01",
      diasParados: "",
    });
    expect(d.diasParados).toBe(true);
    expect(d.dataReinicio).toBe(false);
  });

  it("RN-CON-12: dias_parados preenchido desabilita data_reinicio", () => {
    const d = campoReinicioDesabilitado({ dataReinicio: "", diasParados: "30" });
    expect(d.dataReinicio).toBe(true);
    expect(d.diasParados).toBe(false);
  });

  it("RN-CON-12: reinicio exige um dos dois e nao ambos", () => {
    const base = { termoRetomadaArquivoId: "arq2" };
    expect(
      validarReinicio({ ...base, dataReinicio: "", diasParados: "" }),
    ).toContain("Informe a data de reinicio ou os dias parados");
    expect(
      validarReinicio({ ...base, dataReinicio: "2026-04-01", diasParados: "30" }),
    ).toContain("Informe apenas a data de reinicio OU os dias parados");
    expect(
      validarReinicio({ ...base, dataReinicio: "2026-04-01", diasParados: "" }),
    ).toEqual([]);
  });

  it("reinicio exige termo de retomada", () => {
    expect(
      validarReinicio({
        dataReinicio: "2026-04-01",
        diasParados: "",
        termoRetomadaArquivoId: "",
      }),
    ).toContain("Anexe o termo de retomada");
  });
});

describe("E4-05: RBAC esconde escrita para CONSULTA", () => {
  it("CONSULTA nao pode escrever; demais perfis podem", () => {
    expect(podeEscrever("CONSULTA")).toBe(false);
    expect(podeEscrever("ADMIN_TENANT")).toBe(true);
    expect(podeEscrever("GESTOR_ORGAO")).toBe(true);
    expect(podeEscrever("RESPONSAVEL_OBRA")).toBe(true);
  });

  it("perfil ausente assume escrita (backend valida o escopo)", () => {
    expect(podeEscrever(null)).toBe(true);
  });
});

describe("helpers auxiliares", () => {
  it("fontesValidas filtra pares incompletos", () => {
    expect(
      fontesValidas([
        { fonteId: "f1", valor: "10" },
        { fonteId: "", valor: "20" },
        { fonteId: "f2", valor: "" },
      ]),
    ).toEqual([{ fonteId: "f1", valor: "10" }]);
  });
});
