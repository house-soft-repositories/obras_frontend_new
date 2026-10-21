# Error Handling — Guia detalhado (lazy)

> Leia apenas quando for implementar ou revisar tratamento de erros.

## Fluxo recomendado

```mermaid
flowchart TD
    A[Server Action] -->|try/catch| B{Erro?}
    B -->|Sim| C[ErrorTranslator.translate(error)]
    C --> D[Retorna ServerActionResult<T> com error:string]
    D --> E[Client Component]
    E --> F[useToast().error(res.error)]
    B -->|Não| G[Retorna ServerActionResult<T> com data]
    G --> E
    E --> H[UI de sucesso]
```

## 1. Server Actions — Padrão obrigatório

```ts
"use server";

import { fooErrorTranslator } from "@/core/errors/foo_error_translator";
import type ServerActionResult from "@/core/types/server_action_result";

export async function doFoo(input: FooInput): Promise<ServerActionResult<FooOutput>> {
  try {
    // chamada api / db
    return { success: true, data: result, error: null };
  } catch (error) {
    // Re-throw APENAS redirects do Next.js
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest?: string }).digest!.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    // Erros esperados → traduz e retorna
    return {
      success: false,
      data: null,
      error: fooErrorTranslator.translate(error),
    };
  }
}
```

**Regras:**
- Sempre `try/catch` envolvendo a chamada externa
- Use `*ErrorTranslator` do domínio correspondente (`obraErrorTranslator`, `obraPrivadaErrorTranslator`, `authErrorTranslator`, etc.)
- **Nunca** retorne stack traces ou mensagens técnicas brutas
- Re-throw **apenas** `NEXT_REDIRECT` (preserva `redirect()` do Next.js)

## 2. Error Translators

Local: `core/errors/*_translator.ts`

```ts
// core/errors/obra_error_translator.ts
export class ObraErrorTranslator extends ErrorTranslator {
  protected readonly messages: Record<string, string> = {
    "500": "Erro interno ao carregar obras. Tente novamente mais tarde.",
    "401": "Sua sessão expirou. Faça login novamente.",
    "403": "Você não tem permissão para acessar obras.",
    "404": "Nenhuma obra encontrada.",
    // Códigos de negócio do backend
    OBRA_NOT_FOUND: "Obra não encontrada.",
    OBRA_CREATE_FAILED: "Não foi possível criar a obra.",
  };
}

export const obraErrorTranslator = new ObraErrorTranslator();
```

O `ErrorTranslator` base (`core/errors/error_translator.ts`) já lida com:
- `HttpClientException`: extrai `error.data.message`, `error.message`, `error.statusCode`
- `Error`: usa `error.message`
- `string`: busca direta
- Fallback: `"Ocorreu um erro inesperado. Tente novamente."`

## 3. Client Components — Consumo

```tsx
"use client";

import { useToast } from "@/core/hooks/useToast";
import doFoo from "@/core/actions/foo/do_foo_action";

export function FooForm() {
  const toast = useToast();

  async function handleSubmit(data: FooInput) {
    const res = await doFoo(data);
    if (!res.success) {
      toast.error(res.error);  // ← Mensagem já traduzida
      return;
    }
    toast.success("Operação realizada com sucesso!");
    // ... navegação / refresh
  }
}
```

**NUNCA** faça:
```ts
// ❌ Errado
throw new Error(res.error);
try { await doFoo(data) } catch (e) { toast.error(e.message) }
```

## 4. error.tsx / global-error.tsx — Quando usar

**USE para:**
- Erros inesperados (bugs, `throw new Error(...)`, crashes de Server Components)
- Erros de rendering (ex.: componente quebra durante render)

**NÃO USE para:**
- Erros de Server Actions (eles retornam `ServerActionResult<T>` com `error:string`)
- Erros esperados de negócio (validação, 4xx, 5xx da API)

Exemplo `global-error.tsx` (já existe no projeto):
```tsx
"use client";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  // Log para observabilidade
  useEffect(() => { console.error(error); }, [error]);

  // Trata casos especiais (ex.: tenant context)
  if (isTenantContextRequired(error)) return <TenantContextRequiredCard onRetry={retry} />;

  return <ErrorCard error={error} onRetry={retry} />;
}
```

## 5. Interceptors — O que NÃO fazer

Interceptors (`core/rest_client/interceptors/*`) são para **cross-cutting concerns**:
- Auth (adiciona token)
- Tenant context (header `x-tenant-id`)
- Logging (request/response)
- Token refresh (401 → refresh → retry)

**NÃO** coloque lógica de negócio ou tratamento de erros de domínio nos interceptors. Erros de API (4xx/5xx) devem borbulhar até a Server Action e serem tratados lá via `ErrorTranslator`.

## 6. Exemplo canônico completo

- **Action:** `core/actions/obras/list_obras_action.ts`
- **Translator:** `core/errors/obra_error_translator.ts`
- **Client:** `app/(private)/obras/_components/obras-client.tsx` (usa `useToast`)

## 7. Checklist rápido

- [ ] Server Action tem `try/catch`?
- [ ] Importa `*ErrorTranslator` do domínio?
- [ ] Re-throw apenas `NEXT_REDIRECT`?
- [ ] Retorna `ServerActionResult<T>` com `error: string` traduzida?
- [ ] Client component usa `useToast().error(res.error)`?
- [ ] NÃO há `throw` de erro de negócio no client?
- [ ] `error.tsx` só trata erros inesperados?