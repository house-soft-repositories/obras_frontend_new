"use client";

/**
 * Blocos reutilizaveis do padrao visual das telas de cadastro (referencia
 * Claude Design): cabecalho com contagem + acao primaria, busca client-side,
 * tabela em card com cartoes no mobile, botoes de acao de 32px, chips (classes
 * globais `chip chip-*` de globals.css) e formulario em card de duas colunas
 * alternado com a lista.
 */

import { Fragment, type ReactNode } from "react";
import { ouTraco } from "@/lib/ui/cadastro-labels";
import s from "./cadastros.module.css";

/** Wrapper <main> das telas de cadastro. */
export function CadastroPagina({ children }: { children: ReactNode }) {
  return <main className={s.pagina}>{children}</main>;
}

/** Cabecalho: titulo (24px bold) + sub "{N} registros" + acao a direita. */
export function CadastroCabecalho({
  titulo,
  sub,
  descricao,
  acao,
}: {
  titulo: ReactNode;
  sub?: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <header className={s.cabecalho}>
      <div>
        <h1 className="page-titulo">{titulo}</h1>
        {sub && <p className="page-sub">{sub}</p>}
        {descricao && <p className={s.descricao}>{descricao}</p>}
      </div>
      {acao}
    </header>
  );
}

/** Nota contextual no topo dos cadastros, equivalente ao bloco de permissao do OD. */
export function CadastroNota({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className={s.nota} aria-label={titulo}>
      <div className={s.notaIcone} aria-hidden="true">
        ✓
      </div>
      <div>
        <strong>{titulo}</strong>
        <p>{children}</p>
      </div>
    </section>
  );
}

/** Trilha "{Lista} / {Novo x | Editar}" exibida como titulo na visao FORM. */
export function CadastroTrilha({
  base,
  atual,
}: {
  base: string;
  atual: string;
}) {
  return (
    <>
      <span className={s.trilhaBase}>{base} / </span>
      {atual}
    </>
  );
}

/** Busca client-side em card branco (max-width 420px). */
export function CadastroBusca({
  valor,
  aoMudar,
  placeholder,
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder: string;
}) {
  return (
    <div className={s.busca}>
      <span className={s.buscaIcone} aria-hidden="true">
        🔍
      </span>
      <input
        type="search"
        value={valor}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
      />
    </div>
  );
}

