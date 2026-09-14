import listTenanciesAction from "@/core/actions/tenancies/list_tenancies_action";
import { CriarTenantModal } from "./_components/criar-tenant-modal";
import { TenantsTable } from "./_components/tenants-table";

export default async function TenantsPage() {
  const tenants = await listTenanciesAction();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Administração</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tenants
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Liste e provisione organizações disponíveis para usuários
            SUPERADMIN.
          </p>
        </div>
        <CriarTenantModal />
      </section>

      <TenantsTable tenants={tenants} />
    </main>
  );
}
