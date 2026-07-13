import { AbasCronograma } from "@/components/cronograma/abas";
import { CronogramaGestao } from "@/components/cronograma/cronograma-gestao";
import type { Estagio, EstagioAtual } from "@/lib/api/cronograma";
import { apiServerFetch } from "@/lib/api/server";
import { carregarUsuarios } from "@/lib/api/usuarios";

export const dynamic = "force-dynamic";

async function carregar<T>(caminho: string, padrao: T): Promise<T> {
  try {
    return await apiServerFetch<T>(caminho);
  } catch {
    return padrao;
  }
}

export default async function CronogramaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [estagios, atual, usuarios] = await Promise.all([
    carregar<Estagio[]>(`/obras/${id}/estagios?filtro=todos`, []),
    carregar<EstagioAtual | null>(`/obras/${id}/estagios/atual`, null),
    carregarUsuarios(),
  ]);

  return (
    <div>
      <AbasCronograma obraId={id} ativa="lista" />
      <CronogramaGestao
        obraId={id}
        estagiosIniciais={estagios}
        atualId={atual?.id ?? null}
        usuarios={usuarios}
      />
    </div>
  );
}