/** Mensagem de erro (role=alert) ou aviso nao bloqueante (role=status). */
export function AvisoCadastro({
  tipo,
  children,
}: {
  tipo: "erro" | "aviso";
  children: ReactNode;
}) {
  return (
    <p
      className={tipo === "erro" ? s.erro : s.aviso}
      role={tipo === "erro" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

/** Indicador de carregamento das listas. */
export function CarregandoCadastro() {
  return <p className={s.carregando}>Carregando…</p>;
}

// ---------------------------------------------------------------------------
// Tabela (desktop) + cartoes (mobile)
// ---------------------------------------------------------------------------

export interface ColunaCadastro<T> {
  titulo: string;
  render: (item: T) => ReactNode;
  /** Alinha a direita com numeros tabulares (contagens/valores). */
  numerica?: boolean;
  /** Nao repete o par label/valor no cartao mobile (ja e o titulo do cartao). */
  ocultaNoCartao?: boolean;
}

/**
 * Tabela do padrao: card branco raio 12, thead #f7f8fa, linhas com hover e,
 * abaixo de ~720px, cartoes empilhados (titulo + pares label/valor + acoes).
 * `painelExpandido` permite abrir um painel por linha (ex.: setores do orgao).
 */
export function CadastroTabela<T>({
  colunas,
  itens,
  obterId,
  tituloCartao,
  acoes,
  painelExpandido,
  vazio,
}: {
  colunas: ColunaCadastro<T>[];
  itens: T[];
  obterId: (item: T) => string;
  tituloCartao: (item: T) => ReactNode;
  acoes?: (item: T) => ReactNode;
  painelExpandido?: (item: T) => ReactNode;
  vazio: string;
}) {
  const totalColunas = colunas.length + (acoes ? 1 : 0);
  return (
    <>
      <div className={s.tabelaCard}>
        <div className={s.tabelaRolagem}>
          <table className={s.tabela}>
            <thead>
              <tr>
                {colunas.map((c) => (
                  <th
                    key={c.titulo}
                    className={c.numerica ? s.numerica : undefined}
                  >
                    {c.titulo}
                  </th>
                ))}
                {acoes && <th className={s.thAcoes}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr>
                  <td colSpan={totalColunas} className={s.vazio}>
                    {vazio}
                  </td>
                </tr>
              )}
              {itens.map((item) => {
                const painel = painelExpandido?.(item);
                return (
                  <Fragment key={obterId(item)}>
                    <tr className={s.linhaDado}>
                      {colunas.map((c) => (
                        <td
                          key={c.titulo}
                          className={c.numerica ? s.numerica : undefined}
                        >
                          {c.render(item)}
                        </td>
                      ))}
                      {acoes && (
                        <td className={s.tdAcoes}>
                          <div className={s.acoes}>{acoes(item)}</div>
                        </td>
                      )}
                    </tr>
                    {painel != null && (
                      <tr className={s.linhaPainel}>
                        <td colSpan={totalColunas}>{painel}</td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={s.cartoes}>
        {itens.length === 0 && (
          <div className={s.cartao}>
            <p className={s.vazio}>{vazio}</p>
          </div>
        )}
        {itens.map((item) => {
          const painel = painelExpandido?.(item);
          return (
            <div key={obterId(item)} className={s.cartao}>
              <div className={s.cartaoTitulo}>{tituloCartao(item)}</div>
              <dl className={s.cartaoPares}>
                {colunas
                  .filter((c) => !c.ocultaNoCartao)
                  .map((c) => (
                    <div key={c.titulo} className={s.cartaoPar}>
                      <dt>{c.titulo}</dt>
                      <dd>{c.render(item)}</dd>
                    </div>
                  ))}
              </dl>
              {acoes && <div className={s.cartaoAcoes}>{acoes(item)}</div>}
              {painel != null && <div className={s.cartaoPainel}>{painel}</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Celulas e chips
// ---------------------------------------------------------------------------

/** Texto de celula: o valor ou "—" esmaecido quando vazio. */
export function ValorTexto({ valor }: { valor: string | null | undefined }) {
  const texto = ouTraco(valor);
  return texto === "—" ? <span className={s.mudo}>—</span> : <>{texto}</>;
}

/** Nome/identificador principal da linha (peso maior). */
export function CelulaForte({ children }: { children: ReactNode }) {
  return <span className={s.celulaForte}>{children}</span>;
}

/** Numero com font tabular (contagens, codigos, valores). */
export function Tabular({
  children,
  mudo,
}: {
  children: ReactNode;
  mudo?: boolean;
}) {
  return (
    <span className={mudo ? `${s.tabular} ${s.mudo}` : s.tabular}>
      {children}
    </span>
  );
}

/** Chip de situacao logica: Ativo (verde) | Inativo (cinza). */
export function ChipSituacao({ ativo }: { ativo: boolean }) {
  return (
    <span className={`chip ${ativo ? "chip-verde" : "chip-cinza"}`}>
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

/** Chip cinza de tipo/categoria; "—" esmaecido quando sem valor. */
export function ChipTipo({ label }: { label: string }) {
  if (label === "—") return <span className={s.mudo}>—</span>;
  return <span className="chip chip-cinza">{label}</span>;
}

// ---------------------------------------------------------------------------
// Botoes de acao (32px) da coluna "Ações"
// ---------------------------------------------------------------------------

/** Botao de acao generico de 32px (ex.: abrir painel de setores). */
export function BotaoAcao({
  aoClicar,
  titulo,
  expandido,
  children,
}: {
  aoClicar: () => void;
  titulo?: string;
  expandido?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={s.btnAcao}
      title={titulo}
      aria-expanded={expandido}
      onClick={aoClicar}
    >
      {children}
    </button>
  );
}

/** Botao ✎ que abre o formulario preenchido (PATCH do recurso). */
export function BotaoEditar({
  aoClicar,
  titulo = "Editar",
}: {
  aoClicar: () => void;
  titulo?: string;
}) {
  return (
    <button
      type="button"
      className={s.btnAcao}
      title={titulo}
      aria-label={titulo}
      onClick={aoClicar}
    >
      ✎
    </button>
  );
}

/** Alternancia de ativacao logica com titulo claro (Ativar/Desativar {alvo}). */
export function BotaoAlternarAtivo({
  ativo,
  alvo,
  aoClicar,
}: {
  ativo: boolean;
  alvo: string;
  aoClicar: () => void;
}) {
  const rotulo = ativo ? "Desativar" : "Ativar";
  return (
    <button
      type="button"
      className={s.btnAcao}
      title={`${rotulo} ${alvo}`}
      onClick={aoClicar}
    >
      {rotulo}
    </button>
  );
}

/** Acao destrutiva em vermelho suave (so para recursos com DELETE na API). */
export function BotaoPerigo({
  aoClicar,
  titulo,
  children,
}: {
  aoClicar: () => void;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${s.btnAcao} ${s.btnPerigo}`}
      title={titulo}
      onClick={aoClicar}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Formulario (visao FORM alternada com a lista)
// ---------------------------------------------------------------------------

/**
 * Card branco do formulario: grid de 2 colunas (1 no mobile), erro acima do
 * rodape e botoes "Cancelar" / "Salvar" (azul) a direita com border-top.
 */
export function CadastroForm({
  aoEnviar,
  aoCancelar,
  salvando,
  erro,
  children,
}: {
  aoEnviar: (e: React.FormEvent) => void;
  aoCancelar: () => void;
  salvando: boolean;
  erro: string | null;
  children: ReactNode;
}) {
  return (
    <form className={s.formCard} onSubmit={aoEnviar}>
      <div className={s.formGrid}>{children}</div>
      {erro && (
        <p className={s.erro} role="alert">
          {erro}
        </p>
      )}
      <div className={s.formRodape}>
        <button type="button" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

/** Campo do formulario: rotulo + controle (input/select/textarea) + dica. */
export function Campo({
  rotulo,
  obrigatorio,
  full,
  dica,
  children,
}: {
  rotulo: string;
  obrigatorio?: boolean;
  full?: boolean;
  dica?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className={full ? `${s.campo} ${s.campoFull}` : s.campo}>
      <span className={s.campoRotulo}>
        {rotulo}
        {obrigatorio && (
          <span className={s.obrigatorio} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </span>
      {children}
      {dica && <small className={s.campoDica}>{dica}</small>}
    </label>
  );
}

/** Secao full-width do formulario (ex.: Endereço, Telefones) com subgrid. */
export function GrupoCampos({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className={s.grupo}>
      <h2 className={s.grupoTitulo}>{titulo}</h2>
      <div className={s.formGrid}>{children}</div>
    </section>
  );
}
