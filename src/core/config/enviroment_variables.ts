import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  NEXT_API_URL: z.string().url("NEXT_API_URL deve ser uma URL válida"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL deve ser uma URL válida"),
  NEXT_STORAGE_URL: z.url("NEXT_STORAGE_URL deve ser uma URL válida"),
  NEXT_EXPIRES_SECONDS_CSRF_TOKEN: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .positive(
          "NEXT_EXPIRES_SECONDS_CSRF_TOKEN deve ser um número positivo",
        ),
    ),
  NEXT_EXPIRES_SECONDS_ACCESS_TOKEN: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .positive(
          "NEXT_EXPIRES_SECONDS_ACCESS_TOKEN deve ser um número positivo",
        ),
    ),
  NEXT_API_KEY: z.string(),
  NEXT_AUTH_SECRET: z.string().min(1, "NEXT_AUTH_SECRET é obrigatório"),

  NEXT_SHOW_LOGGING_RESQUEST: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional()
    .default(false),
  NEXT_SHOW_LOGGING_RESPONSE: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional()
    .default(false),
  NEXT_SHOW_LOGGING_ERROR: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional()
    .default(false),
});

export type Enviroment = z.infer<typeof envSchema>;

let validatedEnv: Enviroment | null = null;

export function getEnv(): Enviroment {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => `${err.path.join(".")} - ${err.message}`)
        .join("\n");

      const message = `❌ Erro na validação das variáveis de ambiente:\n${errorMessages}`;
      throw new Error(message);
    }
    throw error;
  }
}

export const env = getEnv();
