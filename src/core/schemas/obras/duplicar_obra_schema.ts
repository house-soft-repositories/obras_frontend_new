import { z } from "zod";

export const duplicarObraSchema = z.object({
  nome: z.string().trim().min(1).optional(),
});

export type DuplicarObraInput = z.input<typeof duplicarObraSchema>;
