"use client";

import {
  AlertCircle,
  Check,
  Plus,
  Search,
  SearchX,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NovoTenantModal } from "@/components/tenants/novo-tenant-form";
import {
  mensagemErro,
  proxyJson,
} from "@/components/cadastros/proxy-cadastros";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { filtrarCadastro } from "@/lib/ui/cadastro-labels";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  cnpj: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TenantsPage() {
  const [itens, setItens] = useState<Tenant[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [criado, setCriado] = useState(false);

  useEffect(() => {
    let vivo = true;
    proxyJson<Tenant[]>("tenancies")
      .then((dados) => {
        if (!vivo) return;
        setItens(dados);
        setErroLista(null);
      })
      .catch((erro) => vivo && setErroLista(mensagemErro(erro)))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [tentativa]);

  const filtrados = useMemo(
    () =>
      filtrarCadastro(itens, busca, (tenant) => [
        tenant.name,
        tenant.slug,
        tenant.cnpj,
      ]),
    [itens, busca],
  );

  const colunas: DataTableColumn<Tenant>[] = [
    {
      id: "nome",
      header: "Nome",
      cell: (tenant) => (
        <span className="font-semibold text-foreground">{tenant.name}</span>
      ),
      card: false,
    },
    {
      id: "slug",
      header: "Slug",
      cell: (tenant) => (
        <span className="font-mono text-xs text-muted">{tenant.slug}</span>
      ),
    },
    {
      id: "cnpj",
      header: "CNPJ",
      cell: (tenant) => (
        <span className="font-mono text-xs text-muted">
          {tenant.cnpj ?? "Não informado"}
        </span>
      ),
    },
    {
      id: "situacao",
      header: "Situação",
      cell: (tenant) => <Situacao ativo={tenant.active} />,
      card: false,
    },
  ];

  const semResultado = !carregando && !erroLista && filtrados.length === 0;

  return (
    <main className="mx-auto grid max-w-[1440px] gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Configuração da plataforma
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[40px]">
            Tenants
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-5 text-muted">
            Gerencie as organizações com acesso ao Obras Gest e acompanhe a
            situação de cada ambiente.
          </p>
        </div>
        <Button onClick={() => setModalAberto(true)}>
          <Plus aria-hidden="true" />
          Novo tenant
        </Button>
      </header>

      {criado ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-app border border-border bg-surface p-4 text-sm shadow-card"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-foreground">
            <Check aria-hidden="true" className="size-4" />
          </span>
          <div>
            <strong className="font-semibold text-foreground">
              Tenant criado com sucesso
            </strong>
            <p className="mt-0.5 text-muted">
              A organização foi adicionada à lista e está pronta para
              configuração.
            </p>
          </div>
        </div>
      ) : null}

      {carregando ? <CarregamentoTenants /> : null}
      {erroLista ? (
        <EstadoRestrito
          mensagem={erroLista}
          tentarNovamente={() => {
            setCarregando(true);
            setTentativa((atual) => atual + 1);
          }}
        />
      ) : null}
      {semResultado ? (
        <EstadoVazio
          busca={busca}
          limparBusca={() => setBusca("")}
          abrirModal={() => setModalAberto(true)}
        />
      ) : null}
      {!carregando && !erroLista && filtrados.length > 0 ? (
        <DataTable
          title="Organizações"
          data={filtrados}
          columns={colunas}
          getRowId={(tenant) => tenant.id}
          renderCardTitle={(tenant) => tenant.name}
          renderCardStatus={(tenant) => <Situacao ativo={tenant.active} />}
          toolbar={
            <label className="relative block w-full sm:max-w-sm">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <Input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome, slug ou CNPJ"
                aria-label="Buscar por nome, slug ou CNPJ"
                className="pl-10"
              />
            </label>
          }
        />
      ) : null}
      <NovoTenantModal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoCriar={() => {
          setModalAberto(false);
          setCriado(true);
          setCarregando(true);
          setTentativa((atual) => atual + 1);
        }}
      />
    </main>
  );
}

function Situacao({ ativo }: { ativo: boolean }) {
  return (
    <span className="inline-flex min-h-7 items-center gap-2 rounded-full border border-border px-2.5 text-xs font-semibold text-foreground">
      <span
        aria-hidden="true"
        className={
          ativo
            ? "size-1.5 rounded-full bg-accent"
            : "size-1.5 rounded-full bg-muted"
        }
      />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

function CarregamentoTenants() {
  return (
    <div
      aria-label="Carregando tenants"
      className="grid gap-px bg-border"
      role="status"
    >
      {[0, 1, 2].map((linha) => (
        <div
          key={linha}
          className="grid grid-cols-3 gap-6 bg-surface px-6 py-5"
        >
          <span className="h-4 animate-pulse rounded-sm bg-surface-subtle" />
          <span className="h-4 animate-pulse rounded-sm bg-surface-subtle" />
          <span className="h-4 w-2/3 animate-pulse rounded-sm bg-surface-subtle" />
        </div>
      ))}
    </div>
  );
}

function EstadoRestrito({
  mensagem,
  tentarNovamente,
}: {
  mensagem: string;
  tentarNovamente: () => void;
}) {
  return (
    <div className="grid min-h-72 place-items-center bg-surface-subtle p-6 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-app bg-foreground text-white">
          <ShieldAlert aria-hidden="true" className="size-6" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
          Acesso restrito
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">{mensagem}</p>
        <Button variant="secondary" className="mt-5" onClick={tentarNovamente}>
          <AlertCircle aria-hidden="true" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}

function EstadoVazio({
  busca,
  limparBusca,
  abrirModal,
}: {
  busca: string;
  limparBusca: () => void;
  abrirModal: () => void;
}) {
  return (
    <div className="grid min-h-72 place-items-center p-6 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-app border border-border bg-surface-subtle text-foreground">
          <SearchX aria-hidden="true" className="size-6" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
          Nenhum tenant encontrado
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          {busca
            ? `Não há tenants que correspondam a “${busca}”.`
            : "Ainda não há tenants cadastrados."}
        </p>
        {busca ? (
          <Button variant="secondary" className="mt-5" onClick={limparBusca}>
            Limpar busca
          </Button>
        ) : (
          <Button className="mt-5" onClick={abrirModal}>
            <Plus aria-hidden="true" />
            Criar o primeiro tenant
          </Button>
        )}
      </div>
    </div>
  );
}
