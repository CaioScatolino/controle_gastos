import { Router } from "express";
import * as expenseController from '../controllers/expense.controller'

const router = Router();

router.post("/create", expenseController.createExpense);

router.get("/", expenseController.getAllExpenses);

router.get("/:id", expenseController.getExpenseById);

router.put("/:id", expenseController.updateExpense);

export default router;