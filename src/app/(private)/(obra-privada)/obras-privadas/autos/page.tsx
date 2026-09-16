import listObrasPrivadasAction from "@/core/actions/obras-privadas/list_obras_privadas_action";
import { AutosTable } from "../_components/tabelas-simples";

export default async function AutosPage() {
  const obras = await listObrasPrivadasAction({
    page: 1,
    take: 50,
    order: "DESC",
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 border-b border-border pb-8">
        <p className="text-sm font-medium text-muted">Obras privadas</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Autos
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Obras autuadas ou embargadas pela fiscalização.
        </p>
      </section>
      <AutosTable data={obras.data} />
    </main>
  );
}
