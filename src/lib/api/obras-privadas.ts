/**
 * Cliente do ObrasPrivadasContext. Usa `proxyJson` de
 * `components/cadastros/proxy-cadastros.ts` — a variante que ja converte o
 * `message` do Nest em texto exibivel e trata 204 sem corpo — em vez do helper
 * duplicado dos `lib/api/*.ts` mais antigos.
 *
 * Tipos escritos a mao (e nao extraidos de `types.gen.ts`) apenas onde o
 * OpenAPI nao descreve o retorno: o Nest nao anota os DTOs de resposta destes
 * endpoints, entao o gerador produziria `unknown`.
 */
import { proxyJson } from "@/components/cadastros/proxy-cadastros";

// ---------------------------------------------------------------- tipos

export type TipoPessoaApi = "FISICA" | "JURIDICA";

export interface PessoaSugestao {
  id: string;
  nome: string;
  documento: string;
  tipo: TipoPessoaApi;
  registroProfissional: string | null;
}

export interface Pessoa {
  id: string;
  tipo: TipoPessoaApi;
  documento: string;
  nome: string;
  nomeFantasia: string | null;
  rg: string | null;
  orgaoExpedidor: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  ativo: boolean;
}

export interface ProfissionalTecnico {
  id: string;
  pessoaId: string;
  nome: string;
  documento: string;
  conselho: string;
  numeroRegistro: string;
  ufRegistro: string | null;
  titulo: string | null;
  ativo: boolean;
  registro: string;
}

