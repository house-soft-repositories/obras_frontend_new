import type { OpcaoSelect, OpcoesObra } from "@/components/obras/obra-form";
import { rotuloUsuario } from "@/lib/ui/usuario-labels";
import { apiServerFetch } from "./server";
import { carregarUsuarios } from "./usuarios";

async function lista(caminho: string): Promise<OpcaoSelect[]> {
  try {
    return await apiServerFetch<OpcaoSelect[]>(caminho);
  } catch {
    return [];
  }
}

/** Usuarios ativos como opcoes "Nome - Setor" para o campo Responsavel. */
async function listaResponsaveis(): Promise<OpcaoSelect[]> {
  const usuarios = await carregarUsuarios();
  return usuarios
    .filter((u) => u.ativo)
    .map((u) => ({ id: u.id, nome: rotuloUsuario(u) }));
}

/** Carrega as opcoes de select do cadastro de Obra (cadastros ativos). */
export async function carregarOpcoesObra(): Promise<OpcoesObra> {
  const [orgaos, fontes, eixos, classificacoes, tipologias, responsaveis] =
    await Promise.all([
      lista("/orgaos"),
      lista("/fontes?ativo=true"),
      lista("/eixos?ativos=true"),
      lista("/classificacoes?ativos=true"),
      lista("/tipologias?ativos=true"),
      listaResponsaveis(),
    ]);
  return { orgaos, fontes, eixos, classificacoes, tipologias, responsaveis };
}
