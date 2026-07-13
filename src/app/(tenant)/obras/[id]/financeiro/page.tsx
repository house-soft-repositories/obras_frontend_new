import { FinanceiroGestao } from "@/components/financeiro/financeiro-gestao";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import { podeEscrever } from "@/lib/api/contratos";
import type {
  Empenho,
  Liquidacao,
  Pagamento,
  VisaoFisicoFinanceira,
} from "@/lib/api/financeiro";
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

export default async function FinanceiroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: obraId } = await params;

  const [empenhos, liquidacoes, pagamentos, visao, fontes, perfil] =
    await Promise.all([
      carregar<Empenho[]>(`/obras/${obraId}/empenhos`, []),
      carregar<Liquidacao[]>(`/obras/${obraId}/liquidacoes`, []),
      carregar<Pagamento[]>(`/obras/${obraId}/pagamentos`, []),
      carregar<VisaoFisicoFinanceira | null>(
        `/obras/${obraId}/visao-fisico-financeira`,
        null,
      ),
      carregar<OpcaoSelect[]>("/fontes?ativo=true", []),
      obterPerfilAtual(),
    ]);

  return (
    <div>
      <FinanceiroGestao
        obraId={obraId}
        opcoesFonte={fontes}
        empenhosIniciais={empenhos}
        liquidacoesIniciais={liquidacoes}
        pagamentosIniciais={pagamentos}
        visaoInicial={visao}
        podeEditar={podeEscrever(perfil)}
      />
    </div>
  );
}
