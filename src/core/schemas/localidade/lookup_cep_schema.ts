import { z } from "zod";

export const lookupCepSchema = z.object({
  cep: z.string().regex(/^\d{8}$/, "Informe um CEP válido."),
});

export type LookupCepInput = z.infer<typeof lookupCepSchema>;

export type LookupCepData = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: string;
  longitude: string;
  geoOrigem: string;
};
