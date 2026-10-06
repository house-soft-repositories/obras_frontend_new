import { z } from "zod";

export const SITUACAO_ALVARA_VALUES = [
  "SEM_ALVARA",
  "COM_ALVARA_VIGENTE",
  "COM_ALVARA_VENCIDO",
  "DISPENSADA",
] as const;

export const SITUACAO_ALVARA_LABELS: Record<string, string> = {
  SEM_ALVARA: "Sem alvará",
  COM_ALVARA_VIGENTE: "Alvará vigente",
  COM_ALVARA_VENCIDO: "Alvará vencido",
  DISPENSADA: "Dispensada",
};

export const ANDAMENTO_VALUES = [
  "NAO_INICIADA",
  "EM_ANDAMENTO",
  "PARALISADA",
  "CONCLUIDA",
  "DEMOLIDA",
  "CANCELADA",
] as const;

export const ANDAMENTO_LABELS: Record<string, string> = {
  NAO_INICIADA: "Não iniciada",
  EM_ANDAMENTO: "Em andamento",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
  DEMOLIDA: "Demolida",
  CANCELADA: "Cancelada",
};

export const HABITE_SE_VALUES = [
  "NAO_SOLICITADO",
  "SOLICITADO",
  "APROVADO",
  "REPROVADO",
] as const;

export const HABITE_SE_LABELS: Record<string, string> = {
  NAO_SOLICITADO: "Não emitido",
  SOLICITADO: "Solicitado",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
};

export const TIPO_ALVARA_LABELS: Record<string, string> = {
  CONSTRUCAO: "Construção",
  REFORMA: "Reforma",
  AMPLIACAO: "Ampliação",
  DEMOLICAO: "Demolição",
  REGULARIZACAO: "Regularização",
  MURO_TAPUME: "Muro/tapume",
};

export const SITUACAO_REGISTRO_ALVARA_LABELS: Record<string, string> = {
  VIGENTE: "Vigente",
  SUBSTITUIDO: "Substituído",
  VENCIDO: "Vencido",
  INDEFERIDO: "Indeferido",
};

export const TIPO_FISCALIZACAO_LABELS: Record<string, string> = {
  ROTINA: "Rotina",
  DENUNCIA: "Denúncia",
  ENTULHO: "Entulho",
  VERIFICACAO_ALVARA: "Verificação de alvará",
  VISTORIA_HABITE_SE: "Vistoria habite-se",
  REINCIDENCIA: "Reincidência",
};

export const RESULTADO_FISCALIZACAO_LABELS: Record<string, string> = {
  REGULAR: "Regular",
  IRREGULAR: "Irregular",
  NAO_LOCALIZADA: "Não localizada",
  SEM_ACESSO: "Sem acesso",
};

export const TIPO_AUTO_INFRACAO_LABELS: Record<string, string> = {
  NOTIFICACAO: "Notificação",
  AUTO_INFRACAO: "Auto de infração",
  EMBARGO: "Embargo",
  INTERDICAO: "Interdição",
  MULTA: "Multa",
};

export const SITUACAO_AUTO_INFRACAO_LABELS: Record<string, string> = {
  ABERTO: "Aberto",
  CUMPRIDO: "Cumprido",
  EM_RECURSO: "Em recurso",
  CANCELADO: "Cancelado",
  QUITADO: "Quitado",
};

export const PAPEL_RESPONSAVEL_LABELS: Record<string, string> = {
  PROJETO_ARQUITETONICO: "Projeto arquitetônico",
  PROJETO_ESTRUTURAL: "Projeto estrutural",
  PROJETO_COMPLEMENTAR: "Projeto complementar",
  EXECUCAO: "Execução",
};

export const RESULTADO_HABITE_SE_LABELS: Record<string, string> = {
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
};

export const obraPrivadaSchema = z
  .object({
    id: z.string(),
    codigo: z.string().optional(),
    descricao: z.string().optional(),
    proprietarioPessoaId: z.string().optional(),
    proprietarioNome: z.string().optional(),
    proprietarioDocumento: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    uf: z.string().optional(),
    situacaoAlvara: z.string().optional(),
    andamento: z.string().optional(),
    habiteSe: z.string().optional(),
    etapaAtual: z.string().nullable().optional(),
    ultimaVisitaEm: z.string().nullable().optional(),
    fiscalizada: z.boolean().optional(),
    autuada: z.boolean().optional(),
    embargada: z.boolean().optional(),
    deletedAt: z.unknown().optional(),
  })
  .passthrough();

