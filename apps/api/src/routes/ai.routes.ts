// apps/api/src/routes/ai.routes.ts
import { Router } from "express";
import multer from "multer";
import * as aiController from "../controllers/ai.controller";

const router = Router();

// Configuração do Multer na memória (limite de 10MB por arquivo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// POST /api/ai/extract -> aceita o arquivo no campo 'file' e o texto no campo 'prompt'
router.post("/extract", upload.single("file"), aiController.extractExpense);

export default router;
