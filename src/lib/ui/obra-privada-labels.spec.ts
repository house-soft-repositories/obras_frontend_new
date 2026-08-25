import { describe, expect, it } from "vitest";
import {
  chipAndamento,
  chipHabiteSe,
  chipSituacaoAlvara,
  OPCOES_ANDAMENTO,
  OPCOES_HABITE_SE,
  OPCOES_SITUACAO_ALVARA,
} from "./obra-privada-labels";

/**
 * Os enums do backend (obras-privadas.enums.ts). Se um valor novo entrar la e
 * nao chegar aqui, o <select> de edicao gravaria silenciosamente outro valor
 * ao abrir uma obra que ja usa o valor faltante.
 */
const SITUACAO_ALVARA_BACKEND = [
  "SEM_ALVARA",
  "COM_ALVARA_VIGENTE",
  "COM_ALVARA_VENCIDO",
  "DISPENSADA",
];
const ANDAMENTO_BACKEND = [
  "NAO_INICIADA",
  "EM_ANDAMENTO",
  "PARALISADA",
  "CONCLUIDA",
  "DEMOLIDA",
  "CANCELADA",
];
const HABITE_SE_BACKEND = [
  "NAO_SOLICITADO",
  "SOLICITADO",
  "APROVADO",
  "REPROVADO",
];

describe("opções dos três eixos de situação", () => {
  it("cobre todos os valores de SituacaoAlvara do backend", () => {
    expect(OPCOES_SITUACAO_ALVARA.map((o) => o.valor)).toEqual(
      SITUACAO_ALVARA_BACKEND,
    );
  });

  it("cobre todos os valores de AndamentoObraPrivada, inclusive NAO_INICIADA", () => {
    expect(OPCOES_ANDAMENTO.map((o) => o.valor)).toEqual(ANDAMENTO_BACKEND);
  });

  it("cobre todos os valores de SituacaoHabiteSe do backend", () => {
    expect(OPCOES_HABITE_SE.map((o) => o.valor)).toEqual(HABITE_SE_BACKEND);
  });

  it("nunca oferece uma opção sem rótulo", () => {
    for (const lista of [
      OPCOES_SITUACAO_ALVARA,
      OPCOES_ANDAMENTO,
      OPCOES_HABITE_SE,
    ]) {
      for (const o of lista) expect(o.rotulo.trim()).not.toBe("");
    }
  });

  it("usa rótulo curto no habite-se, sem repetir a palavra do campo", () => {
    expect(OPCOES_HABITE_SE.map((o) => o.rotulo)).toEqual([
      "Não emitido",
      "Solicitado",
      "Aprovado",
      "Reprovado",
    ]);
  });

  it("mantém os rótulos dos chips em sincronia com as opções", () => {
    expect(chipSituacaoAlvara("SEM_ALVARA").rotulo).toBe(
      OPCOES_SITUACAO_ALVARA[0].rotulo,
    );
    expect(chipAndamento("NAO_INICIADA").rotulo).toBe(OPCOES_ANDAMENTO[0].rotulo);
    // O habite-se e o unico com rotulo proprio de formulario.
    expect(chipHabiteSe("NAO_SOLICITADO").rotulo).toBe("Habite-se não emitido");
  });
});
