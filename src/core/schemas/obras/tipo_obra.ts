import { z } from "zod";

export const TIPO_OBRA_VALUES = [
  "AQUISICAO",
  "INVESTIMENTO_PRIVADO",
  "OBRA",
  "PROGRAMA_PROJETO",
  "SERVICOS",
] as const;

export const tipoObraSchema = z.enum(TIPO_OBRA_VALUES);
export type TipoObra = z.infer<typeof tipoObraSchema>;

export const TIPO_OBRA_LABELS: Record<TipoObra, string> = {
  AQUISICAO: "Aquisição",
  INVESTIMENTO_PRIVADO: "Investimento privado",
  OBRA: "Obra",
  PROGRAMA_PROJETO: "Programa / projeto",
  SERVICOS: "Serviços",
};
