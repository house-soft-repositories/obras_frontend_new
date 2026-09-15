import getObraAction from "@/core/actions/obras/get_obra_action";
import { ObraDetalheClient } from "../_components/obra-detalhe-client";

export default async function ObraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const obra = await getObraAction(id);
  if (!obra)
    return (
      <main className="mx-auto max-w-7xl px-5 py-12">
        <h1 className="font-display text-2xl font-bold">Obra não encontrada</h1>
      </main>
    );
  return <ObraDetalheClient obra={obra} />;
}
