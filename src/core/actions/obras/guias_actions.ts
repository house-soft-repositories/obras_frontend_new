"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { GuiaItem } from "@/core/schemas/obras/guia_item_schema";

const tag = (obraId: string, guia: string) => `obra-${obraId}-${guia}`;
async function list(obraId: string, guia: string) {
  const res = await api.auth.get<GuiaItem[]>(`/api/obras/${obraId}/${guia}`, { next: { tags: [tag(obraId, guia)] } });
  return Array.isArray(res.data) ? res.data : [];
}
async function mutate(obraId: string, guia: string, method: "post" | "patch" | "delete", id: string | undefined, payload?: unknown) {
  const path = `/api/obras/${obraId}/${guia}${id ? `/${id}` : ""}`;
  const res = await api.auth[method](path, payload === undefined ? undefined : { headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  updateTag(tag(obraId, guia)); updateTag(`obra-${obraId}`); return res.data;
}
export const listLocalizacoesAction = (id: string) => list(id, "localizacoes");
export const criarLocalizacaoAction = (id: string, payload: unknown) => mutate(id, "localizacoes", "post", undefined, payload);
export const removerLocalizacaoAction = (id: string, itemId: string) => mutate(id, "localizacoes", "delete", itemId);
export const listOrcamentosAction = (id: string) => list(id, "orcamentos");
export const criarOrcamentoAction = (id: string, payload: unknown) => mutate(id, "orcamentos", "post", undefined, payload);
export const removerOrcamentoAction = (id: string, itemId: string) => mutate(id, "orcamentos", "delete", itemId);
export const listLicencasAction = (id: string) => list(id, "licencas");
export const criarLicencaAction = (id: string, payload: unknown) => mutate(id, "licencas", "post", undefined, payload);
export const atualizarLicencaAction = (id: string, itemId: string, payload: unknown) => mutate(id, "licencas", "patch", itemId, payload);
export const removerLicencaAction = (id: string, itemId: string) => mutate(id, "licencas", "delete", itemId);
export const listRecebimentosAction = (id: string) => list(id, "recebimentos");
export const criarRecebimentoAction = (id: string, payload: unknown) => mutate(id, "recebimentos", "post", undefined, payload);
export const atualizarRecebimentoAction = (id: string, itemId: string, payload: unknown) => mutate(id, "recebimentos", "patch", itemId, payload);
export const removerRecebimentoAction = (id: string, itemId: string) => mutate(id, "recebimentos", "delete", itemId);
export const getTitularidadeAction = (id: string) => list(id, "titularidade");
export const salvarTitularidadeAction = (id: string, payload: unknown) => mutate(id, "titularidade", "post", undefined, payload);
