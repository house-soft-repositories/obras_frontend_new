import { calcularBarrasGantt } from "@/lib/api/cronograma-visoes";
import type { DatasAgregadas, Estagio } from "@/lib/api/cronograma";

/**
 * Gantt: todas as tarefas (estagios e subatividades) do inicio a conclusao da
 * obra, com barras por data_inicio/data_prazo, concluidos e estagio atual
 * destacados (RN-CRO-22).
 */
export function Gantt({
  estagios,
  intervalo,
  atualId,
}: {
  estagios: Estagio[];
  intervalo: DatasAgregadas;
  atualId: string | null;
}) {
  const barras = calcularBarrasGantt(estagios, {
    inicio: intervalo.dataInicio,
    fim: intervalo.dataPrazo,
  });

  if (!intervalo.dataInicio || !intervalo.dataPrazo || barras.length === 0) {
    return (
      <p>
        Sem datas suficientes para o Gantt. Defina inicio/prazo dos estagios
        (modo DIAS_CORRIDOS).
      </p>
    );
  }

  return (
    <div>
      <p style={{ color: "#666", fontSize: 13 }}>
        Periodo: {intervalo.dataInicio} → {intervalo.dataPrazo}
      </p>
      <div style={{ display: "grid", gap: 4 }}>
        {barras.map((b) => (
          <div
            key={b.id}
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 13,
                paddingLeft: b.ehSubatividade ? 16 : 0,
                fontWeight: b.id === atualId ? 700 : 400,
              }}
            >
              {b.descricao}
            </span>
            <div style={{ position: "relative", height: 18, background: "#f0f0f0", borderRadius: 3 }}>
              <div
                title={b.descricao}
                style={{
                  position: "absolute",
                  left: `${b.left}%`,
                  width: `${b.width}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: b.concluido
                    ? "#2a8"
                    : b.id === atualId
                      ? "#06c"
                      : "#9bb",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
