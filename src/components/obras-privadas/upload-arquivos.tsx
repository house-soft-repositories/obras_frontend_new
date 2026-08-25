"use client";

import { useRef, useState } from "react";
import {
  confirmarUpload,
  enviarBinario,
  iniciarUpload,
} from "@/lib/api/obras-privadas";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import { formatarTamanho } from "@/lib/ui/prazo";
import styles from "./privadas.module.css";

type Situacao = "aguardando" | "enviando" | "concluido" | "falhou";

interface ItemUpload {
  nome: string;
  tamanho: number;
  situacao: Situacao;
  progresso: number;
  erro?: string;
}

interface Props {
  obraId: string;
  vinculo: string;
  vinculoId?: string;
  categoria: "FOTO" | "DOCUMENTO" | "PROJETO";
  /** Chamado quando ao menos um arquivo foi confirmado. */
  aoConcluir: () => void;
  destaque?: boolean;
  titulo?: string;
  ajuda?: string;
}

const ROTULO_SITUACAO: Record<Situacao, { texto: string; tom: string }> = {
  aguardando: { texto: "Aguardando", tom: "chip-cinza" },
  enviando: { texto: "Enviando", tom: "chip-azul" },
  concluido: { texto: "Concluído", tom: "chip-verde" },
  falhou: { texto: "Falhou", tom: "chip-vermelho" },
};

/**
 * Upload em 3 passos (RN-PRV-17), com arrastar-e-soltar e progresso por
 * arquivo. O binario vai do navegador DIRETO para o bucket via URL
 * pre-assinada — nao passa pelo Next nem pela API, o que evita limite de
 * payload e mantem o servidor fora do caminho do dado pesado.
 *
 * O progresso e por ARQUIVO, nao por byte: `fetch` nao expoe progresso de
 * upload sem trocar por XMLHttpRequest, e o ganho nao justificaria a troca.
 */
export function UploadArquivos({
  obraId,
  vinculo,
  vinculoId,
  categoria,
  aoConcluir,
  destaque = false,
  titulo = "Enviar arquivos",
  ajuda = "JPG, PNG ou PDF · até 20 MB por arquivo",
}: Props) {
  const [itens, setItens] = useState<ItemUpload[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function enviar(arquivos: File[]) {
    if (arquivos.length === 0) return;
    setErroGeral(null);
    setItens(
      arquivos.map((a) => ({
        nome: a.name,
        tamanho: a.size,
        situacao: "aguardando" as const,
        progresso: 0,
      })),
    );

    try {
      const preparados = await iniciarUpload(obraId, {
        vinculo,
        vinculoId,
        arquivos: arquivos.map((a) => ({
          nomeOriginal: a.name,
          categoria,
          mimeType: a.type || undefined,
        })),
      });

      let algumOk = false;
      for (let i = 0; i < arquivos.length; i += 1) {
        const arquivo = arquivos[i];
        const preparado = preparados[i];
        setItens((atual) =>
          atual.map((it, j) =>
            j === i ? { ...it, situacao: "enviando", progresso: 40 } : it,
          ),
        );
        try {
          await enviarBinario(preparado.urlUpload, arquivo);
          await confirmarUpload(preparado.arquivoId, {
            tamanhoBytes: arquivo.size,
            mimeType: arquivo.type || undefined,
          });
          algumOk = true;
          setItens((atual) =>
            atual.map((it, j) =>
              j === i ? { ...it, situacao: "concluido", progresso: 100 } : it,
            ),
          );
        } catch (erro) {
          // Falha de um arquivo nao derruba o lote: em campo, com rede ruim,
          // perder as 5 fotos porque a 3a falhou seria inaceitavel.
          setItens((atual) =>
            atual.map((it, j) =>
              j === i
                ? {
                    ...it,
                    situacao: "falhou",
                    progresso: 0,
                    erro: mensagemErro(erro),
                  }
                : it,
            ),
          );
        }
      }
      if (algumOk) aoConcluir();
    } catch (erro) {
      setErroGeral(mensagemErro(erro));
      setItens((atual) => atual.map((it) => ({ ...it, situacao: "falhou" })));
    }
  }

  return (
    <div>
      <p className={styles.cardTitulo}>{titulo}</p>

      {erroGeral ? (
        <div className={styles.faixaErro} role="alert">
          <span aria-hidden>⛔</span>
          <div>
            <p className={styles.faixaErroTitulo}>Não foi possível enviar</p>
            <p className={styles.faixaErroTexto}>{erroGeral}</p>
          </div>
        </div>
      ) : null}

      <div
        className={
          arrastando || destaque ? styles.dropzoneDestaque : styles.dropzone
        }
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          void enviar([...e.dataTransfer.files]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <div style={{ fontSize: "1.5rem" }} aria-hidden>
          ⬆
        </div>
        <p
          style={{
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--cor-acento)",
            marginTop: "0.5rem",
          }}
        >
          Arraste e solte os arquivos aqui
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--cor-texto-fraco)",
            marginTop: "0.25rem",
          }}
        >
          {ajuda}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            void enviar([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
      </div>

      {itens.length > 0 ? (
        <div className={styles.pilha}>
          {itens.map((it, i) => {
            const rotulo = ROTULO_SITUACAO[it.situacao];
            const cor =
              it.situacao === "falhou"
                ? "var(--cor-perigo)"
                : it.situacao === "concluido"
                  ? "var(--cor-sucesso)"
                  : "var(--cor-acento)";
            return (
              <div
                key={`${it.nome}-${i}`}
                style={{
                  border: "1px solid var(--cor-borda-sutil)",
                  borderRadius: "var(--raio-campo)",
                  padding: "0.7rem 0.8rem",
                }}
              >
                <div
                  style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}
                >
                  <span aria-hidden>
                    {it.nome.toLowerCase().endsWith(".pdf") ? "📄" : "🖼"}
                  </span>
                  <span
                    style={{
                      minWidth: 0,
                      flex: 1,
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {it.nome}
                  </span>
                  <span className={`chip ${rotulo.tom}`}>{rotulo.texto}</span>
                </div>
                <div className={styles.barraProgresso}>
                  <span
                    className={styles.barraProgressoInterna}
                    style={{ width: `${it.progresso}%`, background: cor }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "0.3rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--cor-texto-apagado)",
                    }}
                  >
                    {formatarTamanho(it.tamanho)}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--cor-texto-fraco)",
                      fontWeight: 600,
                    }}
                  >
                    {it.erro ?? `${it.progresso}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
