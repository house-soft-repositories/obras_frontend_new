import getObraPrivadaAction from "@/core/actions/obras-privadas/get_obra_privada_action";
import listUsuariosPaginationAction from "@/core/actions/usuarios/list_usuarios_pagination_action";
import listProfissionaisTecnicosAction from "@/core/actions/profissionais-tecnicos/list_profissionais_tecnicos_action";
import {
  listAlvarasObraPrivadaAction,
  listArquivosObraPrivadaAction,
  listAutosObraPrivadaAction,
  listFiscalizacoesObraPrivadaAction,
  listHabiteSeObraPrivadaAction,
  listObservacoesObraPrivadaAction,
  listResponsaveisObraPrivadaAction,
  listTimelineObraPrivadaAction,
} from "@/core/actions/obras-privadas/obra_privada_recursos_actions";
import { ObraPrivadaDetalheClient } from "./_components/obra-privada-detalhe-client";

export default async function ObraPrivadaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [
    obra,
    alvarasResult,
    fiscalizacoesResult,
    autosResult,
    habiteSeResult,
    responsaveisResult,
    observacoesResult,
    arquivosResult,
    timelineResult,
    usuarios,
    profissionais,
  ] = await Promise.all([
    getObraPrivadaAction(id),
    listAlvarasObraPrivadaAction(id),
    listFiscalizacoesObraPrivadaAction(id),
    listAutosObraPrivadaAction(id),
    listHabiteSeObraPrivadaAction(id),
    listResponsaveisObraPrivadaAction(id),
    listObservacoesObraPrivadaAction(id),
    listArquivosObraPrivadaAction(id),
    listTimelineObraPrivadaAction(id),
    listUsuariosPaginationAction({ page: 1, order: "ASC", take: 50 }).catch(
      () => ({ data: [] }),
    ),
    listProfissionaisTecnicosAction(),
  ]);
  if (!obra) {
    return (
      <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-2xl font-bold">
          Obra privada não encontrada
        </h1>
        <p className="mt-2 text-sm text-muted">
          Verifique o endereço ou volte para a listagem de obras privadas.
        </p>
      </main>
    );
  }
  if (!fiscalizacoesResult.success) {
    throw new Error(fiscalizacoesResult.error);
  }
  if (!autosResult.success) {
    throw new Error(autosResult.error);
  }
  if (!habiteSeResult.success) {
    throw new Error(habiteSeResult.error);
  }
  if (!responsaveisResult.success) {
    throw new Error(responsaveisResult.error);
  }
  if (!observacoesResult.success) {
    throw new Error(observacoesResult.error);
  }
  if (!arquivosResult.success) {
    throw new Error(arquivosResult.error);
  }

  const vistoriadores = (usuarios?.data ?? [])
    .filter((usuario) => usuario.role !== "USER")
    .map((usuario) => ({
      id: usuario.id,
      nome: usuario.email ? `${usuario.name} — ${usuario.email}` : usuario.name,
    }));
  const profissionaisPorId = new Map(
    profissionais.map((profissional) => [profissional.id, profissional]),
  );
  const responsaveisComNome = responsaveisResult.data.map((responsavel) => {
    const profissional = responsavel.profissionalTecnicoId
      ? profissionaisPorId.get(responsavel.profissionalTecnicoId)
      : undefined;
    return {
      ...responsavel,
      profissionalNome: profissional?.nome ?? responsavel.profissionalNome,
      numeroDocumento:
        responsavel.numeroDocumento ?? profissional?.documento ?? null,
    };
  });
  if (!alvarasResult.success) {
    throw new Error(alvarasResult.error);
  }
  if (!timelineResult.success) {
    throw new Error(timelineResult.error);
  }

  return (
    <ObraPrivadaDetalheClient
      obra={obra}
      alvaras={alvarasResult.data}
      fiscalizacoes={fiscalizacoesResult.data}
      autos={autosResult.data}
      habiteSe={habiteSeResult.data}
      responsaveis={responsaveisComNome}
      observacoes={observacoesResult.data}
      arquivos={arquivosResult.data}
      timeline={timelineResult.data}
      profissionais={profissionais}
      vistoriadores={vistoriadores}
    />
  );
}
