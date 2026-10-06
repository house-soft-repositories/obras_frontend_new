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

function isAuthInvalidRefreshToken(error: unknown): boolean {
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
    if (typeof window === "undefined" && isAuthInvalidRefreshToken(error)) {
      // Só redireciona: o logout (apagar o cookie de sessão) acontece no
      // proxy, que detecta o token com erro e limpa o cookie na resposta.
      // Sem isso, o cookie morto faria o proxy mandar de volta para "/" e o
      // app entraria em loop de redirect.
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
