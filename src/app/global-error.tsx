"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { TenantContextRequiredCard } from "@/core/ui/layout/tenant-context-required-card";
import "./globals.css";

function getErrorDataMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return undefined;
  }

  const data = error.data;
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return undefined;
  }

  return typeof data.message === "string" ? data.message : undefined;
}

function getErrorStatusCode(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return undefined;
}

function isTenantContextRequired(error: Error & { digest?: string }): boolean {
  if (error instanceof HttpClientException) {
    return (
      error.statusCode === 401 &&
      (error.message === "TENANT_CONTEXT_REQUIRED" ||
        getErrorDataMessage(error) === "TENANT_CONTEXT_REQUIRED")
    );
  }

  if (
    getErrorStatusCode(error) === 401 &&
    getErrorDataMessage(error) === "TENANT_CONTEXT_REQUIRED"
  ) {
    return true;
  }

  return [error.message, error.digest]
    .filter(Boolean)
    .some((value) => value?.includes("TENANT_CONTEXT_REQUIRED"));
}

function ErrorCard({
  error,
  onRetry,
}: {
  error: Error & { digest?: string };
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-lg rounded-app border border-border bg-surface p-6 shadow-card sm:p-8">
        <span className="grid size-11 place-items-center rounded-app bg-surface-subtle text-foreground">
          <AlertTriangle aria-hidden="true" className="size-5" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
          Não foi possível carregar a página
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Tente novamente. Se o problema continuar, entre em contato com o
          suporte.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-muted">
            Código: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-app bg-accent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Tentar novamente
        </button>
      </section>
    </main>
  );
}

function GlobalErrorContent({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  const retry = unstable_retry ?? reset ?? (() => window.location.reload());

  useEffect(() => {
    console.error(error);
  }, [error]);


  if (isTenantContextRequired(error)) {
    return <TenantContextRequiredCard onRetry={retry} />;
  }

  return <ErrorCard error={error} onRetry={retry} />;
}

export default function GlobalError(props: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider>
          <GlobalErrorContent {...props} />
        </SessionProvider>
      </body>
    </html>
  );
}
