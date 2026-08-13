import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/apperror";

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message, data: null });
    return;
  }

  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    }));

    res.status(400).json({
      error: "Erro de validação nos dados fornecidos",
      details,
      data: null,
    });
    return;
  }
  console.error("Error:", error);
  res.status(500).json({ error: "Erro interno do servidor", data: null });
};