export interface ItemListaObraPrivada {
  id: string;
  codigo: string;
  logradouro: string;
  numero: string | null;
  bairro: string | null;
  uf: string;
  latitude: string | null;
  longitude: string | null;
  proprietarioNome: string;
  proprietarioDocumento: string;
  situacaoAlvara: string;
  andamento: string;
  habiteSe: string;
  etapaAtual: string | null;
  ultimaVisitaEm: string | null;
  diasSemVisita: number | null;
  fiscalizada: boolean;
  autuada: boolean;
  embargada: boolean;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ObraPrivada {
  id: string;
  codigo: string;
  descricao: string;
  observacoes: string | null;
  proprietarioPessoaId: string;
  orgaoId: string | null;
  inscricaoImobiliaria: string | null;
  matriculaRgi: string | null;
  cartorio: string | null;
  cep: string | null;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  localidadeId: string | null;
  uf: string;
  latitude: string | null;
  longitude: string | null;
  geoOrigem: string;
  situacaoAlvara: string;
  andamento: string;
  habiteSe: string;
  dataInicio: string | null;
  dataPrevistaConclusao: string | null;
}

export interface ResponsavelDetalhe {
  id: string;
  profissionalTecnicoId: string;
  nome: string;
  documento: string;
  registro: string;
  titulo: string | null;
  papel: string;
  tipoDocumento: string;
  numeroDocumento: string;
  dataDocumento: string | null;
  arquivoId: string | null;
  dataInicio: string | null;
  dataBaixa: string | null;
  vigente: boolean;
}

export interface DerivadosObraPrivada {
  fiscalizada: boolean;
  autuada: boolean;
  embargada: boolean;
  autosAbertos: number;
  ultimaVisitaEm: string | null;
  diasSemVisita: number | null;
  etapaAtual: string | null;
  alvaraVigenteNumero: string | null;
  alvaraVigenteValidade: string | null;
  diasAteVencimentoAlvara: number | null;
}

export interface ObraPrivadaDetalhe {
  obra: ObraPrivada;
  proprietario: Pessoa | null;
  responsaveis: ResponsavelDetalhe[];
  derivados: DerivadosObraPrivada;
}

export interface Alvara {
  id: string;
  obraPrivadaId: string;
  numero: string | null;
  ano: number;
  tipo: string;
  motivo: string;
  situacao: string;
  dataEmissao: string | null;
  dataValidade: string | null;
  alvaraAnteriorId: string | null;
  areaTerrenoM2: string | null;
  areaConstruidaAprovadaM2: string | null;
  uso: string | null;
  pavimentos: number | null;
  unidades: number | null;
  processoAdministrativo: string | null;
  arquivoId: string | null;
  observacoes: string | null;
}

export interface HabiteSe {
  id: string;
  obraPrivadaId: string;
  numero: string;
  dataEmissao: string | null;
  parcial: boolean;
  descricaoParcial: string | null;
  dataVistoria: string | null;
  fiscalizacaoId: string | null;
  resultado: string;
  areaConstruidaExecutadaM2: string | null;
  divergenciaProjeto: boolean;
  divergenciaDescricao: string | null;
  parecer: string | null;
  arquivoId: string | null;
  areaAprovadaM2: string | null;
  excedenteM2: string | null;
}

export interface AutoResumo {
  id: string;
  numero: string;
  tipo: string;
  situacao: string;
}

export interface Fiscalizacao {
  id: string;
  obraPrivadaId: string;
  numero: string;
  tipo: string;
  dataFiscalizacao: string;
  fiscalUsuarioId: string;
  resultado: string;
  etapaConstatada: string | null;
  constatacoes: string | null;
  providencias: string | null;
  latitude: string | null;
  longitude: string | null;
  entulhoHaIrregularidade: boolean | null;
  entulhoVolumeEstimadoM3: string | null;
  entulhoLocal: string | null;
  entulhoPossuiCacamba: boolean | null;
  entulhoPossuiPgrcc: boolean | null;
  entulhoDestinacao: string | null;
  autos: AutoResumo[];
}

export interface AutoInfracao {
  id: string;
  obraPrivadaId: string;
  fiscalizacaoId: string | null;
  numero: string;
  tipo: string;
  dataEmissao: string;
  prazoDias: number | null;
  dataLimite: string | null;
  baseLegal: string | null;
  descricao: string;
  valorMulta: string | null;
  situacao: string;
  dataEncerramento: string | null;
  observacoes: string | null;
  lavradoPorUsuarioId: string;
  diasParaLimite: number | null;
  vencido: boolean;
  rotuloPrazo: string;
}

export interface EventoTimeline {
  tipo: string;
  data: string;
  titulo: string;
  autorUsuarioId: string | null;
  resumo: string;
  registroId: string;
}

export interface EtapaComData {
  etapa: string;
  data: string | null;
  concluida: boolean;
  atual: boolean;
}

export interface Observacao {
  id: string;
  texto: string;
  autorUsuarioId: string;
  criadoEm: string;
}

export interface ArquivoPrivado {
  id: string;
  obraPrivadaId: string;
  vinculo: string;
  vinculoId: string | null;
  categoria: string;
  nome: string;
  descricao: string | null;
  nomeOriginal: string;
  mimeType: string | null;
  tamanhoBytes: string | null;
  ordem: number;
  latitude: string | null;
  longitude: string | null;
  capturadoEm: string | null;
  criadoEm: string;
}

export interface UploadPreparado {
  arquivoId: string;
  nome: string;
  urlUpload: string;
}

export interface ItemListaFiscalizacao {
  id: string;
  numero: string;
  tipo: string;
  resultado: string;
  dataFiscalizacao: string;
  fiscalUsuarioId: string;
  etapaConstatada: string | null;
  obraPrivadaId: string;
  obraCodigo: string;
  obraEndereco: string;
}

export interface ItemListaAuto {
  id: string;
  numero: string;
  tipo: string;
  situacao: string;
  dataEmissao: string;
  prazoDias: number | null;
  dataLimite: string | null;
  valorMulta: string | null;
  obraPrivadaId: string;
  obraCodigo: string;
  obraEndereco: string;
}

export interface ItemListaLicenciamento {
  obraPrivadaId: string;
  obraCodigo: string;
  obraEndereco: string;
  proprietarioNome: string;
  situacaoAlvara: string;
  habiteSe: string;
  alvaraNumero: string | null;
  alvaraTipo: string | null;
  alvaraDataValidade: string | null;
  diasAteVencimento: number | null;
}

// ------------------------------------------------------------- helpers

/** Monta a query string ignorando vazios, para nao enviar `?bairro=`. */
export function montarQuery(
  filtros: Record<string, string | number | boolean | null | undefined>,
): string {
  const p = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor === null || valor === undefined || valor === "") continue;
    if (valor === false) continue;
    p.set(chave, String(valor));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

const json = (corpo: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(corpo),
});

const patch = (corpo: unknown): RequestInit => ({
  method: "PATCH",
  body: JSON.stringify(corpo),
});

// -------------------------------------------------------------- pessoas

export const buscarPessoas = (q: string, tipo?: TipoPessoaApi) =>
  proxyJson<PessoaSugestao[]>(
    `pessoas/busca${montarQuery({ q, tipo, limit: 10 })}`,
  );

export const listarPessoas = (filtros: {
  busca?: string;
  tipo?: TipoPessoaApi;
  page?: number;
  limit?: number;
}) => proxyJson<Pagina<Pessoa>>(`pessoas${montarQuery(filtros)}`);

export const criarPessoa = (corpo: Record<string, unknown>) =>
  proxyJson<Pessoa>("pessoas", json(corpo));

