# Especificação — migração de autenticação para Auth.js (NextAuth)

**Status:** proposta aprovada para implementação  
**Data:** 2026-09-01  
**Escopo:** `obras_frontend` com o backend existente `obras_backend`

## Objetivo

Substituir o gerenciamento manual dos cookies `obras_access` e
`obras_refresh` por uma sessão JWT do Auth.js (NextAuth v5). O backend
continua sendo a autoridade de identidade: ele autentica credenciais, emite e
renova os tokens próprios. O frontend passa a guardar esses tokens apenas
dentro do JWT de sessão criptografado e HTTP-only do Auth.js.

## Contexto atual

O login do frontend chama `POST /api/auth/login`, que encaminha a credencial
para `POST /auth/login` no backend e grava dois cookies próprios. O BFF em
`/api/proxy/[...path]` lê o cookie de access token, chama a API e, em um `401`,
envia o refresh token ao backend para repetir a requisição. O middleware
inspeciona o `exp` do JWT sem verificar assinatura.

O backend fornece o contrato de token necessário:

- `POST /auth/login`, com `email` e `senha`;
- `POST /auth/refresh`, recebendo `refreshToken`;
- `GET /auth/me`, protegido por bearer token;
- access token com expiração de 6 horas e refresh token de 7 dias.

## Decisões

### Auth.js como sessão de borda

- Usar `next-auth@beta` / Auth.js v5 no App Router, com estratégia
  `session: { strategy: "jwt" }`.
- Configurar um único `Credentials` provider. O `authorize()` chama
  diretamente o backend com `cache: "no-store"`.
- O provider recebe somente `email` e `senha`. A autenticação não depende de
  `tenantSlug` nem envia `x-tenant-slug`.
- O Auth.js grava seu cookie de sessão HTTP-only, `Secure` em produção e
  `SameSite=Lax`. Não haverá cookies próprios de access ou refresh token.

### Tokens e renovação

- O JWT interno do Auth.js contém `accessToken`, `refreshToken`,
  `accessTokenExpiresAt`, `userId`, `nome` e `tenantId`.
- `accessTokenExpiresAt` é calculado a partir do claim `exp` do access token,
  sem confiar em uma duração fixada no frontend.
- O callback `jwt` mantém o token enquanto estiver válido. Quando vencido,
  chama `POST /auth/refresh` e substitui `accessToken` e o prazo de expiração.
- Como o backend atualmente devolve o refresh token novamente, o callback usa o
  retornado; se uma futura API não o devolver, preserva o anterior.
- Falhas de renovação definem `token.error = "RefreshTokenError"`, invalidam o
  uso do access token e levam o usuário ao login no próximo acesso protegido.
- Access e refresh token **não** são expostos pelo callback `session`. A sessão
  pública contém somente dados mínimos de identidade e `error`, se houver.

### BFF e autorização

- O BFF `/api/proxy/[...path]` lê o JWT criptografado do Auth.js por um helper
  exclusivamente server-side e inclui o access token interno como
  `Authorization: Bearer` ao chamar o backend. O callback `session` não o
  expõe ao navegador.
- Todo Route Handler e todo fetch server-side que acessa dados protegidos deve
  verificar a sessão perto da fonte de dados. `proxy.ts` é somente uma camada
  otimista de redirecionamento; não é a defesa de autorização.
- `apiServerFetch()` deixa de ler cookies manualmente e usa a sessão retornada
  por `auth()`.
- A autorização por perfil continua no backend. Quando necessário para a UI,
  o perfil deve vir de `/auth/me` ou de uma claim validada pelo backend — nunca
  da decodificação confiável de um JWT no cliente.

### Rotas e navegação

- Criar `src/auth.ts` com `NextAuth(...)` e exportar `auth`, `handlers`,
  `signIn` e `signOut`.
- Criar `src/app/api/auth/[...nextauth]/route.ts` reexportando `GET` e `POST`
  de `handlers`.
