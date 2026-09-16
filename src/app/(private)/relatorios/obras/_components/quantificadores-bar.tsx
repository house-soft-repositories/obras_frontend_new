import type { QuantificadoresObras } from "@/core/actions/relatorios/obras_relatorio_action";
import { Caption } from "@/core/ui/atoms/typography";

const CARDS = [
  { chave: "emDesenvolvimento", titulo: "Em desenvolvimento", cor: "text-emerald-600", borda: "border-emerald-500" },
  { chave: "concluidas", titulo: "Concluídas", cor: "text-cyan-700", borda: "border-cyan-600" },
  { chave: "paralisadas", titulo: "Paralisadas", cor: "text-red-600", borda: "border-red-500" },
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
