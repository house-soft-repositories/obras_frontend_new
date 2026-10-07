import type { CreateProfissionalTecnicoInput } from "@/core/schemas/profissionais-tecnicos/create_profissional_tecnico_schema";

export const PROFISSIONAL_TECNICO_FORM_EXPECTED_FIELDS = [
  "pessoaId",
  "conselho",
  "numeroRegistro",
  "ufRegistro",
  "titulo",
  "ativo",
] as const satisfies ReadonlyArray<keyof CreateProfissionalTecnicoInput>;

export const PROFISSIONAL_TECNICO_FORM_REQUIRED_FIELDS = [
  "pessoaId",
  "conselho",
  "numeroRegistro",
] as const satisfies ReadonlyArray<keyof CreateProfissionalTecnicoInput>;

export const PROFISSIONAL_TECNICO_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CreateProfissionalTecnicoInput> = [
  "pessoaId",
  "conselho",
  "numeroRegistro",
  "ufRegistro",
  "titulo",
  "ativo",
];

export const PROFISSIONAL_TECNICO_FORM_EXPECTED_LABELS = [
  "Pessoa",
  "Conselho",
  "UF do registro",
  "Número do registro",
  "Título profissional",
  "Ativo",
] as const;
