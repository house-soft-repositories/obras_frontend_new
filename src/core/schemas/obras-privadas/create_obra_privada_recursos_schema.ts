import { z } from "zod";

export const TIPO_ALVARA_VALUES = [
  "CONSTRUCAO",
  "REFORMA",
  "AMPLIACAO",
  "DEMOLICAO",
  "REGULARIZACAO",
  "MURO_TAPUME",
] as const;

export const MOTIVO_ALVARA_VALUES = [
  "ORIGINAL",
  "REVALIDACAO",
  "PRORROGACAO",
  "SEGUNDA_VIA",
] as const;

export const SITUACAO_REGISTRO_ALVARA_VALUES = [
  "VIGENTE",
  "SUBSTITUIDO",
  "VENCIDO",
  "INDEFERIDO",
] as const;

export const USO_EDIFICACAO_VALUES = [
  "RESIDENCIAL_UNIFAMILIAR",
  "RESIDENCIAL_MULTIFAMILIAR",
  "COMERCIAL",
  "INDUSTRIAL",
  "MISTO",
  "OUTRO",
] as const;

export const RESULTADO_HABITE_SE_VALUES = ["APROVADO", "REPROVADO"] as const;

export const TIPO_FISCALIZACAO_VALUES = [
  "ROTINA",
  "DENUNCIA",
  "ENTULHO",
  "VERIFICACAO_ALVARA",
  "VISTORIA_HABITE_SE",
  "REINCIDENCIA",
] as const;

export const RESULTADO_FISCALIZACAO_VALUES = [
  "REGULAR",
  "IRREGULAR",
  "NAO_LOCALIZADA",
  "SEM_ACESSO",
] as const;

export const LOCAL_ENTULHO_VALUES = [
  "VIA_PUBLICA",
  "PASSEIO",
  "TERRENO_VIZINHO",
  "CANTEIRO",
  "AREA_PROTEGIDA",
] as const;

export const ETAPA_OBRA_PRIVADA_VALUES = [
  "NAO_INICIADA",
  "FUNDACAO",
  "ESTRUTURA",
  "ALVENARIA",
  "COBERTURA",
  "INSTALACOES",
  "ACABAMENTO",
  "CONCLUIDA",
] as const;

export const TIPO_AUTO_INFRACAO_VALUES = [
  "NOTIFICACAO",
  "AUTO_INFRACAO",
  "EMBARGO",
  "INTERDICAO",
  "MULTA",
] as const;

export const SITUACAO_AUTO_INFRACAO_VALUES = [
  "ABERTO",
  "CUMPRIDO",
  "EM_RECURSO",
  "CANCELADO",
  "QUITADO",
] as const;

const optionalUuid = z.string().uuid().or(z.literal(""));
const optionalText = z.string();

function optionalIntField(fieldLabel: string, min = 0) {
  return optionalText.transform((value, ctx) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed < min) {
      ctx.addIssue({
        code: "custom",
        message: `${fieldLabel} deve ser um número inteiro maior ou igual a ${min}.`,
      });
      return z.NEVER;
    }
    return parsed;
  });
}

function optionalUuidField() {
  return optionalUuid.transform((value) => (value ? value : undefined));
}

function optionalEnumField<T extends readonly [string, ...string[]]>(
  values: T,
) {
  return z
    .enum(values)
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value));
}

function optionalBooleanField() {
  return z
    .enum(["", "true", "false"])
    .transform((value) =>
      value === "" ? undefined : value === "true" ? true : false,
    );
}

// ---------------------------------------------------------------------------
// Arquivo inline (contrato novo: POST de criação recebe metadados em
// 'arquivo' e responde com 'arquivoUpload' pré-assinado)
// ---------------------------------------------------------------------------

export const CATEGORIA_ARQUIVO_UPLOAD_VALUES = [
  "FOTO",
  "DOCUMENTO",
  "PROJETO",
] as const;

export const arquivoUploadItemSchema = z.object({
  nomeOriginal: z.string().trim().min(1, "Informe o nome do arquivo."),
  nome: z.string().trim().min(1).optional(),
  descricao: z.string().optional(),
  categoria: z.enum(CATEGORIA_ARQUIVO_UPLOAD_VALUES).optional(),
  mimeType: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  capturadoEm: z.string().optional(),
  ordem: z.number().int().min(0).optional(),
});

export type ArquivoUploadItemInput = z.infer<typeof arquivoUploadItemSchema>;

// ---------------------------------------------------------------------------
// Alvará
// ---------------------------------------------------------------------------

