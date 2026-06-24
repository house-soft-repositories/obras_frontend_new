import { MedicoesGestao } from "@/components/medicoes/medicoes-gestao";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import { podeEscrever } from "@/lib/api/contratos";
import type { Medicao } from "@/lib/api/medicoes";
import { apiServerFetch } from "@/lib/api/server";
import { obterPerfilAtual } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

async function carregar<T>(caminho: string, padrao: T): Promise<T> {
  try {
    return await apiServerFetch<T>(caminho);
  } catch {
    return padrao;
  }
}

export default async function MedicoesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: obraId } = await params;

  const [medicoes, orgaos, fontes, perfil] = await Promise.all([
    carregar<Medicao[]>(`/obras/${obraId}/medicoes`, []),
    carregar<OpcaoSelect[]>("/orgaos", []),
    carregar<OpcaoSelect[]>("/fontes?ativo=true", []),
    obterPerfilAtual(),
  ]);

  const opcoesOrgao: OpcaoSelect[] = orgaos.map((o) => ({
    id: o.id,
    nome: o.nome,
  }));

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Medicoes da obra</h1>
      <MedicoesGestao
        obraId={obraId}
        medicoesIniciais={medicoes}
        opcoesFonte={fontes}
        opcoesOrgao={opcoesOrgao}
        podeEditar={podeEscrever(perfil)}
      />
    </main>
  );
}
