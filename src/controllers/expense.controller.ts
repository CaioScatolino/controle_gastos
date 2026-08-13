import { RequestHandler } from "express";
import { createExpenseSchema } from "../validators/expense.validator";
import * as expenseService from "../services/expense.service";

export const createExpense: RequestHandler = async (req, res) => {
    const data = createExpenseSchema.parse(req.body);

    const expense = await expenseService.createExpense(data);

    if (!expense) {
        return res.status(400).json({error: "Não foi possível criar a despesa", data: null});
    }

    console.log(req.userId)
    return res.status(201).json({error: null, data: expense});
};

export const getAllExpenses: RequestHandler = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ error: "Usuário não autenticado", data: null });
    }

    const expenses = await expenseService.getAllExpenses(req.userId);

    if (!expenses) {
        return res.status(400).json({ error: "Não foi possível buscar as despesas", data: null });
    }

    return res.status(200).json({ error: null, data: expenses });
};