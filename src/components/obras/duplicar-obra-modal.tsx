"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { duplicarObra, ErroApi } from "@/lib/api/obras";
import { construirPayloadDuplicacao } from "@/lib/api/obras-listagem";

/** Modal de duplicacao de obra (RN-OBR-19). */
export function DuplicarObraModal({
  obraId,
  nomeOrigem,
  aoFechar,
}: {
  obraId: string;
  nomeOrigem: string;
  aoFechar: () => void;
}) {
  const router = useRouter();
  const [nome, setNome] = useState(`${nomeOrigem} (copia)`);
  const [responsavelUsuarioId, setResponsavel] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataPrazo, setDataPrazo] = useState("");
  const [copiarArquivos, setCopiarArquivos] = useState(false);
  const [manterEquipe, setManterEquipe] = useState(false);
  const [copiarEstagios, setCopiarEstagios] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const payload = construirPayloadDuplicacao({
        nome,
        responsavelUsuarioId,
        dataInicio,
        dataPrazo,
        copiarArquivos,
        manterEquipe,
        copiarEstagios,
      });
      const nova = (await duplicarObra(obraId, payload)) as { id: string };
      router.push(`/obras/${nova.id}/editar`);
      router.refresh();
      aoFechar();
    } catch (e) {
      setErro(
        e instanceof ErroApi ? `Erro ${e.status}` : "Falha ao duplicar",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <form
        onSubmit={enviar}
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: 8,
          display: "grid",
          gap: 8,
          minWidth: 360,
        }}
      >
        <h3>Duplicar obra</h3>
        <label>
          Novo nome *
          <input required value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label>
          Responsavel (usuario id) *
          <input
            required
            value={responsavelUsuarioId}
            onChange={(e) => setResponsavel(e.target.value)}
          />
        </label>
        <label>
          Data inicio *
          <input
            required
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </label>
        <label>
          Data prazo *
          <input
            required
            type="date"
            value={dataPrazo}
            onChange={(e) => setDataPrazo(e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={copiarArquivos}
            onChange={(e) => setCopiarArquivos(e.target.checked)}
          />{" "}
          Copiar arquivos
        </label>
        <label>
          <input
            type="checkbox"
            checked={manterEquipe}
            onChange={(e) => setManterEquipe(e.target.checked)}
          />{" "}
          Manter equipe
        </label>
        <label>
          <input
            type="checkbox"
            checked={copiarEstagios}
            onChange={(e) => setCopiarEstagios(e.target.checked)}
          />{" "}
          Copiar estagios
        </label>
        {erro && <p style={{ color: "crimson" }}>{erro}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={enviando}>
            {enviando ? "Duplicando..." : "Duplicar"}
          </button>
          <button type="button" onClick={aoFechar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
