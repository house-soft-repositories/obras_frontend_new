/**
 * Grupos da aba Dados conforme a referencia Claude Design: "Identificação" e
 * "Execução", cada um com pares rotulo/valor ja formatados para exibicao.
 * Funcao PURA (sem React e sem fetch), testavel em vitest node.
 */
import { formatarData } from "./datas";
import { rotuloEnum, statusObraLabel } from "./obra-labels";

export interface CampoDados {
  rotulo: string;
  valor: string;
}

export interface GrupoDados {
  titulo: string;
  itens: CampoDados[];
}

export interface EntradaDadosObra {
  nome: string | null;
  codigo: string | null;
  orgaoNome: string | null;
  tipo: string | null;
  localidadeNome: string | null;
  status: string | null;
  empresaContratadaNome: string | null;
  responsavelNome: string | null;
  dataInicio: string | null;
  /** Prazo final calculado do contrato (RN-CON-01); cai no prazo da obra. */
  prazoFinal: string | null;
  latitude: string | null;
  longitude: string | null;
  vincularPagamentoPercentual: boolean;
}

/** Valor ausente vira travessao, como no resto da UI. */
function ou(valor: string | null | undefined): string {
  return valor && valor.trim() !== "" ? valor : "—";
}

/** Coordenadas como "−23.55052 / −46.63331"; sem par completo, travessao. */
export function coordenadas(
  latitude: string | null,
  longitude: string | null,
): string {
  if (!latitude || !longitude) return "—";
  return `${latitude} / ${longitude}`;
}

export function gruposDadosObra(o: EntradaDadosObra): GrupoDados[] {
  return [
    {
      titulo: "Identificação",
      itens: [
        { rotulo: "Nome da obra", valor: ou(o.nome) },
        { rotulo: "Código", valor: ou(o.codigo) },
        { rotulo: "Órgão executor", valor: ou(o.orgaoNome) },
        { rotulo: "Tipo", valor: o.tipo ? rotuloEnum(o.tipo) : "—" },
        { rotulo: "Localidade", valor: ou(o.localidadeNome) },
        { rotulo: "Status", valor: o.status ? statusObraLabel(o.status) : "—" },
      ],
    },
    {
      titulo: "Execução",
      itens: [
        { rotulo: "Empresa contratada", valor: ou(o.empresaContratadaNome) },
        { rotulo: "Responsável pela obra", valor: ou(o.responsavelNome) },
        { rotulo: "Data de início", valor: formatarData(o.dataInicio) },
        {
          rotulo: "Prazo final de execução",
          valor: formatarData(o.prazoFinal),
        },
        {
          rotulo: "Latitude / Longitude",
          valor: coordenadas(o.latitude, o.longitude),
        },
        {
          rotulo: "Vincular pagamento ao percentual",
          valor: o.vincularPagamentoPercentual ? "Ativo" : "Inativo",
        },
      ],
    },
  ];
}
