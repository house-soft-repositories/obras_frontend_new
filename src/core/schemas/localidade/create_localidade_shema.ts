import { localidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import { z } from "zod";
import TipoLocalidade from "@/core/schemas/localidade/tipo_localidade_enum";

export const criarLocalidadeSchema = localidadeSchema
  .pick({
    nome: true,
    uf: true,
  })
  .extend({
    codigoIbge: z.string().optional(),
    tipo: z.enum(TipoLocalidade).optional(),
    municipio: z.string().optional(),
    observacoes: z.string().optional(),
  })
  .transform((data) => {
    if (data.codigoIbge === "") {
      data.codigoIbge = undefined;
    }
    if (data.municipio === "") {
      data.municipio = undefined;
    }
    if (data.observacoes === "") {
      data.observacoes = undefined;
    }
    return data;
  })

export type CriarLocalidadeInput = z.infer<typeof criarLocalidadeSchema>;
export type CriarLocalidadeOutput = z.output<typeof criarLocalidadeSchema>;
