import { cache } from "react";
import type { UsuarioResumo } from "@/lib/ui/usuario-labels";
import { apiServerFetch } from "./server";

/**
 * Lista os usuarios do tenant (ativos e inativos) para montar selects e mapas
 * de nome. `cache` deduplica chamadas repetidas dentro do mesmo request.
 */
export const carregarUsuarios = cache(async (): Promise<UsuarioResumo[]> => {
  try {
    return await apiServerFetch<UsuarioResumo[]>("/usuarios");
  } catch {
    return [];
  }
});
