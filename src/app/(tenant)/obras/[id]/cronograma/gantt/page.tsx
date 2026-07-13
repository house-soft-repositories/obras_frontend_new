import { AbasCronograma } from "@/components/cronograma/abas";
import { Gantt } from "@/components/cronograma/gantt";
import type {
  DatasAgregadas,
  Estagio,
  EstagioAtual,
} from "@/lib/api/cronograma";
import { apiServerFetch } from "@/lib/api/server";

export const dynamic = "force-dynamic";

async function carregar<T>(caminho: string, padrao: T): Promise<T> {
  try {
    return await apiServerFetch<T>(caminho);
  } catch {
    return padrao;
  }
}

export default async function GanttPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [estagios, datas, atual] = await Promise.all([
    carregar<Estagio[]>(`/obras/${id}/estagios?filtro=todos`, []),
    carregar<DatasAgregadas>(`/obras/${id}/estagios/datas-agregadas`, {
      dataInicio: null,
      dataPrazo: null,
    }),
    carregar<EstagioAtual | null>(`/obras/${id}/estagios/atual`, null),
  ]);

  return (
    <div>
      <AbasCronograma obraId={id} ativa="gantt" />
      <Gantt estagios={estagios} intervalo={datas} atualId={atual?.id ?? null} />
    </div>
  );
}
