import type { OpcaoSelect, OpcoesObra } from "@/components/obras/obra-form";
import { apiServerFetch } from "./server";

async function lista(caminho: string): Promise<OpcaoSelect[]> {
  try {
    return await apiServerFetch<OpcaoSelect[]>(caminho);
  } catch {
    return [];
  }
}

/** Carrega as opcoes de select do cadastro de Obra (cadastros ativos). */
export async function carregarOpcoesObra(): Promise<OpcoesObra> {
  const [orgaos, fontes, eixos, classificacoes, tipologias] = await Promise.all(
    [
      lista("/orgaos"),
      lista("/fontes?ativo=true"),
      lista("/eixos?ativos=true"),
      lista("/classificacoes?ativos=true"),
      lista("/tipologias?ativos=true"),
    ],
  );
  return { orgaos, fontes, eixos, classificacoes, tipologias };
}