export const criarAlvaraFormularioSchema = z.object({
  ano: z
    .string()
    .trim()
    .min(1, "Informe o ano.")
    .transform((value, ctx) => {
      const parsed = Number(value.trim());
      if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
        ctx.addIssue({
          code: "custom",
          message: "Informe um ano válido entre 1900 e 2100.",
        });
        return z.NEVER;
      }
      return parsed;
    }),
  tipo: z.enum(TIPO_ALVARA_VALUES, "Selecione o tipo do alvará."),
  numero: optionalText,
  motivo: optionalEnumField(MOTIVO_ALVARA_VALUES),
  situacao: optionalEnumField(SITUACAO_REGISTRO_ALVARA_VALUES),
  dataEmissao: optionalText,
  dataValidade: optionalText,
  alvaraAnteriorId: optionalUuidField(),
  areaTerrenoM2: optionalText,
  areaConstruidaAprovadaM2: optionalText,
  uso: optionalEnumField(USO_EDIFICACAO_VALUES),
  pavimentos: optionalIntField("Pavimentos"),
  unidades: optionalIntField("Unidades"),
  processoAdministrativo: optionalText,
  arquivo: arquivoUploadItemSchema.optional(),
  observacoes: optionalText,
});

export const criarAlvaraSchema = z.object({
  ano: z.number().int().min(1900).max(2100),
  tipo: z.enum(TIPO_ALVARA_VALUES),
  numero: z.string().optional(),
  motivo: z.enum(MOTIVO_ALVARA_VALUES).optional(),
  situacao: z.enum(SITUACAO_REGISTRO_ALVARA_VALUES).optional(),
  dataEmissao: z.string().optional(),
  dataValidade: z.string().optional(),
  alvaraAnteriorId: z.string().uuid().optional(),
  areaTerrenoM2: z.string().optional(),
  areaConstruidaAprovadaM2: z.string().optional(),
  uso: z.enum(USO_EDIFICACAO_VALUES).optional(),
  pavimentos: z.number().int().min(0).optional(),
  unidades: z.number().int().min(0).optional(),
  processoAdministrativo: z.string().optional(),
  arquivo: arquivoUploadItemSchema.optional(),
  observacoes: z.string().optional(),
});

export type CriarAlvaraFormularioInput = z.input<
  typeof criarAlvaraFormularioSchema
>;
export type CriarAlvaraInput = z.infer<typeof criarAlvaraSchema>;

// ---------------------------------------------------------------------------
// Habite-se
// ---------------------------------------------------------------------------

export const criarHabiteSeFormularioSchema = z.object({
  numero: z.string().trim().min(1, "Informe o número do habite-se."),
  resultado: z.enum(RESULTADO_HABITE_SE_VALUES, "Selecione o resultado."),
  dataEmissao: optionalText,
  parcial: z.boolean(),
  descricaoParcial: optionalText,
  dataVistoria: optionalText,
  vistoriadorUsuarioId: optionalUuidField(),
  fiscalizacaoId: optionalUuidField(),
  areaConstruidaExecutadaM2: optionalText,
  divergenciaProjeto: z.boolean(),
  divergenciaDescricao: optionalText,
  parecer: optionalText,
  arquivo: arquivoUploadItemSchema.optional(),
});

export const criarHabiteSeSchema = z.object({
  numero: z.string().trim().min(1, "Informe o número do habite-se."),
  resultado: z.enum(RESULTADO_HABITE_SE_VALUES),
  dataEmissao: z.string().optional(),
  parcial: z.boolean().optional(),
  descricaoParcial: z.string().optional(),
  dataVistoria: z.string().optional(),
  vistoriadorUsuarioId: z.string().uuid().optional(),
  fiscalizacaoId: z.string().uuid().optional(),
  areaConstruidaExecutadaM2: z.string().optional(),
  divergenciaProjeto: z.boolean().optional(),
  divergenciaDescricao: z.string().optional(),
  parecer: z.string().optional(),
  arquivo: arquivoUploadItemSchema.optional(),
});

export type CriarHabiteSeFormularioInput = z.input<
  typeof criarHabiteSeFormularioSchema
>;
export type CriarHabiteSeInput = z.infer<typeof criarHabiteSeSchema>;

// ---------------------------------------------------------------------------
// Fiscalização
// ---------------------------------------------------------------------------