export const editarPessoa = (id: string, corpo: Record<string, unknown>) =>
  proxyJson<Pessoa>(`pessoas/${id}`, patch(corpo));

export const buscarProfissionais = (q: string) =>
  proxyJson<ProfissionalTecnico[]>(
    `profissionais-tecnicos/busca${montarQuery({ q, limit: 10 })}`,
  );

export const listarProfissionais = () =>
  proxyJson<ProfissionalTecnico[]>("profissionais-tecnicos");

export const criarProfissional = (corpo: Record<string, unknown>) =>
  proxyJson<ProfissionalTecnico>("profissionais-tecnicos", json(corpo));

// --------------------------------------------------------- obras privadas

export const listarObrasPrivadas = (
  filtros: Record<string, string | number | boolean | null | undefined>,
) =>
  proxyJson<Pagina<ItemListaObraPrivada>>(
    `obras-privadas${montarQuery(filtros)}`,
  );

export const detalharObraPrivada = (id: string) =>
  proxyJson<ObraPrivadaDetalhe>(`obras-privadas/${id}`);

export const criarObraPrivada = (corpo: Record<string, unknown>) =>
  proxyJson<ObraPrivada>("obras-privadas", json(corpo));

export const editarObraPrivada = (id: string, corpo: Record<string, unknown>) =>
  proxyJson<ObraPrivada>(`obras-privadas/${id}`, patch(corpo));

export const excluirObraPrivada = (id: string) =>
  proxyJson<void>(`obras-privadas/${id}`, { method: "DELETE" });

export const carregarTimeline = (id: string) =>
  proxyJson<EventoTimeline[]>(`obras-privadas/${id}/timeline`);

export const carregarEtapas = (id: string) =>
  proxyJson<EtapaComData[]>(`obras-privadas/${id}/etapas`);

export const obrasNoMesmoImovel = (id: string) =>
  proxyJson<ObraPrivada[]>(`obras-privadas/${id}/no-mesmo-imovel`);

// ------------------------------------------------------------ licenciamento

export const listarAlvaras = (obraId: string) =>
  proxyJson<Alvara[]>(`obras-privadas/${obraId}/alvaras`);

export const criarAlvara = (obraId: string, corpo: Record<string, unknown>) =>
  proxyJson<Alvara>(`obras-privadas/${obraId}/alvaras`, json(corpo));

export const editarAlvara = (
  obraId: string,
  id: string,
  corpo: Record<string, unknown>,
) => proxyJson<Alvara>(`obras-privadas/${obraId}/alvaras/${id}`, patch(corpo));

export const excluirAlvara = (obraId: string, id: string) =>
  proxyJson<void>(`obras-privadas/${obraId}/alvaras/${id}`, {
    method: "DELETE",
  });

export const listarHabiteSe = (obraId: string) =>
  proxyJson<HabiteSe[]>(`obras-privadas/${obraId}/habite-se`);

export const criarHabiteSe = (obraId: string, corpo: Record<string, unknown>) =>
  proxyJson<HabiteSe>(`obras-privadas/${obraId}/habite-se`, json(corpo));

export const excluirHabiteSe = (obraId: string, id: string) =>
  proxyJson<void>(`obras-privadas/${obraId}/habite-se/${id}`, {
    method: "DELETE",
  });

// ------------------------------------------------------------ fiscalizacao

export const listarFiscalizacoesDaObra = (obraId: string) =>
  proxyJson<Fiscalizacao[]>(`obras-privadas/${obraId}/fiscalizacoes`);

export const criarFiscalizacao = (
  obraId: string,
  corpo: Record<string, unknown>,
) => proxyJson<Fiscalizacao>(`obras-privadas/${obraId}/fiscalizacoes`, json(corpo));

export const excluirFiscalizacao = (obraId: string, id: string) =>
  proxyJson<void>(`obras-privadas/${obraId}/fiscalizacoes/${id}`, {
    method: "DELETE",
  });

export const listarAutosDaObra = (obraId: string) =>
  proxyJson<AutoInfracao[]>(`obras-privadas/${obraId}/autos`);

export const criarAuto = (obraId: string, corpo: Record<string, unknown>) =>
  proxyJson<AutoInfracao>(`obras-privadas/${obraId}/autos`, json(corpo));

export const editarAuto = (
  obraId: string,
  id: string,
  corpo: Record<string, unknown>,
) => proxyJson<AutoInfracao>(`obras-privadas/${obraId}/autos/${id}`, patch(corpo));

// ------------------------------------------------------------ responsaveis

