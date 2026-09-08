"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Campo } from "@/components/cadastros/cadastro-ui";
import {
  CriarLocalidadeOutput,
  criarLocalidadeSchema,
} from "@/core/schemas/localidade/create_localidade_shema";
import TipoLocalidade from "@/core/schemas/localidade/tipo_localidade_enum";
import { criarLocalidadeAction } from "../../../core/actions/localidades/create_localidade_action";
import { tipoLocalidadeLabel } from "@/lib/ui/cadastro-labels";

type CriarLocalidadeInput = typeof criarLocalidadeSchema._input;

const tiposLocalidade = Object.values(TipoLocalidade);

export function LocalidadeCriarModal({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isLoading },
  } = useForm<CriarLocalidadeInput>({
    resolver: zodResolver(criarLocalidadeSchema),
    defaultValues: {
      nome: "",
      tipo: undefined,
      municipio: "",
      uf: "",
      codigoIbge: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (!aberto) return;
    function fecharAoClicarFora(event: MouseEvent) {
      if (!dialogRef.current?.contains(event.target as Node)) aoFechar();
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, [aberto, aoFechar]);

  const onSubmit = async (data: CriarLocalidadeOutput) => {
    await criarLocalidadeAction(data);
    reset({
      nome: "",
      tipo: undefined,
      municipio: "",
      uf: "",
      codigoIbge: "",
      observacoes: "",
    });
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="criar-localidade-titulo"
        className="w-full max-w-3xl rounded-app border border-border bg-surface p-5 shadow-overlay"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="criar-localidade-titulo"
              className="text-lg font-semibold text-foreground"
            >
              Nova localidade
            </h2>
            <p className="text-sm text-muted">
              Cadastre uma localidade para usar em órgãos e obras.
            </p>
          </div>
          <button type="button" className="btn-secundario" onClick={aoFechar}>
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Campo rotulo="Nome" obrigatorio>
              <input {...register("nome")} />
              {errors.nome ? (
                <span className="dicaErro">{errors.nome.message}</span>
              ) : null}
            </Campo>
            <Campo rotulo="Tipo">
              <select
                {...register("tipo", {
                  setValueAs: (value) => value || undefined,
                })}
              >
                <option value="">—</option>
                {tiposLocalidade.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipoLocalidadeLabel(tipo)}
                  </option>
                ))}
              </select>
              {errors.tipo ? (
                <span className="dicaErro">{errors.tipo.message}</span>
              ) : null}
            </Campo>
            <Campo rotulo="Município">
              <input {...register("municipio")} />
              {errors.municipio ? (
                <span className="dicaErro">{errors.municipio.message}</span>
              ) : null}
            </Campo>
            <Campo rotulo="UF" obrigatorio dica="Sigla com 2 letras, ex.: PI.">
              <input
                maxLength={2}
                style={{ textTransform: "uppercase" }}
                {...register("uf")}
              />
              {errors.uf ? (
                <span className="dicaErro">{errors.uf.message}</span>
              ) : null}
            </Campo>
            <Campo rotulo="Código IBGE">
              <input inputMode="numeric" {...register("codigoIbge")} />
              {errors.codigoIbge ? (
                <span className="dicaErro">{errors.codigoIbge.message}</span>
              ) : null}
            </Campo>
            <Campo rotulo="Observações" full>
              <textarea {...register("observacoes")} />
              {errors.observacoes ? (
                <span className="dicaErro">{errors.observacoes.message}</span>
              ) : null}
            </Campo>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              variant="destructive"
              onClick={aoFechar}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
