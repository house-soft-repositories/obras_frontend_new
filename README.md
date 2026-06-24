# Obras Publicas — Frontend (Next.js App Router)

Aplicacao web do SaaS de acompanhamento de obras publicas. Projeto
**independente** (sem monorepo/workspace), porta **3000**.

## Requisitos
- Node >= 22, pnpm >= 9

## Desenvolvimento
```bash
cp .env.example .env.local
pnpm install
pnpm dev            # http://localhost:3000
```
`NEXT_PUBLIC_API_URL` aponta para a API (default http://localhost:3001).

## Contrato de API (tipos gerados)
Os tipos TypeScript da API sao gerados a partir do contrato OpenAPI do backend:
```bash
# 1) no backend, regenerar o contrato:
pnpm -C ../backend gen:openapi      # gera ../obras_backend/openapi.json
# 2) no frontend, regenerar os tipos:
pnpm gen:api                        # gera src/lib/api/types.gen.ts
```
Enums e DTOs de dominio vivem somente no backend e chegam ao frontend
exclusivamente por esses tipos gerados.

## Qualidade
```bash
pnpm lint
pnpm format:check
pnpm test
```
