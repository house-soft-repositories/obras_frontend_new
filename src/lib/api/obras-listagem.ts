/**
 * Regras de UI da listagem e duplicacao de obras (E2-08), em funcoes puras
 * testaveis. A sincronia dos filtros com a query string e a montagem do
 * payload de duplicacao (RN-OBR-19) ficam aqui.
 */
import type { DuplicarObraPayload } from "./obras";

export interface FiltrosObras {
  busca?: string;
  status?: string;
  tipo?: string;
  orgaoId?: string;
  eixoId?: string;
  tipologiaId?: string;
  tag?: string;
  acaoConveniada?: string;
  prioritaria?: string;
  page?: number;
}

/** Chaves de filtro suportadas na query string. */
export const CHAVES_FILTRO: (keyof FiltrosObras)[] = [
  "busca",
  "status",
  "tipo",
  "orgaoId",
  "eixoId",
  "tipologiaId",
  "tag",
  "acaoConveniada",
  "prioritaria",
  "page",
];

/** Converte os filtros em uma query string (ignora vazios). */
export function filtrosParaQueryString(filtros: FiltrosObras): string {
  const params = new URLSearchParams();
  for (const chave of CHAVES_FILTRO) {
    const valor = filtros[chave];
    if (valor === undefined || valor === "" || valor === null) continue;
    params.set(chave, String(valor));
  }
  return params.toString();
}

/** Le os filtros a partir de uma query string (ou URLSearchParams). */
export function queryStringParaFiltros(
  entrada: string | URLSearchParams,
): FiltrosObras {
  const params =
    typeof entrada === "string" ? new URLSearchParams(entrada) : entrada;
  const filtros: FiltrosObras = {};
  for (const chave of CHAVES_FILTRO) {
    const valor = params.get(chave);
    if (valor === null || valor === "") continue;
    if (chave === "page") {
      filtros.page = Number(valor);
    } else {
      filtros[chave] = valor;
    }
  }
  return filtros;
}

/** Atualiza um filtro e devolve a nova query string (sincronia da URL). */
export function aplicarFiltro(
  filtros: FiltrosObras,
  chave: keyof FiltrosObras,
  valor: string,
): string {
  const proximos: FiltrosObras = { ...filtros, [chave]: valor };
  // qualquer mudanca de filtro volta para a primeira pagina
  if (chave !== "page") delete proximos.page;
  if (valor === "") delete proximos[chave];
  return filtrosParaQueryString(proximos);
}

export interface FormularioDuplicacao {
  nome: string;
  responsavelUsuarioId: string;
  dataInicio: string;
  dataPrazo: string;
  copiarArquivos: boolean;
  manterEquipe: boolean;
  copiarEstagios: boolean;
}

/** Monta o payload de duplicacao com as 3 opcoes (RN-OBR-19). */
export function construirPayloadDuplicacao(
  form: FormularioDuplicacao,
): DuplicarObraPayload {
  return {
    nome: form.nome,
    responsavelUsuarioId: form.responsavelUsuarioId,
    dataInicio: form.dataInicio,
    dataPrazo: form.dataPrazo,
    copiarArquivos: form.copiarArquivos,
    manterEquipe: form.manterEquipe,
    copiarEstagios: form.copiarEstagios,
  };
}
