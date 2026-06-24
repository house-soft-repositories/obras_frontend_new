import { AbasCronograma } from "@/components/cronograma/abas";
import { CronogramaGestao } from "@/components/cronograma/cronograma-gestao";
import type { Estagio, EstagioAtual } from "@/lib/api/cronograma";
import { apiServerFetch } from "@/lib/api/server";

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
  const [estagios, atual] = await Promise.all([
    carregar<Estagio[]>(`/obras/${id}/estagios?filtro=todos`, []),
    carregar<EstagioAtual | null>(`/obras/${id}/estagios/atual`, null),
  ]);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Cronograma da obra</h1>
      <AbasCronograma obraId={id} ativa="lista" />
      <CronogramaGestao
        obraId={id}
        estagiosIniciais={estagios}
        atualId={atual?.id ?? null}
      />
    </main>
  );
}
