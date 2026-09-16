import { z } from "zod";

const optionalUuid = z.string().uuid().or(z.literal(""));
const optionalText = z.string();

export const criarObraPrivadaFormularioSchema = z
  .object({
    descricao: z
      .string()
      .trim()
      .min(3, "Informe a descrição com pelo menos 3 caracteres."),
    observacoes: optionalText,
    proprietarioPessoaId: z.string().uuid("Selecione o proprietário."),
    orgaoId: optionalUuid,
    localidadeId: optionalUuid,
    inscricaoImobiliaria: optionalText,
    matriculaRgi: optionalText,
    cartorio: optionalText,
    cep: optionalText,
    logradouro: z
      .string()
      .trim()
      .min(3, "Informe o logradouro com pelo menos 3 caracteres."),
    numero: optionalText,
    complemento: optionalText,
    bairro: optionalText,
    uf: z
      .string()
      .trim()
      .length(2, "Informe a UF com 2 letras.")
      .transform((value) => value.toUpperCase()),
    latitude: optionalText,
    longitude: optionalText,
    geoOrigem: optionalText,
    andamento: optionalText,
    habiteSe: optionalText,
    dataInicio: optionalText,
    dataPrevistaConclusao: optionalText,
  })
  .transform((form) => ({
    descricao: form.descricao.trim(),
    proprietarioPessoaId: form.proprietarioPessoaId,
    logradouro: form.logradouro.trim(),
    uf: form.uf,
    ...(form.observacoes.trim()
      ? { observacoes: form.observacoes.trim() }
      : {}),
    ...(form.orgaoId ? { orgaoId: form.orgaoId } : {}),
    ...(form.localidadeId ? { localidadeId: form.localidadeId } : {}),
    ...(form.inscricaoImobiliaria.trim()
      ? { inscricaoImobiliaria: form.inscricaoImobiliaria.trim() }
      : {}),
    ...(form.matriculaRgi.trim()
      ? { matriculaRgi: form.matriculaRgi.trim() }
      : {}),
    ...(form.cartorio.trim() ? { cartorio: form.cartorio.trim() } : {}),
    ...(form.cep.trim() ? { cep: form.cep.trim() } : {}),
    ...(form.numero.trim() ? { numero: form.numero.trim() } : {}),
    ...(form.complemento.trim()
      ? { complemento: form.complemento.trim() }
      : {}),
    ...(form.bairro.trim() ? { bairro: form.bairro.trim() } : {}),
    ...(form.latitude.trim() ? { latitude: form.latitude.trim() } : {}),
    ...(form.longitude.trim() ? { longitude: form.longitude.trim() } : {}),
    ...(form.geoOrigem.trim() ? { geoOrigem: form.geoOrigem.trim() } : {}),
    ...(form.andamento ? { andamento: form.andamento } : {}),
    ...(form.habiteSe ? { habiteSe: form.habiteSe } : {}),
    ...(form.dataInicio ? { dataInicio: form.dataInicio } : {}),
    ...(form.dataPrevistaConclusao
      ? { dataPrevistaConclusao: form.dataPrevistaConclusao }
      : {}),
  }));

export type CriarObraPrivadaFormularioInput = z.input<
  typeof criarObraPrivadaFormularioSchema
>;
export type CriarObraPrivadaOutput = z.output<
  typeof criarObraPrivadaFormularioSchema
>;

export const criarObraPrivadaSchema = z.object({
  descricao: z.string().trim().min(3, "Informe a descrição da obra."),
  proprietarioPessoaId: z.string().uuid("Selecione o proprietário."),
  logradouro: z.string().trim().min(3, "Informe o logradouro."),
  uf: z.string().trim().length(2, "Informe a UF com 2 letras."),
  observacoes: z.string().optional(),
  orgaoId: z.string().uuid().optional(),
  localidadeId: z.string().uuid().optional(),
  inscricaoImobiliaria: z.string().optional(),
  matriculaRgi: z.string().optional(),
  cartorio: z.string().optional(),
  cep: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  geoOrigem: z.string().optional(),
  andamento: z.string().optional(),
  habiteSe: z.string().optional(),
  dataInicio: z.string().optional(),
  dataPrevistaConclusao: z.string().optional(),
});

export type CriarObraPrivadaInput = z.infer<typeof criarObraPrivadaSchema>;