- A página `/login` usa `signIn("credentials", { email, senha,
redirect: false })`; em sucesso, navega ao `callbackUrl` validado ou `/home`.
- A sidebar usa `signOut({ redirectTo: "/login" })` em vez de chamar uma rota
  de logout própria.
- Renomear `src/middleware.ts` para `src/proxy.ts` (convenção do Next.js 16) e
  usar o wrapper `auth(...)` / callback `authorized` do Auth.js para redirecionar
  as rotas protegidas. Deve preservar o destino como callback URL interno.

## Interface de tipos proposta

```ts
// src/types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; tenantId?: string | null };
    error?: "RefreshTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    userId?: string;
    tenantId?: string | null;
    error?: "RefreshTokenError";
  }
}
```

## Plano de implementação

1. Adicionar `next-auth@beta` e definir `NEXT_AUTH_SECRET` em `.env.local` e no
   ambiente de deploy. Em produção, usar segredo aleatório com pelo menos 32
   bytes; nunca versioná-lo.
2. Criar `src/auth.ts`, incluindo parser seguro do payload do JWT do backend e
   função privada de refresh.
3. Criar o Route Handler catch-all do Auth.js e remover as rotas próprias de
   login, logout e refresh após a migração.
4. Remover o campo de órgão da página de login e o uso de `tenantSlug`/
   `x-tenant-slug` no frontend e no contrato do backend.
5. Atualizar a página de login, sidebar, `apiServerFetch` e BFF proxy para
   consumir `auth()`/`signIn()`/`signOut()`.
6. Renomear e simplificar a proteção de rotas para `src/proxy.ts`.
7. Remover `src/lib/auth/session.ts`, os cookies `obras_*` e o decoder de
   expiração do middleware. Atualizar `perfil.ts` para obter dados por sessão
   ou `/auth/me`.
8. Cobrir fluxo, renovação, expiração e logout com testes unitários e e2e.

## Critérios de aceite

- Login válido cria exclusivamente a sessão Auth.js; `obras_access` e
  `obras_refresh` não existem mais.
- Login inválido mostra erro sem vazar a resposta do backend.
- Uma chamada BFF com access token expirado é renovada uma única vez e mantém o
  usuário autenticado quando o refresh é válido.
- Refresh inválido encerra a sessão e redireciona ao login.
- Tokens de backend não estão presentes em `useSession()`, HTML, localStorage,
  sessionStorage nem cookies legíveis por JavaScript.
- Rotas protegidas bloqueiam usuário sem sessão e retornam ao destino original
  após login.
- BFF e server-side fetch retornam 401 para sessão ausente ou expirada, mesmo
  se `proxy.ts` for contornado.
- `pnpm lint`, `pnpm test` e `pnpm build` passam.

## Riscos e pendências

- Auth.js não elimina a necessidade de refresh token rotation no backend.
  Atualmente o backend reemite o mesmo refresh token; a rotação e revogação
  persistente devem ser avaliadas como melhoria de segurança do backend.
- Remover `x-tenant-slug` do endpoint `POST /auth/login`, do OpenAPI e dos
  testes do backend. O backend deverá resolver a organização pelo modelo de
  identidade que substituir essa seleção explícita.
- A renovação pode ocorrer em solicitações simultâneas. A primeira versão pode
  tolerar uma renovação por solicitação; se isso gerar carga relevante, adicionar
  um lock de refresh por sessão no BFF.

## Referências técnicas

- [Next.js 16 — Authentication guide](https://nextjs.org/docs/app/guides/authentication)
- [Next.js 16 — Proxy](https://nextjs.org/docs/app/getting-started/proxy)
- [Auth.js — Credentials provider](https://authjs.dev/getting-started/authentication/credentials)
- [Auth.js — Refresh token rotation](https://authjs.dev/guides/refresh-token-rotation)
