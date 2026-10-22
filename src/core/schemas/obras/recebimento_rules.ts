import type { Recebimento, TipoRecebimento } from "./recebimento_schema";

export const TIPOS_RECEBIMENTO_LIBERADORES: readonly TipoRecebimento[] = [
  "PROVISORIO",
  "DEFINITIVO",
];

export function temRecebimentoLiberador(recebimentos: readonly Recebimento[]): boolean {
  return recebimentos.some((recebimento) =>
    TIPOS_RECEBIMENTO_LIBERADORES.includes(recebimento.tipo),
  );
}
