import { z } from "zod";
import { conselhoProfissionalSchema } from "@/core/schemas/profissionais-tecnicos/profissional_tecnico_schema";

export const updateProfissionalTecnicoSchema = z
  .object({
    conselho: conselhoProfissionalSchema.optional(),
    numeroRegistro: z.string().trim().min(1, "Informe o número do registro."),
    ufRegistro: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || value.length === 2,
        "Use a sigla da UF.",
      ),
    titulo: z.string().trim().optional(),
    ativo: z.boolean().optional(),
  })
  .transform((data) => ({
    conselho: data.conselho,
    numeroRegistro: data.numeroRegistro.trim(),
    ufRegistro: data.ufRegistro.trim()
      ? data.ufRegistro.trim().toUpperCase()
      : undefined,
    titulo: data.titulo?.trim() || undefined,
    ativo: data.ativo ?? true,
  }));

export type UpdateProfissionalTecnicoInput = z.input<
  typeof updateProfissionalTecnicoSchema
>;
export type UpdateProfissionalTecnicoOutput = z.output<
  typeof updateProfissionalTecnicoSchema
>;
