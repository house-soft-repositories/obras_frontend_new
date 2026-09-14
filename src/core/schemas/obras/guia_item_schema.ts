import { z } from "zod";

export const guiaItemSchema = z
  .object({
    id: z.string().uuid(),
  })
  .passthrough();

export type GuiaItem = z.infer<typeof guiaItemSchema>;
