import listLocalidadesPaginationAction from "@/core/actions/localidades/list_localidades_pagination_action";
import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import { CriarOrgaoModal } from "./_components/criar-orgao-modal";
import { OrgaosTable } from "./_components/orgaos-table";

export default async function OrgaosPage() {
  const [orgaos, localidades] = await Promise.all([
    listOrgaosPaginationAction({ page: 1, order: "ASC", take: 10 }),
    listLocalidadesPaginationAction({ page: 1, order: "ASC", take: 50 }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Órgãos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Cadastre secretarias, autarquias, fundações e empresas públicas
            vinculadas a localidades.
          </p>
        </div>
        <CriarOrgaoModal localidades={localidades.data} />
      </section>
      <OrgaosTable data={orgaos.data} meta={orgaos.meta} />
    </main>
  );
}
