import { z } from "zod";
import { tipoObraSchema } from "./tipo_obra";

const optionalUuid = z.string().uuid().or(z.literal(""));
const optionalText = z.string();
const moneyInput = z.string().regex(/^\d+$/, "Informe um valor válido.").refine((value) => Number(value) > 0, "Informe um valor maior que zero.");

export const criarObraFormularioSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome com pelo menos 2 caracteres."),
  tipo: tipoObraSchema,
  descricao: optionalText,
  responsavelUsuarioId: z.string().uuid("Selecione o responsável."),
  orgaoId: z.string().uuid("Selecione o órgão."),
  setorId: optionalUuid,
  localidadeId: optionalUuid,
  eixoId: optionalUuid,
  classificacaoId: optionalUuid,
  subclassificacaoId: optionalUuid,
  tipologiaId: optionalUuid,
  subtipologiaId: optionalUuid,
  seguirAutomatico: z.boolean(),
  orcamentos: z.array(z.object({ fonteId: z.string().uuid("Selecione a fonte."), valorCentavos: moneyInput })).min(1, "Adicione ao menos um orçamento."),
}).superRefine((form, context) => {
  if (form.tipo !== "OBRA" && form.subclassificacaoId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["subclassificacaoId"],
      message: "Subclassificação é permitida somente para obras do tipo OBRA.",
    });
  }
}).transform((form) => ({
  nome: form.nome,
  tipo: form.tipo,
  responsavelUsuarioId: form.responsavelUsuarioId,
  orgaoId: form.orgaoId,
  orcamentos: form.orcamentos.map(({ fonteId, valorCentavos }) => ({ fonteId, valor: (Number(valorCentavos) / 100).toFixed(2) })),
  ...(form.setorId ? { setorId: form.setorId } : {}),
  ...(form.localidadeId ? { localidadeId: form.localidadeId } : {}),
  ...(form.tipo === "OBRA" && form.subclassificacaoId ? { subclassificacaoId: form.subclassificacaoId } : {}),
  ...(form.eixoId ? { eixoId: form.eixoId } : {}),
  ...(form.classificacaoId ? { classificacaoId: form.classificacaoId } : {}),
  ...(form.tipologiaId ? { tipologiaId: form.tipologiaId } : {}),
  ...(form.subtipologiaId ? { subtipologiaId: form.subtipologiaId } : {}),
  ...(form.descricao.trim() ? { descricao: form.descricao.trim() } : {}),
  seguirAutomatico: form.seguirAutomatico,
}));

export type CriarObraFormularioInput = z.input<typeof criarObraFormularioSchema>;
export type CriarObraOutput = z.output<typeof criarObraFormularioSchema>;
export const criarObraSchema = criarObraFormularioSchema;
export type CriarObraInput = CriarObraOutput;
