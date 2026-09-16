import { z } from "zod";
import { financeiroBaseSchema } from "./common_schema";
import { empenhoSchema } from "./empenho_schema";

export const liquidacaoSchema = financeiroBaseSchema.extend({
  empenhoId: z.string().uuid(),
  dataLiquidacao: z.string().nullable().optional(),
  empenho: empenhoSchema.optional(),
});
export type Liquidacao = z.infer<typeof liquidacaoSchema>;

export const liquidacaoListResponseSchema = z.union([
  z.array(liquidacaoSchema),
  z.object({ data: z.array(liquidacaoSchema) }),
  z.object({ items: z.array(liquidacaoSchema) }),
]);
export type LiquidacaoListResponse = z.infer<
  typeof liquidacaoListResponseSchema
>;

export const criarLiquidacaoSchema = liquidacaoSchema
  .pick({
    empenhoId: true,
    fonteId: true,
    valor: true,
    numero: true,
    observacoes: true,
    dataLiquidacao: true,
  })
  .extend({
    numero: z.string().min(1, "Informe o número."),
    observacoes: z.string().optional(),
    dataLiquidacao: z.string().min(1, "Informe a data da liquidação."),
  });
export type CriarLiquidacaoInput = z.infer<typeof criarLiquidacaoSchema>;
export type CriarLiquidacaoFormInput = z.input<typeof criarLiquidacaoSchema>;

export const atualizarLiquidacaoSchema = criarLiquidacaoSchema.partial();
export type AtualizarLiquidacaoInput = z.infer<
  typeof atualizarLiquidacaoSchema
>;
export type AtualizarLiquidacaoFormInput = z.input<
  typeof atualizarLiquidacaoSchema
>;
