"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CadastroCabecalho,
  CadastroPagina,
  CelulaForte,
  ChipTipo,
  Tabular,
  ValorTexto,
} from "@/components/cadastros/cadastro-ui";
import {
  filtrarCadastro,
  resumoRegistros,
  tipoLocalidadeLabel,
} from "@/lib/ui/cadastro-labels";
import { LocalidadeCriarModal } from "./localidade-criar-modal";
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import Pagination from "@/core/types/pagination/pagination";



interface LocalidadesClientProps {
  localidadesIniciais: Pagination<LocalidadeSchema>;
}

export function LocalidadesClient({
  localidadesIniciais,
}: LocalidadesClientProps) {
  const [localidades] = useState(localidadesIniciais);
  const [busca, setBusca] = useState("");
  const [modalCriacaoAberto, setModalCriacaoAberto] = useState(false);

  const filtradas = useMemo(
    () =>
      filtrarCadastro(localidades.data, busca, (localidade) => [
        localidade.nome,
        localidade.municipio,
        localidade.uf,
        localidade.codigoIbge,
      ]),
    [localidades, busca],
  );


  const colunas: DataTableColumn<LocalidadeSchema>[] = [
    {
      id: "nome",
      header: "Nome",
      cell: (localidade) => <CelulaForte>{localidade.nome}</CelulaForte>,
      card: false,
    },
    {
      id: "tipo",
      header: "Tipo",
      cell: (localidade) => (
        <ChipTipo label={tipoLocalidadeLabel(localidade.tipo)} />
      ),
    },
    {
      id: "municipio",
      header: "Município",
      cell: (localidade) => <ValorTexto valor={localidade.municipio} />,
    },
    { id: "uf", header: "UF", cell: (localidade) => localidade.uf },
    {
      id: "obras",
      header: "Obras",
      numeric: true,
      cell: () => <Tabular>0</Tabular>,
    },
  ];

  return (
    <CadastroPagina>
      <CadastroCabecalho
        titulo="Localidades"
        sub={resumoRegistros(localidades.data.length)}
        descricao="Territórios reutilizados na organização de órgãos e obras."
        acao={
          <Button onClick={() => setModalCriacaoAberto(true)}>
            + Nova localidade
          </Button>
        }
      />
      <div className="rounded-app border border-border bg-surface p-4 shadow-card">
        <label className="relative block max-w-lg">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          />
          <Input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome, município, UF ou código IBGE"
            aria-label="Buscar por nome, município, UF ou código IBGE"
            className="pl-10"
          />
        </label>
      </div>
      <DataTable
        title="Registros"
        data={filtradas}
        columns={colunas}
        getRowId={(localidade) => localidade.id}
        renderCardTitle={(localidade) => localidade.nome}
        renderCardStatus={(localidade) => (
          <ChipTipo label={tipoLocalidadeLabel(localidade.tipo)} />
        )}
        toolbar={
          <span className="text-xs text-muted">
            {resumoRegistros(filtradas.length)}
          </span>
        }
      />
      <LocalidadeCriarModal
        aberto={modalCriacaoAberto}
        aoFechar={() => setModalCriacaoAberto(false)}
        aoCriar={() => setModalCriacaoAberto(false)}
      />
    </CadastroPagina>
  );
}
