"use client";

import {
  AlertTriangle,
  Building2,
  Check,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import switchTenancyAction from "@/core/actions/auth/switch_tenancy_action";
import listTenanciesAction from "@/core/actions/tenancies/list_tenancies_action";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type { TenantType } from "@/core/schemas/tenants/tenant_schema";
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

function TenantContextRequiredCard({ onRetry }: { onRetry: () => void }) {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [tenancies, setTenancies] = useState<TenantType[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const activeTenancies = useMemo(
    () => tenancies.filter((tenant) => tenant.active),
    [tenancies],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadTenancies() {
      try {
        const result = await listTenanciesAction();
        if (!isMounted) return;
        const active = result.filter((tenant) => tenant.active);
        setTenancies(active);
        setSelectedTenantId((current) => current || active[0]?.id || "");
      } catch (error) {
        if (!isMounted) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as tenancies.",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTenancies();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleSelectTenant() {
    if (!selectedTenantId || isPending) return;

    setSwitchError(null);
    startTransition(async () => {
      const result = await switchTenancyAction(selectedTenantId);
      if (!result.success) {
        setSwitchError(result.error);
        return;
      }

      await update();
      onRetry();
      router.refresh();
    });
  }

  const isSuperAdmin = session?.user?.role === "SUPERADMIN";

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-xl rounded-app border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-app bg-accent text-foreground">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-muted">
              Contexto obrigatório
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
              Selecione uma tenancy
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Sua conta SUPERADMIN precisa de uma tenancy ativa para continuar.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {status === "loading" || loading ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
              Carregando tenancies...
            </p>
          ) : !isSuperAdmin ? (
            <p className="rounded-app border border-border bg-surface-subtle px-3 py-2 text-sm text-muted">
              Apenas usuários SUPERADMIN podem selecionar a tenancy nessa tela.
            </p>
          ) : loadError ? (
            <p className="rounded-app border border-[var(--cor-perigo-borda)] bg-[var(--cor-perigo-bg)] px-3 py-2 text-sm text-[var(--cor-perigo)]">
              {loadError}
            </p>
          ) : activeTenancies.length === 0 ? (
            <p className="rounded-app border border-border bg-surface-subtle px-3 py-2 text-sm text-muted">
              Nenhuma tenancy ativa encontrada.
            </p>
          ) : (
            <div className="grid gap-2">
              <label
                htmlFor="tenant-select"
                className="text-sm font-semibold text-foreground"
              >
                Tenancy ativa
              </label>
              <select
                id="tenant-select"
                value={selectedTenantId}
                onChange={(event) => setSelectedTenantId(event.target.value)}
                className="h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {activeTenancies.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - {tenant.slug}
                  </option>
                ))}
              </select>
            </div>
          )}

          {switchError ? (
            <p className="rounded-app border border-[var(--cor-perigo-borda)] bg-[var(--cor-perigo-bg)] px-3 py-2 text-sm text-[var(--cor-perigo)]">
              {switchError}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={handleSelectTenant}
            disabled={
              !isSuperAdmin ||
              !selectedTenantId ||
              loading ||
              status === "loading" ||
              isPending
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app bg-accent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <Check aria-hidden="true" className="size-4" />
            )}
            Selecionar e continuar
          </button>
        </div>
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
