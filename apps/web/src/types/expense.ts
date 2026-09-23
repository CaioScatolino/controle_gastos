export type ExpenseType = "Receita" | "Despesa";

export interface ExpenseItem {
  id: number;
  user_id: number;
  description: string;
  value: string;
  type: ExpenseType;
  category: string;
  expense_date: string;
  status: boolean;
}

export interface NewExpensePayload {
  user_id: number;
  description: string;
  value: number;
  type: ExpenseType;
  category: string;
  expense_date: string;
}

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
  count: number;
}