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

export const streamChat: RequestHandler = async (req, res) => {
  const file = req.file;
  const message = req.body.message || "";
  let history = [];

  // Se o histórico de mensagens anteriores vier como string JSON (via FormData), fazemos o parse
  if (req.body.history) {
    try {
      history =
        typeof req.body.history === "string"
          ? JSON.parse(req.body.history)
          : req.body.history;
    } catch (e) {
      console.warn("⚠️ [AIController] Falha ao fazer parse do histórico:", e);
    }
  }

  // Validação inicial
  if (!file && !message.trim()) {
    return res.status(400).json({
      error: "Envie uma mensagem de texto ou um arquivo.",
      data: null,
    });
  }

  // 1. Configura os cabeçalhos HTTP do Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.(); // Garante envio imediato dos cabeçalhos ao cliente

  console.log("⚡ [AIController] Conexão SSE aberta para chat interativo.");

  try {
    // 2. Dispara o serviço repassando cada token para o stream HTTP
    const { fullText, expenseData } = await aiService.streamChat(
      {
        fileBuffer: file?.buffer,
        mimeType: file?.mimetype,
        message,
        history,
      },
      (chunkText) => {
        // Envia o pedaço de texto gerado para o cliente
        res.write(
          `data: ${JSON.stringify({ type: "token", text: chunkText })}\n\n`,
        );
      },
    );

    // 3. Se a IA identificou ou atualizou a despesa, envia evento dedicado
    if (expenseData) {
      res.write(
        `data: ${JSON.stringify({ type: "expense_ready", expense: expenseData })}\n\n`,
      );
    }

    // 4. Avisa que o stream encerrou e fecha a conexão
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    console.log("🏁 [AIController] Stream SSE finalizado com sucesso.");
  } catch (err: any) {
    console.error("❌ [AIController] Erro durante o streaming SSE:", err);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: err.message || "Erro durante o processamento da IA.",
      })}\n\n`,
    );
    res.end();
  }
};
