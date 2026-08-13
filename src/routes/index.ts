import { Router, Request, Response } from "express";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import expenseRouter from './expense.routes';
import { privateRoute } from "../middlewares/auth.middleware";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true });
});

router.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

router.use("/auth", authRouter);

router.use("/users", userRouter);

router.use(privateRoute);

router.use('/expenses', expenseRouter)

export default router;
