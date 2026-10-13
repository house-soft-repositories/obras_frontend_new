import { z } from "zod";
import { userSchema } from "@/core/schemas/user/user_schema";

/**
 * Credenciais do login (e-mail + senha). Deriva de `userSchema` via `pick`
 * para nunca duplicar o formato dos campos — regra do projeto: importe o
 * `Infer` do schema em vez de tipos manuais.
 */
export const credentialsSchema = userSchema
  .pick({ email: true, password: true })
  .extend({
    email: z.email("Informe um e-mail válido."),
    password: z.string().min(1, "Informe sua senha."),
  });

export type CredentialsInput = z.infer<typeof credentialsSchema>;
