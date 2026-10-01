"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  FolderOpen,
  Gavel,
  MapPin,
  NotebookText,
  Users,
} from "lucide-react";
import {
  baixarDossieObraPrivadaAction,
  baixarRelatorioFiscalizacaoPrivadaAction,
} from "@/core/actions/obras-privadas/download_obras_privadas_report_action";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import {
  ANDAMENTO_LABELS,
  HABITE_SE_LABELS,
  PAPEL_RESPONSAVEL_LABELS,
  RESULTADO_FISCALIZACAO_LABELS,
  RESULTADO_HABITE_SE_LABELS,
  SITUACAO_ALVARA_LABELS,
  SITUACAO_AUTO_INFRACAO_LABELS,
  SITUACAO_REGISTRO_ALVARA_LABELS,
  TIPO_ALVARA_LABELS,
  TIPO_AUTO_INFRACAO_LABELS,
  TIPO_FISCALIZACAO_LABELS,
  type AlvaraPrivado,
  type ArquivoPrivado,
  type AutoInfracaoPrivado,
  type FiscalizacaoPrivada,
  type HabiteSePrivado,
  type ObraPrivada,
  type ObservacaoPrivada,
  type ResponsavelPrivado,
} from "@/core/schemas/obras-privadas/obra_privada_schema";

type TabId =
  | "dados"
  | "licenciamento"
  | "fiscalizacoes"
  | "responsaveis"
  | "arquivos"
  | "timeline";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "dados", label: "Dados" },
  { id: "licenciamento", label: "Licenciamento" },
  { id: "fiscalizacoes", label: "Fiscalizações" },
  { id: "responsaveis", label: "Responsáveis" },
  { id: "arquivos", label: "Arquivos" },
  { id: "timeline", label: "Timeline" },
];

type Props = {
  obra: ObraPrivada;
  alvaras: AlvaraPrivado[];
  fiscalizacoes: FiscalizacaoPrivada[];
  autos: AutoInfracaoPrivado[];
  habiteSe: HabiteSePrivado[];
  responsaveis: ResponsavelPrivado[];
  observacoes: ObservacaoPrivada[];
  arquivos: ArquivoPrivado[];
  timeline: Record<string, unknown>[];
};

function baixarBase64(base64: string, fileName: string, contentType: string) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: contentType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function text(value: unknown, fallback = "—") {
  if (typeof value === "number") return String(value);
  return typeof value === "string" && value.trim() ? value : fallback;
}

function label(map: Record<string, string>, value: unknown) {
  return typeof value === "string" && value && map[value]
    ? map[value]
    : text(value);
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const [date] = value.split("T");
  const parts = date.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}

function booleanText(value: unknown) {
  if (typeof value !== "boolean") return "—";
  return value ? "Sim" : "Não";
}

function proprietarioNome(obra: ObraPrivada) {
  const proprietario = (obra as Record<string, unknown>).proprietario;
  if (
    typeof proprietario === "object" &&
    proprietario !== null &&
    "nome" in proprietario
  ) {
    return text(
      (proprietario as { nome?: unknown }).nome,
      text(obra.proprietarioNome),
    );
  }
  return text(obra.proprietarioNome);
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-app border border-border p-3">
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd className="mt-1 font-medium">{valor}</dd>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text: description,
}: {
  icon: typeof FileText;
  title: string;
  text: string;
}) {
  return (
    <section className="rounded-app border border-dashed border-border bg-surface p-8 text-center">
      <Icon className="mx-auto size-8 text-muted" />
      <h2 className="mt-2 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </section>
  );
}

