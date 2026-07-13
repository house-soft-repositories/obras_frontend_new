import { ContratoGestao } from "@/components/contratos/contrato-gestao";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import {
  podeEscrever,
  type Aditivo,
  type Contrato,
  type EmpresaContratada,
  type Paralisacao,
  type PrazoFinalExecucao,
  type ValoresContrato,
} from "@/lib/api/contratos";
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

export default async function ContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: obraId } = await params;

  const [contratos, empresas, fontes, perfil] = await Promise.all([
    carregar<Contrato[]>("/contratos", []),
    carregar<EmpresaContratada[]>("/empresas-contratadas", []),
    carregar<OpcaoSelect[]>("/fontes?ativo=true", []),
    obterPerfilAtual(),
  ]);

  // 1 contrato por obra (RN-CON do E4): seleciona o da obra atual.
  const contrato = contratos.find((c) => c.obraId === obraId) ?? null;

  let aditivos: Aditivo[] = [];
  let paralisacoes: Paralisacao[] = [];
  let prazo: PrazoFinalExecucao | null = null;
  let valores: ValoresContrato | null = null;
  if (contrato) {
    [aditivos, paralisacoes, prazo, valores] = await Promise.all([
      carregar<Aditivo[]>(`/contratos/${contrato.id}/aditivos`, []),
      carregar<Paralisacao[]>(`/contratos/${contrato.id}/paralisacoes`, []),
      carregar<PrazoFinalExecucao | null>(
        `/contratos/${contrato.id}/prazo-final`,
        null,
      ),
      carregar<ValoresContrato | null>(
        `/contratos/${contrato.id}/valores`,
        null,
      ),
    ]);
  }

  const empresasOpcoes: OpcaoSelect[] = empresas.map((e) => ({
    id: e.id,
    nome: e.razaoSocial,
  }));

  return (
    <div>
      <ContratoGestao
        obraId={obraId}
        empresas={empresasOpcoes}
        opcoesFonte={fontes}
        contratoInicial={contrato}
        aditivosIniciais={aditivos}
        paralisacoesIniciais={paralisacoes}
        prazoInicial={prazo}
        valoresIniciais={valores}
        podeEditar={podeEscrever(perfil)}
      />
    </div>
  );
}
