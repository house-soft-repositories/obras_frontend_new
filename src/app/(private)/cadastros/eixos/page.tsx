import listEixosPaginationAction from "@/core/actions/cadastros/list_eixos_pagination_action";
import { CriarEixoModal } from "./_components/criar-eixo-modal";
import { EixosTable } from "./_components/eixos-table";

export default async function EixosPage() {
  const eixos = await listEixosPaginationAction({ page: 1, order: "ASC", take: 50 });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Eixos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Cadastre e organize os eixos estratégicos vinculados às obras.</p>
        </div>
        <CriarEixoModal />
      </section>
      <EixosTable data={eixos.data} meta={eixos.meta} />
    </main>
  );
}
