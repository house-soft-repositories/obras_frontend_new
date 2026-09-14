import listClassificacoesPaginationAction from "@/core/actions/cadastros/list_classificacoes_pagination_action";
import listSubclassificacoesPaginationAction from "@/core/actions/cadastros/list_subclassificacoes_pagination_action";
import { CriarSubclassificacaoModal } from "./_components/criar-subclassificacao-modal";
import { SubclassificacoesClient } from "./_components/subclassificacoes-client";

export default async function SubclassificacoesPage() {
  const classificacoesPage = await listClassificacoesPaginationAction({ page: 1, order: "ASC", take: 50 });
  const classificacoes = classificacoesPage.data;
  const firstId = classificacoes[0]?.id ?? null;
  const initial = firstId
    ? await listSubclassificacoesPaginationAction({ classificacaoId: firstId, page: 1, order: "ASC", take: 10 })
    : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Subclassificações</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Vincule subclassificações às classificações para detalhar o enquadramento das obras.</p>
        </div>
        <CriarSubclassificacaoModal classificacoes={classificacoes} defaultClassificacaoId={firstId ?? undefined} />
      </section>
      {classificacoes.length === 0 || !initial ? (
        <p className="rounded-app border border-dashed border-border p-8 text-center text-sm text-muted">Nenhuma classificação cadastrada. Crie uma classificação antes de adicionar subclassificações.</p>
      ) : (
        <SubclassificacoesClient classificacoes={classificacoes} initialData={initial.data} initialMeta={initial.meta} initialClassificacaoId={firstId} />
      )}
    </main>
  );
}
