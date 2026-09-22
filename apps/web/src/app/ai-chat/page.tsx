"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNav } from "@/components/BottomNav";
import { apiFetch } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import {
  Sparkles,
  ArrowLeft,
  Camera,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Tag,
  Calendar,
  Wallet,
  Check,
  Bot,
  User,
  Image as ImageIcon,
} from "lucide-react";

interface ExtractedData {
  description: string;
  value: number;
  type: "Receita" | "Despesa";
  category: string;
  expense_date: string;
  confidence: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  expenseData?: ExtractedData | null;
  isStreaming?: boolean;
  saved?: boolean;
}

export default function AiChatPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Histórico de mensagens do Chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou seu assistente financeiro. Tire foto de um comprovante ou descreva seu gasto em texto que eu organizo tudo para você.",
    },
  ]);

  // Autenticação
  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // Rola automaticamente para o fim da conversa
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Manipula seleção de foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Envio da mensagem com streaming SSE
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !inputMessage.trim()) return;
    if (isStreaming) return;

    setError(null);

    const userText = inputMessage.trim();
    const currentFile = selectedFile;
    const currentPreview = previewUrl;

    // Limpa campos de entrada
    setInputMessage("");
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // 1. Adiciona a mensagem do usuário no chat
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        content: userText || "Analise este comprovante.",
        imageUrl: currentPreview || undefined,
      },
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
      },
    ];

    setMessages(newMessages);
    setIsStreaming(true);

    try {
      // 2. Prepara o histórico anterior para enviar à API (para conversa contínua)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          text: m.content,
        }));

      const formData = new FormData();
      if (currentFile) formData.append("file", currentFile);
      if (userText) formData.append("message", userText);
      formData.append("history", JSON.stringify(history));

      const token = authStorage.getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

      // 3. Conexão SSE via fetch
      const response = await fetch(`${apiUrl}/ai/chat-stream`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na conexão com o servidor (${response.status})`);
      }

      if (!response.body) {
        throw new Error("Stream de resposta não disponível.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";
      let detectedExpense: ExtractedData | null = null;

      // 4. Leitura do Stream contínuo
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          if (!block.trim().startsWith("data: ")) continue;
          const jsonStr = block.replace("data: ", "").trim();

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "token") {
              accumulatedText += event.text;

              // Remove a tag técnica <<<EXPENSE_DATA:...>>> da visualização do usuário
              const cleanText = accumulatedText
                .replace(/<<<EXPENSE_DATA:[\s\S]*?>>>/g, "")
                .trim();


              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: cleanText }
                    : msg
                )
              );
            } else if (event.type === "expense_ready") {
              detectedExpense = event.expense;
            } else if (event.type === "error") {
              setError(event.message || "Erro no processamento da IA.");
            }
          } catch (e) {
            // Ignora JSON incompleto durante split
          }
        }
      }

      // 5. Finaliza o estado da mensagem da IA com a despesa acoplada
      const finalCleanText = accumulatedText
        .replace(/<<<EXPENSE_DATA:[\s\S]*?>>>/g, "")
        .trim();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
              ...msg,
              content: finalCleanText || "Despesa analisada com sucesso!",
              isStreaming: false,
              expenseData: detectedExpense,
            }
            : msg
        )
      );
    } catch (err: any) {
      setError(err.message || "Falha na comunicação com a IA.");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
              ...msg,
              content: "Desculpe, tive um problema ao analisar. Poderia tentar novamente?",
              isStreaming: false,
            }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Salvar despesa no banco de dados
  const handleSaveExpense = async (msgId: string, expense: ExtractedData) => {
    const user = authStorage.getUser();
    if (!user) return;

    setSavingId(msgId);
    setError(null);

    try {
      const [day, month, year] = expense.expense_date.split("/");
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

      const res = await apiFetch("/expenses/create", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          description: expense.description,
          value: expense.value,
          type: expense.type,
          category: expense.category,
          expense_date: parsedDate.toISOString(),
        }),
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      // Marca o card desta mensagem como salvo
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, saved: true } : m))
      );
    } catch (err: any) {
      setError(err.message || "Erro ao salvar despesa.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between shrink-0 bg-surface/50 backdrop-blur-md">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-2xl bg-surface border border-surface-border flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-white">Gastos.AI Assistant</h1>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 3.5 Flash (SSE)
              </p>
            </div>
          </div>
          <div className="w-10" />
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="m-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Área de Mensagens (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"
                }`}
            >
              {/* Balão de Mensagem */}
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed shadow-sm ${msg.role === "user"
                  ? "bg-brand-500 text-white rounded-br-sm"
                  : "bg-surface border border-surface-border text-slate-200 rounded-bl-sm"
                  }`}
              >
                {/* Se a mensagem do usuário tiver imagem anexada */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-2xl overflow-hidden border border-white/20 max-h-48">
                    <img
                      src={msg.imageUrl}
                      alt="Anexo"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Conteúdo textual */}
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Cursor piscante durante o streaming */}
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-3 ml-1 bg-brand-500 animate-pulse rounded-full" />
                )}
              </div>

              {/* Card de Comprovante Acoplado à Mensagem */}
              {msg.expenseData && (
                <div className="mt-2.5 max-w-[90%] w-full animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 rounded-3xl bg-surface border border-brand-500/30 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5" /> Comprovante Gerado
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {Math.round(msg.expenseData.confidence * 100)}% de Precisão
                      </span>
                    </div>

                    {/* Valor e Descrição */}
                    <div className="text-2xl font-black text-white tracking-tight">
                      R${" "}
                      {msg.expenseData.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs font-semibold text-slate-300 mt-0.5">
                      {msg.expenseData.description}
                    </div>

                    {/* Detalhes rápidos */}
                    <div className="mt-3 pt-2.5 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Tag className="w-3 h-3 text-brand-500" />
                        {msg.expenseData.category}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {msg.expenseData.expense_date}
                      </span>
                    </div>

                    {/* Botão de Ação / Salvo */}
                    <div className="mt-3.5">
                      {msg.saved ? (
                        <div className="w-full py-2.5 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Lançado no Extrato!</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSaveExpense(msg.id, msg.expenseData!)}
                          disabled={savingId === msg.id}
                          className="w-full py-2.5 px-3 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-500/25"
                        >
                          {savingId === msg.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Confirmar e Salvar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Entrada (Input com Câmera e Envio) */}
        <div className="p-3 border-t border-surface-border bg-surface/70 backdrop-blur-lg shrink-0">
          {/* Preview da foto antes de enviar */}
          {previewUrl && (
            <div className="mb-2 relative inline-block rounded-2xl overflow-hidden border border-brand-500/40 bg-black">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-16 h-16 object-cover"
              />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,audio/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Botão de Câmera */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className={`p-3 rounded-2xl border border-surface-border text-slate-400 hover:text-white transition-all ${selectedFile
                ? "bg-brand-500/20 border-brand-500 text-brand-400"
                : "bg-surface hover:bg-surface-elevated"
                }`}
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Input de Texto */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                selectedFile
                  ? "Adicionar instrução (opcional)..."
                  : "Digite ou fale: 'Gastei 45 no almoço'..."
              }
              disabled={isStreaming}
              className="flex-1 py-3 px-4 bg-surface rounded-2xl border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={isStreaming || (!selectedFile && !inputMessage.trim())}
              className="p-3 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white transition-all shadow-md shadow-brand-500/20 active:scale-95"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

        <BottomNav />
      </div>
    </MobileContainer>
  );
}
