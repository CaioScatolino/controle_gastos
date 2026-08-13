import z from "zod";

export const createExpenseSchema = z.object({
  user_id: z.number().int().positive(),
  description: z.string().min(1, "Descrição é obrigatória"),
  value: z
    .number()
    .positive("Valor deve ser maior que 0")
    .transform((val) => val.toString()),
  type: z.enum(["Receita", "Despesa"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  expense_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data e hora inválidas",
    })
    .transform((val) => new Date(val)),
});

export const updateExpenseSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  value: z
    .number()
    .positive("Valor deve ser maior que 0")
    .transform((val) => val.toString()),
  type: z.enum(["Receita", "Despesa"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  expense_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data e hora inválidas",
    })
    .transform((val) => new Date(val))
});
