/**
 * Helpers PUROS das telas de cadastro (orgaos, localidades, usuarios, fontes,
 * empresas e tenants), testaveis em vitest node: labels de enums do backend,
 * contagem de registros, filtro de busca client-side, formatacao de moeda e
 * montagem da atribuicao de perfil (RN-IDE-13).
 *
 * Textos exibidos ao usuario em PT-BR acentuado (diretriz do design); "—" e o
 * fallback padrao para valores ausentes.
 */

import { formatarMoeda } from "./dinheiro";

/** Rotulo do tipo de orgao; "—" para nulo e o valor cru quando desconhecido. */
export function tipoOrgaoLabel(tipo: string | null | undefined): string {
  switch (tipo) {
    case "SECRETARIA":
      return "Secretaria";
    case "AUTARQUIA":
      return "Autarquia";
    case "FUNDACAO":
      return "Fundação";
    case "EMPRESA_PUBLICA":
      return "Empresa pública";
    default:
      return tipo ?? "—";
  }
}

/** Rotulo do tipo de localidade; "—" para nulo e o valor cru quando desconhecido. */
export function tipoLocalidadeLabel(tipo: string | null | undefined): string {
  switch (tipo) {
    case "BAIRRO":
      return "Bairro";
    case "DISTRITO":
      return "Distrito";
    case "REGIAO":
      return "Região";
    case "ZONA_RURAL":
      return "Zona rural";
    default:
      return tipo ?? "—";
  }
}

/** Rotulo do tipo de fonte de recurso; "—" para nulo e o valor cru quando desconhecido. */
export function tipoFonteLabel(tipo: string | null | undefined): string {
  switch (tipo) {
    case "FEDERAL":
      return "Federal";
    case "ESTADUAL":
      return "Estadual";
    case "MUNICIPAL":
      return "Municipal";
    case "CONVENIO":
      return "Convênio";
    default:
      return tipo ?? "—";
  }
}

/** Texto exibivel de um campo opcional: o valor aparado ou "—" quando vazio. */
export function ouTraco(valor: string | null | undefined): string {
  const texto = valor?.trim();
  return texto ? texto : "—";
}

/**
 * Formata um valor em reais (string numerica da API, ex.: "1000.00") no padrao
 * pt-BR ("R$ 1.000,00"); "—" para nulo, vazio ou nao numerico. Delega ao
 * formatador canonico de `lib/ui/dinheiro`.
 */
export function moedaBRL(valor: string | number | null | undefined): string {
  return formatarMoeda(valor);
}

/** Subtitulo "{N} registros" do cabecalho das listas (singular quando N=1). */
export function resumoRegistros(total: number): string {
  return `${total} ${total === 1 ? "registro" : "registros"}`;
}

/**
 * Filtro generico da busca client-side: mantem os itens cujo algum dos campos
 * textuais contem o termo (case-insensitive). Busca vazia devolve tudo.
 */
export function filtrarCadastro<T>(
  itens: T[],
  busca: string,
  campos: (item: T) => Array<string | null | undefined>,
): T[] {
  const termo = busca.trim().toLowerCase();
  if (!termo) return itens;
  return itens.filter((item) =>
    campos(item).some((campo) => (campo ?? "").toLowerCase().includes(termo)),
  );
}

/** Mensagem exibivel de uma resposta de erro da API ({ message } do Nest). */
export function mensagemErroApi(status: number, corpo: unknown): string {
  const mensagem = (corpo as { message?: string | string[] } | null)?.message;
  const texto = Array.isArray(mensagem) ? mensagem.join(", ") : mensagem;
  return texto ? `Erro ${status}: ${texto}` : `Erro ${status}: falha na API`;
}

// --- Atribuicao de perfil no cadastro de usuario (RN-IDE-13) ---

/** Perfis oferecidos no select "Perfil (opcional)" do cadastro de usuario. */
export const PERFIS_ATRIBUIVEIS = [
  "ADMIN_TENANT",
  "GESTOR_ORGAO",
  "CONSULTA",
] as const;

export type PerfilAtribuivel = (typeof PERFIS_ATRIBUIVEIS)[number];

/** Payload de POST /usuarios/{id}/atribuicoes (ConcederAtribuicaoDto). */
export interface AtribuicaoPerfilPayload {
  perfil: PerfilAtribuivel;
  escopo: "TENANT" | "ORGAO";
  orgaoId?: string;
}

export type ResultadoAtribuicao =
  | { ok: true; payload: AtribuicaoPerfilPayload }
  | { ok: false; erro: string };

/**
 * Monta o payload da atribuicao conforme a coerencia perfil x escopo do
 * backend: ADMIN_TENANT e CONSULTA em escopo TENANT; GESTOR_ORGAO em escopo
 * ORGAO (exige orgao selecionado). Sem perfil escolhido devolve null.
 */
export function montarAtribuicaoPerfil(
  perfil: string,
  orgaoId: string | null | undefined,
): ResultadoAtribuicao | null {
  if (!perfil) return null;
  if (perfil === "ADMIN_TENANT" || perfil === "CONSULTA") {
    return { ok: true, payload: { perfil, escopo: "TENANT" } };
  }
  if (perfil === "GESTOR_ORGAO") {
    if (!orgaoId) {
      return {
        ok: false,
        erro: "Selecione o órgão do usuário para conceder o perfil Gestor.",
      };
    }
    return { ok: true, payload: { perfil, escopo: "ORGAO", orgaoId } };
  }
  return { ok: false, erro: `Perfil não suportado: ${perfil}` };
}
