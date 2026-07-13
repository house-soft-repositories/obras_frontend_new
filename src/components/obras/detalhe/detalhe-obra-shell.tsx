"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
// nota: carregamento client com guarda `vivo` (padrao do repo). O cabecalho
// re-busca quando o ObraForm dispara o evento "obra:atualizada" apos salvar.
import type { DesempenhoObra } from "@/lib/api/relatorios";
import { abaAtivaDoPathname, abasDetalheObra } from "@/lib/ui/obra-detalhe";
import {
  semaforoInfo,
  statusObraChipClasse,
  statusObraLabel,
} from "@/lib/ui/obra-labels";
import estilos from "./detalhe-obra.module.css";

interface ObraCabecalho {
  id: string;
  nome: string;
  codigo: string;
  status: string;
  orgaoId: string | null;
}

interface OrgaoResumo {
  id: string;
  nome: string;
}

async function get<T>(caminho: string): Promise<T> {
  const r = await fetch(`/api/proxy/${caminho}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/**
 * Casca do detalhe unificado da obra (RF-14): breadcrumb, card de cabecalho
 * (nome, codigo, orgao, chip de status e semaforo) e barra de abas sobre as
 * rotas filhas existentes de /obras/[id].
 */
export function DetalheObraShell({
  obraId,
  children,
}: {
  obraId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [obra, setObra] = useState<ObraCabecalho | null>(null);
  const [desempenho, setDesempenho] = useState<DesempenhoObra | null>(null);
  const [orgaos, setOrgaos] = useState<OrgaoResumo[]>([]);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let vivo = true;
    get<ObraCabecalho>(`obras/${obraId}`)
      .then((o) => vivo && setObra(o))
      .catch(() => vivo && setObra(null));
    get<DesempenhoObra>(`relatorios/obras/${obraId}/desempenho`)
      .then((d) => vivo && setDesempenho(d))
      .catch(() => vivo && setDesempenho(null));
    get<OrgaoResumo[]>("orgaos")
      .then((o) => vivo && setOrgaos(o))
      .catch(() => vivo && setOrgaos([]));
    return () => {
      vivo = false;
    };
  }, [obraId, versao]);

  useEffect(() => {
    const rebuscar = () => setVersao((v) => v + 1);
    window.addEventListener("obra:atualizada", rebuscar);
    return () => window.removeEventListener("obra:atualizada", rebuscar);
  }, []);

  const ativa = abaAtivaDoPathname(pathname ?? "");
  const semaforo = semaforoInfo(desempenho?.semaforo ?? null);
  const orgaoNome =
    (obra?.orgaoId && orgaos.find((o) => o.id === obra.orgaoId)?.nome) || "—";

  return (
    <main className={estilos.pagina}>
      <nav className={estilos.breadcrumb} aria-label="Trilha de navegação">
        <Link href="/obras" className={estilos.breadcrumbLink}>
          Obras
        </Link>
        <span className={estilos.breadcrumbSep}>/</span>
        <span className={estilos.breadcrumbCodigo}>{obra?.codigo ?? "…"}</span>
      </nav>

      <header className={estilos.cabecalho}>
        <div className={estilos.cabecalhoTexto}>
          <h1 className={estilos.nome}>{obra?.nome ?? "…"}</h1>
          <p className={estilos.sub}>
            {obra?.codigo ?? "…"} · {orgaoNome}
          </p>
        </div>
        <div className={estilos.cabecalhoDireita}>
          {obra && (
            <span className={"chip " + statusObraChipClasse(obra.status)}>
              {statusObraLabel(obra.status)}
            </span>
          )}
          <span className={estilos.semaforo}>
            <span
              className={estilos.semaforoBola}
              style={{ background: semaforo.cor }}
              aria-hidden
            />
            {semaforo.rotulo}
          </span>
        </div>
      </header>

      <nav className={estilos.abas} aria-label="Seções da obra">
        {abasDetalheObra(obraId).map((aba) => (
          <Link
            key={aba.chave}
            href={aba.href}
            className={
              aba.chave === ativa
                ? `${estilos.aba} ${estilos.abaAtiva}`
                : estilos.aba
            }
            aria-current={aba.chave === ativa ? "page" : undefined}
          >
            {aba.titulo}
          </Link>
        ))}
      </nav>

      <div>{children}</div>
    </main>
  );
}