export function ObraPrivadaDetalheClient({
  obra,
  alvaras,
  fiscalizacoes,
  autos,
  habiteSe,
  responsaveis,
  observacoes,
  arquivos,
  timeline,
}: Props) {
  const [tab, setTab] = useState<TabId>("dados");
  const [baixando, setBaixando] = useState<string | null>(null);
  const toast = useToast();
  const endereco = [obra.logradouro, obra.numero, obra.bairro]
    .filter((part) => typeof part === "string" && part.trim())
    .join(", ");

  async function baixarDossie() {
    setBaixando("dossie");
    const result = await baixarDossieObraPrivadaAction(obra.id);
    setBaixando(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    baixarBase64(
      result.data.base64,
      result.data.fileName,
      result.data.contentType,
    );
    toast.success("Dossiê gerado.");
  }

  async function baixarRelatorioFiscalizacao(id: string) {
    setBaixando(id);
    const result = await baixarRelatorioFiscalizacaoPrivadaAction(id);
    setBaixando(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    baixarBase64(
      result.data.base64,
      result.data.fileName,
      result.data.contentType,
    );
    toast.success("Relatório gerado.");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/obras-privadas"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted"
      >
        <ArrowLeft className="size-4" /> Voltar para obras privadas
      </Link>
      <section className="rounded-app border border-border bg-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted">
              Obra privada {text(obra.codigo)}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              {text(obra.descricao, text(obra.codigo, "Obra privada"))}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <MapPin className="size-4" /> {endereco || "—"} · {text(obra.uf)}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={baixando !== null}
            onClick={baixarDossie}
          >
            <Download className="size-4" />{" "}
            {baixando === "dossie" ? "Gerando..." : "Dossiê PDF"}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            {label(SITUACAO_ALVARA_LABELS, obra.situacaoAlvara)}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            {label(ANDAMENTO_LABELS, obra.andamento)}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            Habite-se: {label(HABITE_SE_LABELS, obra.habiteSe)}
          </span>
          {obra.autuada ? (
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800">
              Autuada
            </span>
          ) : null}
          {obra.embargada ? (
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800">
              Embargada
            </span>
          ) : null}
        </div>
      </section>

      <nav
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Abas da obra privada"
      >
        {TABS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={tab === item.id ? "primary" : "secondary"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      {tab === "dados" ? (
        <section className="mt-5 grid gap-5">
          <div className="rounded-app border border-border bg-surface p-6">
            <h2 className="font-display text-xl font-semibold">
              Ficha da obra
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Campo rotulo="Código" valor={text(obra.codigo)} />
              <Campo rotulo="Proprietário" valor={proprietarioNome(obra)} />
              <Campo
                rotulo="Documento do proprietário"
                valor={text(obra.proprietarioDocumento)}
              />
              <Campo rotulo="Logradouro" valor={text(obra.logradouro)} />
              <Campo rotulo="Número" valor={text(obra.numero)} />
              <Campo rotulo="Complemento" valor={text(obra.complemento)} />
              <Campo rotulo="Bairro" valor={text(obra.bairro)} />
              <Campo rotulo="UF" valor={text(obra.uf)} />
              <Campo
                rotulo="CEP"
                valor={text((obra as Record<string, unknown>).cep)}
              />
              <Campo
                rotulo="Inscrição imobiliária"
                valor={text(
                  (obra as Record<string, unknown>).inscricaoImobiliaria,
                )}
              />
              <Campo
                rotulo="Matrícula RGI"
                valor={text((obra as Record<string, unknown>).matriculaRgi)}
              />
              <Campo
                rotulo="Cartório"
                valor={text((obra as Record<string, unknown>).cartorio)}
              />
              <Campo
                rotulo="Latitude"
                valor={text((obra as Record<string, unknown>).latitude)}
              />
              <Campo
                rotulo="Longitude"
                valor={text((obra as Record<string, unknown>).longitude)}
              />
              <Campo
                rotulo="Início"
                valor={formatDate((obra as Record<string, unknown>).dataInicio)}
              />
            </dl>
          </div>
          <DataTable<ObservacaoPrivada>
            title="Observações"
            data={observacoes}
            getRowId={(observacao) => observacao.id}
            renderCardTitle={(observacao) => text(observacao.texto)}
            columns={[
              {
                id: "createdAt",
                header: "Data",
                cell: (observacao) => formatDate(observacao.createdAt),
              },
              {
                id: "texto",
                header: "Observação",
                cell: (observacao) => text(observacao.texto),
              },
            ]}
          />
        </section>
      ) : null}

      {tab === "licenciamento" ? (
        <section className="mt-5 grid gap-5">
          {alvaras.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Obra sem alvará registrado"
              text="Registre alvarás no backend para acompanhar vigência e histórico."
            />
          ) : (
            <DataTable<AlvaraPrivado>
              title="Alvarás"
              data={alvaras}
              getRowId={(alvara) => alvara.id}
              renderCardTitle={(alvara) =>
                `${text(alvara.numero, "Alvará")}/${text(alvara.ano)}`
              }
              renderCardStatus={(alvara) =>
                label(SITUACAO_REGISTRO_ALVARA_LABELS, alvara.situacao)
              }
              columns={[
                {
                  id: "numero",
                  header: "Número",
                  cell: (alvara) =>
                    `${text(alvara.numero)}/${text(alvara.ano)}`,
                },
                {
                  id: "tipo",
                  header: "Tipo",
                  cell: (alvara) => label(TIPO_ALVARA_LABELS, alvara.tipo),
                },
                {
                  id: "situacao",
                  header: "Situação",
                  cell: (alvara) =>
                    label(SITUACAO_REGISTRO_ALVARA_LABELS, alvara.situacao),
                },
                {
                  id: "emissao",
                  header: "Emissão",
                  cell: (alvara) => formatDate(alvara.dataEmissao),
                },
                {
                  id: "validade",
                  header: "Validade",
                  cell: (alvara) => formatDate(alvara.dataValidade),
                },
                {
                  id: "processo",
                  header: "Processo",
                  cell: (alvara) => text(alvara.processoAdministrativo),
                },
              ]}
            />
          )}
          <DataTable<HabiteSePrivado>
            title="Habite-se"
            data={habiteSe}
            getRowId={(item) => item.id}
            renderCardTitle={(item) => text(item.numero)}
            renderCardStatus={(item) =>
              label(RESULTADO_HABITE_SE_LABELS, item.resultado)
            }
            columns={[
              {
                id: "numero",
                header: "Número",
                cell: (item) => text(item.numero),
              },
              {
                id: "emissao",
                header: "Emissão",
                cell: (item) => formatDate(item.dataEmissao),
              },
              {
                id: "vistoria",
                header: "Vistoria",
                cell: (item) => formatDate(item.dataVistoria),
              },
              {
                id: "resultado",
                header: "Resultado",
                cell: (item) =>
                  label(RESULTADO_HABITE_SE_LABELS, item.resultado),
              },
              {
                id: "parcial",
                header: "Parcial",
                cell: (item) => booleanText(item.parcial),
              },
              {
                id: "divergencia",
                header: "Divergência",
                cell: (item) => booleanText(item.divergenciaProjeto),
              },
            ]}
          />
        </section>
      ) : null}

      {tab === "fiscalizacoes" ? (
        <section className="mt-5 grid gap-5">
          <DataTable<FiscalizacaoPrivada>
            title="Visitas de fiscalização"
            data={fiscalizacoes}
            getRowId={(fiscalizacao) => fiscalizacao.id}
            renderCardTitle={(fiscalizacao) => text(fiscalizacao.numero)}
            renderCardStatus={(fiscalizacao) =>
              label(RESULTADO_FISCALIZACAO_LABELS, fiscalizacao.resultado)
            }
            columns={[
              {
                id: "numero",
                header: "Número",
                cell: (fiscalizacao) => text(fiscalizacao.numero),
              },
              {
                id: "data",
                header: "Data",
                cell: (fiscalizacao) =>
                  formatDate(fiscalizacao.dataFiscalizacao),
              },
              {
                id: "tipo",
                header: "Tipo",
                cell: (fiscalizacao) =>
                  label(TIPO_FISCALIZACAO_LABELS, fiscalizacao.tipo),
              },
              {
                id: "resultado",
                header: "Resultado",
                cell: (fiscalizacao) =>
                  label(RESULTADO_FISCALIZACAO_LABELS, fiscalizacao.resultado),
              },
              {
                id: "etapa",
                header: "Etapa",
                cell: (fiscalizacao) =>
                  label(ANDAMENTO_LABELS, fiscalizacao.etapaConstatada),
              },
              {
                id: "relatorio",
                header: "Relatório",
                cell: (fiscalizacao) => (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={baixando !== null}
                    onClick={() => baixarRelatorioFiscalizacao(fiscalizacao.id)}
                  >
                    <Download className="size-4" />{" "}
                    {baixando === fiscalizacao.id ? "Gerando..." : "PDF"}
                  </Button>
                ),
              },
            ]}
          />
          <DataTable<AutoInfracaoPrivado>
            title="Autos vinculados"
            data={autos}
            getRowId={(auto) => auto.id}
            renderCardTitle={(auto) => text(auto.numero)}
            renderCardStatus={(auto) =>
              label(SITUACAO_AUTO_INFRACAO_LABELS, auto.situacao)
            }
            columns={[
              {
                id: "numero",
                header: "Número",
                cell: (auto) => text(auto.numero),
              },
              {
                id: "tipo",
                header: "Tipo",
                cell: (auto) => label(TIPO_AUTO_INFRACAO_LABELS, auto.tipo),
              },
              {
                id: "emissao",
                header: "Emissão",
                cell: (auto) => formatDate(auto.dataEmissao),
              },
              {
                id: "situacao",
                header: "Situação",
                cell: (auto) =>
                  label(SITUACAO_AUTO_INFRACAO_LABELS, auto.situacao),
              },
              {
                id: "descricao",
                header: "Descrição",
                cell: (auto) => text(auto.descricao),
              },
            ]}
          />
        </section>
      ) : null}

      {tab === "responsaveis" ? (
        <section className="mt-5">
          <DataTable<ResponsavelPrivado>
            title="Responsáveis técnicos"
            data={responsaveis}
            getRowId={(responsavel) => responsavel.id}
            renderCardTitle={(responsavel) =>
              text(responsavel.profissionalNome, text(responsavel.nome))
            }
            renderCardStatus={(responsavel) =>
              label(PAPEL_RESPONSAVEL_LABELS, responsavel.papel)
            }
            columns={[
              {
                id: "nome",
                header: "Profissional",
                cell: (responsavel) =>
                  text(responsavel.profissionalNome, text(responsavel.nome)),
              },
              {
                id: "papel",
                header: "Papel",
                cell: (responsavel) =>
                  label(PAPEL_RESPONSAVEL_LABELS, responsavel.papel),
              },
              {
                id: "documento",
                header: "Documento",
                cell: (responsavel) =>
                  `${text(responsavel.tipoDocumento)} ${text(responsavel.numeroDocumento)}`,
              },
              {
                id: "inicio",
                header: "Início",
                cell: (responsavel) => formatDate(responsavel.dataInicio),
              },
              {
                id: "baixa",
                header: "Baixa",
                cell: (responsavel) => formatDate(responsavel.dataBaixa),
              },
            ]}
          />
        </section>
      ) : null}

      {tab === "arquivos" ? (
        <section className="mt-5">
          <DataTable<ArquivoPrivado>
            title="Arquivos"
            data={arquivos}
            getRowId={(arquivo) => arquivo.id}
            renderCardTitle={(arquivo) =>
              text(arquivo.nome, text(arquivo.nomeOriginal))
            }
            renderCardStatus={(arquivo) => text(arquivo.categoria)}
            columns={[
              {
                id: "nome",
                header: "Nome",
                cell: (arquivo) =>
                  text(arquivo.nome, text(arquivo.nomeOriginal)),
              },
              {
                id: "categoria",
                header: "Categoria",
                cell: (arquivo) => text(arquivo.categoria),
              },
              {
                id: "vinculo",
                header: "Vínculo",
                cell: (arquivo) => text(arquivo.vinculo),
              },
              {
                id: "mime",
                header: "Tipo",
                cell: (arquivo) => text(arquivo.mimeType),
              },
              {
                id: "capturado",
                header: "Capturado em",
                cell: (arquivo) => formatDate(arquivo.capturadoEm),
              },
            ]}
          />
        </section>
      ) : null}

      {tab === "timeline" ? (
        <section className="mt-5 grid gap-5">
          {timeline.length === 0 ? (
            <EmptyState
              icon={NotebookText}
              title="Timeline vazia"
              text="Eventos de alvarás, fiscalizações, autos, habite-se e observações aparecerão aqui."
            />
          ) : (
            <DataTable<Record<string, unknown>>
              title="Timeline"
              data={timeline}
              getRowId={(evento) =>
                text(evento.id, `${text(evento.tipo)}-${text(evento.data)}`)
              }
              renderCardTitle={(evento) =>
                text(evento.titulo, text(evento.tipo))
              }
              renderCardStatus={(evento) => text(evento.tipo)}
              columns={[
                {
                  id: "data",
                  header: "Data",
                  cell: (evento) => formatDate(evento.data ?? evento.createdAt),
                },
                {
                  id: "tipo",
                  header: "Tipo",
                  cell: (evento) => text(evento.tipo),
                },
                {
                  id: "titulo",
                  header: "Evento",
                  cell: (evento) => text(evento.titulo, text(evento.descricao)),
                },
              ]}
            />
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo rotulo="Alvarás" valor={String(alvaras.length)} />
            <Campo
              rotulo="Fiscalizações"
              valor={String(fiscalizacoes.length)}
            />
            <Campo rotulo="Autos" valor={String(autos.length)} />
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-3 text-sm text-muted sm:grid-cols-3">
        <div className="rounded-app border border-border bg-surface p-4">
          <Gavel className="mb-2 size-5" /> {fiscalizacoes.length}{" "}
          fiscalização(ões)
        </div>
        <div className="rounded-app border border-border bg-surface p-4">
          <Users className="mb-2 size-5" /> {responsaveis.length}{" "}
          responsável(is)
        </div>
        <div className="rounded-app border border-border bg-surface p-4">
          <FolderOpen className="mb-2 size-5" /> {arquivos.length} arquivo(s)
        </div>
      </section>
    </main>
  );
}
