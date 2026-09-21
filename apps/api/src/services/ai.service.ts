// apps/api/src/services/ai.service.ts
import { GoogleGenAI } from "@google/genai";
import {
  ExtractedExpense,
  extractedExpenseSchema,
} from "../validators/ai.validator";

// Inicializa a IA com a chave que você colocou no apps/api/.env
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface ExtractExpenseInput {
  fileBuffer?: Buffer;
  mimeType?: string;
  promptText?: string;
}

export const aiService = {
  /**
   * Extrai dados financeiros de uma imagem (comprovante/recibo),
   * áudio ou texto digitado pelo usuário.
   */
  async extractExpense(input: ExtractExpenseInput): Promise<ExtractedExpense> {
    const { fileBuffer, mimeType, promptText } = input;

    // 1. Prompt do Sistema: Define o papel do Gemini como auditor contábil
    // Pega a data de hoje no formato YYYY-MM-DD (ex: 2026-09-21)
    // Pega a data de hoje no padrão brasileiro DD/MM/YYYY (ex: 21/09/2026)
    const now = new Date();
    const todayBR = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

    const systemInstruction = `
      Você é um assistente financeiro especialista em extrair dados de notas fiscais, cupons, comprovantes de Pix/cartão, áudios ou descrições de despesas do Brasil.
      A DATA DE HOJE É: ${todayBR}.
      
      Regras estritas para a data:
      - Extraia ou calcule a data SEMPRE no formato brasileiro DD/MM/YYYY (ex: '21/09/2026').
      - Se for uma mensagem em texto dizendo "hoje", use ${todayBR}. Se disser "ontem", calcule o dia anterior.
      - Se o comprovante tiver data impressa, converta para DD/MM/YYYY.

      Você DEVE responder ESTRITAMENTE com um objeto JSON na raiz, seguindo exatamente esta estrutura:
      {
        "description": "Nome do estabelecimento ou resumo da despesa",
        "value": 150.00,
        "type": "Despesa" ou "Receita",
        "category": "Alimentação" | "Moradia" | "Transporte" | "Lazer" | "Saúde" | "Educação" | "Salário" | "Investimentos" | "Outros",
        "expense_date": "${todayBR}",
        "confidence": 0.95,
        "detected_items": ["item 1", "item 2"]
      }
    `;

    // 2. Prepara o conteúdo multimodal (partes)
    const contents: any[] = [
      promptText ||
        "Analise este comprovante/despesa e extraia as informações financeiras estruturadas.",
    ];

    // Se o usuário enviou uma imagem (JPG/PNG) ou áudio, anexa em Base64
    if (fileBuffer && mimeType) {
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: fileBuffer.toString("base64"),
        },
      });
    }

    console.log(
      "🤖 [AIService] Enviando requisição multimodal para o Gemini Flash...",
    );

    // 3. Chamada para a LLM
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json", // Força saída pura em JSON
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("A IA não retornou nenhuma resposta legível.");
    }

    console.log("✨ [AIService] Resposta bruta da IA recebida:", responseText);

    // 4. Converte a string JSON e valida pelo nosso Schema Zod
    const rawJson = JSON.parse(responseText);

    // Tratamento resiliente: se a IA devolver dentro de um array ou chave aninhada, desempacota
    const targetData = Array.isArray(rawJson)
      ? rawJson[0]
      : rawJson.expense || rawJson.data || rawJson.transacao || rawJson;

    const validatedData = extractedExpenseSchema.parse(targetData);

    return validatedData;
  },
};
