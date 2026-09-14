import listLocalidadesPaginationAction from "@/core/actions/localidades/list_localidades_pagination_action";
import { CriarLocalidadeModal } from "./_components/criar-localidade-modal";
import { LocalidadesTable } from "./_components/localidades-table";

export default async function LocalidadesPage() {
  const localidades = await listLocalidadesPaginationAction({
    page: 1,
    order: "ASC",
    take: 10,
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Localidades
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Gerencie bairros, distritos, regiões e zonas rurais usados na
            organização das obras.
          </p>
        </div>
        <CriarLocalidadeModal />
      </section>
      <LocalidadesTable data={localidades.data} meta={localidades.meta} />
    </main>
  );
}