export const criarFiscalizacaoFormularioSchema = z.object({
  tipo: z.enum(TIPO_FISCALIZACAO_VALUES, "Selecione o tipo."),
  dataFiscalizacao: z
    .string()
    .trim()
    .min(1, "Informe a data da fiscalização."),
  resultado: z.enum(RESULTADO_FISCALIZACAO_VALUES, "Selecione o resultado."),
  etapaConstatada: optionalEnumField(ETAPA_OBRA_PRIVADA_VALUES),
  constatacoes: optionalText,
  providencias: optionalText,
  latitude: optionalText,
  longitude: optionalText,
  entulhoHaIrregularidade: optionalBooleanField(),
  entulhoVolumeEstimadoM3: optionalText,
  entulhoLocal: optionalEnumField(LOCAL_ENTULHO_VALUES),
  entulhoPossuiCacamba: optionalBooleanField(),
  entulhoPossuiPgrcc: optionalBooleanField(),
  entulhoDestinacao: optionalText,
});

export const criarFiscalizacaoSchema = z.object({
  tipo: z.enum(TIPO_FISCALIZACAO_VALUES),
  dataFiscalizacao: z.string().trim().min(1, "Informe a data da fiscalização."),
  resultado: z.enum(RESULTADO_FISCALIZACAO_VALUES),
  etapaConstatada: z.enum(ETAPA_OBRA_PRIVADA_VALUES).optional(),
  constatacoes: z.string().optional(),
  providencias: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  entulhoHaIrregularidade: z.boolean().optional(),
  entulhoVolumeEstimadoM3: z.string().optional(),
  entulhoLocal: z.enum(LOCAL_ENTULHO_VALUES).optional(),
  entulhoPossuiCacamba: z.boolean().optional(),
  entulhoPossuiPgrcc: z.boolean().optional(),
  entulhoDestinacao: z.string().optional(),
});

export type CriarFiscalizacaoFormularioInput = z.input<
  typeof criarFiscalizacaoFormularioSchema
>;
export type CriarFiscalizacaoInput = z.infer<typeof criarFiscalizacaoSchema>;

// ---------------------------------------------------------------------------
// Auto de infração
// ---------------------------------------------------------------------------

export const criarAutoFormularioSchema = z.object({
  tipo: z.enum(TIPO_AUTO_INFRACAO_VALUES, "Selecione o tipo do auto."),
  dataEmissao: z.string().trim().min(1, "Informe a data de emissão."),
  descricao: z
    .string()
    .trim()
    .min(3, "Informe a descrição com pelo menos 3 caracteres."),
  fiscalizacaoId: optionalUuidField(),
  prazoDias: optionalIntField("Prazo em dias"),
  baseLegal: optionalText,
  valorMulta: optionalText,
  situacao: optionalEnumField(SITUACAO_AUTO_INFRACAO_VALUES),
  dataEncerramento: optionalText,
  observacoes: optionalText,
});

export const criarAutoSchema = z.object({
  tipo: z.enum(TIPO_AUTO_INFRACAO_VALUES),
  dataEmissao: z.string().trim().min(1, "Informe a data de emissão."),
  descricao: z.string().trim().min(3, "Informe a descrição do auto."),
  fiscalizacaoId: z.string().uuid().optional(),
  prazoDias: z.number().int().min(0).optional(),
  baseLegal: z.string().optional(),
  valorMulta: z.string().optional(),
  situacao: z.enum(SITUACAO_AUTO_INFRACAO_VALUES).optional(),
  dataEncerramento: z.string().optional(),
  observacoes: z.string().optional(),
});

export type CriarAutoFormularioInput = z.input<typeof criarAutoFormularioSchema>;
export type CriarAutoInput = z.infer<typeof criarAutoSchema>;

// ---------------------------------------------------------------------------
// Helpers de limpeza (form -> payload)
// ---------------------------------------------------------------------------

function cleanStringRecord(
  record: Record<string, unknown>,
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) cleaned[key] = trimmed;
      continue;
    }
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function cleanArquivoUploadItem(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const cleaned = cleanStringRecord(value as Record<string, unknown>);
  if (!cleaned.nomeOriginal) return undefined;
  return cleaned;
}

function cleanRecursoPayload(
  form: Record<string, unknown>,
): Record<string, unknown> {
  const { arquivo, ...rest } = form;
  const cleaned = cleanStringRecord(rest);
  const arquivoLimpo = cleanArquivoUploadItem(arquivo);
  if (arquivoLimpo) cleaned.arquivo = arquivoLimpo;
  return cleaned;
}

export function toCriarAlvaraPayload(
  form: Record<string, unknown>,
): Record<string, unknown> {
  return cleanRecursoPayload(form);
}

export function toCriarHabiteSePayload(
  form: Record<string, unknown>,
): Record<string, unknown> {
  return cleanRecursoPayload(form);
}

export function toCriarFiscalizacaoPayload(
  form: Record<string, unknown>,
): Record<string, unknown> {
  return cleanStringRecord(form);
}

export function toCriarAutoPayload(
  form: Record<string, unknown>,
): Record<string, unknown> {
  return cleanStringRecord(form);
}
