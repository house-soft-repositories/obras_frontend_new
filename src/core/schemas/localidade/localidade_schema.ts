import {z} from "zod";
import TipoLocalidade from "@/core/schemas/localidade/tipo_localidade_enum";

export const tipoLocalidadeSchema = z.enum(TipoLocalidade);

export const localidadeSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  uf: z.string().min(2).max(2),
  codigoIbge: z.string().nullable(),
  tipo: z.enum(TipoLocalidade),
  municipio: z.string().nullable(),
  observacoes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})


export type LocalidadeSchema = z.infer<typeof localidadeSchema>;