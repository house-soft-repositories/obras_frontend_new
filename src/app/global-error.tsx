"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Building2, LoaderCircle, LogOut, RotateCcw } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "./globals.css";

type Tenancy = { id: string; name: string; slug: string; active: boolean };

function isTenantContextRequired(error: unknown): boolean {
  const haystack = [
    (error as { message?: unknown })?.message,
    (error as { digest?: unknown })?.digest,
    String(error ?? ""),
  ]
    .filter((v): v is string => typeof v === "string")
    .join(" | ");
  return haystack.includes("TENANT_CONTEXT_REQUIRED");
}

function is401Like(error: unknown): boolean {
  const s = String((error as { message?: unknown })?.message ?? error ?? "");
  return s.includes("401") || s.includes("API ") || s.includes("Unauthorized");
}

function TenantRequiredView({
  error,
  onRetry,
}: {
  error: Error & { digest?: string };
  onRetry: () => void;
}) {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const tenantId = session?.user?.tenant?.id ?? "";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/proxy/tenancies", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as Tenancy[] | { data: Tenancy[] };
        const list = Array.isArray(data) ? data : (data as { data: Tenancy[] }).data ?? [];
        if (!alive) return;
        const ativas = list.filter((t) => t.active);
        setTenancies(ativas);
        if (!selected) setSelected(tenantId || ativas[0]?.id || "");
      } catch (e) {
        if (alive) setLoadError(e instanceof Error ? e.message : "Falha ao carregar tenancies.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tenantId, selected]);

  async function handleConfirm() {
    if (!selected || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const next = await update({ tenantId: selected });
      if ((next as { error?: string } | null)?.error) throw new Error((next as { error: string }).error);
      onRetry();
      router.refresh();
    } catch {
      setSaveError("Não foi possível trocar a tenancy. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const isSuper = session?.user?.role === "SUPERADMIN";

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-surface-subtle px-4 py-10">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Building2 className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Selecione uma tenancy</h1>
            <p className="mt-1 text-sm leading-6 text-muted">
              Sua conta é SUPERADMIN e nenhuma tenancy está selecionada. Escolha abaixo para continuar de onde parou.
            </p>
            <p className="mt-2 font-mono text-xs text-muted">digest: {error.digest ?? error.message}</p>
          </div>
        </div>

        <div className="mt-6">
          {status === "loading" || loading ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <LoaderCircle className="size-4 animate-spin" /> Carregando tenancies...
            </p>
          ) : loadError ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{loadError}</p>
          ) : tenancies.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma tenancy ativa encontrada.</p>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Tenancy ativa</label>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {tenancies.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelected(t.id)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${selected === t.id ? "bg-accent text-accent-foreground" : "hover:bg-surface-subtle"}`}
                  >
                    <span>
                      <span className="block font-semibold">{t.name}</span>
                      <span className="block font-mono text-xs opacity-70">{t.slug}</span>
                    </span>
                    {selected === t.id ? <span className="text-xs font-bold">✓</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}
          {saveError ? <p className="mt-3 text-sm text-destructive">{saveError}</p> : null}
          {!isSuper && status !== "loading" ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Sua sessão não é SUPERADMIN — selecione a tenancy pela barra superior ou faça login novamente.</p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!selected || saving || loading || !isSuper}
            onClick={handleConfirm}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-accent bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-50"
          >
            {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Building2 className="size-4" />}
            Confirmar e voltar
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold"
          >
            <RotateCcw className="size-4" /> Tentar novamente
          </button>
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold text-muted hover:bg-surface-subtle"
          >
            Ir para Home
          </button>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted">Você também pode trocar pela barra superior quando ela estiver disponível.</p>
    </div>
  );
}

function GenericView({
  error,
  onRetry,
}: {
  error: Error & { digest?: string };
  onRetry: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-surface-subtle px-4 py-10">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-foreground text-white">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Algo deu errado</h1>
            <p className="mt-1 text-sm leading-6 text-muted">Ocorreu um erro inesperado. Tente novamente.</p>
            <p className="mt-2 rounded bg-surface-subtle px-3 py-2 font-mono text-xs text-muted">{error.digest ? `digest: ${error.digest} · ` : ""}{error.message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={onRetry} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-accent bg-accent px-4 text-sm font-semibold">
            <RotateCcw className="size-4" /> Tentar novamente
          </button>
          <button type="button" onClick={() => router.push("/home")} className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold">Ir para Home</button>
          <button type="button" onClick={() => router.push("/login")} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm text-muted"><LogOut className="size-4" /> Sair</button>
        </div>
      </div>
    </div>
  );
}

function Inner({
  error,
  onRetry,
}: {
  error: Error & { digest?: string };
  onRetry: () => void;
}) {
  const { data: session, status } = useSession();
  const tenantRequired = isTenantContextRequired(error);
  const fallback =
    !tenantRequired &&
    status !== "loading" &&
    session?.user?.role === "SUPERADMIN" &&
    !session.user.tenant &&
    is401Like(error);
  if (tenantRequired || fallback) return <TenantRequiredView error={error} onRetry={onRetry} />;
  return <GenericView error={error} onRetry={onRetry} />;
}

export default function GlobalError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const doRetry = retry ?? reset ?? (() => window.location.reload());

  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-surface-subtle antialiased">
        <SessionProvider>
          <Inner error={error} onRetry={doRetry} />
        </SessionProvider>
      </body>
    </html>
  );
}
