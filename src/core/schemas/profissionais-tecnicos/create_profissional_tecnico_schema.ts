import { z } from "zod";
import { conselhoProfissionalSchema } from "@/core/schemas/profissionais-tecnicos/profissional_tecnico_schema";

const optionalText = z.string().trim().optional();

export const createProfissionalTecnicoSchema = z
  .object({
    pessoaId: z.uuid("Selecione uma pessoa cadastrada."),
    conselho: conselhoProfissionalSchema,
    numeroRegistro: z.string().trim().min(1, "Informe o número do registro."),
    ufRegistro: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || value.length === 2,
        "Use a sigla da UF.",
      ),
    titulo: optionalText,
    ativo: z.boolean().optional(),
  })
  .transform((data) => {
    const cleaned = (value?: string) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    };
    return {
      pessoaId: data.pessoaId,
      conselho: data.conselho,
      numeroRegistro: data.numeroRegistro.trim(),
      ufRegistro: data.ufRegistro.trim()
        ? data.ufRegistro.trim().toUpperCase()
        : undefined,
      titulo: cleaned(data.titulo),
      ativo: data.ativo ?? true,
    };
  });

export type CreateProfissionalTecnicoInput = z.input<
  typeof createProfissionalTecnicoSchema
>;
export type CreateProfissionalTecnicoOutput = z.output<
  typeof createProfissionalTecnicoSchema
>;
