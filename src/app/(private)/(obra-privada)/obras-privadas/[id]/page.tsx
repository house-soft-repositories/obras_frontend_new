import getObraPrivadaAction from "@/core/actions/obras-privadas/get_obra_privada_action";
import listUsuariosPaginationAction from "@/core/actions/usuarios/list_usuarios_pagination_action";
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
    alvaras,
    fiscalizacoes,
    autos,
    habiteSe,
    responsaveis,
    observacoes,
    arquivos,
    timeline,
    usuarios,
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
  const vistoriadores = (usuarios?.data ?? [])
    .filter((usuario) => usuario.role !== "USER")
    .map((usuario) => ({
      id: usuario.id,
      nome: usuario.email ? `${usuario.name} — ${usuario.email}` : usuario.name,
    }));
  return (
    <ObraPrivadaDetalheClient
      obra={obra}
      alvaras={alvaras}
      fiscalizacoes={fiscalizacoes}
      autos={autos}
      habiteSe={habiteSe}
      responsaveis={responsaveis}
      observacoes={observacoes}
      arquivos={arquivos}
      timeline={timeline}
      vistoriadores={vistoriadores}
    />
  );
}
