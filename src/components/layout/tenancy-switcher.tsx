"use client";

import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export interface TenancyOpcao {
  id: string;
  name: string;
  slug: string;
  cnpj: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function TenancySwitcher({
  nomePadrao,
  tenancies,
}: {
  nomePadrao: string;
  tenancies: TenancyOpcao[];
}) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const seletor = useRef<HTMLDivElement>(null);
  const [selecionado, setSelecionado] = useState("");
  const [trocando, setTrocando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [aberto, setAberto] = useState(false);

  const superadmin = session?.user.role === "SUPERADMIN";
  const atual = session?.user.tenantId ?? "";

  const tenancyIdSelecionada = selecionado || atual || tenancies[0]?.id || "";
  const alterado =
    tenancyIdSelecionada !== "" && tenancyIdSelecionada !== atual;
  const tenancySelecionada = useMemo(
    () => tenancies.find((tenancy) => tenancy.id === tenancyIdSelecionada),
    [tenancyIdSelecionada, tenancies],
  );

  useEffect(() => {
    if (!aberto) return;
    function fecharAoClicarFora(event: MouseEvent) {
      if (!seletor.current?.contains(event.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, [aberto]);

  if (!superadmin) {
    return (
      <p className="min-w-0 truncate text-sm font-semibold text-foreground">
        {nomePadrao}
      </p>
    );
  }

  async function trocar() {
    if (!alterado) return;
    setTrocando(true);
    setErro(null);
    setSucesso(false);
    try {
      const novaSessao = await update({ tenantId: tenancyIdSelecionada });
      if (novaSessao?.error) {
        throw new Error(novaSessao.error);
      }
      setSelecionado(novaSessao?.user.tenantId ?? tenancyIdSelecionada);
      setSucesso(true);
      setAberto(false);
      router.refresh();
    } catch {
      setErro("Não foi possível trocar a tenancy ativa.");
    } finally {
      setTrocando(false);
    }
  }

  return (
    <div ref={seletor} className="relative min-w-0">
      <Button
        variant="ghost"
        className="!h-auto !min-h-0 max-w-64 !justify-start !gap-2 !p-0 text-left"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls="tenancy-options"
        onClick={() => setAberto((atualAberto) => !atualAberto)}
      >
        <span className="min-w-0">
          <span className="block text-xs font-medium text-muted">
            Tenancy ativa
          </span>
          <span className="block truncate text-sm font-semibold text-foreground">
            {tenancySelecionada?.name ?? "Selecionar tenancy"}
          </span>
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted"
        />
      </Button>
      {sucesso ? (
        <Check
          aria-label="Tenancy ativa atualizada"
          className="absolute -right-5 top-1/2 size-4 -translate-y-1/2 text-foreground"
        />
      ) : null}
      {aberto ? (
        <div
          className="absolute left-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-app border border-border bg-surface shadow-overlay"
        >
          <div
            id="tenancy-options"
            role="listbox"
            aria-label="Selecionar tenancy ativa"
            className="max-h-64 overflow-y-auto p-2"
          >
            {tenancies.map((tenancy) => (
              <button
                key={tenancy.id}
                type="button"
                role="option"
                aria-selected={tenancy.id === tenancyIdSelecionada}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-app border-transparent bg-transparent px-3 py-2 text-left hover:bg-surface-subtle"
                onClick={() => setSelecionado(tenancy.id)}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {tenancy.name}
                  </span>
                  <span className="block truncate font-mono text-xs text-muted">
                    {tenancy.slug}
                  </span>
                </span>
                {tenancy.id === selecionado ? (
                  <Check aria-hidden="true" className="size-4 shrink-0" />
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border p-3">
            {erro ? (
              <p className="text-xs text-foreground" role="alert">
                {erro}
              </p>
            ) : (
              <p className="text-xs text-muted">
                A troca recarrega os dados do ambiente.
              </p>
            )}
            <Button
              size="sm"
              disabled={!alterado || trocando}
              type="button"
              onClick={trocar}
            >
              {trocando ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : null}
              Confirmar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
