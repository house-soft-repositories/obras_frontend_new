"use server";

import api from "@/core/rest_client/api";
import type { ProfissionalTecnico } from "@/core/schemas/profissionais-tecnicos/profissional_tecnico_schema";

export default async function listProfissionaisTecnicosAction() {
  const response = await api.auth.get<ProfissionalTecnico[]>(
    "/api/profissionais-tecnicos",
    {
      next: {
        tags: ["list-profissionais-tecnicos"],
      },
    },
  );

  return response.data;
}
