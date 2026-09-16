import { Router } from "express";
import * as authController from '../controllers/auth.controller';
import { privateRoute } from '../middlewares/auth.middleware';

const router = Router();

router.post("/login", authController.login);
router.get("/me", privateRoute, (req, res) => {
    return res.json({ error: null, data: { userId: req.userId } });
});

export default router;