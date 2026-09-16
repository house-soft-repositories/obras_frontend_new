import { z } from "zod";
import { tipoObraSchema } from "./tipo_obra";

const optionalUuid = z.string().uuid().or(z.literal(""));
const optionalText = z.string();
const optionalDate = z.string();
const optionalNumericText = z
  .string()
  .refine(
    (value) => value.trim() === "" || Number.isFinite(Number(value)),
    "Informe um valor numérico.",
  );
const obraPayloadOrcamentoSchema = z.object({
  fonteId: z.string().uuid("Selecione a fonte."),
  valor: z.string().regex(/^\d+(\.\d{2})?$/, "Informe um valor válido."),
});

const tipoFinanciamentoSchema = z.enum([
  "COM_OGU",
  "SEM_OGU",
  "INVESTIMENTO_PRIVADO",
]);
const modoDuracaoSchema = z.enum([
  "DEFINIDO_PELO_USUARIO",
  "ESTAGIO_ATUAL",
  "TOTAL_ATIVIDADES",
  "EXECUCAO_CONTRATO",
]);
const acaoConveniadaSchema = z.enum(["NAO", "FEDERAL", "ESTADUAL"]);

export const criarObraFormularioSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "Informe o nome com pelo menos 2 caracteres."),
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
    tipoFinanciamento: tipoFinanciamentoSchema,
    modoDuracao: modoDuracaoSchema,
    dataInicio: optionalDate,
    dataPrazo: optionalDate,
    acaoConveniada: acaoConveniadaSchema,
    prioritaria: z.boolean(),
    unidadeMedida: optionalText,
    quantidade: optionalNumericText,
    programaPpa: optionalText,
    secretario: optionalText,
    dataPactuada: optionalDate,
    orcamentos: z
      .array(
        z.object({
          fonteId: z.uuid("Selecione a fonte."),
          valorCentavos: z.number("Informe um valor válido."),
        }),
      )
      .min(1, "Adicione ao menos um orçamento."),
  })
  .superRefine((form, context) => {
    if (form.tipo !== "OBRA" && form.subclassificacaoId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subclassificacaoId"],
        message:
          "Subclassificação é permitida somente para obras do tipo OBRA.",
      });
    }
  })
  .transform((form) => ({
    nome: form.nome,
    tipo: form.tipo,
    responsavelUsuarioId: form.responsavelUsuarioId,
    orgaoId: form.orgaoId,
    orcamentos: form.orcamentos.map(({ fonteId, valorCentavos }) => ({
      fonteId,
      valor: (Number(valorCentavos) / 100).toFixed(2),
    })),
    ...(form.setorId ? { setorId: form.setorId } : {}),
    ...(form.localidadeId ? { localidadeId: form.localidadeId } : {}),
    ...(form.tipo === "OBRA" && form.subclassificacaoId
      ? { subclassificacaoId: form.subclassificacaoId }
      : {}),
    ...(form.eixoId ? { eixoId: form.eixoId } : {}),
    ...(form.classificacaoId ? { classificacaoId: form.classificacaoId } : {}),
    ...(form.tipologiaId ? { tipologiaId: form.tipologiaId } : {}),
    ...(form.subtipologiaId ? { subtipologiaId: form.subtipologiaId } : {}),
    ...(form.descricao.trim() ? { descricao: form.descricao.trim() } : {}),
    tipoFinanciamento: form.tipoFinanciamento,
    modoDuracao: form.modoDuracao,
    acaoConveniada: form.acaoConveniada,
    prioritaria: form.prioritaria,
    ...(form.dataInicio ? { dataInicio: form.dataInicio } : {}),
    ...(form.dataPrazo ? { dataPrazo: form.dataPrazo } : {}),
    ...(form.unidadeMedida.trim()
      ? { unidadeMedida: form.unidadeMedida.trim() }
      : {}),
    ...(form.quantidade.trim() ? { quantidade: form.quantidade.trim() } : {}),
    ...(form.programaPpa.trim()
      ? { programaPpa: form.programaPpa.trim() }
      : {}),
    ...(form.secretario.trim() ? { secretario: form.secretario.trim() } : {}),
    ...(form.dataPactuada ? { dataPactuada: form.dataPactuada } : {}),
    seguirAutomatico: form.seguirAutomatico,
  }));

export type CriarObraFormularioInput = z.input<
  typeof criarObraFormularioSchema
>;
export type CriarObraOutput = z.output<typeof criarObraFormularioSchema>;
export const criarObraSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome com pelo menos 2 caracteres."),
  tipo: tipoObraSchema,
  responsavelUsuarioId: z.string().uuid("Selecione o responsável."),
  orgaoId: z.string().uuid("Selecione o órgão."),
  orcamentos: z
    .array(obraPayloadOrcamentoSchema)
    .min(1, "Adicione ao menos um orçamento."),
  setorId: z.string().uuid().optional(),
  localidadeId: z.string().uuid().optional(),
  subclassificacaoId: z.string().uuid().optional(),
  eixoId: z.string().uuid().optional(),
  classificacaoId: z.string().uuid().optional(),
  tipologiaId: z.string().uuid().optional(),
  subtipologiaId: z.string().uuid().optional(),
  descricao: z.string().optional(),
  seguirAutomatico: z.boolean(),
  tipoFinanciamento: tipoFinanciamentoSchema,
  modoDuracao: modoDuracaoSchema,
  dataInicio: z.string().optional(),
  dataPrazo: z.string().optional(),
  acaoConveniada: acaoConveniadaSchema,
  prioritaria: z.boolean(),
  unidadeMedida: z.string().optional(),
  quantidade: z.string().optional(),
  programaPpa: z.string().optional(),
  secretario: z.string().optional(),
  dataPactuada: z.string().optional(),
});
export type CriarObraInput = z.infer<typeof criarObraSchema>;
