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
  Upload,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Tag,
  Calendar,
  Wallet,
  Check,
} from "lucide-react";

interface ExtractedData {
  description: string;
  value: number;
  type: "Receita" | "Despesa";
  category: string;
  expense_date: string;
  confidence: number;
  detected_items?: string[];
}

export default function AiChatPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [promptText, setPromptText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Resultado extraído pela IA aguardando confirmação humana
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // Manipula seleção de foto/arquivo
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

  // Envia imagem/texto para o Gemini extrair
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !promptText.trim()) {
      setError("Anexe uma foto de comprovante ou digite uma despesa.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setExtracted(null);

    try {
      const formData = new FormData();
      if (selectedFile) formData.append("file", selectedFile);
      if (promptText.trim()) formData.append("prompt", promptText.trim());

      const res = await apiFetch<ExtractedData>("/ai/extract", {
        method: "POST",
        body: formData,
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.data) {
        setExtracted(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Erro na análise da IA.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Salva no banco de dados após a aprovação do usuário
  const handleConfirmAndSave = async () => {
    if (!extracted) return;
    const user = authStorage.getUser();
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // Converte DD/MM/YYYY para ISO universal antes de mandar para o banco:
      const [day, month, year] = extracted.expense_date.split("/");
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
      const res = await apiFetch("/expenses/create", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          description: extracted.description,
          value: extracted.value,
          type: extracted.type,
          category: extracted.category,
          expense_date: parsedDate.toISOString(),
        }),
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar no extrato.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col p-5 pb-2">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2 mb-4">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Vision</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Feedback de Erro ou Sucesso */}
        {error && (
          <div className="mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Lançamento salvo com sucesso! Redirecionando...</span>
          </div>
        )}

        {/* Estado 1: Se a IA já extraiu os dados (Revisão Humana) */}
        {/* TODO: Tornar os campos abaixo editáveis (inputs/selects) para permitir que o usuário ajuste valor, descrição, categoria ou data antes de salvar */}
        {extracted ? (
          <div className="my-auto py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Revisão do Comprovante
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {Math.round(extracted.confidence * 100)}% de Confiança
                </span>
              </div>

              {/* Valor em destaque */}
              <div className="text-3xl font-extrabold text-white tracking-tight mb-3">
                R$ {extracted.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>

              {/* Detalhes */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-surface-border/60">
                  <span className="text-slate-500">Estabelecimento</span>
                  <span className="font-semibold text-white">{extracted.description}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-surface-border/60">
                  <span className="text-slate-500">Tipo</span>
                  <span className={`font-semibold ${extracted.type === "Despesa" ? "text-rose-400" : "text-emerald-400"}`}>
                    {extracted.type}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-surface-border/60">
                  <span className="text-slate-500">Categoria</span>
                  <span className="font-semibold text-brand-500 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {extracted.category}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Data</span>
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {extracted.expense_date}
                  </span>
                </div>
              </div>

              {/* Itens detectados */}
              {extracted.detected_items && extracted.detected_items.length > 0 && (
                <div className="mt-4 pt-3 border-t border-surface-border/60">
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1.5">
                    Itens identificados no cupom:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {extracted.detected_items.map((item, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-lg bg-surface-elevated text-slate-400">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setExtracted(null)}
                  className="py-3 px-3 rounded-2xl bg-surface-elevated hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all"
                >
                  Tentar Outro
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  disabled={saving}
                  className="py-3 px-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-brand-500/25"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Estado 2: Formulário de Análise */
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="my-auto">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-500 mx-auto flex items-center justify-center mb-3">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Leitor com IA</h1>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
                  Tire uma foto do cupom, anexe um print de Pix ou descreva seu gasto em texto.
                </p>
              </div>

              {/* Preview da foto se tiver selecionado */}
              {previewUrl && (
                <div className="mb-4 relative rounded-2xl overflow-hidden border border-surface-border bg-black max-h-48 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="max-h-48 object-contain" />
                  <button
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Botão de Upload / Câmera */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,audio/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 px-4 rounded-3xl border-2 border-dashed border-surface-border hover:border-brand-500/50 bg-surface/40 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all group mb-4"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-xs font-semibold">Tirar Foto ou Escolher Comprovante</span>
                  <span className="text-[10px] text-slate-500">Formatos aceitos: JPG, PNG, Áudio</span>
                </button>
              )}
            </div>

            {/* Input de Texto e Botão de Envio */}
            <form onSubmit={handleAnalyze} className="mt-auto pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={selectedFile ? "Instrução opcional para a foto..." : "Ou digite: 'Paguei 35 no almoço hoje'"}
                  className="w-full pl-4 pr-12 py-3.5 bg-surface rounded-2xl border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={analyzing || (!selectedFile && !promptText.trim())}
                  className="absolute right-2 p-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white transition-all shadow-md shadow-brand-500/20"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
