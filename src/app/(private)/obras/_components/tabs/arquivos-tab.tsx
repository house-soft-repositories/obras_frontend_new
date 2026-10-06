"use client";

import {
  AlertTriangle,
  Download,
  Edit3,
  FileText,
  Folder,
  FolderPlus,
  Loader2,
  MoveRight,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useState, useTransition } from "react";
import {
  confirmarUploadArquivoAction,
  criarSubpastaAction,
  editarArquivoAction,
  iniciarUploadArquivosAction,
  listarConteudoPastaAction,
  moverArquivoAction,
  obterPastaRaizObraAction,
  obterUrlDownloadArquivoAction,
  removerArquivoAction,
  removerPastaAction,
} from "@/core/actions/documentos/arquivos_obra_actions";
import { useToast } from "@/core/hooks/useToast";
import type {
  ArquivoResponse,
  ConteudoPastaResponse,
  PastaResponse,
} from "@/core/schemas/documentos/arquivo_obra_schema";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { Textarea } from "@/core/ui/atoms/textarea";
import { Tooltip } from "@/core/ui/atoms/tooltip";
import { ActionButton } from "@/core/ui/molecules/action-button";
import { Body, Caption } from "@/core/ui/atoms/typography";
import { Modal } from "@/core/ui/molecules/modal";

const FILES_PAGE_SIZE = 10;

type UploadStatus = {
  name: string;
  state: "enviando" | "confirmando" | "concluido" | "erro";
  message?: string;
};

type EditState = {
  arquivo: ArquivoResponse;
  nomeBase: string;
  extensao: string;
  descricao: string;
};

type MoveState = {
  arquivo: ArquivoResponse;
  pastaId: string;
};

function fileMimeType(file: File) {
  return file.type || "application/octet-stream";
}

function formatBytes(value: string | null) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toLocaleString("pt-BR", { maximumFractionDigits: unit === 0 ? 0 : 1 })} ${units[unit]}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function splitFileName(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
    return { nomeBase: fileName, extensao: "" };
  }
  return {
    nomeBase: fileName.slice(0, lastDotIndex),
    extensao: fileName.slice(lastDotIndex),
  };
}

function createEditState(arquivo: ArquivoResponse): EditState {
  const { nomeBase, extensao } = splitFileName(arquivo.nome);
  return {
    arquivo,
    nomeBase,
    extensao,
    descricao: arquivo.descricao ?? "",
  };
}

