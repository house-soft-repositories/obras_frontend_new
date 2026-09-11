"use client";

import { Building2, Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import switchTenancyAction from "@/core/actions/auth/switch_tenancy_action";

type TenantOption = { id: string; name: string; slug: string };

export function TenantAppBar({ tenants }: { tenants: TenantOption[] }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<TenantOption | null>(null);
  const currentTenant = selectedTenant ?? session?.user?.tenant ?? null;
  const canSwitchTenant = session?.user?.role === "SUPERADMIN";

  if (!session?.user) return null;

  async function selectTenant(tenant: TenantOption) {
    if (!canSwitchTenant || saving || tenant.id === currentTenant?.id) {
      setOpen(false);
      return;
    }
    setSaving(true);
    setError(null);
    setSelectedTenant(tenant);
    try {
      const result = await switchTenancyAction(tenant.id);
      if (!result.success) throw new Error(result.error);
      setSelectedTenant(result.data);
      await update();
      setOpen(false);
      router.refresh();
    } catch (switchError) {
      setSelectedTenant(session?.user?.tenant ?? null);
      setError(switchError instanceof Error ? switchError.message : "Não foi possível trocar a tenancy.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <header className="relative z-20 flex min-h-16 items-center justify-between border-b border-border bg-surface px-4 py-3 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent">
          <Building2 className="size-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {canSwitchTenant ? "SuperAdmin" : "Tenancy"}
          </p>
          <p className="text-sm font-semibold text-foreground">Contexto corrente</p>
        </div>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => canSwitchTenant && setOpen((value) => !value)}
          disabled={saving || !canSwitchTenant}
          className="flex min-w-56 items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm hover:bg-surface-subtle disabled:opacity-60"
          aria-expanded={open}
        >
          <span className="min-w-0">
            <span className="block truncate font-semibold">{currentTenant?.name ?? "Selecionar tenancy"}</span>
            <span className="block truncate text-xs text-muted">{currentTenant?.slug ?? "Nenhuma selecionada"}</span>
          </span>
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : canSwitchTenant ? <ChevronsUpDown className="size-4 text-muted" /> : null}
        </button>
        {open && canSwitchTenant && (
          <div className="absolute right-0 mt-2 max-h-72 w-72 overflow-auto rounded-lg border border-border bg-surface p-1 shadow-overlay">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => selectTenant(tenant)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-surface-subtle"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{tenant.name}</span>
                  <span className="block truncate text-xs text-muted">{tenant.slug}</span>
                </span>
                {tenant.id === currentTenant?.id && <Check className="size-4 shrink-0 text-accent" />}
              </button>
            ))}
          </div>
        )}
        {error && <p className="absolute right-0 mt-2 w-72 text-xs text-destructive">{error}</p>}
      </div>
    </header>
  );
}
