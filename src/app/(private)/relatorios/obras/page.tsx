import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import { listarObrasRelatorio } from "@/core/actions/relatorios/obras_relatorio_action";
import { Caption, Eyebrow, Heading } from "@/core/ui/atoms/typography";
import { FiltrosObras } from "./_components/filtros-obras";
import { ListaObras } from "./_components/lista-obras";
import { QuantificadoresBar } from "./_components/quantificadores-bar";

function valor(params: Record<string, string | string[] | undefined>, chave: string): string {
  const v = params[chave];
  return typeof v === "string" ? v : "";
}

export default async function RelatorioObrasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filtro = {
    q: valor(params, "q"),
    status: valor(params, "status"),
    tipo: valor(params, "tipo"),
    orgaoId: valor(params, "orgaoId"),
  };

  const [{ obras, quantificadores }, orgaos] = await Promise.all([
    listarObrasRelatorio({
      q: filtro.q || undefined,
      status: filtro.status || undefined,
      tipo: filtro.tipo || undefined,
      orgaoId: filtro.orgaoId || undefined,
    }),
    listOrgaosPaginationAction({ page: 1, order: "ASC", take: 50 }),
  ]);

  const temFiltro = Object.values(filtro).some((v) => v !== "");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-6 border-b border-border pb-8">
        <Eyebrow>Relatórios</Eyebrow>
        <Heading className="mt-1 text-3xl sm:text-4xl">Obras</Heading>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Filtre a carteira, confira os quantificadores e navegue pelas obras.
          Filtros lidos da URL no servidor.
        </p>
      </section>

      <div className="grid gap-4">
        <QuantificadoresBar q={quantificadores} />
        <FiltrosObras
          inicial={filtro}
          orgaos={orgaos.data.map((o) => ({ id: o.id, nome: o.nome }))}
        />
        {obras.length === 0 ? (
          <section className="rounded-app border border-dashed border-border p-12 text-center">
            <Heading as="h2" className="text-xl">
              Nenhuma obra para os filtros atuais
            </Heading>
            <Caption className="mt-2">
              {temFiltro
                ? "Ajuste ou limpe os filtros para ver mais resultados."
                : "Cadastre a primeira obra para começar o relatório."}
            </Caption>
          </section>
        ) : (
          <ListaObras obras={obras} />
        )}
      </div>
    </main>
  );
}
