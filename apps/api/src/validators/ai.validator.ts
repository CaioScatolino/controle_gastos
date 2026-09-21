// apps/api/src/validators/ai.validator.ts
import { z } from "zod";

/**
 * Schema rigoroso para garantir que a IA devolva os dados
 * exatamente no formato esperado pela tabela 'expenses' do MySQL.
 */
export const extractedExpenseSchema = z.object({
  description: z
    .string()
    .describe(
      "Nome do estabelecimento ou descrição resumida da transação (ex: 'Supermercado Carrefour')",
    ),

  value: z
    .number()
    .positive()
    .describe("Valor monetário total da transação como número positivo"),

  type: z
    .enum(["Receita", "Despesa"])
    .describe("Classificação se é uma Despesa ou Receita"),

  category: z
    .enum([
      "Alimentação",
      "Moradia",
      "Transporte",
      "Lazer",
      "Saúde",
      "Educação",
      "Salário",
      "Investimentos",
      "Outros",
    ])
    .describe("A categoria que melhor se encaixa no comprovante"),

  expense_date: z
    .string()
    .describe(
      "Data da compra/transação no formato brasileiro DD/MM/YYYY (ex: '21/09/2026'). Se não houver data legível, use a data atual",
    ),


  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Grau de certeza da IA na leitura (de 0.0 a 1.0)"),

  detected_items: z
    .array(z.string())
    .optional()
    .describe("Lista de itens ou produtos individuais encontrados no cupom"),
});

export type ExtractedExpense = z.infer<typeof extractedExpenseSchema>;
