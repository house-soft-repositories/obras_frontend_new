import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import listSetoresPaginationAction from "@/core/actions/setores/list_setores_pagination_action";
import { CriarSetorModal } from "./_components/criar-setor-modal";
import { SetoresTable } from "./_components/setores-table";

export default async function SetoresPage() {
  const [setores, orgaos] = await Promise.all([
    listSetoresPaginationAction({ page: 1, order: "ASC", take: 10 }),
    listOrgaosPaginationAction({ page: 1, order: "ASC", take: 50 }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Setores
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Organize os setores vinculados aos órgãos para encaminhamento e
            acompanhamento interno.
          </p>
        </div>
        <CriarSetorModal orgaos={orgaos.data} />
      </section>
      <SetoresTable data={setores.data} meta={setores.meta} />
    </main>
  );
}
