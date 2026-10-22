"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export function ServerUnavailableCard({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-lg rounded-app border border-border bg-surface p-6 shadow-card sm:p-8">
        <span className="grid size-11 place-items-center rounded-app bg-surface-subtle text-foreground">
          <AlertTriangle aria-hidden="true" className="size-5" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
          Servidor temporariamente indisponível
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Não foi possível conectar ao servidor. Tente novamente em alguns
          instantes.
        </p>
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
