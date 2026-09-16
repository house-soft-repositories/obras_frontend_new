import listEmpresasPaginationAction from "@/core/actions/empresas/list_empresas_pagination_action";
import { CriarEmpresaModal } from "./_components/criar-empresa-modal";
import { EmpresasTable } from "./_components/empresas-table";

export default async function EmpresasContratadasPage() {
  const empresas = await listEmpresasPaginationAction({ page: 1, order: "ASC", take: 10 });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Empresas Contratadas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Cadastre e gerencie as empresas contratadas para execução das obras.
          </p>
        </div>
        <CriarEmpresaModal />
      </section>
      <EmpresasTable data={empresas.data} meta={empresas.meta} />
    </main>
  );
}
