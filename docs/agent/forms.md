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

### Wizards multi-etapas
- Mantenha o `<form>` estável durante a troca de etapas.
- Os controles de navegação devem ser `type="button"` e chamar uma função que execute `await form.trigger(fieldsByStep[step])` antes de atualizar `step`.
- Não monte dinamicamente um botão `type="submit"` ao entrar na etapa de revisão: navegadores podem interpretar a montagem do controle como um submit prematuro.
- Para o botão final, use `type="button"` e, somente quando `step` estiver na revisão, chame explicitamente `void form.handleSubmit(onSubmit)()` no `onClick` de `Salvar`.
- Não use `useRef`, timestamps ou `lastAdvanceRef` como workaround para esse problema; a solução é separar a navegação do submit e evitar submit nativo durante a transição.

Exemplo:
```tsx
const fieldsByStep = [["name"], ["details"], []] as const

async function nextStep() {
  const valid = await form.trigger(fieldsByStep[step])
  if (valid) setStep((current) => current + 1)
}

<form onSubmit={form.handleSubmit(onSubmit)}>
  {/* campos da etapa atual */}
  <button
    type="button"
    onClick={() => {
      if (step < steps.length - 1) {
        void nextStep()
        return
      }
      void form.handleSubmit(onSubmit)()
    }}
  >
    {step < steps.length - 1 ? "Avançar" : "Salvar"}
  </button>
</form>
```

A referência oficial de `trigger` confirma que passar uma string ou array valida somente os campos informados; chamar `trigger()` sem argumento valida o formulário inteiro.

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
