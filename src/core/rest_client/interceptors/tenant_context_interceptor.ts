import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type { Interceptor } from "@/core/types/http_client";

const TENANT_CONTEXT_REQUIRED = "TENANT_CONTEXT_REQUIRED";
const TENANT_CONTEXT_ROUTE = "/selecionar-tenancy";
const CURRENT_PATH_HEADER = "x-obras-current-path";

function getErrorDataMessage(error: HttpClientException): string | undefined {
  const { data } = error;

  if (typeof data !== "object" || data === null || !("message" in data)) {
    return undefined;
  }

  return typeof data.message === "string" ? data.message : undefined;
}

function isTenantContextRequired(error: unknown): boolean {
  return (
    error instanceof HttpClientException &&
    error.statusCode === 401 &&
    (error.message === TENANT_CONTEXT_REQUIRED ||
      getErrorDataMessage(error) === TENANT_CONTEXT_REQUIRED)
  );
}

export class TenantContextInterceptor implements Interceptor {
  async error(error: unknown): Promise<unknown> {
    if (typeof window === "undefined" && isTenantContextRequired(error)) {
      const currentPath = (await headers()).get(CURRENT_PATH_HEADER);
      const nextPath = getSafeNextPath(currentPath);
      const redirectTo = nextPath
        ? `${TENANT_CONTEXT_ROUTE}?next=${encodeURIComponent(nextPath)}`
        : TENANT_CONTEXT_ROUTE;

      redirect(redirectTo);
    }

    return error;
  }
}

function getSafeNextPath(path: string | null): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  if (path === TENANT_CONTEXT_ROUTE || path.startsWith(`${TENANT_CONTEXT_ROUTE}?`)) {
    return null;
  }

  return path;
}
