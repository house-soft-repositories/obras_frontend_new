/**
 * Cliente e regras de UI do DocumentosContext (E8-04). O binario trafega DIRETO
 * entre o browser e o bucket S3-compativel por URL pre-assinada (RN-DOC-10); a
 * API (via /api/proxy) so manipula metadados. Regras de UI (RN-DOC-03/13, raiz
 * imutavel) em funcoes PURAS testaveis sem render.
 */
import { ErroApi } from "./obras";
import type { components } from "./types.gen";

export { ErroApi };

// --- Tipos de request gerados do contrato OpenAPI ---
export type CriarPastaPayload = components["schemas"]["CriarPastaDto"];
export type IniciarUploadPayload = components["schemas"]["IniciarUploadDto"];
export type ConfirmarUploadPayload =
  components["schemas"]["ConfirmarUploadDto"];
export type EditarArquivoPayload = components["schemas"]["EditarArquivoDto"];
export type MoverArquivoPayload = components["schemas"]["MoverArquivoDto"];

// --- Entidades retornadas pela API (tipadas a mao) ---
export interface Pasta {
  id: string;
  obraId: string;
  pastaPaiId: string | null;
  nome: string;
  criadoPorUsuarioId: string | null;
}

export interface Arquivo {
  id: string;
  obraId: string;
  pastaId: string;
  nome: string;
  descricao: string | null;
  nomeOriginal: string;
  mimeType: string | null;
  tamanhoBytes: string | null;
  storageKey: string;
}

export interface ItemTrilha {
  id: string;
  nome: string;
}

export interface ConteudoPasta {
  pasta: Pasta;
  trilha: ItemTrilha[];
  subpastas: Pasta[];
  arquivos: { itens: Arquivo[]; total: number; page: number; limit: number };
}

export interface UploadIniciado {
  arquivoId: string;
  nome: string;
  storageKey: string;
  urlUpload: string;
}

// =====================================================================
// Funcoes PURAS (regras de UI) — testaveis sem render.
// =====================================================================

/** RN-DOC-01/03: a raiz (pasta_pai_id nulo) nao pode ser renomeada/movida/removida. */
export function ehPastaRaiz(pasta: Pick<Pasta, "pastaPaiId">): boolean {
  return pasta.pastaPaiId == null;
}

/** Formata bytes para exibicao (B, KB, MB, GB). */
export function formatarTamanho(bytes: string | number | null): string {
  if (bytes == null) return "—";
  const n = typeof bytes === "string" ? Number(bytes) : bytes;
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  const unidades = ["KB", "MB", "GB", "TB"];
  let valor = n / 1024;
  let i = 0;
  while (valor >= 1024 && i < unidades.length - 1) {
    valor /= 1024;
    i++;
  }
  return `${valor.toFixed(1)} ${unidades[i]}`;
}

/** RN-DOC-03: nome de pasta obrigatorio e nao-vazio. */
export function validarNomePasta(nome: string): string[] {
  const erros: string[] = [];
  if (!nome.trim()) erros.push("Informe o nome da pasta");
  return erros;
}

/** RN-DOC-05: cada arquivo do lote exige um nome logico. */
export function validarUpload(
  itens: { nome: string; nomeOriginal: string }[],
): string[] {
  const erros: string[] = [];
  if (itens.length === 0) erros.push("Selecione ao menos um arquivo");
  if (itens.some((i) => !i.nome.trim()))
    erros.push("Todo arquivo precisa de um nome");
  return erros;
}

/** RN-DOC-06/13: quais acoes aparecem para um arquivo conforme o perfil. */
export function acoesArquivoPermitidas(podeEditar: boolean): {
  baixar: boolean;
  editar: boolean;
  mover: boolean;
  remover: boolean;
} {
  return {
    baixar: true, // CONSULTA tambem baixa (RN-DOC-13)
    editar: podeEditar,
    mover: podeEditar,
    remover: podeEditar,
  };
}

/** Pastas de destino validas ao mover (mesma obra, exclui a atual). */
export function destinosMover(
  pastas: Pasta[],
  pastaAtualId: string,
): Pasta[] {
  return pastas.filter((p) => p.id !== pastaAtualId);
}

/** Texto da trilha de navegacao (RN-DOC-02). */
export function trilhaTexto(trilha: ItemTrilha[]): string {
  return trilha.map((t) => t.nome).join(" > ");
}

// =====================================================================
// Chamadas ao backend via proxy autenticado (/api/proxy).
// =====================================================================

async function proxy<T>(caminho: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`/api/proxy/${caminho}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!r.ok) {
    const corpo = await r.json().catch(() => ({}));
    throw new ErroApi(r.status, corpo);
  }
  return (r.status === 204 ? undefined : await r.json()) as T;
}

export function obterPastaRaiz(obraId: string) {
  return proxy<Pasta>(`obras/${obraId}/pastas/raiz`);
}

export function listarConteudo(pastaId: string, page = 1, limit = 20) {
  return proxy<ConteudoPasta>(`pastas/${pastaId}?page=${page}&limit=${limit}`);
}

export function criarPasta(payload: CriarPastaPayload) {
  return proxy<Pasta>(`pastas`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function iniciarUpload(pastaId: string, payload: IniciarUploadPayload) {
  return proxy<UploadIniciado[]>(`pastas/${pastaId}/arquivos`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmarUpload(
  arquivoId: string,
  payload: ConfirmarUploadPayload,
) {
  return proxy<Arquivo>(`arquivos/${arquivoId}/confirmar`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function obterUrlDownload(arquivoId: string) {
  return proxy<{ url: string }>(`arquivos/${arquivoId}/download`);
}

export function editarArquivo(arquivoId: string, payload: EditarArquivoPayload) {
  return proxy<Arquivo>(`arquivos/${arquivoId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function moverArquivo(arquivoId: string, payload: MoverArquivoPayload) {
  return proxy<Arquivo>(`arquivos/${arquivoId}/mover`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function removerArquivo(arquivoId: string) {
  return proxy<void>(`arquivos/${arquivoId}`, { method: "DELETE" });
}

/**
 * Envia o binario DIRETO para a URL pre-assinada (PUT no bucket — RN-DOC-10),
 * fora do proxy. Retorna ao chamador para que confirme o upload em seguida.
 */
export async function enviarBinario(
  urlUpload: string,
  arquivo: File | Blob,
  mimeType: string,
): Promise<void> {
  const r = await fetch(urlUpload, {
    method: "PUT",
    headers: { "content-type": mimeType },
    body: arquivo,
  });
  if (!r.ok) {
    throw new Error(`Falha ao enviar o arquivo ao storage (${r.status})`);
  }
}
