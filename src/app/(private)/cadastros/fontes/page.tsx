import listFontesPaginationAction from "@/core/actions/fontes/list_fontes_pagination_action";
import { CriarFonteModal } from "./_components/criar-fonte-modal";
import { FontesTable } from "./_components/fontes-table";

function parseAtivo(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}

export default async function FontesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const fontes = await listFontesPaginationAction({
    page: 1,
    order: "ASC",
    take: 10,
    ativo: parseAtivo(params.ativo),
  });

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
