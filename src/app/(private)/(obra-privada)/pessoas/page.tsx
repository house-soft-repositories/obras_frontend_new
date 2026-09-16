import listPessoaPaginationAction from "@/core/actions/pessoa/list_pessoa_pagination_action";
import { CriarPessoaModal } from "./_components/criar-pessoa-modal";
import { PessoasTable } from "./_components/pessoas-table";

export default async function PessoasPage() {
  const pessoas = await listPessoaPaginationAction({ page: 1, order: "ASC", take: 50 });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pessoas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Cadastre e gerencie as pessoas físicas e jurídicas vinculadas às
            obras privadas, incluindo proprietários e responsáveis técnicos.
          </p>
        </div>
        <CriarPessoaModal />
      </section>
      <PessoasTable data={pessoas.data} meta={pessoas.meta} />
    </main>
  );
}
