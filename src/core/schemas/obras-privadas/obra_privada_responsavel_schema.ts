import { z } from "zod";

export const PAPEL_RESPONSAVEL_VALUES = [
  "PROJETO_ARQUITETONICO",
  "PROJETO_ESTRUTURAL",
  "PROJETO_COMPLEMENTAR",
  "EXECUCAO",
] as const;

export const TIPO_DOCUMENTO_RESPONSABILIDADE_VALUES = ["ART", "RRT", "TRT"] as const;

export const criarResponsavelObraPrivadaSchema = z.object({
  profissionalTecnicoId: z.string().uuid("Selecione o profissional técnico."),
  papel: z.enum(PAPEL_RESPONSAVEL_VALUES),
  tipoDocumento: z.enum(TIPO_DOCUMENTO_RESPONSABILIDADE_VALUES),
  numeroDocumento: z.string().trim().min(1, "Informe o número do documento."),
  dataDocumento: z.string().optional(),
  dataInicio: z.string().optional(),
});

export const baixarResponsavelObraPrivadaSchema = z.object({
  dataBaixa: z.string().min(1, "Informe a data da baixa."),
  motivoBaixa: z.string().trim().min(1, "Informe o motivo da baixa."),
});

export type CriarResponsavelObraPrivadaInput = z.infer<
  typeof criarResponsavelObraPrivadaSchema
>;
export type BaixarResponsavelObraPrivadaInput = z.infer<
  typeof baixarResponsavelObraPrivadaSchema
>;
