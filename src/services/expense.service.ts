import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { expenses, NewExpense } from "../db/schema";

export const createExpense = async (data: NewExpense) => {
  if (!data) {
    return null;
  }

  try {
    const newExpense: NewExpense = {
      ...data,
      user_id: Number(data.user_id),
      value: String(data.value),
      expense_date: new Date(data.expense_date),
    };

    const result = await db.insert(expenses).values(newExpense).$returningId();

    if (!result) {
      return null;
    }

    const createdExpenseId = result[0].id;

    const [createdExpense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, createdExpenseId))
      .limit(1);

    return createdExpense;
  } catch {
    return null;
  }
};

export const getAllExpenses = async (user_id: number) => {
  if (!user_id) {
    return null;
  }

  const userAllExpenses = await db
    .select()
    .from(expenses)
    .where(eq(expenses.user_id, user_id));

  return userAllExpenses;
};