export const obraPrivadaListSchema = z.object({
  data: z.array(obraPrivadaSchema),
  meta: z.object({
    page: z.number(),
    take: z.number(),
    itemCount: z.number(),
    pageCount: z.number(),
    hasPreviousPage: z.boolean(),
    hasNextPage: z.boolean(),
  }),
});

export type ObraPrivada = z.infer<typeof obraPrivadaSchema>;
export type ObraPrivadaList = z.infer<typeof obraPrivadaListSchema>;

export interface Paginated<T> {
  data: T[];
  meta: ObraPrivadaList["meta"];
}

export interface ArquivoUploadResposta {
  arquivoId: string;
  nome: string;
  urlUpload: string;
}

export interface AlvaraPrivado {
  id: string;
  numero?: string | null;
  ano?: number | null;
  tipo?: string | null;
  motivo?: string | null;
  situacao?: string | null;
  dataEmissao?: string | null;
  dataValidade?: string | null;
  areaConstruidaAprovadaM2?: string | null;
  uso?: string | null;
  processoAdministrativo?: string | null;
  observacoes?: string | null;
  arquivoUpload?: ArquivoUploadResposta | null;
}

export interface FiscalizacaoPrivada {
  id: string;
  numero?: string | null;
  tipo?: string | null;
  dataFiscalizacao?: string | null;
  resultado?: string | null;
  etapaConstatada?: string | null;
  constatacoes?: string | null;
  providencias?: string | null;
}

export interface AutoInfracaoPrivado {
  id: string;
  numero?: string | null;
  fiscalizacaoId?: string | null;
  tipo?: string | null;
  dataEmissao?: string | null;
  prazoDias?: number | null;
  dataLimite?: string | null;
  baseLegal?: string | null;
  descricao?: string | null;
  valorMulta?: string | null;
  situacao?: string | null;
}

export interface HabiteSePrivado {
  id: string;
  numero?: string | null;
  dataEmissao?: string | null;
  parcial?: boolean | null;
  descricaoParcial?: string | null;
  dataVistoria?: string | null;
  resultado?: string | null;
  areaConstruidaExecutadaM2?: string | null;
  divergenciaProjeto?: boolean | null;
  divergenciaDescricao?: string | null;
  parecer?: string | null;
  arquivoUpload?: ArquivoUploadResposta | null;
}

export interface ResponsavelPrivado {
  id: string;
  profissionalTecnicoId?: string | null;
  profissionalNome?: string | null;
  nome?: string | null;
  papel?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  dataDocumento?: string | null;
  dataInicio?: string | null;
  dataBaixa?: string | null;
  motivoBaixa?: string | null;
}

export interface ObservacaoPrivada {
  id: string;
  texto?: string | null;
  createdAt?: string | null;
}

export interface ArquivoPrivado {
  id: string;
  nome?: string | null;
  nomeOriginal?: string | null;
  descricao?: string | null;
  vinculo?: string | null;
  vinculoId?: string | null;
  categoria?: string | null;
  mimeType?: string | null;
  tamanhoBytes?: number | null;
  capturadoEm?: string | null;
  createdAt?: string | null;
}

export interface FiscalizacaoGlobalPrivada extends FiscalizacaoPrivada {
  obraPrivadaId: string;
  obraCodigo?: string | null;
  obraEndereco?: string | null;
  fiscalUsuarioId?: string | null;
}

export interface AutoGlobalPrivado extends AutoInfracaoPrivado {
  obraPrivadaId: string;
  obraCodigo?: string | null;
  obraEndereco?: string | null;
}

export interface LicenciamentoPrivado {
  obraPrivadaId: string;
  obraCodigo?: string | null;
  obraEndereco?: string | null;
  proprietarioNome?: string | null;
  situacaoAlvara?: string | null;
  habiteSe?: string | null;
  alvaraNumero?: string | null;
  alvaraTipo?: string | null;
  alvaraDataValidade?: string | null;
  diasAteVencimento?: number | null;
}
