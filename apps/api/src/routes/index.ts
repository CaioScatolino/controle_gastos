import { Router, Request, Response } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/connection";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import expenseRouter from "./expense.routes";
import aiRouter from "./ai.routes";
import { privateRoute } from "../middlewares/auth.middleware";

const router = Router();

// Rota de Healthcheck / Heartbeat: Mantém o Render acordado SEM gastar cota do TiDB
router.get("/ping", async (req: Request, res: Response) => {
  // Se quiser testar o banco explicitamente, chame /api/ping?checkDb=true
  if (req.query.checkDb === "true") {
    try {
      await db.execute(sql`SELECT 1`);
      return res.json({ pong: true, database: "online" });
    } catch (err) {
      return res.status(500).json({ pong: true, database: "offline" });
    }
  }

  // Resposta ultra-leve em memória para o UptimeRobot (0 RUs gastas no TiDB)
  res.json({ pong: true, status: "alive" });
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
