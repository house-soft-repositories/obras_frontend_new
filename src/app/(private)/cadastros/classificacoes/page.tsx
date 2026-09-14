import listClassificacoesPaginationAction from "@/core/actions/cadastros/list_classificacoes_pagination_action";
import { CriarClassificacaoModal } from "./_components/criar-classificacao-modal";
import { ClassificacoesTable } from "./_components/classificacoes-table";

export default async function ClassificacoesPage() {
  const classificacoes = await listClassificacoesPaginationAction({ page: 1, order: "ASC", take: 10 });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Classificações</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Gerencie as classificações e acesse suas subclassificações vinculadas.</p>
        </div>
        <CriarClassificacaoModal />
      </section>
      <ClassificacoesTable data={classificacoes.data} meta={classificacoes.meta} />
    </main>
  );
}
