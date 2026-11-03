"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ArrowLeft, Copy, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { Chip } from "@/core/ui/atoms/chip";
import { Input } from "@/core/ui/atoms/input";
import { useToast } from "@/core/hooks/useToast";
import duplicarObraAction from "@/core/actions/obras/duplicar_obra_action";
import deleteObraAction from "@/core/actions/obras/delete_obra_action";
import { aplicarTagsAction } from "@/core/actions/obras/tags_actions";
import { criarObservacaoAction } from "@/core/actions/obras/observacoes_actions";
import {
  TIPO_OBRA_LABELS,
  TIPO_OBRA_VALUES,
  type TipoObra,
} from "@/core/schemas/obras/tipo_obra";
import {
  statusObraChipVariant,
  statusObraLabel,
} from "@/core/utils/status-obra";
import { CriarObraModal } from "./criar-obra-modal";
import type { Obra, ObraList } from "@/core/schemas/obras/obra_schema";

type Option = { id: string; nome: string };
type Props = {
  obras: ObraList;
  orgaos: Option[];
  usuarios: Option[];
  setores: Option[];
  localidades: Option[];
  fontes: Option[];
  eixos: Option[];
  classificacoes: Option[];
  tipologias: Option[];
  tagNames?: string[];
  mode?: "list" | "detail";
  obra?: Obra | null;
};
const text = (value: unknown, fallback = "—") =>
  typeof value === "string" && value ? value : fallback;
const isTipoObra = (value: unknown): value is TipoObra =>
  typeof value === "string" && TIPO_OBRA_VALUES.some((tipo) => tipo === value);
const normalizeTag = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
const isValidTag = (value: string) =>
  value.length >= 2 && value.length <= 40 && !/[^\p{L}\p{N}\s_-]/u.test(value);

