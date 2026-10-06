import { listLicenciamentoPrivadasAction } from "@/core/actions/obras-privadas/obra_privada_recursos_actions";
import { LicenciamentoTable } from "../_components/tabelas-simples";
import { CriarLicenciamentoBar } from "../_components/criar-licenciamento-bar";

export default async function LicenciamentoPage() {
  const licenciamento = await listLicenciamentoPrivadasAction({
    page: 1,
    take: 50,
    order: "DESC",
  });

  const obras = Array.from(
    new Map(
      licenciamento.data.map((item) => [
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
          Licenciamento
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Situação de alvarás e habite-se das obras privadas.
        </p>
      </section>
      <div className="mb-5">
        <CriarLicenciamentoBar obras={obras} />
      </div>
      <LicenciamentoTable data={licenciamento.data} />
    </main>
  );
}
