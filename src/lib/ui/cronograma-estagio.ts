/**
 * Apresentacao da linha de estagio do cronograma conforme a referencia Claude
 * Design: chip de situacao, avanco Meta x Realizado e desvio em pontos
 * percentuais. Funcoes PURAS (sem React), testaveis em vitest node.
 */
import { formatarData } from "./datas";

export { formatarData };

export type SituacaoEstagio =
  | "concluido"
  | "inativo"
  | "atual"
  | "em_andamento"
  | "nao_iniciado";

export interface ChipSituacao {
  chave: SituacaoEstagio;
  titulo: string;
  /** Classe utilitaria de chip declarada em globals.css. */
  classe: string;
}

const CHIPS: Record<SituacaoEstagio, ChipSituacao> = {
  concluido: { chave: "concluido", titulo: "Concluído", classe: "chip-verde" },
  inativo: { chave: "inativo", titulo: "Inativo", classe: "chip-cinza" },
  atual: { chave: "atual", titulo: "Estágio atual", classe: "chip-azul" },
  em_andamento: {
    chave: "em_andamento",
    titulo: "Em andamento",
    classe: "chip-ambar",
  },
  nao_iniciado: {
    chave: "nao_iniciado",
    titulo: "Não iniciado",
    classe: "chip-cinza",
  },
};

/**
 * Situacao exibida no chip, na precedencia do design: concluido > inativo >
 * estagio atual > em andamento (ha realizado lancado) > nao iniciado.
 */
export function situacaoEstagio(
  estagio: {
    concluido: boolean;
    ativo: boolean;
    valorRealizado?: string | null;
    percentualRealizado?: string | null;
  },
  ehAtual: boolean,
): ChipSituacao {
  if (estagio.concluido) return CHIPS.concluido;
  if (!estagio.ativo) return CHIPS.inativo;
  if (ehAtual) return CHIPS.atual;
  return percentual(estagio.valorRealizado ?? estagio.percentualRealizado) > 0
    ? CHIPS.em_andamento
    : CHIPS.nao_iniciado;
}

/**
 * Converte o valor decimal vindo da API (string) em numero para as barras.
 * Valor ausente ou nao numerico vira 0 — a barra some, nunca quebra.
 */
export function percentual(valor: string | number | null | undefined): number {
  if (valor === null || valor === undefined || valor === "") return 0;
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

/** Largura da barra, limitada a 100% para nao estourar a trilha. */
export function larguraBarra(
  valor: string | number | null | undefined,
): string {
  return `${Math.max(0, Math.min(percentual(valor), 100))}%`;
}

export interface Desvio {
  /** Realizado − Meta, em pontos percentuais. */
  pontos: number;
  texto: string;
  /** Sinal usado para colorir barra e texto. */
  tom: "positivo" | "atencao" | "critico";
}

/**
 * Desvio Realizado x Meta. Ate 10 p.p. abaixo da meta é atencao (ambar); mais
 * que isso é critico (vermelho); no ou acima da meta é positivo (verde).
 */
export function desvioEstagio(
  meta: string | number | null | undefined,
  realizado: string | number | null | undefined,
): Desvio {
  const pontos =
    Math.round((percentual(realizado) - percentual(meta)) * 10) / 10;
  const tom = pontos < -10 ? "critico" : pontos < 0 ? "atencao" : "positivo";
  return {
    pontos,
    texto: `${pontos > 0 ? "+" : ""}${pontos.toLocaleString("pt-BR")} p.p.`,
    tom,
  };
}

/** Cor da barra de Realizado, derivada do tom do desvio. */
export function corBarraRealizado(tom: Desvio["tom"]): string {
  if (tom === "critico") return "var(--sem-vermelho)";
  if (tom === "atencao") return "var(--sem-amarelo)";
  return "var(--sem-verde)";
}

/**
 * Rotulo do periodo do estagio ("12/02/2024 → 27/03/2024"). Datas ausentes
 * viram travessao, como no resto da UI.
 */
export function periodoEstagio(
  dataInicio: string | null,
  dataPrazo: string | null,
): string {
  return `${formatarData(dataInicio)} → ${formatarData(dataPrazo)}`;
}

/** Rotulo de duracao do estagio: "45 dias" ou travessao quando nao informada. */
export function duracaoEstagio(totalDias: number | null): string {
  return totalDias === null ? "—" : `${totalDias} dias`;
}
