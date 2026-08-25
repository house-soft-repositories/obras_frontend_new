import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

/**
 * `next dev` compila para `.next-dev`; `next build` e `next start` seguem em
 * `.next`.
 *
 * Os dois modos compartilhavam o mesmo diretorio, entao rodar a suite e2e
 * contra o build de producao (`next build` + `next start`) e voltar para o
 * `pnpm dev` fazia os dois processos escreverem e lerem o mesmo `.next`. Em
 * 25/08/2026 o dev ficou devolvendo 404 nas rotas de dois niveis sob o
 * segmento dinamico (`/obras/[id]/cronograma/gantt` e `.../calendario`, com
 * `/obras/[id]/cronograma` respondendo 200) ate `rm -rf .next`. O gatilho
 * exato nao foi reproduzido depois, mas separar os diretorios torna a
 * interferencia entre modos impossivel — e custa nada.
 *
 * `.next` continua sendo a saida de producao: Dockerfile e deploy nao mudam.
 */
const nextConfig = (phase: string): NextConfig => ({
  output: "standalone",
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
});

export default nextConfig;
