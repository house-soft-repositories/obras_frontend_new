export function Tabela({
  colunas,
  linhas,
}: {
  colunas: { chave: string; titulo: string }[];
  linhas: Record<string, unknown>[];
}) {
  if (linhas.length === 0) return <p>Nenhum registro.</p>;
  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          {colunas.map((c) => (
            <th
              key={c.chave}
              style={{
                textAlign: "left",
                borderBottom: "1px solid #ccc",
                padding: "0.4rem",
              }}
            >
              {c.titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((l, i) => (
          <tr key={(l.id as string) ?? i}>
            {colunas.map((c) => (
              <td
                key={c.chave}
                style={{ padding: "0.4rem", borderBottom: "1px solid #eee" }}
              >
                {String(l[c.chave] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
