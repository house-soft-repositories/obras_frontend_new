"use server";

import {
  lookupCnpjSchema,
  type LookupCnpjInput,
} from "@/core/schemas/empresas/lookup_cnpj_schema";
import type ServerActionResult from "@/core/types/server_action_result";

export type LookupCnpjData = {
  razaoSocial: string;
  nomeFantasia: string;
  email: string;
  telefones: string[];
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

type BrasilApiCnpjResponse = {
  razao_social?: string;
  nome_fantasia?: string | null;
  email?: string | null;
  ddd_telefone_1?: string | null;
  ddd_telefone_2?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  uf?: string | null;
};

function clean(value?: string | null) {
  return value?.trim() ?? "";
}

function normalizePhone(value?: string | null) {
  return value?.replace(/\D/g, "") ?? "";
}

export default async function lookupCnpjAction(
  input: LookupCnpjInput,
): Promise<ServerActionResult<LookupCnpjData>> {
  const parsed = lookupCnpjSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Informe um CNPJ válido.",
    };
  }

  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${parsed.data.cnpj}`,
      {
        signal: AbortSignal.timeout(5000),
        headers: { accept: "application/json" },
      },
    );
    if (!response.ok) {
      return { success: false, data: null, error: "CNPJ não encontrado." };
    }

    const data = (await response.json()) as BrasilApiCnpjResponse;
    const telefones = [data.ddd_telefone_1, data.ddd_telefone_2]
      .map(normalizePhone)
      .filter(Boolean);

    return {
      success: true,
      error: null,
      data: {
        razaoSocial: clean(data.razao_social),
        nomeFantasia: clean(data.nome_fantasia),
        email: clean(data.email),
        telefones,
        cep: clean(data.cep).replace(/\D/g, ""),
        logradouro: clean(data.logradouro),
        numero: clean(data.numero),
        complemento: clean(data.complemento),
        bairro: clean(data.bairro),
        cidade: clean(data.municipio),
        uf: clean(data.uf).toUpperCase(),
      },
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest?: string }).digest!.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return {
      success: false,
      data: null,
      error: "Não foi possível consultar o CNPJ agora.",
    };
  }
}
