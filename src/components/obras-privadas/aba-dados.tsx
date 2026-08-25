"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  obrasNoMesmoImovel,
  type ObraPrivada,
} from "@/lib/api/obras-privadas";
import { mascararDocumento } from "@/lib/ui/documento";
import {
  chipSituacaoAlvara,
  chipAndamento,
  chipHabiteSe,
  rotuloPapelRt,
} from "@/lib/ui/obra-privada-labels";
import { formatarDataCurta } from "@/lib/ui/prazo";
import { useObraPrivada } from "./detalhe-shell";
import { EditarObraPrivada } from "./editar-obra-privada";
import styles from "./privadas.module.css";

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <div className="rotulo-campo">{rotulo}</div>
      <div className="valor-campo">{valor || "—"}</div>
    </div>
  );
}

/**
 * Aba Dados: ficha completa em blocos de visualizacao, com a edicao atras do
 * botao "Editar dados" — mesmo padrao da guia Dados da obra publica. O codigo
 * nao entra na edicao: e imutavel por RN-PRV-01.
 */
export function AbaDados() {
  const { detalhe, recarregar } = useObraPrivada();
  const [noMesmoImovel, setNoMesmoImovel] = useState<ObraPrivada[]>([]);
  const [editando, setEditando] = useState(false);

  const obraId = detalhe?.obra.id;
  useEffect(() => {
    if (!obraId) return;
    let vivo = true;
    obrasNoMesmoImovel(obraId)
      .then((lista) => {
        if (vivo) setNoMesmoImovel(lista);
      })
      .catch(() => {
        // Consulta acessoria: falhar aqui nao pode esconder a ficha da obra.
      });
    return () => {
      vivo = false;
    };
  }, [obraId]);

  if (!detalhe) return null;
  const { obra, proprietario, responsaveis } = detalhe;

  if (editando) {
    return (
      <EditarObraPrivada
        detalhe={detalhe}
        aoSalvar={() => {
          setEditando(false);
          recarregar();
        }}
        aoCancelar={() => setEditando(false)}
      />
    );
  }

  return (
    <>
      <div className={styles.cabecalho} style={{ marginTop: "1rem" }}>
        <h2 className={styles.secaoTitulo}>Ficha da obra</h2>
        <button
          type="button"
          className="btn-secundario"
          style={{ marginLeft: "auto" }}
          onClick={() => setEditando(true)}
        >
          ✎ Editar dados
        </button>
      </div>

      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Proprietário</p>
        <div className={styles.gradeCampos}>
          <Campo rotulo="Nome" valor={proprietario?.nome ?? "—"} />
          <Campo
            rotulo="Tipo"
            valor={
              proprietario
                ? proprietario.tipo === "FISICA"
                  ? "Pessoa física (PF)"
                  : "Pessoa jurídica (PJ)"
                : "—"
            }
          />
          <Campo
            rotulo={proprietario?.tipo === "JURIDICA" ? "CNPJ" : "CPF"}
            valor={
              proprietario ? mascararDocumento(proprietario.documento) : "—"
            }
          />
          <Campo rotulo="Telefone" valor={proprietario?.telefone ?? "—"} />
          <Campo rotulo="E-mail" valor={proprietario?.email ?? "—"} />
        </div>
      </div>

      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Imóvel</p>
        <div className={styles.gradeCampos}>
          <Campo
            rotulo="Inscrição imobiliária"
            valor={obra.inscricaoImobiliaria ?? "—"}
          />
          <Campo rotulo="Matrícula RGI" valor={obra.matriculaRgi ?? "—"} />
          <Campo rotulo="Cartório" valor={obra.cartorio ?? "—"} />
          <Campo rotulo="CEP" valor={obra.cep ?? "—"} />
          <Campo rotulo="Logradouro" valor={obra.logradouro} />
          <Campo rotulo="Número" valor={obra.numero ?? "—"} />
          <Campo rotulo="Complemento" valor={obra.complemento ?? "—"} />
          <Campo rotulo="Bairro" valor={obra.bairro ?? "—"} />
          <Campo rotulo="UF" valor={obra.uf} />
        </div>

        {noMesmoImovel.length > 0 ? (
          <div className={styles.alertaAviso} role="status">
            <span aria-hidden>⚠️</span>
            <div>
              <p className={styles.alertaAvisoTitulo}>
                Outras {noMesmoImovel.length} obra(s) nesta mesma inscrição
                imobiliária
              </p>
              <div className={styles.alertaAvisoLinhas}>
                {noMesmoImovel.map((o) => (
                  <Link
                    key={o.id}
                    href={`/obras-privadas/${o.id}`}
                    className={styles.botaoLink}
                  >
                    {o.codigo} — {o.logradouro}
                    {o.numero ? `, ${o.numero}` : ""}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Localização</p>
        <div className={styles.gradeCampos}>
          <Campo rotulo="Latitude" valor={obra.latitude ?? "—"} />
          <Campo rotulo="Longitude" valor={obra.longitude ?? "—"} />
          <Campo
            rotulo="Origem"
            valor={
              obra.geoOrigem === "GPS_DISPOSITIVO"
                ? "GPS do dispositivo"
                : obra.geoOrigem === "CEP"
                  ? "Derivada do CEP"
                  : "Informada manualmente"
            }
          />
        </div>
      </div>

      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Obra</p>
        <div className={styles.gradeCampos}>
          <Campo rotulo="Descrição" valor={obra.descricao} />
          <Campo
            rotulo="Data de início"
            valor={formatarDataCurta(obra.dataInicio)}
          />
          <Campo
            rotulo="Previsão de conclusão"
            valor={formatarDataCurta(obra.dataPrevistaConclusao)}
          />
        </div>
        <div className={styles.chips} style={{ marginTop: "1rem" }}>
          <span className={`chip ${chipSituacaoAlvara(obra.situacaoAlvara).tom}`}>
            {chipSituacaoAlvara(obra.situacaoAlvara).rotulo}
          </span>
          <span className={`chip ${chipAndamento(obra.andamento).tom}`}>
            {chipAndamento(obra.andamento).rotulo}
          </span>
          <span className={`chip ${chipHabiteSe(obra.habiteSe).tom}`}>
            {chipHabiteSe(obra.habiteSe).rotulo}
          </span>
        </div>
      </div>

      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Responsáveis técnicos</p>
        {responsaveis.length === 0 ? (
          <div className={styles.vazio}>
            <div className={styles.vazioIcone} aria-hidden>
              📐
            </div>
            <p className={styles.vazioTitulo}>
              Nenhum responsável técnico informado
            </p>
            <p className={styles.vazioTexto}>
              Obra sem responsável técnico é indício de irregularidade.
            </p>
          </div>
        ) : (
          <div className={styles.listaItens}>
            {responsaveis.map((r) => (
              <div key={r.id} className={styles.itemLista}>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className={styles.comboNome}>
                    {r.titulo ? `${r.titulo} ` : ""}
                    {r.nome}
                  </span>
                  <span className={styles.comboDoc}>
                    {r.registro} · {rotuloPapelRt(r.papel)}
                    {r.dataBaixa
                      ? ` · baixado em ${formatarDataCurta(r.dataBaixa)}`
                      : ""}
                  </span>
                </span>
                <span className="chip chip-teal">
                  {r.tipoDocumento} {r.numeroDocumento}
                </span>
                {!r.vigente ? (
                  <span className="chip chip-cinza">Baixado</span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
