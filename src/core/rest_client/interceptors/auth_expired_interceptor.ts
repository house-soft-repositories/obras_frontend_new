import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type { Interceptor } from "@/core/types/http_client";

const AUTH_INVALID_REFRESH_TOKEN = "AUTH_INVALID_REFRESH_TOKEN";
// Resposta padrão de frameworks (ex.: NestJS) quando a requisição chega sem
// credencial válida — é o que o backend devolve nas chamadas SSR que saem sem
// Authorization depois que a sessão foi marcada com erro.
const UNAUTHORIZED_MESSAGE = "Unauthorized";
const LOGIN_ROUTE = "/login";
const CURRENT_PATH_HEADER = "x-obras-current-path";

function getErrorDataField(error: HttpClientException, field: string): unknown {
  const { data } = error;

  if (typeof data !== "object" || data === null || !(field in data)) {
    return undefined;
  }

  return (data as Record<string, unknown>)[field];
}

function isSessionExpiredError(error: unknown): boolean {
  if (
    !(error instanceof HttpClientException) ||
    error.statusCode !== 401
  ) {
    return false;
  }

  const dataMessage = getErrorDataField(error, "message");
  const dataCode = getErrorDataField(error, "code");

  // Escopado a 401 com código/mensagem de sessão expirada. Um `statusCode === 401`
  // sozinho capturaria qualquer 401 (ex.: TENANT_CONTEXT_REQUIRED, que tem
  // interceptor próprio, ou um 401 transitório de um recurso específico).
  return (
    error.message === AUTH_INVALID_REFRESH_TOKEN ||
    error.message === UNAUTHORIZED_MESSAGE ||
    dataMessage === AUTH_INVALID_REFRESH_TOKEN ||
    dataMessage === UNAUTHORIZED_MESSAGE ||
    dataCode === AUTH_INVALID_REFRESH_TOKEN
  );
}

// O 401 "Unauthorized" genérico tem dois significados distintos e o redirect
// cego para /login causava o loop: com a sessão marcada com erro (refresh
// inválido), a requisição SSR sai sem Authorization e o redirect é correto —
// o proxy limpa o cookie e não há bounce. Mas com a sessão válida e o access
// morto (ex.: revogado no backend com `exp` ainda futuro), o proxy vê o cookie
// válido e devolve /login → "/" em loop. Por isso só redireciona quando a
// sessão está marcada com erro; senão o erro propaga e a Server Action
// retorna `{ success: false }` (sem redirect, sem loop).
// Import dinâmico para não criar ciclo estático com `auth_options`
// (que não passa mais pelo HttpClient, então `auth()` aqui não recai
// neste interceptor).
async function hasSessionErrorSafe(): Promise<boolean> {
  try {
    const { auth } = await import("@/core/config/auth_options");
    const session = await auth();
    return Boolean(session?.error);
  } catch (error) {
    const digest =
      typeof error === "object" && error !== null && "digest" in error
        ? (error as { digest?: unknown }).digest
        : undefined;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return true;
  }
}

async function getCurrentPathSafe(): Promise<string | null> {
  try {
    return (await headers()).get(CURRENT_PATH_HEADER);
  } catch {
    // Fora do escopo de requisição (ex.: callback jwt do NextAuth durante o
    // refresh): redireciona sem o parâmetro next em vez de quebrar.
    return null;
  }
}

export class AuthExpiredInterceptor implements Interceptor {
  async error(error: unknown): Promise<unknown> {
    if (typeof window === "undefined" && isSessionExpiredError(error)) {
      // Só redireciona quando a sessão está marcada com erro (refresh
      // inválido): o logout (apagar o cookie de sessão) acontece no proxy,
      // que detecta o token com erro e limpa o cookie na resposta.
      // Sem sessão em erro, devolver o 401 sem redirect evita o loop
      // /login ↔ "/" (o proxy veria o cookie ainda válido e devolveria
      // para "/").
      if (!(await hasSessionErrorSafe())) {
        return error;
      }
      const currentPath = await getCurrentPathSafe();
      const nextPath = getSafeNextPath(currentPath);
      const redirectTo = nextPath
        ? `${LOGIN_ROUTE}?next=${encodeURIComponent(nextPath)}`
        : LOGIN_ROUTE;

      redirect(redirectTo);
    }

    return error;
  }
}

function getSafeNextPath(path: string | null): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  if (path === LOGIN_ROUTE || path.startsWith(`${LOGIN_ROUTE}?`)) {
    return null;
  }

  return path;
}
