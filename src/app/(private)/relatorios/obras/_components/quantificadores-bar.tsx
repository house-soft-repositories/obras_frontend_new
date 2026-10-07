import type { QuantificadoresObras } from "@/core/schemas/relatorios/obras_relatorio_schema";
import { Caption } from "@/core/ui/atoms/typography";

const CARDS = [
  { chave: "acimaMeta", titulo: "Acima da meta", cor: "text-emerald-600", borda: "border-emerald-500" },
  { chave: "prazoVencido", titulo: "Prazo vencido", cor: "text-red-600", borda: "border-red-500" },
  { chave: "abaixoMeta", titulo: "Abaixo da meta", cor: "text-amber-600", borda: "border-amber-500" },
  { chave: "semStatus", titulo: "Sem status", cor: "text-muted", borda: "border-border" },
] as const;

export function QuantificadoresBar({ q }: { q: QuantificadoresObras }) {
  return (
    <section aria-label="Quantificadores" className="flex flex-wrap items-stretch gap-3">
      {CARDS.map((card) => (
        <article
          key={card.chave}
          className={`min-w-32 flex-1 rounded-app border bg-surface px-4 py-3 shadow-card ${card.borda}`}
        >
          <Caption>{card.titulo}</Caption>
          <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${card.cor}`}>
            {q[card.chave]}
          </p>
        </article>
      ))}
      <p className="self-center text-sm text-muted">
        Total: <strong className="tabular-nums text-foreground">{q.totalObras}</strong>
      </p>
    </section>
  );
}
