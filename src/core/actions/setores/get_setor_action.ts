"use server";

import api from "@/core/rest_client/api";
import { SetorSchema } from "@/core/schemas/setores/setor_schema";

export default async function getSetorAction(orgaoId: string, id: string) {
  const response = await api.auth.get<SetorSchema>(
    `/api/orgaos/${orgaoId}/setores/${id}`,
    { next: { tags: ["setor", `setor-${id}`] } },
  );
  return response.data;
}
