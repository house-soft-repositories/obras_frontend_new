"use server";

import { cepErrorTranslator } from "@/core/errors/cep_error_translator";
import {
  lookupCepSchema,
  type LookupCepData,
  type LookupCepInput,
} from "@/core/schemas/localidade/lookup_cep_schema";
import type ServerActionResult from "@/core/types/server_action_result";

type BrasilApiResponse = {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  location?: {
    coordinates?: {
      latitude?: string | number;
      longitude?: string | number;
    };
  };
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

const timeout = { signal: AbortSignal.timeout(5000) };

function coordinates(data: BrasilApiResponse) {
  const latitude = data.location?.coordinates?.latitude;
  const longitude = data.location?.coordinates?.longitude;
  return {
    latitude: latitude == null ? "" : String(latitude),
    longitude: longitude == null ? "" : String(longitude),
  };
}

function toResult(
  cep: string,
  data: BrasilApiResponse | ViaCepResponse,
  source: "BRASIL_API" | "VIACEP",
): LookupCepData {
  const brasilApi = data as BrasilApiResponse;
  const viaCep = data as ViaCepResponse;
  const coords =
    source === "BRASIL_API"
      ? coordinates(brasilApi)
      : { latitude: "", longitude: "" };

  return {
    cep: viaCep.cep ?? cep,
    logradouro: brasilApi.street ?? viaCep.logradouro ?? "",
    complemento: viaCep.complemento ?? "",
    bairro: brasilApi.neighborhood ?? viaCep.bairro ?? "",
    cidade: brasilApi.city ?? viaCep.localidade ?? "",
    uf: brasilApi.state ?? viaCep.uf ?? "",
    ...coords,
    geoOrigem: coords.latitude && coords.longitude ? source : "",
  };
}

async function responseJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, {
    ...timeout,
    headers: { accept: "application/json" },
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

export default async function lookupCepAction(
  input: LookupCepInput,
): Promise<ServerActionResult<LookupCepData>> {
  const parsed = lookupCepSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Informe um CEP válido.",
    };
  }

  try {
    const brasilApi = await responseJson<BrasilApiResponse>(
      `https://brasilapi.com.br/api/cep/v2/${parsed.data.cep}`,
    );
    if (brasilApi) {
      return {
        success: true,
        data: toResult(parsed.data.cep, brasilApi, "BRASIL_API"),
        error: null,
      };
    }

    const viaCep = await responseJson<ViaCepResponse>(
      `https://viacep.com.br/ws/${parsed.data.cep}/json/`,
    );
    if (!viaCep || viaCep.erro) {
      return {
        success: false,
        data: null,
        error: cepErrorTranslator.translate("CEP_NOT_FOUND"),
      };
    }

    return {
      success: true,
      data: toResult(parsed.data.cep, viaCep, "VIACEP"),
      error: null,
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
      error: cepErrorTranslator.translate("CEP_LOOKUP_FAILED"),
    };
  }
}
