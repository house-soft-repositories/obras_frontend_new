# UI — Guia detalhado (lazy)

> Leia quando for criar componente visual.

## Princípios
- Tokens em `core/styles/tokens.ts` e CSS vars em `app/globals.css` — nunca hardcode hex.
- Estilo com `twMerge` + `tailwind-variants` (`tv`).

## Atoms — `core/ui/atoms/*`
- Puros, sem regra de negócio, reutilizáveis em toda a app.
- Exemplos: `button.tsx` (`buttonVariants` primary/secondary/outline/ghost/destructive + sm/md/lg/icon), `input.tsx` (`inputVariants` + `invalid`), `input-mask.tsx`/`input-pattern.tsx`, `card.tsx`, `chip.tsx`, `label.tsx`, `loading.tsx`, `typography.tsx` (`Title`, `Small`, `FormError`), `Toast.tsx`.
- Devem expor `data-slot` para testes e aceitar `className` via `twMerge`.

## Molecules — `core/ui/molecules/*`
- Composição com contexto/portal/estado. Ex.: `modal.tsx`:
  - `Modal` (provider open/onOpenChange)
  - `ModalContent` (portal + backdrop + focus-trap + scroll-lock)
  - `ModalTitle` (gera `id` para `aria-labelledby`)
  - `ModalCloseButton` (`X` lucide, absoluto)
  - `ModalHeader`/`ModalBody`/`ModalFooter` auxiliares
- Pode usar `createPortal`, `useRef`, mas sem regra de domínio.

## Páginas
- `app/(private|public)/<rota>/page.tsx` — thin server component.
- Lógica client em `app/<rota>/components/*` (um arquivo por componente, ex.: `LoginForm.tsx`).
- Layouts em `core/layouts/*` e `app/(private|public)/layout.tsx`.
