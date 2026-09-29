"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { alternarAtivoProfissionalTecnicoAction } from "@/core/actions/profissionais-tecnicos/toggle_ativo_profissional_tecnico_action";
import { atualizarProfissionalTecnicoAction } from "@/core/actions/profissionais-tecnicos/update_profissional_tecnico_action";
import type { ProfissionalTecnico } from "@/core/schemas/profissionais-tecnicos/profissional_tecnico_schema";
import {
  updateProfissionalTecnicoSchema,
  type UpdateProfissionalTecnicoInput,
  type UpdateProfissionalTecnicoOutput,
} from "@/core/schemas/profissionais-tecnicos/update_profissional_tecnico_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Input } from "@/core/ui/atoms/input";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { Switch } from "@/core/ui/atoms/switch";

const CONSELHOS = ["CREA", "CAU", "CFT"] as const;
const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

function SelectForm({
  label,
  error,
  children,
  ...props
}: ComponentProps<"select"> & { label: string; error?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <select
        className="h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs font-normal text-(--cor-perigo)" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function EditarProfissionalTecnicoModal({
  profissional,
  onClose,
}: {
  profissional: ProfissionalTecnico;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const form = useForm<
    UpdateProfissionalTecnicoInput,
    unknown,
    UpdateProfissionalTecnicoOutput
  >({
    resolver: zodResolver(updateProfissionalTecnicoSchema),
    mode: "onTouched",
    defaultValues: {
      conselho: profissional.conselho,
      numeroRegistro: profissional.numeroRegistro,
      ufRegistro: profissional.ufRegistro ?? "",
      titulo: profissional.titulo ?? "",
      ativo: profissional.ativo,
    },
  });

  function onSubmit(values: UpdateProfissionalTecnicoOutput) {
    const parsed = updateProfissionalTecnicoSchema.parse(values);
    startTransition(async () => {
      const result = await atualizarProfissionalTecnicoAction(
        profissional.id,
        parsed,
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Profissional técnico atualizado com sucesso.");
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal.Root open onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Editar profissional técnico</Modal.Title>
            <Modal.Description>
              Atualize conselho, registro e status de {profissional.nome}.
            </Modal.Description>
          </Modal.Header>
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <Modal.Body>
              <div className="rounded-app border border-border bg-surface-subtle p-4">
                <p className="text-sm font-semibold text-foreground">
                  {profissional.nome}
                </p>
                <p className="mt-1 text-xs text-muted">
                  CPF/CNPJ {profissional.documento}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectForm
                  label="Conselho"
                  required
                  {...form.register("conselho")}
                  error={form.formState.errors.conselho?.message}
                >
                  {CONSELHOS.map((conselho) => (
                    <option key={conselho} value={conselho}>
                      {conselho}
                    </option>
                  ))}
                </SelectForm>
                <SelectForm
                  label="UF do registro"
                  {...form.register("ufRegistro")}
                  error={form.formState.errors.ufRegistro?.message}
                >
                  <option value="">Sem UF</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </SelectForm>
              </div>
              <InputForm
                label="Número do registro"
                required
                {...form.register("numeroRegistro")}
                error={form.formState.errors.numeroRegistro?.message}
              />
              <InputForm
                label="Título profissional"
                {...form.register("titulo")}
                error={form.formState.errors.titulo?.message}
              />
              <label className="flex items-center gap-3 rounded-app border border-border p-3 text-sm font-semibold text-foreground">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input accent-accent"
                  {...form.register("ativo")}
                />
                Profissional ativo
              </label>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}

function AtivoSwitch({
  profissional,
}: {
  profissional: ProfissionalTecnico;
}) {
  const router = useRouter();
  const toast = useToast();
  const [checked, setChecked] = useState(profissional.ativo);
  const [isPending, startTransition] = useTransition();

  function handleCheckedChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const result = await alternarAtivoProfissionalTecnicoAction(
        profissional.id,
        { ativo: next },
      );
      if (!result.success) {
        setChecked(!next);
        toast.error(result.error);
        return;
      }
      toast.success(
        next
          ? "Profissional ativado com sucesso."
          : "Profissional desativado com sucesso.",
      );
      router.refresh();
    });
  }

  return (
    <span
      className="inline-flex items-center gap-2"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Switch
        checked={checked}
        disabled={isPending}
        onCheckedChange={handleCheckedChange}
        aria-label={
          checked
            ? `Desativar profissional ${profissional.nome}`
            : `Ativar profissional ${profissional.nome}`
        }
      />
      <span className="text-sm text-foreground">
        {checked ? "Ativo" : "Inativo"}
      </span>
    </span>
  );
}

export function ProfissionaisTecnicosTable({
  data,
}: {
  data: ProfissionalTecnico[];
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ProfissionalTecnico | null>(null);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data;
    return data.filter((profissional) =>
      [
        profissional.nome,
        profissional.documento,
        profissional.registro,
        profissional.numeroRegistro,
        profissional.titulo ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [data, query]);

  return (
    <>
      <DataTable<ProfissionalTecnico>
        title="Profissionais cadastrados"
        data={filtered}
        getRowId={(profissional) => profissional.id}
        renderCardTitle={(profissional) => profissional.nome}
        renderCardStatus={(profissional) =>
          profissional.ativo ? "Ativo" : "Inativo"
        }
        onRowClick={setSelected}
        pageSize={10}
        toolbar={
          <label className="relative block max-w-sm">
            <span className="sr-only">Buscar profissional</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, CPF/CNPJ ou registro"
              className="pl-9"
            />
          </label>
        }
        columns={[
          {
            id: "nome",
            header: "Nome",
            cell: (profissional) => profissional.nome,
          },
          {
            id: "registro",
            header: "Registro",
            cell: (profissional) => profissional.registro,
          },
          {
            id: "titulo",
            header: "Título",
            cell: (profissional) => formatNullable(profissional.titulo),
          },
          {
            id: "documento",
            header: "CPF/CNPJ",
            cell: (profissional) => profissional.documento,
          },
          {
            id: "status",
            header: "Status",
            cell: (profissional) => (
              <AtivoSwitch
                key={`${profissional.id}-${profissional.ativo}`}
                profissional={profissional}
              />
            ),
          },
        ]}
      />
      {selected ? (
        <EditarProfissionalTecnicoModal
          profissional={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}
