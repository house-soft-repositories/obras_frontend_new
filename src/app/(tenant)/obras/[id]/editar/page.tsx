import { ObraForm } from "@/components/obras/obra-form";
import {
  PainelLicenciamento,
  PainelLocalizacao,
  PainelRecebimento,
  PainelTitularidade,
} from "@/components/obras/guias/paineis-recurso";
import { PainelEquipe } from "@/components/obras/painel-equipe";
import { PainelObservacoes } from "@/components/obras/painel-observacoes";
import type { FormularioObra } from "@/lib/api/obras";
import { carregarOpcoesObra } from "@/lib/api/obras-opcoes";
import { apiServerFetch } from "@/lib/api/server";
import { carregarUsuarios } from "@/lib/api/usuarios";

export const dynamic = "force-dynamic";

type ObraDetalhe = Partial<FormularioObra> & { id: string };

async function carregar<T>(caminho: string, padrao: T): Promise<T> {
  try {
    return await apiServerFetch<T>(caminho);
  } catch {
    return padrao;
  }
}

export default async function EditarObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [opcoes, obra, orcamentos, tags, usuarios] = await Promise.all([
    carregarOpcoesObra(),
    carregar<ObraDetalhe | null>(`/obras/${id}`, null),
    carregar<{ fonteId: string; valor: string }[]>(
      `/obras/${id}/orcamentos`,
      [],
    ),
    carregar<{ nome: string }[]>(`/obras/${id}/tags`, []),
    carregarUsuarios(),
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
        ? orcamentos.map((o) => ({ fonteId: o.fonteId, valor: String(o.valor) }))
        : [{ fonteId: "", valor: "" }],
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
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
      <div className="cartao">
        <PainelEquipe obraId={id} usuarios={usuarios} />
      </div>
      <div className="cartao">
        <PainelObservacoes obraId={id} />
      </div>
    </div>
  );
}