export function ArquivosTab({ obraId }: { obraId: string }) {
  const toast = useToast();
  const toastError = toast.error;
  const [pending, startTransition] = useTransition();
  const [rootFolder, setRootFolder] = useState<PastaResponse | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [content, setContent] = useState<ConteudoPastaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [moveState, setMoveState] = useState<MoveState | null>(null);
  const [fileToDelete, setFileToDelete] = useState<ArquivoResponse | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<PastaResponse | null>(null);

  const destinationFolders = useMemo(() => {
    if (!content) return [];
    const folders = [...content.trilha, ...content.subpastas.map((folder) => ({ id: folder.id, nome: folder.nome }))];
    return folders.filter((folder, index, all) => all.findIndex((item) => item.id === folder.id) === index);
  }, [content]);

  useEffect(() => {
    let active = true;
    async function loadRoot() {
      setLoading(true);
      const response = await obterPastaRaizObraAction(obraId);
      if (!active) return;
      if (!response.success) {
        toastError(response.error);
        setLoading(false);
        return;
      }
      setRootFolder(response.data);
      setCurrentFolderId(response.data.id);
    }
    void loadRoot();
    return () => {
      active = false;
    };
  }, [obraId, toastError]);

  useEffect(() => {
    if (!currentFolderId) return;
    const pastaId = currentFolderId;
    let active = true;
    async function loadContent() {
      setLoading(true);
      const response = await listarConteudoPastaAction({
        pastaId,
        page,
        take: FILES_PAGE_SIZE,
        order: "ASC",
      });
      if (!active) return;
      if (response.success) {
        setContent(response.data);
      } else {
        toastError(response.error);
      }
      setLoading(false);
    }
    void loadContent();
    return () => {
      active = false;
    };
  }, [currentFolderId, page, toastError]);

  function refresh() {
    if (!currentFolderId) return;
    startTransition(async () => {
      const response = await listarConteudoPastaAction({
        pastaId: currentFolderId,
        page,
        take: FILES_PAGE_SIZE,
        order: "ASC",
      });
      if (response.success) setContent(response.data);
      else toast.error(response.error);
    });
  }

  function openFolder(folderId: string) {
    setPage(1);
    setCurrentFolderId(folderId);
  }

  function createFolder() {
    if (!content || !newFolderName.trim()) return;
    startTransition(async () => {
      const response = await criarSubpastaAction({
        pastaPaiId: content.pasta.id,
        nome: newFolderName,
      });
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      toast.success("Pasta criada com sucesso.");
      setNewFolderName("");
      refresh();
    });
  }

  function askToRemoveFolder(folder: PastaResponse) {
    if (folder.pastaPaiId === null) return;
    setFolderToDelete(folder);
  }

  function removeFolder() {
    const folder = folderToDelete;
    if (!folder || folder.pastaPaiId === null) return;
    const parentFolderId = folder.pastaPaiId;

    startTransition(async () => {
      const response = await removerPastaAction(folder.id);
      if (!response.success) {
        toast.error(response.error);
        return;
      }

      toast.success("Pasta removida.");
      setFolderToDelete(null);
      if (folder.id === currentFolderId) {
        openFolder(parentFolderId);
        return;
      }
      refresh();
    });
  }

  async function uploadFile(file: File) {
    setUploads((previous) => [
      ...previous,
      { name: file.name, state: "enviando", message: "Preparando upload" },
    ]);

    const started = await iniciarUploadArquivosAction(currentFolderId!, {
      arquivos: [
        {
          nome: file.name,
          nomeOriginal: file.name,
          mimeType: fileMimeType(file),
        },
      ],
    });

    if (!started.success) {
      setUploads((previous) =>
        previous.map((item) =>
          item.name === file.name ? { ...item, state: "erro", message: started.error } : item,
        ),
      );
      toast.error(started.error);
      return;
    }

    const upload = started.data[0];
    try {
      const putResponse = await fetch(upload.urlUpload, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": fileMimeType(file) },
      });

      if (!putResponse.ok) {
        throw new Error("Falha ao enviar o arquivo para o storage.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha no upload assinado.";
      setUploads((previous) =>
        previous.map((item) =>
          item.name === file.name ? { ...item, state: "erro", message } : item,
        ),
      );
      toast.error(message);
      return;
    }

    setUploads((previous) =>
      previous.map((item) =>
        item.name === file.name ? { ...item, state: "confirmando", message: "Confirmando envio" } : item,
      ),
    );

    const confirmed = await confirmarUploadArquivoAction(upload.arquivoId, {
      tamanhoBytes: file.size,
      mimeType: fileMimeType(file),
    });

    if (!confirmed.success) {
      setUploads((previous) =>
        previous.map((item) =>
          item.name === file.name ? { ...item, state: "erro", message: confirmed.error } : item,
        ),
      );
      toast.error(confirmed.error);
      return;
    }

    setUploads((previous) =>
      previous.map((item) =>
        item.name === file.name ? { ...item, state: "concluido", message: "Arquivo pronto" } : item,
      ),
    );
  }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || !currentFolderId) return;

    startTransition(async () => {
      for (const file of files) {
        await uploadFile(file);
      }
      toast.success(files.length === 1 ? "Arquivo enviado." : "Arquivos enviados.");
      refresh();
    });
  }

  function downloadFile(arquivo: ArquivoResponse) {
    startTransition(async () => {
      const response = await obterUrlDownloadArquivoAction(arquivo.id);
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    });
  }

  function saveEdit() {
    if (!editState) return;
    startTransition(async () => {
      const response = await editarArquivoAction({
        arquivoId: editState.arquivo.id,
        nome: `${editState.nomeBase.trim()}${editState.extensao}`,
        descricao: editState.descricao.trim() ? editState.descricao : null,
      });
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      toast.success("Arquivo atualizado.");
      setEditState(null);
      refresh();
    });
  }

  function moveFile() {
    if (!moveState) return;
    startTransition(async () => {
      const response = await moverArquivoAction({
        arquivoId: moveState.arquivo.id,
        pastaId: moveState.pastaId,
      });
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      toast.success("Arquivo movido.");
      setMoveState(null);
      refresh();
    });
  }

  function askToRemoveFile(arquivo: ArquivoResponse) {
    setFileToDelete(arquivo);
  }

  function removeFile() {
    const arquivo = fileToDelete;
    if (!arquivo) return;

    startTransition(async () => {
      const response = await removerArquivoAction(arquivo.id);
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      toast.success("Arquivo removido.");
      setFileToDelete(null);
      refresh();
    });
  }

  const meta = content?.arquivos.meta;
  const currentFolderHasFiles = Boolean(meta && meta.itemCount > 0);

  return (
    <div role="tabpanel" className="mt-5 grid gap-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Arquivos da obra</h2>
          <Caption>Organize documentos em pastas e envie arquivos por upload assinado.</Caption>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            variant="secondary"
            icon={<RefreshCw aria-hidden="true" className="size-4 shrink-0" />}
            label="Atualizar"
            onClick={refresh}
            disabled={pending || loading}
          />
          {content?.pasta && content.pasta.pastaPaiId !== null && (
            <ActionButton
              variant="destructive"
              icon={<Trash2 aria-hidden="true" className="size-4 shrink-0" />}
              label="Excluir pasta"
              tooltip={
                currentFolderHasFiles
                  ? "Não é possível excluir pasta com arquivos"
                  : "Excluir pasta vazia"
              }
              onClick={() => askToRemoveFolder(content.pasta)}
              disabled={pending || loading || currentFolderHasFiles}
            />
          )}
          <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-app bg-primary px-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Upload className="size-4" /> Enviar arquivos
            <input type="file" multiple className="sr-only" onChange={selectFiles} disabled={pending || !currentFolderId} />
          </label>
        </div>
      </header>

      <nav aria-label="Trilha de pastas" className="flex flex-wrap items-center gap-2 text-sm">
        {(content?.trilha ?? (rootFolder ? [{ id: rootFolder.id, nome: rootFolder.nome }] : [])).map((folder, index, folders) => (
          <span key={folder.id} className="inline-flex items-center gap-2">
            <button
              type="button"
              className="font-semibold text-muted hover:text-foreground disabled:text-foreground"
              disabled={folder.id === currentFolderId}
              onClick={() => openFolder(folder.id)}
            >
              {folder.nome}
            </button>
            {index < folders.length - 1 && <span className="text-muted">/</span>}
          </span>
        ))}
      </nav>

      <section className="flex flex-col gap-2 rounded-app border border-border bg-surface-subtle p-3 sm:flex-row">
        <Input
          value={newFolderName}
          placeholder="Nova pasta"
          onChange={(event) => setNewFolderName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") createFolder();
          }}
        />
        <ActionButton
          icon={<FolderPlus aria-hidden="true" className="size-4 shrink-0" />}
          label="Criar pasta"
          disabled={pending || !content || !newFolderName.trim()}
          onClick={createFolder}
        />
      </section>

      {uploads.length > 0 && (
        <section className="grid gap-2 rounded-app border border-border p-3">
          {uploads.slice(-5).map((upload, index) => (
            <div key={`${upload.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold">{upload.name}</span>
              <span className={upload.state === "erro" ? "text-danger" : "text-muted"}>
                {upload.message ?? upload.state}
              </span>
            </div>
          ))}
        </section>
      )}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center text-muted">
          <Loader2 className="mr-2 size-4 animate-spin" /> Carregando arquivos
        </div>
      ) : (
        <section className="overflow-hidden rounded-app border border-border">
          {content?.subpastas.map((folder) => (
            <div
              key={folder.id}
              className="flex min-h-14 w-full items-center gap-3 border-b border-border px-3.5 hover:bg-surface-subtle"
            >
              <button
                type="button"
                onClick={() => openFolder(folder.id)}
                className="flex min-h-14 min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Folder className="size-5 shrink-0 text-muted" />
                <span className="flex-1 truncate text-[13px] font-semibold">{folder.nome}</span>
              </button>
              <Caption>{formatDate(folder.createdAt)}</Caption>
              {folder.pastaPaiId !== null && (
                <Tooltip content="Excluir pasta vazia">
                  <Button variant="ghost" size="icon" disabled={pending} onClick={() => askToRemoveFolder(folder)} aria-label={`Excluir pasta ${folder.nome}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </Tooltip>
              )}
            </div>
          ))}

          {content?.arquivos.data.map((arquivo) => (
            <div key={arquivo.id} className="flex min-h-16 flex-wrap items-center gap-3 border-b border-border px-3.5 last:border-0">
              <FileText className="size-5 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="truncate text-[13px]">{arquivo.nome}</strong>
                  {!arquivo.confirmado && (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                      Pendente
                    </span>
                  )}
                </div>
                <Caption className="block truncate">
                  {arquivo.nomeOriginal} · {formatBytes(arquivo.tamanhoBytes)} · {arquivo.mimeType ?? "tipo não informado"}
                </Caption>
                {arquivo.descricao && <Caption className="block truncate">{arquivo.descricao}</Caption>}
              </div>
              <Tooltip content={arquivo.confirmado ? "Baixar arquivo" : "Arquivo ainda pendente"}>
                <Button variant="ghost" size="icon" disabled={pending || !arquivo.confirmado} onClick={() => downloadFile(arquivo)} aria-label={`Baixar ${arquivo.nome}`}>
                  <Download className="size-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Editar metadados">
                <Button variant="ghost" size="icon" disabled={pending} onClick={() => setEditState(createEditState(arquivo))} aria-label={`Editar ${arquivo.nome}`}>
                  <Edit3 className="size-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Mover arquivo">
                <Button variant="ghost" size="icon" disabled={pending || destinationFolders.length === 0} onClick={() => setMoveState({ arquivo, pastaId: content.pasta.id })} aria-label={`Mover ${arquivo.nome}`}>
                  <MoveRight className="size-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Remover arquivo">
                <Button variant="ghost" size="icon" disabled={pending} onClick={() => askToRemoveFile(arquivo)} aria-label={`Remover ${arquivo.nome}`}>
                  <Trash2 className="size-4" />
                </Button>
              </Tooltip>
            </div>
          ))}

          {content && content.subpastas.length === 0 && content.arquivos.data.length === 0 && (
            <div className="grid gap-2 px-4 py-10 text-center">
              <Body className="font-semibold">Nenhum arquivo nesta pasta</Body>
              <Caption>Crie uma subpasta ou envie arquivos para começar.</Caption>
            </div>
          )}
        </section>
      )}

      {meta && meta.pageCount > 1 && (
        <footer className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <span>
            Página {meta.page} de {meta.pageCount} · {meta.itemCount} arquivos
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={!meta.hasPreviousPage || pending} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Anterior
            </Button>
            <Button variant="secondary" size="sm" disabled={!meta.hasNextPage || pending} onClick={() => setPage((value) => value + 1)}>
              Próxima
            </Button>
          </div>
        </footer>
      )}

      <Modal.Root open={Boolean(editState)} onOpenChange={(open) => !open && setEditState(null)}>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup>
            <Modal.CloseIcon />
            <Modal.Header>
              <Modal.Title>Editar arquivo</Modal.Title>
              <Modal.Description>Atualize o nome e a descrição do documento sem alterar a extensão.</Modal.Description>
            </Modal.Header>
            <Modal.Body>
              <label className="grid gap-1 text-sm font-semibold">
                Nome
                <div className="flex overflow-hidden rounded-app border border-border bg-surface focus-within:ring-2 focus-within:ring-ring">
                  <Input
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={editState?.nomeBase ?? ""}
                    onChange={(event) => setEditState((state) => state ? { ...state, nomeBase: event.target.value } : state)}
                  />
                  {editState?.extensao && (
                    <span className="inline-flex min-h-11 shrink-0 items-center border-l border-border bg-surface-subtle px-3 text-sm font-semibold text-muted">
                      {editState.extensao}
                    </span>
                  )}
                </div>
                {editState?.extensao && (
                  <Caption>A extensão {editState.extensao} será preservada.</Caption>
                )}
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Descrição
                <Textarea value={editState?.descricao ?? ""} onChange={(event) => setEditState((state) => state ? { ...state, descricao: event.target.value } : state)} />
              </label>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setEditState(null)}>Cancelar</Button>
              <Button disabled={pending || !editState?.nomeBase.trim()} onClick={saveEdit}>Salvar</Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root open={Boolean(moveState)} onOpenChange={(open) => !open && setMoveState(null)}>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup>
            <Modal.CloseIcon />
            <Modal.Header>
              <Modal.Title>Mover arquivo</Modal.Title>
              <Modal.Description>Escolha uma pasta visível na trilha ou nas subpastas atuais.</Modal.Description>
            </Modal.Header>
            <Modal.Body>
              <label className="grid gap-1 text-sm font-semibold">
                Pasta de destino
                <select
                  className="min-h-11 rounded-app border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={moveState?.pastaId ?? ""}
                  onChange={(event) => setMoveState((state) => state ? { ...state, pastaId: event.target.value } : state)}
                >
                  {destinationFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.nome}</option>
                  ))}
                </select>
              </label>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setMoveState(null)}>Cancelar</Button>
              <Button disabled={pending || !moveState?.pastaId} onClick={moveFile}>Mover</Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root open={Boolean(folderToDelete)} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup>
            <Modal.CloseIcon />
            <Modal.Header>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-app bg-danger-subtle text-danger">
                  <AlertTriangle className="size-5" />
                </span>
                <div>
                  <Modal.Title>Excluir pasta</Modal.Title>
                  <Modal.Description>
                    Esta ação remove apenas pastas vazias. Se houver arquivos nesta pasta ou em subpastas, a exclusão será bloqueada.
                  </Modal.Description>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="rounded-app border border-danger-border bg-danger-subtle p-3 text-sm text-foreground">
                Tem certeza que deseja excluir a pasta <strong>{folderToDelete?.nome}</strong>?
                <br />
                A pasta só será removida se ela e suas subpastas não tiverem arquivos.
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" disabled={pending} onClick={() => setFolderToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" disabled={pending} onClick={removeFolder}>
                <Trash2 className="size-4" /> Excluir pasta
              </Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root open={Boolean(fileToDelete)} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup>
            <Modal.CloseIcon />
            <Modal.Header>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-app bg-danger-subtle text-danger">
                  <AlertTriangle className="size-5" />
                </span>
                <div>
                  <Modal.Title>Remover arquivo</Modal.Title>
                  <Modal.Description>
                    Esta ação remove o arquivo de forma permanente.
                  </Modal.Description>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="rounded-app border border-danger-border bg-danger-subtle p-3 text-sm text-foreground">
                Tem certeza que deseja remover o arquivo <strong>{fileToDelete?.nome}</strong>?
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" disabled={pending} onClick={() => setFileToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" disabled={pending} onClick={removeFile}>
                <Trash2 className="size-4" /> Remover arquivo
              </Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>
    </div>
  );
}
