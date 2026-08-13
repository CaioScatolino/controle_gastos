import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { expenses, NewExpense, UpdateExpense } from "../db/schema";

//======================== FUNÇÕES RELACIONADAS AO CREATE DE DESPESAS ========================

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

//======================== FUNÇÕES RELACIONADAS AO READ DE DESPESAS ========================

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

export const getExpenseById = async (id: number) => {
  if (!id) {
    return null;
  }

  const expense = await db
    .select()
    .from(expenses)
    .where(eq(expenses.id, id))
    .limit(1);

  return expense;
};

//======================== FUNÇÕES RELACIONADAS AO UPDATE DE DESPESAS ========================

export const updateExpense = async (id: number, data: UpdateExpense) => {
  if (!id || !data) {
    return null;
  }

  const updateExpenseData: UpdateExpense = {
    description: data.description,
    value: data.value,
    type: data.type,
    category: data.category,
    expense_date: data.expense_date
  };

  try {
    await db.update(expenses).set(updateExpenseData).where(eq(expenses.id, id));

    const updatedExpense = await getExpenseById(id);

    if (!updatedExpense) {
      return null;
    }

    return updatedExpense;
  } catch {
    return null;
  }
};

//======================== FUNÇÕES RELACIONADAS AO DELETE DE DESPESAS ========================
