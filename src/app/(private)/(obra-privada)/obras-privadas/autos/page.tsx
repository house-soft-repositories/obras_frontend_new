import { listAutosGlobaisPrivadasAction } from "@/core/actions/obras-privadas/obra_privada_recursos_actions";
import { AutosTable } from "../_components/tabelas-simples";
import { CriarAutoBar } from "../_components/criar-auto-bar";

export default async function AutosPage() {
  const autos = await listAutosGlobaisPrivadasAction({
    page: 1,
    take: 50,
    order: "DESC",
  });

  const obras = Array.from(
    new Map(
      autos.data.map((item) => [
        item.obraPrivadaId,
        {
          id: item.obraPrivadaId,
          codigo: item.obraCodigo,
          endereco: item.obraEndereco,
        },
      ]),
    ).values(),
  );

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
      <div className="mb-5">
        <CriarAutoBar obras={obras} />
      </div>
      <AutosTable data={autos.data} />
    </main>
  );
}
