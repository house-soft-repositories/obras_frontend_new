"use client";

import type { ReactNode } from "react";
import { CalendarDays, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface PrivateShellProps {
  children: ReactNode;
  sidebar: ReactNode;
}

/** Camada de interação do layout privado; a Sidebar continua renderizada no servidor. */
export function PrivateShell({ children, sidebar }: PrivateShellProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname() ?? "";
  const areaPrivada = pathname.startsWith("/obras-privadas");
  const titulo = areaPrivada
    ? "Fiscalização de obras privadas"
    : "Gestão de obras públicas";

  return (
    <div
      data-slot="private-shell"
      className="min-h-dvh bg-surface-subtle lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]"
    >
      <aside className="hidden h-dvh lg:sticky lg:top-0 lg:block">
        {sidebar}
      </aside>

      {menuAberto ? (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-foreground/45 lg:hidden"
            onClick={() => setMenuAberto(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 h-dvh w-[min(18rem,calc(100vw-2rem))] shadow-overlay lg:hidden">
            {sidebar}
          </aside>
        </>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Abrir menu"
            className="inline-flex size-10 items-center justify-center rounded-app text-foreground hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            onClick={() => setMenuAberto(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {titulo}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted">
              Prefeitura de São Bento
            </p>
          </div>
          <div className="ml-auto hidden items-center gap-2 text-xs text-muted sm:flex">
            <CalendarDays aria-hidden="true" className="size-4" />
            Atualizado agora
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
