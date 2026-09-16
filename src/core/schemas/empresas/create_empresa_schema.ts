import { z } from "zod";

function isValidCnpj(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  let length = digits.length - 2;
  let numbers = digits.substring(0, length);
  let check = digits.substring(length);
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11;
  const first = result < 2 ? 0 : 11 - result;
  if (Number(check.charAt(0)) !== first) return false;
  length += 1;
  numbers = digits.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11;
  const second = result < 2 ? 0 : 11 - result;
  return Number(check.charAt(1)) === second;
}

const optionalText = z.string().trim().optional();

export const criarEmpresaSchema = z
  .object({
    razaoSocial: z
      .string()
      .trim()
      .min(2, "Informe a razão social com pelo menos 2 caracteres."),
    cnpj: z
      .string()
      .trim()
      .min(1, "Informe o CNPJ.")
      .refine(isValidCnpj, "Informe um CNPJ válido."),
    nomeFantasia: optionalText,
    responsavel: optionalText,
    cargoResponsavel: optionalText,
    email: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Informe um e-mail válido.",
      )
      .optional(),
    cep: optionalText,
    logradouro: optionalText,
    numero: optionalText,
    complemento: optionalText,
    bairro: optionalText,
    cidade: optionalText,
    uf: z.string().trim().max(2, "Use a sigla do estado (UF).").optional(),
    telefones: z.array(z.string()),
  })
  .transform((data) => {
    const cleaned = (value?: string) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    };
    const telefones = (data.telefones ?? [])
      .map((telefone) => telefone.trim())
      .filter((telefone) => telefone.length > 0);
    return {
      razaoSocial: data.razaoSocial.trim(),
      cnpj: data.cnpj.replace(/\D/g, ""),
      nomeFantasia: cleaned(data.nomeFantasia),
      responsavel: cleaned(data.responsavel),
      cargoResponsavel: cleaned(data.cargoResponsavel),
      email: cleaned(data.email),
      cep: cleaned(data.cep),
      logradouro: cleaned(data.logradouro),
      numero: cleaned(data.numero),
      complemento: cleaned(data.complemento),
      bairro: cleaned(data.bairro),
      cidade: cleaned(data.cidade),
      uf: data.uf?.trim() ? data.uf.trim().toUpperCase() : undefined,
      telefones,
    };
  });

export type CriarEmpresaInput = z.input<typeof criarEmpresaSchema>;
export type CriarEmpresaOutput = z.output<typeof criarEmpresaSchema>;
