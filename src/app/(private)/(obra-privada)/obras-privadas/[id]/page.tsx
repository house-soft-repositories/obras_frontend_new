import getObraPrivadaAction from "@/core/actions/obras-privadas/get_obra_privada_action";
import { ObraPrivadaDetalheClient } from "./_components/obra-privada-detalhe-client";

export default async function ObraPrivadaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const obra = await getObraPrivadaAction(id);
  if (!obra) {
    return (
      <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-2xl font-bold">
          Obra privada não encontrada
        </h1>
        <p className="mt-2 text-sm text-muted">
          Verifique o endereço ou volte para a listagem de obras privadas.
        </p>
      </main>
    );
  }
  return <ObraPrivadaDetalheClient obra={obra} />;
}