export const criarResponsavel = (
  obraId: string,
  corpo: Record<string, unknown>,
) => proxyJson<ResponsavelDetalhe>(`obras-privadas/${obraId}/responsaveis`, json(corpo));

export const editarResponsavel = (
  obraId: string,
  id: string,
  corpo: Record<string, unknown>,
) =>
  proxyJson<ResponsavelDetalhe>(
    `obras-privadas/${obraId}/responsaveis/${id}`,
    patch(corpo),
  );

export const excluirResponsavel = (obraId: string, id: string) =>
  proxyJson<void>(`obras-privadas/${obraId}/responsaveis/${id}`, {
    method: "DELETE",
  });

// ------------------------------------------------------------- observacoes

export const listarObservacoes = (obraId: string) =>
  proxyJson<Observacao[]>(`obras-privadas/${obraId}/observacoes`);

export const criarObservacao = (obraId: string, texto: string) =>
  proxyJson<Observacao>(`obras-privadas/${obraId}/observacoes`, json({ texto }));

export const excluirObservacao = (obraId: string, id: string) =>
  proxyJson<void>(`obras-privadas/${obraId}/observacoes/${id}`, {
    method: "DELETE",
  });

// --------------------------------------------------------------- arquivos

export const listarArquivos = (
  obraId: string,
  filtros: { vinculo?: string; vinculoId?: string; categoria?: string } = {},
) =>
  proxyJson<ArquivoPrivado[]>(
    `obras-privadas/${obraId}/arquivos${montarQuery(filtros)}`,
  );

export const iniciarUpload = (obraId: string, corpo: Record<string, unknown>) =>
  proxyJson<UploadPreparado[]>(`obras-privadas/${obraId}/arquivos`, json(corpo));

export const confirmarUpload = (
  arquivoId: string,
  corpo: { tamanhoBytes?: number; mimeType?: string },
) =>
  proxyJson<ArquivoPrivado>(
    `obras-privadas-arquivos/${arquivoId}/confirmar`,
    json(corpo),
  );

export const urlArquivo = (arquivoId: string) =>
  proxyJson<{ url: string; nome: string; mimeType: string | null }>(
    `obras-privadas-arquivos/${arquivoId}/url`,
  );

export const editarArquivo = (
  arquivoId: string,
  corpo: Record<string, unknown>,
) => proxyJson<ArquivoPrivado>(`obras-privadas-arquivos/${arquivoId}`, patch(corpo));

export const excluirArquivo = (arquivoId: string) =>
  proxyJson<void>(`obras-privadas-arquivos/${arquivoId}`, { method: "DELETE" });

/**
 * PUT do binario direto no bucket, com a URL pre-assinada. Nao passa pelo
 * proxy do Next: o arquivo vai do navegador para o R2 sem tocar no servidor.
 */
export async function enviarBinario(
  urlUpload: string,
  arquivo: File,
): Promise<void> {
  const resposta = await fetch(urlUpload, {
    method: "PUT",
    body: arquivo,
    headers: { "content-type": arquivo.type || "application/octet-stream" },
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao enviar ${arquivo.name} (HTTP ${resposta.status})`);
  }
}

// ------------------------------------------------------- listagens globais

export const listarFiscalizacoesGlobal = (
  filtros: Record<string, string | number | boolean | null | undefined>,
) =>
  proxyJson<Pagina<ItemListaFiscalizacao>>(
    `obras-privadas/fiscalizacoes${montarQuery(filtros)}`,
  );

export const listarAutosGlobal = (
  filtros: Record<string, string | number | boolean | null | undefined>,
) =>
  proxyJson<Pagina<ItemListaAuto>>(
    `obras-privadas/autos${montarQuery(filtros)}`,
  );

export const listarLicenciamentoGlobal = (
  filtros: Record<string, string | number | boolean | null | undefined>,
) =>
  proxyJson<Pagina<ItemListaLicenciamento>>(
    `obras-privadas/licenciamento${montarQuery(filtros)}`,
  );

/** URL de exportacao da lista (o download passa pelo proxy autenticado). */
export function urlExportacaoLista(
  filtros: Record<string, string | number | boolean | null | undefined>,
  formato: "PDF" | "CSV",
): string {
  return `/api/proxy/relatorios/obras-privadas/exportar${montarQuery({
    ...filtros,
    formato,
  })}`;
}

export const urlDossie = (obraId: string) =>
  `/api/proxy/relatorios/obras-privadas/${obraId}/dossie.pdf`;

export const urlRelatorioFiscalizacao = (fiscalizacaoId: string) =>
  `/api/proxy/relatorios/obras-privadas/fiscalizacoes/${fiscalizacaoId}/relatorio.pdf`;
