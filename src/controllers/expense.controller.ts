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

export const getExpenseById: RequestHandler = async (req, res) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.status(401).json({error: "Usuario nao autenticado", data: null})
    }

    if (!id) {
        return res.status(400).json({error: "ID da despesa não fornecido", data: null})
    }

    const expense = await expenseService.getExpenseById(Number(id));

    if (!expense) {
        return res.status(404).json({error: "Despesa não encontrada", data: null})
    }

    const [expenseData] = expense;

    if (expenseData.user_id !== req.userId) {
        return res.status(403).json({error: "Usuario nao autorizado", data: null})
    }

    return res.status(200).json({error: null, data: expenseData});
}