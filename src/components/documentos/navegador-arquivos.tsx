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
  siglaTipoArquivo,
  validarNomePasta,
  validarUpload,
} from "@/lib/api/documentos";
import estilos from "./arquivos.module.css";

interface Props {
  obraId: string;
  raiz: Pasta;
  podeEditar: boolean;
}

/**
 * Navegador de pastas/arquivos da obra (RN-DOC-02/03/04/05/06/09/13), no padrao
 * da referencia Claude Design: card branco, trilha com "›", pastas em cards e
 * arquivos em lista com selo de tipo e acoes em icone. Consome a API do E8-03
 * via proxy; o binario sobe direto para a URL pre-assinada.
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
      setErro("Falha ao carregar o conteúdo da pasta");
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
        if (vivo) setErro("Falha ao carregar o conteúdo da pasta");
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
      setErro("Não foi possível criar a pasta (nome já existe?)");
    }
  }

  async function aoEnviarArquivos(arquivos: FileList) {
    try {
      const itens = Array.from(arquivos).map((f) => ({
        nome: f.name,
        nomeOriginal: f.name,
        mimeType: f.type || "application/octet-stream",
      }));
      const erros = validarUpload(itens);
      if (erros.length) {
        setErro(erros[0]);
        return;
      }
      const ups = await iniciarUpload(pastaId, { arquivos: itens });
      await Promise.all(
        ups.map(async (up, i) => {
          const f = arquivos[i];
          await enviarBinario(
            up.urlUpload,
            f,
            f.type || "application/octet-stream",
          );
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
    if (!nome.trim()) {
      setErro("Informe o nome do arquivo");
      return;
    }
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
    return (
      <div className={estilos.painel}>
        <p className={estilos.vazio}>{erro ?? "Carregando arquivos…"}</p>
      </div>
    );
  }

  const naRaiz = ehPastaRaiz(conteudo.pasta);

  return (
    <section className={estilos.painel}>
      {/* Trilha de navegacao (breadcrumb) — RN-DOC-02 */}
      <nav className={estilos.trilha} aria-label="Trilha de navegação">
        {conteudo.trilha.map((t, i) => {
          const atual = t.id === pastaId;
          return (
            <span key={t.id} style={{ display: "contents" }}>
              {i > 0 && (
                <span className={estilos.trilhaSep} aria-hidden>
                  ›
                </span>
              )}
              <button
                type="button"
                onClick={() => !atual && setPastaId(t.id)}
                className={
                  atual
                    ? `${estilos.trilhaItem} ${estilos.trilhaAtual}`
                    : estilos.trilhaItem
                }
                aria-current={atual ? "page" : undefined}
              >
                {t.nome}
              </button>
            </span>
          );
        })}
      </nav>

      {erro && <p className={estilos.erro}>{erro}</p>}

      {podeEditar && (
        <div className={estilos.acoes}>
          <button
            type="button"
            className="btn-primario"
            onClick={() => setNovaPastaAberta((v) => !v)}
          >
            ＋ Nova pasta
          </button>
          <label className={estilos.envio}>
            Enviar arquivos
            <input
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.length)
                  void aoEnviarArquivos(e.target.files);
              }}
            />
          </label>
        </div>
      )}

      {novaPastaAberta && podeEditar && (
        <FormularioNovaPasta
          onCriar={aoCriarPasta}
          onCancelar={() => setNovaPastaAberta(false)}
        />
      )}

      {/* Subpastas */}
      {conteudo.subpastas.length > 0 && (
        <div className={estilos.pastas}>
          {conteudo.subpastas.map((p) => (
            <button
              key={p.id}
              type="button"
              className={estilos.pasta}
              onClick={() => setPastaId(p.id)}
            >
              <span className={estilos.pastaIcone} aria-hidden>
                📁
              </span>
              <span className={estilos.pastaNome}>{p.nome}</span>
            </button>
          ))}
        </div>
      )}

      {/* Arquivos */}
      <p className={estilos.subtitulo}>Arquivos ({conteudo.arquivos.total})</p>
      {conteudo.arquivos.itens.length === 0 ? (
        <p className={estilos.vazio}>Nenhum arquivo nesta pasta.</p>
      ) : (
        <div className={estilos.lista}>
          {conteudo.arquivos.itens.map((a) => (
            <div key={a.id} className={estilos.arquivo}>
              <span className={estilos.selo} aria-hidden>
                {siglaTipoArquivo(a.nomeOriginal)}
              </span>
              <span className={estilos.arquivoTexto}>
                <span className={estilos.arquivoNome}>{a.nome}</span>
                <span className={estilos.arquivoMeta}>
                  {formatarTamanho(a.tamanhoBytes)} · {a.nomeOriginal}
                </span>
              </span>
              <span className={estilos.arquivoAcoes}>
                {acoes.baixar && (
                  <button
                    type="button"
                    title="Baixar"
                    aria-label={`Baixar ${a.nome}`}
                    className={estilos.icone}
                    onClick={() => void aoBaixar(a)}
                  >
                    ⤓
                  </button>
                )}
                {acoes.editar && (
                  <button
                    type="button"
                    title="Editar"
                    aria-label={`Editar ${a.nome}`}
                    className={estilos.icone}
                    onClick={() => void aoEditar(a)}
                  >
                    ✎
                  </button>
                )}
                {acoes.mover && (
                  <button
                    type="button"
                    title="Mover"
                    aria-label={`Mover ${a.nome}`}
                    className={estilos.icone}
                    onClick={() => setMoverArquivoId(a.id)}
                  >
                    ⇄
                  </button>
                )}
                {acoes.remover && (
                  <button
                    type="button"
                    title="Remover"
                    aria-label={`Remover ${a.nome}`}
                    className={`${estilos.icone} ${estilos.iconePerigo}`}
                    onClick={() => void aoRemover(a)}
                  >
                    🗑
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal mover: destino = ancestrais (trilha) + subpastas, mesma obra (RN-DOC-12) */}
      {moverArquivoId && (
        <div className={estilos.caixa} style={{ marginTop: "1rem" }}>
          <span className={estilos.subtitulo} style={{ margin: 0 }}>
            Mover para
          </span>
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
            <button
              key={p.id}
              type="button"
              className="btn-secundario"
              onClick={() => void aoMover(p.id)}
            >
              📁 {p.nome}
            </button>
          ))}
          <button
            type="button"
            className="btn-secundario"
            onClick={() => setMoverArquivoId(null)}
          >
            Cancelar
          </button>
        </div>
      )}

      {carregando && <p className={estilos.vazio}>Atualizando…</p>}
      {naRaiz && conteudo.arquivos.itens.length === 0 && (
        <p className={estilos.vazio} style={{ marginTop: "0.5rem" }}>
          Você está na pasta raiz.
        </p>
      )}
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
    <div className={estilos.caixa}>
      <input
        type="text"
        placeholder="Nome da pasta"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        aria-label="Nome da nova pasta"
      />
      <button
        type="button"
        className="btn-primario"
        onClick={() => onCriar(nome)}
      >
        Criar
      </button>
      <button type="button" className="btn-secundario" onClick={onCancelar}>
        Cancelar
      </button>
    </div>
  );
}
