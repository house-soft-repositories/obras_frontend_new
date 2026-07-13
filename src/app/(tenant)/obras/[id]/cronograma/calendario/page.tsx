import { AbasCronograma } from "@/components/cronograma/abas";
import { Calendario } from "@/components/cronograma/calendario";
import type { DatasAgregadas, Estagio } from "@/lib/api/cronograma";
import { apiServerFetch } from "@/lib/api/server";

export const dynamic = "force-dynamic";

async function carregar<T>(caminho: string, padrao: T): Promise<T> {
  try {
    return await apiServerFetch<T>(caminho);
  } catch {
    return padrao;
  }
}

/** Mes inicial: do inicio do cronograma, senao o mes corrente. */
function mesInicial(datas: DatasAgregadas): { ano: number; mes: number } {
  const base = datas.dataInicio ?? datas.dataPrazo;
  if (base) {
    const [ano, mes] = base.split("-").map(Number);
    return { ano, mes };
  }
  const hoje = new Date();
  return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
}

export default async function CalendarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [estagios, datas] = await Promise.all([
    carregar<Estagio[]>(`/obras/${id}/estagios?filtro=todos`, []),
    carregar<DatasAgregadas>(`/obras/${id}/estagios/datas-agregadas`, {
      dataInicio: null,
      dataPrazo: null,
    }),
  ]);
  const inicial = mesInicial(datas);

  return (
    <div>
      <AbasCronograma obraId={id} ativa="calendario" />
      <Calendario
        estagios={estagios}
        anoInicial={inicial.ano}
        mesInicial={inicial.mes}
      />
    </div>
  );
}
