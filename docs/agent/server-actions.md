# Server Actions — Guia detalhado (lazy)

> Leia este arquivo **apenas** quando for criar ou alterar uma Server Action.

## Local e forma
- `core/actions/<dominio>/<acao>.ts` — um arquivo por ação, export nomeado + default.
- Primeira linha obrigatória: `"use server"`
- Assinatura: `export async function foo(input: FooInput): Promise<ServerActionResult<T>>`
- Tipo de retorno em `core/types/server_action_result.ts`: `{success:true,data:T,error:null}|{success:false,data:null,error:string}`

## Template canônico
```ts
"use server"
import { FooError } from "next-auth"
import { fooErrorTranslator } from "@/core/errors/foo_error_translator"
import { fooSchema, type FooInput } from "@/core/schemas/foo/foo_schema"
import type ServerActionResult from "@/core/types/server_action_result"

export async function doFoo(input: FooInput): Promise<ServerActionResult<void>> {
  const parsed = fooSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos."
    return { success:false, data:null, error: message }
  }
  try {
    // chamada api / db
    return { success:true, data: undefined as void, error:null }
  } catch (error) {
    if ((error as {digest?:string}).digest?.startsWith("NEXT_REDIRECT")) throw error
    return { success:false, data:null, error: fooErrorTranslator.translate(error) }
  }
}
```

## Regras
- Use `safeParse`, não `parse` (evita throw).
- Traduza tudo via `*ErrorTranslator`.
- Chame `getEnv()` para acessar env validado, nunca `process.env` direto.
- Não retorne stack traces.

## Referência
- Exemplo real: `core/actions/auth/credentials.ts`
