// apps/api/src/controllers/ai.controller.ts
import { RequestHandler } from "express";
import { aiService } from "../services/ai.service";

export const extractExpense: RequestHandler = async (req, res) => {
  try {
    const file = req.file; // Arquivo enviado pelo Multer (imagem ou áudio)
    const promptText = req.body.prompt; // Texto opcional digitado pelo usuário

    // Validação: precisa ter pelo menos um arquivo ou um texto
    if (!file && !promptText) {
      return res.status(400).json({
        error: "Envie um arquivo (imagem/áudio) ou uma descrição em texto.",
        data: null,
      });
    }

    console.log("📸 [AIController] Recebida solicitação de extração:", {
      hasFile: !!file,
      mimeType: file?.mimetype,
      fileSizeKb: file ? Math.round(file.size / 1024) : 0,
      hasPrompt: !!promptText,
    });

    // Chama o serviço do Gemini
    const extractedData = await aiService.extractExpense({
      fileBuffer: file?.buffer,
      mimeType: file?.mimetype,
      promptText: promptText,
    });

    return res.status(200).json({
      error: null,
      data: extractedData,
    });
  } catch (err: any) {
    console.error("❌ [AIController] Erro na extração:", err);
    return res.status(500).json({
      error:
        err.message ||
        "Falha ao processar os dados com Inteligência Artificial.",
      data: null,
    });
  }
};