export function ObrasClient({
  obras,
  orgaos,
  usuarios,
  setores,
  localidades,
  fontes,
  eixos,
  classificacoes,
  tipologias,
  tagNames = [],
  mode = "list",
  obra,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<TipoObra | "">("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(() =>
    tagNames
      .map(normalizeTag)
      .filter(
        (tag, index, values) =>
          isValidTag(tag) && values.indexOf(tag) === index,
      ),
  );
  const [obs, setObs] = useState("");

  const aplicarTag = useCallback(
    (value = tagInput) => {
      const normalized = normalizeTag(value);
      if (!normalized) return;
      if (!isValidTag(normalized)) {
        toast.error(
          "A tag deve ter entre 2 e 40 caracteres e conter apenas letras, números, espaços, _ ou -.",
        );
        return;
      }
      setTags((current) =>
        current.includes(normalized) ? current : [...current, normalized],
      );
      setTagInput("");
    },
    [tagInput, toast],
  );

  useEffect(() => {
    if (mode !== "list" || !tagInput.trim()) return;
    const timeout = window.setTimeout(() => aplicarTag(), 600);
    return () => window.clearTimeout(timeout);
  }, [aplicarTag, mode, tagInput]);

  const executarAcao = (action: () => Promise<unknown>, success: string) =>
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível concluir a operação.",
        );
      }
    });
  const aplicarFiltros = (nextTags = tags) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (tipo) params.set("tipo", tipo);
    nextTags.forEach((tag) => params.append("tagNames", tag));
    router.push(`/obras${params.toString() ? `?${params}` : ""}`);
  };
  const adicionarTagEFiltrar = () => {
    const normalized = normalizeTag(tagInput);
    if (!normalized) return;
    if (!isValidTag(normalized)) {
      toast.error(
        "A tag deve ter entre 2 e 40 caracteres e conter apenas letras, números, espaços, _ ou -.",
      );
      return;
    }
    const nextTags = tags.includes(normalized) ? tags : [...tags, normalized];
    setTags(nextTags);
    setTagInput("");
    aplicarFiltros(nextTags);
  };

  if (mode === "detail" && obra)
    return (
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <Link
          href="/obras"
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted"
        >
          <ArrowLeft className="size-4" /> Voltar para obras
        </Link>
        <section className="rounded-app border border-border bg-surface p-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Obra {text(obra.codigo)}</p>
              <h1 className="font-display text-3xl font-bold">
                {text(obra.nome)}
              </h1>
              <p className="text-sm text-muted">
                <Chip variant={statusObraChipVariant(text(obra.status))}>
                  {statusObraLabel(text(obra.status))}
                </Chip>{" "}
                ·{" "}
                {isTipoObra(obra.tipo)
                  ? TIPO_OBRA_LABELS[obra.tipo]
                  : text(obra.tipo)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  executarAcao(
                    () => duplicarObraAction(obra.id),
                    "Obra duplicada.",
                  )
                }
              >
                <Copy className="size-4" /> Duplicar
              </Button>
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() => {
                  if (confirm("Excluir esta obra?"))
                    executarAcao(
                      () => deleteObraAction(obra.id),
                      "Obra excluída.",
                    );
                }}
              >
                <Trash2 className="size-4" /> Excluir
              </Button>
            </div>
          </div>
          <div className="mt-8 grid gap-4">
            <h2 className="font-display text-xl font-semibold">
              Tags e observações
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder="Aplicar tag"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                suffixButton={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 px-0"
                    aria-label="Adicionar tag"
                    onClick={() => aplicarTag()}
                  >
                    <Plus aria-hidden="true" />
                  </Button>
                }
              />
              <Button
                disabled={!tagInput.trim() || pending}
                onClick={() =>
                  executarAcao(
                    () => aplicarTagsAction(obra.id, normalizeTag(tagInput)),
                    "Tag aplicada.",
                  )
                }
              >
                Adicionar
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nova observação"
                value={obs}
                onChange={(event) => setObs(event.target.value)}
              />
              <Button
                disabled={!obs || pending}
                onClick={() =>
                  executarAcao(
                    () => criarObservacaoAction(obra.id, obs),
                    "Observação adicionada.",
                  )
                }
              >
                Registrar
              </Button>
            </div>
            <p className="text-sm text-muted">
              Use as áreas da obra para acompanhar equipes, guias, tags e
              observações.
            </p>
          </div>
        </section>
      </main>
    );

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Gestão</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Obras</h1>
          <p className="mt-3 text-sm text-muted">
            Acompanhe, cadastre e organize as obras do município.
          </p>
        </div>
        <CriarObraModal
          orgaos={orgaos}
          usuarios={usuarios}
          setores={setores}
          localidades={localidades}
          fontes={fontes}
          eixos={eixos}
          classificacoes={classificacoes}
          tipologias={tipologias}
          onSuccess={() => router.refresh()}
        />
      </section>
      <form
        className="mb-5 flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          aplicarFiltros();
        }}
      >
        <div className="relative min-w-64 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          />
          <Input
            className="pl-9"
            placeholder="Buscar obra..."
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
        </div>
        <Input
          className="min-w-56 flex-1"
          placeholder="Digite uma tag..."
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              adicionarTagEFiltrar();
            }
          }}
          suffixButton={
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="h-9 w-9 px-0"
              aria-label="Adicionar tag e aplicar busca"
              onClick={adicionarTagEFiltrar}
            >
              <Plus aria-hidden="true" />
            </Button>
          }
        />
        <select
          aria-label="Filtrar por tipo"
          className="h-11 rounded-app border border-input bg-surface px-3"
          value={tipo}
          onChange={(event) =>
            setTipo(
              TIPO_OBRA_VALUES.includes(event.target.value as TipoObra)
                ? (event.target.value as TipoObra)
                : "",
            )
          }
        >
          <option value="">Todos os tipos</option>
          {TIPO_OBRA_VALUES.map((value) => (
            <option key={value} value={value}>
              {TIPO_OBRA_LABELS[value]}
            </option>
          ))}
        </select>
        <Button variant="secondary" type="submit">
          Filtrar
        </Button>
      </form>
      {tags.length > 0 ? (
        <div
          className="mb-5 flex flex-wrap gap-2"
          aria-label="Tags selecionadas"
        >
          {tags.map((tag) => (
            <Chip key={tag} variant="cinza">
              {tag}
              <button
                type="button"
                className="ml-1 rounded-full"
                aria-label={`Remover tag ${tag}`}
                onClick={() =>
                  setTags((current) => current.filter((item) => item !== tag))
                }
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </Chip>
          ))}
        </div>
      ) : null}
      {obras.data.length === 0 ? (
        <section className="rounded-app border border-dashed border-border p-12 text-center">
          <h2 className="font-display text-xl font-semibold">
            Nenhuma obra encontrada
          </h2>
          <p className="mt-2 text-sm text-muted">
            Ajuste os filtros ou cadastre a primeira obra.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-app border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-subtle text-muted">
                <tr>
                  <th className="px-4 py-3">Obra</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Órgão</th>
                </tr>
              </thead>
              <tbody>
                {obras.data.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link
                        className="font-semibold hover:underline"
                        href={`/obras/${item.id}`}
                      >
                        {text(item.nome)}
                      </Link>
                      <div className="text-xs text-muted">
                        {text(item.codigo)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isTipoObra(item.tipo)
                        ? TIPO_OBRA_LABELS[item.tipo]
                        : text(item.tipo)}
                    </td>
                    <td className="px-4 py-3">
                      <Chip variant={statusObraChipVariant(text(item.status))}>
                        {statusObraLabel(text(item.status))}
                      </Chip>
                    </td>
                    <td className="px-4 py-3">
                      {text(
                        (item.orgao as { nome?: string } | undefined)?.nome ??
                          item.orgaoNome,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="border-t border-border px-4 py-3 text-xs text-muted">
            Página {obras.meta.page} de {obras.meta.pageCount} ·{" "}
            {obras.meta.itemCount} registros
          </footer>
        </section>
      )}
    </main>
  );
}
