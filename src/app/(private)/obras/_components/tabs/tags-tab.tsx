"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Input } from "@/core/ui/atoms/input";
import { useToast } from "@/core/hooks/useToast";
import {
  aplicarTagsAction,
  listTagsAction,
  removerTagAction,
} from "@/core/actions/obras/tags_actions";

type Tag = { id: string; nome: string };

export function TagsTab({ obraId }: { obraId: string }) {
  const toast = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let ativo = true;
    void listTagsAction(obraId)
      .then((tagsAtuais) => {
        if (ativo) setTags(tagsAtuais);
      })
      .catch(() => {
        if (ativo) toast.error("Não foi possível carregar as tags.");
      });
    return () => {
      ativo = false;
    };
  }, [obraId, toast]);

  function run(action: () => Promise<void>, success: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível concluir a operação.",
        );
      }
    });
  }

  return (
    <section className="mt-5 rounded-app border border-border bg-surface p-6">
      <div className="flex gap-2">
        <Input
          aria-label="Nova tag"
          placeholder="Nova tag"
          value={newTag}
          onChange={(event) => setNewTag(event.target.value)}
        />
        <Button
          disabled={!newTag.trim() || pending}
          onClick={() =>
            run(async () => {
              await aplicarTagsAction(obraId, newTag);
              setNewTag("");
              setTags(await listTagsAction(obraId));
            }, "Tag aplicada.")
          }
        >
          Adicionar
        </Button>
      </div>

      <div className="mt-5">
        <DataTable
          title="Tags aplicadas"
          data={tags}
          getRowId={(row) => row.id}
          renderCardTitle={(row) => row.nome}
          columns={[
            {
              id: "nome",
              header: "Tag",
              cell: (tag) =>
                editingId === tag.id ? (
                  <Input
                    aria-label={`Editar tag ${tag.nome}`}
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                  />
                ) : (
                  tag.nome
                ),
            },
            {
              id: "acoes",
              header: "Ações",
              className: "text-right",
              cell: (tag) =>
                editingId === tag.id ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      disabled={!editingName.trim() || pending}
                      onClick={() =>
                        run(async () => {
                          await aplicarTagsAction(obraId, editingName);
                          await removerTagAction(obraId, tag.id);
                          setEditingId(null);
                          setTags(await listTagsAction(obraId));
                        }, "Tag atualizada.")
                      }
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => {
                        setEditingId(tag.id);
                        setEditingName(tag.nome);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={pending}
                      onClick={() =>
                        run(async () => {
                          await removerTagAction(obraId, tag.id);
                          setTags(await listTagsAction(obraId));
                        }, "Tag removida.")
                      }
                    >
                      Excluir
                    </Button>
                  </div>
                ),
            },
          ]}
        />
      </div>
    </section>
  );
}
