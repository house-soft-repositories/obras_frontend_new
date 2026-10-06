<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<INSTRUCTIONS>


## Obras — Convenções (lazy-loading)

> **Regra de carregamento:** este arquivo é o índice. NÃO leia os guias detalhados na inicialização. Leia o guia específico **apenas quando a tarefa exigir aquele domínio**.
>
> | Tarefa | Ler quando for fazer |
> |---|---|
> | Server Actions | `docs/agent/server-actions.md` |
> | Toast / Erros | `docs/agent/toast-errors.md` |
> | Schemas + React Hook Form | `docs/agent/forms.md` |
> | UI atoms / molecules / páginas | `docs/agent/ui.md` |

Se o arquivo detalhado não existir localmente, siga o resumo abaixo e o exemplo canônico citado.

### 1. Server Actions — resumo
- Local: `core/actions/<dominio>/<acao>.ts`, sempre `"use server"` na primeira linha.
- Valide entrada com `schema.safeParse(input)`; em falha retorne `{ success:false, data:null, error: string }` — nunca `throw` de validação.
- Retorno sempre `Promise<ServerActionResult<T>>` (`core/types/server_action_result.ts`).
- Traduza erros com `*ErrorTranslator` (`core/errors/*_translator.ts`); em `AuthError` use `error.cause`.
- Re-throw apenas `digest?.startsWith("NEXT_REDIRECT")` para preservar redirects do Next.
- **Exemplo canônico:** `core/actions/auth/credentials.ts` — leia-o inteiro quando for criar nova action.

### 2. Toast para erros de Server Actions — resumo
- Server Action **não** chama `toast`; ela retorna `error: string`.
- Componente client (`app/.../components/*`) consome o retorno e chama `useToast()` (`core/hooks/useToast.ts`):
  ```ts
  const toast = useToast()
  const res = await signInWithCredentials(data)
  if (!res.success) toast.error(res.error)
  else toast.success("Bem-vindo ao Qiosq!")
  ```
- `useToast` tem fallback SSR inerte; `ToastProvider` em `app/layout.tsx` já provê contexto.

### 3. Schemas + tipagem
- Local: `core/schemas/<dominio>/*.ts` com `zod`.
- Exporte `export const fooSchema = z.object({...})` e `export type FooInput = z.infer<typeof fooSchema>`.
- Nunca duplique tipos manuais — importe o `Infer` do schema. Validação de env em `core/config/enviroment_variables.ts` (`getEnv()` / `env`).

### 4. React Hook Form — resumo
- Client components apenas (`"use client"` em `app/.../components/*`).
- ```ts
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email:"", password:"" }
  })
  ```
- Erros → `<FormError>{errors.email?.message}</FormError>` + `invalid={Boolean(errors.email)}` no `Input`.
- Envolva campos com `FormField` + `Label`; use `Small`/`FormError` de `core/ui/atoms/typography.tsx`.

### 5. Páginas e componentes
- `app/(private|public)/<rota>/page.tsx` é **thin server component**: busca dados / checa sessão e renderiza `<ClientComponent />` de `app/.../components/`.
- Lógica e interatividade ficam em `app/.../components/*` (um arquivo por responsabilidade, ex.: `LoginForm.tsx`).
- Nunca importe componente client com `server-only` no topo da page; mantenha separação.

### 6. UI — atoms vs molecules
- `core/ui/atoms/*` — puros, reutilizáveis em toda a app, sem regra de negócio. Usam `twMerge` + `tv` + `core/styles/tokens.ts` e `app/globals.css` (ex.: `button.tsx`, `input.tsx`, `input-mask.tsx`, `card.tsx`, `typography.tsx`).
- `core/ui/molecules/*` — composição maior com contexto/portal/estado (ex.: `modal.tsx` = `Modal` + `ModalContent` + `ModalTitle` + `ModalCloseButton`). Pode usar `createPortal`, `focus-trap`, mas sem regra de domínio.

</INSTRUCTIONS>
