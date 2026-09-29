"use server";

import api from "@/core/rest_client/api";
import { OrgaoSchema } from "@/core/schemas/orgaos/orgao_schema";

export default async function getOrgaoAction(id: string) {
  const response = await api.auth.get<OrgaoSchema>(`/api/orgaos/${id}`, {
    next: { tags: ["orgao", `orgao-${id}`] },
  });
  return response.data;
}
