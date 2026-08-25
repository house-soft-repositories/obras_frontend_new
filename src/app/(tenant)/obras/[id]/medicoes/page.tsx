import { MedicoesGestao } from "@/components/medicoes/medicoes-gestao";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import { podeEscrever } from "@/lib/api/contratos";
import type { VisaoFisicoFinanceira } from "@/lib/api/financeiro";
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

  const [medicoes, orgaos, fontes, visao, perfil] = await Promise.all([
    carregar<Medicao[]>(`/obras/${obraId}/medicoes`, []),
    carregar<OpcaoSelect[]>("/orgaos", []),
    carregar<OpcaoSelect[]>("/fontes?ativo=true", []),
    // Percentual do medido sobre o total contratado (RN-FIN-08), exibido no
    // card "Valor medido total".
    carregar<VisaoFisicoFinanceira | null>(
      `/obras/${obraId}/visao-fisico-financeira`,
      null,
    ),
    obterPerfilAtual(),
  ]);

  const opcoesOrgao: OpcaoSelect[] = orgaos.map((o) => ({
    id: o.id,
    nome: o.nome,
  }));

  return (
    <div>
      <MedicoesGestao
        obraId={obraId}
        medicoesIniciais={medicoes}
        opcoesFonte={fontes}
        opcoesOrgao={opcoesOrgao}
        percentualMedido={visao?.medidoTotal.percentual ?? null}
        podeEditar={podeEscrever(perfil)}
      />
    </div>
  );
}
