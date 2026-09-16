import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/core/config/auth_options";
import { saudacaoPorHora } from "@/core/utils/saudacao_por_hora";
import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import { obterResumoDashboard } from "@/core/actions/relatorios/obras_relatorio_action";
import { Button } from "@/core/ui/atoms/button";
import { Caption, Eyebrow, Heading } from "@/core/ui/atoms/typography";

function percentual(parte: number, total: number): number {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] ?? "";
  const greeting = firstName
    ? `${saudacaoPorHora(new Date().getHours())}, ${firstName}`
    : "Bem-vindo";

  const params = await searchParams;
  const orgaoId =
    typeof params.orgaoId === "string" && params.orgaoId ? params.orgaoId : "";

  const [resumo, orgaos] = await Promise.all([
    obterResumoDashboard(orgaoId ? { orgaoId } : {}),
    listOrgaosPaginationAction({ page: 1, order: "ASC", take: 50 }),
  ]);

  const { contagem, obrasPorOrgao, fluxoFinanceiro, fisicoVsFinanceiro } = resumo;
  const orgaoAtivo = orgaos.data.find((o) => o.id === orgaoId);
  const maxOrgao = Math.max(1, ...obrasPorOrgao.map((o) => o.total));
  const maxFluxo = Math.max(1, ...fluxoFinanceiro.map((f) => f.valor));
  const vazia = contagem.total === 0;

  const kpis = [
    {
      label: "Total de obras",
      valor: contagem.total,
      sub:
        obrasPorOrgao.length === 1
          ? "em 1 órgão"
          : `em ${obrasPorOrgao.length} órgãos`,
      cor: "bg-accent",
    },
    {
      label: "Em desenvolvimento",
      valor: contagem.emDesenvolvimento,
      sub: `${percentual(contagem.emDesenvolvimento, contagem.total)}% da carteira`,
      cor: "bg-emerald-500",
    },
    {
      label: "Concluídas",
      valor: contagem.concluidas,
      sub: `${percentual(contagem.concluidas, contagem.total)}% da carteira`,
      cor: "bg-cyan-600",
    },
    {
      label: "Paralisadas",
      valor: contagem.paralisadas,
      sub: "requerem atenção",
      cor: "bg-red-500",
    },
  ];

  return (
    <main
      data-slot="dashboard"
      className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10"
    >
      <section className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Dashboard</Eyebrow>
          <Heading className="mt-1 text-3xl sm:text-4xl">{greeting}</Heading>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Indicadores físico-financeiros da carteira de obras
            {orgaoAtivo ? ` · ${orgaoAtivo.nome}` : ""}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/relatorios/obras"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver relatório
          </Link>
          <Link
            href="/obras"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app bg-accent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus aria-hidden="true" className="size-4" />
            Nova obra
          </Link>
        </div>
      </section>

      <section aria-label="Filtro por órgão" className="pt-6">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label
            className="grid gap-1 text-xs font-semibold text-muted"
            htmlFor="filtro-orgao"
          >
            Filtrar por órgão
            <select
              id="filtro-orgao"
              name="orgaoId"
              defaultValue={orgaoId}
              className="h-11 min-w-56 rounded-app border border-input bg-surface px-3 text-sm text-foreground"
            >
              <option value="">Todos os órgãos</option>
              {orgaos.data.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="secondary">
            Aplicar
          </Button>
          {orgaoId ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-muted underline-offset-4 hover:underline"
            >
              ← todos os órgãos
            </Link>
          ) : null}
        </form>
      </section>

      {vazia ? (
        <section className="mt-6 rounded-app border border-dashed border-border p-12 text-center">
          <Heading as="h2" className="text-xl">
            Nenhuma obra encontrada
          </Heading>
          <p className="mt-2 text-sm text-muted">
            {orgaoId
              ? "Este órgão ainda não possui obras. Limpe o filtro ou cadastre a primeira obra."
              : "Cadastre a primeira obra para ver os indicadores aqui."}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {orgaoId ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Limpar filtro
              </Link>
            ) : null}
            <Link
              href="/obras"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app border border-accent bg-accent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cadastrar obra
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section
            aria-label="Indicadores"
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {kpis.map((kpi) => (
              <article
                key={kpi.label}
                className="rounded-app border border-border bg-surface p-5 shadow-card"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`size-2.5 rounded-sm ${kpi.cor}`}
                  />
                  <Caption>{kpi.label}</Caption>
                </div>
                <p className="mt-2 font-display text-3xl font-bold tabular-nums text-foreground">
                  {kpi.valor}
                </p>
                <Caption className="mt-1">{kpi.sub}</Caption>
              </article>
            ))}
          </section>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <section
              aria-label="Obras por órgão"
              className="rounded-app border border-border bg-surface p-5 shadow-card"
            >
              <Heading as="h2" className="text-xl">
                Obras por órgão
              </Heading>
              <Caption className="mt-1">
                Selecione um órgão para filtrar o painel.
              </Caption>
              {obrasPorOrgao.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Sem dados por órgão.</p>
              ) : (
                <ul className="mt-4 grid gap-3">
                  {obrasPorOrgao.slice(0, 10).map((item) => (
                    <li key={item.orgaoId}>
                      <Link
                        href={
                          item.orgaoId === "sem-orgao"
                            ? "/dashboard"
                            : `/dashboard?orgaoId=${item.orgaoId}`
                        }
                        className="group grid gap-1 rounded-app p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Filtrar por ${item.orgaoNome}: ${item.total} obras`}
                      >
                        <span className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate font-medium text-foreground group-hover:underline">
                            {item.orgaoNome}
                          </span>
                          <span className="tabular-nums text-muted">
                            {item.total}
                          </span>
                        </span>
                        <span
                          className="h-2 overflow-hidden rounded-full bg-surface-subtle"
                          role="img"
                          aria-label={`${item.total} obras`}
                        >
                          <span
                            className="block h-full rounded-full bg-accent"
                            style={{
                              width: `${Math.round((item.total / maxOrgao) * 100)}%`,
                            }}
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section
              aria-label="Fluxo físico-financeiro"
              className="rounded-app border border-border bg-surface p-5 shadow-card"
            >
              <Heading as="h2" className="text-xl">
                Execução financeira (R$)
              </Heading>
              <Caption className="mt-1">
                Agregado local das obras listadas. Integração ao endpoint
                financeiro pendente.
              </Caption>
              {fluxoFinanceiro.every((f) => f.valor === 0) ? (
                <p className="mt-4 rounded-app border border-dashed border-border p-6 text-center text-sm text-muted">
                  Sem valores financeiros nas obras carregadas. Assim que o
                  backend expor o fluxo agregado, os totais aparecem aqui.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3">
                  {fluxoFinanceiro.map((item) => (
                    <li key={item.nome} className="grid gap-1">
                      <span className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-foreground">
                          {item.nome}
                        </span>
                        <span className="tabular-nums text-muted">
                          {item.valor.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </span>
                      <span className="h-2 overflow-hidden rounded-full bg-surface-subtle">
                        <span
                          className="block h-full rounded-full bg-cyan-600"
                          style={{
                            width: `${Math.round((item.valor / maxFluxo) * 100)}%`,
                          }}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Heading as="h3" className="mt-6 text-base">
                Físico × financeiro (%)
              </Heading>
              <ul className="mt-3 grid gap-3">
                {fisicoVsFinanceiro.map((item) => (
                  <li key={item.nome} className="grid gap-1">
                    <span className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-foreground">
                        {item.nome}
                      </span>
                      <span className="tabular-nums text-muted">
                        {item.percentual}%
                      </span>
                    </span>
                    <span className="h-2 overflow-hidden rounded-full bg-surface-subtle">
                      <span
                        className="block h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(100, item.percentual)}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
