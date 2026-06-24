/**
 * Client HTTP base para a API do backend (NestJS).
 *
 * A URL base vem de NEXT_PUBLIC_API_URL (default http://localhost:3001).
 * Os tipos do contrato sao gerados via openapi-typescript em `pnpm gen:api`
 * (src/lib/api/types.gen.ts) e tipam as respostas deste client.
 */
import type { components } from "./types.gen";

const URL_BASE_PADRAO = "http://localhost:3001";

export function obterUrlBaseApi(): string {
  const url = process.env.NEXT_PUBLIC_API_URL ?? URL_BASE_PADRAO;
  return url.replace(/\/+$/, "");
}

export function montarUrl(caminho: string): string {
  const sufixo = caminho.startsWith("/") ? caminho : `/${caminho}`;
  return `${obterUrlBaseApi()}${sufixo}`;
}

export async function apiFetch<T>(
  caminho: string,
  init?: RequestInit,
): Promise<T> {
  const resposta = await fetch(montarUrl(caminho), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao chamar ${caminho}`);
  }

  return (await resposta.json()) as T;
}

/** Resposta de GET /health, tipada pelo contrato OpenAPI gerado. */
export type RespostaHealth = components["schemas"]["HealthRespostaDto"];

export function verificarSaude(): Promise<RespostaHealth> {
  return apiFetch<RespostaHealth>("/health");
}
