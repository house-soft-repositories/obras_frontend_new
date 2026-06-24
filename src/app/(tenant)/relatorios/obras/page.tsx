"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { FiltrosObras } from "@/components/relatorios/filtros-obras";
import { ListaObras } from "@/components/relatorios/lista-obras";
import { QuantificadoresBar } from "@/components/relatorios/quantificadores-bar";
import {
  lerFiltro,
  listarObras,
  listarObrasCalendario,
  listarObrasMapa,
  obterQuantificadores,
  serializarFiltro,
  urlExportar,
  type FiltroObras,
  type ItemListaObras,
  type ModoExibicaoObras,
  type QuantificadoresObras,
} from "@/lib/api/relatorios";

const MapaObras = dynamic(
  () => import("@/components/relatorios/mapa-obras").then((m) => m.MapaObras),
  { ssr: false, loading: () => <p>Carregando mapa…</p> },
);
const CalendarioObras = dynamic(
  () =>
    import("@/components/relatorios/calendario-obras").then(
      (m) => m.CalendarioObras,
    ),
  { ssr: false },
);

const MODOS: ModoExibicaoObras[] = ["LISTA", "CARTAO", "MAPA", "CALENDARIO"];

function Pagina() {
  const router = useRouter();
  const params = useSearchParams();
  const [filtro, setFiltro] = useState<FiltroObras>(() =>
    lerFiltro(new URLSearchParams(params.toString())),
  );
  const [modo, setModo] = useState<ModoExibicaoObras>(
    (params.get("modo") as ModoExibicaoObras) || "LISTA",
  );
  const [quant, setQuant] = useState<QuantificadoresObras | null>(null);
  const [obras, setObras] = useState<ItemListaObras[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    const obrasPromise =
      modo === "MAPA"
        ? listarObrasMapa(filtro)
        : modo === "CALENDARIO"
          ? listarObrasCalendario(filtro)
          : listarObras(filtro).then((p) => p.itens);
    Promise.all([obterQuantificadores(filtro), obrasPromise])
      .then(([q, obrasResp]) => {
        if (!vivo) return;
        setQuant(q);
        setObras(obrasResp);
      })
      .catch(() => vivo && setObras([]))
      .finally(() => vivo && setCarregando(false));

    // Sincroniza a URL com o filtro + modo ativos.
    router.replace(`?${serializarFiltro(filtro, { modo }).toString()}`, {
      scroll: false,
    });
    return () => {
      vivo = false;
    };
  }, [filtro, modo, router]);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0 }}>Obras — relatorio</h1>
      <QuantificadoresBar q={quant} />
      <FiltrosObras filtro={filtro} onChange={setFiltro} />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {MODOS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            style={{ fontWeight: modo === m ? 700 : 400 }}
          >
            {m}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <a href={urlExportar(filtro, "PDF")}>Exportar PDF</a>
        <a href={urlExportar(filtro, "CSV")}>Exportar CSV</a>
      </div>

      {carregando && <p style={{ color: "#888" }}>Carregando…</p>}
      {!carregando && modo === "MAPA" && <MapaObras obras={obras} />}
      {!carregando && modo === "CALENDARIO" && <CalendarioObras obras={obras} />}
      {!carregando && (modo === "LISTA" || modo === "CARTAO") && (
        <ListaObras obras={obras} modo={modo} />
      )}
    </main>
  );
}

export default function RelatorioObrasPage() {
  return (
    <Suspense fallback={<p style={{ padding: "2rem" }}>Carregando…</p>}>
      <Pagina />
    </Suspense>
  );
}
