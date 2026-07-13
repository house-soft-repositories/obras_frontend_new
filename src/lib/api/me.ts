/**
 * Cliente do GET /auth/me (usuario autenticado) via proxy autenticado
 * (/api/proxy), com cache em modulo — uma chamada por sessao de pagina — e
 * fetch injetavel para teste. A hierarquia de perfis (papelPrincipal) e
 * logica pura testavel em vitest node.
 */
import { perfilLabel } from "../ui/obra-labels";
import { ErroApi } from "./obras";
import type { components } from "./types.gen";

/** Resposta de GET /auth/me, tipada pelo contrato OpenAPI gerado. */
export type MeResposta = components["schemas"]["MeRespostaDto"];
export type PerfilAtribuido = components["schemas"]["PerfilAtribuidoDto"];

/** Ordem de hierarquia dos perfis (maior primeiro). */
const HIERARQUIA_PERFIS = [
  "SUPER_ADMIN",
  "ADMIN_TENANT",
  "GESTOR_ORGAO",
  "RESPONSAVEL_OBRA",
  "CONSULTA",
] as const;

/**
 * Rotulo (perfilLabel) do perfil de maior hierarquia do usuario.
 * Sem perfis conhecidos, devolve o fallback "Acesso institucional".
 */
export function papelPrincipal(perfis: { perfil: string }[]): string {
  for (const perfil of HIERARQUIA_PERFIS) {
    if (perfis.some((p) => p.perfil === perfil)) return perfilLabel(perfil);
  }
  return "Acesso institucional";
}

async function requisitarMe(fetchFn: typeof fetch): Promise<MeResposta> {
  const r = await fetchFn("/api/proxy/auth/me", {
    headers: { "content-type": "application/json" },
  });
  if (!r.ok) {
    const corpo = await r.json().catch(() => ({}));
    throw new ErroApi(r.status, corpo);
  }
  return (await r.json()) as MeResposta;
}

let cacheMe: Promise<MeResposta> | null = null;

/**
 * Busca o usuario autenticado com cache em modulo: chamadas simultaneas ou
 * repetidas na mesma sessao de pagina compartilham uma unica requisicao.
 * Falhas nao ficam em cache (a proxima chamada tenta de novo).
 */
export function buscarMe(fetchFn: typeof fetch = fetch): Promise<MeResposta> {
  if (!cacheMe) {
    const promessa = requisitarMe(fetchFn);
    cacheMe = promessa;
    promessa.catch(() => {
      if (cacheMe === promessa) cacheMe = null;
    });
  }
  return cacheMe;
}

/** Limpa o cache do /auth/me (logout e testes). */
export function limparCacheMe(): void {
  cacheMe = null;
}
