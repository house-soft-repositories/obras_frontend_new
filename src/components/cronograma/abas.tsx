import Link from "next/link";

const abaEstilo = (ativa: boolean): React.CSSProperties => ({
  padding: "6px 12px",
  borderBottom: ativa ? "2px solid #06c" : "2px solid transparent",
  fontWeight: ativa ? 700 : 400,
  textDecoration: "none",
  color: "inherit",
});

/** Navegacao entre as visoes do cronograma da obra (RN-CRO-22). */
export function AbasCronograma({
  obraId,
  ativa,
}: {
  obraId: string;
  ativa: "lista" | "gantt" | "calendario";
}) {
  const base = `/obras/${obraId}/cronograma`;
  return (
    <nav style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #eee" }}>
      <Link href={base} style={abaEstilo(ativa === "lista")}>
        Lista
      </Link>
      <Link href={`${base}/gantt`} style={abaEstilo(ativa === "gantt")}>
        Gantt
      </Link>
      <Link href={`${base}/calendario`} style={abaEstilo(ativa === "calendario")}>
        Calendario
      </Link>
    </nav>
  );
}
