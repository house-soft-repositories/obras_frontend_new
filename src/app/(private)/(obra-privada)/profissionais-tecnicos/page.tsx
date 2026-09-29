import listPessoaPaginationAction from "@/core/actions/pessoa/list_pessoa_pagination_action";
import listProfissionaisTecnicosAction from "@/core/actions/profissionais-tecnicos/list_profissionais_tecnicos_action";
import { CriarProfissionalTecnicoModal } from "./_components/criar-profissional-tecnico-modal";
import { ProfissionaisTecnicosTable } from "./_components/profissionais-tecnicos-table";

export default async function ProfissionaisTecnicosPage() {
  const [profissionais, pessoas] = await Promise.all([
    listProfissionaisTecnicosAction(),
    listPessoaPaginationAction({ page: 1, order: "ASC", take: 50 }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Obras privadas</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Profissionais técnicos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Vincule pessoas cadastradas aos seus conselhos profissionais para
            uso como responsáveis técnicos em obras privadas.
          </p>
        </div>
        <CriarProfissionalTecnicoModal pessoas={pessoas.data} />
      </section>
      <ProfissionaisTecnicosTable data={profissionais} />
    </main>
  );
}
