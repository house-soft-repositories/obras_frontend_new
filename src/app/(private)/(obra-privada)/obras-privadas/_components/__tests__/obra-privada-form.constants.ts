import type {
  CriarObraPrivadaFormularioInput,
  CriarObraPrivadaOutput,
} from "@/core/schemas/obras-privadas/create_obra_privada_schema";
import {
  ANDAMENTO_VALUES,
  ANDAMENTO_LABELS,
  HABITE_SE_VALUES,
  HABITE_SE_LABELS,
} from "@/core/schemas/obras-privadas/obra_privada_schema";

export const OBRA_PRIVADA_FORM_EXPECTED_STEPS = [
  "Proprietário",
  "Imóvel",
  "Localização",
  "Obra",
  "Revisão",
] as const;

export const OBRA_PRIVADA_FORM_EXPECTED_FIELDS_BY_STEP: ReadonlyArray<
  ReadonlyArray<keyof CriarObraPrivadaFormularioInput>
> = [
  ["proprietarioPessoaId"],
  ["inscricaoImobiliaria", "matriculaRgi", "cartorio"],
  [
    "cep",
    "logradouro",
    "numero",
    "complemento",
    "bairro",
    "uf",
    "localidadeId",
    "latitude",
    "longitude",
  ],
  [
    "descricao",
    "observacoes",
    "andamento",
    "habiteSe",
    "dataInicio",
    "dataPrevistaConclusao",
    "orgaoId",
  ],
  [],
];

export const OBRA_PRIVADA_FORM_REQUIRED_FIELDS = [
  "proprietarioPessoaId",
  "descricao",
  "logradouro",
  "uf",
] as const satisfies ReadonlyArray<keyof CriarObraPrivadaFormularioInput>;

export const OBRA_PRIVADA_FORM_ALL_INPUT_KEYS: ReadonlyArray<
  keyof CriarObraPrivadaFormularioInput
> = [
  "descricao",
  "observacoes",
  "proprietarioPessoaId",
  "orgaoId",
  "localidadeId",
  "inscricaoImobiliaria",
  "matriculaRgi",
  "cartorio",
  "cep",
  "logradouro",
  "numero",
  "complemento",
  "bairro",
  "uf",
  "latitude",
  "longitude",
  "andamento",
  "habiteSe",
  "dataInicio",
  "dataPrevistaConclusao",
];

export const OBRA_PRIVADA_FORM_EXPECTED_ANDAMENTO_LABELS = {
  NAO_INICIADA: "Não iniciada",
  EM_ANDAMENTO: "Em andamento",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
  DEMOLIDA: "Demolida",
  CANCELADA: "Cancelada",
} as const;

export const OBRA_PRIVADA_FORM_EXPECTED_HABITE_SE_LABELS = {
  NAO_SOLICITADO: "Não emitido",
  SOLICITADO: "Solicitado",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
} as const;
