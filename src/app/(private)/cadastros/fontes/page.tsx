import listFontesPaginationAction from "@/core/actions/fontes/list_fontes_pagination_action";
import { CriarFonteModal } from "./_components/criar-fonte-modal";
import { FontesTable } from "./_components/fontes-table";

export default async function FontesPage() {
  const fontes = await listFontesPaginationAction({ page: 1, order: "ASC", take: 10 });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Fontes
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Cadastre e gerencie as fontes pagadoras vinculadas às obras.
          </p>
        </div>
        <CriarFonteModal />
      </section>
      <FontesTable data={fontes.data} meta={fontes.meta} />
    </main>
  );
}
