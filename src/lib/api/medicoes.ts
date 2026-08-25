/**
 * Cliente e regras de UI das Medicoes (E5-04). Os tipos de request vem do
 * contrato OpenAPI (types.gen.ts via `pnpm gen:api`). As regras de dominio do
 * front (RN-CRO-20: >= 1 fonte, total = soma das fontes) ficam em funcoes PURAS,
 * testaveis sem renderizar componentes. Reusa os helpers de fonte+valor do
 * ContratosContext.
 */
import {
  ErroApi,
  fontesValidas,
  somarFontes,
  type ParFonteValor,
} from "./contratos";
import type { components } from "./types.gen";

export { ErroApi, fontesValidas, somarFontes };
export type { ParFonteValor };

// --- Tipos de request gerados do contrato OpenAPI ---
export type CriarMedicaoPayload = components["schemas"]["CriarMedicaoDto"];
export type AtualizarMedicaoPayload =
  components["schemas"]["AtualizarMedicaoDto"];
export type MedicaoFontePayload = components["schemas"]["MedicaoFonteDto"];

// --- Enum (espelha TipoMedicao do backend exposto no OpenAPI) ---
export type TipoMedicao = "NORMAL" | "RETIFICACAO" | "EXTRA" | "REAJUSTAMENTO";

export const TIPOS_MEDICAO: { chave: TipoMedicao; titulo: string }[] = [
  { chave: "NORMAL", titulo: "Normal" },
  { chave: "RETIFICACAO", titulo: "Retificação" },
  { chave: "EXTRA", titulo: "Extra" },
  { chave: "REAJUSTAMENTO", titulo: "Reajustamento" },
];

// --- Entidades retornadas pela API (tipadas a mao: o backend nao anotou os
//     schemas de resposta no OpenAPI). ---
export interface MedicaoFonte {
  id: string;
  fonteId: string;
  valor: string;
}

export interface Medicao {
  id: string;
  obraId: string;
  numero: number;
  dataMedicao: string;
  tipo: TipoMedicao;
  orgaoId: string;
  observacoes: string | null;
  fontes: MedicaoFonte[];
  valorTotal: string;
}

/** Campos brutos do formulario de Medicao (todos string, vindos dos inputs). */
export interface FormularioMedicao {
  numero: string;
  dataMedicao: string;
  tipo: TipoMedicao;
  orgaoId: string;
  observacoes?: string;
  fontes: ParFonteValor[];
}

export function formularioVazio(): FormularioMedicao {
  return {
    numero: "",
    dataMedicao: "",
    tipo: "NORMAL",
    orgaoId: "",
    observacoes: "",
    fontes: [{ fonteId: "", valor: "" }],
  };
}

/**
 * Valida o formulario de Medicao (RN-CRO-20). Devolve a lista de erros; o
 * formulario so pode enviar quando vazia.
 */
export function validarMedicao(form: FormularioMedicao): string[] {
  const erros: string[] = [];
  if (!form.numero.trim() || Number(form.numero) < 1) {
    erros.push("Informe o numero do boletim (>= 1)");
  }
  if (!form.dataMedicao) erros.push("Informe a data da medicao");
  if (!form.orgaoId) erros.push("Selecione o orgao");
  // RN-CRO-20: ao menos uma fonte com valor.
  if (fontesValidas(form.fontes).length === 0) {
    erros.push("Adicione ao menos uma fonte de recurso com valor");
  }
  return erros;
}

/** Monta o payload da API a partir do formulario (apenas fontes validas). */
export function construirPayloadMedicao(
  form: FormularioMedicao,
): CriarMedicaoPayload {
  return {
    numero: Number(form.numero),
    dataMedicao: form.dataMedicao,
    tipo: form.tipo,
    orgaoId: form.orgaoId,
    observacoes: form.observacoes?.trim() ? form.observacoes : undefined,
    fontes: fontesValidas(form.fontes).map((p) => ({
      fonteId: p.fonteId,
      valor: Number(p.valor).toFixed(2),
    })),
  } as CriarMedicaoPayload;
}

// =====================================================================
// Chamadas ao backend via proxy autenticado (/api/proxy).
// =====================================================================

async function proxy<T>(caminho: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`/api/proxy/${caminho}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!r.ok) {
    const corpo = await r.json().catch(() => ({}));
    throw new ErroApi(r.status, corpo);
  }
  return (r.status === 204 ? undefined : await r.json()) as T;
}

const base = (obraId: string) => `obras/${obraId}/medicoes`;

export function listarMedicoes(obraId: string) {
  return proxy<Medicao[]>(base(obraId));
}

export function criarMedicao(obraId: string, payload: CriarMedicaoPayload) {
  return proxy<Medicao>(base(obraId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function atualizarMedicao(
  obraId: string,
  id: string,
  payload: AtualizarMedicaoPayload,
) {
  return proxy<Medicao>(`${base(obraId)}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function excluirMedicao(obraId: string, id: string) {
  return proxy<void>(`${base(obraId)}/${id}`, { method: "DELETE" });
}
