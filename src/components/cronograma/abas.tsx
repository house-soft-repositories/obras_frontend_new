import Link from "next/link";
import estilos from "./cronograma.module.css";

/**
 * Navegacao entre as visoes do cronograma da obra (RN-CRO-22), no segmented
 * control da referencia Claude Design.
 */
export function AbasCronograma({
  obraId,
  ativa,
}: {
  obraId: string;
  ativa: "lista" | "gantt" | "calendario";
}) {
  const base = `/obras/${obraId}/cronograma`;
  const visoes: { chave: typeof ativa; titulo: string; href: string }[] = [
    { chave: "lista", titulo: "Lista", href: base },
    { chave: "gantt", titulo: "Gantt", href: `${base}/gantt` },
    { chave: "calendario", titulo: "Calendário", href: `${base}/calendario` },
  ];

  return (
    <nav
      className={estilos.visoes}
      style={{ marginBottom: 16 }}
      aria-label="Visões do cronograma"
    >
      {visoes.map((v) => (
        <Link
          key={v.chave}
          href={v.href}
          className={
            v.chave === ativa
              ? `${estilos.visao} ${estilos.visaoAtiva}`
              : estilos.visao
          }
          aria-current={v.chave === ativa ? "page" : undefined}
        >
          {v.titulo}
        </Link>
      ))}
    </nav>
  );
}
