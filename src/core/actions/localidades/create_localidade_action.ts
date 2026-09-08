"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { CriarLocalidadeOutput } from "@/core/schemas/localidade/create_localidade_shema";


export async function criarLocalidadeAction(data: CriarLocalidadeOutput) {
  await api.auth.post("/api/localidades", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...data,
    }),
  });
  updateTag("list-localidade");
  return { ok: true };
}
