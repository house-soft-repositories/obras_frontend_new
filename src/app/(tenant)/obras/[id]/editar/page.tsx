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
  const [opcoes, obra, orcamentos, tags] = await Promise.all([
    carregarOpcoesObra(),
    carregar<ObraDetalhe | null>(`/obras/${id}`, null),
    carregar<{ fonteId: string; valor: string }[]>(
      `/obras/${id}/orcamentos`,
      [],
    ),
    carregar<{ nome: string }[]>(`/obras/${id}/tags`, []),
  ]);

  if (!obra) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Obra nao encontrada</h1>
      </main>
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
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Editar obra: {obra.nome ?? id}</h1>
      <p>
        <a href={`/obras/${id}/cronograma`}>→ Cronograma da obra</a>
        {" · "}
        <a href={`/obras/${id}/arquivos`}>→ Arquivos da obra</a>
      </p>
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
      <hr style={{ margin: "2rem 0" }} />
      <PainelEquipe obraId={id} />
      <hr style={{ margin: "2rem 0" }} />
      <PainelObservacoes obraId={id} />
    </main>
  );
}
