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

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface StreamChatInput {
  fileBuffer?: Buffer;
  mimeType?: string;
  message: string;
  history?: ChatMessage[];
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
  /**
   * Conversa interativa com streaming SSE.
   * A IA responde em tempo real e, quando aplicável, gera a despesa estruturada.
   */
  async streamChat(
    input: StreamChatInput,
    onChunk: (text: string) => void,
  ): Promise<{ fullText: string; expenseData: ExtractedExpense | null }> {
    const { fileBuffer, mimeType, message, history = [] } = input;

    const now = new Date();
    const todayBR = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

    const systemInstruction = `
      Você é o assistente financeiro inteligente do app Gastos.AI.
      Seu objetivo é conversar amigavelmente com o usuário, extrair gastos de fotos de recibos, comprovantes ou mensagens de texto, e ajustar despesas conforme ele solicitar.
      
      DATA DE HOJE: ${todayBR}.
      
      REGRAS DE CONVERSAÇÃO:
      - Seja conciso, simpático e direto (respostas de 1 a 3 frases).
      - Se o usuário enviou uma foto ou informou um gasto, explique resumidamente o que você identificou (estabelecimento, valor, data no formato DD/MM/YYYY e categoria sugerida) e pergunte se a data e os valores estão corretos ou se ele deseja ajustar algo.
      - Se o usuário pedir alterações ("mude a categoria para Lazer", "desconte 10 reais"), confirme a alteração no texto.
      - Quando você tiver identificado com clareza os dados da despesa (ou quando o usuário solicitar um ajuste), inclua OBRIGATORIAMENTE no final da sua resposta a tag especial no seguinte formato exato (sem quebras no meio da tag):
      <<<EXPENSE_DATA:{"description":"Nome do gasto","value":50.00,"type":"Despesa","category":"Alimentação","expense_date":"${todayBR}","confidence":0.95}>>>
      
      Categorias permitidas: "Alimentação" | "Moradia" | "Transporte" | "Lazer" | "Saúde" | "Educação" | "Salário" | "Investimentos" | "Outros".
      Tipos permitidos: "Despesa" | "Receita".
      Formato de data obrigatório: DD/MM/YYYY.
    `;

    // 1. Monta o histórico anterior para o Gemini
    const contents: any[] = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // 2. Monta a mensagem atual do usuário com anexo opcional
    const currentParts: any[] = [{ text: message || "Analise esta despesa." }];

    if (fileBuffer && mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: fileBuffer.toString("base64"),
        },
      });
    }

    contents.push({
      role: "user",
      parts: currentParts,
    });

    console.log("🤖 [AIService] Iniciando Streaming com Gemini Flash...");

    // 3. Chamada de streaming
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash-lite",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    let fullText = "";

    // 4. Itera sobre os pedaços (tokens) gerados pela IA e repassa para o callback
    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }

    // 5. Tenta extrair a tag <<<EXPENSE_DATA:{...}>>> se existir
    let expenseData: ExtractedExpense | null = null;
    const match = fullText.match(/<<<EXPENSE_DATA:(\{.*?\})>>>/s);

    if (match && match[1]) {
      try {
        const rawJson = JSON.parse(match[1]);
        expenseData = extractedExpenseSchema.parse(rawJson);
        console.log(
          "✨ [AIService] Despesa estruturada extraída com sucesso:",
          expenseData,
        );
      } catch (err) {
        console.warn(
          "⚠️ [AIService] Não foi possível validar o JSON da despesa emitido:",
          err,
        );
      }
    }

    return { fullText, expenseData };
  },
};
