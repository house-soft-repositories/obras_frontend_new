# Toast / Erros — Guia detalhado (lazy)

> Leia apenas quando for exibir feedback de Server Action.

## Fluxo
1. Server Action retorna `ServerActionResult` com `error: string` já traduzido.
2. Componente client em `app/.../components/*` chama `const toast = useToast()` (`core/hooks/useToast.ts`) e decide:
```ts
const res = await doFoo(data)
if (!res.success) toast.error(res.error)
else toast.success("Feito!")
```
3. Nunca chame `toast` dentro da Server Action.

## Contexto
- `ToastProvider` em `app/layout.tsx` envolve a app.
- `useToast` retorna `success|error|info|warning`; tem fallback SSR inerte.
- Tipos em `core/types/toast.ts`, UI em `core/ui/atoms/toast.tsx`.

## Translators
- `core/errors/error_translator.ts` (base), `auth_error_translator.ts`, `user_error_translator.ts` — mapeiam chaves/códigos para mensagens pt-BR.
