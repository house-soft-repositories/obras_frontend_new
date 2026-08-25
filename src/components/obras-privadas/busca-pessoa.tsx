"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PessoaSugestao } from "@/lib/api/obras-privadas";
import {
  iniciaisNome,
  mascararDocumento,
  siglaTipoPessoa,
} from "@/lib/ui/documento";
import styles from "./privadas.module.css";

/** Minimo de caracteres antes de consultar (mesmo limite do backend). */
const MINIMO = 3;
/** Espera apos a ultima tecla antes de consultar. */
const DEBOUNCE_MS = 300;

interface Props {
  rotulo: string;
  ajuda?: string;
  placeholder?: string;
  /** Consulta remota; recebe o termo ja com >= 3 caracteres. */
  buscar: (termo: string) => Promise<PessoaSugestao[]>;
  selecionada: PessoaSugestao | null;
  aoSelecionar: (pessoa: PessoaSugestao | null) => void;
  /** Acao extra abaixo do campo (ex.: "Cadastrar nova pessoa"). */
  acaoExtra?: React.ReactNode;
}

/**
 * Busca-enquanto-digita de pessoa (proprietario ou profissional tecnico).
 *
 * E o primeiro combobox do projeto — nao havia nenhum autocomplete no `src/`.
 * Implementa os tres estados que o design especifica (vazio, carregando,
 * resultados) e navegacao por teclado, porque o cadastro de obra e feito em
 * volume e no teclado.
 *
 * A GUARDA DE CORRIDA e essencial: sem ela, uma resposta lenta de "mar" chega
 * depois de "marcos" e sobrescreve a lista com resultados errados. O padrao
 * (comparar o termo pendente com o atual apos o await) e o mesmo usado na
 * consulta de CNPJ em `empresas-gestao.tsx`.
 */
export function BuscaPessoa({
  rotulo,
  ajuda,
  placeholder = "Digite nome, CPF ou CNPJ…",
  buscar,
  selecionada,
  aoSelecionar,
  acaoExtra,
}: Props) {
  const [termo, setTermo] = useState("");
  /** Resultado da ULTIMA consulta concluida, junto do termo que a originou. */
  const [resultado, setResultado] = useState<{
    termo: string;
    itens: PessoaSugestao[];
  } | null>(null);
  const [focado, setFocado] = useState(-1);
  const termoAtual = useRef("");
  const idLista = useId();

  const consulta = termo.trim();
  const buscavel = consulta.length >= MINIMO;

  // Estados DERIVADOS do par (termo digitado, termo ja respondido). Guardar
  // `carregando` e `aberto` em state exigiria setState sincrono dentro do
  // efeito, que a regra react-hooks/set-state-in-effect proibe — e que geraria
  // renders em cascata a cada tecla.
  const respondido = resultado?.termo === consulta;
  const carregando = buscavel && !respondido;
  const aberto = buscavel && respondido;
  const sugestoes = aberto ? (resultado?.itens ?? []) : [];

  useEffect(() => {
    termoAtual.current = consulta;
    if (consulta.length < MINIMO) return;

    const timer = setTimeout(() => {
      buscar(consulta)
        .then((itens) => {
          // Guarda de corrida: descarta resposta de um termo ja superado.
          if (termoAtual.current !== consulta) return;
          setResultado({ termo: consulta, itens });
          setFocado(-1);
        })
        .catch(() => {
          if (termoAtual.current !== consulta) return;
          setResultado({ termo: consulta, itens: [] });
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [consulta, buscar]);

  function selecionar(pessoa: PessoaSugestao) {
    aoSelecionar(pessoa);
    setTermo("");
    setResultado(null);
  }

  function aoTeclar(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (!aberto || sugestoes.length === 0) return;
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setFocado((i) => (i + 1) % sugestoes.length);
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setFocado((i) => (i - 1 + sugestoes.length) % sugestoes.length);
    } else if (evento.key === "Enter" && focado >= 0) {
      evento.preventDefault();
      selecionar(sugestoes[focado]);
    } else if (evento.key === "Escape") {
      // Fecha a lista descartando o resultado atual; a proxima tecla reconsulta.
      setResultado(null);
    }
  }

  // Estado "ja escolhida": mostra o cartao da pessoa em vez do campo de busca.
  if (selecionada) {
    return (
      <div>
        <label className={styles.rotuloForm}>{rotulo}</label>
        <div className={styles.selecionado}>
          <span className={styles.comboAvatar} aria-hidden>
            {iniciaisNome(selecionada.nome)}
          </span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span className={styles.comboNome}>{selecionada.nome}</span>
            <span className={styles.comboDoc}>
              {mascararDocumento(selecionada.documento)}
              {selecionada.registroProfissional
                ? ` · ${selecionada.registroProfissional}`
                : ""}
            </span>
          </span>
          <button
            type="button"
            className={styles.botaoFantasma}
            onClick={() => aoSelecionar(null)}
          >
            Trocar
          </button>
        </div>
      </div>
    );
  }

  const poucosCaracteres = termo.trim().length > 0 && termo.trim().length < MINIMO;

  return (
    <div className={styles.comboWrapper}>
      <label className={styles.rotuloForm} htmlFor={`${idLista}-input`}>
        {rotulo}
      </label>
      <div className={aberto ? styles.comboCampoAtivo : styles.comboCampo}>
        <span aria-hidden>🔍</span>
        <input
          id={`${idLista}-input`}
          className={styles.comboInput}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={aoTeclar}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={aberto}
          aria-controls={idLista}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {carregando ? <span className={styles.spinner} aria-hidden /> : null}
      </div>

      {/* Estado vazio: instrui em vez de deixar o campo mudo. */}
      {!aberto && !carregando ? (
        <div className={styles.vazio}>
          <div className={styles.vazioIcone} aria-hidden>
            👤
          </div>
          <p className={styles.vazioTexto}>
            {poucosCaracteres
              ? `Digite ao menos ${MINIMO} caracteres para buscar.`
              : (ajuda ??
                `Digite ao menos ${MINIMO} caracteres para buscar entre as pessoas já cadastradas.`)}
          </p>
        </div>
      ) : null}

      {aberto && sugestoes.length > 0 ? (
        <ul className={styles.comboLista} id={idLista} role="listbox">
          {sugestoes.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === focado}
                className={
                  i === focado ? styles.comboItemFocado : styles.comboItem
                }
                onClick={() => selecionar(p)}
              >
                <span className={styles.comboAvatar} aria-hidden>
                  {iniciaisNome(p.nome)}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className={styles.comboNome}>{p.nome}</span>
                  <span className={styles.comboDoc}>
                    {mascararDocumento(p.documento)}
                    {p.registroProfissional
                      ? ` · ${p.registroProfissional}`
                      : ""}
                  </span>
                </span>
                <span
                  className={`chip ${p.tipo === "FISICA" ? "chip-cinza" : "chip-roxo"}`}
                >
                  {siglaTipoPessoa(p.tipo)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {aberto && !carregando && sugestoes.length === 0 ? (
        <div className={styles.vazio}>
          <p className={styles.vazioTitulo}>Nenhuma pessoa encontrada</p>
          <p className={styles.vazioTexto}>
            Confira o termo digitado ou cadastre a pessoa.
          </p>
        </div>
      ) : null}

      {acaoExtra}
    </div>
  );
}
