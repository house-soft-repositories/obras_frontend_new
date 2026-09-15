# Schemas + React Hook Form — Guia detalhado (lazy)

> Leia quando for criar formulário ou tipar domínio.

## Schemas
- Local: `core/schemas/<dominio>/*.ts`
- Padrão:
```ts
import { z } from "zod"
export const fooSchema = z.object({ name: z.string().min(1) })
export type FooInput = z.infer<typeof fooSchema>
```
- Env vars: `core/config/enviroment_variables.ts` com `envSchema` e `getEnv()`.

## React Hook Form
- Sempre em client component (`"use client"` em `app/.../components/*`).
- Stack: `react-hook-form` + `zodResolver` + `zod`.
```ts
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { fooSchema, type FooInput } from "@/core/schemas/foo/foo_schema"
import { Input } from "@/core/ui/atoms/input"
import { Label } from "@/core/ui/atoms/label"
import { FormError } from "@/core/ui/atoms/typography"

const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<FooInput>({
  resolver: zodResolver(fooSchema),
  mode: "onTouched",
  defaultValues: { name:"" }
})
const onSubmit = async (data: FooInput) => {
  const res = await doFoo(data)
  if (!res.success) toast.error(res.error)
}
```
- Use `FormField` para agrupar `Label` + `Input` + `FormError`/`hint`.
- `invalid={Boolean(errors.name)}` no `Input` para borda vermelha.

## Referência
- `app/(public)/login/components/LoginForm.tsx` é o exemplo canônico.
