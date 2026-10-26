import { ErrorTranslator } from "@/core/errors/error_translator";

class CepErrorTranslator extends ErrorTranslator {
  protected readonly messages: Record<string, string> = {
    CEP_NOT_FOUND: "CEP não encontrado.",
    CEP_LOOKUP_FAILED: "Não foi possível consultar o CEP agora.",
    "404": "CEP não encontrado.",
  };
}

export const cepErrorTranslator = new CepErrorTranslator();
