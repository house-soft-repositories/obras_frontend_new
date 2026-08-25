import { DadosObra } from "@/components/obras/detalhe/dados-obra";
import { ObraForm } from "@/components/obras/obra-form";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import {
  PainelLicenciamento,
  PainelLocalizacao,
  PainelRecebimento,
  PainelTitularidade,
} from "@/components/obras/guias/paineis-recurso";
import { PainelEquipe } from "@/components/obras/painel-equipe";
import { PainelObservacoes } from "@/components/obras/painel-observacoes";
import {
  podeEscrever,
  type Contrato,
  type EmpresaContratada,
  type PrazoFinalExecucao,
} from "@/lib/api/contratos";
import type { FormularioObra } from "@/lib/api/obras";
import { carregarOpcoesObra } from "@/lib/api/obras-opcoes";
import { apiServerFetch } from "@/lib/api/server";
import { carregarUsuarios } from "@/lib/api/usuarios";
import { obterPerfilAtual } from "@/lib/auth/perfil";
import { gruposDadosObra } from "@/lib/ui/dados-obra";

export const dynamic = "force-dynamic";

type ObraDetalhe = Partial<FormularioObra> & {
  id: string;
  codigo?: string;
  vincularPagamentoPercentual?: boolean;
};

interface Localizacao {
  id: string;
  localidade: string;
  uf: string;
  latitude?: string | null;
  longitude?: string | null;
}

async function carregar<T>(caminho: string, padrao: T): Promise<T> {
  try {
    return await apiServerFetch<T>(caminho);
  } catch {
    return padrao;
  }
}

export default async function DadosObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [
    opcoes,
    obra,
    orcamentos,
    tags,
    usuarios,
    localidades,
    contratos,
    empresas,
    localizacoes,
    perfil,
  ] = await Promise.all([
    carregarOpcoesObra(),
    carregar<ObraDetalhe | null>(`/obras/${id}`, null),
    carregar<{ fonteId: string; valor: string }[]>(
      `/obras/${id}/orcamentos`,
      [],
    ),
    carregar<{ nome: string }[]>(`/obras/${id}/tags`, []),
    carregarUsuarios(),
    carregar<OpcaoSelect[]>("/localidades", []),
    carregar<Contrato[]>("/contratos", []),
    carregar<EmpresaContratada[]>("/empresas-contratadas", []),
    carregar<Localizacao[]>(`/obras/${id}/localizacoes`, []),
    obterPerfilAtual(),
  ]);

  if (!obra) {
    return (
      <div className="cartao">
        <h2 style={{ margin: 0 }}>Obra não encontrada</h2>
      </div>
    );
  }

  const valoresIniciais: Partial<FormularioObra> = {
    ...obra,
    orcamentos:
      orcamentos.length > 0
        ? orcamentos.map((o) => ({
            fonteId: o.fonteId,
            valor: String(o.valor),
          }))
        : [{ fonteId: "", valor: "" }],
  };

  // Empresa contratada e prazo final vem do contrato da obra (1 por obra).
  const contrato = contratos.find((c) => c.obraId === id) ?? null;
  const prazo = contrato
    ? await carregar<PrazoFinalExecucao | null>(
        `/contratos/${contrato.id}/prazo-final`,
        null,
      )
    : null;

  const primeira = localizacoes[0];
  const grupos = gruposDadosObra({
    nome: obra.nome ?? null,
    codigo: obra.codigo ?? null,
    orgaoNome: opcoes.orgaos.find((o) => o.id === obra.orgaoId)?.nome ?? null,
    tipo: obra.tipo ?? null,
    localidadeNome:
      localidades.find((l) => l.id === obra.localidadeId)?.nome ?? null,
    status: obra.status ?? null,
    empresaContratadaNome:
      empresas.find((e) => e.id === contrato?.empresaContratadaId)
        ?.razaoSocial ?? null,
    responsavelNome:
      usuarios.find((u) => u.id === obra.responsavelUsuarioId)?.nome ?? null,
    dataInicio: obra.dataInicio ?? null,
    prazoFinal: prazo?.prazoFinal ?? obra.dataPrazo ?? null,
    latitude: primeira?.latitude ?? null,
    longitude: primeira?.longitude ?? null,
    vincularPagamentoPercentual: obra.vincularPagamentoPercentual ?? false,
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <DadosObra
        grupos={grupos}
        podeEditar={podeEscrever(perfil)}
        formulario={
          <ObraForm
            modo="editar"
            obraId={id}
            opcoes={opcoes}
            valoresIniciais={valoresIniciais}
            tagsIniciais={tags.map((t) => t.nome).join(", ")}
            guiasRecurso={{
              localizacao: <PainelLocalizacao obraId={id} />,
              titularidade: <PainelTitularidade obraId={id} />,
              licenciamento: <PainelLicenciamento obraId={id} />,
              recebimento: <PainelRecebimento obraId={id} />,
            }}
          />
        }
      />
      <div className="cartao">
        <PainelEquipe obraId={id} usuarios={usuarios} />
      </div>
      <div className="cartao">
        <PainelObservacoes obraId={id} />
      </div>
    </div>
  );
}
