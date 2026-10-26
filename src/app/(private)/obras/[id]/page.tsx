import getObraAction from "@/core/actions/obras/get_obra_action";
import { parseObraTab, type ObraTabId } from "@/core/config/obra-tabs";
import { ArquivosTab } from "../_components/tabs/arquivos-tab";
import { ContratoTab } from "../_components/tabs/contrato-tab";
import { CronogramaTab } from "../_components/tabs/cronograma-tab";
import { DadosTab } from "../_components/tabs/dados-tab";
import { FinanceiroTab } from "../_components/tabs/financeiro-tab";
import { MedicoesTab } from "../_components/tabs/medicoes-tab";
import { RecebimentosTab } from "../_components/tabs/recebimentos-tab";
import { TagsTab } from "../_components/tabs/tags-tab";
import { ObraDetalheClient } from "../_components/obra-detalhe-client";

type Obra = NonNullable<Awaited<ReturnType<typeof getObraAction>>>;

async function ObraTabContent({ tab, obra }: { tab: ObraTabId; obra: Obra }) {
  switch (tab) {
    case "dados":
      return <DadosTab obra={obra} />;
    case "cronograma":
      return <CronogramaTab obraId={obra.id} />;
    case "contrato":
      return <ContratoTab obraId={obra.id} />;
    case "medicoes":
      return <MedicoesTab obraId={obra.id} />;
    case "financeiro":
      return <FinanceiroTab obraId={obra.id} />;
    case "arquivos":
      return <ArquivosTab obraId={obra.id} />;
    case "recebimentos":
      return <RecebimentosTab obraId={obra.id} />;
    case "tags":
      return <TagsTab obraId={obra.id} />;
  }
}

export default async function ObraDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const activeTab = parseObraTab(query.tab);
  const obra = await getObraAction(id);

  if (!obra) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-12">
        <h1 className="font-display text-2xl font-bold">Obra não encontrada</h1>
      </main>
    );
  }

  return (
    <ObraDetalheClient obra={obra} activeTab={activeTab}>
      {await ObraTabContent({ tab: activeTab, obra })}
    </ObraDetalheClient>
  );
}
