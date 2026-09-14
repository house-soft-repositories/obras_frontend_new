import listTipologiasPaginationAction from "@/core/actions/cadastros/list_tipologias_pagination_action";
import listSubtipologiasPaginationAction from "@/core/actions/cadastros/list_subtipologias_pagination_action";
import { CriarSubtipologiaModal } from "./_components/criar-subtipologia-modal";
import { SubtipologiasClient } from "./_components/subtipologias-client";

export default async function SubtipologiasPage() {
  const tipologiasPage = await listTipologiasPaginationAction({ page: 1, order: "ASC", take: 50 });
  const tipologias = tipologiasPage.data;
  const firstId = tipologias[0]?.id ?? null;
  const initial = firstId
    ? await listSubtipologiasPaginationAction({ tipologiaId: firstId, page: 1, order: "ASC", take: 10 })
    : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Subtipologias</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Vincule subtipologias às tipologias para refinar a classificação das obras.</p>
        </div>
        <CriarSubtipologiaModal tipologias={tipologias} defaultTipologiaId={firstId ?? undefined} />
      </section>
      {tipologias.length === 0 || !initial ? (
        <p className="rounded-app border border-dashed border-border p-8 text-center text-sm text-muted">Nenhuma tipologia cadastrada. Crie uma tipologia antes de adicionar subtipologias.</p>
      ) : (
        <SubtipologiasClient tipologias={tipologias} initialData={initial.data} initialMeta={initial.meta} initialTipologiaId={firstId} />
      )}
    </main>
  );
}
