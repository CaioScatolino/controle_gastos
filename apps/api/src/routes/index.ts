import { Router, Request, Response } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/connection";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import expenseRouter from "./expense.routes";
import aiRouter from "./ai.routes";
import { privateRoute } from "../middlewares/auth.middleware";

const router = Router();

// Rota de Healthcheck / Heartbeat: Mantém o Render acordado e o MySQL quente
router.get("/ping", async (req: Request, res: Response) => {
  try {
    // Roda um SELECT 1 para manter o pool do MySQL ativo
    await db.execute(sql`SELECT 1`);
    res.json({ pong: true, database: "online" });
  } catch (err) {
    res.json({ pong: true, database: "reconnecting" });
  }
});

router.get("/", (req: Request, res: Response) => {
  res.send("Gastos.AI API Online!");
});

router.use("/auth", authRouter);
router.use("/users", userRouter);

router.use(privateRoute);

router.use("/expenses", expenseRouter);
router.use("/ai", aiRouter);

export default router;
