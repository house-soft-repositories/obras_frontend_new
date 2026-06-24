"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Arquivo,
  type ConteudoPasta,
  type Pasta,
  acoesArquivoPermitidas,
  confirmarUpload,
  criarPasta,
  destinosMover,
  editarArquivo,
  ehPastaRaiz,
  enviarBinario,
  formatarTamanho,
  iniciarUpload,
  listarConteudo,
  moverArquivo,
  obterUrlDownload,
  removerArquivo,
  validarNomePasta,
} from "@/lib/api/documentos";

interface Props {
  obraId: string;
  raiz: Pasta;
  podeEditar: boolean;
}

/**
 * Navegador de pastas/arquivos da obra (RN-DOC-02/03/04/05/06/09/13). Consome a
 * API do E8-03 via proxy; o binario sobe direto para a URL pre-assinada.
 */
export function NavegadorArquivos({ obraId, raiz, podeEditar }: Props) {
  const [pastaId, setPastaId] = useState(raiz.id);
  const [conteudo, setConteudo] = useState<ConteudoPasta | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [novaPastaAberta, setNovaPastaAberta] = useState(false);
  const [moverArquivoId, setMoverArquivoId] = useState<string | null>(null);

  const recarregar = useCallback(async (id: string) => {
    setCarregando(true);
    setErro(null);
    try {
      setConteudo(await listarConteudo(id));
    } catch {
      setErro("Falha ao carregar o conteudo da pasta");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let vivo = true;
    listarConteudo(pastaId)
      .then((c) => {
        if (vivo) setConteudo(c);
      })
      .catch(() => {
        if (vivo) setErro("Falha ao carregar o conteudo da pasta");
      });
    return () => {
      vivo = false;
    };
  }, [pastaId]);

  const acoes = acoesArquivoPermitidas(podeEditar);

  async function aoCriarPasta(nome: string) {
    const erros = validarNomePasta(nome);
    if (erros.length) {
      setErro(erros[0]);
      return;
    }
    try {
      await criarPasta({ pastaPaiId: pastaId, nome });
      setNovaPastaAberta(false);
      await recarregar(pastaId);
    } catch {
      setErro("Nao foi possivel criar a pasta (nome ja existe?)");
    }
  }

  async function aoEnviarArquivos(arquivos: FileList) {
    try {
      const itens = Array.from(arquivos).map((f) => ({
        nome: f.name,
        nomeOriginal: f.name,
        mimeType: f.type || "application/octet-stream",
      }));
      const ups = await iniciarUpload(pastaId, { arquivos: itens });
      await Promise.all(
        ups.map(async (up, i) => {
          const f = arquivos[i];
          await enviarBinario(up.urlUpload, f, f.type || "application/octet-stream");
          await confirmarUpload(up.arquivoId, {
            tamanhoBytes: f.size,
            mimeType: f.type || undefined,
          });
        }),
      );
      await recarregar(pastaId);
    } catch {
      setErro("Falha ao enviar arquivo(s)");
    }
  }

  async function aoBaixar(arquivo: Arquivo) {
    try {
      const { url } = await obterUrlDownload(arquivo.id);
      window.open(url, "_blank");
    } catch {
      setErro("Falha ao gerar o download");
    }
  }

  async function aoEditar(arquivo: Arquivo) {
    const nome = window.prompt("Novo nome do arquivo", arquivo.nome);
    if (nome == null) return;
    try {
      await editarArquivo(arquivo.id, { nome });
      await recarregar(pastaId);
    } catch {
      setErro("Falha ao editar o arquivo");
    }
  }

  async function aoMover(destinoId: string) {
    if (!moverArquivoId) return;
    try {
      await moverArquivo(moverArquivoId, { pastaId: destinoId });
      setMoverArquivoId(null);
      await recarregar(pastaId);
    } catch {
      setErro("Falha ao mover o arquivo");
    }
  }

  async function aoRemover(arquivo: Arquivo) {
    if (!window.confirm(`Remover o arquivo "${arquivo.nome}"?`)) return;
    try {
      await removerArquivo(arquivo.id);
      await recarregar(pastaId);
    } catch {
      setErro("Falha ao remover o arquivo");
    }
  }

  if (!conteudo) {
    return <p>{erro ?? "Carregando arquivos..."}</p>;
  }

  const naRaiz = ehPastaRaiz(conteudo.pasta);

  return (
    <section>
      {/* Trilha de navegacao (breadcrumb) — RN-DOC-02 */}
      <nav style={{ marginBottom: "1rem" }} aria-label="Trilha de navegacao">
        {conteudo.trilha.map((t, i) => (
          <span key={t.id}>
            {i > 0 && " / "}
            <button
              type="button"
              onClick={() => setPastaId(t.id)}
              style={{
                background: "none",
                border: "none",
                color: "#0366d6",
                cursor: "pointer",
                padding: 0,
                fontWeight: t.id === pastaId ? "bold" : "normal",
              }}
            >
              {t.nome}
            </button>
          </span>
        ))}
      </nav>

      {erro && <p style={{ color: "crimson" }}>{erro}</p>}

      {podeEditar && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button type="button" onClick={() => setNovaPastaAberta((v) => !v)}>
            Nova pasta
          </button>
          <label style={{ cursor: "pointer", border: "1px solid #ccc", padding: "0.25rem 0.5rem" }}>
            Enviar arquivos
            <input
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.length) void aoEnviarArquivos(e.target.files);
              }}
            />
          </label>
        </div>
      )}

      {novaPastaAberta && podeEditar && (
        <FormularioNovaPasta onCriar={aoCriarPasta} onCancelar={() => setNovaPastaAberta(false)} />
      )}

      {/* Subpastas */}
      <h3>Pastas</h3>
      {conteudo.subpastas.length === 0 ? (
        <p>Nenhuma subpasta.</p>
      ) : (
        <ul>
          {conteudo.subpastas.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setPastaId(p.id)}
                style={{ background: "none", border: "none", color: "#0366d6", cursor: "pointer" }}
              >
                📁 {p.nome}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Arquivos */}
      <h3>Arquivos ({conteudo.arquivos.total})</h3>
      {conteudo.arquivos.itens.length === 0 ? (
        <p>Nenhum arquivo nesta pasta.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Nome</th>
              <th style={{ textAlign: "left" }}>Arquivo original</th>
              <th style={{ textAlign: "left" }}>Tamanho</th>
              <th style={{ textAlign: "left" }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {conteudo.arquivos.itens.map((a) => (
              <tr key={a.id}>
                <td>{a.nome}</td>
                <td>{a.nomeOriginal}</td>
                <td>{formatarTamanho(a.tamanhoBytes)}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  {acoes.baixar && (
                    <button type="button" onClick={() => void aoBaixar(a)}>
                      Baixar
                    </button>
                  )}
                  {acoes.editar && (
                    <button type="button" onClick={() => void aoEditar(a)}>
                      Editar
                    </button>
                  )}
                  {acoes.mover && (
                    <button type="button" onClick={() => setMoverArquivoId(a.id)}>
                      Mover
                    </button>
                  )}
                  {acoes.remover && (
                    <button type="button" onClick={() => void aoRemover(a)}>
                      Remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal mover: destino = ancestrais (trilha) + subpastas, mesma obra (RN-DOC-12) */}
      {moverArquivoId && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <p>Mover para qual pasta?</p>
          {destinosMover(
            [
              ...conteudo.trilha.map((t) => ({
                id: t.id,
                nome: t.nome,
                obraId,
                pastaPaiId: "",
                criadoPorUsuarioId: null,
              })),
              ...conteudo.subpastas,
            ],
            pastaId,
          ).map((p) => (
            <button key={p.id} type="button" onClick={() => void aoMover(p.id)} style={{ marginRight: "0.5rem" }}>
              {p.nome}
            </button>
          ))}
          <button type="button" onClick={() => setMoverArquivoId(null)}>
            Cancelar
          </button>
        </div>
      )}

      {carregando && <p>Atualizando...</p>}
      {naRaiz && <p style={{ color: "#888", fontSize: "0.85rem" }}>Voce esta na pasta raiz.</p>}
    </section>
  );
}

function FormularioNovaPasta({
  onCriar,
  onCancelar,
}: {
  onCriar: (nome: string) => void;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState("");
  return (
    <div style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
      <input
        type="text"
        placeholder="Nome da pasta"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <button type="button" onClick={() => onCriar(nome)} style={{ marginLeft: "0.5rem" }}>
        Criar
      </button>
      <button type="button" onClick={onCancelar} style={{ marginLeft: "0.5rem" }}>
        Cancelar
      </button>
    </div>
  );
}
