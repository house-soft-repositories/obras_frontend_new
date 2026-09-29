import { z } from "zod";

export const toggleAtivoProfissionalTecnicoSchema = z.object({
  ativo: z.boolean(),
});

export type ToggleAtivoProfissionalTecnicoInput = z.input<
  typeof toggleAtivoProfissionalTecnicoSchema
>;
export type ToggleAtivoProfissionalTecnicoOutput = z.output<
  typeof toggleAtivoProfissionalTecnicoSchema
>;
