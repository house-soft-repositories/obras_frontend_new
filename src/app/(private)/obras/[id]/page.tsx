import getObraAction from "@/core/actions/obras/get_obra_action";
import listObrasAction from "@/core/actions/obras/list_obras_action";
import { ObrasClient } from "../_components/obras-client";

export default async function ObraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [obra, obras] = await Promise.all([getObraAction(id), listObrasAction({ page: 1, take: 1, order: "DESC" })]);
  if (!obra) return <main className="mx-auto max-w-7xl px-5 py-12"><h1 className="font-display text-2xl font-bold">Obra não encontrada</h1></main>;
  return <ObrasClient mode="detail" obra={obra} obras={obras} orgaos={[]} usuarios={[]} fontes={[]} setores={[]} localidades={[]} eixos={[]} classificacoes={[]} tipologias={[]} />;
}
