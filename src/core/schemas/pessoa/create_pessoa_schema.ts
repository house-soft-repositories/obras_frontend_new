import { z } from "zod";
import { pessoaType } from "@/core/schemas/pessoa/pessoa_type";

const optionalText = z.string().trim().optional();

export const createPessoaSchema = z
  .object({
    tipo: pessoaType,
    documento: z
      .string()
      .trim()
      .min(1, "Informe o CPF ou CNPJ.")
      .transform((value) => value.replace(/\D/g, ""))
      .refine(
        (digits) => digits.length >= 11 && digits.length <= 14,
        "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.",
      ),
    nome: z.string().trim().min(2, "Informe o nome com pelo menos 2 caracteres."),
    nomeFantasia: optionalText,
    rg: optionalText,
    orgaoExpedidor: optionalText,
    email: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Informe um e-mail válido.",
      )
      .optional(),
    telefone: optionalText,
    cep: optionalText,
    logradouro: optionalText,
    numero: optionalText,
    complemento: optionalText,
    bairro: optionalText,
    cidade: optionalText,
    uf: z.string().trim().max(2, "Use a sigla do estado (UF).").optional(),
  })
  .transform((data) => {
    const cleaned = (value?: string) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    };
    return {
      tipo: data.tipo,
      documento: data.documento,
      nome: data.nome.trim(),
      nomeFantasia: cleaned(data.nomeFantasia),
      rg: cleaned(data.rg),
      orgaoExpedidor: cleaned(data.orgaoExpedidor),
      email: cleaned(data.email),
      telefone: cleaned(data.telefone),
      cep: cleaned(data.cep),
      logradouro: cleaned(data.logradouro),
      numero: cleaned(data.numero),
      complemento: cleaned(data.complemento),
      bairro: cleaned(data.bairro),
      cidade: cleaned(data.cidade),
      uf: data.uf?.trim() ? data.uf.trim().toUpperCase() : undefined,
    };
  });

export type CreatePessoaInput = z.input<typeof createPessoaSchema>;
export type CreatePessoaOutput = z.output<typeof createPessoaSchema>;
export type CreatePessoaType = CreatePessoaOutput;
