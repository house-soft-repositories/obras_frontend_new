import { z } from "zod";
import { financeiroBaseSchema } from "./common_schema";
import { liquidacaoSchema } from "./liquidacao_schema";

export const pagamentoSchema = financeiroBaseSchema.extend({
  empenhoId: z.string().uuid().optional(),
  liquidacaoId: z.string().uuid(),
  medicaoId: z.string().uuid().nullable().optional(),
  numeroOrdemBancaria: z.string().nullable().optional(),
  dataOrdemBancaria: z.string().nullable().optional(),
  dataPagamento: z.string().nullable().optional(),
  liquidacao: liquidacaoSchema.optional(),
});
export type Pagamento = z.infer<typeof pagamentoSchema>;

export const pagamentoComAlertaSchema = pagamentoSchema.extend({
  alerta: z.string().optional(),
  warning: z.string().optional(),
});
export type PagamentoComAlerta = z.infer<typeof pagamentoComAlertaSchema>;

export const pagamentoListResponseSchema = z.union([
  z.array(pagamentoSchema),
  z.object({ data: z.array(pagamentoSchema) }),
  z.object({ items: z.array(pagamentoSchema) }),
]);
export type PagamentoListResponse = z.infer<typeof pagamentoListResponseSchema>;

export const criarPagamentoSchema = pagamentoSchema
  .pick({
    empenhoId: true,
    liquidacaoId: true,
    fonteId: true,
    valor: true,
    numeroOrdemBancaria: true,
    observacoes: true,
    dataOrdemBancaria: true,
  })
  .extend({
    empenhoId: z.string().uuid("Escolha uma liquidação válida."),
    numeroOrdemBancaria: z.string().min(1, "Informe o número da ordem bancária."),
    observacoes: z.string().optional(),
    dataOrdemBancaria: z.string().min(1, "Informe a data do pagamento."),
  });
export type CriarPagamentoInput = z.infer<typeof criarPagamentoSchema>;
export type CriarPagamentoFormInput = z.input<typeof criarPagamentoSchema>;

export const atualizarPagamentoSchema = criarPagamentoSchema.partial();
export type AtualizarPagamentoInput = z.infer<typeof atualizarPagamentoSchema>;
export type AtualizarPagamentoFormInput = z.input<typeof atualizarPagamentoSchema>;
