import listTipologiasPaginationAction from "@/core/actions/cadastros/list_tipologias_pagination_action";
import { CriarTipologiaModal } from "./_components/criar-tipologia-modal";
import { TipologiasTable } from "./_components/tipologias-table";

export default async function TipologiasPage() {
  const tipologias = await listTipologiasPaginationAction({ page: 1, order: "ASC", take: 10 });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Tipologias</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Cadastre os tipos de obra e gerencie suas subtipologias.</p>
        </div>
        <CriarTipologiaModal />
      </section>
      <TipologiasTable data={tipologias.data} meta={tipologias.meta} />
    </main>
  );
}
